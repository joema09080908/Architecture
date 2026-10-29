export type Locale = 'en' | 'zh';
export type Category = { id: string; name: string; nameZh?: string; code?: string; color?: string; symbol?: string; children?: Category[] };
export type Metadata = { capturedAt?: string; latitude?: number; longitude?: number; accuracy?: number; duration?: number; device?: string; offset?: string; direction?: number; width?: number; height?: number };
export type Observation = { id: string; filename: string; title: string; notes: string; kind: 'photo'|'video'; mime: string; size: number; categories: string[]; metadata: Metadata; location?: {latitude: number; longitude: number}; published: boolean; preview: boolean; playback?: boolean; createdAt: string; place?: string };
export type Scope = { id: string; name: string; nameZh: string; points: [number,number][]; labelAt?: [number,number]; approximate?: boolean };
export type Story = { id: string; title: string; notes: string; recordIds: string[] };
export type State = { observations: Observation[]; categories: Category[]; scopes: Scope[]; stories: Story[]; admin: boolean; signedIn: boolean };
import initialScopes from '../data/initial-scopes.json';
export const defaultScopes: Scope[] = initialScopes as Scope[];
export function flatten(nodes: Category[], parent?: Category): (Category & {parentId?: string})[] {return nodes.flatMap(n=>[{...n,parentId:parent?.id},...flatten(n.children||[],n)]);}
export function descendants(node: Category): string[] {return [node.id,...(node.children||[]).flatMap(descendants)];}
export function themeFor(ids:string[],nodes:Category[]){return nodes.find(n=>descendants(n).some(id=>ids.includes(id)));}
export function locationOf(r:Observation){return r.location || (typeof r.metadata.latitude==='number'&&typeof r.metadata.longitude==='number'?{latitude:r.metadata.latitude,longitude:r.metadata.longitude}:undefined);}
export function inPolygon(lat:number,lng:number,points:[number,number][]){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [yi,xi]=points[i],[yj,xj]=points[j];if(((yi>lat)!==(yj>lat))&&(lng<(xj-xi)*(lat-yi)/(yj-yi)+xi))inside=!inside;}return inside;}
export function categoryName(n:Category,l:Locale){return l==='zh'?(n.nameZh||n.name):n.name;}
