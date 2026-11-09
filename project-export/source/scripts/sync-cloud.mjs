import{mkdir,copyFile,readdir,writeFile}from'node:fs/promises';import{resolve}from'node:path';
import{securityHeaders}from'../src/security-headers.mjs';
const root=resolve(import.meta.dirname,'..');
for(const directory of ['public/public','public/src','lib/core'])await mkdir(resolve(root,'cloud',directory),{recursive:true});
for(const file of await readdir(resolve(root,'public')))if(/\.(mjs|css|html)$/.test(file))await copyFile(resolve(root,'public',file),resolve(root,'cloud/public/public',file));
for(const file of await readdir(resolve(root,'src')))if(file.endsWith('.mjs')){await copyFile(resolve(root,'src',file),resolve(root,'cloud/public/src',file));await copyFile(resolve(root,'src',file),resolve(root,'cloud/lib/core',file));}
await writeFile(resolve(root,'cloud/public/_headers'),'/*\n'+Object.entries(securityHeaders()).map(([name,value])=>'  '+name+': '+value).join('\n')+'\n');
console.log('Cloud application sources synchronized');
