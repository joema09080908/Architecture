import {bindings,requireAdmin,json,failure,assert,categories,validateMetadata} from '../../../lib/server';
import {flatten} from '../../../lib/model';
export const dynamic='force-dynamic';
const MAX=2*1024*1024*1024;
export async function POST(request:Request){try{const user=await requireAdmin(request);const {db,bucket}=bindings();const body:any=await request.json();
 if(body.action==='start'){
  const data=body.record;assert(data&&typeof data.filename==='string'&&data.filename.length<500&&Number.isInteger(data.size)&&data.size>0&&data.size<=MAX&&['photo','video'].includes(data.kind));validateMetadata(data.metadata||{});if(data.location)validateMetadata(data.location);
  assert(/\.(heic|heif|jpe?g|png|webp|mov|mp4|m4v)$/i.test(data.filename));const valid=new Set(flatten(await categories()).map(c=>c.id));assert(Array.isArray(data.categories)&&data.categories.every((id:string)=>valid.has(id)));
  const id=crypto.randomUUID(),key=`originals/${id}`;const mime=data.kind==='video'?(data.filename.toLowerCase().endsWith('.mov')?'video/quicktime':'video/mp4'):(data.filename.toLowerCase().match(/\.hei[cf]$/)?'image/heic':data.filename.toLowerCase().endsWith('.png')?'image/png':data.filename.toLowerCase().endsWith('.webp')?'image/webp':'image/jpeg');
  const up=await bucket.createMultipartUpload(key,{httpMetadata:{contentType:mime}});const payload={id,filename:data.filename,title:data.filename,notes:'',kind:data.kind,mime,size:data.size,categories:data.categories,metadata:data.metadata||{},location:data.location||undefined,published:true,preview:false};
  await db.prepare('INSERT INTO uploads (id,owner_id,object_key,upload_id,payload,created_at) VALUES (?,?,?,?,?,?)').bind(id,user.id,key,up.uploadId,JSON.stringify(payload),new Date().toISOString()).run();return json({id,partSize:8*1024*1024});
 }
 const up=await db.prepare('SELECT * FROM uploads WHERE id=? AND owner_id=?').bind(String(body.id),user.id).first<any>();if(!up)throw new Error('NOT_FOUND');const multipart=bucket.resumeMultipartUpload(up.object_key,up.upload_id);
 if(body.action==='abort'){await multipart.abort();await db.prepare('DELETE FROM uploads WHERE id=?').bind(up.id).run();return json({ok:true});}
 assert(body.action==='finish'&&Array.isArray(body.parts)&&body.parts.length>0&&body.parts.length<=256);for(let i=0;i<body.parts.length;i++)assert(body.parts[i].partNumber===i+1&&typeof body.parts[i].etag==='string');
 const obj=await multipart.complete(body.parts);const data=JSON.parse(up.payload);if(obj.size!==data.size){await bucket.delete(up.object_key);await db.prepare('DELETE FROM uploads WHERE id=?').bind(up.id).run();throw new Error('SIZE_MISMATCH');}
 const now=new Date().toISOString();await db.batch([db.prepare('INSERT INTO observations (id,payload,original_key,published,created_at) VALUES (?,?,?,?,?)').bind(up.id,up.payload,up.object_key,1,now),db.prepare('DELETE FROM uploads WHERE id=?').bind(up.id)]);return json({id:up.id});
}catch(e){return failure(e);}}
export async function PUT(request:Request){try{const user=await requireAdmin(request);const {db,bucket}=bindings();const u=new URL(request.url);const number=Number(u.searchParams.get('part'));assert(Number.isInteger(number)&&number>=1&&number<=256);const up=await db.prepare('SELECT * FROM uploads WHERE id=? AND owner_id=?').bind(u.searchParams.get('id'),user.id).first<any>();if(!up)throw new Error('NOT_FOUND');const data=await request.arrayBuffer();assert(data.byteLength>0&&data.byteLength<=8*1024*1024);return json(await bucket.resumeMultipartUpload(up.object_key,up.upload_id).uploadPart(number,data));}catch(e){return failure(e);}}
