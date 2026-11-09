import {validateDocument} from './core/model.mjs';
import {applyChanges,Conflict} from './core/changes.mjs';
import {votingAPI} from './voting-service.ts';
import {validateViewport} from './core/follow.mjs';
import {readJSONObject as body} from './request-body.ts';
type Identity={id:string,email:string,name:string};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const fault=(status:number,message:string)=>Object.assign(new Error(message),{status});
function identity(request:Request):Identity{
  const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');
  if(!id||!email)throw fault(401,'Sign in to use cloud boards');
  return{id,email:email.toLowerCase(),name:email.split('@')[0]};
}
export async function boardAPI(request:Request,db:D1Database){
  try{
    const user=identity(request),url=new URL(request.url),path=url.pathname.replace(/^\/api\/?/,'').split('/').filter(Boolean),method=request.method;
    const expectedUser=request.headers.get('X-Mirra-User');if(expectedUser&&expectedUser!==user.id)throw fault(401,'Account changed. Reload before continuing. Your device draft is preserved.');
    if(!['GET','HEAD'].includes(method)&&request.headers.get('origin')!==url.origin)throw fault(403,'Cross-origin writes are not allowed');
    if(!['GET','HEAD'].includes(method)){
      const category=path[2]==='presence'?'presence':path[2]==='attention'?'attention':path.length===1?'create':'write',maximum=category==='create'?30:category==='attention'?60:600,bucket=Math.floor(Date.now()/60000);
      const limit=await db.prepare('INSERT INTO api_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(`${user.id}:${category}:${bucket}`,(bucket+2)*60000).first<{count:number}>();
      if(limit&&limit.count>maximum)throw fault(429,'Too many updates. Your draft is preserved; retry shortly.');
    }
    if(path[0]==='me')return json({user});
    const access=async(id:string)=>{const row=await db.prepare('SELECT b.*, m.role AS member_role FROM boards b LEFT JOIN members m ON m.board_id=b.id AND m.email=? WHERE b.id=?').bind(user.email,id).first<any>();if(!row||row.owner_id!==user.id&&!row.member_role)throw fault(404,'Board not found');row.role=row.owner_id===user.id?'owner':row.member_role;return row;};
    const snapshot=(row:any)=>({id:row.id,userId:user.id,doc:JSON.parse(row.document),revision:row.revision,role:row.role||'owner',updatedAt:row.updated_at,serverTime:Date.now()});
    if(path[0]!=='boards')throw fault(404,'Unknown API route');
    if(path.length===1&&method==='GET'){
      const rows=await db.prepare('SELECT b.id,json_extract(b.document,\'$.name\') AS name,b.revision,b.updated_at,b.owner_id,m.role AS member_role FROM boards b LEFT JOIN members m ON m.board_id=b.id AND m.email=? WHERE b.owner_id=? OR m.role IS NOT NULL ORDER BY b.updated_at DESC').bind(user.email,user.id).all<any>();
      return json({boards:rows.results.map(row=>({id:row.id,name:row.name,revision:row.revision,updatedAt:row.updated_at,role:row.owner_id===user.id?'owner':row.member_role}))});
    }
    if(path.length===1&&method==='POST'){
      const input=await body(request);let doc;try{doc=validateDocument(input.doc);}catch{throw fault(400,'Invalid board document');}const id=crypto.randomUUID(),time=Date.now(),serialized=JSON.stringify(doc);
      if(new TextEncoder().encode(serialized).length>1_800_000)throw fault(413,'This board exceeds the current cloud document size limit');
      const operationId=input.operationId===undefined?crypto.randomUUID():input.operationId;
      if(typeof operationId!=='string'||!/^[a-zA-Z0-9-]{10,100}$/.test(operationId))throw fault(400,'Invalid creation operation id');
      const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(serialized)))).map(n=>n.toString(16).padStart(2,'0')).join('');
      const receipt=()=>db.prepare('SELECT digest,board_id FROM board_creations WHERE owner_id=? AND operation_id=?').bind(user.id,operationId).first<{digest:string,board_id:string}>();
      let previous=await receipt();
      if(!previous){
        await db.batch([
          db.prepare('INSERT INTO boards(id,owner_id,document,revision,updated_at,last_operation) SELECT ?,?,?,0,?,NULL WHERE NOT EXISTS(SELECT 1 FROM board_creations WHERE owner_id=? AND operation_id=?)').bind(id,user.id,serialized,time,user.id,operationId),
          db.prepare('INSERT INTO board_creations(owner_id,operation_id,digest,board_id) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM boards WHERE id=? AND owner_id=?)').bind(user.id,operationId,digest,id,id,user.id)
        ]);
        previous=await receipt();
      }
      if(!previous)throw fault(503,'Cloud creation was not confirmed. Retry this request.');
      if(previous.digest!==digest)throw fault(409,'Creation operation id already used for different content');
      const created=previous.board_id===id;return json({...snapshot(await access(previous.board_id)),operationId,created},created?201:200);
    }
    const id=path[1];if(!id)throw fault(404,'Board not found');let row=await access(id);
    if(path[2]==='voting')return await votingAPI(request,db,{user,board:row,tail:path.slice(3),readBody:()=>body(request),access:()=>access(id)});
    const listComments=async()=>({comments:(await db.prepare('SELECT id,parent_id,item_id,author_id,author_name,CASE WHEN deleted_at IS NULL THEN body ELSE \'\' END AS body,x,y,created_at,updated_at,resolved,deleted_at FROM comments WHERE board_id=? ORDER BY created_at,id').bind(id).all()).results,userId:user.id});
    if(path.length===2&&method==='GET')return json(snapshot(row));
    if(path[2]==='comments'){
      if(method==='GET'&&path.length===3)return json(await listComments());
      if(!['owner','editor','commenter'].includes(row.role))throw fault(403,'Comment permission is required');
      const permission='EXISTS(SELECT 1 FROM boards b WHERE b.id=? AND (b.owner_id=? OR EXISTS(SELECT 1 FROM members m WHERE m.board_id=b.id AND m.email=? AND m.role IN (\'editor\',\'commenter\'))))';
      const write=async(statement:D1PreparedStatement,onMiss?:()=>Promise<void>)=>{const result=await db.batch([statement,db.prepare(`UPDATE boards SET activity_revision=activity_revision+1 WHERE id=? AND ${permission}`).bind(id,id,user.id,user.email)]);if(!result[0].meta.changes){const current=await access(id);if(!['owner','editor','commenter'].includes(current.role))throw fault(403,'Comment access was revoked');if(onMiss)await onMiss();else throw fault(403,'Comment access was revoked');}};
      if(method==='POST'&&path.length===3){
        const input=await body(request);if(typeof input.id!=='string'||!/^[a-zA-Z0-9-]{10,100}$/.test(input.id)||typeof input.text!=='string'||!input.text.trim()||input.text.length>10000||!Number.isFinite(input.x)||!Number.isFinite(input.y)||Math.abs(input.x)>1e7||Math.abs(input.y)>1e7)throw fault(400,'Invalid comment');
        if(input.parentId){const parent=await db.prepare('SELECT id FROM comments WHERE id=? AND board_id=? AND parent_id IS NULL AND deleted_at IS NULL').bind(input.parentId,id).first();if(!parent)throw fault(400,'Comment thread is missing');}
        if(input.itemId&&!JSON.parse(row.document).items.some((item:any)=>item.id===input.itemId))throw fault(400,'Comment anchor is missing');
        const previous=await db.prepare('SELECT author_id,body FROM comments WHERE id=? AND board_id=?').bind(input.id,id).first<any>();if(previous){if(previous.author_id!==user.id||previous.body!==input.text.trim())throw fault(409,'Comment id already used');return json(await listComments());}
        const time=Date.now();await write(db.prepare(`INSERT INTO comments(id,board_id,parent_id,item_id,author_id,author_name,body,x,y,created_at,updated_at,resolved,deleted_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,0,NULL WHERE ${permission}`).bind(input.id,id,input.parentId||null,input.itemId||null,user.id,user.name,input.text.trim(),input.x,input.y,time,time,id,user.id,user.email));return json(await listComments(),201);
      }
      const comment=await db.prepare('SELECT * FROM comments WHERE id=? AND board_id=?').bind(path[3]||'',id).first<any>();if(!comment)throw fault(404,'Comment not found');
      if(method==='POST'&&path[4]==='resolve'){
        const input=await body(request);if(comment.parent_id||typeof input.resolved!=='boolean')throw fault(400,'Resolve a root thread');
        await write(db.prepare(`UPDATE comments SET resolved=?,updated_at=? WHERE id=? AND board_id=? AND ${permission}`).bind(Number(input.resolved),Date.now(),comment.id,id,id,user.id,user.email));return json(await listComments());
      }
      if(method==='PATCH'&&path.length===4){
        const input=await body(request);if(comment.author_id!==user.id)throw fault(403,'Only the author can edit a comment');if(typeof input.text!=='string'||!input.text.trim()||input.text.length>10000)throw fault(400,'Invalid comment text');
        if(comment.deleted_at)throw fault(410,'This comment was removed. Copy your draft before closing.');
        if(typeof input.beforeText!=='string'||input.beforeText.length>10000)throw fault(400,'Reload the app before editing this comment. Your device draft is preserved.');
        const text=input.text.trim();if(comment.body===text)return json(await listComments());
        if(comment.body!==input.beforeText)throw fault(409,'This comment changed in another client. Copy your draft or load the latest comment.');
        await write(db.prepare(`UPDATE comments SET body=?,updated_at=? WHERE id=? AND board_id=? AND deleted_at IS NULL AND body=? AND ${permission}`).bind(text,Date.now(),comment.id,id,input.beforeText,id,user.id,user.email),async()=>{
          const latest=await db.prepare('SELECT body,deleted_at FROM comments WHERE id=? AND board_id=?').bind(comment.id,id).first<any>();
          if(!latest||latest.deleted_at)throw fault(410,'This comment was removed. Copy your draft before closing.');
          if(latest.body!==text)throw fault(409,'This comment changed in another client. Copy your draft or load the latest comment.');
        });return json(await listComments());
      }
      if(method==='DELETE'&&path.length===4){
        if(comment.author_id!==user.id&&row.role!=='owner')throw fault(403,'Only the author or board owner can remove a comment');await write(db.prepare(`UPDATE comments SET deleted_at=?,updated_at=? WHERE id=? AND board_id=? AND ${permission}`).bind(Date.now(),Date.now(),comment.id,id,id,user.id,user.email));return json(await listComments());
      }
      throw fault(405,'Unsupported comment action');
    }
    if(path[2]==='members'){
      if(row.role!=='owner')throw fault(403,'Only the owner can manage members');
      if(method==='GET')return json({members:(await db.prepare('SELECT email,role FROM members WHERE board_id=?').bind(id).all()).results});
      const input=await body(request);if(typeof input.email!=='string'||!/^\S+@\S+\.\S+$/.test(input.email)||input.email.length>254)throw fault(400,'Enter a valid email');
      if(method==='POST'){if(!['editor','commenter','viewer'].includes(input.role))throw fault(400,'Invalid member role');await db.prepare('INSERT INTO members(board_id,email,role) VALUES(?,?,?) ON CONFLICT(board_id,email) DO UPDATE SET role=excluded.role').bind(id,input.email.toLowerCase(),input.role).run();return json({ok:true});}
      if(method==='DELETE'){await db.prepare('DELETE FROM members WHERE board_id=? AND email=?').bind(id,input.email.toLowerCase()).run();return json({ok:true});}
    }
    if(path[2]==='changes'&&method==='POST'){
      if(!['owner','editor'].includes(row.role))throw fault(403,'This board is read-only');const input=await body(request);
      if(typeof input.operationId!=='string'||!/^[a-zA-Z0-9-]{10,100}$/.test(input.operationId))throw fault(400,'Invalid operation id');
      const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(input.changes))))).map(n=>n.toString(16).padStart(2,'0')).join('');
      for(let attempt=0;attempt<5;attempt++){
        const previous=await db.prepare('SELECT digest FROM mutations WHERE board_id=? AND operation_id=?').bind(id,input.operationId).first<any>();
        if(previous){if(previous.digest!==digest)throw fault(409,'Operation id already used for a different change');return json(snapshot(await access(id)));}
        row=await access(id);if(!['owner','editor'].includes(row.role))throw fault(403,'Editing permission was revoked');
        let doc;try{doc=applyChanges(JSON.parse(row.document),input.changes);}catch(error){if(error instanceof Conflict)return json({error:error.message,conflicts:error.conflicts,snapshot:snapshot(row)},409);throw fault(400,error instanceof Error?error.message:'Invalid change');}
        if(new TextEncoder().encode(JSON.stringify(doc)).length>1_800_000)throw fault(413,'This board exceeds the current cloud document size limit');
        const time=Date.now(),result=await db.batch([
          db.prepare('UPDATE boards SET document=?,revision=revision+1,updated_at=?,last_operation=? WHERE id=? AND revision=? AND (owner_id=? OR EXISTS(SELECT 1 FROM members WHERE board_id=boards.id AND email=? AND role=\'editor\'))').bind(JSON.stringify(doc),time,input.operationId,id,row.revision,user.id,user.email),
          db.prepare('INSERT OR IGNORE INTO mutations(board_id,operation_id,digest) SELECT id,?,? FROM boards WHERE id=? AND last_operation=?').bind(input.operationId,digest,id,input.operationId)
        ]);
        if(result[0].meta.changes)return json(snapshot({...row,document:JSON.stringify(doc),revision:row.revision+1,updated_at:time}));
      }throw fault(409,'Board is busy. Retry your update.');
    }
    if(path[2]==='attention'&&method==='POST'){
      if(!['owner','editor'].includes(row.role))throw fault(403,'Editing permission is required to bring collaborators');
      const input=await body(request),validId=(value:unknown)=>typeof value==='string'&&/^[a-zA-Z0-9-]{10,100}$/.test(value);
      if(!input||typeof input!=='object'||Array.isArray(input))throw fault(400,'Invalid attention request');
      if(!validId(input.clientId)||input.target!=='all'&&!validId(input.target)||input.target===input.clientId)throw fault(400,'Invalid attention target');
      const now=Date.now(),cutoff=now-25000,attentionId=crypto.randomUUID();
      const result=await db.prepare(`UPDATE presence SET attention_id=?,attention_from=?,attention_at=?
        WHERE board_id=? AND client_id<>? AND seen_at>? AND (?='all' OR client_id=?)
        AND EXISTS(SELECT 1 FROM presence sender WHERE sender.board_id=? AND sender.client_id=? AND sender.user_id=? AND sender.seen_at>? AND sender.viewport IS NOT NULL)
        AND EXISTS(SELECT 1 FROM boards b WHERE b.id=? AND (b.owner_id=? OR EXISTS(SELECT 1 FROM members m WHERE m.board_id=b.id AND m.email=? AND m.role='editor')))`)
        .bind(attentionId,input.clientId,now,id,input.clientId,cutoff,input.target,input.target,id,input.clientId,user.id,cutoff,id,user.id,user.email).run();
      if(!result.meta.changes){const latest=await access(id);if(!['owner','editor'].includes(latest.role))throw fault(403,'Editing permission is required to bring collaborators');throw fault(409,'No active collaborators could be brought to your view.');}
      return json({userId:user.id,boardId:id,attentionId,count:result.meta.changes});
    }
    if(path[2]==='presence'&&method==='POST'){
      const input=await body(request);if(typeof input.clientId!=='string'||!/^[a-zA-Z0-9-]{10,100}$/.test(input.clientId))throw fault(400,'Invalid client id');
      if(input.leaving===true){await db.prepare('DELETE FROM presence WHERE board_id=? AND client_id=? AND user_id=?').bind(id,input.clientId,user.id).run();return json({ok:true});}
      const x=Number.isFinite(input.x)?Math.max(-1e7,Math.min(1e7,input.x)):null,y=Number.isFinite(input.y)?Math.max(-1e7,Math.min(1e7,input.y)):null;
      let viewport:string|null=null;try{if(input.viewport!=null)viewport=JSON.stringify(validateViewport(input.viewport));}catch{throw fault(400,'Invalid shared viewport');}
      const following=input.followingClientId??null;
      if(following!==null&&(typeof following!=='string'||!/^[a-zA-Z0-9-]{10,100}$/.test(following)||following===input.clientId||viewport===null))throw fault(400,'Invalid follow target');
      const now=Date.now(),cutoff=now-25000;
      const result=await db.batch([db.prepare(`WITH RECURSIVE chain(client_id,next_id) AS (
        SELECT client_id,following_client_id FROM presence WHERE board_id=? AND client_id=? AND seen_at>? AND viewport IS NOT NULL
        UNION SELECT p.client_id,p.following_client_id FROM presence p JOIN chain c ON p.client_id=c.next_id WHERE p.board_id=? AND p.seen_at>? AND p.viewport IS NOT NULL
      ) INSERT INTO presence(board_id,client_id,user_id,name,x,y,viewport,following_client_id,seen_at)
      SELECT ?,?,?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM boards b WHERE b.id=? AND (b.owner_id=? OR EXISTS(SELECT 1 FROM members m WHERE m.board_id=b.id AND m.email=?)))
      AND (? IS NULL OR (EXISTS(SELECT 1 FROM chain WHERE next_id IS NULL) AND NOT EXISTS(SELECT 1 FROM chain WHERE client_id=?)))
      ON CONFLICT(board_id,client_id) DO UPDATE SET x=excluded.x,y=excluded.y,viewport=excluded.viewport,following_client_id=excluded.following_client_id,seen_at=excluded.seen_at WHERE presence.user_id=excluded.user_id`)
      .bind(id,following,cutoff,id,cutoff,id,input.clientId,user.id,user.name,x,y,viewport,following,now,id,user.id,user.email,following,input.clientId),db.prepare('DELETE FROM presence WHERE seen_at<?').bind(now-60000)]);
      if(!result[0].meta.changes){await access(id);throw fault(409,'Collaborator view is unavailable. Refresh and try again.');}return json({ok:true});
    }
    if(path[2]==='events'&&method==='GET'){
      const eventClientId=url.searchParams.get('clientId');if(eventClientId&&!/^[a-zA-Z0-9-]{10,100}$/.test(eventClientId))throw fault(400,'Invalid event client id');
      let cancelled=false,timer:ReturnType<typeof setTimeout>|null=null;const encoder=new TextEncoder();let revision=Number(url.searchParams.get('revision')||-1),role=row.role,activityRevision=-1,ticks=0,votingDeadline:number|null=null;
      const stream=new ReadableStream({start(controller){
        const poll=async()=>{if(cancelled)return;try{const latest=await access(id),roleChanged=latest.role!==role;if(latest.revision!==revision||roleChanged){revision=latest.revision;role=latest.role;controller.enqueue(encoder.encode(`event: board\ndata: ${JSON.stringify(snapshot(latest))}\n\n`));}
          const people=await db.prepare('SELECT client_id,name,x,y,viewport,following_client_id FROM presence WHERE board_id=? AND seen_at>?').bind(id,Date.now()-25000).all<any>();
          const sharedPeople=people.results.map(person=>{let viewport=null;try{viewport=validateViewport(JSON.parse(person.viewport));}catch{}return{client_id:person.client_id,name:person.name,x:person.x,y:person.y,viewport,followingClientId:person.following_client_id};});
          controller.enqueue(encoder.encode(`event: presence\ndata: ${JSON.stringify(sharedPeople)}\n\n`));
          if(eventClientId){const attention=await db.prepare(`SELECT p.attention_id,p.attention_from,p.attention_at FROM presence p JOIN presence sender ON sender.board_id=p.board_id AND sender.client_id=p.attention_from WHERE p.board_id=? AND p.client_id=? AND p.user_id=? AND p.attention_at>? AND sender.seen_at>? AND sender.viewport IS NOT NULL`).bind(id,eventClientId,user.id,Date.now()-15000,Date.now()-25000).first<any>();
            if(attention)controller.enqueue(encoder.encode(`event: attention\ndata: ${JSON.stringify({userId:user.id,boardId:id,clientId:eventClientId,id:attention.attention_id,from:attention.attention_from,createdAt:attention.attention_at,serverTime:Date.now()})}\n\n`));}
          const activityChanged=latest.activity_revision!==activityRevision;
          if(activityChanged){activityRevision=latest.activity_revision;controller.enqueue(encoder.encode(`event: comments\ndata: ${JSON.stringify(await listComments())}\n\n`));}
          if(activityChanged||roleChanged){const active=await db.prepare("SELECT ends_at FROM voting_sessions WHERE board_id=? AND status='active' LIMIT 1").bind(id).first<{ends_at:number}>();votingDeadline=active?.ends_at??null;}
          const votingNow=Date.now();if(activityChanged||roleChanged||votingDeadline!==null&&votingNow>=votingDeadline){controller.enqueue(encoder.encode(`event: voting\ndata: ${JSON.stringify({userId:user.id,boardId:id,serverTime:votingNow})}\n\n`));if(votingDeadline!==null&&votingNow>=votingDeadline)votingDeadline=null;}
          if(++ticks>=12){controller.enqueue(encoder.encode(`event: renew\ndata: ${JSON.stringify({userId:user.id,boardId:id})}\n\n`));cancelled=true;controller.close();return;}timer=setTimeout(poll,1000);
        }catch(error){cancelled=true;try{if([403,404].includes((error as {status?:number}).status||0))controller.enqueue(encoder.encode('event: revoked\ndata: {}\n\n'));controller.close();}catch{}}};void poll();
      },cancel(){cancelled=true;if(timer)clearTimeout(timer);}});
      return new Response(stream,{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','X-Accel-Buffering':'no'}});
    }
    throw fault(405,'Unsupported operation');
  }catch(error){const err=error as Error&{status?:number};return json({error:err.status?err.message:'Cloud request failed'},err.status||500);}
}
