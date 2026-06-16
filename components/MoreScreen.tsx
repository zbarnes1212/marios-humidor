"use client";
import {T,getCigarImage,NOTES_INIT,useLang} from "@/lib/constants";
import React,{useState,useEffect} from "react";
import {SignOutButton} from "@clerk/nextjs";

export function MoreScreen({onBack}:{onBack:()=>void}) {
  type SubScreen="collection"|"reviews"|"notes"|"help"|"faq"|"about"|null;
  const [sub,setSub]=useState<SubScreen>(null);
  const [cigars,setCigars]=useState<any[]>([]);
  const [records,setRecords]=useState<any[]>([]);
  const [notes,setNotes]=useState<any[]>([]);
  const [mounted,setMounted]=useState(false);

  useEffect(()=>{
    try{const s=localStorage.getItem('mh_cigars');if(s)setCigars(JSON.parse(s));}catch{}
    try{const s=localStorage.getItem('mh_records');if(s)setRecords(JSON.parse(s));}catch{}
    try{const s=localStorage.getItem('mh_notes');if(s)setNotes(JSON.parse(s));}catch{}
    setMounted(true);
  },[]);

  const BackHeader=({title}:{title:string})=>(
    <div style={{padding:"20px 16px 16px",display:"flex",alignItems:"center",
      gap:12,borderBottom:`1px solid rgba(196,154,40,0.1)`,flexShrink:0}}>
      <button onClick={()=>setSub(null)} style={{background:"none",border:"none",
        cursor:"pointer",padding:"4px 8px 4px 0"}}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={T.goldMid} strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div style={{fontSize:24,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>{title}</div>
    </div>
  );

  const Stars=({n}:{n:number})=>(
    <div style={{display:"flex",gap:2}}>
      {[1,2,3,4,5].map(i=>(
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i<=n?T.goldMid:"none"} stroke={T.goldMid} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );

  // ── MY COLLECTION ──────────────────────────────────────────────────────────
  if(sub==="collection") {
    const total=mounted?cigars.reduce((a:number,c:any)=>a+(c.count||0),0):0;
    const brands=mounted?new Set(cigars.map((c:any)=>c.brand)).size:0;
    return(
      <div style={{display:"flex",flexDirection:"column",height:"100%",paddingBottom:100}}>
        <BackHeader title="My Collection"/>
        <div style={{padding:"16px 16px 0"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[{val:total,label:"Total Cigars"},{val:brands,label:"Brands"}].map((s,i)=>(
              <div key={i} style={{background:"#111111",borderRadius:12,
                border:`1px solid rgba(196,154,40,0.12)`,padding:"12px 14px",textAlign:"center"}}>
                <div style={{fontSize:26,fontWeight:"bold",color:T.goldMid,fontFamily:"Georgia,serif"}}>{s.val}</div>
                <div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif"}}>{s.label}</div>
              </div>
            ))}
          </div>
          {mounted&&cigars.length===0&&(
            <div style={{textAlign:"center",padding:"40px 20px",color:T.textMuted,fontFamily:"Georgia,serif",fontSize:15}}>
              No cigars in your collection yet.{"\n"}Add some from the Humidors tab.
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {cigars.map((c:any)=>(
              <div key={c.id} style={{background:"#111111",borderRadius:12,
                border:`1px solid rgba(196,154,40,0.12)`,padding:"14px 16px",
                display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:8,overflow:"hidden",flexShrink:0,
                  background:"rgba(196,154,40,0.08)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {c.imageUri
                    ?<img src={c.imageUri} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    :<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:"bold",color:T.textPrimary,
                    fontFamily:"Georgia,serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {c.brand} {c.line}
                  </div>
                  <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif"}}>
                    {c.vitola}{c.wrapper?` · ${c.wrapper}`:""}
                  </div>
                  {c.rating>0&&<Stars n={c.rating}/>}
                </div>
                <div style={{flexShrink:0,textAlign:"center"}}>
                  <div style={{fontSize:20,fontWeight:"bold",color:T.goldMid,fontFamily:"Georgia,serif"}}>{c.count||0}</div>
                  <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif"}}>left</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── MY REVIEWS ─────────────────────────────────────────────────────────────
  if(sub==="reviews") {
    const smoked=mounted?records.filter((r:any)=>r.status==="smoked"):[];
    const wishlist=mounted?records.filter((r:any)=>r.status==="onMyList"):[];
    const avgRating=smoked.length>0
      ?(smoked.reduce((a:number,r:any)=>a+(r.rating||0),0)/smoked.length).toFixed(1):"—";
    return(
      <div style={{display:"flex",flexDirection:"column",height:"100%",paddingBottom:100}}>
        <BackHeader title="My Reviews"/>
        <div style={{padding:"16px 16px 0"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
            {[{val:smoked.length,label:"Smoked"},{val:wishlist.length,label:"Wish List"},{val:avgRating,label:"Avg Rating"}].map((s,i)=>(
              <div key={i} style={{background:"#111111",borderRadius:12,
                border:`1px solid rgba(196,154,40,0.12)`,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:"bold",color:T.goldMid,fontFamily:"Georgia,serif"}}>{s.val}</div>
                <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif"}}>{s.label}</div>
              </div>
            ))}
          </div>
          {mounted&&records.length===0&&(
            <div style={{textAlign:"center",padding:"40px 20px",color:T.textMuted,fontFamily:"Georgia,serif",fontSize:15}}>
              No reviews yet. Log a smoke from the Record tab.
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {mounted&&records.map((r:any)=>(
              <div key={r.id} style={{background:"#111111",borderRadius:12,
                border:`1px solid rgba(196,154,40,0.12)`,padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>
                      {r.brand} {r.line}
                    </div>
                    <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif"}}>{r.vitola}</div>
                  </div>
                  <div style={{flexShrink:0,marginLeft:8}}>
                    <span style={{fontSize:11,padding:"3px 8px",borderRadius:20,fontFamily:"Georgia,serif",
                      background:r.status==="smoked"?"rgba(196,154,40,0.15)":"rgba(255,255,255,0.08)",
                      color:r.status==="smoked"?T.goldMid:T.textMuted}}>
                      {r.status==="smoked"?"Smoked":"Wish List"}
                    </span>
                  </div>
                </div>
                {r.rating>0&&<div style={{marginBottom:6}}><Stars n={r.rating}/></div>}
                {r.note&&<div style={{fontSize:13,color:T.textSecondary,fontFamily:"Georgia,serif",
                  fontStyle:"italic",lineHeight:1.5}}>{r.note}</div>}
                <div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif",marginTop:6}}>{r.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── MY NOTES ───────────────────────────────────────────────────────────────
  if(sub==="notes") {
    return(
      <div style={{display:"flex",flexDirection:"column",height:"100%",paddingBottom:100}}>
        <BackHeader title="My Notes"/>
        <div style={{padding:"16px 16px 0"}}>
          {mounted&&notes.length===0&&(
            <div style={{textAlign:"center",padding:"40px 20px",color:T.textMuted,fontFamily:"Georgia,serif",fontSize:15}}>
              No tasting notes yet. Add notes from the Humidors tab.
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {notes.map((n:any)=>(
              <div key={n.id} style={{background:"#111111",borderRadius:12,
                border:`1px solid rgba(196,154,40,0.12)`,padding:"16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>
                      {n.brand} {n.line}
                    </div>
                    <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif"}}>{n.vitola}</div>
                  </div>
                  {n.rating>0&&<Stars n={n.rating}/>}
                </div>
                {n.notes&&(
                  <div style={{fontSize:14,color:T.textSecondary,fontFamily:"Georgia,serif",
                    fontStyle:"italic",lineHeight:1.6,marginBottom:8}}>"{n.notes}"</div>
                )}
                {n.pairing&&(
                  <div style={{display:"flex",alignItems:"center",gap:6,
                    padding:"6px 10px",background:"rgba(196,154,40,0.06)",
                    borderRadius:8,border:`1px solid rgba(196,154,40,0.12)`}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2">
                      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                    </svg>
                    <span style={{fontSize:12,color:T.goldMid,fontFamily:"Georgia,serif"}}>Paired with {n.pairing}</span>
                  </div>
                )}
                <div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif",marginTop:8}}>{n.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── HELP CENTER ────────────────────────────────────────────────────────────
  if(sub==="help") {
    const topics=[
      {q:"How do I add cigars to my humidor?",a:"Tap the Humidors tab, open a humidor, then tap the + button to search our catalog or add a custom cigar manually."},
      {q:"How does the sensor monitoring work?",a:"Mario's Humidor connects to your ESP32-S3/SHT40 Humidor Pill via your home Wi-Fi. Live temperature and humidity data appears in the Humidors tab. A Pro subscription unlocks push alerts when readings go out of range."},
      {q:"What is Ask Mario?",a:"Ask Mario is your AI cigar concierge powered by Claude. Free members get 5 questions per month. Pro members get unlimited access with deeper personalization based on your collection."},
      {q:"How do Group Challenges work?",a:"Create or join a Group Challenge from the Club tab. Members track progress together toward a shared smoking goal — most cigars smoked, brands explored, or ratings logged within a set timeframe."},
      {q:"What's included in Pro?",a:"Pro ($59.99/year) unlocks unlimited humidor entries, unlimited Ask Mario, Social Club access, the News feed, humidity push alerts, cloud sync across devices, and full Tasting Journal history."},
      {q:"How do I log a smoke?",a:"Tap the Record tab and use the scanner or manual entry to log a cigar. You can set the status to Smoked or On My List, add tasting notes, a pairing, and a photo."},
    ];
    const [open,setOpen]=useState<number|null>(null);
    return(
      <div style={{display:"flex",flexDirection:"column",height:"100%",paddingBottom:100}}>
        <BackHeader title="Help Center"/>
        <div style={{padding:"16px 16px 0"}}>
          <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",marginBottom:16,lineHeight:1.5}}>
            Everything you need to get the most out of Mario's Humidor.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {topics.map((t,i)=>(
              <div key={i} style={{background:"#111111",borderRadius:12,
                border:`1px solid rgba(196,154,40,${open===i?"0.3":"0.12"})`,overflow:"hidden"}}>
                <button onClick={()=>setOpen(open===i?null:i)}
                  style={{width:"100%",padding:"14px 16px",background:"none",border:"none",
                    cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                  <span style={{fontSize:14,color:T.textPrimary,fontFamily:"Georgia,serif",
                    textAlign:"left",lineHeight:1.4}}>{t.q}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={T.goldMid} strokeWidth="2"
                    style={{flexShrink:0,transform:open===i?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {open===i&&(
                  <div style={{padding:"0 16px 14px",fontSize:13,color:T.textSecondary,
                    fontFamily:"Georgia,serif",lineHeight:1.6,borderTop:`1px solid rgba(196,154,40,0.08)`}}>
                    {t.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{marginTop:20,padding:"16px",background:"rgba(196,154,40,0.06)",
            borderRadius:12,border:`1px solid rgba(196,154,40,0.15)`,textAlign:"center"}}>
            <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",marginBottom:8}}>
              Still have questions?
            </div>
            <a href="mailto:support@marioshumidor.com"
              style={{fontSize:14,color:T.goldMid,fontFamily:"Georgia,serif",textDecoration:"none"}}>
              support@marioshumidor.com
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── FAQ ────────────────────────────────────────────────────────────────────
  if(sub==="faq") {
    const faqs=[
      {q:"Is Mario's Humidor free?",a:"Yes — the core app is free. Free members can store up to 10 cigars, ask Mario 5 questions per month, and access the Education tab and Tobacco World Map. Pro ($59.99/year) unlocks everything."},
      {q:"Does the app work offline?",a:"Your humidor inventory and tasting notes are stored locally on your device and always accessible offline. Live sensor data and Ask Mario require an internet connection."},
      {q:"What sensors are compatible?",a:"Mario's Humidor is designed for the Humidor Pill — our custom ESP32-S3/SHT40 sensor. Govee H5051 legacy support is also available for existing users."},
      {q:"Can I use the app on multiple devices?",a:"Pro members get cloud sync via Supabase, so your collection, notes, and records stay in sync across all your devices automatically."},
      {q:"How do I cancel my Pro subscription?",a:"You can cancel anytime from Account Settings. Your Pro access continues until the end of your billing period."},
      {q:"Is my data private?",a:"Your humidor data is stored locally by default. Pro cloud sync uses encrypted Supabase storage. We never sell your data to third parties."},
      {q:"How accurate are the sensor readings?",a:"The SHT40 sensor used in the Humidor Pill has ±1.8% RH accuracy and ±0.2°C temperature accuracy — well within the precision needed for cigar storage."},
    ];
    const [open,setOpen]=useState<number|null>(null);
    return(
      <div style={{display:"flex",flexDirection:"column",height:"100%",paddingBottom:100}}>
        <BackHeader title="FAQ"/>
        <div style={{padding:"16px 16px 0"}}>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {faqs.map((f,i)=>(
              <div key={i} style={{background:"#111111",borderRadius:12,
                border:`1px solid rgba(196,154,40,${open===i?"0.3":"0.12"})`,overflow:"hidden"}}>
                <button onClick={()=>setOpen(open===i?null:i)}
                  style={{width:"100%",padding:"14px 16px",background:"none",border:"none",
                    cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                  <span style={{fontSize:14,color:T.textPrimary,fontFamily:"Georgia,serif",
                    textAlign:"left",lineHeight:1.4}}>{f.q}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={T.goldMid} strokeWidth="2"
                    style={{flexShrink:0,transform:open===i?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s"}}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {open===i&&(
                  <div style={{padding:"0 16px 14px",fontSize:13,color:T.textSecondary,
                    fontFamily:"Georgia,serif",lineHeight:1.6,borderTop:`1px solid rgba(196,154,40,0.08)`}}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── ABOUT ──────────────────────────────────────────────────────────────────
  if(sub==="about") {
    return(
      <div style={{display:"flex",flexDirection:"column",height:"100%",paddingBottom:100}}>
        <BackHeader title="About"/>
        <div style={{padding:"24px 16px 0"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{width:72,height:72,borderRadius:"50%",
              background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              margin:"0 auto 14px",
              boxShadow:`0 0 30px rgba(196,154,40,0.3)`}}>
              <span style={{fontSize:32,fontWeight:"bold",color:"#0a0a0a",fontFamily:"Georgia,serif"}}>M</span>
            </div>
            <div style={{fontSize:22,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:4}}>
              Mario's Humidor
            </div>
            <div style={{fontSize:13,color:T.goldMid,fontFamily:"Georgia,serif",letterSpacing:1}}>
              THE CIGAR LIFESTYLE PLATFORM
            </div>
          </div>

          <div style={{background:"#111111",borderRadius:14,border:`1px solid rgba(196,154,40,0.12)`,
            padding:"20px",marginBottom:16}}>
            <div style={{fontSize:14,color:T.textSecondary,fontFamily:"Georgia,serif",lineHeight:1.7}}>
              Mario's Humidor is the premier platform for cigar enthusiasts — a place to track your collection,
              discover new smokes, connect with fellow aficionados, and get personalized guidance from Mario,
              your AI cigar concierge.
            </div>
          </div>

          <div style={{background:"#111111",borderRadius:14,border:`1px solid rgba(196,154,40,0.12)`,
            overflow:"hidden",marginBottom:16}}>
            {[
              {label:"Version",val:"1.3.0"},
              {label:"Platform",val:"iOS · Android · Web"},
              {label:"AI Concierge",val:"Claude (Anthropic)"},
              {label:"Sensor Protocol",val:"ESP32-S3 / SHT40"},
            ].map((row,i,arr)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"13px 16px",borderBottom:i<arr.length-1?`1px solid rgba(196,154,40,0.08)`:"none"}}>
                <span style={{fontSize:14,color:T.textMuted,fontFamily:"Georgia,serif"}}>{row.label}</span>
                <span style={{fontSize:14,color:T.textPrimary,fontFamily:"Georgia,serif"}}>{row.val}</span>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:10}}>
            <a href="/terms" style={{flex:1,padding:"13px",background:"#111111",borderRadius:12,
              border:`1px solid rgba(196,154,40,0.12)`,textAlign:"center",
              fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",textDecoration:"none",display:"block"}}>
              Terms of Service
            </a>
            <a href="/privacy" style={{flex:1,padding:"13px",background:"#111111",borderRadius:12,
              border:`1px solid rgba(196,154,40,0.12)`,textAlign:"center",
              fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",textDecoration:"none",display:"block"}}>
              Privacy Policy
            </a>
          </div>

          <div style={{textAlign:"center",marginTop:24,
            fontSize:12,color:"rgba(255,255,255,0.2)",fontFamily:"Georgia,serif"}}>
            © 2026 Mario's Humidor. All rights reserved.
          </div>
        </div>
      </div>
    );
  }

  // ── EXPORT MY DATA ─────────────────────────────────────────────────────────
  const handleExport=()=>{
    try{
      const data={
        exported:new Date().toISOString(),
        collection:JSON.parse(localStorage.getItem('mh_cigars')||'[]'),
        humidors:JSON.parse(localStorage.getItem('mh_humidors')||'[]'),
        records:JSON.parse(localStorage.getItem('mh_records')||'[]'),
        notes:JSON.parse(localStorage.getItem('mh_notes')||'[]'),
        groups:JSON.parse(localStorage.getItem('mh_groups')||'[]'),
        visitDays:JSON.parse(localStorage.getItem('mh_visit_days')||'[]'),
      };
      const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download=`marios-humidor-export-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }catch(e){console.error(e);}
  };

  // ── MAIN MORE MENU ─────────────────────────────────────────────────────────
  const MenuItem=({icon,label,right,last,onTap}:{icon:React.ReactNode,label:string,right?:React.ReactNode,last?:boolean,onTap?:()=>void})=>(
    <button onClick={onTap} style={{width:"100%",display:"flex",alignItems:"center",gap:14,
      padding:"15px 16px",background:"none",border:"none",cursor:"pointer",
      borderBottom:last?"none":`1px solid rgba(196,154,40,0.08)`,
      textAlign:"left"}}>
      <div style={{width:32,height:32,borderRadius:8,flexShrink:0,
        background:"rgba(196,154,40,0.08)",border:`1px solid rgba(196,154,40,0.12)`,
        display:"flex",alignItems:"center",justifyContent:"center"}}>
        {icon}
      </div>
      <div style={{flex:1,fontSize:17,color:T.textPrimary,fontFamily:"Georgia,serif"}}>
        {label}
      </div>
      {right||<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="rgba(196,154,40,0.3)" strokeWidth="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>}
    </button>
  );

  const Section=({title,children}:{title:string,children:React.ReactNode})=>(
    <div style={{marginBottom:20}}>
      <div style={{fontSize:10,color:T.textMuted,letterSpacing:3,
        textTransform:"uppercase",fontFamily:"Georgia,serif",
        padding:"0 4px",marginBottom:8}}>{title}</div>
      <div style={{background:"#111111",borderRadius:14,
        border:`1px solid rgba(196,154,40,0.12)`,overflow:"hidden"}}>
        {children}
      </div>
    </div>
  );

  const Icon=({path,viewBox="0 0 24 24"}:{path:string,viewBox?:string})=>(
    <svg width="16" height="16" viewBox={viewBox} fill="none" stroke={T.goldMid} strokeWidth="1.8">
      <path d={path}/>
    </svg>
  );

  return(
    <div style={{paddingBottom:100}}>
      {/* Header */}
      <div style={{padding:"20px 16px 16px",display:"flex",alignItems:"center",
        gap:12,borderBottom:`1px solid rgba(196,154,40,0.1)`}}>
        <button onClick={onBack} style={{background:"none",border:"none",
          cursor:"pointer",padding:"4px 8px 4px 0",color:T.goldMid}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={T.goldMid} strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div style={{fontSize:28,fontWeight:"bold",color:T.textPrimary,
          fontFamily:"Georgia,serif"}}>More</div>
      </div>

      <div style={{padding:"20px 16px 0"}}>

        <Section title="ACCOUNT">
          <MenuItem icon={<Icon path="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>} label="Edit Profile"/>
          <MenuItem icon={<Icon path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>} label="Account Settings"/>
          <MenuItem icon={<Icon path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>} label="Privacy & Security"/>
          <MenuItem icon={<Icon path="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>} label="Notifications" last/>
        </Section>

        <Section title="MY DATA">
          <MenuItem icon={<Icon path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>} label="My Collection" onTap={()=>setSub("collection")}/>
          <MenuItem icon={<Icon path="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>} label="My Reviews" onTap={()=>setSub("reviews")}/>
          <MenuItem icon={<Icon path="M22 12h-4l-3 9L9 3l-3 9H2"/>} label="My Activity"/>
          <MenuItem icon={<Icon path="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>} label="My Notes" onTap={()=>setSub("notes")}/>
          <MenuItem icon={<Icon path="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>} label="My Pairings"/>
          <MenuItem icon={<Icon path="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>} label="My Photos"/>
          <MenuItem icon={<Icon path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>} label="Export My Data" onTap={handleExport} last/>
        </Section>

        <Section title="COMMUNITY">
          <MenuItem icon={<Icon path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>} label="Find Friends"/>
          <MenuItem icon={<Icon path="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>} label="Invite Friends"/>
          <MenuItem icon={<Icon path="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>} label="My Lounge Check-ins"/>
          <MenuItem icon={<Icon path="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>} label="Discussions"/>
          <MenuItem icon={<Icon path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>} label="Events" last/>
        </Section>

        <Section title="SUPPORT">
          <MenuItem icon={<Icon path="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>} label="Help Center" onTap={()=>setSub("help")}/>
          <MenuItem icon={<Icon path="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 23 17z"/>} label="Contact Support"/>
          <MenuItem icon={<Icon path="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>} label="FAQ" onTap={()=>setSub("faq")}/>
          <MenuItem icon={<Icon path="M9 18h6M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>} label="Suggest a Feature" last/>
        </Section>

        <Section title="ABOUT">
          <MenuItem icon={<div style={{width:16,height:16,borderRadius:"50%",
            background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:9,fontWeight:"bold",color:"#0a0a0a"}}>M</div>}
            label="About Mario's Humidor" onTap={()=>setSub("about")}/>
          <MenuItem icon={<Icon path="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>} label="Terms of Service"/>
          <MenuItem icon={<Icon path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>} label="Privacy Policy"/>
          <MenuItem icon={<Icon path="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>} label="App Version"
            right={<span style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif"}}>1.3.0</span>} last/>
        </Section>

        {/* Log Out */}
        <SignOutButton>
          <button style={{width:"100%",padding:"16px",
            background:"rgba(139,0,0,0.3)",
            border:"1px solid rgba(139,0,0,0.4)",
            borderRadius:14,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            marginBottom:8}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#e05050" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span style={{fontSize:17,color:"#e05050",fontFamily:"Georgia,serif",
              fontWeight:"bold"}}>Log Out</span>
          </button>
        </SignOutButton>

      </div>
    </div>
  );
}


// ── MAIN ───────────────────────────────────────────────────────────────────
// ── AUTH SCREEN ────────────────────────────────────────────────────────────
