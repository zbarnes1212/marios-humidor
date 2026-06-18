"use client";
import React, { useState, useEffect, useId } from "react";
import { T, r2, LANGS, TRANSLATIONS, LangContext } from "@/lib/constants";
import type { LangCode } from "@/lib/constants";

function LangProvider({children}:{children:React.ReactNode}){
  const [lang,setLangState]=useState<LangCode>("en");
  useEffect(()=>{
    try{const s=localStorage.getItem("mh_lang");if(LANGS.find(l=>l.code===s))setLangState(s as LangCode);}catch{}
  },[]);
  const setLang=(l:LangCode)=>{
    setLangState(l);
    try{localStorage.setItem("mh_lang",l);}catch{}
  };
  const t=(k:string)=>TRANSLATIONS[lang][k]??TRANSLATIONS.en[k]??k;
  return <LangContext.Provider value={{lang,t,setLang}}>{children}</LangContext.Provider>;
}



function CedarBg() {
  return <div style={{position:"fixed",inset:0,zIndex:0,
    background:"#0a0a0a"}}/>;
}

function MMedallion({size=32}:{size?:number}) {
  return <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,
    background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
    display:"flex",alignItems:"center",justifyContent:"center",
    fontSize:size*0.44,fontWeight:"bold",color:"#111111",fontFamily:"Georgia,serif",
    boxShadow:`0 2px 10px ${T.goldDark}44`}}>M</div>;
}

// GAUGE — ivory face, gold bezel, red needle
const polar=(cx:number,cy:number,r:number,deg:number)=>{const a=(deg-90)*Math.PI/180;return{x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)};};
function LuxuryGauge({value,size,label,subtitle,min=20,max=100}:{value:number;size:number;label:string;subtitle:string;min?:number;max?:number;}) {
  const uid=useId().replace(/:/g,"");
  const [m,setM]=useState(false);
  useEffect(()=>{setM(true);},[]);
  const cx=size/2,cy=size/2,outerR=size*0.46,arcR=size*0.40;
  const s0=-225,s1=50,range=s1-s0,pct=Math.max(0,Math.min(1,(value-min)/(max-min)));
  const ticks=Array.from({length:25},(_,i)=>{const ang=s0+(i/24)*range,maj=i%6===0,mid=i%3===0;const r1=outerR*(maj?0.66:mid?0.73:0.80),ringR=outerR*0.91;const p1=polar(cx,cy,r1,ang),p2=polar(cx,cy,ringR,ang);return{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y,maj,mid};});
  const ldata=[{v:20,a:s0},{v:40,a:s0+range*0.25},{v:60,a:s0+range*0.5},{v:80,a:s0+range*0.75},{v:100,a:s1}];
  const na=s0+pct*range,np=polar(cx,cy,outerR*0.70,na),ntp=polar(cx,cy,outerR*0.14,na+180);
  const ap1=polar(cx,cy,arcR,s0+((65-min)/(max-min))*range),ap2=polar(cx,cy,arcR,s0+((72-min)/(max-min))*range);
  if(!m) return <div style={{width:size,height:size,borderRadius:"50%",background:"#f5ede0",border:`3px solid ${T.goldMid}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:T.goldDark,fontSize:size*0.22,fontFamily:"Georgia,serif",fontWeight:"bold"}}>{value}</span></div>;
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{filter:"drop-shadow(0 4px 18px rgba(0,0,0,0.55))"}}>
      <defs>
        <radialGradient id={`${uid}b`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f0d870"/><stop offset="40%" stopColor="#c49a28"/><stop offset="75%" stopColor="#8B6914"/><stop offset="100%" stopColor="#c49a28"/></radialGradient>
        <radialGradient id={`${uid}d`} cx="38%" cy="32%" r="68%"><stop offset="0%" stopColor="#fdfaf4"/><stop offset="50%" stopColor="#f5ede0"/><stop offset="100%" stopColor="#ecdcc8"/></radialGradient>
        <radialGradient id={`${uid}g`} cx="30%" cy="25%" r="65%"><stop offset="0%" stopColor="rgba(255,255,255,0.22)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/></radialGradient>
        <linearGradient id={`${uid}n`} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8B6914"/><stop offset="50%" stopColor="#e8c84a"/><stop offset="100%" stopColor="#8B6914"/></linearGradient>
        <radialGradient id={`${uid}c`} cx="40%" cy="35%" r="65%"><stop offset="0%" stopColor="#f0d860"/><stop offset="100%" stopColor="#8B6914"/></radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={outerR*1.12} fill="rgba(0,0,0,0.35)"/>
      <circle cx={cx} cy={cy} r={outerR*1.08} fill={`url(#${uid}b)`}/>
      <circle cx={cx} cy={cy} r={outerR*1.01} fill="#3d2a08"/>
      <circle cx={cx} cy={cy} r={outerR} fill={`url(#${uid}d)`}/>
      <path d={`M ${ap1.x} ${ap1.y} A ${arcR} ${arcR} 0 0 1 ${ap2.x} ${ap2.y}`} stroke={T.success} strokeWidth={r2(size*0.018)} fill="none" opacity={0.5} strokeLinecap="round"/>
      {ticks.map((t,i)=><line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.maj?"#2a1608":t.mid?"#6a4820":"#b89860"} strokeWidth={r2(t.maj?size*0.016:t.mid?size*0.009:size*0.005)} opacity={t.maj?0.85:t.mid?0.6:0.35}/>)}
      {ldata.map((l,i)=>{const lp=polar(cx,cy,outerR*0.54,l.a);return <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize={r2(size*0.09)} fontFamily="Georgia,serif" fontWeight="bold" fill="#2a1608" opacity={0.75}>{l.v}</text>;})}
      <text x={cx} y={r2(cy-outerR*0.24)} textAnchor="middle" fontSize={r2(size*0.08)} fill="#7a5030" fontFamily="Georgia,serif" fontStyle="italic">{subtitle}</text>
      <line x1={r2(ntp.x+0.8)} y1={r2(ntp.y+0.8)} x2={r2(np.x+0.8)} y2={r2(np.y+0.8)} stroke="rgba(0,0,0,0.1)" strokeWidth={r2(size*0.024)} strokeLinecap="round"/>
      <line x1={ntp.x} y1={ntp.y} x2={np.x} y2={np.y} stroke={`url(#${uid}n)`} strokeWidth={r2(size*0.021)} strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={r2(size*0.082)} fill="#3d2a08"/>
      <circle cx={cx} cy={cy} r={r2(size*0.062)} fill={`url(#${uid}c)`}/>
      <circle cx={cx} cy={cy} r={r2(size*0.028)} fill="#111111"/>
      <circle cx={cx} cy={cy} r={outerR} fill={`url(#${uid}g)`}/>
    </svg>
    {label&&<div style={{marginTop:10,textAlign:"center"}}>
      <span style={{fontSize:r2(size*0.28),fontWeight:"bold",color:T.goldLight,fontFamily:"Georgia,serif",lineHeight:1,letterSpacing:-1}}>{value}</span>
      <span style={{fontSize:r2(size*0.12),color:T.textGold,marginLeft:3,fontFamily:"Georgia,serif"}}>{label}</span>
    </div>}
  </div>;
}


// DATA
const HUMIDORS:any[]=[];
type CigarEntry={id:number;brand:string;line:string;vitola:string;origin:string;wrapper:string;rating:number;count:number;purchaseDate:string;bandColor:string;humidorId:number|null};
const CIGARS:CigarEntry[]=[];


function renderMarioText(text:string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  const addressPattern = /\b\d+\s+\w[\w\s]+(?:St|Ave|Blvd|Dr|Rd|Way|Lane|Ln|Place|Pl|Court|Ct|Suite|Ste)\.?\b/i;
  lines.forEach((line, i) => {
    const hasAddress = addressPattern.test(line);
    if (hasAddress) {
      const query = encodeURIComponent(line.replace(/^[\-\*\•\d\.]+\s*/, "").trim());
      const appleMapsUrl = `https://maps.apple.com/?q=${query}`;
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
      elements.push(
        <div key={i}>
          <span>{line}</span>
          <div style={{display:"flex",gap:8,marginTop:6,marginBottom:4}}>
            <a href={appleMapsUrl} target="_blank" rel="noopener noreferrer"
              onClick={e=>e.stopPropagation()}
              style={{display:"inline-flex",alignItems:"center",gap:5,
                background:"#111111",border:"1px solid rgba(196,154,40,0.25)",
                borderRadius:20,padding:"5px 12px",textDecoration:"none",
                color:"#C49A28",fontSize:11,fontFamily:"Georgia,serif",cursor:"pointer"}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Apple Maps
            </a>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
              onClick={e=>e.stopPropagation()}
              style={{display:"inline-flex",alignItems:"center",gap:5,
                background:"#111111",border:"1px solid rgba(196,154,40,0.25)",
                borderRadius:20,padding:"5px 12px",textDecoration:"none",
                color:"#C49A28",fontSize:11,fontFamily:"Georgia,serif",cursor:"pointer"}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Google Maps
            </a>
          </div>
        </div>
      );
    } else {
      elements.push(<span key={i}>{line}{i < lines.length - 1 ? "\n" : ""}</span>);
    }
  });
  return <div style={{whiteSpace:"pre-line"}}>{elements}</div>;
}


export function SvgIcon({id,size=18,color}:{id:string;size?:number;color?:string}) {
  const c=color||T.goldMid;
  const s={width:size,height:size};
  const icons:Record<string,React.ReactNode>={
    fire:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17h2a2.5 2.5 0 0 0 0-5H7c0-4 3-7 7-7 1 2 2 3 2 5 0 2.5-1.5 4-3 5.5"/><path d="M12 22v-1"/></svg>),
    globe:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>),
    drop:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M12 2C6 10 4 14 4 17a8 8 0 0 0 16 0c0-3-2-7-8-15z"/></svg>),
    notes:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>),
    trophy:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>),
    crown:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M2 20h20M4 20l2-8 6 4 6-4 2 8"/><circle cx="12" cy="8" r="2"/></svg>),
    cigar:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><line x1="2" y1="12" x2="22" y2="12"/><path d="M17 8c0 2.5-1 4-5 4M7 8c0 2.5 1 4 5 4"/></svg>),
    box:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>),
    users:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    star:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
    calendar:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>),
    leaf:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>),
    camera:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>),
    hundred:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>),
    tag:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>),
    vitola:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><rect x="3" y="8" width="18" height="8" rx="4"/><line x1="3" y1="12" x2="21" y2="12"/></svg>),
    wrapper:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 2c2.76 3.62 4 7.28 4 10s-1.24 6.38-4 10"/><path d="M12 2c-2.76 3.62-4 7.28-4 10s1.24 6.38 4 10"/></svg>),
    strength:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>),
    pin:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>),
    search:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
    warning:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>),
    wood:(<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" y1="2" x2="6" y2="8"/><line x1="10" y1="2" x2="10" y2="8"/><line x1="14" y1="2" x2="14" y2="8"/></svg>),
  };
  return <>{icons[id]||<svg {...s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8"><circle cx="12" cy="12" r="10"/></svg>}</>;
}

// ── EXPORTS ──────────────────────────────────────────────────────────────────
export {LangProvider,CedarBg,MMedallion,LuxuryGauge,renderMarioText};
