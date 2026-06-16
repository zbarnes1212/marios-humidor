// lib/constants.ts — pure data, no JSX
import { createContext, useContext } from "react";


const T = {
  bg:"#0a0a0a", card:"#111111", cardMid:"#161616",
  border:"rgba(160,120,40,0.14)", borderGold:"rgba(160,120,40,0.38)",
  goldDark:"#8B6914", goldMid:"#C49A28", goldLight:"#e8c84a",
  textPrimary:"#ffffff", textSecondary:"#ffffff", textMuted:"rgba(255,255,255,0.5)", textGold:"#C49A28",
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
    nav_home:"Home",nav_humidors:"Humidors",nav_record:"Record",nav_mario:"Mario",nav_club:"Club",nav_profile:"Profile",
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
    nav_home:"Inicio",nav_humidors:"Humidores",nav_record:"Registro",nav_mario:"Mario",nav_club:"Club",nav_profile:"Perfil",
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
    nav_home:"Início",nav_humidors:"Humidores",nav_record:"Registro",nav_mario:"Mario",nav_club:"Clube",nav_profile:"Perfil",
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
    nav_home:"Accueil",nav_humidors:"Humidors",nav_record:"Journal",nav_mario:"Mario",nav_club:"Club",nav_profile:"Profil",
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
    nav_home:"Start",nav_humidors:"Humidore",nav_record:"Aufzeichnung",nav_mario:"Mario",nav_club:"Club",nav_profile:"Profil",
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

// ── SYNC CONTEXT ──────────────────────────────────────────────────────────
const SyncContext=createContext<{userId:string;getToken:()=>Promise<string|null>}>({
  userId:"",getToken:async()=>null
});
const useSyncContext=()=>useContext(SyncContext);

// ── LANGUAGE CONTEXT ────────────────────────────────────────────────────────
const LangContext=createContext<{lang:LangCode;t:(k:string)=>string;setLang:(l:LangCode)=>void}>({
  lang:"en",t:(k)=>TRANSLATIONS.en[k]??k,setLang:()=>{},
});
function useLang(){return useContext(LangContext);}

// Map vitola + wrapper → placeholder cigar image
// ── MAP PIN RENDERER ───────────────────────────────────────────────────────


function getCigarImage(vitola:string,wrapper:string,image_filename?:string|null):string {
  if(image_filename) return `/cigars/${image_filename}`;
  const v=(vitola||"").toLowerCase();
  const w=(wrapper||"").toLowerCase();
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
// ── HUMIDORS SCREEN ────────────────────────────────────────────────────────


const HUMIDORS:any[]=[];
type CigarEntry={id:number;brand:string;line:string;vitola:string;origin:string;wrapper:string;rating:number;count:number;purchaseDate:string;bandColor:string;humidorId:number|null;customPhoto?:string|null;imageUri?:string|null;image_filename?:string|null};
const CIGARS:any[]=[];

// ── EXPORTS ──────────────────────────────────────────────────────────────────
export {T,r2,polar,LANGS,TRANSLATIONS,NOTES_INIT,HUMIDORS,CIGARS};
export type {LangCode,CigarEntry};
export {getCigarImage};
export {SyncContext,useSyncContext,LangContext,useLang};
