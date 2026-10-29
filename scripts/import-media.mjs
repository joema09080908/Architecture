// Administrative importer. Credentials arrive on stdin and are never logged.
import fs from 'node:fs';
import path from 'node:path';
import {File} from 'node:buffer';
import {extractMetadata} from '../lib/media.ts';
let input='';for await(const c of process.stdin)input+=c;
const cfg=JSON.parse(input);
const headers={'x-import-token':cfg.token};if(cfg.bypass)headers['OAI-Sites-Authorization']='Bearer '+cfg.bypass;
async function request(url,options={}){const r=await fetch(cfg.origin+url,{...options,headers:{...headers,...options.headers}});if(!r.ok)throw new Error(`${url.split('?')[0]}: HTTP ${r.status} ${await r.text()}`);return r.json();}
const send=(url,body)=>request(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
function walk(root){return fs.readdirSync(root,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(root,x.name)):[path.join(root,x.name)]);}
const existing=await request('/api/fieldnotes');
for(const p of walk(cfg.sourceDirectory).filter(p=>/\.(heic|heif|jpe?g|png|mov|mp4)$/i.test(p))){
 const name=path.basename(p),size=fs.statSync(p).size;
 const found=existing.observations.find(r=>r.filename===name&&r.size===size);if(found){const file=new File([await fs.openAsBlob(p)],name);if(!found.metadata?.latitude){const metadata=await extractMetadata(file);await send('/api/fieldnotes',{action:'metadata',id:found.id,metadata});console.log(name+': metadata repaired '+JSON.stringify(metadata));}for(const [ext,query] of [['.jpg',''],['.mp4','?playback']]){const converted=path.join(cfg.previewDirectory,path.parse(name).name+ext);if(fs.existsSync(converted)&&((ext==='.jpg'&&!found.preview)||(ext==='.mp4'&&!found.playback)))await request('/api/media/'+found.id+query,{method:'PUT',body:fs.readFileSync(converted)});}console.log(name+': repaired existing record');continue;}
 const file=new File([await fs.openAsBlob(p)],name);const metadata=await extractMetadata(file);console.log(name+': metadata '+JSON.stringify(metadata));
 const start=await send('/api/upload',{action:'start',record:{filename:name,size,kind:/\.(mov|mp4)$/i.test(name)?'video':'photo',metadata,categories:[]}});
 const parts=[];for(let offset=0,number=1;offset<size;offset+=start.partSize,number++){let part;for(let retry=0;retry<3;retry++){try{part=await request(`/api/upload?id=${start.id}&part=${number}`,{method:'PUT',body:await file.slice(offset,offset+start.partSize).arrayBuffer()});break;}catch(e){if(retry===2)throw e;}}parts.push(part);if(number%8===0)console.log(name+': '+Math.min(100,Math.round((offset+start.partSize)/size*100))+'%');}
 await send('/api/upload',{action:'finish',id:start.id,parts});
 for(const [ext,query] of [['.jpg',''],['.mp4','?playback']]){const converted=path.join(cfg.previewDirectory,path.parse(name).name+ext);if(fs.existsSync(converted))await request('/api/media/'+start.id+query,{method:'PUT',body:fs.readFileSync(converted)});}
 console.log(name+': saved with original and preview');
}
const saved=await request('/api/fieldnotes');console.log(JSON.stringify({total:saved.observations.length,located:saved.observations.filter(r=>typeof r.metadata.latitude==='number').length,previews:saved.observations.filter(r=>r.preview).length}));
