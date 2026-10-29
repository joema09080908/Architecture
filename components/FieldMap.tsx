'use client';
import {useEffect,useRef} from 'react';
import type * as Leaflet from 'leaflet';
import {spanningLinks} from '../lib/map-network';
import {locationOf,themesFor,type Category,type Observation,type Scope,type Locale} from '../lib/model';

type Props={records:Observation[];categories:Category[];scopes:Scope[];selected:string|null;onSelect:(id:string)=>void;onFocusScope:(id:string)=>void;locale:Locale;drawing:boolean;placing:boolean;placement:[number,number]|null;showConnections:boolean;drawPoints:[number,number][];onMapClick:(point:[number,number])=>void;fitKey:number;focusScope:string;focusKey:number};
type PinNode={records:Observation[];latitude:number;longitude:number;offsetX:number;offsetY:number};

export default function FieldMap(p:Props){
 const div=useRef<HTMLDivElement>(null),map=useRef<Leaflet.Map|null>(null),lib=useRef<typeof Leaflet|null>(null),marks=useRef<Leaflet.LayerGroup|null>(null),latest=useRef(p);
 latest.current=p;

 function draw(){
  const L=lib.current,m=map.current,layer=marks.current;if(!L||!m||!layer)return;
  layer.clearLayers();const q=latest.current;
  for(const scope of [...q.scopes].reverse())if(scope.points.length>=3){
   const color=scope.id==='1'?'#d64840':scope.id==='2'?'#a87f50':'#59616a';
   L.polygon(scope.points,{color,weight:scope.id==='1'?4:scope.id==='2'?2.5:2,opacity:scope.id==='3'?.85:1,fillColor:color,fillOpacity:scope.id==='1'?.24:scope.id==='2'?.13:.045,dashArray:scope.id==='1'?undefined:scope.id==='2'?'10 6':'4 8',interactive:false}).addTo(layer);
   const position=scope.labelAt||scope.points[0];
   const label=document.createElement('div');label.className=`scope-map-label scope-map-label-${scope.id} ${q.focusScope===scope.id?'is-focused':''}`;
   const number=document.createElement('strong');number.textContent=`0${scope.id}`;
   const name=document.createElement('span');name.textContent=q.locale==='en'?scope.name:scope.nameZh;
   label.appendChild(number);label.appendChild(name);
   L.marker(position,{icon:L.divIcon({html:label,className:'scope-label-shell',iconSize:[210,46],iconAnchor:[0,22]}),interactive:false,keyboard:false}).addTo(layer);
  }

  // Each observation gets a pin. Identical GPS points form a small cluster around the true location.
  const grouped=new Map<string,{records:Observation[];latitude:number;longitude:number}>();
  for(const record of q.records){const location=locationOf(record);if(!location)continue;const key=`${location.latitude.toFixed(5)},${location.longitude.toFixed(5)}`;const node=grouped.get(key);if(node)node.records.push(record);else grouped.set(key,{records:[record],latitude:location.latitude,longitude:location.longitude});}
  const nodes:PinNode[]=[...grouped.values()].flatMap(group=>group.records.sort((a,b)=>a.id.localeCompare(b.id)).map((record,index)=>({records:[record],latitude:group.latitude,longitude:group.longitude,offsetX:group.records.length>1?Math.cos(index*2*Math.PI/group.records.length)*26:0,offsetY:group.records.length>1?Math.sin(index*2*Math.PI/group.records.length)*26:0}))).sort((a,b)=>a.records[0].id.localeCompare(b.records[0].id));
  const point=(node:PinNode)=>m.latLngToLayerPoint([node.latitude,node.longitude]).add(L.point(node.offsetX,node.offsetY));
  const themes=(node:PinNode)=>themesFor([...new Set(node.records.flatMap(r=>r.categories))],q.categories);
  for(const node of nodes)if(node.offsetX||node.offsetY){const original=L.latLng(node.latitude,node.longitude),display=m.layerPointToLatLng(point(node));L.polyline([original,display],{color:'#6a655e',weight:.7,opacity:.55,interactive:false}).addTo(layer);L.circleMarker(original,{radius:2,color:'#6a655e',weight:.5,fillOpacity:1,interactive:false}).addTo(layer);}

  if(q.showConnections&&nodes.length>1){
   const edges=new Map<string,{a:number;b:number;themes:Category[]}>();
   function add(a:number,b:number,theme?:Category){if(a>b)[a,b]=[b,a];const key=`${a}:${b}`,edge=edges.get(key)||{a,b,themes:[]};if(theme&&!edge.themes.some(t=>t.id===theme.id))edge.themes.push(theme);edges.set(key,edge);}
   // A base network reaches every pin. Each theme then gets its own sparse thread.
   for(const [a,b] of spanningLinks(nodes.map(point))){const shared=themes(nodes[a]).filter(t=>themes(nodes[b]).some(other=>other.id===t.id));if(shared.length)shared.forEach(t=>add(a,b,t));else add(a,b);}
   for(const theme of q.categories){const members=nodes.map((node,i)=>({node,i})).filter(({node})=>themes(node).some(t=>t.id===theme.id));for(const [a,b] of spanningLinks(members.map(({node})=>point(node))))add(members[a].i,members[b].i,theme);}
   for(const edge of edges.values()){
    const from=point(nodes[edge.a]),to=point(nodes[edge.b]);const colors=edge.themes.length?edge.themes.map(t=>t.color||'#747474'):['#77716c'];
    colors.forEach((color,index)=>{
     // Raise the thread to the metal heads rather than connecting the map beneath them.
     const path=Array.from({length:13},(_,step)=>{const t=step/12,bow=Math.sin(Math.PI*t)*(index-(colors.length-1)/2)*4;return m.layerPointToLatLng(L.point(from.x+(to.x-from.x)*t,from.y+(to.y-from.y)*t-27-bow));});
     L.polyline(path,{color:'#2b2521',weight:2.5,opacity:.13,interactive:false}).addTo(layer);
     L.polyline(path,{color,weight:1.1,opacity:.88,interactive:false}).addTo(layer);
    });
   }
  }

  for(const node of nodes){
   const group=node.records,active=group.some(r=>r.id===q.selected),categories=themes(node),theme=categories[0];
   const pin=document.createElement('div');pin.className='thread-pin'+(active?' is-active':'');pin.style.setProperty('--pin-accent',theme?.color||'#67635f');
   const shadow=document.createElement('span');shadow.className='thread-pin-shadow';
   const stem=document.createElement('span');stem.className='thread-pin-stem';
   const neck=document.createElement('span');neck.className='thread-pin-neck';
   const head=document.createElement('span');head.className='thread-pin-head';
   pin.appendChild(shadow);pin.appendChild(stem);pin.appendChild(neck);pin.appendChild(head);
   if(group.length>1){const count=document.createElement('span');count.className='thread-pin-count';count.textContent=String(group.length);pin.appendChild(count);}
   const marker=L.marker(m.layerPointToLatLng(point(node)),{icon:L.divIcon({html:pin,className:'thread-pin-shell',iconSize:[32,38],iconAnchor:[16,37]}),keyboard:true,title:group.map(r=>r.title).join(' · ')}).addTo(layer);
   const tip=document.createElement('div');tip.className='pin-preview';
   const title=document.createElement('div');title.className='pin-preview-head';title.textContent=group.length>1?`${group.length} ${q.locale==='en'?'observations at this point':'条记录位于此点位'}`:group[0].kind==='video'?(q.locale==='en'?'VIDEO':'视频'):(q.locale==='en'?'PHOTO':'照片');tip.appendChild(title);
   const cards=document.createElement('div');cards.className='pin-preview-grid';
   for(const item of group){const card=document.createElement('div');card.className='pin-preview-card';if(item.preview||['image/jpeg','image/png','image/webp'].includes(item.mime)){const img=document.createElement('img');img.src=`/api/media/${encodeURIComponent(item.id)}${item.preview?'?preview':''}`;img.alt=item.title;img.loading='lazy';card.appendChild(img);}const caption=document.createElement('span');caption.textContent=`${item.kind==='video'?'▶ ':'▣ '}${item.title}`;card.appendChild(caption);cards.appendChild(card);}tip.appendChild(cards);
   const badges=document.createElement('div');badges.className='pin-preview-themes';for(const category of categories){const badge=document.createElement('span'),mark=document.createElement('i');mark.className='glyph '+(category.symbol||'square');mark.style.color=category.color||'#747474';badge.appendChild(mark);badge.appendChild(document.createTextNode(q.locale==='en'?category.name:category.nameZh||category.name));badges.appendChild(badge);}tip.appendChild(badges);
   marker.bindTooltip(tip,{className:'field-pin-tooltip',direction:'top',offset:[0,-25],opacity:1});
   marker.on('click',()=>{const index=group.findIndex(r=>r.id===q.selected);q.onSelect(group[(index+1)%group.length].id);});
   const activeRecord=group.find(r=>r.id===q.selected);if(activeRecord?.metadata.accuracy)L.circle([node.latitude,node.longitude],{radius:activeRecord.metadata.accuracy,color:theme?.color||'#747474',weight:1,dashArray:'2 4',fillOpacity:.05}).addTo(layer);
  }
  if(q.placement)L.circleMarker(q.placement,{radius:9,color:'#d94b43',weight:3,fillColor:'#fff',fillOpacity:1,interactive:false}).addTo(layer);
  if(q.drawPoints.length)L.polyline(q.drawPoints,{color:'#D94B43',weight:2,dashArray:'5 5'}).addTo(layer);
  for(const point of q.drawPoints)L.circleMarker(point,{radius:4,color:'#D94B43',fillOpacity:1}).addTo(layer);
 }

 useEffect(()=>{let disposed=false;import('leaflet').then(L=>{if(disposed||!div.current)return;lib.current=L;const m=L.map(div.current,{zoomControl:false}).setView([51.5538,-.1458],14);map.current=m;L.control.zoom({position:'bottomright',zoomInTitle:latest.current.locale==='en'?'Zoom in':'放大',zoomOutTitle:latest.current.locale==='en'?'Zoom out':'缩小'}).addTo(m);L.control.scale({imperial:false,position:'bottomleft'}).addTo(m);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',className:'linework-tiles'}).addTo(m);marks.current=L.layerGroup().addTo(m);m.on('zoomend',draw);m.on('click',e=>{if(latest.current.drawing||latest.current.placing)latest.current.onMapClick([e.latlng.lat,e.latlng.lng]);});draw();const outer=latest.current.scopes.find(s=>s.id==='3');if(outer?.points.length)m.fitBounds(L.latLngBounds(outer.points),{padding:[24,24],maxZoom:15});});const observer=new ResizeObserver(()=>map.current?.invalidateSize());if(div.current)observer.observe(div.current);return()=>{disposed=true;observer.disconnect();map.current?.remove();map.current=null;};},[]);
 useEffect(()=>{draw();const c=map.current?.getContainer();const zin=c?.querySelector('.leaflet-control-zoom-in'),zout=c?.querySelector('.leaflet-control-zoom-out');for(const [el,en,zh] of [[zin,'Zoom in','放大'],[zout,'Zoom out','缩小']] as const){el?.setAttribute('title',p.locale==='en'?en:zh);el?.setAttribute('aria-label',p.locale==='en'?en:zh);}},[p.records,p.categories,p.scopes,p.selected,p.locale,p.drawPoints,p.focusScope,p.placement,p.showConnections]);
 useEffect(()=>{const r=p.records.find(x=>x.id===p.selected),loc=r&&locationOf(r);if(loc)map.current?.panTo([loc.latitude,loc.longitude]);},[p.selected]);
 useEffect(()=>{const L=lib.current,m=map.current;if(!L||!m||!p.focusKey)return;const target=p.scopes.find(s=>s.id===p.focusScope);if(target?.points.length)m.fitBounds(L.latLngBounds(target.points),{padding:[30,30],maxZoom:17});},[p.focusKey,p.focusScope,p.scopes]);
 useEffect(()=>{const L=lib.current,m=map.current;if(!L||!m)return;const positions=p.records.map(locationOf).filter(Boolean).map(x=>[x!.latitude,x!.longitude] as [number,number]);if(positions.length)m.fitBounds(L.latLngBounds(positions).pad(.25),{maxZoom:17});else {const scope=p.scopes.find(s=>s.id==='3');if(scope?.points.length)m.fitBounds(L.latLngBounds(scope.points),{padding:[24,24],maxZoom:15});}},[p.fitKey]);
 return <div className="map-viewport"><div ref={div} className={'map-canvas '+(p.drawing||p.placing?'drawing':'')} aria-label={p.locale==='en'?'Site map with geolocated observations':'场地地图与定位记录'} /><div className="map-scope-legend" aria-label={p.locale==='en'?'Research area legend':'研究范围图例'}><strong>{p.locale==='en'?'RESEARCH AREAS · SELECT TO ZOOM':'研究范围 · 点击缩放'}</strong>{p.scopes.map(s=><button type="button" className={'map-scope-legend-row map-scope-legend-'+s.id+(p.focusScope===s.id?' is-focused':'')} key={s.id} onClick={()=>p.onFocusScope(s.id)}><i aria-hidden="true"/><span><b>0{s.id}</b>{p.locale==='en'?s.name:s.nameZh}</span></button>)}</div>{p.showConnections&&<div className="map-network-legend"><strong>{p.locale==='en'?'THREADS BETWEEN PINS':'图钉之间的连线'}</strong><span>{p.locale==='en'?'Colour follows research themes · Grey joins other pins':'线色对应研究主题 · 灰线连接其他点位'}</span></div>}</div>;
}
