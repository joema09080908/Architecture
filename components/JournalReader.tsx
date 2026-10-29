'use client';
import {useState} from 'react';
import type {Locale} from '../lib/model';

export default function JournalReader({locale}:{locale:Locale}){
 const [page,setPage]=useState(1);
 const zh=locale==='zh';
 const file=`/research/journal/page-${String(page).padStart(2,'0')}.jpg`;
 return <section className="journal-reader">
  <div className="journal-intro"><div><p className="eyebrow">RESEARCH / PROCESS / 01—38</p><h2>REFLECTIVE<br/><em>JOURNAL.</em></h2><p>{zh?'这本 38 页的研究日志记录了场地调研、案例分析、问题形成与设计思考。它是图册背后的研究过程。':'A 38-page record of field research, case studies, questions and design thinking. Read the process behind the field atlas.'}</p></div><a className="button dark" href="/research/reflective-journal.pdf" target="_blank" rel="noreferrer">{zh?'打开完整 PDF ↗':'OPEN THE 38-PAGE PDF ↗'}</a></div>
  <div className="journal-layout"><div className="journal-page"><div className="journal-toolbar"><strong>{String(page).padStart(2,'0')} / 38</strong><div><button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>{zh?'上一页':'PREVIOUS'}</button><button onClick={()=>setPage(p=>Math.min(38,p+1))} disabled={page===38}>{zh?'下一页':'NEXT'} ↗</button></div></div><img key={file} src={file} alt={`${zh?'研究日志第':'Reflective Journal page '}${page}${zh?'页':''}`}/></div><nav className="journal-pages" aria-label={zh?'选择研究日志页码':'Choose journal page'}>{Array.from({length:38},(_,i)=><button key={i} className={page===i+1?'active':''} onClick={()=>setPage(i+1)}>{String(i+1).padStart(2,'0')}</button>)}</nav></div>
  <div className="journal-mind"><div><p className="eyebrow">RESEARCH / SYNTHESIS</p><h2>{zh?'从调研到思维导图':'FROM FIELDWORK TO MIND MAP'}</h2><p>{zh?'正式版与手写草图并置，展示 Housing、Care、Cohabitation、Production 与 Belonging 如何从场地观察中形成。':'The composed map and handwritten studies trace how housing, care, cohabitation, production and belonging emerged from the fieldwork.'}</p></div><a href="/research/mind-map.webp" target="_blank" rel="noreferrer"><img src="/research/mind-map.webp" alt="Mind Map" loading="lazy"/></a><a href="/research/handwritten-1.jpg" target="_blank" rel="noreferrer"><img src="/research/handwritten-1.jpg" alt="Handwritten mind map study 1" loading="lazy"/></a><a href="/research/handwritten-2.jpg" target="_blank" rel="noreferrer"><img src="/research/handwritten-2.jpg" alt="Handwritten mind map study 2" loading="lazy"/></a></div>
 </section>;
}
