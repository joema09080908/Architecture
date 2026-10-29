'use client';
import {useEffect,useState} from 'react';
import type {Locale} from '../lib/model';
const TYPES=['Narrow terraced house','Basement / lower-ground flat','Ground-floor garden flat','Upper-floor converted flat','Loft / attic flat','Corner / end-terrace unit','Semi-detached / detached house','Split-level dwelling','Duplex / maisonette','Stacked maisonette','Stepped-section dwelling','Single-level apartment','Deck-access dwelling','Tower apartment','Courtyard-facing dwelling','Mews / backland townhouse'];
export default function HousingPrelude({locale,onClose}:{locale:Locale;onClose:()=>void}){
 const [selected,setSelected]=useState<'map'|number|null>(null);
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){if(selected!==null)setSelected(null);else onClose()}};window.addEventListener('keydown',onKey);return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey)}},[onClose,selected]);
 const en=locale==='en';
 return <div className="housing-prelude opening" role="dialog" aria-modal="true" aria-label={en?'Field research mind map and housing studies':'场地研究思维导图与住宅线稿'}>
  <header className="opening-head"><span className="opening-brand">REGIS ROAD <i/> FIELD ATLAS</span><span className="opening-title">{en?'HOW WE LIVE. HOW WE BELONG.':'我们的生活。我们的归属。'}</span><button onClick={onClose}>{en?'ENTER THE ATLAS ↗':'进入场地图册 ↗'}</button></header>
  <main className="opening-layout">
   <section className="opening-map"><div className="opening-section-head"><span>01 / {en?'RESEARCH MIND MAP':'研究思维导图'}</span><span>{en?'SITE → QUESTION → DESIGN':'场地 → 问题 → 设计'}</span></div><button className="opening-map-image" onClick={()=>setSelected('map')} aria-label={en?'Enlarge mind map':'放大思维导图'}><img src="/research/mind-map.webp" alt="Research mind map connecting housing, care, cohabitation, production and belonging"/></button><p>{en?'Select the map to read the full research narrative.':'点击导图查看完整研究脉络。'} <span>↗</span></p></section>
   <section className="opening-buildings"><div className="opening-section-head"><span>02 / {en?'HOUSING STUDIES':'住宅类型研究'}</span><span>16 {en?'DRAWINGS':'幅线稿'}</span></div><div className="opening-building-grid">{TYPES.map((name,i)=>{const code=`A${String(i+1).padStart(2,'0')}`;return <button className="opening-building" key={code} onClick={()=>setSelected(i)} aria-label={`${code}: ${name}`} title={`${code}: ${name}`}><img src={`/housing/${code}.webp`} alt=""/><span><b>{code}</b><small>{name}</small></span></button>})}</div><p>{en?'Select a drawing to inspect its housing type.':'点击线稿查看住宅类型。'} <span>↗</span></p></section>
  </main>
  <footer className="opening-footer"><span>REGIS ROAD / KENTISH TOWN / LONDON</span><span>{en?'A LIVING FIELD ATLAS':'持续生长的场地图册'}</span><button onClick={onClose}>{en?'CONTINUE TO MAP + COLLECTION →':'继续到地图＋选集 →'}</button></footer>
  {selected!==null&&<div className="opening-lightbox" role="dialog" aria-modal="true" aria-label={selected==='map'?'Mind map enlarged':'Housing drawing enlarged'}><div className="opening-lightbox-head"><strong>{selected==='map'?'MIND MAP / RESEARCH MANIFESTO':`A${String(selected+1).padStart(2,'0')} / ${TYPES[selected]}`}</strong><button onClick={()=>setSelected(null)}>{en?'CLOSE ×':'关闭 ×'}</button></div><img src={selected==='map'?'/research/mind-map.webp':`/housing/A${String(selected+1).padStart(2,'0')}.webp`} alt={selected==='map'?'Full research mind map':TYPES[selected]}/></div>}
 </div>
}
