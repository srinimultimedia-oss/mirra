import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
test('additive follow migration preserves boards, presence identity, cursor and expiry',()=>{
 const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON');
 const files=readdirSync(new URL('../cloud/drizzle',import.meta.url)).filter(f=>f.endsWith('.sql')).sort();
 for(const file of files.filter(f=>Number(f.slice(0,4))<5))db.exec(readFileSync(new URL('../cloud/drizzle/'+file,import.meta.url),'utf8'));
 db.prepare('INSERT INTO boards(id,owner_id,document,revision,updated_at) VALUES(?,?,?,?,?)').run('board','alice','{"items":[]}',7,100);
 db.prepare('INSERT INTO presence(board_id,client_id,user_id,name,x,y,seen_at) VALUES(?,?,?,?,?,?,?)').run('board','client','alice','Alice',12,-34,567);
 const before={...db.prepare('SELECT * FROM boards').get()};
 db.exec(readFileSync(new URL('../cloud/drizzle/'+files.find(f=>f.startsWith('0005_')),import.meta.url),'utf8'));
 assert.deepEqual({...db.prepare('SELECT * FROM boards').get()},before);
 assert.deepEqual({...db.prepare('SELECT * FROM presence').get()},{board_id:'board',client_id:'client',user_id:'alice',name:'Alice',x:12,y:-34,seen_at:567,viewport:null,following_client_id:null});
 db.prepare('UPDATE presence SET viewport=?,following_client_id=?').run('{"x":0,"y":0,"w":800,"h":600}','leader');
 assert.equal(db.prepare('SELECT revision FROM boards').get().revision,7);
 db.prepare('DELETE FROM boards WHERE id=?').run('board');assert.equal(db.prepare('SELECT count(*) AS n FROM presence').get().n,0);db.close();
});

