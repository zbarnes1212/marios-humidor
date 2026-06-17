"use client";
import {SvgIcon} from "@/lib/ui";
import {T,getCigarImage,useLang} from "@/lib/constants";
import React,{useState,useEffect,useRef} from "react";

type ScanResult={brand:string;line:string;vitola:string;origin:string;wrapper:string;rating:number|null;confidence:string;notes:string;image_filename?:string|null};

export function BandScannerModal({onClose,onAddToCollection,onAddToJournal,onSmokedOne,onSaveToRecord,recordMode}:{
  onClose:()=>void;
  onAddToCollection?:(r:ScanResult)=>void;
  onAddToJournal?:(r:ScanResult)=>void;
  onSmokedOne?:(r:ScanResult)=>void;
  onSaveToRecord?:(r:ScanResult,status:"smoked"|"onMyList",note:string,photo:string|null)=>void;
  recordMode?:boolean;
}) {
  const fileRef=useRef<HTMLInputElement>(null);
  const cameraRef=useRef<HTMLInputElement>(null);
  const [phase,setPhase]=useState<"idle"|"scanning"|"result"|"error"|"manual">("idle");
  const [searchQuery,setSearchQuery]=useState("");
  const [searchResults,setSearchResults]=useState<any[]>([]);
  const [searching,setSearching]=useState(false);
  const [preview,setPreview]=useState<string|null>(null);
  const [result,setResult]=useState<ScanResult|null>(null);
  const [errMsg,setErrMsg]=useState("");
  const [recordStatus,setRecordStatus]=useState<"smoked"|"onMyList">("smoked");
  const [recordNote,setRecordNote]=useState("");
  const {t}=useLang();

  const scan=async(file:File)=>{
    setPhase("scanning");
    const reader=new FileReader();
    reader.onload=async(e)=>{
      const dataUrl=e.target?.result as string;
      const base64=dataUrl.split(",")[1];
      const mediaType=file.type||"image/jpeg";
      setPreview(dataUrl);
      try {
        const controller=new AbortController();
        const timeout=setTimeout(()=>controller.abort(),90000); // 90s timeout
        const res=await fetch("/api/scan",{method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({image:base64,mediaType}),
          signal:controller.signal});
        clearTimeout(timeout);
        const data=await res.json();
        if(data.ok&&data.cigar){setResult({...data.cigar,source:data.source});setPhase("result");}
        else{setErrMsg("Couldn't identify this band. Try a clearer photo.");setPhase("error");}
      } catch(err:any) {
        if(err?.name==="AbortError"){setErrMsg("Scan timed out. Try a clearer photo in better light.");setPhase("error");}
        else{setErrMsg("Connection error. Please try again.");setPhase("error");}
      }
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
          <div style={{fontSize:10,letterSpacing:5,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif"}}>{recordMode?"Record":"Collection"}</div>
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
              <div style={{marginBottom:16}}><SvgIcon id="search" size={48}/></div>
              <div style={{fontSize:17,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:8}}>
                Photo a Cigar Band
              </div>
              <div style={{fontSize:15,color:T.textMuted,lineHeight:1.6}}>
                Tap to open camera or choose a photo.<br/>AI will identify brand, line, and vitola.
              </div>
            </div>
            <button onClick={()=>cameraRef.current?.click()}
              style={{width:"100%",padding:"16px",
                background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                border:"none",borderRadius:14,color:"#111111",fontSize:15,
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
            {recordMode && (
              <button onClick={()=>setPhase("manual")}
                style={{width:"100%",padding:"14px",background:"none",
                  border:"none",color:T.textMuted,
                  fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif",
                  textDecoration:"underline"}}>
                Skip photo — search manually
              </button>
            )}
          </div>
        )}

        {/* MANUAL SEARCH */}
        {phase==="manual" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <input value={searchQuery}
              onChange={e=>{
                const val=e.target.value;
                setSearchQuery(val);
                if(val.trim().length<2){setSearchResults([]);return;}
                setSearching(true);
                // Search catalog + local collection
                const localCigars=JSON.parse(localStorage.getItem('mh_cigars')||'[]');
                const q=val.trim().toLowerCase();
                const localMatches=localCigars.filter((c:any)=>
                  (c.brand&&c.brand.toLowerCase().includes(q))||(c.line&&c.line.toLowerCase().includes(q))
                ).map((c:any)=>({id:c.id,brand:c.brand,line:c.line,cigar_name:c.vitola,
                  country:c.origin,wrapper:c.wrapper,description:c.notes||"",_local:true}));
                fetch(`/api/cigar-search?q=${encodeURIComponent(val.trim())}`)
                  .then(r=>r.json())
                  .then(d=>setSearchResults([...localMatches,...(d.results||[])]))
                  .catch(()=>setSearchResults(localMatches))
                  .finally(()=>setSearching(false));
              }}
              placeholder="Search brand or line (e.g. Padron)"
              autoFocus
              style={{width:"100%",background:"rgba(0,0,0,0.2)",border:`1px solid ${T.border}`,
                borderRadius:10,padding:"14px 16px",color:T.textPrimary,fontSize:15,
                outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif"}}/>

            {searching && (
              <div style={{textAlign:"center",color:T.textMuted,fontFamily:"Georgia,serif",
                fontStyle:"italic",fontSize:13,padding:"12px 0"}}>Searching…</div>
            )}

            {!searching && searchResults.length>0 && (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {searchResults.map((r:any)=>(
                  <button key={r.id}
                    onClick={()=>{
                      setResult({
                        brand:r.brand||"",
                        line:r.line||"",
                        vitola:r.cigar_name||r.vitola||"",
                        origin:r.country||"",
                        wrapper:r.wrapper||"",
                        rating:null,
                        confidence:"manual",
                        notes:r.description||""
                      });
                      setPreview(null);
                      setPhase("result");
                    }}
                    style={{textAlign:"left",background:T.card,border:`1px solid ${T.border}`,
                      borderRadius:10,padding:"12px 14px",cursor:"pointer"}}>
                    <div style={{fontSize:14,fontWeight:"bold",color:T.textPrimary,
                      fontFamily:"Georgia,serif"}}>{r.brand} {r.line}</div>
                    {r.cigar_name&&<div style={{fontSize:12,color:T.textMuted,
                      fontFamily:"Georgia,serif",marginTop:2}}>{r.cigar_name}</div>}
                  </button>
                ))}
              </div>
            )}

            {!searching&&searchQuery.trim().length>=2&&searchResults.length===0&&(
              <div style={{textAlign:"center",color:T.textMuted,fontFamily:"Georgia,serif",
                fontStyle:"italic",fontSize:13,padding:"12px 0"}}>
                No matches found — try a different spelling, or enter it manually below.
              </div>
            )}

            <button onClick={()=>{
                setResult({brand:"",line:"",vitola:"",origin:"",wrapper:"",
                  rating:null,confidence:"manual",notes:""});
                setPreview(null);
                setPhase("result");
              }}
              style={{width:"100%",padding:"12px",background:"none",
                border:`1px solid ${T.borderGold}`,borderRadius:12,color:T.goldLight,
                fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif"}}>
              Enter details manually
            </button>

            <button onClick={()=>{setPhase("idle");setSearchQuery("");setSearchResults([]);}}
              style={{width:"100%",padding:"12px",background:"none",
                border:`1px solid ${T.border}`,borderRadius:12,color:T.textMuted,
                fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif"}}>
              Back to photo
            </button>
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
              <div style={{fontSize:17,color:T.textSecondary,fontFamily:"Georgia,serif",fontStyle:"italic"}}>
                Checking catalog, then asking Mario…
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
                    fontFamily:"Georgia,serif"}}>{result.confidence==="manual"?"Manual Entry":(result as any).source==="catalog"?"Catalog Verified":"Mario Identified"}</div>
                  {result.confidence!=="manual"&&(
                    <div style={{fontSize:10,color:confidenceColor(result.confidence),
                      background:`${confidenceColor(result.confidence)}18`,
                      border:`1px solid ${confidenceColor(result.confidence)}33`,
                      borderRadius:20,padding:"2px 10px",letterSpacing:1,textTransform:"uppercase"}}>
                      {result.confidence} confidence
                    </div>
                  )}
                </div>
                <div style={{fontSize:10,color:T.textSecondary,letterSpacing:3,textTransform:"uppercase",
                  fontFamily:"Georgia,serif",marginBottom:4}}>{result.brand}</div>
                <div style={{fontSize:24,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",
                  lineHeight:1.1,marginBottom:6}}>{result.line}</div>
                <div style={{fontSize:17,color:T.textSecondary,marginBottom:16}}>{result.vitola}</div>

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
                    fontSize:15,color:T.textSecondary,fontFamily:"Georgia,serif",fontStyle:"italic",lineHeight:1.7}}>
                    {result.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {recordMode ? (
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {result.confidence==="manual" && (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {[["Brand","brand"],["Line","line"],["Vitola","vitola"]].map(([ph,key])=>(
                      <input key={key}
                        value={(result as any)[key]||""}
                        onChange={e=>setResult(r=>r?{...r,[key]:e.target.value} as ScanResult:r)}
                        placeholder={ph}
                        style={{width:"100%",background:"rgba(0,0,0,0.2)",border:`1px solid ${T.border}`,
                          borderRadius:10,padding:"12px 14px",color:T.textPrimary,fontSize:14,
                          outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif"}}/>
                    ))}
                  </div>
                )}
                {/* Smoked / On My List toggle */}
                <div style={{display:"flex",borderRadius:12,overflow:"hidden",
                  border:`1px solid ${T.borderGold}`}}>
                  {(["smoked","onMyList"] as const).map(s=>(
                    <button key={s} onClick={()=>setRecordStatus(s)}
                      style={{flex:1,padding:"12px",border:"none",cursor:"pointer",
                        fontFamily:"Georgia,serif",fontSize:14,fontWeight:"bold",
                        background:recordStatus===s
                          ?"linear-gradient(135deg,#2a2a2a,#0a0a0a)"
                          :"transparent",
                        color:recordStatus===s?T.goldMid:T.textMuted}}>
                      {s==="smoked"?"Smoked":"On My List"}
                    </button>
                  ))}
                </div>
                {/* Optional note */}
                <textarea value={recordNote} onChange={e=>setRecordNote(e.target.value)}
                  placeholder="Add a quick note (optional)"
                  rows={3}
                  style={{width:"100%",background:"rgba(0,0,0,0.2)",border:`1px solid ${T.border}`,
                    borderRadius:10,padding:"12px 14px",color:T.textPrimary,fontSize:14,
                    outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif",resize:"vertical"}}/>
                <button
                  disabled={!result.brand?.trim()}
                  onClick={()=>onSaveToRecord?.(result,recordStatus,recordNote,preview)}
                  style={{width:"100%",padding:"15px",
                    background:result.brand?.trim()?"linear-gradient(135deg,#2a2a2a,#0a0a0a)":"rgba(255,255,255,0.05)",
                    border:`1px solid ${result.brand?.trim()?"rgba(196,154,40,0.3)":T.border}`,borderRadius:12,
                    color:result.brand?.trim()?T.goldMid:T.textMuted,fontSize:17,
                    fontWeight:"bold",cursor:result.brand?.trim()?"pointer":"not-allowed",fontFamily:"Georgia,serif"}}>
                  Save to Record
                </button>
                <button onClick={()=>{setPhase("idle");setPreview(null);setResult(null);setRecordNote("");}}
                  style={{width:"100%",padding:"12px",background:"none",
                    border:`1px solid ${T.border}`,borderRadius:12,color:T.textMuted,
                    fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif"}}>
                  {t("scan_another")}
                </button>
              </div>
            ) : (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={()=>onAddToCollection?.(result)}
                style={{width:"100%",padding:"15px",
                  background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                  border:"none",borderRadius:12,color:"#0a0a0a",fontSize:17,
                  fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
                {t("add_to_col_btn")}
              </button>
              <button onClick={()=>onSmokedOne?.(result)}
                style={{width:"100%",padding:"15px",
                  background:"linear-gradient(135deg,#7a1212,#a01818)",
                  border:"none",borderRadius:12,color:"#f0e8d8",fontSize:17,
                  fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
                {t("smoked_one")}
              </button>
              <button onClick={()=>onAddToJournal?.(result)}
                style={{width:"100%",padding:"15px",background:"none",
                  border:`1px solid ${T.borderGold}`,borderRadius:12,color:T.goldLight,
                  fontSize:17,cursor:"pointer",fontFamily:"Georgia,serif",fontWeight:"bold"}}>
                {t("log_to_journal")}
              </button>
              <button onClick={()=>{setPhase("idle");setPreview(null);setResult(null);}}
                style={{width:"100%",padding:"12px",background:"none",
                  border:`1px solid ${T.border}`,borderRadius:12,color:T.textMuted,
                  fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif"}}>
                {t("scan_another")}
              </button>
            </div>
            )}
          </div>
        )}

        {/* ERROR */}
        {phase==="error" && (
          <div style={{display:"flex",flexDirection:"column",gap:16,paddingTop:20}}>
            {preview && <img src={preview} alt="band" style={{width:"100%",borderRadius:14,
              border:`1px solid ${T.border}`,objectFit:"cover",maxHeight:200}}/>}
            <div style={{background:T.card,borderRadius:14,border:`1px solid rgba(122,18,18,0.4)`,
              padding:"20px",textAlign:"center"}}>
              <div style={{marginBottom:12}}><SvgIcon id="warning" size={32}/></div>
              <div style={{fontSize:17,color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:6}}>{errMsg}</div>
            </div>
            <button onClick={()=>{setPhase("idle");setPreview(null);}}
              style={{width:"100%",padding:"15px",
                background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                border:"none",borderRadius:12,color:"#111111",fontSize:14,
                fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
              {t("try_again")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

