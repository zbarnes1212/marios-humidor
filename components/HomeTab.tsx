"use client";
import React,{useState,useEffect,useRef,useCallback} from "react";
import {createPortal} from "react-dom";
import {T,r2,useLang,LANGS} from "@/lib/constants";
import {MMedallion,renderMarioText} from "@/lib/ui";

const HOME_QUICK_PROMPTS=[
  {label:"What pairs well with this cigar?",icon:"🥃"},
  {label:"What should I age longer?",icon:"⏳"},
  {label:"Find a cigar lounge near me",icon:"pin",isLounge:true},
  {label:"What events are coming up?",icon:"calendar"},
  {label:"What do you recommend tonight?",icon:"✦"},
  {label:"Recommend from my humidor",icon:"🗄"},
  {label:"Help me choose between two cigars",icon:"⚖️"},
  {label:"Teach me something new",icon:"📖"},
];

// ── HOME GROUP CHALLENGE TICKER ITEMS (Phase 2 placeholders) ────────────────
const HOME_TICKER_ITEMS=[
  {icon:"⛳",text:"Friday Foursome Challenge — 4/6 members completed"},
  {icon:"🔥",text:"Brotherhood Challenge — 11/12 members, 7 days remaining"},
  {icon:"🥃",text:"Friday Night Lounge Crew — 5/8 visited 3 lounges"},
  {icon:"🏆",text:"Mike R. completed Smoke 5 Different Padrón Cigars"},
];

// ── HOME MARIO CONVERSATION MODAL ──────────────────────────────────────────
export function MarioModal({initialPrompt,onClose,liveData,lang}:{
  initialPrompt:string;onClose:()=>void;
  liveData:Record<string,{temperature:number|null;humidity:number|null;observedAt:string|null}>;
  lang:string;
}) {
  const langName=LANGS.find(l=>l.code===lang)?.name||"English";
  const sensors=Object.entries(liveData).filter(([,s])=>s.humidity&&s.humidity>0);
  const sensorLines=sensors.map(([name,s])=>{
    const hum=s.humidity?.toFixed(0);
    const temp=s.temperature?.toFixed(1);
    const humAlert=s.humidity&&(s.humidity<65||s.humidity>72)
      ?" WARNING HUMIDITY OUT OF RANGE (ideal 65-70% RH)":"";
    const tempAlert=s.temperature&&(s.temperature>70||s.temperature<60)
      ?" WARNING TEMPERATURE OUT OF RANGE (ideal 60-70 degrees F)":"";
    return `${name}: ${hum}% RH${humAlert}, ${temp} degrees F${tempAlert}`;
  }).join("; ");
  const sensorContext=sensorLines
    ?` LIVE HUMIDOR READINGS: ${sensorLines}. If any reading is flagged as out of range, proactively warn the user and give specific corrective advice even if they did not ask.`
    :"";
  const systemPrompt=`You are Mario, a warm, deeply knowledgeable private cigar concierge. Speak like a trusted friend at a private lounge. Be specific and personal.${sensorContext} When asked about cigar lounges, always provide REAL specific lounge names with full street addresses — never say you don't know or can't find locations. Draw on your extensive knowledge of premium cigar lounges across the US and worldwide. Sign responses with '— Mario'. Under 150 words. Always respond in ${langName}.`;

  const [messages,setMessages]=useState<{role:string;text:string}[]>([]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef<HTMLDivElement>(null);
  const inputRef=useRef<HTMLInputElement>(null);
  const sentInitial=useRef(false);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  const send=useCallback(async(text:string)=>{
    if(!text.trim()||loading) return;
    const userMsg={role:"user",text};
    setMessages(m=>[...m,userMsg]);
    setInput("");
    // Delay the visual "typing" indicator slightly so it doesn't feel instant/robotic
    const loadingTimer=setTimeout(()=>setLoading(true),500);
    try{
      const allMsgs=[...messages,userMsg];
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({system:systemPrompt,
          messages:allMsgs.map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text}))})});

      if(!res.body){throw new Error("No response body");}

      const reader=res.body.getReader();
      const decoder=new TextDecoder();
      let buffer="";
      let fullText="";
      let started=false;

      while(true){
        const{done,value}=await reader.read();
        if(done) break;
        buffer+=decoder.decode(value,{stream:true});

        const lines=buffer.split("\n");
        buffer=lines.pop()||"";

        for(const line of lines){
          const trimmed=line.trim();
          if(!trimmed.startsWith("data:")) continue;
          const jsonStr=trimmed.slice(5).trim();
          if(!jsonStr||jsonStr==="[DONE]") continue;

          let evt:any;
          try{evt=JSON.parse(jsonStr);}catch{continue;}

          if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta"){
            fullText+=evt.delta.text;
            if(!started){
              started=true;
              clearTimeout(loadingTimer);
              setLoading(false);
              setMessages(m=>[...m,{role:"ai",text:""}]);
            }
            setMessages(m=>{
              const copy=[...m];
              copy[copy.length-1]={role:"ai",text:fullText};
              return copy;
            });
          }
        }
      }

      if(!started){
        clearTimeout(loadingTimer);
        setMessages(m=>[...m,{role:"ai",text:"Please try again.\n\n— Mario"}]);
      }
    }catch{
      clearTimeout(loadingTimer);
      setMessages(m=>[...m,{role:"ai",text:"A momentary connection issue.\n\n— Mario"}]);
    }
    setLoading(false);
  },[messages,loading,systemPrompt]);

  // Send initial prompt once on mount
  useEffect(()=>{
    if(!sentInitial.current&&initialPrompt){
      sentInitial.current=true;
      send(initialPrompt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const [mountedPortal,setMountedPortal]=useState(false);
  useEffect(()=>{setMountedPortal(true);},[]);
  if(!mountedPortal) return null;

  return createPortal(
    <div style={{position:"fixed",inset:0,height:"100dvh",zIndex:300,display:"flex",flexDirection:"column",
      background:T.bg,overflow:"hidden"}}>
      {/* Modal header */}
      <div style={{flexShrink:0,padding:"14px 16px 12px",borderBottom:`1px solid rgba(196,154,40,0.15)`,
        display:"flex",alignItems:"center",gap:12,background:"#0a0a0a"}}>
        <div style={{width:64,height:64,borderRadius:"50%",flexShrink:0,
          border:`2px solid ${T.goldMid}`,overflow:"hidden",
          boxShadow:`0 0 0 2px #0a0a0a,0 0 0 4px ${T.goldDark}44`}}>
          <img src="/mario-avatar-modal.jpg" alt="Mario" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 60%"}}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>Mario</div>
          <div style={{fontSize:9,color:T.goldMid,letterSpacing:2,textTransform:"uppercase",marginTop:2}}>Master Cigar Sommelier</div>
        </div>
        <button onClick={onClose}
          style={{width:34,height:34,borderRadius:"50%",background:"rgba(196,154,40,0.08)",
            border:`1px solid rgba(196,154,40,0.2)`,cursor:"pointer",color:T.goldMid,
            fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
      </div>

      {/* Messages — sole scroll container */}
      <div style={{flex:"1 1 0",minHeight:0,overflowY:"auto",WebkitOverflowScrolling:"touch",
        padding:"16px 16px 0",display:"flex",flexDirection:"column",gap:14}}>
        {/* Initial prompt bubble */}
        {initialPrompt&&(
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <div style={{maxWidth:"80%",background:"rgba(196,154,40,0.08)",
              border:`1px solid rgba(196,154,40,0.2)`,borderRadius:"16px 3px 16px 16px",padding:"12px 16px"}}>
              <div style={{fontSize:14,color:T.textPrimary,lineHeight:1.7,fontFamily:"Georgia,serif"}}>{initialPrompt}</div>
            </div>
          </div>
        )}
        {/* Full conversation in order — skip first user msg (already shown as initialPrompt) */}
        {messages.map((m,i)=>{
          if(m.role==="user"&&i===0) return null;
          return(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
              {m.role==="ai"?(
                <div style={{maxWidth:"92%",
                  background:"linear-gradient(155deg,#1a1a1a 0%,#111111 60%,#0a0a0a 100%)",
                  border:`1px solid rgba(196,154,40,0.22)`,borderRadius:"3px 16px 16px 16px",
                  padding:"16px 18px",boxShadow:"0 4px 20px rgba(0,0,0,0.5)"}}>
                  <div style={{fontSize:9,color:T.goldMid,letterSpacing:2,textTransform:"uppercase",
                    marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:32,height:32,borderRadius:"50%",overflow:"hidden",border:`1px solid ${T.goldDark}`,flexShrink:0}}>
                      <img src="/mario-avatar-modal.jpg" alt="Mario" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"38% 40%"}}/>
                    </div>
                    <span style={{fontSize:11}}>Mario</span>
                  </div>
                  <div style={{fontSize:17,color:T.textPrimary,lineHeight:1.85,fontFamily:"Georgia,serif"}}>{renderMarioText(m.text)}</div>
                </div>
              ):(
                <div style={{maxWidth:"80%",background:"rgba(196,154,40,0.08)",
                  border:`1px solid rgba(196,154,40,0.2)`,borderRadius:"16px 3px 16px 16px",padding:"12px 16px"}}>
                  <div style={{fontSize:17,color:T.textPrimary,lineHeight:1.7,fontFamily:"Georgia,serif"}}>{m.text}</div>
                </div>
              )}
            </div>
          );
        })}
        {loading&&(
          <div style={{display:"flex",justifyContent:"flex-start"}}>
            <div style={{background:"linear-gradient(155deg,#1a1a1a,#111111)",border:`1px solid rgba(196,154,40,0.22)`,
              borderRadius:"3px 16px 16px 16px",padding:"16px 20px"}}>
              <div style={{display:"flex",gap:5}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.goldMid,animation:`mT 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div>
            </div>
          </div>
        )}

        {/* Input — flows directly under the last message */}
        <div style={{padding:"10px 0 28px",
          display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
          <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter")send(input);}}
            placeholder="Ask Mario anything..."
            style={{flex:1,background:"linear-gradient(170deg,#111111,#0a0a0a)",
              border:`1px solid rgba(196,154,40,0.22)`,borderRadius:24,
              padding:"12px 18px",color:T.textPrimary,fontSize:13,
              fontFamily:"Georgia,serif",outline:"none"}}/>
          <button onClick={()=>send(input)}
            style={{width:44,height:44,borderRadius:"50%",flexShrink:0,
              background:"linear-gradient(135deg,#2a2a2a,#0a0a0a)",
              border:`1px solid rgba(196,154,40,0.3)`,cursor:"pointer",color:T.goldMid,fontSize:22,fontWeight:"bold",
              display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>›</button>
        </div>

        <div ref={bottomRef}/>
      </div>
    </div>,
    document.body
  );
}

export function HomeTab({liveData,liveStatus,lastUpdated,onRefresh,onNavigate}:{
  liveData:Record<string,{temperature:number|null;humidity:number|null;observedAt:string|null}>;
  liveStatus:"idle"|"loading"|"connected"|"error";lastUpdated:string|null;onRefresh:()=>void;
  onNavigate:(t:string)=>void;
}) {
  const {lang}=useLang();
  const hr=new Date().getHours();
  const greeting=hr<12?"Good Morning":hr<17?"Good Afternoon":"Good Evening";

  // Session flag: has the user opened the app before?
  const [isReturning,setIsReturning]=useState(false);
  const [modalPrompt,setModalPrompt]=useState<string|null>(null);
  const [freeInput,setFreeInput]=useState("");
  const [mounted,setMounted]=useState(false);

  // Hero recommendation state
  type HeroRec={cigar:string;vitola:string;why:string;image?:string}|null;
  const [heroRec,setHeroRec]=useState<HeroRec>(null);
  const [heroLoading,setHeroLoading]=useState(true);

  // "Your Journey" stats
  const [journeyCigars,setJourneyCigars]=useState<any[]>([]);
  const [journeyNotes,setJourneyNotes]=useState<any[]>([]);

  useEffect(()=>{
    try{
      const seen=localStorage.getItem("mh_home_seen");
      if(seen) setIsReturning(true);
      else localStorage.setItem("mh_home_seen","1");
    }catch{}
    try{const s=localStorage.getItem('mh_cigars');if(s)setJourneyCigars(JSON.parse(s));}catch{}
    try{const s=localStorage.getItem('mh_notes');if(s)setJourneyNotes(JSON.parse(s));}catch{}
    setMounted(true);
  },[]);

  // Fetch Mario's recommendation — rotate every 4 hours from personal inventory
  useEffect(()=>{
    let cancelled=false;
    const FOUR_HOURS=4*60*60*1000;
    // Check cache first
    try{
      const lastFetch=parseInt(localStorage.getItem('mh_rec_time')||'0');
      const cachedRec=localStorage.getItem('mh_rec_cache');
      if(cachedRec&&Date.now()-lastFetch<FOUR_HOURS){
        const r=JSON.parse(cachedRec);
        setHeroRec(r);
        setHeroLoading(false);
        return()=>{cancelled=true;};
      }
    }catch{}
    // Read inventory from localStorage
    let inventory:any[]=[];
    try{const s=localStorage.getItem('mh_cigars');if(s)inventory=JSON.parse(s);}catch{}
    const inStock=inventory.filter((c:any)=>(c.count||0)>0);
    const fetchRec=(pick:any)=>{
      const prompt=`You are Mario, a private cigar concierge. The member has ${pick.brand} ${pick.line}${pick.vitola?` (${pick.vitola})`:""}${pick.wrapper?`, ${pick.wrapper} wrapper`:""} in their humidor. Respond ONLY with valid JSON, no markdown: {"cigar":"${pick.brand} ${pick.line}","vitola":"${pick.vitola||""}","why":"one sentence on why this is a great smoke for tonight"}`;
      fetch("/api/chat-json",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({system:"You are a JSON-only API. Respond only with valid JSON. No markdown, no backticks.",
          messages:[{role:"user",content:prompt}]})})
        .then(r=>r.json())
        .then(d=>{
          if(cancelled) return;
          const text=d.content?.find((b:{type:string;text?:string})=>b.type==="text")?.text||"{}";
          try{
            const parsed=JSON.parse(text.trim());
            const rec={
              cigar:parsed.cigar||`${pick.brand} ${pick.line}`,
              vitola:parsed.vitola||pick.vitola||"",
              why:parsed.why||`A great choice from your humidor tonight.`,
              image:pick.image_filename?`/cigars/${pick.image_filename}`:undefined
            };
            setHeroRec(rec);
            try{localStorage.setItem('mh_rec_cache',JSON.stringify(rec));localStorage.setItem('mh_rec_time',String(Date.now()));}catch{}
          }catch{
            const rec={cigar:`${pick.brand} ${pick.line}`,vitola:pick.vitola||"",why:`A great choice from your humidor tonight.`,image:pick.image_filename?`/cigars/${pick.image_filename}`:undefined};
            setHeroRec(rec);
            try{localStorage.setItem('mh_rec_cache',JSON.stringify(rec));localStorage.setItem('mh_rec_time',String(Date.now()));}catch{}
          }
          setHeroLoading(false);
        })
        .catch(()=>{if(!cancelled) setHeroLoading(false);});
    };
    if(inStock.length>0){
      const pick=inStock[Math.floor(Math.random()*inStock.length)];
      fetchRec(pick);
    } else {
      fetch("/api/recommendation")
        .then(r=>r.json())
        .then(data=>{
          if(cancelled) return;
          if(data.cigar){
            const rec={cigar:data.cigar,vitola:data.vitola||"",why:data.why||"",image:data.image||undefined};
            setHeroRec(rec);
            try{localStorage.setItem('mh_rec_cache',JSON.stringify(rec));localStorage.setItem('mh_rec_time',String(Date.now()));}catch{}
          }
          setHeroLoading(false);
        })
        .catch(()=>{if(!cancelled) setHeroLoading(false);});
    }
    return()=>{cancelled=true;};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const openModal=(prompt:string)=>{
    if(!prompt.trim()) return;
    setModalPrompt(prompt);
  };

  const handleLounge=(label:string)=>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        pos=>{const{latitude,longitude}=pos.coords;
          openModal(`Find me a premium cigar lounge near coordinates ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Give me the top 3 options with name, address, and what makes each one special.`);},
        ()=>{try{const lc=parseInt(localStorage.getItem('mh_lounge_searches')||'0');localStorage.setItem('mh_lounge_searches',String(lc+1));}catch{}openModal("Find me a premium cigar lounge near me. Give me top recommendations with what makes each one special.");}
      );
    } else {
      try{const lc=parseInt(localStorage.getItem('mh_lounge_searches')||'0');localStorage.setItem('mh_lounge_searches',String(lc+1));}catch{} openModal("Find me a premium cigar lounge near me. Give me top recommendations with what makes each one special.");
    }
  };

  // Insight cards — only render when real data exists; for now we show none (empty state)
  // These will populate when Supabase user data comes online
  const insights:Array<{label:string;icon:string;text:string;prompt:string}>=[];
  // Future: derive from collection, smoking history, journal data

  // Your Journey stat values
  const journeyTotalCigars=mounted?journeyCigars.reduce((a:number,c:any)=>a+(c.count||0),0):0;
  const journeyUniqueBrands=mounted?new Set(journeyCigars.map((c:any)=>c.brand)).size:0;
  const journeyDayStreak=mounted?(()=>{try{const v=JSON.parse(localStorage.getItem('mh_visit_days')||'[]');const today=new Date().toDateString();const todayMs=new Date(today).getTime();let s=0;const sorted=[...new Set([...v,today])].sort((a,b)=>new Date(a).getTime()-new Date(b).getTime());for(let i=sorted.length-1;i>=0;i--){const diff=Math.round((todayMs-new Date(sorted[i]).getTime())/(1000*60*60*24));if(diff===s)s++;else break;}return s;}catch{return 0;}})():0;

  return(
    <div style={{paddingBottom:24,position:"relative",minHeight:"100vh"}}>

      {/* ── CONTENT (floating over background) ─────────────────────────── */}
      <div style={{position:"relative",zIndex:1}}>

      {/* ── 1. ASK MARIO TITLE (over background, no card) ──────────────── */}
      <div style={{padding:"28px 16px 16px"}}>
        <div style={{fontSize:9,color:"#ffffff",letterSpacing:3,
          textTransform:"uppercase",fontFamily:"Georgia,serif",marginBottom:6,
          textShadow:"0 2px 12px rgba(0,0,0,0.9)"}}>
          {greeting}
        </div>
        <div style={{fontSize:34,fontWeight:"bold",color:"#ffffff",
          fontFamily:"Georgia,serif",lineHeight:1.05,marginBottom:6,
          textShadow:"0 2px 16px rgba(0,0,0,0.9)"}}>
          Ask Mario
        </div>
        <div style={{fontSize:9,color:"#ffffff",letterSpacing:2.5,
          textTransform:"uppercase",fontFamily:"Georgia,serif",
          textShadow:"0 1px 8px rgba(0,0,0,0.9)"}}>
          Master Cigar Sommelier
        </div>
      </div>

      {/* ── 2/4. ASK MARIO CARD (title, input, 5 quick prompts) ─────────── */}
      <div style={{padding:"40px 16px 0"}}>
        <div style={{borderRadius:14,
          border:`1px solid rgba(196,154,40,0.18)`,
          background:"rgba(15,15,15,0.72)",
          backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
          padding:"12px 14px"}}>

          {/* Title */}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:17,fontWeight:"bold",color:"#ffffff",
              fontFamily:"Georgia,serif",marginBottom:4}}>Ask Mario</div>
            <div style={{fontSize:13,color:"#ffffff",fontFamily:"Georgia,serif"}}>
              What would you like to know?
            </div>
          </div>

          {/* Input */}
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
            <div style={{flex:1,position:"relative"}}>
              <input value={freeInput} onChange={e=>setFreeInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")openModal(freeInput);}}
                placeholder="Ask anything about cigars…"
                style={{width:"100%",background:"rgba(0,0,0,0.35)",
                  border:`1px solid rgba(196,154,40,0.28)`,borderRadius:24,
                  padding:"12px 50px 12px 18px",color:"#ffffff",fontSize:17,
                  fontFamily:"Georgia,serif",outline:"none",boxSizing:"border-box"}}/>
              <button style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",
                background:"none",border:"none",cursor:"pointer",padding:0,
                color:"#ffffff",opacity:0.7,display:"flex",alignItems:"center"}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="9" y="2" width="6" height="11" rx="3"/>
                  <path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/>
                  <line x1="8" y1="22" x2="16" y2="22"/>
                </svg>
              </button>
            </div>
            <button onClick={()=>openModal(freeInput)}
              style={{width:38,height:38,borderRadius:"50%",flexShrink:0,
                background:"linear-gradient(135deg,#2a2a2a,#0a0a0a)",
                border:`1px solid rgba(196,154,40,0.3)`,cursor:"pointer",color:T.goldMid,fontSize:22,fontWeight:"bold",
                display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>›</button>
          </div>

          {/* 4 Quick Prompts */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[
              {icon:"🥃",label:"Pair this Cigar",prompt:"What pairs well with this cigar?"},
              {icon:"⏳",label:"What's aging well?",prompt:"What's aging well in my humidor?"},
              {icon:"📍",label:"Find a lounge near me",prompt:"lounge",isLounge:true},
              {icon:"📅",label:"Upcoming events",prompt:"What events are coming up?"},
            ].map((p,i)=>(
              <button key={i}
                onClick={()=>p.isLounge?handleLounge(p.prompt):openModal(p.prompt)}
                style={{background:"rgba(0,0,0,0.35)",
                  border:`1px solid rgba(196,154,40,0.18)`,borderRadius:12,
                  padding:"12px 6px",cursor:"pointer",textAlign:"center",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <span style={{fontSize:24}}>{p.icon}</span>
                <span style={{fontSize:11,color:"#ffffff",fontFamily:"Georgia,serif",
                  lineHeight:1.3}}>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4b. TODAY'S RECOMMENDATION ──────────────────────────────────── */}
      <div style={{padding:"14px 16px 0"}}>
        <div onClick={()=>{
            if(heroLoading) return;
            openModal(
              heroRec
                ?`Tell me more about the ${heroRec.cigar} (${heroRec.vitola}) — why is it a good choice right now? You mentioned: "${heroRec.why}"`
                :isReturning?"What do you recommend for me today?":"Let me tell you about cigars I enjoy."
            );
          }}
          style={{borderRadius:14,overflow:"hidden",
          border:`1px solid rgba(196,154,40,0.18)`,
          background:"rgba(15,15,15,0.72)",
          backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
          cursor:heroLoading?"default":"pointer",
          display:"flex",alignItems:"stretch",gap:0,minHeight:140}}>

          {/* Cigar image */}
          <div style={{width:110,flexShrink:0,background:"rgba(0,0,0,0.4)",
            display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
            {heroRec?.image
              ? <img src={heroRec.image} alt=""
                  style={{width:"100%",height:"100%",objectFit:"contain",objectPosition:"center",background:"#000"}}
                  onError={e=>{(e.target as HTMLImageElement).src="/cigars/mario-default.jpg";}}/>
              : <img src="/cigars/mario-default.jpg" alt="cigar"
                  style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",background:"#000"}}/>
            }
          </div>

          {/* Text + CTA */}
          <div style={{flex:1,minWidth:0,padding:"14px 16px",
            display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:11,color:"#ffffff",letterSpacing:2,textTransform:"uppercase",
                fontFamily:"Georgia,serif",marginBottom:6,opacity:0.7}}>Today's Recommendation</div>
              {heroLoading&&(
                <div>
                  <div style={{height:15,borderRadius:6,marginBottom:6,width:"75%",
                    background:"linear-gradient(90deg,rgba(196,154,40,0.06),rgba(196,154,40,0.14),rgba(196,154,40,0.06))",
                    backgroundSize:"200% 100%",animation:"shimmer 1.6s ease-in-out infinite"}}/>
                  <div style={{height:11,borderRadius:6,width:"45%",
                    background:"linear-gradient(90deg,rgba(196,154,40,0.04),rgba(196,154,40,0.10),rgba(196,154,40,0.04))",
                    backgroundSize:"200% 100%",animation:"shimmer 1.6s ease-in-out 0.2s infinite"}}/>
                </div>
              )}
              {!heroLoading&&heroRec&&(
                <>
                  <div style={{fontSize:18,fontWeight:"bold",color:"#ffffff",
                    fontFamily:"Georgia,serif",lineHeight:1.2,marginBottom:3}}>
                    {heroRec.cigar}
                  </div>
                  <div style={{fontSize:13,color:"#ffffff",fontFamily:"Georgia,serif",
                    fontStyle:"italic",letterSpacing:0.5,opacity:0.75,marginBottom:8}}>
                    {heroRec.vitola}
                  </div>
                  <div style={{fontSize:13,color:"#ffffff",fontFamily:"Georgia,serif",
                    fontStyle:"italic",lineHeight:1.5,opacity:0.85,
                    display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",
                    overflow:"hidden"}}>
                    {heroRec.why}
                  </div>
                </>
              )}
              {!heroLoading&&!heroRec&&(
                <div style={{fontSize:12,color:"rgba(255,255,255,0.85)",fontFamily:"Georgia,serif",fontStyle:"italic",lineHeight:1.5}}>
                  "Welcome to the lounge, my friend! Once you get settled in and add a few cigars to your humidor, I'll have some personal recommendations waiting right here for you."
                </div>
              )}
            </div>
            {/* CTA pill */}
            <div style={{alignSelf:"flex-start",background:"linear-gradient(135deg,#2a2a2a,#0a0a0a)",
              borderRadius:8,padding:"8px 18px",marginTop:10,
              border:`1px solid rgba(196,154,40,0.3)`,
              color:T.goldMid,fontSize:13,fontWeight:"bold",fontFamily:"Georgia,serif",
              letterSpacing:0.5,whiteSpace:"nowrap"}}>
              {heroRec?"Tell Me More":isReturning?"Ask Mario":"Get Started"}
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. YOUR JOURNEY ─────────────────────────────────────────────── */}
      <div style={{padding:"14px 16px 0"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:"bold",color:"#ffffff",
            fontFamily:"Georgia,serif",letterSpacing:0.5,
            textShadow:"0 2px 10px rgba(0,0,0,0.8)"}}>
            Your Journey
          </div>
          <button onClick={()=>onNavigate('profile')}
            style={{background:"transparent",border:"none",cursor:"pointer",
              display:"flex",alignItems:"center",gap:4,
              color:T.goldMid,fontSize:12,fontFamily:"Georgia,serif",letterSpacing:0.5}}>
            View Profile
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[
            {val:journeyTotalCigars,label:"Cigars Logged"},
            {val:journeyUniqueBrands,label:"Brands Explored"},
            {val:journeyDayStreak,label:"Day Streak"},
          ].map((s,i)=>(
            <div key={i} style={{textAlign:"center",
              background:"rgba(15,15,15,0.72)",backdropFilter:"blur(12px)",
              WebkitBackdropFilter:"blur(12px)",
              borderRadius:14,border:`1px solid rgba(196,154,40,0.18)`,
              padding:"14px 6px"}}>
              <div style={{fontSize:24,fontWeight:"bold",color:"#ffffff",
                fontFamily:"Georgia,serif",lineHeight:1,marginBottom:5}}>{s.val}</div>
              <div style={{fontSize:10,color:"#ffffff",fontFamily:"Georgia,serif",
                lineHeight:1.2}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. GROUP CHALLENGE TICKER spacer (ticker itself rendered at app level) ── */}
      <div style={{height:60}}/>

      {/* ── 6. PERSONALIZED INSIGHTS ───────────────────────────────────── */}
      {insights.length>0&&(
        <div style={{padding:"14px 16px 0"}}>
          <div style={{fontSize:8,color:"#ffffff",letterSpacing:3,textTransform:"uppercase",
            fontFamily:"Georgia,serif",marginBottom:10}}>What Mario Noticed</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {insights.map((ins,i)=>(
              <div key={i} style={{background:"linear-gradient(170deg,#111111,#0a0a0a)",
                border:`1px solid rgba(196,154,40,0.15)`,borderRadius:12,padding:"13px 15px",
                display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:18,flexShrink:0}}>{ins.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:8,color:"#ffffff",letterSpacing:2.5,textTransform:"uppercase",
                    fontFamily:"Georgia,serif",marginBottom:3}}>{ins.label}</div>
                  <div style={{fontSize:12,color:"#ffffff",fontFamily:"Georgia,serif",lineHeight:1.4}}>{ins.text}</div>
                </div>
                <button onClick={()=>openModal(ins.prompt)}
                  style={{background:"none",border:`1px solid rgba(196,154,40,0.3)`,borderRadius:8,
                    padding:"5px 11px",cursor:"pointer",color:"#ffffff",
                    fontSize:11,fontFamily:"Georgia,serif",flexShrink:0,letterSpacing:0.5}}>
                  Ask Mario
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONVERSATION MODAL ─────────────────────────────────────────── */}
      {modalPrompt!==null&&(
        <MarioModal
          initialPrompt={modalPrompt}
          onClose={()=>setModalPrompt(null)}
          liveData={liveData}
          lang={lang}
        />
      )}
      </div>
    </div>
  );
}

// ── PROFILE TAB ────────────────────────────────────────────────────────────
// ── CHALLENGES TAB ─────────────────────────────────────────────────────────
