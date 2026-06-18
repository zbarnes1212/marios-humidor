"use client";
import React,{useState,useEffect} from "react";
import {useUser,useAuth} from "@clerk/nextjs";
import {T,getCigarImage,NOTES_INIT,useLang,useSyncContext} from "@/lib/constants";
import {SvgIcon} from "@/lib/ui";
import {MoreScreen} from "@/components/MoreScreen";

export function AchievementsTab() {
  const [mounted,setMounted]=useState(false);
  const [cigars,setCigars]=useState<any[]>([]);
  const [records,setRecords]=useState<any[]>([]);
  const [notes,setNotes]=useState<any[]>([]);
  const [humidorDays,setHumidorDays]=useState(0);

  useEffect(()=>{
    try{const s=localStorage.getItem('mh_cigars');if(s)setCigars(JSON.parse(s));}catch{}
    try{const s=localStorage.getItem('mh_records');if(s)setRecords(JSON.parse(s));}catch{}
    try{const s=localStorage.getItem('mh_notes');if(s)setNotes(JSON.parse(s));}catch{}
    // Check sensor history for 7 days of optimal readings
    fetch("/api/sensor-history?range=7D&device=Mario's%20Sensor")
      .then(r=>r.json())
      .then(d=>{
        const readings=d.data||[];
        const optimal=readings.filter((r:any)=>r.humidity>=65&&r.humidity<=72);
        const days=new Set(optimal.map((r:any)=>new Date(r.created_at).toDateString())).size;
        setHumidorDays(days);
      })
    setMounted(true);
  },[]);

  // Real data
  const cigarsInHumidor=mounted?cigars.length:0;
  const smokedCount=mounted?records.filter((r:any)=>r.status==="smoked").length:0;
  const uniqueBrands=mounted?new Set(cigars.map((c:any)=>c.brand).filter(Boolean)).size:0;
  const uniqueCountries=mounted?new Set(cigars.filter((c:any)=>c.origin).map((c:any)=>c.origin)).size:0;
  const totalNotes=mounted?notes.length:0;
  const notesWithFlavor=mounted?notes.filter((n:any)=>n.note&&n.note.length>10).length:0;
  const notesWithPairing=mounted?notes.filter((n:any)=>n.note&&n.note.toLowerCase().match(/pair|coffee|whiskey|bourbon|rum|beer|wine|spirit/)).length:0;
  const ligaCount=mounted?cigars.filter((c:any)=>
    (c.brand||"").toLowerCase().includes("liga")||(c.line||"").toLowerCase().includes("liga privada")
  ).length:0;
  const totalCigarsStored=mounted?cigars.reduce((a:number,c:any)=>a+(c.count||0),0):0;
  const smokedBrandsCount=mounted?new Set(records.filter((r:any)=>r.status==="smoked"&&r.brand).map((r:any)=>r.brand)).size:0;
  // Lounge Legend — count lounge searches
  const loungeSearchCount=mounted?parseInt(localStorage.getItem('mh_lounge_searches')||'0'):0;
  // Aging Master — check if any cigar has been stored 90+ days
  const now=Date.now();
  const hasAgedCigar=mounted?cigars.some((c:any)=>{
    if(!c.addedAt) return false;
    const days=(now-new Date(c.addedAt).getTime())/(1000*60*60*24);
    return days>=90;
  }):false;
  const maxAgeDays=mounted?Math.max(0,...cigars.map((c:any)=>{
    if(!c.addedAt) return 0;
    return Math.floor((now-new Date(c.addedAt).getTime())/(1000*60*60*24));
  })):0;

  type Ach={id:string;img:string;title:string;desc:string;current:number;goal:number;unlocked:boolean};
  const ACHIEVEMENTS:Ach[]=[
    // Smoking
    {id:"first_light",img:"/Smoking.png",title:"First Light",
      desc:"Smoke your first cigar",current:smokedCount,goal:1,unlocked:smokedCount>=1},
    {id:"seasoned",img:"/Smoke_streak_V1.png",title:"Seasoned Smoker",
      desc:"Smoke 10 cigars",current:smokedCount,goal:10,unlocked:smokedCount>=10},
    {id:"ten_brands",img:"/Smoke 10 Different Brands.png",title:"Brand Explorer",
      desc:"Smoke 10 different brands",current:smokedBrandsCount,goal:10,unlocked:smokedBrandsCount>=10},
    {id:"century",img:"/MH.png",title:"Century Club",
      desc:"Smoke 100 cigars",current:smokedCount,goal:100,unlocked:smokedCount>=100},
    // Collection
    {id:"first_purchase",img:"/Collection.png",title:"First Purchase",
      desc:"Add your first cigar to your humidor",current:cigarsInHumidor,goal:1,unlocked:cigarsInHumidor>=1},
    {id:"curator",img:"/curator.png",title:"Curator",
      desc:"Explore 5 different brands",current:uniqueBrands,goal:5,unlocked:uniqueBrands>=5},
    {id:"regional",img:"/Regional_explorer.png",title:"Regional Explorer",
      desc:"Collect cigars from 2 countries",current:uniqueCountries,goal:2,unlocked:uniqueCountries>=2},
    {id:"globe_trotter",img:"/World_Traveler_V1.png",title:"Globe Trotter",
      desc:"Collect cigars from 3 countries",current:uniqueCountries,goal:3,unlocked:uniqueCountries>=3},
    {id:"national",img:"/National_explorer.png",title:"National Explorer",
      desc:"Collect cigars from 5 countries",current:uniqueCountries,goal:5,unlocked:uniqueCountries>=5},
    {id:"humidor_legend",img:"/himidor_legend.png",title:"Humidor Legend",
      desc:"Store 50 cigars in your humidor",current:totalCigarsStored,goal:50,unlocked:totalCigarsStored>=50},
    // Community / Notes
    {id:"first_note",img:"/Tasting_Notes.png",title:"First Note",
      desc:"Log your first tasting note",current:totalNotes,goal:1,unlocked:totalNotes>=1},
    {id:"flavor_master",img:"/flavor_master.png",title:"Flavor Master",
      desc:"Log 5 detailed tasting notes",current:notesWithFlavor,goal:5,unlocked:notesWithFlavor>=5},
    {id:"pairing_master",img:"/pairing_master.png",title:"Pairing Master",
      desc:"Log 3 cigars with a pairing noted",current:notesWithPairing,goal:3,unlocked:notesWithPairing>=3},
    {id:"coffee",img:"/coffee_companion.png",title:"Coffee Companion",
      desc:"Log a cigar paired with coffee",current:notesWithPairing>=1?1:0,goal:1,unlocked:notesWithPairing>=1},
    {id:"storyteller",img:"/Special.png",title:"Storyteller",
      desc:"Log 10 tasting notes",current:totalNotes,goal:10,unlocked:totalNotes>=10},
    {id:"connoisseur",img:"/Community.png",title:"Connoisseur",
      desc:"Log 25 tasting notes",current:totalNotes,goal:25,unlocked:totalNotes>=25},
    // Special
    {id:"liga_hunter",img:"/Smoke_5_Liga_Privadas.png",title:"Liga Hunter",
      desc:"Have 3 Liga Privada cigars in your collection",current:ligaCount,goal:3,unlocked:ligaCount>=3},
    {id:"humidor_master",img:"/Humidor_Perfection_V1.png",title:"Humidor Master",
      desc:"Maintain ideal humidity for 7 days",current:humidorDays,goal:7,unlocked:humidorDays>=7},
    {id:"lounge_legend",img:"/Lounge_legend.png",title:"Lounge Legend",
      desc:"Ask Mario to find 3 cigar lounges",current:loungeSearchCount,goal:3,unlocked:loungeSearchCount>=3},
    {id:"aging_master",img:"/Aging_master.png",title:"Aging Master",
      desc:"Store a cigar for 90+ days",current:maxAgeDays,goal:90,unlocked:hasAgedCigar},
    {id:"aficionado",img:"/Trophy.png",title:"Aficionado",
      desc:"Unlock 10 other achievements",
      current:0,goal:10,unlocked:false},
    {id:"crown",img:"/Crown_.earned.png",title:"Crown Earned",
      desc:"Unlock all other achievements",
      current:0,goal:20,unlocked:false},
  ];

  // Compute aficionado and crown dynamically
  const earnedCount=ACHIEVEMENTS.filter(a=>a.unlocked&&a.id!=="aficionado"&&a.id!=="crown").length;
  const aficionado=ACHIEVEMENTS.find(a=>a.id==="aficionado")!;
  aficionado.current=earnedCount;
  aficionado.unlocked=earnedCount>=10;
  const crown=ACHIEVEMENTS.find(a=>a.id==="crown")!;
  crown.current=earnedCount;
  crown.unlocked=earnedCount>=20;

  const totalUnlocked=ACHIEVEMENTS.filter(a=>a.unlocked).length;

  return(
    <div style={{padding:"0 16px 24px"}}>
      {/* Header stats */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        marginBottom:20,background:"#111111",borderRadius:14,
        border:`1px solid rgba(196,154,40,0.2)`,padding:"16px"}}>
        <div>
          <div style={{fontSize:28,fontWeight:"bold",color:"#ffffff",
            fontFamily:"Georgia,serif",lineHeight:1}}>{totalUnlocked}</div>
          <div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif",marginTop:2}}>
            of {ACHIEVEMENTS.length} badges earned
          </div>
        </div>
        <div style={{flex:1,margin:"0 16px"}}>
          <div style={{height:6,background:"rgba(0,0,0,0.4)",borderRadius:6,overflow:"hidden"}}>
            <div style={{height:"100%",
              width:`${Math.round((totalUnlocked/ACHIEVEMENTS.length)*100)}%`,
              background:`linear-gradient(90deg,${T.goldDark},${T.goldMid})`,borderRadius:6}}/>
          </div>
          <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",marginTop:4}}>
            {Math.round((totalUnlocked/ACHIEVEMENTS.length)*100)}% complete
          </div>
        </div>
        <div style={{width:44,height:44,borderRadius:10,overflow:"hidden",flexShrink:0}}>
          <img src="/Trophy.png" alt="Trophy" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
      </div>

      {/* Full badge grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        {ACHIEVEMENTS.map(a=>{
          const pct=Math.min(Math.round((a.current/a.goal)*100),100);
          return(
            <div key={a.id} style={{background:"#111111",borderRadius:14,
              border:`1px solid ${a.unlocked?"rgba(61,214,140,0.3)":"rgba(196,154,40,0.08)"}`,
              padding:"14px 10px",textAlign:"center",position:"relative"}}>
              {/* Badge image */}
              <div style={{width:68,height:68,borderRadius:12,margin:"0 auto 10px",
                overflow:"hidden",
                filter:a.unlocked?"none":"grayscale(90%) brightness(0.4)"}}>
                <img src={a.img} alt={a.title}
                  style={{width:"100%",height:"100%",objectFit:"cover"}}
                  onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
              </div>
              {/* Title */}
              <div style={{fontSize:11,fontWeight:"bold",
                color:a.unlocked?"#ffffff":"rgba(255,255,255,0.35)",
                fontFamily:"Georgia,serif",lineHeight:1.3,marginBottom:6}}>
                {a.title}
              </div>
              {/* Counter or earned */}
              {a.unlocked?(
                <div style={{fontSize:10,color:"#3dd68c",fontFamily:"Georgia,serif",
                  fontWeight:"bold"}}>✓ Earned</div>
              ):(
                <div style={{fontSize:10,color:"rgba(196,154,40,0.5)",
                  fontFamily:"Georgia,serif"}}>{a.current} / {a.goal}</div>
              )}
              {/* Progress bar for locked */}
              {!a.unlocked&&pct>0&&(
                <div style={{height:3,background:"rgba(0,0,0,0.4)",borderRadius:3,
                  overflow:"hidden",marginTop:6}}>
                  <div style={{height:"100%",width:`${pct}%`,
                    background:`linear-gradient(90deg,${T.goldDark},${T.goldMid})`,
                    borderRadius:3}}/>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProfileTab() {
  const {userId}=useSyncContext();
  const {user}=useUser();
  const {getToken}=useAuth();
  const [membershipTier,setMembershipTier]=useState<"free"|"pro">("free");
  const [upgrading,setUpgrading]=useState(false);
  const [mounted,setMounted]=useState(false);
  const [cigars,setCigars]=useState<any[]>([]);
  const [notes,setNotes]=useState<any[]>([]);
  const [showMore,setShowMore]=useState(false);
  const [dayStreak,setDayStreak]=useState(0);
  const [daysActive,setDaysActive]=useState(0);

  useEffect(()=>{
    try{const s=localStorage.getItem('mh_cigars');if(s)setCigars(JSON.parse(s));}catch{}
    try{const s=localStorage.getItem('mh_notes');if(s)setNotes(JSON.parse(s));}catch{}

    // Track daily visits and calculate streak
    const today=new Date().toDateString();
    try{
      // Record today's visit
      const visits:string[]=JSON.parse(localStorage.getItem('mh_visit_days')||'[]');
      if(!visits.includes(today)) visits.push(today);
      localStorage.setItem('mh_visit_days',JSON.stringify(visits));

      // Days active = total unique days visited
      setDaysActive(visits.length);

      // Day streak = consecutive days ending today
      const sorted=[...new Set(visits)].sort((a,b)=>new Date(a).getTime()-new Date(b).getTime());
      let streak=0;
      const todayMs=new Date(today).getTime();
      for(let i=sorted.length-1;i>=0;i--){
        const dayMs=new Date(sorted[i]).getTime();
        const diff=Math.round((todayMs-dayMs)/(1000*60*60*24));
        if(diff===streak) streak++;
        else break;
      }
      setDayStreak(streak);
    }catch{}

    setMounted(true);
  },[]);

  // Fetch membership tier
  useEffect(()=>{
    if(!userId) return;
    (async()=>{
      try{
        const token=await getToken({template:"supabase"});
        const {getSupabaseClient}=await import("@/lib/supabase");
        const {data,error}=await getSupabaseClient(token).from("profiles").select("membership_tier").eq("id",userId).single();
        if(error) console.error("[membership] fetch failed:",error);
        if(data?.membership_tier) setMembershipTier(data.membership_tier as any);
      }catch(e){
        console.error("[membership] error:",e);
      }
    })();
    // Check for payment success in URL
    const params=new URLSearchParams(window.location.search);
    if(params.get("payment")==="success"){
      setMembershipTier("pro");
      window.history.replaceState({},"","/");
    }
  },[userId,getToken]);

  const handleUpgrade=async(priceId:string,mode:"subscription"|"payment")=>{
    if(!userId) return;
    setUpgrading(true);
    try{
      const res=await fetch("/api/stripe/checkout",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({priceId,userId,userEmail:user?.emailAddresses?.[0]?.emailAddress,mode})
      });
      const data=await res.json();
      if(data.url) window.location.href=data.url;
      else throw new Error(data.error);
    }catch(e){console.error("[stripe]",e);}
    setUpgrading(false);
  };

  const totalCigars=mounted?cigars.reduce((a:number,c:any)=>a+(c.count||0),0):0;
  const uniqueBrands=mounted?new Set(cigars.map((c:any)=>c.brand)).size:0;
  const totalNotes=mounted?notes.length:0;
  const totalPoints=(uniqueBrands*100)+(totalNotes*150)+(totalCigars*10);
  const totalAchievements=Math.min((uniqueBrands>=1?1:0)+(totalNotes>=1?1:0)+(totalCigars>=5?1:0)+(totalCigars>=1?1:0),60);
  const tierLabel=totalPoints<1000?"Novice":totalPoints<3000?"Enthusiast":totalPoints<6000?"Gold":totalPoints<10000?"Platinum":"Aficionado";
  const nextTier=totalPoints<1000?"Enthusiast":totalPoints<3000?"Gold":totalPoints<6000?"Platinum":totalPoints<10000?"Aficionado":"Master";
  const tierMax=totalPoints<1000?1000:totalPoints<3000?3000:totalPoints<6000?6000:totalPoints<10000?10000:15000;
  const tierMin=totalPoints<1000?0:totalPoints<3000?1000:totalPoints<6000?3000:totalPoints<10000?6000:10000;
  const tierPct=Math.round(((totalPoints-tierMin)/(tierMax-tierMin))*100);

  const ACTIVITY=[
    {img:"/ad-padron.png",title:"Smoked a Padrón 1964 Exclusivo",sub:"Rated it 94",time:"2h ago"},
    {img:"/ad-davidoff.png",title:"Wrote a review for Davidoff Nicaragua",sub:"",time:"1d ago"},
    {img:"/Humidor_Perfection_V1.png",title:"Earned achievement Humidor Master",sub:"",time:"2d ago"},
    {img:"/ad-myfather.png",title:"Added My Father Le Bijou to collection",sub:"",time:"3d ago"},
  ];

  const groupCount=()=>{try{const s=localStorage.getItem('mh_groups');return s?JSON.parse(s).length:0;}catch{return 0;}};
  const STATS=[
    {icon:"cigar",val:totalCigars,label:"Cigars Smoked"},
    {icon:"fire",val:dayStreak,label:"Day Streak"},
    {icon:"globe",val:new Set(cigars.filter((c:any)=>c.origin).map((c:any)=>c.origin)).size,label:"Countries Smoked"},
    {icon:"calendar",val:daysActive,label:"Days Active"},
    {icon:"users",val:mounted?groupCount():0,label:"Group Challenges"},
    {icon:"star",val:0,label:"Friends"},
  ];

  if(showMore) return <MoreScreen onBack={()=>setShowMore(false)}/>;

  return(
    <div style={{paddingBottom:100}}>
      {/* Header */}
      <div style={{padding:"20px 20px 0",display:"flex",alignItems:"center",
        justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:28,fontWeight:"bold",color:T.textPrimary,
          fontFamily:"Georgia,serif"}}>Profile</div>
        <button onClick={()=>setShowMore(true)}
          style={{background:"none",border:`1px solid rgba(196,154,40,0.3)`,
            borderRadius:10,padding:"8px 16px",cursor:"pointer",
            color:T.goldMid,fontSize:13,fontFamily:"Georgia,serif",
            display:"flex",alignItems:"center",gap:6}}>
          More
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={T.goldMid} strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <div style={{padding:"0 16px"}}>

        {/* Avatar + name + stats */}
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{width:80,height:80,borderRadius:"50%",overflow:"hidden",
              border:`3px solid ${T.goldMid}`,background:"#111",
              boxShadow:`0 0 20px rgba(196,154,40,0.3)`}}>
              <img src="/mario-avatar.jpg" alt="Profile"
                style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 35%"}}
                onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <div style={{fontSize:26,fontWeight:"bold",color:T.textPrimary,
                fontFamily:"Georgia,serif"}}>Zebulon B.</div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={T.goldMid} strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div style={{fontSize:15,color:T.goldMid,fontFamily:"Georgia,serif",
              marginBottom:10}}>{tierLabel}</div>
            <div style={{display:"flex",gap:20}}>
              {[{val:totalAchievements,label:"Achievements"},{val:totalPoints.toLocaleString(),label:"Points"},{val:23,label:"Rank"}].map((s,i)=>(
                <div key={i} style={{textAlign:"center"}}>
                  <div style={{fontSize:20,fontWeight:"bold",color:T.textPrimary,
                    fontFamily:"Georgia,serif",lineHeight:1}}>{s.val}</div>
                  <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",
                    marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mario quote */}
        <div style={{textAlign:"center",padding:"12px 8px",marginBottom:16,
          borderTop:`1px solid rgba(196,154,40,0.1)`,
          borderBottom:`1px solid rgba(196,154,40,0.1)`}}>
          <div style={{fontSize:16,color:T.textSecondary,fontFamily:"Georgia,serif",
            fontStyle:"italic",lineHeight:1.6}}>
            "Life is too short to smoke bad cigars."
          </div>
          <div style={{fontSize:14,color:T.goldMid,fontFamily:"Georgia,serif",marginTop:4}}>
            – Mario
          </div>
        </div>

        {/* Pro upgrade card — only show for free users */}
        {membershipTier==="free"&&(
          <div style={{background:"linear-gradient(135deg,rgba(196,154,40,0.12),rgba(139,105,20,0.08))",
            borderRadius:16,border:`1px solid rgba(196,154,40,0.3)`,
            padding:"20px",marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{width:36,height:36,borderRadius:10,
                background:"linear-gradient(135deg,#8B6914,#C49A28)",
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div>
                <div style={{fontSize:16,fontWeight:"bold",color:T.goldMid,fontFamily:"Georgia,serif"}}>
                  Upgrade to Pro
                </div>
                <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif"}}>
                  $59.99/year — cancel anytime
                </div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
              {[
                "Unlimited humidor entries",
                "Unlimited Ask Mario questions",
                "Social Club access",
                "Humidity push alerts",
                "Cloud sync across devices",
                "Full Tasting Journal history",
              ].map((f,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3dd68c" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{fontSize:13,color:T.textSecondary,fontFamily:"Georgia,serif"}}>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={()=>handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID||"","subscription")}
              disabled={upgrading}
              style={{width:"100%",padding:"14px",
                background:"linear-gradient(135deg,#8B6914,#C49A28)",
                border:"none",borderRadius:12,color:"#0a0a0a",
                fontSize:16,fontWeight:"bold",cursor:"pointer",
                fontFamily:"Georgia,serif",opacity:upgrading?0.7:1}}>
              {upgrading?"Redirecting to checkout…":"Upgrade to Pro — $59.99/yr"}
            </button>
          </div>
        )}

        {/* Pro badge for existing pro users */}
        {membershipTier==="pro"&&(
          <div style={{background:"rgba(61,214,140,0.08)",borderRadius:14,
            border:"1px solid rgba(61,214,140,0.25)",padding:"14px 16px",
            marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3dd68c" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <div>
              <div style={{fontSize:15,fontWeight:"bold",color:"#3dd68c",fontFamily:"Georgia,serif"}}>
                Pro Member
              </div>
              <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif"}}>
                All features unlocked
              </div>
            </div>
          </div>
        )}

        {/* Tier progress card */}
        <div style={{background:"#111111",borderRadius:14,
          border:`1px solid rgba(196,154,40,0.2)`,padding:"16px",
          marginBottom:20,display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:52,height:52,borderRadius:12,flexShrink:0,
            background:"rgba(196,154,40,0.08)",border:`1px solid rgba(196,154,40,0.2)`,
            display:"flex",alignItems:"center",justifyContent:"center"}}>  <SvgIcon id="crown" size={24}/>
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              marginBottom:6}}>
              <span style={{fontSize:17,fontWeight:"bold",color:T.goldMid,
                fontFamily:"Georgia,serif",letterSpacing:1}}>{tierLabel.toUpperCase()}</span>
              <span style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif"}}>
                Next Tier: {nextTier.toUpperCase()}
              </span>
            </div>
            <div style={{height:6,background:"rgba(0,0,0,0.4)",borderRadius:6,
              overflow:"hidden",marginBottom:6}}>
              <div style={{height:"100%",width:`${tierPct}%`,
                background:`linear-gradient(90deg,${T.goldDark},${T.goldMid})`,
                borderRadius:6,boxShadow:`0 0 8px rgba(196,154,40,0.4)`}}/>
            </div>
            <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif"}}>
              {totalPoints.toLocaleString()} / {tierMax.toLocaleString()} pts
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(196,154,40,0.3)" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        {/* Overview stats grid */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:"bold",color:T.textPrimary,
            fontFamily:"Georgia,serif",letterSpacing:2,textTransform:"uppercase"}}>
            Overview
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:24}}>
          {STATS.map((s,i)=>(
            <div key={i} style={{background:"#111111",borderRadius:12,
              border:`1px solid rgba(196,154,40,0.12)`,padding:"14px 8px",
              textAlign:"center"}}>
              <div style={{marginBottom:6,display:"flex",justifyContent:"center"}}><SvgIcon id={s.icon} size={22}/></div>
              <div style={{fontSize:24,fontWeight:"bold",color:T.textPrimary,
                fontFamily:"Georgia,serif",lineHeight:1,marginBottom:4}}>{s.val}</div>
              <div style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",
                lineHeight:1.3}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:"bold",color:T.textPrimary,
            fontFamily:"Georgia,serif",letterSpacing:2,textTransform:"uppercase"}}>
            Recent Activity
          </div>
          <div style={{fontSize:13,color:T.goldMid,fontFamily:"Georgia,serif"}}>View All</div>
        </div>
        <div style={{background:"#111111",borderRadius:14,
          border:`1px solid rgba(196,154,40,0.12)`,overflow:"hidden",marginBottom:24}}>
          {ACTIVITY.map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,
              padding:"14px 14px",
              borderBottom:i<ACTIVITY.length-1?`1px solid rgba(196,154,40,0.08)`:"none"}}>
              <div style={{width:48,height:48,borderRadius:10,flexShrink:0,
                background:"#000",overflow:"hidden"}}>
                <img src={a.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}
                  onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:"bold",color:T.textPrimary,
                  fontFamily:"Georgia,serif",lineHeight:1.3,marginBottom:2}}>{a.title}</div>
                {a.sub&&<div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif"}}>{a.sub}</div>}
                <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",marginTop:2}}>{a.time}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="rgba(196,154,40,0.3)" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          ))}
        </div>

        {/* My Collection */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:"bold",color:T.textPrimary,
            fontFamily:"Georgia,serif",letterSpacing:2,textTransform:"uppercase"}}>
            My Collection
          </div>
          <div style={{fontSize:13,color:T.goldMid,fontFamily:"Georgia,serif"}}>View Collection</div>
        </div>
        <div style={{background:"#111111",borderRadius:14,
          border:`1px solid rgba(196,154,40,0.15)`,overflow:"hidden",
          display:"flex",alignItems:"center",gap:0}}>
          <div style={{width:120,height:100,flexShrink:0,background:"#000",overflow:"hidden"}}>
            <img src="/humidor-hero.png" alt="Collection"
              style={{width:"100%",height:"100%",objectFit:"cover",
                filter:"brightness(0.7)"}}
              onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
          </div>
          <div style={{flex:1,padding:"16px"}}>
            <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",
              letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Total Cigars</div>
            <div style={{fontSize:32,fontWeight:"bold",color:T.textPrimary,
              fontFamily:"Georgia,serif",lineHeight:1,marginBottom:8}}>{totalCigars}</div>
            <div style={{display:"flex",gap:16}}>
              <div>
                <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif"}}>In Humidors</div>
                <div style={{fontSize:18,fontWeight:"bold",color:T.goldMid,
                  fontFamily:"Georgia,serif"}}>{cigars.filter((c:any)=>c.humidorId).reduce((a:number,c:any)=>a+(c.count||0),0)}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif"}}>In Inventory</div>
                <div style={{fontSize:15,fontWeight:"bold",color:T.goldMid,
                  fontFamily:"Georgia,serif"}}>{cigars.filter((c:any)=>!c.humidorId).reduce((a:number,c:any)=>a+(c.count||0),0)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MORE SCREEN ────────────────────────────────────────────────────────────
