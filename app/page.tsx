"use client";
import { useState, useEffect, useRef, useId, useCallback } from "react";
import SplashScreen from "@/components/SplashScreen";

const T = {
  bg:"#0a0a0a", card:"#111111", cardMid:"#161616",
  border:"rgba(160,120,40,0.14)", borderGold:"rgba(160,120,40,0.38)",
  goldDark:"#8B6914", goldMid:"#C49A28", goldLight:"#e8c84a",
  textPrimary:"#ede0cc", textSecondary:"#9a7848", textMuted:"#5a3c1e", textGold:"#C49A28",
  success:"#2a5c38", danger:"#7a1212", blue:"#0c1420", blueMid:"#1a2c50",
};
const r2=(n:number)=>Math.round(n*100)/100;
const polar=(cx:number,cy:number,r:number,deg:number)=>{const a=(deg-90)*Math.PI/180;return{x:r2(cx+r*Math.cos(a)),y:r2(cy+r*Math.sin(a))};};



function CedarBg() {
  return <div style={{position:"fixed",inset:0,zIndex:0,
    background:"#0a0a0a"}}/>;
}

function MMedallion({size=32}:{size?:number}) {
  return <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,
    background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
    display:"flex",alignItems:"center",justifyContent:"center",
    fontSize:size*0.44,fontWeight:"bold",color:"#1a0e04",fontFamily:"Georgia,serif",
    boxShadow:`0 2px 10px ${T.goldDark}44`}}>M</div>;
}

// GAUGE — ivory face, gold bezel, red needle
function LuxuryGauge({value,size,label,subtitle,min=20,max=100}:{value:number;size:number;label:string;subtitle:string;min?:number;max?:number;}) {
  const uid=useId().replace(/:/g,"");
  const [m,setM]=useState(false);
  useEffect(()=>{setM(true);},[]);
  const cx=size/2,cy=size/2,outerR=size*0.46,arcR=size*0.40;
  const s0=-225,s1=50,range=s1-s0,pct=Math.max(0,Math.min(1,(value-min)/(max-min)));
  const ticks=Array.from({length:25},(_,i)=>{const ang=s0+(i/24)*range,maj=i%6===0,mid=i%3===0;const r1=outerR*(maj?0.66:mid?0.73:0.80),r2=outerR*0.91;const p1=polar(cx,cy,r1,ang),p2=polar(cx,cy,r2,ang);return{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y,maj,mid};});
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
      <circle cx={cx} cy={cy} r={r2(size*0.028)} fill="#1a0e04"/>
      <circle cx={cx} cy={cy} r={outerR} fill={`url(#${uid}g)`}/>
    </svg>
    {label&&<div style={{marginTop:10,textAlign:"center"}}>
      <span style={{fontSize:r2(size*0.28),fontWeight:"bold",color:T.goldLight,fontFamily:"Georgia,serif",lineHeight:1,letterSpacing:-1}}>{value}</span>
      <span style={{fontSize:r2(size*0.12),color:T.textGold,marginLeft:3,fontFamily:"Georgia,serif"}}>{label}</span>
    </div>}
  </div>;
}


// DATA
const HUMIDORS=[
  {id:1,name:"Govee T",wood:"Spanish Cedar",temp:0,humidity:0,capacity:150,count:87,status:"optimal"},
  {id:2,name:"Govee M",wood:"Mahogany",temp:70,humidity:67,capacity:20,count:12,status:"good"},
  {id:3,name:"Govee B",wood:"Electronic",temp:67,humidity:70,capacity:900,count:210,status:"optimal"},
];
type CigarEntry={id:number;brand:string;line:string;vitola:string;origin:string;wrapper:string;rating:number;count:number;purchaseDate:string;bandColor:string};
const CIGARS:CigarEntry[]=[];
const NOTES_INIT=[
  {id:1,brand:"Padrón",line:"1964 Anniversary",vitola:"Exclusivo",date:"May 28, 2026",rating:5,
    notes:"Rich dark chocolate and dried fruit — 31 months of aging has transformed this completely. The draw is effortless, burn line ruler-straight. A meditation in a stick.",pairing:"Blanton's Single Barrel"},
  {id:2,brand:"Arturo Fuente",line:"Opus X",vitola:"Robusto",date:"May 15, 2026",rating:5,
    notes:"Spicy cedar entry, black pepper through the first third. Creamy sweetness emerges at the midpoint. Complex, rewarding.",pairing:"Glenfarclas 25yr"},
];
const POSTS_INIT=[
  {id:1,user:"CigarDon_85",avatar:"C",badge:"Top Reviewer",category:"Review",time:"2h ago",
    title:"Opus X Double Corona — worth the wait",
    body:"Finally cracked one I've been aging 3 years. The complexity is unreal — espresso, dark chocolate, leather. The patience was worth every month.",
    likes:24,comments:8,liked:false},
  {id:2,user:"HumidorQueen",avatar:"H",badge:"Pairing Pro",category:"Pairing",time:"1h ago",
    title:"Padrón 1926 + Glenfarclas 25yr",
    body:"The sherry cask and natural wrapper are a match made in heaven. Tried this last night on the back porch. Absolutely transcendent.",
    likes:41,comments:15,liked:false},
  {id:3,user:"SlowBurn_Mike",avatar:"S",badge:"",category:"Question",time:"3h ago",
    title:"Humidity dropped to 62% — how long to recover?",
    body:"Came home to find my main humidor at 62%. Added a recharged Boveda. Anyone had experience with recovery time?",
    likes:7,comments:22,liked:false},
];
const NEWS=[
  {id:1,title:"Padrón 1964 Anniversary Series — A Retrospective",summary:"Forty years of Nicaraguan excellence. How the Padrón family changed premium cigars forever.",source:"Cigar Aficionado",date:"May 30, 2026",accent:"#7a1212",
    image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    link:"https://www.cigaraficionado.com/top25cigar/padron-1964-anniversary-series-torpedo-natural"},
  {id:2,title:"Arturo Fuente Opus X: The Story Behind the Legend",summary:"How a Dominican factory became the most coveted cigar in the world.",source:"Halfwheel",date:"May 29, 2026",accent:T.goldMid,
    image:"https://images.unsplash.com/photo-1571066811602-716837d681de?w=600&q=80",
    link:"https://halfwheel.com/tag/opusx/"},
  {id:3,title:"2026 Cigar of the Year Contenders Revealed",summary:"From Nicaragua to Honduras, the top-rated cigars of the year so far.",source:"Cigar Advisor",date:"May 28, 2026",accent:"#2a5c38",
    image:"https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=600&q=80",
    link:"https://www.cigarjournal.com/ratings-and-awards/top-25-cigars/"},
  {id:4,title:"Humidity Control: The Science Behind the Perfect Humidor",summary:"Cedar aging, the 70/70 rule, and why Boveda may be changing everything.",source:"Halfwheel",date:"May 27, 2026",accent:"#1a2c50",
    image:"https://images.unsplash.com/photo-1585553616435-2dc0a54e1a6b?w=600&q=80",
    link:"https://halfwheel.com/humi-care-seasoning-wipes/380946/"},
];

// ── HUMIDORS SCREEN ────────────────────────────────────────────────────────
function HumidorsTab({liveData,liveStatus,lastUpdated,onRefresh}:{
  liveData:Record<string,{temperature:number|null;humidity:number|null;observedAt:string|null}>;
  liveStatus:"idle"|"loading"|"connected"|"error";
  lastUpdated:string|null;
  onRefresh:()=>void;
}) {
  type Humidor={id:number;name:string;wood:string;temp:number;humidity:number;capacity:number;count:number;status:string};
  const [humidors,setHumidors]=useState<Humidor[]>(HUMIDORS);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({name:"",wood:"Spanish Cedar",capacity:"150",count:"0",status:"optimal"});
  const status=liveStatus;

  const getLive=(name:string)=>liveData[name]??null;

  const addHumidor=()=>{
    if(!form.name.trim()) return;
    const newH:Humidor={
      id:Date.now(),name:form.name.trim(),wood:form.wood,
      temp:70,humidity:69,capacity:parseInt(form.capacity)||150,
      count:parseInt(form.count)||0,status:form.status,
    };
    setHumidors(h=>[...h,newH]);
    setForm({name:"",wood:"Spanish Cedar",capacity:"150",count:"0",status:"optimal"});
    setShowForm(false);
  };

  const StatusDot=()=>(
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <div style={{width:5,height:5,borderRadius:"50%",flexShrink:0,
        background:status==="connected"?"#4a9c68":status==="error"?"#9a3030":"#4a3018",
        boxShadow:status==="connected"?"0 0 6px #4a9c6888":"none"}}/>
      <span style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",letterSpacing:0.3}}>
        {status==="connected"?`Live · ${lastUpdated}`:status==="loading"?"Updating…":"Sensor offline"}
      </span>
    </div>
  );

  const HumidorCard=({h,isHero}:{h:Humidor,isHero:boolean})=>{
    const live=getLive(h.name);
    const humidity=live?.humidity??h.humidity;
    const temp=live?.temperature??h.temp;
    const humOk=humidity>=65&&humidity<=72;
    const tempOk=temp>=65&&temp<=70;
    const hasReading=humidity>0||temp>0;
    const calcStatus=!hasReading?"no-data":humOk&&tempOk?"optimal":humOk||tempOk?"good":"warning";
    const statusColor=calcStatus==="optimal"?"#5ab07a":calcStatus==="good"?T.goldMid:calcStatus==="no-data"?T.textMuted:"#c05050";
    const statusLabel=calcStatus==="optimal"?"Optimal":calcStatus==="good"?"Good":calcStatus==="no-data"?"No Data":"Warning";
    const fillPct=Math.min((h.count/h.capacity)*100,100);
    return (
      <div style={{background:"linear-gradient(170deg,#1a1a1a 0%,#111111 60%,#0d0d0d 100%)",
        borderRadius:16,border:`1px solid rgba(160,120,40,0.28)`,overflow:"hidden",
        boxShadow:"0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(200,160,60,0.08)"}}>
        {/* Header row */}
        <div style={{padding:"16px 18px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:22,fontWeight:"bold",color:T.textPrimary,
              fontFamily:"Georgia,serif",letterSpacing:0.2,lineHeight:1.15}}>{h.name}</div>
            <div style={{fontSize:14,color:T.textPrimary,marginTop:4,fontFamily:"Georgia,serif",letterSpacing:0.3}}>
              {h.wood}
              <span style={{color:T.textMuted,margin:"0 5px"}}>·</span>
              <span style={{color:T.goldMid,fontWeight:"bold"}}>{h.count}</span>
              <span style={{color:T.textMuted}}>/{h.capacity} Cigars</span>
            </div>
          </div>
          <div style={{background:"transparent",border:`1px solid ${statusColor}88`,
            borderRadius:6,padding:"4px 12px",fontSize:9,color:statusColor,
            letterSpacing:2,textTransform:"uppercase",fontFamily:"Georgia,serif",marginTop:4,
          }}>{statusLabel}</div>
        </div>
        {/* Gauges left + readings right */}
        <div style={{display:"flex",alignItems:"center",padding:"14px 18px 6px",gap:12}}>
          {/* Two small gauges */}
          <div style={{display:"flex",gap:16,flexShrink:0}}>
            <LuxuryGauge value={humidity} size={110} label="" subtitle="RH"/>
            <LuxuryGauge value={temp} size={110} label="" subtitle="Temp"/>
          </div>
          {/* Large readings */}
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
            <div>
              <span style={{fontSize:36,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1}}>{humidity}</span>
              <span style={{fontSize:16,color:T.goldMid,fontFamily:"Georgia,serif"}}>%</span>
              <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",textAlign:"right",marginTop:1}}>RH</div>
            </div>
            <div>
              <span style={{fontSize:36,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1}}>{temp}</span>
              <span style={{fontSize:16,color:T.goldMid,fontFamily:"Georgia,serif"}}>°F</span>
              <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",textAlign:"right",marginTop:1}}>TEMP</div>
            </div>
          </div>
        </div>
        {/* Fill bar */}
        <div style={{padding:"4px 18px 14px"}}>
          <div style={{height:5,background:"rgba(0,0,0,0.35)",borderRadius:5,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${fillPct}%`,
              background:`linear-gradient(90deg,#8B6914,#C49A28 50%,#e8c84a)`,
              borderRadius:5,boxShadow:`0 0 10px rgba(196,154,40,0.5)`}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
            <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>
              {status==="connected"?`Updated ${lastUpdated}`:"Sensor offline"}
            </div>
            <div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif"}}>
              {h.count} <span style={{color:T.textMuted,fontSize:10}}>/ {h.capacity}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const fi:React.CSSProperties={width:"100%",background:"rgba(0,0,0,0.25)",border:`1px solid rgba(160,120,40,0.22)`,
    borderRadius:10,padding:"11px 14px",color:T.textPrimary,fontSize:13,outline:"none",
    boxSizing:"border-box",marginBottom:10,fontFamily:"Georgia,serif"};

  return (
    <div style={{padding:"0 0 36px"}}>
      <div style={{padding:"24px 18px 0",display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${T.goldDark}66)`}}/>
          <div style={{fontSize:10,letterSpacing:5,textTransform:"uppercase",color:T.goldMid,
            fontFamily:"Georgia,serif",whiteSpace:"nowrap"}}>My Humidors</div>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,${T.goldDark}66,transparent)`}}/>
        </div>
        <div style={{display:"flex",justifyContent:"flex-end"}}><StatusDot/></div>
      </div>

      <div style={{margin:"14px 16px 0"}}>
        <HumidorCard h={humidors[0]} isHero={true}/>
      </div>
      <div style={{margin:"14px 16px 0",display:"flex",flexDirection:"column",gap:14}}>
        {humidors.slice(1).map(h=><HumidorCard key={h.id} h={h} isHero={false}/>)}
      </div>

      {/* Add Humidor Form */}
      {showForm && (
        <div style={{margin:"14px 16px 0",background:"linear-gradient(170deg,#1a1a1a,#111111)",
          borderRadius:20,border:`1px solid rgba(160,120,40,0.30)`,padding:"20px 20px 16px",
          boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
          <div style={{fontSize:12,color:T.goldMid,fontFamily:"Georgia,serif",letterSpacing:2,
            textTransform:"uppercase",marginBottom:16}}>New Humidor</div>
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
            placeholder="Humidor name (must match Govee sensor name)" style={fi}/>
          <input value={form.wood} onChange={e=>setForm(f=>({...f,wood:e.target.value}))}
            placeholder="Wood type (e.g. Spanish Cedar)" style={fi}/>
          <div style={{display:"flex",gap:10,marginBottom:10}}>
            <input value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:e.target.value}))}
              placeholder="Capacity" type="number"
              style={{...fi,marginBottom:0,flex:1}}/>
            <input value={form.count} onChange={e=>setForm(f=>({...f,count:e.target.value}))}
              placeholder="Current cigars" type="number"
              style={{...fi,marginBottom:0,flex:1}}/>
          </div>
          <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
            style={{...fi}}>
            <option value="optimal">Optimal</option>
            <option value="good">Good</option>
            <option value="warning">Warning</option>
          </select>
          <div style={{display:"flex",gap:10,marginTop:4}}>
            <button onClick={addHumidor} style={{flex:1,padding:"12px",
              background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
              border:"none",borderRadius:10,color:"#1a0e04",fontSize:13,
              fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>Add</button>
            <button onClick={()=>setShowForm(false)} style={{padding:"12px 20px",
              background:"transparent",border:`1px solid rgba(160,120,40,0.22)`,
              borderRadius:10,color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{margin:"14px 16px 0"}}>
        <button onClick={()=>setShowForm(s=>!s)} style={{width:"100%",padding:"15px",background:"none",
          border:`1px dashed rgba(160,120,40,0.22)`,borderRadius:16,color:T.textMuted,
          fontSize:10,fontFamily:"Georgia,serif",cursor:"pointer",letterSpacing:2.5,textTransform:"uppercase",
        }}>{showForm?"— Cancel":"+ Add Humidor"}</button>
      </div>
    </div>
  );
}

// ── BAND SCANNER MODAL ─────────────────────────────────────────────────────
type ScanResult={brand:string;line:string;vitola:string;origin:string;wrapper:string;rating:number|null;confidence:string;notes:string};

function BandScannerModal({onClose,onAddToCollection,onAddToJournal,onSmokedOne}:{
  onClose:()=>void;
  onAddToCollection:(r:ScanResult)=>void;
  onAddToJournal:(r:ScanResult)=>void;
  onSmokedOne:(r:ScanResult)=>void;
}) {
  const fileRef=useRef<HTMLInputElement>(null);
  const cameraRef=useRef<HTMLInputElement>(null);
  const [phase,setPhase]=useState<"idle"|"scanning"|"result"|"error">("idle");
  const [preview,setPreview]=useState<string|null>(null);
  const [result,setResult]=useState<ScanResult|null>(null);
  const [errMsg,setErrMsg]=useState("");

  const scan=async(file:File)=>{
    setPhase("scanning");
    const reader=new FileReader();
    reader.onload=async(e)=>{
      const dataUrl=e.target?.result as string;
      const base64=dataUrl.split(",")[1];
      const mediaType=file.type||"image/jpeg";
      setPreview(dataUrl);
      try {
        const res=await fetch("/api/scan",{method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({image:base64,mediaType})});
        const data=await res.json();
        if(data.ok&&data.cigar){setResult(data.cigar);setPhase("result");}
        else{setErrMsg("Couldn't identify this band. Try a clearer photo.");setPhase("error");}
      } catch {setErrMsg("Connection error. Please try again.");setPhase("error");}
    };
    reader.readAsDataURL(file);
  };

  const confidenceColor=(c:string)=>c==="high"?T.success:c==="medium"?T.goldMid:"#7a4020";

  return (
    <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",
      background:"#0a0a0a"}}>


      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",
        borderBottom:`1px solid ${T.border}`}}>
        <div>
          <div style={{fontSize:10,letterSpacing:5,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif"}}>Collection</div>
          <div style={{fontSize:20,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>Band Scanner</div>
        </div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,
          borderRadius:"50%",width:36,height:36,color:T.textMuted,fontSize:20,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>×</button>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"24px 20px"}}>

        {/* IDLE — upload prompt */}
        {phase==="idle" && (
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={{textAlign:"center",padding:"40px 20px",background:T.card,
              borderRadius:20,border:`2px dashed ${T.borderGold}`,cursor:"pointer"}}
              onClick={()=>cameraRef.current?.click()}>
              <div style={{fontSize:48,marginBottom:16}}>🔍</div>
              <div style={{fontSize:16,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:8}}>
                Photo a Cigar Band
              </div>
              <div style={{fontSize:13,color:T.textMuted,lineHeight:1.6}}>
                Tap to open camera or choose a photo.<br/>AI will identify brand, line, and vitola.
              </div>
            </div>
            <button onClick={()=>cameraRef.current?.click()}
              style={{width:"100%",padding:"16px",
                background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                border:"none",borderRadius:14,color:"#1a0e04",fontSize:15,
                fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif",letterSpacing:0.5}}>
              📷 Open Camera
            </button>
            <button onClick={()=>fileRef.current?.click()}
              style={{width:"100%",padding:"16px",background:"none",
                border:`1px solid ${T.borderGold}`,borderRadius:14,color:T.goldLight,
                fontSize:15,fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif",letterSpacing:0.5}}>
              🖼 Photo Library
            </button>
            <input ref={cameraRef} type="file" accept="image/*" capture="environment"
              style={{display:"none"}}
              onChange={e=>{const f=e.target.files?.[0];if(f)scan(f);}}/>
            <input ref={fileRef} type="file" accept="image/*"
              style={{display:"none"}}
              onChange={e=>{const f=e.target.files?.[0];if(f)scan(f);}}/>
          </div>
        )}

        {/* SCANNING */}
        {phase==="scanning" && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:24,paddingTop:40}}>
            {preview && <img src={preview} alt="band" style={{width:"100%",maxWidth:320,borderRadius:14,
              border:`1px solid ${T.border}`,objectFit:"cover",maxHeight:220}}/>}
            <div style={{textAlign:"center"}}>
              <div style={{display:"flex",gap:7,justifyContent:"center",marginBottom:14}}>
                {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.goldDark,
                  animation:`sp 1.4s ease-in-out ${i*0.28}s infinite`}}/>)}
              </div>
              <div style={{fontSize:14,color:T.textSecondary,fontFamily:"Georgia,serif",fontStyle:"italic"}}>
                Mario is identifying your cigar…
              </div>
            </div>
          </div>
        )}

        {/* RESULT */}
        {phase==="result" && result && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {preview && <img src={preview} alt="band" style={{width:"100%",borderRadius:14,
              border:`1px solid ${T.border}`,objectFit:"cover",maxHeight:200}}/>}

            {/* ID card */}
            <div style={{background:"linear-gradient(160deg,#1a1a1a,#111111)",borderRadius:16,
              border:`1px solid ${T.borderGold}`,overflow:"hidden"}}>
              <div style={{height:3,background:`linear-gradient(90deg,${T.goldDark},${T.goldLight} 45%,${T.goldMid})`}}/>
              <div style={{padding:"20px 20px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div style={{fontSize:10,color:T.textMuted,letterSpacing:4,textTransform:"uppercase",
                    fontFamily:"Georgia,serif"}}>Identified</div>
                  <div style={{fontSize:10,color:confidenceColor(result.confidence),
                    background:`${confidenceColor(result.confidence)}18`,
                    border:`1px solid ${confidenceColor(result.confidence)}33`,
                    borderRadius:20,padding:"2px 10px",letterSpacing:1,textTransform:"uppercase"}}>
                    {result.confidence} confidence
                  </div>
                </div>
                <div style={{fontSize:10,color:T.textSecondary,letterSpacing:3,textTransform:"uppercase",
                  fontFamily:"Georgia,serif",marginBottom:4}}>{result.brand}</div>
                <div style={{fontSize:24,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",
                  lineHeight:1.1,marginBottom:6}}>{result.line}</div>
                <div style={{fontSize:14,color:T.textSecondary,marginBottom:16}}>{result.vitola}</div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,
                  paddingTop:14,borderTop:`1px solid ${T.border}`}}>
                  {[["Origin",result.origin],["Wrapper",result.wrapper],
                    ["Rating",result.rating?`${result.rating} pts`:"—"]].map(([k,v])=>(
                    <div key={k}>
                      <div style={{fontSize:9,color:T.textMuted,textTransform:"uppercase",
                        letterSpacing:2,marginBottom:4}}>{k}</div>
                      <div style={{fontSize:13,color:T.textPrimary,fontFamily:"Georgia,serif"}}>{v}</div>
                    </div>
                  ))}
                </div>

                {result.notes && (
                  <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.border}`,
                    fontSize:13,color:T.textSecondary,fontFamily:"Georgia,serif",fontStyle:"italic",lineHeight:1.7}}>
                    {result.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={()=>onAddToCollection(result)}
                style={{width:"100%",padding:"15px",
                  background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                  border:"none",borderRadius:12,color:"#0a0a0a",fontSize:14,
                  fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
                + Add to Collection
              </button>
              <button onClick={()=>onSmokedOne(result)}
                style={{width:"100%",padding:"15px",
                  background:"linear-gradient(135deg,#7a1212,#a01818)",
                  border:"none",borderRadius:12,color:"#f0e8d8",fontSize:14,
                  fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
                🔥 Smoked One — Remove from Inventory
              </button>
              <button onClick={()=>onAddToJournal(result)}
                style={{width:"100%",padding:"15px",background:"none",
                  border:`1px solid ${T.borderGold}`,borderRadius:12,color:T.goldLight,
                  fontSize:14,cursor:"pointer",fontFamily:"Georgia,serif",fontWeight:"bold"}}>
                📓 Log to Tasting Journal
              </button>
              <button onClick={()=>{setPhase("idle");setPreview(null);setResult(null);}}
                style={{width:"100%",padding:"12px",background:"none",
                  border:`1px solid ${T.border}`,borderRadius:12,color:T.textMuted,
                  fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif"}}>
                Scan Another
              </button>
            </div>
          </div>
        )}

        {/* ERROR */}
        {phase==="error" && (
          <div style={{display:"flex",flexDirection:"column",gap:16,paddingTop:20}}>
            {preview && <img src={preview} alt="band" style={{width:"100%",borderRadius:14,
              border:`1px solid ${T.border}`,objectFit:"cover",maxHeight:200}}/>}
            <div style={{background:T.card,borderRadius:14,border:`1px solid rgba(122,18,18,0.4)`,
              padding:"20px",textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
              <div style={{fontSize:14,color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:6}}>{errMsg}</div>
            </div>
            <button onClick={()=>{setPhase("idle");setPreview(null);}}
              style={{width:"100%",padding:"15px",
                background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                border:"none",borderRadius:12,color:"#1a0e04",fontSize:14,
                fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── COLLECTION SCREEN ──────────────────────────────────────────────────────
function CollectionTab() {
  const [sel,setSel]=useState<number|null>(null);
  const [showScanner,setShowScanner]=useState(false);
  const [pendingCollection,setPendingCollection]=useState<ScanResult|null>(null);
  const [pendingJournal,setPendingJournal]=useState<ScanResult|null>(null);
  const [cigars,setCigars]=useState<CigarEntry[]>(CIGARS);
  const [smokedToast,setSmokedToast]=useState<string|null>(null);
  const [showAddForm,setShowAddForm]=useState(false);
  const [addForm,setAddForm]=useState({brand:"",line:"",vitola:"",origin:"",wrapper:"",count:"1",rating:"90"});

  useEffect(()=>{
    try{const s=localStorage.getItem("mh_cigars");if(s)setCigars(JSON.parse(s));}catch{}
  },[]);

  useEffect(()=>{
    try{localStorage.setItem("mh_cigars",JSON.stringify(cigars));}catch{}
  },[cigars]);

  const saveNewCigar=()=>{
    if(!addForm.brand.trim()||!addForm.line.trim()) return;
    const newC:CigarEntry={
      id:Date.now(),brand:addForm.brand,line:addForm.line,vitola:addForm.vitola,
      origin:addForm.origin,wrapper:addForm.wrapper,
      rating:parseInt(addForm.rating)||90,count:parseInt(addForm.count)||1,
      purchaseDate:new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"}),
      bandColor:"#2a1608"
    };
    setCigars(prev=>[...prev,newC]);
    setAddForm({brand:"",line:"",vitola:"",origin:"",wrapper:"",count:"1",rating:"90"});
    setShowAddForm(false);
  };

  const [editId,setEditId]=useState<number|null>(null);
  const [editForm,setEditForm]=useState({brand:"",line:"",vitola:"",origin:"",wrapper:"",count:"1",rating:"90"});

  const startEdit=(c:CigarEntry,e:React.MouseEvent)=>{
    e.stopPropagation();
    setEditId(c.id);
    setEditForm({brand:c.brand,line:c.line,vitola:c.vitola,origin:c.origin,wrapper:c.wrapper,
      count:String(c.count),rating:String(c.rating)});
  };
  const saveEdit=()=>{
    setCigars(prev=>prev.map(c=>c.id===editId?{...c,
      brand:editForm.brand,line:editForm.line,vitola:editForm.vitola,
      origin:editForm.origin,wrapper:editForm.wrapper,
      count:parseInt(editForm.count)||c.count,
      rating:parseInt(editForm.rating)||c.rating}:c));
    setEditId(null);
  };
  const deleteCigar=(id:number,e:React.MouseEvent)=>{
    e.stopPropagation();
    if(window.confirm("Remove this cigar from your collection?"))
      setCigars(prev=>prev.filter(c=>c.id!==id));
  };

  const total=cigars.reduce((a,c)=>a+c.count,0);

  const handleAddToCollection=(r:ScanResult)=>{
    setShowScanner(false);
    setPendingCollection(r);
  };
  const handleAddToJournal=(r:ScanResult)=>{
    setShowScanner(false);
    setPendingJournal(r);
  };
  const handleSmokedOne=(r:ScanResult)=>{
    setShowScanner(false);
    // Match scanned cigar to collection by brand/line
    const match=cigars.find(c=>
      c.brand.toLowerCase().includes(r.brand.toLowerCase())||
      c.line.toLowerCase().includes(r.line.toLowerCase())
    );
    if(match&&match.count>0){
      setCigars(prev=>prev.map(c=>c.id===match.id?{...c,count:c.count-1}:c));
      setSmokedToast(`🔥 Smoked: ${match.brand} ${match.line} — ${match.count-1} remaining`);
    } else {
      setSmokedToast("Cigar not found in collection — add it first");
    }
    setTimeout(()=>setSmokedToast(null),4000);
    // Also prompt tasting journal
    setPendingJournal(r);
  };

  return (
    <div style={{padding:"0 0 100px",position:"relative"}}>
      {showScanner && (
        <BandScannerModal
          onClose={()=>setShowScanner(false)}
          onAddToCollection={handleAddToCollection}
          onAddToJournal={handleAddToJournal}
          onSmokedOne={handleSmokedOne}
        />
      )}
      {/* Smoked toast notification */}
      {smokedToast&&(
        <div style={{position:"fixed",top:100,left:"50%",transform:"translateX(-50%)",
          background:"linear-gradient(135deg,#1a1a1a,#111111)",
          border:`1px solid rgba(196,154,40,0.3)`,borderRadius:12,
          padding:"14px 20px",zIndex:9999,
          boxShadow:"0 8px 32px rgba(0,0,0,0.6)",maxWidth:340,width:"90%"}}>
          <div style={{fontSize:14,color:"#f0e8d8",fontFamily:"Georgia,serif",textAlign:"center",lineHeight:1.5}}>{smokedToast}</div>
        </div>
      )}

      {/* Header — stats */}
      <div style={{padding:"24px 20px 20px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",gap:28,alignItems:"baseline"}}>
          <div>
            <div style={{fontSize:36,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1}}>{total}</div>
            <div style={{fontSize:9,color:T.textMuted,letterSpacing:3,textTransform:"uppercase",marginTop:5}}>Total Cigars</div>
          </div>
          <div style={{width:1,height:36,background:T.border}}/>
          <div>
            <div style={{fontSize:36,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1}}>
              {cigars.length===0?"—":(cigars.reduce((a,c)=>a+c.rating,0)/cigars.length).toFixed(1)}
            </div>
            <div style={{fontSize:9,color:T.textMuted,letterSpacing:3,textTransform:"uppercase",marginTop:5}}>Avg Rating</div>
          </div>
        </div>
      </div>

      {/* ── BRAND PARTNER FEATURE SLOT ── */}
      <div style={{margin:"16px 16px 0"}}>
        <div style={{fontSize:8,letterSpacing:3,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif",marginBottom:8}}>
          Featured Release · Brand Partner
        </div>
        <div style={{borderRadius:14,overflow:"hidden",border:`1px solid rgba(196,154,40,0.3)`,background:"linear-gradient(170deg,#1a1a1a,#0d0d0d)"}}>
          {/* Feature image area */}
          <div style={{position:"relative",height:180,background:"linear-gradient(135deg,#1a1208,#2a1f0e,#0f0a04)",
            display:"flex",alignItems:"flex-end",padding:16}}>
            {/* New Release badge */}
            <div style={{position:"absolute",top:12,right:12,background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
              color:"#0a0a0a",fontFamily:"Georgia,serif",fontSize:8,letterSpacing:2,
              padding:"4px 10px",borderRadius:4,fontWeight:"bold",textTransform:"uppercase"}}>
              New Release
            </div>
            {/* Cigar info overlay */}
            <div style={{position:"relative",zIndex:2}}>
              <div style={{fontSize:9,letterSpacing:3,color:T.goldMid,textTransform:"uppercase",fontFamily:"Georgia,serif",marginBottom:3}}>Davidoff</div>
              <div style={{fontSize:20,color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1.2,marginBottom:2}}>Winston Churchill<br/>The Late Hour</div>
              <div style={{fontSize:11,color:T.textSecondary,fontStyle:"italic",fontFamily:"Georgia,serif"}}>Toro · 6 × 50</div>
            </div>
          </div>
          {/* Action buttons */}
          <div style={{display:"flex",gap:10,padding:"12px 14px",borderTop:`1px solid rgba(196,154,40,0.12)`}}>
            <button style={{flex:1,padding:"10px",background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
              border:"none",borderRadius:8,fontFamily:"Georgia,serif",fontSize:10,
              letterSpacing:2,color:"#0a0a0a",fontWeight:"bold",cursor:"pointer",textTransform:"uppercase"}}>
              Add to Collection
            </button>
            <button style={{flex:1,padding:"10px",background:"transparent",
              border:`1px solid rgba(196,154,40,0.35)`,borderRadius:8,fontFamily:"Georgia,serif",
              fontSize:10,letterSpacing:2,color:T.goldMid,cursor:"pointer",textTransform:"uppercase"}}>
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Pre-fill banner — Collection */}
      {pendingCollection && (
        <div style={{margin:"12px 16px 0",background:`${T.goldDark}18`,borderRadius:12,
          border:`1px solid ${T.borderGold}`,padding:"14px 16px"}}>
          <div style={{fontSize:11,color:T.goldLight,fontFamily:"Georgia,serif",marginBottom:4,fontWeight:"bold"}}>
            Scanned: {pendingCollection.brand} {pendingCollection.line}
          </div>
          <div style={{fontSize:11,color:T.textMuted}}>Use "+ Add Manually" below to add this cigar to your collection.</div>
          <button onClick={()=>setPendingCollection(null)}
            style={{marginTop:8,background:"none",border:"none",color:T.textMuted,fontSize:11,cursor:"pointer",padding:0,fontFamily:"Georgia,serif"}}>
            Dismiss
          </button>
        </div>
      )}

      {/* Cigars label */}
      <div style={{padding:"20px 20px 12px",display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
        <div style={{fontSize:9,letterSpacing:4,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif"}}>My Collection</div>
        <div style={{fontSize:11,color:T.textGold,cursor:"pointer",fontFamily:"Georgia,serif"}}>Sort: Recently Added</div>
      </div>

      {/* CIGAR BAND CARDS */}
      <div style={{padding:"0 16px"}}>
        {cigars.map(c=>{
          const isEx=sel===c.id;
          return (
            <div key={c.id} onClick={()=>setSel(isEx?null:c.id)}
              style={{background:"linear-gradient(170deg,#1a1a1a,#0d0d0d)",borderRadius:14,marginBottom:14,overflow:"hidden",
                cursor:"pointer",border:`1px solid ${isEx?T.borderGold:T.border}`,transition:"border-color 0.2s"}}>
              <div style={{display:"flex",alignItems:"stretch",minHeight:96}}>
                <div style={{width:6,background:c.bandColor,flexShrink:0}}/>
                <div style={{flex:1,padding:"18px 16px"}}>
                  <div style={{fontSize:10,color:T.textMuted,letterSpacing:4,textTransform:"uppercase",marginBottom:5,fontFamily:"Georgia,serif"}}>{c.brand}</div>
                  <div style={{fontSize:20,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1.15,marginBottom:6}}>{c.line}</div>
                  <div style={{fontSize:12,color:T.textSecondary,marginBottom:3}}>{c.vitola} · {c.wrapper}</div>
                  <div style={{fontSize:11,color:T.textMuted}}>{c.origin}</div>
                  <div style={{display:"flex",gap:16,marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`}}>
                    <div>
                      <div style={{fontSize:16,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1}}>{c.count}</div>
                      <div style={{fontSize:9,color:T.textMuted,letterSpacing:1.5,textTransform:"uppercase",marginTop:2}}>In Stock</div>
                    </div>
                    <div style={{width:1,background:T.border}}/>
                    <div>
                      <div style={{fontSize:13,color:T.textSecondary,fontFamily:"Georgia,serif",lineHeight:1.3}}>{c.purchaseDate}</div>
                      <div style={{fontSize:9,color:T.textMuted,letterSpacing:1.5,textTransform:"uppercase",marginTop:2}}>Purchased</div>
                    </div>
                  </div>
                  {isEx && (
                    <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
                      {editId===c.id ? (
                        // ── EDIT FORM ──
                        <div onClick={e=>e.stopPropagation()}>
                          {([["Brand","brand"],["Line","line"],["Vitola","vitola"],["Origin","origin"],["Wrapper","wrapper"]] as [string,string][]).map(([label,key])=>(
                            <div key={key} style={{marginBottom:8}}>
                              <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{label}</div>
                              <input value={(editForm as any)[key]} onChange={e=>setEditForm(f=>({...f,[key]:e.target.value}))}
                                style={{width:"100%",background:"rgba(0,0,0,0.3)",border:`1px solid ${T.border}`,borderRadius:6,
                                  padding:"8px 12px",color:T.textPrimary,fontSize:13,outline:"none",
                                  boxSizing:"border-box" as const,fontFamily:"Georgia,serif"}}/>
                            </div>
                          ))}
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                            {([["Count","count"],["Rating","rating"]] as [string,string][]).map(([label,key])=>(
                              <div key={key}>
                                <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{label}</div>
                                <input type="number" value={(editForm as any)[key]} onChange={e=>setEditForm(f=>({...f,[key]:e.target.value}))}
                                  style={{width:"100%",background:"rgba(0,0,0,0.3)",border:`1px solid ${T.border}`,borderRadius:6,
                                    padding:"8px 12px",color:T.textPrimary,fontSize:13,outline:"none",
                                    boxSizing:"border-box" as const,fontFamily:"Georgia,serif"}}/>
                              </div>
                            ))}
                          </div>
                          <div style={{display:"flex",gap:8}}>
                            <button onClick={saveEdit}
                              style={{flex:1,padding:"10px",background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                                border:"none",borderRadius:8,color:"#1a0e04",fontSize:12,fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
                              Save Changes
                            </button>
                            <button onClick={()=>setEditId(null)}
                              style={{padding:"10px 14px",background:"transparent",border:`1px solid ${T.border}`,
                                borderRadius:8,color:T.textMuted,fontSize:12,cursor:"pointer"}}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // ── DETAILS + ACTIONS ──
                        <>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                            {[["Origin",c.origin],["Wrapper",c.wrapper],["Vitola",c.vitola],["Rating",`${c.rating} pts`]].map(([k,v])=>(
                              <div key={k}>
                                <div style={{fontSize:9,color:T.textMuted,textTransform:"uppercase",letterSpacing:2,marginBottom:4}}>{k}</div>
                                <div style={{fontSize:14,color:T.textPrimary,fontFamily:"Georgia,serif"}}>{v}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{display:"flex",gap:8}}>
                            <button onClick={e=>startEdit(c,e)}
                              style={{flex:1,padding:"9px",background:"transparent",
                                border:`1px solid ${T.borderGold}`,borderRadius:8,
                                color:T.goldMid,fontSize:11,cursor:"pointer",fontFamily:"Georgia,serif",letterSpacing:0.5}}>
                              ✏️ Edit
                            </button>
                            <button onClick={e=>deleteCigar(c.id,e)}
                              style={{padding:"9px 14px",background:"transparent",
                                border:"1px solid rgba(180,40,40,0.4)",borderRadius:8,
                                color:"#c05050",fontSize:11,cursor:"pointer"}}>
                              🗑
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  padding:"18px 16px 18px 0",flexShrink:0,minWidth:56}}>
                  <div style={{fontSize:26,fontWeight:"bold",color:T.goldLight,fontFamily:"Georgia,serif",lineHeight:1}}>{c.rating}</div>
                  <div style={{fontSize:8,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",marginTop:3}}>Pts</div>
                </div>
              </div>
            </div>
          );
        })}
        <button onClick={()=>setShowAddForm(!showAddForm)}
          style={{width:"100%",padding:"13px",background:"transparent",border:`1px solid rgba(196,154,40,0.3)`,
          borderRadius:12,color:T.goldMid,fontSize:10,fontFamily:"Georgia,serif",
          cursor:"pointer",letterSpacing:3,textTransform:"uppercase",marginTop:4}}>
          + Add Manually
        </button>

        {showAddForm&&(
          <div style={{marginTop:12,background:T.card,borderRadius:14,border:`1px solid ${T.borderGold}`,padding:"18px 16px"}}>
            <div style={{fontSize:12,color:T.goldLight,fontFamily:"Georgia,serif",fontWeight:"bold",marginBottom:14,letterSpacing:1}}>Add to Collection</div>
            {([["Brand *","brand","e.g. Padrón"],["Line *","line","e.g. 1964 Anniversary"],["Vitola","vitola","e.g. Robusto"],
               ["Origin","origin","e.g. Nicaragua"],["Wrapper","wrapper","e.g. Natural"]] as [string,string,string][]).map(([label,key,ph])=>(
              <div key={key} style={{marginBottom:10}}>
                <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>{label}</div>
                <input value={(addForm as any)[key]} onChange={e=>setAddForm(f=>({...f,[key]:e.target.value}))}
                  placeholder={ph}
                  style={{width:"100%",background:"rgba(0,0,0,0.25)",border:`1px solid ${T.border}`,borderRadius:8,
                    padding:"10px 14px",color:T.textPrimary,fontSize:13,outline:"none",
                    boxSizing:"border-box" as const,fontFamily:"Georgia,serif"}}/>
              </div>
            ))}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <div>
                <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Count</div>
                <input type="number" value={addForm.count} onChange={e=>setAddForm(f=>({...f,count:e.target.value}))}
                  style={{width:"100%",background:"rgba(0,0,0,0.25)",border:`1px solid ${T.border}`,borderRadius:8,
                    padding:"10px 14px",color:T.textPrimary,fontSize:13,outline:"none",
                    boxSizing:"border-box" as const,fontFamily:"Georgia,serif"}}/>
              </div>
              <div>
                <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Rating (0–100)</div>
                <input type="number" value={addForm.rating} onChange={e=>setAddForm(f=>({...f,rating:e.target.value}))}
                  style={{width:"100%",background:"rgba(0,0,0,0.25)",border:`1px solid ${T.border}`,borderRadius:8,
                    padding:"10px 14px",color:T.textPrimary,fontSize:13,outline:"none",
                    boxSizing:"border-box" as const,fontFamily:"Georgia,serif"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={saveNewCigar}
                style={{flex:1,padding:"12px",background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                  border:"none",borderRadius:8,color:"#1a0e04",fontSize:13,fontWeight:"bold",
                  cursor:"pointer",fontFamily:"Georgia,serif"}}>
                Save to Collection
              </button>
              <button onClick={()=>setShowAddForm(false)}
                style={{padding:"12px 16px",background:"transparent",border:`1px solid ${T.border}`,
                  borderRadius:8,color:T.textMuted,fontSize:13,cursor:"pointer"}}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tasting Journal */}
      <TastingNotesSection prefill={pendingJournal} onPrefillUsed={()=>setPendingJournal(null)}/>

      {/* ── FLOATING SCANNER FAB ── */}
      <div onClick={()=>setShowScanner(true)} style={{
        position:"fixed",bottom:80,right:24,width:56,height:56,borderRadius:"50%",
        background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
        display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:`0 4px 20px rgba(196,154,40,0.4)`,cursor:"pointer",zIndex:200,
        border:`1px solid ${T.goldLight}44`}}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="5" height="5" rx="1"/>
          <rect x="17" y="2" width="5" height="5" rx="1"/>
          <rect x="2" y="17" width="5" height="5" rx="1"/>
          <line x1="9" y1="3.5" x2="9" y2="6.5"/>
          <line x1="12" y1="3.5" x2="12" y2="6.5"/>
          <line x1="15" y1="3.5" x2="15" y2="6.5"/>
          <line x1="9" y1="17.5" x2="9" y2="20.5"/>
          <line x1="12" y1="17.5" x2="12" y2="20.5"/>
          <line x1="15" y1="17.5" x2="15" y2="20.5"/>
          <line x1="17.5" y1="9" x2="20.5" y2="9"/>
          <line x1="17.5" y1="12" x2="20.5" y2="12"/>
          <line x1="17.5" y1="15" x2="20.5" y2="15"/>
        </svg>
      </div>
    </div>
  );
}

function TastingNotesSection({prefill,onPrefillUsed}:{prefill:ScanResult|null,onPrefillUsed:()=>void}) {
  const [notes,setNotes]=useState(NOTES_INIT);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({brand:"",line:"",vitola:"",rating:5,notes:"",pairing:""});
  const [sel,setSel]=useState<number|null>(null);

  useEffect(()=>{
    try{const s=localStorage.getItem("mh_notes");if(s)setNotes(JSON.parse(s));}catch{}
  },[]);

  useEffect(()=>{
    try{localStorage.setItem("mh_notes",JSON.stringify(notes));}catch{}
  },[notes]);

  useEffect(()=>{
    if(prefill){
      setForm(f=>({...f,brand:prefill.brand,line:prefill.line,vitola:prefill.vitola,notes:prefill.notes||""}));
      setShowForm(true);
      onPrefillUsed();
    }
  },[prefill]);
  const save=()=>{
    if(!form.brand.trim()) return;
    setNotes(n=>[{id:Date.now(),brand:form.brand,line:form.line,vitola:form.vitola,
      date:new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),
      rating:form.rating,notes:form.notes,pairing:form.pairing},...n]);
    setForm({brand:"",line:"",vitola:"",rating:5,notes:"",pairing:""});
    setShowForm(false);
  };
  const fi:React.CSSProperties={width:"100%",background:"rgba(0,0,0,0.2)",border:`1px solid ${T.border}`,
    borderRadius:8,padding:"10px 14px",color:T.textPrimary,fontSize:13,outline:"none",
    boxSizing:"border-box",marginBottom:10,fontFamily:"Georgia,serif"};
  return (
    <div style={{marginTop:28}}>
      {/* Section header */}
      <div style={{padding:"0 20px 16px",borderTop:`1px solid ${T.border}`,paddingTop:24,
        display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div style={{fontSize:10,letterSpacing:5,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif",marginBottom:6}}>Tasting Journal</div>
          <div style={{fontSize:20,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>Collector's Journal</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,border:"none",
            borderRadius:20,padding:"8px 18px",color:"#1a0e04",fontSize:12,
            fontFamily:"Georgia,serif",fontWeight:"bold",cursor:"pointer"}}>
          + Log
        </button>
      </div>

      {showForm && (
        <div style={{margin:"0 16px 16px",background:T.card,borderRadius:14,border:`1px solid ${T.borderGold}`,padding:"18px 16px"}}>
          {[["Brand",form.brand,"brand"],["Line",form.line,"line"],["Vitola",form.vitola,"vitola"],["Pairing",form.pairing,"pairing"]].map(([ph,val,key])=>(
            <input key={key} value={val as string} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph as string} style={fi}/>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:14}}>
            {[1,2,3,4,5].map(i=>(
              <span key={i} onClick={()=>setForm(f=>({...f,rating:i}))}
                style={{fontSize:28,cursor:"pointer",color:i<=form.rating?T.goldLight:T.textMuted,lineHeight:1}}>★</span>
            ))}
          </div>
          <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
            placeholder="Describe the experience — flavors, draw, burn, finish..." rows={4}
            style={{...fi,resize:"vertical",lineHeight:1.7}}/>
          <div style={{display:"flex",gap:10}}>
            <button onClick={save} style={{flex:1,padding:"11px",background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,border:"none",borderRadius:8,color:"#1a0e04",fontSize:13,fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>Save Entry</button>
            <button onClick={()=>setShowForm(false)} style={{padding:"11px 16px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{padding:"0 16px"}}>
        {notes.map(n=>(
          <div key={n.id} onClick={()=>setSel(sel===n.id?null:n.id)}
            style={{marginBottom:16,cursor:"pointer",
              borderRadius:12,overflow:"hidden",
              boxShadow:"0 2px 12px rgba(0,0,0,0.35)",
              border:`1px solid ${sel===n.id?"#b8966a":"#c8a97a"}`,}}>
            {/* Ruled paper body */}
            <div style={{
              background:"#faf8f0",
              position:"relative",
              padding:"14px 16px 14px 52px",
              backgroundImage:[
                "linear-gradient(#faf8f0 0px, #faf8f0 23px, #b8d4e8 23px, #b8d4e8 24px)",
              ].join(","),
              backgroundSize:"100% 24px",
              backgroundPositionY:"0px",
            }}>
              {/* Red margin line */}
              <div style={{position:"absolute",left:40,top:0,bottom:0,width:1.5,background:"rgba(210,60,60,0.55)"}}/>
              {/* Spiral holes */}
              <div style={{position:"absolute",left:10,top:0,bottom:0,display:"flex",flexDirection:"column",justifyContent:"space-around",paddingTop:8,paddingBottom:8}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:14,height:14,borderRadius:"50%",
                    background:"#e8e0d0",border:"1.5px solid #c8b898",
                    boxShadow:"inset 0 1px 2px rgba(0,0,0,0.15)"}}/>
                ))}
              </div>
              {/* Date */}
              <div style={{fontSize:9,color:"#8B6914",letterSpacing:3,textTransform:"uppercase",
                marginBottom:6,fontFamily:"Georgia,serif",lineHeight:"24px"}}>{n.date}</div>
              {/* Brand + line */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1,paddingRight:12}}>
                  <div style={{fontSize:9,color:"#7a5030",letterSpacing:3,textTransform:"uppercase",
                    fontFamily:"Georgia,serif",lineHeight:"24px"}}>{n.brand}</div>
                  <div style={{fontSize:19,fontWeight:"bold",color:"#1a0a02",
                    fontFamily:"Georgia,serif",lineHeight:"24px"}}>{n.line}</div>
                  <div style={{fontSize:12,color:"#6a4020",fontFamily:"Georgia,serif",
                    lineHeight:"24px"}}>{n.vitola}</div>
                </div>
                <div style={{display:"flex",gap:1,flexShrink:0,paddingTop:4}}>
                  {[1,2,3,4,5].map(i=>(
                    <span key={i} style={{fontSize:15,color:i<=n.rating?"#C49A28":"rgba(139,105,20,0.18)",lineHeight:1}}>★</span>
                  ))}
                </div>
              </div>
            </div>
            {/* Expanded notes — also ruled */}
            {sel===n.id&&(
              <div style={{
                background:"#faf8f0",
                borderTop:"1px solid #c8a97a",
                padding:"12px 16px 16px 52px",
                position:"relative",
                backgroundImage:"linear-gradient(#faf8f0 0px, #faf8f0 23px, #b8d4e8 23px, #b8d4e8 24px)",
                backgroundSize:"100% 24px",
              }}>
                <div style={{position:"absolute",left:40,top:0,bottom:0,width:1.5,background:"rgba(210,60,60,0.55)"}}/>
                <div style={{fontSize:13,color:"#2a1608",
                  fontFamily:"'Palatino Linotype', Palatino, Georgia, serif",
                  fontStyle:"italic",lineHeight:"24px",marginBottom:12}}>{n.notes}</div>
                {n.pairing&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,
                    background:"rgba(139,105,20,0.08)",borderRadius:8,
                    padding:"8px 12px",border:"1px solid rgba(139,105,20,0.2)"}}>
                    <span>🥃</span>
                    <span style={{fontSize:12,color:"#6a4010",fontFamily:"Georgia,serif",fontStyle:"italic"}}>
                      Paired with {n.pairing}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ASK MARIO — emotional center ───────────────────────────────────────────
const QUICK_PROMPTS=[["🍂","Recommend Cigars"],["🌡️","Humidor Advice"],["🍷","Pairing Suggestion"],["🌙","What to smoke tonight?"]];

function AskMarioTab({liveData}:{liveData:Record<string,{temperature:number|null;humidity:number|null;observedAt:string|null}>}) {
  const getGreeting=()=>{
    const h=new Date().getHours();
    const timeStr=h<12?"Good morning":h<17?"Good afternoon":h<21?"Good evening":"Good evening";
    // Find best sensor reading
    const sensors=Object.values(liveData).filter(s=>s.humidity&&s.humidity>0);
    const bestSensor=sensors[0];
    const humLine=bestSensor?.humidity
      ? ` The humidor's sitting at ${bestSensor.humidity.toFixed(0)}% humidity${bestSensor.humidity>=65&&bestSensor.humidity<=72?" — perfect conditions tonight":""}. `
      : " ";
    return `${timeStr}, Zebulon.${humLine}I'm Mario — your personal cigar sommelier. What are we smoking tonight?`;
  };
  const [messages,setMessages]=useState([{role:"ai",text:getGreeting()}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  const send=useCallback(async(text:string)=>{
    if(!text.trim()||loading) return;
    setMessages(m=>[...m,{role:"user",text}]);
    setInput("");
    setLoading(true);
    try {
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({system:"You are Mario, a warm, deeply knowledgeable private cigar concierge. Speak like a trusted friend at a private lounge. Be specific and personal. Sign responses with '— Mario'. Under 100 words.",
          messages:[...messages.map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text})),{role:"user",content:text}]})});
      const data=await res.json();
      const reply=data.content?.find((b:{type:string;text?:string})=>b.type==="text")?.text||"Please try again.";
      setMessages(m=>[...m,{role:"ai",text:reply}]);
    } catch {setMessages(m=>[...m,{role:"ai",text:"A momentary connection issue.\n\n— Mario"}]);}
    setLoading(false);
  },[messages,loading]);

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 130px)"}}>

      {/* MARIO HERO — avatar only */}
      <div style={{flexShrink:0,background:"#0a0a0a",padding:"16px 20px 14px",borderBottom:`1px solid rgba(196,154,40,0.15)`}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:72,height:72,borderRadius:"50%",flexShrink:0,
            border:`2px solid ${T.goldMid}`,overflow:"hidden",
            background:"linear-gradient(135deg,#1a1a1a,#0d0d0d)",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 0 0 3px #0a0a0a, 0 0 0 5px ${T.goldDark}44`}}>
            <span style={{fontSize:42}}>🧔</span>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:24,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1.15}}>Ask Mario</div>
            <div style={{fontSize:10,color:T.goldMid,letterSpacing:2.5,textTransform:"uppercase",marginTop:4}}>Master Cigar Sommelier · Private Lounge</div>
          </div>
        </div>
      </div>

      {/* Messages + Recommendation */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 0",display:"flex",flexDirection:"column",gap:14}}>

        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            {m.role==="ai" ? (
              <div style={{maxWidth:"92%",
                background:"linear-gradient(155deg,#1a1a1a 0%,#111111 60%,#0d0d0d 100%)",
                border:`1px solid rgba(196,154,40,0.22)`,borderRadius:"3px 16px 16px 16px",
                padding:"16px 18px",boxShadow:"0 4px 20px rgba(0,0,0,0.5)"}}>
                <div style={{fontSize:9,color:T.goldMid,letterSpacing:2,textTransform:"uppercase",
                  marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:14}}>🧔</span>
                  <span>Mario</span>
                </div>
                <div style={{fontSize:15,color:T.textPrimary,lineHeight:1.85,fontFamily:"Georgia,serif",whiteSpace:"pre-line"}}>{m.text}</div>
              </div>
            ) : (
              <div style={{maxWidth:"80%",background:"rgba(196,154,40,0.08)",border:`1px solid rgba(196,154,40,0.2)`,
                borderRadius:"16px 3px 16px 16px",padding:"12px 16px"}}>
                <div style={{fontSize:14,color:T.textPrimary,lineHeight:1.7,fontFamily:"Georgia,serif"}}>{m.text}</div>
              </div>
            )}
          </div>
        ))}
        {/* Tonight's Recommendation — below Mario's greeting */}
        <div style={{background:"linear-gradient(155deg,#1a1a1a 0%,#111111 60%,#0d0d0d 100%)",
          borderRadius:14,padding:"16px 18px",border:`1px solid rgba(196,154,40,0.25)`,
          boxShadow:"0 8px 32px rgba(0,0,0,0.6)"}}>
          <div style={{fontSize:9,color:T.goldMid,letterSpacing:3,textTransform:"uppercase",marginBottom:8,fontFamily:"Georgia,serif"}}>Tonight's Recommendation</div>
          <div style={{fontSize:22,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:6}}>Padrón 1964 Exclusivo</div>
          <div style={{display:"flex",gap:16,marginBottom:12}}>
            <div style={{fontSize:13,color:T.textSecondary,fontFamily:"Georgia,serif"}}>Rested 31 months</div>
            <div style={{fontSize:13,color:T.textSecondary,fontFamily:"Georgia,serif"}}>69% RH</div>
          </div>
          <div style={{borderTop:`1px solid rgba(196,154,40,0.15)`,paddingTop:10}}>
            <div style={{fontSize:9,color:T.goldMid,letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontFamily:"Georgia,serif"}}>Pair with</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap" as const}}>
              {["Espresso","Blanton's Bourbon","Dark Chocolate"].map(p=>(
                <span key={p} style={{fontSize:12,color:T.textPrimary,background:"rgba(196,154,40,0.08)",
                  border:`1px solid rgba(196,154,40,0.2)`,borderRadius:20,padding:"5px 14px",fontFamily:"Georgia,serif"}}>{p}</span>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div style={{display:"flex",justifyContent:"flex-start"}}>
            <div style={{background:"linear-gradient(155deg,#1a1a1a,#111111)",border:`1px solid rgba(196,154,40,0.22)`,
              borderRadius:"3px 16px 16px 16px",padding:"16px 20px"}}>
              <div style={{display:"flex",gap:5}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.goldMid,animation:`mT 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick prompts — full width stacked with icons */}
      <div style={{padding:"10px 16px 6px",display:"flex",flexDirection:"column",gap:8,flexShrink:0}}>
        {QUICK_PROMPTS.map(([icon,label])=>(
          <button key={label} onClick={()=>send(label)}
            style={{width:"100%",background:"linear-gradient(170deg,#1a1a1a,#111111)",
              border:`1px solid rgba(196,154,40,0.22)`,borderRadius:12,
              padding:"14px 18px",color:T.textPrimary,fontSize:15,cursor:"pointer",
              fontFamily:"Georgia,serif",textAlign:"left",display:"flex",
              alignItems:"center",justifyContent:"space-between"}}>
            <span style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:20}}>{icon}</span>
              <span>{label}</span>
            </span>
            <span style={{color:T.goldMid,fontSize:20}}>›</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{padding:"6px 16px 16px",display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter")send(input);}}
          placeholder="Ask Mario anything..."
          style={{flex:1,background:"linear-gradient(170deg,#1a1a1a,#111111)",border:`1px solid rgba(196,154,40,0.22)`,
            borderRadius:24,padding:"12px 18px",color:T.textPrimary,fontSize:13,
            fontFamily:"Georgia,serif",outline:"none"}}/>
        <button onClick={()=>send(input)}
          style={{width:44,height:44,borderRadius:"50%",flexShrink:0,
            background:`linear-gradient(135deg,${T.goldMid},${T.goldDark})`,
            border:"none",cursor:"pointer",color:"#0a0a0a",fontSize:22,fontWeight:"bold",
            display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",lineHeight:1}}>›</button>
      </div>
    </div>
  );
}

// ── NEWS CARD ──────────────────────────────────────────────────────────────
function NewsCard({n}:{n:any}) {
  const [showTake,setShowTake]=useState(false);
  return (
    <div style={{background:"linear-gradient(170deg,#1a1a1a,#0d0d0d)",borderRadius:16,border:`1px solid rgba(196,154,40,0.18)`,overflow:"hidden"}}>
      {n.image&&(
        <div style={{width:"100%",height:190,overflow:"hidden",position:"relative"}}>
          <img src={n.image} alt={n.title}
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
            onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
          <div style={{position:"absolute",inset:0,
            background:"linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.6) 100%)"}}/>
          <div style={{position:"absolute",bottom:12,left:14,
            fontSize:11,color:"rgba(255,255,255,0.95)",letterSpacing:2.5,
            textTransform:"uppercase",fontFamily:"Georgia,serif",fontWeight:"bold"}}>{n.source}</div>
        </div>
      )}
      <div style={{height:3,background:n.accent}}/>
      <div style={{padding:"18px 18px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          {!n.image&&<div style={{fontSize:10,color:n.accent,letterSpacing:2,textTransform:"uppercase",fontFamily:"Georgia,serif"}}>{n.source}</div>}
          <div style={{fontSize:11,color:T.textSecondary,marginLeft:"auto"}}>{n.date}</div>
        </div>
        <div style={{fontSize:19,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1.3,marginBottom:10}}>{n.title}</div>
        <div style={{fontSize:14,color:T.textSecondary,lineHeight:1.7,fontFamily:"Georgia,serif"}}>{n.summary}</div>
        {showTake&&n.marioTake&&(
          <div style={{marginTop:12,padding:"14px 16px",
            background:"linear-gradient(155deg,#1a1a1a,#0d0d0d)",
            borderRadius:10,border:`1px solid rgba(196,154,40,0.22)`}}>
            <div style={{fontSize:9,color:T.goldMid,letterSpacing:2,textTransform:"uppercase",
              marginBottom:8,display:"flex",alignItems:"center",gap:6,fontFamily:"Georgia,serif"}}>
              <span style={{fontSize:13}}>🧔</span>
              Mario's Take
            </div>
            <div style={{fontSize:13,color:T.textPrimary,fontFamily:"Georgia,serif",fontStyle:"italic",lineHeight:1.7}}>
              {n.marioTake}
            </div>
          </div>
        )}
        <div style={{marginTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          {n.link ? (
            <a href={n.link} target="_blank" rel="noopener noreferrer"
              style={{background:"none",border:`1px solid ${n.accent}44`,borderRadius:20,
                padding:"8px 18px",fontSize:12,color:n.accent,cursor:"pointer",
                fontFamily:"Georgia,serif",letterSpacing:0.5,textDecoration:"none"}}>
              Read More
            </a>
          ):(
            <button style={{background:"none",border:`1px solid ${n.accent}44`,borderRadius:20,
              padding:"5px 14px",fontSize:11,color:n.accent,cursor:"pointer",fontFamily:"Georgia,serif",letterSpacing:0.5}}>
              Read More
            </button>
          )}
          {n.marioTake ? (
            <button onClick={()=>setShowTake(s=>!s)}
              style={{background:"none",border:"none",fontSize:10,color:T.goldMid,
                cursor:"pointer",fontFamily:"Georgia,serif",fontStyle:"italic"}}>
              {showTake?"Hide Take":"Mario's Take →"}
            </button>
          ):(
            <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>Mario's Take →</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── COMMUNITY — The Members Lounge ─────────────────────────────────────────
const TRENDING=[
  {title:"Tonight's Smoke",sub:"What are you lighting up this evening?",comments:31,views:3200,time:"2m ago",hot:true},
  {title:"Cigar Reviews",sub:"Recent ratings and tasting notes from the lounge.",comments:28,views:2800,time:"8m ago",hot:true},
  {title:"Humidor Setups",sub:"Show us your cedar configurations.",comments:18,views:1800,time:"15m ago",hot:false},
  {title:"Bourbon Pairings",sub:"Your go-to spirit alongside a fine smoke.",comments:14,views:1500,time:"42m ago",hot:false},
  {title:"New Releases",sub:"What just arrived at your local shop?",comments:11,views:1200,time:"1h ago",hot:false},
  {title:"Aging & Resting",sub:"How long do you rest your sticks?",comments:9,views:900,time:"2h ago",hot:false},
];
const CAT_COLORS:Record<string,string>={"Review":"#7a1212","Pairing":"#1a5c35","Question":"#8B6914","Storage":"#1a2c50"};

const RARE_FINDS=[
  {id:1,user:"CigarDon_85",avatar:"C",badge:"Top Reviewer",time:"1h ago",
    cigar:"Cohiba Behike BHK 56",year:"2014",origin:"Cuba",
    rarity:"Limited Edition",
    story:"Found 5 of these at an estate sale in Miami. Previous owner was a diplomat. Still in original cedar box, bands pristine. Pulled one last night — it was transcendent.",
    tags:["Cuban","Aged 10yr","Estate Find"],likes:34,wants:18,liked:false,wanted:false},
  {id:2,user:"HumidorQueen",avatar:"H",badge:"Pairing Pro",time:"3h ago",
    cigar:"Padrón Family Reserve No. 85",year:"2009",origin:"Nicaragua",
    rarity:"Aged",
    story:"Rested these for 15 years. The chocolate and leather notes have deepened into something I've never experienced in a modern stick. Only 3 left in my humidor.",
    tags:["Nicaragua","Aged 15yr","Natural Wrapper"],likes:41,wants:27,liked:false,wanted:false},
  {id:3,user:"SlowBurn_Mike",avatar:"S",badge:"",time:"6h ago",
    cigar:"Arturo Fuente Opus X BBMF",year:"2018",origin:"Dominican Republic",
    rarity:"Regional",
    story:"My tobacconist got an allocation of 12 and held one back for me. One of the rarest Fuente vitolas produced. Waiting for the right moment.",
    tags:["Dominican","Regional Exclusive","Fuente"],likes:22,wants:31,liked:false,wanted:false},
];

function CommunityTab() {
  const [activeSubTab,setActiveSubTab]=useState<'feed'|'news'|'trending'|'rareFinds'>('feed');
  const [posts,setPosts]=useState(POSTS_INIT);
  const [newPost,setNewPost]=useState('');
  const [postCategory,setPostCategory]=useState('Review');
  const [showCompose,setShowCompose]=useState(false);
  const [liveNews,setLiveNews]=useState<any[]>([]);
  const [newsLoading,setNewsLoading]=useState(false);
  const [filter,setFilter]=useState<'all'|'following'|'mine'>('all');

  useEffect(()=>{
    if(activeSubTab==='news'&&liveNews.length===0){
      setNewsLoading(true);
      fetch('/api/news')
        .then(r=>r.json())
        .then(d=>{if(d.ok&&d.articles?.length>0)setLiveNews(d.articles);})
        .catch(()=>{})
        .finally(()=>setNewsLoading(false));
    }
  },[activeSubTab]);

  const submitPost=()=>{
    if(!newPost.trim()) return;
    setPosts([{id:Date.now(),user:'You',avatar:'Y',badge:'Member',category:postCategory,time:'Just now',
      title:'',body:newPost,likes:0,comments:0,liked:false},...posts]);
    setNewPost('');
    setShowCompose(false);
  };

  const IconTrending=({c}:{c:string})=>(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  );
  const IconDiscussions=({c}:{c:string})=>(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
  const IconNews=({c}:{c:string})=>(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
      <line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/>
    </svg>
  );
  const IconSpotlight=({c}:{c:string})=>(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M12 12v9"/>
      <path d="M8.5 20.5h7"/>
      <path d="M6 8H2M22 8h-4"/>
      <path d="M4.9 4.9 7.7 7.7M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3 4.9 19.1"/>
    </svg>
  );
  const IconCollection=({c}:{c:string})=>(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="17"/><line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/>
    </svg>
  );
  const IconEvents=({c}:{c:string})=>(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <path d="M9 16l2 2 4-4"/>
    </svg>
  );
  const IconEducation=({c}:{c:string})=>(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );

  const QUICK_ICONS=[
    {Icon:IconTrending,label:'Trending\nNow',tab:'trending' as const},
    {Icon:IconDiscussions,label:'Discussions',tab:'feed' as const},
    {Icon:IconNews,label:'News &\nReviews',tab:'news' as const},
    {Icon:IconSpotlight,label:'Member\nSpotlights',tab:'feed' as const},
    {Icon:IconCollection,label:'Collection\nShowcase',tab:'feed' as const},
    {Icon:IconEvents,label:'Events',tab:'feed' as const},
    {Icon:IconEducation,label:'Education',tab:'feed' as const},
  ];

  const fi={width:'100%',padding:'10px 14px',background:'rgba(0,0,0,0.3)',
    border:`1px solid ${T.border}`,borderRadius:8,color:T.textPrimary,
    fontSize:13,outline:'none',boxSizing:'border-box' as const,fontFamily:'Georgia,serif'};

  return (
    <div style={{paddingBottom:100}}>

      {/* ── HERO BANNER ─────────────────────────────── */}
      <div style={{
        margin:'0 0 0',
        background:'linear-gradient(160deg,#1a1206 0%,#0f0a02 50%,#0a0a0a 100%)',
        borderBottom:`1px solid rgba(196,154,40,0.2)`,
        padding:'20px 20px 16px',
        position:'relative',overflow:'hidden',
      }}>
        {/* Gold shimmer lines */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:2,
          background:`linear-gradient(90deg,transparent,${T.goldMid},transparent)`}}/>
        <div style={{position:'absolute',top:-40,right:-20,width:120,height:120,
          borderRadius:'50%',background:`radial-gradient(circle,${T.goldDark}18,transparent 70%)`}}/>
        <div style={{fontSize:10,color:T.goldMid,letterSpacing:5,textTransform:'uppercase',
          fontFamily:'Georgia,serif',marginBottom:8}}>Members Only</div>
        <div style={{fontSize:26,fontWeight:'bold',color:T.textPrimary,
          fontFamily:'Georgia,serif',lineHeight:1.1,marginBottom:6}}>
          Mario's Social Club
        </div>
        <div style={{fontSize:13,color:T.textSecondary,fontFamily:'Georgia,serif',
          fontStyle:'italic',lineHeight:1.6,marginBottom:16}}>
          A place for cigar enthusiasts to connect, share, learn, and celebrate the lifestyle.
        </div>
        <button onClick={()=>setShowCompose(true)}
          style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',
            background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
            border:'none',borderRadius:24,color:'#0a0a0a',fontSize:13,
            fontWeight:'bold',cursor:'pointer',fontFamily:'Georgia,serif',letterSpacing:0.5}}>
          <span style={{fontSize:16}}>✏️</span> NEW POST
        </button>
      </div>

      {/* ── QUICK ACCESS ICON GRID ───────────────────── */}
      <div style={{padding:'16px 12px 8px',borderBottom:`1px solid rgba(196,154,40,0.1)`}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>
          {QUICK_ICONS.map((item,i)=>{
            const active=activeSubTab===item.tab;
            const iconColor=active?T.goldMid:'rgba(160,120,40,0.4)';
            return (
              <button key={i} onClick={()=>setActiveSubTab(item.tab)}
                style={{background:'none',border:'none',cursor:'pointer',
                  display:'flex',flexDirection:'column',alignItems:'center',gap:5,padding:'8px 2px'}}>
                <div style={{width:44,height:44,borderRadius:14,
                  background:active
                    ?`linear-gradient(135deg,${T.goldDark}33,${T.goldMid}22)`
                    :'rgba(255,255,255,0.03)',
                  border:`1px solid ${active?T.borderGold:T.border}`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  transition:'all 0.2s'}}>
                  <item.Icon c={iconColor}/>
                </div>
                <div style={{fontSize:8.5,color:active?T.goldMid:T.textMuted,
                  textAlign:'center',lineHeight:1.3,fontFamily:'Georgia,serif',
                  whiteSpace:'pre-line'}}>{item.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SUB-TAB PILLS ────────────────────────────── */}
      <div style={{display:'flex',gap:8,padding:'12px 16px',
        borderBottom:`1px solid rgba(196,154,40,0.1)`,overflowX:'auto'}}>
        {([['feed','Feed'],['news','News'],['trending','Trending'],['rareFinds','Rare Finds']] as [typeof activeSubTab,string][]).map(([id,label])=>(
          <button key={id} onClick={()=>setActiveSubTab(id)}
            style={{flexShrink:0,padding:'7px 16px',borderRadius:24,cursor:'pointer',
              fontFamily:'Georgia,serif',fontSize:13,letterSpacing:0.3,
              background:activeSubTab===id?`linear-gradient(135deg,${T.goldDark},${T.goldMid})`:'transparent',
              border:activeSubTab===id?'none':`1px solid rgba(196,154,40,0.25)`,
              color:activeSubTab===id?'#0a0a0a':T.textMuted,
              fontWeight:activeSubTab===id?'bold':'normal'}}>
            {label}
          </button>
        ))}
      </div>

      {/* ── COMPOSE MODAL ───────────────────────────── */}
      {showCompose&&(
        <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.85)',
          display:'flex',alignItems:'flex-end'}}>
          <div style={{width:'100%',maxWidth:480,margin:'0 auto',
            background:'#111111',borderRadius:'20px 20px 0 0',
            border:`1px solid rgba(196,154,40,0.3)`,padding:'20px 20px 40px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif'}}>New Post</div>
              <button onClick={()=>setShowCompose(false)}
                style={{background:'none',border:'none',color:T.textMuted,fontSize:22,cursor:'pointer'}}>×</button>
            </div>
            {/* Category */}
            <div style={{display:'flex',gap:8,marginBottom:12,overflowX:'auto'}}>
              {['Review','Pairing','Question','Storage','Discussion'].map(cat=>(
                <button key={cat} onClick={()=>setPostCategory(cat)}
                  style={{flexShrink:0,padding:'5px 12px',borderRadius:20,cursor:'pointer',
                    fontSize:11,fontFamily:'Georgia,serif',
                    background:postCategory===cat?`${CAT_COLORS[cat]||T.goldDark}22`:'transparent',
                    border:`1px solid ${postCategory===cat?CAT_COLORS[cat]||T.goldDark:T.border}`,
                    color:postCategory===cat?CAT_COLORS[cat]||T.goldMid:T.textMuted}}>
                  {cat}
                </button>
              ))}
            </div>
            <textarea value={newPost} onChange={e=>setNewPost(e.target.value)}
              placeholder="What are you smoking today? Share your experience..."
              rows={4}
              style={{...fi,resize:'none',lineHeight:1.7,marginBottom:12}}/>
            <div style={{display:'flex',gap:10}}>
              <button onClick={submitPost}
                style={{flex:1,padding:'12px',background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                  border:'none',borderRadius:12,color:'#0a0a0a',fontSize:14,
                  fontWeight:'bold',cursor:'pointer',fontFamily:'Georgia,serif'}}>
                Post to Club
              </button>
              <button onClick={()=>setShowCompose(false)}
                style={{padding:'12px 16px',background:'transparent',
                  border:`1px solid ${T.border}`,borderRadius:12,
                  color:T.textMuted,fontSize:13,cursor:'pointer'}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FEED ────────────────────────────────────── */}
      {activeSubTab==='feed'&&(
        <div>
          {/* Filter pills */}
          <div style={{display:'flex',gap:8,padding:'12px 16px 4px'}}>
            {([['all','All Activity'],['following','Following'],['mine','My Posts']] as [typeof filter,string][]).map(([id,label])=>(
              <button key={id} onClick={()=>setFilter(id)}
                style={{padding:'6px 14px',borderRadius:20,cursor:'pointer',
                  fontFamily:'Georgia,serif',fontSize:12,
                  background:filter===id?'rgba(196,154,40,0.15)':'transparent',
                  border:`1px solid ${filter===id?T.borderGold:T.border}`,
                  color:filter===id?T.goldMid:T.textMuted}}>
                {label}
              </button>
            ))}
            <div style={{marginLeft:'auto',display:'flex',alignItems:'center'}}>
              <span style={{fontSize:11,color:T.textMuted,fontFamily:'Georgia,serif'}}>Sort: Latest</span>
            </div>
          </div>
          {/* Posts */}
          <div style={{padding:'8px 16px 0'}}>
            {posts.map(post=>(
              <div key={post.id} style={{
                background:'linear-gradient(170deg,#1a1a1a 0%,#111111 60%,#0d0d0d 100%)',
                borderRadius:14,border:`1px solid rgba(196,154,40,0.18)`,
                marginBottom:10,overflow:'hidden',
                boxShadow:'0 4px 16px rgba(0,0,0,0.4)'}}>
                <div style={{padding:'14px 16px 0',display:'flex',gap:12}}>
                  <div style={{width:42,height:42,borderRadius:'50%',flexShrink:0,
                    background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:16,fontWeight:'bold',color:'#0a0a0a',fontFamily:'Georgia,serif'}}>
                    {post.avatar}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5,flexWrap:'wrap'}}>
                      <span style={{fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',fontSize:15}}>{post.user}</span>
                      {post.badge&&<span style={{fontSize:9,color:T.goldMid,background:'rgba(196,154,40,0.12)',
                        padding:'3px 9px',borderRadius:20,letterSpacing:1,border:`1px solid rgba(196,154,40,0.2)`}}>{post.badge}</span>}
                      <span style={{fontSize:11,color:T.textMuted,marginLeft:'auto'}}>{post.time}</span>
                    </div>
                    <span style={{fontSize:10,color:CAT_COLORS[post.category]||T.goldDark,
                      background:`${CAT_COLORS[post.category]||T.goldDark}18`,
                      padding:'3px 10px',borderRadius:12,letterSpacing:1,
                      border:`1px solid ${CAT_COLORS[post.category]||T.goldDark}33`}}>{post.category}</span>
                    {post.title&&<div style={{fontSize:16,fontWeight:'bold',color:T.textPrimary,
                      fontFamily:'Georgia,serif',marginTop:10,marginBottom:4,lineHeight:1.3}}>{post.title}</div>}
                    <div style={{fontSize:14,color:T.textSecondary,fontFamily:'Georgia,serif',
                      lineHeight:1.7,marginTop:8,marginBottom:12}}>{post.body}</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:20,padding:'10px 16px 12px',
                  borderTop:`1px solid rgba(196,154,40,0.08)`}}>
                  <button onClick={()=>setPosts(posts.map(p=>p.id===post.id?{...p,likes:p.liked?p.likes-1:p.likes+1,liked:!p.liked}:p))}
                    style={{background:'none',border:'none',cursor:'pointer',
                      color:post.liked?T.goldLight:T.textMuted,
                      fontFamily:'Georgia,serif',fontSize:14,display:'flex',alignItems:'center',gap:6}}>
                    {post.liked?'♥':'♡'} {post.likes}
                  </button>
                  <span style={{color:T.textMuted,fontSize:14,display:'flex',alignItems:'center',gap:6}}>
                    💬 {post.comments} replies
                  </span>
                  <span style={{marginLeft:'auto',color:T.textMuted,fontSize:14,cursor:'pointer'}}>🔖</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── NEWS ────────────────────────────────────── */}
      {activeSubTab==='news'&&(
        <div style={{padding:16,display:'flex',flexDirection:'column',gap:12}}>
          {newsLoading&&(
            <div style={{textAlign:'center',padding:40,color:T.textMuted,fontFamily:'Georgia,serif'}}>
              <div style={{display:'flex',gap:7,justifyContent:'center',marginBottom:12}}>
                {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:T.goldDark,animation:`sp 1.4s ease-in-out ${i*0.28}s infinite`}}/>)}
              </div>
              Loading latest news...
            </div>
          )}
          {!newsLoading&&(liveNews.length>0?liveNews:NEWS).map(n=><NewsCard key={n.id} n={n}/>)}
        </div>
      )}

      {/* ── TRENDING ─────────────────────────────────── */}
      {activeSubTab==='trending'&&(
        <div style={{padding:'16px 16px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div>
              <div style={{fontSize:17,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',lineHeight:1.2}}>Trending Now</div>
              <div style={{fontSize:13,color:T.textSecondary,fontFamily:'Georgia,serif',marginTop:3}}>What the community is talking about</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(196,154,40,0.1)',
              border:`1px solid rgba(196,154,40,0.3)`,borderRadius:20,padding:'5px 12px'}}>
              <span style={{fontSize:11}}>🔥</span>
              <span style={{fontSize:10,color:T.goldMid,letterSpacing:2,fontFamily:'Georgia,serif',fontWeight:'bold'}}>LIVE</span>
            </div>
          </div>
          {TRENDING.map((t,i)=>(
            <div key={i} style={{
              background:'linear-gradient(170deg,#1a1a1a,#0d0d0d)',
              borderRadius:14,border:`1px solid ${t.hot?'rgba(196,154,40,0.3)':'rgba(196,154,40,0.12)'}`,
              marginBottom:10,overflow:'hidden',cursor:'pointer',
              boxShadow:t.hot?'0 4px 20px rgba(196,154,40,0.08)':'none'}}>
              <div style={{display:'flex',alignItems:'center',gap:14,padding:'16px'}}>
                <div style={{width:44,height:44,borderRadius:10,flexShrink:0,
                  background:i===0?`linear-gradient(135deg,${T.goldDark},${T.goldMid})`:
                             i===1?'linear-gradient(135deg,#888,#aaa)':
                             i===2?'linear-gradient(135deg,#8B6914,#c49a28)':
                             'linear-gradient(135deg,#1a1a1a,#2a2a2a)',
                  border:i>2?`1px solid rgba(196,154,40,0.2)`:'none',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color:i<3?'#0a0a0a':T.goldDark,
                  fontWeight:'bold',fontFamily:'Georgia,serif',fontSize:18}}>
                  {i+1}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                    {t.hot&&<span style={{fontSize:12}}>🔥</span>}
                    <div style={{fontSize:16,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',lineHeight:1.2}}>{t.title}</div>
                  </div>
                  <div style={{fontSize:12,color:T.textSecondary,fontFamily:'Georgia,serif',fontStyle:'italic',marginBottom:8,lineHeight:1.4}}>{t.sub}</div>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:12,color:T.goldMid}}>💬 {t.comments}</span>
                    <span style={{fontSize:12,color:T.textMuted}}>👁 {(t.views/1000).toFixed(1)}K</span>
                    <span style={{fontSize:11,color:T.textMuted,fontFamily:'Georgia,serif',marginLeft:'auto'}}>{t.time}</span>
                  </div>
                </div>
                <span style={{color:T.goldMid,fontSize:20,flexShrink:0}}>›</span>
              </div>
              <div style={{height:2,background:`linear-gradient(90deg,${T.goldDark},${T.goldMid}${Math.round((t.comments/31)*255).toString(16).padStart(2,'0')},transparent)`}}/>
            </div>
          ))}
        </div>
      )}

      {/* ── RARE FINDS ───────────────────────────────── */}
      {activeSubTab==='rareFinds'&&(
        <div style={{padding:'16px 16px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div>
              <div style={{fontSize:17,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',lineHeight:1.2}}>Rare Finds</div>
              <div style={{fontSize:13,color:T.textSecondary,fontFamily:'Georgia,serif',marginTop:3}}>Members sharing exceptional cigars</div>
            </div>
            <button style={{background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
              border:'none',borderRadius:20,padding:'7px 14px',
              color:'#0a0a0a',fontSize:11,fontFamily:'Georgia,serif',
              letterSpacing:1,fontWeight:'bold',cursor:'pointer'}}>+ Post Find</button>
          </div>
          {RARE_FINDS.map(r=>(
            <div key={r.id} style={{
              background:'linear-gradient(170deg,#1a1a1a 0%,#111111 60%,#0d0d0d 100%)',
              borderRadius:14,border:`1px solid rgba(196,154,40,0.22)`,
              marginBottom:14,overflow:'hidden',
              boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>
              <div style={{padding:'14px 16px 0',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:38,height:38,borderRadius:'50%',flexShrink:0,
                  background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:14,fontWeight:'bold',color:'#0a0a0a',fontFamily:'Georgia,serif'}}>
                  {r.avatar}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',fontSize:14}}>{r.user}</span>
                    {r.badge&&<span style={{fontSize:9,color:T.goldMid,background:'rgba(196,154,40,0.12)',
                      padding:'2px 8px',borderRadius:20,letterSpacing:1,border:`1px solid rgba(196,154,40,0.2)`}}>{r.badge}</span>}
                  </div>
                  <div style={{fontSize:11,color:T.textMuted}}>{r.time}</div>
                </div>
              </div>
              <div style={{padding:'12px 16px 14px'}}>
                <div style={{fontSize:16,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',marginBottom:4}}>{r.cigar}</div>
                <div style={{fontSize:11,color:T.goldMid,letterSpacing:1,marginBottom:8}}>{r.rarity} · {r.year} · {r.origin}</div>
                <div style={{fontSize:13,color:T.textSecondary,fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:1.7,marginBottom:12}}>{r.story}</div>
                <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap' as const}}>
                  {r.tags.map((tag:string)=>(
                    <span key={tag} style={{fontSize:10,color:T.textMuted,background:'rgba(255,255,255,0.04)',
                      border:`1px solid ${T.border}`,borderRadius:20,padding:'3px 10px'}}>{tag}</span>
                  ))}
                </div>
                <div style={{display:'flex',gap:16,paddingTop:10,borderTop:`1px solid rgba(196,154,40,0.08)`}}>
                  <span style={{fontSize:13,color:T.textMuted}}>♡ {r.likes}</span>
                  <span style={{fontSize:13,color:T.textMuted}}>⭐ {r.wants} want this</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TastingNotesTab() {
  const [notes,setNotes]=useState(NOTES_INIT);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({brand:"",line:"",vitola:"",rating:5,notes:"",pairing:""});
  const [sel,setSel]=useState<number|null>(null);
  const save=()=>{
    if(!form.brand.trim()) return;
    setNotes(n=>[{id:Date.now(),brand:form.brand,line:form.line,vitola:form.vitola,
      date:new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),
      rating:form.rating,notes:form.notes,pairing:form.pairing},...n]);
    setForm({brand:"",line:"",vitola:"",rating:5,notes:"",pairing:""});
    setShowForm(false);
  };
  const fi:React.CSSProperties={width:"100%",background:"rgba(0,0,0,0.2)",border:`1px solid ${T.border}`,
    borderRadius:8,padding:"10px 14px",color:T.textPrimary,fontSize:13,outline:"none",
    boxSizing:"border-box",marginBottom:10,fontFamily:"Georgia,serif"};
  return (
    <div style={{padding:"0 0 32px"}}>
      <div style={{padding:"24px 20px 20px",borderBottom:`1px solid ${T.border}`,
        display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div style={{fontSize:10,letterSpacing:5,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif",marginBottom:6}}>Tasting Journal</div>
          <div style={{fontSize:22,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>Collector's Journal</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,border:"none",
            borderRadius:20,padding:"8px 18px",color:"#1a0e04",fontSize:12,
            fontFamily:"Georgia,serif",fontWeight:"bold",cursor:"pointer"}}>
          + Log
        </button>
      </div>

      {showForm && (
        <div style={{margin:"16px 16px 0",background:T.card,borderRadius:14,border:`1px solid ${T.borderGold}`,padding:"18px 16px"}}>
          {[["Brand",form.brand,"brand"],["Line",form.line,"line"],["Vitola",form.vitola,"vitola"],["Pairing",form.pairing,"pairing"]].map(([ph,val,key])=>(
            <input key={key} value={val as string} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph as string} style={fi}/>
          ))}
          <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:14}}>
            {[1,2,3,4,5].map(i=>(
              <span key={i} onClick={()=>setForm(f=>({...f,rating:i}))}
                style={{fontSize:28,cursor:"pointer",color:i<=form.rating?T.goldLight:T.textMuted,lineHeight:1}}>★</span>
            ))}
          </div>
          <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
            placeholder="Describe the experience — flavors, draw, burn, finish..." rows={4}
            style={{...fi,resize:"vertical",lineHeight:1.7}}/>
          <div style={{display:"flex",gap:10}}>
            <button onClick={save} style={{flex:1,padding:"11px",background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,border:"none",borderRadius:8,color:"#1a0e04",fontSize:13,fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>Save Entry</button>
            <button onClick={()=>setShowForm(false)} style={{padding:"11px 16px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{padding:"16px 16px 0"}}>
        {notes.map(n=>(
          <div key={n.id} onClick={()=>setSel(sel===n.id?null:n.id)}
            style={{marginBottom:16,cursor:"pointer",
              borderRadius:12,overflow:"hidden",
              boxShadow:"0 2px 12px rgba(0,0,0,0.35)",
              border:`1px solid ${sel===n.id?"#b8966a":"#c8a97a"}`}}>
            <div style={{
              background:"#faf8f0",position:"relative",
              padding:"14px 16px 14px 52px",
              backgroundImage:"linear-gradient(#faf8f0 0px, #faf8f0 23px, #b8d4e8 23px, #b8d4e8 24px)",
              backgroundSize:"100% 24px",
            }}>
              <div style={{position:"absolute",left:40,top:0,bottom:0,width:1.5,background:"rgba(210,60,60,0.55)"}}/>
              <div style={{position:"absolute",left:10,top:0,bottom:0,display:"flex",flexDirection:"column",justifyContent:"space-around",paddingTop:8,paddingBottom:8}}>
                {[0,1,2].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:"#e8e0d0",border:"1.5px solid #c8b898",boxShadow:"inset 0 1px 2px rgba(0,0,0,0.15)"}}/>)}
              </div>
              <div style={{fontSize:9,color:"#8B6914",letterSpacing:3,textTransform:"uppercase",marginBottom:6,fontFamily:"Georgia,serif",lineHeight:"24px"}}>{n.date}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1,paddingRight:12}}>
                  <div style={{fontSize:9,color:"#7a5030",letterSpacing:3,textTransform:"uppercase",fontFamily:"Georgia,serif",lineHeight:"24px"}}>{n.brand}</div>
                  <div style={{fontSize:19,fontWeight:"bold",color:"#1a0a02",fontFamily:"Georgia,serif",lineHeight:"24px"}}>{n.line}</div>
                  <div style={{fontSize:12,color:"#6a4020",fontFamily:"Georgia,serif",lineHeight:"24px"}}>{n.vitola}</div>
                </div>
                <div style={{display:"flex",gap:1,flexShrink:0,paddingTop:4}}>
                  {[1,2,3,4,5].map(i=><span key={i} style={{fontSize:15,color:i<=n.rating?"#C49A28":"rgba(139,105,20,0.18)",lineHeight:1}}>★</span>)}
                </div>
              </div>
            </div>
            {sel===n.id&&(
              <div style={{
                background:"#faf8f0",borderTop:"1px solid #c8a97a",
                padding:"12px 16px 16px 52px",position:"relative",
                backgroundImage:"linear-gradient(#faf8f0 0px, #faf8f0 23px, #b8d4e8 23px, #b8d4e8 24px)",
                backgroundSize:"100% 24px",
              }}>
                <div style={{position:"absolute",left:40,top:0,bottom:0,width:1.5,background:"rgba(210,60,60,0.55)"}}/>
                <div style={{fontSize:13,color:"#2a1608",fontFamily:"'Palatino Linotype',Palatino,Georgia,serif",
                  fontStyle:"italic",lineHeight:"24px",marginBottom:12}}>{n.notes}</div>
                {n.pairing&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(139,105,20,0.08)",
                    borderRadius:8,padding:"8px 12px",border:"1px solid rgba(139,105,20,0.2)"}}>
                    <span>🥃</span>
                    <span style={{fontSize:12,color:"#6a4010",fontFamily:"Georgia,serif",fontStyle:"italic"}}>Paired with {n.pairing}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SETTINGS ───────────────────────────────────────────────────────────────
function SettingsTab() {
  const [tempUnit,setTempUnit]=useState("F");
  const [notifs,setNotifs]=useState(true);
  const [apiKeySaved,setApiKeySaved]=useState(false);
  const [apiKeyInput,setApiKeyInput]=useState("");
  const Toggle=({val,set}:{val:boolean,set:(v:boolean)=>void})=>(
    <div onClick={()=>set(!val)} style={{width:44,height:26,borderRadius:13,cursor:"pointer",
      background:val?T.goldMid:"rgba(255,255,255,0.07)",position:"relative",transition:"background 0.2s",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:val?22:3,width:20,height:20,borderRadius:"50%",
        background:val?"#1a0e04":"rgba(255,255,255,0.25)",transition:"left 0.2s"}}/>
    </div>
  );
  const Group=({title,children}:{title:string,children:React.ReactNode})=>(
    <div style={{margin:"0 16px",marginTop:14}}>
      <div style={{fontSize:10,letterSpacing:4,textTransform:"uppercase",color:T.textMuted,
        fontFamily:"Georgia,serif",marginBottom:8,paddingLeft:4}}>{title}</div>
      <div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,overflow:"hidden"}}>{children}</div>
    </div>
  );
  const Row=({label,sub,right,last}:{label:string,sub?:string,right:React.ReactNode,last?:boolean})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
      padding:"15px 16px",borderBottom:last?"none":`1px solid ${T.border}`}}>
      <div>
        <div style={{fontSize:14,color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:sub?2:0}}>{label}</div>
        {sub&&<div style={{fontSize:11,color:T.textMuted}}>{sub}</div>}
      </div>
      {right}
    </div>
  );
  return (
    <div style={{padding:"0 0 32px"}}>
      <div style={{padding:"24px 20px 20px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{fontSize:10,letterSpacing:5,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif"}}>Settings</div>
      </div>

      {/* Account */}
      <Group title="Account">
        <Row label="Mario's Humidor" sub="v1.0.0 · The Cigar Lifestyle Platform"
          right={<div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:"bold",color:"#1a0e04",fontFamily:"Georgia,serif"}}>M</div>}/>
      </Group>

      {/* Collection */}
      <Group title="Collection">
        <Row label="Temperature Unit" sub="Display preference"
          right={
            <div style={{display:"flex",gap:2,background:"rgba(0,0,0,0.2)",borderRadius:8,padding:2}}>
              {["F","C"].map(u=>(
                <button key={u} onClick={()=>setTempUnit(u)}
                  style={{padding:"4px 14px",borderRadius:6,cursor:"pointer",border:"none",
                    background:tempUnit===u?`linear-gradient(135deg,${T.goldDark},${T.goldMid})`:"transparent",
                    color:tempUnit===u?"#1a0e04":T.textMuted,fontSize:12,fontFamily:"Georgia,serif"}}>
                  °{u}
                </button>
              ))}
            </div>
          } last/>
      </Group>

      {/* API */}
      <Group title="API">
        <div style={{padding:"16px"}}>
          <div style={{fontSize:14,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:4}}>Anthropic API Key</div>
          <div style={{fontSize:12,color:T.textMuted,lineHeight:1.65,marginBottom:12}}>Required for Ask Mario, Band Scanner, and Mario's Take on news.</div>
          {apiKeySaved ? (
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:T.success}}/>
                <span style={{fontSize:13,color:T.success,fontFamily:"Georgia,serif"}}>API Key Connected</span>
              </div>
              <button onClick={()=>{setApiKeySaved(false);setApiKeyInput("");}}
                style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.textMuted,
                  padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:"Georgia,serif"}}>Remove Key</button>
            </div>
          ):(
            <div>
              <input type="password" value={apiKeyInput} onChange={e=>setApiKeyInput(e.target.value)}
                placeholder="sk-ant-..."
                style={{width:"100%",boxSizing:"border-box" as const,background:"rgba(0,0,0,0.3)",border:`1px solid ${T.border}`,
                  borderRadius:8,padding:"10px 14px",color:T.textPrimary,fontSize:13,outline:"none",marginBottom:10,fontFamily:"Georgia,serif"}}/>
              <button onClick={()=>{if(!apiKeyInput.startsWith("sk-"))return;setApiKeySaved(true);}}
                style={{width:"100%",padding:"11px",background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                  border:"none",borderRadius:8,color:"#1a0e04",fontSize:13,fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
                Save API Key
              </button>
              <div style={{fontSize:11,color:T.textMuted,marginTop:8,textAlign:"center"}}>console.anthropic.com</div>
            </div>
          )}
        </div>
      </Group>

      {/* Sensors */}
      <Group title="Sensors">
        <Row label="Govee H5051" sub="WiFi sensor integration — coming soon" right={<div style={{fontSize:11,color:T.textMuted}}>Pending</div>}/>
        <Row label="Raching MON1800A" sub="Built-in sensor support" right={<div style={{fontSize:11,color:T.textMuted}}>Pending</div>} last/>
      </Group>

      {/* Notifications */}
      <Group title="Notifications">
        <Row label="Humidity Alerts" sub="Alert when below 65% RH" right={<Toggle val={notifs} set={setNotifs}/>}/>
        <Row label="Temperature Alerts" sub="Alert when above 70°F" right={<Toggle val={false} set={()=>{}}/>} last/>
      </Group>

      <div style={{padding:"24px 20px 0",display:"flex",justifyContent:"center",gap:24}}>
        {["Privacy","Terms","Support"].map(l=>(
          <span key={l} style={{fontSize:12,color:T.textGold,cursor:"pointer",fontFamily:"Georgia,serif"}}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ── NEWS SCREEN ────────────────────────────────────────────────────────────
function NewsTab() {
  return (
    <div style={{padding:"0 0 32px"}}>
      <div style={{padding:"24px 20px 18px"}}>
        <div style={{fontSize:10,letterSpacing:5,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif"}}>Cigar News</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,padding:"0 16px"}}>
        {NEWS.map(n=>(
          <div key={n.id} style={{background:T.card,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden"}}>
            <div style={{height:3,background:n.accent}}/>
            <div style={{padding:"18px 18px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{fontSize:10,color:n.accent,letterSpacing:2,textTransform:"uppercase",fontFamily:"Georgia,serif"}}>{n.source}</div>
                <div style={{fontSize:10,color:T.textMuted}}>{n.date}</div>
              </div>
              <div style={{fontSize:19,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1.3,marginBottom:10}}>{n.title}</div>
              <div style={{fontSize:14,color:T.textSecondary,lineHeight:1.7,fontFamily:"Georgia,serif"}}>{n.summary}</div>
              <div style={{marginTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <button style={{background:"none",border:`1px solid ${n.accent}44`,borderRadius:20,
                  padding:"5px 14px",fontSize:11,color:n.accent,cursor:"pointer",fontFamily:"Georgia,serif",letterSpacing:0.5}}>
                  Read More
                </button>
                <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>Mario's Take →</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


const NAV=[
  {id:"mario",label:"Mario"},
  {id:"collection",label:"Collection"},
  {id:"community",label:"Community"},
  {id:"humidors",label:"Humidors"},
  {id:"settings",label:"Settings"},
];

function NavIcon({id,active}:{id:string,active:boolean}) {
  const c=active?T.goldLight:"rgba(255,255,255,0.28)";
  const icons:Record<string,React.ReactNode>={
    humidors:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" suppressHydrationWarning>
        <circle cx="11" cy="11" r="8.5" stroke={c} strokeWidth="1.4" fill="none"/>
        {Array.from({length:9},(_,i)=>{const a=(i*40-200)*Math.PI/180,r1=i%3===0?5.5:6.5,r2=7.8;
          return <line key={i} suppressHydrationWarning x1={11+r1*Math.cos(a)} y1={11+r1*Math.sin(a)} x2={11+r2*Math.cos(a)} y2={11+r2*Math.sin(a)}
            stroke={c} strokeWidth={i%3===0?"1.2":"0.7"} opacity={i%3===0?1:0.5}/>;
        })}
        <line x1="11" y1="11" x2="11" y2="4.8" stroke={active?"#cc0020":"rgba(150,30,30,0.5)"} strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="11" cy="11" r="1.4" fill={c}/>
      </svg>
    ),
    collection:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2.5" y="6" width="17" height="13" rx="2" stroke={c} strokeWidth="1.4" fill="none"/>
        <path d="M7.5 6V4.5A3.5 3.5 0 0 1 14.5 4.5V6" stroke={c} strokeWidth="1.4"/>
        <line x1="7" y1="11.5" x2="15" y2="11.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <line x1="7" y1="14.5" x2="12" y2="14.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    mario:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.8" stroke={c} strokeWidth="1.4" fill="none"/>
        <path d="M4 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="11" cy="8" r="1.4" fill={c} opacity="0.45"/>
      </svg>
    ),
    community:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="8.5" cy="8" r="3" stroke={c} strokeWidth="1.4" fill="none"/>
        <circle cx="15.5" cy="8" r="3" stroke={c} strokeWidth="1.4" fill="none"/>
        <path d="M2 19c0-3.31 2.91-6 6.5-6s6.5 2.69 6.5 6" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M15 13.5c3.2 0 5.8 1.7 5.8 5.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    notes:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M12.5 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6.5-6z" stroke={c} strokeWidth="1.4" fill="none"/>
        <line x1="7" y1="11" x2="15" y2="11" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <line x1="7" y1="14.5" x2="11.5" y2="14.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    news:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="4" width="18" height="14" rx="2" stroke={c} strokeWidth="1.4" fill="none"/>
        <line x1="6" y1="8.5" x2="16" y2="8.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="6" y1="11.5" x2="16" y2="11.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <line x1="6" y1="14.5" x2="11" y2="14.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    settings:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="3" stroke={c} strokeWidth="1.4" fill="none"/>
        <path d="M11 2v2M11 18v2M2 11H4M18 11h2M4.05 4.05l1.41 1.41M16.54 16.54l1.41 1.41M4.05 17.95l1.41-1.41M16.54 5.46l1.41-1.41"
          stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  };
  return <>{icons[id]||null}</>;
}

function BottomNav({tab,setTab}:{tab:string,setTab:(t:string)=>void}) {
  return (
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,zIndex:100,background:"#0a0a0a",borderTop:`1px solid rgba(160,120,40,0.18)`}}>
      <div style={{display:"flex",justifyContent:"space-around",
        padding:"8px 0",paddingBottom:"env(safe-area-inset-bottom,8px)"}}>
        {NAV.map(n=>{
          const active=tab===n.id;
          return (
            <button key={n.id} onClick={()=>setTab(n.id)}
              style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",padding:"6px 2px 5px",background:"none",border:"none",
                cursor:"pointer",opacity:active?1:0.38,transition:"opacity 0.2s"}}>
              <div style={{filter:active?`drop-shadow(0 0 5px ${T.goldLight})`:"none",marginBottom:4}}>
                <NavIcon id={n.id} active={active}/>
              </div>
              <div style={{fontSize:8.5,color:active?T.goldLight:"rgba(255,255,255,0.28)",
                fontFamily:"Georgia,serif",letterSpacing:0.3,whiteSpace:"nowrap"}}>
                {n.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── APP HEADER ─────────────────────────────────────────────────────────────
function AppHeader({totalCigars}:{totalCigars:number}) {
  return (
    <div style={{position:"sticky",top:0,zIndex:50,background:"#0a0a0a",borderBottom:`1px solid rgba(160,120,40,0.18)`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:48,height:48,borderRadius:"50%",flexShrink:0,
            border:`2px solid ${T.goldMid}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            background:"transparent"}}>
            <span style={{fontSize:22,fontWeight:"bold",color:T.goldMid,fontFamily:"Georgia,serif",lineHeight:1}}>M</span>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",letterSpacing:3,textTransform:"uppercase",lineHeight:1.2}}>Mario's Humidor</div>
            <div style={{fontSize:9,color:T.textMuted,letterSpacing:2.5,textTransform:"uppercase",marginTop:3}}>The Cigar Lifestyle Platform</div>
          </div>
        </div>
        <div style={{width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={T.goldMid} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={T.goldMid} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}


// ── MAIN ───────────────────────────────────────────────────────────────────
export default function MariosHumidor() {
  const [tab,setTab]=useState("mario");
  const [splash,setSplash]=useState(true);

  // Live Govee data lifted here so it persists across tab switches
  type LiveReading={temperature:number|null;humidity:number|null;observedAt:string|null};
  const [liveData,setLiveData]=useState<Record<string,LiveReading>>({});
  const [liveStatus,setLiveStatus]=useState<"idle"|"loading"|"connected"|"error">("idle");
  const [lastUpdated,setLastUpdated]=useState<string|null>(null);

  const fetchLive=useCallback(async(isInitial=false)=>{
    if(isInitial) setLiveStatus("loading");
    try{
      const res=await fetch("/api/govee");
      const data=await res.json();
      if(data.ok&&data.sensors&&data.sensors.length>0){
        setLiveData(prev=>{
          const next={...prev};
          let changed=false;
          data.sensors.forEach((s:{name:string;temperature:number|null;humidity:number|null;observedAt:string|null})=>{
            const existing=prev[s.name];
            if(!existing||existing.temperature!==s.temperature||existing.humidity!==s.humidity){
              next[s.name]={temperature:s.temperature,humidity:s.humidity,observedAt:s.observedAt};
              changed=true;
            }
          });
          return changed?next:prev;
        });
        setLiveStatus("connected");
        setLastUpdated(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));
      } else { if(isInitial) setLiveStatus("error"); }
    } catch { if(isInitial) setLiveStatus("error"); }
  },[]);

  useEffect(()=>{
    fetchLive(true);
    const t=setInterval(()=>fetchLive(false),60_000);
    return()=>clearInterval(t);
  },[fetchLive]);

  const render=()=>{
    switch(tab){
      case "humidors":   return <HumidorsTab liveData={liveData} liveStatus={liveStatus} lastUpdated={lastUpdated} onRefresh={()=>fetchLive(false)}/>;
      case "collection": return <CollectionTab/>;
      case "mario":      return <AskMarioTab liveData={liveData}/>;
      case "community":  return <CommunityTab/>;
      case "settings":   return <SettingsTab/>;
      default:           return <HumidorsTab liveData={liveData} liveStatus={liveStatus} lastUpdated={lastUpdated} onRefresh={()=>fetchLive(false)}/>;
    }
  };
  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.textPrimary,fontFamily:"Georgia,serif",maxWidth:480,margin:"0 auto",position:"relative"}}>
      <CedarBg/>
      {splash&&<SplashScreen onDone={()=>setSplash(false)}/>}
      <div style={{position:"relative",zIndex:1,paddingBottom:76}}>
        <AppHeader totalCigars={0}/>
        {render()}
      </div>
      <BottomNav tab={tab} setTab={setTab}/>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{margin:0;padding:0;overflow-x:hidden}
        input,textarea,select{font-family:Georgia,serif;color-scheme:dark}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(180,140,60,0.12);border-radius:2px}
        @keyframes mT{0%,80%,100%{transform:translateY(0);opacity:0.3}40%{transform:translateY(-5px);opacity:1}}
      `}</style>
    </div>
  );
}