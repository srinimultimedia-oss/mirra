import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from'node:url';import{spawnSync}from'node:child_process';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),cloud=path.join(root,'source/cloud');
const config=path.join(root,'verification/wrangler.local.json');fs.mkdirSync(path.dirname(config),{recursive:true});
fs.writeFileSync(config,JSON.stringify({name:'mirra-export-local',compatibility_date:'2026-11-09',d1_databases:[{binding:'DB',database_name:'site-creator-d1',database_id:'00000000-0000-4000-8000-000000000000',migrations_dir:path.join(cloud,'drizzle')}]},null,2)+'\n');
const result=spawnSync(process.execPath,[path.join(cloud,'node_modules/wrangler/bin/wrangler.js'),'d1','migrations','apply','site-creator-d1','--local','--persist-to',path.join(cloud,'.wrangler/state'),'--config',config],{cwd:cloud,input:'y\n',encoding:'utf8',env:{...process.env,WRANGLER_SEND_METRICS:'false',WRANGLER_LOG_PATH:path.join(root,'verification/wrangler.log')},maxBuffer:10e6});
process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.error)throw result.error;process.exitCode=result.status??1;
