// 1. CONFIGURAZIONE SUPABASE
const SUPABASE_URL = 'https://ydrpicezcwtfwdqpihsb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkcnBpY2V6Y3d0ZndkcXBpaHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTQzMDAsImV4cCI6MjA4MzYzMDMwMH0.c89-gAZ8Pgp5Seq89BYRraTG-qqmP03LUCl1KqG9bOg';

// RENDIAMO SUPABASE GLOBALE
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// INIZIALIZZAZIONE CACHE
window.appCache = {};

const CLOUDINARY_CLOUD_NAME = 'dkg0jfady';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;

// ─────────────────────────────────────────────────────────────────────────────
//  ESCAPE HTML — Protezione XSS
//  Sanitizza stringhe prima di inserirle in innerHTML.
//  Converte i 5 caratteri pericolosi (&<>"') in entità HTML.
// ─────────────────────────────────────────────────────────────────────────────
window.escapeHtml = function(str) {
    if (str == null) return '';
    if (typeof str !== 'string') str = String(str);
    return str
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#39;');
};

window.currentLang = localStorage.getItem('app_lang') || 'it';
window.currentViewName = 'home';

// 3. CONFIGURAZIONE LINGUE
window.AVAILABLE_LANGS = [
    { code: 'it', label: 'IT', flag: '🇮🇹' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
    { code: 'de', label: 'DE', flag: '🇩🇪' },
    { code: 'es', label: 'ES', flag: '🇪🇸' },
    { code: 'zh', label: 'CN', flag: '🇨🇳' }
];

// ==========================================================
// UI-LANGUAGE.JS: DIZIONARIO COMPLETO (Interfaccia + Meteo)
// ==========================================================

const UI_TEXT = {
    it: {
        loading: "Caricamento...", error: "Errore", search_placeholder: "🔍 Cerca ristoranti, vini, sentieri...", no_results: "Nessun risultato.",
        btn_discover: "Scopri", btn_go: "Vai", btn_info: "Info", btn_map: "Mappa", 
        btn_call: "Chiama", btn_close_show: "Chiudi & Mostra", btn_details: "Dettagli",
        label_all: "Tutti", label_all_fem: "Tutte", 
        cat_culture: "CULTURA", cat_sacred: "SACRO", cat_panorama: "PANORAMA", 
        cat_history: "STORIA", cat_gastronomy: "GASTRONOMIA",
        wine_red: "ROSSO", wine_white: "BIANCO", wine_passito: "PASSITO",
        home_title: "Benvenuto", nav_villages: "Home", nav_food: "Cibo", nav_outdoor: "Outdoor", nav_services: "Servizi",
        menu_prod: "Prodotti", menu_rest: "Ristoranti", menu_trail: "Sentieri", menu_beach: "Spiagge", 
        menu_trans: "Trasporti", menu_num: "Numeri Utili", menu_pharm: "Farmacie", menu_map: "Mappe", menu_monu: "Attrazioni",
        menu_wine: "Vini", menu_legal: "Note Legali", 
        label_bus: "Bus Navetta", label_ferry: "Battello", label_train: "Treno",
        footer_rights: "Tutti i diritti riservati.",
        aperitivo_hint_label: "Aperitivo Time",
        aperitivo_hint_desc: "Vedi i posti migliori per l'aperitivo",
        vino_map_hint_label: "Acquista in zona",
        vino_map_hint_desc: "Cantine e enoteche sulla mappa",
        spiaggia_map_hint_label: "Trova sulla mappa",
        spiaggia_map_hint_desc: "Vedi dove sono le spiagge vicino a te",
        attrazione_map_hint_label: "Trova sulla mappa",
        attrazione_map_hint_desc: "Vedi dove si trovano le attrazioni",
        filter_title: "Filtra per", filter_all: "Tutti", show_results: "Mostra Risultati", 
        filter_cat: "Categoria", filter_village: "Borgo",
        wine_type: "Tipologia", wine_grapes: "Uve", wine_pairings: "Abbinamenti", wine_deg: "Gradi",
        label_curiosity: "Curiosità", desc_missing: "Descrizione non disponibile.",
        btn_download_gpx: "Scarica file GPX", gpx_missing: "Traccia GPS non presente",
        map_route_title: "Mappa Percorso", map_zoom_hint: "Usa due dita per zoomare",
        plan_trip: "Pianifica Viaggio", departure: "PARTENZA", arrival: "ARRIVO", 
        date_trip: "DATA VIAGGIO", time_trip: "ORARIO", find_times: "TROVA ORARI",
        next_runs: "CORSE SUCCESSIVE", next_departure: "PROSSIMA PARTENZA",
        select_placeholder: "Seleziona...", select_start: "→ Seleziona Partenza",
        // --- NUOVE CHIAVI BUS/TRAGHETTI ---
        select_arrival_placeholder: "→ Seleziona l'arrivo",
        valid_destinations: "→  Seleziona la stazione di arrivo",
        no_runs_today: "Nessun'altra corsa oggi",
        last_run_day: "Ultima corsa della giornata",
        direction_dir: "Dir.",
        coast: "Costa",
        
        ticket_info_text: "🎟 <strong>Dove acquistare:</strong> Point informativi del Parco o tramite App ufficiale.<br><span class='opacity-75'>Nota: A bordo potrebbe esserci un sovrapprezzo. Per i traghetti, biglietteria al molo.</span>",
        // ----------------------------------
        bus_searching: "Cerco collegamenti...", bus_no_conn: "Nessun collegamento", 
        bus_no_dest: "Nessuna destinazione", bus_not_found: "Nessuna corsa trovata",
        bus_try_change: "Prova a cambiare orario.",
        ferry_no_corniglia: "Corniglia non ha un molo — il traghetto non effettua fermata. Prova da Vernazza o Manarola, i borghi più vicini!",
        ferry_stop_not_served: "Questa fermata non è servita nella data selezionata. Prova a cambiare data o punto di partenza.", 
        badge_holiday: "📅 FESTIVO", badge_weekday: "🏢 FERIALE",
        label_warning: "ATTENZIONE",
        how_to_ticket: "COME ACQUISTARE IL BIGLIETTO",
        show_map: "MOSTRA MAPPA", hide_map: "NASCONDI MAPPA",
        map_hint: "Tocca i segnaposto per impostare Partenza/Arrivo",
        map_title: "Five2Go consigliati",
        map_count_label: "in vista",
        ct_cal_showing: "Calendario fasce per la carta",
        ct_sim_title: "Simulatore Prezzo",
        ct_sim_subtitle: "Scopri quanto costa la tua Cinque Terre Card in base alla data e alla tipologia.",
        ct_sim_step1: "Scegli la durata",
        ct_sim_step2: "Scegli la data di inizio",
        ct_sim_step3: "Chi viaggia?",
        ct_sim_day: "Giorno",
        ct_sim_days: "Giorni",
        ct_sim_tap_hint: "Tocca un giorno nel calendario qui sopra per selezionare la data di inizio.",
        ct_sim_adult: "Adulti (12-69)",
        ct_sim_child: "Ragazzi (4-11)",
        ct_sim_senior: "Over 70",
        ct_sim_family: "Famiglia",
        ct_sim_family_desc: "2 adulti + 1 o più ragazzi (4-11 anni non compiuti). Ogni ragazzo extra viene aggiunto al prezzo base.",
        ct_sim_adults_label: "adulti",
        ct_sim_who: "Tipologia acquirente",
        ct_sim_estimate: "Prezzo Stimato",
        ct_sim_band: "Fascia",
        ct_sim_family_base: "Base famiglia",
        ct_sim_disclaimer: "Prezzi indicativi basati sulle tariffe ufficiali 2026. Il prezzo effettivo può variare — verifica sul sito ufficiale al momento dell'acquisto.",
        ct_sim_today: "Oggi",
        explore_also: "Esplora anche",
        train_cta: "ORARI E BIGLIETTI",
        train_desc: "Il treno è il mezzo più veloce. Corse frequenti ogni 15-20 minuti tra i borghi.",
        avg_times: "Tempi Medi", between_villages: "Tra i Borghi", check_site: "Acquista e controlla gli orari sul sito ufficiale",
        ideal_for: "Ideale per", distance: "Distanza", duration: "Durata", level: "Livello",
        // Aggiungere in UI_TEXT.[ogni lingua]
trail_desc_label: "Descrizione del percorso",
trail_footer_hint: "Ricorda: indossa sempre scarpe adatte e porta acqua con te.",
trail_outdoor_badge: "Outdoor & Trekking",

// Etichette stats card (già parzialmente presenti, ma hardcoded nella modale)
trail_duration_label: "Durata",
trail_length_label: "Lunghezza",
trail_level_label: "Livello",

// Sezione Regole
trail_rules_title: "Regole d'Oro per l'Escursionista",
trail_rules_intro: "Il Parco Nazionale applica regole severe per la sicurezza dei visitatori:",
trail_rule_shoes_label: "🥾 Calzature Obbligatorie",
trail_rule_shoes_text: "È vietato percorrere i sentieri in ciabatte, infradito o scarpe con suola liscia. Sono previste multe salate. Indossa scarpe da trekking o suola scolpita (Vibram).",
trail_rule_weather_label: "⛈️ Allerta Meteo",
trail_rule_weather_text: "In caso di allerta (Gialla, Arancione, Rossa), i sentieri chiudono automaticamente. Non forzare i blocchi.",
trail_rule_water_label: "💧 Acqua e Sole",
trail_rule_water_text: "Porta sempre almeno 1.5L di acqua a persona.",

// Sezione Fonti
trail_sources_title: "🌐 Fonti Ufficiali e Mappe",
trail_sources_intro: "Prima di partire, verifica i sentieri aperti qui:",
trail_source1_label: "Guida Sentieri Parco 5 Terre",
trail_source2_label: "Sito CAI La Spezia",
        // ── Stringhe UI precedentemente hardcoded ──
    
        tech_data: "Dati Tecnici", gps_track: "Traccia GPS",
        elevation_gain: "Dislivello", ascent: "Salita", descent: "Discesa", altitude: "Altitudine",
     
        chart_label: "Grafico", close_label: "Chiudi",
       
    
        // ── Segnalazioni ──
        report_btn: "Segnala", report_title: "Segnala un problema",
        report_closed: "Chiuso / Non esiste più", report_wrong: "Informazione errata",
        report_blocked: "Sentiero bloccato / Inaccessibile", report_other: "Altro",
        report_note_placeholder: "Descrivi brevemente il problema (opzionale)...",
        report_send: "Invia segnalazione", report_thanks: "Grazie per la segnalazione!",
        report_thanks_sub: "Il team verificherà il prima possibile.",
        report_error: "Errore nell'invio. Riprova più tardi.",
        welcome_app_name: "5 Terre Guide", welcome_desc: "La tua guida essenziale per esplorare le Cinque Terre.",
        weather_sunny: "Sereno", weather_cloudy: "Nuvoloso", weather_fog: "Foschia", 
        weather_rain: "Pioggia", weather_storm: "Temporale", weather_snow: "Neve",
        sea_calm: "Calmo", sea_rough: "Mosso", sea_agitated: "Agitato!",
        label_humidity: "Umidità", label_sea: "Mare",
        chicco_welcome: "Piacere, sono Chicco! Sono il tuo assistente locale. Cliccami quando vuoi per meteo preciso, orari treni e consigli segreti!",
        chicco_bubble_welcome: "Benvenuto! Sono Chicco, la tua guida. Toccami per info al volo! ✨",
        chicco_bubble_morning: "Buongiorno! Toccami per il meteo di oggi ☀️",
        chicco_bubble_afternoon: "Eccoti qui! Serve una dritta? Toccami 🍷",
        chicco_bubble_evening: "Buonasera! Toccami per i piani di stasera 🌅",
        ptr_pull: "Tira per aggiornare",
        ptr_release: "Rilascia per aggiornare",
        ptr_loading: "Aggiornamento...",
        trivia_1: "Lo sapevi? Lo Sciacchetrà è un vino dolce e prezioso, prodotto con uve passite al sole.",
        trivia_2: "Sai perché il vino qui è eroico? Perché coltiviamo l'uva su pendenze impossibili!",
        trivia_3: "I limoni delle Cinque Terre sono enormi e profumatissimi. Hai provato i prodotti locali?",
        trivia_4: "Pesto Genovese: Basilico, pinoli, aglio, parmigiano, pecorino, olio e sale.",
        trivia_5: "La Torta Monterossina è un dolce segreto con cioccolato, marmellata e crema. Una bomba!",
        trivia_6: "Hai mai visto il trenino tra le vigne? Spesso è l'unico modo per trasportare l'uva da lassù.",
        trivia_7: "A Monterosso c'è un Gigante di pietra alto 14 metri che sorregge una terrazza sul mare.",
        trivia_8: "Corniglia è l'unico borgo che non tocca il mare. Per arrivarci ci sono 382 gradini o il bus!",
        trivia_9: "Se mettessimo in fila tutti i muretti a secco delle Cinque Terre, supereremmo la Muraglia Cinese!",
        trivia_10: "Le Cinque Terre sono Patrimonio UNESCO dal 1997. Trattale con cura!",
        trivia_11: "Eugenio Montale, premio Nobel, passava le estati qui e dedicò poesie a Monterosso.",
        trivia_12: "Il film Disney 'Luca' è ispirato proprio ai borghi delle Cinque Terre. 'Silenzio Bruno!'",
        trivia_13: "Manarola ospita il Presepe Luminoso più grande del mondo, ma si accende solo a Dicembre!",
        trivia_14: "Il dialetto locale cambia leggermente da un paese all'altro, anche se sono vicinissimi!",
        trivia_15: "Psst! Non servono scarponi da Everest, ma le infradito sui sentieri sono vietate (e pericolose).",
        trivia_16: "Il Falco Pellegrino nidifica sulle nostre scogliere. Alza gli occhi ogni tanto!",
        trivia_17: "Sotto il mare c'è un mondo: l'Area Marina Protetta è piena di pesci e gorgonie.",
        trivia_18: "Vuoi evitare la folla? I sentieri alti (verso i Santuari) sono spesso deserti e bellissimi.",
        trivia_19: "Il sentiero da Corniglia a Vernazza è considerato uno dei più panoramici in assoluto.",
        trivia_20: "Camminare tra i vigneti ti fa capire quanto è duro lavorare questa terra. Rispetto!",
        trivia_21: "Il treno è il tuo migliore amico qui. L'auto? Un incubo di parcheggi!",
        trivia_22: "Ricorda di convalidare il biglietto del treno se è cartaceo, o rischi una multa salata!",
        trivia_23: "Il traghetto è il modo migliore per vedere la costa dal mare. Una prospettiva unica.",
        trivia_24: "In estate fa caldo! Porta sempre una borraccia e un cappello se cammini ed evita le ore più calde.",
        trivia_25: "Se c'è allerta meteo (Arancione/Rossa), i sentieri vengono chiusi per sicurezza.",
        trivia_26: "Goditi il momento. Metti via il telefono per 5 minuti e ascolta il rumore del mare.",
            chicco_map_1: "🍷 Aperitivo time? Manarola e Vernazza hanno i migliori tramonti sul mare. Cerca aperitivo nella sezione Cibo!",
            chicco_map_2: "🗺️ Stai guardando la mappa? I puntini colorati sono i posti che conosco io. Toccali per scoprirli!",
            chicco_map_3: "🌅 L'ora d'oro a Riomaggiore è intorno alle 18:30. Perfetta per un calice di Sciacchetrà sul molo.",
            chicco_map_4: "🍋 Vernazza è il borgo più fotografato. Ma il segreto? La vista migliore è dal sentiero sopra il castello.",
            chicco_map_5: "🚶 Corniglia è l'unico borgo senza porto. Ma ha la terrazza più alta... e il miglior gelato al limone.",
            chicco_map_6: "⚓ Manarola di sera si svuota dai turisti. Resta — è il momento più bello per esplorare i vicoli.",
            chicco_map_7: "🍸 Monterosso ha la spiaggia più grande. I bar sul lungomare offrono spritz con vista sulla torre medievale.",
            chicco_map_8: "🐟 Il giovedì a Riomaggiore c'è il mercatino locale. Acciughe, pesto fresco e limoncino artigianale.",
        // ── Conferma svuota ──
        confirm_clear_title: "Sei sicuro?", confirm_clear_wishlist: "Tutti i tuoi preferiti verranno rimossi.",
        confirm_yes: "Sì, svuota", confirm_no: "Annulla",
        // ── Geo modal ──
        geo_title: "Dove sei?", geo_desc: "Per mostrarti la tua posizione e trovare i posti più vicini, Five2Go ha bisogno di accedere alla posizione.",
        geo_privacy: "🔒 La tua posizione viene usata solo in questa sessione e non viene mai salvata.",
        geo_hint: "Dopo aver toccato «Consenti», cerca la richiesta nella barra in alto del browser e approva.",
        geo_confirm: "Consenti posizione", geo_cancel: "Non ora",
        geo_blocked_title: "Posizione bloccata", geo_blocked_msg: "Hai negato l'accesso. Per riabilitarla vai nelle impostazioni del browser.",
        geo_unsupported: "Il tuo browser non supporta la geolocalizzazione.", geo_ok: "Capito",
        // ── Accessibility & Storage ──
        aria_fav_remove: "Rimuovi dai preferiti", aria_fav_add: "Aggiungi ai preferiti",
        storage_full: "Memoria piena, impossibile salvare. Prova a rimuovere qualche preferito.",
        report_rate_limit: "Troppe segnalazioni. Attendi un minuto."
    },
    en: {
        loading: "Loading...", error: "Error", search_placeholder: "🔍 Search restaurants, wines, trails...", no_results: "No results found.",
        btn_discover: "Discover", btn_go: "Go", btn_info: "Info", btn_map: "Map", 
        btn_call: "Call", btn_close_show: "Close & Show", btn_details: "Details",
        label_all: "All", label_all_fem: "All",
        cat_culture: "CULTURE", cat_sacred: "SACRED", cat_panorama: "PANORAMA", 
        cat_history: "HISTORY", cat_gastronomy: "GASTRONOMY",
        wine_red: "RED", wine_white: "WHITE", wine_passito: "DESSERT WINE",
        home_title: "Welcome", nav_villages: "Home", nav_food: "Food", nav_outdoor: "Outdoor", nav_services: "Services",
        menu_prod: "Products", menu_rest: "Restaurants", menu_trail: "Trails", menu_beach: "Beaches", 
        menu_trans: "Transport", menu_num: "Useful Numbers", menu_pharm: "Pharmacies", menu_map: "Maps", menu_monu: "Attractions",
        menu_wine: "Wines", menu_legal: "Legal & Privacy", 
        label_bus: "Shuttle Bus", label_ferry: "Ferry", label_train: "Train",
        footer_rights: "All rights reserved.",
        aperitivo_hint_label: "Aperitivo Time",
        aperitivo_hint_desc: "Discover the best spots for aperitivo",
        vino_map_hint_label: "Buy nearby",
        vino_map_hint_desc: "Wineries and wine shops on the map",
        spiaggia_map_hint_label: "Find on map",
        spiaggia_map_hint_desc: "See which beaches are near you",
        attrazione_map_hint_label: "Find on map",
        attrazione_map_hint_desc: "See where the attractions are located",
        filter_title: "Filter by", filter_all: "All", show_results: "Show Results", 
        filter_cat: "Category", filter_village: "Village",
        wine_type: "Type", wine_grapes: "Grapes", wine_pairings: "Pairings", wine_deg: "Alcohol",
        label_curiosity: "Curiosity", desc_missing: "Description not available.",
        btn_download_gpx: "Download GPX file", gpx_missing: "GPS track not found",
        map_route_title: "Route Map", map_zoom_hint: "Use two fingers to zoom",
        plan_trip: "Plan Trip", departure: "DEPARTURE", arrival: "ARRIVAL", 
        date_trip: "DATE", time_trip: "TIME", find_times: "FIND TIMES",
        next_runs: "NEXT RUNS", next_departure: "NEXT DEPARTURE",
        select_placeholder: "Select...", select_start: "→ Select Departure",
        // --- TRANSLATIONS ---
        select_arrival_placeholder: "→ Select arrival",
        valid_destinations: "→  Select your arrival stop",
        no_runs_today: "No other runs today",
        last_run_day: "Last run of the day",
        direction_dir: "Dir.",
        coast: "Coast",
       
        ticket_info_text: "🎟 <strong>Where to buy:</strong> Park info points or official App.<br><span class='opacity-75'>Note: Surcharge may apply on board. For ferries, ticket office at the pier.</span>",
        // ── EN ──
trail_desc_label: "Trail Description",
trail_footer_hint: "Remember: always wear suitable shoes and bring water with you.",
trail_outdoor_badge: "Outdoor & Trekking",
trail_duration_label: "Duration",
trail_length_label: "Length",
trail_level_label: "Level",
trail_rules_title: "⚠️ Golden Rules for Hikers",
trail_rules_intro: "The National Park enforces strict safety rules for all visitors:",
trail_rule_shoes_label: "🥾 Mandatory Footwear",
trail_rule_shoes_text: "Flip-flops and smooth-soled shoes are strictly forbidden on trails. Heavy fines apply. Wear hiking boots or sneakers with grip (Vibram).",
trail_rule_weather_label: "⛈️ Weather Alerts",
trail_rule_weather_text: "Trails close automatically during weather alerts (Yellow, Orange, Red). Never bypass barriers.",
trail_rule_water_label: "💧 Water & Sun",
trail_rule_water_text: "Always carry at least 1.5L of water per person.",
trail_sources_title: "🌐 Official Sources & Maps",
trail_sources_intro: "Check open trails before you go:",
trail_source1_label: "5 Terre Park Trail Guide",
trail_source2_label: "CAI La Spezia Website",
        // --------------------
        bus_searching: "Searching...", bus_no_conn: "No connection", 
        bus_no_dest: "No destination", bus_not_found: "No runs found",
        bus_try_change: "Try changing time.",
        ferry_no_corniglia: "Corniglia has no pier — the ferry doesn't stop there. Try Vernazza or Manarola, the nearest villages!",
        ferry_stop_not_served: "This stop is not served on the selected date. Try changing the date or departure point.", 
        badge_holiday: "📅 HOLIDAY", badge_weekday: "🏢 WEEKDAY",
        label_warning: "WARNING",
        how_to_ticket: "HOW TO BUY TICKETS",
        show_map: "SHOW MAP", hide_map: "HIDE MAP",
        map_hint: "Tap markers to set Departure/Arrival",
        map_title: "Five2Go picks",
        map_count_label: "in view",
        ct_cal_showing: "Band calendar for the",
        ct_sim_title: "Price Simulator",
        ct_sim_subtitle: "Find out how much your Cinque Terre Card costs based on date and traveller type.",
        ct_sim_step1: "Choose duration",
        ct_sim_step2: "Choose start date",
        ct_sim_step3: "Who's travelling?",
        ct_sim_day: "Day",
        ct_sim_days: "Days",
        ct_sim_tap_hint: "Tap a day on the calendar above to select your start date.",
        ct_sim_adult: "Adults (12-69)",
        ct_sim_child: "Children (4-11)",
        ct_sim_senior: "Over 70",
        ct_sim_family: "Family",
        ct_sim_family_desc: "2 adults + 1 or more children (4-11 years). Each extra child is added to the base price.",
        ct_sim_adults_label: "adults",
        ct_sim_who: "Traveller type",
        ct_sim_estimate: "Estimated Price",
        ct_sim_band: "Band",
        ct_sim_family_base: "Family base",
        ct_sim_disclaimer: "Indicative prices based on official 2026 rates. Actual price may vary — check the official website at the time of purchase.",
        ct_sim_today: "Today",
        train_cta: "TIMETABLE & TICKETS",
        explore_also: "Explore also",
        train_desc: "The train is the fastest way. Frequent runs every 15-20 mins between villages.",
        avg_times: "Avg Times", between_villages: "Between Villages", check_site: "Buy and check times on the official site",
        ideal_for: "Best for", distance: "Distance", duration: "Duration", level: "Level",
   
        tech_data: "Technical Data", gps_track: "GPS Track",
        elevation_gain: "Elevation", ascent: "Ascent", descent: "Descent", altitude: "Altitude",
    
        chart_label: "Chart", close_label: "Close",
   
     
        report_btn: "Report", report_title: "Report a problem",
        report_closed: "Closed / No longer exists", report_wrong: "Wrong information",
        report_blocked: "Trail blocked / Inaccessible", report_other: "Other",
        report_note_placeholder: "Briefly describe the issue (optional)...",
        report_send: "Send report", report_thanks: "Thanks for reporting!",
        report_thanks_sub: "The team will check it as soon as possible.",
        report_error: "Sending failed. Please try later.",
        welcome_app_name: "5 Terre Guide", welcome_desc: "Your essential guide to exploring Cinque Terre.",
        weather_sunny: "Sunny", weather_cloudy: "Cloudy", weather_fog: "Foggy", 
        weather_rain: "Rain", weather_storm: "Storm", weather_snow: "Snow",
        sea_calm: "Calm", sea_rough: "Rough", sea_agitated: "Choppy!",
        label_humidity: "Humidity", label_sea: "Sea",
        chicco_welcome: "Hi, I'm Chicco! I'm your local assistant. Click me anytime for precise weather, train times, and secret tips!",
        chicco_bubble_welcome: "Welcome! I'm Chicco, your guide. Tap me for instant tips! ✨",
        chicco_bubble_morning: "Buongiorno! Tap me for today's weather ☀️",
        chicco_bubble_afternoon: "There you are! Need a tip? Tap me 🍷",
        chicco_bubble_evening: "Buonasera! Tap me for tonight's plans 🌅",
        ptr_pull: "Pull to refresh",
        ptr_release: "Release to refresh",
        ptr_loading: "Refreshing...",
        trivia_1: "Did you know? Sciacchetrà is a precious sweet wine, made from sun-dried grapes.",
        trivia_2: "Do you know why wine here is heroic? Because we grow grapes on impossible slopes!",
        trivia_3: "Cinque Terre lemons are huge and very fragrant. Have you tried local products?",
        trivia_4: "Pesto Genovese: Basil, pine nuts, garlic, Parmesan, Pecorino, oil, and salt.",
        trivia_5: "Torta Monterossina is a secret cake with chocolate, jam, and custard. A blast!",
        trivia_6: "Have you seen the little train in the vineyards? Often it's the only way to transport grapes.",
        trivia_7: "In Monterosso, a 14-meter stone Giant supports a terrace over the sea.",
        trivia_8: "Corniglia is the only village not touching the sea. To get there: 382 steps or the bus!",
        trivia_9: "If we lined up all the dry stone walls here, they would exceed the Great Wall of China!",
        trivia_10: "Cinque Terre has been a UNESCO World Heritage Site since 1997. Treat it with care!",
        trivia_11: "Eugenio Montale, Nobel Prize winner, spent summers here and dedicated poems to Monterosso.",
        trivia_12: "The Disney movie 'Luca' is inspired by the Cinque Terre villages. 'Silenzio Bruno!'",
        trivia_13: "Manarola hosts the world's largest illuminated Nativity scene, but it only lights up in December!",
        trivia_14: "The local dialect changes slightly from one village to another, even though they are very close!",
        trivia_15: "Psst! You don't need Everest boots, but flip-flops on trails are forbidden (and dangerous).",
        trivia_16: "The Peregrine Falcon nests on our cliffs. Look up every now and then!",
        trivia_17: "Under the sea lies a world: the Marine Protected Area is full of fish and gorgonians.",
        trivia_18: "Want to avoid crowds? The high trails (to Sanctuaries) are often empty and beautiful.",
        trivia_19: "The trail from Corniglia to Vernazza is considered one of the most scenic ever.",
        trivia_20: "Walking through vineyards shows you how hard it is to work this land. Respect!",
        trivia_21: "The train is your best friend here. The car? A parking nightmare!",
        trivia_22: "Remember to validate your train ticket if it's paper, or you risk a fine!",
        trivia_23: "The ferry is the best way to see the coast from the sea. A unique perspective.",
        trivia_24: "It's hot in summer! Always bring a water bottle and a hat, and avoid the hottest hours.",
        trivia_25: "If there is a weather alert (Orange/Red), trails are closed for safety.",
        trivia_26: "Enjoy the moment. Put your phone away for 5 minutes and listen to the sea.",
            chicco_map_1: "🍷 Aperitivo time? Manarola and Vernazza have the best sea sunsets. Search aperitivo in the Food section!",
            chicco_map_2: "🗺️ Looking at the map? The coloured dots are places I know. Tap them to discover more!",
            chicco_map_3: "🌅 Golden hour in Riomaggiore is around 6:30 PM. Perfect for a glass of Sciacchetrà at the dock.",
            chicco_map_4: "🍋 Vernazza is the most photographed village. But the secret? The best view is from the trail above the castle.",
            chicco_map_5: "🚶 Corniglia is the only village without a harbour. But it has the highest terrace — and the best lemon gelato.",
            chicco_map_6: "⚓ Manarola in the evening empties of tourists. Stay — it's the best time to explore the alleys.",
            chicco_map_7: "🍸 Monterosso has the biggest beach. The bars along the promenade serve spritz with a view of the medieval tower.",
            chicco_map_8: "🐟 On Thursdays in Riomaggiore there's a local market. Anchovies, fresh pesto and artisan limoncino.",
        confirm_clear_title: "Are you sure?", confirm_clear_wishlist: "All your favourites will be removed.",
        confirm_yes: "Yes, clear", confirm_no: "Cancel",
        geo_title: "Where are you?", geo_desc: "To show your position and find the nearest places, Five2Go needs your location.",
        geo_privacy: "🔒 Your location is used only now and is never saved or shared.",
        geo_hint: "After tapping «Allow», look for the request in the browser bar above and approve.",
        geo_confirm: "Allow location", geo_cancel: "Not now",
        geo_blocked_title: "Location blocked", geo_blocked_msg: "You denied location access. Re-enable in browser settings.",
        geo_unsupported: "Your browser doesn't support geolocation.", geo_ok: "Got it",
        aria_fav_remove: "Remove from favourites", aria_fav_add: "Add to favourites",
        storage_full: "Storage full, unable to save. Try removing some favourites.",
        report_rate_limit: "Too many reports. Please wait a minute."
    },
    fr: {
        loading: "Chargement...", error: "Erreur", search_placeholder: "🔍 Cherchez restaurants, vins, randonnées...", no_results: "Aucun résultat.",
        btn_discover: "Découvrir", btn_go: "Y aller", btn_info: "Infos", btn_map: "Carte",
        btn_call: "Appeler", btn_close_show: "Fermer & Afficher", btn_details: "Détails",
        label_all: "Tous", label_all_fem: "Toutes",
        cat_culture: "CULTURE", cat_sacred: "SACRÉ", cat_panorama: "PANORAMA",
        cat_history: "HISTOIRE", cat_gastronomy: "GASTRONOMIE",
        wine_red: "ROUGE", wine_white: "BLANC", wine_passito: "VIN DE PAILLE",
        home_title: "Bienvenue", nav_villages: "Accueil", nav_food: "Cuisine", nav_outdoor: "Plein air", nav_services: "Services",
        menu_prod: "Produits", menu_rest: "Restaurants", menu_trail: "Sentiers", menu_beach: "Plages",
        menu_trans: "Transports", menu_num: "Numéros Utiles", menu_pharm: "Pharmacies", menu_map: "Cartes", menu_monu: "Attractions",
        menu_wine: "Vins", menu_legal: "Mentions Légales", 
        label_bus: "Navette", label_ferry: "Bateau", label_train: "Train",
        footer_rights: "Tous droits réservés.",
        aperitivo_hint_label: "Aperitivo Time",
        aperitivo_hint_desc: "Découvrez les meilleurs endroits pour l'apéritif",
        vino_map_hint_label: "Acheter en zone",
        vino_map_hint_desc: "Caves et cavistes sur la carte",
        spiaggia_map_hint_label: "Trouver sur la carte",
        spiaggia_map_hint_desc: "Voir les plages près de vous",
        attrazione_map_hint_label: "Trouver sur la carte",
        attrazione_map_hint_desc: "Voir où se trouvent les attractions",
        filter_title: "Filtrer par", filter_all: "Tous", show_results: "Afficher Résultats",
        filter_cat: "Catégorie", filter_village: "Village",
        wine_type: "Type", wine_grapes: "Raisins", wine_pairings: "Accords", wine_deg: "Degrés",
        label_curiosity: "Curiosité", desc_missing: "Description non disponible.",
        btn_download_gpx: "Télécharger GPX", gpx_missing: "Trace GPS absente",
        map_route_title: "Carte de l'itinéraire", map_zoom_hint: "Utilisez deux doigts pour zoomer",
        plan_trip: "Planifier Voyage", departure: "DÉPART", arrival: "ARRIVÉE",
        date_trip: "DATE VOYAGE", time_trip: "HEURE", find_times: "TROUVER HORAIRES",
        next_runs: "PROCHAINS DÉPARTS", next_departure: "PROCHAIN DÉPART",
        select_placeholder: "Sélectionner...", select_start: "→ Sélectionner Départ",
        select_arrival_placeholder: "→ Choisir l'arrivée",
        valid_destinations: "→  Choisissez votre arrêt d'arrivée",
        no_runs_today: "Plus de trajets aujourd'hui",
        last_run_day: "Dernier trajet de la journée",
        direction_dir: "Dir.",
        coast: "Côte",
    
        ticket_info_text: "🎟 <strong>Où acheter :</strong> Points d'info du Parc ou via l'App officielle.<br><span class='opacity-75'>Note : Supplément possible à bord. Pour les bateaux, billetterie sur le quai.</span>",
        // ── FR ──
trail_desc_label: "Description du parcours",
trail_footer_hint: "N'oubliez pas : portez toujours des chaussures adaptées et de l'eau.",
trail_outdoor_badge: "Outdoor & Randonnée",
trail_duration_label: "Durée",
trail_length_label: "Longueur",
trail_level_label: "Niveau",
trail_rules_title: "⚠️ Règles d'Or pour le Randonneur",
trail_rules_intro: "Le Parc National applique des règles strictes de sécurité :",
trail_rule_shoes_label: "🥾 Chaussures Obligatoires",
trail_rule_shoes_text: "Interdit aux tongs, claquettes ou semelles lisses. Amendes élevées. Portez des chaussures de randonnée ou baskets crantées.",
trail_rule_weather_label: "⛈️ Alerte Météo",
trail_rule_weather_text: "En cas d'alerte (Jaune, Orange, Rouge), les sentiers ferment automatiquement. Ne forcez pas les passages.",
trail_rule_water_label: "💧 Eau et Soleil",
trail_rule_water_text: "Emportez toujours au moins 1,5L d'eau par personne.",
trail_sources_title: "🌐 Sources Officielles",
trail_sources_intro: "Vérifiez l'ouverture des sentiers avant de partir :",
trail_source1_label: "Guide Sentiers Parc 5 Terre",
trail_source2_label: "Site Web CAI La Spezia",
        bus_searching: "Recherche connexions...", bus_no_conn: "Aucune connexion",
        bus_no_dest: "Aucune destination", bus_not_found: "Aucun trajet trouvé",
        bus_try_change: "Essayez de changer l'heure.",
        ferry_no_corniglia: "Corniglia n'a pas de quai — le bateau ne s'y arrête pas. Essayez Vernazza ou Manarola, les villages les plus proches !",
        ferry_stop_not_served: "Cet arrêt n'est pas desservi à la date sélectionnée. Essayez de changer la date ou le point de départ.", 
        badge_holiday: "📅 FÉRIÉ", badge_weekday: "🏢 SEMAINE",
        label_warning: "ATTENTION",
        how_to_ticket: "COMMENT ACHETER LE BILLET",
        show_map: "AFFICHER CARTE", hide_map: "MASQUER CARTE",
        map_hint: "Touchez les marqueurs pour définir Départ/Arrivée",
        map_title: "Sélections Five2Go",
        map_count_label: "en vue",
        ct_cal_showing: "Calendrier des bandes pour la carte",
        ct_sim_title: "Simulateur de Prix",
        ct_sim_subtitle: "Découvrez le coût de votre Cinque Terre Card selon la date et le type de voyageur.",
        ct_sim_step1: "Choisir la durée",
        ct_sim_step2: "Choisir la date de début",
        ct_sim_step3: "Qui voyage ?",
        ct_sim_day: "Jour",
        ct_sim_days: "Jours",
        ct_sim_tap_hint: "Touchez un jour dans le calendrier ci-dessus pour sélectionner la date de début.",
        ct_sim_adult: "Adultes (12-69)",
        ct_sim_child: "Enfants (4-11)",
        ct_sim_senior: "Plus de 70 ans",
        ct_sim_family: "Famille",
        ct_sim_family_desc: "2 adultes + 1 ou plusieurs enfants (4-11 ans). Chaque enfant supplémentaire est ajouté au prix de base.",
        ct_sim_adults_label: "adultes",
        ct_sim_who: "Type de voyageur",
        ct_sim_estimate: "Prix Estimé",
        ct_sim_band: "Bande",
        ct_sim_family_base: "Base famille",
        ct_sim_disclaimer: "Prix indicatifs basés sur les tarifs officiels 2026. Le prix réel peut varier — vérifiez sur le site officiel lors de l'achat.",
        ct_sim_today: "Aujourd'hui",
        train_cta: "HORAIRES ET BILLETS",
        explore_also: "Explorez aussi",
        train_desc: "Le train est le moyen le plus rapide. Départs fréquents toutes les 15-20 min entre les villages.",
        avg_times: "Temps Moyens", between_villages: "Entre les Villages", check_site: "Achetez et vérifiez les horaires sur le site officiel",
        ideal_for: "Idéal pour", distance: "Distance", duration: "Durée", level: "Niveau",
   
        tech_data: "Données techniques", gps_track: "Trace GPS",
        elevation_gain: "Dénivelé", ascent: "Montée", descent: "Descente", altitude: "Altitude",
      
      
        chart_label: "Graphique", close_label: "Fermer",
    
   
        report_btn: "Signaler", report_title: "Signaler un problème",
        report_closed: "Fermé / N'existe plus", report_wrong: "Information incorrecte",
        report_blocked: "Sentier bloqué / Inaccessible", report_other: "Autre",
        report_note_placeholder: "Décrivez brièvement le problème (facultatif)...",
        report_send: "Envoyer le signalement", report_thanks: "Merci pour votre signalement !",
        report_thanks_sub: "L'équipe vérifiera dès que possible.",
        report_error: "Erreur d'envoi. Réessayez plus tard.",
        welcome_app_name: "Guide 5 Terres", welcome_desc: "Votre guide essentiel pour explorer les Cinque Terre.",
        weather_sunny: "Ensoleillé", weather_cloudy: "Nuageux", weather_fog: "Brume",
        weather_rain: "Pluie", weather_storm: "Orage", weather_snow: "Neige",
        sea_calm: "Calme", sea_rough: "Agité", sea_agitated: "Très agité !",
        label_humidity: "Humidité", label_sea: "Mer",
        chicco_welcome: "Enchanté, je suis Chicco ! Je suis ton assistant local. Clique sur moi pour la météo, les horaires de train et des conseils secrets !",
        chicco_bubble_welcome: "Bienvenue ! Moi c'est Chicco, ton guide. Touche-moi pour des infos express ! ✨",
        chicco_bubble_morning: "Buongiorno ! Touche-moi pour la météo du jour ☀️",
        chicco_bubble_afternoon: "Te revoilà ! Besoin d'un conseil ? Touche-moi 🍷",
        chicco_bubble_evening: "Buonasera ! Touche-moi pour tes plans de ce soir 🌅",
        ptr_pull: "Tirez pour actualiser",
        ptr_release: "Relâchez pour actualiser",
        ptr_loading: "Actualisation...",
        trivia_1: "Le saviez-vous ? Le Sciacchetrà est un vin doux et précieux, produit avec des raisins séchés au soleil.",
        trivia_2: "Pourquoi le vin est-il 'héroïque' ici ? Car nous cultivons le raisin sur des pentes impossibles !",
        trivia_3: "Les citrons des Cinque Terre sont énormes et parfumés. Avez-vous goûté les produits locaux ?",
        trivia_4: "Pesto Genovese : Basilic, pignons, ail, parmesan, pecorino, huile et sel.",
        trivia_5: "La Torta Monterossina est un gâteau secret au chocolat, confiture et crème. Une bombe !",
        trivia_6: "Avez-vous vu le petit train dans les vignes ? C'est souvent le seul moyen de transporter le raisin.",
        trivia_7: "À Monterosso, un Géant de pierre de 14 mètres soutient une terrasse sur la mer.",
        trivia_8: "Corniglia est le seul village sans accès mer direct. Pour y arriver : 382 marches ou le bus !",
        trivia_9: "Si on alignait tous les murs en pierres sèches des Cinque Terre, on dépasserait la Muraille de Chine !",
        trivia_10: "Les Cinque Terre sont au patrimoine de l'UNESCO depuis 1997. Prenez-en soin !",
        trivia_11: "Eugenio Montale, prix Nobel, passait ses étés ici et a dédié des poèmes à Monterosso.",
        trivia_12: "Le film Disney 'Luca' est inspiré des villages des Cinque Terre. 'Silenzio Bruno !'",
        trivia_13: "Manarola accueille la plus grande Crèche Lumineuse du monde, allumée seulement en décembre !",
        trivia_14: "Le dialecte local change légèrement d'un village à l'autre, bien qu'ils soient très proches !",
        trivia_15: "Psst ! Pas besoin de bottes d'Everest, mais les tongs sont interdites sur les sentiers (et dangereuses).",
        trivia_16: "Le Faucon Pèlerin niche sur nos falaises. Levez les yeux de temps en temps !",
        trivia_17: "Sous la mer, un autre monde : l'Aire Marine Protégée regorge de poissons et de gorgones.",
        trivia_18: "Éviter la foule ? Les sentiers hauts (vers les Sanctuaires) sont souvent déserts et magnifiques.",
        trivia_19: "Le sentier de Corniglia à Vernazza est considéré comme l'un des plus panoramiques.",
        trivia_20: "Marcher dans les vignes fait comprendre la dureté du travail de cette terre. Respect !",
        trivia_21: "Le train est votre meilleur ami ici. La voiture ? Un cauchemar pour se garer !",
        trivia_22: "N'oubliez pas de composter votre billet de train papier, sinon gare à l'amende !",
        trivia_23: "Le bateau est le meilleur moyen de voir la côte depuis la mer. Une perspective unique.",
        trivia_24: "En été, il fait chaud ! Apportez toujours de l'eau et un chapeau, et évitez les heures chaudes.",
        trivia_25: "En cas d'alerte météo (Orange/Rouge), les sentiers sont fermés pour sécurité.",
        trivia_26: "Profitez du moment. Rangez le téléphone 5 minutes et écoutez le bruit de la mer.",
            chicco_map_1: "🍷 L'heure de l'apéritif ? Manarola et Vernazza ont les meilleurs couchers de soleil. Cherchez l'apéritif dans la section Nourriture !",
            chicco_map_2: "🗺️ Vous regardez la carte ? Les points colorés sont des lieux que je connais. Touchez-les pour les découvrir !",
            chicco_map_3: "🌅 L'heure dorée à Riomaggiore est vers 18h30. Parfait pour un verre de Sciacchetrà au quai.",
            chicco_map_4: "🍋 Vernazza est le village le plus photographié. Le secret ? La meilleure vue est depuis le sentier au-dessus du château.",
            chicco_map_5: "🚶 Corniglia est le seul village sans port. Mais il a la terrasse la plus haute et la meilleure glace au citron.",
            chicco_map_6: "⚓ Manarola le soir se vide des touristes. Restez — c'est le meilleur moment pour explorer les ruelles.",
            chicco_map_7: "🍸 Monterosso a la plus grande plage. Les bars servent des spritz avec vue sur la tour médiévale.",
            chicco_map_8: "🐟 Le jeudi à Riomaggiore il y a un marché local. Anchois, pesto frais et limoncino artisanal.",
        confirm_clear_title: "Êtes-vous sûr ?", confirm_clear_wishlist: "Tous vos favoris seront supprimés.",
        confirm_yes: "Oui, vider", confirm_no: "Annuler",
        geo_title: "Où êtes-vous ?", geo_desc: "Pour afficher votre position et trouver les arrêts les plus proches.",
        geo_privacy: "🔒 Votre position n'est utilisée que maintenant et n'est jamais enregistrée.",
        geo_hint: "Après avoir appuyé sur «Autoriser», cherchez la demande dans la barre du navigateur.",
        geo_confirm: "Autoriser la position", geo_cancel: "Pas maintenant",
        geo_blocked_title: "Position bloquée", geo_blocked_msg: "Accès refusé. Réactivez dans les paramètres du navigateur.",
        geo_unsupported: "Votre navigateur ne supporte pas la géolocalisation.", geo_ok: "Compris",
        aria_fav_remove: "Retirer des favoris", aria_fav_add: "Ajouter aux favoris",
        storage_full: "Mémoire pleine, impossible de sauvegarder. Essayez de retirer des favoris.",
        report_rate_limit: "Trop de signalements. Patientez une minute."
    },

    de: {
        loading: "Laden...", error: "Fehler", search_placeholder: "🔍 Restaurants, Weine, Wanderwege...", no_results: "Keine Ergebnisse.",
        btn_discover: "Entdecken", btn_go: "Los", btn_info: "Info", btn_map: "Karte",
        btn_call: "Anrufen", btn_close_show: "Schließen & Zeigen", btn_details: "Details",
        label_all: "Alle", label_all_fem: "Alle",
        cat_culture: "KULTUR", cat_sacred: "SAKRALES", cat_panorama: "PANORAMA",
        cat_history: "GESCHICHTE", cat_gastronomy: "GASTRONOMIE",
        wine_red: "ROT", wine_white: "WEISS", wine_passito: "DESSERTWEIN",
        home_title: "Willkommen", nav_villages: "Home", nav_food: "Essen", nav_outdoor: "Outdoor", nav_services: "Dienste",
        menu_prod: "Produkte", menu_rest: "Restaurants", menu_trail: "Wanderwege", menu_beach: "Strände",
        menu_trans: "Transport", menu_num: "Nützliche Nummern", menu_pharm: "Apotheken", menu_map: "Karten", menu_monu: "Attraktionen",
        menu_wine: "Weine", menu_legal: "Rechtliches", 
        label_bus: "Shuttlebus", label_ferry: "Fähre", label_train: "Zug",
        footer_rights: "Alle Rechte vorbehalten.",
        aperitivo_hint_label: "Aperitivo Time",
        aperitivo_hint_desc: "Entdecke die besten Orte für Aperitivo",
        vino_map_hint_label: "In der Nähe kaufen",
        vino_map_hint_desc: "Weingüter und Weinhandlungen auf der Karte",
        spiaggia_map_hint_label: "Auf der Karte finden",
        spiaggia_map_hint_desc: "Strände in deiner Nähe sehen",
        attrazione_map_hint_label: "Auf der Karte finden",
        attrazione_map_hint_desc: "Sehenswürdigkeiten auf der Karte",
        filter_title: "Filtern nach", filter_all: "Alle", show_results: "Ergebnisse zeigen",
        filter_cat: "Kategorie", filter_village: "Dorf",
        wine_type: "Typ", wine_grapes: "Trauben", wine_pairings: "Paarungen", wine_deg: "Alkoholgehalt",
        label_curiosity: "Wissenswertes", desc_missing: "Beschreibung nicht verfügbar.",
        btn_download_gpx: "GPX-Datei laden", gpx_missing: "Kein GPS-Track",
        map_route_title: "Routenkarte", map_zoom_hint: "Zum Zoomen zwei Finger benutzen",
        plan_trip: "Reise planen", departure: "ABFAHRT", arrival: "ANKUNFT",
        date_trip: "REISEDATUM", time_trip: "UHRZEIT", find_times: "ZEITEN FINDEN",
        next_runs: "NÄCHSTE FAHRTEN", next_departure: "NÄCHSTE ABFAHRT",
        select_placeholder: "Wählen...", select_start: "→ Abfahrt wählen",
        select_arrival_placeholder: "→ Ankunft wählen",
        valid_destinations: "→  Ankunftshaltestelle wählen",
        no_runs_today: "Keine weiteren Fahrten heute",
        last_run_day: "Letzte Fahrt des Tages",
        direction_dir: "Rtg.",
        coast: "Küste",
    
        ticket_info_text: "🎟 <strong>Wo kaufen:</strong> Info-Points des Parks oder offizielle App.<br><span class='opacity-75'>Hinweis: An Bord evtl. Aufpreis. Für Fähren: Tickets am Kai.</span>",
        // ── DE ──
trail_desc_label: "Wegbeschreibung",
trail_footer_hint: "Denk daran: Trage immer geeignetes Schuhwerk und nimm Wasser mit.",
trail_outdoor_badge: "Outdoor & Wandern",
trail_duration_label: "Dauer",
trail_length_label: "Länge",
trail_level_label: "Niveau",
trail_rules_title: "⚠️ Goldene Regeln für Wanderer",
trail_rules_intro: "Der Nationalpark hat strenge Sicherheitsregeln für alle Besucher:",
trail_rule_shoes_label: "🥾 Schuhpflicht",
trail_rule_shoes_text: "Flip-Flops und Schuhe mit glatter Sohle sind verboten. Es drohen hohe Bußgelder. Tragen Sie Wanderschuhe oder Turnschuhe mit Profil.",
trail_rule_weather_label: "⛈️ Wetterwarnung",
trail_rule_weather_text: "Bei Warnstufen (Gelb, Orange, Rot) werden die Wege automatisch gesperrt. Sperren niemals umgehen.",
trail_rule_water_label: "💧 Wasser & Sonne",
trail_rule_water_text: "Nehmen Sie immer mind. 1,5L Wasser pro Person mit.",
trail_sources_title: "🌐 Offizielle Quellen",
trail_sources_intro: "Prüfen Sie vor der Abfahrt welche Wege geöffnet sind:",
trail_source1_label: "5 Terre Park Wanderführer",
trail_source2_label: "CAI La Spezia Webseite",
        bus_searching: "Suche Verbindungen...", bus_no_conn: "Keine Verbindung",
        bus_no_dest: "Kein Ziel", bus_not_found: "Keine Fahrt gefunden",
        bus_try_change: "Versuchen Sie eine andere Zeit.",
        ferry_no_corniglia: "Corniglia hat keinen Anleger — die Fähre hält dort nicht. Versuchen Sie Vernazza oder Manarola, die nächsten Dörfer!",
        ferry_stop_not_served: "Diese Haltestelle wird am gewählten Datum nicht bedient. Versuchen Sie ein anderes Datum oder einen anderen Abfahrtspunkt.", 
        badge_holiday: "📅 FEIERTAG", badge_weekday: "🏢 WERKTAG",
        label_warning: "ACHTUNG",
        how_to_ticket: "TICKETKAUF",
        show_map: "KARTE ANZEIGEN", hide_map: "KARTE AUSBLENDEN",
        map_hint: "Tippen Sie auf Marker für Start/Ziel",
        map_title: "Five2Go Empfehlungen",
        map_count_label: "sichtbar",
        ct_cal_showing: "Bandkalender für die",
        ct_sim_title: "Preissimulator",
        ct_sim_subtitle: "Finden Sie heraus, was Ihre Cinque Terre Card je nach Datum und Reisetyp kostet.",
        ct_sim_step1: "Dauer wählen",
        ct_sim_step2: "Startdatum wählen",
        ct_sim_step3: "Wer reist?",
        ct_sim_day: "Tag",
        ct_sim_days: "Tage",
        ct_sim_tap_hint: "Tippen Sie auf einen Tag im Kalender oben, um das Startdatum auszuwählen.",
        ct_sim_adult: "Erwachsene (12-69)",
        ct_sim_child: "Kinder (4-11)",
        ct_sim_senior: "Über 70",
        ct_sim_family: "Familie",
        ct_sim_family_desc: "2 Erwachsene + 1 oder mehr Kinder (4-11 Jahre). Jedes weitere Kind wird zum Grundpreis hinzugerechnet.",
        ct_sim_adults_label: "Erwachsene",
        ct_sim_who: "Reisetyp",
        ct_sim_estimate: "Geschätzter Preis",
        ct_sim_band: "Band",
        ct_sim_family_base: "Familiengrundpreis",
        ct_sim_disclaimer: "Richtwerte basierend auf den offiziellen Tarifen 2026. Der tatsächliche Preis kann abweichen — überprüfen Sie die offizielle Website beim Kauf.",
        ct_sim_today: "Heute",
        train_cta: "FAHRPLÄNE & TICKETS",
        explore_also: "Entdecken Sie auch",
        train_desc: "Der Zug ist am schnellsten. Häufige Fahrten alle 15-20 Min. zwischen den Dörfern.",
        avg_times: "Durchschn. Zeit", between_villages: "Zwischen Dörfern", check_site: "Kaufen & prüfen Sie Zeiten auf der offiziellen Seite",
        ideal_for: "Ideal für", distance: "Distanz", duration: "Dauer", level: "Niveau",
   
        tech_data: "Technische Daten", gps_track: "GPS-Track",
        elevation_gain: "Höhendifferenz", ascent: "Aufstieg", descent: "Abstieg", altitude: "Höhe",
  
   
        chart_label: "Diagramm", close_label: "Schließen",
       
      
        report_btn: "Melden", report_title: "Problem melden",
        report_closed: "Geschlossen / Existiert nicht mehr", report_wrong: "Falsche Information",
        report_blocked: "Weg gesperrt / Unzugänglich", report_other: "Sonstiges",
        report_note_placeholder: "Beschreiben Sie das Problem kurz (optional)...",
        report_send: "Meldung senden", report_thanks: "Danke für Ihre Meldung!",
        report_thanks_sub: "Das Team wird es so schnell wie möglich prüfen.",
        report_error: "Sendefehler. Bitte später erneut versuchen.",
        welcome_app_name: "5 Terre Guide", welcome_desc: "Ihr essenzieller Führer für die Cinque Terre.",
        weather_sunny: "Sonnig", weather_cloudy: "Bewölkt", weather_fog: "Nebel",
        weather_rain: "Regen", weather_storm: "Gewitter", weather_snow: "Schnee",
        sea_calm: "Ruhig", sea_rough: "Rau", sea_agitated: "Sehr rau!",
        label_humidity: "Feuchtigkeit", label_sea: "Meer",
        chicco_welcome: "Freut mich, ich bin Chicco! Ich bin dein lokaler Assistent. Klick mich für Wetter, Zugzeiten und Geheimtipps!",
        chicco_bubble_welcome: "Willkommen! Ich bin Chicco, dein Guide. Tipp mich für Sofort-Tipps! ✨",
        chicco_bubble_morning: "Buongiorno! Tipp mich für das Wetter heute ☀️",
        chicco_bubble_afternoon: "Da bist du! Brauchst du einen Tipp? Tipp mich 🍷",
        chicco_bubble_evening: "Buonasera! Tipp mich für die Abendpläne 🌅",
        ptr_pull: "Zum Aktualisieren ziehen",
        ptr_release: "Zum Aktualisieren loslassen",
        ptr_loading: "Wird aktualisiert...",
        trivia_1: "Wusstest du? Sciacchetrà ist ein süßer, kostbarer Wein aus sonnengetrockneten Trauben.",
        trivia_2: "Warum ist der Wein hier 'heroisch'? Weil wir Trauben an unmöglichen Hängen anbauen!",
        trivia_3: "Die Zitronen der Cinque Terre sind riesig und duftend. Hast du lokale Produkte probiert?",
        trivia_4: "Pesto Genovese: Basilikum, Pinienkerne, Knoblauch, Parmesan, Pecorino, Öl und Salz.",
        trivia_5: "Die Torta Monterossina ist ein geheimer Kuchen mit Schoko, Marmelade und Creme. Eine Bombe!",
        trivia_6: "Hast du die kleine Bahn in den Weinbergen gesehen? Oft der einzige Weg für den Transport.",
        trivia_7: "In Monterosso stützt ein 14 Meter hoher steinerner Riese eine Terrasse über dem Meer.",
        trivia_8: "Corniglia liegt nicht am Meer. Um hinzukommen: 382 Stufen oder der Bus!",
        trivia_9: "Würde man alle Trockenmauern der Cinque Terre aneinanderreihen, wären sie länger als die Chinesische Mauer!",
        trivia_10: "Die Cinque Terre sind seit 1997 UNESCO-Welterbe. Behandle sie mit Sorgfalt!",
        trivia_11: "Nobelpreisträger Eugenio Montale verbrachte hier den Sommer und widmete Monterosso Gedichte.",
        trivia_12: "Der Disney-Film 'Luca' ist von den Cinque Terre inspiriert. 'Silenzio Bruno!'",
        trivia_13: "Manarola beherbergt die größte leuchtende Krippe der Welt, aber nur im Dezember!",
        trivia_14: "Der lokale Dialekt ändert sich leicht von Dorf zu Dorf, obwohl sie so nah sind!",
        trivia_15: "Psst! Keine Everest-Stiefel nötig, aber Flip-Flops sind auf Wegen verboten (und gefährlich).",
        trivia_16: "Der Wanderfalke nistet an unseren Klippen. Schau ab und zu nach oben!",
        trivia_17: "Unter Wasser gibt es eine eigene Welt: Das Meeresschutzgebiet ist voller Fische.",
        trivia_18: "Massen meiden? Die hohen Wege (zu den Heiligtümern) sind oft leer und wunderschön.",
        trivia_19: "Der Weg von Corniglia nach Vernazza gilt als einer der aussichtsreichsten überhaupt.",
        trivia_20: "Zwischen Weinbergen zu laufen zeigt, wie hart die Arbeit hier ist. Respekt!",
        trivia_21: "Der Zug ist dein bester Freund hier. Das Auto? Ein Parkplatz-Albtraum!",
        trivia_22: "Vergiss nicht, dein Papierticket zu entwerten, sonst droht ein hohes Bußgeld!",
        trivia_23: "Die Fähre ist der beste Weg, die Küste vom Meer aus zu sehen. Eine einzigartige Perspektive.",
        trivia_24: "Im Sommer ist es heiß! Bring Wasser und Hut mit und meide die Mittagshitze.",
        trivia_25: "Bei Wetterwarnung (Orange/Rot) werden die Wege zur Sicherheit gesperrt.",
        trivia_26: "Genieße den Moment. Leg das Handy 5 Minuten weg und hör dem Meer zu.",
            chicco_map_1: "🍷 Aperitivo-Zeit? Manarola und Vernazza haben die schönsten Sonnenuntergänge am Meer. Suche aperitivo im Bereich Essen!",
            chicco_map_2: "🗺️ Du schaust dir die Karte an? Die farbigen Punkte sind Orte, die ich kenne. Tippe darauf, um mehr zu entdecken!",
            chicco_map_3: "🌅 Die goldene Stunde in Riomaggiore ist gegen 18:30 Uhr. Perfekt für ein Glas Sciacchetrà am Pier.",
            chicco_map_4: "🍋 Vernazza ist das meistfotografierte Dorf. Das Geheimnis? Der beste Aussichtspunkt ist vom Pfad über der Burg.",
            chicco_map_5: "🚶 Corniglia ist das einzige Dorf ohne Hafen. Aber es hat die höchste Terrasse... und das beste Zitroneneeis.",
            chicco_map_6: "⚓ Manarola am Abend leert sich von Touristen. Bleib — es ist die schönste Zeit, die Gassen zu erkunden.",
            chicco_map_7: "🍸 Monterosso hat den größten Strand. Die Bars an der Promenade servieren Spritz mit Blick auf den mittelalterlichen Turm.",
            chicco_map_8: "🐟 Donnerstags in Riomaggiore gibt es einen lokalen Markt. Sardellen, frisches Pesto und handgemachten Limoncino.",
        confirm_clear_title: "Bist du sicher?", confirm_clear_wishlist: "Alle Favoriten werden entfernt.",
        confirm_yes: "Ja, löschen", confirm_no: "Abbrechen",
        geo_title: "Wo bist du?", geo_desc: "Um deine Position anzuzeigen und die nächsten Orte zu finden.",
        geo_privacy: "🔒 Dein Standort wird nur jetzt verwendet und niemals gespeichert.",
        geo_hint: "Tippe auf «Erlauben» und bestätige dann in der Browserleiste oben.",
        geo_confirm: "Standort erlauben", geo_cancel: "Nicht jetzt",
        geo_blocked_title: "Standort blockiert", geo_blocked_msg: "Zugriff verweigert. In den Browsereinstellungen aktivieren.",
        geo_unsupported: "Dein Browser unterstützt keine Geolokalisierung.", geo_ok: "Verstanden",
        aria_fav_remove: "Aus Favoriten entfernen", aria_fav_add: "Zu Favoriten hinzufügen",
        storage_full: "Speicher voll, Speichern nicht möglich. Entferne einige Favoriten.",
        report_rate_limit: "Zu viele Meldungen. Bitte eine Minute warten."
    },

    es: {
        loading: "Cargando...", error: "Error", search_placeholder: "🔍 Busca restaurantes, vinos, rutas...", no_results: "Sin resultados.",
        btn_discover: "Descubrir", btn_go: "Ir", btn_info: "Info", btn_map: "Mapa",
        btn_call: "Llamar", btn_close_show: "Cerrar & Mostrar", btn_details: "Detalles",
        label_all: "Todos", label_all_fem: "Todas",
        cat_culture: "CULTURA", cat_sacred: "SACRO", cat_panorama: "PANORAMA",
        cat_history: "HISTORIA", cat_gastronomy: "GASTRONOMÍA",
        wine_red: "TINTO", wine_white: "BLANCO", wine_passito: "VINO DULCE",
        home_title: "Bienvenido", nav_villages: "Inicio", nav_food: "Comida", nav_outdoor: "Outdoor", nav_services: "Servicios",
        menu_prod: "Productos", menu_rest: "Restaurantes", menu_trail: "Senderos", menu_beach: "Playas",
        menu_trans: "Transporte", menu_num: "Números Útiles", menu_pharm: "Farmacias", menu_map: "Mapas", menu_monu: "Atracciones",
        menu_wine: "Vinos", menu_legal: "Notas Legales",
        label_bus: "Autobús", label_ferry: "Barco", label_train: "Tren",
        footer_rights: "Todos los derechos reservados.",
        aperitivo_hint_label: "Aperitivo Time",
        aperitivo_hint_desc: "Descubre los mejores lugares para el aperitivo",
        vino_map_hint_label: "Comprar cerca",
        vino_map_hint_desc: "Bodegas y vinotecas en el mapa",
        spiaggia_map_hint_label: "Ver en el mapa",
        spiaggia_map_hint_desc: "Descubre las playas cerca de ti",
        attrazione_map_hint_label: "Ver en el mapa",
        attrazione_map_hint_desc: "Ve dónde están las atracciones",
        filter_title: "Filtrar por", filter_all: "Todos", show_results: "Mostrar Resultados",
        filter_cat: "Categoría", filter_village: "Pueblo",
        wine_type: "Tipo", wine_grapes: "Uvas", wine_pairings: "Maridaje", wine_deg: "Grados",
        label_curiosity: "Curiosidad", desc_missing: "Descripción no disponible.",
        btn_download_gpx: "Descargar archivo GPX", gpx_missing: "Ruta GPS no presente",
        map_route_title: "Mapa de Ruta", map_zoom_hint: "Usa dos dedos para hacer zoom",
        plan_trip: "Planificar Viaje", departure: "SALIDA", arrival: "LLEGADA",
        date_trip: "FECHA VIAJE", time_trip: "HORA", find_times: "BUSCAR HORARIOS",
        next_runs: "PRÓXIMAS SALIDAS", next_departure: "PRÓXIMA SALIDA",
        select_placeholder: "Selecciona...", select_start: "→ Selecciona Salida",
        select_arrival_placeholder: "→ Elige llegada",
        valid_destinations: "→  Elige tu parada de llegada",
        no_runs_today: "No hay más viajes hoy",
        last_run_day: "Último viaje del día",
        direction_dir: "Dir.",
        coast: "Costa",
  
        ticket_info_text: "🎟 <strong>Dónde comprar:</strong> Puntos de info del Parque o App oficial.<br><span class='opacity-75'>Nota: A bordo puede haber recargo. Para barcos, taquilla en el muelle.</span>",
        // ── ES ──
trail_desc_label: "Descripción del recorrido",
trail_footer_hint: "Recuerda: lleva siempre calzado adecuado y agua contigo.",
trail_outdoor_badge: "Outdoor & Senderismo",
trail_duration_label: "Duración",
trail_length_label: "Longitud",
trail_level_label: "Nivel",
trail_rules_title: "⚠️ Reglas de Oro para el Excursionista",
trail_rules_intro: "El Parque Nacional aplica reglas estrictas de seguridad para todos los visitantes:",
trail_rule_shoes_label: "🥾 Calzado Obligatorio",
trail_rule_shoes_text: "Prohibido chanclas o suelas lisas. Hay multas elevadas. Use botas de trekking o zapatillas con agarre.",
trail_rule_weather_label: "⛈️ Alerta Meteorológica",
trail_rule_weather_text: "Con alertas (Amarilla, Naranja, Roja), los senderos cierran automáticamente. No fuerce los bloqueos.",
trail_rule_water_label: "💧 Agua y Sol",
trail_rule_water_text: "Lleve siempre al menos 1.5L de agua por persona.",
trail_sources_title: "🌐 Fuentes Oficiales",
trail_sources_intro: "Verifica los senderos abiertos antes de salir:",
trail_source1_label: "Guía Senderos Parque 5 Terre",
trail_source2_label: "Sitio Web CAI La Spezia",
        bus_searching: "Buscando conexiones...", bus_no_conn: "Sin conexión",
        bus_no_dest: "Sin destino", bus_not_found: "No se encontraron viajes",
        bus_try_change: "Prueba a cambiar el horario.",
        ferry_no_corniglia: "Corniglia no tiene muelle — el barco no para allí. ¡Prueba desde Vernazza o Manarola, los pueblos más cercanos!",
        ferry_stop_not_served: "Esta parada no tiene servicio en la fecha seleccionada. Prueba a cambiar la fecha o el punto de salida.", 
        badge_holiday: "📅 FESTIVO", badge_weekday: "🏢 LABORABLE",
        label_warning: "ATENCIÓN",
        how_to_ticket: "CÓMO COMPRAR EL BILLETE",
        show_map: "MOSTRAR MAPA", hide_map: "OCULTAR MAPA",
        map_hint: "Toca los marcadores para fijar Salida/Llegada",
        map_title: "Recomendados Five2Go",
        map_count_label: "a la vista",
        ct_cal_showing: "Calendario de franjas para la tarjeta",
        ct_sim_title: "Simulador de Precio",
        ct_sim_subtitle: "Descubre cuánto cuesta tu Cinque Terre Card según la fecha y el tipo de viajero.",
        ct_sim_step1: "Elige la duración",
        ct_sim_step2: "Elige la fecha de inicio",
        ct_sim_step3: "¿Quién viaja?",
        ct_sim_day: "Día",
        ct_sim_days: "Días",
        ct_sim_tap_hint: "Toca un día en el calendario de arriba para seleccionar la fecha de inicio.",
        ct_sim_adult: "Adultos (12-69)",
        ct_sim_child: "Niños (4-11)",
        ct_sim_senior: "Mayores de 70",
        ct_sim_family: "Familia",
        ct_sim_family_desc: "2 adultos + 1 o más niños (4-11 años). Cada niño extra se suma al precio base.",
        ct_sim_adults_label: "adultos",
        ct_sim_who: "Tipo de viajero",
        ct_sim_estimate: "Precio Estimado",
        ct_sim_band: "Franja",
        ct_sim_family_base: "Base familia",
        ct_sim_disclaimer: "Precios indicativos basados en tarifas oficiales 2026. El precio real puede variar — consulta la web oficial al momento de la compra.",
        ct_sim_today: "Hoy",
        train_cta: "HORARIOS Y BILLETES",
        explore_also: "Explora también",
        train_desc: "El tren es el medio más rápido. Frecuencia cada 15-20 min entre pueblos.",
        avg_times: "Tiempos Medios", between_villages: "Entre Pueblos", check_site: "Compra y revisa horarios en la web oficial",
        ideal_for: "Ideal para", distance: "Distancia", duration: "Duración", level: "Nivel",

        tech_data: "Datos Técnicos", gps_track: "Ruta GPS",
        elevation_gain: "Desnivel", ascent: "Subida", descent: "Bajada", altitude: "Altitud",
     
    
        chart_label: "Gráfico", close_label: "Cerrar",
  
 
        report_btn: "Reportar", report_title: "Reportar un problema",
        report_closed: "Cerrado / Ya no existe", report_wrong: "Información incorrecta",
        report_blocked: "Sendero bloqueado / Inaccesible", report_other: "Otro",
        report_note_placeholder: "Describe brevemente el problema (opcional)...",
        report_send: "Enviar reporte", report_thanks: "¡Gracias por reportar!",
        report_thanks_sub: "El equipo lo revisará lo antes posible.",
        report_error: "Error al enviar. Inténtalo más tarde.",
        welcome_app_name: "Guía 5 Terre", welcome_desc: "Tu guía esencial para explorar las Cinque Terre.",
        weather_sunny: "Soleado", weather_cloudy: "Nublado", weather_fog: "Niebla",
        weather_rain: "Lluvia", weather_storm: "Tormenta", weather_snow: "Nieve",
        sea_calm: "Calma", sea_rough: "Movido", sea_agitated: "¡Muy agitado!",
        label_humidity: "Humedad", label_sea: "Mar",
        chicco_welcome: "¡Hola, soy Chicco! Soy tu asistente local. ¡Hazme clic para ver el tiempo, trenes y consejos secretos!",
        chicco_bubble_welcome: "¡Bienvenido! Soy Chicco, tu guía. ¡Tócame para info al instante! ✨",
        chicco_bubble_morning: "¡Buongiorno! Tócame para el clima de hoy ☀️",
        chicco_bubble_afternoon: "¡Aquí estás! ¿Necesitas un consejo? Tócame 🍷",
        chicco_bubble_evening: "¡Buonasera! Tócame para los planes de esta noche 🌅",
        ptr_pull: "Desliza para actualizar",
        ptr_release: "Suelta para actualizar",
        ptr_loading: "Actualizando...",
        trivia_1: "¿Lo sabías? El Sciacchetrà es un vino dulce y precioso, hecho con uvas pasas al sol.",
        trivia_2: "¿Por qué el vino aquí es 'heroico'? ¡Porque cultivamos uvas en pendientes imposibles!",
        trivia_3: "Los limones de Cinque Terre son enormes y fragantes. ¿Has probado los productos locales?",
        trivia_4: "Pesto Genovese: Albahaca, piñones, ajo, parmesano, pecorino, aceite y sal.",
        trivia_5: "La Torta Monterossina es un pastel secreto con chocolate, mermelada y crema. ¡Una bomba!",
        trivia_6: "¿Has visto el tren pequeño en los viñedos? A menudo es la única forma de transportar uvas.",
        trivia_7: "En Monterosso hay un Gigante de piedra de 14 metros que sostiene una terraza sobre el mar.",
        trivia_8: "Corniglia es el único pueblo sin mar directo. ¡Para llegar hay 382 escalones o el bus!",
        trivia_9: "Si alineáramos todos los muros de piedra seca de aquí, ¡superaríamos la Muralla China!",
        trivia_10: "Las Cinque Terre son Patrimonio UNESCO desde 1997. ¡Trátalas con cuidado!",
        trivia_11: "Eugenio Montale, premio Nobel, pasaba los veranos aquí y dedicó poemas a Monterosso.",
        trivia_12: "La peli de Disney 'Luca' se inspira en las Cinque Terre. '¡Silenzio Bruno!'",
        trivia_13: "Manarola tiene el Belén Luminoso más grande del mundo, ¡pero solo se enciende en diciembre!",
        trivia_14: "El dialecto local cambia ligeramente de un pueblo a otro, ¡aunque están muy cerca!",
        trivia_15: "¡Psst! No necesitas botas de Everest, pero las chanclas están prohibidas (y son peligrosas).",
        trivia_16: "El Halcón Peregrino anida en nuestros acantilados. ¡Mira hacia arriba de vez en cuando!",
        trivia_17: "Bajo el mar hay un mundo: el Área Marina Protegida está llena de peces y gorgonias.",
        trivia_18: "¿Evitar multitudes? Los senderos altos (hacia los Santuarios) suelen estar vacíos y son bellos.",
        trivia_19: "El sendero de Corniglia a Vernazza se considera uno de los más panorámicos.",
        trivia_20: "Caminar entre viñedos te hace entender lo duro que es trabajar esta tierra. ¡Respeto!",
        trivia_21: "El tren es tu mejor amigo aquí. ¿El coche? ¡Una pesadilla para aparcar!",
        trivia_22: "Recuerda validar tu billete de tren si es de papel, ¡o arriesgas una multa!",
        trivia_23: "El barco es la mejor manera de ver la costa desde el mar. Una perspectiva única.",
        trivia_24: "¡En verano hace calor! Lleva siempre agua y sombrero, y evita las horas más calurosas.",
        trivia_25: "Si hay alerta meteorológica (Naranja/Roja), los senderos se cierran por seguridad.",
        trivia_26: "Disfruta el momento. Guarda el teléfono 5 minutos y escucha el sonido del mar.",
            chicco_map_1: "🍷 ¿Hora del aperitivo? Manarola y Vernazza tienen los mejores atardeceres al mar. ¡Busca aperitivo en la sección Comida!",
            chicco_map_2: "🗺️ ¿Mirando el mapa? Los puntos de colores son lugares que conozco. ¡Tócalos para descubrir más!",
            chicco_map_3: "🌅 La hora dorada en Riomaggiore es alrededor de las 18:30. Perfecta para una copa de Sciacchetrà en el muelle.",
            chicco_map_4: "🍋 Vernazza es el pueblo más fotografiado. El secreto: la mejor vista es desde el sendero sobre el castillo.",
            chicco_map_5: "🚶 Corniglia es el único pueblo sin puerto. Pero tiene la terraza más alta y el mejor helado de limón.",
            chicco_map_6: "⚓ Manarola por la noche se vacía de turistas. Quédate — es el mejor momento para explorar los callejones.",
            chicco_map_7: "🍸 Monterosso tiene la playa más grande. Los bares sirven spritz con vista a la torre medieval.",
            chicco_map_8: "🐟 Los jueves en Riomaggiore hay un mercadillo local. Anchoas, pesto fresco y limoncino artesanal.",
        confirm_clear_title: "¿Estás seguro?", confirm_clear_wishlist: "Todos tus favoritos serán eliminados.",
        confirm_yes: "Sí, limpiar", confirm_no: "Cancelar",
        geo_title: "¿Dónde estás?", geo_desc: "Para mostrarte tu posición y encontrar los lugares más cercanos.",
        geo_privacy: "🔒 Tu ubicación se usa solo ahora y nunca se guarda ni comparte.",
        geo_hint: "Tras pulsar «Permitir», busca la solicitud en la barra del navegador.",
        geo_confirm: "Permitir ubicación", geo_cancel: "Ahora no",
        geo_blocked_title: "Ubicación bloqueada", geo_blocked_msg: "Acceso denegado. Actívalo en los ajustes del navegador.",
        geo_unsupported: "Tu navegador no soporta geolocalización.", geo_ok: "Entendido",
        aria_fav_remove: "Quitar de favoritos", aria_fav_add: "Añadir a favoritos",
        storage_full: "Memoria llena, no se puede guardar. Intenta eliminar algunos favoritos.",
        report_rate_limit: "Demasiados reportes. Espera un minuto."
    },

    zh: {
        loading: "加载中...", error: "错误", search_placeholder: "🔍 搜索餐厅、葡萄酒、徒步路线...", no_results: "无结果。",
        btn_discover: "发现", btn_go: "前往", btn_info: "信息", btn_map: "地图",
        btn_call: "拨打", btn_close_show: "关闭并显示", btn_details: "查看详情",
        label_all: "全部", label_all_fem: "全部",
        cat_culture: "文化", cat_sacred: "圣地", cat_panorama: "全景",
        cat_history: "历史", cat_gastronomy: "美食",
        wine_red: "红葡萄酒", wine_white: "白葡萄酒", wine_passito: "帕赛托甜酒",
        home_title: "欢迎", nav_villages: "主页", nav_food: "美食", nav_outdoor: "户外", nav_services: "服务",
        menu_prod: "特产", menu_rest: "餐厅", menu_trail: "步道", menu_beach: "海滩",
        menu_trans: "交通", menu_num: "常用号码", menu_pharm: "药店", menu_map: "地图", menu_monu: "景点",
        menu_wine: "葡萄酒", menu_legal: "法律声明",
        label_bus: "穿梭巴士", label_ferry: "渡轮", label_train: "火车",
        footer_rights: "版权所有。",
        aperitivo_hint_label: "开胃酒时刻",
        aperitivo_hint_desc: "探索最佳开胃酒地点",
        vino_map_hint_label: "就近购买",
        vino_map_hint_desc: "地图上的酒庄和葡萄酒店",
        spiaggia_map_hint_label: "在地图上查找",
        spiaggia_map_hint_desc: "查看附近的海滩",
        attrazione_map_hint_label: "在地图上查找",
        attrazione_map_hint_desc: "查看景点位置",
        filter_title: "筛选", filter_all: "全部", show_results: "显示结果",
        filter_cat: "类别", filter_village: "村庄",
        wine_type: "类型", wine_grapes: "葡萄品种", wine_pairings: "搭配", wine_deg: "酒精度",
        label_curiosity: "趣闻", desc_missing: "暂无描述。",
        btn_download_gpx: "下载GPX文件", gpx_missing: "无GPS轨迹",
        map_route_title: "路线地图", map_zoom_hint: "使用双指缩放",
        plan_trip: "规划行程", departure: "出发", arrival: "到达",
        date_trip: "日期", time_trip: "时间", find_times: "查询时刻",
        next_runs: "后续班次", next_departure: "下一班出发",
        select_placeholder: "请选择...", select_start: "→ 选择出发地",
        select_arrival_placeholder: "→ 选择到达站",
        valid_destinations: "→  请选择到达站",
        no_runs_today: "今日已无更多班次",
        last_run_day: "今日末班车",
        direction_dir: "方向",
        coast: "海岸",
   
        ticket_info_text: "🎟 <strong>购票处：</strong> 公园咨询点或官方App。<br><span class='opacity-75'>注意：上车可能需补票。渡轮请在码头售票处购票。</span>",
        // ── ZH ──
trail_desc_label: "路线描述",
trail_footer_hint: "提醒：请始终穿合适的鞋子并携带足够的水。",
trail_outdoor_badge: "户外 & 徒步",
trail_duration_label: "时长",
trail_length_label: "长度",
trail_level_label: "难度",
trail_rules_title: "⚠️ 徒步旅行者黄金法则",
trail_rules_intro: "国家公园对所有游客实施严格的安全规定：",
trail_rule_shoes_label: "🥾 强制性鞋类",
trail_rule_shoes_text: "禁止穿人字拖或平底鞋进入步道，违者将面临高额罚款。请穿着登山鞋或防滑运动鞋（Vibram底）。",
trail_rule_weather_label: "⛈️ 天气预警",
trail_rule_weather_text: "在天气预警（黄色、橙色、红色）期间，步道会自动关闭。切勿强行通过。",
trail_rule_water_label: "💧 水和防晒",
trail_rule_water_text: "每人请务必携带至少 1.5 升水。",
trail_sources_title: "🌐 官方来源和地图",
trail_sources_intro: "出发前请在此查看开放步道：",
trail_source1_label: "五渔村公园步道指南",
trail_source2_label: "CAI La Spezia 网站",
        bus_searching: "正在搜索连接...", bus_no_conn: "无连接",
        bus_no_dest: "无目的地", bus_not_found: "未找到班次",
        bus_try_change: "尝试更改时间。",
        ferry_no_corniglia: "科尔尼利亚没有码头——渡轮不在此停靠。请尝试韦尔纳扎或马纳罗拉，最近的村庄！",
        ferry_stop_not_served: "该站点在所选日期没有服务。请尝试更改日期或出发点。", 
        badge_holiday: "📅 节假日", badge_weekday: "🏢 工作日",
        label_warning: "注意",
        how_to_ticket: "如何购票",
        show_map: "显示地图", hide_map: "隐藏地图",
        map_hint: "点击标记以设置出发/到达",
        map_title: "Five2Go 精选",
        map_count_label: "可见",
        ct_cal_showing: "价格分区日历，适用于",
        ct_sim_title: "价格模拟器",
        ct_sim_subtitle: "根据日期和旅客类型，查看五渔村卡的费用。",
        ct_sim_step1: "选择时长",
        ct_sim_step2: "选择开始日期",
        ct_sim_step3: "谁在旅行？",
        ct_sim_day: "天",
        ct_sim_days: "天",
        ct_sim_tap_hint: "点击上方日历中的某一天来选择开始日期。",
        ct_sim_adult: "成人 (12-69)",
        ct_sim_child: "儿童 (4-11)",
        ct_sim_senior: "70岁以上",
        ct_sim_family: "家庭",
        ct_sim_family_desc: "2位成人 + 1位或多位儿童（4-11岁）。每位额外儿童将加到基础价格上。",
        ct_sim_adults_label: "成人",
        ct_sim_who: "旅客类型",
        ct_sim_estimate: "预估价格",
        ct_sim_band: "分区",
        ct_sim_family_base: "家庭基础价",
        ct_sim_disclaimer: "价格基于2026年官方费率，仅供参考。实际价格可能有所不同——购买时请查阅官方网站。",
        ct_sim_today: "今天",
        train_cta: "时刻表与车票",
        explore_also: "探索更多",
        train_desc: "火车是最快的交通方式。村庄间每15-20分钟一班。",
        avg_times: "平均时间", between_villages: "村庄之间", check_site: "在官网购买并检查时刻表",
        ideal_for: "适合", distance: "距离", duration: "时长", level: "难度",
       
        tech_data: "技术数据", gps_track: "GPS轨迹",
        elevation_gain: "海拔差", ascent: "上升", descent: "下降", altitude: "海拔",

        chart_label: "图表", close_label: "关闭",
    
      
        report_btn: "报告", report_title: "报告问题",
        report_closed: "已关闭/不存在", report_wrong: "信息有误",
        report_blocked: "步道封闭/无法通行", report_other: "其他",
        report_note_placeholder: "简要描述问题（可选）...",
        report_send: "发送报告", report_thanks: "感谢您的反馈！",
        report_thanks_sub: "团队将尽快核实。",
        report_error: "发送失败，请稍后重试。",
        welcome_app_name: "五渔村指南", welcome_desc: "探索五渔村的必备指南。",
        weather_sunny: "晴", weather_cloudy: "多云", weather_fog: "雾",
        weather_rain: "雨", weather_storm: "暴风雨", weather_snow: "雪",
        sea_calm: "平静", sea_rough: "有浪", sea_agitated: "巨浪！",
        label_humidity: "湿度", label_sea: "海况",
        chicco_welcome: "你好，我是Chicco！你的本地助手。点击我可以查看精准天气、火车时刻和秘密建议！",
        chicco_bubble_welcome: "欢迎！我是Chicco，你的向导。点我获取即时攻略！✨",
        chicco_bubble_morning: "Buongiorno！点我查看今日天气 ☀️",
        chicco_bubble_afternoon: "你来啦！需要建议吗？点我 🍷",
        chicco_bubble_evening: "Buonasera！点我看今晚安排 🌅",
        ptr_pull: "下拉刷新",
        ptr_release: "松开以刷新",
        ptr_loading: "刷新中...",
        trivia_1: "你知道吗？Sciacchetrà 是一种珍贵的甜酒，由在阳光下晒干的葡萄酿制而成。",
        trivia_2: "为什么这里的葡萄酒被称为'英雄式'？因为我们在极其陡峭的坡地上种植葡萄！",
        trivia_3: "五渔村的柠檬巨大且香气扑鼻。你尝过当地特产了吗？",
        trivia_4: "热那亚青酱：罗勒、松子、大蒜、帕尔马干酪、佩科里诺干酪、橄榄油和盐。",
        trivia_5: "蒙特罗索蛋糕 (Torta Monterossina) 是一种含有巧克力、果酱和奶油的秘密甜点。美味炸弹！",
        trivia_6: "你见过葡萄园里的小火车吗？这通常是运送葡萄下山的唯一方式。",
        trivia_7: "在蒙特罗索，有一个14米高的石巨人支撑着一个海景露台。",
        trivia_8: "科尔尼利亚 (Corniglia) 是唯一不靠海的村庄。到达那里需要走382级台阶或坐巴士！",
        trivia_9: "如果把五渔村所有的干砌石墙连起来，长度会超过中国长城！",
        trivia_10: "五渔村于1997年被列为联合国教科文组织遗产。请爱护它！",
        trivia_11: "诺贝尔奖得主埃乌杰尼奥·蒙塔莱曾在此避暑，并为蒙特罗索写过诗。",
        trivia_12: "迪士尼电影《夏日友晴天》(Luca) 的灵感正是来自五渔村。'Silenzio Bruno!'",
        trivia_13: "马纳罗拉拥有世界上最大的发光耶稣诞生场景，但只在十二月点亮！",
        trivia_14: "尽管村庄相距很近，但当地方言在每个村庄之间都略有不同！",
        trivia_15: "嘘！不需要珠峰登山靴，但步道上严禁穿人字拖（这很危险）。",
        trivia_16: "游隼在我们的悬崖上筑巢。偶尔抬头看看！",
        trivia_17: "海底是另一个世界：海洋保护区充满了鱼类和柳珊瑚。",
        trivia_18: "想避开人群？高处的步道（通往圣所）通常空旷且美丽。",
        trivia_19: "从科尔尼利亚到韦尔纳扎的步道被认为风景最美。",
        trivia_20: "走在葡萄园间，你会明白在这片土地上劳作有多么艰辛。致敬！",
        trivia_21: "火车是你在这里最好的朋友。汽车？找停车位简直是噩梦！",
        trivia_22: "如果是纸质火车票，记得在打票机上验证，否则会面临高额罚款！",
        trivia_23: "渡轮是从海上观赏海岸的最佳方式。视角独特。",
        trivia_24: "夏天很热！如果徒步，请随身带水和帽子，并避开最热的时段。",
        trivia_25: "如果有天气预警（橙色/红色），步道将为了安全而关闭。",
        trivia_26: "享受当下。放下手机5分钟，倾听大海的声音。",
            chicco_map_1: "🍷 开胃酒时间！马纳罗拉和韦尔纳扎有最美的海上日落。在美食板块搜索aperitivo！",
            chicco_map_2: "🗺️ 正在看地图？彩色小点是我知道的好去处。点击它们来发现更多！",
            chicco_map_3: "🌅 里奥马焦雷的黄金时刻在傍晚六点半。在码头喝一杯Sciacchetrà，完美！",
            chicco_map_4: "🍋 韦尔纳扎是拍照最多的小镇。秘密：城堡上方步道才是最好的观景点。",
            chicco_map_5: "🚶 科尔尼利亚是唯一没有港口的村庄，拥有最高的露台和最好吃的柠檬冰淇淋。",
            chicco_map_6: "⚓ 马纳罗拉傍晚游客散去，那才是探索小巷最美的时刻。",
            chicco_map_7: "🍸 蒙泰罗索有最大的海滩，海滨酒吧供应Spritz，可欣赏中世纪塔楼。",
            chicco_map_8: "🐟 每逢周四，里奥马焦雷有本地集市：鳀鱼、新鲜罗勒酱和手工柠檬酒。",
        confirm_clear_title: "确定吗？", confirm_clear_wishlist: "所有收藏将被移除。",
        confirm_yes: "是，清空", confirm_no: "取消",
        geo_title: "你在哪里？", geo_desc: "为了在地图上显示你的位置并找到最近的站点。",
        geo_privacy: "🔒 你的位置仅在此次使用，不会被保存或分享。",
        geo_hint: "点击«允许»后，请在浏览器顶部栏确认请求。",
        geo_confirm: "允许定位", geo_cancel: "暂不",
        geo_blocked_title: "位置被阻止", geo_blocked_msg: "访问被拒绝。请在浏览器设置中启用。",
        geo_unsupported: "你的浏览器不支持地理定位。", geo_ok: "知道了",
        aria_fav_remove: "从收藏中移除", aria_fav_add: "添加到收藏",
        storage_full: "存储空间已满，无法保存。请尝试移除一些收藏。",
        report_rate_limit: "报告过多，请等待一分钟。"
    }
};

// FERRY_STOPS: esposto su window qui per evitare dipendenza dall'ordine di caricamento degli script.
// ui-modal-contents.js lo sovrascrive con la stessa lista (compatibilità mantenuta).
// IDs match ferry_stops.name in Supabase (sort_order ascending)
// Corniglia è inclusa per UX (il turista la cerca) ma il check in
// eseguiRicercaTraghetto mostra un messaggio specifico (no molo).
window.FERRY_STOPS = [
    { id: 'lerici',      label: 'Lerici' },
    { id: 'la_spezia',   label: 'La Spezia' },
    { id: 'portovenere', label: 'Porto Venere' },
    { id: 'riomaggiore', label: 'Riomaggiore' },
    { id: 'manarola',    label: 'Manarola' },
    { id: 'corniglia',   label: 'Corniglia' },
    { id: 'vernazza',    label: 'Vernazza' },
    { id: 'monterosso',  label: 'Monterosso' },
    { id: 'levanto',     label: 'Levanto' }
];

// 5. HELPER FUNCTIONS GLOBALI
window.t = function(key) {
    const langDict = UI_TEXT[window.currentLang] || UI_TEXT['it'];
    return langDict[key] || key;
};

window.dbCol = function(item, field) {
    if (!item || !item[field]) return '';
    let value = item[field];
    if (typeof value === 'object' && value !== null) {
        return value[window.currentLang] || value['it'] || '';
    }
    return value;
};

window.getSmartUrl = function(name, folder = '', width = 600) {
    if (!name) return 'https://via.placeholder.com/600x400?text=No+Image';
    const safeName = encodeURIComponent(name.trim()); 
    const folderPath = folder ? `${folder}/` : '';
    // q_auto:eco: ~30% più leggero rispetto a :good, impercettibile su mobile
    // dpr_1.0: evita di servire immagini 2x su schermi non-retina
    return `${CLOUDINARY_BASE_URL}/w_${width},c_fill,g_auto,f_auto,q_auto:eco,dpr_1.0,fl_progressive/${folderPath}${safeName}`;
};

window.valIT = function(item, field) {
    if (!item || !item[field]) return '';
    let value = item[field];
    if (typeof value === 'object' && value !== null) {
        return value['it'] || '';
    }
    return value;
};

// changeLanguage: definita in app.js (caricato dopo)



function getEasterDate(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; 
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month, day);
}

function isItalianHoliday(dateObj) {
    const d = dateObj.getDate();
    const m = dateObj.getMonth() + 1; 
    const y = dateObj.getFullYear();

    if (dateObj.getDay() === 0) return true;

    const fixedHolidays = ["1-1", "6-1", "25-4", "1-5", "2-6", "15-8", "1-11", "8-12", "25-12", "26-12"];
    if (fixedHolidays.includes(`${d}-${m}`)) return true;

    const easter = getEasterDate(y);
    const pasquetta = new Date(easter);
    pasquetta.setDate(easter.getDate() + 1);

    if (d === pasquetta.getDate() && (m - 1) === pasquetta.getMonth()) return true;
    
    return false;
}



const TRIVIA_KEYS = [
    "trivia_1", "trivia_2", "trivia_3", "trivia_4", "trivia_5", 
    "trivia_6", "trivia_7", "trivia_8", "trivia_9", "trivia_10", 
    "trivia_11", "trivia_12", "trivia_13", "trivia_14", "trivia_15", 
    "trivia_16", "trivia_17", "trivia_18", "trivia_19", "trivia_20", 
    "trivia_21", "trivia_22", "trivia_23", "trivia_24", "trivia_25", "trivia_26"
];

const MAP_CHICCO_KEYS = [
    "chicco_map_1", "chicco_map_2", "chicco_map_3", "chicco_map_4",
    "chicco_map_5", "chicco_map_6", "chicco_map_7", "chicco_map_8"
];

// ── Cache meteo in memoria (TTL 15 minuti) ────────────────────────
// Evita fetch ripetuti ad ogni tap su Chicco nella stessa sessione.
// In caso di errore la cache viene invalidata così al prossimo tap riprova.
let _weatherCache   = null;
let _weatherCacheTs = 0;
const WEATHER_TTL_MS = 15 * 60 * 1000; // 15 minuti

window.getChiccoRealTimeAdvice = async function() {
    try {
        if (!localStorage.getItem('chicco_intro_done')) {
            localStorage.setItem('chicco_intro_done', 'true');
            return {
                type: 'intro',
                weather: "", 
                advice: window.t('chicco_welcome'),
                btnLabel: null
            };
        }

        // Usa la cache se disponibile e fresca (< 15 min)
        const now = Date.now();
        if (!_weatherCache || (now - _weatherCacheTs > WEATHER_TTL_MS)) {
            const response = await fetch(
                "https://api.open-meteo.com/v1/forecast" +
                "?latitude=44.135&longitude=9.683" +
                "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
                "&timezone=auto&models=best_match"
            );
            _weatherCache   = await response.json();
            _weatherCacheTs = now;
        }
        const data = _weatherCache;

        const temp = Math.round(data.current.temperature_2m);
        const hum = Math.round(data.current.relative_humidity_2m);
        const wind = data.current.wind_speed_10m;
        const wmo = data.current.weather_code;

        let seaIcon = "〰️"; 
        let seaKey = "sea_calm"; 
        if (wind > 12 && wind <= 25) { seaIcon = "🌊"; seaKey = "sea_rough"; }
        else if (wind > 25) { seaIcon = "💨"; seaKey = "sea_agitated"; }

        let icon = "🌤️"; 
        let weatherKey = "weather_cloudy"; 
        if (wmo === 0) { icon = "☀️"; weatherKey = "weather_sunny"; }
        else if (wmo >= 1 && wmo <= 3) { icon = "☁️"; weatherKey = "weather_cloudy"; }
        else if (wmo >= 45 && wmo <= 48) { icon = "🌫️"; weatherKey = "weather_fog"; }
        else if (wmo >= 51 && wmo <= 67) { icon = "🌧️"; weatherKey = "weather_rain"; }
        else if (wmo >= 71 && wmo <= 77) { icon = "❄️"; weatherKey = "weather_snow"; }
        else if (wmo >= 80 && wmo <= 99) { icon = "⛈️"; weatherKey = "weather_storm"; }

        const weatherPhrase = `${icon} <b>${window.t(weatherKey)}</b>, ${temp}°C<br>💧 ${window.t('label_humidity')} ${hum}%<br>${seaIcon} ${window.t('label_sea')} ${window.t(seaKey)}`;
        
        // Use map-specific phrases when on the map view
        let adviceText;
        if (window.currentViewName === 'mappa') {
            const mapKey = MAP_CHICCO_KEYS[Math.floor(Math.random() * MAP_CHICCO_KEYS.length)];
            adviceText = window.t(mapKey);
        } else {
            const randomKey = TRIVIA_KEYS[Math.floor(Math.random() * TRIVIA_KEYS.length)];
            adviceText = window.t(randomKey);
        }

        return {
            weather: weatherPhrase,
            advice: adviceText,
            btnLabel: null
        };

    } catch (error) {
        console.error("Errore Meteo:", error);
        // Invalida la cache: al prossimo tap riprova il fetch
        _weatherCache = null;
        return { 
            weather: "😴 ...", 
            advice: window.t('error') || "Ciao!", 
            btnLabel: null 
        };
    }
};

// Fine data-logic.js