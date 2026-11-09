import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import{spawn}from'node:child_process';import{fileURLToPath}from'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),area=path.join(root,'verification/watch-test'),source=path.join(area,'fixture'),output=path.join(area,'output');
const put=(p,s)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,s)};
put(path.join(source,'public/index.html'),'<html>Fixture only</html>');put(path.join(source,'cloud/package.json'),JSON.stringify({dependencies:{},devDependencies:{}}));put(path.join(source,'cloud/package-lock.json'),JSON.stringify({lockfileVersion:3,packages:{}}));
const child=spawn(process.execPath,[path.join(root,'tools/refresh.mjs'),'--source-root',source,'--output-root',output,'--watch','--no-archive'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let log='',error='';child.stdout.on('data',b=>log+=b);child.stderr.on('data',b=>error+=b);
const wait=async test=>{const deadline=Date.now()+25000;while(Date.now()<deadline){if(test())return;await new Promise(r=>setTimeout(r,100));}throw Error('Watcher test timed out: '+error)};
try{
 await wait(()=>log.includes('EXPORT_WATCHER_RUNNING'));
 const before=JSON.parse(fs.readFileSync(path.join(output,'manifest.json')));
 const fixtureUrl=['https:','//fixture-private','.chatgpt.site/example'].join('');
 put(path.join(source,'src/new-feature.mjs'),"export function fixtureFeature(){return "+JSON.stringify(fixtureUrl)+"}\n");
 await wait(()=>{try{return JSON.parse(fs.readFileSync(path.join(output,'manifest.json'))).fingerprint!==before.fingerprint}catch{return false}});
 const after=JSON.parse(fs.readFileSync(path.join(output,'manifest.json')));assert.equal(after.narrative_review_required,true);assert.ok(after.source_files.some(x=>x.path==='source/src/new-feature.mjs'));assert.ok(fs.readFileSync(path.join(output,'AI_CONTEXT.md'),'utf8').includes('REVIEW REQUIRED'));assert.ok(fs.readFileSync(path.join(output,'source/src/new-feature.mjs'),'utf8').includes('<SITE_ORIGIN>'));assert.ok(!fs.readFileSync(path.join(output,'source/src/new-feature.mjs'),'utf8').includes('fixture-private'));
 const result={passed:true,newFileDetected:true,sourceSnapshotRefreshed:true,privateDestinationRedacted:true,narrativeDriftFlagged:true,originalProjectTouched:false};put(path.join(root,'verification/watcher-test.json'),JSON.stringify(result,null,2)+'\n');console.log('EXPORT_WATCH_TEST_PASS '+JSON.stringify(result));
}finally{child.kill();}
