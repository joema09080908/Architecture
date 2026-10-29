'use client';
import {useEffect,useState} from 'react';
import type {Locale} from '../lib/model';

const TYPES=[
 'Narrow terraced house','Basement / lower-ground flat','Ground-floor garden flat','Upper-floor converted flat',
 'Loft / attic flat','Corner / end-terrace unit','Semi-detached / detached house','Split-level dwelling',
 'Duplex / maisonette','Stacked maisonette','Stepped-section dwelling','Single-level apartment',
 'Deck-access dwelling','Tower apartment','Courtyard-facing dwelling','Mews / backland townhouse'
];

export default function HousingPrelude({locale,onClose}:{locale:Locale;onClose:()=>void}){
 const [active,setActive]=useState(0),[paused,setPaused]=useState(false);
 useEffect(()=>{if(paused)return;const id=window.setInterval(()=>setActive(n=>(n+1)%16),1700);return()=>window.clearInterval(id)},[paused]);
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='ArrowRight')setActive(n=>(n+1)%16);if(e.key==='ArrowLeft')setActive(n=>(n+15)%16)};window.addEventListener('keydown',onKey);return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey)}},[onClose]);
 const code=`A${String(active+1).padStart(2,'0')}`;
 return <div className="housing-prelude" role="dialog" aria-modal="true" aria-label={locale==='en'?'How we live: housing typologies':'我们的生活：住宅类型'}>
  <div className="prelude-top"><span>REGIS ROAD / FIELD ATLAS</span><span>16 / HOUSING TYPOLOGIES</span><button onClick={onClose}>{locale==='en'?'SKIP INTRO ↗':'跳过开场 ↗'}</button></div>
  <div className="prelude-main"><div className="prelude-copy"><span className="prelude-kicker">01—16 / KENTISH TOWN</span><h2>{locale==='en'?<>HOW WE<br/>LIVE<span>.</span></>:<>我们的<br/>生活<span>。</span></>}</h2><p>{locale==='en'?'Sixteen drawn homes. Sixteen ways of occupying the city. Explore the lines before entering the field atlas.':'十六幅住宅线稿，十六种居住城市的方式。先读线条，再进入场地图册。'}</p><button className="prelude-enter" onClick={onClose}>{locale==='en'?'ENTER THE FIELD ATLAS':'进入场地图册'} <span>↗</span></button></div>
   <div className="prelude-stage" aria-live="polite"><span className="prelude-orbit prelude-orbit-one"/><span className="prelude-orbit prelude-orbit-two"/><span className="prelude-cross prelude-cross-one">+</span><span className="prelude-cross prelude-cross-two">+</span><img key={code} src={`/housing/${code}.webp`} alt={`${code}: ${TYPES[active]}`}/><div className="prelude-stage-caption"><strong>{code}</strong><span>{TYPES[active]}</span></div></div></div>
  <div className="prelude-bottom"><div className="prelude-strip" aria-label="Select housing typology">{TYPES.map((name,i)=><button key={i} className={i===active?'active':''} onClick={()=>{setActive(i);setPaused(true)}} title={name} aria-label={`A${String(i+1).padStart(2,'0')} ${name}`}>{String(i+1).padStart(2,'0')}</button>)}</div><button className="prelude-play" onClick={()=>setPaused(!paused)}>{paused?(locale==='en'?'PLAY SEQUENCE':'播放序列'):(locale==='en'?'PAUSE SEQUENCE':'暂停序列')}</button></div>
 </div>;
}
