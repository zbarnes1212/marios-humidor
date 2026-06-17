"use client";
import {T} from "@/lib/constants";
import React,{useState,useRef} from "react";

type VoiceResult={brand:string;line:string;vitola:string;origin:string;wrapper:string};

export function VoiceJournalModal({onClose,onSaveToRecord}:{
  onClose:()=>void;
  onSaveToRecord:(r:{brand:string;line:string;vitola:string;wrapper:string;origin:string},status:"smoked"|"onMyList",note:string,photo:string|null,rating:number)=>void;
}) {
  const [phase,setPhase]=useState<"search"|"recording"|"processing"|"confirm">("search");
  const [searchQuery,setSearchQuery]=useState("");
  const [searchResults,setSearchResults]=useState<any[]>([]);
  const [searching,setSearching]=useState(false);
  const [selectedCigar,setSelectedCigar]=useState<VoiceResult|null>(null);

  // Recording state
  const [transcript,setTranscript]=useState("");
  const [listening,setListening]=useState(false);
  const [speechSupported,setSpeechSupported]=useState(true);
  const recognitionRef=useRef<any>(null);

  // Confirm/edit state
  const [rating,setRating]=useState(3);
  const [pairing,setPairing]=useState("");
  const [notes,setNotes]=useState("");
  const [recordStatus,setRecordStatus]=useState<"smoked"|"onMyList">("smoked");
  const [extractError,setExtractError]=useState(false);

  const startRecording=()=>{
    setPhase("recording");
    setTranscript("");
    const SpeechRecognition=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(!SpeechRecognition){
      setSpeechSupported(false);
      return;
    }
    const recognition=new SpeechRecognition();
    recognition.continuous=true;
    recognition.interimResults=true;
    recognition.lang="en-US";
    let finalTranscript="";
    recognition.onresult=(event:any)=>{
      let interim="";
      for(let i=event.resultIndex;i<event.results.length;i++){
        if(event.results[i].isFinal){
          finalTranscript+=event.results[i][0].transcript+" ";
        }else{
          interim+=event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript+interim);
    };
    recognition.onerror=()=>{
      setListening(false);
    };
    recognition.onend=()=>{
      setListening(false);
    };
    recognitionRef.current=recognition;
    recognition.start();
    setListening(true);
  };

  const stopRecording=async()=>{
    recognitionRef.current?.stop();
    setListening(false);
    if(!transcript.trim()){
      // Nothing captured — let them type instead
      setPhase("confirm");
      setExtractError(false);
      return;
    }
    setPhase("processing");
    try{
      const res=await fetch("/api/journal-extract",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          transcript,
          cigarName:`${selectedCigar?.brand||""} ${selectedCigar?.line||""}`.trim()
        })
      });
      const data=await res.json();
      if(data.error) throw new Error(data.error);
      setRating(data.rating||3);
      setPairing(data.pairing||"");
      setNotes(data.notes||transcript);
      setExtractError(false);
    }catch(e){
      console.error("[voice journal] extraction failed:",e);
      // Fall back to raw transcript — don't lose what they said
      setNotes(transcript);
      setRating(3);
      setPairing("");
      setExtractError(true);
    }
    setPhase("confirm");
  };

  const save=()=>{
    if(!selectedCigar) return;
    onSaveToRecord(selectedCigar,recordStatus,notes,null,rating);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",
      display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}}>
      <div style={{width:"100%",maxWidth:480,background:"#0a0a0a",
        borderRadius:"20px 20px 0 0",border:`1px solid ${T.borderGold}`,
        borderBottom:"none",maxHeight:"88vh",overflowY:"auto",
        padding:"20px 20px calc(20px + env(safe-area-inset-bottom, 16px))"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontSize:10,letterSpacing:4,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif"}}>
            Speak Your Journal
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${T.border}`,
            borderRadius:"50%",width:32,height:32,color:T.textMuted,cursor:"pointer",fontSize:16}}>×</button>
        </div>

        {/* SEARCH PHASE */}
        {phase==="search" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{fontSize:14,color:T.textSecondary,fontFamily:"Georgia,serif",marginBottom:4}}>
              Which cigar are you journaling about?
            </div>
            <input value={searchQuery}
              onChange={e=>{
                const val=e.target.value;
                setSearchQuery(val);
                if(val.trim().length<2){setSearchResults([]);return;}
                setSearching(true);
                const localCigars=JSON.parse(localStorage.getItem('mh_cigars')||'[]');
                const q=val.trim().toLowerCase();
                const localMatches=localCigars.filter((c:any)=>
                  (c.brand&&c.brand.toLowerCase().includes(q))||(c.line&&c.line.toLowerCase().includes(q))
                ).map((c:any)=>({id:c.id,brand:c.brand,line:c.line,cigar_name:c.vitola,
                  country:c.origin,wrapper:c.wrapper,_local:true}));
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
                {searchResults.map((r:any,i:number)=>(
                  <button key={i}
                    onClick={()=>{
                      setSelectedCigar({
                        brand:r.brand||"",line:r.line||"",
                        vitola:r.cigar_name||r.vitola||"",
                        origin:r.country||"",wrapper:r.wrapper||""
                      });
                      setPhase("recording");
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
                setSelectedCigar({brand:searchQuery||"Unknown cigar",line:"",vitola:"",origin:"",wrapper:""});
                setPhase("recording");
              }}
              style={{width:"100%",padding:"12px",background:"none",
                border:`1px solid ${T.borderGold}`,borderRadius:12,color:T.goldLight,
                fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif"}}>
              Enter cigar name manually
            </button>
          </div>
        )}

        {/* RECORDING PHASE */}
        {phase==="recording" && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 0"}}>
            <div style={{fontSize:16,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:6}}>
              {selectedCigar?.brand} {selectedCigar?.line}
            </div>
            <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",marginBottom:28,textAlign:"center"}}>
              Tap the mic and tell me about it — flavor, draw, what you paired it with.
            </div>

            {!speechSupported ? (
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:13,color:T.textMuted,fontFamily:"Georgia,serif",
                  fontStyle:"italic",marginBottom:16}}>
                  Voice recording isn't supported in this browser.
                </div>
                <button onClick={()=>setPhase("confirm")}
                  style={{padding:"12px 24px",background:"none",border:`1px solid ${T.borderGold}`,
                    borderRadius:12,color:T.goldLight,fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif"}}>
                  Type it instead
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={listening?stopRecording:startRecording}
                  style={{width:84,height:84,borderRadius:"50%",border:"none",cursor:"pointer",
                    background:listening
                      ?"linear-gradient(135deg,#7a1212,#9c1c1c)"
                      :`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    boxShadow:listening?"0 0 0 8px rgba(122,18,18,0.2)":"0 0 0 8px rgba(196,154,40,0.15)",
                    transition:"box-shadow 0.3s"}}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2">
                    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                    <line x1="12" y1="18" x2="12" y2="22"/>
                  </svg>
                </button>
                <div style={{marginTop:16,fontSize:12,color:listening?"#e07a7a":T.textMuted,
                  fontFamily:"Georgia,serif",fontWeight:listening?"bold":"normal"}}>
                  {listening?"Listening — tap to finish":"Tap to start speaking"}
                </div>
                {transcript && (
                  <div style={{marginTop:20,width:"100%",background:"rgba(0,0,0,0.3)",
                    borderRadius:10,padding:"12px 14px",fontSize:13,color:T.textSecondary,
                    fontFamily:"Georgia,serif",fontStyle:"italic",lineHeight:1.6}}>
                    {transcript}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* PROCESSING PHASE */}
        {phase==="processing" && (
          <div style={{textAlign:"center",padding:"50px 0"}}>
            <div style={{fontSize:14,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>
              Mario's making sense of that…
            </div>
          </div>
        )}

        {/* CONFIRM/EDIT PHASE */}
        {phase==="confirm" && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{fontSize:16,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>
              {selectedCigar?.brand} {selectedCigar?.line}
            </div>

            {extractError && (
              <div style={{fontSize:12,color:"#e0a05a",fontFamily:"Georgia,serif",
                fontStyle:"italic",background:"rgba(224,160,90,0.08)",borderRadius:8,padding:"8px 12px"}}>
                Couldn't auto-process your note — your words are saved below, just double-check it.
              </div>
            )}

            <div style={{display:"flex",borderRadius:12,overflow:"hidden",border:`1px solid ${T.borderGold}`}}>
              {(["smoked","onMyList"] as const).map(s=>(
                <button key={s} onClick={()=>setRecordStatus(s)}
                  style={{flex:1,padding:"12px",border:"none",cursor:"pointer",
                    fontFamily:"Georgia,serif",fontSize:14,fontWeight:"bold",
                    background:recordStatus===s?"linear-gradient(135deg,#2a2a2a,#0a0a0a)":"transparent",
                    color:recordStatus===s?T.goldMid:T.textMuted}}>
                  {s==="smoked"?"Smoked":"On My List"}
                </button>
              ))}
            </div>

            <div>
              <div style={{fontSize:10,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",
                fontFamily:"Georgia,serif",marginBottom:6}}>Rating</div>
              <div style={{display:"flex",gap:4}}>
                {[1,2,3,4,5].map(i=>(
                  <span key={i} onClick={()=>setRating(i)}
                    style={{fontSize:28,cursor:"pointer",
                      color:i<=rating?T.goldLight:"rgba(255,255,255,0.15)"}}>★</span>
                ))}
              </div>
            </div>

            <textarea value={notes} onChange={e=>setNotes(e.target.value)}
              placeholder="Describe the experience — flavors, draw, burn, finish..."
              rows={4}
              style={{width:"100%",background:"rgba(0,0,0,0.2)",border:`1px solid ${T.border}`,
                borderRadius:10,padding:"12px 14px",color:T.textPrimary,fontSize:14,
                outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif",
                resize:"vertical",lineHeight:1.6}}/>

            <input value={pairing} onChange={e=>setPairing(e.target.value)}
              placeholder="Pairing (e.g. Blanton's, espresso)"
              style={{width:"100%",background:"rgba(0,0,0,0.2)",border:`1px solid ${T.border}`,
                borderRadius:10,padding:"12px 14px",color:T.textPrimary,fontSize:14,
                outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif"}}/>

            <div style={{display:"flex",gap:8,marginTop:6}}>
              <button onClick={save}
                disabled={!notes.trim()}
                style={{flex:1,padding:"14px",
                  background:notes.trim()?"linear-gradient(135deg,#2a2a2a,#0a0a0a)":"rgba(255,255,255,0.05)",
                  border:`1px solid ${notes.trim()?"rgba(196,154,40,0.3)":T.border}`,borderRadius:12,
                  color:notes.trim()?T.goldMid:T.textMuted,fontSize:15,fontWeight:"bold",
                  cursor:notes.trim()?"pointer":"not-allowed",fontFamily:"Georgia,serif"}}>
                Save to Journal
              </button>
              <button onClick={()=>{setPhase("recording");setTranscript("");}}
                style={{padding:"14px 16px",background:"none",border:`1px solid ${T.border}`,
                  borderRadius:12,color:T.textMuted,fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif"}}>
                Re-record
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
