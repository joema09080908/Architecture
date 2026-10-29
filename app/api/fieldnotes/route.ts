import { bindings, categories, scopes, setting, setSetting, identity, requireAdmin, json, failure, assert, record, decodeRecord, validateMetadata } from '../../../lib/server';
import { flatten, type Category } from '../../../lib/model';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const auth=await identity(request);const {db}=bindings();const rows=await db.prepare(`SELECT * FROM observations ${auth.admin?'':'WHERE published=1'} ORDER BY created_at DESC`).all();return json({observations:rows.results.map(decodeRecord),categories:await categories(),scopes:await scopes(),stories:await setting('stories',[]),admin:auth.admin,signedIn:auth.signedIn});}catch(e){return failure(e);}}
export async function POST(request:Request){try{await requireAdmin(request);const body:any=await request.json();const {db,bucket}=bindings();
 if(body.action==='metadata'){const row=await record(String(body.id));if(!row)throw new Error('NOT_FOUND');const old=decodeRecord(row);const metadata=validateMetadata(body.metadata);assert(typeof metadata==='object');await db.prepare('UPDATE observations SET payload=? WHERE id=?').bind(JSON.stringify({...old,metadata:{...old.metadata,...metadata}}),old.id).run();return json({ok:true});}
 if(body.action==='edit'){
  const row=await record(String(body.id));if(!row)throw new Error('NOT_FOUND');const old=decodeRecord(row);const edit=body.record;
  assert(typeof edit.title==='string'&&edit.title.length<=500&&typeof edit.notes==='string'&&edit.notes.length<=20000&&Array.isArray(edit.categories));
  const allowed=new Set(flatten(await categories()).map(x=>x.id));assert(edit.categories.every((x:any)=>typeof x==='string'&&allowed.has(x)));
  if(edit.location)validateMetadata(edit.location);
  const next={...old,title:edit.title,notes:edit.notes,categories:[...new Set(edit.categories)],place:String(edit.place||'').slice(0,500),location:edit.location||undefined};
  await db.prepare('UPDATE observations SET payload=?,published=? WHERE id=?').bind(JSON.stringify(next),edit.published?1:0,old.id).run();return json({ok:true});
 }
 if(body.action==='category'){
  const tree=await categories();const all=flatten(tree);const {id,parentId,name,nameZh}=body;assert(typeof name==='string'&&name.trim()&&name.length<=150&&typeof nameZh==='string'&&nameZh.length<=150);
  if(id){assert(all.some(x=>x.id===id));function edit(nodes:Category[]){for(const n of nodes){if(n.id===id){n.name=name.trim();n.nameZh=nameZh.trim();}edit(n.children||[]);}}edit(tree);}
  else {const n={id:crypto.randomUUID(),name:name.trim(),nameZh:nameZh.trim(),children:[]};if(parentId){let found=false;function add(nodes:Category[]){for(const x of nodes){if(x.id===parentId){(x.children||=[]).push(n);found=true;return;}add(x.children||[]);}}add(tree);assert(found);}else tree.push({...n,color:'#747474',symbol:'square'});}
  await setSetting('categories',tree);return json({ok:true});
 }
 if(body.action==='scope') {const all=await scopes();const s=all.find(x=>x.id===body.id);assert(s&&Array.isArray(body.points)&&body.points.length>=3&&body.points.length<=200);for(const p of body.points){assert(Array.isArray(p)&&p.length===2);validateMetadata({latitude:p[0],longitude:p[1]});}s.points=body.points;await setSetting('scopes',all);return json({ok:true});}
 if(body.action==='story'){assert(typeof body.title==='string'&&body.title.trim()&&body.title.length<=200&&Array.isArray(body.recordIds)&&body.recordIds.length<=100);const ids=[...new Set(body.recordIds)];for(const id of ids)assert(await record(String(id)));const all=await setting<any[]>('stories',[]);all.push({id:crypto.randomUUID(),title:body.title.trim(),notes:String(body.notes||'').slice(0,20000),recordIds:ids});await setSetting('stories',all);return json({ok:true});}
 if(body.action==='delete'){const row=await record(String(body.id));if(!row)throw new Error('NOT_FOUND');await bucket.delete([row.original_key,`playback/${row.id}.mp4`,...(row.preview_key?[row.preview_key]:[])]);await db.prepare('DELETE FROM observations WHERE id=?').bind(row.id).run();return json({ok:true});}
 throw new Error('INVALID_INPUT');
}catch(e){return failure(e);}}
