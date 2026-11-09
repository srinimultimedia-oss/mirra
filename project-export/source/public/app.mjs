import {selectionColor,applySelectionColor} from '/public/selection-color.mjs';
import {mountFramePresets} from '/public/frame-presets.mjs';
import {mountFrameSequence} from '/public/frame-sequence.mjs';
import {mountTimerPanel,updateTimerPanel,formatTimer} from '/public/timer-view.mjs';
import {mountVotingPanel} from '/public/voting-view.mjs';
import {mountTagPanel} from '/public/tag-panel.mjs';
import {mountMinimap} from '/public/minimap-view.mjs';
import {mountCellPaste} from '/public/cell-paste.mjs';
import {mountCloudBackups} from '/public/cloud-backups.mjs';
import {mountBulkNotes} from '/public/bulk-notes.mjs';
import {mountFollow} from '/public/follow-view.mjs';
import {SaveStatus,deviceSaveStatus} from '/src/save-status.mjs';
import {spreadsheetHint} from '/src/spreadsheet-paste.mjs';
import {timerRemaining} from '/src/timer.mjs';
import {SharedClock} from '/src/clock.mjs';
import {TimerAudio} from '/public/timer-audio.mjs';
import {TimerCompletion} from '/public/timer-completion.mjs';
import {marqueeSelection} from '/src/selection.mjs';
import {connectorLabelStyle} from '/public/connector-label.mjs';
import {frameTitleStyle} from '/public/frame-title.mjs';
import {InspectorRecovery,rebaseInspector} from '/public/inspector-recovery.mjs';
import {svgExportBox} from '/public/svg-bounds.mjs';
import {BoardTitleEditor} from '/public/board-title.mjs';
import {prepareBoardImport} from '/public/board-import.mjs';
import {numericProps,booleanProps,valueProps,applyInspector,inspectorDisplayed} from '/public/inspector.mjs';
import {ObjectTextEditor} from '/public/object-editor.mjs';
import {presentationFrame,presentationKey} from '/public/presentation.mjs';
import {Board,bounds,reconcileFrames} from '/src/model.mjs';
import {LocalLibrary,LIBRARY_KEY} from '/src/library.mjs';
import {SHAPES,shapeGeometry,connectorGeometry,resolveEndpoint,translateFreeEndpoints,localDelta,resizedOrigin} from '/src/geometry.mjs';
import {autoFontSize} from '/src/typography.mjs';
import {CloudSession,cloudRequest as rawCloudRequest} from '/src/cloud-client.mjs';
import {HistoryNavigation} from '/src/navigation.mjs';
import {saveCloudDraft,readCloudDraft,readLegacyCloudDraft,listCloudDrafts} from '/src/drafts.mjs';
import {prepareCloudUpload} from '/src/uploads.mjs';
import {claimCommentClient} from '/src/comment-client.mjs';
import {tableDraftKey,listTableDrafts} from '/src/table-drafts.mjs';
import {commentDraftKey as scopedCommentDraftKey,readCommentDraft,saveCommentDraft} from '/src/comment-drafts.mjs';
import {changesBetween,applyChanges,equal} from '/src/changes.mjs';
import {newTable,displayCell} from '/src/tables.mjs';
import {TableEditor,tablePreview} from '/public/table-editor.mjs';
import {decorateIcons} from '/public/icons.mjs';
const $=id=>document.getElementById(id), ns='http://www.w3.org/2000/svg';
let board, library, storageError=false, saveBlocked=false;
try { library=new LocalLibrary(localStorage);board=library.state.activeId?new Board(library.get().doc):new Board(); } catch { board=new Board(); storageError=true;saveBlocked=true; }
let selected=[], tool='select', camera={x:100,y:100,z:1}, gesture=null, connectFrom=null, presentation=-1, presentationId=null, presentationGeometry=null;
let creationShape='rectangle',stickyFill='#f6e49b',stickySize={w:180,h:180},lastPointer=null;
let creationFrameSize={w:650,h:430};
let frameSequenceSignature='';
let timerPanelSignature='';
let votingPanel=null;
let tagPanel=null;
let cloudSession=null,deferredCloud=null,cursorSentAt=0,cloudPeople=[],lastObjectPress=null;
let cloudUploadInProgress=false,memberMutationInProgress=false,cloudDialogGeneration=0;
let cloudUser=null;
let cloudComments={comments:[],userId:null},currentPanel=null,commentContext=null,showResolved=false;
let commentClientId;try{commentClientId=(await claimCommentClient(sessionStorage,localStorage,navigator.locks)).clientId;}catch(error){commentClientId=crypto.randomUUID();try{sessionStorage.setItem('mirra.comment.client',commentClientId);}catch{}queueMicrotask(()=>toast('Comment recovery unavailable: '+error.message+' Copy unsent text before reloading.'));}
let tableEditor=null;const tableDraftCache=new Map();
const writable=()=>!cloudSession||cloudSession.canEdit;
const canComment=()=>cloudSession&&!cloudSession.closed&&['owner','editor','commenter'].includes(cloudSession.base.role)&&!cloudSession.conflict;
function requireWritable(){if(!writable())throw Error('This cloud board is read-only. Copy your changes before closing.');}
function allowMutation(){if(writable())return true;toast('This cloud board is read-only.');return false;}
async function cloudRequest(path,options={}){
  if(path==='me')return rawCloudRequest(path,options);
  const session=cloudSession,expected=options.userId||session?.base.userId||cloudUser?.id;
  try{
    const data=await rawCloudRequest(path,{...options,userId:expected});
    if(session&&session!==cloudSession)throw Error('The active board changed while this request completed.');
    if(expected&&data.userId&&data.userId!==expected)throw Object.assign(Error('Account changed. Reload before continuing.'),{status:401});
    return data;
  }catch(error){if(error.status===401&&session&&session===cloudSession&&session.base.userId===expected){session.conflict=error;session.close();session.onStatus(error.message);}throw error;}
}
const FONTS={sans:'system-ui, sans-serif',serif:'Georgia, serif',mono:'monospace'};
const measureContext=document.createElement('canvas').getContext('2d');
const canvas=$('canvas'), scene=$('scene');
const deviceStatusSource={},saveStatus=new SaveStatus(message=>{$('save').textContent=$('save').title=message;});
function bindDeviceSaveStatus(){saveStatus.select(deviceStatusSource,deviceSaveStatus({storageError,blocked:saveBlocked,hasSavedBoard:!!library?.state.activeId}));}
bindDeviceSaveStatus();
const boardChromeObserver=new ResizeObserver(()=>{const style=document.documentElement.style;style.setProperty('--boardbar-bottom',document.querySelector('.boardbar').getBoundingClientRect().bottom+'px');style.setProperty('--board-footer-space',Math.max(80,innerHeight-document.querySelector('.zoom').getBoundingClientRect().top+8)+'px');});
boardChromeObserver.observe(document.querySelector('.boardbar'));boardChromeObserver.observe(document.querySelector('.zoom'));
const ACCENT=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#4055df';decorateIcons();
const tagTheme=getComputedStyle(document.documentElement),tagBadgeHeight=Number(tagTheme.getPropertyValue('--tag-badge-height')),tagBadgeFont=Number(tagTheme.getPropertyValue('--tag-badge-font')),tagBadgePadding=Number(tagTheme.getPropertyValue('--tag-badge-padding'));
const localTimerClock=new SharedClock();localTimerClock.synchronize(Date.now());
const timerAudio=new TimerAudio();
const timerCompletion=new TimerCompletion();
const timerButton=document.createElement('button');timerButton.id='timer';timerButton.textContent='Timer';timerButton.onclick=()=>panel('timer');$('present').before(timerButton);
const votingButton=document.createElement('button');votingButton.id='voting';votingButton.textContent='Voting';votingButton.onclick=()=>panel('voting');timerButton.after(votingButton);
const presentationTimer=document.createElement('p');presentationTimer.id='presentationtimer';presentationTimer.hidden=true;presentationTimer.setAttribute('role','timer');presentationTimer.setAttribute('aria-live','off');$('workspace').append(presentationTimer);
setInterval(()=>updateTimerView(),250);
const openTableButton=document.createElement('button');openTableButton.id='open-table';openTableButton.textContent='Open table';openTableButton.hidden=true;openTableButton.onclick=()=>{const item=board.doc.items.find(i=>selected.includes(i.id)&&i.type==='table');if(item)openTable(item.id);};$('selectionbar').insertBefore(openTableButton,$('inspect'));
const tagsButton=document.createElement('button');tagsButton.id='tags';tagsButton.textContent='Tags';tagsButton.onclick=()=>panel('tags');$('selectionbar').insertBefore(tagsButton,$('inspect'));
const stickyShapeButton=document.createElement('button');stickyShapeButton.id='sticky-shape';stickyShapeButton.textContent='Sticky shape';stickyShapeButton.onclick=()=>{panel('sticky-shape');($('panelbody').querySelector('[data-sticky-shape]:not(:disabled)')||$('closepanel')).focus();};$('selectionbar').insertBefore(stickyShapeButton,tagsButton);
function updateStickyShapes(){const items=board.doc.items.filter(item=>selected.includes(item.id)),hasNotes=items.some(item=>item.type==='sticky');stickyShapeButton.hidden=!hasNotes;stickyShapeButton.disabled=!writable()||!['square','wide'].some(shape=>board.canSetStickyShape(selected,shape));document.querySelectorAll('[data-sticky-shape]').forEach(button=>{const shape=button.dataset.stickyShape,ratio=shape==='wide'?12/7:1;button.disabled=!writable()||!board.canSetStickyShape(selected,shape);button.setAttribute('aria-pressed',String(items.length>0&&items.every(item=>item.type==='sticky'&&Math.abs(item.w/item.h-ratio)<1e-8&&(!item.shape||item.shape==='rectangle'))));});}
function stickyShapeControls(body,button){const heading=document.createElement('h3');heading.textContent='Sticky shape';body.append(heading);for(const[shape,label]of [['square','Square notes'],['wide','Wide notes']]){const control=button(label,()=>{if(!allowMutation())return;try{board.setStickyShape(selected,shape);changed();if(control.disabled)($('panelbody').querySelector('[data-sticky-shape]:not(:disabled)')||$('closepanel')).focus();}catch(error){toast(error.message);}},{mutation:true});control.dataset.stickyShape=shape;}const note=document.createElement('p');note.textContent='Selected notes keep their height, center, text and tags. All selected notes must be unlocked.';body.append(note);updateStickyShapes();}
const backupNotice=document.createElement('button');backupNotice.id='backupnotice';backupNotice.textContent='Device backup unavailable';backupNotice.className='formerror';backupNotice.hidden=true;backupNotice.onclick=()=>showCloud();$('cloud').after(backupNotice);
const backupRecovery=document.createElement('section');backupRecovery.id='backuprecovery';backupRecovery.className='backup-recovery';backupRecovery.hidden=true;const backupHeading=document.createElement('h3');backupHeading.textContent='Keep a backup';const backupWarning=document.createElement('p');backupWarning.setAttribute('role','alert');backupWarning.textContent='Cloud saving can continue, but a backup could not be stored in this browser. Unsaved edits remain only in this tab. Export before reloading or closing.';const backupActions=document.createElement('div');backupActions.className='dialogbuttons';const retryBackup=document.createElement('button');retryBackup.textContent='Retry device backup';retryBackup.onclick=()=>{const saved=cloudSession?.retryDeviceBackup();toast(saved?'Device backup saved.':'Device backup is still unavailable. Export to keep a copy.');render();};const exportBackup=document.createElement('button');exportBackup.textContent='Export current board';exportBackup.onclick=()=>{$('clouddialog').close();$('share').click();};backupActions.append(retryBackup,exportBackup);backupRecovery.append(backupHeading,backupWarning,backupActions);$('cloudboards').before(backupRecovery);
retryBackup.addEventListener('click',()=>{if(backupRecovery.hidden)$('closecloud').focus();});
const clearContentButton=document.createElement('button');clearContentButton.id='clear-content';clearContentButton.textContent='Clear content';clearContentButton.title='Clear selected sticky, shape and card content (Ctrl / Cmd Backspace)';clearContentButton.onclick=clearSelectedContent;$('selectionbar').insertBefore(clearContentButton,$('delete'));
function clearSelectedContent(){if(!allowMutation())return;if(board.clearContent(selected)){changed();toast('Content cleared. Undo restores it.');}else toast('Select unlocked sticky notes, shapes or cards with content.');canvas.focus();}
canvas.addEventListener('contextmenu',event=>{if(presentation>=0)return;event.preventDefault();const id=event.target.closest('[data-id]')?.dataset.id;if(id&&!selected.includes(id))selected=board.selection([id]);render();panel('selection-actions');const clear=$('clear-content-menu');(clear&&!clear.disabled?clear:$('panelbody').querySelector('button:not(:disabled)')||$('closepanel')).focus();});
const follow=mountFollow({button:$('people'),workspace:$('workspace'),canvas,getState:()=>({session:cloudSession,people:cloudPeople,camera,presenting:presentation>=0}),onCamera:next=>{camera=next;},onChange:()=>cloudSession?.viewportChanged()});
const minimap=mountMinimap(document.querySelector('.zoom'),{getState:()=>({items:board.doc.items,camera,viewport:{width:canvas.clientWidth,height:canvas.clientHeight},scope:currentInspectorScope(),visible:!$('workspace').hidden&&presentation<0,busy:!!gesture}),onCamera:next=>{follow.stop();camera=next;render();},onFit:()=>fit()});
const cellPaste=mountCellPaste({getContext:()=>({board,scope:currentInspectorScope(),cloud:!!cloudSession}),assertWritable:requireWritable,canEdit:writable,onApply:result=>{board.replace(result.doc);selected=result.ids;changed();setTool('select');fit(selected.map(id=>board.doc.items.find(item=>item.id===id)));},onClose:()=>canvas.focus()});
const bulkNotes=mountBulkNotes({dialog:$('bulkdialog'),getContext:()=>({board,scope:currentInspectorScope(),cloud:!!cloudSession}),assertWritable:requireWritable,canEdit:writable,onApply:result=>{board.replace(result.doc);selected=result.ids;changed();setTool('select');$('panel').hidden=true;fit(selected.map(id=>board.doc.items.find(item=>item.id===id)));},onClose:()=>canvas.focus(),onScopeChange:()=>toast('Unsubmitted notes stayed with their original board in this tab.')});
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').hidden=true,3500);}
function persist(){if(cloudSession){if(!writable()){if(equal(board.doc,cloudSession.base.doc))return true;saveStatus.update(saveStatus.source,'This cloud board is read-only. Export your draft to keep it.');return false;}try{cloudSession.setDocument(board.doc);return true;}catch(error){saveStatus.update(saveStatus.source,error.message);return false;}}if(saveBlocked){saveStatus.update(deviceStatusSource,'Not saved — export to keep changes');return false;}try{library.save(board.doc);saveStatus.update(deviceStatusSource,'Saved on this device');return true;}catch(error){saveStatus.update(deviceStatusSource,'Save failed — export your board');toast(error.message);return false;}}
function world(event){const r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left-camera.x)/camera.z,y:(event.clientY-r.top-camera.y)/camera.z};}
function el(tag,attrs={}){const node=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))node.setAttribute(k,v);return node;}
function fontSize(item){if(!item.autoFont)return item.fontSize||(item.type==='text'?22:17);return autoFontSize(item.text,item.w-28,item.h-28-(item.type==='sticky'&&item.tagIds?.length?tagBadgeHeight:0),(text,size)=>{measureContext.font=`${item.bold?'bold ':''}${item.italic?'italic ':''}${size}px ${FONTS[item.fontFamily||'sans']}`;return measureContext.measureText(text).width;});}
function textContent(group,item){const tagged=item.type==='sticky'&&item.tagIds?.length,f=el('foreignObject',{x:0,y:0,width:item.w,height:Math.max(1,item.h-(tagged?tagBadgeHeight:0))});const div=document.createElement('div');div.className='itemtext';const content=document.createElement('span');content.textContent=item.text;content.style.width='100%';content.style.textAlign=item.textAlign||(item.type==='text'?'left':'center');Object.assign(div.style,{fontSize:`${fontSize(item)}px`,fontFamily:FONTS[item.fontFamily||'sans'],fontWeight:item.bold?'700':'400',fontStyle:item.italic?'italic':'normal',textDecoration:item.underline?'underline':'none',color:item.textColor||'#22372f'});div.append(content);f.append(div);group.append(f);
 if(tagged){const names=item.tagIds.map(id=>board.doc.tags.find(tag=>tag.id===id).name),height=Math.min(item.h,tagBadgeHeight),badge=el('foreignObject',{x:0,y:item.h-height,width:item.w,height,class:'tag-badges'}),label=document.createElement('div');label.textContent=names.join(' · ');label.title='Tags: '+names.join(', ');label.setAttribute('aria-label',label.title);Object.assign(label.style,{fontFamily:FONTS.sans,fontSize:tagBadgeFont+'px',color:tagTheme.getPropertyValue('--text').trim(),padding:'0 '+tagBadgePadding+'px',lineHeight:height+'px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',boxSizing:'border-box',height:'100%',background:tagTheme.getPropertyValue('--surface').trim()});badge.append(label);group.append(badge);}
}
function render(){
  if(!$('workspace').hidden)document.title=board.doc.name+(cloudSession?' · Mirra Cloud':' · Mirra');
  follow.refresh();cloudSession?.viewportChanged();
  const backupUnavailable=!!cloudSession?.deviceBackupError;backupNotice.hidden=backupRecovery.hidden=!backupUnavailable;retryBackup.disabled=!cloudSession||cloudSession.closed||!['owner','editor'].includes(cloudSession.base.role);
  if(presentation>=0){const current=presentationFrame(board.doc.items,{id:presentationId,index:presentation});if(!current){presentation=-1;presentationId=null;presentationGeometry=null;document.body.classList.remove('presenting');$('presentation').hidden=true;$('present').focus();}else{presentation=current.index;presentationId=current.id;$('framename').textContent=`${current.index+1} / ${current.count} · ${current.frame.text}`;const geometry=JSON.stringify([current.id,current.frame.x,current.frame.y,current.frame.w,current.frame.h,innerWidth,innerHeight]);if(geometry!==presentationGeometry){presentationGeometry=geometry;fitCamera([current.frame]);}}}
  scene.replaceChildren();scene.setAttribute('transform',`translate(${camera.x} ${camera.y}) scale(${camera.z})`);
  $('dots').setAttribute('patternTransform',`translate(${camera.x} ${camera.y}) scale(${camera.z})`);
  const frames=board.doc.items.filter(i=>i.type==='frame').sort((a,b)=>b.w*b.h-a.w*a.h);
  for(const item of [...frames,...board.doc.items.filter(i=>i.type!=='frame')]){
    const selectionVisible=presentation<0&&selected.includes(item.id);
    let lockPosition={x:4,y:15};
    const group=el('g',{'data-id':item.id,'data-type':item.type,class:`object ${selectionVisible?'selected':''}`,transform:`translate(${item.x} ${item.y}) rotate(${item.rotation||0} ${item.w/2} ${item.h/2})`,opacity:item.opacity??1});
    group.style.setProperty('--item-stroke',selectionVisible?ACCENT:item.stroke||'#a5b8ae');group.style.setProperty('--item-stroke-width',selectionVisible?'2':String(item.strokeWidth??1));
    const dash=item.lineStyle==='dashed'?'10 6':item.lineStyle==='dotted'?'2 5':'none';
    if(item.type==='connector'){
      const from=resolveEndpoint(board.doc.items,item.from),to=resolveEndpoint(board.doc.items,item.to);
      group.setAttribute('transform','');const geometry=connectorGeometry(from,to,item.route),arrow=item.arrow||'end';
      lockPosition={x:geometry.mid.x+8,y:geometry.mid.y+18};
      group.append(el('path',{d:geometry.path,fill:'none',stroke:'transparent','stroke-width':16}),el('path',{d:geometry.path,fill:'none',stroke:selectionVisible?'#176b50':item.stroke||item.fill,'stroke-width':item.strokeWidth??2,'stroke-dasharray':dash,'marker-end':arrow==='none'?'none':'url(#arrow)','marker-start':arrow==='both'?'url(#arrow)':'none'}));
      if(item.text){const label=el('text',{x:geometry.mid.x,y:geometry.mid.y-8,stroke:'#ffffff','paint-order':'stroke','stroke-linejoin':'round'});Object.assign(label.style,connectorLabelStyle(item,geometry,(text,size,font)=>{measureContext.font=`${font.fontStyle} ${font.fontWeight} ${size}px ${font.fontFamily}`;return measureContext.measureText(text).width;}));label.textContent=item.text;group.append(label);}
    }else if(item.type==='pen'){
      const d=item.points.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' ');group.append(el('path',{d,fill:'none',stroke:item.stroke||item.fill,'stroke-width':item.strokeWidth??3,'stroke-dasharray':dash,'stroke-linecap':'round','stroke-linejoin':'round'}));
    }else if(item.type==='table'){
      group.append(el('rect',{width:item.w,height:item.h,fill:item.fill,rx:10,'stroke-dasharray':dash}));const content=el('foreignObject',{width:item.w,height:item.h,x:0,y:0});content.append(tablePreview(item,(text,size,font)=>{measureContext.font=`${font.fontStyle} ${font.fontWeight} ${size}px ${font.fontFamily}`;return measureContext.measureText(text).width;}));group.append(content);
    }else if(item.type==='frame'){
      group.append(el('rect',{width:item.w,height:item.h,fill:item.fill,'fill-opacity':.25,rx:4,'stroke-dasharray':dash}));if(presentation<0){const {x,...style}=frameTitleStyle(item,(text,size,font)=>{measureContext.font=`${font.fontStyle} ${font.fontWeight} ${size}px ${font.fontFamily}`;return measureContext.measureText(text).width;});const label=el('text',{x,y:-12,class:'frame-title'});Object.assign(label.style,style);label.textContent=item.text||'Frame';group.append(label);}
    }else{
      if(item.type!=='text'||item.background){const shape=shapeGeometry(item.type==='card'?'rounded':item.shape,item.w,item.h);group.append(el(shape.tag,{...shape.attrs,fill:item.fill,stroke:item.stroke||'#a5b8ae','stroke-width':item.strokeWidth??1,'stroke-dasharray':dash}));}textContent(group,item);
    }
    if(selectionVisible&&item.type!=='connector'&&!item.locked)group.append(el('rect',{x:item.w-5,y:item.h-5,width:10,height:10,class:'resize','data-resize':item.id}));
    if(item.locked&&presentation<0){const lock=el('text',{...lockPosition,'font-size':12,'aria-label':'Locked object',class:'lock-indicator','pointer-events':'none'});lock.textContent='🔒';group.append(lock);}
    scene.append(group);
  }
  const pendingTitle=boardTitleEditor?.pending();if(pendingTitle)$('title').value=pendingTitle.raw;else if(document.activeElement!==$('title'))$('title').value=board.doc.name;renderTitleReview();$('zoom').textContent=`${Math.round(camera.z*100)}%`;$('selectionbar').hidden=!selected.length||presentation>=0;
  const firstSelected=board.doc.items.find(i=>selected.includes(i.id));if(firstSelected)$('fill').value=selectionColor(firstSelected);
  $('undo').disabled=!board.past.length||!writable();$('redo').disabled=!board.future.length||!writable();$('title').readOnly=!writable();$('import').disabled=!writable();
  document.querySelectorAll('[data-tool]').forEach(b=>b.disabled=b.dataset.tool==='comment'?!canComment():!writable()&&!['hand','select'].includes(b.dataset.tool));
  document.querySelectorAll('[data-panel="templates"],[data-mutation]').forEach(b=>b.disabled=!writable());
  $('open-table').hidden=!board.doc.items.some(i=>selected.includes(i.id)&&i.type==='table');
  document.querySelectorAll('#selectionbar button,#selectionbar input,#selectionbar select').forEach(b=>b.disabled=!writable()&&!['copy','open-table','tags'].includes(b.id));
  for(const id of ['clear-content','clear-content-menu'])if($(id))$(id).disabled=!writable()||!board.clearableContent(selected).length;
  document.querySelectorAll('[data-stack-action]').forEach(button=>button.disabled=!writable()||!board.canReorder(selected,button.dataset.stackAction));
  $('front').disabled=!writable()||!['front','back','forward','backward'].some(action=>board.canReorder(selected,action));
  updateStickyShapes();
  document.querySelectorAll('[data-tool]').forEach(b=>{const active=b.dataset.tool===tool;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  renderPresence();renderCommentMarkers();tableEditor?.refresh();setMemberControls();refreshObjectPanel();refreshFrameSequence();updateTimerView();minimap.update();cellPaste.refresh();bulkNotes.refresh();if(currentPanel==='tags'&&!$('panel').hidden)tagPanel?.refresh();
}
function renderCommentMarkers(){
  scene.querySelector('#comment-pins')?.remove();if(!cloudSession)return;const layer=el('g',{id:'comment-pins'});
  for(const [index,comment]of cloudComments.comments.filter(c=>!c.parent_id&&!c.resolved&&!c.deleted_at).entries()){
    const anchor=board.doc.items.find(i=>i.id===comment.item_id),x=anchor?anchor.x+anchor.w/2:comment.x,y=anchor?anchor.y:comment.y;
    const marker=el('g',{transform:`translate(${x} ${y}) scale(${1/camera.z})`,'data-comment-id':comment.id,role:'button',tabindex:0,'aria-label':`Open comment: ${comment.body.slice(0,80)}`});
    marker.append(el('circle',{r:14,fill:'#956221',stroke:'#ffffff','stroke-width':2}));const text=el('text',{x:0,y:4,'text-anchor':'middle',fill:'#ffffff','font-size':12,'pointer-events':'none'});text.textContent=String(index+1);marker.append(text);const open=()=>{panel('comments');queueMicrotask(()=>$('panelbody').querySelector(`[data-thread-id="${comment.id}"]`)?.scrollIntoView({block:'nearest'}));};marker.onclick=e=>{e.stopPropagation();open();};marker.onkeydown=e=>{if(e.key==='Enter'){e.stopPropagation();open();}};layer.append(marker);
  }scene.append(layer);
}
function renderPresence(){scene.querySelector('#live-cursors')?.remove();if(!cloudSession)return;const layer=el('g',{id:'live-cursors','pointer-events':'none'});for(const person of cloudPeople){if(!Number.isFinite(person.x)||!Number.isFinite(person.y))continue;const g=el('g',{transform:`translate(${person.x} ${person.y}) scale(${1/camera.z})`});g.append(el('path',{d:'M0 0 L0 18 L5 13 L10 23 L14 21 L9 11 L17 11 Z',fill:'#8050a0',stroke:'#ffffff','stroke-width':1}));const text=el('text',{x:18,y:26,fill:'#63357d','font-size':12,stroke:'#ffffff','stroke-width':3,'paint-order':'stroke'});text.textContent=person.name;g.append(text);layer.append(g);}scene.append(layer);}
function changed(){selected=selected.filter(id=>board.doc.items.some(i=>i.id===id));persist();render();}
function setTool(value){tool=value;connectFrom=null;canvas.style.cursor=value==='hand'?'grab':value==='select'?'default':'crosshair';$('hint').textContent=({select:'Choose a tool. Enter edits a selected object.',hand:'Drag the canvas to pan.',pen:'Drag on the canvas to draw.',connector:'Click two objects to connect them.',comment:'Click the canvas to add a comment.'})[value]||'Click the canvas, or focus it and press Enter to place an object.';render();}
function edit(id){const item=board.doc.items.find(i=>i.id===id);if(item?.type==='table'){openTable(id);return;}if(!writable()||!item||item.locked||item.type==='pen')return;selected=[id];objectTextEditor.open(item);$('editor').dataset.item=id;$('editor').returnValue='cancel';$('editor').showModal();$('content').focus();}
function openTable(id,{drafts}={}){if($('tabledialog').open)return;let draftStorage;try{draftStorage=sessionStorage;}catch{}const draftContext=cloudSession?{mode:'cloud',userId:cloudSession.base.userId,boardId:cloudSession.base.id,tableId:id}:{mode:'device',boardId:library?.state.activeId||'unsaved',tableId:id};const recoveryKey=tableDraftKey(draftContext),recovery=drafts?.key===recoveryKey?drafts:tableDraftCache.get(recoveryKey);tableEditor=new TableEditor($('tabledialog'),{draftStorage,draftContext,drafts:recovery,getItem:()=>board.doc.items.find(i=>i.id===id),commit:table=>{requireWritable();board.update([id],{table});changed();},writable,rename:text=>{requireWritable();board.update([id],{text});changed();},selectedItems:()=>board.doc.items.filter(i=>selected.includes(i.id)),download,undo:()=>{if(allowMutation()){board.undo();changed();}},createCards:(records,fields)=>{requireWritable();const temp=new Board(board.doc),origin=board.doc.items.find(i=>i.id===id);records.forEach((record,index)=>temp.add('card',origin.x+origin.w+60,origin.y+index*190,{w:260,h:160,fill:'#ffffff',text:fields.filter(f=>record.cells[f.id]!==undefined).map(f=>`${f.name}: ${displayCell(f,record.cells[f.id])}`).join('\n')}));board.transact(doc=>Object.assign(doc,temp.doc));changed();}});tableDraftCache.set(recoveryKey,tableEditor.drafts);$('tabledialog').showModal();}
$('tabledialog').addEventListener('close',()=>tableEditor=null);
let objectDraftStorage;try{objectDraftStorage=sessionStorage;}catch{}
const objectTextEditor=new ObjectTextEditor({storage:objectDraftStorage,draftStatus:$('objectdraftstatus'),exportControl:$('exportobjectdraft'),discardControl:$('discardobjectdraft'),download,content:$('content'),error:$('editerror'),reviewArea:$('objectreview'),latest:$('objectlatest'),getItem:id=>board.doc.items.find(item=>item.id===id),getScope:()=>JSON.stringify(cloudSession?['cloud',cloudSession.base.userId,cloudSession.base.id]:['device',library?.state.activeId||'unsaved']),writable,commit:(id,text)=>{requireWritable();board.update([id],{text});changed();}});
$('editor').addEventListener('close',()=>objectTextEditor.close());
$('editform').onsubmit=event=>{if(event.submitter?.value==='save'&&!objectTextEditor.save())event.preventDefault();};
$('objectbaseline').onclick=()=>objectTextEditor.review();$('content').oninput=()=>objectTextEditor.remember();$('exportobjectdraft').onclick=()=>objectTextEditor.export();$('discardobjectdraft').onclick=()=>{if(objectTextEditor.discard())$('editor').close();};
function fitCamera(items){const box=bounds(items,board.doc.items);camera.z=Math.min(2,Math.max(.05,Math.min((innerWidth-200)/(box.w+100),(innerHeight-220)/(box.h+100))));camera.x=(innerWidth-box.w*camera.z)/2-box.x*camera.z;camera.y=(innerHeight-box.h*camera.z)/2-box.y*camera.z;}
function fit(items=board.doc.items){follow.stop();fitCamera(items);render();}
function closePanel(){votingPanel?.close();votingPanel=null;tagPanel?.close();tagPanel=null;$('panel').hidden=true;if(currentPanel==='frames')setTool('select');if(['frames','timer','voting','tags'].includes(currentPanel))canvas.focus();}
function timerNow(){return Math.floor(cloudSession?.clock.now()??localTimerClock.now());}
function updateTimerView(){
  const timer=board.doc.timer,now=timerNow(),scope=currentInspectorScope(),remaining=timerRemaining(timer,now),active=!$('workspace').hidden&&(!cloudSession||(!cloudSession.closed&&!cloudSession.conflict));
  timerButton.textContent=timer?`Timer · ${formatTimer(remaining)}`:'Timer';
  presentationTimer.hidden=!(active&&presentation>=0&&timer&&timer.state!=='stopped');presentationTimer.textContent=timer?`Session timer · ${formatTimer(remaining)}`:'';
  timerAudio.sync({timer,remaining,scope,active});
  if(timerCompletion.observe({scope,timer,remaining,active})){timerAudio.chime();toast('Time is up.');}
  if(currentPanel==='timer'&&!$('panel').hidden){const signature=JSON.stringify([scope,writable(),timer]);if(signature!==timerPanelSignature){timerPanelSignature=signature;mountTimerPanel($('panelbody'),{timer,scope,onAction:action=>{requireWritable();board.timer(action,timerNow());changed();},onAudioChange:async enabled=>{await timerAudio.setEnabled(enabled);updateTimerView();},onTestSound:()=>timerAudio.chime()});}updateTimerPanel($('panelbody'),{timer,now,canEdit:writable(),audio:timerAudio});}
}
function refreshFrameSequence(){
  if(currentPanel!=='frame-sequence'||$('panel').hidden)return;
  const frames=board.doc.items.filter(item=>item.type==='frame'&&!item.parentId),signature=JSON.stringify([writable(),frames.map(item=>[item.id,item.text])]);if(signature===frameSequenceSignature)return;frameSequenceSignature=signature;
  mountFrameSequence($('panelbody'),{frames,writable:writable(),onCreate:()=>{setTool('frame');panel('frames');},onOpen:id=>{const frame=board.doc.items.find(item=>item.id===id);if(frame){selected=[id];fit([frame]);}},onPresent:id=>{const index=board.doc.items.filter(item=>item.type==='frame'&&!item.parentId).findIndex(item=>item.id===id);if(index>=0)showFrame(index);},onMove:(id,direction)=>{if(!allowMutation())return;try{const ids=board.doc.items.filter(item=>item.type==='frame'&&!item.parentId).map(item=>item.id),index=ids.indexOf(id),next=index+direction;if(index<0||next<0||next>=ids.length)return;[ids[index],ids[next]]=[ids[next],ids[index]];board.orderFrames(ids);changed();}catch(error){toast(error.message);}}});
}
function createAt(type,p){
  if(!writable())return;
  const props={sticky:{text:'',...stickySize,fill:stickyFill,autoFont:true},text:{text:'',w:240,h:100,fill:'#ffffff'},shape:{text:'',fill:'#e1eee7',shape:creationShape},frame:{text:'New frame',...creationFrameSize,fill:'#ffffff'},card:{text:'New task\n\nAdd a description',w:260,h:160,fill:'#ffffff'},table:{text:'Project table',w:760,h:360,fill:'#ffffff',table:newTable()}}[type];
  if(!props)return;
  const created=board.add(type,p.x,p.y,props);selected=[created];setTool('select');changed();if(type!=='frame')edit(created);
}
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0&&e.button!==1)return; if(presentation>=0)return;
  const p=world(e),target=e.target.closest('[data-id]'),id=target?.dataset.id,item=board.doc.items.find(i=>i.id===id);
  if(e.target.closest('[data-comment-id]'))return;
  canvas.setPointerCapture(e.pointerId);
  if(tool==='hand'||e.button===1||e.altKey){gesture={type:'pan',sx:e.clientX,sy:e.clientY,original:{...camera}};return;}
  if(tool==='comment'){if(canComment())composeComment({x:p.x,y:p.y,itemId:id||null});else toast('Open a cloud board with commenting permission first.');setTool('select');return;}
  if(!writable()){if(id)selected=board.selection([id]);else selected=[];const now=Date.now(),open=item?.type==='table'&&lastObjectPress?.id===id&&now-lastObjectPress.time<400;lastObjectPress=open?null:{id,time:now};render();if(open)openTable(id);return;}
  if(tool==='connector'){
    if(!item||['connector','frame'].includes(item.type))return;
    if(!connectFrom){connectFrom=id;selected=[id];toast('Click another object to connect it.');render();}else if(id!==connectFrom){const from=connectFrom;selected=[board.add('connector',0,0,{from,to:id,fill:'#526961'})];setTool('select');changed();}return;
  }
  if(tool==='pen'){gesture={type:'pen',start:p,points:[[0,0]]};return;}
  if(tool!=='select'){
    createAt(tool,p);return;
  }
  if(id){
    const now=Date.now();if(!e.shiftKey&&lastObjectPress?.id===id&&now-lastObjectPress.time<400){lastObjectPress=null;edit(id);return;}lastObjectPress={id,time:now};
    if(e.shiftKey){selected=selected.includes(id)?selected.filter(x=>x!==id):[...selected,id];render();return;}
    if(!selected.includes(id))selected=board.selection([id]);
    if(item?.locked){render();return;}if(!e.target.dataset.resize)try{board.movementSelection(selected);}catch(error){toast(error.message);render();return;}
    gesture={type:e.target.dataset.resize?'resize':'move',start:p,original:structuredClone(board.doc),id};
  }else{selected=[];gesture={type:'marquee',start:p};}render();
});
canvas.addEventListener('pointermove',e=>{
  lastPointer=world(e);if(cloudSession&&Date.now()-cursorSentAt>500){cursorSentAt=Date.now();void cloudSession.presence(lastPointer).catch(()=>{});}if(!gesture)return;if(['move','resize','pen'].includes(gesture.type)&&!writable()){endGesture(true);return;}const p=world(e),g=gesture;
  if(g.type==='pan'){camera.x=g.original.x+e.clientX-g.sx;camera.y=g.original.y+e.clientY-g.sy;render();return;}
  if(g.type==='move'||g.type==='resize'){
    board.doc=structuredClone(g.original);const dx=p.x-g.start.x,dy=p.y-g.start.y;
    const moving=board.selection(selected.filter(id=>!board.doc.items.find(i=>i.id===id)?.locked),{descendants:true});
    for(const i of board.doc.items)if(moving.includes(i.id)&&!i.locked&&i.type==='connector'&&g.type==='move')translateFreeEndpoints(i,dx,dy);
    for(const i of board.doc.items)if(moving.includes(i.id)&&!i.locked&&i.type!=='connector'){if(g.type==='move'){i.x+=dx;i.y+=dy;}else if(i.id===g.id){const delta=localDelta(dx,dy,i.rotation),w=Math.max(30,i.w+delta.x),h=Math.max(30,i.h+delta.y),origin=resizedOrigin(i,w,h);if(i.type==='pen')i.points=i.points.map(p=>[p[0]*w/i.w,p[1]*h/i.h]);i.x=origin.x;i.y=origin.y;i.w=w;i.h=h;}}render();
  }else if(g.type==='marquee'){
    const x=Math.min(p.x,g.start.x),y=Math.min(p.y,g.start.y),w=Math.abs(p.x-g.start.x),h=Math.abs(p.y-g.start.y);
    selected=board.selection(marqueeSelection(board.doc.items,{x,y,w,h}));render();scene.append(el('rect',{x,y,width:w,height:h,class:'marquee'}));
  }else if(g.type==='pen'){
    g.points.push([p.x-g.start.x,p.y-g.start.y]);render();scene.append(el('path',{d:g.points.map((v,i)=>`${i?'L':'M'}${v[0]+g.start.x} ${v[1]+g.start.y}`).join(' '),stroke:'#233c33','stroke-width':3,fill:'none'}));
  }
});
function endGesture(cancel=false){
 const g=gesture;if(!g)return;gesture=null;
 if(!['move','resize','pen'].includes(g.type)){render();return;}
 cancel=cancel||!writable();const latest=deferredCloud;deferredCloud=null;
 const baseline=structuredClone(latest||g.original||board.doc);
 if(latest&&g.original&&['move','resize'].includes(g.type)){
  const delta=changesBetween(g.original,latest);
  for(const key of ['past','future'])board[key]=board[key].flatMap(previous=>{try{return[applyChanges(previous,delta)];}catch{return[];}});
 }
 if(cancel){board.doc=baseline;render();return;}
 try{
  if(['move','resize'].includes(g.type)){
   if(latest){const affected=g.type==='move'?new Board(g.original).movementSelection(selected):[g.id];if(latest.items.some(item=>affected.includes(item.id)&&item.locked))throw Error('An object was locked during this gesture');}
   let result=new Board(board.doc).doc;reconcileFrames(result);board.doc=baseline;
   if(latest)try{result=applyChanges(latest,changesBetween(g.original,result));}
   catch(error){
    if(!cloudSession)throw error;
    board.doc=result;cloudSession.local=structuredClone(result);cloudSession.conflict=error;
    let saved=false;try{saveCloudDraft(localStorage,cloudSession.base,result,commentClientId);saved=true;}catch{}
    toast(saved?'A live edit conflicts with this drag. Your device draft is preserved; export it before reloading.':'A live edit conflicts with this drag. Export your draft before reloading.');render();return;
   }
   if(board.transact(doc=>Object.assign(doc,result)))changed();else render();
  }else if(g.points.length>1){
   const xs=g.points.map(p=>p[0]),ys=g.points.map(p=>p[1]),minX=Math.min(...xs),minY=Math.min(...ys);
   selected=[board.add('pen',g.start.x+minX,g.start.y+minY,{w:Math.max(1,Math.max(...xs)-minX),h:Math.max(1,Math.max(...ys)-minY),fill:'#233c33',points:g.points.map(p=>[p[0]-minX,p[1]-minY])})];changed();
  }else render();
 }catch(error){board.doc=baseline;toast('Gesture canceled: '+error.message);render();}
}
canvas.addEventListener('pointerup',()=>endGesture());canvas.addEventListener('pointercancel',()=>endGesture(true));
canvas.addEventListener('dblclick',e=>{const id=e.target.closest('[data-id]')?.dataset.id;if(id)edit(id);});
canvas.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey){const p=world(e);camera.z=Math.min(4,Math.max(.05,camera.z*Math.exp(-e.deltaY*.005)));camera.x=e.clientX-p.x*camera.z;camera.y=e.clientY-p.y*camera.z;}else{camera.x-=e.deltaX;camera.y-=e.deltaY;}render();},{passive:false});
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{setTool(b.dataset.tool);if(b.dataset.tool==='shape')panel('shapes');if(b.dataset.tool==='sticky')panel('stickies');if(b.dataset.tool==='frame')panel('frames');});
let titleSaveTimer,focusedTitleState=null;
const boardTitleEditor=new BoardTitleEditor({storage:objectDraftStorage,download,getContext:()=>({board,scope:currentInspectorScope()}),writable,commit:name=>{requireWritable();board.transact(doc=>doc.name=name);document.title=board.doc.name+(cloudSession?' · Mirra Cloud':' · Mirra');changed();}});
function renderTitleReview(){const state=boardTitleEditor.pending();$('titlereview').hidden=!state?.error;$('titleerror').textContent=state?.error||'';$('titlelatest').textContent=state?.latest===null||!state?'':'Latest saved name: '+state.latest;$('retrytitle').hidden=state?.latest===null||!state;}
$('title').onfocus=()=>{boardTitleEditor.begin();focusedTitleState=boardTitleEditor.state;};
$('title').onchange=()=>{clearTimeout(titleSaveTimer);if(boardTitleEditor.state!==focusedTitleState){render();return;}boardTitleEditor.input($('title').value);boardTitleEditor.save();render();};
$('title').oninput=event=>{clearTimeout(titleSaveTimer);boardTitleEditor.input(event.target.value);const operation=boardTitleEditor.state;focusedTitleState=operation;titleSaveTimer=setTimeout(()=>{boardTitleEditor.save(operation);render();},400);renderTitleReview();};
$('retrytitle').onclick=()=>{clearTimeout(titleSaveTimer);boardTitleEditor.retryReviewed();render();};
$('discardtitle').onclick=()=>{clearTimeout(titleSaveTimer);if(boardTitleEditor.discard())$('title').value=board.doc.name;render();};$('exporttitle').onclick=()=>boardTitleEditor.export();
$('undo').onclick=()=>{board.undo();changed();};$('redo').onclick=()=>{board.redo();changed();};
$('fill').oninput=e=>{if(!allowMutation())return;applySelectionColor(board,selected,e.target.value);changed();};
$('edit').onclick=()=>edit(selected[0]);$('duplicate').onclick=()=>{selected=board.duplicate(selected);changed();};
function deleteSelected(ids=selected){if(!allowMutation())return false;try{board.remove(ids);changed();return true;}catch(error){toast('Delete failed: '+error.message);return false;}}
$('delete').onclick=()=>deleteSelected();$('lock').onclick=()=>{const unlocked=board.doc.items.some(i=>selected.includes(i.id)&&!i.locked);board.update(selected,{locked:unlocked});changed();};
$('align').onchange=e=>{try{board.align(selected,e.target.value);changed();}catch(error){toast(error.message);}finally{e.target.value='';}};$('front').textContent='Arrange';$('front').onclick=()=>{panel('selection-actions');($('panelbody').querySelector('[data-stack-action]:not(:disabled)')||$('closepanel')).focus();};
function arrangeSelection(action){if(!allowMutation())return;try{const active=document.activeElement;if(board.reorder(selected,action))changed();if(active instanceof HTMLButtonElement&&!active.disabled)active.focus();else ($('panelbody').querySelector('[data-stack-action]:not(:disabled)')||$('closepanel')).focus();}catch(error){toast(error.message);}}
$('group').onclick=()=>{try{selected=board.group(selected);changed();}catch(error){toast(error.message);}};
$('ungroup').onclick=()=>{try{selected=board.ungroup(selected);changed();}catch(error){toast(error.message);}};
$('frame-selection').onclick=()=>{try{selected=[board.frameSelection(selected)];changed();}catch(error){toast(error.message);}};
let inspectorState=null,inspectorDraft=null,inspectorIncomplete=new Set();
const inspectorRecovery=new InspectorRecovery(objectDraftStorage);
function currentInspectorScope(){return JSON.stringify(cloudSession?['cloud',cloudSession.base.userId,cloudSession.base.id]:['device',library?.state.activeId||'unsaved']);}
function inspectorValues(){return Object.fromEntries([...numericProps,...booleanProps,...valueProps].map(key=>[key,booleanProps.includes(key)?$('prop-'+key).checked:$('prop-'+key).value]));}
const propertyLabels={x:'X',y:'Y',w:'Width',h:'Height',rotation:'Rotation',opacity:'Opacity',fontSize:'Font size',strokeWidth:'Line width',fill:'Fill',stroke:'Border / line',textColor:'Text color',fontFamily:'Typeface',textAlign:'Alignment',autoFont:'Fit text automatically',background:'Show text background',bold:'Bold',italic:'Italic',underline:'Underline',shape:'Shape',route:'Routing',arrow:'Arrows',lineStyle:'Line style'};
function propertyLines(values,keys=Object.keys(propertyLabels)){return keys.map(key=>propertyLabels[key]+': '+(values[key]===''?'(empty)':values[key])).join('\n');}
function paintInspector(values,invalid=[]){inspectorIncomplete=new Set(invalid);for(const key of [...numericProps,...booleanProps,...valueProps]){const input=$('prop-'+key);if(booleanProps.includes(key))input.checked=values[key];else input.value=values[key];input.setCustomValidity(inspectorIncomplete.has(key)?'Re-enter this incomplete numeric value.':'');}}
function inspectorReview(){if(!inspectorDraft||!inspectorState)return;$('inspectdraftstatus').textContent=inspectorDraft.error||(inspectorDraft.entry?'Unsent properties are kept in this tab.':'');for(const id of ['exportinspect','discardinspect'])$(id).hidden=!inspectorDraft.entry&&!inspectorDraft.blocked;$('inspectreview').hidden=!inspectorDraft.entry;const item=board.doc.items.find(item=>item.id===inspectorState.original.id),compatible=item&&item.type===inspectorState.original.type&&inspectorState.scope===currentInspectorScope();$('reviewinspect').disabled=!compatible||!writable()||item?.locked;$('inspectlatest').value=compatible?propertyLines(inspectorDisplayed(item)):'The original object is unavailable in this editing context.';}
function rememberInspector(event){if(!inspectorState)return;const key=event?.target?.id?.replace('prop-','');if(numericProps.includes(key)){inspectorIncomplete.delete(key);event.target.setCustomValidity('');}for(const key of numericProps)if($('prop-'+key).validity.badInput)inspectorIncomplete.add(key);try{inspectorDraft=inspectorRecovery.remember(inspectorState,inspectorValues(),[...inspectorIncomplete]);inspectorReview();}catch(error){$('inspecterror').textContent=error.message;}}
function inspect(){
 if(selected.length!==1){toast('Select one object to edit its properties.');return;}const item=board.doc.items.find(item=>item.id===selected[0]);if(!item||item.locked){toast('Select an unlocked object before changing properties.');return;}
 const recovered=inspectorRecovery.open(item,currentInspectorScope());inspectorState=recovered.state;inspectorDraft=recovered.draft;paintInspector(recovered.values,recovered.invalid);
 $('geometryfields').hidden=item.type==='connector';$('textfields').hidden=item.type==='pen';$('textbackgroundfield').hidden=item.type!=='text';$('prop-background').disabled=item.type!=='text';$('shapefield').hidden=item.type!=='shape';$('connectorfields').hidden=item.type!=='connector';for(const id of ['geometryfields','textfields','connectorfields'])$(id).disabled=$(id).hidden;
 $('inspector').dataset.item=item.id;$('inspecterror').textContent=recovered.invalid.length?'Re-enter the incomplete numeric values before applying.':recovered.recovered?'Recovered unsent properties. Compare them with the latest saved values.':'';inspectorReview();$('inspector').showModal();
}
$('inspect').onclick=inspect;$('cancelinspect').onclick=()=>$('inspector').close();$('inspector').addEventListener('close',()=>{inspectorState=null;inspectorDraft=null;});
$('inspectform').oninput=rememberInspector;$('inspectform').onchange=rememberInspector;
$('exportinspect').onclick=()=>{if(inspectorDraft)download('mirra-property-recovery.json',inspectorRecovery.export(inspectorDraft),'application/json');};
$('discardinspect').onclick=()=>{if(inspectorDraft&&!inspectorRecovery.clear(inspectorDraft)){$('inspecterror').textContent=inspectorDraft.error;inspectorReview();return;}$('inspector').close();};
$('reviewinspect').onclick=()=>{try{requireWritable();const item=board.doc.items.find(item=>item.id===inspectorState.original.id),rebased=rebaseInspector(inspectorState,inspectorValues(),item,currentInspectorScope());inspectorState=rebased.state;paintInspector(rebased.values,[...inspectorIncomplete]);rememberInspector();$('inspecterror').textContent='Latest saved values are the new baseline. Review your edits before applying.';}catch(error){$('inspecterror').textContent=error.message;}};
$('inspectform').onsubmit=e=>{e.preventDefault();try{rememberInspector();requireWritable();const next=applyInspector(board.doc,inspectorState,inspectorValues(),currentInspectorScope());if(next){board.transact(doc=>Object.assign(doc,next));changed();}if(!inspectorRecovery.clear(inspectorDraft)){$('inspecterror').textContent='Properties saved, but '+inspectorDraft.error;inspectorReview();return;}$('inspector').close();}catch(error){$('inspecterror').textContent=error.message;inspectorReview();}};
const CLIP_PREFIX='MIRRA_SELECTION_V1\n';
function canEditClipboard(event){return!$('workspace').hidden&&presentation<0&&!event.target.closest('input,textarea,select,dialog');}
for(const type of ['copy','cut'])document.addEventListener(type,e=>{
  if(!canEditClipboard(e)||!selected.length)return;e.preventDefault();e.clipboardData.setData('text/plain',CLIP_PREFIX+board.copySelection(selected));if(type==='cut'&&writable())deleteSelected(board.selection(selected.filter(id=>!board.doc.items.find(i=>i.id===id)?.locked),{descendants:true}));
});
document.addEventListener('paste',e=>{
  if(!canEditClipboard(e)||!writable())return;const text=e.clipboardData.getData('text/plain'),html=e.clipboardData.getData('text/html');if(!text&&!spreadsheetHint('',html))return;e.preventDefault();
  try{const p=lastPointer||world({clientX:innerWidth/2,clientY:innerHeight/2});if(!text.startsWith(CLIP_PREFIX)&&spreadsheetHint(text,html)){cellPaste.open(text||'""',p,stickyFill,stickySize);return;}selected=text.startsWith(CLIP_PREFIX)?board.pasteSelection(text.slice(CLIP_PREFIX.length),p.x+24,p.y+24):[board.add('text',p.x,p.y,{w:280,h:160,text,fill:'#ffffff'})];changed();}catch(error){toast(`Paste failed: ${error.message}`);}
});
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(CLIP_PREFIX+board.copySelection(selected));toast('Selection copied. Paste on this board or another board.');}catch{toast('Use Ctrl/Cmd+C while the canvas has focus to copy.');}};
function zoom(factor){follow.stop();const x=innerWidth/2,y=innerHeight/2,p={x:(x-camera.x)/camera.z,y:(y-camera.y)/camera.z};camera.z=Math.min(4,Math.max(.05,camera.z*factor));camera.x=x-p.x*camera.z;camera.y=y-p.y*camera.z;render();}
$('plus').onclick=()=>zoom(1.2);$('minus').onclick=()=>zoom(1/1.2);$('zoom').onclick=()=>{zoom(1/camera.z);};$('fit').onclick=()=>fit();
function download(name,body,type){const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('share').onclick=()=>$('exportdialog').showModal();$('closeexport').onclick=()=>$('exportdialog').close();
$('downloadjson').onclick=()=>download('mirra-board.json',board.serialize(),'application/json');
$('downloadsvg').onclick=()=>{
  const rendered=new Map([...canvas.querySelectorAll('.object')].map(node=>[node.dataset.id,node])),box=svgExportBox(board.doc.items,item=>rendered.get(item.id)?.getBBox()),out=canvas.cloneNode(true);
  out.querySelector('#grid').remove();out.querySelector('#scene').removeAttribute('transform');out.querySelectorAll('.resize,#live-cursors,#comment-pins,.marquee').forEach(n=>n.remove());out.querySelectorAll('.selected').forEach(n=>n.classList.remove('selected'));
  out.querySelectorAll('.object').forEach(node=>{const item=board.doc.items.find(i=>i.id===node.dataset.id),stroke=item.stroke||'#a5b8ae',width=String(item.strokeWidth??1);node.style.setProperty('--item-stroke',stroke);node.style.setProperty('--item-stroke-width',width);for(const shape of node.children)if(['rect','ellipse','polygon'].includes(shape.localName)){shape.setAttribute('stroke',stroke);shape.setAttribute('stroke-width',width);}if(item.type==='connector'){node.querySelector('path[stroke="transparent"]')?.remove();node.querySelector('path')?.setAttribute('stroke',item.stroke||item.fill);}});
  const svgLabels=[...canvas.querySelectorAll('.object > text')];out.querySelectorAll('.object > text').forEach((node,index)=>{const computed=getComputedStyle(svgLabels[index]);for(const property of ['fill','font-size','font-family','font-weight','font-style','letter-spacing','word-spacing','text-decoration'])node.style.setProperty(property,computed.getPropertyValue(property));});
  const originals=[...canvas.querySelectorAll('.itemtext')];
  out.querySelectorAll('.itemtext').forEach((node,index)=>{const computed=getComputedStyle(originals[index]);for(const property of ['display','height','width','align-items','justify-content','padding','box-sizing','line-height','white-space','overflow-wrap','overflow','letter-spacing','word-spacing'])node.style.setProperty(property,computed.getPropertyValue(property));});
  const tableNodes=[...canvas.querySelectorAll('.canvas-table-preview,.canvas-table-preview *')];
  out.querySelectorAll('.canvas-table-preview,.canvas-table-preview *').forEach((node,index)=>{const computed=getComputedStyle(tableNodes[index]);for(const property of ['display','height','width','max-width','padding','margin','box-sizing','font-family','font-size','font-weight','color','background-color','line-height','white-space','overflow','text-overflow','text-align','border','border-collapse','table-layout','letter-spacing','word-spacing'])node.style.setProperty(property,computed.getPropertyValue(property));});
  out.setAttribute('xmlns',ns);out.setAttribute('viewBox',`${box.x} ${box.y} ${box.w} ${box.h}`);out.setAttribute('width',box.w);out.setAttribute('height',box.h);download('mirra-board.svg',new XMLSerializer().serializeToString(out),'image/svg+xml');
};
let importGeneration=0;
$('exportdialog').addEventListener('close',()=>{if(!$('exportdialog').open){importGeneration++;$('import').value='';}});
async function importBoard(file){const generation=++importGeneration;$('importerror').textContent='';try{const incoming=await prepareBoardImport(file,{getContext:()=>({board,scope:currentInspectorScope()}),assertWritable:requireWritable,isCurrent:()=>generation===importGeneration&&$('exportdialog').open});board.replace(incoming);selected=[];changed();fit();$('exportdialog').close();toast('Board imported. Undo restores your previous board.');return true;}catch(error){if(error.name!=='ImportCancelled'&&generation===importGeneration&&$('exportdialog').open)$('importerror').textContent=`Import failed: ${error.message}`;return false;}finally{if(generation===importGeneration)$('import').value='';}}
$('import').onchange=async e=>{const file=e.target.files[0];if(file)await importBoard(file);};
$('importpaste').dataset.mutation='true';$('importpaste').onclick=async()=>{const text=$('importtext').value;if(await importBoard({size:new Blob([text]).size,text:async()=>text}))$('importtext').value='';};

function refreshObjectPanel(){
 if($('panel').hidden||!['layers','search'].includes(currentPanel))return;
 const body=$('panelbody'),input=body.querySelector('input[aria-label="Search object text"]'),query=(input?.value||'').toLowerCase();
 const items=[...board.doc.items].reverse().filter(item=>item.text.toLowerCase().includes(query)||item.tagIds?.some(id=>board.doc.tags?.find(tag=>tag.id===id)?.name.toLowerCase().includes(query)));
 const existing=new Map([...body.querySelectorAll('button[data-object-id]')].map(button=>[button.dataset.objectId,button]));let previous=input;
 for(const item of items){
  let button=existing.get(item.id);existing.delete(item.id);
  if(!button){button=document.createElement('button');button.dataset.objectId=item.id;button.onclick=()=>{const latest=board.doc.items.find(candidate=>candidate.id===item.id);if(!latest)return;selected=[latest.id];fit([latest]);requestAnimationFrame(()=>{if(document.activeElement===button&&!$('panel').hidden)button.scrollIntoView({block:'nearest'});});};}
  const text=item.type+' · '+(item.text||'Untitled');if(button.textContent!==text)button.textContent=text;
  const next=previous?previous.nextSibling:body.firstChild;if(next!==button)body.insertBefore(button,next);previous=button;
 }
 for(const button of existing.values())button.remove();
 let empty=body.querySelector('[data-object-empty]');if(!empty){empty=document.createElement('p');empty.dataset.objectEmpty='true';body.append(empty);}
 empty.textContent=currentPanel==='search'?'No matching objects.':'No objects on this board yet.';empty.hidden=items.length>0;
}
function panel(name){currentPanel=name;$('panel').hidden=false;$('paneltitle').textContent={layers:'Board objects',search:'Find on this board',templates:'Start with a layout',menu:'Board options',shapes:'Choose a shape',frames:'Choose a frame',stickies:'Sticky notes',comments:'Board discussion','table-drafts':'Unsent table edits','object-drafts':'Unsent object text','property-drafts':'Unsent property edits'}[name];const body=$('panelbody');body.replaceChildren();
  const button=(label,action,{mutation=false}={})=>{const b=document.createElement('button');b.textContent=label;if(mutation){b.dataset.mutation='true';b.disabled=!writable();}b.onclick=()=>{if(!mutation||allowMutation())action();};body.append(b);return b;};
  votingPanel?.close();votingPanel=null;tagPanel?.close();tagPanel=null;
  if(name==='sticky-shape'){$('paneltitle').textContent='Note shape';stickyShapeControls(body,button);}
  if(name==='selection-actions'&&board.doc.items.some(item=>selected.includes(item.id)&&item.type==='sticky'))stickyShapeControls(body,button);
  if(name==='selection-actions'){$('paneltitle').textContent='Selection actions';const clear=button('Clear content',clearSelectedContent,{mutation:true});clear.id='clear-content-menu';clear.disabled=!writable()||!board.clearableContent(selected).length;const hint=document.createElement('p');hint.textContent='Remove text and tag assignments from unlocked sticky notes, shapes and cards. Colors, size and layout stay in place. Ctrl / Cmd + Backspace also clears content.';body.append(hint);const heading=document.createElement('h3');heading.textContent='Stacking order';body.append(heading);for(const[action,label]of [['front','Bring to front'],['forward','Bring forward'],['backward','Send backward'],['back','Send to back']]){const control=button(label,()=>arrangeSelection(action),{mutation:true});control.dataset.stackAction=action;control.disabled=!writable()||!board.canReorder(selected,action);}const note=document.createElement('p');note.textContent='Frames stay behind objects. Groups keep their internal order; unlock grouped objects before arranging them.';body.append(note);}
  if(name==='tags'){$('paneltitle').textContent='Sticky tags';tagPanel=mountTagPanel(body,{getDoc:()=>board.doc,getSelection:()=>selected,writable,getScope:currentInspectorScope,onAction:action=>{requireWritable();board.tags(action);changed();},onFind:tagId=>{selected=board.doc.items.filter(item=>item.tagIds?.includes(tagId)).map(item=>item.id);if(selected.length)fit(selected.map(id=>board.doc.items.find(item=>item.id===id)));else toast('No notes currently use this tag.');}});}
  if(name==='voting'){$('paneltitle').textContent='Team voting';if(!cloudSession){body.textContent='Voting is available on cloud boards.';button('Open cloud workspace',()=>showCloud());}else{const context=cloudSession;votingPanel=mountVotingPanel(body,{context,active:()=>cloudSession===context,items:()=>board.doc.items,selection:()=>selected,request:cloudRequest,now:timerNow,focusItem:id=>{const item=board.doc.items.find(i=>i.id===id);if(item){selected=[id];fit([item]);}},onClose:closePanel});}}
  if(name==='layers')refreshObjectPanel();
  if(name==='timer'){$('paneltitle').textContent='Session timer';timerPanelSignature='';updateTimerView();$('panelbody').querySelector('input')?.focus();}
  if(name==='frame-sequence'){$('paneltitle').textContent='Frame sequence';frameSequenceSignature='';refreshFrameSequence();$('panelbody').querySelector('button')?.focus();}
  if(name==='frames')mountFramePresets(body,{size:creationFrameSize,canEdit:writable,onChoose:size=>{creationFrameSize=size;setTool('frame');$('panel').hidden=true;canvas.focus();toast('Click the canvas or press Enter to place your frame.');}});
  if(name==='comments'){if(!cloudSession){body.textContent='Comments are available on cloud boards.';button('Open cloud workspace',()=>showCloud());}else{renderCommentPanel();const cloudId=cloudSession.base.id;void cloudRequest(`boards/${cloudId}/comments`).then(data=>{if(cloudSession?.base.id===cloudId){cloudComments=data;renderCommentMarkers();if(currentPanel==='comments')renderCommentPanel();}}).catch(error=>toast(error.message));}}
  if(name==='shapes')for(const shape of SHAPES)button(shape[0].toUpperCase()+shape.slice(1),()=>{creationShape=shape;setTool('shape');$('panel').hidden=true;toast('Click the canvas to place your shape.');});
  if(name==='stickies'){
    const colors=['#f6e49b','#f2c49a','#eeb4ab','#e5b9cb','#d8bce5','#c9c2ec','#becff0','#b5dce9','#b6e2dd','#c8e6ca','#dce7ae','#e9deb7','#e1d1bf','#dedee2','#f0e9de','#ffffff'];
    const palette=document.createElement('div');palette.className='notepalette';for(const color of colors){const b=document.createElement('button');b.style.background=color;b.setAttribute('aria-label',`Sticky color ${color}`);b.onclick=()=>{stickyFill=color;setTool('sticky');};palette.append(b);}body.append(palette);
    button('Square note',()=>{stickySize={w:180,h:180};setTool('sticky');$('panel').hidden=true;});
    button('Wide note',()=>{stickySize={w:240,h:140};setTool('sticky');$('panel').hidden=true;});
    button('Add notes in a batch',()=>bulkNotes.open(world({clientX:innerWidth/2-250,clientY:innerHeight/2-100}),stickyFill),{mutation:true});
  }
  if(name==='search'){const input=document.createElement('input');input.placeholder='Search object text';input.setAttribute('aria-label','Search object text');input.oninput=()=>refreshObjectPanel();body.append(input);refreshObjectPanel();input.focus();}
  if(name==='templates')for(const label of ['Retrospective','Kanban','Brainstorm'])button(label,()=>{
    const labels=label==='Retrospective'?['What worked','What to improve','Next actions']:label==='Kanban'?['Ready','In progress','Complete']:['Challenge','Ideas','Experiments'];
    const origin=world({clientX:innerWidth/2-400,clientY:innerHeight/2-200});
    // A template insertion is a single undoable action.
    const temp=new Board(board.doc);labels.forEach((title,index)=>{temp.add('frame',origin.x+index*290,origin.y,{w:270,h:430,text:title,fill:'#ffffff'});temp.add('sticky',origin.x+index*290+30,origin.y+50,{text:'Add your thinking',w:200,h:150,fill:['#f6e49b','#d5e9dd','#e8dbef'][index]});});
    board.transact(doc=>Object.assign(doc,temp.doc));changed();fit();$('panel').hidden=true;
  },{mutation:true});
  if(name==='property-drafts'){
 const drafts=inspectorRecovery.list(currentInspectorScope());if(!drafts.length){const empty=document.createElement('p');empty.textContent='No unsent property edits for this board in this tab.';body.append(empty);}for(const draft of drafts){const data=inspectorRecovery.read(draft),item=board.doc.items.find(item=>item.id===draft.id),label=(item?.type||'Removed object')+' · '+draft.id.slice(0,8),heading=document.createElement('p');heading.textContent=label;body.append(heading);if(draft.error){const warning=document.createElement('p');warning.textContent=draft.error;warning.setAttribute('role','alert');body.append(warning);}if(data){const keys=Object.keys(propertyLabels).filter(key=>data.values[key]!==data.state.displayed[key]),text=document.createElement('textarea');text.value=propertyLines(data.values,keys)||'No changed properties';text.readOnly=true;text.rows=4;text.setAttribute('aria-label','Unsent properties for '+draft.id);body.append(text);const open=button('Open property draft · '+label,()=>{selected=[draft.id];render();inspect();});open.disabled=!item||item.type!==data.state.original.type||!writable()||item.locked;}button('Export property recovery · '+label,()=>download('mirra-property-recovery.json',inspectorRecovery.export(draft),'application/json'));button('Discard property draft · '+label,()=>{if(!inspectorRecovery.clear(draft))toast(draft.error);panel('property-drafts');});}button('Refresh property recovery',()=>panel('property-drafts'));
 }
  if(name==='object-drafts'){
    try{const drafts=objectTextEditor.list();if(!drafts.length){const empty=document.createElement('p');empty.textContent='No unsent object text for this board in this tab.';body.append(empty);}for(const draft of drafts){const item=board.doc.items.find(item=>item.id===draft.id),label=(item?.type||'Removed object')+' · '+draft.id.slice(0,8),heading=document.createElement('p');heading.textContent=label;body.append(heading);if(draft.error){const warning=document.createElement('p');warning.textContent=draft.error;warning.setAttribute('role','alert');body.append(warning);}if(draft.entry){const text=document.createElement('textarea');text.readOnly=true;text.rows=4;text.value=draft.entry.raw;text.setAttribute('aria-label','Unsent object text for '+draft.id);body.append(text);const open=button('Open text draft · '+label,()=>{selected=[draft.id];render();edit(draft.id);});open.disabled=!item||item.type!==draft.entry.type||!writable()||item.locked;button('Export unsent text · '+label,()=>download('mirra-unsent-object-text.json',draft.serialize(),'application/json'));button('Discard text draft · '+label,()=>{draft.remove();panel('object-drafts');});}const stored=draft.stored();if(stored!==null)button('Export stored text recovery · '+label,()=>download('mirra-object-recovery.txt',stored,'text/plain;charset=utf-8'));}button('Refresh text recovery',()=>panel('object-drafts'));}catch(error){body.textContent=error.message;}
  }
  if(name==='table-drafts'){
    try{let storage;try{storage=sessionStorage;}catch{}const scope=cloudSession?{mode:'cloud',userId:cloudSession.base.userId,boardId:cloudSession.base.id}:{mode:'device',boardId:library?.state.activeId||'unsaved'};const groups=listTableDrafts(storage,scope,[...tableDraftCache.values()]);if(!groups.length){const p=document.createElement('p');p.textContent='No unsent table drafts were found for this board in this tab.';body.append(p);}for(const group of groups){const item=board.doc.items.find(i=>i.id===group.context.tableId&&i.type==='table'),label=(item?.text||'Removed table')+' · '+group.context.tableId.slice(0,8),p=document.createElement('p');p.textContent=label+' · '+group.drafts.size+' unsent table edit(s)';body.append(p);if(group.drafts.storageError){const warning=document.createElement('p');warning.textContent=group.drafts.storageError;warning.setAttribute('role','alert');body.append(warning);}button('Review drafts · '+label,()=>openTable(group.context.tableId,{drafts:group.drafts}));if(group.raw!==null)button('Export stored recovery · '+label,()=>download('mirra-table-recovery.txt',group.raw,'text/plain;charset=utf-8'));}button('Refresh recovery list',()=>panel('table-drafts'));}
    catch(error){body.textContent=error.message;}
  }
  if(name==='menu'){
    button('Arrange frame sequence',()=>panel('frame-sequence'));
    button('Export or import a board',()=>$('exportdialog').showModal());button('Paste spreadsheet cells',()=>cellPaste.open('',lastPointer||world({clientX:innerWidth/2,clientY:innerHeight/2}),stickyFill,stickySize),{mutation:true});button('Manage sticky tags',()=>panel('tags'));button('Unsent table edits',()=>panel('table-drafts'));button('Unsent object text',()=>panel('object-drafts'));button('Unsent property edits',()=>panel('property-drafts'));button('Fit all objects',()=>fit());button('Toggle background grid',()=>{$('grid').hidden=!$('grid').hidden;$('grid').style.display=$('grid').hidden?'none':'';});
    button('Back to all boards',()=>showDashboard());button('Create another board',()=>createBoard());
    const p=document.createElement('p');p.textContent='Device boards stay in this browser. Cloud boards save to your private workspace.';body.append(p);
  }
}
document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>panel(b.dataset.panel));$('menu').onclick=()=>panel('menu');$('closepanel').onclick=closePanel;
function showFrame(index){const frames=board.doc.items.filter(i=>i.type==='frame'&&!i.parentId);if(!frames.length){toast('Add a frame before presenting.');return;}const starting=presentation<0;presentation=((index%frames.length)+frames.length)%frames.length;presentationId=frames[presentation].id;presentationGeometry=null;document.body.classList.add('presenting');$('presentation').hidden=false;$('panel').hidden=true;render();if(starting)$('nextframe').focus();}
function movePresentation(offset){const current=presentationFrame(board.doc.items,{id:presentationId,index:presentation},offset);if(current)showFrame(current.index);else endPresentation();}
function endPresentation(){const active=presentation>=0;presentation=-1;presentationId=null;presentationGeometry=null;document.body.classList.remove('presenting');$('presentation').hidden=true;render();if(active)$('present').focus();}
$('present').onclick=()=>showFrame(0);$('prevframe').onclick=()=>movePresentation(-1);$('nextframe').onclick=()=>movePresentation(1);$('endpresent').onclick=endPresentation;
document.addEventListener('keydown',e=>{
  if(e.defaultPrevented||$('workspace').hidden||e.target.closest('dialog'))return;const presentationAction=presentationKey(e,presentation>=0);if(presentationAction){e.preventDefault();if(presentationAction==='end')endPresentation();else if(presentationAction==='first')showFrame(0);else if(presentationAction==='last')showFrame(board.doc.items.filter(i=>i.type==='frame'&&!i.parentId).length-1);else movePresentation(presentationAction==='next'?1:-1);return;}
  if(e.key==='Escape'&&['frames','timer','voting','tags'].includes(currentPanel)&&!$('panel').hidden){e.preventDefault();closePanel();return;}
  if(e.target.closest('input,textarea,select,dialog,button,a,[role="button"],[contenteditable]:not([contenteditable="false"])'))return;const key=e.key.toLowerCase(),mod=e.ctrlKey||e.metaKey;
  if(!mod&&!e.altKey&&key==='m'&&presentation<0){e.preventDefault();if(!e.repeat)minimap.toggle();return;}
  if(key==='escape'){endGesture(true);endPresentation();selected=[];setTool('select');$('panel').hidden=true;return;}
  if(presentation>=0)return;
  if(!writable()&&!(mod&&['a','f','c'].includes(key))&&!(key==='c'&&canComment()))return;
  if(mod&&key==='z'){e.preventDefault();e.shiftKey?board.redo():board.undo();changed();return;}
  if(mod&&key==='a'){e.preventDefault();selected=board.doc.items.map(i=>i.id);render();return;}
  if(mod&&key==='d'){e.preventDefault();selected=board.duplicate(selected);changed();return;}
  if(mod&&key==='g'){e.preventDefault();try{selected=e.shiftKey?board.ungroup(selected):board.group(selected);changed();}catch(error){toast(error.message);}return;}
  if(mod&&key==='f'){e.preventDefault();panel('search');return;}
  if(!mod&&key==='c'&&canComment()){setTool('comment');return;}
  if(!writable())return;
  if(mod&&key==='backspace'){e.preventDefault();clearSelectedContent();return;}
  if(mod&&['b','i','u'].includes(key)&&selected.length){e.preventDefault();const prop={b:'bold',i:'italic',u:'underline'}[key],first=board.doc.items.find(i=>selected.includes(i.id));board.update(selected.filter(id=>!board.doc.items.find(i=>i.id===id)?.locked),{[prop]:!first[prop]});changed();return;}
  if(['delete','backspace'].includes(key)){e.preventDefault();deleteSelected();return;}
  if(e.key.startsWith('Arrow')&&selected.length){e.preventDefault();try{const d=e.shiftKey?10:1;board.move(selected,e.key==='ArrowLeft'?-d:e.key==='ArrowRight'?d:0,e.key==='ArrowUp'?-d:e.key==='ArrowDown'?d:0);changed();}catch(error){toast(error.message);}return;}
  if(key==='enter'&&e.target===canvas&&['sticky','text','shape','frame','card','table'].includes(tool)){e.preventDefault();createAt(tool,world({clientX:innerWidth/2,clientY:innerHeight/2}));return;}
  if(key==='enter'&&selected.length){edit(selected[0]);return;}
  const shortcut={v:'select',h:'hand',n:'sticky',t:'text',s:'shape',r:'shape',o:'shape',l:'connector',p:'pen',f:'frame',k:'card',d:'card',c:'comment'}[key];if(!mod&&shortcut){if(key==='r')creationShape='rectangle';if(key==='o')creationShape='ellipse';setTool(shortcut);if(key==='s')panel('shapes');if(key==='n')panel('stickies');if(key==='f')panel('frames');}
});
let dashView='recent',dashSpace=null;
function requestName(heading,value,maximum=500){
  return new Promise(resolve=>{$('nameheading').textContent=heading;$('namevalue').value=value;$('namevalue').maxLength=maximum;$('namedialog').returnValue='cancel';$('namedialog').addEventListener('close',()=>resolve($('namedialog').returnValue==='save'?$('namevalue').value.trim():null),{once:true});$('namedialog').showModal();$('namevalue').focus();$('namevalue').select();});
}
function libraryAction(fn){try{if(saveBlocked||!library)throw Error('Library unavailable. Export your work and reload.');fn();renderDashboard();return true;}catch(error){toast(error.message);return false;}}
async function openBoard(id,{saveCurrent=true}={}){
  if(!await leaveCloud())return;
  try{if(saveBlocked)throw Error('Export unsaved work and reload before switching boards.');if(saveCurrent&&!$('workspace').hidden&&library.state.activeId&&!persist())return;const entry=library.open(id);board=new Board(entry.doc);bindDeviceSaveStatus();selected=[];gesture=null;camera={x:100,y:100,z:1};$('dashboard').hidden=true;$('workspace').hidden=false;setRoute(`board/${id}`);document.title=`${entry.doc.name} · Mirra`;setTool('select');if(board.doc.items.length)fit();render();}
  catch(error){toast(error.message);}
}
async function showDashboard(){
  const wasCloud=Boolean(cloudSession);if(!await leaveCloud())return;
  if(!wasCloud&&!$('workspace').hidden&&library?.state.activeId&&!persist()){toast('Export unsaved changes before leaving this board.');return;}
  endPresentation();$('workspace').hidden=true;$('dashboard').hidden=false;$('panel').hidden=true;setRoute('home');document.title='Boards · Mirra';renderDashboard();
}
async function createBoard(){
  if(!await leaveCloud())return;
  const name=await requestName('Create a board','Untitled board');if(!name)return;
  if(!$('workspace').hidden&&library?.state.activeId&&!persist())return;
  let id;if(libraryAction(()=>id=library.create(name,dashSpace)))openBoard(id,{saveCurrent:false});
}
function renderDashboard(){
  $('dashtitle').textContent=dashSpace?library?.state.spaces.find(s=>s.id===dashSpace)?.name||'Space':{recent:'Recent boards',starred:'Starred boards',trash:'Trash'}[dashView];
  document.querySelectorAll('[data-view]').forEach(b=>{const active=!dashSpace&&b.dataset.view===dashView;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  $('spaces').replaceChildren();for(const space of library?.state.spaces||[]){const b=document.createElement('button');b.textContent=space.name;b.classList.toggle('active',space.id===dashSpace);b.setAttribute('aria-pressed',String(space.id===dashSpace));b.onclick=()=>{dashSpace=space.id;dashView='recent';renderDashboard();};$('spaces').append(b);}
  $('dashboardnotice').textContent=saveBlocked?'A newer tab or a storage error has stopped saving. Keep a backup before reloading.':dashView==='trash'?'Boards in trash stay recoverable on this device.':'Your boards are stored in this browser. Export backups to keep an additional copy.';
  if(saveBlocked){const recover=document.createElement('button');recover.textContent='Export library recovery file';recover.onclick=()=>{try{download('mirra-library-recovery.json',localStorage.getItem(LIBRARY_KEY)||'{}','application/json');}catch(error){toast(error.message);}};$('dashboardnotice').append(' ',recover);}
  $('boardlist').replaceChildren();const entries=library?.list({query:$('boardsearch').value,view:dashView,spaceId:dashSpace,sort:$('boardsort').value})||[];
  $('dashempty').hidden=entries.length>0;$('emptytitle').textContent=dashView==='trash'?'Trash is empty':$('boardsearch').value?'No matching boards':'No boards here yet';$('emptydescription').textContent=dashView==='starred'?'Star a board to find it quickly here.':dashView==='trash'?'Removed boards will appear here for recovery.':$('boardsearch').value?'Try a different board name.':'Create a board to give your ideas a place to grow.';
  for(const entry of entries){
    const article=document.createElement('article');article.className='boardcard';article.setAttribute('aria-label',entry.doc.name);
    const cover=document.createElement('button');cover.className='boardcover';cover.setAttribute('aria-label',`Open ${entry.doc.name}`);cover.disabled=entry.deletedAt!==null;cover.onclick=()=>openBoard(entry.id);
    const preview=el('svg',{viewBox:'0 0 320 150','aria-hidden':'true'});const items=entry.doc.items.filter(i=>!['connector','pen'].includes(i.type)),box=bounds(items);const scale=Math.min(280/(box.w||1),120/(box.h||1));
    for(const item of items.slice(0,150))preview.append(el('rect',{x:20+(item.x-box.x)*scale,y:15+(item.y-box.y)*scale,width:Math.max(2,item.w*scale),height:Math.max(2,item.h*scale),fill:item.fill,stroke:'#9ab2a5','stroke-width':.5,rx:2}));if(!items.length){const t=el('text',{x:160,y:80,'text-anchor':'middle',fill:'#768e80','font-size':14});t.textContent='A fresh canvas';preview.append(t);}cover.append(preview);article.append(cover);
    const heading=document.createElement('h2');heading.textContent=entry.doc.name;article.append(heading);const meta=document.createElement('p');meta.textContent=`${entry.doc.items.length} objects · ${new Date(entry.updatedAt).toLocaleDateString()}`;article.append(meta);
    const actions=document.createElement('div');actions.className='boardactions';const action=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;actions.append(b);return b;};
    if(entry.deletedAt!==null)action('Restore',()=>libraryAction(()=>library.restore(entry.id)));
    else{
      const star=action(entry.starred?'★ Starred':'☆ Star',()=>libraryAction(()=>library.star(entry.id)));star.setAttribute('aria-pressed',entry.starred);
      action('Rename',async()=>{const name=await requestName('Rename board',entry.doc.name);if(name)libraryAction(()=>library.rename(entry.id,name));});
      action('Copy',()=>libraryAction(()=>library.duplicate(entry.id)));
      action('Move to trash',()=>libraryAction(()=>library.trash(entry.id)));
      const label=document.createElement('label');label.textContent='Space ';const select=document.createElement('select');select.setAttribute('aria-label',`Space for ${entry.doc.name}`);const none=document.createElement('option');none.value='';none.textContent='No space';select.append(none);for(const space of library.state.spaces){const option=document.createElement('option');option.value=space.id;option.textContent=space.name;select.append(option);}select.value=entry.spaceId||'';select.onchange=()=>libraryAction(()=>library.move(entry.id,select.value||null));label.append(select);actions.append(label);
    }article.append(actions);$('boardlist').append(article);
  }
}
document.querySelectorAll('.brand').forEach(a=>a.onclick=e=>{e.preventDefault();showDashboard();});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{dashView=b.dataset.view;dashSpace=null;renderDashboard();});
$('boardsearch').oninput=renderDashboard;$('boardsort').onchange=renderDashboard;$('newboard').onclick=createBoard;
$('addspace').onclick=async()=>{const name=await requestName('Create a space','',200);if(name)libraryAction(()=>library.addSpace(name));};
async function leaveCloud(){
  if(!cloudSession)return true;
  try{await cloudSession.flush();cloudSession.close();cloudSession=null;cloudPeople=[];cloudComments={comments:[],userId:null};$('people').textContent='';board=library?.state.activeId?new Board(library.get().doc):new Board();bindDeviceSaveStatus();selected=[];return true;}catch(error){toast('Cloud changes need attention. Export your draft or reload the cloud version before leaving.');return false;}
}
function commentDraftKey(context){return scopedCommentDraftKey(cloudSession.base,commentClientId,context);}
function composeComment(context={}){
  if(!canComment()){toast('Comment permission is required.');return;}
  const anchor=selected.length===1?board.doc.items.find(i=>i.id===selected[0]):null,p=world({clientX:innerWidth/2,clientY:innerHeight/2});
  const initial={x:anchor?anchor.x+anchor.w/2:p.x,y:anchor?anchor.y:p.y,itemId:anchor?.id||null,...context};
  let saved;try{saved=readCommentDraft(localStorage,cloudSession.base,commentClientId,initial);}catch(error){toast(error.message);}
  commentContext=saved?.context||{...initial,id:crypto.randomUUID()};$('commenttext').value=saved?.text??context.text??'';$('commentheading').textContent=commentContext.editId?'Edit your comment':commentContext.parentId?'Reply to thread':'Add a comment';$('commenterror').textContent='';$('loadlatestcomment').hidden=true;$('commentrecovery').hidden=!commentContext.previousText;$('previouscommentdraft').value=commentContext.previousText||'';$('commentdialog').showModal();$('commenttext').focus();
}
function keepCommentDraft(){if(!cloudSession||!commentContext)return;try{saveCommentDraft(localStorage,cloudSession.base,commentClientId,commentContext,$('commenttext').value);}catch{toast('Could not keep the comment draft on this device.');}}
$('commenttext').oninput=keepCommentDraft;$('cancelcomment').onclick=()=>{keepCommentDraft();$('commentdialog').close();};$('commentdialog').addEventListener('cancel',keepCommentDraft);
$('commentform').onsubmit=async event=>{
  event.preventDefault();if(!canComment()){$('commenterror').textContent='Comment permission changed. Copy your draft before closing.';keepCommentDraft();return;}const button=$('publishcomment');if(button.disabled)return;button.disabled=true;$('commenttext').readOnly=true;keepCommentDraft();
  const context=commentContext;
  try{const path=`boards/${cloudSession.base.id}/comments${context.editId?'/'+context.editId:''}`,body=context.editId?{text:$('commenttext').value,beforeText:context.beforeText??context.text}:{id:context.id,text:$('commenttext').value,parentId:context.parentId||null,itemId:context.itemId||null,x:context.x,y:context.y};cloudComments=await cloudRequest(path,{method:context.editId?'PATCH':'POST',body});renderCommentMarkers();if(commentContext!==context||!$('commentdialog').open)return;localStorage.removeItem(commentDraftKey(context));$('commentdialog').close();panel('comments');}
  catch(error){if(commentContext===context){$('commenterror').textContent=error.message;$('loadlatestcomment').hidden=!(context.editId&&[400,409].includes(error.status));}}finally{button.disabled=false;$('commenttext').readOnly=false;}
};
$('loadlatestcomment').onclick=async()=>{const context=commentContext;if(!context?.editId)return;const button=$('loadlatestcomment');button.disabled=true;try{const data=await cloudRequest(`boards/${cloudSession.base.id}/comments`);if(commentContext!==context||!$('commentdialog').open)return;const current=data.comments.find(c=>c.id===context.editId&&!c.deleted_at);if(!current)throw Error('This comment was removed. Copy your draft before closing.');const previousText=$('commenttext').value;commentContext={...context,text:current.body,beforeText:current.body,previousText};$('previouscommentdraft').value=previousText;$('commentrecovery').hidden=false;$('commenttext').value=current.body;$('commenterror').textContent='Latest comment loaded. Your previous draft is below for merging.';button.hidden=true;keepCommentDraft();}catch(error){if(commentContext===context)$('commenterror').textContent=error.message;}finally{button.disabled=false;}};
function renderCommentPanel(){
  if(!cloudSession)return;const container=$('panelbody'),scroll=$('panel').scrollTop;container.replaceChildren();
  const controls=document.createElement('div');controls.className='comment-controls';const add=document.createElement('button');add.textContent='New comment';add.disabled=!canComment();add.onclick=()=>composeComment();controls.append(add);const label=document.createElement('label'),toggle=document.createElement('input');toggle.type='checkbox';toggle.checked=showResolved;toggle.onchange=()=>{showResolved=toggle.checked;renderCommentPanel();};label.append(toggle,' Show resolved');controls.append(label);container.append(controls);
  const roots=cloudComments.comments.filter(c=>!c.parent_id&&(showResolved||!c.resolved));
  if(!roots.length){const empty=document.createElement('p');empty.textContent='No open discussions. Add a comment to begin.';container.append(empty);}
  const mutate=async(path,method,body)=>{try{cloudComments=await cloudRequest(`boards/${cloudSession.base.id}/comments/${path}`,{method,body});renderCommentPanel();renderCommentMarkers();}catch(error){toast(error.message);}};
  for(const [index,root]of roots.entries()){
    const thread=document.createElement('article');thread.className='comment-thread';thread.dataset.threadId=root.id;
    const head=document.createElement('h3');head.textContent=`Thread ${index+1}${root.resolved?' · Resolved':''}`;thread.append(head);
    const locate=document.createElement('button');locate.textContent='Show on canvas';locate.onclick=()=>{const item=board.doc.items.find(i=>i.id===root.item_id);fit(item?[item]:[{x:root.x,y:root.y,w:100,h:100}]);};thread.append(locate);
    for(const comment of [root,...cloudComments.comments.filter(c=>c.parent_id===root.id)]){
      const entry=document.createElement('div');entry.className='comment-entry';const by=document.createElement('small');by.textContent=`${comment.author_name} · ${new Date(comment.created_at).toLocaleString()}`;const text=document.createElement('p');text.textContent=comment.deleted_at?'Removed comment':comment.body;entry.append(by,text);
      if(!comment.deleted_at&&canComment()){
        if(comment.author_id===cloudComments.userId){const editButton=document.createElement('button');editButton.textContent='Edit';editButton.setAttribute('aria-label',`Edit comment by ${comment.author_name}`);editButton.onclick=()=>composeComment({editId:comment.id,text:comment.body,beforeText:comment.body,x:comment.x,y:comment.y,itemId:comment.item_id,parentId:comment.parent_id});entry.append(editButton);}
        if(comment.author_id===cloudComments.userId||cloudSession.base.role==='owner'){const remove=document.createElement('button');remove.textContent='Remove';remove.onclick=()=>mutate(comment.id,'DELETE',{});entry.append(remove);}
      }thread.append(entry);
    }
    if(!root.deleted_at){const reply=document.createElement('button');reply.textContent='Reply';reply.setAttribute('aria-label',`Reply to thread ${index+1}`);reply.disabled=!canComment();reply.onclick=()=>composeComment({parentId:root.id,x:root.x,y:root.y,itemId:root.item_id});const resolve=document.createElement('button');resolve.textContent=root.resolved?'Reopen':'Resolve';resolve.setAttribute('aria-label',`${root.resolved?'Reopen':'Resolve'} thread ${index+1}`);resolve.disabled=!canComment();resolve.onclick=()=>mutate(root.id+'/resolve','POST',{resolved:!root.resolved});thread.append(reply,resolve);}container.append(thread);
  }$('panel').scrollTop=scroll;
}
async function openCloud(id,{discardDraft=false}={}){
  if(cloudSession&&cloudSession.base.id!==id&&!await leaveCloud())return;
  if(!cloudSession&&!$('workspace').hidden&&library?.state.activeId&&!persist())return;
  try{
    const snapshot=await cloudRequest(`boards/${id}`);cloudSession?.close();board=new Board(snapshot.doc);selected=[];gesture=null;deferredCloud=null;
    const statusSource={};let statusSession=null;saveStatus.select(statusSource,'Connecting to cloud…');
    cloudSession=statusSession=new CloudSession(snapshot,{
      saveDraft:(base,doc)=>saveCloudDraft(localStorage,base,doc,commentClientId),
      onDocument(doc){
        if(gesture&&['move','resize'].includes(gesture.type)){deferredCloud=doc;return;}
        const delta=changesBetween(board.doc,doc);
        for(const key of ['past','future'])board[key]=board[key].flatMap(previous=>{try{return[applyChanges(previous,delta)];}catch{return[];}});
        board.doc=doc;selected=selected.filter(id=>doc.items.some(i=>i.id===id));render();
      },
      onStatus(message){if(!saveStatus.update(statusSource,message))return;if(statusSession&&cloudSession===statusSession){if(gesture&&['move','resize','pen'].includes(gesture.type)&&!writable())endGesture(true);else render();}},
      getViewport:()=>follow.getViewport(),getFollowing:()=>follow.getFollowing(),
      onAttention(data){if(presentation>=0)endPresentation();if(follow.receive(data))toast((cloudPeople.find(person=>person.client_id===data.from)?.name||'A collaborator')+' brought you to their view. Navigate to stop following.');render();},
      onPresence(people){cloudPeople=people;if(follow.refresh())render();else renderPresence();},
      onComments(data){cloudComments=data;renderCommentMarkers();if(currentPanel==='comments'&&!$('panel').hidden)renderCommentPanel();},
      onVoting(){if(currentPanel==='voting'&&!$('panel').hidden)void votingPanel?.refresh();}
    });
    let draft=null;try{draft=readCloudDraft(localStorage,snapshot,commentClientId);if(!draft&&listCloudDrafts(localStorage,snapshot,{excludeContext:commentClientId}).some(entry=>entry.error||!equal(entry.doc,snapshot.doc)))toast('Other device backups are available in Cloud. Review them before restoring.');}catch(error){toast(error.message);}
    if(!discardDraft&&draft&&!equal(draft.doc,snapshot.doc)){if(draft.revision===snapshot.revision&&cloudSession.canEdit){board=new Board(draft.doc);cloudSession.setDocument(board.doc);toast('Restored your unsaved device draft.');}else toast('A previous device draft exists. Export it from Cloud before replacing it.');}
    $('workspace').hidden=false;$('dashboard').hidden=true;$('clouddialog').close();setRoute('cloud/'+id);document.title=board.doc.name+' · Mirra Cloud';setTool('select');fit();render();
  }catch(error){$('cloudstatus').textContent=error.message;toast(error.message);}
}
function setMemberControls(){
 const allowed=cloudSession&&!cloudSession.closed&&!cloudSession.conflict&&cloudSession.base.role==='owner';
 document.querySelectorAll('#memberform input,#memberform select,#memberform button,#memberlist button').forEach(node=>node.disabled=memberMutationInProgress||!allowed);
 $('cloudmembers').setAttribute('aria-busy',String(memberMutationInProgress));
}
async function refreshBoardMembers(source,generation){
 const {members}=await cloudRequest('boards/'+source.base.id+'/members',{userId:source.base.userId});
 if(source!==cloudSession||generation!==cloudDialogGeneration||!$('clouddialog').open)return;
 $('memberlist').replaceChildren();for(const member of members){const row=document.createElement('div');row.textContent=member.email+' · '+member.role+' ';const remove=document.createElement('button');remove.textContent='Remove';remove.setAttribute('aria-label','Remove access for '+member.email);remove.onclick=()=>updateBoardAccess({method:'DELETE',email:member.email});row.append(remove);$('memberlist').append(row);}setMemberControls();
}
async function updateBoardAccess({method,email,role}){
 if(memberMutationInProgress)return false;
 const source=cloudSession,generation=cloudDialogGeneration,dialog=$('clouddialog');
 if(!source||source.closed||source.conflict||source.base.role!=='owner'){$('cloudstatus').textContent='Owner access is required. Reload before changing board access.';return false;}
 memberMutationInProgress=true;setMemberControls();if(dialog.open)$('cloudstatus').textContent='Updating board access…';let updated=false;
 try{
  await cloudRequest('boards/'+source.base.id+'/members',{method,userId:source.base.userId,body:{email,...(method==='POST'?{role}:{})}});updated=true;
  if(source===cloudSession&&dialog.open){const visibleGeneration=cloudDialogGeneration;await refreshBoardMembers(source,visibleGeneration);if(source===cloudSession&&visibleGeneration===cloudDialogGeneration&&dialog.open)$('cloudstatus').textContent='Board access updated.';}
  else toast('Board access updated.');return true;
 }catch(error){const message=updated?'Board access was updated, but the list could not refresh: '+error.message:error.message;if(source===cloudSession&&generation===cloudDialogGeneration&&dialog.open)$('cloudstatus').textContent=message;else toast('Board access update: '+message);return false;}
 finally{memberMutationInProgress=false;setMemberControls();}
}
async function showCloud(){
  const generation=++cloudDialogGeneration;
  cloudBackups.reset();
  $('clouddialog').showModal();$('cloudstatus').textContent='Connecting…';$('cloudboards').replaceChildren();$('uploadcloud').disabled=true;$('reloadcloud').disabled=!cloudSession;$('cloudmembers').hidden=cloudSession?.base.role!=='owner';setMemberControls();
  let hasLegacy=false;try{hasLegacy=Boolean(cloudSession&&localStorage.getItem('mirra.cloud.draft.'+cloudSession.base.id));}catch{}legacyDraftExport.hidden=legacyDraftNotice.hidden=!hasLegacy;
  try{
    const {user}=await cloudRequest('me');if(cloudSession&&!cloudSession.acceptUser(user.id)){$('cloudmembers').hidden=true;throw cloudSession.conflict;}cloudUser=user;cloudBackups.refresh();$('uploadcloud').disabled=cloudUploadInProgress||$('workspace').hidden||Boolean(cloudSession);$('cloudstatus').textContent=`Signed in as ${user.email}. Cloud boards are stored on the server.`;
    const {boards}=await cloudRequest('boards');for(const entry of boards){const b=document.createElement('button');b.textContent=`${entry.name} · ${entry.role}`;b.onclick=()=>openCloud(entry.id);$('cloudboards').append(b);}
    if(!boards.length)$('cloudboards').textContent='No cloud boards yet. Open a local board and save it to cloud.';
    if(cloudSession?.base.role==='owner'){
      await refreshBoardMembers(cloudSession,generation);
    }
  }catch(error){$('cloudstatus').textContent='Cloud connection unavailable. Use the hosted workspace and sign in to connect.';const signIn=document.createElement('a'),staticPreview=['127.0.0.1','localhost'].includes(location.hostname)&&location.port==='4173';signIn.href=staticPreview?'<SITE_ORIGIN>':'/signin-with-chatgpt?return_to=/public/index.html';signIn.target='_top';signIn.textContent=staticPreview?'Open your private cloud workspace':'Sign in for cloud access';$('cloudboards').append(signIn);}
}
$('cloud').onclick=showCloud;$('cloudhome').onclick=showCloud;$('closecloud').onclick=()=>$('clouddialog').close();$('refreshcloud').onclick=()=>{$('clouddialog').close();void showCloud();};
$('uploadcloud').onclick=async()=>{if(cloudUploadInProgress||cloudSession||$('workspace').hidden)return;cloudUploadInProgress=true;$('uploadcloud').disabled=true;const source=board,doc=structuredClone(board.doc);try{const intent=await prepareCloudUpload(localStorage,{userId:cloudUser?.id,sourceId:library?.state.activeId||'recovery-board'},doc);const snapshot=await cloudRequest('boards',{method:'POST',userId:intent.userId,body:{doc:intent.doc,operationId:intent.operationId}});if(snapshot.operationId!==intent.operationId)throw Error('Cloud creation was not confirmed. Retry this save.');if(board===source&&!cloudSession&&equal(board.doc,doc)&&$('clouddialog').open){await openCloud(snapshot.id);if(!snapshot.created)toast('Opened the cloud copy saved earlier.');}else toast('Saved a cloud copy. Open it from Cloud boards.');}catch(error){$('cloudstatus').textContent=error.message;if(!$('clouddialog').open)toast(error.message);}finally{cloudUploadInProgress=false;$('uploadcloud').disabled=$('workspace').hidden||Boolean(cloudSession);}};
$('reloadcloud').onclick=()=>{if(cloudSession)void openCloud(cloudSession.base.id,{discardDraft:true});};
const draftExport=document.createElement('button');draftExport.textContent='Export this tab’s device backup';draftExport.onclick=()=>{try{if(!cloudSession)throw Error('Open a cloud board first');const draft=readCloudDraft(localStorage,cloudSession.base,commentClientId);if(!draft)throw Error('No device backup is stored for this tab, account and board');download('mirra-cloud-draft.json',JSON.stringify(draft.doc),'application/json');}catch(error){$('cloudstatus').textContent=error.message;}};$('clouddialog').querySelector('.dialogbuttons').append(draftExport);
const cloudBackups=mountCloudBackups({parent:$('clouddialog'),storage:()=>localStorage,getSession:()=>cloudSession,context:()=>commentClientId,download});
const legacyDraftNotice=document.createElement('p');legacyDraftNotice.id='legacy-draft-notice';legacyDraftNotice.textContent='An older device draft has no account label and will not restore automatically. Export it only if it belongs to you.';legacyDraftNotice.hidden=true;
const legacyDraftExport=document.createElement('button');legacyDraftExport.textContent='Export older device draft';legacyDraftExport.setAttribute('aria-describedby',legacyDraftNotice.id);legacyDraftExport.hidden=true;legacyDraftExport.onclick=()=>{try{if(!cloudSession)throw Error('Open a cloud board first');const draft=readLegacyCloudDraft(localStorage,cloudSession.base.id);if(!draft)throw Error('No older draft exists for this board');download('mirra-older-device-draft.json',JSON.stringify(draft.doc),'application/json');}catch(error){$('cloudstatus').textContent=error.message;}};$('clouddialog').append(legacyDraftNotice,legacyDraftExport);
$('memberform').onsubmit=async event=>{event.preventDefault();await updateBoardAccess({method:'POST',email:$('memberemail').value,role:$('memberrole').value});};
window.addEventListener('beforeunload',event=>{if(cloudSession&&!equal(cloudSession.base.doc,board.doc)){event.preventDefault();event.returnValue='';}});
window.addEventListener('pagehide',()=>cloudSession?.close());
window.addEventListener('pageshow',event=>{if(event.persisted&&cloudSession?.closed)void openCloud(cloudSession.base.id);});
window.addEventListener('storage',e=>{if(e.key===LIBRARY_KEY){saveBlocked=true;if(!cloudSession){saveStatus.update(deviceStatusSource,'Changed in another tab');toast('Another tab changed your board library. Export unsaved work, then reload.');}if(!$('dashboard').hidden)renderDashboard();}});
function displayedRoute(){return!$('dashboard').hidden?'#home':cloudSession?'#cloud/'+cloudSession.base.id:'#board/'+library.state.activeId;}
const historyNavigation=new HistoryNavigation({current:displayedRoute,getHash:()=>location.hash,openBoard,openCloud,home:showDashboard,restore:hash=>history.replaceState(null,'',hash),onError:error=>toast(error.message)});
function setRoute(route){if(!historyNavigation.active&&location.hash!=='#'+route)history.pushState(null,'','#'+route);}
window.addEventListener('hashchange',()=>{for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();endGesture(true);endPresentation();void historyNavigation.navigate(location.hash);});
window.addEventListener('resize',render);render();
const requested=location.hash.match(/^#board\/(.+)$/)?.[1];
if(storageError){bindDeviceSaveStatus();toast('Your existing library was preserved. Use Export to save new work; reload after fixing storage.');}
else if(requested){openBoard(requested);}
else{$('workspace').hidden=true;$('dashboard').hidden=false;document.title='Boards · Mirra';renderDashboard();}
const requestedCloud=location.hash.match(/^#cloud\/(.+)$/)?.[1];if(requestedCloud)void openCloud(requestedCloud);





