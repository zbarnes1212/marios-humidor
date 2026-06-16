"use client";
import {T,r2,getCigarImage,NOTES_INIT,polar,useLang,useSyncContext} from "@/lib/constants";
import {LuxuryGauge,MMedallion,SvgIcon} from "@/lib/ui";
import React,{useState,useEffect,useRef,useCallback} from "react";
import {upsertHumidor as syncUpsertHumidor,deleteHumidor as syncDeleteHumidor,upsertCigar as syncUpsertCigar,upsertRecord as syncUpsertRecord,upsertNote as syncUpsertNote,deleteCigar as syncDeleteCigar,deleteRecord as syncDeleteRecord} from "@/lib/sync";
import {MarioModal} from "@/components/HomeTab";

type CigarEntry={id:number;brand:string;line:string;vitola:string;origin:string;wrapper:string;rating:number;count:number;purchaseDate:string;bandColor:string;humidorId:number|null};
type ScanResult={brand:string;line:string;vitola:string;origin:string;wrapper:string;rating:number|null;confidence:string;notes:string;image_filename?:string|null};

export function HumidorsTab({liveData,liveStatus,lastUpdated,onRefresh}:{
  liveData:Record<string,{temperature:number|null;humidity:number|null;observedAt:string|null}>;
  liveStatus:"idle"|"loading"|"connected"|"error";
  lastUpdated:string|null;
  onRefresh:()=>void;
}) {
  const {userId,getToken}=useSyncContext();
  type Humidor={id:number;name:string;wood:string;capacity:number;status:string;photo?:string};
  const [humidors,setHumidors]=useState<Humidor[]>([]);
  const [mounted,setMounted]=useState(false);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({name:"",wood:"Spanish Cedar",capacity:"150"});
  const [editHumidor,setEditHumidor]=useState<Humidor|null>(null);
  const [menuOpen,setMenuOpen]=useState<number|null>(null);
  const [selectedHumidor,setSelectedHumidor]=useState<number|null>(null);
  const [historyRange,setHistoryRange]=useState<'24H'|'7D'|'30D'|'90D'>('24H');
  const [liveHistory,setLiveHistory]=useState<Record<string,{humidity:number;created_at:string}[]>>({});
  const [historyLoading,setHistoryLoading]=useState(false);
  const [expandedCigars,setExpandedCigars]=useState<number|null>(null);
  const [addingToHumidor,setAddingToHumidor]=useState<number|null>(null);
  const [humidorCigars,setHumidorCigars]=useState<any[]>([]);
  const [invCatalogQuery,setInvCatalogQuery]=useState("");
  const [invCatalogResults,setInvCatalogResults]=useState<any[]>([]);
  const [invCatalogSearching,setInvCatalogSearching]=useState(false);
  const [detailHumidor,setDetailHumidor]=useState<number|null>(null);
  const [detailTab,setDetailTab]=useState<'overview'|'inventory'|'history'|'insights'>('overview');
  const [aiInsights,setAiInsights]=useState<{aging:string;environment:string;collection:string}|null>(null);
  const [insightsLoading,setInsightsLoading]=useState(false);
  const [insightsHumidorId,setInsightsHumidorId]=useState<number|null>(null);
  const [invSearch,setInvSearch]=useState("");
  const [editCigar,setEditCigar]=useState<any|null>(null);
  const [humidorMarioPrompt,setHumidorMarioPrompt]=useState<string|null>(null);
  const [historyDrillCigar,setHistoryDrillCigar]=useState<any|null>(null);
  const [historyNoteForm,setHistoryNoteForm]=useState({text:"",pairing:"",rating:0,photo:""});
  const [historyAddingNote,setHistoryAddingNote]=useState(false);
  const [historyNoteRefresh,setHistoryNoteRefresh]=useState(0);
  const {t}=useLang();

  const HUMIDOR_COLORS=['#3dd68c','#C49A28','#6a9fe0','#e07a5f','#b67ee0'];

  // Fetch live history from Supabase when range changes
  useEffect(()=>{
    if(humidors.length===0) return;
    setHistoryLoading(true);
    Promise.all(
      humidors.map(h=>
        fetch(`/api/sensor-history?range=${historyRange}&device=${encodeURIComponent(h.name)}`)
          .then(r=>r.json())
          .then(d=>({name:h.name,data:d.data||[]}))
          .catch(()=>({name:h.name,data:[]}))
      )
    ).then(results=>{
      const map:Record<string,{humidity:number;created_at:string}[]>={};
      results.forEach(r=>{map[r.name]=r.data;});
      setLiveHistory(map);
      setHistoryLoading(false);
    });
  },[historyRange,humidors.length]);

  const getHistoryData=(id:number)=>{
    const h=humidors.find(hh=>hh.id===id);
    if(!h) return [];
    const hist=liveHistory[h.name];
    if(hist&&hist.length>0) return hist.map((r:any)=>r.humidity??r.temperature??68);
    // Fallback: flat line at current live value
    const live=getLive(h.name);
    const currentHumidity=live?.humidity??null;
    if(currentHumidity&&currentHumidity>0) return Array(24).fill(currentHumidity);
    return Array(24).fill(68);
  };

  useEffect(()=>{
    try{const s=localStorage.getItem('mh_humidors');if(s)setHumidors(JSON.parse(s));}catch{}
    try{const s=localStorage.getItem('mh_cigars');if(s)setHumidorCigars(JSON.parse(s));}catch{}
    setMounted(true);
    const sync=()=>{
      try{
        const s=localStorage.getItem('mh_cigars');
        if(!s) return;
        setHumidorCigars(prev=>{
          // Only update if data actually changed — prevents unnecessary re-renders
          const next=JSON.parse(s);
          return JSON.stringify(prev)===JSON.stringify(next)?prev:next;
        });
      }catch{}
    };
    document.addEventListener('visibilitychange',sync);
    window.addEventListener('focus',sync);
    window.addEventListener('storage',sync);
    return()=>{
      document.removeEventListener('visibilitychange',sync);
      window.removeEventListener('focus',sync);
      window.removeEventListener('storage',sync);
    };
  },[]);

  useEffect(()=>{
    if(!mounted) return;
    try{localStorage.setItem('mh_humidors',JSON.stringify(humidors));}catch{}
    // Sync to Supabase
    if(userId){
      getToken().then(token=>{
        if(!token) return;
        humidors.forEach(h=>syncUpsertHumidor(token,userId,h));
      });
    }
  },[humidors,mounted,userId,getToken]);

  const getLive=(name:string)=>liveData[name]??null;
  const connected=liveStatus==="connected";

  const addHumidor=async()=>{
    if(!form.name.trim()) return;
    const newH:Humidor={id:Date.now(),name:form.name.trim(),wood:form.wood,
      capacity:parseInt(form.capacity)||150,status:"no_data"};
    setHumidors(h=>[...h,newH]);
    setForm({name:"",wood:"Spanish Cedar",capacity:"150"});
    setShowForm(false);
    if(userId){const token=await getToken();if(token)syncUpsertHumidor(token,userId,newH);}
  };

  const deleteHumidor=(id:number)=>{
    if(window.confirm("Remove this humidor?"))
      setHumidors(prev=>prev.filter(h=>h.id!==id));
    setMenuOpen(null);
  };

  const saveEditHumidor=async()=>{
    if(!editHumidor) return;
    setHumidors(prev=>prev.map(h=>h.id===editHumidor.id?editHumidor:h));
    if(userId){const token=await getToken();if(token)syncUpsertHumidor(token,userId,editHumidor);}
    setEditHumidor(null);
  };

  const compressCigarPhoto=(dataUrl:string,maxW=300):Promise<string>=>{
    return new Promise(res=>{
      const img=new Image();
      img.onload=()=>{
        const scale=Math.min(1,maxW/img.width);
        const canvas=document.createElement('canvas');
        canvas.width=img.width*scale;
        canvas.height=img.height*scale;
        const ctx=canvas.getContext('2d');
        if(!ctx){res("");return;}
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        res(canvas.toDataURL('image/jpeg',0.5));
      };
      img.onerror=()=>res("");
      img.src=dataUrl;
    });
  };

  const saveCigarEdit=async()=>{
    if(!editCigar) return;
    // Compress photo before writing to localStorage to avoid quota errors
    let photoToSave=editCigar.customPhoto||null;
    if(photoToSave&&photoToSave.startsWith("data:image")){
      try{photoToSave=await compressCigarPhoto(photoToSave);}catch{photoToSave=null;}
    }
    const toSave={...editCigar,customPhoto:photoToSave};
    // Strip internal UI state fields
    delete toSave._addingNote;
    delete toSave._noteRating;
    const updated=humidorCigars.map((c:any)=>c.id===editCigar.id?toSave:c);
    setHumidorCigars(updated);
    try{localStorage.setItem('mh_cigars',JSON.stringify(updated));}catch(e){
      // If still too large, save without photo
      const withoutPhoto=humidorCigars.map((c:any)=>c.id===editCigar.id?{...toSave,customPhoto:null}:c);
      try{localStorage.setItem('mh_cigars',JSON.stringify(withoutPhoto));}catch{}
    }
    // Sync to Supabase
    if(userId){const token=await getToken();if(token)syncUpsertCigar(token,userId,toSave);}
    setEditCigar(null);
  };

  const removeCigarFromHumidor=(cigarId:number)=>{
    const updated=humidorCigars.map((c:any)=>c.id===cigarId?{...c,humidorId:null}:c);
    setHumidorCigars(updated);
    try{localStorage.setItem('mh_cigars',JSON.stringify(updated));}catch{}
  };

  const addCigarToHumidor=async(cigarId:number,humidorId:number)=>{
    const updated=humidorCigars.map((c:any)=>c.id===cigarId?{...c,humidorId}:c);
    setHumidorCigars(updated);
    try{localStorage.setItem('mh_cigars',JSON.stringify(updated));}catch{}
    const cigar=updated.find((c:any)=>c.id===cigarId);
    if(userId&&cigar){const token=await getToken();if(token)syncUpsertCigar(token,userId,cigar);}
    setAddingToHumidor(null);
  };

  const handlePhotoUpload=(id:number,e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{
      setHumidors(prev=>prev.map(h=>h.id===id?{...h,photo:ev.target?.result as string}:h));
    };
    reader.readAsDataURL(file);
  };

  const fi:React.CSSProperties={width:"100%",background:"rgba(0,0,0,0.25)",
    border:`1px solid rgba(160,120,40,0.22)`,borderRadius:10,padding:"11px 14px",
    color:T.textPrimary,fontSize:17,outline:"none",boxSizing:"border-box",
    marginBottom:10,fontFamily:"Georgia,serif"};

  // Collection overview stats
  const totalCigars=mounted?humidorCigars.reduce((a:number,c:any)=>a+(c.count||0),0):0;
  const allStatuses=mounted?humidors.map(h=>{
    const live=getLive(h.name);
    const humidity=live?.humidity??null;
    const temp=live?.temperature??null;
    const humOk=humidity!==null&&humidity>=65&&humidity<=72;
    const tempOk=temp!==null&&temp>=65&&temp<=70;
    const hasReading=humidity!==null||temp!==null;
    return !hasReading?"no_sensor":humOk&&tempOk?"optimal":humOk||tempOk?"good":"warning";
  }):[];
  const hasWarning=allStatuses.includes("warning");
  const healthLabel=!mounted?"—":hasWarning?"Attention Needed":allStatuses.includes("good")?"Good":"Excellent";
  const healthColor=hasWarning?"#e05050":allStatuses.includes("good")?T.goldMid:"#3dd68c";

  // ── HUMIDOR DETAIL SCREEN ──────────────────────────────────────────────
  if(detailHumidor!==null){
    const h=humidors.find(hh=>hh.id===detailHumidor);
    // Only reset if humidors have loaded — prevents back-to-list on mount
    if(!h) { if(mounted) setDetailHumidor(null); return null; }
    const live=getLive(h.name);
    const humidity=live?.humidity??null;
    const temp=live?.temperature??null;
    const humOk=humidity!==null&&humidity>=65&&humidity<=72;
    const tempOk=temp!==null&&temp>=65&&temp<=70;
    const hasReading=humidity!==null||temp!==null;
    const calcStatus=!hasReading?"No Sensor":humOk&&tempOk?"Optimal":humOk||tempOk?"Good":"Warning";
    const statusColor=calcStatus==="Optimal"?"#3dd68c":calcStatus==="Good"?T.goldMid:calcStatus==="No Sensor"?T.textMuted:"#e05050";
    const hCigars=humidorCigars.filter((c:any)=>c.humidorId===h.id);
    const filtered=hCigars.filter((c:any)=>
      !invSearch||c.line?.toLowerCase().includes(invSearch.toLowerCase())||
      c.brand?.toLowerCase().includes(invSearch.toLowerCase())||
      c.vitola?.toLowerCase().includes(invSearch.toLowerCase())
    );

    return(
      <div style={{paddingBottom:100,minHeight:"100vh"}}>

        {/* ── DETAIL HEADER ── */}
        <div style={{padding:"16px 16px 0",display:"flex",alignItems:"center",
          justifyContent:"space-between",borderBottom:`1px solid ${T.border}`,paddingBottom:14}}>
          <button onClick={()=>{setDetailHumidor(null);setDetailTab('overview');setInvSearch("");}}
            style={{background:"none",border:"none",cursor:"pointer",padding:"4px 8px 4px 0",
              display:"flex",alignItems:"center",gap:6,color:T.goldMid}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke={T.goldMid} strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div style={{fontSize:17,fontWeight:"bold",color:T.textPrimary,
            fontFamily:"Georgia,serif",letterSpacing:0.5}}>{h.name}</div>
          <button onClick={()=>setEditHumidor({...h})}
            style={{background:"none",border:"none",cursor:"pointer",padding:"4px 0 4px 8px",
              color:T.goldMid}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke={T.goldMid} strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>

        {/* ── SUB-TABS ── */}
        <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,
          padding:"0 16px",gap:0}}>
          {(['overview','inventory','history','insights'] as const).map(tab=>(
            <button key={tab} onClick={()=>setDetailTab(tab)}
              style={{flex:1,padding:"12px 4px",background:"none",border:"none",
                cursor:"pointer",fontFamily:"Georgia,serif",fontSize:11,
                letterSpacing:1.5,textTransform:"uppercase",
                color:detailTab===tab?T.goldMid:T.textMuted,
                borderBottom:detailTab===tab?`2px solid ${T.goldMid}`:"2px solid transparent",
                marginBottom:-1}}>
              {tab==='inventory'?'Collection':tab.charAt(0).toUpperCase()+tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {detailTab==='overview'&&(
          <div style={{padding:"16px"}}>

            {/* Hero photo */}
            <div style={{position:"relative",height:180,borderRadius:14,overflow:"hidden",
              marginBottom:16,background:"#000"}}>
              <img src={h.photo||"/humidor-hero.png"} alt={h.name}
                style={{width:"100%",height:"100%",objectFit:"cover",
                  objectPosition:"center",filter:"brightness(0.75)"}}
                onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
              <div style={{position:"absolute",inset:0,
                background:"linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,0.85) 100%)"}}/>
              <div style={{position:"absolute",bottom:14,left:16}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:statusColor,
                    boxShadow:hasReading?`0 0 8px ${statusColor}88`:"none"}}/>
                  <span style={{fontSize:13,color:statusColor,fontFamily:"Georgia,serif"}}>
                    {calcStatus}
                  </span>
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontFamily:"Georgia,serif",
                  fontStyle:"italic",marginTop:2}}>{h.wood} · Capacity {h.capacity}</div>
              </div>
              {/* Last updated */}
              {lastUpdated&&(
                <div style={{position:"absolute",bottom:14,right:14,
                  fontSize:10,color:"rgba(255,255,255,0.5)",fontFamily:"Georgia,serif"}}>
                  Updated {lastUpdated}
                </div>
              )}
            </div>

            {/* Live readings */}
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              <div style={{flex:1,background:"rgba(255,255,255,0.04)",
                border:`1px solid ${T.border}`,borderRadius:12,
                padding:"16px 12px",textAlign:"center"}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={T.textMuted} opacity="0.7"
                  style={{marginBottom:6}}>
                  <path d="M12 2C6 10 4 14 4 17a8 8 0 0 0 16 0c0-3-2-7-8-15z"/>
                </svg>
                <div style={{fontSize:32,fontWeight:"bold",color:"#ffffff",
                  fontFamily:"Georgia,serif",lineHeight:1}}>
                  {hasReading&&humidity!==null?`${humidity}%`:"—"}
                </div>
                <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,
                  textTransform:"uppercase",marginTop:4,fontFamily:"Georgia,serif"}}>
                  Relative Humidity
                </div>
              </div>
              <div style={{flex:1,background:"rgba(255,255,255,0.04)",
                border:`1px solid ${T.border}`,borderRadius:12,
                padding:"16px 12px",textAlign:"center"}}>
                <svg width="14" height="16" viewBox="0 0 24 24" fill="none"
                  stroke={T.textMuted} strokeWidth="2" opacity="0.7"
                  style={{marginBottom:6}}>
                  <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                </svg>
                <div style={{fontSize:32,fontWeight:"bold",color:"#ffffff",
                  fontFamily:"Georgia,serif",lineHeight:1}}>
                  {hasReading&&temp!==null?`${temp}°F`:"—"}
                </div>
                <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,
                  textTransform:"uppercase",marginTop:4,fontFamily:"Georgia,serif"}}>
                  Temperature
                </div>
              </div>
            </div>

            {/* Cigar count */}
            <div style={{background:"#111111",border:`1px solid rgba(196,154,40,0.15)`,
              borderRadius:12,padding:"14px 16px",marginBottom:16,
              display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke={T.goldMid} strokeWidth="1.8" opacity="0.8">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                <div>
                  <div style={{fontSize:17,fontWeight:"bold",color:T.textPrimary,
                    fontFamily:"Georgia,serif"}}>{hCigars.length} Cigars</div>
                  <div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif",marginTop:2}}>
                    {h.capacity-hCigars.length} slots available
                  </div>
                </div>
              </div>
              <button onClick={()=>setDetailTab('inventory')}
                style={{background:"none",border:`1px solid rgba(196,154,40,0.3)`,
                  borderRadius:8,padding:"7px 14px",cursor:"pointer",
                  color:T.goldMid,fontSize:12,fontFamily:"Georgia,serif"}}>
                View All
              </button>
            </div>

            {/* Sensor status */}
            <div style={{background:"#111111",border:`1px solid rgba(196,154,40,0.15)`,
              borderRadius:12,padding:"14px 16px",marginBottom:16}}>
              <div style={{fontSize:9,color:T.textMuted,letterSpacing:2.5,
                textTransform:"uppercase",fontFamily:"Georgia,serif",marginBottom:10}}>
                Sensor Status
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",
                    background:hasReading?"#3dd68c":T.textMuted,
                    boxShadow:hasReading?"0 0 8px #3dd68c88":"none"}}/>
                  <span style={{fontSize:15,color:T.textPrimary,fontFamily:"Georgia,serif"}}>
                    {hasReading?"Connected":"Offline"}
                  </span>
                </div>
                {hasReading&&lastUpdated&&(
                  <span style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif"}}>
                    Last updated {lastUpdated}
                  </span>
                )}
              </div>
              {!hasReading&&(
                <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",
                  fontStyle:"italic",marginTop:8}}>
                  ESP32 sensor integration coming soon
                </div>
              )}
            </div>

            {/* Quick alerts */}
            <div style={{background:"#111111",border:`1px solid rgba(196,154,40,0.15)`,
              borderRadius:12,padding:"14px 16px"}}>
              <div style={{fontSize:9,color:T.textMuted,letterSpacing:2.5,
                textTransform:"uppercase",fontFamily:"Georgia,serif",marginBottom:10}}>
                Quick Alerts
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,
                  background:calcStatus==="Warning"?"rgba(224,80,80,0.1)":"rgba(61,214,140,0.1)",
                  border:`1px solid ${calcStatus==="Warning"?"rgba(224,80,80,0.3)":"rgba(61,214,140,0.3)"}`,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:18}}>
                    {calcStatus==="Warning"?"⚠️":"✓"}
                  </span>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:"bold",color:T.textPrimary,
                    fontFamily:"Georgia,serif"}}>
                    {calcStatus==="Warning"?"Conditions need attention":"All systems normal"}
                  </div>
                  <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",marginTop:2}}>
                    {calcStatus==="Warning"
                      ?"Check humidity and temperature readings."
                      :"Your humidor is in optimal condition."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── INVENTORY TAB ── */}
        {detailTab==='inventory'&&(
          <div style={{padding:"16px"}}>

            {/* Search — full width */}
            <div style={{position:"relative",marginBottom:14}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={T.textMuted} strokeWidth="2"
                style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}>
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={invSearch} onChange={e=>setInvSearch(e.target.value)}
                placeholder="Search cigar collection..."
                style={{width:"100%",background:"#111111",border:`1px solid rgba(196,154,40,0.2)`,
                  borderRadius:24,padding:"11px 16px 11px 36px",color:T.textPrimary,
                  fontSize:15,fontFamily:"Georgia,serif",outline:"none",boxSizing:"border-box"}}/>
            </div>

            {/* Floating add button above nav bar */}
            <div style={{position:"fixed",bottom:"calc(72px + env(safe-area-inset-bottom,0px))",
              right:20,zIndex:90}}>
              <button onClick={()=>setAddingToHumidor(h.id)}
                style={{width:52,height:52,borderRadius:26,
                  background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                  border:"none",cursor:"pointer",display:"flex",alignItems:"center",
                  justifyContent:"center",
                  boxShadow:"0 4px 16px rgba(196,154,40,0.45)"}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            </div>

            {/* Cigar count */}
            <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",
              marginBottom:12,letterSpacing:0.5}}>
              {filtered.length} cigar{filtered.length!==1?"s":""} in this humidor
            </div>

            {/* Cigar list */}
            {filtered.length===0?(
              <div style={{textAlign:"center",padding:"40px 20px",
                color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>
                {invSearch?"No cigars match your search":"No cigars in this humidor yet"}
              </div>
            ):filtered.map((c:any)=>(
              <div key={c.id} onClick={()=>setEditCigar({...c})}
                style={{display:"flex",alignItems:"center",gap:12,
                background:"#111111",borderRadius:12,overflow:"hidden",
                border:`1px solid rgba(196,154,40,0.12)`,marginBottom:10,cursor:"pointer"}}>
                <div style={{width:56,height:56,flexShrink:0,background:"#000"}}>
                  <img src={(c.customPhoto||c.imageUri)?(c.customPhoto||c.imageUri):getCigarImage(c.vitola,c.wrapper,c.image_filename)} alt={c.line}
                    style={{width:"100%",height:"100%",objectFit:"cover"}}
                    onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                </div>
                <div style={{flex:1,padding:"8px 0"}}>
                  <div style={{fontSize:15,fontWeight:"bold",color:T.textPrimary,
                    fontFamily:"Georgia,serif",marginBottom:2}}>{c.line}</div>
                  <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",
                    fontStyle:"italic"}}>{c.brand}</div>
                  <div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif",
                    marginTop:2}}>{c.vitola}{c.wrapper?` · ${c.wrapper}`:""}</div>
                </div>
                <div style={{padding:"0 10px",textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:"bold",color:T.goldMid,
                    fontFamily:"Georgia,serif",lineHeight:1}}>{c.count}</div>
                  <div style={{fontSize:9,color:T.textMuted,letterSpacing:1.5,
                    textTransform:"uppercase",marginTop:3}}>Qty</div>
                </div>
                <div style={{padding:"0 12px 0 0",display:"flex",flexDirection:"column",gap:6}}>
                  <button onClick={e=>{e.stopPropagation();
                    const updated=humidorCigars.map((hc:any)=>hc.id===c.id?{...hc,count:(hc.count||0)+1}:hc);
                    setHumidorCigars(updated);
                    try{localStorage.setItem('mh_cigars',JSON.stringify(updated));}catch{}
                    const updatedCigar=updated.find((hc:any)=>hc.id===c.id);
                    if(userId&&updatedCigar){getToken().then(token=>{if(token)syncUpsertCigar(token,userId,updatedCigar);});}
                  }}
                    style={{background:"#111111",
                      border:"1px solid rgba(255,255,255,0.08)",
                      borderRadius:6,padding:"4px 10px",cursor:"pointer",
                      color:"#3dd68c",fontSize:11,fontFamily:"Georgia,serif"}}>
                    Add
                  </button>
                  <button onClick={e=>{e.stopPropagation();
                    // Decrement count, log to Record tab as smoked
                    const newCount=Math.max(0,(c.count||0)-1);
                    const updated=humidorCigars.map((hc:any)=>hc.id===c.id?{...hc,count:newCount}:hc);
                    setHumidorCigars(updated);
                    try{localStorage.setItem('mh_cigars',JSON.stringify(updated));}catch{}
                    // Log to Record
                    try{
                      const records=JSON.parse(localStorage.getItem('mh_records')||'[]');
                      const entry={id:Date.now(),brand:c.brand||"",line:c.line||"",
                        vitola:c.vitola||"",wrapper:c.wrapper||"",origin:c.origin||"",
                        status:"smoked",note:"",rating:null,photo:null,
                        date:new Date().toLocaleDateString()};
                      localStorage.setItem('mh_records',JSON.stringify([entry,...records]));
                    }catch{}
                  }}
                    style={{background:"#111111",
                      border:"1px solid rgba(255,255,255,0.08)",
                      borderRadius:6,padding:"4px 10px",cursor:"pointer",
                      color:"#e05050",fontSize:11,fontFamily:"Georgia,serif"}}>
                    Smoke
                  </button>
                </div>
              </div>
            ))}

            {/* ── EDIT CIGAR BOTTOM SHEET ── */}
            {editCigar&&(
              <div style={{position:"fixed",inset:0,zIndex:200,
                background:"rgba(0,0,0,0.85)"}}
                onClick={()=>setEditCigar(null)}>
                {/* Sheet — absolutely pinned to bottom, fixed height */}
                <div style={{position:"absolute",bottom:0,left:0,right:0,
                  maxWidth:480,margin:"0 auto",
                  background:"#111111",borderRadius:"20px 20px 0 0",
                  border:`1px solid rgba(196,154,40,0.25)`,
                  display:"flex",flexDirection:"column",
                  height:"86vh"}}
                  onClick={e=>e.stopPropagation()}>

                  {/* Cigar image hero */}
                  <div style={{flexShrink:0,background:"#000",height:200,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    borderRadius:"20px 20px 0 0",overflow:"hidden",position:"relative"}}>
                    <img src={(editCigar.customPhoto||editCigar.imageUri)||getCigarImage(editCigar.vitola,editCigar.wrapper,editCigar.image_filename)}
                      alt={editCigar.line}
                      style={{height:"120%",width:"auto",objectFit:"contain",
                        transform:"rotate(-6deg) translateY(-8px)",
                        filter:"drop-shadow(0px 24px 48px rgba(0,0,0,0.95))"}}
                      onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                    <div style={{position:"absolute",inset:0,
                      background:"linear-gradient(to bottom,rgba(0,0,0,0.15) 0%,transparent 35%,transparent 45%,#111111 100%)"}}/>
                    {/* Camera / upload buttons */}
                    <div style={{position:"absolute",top:14,right:14,display:"flex",gap:8}}>
                      {/* Library picker */}
                      <label style={{display:"flex",alignItems:"center",gap:5,
                        background:"rgba(0,0,0,0.6)",border:"1px solid rgba(196,154,40,0.35)",
                        borderRadius:20,padding:"7px 12px",cursor:"pointer"}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="#C49A28" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span style={{fontSize:11,color:"#C49A28",fontFamily:"Georgia,serif"}}>Library</span>
                        <input type="file" accept="image/*"
                          style={{display:"none"}}
                          onChange={e=>{
                            const file=e.target.files?.[0];
                            if(!file) return;
                            const reader=new FileReader();
                            reader.onload=ev=>{
                              const dataUrl=ev.target?.result as string;
                              setEditCigar({...editCigar,customPhoto:dataUrl});
                            };
                            reader.readAsDataURL(file);
                          }}/>
                      </label>
                      {/* Camera */}
                      <label style={{display:"flex",alignItems:"center",gap:5,
                        background:"rgba(0,0,0,0.6)",border:"1px solid rgba(196,154,40,0.35)",
                        borderRadius:20,padding:"7px 12px",cursor:"pointer"}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="#C49A28" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                        <span style={{fontSize:11,color:"#C49A28",fontFamily:"Georgia,serif"}}>Photo</span>
                        <input type="file" accept="image/*" capture="environment"
                          style={{display:"none"}}
                          onChange={e=>{
                            const file=e.target.files?.[0];
                            if(!file) return;
                            const reader=new FileReader();
                            reader.onload=ev=>{
                              const dataUrl=ev.target?.result as string;
                              setEditCigar({...editCigar,customPhoto:dataUrl});
                            };
                            reader.readAsDataURL(file);
                          }}/>
                      </label>
                    </div>
                    <div style={{position:"absolute",bottom:20,left:20,right:20}}>
                      <div style={{fontSize:10,color:T.goldMid,letterSpacing:4,
                        textTransform:"uppercase",fontFamily:"Georgia,serif",marginBottom:6}}>
                        {editCigar.strength||editCigar.origin||""}
                      </div>
                      <div style={{fontSize:26,fontWeight:"bold",color:"#ffffff",
                        fontFamily:"Georgia,serif",lineHeight:1.1,
                        textShadow:"0 2px 16px rgba(0,0,0,0.9)"}}>
                        {editCigar.brand}
                      </div>
                      <div style={{fontSize:20,color:T.goldLight,
                        fontFamily:"Georgia,serif",fontStyle:"italic",
                        textShadow:"0 2px 16px rgba(0,0,0,0.9)"}}>
                        {editCigar.line}
                      </div>
                      {editCigar.vitola&&<div style={{fontSize:13,color:"rgba(237,224,204,0.6)",
                        fontFamily:"Georgia,serif",marginTop:6}}>{editCigar.vitola}{editCigar.wrapper?` · ${editCigar.wrapper}`:""}</div>}
                    </div>
                  </div>

                  {/* Scrollable fields */}
                  <div style={{flex:1,overflowY:"auto",padding:"14px 20px"}}>
                    <input value={editCigar.brand||""} onChange={e=>setEditCigar({...editCigar,brand:e.target.value})}
                      placeholder="Brand" style={fi}/>
                    <input value={editCigar.line||""} onChange={e=>setEditCigar({...editCigar,line:e.target.value})}
                      placeholder="Line / Name" style={fi}/>
                    <input value={editCigar.vitola||""} onChange={e=>setEditCigar({...editCigar,vitola:e.target.value})}
                      placeholder="Vitola (e.g. Robusto)" style={fi}/>
                    <input value={editCigar.wrapper||""} onChange={e=>setEditCigar({...editCigar,wrapper:e.target.value})}
                      placeholder="Wrapper (e.g. Maduro)" style={fi}/>
                    <input value={editCigar.origin||""} onChange={e=>setEditCigar({...editCigar,origin:e.target.value})}
                      placeholder="Origin (e.g. Nicaragua)" style={fi}/>
                    <input value={editCigar.count||""} onChange={e=>setEditCigar({...editCigar,count:parseInt(e.target.value)||0})}
                      placeholder="Quantity" type="number" style={fi}/>

                    {/* ── TASTING NOTES ── */}
                    <div style={{marginTop:8,marginBottom:4,fontSize:10,color:T.textMuted,
                      letterSpacing:3,textTransform:"uppercase",fontFamily:"Georgia,serif"}}>
                      Tasting Notes
                    </div>
                    {/* Existing notes for this cigar */}
                    {(()=>{
                      let cigarNotes:any[]=[];
                      try{const s=localStorage.getItem("mh_notes");if(s)cigarNotes=JSON.parse(s);}catch{}
                      const matched=cigarNotes.filter((n:any)=>n.cigarId===editCigar.id);
                      if(matched.length===0) return(
                        <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",
                          fontStyle:"italic",padding:"8px 0 12px"}}>
                          No tasting notes yet for this cigar.
                        </div>
                      );
                      return matched.map((n:any)=>(
                        <div key={n.id} style={{background:"rgba(196,154,40,0.06)",borderRadius:10,
                          border:`1px solid rgba(196,154,40,0.12)`,padding:"12px 14px",marginBottom:8}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                            <div style={{display:"flex",gap:2}}>
                              {[1,2,3,4,5].map(i=>(
                                <span key={i} style={{fontSize:12,color:i<=(n.rating||0)?T.goldMid:"rgba(255,255,255,0.15)"}}>★</span>
                              ))}
                            </div>
                            <span style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif"}}>{n.date}</span>
                          </div>
                          {n.notes&&<div style={{fontSize:13,color:T.textSecondary,fontFamily:"Georgia,serif",
                            fontStyle:"italic",lineHeight:1.6}}>{n.notes}</div>}
                          {n.pairing&&<div style={{fontSize:11,color:T.goldMid,fontFamily:"Georgia,serif",
                            marginTop:6}}>🥃 {n.pairing}</div>}
                        </div>
                      ));
                    })()}
                    {/* Add note button */}
                    <button onClick={()=>setEditCigar({...editCigar,_addingNote:true})}
                      style={{width:"100%",padding:"11px",background:"transparent",
                        border:`1px dashed rgba(196,154,40,0.3)`,borderRadius:10,
                        color:T.goldMid,fontSize:12,cursor:"pointer",
                        fontFamily:"Georgia,serif",letterSpacing:1,marginBottom:4}}>
                      + Add Tasting Note
                    </button>
                    {editCigar._addingNote&&(
                      <div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,
                        border:`1px solid rgba(196,154,40,0.2)`,padding:"14px",marginBottom:8}}>
                        <textarea
                          placeholder="Describe the experience — flavors, draw, burn, finish..."
                          rows={3}
                          id="editCigarNoteText"
                          style={{width:"100%",background:"rgba(0,0,0,0.2)",border:`1px solid rgba(196,154,40,0.2)`,
                            borderRadius:8,padding:"10px 12px",color:T.textPrimary,fontSize:13,
                            outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif",
                            resize:"vertical",lineHeight:1.6,marginBottom:8}}/>
                        <input
                          placeholder="Pairing (e.g. Blanton's, espresso)"
                          id="editCigarNotePairing"
                          style={{width:"100%",background:"rgba(0,0,0,0.2)",border:`1px solid rgba(196,154,40,0.2)`,
                            borderRadius:8,padding:"9px 12px",color:T.textPrimary,fontSize:13,
                            outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif",marginBottom:8}}/>
                        <div style={{display:"flex",gap:3,marginBottom:10}}>
                          {[1,2,3,4,5].map(i=>(
                            <span key={i}
                              onClick={()=>setEditCigar({...editCigar,_addingNote:true,_noteRating:i})}
                              style={{fontSize:24,cursor:"pointer",
                                color:i<=(editCigar._noteRating||0)?T.goldMid:"rgba(255,255,255,0.15)"}}>★</span>
                          ))}
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>{
                            const noteEl=document.getElementById("editCigarNoteText") as HTMLTextAreaElement;
                            const pairingEl=document.getElementById("editCigarNotePairing") as HTMLInputElement;
                            const noteText=noteEl?.value||"";
                            const pairing=pairingEl?.value||"";
                            if(!noteText.trim()) return;
                            try{
                              const existing=JSON.parse(localStorage.getItem("mh_notes")||"[]");
                              const newNote={
                                id:Date.now(),
                                cigarId:editCigar.id,
                                brand:editCigar.brand,line:editCigar.line,vitola:editCigar.vitola,
                                date:new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),
                                rating:editCigar._noteRating||0,
                                notes:noteText,pairing
                              };
                              localStorage.setItem("mh_notes",JSON.stringify([newNote,...existing]));
                              setEditCigar({...editCigar,_addingNote:false,_noteRating:0});
                              // Sync to Supabase
                              if(userId){getToken().then(token=>{if(token)syncUpsertNote(token,userId,newNote);});}
                            }catch(e){console.error(e);}
                          }}
                            style={{flex:1,padding:"10px",background:"#111111",
                              border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,
                              color:"#3dd68c",fontSize:13,fontWeight:"bold",cursor:"pointer",
                              fontFamily:"Georgia,serif"}}>
                            Save Note
                          </button>
                          <button onClick={()=>setEditCigar({...editCigar,_addingNote:false,_noteRating:0})}
                            style={{padding:"10px 14px",background:"transparent",
                              border:`1px solid rgba(160,120,40,0.22)`,borderRadius:8,
                              color:T.textMuted,fontSize:13,cursor:"pointer"}}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Buttons — always visible at bottom of sheet */}
                  <div style={{flexShrink:0,
                    padding:"12px 20px calc(20px + env(safe-area-inset-bottom, 16px))",
                    borderTop:`1px solid rgba(196,154,40,0.1)`,
                    display:"flex",gap:10}}>
                    <button onClick={saveCigarEdit}
                      style={{flex:1,padding:"15px",
                        background:"#111111",
                        border:"1px solid rgba(255,255,255,0.08)",
                        borderRadius:10,color:"#ffffff",fontSize:15,
                        fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
                      Save
                    </button>
                    <button onClick={()=>{
                      if(window.confirm("Remove this cigar from your inventory?")){
                        const updated=humidorCigars.filter((c:any)=>c.id!==editCigar.id);
                        setHumidorCigars(updated);
                        try{localStorage.setItem('mh_cigars',JSON.stringify(updated));}catch{}
                        setEditCigar(null);
                      }
                    }}
                      style={{padding:"15px 16px",background:"#111111",
                        border:"1px solid rgba(255,255,255,0.08)",
                        borderRadius:10,color:"#e05050",fontSize:13,cursor:"pointer",
                        fontFamily:"Georgia,serif"}}>
                      Delete
                    </button>
                    <button onClick={()=>setEditCigar(null)}
                      style={{padding:"15px 16px",background:"transparent",
                        border:`1px solid rgba(160,120,40,0.22)`,
                        borderRadius:10,color:T.textMuted,fontSize:13,cursor:"pointer"}}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add cigar panel */}
            {addingToHumidor===h.id&&(
              <div style={{background:"#111111",borderRadius:12,
                border:`1px solid rgba(196,154,40,0.2)`,padding:"14px",marginTop:8}}>
                <div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif",
                  letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>
                  Search Catalog
                </div>
                <input value={invCatalogQuery}
                  onChange={e=>{
                    const val=e.target.value;
                    setInvCatalogQuery(val);
                    setInvCatalogResults([]);
                    if(val.trim().length<2){setInvCatalogSearching(false);return;}
                    setInvCatalogSearching(true);
                    fetch(`/api/cigar-search?q=${encodeURIComponent(val.trim())}`)
                      .then(r=>r.json())
                      .then(d=>setInvCatalogResults(d.results||[]))
                      .catch(()=>setInvCatalogResults([]))
                      .finally(()=>setInvCatalogSearching(false));
                  }}
                  placeholder="e.g. Padrón, Davidoff..."
                  autoFocus
                  style={{width:"100%",background:"rgba(0,0,0,0.3)",
                    border:`1px solid rgba(196,154,40,0.3)`,borderRadius:10,
                    padding:"11px 14px",color:T.textPrimary,fontSize:14,
                    outline:"none",boxSizing:"border-box" as const,fontFamily:"Georgia,serif",marginBottom:10}}/>
                {invCatalogSearching&&(
                  <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic",marginBottom:8}}>Searching…</div>
                )}
                {!invCatalogSearching&&invCatalogResults.length>0&&(
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
                    {invCatalogResults.map((r:any)=>(
                      <button key={r.id} onClick={()=>{
                        const newCigar={
                          id:Date.now(),
                          brand:r.brand||"",
                          line:r.line||"",
                          vitola:r.cigar_name||"",
                          origin:r.country||"",
                          wrapper:r.wrapper||"",
                          strength:r.strength||"",
                          count:1,
                          rating:90,
                          humidorId:h.id,
                          image_filename:r.image_filename||null,
                          purchaseDate:new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"}),
                          addedAt:new Date().toISOString(),
                          bandColor:"#2a1608"
                        };
                        const updated=[...humidorCigars,newCigar];
                        setHumidorCigars(updated);
                        try{localStorage.setItem('mh_cigars',JSON.stringify(updated));}catch{}
                        // Sync to Supabase
                        if(userId){getToken().then(token=>{
                          if(token){console.log("[sync] saving catalog cigar");syncUpsertCigar(token,userId,newCigar).then(()=>console.log("[sync] catalog cigar saved")).catch(e=>console.error("[sync] catalog cigar error:",e));}
                        });}
                        setAddingToHumidor(null);
                        setInvCatalogQuery("");
                        setInvCatalogResults([]);
                      }}
                      style={{textAlign:"left",background:"rgba(196,154,40,0.05)",
                        border:`1px solid rgba(196,154,40,0.12)`,borderRadius:10,
                        padding:"10px 12px",cursor:"pointer"}}>
                        <div style={{fontSize:14,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>{r.brand} {r.line}</div>
                        {r.cigar_name&&<div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif",marginTop:2}}>{r.cigar_name}</div>}
                        {r.strength&&<div style={{fontSize:11,color:T.goldMid,fontFamily:"Georgia,serif",marginTop:2}}>{r.strength}</div>}
                      </button>
                    ))}
                  </div>
                )}
                {!invCatalogSearching&&invCatalogQuery.trim().length>=2&&invCatalogResults.length===0&&(
                  <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic",marginBottom:10}}>No matches found.</div>
                )}
                <button onClick={()=>{setAddingToHumidor(null);setInvCatalogQuery("");setInvCatalogResults([]);}}
                  style={{width:"100%",padding:"10px",background:"transparent",
                    border:`1px solid rgba(196,154,40,0.15)`,borderRadius:10,
                    color:T.textMuted,fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif"}}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {detailTab==='history'&&(
          historyDrillCigar?(
            // ── CIGAR JOURNAL DRILL-DOWN ──────────────────────────────────
            <div style={{padding:"16px"}}>
              {/* Back header */}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,
                paddingBottom:14,borderBottom:`1px solid rgba(196,154,40,0.1)`}}>
                <button onClick={()=>{setHistoryDrillCigar(null);setHistoryAddingNote(false);setHistoryNoteForm({text:"",pairing:"",rating:0});}}
                  style={{background:"none",border:"none",cursor:"pointer",padding:"4px 8px 4px 0"}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke={T.goldMid} strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <div>
                  <div style={{fontSize:18,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>
                    {historyDrillCigar.line}
                  </div>
                  <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif"}}>
                    {historyDrillCigar.brand}{historyDrillCigar.vitola?` · ${historyDrillCigar.vitola}`:""}
                  </div>
                </div>
              </div>

              {/* Cigar stats */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
                {[
                  {label:"In Humidor",val:`${historyDrillCigar.count} left`},
                  {label:"Origin",val:historyDrillCigar.origin||"—"},
                  {label:"Wrapper",val:historyDrillCigar.wrapper||"—"},
                  {label:"Added",val:historyDrillCigar.purchaseDate||"—"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"#111111",borderRadius:10,
                    border:`1px solid rgba(196,154,40,0.1)`,padding:"10px 12px"}}>
                    <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,
                      textTransform:"uppercase",fontFamily:"Georgia,serif",marginBottom:4}}>{s.label}</div>
                    <div style={{fontSize:13,color:T.textPrimary,fontFamily:"Georgia,serif"}}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Journal header */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:9,color:T.textMuted,letterSpacing:2.5,
                  textTransform:"uppercase",fontFamily:"Georgia,serif"}}>Tasting Journal</div>
                <button onClick={()=>{setHistoryAddingNote(true);setHistoryNoteForm({text:"",pairing:"",rating:0,photo:""});}}
                  style={{background:"transparent",border:`1px solid rgba(196,154,40,0.3)`,
                    borderRadius:16,padding:"5px 12px",color:T.goldMid,fontSize:11,
                    cursor:"pointer",fontFamily:"Georgia,serif"}}>
                  + Add Note
                </button>
              </div>

              {/* Add note form */}
              {historyAddingNote&&(
                <div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,
                  border:`1px solid rgba(196,154,40,0.2)`,padding:"14px",marginBottom:14}}>
                  <textarea value={historyNoteForm.text}
                    onChange={e=>setHistoryNoteForm(f=>({...f,text:e.target.value}))}
                    placeholder="Describe the experience — flavors, draw, burn, finish..."
                    rows={4}
                    style={{width:"100%",background:"rgba(0,0,0,0.2)",
                      border:`1px solid rgba(196,154,40,0.2)`,borderRadius:8,
                      padding:"10px 12px",color:T.textPrimary,fontSize:13,
                      outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif",
                      resize:"vertical",lineHeight:1.6,marginBottom:8}}/>
                  <input value={historyNoteForm.pairing}
                    onChange={e=>setHistoryNoteForm(f=>({...f,pairing:e.target.value}))}
                    placeholder="Pairing (e.g. Blanton's, espresso)"
                    style={{width:"100%",background:"rgba(0,0,0,0.2)",
                      border:`1px solid rgba(196,154,40,0.2)`,borderRadius:8,
                      padding:"9px 12px",color:T.textPrimary,fontSize:13,
                      outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif",marginBottom:10}}/>
                  {/* Star rating */}
                  <div style={{display:"flex",gap:4,marginBottom:12}}>
                    {[1,2,3,4,5].map(i=>(
                      <span key={i}
                        onClick={()=>setHistoryNoteForm(f=>({...f,rating:i}))}
                        style={{fontSize:26,cursor:"pointer",
                          color:i<=historyNoteForm.rating?T.goldMid:"rgba(255,255,255,0.15)"}}>★</span>
                    ))}
                  </div>
                  {/* Photo buttons */}
                  <div style={{display:"flex",gap:8,marginBottom:12}}>
                    <label style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                      padding:"9px",background:"rgba(0,0,0,0.2)",
                      border:`1px solid rgba(196,154,40,0.2)`,borderRadius:8,cursor:"pointer"}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <span style={{fontSize:12,color:T.goldMid,fontFamily:"Georgia,serif"}}>Camera</span>
                      <input type="file" accept="image/*" capture="environment" style={{display:"none"}}
                        onChange={e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>{setHistoryNoteForm(nf=>({...nf,photo:ev.target?.result as string}));};r.readAsDataURL(f);}}/>
                    </label>
                    <label style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                      padding:"9px",background:"rgba(0,0,0,0.2)",
                      border:`1px solid rgba(196,154,40,0.2)`,borderRadius:8,cursor:"pointer"}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span style={{fontSize:12,color:T.goldMid,fontFamily:"Georgia,serif"}}>Library</span>
                      <input type="file" accept="image/*" style={{display:"none"}}
                        onChange={e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>{setHistoryNoteForm(nf=>({...nf,photo:ev.target?.result as string}));};r.readAsDataURL(f);}}/>
                    </label>
                  </div>
                  {/* Photo preview */}
                  {historyNoteForm.photo&&(
                    <div style={{position:"relative",marginBottom:10}}>
                      <img src={historyNoteForm.photo} style={{width:"100%",borderRadius:8,maxHeight:160,objectFit:"cover"}}/>
                      <button onClick={()=>setHistoryNoteForm(f=>({...f,photo:""}))}
                        style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,0.7)",
                          border:"none",borderRadius:"50%",width:24,height:24,cursor:"pointer",
                          color:"#fff",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                    </div>
                  )}
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={async()=>{
                      if(!historyNoteForm.text.trim()) return;
                      // Compress photo before saving to avoid quota errors
                      let photo:string|null=null;
                      if(historyNoteForm.photo){
                        try{
                          photo=await new Promise<string>(res=>{
                            const img=new Image();
                            img.onload=()=>{
                              const scale=Math.min(1,300/img.width);
                              const c=document.createElement('canvas');
                              c.width=img.width*scale;c.height=img.height*scale;
                              const ctx=c.getContext('2d');
                              if(!ctx){res("");return;}
                              ctx.drawImage(img,0,0,c.width,c.height);
                              res(c.toDataURL('image/jpeg',0.5));
                            };
                            img.onerror=()=>res("");
                            img.src=historyNoteForm.photo;
                          });
                        }catch{photo=null;}
                      }
                      try{
                        const existing=JSON.parse(localStorage.getItem("mh_notes")||"[]");
                        const newNote={
                          id:Date.now(),
                          cigarId:historyDrillCigar.id,
                          brand:historyDrillCigar.brand,
                          line:historyDrillCigar.line,
                          vitola:historyDrillCigar.vitola||"",
                          date:new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),
                          rating:historyNoteForm.rating,
                          notes:historyNoteForm.text,
                          pairing:historyNoteForm.pairing,
                          photo:photo||null
                        };
                        try{
                          localStorage.setItem("mh_notes",JSON.stringify([newNote,...existing]));
                          // Sync to Supabase
                          if(userId){getToken().then(token=>{if(token)syncUpsertNote(token,userId,newNote);});}
                        }catch{
                          // If still too large, save without photo
                          localStorage.setItem("mh_notes",JSON.stringify([{...newNote,photo:null},...existing]));
                        }
                        setHistoryNoteRefresh(n=>n+1);
                      }catch(e){console.error(e);}
                      setHistoryAddingNote(false);
                      setHistoryNoteForm({text:"",pairing:"",rating:0,photo:""});
                    }}
                      style={{flex:1,padding:"11px",background:"#111111",
                        border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,
                        color:"#3dd68c",fontSize:14,fontWeight:"bold",
                        cursor:"pointer",fontFamily:"Georgia,serif"}}>
                      Save Note
                    </button>
                    <button onClick={()=>{setHistoryAddingNote(false);setHistoryNoteForm({text:"",pairing:"",rating:0,photo:""});}}
                      style={{padding:"11px 16px",background:"transparent",
                        border:`1px solid rgba(160,120,40,0.22)`,borderRadius:8,
                        color:T.textMuted,fontSize:13,cursor:"pointer"}}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Existing notes */}
              {(()=>{
                let cigarNotes:any[]=[];
                try{const s=localStorage.getItem("mh_notes");if(s)cigarNotes=JSON.parse(s).filter((n:any)=>n.cigarId===historyDrillCigar.id);}catch{}
                void historyNoteRefresh;
                if(cigarNotes.length===0) return(
                  <div style={{textAlign:"center",padding:"32px 20px",
                    color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:13}}>
                    No notes yet — tap "+ Add Note" to write your first entry.
                  </div>
                );
                return(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {cigarNotes.map((n:any)=>(
                      <div key={n.id} style={{background:"#111111",borderRadius:12,
                        border:`1px solid rgba(196,154,40,0.12)`,overflow:"hidden"}}>
                        {/* Photo hero — shown at top if present */}
                        {n.photo&&(
                          <div style={{width:"100%",height:180,background:"#000",overflow:"hidden"}}>
                            <img src={n.photo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          </div>
                        )}
                        <div style={{padding:"14px 16px"}}>
                          {/* Stars + date */}
                          <div style={{display:"flex",justifyContent:"space-between",
                            alignItems:"center",marginBottom:8}}>
                            <div style={{display:"flex",gap:2}}>
                              {[1,2,3,4,5].map(i=>(
                                <span key={i} style={{fontSize:13,
                                  color:i<=(n.rating||0)?T.goldMid:"rgba(255,255,255,0.15)"}}>★</span>
                              ))}
                            </div>
                            <span style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif"}}>{n.date}</span>
                          </div>
                          {/* Note text */}
                          {n.notes&&(
                            <div style={{fontSize:14,color:T.textSecondary,fontFamily:"Georgia,serif",
                              fontStyle:"italic",lineHeight:1.7,marginBottom:n.pairing?10:0}}>
                              "{n.notes}"
                            </div>
                          )}
                          {/* Pairing */}
                          {n.pairing&&(
                            <div style={{display:"flex",alignItems:"center",gap:6,
                              padding:"6px 10px",background:"rgba(196,154,40,0.06)",
                              borderRadius:8,border:`1px solid rgba(196,154,40,0.12)`}}>
                              <span style={{fontSize:13}}>🥃</span>
                              <span style={{fontSize:12,color:T.goldMid,fontFamily:"Georgia,serif"}}>
                                {n.pairing}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          ):(
          // ── HISTORY LIST ───────────────────────────────────────────────
          <div style={{padding:"16px"}}>
            <div style={{fontSize:9,color:T.textMuted,letterSpacing:2.5,
              textTransform:"uppercase",fontFamily:"Georgia,serif",marginBottom:14}}>
              Recent Activity
            </div>
            {hCigars.length===0?(
              <div style={{textAlign:"center",padding:"40px 20px",
                color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>
                No activity yet — add cigars to get started
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {hCigars.slice(0,10).map((c:any,i:number)=>{
                  let noteCount=0;
                  try{const s=localStorage.getItem("mh_notes");if(s)noteCount=JSON.parse(s).filter((n:any)=>n.cigarId===c.id).length;}catch{}
                  return(
                  <div key={c.id} style={{display:"flex",gap:14,paddingBottom:16,position:"relative"}}>
                    {/* Timeline line */}
                    {i<hCigars.length-1&&i<9&&(
                      <div style={{position:"absolute",left:11,top:24,bottom:0,width:1,
                        background:"rgba(196,154,40,0.15)"}}/>
                    )}
                    {/* Dot */}
                    <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,
                      background:"rgba(196,154,40,0.1)",
                      border:`1px solid rgba(196,154,40,0.3)`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      marginTop:2}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:T.goldMid}}/>
                    </div>
                    {/* Content — tappable */}
                    <div onClick={()=>{setHistoryDrillCigar(c);setHistoryAddingNote(false);}}
                      style={{flex:1,background:"#111111",borderRadius:10,
                        border:`1px solid rgba(196,154,40,0.1)`,padding:"10px 12px",
                        cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:15,fontWeight:"bold",color:T.textPrimary,
                          fontFamily:"Georgia,serif",marginBottom:2}}>{c.line}</div>
                        <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",
                          fontStyle:"italic"}}>{c.brand} · {c.count} remaining</div>
                        {noteCount>0&&(
                          <div style={{fontSize:10,color:T.goldMid,fontFamily:"Georgia,serif",marginTop:4}}>
                            {noteCount} tasting note{noteCount>1?"s":""}
                          </div>
                        )}
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(196,154,40,0.4)" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
          )
        )}

        {/* ── INSIGHTS TAB ── */}
        {detailTab==='insights'&&(
          <div style={{padding:"16px"}}>
            {/* Mario header */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,
              background:"#111111",borderRadius:12,
              border:`1px solid rgba(196,154,40,0.15)`,padding:"14px"}}>
              <div style={{width:44,height:44,borderRadius:"50%",overflow:"hidden",flexShrink:0,
                border:`2px solid ${T.goldMid}`}}>
                <img src="/mario-avatar.jpg" alt="Mario"
                  style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 65%"}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:T.goldMid,letterSpacing:2,
                  textTransform:"uppercase",fontFamily:"Georgia,serif",marginBottom:4}}>Mario</div>
                <div style={{fontSize:15,color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1.5}}>
                  {insightsLoading?"Analyzing your humidor...":"Mario has analyzed your humidor and found these insights."}
                </div>
              </div>
              <button onClick={()=>{
                setAiInsights(null);
                setInsightsHumidorId(null);
                setInsightsLoading(true);
                const live=getLive(h.name);
                const hum=live?.humidity;
                const temp=live?.temperature;
                const brands=[...new Set(hCigars.map((c:any)=>c.brand).filter(Boolean))].join(", ")||"none";
                const humAlert=hum&&(hum<65||hum>72)?" (OUT OF RANGE - ideal 65-70%RH)":"";
                const tempAlert=temp&&(temp>70||temp<60)?" (OUT OF RANGE - ideal 60-70F)":"";
                const prompt=`You are Mario, a private cigar concierge. Analyze this humidor and respond ONLY with valid JSON, no markdown, no backticks: {"aging":"...","environment":"...","collection":"..."}. Each value must be 1-2 sentences of real, specific insight. Humidor: ${h.name}. Cigars: ${hCigars.length} total. Brands: ${brands}. Sensor: ${hum?`${hum.toFixed(0)}%RH${humAlert}, ${temp?.toFixed(1)}F${tempAlert}`:"no sensor connected"}. Flag any out-of-range conditions prominently.`;
                fetch("/api/chat-json",{method:"POST",headers:{"Content-Type":"application/json"},
                  body:JSON.stringify({system:"You are a JSON-only API. Respond only with valid JSON. No markdown, no backticks, no explanation.",
                    messages:[{role:"user",content:prompt}]})})
                  .then(r=>r.json())
                  .then(d=>{
                    const text=d.content?.find((b:{type:string;text?:string})=>b.type==="text")?.text||"{}";
                    try{
                      const parsed=JSON.parse(text.trim());
                      setAiInsights(parsed);
                      setInsightsHumidorId(h.id);
                    }catch{
                      setAiInsights({aging:"Unable to parse insight.",environment:"Unable to parse insight.",collection:"Unable to parse insight."});
                    }
                  })
                  .catch(()=>setAiInsights({aging:"Connection error.",environment:"Connection error.",collection:"Connection error."}))
                  .finally(()=>setInsightsLoading(false));
              }}
                style={{flexShrink:0,background:"none",border:`1px solid rgba(196,154,40,0.3)`,
                  borderRadius:8,padding:"6px 12px",cursor:"pointer",
                  color:T.goldMid,fontSize:11,fontFamily:"Georgia,serif",letterSpacing:1}}>
                {insightsLoading?"...":"Refresh"}
              </button>
            </div>

            {/* Insight cards */}
            {[
              {icon:"leaf",title:"Aging Insight",
                text:(aiInsights&&insightsHumidorId===h.id)?aiInsights.aging
                  :hCigars.length>0?`You have ${hCigars.length} cigars stored. Tap Refresh for Mario's analysis.`
                  :"Add cigars to this humidor to receive aging insights.",
                prompt:`What should I know about aging the cigars in my ${h.name}?`},
              {icon:"drop",title:"Environment Insight",
                text:(aiInsights&&insightsHumidorId===h.id)?aiInsights.environment
                  :hasReading
                  ?calcStatus==="Optimal"?`Your ${h.name} is at optimal conditions. Tap Refresh for Mario's read.`
                    :"Conditions could be improved. Tap Refresh for Mario's advice."
                  :"Connect a sensor to receive environment insights.",
                prompt:`How are the conditions in my ${h.name} affecting my cigars?`},
              {icon:"box",title:"Collection Insight",
                text:(aiInsights&&insightsHumidorId===h.id)?aiInsights.collection
                  :hCigars.length===0?"This humidor is empty. Add cigars to get collection insights."
                  :`${hCigars.length} cigars stored. Tap Refresh for Mario's collection read.`,
                prompt:`Give me insights about the collection in my ${h.name}.`},
            ].map((ins,i)=>(
              <div key={i} style={{background:"#111111",borderRadius:12,
                border:`1px solid rgba(196,154,40,0.12)`,padding:"14px",marginBottom:12,
                display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{width:40,height:40,borderRadius:10,flexShrink:0,
                  background:"rgba(196,154,40,0.08)",
                  border:`1px solid rgba(196,154,40,0.15)`,
                  display:"flex",alignItems:"center",justifyContent:"center"}}><SvgIcon id={ins.icon} size={20}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:"bold",color:T.textPrimary,
                    fontFamily:"Georgia,serif",marginBottom:4}}>{ins.title}</div>
                  <div style={{fontSize:13,color:insightsLoading?T.textMuted:T.textSecondary,fontFamily:"Georgia,serif",
                    lineHeight:1.5,marginBottom:10,fontStyle:insightsLoading?"italic":"normal"}}>
                    {insightsLoading?"Analyzing...":ins.text}
                  </div>
                  <button onClick={()=>setHumidorMarioPrompt(ins.prompt)}
                    style={{background:"none",border:`1px solid rgba(196,154,40,0.3)`,
                    borderRadius:8,padding:"6px 14px",cursor:"pointer",
                    color:T.goldMid,fontSize:12,fontFamily:"Georgia,serif"}}>
                    Ask Mario
                  </button>
                </div>
              </div>
            ))}

            {/* Want to dive deeper */}
            <div onClick={()=>setHumidorMarioPrompt("Tell me about my cigar journey and what I should focus on next.")}
              style={{background:"rgba(196,154,40,0.04)",borderRadius:12,
              border:`1px solid rgba(196,154,40,0.18)`,padding:"14px",
              display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
              <div style={{width:44,height:44,borderRadius:"50%",overflow:"hidden",flexShrink:0,
                border:`1.5px solid ${T.goldDark}`}}>
                <img src="/mario-avatar.jpg" alt="Mario"
                  style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 65%"}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:"bold",color:T.textPrimary,
                  fontFamily:"Georgia,serif",marginBottom:2}}>Want to dive deeper?</div>
                <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif"}}>
                  Ask me anything about your humidor or collection.
                </div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={T.goldMid} strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        )}

        {/* Mario Modal for Insights */}
        {humidorMarioPrompt!==null&&(
          <MarioModal
            initialPrompt={humidorMarioPrompt}
            onClose={()=>setHumidorMarioPrompt(null)}
            liveData={liveData||{}}
            lang="en"/>
        )}

        {/* Edit Humidor Modal (reused) */}
        {editHumidor&&editHumidor.id===h.id&&(
          <div style={{position:"fixed",inset:0,zIndex:100,
            background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"flex-end"}}
            onClick={()=>setEditHumidor(null)}>
            <div style={{width:"100%",maxWidth:480,margin:"0 auto",
              background:"#111111",borderRadius:"20px 20px 0 0",
              border:`1px solid rgba(196,154,40,0.25)`,
              padding:"24px 20px",
              paddingBottom:"calc(100px + env(safe-area-inset-bottom, 0px))"}}
              onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:11,color:T.goldMid,fontFamily:"Georgia,serif",letterSpacing:2,
                textTransform:"uppercase",marginBottom:16}}>Edit Humidor</div>
              <input value={editHumidor.name}
                onChange={e=>setEditHumidor({...editHumidor,name:e.target.value})}
                placeholder="Humidor name" style={fi}/>
              <input value={editHumidor.wood}
                onChange={e=>setEditHumidor({...editHumidor,wood:e.target.value})}
                placeholder="Wood type" style={fi}/>
              <input value={String(editHumidor.capacity)}
                onChange={e=>setEditHumidor({...editHumidor,capacity:parseInt(e.target.value)||150})}
                placeholder="Capacity" type="number" style={fi}/>
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button onClick={saveEditHumidor} style={{flex:1,padding:"14px",
                  background:"#111111",
                  border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:10,color:"#ffffff",fontSize:15,
                  fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>Save</button>
                <button onClick={()=>setEditHumidor(null)} style={{padding:"14px 20px",
                  background:"transparent",border:`1px solid rgba(160,120,40,0.22)`,
                  borderRadius:10,color:T.textMuted,fontSize:15,cursor:"pointer"}}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{paddingBottom:100}}>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div style={{padding:"20px 16px 14px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:22,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>
            My Humidors
          </div>
          <button onClick={onRefresh} style={{background:"none",border:"none",cursor:"pointer",padding:4}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:6,height:6,borderRadius:"50%",
                background:connected?"#3dd68c":liveStatus==="loading"?T.goldMid:T.textMuted,
                boxShadow:connected?"0 0 6px #3dd68c88":"none"}}/>
              <span style={{fontSize:10,color:connected?"#3dd68c":T.textMuted,
                fontFamily:"Georgia,serif",letterSpacing:0.5}}>
                {connected?`Live · ${lastUpdated}`:liveStatus==="loading"?"Updating…":"Sensor Offline"}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ── COLLECTION OVERVIEW ─────────────────────────────────────────── */}
      {mounted&&(
        <div style={{padding:"14px 16px 0"}}>

          {/* Stats row */}
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <div style={{flex:1,background:"linear-gradient(160deg,#111111,#0a0a0a)",
              border:`1px solid rgba(196,154,40,0.18)`,borderRadius:12,padding:"12px 10px",
              textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:"bold",color:T.textPrimary,
                fontFamily:"Georgia,serif",lineHeight:1}}>{totalCigars}</div>
              <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",
                fontFamily:"Georgia,serif",marginTop:4}}>Cigars</div>
            </div>
            <div style={{flex:1,background:"linear-gradient(160deg,#111111,#0a0a0a)",
              border:`1px solid rgba(196,154,40,0.18)`,borderRadius:12,padding:"12px 10px",
              textAlign:"center"}}>
              <div style={{fontSize:24,fontWeight:"bold",color:T.textPrimary,
                fontFamily:"Georgia,serif",lineHeight:1}}>{humidors.length}</div>
              <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",
                fontFamily:"Georgia,serif",marginTop:4}}>Humidors</div>
            </div>
            <div style={{flex:1,background:"linear-gradient(160deg,#111111,#0a0a0a)",
              border:`1px solid rgba(196,154,40,0.18)`,borderRadius:12,padding:"12px 10px",
              textAlign:"center"}}>
              <div style={{fontSize:15,fontWeight:"bold",color:healthColor,
                fontFamily:"Georgia,serif",lineHeight:1.2}}>{healthLabel}</div>
              <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",
                fontFamily:"Georgia,serif",marginTop:4}}>Health</div>
            </div>
          </div>

          {/* Mario Summary Card */}
          <div style={{background:"rgba(15,15,15,0.8)",borderRadius:12,
            border:`1px solid rgba(196,154,40,0.2)`,
            padding:"12px 14px",marginBottom:4,
            display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:32,height:32,borderRadius:"50%",overflow:"hidden",flexShrink:0,
              border:`1.5px solid ${T.goldDark}`}}>
              <img src="/mario-avatar.jpg" alt="Mario"
                style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 65%"}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:T.goldMid,letterSpacing:2,textTransform:"uppercase",
                fontFamily:"Georgia,serif",marginBottom:4}}>Mario</div>
              <div style={{fontSize:15,color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1.45}}>
                {!mounted?"Loading collection…"
                  :humidors.length===0?"Add your first humidor to get started."
                  :hasWarning?"One of your humidors needs attention — check conditions below."
                  :totalCigars===0?"Your humidors are set up. Add cigars to get started."
                  :"Your collection looks great. All humidors are stable."}
              </div>
            </div>
            <span style={{color:T.goldMid,fontSize:20,flexShrink:0}}>›</span>
          </div>
        </div>
      )}

      {/* ── HUMIDOR CARDS ───────────────────────────────────────────────── */}
      <div style={{padding:"14px 16px 0",display:"flex",flexDirection:"column",gap:14}}>
        {(!mounted||humidors.length===0)&&!showForm&&(
          <div style={{textAlign:"center",padding:"40px 20px",color:T.textMuted,
            fontFamily:"Georgia,serif",fontStyle:"italic"}}>
            {mounted?"No humidors yet — add your first one below":"Loading…"}
          </div>
        )}

        {mounted&&humidors.map((h,humIdx)=>{
          const live=getLive(h.name);
          const humidity=live?.humidity??null;
          const temp=live?.temperature??null;
          const humOk=humidity!==null&&humidity>=65&&humidity<=72;
          const tempOk=temp!==null&&temp>=65&&temp<=70;
          const hasReading=humidity!==null||temp!==null;
          const calcStatus=!hasReading?"No Sensor":humOk&&tempOk?"Optimal":humOk||tempOk?"Good":"Warning";
          const statusColor=calcStatus==="Optimal"?"#3dd68c":calcStatus==="Good"?T.goldMid:calcStatus==="No Sensor"?T.textMuted:"#e05050";
          const hCigarsCount=humidorCigars.filter((c:any)=>c.humidorId===h.id).length;

          return (
            <div key={h.id} onClick={()=>{setDetailHumidor(h.id);setDetailTab('overview');}}
              style={{background:"#111111",cursor:"pointer",
                borderRadius:16,border:`1px solid rgba(196,154,40,0.2)`,overflow:"hidden",
                boxShadow:"0 6px 20px rgba(0,0,0,0.6)"}}>

              {/* ── CARD: photo left, info right ── */}
              <div style={{display:"flex",alignItems:"stretch",minHeight:150}}>

                {/* LEFT — humidor photo */}
                <div style={{width:130,flexShrink:0,position:"relative",overflow:"hidden",
                  background:"#000"}}>
                  <img src={h.photo||"/humidor-hero.png"} alt={h.name}
                    style={{width:"100%",height:"100%",objectFit:"cover",
                      objectPosition:"center",display:"block",
                      filter:"brightness(0.8) saturate(1.1)"}}
                    onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                  {/* Right fade into card */}
                  <div style={{position:"absolute",top:0,right:0,bottom:0,width:28,
                    background:"linear-gradient(90deg,rgba(0,0,0,0),rgba(17,17,17,0.95))"}}/>
                  {/* Photo upload */}
                  <label style={{position:"absolute",bottom:8,left:8,cursor:"pointer",
                    background:"rgba(0,0,0,0.7)",border:`1px solid rgba(196,154,40,0.3)`,
                    borderRadius:6,padding:"4px 8px",display:"flex",alignItems:"center",gap:4}}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke={T.goldMid} strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span style={{fontSize:9,color:T.goldMid,fontFamily:"Georgia,serif"}}>Photo</span>
                    <input type="file" accept="image/*" style={{display:"none"}}
                      onChange={e=>handlePhotoUpload(h.id,e)}/>
                  </label>
                </div>

                {/* RIGHT — name, status, readings, cigar count */}
                <div style={{flex:1,padding:"14px 14px 14px 12px",display:"flex",
                  flexDirection:"column",justifyContent:"space-between"}}>

                  {/* Top: name + ⋯ */}
                  <div style={{display:"flex",alignItems:"flex-start",
                    justifyContent:"space-between",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:18,fontWeight:"bold",color:T.textPrimary,
                        fontFamily:"Georgia,serif",lineHeight:1.1,marginBottom:5}}>{h.name}</div>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{width:7,height:7,borderRadius:"50%",background:statusColor,
                          boxShadow:hasReading?`0 0 6px ${statusColor}88`:"none",flexShrink:0}}/>
                        <span style={{fontSize:12,color:statusColor,fontFamily:"Georgia,serif"}}>
                          {calcStatus}
                        </span>
                      </div>
                    </div>
                    <div style={{position:"relative"}}>
                      <button onClick={e=>{e.stopPropagation();setMenuOpen(menuOpen===h.id?null:h.id);}}
                        style={{background:"rgba(196,154,40,0.08)",
                          border:`1px solid rgba(196,154,40,0.2)`,
                          borderRadius:8,padding:"4px 10px",cursor:"pointer",
                          color:T.goldMid,fontSize:15,lineHeight:1}}>⋯</button>
                      {menuOpen===h.id&&(
                        <div style={{position:"absolute",top:"100%",right:0,marginTop:4,
                          background:"#1a1a1a",border:`1px solid rgba(196,154,40,0.25)`,
                          borderRadius:10,overflow:"hidden",zIndex:50,minWidth:130,
                          boxShadow:"0 8px 24px rgba(0,0,0,0.8)"}}>
                          <button onClick={()=>{setEditHumidor({...h});setMenuOpen(null);}}
                            style={{width:"100%",padding:"11px 14px",background:"none",border:"none",
                              cursor:"pointer",color:T.textPrimary,fontSize:15,fontFamily:"Georgia,serif",
                              textAlign:"left",borderBottom:`1px solid rgba(196,154,40,0.1)`}}>
                            ✏️ Edit
                          </button>
                          <button onClick={()=>deleteHumidor(h.id)}
                            style={{width:"100%",padding:"11px 14px",background:"none",border:"none",
                              cursor:"pointer",color:"#e05050",fontSize:15,fontFamily:"Georgia,serif",
                              textAlign:"left"}}>
                            🗑 Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle: RH + Temp */}
                  <div style={{marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#3dd68c" opacity="0.85">
                        <path d="M12 2C6 10 4 14 4 17a8 8 0 0 0 16 0c0-3-2-7-8-15z"/>
                      </svg>
                      <span style={{fontSize:20,fontWeight:"bold",color:"#ffffff",
                        fontFamily:"Georgia,serif",lineHeight:1}}>
                        {hasReading&&humidity!==null?`${humidity}%`:"—"}
                      </span>
                      <span style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",
                        letterSpacing:1,textTransform:"uppercase",alignSelf:"flex-end",marginBottom:2}}>
                        RH
                      </span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <svg width="10" height="12" viewBox="0 0 24 24" fill="none"
                        stroke={T.goldMid} strokeWidth="2" opacity="0.85">
                        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                      </svg>
                      <span style={{fontSize:20,fontWeight:"bold",color:"#ffffff",
                        fontFamily:"Georgia,serif",lineHeight:1}}>
                        {hasReading&&temp!==null?`${temp}°F`:"—"}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: cigar count tap to expand */}
                  <button onClick={()=>setExpandedCigars(expandedCigars===h.id?null:h.id)}
                    style={{display:"flex",alignItems:"center",gap:6,
                      background:"none",border:"none",cursor:"pointer",padding:0}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke={T.goldMid} strokeWidth="1.8" opacity="0.7">
                      <line x1="8" y1="6" x2="21" y2="6"/>
                      <line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/>
                      <line x1="3" y1="12" x2="3.01" y2="12"/>
                      <line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                    <span style={{fontSize:15,color:T.textSecondary,fontFamily:"Georgia,serif"}}>
                      {hCigarsCount} Cigars
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={T.goldMid} strokeWidth="2" style={{marginLeft:"auto"}}>
                      <polyline points={expandedCigars===h.id?"18 15 12 9 6 15":"9 18 15 12 9 6"}/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* ── EXPANDABLE CIGAR LIST ── */}
              {(()=>{
                let hCigars:any[]=[];
                try{hCigars=humidorCigars.filter((c:any)=>c.humidorId===h.id);}catch{}
                const isExpanded=expandedCigars===h.id;
                return (
                  <div style={{padding:"0 14px"}}>
                    <div style={{marginBottom:isExpanded?14:0}}>
                      {isExpanded&&(
                        <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>
                          {hCigars.length===0?(
                            <div style={{textAlign:"center",padding:"16px",
                              color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:12}}>
                              No cigars assigned to this humidor yet
                            </div>
                          ):hCigars.map((c:any)=>(
                            <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,
                              background:"rgba(0,0,0,0.3)",borderRadius:10,overflow:"hidden",
                              border:`1px solid rgba(196,154,40,0.1)`}}>
                              <div style={{width:44,height:44,flexShrink:0,background:"#000"}}>
                                <img src={(c.customPhoto||c.imageUri)?(c.customPhoto||c.imageUri):getCigarImage(c.vitola,c.wrapper,c.image_filename)} alt={c.line}
                                  style={{width:"100%",height:"100%",objectFit:"cover"}}
                                  onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                              </div>
                              <div style={{flex:1,padding:"6px 0"}}>
                                <div style={{fontSize:12,fontWeight:"bold",color:T.textPrimary,
                                  fontFamily:"Georgia,serif"}}>{c.line}</div>
                                <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",
                                  fontStyle:"italic"}}>{c.brand} · {c.vitola}</div>
                              </div>
                              <div style={{padding:"0 8px",textAlign:"center",display:"flex",
                                flexDirection:"column",alignItems:"center",gap:4}}>
                                <div style={{fontSize:16,fontWeight:"bold",color:T.goldMid,
                                  fontFamily:"Georgia,serif"}}>{c.count}</div>
                                <div style={{fontSize:8,color:T.textMuted,letterSpacing:1,
                                  textTransform:"uppercase"}}>Left</div>
                                <button onClick={()=>removeCigarFromHumidor(c.id)}
                                  style={{background:"rgba(224,80,80,0.1)",border:"1px solid rgba(224,80,80,0.25)",
                                    borderRadius:6,padding:"2px 6px",cursor:"pointer",
                                    color:"#e05050",fontSize:9,fontFamily:"Georgia,serif"}}>
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Add Cigar button */}
                          {addingToHumidor===h.id?(
                            <div style={{background:"rgba(0,0,0,0.3)",borderRadius:10,
                              border:`1px solid rgba(196,154,40,0.15)`,padding:"10px"}}>
                              <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",
                                letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>
                                Select a cigar to add
                              </div>
                              {humidorCigars.filter((c:any)=>!c.humidorId||c.humidorId===null).length===0?(
                                <div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif",
                                  fontStyle:"italic",textAlign:"center",padding:"8px"}}>
                                  All cigars are already assigned to a humidor
                                </div>
                              ):humidorCigars.filter((c:any)=>!c.humidorId||c.humidorId===null).map((c:any)=>(
                                <button key={c.id} onClick={()=>addCigarToHumidor(c.id,h.id)}
                                  style={{width:"100%",display:"flex",alignItems:"center",gap:10,
                                    background:"rgba(196,154,40,0.06)",borderRadius:8,
                                    border:`1px solid rgba(196,154,40,0.1)`,
                                    padding:"8px 10px",marginBottom:6,cursor:"pointer"}}>
                                  <div style={{width:36,height:36,flexShrink:0,background:"#000",borderRadius:6,overflow:"hidden"}}>
                                    <img src={(c.customPhoto||c.imageUri)?(c.customPhoto||c.imageUri):getCigarImage(c.vitola,c.wrapper,c.image_filename)} alt={c.line}
                                      style={{width:"100%",height:"100%",objectFit:"cover"}}
                                      onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                                  </div>
                                  <div style={{flex:1,textAlign:"left"}}>
                                    <div style={{fontSize:12,fontWeight:"bold",color:T.textPrimary,
                                      fontFamily:"Georgia,serif"}}>{c.line}</div>
                                    <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",
                                      fontStyle:"italic"}}>{c.brand} · {c.count} left</div>
                                  </div>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke={T.goldMid} strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19"/>
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                  </svg>
                                </button>
                              ))}
                              <button onClick={()=>setAddingToHumidor(null)}
                                style={{width:"100%",padding:"8px",background:"transparent",
                                  border:`1px solid rgba(196,154,40,0.15)`,borderRadius:8,
                                  color:T.textMuted,fontSize:11,cursor:"pointer",fontFamily:"Georgia,serif"}}>
                                Cancel
                              </button>
                            </div>
                          ):(
                            <button onClick={()=>setAddingToHumidor(h.id)}
                              style={{width:"100%",padding:"10px",background:"transparent",
                                border:`1px dashed rgba(196,154,40,0.25)`,borderRadius:10,
                                color:T.goldMid,fontSize:11,cursor:"pointer",
                                fontFamily:"Georgia,serif",letterSpacing:1}}>
                              + Add Cigar to this Humidor
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}

        {/* Edit Humidor Modal */}
        {editHumidor&&(
          <div style={{background:"linear-gradient(170deg,#111111,#0a0a0a)",borderRadius:16,
            border:`1px solid rgba(196,154,40,0.3)`,padding:"20px"}}>
            <div style={{fontSize:12,color:T.goldMid,fontFamily:"Georgia,serif",letterSpacing:2,
              textTransform:"uppercase",marginBottom:16}}>Edit Humidor</div>
            <input value={editHumidor.name}
              onChange={e=>setEditHumidor({...editHumidor,name:e.target.value})}
              placeholder="Humidor name" style={fi}/>
            <input value={editHumidor.wood}
              onChange={e=>setEditHumidor({...editHumidor,wood:e.target.value})}
              placeholder="Wood type" style={fi}/>
            <input value={String(editHumidor.capacity)}
              onChange={e=>setEditHumidor({...editHumidor,capacity:parseInt(e.target.value)||150})}
              placeholder="Capacity" type="number" style={fi}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={saveEditHumidor} style={{flex:1,padding:"12px",
                background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                border:"none",borderRadius:10,color:"#111111",fontSize:15,
                fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>Save</button>
              <button onClick={()=>setEditHumidor(null)} style={{padding:"12px 20px",
                background:"transparent",border:`1px solid rgba(160,120,40,0.22)`,
                borderRadius:10,color:T.textMuted,fontSize:15,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        )}

        {/* Add Humidor Form */}
        {showForm&&(
          <div style={{background:"linear-gradient(170deg,#111111,#0a0a0a)",borderRadius:16,
            border:`1px solid rgba(196,154,40,0.25)`,padding:"20px"}}>
            <div style={{fontSize:12,color:T.goldMid,fontFamily:"Georgia,serif",letterSpacing:2,
              textTransform:"uppercase",marginBottom:16}}>New Humidor</div>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
              placeholder="Humidor name" style={fi}/>
            <input value={form.wood} onChange={e=>setForm(f=>({...f,wood:e.target.value}))}
              placeholder="Wood type (e.g. Spanish Cedar)" style={fi}/>
            <input value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:e.target.value}))}
              placeholder="Capacity" type="number" style={fi}/>
            <div style={{display:"flex",gap:10}}>
              <button onClick={addHumidor} style={{flex:1,padding:"12px",
                background:"#111111",
                border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,color:"#3dd68c",fontSize:15,
                fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>Add</button>
              <button onClick={()=>setShowForm(false)} style={{padding:"12px 20px",
                background:"transparent",border:`1px solid rgba(160,120,40,0.22)`,
                borderRadius:10,color:T.textMuted,fontSize:15,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        )}

        {/* Add Humidor button */}
        {!showForm&&(
          <button onClick={()=>setShowForm(true)}
            style={{width:"100%",display:"flex",alignItems:"center",gap:14,
              background:"rgba(196,154,40,0.04)",
              border:`1px dashed rgba(196,154,40,0.28)`,borderRadius:16,
              padding:"16px 18px",cursor:"pointer"}}>
            <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,
              background:"rgba(196,154,40,0.1)",border:`1px solid rgba(196,154,40,0.3)`,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:22,color:T.goldMid,lineHeight:1}}>+</span>
            </div>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:15,fontWeight:"bold",color:T.goldMid,
                fontFamily:"Georgia,serif"}}>Add New Humidor</div>
              <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",
                fontStyle:"italic",marginTop:2}}>Connect a sensor and start monitoring</div>
            </div>
            <span style={{color:T.goldMid,fontSize:20,marginLeft:"auto"}}>›</span>
          </button>
        )}
      </div>

      {/* ── PERMANENT HUMIDITY CHART ── */}
      {humidors.length>0&&(
        <div style={{position:"sticky",bottom:90,left:0,right:0,zIndex:10,
          background:"linear-gradient(170deg,#0a0a0a,#050300)",
          borderTop:`1px solid rgba(196,154,40,0.2)`,
          boxShadow:"0 -8px 24px rgba(0,0,0,0.8)"}}>
          <div style={{padding:"12px 16px 8px"}}>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",
                color:"#ffffff",fontFamily:"Georgia,serif"}}>Humidity History</div>
              {/* Range selector */}
              <div style={{display:"flex",gap:3}}>
                {(['24H','7D','30D','90D'] as const).map(r=>(
                  <button key={r} onClick={()=>setHistoryRange(r)}
                    style={{padding:"3px 7px",
                      background:"transparent",
                      border:`1px solid rgba(196,154,40,0.2)`,
                      borderRadius:5,
                      color:historyRange===r?"#ffffff":T.textMuted,
                      fontWeight:historyRange===r?"bold":"normal",
                      fontSize:9,fontFamily:"Georgia,serif",cursor:"pointer"}}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {/* Multi-line SVG chart */}
            <div style={{background:"rgba(0,0,0,0.4)",borderRadius:10,padding:"10px",
              border:`1px solid rgba(196,154,40,0.08)`}}>
              {/* Chart with Y-axis labels */}
              <div style={{display:"flex",gap:6,alignItems:"flex-start"}}>
                {/* Y-axis labels */}
                <div style={{display:"flex",flexDirection:"column",justifyContent:"space-between",
                  height:80,paddingBottom:2,flexShrink:0}}>
                  {[80,75,70,65,60].map(v=>(
                    <div key={v} style={{fontSize:8,color:"rgba(255,255,255,0.5)",
                      fontFamily:"Georgia,serif",lineHeight:1,textAlign:"right",width:20}}>
                      {v}%
                    </div>
                  ))}
                </div>
                {/* Chart area */}
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:0}}>
                  <svg width="100%" height="80" viewBox="0 0 300 80" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[60,65,68,70,72,75,80].map((v,i)=>(
                      <line key={i} x1="0" y1={80-((v-60)/20)*80} x2="300" y2={80-((v-60)/20)*80}
                        stroke={v===65||v===72?"rgba(61,214,140,0.15)":"rgba(196,154,40,0.05)"} strokeWidth={v===65||v===72?"1":"0.5"}
                        strokeDasharray={v===65||v===72?"4 3":"none"}/>
                    ))}
                    {/* Ideal zone fill */}
                    <rect x="0" y={80-((72-60)/20)*80} width="300"
                      height={((72-65)/20)*80} fill="rgba(61,214,140,0.05)"/>
                    {/* One line per humidor */}
                    {humidors.map((h,i)=>{
                      const color=HUMIDOR_COLORS[i%HUMIDOR_COLORS.length];
                      const data=getHistoryData(h.id);
                      return (
                        <polyline key={h.id}
                          points={data.map((v,j)=>`${(j/(data.length-1))*300},${80-((v-60)/20)*80}`).join(" ")}
                          fill="none" stroke={color} strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
                      );
                    })}
                  </svg>
                  {/* Time axis */}
                  <div style={{display:"flex",justifyContent:"space-between",
                    paddingTop:4,paddingLeft:0}}>
                    {historyRange==="24H"
                      ?["12am","3am","6am","9am","12pm","3pm","6pm","9pm","Now"].map((l,i)=>(
                          <span key={i} style={{fontSize:7.5,color:"rgba(255,255,255,0.5)",
                            fontFamily:"Georgia,serif"}}>{l}</span>
                        ))
                      :historyRange==="7D"
                      ?["7d","6d","5d","4d","3d","2d","1d","Today"].map((l,i)=>(
                          <span key={i} style={{fontSize:7.5,color:"rgba(255,255,255,0.5)",
                            fontFamily:"Georgia,serif"}}>{l}</span>
                        ))
                      :historyRange==="30D"
                      ?["30d","24d","18d","12d","6d","Today"].map((l,i)=>(
                          <span key={i} style={{fontSize:7.5,color:"rgba(255,255,255,0.5)",
                            fontFamily:"Georgia,serif"}}>{l}</span>
                        ))
                      :["90d","72d","54d","36d","18d","Today"].map((l,i)=>(
                          <span key={i} style={{fontSize:7.5,color:"rgba(255,255,255,0.5)",
                            fontFamily:"Georgia,serif"}}>{l}</span>
                        ))
                    }
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div style={{display:"flex",flexWrap:"wrap",gap:"4px 12px",marginTop:8}}>
                {humidors.map((h,i)=>(
                  <div key={h.id} style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:12,height:3,borderRadius:2,
                      background:HUMIDOR_COLORS[i%HUMIDOR_COLORS.length]}}/>
                    <span style={{fontSize:9,color:"#ffffff",fontFamily:"Georgia,serif"}}>
                      {h.name}
                    </span>
                  </div>
                ))}
                <div style={{display:"flex",alignItems:"center",gap:4,marginLeft:"auto"}}>
                  <span style={{fontSize:9,color:"#3dd68c",fontFamily:"Georgia,serif"}}>
                    Ideal: 65–72% RH
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BAND SCANNER MODAL ─────────────────────────────────────────────────────
