"use client";
"use client";
"use client";
"use client";
import { useState, useRef } from "react";

const T = {
  cedar0: "#120800", cedar1: "#1e0e04", cedar2: "#2d1508", cedar3: "#3d1e0a",
  cedar4: "#5a2d0f", cedar5: "#7a4020",
  goldDeep: "#4a3000", goldDark: "#7a5010", gold: "#a87820", goldMid: "#c89830",
  goldLight: "#e8b840", goldShine: "#f8d870", goldFoil: "#ffe090",
  brass: "#b08030", brassLight: "#d4a850",
  cubanBlue: "#001848", cubanBlueMid: "#002868",
  tobacco: "#5a2808", cubanRed: "#9f0820", cubanRedMid: "#bf0a30", cubanWhite: "#f0ece0",
  leather1: "#0e0604", leather2: "#1a0e06", leather3: "#2a1808",
  cream: "#fdf6e8", parchment: "#f0e3c6", ink: "#120800", inkSoft: "#2d1508",
  muted: "#8a6840", mutedLight: "#b08850",
  success: "#1a5c35", danger: "#9f0820", sapphire: "#001848",
};

const cedarBg = `repeating-linear-gradient(91deg,transparent 0px,transparent 14px,rgba(0,0,0,0.09) 14px,rgba(0,0,0,0.09) 15px,transparent 15px,transparent 28px,rgba(255,255,255,0.025) 28px,rgba(255,255,255,0.025) 29px),repeating-linear-gradient(89deg,transparent 0px,transparent 40px,rgba(0,0,0,0.05) 40px,rgba(0,0,0,0.05) 41px),repeating-linear-gradient(180deg,transparent 0px,transparent 80px,rgba(255,255,255,0.02) 80px,rgba(255,255,255,0.02) 81px),linear-gradient(170deg,#4a2010 0%,#3d1a08 20%,#2d1508 55%,#1e0e04 100%)`;
const leatherBg = `repeating-linear-gradient(45deg,transparent 0px,transparent 6px,rgba(0,0,0,0.06) 6px,rgba(0,0,0,0.06) 7px),repeating-linear-gradient(-45deg,transparent 0px,transparent 6px,rgba(0,0,0,0.04) 6px,rgba(0,0,0,0.04) 7px),linear-gradient(160deg,#1e0e05 0%,#120800 100%)`;
const parchmentBg = `repeating-linear-gradient(92deg,transparent 0px,transparent 80px,rgba(0,0,0,0.015) 80px,rgba(0,0,0,0.015) 81px),linear-gradient(175deg,#fdf8ee 0%,#f5e8cc 50%,#ede0c0 100%)`;
const goldMetal = `linear-gradient(135deg,#f8d870 0%,#c89830 15%,#e8b840 30%,#a87820 45%,#c89830 55%,#f8d870 65%,#b08030 80%,#e8b840 100%)`;
const goldBtn = `linear-gradient(180deg,#f0c850 0%,#c89030 20%,#b07820 50%,#c89030 80%,#e8b040 100%)`;

function CubanRibbon({ height = 8, style = {} }) {
  const stripes = [
    { color: T.cubanBlueMid, flex: 1.2 }, { color: "rgba(255,255,255,0.15)", flex: 0.08 },
    { color: T.cubanWhite, flex: 0.5 }, { color: "rgba(255,255,255,0.15)", flex: 0.08 },
    { color: T.cubanRedMid, flex: 1.4 }, { color: "rgba(255,255,255,0.15)", flex: 0.08 },
    { color: T.cubanWhite, flex: 0.5 }, { color: "rgba(255,255,255,0.15)", flex: 0.08 },
    { color: T.cubanBlueMid, flex: 1.2 },
  ];
  return (
    <div style={{ display: "flex", height, position: "relative", ...style }}>
      {stripes.map((s, i) => <div key={i} style={{ flex: s.flex, background: s.color }} />)}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(255,255,255,0.08) 0%,transparent 50%,rgba(0,0,0,0.08) 100%)" }} />
    </div>
  );
}

function LuxuryGauge({ value = 69, size = 120, label = "% RH", subtitle = "", color = "#fff" }) {
  const cx = size / 2, cy = size / 2;
  const outerR = size * 0.46;
  const min = 20, max = 100;
  const startAng = -230, endAng = 50;
  const range = endAng - startAng;
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const toRad = d => (d - 90) * Math.PI / 180;
  const ticks = [];
  const totalTicks = 24;
  for (let i = 0; i <= totalTicks; i++) {
    const ang = startAng + (i / totalTicks) * range;
    const isMajor = i % 6 === 0;
    const isMid = i % 3 === 0;
    const r1 = outerR * (isMajor ? 0.68 : isMid ? 0.74 : 0.80);
    const r2 = outerR * 0.92;
    const rad = toRad(ang);
    ticks.push({ x1: cx + r1 * Math.cos(rad), y1: cy + r1 * Math.sin(rad), x2: cx + r2 * Math.cos(rad), y2: cy + r2 * Math.sin(rad), isMajor, isMid });
  }
  const labelData = [
    { v: 20, a: startAng }, { v: 40, a: startAng + range * 0.25 },
    { v: 60, a: startAng + range * 0.5 }, { v: 80, a: startAng + range * 0.75 },
    { v: 100, a: endAng }
  ];
  const needleAng = startAng + pct * range;
  const needleRad = toRad(needleAng);
  const nLen = outerR * 0.75;
  const nTail = outerR * 0.15;
  const nx = cx + nLen * Math.cos(needleRad);
  const ny = cy + nLen * Math.sin(needleRad);
  const ntx = cx - nTail * Math.cos(needleRad);
  const nty = cy - nTail * Math.sin(needleRad);
  const safeStart = startAng + ((65 - min) / (max - min)) * range;
  const safeEnd = startAng + ((72 - min) / (max - min)) * range;
  const arcR = outerR * 0.82;
  const arcX1 = cx + arcR * Math.cos(toRad(safeStart));
  const arcY1 = cy + arcR * Math.sin(toRad(safeStart));
  const arcX2 = cx + arcR * Math.cos(toRad(safeEnd));
  const arcY2 = cy + arcR * Math.sin(toRad(safeEnd));
  const goldC = color || T.goldLight;
  const uid = `g${size}${value}`;
  return (
    <div style={{ textAlign: "center", position: "relative" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))" }}>
        <defs>
          <radialGradient id={`${uid}dial`} cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fdf8ee"/><stop offset="40%" stopColor="#f5e8cc"/><stop offset="100%" stopColor="#e8d5aa"/>
          </radialGradient>
          <linearGradient id={`${uid}ring`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={T.goldShine}/><stop offset="20%" stopColor={T.goldLight}/>
            <stop offset="45%" stopColor={T.gold}/><stop offset="65%" stopColor={T.goldMid}/>
            <stop offset="85%" stopColor={T.goldLight}/><stop offset="100%" stopColor={T.goldFoil}/>
          </linearGradient>
          <linearGradient id={`${uid}needle`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={T.cubanRed}/><stop offset="50%" stopColor={T.cubanRedMid}/><stop offset="100%" stopColor={T.cubanRed}/>
          </linearGradient>
          <filter id={`${uid}glow`}>
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <radialGradient id={`${uid}glass`} cx="35%" cy="25%" r="65%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={outerR * 1.14} fill="rgba(0,0,0,0.5)"/>
        <circle cx={cx} cy={cy} r={outerR * 1.1} fill={`url(#${uid}ring)`}/>
        <circle cx={cx} cy={cy} r={outerR * 1.01} fill={T.goldDark}/>
        <circle cx={cx} cy={cy} r={outerR} fill={`url(#${uid}dial)`}/>
        <path d={`M ${arcX1} ${arcY1} A ${arcR} ${arcR} 0 0 1 ${arcX2} ${arcY2}`} stroke={T.success} strokeWidth={size * 0.025} fill="none" opacity="0.7" strokeLinecap="round"/>
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.isMajor ? T.inkSoft : t.isMid ? T.cedar4 : T.cedar3}
            strokeWidth={t.isMajor ? size*0.018 : t.isMid ? size*0.01 : size*0.006}
            opacity={t.isMajor ? 1 : t.isMid ? 0.75 : 0.5}/>
        ))}
        {labelData.map((l, i) => {
          const rad = toRad(l.a);
          const lr = outerR * 0.58;
          return <text key={i} x={cx + lr*Math.cos(rad)} y={cy + lr*Math.sin(rad)} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.10} fill={T.inkSoft} fontFamily="Georgia,serif" fontWeight="bold">{l.v}</text>;
        })}
        <text x={cx} y={cy - outerR*0.22} textAnchor="middle" fontSize={size*0.095} fill={T.cedar4} fontFamily="Georgia,serif" opacity="0.9">{label}</text>
        <line x1={cx+1} y1={cy+1} x2={nx+1} y2={ny+1} stroke="rgba(0,0,0,0.5)" strokeWidth={size*0.025} strokeLinecap="round"/>
        <line x1={ntx} y1={nty} x2={nx} y2={ny} stroke={`url(#${uid}needle)`} strokeWidth={size*0.022} strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r={size*0.075} fill={T.goldDark}/>
        <circle cx={cx} cy={cy} r={size*0.055} fill={`url(#${uid}ring)`}/>
        <circle cx={cx} cy={cy} r={size*0.028} fill="#111"/>
        <circle cx={cx} cy={cy} r={size*0.01} fill={goldC} opacity="0.8"/>
        <ellipse cx={cx - outerR*0.2} cy={cy - outerR*0.3} rx={outerR*0.35} ry={outerR*0.25} fill={`url(#${uid}glass)`}/>
      </svg>
      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: size*0.18, fontWeight: "bold", color: goldC, fontFamily: "Georgia,serif" }}>{value}</div>
        {subtitle && <div style={{ fontSize: size*0.09, color: T.muted, letterSpacing: 2, textTransform: "uppercase" }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function GoldBtn({ children, onClick, outline, style = {} }) {
  if (outline) return (
    <button onClick={onClick} style={{ background: "none", border: `1px solid ${T.brass}88`, borderRadius: 10, color: T.brass, padding: "12px 20px", cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 14, width: "100%", marginBottom: 10, letterSpacing: 0.5, ...style }}>{children}</button>
  );
  return (
    <button onClick={onClick} style={{ background: goldBtn, border: `1px solid ${T.goldDark}`, borderRadius: 10, color: T.ink, padding: "13px 20px", cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 14, fontWeight: "bold", width: "100%", marginBottom: 10, letterSpacing: 0.5, boxShadow: `0 4px 12px ${T.goldDark}66`, ...style }}>{children}</button>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${T.gold}88)` }} />
        <div style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: T.goldMid, fontFamily: "Georgia,serif" }}>{children}</div>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${T.gold}88,transparent)` }} />
      </div>
    </div>
  );
}

function CigarBandCard({ children, style = {} }) {
  return (
    <div style={{ background: parchmentBg, border: `1px solid ${T.goldMid}66`, borderRadius: 12, overflow: "hidden", marginBottom: 14, position: "relative", boxShadow: `0 6px 24px rgba(0,0,0,0.4),0 2px 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.8)`, ...style }}>
      <div style={{ height: 3, background: goldMetal, boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
      <div style={{ position: "absolute", left: 0, top: 3, bottom: 3, width: 7, display: "flex", flexDirection: "column" }}>
        {[T.cubanBlueMid, "#fff8f0", T.cubanRedMid, "#fff8f0", T.cubanBlueMid].map((c, i) => <div key={i} style={{ flex: i === 2 ? 1.4 : i % 2 === 0 ? 1 : 0.5, background: c }} />)}
      </div>
      <div style={{ position: "absolute", top: 3, right: 0, bottom: 3, width: 1, background: `linear-gradient(180deg,${T.goldMid}44,transparent,${T.goldMid}44)` }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: goldMetal, opacity: 0.6 }} />
      <div style={{ padding: "14px 14px 14px 20px" }}>{children}</div>
    </div>
  );
}

function HumidorCard({ h }) {
  const fillPct = (h.count / h.capacity) * 100;
  const rhOk = h.rh >= 65 && h.rh <= 72;
  const tempOk = h.temp >= 65 && h.temp <= 70;
  return (
    <div style={{ background: parchmentBg, border: `1px solid ${T.goldMid}55`, borderRadius: 16, overflow: "hidden", marginBottom: 20, boxShadow: `0 8px 32px rgba(0,0,0,0.45),0 2px 8px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.8)` }}>
      <div style={{ height: 4, background: goldMetal, boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }} />
      <CubanRibbon height={6} />
      <div style={{ padding: "18px 18px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: "bold", color: T.inkSoft, fontFamily: "Georgia,serif", marginBottom: 3 }}>{h.name}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{h.count} of {h.capacity} cigars</div>
          </div>
          <div style={{ background: rhOk && tempOk ? `linear-gradient(135deg,${T.success}22,${T.success}11)` : `linear-gradient(135deg,${T.danger}22,${T.danger}11)`, border: `1px solid ${rhOk && tempOk ? T.success : T.danger}66`, borderRadius: 20, padding: "5px 12px", fontSize: 11, color: rhOk && tempOk ? T.success : T.danger, fontWeight: "bold", boxShadow: `0 2px 8px ${rhOk && tempOk ? T.success : T.danger}22` }}>
            {rhOk && tempOk ? "✦ Optimal" : "⚠ Check"}
          </div>
        </div>
        <div style={{ height: 6, background: `linear-gradient(90deg,#d8c0a8,#e0cbb0)`, borderRadius: 3, marginBottom: 20, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min(fillPct, 100)}%`, background: goldMetal, borderRadius: 3 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", marginBottom: 16 }}>
          <LuxuryGauge value={h.rh} size={110} label="% RH" subtitle="Humidity" color={rhOk ? T.goldLight : T.danger} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 1, height: 60, background: `linear-gradient(180deg,transparent,${T.goldDark}66,transparent)` }} />
            <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase" }}>vs</div>
            <div style={{ width: 1, height: 60, background: `linear-gradient(180deg,transparent,${T.goldDark}66,transparent)` }} />
          </div>
          <LuxuryGauge value={h.temp} size={110} label="°F" subtitle="Temperature" color={tempOk ? T.goldLight : T.danger} />
        </div>
        <div style={{ padding: "10px 14px", background: `linear-gradient(135deg,${T.sapphire}33,${T.cubanBlue}22)`, borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.cubanBlueMid, boxShadow: `0 0 6px ${T.cubanBlueMid}` }} />
          <div style={{ fontSize: 11, color: T.brass }}>Sensor integration coming soon — connect for live readings</div>
        </div>
      </div>
      <div style={{ height: 3, background: goldMetal, opacity: 0.6 }} />
    </div>
  );
}

function DialIcon({ active }) {
  const c = active ? T.goldShine : T.brass;
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11.5" fill="rgba(0,0,0,0.6)" stroke={c} strokeWidth="1.2"/>
      <circle cx="14" cy="14" r="7" fill="none" stroke={c} strokeWidth="0.5" opacity="0.3"/>
      {Array.from({length:13}).map((_,i)=>{const a=(-220+i*20)*Math.PI/180;const isMaj=i%4===0;const r1=isMaj?7.5:8.5,r2=10.5;return <line key={i} x1={14+r1*Math.cos(a)} y1={14+r1*Math.sin(a)} x2={14+r2*Math.cos(a)} y2={14+r2*Math.sin(a)} stroke={c} strokeWidth={isMaj?1.2:0.7} opacity={isMaj?1:0.6}/>;})}
      <line x1="14" y1="14" x2="14" y2="6.5" stroke={active?"#e04040":"#8a3030"} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="14" cy="14" r="2" fill={c}/><circle cx="14" cy="14" r="0.8" fill="#111"/>
      <text x="14" y="20.5" textAnchor="middle" fontSize="3" fill={c} fontFamily="Georgia">RH · °F</text>
    </svg>
  );
}

function CigarIcon({ active }) {
  const c = active ? T.goldShine : T.brass;
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="11" width="19" height="5.5" rx="2.75" stroke={c} strokeWidth="1.2" fill="rgba(90,40,8,0.3)"/>
      <path d="M20.5 11 Q25 13.75 20.5 16.5" stroke={c} strokeWidth="1.3" fill="none"/>
      <rect x="7" y="11" width="4" height="5.5" fill={active?T.cubanRedMid:"#6b3a1f"} opacity="0.7"/>
      <rect x="7" y="11" width="4" height="1.5" fill={active?T.goldLight:T.brass} opacity="0.8"/>
      <path d="M21 10 Q22.5 7 21 4" stroke={c} strokeWidth="0.9" strokeLinecap="round" opacity="0.5"/>
      <path d="M23 10.5 Q24.5 7.5 23 5" stroke={c} strokeWidth="0.7" strokeLinecap="round" opacity="0.35"/>
      <rect x="2" y="17.5" width="22" height="3" rx="1.2" stroke={c} strokeWidth="0.8" fill="rgba(0,0,0,0.2)" opacity="0.4"/>
    </svg>
  );
}

function SommelierIcon({ active }) {
  const c = active ? T.goldShine : T.brass;
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="7.5" r="4" stroke={c} strokeWidth="1.3" fill="rgba(0,0,0,0.3)"/>
      <path d="M6 28 L6 18 Q6 13.5 14 13.5 Q22 13.5 22 18 L22 28" stroke={c} strokeWidth="1.3" fill="rgba(0,0,0,0.2)"/>
      <path d="M10.5 13.5 L12 17 L14 15.5" stroke={c} strokeWidth="1.2" fill="none"/>
      <path d="M17.5 13.5 L16 17 L14 15.5" stroke={c} strokeWidth="1.2" fill="none"/>
      <path d="M11 15.8 L14 17.8 L17 15.8 L14 13.8 Z" fill={active?T.cubanRedMid:T.muted} opacity="0.8"/>
      <circle cx="14" cy="20.5" r="0.8" fill={c}/><circle cx="14" cy="23.5" r="0.8" fill={c}/>
      <rect x="16.5" y="15.5" width="3" height="3.5" fill={active?T.cubanBlueMid:"#3a2010"} opacity="0.7"/>
    </svg>
  );
}

function NotesIcon({ active }) {
  const c = active ? T.goldShine : T.brass;
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="5.5" y="3.5" width="15" height="21" rx="2" stroke={c} strokeWidth="1.2" fill="rgba(240,220,180,0.08)"/>
      {[7,11,15,19].map(y=><circle key={y} cx="5.5" cy={y} r="1.2" stroke={c} strokeWidth="0.8" fill="none"/>)}
      {[8.5,11.5,14.5].map(y=><line key={y} x1="9" y1={y} x2="19" y2={y} stroke={c} strokeWidth="0.8" opacity="0.7"/>)}
      <line x1="9" y1="17.5" x2="15" y2="17.5" stroke={c} strokeWidth="0.8" opacity="0.5"/>
      <text x="9.5" y="22.5" fontSize="5.5" fill={active?T.goldLight:T.brass}>★★★</text>
    </svg>
  );
}

function GearIcon({ active }) {
  const c = active ? T.goldShine : T.brass;
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="3.8" stroke={c} strokeWidth="1.5" fill="none"/>
      <circle cx="14" cy="14" r="1.5" fill={c} opacity="0.5"/>
      {[0,45,90,135,180,225,270,315].map(a=>{const rad=a*Math.PI/180;const r1=7,r2=10.5;return <rect key={a} x={14+r1*Math.cos(rad)-1.3} y={14+r1*Math.sin(rad)-1.3} width="2.6" height="2.6" rx="0.8" fill={c} opacity={active?0.9:0.6} transform={`rotate(${a} ${14+r1*Math.cos(rad)} ${14+r1*Math.sin(rad)})`}/>;})}
    </svg>
  );
}

function CommunityIcon({ active }) {
  const c = active ? T.goldShine : T.brass;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="7" r="3" stroke={c} strokeWidth="1.2" fill="none"/>
      <circle cx="6" cy="9" r="2.2" stroke={c} strokeWidth="1" fill="none" opacity="0.7"/>
      <circle cx="20" cy="9" r="2.2" stroke={c} strokeWidth="1" fill="none" opacity="0.7"/>
      <path d="M7 22 L7 17 Q7 14 13 14 Q19 14 19 17 L19 22" stroke={c} strokeWidth="1.2" fill="rgba(0,0,0,0.2)"/>
      <path d="M1 22 L1 18 Q1 15.5 6 15.5" stroke={c} strokeWidth="1" fill="none" opacity="0.6"/>
      <path d="M25 22 L25 18 Q25 15.5 20 15.5" stroke={c} strokeWidth="1" fill="none" opacity="0.6"/>
      <circle cx="20" cy="5" r="3" fill={active?T.cubanRed:T.muted}/>
      <circle cx="20" cy="5" r="1.2" fill={c}/>
    </svg>
  );
}

function NewsIcon({ active }) {
  const c = active ? T.goldShine : T.brass;
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect x="3" y="4" width="16" height="19" rx="1.5" stroke={c} strokeWidth="1.2" fill="none" opacity="0.8"/>
      <rect x="6" y="7" width="10" height="5" rx="1" stroke={c} strokeWidth="0.9" fill="none" opacity="0.7"/>
      <line x1="6" y1="15" x2="16" y2="15" stroke={c} strokeWidth="0.9" opacity="0.6"/>
      <line x1="6" y1="17.5" x2="16" y2="17.5" stroke={c} strokeWidth="0.9" opacity="0.6"/>
      <line x1="6" y1="20" x2="12" y2="20" stroke={c} strokeWidth="0.9" opacity="0.5"/>
      <circle cx="21" cy="6" r="3" fill={active?T.cubanRed:T.muted}/>
      <circle cx="21" cy="6" r="1.2" fill={c}/>
    </svg>
  );
}

const MEMBER_BADGES = {
  "RobertoH": [{ icon: "🏆", label: "Top Reviewer", color: "#c89830" }],
  "CedarLounge": [{ icon: "🍃", label: "Aging Expert", color: "#1a5c35" }],
  "MiamiSmoke": [{ icon: "🥂", label: "Pairing Pro", color: "#002868" }],
  "HumidorKing": [{ icon: "🌿", label: "Padron Aficionado", color: "#c89830" }],
  "TabacaleroJ": [{ icon: "🇨🇺", label: "Cuban Collector", color: "#bf0a30" }],
  "You": [{ icon: "⭐", label: "New Member", color: "#8a6840" }],
};

const ALL_BADGES = [
  { icon: "🇨🇺", label: "Cuban Collector", color: "#bf0a30", desc: "Owns 5+ Cuban cigars" },
  { icon: "🏆", label: "Top Reviewer", color: "#c89830", desc: "10+ tasting notes logged" },
  { icon: "🍃", label: "Aging Expert", color: "#1a5c35", desc: "Cigars aged 2+ years" },
  { icon: "🥂", label: "Pairing Pro", color: "#002868", desc: "20+ pairing suggestions" },
  { icon: "🌿", label: "Padron Aficionado", color: "#8a5010", desc: "Owns 10+ Padrons" },
  { icon: "🔥", label: "Power Collector", color: "#9f0820", desc: "100+ cigars tracked" },
];

const TRENDING = {
  cigar: { name: "Padron 1964 Exclusivo", stat: "47 mentions this week", icon: "🚬" },
  review: { name: "Cohiba Behike BHK 52 Review", user: "RobertoH", likes: 41, icon: "⭐" },
  pairing: { name: "Liga Privada + Blanton's", saves: 28, icon: "🥂" },
};

const CATEGORIES = ["All", "Reviews", "Pairings", "Aging Tips", "Lounge Talk", "For Sale"];

const INIT_POSTS = [
  { id:"p1", user:"RobertoH", avatar:"🏆", category:"Reviews", time:"2h ago", title:"Padron 1964 — Still the King After All These Years", body:"Opened a box I laid down 18 months ago. The transformation is remarkable — deep cocoa, dried fruit, a sweetness that wasn't there at purchase. Patience rewarded.", tags:["Padron","Nicaragua","Aged"], likes:41, comments:8, liked:false },
  { id:"p2", user:"CedarLounge", avatar:"🍃", category:"Aging Tips", time:"5h ago", title:"The Rule of 6 Months — Why Your New Cigars Need Rest", body:"Every cigar that enters my humidor rests a minimum of 6 months before I touch it. The difference in draw, combustion, and flavor development is not subtle. It's the single best thing you can do for your collection.", tags:["Aging","Tips","Collection"], likes:28, comments:14, liked:false },
  { id:"p3", user:"MiamiSmoke", avatar:"🥂", category:"Pairings", time:"Yesterday", title:"Liga Privada No. 9 + Blanton's Single Barrel — Perfect Match", body:"The leather and dark fruit of the Liga meets the caramel and vanilla of the Blanton's in a way that elevates both. This is my current go-to Friday evening ritual.", tags:["Pairing","Bourbon","LigaPrivada"], likes:35, comments:19, liked:false },
];

const MARIO_PINNED = {
  date: "May 31, 2026",
  body: "This week I am recommending the pairing of a Liga Privada No. 9 with a pour of Blanton's Single Barrel. The leather notes in the liga find their counterpart in the oak of the bourbon. Smoke it slow — at least 90 minutes. You will not be disappointed.",
};

function CommunityTab({ apiKey }) {
  const [posts, setPosts] = useState(INIT_POSTS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showNewPost, setShowNewPost] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showTrending, setShowTrending] = useState(true);
  const [newPost, setNewPost] = useState({ title:"", body:"", category:"Reviews", photo:null });
  const [expandedPost, setExpandedPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [postComments, setPostComments] = useState({});
  const fileRef = useRef(null)();
  const filtered = activeCategory === "All" ? posts : posts.filter(p => p.category === activeCategory);
  const catColors = { "Reviews":T.cubanRed, "Pairings":"#1a5c35", "Aging Tips":T.goldMid, "Lounge Talk":T.cubanBlueMid, "For Sale":T.muted };
  const fi = { width:"100%", background:"rgba(0,0,0,0.4)", border:`1px solid ${T.goldDark}`, borderRadius:8, color:T.cream, padding:"10px 12px", fontFamily:"Georgia,serif", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:10 };
  const lbl = { fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.brass, marginBottom:6, display:"block" };
  const toggleLike = id => setPosts(p => p.map(x => x.id===id ? {...x, liked:!x.liked, likes:x.liked?x.likes-1:x.likes+1} : x));
  const handlePhoto = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setNewPost(p => ({...p, photo:ev.target.result})); r.readAsDataURL(f); };
  const submitPost = () => {
    if (!newPost.title.trim() || !newPost.body.trim()) return;
    setPosts(p => [{ id:`p${Date.now()}`, user:"You", avatar:"⭐", category:newPost.category, time:"Just now", title:newPost.title, body:newPost.body, tags:[], likes:0, comments:0, liked:false, photo:newPost.photo }, ...p]);
    setNewPost({ title:"", body:"", category:"Reviews", photo:null });
    setShowNewPost(false);
  };
  const submitComment = postId => {
    if (!newComment.trim()) return;
    setPostComments(p => ({...p, [postId]:[...(p[postId]||[]), {user:"You", avatar:"⭐", text:newComment, time:"Just now"}]}));
    setPosts(p => p.map(x => x.id===postId ? {...x, comments:x.comments+1} : x));
    setNewComment("");
  };
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <SectionTitle>Community</SectionTitle>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setShowBadges(true)} style={{ background:"none", border:`1px solid ${T.goldDark}88`, borderRadius:20, color:T.brass, padding:"6px 12px", fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif" }}>Badges</button>
          <button onClick={() => setShowNewPost(true)} style={{ background:goldBtn, border:`1px solid ${T.goldDark}`, borderRadius:20, color:T.ink, padding:"6px 12px", fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif", fontWeight:"bold" }}>+ Post</button>
        </div>
      </div>
      <div style={{ background:leatherBg, border:`1px solid ${T.goldMid}`, borderRadius:14, overflow:"hidden", marginBottom:16 }}>
        <div style={{ height:3, background:goldMetal }}/>
        <div style={{ padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <div style={{ width:9, height:9, borderRadius:"50%", background:T.goldLight, boxShadow:`0 0 8px ${T.goldLight}` }}/>
            <div style={{ fontSize:10, color:T.goldLight, letterSpacing:2, textTransform:"uppercase" }}>Mario's Pick This Week</div>
            <div style={{ marginLeft:"auto", fontSize:10, color:T.muted }}>{MARIO_PINNED.date}</div>
          </div>
          <div style={{ fontSize:13, color:T.cream, lineHeight:1.7, fontStyle:"italic" }}>{MARIO_PINNED.body}</div>
        </div>
        <div style={{ height:2, background:goldMetal, opacity:0.5 }}/>
      </div>
      {showTrending && (
        <div style={{ background:parchmentBg, border:`1px solid ${T.goldMid}44`, borderRadius:12, overflow:"hidden", marginBottom:16 }}>
          <div style={{ height:2, background:goldMetal }}/>
          <div style={{ padding:"12px 14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <span style={{ fontSize:14 }}>🔥</span>
              <div style={{ fontSize:10, color:T.cubanRed, letterSpacing:2, textTransform:"uppercase" }}>Trending This Week</div>
              <button onClick={() => setShowTrending(false)} style={{ marginLeft:"auto", background:"none", border:"none", color:T.muted, cursor:"pointer", fontSize:16 }}>×</button>
            </div>
            {[
              { label:"Most Discussed", name:TRENDING.cigar.name, sub:TRENDING.cigar.stat, icon:TRENDING.cigar.icon, color:T.cubanRed },
              { label:"Most Liked Review", name:TRENDING.review.name, sub:`by ${TRENDING.review.user} · ${TRENDING.review.likes} likes`, icon:TRENDING.review.icon, color:T.goldMid },
              { label:"Most Saved Pairing", name:TRENDING.pairing.name, sub:`${TRENDING.pairing.saves} saves`, icon:TRENDING.pairing.icon, color:"#1a5c35" },
            ].map((t,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<2?`1px solid ${T.goldDark}22`:"none" }}>
                <span style={{ fontSize:18 }}>{t.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color:t.color, letterSpacing:1, textTransform:"uppercase" }}>{t.label}</div>
                  <div style={{ fontSize:13, fontWeight:"bold", color:T.inkSoft }}>{t.name}</div>
                  <div style={{ fontSize:10, color:T.muted }}>{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display:"flex", gap:8, marginBottom:18, overflowX:"auto", paddingBottom:4 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{ background:activeCategory===cat?goldBtn:"none", border:`1px solid ${activeCategory===cat?T.goldDark:T.goldDark+"55"}`, borderRadius:20, padding:"6px 14px", color:activeCategory===cat?T.ink:T.brass, fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif", letterSpacing:0.5, whiteSpace:"nowrap", flexShrink:0, fontWeight:activeCategory===cat?"bold":"normal" }}>{cat}</button>
        ))}
      </div>
      {filtered.map(post => {
        const isEx = expandedPost === post.id;
        const comments = postComments[post.id] || [];
        const catColor = catColors[post.category] || T.muted;
        const badges = MEMBER_BADGES[post.user] || [];
        return (
          <div key={post.id} style={{ marginBottom:14 }}>
            <div style={{ background:parchmentBg, border:`1px solid ${T.goldMid}44`, borderRadius:14, overflow:"hidden", boxShadow:"0 4px 16px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.8)" }}>
              <div style={{ height:2, background:goldMetal }}/>
              {post.photo && <img src={post.photo} alt="" style={{ width:"100%", maxHeight:200, objectFit:"cover" }}/>}
              <div style={{ padding:"12px 14px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10 }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:goldMetal, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{post.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                      <div style={{ fontSize:13, fontWeight:"bold", color:T.inkSoft }}>{post.user}</div>
                      {badges.map((b,i) => <span key={i} style={{ background:`${b.color}18`, border:`1px solid ${b.color}44`, borderRadius:20, padding:"2px 8px", fontSize:9, color:b.color }}>{b.icon} {b.label}</span>)}
                    </div>
                    <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{post.time}</div>
                  </div>
                  <span style={{ background:`${catColor}18`, border:`1px solid ${catColor}44`, borderRadius:20, padding:"3px 10px", fontSize:9, color:catColor, letterSpacing:1, whiteSpace:"nowrap" }}>{post.category}</span>
                </div>
                <div style={{ fontSize:15, fontWeight:"bold", color:T.inkSoft, fontFamily:"Georgia,serif", marginBottom:8 }}>{post.title}</div>
                <div style={{ fontSize:13, color:T.ink, lineHeight:1.7, marginBottom:10 }}>{post.body}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:12 }}>
                  {post.tags.map(tag => <span key={tag} style={{ background:`${T.goldDark}18`, border:`1px solid ${T.goldDark}44`, borderRadius:20, padding:"2px 8px", fontSize:10, color:T.muted }}>#{tag}</span>)}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:16, paddingTop:10, borderTop:`1px solid ${T.goldDark}22` }}>
                  <button onClick={() => toggleLike(post.id)} style={{ background:"none", border:"none", cursor:"pointer", color:T.muted, fontSize:13, fontFamily:"Georgia,serif" }}>
                    <span style={{ fontSize:16 }}>{post.liked?"❤️":"🤍"}</span> {post.likes}
                  </button>
                  <button onClick={() => setExpandedPost(isEx?null:post.id)} style={{ background:"none", border:"none", cursor:"pointer", color:T.muted, fontSize:13, fontFamily:"Georgia,serif" }}>
                    <span style={{ fontSize:14 }}>💬</span> {post.comments+comments.length}
                  </button>
                  <button style={{ background:"none", border:"none", cursor:"pointer", color:T.muted, fontSize:13, fontFamily:"Georgia,serif", marginLeft:"auto" }}>Share</button>
                </div>
              </div>
            </div>
            {isEx && (
              <div style={{ background:"rgba(0,0,0,0.25)", border:`1px solid ${T.goldDark}33`, borderRadius:"0 0 12px 12px", padding:"14px 14px 10px", marginTop:-6 }}>
                {[{user:"CedarLounge",avatar:"🍃",text:"Great share! Completely agree.",time:"1h ago"}, ...comments].map((c,i) => (
                  <div key={i} style={{ display:"flex", gap:10, marginBottom:12 }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:`${T.goldDark}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{c.avatar}</div>
                    <div style={{ flex:1, background:"rgba(0,0,0,0.2)", borderRadius:"4px 12px 12px 12px", padding:"8px 12px" }}>
                      <div style={{ fontSize:11, color:T.goldMid, fontWeight:"bold", marginBottom:4 }}>{c.user}</div>
                      <div style={{ fontSize:12, color:T.cream, lineHeight:1.6 }}>{c.text}</div>
                    </div>
                  </div>
                ))}
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:goldMetal, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>⭐</div>
                  <input style={{ ...fi, flex:1, fontSize:12, padding:"8px 11px", marginBottom:0 }} placeholder="Add a comment..." value={newComment} onChange={e=>setNewComment(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitComment(post.id)}/>
                  <button onClick={() => submitComment(post.id)} style={{ background:goldBtn, border:`1px solid ${T.goldDark}`, borderRadius:8, color:T.ink, padding:"8px 14px", cursor:"pointer", fontFamily:"Georgia,serif", fontWeight:"bold" }}>→</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {showBadges && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div style={{ background:cedarBg, border:`1px solid ${T.goldDark}`, borderRadius:"20px", width:"100%", maxWidth:400, maxHeight:"80vh", overflowY:"auto" }}>
            <div style={{ height:3, background:goldMetal }}/><CubanRibbon height={5}/>
            <div style={{ padding:"20px 20px 0" }}>
              <div style={{ fontSize:18, color:T.goldLight, fontFamily:"Georgia,serif", textAlign:"center", marginBottom:6 }}>Community Badges</div>
              <div style={{ fontSize:12, color:T.muted, textAlign:"center", fontStyle:"italic", marginBottom:20 }}>Earn badges by contributing to the community</div>
              {ALL_BADGES.map((b,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:i<ALL_BADGES.length-1?`1px solid ${T.goldDark}22`:"none" }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:`${b.color}22`, border:`1px solid ${b.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{b.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:"bold", color:b.color, marginBottom:3 }}>{b.label}</div>
                    <div style={{ fontSize:12, color:T.muted, fontStyle:"italic" }}>{b.desc}</div>
                  </div>
                </div>
              ))}
              <GoldBtn outline onClick={() => setShowBadges(false)}>Close</GoldBtn>
            </div>
          </div>
        </div>
      )}
      {showNewPost && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:20 }}>
          <div style={{ background:cedarBg, border:`1px solid ${T.goldDark}`, borderRadius:"20px", width:"100%", maxWidth:400, maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ height:3, background:goldMetal }}/><CubanRibbon height={5}/>
            <div style={{ padding:"20px 20px 0" }}>
              <div style={{ fontSize:18, color:T.goldLight, fontFamily:"Georgia,serif", textAlign:"center", marginBottom:20 }}>New Post</div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Category</label>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {["Reviews","Pairings","Aging Tips","Lounge Talk","For Sale"].map(cat => (
                    <button key={cat} onClick={() => setNewPost(p => ({...p,category:cat}))} style={{ background:newPost.category===cat?goldBtn:"none", border:`1px solid ${T.goldDark}${newPost.category===cat?"":"55"}`, borderRadius:20, padding:"5px 12px", color:newPost.category===cat?T.ink:T.brass, fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif" }}>{cat}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>📷 Add Photo (optional)</label>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handlePhoto}/>
                {newPost.photo ? (
                  <div style={{ position:"relative" }}>
                    <img src={newPost.photo} alt="" style={{ width:"100%", maxHeight:160, objectFit:"cover", borderRadius:8 }}/>
                    <button onClick={() => setNewPost(p => ({...p,photo:null}))} style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.7)", border:"none", borderRadius:"50%", width:28, height:28, color:"#fff", cursor:"pointer", fontSize:16 }}>×</button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current.click()} style={{ width:"100%", background:"rgba(0,0,0,0.3)", border:`1px dashed ${T.goldDark}`, borderRadius:8, color:T.brass, padding:"20px", cursor:"pointer", fontFamily:"Georgia,serif", fontSize:13 }}>
                    <span style={{ fontSize:20 }}>📷</span> Add Photo
                  </button>
                )}
              </div>
              <div style={{ marginBottom:14 }}><label style={lbl}>Title</label><input style={fi} placeholder="Post title..." value={newPost.title} onChange={e=>setNewPost(p=>({...p,title:e.target.value}))}/></div>
              <div style={{ marginBottom:14 }}><label style={lbl}>Your Post</label><textarea style={{ ...fi, minHeight:100, resize:"vertical" }} placeholder="Share your thoughts..." value={newPost.body} onChange={e=>setNewPost(p=>({...p,body:e.target.value}))}/></div>
              <GoldBtn onClick={submitPost}>Post to Community</GoldBtn>
              <GoldBtn outline onClick={() => setShowNewPost(false)}>Cancel</GoldBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FALLBACK_NEWS = [
  { id:"1", title:"Padron 1964 Anniversary Series — A Retrospective", summary:"Forty years of Nicaraguan excellence. How the Padron family changed premium cigars forever.", source:"Cigar Aficionado", date:"May 30, 2026", icon:"📰", color:T.cubanRed },
  { id:"2", title:"Arturo Fuente Opus X: The Story Behind the Legend", summary:"How a Dominican factory became the most coveted cigar in the world. A rare look inside Chateau de la Fuente.", source:"Halfwheel", date:"May 29, 2026", icon:"📰", color:T.goldMid },
  { id:"3", title:"2026 Cigar of the Year Contenders Revealed", summary:"From Nicaragua to Honduras, the top-rated cigars of the year so far. Our panel weighs in.", source:"Cigar Advisor", date:"May 28, 2026", icon:"📰", color:"#1a5c35" },
  { id:"4", title:"Humidity Control: The Science Behind the Perfect Humidor", summary:"Experts explain the chemistry of cedar aging, the 70/70 rule, and why boveda may be changing everything.", source:"Halfwheel", date:"May 27, 2026", icon:"📰", color:T.cubanBlueMid },
  { id:"5", title:"Cohiba Behike BHK 52 — Still the King?", summary:"Five years after its debut, we revisit the most controversial and celebrated Cuban release of the decade.", source:"Cigar Aficionado", date:"May 26, 2026", icon:"📰", color:T.cubanRed },
  { id:"6", title:"The Rise of Nicaraguan Cigars: A New Golden Age", summary:"Nicaragua has surpassed Cuba and the Dominican Republic in ratings volume. A deep dive into why.", source:"Cigar Advisor", date:"May 25, 2026", icon:"📰", color:T.goldMid },
];

function NewsTab({ apiKey, cigars }) {
  const [articles, setArticles] = useState(FALLBACK_NEWS);
  const [loading, setLoading] = useState(false);
  const [activeSource, setActiveSource] = useState("All");
  const [marioTake, setMarioTake] = useState("");
  const [marioLoading, setMarioLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const getMarioTake = async (article) => {
    setMarioLoading(true); setMarioTake("");
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:300,
          system:`You are Mario, the luxury cigar sommelier. Given a news headline, give a warm, expert 2-3 sentence personal take. Be specific and knowledgeable. No preamble.`,
          messages:[{ role:"user", content:`News: "${article.title}". What's your take?` }]
        })
      });
      const data = await res.json();
      setMarioTake(data.content?.find(b => b.type === "text")?.text ?? data.error?.message ?? "Mario is thinking...");
    } catch { setMarioTake("Connection issue — add your API key in Settings to enable Mario's commentary."); }
    setMarioLoading(false);
  };

  const sources = ["All", "Cigar Aficionado", "Halfwheel", "Cigar Advisor"];
  const filtered = activeSource === "All" ? articles : articles.filter(a => a.source === activeSource);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <SectionTitle>Cigar News</SectionTitle>
        <button onClick={() => setArticles([...FALLBACK_NEWS])} style={{ background:"none", border:`1px solid ${T.goldDark}88`, borderRadius:20, color:T.brass, padding:"5px 12px", fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif" }}>↻ Refresh</button>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:18, overflowX:"auto", paddingBottom:4 }}>
        {sources.map(s => (
          <button key={s} onClick={() => setActiveSource(s)} style={{ background:activeSource===s?goldBtn:"none", border:`1px solid ${activeSource===s?T.goldDark:T.goldDark+"55"}`, borderRadius:20, padding:"6px 14px", color:activeSource===s?T.ink:T.brass, fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif", letterSpacing:0.5, whiteSpace:"nowrap", flexShrink:0, fontWeight:activeSource===s?"bold":"normal" }}>{s}</button>
        ))}
      </div>
      {filtered.map((article, idx) => (
        <div key={article.id || idx}>
          <div style={{ background:parchmentBg, border:`1px solid ${T.goldMid}44`, borderRadius:14, overflow:"hidden", marginBottom:14, boxShadow:"0 4px 16px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.8)", cursor:"pointer" }} onClick={() => setSelectedArticle(selectedArticle?.id===article.id?null:article)}>
            <div style={{ height:2, background:goldMetal }}/>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px 4px" }}>
              <span style={{ fontSize:14 }}>{article.icon}</span>
              <span style={{ fontSize:9, color:article.color||T.muted, letterSpacing:2, textTransform:"uppercase", fontFamily:"Georgia,serif" }}>{article.source}</span>
              <span style={{ marginLeft:"auto", fontSize:10, color:T.muted }}>{article.date}</span>
            </div>
            <div style={{ padding:"4px 14px 14px" }}>
              <div style={{ fontSize:15, fontWeight:"bold", color:T.inkSoft, fontFamily:"Georgia,serif", marginBottom:6, lineHeight:1.4 }}>{article.title}</div>
              <div style={{ fontSize:12, color:T.muted, lineHeight:1.6, fontStyle:"italic" }}>{article.summary}</div>
              <button onClick={e => { e.stopPropagation(); getMarioTake(article); setSelectedArticle(article); }} style={{ background:"none", border:`1px solid ${T.goldDark}55`, borderRadius:20, padding:"5px 12px", color:T.goldMid, fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif", marginTop:10, letterSpacing:0.5 }}>🎩 Mario's Take</button>
            </div>
          </div>
          {selectedArticle?.id === article.id && (
            <div style={{ background:leatherBg, border:`1px solid ${T.goldDark}`, borderLeft:`3px solid ${T.goldMid}`, borderRadius:"0 12px 12px 12px", padding:"14px 16px", marginTop:-10, marginBottom:14, boxShadow:"0 4px 16px rgba(0,0,0,0.4)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:T.goldLight, boxShadow:`0 0 6px ${T.goldLight}` }}/>
                <div style={{ fontSize:11, color:T.goldLight, letterSpacing:1.5, textTransform:"uppercase" }}>Mario's Take</div>
              </div>
              {marioLoading ? <div style={{ color:T.muted, fontSize:13, fontStyle:"italic" }}>Mario is reading the room...</div>
               : marioTake ? <div style={{ fontSize:14, color:T.cream, lineHeight:1.7, fontStyle:"italic" }}>{marioTake}</div>
               : <div style={{ color:T.muted, fontSize:13 }}>Tap Mario's Take above to get his commentary.</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const tabs = [
    ["humidors","Humidors", DialIcon],
    ["collection","Collection", CigarIcon],
    ["sommelier","Ask Mario", SommelierIcon],
    ["news","News", NewsIcon],
    ["community","Community", CommunityIcon],
    ["notes","Notes", NotesIcon],
    ["settings","Settings", GearIcon],
  ];
  return (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:cedarBg, zIndex:100, boxShadow:"0 -4px 20px rgba(0,0,0,0.6)" }}>
      <div style={{ height:2, background:goldMetal, opacity:0.8 }}/>
      <CubanRibbon height={4}/>
      <div style={{ display:"flex", padding:"8px 0 10px" }}>
        {tabs.map(([id, label, Icon]) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{ flex:1, background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"4px 2px", position:"relative" }}>
              {active && (
                <>
                  <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:2, background:goldMetal, borderRadius:"0 0 2px 2px" }}/>
                  <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 0%,${T.goldDark}22,transparent 70%)` }}/>
                </>
              )}
              <div style={{ filter:active?`drop-shadow(0 0 6px ${T.goldLight})`:"none" }}>
                <Icon active={active}/>
              </div>
              <span style={{ fontSize:7.5, letterSpacing:0.8, color:active?T.goldLight:T.brass, fontFamily:"Georgia,serif", textTransform:"uppercase" }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AppHeader({ totalCigars, totalValue }) {
  return (
    <div style={{ background:cedarBg, position:"sticky", top:0, zIndex:50, boxShadow:"0 4px 20px rgba(0,0,0,0.5)" }}>
      <CubanRibbon height={7}/>
      <div style={{ height:1.5, background:goldMetal, opacity:0.6 }}/>
      <div style={{ padding:"14px 18px 12px", display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:goldMetal, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:"bold", color:T.ink, fontFamily:"Georgia,serif", boxShadow:`0 4px 12px ${T.goldDark}88` }}>M</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:21, fontWeight:"bold", color:T.goldLight, fontFamily:"Georgia,serif", letterSpacing:1 }}>Mario's Humidor</div>
          <div style={{ fontSize:9, color:T.brass, letterSpacing:3.5, textTransform:"uppercase" }}>The Cigar Lifestyle Platform</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:19, fontWeight:"bold", color:T.goldLight, fontFamily:"Georgia,serif" }}>{totalCigars}</div>
          <div style={{ fontSize:9, color:T.brass, letterSpacing:1 }}>CIGARS</div>
          <div style={{ fontSize:11, color:T.goldMid, letterSpacing:0.5 }}>${totalValue.toFixed(0)} est.</div>
        </div>
      </div>
      <div style={{ height:1.5, background:goldMetal, opacity:0.5 }}/>
      <CubanRibbon height={5}/>
    </div>
  );
}

const HUMIDORS = [
  { id:1, name:"Main Humidor", capacity:150, count:87, temp:68, rh:69 },
  { id:2, name:"Travel Case", capacity:20, count:12, temp:70, rh:67 },
  { id:3, name:"Raching MON1800A", capacity:900, count:210, temp:67, rh:70 },
];

const CIGARS = [
  { id:1, brand:"Arturo Fuente", line:"Opus X", vitola:"Robusto", origin:"Dominican Republic", qty:6, year:2023, wrapper:"Rosado", purchaseDate:"2023-06-15", price:45 },
  { id:2, brand:"Padron", line:"1964 Anniversary", vitola:"Exclusivo", origin:"Nicaragua", qty:12, year:2022, wrapper:"Natural", purchaseDate:"2022-11-20", price:28 },
  { id:3, brand:"Cohiba", line:"Behike", vitola:"BHK 52", origin:"Cuba", qty:5, year:2021, wrapper:"Medio Tiempo", purchaseDate:"2021-08-10", price:85 },
  { id:4, brand:"My Father", line:"Le Bijou 1922", vitola:"Torpedo", origin:"Nicaragua", qty:18, year:2024, wrapper:"Oscuro", purchaseDate:"2024-01-05", price:18 },
  { id:5, brand:"Liga Privada", line:"No. 9", vitola:"Robusto", origin:"Nicaragua", qty:24, year:2024, wrapper:"Brazilian Mata Fina", purchaseDate:"2024-03-12", price:22 },
  { id:6, brand:"Plasencia", line:"Alma Fuerte", vitola:"Box Pressed", origin:"Nicaragua", qty:10, year:2023, wrapper:"Habano", purchaseDate:"2023-09-01", price:32 },
];

const NOTES_DATA = [
  { id:1, brand:"Padron 1964", vitola:"Exclusivo", rating:5, notes:"Rich dark chocolate and dried fruit — 18 months of aging has transformed this cigar completely. The draw is effortless, burn line ruler-straight. A meditation in a stick.", pairing:"Blanton's Single Barrel" },
  { id:2, brand:"Arturo Fuente Opus X", vitola:"Robusto", rating:4, notes:"Spicy cedar entry, black pepper through the first third. Creamy sweetness emerges at the midpoint. A complex, rewarding smoke that rewards patience.", pairing:"Aged Rum" },
];

const INIT_MSGS = [{ role:"ai", text:"Good evening. I am Mario — your personal cigar maestro. Tell me what you're smoking tonight, what you're in the mood for, or what you'd like to know. I am here." }];

function daysSince(d) { return d ? Math.floor((new Date() - new Date(d)) / 86400000) : 0; }
function formatAge(d) { const days = daysSince(d); if (days < 30) return `${days}d`; if (days < 365) return `${Math.floor(days/30)}mo`; return `${Math.floor(days/365)}yr ${Math.floor((days%365)/30)}mo`; }
function formatDate(d) { return d ? new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "—"; }

function ScannerModal({ onClose, onResult, apiKey }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(null);
  const handleFile = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setPreview(ev.target.result); r.readAsDataURL(f); };
  const scan = async () => {
    if (!preview) return;
    setScanning(true);
    try {
      const base64 = preview.split(",")[1], mediaType = preview.split(";")[0].split(":")[1];
      const res = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:500,
          system:"You are a cigar band identification expert. Analyze the cigar band image and return ONLY valid JSON with keys: brand, line, vitola, wrapper, origin, strength, confidence (high/medium/low), notes. No markdown.",
          messages:[{ role:"user", content:[{ type:"image", source:{ type:"base64", media_type:mediaType, data:base64 }},{ type:"text", text:"Identify this cigar band and return JSON only." }]}]
        })
      });
      const data = await res.json();
      setScanned(JSON.parse(data.content?.find(b => b.type === "text")?.text?.replace(/```json|```/g,"").trim() || "{}"));
    } catch { setScanned({ confidence:"low", notes:"Please try a clearer photo of the band" }); }
    setScanning(false);
  };
  const fi = { width:"100%", background:"rgba(0,0,0,0.5)", border:`1px solid ${T.goldDark}`, borderRadius:8, color:T.cream, padding:"10px 12px", fontFamily:"Georgia,serif", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:8 };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:20 }}>
      <div style={{ background:cedarBg, border:`1px solid ${T.goldDark}`, borderRadius:"20px", width:"100%", maxWidth:400, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ height:4, background:goldMetal }}/><CubanRibbon height={6}/>
        <div style={{ padding:"20px 20px 0" }}>
          <div style={{ fontSize:18, color:T.goldLight, fontFamily:"Georgia,serif", textAlign:"center", marginBottom:20 }}>🔍 Band Scanner</div>
          <div style={{ background:"rgba(0,0,0,0.5)", border:`2px dashed ${T.gold}55`, borderRadius:12, minHeight:140, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, overflow:"hidden" }}>
            {preview ? <img src={preview} alt="" style={{ width:"100%", maxHeight:200, objectFit:"cover" }}/> : <div style={{ textAlign:"center", color:T.muted, padding:20 }}>📷<br/><span style={{ fontSize:12 }}>No image selected</span></div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={handleFile}/>
          {!preview && <div style={{ display:"flex", gap:10, marginBottom:10 }}>
            <button style={{ flex:1, background:`${T.cubanBlueMid}33`, border:`1px solid ${T.cubanBlueMid}66`, borderRadius:8, color:T.cream, padding:"10px", cursor:"pointer", fontFamily:"Georgia,serif", fontSize:12 }} onClick={() => fileRef.current.click()}>📷 Take Photo</button>
            <button style={{ flex:1, background:"none", border:`1px solid ${T.goldDark}`, borderRadius:8, color:T.brass, padding:"10px", cursor:"pointer", fontFamily:"Georgia,serif", fontSize:12 }} onClick={() => fileRef.current.click()}>📁 Choose File</button>
          </div>}
          {preview && !scanned && <GoldBtn onClick={scan}>{scanning ? "🔍 Identifying Band..." : "🔍 Identify Cigar"}</GoldBtn>}
          {preview && !scanned && <GoldBtn outline onClick={() => setPreview(null)}>Retake Photo</GoldBtn>}
          {scanned && <div>
            <div style={{ background:"rgba(0,0,0,0.4)", border:`1px solid ${T.goldDark}`, borderRadius:10, padding:"14px", marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ fontSize:14, color:T.goldLight, fontWeight:"bold" }}>AI Identification</div>
                <span style={{ background:`${T.success}22`, border:`1px solid ${T.success}44`, borderRadius:20, padding:"2px 10px", fontSize:10, color:T.success }}>{scanned.confidence} confidence</span>
              </div>
              {[["Brand",scanned.brand],["Line",scanned.line],["Vitola",scanned.vitola],["Wrapper",scanned.wrapper],["Origin",scanned.origin],["Strength",scanned.strength]].map(([k,v]) => v && (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${T.goldDark}22` }}>
                  <span style={{ fontSize:11, color:T.muted }}>{k}</span>
                  <span style={{ fontSize:13, color:T.inkSoft, fontWeight:"bold" }}>{v}</span>
                </div>
              ))}
              {scanned.notes && <div style={{ fontSize:11, color:T.muted, marginTop:8, fontStyle:"italic" }}>{scanned.notes}</div>}
            </div>
            <GoldBtn onClick={() => { onResult({...scanned}); onClose(); }}>✓ Use These Details</GoldBtn>
            <GoldBtn outline onClick={() => { setPreview(null); setScanned(null); }}>Scan Again</GoldBtn>
          </div>}
          <GoldBtn outline onClick={onClose}>Cancel</GoldBtn>
        </div>
      </div>
    </div>
  );
}

const EMPTY = { brand:"", line:"", vitola:"", origin:"", qty:"", year:"", wrapper:"", purchaseDate:null, price:"", retailer:"" };

function AddCigarModal({ onClose, onAdd, prefill={} }) {
  const [form, setForm] = useState({ ...EMPTY, ...prefill });
  const set = (k,v) => setForm(f => ({...f,[k]:v}));
  const fi = { width:"100%", background:"rgba(0,0,0,0.45)", border:`1px solid ${T.goldDark}`, borderRadius:8, color:T.cream, padding:"10px 12px", fontFamily:"Georgia,serif", fontSize:13, outline:"none", boxSizing:"border-box" };
  const lbl = { fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.brass, marginBottom:6, display:"block" };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:20 }}>
      <div style={{ background:cedarBg, border:`1px solid ${T.goldDark}`, borderRadius:"20px", width:"100%", maxWidth:400, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ height:3, background:goldMetal }}/><CubanRibbon height={5}/>
        <div style={{ padding:"20px 20px 0" }}>
          <div style={{ fontSize:18, color:T.goldLight, fontFamily:"Georgia,serif", textAlign:"center", marginBottom:20 }}>Add to Collection</div>
          {prefill.brand && <div style={{ background:`${T.success}22`, border:`1px solid ${T.success}44`, borderRadius:8, padding:"8px 12px", marginBottom:14, fontSize:12, color:T.success }}>✓ Pre-filled from band scan</div>}
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <div style={{ flex:1 }}><label style={lbl}>Brand *</label><input style={fi} placeholder="e.g. Padron" value={form.brand} onChange={e=>set("brand",e.target.value)}/></div>
            <div style={{ flex:1 }}><label style={lbl}>Line *</label><input style={fi} placeholder="e.g. 1964" value={form.line} onChange={e=>set("line",e.target.value)}/></div>
          </div>
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <div style={{ flex:1 }}><label style={lbl}>Vitola</label><input style={fi} placeholder="e.g. Robusto" value={form.vitola} onChange={e=>set("vitola",e.target.value)}/></div>
            <div style={{ flex:1 }}><label style={lbl}>Wrapper</label><input style={fi} placeholder="e.g. Maduro" value={form.wrapper} onChange={e=>set("wrapper",e.target.value)}/></div>
          </div>
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            <div style={{ flex:1 }}><label style={lbl}>Origin</label><input style={fi} placeholder="e.g. Nicaragua" value={form.origin} onChange={e=>set("origin",e.target.value)}/></div>
            <div style={{ flex:1 }}><label style={lbl}>Year</label><input style={fi} placeholder="2024" value={form.year} onChange={e=>set("year",e.target.value)}/></div>
          </div>
          <div style={{ background:"rgba(0,0,0,0.35)", border:`1px solid ${T.goldDark}44`, borderRadius:10, padding:"12px", marginBottom:14 }}>
            <div style={{ fontSize:10, color:T.goldMid, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Purchase Details</div>
            <div style={{ display:"flex", gap:10, marginBottom:10 }}>
              <div style={{ flex:1 }}><label style={lbl}>Purchase Date</label><input type="date" style={fi} value={form.purchaseDate||""} onChange={e=>set("purchaseDate",e.target.value)}/></div>
              <div style={{ flex:1 }}><label style={lbl}>Price Each</label><input style={fi} placeholder="$0.00" value={form.price} onChange={e=>set("price",e.target.value)}/></div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <div style={{ flex:1 }}><label style={lbl}>Quantity</label><input style={fi} placeholder="1" value={form.qty} onChange={e=>set("qty",e.target.value)}/></div>
              <div style={{ flex:1 }}><label style={lbl}>Retailer</label><input style={fi} placeholder="e.g. Famous Smoke" value={form.retailer} onChange={e=>set("retailer",e.target.value)}/></div>
            </div>
          </div>
          <GoldBtn onClick={() => { if (!form.brand||!form.line) return; onAdd({...form, id:Date.now(), qty:parseInt(form.qty)||1, price:parseFloat(form.price)||0, year:parseInt(form.year)||new Date().getFullYear()}); onClose(); }}>✦ Add to Collection</GoldBtn>
          <GoldBtn outline onClick={onClose}>Cancel</GoldBtn>
        </div>
      </div>
    </div>
  );
}

function LogNoteModal({ onClose, onAdd, cigars }) {
  const [form, setForm] = useState({ cigarId:"", rating:5, notes:"", pairing:"" });
  const fi = { width:"100%", background:"rgba(0,0,0,0.45)", border:`1px solid ${T.goldDark}`, borderRadius:8, color:T.cream, padding:"10px 12px", fontFamily:"Georgia,serif", fontSize:13, outline:"none", boxSizing:"border-box" };
  const lbl = { fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.brass, marginBottom:6, display:"block" };
  const sel = cigars.find(c=>c.id===parseInt(form.cigarId));
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:20 }}>
      <div style={{ background:leatherBg, border:`1px solid ${T.goldDark}`, borderRadius:"20px", width:"100%", maxWidth:400, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ height:3, background:goldMetal }}/><CubanRibbon height={5}/>
        <div style={{ padding:"20px 20px 0" }}>
          <div style={{ fontSize:18, color:T.goldLight, fontFamily:"Georgia,serif", textAlign:"center", marginBottom:20 }}>Log a Smoke</div>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Cigar Smoked</label>
            <select style={{ ...fi, appearance:"none" }} value={form.cigarId} onChange={e=>setForm(f=>({...f,cigarId:e.target.value}))}>
              <option value="">Select cigar...</option>
              {cigars.map(c=><option key={c.id} value={c.id}>{c.brand} {c.line} — {c.vitola}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>Rating</label>
            <div style={{ display:"flex", gap:4 }}>{[1,2,3,4,5].map(i=><span key={i} onClick={()=>setForm(f=>({...f,rating:i}))} style={{ fontSize:28, cursor:"pointer", color:i<=form.rating?T.goldShine:"#3a2810", filter:i<=form.rating?"drop-shadow(0 0 4px rgba(248,216,112,0.6))":"none", transition:"all 0.1s" }}>★</span>)}</div>
          </div>
          <div style={{ marginBottom:12 }}><label style={lbl}>Tasting Notes</label><textarea style={{ ...fi, minHeight:80, resize:"vertical" }} placeholder="Describe the flavors, draw, burn..." value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
          <div style={{ marginBottom:12 }}><label style={lbl}>Pairing</label><input style={fi} placeholder="e.g. Blanton's, Espresso..." value={form.pairing} onChange={e=>setForm(f=>({...f,pairing:e.target.value}))}/></div>
          <GoldBtn onClick={()=>{ if(!sel) return; onAdd({id:Date.now(), brand:`${sel.brand} ${sel.line}`, vitola:sel.vitola, rating:form.rating, notes:form.notes, pairing:form.pairing}); onClose(); }}>✦ Save Note</GoldBtn>
          <GoldBtn outline onClick={onClose}>Cancel</GoldBtn>
        </div>
      </div>
    </div>
  );
}

function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);
  const [_] = useState(() => {
    setTimeout(() => setPhase(1), 600);
    setTimeout(() => setPhase(2), 1400);
    setTimeout(() => setPhase(3), 2200);
    setTimeout(() => onComplete(), 3200);
    return true;
  });
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:cedarBg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", maxWidth:430, margin:"0 auto" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 40%,rgba(200,152,48,0.12) 0%,transparent 70%)" }}/>
      <CubanRibbon height={7} style={{ position:"absolute", top:0, left:0, right:0 }}/>
      <div style={{ fontFamily:"'Georgia', serif", fontSize:130, background:goldMetal, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", lineHeight:1, filter:"drop-shadow(0 0 40px rgba(200,152,48,0.4)) drop-shadow(0 4px 20px rgba(0,0,0,0.8))", opacity:phase>=1?1:0, transform:phase>=1?"scale(1)":"scale(0.8)", transition:"all 0.8s cubic-bezier(0.34,1.56,0.64,1)", marginBottom:8, position:"relative", zIndex:1 }}>M</div>
      <div style={{ fontFamily:"Georgia,serif", fontSize:22, color:T.goldLight, letterSpacing:6, opacity:phase>=2?1:0, transform:phase>=2?"translateY(0)":"translateY(20px)", transition:"all 0.6s ease", textShadow:`0 2px 12px ${T.goldDark}`, marginBottom:6 }}>MARIO'S HUMIDOR</div>
      <div style={{ fontSize:10, color:T.brass, letterSpacing:4, textTransform:"uppercase", opacity:phase>=2?1:0, transition:"all 0.6s ease 0.1s" }}>The Cigar Lifestyle Platform</div>
      <div style={{ position:"absolute", bottom:60, opacity:phase>=3?1:0, transition:"opacity 0.4s ease", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
        <div style={{ display:"flex", gap:6 }}>
          {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:T.goldMid, animation:`splashPulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
        </div>
        <div style={{ fontSize:10, color:T.muted, letterSpacing:2 }}>PREPARING YOUR COLLECTION</div>
      </div>
      <CubanRibbon height={5} style={{ position:"absolute", bottom:0, left:0, right:0 }}/>
      <style>{`@keyframes splashPulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.5);opacity:1}}`}</style>
    </div>
  );
}

const ONBOARD_SCREENS = [
  { icon:"🪵", title:"Welcome to\nMario's Humidor", subtitle:"The world's most refined cigar collection management platform.", detail:"Built for collectors who demand excellence.", cta:"Begin" },
  { icon:"🚬", title:"Your Collection,\nPerfected", subtitle:"Track every cigar with precision. Scan bands with AI. Know your collection intimately.", detail:"Every stick. Every vintage. Every detail.", cta:"Continue" },
  { icon:"🎯", title:"Humidor\nIntelligence", subtitle:"Monitor temperature and humidity in real time. Connect your Govee or Raching sensor for live readings.", detail:"Precision calibration. Always optimal.", cta:"Continue" },
  { icon:"🎩", title:"Meet Mario", subtitle:"Your personal AI cigar sommelier. He knows your collection and recommends what to smoke tonight.", detail:"The Padron has rested 18 months. Tonight is perfect.", cta:"Continue", quote:true },
  { icon:"✦", title:"Mario's Reserve", subtitle:"Join the most exclusive cigar lifestyle membership. Unlimited collections, Ask Mario always on, AI Band Scanner.", detail:"Begin with a complimentary 30-day membership.", cta:"Join The Reserve", secondary:"Start Free", membership:true },
];

function OnboardingScreen({ onComplete }) {
  const [screen, setScreen] = useState(0);
  const s = ONBOARD_SCREENS[screen];
  const isLast = screen === ONBOARD_SCREENS.length - 1;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:999, background:cedarBg, display:"flex", flexDirection:"column", maxWidth:430, margin:"0 auto" }}>
      <CubanRibbon height={6}/>
      <div style={{ height:1.5, background:goldMetal, opacity:0.5 }}/>
      <div style={{ display:"flex", justifyContent:"center", gap:8, padding:"20px 0 0" }}>
        {ONBOARD_SCREENS.map((_,i) => <div key={i} style={{ width:i===screen?24:6, height:6, borderRadius:3, background:i===screen?goldMetal:`${T.goldDark}44`, transition:"all 0.3s ease" }}/>)}
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 32px", textAlign:"center" }}>
        <div style={{ width:100, height:100, borderRadius:"50%", background:goldMetal, display:"flex", alignItems:"center", justifyContent:"center", fontSize:44, marginBottom:36, boxShadow:`0 8px 32px ${T.goldDark}88,inset 0 1px 0 rgba(255,255,255,0.3)` }}>{s.icon}</div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:30, fontWeight:"bold", color:T.goldLight, letterSpacing:1, marginBottom:20, lineHeight:1.2, textShadow:`0 2px 12px ${T.goldDark}`, whiteSpace:"pre-line" }}>{s.title}</div>
        <div style={{ fontSize:16, color:T.cream, lineHeight:1.8, marginBottom:16, maxWidth:300 }}>{s.subtitle}</div>
        {s.quote ? (
          <div style={{ background:leatherBg, border:`1px solid ${T.goldDark}`, borderLeft:`3px solid ${T.goldMid}`, borderRadius:"0 12px 12px 12px", padding:"14px 18px", fontSize:14, color:T.cream, fontStyle:"italic", lineHeight:1.7, maxWidth:280, boxShadow:"0 4px 16px rgba(0,0,0,0.3)" }}>{s.detail}</div>
        ) : s.membership ? (
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${T.goldDark}44`, borderRadius:12, padding:"16px 20px", maxWidth:280 }}>
            {["Unlimited Collections","Ask Mario — Always","AI Band Scanner","Sensor Integration","Community Access"].map(b => (
              <div key={b} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", fontSize:14, color:T.cream }}>
                <span style={{ color:T.goldMid }}>✦</span> {b}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize:13, color:T.muted, letterSpacing:1 }}>{s.detail}</div>
        )}
      </div>
      <div style={{ padding:"0 32px 40px" }}>
        <GoldBtn onClick={() => { if (isLast || s.secondary) { onComplete(); } else { setScreen(s=>s+1); } }}>{s.cta}</GoldBtn>
        {s.secondary && <GoldBtn outline onClick={onComplete}>{s.secondary}</GoldBtn>}
        {!isLast && !s.secondary && <button onClick={onComplete} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer", fontFamily:"Georgia,serif", fontSize:13, width:"100%", padding:"8px" }}>Skip</button>}
      </div>
      <div style={{ height:1.5, background:goldMetal, opacity:0.4 }}/>
      <CubanRibbon height={5}/>
    </div>
  );
}

export default function MariosHumidor() {
  const [appPhase, setAppPhase] = useState("splash");
  const [tab, setTab] = useState("humidors");
  const [humidors] = useState(HUMIDORS);
  const [cigars, setCigars] = useState(CIGARS);
  const [notes, setNotes] = useState(NOTES_DATA);
  const [messages, setMessages] = useState(INIT_MSGS);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showAddCigar, setShowAddCigar] = useState(false);
  const [showLogNote, setShowLogNote] = useState(false);
  const [scanPrefill, setScanPrefill] = useState({});
  const [expandedCigar, setExpandedCigar] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  const totalCigars = cigars.reduce((a,c)=>a+c.qty,0);
  const totalValue = cigars.reduce((a,c)=>a+c.qty*(c.price||0),0);

  const sendMessage = async () => {
    if (!inputText.trim()||loading) return;
    const userMsg = inputText.trim();
    setInputText("");
    setMessages(m=>[...m,{role:"user",text:userMsg}]);
    setLoading(true);
    const col = cigars.map(c=>`${c.brand} ${c.line} (${c.vitola}, ${c.wrapper}, ${c.origin}, purchased ${formatDate(c.purchaseDate)}, ${c.qty} remaining)`).join("; ");
    const hum = humidors.map(h=>`${h.name}: ${h.rh}% RH, ${h.temp}°F`).join("; ");
    const history = messages.map(m=>({ role:m.role==="ai"?"assistant":"user", content:m.text }));
    try {
      const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:500,
          system:`You are Mario, a warm, deeply knowledgeable cigar sommelier with decades of experience. You speak like a trusted friend at a private lounge — specific, enthusiastic, occasionally poetic about tobacco. The user's collection: ${col}. Their humidors: ${hum}. Give real recommendations with names and reasons. Under 120 words unless asked for more. Never say "as an AI."`,
          messages:[...history,{role:"user",content:userMsg}]
        })
      });
      const data = await res.json();
          setMessages(m=>[...m,{role:"ai",text:(data.content||[]).find(b=>b.type==="text")?.text||JSON.stringify(data)}]);
    } catch { setMessages(m=>[...m,{role:"ai",text:"A momentary connection issue — please check your API key in Settings."}]); }
    setLoading(false);
  };

  const fi = { width:"100%", background:"rgba(0,0,0,0.5)", border:`1px solid ${T.goldDark}`, borderRadius:8, color:T.cream, padding:"10px 12px", fontFamily:"Georgia,serif", fontSize:13, outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ minHeight:"100vh", background:T.cedar0, fontFamily:"Georgia,'Times New Roman',serif", maxWidth:430, margin:"0 auto", position:"relative" }}>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.goldDark};border-radius:2px}input,textarea,select{color-scheme:dark}`}</style>
      {appPhase==="splash" && <SplashScreen onComplete={()=>setAppPhase("onboarding")}/>}
      {appPhase==="onboarding" && <OnboardingScreen onComplete={()=>setAppPhase("app")}/>}
      <AppHeader totalCigars={totalCigars} totalValue={totalValue}/>
      <div style={{ padding:"20px 16px 100px", minHeight:"calc(100vh - 120px)", background:cedarBg }}>

        {tab==="humidors" && (
          <div>
            <SectionTitle>My Humidors</SectionTitle>
            {humidors.map(h=><HumidorCard key={h.id} h={h}/>)}
            <GoldBtn onClick={()=>{}}>✦ Add Humidor</GoldBtn>
          </div>
        )}

        {tab==="collection" && (
          <div>
            <SectionTitle>Collection — {totalCigars} Cigars</SectionTitle>
            <button onClick={()=>setShowScanner(true)} style={{ background:`linear-gradient(135deg,${T.cubanBlueMid}44,${T.sapphire}33)`, border:`1px solid ${T.cubanBlueMid}66`, borderRadius:12, width:"100%", padding:"16px 20px", marginBottom:18, display:"flex", alignItems:"center", gap:14, cursor:"pointer" }}>
              <span style={{ fontSize:28 }}>🔍</span>
              <div style={{ flex:1, textAlign:"left" }}>
                <div style={{ fontSize:15, color:T.goldLight, fontFamily:"Georgia,serif", marginBottom:3 }}>Band Scanner</div>
                <div style={{ fontSize:11, color:T.brass }}>Point camera at any cigar band for instant AI identification</div>
              </div>
              <span style={{ fontSize:20, color:T.brass }}>→</span>
            </button>
            {cigars.map(c => {
              const days = daysSince(c.purchaseDate);
              const isEx = expandedCigar===c.id;
              return (
                <CigarBandCard key={c.id}>
                  <div onClick={()=>setExpandedCigar(isEx?null:c.id)} style={{ cursor:"pointer" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:16, fontWeight:"bold", color:T.inkSoft, fontFamily:"Georgia,serif", marginBottom:3 }}>{c.brand} {c.line}</div>
                        <div style={{ fontSize:12, color:T.muted, marginBottom:8, fontStyle:"italic" }}>{c.vitola} · {c.wrapper}</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                          {[c.wrapper, c.origin, `${c.year}`].map(tag=>(
                            <span key={tag} style={{ background:`${T.goldDark}18`, border:`1px solid ${T.goldDark}44`, borderRadius:20, padding:"2px 10px", fontSize:10, color:T.muted }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ background:goldMetal, borderRadius:10, padding:"8px 14px", minWidth:54, textAlign:"center" }}>
                        <div style={{ fontSize:22, fontWeight:"bold", color:T.ink, fontFamily:"Georgia,serif" }}>{c.qty}</div>
                        <div style={{ fontSize:7, color:T.inkSoft, letterSpacing:1.5, textTransform:"uppercase" }}>cigars</div>
                      </div>
                    </div>
                    {isEx && (
                      <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${T.goldMid}33` }}>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                          {[["📅 Purchased",formatDate(c.purchaseDate)],["⏱ Resting",formatAge(c.purchaseDate)],["💰 Value",`$${(c.qty*c.price).toFixed(0)}`],["📍 Origin",c.origin]].map(([k,v])=>(
                            <div key={k} style={{ background:`${T.goldDark}14`, border:`1px solid ${T.goldDark}22`, borderRadius:8, padding:"8px 10px" }}>
                              <div style={{ fontSize:9, color:T.muted, letterSpacing:1 }}>{k}</div>
                              <div style={{ fontSize:13, color:T.inkSoft, fontWeight:"bold", marginTop:2 }}>{v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop:10 }}>
                          <span style={{ background:days>365?`${T.success}18`:`${T.gold}18`, border:`1px solid ${days>365?T.success:T.gold}44`, borderRadius:20, padding:"4px 12px", fontSize:11, color:days>365?T.success:T.gold }}>
                            {days>365?"✦ Aged & Ready":days>90?"◆ Developing":"● Recently Added"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CigarBandCard>
              );
            })}
            <GoldBtn onClick={()=>{ setScanPrefill({}); setShowAddCigar(true); }}>✦ Add Manually</GoldBtn>
          </div>
        )}

        {tab==="sommelier" && (
          <div>
            <SectionTitle>Ask Mario</SectionTitle>
            <div style={{ background:leatherBg, border:`1px solid ${T.goldDark}`, borderRadius:16, overflow:"hidden", marginBottom:20 }}>
              <div style={{ background:`linear-gradient(135deg,${T.cubanBlueMid},#000e28)`, padding:"14px 16px", position:"relative" }}>
                <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 50%,rgba(200,152,48,0.08) 0%,transparent 70%)" }}/>
                <div style={{ display:"flex", alignItems:"center", gap:10, position:"relative" }}>
                  <div style={{ width:11, height:11, borderRadius:"50%", background:T.goldLight, boxShadow:`0 0 8px ${T.goldLight}`, animation:"marioGlow 2s ease-in-out infinite" }}/>
                  <div>
                    <div style={{ fontSize:15, color:T.goldLight, letterSpacing:1.5, fontFamily:"Georgia,serif" }}>Mario</div>
                    <div style={{ fontSize:9, color:T.brass, letterSpacing:2, textTransform:"uppercase" }}>Your Personal Sommelier · Online</div>
                  </div>
                  <div style={{ marginLeft:"auto", background:`${T.goldDark}33`, border:`1px solid ${T.goldDark}88`, borderRadius:20, padding:"4px 12px", fontSize:10, color:T.brass }}>Private Lounge</div>
                </div>
              </div>
              <div style={{ padding:16, minHeight:220, maxHeight:360, overflowY:"auto", display:"flex", flexDirection:"column", gap:12 }}>
                {messages.map((m,i)=>(
                  <div key={i} style={{ background:m.role==="ai"?parchmentBg:`linear-gradient(135deg,${T.cubanBlueMid}44,${T.cubanBlue}33)`, border:`1px solid ${m.role==="ai"?T.goldMid+"44":T.cubanBlueMid+"44"}`, borderRadius:m.role==="ai"?"4px 16px 16px 16px":"16px 4px 16px 16px", padding:"14px 16px", fontSize:14, color:m.role==="ai"?T.ink:T.cream, lineHeight:1.75, maxWidth:"90%", alignSelf:m.role==="ai"?"flex-start":"flex-end", boxShadow:m.role==="ai"?"0 4px 16px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.8)":"0 4px 16px rgba(0,0,0,0.3)", whiteSpace:"pre-line" }}>{m.text}</div>
                ))}
                {loading && <div style={{ background:parchmentBg, border:`1px solid ${T.goldMid}44`, borderRadius:"4px 16px 16px 16px", padding:"14px 16px", maxWidth:"60%", alignSelf:"flex-start" }}><div style={{ display:"flex", gap:4 }}>{[0,1,2].map(i=><div key={i} style={{ width:8, height:8, borderRadius:"50%", background:T.goldMid, animation:`marioTyping 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}</div></div>}
              </div>
              <div style={{ display:"flex", gap:8, padding:"12px 14px", borderTop:`1px solid ${T.goldDark}33` }}>
                <input style={{ ...fi, flex:1 }} placeholder="Ask Mario anything..." value={inputText} onChange={e=>setInputText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()}/>
                <button onClick={sendMessage} style={{ background:goldBtn, border:`1px solid ${T.goldDark}`, borderRadius:8, color:T.ink, padding:"10px 16px", cursor:"pointer", fontFamily:"Georgia,serif", fontWeight:"bold", fontSize:16 }}>→</button>
              </div>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {["What's ready to smoke tonight?","Perfect bourbon pairing?","Which has aged the most?","Recommend a mild smoke"].map(s=>(
                <button key={s} onClick={()=>setInputText(s)} style={{ background:`${T.goldDark}22`, border:`1px solid ${T.goldDark}55`, borderRadius:20, padding:"7px 14px", color:T.brass, fontSize:11, cursor:"pointer", fontFamily:"Georgia,serif" }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {tab==="community" && <CommunityTab apiKey={apiKey}/>}
        {tab==="news" && <NewsTab apiKey={apiKey} cigars={cigars}/>}

        {tab==="notes" && (
          <div>
            <SectionTitle>Tasting Journal</SectionTitle>
            {notes.map(n=>(
              <div key={n.id} style={{ background:parchmentBg, border:`1px solid ${T.goldMid}55`, borderRadius:14, overflow:"hidden", marginBottom:16, boxShadow:"0 4px 16px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.8)" }}>
                <div style={{ height:3, background:goldMetal }}/>
                <div style={{ padding:"16px 16px 14px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:16, fontWeight:"bold", color:T.inkSoft, fontFamily:"Georgia,serif", marginBottom:2 }}>{n.brand}</div>
                      <div style={{ fontSize:11, color:T.muted, marginTop:2, fontStyle:"italic" }}>{n.vitola}</div>
                    </div>
                    <div style={{ display:"flex", gap:1 }}>
                      {[1,2,3,4,5].map(i=><span key={i} style={{ fontSize:20, color:i<=n.rating?T.goldShine:"#3a2810" }}>★</span>)}
                    </div>
                  </div>
                  <div style={{ fontSize:13, color:T.inkSoft, lineHeight:1.8, borderLeft:`3px solid ${T.goldMid}`, paddingLeft:12, marginBottom:10, fontStyle:"italic" }}>{n.notes}</div>
                  {n.pairing && <div style={{ fontSize:12, color:T.muted, display:"flex", alignItems:"center", gap:6 }}>🥃 Paired with {n.pairing}</div>}
                </div>
                <div style={{ height:2, background:goldMetal, opacity:0.5 }}/>
              </div>
            ))}
            <GoldBtn onClick={()=>setShowLogNote(true)}>✦ Log a Smoke</GoldBtn>
          </div>
        )}

        {tab==="settings" && (
          <div>
            <SectionTitle>Settings</SectionTitle>
            <div style={{ background:parchmentBg, border:`1px solid ${T.goldMid}55`, borderRadius:14, overflow:"hidden", marginBottom:16, boxShadow:"0 4px 16px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.8)" }}>
              <div style={{ height:3, background:goldMetal }}/>
              <div style={{ padding:16 }}>
                <div style={{ fontSize:16, color:T.inkSoft, fontWeight:"bold", marginBottom:8, fontFamily:"Georgia,serif" }}>🔑 Anthropic API Key</div>
                <div style={{ fontSize:13, color:T.muted, lineHeight:1.6, marginBottom:14 }}>Required for Ask Mario, Band Scanner, and Mario's Take on news. Your key is stored locally and never shared.</div>
                {apiKeySaved ? (
                  <div>
                    <div style={{ background:`${T.success}18`, border:`1px solid ${T.success}55`, borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                      <span style={{ fontSize:18 }}>✦</span>
                      <div><div style={{ fontSize:14, color:T.success, fontWeight:"bold" }}>API Key Connected</div><div style={{ fontSize:11, color:T.muted }}>Ask Mario is ready</div></div>
                    </div>
                    <button style={{ background:"none", border:`1px solid ${T.muted}55`, borderRadius:8, color:T.muted, padding:"8px 16px", cursor:"pointer", fontFamily:"Georgia,serif", fontSize:12 }} onClick={()=>{ setApiKeySaved(false); setApiKey(""); setApiKeyInput(""); }}>Remove Key</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom:10 }}>
                      <label style={{ fontSize:9, letterSpacing:2, textTransform:"uppercase", color:T.brass, marginBottom:6, display:"block" }}>API Key</label>
                      <input type="password" style={{ ...fi, background:`${T.goldDark}14`, border:`1px solid ${T.goldDark}`, color:T.inkSoft }} placeholder="sk-ant-..." value={apiKeyInput} onChange={e=>setApiKeyInput(e.target.value)}/>
                    </div>
                    <GoldBtn onClick={()=>{ if (!apiKeyInput.startsWith("sk-")) return; setApiKey(apiKeyInput); setApiKeySaved(true); }}>Save API Key</GoldBtn>
                    <div style={{ fontSize:12, color:T.muted, marginTop:8, textAlign:"center" }}>Get your key at console.anthropic.com</div>
                  </div>
                )}
              </div>
              <div style={{ height:2, background:goldMetal, opacity:0.5 }}/>
            </div>
            <div style={{ background:parchmentBg, border:`1px solid ${T.goldMid}44`, borderRadius:14, overflow:"hidden", marginBottom:16 }}>
              <div style={{ height:2, background:goldMetal, opacity:0.7 }}/>
              <div style={{ padding:16 }}>
                <div style={{ fontSize:16, color:T.inkSoft, fontWeight:"bold", marginBottom:6 }}>About</div>
                <div style={{ fontSize:14, color:T.muted }}>Mario's Humidor v2.0 — Luxury Edition</div>
                <div style={{ fontSize:12, color:T.tobacco, marginTop:4 }}>Band Scanner · Ask Mario · Lifestyle Platform</div>
              </div>
            </div>
            <div style={{ background:parchmentBg, border:`1px solid ${T.goldMid}44`, borderRadius:14, overflow:"hidden" }}>
              <div style={{ height:2, background:goldMetal, opacity:0.7 }}/>
              <div style={{ padding:16 }}>
                <div style={{ fontSize:16, color:T.inkSoft, fontWeight:"bold", marginBottom:6 }}>Sensors</div>
                <div style={{ fontSize:13, color:T.muted, lineHeight:1.6 }}>Govee H5051 WiFi and Raching sensor integration coming soon.</div>
                <div style={{ marginTop:12, padding:"10px 14px", background:"#e8f0ff", border:"1px solid #99aedd44", borderRadius:8, display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:T.cubanBlueMid }}/>
                  <div style={{ fontSize:12, color:T.cubanBlueMid }}>Live sensor data will appear in Humidors tab once connected</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav tab={tab} setTab={setTab}/>
      {showScanner && <ScannerModal apiKey={apiKey} onClose={()=>setShowScanner(false)} onResult={r=>{ setScanPrefill(r); setShowScanner(false); setShowAddCigar(true); }}/>}
      {showAddCigar && <AddCigarModal prefill={scanPrefill} onClose={()=>{ setShowAddCigar(false); setScanPrefill({}); }} onAdd={c=>{ setCigars(p=>[...p,c]); setShowAddCigar(false); setScanPrefill({}); }}/>}
      {showLogNote && <LogNoteModal onClose={()=>setShowLogNote(false)} onAdd={n=>setNotes(p=>[...p,n])} cigars={cigars}/>}
      <style>{`@keyframes marioGlow{0%,100%{box-shadow:0 0 8px ${T.goldLight}}50%{box-shadow:0 0 16px ${T.goldShine}}}@keyframes marioTyping{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
