'use client';
import {useEffect,useState} from 'react';
import type {Locale} from '../lib/model';

export default function HousingPrelude({locale,onClose}:{locale:Locale;onClose:()=>void}){
 const [selected,setSelected]=useState<'mind'|'housing'|null>(null);
 const en=locale==='en';
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){if(selected)setSelected(null);else onClose()}};window.addEventListener('keydown',onKey);return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey)}},[onClose,selected]);
 return <div className="housing-prelude booklet-intro" role="dialog" aria-modal="true" aria-label={en?'Field research booklet':'场地研究图册'}>
  <header className="booklet-top"><span>REGIS ROAD <i/> FIELD ATLAS</span><button onClick={onClose}>{en?'ENTER THE ATLAS ↗':'进入场地图册 ↗'}</button></header>
  <div className="booklet-stage">
   <div className="booklet-heading"><span>01 — 02 / {en?'FIELD RESEARCH':'场地研究'}</span><h1>{en?'HOW WE LIVE. HOW WE BELONG.':'我们的生活。我们的归属。'}</h1><span>LONDON / KENTISH TOWN</span></div>
   <main className="booklet-spread" aria-label={en?'Open research booklet':'展开的研究图册'}>
    <button className="booklet-page booklet-page-left" onClick={()=>setSelected('mind')} aria-label={en?'Open mind map':'打开思维导图'}><img src="/research/mind-map.webp" alt="Research mind map"/><span className="booklet-page-label"><b>01</b> {en?'MIND MAP':'思维导图'} <em>↗</em></span></button>
    <button className="booklet-page booklet-page-right" onClick={()=>setSelected('housing')} aria-label={en?'Open 16 housing drawings':'打开16栋住宅线稿'}><img src="/research/housing-sheet.webp" alt="Sixteen housing typology drawings"/><span className="booklet-page-label"><b>02</b> {en?'16 HOUSING STUDIES':'16栋住宅线稿'} <em>↗</em></span></button>
   </main>
   <div className="booklet-below"><span>{en?'TWO RESEARCH PLATES / SELECT A PAGE TO EXPLORE':'两张研究图版 / 点击任一页展开'}</span><button onClick={onClose}>{en?'CONTINUE TO MAP + COLLECTION →':'继续到地图＋选集 →'}</button></div>
  </div>
  {selected&&<div className="booklet-popup" role="dialog" aria-modal="true" aria-label={selected==='mind'?'Mind map enlarged':'Housing drawings enlarged'}><header><strong>{selected==='mind'?'01 / MIND MAP':'02 / 16 HOUSING STUDIES'}</strong><button onClick={()=>setSelected(null)}>{en?'CLOSE ×':'关闭 ×'}</button></header><img src={selected==='mind'?'/research/mind-map.webp':'/research/housing-sheet.webp'} alt={selected==='mind'?'Full research mind map':'Full sheet of sixteen housing drawings'}/></div>}
 </div>
}
