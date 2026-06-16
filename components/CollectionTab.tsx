"use client";
import {SvgIcon} from "@/lib/ui";
import {T,getCigarImage,useLang,useSyncContext,CIGARS} from "@/lib/constants";
import React,{useState,useEffect,useRef} from "react";
import {upsertCigar as syncUpsertCigar,deleteCigar as syncDeleteCigar} from "@/lib/sync";
import {BandScannerModal} from "@/components/BandScannerModal";

type ScanResult={brand:string;line:string;vitola:string;origin:string;wrapper:string;rating:number|null;confidence:string;notes:string;image_filename?:string|null};
type CigarEntry={id:number;brand:string;line:string;vitola:string;origin:string;wrapper:string;rating:number;count:number;purchaseDate:string;bandColor:string;humidorId:number|null};

const ADS = [
  {brand:"Davidoff",line:"Winston Churchill\nThe Late Hour",vitola:"Toro · 6 × 50",badge:"New Release",
    bg:"linear-gradient(135deg,#111111,#1a1a1a,#0a0a0a)",accent:"#C49A28",image:"/ad-davidoff.png"},
  {brand:"Padrón",line:"1964 Anniversary\nExclusivo Natural",vitola:"Robusto · 5 × 50",badge:"Member Favorite",
    bg:"linear-gradient(135deg,#0f1a08,#1a2a0e,#080f04)",accent:"#5a8c3a",image:"/ad-padron.png"},
  {brand:"Arturo Fuente",line:"Opus X\nAngel's Share",vitola:"Robusto · 5¼ × 50",badge:"Limited Edition",
    bg:"linear-gradient(135deg,#1a0808,#2a0e0e,#0f0404)",accent:"#8B2020",image:"/ad-fuente.png"},
  {brand:"My Father",line:"Le Bijou 1922\nTorpedo",vitola:"Torpedo · 6¼ × 52",badge:"Top Rated",
    bg:"linear-gradient(135deg,#0a0f1a,#0e1a2a,#04080f)",accent:"#4a6a9a",image:"/ad-myfather.png"},
  {brand:"Liga Privada",line:"No. 9\nRobusto",vitola:"Robusto · 5 × 52",badge:"Staff Pick",
    bg:"linear-gradient(135deg,#0f0a1a,#1a0e2a,#08040f)",accent:"#7a3a8a",image:"/ad-ligaprivada.png"},
];

export function AdCarousel() {
  const [idx,setIdx]=useState(0);
  const [fade,setFade]=useState(true);

  useEffect(()=>{
    const t=setInterval(()=>{
      setFade(false);
      setTimeout(()=>{
        setIdx(i=>(i+1)%ADS.length);
        setFade(true);
      },400);
    },12000);
    return()=>clearInterval(t);
  },[]);

  const ad=ADS[idx];

  return (
    <div style={{margin:"16px 16px 0"}}>
      <div style={{fontSize:8,letterSpacing:3,textTransform:"uppercase",color:T.textMuted,
        fontFamily:"Georgia,serif",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>Featured Release · Brand Partner</span>
        {/* Dot indicators */}
        <div style={{display:"flex",gap:5}}>
          {ADS.map((_,i)=>(
            <div key={i} onClick={()=>{setFade(false);setTimeout(()=>{setIdx(i);setFade(true);},400);}}
              style={{width:i===idx?16:5,height:5,borderRadius:3,cursor:"pointer",transition:"all 0.3s",
                background:i===idx?ad.accent:"rgba(160,120,40,0.25)"}}/>
          ))}
        </div>
      </div>
      <div style={{borderRadius:14,overflow:"hidden",border:`1px solid rgba(196,154,40,0.3)`,
        background:"linear-gradient(170deg,#111111,#0a0a0a)",
        opacity:fade?1:0,transition:"opacity 0.4s ease"}}>
        {/* Feature image area */}
        <div style={{position:"relative",height:180,background:ad.bg,
          display:"flex",alignItems:"flex-end",padding:16,overflow:"hidden"}}>
          {/* Actual ad image */}
          {ad.image&&<img src={ad.image} alt={ad.brand}
            style={{position:"absolute",inset:0,width:"100%",height:"100%",
              objectFit:"cover",objectPosition:"left center",opacity:1}}
            onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>}
          {/* Badge */}
          <div style={{position:"absolute",top:12,right:12,
            background:`linear-gradient(135deg,${ad.accent}cc,${ad.accent})`,
            color:"#fff",fontFamily:"Georgia,serif",fontSize:8,letterSpacing:2,
            padding:"4px 10px",borderRadius:4,fontWeight:"bold",textTransform:"uppercase"}}>
            {ad.badge}
          </div>
          {/* Gold accent line */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,
            background:`linear-gradient(90deg,transparent,${ad.accent},transparent)`}}/>
        </div>
        {/* Action buttons */}
        <div style={{display:"flex",gap:10,padding:"12px 14px",
          borderTop:`1px solid rgba(196,154,40,0.12)`}}>
          <button style={{flex:1,padding:"10px",
            background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
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
  );
}

// ── COLLECTION SCREEN ──────────────────────────────────────────────────────
export function CollectionTab() {
  const {t}=useLang();
  const [sel,setSel]=useState<number|null>(null);
  const [showScanner,setShowScanner]=useState(false);
  const [showJournal,setShowJournal]=useState(false);
  const [pendingCollection,setPendingCollection]=useState<ScanResult|null>(null);
  const [pendingJournal,setPendingJournal]=useState<ScanResult|null>(null);
  const [cigars,setCigars]=useState<CigarEntry[]>(CIGARS);
  const [mounted,setMounted]=useState(false);
  const [activeHumidor,setActiveHumidor]=useState<number|null>(null);
  const [allHumidors,setAllHumidors]=useState<{id:number;name:string;wood:string;capacity:number;status:string;photo?:string}[]>([]);

  useEffect(()=>{
    setMounted(true);
    // One-time cleanup: strip stored imageUri/customPhoto from mh_cigars to free quota
    try{
      const raw=localStorage.getItem('mh_cigars');
      if(raw){
        const parsed=JSON.parse(raw);
        const cleaned=parsed.map((c:any)=>{const{imageUri,customPhoto,...rest}=c;return rest;});
        if(JSON.stringify(cleaned)!==raw) localStorage.setItem('mh_cigars',JSON.stringify(cleaned));
        setCigars(cleaned);
      }
    }catch{}
    try{const s=localStorage.getItem('mh_humidors');if(s)setAllHumidors(JSON.parse(s));}catch{}
    const sync=()=>{
      try{const s=localStorage.getItem('mh_cigars');if(s)setCigars(JSON.parse(s));}catch{}
    };
    // storage event fires across tabs; also poll every 2s to catch same-tab writes
    const interval=setInterval(sync,2000);
    document.addEventListener('visibilitychange',sync);
    window.addEventListener('focus',sync);
    window.addEventListener('storage',sync);
    return()=>{
      clearInterval(interval);
      document.removeEventListener('visibilitychange',sync);
      window.removeEventListener('focus',sync);
      window.removeEventListener('storage',sync);
    };
  },[]);

  useEffect(()=>{
    if(!mounted) return;
    try{localStorage.setItem('mh_cigars',JSON.stringify(cigars));}catch{}
  },[cigars,mounted]);

  const [smokedToast,setSmokedToast]=useState<string|null>(null);
  const [showAddForm,setShowAddForm]=useState(false);
  const [addForm,setAddForm]=useState({brand:"",line:"",vitola:"",origin:"",wrapper:"",count:"1",rating:"90"});
  const [catalogQuery,setCatalogQuery]=useState("");
  const [catalogResults,setCatalogResults]=useState<any[]>([]);
  const [catalogSearching,setCatalogSearching]=useState(false);

  const saveNewCigar=()=>{
    if(!addForm.brand.trim()||!addForm.line.trim()) return;
    const newC:CigarEntry={
      id:Date.now(),brand:addForm.brand,line:addForm.line,vitola:addForm.vitola,
      origin:addForm.origin,wrapper:addForm.wrapper,
      rating:parseInt(addForm.rating)||90,count:parseInt(addForm.count)||1,
      purchaseDate:new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"}),
      bandColor:"#2a1608",
      humidorId:activeHumidor??null
    };
    setCigars(prev=>[...prev,newC]);
    setAddForm({brand:"",line:"",vitola:"",origin:"",wrapper:"",count:"1",rating:"90"});
    setShowAddForm(false);
    // Sync to Supabase
    if(userId){getToken().then(token=>{if(token)syncUpsertCigar(token,userId,{...addForm,id:Date.now()});});}
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
          <div style={{fontSize:17,color:"#f0e8d8",fontFamily:"Georgia,serif",textAlign:"center",lineHeight:1.5}}>{smokedToast}</div>
        </div>
      )}

      {/* Header — stats */}
      <div style={{padding:"20px 16px 16px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div style={{fontSize:22,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>
            My Collection
          </div>
          <div style={{fontSize:9,color:T.textMuted,letterSpacing:3,textTransform:"uppercase",fontFamily:"Georgia,serif"}}>
            View All
          </div>
        </div>
        {/* Stats row */}
        <div style={{background:"linear-gradient(170deg,#111111,#0a0a0a)",borderRadius:14,
          border:`1px solid rgba(196,154,40,0.15)`,padding:"16px",marginBottom:12}}>
          <div style={{display:"flex",gap:0,alignItems:"center"}}>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:32,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1}}>
                {mounted?total:0}
              </div>
              <div style={{fontSize:8,color:T.textMuted,letterSpacing:3,textTransform:"uppercase",marginTop:4,fontFamily:"Georgia,serif"}}>
                Total Cigars
              </div>
            </div>
            <div style={{width:1,height:44,background:T.border}}/>
            {/* Collection Score ring */}
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
              <div style={{position:"relative",width:52,height:52}}>
                <svg width="52" height="52" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(196,154,40,0.15)" strokeWidth="4"/>
                  <circle cx="26" cy="26" r="22" fill="none" stroke={T.goldMid} strokeWidth="4"
                    strokeDasharray={`${2*Math.PI*22*0.86} ${2*Math.PI*22}`}
                    strokeDashoffset={2*Math.PI*22*0.25} strokeLinecap="round"
                    style={{transform:"rotate(-90deg)",transformOrigin:"center"}}/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:13,fontWeight:"bold",color:T.goldMid,fontFamily:"Georgia,serif"}}>86</div>
              </div>
              <div style={{fontSize:8,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",marginTop:4,fontFamily:"Georgia,serif"}}>
                Score
              </div>
            </div>
            <div style={{width:1,height:44,background:T.border}}/>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1}}>
                {mounted&&cigars.length>0?`$${(cigars.reduce((a,c)=>a+c.count,0)*34).toLocaleString()}`:"—"}
              </div>
              <div style={{fontSize:8,color:T.textMuted,letterSpacing:3,textTransform:"uppercase",marginTop:4,fontFamily:"Georgia,serif"}}>
                Est. Value
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        {mounted&&cigars.length>0&&(
          <div style={{display:"flex",gap:8}}>
            {[
              {label:"Brands",value:new Set(cigars.map(c=>c.brand)).size},
              {label:"Countries",value:new Set(cigars.filter(c=>c.origin).map(c=>c.origin)).size||"—"},
              {label:"Vitolas",value:new Set(cigars.map(c=>c.vitola)).size},
              {label:"Avg Rating",value:cigars.length===0?"—":(cigars.reduce((a,c)=>a+c.rating,0)/cigars.length).toFixed(0)},
            ].map(s=>(
              <div key={s.label} style={{flex:1,background:"rgba(196,154,40,0.06)",
                border:`1px solid rgba(196,154,40,0.1)`,borderRadius:10,padding:"8px 4px",textAlign:"center"}}>
                <div style={{fontSize:17,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1}}>
                  {s.value}
                </div>
                <div style={{fontSize:8,color:T.textMuted,letterSpacing:1.5,textTransform:"uppercase",
                  marginTop:3,fontFamily:"Georgia,serif"}}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collection Breakdown */}
      {mounted&&cigars.length>0&&(
        <div style={{padding:"16px 16px 0",borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:9,letterSpacing:4,textTransform:"uppercase",color:T.textMuted,
            fontFamily:"Georgia,serif",marginBottom:10}}>Collection Breakdown</div>
          {[
            {label:"By Brand",value:`${new Set(cigars.map(c=>c.brand)).size} Brands`,icon:"tag"},
            {label:"By Country",value:`${new Set(cigars.filter(c=>c.origin).map(c=>c.origin)).size||0} Countries`,icon:"globe"},
            {label:"By Vitola",value:`${new Set(cigars.map(c=>c.vitola)).size} Vitolas`,icon:"vitola"},
            {label:"By Wrapper",value:`${new Set(cigars.filter(c=>c.wrapper).map(c=>c.wrapper)).size||0} Wrapper Types`,icon:"wrapper"},
            {label:"By Strength",value:"Mild · Medium · Full",icon:"strength"},
          ].map(row=>(
            <div key={row.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"11px 0",borderBottom:`1px solid rgba(196,154,40,0.06)`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:14}}>{row.icon}</span>
                <span style={{fontSize:15,color:T.textPrimary,fontFamily:"Georgia,serif"}}>{row.label}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:15,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>{row.value}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(196,154,40,0.3)" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {/* Recent Additions */}
      {mounted&&cigars.length>0&&(
        <div style={{padding:"16px 16px 0",borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:9,letterSpacing:4,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif"}}>
              Recent Additions
            </div>
            <div style={{fontSize:9,color:T.goldMid,letterSpacing:2,textTransform:"uppercase",fontFamily:"Georgia,serif"}}>
              See All
            </div>
          </div>
          {cigars.slice(-3).reverse().map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:44,height:44,borderRadius:8,overflow:"hidden",flexShrink:0,background:"#000"}}>
                <img src={(c.customPhoto||c.imageUri)?(c.customPhoto||c.imageUri):getCigarImage(c.vitola,c.wrapper,c.image_filename)} alt={c.line}
                  style={{width:"100%",height:"100%",objectFit:"cover"}}
                  onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>{c.line}</div>
                <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>{c.brand}</div>
                <div style={{fontSize:9,color:T.textMuted,fontFamily:"Georgia,serif"}}>{c.purchaseDate}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(196,154,40,0.2)" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* ── HUMIDOR ARCHITECTURE: Level 1 = Humidor Cards, Level 2 = Cigars ── */}

      {activeHumidor===null ? (
        /* ── LEVEL 1: HUMIDOR CARDS ── */
        <div style={{padding:"20px 16px 0"}}>
          <div style={{fontSize:9,letterSpacing:4,textTransform:"uppercase",color:T.textMuted,
            fontFamily:"Georgia,serif",marginBottom:16}}>My Humidors</div>
          {allHumidors.map(h=>{
            const hCigars=cigars.filter(c=>c.humidorId===h.id);
            const cigarCount=hCigars.reduce((a,c)=>a+c.count,0);
            const statusColor=h.status==="optimal"?"#2a7a4a":h.status==="good"?"#7a6a1a":h.status==="no_data"?"#3a3a3a":"#7a2a2a";
            const statusDot=h.status==="optimal"?"#3dd68c":h.status==="good"?"#e8c84a":h.status==="no_data"?T.textMuted:"#e05050";
            return (
              <div key={h.id} onClick={()=>{setActiveHumidor(h.id);setSel(null);}}
                style={{background:"linear-gradient(170deg,#111111,#0a0a0a)",borderRadius:14,
                  marginBottom:12,cursor:"pointer",overflow:"hidden",
                  border:`1px solid rgba(196,154,40,0.2)`,
                  transition:"border-color 0.2s"}}
                onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(196,154,40,0.45)")}
                onMouseLeave={e=>(e.currentTarget.style.borderColor="rgba(196,154,40,0.2)")}>
                {/* Humidor photo */}
                <div style={{position:"relative",height:120,overflow:"hidden",
                  borderBottom:`1px solid rgba(196,154,40,0.15)`}}>
                  <img src="/humidor-hero.png" alt={h.name}
                    style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 35%",
                      filter:"brightness(0.55) saturate(1.1)"}}
                    onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                  {/* Dark gradient overlay */}
                  <div style={{position:"absolute",inset:0,
                    background:"linear-gradient(to top,rgba(6,2,0,0.88) 0%,rgba(6,2,0,0.35) 55%,rgba(6,2,0,0.1) 100%)"}}/>
                  {/* Status badge — top right */}
                  <div style={{position:"absolute",top:10,right:10,
                    display:"flex",alignItems:"center",gap:5,padding:"4px 10px",
                    background:`rgba(10,10,10,0.7)`,borderRadius:20,
                    border:`1px solid ${statusColor}60`,backdropFilter:"blur(4px)"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:statusDot}}/>
                    <span style={{fontSize:10,color:statusDot,fontFamily:"Georgia,serif",
                      textTransform:"capitalize",letterSpacing:0.5}}>{h.status==="no_data"?"No Sensor":h.status}</span>
                  </div>
                  {/* Name overlay — bottom left */}
                  <div style={{position:"absolute",bottom:10,left:14,right:14}}>
                    <div style={{fontSize:17,fontWeight:"bold",color:"#fff",fontFamily:"Georgia,serif",
                      textShadow:"0 1px 6px rgba(0,0,0,0.9)",lineHeight:1.2}}>{h.name}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",fontFamily:"Georgia,serif",
                      fontStyle:"italic",marginTop:2}}>{h.wood}</div>
                  </div>
                </div>
                {/* Stats row */}
                <div style={{display:"flex",alignItems:"center",padding:"14px 16px"}}>
                  <div style={{flex:1,display:"flex",alignItems:"center",gap:20}}>
                    <div>
                      <div style={{fontSize:20,fontWeight:"bold",color:T.goldLight,fontFamily:"Georgia,serif",lineHeight:1}}>{cigarCount}</div>
                      <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",marginTop:2}}>Cigars</div>
                    </div>
                    <div style={{width:1,height:28,background:T.border}}/>
                    <div>
                      <div style={{fontSize:20,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1}}>{h.capacity}</div>
                      <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",marginTop:2}}>Capacity</div>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── LEVEL 2: CIGARS IN HUMIDOR ── */
        <div>
          {/* Back nav header */}
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"16px 16px 12px",
            borderBottom:`1px solid ${T.border}`}}>
            <button onClick={()=>{setActiveHumidor(null);setSel(null);}}
              style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",
                color:T.goldMid,cursor:"pointer",fontFamily:"Georgia,serif",fontSize:13,padding:0}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              My Humidors
            </button>
            <span style={{color:T.textMuted,fontSize:13}}>/</span>
            <span style={{color:T.textPrimary,fontFamily:"Georgia,serif",fontSize:13,fontWeight:"bold"}}>
              {allHumidors.find(h=>h.id===activeHumidor)?.name}
            </span>
          </div>

          {/* Cigar count label */}
          <div style={{padding:"16px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
            <div style={{fontSize:9,letterSpacing:4,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif"}}>
              {cigars.filter(c=>c.humidorId===activeHumidor).length} Cigars
            </div>
            <div style={{fontSize:11,color:T.textGold,cursor:"pointer",fontFamily:"Georgia,serif"}}>Sort: Recently Added</div>
          </div>

          {/* CIGAR CARDS */}
          <div style={{padding:"0 16px"}}>
            {cigars.filter(c=>c.humidorId===activeHumidor).length===0 ? (
              <div style={{textAlign:"center",padding:"40px 20px",color:T.textMuted,fontFamily:"Georgia,serif"}}>
                <div style={{marginBottom:12}}><SvgIcon id="wood" size={32}/></div>
                <div style={{fontSize:17,marginBottom:6}}>This humidor is empty</div>
                <div style={{fontSize:12,fontStyle:"italic"}}>Add cigars with the button below</div>
              </div>
            ) : (
              cigars.filter(c=>c.humidorId===activeHumidor).map(c=>{
          const isEx=sel===c.id;
          return (
            <div key={c.id} onClick={()=>setSel(isEx?null:c.id)}
              style={{background:"linear-gradient(170deg,#111111,#0a0a0a)",borderRadius:14,marginBottom:14,overflow:"hidden",
                cursor:"pointer",border:`1px solid ${isEx?T.borderGold:T.border}`,transition:"border-color 0.2s"}}>
              <div style={{display:"flex",alignItems:"stretch",minHeight:96}}>
                {/* Cigar image — replaces color band */}
                <div style={{width:56,flexShrink:0,background:"#000",
                  display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",
                  borderRight:`1px solid rgba(196,154,40,0.1)`}}>
                  <img
                    src={(c.customPhoto||c.imageUri)?(c.customPhoto||c.imageUri):getCigarImage(c.vitola,c.wrapper,c.image_filename)}
                    alt={c.line}
                    style={{height:"100%",width:"100%",objectFit:"cover",objectPosition:"center center"}}
                    onError={e=>{
                      (e.target as HTMLImageElement).style.display="none";
                    }}
                  />
                </div>
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
                                border:"none",borderRadius:8,color:"#111111",fontSize:12,fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
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
                                <div style={{fontSize:17,color:T.textPrimary,fontFamily:"Georgia,serif"}}>{v}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{display:"flex",gap:8}}>
                            <button onClick={e=>startEdit(c,e)}
                              style={{flex:1,padding:"9px",background:"transparent",
                                border:`1px solid ${T.borderGold}`,borderRadius:8,
                                color:T.goldMid,fontSize:11,cursor:"pointer",fontFamily:"Georgia,serif",letterSpacing:0.5}}>
                              {t("edit")}
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
                  <div style={{fontSize:8,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",marginTop:3}}>{t("pts")}</div>
                </div>
              </div>
            </div>
          );
        })
            )}
        </div>
        </div>
      )}

      {/* ── ADD / JOURNAL BUTTONS (always shown) ── */}
      <div style={{padding:"0 16px"}}>
        <div style={{display:"flex",gap:10,marginTop:16}}>
          <button onClick={()=>{setShowAddForm(!showAddForm);setShowJournal(false);}}
            style={{flex:1,padding:"13px",background:"transparent",border:`1px solid rgba(196,154,40,0.3)`,
            borderRadius:12,color:T.goldMid,fontSize:10,fontFamily:"Georgia,serif",
            cursor:"pointer",letterSpacing:3,textTransform:"uppercase"}}>
            {t("add_manually")}
          </button>
          <button onClick={()=>{setShowJournal(!showJournal);setShowAddForm(false);}}
            style={{flex:1,padding:"13px",background:showJournal?`linear-gradient(135deg,${T.goldDark},${T.goldMid})`:"transparent",
            border:`1px solid rgba(196,154,40,0.3)`,
            borderRadius:12,color:showJournal?"#0a0a0a":T.goldMid,fontSize:10,fontFamily:"Georgia,serif",
            cursor:"pointer",letterSpacing:3,textTransform:"uppercase"}}>
            {t("journal_btn")}
          </button>
        </div>

        {showAddForm&&(
          <div style={{marginTop:12,background:T.card,borderRadius:14,border:`1px solid ${T.borderGold}`,padding:"18px 16px"}}>
            <div style={{fontSize:12,color:T.goldLight,fontFamily:"Georgia,serif",fontWeight:"bold",marginBottom:14,letterSpacing:1}}>{t("add_to_collection")}</div>
            {/* Catalog search */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Search Catalog</div>
              <input value={catalogQuery}
                onChange={e=>{
                  const val=e.target.value;
                  setCatalogQuery(val);
                  setCatalogResults([]);
                  if(val.trim().length<2) return;
                  setCatalogSearching(true);
                  const localCigars2=JSON.parse(localStorage.getItem('mh_cigars')||'[]');
                  const q2=val.trim().toLowerCase();
                  const localMatches2=localCigars2.filter((c:any)=>
                    (c.brand&&c.brand.toLowerCase().includes(q2))||(c.line&&c.line.toLowerCase().includes(q2))
                  ).map((c:any)=>({id:c.id,brand:c.brand,line:c.line,cigar_name:c.vitola,
                    country:c.origin,wrapper:c.wrapper,description:c.notes||"",_local:true}));
                  fetch(`/api/cigar-search?q=${encodeURIComponent(val.trim())}`)
                    .then(r=>r.json())
                    .then(d=>setCatalogResults([...localMatches2,...(d.results||[])]))
                    .catch(()=>setCatalogResults(localMatches2))
                    .finally(()=>setCatalogSearching(false));
                }}
                placeholder="e.g. Padrón, Davidoff..."
                style={{width:"100%",background:"rgba(0,0,0,0.25)",border:`1px solid ${T.borderGold}`,borderRadius:8,
                  padding:"10px 14px",color:T.textPrimary,fontSize:13,outline:"none",
                  boxSizing:"border-box" as const,fontFamily:"Georgia,serif"}}/>
              {catalogSearching&&<div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic",paddingTop:6}}>Searching…</div>}
              {!catalogSearching&&catalogResults.length>0&&(
                <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
                  {catalogResults.map((r:any)=>(
                    <button key={r.id} onClick={()=>{
                      setAddForm(f=>({...f,
                        brand:r.brand||f.brand,
                        line:r.line||f.line,
                        vitola:r.cigar_name||f.vitola,
                        origin:r.country||f.origin,
                        wrapper:r.wrapper||f.wrapper,
                      }));
                      setCatalogQuery("");
                      setCatalogResults([]);
                    }}
                    style={{textAlign:"left",background:"rgba(0,0,0,0.3)",border:`1px solid ${T.border}`,
                      borderRadius:8,padding:"10px 12px",cursor:"pointer"}}>
                      <div style={{fontSize:13,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>{r.brand} {r.line}</div>
                      {r.cigar_name&&<div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif",marginTop:2}}>{r.cigar_name}</div>}
                    </button>
                  ))}
                </div>
              )}
              {!catalogSearching&&catalogQuery.trim().length>=2&&catalogResults.length===0&&(
                <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic",paddingTop:6}}>No matches — fill in manually below.</div>
              )}
            </div>
            {/* Humidor selector */}
            <div style={{marginBottom:10}}>
              <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Humidor</div>
              <select value={activeHumidor??allHumidors[0]?.id??""} disabled={activeHumidor!==null}
                onChange={e=>setActiveHumidor(parseInt(e.target.value)||null)}
                style={{width:"100%",background:"rgba(0,0,0,0.25)",border:`1px solid ${T.border}`,borderRadius:8,
                  padding:"10px 14px",color:T.textPrimary,fontSize:13,outline:"none",
                  boxSizing:"border-box" as const,fontFamily:"Georgia,serif",
                  opacity:activeHumidor!==null?0.6:1}}>
                <option value="">No Humidor</option>
                {allHumidors.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
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
                  border:"none",borderRadius:8,color:"#111111",fontSize:13,fontWeight:"bold",
                  cursor:"pointer",fontFamily:"Georgia,serif"}}>
                {t("save_to_collection")}
              </button>
              <button onClick={()=>setShowAddForm(false)}
                style={{padding:"12px 16px",background:"transparent",border:`1px solid ${T.border}`,
                  borderRadius:8,color:T.textMuted,fontSize:15,cursor:"pointer"}}>
                {t("cancel")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tasting Journal — shown when Journal button tapped */}
      {(showJournal||pendingJournal)&&(
        <TastingNotesSection prefill={pendingJournal} onPrefillUsed={()=>setPendingJournal(null)}/>
      )}

      {/* ── FLOATING SCANNER FAB ── */}
      <div onClick={()=>setShowScanner(true)} style={{
        position:"fixed",bottom:"calc(env(safe-area-inset-bottom, 0px) + 16px)",right:8,width:52,height:52,borderRadius:"50%",
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

export function TastingNotesSection({prefill,onPrefillUsed}:{prefill:ScanResult|null,onPrefillUsed:()=>void}) {
  const [notes,setNotes]=useState(NOTES_INIT);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({brand:"",line:"",vitola:"",rating:5,notes:"",pairing:""});
  const [sel,setSel]=useState<number|null>(null);
  const {t}=useLang();

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
          <div style={{fontSize:10,letterSpacing:5,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif",marginBottom:6}}>{t("tasting_journal")}</div>
          <div style={{fontSize:20,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>{t("collectors_journal")}</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,border:"none",
            borderRadius:20,padding:"8px 18px",color:"#111111",fontSize:12,
            fontFamily:"Georgia,serif",fontWeight:"bold",cursor:"pointer"}}>
{t("log_entry")}
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
            placeholder={t("describe_exp")} rows={4}
            style={{...fi,resize:"vertical",lineHeight:1.7}}/>
          <div style={{display:"flex",gap:10}}>
            <button onClick={save} style={{flex:1,padding:"11px",background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,border:"none",borderRadius:8,color:"#111111",fontSize:13,fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>Save Entry</button>
            <button onClick={()=>setShowForm(false)} style={{padding:"11px 16px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.textMuted,fontSize:15,cursor:"pointer"}}>Cancel</button>
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
                      {t("paired_with")} {n.pairing}
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

