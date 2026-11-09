import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>readFileSync(resolve(root,p),'utf8');
const hash=p=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex');
const lock=JSON.parse(read('cloud/package-lock.json'));
const copies=Object.entries(lock.packages).filter(([path])=>path.endsWith('node_modules/braces'));
assert.ok(copies.length>0);
for(const [path,entry]of copies){
 assert.equal(entry.version,'3.0.3+mirra.security.1');
 assert.equal(JSON.parse(read('cloud/'+path+'/package.json')).version,entry.version);
 for(const file of ['parse.js','compile.js','expand.js','stringify.js','security.js'])assert.equal(hash('cloud/'+path+'/lib/'+file),hash('cloud/vendor/braces/lib/'+file),'Installed brace guard differs: '+file);
}
assert.doesNotMatch(read('cloud/components/ui/sidebar.tsx'),/document\.cookie\s*=/);
assert.match(read('cloud/components/ui/sidebar.tsx'),/writeSidebarPreference\(window\.localStorage/);
assert.match(read('replica/remaining-tests.log'),/tests 540/);
assert.match(read('replica/remaining-tests.log'),/fail 0/);
assert.match(read('replica/remaining-typescript.log'),/TypeScript exit: 0/);
assert.match(read('replica/remaining-build.log'),/Build complete/);
const audit=JSON.parse(read('replica/remaining-npm-audit.json'));assert.equal(audit.metadata.vulnerabilities.total,0);
const report={scanId:'a57247ed-4c02-4f91-839b-8c34539c861f',generatedAt:new Date().toISOString(),nodeTests:540,typescript:'passed',productionBuild:'passed',cleanInstall:'passed',npmAudit:audit.metadata.vulnerabilities,checkmarxRescanRequired:true,certifiedCompliant:false,findings:[
 {id:'314311644',severity:'Medium',type:'HttpOnly_Cookie_Flag_Not_Set',disposition:'source-remediated-pending-rescan',file:'cloud/components/ui/sidebar.tsx',evidence:'Removed JavaScript cookie assignment. Seven-day display preference uses guarded localStorage; false/true, expiration, malformed values and blocked storage tested. No session token stored here.'},
 {id:'-1903805349',severity:'Low',type:'Missing_CSP_Header',disposition:'source-remediated-pending-rescan',file:'cloud/scripts/vite/connector-preview-plugin.mjs',evidence:'Explicit deny-all CSP, nosniff and HSTS headers set before all context/invoke responses. Real middleware tests verify unauthorized, unavailable-session, successful context and malformed invoke responses.'},
 {id:'/YkcAkkfhqsuIVdPbkH50TMdKRAnKW2QF1pMxTXiZ1Q=',severity:'High',type:'CVE-2026-93687',package:'braces',version:'3.0.3+mirra.security.1',disposition:'locally-hardened-withdrawn-advisory-security-triage-required',evidence:'Upstream advisory withdrawn; no patched upstream version exists. Local parser and all three AST walkers enforce depth128/node65536/cycle guards, including direct AST entrypoints and options that previously disabled other limits. Timed hostile-input tests and micromatch/fast-glob compatibility pass. Local patch is not an upstream release or automatic Checkmarx suppression.',advisory:'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm',patchSha256:hash('cloud/vendor/braces/lib/security.js'),tarballSha256:hash('cloud/vendor/braces-3.0.3+mirra.security.1.tgz')}
]};
writeFileSync(resolve(root,'replica/remaining-security-remediation.json'),JSON.stringify(report,null,2)+'\n');
console.log('REMAINING_SECURITY_PASS '+JSON.stringify({sourceFindings:2,bracesLocalPatch:copies.length,nodeTests:540,npmAudit:0,rescanAndBracesTriageRequired:true}));
