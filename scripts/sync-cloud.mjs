import{mkdir,copyFile,readdir}from'node:fs/promises';import{resolve}from'node:path';
const root=resolve(import.meta.dirname,'..');
for(const directory of ['public/public','public/src','lib/core'])await mkdir(resolve(root,'cloud',directory),{recursive:true});
for(const file of await readdir(resolve(root,'public')))if(/\.(mjs|css|html)$/.test(file))await copyFile(resolve(root,'public',file),resolve(root,'cloud/public/public',file));
for(const file of await readdir(resolve(root,'src')))if(file.endsWith('.mjs')){await copyFile(resolve(root,'src',file),resolve(root,'cloud/public/src',file));await copyFile(resolve(root,'src',file),resolve(root,'cloud/lib/core',file));}
console.log('Cloud application sources synchronized');
