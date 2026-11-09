import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../',import.meta.url));
const git=(...args)=>execFileSync('git',args,{cwd,encoding:'utf8',maxBuffer:30e6}).trim();
const entries=git('ls-files','--stage','-z').split('\0').filter(Boolean).map(row=>{
 const [meta,path]=row.split('\t');const [mode,sha,stage]=meta.split(' ');return {mode,sha,stage,path};
});
const cloud=entries.filter(x=>x.path.startsWith('cloud/'));
assert.ok(cloud.length>200,'Cloud application is missing from scan source');
assert.ok(cloud.every(x=>x.mode==='100644'&&x.stage==='0'),'Cloud files must be regular, unconflicted blobs, not a submodule');
assert.ok(!entries.some(x=>x.path==='cloud'&&x.mode==='160000'),'Cloud cannot be a Git submodule');
for(const entry of cloud){
 assert.doesNotMatch(entry.path,/(^|\/)(\.git|node_modules|\.wrangler|\.sites-runtime|\.env[^/]*|\.dev.vars[^/]*)(\/|$)/,'Unexpected local state: '+entry.path.replace(/[^/]+$/,'[file]'));
 assert.doesNotMatch(entry.path,/^cloud\/(dist|\.next|\.vinext|out)\//,'Generated application build is tracked');
}
assert.ok(!entries.some(x=>/^replica\/.*\.(tar\.gz|tgz|zip)$/.test(x.path)),'Historical archives remain tracked scan inputs');
for(const name of ['cloud/package.json','cloud/package-lock.json','cloud/vendor/picomatch-4.0.7+mirra.security.1.tgz','cloud/vendor/shuding-opentype.js-1.4.0-beta.0.tgz','cloud/vendor/vercel-og-1.0.3+mirra.runtime.2.tgz'])assert.ok(cloud.some(x=>x.path===name),name+' missing');
const manifest=JSON.parse(git('show',':cloud/package.json'));
const lock=JSON.parse(git('show',':cloud/package-lock.json'));
for(const [name,version]of Object.entries({next:'16.5.0-canary.45',vite:'8.3.6','react-server-dom-webpack':'19.3.1',zod:'4.6.7',wrangler:'4.158.0'})){
 assert.equal(manifest.dependencies?.[name]||manifest.devDependencies?.[name],version);
 assert.equal(lock.packages['node_modules/'+name]?.version,version);
}
for(const name of ['serialize-javascript','flat','inflight','fflate'])assert.ok(!Object.keys(lock.packages).some(x=>x.endsWith('node_modules/'+name)),name+' remains in current lockfile');
// When the private hosting checkout exists, compare exact content-addressed files.
// A fresh GitHub clone has no nested metadata and needs no hosting credentials.
if(existsSync(new URL('../cloud/.git',import.meta.url))){
 const hosted=git('-C','cloud','ls-tree','-r','-z','HEAD').split('\0').filter(Boolean).map(row=>{const [meta,path]=row.split('\t');return {sha:meta.split(' ')[2],path:'cloud/'+path};});
 assert.equal(cloud.length,hosted.length,'Cloud file inventory differs from tested hosting source');
 const index=new Map(cloud.map(x=>[x.path,x.sha]));for(const file of hosted)assert.equal(index.get(file.path),file.sha,file.path+' differs from tested hosting source');
}
console.log('SCAN_SOURCE_PASS '+JSON.stringify({cloudFiles:cloud.length,regularFiles:true,oldArchivesTracked:false,correctedLockfile:true}));
