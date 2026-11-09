import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>readFileSync(resolve(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const require=createRequire(resolve(root,'cloud/package.json'));
const semver=require('semver');
const original=json('replica/checkmarx-findings.json');
const lock=json('cloud/package-lock.json');
assert.equal(original.sca.length,99);
const minimum={'react-server-dom-webpack':'19.3.1',sharp:'0.35.5','source-map-js':'1.2.2',undici:'7.30.2',zod:'4.6.7',esbuild:'0.28.2',ws:'8.22.2','image-size':'2.1.0','js-yaml':'4.3.2',next:'16.5.0-canary.45',browserslist:'4.29.5',vite:'8.3.6','baseline-browser-mapping':'2.11.35','fast-uri':'3.1.9','@babel/core':'7.29.6',debug:'4.4.3'};
const installations=name=>Object.entries(lock.packages).filter(([path])=>path.endsWith('node_modules/'+name)).map(([path,entry])=>{
  const actual=json('cloud/'+path+'/package.json');
  assert.equal(actual.version,entry.version,path+' installed version differs from lock');
  if(entry.name)assert.equal(actual.name,entry.name);
  return {path,name:actual.name,version:actual.version};
});
const patchPath='cloud/node_modules/picomatch/lib/parse.js';
assert.equal(read(patchPath),read('cloud/vendor/picomatch/lib/parse.js'),'Installed glob patch differs from reviewed source');
assert.match(read(patchPath),/singleBranchRisk = branches.length === 1 && hasUnboundedStar/);
const patchSha256=createHash('sha256').update(read(patchPath)).digest('hex');
const sca=original.sca.map(finding=>{
  const current=installations(finding.package);
  let disposition='updated';let evidence='All resolved copies meet the selected patched version floor.';
  if(finding.package==='braces'){
    assert.ok(current.every(x=>semver.gte(x.version,'3.0.3')));
    disposition='withdrawn-upstream-requires-triage';
    evidence='GHSA-vfj7-8cjw-p6xm was withdrawn by GitHub on 2026-10-23 as not practically exploitable. Request Checkmarx security triage; no clean Checkmarx result is claimed.';
  }else if(finding.package==='uri-js'){
    assert.ok(current.length>0);assert.ok(current.every(x=>x.name==='fast-uri'&&semver.gte(x.version,'3.1.9')));
    disposition='replaced';evidence='Original uri-js implementation replaced with fast-uri alias; Unicode termination and actual AJV6 relative-reference compatibility tests pass.';
  }else if(finding.package==='fflate'){
    assert.equal(current.length,0);disposition='removed';
    evidence='External ZIP dependency/API removed using audited self-contained font/OG runtime packages. Compressed WOFF parsing and real PNG rendering tests pass; no unzipSync API remains in these bundles.';
    for(const p of ['cloud/vendor/opentype/dist/opentype.js','cloud/vendor/vercel-og/dist/index.node.js','cloud/vendor/vercel-og/dist/index.edge.js'])assert.doesNotMatch(read(p),/unzipSync|function unzip\s*\(/);
  }else if(finding.package==='picomatch'){
    assert.ok(current.length>0);assert.ok(current.every(x=>x.version==='4.0.7+mirra.security.1'));
    disposition='locally-patched-requires-review';evidence='Auditable single-branch repeated-extglob guard; reproduced exploit now terminates in a 2-second isolated-process regression, including disabled optional recursion guard. Not an upstream release. Installed parse.js SHA256 '+patchSha256;
  }else if(!current.length){disposition='removed';evidence='Component absent from the resolved installed dependency tree.';
  }else{
    for(const item of current){
      let floor=minimum[finding.package];
      if(finding.package==='brace-expansion')floor=semver.major(item.version)===1?'1.1.21':'5.0.12';
      if(finding.package==='minimatch')floor=semver.major(item.version)<7?'3.1.5':'11.0.5';
      assert.ok(floor,'Missing verification rule for '+finding.package);
      assert.ok(semver.gte(item.version,floor),item.path+' below '+floor);
    }
  }
  return {...finding,current,disposition,evidence};
});
const sast=[
 {id:'-1336301462',type:'Python input controls loop',file:'.agents/skills/replica-entrepreneur/reviews.py',evidence:'Bounded bytes/themes/pattern count/pattern length/total count; fixed range loops; 3 Python negative and compatibility tests pass.'},
 {id:'1833334604',type:'JavaScript input controls loop',file:'src/model.mjs',evidence:'Explicit MAX_BOARD_ITEMS traversal bound and early 100000-item cap; cycle/oversize regressions and 10000-frame validation, 30000-frame containment/descendant scale checks pass.'},
 {id:'781281479',type:'Missing HSTS',file:'scripts/qa-artifact-preview.mjs',evidence:'Shared HSTS max-age=31536000; includeSubDomains on success/error preview responses, Worker API and static asset policy.'},
 {id:'1304887931',type:'Missing CSP',file:'scripts/qa-artifact-preview.mjs',evidence:'Shared CSP default/script self, object none, base none, frame-ancestors self; preview success/error tests and production asset/API responses verified.'}
].map(x=>({...x,disposition:'source-remediated-pending-rescan'}));
const audit=json('replica/checkmarx-npm-audit.json');assert.equal(audit.metadata.vulnerabilities.total,0);
assert.match(read('replica/checkmarx-tests.log'),/tests 536/);
assert.match(read('replica/checkmarx-tests.log'),/fail 0/);
assert.match(read('replica/checkmarx-typescript.log'),/TypeScript exit: 0/);
assert.match(read('replica/checkmarx-build.log'),/Build complete/);
const report={scanId:original.scanId,sourceReportSha256:original.sourceSha256,generatedAt:new Date().toISOString(),checkmarxRescanPerformed:false,certifiedCompliant:false,validation:{nodeTests:536,pythonTests:3,npmAudit:audit.metadata.vulnerabilities,typescript:'passed',productionBuild:'passed'},sca,sast};
writeFileSync(resolve(root,'replica/checkmarx-remediation.json'),JSON.stringify(report,null,2)+'\n');
const counts=Object.fromEntries([...new Set(sca.map(x=>x.disposition))].map(s=>[s,sca.filter(x=>x.disposition===s).length]));
const lines=['# Checkmarx remediation record','',`Source scan: ${original.scanId}; 99 SCA and 4 SAST findings. Source report SHA256: ${original.sourceSha256}.`,'','All actionable source and dependency findings have local remediation evidence. This is not a Checkmarx compliance certificate. A new scan of this corrected source and lockfile is required. One upstream-withdrawn braces advisory needs Checkmarx triage, and the local picomatch patch needs security review because version-only scanners may still flag it. Do not suppress findings without security approval.','','Validation: clean installation, 536 Node tests, 3 Python tests, TypeScript, production build and dependency-tree validation passed. Fresh npm audit reports zero vulnerabilities. Npm advisory coverage differs from Checkmarx.','','Local runtime package changes and licenses are documented in cloud/vendor/SECURITY-PATCHES.md. Keep the local patch until a verified upstream fix replaces it; rerun the isolated exploit and font/PNG compatibility tests on upgrades.','','## SCA findings','', '| Result ID | Component / scanned | CVE | Current versions | Disposition |','| --- | --- | --- | --- | --- |',...sca.map(x=>`| ${x.id} | ${x.package} ${x.scannedVersion} | ${x.cve} | ${[...new Set(x.current.map(p=>p.name+' '+p.version))].join(', ')||'Absent'} | ${x.disposition} |`),'','## SAST findings','',...sast.map(x=>`- ${x.id}: ${x.type}; ${x.file}. ${x.evidence}`),'','## Upstream exceptions and local changes','',...sca.filter(x=>!['updated','removed'].includes(x.disposition)).map(x=>`- ${x.id} (${x.cve}): ${x.evidence} ${(x.references||[]).join(' ')}`),'','Rerun: node scripts/checkmarx-security-check.mjs after the audit and regression suite. The accompanying JSON preserves every finding and installed path.'];
writeFileSync(resolve(root,'replica/checkmarx-remediation.md'),lines.join('\n')+'\n');
console.log('CHECKMARX_REMEDIATION_PASS '+JSON.stringify({sca:sca.length,sast:sast.length,dispositions:counts,npmAudit:0,checkmarxRescanRequired:true}));
