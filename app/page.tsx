"use client";
import React,{ useState, useEffect, useRef, useId, useCallback, createContext, useContext } from "react";
import SplashScreen from "@/components/SplashScreen";

const T = {
  bg:"#0a0a0a", card:"#111111", cardMid:"#161616",
  border:"rgba(160,120,40,0.14)", borderGold:"rgba(160,120,40,0.38)",
  goldDark:"#8B6914", goldMid:"#C49A28", goldLight:"#e8c84a",
  textPrimary:"#ede0cc", textSecondary:"#9a7848", textMuted:"#5a3c1e", textGold:"#C49A28",
  success:"#2a5c38", danger:"#7a1212", blue:"#0c1420", blueMid:"#1a2c50",
};
const r2=(n:number)=>Math.round(n*100)/100;

// ── TRANSLATIONS ────────────────────────────────────────────────────────────
type LangCode="en"|"es"|"pt"|"fr"|"de";
const LANGS:{code:LangCode;flag:string;name:string}[]=[
  {code:"en",flag:"🇺🇸",name:"English"},
  {code:"es",flag:"🇪🇸",name:"Español"},
  {code:"pt",flag:"🇧🇷",name:"Português"},
  {code:"fr",flag:"🇫🇷",name:"Français"},
  {code:"de",flag:"🇩🇪",name:"Deutsch"},
];
const TRANSLATIONS:{[K in LangCode]:Record<string,string>}={
  en:{
    // Nav
    nav_home:"Feed",nav_collection:"Collection",nav_mario:"Mario",nav_humidors:"Humidors",nav_community:"Social Club",nav_profile:"Profile",
    // Home
    greeting_morning:"Good morning",greeting_afternoon:"Good afternoon",greeting_evening:"Good evening",
    welcome_back:"Welcome back to the lounge.",
    // Humidors
    my_humidors:"My Humidors",sensor_offline:"Sensor offline",sensor_updating:"Updating…",
    optimal:"Optimal",good:"Good",warning:"Warning",no_data:"No Data",
    cigars:"Cigars",updated:"Updated",
    // Collection
    total_cigars:"Total Cigars",avg_rating:"Avg Rating",
    add_manually:"+ Add Manually",journal_btn:"📓 Journal",
    add_to_collection:"Add to Collection",save_to_collection:"Save to Collection",
    scan_another:"Scan Another",smoked_one:"🔥 Smoked One — Remove from Inventory",log_to_journal:"📓 Log to Tasting Journal",
    brand:"Brand",line:"Line",vitola:"Vitola",origin:"Origin",wrapper:"Wrapper",count:"Count",rating:"Rating",
    edit:"✏️ Edit",save:"Save",cancel:"Cancel",
    pts:"Pts",
    // Tasting Journal
    tasting_journal:"Tasting Journal",collectors_journal:"Collector's Journal",log_entry:"+ Log",
    save_entry:"Save Entry",
    paired_with:"Paired with",
    describe_exp:"Describe the experience — flavors, draw, burn, finish...",
    // Ask Mario
    ask_mario:"Ask Mario",sommelier_title:"Master Cigar Sommelier · Private Lounge",
    ask_placeholder:"Ask Mario anything...",
    quick_recommend:"Recommend me a cigar",quick_humidor:"Humidor advice",
    quick_pairing:"Pairing suggestion",quick_tonight:"What should I smoke tonight?",
    // Settings
    settings:"Settings",language:"Language",language_sub:"App language & Mario's responses",
    account:"Account",collection_s:"Collection",api_s:"API",sensors_s:"Sensors",notifications_s:"Notifications",
    temp_unit:"Temperature Unit",temp_sub:"Display preference",
    api_key_title:"Anthropic API Key",api_key_sub:"Required for Ask Mario, Band Scanner, and Mario's Take on news.",
    api_connected:"API Key Connected",remove_key:"Remove Key",save_key:"Save API Key",
    hum_alert:"Humidity Alerts",hum_alert_sub:"Alert when below 65% RH",
    temp_alert:"Temperature Alerts",temp_alert_sub:"Alert when above 70°F",
    // Scanner
    try_again:"Try Again",add_to_col_btn:"+ Add to Collection",
  },
  es:{
    nav_home:"Inicio",nav_collection:"Colección",nav_mario:"Mario",nav_community:"Club Social",nav_profile:"Perfil",
    greeting_morning:"Buenos días",greeting_afternoon:"Buenas tardes",greeting_evening:"Buenas noches",
    welcome_back:"Bienvenido al salón.",
    my_humidors:"Mis Humidores",sensor_offline:"Sensor desconectado",sensor_updating:"Actualizando…",
    optimal:"Óptimo",good:"Bien",warning:"Alerta",no_data:"Sin datos",
    cigars:"Puros",updated:"Actualizado",
    total_cigars:"Total de Puros",avg_rating:"Puntuación Media",
    add_manually:"+ Añadir Manual",journal_btn:"📓 Diario",
    add_to_collection:"Añadir a Colección",save_to_collection:"Guardar en Colección",
    scan_another:"Escanear Otro",smoked_one:"🔥 Fumado — Eliminar del Inventario",log_to_journal:"📓 Registrar en Diario",
    brand:"Marca",line:"Línea",vitola:"Vitola",origin:"Origen",wrapper:"Capa",count:"Cantidad",rating:"Puntuación",
    edit:"✏️ Editar",save:"Guardar",cancel:"Cancelar",
    pts:"Pts",
    tasting_journal:"Diario de Cata",collectors_journal:"Diario del Coleccionista",log_entry:"+ Registrar",
    save_entry:"Guardar Entrada",paired_with:"Maridado con",describe_exp:"Describe la experiencia — sabores, tiro, combustión, retrogusto...",
    ask_mario:"Pregunta a Mario",sommelier_title:"Sommelier Maestro · Salón Privado",
    ask_placeholder:"Pregunta lo que quieras a Mario...",
    quick_recommend:"Recomiéndame un puro",quick_humidor:"Consejo de humidor",
    quick_pairing:"Sugerencia de maridaje",quick_tonight:"¿Qué debería fumar esta noche?",
    settings:"Ajustes",language:"Idioma",language_sub:"Idioma de la app y respuestas de Mario",
    account:"Cuenta",collection_s:"Colección",api_s:"API",sensors_s:"Sensores",notifications_s:"Notificaciones",
    temp_unit:"Unidad de Temperatura",temp_sub:"Preferencia de visualización",
    api_key_title:"Clave API de Anthropic",api_key_sub:"Requerida para Preguntar a Mario, Escáner y opinión de Mario.",
    api_connected:"Clave API Conectada",remove_key:"Eliminar Clave",save_key:"Guardar Clave API",
    hum_alert:"Alertas de Humedad",hum_alert_sub:"Alerta cuando baja del 65% RH",
    temp_alert:"Alertas de Temperatura",temp_alert_sub:"Alerta cuando supera los 70°F",
    try_again:"Intentar de Nuevo",add_to_col_btn:"+ Añadir a Colección",
  },
  pt:{
    nav_home:"Início",nav_collection:"Coleção",nav_mario:"Mario",nav_community:"Clube Social",nav_profile:"Perfil",
    greeting_morning:"Bom dia",greeting_afternoon:"Boa tarde",greeting_evening:"Boa noite",
    welcome_back:"Bem-vindo ao salão.",
    my_humidors:"Meus Humidores",sensor_offline:"Sensor offline",sensor_updating:"Atualizando…",
    optimal:"Ótimo",good:"Bom",warning:"Atenção",no_data:"Sem Dados",
    cigars:"Charutos",updated:"Atualizado",
    total_cigars:"Total de Charutos",avg_rating:"Avaliação Média",
    add_manually:"+ Adicionar Manual",journal_btn:"📓 Diário",
    add_to_collection:"Adicionar à Coleção",save_to_collection:"Salvar na Coleção",
    scan_another:"Escanear Outro",smoked_one:"🔥 Fumado — Remover do Inventário",log_to_journal:"📓 Registrar no Diário",
    brand:"Marca",line:"Linha",vitola:"Vitola",origin:"Origem",wrapper:"Capa",count:"Quantidade",rating:"Avaliação",
    edit:"✏️ Editar",save:"Salvar",cancel:"Cancelar",
    pts:"Pts",
    tasting_journal:"Diário de Degustação",collectors_journal:"Diário do Colecionador",log_entry:"+ Registrar",
    save_entry:"Salvar Entrada",paired_with:"Harmonizado com",describe_exp:"Descreva a experiência — sabores, tiragem, queima, finalização...",
    ask_mario:"Pergunte ao Mario",sommelier_title:"Sommelier Mestre · Salão Privado",
    ask_placeholder:"Pergunte qualquer coisa ao Mario...",
    quick_recommend:"Me recomende um charuto",quick_humidor:"Conselhos de humidor",
    quick_pairing:"Sugestão de harmonização",quick_tonight:"O que devo fumar esta noite?",
    settings:"Configurações",language:"Idioma",language_sub:"Idioma do app e respostas do Mario",
    account:"Conta",collection_s:"Coleção",api_s:"API",sensors_s:"Sensores",notifications_s:"Notificações",
    temp_unit:"Unidade de Temperatura",temp_sub:"Preferência de exibição",
    api_key_title:"Chave API Anthropic",api_key_sub:"Necessária para Perguntar ao Mario, Scanner e opinião do Mario.",
    api_connected:"Chave API Conectada",remove_key:"Remover Chave",save_key:"Salvar Chave API",
    hum_alert:"Alertas de Umidade",hum_alert_sub:"Alerta quando abaixo de 65% RH",
    temp_alert:"Alertas de Temperatura",temp_alert_sub:"Alerta quando acima de 70°F",
    try_again:"Tentar Novamente",add_to_col_btn:"+ Adicionar à Coleção",
  },
  fr:{
    nav_home:"Accueil",nav_collection:"Collection",nav_mario:"Mario",nav_community:"Club Social",nav_profile:"Profil",
    greeting_morning:"Bonjour",greeting_afternoon:"Bon après-midi",greeting_evening:"Bonsoir",
    welcome_back:"Bienvenue au salon.",
    my_humidors:"Mes Humidors",sensor_offline:"Capteur hors ligne",sensor_updating:"Mise à jour…",
    optimal:"Optimal",good:"Bon",warning:"Attention",no_data:"Pas de Données",
    cigars:"Cigares",updated:"Mis à jour",
    total_cigars:"Total Cigares",avg_rating:"Note Moyenne",
    add_manually:"+ Ajouter Manuellement",journal_btn:"📓 Journal",
    add_to_collection:"Ajouter à la Collection",save_to_collection:"Enregistrer dans la Collection",
    scan_another:"Scanner un Autre",smoked_one:"🔥 Fumé — Retirer de l'Inventaire",log_to_journal:"📓 Enregistrer dans le Journal",
    brand:"Marque",line:"Ligne",vitola:"Vitola",origin:"Origine",wrapper:"Cape",count:"Quantité",rating:"Note",
    edit:"✏️ Modifier",save:"Enregistrer",cancel:"Annuler",
    pts:"Pts",
    tasting_journal:"Journal de Dégustation",collectors_journal:"Journal du Collectionneur",log_entry:"+ Enregistrer",
    save_entry:"Sauvegarder",paired_with:"Accompagné de",describe_exp:"Décrivez l'expérience — saveurs, tirage, combustion, finale...",
    ask_mario:"Demandez à Mario",sommelier_title:"Maître Sommelier · Salon Privé",
    ask_placeholder:"Demandez tout à Mario...",
    quick_recommend:"Recommandez-moi un cigare",quick_humidor:"Conseils pour humidor",
    quick_pairing:"Suggestion d'accord",quick_tonight:"Que devrais-je fumer ce soir ?",
    settings:"Paramètres",language:"Langue",language_sub:"Langue de l'appli et réponses de Mario",
    account:"Compte",collection_s:"Collection",api_s:"API",sensors_s:"Capteurs",notifications_s:"Notifications",
    temp_unit:"Unité de Température",temp_sub:"Préférence d'affichage",
    api_key_title:"Clé API Anthropic",api_key_sub:"Requise pour Mario, le Scanner et les avis de Mario.",
    api_connected:"Clé API Connectée",remove_key:"Supprimer la Clé",save_key:"Enregistrer la Clé API",
    hum_alert:"Alertes d'Humidité",hum_alert_sub:"Alerte sous 65% HR",
    temp_alert:"Alertes de Température",temp_alert_sub:"Alerte au-dessus de 70°F",
    try_again:"Réessayer",add_to_col_btn:"+ Ajouter à la Collection",
  },
  de:{
    nav_home:"Start",nav_collection:"Sammlung",nav_mario:"Mario",nav_community:"Social Club",nav_profile:"Profil",
    greeting_morning:"Guten Morgen",greeting_afternoon:"Guten Tag",greeting_evening:"Guten Abend",
    welcome_back:"Willkommen in der Lounge.",
    my_humidors:"Meine Humidore",sensor_offline:"Sensor offline",sensor_updating:"Aktualisierung…",
    optimal:"Optimal",good:"Gut",warning:"Warnung",no_data:"Keine Daten",
    cigars:"Zigarren",updated:"Aktualisiert",
    total_cigars:"Zigarren Gesamt",avg_rating:"Ø Bewertung",
    add_manually:"+ Manuell Hinzufügen",journal_btn:"📓 Journal",
    add_to_collection:"Zur Sammlung Hinzufügen",save_to_collection:"In Sammlung Speichern",
    scan_another:"Weiteres Scannen",smoked_one:"🔥 Geraucht — Aus Inventar Entfernen",log_to_journal:"📓 Im Journal Eintragen",
    brand:"Marke",line:"Linie",vitola:"Vitola",origin:"Herkunft",wrapper:"Deckblatt",count:"Anzahl",rating:"Bewertung",
    edit:"✏️ Bearbeiten",save:"Speichern",cancel:"Abbrechen",
    pts:"Pkt",
    tasting_journal:"Verkostungsjournal",collectors_journal:"Sammler-Journal",log_entry:"+ Eintragen",
    save_entry:"Eintrag Speichern",paired_with:"Gereicht mit",describe_exp:"Beschreibe das Erlebnis — Aromen, Zug, Abbrand, Abgang...",
    ask_mario:"Mario Fragen",sommelier_title:"Meister-Sommelier · Private Lounge",
    ask_placeholder:"Frag Mario was auch immer...",
    quick_recommend:"Empfiehl mir eine Zigarre",quick_humidor:"Humidor-Ratschlag",
    quick_pairing:"Kombinationsvorschlag",quick_tonight:"Was soll ich heute Abend rauchen?",
    settings:"Einstellungen",language:"Sprache",language_sub:"App-Sprache & Marios Antworten",
    account:"Konto",collection_s:"Sammlung",api_s:"API",sensors_s:"Sensoren",notifications_s:"Benachrichtigungen",
    temp_unit:"Temperatureinheit",temp_sub:"Anzeigeeinstellung",
    api_key_title:"Anthropic API-Schlüssel",api_key_sub:"Erforderlich für Mario, Scanner und Marios Bewertungen.",
    api_connected:"API-Schlüssel Verbunden",remove_key:"Schlüssel Entfernen",save_key:"API-Schlüssel Speichern",
    hum_alert:"Feuchtigkeitsalarme",hum_alert_sub:"Alarm unter 65% RH",
    temp_alert:"Temperaturalarme",temp_alert_sub:"Alarm über 70°F",
    try_again:"Erneut Versuchen",add_to_col_btn:"+ Zur Sammlung Hinzufügen",
  },
};

// ── LANGUAGE CONTEXT ────────────────────────────────────────────────────────
const LangContext=createContext<{lang:LangCode;t:(k:string)=>string;setLang:(l:LangCode)=>void}>({
  lang:"en",t:(k)=>TRANSLATIONS.en[k]??k,setLang:()=>{},
});
function useLang(){return useContext(LangContext);}
function LangProvider({children}:{children:React.ReactNode}){
  const [lang,setLangState]=useState<LangCode>("en");
  useEffect(()=>{
    try{const s=localStorage.getItem("mh_lang");if(LANGS.find(l=>l.code===s))setLangState(s as LangCode);}catch{}
  },[]);
  const setLang=(l:LangCode)=>{
    setLangState(l);
    try{localStorage.setItem("mh_lang",l);}catch{}
  };
  const t=(k:string)=>TRANSLATIONS[lang][k]??TRANSLATIONS.en[k]??k;
  return <LangContext.Provider value={{lang,t,setLang}}>{children}</LangContext.Provider>;
}
const polar=(cx:number,cy:number,r:number,deg:number)=>{const a=(deg-90)*Math.PI/180;return{x:r2(cx+r*Math.cos(a)),y:r2(cy+r*Math.sin(a))};};



function CedarBg() {
  return <div style={{position:"fixed",inset:0,zIndex:0,
    background:"#0a0a0a"}}/>;
}

function MMedallion({size=32}:{size?:number}) {
  return <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,
    background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
    display:"flex",alignItems:"center",justifyContent:"center",
    fontSize:size*0.44,fontWeight:"bold",color:"#1a0e04",fontFamily:"Georgia,serif",
    boxShadow:`0 2px 10px ${T.goldDark}44`}}>M</div>;
}

// GAUGE — ivory face, gold bezel, red needle
function LuxuryGauge({value,size,label,subtitle,min=20,max=100}:{value:number;size:number;label:string;subtitle:string;min?:number;max?:number;}) {
  const uid=useId().replace(/:/g,"");
  const [m,setM]=useState(false);
  useEffect(()=>{setM(true);},[]);
  const cx=size/2,cy=size/2,outerR=size*0.46,arcR=size*0.40;
  const s0=-225,s1=50,range=s1-s0,pct=Math.max(0,Math.min(1,(value-min)/(max-min)));
  const ticks=Array.from({length:25},(_,i)=>{const ang=s0+(i/24)*range,maj=i%6===0,mid=i%3===0;const r1=outerR*(maj?0.66:mid?0.73:0.80),r2=outerR*0.91;const p1=polar(cx,cy,r1,ang),p2=polar(cx,cy,r2,ang);return{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y,maj,mid};});
  const ldata=[{v:20,a:s0},{v:40,a:s0+range*0.25},{v:60,a:s0+range*0.5},{v:80,a:s0+range*0.75},{v:100,a:s1}];
  const na=s0+pct*range,np=polar(cx,cy,outerR*0.70,na),ntp=polar(cx,cy,outerR*0.14,na+180);
  const ap1=polar(cx,cy,arcR,s0+((65-min)/(max-min))*range),ap2=polar(cx,cy,arcR,s0+((72-min)/(max-min))*range);
  if(!m) return <div style={{width:size,height:size,borderRadius:"50%",background:"#f5ede0",border:`3px solid ${T.goldMid}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:T.goldDark,fontSize:size*0.22,fontFamily:"Georgia,serif",fontWeight:"bold"}}>{value}</span></div>;
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{filter:"drop-shadow(0 4px 18px rgba(0,0,0,0.55))"}}>
      <defs>
        <radialGradient id={`${uid}b`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f0d870"/><stop offset="40%" stopColor="#c49a28"/><stop offset="75%" stopColor="#8B6914"/><stop offset="100%" stopColor="#c49a28"/></radialGradient>
        <radialGradient id={`${uid}d`} cx="38%" cy="32%" r="68%"><stop offset="0%" stopColor="#fdfaf4"/><stop offset="50%" stopColor="#f5ede0"/><stop offset="100%" stopColor="#ecdcc8"/></radialGradient>
        <radialGradient id={`${uid}g`} cx="30%" cy="25%" r="65%"><stop offset="0%" stopColor="rgba(255,255,255,0.22)"/><stop offset="100%" stopColor="rgba(255,255,255,0)"/></radialGradient>
        <linearGradient id={`${uid}n`} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8B6914"/><stop offset="50%" stopColor="#e8c84a"/><stop offset="100%" stopColor="#8B6914"/></linearGradient>
        <radialGradient id={`${uid}c`} cx="40%" cy="35%" r="65%"><stop offset="0%" stopColor="#f0d860"/><stop offset="100%" stopColor="#8B6914"/></radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={outerR*1.12} fill="rgba(0,0,0,0.35)"/>
      <circle cx={cx} cy={cy} r={outerR*1.08} fill={`url(#${uid}b)`}/>
      <circle cx={cx} cy={cy} r={outerR*1.01} fill="#3d2a08"/>
      <circle cx={cx} cy={cy} r={outerR} fill={`url(#${uid}d)`}/>
      <path d={`M ${ap1.x} ${ap1.y} A ${arcR} ${arcR} 0 0 1 ${ap2.x} ${ap2.y}`} stroke={T.success} strokeWidth={r2(size*0.018)} fill="none" opacity={0.5} strokeLinecap="round"/>
      {ticks.map((t,i)=><line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.maj?"#2a1608":t.mid?"#6a4820":"#b89860"} strokeWidth={r2(t.maj?size*0.016:t.mid?size*0.009:size*0.005)} opacity={t.maj?0.85:t.mid?0.6:0.35}/>)}
      {ldata.map((l,i)=>{const lp=polar(cx,cy,outerR*0.54,l.a);return <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize={r2(size*0.09)} fontFamily="Georgia,serif" fontWeight="bold" fill="#2a1608" opacity={0.75}>{l.v}</text>;})}
      <text x={cx} y={r2(cy-outerR*0.24)} textAnchor="middle" fontSize={r2(size*0.08)} fill="#7a5030" fontFamily="Georgia,serif" fontStyle="italic">{subtitle}</text>
      <line x1={r2(ntp.x+0.8)} y1={r2(ntp.y+0.8)} x2={r2(np.x+0.8)} y2={r2(np.y+0.8)} stroke="rgba(0,0,0,0.1)" strokeWidth={r2(size*0.024)} strokeLinecap="round"/>
      <line x1={ntp.x} y1={ntp.y} x2={np.x} y2={np.y} stroke={`url(#${uid}n)`} strokeWidth={r2(size*0.021)} strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r={r2(size*0.082)} fill="#3d2a08"/>
      <circle cx={cx} cy={cy} r={r2(size*0.062)} fill={`url(#${uid}c)`}/>
      <circle cx={cx} cy={cy} r={r2(size*0.028)} fill="#1a0e04"/>
      <circle cx={cx} cy={cy} r={outerR} fill={`url(#${uid}g)`}/>
    </svg>
    {label&&<div style={{marginTop:10,textAlign:"center"}}>
      <span style={{fontSize:r2(size*0.28),fontWeight:"bold",color:T.goldLight,fontFamily:"Georgia,serif",lineHeight:1,letterSpacing:-1}}>{value}</span>
      <span style={{fontSize:r2(size*0.12),color:T.textGold,marginLeft:3,fontFamily:"Georgia,serif"}}>{label}</span>
    </div>}
  </div>;
}


// DATA
const HUMIDORS:any[]=[];
type CigarEntry={id:number;brand:string;line:string;vitola:string;origin:string;wrapper:string;rating:number;count:number;purchaseDate:string;bandColor:string;humidorId:number};
const CIGARS:CigarEntry[]=[];

// Map vitola + wrapper → placeholder cigar image
function getCigarImage(vitola:string,wrapper:string):string {
  const v=vitola.toLowerCase();
  const w=wrapper.toLowerCase();
  // Determine shape
  const shape=v.includes("torpedo")?"torpedo"
    :v.includes("churchill")?"churchill"
    :v.includes("toro")?"toro"
    :v.includes("figurado")?"figurado"
    :v.includes("corona")?"corona"
    :"robusto";
  // Determine wrapper category
  const wrap=w.includes("oscuro")?"oscuro"
    :w.includes("maduro")?"maduro"
    :w.includes("claro")&&w.includes("colorado")?"colorado-claro"
    :w.includes("claro")||w.includes("connecticut")?"claro"
    :"colorado";
  return `/cigar-${wrap}-${shape}.png`;
}
const NOTES_INIT=[
  {id:1,brand:"Padrón",line:"1964 Anniversary",vitola:"Exclusivo",date:"May 28, 2026",rating:5,
    notes:"Rich dark chocolate and dried fruit — 31 months of aging has transformed this completely. The draw is effortless, burn line ruler-straight. A meditation in a stick.",pairing:"Blanton's Single Barrel"},
  {id:2,brand:"Arturo Fuente",line:"Opus X",vitola:"Robusto",date:"May 15, 2026",rating:5,
    notes:"Spicy cedar entry, black pepper through the first third. Creamy sweetness emerges at the midpoint. Complex, rewarding.",pairing:"Glenfarclas 25yr"},
];
const POSTS_INIT=[
  {id:1,user:"CigarDon_85",avatar:"C",badge:"Top Reviewer",category:"Review",time:"2h ago",
    title:"Opus X Double Corona — worth the wait",
    body:"Finally cracked one I've been aging 3 years. The complexity is unreal — espresso, dark chocolate, leather. The patience was worth every month.",
    likes:24,comments:8,liked:false},
  {id:2,user:"HumidorQueen",avatar:"H",badge:"Pairing Pro",category:"Pairing",time:"1h ago",
    title:"Padrón 1926 + Glenfarclas 25yr",
    body:"The sherry cask and natural wrapper are a match made in heaven. Tried this last night on the back porch. Absolutely transcendent.",
    likes:41,comments:15,liked:false},
  {id:3,user:"SlowBurn_Mike",avatar:"S",badge:"",category:"Question",time:"3h ago",
    title:"Humidity dropped to 62% — how long to recover?",
    body:"Came home to find my main humidor at 62%. Added a recharged Boveda. Anyone had experience with recovery time?",
    likes:7,comments:22,liked:false},
];
const NEWS=[
  {id:1,title:"Padrón 1964 Anniversary Series — A Retrospective",summary:"Forty years of Nicaraguan excellence. How the Padrón family changed premium cigars forever.",source:"Cigar Aficionado",date:"May 30, 2026",accent:"#7a1212",
    image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    link:"https://www.cigaraficionado.com/top25cigar/padron-1964-anniversary-series-torpedo-natural"},
  {id:2,title:"Arturo Fuente Opus X: The Story Behind the Legend",summary:"How a Dominican factory became the most coveted cigar in the world.",source:"Halfwheel",date:"May 29, 2026",accent:T.goldMid,
    image:"https://images.unsplash.com/photo-1571066811602-716837d681de?w=600&q=80",
    link:"https://halfwheel.com/tag/opusx/"},
  {id:3,title:"2026 Cigar of the Year Contenders Revealed",summary:"From Nicaragua to Honduras, the top-rated cigars of the year so far.",source:"Cigar Advisor",date:"May 28, 2026",accent:"#2a5c38",
    image:"https://images.unsplash.com/photo-1562016600-ece13e8ba570?w=600&q=80",
    link:"https://www.cigarjournal.com/ratings-and-awards/top-25-cigars/"},
  {id:4,title:"Humidity Control: The Science Behind the Perfect Humidor",summary:"Cedar aging, the 70/70 rule, and why Boveda may be changing everything.",source:"Halfwheel",date:"May 27, 2026",accent:"#1a2c50",
    image:"https://images.unsplash.com/photo-1585553616435-2dc0a54e1a6b?w=600&q=80",
    link:"https://halfwheel.com/humi-care-seasoning-wipes/380946/"},
];

// ── HUMIDORS SCREEN ────────────────────────────────────────────────────────
function HumidorsTab({liveData,liveStatus,lastUpdated,onRefresh}:{
  liveData:Record<string,{temperature:number|null;humidity:number|null;observedAt:string|null}>;
  liveStatus:"idle"|"loading"|"connected"|"error";
  lastUpdated:string|null;
  onRefresh:()=>void;
}) {
  type Humidor={id:number;name:string;wood:string;capacity:number;status:string;photo?:string};
  const [humidors,setHumidors]=useState<Humidor[]>([]);
  const [mounted,setMounted]=useState(false);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({name:"",wood:"Spanish Cedar",capacity:"150"});
  const [selectedHumidor,setSelectedHumidor]=useState<number|null>(null);
  const [historyRange,setHistoryRange]=useState<'24H'|'7D'|'30D'|'90D'>('24H');
  const [expandedCigars,setExpandedCigars]=useState<number|null>(null);
  const {t}=useLang();

  const HUMIDOR_COLORS=['#3dd68c','#C49A28','#6a9fe0','#e07a5f','#b67ee0'];
  const getHistoryData=(id:number)=>{
    const h=humidors.find(hh=>hh.id===id);
    const live=h?getLive(h.name):null;
    const currentHumidity=live?.humidity??null;
    // If we have a live reading, show it as a flat line at current value
    // Future: store time-series data in an API route
    if(currentHumidity&&currentHumidity>0){
      return Array(24).fill(currentHumidity);
    }
    // Fallback mock data per humidor
    const base=[68,69,70,69,68,67,68,69,70,71,70,69,68,67,68,69,70,69,68,69,70,69,68,67];
    return base.map(v=>Math.max(60,Math.min(80,v+(id%3)-1)));
  };

  useEffect(()=>{
    try{const s=localStorage.getItem('mh_humidors');if(s)setHumidors(JSON.parse(s));}catch{}
    setMounted(true);
  },[]);

  useEffect(()=>{
    if(!mounted) return;
    try{localStorage.setItem('mh_humidors',JSON.stringify(humidors));}catch{}
  },[humidors,mounted]);

  const getLive=(name:string)=>liveData[name]??null;
  const connected=liveStatus==="connected";

  const addHumidor=()=>{
    if(!form.name.trim()) return;
    const newH:Humidor={id:Date.now(),name:form.name.trim(),wood:form.wood,
      capacity:parseInt(form.capacity)||150,status:"no_data"};
    setHumidors(h=>[...h,newH]);
    setForm({name:"",wood:"Spanish Cedar",capacity:"150"});
    setShowForm(false);
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
    color:T.textPrimary,fontSize:13,outline:"none",boxSizing:"border-box",
    marginBottom:10,fontFamily:"Georgia,serif"};

  return (
    <div style={{paddingBottom:100}}>
      {/* Header */}
      <div style={{padding:"20px 16px 16px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
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

      {/* Humidor cards */}
      <div style={{padding:"16px 16px 0",display:"flex",flexDirection:"column",gap:16}}>
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
          const isSelected=selectedHumidor===h.id;

          return (
            <div key={h.id} style={{background:"linear-gradient(170deg,#1a1208,#0f0a04)",
              borderRadius:16,border:`1px solid rgba(196,154,40,0.2)`,overflow:"hidden",
              boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}>

              {/* Humidor photo */}
              <div style={{position:"relative",height:140,overflow:"hidden",background:"#0a0602",
                borderBottom:`1px solid rgba(196,154,40,0.12)`}}>
                <img src={h.photo||"/humidor-hero.png"} alt={h.name}
                  style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",
                    filter:"brightness(0.6) saturate(1.1)"}}
                  onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                <div style={{position:"absolute",inset:0,
                  background:"linear-gradient(180deg,rgba(0,0,0,0.1) 0%,rgba(18,10,2,0.75) 100%)"}}/>
                {/* Status badge */}
                <div style={{position:"absolute",top:10,right:10,
                  display:"flex",alignItems:"center",gap:5,padding:"4px 10px",
                  background:"rgba(10,5,0,0.75)",borderRadius:20,
                  border:`1px solid ${statusColor}44`,backdropFilter:"blur(4px)"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:statusColor,
                    boxShadow:hasReading?`0 0 6px ${statusColor}88`:"none"}}/>
                  <span style={{fontSize:9,color:statusColor,fontFamily:"Georgia,serif",letterSpacing:1}}>
                    {calcStatus}
                  </span>
                </div>
                {/* Photo upload button */}
                <label style={{position:"absolute",top:10,left:10,cursor:"pointer",
                  background:"rgba(0,0,0,0.6)",border:`1px solid rgba(196,154,40,0.3)`,
                  borderRadius:8,padding:"5px 8px",display:"flex",alignItems:"center",gap:5}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke={T.goldMid} strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <span style={{fontSize:9,color:T.goldMid,fontFamily:"Georgia,serif",letterSpacing:0.5}}>Photo</span>
                  <input type="file" accept="image/*" style={{display:"none"}}
                    onChange={e=>handlePhotoUpload(h.id,e)}/>
                </label>
                {/* Name overlay */}
                <div style={{position:"absolute",bottom:12,left:16}}>
                  <div style={{fontSize:18,fontWeight:"bold",color:"#fff",fontFamily:"Georgia,serif",
                    textShadow:"0 1px 6px rgba(0,0,0,0.9)"}}>{h.name}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",fontFamily:"Georgia,serif",
                    fontStyle:"italic"}}>{h.wood}</div>
                </div>
              </div>

              {/* Live readings */}
              <div style={{padding:"14px 16px 0"}}>
                {hasReading?(
                  <div style={{display:"flex",gap:10,marginBottom:14}}>
                    <div style={{flex:1,background:"rgba(61,214,140,0.08)",
                      border:"1px solid rgba(61,214,140,0.2)",borderRadius:10,
                      padding:"10px",textAlign:"center"}}>
                      <div style={{fontSize:28,fontWeight:"bold",color:"#3dd68c",
                        fontFamily:"Georgia,serif",lineHeight:1}}>{humidity}</div>
                      <div style={{fontSize:8,color:T.textMuted,letterSpacing:2,
                        textTransform:"uppercase",marginTop:3,fontFamily:"Georgia,serif"}}>% RH</div>
                    </div>
                    <div style={{flex:1,background:"rgba(196,154,40,0.08)",
                      border:`1px solid rgba(196,154,40,0.2)`,borderRadius:10,
                      padding:"10px",textAlign:"center"}}>
                      <div style={{fontSize:28,fontWeight:"bold",color:T.goldMid,
                        fontFamily:"Georgia,serif",lineHeight:1}}>{temp}</div>
                      <div style={{fontSize:8,color:T.textMuted,letterSpacing:2,
                        textTransform:"uppercase",marginTop:3,fontFamily:"Georgia,serif"}}>°F</div>
                    </div>
                    <div style={{flex:1,background:"rgba(196,154,40,0.05)",
                      border:`1px solid rgba(196,154,40,0.1)`,borderRadius:10,
                      padding:"10px",textAlign:"center"}}>
                      <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",
                        marginBottom:4}}>Last Updated</div>
                      <div style={{fontSize:11,color:T.textPrimary,fontFamily:"Georgia,serif"}}>
                        {lastUpdated||"—"}
                      </div>
                    </div>
                  </div>
                ):(
                  <div style={{textAlign:"center",padding:"16px",marginBottom:14,
                    background:"rgba(196,154,40,0.04)",border:`1px solid rgba(196,154,40,0.1)`,
                    borderRadius:10}}>
                    <div style={{fontSize:11,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>
                      No sensor connected · ESP32 integration coming soon
                    </div>
                  </div>
                )}

                {/* Cigars in this humidor */}
                {(()=>{
                  let hCigars:any[]=[];
                  try{const s=localStorage.getItem('mh_cigars');hCigars=s?JSON.parse(s):[];}catch{}
                  hCigars=hCigars.filter((c:any)=>c.humidorId===h.id);
                  const isExpanded=expandedCigars===h.id;
                  return (
                    <div style={{marginBottom:14}}>
                      <button onClick={()=>setExpandedCigars(isExpanded?null:h.id)}
                        style={{width:"100%",display:"flex",alignItems:"center",
                          justifyContent:"space-between",background:"rgba(196,154,40,0.06)",
                          border:`1px solid rgba(196,154,40,0.15)`,borderRadius:10,
                          padding:"10px 14px",cursor:"pointer"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke={T.goldMid} strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                          <span style={{fontSize:12,color:T.goldMid,fontFamily:"Georgia,serif",
                            letterSpacing:0.5}}>Cigars in this Humidor</span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif"}}>
                            {hCigars.length} / {h.capacity}
                          </span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke={T.textMuted} strokeWidth="2">
                            <polyline points={isExpanded?"18 15 12 9 6 15":"6 9 12 15 18 9"}/>
                          </svg>
                        </div>
                      </button>
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
                                <img src={getCigarImage(c.vitola,c.wrapper)} alt={c.line}
                                  style={{width:"100%",height:"100%",objectFit:"cover"}}
                                  onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                              </div>
                              <div style={{flex:1,padding:"6px 0"}}>
                                <div style={{fontSize:12,fontWeight:"bold",color:T.textPrimary,
                                  fontFamily:"Georgia,serif"}}>{c.line}</div>
                                <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",
                                  fontStyle:"italic"}}>{c.brand} · {c.vitola}</div>
                              </div>
                              <div style={{padding:"0 12px",textAlign:"center"}}>
                                <div style={{fontSize:16,fontWeight:"bold",color:T.goldMid,
                                  fontFamily:"Georgia,serif"}}>{c.count}</div>
                                <div style={{fontSize:8,color:T.textMuted,letterSpacing:1,
                                  textTransform:"uppercase"}}>Left</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}

        {/* Add Humidor Form */}
        {showForm&&(
          <div style={{background:"linear-gradient(170deg,#1a1208,#0f0a04)",borderRadius:16,
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
                background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                border:"none",borderRadius:10,color:"#1a0e04",fontSize:13,
                fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>Add</button>
              <button onClick={()=>setShowForm(false)} style={{padding:"12px 20px",
                background:"transparent",border:`1px solid rgba(160,120,40,0.22)`,
                borderRadius:10,color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
            </div>
          </div>
        )}

        <button onClick={()=>setShowForm(s=>!s)} style={{width:"100%",padding:"15px",
          background:"none",border:`1px dashed rgba(160,120,40,0.22)`,borderRadius:16,
          color:T.textMuted,fontSize:10,fontFamily:"Georgia,serif",cursor:"pointer",
          letterSpacing:2.5,textTransform:"uppercase"}}>
          {showForm?"— Cancel":"+ Add Humidor"}
        </button>
      </div>

      {/* ── PERMANENT HUMIDITY CHART ── */}
      {humidors.length>0&&(
        <div style={{position:"sticky",bottom:90,left:0,right:0,zIndex:10,
          background:"linear-gradient(170deg,#0a0602,#050300)",
          borderTop:`1px solid rgba(196,154,40,0.2)`,
          boxShadow:"0 -8px 24px rgba(0,0,0,0.8)"}}>
          <div style={{padding:"12px 16px 8px"}}>
            {/* Header */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:9,letterSpacing:3,textTransform:"uppercase",
                color:T.textMuted,fontFamily:"Georgia,serif"}}>Humidity History</div>
              {/* Range selector */}
              <div style={{display:"flex",gap:3}}>
                {(['24H','7D','30D','90D'] as const).map(r=>(
                  <button key={r} onClick={()=>setHistoryRange(r)}
                    style={{padding:"3px 7px",
                      background:historyRange===r?`linear-gradient(135deg,${T.goldDark},${T.goldMid})`:"transparent",
                      border:`1px solid ${historyRange===r?"transparent":"rgba(196,154,40,0.2)"}`,
                      borderRadius:5,color:historyRange===r?"#0a0a0a":T.textMuted,
                      fontSize:9,fontFamily:"Georgia,serif",cursor:"pointer"}}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            {/* Multi-line SVG chart */}
            <div style={{background:"rgba(0,0,0,0.4)",borderRadius:10,padding:"10px",
              border:`1px solid rgba(196,154,40,0.08)`}}>
              <svg width="100%" height="70" viewBox="0 0 300 70" preserveAspectRatio="none">
                {/* Grid lines */}
                {[65,68,71,74].map((v,i)=>(
                  <line key={i} x1="0" y1={70-((v-60)/20)*70} x2="300" y2={70-((v-60)/20)*70}
                    stroke="rgba(196,154,40,0.06)" strokeWidth="1"/>
                ))}
                {/* Ideal zone */}
                <rect x="0" y={70-((72-60)/20)*70} width="300"
                  height={((72-65)/20)*70} fill="rgba(61,214,140,0.04)"/>
                {/* One line per humidor */}
                {humidors.map((h,i)=>{
                  const color=HUMIDOR_COLORS[i%HUMIDOR_COLORS.length];
                  const data=getHistoryData(h.id);
                  return (
                    <polyline key={h.id}
                      points={data.map((v,j)=>`${(j/(data.length-1))*300},${70-((v-60)/20)*70}`).join(" ")}
                      fill="none" stroke={color} strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
                  );
                })}
              </svg>
              {/* Legend */}
              <div style={{display:"flex",flexWrap:"wrap",gap:"4px 12px",marginTop:6}}>
                {humidors.map((h,i)=>(
                  <div key={h.id} style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:12,height:3,borderRadius:2,
                      background:HUMIDOR_COLORS[i%HUMIDOR_COLORS.length]}}/>
                    <span style={{fontSize:9,color:T.textMuted,fontFamily:"Georgia,serif"}}>
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
type ScanResult={brand:string;line:string;vitola:string;origin:string;wrapper:string;rating:number|null;confidence:string;notes:string};

function BandScannerModal({onClose,onAddToCollection,onAddToJournal,onSmokedOne}:{
  onClose:()=>void;
  onAddToCollection:(r:ScanResult)=>void;
  onAddToJournal:(r:ScanResult)=>void;
  onSmokedOne:(r:ScanResult)=>void;
}) {
  const fileRef=useRef<HTMLInputElement>(null);
  const cameraRef=useRef<HTMLInputElement>(null);
  const [phase,setPhase]=useState<"idle"|"scanning"|"result"|"error">("idle");
  const [preview,setPreview]=useState<string|null>(null);
  const [result,setResult]=useState<ScanResult|null>(null);
  const [errMsg,setErrMsg]=useState("");
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
        const res=await fetch("/api/scan",{method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({image:base64,mediaType})});
        const data=await res.json();
        if(data.ok&&data.cigar){setResult(data.cigar);setPhase("result");}
        else{setErrMsg("Couldn't identify this band. Try a clearer photo.");setPhase("error");}
      } catch {setErrMsg("Connection error. Please try again.");setPhase("error");}
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
          <div style={{fontSize:10,letterSpacing:5,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif"}}>Collection</div>
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
              <div style={{fontSize:48,marginBottom:16}}>🔍</div>
              <div style={{fontSize:16,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:8}}>
                Photo a Cigar Band
              </div>
              <div style={{fontSize:13,color:T.textMuted,lineHeight:1.6}}>
                Tap to open camera or choose a photo.<br/>AI will identify brand, line, and vitola.
              </div>
            </div>
            <button onClick={()=>cameraRef.current?.click()}
              style={{width:"100%",padding:"16px",
                background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                border:"none",borderRadius:14,color:"#1a0e04",fontSize:15,
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
              <div style={{fontSize:14,color:T.textSecondary,fontFamily:"Georgia,serif",fontStyle:"italic"}}>
                Mario is identifying your cigar…
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
                    fontFamily:"Georgia,serif"}}>Identified</div>
                  <div style={{fontSize:10,color:confidenceColor(result.confidence),
                    background:`${confidenceColor(result.confidence)}18`,
                    border:`1px solid ${confidenceColor(result.confidence)}33`,
                    borderRadius:20,padding:"2px 10px",letterSpacing:1,textTransform:"uppercase"}}>
                    {result.confidence} confidence
                  </div>
                </div>
                <div style={{fontSize:10,color:T.textSecondary,letterSpacing:3,textTransform:"uppercase",
                  fontFamily:"Georgia,serif",marginBottom:4}}>{result.brand}</div>
                <div style={{fontSize:24,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",
                  lineHeight:1.1,marginBottom:6}}>{result.line}</div>
                <div style={{fontSize:14,color:T.textSecondary,marginBottom:16}}>{result.vitola}</div>

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
                    fontSize:13,color:T.textSecondary,fontFamily:"Georgia,serif",fontStyle:"italic",lineHeight:1.7}}>
                    {result.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={()=>onAddToCollection(result)}
                style={{width:"100%",padding:"15px",
                  background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                  border:"none",borderRadius:12,color:"#0a0a0a",fontSize:14,
                  fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
                {t("add_to_col_btn")}
              </button>
              <button onClick={()=>onSmokedOne(result)}
                style={{width:"100%",padding:"15px",
                  background:"linear-gradient(135deg,#7a1212,#a01818)",
                  border:"none",borderRadius:12,color:"#f0e8d8",fontSize:14,
                  fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
                {t("smoked_one")}
              </button>
              <button onClick={()=>onAddToJournal(result)}
                style={{width:"100%",padding:"15px",background:"none",
                  border:`1px solid ${T.borderGold}`,borderRadius:12,color:T.goldLight,
                  fontSize:14,cursor:"pointer",fontFamily:"Georgia,serif",fontWeight:"bold"}}>
                {t("log_to_journal")}
              </button>
              <button onClick={()=>{setPhase("idle");setPreview(null);setResult(null);}}
                style={{width:"100%",padding:"12px",background:"none",
                  border:`1px solid ${T.border}`,borderRadius:12,color:T.textMuted,
                  fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif"}}>
                {t("scan_another")}
              </button>
            </div>
          </div>
        )}

        {/* ERROR */}
        {phase==="error" && (
          <div style={{display:"flex",flexDirection:"column",gap:16,paddingTop:20}}>
            {preview && <img src={preview} alt="band" style={{width:"100%",borderRadius:14,
              border:`1px solid ${T.border}`,objectFit:"cover",maxHeight:200}}/>}
            <div style={{background:T.card,borderRadius:14,border:`1px solid rgba(122,18,18,0.4)`,
              padding:"20px",textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
              <div style={{fontSize:14,color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:6}}>{errMsg}</div>
            </div>
            <button onClick={()=>{setPhase("idle");setPreview(null);}}
              style={{width:"100%",padding:"15px",
                background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                border:"none",borderRadius:12,color:"#1a0e04",fontSize:14,
                fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
              {t("try_again")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AD CAROUSEL ────────────────────────────────────────────────────────────
const ADS = [
  {brand:"Davidoff",line:"Winston Churchill\nThe Late Hour",vitola:"Toro · 6 × 50",badge:"New Release",
    bg:"linear-gradient(135deg,#1a1208,#2a1f0e,#0f0a04)",accent:"#C49A28",image:"/ad-davidoff.png"},
  {brand:"Padrón",line:"1964 Anniversary\nExclusivo Natural",vitola:"Robusto · 5 × 50",badge:"Member Favorite",
    bg:"linear-gradient(135deg,#0f1a08,#1a2a0e,#080f04)",accent:"#5a8c3a",image:"/ad-padron.png"},
  {brand:"Arturo Fuente",line:"Opus X\nAngel's Share",vitola:"Robusto · 5¼ × 50",badge:"Limited Edition",
    bg:"linear-gradient(135deg,#1a0808,#2a0e0e,#0f0404)",accent:"#8B2020",image:"/ad-fuente.png"},
  {brand:"My Father",line:"Le Bijou 1922\nTorpedo",vitola:"Torpedo · 6¼ × 52",badge:"Top Rated",
    bg:"linear-gradient(135deg,#0a0f1a,#0e1a2a,#04080f)",accent:"#4a6a9a",image:"/ad-myfather.png"},
  {brand:"Liga Privada",line:"No. 9\nRobusto",vitola:"Robusto · 5 × 52",badge:"Staff Pick",
    bg:"linear-gradient(135deg,#0f0a1a,#1a0e2a,#08040f)",accent:"#7a3a8a",image:"/ad-ligaprivada.png"},
];

function AdCarousel() {
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
        background:"linear-gradient(170deg,#1a1a1a,#0d0d0d)",
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
function CollectionTab() {
  const {t}=useLang();
  const [sel,setSel]=useState<number|null>(null);
  const [showScanner,setShowScanner]=useState(false);
  const [showJournal,setShowJournal]=useState(false);
  const [pendingCollection,setPendingCollection]=useState<ScanResult|null>(null);
  const [pendingJournal,setPendingJournal]=useState<ScanResult|null>(null);
  const [cigars,setCigars]=useState<CigarEntry[]>(CIGARS);
  const [mounted,setMounted]=useState(false);
  const [activeHumidor,setActiveHumidor]=useState<number|null>(null);

  useEffect(()=>{
    setMounted(true);
    try{const s=localStorage.getItem('mh_cigars');if(s)setCigars(JSON.parse(s));}catch{}
  },[]);

  useEffect(()=>{
    if(!mounted) return;
    try{localStorage.setItem('mh_cigars',JSON.stringify(cigars));}catch{}
  },[cigars,mounted]);

  const [smokedToast,setSmokedToast]=useState<string|null>(null);
  const [showAddForm,setShowAddForm]=useState(false);
  const [addForm,setAddForm]=useState({brand:"",line:"",vitola:"",origin:"",wrapper:"",count:"1",rating:"90"});

  const saveNewCigar=()=>{
    if(!addForm.brand.trim()||!addForm.line.trim()) return;
    const newC:CigarEntry={
      id:Date.now(),brand:addForm.brand,line:addForm.line,vitola:addForm.vitola,
      origin:addForm.origin,wrapper:addForm.wrapper,
      rating:parseInt(addForm.rating)||90,count:parseInt(addForm.count)||1,
      purchaseDate:new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"}),
      bandColor:"#2a1608",
      humidorId:activeHumidor??HUMIDORS[0].id
    };
    setCigars(prev=>[...prev,newC]);
    setAddForm({brand:"",line:"",vitola:"",origin:"",wrapper:"",count:"1",rating:"90"});
    setShowAddForm(false);
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
          <div style={{fontSize:14,color:"#f0e8d8",fontFamily:"Georgia,serif",textAlign:"center",lineHeight:1.5}}>{smokedToast}</div>
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
        <div style={{background:"linear-gradient(170deg,#1a1208,#0f0a04)",borderRadius:14,
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
                <div style={{fontSize:16,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1}}>
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
            {label:"By Brand",value:`${new Set(cigars.map(c=>c.brand)).size} Brands`,icon:"🏷"},
            {label:"By Country",value:`${new Set(cigars.filter(c=>c.origin).map(c=>c.origin)).size||0} Countries`,icon:"🌎"},
            {label:"By Vitola",value:`${new Set(cigars.map(c=>c.vitola)).size} Vitolas`,icon:"🍂"},
            {label:"By Wrapper",value:`${new Set(cigars.filter(c=>c.wrapper).map(c=>c.wrapper)).size||0} Wrapper Types`,icon:"🍃"},
            {label:"By Strength",value:"Mild · Medium · Full",icon:"💪"},
          ].map(row=>(
            <div key={row.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"11px 0",borderBottom:`1px solid rgba(196,154,40,0.06)`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:14}}>{row.icon}</span>
                <span style={{fontSize:13,color:T.textPrimary,fontFamily:"Georgia,serif"}}>{row.label}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>{row.value}</span>
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
                <img src={getCigarImage(c.vitola,c.wrapper)} alt={c.line}
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
          {HUMIDORS.map(h=>{
            const hCigars=cigars.filter(c=>c.humidorId===h.id);
            const cigarCount=hCigars.reduce((a,c)=>a+c.count,0);
            const statusColor=h.status==="optimal"?"#2a7a4a":h.status==="good"?"#7a6a1a":h.status==="no_data"?"#3a3a3a":"#7a2a2a";
            const statusDot=h.status==="optimal"?"#3dd68c":h.status==="good"?"#e8c84a":h.status==="no_data"?T.textMuted:"#e05050";
            return (
              <div key={h.id} onClick={()=>{setActiveHumidor(h.id);setSel(null);}}
                style={{background:"linear-gradient(170deg,#1a1a1a,#0f0f0f)",borderRadius:14,
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
                    background:`rgba(10,5,0,0.7)`,borderRadius:20,
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
              {HUMIDORS.find(h=>h.id===activeHumidor)?.name}
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
                <div style={{fontSize:32,marginBottom:12}}>🪵</div>
                <div style={{fontSize:14,marginBottom:6}}>This humidor is empty</div>
                <div style={{fontSize:12,fontStyle:"italic"}}>Add cigars with the button below</div>
              </div>
            ) : (
              cigars.filter(c=>c.humidorId===activeHumidor).map(c=>{
          const isEx=sel===c.id;
          return (
            <div key={c.id} onClick={()=>setSel(isEx?null:c.id)}
              style={{background:"linear-gradient(170deg,#1a1a1a,#0d0d0d)",borderRadius:14,marginBottom:14,overflow:"hidden",
                cursor:"pointer",border:`1px solid ${isEx?T.borderGold:T.border}`,transition:"border-color 0.2s"}}>
              <div style={{display:"flex",alignItems:"stretch",minHeight:96}}>
                {/* Cigar image — replaces color band */}
                <div style={{width:56,flexShrink:0,background:"#000",
                  display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",
                  borderRight:`1px solid rgba(196,154,40,0.1)`}}>
                  <img
                    src={getCigarImage(c.vitola,c.wrapper)}
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
                                border:"none",borderRadius:8,color:"#1a0e04",fontSize:12,fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
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
                                <div style={{fontSize:14,color:T.textPrimary,fontFamily:"Georgia,serif"}}>{v}</div>
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
            {/* Humidor selector */}
            <div style={{marginBottom:10}}>
              <div style={{fontSize:9,color:T.textMuted,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>Humidor</div>
              <select value={activeHumidor??HUMIDORS[0].id} disabled={activeHumidor!==null}
                onChange={()=>{}}
                style={{width:"100%",background:"rgba(0,0,0,0.25)",border:`1px solid ${T.border}`,borderRadius:8,
                  padding:"10px 14px",color:T.textPrimary,fontSize:13,outline:"none",
                  boxSizing:"border-box" as const,fontFamily:"Georgia,serif",
                  opacity:activeHumidor!==null?0.6:1}}>
                {HUMIDORS.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
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
                  border:"none",borderRadius:8,color:"#1a0e04",fontSize:13,fontWeight:"bold",
                  cursor:"pointer",fontFamily:"Georgia,serif"}}>
                {t("save_to_collection")}
              </button>
              <button onClick={()=>setShowAddForm(false)}
                style={{padding:"12px 16px",background:"transparent",border:`1px solid ${T.border}`,
                  borderRadius:8,color:T.textMuted,fontSize:13,cursor:"pointer"}}>
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

function TastingNotesSection({prefill,onPrefillUsed}:{prefill:ScanResult|null,onPrefillUsed:()=>void}) {
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
            borderRadius:20,padding:"8px 18px",color:"#1a0e04",fontSize:12,
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
            <button onClick={save} style={{flex:1,padding:"11px",background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,border:"none",borderRadius:8,color:"#1a0e04",fontSize:13,fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>Save Entry</button>
            <button onClick={()=>setShowForm(false)} style={{padding:"11px 16px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
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

// ── ASK MARIO — emotional center ───────────────────────────────────────────
const QUICK_PROMPTS=[
  {tk:"quick_recommend",
    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L9 9H2l5.5 4-2 7L12 16l6.5 4-2-7L22 9h-7z"/></svg>},
  {tk:"quick_humidor",
    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M7 6V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2"/><circle cx="12" cy="15" r="2"/></svg>},
  {tk:"quick_pairing",
    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22H5a2 2 0 0 1-2-2V7l3-4h8l3 4v13a2 2 0 0 1-2 2h-3"/><path d="M12 11v11"/><path d="M9 8h6"/></svg>},
  {tk:"quick_tonight",
    icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/><path d="M19 3v4"/><path d="M21 5h-4"/></svg>},
];

function AskMarioTab({liveData}:{liveData:Record<string,{temperature:number|null;humidity:number|null;observedAt:string|null}>}) {
  const {t,lang}=useLang();
  const langName=LANGS.find(l=>l.code===lang)?.name||"English";
  const getGreeting=()=>{
    const h=new Date().getHours();
    const timeStr=h<12?t("greeting_morning"):h<17?t("greeting_afternoon"):h<21?t("greeting_evening"):t("greeting_evening");
    // Find best sensor reading
    const sensors=Object.values(liveData).filter(s=>s.humidity&&s.humidity>0);
    const bestSensor=sensors[0];
    const humLine=bestSensor?.humidity
      ? ` The humidor's sitting at ${bestSensor.humidity.toFixed(0)}% humidity${bestSensor.humidity>=65&&bestSensor.humidity<=72?" — perfect conditions tonight":""}. `
      : " ";
    return `${timeStr}, Zebulon.${humLine}I'm Mario — your personal cigar sommelier. What are we smoking tonight?`;
  };
  const [messages,setMessages]=useState([{role:"ai",text:getGreeting()}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  const send=useCallback(async(text:string)=>{
    if(!text.trim()||loading) return;
    setMessages(m=>[...m,{role:"user",text}]);
    setInput("");
    setLoading(true);
    try {
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({system:`You are Mario, a warm, deeply knowledgeable private cigar concierge. Speak like a trusted friend at a private lounge. Be specific and personal. Sign responses with '— Mario'. Under 100 words. Always respond in ${langName}.`,
          messages:[...messages.map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text})),{role:"user",content:text}]})});
      const data=await res.json();
      const reply=data.content?.find((b:{type:string;text?:string})=>b.type==="text")?.text||"Please try again.";
      setMessages(m=>[...m,{role:"ai",text:reply}]);
    } catch {setMessages(m=>[...m,{role:"ai",text:"A momentary connection issue.\n\n— Mario"}]);}
    setLoading(false);
  },[messages,loading]);

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 130px)"}}>

      {/* MARIO HERO — avatar only */}
      <div style={{flexShrink:0,background:"#0a0a0a",padding:"16px 20px 14px",borderBottom:`1px solid rgba(196,154,40,0.15)`}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:72,height:72,borderRadius:"50%",flexShrink:0,
            border:`2px solid ${T.goldMid}`,overflow:"hidden",
            boxShadow:`0 0 0 3px #0a0a0a, 0 0 0 5px ${T.goldDark}44`}}>
            <img src="/mario-avatar.jpg" alt="Mario" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 50%"}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:24,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1.15}}>{t("ask_mario")}</div>
            <div style={{fontSize:10,color:T.goldMid,letterSpacing:2.5,textTransform:"uppercase",marginTop:4}}>{t("sommelier_title")}</div>
          </div>
        </div>
      </div>

      {/* Messages + Recommendation */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 0",display:"flex",flexDirection:"column",gap:14}}>

        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            {m.role==="ai" ? (
              <div style={{maxWidth:"92%",
                background:"linear-gradient(155deg,#1a1a1a 0%,#111111 60%,#0d0d0d 100%)",
                border:`1px solid rgba(196,154,40,0.22)`,borderRadius:"3px 16px 16px 16px",
                padding:"16px 18px",boxShadow:"0 4px 20px rgba(0,0,0,0.5)"}}>
                <div style={{fontSize:9,color:T.goldMid,letterSpacing:2,textTransform:"uppercase",
                  marginBottom:10,display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:18,height:18,borderRadius:"50%",overflow:"hidden",border:`1px solid ${T.goldDark}`,flexShrink:0}}>
                    <img src="/mario-avatar.jpg" alt="Mario" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 50%"}}/>
                  </div>
                  <span>Mario</span>
                </div>
                <div style={{fontSize:15,color:T.textPrimary,lineHeight:1.85,fontFamily:"Georgia,serif",whiteSpace:"pre-line"}}>{m.text}</div>
              </div>
            ) : (
              <div style={{maxWidth:"80%",background:"rgba(196,154,40,0.08)",border:`1px solid rgba(196,154,40,0.2)`,
                borderRadius:"16px 3px 16px 16px",padding:"12px 16px"}}>
                <div style={{fontSize:14,color:T.textPrimary,lineHeight:1.7,fontFamily:"Georgia,serif"}}>{m.text}</div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{display:"flex",justifyContent:"flex-start"}}>
            <div style={{background:"linear-gradient(155deg,#1a1a1a,#111111)",border:`1px solid rgba(196,154,40,0.22)`,
              borderRadius:"3px 16px 16px 16px",padding:"16px 20px"}}>
              <div style={{display:"flex",gap:5}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.goldMid,animation:`mT 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick prompts — full width stacked with icons */}
      <div style={{padding:"10px 16px 6px",display:"flex",flexDirection:"column",gap:8,flexShrink:0}}>
        {QUICK_PROMPTS.map((p)=>(
          <button key={p.tk} onClick={()=>send(t(p.tk))}
            style={{width:"100%",background:"linear-gradient(170deg,#1a1a1a,#111111)",
              border:`1px solid rgba(196,154,40,0.22)`,borderRadius:12,
              padding:"14px 18px",color:T.textPrimary,fontSize:15,cursor:"pointer",
              fontFamily:"Georgia,serif",textAlign:"left",display:"flex",
              alignItems:"center",justifyContent:"space-between"}}>
            <span style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{color:T.goldMid,flexShrink:0}}>{p.icon}</span>
              <span>{t(p.tk)}</span>
            </span>
            <span style={{color:T.goldMid,fontSize:20}}>›</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{padding:"6px 16px 16px",display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
        <input value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter")send(input);}}
          placeholder={t("ask_placeholder")}
          style={{flex:1,background:"linear-gradient(170deg,#1a1a1a,#111111)",border:`1px solid rgba(196,154,40,0.22)`,
            borderRadius:24,padding:"12px 18px",color:T.textPrimary,fontSize:13,
            fontFamily:"Georgia,serif",outline:"none"}}/>
        <button onClick={()=>send(input)}
          style={{width:44,height:44,borderRadius:"50%",flexShrink:0,
            background:`linear-gradient(135deg,${T.goldMid},${T.goldDark})`,
            border:"none",cursor:"pointer",color:"#0a0a0a",fontSize:22,fontWeight:"bold",
            display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",lineHeight:1}}>›</button>
      </div>
    </div>
  );
}

// ── NEWS CARD ──────────────────────────────────────────────────────────────
function NewsCard({n}:{n:any}) {
  const [showTake,setShowTake]=useState(false);
  return (
    <div style={{background:"linear-gradient(170deg,#1a1a1a,#0d0d0d)",borderRadius:16,border:`1px solid rgba(196,154,40,0.18)`,overflow:"hidden"}}>
      {n.image&&(
        <div style={{width:"100%",height:190,overflow:"hidden",position:"relative"}}>
          <img src={n.image} alt={n.title}
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
            onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
          <div style={{position:"absolute",inset:0,
            background:"linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.6) 100%)"}}/>
          <div style={{position:"absolute",bottom:12,left:14,
            fontSize:11,color:"rgba(255,255,255,0.95)",letterSpacing:2.5,
            textTransform:"uppercase",fontFamily:"Georgia,serif",fontWeight:"bold"}}>{n.source}</div>
        </div>
      )}
      <div style={{height:3,background:n.accent}}/>
      <div style={{padding:"18px 18px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          {!n.image&&<div style={{fontSize:10,color:n.accent,letterSpacing:2,textTransform:"uppercase",fontFamily:"Georgia,serif"}}>{n.source}</div>}
          <div style={{fontSize:11,color:T.textSecondary,marginLeft:"auto"}}>{n.date}</div>
        </div>
        <div style={{fontSize:19,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1.3,marginBottom:10}}>{n.title}</div>
        <div style={{fontSize:14,color:T.textSecondary,lineHeight:1.7,fontFamily:"Georgia,serif"}}>{n.summary}</div>
        {showTake&&n.marioTake&&(
          <div style={{marginTop:12,padding:"14px 16px",
            background:"linear-gradient(155deg,#1a1a1a,#0d0d0d)",
            borderRadius:10,border:`1px solid rgba(196,154,40,0.22)`}}>
            <div style={{fontSize:9,color:T.goldMid,letterSpacing:2,textTransform:"uppercase",
              marginBottom:8,display:"flex",alignItems:"center",gap:6,fontFamily:"Georgia,serif"}}>
              <div style={{width:16,height:16,borderRadius:"50%",overflow:"hidden",border:`1px solid ${T.goldDark}`,flexShrink:0}}>
                <img src="/mario-avatar.jpg" alt="Mario" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 50%"}}/>
              </div>
              Mario's Take
            </div>
            <div style={{fontSize:13,color:T.textPrimary,fontFamily:"Georgia,serif",fontStyle:"italic",lineHeight:1.7}}>
              {n.marioTake}
            </div>
          </div>
        )}
        <div style={{marginTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          {n.link ? (
            <a href={n.link} target="_blank" rel="noopener noreferrer"
              style={{background:"none",border:`1px solid ${n.accent}44`,borderRadius:20,
                padding:"8px 18px",fontSize:12,color:n.accent,cursor:"pointer",
                fontFamily:"Georgia,serif",letterSpacing:0.5,textDecoration:"none"}}>
              Read More
            </a>
          ):(
            <button style={{background:"none",border:`1px solid ${n.accent}44`,borderRadius:20,
              padding:"5px 14px",fontSize:11,color:n.accent,cursor:"pointer",fontFamily:"Georgia,serif",letterSpacing:0.5}}>
              Read More
            </button>
          )}
          {n.marioTake ? (
            <button onClick={()=>setShowTake(s=>!s)}
              style={{background:"none",border:"none",fontSize:10,color:T.goldMid,
                cursor:"pointer",fontFamily:"Georgia,serif",fontStyle:"italic"}}>
              {showTake?"Hide Take":"Mario's Take →"}
            </button>
          ):(
            <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>Mario's Take →</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── TOBACCO MAP ────────────────────────────────────────────────────────────
const TOBACCO_REGIONS:{
  id:string;name:string;path:string;cx:number;cy:number;
  wrappers:string[];fillers:string[];binders:string[];
  flavor:string;famous:string[];color:string;
}[]=[
  {id:"cuba",name:"Cuba",path:"",cx:228,cy:235,
    wrappers:["Cuban Claro","Natural"],fillers:["Vuelta Abajo"],binders:["Vuelta Abajo"],
    flavor:"Earthy, cedar, espresso, leather — complex and nuanced",
    famous:["Cohiba Behike","Montecristo No. 2","Romeo y Julieta Churchill"],color:"#C49A28"},
  {id:"nicaragua",name:"Nicaragua",path:"",cx:185,cy:262,
    wrappers:["Habano","Corojo","Maduro"],fillers:["Jalapa","Estelí","Ometepe"],binders:["Jalapa"],
    flavor:"Bold, spicy, dark cocoa, full-bodied — the powerhouse of the cigar world",
    famous:["Padrón 1964","Liga Privada No. 9","My Father Le Bijou"],color:"#8B6914"},
  {id:"dominican",name:"Dominican Republic",path:"",cx:258,cy:242,
    wrappers:["Natural","Corojo"],fillers:["Olor Dominicano","Piloto Cubano"],binders:["Olor"],
    flavor:"Medium-bodied, creamy, cedar, subtle spice — elegant and refined",
    famous:["Arturo Fuente OpusX","Davidoff","Avo"],color:"#5a8c3a"},
  {id:"honduras",name:"Honduras",path:"",cx:192,cy:248,
    wrappers:["Corojo","Habano"],fillers:["Jamastran"],binders:["Jamastran"],
    flavor:"Rich, woody, coffee, medium to full — robust and satisfying",
    famous:["Alec Bradley Prensado","CAO Cameroon","Rocky Patel Vintage"],color:"#7a4a1a"},
  {id:"ecuador",name:"Ecuador",path:"",cx:192,cy:320,
    wrappers:["Connecticut","Habano","Sumatra"],fillers:[""],binders:[""],
    flavor:"Mild to medium, creamy, slightly sweet — world-class wrapper leaf",
    famous:["Davidoff","Perdomo","Rocky Patel"],color:"#3a7a5a"},
  {id:"cameroon",name:"Cameroon",path:"",cx:483,cy:270,
    wrappers:["Cameroon"],fillers:[""],binders:[""],
    flavor:"Sweet, spicy, earthy — unique African wrapper with distinct character",
    famous:["CAO Cameroon","Arturo Fuente","Don Pepin Garcia"],color:"#7a3a8a"},
  {id:"connecticut",name:"Connecticut",path:"",cx:248,cy:115,
    wrappers:["Connecticut Shade","Broadleaf"],fillers:[""],binders:[""],
    flavor:"Mild, creamy, smooth — Connecticut Shade is the gold standard mild wrapper",
    famous:["Macanudo","Davidoff","Romeo y Julieta"],color:"#4a6a9a"},
  {id:"brazil",name:"Brazil",path:"",cx:255,cy:365,
    wrappers:["Mata Fina","Arapiraca"],fillers:["Mata Fina"],binders:[""],
    flavor:"Earthy, rustic, slightly sweet — maduro character with unique terroir",
    famous:["CAO Brasil","Perdomo Habano","La Gloria Cubana"],color:"#8a4a2a"},
];

function TobaccoMap() {
  const [selected,setSelected]=useState<typeof TOBACCO_REGIONS[0]|null>(null);
  const basePaths=[
    "M1383 261.6l1.5 1.8-2.9 0.8-2.4 1.1-5.9 0.8-5.3 1.3-2.4 2.8 1.9 2.7 1.4 3.2-2 2.7 0.8 2.5-0.9 2.3-5.2-0.2 3.1 4.2-3.1 1.7-1.4 3.8 1.1 3.9-1.8 1.8-2.1-0.6-4 0.9-0.2 1.7-4.1 0-2.3 3.7 0.8 5.4-6.6 2.7-3.9-0.6-0.9 1.4-3.4-0.8-5.3 1-9.6-3.3 3.9-5.8-1.1-4.1-4.3-1.1-1.2-4.1-2.7-5.1 1.6-3.5-2.5-1 0.5-4.7 0.6-8 5.9 2.5 3.9-0.9 0.4-2.9 4-0.9 2.6-2-0.2-5.1 4.2-1.3 0.3-2.2 2.9 1.7 1.6 0.2 3 0 4.3 1.4 1.8 0.7 3.4-2 2.1 1.2 0.9-2.9 3.2 0.1 0.6-0.9-0.2-2.6 1.7-2.2 3.3 1.4-0.1 2 1.7 0.3 0.9 5.4 2.7 2.1 1.5-1.4 2.2-0.6 2.5-2.9 3.8 0.5 5.4 0z",
    "M1088 228l0.4 1.2 1.4-0.6 1.2 1.7 1.3 0.7 0.6 2.3-0.5 2.2 1 2.7 2.3 1.5 0.1 1.7-1.7 0.9-0.1 2.1-2.2 3.1-0.9-0.4-0.2-1.4-3.1-2.2-0.7-3 0.1-4.4 0.5-1.9-0.9-1-0.5-2.1 1.9-3.1z",
    "M1296.2 336.7l1.3 5.1-2.8 0 0 4.2 1.1 0.9-2.4 1.3 0.2 2.6-1.3 2.6 0 2.6-1 1.4-16.9-3.2-2.7-6.6-0.3-1.4 0.9-0.4 0.4 1.8 4.2-1 4.6 0.2 3.4 0.2 3.3-4.4 3.7-4.1 3-4 1.3 2.2z",
    "M1230.8 253l-1.8 0.2-2.8-3.7-0.2-1-2.3 0-1.9-1.7-1 0.1-2.4-1.8-4.2-1.6-0.1-3.1-1.3-2.2 7-1 1.4 1.6 2.2 1.1-0.7 1.6 3.2 2.2-1.1 2.1 2.6 1.7 2.5 1 0.9 4.5z",
    "M1070.6 190.8l-0.3 0.8 0.7 2.1-0.2 2.6-2.8 0 1.1 1.4-1.3 4-0.9 1.1-4.4 0.1-2.4 1.5-4.2-0.5-7.3-1.7-1.3-2.1-4.9 1.1-0.5 1.2-3.1-0.9-2.6-0.2-2.3-1.2 0.7-1.5-0.2-1.1 1.4-0.3 2.7 1.7 0.6-1.7 4.4 0.3 3.5-1.1 2.4 0.2 1.7 1.3 0.4-1.1-1-4.1 1.7-0.8 1.6-2.9 3.8 2.1 2.6-2.6 1.7-0.5 4 1.9 2.3-0.3 2.4 1.2z",
    "M1154.9 530.4l-0.6 0.1 0-0.3-2-6.1-0.01-0.06-0.09-1.04-1.4-2.9 3.5 0.5 1.7-3.7 3.1 0.4 0.3 2.5 1.2 1.5 0 2.1-1.4 1.3-2.3 3.4-2 2.3z",
    "M1016.5 177.1l-0.4 4.2-1.3 0.2-0.4 3.5-4.4-2.9-2.5 0.5-3.5-2.9-2.4-2.5-2.2-0.1-0.8-2.2 3.9-1.2 3.6 0.5 4.5-1.3 3.1 2.7 2.8 1.5z",
    "M1006.7 427l-0.2 2.1 1.3 3.8-1.1 2.6 0.6 1.7-2.8 4-1.7 2-1.1 4 0.2 4.1-0.3 10.3-4.7 0.8-1.4-4.4 0.3-14.8-1.2-1.3-0.2-3.2-2-2.2-1.7-1.9 0.7-3.4 2-0.7 1.1-2.8 2.8-0.6 1.2-1.9 1.9-1.9 2 0 4.3 3.7z",
    "M988.5 406l-0.5 3.1 0.8 2.9 3.1 4.2 0.2 3.1 6.5 1.5-0.1 4.4-1.2 1.9-2.8 0.6-1.1 2.8-2 0.7-4.9-0.1-2.6-0.5-1.8 1-2.5-0.5-9.8 0.3-0.2 3.7 0.8 4.8-3.9-1.6-2.6 0.2-2 1.6-2.5-1.3-1-2.2-2.5-1.4-0.4-3.7 1.6-2.7-0.2-2.2 4.5-5.3 0.9-4.4 1.5-1.6 2.7 0.9 2.4-1.3 0.8-1.7 4.3-2.8 1.1-2 5.3-2.7 3.1-0.9 1.4 1.2 3.6 0z",
    "M1500.6 360.3l0.6 4.6-2.1-1 1.1 5.2-2.1-3.3-0.8-3.3-1.5-3.1-2.8-3.7-5.2-0.3 0.9 2.7-1.2 3.5-2.6-1.3-0.6 1.2-1.7-0.7-2.2-0.6-1.6-5.3-2.6-4.8 0.3-3.9-3.7-1.7 0.9-2.3 3-2.4-4.6-3.4 1.2-4.4 4.9 2.8 2.7 0.3 1.2 4.5 5.4 0.9 5.1-0.1 3.4 1.1-1.6 5.4-2.4 0.4-1.2 3.6 3.6 3.4 0.3-4.2 1.5 0 4.4 10.2z",
    "M1132.6 221.6l-2.3 2.6-1.3 4.5 2.1 3.6-4.6-0.8-5 2 0.3 3.2-4.6 0.6-3.9-2.3-4 1.8-3.8-0.2-0.8-4.2-2.8-2.1 0.7-0.8-0.6-0.8 0.6-2 1.8-2-2.8-2.7-0.7-2.4 1.1-1.4 1.8 2.6 1.9-0.4 4 0.9 7.6 0.4 2.3-1.6 5.9-1.5 4 2.3 3.1 0.7z",
    "M1083 214.3l1.9-0.1-1.1 2.8 2.7 2.5-0.5 2.9-1.1 0.3-0.9 0.6-1.6 1.5-0.4 3.5-4.8-2.4-2.1-2.7-2.1-1.4-2.5-2.4-1.3-1.9-2.7-3 0.8-2.6 2 1.5 1-1.4 2.3-0.1 4.5 1.1 3.5-0.1 2.4 1.4z",
    "M1141.6 162.7l-3.9-0.2-0.8 0.6 1.5 2 2 4-4.1 0.3-1.3 1.4 0.3 3.1-2.1-0.6-4.3 0.3-1.5-1.5-1.7 1.1-1.9-0.9-3.9-0.1-5.7-1.5-4.9-0.5-3.8 0.2-2.4 1.6-2.3 0.3-0.5-2.8-1.9-2.8 2.8-1.3-0.4-2.4-1.7-2.3-0.6-2.7 4.7 0 4.8-2.3 0.5-3.4 3.6-2-1-2.7 2.7-1 4.6-2.3 5.3 1.5 0.9 1.5 2.4-0.7 4.8 1.4 1.1 2.9-0.7 1.6 3.8 4 2.1 1.1 0 1.1 3.4 1.1 1.7 1.6-1.6 1.3z",
    "M487.8 399.8l-1.7 0 1.3-7.2 0.7-5.1 0.1-1 0.7-0.3 0.9 0.8 2.5-3.9 1.1-0.1-0.1 1 1 0-0.3 1.8-1.3 2.7 0.4 1-0.9 2.3 0.3 0.6-1 3.3-1.3 1.7-1.1 0.2-1.3 2.2z",
    "M662.5 631.4l-0.3-2-5.4-3.3-5.2-0.1-9.6 1.9-2.1 5.6 0.2 3.5-1.5 7.7-1-1.4-6.4-0.3-1.6 5.2-3.7-4.6-7.5-1.6-4 5.8-3.9 0.9-3.1-8.9-3.7-7.2 1.1-6.2-3.2-2.7-1.2-4.6-3.2-4.4 2.9-6.9-2.9-5.4 1.1-2.2-1.2-2.4 1.9-3.2-0.3-5.4 0-4.6 1.1-2.1-5.5-10.4 4.2 0.6 2.9-0.2 1.1-1.9 4.8-2.6 2.9-2.4 7.3-1.1-0.4 4.8 0.9 2.5-0.3 4.3 6.5 5.7 6.4 1.1 2.3 2.4 3.9 1.3 2.5 1.8 3.5 0 3.4 1.9 0.5 3.7 1.2 1.9 0.3 2.7-1.7 0.1 2.8 7.5 10.7 0.3-0.5 3.7 0.8 2.5 3.2 1.8 1.7 4-0.6 5.1-1.3 2.8 0.8 3.6-1.6 1.4z",
    "M1633.1 472.8l2.2-2.4 4.6-3.6-0.1 3.2-0.1 4.1-2.7-0.2-1.1 2.2-2.8-3.3z",
    "M1488.8 323.5l2.6 2.1 0.5 3.9-4.5 0.2-4.7-0.4-3.2 1-5.5-2.5-0.4-1.2 2.6-4.8 2.6-1.6 4.3 1.4 2.9 0.2 2.8 1.7z",
    "M1127.6 615.7l1.9 5.1 1.1 1.2 1.6 3.7 6.1 7 2.3 0.7-0.1 2.3 1.5 4.1 4.3 1 3.4 2.9-8.1 4.7-5.2 4.8-2 4.3-1.8 2.4-3 0.5-1.2 3.1-0.6 2-3.6 1.4-4.5-0.3-2.5-1.8-2.3-0.7-2.8 1.4-1.5 3.1-2.7 1.9-2.8 2.9-4 0.7-1.1-2.3 0.6-3.9-3-6.1-1.4-1 0.6-18.7 5.5-0.2 0.8-22.9 4.2-0.2 8.7-2.3 2 2.7 3.7-2.5 1.7 0 3.2-1.5 1 0.5z",
    "M1121.3 446.5l3.9 2.5 3.1 2.6 0.1 2.1 3.9 3.3 2.4 2.8 1.4 3.8 4.3 2.6 0.9 2-1.8 0.7-3.7-0.1-4.2-0.7-2.1 0.5-0.9 1.6-1.8 0.2-2.2-1.4-6.3 3.2-2.6-0.6-0.8 0.5-1.6 3.9-4.3-1.3-4.1-0.6-3.6-2.4-4.7-2.2-3 2.1-2.2 3.2-0.5 4.5-3.6-0.3-3.9-1.1-3.3 3.4-3 6-0.6-1.9-0.3-2.9-2.6-2.1-2.1-3.3-0.5-2.3-2.7-3.4 0.5-1.9-0.6-2.7 0.4-5 1.4-1.1 2.8-6.5 4.6-0.5 1-1.7 1 0.2 1.4 1.4 7.1-2.4 2.4-2.5 2.9-2.3-0.6-2.2 1.6-0.6 5.5 0.4 5.2-3 4-7 2.8-2.6 3.6-1.1 0.7 2.7 3.3 4 0 2.7-0.8 2.6 0.4 2 1.9 1.9 0.5 0.3z",
    "M1034.4 197.5l0.2 1.1-0.7 1.5 2.3 1.2 2.6 0.2-0.3 2.5-2.1 1.1-3.8-0.8-1 2.5-2.4 0.2-0.9-1-2.7 2.2-2.5 0.3-2.2-1.4-1.8-2.7-2.4 1 0-2.9 3.6-3.5-0.2-1.6 2.3 0.6 1.3-1.1 4.2 0 1-1.3 5.5 1.9z",
    "M955.9 435.2l2.5 1.4 1 2.2 2.5 1.3 2-1.6 2.6-0.2 3.9 1.6 1.5 9.2-2.4 5.3-1.5 7.3 2.4 5.5-0.2 2.6-2.6 0-3.9-1.2-3.7 0-6.7 1.2-3.9 1.8-5.6 2.4-1.1-0.2 0.4-5.3 0.6-0.8-0.2-2.5-2.4-2.7-1.8-0.4-1.6-1.8 1.2-2.9-0.5-3.1 0.2-1.8 0.9 0 0.4-2.8-0.4-1.3 0.5-0.9 2.1-0.7-1.4-5.2-1.3-2.6 0.5-2.2 1.1-0.5 0.8-0.6 1.5 1 4.4 0 1-1.8 1 0.1 1.6-0.7 0.9 2.7 1.3-0.8 2.4-1z",
    "M1141.3 468.2l3.5 5.3 2.6 0.8 1.5-1.1 2.6 0.4 3.1-1.3 1.4 2.7 5.1 4.3-0.3 7.5 2.3 0.9-1.9 2.2-2.1 1.8-2.2 3.3-1.2 3-0.3 5.1-1.3 2.5-0.1 4.8-1.6 1.8-0.2 3.8-0.8 0.5-0.6 3.6 1.4 2.9 0.1 1-1.2 10.3 1.5 3.6-1 2.7 1.8 4.6 3.4 3.5 0.7 3.5 1.6 1.7-0.3 1.1-0.9-0.3-7.7 1.1-1.5 0.8-1.7 4.1 1.2 2.8-1.1 7.6-0.9 6.4 1.5 1.2 3.9 2.5 1.6-1.2 0.2 6.9-4.3 0-2.2-3.5-2-2.8-4.3-0.9-1.2-3.3-3.5 2-4.4-0.9-1.9-2.9-3.5-0.6-2.7 0.1-0.3-2-1.9-0.1-2.6-0.4-3.5 1-2.4-0.2-1.4 0.6 0.4-7.6-1.8-2.4-0.4-4 0.9-3.9-1.1-2.4-0.1-4.1-6.8 0.1 0.5-2.3-2.9 0-0.3 1.1-3.5 0.3-1.5 3.7-0.9 1.6-3.1-0.9-1.8 0.9-3.8 0.5-2.1-3.3-1.3-2.1-1.6-3.9-1.3-4.7-16.7-0.1-2 0.7-1.7-0.1-2.3 0.9-0.8-2 1.4-0.7 0.2-2.8 1-1.6 2-1.4 1.5 0.7 2-2.5 3.1 0.1 0.3 1.8 2.1 1.1 3.4-4 3.3-3.1 1.4-2.1-0.1-5.3 2.5-6.2 2.6-3.3 3.7-3.1 0.7-2 0.1-2.4 0.9-2.2-0.3-3.7 0.7-5.7 1.1-4 1.7-3.4 0.3-3.9 0.5-4.5 2.2-3.2 3-2.1 4.7 2.2 3.6 2.4 4.1 0.6 4.3 1.3 1.6-3.9 0.8-0.5 2.6 0.6 6.3-3.2 2.2 1.4 1.8-0.2 0.9-1.6 2.1-0.5 4.2 0.7 3.7 0.1 1.8-0.7z",
    "M1090.9 479.3l-0.3 3.9-1.7 3.4-1.1 4-0.7 5.7 0.3 3.7-0.9 2.2-0.1 2.4-0.7 2-3.7 3.1-2.6 3.3-2.5 6.2 0.1 5.3-1.4 2.1-3.3 3.1-3.4 4-2.1-1.1-0.3-1.8-3.1-0.1-2 2.5-1.5-0.7-2.1-2.2-1.7 1.1-2.3 2.8-4.6-6.8 4.3-3.6-2.1-4.2 2-1.6 3.8-0.8 0.4-2.9 3.1 3.1 5 0.3 1.7-3 0.7-4.3-0.6-5-2.7-3.8 2.5-7.5-1.4-1.2-4.2 0.5-1.6-3.3 0.4-2.8 7.1 0.2 4.6 1.7 4.5 1.5 0.4-3.4 3-6 3.3-3.4 3.9 1.1 3.6 0.3z",
    "M584.4 426.2l-3.7 1.1-1.6 3.2-2.3 1.8-1.8 2.4-0.9 4.6-1.8 3.8 2.9 0.4 0.6 2.9 1.2 1.5 0.3 2.5-0.7 2.4 0.1 1.4 1.4 0.5 1.2 2.2 7.3-0.6 3.3 0.8 3.8 5.6 2.3-0.7 4.1 0.3 3.2-0.7 2 1.1-1.2 3.4-1.3 2.2-0.6 4.6 1.1 4.3 1.5 1.9 0.2 1.4-2.9 3.2 2 1.4 1.5 2.3 1.6 6.4-1.1 0.8-1-3.8-1.6-2.1-1.9 2.3-11-0.2 0 4 3.3 0.7-0.2 2.5-1.1-0.7-3.2 1-0.1 4.7 2.6 2.4 0.9 3.6-0.1 2.8-2.2 17.6-2.9-3.4-1.7-0.1 3.5-6.6-4.4-3-3.4 0.6-2.1-1.1-3.1 1.7-4.2-0.9-3.5-6.7-2.6-1.6-1.8-3.1-3.8-3-1.5 0.6-2.4-1.5-2.8-2.1-1.6 1-4.8-0.9-1.4-2.8-1.1 0.1-5.6-3.6-0.7-2 2.1-0.5-0.2-3.2 1.4-2.4 2.8-0.4 2.5-4 2.2-3.4-2-1.5 1.2-3.7-1.1-5.9 1.3-1.7-0.7-5.4-2.2-3.5 0.9-3.1 1.8 0.5 1.1-1.9-1.1-3.8 0.7-0.9 2.9 0.2 4.5-4.5 2.4-0.7 0.1-2.1 1.4-5.5 3.4-2.9 3.5-0.2 0.6-1.3 4.4 0.5 4.6-3.2 2.3-1.4 2.9-3.1 2 0.4 1.3 1.7-1.2 2.1z",
    "M514.6 431.6l1.2 3.5 2 2.6 2.5 2.7-2.2 0.6-0.1 2.6 1.1 0.9-0.9 0.8 0.2 1.1-0.6 1.3-0.3 1.3-3-1.4-1.1-1.4 0.7-1.1-0.1-1.4-1.5-1.5-2.2-1.3-1.8-0.8-0.3-1.9-1.4-1.1 0.2 1.8-1.2 1.6-1.2-1.8-1.7-0.7-0.7-1.2 0.1-2 0.9-2-1.5-0.9 1.4-1.3 0.9-0.8 3.6 1.7 1.3-0.8 1.8 0.5 0.8 1.3 1.7 0.5 1.4-1.4z",
    "M1059.7 175.2l2.5 2 3.7 0.5-0.2 1.7 2.8 1.3 0.6-1.6 3.4 0.7 0.7 2 3.7 0.3 2.6 3.1-1.5 0-0.7 1.1-1.1 0.3-0.2 1.4-0.9 0.3-0.1 0.6-1.6 0.6-2.2-0.1-0.6 1.4-2.4-1.2-2.3 0.3-4-1.9-1.7 0.5-2.6 2.6-3.8-2.1-3-2.6-2.6-1.5-0.7-2.7-1-1.8 3.4-1.3 1.7-1.6 3.5-1.2 1.1-1.2 1.3 0.7 2.2-0.6z",
    "M1053.9 158.9l1.4 3.1-1.2 1.7 1.9 2.1 1.5 3.3-0.2 2.2 2.4 3.9-2.2 0.6-1.3-0.7-1.1 1.2-3.5 1.2-1.7 1.6-3.4 1.3 1 1.8 0.7 2.7 2.6 1.5 3 2.6-1.6 2.9-1.7 0.8 1 4.1-0.4 1.1-1.7-1.3-2.4-0.2-3.5 1.1-4.4-0.3-0.6 1.7-2.7-1.7-1.4 0.3-5.5-1.9-1 1.3-4.2 0 0.4-4.5 2.4-4.2-7.2-1.2-2.4-1.6 0.2-2.7-1-1.4 0.4-4.2-1.1-6.5 2.9 0 1.2-2.3 0.9-5.6-0.9-2.1 0.8-1.3 4-0.3 1 1.3 3.1-3-1.3-2.3-0.4-3.4 3.7 0.8 2.9-0.9 0.3 2.3 4.9 1.4 0.1 2.2 4.7-1.2 2.6-1.6 5.6 2.4 2.4 1.9z",
    "M1229.5 428.2l-1.9 3.5-1.3-1.2-1.3 0.5-3.2-0.1-0.2-2-0.5-1.8 1.8-3 1.9-2.8 2.4 0.6 1.7-1.6 1.4 2-0.1 2.6-3.1 1.6 2.4 1.7z",
    "M1031 264.6l-1 3.3 1 6.1-1.1 5.3-3.2 3.6 0.6 4.8 4.5 3.9 0.1 1.5 3.4 2.6 2.6 11.5 1.9 5.7 0.4 3-0.8 5.2 0.4 3-0.6 3.5 0.6 4-2.2 2.7 3.4 4.7 0.2 2.7 2.1 3.6 2.5-1.2 4.5 3 2.5 4-18.8 12.3-16 12.6-7.8 2.8-6.2 0.7-0.1-4.1-2.6-1.1-3.5-1.8-1.3-3-18.7-14-18.6-14-20.5-15.6 0.1-1.2 0.1-0.4 0.1-7.6 8.9-4.8 5.4-1 4.5-1.7 2.1-3.2 6.4-2.5 0.3-4.8 3.1-0.6 2.5-2.3 7.1-1.1 1-2.5-1.4-1.4-1.9-6.8-0.3-3.9-1.9-4.1 5.1-3.5 5.8-1.1 3.3-2.6 5.1-2 9-1.1 8.8-0.5 2.7 0.9 4.9-2.5 5.7-0.1 2.2 1.5 3.6-0.4z",
    "M1172.1 301.4l3.9 9.4 0.7 1.6-1.3 2.6-0.7 4.8-1.2 3.4-1.2 1.1-2-2.1-2.7-2.8-4.7-9.2-0.5 0.6 2.8 6.7 3.9 6.5 4.9 10 2.3 3.5 2 3.6 5.4 7.1-1 1.1 0.4 4.2 6.8 5.8 1.1 1.3-22.1 0-21.5 0-22.3 0-1-23.7-1.3-22.8-2-5.2 1.1-3.9-1-2.8 1.7-3.1 7.2-0.1 5.4 1.7 5.5 1.9 2.6 1 4-2 2.1-1.8 4.7-0.6 3.9 0.8 1.8 3.2 1.1-2.1 4.4 1.5 4.3 0.4 2.5-1.6z",
    "M1228.9 420.3l-1.7 1.6-2.4-0.6-2-2.1-2.5-3.7-2.6-2.1-1.5-2.2-5-2.6-3.9-0.1-1.4-1.3-3.2 1.5-3.6-2.9-1.5 4.8-6.6-1.4-0.7-2.5 2-9.5 0.3-4.2 1.7-2 4-1.1 2.7-3.6 3.6 7.4 1.9 5.9 3.2 3.1 8 6.1 3.3 3.6 3.2 3.8 1.8 2.2 2.9 1.9z",
    "M1113.7 124.6l0.9 1-2.6 3.4 2.4 5.6-1.6 1.9-3.8-0.1-4.4-2.2-2.1-0.7-3.8 1-0.1-3.5-1.5 0.8-3.3-2.1-1-3.4 5.5-1.7 5.6-0.8 5.1 0.9 4.7-0.1z",
    "M1207.3 408.5l3.9 0.1 5 2.6 1.5 2.2 2.6 2.1 2.5 3.7 2 2.1-1.9 2.8-1.8 3 0.5 1.8 0.2 2 3.2 0.1 1.3-0.5 1.3 1.2-1.2 2.2 2.2 3.6 2.2 3.1 2.2 2.3 18.7 7.6 4.8-0.1-15.6 19.3-7.3 0.3-5 4.5-3.6 0.1-1.5 2.1-3.9 0-2.3-2.2-5.2 2.7-1.6 2.7-3.8-0.6-1.3-0.7-1.3 0.2-1.8-0.1-7.2-5.4-4 0-1.9-2.1-0.1-3.6-2.9-1.1-3.5-7-2.6-1.5-1-2.6-3-3.1-3.5-0.5 1.9-3.6 3-0.2 0.8-1.9-0.2-5 0-0.8 1.5-6.7 2.6-1.8 0.5-2.6 2.3-5 3.3-3.1 2-6.4 0.7-5.5 6.6 1.4 1.5-4.8 3.6 2.9 3.2-1.5 1.4 1.3z",
    "M1104.1 70.1l0.4 3.8 7.3 3.7-2.9 4.2 6.5 6.3-1.7 4.8 4.9 4.2-0.9 3.8 7.4 3.9-0.9 2.9-3.4 3.4-8 7.4-8 0.5-7.6 2.1-7.1 1.3-3.2-3.2-4.7-1.9 0.1-5.8-3-5.2 1.6-3.4 3.3-3.5 8.8-6.2 2.6-1.2-0.9-2.4-6.5-2.6-1.8-2.2-1.8-8.5-7.2-3.7-6-2.7 2.2-1.4 5.1 2.8 5.3-0.2 4.7 1.3 3.4-2.4 1.1-4 5.9-1.8 5.8 2.1-0.8 3.8z",
    "M1060.5 487.3l-0.4 2.8 1.6 3.3 4.2-0.5 1.4 1.2-2.5 7.5 2.7 3.8 0.6 5-0.7 4.3-1.7 3-5-0.3-3.1-3.1-0.4 2.9-3.8 0.8-2 1.6 2.1 4.2-4.3 3.6-5.8-6.5-3.7-5.3-3.5-6.6 0.2-2.2 1.3-2 1.3-4.7 1.2-4.8 1.9-0.3 8.2 0 0-7.7 2.7-0.4 3.4 0.8 3.4-0.8 0.7 0.4z",
    "M1215.7 227.9l5.1 1.3 2.1 2.6 3.6 1.5-1.2 0.8 3.3 3.5-0.6 0.7-2.9-0.3-4.2-1.9-1.1 1.1-7 1-5.6-3.2-5.5 0.3 0.3-2.7-2.1-4.3-3.4-2.4-3-0.7-2.2-1.9 0.4-0.8 4.6 1.1 7.7 1 7.6 3.1 1.2 1.2 2.9-1z",
    "M986.5 431.1l-0.4 2 2.3 3.3 0 4.7 0.6 5 1.4 2.4-1.3 5.7 0.5 3.2 1.5 4.1 1.3 2.3-8.9 3.7-3.2 2.2-5.1 1.9-5-1.8 0.2-2.6-2.4-5.5 1.5-7.3 2.4-5.3-1.5-9.2-0.8-4.8 0.2-3.7 9.8-0.3 2.5 0.5 1.8-1 2.6 0.5z",
    "M921.5 421.9l0.3 2.4 0.9 0 1.5-0.9 0.9 0.2 1.6 1.7 2.4 0.5 1.5-1.4 1.9-0.9 1.3-0.9 1.1 0.2 1.3 1.4 0.6 1.8 2.3 2.7-1.1 1.6-0.3 2.1 1.2-0.6 0.7 0.7-0.3 1.9 1.7 1.9-1.1 0.5-0.5 2.2 1.3 2.6 1.4 5.2-2.1 0.7-0.5 0.9 0.4 1.3-0.4 2.8-0.9 0-1.6-0.2-1.1 2.6-1.6 0-1.1-1.4 0.4-2.6-2.4-3.9-1.4 0.7-1.3 0.2-1.5 0.3 0.1-2.3-0.9-1.7 0.2-1.9-1.2-2.7-1.6-2.3-4.5 0-1.3 1.2-1.6 0.2-1 1.4-0.6 1.7-3.1 2.9-2.4-3.8-2.2-2.5-1.4-0.9-1.4-1.3-0.6-2.8-0.8-1.4-1.7-1.1 2.6-3.1 1.7 0.1 1.5-1 1.2-0.1 0.9-0.8-0.4-2.1 0.6-0.7 0.1-2.2 2.7 0.1 4.1 1.5 1.2-0.1 0.4-0.7 3.1 0.5 0.8-0.4z",
    "M891.6 417.4l0.8-2.9 6.1-0.1 1.3-1.6 1.8-0.1 2.2 1.6 1.7 0 1.9-1 1.1 1.8-2.5 1.5-2.4-0.2-2.4-1.3-2.1 1.5-1 0-1.4 0.9-5.1-0.1z",
    "M909.2 421l-0.1 2.2-0.6 0.7 0.4 2.1-0.9 0.8-1.2 0.1-1.5 1-1.7-0.1-2.6 3.1-2.9-2.6-2.4-0.5-1.3-1.8 0.1-1-1.7-1.3-0.4-1.4 3-1 1.9 0.2 1.5-0.8 10.4 0.3z",
    "M1050.3 487.3l0 7.7-8.2 0-1.9 0.3-1.1-0.9 1.9-7.2 9.3 0.1z",
    "M896.3 1.4l19.9 3-6.7 1.4-13 0.2-18.5 0.4 1.4 0.7 12.3-0.5 9.7 1.4 7-1.2 2.4 1.4-4.5 2.4 9.2-1.6 17.1-1.5 10 0.8 1.7 1.7-14.8 2.9-2.2 1-11.4 0.8 8.1 0.2-4.9 3.2-3.6 2.9-1.2 5.2 3.7 3.2-5.9 0.1-6.5 1.6 6.3 2.6-0.1 4.2-4.2 0.5 4.1 4.3-8.7 0.4 4 2-1.6 1.8-5.7 0.8-5.5 0.1 4.2 3.4-0.5 2.4-7.3-2.2-2.4 1.4 5 1.3 4.6 3.2 0.6 4.3-7.4 1-2.7-2.1-4.2-3 0.5 3.6-5.4 2.8 10.7 0.2 5.5 0.3-11.9 4.7-12.2 4.3-12.7 1.8-4.6 0.1-4.9 2.1-7.5 5.8-10.2 3.9-3 0.3-6.1 1.3-6.6 1.4-4.8 3.4-1.4 4-3.4 3.8-8.6 4.6 0.3 4.5-3.6 4.8-4.1 5.7-6.5 0.4-5-4.8-9-0.1-3.2-3.2-0.8-5.6-4.8-7.2-0.7-3.7 1.5-5.1-3.7-5.1 3.3-4.1-1.9-2 7-6.4 7.2-2.1 2.6-2.2 2.8-4.2-5.5 1.9-2.6 0.8-4.1 0.7-4.2-1.7 1.5-3.7 3-2.8 3.8-0.1 7.6 1.5-5.3-3.4-2.7-1.8-4.4 0.7-2.6-1.3 7-4.8-1.3-2-1.1-3.5-1.4-5.4-3.6-1.9 1.4-2.1-8.1-2.9-7.7-0.4-10.1 0.2-9.5 0.4-3.1-1.6-3.8-3.1 11-1.5 7.6-0.2-14.6-1.3-6.5-1.9 2.2-1.8 15.7-2.2 15-2.2 2.8-1.6-8.1-1.6 4.6-1.7 14.7-2.9 5.4-0.4 0.2-1.8 9-1.1 11-0.6 10.4 0 2.8 1.2 10.6-2.2 7.1 1.5 4.6 0.3 6.2 1.3-6.7-2.1 1.6-1.7 12.7-2.2 11.6 0.2 5.1-1.4 11.9-0.3 26.3 0.4z",
    "M488.1 387.5l-0.7 5.1-1.3 7.2 1.7 0 1.7 1.2 0.6-1 1.5 0.8-2.8 2.5-2.9 1.8-0.5 1.2 0.3 1.3-1.3 1.6-1.4 0.4 0.3 0.8-1.2 0.7-2 1.6-0.3 0.9-2.8-1.1-3.5-0.1-2.4-1.3-2.8-2.6 0.4-1.9 0.8-1.5-0.7-1.2 3.3-5.2 7.2 0 0.4-2.2-0.8-0.4-0.5-1.4-1.9-1.5-1.8-2.1 2.5-0.1 0.5-3.6 5.2 0 5.2 0.1z",
    "M662.9 463.5l-1 5.8-3.5 1.6 0.3 1.5-1.1 3.4 2.4 4.6 1.8 0 0.7 3.6 3.3 5.6-1.3 0.3-3.2-0.6-1.8 1.7-2.6 1.1-1.8 0.3-0.6 1.3-2.8-0.3-3.5-3-0.3-3-1.4-3.3 1-5.4 1.6-2.3-1.2-3-2-0.9 0.8-2.9-1.2-1.4-3 0.2-3.7-4.8 1.6-1.8 0-3 3.5-1 1.4-1.2-1.8-2.4 0.5-2.3 4.7-3.8 3.6 2.4 3.3 4.1 0.1 3.4 2.1 0.1 3 3.1 2.1 2.3z",
    "M1081.5 207.6l1.5 2.5 1.7 1.8-1.7 2.4-2.4-1.4-3.5 0.1-4.5-1.1-2.3 0.1-1 1.4-2-1.5-0.8 2.6 2.7 3 1.3 1.9 2.5 2.4 2.1 1.4 2.1 2.7 4.8 2.4-0.5 1-5-2.3-3.2-2.3-4.8-1.9-4.7-4.6 1-0.5-2.5-2.7-0.3-2.1-3.3-1-1.4 2.7-1.6-2.1 0-2.2 0.1-0.1 3.6 0.2 0.8-1 1.8 1 2 0.1-0.1-1.7 1.7-0.7 0.3-2.5 3.9-1.7 1.6 0.8 4 2.7 4.3 1.2 1.8-1z",
    "M586.8 375.3l0.1 3.4-0.7 2.5-1.5 1.1 1.3 1.9-0.3 1.8-3.6-1.1-2.7 0.4-3.4-0.4-2.7 1.2-2.8-2 0.7-2.1 5.1 0.9 4.1 0.5 2.2-1.4-2.3-2.8 0.4-2.5-3.5-1 1.5-1.7 3.4 0.2 4.7 1.1z",
    "M1096.2 191.9l3 1.7 0.5 1.7-2.9 1.3-1.9 4.2-2.6 4.3-3.9 1.2-3.2-0.3-3.7 1.6-1.8 1-4.3-1.2-4-2.7-1.6-0.8-1.2-2.1-0.8-0.1 1.3-4-1.1-1.4 2.8 0 0.2-2.6 2.7 1.7 1.9 0.6 4.1-0.7 0.3-1.3 1.9-0.2 2.3-0.9 0.6 0.4 2.3-0.8 1-1.5 1.6-0.4 5.5 1.9 1-0.6z",
    "M1427.6 308l-2.8 3-0.9 6 5.8 2.4 5.8 3.1 7.8 3.6 7.7 0.9 3.8 3.2 4.3 0.6 6.9 1.5 4.6-0.1 0.1-2.5-1.5-4.1-0.2-2.7 3.1-1.4 1.5 5.1 0.4 1.2 5.5 2.5 3.2-1 4.7 0.4 4.5-0.2-0.5-3.9-2.6-2.1 4.2-0.8 3.9-4.8 5.4-4 4.9 1.5 3.2-2.7 3.6 4-1.2 2.7 6.1 1 1 2.4-1.7 1.2 1.4 3.9-4.2-1.1-6.2 4.4 0.9 3.7-2 5.4 0.3 3.1-1.6 5.3-4.6-1.5 0.9 6.7-1 2.2 1 2.7-2.5 1.5-4.4-10.2-1.5 0-0.3 4.2-3.6-3.4 1.2-3.6 2.4-0.4 1.6-5.4-3.4-1.1-5.1 0.1-5.4-0.9-1.2-4.5-2.7-0.3-4.9-2.8-1.2 4.4 4.6 3.4-3 2.4-0.9 2.3 3.7 1.7-0.3 3.9 2.6 4.8 1.6 5.3-0.5 2.4-3.8-0.1-6.6 1.3 0.9 4.8-2.4 3.8-7.5 4.4-5.3 7.5-3.8 4.1-5 4.2 0.3 2.9-2.6 1.6-4.8 2.3-2.6 0.3-1.2 4.9 1.9 8.4 0.7 5.3-1.9 6.1 0.7 10.9-2.9 0.3-2.3 4.9 1.9 2.2-5.1 1.8-1.7 4.3-2.2 1.9-5.6-6-3.1-9-2.5-6.5-2.2-3-3.4-6.2-2-8-1.4-4-5.9-8.8-3.5-12.5-2.6-8.2-0.8-7.8-1.7-6-7.7 3.9-4-0.8-8.1-7.8 2.4-2.3-1.9-2.5-7.1-5.5 3.2-4.3 12.1 0-1.8-5.5-3.5-3.2-1.4-5-4-2.8 4.9-6.8 6.5 0.5 4.5-6.7 2.2-6.5 3.9-6.5-1-4.6 3.8-3.7-5.1-3.1-2.9-4.4-3.3-5.6 2-2.8 8.5 1.6 5.7-1 3.8-5.4 7.7 7.6 0.8 5.2 3 3.3 0.6 3.3-4.1-0.9 3.2 7.1 6.2 4 8.6 4.5z",
    "M956.7 158.2l0.7 4.4-3.9 5.5-8.8 3.6-6.8-0.9 4.3-6.4-2.1-6.2 6.7-4.8 3.7-2.8 0.9 3.2-1.2 3.3 3-0.1 3.5 1.2z",
    "M1229 253.2l1.8-0.2 5.3-4.7 1.9-0.5 1.9 1.9-1.2 3.1 3.9 3.4 1.3-0.4 2.5 4.8 5.3 1.3 4.3 3.2 7.7 1.1 8-1.7 0.2-1.5 4.4-1.2 3-3.7 3.6 0.2 2-1.2 3.9 0.6 6.6 3.3 4.3 0.7 7.3 5.6 4 0.3 1.7 5.3-0.6 8-0.5 4.7 2.5 1-1.6 3.5 2.7 5.1 1.2 4.1 4.3 1.1 1.1 4.1-3.9 5.8 3.2 3.4 2.8 3.9 5.7 2.8 1 5.6 2.7 1.1 0.9 2.9-7.5 3.4-1.1 7.4-10.6-1.9-6.2-1.5-6.3-0.8-3.3-7.9-2.8-1.1-4.1 1.1-5.1 3.1-7-2.1-6.1-5-5.5-1.8-4.4-6.1-5.2-8.5-2.8 1-3.7-2.1-1.7 2.5-3.5-3.4-0.5-3.4-1.7 0 0.2-4.7-3.5-4.8-7.1-3.6-4.6-6.1 0.5-5 2.3-2.2-0.9-3.7-3.8-2-4.7-7.6-3.8-5.1 0.7-2-2.9-7.3 3.3-1.9 1.2 2.5 3.2 2.9 3.8 0.9z",
    "M1223.5 263.2l4.7 7.6 3.8 2 0.9 3.7-2.3 2.2-0.5 5 4.6 6.1 7.1 3.6 3.5 4.8-0.2 4.7 1.7 0 0.5 3.4 3.5 3.4-3.3-0.3-3.7-0.6-3.3 6.2-10.2-0.5-16.8-12.9-8.6-4.5-6.8-1.8-3.1-7.8 11-6.7 1-7.7-1.2-4.7 2.7-1.6 2.1-4 2.1-1 6.3 0.9 2.1 1.6 2.4-1.1z",
    "M924.8 84.5l-1.4 3.6 4.4 3.8-6.1 4.3-13.1 3.9-3.9 1.1-5.6-0.9-11.9-1.8 4.8-2.5-9-2.7 7.9-1.1 0.1-1.7-8.8-1.3 3.6-3.7 6.6-0.8 6 3.8 7-3 5.1 1.5 7.3-2.9 7 0.4z",
    "M1179.1 288.2l0.4 2.6-0.6 1 0.1 0-0.7 2-2.1-0.8-0.7 4.2 1.5 0.7-1.3 0.9-0.1 1.7 2.5-0.8 0.4 2.5-1.8 10.2-0.7-1.6-3.9-9.4 1.4-2.1-0.4-0.4 1.1-3 0.6-4.8 0.6-1.7 0.1 0 1.8 0 0.4-1.1 1.4-0.1z",
    "M556.5 387.1l-1.8 1.1-3-1.1-2.9-2.3 0.8-1.5 2.4-0.4 1.3 0.2 3.7 0.6 2.7 1.5 0.8 1.8-4 0.1z",
    "M1198.1 295.3l-0.9 1-10.4 3.2 6 6.5-1.6 1-0.7 2.2-4.1 0.9-1.1 2.3-2.1 2-6.2-1.1-0.3-0.9 1.8-10.2-0.4-2.5 0.6-1.9-0.4-4 0.7-2 6.3 2.6 9.7-6.9 3.1 7.8z",
    "M1338.3 160.5l4.4-0.3 9.2-5.8-0.8 2 8.4 4.7 18.3 15.6 1.1-3.2 8.4 3.5 6.2-1.6 3.3 1.1 4.1 3.6 4 1.2 3.3 2.7 6-0.9 4.4 3.8-1.9 4.2-3.8 0.6 2.5 6.2-1.6 2.9-10.8-2.1 1 11.3-2 1.4-9.1 2.5 8.8 11-2.9 1.6 1.7 3.7-3.5-1-3.4-2.3-7.9-0.6-8.6-0.2-1.6 0.7-8.2-2.7-2.5 1.4 0.5 3.7-9.2-2.2-3.1 0.9-0.3 2.8-2.6 1.2-5.4 4.4-0.9 4.6-2 0-2.3-3-6.7-0.2-2.5-5.2-2.6-0.1-1.5-6.4-7.6-4.6-8.6 0.5-5.7 0.9-6.6-5.7-4.8-2.4-9.2-4.5-1.1-0.5-12 3.7 6.2 23.4-2.6 0.3-4.8-5-3.9-1.8-5.6 1.3-1.8 2.2-0.6-1.6 0.6-2.6-1.5-2.2-6.5-2.2-3.7-5.7-3.2-1.6-0.6-2.1 5.1 0.6-1-4.6 4.1-1 4.7 0.9-0.7-6.1-1.9-3.9-5 0.3-4.7-1.5-5.1 2.7-4.4 1.4-2.8-1.1-0.2-3.2-4.3-4.2-3.6 0.2-5.3-4.2 1.7-4.8-1.8-1.2 2.2-6.9 6 3.6-0.6-4.5 8.1-6.7 7.6-0.2 12 4.3 6.6 2.5 4.4-2.6 7.7-0.1 7.3 3.2 0.8-1.9 7 0.3 0.2-2.9-9.4-4.3 3.5-3-1.5-1.6 4-1.6-5.1-4.2 1.4-2.1 17-2.1 1.7-1.5 10.9-2.3 3.1-2.5 9.1 1.3 4.4 6.3 4.3-1.5 7.1 2.1 1.1 3.3z",
    "M1223.5 476.7l-4.9 7.2 0.2 23.4 3.3 5.3-4 2.6-1.4 2.7-2.2 0.4-0.8 4.6-1.9 2.6-1.1 4.2-2.3 2.1-8.1-6.4-0.3-3.7-20.5-13.1 0.4-4.7-1.4-2.5 0-0.3 1.6-2.6 2.8-4.2 2.1-4.7-2.6-7.4-0.7-3.2-2.7-4.5 3.4-3.8 3.8-4.2 2.9 1.1 0.1 3.6 1.9 2.1 4 0 7.2 5.4 1.8 0.1 1.3-0.2 1.3 0.7 3.8 0.6 1.6-2.7 5.2-2.7 2.3 2.2 3.9 0z",
    "M1400.5 230.2l-0.2 1.4-6.9 3.4-1 2.6-6.4 0.7-0.6 4.1-5.8-0.9-3.2 1.3-4.1 3 1.2 1.5-1.1 1.4-9.6 1-7.1-2.1-5.5 0.5-0.6-3.6 6 1 1.4-1.9 4.1 0.6 5.3-4.6-7.2-3.4-3.2 1.6-4.6-2.4 3-4.1-1.7-0.6 0.3-2.8 3.1-0.9 9.2 2.2-0.5-3.7 2.5-1.4 8.2 2.7 1.6-0.7 8.6 0.2 7.9 0.6 3.4 2.3 3.5 1z",
    "M1589.8 410.6l1.8 4.3 0.1 7.7-9 5 2.8 3.8-5.9 0.5-4.6 2.6-4.8-0.9-2.6-3.4-3.5-6.6-2.1-7.8 3.1-5.3 7.1-1.2 5.3 0.9 5 2.5 2-4.4 5.3 2.3z",
    "M1652.9 259.5l0-0.6 2.5 0.2 0.6-2.8 3.6-0.4 2-0.4 0-1.5 8.3 7.5 3.3 4.2 3.4 7.4-0.5 3.5-4.3 1.2-3.1 2.7-4.6 0.5-2.1-3.5-1.1-4.8-5.3-6.6 3.4-1.1-6.1-5.5z",
    "M1247.5 309.4l1.5 2.8-0.3 1.5 2.4 4.8-3.9 0.2-1.7-3.1-5-0.6 3.3-6.2 3.7 0.6z",
    "M1589.8 410.6l-5.3-2.3-2 4.4-5-2.5 1.5-2.9-0.4-5.4-5.3-5.6-1.3-6.4-5-5.2-4.3-0.4-0.8 2.2-3.2 0.2-1.9-1.1-5.3 3.8-1-5.8 0.4-6.7-3.8-0.3-0.9-3.9-2.7-2 0.8-2.3 4.1-4.2 0.8 1.5 3 0.2-2-7.4 2.7-0.9 4 5.1 3.5 5.8 6.8 0 3 5.6-3.3 1.7-1.2 2.3 7.3 3.9 5.7 7.6 4.4 5.6 4.9 4.5 2 4.5-0.2 6.4z",
    "M1179.1 288.2l-1.4 0.1-0.4 1.1-1.8 0 1.3-5.3 2.2-4.5 0-0.2 2.5 0.3 1.2 2.5-2.7 2.5-0.9 3.5z",
    "M938.6 452.5l-0.2 1.8 0.5 3.1-1.2 2.9 1.6 1.8 1.8 0.4 2.4 2.7 0.2 2.5-0.6 0.8-0.4 5.3-1.5 0.1-5.8-3.1-5.2-4.9-4.8-3.5-3.8-4.1 1.4-2.1 0.3-1.9 2.6-3.4 2.6-3 1.3-0.2 1.4-0.7 2.4 3.9-0.4 2.6 1.1 1.4 1.6 0 1.1-2.6 1.6 0.2z",
    "M1122.6 299.1l-1.7 3.1 1 2.8-1.1 3.9 2 5.2 1.3 22.8 1 23.7 0.5 12.8-6.4 0 0 2.7-22.6-12.3-22.5-12.3-5.5 3.5-3.8 2.4-3.2-3.5-8.8-2.8-2.5-4-4.5-3-2.5 1.2-2.1-3.6-0.2-2.7-3.4-4.7 2.2-2.7-0.6-4 0.6-3.5-0.4-3 0.8-5.2-0.4-3-1.9-5.7 2.6-1.4 0.4-2.8-0.6-2.6 3.6-2.5 1.6-2.1 2.6-1.8 0.1-4.9 6.4 2.2 2.3-0.6 4.5 1.1 7.3 2.9 2.8 5.7 4.9 1.2 7.8 2.7 6 3.2 2.5-1.7 2.5-2.9-1.6-4.9 1.5-3.2 3.7-3 3.7-0.8 7.4 1.3 2 2.8 2 0.1 1.8 1.1 5.4 0.7 1.5 2.1z",
    "M1445.9 462l-4.8 1.5-2.9-5.1-1.4-9.2 2-10.4 4.1 3.5 2.8 4.5 3.1 6.7-0.6 6.7-2.3 1.8z",
    "M1139.1 697.9l-2 0.7-3.7-5 3.2-4 3.1-2.5 2.7-1.4 2.2 2 1.7 2-1.9 3.1-1.1 2.1-3.1 1-1.1 2z",
    "M1111.1 147.6l1 2.7-3.6 2-0.5 3.4-4.8 2.3-4.7 0-1.4-1.9-2.5-0.7-0.6-1.5 0.2-1.7-2.2-0.9-5.1-1.1-1.7-5.1 5.1-1.8 7.9 0.4 4.5-0.6 0.9 1.2 2.5 0.4 5 2.9z",
    "M1016.9 185.4l-1.4 0.1-1.1-0.5 0.4-3.5 1.3-0.2 1 1.4-0.2 2.7z",
    "M1112.8 136.5l2.5 1.3 1 2.9 2.1 3.6-4.6 2.3-2.7 1-5-2.9-2.5-0.4-0.9-1.2-4.5 0.6-7.9-0.4-5.1 1.8-0.5-4.5 1.7-3.8 4.1-2 4.4 4.5 3.7-0.2 0.1-4.6 3.8-1 2.1 0.7 4.4 2.2 3.8 0.1z",
    "M974.8 276l1.9 4.1 0.3 3.9 1.9 6.8 1.4 1.4-1 2.5-7.1 1.1-2.5 2.3-3.1 0.6-0.3 4.8-6.4 2.5-2.1 3.2-4.5 1.7-5.4 1-8.9 4.8-0.1 7.6-0.9 0 0.1 3.4-3.4 0.2-1.8 1.5-2.5 0-2-0.9-4.6 0.7-1.9 5-1.8 0.5-2.7 8.1-7.9 6.9-2 8.9-2.4 2.9-0.7 2.3-12.5 0.5-0.1 0 0.3-3 2.2-1.7 1.9-3.4-0.3-2.2 2-4.5 3.2-4.1 1.9-1 1.6-3.7 0.2-3.5 2.1-3.9 3.8-2.4 3.6-6.5 0.1-0.1 2.9-2.5 5.1-0.7 4.4-4.4 2.8-1.7 4.7-5.4-1.2-7.9 2.2-5.6 0.9-3.4 3.6-4.3 5.4-2.9 4.1-2.7 3.7-6.6 1.8-4 3.9 0.1 3.1 2.7 5.1-0.4 5.5 1.4 2.4 0z",
    "M1129.4 210.3l-1.3-2.9 0.2-2.7-0.6-2.7-3.4-3.8-2-2.6-1.8-1.8-1.6-0.7 1.1-0.9 3.2-0.6 4 1.9 2 0.3 2.6 1.7-0.1 2.1 2 1 1.1 2.6 2 1.6-0.2 1 1 0.6-1.3 0.5-3-0.2-0.6-0.9-1 0.5 0.6 1.1-1.1 2.1-0.6 2.1-1.2 0.7z",
    "M1267.9 588.9l0.4 7.7 1.3 3-0.7 3.1-1.2 1.8-1.6-3.7-1.2 1.9 0.8 4.7-0.7 2.8-1.7 1.4-0.7 5.5-2.7 7.5-3.4 8.8-4.3 12.2-2.9 8.9-3.1 7.5-4.6 1.5-5.1 2.7-3-1.6-4.2-2.3-1.2-3.4 0-5.7-1.5-5.1-0.2-4.7 1.3-4.6 2.6-1.1 0.2-2.1 2.9-4.9 0.8-4.1-1.1-3-0.8-4.1-0.1-5.9 2.2-3.6 1-4.1 2.8-0.2 3.2-1.3 2.2-1.2 2.4-0.1 3.4-3.6 4.9-4 1.8-3.2-0.6-2.8 2.4 0.8 3.3-4.4 0.3-3.9 2-2.9 1.8 2.8 1.4 2.7 1.2 4.3z",
    "M449.3 335.9l2.2-0.2-3.2 5.7-1.8 4.6-1.8 8.6-1.1 3.1 0.4 3.5 1.3 3.2 0.4 4.9 3 4.8 0.8 3.7 1.7 3.1 5.7 1.7 1.9 2.7 5.2-1.8 4.3-0.6 4.4-1.2 3.6-1.1 3.9-2.6 1.8-3.7 1.2-5.4 1.2-1.9 4-1.7 6.1-1.5 4.9 0.3 3.4-0.6 1.2 1.4-0.6 3.1-3.5 3.8-1.8 3.9 0.9 1.1-1.2 2.8-2.1 5-1.2-1.7-1.1 0.1-1.1 0.1-2.5 3.9-0.9-0.8-0.7 0.3-0.1 1-5.2-0.1-5.2 0-0.5 3.6-2.5 0.1 1.8 2.1 1.9 1.5 0.5 1.4 0.8 0.4-0.4 2.2-7.2 0-3.3 5.2 0.7 1.2-0.8 1.5-0.4 1.9-5.6-6.9-2.6-2.1-4.4-1.7-3.2 0.5-4.8 2.4-2.9 0.6-3.7-1.7-4.1-1.2-4.8-2.9-4.1-0.9-5.9-3-4.3-3.1-1.1-1.7-3.1-0.4-5.4-2-1.9-2.9-5.4-3.7-2.2-4-0.8-3.2 1.9-0.6-0.3-1.8 1.6-1.7 0.4-2.2-1.5-2.9 0-2.5-1.3-3.3-3.8-6.4-4.6-5-1.9-4-4.1-2.6-0.7-1.6 1.7-3.9-2.4-1.5-2.5-3.2-0.2-4.4-2.8-0.6-2.3-3.3-1.7-3.2 0.3-2-1.5-4.8-0.3-4.9 0.8-2.5-3.1-2.6-1.9 0.3-2.4-1.7-1.8 2.6-0.1 3-1 4.9 1 2.6 2.8 4.4 0.4 1.6 0.7 0.4 0.1 2.2 1-0.1 0 4.2 1.3 1.6 0.5 2.3 2.7 3.2 0.4 6 1 2.8 0.9 3-0.3 3.4 2.6 0.2 1.6 2.9 1.5 2.9-0.3 1.2-2.8 2.3-1 0-0.7-3.9-2.9-3.7-3.4-3.1-2.5-1.6 1.2-4.7-0.1-3.5-2.1-2-3.1-2.8-0.9 0.8-1-1.7-3-1.5-2.2-3.8 0.5-0.4 2.1 0.3 2.7-2.4 1-2.9-2.9-4.6-2.6-1.7-0.8-4-0.6-4.3-0.8-5.1-0.2-5.8 6.3-0.5 7.1-0.7-0.9 1.3 7 3.1 10.9 4.5 10.8 0 4.3 0 0.8-2.7 9.4 0 1.3 2.3 2.1 2.1 2.4 2.8 0.8 3.3 0.4 3.6 2.3 1.9 4 1.9 4.8-5 4.5-0.2 3.2 2.6 1.6 4.4 0.9 3.8 2.4 3.6 0.2 4.5 0.9 3 3.9 2 3.6 1.4z",
    "M1105.5 236.6l-1 0.2-0.8 1.1-2.8-0.1-1.8 1.4-3.4 0.5-2.3-1.5-1-2.7 0.5-2.2 0.7 0.1 0.1-1.3 2.9-1 1.2-0.3 1.7-0.3 2.4-0.2 2.8 2.1 0.8 4.2z",
    "M1010.2 378.8l0.1 14.8-3.1 4.3-0.4 4-5 1-7.7 0.5-2 2.3-3.6 0.3-3.6 0-1.4-1.2-3.1 0.9-5.3 2.7-1.1 2-4.3 2.8-0.8 1.7-2.4 1.3-2.7-0.9-1.5 1.6-0.9 4.4-4.5 5.3 0.2 2.2-1.6 2.7 0.4 3.7-2.4 1-1.3 0.8-0.9-2.7-1.6 0.7-1-0.1-1 1.8-4.4 0-1.5-1-0.8 0.6-1.7-1.9 0.3-1.9-0.7-0.7-1.2 0.6 0.3-2.1 1.1-1.6-2.3-2.7-0.6-1.8-1.3-1.4-1.1-0.2-1.3 0.9-1.9 0.9-1.5 1.4-2.4-0.5-1.6-1.7-0.9-0.2-1.5 0.9-0.9 0-0.3-2.4 0.3-2-0.5-2.4-2-1.8-1.1-3.7-0.2-4 1.9-1.2 1-3.8 1.8-0.1 3.9 1.8 3.2-1.3 2.1 0.4 0.9-1.4 22.5-0.1 1.3-4.5-1-0.8-2.5-27.7-2.4-27.7 8.5-0.1 18.6 14 18.7 14 1.3 3 3.5 1.8 2.6 1.1 0.1 4.1 6.2-0.7z",
    "M1548.4 364.2l-4.1 4.2-0.8 2.3-3 1.5-2.8 2.8-3.9 0.3-1.5 6.9-2.2 1.2 3.5 5.6 4.1 4.7 2.9 4.3-1.4 5.5-1.8 1.2 1.8 3.2 4.3 5.1 1 3.6 0.2 3 2.7 5.9-2.6 6-2.2 6.6-0.9-4.8 1.3-4.9-2.2-3.8-0.2-7-2.6-3.4-2.7-7.6-2-8.1-3.1-5.4-3.2 3.3-5.8 4.5-3.3-0.5-3.6-1.5 0.9-8-2-6-5.3-7.4 0.3-2.3-3.4-0.9-4.6-5.2-1.1-5.2 2.1 1-0.6-4.6 2.5-1.5-1-2.7 1-2.2-0.9-6.7 4.6 1.5 1.6-5.3-0.3-3.1 2-5.4-0.9-3.7 6.2-4.4 4.2 1.1-1.4-3.9 1.7-1.2-1-2.4 3.1-0.5 2.7 3.8 2.7 1.5 1.3 4.9 0.9 5.3-4.2 5.4 0.7 7.6 5.6-1.1 2.4 5.9 3.7 1.3-0.8 5.3 4.5 2.4 2.6 1.2 3.8-1.9 0.5 2.7z",
    "M1090.6 227.2l-0.8 1.4-1.4 0.6-0.4-1.2-1.9 3.1 0.5 2.1-1.1-0.5-1.7-2.1-2.3-1.3 0.5-1 0.4-3.5 1.6-1.5 0.9-0.6 1.4 1.1 0.9 0.9 1.7 0.7 2.1 1.3-0.4 0.5z",
    "M1496.2 181.5l4-1.2 5.7-0.8 5.4 0.9 6.6 2.9 4.9 3.2 4.6 0 6.8 1 3.6-1.6 5.9-1 4.4-4.4 3.4 0.7 3.9 2.1 5.6-0.6 0.6 4.7 0.3 6.3 2.8 2.5 2.3-0.8 5.5 1 2.5-2.3 5.2 2 7.2 4.4 0.8 2.2-4.4-0.7-6.8 0.8-2.5 1.8-1.3 4.2-6.4 2.4-3.2 3.4-5.9-1.3-3.2-0.6-0.5 4.1 2.9 2.4 1.9 2.1-2.4 2.2-2 3.4-4.9 2.2-7.6 0.2-7.2 2.2-4.4 3.4-3.3-1.9-6.2 0-9.4-3.9-5.6-0.9-6.4 0.9-11.3-1.5-5.6 0.2-4.7-3.8-5-5.8-3.4-0.7-8-4-7.2-0.8-6.5-1.1-3-2.8-1.4-7.3-5.8-5.1-8.2-2.3-5.7-3.3-3.3-4.4 4.7-1.1 6.7-5.3 5.9-2.9 5.3 1.9 5.2 0.1 4.8 2.9 5 0.2 8 1.6 2.4-4.4-4-3.6 1.3-6.4 7 2.5 4.8 0.8 6.7 1.6 3.6 4.6 8.5 2.6z",
    "M1166.7 673.5l-4.1 0-0.3-2.9-0.6-2.9-0.4-2.3 1.4-7.1-1.1-4.6-2.2-9 6.2-7.3 1.7-4.6 0.8-0.6 0.9-3.8-0.8-1.9 0.4-4.8 1.3-4.4 0.4-8.2-2.8-2-2.7-0.5-1.1-1.6-2.6-1.3-4.7 0.1-0.2-2.4-0.4-4.6 17.2-5.3 3.2 3.1 1.5-0.6 2.2 1.6 0.2 2.6-1.3 3 0.2 4.5 3.5 4 1.9-4.5 2.5-1.3-0.1-8.3-2.2-4.6-1.9-2.1-0.4 0-0.6-7.3 1.5-6.1 2.2-0.2 6.7 1.8 1.5-0.8 3.9-0.2 2.1-1.9 3.4 0.1 6.2-2.5 4.6-3.7 0.9 2.8-0.5 6.4 0.5 5.7-0.2 10 0.8 3.1-1.9 4.6-2.4 4.5-3.7 4-5.3 2.4-6.5 3.1-6.6 6.9-2.2 1.2-4.2 4.6-2.3 1.4-0.8 4.6 2.4 4.9 0.9 3.7 0 2 1-0.4-0.5 6.3-1.1 3 1.2 1.1-1 2.7-2.4 2.3-4.7 2.1-6.9 3.5-2.5 2.4 0.3 2.7 1.3 0.4-0.7 3.4z",
    "M959.2 341.5l-8.5 0.1 2.4 27.7 2.5 27.7 1 0.8-1.3 4.5-22.5 0.1-0.9 1.4-2.1-0.4-3.2 1.3-3.9-1.8-1.8 0.1-1 3.8-1.9 1.2-3.6-4.4-3.4-4.8-3.6-1.7-2.7-1.8-3.1 0-2.8 1.4-2.7-0.5-2 2-0.4-3.4 1.6-3.2 0.8-6-0.4-6.4-0.6-3.2 0.6-3.2-1.4-3-2.8-2.8 1.3-2.1 21.7 0-0.9-9.3 1.5-3.3 5.2-0.5 0.2-16.5 18 0.4 0.2-9.8 20.5 15.6z",
    "M1182.3 588.9l0.4 0 1.9 2.1 2.2 4.6 0.1 8.3-2.5 1.3-1.9 4.5-3.5-4-0.2-4.5 1.3-3-0.2-2.6-2.2-1.6-1.5 0.6-3.2-3.1-2.9-1.6 2-6 1.8-2.2-0.9-5.4 1.3-5.2 1-1.7-1.3-5.4-2.6-2.9 5.5 1.2 1 1.7-0.1 0.8 1.8 4.1 0.2 7.7-1.8 3.6 1.6 4.7-0.2 2.8 1.2 1.9-0.1 2.4 0.9 1.4 1-1.6 1.9 2.5 0.2-0.8-1-3.4-1.1-0.3-0.1-0.9z",
    "M1116.2 614.3l4.6-1.4 3.6 0.3 2.2 1.5 0 0.5-3.2 1.5-1.7 0-3.7 2.5-2-2.7-8.7 2.3-4.2 0.2-0.8 22.9-5.5 0.2-0.6 18.7-1.1 23.7-5 3.3-2.9 0.5-3.4-1.2-2.5-0.5-0.8-2.7-2-1.8-2.8 3.2-3.9-4.9-2-4.6-1-6.3-1.2-4.6-1.6-9.9 0.1-7.7-0.6-3.5-2.1-2.7-2.8-5.3-2.8-7.7-1.1-4-4.4-6.3-0.3-4.9 2.7-1.2 3.4-1.1 3.6 0.2 3.3 2.9 0.8-0.5 22.7-0.2 3.8 3 13.5 0.9 10.4-2.6z",
    "M1068.6 355l1.6 10 2.2 1.7 0.1 2 2.4 2.2-1.2 2.8-1.8 13-0.2 8.4-7 6-2.3 8.5 2.4 2.4 0 4.1 3.7 0.1-0.6 3.1-1.5 0.3-0.2 2.1-1 0.1-3.9-7-1.4-0.3-4.3 3.6-4.4-1.9-3-0.3-1.6 0.9-3.3-0.2-3.3 2.7-2.9 0.2-6.8-3.3-2.7 1.5-2.9-0.1-2.1-2.4-5.6-2.4-6.1 0.8-1.4 1.3-0.8 3.7-1.6 2.6-0.4 5.8-4.3-3.7-2 0-1.9 1.9 0.1-4.4-6.5-1.5-0.2-3.1-3.1-4.2-0.8-2.9 0.5-3.1 3.6-0.3 2-2.3 7.7-0.5 5-1 0.4-4 3.1-4.3-0.1-14.8 7.8-2.8 16-12.6 18.8-12.3 8.8 2.8 3.2 3.5 3.8-2.4z",
    "M1066.2 421.7l2.3 2.5-0.6 1.2-0.3 2.1-4.7 5-1.4 4.1-0.8 3.3-1.2 1.5-1.1 4.5-3 2.6-0.8 3.2-1.3 2.6-0.5 2.7-3.9 2.2-3.2-2.7-2.1 0.1-3.4 3.8-1.6 0-2.7 6.2-1.4 4.6-5.9 2.3-2.1-0.3-2.2 1.4-4.5-0.1-3.1-4.1-1.9-4.6-4-4.2-4.2 0-5 0 0.3-10.3-0.2-4.1 1.1-4 1.7-2 2.8-4-0.6-1.7 1.1-2.6-1.3-3.8 0.2-2.1 0.4-5.8 1.6-2.6 0.8-3.7 1.4-1.3 6.1-0.8 5.6 2.4 2.1 2.4 2.9 0.1 2.7-1.5 6.8 3.3 2.9-0.2 3.3-2.7 3.3 0.2 1.6-0.9 3 0.3 4.4 1.9 4.3-3.6 1.4 0.3 3.9 7 1-0.1z",
    "M1469 322.9l0.2 2.7 1.5 4.1-0.1 2.5-4.6 0.1-6.9-1.5-4.3-0.6-3.8-3.2-7.7-0.9-7.8-3.6-5.8-3.1-5.8-2.4 0.9-6 2.8-3 1.9-1.5 4.8 2 6.4 4.2 3.3 0.9 2.5 3.1 4.5 1.2 5 2.9 6.5 1.4 6.5 0.7z",
    "M1401.6 273.9l-3.8 5.4-5.7 1-8.5-1.6-2 2.8 3.3 5.6 2.9 4.4 5.1 3.1-3.8 3.7 1 4.6-3.9 6.5-2.2 6.5-4.5 6.7-6.5-0.5-4.9 6.8 4 2.8 1.4 5 3.5 3.2 1.8 5.5-12.1 0-3.2 4.3-4.2-1.6-2.2-4.6-4.9-4.9-10 1.2-9 0.1-7.6 0.9 1.1-7.4 7.5-3.4-0.9-2.9-2.7-1.1-1-5.6-5.7-2.8-2.8-3.9-3.2-3.4 9.6 3.3 5.3-1 3.4 0.8 0.9-1.4 3.9 0.6 6.6-2.7-0.8-5.4 2.3-3.7 4.1 0 0.2-1.7 4-0.9 2.1 0.6 1.8-1.8-1.1-3.9 1.4-3.8 3.1-1.7-3.1-4.2 5.2 0.2 0.9-2.3-0.8-2.5 2-2.7-1.4-3.2-1.9-2.7 2.4-2.8 5.3-1.3 5.9-0.8 2.4-1.1 2.9-0.8 4.7 3 2.9 5 9.5 2.5z",
    "M549.3 446.2l-0.7 0.9 1.1 3.8-1.1 1.9-1.8-0.5-0.9 3.1-1.8-1.8-1-3.5 1.4-1.7-1.4-0.4-0.9-2.1-2.8-1.8-2.4 0.4-1.3 2.2-2.4 1.6-1.2 0.2-0.6 1.4 2.5 3.5-1.6 0.8-0.8 0.9-2.7 0.4-0.8-3.9-0.8 1.1-1.8-0.4-1-2.5-2.3-0.5-1.5-0.7-2.4 0-0.2 1.4-0.6-1 0.3-1.3 0.6-1.3-0.2-1.1 0.9-0.8-1.1-0.9 0.1-2.6 2.2-0.6 1.9 2.3-0.2 1.4 2.2 0.3 0.6-0.6 1.5 1.6 2.8-0.5 2.5-1.6 3.5-1.3 2-1.9 3.1 0.4-0.2 0.6 3.1 0.2 2.4 1.2 1.8 1.9 2 1.8z",
    "M590.5 529.4l-5.1-0.3-0.8 1-4.6 1.2-6.3 4.4-0.3 3-1.4 2.2 0.7 3.5-3.4 1.8 0.2 2.8-1.5 1.1 2.6 5.8 3.3 3.9-1 2.8 3.8 0.3 2.3 3.5 5 0.1 4.4-3.7 0.1 9.7 2.6 0.7 3.2-1.1 5.5 10.4-1.1 2.1 0 4.6 0.3 5.4-1.9 3.2 1.2 2.4-1.1 2.2 2.9 5.4-2.9 6.9-1.1 3.3-2.8 1.6-5.9-3.7-0.8-2.6-11.7-6.4-10.7-7.1-4.7-3.9-2.8-5.3 0.8-1.9-5.4-8.4-6.4-11.8-6-12.8-2.4-3-2-4.7-4.6-4.2-4.1-2.6 1.7-2.8-3-6.2 1.7-4.5 4.4-4 0.7 2.7-1.6 1.5 0.3 2.3 2.3-0.5 2.3 0.7 2.5 3.3 3.1-2.7 0.9-4.3 3.4-5.6 6.7-2.5 6.1-6.8 1.7-4.1-0.8-4.9 1.5-0.6 3.8 3 1.8 3.1 2.6 1.6 3.5 6.7 4.2 0.9 3.1-1.7 2.1 1.1 3.4-0.6 4.4 3-3.5 6.6 1.7 0.1 2.9 3.4z",
    "M1079.9 154.8l5.9 0.7 8.8-0.1 2.5 0.7 1.4 1.9 0.6 2.7 1.7 2.3 0.4 2.4-2.8 1.3 1.9 2.8 0.5 2.8 3.2 5.4-0.3 1.7-2.3 0.7-3.8 5.2 1.6 2.8-1.1-0.4-5-2.4-3.5 0.9-2.4-0.6-2.8 1.3-2.7-2.2-1.9 0.9-0.3-0.4-2.6-3.1-3.7-0.3-0.7-2-3.4-0.7-0.6 1.6-2.8-1.3 0.2-1.7-3.7-0.5-2.5-2-2.4-3.9 0.2-2.2-1.5-3.3-1.9-2.1 1.2-1.7-1.4-3.1 3.1-1.8 7.1-2.8 5.8-2 4.8 1 0.6 1.5 4.6 0z",
    "M1660.3 229.9l1.4 1.1-2.2-0.4-1 2.2-0.3 2.1 2.8 4.6-1.9 1.4-0.3 1.1-0.9 1.9-2.9 1.1-1.4 1.7 1.3 2.7-0.3 0.7 2.6 1.1 4.4 2.8 0 1.5-2 0.4-3.6 0.4-0.6 2.8-2.5-0.2 0 0.6-3.2-1.2-0.1 1.2-1.3 0.5-0.7-1.2-1.7-0.6-1.9-1 0.1-2.8 0.9-0.8-1-1.1-0.4-3.5-0.9-1-3.4-0.7-3.4-1.7 2.1-4.1 3.9-3.4 1.1-4.6 3.6 2 4.6 0.3-2.8-3.4 6.4-2.7 0-3.6 5.5 3.8z",
    "M662.5 631.4l2 3.5 0.4 8.7 5.9 1.3 2.2-1.3 3.9 1.8 1.2 1.9 1.1 5.9 0.8 2.4 2.1 0.3 2-1 2.1 1.1 0.3 3.6-0.3 3.8-0.7 3.7-0.3 5.6-4.3 5-4.2 1-6.3-1-5.8-1.7 4.2-9.8-1.1-2.8-5.9-2.5-7.3-4.8-4.6-1-11.3-10.4 1.5-7.7-0.2-3.5 2.1-5.6 9.6-1.9 5.2 0.1 5.4 3.3 0.3 2z",
    "M1178.3 293.8l0.4 4-0.6 1.9-2.5 0.8 0.1-1.7 1.3-0.9-1.5-0.7 0.7-4.2 2.1 0.8z",
    "M1270.1 343.7l-1.5 0.5-1.8-1.3-0.8-4.7 1.1-3.3 1.5-0.7 1.8 2 0.5 3.7-0.8 3.8z",
    "M1118.9 193.1l1.6 0.7 1.8 1.8 2 2.6 3.4 3.8 0.6 2.7-0.2 2.7 1.3 2.9 2.4 1.2 2.3-1.1 2.4 1.1 0.4 1.7-2.3 1.3-1.6-0.6-0.4 7.7-3.1-0.7-4-2.3-5.9 1.5-2.3 1.6-7.6-0.4-4-0.9-1.9 0.4-1.8-2.6-1-1.1 1-1.1-1.3-0.7-1.5 1.4-3.1-1.9-0.7-2.6-3.2-1.4-0.8-2.1-3-2.4 3.9-1.2 2.6-4.3 1.9-4.2 2.9-1.3 2-1.4 3.2 0.7 3.2 0 2.5 1.6 1.6-1 3.6-0.6 1-1.5 2.1 0z",
    "M1158.8 509.1l2.2 3.6-0.3 3.8-1.6 0.8-3.1-0.4-1.7 3.7-3.5-0.5 0.6-3.6 0.8-0.5 0.2-3.8 1.6-1.8 1.4 0.7 3.4-2z",
    "M938.9 324.3l-0.1 0.4-0.1 1.2-0.2 9.8-18-0.4-0.2 16.5-5.2 0.5-1.5 3.3 0.9 9.3-21.7 0-1.3 2.1 0.3-2.7 0.1 0 12.5-0.5 0.7-2.3 2.4-2.9 2-8.9 7.9-6.9 2.7-8.1 1.8-0.5 1.9-5 4.6-0.7 2 0.9 2.5 0 1.8-1.5 3.4-0.2-0.1-3.4 0.9 0z",
    "M1240.5 315l5 0.6 1.7 3.1 3.9-0.2 2.7 5.6 2.9 1.4 1.2 2.3 4 2.7 0.7 2.6-0.4 2.2 0.9 2.1 1.8 1.8 0.9 2.1 1 1.6 1.8 1.3 1.5-0.5 1.3 2.5 0.3 1.4 2.7 6.6 16.9 3.2 1-1.4 3 4.6-2.6 12.8-16.3 6.4-15.9 2.5-5 2.9-3.5 6.7-2.6 1.1-1.5-2.1-2.1 0.3-5.5-0.7-1.1-0.6-6.4 0.1-1.5 0.6-2.4-1.6-1.3 3.1 0.8 2.7-2.4 2.1-0.9-2.8-1.8-1.9-0.5-2.6-3.1-2.3-3.3-5.4-1.9-5.2-4.1-4.4-2.5-1.1-4.1-6.1-0.9-4.4 0-3.8-3.6-7.2-2.8-2.5-3-1.3-2.1-3.7 0.2-1.4-1.8-3.4-1.7-1.4-2.5-4.8-3.8-5.1-3.1-4.4-2.7 0 0.5-3.5 0.1-2.3 0.4-2.6 6.2 1.1 2.1-2 1.1-2.3 4.1-0.9 0.7-2.2 1.6-1-6-6.5 10.4-3.2 0.9-1 6.8 1.8 8.6 4.5 16.8 12.9 10.2 0.5z",
    "M1191 409.2l-0.7 5.5-2 6.4-3.3 3.1-2.3 5-0.5 2.6-2.6 1.8-1.5 6.7 0 0.8-0.8-0.2 0.1-3.2-0.8-2.2-2.9-2.5-0.9-4.6 0.6-4.8-2.6-0.4-0.4 1.4-3.4 0.4 1.5 1.8 0.5 3.9-3 3.5-2.7 4.6-2.9 0.7-4.8-3.7-2.1 1.3-0.5 1.8-2.9 1.3-0.2 1.3-5.6 0-0.8-1.3-4.1-0.3-2 1.1-1.6-0.5-2.9-3.8-1-1.7-4.1 0.9-1.5 2.9-1.3 5.8-2 1.2-1.7 0.7-0.5-0.3-1.9-1.9-0.4-2 0.8-2.6 0-2.7-3.3-4-0.7-2.7 0-1.6-2.1-1.9-0.1-3.7-1.3-2.5-1.9 0.4 0.5-2.4 1.4-2.6-0.7-2.7 1.8-2-1.2-1.5 1.3-3.9 2.5-4.8 4.8 0.5-1.1-25.5 0-2.7 6.4 0-0.5-12.8 22.3 0 21.5 0 22.1 0 2.1 6.3-1.2 1.1 1.2 6.7 2.5 7.6 2.2 1.6 3.2 2.4-2.7 3.6-4 1.1-1.7 2-0.3 4.2-2 9.5 0.7 2.5z",
    "M1178.1 441.1l0.2 5-0.8 1.9-3 0.2-1.9 3.6 3.5 0.5 3 3.1 1 2.6 2.6 1.5 3.5 7-3.8 4.2-3.4 3.8-3.5 3-4 0-4.5 1.5-3.6-1.5-2.3 1.8-5.1-4.3-1.4-2.7-3.1 1.3-2.6-0.4-1.5 1.1-2.6-0.8-3.5-5.3-0.9-2-4.3-2.6-1.4-3.8-2.4-2.8-3.9-3.3-0.1-2.1-3.1-2.6-3.9-2.5 1.7-0.7 2-1.2 1.3-5.8 1.5-2.9 4.1-0.9 1 1.7 2.9 3.8 1.6 0.5 2-1.1 4.1 0.3 0.8 1.3 5.6 0 0.2-1.3 2.9-1.3 0.5-1.8 2.1-1.3 4.8 3.7 2.9-0.7 2.7-4.6 3-3.5-0.5-3.9-1.5-1.8 3.4-0.4 0.4-1.4 2.6 0.4-0.6 4.8 0.9 4.6 2.9 2.5 0.8 2.2-0.1 3.2 0.8 0.2z",
    "M918 408l0.2 4 1.1 3.7 2 1.8 0.5 2.4-0.3 2-0.8 0.4-3.1-0.5-0.4 0.7-1.2 0.1-4.1-1.5-2.7-0.1-10.4-0.3-1.5 0.8-1.9-0.2-3 1-0.8-4.9 5.1 0.1 1.4-0.9 1 0 2.1-1.5 2.4 1.3 2.4 0.2 2.5-1.5-1.1-1.8-1.9 1-1.7 0-2.2-1.6-1.8 0.1-1.3 1.6-6.1 0.1-2.3-5-2.7-2.2 2.5-1.3 2.8-4.5 1.4-3.3 2-2 2.7 0.5 2.8-1.4 3.1 0 2.7 1.8 3.6 1.7 3.4 4.8 3.6 4.4z",
    "M928.5 447.9l-2.6 3-2.6 3.4-0.3 1.9-1.4 2.1-1.5-0.5-4-2.6-3-3.4-0.9-2.4-0.7-4.7 3.1-2.9 0.6-1.7 1-1.4 1.6-0.2 1.3-1.2 4.5 0 1.6 2.3 1.2 2.7-0.2 1.9 0.9 1.7-0.1 2.3 1.5-0.3z",
    "M492.5 415.9l-0.7 1.5-3.3-0.1-2-0.6-2.2-1.3-3-0.4-1.5-1.4 0.3-0.9 2-1.6 1.2-0.7-0.3-0.8 1.4-0.4 1.6 0.6 1.1 1.2 1.6 1.1 0.1 0.8 2.5-0.7 1.2 0.4 0.7 0.7-0.7 2.6z",
    "M1102 218.2l-1.1 1.4 0.7 2.4 2.8 2.7-1.8 2-0.6 2 0.6 0.8-0.7 0.8-2.4 0.2-1.7 0.3-0.3-0.5 0.6-0.7 0.4-1.6-0.7 0.1-1.1-1.2-0.9-0.3-0.8-1-1-0.4-0.8-0.9-0.9 0.4-0.5 2.1-1.2 0.4 0.4-0.5-2.1-1.3-1.7-0.7-0.9-0.9-1.4-1.1 1.1-0.3 0.5-2.9-2.7-2.5 1.1-2.8-1.9 0.1 1.7-2.4-1.7-1.8-1.5-2.5 3.7-1.6 3.2 0.3 3 2.4 0.8 2.1 3.2 1.4 0.7 2.6 3.1 1.9 1.5-1.4 1.3 0.7-1 1.1 1 1.1z",
    "M681 464.9l-3.1 5.5 0.3 4.4 2.2 3.8-1.1 2.7-0.5 3-1.5 2.7-3.2-1.4-2.7 0.7-2.3-0.6-0.6 1.9 1 1.2-0.6 1.4-3.1-0.6-3.3-5.6-0.7-3.6-1.8 0-2.4-4.6 1.1-3.4-0.3-1.5 3.5-1.6 1-5.8 6.8 1.3 0.6-1.2 4.6-0.5 6.1 1.8z",
    "M1098.1 187.7l-1.2 1.7-0.7 2.5-1 0.6-5.5-1.9-1.6 0.4-1 1.5-2.3 0.8-0.6-0.4-2.3 0.9-1.9 0.2-0.3 1.3-4.1 0.7-1.9-0.6-2.7-1.7-0.7-2.1 0.3-0.8 0.6-1.4 2.2 0.1 1.6-0.6 0.1-0.6 0.9-0.3 0.2-1.4 1.1-0.3 0.7-1.1 1.5 0 0.3 0.4 1.9-0.9 2.7 2.2 2.8-1.3 2.4 0.6 3.5-0.9 5 2.4z",
    "M1069.8 203.9l-3.9 1.7-0.3 2.5-1.7 0.7 0.1 1.7-2-0.1-1.8-1-0.8 1-3.6-0.2 1.1-0.5-1.4-2.7 0.4-3.1 4.2 0.5 2.4-1.5 4.4-0.1 0.9-1.1 0.8 0.1 1.2 2.1z",
    "M1088.2 87l-7 1.6-3.5 3.9 1.3 3.5-6.2 4.5-7.8 5-2.1 8.1 3.7 4.1 4.8 3.3-3.3 6.6-4.6 1.4-0.6 10-2.1 5.7-5.7-0.6-2.2 4.8-5.5 0.3-1.9-5.7-4.5-6.9-4.2-8.4 1.8-3.4 3.4-4 0.8-6.9-3.1-2.9-1-7.7 2.4-5.4 4.3 0.1 1.3-2.2-1.8-2 5.7-7.9 3.4-6.1 2.3-3.9 4 0 0.6-3.1 8 0.9-0.1-3.6 2.6-0.2 6 2.7 7.2 3.7 1.8 8.5 1.8 2.2z",
    "M1161.7 667.7l0.6 2.9 0.3 2.9-1.4 2.8-3.2 0.7-3.1-3.5 0.1-2.2 1.7-2.4 0.6-1.9 1.7-0.4 2.7 1.1z",
    "M1195 287.5l-9.7 6.9-6.3-2.6-0.1 0 0.6-1-0.4-2.6 0.9-3.5 2.7-2.5-1.2-2.5-2.5-0.3-1.1-4.9 1-2.7 1.3-1.4 1.2-1.4-0.2-3.5 1.9 1.2 5.6-1.8 3 1.2 4.4 0 5.7-2.4 2.9 0.1 5.9-1-2.1 4-2.7 1.6 1.2 4.7-1 7.7-11 6.7z",
    "M1119.2 376.1l1.1 25.5-4.8-0.5-2.5 4.8-1.3 3.9 1.2 1.5-1.8 2 0.7 2.7-1.4 2.6-0.5 2.4 1.9-0.4 1.3 2.5 0.1 3.7 2.1 1.9 0 1.6-3.6 1.1-2.8 2.6-4 7-5.2 3-5.5-0.4-1.6 0.6 0.6 2.2-2.9 2.3-2.4 2.5-7.1 2.4-1.4-1.4-1-0.2-1 1.7-4.6 0.5 0.8-1.8-1.8-4.4-0.8-2.6-2.5-1.1-3.4-3.8 1.2-3 2.6 0.6 1.6-0.4 3.2 0-3.2-5.8 0.2-4.3-0.5-4.2-2.3-4.1 0.6-3.1-3.7-0.1 0-4.1-2.4-2.4 2.3-8.5 7-6 0.2-8.4 1.8-13 1.2-2.8-2.4-2.2-0.1-2-2.2-1.7-1.6-10 5.5-3.5 22.5 12.3 22.6 12.3z",
    "M991.4 431.2l-0.7 3.4 1.7 1.9 2 2.2 0.2 3.2 1.2 1.3-0.3 14.8 1.4 4.4-4.5 1.4-1.3-2.3-1.5-4.1-0.5-3.2 1.3-5.7-1.4-2.4-0.6-5 0-4.7-2.3-3.3 0.4-2 4.9 0.1z",
    "M1577.5 410.2l-5.3-0.9-7.1 1.2-3.1 5.3 2.1 7.8-5.3-3-4.8 0.2 0.3-5.1-4.9 0 0.2 7.1-2.2 9.4-1.4 5.7 0.7 4.6 3.7 0.2 2.7 5.9 1.3 5.5 3.4 3.7 3.4 0.7 3.1 3.4-1.7 2.6-3.7 0.8-0.6-3.3-4.8-2.8-0.9 1.1-2.3-2.4-1.2-3.2-3.2-3.6-2.9-3.1-0.7 3.8-1.3-3.6 0.4-4 1.2-6.1 2.2-6.6 2.6-6-2.7-5.9-0.2-3-1-3.6-4.3-5.1-1.8-3.2 1.8-1.2 1.4-5.5-2.9-4.3-4.1-4.7-3.5-5.6 2.2-1.2 1.5-6.9 3.9-0.3 2.8-2.8 3-1.5 2.7 2 0.9 3.9 3.8 0.3-0.4 6.7 1 5.8 5.3-3.8 1.9 1.1 3.2-0.2 0.8-2.2 4.3 0.4 5 5.2 1.3 6.4 5.3 5.6 0.4 5.4-1.5 2.9z",
    "M1357 243.6l-1.4 1.9-6-1 0.6 3.6 5.5-0.5 7.1 2.1 9.6-1 3.1 6 1.5-0.7 3.7 1.5 0.5 2.5 1.8 3.6-5.4 0-3.8-0.5-2.5 2.9-2.2 0.6-1.5 1.4-2.7-2.1-0.9-5.4-1.7-0.3 0.1-2-3.3-1.4-1.7 2.2 0.2 2.6-0.6 0.9-3.2-0.1-0.9 2.9-2.1-1.2-3.4 2-1.8-0.7 1.3-6.5-2.4-4.8-4.2-1.5 0.6-2.8 4.4 0.3 1.5-3.5 0.5-4.1 6.5-1.5-0.2 3 1.3 1.7 2.1-0.1z",
    "M1338.3 262l-1.6-0.2-2.9-1.7-0.3 2.2-4.2 1.3 0.2 5.1-2.6 2-4 0.9-0.4 2.9-3.9 0.9-5.9-2.5-1.7-5.3-4-0.3-7.3-5.6-4.3-0.7-6.6-3.3-3.9-0.6-2 1.2-3.6-0.2-3 3.7-4.4 1.2-1.9-4.5-0.6-6.7-4.6-2.2 0.4-4.3-3.5-0.4-0.1-5.4 5.3 1.6 4.1-2-4.7-3.9-2.4-3.6-3.8 1.6 0.6 4.7-2.6-4.1 1.8-2.2 5.6-1.3 3.9 1.8 4.8 5 2.6-0.3 5.9-0.1-1.7-3.2 3.8-2.2 3.4-3.7 7.9 3.4 1.9 5 2.3 1.3 5.5-0.3 2.1 1.2 4.3 6.6 7.1 4.4 4.2 3 6.3 3.1 7.7 2.8 0.8 3.9z",
    "M1692.7 562.1l0.1-1.9-0.5-1.3 0.8-1.5 4.9-1.4 4-0.3 1.8-0.8 2.1 0.8-2.2 1.8-6.1 2.8-4.9 1.8z",
    "M1048.2 289.1l-0.1 4.9-2.6 1.8-1.6 2.1-3.6 2.5 0.6 2.6-0.4 2.8-2.6 1.4-2.6-11.5-3.4-2.6-0.1-1.5-4.5-3.9-0.6-4.8 3.2-3.6 1.1-5.3-1-6.1 1-3.3 5.7-2.5 3.7 0.7 0 3.3 4.4-2.4 0.4 1.2-2.5 3.2 0.1 2.9 1.9 1.6-0.5 5.6-3.5 3.2 1.2 3.5 2.8 0.1 1.4 3.1 2.1 1z",
    "M1657.9 355.5l-1.4 5.3-4-5.5-1.5-4.7 1.9-6.3 3.3-4.9 3 1.9-0.1 3.9-1.2 10.3z",
    "M1167 508.4l-0.2 3.9-1.1 4.5 1.6 2.5 2.5-1.5 3.3-0.4 0.7 0.8 3.3-1.6-2.3-2.2 1.9-2.9 2.8-2.9 20.5 13.1 0.3 3.7 8.1 6.4-2.8 8 0.3 3.6 3.5 2.3 0.2 1.7-1.7 3.9 0.3 1.9-0.4 3.1 1.8 4 2.2 6.4 2 1.4-4.6 3.7-6.2 2.5-3.4-0.1-2.1 1.9-3.9 0.2-1.5 0.8-6.7-1.8-2.2 0.2 0.1-0.1-1.8-2.4-0.3-6.8-2.9-3.4-0.4 1.2-1-1.7-5.5-1.2-3.2-1.9-3.6-1.1-2.2-1.1-0.3-0.2-2.7-6.6-0.4-3.9-4.5-4.4 1.4-2.4-1.1-2.6 0.2-2.7-1-0.9 0.3-2.8 0.6-0.1 2-2.3 2.3-3.4 1.4-1.3 0-2.1-1.2-1.5-0.3-2.5 1.6-0.8 0.3-3.8-2.2-3.6 2-0.8 6.2 0.1z",
    "M1179 474.5l2.7 4.5 0.7 3.2 2.6 7.4-2.1 4.7-2.8 4.2-1.6 2.6 0 0.3-0.2-0.4-3-1.3-2.4 1.6-3.6 0.9-2.6 3.7 0.3 2.5-6.2-0.1-2 0.8-3.4 2-1.4-0.7 0.1-4.8 1.3-2.5 0.3-5.1 1.2-3 2.2-3.3 2.1-1.8 1.9-2.2-2.3-0.9 0.3-7.5 2.3-1.8 3.6 1.5 4.5-1.5 4 0 3.5-3z",
    "M1157.2 174.6l2.3 2.7 0.1 1.2 6.7 2.2 3.6-1 3.6 2.9 2.9-0.1 7.7 2 0.4 1.9-1.3 3.2 1.8 3.5-0.3 2.1-4.8 0.4-2.2 1.8 0.4 2.7-3.9 0.5-3 2.1-4.6 0.3-4 2.4 1 3.9 2.8 1.5 5.1-0.4-0.6 2.3-5.4 1.1-6.3 3.6-3.1-1.3 0.7-2.9-5.9-1.9 0.7-1.2 4.6-2.1-1.7-1.4-8.1-1.6-0.8-2.4-4.5 0.8-1.3 3.5-3.3 4.6-2.4-1.1-2.3 1.1-2.4-1.2 1.2-0.7 0.6-2.1 1.1-2.1-0.6-1.1 1-0.5 0.6 0.9 3 0.2 1.3-0.5-1-0.6 0.2-1-2-1.6-1.1-2.6-2-1 0.1-2.1-2.6-1.7-2-0.3-4-1.9-3.2 0.6-1.1 0.9-2.1 0-1 1.5-3.6 0.6-1.6 1-2.5-1.6-3.2 0-3.2-0.7-2 1.4-0.5-1.7-3-1.7 0.7-2.5 1.2-1.7 1.1 0.4-1.6-2.8 3.8-5.2 2.3-0.7 0.3-1.7-3.2-5.4 2.3-0.3 2.4-1.6 3.8-0.2 4.9 0.5 5.7 1.5 3.9 0.1 1.9 0.9 1.7-1.1 1.5 1.5 4.3-0.3 2.1 0.6-0.3-3.1 1.3-1.4 4.1-0.3 1.8 0.2 1-1.4 1.5 0.3 4.9-0.6 3.8 3.5-0.9 1.3 0.8 1.9 3.9 0.3z",
    "M699.7 718.6l-1.6 4.1-5.4 3.5-4.2-1.3-2.8 0.7-5.5-2.7-3.6 0.2-3.9-3.6-0.4-4.1 0.9-1.4-1.2-6.4 0.4-6.6 0.5-5.2 3.4-0.7 6.3 5 1.9-0.2 6.3 4.1 4.8 3.6 3.8 4.3-1.8 3.1 2.1 3.6z",
    "M1352.7 230.7l1.7 0.6-3 4.1 4.6 2.4 3.2-1.6 7.2 3.4-5.3 4.6-4.1-0.6-2.1 0.1-1.3-1.7 0.2-3-6.5 1.5-0.5 4.1-1.5 3.5-4.4-0.3-0.6 2.8 4.2 1.5 2.4 4.8-1.3 6.5-4.3-1.4-3 0-0.8-3.9-7.7-2.8-6.3-3.1-4.2-3-7.1-4.4-4.3-6.6-2.1-1.2-5.5 0.3-2.3-1.3-1.9-5-7.9-3.4-3.4 3.7-3.8 2.2 1.7 3.2-5.9 0.1-6.2-23.4 12-3.7 1.1 0.5 9.2 4.5 4.8 2.4 6.6 5.7 5.7-0.9 8.6-0.5 7.6 4.6 1.5 6.4 2.6 0.1 2.5 5.2 6.7 0.2 2.3 3 2 0 0.9-4.6 5.4-4.4 2.6-1.2z",
    "M648.7 448.1l-4.7 3.8-0.5 2.3 1.8 2.4-1.4 1.2-3.5 1 0 3-1.6 1.8 3.7 4.8 0.7 1.8-2.1 2.5-6.4 2.4-4.1 1-1.7 1.5-4.5-1.6-4.1-0.8-1.1 0.6 2.5 1.6-0.3 4.3 0.7 4.1 4.8 0.5 0.3 1.4-4.1 1.8-0.7 2.7-2.4 1.1-4.2 1.5-1.1 2-4.4 0.4-3.1-3.4-1.6-6.4-1.5-2.3-2-1.4 2.9-3.2-0.2-1.4-1.5-1.9-1.1-4.3 0.6-4.6 1.3-2.2 1.2-3.4-2-1.1-3.2 0.7-4.1-0.3-2.3 0.7-3.8-5.6-3.3-0.8-7.3 0.6-1.2-2.2-1.4-0.5-0.1-1.4 0.7-2.4-0.3-2.5-1.2-1.5-0.6-2.9-2.9-0.4 1.8-3.8 0.9-4.6 1.8-2.4 2.3-1.8 1.6-3.2 3.7-1.1-0.2 1.5-3.4 0.8 1.7 2.9-0.3 3.4-2.7 3.7 1.9 5.1 2.5-0.4 1.5-4.7-1.7-2.2 0-4.9 7.2-2.6-0.6-3 2.1-2.1 1.7 4.6 4 0.1 3.4 3.5 0.2 2.2 5 0 6.1-0.6 3.1 2.8 4.2 0.8 3.3-2 0.1-1.6 7.1-0.4 6.7-0.1-4.9 1.9 1.8 3.1 4.5 0.4 4.2 3.2 0.7 5.1 2.9-0.1 2.2 1.5z",
    "M1586.5 363.5l-6.5 5.4-3.7 6.1-0.6 4.5 5.3 6.7 6.5 8.4 5.7 4 4.1 5.1 4 11.9 0.4 11.3-4.3 4.2-6.1 4.2-4.2 5.3-6.6 6-2.3-4.1 1.2-4.4-4.4-3.6 4.6-2.6 5.9-0.5-2.8-3.8 9-5-0.1-7.7-1.8-4.3 0.2-6.4-2-4.5-4.9-4.5-4.4-5.6-5.7-7.6-7.3-3.9 1.2-2.3 3.3-1.7-3-5.6-6.8 0-3.5-5.8-4-5.1 2.7-1.6 4.4 0.1 5.3-0.8 4.1-3.4 3.1 2.4 5.3 1.2-0.3 3.7 3.1 2.6 5.9 1.7z",
    "M1283.8 394.9l-4 1.7-0.9 2.9 0 2.2-5.4 2.7-8.8 3-4.7 4.5-2.5 0.4-1.7-0.4-3.2 2.7-3.5 1.2-4.7 0.3-1.4 0.4-1.1 1.7-1.5 0.5-0.8 1.6-2.8-0.2-1.7 0.9-4-0.3-1.6-3.8 0-3.5-1-1.9-1.3-4.7-1.8-2.6 1.1-0.4-0.7-2.9 0.6-1.2-0.4-2.8 2.4-2.1-0.8-2.7 1.3-3.1 2.4 1.6 1.5-0.6 6.4-0.1 1.1 0.6 5.5 0.7 2.1-0.3 1.5 2.1 2.6-1.1 3.5-6.7 5-2.9 15.9-2.5 5.2 10.6 2.2 4.5z",
    "M1162.1 556.8l0.3 0.2 2.2 1.1 3.6 1.1 3.2 1.9 2.6 2.9 1.3 5.4-1 1.7-1.3 5.2 0.9 5.4-1.8 2.2-2 6 2.9 1.6-17.2 5.3 0.4 4.6-4.3 0.9-3.3 2.5-0.8 2.2-2 0.6-5.1 5.2-3.2 4.2-1.9 0.1-1.8-0.7-6.2-0.7-1-0.5 0-0.5-2.2-1.5-3.6-0.3-4.6 1.4-3.6-4-3.6-5.2 0.8-20.5 11.7 0.1-0.4-2.2 0.9-2.4-0.9-3 0.7-3.1-0.6-2 1.9 0.1 0.3 2 2.7-0.1 3.5 0.6 1.9 2.9 4.4 0.9 3.5-2 1.2 3.3 4.3 0.9 2 2.8 2.2 3.5 4.3 0-0.2-6.9-1.6 1.2-3.9-2.5-1.5-1.2 0.9-6.4 1.1-7.6-1.2-2.8 1.7-4.1 1.5-0.8 7.7-1.1 0.9 0.3-0.3 1.4 1.9 0.5 1.2 1.3 1-0.3-0.5-1.1z",
    "M1159.4 644.7l-2.9-0.7-1.9 0.8-2.7-1.1-2.2 0-3.4-2.9-4.3-1-1.5-4.1 0.1-2.3-2.3-0.7-6.1-7-1.6-3.7-1.1-1.2-1.9-5.1 6.2 0.7 1.8 0.7 1.9-0.1 3.2-4.2 5.1-5.2 2-0.6 0.8-2.2 3.3-2.5 4.3-0.9 0.2 2.4 4.7-0.1 2.6 1.3 1.1 1.6 2.7 0.5 2.8 2-0.4 8.2-1.3 4.4-0.4 4.8 0.8 1.9-0.9 3.8-0.8 0.6-1.7 4.6-6.2 7.3z",
    "M1222.1 512.6l-3.3-5.3-0.2-23.4 4.9-7.2 1.5-2.1 3.6-0.1 5-4.5 7.3-0.3 15.6-19.3-4.8 0.1-18.7-7.6-2.2-2.3-2.2-3.1-2.2-3.6 1.2-2.2 1.9-3.5 1.9 1.2 1.2 2.7 2.7 2.7 2.8 0 5.2-1.7 6.1-0.7 4.9-2 2.8-0.4 2-1.2 3.2-0.2 1.8-0.2 2.5-0.9 3-0.7 2.5-2.2 2.2 0 0.2 1.8-0.4 3.7 0.2 3.4-1.1 2.3-1.4 7-2.4 7.1-3.3 8.2-4.6 9.4-4.7 7.2-6.6 8.8-5.6 5.2-8.4 6.4-5.3 4.8-6.2 7.8-1.3 3.4-1.3 1.5z",
    "M1097.8 230.8l-1.2 0.3-2.9 1-0.1 1.3-0.7-0.1-0.6-2.3-1.3-0.7-1.2-1.7 0.8-1.4 1.2-0.4 0.5-2.1 0.9-0.4 0.8 0.9 1 0.4 0.8 1 0.9 0.3 1.1 1.2 0.7-0.1-0.4 1.6-0.6 0.7 0.3 0.5z",
    "M1159.4 644.7l2.2 9 1.1 4.6-1.4 7.1 0.4 2.3-2.7-1.1-1.7 0.4-0.6 1.9-1.7 2.4-0.1 2.2 3.1 3.5 3.2-0.7 1.4-2.8 4.1 0-1.7 4.7-1 5.3-1.7 2.9-4 3.3-1.1 0.9-2.6 3.3-1.8 3.3-3.5 4.6-6.7 6.6-4.1 3.8-4.3 3-5.9 2.4-2.7 0.4-0.9 1.8-3.2-1-2.7 1.2-5.7-1.2-3.3 0.8-2.2-0.4-5.8 2.6-4.6 1-3.5 2.4-2.4 0.2-2.1-2.3-1.8-0.1-2.2-2.9-0.3 0.9-0.6-1.7 0.3-3.8-1.5-4.3 1.8-1.2 0.1-4.9-3.3-6-2.4-5.4 0-0.1-3.6-8.3 2.8-3.2 2 1.8 0.8 2.7 2.5 0.5 3.4 1.2 2.9-0.5 5-3.3 1.1-23.7 1.4 1 3 6.1-0.6 3.9 1.1 2.3 4-0.7 2.8-2.9 2.7-1.9 1.5-3.1 2.8-1.4 2.3 0.7 2.5 1.8 4.5 0.3 3.6-1.4 0.6-2 1.2-3.1 3-0.5 1.8-2.4 2-4.3 5.2-4.8 8.1-4.7 2.2 0 2.7 1.1 1.9-0.8 2.9 0.7z m-20.3 53.2l1.1-2 3.1-1 1.1-2.1 1.9-3.1-1.7-2-2.2-2-2.7 1.4-3.1 2.5-3.2 4 3.7 5 2-0.7z",
    "M1016.5 177.1l-2.8-1.5-3.1-2.7-4.5 1.3-3.6-0.5 2.5-1.7 4-9 6.5-2.6 4 0.2 0.9 2.1-0.9 5.6-1.2 2.3-2.9 0 1.1 6.5z",
    "M946.9 263.7l-2.2 1.6-2.8-0.9-2.7 0.7 0.9-5-0.3-3.9-2.4-0.6-1.1-2.4 0.5-4.2 2.2-2.3 0.5-2.6 1.2-3.8 0-2.7-0.9-2.3-0.2-2.2 1.9-1.6 2.2-0.9 1.2 3.1 3 0 0.9-0.8 3.1 0.2 1.3 3.2-2.4 1.7-0.3 5-0.8 0.9-0.3 3.1-2.3 0.5 2 3.8-1.6 4.2 1.8 1.9-0.8 1.7-2 2.4 0.4 2.2z",
    "M976.6 223.4l2 2.4 9.5 2.9 1.9-1.4 5.8 2.9 5.9-0.8 0.4 3.7-4.9 4.2-6.6 1.4-0.5 2.1-3.2 3.5-2 5.2 2 3.7-3 2.8-1.2 4.2-4 1.3-3.7 4.9-6.8 0.1-5-0.1-3.4 2.2-2.1 2.4-2.6-0.5-1.9-2.2-1.4-3.6-4.9-1-0.4-2.2 2-2.4 0.8-1.7-1.8-1.9 1.6-4.2-2-3.8 2.3-0.5 0.3-3.1 0.8-0.9 0.3-5 2.4-1.7-1.3-3.2-3.1-0.2-0.9 0.8-3 0-1.2-3.1-2.2 0.9-1.9 1.6 0.5-4.5-2-2.7 7.4-4.6 6.2 1.1 6.9 0 5.4 1.1 4.3-0.4 8.3 0.3z",
    "M677.3 487l1.5-2.8 0.5-2.9 1-2.7-2.1-3.8-0.3-4.4 3.1-5.5 1.9 0.7 4.1 1.5 5.9 5.4 0.8 2.6-3.4 5.9-1.8 4.7-2.2 2.5-2.7 0.4-0.8-1.8-1.3-0.2-1.7 1.7-2.5-1.3z",
    "M592.9 422l-0.5-0.2-0.5-0.5 0.1-0.6 0.2 0.3 0.4 0.4 0.3 0.5 0 0.1z",
    "M634.2 384.9l-0.2 0 0.3-0.4 0.3 0-0.2 0.3-0.2 0.1z",
    "M1264.1 333.3l0.3 0.1 0.2-0.1 0.4 0.7-0.1 0.2 0.1 0.9 0 0.7-0.2 0.4-0.1-0.4-0.6-0.8 0.1-0.4-0.2-0.7 0-0.4 0.1-0.2z",
    "M635.2 387l-0.1-0.3 0.3 0.1-0.2 0.2z",
    "M637.3 294l-0.3 0-0.1 0.1 0.1 0.2-0.4 0.2-0.1-0.1 0.2-0.1 0.1 0 0.1-0.3 0.3-0.1 0.1 0.1z",
    "M651.5 418l-0.6-0.2-0.1-0.5 0-0.8 0.2-0.4 0.2 0.2 0.2 0.6 0.5 0.3 0.1 0.4-0.5 0.4z",
    "M599 424.5l-0.3 0-0.4-0.3-0.3-0.1-0.3-0.3-0.1-0.2-0.3-0.1-0.2-0.4-0.3-0.3 0.1-0.5 0.5 0.3 0.1 0.5 0.4 0.4 0.7 0.2 0.2 0.3 0.3 0.4-0.1 0.1z",
    "M642 401.7l0.5 0.1 0.2 0.5 0 0.6-0.1 0.8-0.1 0.2-0.2 0.1-0.4 0.2 0.1-0.4-0.1-0.2-0.1-0.7-0.3-0.5 0-0.3 0.1-0.3 0-0.3 0.2 0 0.2 0.2z",
    "M639.2 424.5l-0.4 0.3-0.2-0.1-0.1-0.5 0.2-0.5 0.3-0.4 0.3 0 0.1 0.3-0.1 0.7-0.1 0.2z",
    "M1800.8 415.5l-0.1 0.4 0 0.6-0.1 0.3-0.3 0-0.2-0.3-0.1-0.5 0-0.5 0.6-0.5 0.1-0.2 0.1-0.5 0.2-0.1 0.1 0.2 0.4 0.1-0.2 0.5-0.5 0.5z",
    "M643.7 413.8l-0.2-0.2-0.4-0.2-0.1-0.2 0-0.6 0.1-0.2 0.7-1.1 0.3 0.2 0 0.7-0.1 0.8-0.1 0.4-0.2 0.4z",
    "M634.2 386l-0.4-0.1 0.2-0.3 0.3-0.1-0.1 0.5z",
    "M1402.9 474.8l0 0.2-0.2-0.1 0.2-0.2 0 0.1z",
    "M1953.8 456l1 0.4-0.2 0-0.8-0.4z",
    "M638.2 393.9l0.2 0.4 0 0.3-0.2 0.2-0.2-0.1-0.1-0.3 0.3-0.5z",
    "M1933 505.3l-0.2 0-0.1-0.3 0.3 0 0 0.3z",
    "M1747.7 453.1l-0.2 0.4 0.1 0.1-0.2 0.6 0.1 0.2-0.5 0.2-0.2-0.7 0.3-0.2-0.2-0.2 0.3-0.6 0.3-0.1 0.2 0.3z",
    "M634.2 386l0 0.1-0.4-0.1 0-0.1 0.4 0.1z",
    "M1998.9 556.6l0-0.2 0.1 0 0 0.1-0.1 0.1z",
    "M642.2 417.4l-0.1 0.1-0.5-0.3 0-0.4 0.2-0.3 0.2-0.5 0.4 0 0.1 0.4-0.1 0.8-0.2 0.2z",
    "M626.1 383.4l-0.4 0.2-0.1 0-0.3 0.2-0.1-0.1 0.1-0.3 0.6-0.1 0.2 0.1z",
    "M644 406.9l0 0.2 0.4-0.1-0.2 0.5 0.2 0.2 0 0.2 0.2 0.2 0.2 0.9-0.3 0.3-0.1-0.4-0.1 0.1-0.6-0.1-0.4 0-0.2-0.3 0.6-0.5-0.4 0-0.4-0.4-0.1-0.5-0.2-0.5 0.3-0.4 0.4 0.1 0.5 0.3 0.2 0.2z",
    "M1240.2 583.1l0.2 0.3 0.5 0.2 0 0.3-0.2 0.2 0.1 0.2-0.3 0.6 0.1 0.2-0.3 0.1-0.2-0.3 0-0.3 0.2-0.2-0.2-0.7-0.1-0.1-0.1-0.2 0.3-0.3z",
    "M1295 635.8l0.4 0 0.4 0.2 0.3 0.3 0 0.3 0.1 0.5 0.3 0.2 0.2 0.2 0.1 0.2-0.2 0.6-0.1 0.4-0.2 0.2-0.4 0.1-0.9 0-0.2-0.2-0.8-0.4-0.3-0.5 0-0.3-0.3-0.6 0.1-0.4 0.2-0.2 0.2-0.4 0.1 0 0.5-0.2 0.5 0z",
  ];

  const tobaccoPaths:Record<string,string>={
    cuba:"M544.8 355.7l1.9 2.3 5.2-0.7 1.8 1.5 4.2 4 3.2 2.9 1.8-0.1 3.2 1.3-0.6 1.8 4 0.3 3.9 2.6-0.8 1.5-3.8 0.8-3.8 0.3-3.7-0.5-8.1 0.6 4.2-3.5-2.1-1.7-3.6-0.4-1.7-1.9-0.8-3.6-3.2 0.2-5-1.7-1.5-1.4-7.1-1-1.8-1.2 2.3-1.6-5.4-0.3-4.4 3.3-2.3 0.1-1 1.6-2.8 0.7-2.3-0.7 3.2-1.9 1.5-2.4 2.7-1.4 3-1.2 4.3-0.6 1.4-0.8 4.7 0.5 4.4 0.1 4.9 2.2z",
    nicaragua:"M519.6 405.5l-0.5 0.7-0.5 1.4 0.4 2.3-1.5 2.2-0.8 2.6-0.5 2.8 0.2 1.7-0.1 2.9-0.9 0.6-0.7 2.8 0.2 1.7-1.2 1.6 0.1 1.7 0.8 1.1-1.4 1.4-1.7-0.5-0.8-1.3-1.8-0.5-1.3 0.8-3.6-1.7-0.9 0.8-1.8-2-2.5-2.6-1.1-2.1-2.2-2.1-2.5-2.9 0.7-1 0.8 1 0.5-0.4 1.8-0.3 0.8-1.5 0.8 0 0.2-3.2 1.3-0.1 1.2 0 1.4-1.7 1.5 1.3 0.6-0.8 1.2-0.8 2.1-1.7 0.2-1.4 0.5 0.1 0.9-1.5 0.6-0.2 0.9 1 1.1 0.2 1.3-0.8 1.4 0 2-0.8 0.9-0.9 1.9 0.1z",
    dominican:"M585.7 386l0.3-1.8-1.3-1.9 1.5-1.1 0.7-2.5-0.1-3.4 0.8-1.1 4.3 0 3.2 1.6 1.5-0.1 0.7 2.3 3.1-0.2-0.4 1.9 2.5 0.3 2.5 2.3-2.3 2.6-2.6-1.4-2.6 0.3-1.8-0.3-1.1 1.2-2.2 0.4-0.7-1.6-1.9 0.9-2.7 4.4-1.3-1-0.1-1.8z",
    honduras:"M519.6 405.5l-1.9-0.1-0.9 0.9-2 0.8-1.4 0-1.3 0.8-1.1-0.2-0.9-1-0.6 0.2-0.9 1.5-0.5-0.1-0.2 1.4-2.1 1.7-1.2 0.8-0.6 0.8-1.5-1.3-1.4 1.7-1.2 0-1.3 0.1-0.2 3.2-0.8 0-0.8 1.5-1.8 0.3-0.8-2-1.7-0.6 0.7-2.6-0.7-0.7-1.2-0.4-2.5 0.7-0.1-0.8-1.6-1.1-1.1-1.2-1.6-0.6 1.3-1.6-0.3-1.3 0.5-1.2 2.9-1.8 2.8-2.5 0.6 0.3 1.3-1.1 1.6-0.1 0.5 0.5 0.9-0.3 2.6 0.6 2.6-0.2 1.8-0.7 0.8-0.7 1.7 0.3 1.3 0.4 1.5-0.1 1.2-0.6 2.5 0.9 0.8 0.2 1.6 1.2 1.5 1.4 1.9 1 1.3 1.7z",
    ecuador:"M559 502.8l0.8 4.9-1.7 4.1-6.1 6.8-6.7 2.5-3.4 5.6-0.9 4.3-3.1 2.7-2.5-3.3-2.3-0.7-2.3 0.5-0.3-2.3 1.6-1.5-0.7-2.7 2.9-4.8-1.3-2.8-2.1 3-3.5-2.9 1.1-1.8-1-5.8 2-1 1-4 2.1-4.1-0.3-2.6 3.1-1.4 3.9-2.5 5.6 3.6 1.1-0.1 1.4 2.8 4.8 0.9 1.6-1 2.8 2.1 2.4 1.5z",
    cameroon:"M1072.8 454.2l-2.8 6.5-1.4 1.1-0.4 5 0.6 2.7-0.5 1.9 2.7 3.4 0.5 2.3 2.1 3.3 2.6 2.1 0.3 2.9 0.6 1.9-0.4 3.4-4.5-1.5-4.6-1.7-7.1-0.2-0.7-0.4-3.4 0.8-3.4-0.8-2.7 0.4-9.3-0.1 0.9-5.1-2.3-4.3-2.6-1-1.1-2.9-1.5-0.9 0.1-1.8 1.4-4.6 2.7-6.2 1.6 0 3.4-3.8 2.1-0.1 3.2 2.7 3.9-2.2 0.5-2.7 1.3-2.6 0.8-3.2 3-2.6 1.1-4.5 1.2-1.5 0.8-3.3 1.4-4.1 4.7-5 0.3-2.1 0.6-1.2-2.3-2.5 0.2-2.1 1.5-0.3 2.3 4.1 0.5 4.2-0.2 4.3 3.2 5.8-3.2 0-1.6 0.4-2.6-0.6-1.2 3 3.4 3.8 2.5 1.1 0.8 2.6 1.8 4.4-0.8 1.8z",
    brazil:"M665.8 489.6l3.1 0.6 0.6-1.4-1-1.2 0.6-1.9 2.3 0.6 2.7-0.7 3.2 1.4 2.5 1.3 1.7-1.7 1.3 0.2 0.8 1.8 2.7-0.4 2.2-2.5 1.8-4.7 3.4-5.9 2-0.3 1.3 3.6 3 11.2 3.1 1.1 0.1 4.4-4.3 5.3 1.7 1.9 10.1 1 0.2 6.5 4.3-4.2 7.1 2.3 9.5 3.9 2.8 3.7-0.9 3.6 6.6-2 11 3.4 8.5-0.2 8.4 5.3 7.4 7.2 4.4 1.8 4.8 0.3 2.1 2 2 8.2 1.1 3.9-2.1 10.6-2.7 4.2-7.7 8.9-3.4 7.3-4 5.5-1.4 0.2-1.3 4.7 0.9 12-1.1 9.9-0.3 4.2-1.6 2.6-0.5 8.6-5.2 8.3-0.5 6.7-4.3 2.7-1.1 3.9-6 0-8.5 2.4-3.7 2.9-6 1.9-6.1 5.1-4.1 6.4-0.3 4.8 1.3 3.5-0.3 6.5-0.8 3.1-3.4 3.6-4.5 11.3-4 5-3.2 3.1-1.5 6.1-2.9 3.6-2.1-3.6 1.8-3.1-3.8-4.3-4.8-3.6-6.3-4.1-1.9 0.2-6.3-5-3.4 0.7 6-8.7 5.3-6.3 3.3-2.6 4.2-3.5-0.4-5.1-3.2-3.8-2.6 1.3 0.7-3.7 0.3-3.8-0.3-3.6-2.1-1.1-2 1-2.1-0.3-0.8-2.4-1.1-5.9-1.2-1.9-3.9-1.8-2.2 1.3-5.9-1.3-0.4-8.7-2-3.5 1.6-1.4-0.8-3.6 1.3-2.8 0.6-5.1-1.7-4-3.2-1.8-0.8-2.5 0.5-3.7-10.7-0.3-2.8-7.5 1.7-0.1-0.3-2.7-1.2-1.9-0.5-3.7-3.4-1.9-3.5 0-2.5-1.8-3.9-1.3-2.3-2.4-6.4-1.1-6.5-5.7 0.3-4.3-0.9-2.5 0.4-4.8-7.3 1.1-2.9 2.4-4.8 2.6-1.1 1.9-2.9 0.2-4.2-0.6-3.2 1.1-2.6-0.7-0.1-9.7-4.4 3.7-5-0.1-2.3-3.5-3.8-0.3 1-2.8-3.3-3.9-2.6-5.8 1.5-1.1-0.2-2.8 3.4-1.8-0.7-3.5 1.4-2.2 0.3-3 6.3-4.4 4.6-1.2 0.8-1 5.1 0.3 2.2-17.6 0.1-2.8-0.9-3.6-2.6-2.4 0.1-4.7 3.2-1 1.1 0.7 0.2-2.5-3.3-0.7 0-4 11 0.2 1.9-2.3 1.6 2.1 1 3.8 1.1-0.8 3.1 3.4 4.4-0.4 1.1-2 4.2-1.5 2.4-1.1 0.7-2.7 4.1-1.8-0.3-1.4-4.8-0.5-0.7-4.1 0.3-4.3-2.5-1.6 1.1-0.6 4.1 0.8 4.5 1.6 1.7-1.5 4.1-1 6.4-2.4 2.1-2.5-0.7-1.8 3-0.2 1.2 1.4-0.8 2.9 2 0.9 1.2 3-1.6 2.3-1 5.4 1.4 3.3 0.3 3 3.5 3 2.8 0.3 0.6-1.3 1.8-0.3 2.6-1.1 1.8-1.7 3.2 0.6 1.3-0.3z",
  };

  return (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:17,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>Tobacco Growing Regions</div>
        <div style={{fontSize:13,color:T.textSecondary,fontFamily:"Georgia,serif",marginTop:3,fontStyle:"italic"}}>Tap a highlighted region to explore</div>
      </div>

      <div style={{background:"#1a3048",borderRadius:16,border:"1px solid rgba(196,154,40,0.2)",overflow:"hidden",marginBottom:16}}>
        <svg viewBox="0 0 2000 857" style={{width:"100%",height:"auto",display:"block"}}>
          {/* Base world map */}
          {basePaths.map((d,i)=>(
            <path key={i} d={d} fill="#2e4d6a" stroke="#1a3048" strokeWidth="0.5"/>
          ))}
          {/* Tobacco regions */}
          {TOBACCO_REGIONS.map(r=>{
            const d=tobaccoPaths[r.id];
            if(!d) return null;
            const isSel=selected?.id===r.id;
            return (
              <g key={r.id} onClick={()=>setSelected(isSel?null:r)} style={{cursor:"pointer"}}>
                <path d={d}
                  fill={isSel?r.color:`${r.color}66`}
                  stroke={isSel?"#e8c84a":r.color}
                  strokeWidth={isSel?"2.5":"1"}
                  filter={isSel?"drop-shadow(0 0 6px rgba(232,200,74,0.6))":"none"}
                />
              </g>
            );
          })}
          {/* Connecticut marker — state-level, too small for country path */}
          <circle cx="590" cy="270" r="8"
            fill={selected?.id==="connecticut"?"#4a6a9a":"#4a6a9a66"}
            stroke={selected?.id==="connecticut"?"#e8c84a":"#4a6a9a"}
            strokeWidth={selected?.id==="connecticut"?"2.5":"1"}
            onClick={()=>setSelected(selected?.id==="connecticut"?null:TOBACCO_REGIONS.find(r=>r.id==="connecticut")!)}
            style={{cursor:"pointer"}}
          />
          <text x="604" y="274" fontSize="18" fill="rgba(232,200,74,0.7)" fontFamily="Georgia,serif" style={{pointerEvents:"none"}}>CT</text>
        </svg>
      </div>

      {/* Region info panel */}
      {selected ? (
        <div style={{background:"linear-gradient(160deg,#1a1206,#0f0a02)",
          borderRadius:14,border:`1px solid ${selected.color}44`,overflow:"hidden",marginBottom:16}}>
          <div style={{height:3,background:`linear-gradient(90deg,${selected.color},${T.goldMid})`}}/>
          <div style={{padding:"16px 18px"}}>
            <div style={{fontSize:10,color:selected.color,letterSpacing:4,textTransform:"uppercase",fontFamily:"Georgia,serif",marginBottom:4}}>Tobacco Region</div>
            <div style={{fontSize:22,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:10}}>{selected.name}</div>
            <div style={{fontSize:13,color:T.textSecondary,fontFamily:"Georgia,serif",fontStyle:"italic",lineHeight:1.7,marginBottom:14}}>{selected.flavor}</div>
            {selected.wrappers[0]&&(
              <div style={{marginBottom:12}}>
                <div style={{fontSize:9,color:T.textMuted,letterSpacing:3,textTransform:"uppercase",marginBottom:6}}>Notable Leaf</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {selected.wrappers.filter(w=>w).map(w=>(
                    <span key={w} style={{fontSize:11,color:selected.color,background:`${selected.color}12`,
                      border:`1px solid ${selected.color}33`,borderRadius:20,padding:"3px 10px"}}>{w}</span>
                  ))}
                </div>
              </div>
            )}
            <div style={{fontSize:9,color:T.textMuted,letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>Famous Cigars</div>
            {selected.famous.map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <div style={{width:4,height:4,borderRadius:"50%",background:selected.color,flexShrink:0}}/>
                <span style={{fontSize:13,color:T.textPrimary,fontFamily:"Georgia,serif"}}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      ):(
        <div style={{textAlign:"center",padding:"20px",color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:13}}>
          Tap a highlighted country to explore its tobacco character
        </div>
      )}

      {/* Quick region pills */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",paddingBottom:16}}>
        {TOBACCO_REGIONS.map(r=>(
          <button key={r.id} onClick={()=>setSelected(selected?.id===r.id?null:r)}
            style={{padding:"6px 12px",borderRadius:20,cursor:"pointer",fontFamily:"Georgia,serif",fontSize:11,
              background:selected?.id===r.id?`${r.color}22`:"transparent",
              border:`1px solid ${selected?.id===r.id?r.color:"rgba(196,154,40,0.2)"}`,
              color:selected?.id===r.id?r.color:T.textMuted}}>
            {r.name}
          </button>
        ))}
      </div>
    </div>
  );
}
const TRENDING=[
  {title:"Tonight's Smoke",sub:"What are you lighting up this evening?",comments:31,views:3200,time:"2m ago",hot:true},
  {title:"Cigar Reviews",sub:"Recent ratings and tasting notes from the lounge.",comments:28,views:2800,time:"8m ago",hot:true},
  {title:"Humidor Setups",sub:"Show us your cedar configurations.",comments:18,views:1800,time:"15m ago",hot:false},
  {title:"Bourbon Pairings",sub:"Your go-to spirit alongside a fine smoke.",comments:14,views:1500,time:"42m ago",hot:false},
  {title:"New Releases",sub:"What just arrived at your local shop?",comments:11,views:1200,time:"1h ago",hot:false},
  {title:"Aging & Resting",sub:"How long do you rest your sticks?",comments:9,views:900,time:"2h ago",hot:false},
];
const CAT_COLORS:Record<string,string>={"Review":"#7a1212","Pairing":"#1a5c35","Question":"#8B6914","Storage":"#1a2c50"};

const RARE_FINDS=[
  {id:1,user:"CigarDon_85",avatar:"C",badge:"Top Reviewer",time:"1h ago",
    cigar:"Cohiba Behike BHK 56",year:"2014",origin:"Cuba",
    rarity:"Limited Edition",
    story:"Found 5 of these at an estate sale in Miami. Previous owner was a diplomat. Still in original cedar box, bands pristine. Pulled one last night — it was transcendent.",
    tags:["Cuban","Aged 10yr","Estate Find"],likes:34,wants:18,liked:false,wanted:false},
  {id:2,user:"HumidorQueen",avatar:"H",badge:"Pairing Pro",time:"3h ago",
    cigar:"Padrón Family Reserve No. 85",year:"2009",origin:"Nicaragua",
    rarity:"Aged",
    story:"Rested these for 15 years. The chocolate and leather notes have deepened into something I've never experienced in a modern stick. Only 3 left in my humidor.",
    tags:["Nicaragua","Aged 15yr","Natural Wrapper"],likes:41,wants:27,liked:false,wanted:false},
  {id:3,user:"SlowBurn_Mike",avatar:"S",badge:"",time:"6h ago",
    cigar:"Arturo Fuente Opus X BBMF",year:"2018",origin:"Dominican Republic",
    rarity:"Regional",
    story:"My tobacconist got an allocation of 12 and held one back for me. One of the rarest Fuente vitolas produced. Waiting for the right moment.",
    tags:["Dominican","Regional Exclusive","Fuente"],likes:22,wants:31,liked:false,wanted:false},
];

// ── CLUB BOTTOM NAV ICONS (top-level so ContextBar can use them) ───────────
const IconTrending=({c}:{c:string})=>(
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconDiscussions=({c}:{c:string})=>(
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconNews=({c}:{c:string})=>(
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
    <line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/>
  </svg>
);
const IconSpotlight=({c}:{c:string})=>(
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M12 12v9"/><path d="M8.5 20.5h7"/>
    <path d="M6 8H2M22 8h-4"/>
  </svg>
);
const IconShowcase=({c}:{c:string})=>(
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="17"/><line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/>
  </svg>
);
const IconEvents=({c}:{c:string})=>(
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <path d="M9 16l2 2 4-4"/>
  </svg>
);
const IconEducation=({c}:{c:string})=>(
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const CLUB_NAV_ICONS=[
  {Icon:IconTrending,label:'Trending',tab:'trending'},
  {Icon:IconDiscussions,label:'Discuss',tab:'feed'},
  {Icon:IconNews,label:'News',tab:'news'},
  {Icon:IconSpotlight,label:'Spotlights',tab:'spotlights'},
  {Icon:IconShowcase,label:'Showcase',tab:'showcase'},
  {Icon:IconEvents,label:'Events',tab:'events'},
  {Icon:IconEducation,label:'Learn',tab:'learn'},
];

function CommunityTab({activeSubTab,setActiveSubTab}:{
  activeSubTab:'feed'|'news'|'trending'|'rareFinds'|'spotlights'|'showcase'|'events'|'learn';
  setActiveSubTab:(t:'feed'|'news'|'trending'|'rareFinds'|'spotlights'|'showcase'|'events'|'learn')=>void;
}) {
  const [posts,setPosts]=useState(POSTS_INIT);
  const [newPost,setNewPost]=useState('');
  const [postCategory,setPostCategory]=useState('Review');
  const [showCompose,setShowCompose]=useState(false);
  const [liveNews,setLiveNews]=useState<any[]>([]);
  const [newsLoading,setNewsLoading]=useState(false);
  const [videos,setVideos]=useState<any[]>([]);
  const [videosLoading,setVideosLoading]=useState(false);
  const [podcastGroups,setPodcastGroups]=useState<any[]>([]);
  const [podcastsLoading,setPodcastsLoading]=useState(false);
  const [newsSubTab,setNewsSubTab]=useState<'youtube'|'articles'|'podcasts'>('youtube');
  const [filter,setFilter]=useState<'all'|'following'|'mine'>('all');
  const [lastFetched,setLastFetched]=useState<{news:number;videos:number;podcasts:number}>({news:0,videos:0,podcasts:0});
  const CACHE_TTL=30*60*1000; // 30 minutes

  const fetchNews=()=>{
    setNewsLoading(true);
    fetch('/api/news')
      .then(r=>r.json())
      .then(d=>{if(d.ok&&d.articles?.length>0){setLiveNews(d.articles);setLastFetched(p=>({...p,news:Date.now()}));}})
      .catch(()=>{})
      .finally(()=>setNewsLoading(false));
  };
  const fetchVideos=()=>{
    setVideosLoading(true);
    fetch('/api/youtube')
      .then(r=>r.json())
      .then(d=>{if(d.ok&&d.videos?.length>0){setVideos(d.videos);setLastFetched(p=>({...p,videos:Date.now()}));}})
      .catch(()=>{})
      .finally(()=>setVideosLoading(false));
  };
  const fetchPodcasts=()=>{
    setPodcastsLoading(true);
    fetch('/api/podcasts')
      .then(r=>r.json())
      .then(d=>{if(d.ok&&d.grouped?.length>0){setPodcastGroups(d.grouped);setLastFetched(p=>({...p,podcasts:Date.now()}));}})
      .catch(()=>{})
      .finally(()=>setPodcastsLoading(false));
  };
  const refreshAll=()=>{fetchNews();fetchVideos();fetchPodcasts();};

  useEffect(()=>{
    if(activeSubTab==='news'){
      const now=Date.now();
      if(liveNews.length===0||now-lastFetched.news>CACHE_TTL) fetchNews();
      if(videos.length===0||now-lastFetched.videos>CACHE_TTL) fetchVideos();
      if(podcastGroups.length===0||now-lastFetched.podcasts>CACHE_TTL) fetchPodcasts();
    }
  },[activeSubTab]);

  const submitPost=()=>{
    if(!newPost.trim()) return;
    setPosts([{id:Date.now(),user:'You',avatar:'Y',badge:'Member',category:postCategory,time:'Just now',
      title:'',body:newPost,likes:0,comments:0,liked:false},...posts]);
    setNewPost('');
    setShowCompose(false);
  };

  const fi={width:'100%',padding:'10px 14px',background:'rgba(0,0,0,0.3)',
    border:`1px solid ${T.border}`,borderRadius:8,color:T.textPrimary,
    fontSize:13,outline:'none',boxSizing:'border-box' as const,fontFamily:'Georgia,serif'};

  return (
    <div style={{paddingBottom:100}}>

      {/* ── CLUB SUB-TABS (inline, all 7 fit on one row) ── */}
      <div style={{borderBottom:`1px solid rgba(160,120,40,0.28)`,
        backgroundImage:"url('/leather-nav.png')",
        backgroundSize:"cover",backgroundPosition:"center top",
        boxShadow:"0 2px 12px rgba(0,0,0,0.5)"}}>
        <div style={{display:'flex',padding:'8px 6px',gap:3}}
          onTouchStart={e=>e.stopPropagation()}
          onTouchEnd={e=>e.stopPropagation()}>
          {CLUB_NAV_ICONS.map((item)=>{
            const active=activeSubTab===item.tab;
            const c=active?T.goldMid:'rgba(160,120,40,0.5)';
            return (
              <button key={item.tab} onClick={()=>setActiveSubTab(item.tab as any)}
                style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3,
                  padding:'6px 2px',
                  background:active?'rgba(196,154,40,0.18)':'rgba(0,0,0,0.2)',
                  border:`1px solid ${active?T.borderGold:'rgba(160,120,40,0.15)'}`,
                  borderRadius:8,cursor:'pointer',transition:'all 0.18s',minWidth:0}}>
                <item.Icon c={c}/>
                <span style={{fontSize:8,color:active?T.goldMid:T.textMuted,
                  fontFamily:'Georgia,serif',whiteSpace:'nowrap',letterSpacing:0.2,
                  overflow:'hidden',textOverflow:'ellipsis',maxWidth:'100%',
                  display:'block',textAlign:'center'}}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── HERO BANNER ─────────────────────────────── */}
      <div style={{
        margin:'0 0 0',
        position:'relative',overflow:'hidden',
        borderBottom:`1px solid rgba(196,154,40,0.2)`,
        minHeight:200,
      }}>
        {/* Background image */}
        <img src="/club-hero.jpg" alt="Mario's Social Club"
          style={{position:'absolute',inset:0,width:'100%',height:'100%',
            objectFit:'cover',objectPosition:'center 40%',opacity:1}}/>
        {/* Dark overlay gradient */}
        <div style={{position:'absolute',inset:0,
          background:'linear-gradient(160deg,rgba(10,5,0,0.1) 0%,rgba(10,5,0,0.05) 50%,rgba(10,5,0,0.2) 100%)'}}/>
        {/* Gold top line */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:2,
          background:`linear-gradient(90deg,transparent,${T.goldMid},transparent)`}}/>
        {/* Content */}
        <div style={{position:'relative',zIndex:1,padding:'24px 20px 20px',minHeight:160,display:'flex',flexDirection:'column'}}>
          <div>
            <div style={{fontSize:10,color:T.goldMid,letterSpacing:5,textTransform:'uppercase',
              fontFamily:'Georgia,serif',marginBottom:8}}>Members Only</div>
            <div style={{fontSize:26,fontWeight:'bold',color:'#ffffff',
              fontFamily:'Georgia,serif',lineHeight:1.1,marginBottom:6,
              textShadow:'0 2px 8px rgba(0,0,0,0.8)'}}>
              Mario's Social Club
            </div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.75)',fontFamily:'Georgia,serif',
              fontStyle:'italic',lineHeight:1.6,
              textShadow:'0 1px 4px rgba(0,0,0,0.8)'}}>
              A place for cigar enthusiasts to connect, share, learn, and celebrate the lifestyle.
            </div>
          </div>

        </div>
      </div>

      {/* ── CONTENT PILLS — always visible ── */}
      <div style={{display:'flex',alignItems:'center',padding:'8px 10px 0',
        borderBottom:`1px solid rgba(196,154,40,0.1)`}}>
        {/* YouTube pill */}
        <button onClick={()=>{setActiveSubTab('news' as any);setNewsSubTab('youtube');}}
          style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'8px 4px',
            borderRadius:24,cursor:'pointer',fontFamily:'Georgia,serif',fontSize:12,
            marginBottom:10,fontWeight:(activeSubTab==='news'&&newsSubTab==='youtube')?'bold':'normal',
            background:(activeSubTab==='news'&&newsSubTab==='youtube')?`linear-gradient(135deg,${T.goldDark},${T.goldMid})`:'transparent',
            border:(activeSubTab==='news'&&newsSubTab==='youtube')?'none':`1px solid rgba(196,154,40,0.25)`,
            color:(activeSubTab==='news'&&newsSubTab==='youtube')?'#0a0a0a':T.textMuted}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={(activeSubTab==='news'&&newsSubTab==='youtube')?'#0a0a0a':T.goldMid} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="3"/>
            <polygon points="10,8 16,12 10,16" fill={(activeSubTab==='news'&&newsSubTab==='youtube')?'#0a0a0a':T.goldMid} stroke="none"/>
          </svg>
          YouTube
        </button>
        {/* Podcasts pill */}
        <button onClick={()=>{setActiveSubTab('news' as any);setNewsSubTab('podcasts');}}
          style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'8px 4px',
            borderRadius:24,cursor:'pointer',fontFamily:'Georgia,serif',fontSize:12,
            marginBottom:10,fontWeight:(activeSubTab==='news'&&newsSubTab==='podcasts')?'bold':'normal',
            background:(activeSubTab==='news'&&newsSubTab==='podcasts')?`linear-gradient(135deg,${T.goldDark},${T.goldMid})`:'transparent',
            border:(activeSubTab==='news'&&newsSubTab==='podcasts')?'none':`1px solid rgba(196,154,40,0.25)`,
            color:(activeSubTab==='news'&&newsSubTab==='podcasts')?'#0a0a0a':T.textMuted}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={(activeSubTab==='news'&&newsSubTab==='podcasts')?'#0a0a0a':T.goldMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="11" r="4"/>
            <path d="M12 1a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill={(activeSubTab==='news'&&newsSubTab==='podcasts')?'#0a0a0a':'none'} stroke={(activeSubTab==='news'&&newsSubTab==='podcasts')?'#0a0a0a':T.goldMid}/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          Podcasts
        </button>
        {/* News pill */}
        <button onClick={()=>{setActiveSubTab('news' as any);setNewsSubTab('articles');}}
          style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'8px 4px',
            borderRadius:24,cursor:'pointer',fontFamily:'Georgia,serif',fontSize:12,
            marginBottom:10,fontWeight:(activeSubTab==='news'&&newsSubTab==='articles')?'bold':'normal',
            background:(activeSubTab==='news'&&newsSubTab==='articles')?`linear-gradient(135deg,${T.goldDark},${T.goldMid})`:'transparent',
            border:(activeSubTab==='news'&&newsSubTab==='articles')?'none':`1px solid rgba(196,154,40,0.25)`,
            color:(activeSubTab==='news'&&newsSubTab==='articles')?'#0a0a0a':T.textMuted}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={(activeSubTab==='news'&&newsSubTab==='articles')?'#0a0a0a':T.goldMid} strokeWidth="2" strokeLinecap="round">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
            <line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/>
          </svg>
          News
        </button>
        {/* REFRESH button */}
        <button onClick={refreshAll}
          style={{display:'flex',alignItems:'center',justifyContent:'center',
            width:32,height:32,flexShrink:0,borderRadius:'50%',cursor:'pointer',
            background:'transparent',border:`1px solid rgba(196,154,40,0.25)`,
            marginBottom:10}}
          title="Refresh feeds">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.goldMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
        {/* NEW POST pill */}
        <button onClick={()=>setShowCompose(true)}
          style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'8px 4px',
            marginBottom:10,
            borderRadius:24,cursor:'pointer',fontFamily:'Georgia,serif',fontSize:12,fontWeight:'bold',
            background:showCompose?`linear-gradient(135deg,${T.goldDark},${T.goldMid})`:'transparent',
            border:showCompose?'none':`1px solid rgba(196,154,40,0.25)`,
            color:showCompose?'#0a0a0a':T.textMuted,letterSpacing:0.3}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={showCompose?'#0a0a0a':T.goldMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          New Post
        </button>
      </div>

      {/* ── COMPOSE MODAL ───────────────────────────── */}
      {showCompose&&(
        <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.85)',
          display:'flex',alignItems:'flex-end'}}>
          <div style={{width:'100%',maxWidth:480,margin:'0 auto',
            background:'#111111',borderRadius:'20px 20px 0 0',
            border:`1px solid rgba(196,154,40,0.3)`,padding:'20px 20px 40px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif'}}>New Post</div>
              <button onClick={()=>setShowCompose(false)}
                style={{background:'none',border:'none',color:T.textMuted,fontSize:22,cursor:'pointer'}}>×</button>
            </div>
            {/* Category */}
            <div style={{display:'flex',gap:8,marginBottom:12,overflowX:'auto'}}>
              {['Review','Pairing','Question','Storage','Discussion'].map(cat=>(
                <button key={cat} onClick={()=>setPostCategory(cat)}
                  style={{flexShrink:0,padding:'5px 12px',borderRadius:20,cursor:'pointer',
                    fontSize:11,fontFamily:'Georgia,serif',
                    background:postCategory===cat?`${CAT_COLORS[cat]||T.goldDark}22`:'transparent',
                    border:`1px solid ${postCategory===cat?CAT_COLORS[cat]||T.goldDark:T.border}`,
                    color:postCategory===cat?CAT_COLORS[cat]||T.goldMid:T.textMuted}}>
                  {cat}
                </button>
              ))}
            </div>
            <textarea value={newPost} onChange={e=>setNewPost(e.target.value)}
              placeholder="What are you smoking today? Share your experience..."
              rows={4}
              style={{...fi,resize:'none',lineHeight:1.7,marginBottom:12}}/>
            <div style={{display:'flex',gap:10}}>
              <button onClick={submitPost}
                style={{flex:1,padding:'12px',background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                  border:'none',borderRadius:12,color:'#0a0a0a',fontSize:14,
                  fontWeight:'bold',cursor:'pointer',fontFamily:'Georgia,serif'}}>
                Post to Club
              </button>
              <button onClick={()=>setShowCompose(false)}
                style={{padding:'12px 16px',background:'transparent',
                  border:`1px solid ${T.border}`,borderRadius:12,
                  color:T.textMuted,fontSize:13,cursor:'pointer'}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FEED ────────────────────────────────────── */}
      {activeSubTab==='feed'&&(
        <div>
          {/* Filter pills */}
          <div style={{display:'flex',gap:8,padding:'12px 16px 4px'}}>
            {([['all','All Activity'],['following','Following'],['mine','My Posts']] as [typeof filter,string][]).map(([id,label])=>(
              <button key={id} onClick={()=>setFilter(id)}
                style={{padding:'6px 14px',borderRadius:20,cursor:'pointer',
                  fontFamily:'Georgia,serif',fontSize:12,
                  background:filter===id?'rgba(196,154,40,0.15)':'transparent',
                  border:`1px solid ${filter===id?T.borderGold:T.border}`,
                  color:filter===id?T.goldMid:T.textMuted}}>
                {label}
              </button>
            ))}
            <div style={{marginLeft:'auto',display:'flex',alignItems:'center'}}>
              <span style={{fontSize:11,color:T.textMuted,fontFamily:'Georgia,serif'}}>Sort: Latest</span>
            </div>
          </div>
          {/* Posts */}
          <div style={{padding:'8px 16px 0'}}>
            {posts.map(post=>(
              <div key={post.id} style={{
                background:'linear-gradient(170deg,#1a1a1a 0%,#111111 60%,#0d0d0d 100%)',
                borderRadius:14,border:`1px solid rgba(196,154,40,0.18)`,
                marginBottom:10,overflow:'hidden',
                boxShadow:'0 4px 16px rgba(0,0,0,0.4)'}}>
                <div style={{padding:'14px 16px 0',display:'flex',gap:12}}>
                  <div style={{width:42,height:42,borderRadius:'50%',flexShrink:0,
                    background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:16,fontWeight:'bold',color:'#0a0a0a',fontFamily:'Georgia,serif'}}>
                    {post.avatar}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5,flexWrap:'wrap'}}>
                      <span style={{fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',fontSize:15}}>{post.user}</span>
                      {post.badge&&<span style={{fontSize:9,color:T.goldMid,background:'rgba(196,154,40,0.12)',
                        padding:'3px 9px',borderRadius:20,letterSpacing:1,border:`1px solid rgba(196,154,40,0.2)`}}>{post.badge}</span>}
                      <span style={{fontSize:11,color:T.textMuted,marginLeft:'auto'}}>{post.time}</span>
                    </div>
                    <span style={{fontSize:10,color:CAT_COLORS[post.category]||T.goldDark,
                      background:`${CAT_COLORS[post.category]||T.goldDark}18`,
                      padding:'3px 10px',borderRadius:12,letterSpacing:1,
                      border:`1px solid ${CAT_COLORS[post.category]||T.goldDark}33`}}>{post.category}</span>
                    {post.title&&<div style={{fontSize:16,fontWeight:'bold',color:T.textPrimary,
                      fontFamily:'Georgia,serif',marginTop:10,marginBottom:4,lineHeight:1.3}}>{post.title}</div>}
                    <div style={{fontSize:14,color:T.textSecondary,fontFamily:'Georgia,serif',
                      lineHeight:1.7,marginTop:8,marginBottom:12}}>{post.body}</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:20,padding:'10px 16px 12px',
                  borderTop:`1px solid rgba(196,154,40,0.08)`}}>
                  <button onClick={()=>setPosts(posts.map(p=>p.id===post.id?{...p,likes:p.liked?p.likes-1:p.likes+1,liked:!p.liked}:p))}
                    style={{background:'none',border:'none',cursor:'pointer',
                      color:post.liked?T.goldLight:T.textMuted,
                      fontFamily:'Georgia,serif',fontSize:14,display:'flex',alignItems:'center',gap:6}}>
                    {post.liked?'♥':'♡'} {post.likes}
                  </button>
                  <span style={{color:T.textMuted,fontSize:14,display:'flex',alignItems:'center',gap:6}}>
                    💬 {post.comments} replies
                  </span>
                  <span style={{marginLeft:'auto',color:T.textMuted,fontSize:14,cursor:'pointer'}}>🔖</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── NEWS ────────────────────────────────────── */}
      {activeSubTab==='news'&&(
        <div style={{padding:16,display:'flex',flexDirection:'column',gap:12}}>
          {/* YOUTUBE */}
          {newsSubTab==='youtube'&&(
            <>
              {videosLoading&&(
                <div style={{textAlign:'center',padding:40,color:T.textMuted,fontFamily:'Georgia,serif'}}>
                  <div style={{display:'flex',gap:7,justifyContent:'center',marginBottom:12}}>
                    {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:T.goldDark,animation:`sp 1.4s ease-in-out ${i*0.28}s infinite`}}/>)}
                  </div>
                  Loading videos...
                </div>
              )}
              {!videosLoading&&videos.length===0&&(
                <div style={{textAlign:'center',padding:40,color:T.textMuted,fontFamily:'Georgia,serif',fontStyle:'italic'}}>
                  No videos loaded yet
                </div>
              )}
              {videos.map(v=>(
                <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
                  style={{textDecoration:'none',display:'block',
                    background:'linear-gradient(170deg,#1a1a1a,#0d0d0d)',
                    borderRadius:16,border:`1px solid rgba(196,154,40,0.18)`,
                    overflow:'hidden',cursor:'pointer'}}>
                  {/* Full-width thumbnail */}
                  <div style={{width:'100%',height:190,overflow:'hidden',position:'relative'}}>
                    {v.thumbnail&&<img src={v.thumbnail} alt={v.title}
                      style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                      onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>}
                    {/* Dark gradient overlay */}
                    <div style={{position:'absolute',inset:0,
                      background:'linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.65) 100%)'}}/>
                    {/* Channel label bottom-left */}
                    <div style={{position:'absolute',bottom:12,left:14,
                      fontSize:11,color:'rgba(255,255,255,0.95)',letterSpacing:2.5,
                      textTransform:'uppercase',fontFamily:'Georgia,serif',fontWeight:'bold'}}>{v.channel}</div>
                    {/* Play button center */}
                    <div style={{position:'absolute',top:'50%',left:'50%',
                      transform:'translate(-50%,-50%)',
                      width:44,height:44,borderRadius:'50%',background:'rgba(255,0,0,0.88)',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      boxShadow:'0 2px 12px rgba(0,0,0,0.5)'}}>
                      <svg width="14" height="14" viewBox="0 0 10 10" fill="white">
                        <path d="M3 2l5 3-5 3V2z"/>
                      </svg>
                    </div>
                  </div>
                  {/* Red accent line */}
                  <div style={{height:3,background:'#ff4444'}}/>
                  {/* Content */}
                  <div style={{padding:'14px 16px 16px'}}>
                    <div style={{fontSize:11,color:T.textMuted,marginBottom:8,textAlign:'right'}}>{v.publishedAt}</div>
                    <div style={{fontSize:17,fontWeight:'bold',color:T.textPrimary,
                      fontFamily:'Georgia,serif',lineHeight:1.3,marginBottom:6}}>
                      {v.title}
                    </div>
                    <div style={{marginTop:12,display:'flex',justifyContent:'flex-start'}}>
                      <span style={{background:'none',border:'1px solid rgba(255,68,68,0.4)',borderRadius:20,
                        padding:'7px 18px',fontSize:12,color:'#ff6666',
                        fontFamily:'Georgia,serif',letterSpacing:0.5}}>
                        Watch on YouTube →
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </>
          )}

          {/* ARTICLES */}
          {newsSubTab==='articles'&&(
            <>
              {newsLoading&&(
                <div style={{textAlign:'center',padding:40,color:T.textMuted,fontFamily:'Georgia,serif'}}>
                  <div style={{display:'flex',gap:7,justifyContent:'center',marginBottom:12}}>
                    {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:T.goldDark,animation:`sp 1.4s ease-in-out ${i*0.28}s infinite`}}/>)}
                  </div>
                  Loading latest news...
                </div>
              )}
              {!newsLoading&&(()=>{
                const articles=liveNews;
                if(articles.length===0) return (
                  <div style={{textAlign:'center',padding:'40px 20px',color:T.textMuted,fontFamily:'Georgia,serif'}}>
                    <div style={{fontSize:13,marginBottom:8}}>No articles loaded</div>
                    <div style={{fontSize:11,fontStyle:'italic',marginBottom:16}}>Tap ↻ to refresh</div>
                  </div>
                );
                // Group by source
                const bySource:Record<string,any[]>={};
                articles.forEach((n:any)=>{
                  const src=n.source||'News';
                  if(!bySource[src]) bySource[src]=[];
                  bySource[src].push(n);
                });
                const sources=Object.keys(bySource);
                if(sources.length<=1){
                  // Single source or flat list — render as-is
                  return articles.map((n:any)=><NewsCard key={n.id||n.title} n={n}/>);
                }
                // Multiple sources — show source headers
                return sources.map(src=>(
                  <div key={src} style={{marginBottom:24}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                      <div style={{width:6,height:6,borderRadius:'50%',background:T.goldMid,flexShrink:0,
                        boxShadow:`0 0 8px ${T.goldMid}`}}/>
                      <div style={{fontSize:10,color:T.goldMid,letterSpacing:3,
                        textTransform:'uppercase',fontFamily:'Georgia,serif',fontWeight:'bold'}}>{src}</div>
                      <div style={{flex:1,height:1,background:`linear-gradient(90deg,${T.goldDark}44,transparent)`}}/>
                    </div>
                    {bySource[src].map((n:any)=><div key={n.id||n.title} style={{marginBottom:12}}><NewsCard n={n}/></div>)}
                  </div>
                ));
              })()}
            </>
          )}

          {/* PODCASTS */}
          {newsSubTab==='podcasts'&&(
            <>
              {podcastsLoading&&(
                <div style={{textAlign:'center',padding:40,color:T.textMuted,fontFamily:'Georgia,serif'}}>
                  <div style={{display:'flex',gap:7,justifyContent:'center',marginBottom:12}}>
                    {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:T.goldDark,animation:`sp 1.4s ease-in-out ${i*0.28}s infinite`}}/>)}
                  </div>
                  Loading podcast episodes...
                </div>
              )}
              {!podcastsLoading&&podcastGroups.length===0&&(
                <div style={{textAlign:'center',padding:40,color:T.textMuted,fontFamily:'Georgia,serif',fontStyle:'italic'}}>
                  No episodes loaded
                </div>
              )}
              {!podcastsLoading&&podcastGroups.map((group:any)=>(
                <div key={group.channel} style={{marginBottom:20}}>
                  {/* Channel header */}
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:group.accent,flexShrink:0,
                      boxShadow:`0 0 8px ${group.accent}`}}/>
                    <div style={{fontSize:10,color:group.accent,letterSpacing:3,
                      textTransform:'uppercase',fontFamily:'Georgia,serif',fontWeight:'bold'}}>{group.channel}</div>
                    <div style={{flex:1,height:1,background:`linear-gradient(90deg,${group.accent}44,transparent)`}}/>
                  </div>
                  {/* Videos */}
                  {group.videos.length===0?(
                    <div style={{fontSize:12,color:T.textMuted,fontFamily:'Georgia,serif',fontStyle:'italic',paddingLeft:16}}>No recent episodes</div>
                  ):group.videos.map((v:any)=>(
                    <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
                      style={{textDecoration:'none',display:'block',marginBottom:10,
                        background:'linear-gradient(170deg,#1a1a1a,#0d0d0d)',
                        borderRadius:16,border:`1px solid rgba(196,154,40,0.18)`,
                        overflow:'hidden',cursor:'pointer'}}>
                      {/* Full-width thumbnail */}
                      <div style={{width:'100%',height:190,overflow:'hidden',position:'relative'}}>
                        {v.thumbnail?(
                          <img src={v.thumbnail} alt={v.title}
                            style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                            onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>
                        ):(
                          <div style={{width:'100%',height:'100%',
                            background:`linear-gradient(135deg,${group.accent}22,#0a0a0a)`,
                            display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                              stroke={group.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="11" r="4"/>
                              <path d="M12 1a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                              <line x1="12" y1="19" x2="12" y2="23"/>
                              <line x1="8" y1="23" x2="16" y2="23"/>
                            </svg>
                          </div>
                        )}
                        <div style={{position:'absolute',inset:0,
                          background:'linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.65) 100%)'}}/>
                        <div style={{position:'absolute',bottom:12,left:14,
                          fontSize:11,color:'rgba(255,255,255,0.95)',letterSpacing:2.5,
                          textTransform:'uppercase',fontFamily:'Georgia,serif',fontWeight:'bold'}}>{group.channel}</div>
                        {/* Play button */}
                        <div style={{position:'absolute',top:'50%',left:'50%',
                          transform:'translate(-50%,-50%)',
                          width:44,height:44,borderRadius:'50%',
                          background:`${group.accent}dd`,
                          display:'flex',alignItems:'center',justifyContent:'center',
                          boxShadow:'0 2px 12px rgba(0,0,0,0.5)'}}>
                          <svg width="14" height="14" viewBox="0 0 10 10" fill="#0a0a0a">
                            <polygon points="3,2 8,5 3,8"/>
                          </svg>
                        </div>
                      </div>
                      {/* Accent line in channel color */}
                      <div style={{height:3,background:group.accent}}/>
                      {/* Content */}
                      <div style={{padding:'14px 16px 16px'}}>
                        <div style={{fontSize:11,color:T.textMuted,marginBottom:8,textAlign:'right'}}>{v.publishedAt}</div>
                        <div style={{fontSize:17,fontWeight:'bold',color:T.textPrimary,
                          fontFamily:'Georgia,serif',lineHeight:1.3,marginBottom:6}}>
                          {v.title}
                        </div>
                        <div style={{marginTop:12}}>
                          <span style={{background:'none',border:`1px solid ${group.accent}44`,borderRadius:20,
                            padding:'7px 18px',fontSize:12,color:group.accent,
                            fontFamily:'Georgia,serif',letterSpacing:0.5}}>
                            Listen Now →
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── TRENDING ─────────────────────────────────── */}
      {activeSubTab==='trending'&&(
        <div style={{padding:'16px 16px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div>
              <div style={{fontSize:17,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',lineHeight:1.2}}>Trending Now</div>
              <div style={{fontSize:13,color:T.textSecondary,fontFamily:'Georgia,serif',marginTop:3}}>What the community is talking about</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(196,154,40,0.1)',
              border:`1px solid rgba(196,154,40,0.3)`,borderRadius:20,padding:'5px 12px'}}>
              <span style={{fontSize:11}}>🔥</span>
              <span style={{fontSize:10,color:T.goldMid,letterSpacing:2,fontFamily:'Georgia,serif',fontWeight:'bold'}}>LIVE</span>
            </div>
          </div>
          {TRENDING.map((t,i)=>(
            <div key={i} style={{
              background:'linear-gradient(170deg,#1a1a1a,#0d0d0d)',
              borderRadius:14,border:`1px solid ${t.hot?'rgba(196,154,40,0.3)':'rgba(196,154,40,0.12)'}`,
              marginBottom:10,overflow:'hidden',cursor:'pointer',
              boxShadow:t.hot?'0 4px 20px rgba(196,154,40,0.08)':'none'}}>
              <div style={{display:'flex',alignItems:'center',gap:14,padding:'16px'}}>
                <div style={{width:44,height:44,borderRadius:10,flexShrink:0,
                  background:i===0?`linear-gradient(135deg,${T.goldDark},${T.goldMid})`:
                             i===1?'linear-gradient(135deg,#888,#aaa)':
                             i===2?'linear-gradient(135deg,#8B6914,#c49a28)':
                             'linear-gradient(135deg,#1a1a1a,#2a2a2a)',
                  border:i>2?`1px solid rgba(196,154,40,0.2)`:'none',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color:i<3?'#0a0a0a':T.goldDark,
                  fontWeight:'bold',fontFamily:'Georgia,serif',fontSize:18}}>
                  {i+1}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                    {t.hot&&<span style={{fontSize:12}}>🔥</span>}
                    <div style={{fontSize:16,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',lineHeight:1.2}}>{t.title}</div>
                  </div>
                  <div style={{fontSize:12,color:T.textSecondary,fontFamily:'Georgia,serif',fontStyle:'italic',marginBottom:8,lineHeight:1.4}}>{t.sub}</div>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:12,color:T.goldMid}}>💬 {t.comments}</span>
                    <span style={{fontSize:12,color:T.textMuted}}>👁 {(t.views/1000).toFixed(1)}K</span>
                    <span style={{fontSize:11,color:T.textMuted,fontFamily:'Georgia,serif',marginLeft:'auto'}}>{t.time}</span>
                  </div>
                </div>
                <span style={{color:T.goldMid,fontSize:20,flexShrink:0}}>›</span>
              </div>
              <div style={{height:2,background:`linear-gradient(90deg,${T.goldDark},${T.goldMid}${Math.round((t.comments/31)*255).toString(16).padStart(2,'0')},transparent)`}}/>
            </div>
          ))}
        </div>
      )}

      {/* ── SPOTLIGHTS ───────────────────────────────── */}
      {activeSubTab==='spotlights'&&(
        <div style={{padding:'16px 16px 0'}}>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:17,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif'}}>Member Spotlights</div>
            <div style={{fontSize:13,color:T.textSecondary,fontFamily:'Georgia,serif',marginTop:3}}>Featured collectors this week</div>
          </div>
          {[
            {name:'CigarDon_85',badge:'Top Reviewer',avatar:'C',cigars:247,notes:89,joined:'Jan 2023',
              fav:'Cohiba Behike BHK 56',bio:'Obsessed with Cuban aged tobacco and Nicaraguan blends. 20+ years in the hobby.'},
            {name:'HumidorQueen',badge:'Pairing Pro',avatar:'H',cigars:183,notes:64,joined:'Mar 2022',
              fav:'Padrón Family Reserve No. 85',bio:'Sommelier by day, cigar enthusiast by night. Pairing is an art form.'},
            {name:'SlowBurn_Mike',badge:'Rare Finder',avatar:'S',cigars:312,notes:121,joined:'Jun 2021',
              fav:'Arturo Fuente Opus X BBMF',bio:'Estate sale hunter and limited edition tracker. If it\'s rare, I\'ve smoked it.'},
          ].map(m=>(
            <div key={m.name} style={{background:'linear-gradient(170deg,#1a1a1a,#0d0d0d)',
              borderRadius:14,border:`1px solid rgba(196,154,40,0.22)`,marginBottom:14,overflow:'hidden'}}>
              <div style={{height:2,background:`linear-gradient(90deg,${T.goldDark},${T.goldMid})`}}/>
              <div style={{padding:'16px 16px'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  <div style={{width:48,height:48,borderRadius:'50%',flexShrink:0,
                    background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:20,fontWeight:'bold',color:'#0a0a0a',fontFamily:'Georgia,serif'}}>
                    {m.avatar}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',fontSize:15}}>{m.name}</span>
                      <span style={{fontSize:9,color:T.goldMid,background:'rgba(196,154,40,0.12)',
                        padding:'2px 8px',borderRadius:20,border:`1px solid rgba(196,154,40,0.2)`}}>{m.badge}</span>
                    </div>
                    <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>Member since {m.joined}</div>
                  </div>
                </div>
                <div style={{fontSize:13,color:T.textSecondary,fontFamily:'Georgia,serif',fontStyle:'italic',
                  lineHeight:1.7,marginBottom:12}}>{m.bio}</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,
                  paddingTop:12,borderTop:`1px solid rgba(196,154,40,0.1)`}}>
                  {[['Cigars',m.cigars],['Reviews',m.notes],['Joined',m.joined.split(' ')[1]]].map(([k,v])=>(
                    <div key={k} style={{textAlign:'center'}}>
                      <div style={{fontSize:18,fontWeight:'bold',color:T.goldMid,fontFamily:'Georgia,serif'}}>{v}</div>
                      <div style={{fontSize:9,color:T.textMuted,textTransform:'uppercase',letterSpacing:1.5}}>{k}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SHOWCASE ─────────────────────────────────── */}
      {activeSubTab==='showcase'&&(
        <div style={{padding:'16px 16px 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:16}}>
            <div>
              <div style={{fontSize:17,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif'}}>Collector's Showcase</div>
              <div style={{fontSize:13,color:T.textSecondary,fontFamily:'Georgia,serif',marginTop:3}}>Members' rarest and finest</div>
            </div>
            <button style={{background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
              border:'none',borderRadius:20,padding:'7px 14px',color:'#0a0a0a',
              fontSize:11,fontFamily:'Georgia,serif',fontWeight:'bold',cursor:'pointer'}}>
              + Pin a Cigar
            </button>
          </div>
          {[
            {user:'CigarDon_85',avatar:'C',badge:'Top Reviewer',cigar:'Cohiba Behike BHK 56',
              year:'2014',origin:'Cuba',note:'Found 5 at an estate sale in Miami. Previous owner was a diplomat. Transcendent.',
              rarity:'Ultra Rare',likes:34,wants:18},
            {user:'HumidorQueen',avatar:'H',badge:'Pairing Pro',cigar:'Padrón Family Reserve No. 85',
              year:'2009',origin:'Nicaragua',note:'Rested 15 years. Chocolate and leather notes have deepened into something extraordinary.',
              rarity:'Aged 15yr',likes:41,wants:27},
            {user:'SlowBurn_Mike',avatar:'S',badge:'',cigar:'Arturo Fuente Opus X BBMF',
              year:'2018',origin:'Dominican Republic',note:'My tobacconist got an allocation of 12 and held one back for me. Waiting for the right moment.',
              rarity:'Regional',likes:22,wants:31},
          ].map((r,i)=>(
            <div key={i} style={{background:'linear-gradient(170deg,#1a1a1a,#0d0d0d)',
              borderRadius:14,border:`1px solid rgba(196,154,40,0.22)`,marginBottom:14,overflow:'hidden'}}>
              <div style={{background:`linear-gradient(90deg,${T.goldDark}22,transparent)`,
                padding:'10px 16px',borderBottom:`1px solid rgba(196,154,40,0.1)`,
                display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,borderRadius:'50%',flexShrink:0,
                  background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:13,fontWeight:'bold',color:'#0a0a0a'}}>{r.avatar}</div>
                <div style={{flex:1}}>
                  <span style={{color:T.textPrimary,fontFamily:'Georgia,serif',fontSize:13,fontWeight:'bold'}}>{r.user}</span>
                  {r.badge&&<span style={{fontSize:9,color:T.goldMid,background:'rgba(196,154,40,0.12)',
                    padding:'2px 8px',borderRadius:20,marginLeft:8,border:`1px solid rgba(196,154,40,0.2)`}}>{r.badge}</span>}
                </div>
                <span style={{fontSize:10,color:T.goldMid,background:`${T.goldDark}18`,
                  border:`1px solid ${T.goldDark}33`,borderRadius:20,padding:'3px 10px',letterSpacing:1}}>{r.rarity}</span>
              </div>
              <div style={{padding:'14px 16px'}}>
                <div style={{fontSize:16,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',marginBottom:3}}>{r.cigar}</div>
                <div style={{fontSize:11,color:T.goldMid,marginBottom:10}}>{r.year} · {r.origin}</div>
                <div style={{fontSize:13,color:T.textSecondary,fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:1.7,marginBottom:12}}>{r.note}</div>
                <div style={{display:'flex',gap:16,paddingTop:10,borderTop:`1px solid rgba(196,154,40,0.08)`}}>
                  <span style={{fontSize:13,color:T.textMuted}}>♡ {r.likes}</span>
                  <span style={{fontSize:13,color:T.goldMid}}>⭐ {r.wants} want this</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── EVENTS ───────────────────────────────────── */}
      {activeSubTab==='events'&&(
        <div style={{padding:'16px 16px 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:16}}>
            <div>
              <div style={{fontSize:17,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif'}}>Upcoming Events</div>
              <div style={{fontSize:13,color:T.textSecondary,fontFamily:'Georgia,serif',marginTop:3}}>Tastings, lounges & meetups</div>
            </div>
            <button style={{background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
              border:'none',borderRadius:20,padding:'7px 14px',color:'#0a0a0a',
              fontSize:11,fontFamily:'Georgia,serif',fontWeight:'bold',cursor:'pointer'}}>
              + Post Event
            </button>
          </div>
          {[
            {id:1,title:'Grand Havana Night',host:'CigarDon_85',date:'Jun 14, 2026',time:'7:00 PM',
              location:'Los Angeles, CA',desc:'Cuban cigar pairing evening featuring pre-revolution Cohibas and aged rums. Limited to 20 guests.',
              attending:12,cap:20,type:'Tasting'},
            {id:2,title:'IPCPR Preview Night',host:'HumidorQueen',date:'Jun 21, 2026',time:'6:30 PM',
              location:'Las Vegas, NV',desc:'Preview of new releases from Padrón, My Father, and Crowned Heads ahead of the trade show.',
              attending:8,cap:15,type:'Preview'},
            {id:3,title:'Lake Tahoe Smoke & Hike',host:'SlowBurn_Mike',date:'Jul 4, 2026',time:'10:00 AM',
              location:'South Lake Tahoe, CA',desc:'Morning hike followed by a sunset smoke session. Bring your favorite outdoor cigar.',
              attending:6,cap:12,type:'Meetup'},
          ].map(e=>(
            <div key={e.id} style={{background:'linear-gradient(170deg,#1a1a1a,#0d0d0d)',
              borderRadius:14,border:`1px solid rgba(196,154,40,0.22)`,marginBottom:14,overflow:'hidden'}}>
              <div style={{height:3,background:`linear-gradient(90deg,${T.goldDark},${T.goldMid})`}}/>
              <div style={{padding:'14px 16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div style={{flex:1,paddingRight:12}}>
                    <div style={{fontSize:16,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',marginBottom:4}}>{e.title}</div>
                    <div style={{fontSize:11,color:T.textMuted}}>Hosted by {e.host}</div>
                  </div>
                  <span style={{fontSize:10,color:T.goldMid,background:`${T.goldDark}18`,
                    border:`1px solid ${T.goldDark}33`,borderRadius:20,padding:'3px 10px',
                    letterSpacing:1,flexShrink:0}}>{e.type}</span>
                </div>
                <div style={{display:'flex',gap:16,marginBottom:10}}>
                  <div style={{fontSize:12,color:T.textSecondary}}>📅 {e.date} · {e.time}</div>
                </div>
                <div style={{fontSize:12,color:T.textSecondary,marginBottom:10}}>📍 {e.location}</div>
                <div style={{fontSize:13,color:T.textSecondary,fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:1.7,marginBottom:12}}>{e.desc}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                  paddingTop:10,borderTop:`1px solid rgba(196,154,40,0.08)`}}>
                  <div style={{fontSize:12,color:T.textMuted}}>{e.attending}/{e.cap} attending</div>
                  <button style={{background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                    border:'none',borderRadius:20,padding:'7px 18px',color:'#0a0a0a',
                    fontSize:12,fontFamily:'Georgia,serif',fontWeight:'bold',cursor:'pointer'}}>
                    RSVP
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LEARN — Interactive Tobacco Map ──────────── */}
      {activeSubTab==='learn'&&<TobaccoMap/>}

      {/* ── RARE FINDS ───────────────────────────────── */}
      {activeSubTab==='rareFinds'&&(
        <div style={{padding:'16px 16px 0'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div>
              <div style={{fontSize:17,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',lineHeight:1.2}}>Rare Finds</div>
              <div style={{fontSize:13,color:T.textSecondary,fontFamily:'Georgia,serif',marginTop:3}}>Members sharing exceptional cigars</div>
            </div>
            <button style={{background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
              border:'none',borderRadius:20,padding:'7px 14px',
              color:'#0a0a0a',fontSize:11,fontFamily:'Georgia,serif',
              letterSpacing:1,fontWeight:'bold',cursor:'pointer'}}>+ Post Find</button>
          </div>
          {RARE_FINDS.map(r=>(
            <div key={r.id} style={{
              background:'linear-gradient(170deg,#1a1a1a 0%,#111111 60%,#0d0d0d 100%)',
              borderRadius:14,border:`1px solid rgba(196,154,40,0.22)`,
              marginBottom:14,overflow:'hidden',
              boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>
              <div style={{padding:'14px 16px 0',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:38,height:38,borderRadius:'50%',flexShrink:0,
                  background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:14,fontWeight:'bold',color:'#0a0a0a',fontFamily:'Georgia,serif'}}>
                  {r.avatar}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',fontSize:14}}>{r.user}</span>
                    {r.badge&&<span style={{fontSize:9,color:T.goldMid,background:'rgba(196,154,40,0.12)',
                      padding:'2px 8px',borderRadius:20,letterSpacing:1,border:`1px solid rgba(196,154,40,0.2)`}}>{r.badge}</span>}
                  </div>
                  <div style={{fontSize:11,color:T.textMuted}}>{r.time}</div>
                </div>
              </div>
              <div style={{padding:'12px 16px 14px'}}>
                <div style={{fontSize:16,fontWeight:'bold',color:T.textPrimary,fontFamily:'Georgia,serif',marginBottom:4}}>{r.cigar}</div>
                <div style={{fontSize:11,color:T.goldMid,letterSpacing:1,marginBottom:8}}>{r.rarity} · {r.year} · {r.origin}</div>
                <div style={{fontSize:13,color:T.textSecondary,fontFamily:'Georgia,serif',fontStyle:'italic',lineHeight:1.7,marginBottom:12}}>{r.story}</div>
                <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap' as const}}>
                  {r.tags.map((tag:string)=>(
                    <span key={tag} style={{fontSize:10,color:T.textMuted,background:'rgba(255,255,255,0.04)',
                      border:`1px solid ${T.border}`,borderRadius:20,padding:'3px 10px'}}>{tag}</span>
                  ))}
                </div>
                <div style={{display:'flex',gap:16,paddingTop:10,borderTop:`1px solid rgba(196,154,40,0.08)`}}>
                  <span style={{fontSize:13,color:T.textMuted}}>♡ {r.likes}</span>
                  <span style={{fontSize:13,color:T.textMuted}}>⭐ {r.wants} want this</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TastingNotesTab() {
  const [notes,setNotes]=useState(NOTES_INIT);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({brand:"",line:"",vitola:"",rating:5,notes:"",pairing:""});
  const [sel,setSel]=useState<number|null>(null);
  const {t}=useLang();
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
    <div style={{padding:"0 0 32px"}}>
      <div style={{padding:"24px 20px 20px",borderBottom:`1px solid ${T.border}`,
        display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div style={{fontSize:10,letterSpacing:5,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif",marginBottom:6}}>{t("tasting_journal")}</div>
          <div style={{fontSize:22,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>{t("collectors_journal")}</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,border:"none",
            borderRadius:20,padding:"8px 18px",color:"#1a0e04",fontSize:12,
            fontFamily:"Georgia,serif",fontWeight:"bold",cursor:"pointer"}}>
{t("log_entry")}
        </button>
      </div>

      {showForm && (
        <div style={{margin:"16px 16px 0",background:T.card,borderRadius:14,border:`1px solid ${T.borderGold}`,padding:"18px 16px"}}>
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
            <button onClick={save} style={{flex:1,padding:"11px",background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,border:"none",borderRadius:8,color:"#1a0e04",fontSize:13,fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>Save Entry</button>
            <button onClick={()=>setShowForm(false)} style={{padding:"11px 16px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.textMuted,fontSize:13,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{padding:"16px 16px 0"}}>
        {notes.map(n=>(
          <div key={n.id} onClick={()=>setSel(sel===n.id?null:n.id)}
            style={{marginBottom:16,cursor:"pointer",
              borderRadius:12,overflow:"hidden",
              boxShadow:"0 2px 12px rgba(0,0,0,0.35)",
              border:`1px solid ${sel===n.id?"#b8966a":"#c8a97a"}`}}>
            <div style={{
              background:"#faf8f0",position:"relative",
              padding:"14px 16px 14px 52px",
              backgroundImage:"linear-gradient(#faf8f0 0px, #faf8f0 23px, #b8d4e8 23px, #b8d4e8 24px)",
              backgroundSize:"100% 24px",
            }}>
              <div style={{position:"absolute",left:40,top:0,bottom:0,width:1.5,background:"rgba(210,60,60,0.55)"}}/>
              <div style={{position:"absolute",left:10,top:0,bottom:0,display:"flex",flexDirection:"column",justifyContent:"space-around",paddingTop:8,paddingBottom:8}}>
                {[0,1,2].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:"#e8e0d0",border:"1.5px solid #c8b898",boxShadow:"inset 0 1px 2px rgba(0,0,0,0.15)"}}/>)}
              </div>
              <div style={{fontSize:9,color:"#8B6914",letterSpacing:3,textTransform:"uppercase",marginBottom:6,fontFamily:"Georgia,serif",lineHeight:"24px"}}>{n.date}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1,paddingRight:12}}>
                  <div style={{fontSize:9,color:"#7a5030",letterSpacing:3,textTransform:"uppercase",fontFamily:"Georgia,serif",lineHeight:"24px"}}>{n.brand}</div>
                  <div style={{fontSize:19,fontWeight:"bold",color:"#1a0a02",fontFamily:"Georgia,serif",lineHeight:"24px"}}>{n.line}</div>
                  <div style={{fontSize:12,color:"#6a4020",fontFamily:"Georgia,serif",lineHeight:"24px"}}>{n.vitola}</div>
                </div>
                <div style={{display:"flex",gap:1,flexShrink:0,paddingTop:4}}>
                  {[1,2,3,4,5].map(i=><span key={i} style={{fontSize:15,color:i<=n.rating?"#C49A28":"rgba(139,105,20,0.18)",lineHeight:1}}>★</span>)}
                </div>
              </div>
            </div>
            {sel===n.id&&(
              <div style={{
                background:"#faf8f0",borderTop:"1px solid #c8a97a",
                padding:"12px 16px 16px 52px",position:"relative",
                backgroundImage:"linear-gradient(#faf8f0 0px, #faf8f0 23px, #b8d4e8 23px, #b8d4e8 24px)",
                backgroundSize:"100% 24px",
              }}>
                <div style={{position:"absolute",left:40,top:0,bottom:0,width:1.5,background:"rgba(210,60,60,0.55)"}}/>
                <div style={{fontSize:13,color:"#2a1608",fontFamily:"'Palatino Linotype',Palatino,Georgia,serif",
                  fontStyle:"italic",lineHeight:"24px",marginBottom:12}}>{n.notes}</div>
                {n.pairing&&(
                  <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(139,105,20,0.08)",
                    borderRadius:8,padding:"8px 12px",border:"1px solid rgba(139,105,20,0.2)"}}>
                    <span>🥃</span>
                    <span style={{fontSize:12,color:"#6a4010",fontFamily:"Georgia,serif",fontStyle:"italic"}}>{t("paired_with")} {n.pairing}</span>
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

// ── SETTINGS ───────────────────────────────────────────────────────────────
function SettingsTab() {
  const [tempUnit,setTempUnit]=useState("F");
  const [notifs,setNotifs]=useState(true);
  const [apiKeySaved,setApiKeySaved]=useState(false);
  const [apiKeyInput,setApiKeyInput]=useState("");
  const {t,lang,setLang}=useLang();
  const Toggle=({val,set}:{val:boolean,set:(v:boolean)=>void})=>(
    <div onClick={()=>set(!val)} style={{width:44,height:26,borderRadius:13,cursor:"pointer",
      background:val?T.goldMid:"rgba(255,255,255,0.07)",position:"relative",transition:"background 0.2s",flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:val?22:3,width:20,height:20,borderRadius:"50%",
        background:val?"#1a0e04":"rgba(255,255,255,0.25)",transition:"left 0.2s"}}/>
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
        <div style={{fontSize:14,color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:sub?2:0}}>{label}</div>
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
          right={<div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${T.goldDark},${T.goldMid})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:"bold",color:"#1a0e04",fontFamily:"Georgia,serif"}}>M</div>}/>
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
                <span style={{fontSize:14,color:lang===l.code?T.goldLight:T.textPrimary,fontFamily:"Georgia,serif",flex:1}}>{l.name}</span>
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
                    color:tempUnit===u?"#1a0e04":T.textMuted,fontSize:12,fontFamily:"Georgia,serif"}}>
                  °{u}
                </button>
              ))}
            </div>
          } last/>
      </Group>

      {/* API */}
      <Group title={t("api_s")}>
        <div style={{padding:"16px"}}>
          <div style={{fontSize:14,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",marginBottom:4}}>{t("api_key_title")}</div>
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
                  border:"none",borderRadius:8,color:"#1a0e04",fontSize:13,fontWeight:"bold",cursor:"pointer",fontFamily:"Georgia,serif"}}>
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

// ── NEWS SCREEN ────────────────────────────────────────────────────────────
function NewsTab() {
  return (
    <div style={{padding:"0 0 32px"}}>
      <div style={{padding:"24px 20px 18px"}}>
        <div style={{fontSize:10,letterSpacing:5,textTransform:"uppercase",color:T.textMuted,fontFamily:"Georgia,serif"}}>Cigar News</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,padding:"0 16px"}}>
        {NEWS.map(n=>(
          <div key={n.id} style={{background:T.card,borderRadius:16,border:`1px solid ${T.border}`,overflow:"hidden"}}>
            <div style={{height:3,background:n.accent}}/>
            <div style={{padding:"18px 18px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{fontSize:10,color:n.accent,letterSpacing:2,textTransform:"uppercase",fontFamily:"Georgia,serif"}}>{n.source}</div>
                <div style={{fontSize:10,color:T.textMuted}}>{n.date}</div>
              </div>
              <div style={{fontSize:19,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif",lineHeight:1.3,marginBottom:10}}>{n.title}</div>
              <div style={{fontSize:14,color:T.textSecondary,lineHeight:1.7,fontFamily:"Georgia,serif"}}>{n.summary}</div>
              <div style={{marginTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <button style={{background:"none",border:`1px solid ${n.accent}44`,borderRadius:20,
                  padding:"5px 14px",fontSize:11,color:n.accent,cursor:"pointer",fontFamily:"Georgia,serif",letterSpacing:0.5}}>
                  Read More
                </button>
                <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",fontStyle:"italic"}}>Mario's Take →</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


const NAV=[
  {id:"home",tk:"nav_home"},
  {id:"collection",tk:"nav_collection"},
  {id:"humidors",tk:"nav_humidors"},
  {id:"mario",tk:"nav_mario"},
  {id:"community",tk:"nav_community"},
  {id:"profile",tk:"nav_profile"},
];

function NavIcon({id,active}:{id:string,active:boolean}) {
  const c=active?T.goldLight:T.goldMid;
  const icons:Record<string,React.ReactNode>={
    humidors:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" suppressHydrationWarning>
        <circle cx="11" cy="11" r="8.5" stroke={c} strokeWidth="1.4" fill="none"/>
        {Array.from({length:9},(_,i)=>{const a=(i*40-200)*Math.PI/180,r1=i%3===0?5.5:6.5,r2=7.8;
          return <line key={i} suppressHydrationWarning x1={11+r1*Math.cos(a)} y1={11+r1*Math.sin(a)} x2={11+r2*Math.cos(a)} y2={11+r2*Math.sin(a)}
            stroke={c} strokeWidth={i%3===0?"1.2":"0.7"} opacity={i%3===0?1:0.5}/>;
        })}
        <line x1="11" y1="11" x2="11" y2="4.8" stroke={active?T.goldLight:T.goldMid} strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="11" cy="11" r="1.4" fill={c}/>
      </svg>
    ),
    home:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 9.5L11 3l8 6.5V19a1 1 0 0 1-1 1H14v-5h-4v5H4a1 1 0 0 1-1-1V9.5z" stroke={c} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
      </svg>
    ),
    profile:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.8" stroke={c} strokeWidth="1.4" fill="none"/>
        <path d="M4 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    collection:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2.5" y="6" width="17" height="13" rx="2" stroke={c} strokeWidth="1.4" fill="none"/>
        <path d="M7.5 6V4.5A3.5 3.5 0 0 1 14.5 4.5V6" stroke={c} strokeWidth="1.4"/>
        <line x1="7" y1="11.5" x2="15" y2="11.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <line x1="7" y1="14.5" x2="12" y2="14.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    mario:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.8" stroke={c} strokeWidth="1.4" fill="none"/>
        <path d="M4 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="11" cy="8" r="1.4" fill={c}/>
      </svg>
    ),
    community:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="8.5" cy="8" r="3" stroke={c} strokeWidth="1.4" fill="none"/>
        <circle cx="15.5" cy="8" r="3" stroke={c} strokeWidth="1.4" fill="none"/>
        <path d="M2 19c0-3.31 2.91-6 6.5-6s6.5 2.69 6.5 6" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M15 13.5c3.2 0 5.8 1.7 5.8 5.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    notes:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M12.5 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6.5-6z" stroke={c} strokeWidth="1.4" fill="none"/>
        <line x1="7" y1="11" x2="15" y2="11" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <line x1="7" y1="14.5" x2="11.5" y2="14.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    news:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="4" width="18" height="14" rx="2" stroke={c} strokeWidth="1.4" fill="none"/>
        <line x1="6" y1="8.5" x2="16" y2="8.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="6" y1="11.5" x2="16" y2="11.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
        <line x1="6" y1="14.5" x2="11" y2="14.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    settings:(
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
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
      backgroundImage:"url('/leather-nav.png')",
      backgroundSize:"cover",backgroundPosition:"center",
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

function ContextBar({tab,activeClubTab,setActiveClubTab,onNewPost}:{
  tab:string;
  activeClubTab:string;
  setActiveClubTab:(t:string)=>void;
  onNewPost?:()=>void;
}) {
  return null;
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
function HomeTab({liveData,liveStatus,lastUpdated,onRefresh}:{
  liveData:Record<string,{temperature:number|null;humidity:number|null;observedAt:string|null}>;
  liveStatus:"idle"|"loading"|"connected"|"error";lastUpdated:string|null;onRefresh:()=>void;
}) {
  const h=new Date().getHours();
  const timeStr=h<12?"Good Morning":h<17?"Good Afternoon":"Good Evening";

  const FEED_ITEMS=[
    {id:1,user:"Mario",avatar:"M",time:"2h ago",streak:17,
      activity:"Smoked",cigar:"Padrón 1964 Exclusivo",vitola:"Robusto · Nicaragua",
      rating:94,review:"Tons of cocoa and espresso. Incredible burn and construction.",
      likes:24,comments:7,image:"/cigar-colorado-robusto.png",accent:T.goldMid},
    {id:2,user:"James",avatar:"J",time:"5h ago",streak:null,
      activity:"Added 12 Cigars",cigar:"My Father Le Bijou 1922",vitola:"Torpedo · Nicaragua",
      rating:null,review:null,humidor:"Humidor Count: 327",
      likes:18,comments:3,image:"/cigar-maduro-robusto.png",accent:"#8B6914"},
    {id:3,user:"Sarah",avatar:"S",time:"8h ago",streak:null,
      activity:"Humidor Stable",cigar:null,vitola:null,rating:null,review:null,
      humidity:69,temp:68,likes:12,comments:2,image:null,accent:"#2a5c38"},
    {id:4,user:"Carlos",avatar:"C",time:"12h ago",streak:9,
      activity:"Smoked",cigar:"Arturo Fuente Opus X",vitola:"Robusto · Dominican Republic",
      rating:96,review:"Perfect draw, incredible complexity. A true masterpiece.",
      likes:31,comments:9,image:"/cigar-colorado-claro-robusto.png",accent:"#7a1212"},
    {id:5,user:"Linda",avatar:"L",time:"1d ago",streak:null,
      activity:"Added Tasting Note",cigar:"Cohiba Behike BHK 54",vitola:"BHK 54 · Cuba",
      rating:97,review:"Creamy cedar and leather with a flawless retrohale. Exceptional.",
      likes:44,comments:11,image:"/cigar-oscuro-robusto.png",accent:"#4a6a9a"},
  ];

  return (
    <div style={{paddingBottom:8}}>
      {/* Header */}
      <div style={{padding:"18px 16px 12px",borderBottom:`1px solid ${T.border}`,
        background:"linear-gradient(180deg,rgba(18,10,2,0.98),rgba(18,10,2,0.92))"}}>
        <div style={{fontSize:9,color:T.textMuted,letterSpacing:4,textTransform:"uppercase",
          fontFamily:"Georgia,serif",marginBottom:4}}>{timeStr}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:24,fontWeight:"bold",color:T.textPrimary,fontFamily:"Georgia,serif"}}>
            Feed
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,
            background:"rgba(196,154,40,0.1)",border:`1px solid rgba(196,154,40,0.25)`,
            borderRadius:20,padding:"5px 12px"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill={T.goldMid}>
              <path d="M12 2C9.243 2 7 4.243 7 7c0 3.866 5 13 5 13s5-9.134 5-13c0-2.757-2.243-5-5-5zm0 8c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/>
            </svg>
            <span style={{fontSize:10,color:T.goldMid,fontFamily:"Georgia,serif",letterSpacing:1}}>
              🔥 17 Day Streak
            </span>
          </div>
        </div>
      </div>

      {/* Feed items */}
      <div style={{display:"flex",flexDirection:"column",gap:1}}>
        {FEED_ITEMS.map((item,idx)=>{
          const heroImg=idx%2===0?"/club-hero.jpg":"/humidor-hero.png";
          return (
          <div key={item.id} style={{
            borderBottom:`1px solid rgba(196,154,40,0.08)`}}>

            {/* Hero image — alternating */}
            <div style={{position:"relative",height:160,overflow:"hidden"}}>
              <img src={heroImg} alt=""
                style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",
                  filter:"brightness(0.55) saturate(0.9)"}}/>
              <div style={{position:"absolute",inset:0,
                background:"linear-gradient(180deg,rgba(18,10,2,0.85) 0%,rgba(0,0,0,0.2) 100%)"}}/>
              {/* User row overlaid on TOP of image */}
              <div style={{position:"absolute",top:12,left:16,right:16,
                display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:38,height:38,borderRadius:"50%",flexShrink:0,
                  background:`linear-gradient(135deg,${item.accent}88,${item.accent})`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:14,fontWeight:"bold",color:"#fff",fontFamily:"Georgia,serif",
                  border:`2px solid rgba(255,255,255,0.2)`}}>
                  {item.avatar}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14,fontWeight:"bold",color:"#fff",fontFamily:"Georgia,serif",
                      textShadow:"0 1px 4px rgba(0,0,0,0.8)"}}>
                      {item.user}
                    </span>
                    {item.streak&&(
                      <span style={{fontSize:9,color:T.goldMid,background:"rgba(0,0,0,0.5)",
                        border:`1px solid rgba(196,154,40,0.4)`,borderRadius:10,
                        padding:"2px 7px",fontFamily:"Georgia,serif",letterSpacing:0.5}}>
                        🔥 {item.streak}d Streak
                      </span>
                    )}
                  </div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.6)",fontFamily:"Georgia,serif",marginTop:1}}>
                    {item.time} · {item.activity}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                  <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </div>
            </div>

            {/* Card content */}
            <div style={{padding:"12px 16px",background:"linear-gradient(170deg,#1a1208,#0f0a04)"}}>

            {/* Cigar info — no thumbnail, text only */}
            {item.cigar&&(
              <div style={{marginBottom:10,padding:"10px 12px",
                background:"rgba(0,0,0,0.3)",borderRadius:10,
                border:`1px solid rgba(196,154,40,0.1)`}}>
                <div style={{fontSize:13,fontWeight:"bold",color:T.textPrimary,
                  fontFamily:"Georgia,serif",marginBottom:2}}>{item.cigar}</div>
                <div style={{fontSize:10,color:T.textMuted,fontFamily:"Georgia,serif",
                  fontStyle:"italic",marginBottom:6}}>{item.vitola}</div>
                {item.rating&&(
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{fontSize:20,fontWeight:"bold",color:T.goldMid,
                      fontFamily:"Georgia,serif",lineHeight:1}}>{item.rating}</div>
                    <div style={{fontSize:9,color:T.textMuted,fontFamily:"Georgia,serif",
                      letterSpacing:1,textTransform:"uppercase"}}>Points</div>
                    <div style={{display:"flex",gap:2,marginLeft:4}}>
                      {[1,2,3,4,5].map(s=>(
                        <svg key={s} width="10" height="10" viewBox="0 0 24 24"
                          fill={s<=Math.round(item.rating!/20)?T.goldMid:"rgba(196,154,40,0.2)"}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Humidor reading card */}
            {item.humidity&&(
              <div style={{display:"flex",gap:10,marginBottom:10}}>
                <div style={{flex:1,background:"rgba(42,92,56,0.15)",border:"1px solid rgba(42,92,56,0.3)",
                  borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:"bold",color:"#4ade80",fontFamily:"Georgia,serif"}}>
                    {item.humidity}%
                  </div>
                  <div style={{fontSize:9,color:T.textMuted,fontFamily:"Georgia,serif",letterSpacing:2,textTransform:"uppercase"}}>RH</div>
                </div>
                <div style={{flex:1,background:"rgba(196,154,40,0.08)",border:`1px solid rgba(196,154,40,0.2)`,
                  borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:"bold",color:T.goldMid,fontFamily:"Georgia,serif"}}>
                    {item.temp}°F
                  </div>
                  <div style={{fontSize:9,color:T.textMuted,fontFamily:"Georgia,serif",letterSpacing:2,textTransform:"uppercase"}}>Temp</div>
                </div>
              </div>
            )}

            {/* Review */}
            {item.review&&(
              <div style={{fontSize:13,color:T.textSecondary,fontFamily:"Georgia,serif",
                fontStyle:"italic",lineHeight:1.6,marginBottom:10,
                borderLeft:`2px solid rgba(196,154,40,0.3)`,paddingLeft:10}}>
                "{item.review}"
              </div>
            )}

            {/* Humidor count badge */}
            {item.humidor&&(
              <div style={{display:"inline-flex",alignItems:"center",gap:6,marginBottom:10,
                background:"rgba(196,154,40,0.08)",border:`1px solid rgba(196,154,40,0.18)`,
                borderRadius:20,padding:"4px 12px"}}>
                <span style={{fontSize:11,color:T.goldMid,fontFamily:"Georgia,serif"}}>🗄 {item.humidor}</span>
              </div>
            )}

            {/* Actions */}
            <div style={{display:"flex",alignItems:"center",gap:16,paddingTop:8,
              borderTop:`1px solid rgba(196,154,40,0.06)`}}>
              <button style={{display:"flex",alignItems:"center",gap:5,background:"none",
                border:"none",cursor:"pointer",padding:0}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(196,154,40,0.4)" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span style={{fontSize:11,color:"rgba(196,154,40,0.4)",fontFamily:"Georgia,serif"}}>{item.likes}</span>
              </button>
              <button style={{display:"flex",alignItems:"center",gap:5,background:"none",
                border:"none",cursor:"pointer",padding:0}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(196,154,40,0.4)" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span style={{fontSize:11,color:"rgba(196,154,40,0.4)",fontFamily:"Georgia,serif"}}>{item.comments}</span>
              </button>
              <button style={{display:"flex",alignItems:"center",gap:5,background:"none",
                border:"none",cursor:"pointer",padding:0}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(196,154,40,0.4)" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </button>
              <div style={{flex:1}}/>
              <button style={{display:"flex",alignItems:"center",gap:5,background:"none",
                border:"none",cursor:"pointer",padding:0}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(196,154,40,0.4)" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>
            </div>{/* end card content */}
          </div>
        );})}
      </div>
    </div>
  );
}

// ── PROFILE TAB ────────────────────────────────────────────────────────────
function ProfileTab() {
  return <SettingsTab/>;
}

// ── MAIN ───────────────────────────────────────────────────────────────────
export default function MariosHumidor() {
  const [tab,setTab]=useState("home");
  const [splash,setSplash]=useState(true);

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

  const [showCompose,setShowCompose]=useState(false);
  const [activeClubTab,setActiveClubTab]=useState<'feed'|'news'|'trending'|'rareFinds'|'spotlights'|'showcase'|'events'|'learn'>('feed');

  const TAB_ORDER=["home","collection","humidors","mario","community","profile"];
  const touchStartX=useRef<number|null>(null);
  const touchStartY=useRef<number|null>(null);
  const [prevTab,setPrevTab]=useState<string|null>(null);
  const [slideDir,setSlideDir]=useState<'left'|'right'|null>(null);
  const [animating,setAnimating]=useState(false);

  const navigateTo=(nextTab:string)=>{
    if(nextTab===tab||animating) return;
    const cur=TAB_ORDER.indexOf(tab);
    const next=TAB_ORDER.indexOf(nextTab);
    const dir=next>cur?'left':'right';
    // Lock scroll position during transition
    const scrollY=window.scrollY;
    document.body.style.overflow='hidden';
    window.scrollTo(0,0);
    setPrevTab(tab);
    setSlideDir(dir);
    setAnimating(true);
    setTab(nextTab);
    setTimeout(()=>{
      setPrevTab(null);
      setSlideDir(null);
      setAnimating(false);
      document.body.style.overflow='';
      window.scrollTo(0,0);
    },300);
  };

  const handleTouchStart=(e:React.TouchEvent)=>{
    touchStartX.current=e.touches[0].clientX;
    touchStartY.current=e.touches[0].clientY;
  };

  const handleTouchEnd=(e:React.TouchEvent)=>{
    if(touchStartX.current===null||touchStartY.current===null) return;
    const dx=e.changedTouches[0].clientX-touchStartX.current;
    const dy=e.changedTouches[0].clientY-touchStartY.current;
    if(Math.abs(dx)<50||Math.abs(dy)>Math.abs(dx)*0.7) return;
    const cur=TAB_ORDER.indexOf(tab);
    if(dx<0&&cur<TAB_ORDER.length-1) navigateTo(TAB_ORDER[cur+1]);
    if(dx>0&&cur>0) navigateTo(TAB_ORDER[cur-1]);
    touchStartX.current=null;
    touchStartY.current=null;
  };

  const renderTab=(t:string)=>{
    switch(t){
      case "home":       return <HomeTab liveData={liveData} liveStatus={liveStatus} lastUpdated={lastUpdated} onRefresh={()=>fetchLive(false)}/>;
      case "collection": return <CollectionTab/>;
      case "mario":      return <AskMarioTab liveData={liveData}/>;
      case "humidors":   return <HumidorsTab liveData={liveData} liveStatus={liveStatus} lastUpdated={lastUpdated} onRefresh={()=>fetchLive(false)}/>;
      case "community":  return <CommunityTab activeSubTab={activeClubTab} setActiveSubTab={setActiveClubTab}/>;
      case "profile":    return <ProfileTab/>;
      default:           return <HomeTab liveData={liveData} liveStatus={liveStatus} lastUpdated={lastUpdated} onRefresh={()=>fetchLive(false)}/>;
    }
  };

  const render=()=>renderTab(tab);
  return (
    <LangProvider>
    <div style={{minHeight:"100vh",background:T.bg,color:T.textPrimary,fontFamily:"Georgia,serif",maxWidth:480,margin:"0 auto",position:"relative"}}>
      <CedarBg/>
      {splash&&<SplashScreen onDone={()=>setSplash(false)}/>}
      <div style={{position:"relative",zIndex:1,paddingBottom:90,overflow:"hidden"}}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}>
        <div style={{position:"sticky",top:0,zIndex:50}}>
          <AppHeader totalCigars={0}/>
        </div>
        {/* Keep all tabs mounted — show/hide with display to avoid remount stutter */}
        <div style={{position:"relative",overflow:"hidden"}}>
          <div style={{
            animation:slideDir?`slideIn${slideDir==='left'?'Right':'Left'} 0.28s cubic-bezier(0.4,0,0.2,1) forwards`:'none',
            willChange:slideDir?"transform":"auto",
            backfaceVisibility:"hidden"}}>
            {TAB_ORDER.map(t=>(
              <div key={t} style={{display:tab===t?"block":"none"}}>
                {renderTab(t)}
              </div>
            ))}
          </div>
        </div>
      </div>
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
        @keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes slideInLeft{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        @keyframes slideOutLeft{from{transform:translateX(0)}to{transform:translateX(-100%)}}
        @keyframes slideOutRight{from{transform:translateX(0)}to{transform:translateX(100%)}}
      `}</style>
    </div>
    </LangProvider>
  );
}