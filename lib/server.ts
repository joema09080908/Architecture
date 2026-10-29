import { env } from 'cloudflare:workers';
import initial from '../data/initial-taxonomy.json';
import { getChatGPTUser } from '../app/chatgpt-auth';
import { defaultScopes, type Category, type Observation } from './model';
export function bindings(){if(!env.DB||!env.BUCKET)throw new Error('STORAGE_UNAVAILABLE');return {db:env.DB,bucket:env.BUCKET};}
export async function setting<T>(id:string,fallback:T):Promise<T>{const {db}=bindings();const r=await db.prepare('SELECT value FROM settings WHERE id = ?').bind(id).first<{value:string}>();return r?JSON.parse(r.value):fallback;}
export async function setSetting(id:string,value:unknown){const {db}=bindings();await db.prepare('INSERT INTO settings (id,value) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').bind(id,JSON.stringify(value)).run();}
export async function identity(request?:Request){
 const vars=env as unknown as Record<string,string|undefined>;
 if(request && vars.IMPORT_TOKEN && request.headers.get('x-import-token')===vars.IMPORT_TOKEN)return {admin:true,signedIn:false,id:'service'};
 const u=await getChatGPTUser();if(!u)return {admin:false,signedIn:false,id:''};
 const {db}=bindings();let owner=await setting<string|null>('owner',null);
 if(!owner && vars.OWNER_EMAIL && u.email.toLowerCase()===vars.OWNER_EMAIL.toLowerCase()){
  await db.prepare("INSERT OR IGNORE INTO settings (id,value) VALUES ('owner',?)").bind(JSON.stringify(u.userId)).run();owner=await setting<string|null>('owner',null);
 }
 return {admin:owner===u.userId,signedIn:true,id:u.userId};
}
export async function requireAdmin(request:Request){const auth=await identity(request);if(!auth.admin)throw new Error('FORBIDDEN');const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)throw new Error('FORBIDDEN');return auth;}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});}
export function failure(e:unknown){const message=e instanceof Error?e.message:'REQUEST_FAILED';return json({error:message},message==='FORBIDDEN'?403:message==='NOT_FOUND'?404:message==='INVALID_INPUT'?400:500);}
export function assert(ok:unknown):asserts ok{if(!ok)throw new Error('INVALID_INPUT');}
export async function categories(){const tree=await setting<Category[]>('categories',initial.themes as Category[]);const specialist=tree.find(n=>n.id==='production')?.children?.find(n=>n.id==='production-specialist');const farm=(initial.themes as Category[]).find(n=>n.id==='production')?.children?.find(n=>n.id==='production-specialist')?.children?.find(n=>n.id==='production-city-farm');if(specialist&&farm&&!specialist.children?.some(n=>n.id===farm.id))specialist.children=[...(specialist.children||[]),farm];return tree;}
export async function scopes(){const saved=await setting<typeof defaultScopes>('scopes',defaultScopes);return defaultScopes.map(revised=>{const current=saved.find(s=>s.id===revised.id);return current&&!current.approximate?current:revised;});}
export async function record(id:string){const {db}=bindings();return db.prepare('SELECT * FROM observations WHERE id=?').bind(id).first<{id:string,payload:string,original_key:string,preview_key:string|null,published:number,created_at:string}>();}
export function validateMetadata(input:any){assert(input&&typeof input==='object');for(const [k,limit] of [['latitude',90],['longitude',180]] as const)if(input[k]!==undefined&&input[k]!==null)assert(typeof input[k]==='number'&&Number.isFinite(input[k])&&Math.abs(input[k])<=limit);return input;}
export function decodeRecord(r:any):Observation {return {...JSON.parse(r.payload),id:r.id,published:!!r.published,preview:!!r.preview_key,createdAt:r.created_at};}
