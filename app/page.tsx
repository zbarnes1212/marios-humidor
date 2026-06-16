"use client";
import React,{ useState, useEffect, useRef, useId, useCallback, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import SplashScreen from "@/components/SplashScreen";
import { useAuth, useUser, SignIn, SignOutButton } from "@clerk/nextjs";

import {T,SyncContext,useLang} from "@/lib/constants";
import {LangProvider,CedarBg,MMedallion,SvgIcon} from "@/lib/ui";
import {HumidorsTab} from "@/components/HumidorsTab";
import {BandScannerModal} from "@/components/BandScannerModal";
import {CollectionTab} from "@/components/CollectionTab";
import {AskMarioTab,RecordTab,TastingNotesTab,TobaccoMap} from "@/components/MarioTab";
import {ClubTab} from "@/components/ClubTab";
import {ProfileTab} from "@/components/ProfileTab";
import {MoreScreen} from "@/components/MoreScreen";
import {HomeTab} from "@/components/HomeTab";
import {SettingsTab} from "@/components/SettingsTab";
import { pullAllData, pushAllLocalData, upsertHumidor as syncUpsertHumidor } from "@/lib/sync";

const HOME_TICKER_ITEMS=[
  {label:"Challenge",text:"3-day Nicaraguan Showdown ends Sunday"},
  {label:"Member",text:"@mariobautista joined the lounge"},
  {label:"Rare Find",text:"Opus X BBMF spotted at Holt's"},
  {label:"Weather",text:"Humidity advisory: 68°F / 72% RH ideal today"},
];

const NAV=[
  {id:"home",tk:"nav_home"},
  {id:"humidors",tk:"nav_humidors"},
  {id:"record",tk:"nav_record"},
  {id:"club",tk:"nav_club"},
  {id:"profile",tk:"nav_profile"},
];

function NavIcon({id,active}:{id:string,active:boolean}) {
  const c=active?T.goldLight:T.goldMid;
  const icons:Record<string,React.ReactNode>={
    humidors:(
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none" suppressHydrationWarning>
        <circle cx="11" cy="11" r="8.5" stroke={c} strokeWidth="1.4" fill="none"/>
        {Array.from({length:9},(_,i)=>{const a=(i*40-200)*Math.PI/180,r1=i%3===0?5.5:6.5,r2=7.8;
          return <line key={i} suppressHydrationWarning x1={11+r1*Math.cos(a)} y1={11+r1*Math.sin(a)} x2={11+r2*Math.cos(a)} y2={11+r2*Math.sin(a)}
            stroke={c} strokeWidth={i%3===0?"1.2":"0.7"} opacity={i%3===0?1:0.5}/>;
        })}
        <line x1="11" y1="11" x2="11" y2="4.8" stroke={active?T.goldLight:T.goldMid} strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="11" cy="11" r="1.4" fill={c}/>
      </svg>
    ),
    challenges:(
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
        <path d="M11 2l2.5 5 5.5.8-4 3.9.9 5.5L11 14.5 6.1 17.2l.9-5.5L3 7.8l5.5-.8L11 2z"
          stroke={c} strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    club:(
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
        <path d="M11 3l2.5 5 5.5.8-4 3.9.9 5.5L11 15.5 6.1 18.2l.9-5.5L3 8.8l5.5-.8L11 3z"
          stroke={c} strokeWidth="1.4" strokeLinejoin="round" fill={active?c:"none"}/>
      </svg>
    ),
    leaderboard:(
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="12" width="4" height="8" rx="1" stroke={c} strokeWidth="1.4"/>
        <rect x="9" y="7" width="4" height="13" rx="1" stroke={c} strokeWidth="1.4"/>
        <rect x="16" y="3" width="4" height="17" rx="1" stroke={c} strokeWidth="1.4"/>
      </svg>
    ),
    record:(
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
        <g transform="rotate(-35 11 11)">
          <rect x="3" y="9" width="16" height="4" rx="2" stroke={c} strokeWidth="1.4" fill="none"/>
          <rect x="8" y="8.4" width="2.4" height="5.2" stroke={c} strokeWidth="1" fill={active?c:"none"}/>
          <path d="M19 11c1 0 1.6.6 1.6 1.4" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
        </g>
      </svg>
    ),
    home:(
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
        <path d="M3 9.5L11 3l8 6.5V19a1 1 0 0 1-1 1H14v-5h-4v5H4a1 1 0 0 1-1-1V9.5z" stroke={c} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
      </svg>
    ),
    profile:(
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.8" stroke={c} strokeWidth="1.4" fill="none"/>
        <path d="M4 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    collection:(
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
        <rect x="2.5" y="6" width="17" height="13" rx="2" stroke={c} strokeWidth="1.4" fill="none"/>
        <path d="M7.5 6V4.5A3.5 3.5 0 0 1 14.5 4.5V6" stroke={c} strokeWidth="1.4"/>
        <line x1="7" y1="11.5" x2="15" y2="11.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <line x1="7" y1="14.5" x2="12" y2="14.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    mario:(
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.8" stroke={c} strokeWidth="1.4" fill="none"/>
        <path d="M4 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="11" cy="8" r="1.4" fill={c}/>
      </svg>
    ),
    community:(
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
        <circle cx="8.5" cy="8" r="3" stroke={c} strokeWidth="1.4" fill="none"/>
        <circle cx="15.5" cy="8" r="3" stroke={c} strokeWidth="1.4" fill="none"/>
        <path d="M2 19c0-3.31 2.91-6 6.5-6s6.5 2.69 6.5 6" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M15 13.5c3.2 0 5.8 1.7 5.8 5.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    notes:(
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
        <path d="M12.5 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6.5-6z" stroke={c} strokeWidth="1.4" fill="none"/>
        <line x1="7" y1="11" x2="15" y2="11" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <line x1="7" y1="14.5" x2="11.5" y2="14.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    news:(
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="4" width="18" height="14" rx="2" stroke={c} strokeWidth="1.4" fill="none"/>
        <line x1="6" y1="8.5" x2="16" y2="8.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="6" y1="11.5" x2="16" y2="11.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <line x1="6" y1="14.5" x2="11" y2="14.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    settings:(
      <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="3" stroke={c} strokeWidth="1.4" fill="none"/>
        <path d="M11 2v2M11 18v2M2 11H4M18 11h2M4.05 4.05l1.41 1.41M16.54 16.54l1.41 1.41M4.05 17.95l1.41-1.41M16.54 5.46l1.41-1.41"
          stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  };
  return <>{icons[id]||null}</>;
}

function TopNav({tab,setTab}:{tab:string,setTab:(t:string)=>void}) {
  const {t}=useLang();
  return (
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
      width:"100%",maxWidth:480,zIndex:100,
      background:"rgba(10,8,4,0.82)",
      backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",
      borderTop:`1px solid rgba(160,120,40,0.35)`,
      display:"flex",justifyContent:"space-around",padding:"6px 0 0",
      paddingBottom:"calc(env(safe-area-inset-bottom, 12px) + 6px)",
      boxShadow:"0 -2px 16px rgba(0,0,0,0.6)"}}>
      {NAV.map(n=>{
        const active=tab===n.id;
        return (
          <button key={n.id} onClick={()=>setTab(n.id)}
            style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
              justifyContent:"center",padding:"6px 2px 8px",background:"none",border:"none",
              cursor:"pointer",borderTop:active?`2px solid ${T.goldMid}`:"2px solid transparent",
              transition:"all 0.2s"}}>
            <div style={{filter:active?`drop-shadow(0 0 5px ${T.goldLight})`:"none",marginBottom:4,opacity:active?1:0.38}}>
              <NavIcon id={n.id} active={active}/>
            </div>
            <div style={{fontSize:8.5,color:active?T.goldLight:"rgba(255,255,255,0.28)",
              fontFamily:"Georgia,serif",letterSpacing:0.3,whiteSpace:"nowrap"}}>
              {t(n.tk)}
            </div>
          </button>
        );
      })}
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
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:1}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={T.goldMid}>
              <path d="M12 2C9.38 2 7.25 4.13 7.25 6.75c0 2.57 2.01 4.66 4.63 4.74.08-.01.16-.01.24 0h.07C14.85 11.41 16.75 9.32 16.75 6.75 16.75 4.13 14.62 2 12 2zM17.08 14.15c-2.79-1.86-7.34-1.86-10.15 0-1.27.85-1.97 2-1.97 3.23s.7 2.37 1.96 3.21C8.32 21.53 10.16 22.25 12 22.25s3.68-.72 5.08-1.66c1.26-.85 1.96-1.99 1.96-3.23-.01-1.23-.7-2.37-1.96-3.21z"/>
            </svg>
            <span style={{fontSize:12,fontWeight:"bold",color:T.goldMid,fontFamily:"Georgia,serif",letterSpacing:0.3}}>1,247 Members</span>
          </div>
          <span style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>&amp; growing</span>
        </div>
      </div>
    </div>
  );
}


// ── HOME TAB ───────────────────────────────────────────────────────────────
// ── HOME TAB QUICK PROMPTS ──────────────────────────────────────────────────

function AuthScreen() {
  return(
    <div style={{minHeight:"100vh",background:"#120a02",display:"flex",
      flexDirection:"column",alignItems:"center",justifyContent:"center",
      padding:"24px",position:"relative",overflow:"hidden"}}>
      {/* Background grid */}
      <div style={{position:"absolute",inset:0,opacity:0.04,
        backgroundImage:"repeating-linear-gradient(90deg,#C49A28 0px,#C49A28 1px,transparent 1px,transparent 40px),repeating-linear-gradient(0deg,#C49A28 0px,#C49A28 1px,transparent 1px,transparent 40px)"}}/>
      {/* Logo */}
      <div style={{textAlign:"center",marginBottom:28,position:"relative",zIndex:1}}>
        <div style={{width:64,height:64,borderRadius:"50%",
          background:"linear-gradient(135deg,#8B6914,#C49A28)",
          display:"flex",alignItems:"center",justifyContent:"center",
          margin:"0 auto 14px",boxShadow:"0 0 40px rgba(196,154,40,0.25)"}}>
          <span style={{fontSize:28,fontWeight:"bold",color:"#0a0a0a",fontFamily:"Georgia,serif"}}>M</span>
        </div>
        <div style={{fontSize:20,fontWeight:"bold",color:"#ede0cc",
          fontFamily:"Georgia,serif",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>
          Mario's Humidor
        </div>
        <div style={{fontSize:11,color:"rgba(196,154,40,0.7)",
          letterSpacing:4,textTransform:"uppercase",fontFamily:"Georgia,serif"}}>
          The Cigar Lifestyle Platform
        </div>
      </div>
      {/* Clerk SignIn with Mario's Humidor appearance */}
      <div style={{position:"relative",zIndex:1}}>
        <SignIn
          routing="hash"
          afterSignInUrl="/"
          afterSignUpUrl="/"
          appearance={{
            variables:{
              colorPrimary:"#C49A28",
              colorBackground:"#111111",
              
              borderRadius:"12px",
              fontFamily:"Georgia, serif",
              colorDanger:"#e05050",
              colorSuccess:"#3dd68c",
            },
            elements:{
              card:{
                background:"#111111",
                border:"1px solid rgba(196,154,40,0.2)",
                boxShadow:"0 8px 32px rgba(0,0,0,0.6)",
                borderRadius:"16px",
              },
              headerTitle:{
                color:"#ede0cc",
                fontFamily:"Georgia, serif",
              },
              headerSubtitle:{
                color:"rgba(237,224,204,0.6)",
              },
              socialButtonsBlockButton:{
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.12)",
                color:"#ede0cc",
                borderRadius:"12px",
              },
              socialButtonsBlockButtonText:{
                color:"#ede0cc",
              },
              dividerLine:{
                background:"rgba(196,154,40,0.15)",
              },
              dividerText:{
                color:"rgba(237,224,204,0.3)",
              },
              formFieldLabel:{
                color:"rgba(237,224,204,0.6)",
              },
              formFieldInput:{
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(196,154,40,0.25)",
                color:"#ede0cc",
                borderRadius:"12px",
              },
              formButtonPrimary:{
                background:"#111111",
                color:"#ffffff",
                fontWeight:"bold",
                borderRadius:"12px",
                border:"1px solid rgba(196,154,40,0.3)",
              },
              footerActionLink:{
                color:"#C49A28",
              },
              identityPreviewText:{
                color:"#ede0cc",
              },
              identityPreviewEditButton:{
                color:"#C49A28",
              },
              formFieldSuccessText:{
                color:"#3dd68c",
              },
              alertText:{
                color:"#ede0cc",
              },
              otpCodeFieldInput:{
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(196,154,40,0.25)",
                color:"#ede0cc",
                borderRadius:"8px",
              },
            }
          }}
        />
      </div>
    </div>
  );
}

// ── MAIN APP INNER (all hooks live here) ───────────────────────────────────
function AppInner() {
  const {userId,getToken}=useAuth();
  const [tab,setTab]=useState("home");
  const [splash,setSplash]=useState(true);
  const [syncDone,setSyncDone]=useState(false);

  // ── SUPABASE SYNC ON MOUNT ──────────────────────────────────────────────
  useEffect(()=>{
    if(!userId) return;
    (async()=>{
      try{
        const token=await getToken({template:"supabase"});
        if(!token) return;

        // Pull from Supabase first
        const remote=await pullAllData(token,userId);

        if(remote.humidors&&remote.humidors.length>0){
          // Merge remote cigars with local to preserve image fields Supabase doesn't store
          const localCigarsRaw=localStorage.getItem("mh_cigars");
          const localCigars:any[]=localCigarsRaw?JSON.parse(localCigarsRaw):[];
          const localById:Record<number,any>={};
          localCigars.forEach((c:any)=>{localById[c.id]=c;});
          const mergedCigars=(remote.cigars||[]).map((rc:any)=>{
            const lc=localById[rc.id];
            if(!lc) return rc;
            return {...rc,
              image_filename:rc.image_filename||lc.image_filename||null,
              customPhoto:rc.customPhoto||lc.customPhoto||null,
              imageUri:rc.imageUri||lc.imageUri||null,
            };
          });
          const remoteIds=new Set((remote.cigars||[]).map((c:any)=>c.id));
          const localOnly=localCigars.filter((c:any)=>!remoteIds.has(c.id));
          const finalCigars=[...mergedCigars,...localOnly];
          localStorage.setItem("mh_humidors",JSON.stringify(remote.humidors));
          localStorage.setItem("mh_cigars",JSON.stringify(finalCigars));
          localStorage.setItem("mh_records",JSON.stringify(remote.records||[]));
          localStorage.setItem("mh_notes",JSON.stringify(remote.notes||[]));
          console.log("[sync] pulled from Supabase, merged",finalCigars.length,"cigars");
        } else {
          // No remote data — push local data up (first time sync)
          await pushAllLocalData(token,userId);
          console.log("[sync] pushed local data to Supabase");
        }
      }catch(e){console.error("[sync] mount sync failed:",e);}
      setSyncDone(true);
    })();
  },[userId,getToken]);

  // Helper to get token for writes
  const getSupabaseToken=async()=>{
    try{return await getToken({template:"supabase"});}
    catch{return null;}
  };

  // Live Govee data lifted here so it persists across tab switches
  type LiveReading={temperature:number|null;humidity:number|null;observedAt:string|null};
  const [liveData,setLiveData]=useState<Record<string,LiveReading>>({});
  const [liveStatus,setLiveStatus]=useState<"idle"|"loading"|"connected"|"error">("idle");
  const [lastUpdated,setLastUpdated]=useState<string|null>(null);

  const fetchLive=useCallback(async(isInitial=false)=>{
    if(isInitial) setLiveStatus("loading");
    try{
      const merged:Record<string,{temperature:number|null;humidity:number|null;observedAt:string|null}>={};
      let anyConnected=false;
      try{
        const goveeRes=await fetch("/api/govee");
        const goveeData=await goveeRes.json();
        if(goveeData.ok&&goveeData.sensors&&goveeData.sensors.length>0){
          goveeData.sensors.forEach((s:any)=>{
            merged[s.name]={temperature:s.temperature,humidity:s.humidity,observedAt:s.observedAt};
          });
          anyConnected=true;
        }
      } catch{}
      try{
        const sensorRes=await fetch("/api/sensor");
        if(sensorRes.ok){
          const sensorData=await sensorRes.json();
          if(typeof sensorData.temperature==="number"&&typeof sensorData.humidity==="number"){
            merged["Mario's Sensor"]={temperature:sensorData.temperature,humidity:sensorData.humidity,observedAt:sensorData.timestamp??null};
            anyConnected=true;
          }
        }
      } catch{}
      if(anyConnected){
        setLiveData(prev=>({...prev,...merged}));
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

  const TAB_ORDER=["home","humidors","record","club","profile"];

  const navigateTo=(nextTab:string)=>{
    if(nextTab===tab) return;
    setTab(nextTab);
    window.scrollTo(0,0);
  };

  const renderTab=(t:string)=>{
    switch(t){
      case "home":       return <HomeTab liveData={liveData} liveStatus={liveStatus} lastUpdated={lastUpdated} onRefresh={()=>fetchLive(false)} onNavigate={navigateTo}/>;
      case "humidors":   return <HumidorsTab liveData={liveData} liveStatus={liveStatus} lastUpdated={lastUpdated} onRefresh={()=>fetchLive(false)}/>;
      case "record":     return <RecordTab/>;
      case "club":       return <ClubTab/>;
      case "profile":    return <ProfileTab/>;
      case "collection": return <CollectionTab/>;
      case "challenges": return <ChallengesTab/>;
      case "leaderboard": return <LeaderboardTab/>;
      default:           return <HomeTab liveData={liveData} liveStatus={liveStatus} lastUpdated={lastUpdated} onRefresh={()=>fetchLive(false)} onNavigate={navigateTo}/>;
    }
  };

  const render=()=>renderTab(tab);
  const syncContextValue={
    userId:userId||"",
    getToken:async()=>{
      try{return await getToken({template:"supabase"});}
      catch{return null;}
    }
  };
  return (
    <SyncContext.Provider value={syncContextValue}>
    <LangProvider>
    <div style={{minHeight:"100vh",background:T.bg,color:T.textPrimary,fontFamily:"Georgia,serif",maxWidth:480,margin:"0 auto",position:"relative"}}>
      <CedarBg/>
      {splash&&<SplashScreen onDone={()=>setSplash(false)}/>}
      <div style={{position:"relative",zIndex:1,paddingBottom:90,overflow:"hidden"}}>
        <div style={{position:"sticky",top:0,zIndex:50}}>
          <AppHeader totalCigars={0}/>
        </div>
        <div style={{position:"relative"}}>
          {TAB_ORDER.map(t=>(
            <div key={t} style={{display:tab===t?"block":"none"}}>
              {renderTab(t)}
            </div>
          ))}
        </div>
      </div>
      {/* ── FULL-BLEED MARIO BACKGROUND — rendered outside tab switcher to avoid glitch on swipe ── */}
      {tab==='home'&&(
        <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",
          width:"100%",maxWidth:480,height:"100vh",zIndex:0,overflow:"hidden",background:T.bg}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:340,overflow:"hidden",
            display:"flex",alignItems:"flex-end",justifyContent:"flex-end"}}>
            <img src="/mario-avatar.jpg" alt=""
              style={{width:"auto",height:"75%",maxWidth:"none",
                objectFit:"contain",display:"block"}}/>
            <div style={{position:"absolute",inset:0,
              background:"linear-gradient(180deg, rgba(10,8,4,0.45) 0%, rgba(10,8,4,0.35) 40%, rgba(10,8,4,0.85) 85%, "+T.bg+" 100%)"}}/>
          </div>
        </div>
      )}
      {/* ── GROUP CHALLENGE TICKER — rendered outside tab switcher to avoid glitch on swipe ── */}
      {tab==='home'&&(()=>{
        // Build ticker items from member's real groups + fallback placeholders
        let storedGroups:any[]=[];
        try{const s=localStorage.getItem('mh_groups');if(s)storedGroups=JSON.parse(s);}catch{}
        const liveItems=storedGroups.map((g:any)=>{
          const memberCount=(g.members||[]).length+1;
          const top=g.leaderboard?.[0];
          const daysLeft=Math.max(0,Math.ceil((new Date(g.createdAt).getTime()+
            (g.duration==="1 week"?7:g.duration==="2 weeks"?14:30)*24*60*60*1000-Date.now())/(1000*60*60*24)));
          return {
            icon:"🏆",
            text:`${g.name} — ${top?`${top.name} leading at ${top.progress}%`:`${memberCount} members`} · ${daysLeft}d left`
          };
        });
        const tickerItems=liveItems.length>0?liveItems:HOME_TICKER_ITEMS;
        return(
          <div style={{position:"fixed",bottom:64,left:"50%",transform:"translateX(-50%)",
            width:"100%",maxWidth:480,zIndex:99}}>
            <div style={{width:"100%",background:"rgba(15,15,15,0.85)",
              backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
              border:`1px solid rgba(196,154,40,0.18)`,borderRadius:0,
              padding:"10px 0",overflow:"hidden",position:"relative"}}>
              <div style={{display:"flex",whiteSpace:"nowrap",
                animation:"ticker-scroll 9s linear infinite"}}>
                {[...tickerItems,...tickerItems].map((item,i)=>(
                  <span key={i} style={{display:"inline-flex",alignItems:"center",gap:8,
                    padding:"0 28px",fontSize:13,color:"#ffffff",
                    fontFamily:"Georgia,serif"}}>
                    <span style={{fontSize:14}}>{item.icon}</span>
                    {item.text}
                    <span style={{color:"rgba(255,255,255,0.35)",marginLeft:20}}>•</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
      <TopNav tab={tab} setTab={navigateTo}/>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{margin:0;padding:0;overflow-x:hidden}
        input,textarea,select{font-family:Georgia,serif;color-scheme:dark}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(180,140,60,0.12);border-radius:2px}
        .club-subtabs::-webkit-scrollbar{display:none}
        @keyframes mT{0%,80%,100%{transform:translateY(0);opacity:0.3}40%{transform:translateY(-5px);opacity:1}}
        @keyframes sp{0%,80%,100%{transform:scale(0.6);opacity:0.3}40%{transform:scale(1);opacity:1}}

        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes ticker-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
      `}</style>
    </div>
    </LangProvider>
    </SyncContext.Provider>
  );
}

// ── ROOT COMPONENT (auth gate) ──────────────────────────────────────────────
export default function MariosHumidor() {
  const {isLoaded,isSignedIn}=useAuth();

  if(!isLoaded) return(
    <div style={{minHeight:"100vh",background:"#120a02",display:"flex",
      alignItems:"center",justifyContent:"center"}}>
      <div style={{display:"flex",gap:8}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:8,height:8,borderRadius:"50%",
            background:"#C49A28",opacity:0.6,
            animation:`pulse 1.4s ease-in-out ${i*0.2}s infinite`}}/>
        ))}
      </div>
    </div>
  );

  if(!isSignedIn) return <AuthScreen/>;

  return <AppInner/>;
}