"use client";
import {T,useLang,useSyncContext,useMembership} from "@/lib/constants";
import {AchievementsTab} from "@/components/ProfileTab";
import {MMedallion} from "@/lib/ui";
import React,{useState,useEffect} from "react";

export function ChallengesTab() {
  const [mounted,setMounted]=useState(false);
  const [cigars,setCigars]=useState<any[]>([]);
  const [notes,setNotes]=useState<any[]>([]);

  useEffect(()=>{
    try{const s=localStorage.getItem('mh_cigars');if(s)setCigars(JSON.parse(s));}catch{}
    try{const s=localStorage.getItem('mh_notes');if(s)setNotes(JSON.parse(s));}catch{}
    setMounted(true);
  },[]);

  const uniqueBrands=mounted?new Set(cigars.map((c:any)=>c.brand)).size:0;
  const uniqueCountries=mounted?new Set(cigars.filter((c:any)=>c.origin).map((c:any)=>c.origin)).size:0;
  const totalNotes=mounted?notes.length:0;
  const totalCigars=mounted?cigars.reduce((a:number,c:any)=>a+(c.count||0),0):0;

  const CHALLENGES=[
    {id:1,img:"/Smoke%2010%20Different%20Brands.png",icon:"fire",title:"Smoke 10 Different Brands",
      desc:"Expand your palate and try 10 unique cigar brands.",
      pts:250,current:uniqueBrands,goal:10,color:T.goldMid},
    {id:2,img:"/World_Traveler_V1.png",icon:"globe",title:"World Tour",
      desc:"Smoke cigars from 4 different countries.",
      pts:300,current:uniqueCountries,goal:4,color:T.goldMid},
    {id:3,img:"/Humidor_Perfection_V1.png",icon:"drop",title:"Humidor Perfection",
      desc:"Keep your humidor in the ideal range for 30 days.",
      pts:350,current:0,goal:30,color:"#3dd68c"},
    {id:4,img:"/Tasting_Notes.png",icon:"notes",title:"Tasting Notes Challenge",
      desc:"Log 20 tasting notes with ratings.",
      pts:200,current:totalNotes,goal:20,color:T.goldMid},
    {id:5,img:"/Smoke_5_Liga_Privadas.png",icon:"trophy",title:"Smoke 5 Liga Privadas",
      desc:"Experience 5 different Liga Privada cigars.",
      pts:400,current:0,goal:5,color:T.goldMid},
  ];

  // Circular progress ring helper
  const Ring=({pct,color,size=52}:{pct:number;color:string;size?:number})=>{
    const r=size/2-5;const circ=2*Math.PI*r;
    return(
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${circ*pct/100} ${circ}`}/>
      </svg>
    );
  };

  return(
    <div style={{padding:"0 16px 24px"}}>
      {/* Subtitle */}
      <div style={{fontSize:15,color:T.textSecondary,fontFamily:"Georgia,serif",
        marginBottom:20,lineHeight:1.5}}>
        Complete challenges, earn points, and level up your cigar journey.
      </div>

      {/* Challenge cards */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {CHALLENGES.map(c=>{
          const pct=Math.min(Math.round((c.current/c.goal)*100),100);
          return(
            <div key={c.id} style={{background:"#111111",borderRadius:16,
              border:`1px solid rgba(196,154,40,0.15)`,padding:"18px 16px",
              display:"flex",alignItems:"center",gap:16}}>

              {/* Badge icon */}
              <div style={{width:60,height:60,borderRadius:"50%",flexShrink:0,
                background:"rgba(196,154,40,0.08)",
                border:`1px solid rgba(196,154,40,0.2)`,
                overflow:"hidden",display:"flex",alignItems:"center",
                justifyContent:"center"}}>
                <img src={c.img} alt={c.title}
                  style={{width:"100%",height:"100%",objectFit:"cover"}}
                  onError={e=>{
                    const t=e.target as HTMLImageElement;
                    t.style.display="none";
                    (t.parentElement as HTMLElement).innerHTML=`<svg width='26' height='26' viewBox='0 0 24 24' fill='none' stroke='${T.goldMid}' stroke-width='1.8'><circle cx='12' cy='12' r='10'/></svg>`;
                  }}/>
              </div>

              {/* Info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:17,fontWeight:"bold",color:T.textPrimary,
                  fontFamily:"Georgia,serif",lineHeight:1.2,marginBottom:4}}>
                  {c.title}
                </div>
                <div style={{fontSize:13,color:"#ffffff",fontFamily:"Georgia,serif",
                  lineHeight:1.4,marginBottom:8}}>{c.desc}</div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke={T.goldMid} strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span style={{fontSize:13,color:T.goldMid,fontFamily:"Georgia,serif",
                    fontWeight:"bold"}}>{c.pts} Points</span>
                </div>
              </div>

              {/* Ring + arrow */}
              <div style={{flexShrink:0,display:"flex",alignItems:"center",gap:8}}>
                <div style={{position:"relative",width:60,height:60}}>
                  <Ring pct={pct} color={c.color} size={60}/>
                  <div style={{position:"absolute",inset:0,display:"flex",
                    flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                    <div style={{fontSize:15,fontWeight:"bold",color:"#fff",
                      fontFamily:"Georgia,serif",lineHeight:1}}>{pct}%</div>
                    <div style={{fontSize:9,color:T.textMuted,fontFamily:"Georgia,serif",
                      marginTop:1}}>{c.current}/{c.goal}</div>
                  </div>
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

      {/* Footer banner */}
      <div style={{marginTop:20,background:"#111111",borderRadius:14,
        border:`1px solid rgba(196,154,40,0.12)`,padding:"16px",
        display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:60,height:60,borderRadius:"50%",flexShrink:0,
          overflow:"hidden",border:`1px solid rgba(196,154,40,0.2)`}}>
          <img src="/Trophy.png" alt="Trophy"
            style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:"bold",color:T.textPrimary,
            fontFamily:"Georgia,serif",marginBottom:3}}>
            Complete challenges to earn points and climb the rankings.
          </div>
          <div style={{fontSize:13,color:"#ffffff",fontFamily:"Georgia,serif"}}>
            New challenges added monthly!
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LEADERBOARD TAB ────────────────────────────────────────────────────────
export function LeaderboardTab() {
  const TOP3=[
    {rank:1,name:"Alex M.",title:"Cigar Connoisseur",pts:2450,img:"/ad-davidoff.png",color:T.goldMid},
    {rank:2,name:"Michael D.",title:"Aficionado",pts:2150,img:"/ad-fuente.png",color:"rgba(192,192,192,0.7)"},
    {rank:3,name:"David L.",title:"Cigar Enthusiast",pts:1890,img:"/ad-myfather.png",color:"rgba(205,127,50,0.7)"},
  ];
  const REST=[
    {rank:4,name:"James P.",title:"Aficionado",pts:1720},
    {rank:5,name:"Brian T.",title:"Cigar Explorer",pts:1560},
    {rank:6,name:"Robert K.",title:"Cigar Enthusiast",pts:1350},
    {rank:7,name:"Thomas G.",title:"Cigar Lover",pts:1120},
    {rank:8,name:"Mark S.",title:"Cigar Explorer",pts:980},
  ];
  const YOU={rank:23,name:"You",title:"Cigar Enthusiast",pts:620};

  return(
    <div style={{padding:"0 16px 24px"}}>
      {/* Subtitle */}
      <div style={{fontSize:15,color:T.textSecondary,fontFamily:"Georgia,serif",
        marginBottom:16,lineHeight:1.5}}>
        See how you rank against other members in the Mario's Humidor Club.
      </div>

      {/* Filter pills */}
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:8,
          background:"#111111",border:`1px solid rgba(196,154,40,0.2)`,
          borderRadius:10,padding:"9px 14px",flex:1}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span style={{fontSize:14,color:T.textPrimary,fontFamily:"Georgia,serif",flex:1}}>This Month</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,
          background:"#111111",border:`1px solid rgba(196,154,40,0.2)`,
          borderRadius:10,padding:"9px 14px",flex:1}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span style={{fontSize:14,color:T.textPrimary,fontFamily:"Georgia,serif",flex:1}}>All Members</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Top 3 podium — full width medal cards */}
      <div style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:20}}>

        {/* 2nd — Silver */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",marginTop:40}}>
          <div style={{position:"relative",width:"100%"}}>
            <img src="/Silver_Medal.png" alt="2nd"
              style={{width:"100%",height:"auto",display:"block"}}/>
            <div style={{position:"absolute",top:"19%",left:"50%",
              transform:"translateX(-50%)",
              width:"52%",paddingBottom:"52%",borderRadius:"50%",
              overflow:"hidden",background:"#111"}}>
              <img src={TOP3[1].img} alt={TOP3[1].name}
                style={{position:"absolute",inset:0,width:"100%",height:"100%",
                  objectFit:"cover",objectPosition:"center 15%"}}
                onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
            </div>
          </div>
          <div style={{textAlign:"center",marginTop:6,padding:"0 4px"}}>
            <div style={{fontSize:14,fontWeight:"bold",color:T.textPrimary,
              fontFamily:"Georgia,serif"}}>{TOP3[1].name}</div>
            <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",marginTop:1}}>
              {TOP3[1].title}</div>
            <div style={{display:"flex",alignItems:"center",gap:3,justifyContent:"center",marginTop:4}}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill={T.goldMid}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span style={{fontSize:12,color:T.textPrimary,fontFamily:"Georgia,serif"}}>
                {TOP3[1].pts.toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>

        {/* 1st — Gold (slightly wider) */}
        <div style={{flex:1.15,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{position:"relative",width:"100%"}}>
            <img src="/Gold_Medal.png" alt="1st"
              style={{width:"100%",height:"auto",display:"block"}}/>
            <div style={{position:"absolute",top:"19%",left:"50%",
              transform:"translateX(-50%)",
              width:"52%",paddingBottom:"52%",borderRadius:"50%",
              overflow:"hidden",background:"#111"}}>
              <img src={TOP3[0].img} alt={TOP3[0].name}
                style={{position:"absolute",inset:0,width:"100%",height:"100%",
                  objectFit:"cover",objectPosition:"center 15%"}}
                onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
            </div>
          </div>
          <div style={{textAlign:"center",marginTop:6,padding:"0 4px"}}>
            <div style={{fontSize:16,fontWeight:"bold",color:T.textPrimary,
              fontFamily:"Georgia,serif"}}>{TOP3[0].name}</div>
            <div style={{fontSize:11,color:T.goldMid,fontFamily:"Georgia,serif",marginTop:1}}>
              {TOP3[0].title}</div>
            <div style={{display:"flex",alignItems:"center",gap:3,justifyContent:"center",marginTop:4}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill={T.goldMid}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span style={{fontSize:14,fontWeight:"bold",color:T.textPrimary,
                fontFamily:"Georgia,serif"}}>
                {TOP3[0].pts.toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>

        {/* 3rd — Bronze */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",marginTop:60}}>
          <div style={{position:"relative",width:"100%"}}>
            <img src="/Bronze_Medal.png" alt="3rd"
              style={{width:"100%",height:"auto",display:"block"}}/>
            <div style={{position:"absolute",top:"19%",left:"50%",
              transform:"translateX(-50%)",
              width:"52%",paddingBottom:"52%",borderRadius:"50%",
              overflow:"hidden",background:"#111"}}>
              <img src={TOP3[2].img} alt={TOP3[2].name}
                style={{position:"absolute",inset:0,width:"100%",height:"100%",
                  objectFit:"cover",objectPosition:"center 15%"}}
                onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
            </div>
          </div>
          <div style={{textAlign:"center",marginTop:6,padding:"0 4px"}}>
            <div style={{fontSize:14,fontWeight:"bold",color:T.textPrimary,
              fontFamily:"Georgia,serif"}}>{TOP3[2].name}</div>
            <div style={{fontSize:10,color:"rgba(205,127,50,0.85)",fontFamily:"Georgia,serif",
              marginTop:1}}>{TOP3[2].title}</div>
            <div style={{display:"flex",alignItems:"center",gap:3,justifyContent:"center",marginTop:4}}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill={T.goldMid}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span style={{fontSize:12,color:T.textPrimary,fontFamily:"Georgia,serif"}}>
                {TOP3[2].pts.toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of leaderboard */}
      <div style={{background:"#111111",borderRadius:16,
        border:`1px solid rgba(196,154,40,0.12)`,overflow:"hidden",marginBottom:12}}>
        {REST.map((m,i)=>(
          <div key={m.rank} style={{display:"flex",alignItems:"center",gap:14,
            padding:"14px 16px",
            borderBottom:i<REST.length-1?`1px solid rgba(196,154,40,0.08)`:"none"}}>
            <div style={{width:28,textAlign:"center",flexShrink:0}}>
              <span style={{fontSize:15,color:T.textMuted,fontFamily:"Georgia,serif",
                fontWeight:"bold"}}>{m.rank}</span>
            </div>
            <div style={{width:38,height:38,borderRadius:"50%",flexShrink:0,
              background:"rgba(196,154,40,0.08)",border:`1px solid rgba(196,154,40,0.15)`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:14,fontWeight:"bold",color:T.goldMid,fontFamily:"Georgia,serif"}}>
              {m.name.charAt(0)}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:17,fontWeight:"bold",color:T.textPrimary,
                fontFamily:"Georgia,serif"}}>{m.name}</div>
              <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",
                fontStyle:"italic"}}>{m.title}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:15,fontWeight:"bold",color:T.textPrimary,
                fontFamily:"Georgia,serif"}}>{m.pts.toLocaleString()} pts</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={T.goldMid}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* You row */}
      <div style={{background:"#111111",borderRadius:14,
        border:`1px solid rgba(196,154,40,0.3)`,padding:"14px 16px",
        display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
        <div style={{width:28,textAlign:"center",flexShrink:0}}>
          <span style={{fontSize:17,fontWeight:"bold",color:T.goldMid,
            fontFamily:"Georgia,serif"}}>{YOU.rank}</span>
        </div>
        <div style={{width:38,height:38,borderRadius:"50%",flexShrink:0,
          background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:14,fontWeight:"bold",color:"#0a0a0a",fontFamily:"Georgia,serif"}}>
          Z
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:17,fontWeight:"bold",color:T.goldMid,
            fontFamily:"Georgia,serif"}}>{YOU.name}</div>
          <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",
            fontStyle:"italic"}}>{YOU.title}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:15,fontWeight:"bold",color:T.textPrimary,
            fontFamily:"Georgia,serif"}}>{YOU.pts} pts</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill={T.goldMid}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
      </div>

      {/* Footer */}
      <div style={{background:"#111111",borderRadius:14,
        border:`1px solid rgba(196,154,40,0.12)`,padding:"16px",
        display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:44,height:44,borderRadius:"50%",flexShrink:0,
          background:"rgba(196,154,40,0.08)",border:`1px solid rgba(196,154,40,0.2)`,
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="1.8">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
          </svg>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:"bold",color:T.textPrimary,
            fontFamily:"Georgia,serif",marginBottom:3}}>Rankings update every hour</div>
          <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",lineHeight:1.5}}>
            Earn points by logging smokes, completing challenges, writing reviews, and staying active in the community.
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="rgba(196,154,40,0.3)" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </div>
  );
}

// ── CLUB TAB ───────────────────────────────────────────────────────────────
// ── CLUB TAB — section header w/ optional badge ─────────────────────────────
function ClubSectionHeader({icon,title,badge,onViewAll}:{
  icon:React.ReactNode;title:string;
  badge?:'buildable'|'phase2';
  onViewAll?:()=>void;
}){
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:10,flexShrink:0,
          background:"rgba(196,154,40,0.08)",border:`1px solid rgba(196,154,40,0.2)`,
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          {icon}
        </div>
        <div style={{fontSize:18,fontWeight:"bold",color:T.textPrimary,
          fontFamily:"Georgia,serif"}}>{title}</div>
      </div>
      {onViewAll&&(
        <button onClick={onViewAll} style={{background:"transparent",border:"none",
          cursor:"pointer",display:"flex",alignItems:"center",gap:4,
          color:T.goldMid,fontSize:12,fontFamily:"Georgia,serif",letterSpacing:0.5}}>
          View All
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// ── CLUB TAB — main hub (single scroll, drill-down architecture) ───────────
export function ClubTab() {
  const {userId}=useSyncContext();
  const {isPro,loading:tierLoading}=useMembership();
  const [upgrading,setUpgrading]=useState(false);
  const handleUpgrade=async()=>{
    if(!userId) return;
    setUpgrading(true);
    try{
      const res=await fetch("/api/stripe/checkout",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({priceId:process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID||"",userId,mode:"subscription"})
      });
      const data=await res.json();
      if(data.url) window.location.href=data.url;
    }catch(e){console.error("[stripe]",e);}
    setUpgrading(false);
  };

  const [view,setView]=useState<'home'|'challenges'|'achievements'|'group'|'create_group'|'group_detail'>('home');
  const [prevView,setPrevView]=useState<string>('home');
  const navigate=(v:string)=>{setPrevView(view);setView(v as any);};
  const [groups,setGroups]=useState<any[]>(()=>{
    try{const s=localStorage.getItem('mh_groups');return s?JSON.parse(s):[];}catch{return[];}
  });
  const [selectedGroup,setSelectedGroup]=useState<any|null>(null);
  const [createForm,setCreateForm]=useState({
    name:"",goal:"",prize:"",penalty:"",duration:"1 week",members:""
  });
  const [invites,setInvites]=useState<{type:'email'|'phone';value:string}[]>([]);
  const [inviteInput,setInviteInput]=useState("");
  const [inviteType,setInviteType]=useState<'email'|'phone'>('email');
  const [createdLink,setCreatedLink]=useState<string|null>(null);
  const [linkCopied,setLinkCopied]=useState(false);
  const [mounted,setMounted]=useState(false);
  const [cigars,setCigars]=useState<any[]>([]);
  const [notes,setNotes]=useState<any[]>([]);

  useEffect(()=>{
    try{const s=localStorage.getItem('mh_cigars');if(s)setCigars(JSON.parse(s));}catch{}
    try{const s=localStorage.getItem('mh_notes');if(s)setNotes(JSON.parse(s));}catch{}
    setMounted(true);
  },[]);

  const totalCigars=mounted?cigars.reduce((a:number,c:any)=>a+(c.count||0),0):0;
  const uniqueBrands=mounted?new Set(cigars.map((c:any)=>c.brand)).size:0;

  // ── PRO GATE ──────────────────────────────────────────────────────────────
  if(!tierLoading&&!isPro){
    return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        minHeight:"calc(100vh - 180px)",padding:"0 32px",textAlign:"center"}}>
        <div style={{width:64,height:64,borderRadius:16,
          background:"linear-gradient(135deg,#8B6914,#C49A28)",
          display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div style={{fontSize:20,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:8}}>
          Social Club is a Pro feature
        </div>
        <div style={{fontSize:14,color:T.textMuted,fontFamily:"Georgia,serif",lineHeight:1.5,marginBottom:24}}>
          Unlock leaderboards, challenges, achievements, and group competitions with fellow enthusiasts.
        </div>
        <button
          onClick={handleUpgrade}
          disabled={upgrading}
          style={{padding:"14px 28px",
            background:"linear-gradient(135deg,#8B6914,#C49A28)",
            border:"none",borderRadius:12,color:"#0a0a0a",
            fontSize:15,fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif",
            opacity:upgrading?0.7:1}}>
          {upgrading?"Redirecting to checkout…":"Upgrade to Pro — $59.99/yr"}
        </button>
      </div>
    );
  }

  // ── DETAIL SCREENS ────────────────────────────────────────────────────────
  if(view==='challenges'){
    return (
      <div style={{paddingBottom:100}}>
        <div style={{padding:"24px 20px 0"}}>
          <button onClick={()=>setView('home')} style={{background:"transparent",border:"none",
            cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:14,
            color:T.goldMid,fontSize:13,fontFamily:"Georgia,serif"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Club
          </button>
          <div style={{fontSize:30,fontWeight:"bold",color:T.textPrimary,
            fontFamily:"Georgia,serif",lineHeight:1,marginBottom:16}}>Official Challenges</div>
        </div>
        <ChallengesTab/>
      </div>
    );
  }

  if(view==='achievements'){
    return (
      <div style={{paddingBottom:100}}>
        <div style={{padding:"24px 20px 0"}}>
          <button onClick={()=>setView('home')} style={{background:"transparent",border:"none",
            cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:14,
            color:T.goldMid,fontSize:13,fontFamily:"Georgia,serif"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Club
          </button>
          <div style={{fontSize:30,fontWeight:"bold",color:T.textPrimary,
            fontFamily:"Georgia,serif",lineHeight:1,marginBottom:16}}>Achievements</div>
        </div>
        <AchievementsTab/>
      </div>
    );
  }

  // ── PHASE 2 BADGE ─────────────────────────────────────────────────────────
  const Phase2Badge=()=>(
    <div style={{fontSize:9,fontWeight:"bold",color:"#7eb8e0",
      background:"rgba(110,160,224,0.12)",border:"1px solid rgba(110,160,224,0.3)",
      borderRadius:6,padding:"3px 8px",letterSpacing:1,textTransform:"uppercase",
      fontFamily:"Georgia,serif",whiteSpace:"nowrap"}}>
      Phase 2
    </div>
  );

  // ── ALL GROUPS VIEW ─────────────────────────────────────────────────────
  if(view==='group'){
    return(
      <div style={{paddingBottom:100}}>
        <div style={{padding:"24px 20px 0"}}>
          <button onClick={()=>setView('home')} style={{background:"transparent",border:"none",
            cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:14,
            color:T.goldMid,fontSize:13,fontFamily:"Georgia,serif"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Club
          </button>
          <div style={{fontSize:30,fontWeight:"bold",color:"#ffffff",
            fontFamily:"Georgia,serif",lineHeight:1,marginBottom:4}}>My Challenges</div>
          <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",marginBottom:20}}>
            Groups you created or were invited to
          </div>
        </div>
        <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:12}}>
          {groups.length===0?(
            /* ── PLACEHOLDER LEADERBOARD CARD ── */
            <div style={{background:"#111111",borderRadius:16,
              border:`1px solid rgba(196,154,40,0.15)`,overflow:"hidden"}}>
              {/* Challenge name header */}
              <div style={{padding:"16px 16px 12px",borderBottom:`1px solid rgba(196,154,40,0.1)`}}>
                <div style={{fontSize:11,color:T.textMuted,letterSpacing:2,
                  textTransform:"uppercase",fontFamily:"Georgia,serif",marginBottom:4}}>
                  Active Challenge
                </div>
                <div style={{fontSize:18,fontWeight:"bold",color:"#ffffff",
                  fontFamily:"Georgia,serif"}}>Friday Foursome Challenge</div>
                <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",marginTop:2}}>
                  Smoke 5 different Padrón cigars · 3 days left
                </div>
              </div>
              {/* Top 3 leaderboard */}
              <div style={{padding:"14px 16px"}}>
                <div style={{fontSize:11,color:T.textMuted,letterSpacing:2,
                  textTransform:"uppercase",fontFamily:"Georgia,serif",marginBottom:12}}>
                  Leaderboard
                </div>
                {[
                  {rank:1,name:"Zebulon B.",progress:80,medal:"/Gold_Medal.png"},
                  {rank:2,name:"Marcus T.",progress:60,medal:"/Silver_Medal.png"},
                  {rank:3,name:"Andre W.",progress:40,medal:"/Bronze_Medal.png"},
                ].map((m,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                    <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,overflow:"hidden"}}>
                      <img src={m.medal} alt={`#${m.rank}`}
                        style={{width:"100%",height:"100%",objectFit:"cover"}}
                        onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:"bold",color:"#ffffff",
                        fontFamily:"Georgia,serif",marginBottom:4}}>{m.name}</div>
                      <div style={{height:4,background:"rgba(0,0,0,0.4)",borderRadius:4,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${m.progress}%`,
                          background:i===0?`linear-gradient(90deg,${T.goldDark},${T.goldMid})`
                            :i===1?"rgba(192,192,192,0.6)":"rgba(205,127,50,0.6)",
                          borderRadius:4}}/>
                      </div>
                    </div>
                    <div style={{fontSize:13,fontWeight:"bold",color:T.goldMid,
                      fontFamily:"Georgia,serif",flexShrink:0}}>{m.progress}%</div>
                  </div>
                ))}
                {/* Drill down to full group */}
                <button onClick={()=>{navigate('group_detail');setSelectedGroup({id:0,name:"Friday Foursome Challenge",goal:"Smoke 5 different Padrón cigars",prize:"Winner gets a bottle of bourbon",penalty:"Loser buys the next round",duration:"1 week",createdAt:new Date(Date.now()-3*24*60*60*1000).toISOString(),members:["Marcus T.","Andre W.","James K.","Denise R."],leaderboard:[{name:"Zebulon B.",initials:"ZB",progress:80},{name:"Marcus T.",initials:"MT",progress:60},{name:"Andre W.",initials:"AW",progress:40},{name:"James K.",initials:"JK",progress:20},{name:"Denise R.",initials:"DR",progress:10}]});setView('group_detail');}}
                  style={{width:"100%",marginTop:4,padding:"11px",background:"transparent",
                    border:`1px solid rgba(196,154,40,0.2)`,borderRadius:10,cursor:"pointer",
                    color:T.goldMid,fontSize:13,fontFamily:"Georgia,serif",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  View Full Group
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>
          ):groups.map((g:any,i:number)=>{
            const daysLeft=Math.max(0,Math.ceil((new Date(g.createdAt).getTime()+
              (g.duration==="1 week"?7:g.duration==="2 weeks"?14:30)*24*60*60*1000-Date.now())/(1000*60*60*24)));
            const memberCount=(g.members||[]).length+1;
            const leaderboard=(g.leaderboard||[]).slice(0,3);
            return(
              <div key={i} style={{background:"#111111",borderRadius:16,
                border:`1px solid rgba(196,154,40,0.15)`,overflow:"hidden",cursor:"pointer"}}
                onClick={()=>{setSelectedGroup(g);navigate('group_detail');}}>
                {/* Challenge header */}
                <div style={{padding:"16px 16px 12px",borderBottom:`1px solid rgba(196,154,40,0.1)`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:18,fontWeight:"bold",color:"#ffffff",
                        fontFamily:"Georgia,serif",marginBottom:2}}>{g.name}</div>
                      <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif"}}>{g.goal}</div>
                    </div>
                    <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",
                      background:"rgba(0,0,0,0.3)",borderRadius:6,padding:"3px 8px",flexShrink:0}}>
                      {daysLeft}d left
                    </div>
                  </div>
                  <div style={{display:"flex",gap:12,marginTop:8}}>
                    <div style={{fontSize:12,color:T.goldMid,fontFamily:"Georgia,serif"}}>🏅 {g.prize||"—"}</div>
                    <div style={{fontSize:12,color:"rgba(224,80,80,0.8)",fontFamily:"Georgia,serif"}}>⚡ {g.penalty||"—"}</div>
                  </div>
                </div>
                {/* Leaderboard top 3 */}
                <div style={{padding:"14px 16px"}}>
                  <div style={{fontSize:11,color:T.textMuted,letterSpacing:2,
                    textTransform:"uppercase",fontFamily:"Georgia,serif",marginBottom:12}}>
                    Leaderboard
                  </div>
                  {leaderboard.length===0?(
                    <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",
                      fontStyle:"italic",textAlign:"center",paddingBottom:4}}>
                      No progress yet — be first!
                    </div>
                  ):leaderboard.map((m:any,li:number)=>{
                    const medals=["/Gold_Medal.png","/Silver_Medal.png","/Bronze_Medal.png"];
                    return(
                      <div key={li} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                        <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,overflow:"hidden"}}>
                          <img src={medals[li]} alt={`#${li+1}`}
                            style={{width:"100%",height:"100%",objectFit:"cover"}}
                            onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:"bold",color:"#ffffff",
                            fontFamily:"Georgia,serif",marginBottom:3}}>{m.name}</div>
                          <div style={{height:4,background:"rgba(0,0,0,0.4)",borderRadius:4,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${m.progress||0}%`,
                              background:li===0?`linear-gradient(90deg,${T.goldDark},${T.goldMid})`
                                :li===1?"rgba(192,192,192,0.5)":"rgba(205,127,50,0.5)",
                              borderRadius:4}}/>
                          </div>
                        </div>
                        <div style={{fontSize:12,color:T.goldMid,fontFamily:"Georgia,serif",
                          fontWeight:"bold",flexShrink:0}}>{m.progress||0}%</div>
                      </div>
                    );
                  })}
                  <div style={{display:"flex",justifyContent:"space-between",
                    alignItems:"center",marginTop:8}}>
                    <div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif"}}>
                      {memberCount} member{memberCount!==1?"s":""}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4,
                      color:T.goldMid,fontSize:12,fontFamily:"Georgia,serif"}}>
                      View Full Group
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── CREATE GROUP CHALLENGE VIEW ─────────────────────────────────────────
  if(view==='create_group'){
    const saveGroup=()=>{
      if(!createForm.name.trim()||!createForm.goal.trim()) return;
      const newGroup={
        id:Date.now(),
        name:createForm.name,
        goal:createForm.goal,
        prize:createForm.prize,
        penalty:createForm.penalty,
        duration:createForm.duration,
        members:invites.map(inv=>inv.value),
        invites:[...invites],
        createdAt:new Date().toISOString(),
        joinId:Math.random().toString(36).slice(2,10),
        leaderboard:[
          {name:"You",progress:0,initials:"ZB"},
        ],
      };
      const updated=[...groups,newGroup];
      setGroups(updated);
      try{localStorage.setItem('mh_groups',JSON.stringify(updated));}catch{}
      const link=`${window.location.origin}/join/${newGroup.joinId}`;
      setCreatedLink(link);
      setCreateForm({name:"",goal:"",prize:"",penalty:"",duration:"1 week",members:""});
      setInvites([]);
      setInviteInput("");
    };
    const fi2={width:"100%",background:"#111111",border:`1px solid rgba(196,154,40,0.2)`,
      borderRadius:10,padding:"12px 14px",color:"#ffffff",fontSize:15,
      fontFamily:"Georgia,serif",outline:"none",boxSizing:"border-box" as const,marginBottom:12};
    return(
      <div style={{paddingBottom:100}}>
        <div style={{padding:"24px 20px 0"}}>
          <button onClick={()=>setView('home')} style={{background:"transparent",border:"none",
            cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:14,
            color:T.goldMid,fontSize:13,fontFamily:"Georgia,serif"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Club
          </button>
          <div style={{fontSize:30,fontWeight:"bold",color:"#ffffff",
            fontFamily:"Georgia,serif",lineHeight:1,marginBottom:20}}>Create Challenge</div>
        </div>
        <div style={{padding:"0 20px"}}>
          <div style={{fontSize:11,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",
            fontFamily:"Georgia,serif",marginBottom:6}}>Challenge Name</div>
          <input value={createForm.name} onChange={e=>setCreateForm({...createForm,name:e.target.value})}
            placeholder="e.g. Friday Foursome" style={fi2}/>

          <div style={{fontSize:11,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",
            fontFamily:"Georgia,serif",marginBottom:6}}>Goal</div>
          <input value={createForm.goal} onChange={e=>setCreateForm({...createForm,goal:e.target.value})}
            placeholder="e.g. Smoke 3 Padrón cigars" style={fi2}/>

          <div style={{fontSize:11,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",
            fontFamily:"Georgia,serif",marginBottom:6}}>Prize 🏅</div>
          <input value={createForm.prize} onChange={e=>setCreateForm({...createForm,prize:e.target.value})}
            placeholder="e.g. Winner gets a bottle of bourbon" style={fi2}/>

          <div style={{fontSize:11,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",
            fontFamily:"Georgia,serif",marginBottom:6}}>Penalty ⚡</div>
          <input value={createForm.penalty} onChange={e=>setCreateForm({...createForm,penalty:e.target.value})}
            placeholder="e.g. Loser buys the next round" style={fi2}/>

          <div style={{fontSize:11,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",
            fontFamily:"Georgia,serif",marginBottom:6}}>Duration</div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {["1 week","2 weeks","1 month"].map(d=>(
              <button key={d} onClick={()=>setCreateForm({...createForm,duration:d})}
                style={{flex:1,padding:"10px",background:"#111111",
                  border:`1px solid ${createForm.duration===d?T.goldMid:"rgba(196,154,40,0.2)"}`,
                  borderRadius:10,cursor:"pointer",fontFamily:"Georgia,serif",
                  color:createForm.duration===d?"#ffffff":T.textMuted,fontSize:12}}>
                {d}
              </button>
            ))}
          </div>

          <div style={{fontSize:11,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",
            fontFamily:"Georgia,serif",marginBottom:8}}>Invite Members</div>

          {/* Type toggle */}
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {(['email','phone'] as const).map(type=>(
              <button key={type} onClick={()=>setInviteType(type)}
                style={{flex:1,padding:"8px",background:"#111111",fontFamily:"Georgia,serif",
                  border:`1px solid ${inviteType===type?T.goldMid:"rgba(196,154,40,0.2)"}`,
                  borderRadius:8,cursor:"pointer",fontSize:12,
                  color:inviteType===type?"#ffffff":T.textMuted}}>
                {type==="email"?"✉️ Email":"📱 Phone"}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <input value={inviteInput}
              onChange={e=>setInviteInput(e.target.value)}
              onKeyDown={e=>{
                if(e.key==="Enter"&&inviteInput.trim()){
                  setInvites(prev=>[...prev,{type:inviteType,value:inviteInput.trim()}]);
                  setInviteInput("");
                }
              }}
              placeholder={inviteType==="email"?"friend@email.com":"+1 (555) 000-0000"}
              style={{...fi2,flex:1,marginBottom:0}}/>
            <button onClick={()=>{
                if(!inviteInput.trim()) return;
                setInvites(prev=>[...prev,{type:inviteType,value:inviteInput.trim()}]);
                setInviteInput("");
              }}
              style={{padding:"0 16px",background:"rgba(196,154,40,0.1)",
                border:`1px solid rgba(196,154,40,0.3)`,borderRadius:10,
                cursor:"pointer",color:T.goldMid,fontSize:20,fontWeight:"bold",lineHeight:1,flexShrink:0}}>+</button>
          </div>

          {/* Invite chips */}
          {invites.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
              {invites.map((inv,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,
                  background:"rgba(196,154,40,0.07)",border:`1px solid rgba(196,154,40,0.2)`,
                  borderRadius:20,padding:"5px 10px"}}>
                  <span style={{fontSize:11,color:"#ffffff",fontFamily:"Georgia,serif"}}>
                    {inv.type==="email"?"✉️":"📱"} {inv.value}
                  </span>
                  <button onClick={()=>setInvites(prev=>prev.filter((_,j)=>j!==i))}
                    style={{background:"none",border:"none",cursor:"pointer",
                      color:"rgba(255,255,255,0.4)",fontSize:14,lineHeight:1,padding:"0 2px"}}>×</button>
                </div>
              ))}
            </div>
          )}

          {invites.length===0&&(
            <div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif",marginBottom:16,fontStyle:"italic"}}>
              Add email or phone numbers above. A shareable link will also be generated.
            </div>
          )}

          {/* Post-creation share link panel */}
          {createdLink&&(
            <div style={{background:"rgba(61,214,140,0.06)",border:"1px solid rgba(61,214,140,0.25)",
              borderRadius:12,padding:"16px",marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:"bold",color:"#3dd68c",fontFamily:"Georgia,serif",marginBottom:8}}>
                ✓ Challenge created! Share the link:
              </div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",fontFamily:"Georgia,serif",
                wordBreak:"break-all",marginBottom:10,padding:"8px 10px",
                background:"rgba(0,0,0,0.3)",borderRadius:8}}>{createdLink}</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={async()=>{
                    try{await navigator.clipboard.writeText(createdLink);setLinkCopied(true);setTimeout(()=>setLinkCopied(false),2500);}catch{}
                  }}
                  style={{flex:1,padding:"10px",background:"rgba(196,154,40,0.1)",
                    border:`1px solid rgba(196,154,40,0.3)`,borderRadius:10,cursor:"pointer",
                    color:linkCopied?"#3dd68c":T.goldMid,fontSize:13,fontFamily:"Georgia,serif",fontWeight:"bold"}}>
                  {linkCopied?"✓ Copied!":"Copy Link"}
                </button>
                {typeof navigator!=="undefined"&&"share" in navigator&&(
                  <button onClick={()=>navigator.share({title:createForm.name||"Challenge",text:"Join my cigar challenge on Mario's Humidor!",url:createdLink}).catch(()=>{})}
                    style={{flex:1,padding:"10px",background:"rgba(196,154,40,0.1)",
                      border:`1px solid rgba(196,154,40,0.3)`,borderRadius:10,cursor:"pointer",
                      color:T.goldMid,fontSize:13,fontFamily:"Georgia,serif"}}>
                    Share
                  </button>
                )}
              </div>
              <button onClick={()=>{setCreatedLink(null);setLinkCopied(false);setView('home');}}
                style={{width:"100%",marginTop:10,padding:"12px",background:"transparent",
                  border:"none",cursor:"pointer",color:T.textMuted,
                  fontSize:13,fontFamily:"Georgia,serif"}}>
                Done
              </button>
            </div>
          )}

          {!createdLink&&(
            <button onClick={saveGroup}
              style={{width:"100%",padding:"16px",
                background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                border:"none",borderRadius:12,
                color:"#0a0a0a",fontSize:16,fontWeight:"bold",
                cursor:"pointer",fontFamily:"Georgia,serif"}}>
              Create Challenge
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── GROUP DETAIL VIEW ────────────────────────────────────────────────────
  if(view==='group_detail'&&selectedGroup){
    const g=selectedGroup;
    const daysLeft=Math.max(0,Math.ceil((new Date(g.createdAt).getTime()+
      (g.duration==="1 week"?7:g.duration==="2 weeks"?14:30)*24*60*60*1000-Date.now())/(1000*60*60*24)));
    const leaderboard=g.leaderboard||[];
    const sorted=[...leaderboard].sort((a:any,b:any)=>b.progress-a.progress);
    return(
      <div style={{paddingBottom:100}}>
        <div style={{padding:"24px 20px 0"}}>
          <button onClick={()=>setView(prevView as any)} style={{background:"transparent",border:"none",
            cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:14,
            color:T.goldMid,fontSize:13,fontFamily:"Georgia,serif"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {prevView==='group'?'My Challenges':'Club'}
          </button>
          <div style={{fontSize:28,fontWeight:"bold",color:"#ffffff",
            fontFamily:"Georgia,serif",lineHeight:1.1,marginBottom:4}}>{g.name}</div>
          <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",marginBottom:20}}>{daysLeft} days left</div>
        </div>
        <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:14}}>

          {/* Goal card */}
          <div style={{background:"#111111",borderRadius:14,
            border:`1px solid rgba(196,154,40,0.15)`,padding:"16px"}}>
            <div style={{fontSize:11,color:T.goldMid,letterSpacing:2,textTransform:"uppercase",
              fontFamily:"Georgia,serif",marginBottom:8}}>Goal</div>
            <div style={{fontSize:16,color:"#ffffff",fontFamily:"Georgia,serif"}}>{g.goal}</div>
          </div>

          {/* Prize & Penalty */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{background:"#111111",borderRadius:14,
              border:`1px solid rgba(196,154,40,0.15)`,padding:"14px"}}>
              <div style={{fontSize:18,marginBottom:6}}>🏅</div>
              <div style={{fontSize:11,color:T.goldMid,fontFamily:"Georgia,serif",marginBottom:4}}>Prize</div>
              <div style={{fontSize:13,color:"#ffffff",fontFamily:"Georgia,serif"}}>{g.prize||"—"}</div>
            </div>
            <div style={{background:"#111111",borderRadius:14,
              border:`1px solid rgba(196,154,40,0.15)`,padding:"14px"}}>
              <div style={{fontSize:18,marginBottom:6}}>⚡</div>
              <div style={{fontSize:11,color:"rgba(224,80,80,0.8)",fontFamily:"Georgia,serif",marginBottom:4}}>Penalty</div>
              <div style={{fontSize:13,color:"#ffffff",fontFamily:"Georgia,serif"}}>{g.penalty||"—"}</div>
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{background:"#111111",borderRadius:14,
            border:`1px solid rgba(196,154,40,0.15)`,padding:"16px"}}>
            <div style={{fontSize:17,fontWeight:"bold",color:"#ffffff",
              fontFamily:"Georgia,serif",marginBottom:14}}>Leaderboard</div>
            {sorted.length===0?(
              <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",
                fontStyle:"italic",textAlign:"center",padding:"10px 0"}}>
                No progress logged yet
              </div>
            ):sorted.map((m:any,i:number)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:24,fontSize:14,fontWeight:"bold",color:
                  i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":T.textMuted,
                  fontFamily:"Georgia,serif",flexShrink:0,textAlign:"center"}}>
                  {i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}
                </div>
                <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,
                  background:"rgba(196,154,40,0.12)",border:`1px solid rgba(196,154,40,0.2)`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:13,fontWeight:"bold",color:T.goldMid,fontFamily:"Georgia,serif"}}>
                  {m.initials||m.name?.charAt(0)||"?"}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:"bold",color:"#ffffff",
                    fontFamily:"Georgia,serif",marginBottom:4}}>{m.name}</div>
                  <div style={{height:4,background:"rgba(0,0,0,0.4)",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${m.progress||0}%`,
                      background:i===0?`linear-gradient(90deg,${T.goldDark},${T.goldMid})`:"rgba(196,154,40,0.4)",
                      borderRadius:4}}/>
                  </div>
                </div>
                <div style={{fontSize:13,color:T.goldMid,fontFamily:"Georgia,serif",
                  fontWeight:"bold",flexShrink:0}}>{m.progress||0}%</div>
              </div>
            ))}
          </div>

          {/* Members */}
          {g.members&&g.members.length>0&&(
            <div style={{background:"#111111",borderRadius:14,
              border:`1px solid rgba(196,154,40,0.15)`,padding:"16px"}}>
              <div style={{fontSize:17,fontWeight:"bold",color:"#ffffff",
                fontFamily:"Georgia,serif",marginBottom:12}}>Members</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {g.members.map((m:string,i:number)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:6,
                    background:"rgba(196,154,40,0.06)",border:`1px solid rgba(196,154,40,0.15)`,
                    borderRadius:20,padding:"5px 12px"}}>
                    <div style={{width:22,height:22,borderRadius:"50%",
                      background:"rgba(196,154,40,0.15)",display:"flex",alignItems:"center",
                      justifyContent:"center",fontSize:10,fontWeight:"bold",
                      color:T.goldMid,fontFamily:"Georgia,serif"}}>
                      {m.charAt(0).toUpperCase()}
                    </div>
                    <div style={{fontSize:12,color:"#ffffff",fontFamily:"Georgia,serif"}}>{m}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delete */}
          <button onClick={()=>{
            if(window.confirm("Delete this challenge?")){
              const updated=groups.filter((g2:any)=>g2.id!==g.id);
              setGroups(updated);
              try{localStorage.setItem('mh_groups',JSON.stringify(updated));}catch{}
              setView('home');
            }
          }}
            style={{background:"transparent",border:"1px solid rgba(224,80,80,0.3)",
              borderRadius:12,padding:"14px",cursor:"pointer",
              color:"#e05050",fontSize:14,fontFamily:"Georgia,serif"}}>
            Delete Challenge
          </button>
        </div>
      </div>
    );
  }

  // ── HOME (SUMMARY) VIEW ───────────────────────────────────────────────────
  return (
    <div style={{paddingBottom:100}}>
      {/* Header */}
      <div style={{padding:"24px 20px 0"}}>
        <div style={{fontSize:36,fontWeight:"bold",color:T.textPrimary,
          fontFamily:"Georgia,serif",lineHeight:1,marginBottom:4}}>The Club</div>
        <div style={{fontSize:12,color:T.goldMid,fontFamily:"Georgia,serif",
          fontStyle:"italic",marginBottom:24}}>
          Connect. Compete. Celebrate.
        </div>
      </div>

      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:14}}>

        {/* ── 1. MY PROGRESS ───────────────────────────────────────────── */}
        <div style={{background:"#111111",borderRadius:16,
          border:`1px solid rgba(196,154,40,0.15)`,padding:"18px 16px"}}>
          <ClubSectionHeader
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="1.8">
              <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
            </svg>}
            title="My Progress"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {[
              {val:totalCigars,label:"Cigars Logged"},
              {val:uniqueBrands,label:"Brands Explored"},
              {val:0,label:"Lounges Visited"},
              {val:0,label:"Day Streak"},
            ].map((s,i)=>(
              <div key={i} style={{textAlign:"center",background:"rgba(0,0,0,0.3)",
                borderRadius:10,border:"1px solid rgba(196,154,40,0.1)",padding:"10px 4px"}}>
                <div style={{fontSize:20,fontWeight:"bold",color:"#ffffff",
                  fontFamily:"Georgia,serif",lineHeight:1,marginBottom:4}}>{s.val}</div>
                <div style={{fontSize:9,color:"#ffffff",fontFamily:"Georgia,serif",
                  lineHeight:1.2}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. OFFICIAL CHALLENGES ───────────────────────────────────── */}
        <div onClick={()=>setView('challenges')} style={{background:"#111111",borderRadius:16,
          border:`1px solid rgba(196,154,40,0.15)`,padding:"18px 16px",cursor:"pointer"}}>
          <ClubSectionHeader
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>}
            title="Official Challenges"
            onViewAll={()=>setView('challenges')}/>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:48,height:48,borderRadius:"50%",flexShrink:0,
              background:"rgba(196,154,40,0.08)",border:`1px solid rgba(196,154,40,0.2)`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:15,fontWeight:"bold",color:T.goldMid,fontFamily:"Georgia,serif"}}>
              {Math.min(uniqueBrands,10)}/10
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:"bold",color:T.textPrimary,
                fontFamily:"Georgia,serif",marginBottom:4}}>Smoke 10 Different Brands</div>
              <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(uniqueBrands*10,100)}%`,
                  background:`linear-gradient(90deg,${T.goldDark},${T.goldMid})`,borderRadius:3}}/>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. ACHIEVEMENTS ───────────────────────────────────────────── */}
        <div onClick={()=>setView('achievements')} style={{background:"#111111",borderRadius:16,
          border:`1px solid rgba(196,154,40,0.15)`,padding:"18px 16px",cursor:"pointer"}}>
          <ClubSectionHeader
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="1.8">
              <circle cx="12" cy="8" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/>
            </svg>}
            title="Achievements"
            onViewAll={()=>setView('achievements')}/>
          <div style={{display:"flex",gap:10,overflowX:"auto"}}>
            {[
              {img:"/Smoking.png",color:T.goldMid},
              {img:"/chart_bar.png",color:"#3dd68c"},
              {img:"/Community.png",color:"#b67ee0"},
              {img:"/Special.png",color:"#6a9fe0"},
            ].map((cat,i)=>(
              <div key={i} style={{width:52,height:52,borderRadius:"50%",flexShrink:0,
                background:"#000",border:`1px solid rgba(196,154,40,0.2)`,
                overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <img src={cat.img} alt=""
                  style={{width:"100%",height:"100%",objectFit:"cover"}}
                  onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. GROUP CHALLENGES ───────────────────────────────────────── */}
        <div style={{background:"#111111",borderRadius:16,
          border:`1px solid rgba(196,154,40,0.15)`,padding:"18px 16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:10,flexShrink:0,
                background:"rgba(196,154,40,0.08)",border:`1px solid rgba(196,154,40,0.2)`,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="1.8">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div style={{fontSize:18,fontWeight:"bold",color:T.textPrimary,
                fontFamily:"Georgia,serif"}}>Group Challenges</div>
            </div>
            {/* Drill down to all groups */}
            <button onClick={()=>setView('group')}
              style={{background:"transparent",border:"none",cursor:"pointer",
                display:"flex",alignItems:"center",gap:4,
                color:T.goldMid,fontSize:13,fontFamily:"Georgia,serif"}}>
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
          {groups.length===0?(
            <div onClick={()=>setView('create_group')}
              style={{borderRadius:12,overflow:"hidden",margin:"0 -2px",cursor:"pointer"}}>
              <img src="/up_for_the_challenge.png" alt="Up for the Challenge"
                style={{width:"100%",display:"block",objectFit:"cover"}}
                onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {groups.slice(0,2).map((g:any,i:number)=>(
                <div key={i} onClick={()=>{setSelectedGroup(g);navigate('group_detail');}}
                  style={{background:"rgba(0,0,0,0.3)",borderRadius:12,
                    border:`1px solid rgba(196,154,40,0.1)`,padding:"12px 14px",cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div style={{fontSize:14,fontWeight:"bold",color:"#ffffff",
                      fontFamily:"Georgia,serif"}}>{g.name}</div>
                    <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif"}}>{g.duration}</div>
                  </div>
                  <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",marginBottom:8}}>{g.goal}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:11,color:T.goldMid,fontFamily:"Georgia,serif"}}>
                      🏅 {g.prize||"—"}
                    </div>
                    <div style={{fontSize:11,color:"rgba(224,80,80,0.8)",fontFamily:"Georgia,serif"}}>
                      ⚡ {g.penalty||"—"}
                    </div>
                  </div>
                </div>
              ))}
              {/* Create button only shows when groups exist */}
              <button onClick={()=>setView('create_group')}
                style={{width:"100%",marginTop:4,padding:"12px",background:"transparent",
                  border:`1px solid rgba(196,154,40,0.25)`,borderRadius:10,cursor:"pointer",
                  color:"#ffffff",fontSize:13,fontFamily:"Georgia,serif",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <span style={{fontSize:16,color:T.goldMid}}>+</span>
                <span>Create a Challenge</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 5. EVENTS (PHASE 2) ───────────────────────────────────────── */}
        <div style={{background:"#111111",borderRadius:16,
          border:`1px solid rgba(196,154,40,0.12)`,padding:"18px 16px",opacity:0.85}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:10,flexShrink:0,
                background:"rgba(196,154,40,0.08)",border:`1px solid rgba(196,154,40,0.2)`,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div style={{fontSize:18,fontWeight:"bold",color:T.textPrimary,
                fontFamily:"Georgia,serif"}}>Events</div>
            </div>
            <Phase2Badge/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:48,height:48,borderRadius:12,flexShrink:0,
              background:"rgba(196,154,40,0.1)",border:`1px solid rgba(196,154,40,0.2)`,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontSize:9,color:T.goldMid,fontFamily:"Georgia,serif",fontWeight:"bold"}}>JUN</div>
              <div style={{fontSize:16,color:T.textPrimary,fontFamily:"Georgia,serif",fontWeight:"bold",lineHeight:1}}>14</div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:"bold",color:T.textPrimary,
                fontFamily:"Georgia,serif",marginBottom:2}}>Cigars Under the Stars</div>
              <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif"}}>
                Havana Lounge · 7:00 PM
              </div>
            </div>
          </div>
        </div>

        {/* ── 6. ACTIVITY FEED (PHASE 2) ────────────────────────────────── */}
        <div style={{background:"#111111",borderRadius:16,
          border:`1px solid rgba(196,154,40,0.12)`,padding:"18px 16px",opacity:0.85}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:10,flexShrink:0,
                background:"rgba(196,154,40,0.08)",border:`1px solid rgba(196,154,40,0.2)`,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="1.8">
                  <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/>
                </svg>
              </div>
              <div style={{fontSize:18,fontWeight:"bold",color:T.textPrimary,
                fontFamily:"Georgia,serif"}}>Activity Feed</div>
            </div>
            <Phase2Badge/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {name:"Mike R.",action:"logged a cigar",detail:"Padrón 1964 Anniversary Series",time:"2h ago"},
              {name:"Lisa J.",action:"completed the challenge",detail:"Smoke 10 Different Brands",time:"5h ago"},
              {name:"Chris P.",action:"earned the Explorer badge",detail:"",time:"12h ago"},
            ].map((a,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,
                  background:"rgba(196,154,40,0.15)",display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:12,fontWeight:"bold",color:T.goldMid,
                  fontFamily:"Georgia,serif"}}>
                  {a.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,color:T.textPrimary,fontFamily:"Georgia,serif"}}>
                    <span style={{fontWeight:"bold"}}>{a.name}</span> {a.action}
                  </div>
                  {a.detail&&<div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif"}}>{a.detail}</div>}
                </div>
                <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",flexShrink:0}}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── ACHIEVEMENTS TAB ───────────────────────────────────────────────────────
