"use client";
import {T,LANGS,useLang} from "@/lib/constants";
import React,{useState,useEffect} from "react";

export function SettingsTab() {
  const [tempUnit,setTempUnit]=useState("F");
  const [notifs,setNotifs]=useState(true);
  const [apiKeySaved,setApiKeySaved]=useState(false);
  const [apiKeyInput,setApiKeyInput]=useState("");
  const {t,lang,setLang}=useLang();
  const Toggle=({val,set}:{val:boolean,set:(v:boolean)=>void})=>(
    <div onClick={()=>set(!val)} style={{width:44,height:26,borderRadius:13,cursor:"pointer",
      background:val?T.goldMid:"rgba(255,255,255,0.07)",position:"relative",transition:"background 0.2s",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:val?22:3,width:20,height:20,borderRadius:"50%",
        background:val?"#111111":"rgba(255,255,255,0.25)",transition:"left 0.2s"}}/>
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
        <div style={{fontSize:17,color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:sub?2:0}}>{label}</div>
        {sub&&<div style={{fontSize:11,color:T.textMuted}}>{sub}</div>}
      </div>
      {right}
    </div>
  );
  return (
    <div style={{padding:"0 0 32px"}}>
      <div style={{padding:"24px 20px 20px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{fontSize:10,letterSpacing:5,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif"}}>{t("settings")}</div>
      </div>

      {/* Account */}
      <Group title={t("account")}>
        <Row label="Mario's Humidor" sub="v1.0.0 · The Cigar Lifestyle Platform"
          right={<div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:"bold",color:"#111111",fontFamily:"Georgia,serif"}}>M</div>}/>
      </Group>

      {/* Language */}
      <Group title={t("language")}>
        <div style={{padding:"14px 16px"}}>
          <div style={{fontSize:11,color:T.textMuted,marginBottom:12,fontFamily:"Georgia,serif"}}>{t("language_sub")}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {LANGS.map(l=>(
              <button key={l.code} onClick={()=>setLang(l.code)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",
                  background:lang===l.code?`linear-gradient(135deg,${T.goldDark}22,${T.goldMid}18)`:"transparent",
                  border:`1px solid ${lang===l.code?T.goldMid:T.border}`,
                  borderRadius:10,cursor:"pointer",width:"100%",textAlign:"left"}}>
                <span style={{fontSize:22,lineHeight:1}}>{l.flag}</span>
                <span style={{fontSize:17,color:lang===l.code?T.goldLight:T.textPrimary,fontFamily:"Georgia,serif",flex:1}}>{l.name}</span>
                {lang===l.code&&<span style={{fontSize:16,color:T.goldMid}}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      </Group>

      {/* Collection */}
      <Group title={t("collection_s")}>
        <Row label={t("temp_unit")} sub={t("temp_sub")}
          right={
            <div style={{display:"flex",gap:2,background:"rgba(0,0,0,0.2)",borderRadius:8,padding:2}}>
              {["F","C"].map(u=>(
                <button key={u} onClick={()=>setTempUnit(u)}
                  style={{padding:"4px 14px",borderRadius:6,cursor:"pointer",border:"none",
                    background:tempUnit===u?`linear-gradient(135deg,${T.goldDark},${T.goldMid})`:"transparent",
                    color:tempUnit===u?"#111111":T.textMuted,fontSize:12,fontFamily:"Georgia,serif"}}>
                  °{u}
                </button>
              ))}
            </div>
          } last/>
      </Group>

      {/* API */}
      <Group title={t("api_s")}>
        <div style={{padding:"16px"}}>
          <div style={{fontSize:17,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:4}}>{t("api_key_title")}</div>
          <div style={{fontSize:12,color:T.textMuted,lineHeight:1.65,marginBottom:12}}>{t("api_key_sub")}</div>
          {apiKeySaved ? (
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:T.success}}/>
                <span style={{fontSize:13,color:T.success,fontFamily:"Georgia,serif"}}>{t("api_connected")}</span>
              </div>
              <button onClick={()=>{setApiKeySaved(false);setApiKeyInput("");}}
                style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.textMuted,
                  padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:"Georgia,serif"}}>{t("remove_key")}</button>
            </div>
          ):(
            <div>
              <input type="password" value={apiKeyInput} onChange={e=>setApiKeyInput(e.target.value)}
                placeholder="sk-ant-..."
                style={{width:"100%",boxSizing:"border-box" as const,background:"rgba(0,0,0,0.3)",border:`1px solid ${T.border}`,
                  borderRadius:8,padding:"10px 14px",color:T.textPrimary,fontSize:13,outline:"none",marginBottom:10,fontFamily:"Georgia,serif"}}/>
              <button onClick={()=>{if(!apiKeyInput.startsWith("sk-"))return;setApiKeySaved(true);}}
                style={{width:"100%",padding:"11px",background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                  border:"none",borderRadius:8,color:"#111111",fontSize:13,fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
                {t("save_key")}
              </button>
              <div style={{fontSize:11,color:T.textMuted,marginTop:8,textAlign:"center"}}>console.anthropic.com</div>
            </div>
          )}
        </div>
      </Group>

      {/* Sensors */}
      <Group title={t("sensors_s")}>
        <Row label="Govee H5051" sub="WiFi sensor integration — coming soon" right={<div style={{fontSize:11,color:T.textMuted}}>Pending</div>}/>
        <Row label="Raching MON1800A" sub="Built-in sensor support" right={<div style={{fontSize:11,color:T.textMuted}}>Pending</div>} last/>
      </Group>

      {/* Notifications */}
      <Group title={t("notifications_s")}>
        <Row label={t("hum_alert")} sub={t("hum_alert_sub")} right={<Toggle val={notifs} set={setNotifs}/>}/>
        <Row label={t("temp_alert")} sub={t("temp_alert_sub")} right={<Toggle val={false} set={()=>{}}/>} last/>
      </Group>

      <div style={{padding:"24px 20px 0",display:"flex",justifyContent:"center",gap:24}}>
        {["Privacy","Terms","Support"].map(l=>(
          <span key={l} style={{fontSize:12,color:T.textGold,cursor:"pointer",fontFamily:"Georgia,serif"}}>{l}</span>
        ))}
      </div>
    </div>
  );
}

