console.log("✅ 1. data-logic.js caricato");

// 1. CONFIGURAZIONE SUPABASE
const SUPABASE_URL = 'https://ydrpicezcwtfwdqpihsb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkcnBpY2V6Y3d0ZndkcXBpaHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTQzMDAsImV4cCI6MjA4MzYzMDMwMH0.c89-gAZ8Pgp5Seq89BYRraTG-qqmP03LUCl1KqG9bOg';

// RENDIAMO SUPABASE GLOBALE
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// INIZIALIZZAZIONE CACHE
window.appCache = {};

const CLOUDINARY_CLOUD_NAME = 'dkg0jfady'; 
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;

// 2. VARIABILI GLOBALI
window.mapsToInit = [];
window.tempTransportData = [];
window.tempAttractionsData = [];
window.currentLang = localStorage.getItem('app_lang') || 'it';
window.currentViewName = 'home'; // Tracciamento vista per header

// 3. CONFIGURAZIONE LINGUE
window.AVAILABLE_LANGS = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' }
];

// ==========================================================
// UI-LANGUAGE.JS: DIZIONARIO COMPLETO (Interfaccia + Meteo)
// ==========================================================

const UI_TEXT = {
    it: {
        loading: "Caricamento...", error: "Errore", no_results: "Nessun risultato.",
        // Buttons & Labels Generici
        btn_discover: "Scopri", btn_go: "Vai", btn_info: "Info", btn_map: "Mappa", 
        btn_call: "Chiama", btn_close_show: "Chiudi & Mostra", btn_details: "Vedi Dettagli",
        label_all: "Tutti", label_all_fem: "Tutte", 
        
        // Categorie Attrazioni
        cat_culture: "CULTURA", cat_sacred: "SACRO", cat_panorama: "PANORAMA", 
        cat_history: "STORIA", cat_gastronomy: "GASTRONOMIA",
        
        // Vini
        wine_red: "ROSSO", wine_white: "BIANCO", wine_passito: "PASSITO",
        
        // Menu & Nav
        home_title: "Benvenuto", nav_villages: "Home", nav_food: "Cibo", nav_outdoor: "Outdoor", nav_services: "Servizi",
        menu_prod: "Prodotti", menu_rest: "Ristoranti", menu_trail: "Sentieri", menu_beach: "Spiagge", 
        menu_trans: "Trasporti", menu_num: "Numeri Utili", menu_pharm: "Farmacie", menu_map: "Mappe", menu_monu: "Attrazioni",
        menu_wine: "Vini", menu_legal: "Note Legali",
        
        // NOMI MEZZI
        label_bus: "Bus Navetta", label_ferry: "Battello", label_train: "Treno",
        // Footer
        footer_rights: "Tutti i diritti riservati.",
        // Filtri
        filter_title: "Filtra per", filter_all: "Tutti", show_results: "Mostra Risultati", 
        filter_cat: "Categoria", filter_village: "Borgo",
        // Vini & Schede
        wine_type: "Tipologia", wine_grapes: "Uve", wine_pairings: "Abbinamenti", wine_deg: "Gradi",
        label_curiosity: "Curiosità", desc_missing: "Descrizione non disponibile.",
        // Azioni Generiche
        btn_download_gpx: "Scarica file GPX", gpx_missing: "Traccia GPS non presente",
        map_route_title: "Mappa Percorso", map_zoom_hint: "Usa due dita per zoomare",
        // Trasporti
        plan_trip: "Pianifica Viaggio", departure: "PARTENZA", arrival: "ARRIVO", 
        date_trip: "DATA VIAGGIO", time_trip: "ORARIO", find_times: "TROVA ORARI",
        next_runs: "CORSE SUCCESSIVE", next_departure: "PROSSIMA PARTENZA",
        select_placeholder: "Seleziona...", select_start: "-- Seleziona Partenza --",
        bus_searching: "Cerco collegamenti...", bus_no_conn: "Nessun collegamento", 
        bus_no_dest: "Nessuna destinazione", bus_not_found: "Nessuna corsa trovata",
        bus_try_change: "Prova a cambiare orario.", 
        badge_holiday: "📅 FESTIVO", badge_weekday: "🏢 FERIALE",
        label_warning: "ATTENZIONE",
        how_to_ticket: "COME ACQUISTARE IL BIGLIETTO",
        show_map: "MOSTRA MAPPA", hide_map: "NASCONDI MAPPA",
        map_hint: "Tocca i segnaposto per impostare Partenza/Arrivo",
        train_cta: "ORARI E BIGLIETTI",
        train_desc: "Il treno è il mezzo più veloce. Corse frequenti ogni 15-20 minuti tra i borghi.",
        avg_times: "Tempi Medi", between_villages: "Tra i Borghi", check_site: "Acquista e controlla gli orari sul sito ufficiale",
        ideal_for: "Ideale per", distance: "Distanza", duration: "Durata", level: "Livello",
        welcome_app_name: "5 Terre Guide", welcome_desc: "La tua guida essenziale per esplorare le Cinque Terre.",
        
        // Meteo
        weather_sunny: "Sereno", weather_cloudy: "Nuvoloso", weather_fog: "Foschia", 
        weather_rain: "Pioggia", weather_storm: "Temporale", weather_snow: "Neve",
        sea_calm: "Calmo", sea_rough: "Mosso", sea_agitated: "Agitato!",
        label_humidity: "Umidità", label_sea: "Mare",
        
        // Chicco
        chicco_welcome: "Piacere, sono Chicco! Sono il tuo assistente locale. Cliccami quando vuoi per meteo preciso, orari treni e consigli segreti!",
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
        trivia_26: "Goditi il momento. Metti via il telefono per 5 minuti e ascolta il rumore del mare."
    },
    en: {
        loading: "Loading...", error: "Error", no_results: "No results found.",
        btn_discover: "Discover", btn_go: "Go", btn_info: "Info", btn_map: "Map", 
        btn_call: "Call", btn_close_show: "Close & Show", btn_details: "See Details",
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
        filter_title: "Filter by", filter_all: "All", show_results: "Show Results", 
        filter_cat: "Category", filter_village: "Village",
        wine_type: "Type", wine_grapes: "Grapes", wine_pairings: "Pairings", wine_deg: "Alcohol",
        label_curiosity: "Curiosity", desc_missing: "Description not available.",
        btn_download_gpx: "Download GPX file", gpx_missing: "GPS track not found",
        map_route_title: "Route Map", map_zoom_hint: "Use two fingers to zoom",
        plan_trip: "Plan Trip", departure: "DEPARTURE", arrival: "ARRIVAL", 
        date_trip: "DATE", time_trip: "TIME", find_times: "FIND TIMES",
        next_runs: "NEXT RUNS", next_departure: "NEXT DEPARTURE",
        select_placeholder: "Select...", select_start: "-- Select Departure --",
        bus_searching: "Searching...", bus_no_conn: "No connection", 
        bus_no_dest: "No destination", bus_not_found: "No runs found",
        bus_try_change: "Try changing time.", 
        badge_holiday: "📅 HOLIDAY", badge_weekday: "🏢 WEEKDAY",
        label_warning: "WARNING",
        how_to_ticket: "HOW TO BUY TICKETS",
        show_map: "SHOW MAP", hide_map: "HIDE MAP",
        map_hint: "Tap markers to set Departure/Arrival",
        train_cta: "TIMETABLE & TICKETS",
        train_desc: "The train is the fastest way. Frequent runs every 15-20 mins between villages.",
        avg_times: "Avg Times", between_villages: "Between Villages", check_site: "Buy and check times on the official site",
        ideal_for: "Best for", distance: "Distance", duration: "Duration", level: "Level",
        welcome_app_name: "5 Terre Guide", welcome_desc: "Your essential guide to exploring Cinque Terre.",
        
        weather_sunny: "Sunny", weather_cloudy: "Cloudy", weather_fog: "Foggy", 
        weather_rain: "Rain", weather_storm: "Storm", weather_snow: "Snow",
        sea_calm: "Calm", sea_rough: "Rough", sea_agitated: "Choppy!",
        label_humidity: "Humidity", label_sea: "Sea",

        chicco_welcome: "Hi, I'm Chicco! I'm your local assistant. Click me anytime for precise weather, train times, and secret tips!",
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
        trivia_26: "Enjoy the moment. Put your phone away for 5 minutes and listen to the sea."
    },
    fr: {
        loading: "Chargement...", error: "Erreur", no_results: "Aucun résultat.",
        btn_discover: "Découvrir", btn_go: "Y aller", btn_info: "Infos", btn_map: "Carte", 
        btn_call: "Appeler", btn_close_show: "Fermer & Voir", btn_details: "Voir Détails",
        label_all: "Tous", label_all_fem: "Toutes", 
        
        cat_culture: "CULTURE", cat_sacred: "SACRÉ", cat_panorama: "PANORAMA", 
        cat_history: "HISTOIRE", cat_gastronomy: "GASTRONOMIE",
        
        wine_red: "ROUGE", wine_white: "BLANC", wine_passito: "VIN DE PAILLE",
        
        home_title: "Bienvenue", nav_villages: "Accueil", nav_food: "Gastronomie", nav_outdoor: "Plein Air", nav_services: "Services",
        menu_prod: "Produits", menu_rest: "Restaurants", menu_trail: "Sentiers", menu_beach: "Plages", 
        menu_trans: "Transports", menu_num: "Numéros Utiles", menu_pharm: "Pharmacies", menu_map: "Cartes", menu_monu: "Attractions",
        menu_wine: "Vins", menu_legal: "Mentions Légales",
        
        label_bus: "Navette Bus", label_ferry: "Bateau", label_train: "Train",
        footer_rights: "Tous droits réservés.",
        
        filter_title: "Filtrer par", filter_all: "Tous", show_results: "Afficher Résultats", 
        filter_cat: "Catégorie", filter_village: "Village",
        
        wine_type: "Type", wine_grapes: "Cépages", wine_pairings: "Accords", wine_deg: "Degrés",
        label_curiosity: "Curiosité", desc_missing: "Description non disponible.",
        
        btn_download_gpx: "Télécharger GPX", gpx_missing: "Trace GPS absente",
        map_route_title: "Carte Itinéraire", map_zoom_hint: "Utilisez deux doigts pour zoomer",
        
        plan_trip: "Planifier Trajet", departure: "DÉPART", arrival: "ARRIVÉE", 
        date_trip: "DATE", time_trip: "HEURE", find_times: "TROUVER HORAIRES",
        next_runs: "PROCHAINS DÉPARTS", next_departure: "PROCHAIN DÉPART",
        select_placeholder: "Sélectionner...", select_start: "-- Sélectionner Départ --",
        bus_searching: "Recherche itinéraires...", bus_no_conn: "Aucune connexion", 
        bus_no_dest: "Aucune destination", bus_not_found: "Aucun trajet trouvé",
        bus_try_change: "Essayez de changer l'heure.", 
        badge_holiday: "📅 FÉRIÉ", badge_weekday: "🏢 SEMAINE",
        label_warning: "ATTENTION",
        how_to_ticket: "COMMENT ACHETER UN BILLET",
        show_map: "VOIR CARTE", hide_map: "MASQUER CARTE",
        map_hint: "Touchez les marqueurs pour définir Départ/Arrivée",
        train_cta: "HORAIRES ET BILLETS",
        train_desc: "Le train est le moyen le plus rapide. Départs fréquents toutes les 15-20 min entre les villages.",
        avg_times: "Temps Moyens", between_villages: "Entre les Villages", check_site: "Achetez et vérifiez les horaires sur le site officiel",
        ideal_for: "Idéal pour", distance: "Distance", duration: "Durée", level: "Niveau",
        welcome_app_name: "Guide 5 Terre", welcome_desc: "Votre guide essentiel pour explorer les Cinque Terre.",
        
        weather_sunny: "Ensoleillé", weather_cloudy: "Nuageux", weather_fog: "Brume", 
        weather_rain: "Pluie", weather_storm: "Orage", weather_snow: "Neige",
        sea_calm: "Calme", sea_rough: "Agité", sea_agitated: "Très Agité!",
        label_humidity: "Humidité", label_sea: "Mer",
        
        chicco_welcome: "Salut, je suis Chicco ! Ton assistant local. Clique sur moi pour la météo, les trains et des conseils secrets !",
        trivia_1: "Le savais-tu ? Le Sciacchetrà est un vin doux précieux, produit avec des raisins séchés au soleil.",
        trivia_2: "Pourquoi le vin est-il 'héroïque' ici ? Car nous cultivons le raisin sur des pentes impossibles !",
        trivia_3: "Les citrons des Cinque Terre sont énormes et parfumés. As-tu goûté les produits locaux ?",
        trivia_4: "Pesto Genovese : Basilic, pignons, ail, parmesan, pecorino, huile et sel.",
        trivia_5: "La Torta Monterossina est un gâteau secret au chocolat, confiture et crème. Une tuerie !",
        trivia_6: "As-tu vu le petit train dans les vignes ? C'est souvent le seul moyen de transporter le raisin.",
        trivia_7: "À Monterosso, un Géant de pierre de 14 mètres soutient une terrasse sur la mer.",
        trivia_8: "Corniglia est le seul village qui ne touche pas la mer. 382 marches ou le bus pour y arriver !",
        trivia_9: "Si on alignait tous les murs en pierre sèche des Cinque Terre, on dépasserait la Grande Muraille !",
        trivia_10: "Les Cinque Terre sont au patrimoine UNESCO depuis 1997. Prends-en soin !",
        trivia_11: "Eugenio Montale, prix Nobel, passait ses étés ici et a dédié des poèmes à Monterosso.",
        trivia_12: "Le film Disney 'Luca' est inspiré des villages des Cinque Terre. 'Silenzio Bruno !'",
        trivia_13: "Manarola accueille la plus grande Crèche Lumineuse au monde, mais elle ne s'allume qu'en décembre !",
        trivia_14: "Le dialecte local change légèrement d'un village à l'autre, même s'ils sont très proches !",
        trivia_15: "Psst ! Pas besoin de chaussures d'Everest, mais les tongs sont interdites sur les sentiers.",
        trivia_16: "Le Faucon Pèlerin niche sur nos falaises. Lève les yeux de temps en temps !",
        trivia_17: "Sous la mer, l'Aire Marine Protégée regorge de poissons et de gorgones.",
        trivia_18: "Tu veux éviter la foule ? Les sentiers hauts (vers les Sanctuaires) sont souvent déserts.",
        trivia_19: "Le sentier de Corniglia à Vernazza est considéré comme l'un des plus panoramiques.",
        trivia_20: "Marcher dans les vignes fait comprendre la dureté du travail de cette terre. Respect !",
        trivia_21: "Le train est ton meilleur ami ici. La voiture ? Un cauchemar pour se garer !",
        trivia_22: "N'oublie pas de composter ton billet de train papier, sinon gare à l'amende !",
        trivia_23: "Le bateau est le meilleur moyen de voir la côte depuis la mer. Une perspective unique.",
        trivia_24: "L'été, il fait chaud ! Prends toujours de l'eau et un chapeau pour marcher.",
        trivia_25: "En cas d'alerte météo (Orange/Rouge), les sentiers sont fermés pour sécurité.",
        trivia_26: "Profite du moment. Range ton téléphone 5 minutes et écoute le bruit de la mer."
    },

    // TEDESCO
    de: {
        loading: "Laden...", error: "Fehler", no_results: "Keine Ergebnisse.",
        btn_discover: "Entdecken", btn_go: "Los", btn_info: "Info", btn_map: "Karte", 
        btn_call: "Anrufen", btn_close_show: "Schließen & Zeigen", btn_details: "Details ansehen",
        label_all: "Alle", label_all_fem: "Alle", 
        
        cat_culture: "KULTUR", cat_sacred: "SAKRAL", cat_panorama: "PANORAMA", 
        cat_history: "GESCHICHTE", cat_gastronomy: "GASTRONOMIE",
        
        wine_red: "ROT", wine_white: "WEISS", wine_passito: "STROHWEIN",
        
        home_title: "Willkommen", nav_villages: "Home", nav_food: "Essen", nav_outdoor: "Outdoor", nav_services: "Dienste",
        menu_prod: "Produkte", menu_rest: "Restaurants", menu_trail: "Wanderwege", menu_beach: "Strände", 
        menu_trans: "Verkehrsmittel", menu_num: "Nützliche Nummern", menu_pharm: "Apotheken", menu_map: "Karten", menu_monu: "Attraktionen",
        menu_wine: "Weine", menu_legal: "Rechtliches",
        
        label_bus: "Shuttlebus", label_ferry: "Fähre", label_train: "Zug",
        footer_rights: "Alle Rechte vorbehalten.",
        
        filter_title: "Filtern nach", filter_all: "Alle", show_results: "Ergebnisse anzeigen", 
        filter_cat: "Kategorie", filter_village: "Dorf",
        
        wine_type: "Typ", wine_grapes: "Trauben", wine_pairings: "Paarungen", wine_deg: "Alkoholgehalt",
        label_curiosity: "Kuriosität", desc_missing: "Beschreibung nicht verfügbar.",
        
        btn_download_gpx: "GPX-Datei laden", gpx_missing: "Kein GPS-Track vorhanden",
        map_route_title: "Routenkarte", map_zoom_hint: "Zum Zoomen zwei Finger benutzen",
        
        plan_trip: "Reise planen", departure: "ABFAHRT", arrival: "ANKUNFT", 
        date_trip: "DATUM", time_trip: "UHRZEIT", find_times: "ZEITEN FINDEN",
        next_runs: "NÄCHSTE FAHRTEN", next_departure: "NÄCHSTE ABFAHRT",
        select_placeholder: "Auswählen...", select_start: "-- Start wählen --",
        bus_searching: "Verbindungen suchen...", bus_no_conn: "Keine Verbindung", 
        bus_no_dest: "Kein Ziel", bus_not_found: "Keine Fahrt gefunden",
        bus_try_change: "Versuchen Sie eine andere Zeit.", 
        badge_holiday: "📅 FEIERTAG", badge_weekday: "🏢 WERKTAG",
        label_warning: "ACHTUNG",
        how_to_ticket: "TICKET KAUFEN",
        show_map: "KARTE ZEIGEN", hide_map: "KARTE AUSBLENDEN",
        map_hint: "Tippen Sie auf Marker für Start/Ziel",
        train_cta: "FAHRPLÄNE & TICKETS",
        train_desc: "Der Zug ist am schnellsten. Häufige Fahrten alle 15-20 Min. zwischen den Dörfern.",
        avg_times: "Durchschn. Zeit", between_villages: "Zwischen Dörfern", check_site: "Kaufen & prüfen Sie Zeiten auf der offiziellen Seite",
        ideal_for: "Ideal für", distance: "Distanz", duration: "Dauer", level: "Niveau",
        welcome_app_name: "5 Terre Guide", welcome_desc: "Ihr essentieller Führer für die Cinque Terre.",
        
        weather_sunny: "Sonnig", weather_cloudy: "Bewölkt", weather_fog: "Nebel", 
        weather_rain: "Regen", weather_storm: "Gewitter", weather_snow: "Schnee",
        sea_calm: "Ruhig", sea_rough: "Rau", sea_agitated: "Sehr unruhig!",
        label_humidity: "Feuchtigkeit", label_sea: "Meer",
        
        chicco_welcome: "Hallo, ich bin Chicco! Dein lokaler Assistent. Klick mich für Wetter, Züge und Geheimtipps!",
        trivia_1: "Wusstest du? Sciacchetrà ist ein kostbarer Süßwein aus sonnengetrockneten Trauben.",
        trivia_2: "Warum ist der Wein hier 'heroisch'? Weil wir Trauben an unmöglichen Hängen anbauen!",
        trivia_3: "Die Zitronen der Cinque Terre sind riesig und duftend. Hast du lokale Produkte probiert?",
        trivia_4: "Pesto Genovese: Basilikum, Pinienkerne, Knoblauch, Parmesan, Pecorino, Öl und Salz.",
        trivia_5: "Die Torta Monterossina ist ein süßes Geheimnis mit Schoko, Marmelade und Creme. Lecker!",
        trivia_6: "Schon die Zahnradbahn in den Weinbergen gesehen? Oft der einzige Weg für den Transport.",
        trivia_7: "In Monterosso trägt ein 14 Meter großer Steingigant eine Terrasse über dem Meer.",
        trivia_8: "Corniglia berührt als einziges Dorf nicht das Meer. 382 Stufen oder Bus zur Anreise!",
        trivia_9: "Würde man alle Trockenmauern hier aneinanderreihen, wären sie länger als die Chinesische Mauer!",
        trivia_10: "Die Cinque Terre sind seit 1997 UNESCO-Erbe. Behandle sie mit Sorgfalt!",
        trivia_11: "Nobelpreisträger Eugenio Montale verbrachte hier den Sommer und widmete Monterosso Gedichte.",
        trivia_12: "Der Disney-Film 'Luca' ist von den Cinque Terre inspiriert. 'Silenzio Bruno!'",
        trivia_13: "Manarola beherbergt die größte leuchtende Krippe der Welt, aber nur im Dezember!",
        trivia_14: "Der lokale Dialekt ändert sich von Dorf zu Dorf leicht, obwohl sie so nah sind!",
        trivia_15: "Psst! Keine Bergstiefel nötig, aber Flip-Flops sind auf den Wegen verboten (und gefährlich).",
        trivia_16: "Der Wanderfalke nistet an unseren Klippen. Schau ab und zu nach oben!",
        trivia_17: "Unter dem Meer gibt es eine Welt: Das Schutzgebiet ist voller Fische und Gorgonien.",
        trivia_18: "Massen meiden? Die hohen Wege (zu den Heiligtümern) sind oft menschenleer und schön.",
        trivia_19: "Der Weg von Corniglia nach Vernazza gilt als einer der aussichtsreichsten überhaupt.",
        trivia_20: "Im Weinberg laufen zeigt, wie hart die Arbeit hier ist. Respekt!",
        trivia_21: "Der Zug ist hier dein bester Freund. Das Auto? Ein Parkplatz-Albtraum!",
        trivia_22: "Vergiss nicht, Papiertickets zu entwerten, sonst droht ein hohes Bußgeld!",
        trivia_23: "Die Fähre ist der beste Weg, die Küste vom Meer aus zu sehen. Einmalige Perspektive.",
        trivia_24: "Im Sommer ist es heiß! Nimm Wasser und Hut mit und meide die Mittagshitze.",
        trivia_25: "Bei Wetterwarnung (Orange/Rot) werden die Wege zur Sicherheit gesperrt.",
        trivia_26: "Genieße den Moment. Leg das Handy 5 Minuten weg und lausche dem Meer."
    },

    // SPAGNOLO
    es: {
        loading: "Cargando...", error: "Error", no_results: "Sin resultados.",
        btn_discover: "Descubrir", btn_go: "Ir", btn_info: "Info", btn_map: "Mapa", 
        btn_call: "Llamar", btn_close_show: "Cerrar y Mostrar", btn_details: "Ver Detalles",
        label_all: "Todos", label_all_fem: "Todas", 
        
        cat_culture: "CULTURA", cat_sacred: "SACRO", cat_panorama: "PANORAMA", 
        cat_history: "HISTORIA", cat_gastronomy: "GASTRONOMÍA",
        
        wine_red: "TINTO", wine_white: "BLANCO", wine_passito: "PASSITO",
        
        home_title: "Bienvenido", nav_villages: "Inicio", nav_food: "Comida", nav_outdoor: "Aire Libre", nav_services: "Servicios",
        menu_prod: "Productos", menu_rest: "Restaurantes", menu_trail: "Senderos", menu_beach: "Playas", 
        menu_trans: "Transporte", menu_num: "Números Útiles", menu_pharm: "Farmacias", menu_map: "Mapas", menu_monu: "Atracciones",
        menu_wine: "Vinos", menu_legal: "Nota Legal",
        
        label_bus: "Autobús", label_ferry: "Barco", label_train: "Tren",
        footer_rights: "Todos los derechos reservados.",
        
        filter_title: "Filtrar por", filter_all: "Todos", show_results: "Mostrar Resultados", 
        filter_cat: "Categoría", filter_village: "Pueblo",
        
        wine_type: "Tipo", wine_grapes: "Uvas", wine_pairings: "Maridaje", wine_deg: "Grados",
        label_curiosity: "Curiosidad", desc_missing: "Descripción no disponible.",
        
        btn_download_gpx: "Descargar archivo GPX", gpx_missing: "Ruta GPS no disponible",
        map_route_title: "Mapa de Ruta", map_zoom_hint: "Usa dos dedos para hacer zoom",
        
        plan_trip: "Planificar Viaje", departure: "SALIDA", arrival: "LLEGADA", 
        date_trip: "FECHA", time_trip: "HORA", find_times: "BUSCAR HORARIOS",
        next_runs: "SIGUIENTES VIAJES", next_departure: "PRÓXIMA SALIDA",
        select_placeholder: "Selecciona...", select_start: "-- Selecciona Salida --",
        bus_searching: "Buscando conexiones...", bus_no_conn: "Sin conexión", 
        bus_no_dest: "Sin destino", bus_not_found: "No se encontraron viajes",
        bus_try_change: "Prueba a cambiar la hora.", 
        badge_holiday: "📅 FESTIVO", badge_weekday: "🏢 LABORABLE",
        label_warning: "ATENCIÓN",
        how_to_ticket: "CÓMO COMPRAR EL BOLETO",
        show_map: "VER MAPA", hide_map: "OCULTAR MAPA",
        map_hint: "Toca los marcadores para fijar Salida/Llegada",
        train_cta: "HORARIOS Y BOLETOS",
        train_desc: "El tren es el medio más rápido. Frecuencia cada 15-20 min entre pueblos.",
        avg_times: "Tiempos Medios", between_villages: "Entre Pueblos", check_site: "Compra y revisa horarios en la web oficial",
        ideal_for: "Ideal para", distance: "Distancia", duration: "Duración", level: "Nivel",
        welcome_app_name: "Guía 5 Terre", welcome_desc: "Tu guía esencial para explorar las Cinque Terre.",
        
        weather_sunny: "Soleado", weather_cloudy: "Nublado", weather_fog: "Neblina", 
        weather_rain: "Lluvia", weather_storm: "Tormenta", weather_snow: "Nieve",
        sea_calm: "Calma", sea_rough: "Picado", sea_agitated: "¡Muy Picado!",
        label_humidity: "Humedad", label_sea: "Mar",
        
        chicco_welcome: "¡Hola, soy Chicco! Tu asistente local. ¡Haz clic para ver el clima, trenes y consejos secretos!",
        trivia_1: "¿Sabías qué? El Sciacchetrà es un vino dulce precioso, hecho con uvas pasas al sol.",
        trivia_2: "¿Por qué el vino aquí es 'heroico'? ¡Porque cultivamos uvas en pendientes imposibles!",
        trivia_3: "Los limones de Cinque Terre son enormes y fragantes. ¿Probaste los productos locales?",
        trivia_4: "Pesto Genovese: Albahaca, piñones, ajo, parmesano, pecorino, aceite y sal.",
        trivia_5: "La Torta Monterossina es un dulce secreto con chocolate, mermelada y crema. ¡Una bomba!",
        trivia_6: "¿Has visto el tren entre viñedos? A veces es la única forma de bajar la uva.",
        trivia_7: "En Monterosso hay un Gigante de piedra de 14 metros que sostiene una terraza sobre el mar.",
        trivia_8: "Corniglia es el único pueblo que no toca el mar. ¡382 escalones o bus para llegar!",
        trivia_9: "¡Si alineáramos todos los muros de piedra seca, superarían la Muralla China!",
        trivia_10: "Las Cinque Terre son Patrimonio UNESCO desde 1997. ¡Cuídalas mucho!",
        trivia_11: "Eugenio Montale, premio Nobel, veraneaba aquí y dedicó poemas a Monterosso.",
        trivia_12: "La película de Disney 'Luca' se inspira en las Cinque Terre. '¡Silenzio Bruno!'",
        trivia_13: "Manarola tiene el Pesebre Luminoso más grande del mundo, ¡pero solo se enciende en diciembre!",
        trivia_14: "El dialecto local cambia un poco de un pueblo a otro, ¡aunque están muy cerca!",
        trivia_15: "¡Psst! No necesitas botas de Everest, pero las chanclas están prohibidas en los senderos.",
        trivia_16: "El Halcón Peregrino anida en nuestros acantilados. ¡Mira hacia arriba de vez en cuando!",
        trivia_17: "Bajo el mar hay un mundo: el Área Marina Protegida está llena de peces y gorgonias.",
        trivia_18: "¿Quieres evitar multitudes? Los senderos altos (hacia los Santuarios) suelen estar vacíos.",
        trivia_19: "El sendero de Corniglia a Vernazza es considerado uno de los más panorámicos.",
        trivia_20: "Caminar entre viñedos te hace entender lo duro que es trabajar esta tierra. ¡Respeto!",
        trivia_21: "El tren es tu mejor amigo aquí. ¿El coche? ¡Una pesadilla para aparcar!",
        trivia_22: "Recuerda validar el boleto de tren si es de papel, ¡o arriesgas una multa!",
        trivia_23: "El barco es la mejor manera de ver la costa desde el mar. Una perspectiva única.",
        trivia_24: "¡En verano hace calor! Lleva siempre agua y sombrero si caminas y evita el mediodía.",
        trivia_25: "Si hay alerta meteorológica (Naranja/Roja), los senderos se cierran por seguridad.",
        trivia_26: "Disfruta el momento. Guarda el teléfono 5 minutos y escucha el sonido del mar."
    },

    // CINESE (Semplificato)
    zh: {
        loading: "加载中...", error: "错误", no_results: "无结果。",
        btn_discover: "探索", btn_go: "前往", btn_info: "信息", btn_map: "地图", 
        btn_call: "拨打", btn_close_show: "关闭并显示", btn_details: "查看详情",
        label_all: "全部", label_all_fem: "全部", 
        
        cat_culture: "文化", cat_sacred: "宗教", cat_panorama: "全景", 
        cat_history: "历史", cat_gastronomy: "美食",
        
        wine_red: "红葡萄酒", wine_white: "白葡萄酒", wine_passito: "帕赛托甜酒",
        
        home_title: "欢迎", nav_villages: "主页", nav_food: "美食", nav_outdoor: "户外", nav_services: "服务",
        menu_prod: "特产", menu_rest: "餐厅", menu_trail: "徒步路径", menu_beach: "海滩", 
        menu_trans: "交通", menu_num: "常用号码", menu_pharm: "药房", menu_map: "地图", menu_monu: "景点",
        menu_wine: "葡萄酒", menu_legal: "法律声明",
        
        label_bus: "穿梭巴士", label_ferry: "渡轮", label_train: "火车",
        footer_rights: "版权所有。",
        
        filter_title: "筛选", filter_all: "全部", show_results: "显示结果", 
        filter_cat: "类别", filter_village: "村庄",
        
        wine_type: "类型", wine_grapes: "葡萄品种", wine_pairings: "搭配建议", wine_deg: "酒精度",
        label_curiosity: "趣闻", desc_missing: "暂无描述。",
        
        btn_download_gpx: "下载 GPX 文件", gpx_missing: "无 GPS 轨迹",
        map_route_title: "路线图", map_zoom_hint: "使用双指缩放",
        
        plan_trip: "行程规划", departure: "出发地", arrival: "目的地", 
        date_trip: "日期", time_trip: "时间", find_times: "查找时刻表",
        next_runs: "后续班次", next_departure: "下一班出发",
        select_placeholder: "请选择...", select_start: "-- 选择出发地 --",
        bus_searching: "正在搜索...", bus_no_conn: "无连接", 
        bus_no_dest: "无目的地", bus_not_found: "未找到班次",
        bus_try_change: "请尝试更改时间。", 
        badge_holiday: "📅 节假日", badge_weekday: "🏢 工作日",
        label_warning: "注意",
        how_to_ticket: "如何购票",
        show_map: "显示地图", hide_map: "隐藏地图",
        map_hint: "点击标记以设置起点/终点",
        train_cta: "时刻表与票务",
        train_desc: "火车是最快的方式。村庄间每15-20分钟一班。",
        avg_times: "平均时间", between_villages: "村庄之间", check_site: "在官网购买并检查时刻表",
        ideal_for: "适合", distance: "距离", duration: "时长", level: "难度",
        welcome_app_name: "五渔村指南", welcome_desc: "探索五渔村的必备指南。",
        
        weather_sunny: "晴朗", weather_cloudy: "多云", weather_fog: "雾", 
        weather_rain: "雨", weather_storm: "雷暴", weather_snow: "雪",
        sea_calm: "平静", sea_rough: "有浪", sea_agitated: "巨浪！",
        label_humidity: "湿度", label_sea: "海况",
        
        chicco_welcome: "你好，我是 Chicco！你的本地助手。随时点击我获取天气、火车和秘密建议！",
        trivia_1: "你知道吗？Sciacchetrà 是一种珍贵的甜酒，由晒干的葡萄酿制而成。",
        trivia_2: "这里的葡萄酒为何被称为'英勇'？因为我们在极其陡峭的坡上种植葡萄！",
        trivia_3: "五渔村的柠檬巨大且香气扑鼻。你尝过当地特产了吗？",
        trivia_4: "热那亚青酱：罗勒、松子、大蒜、帕玛森干酪、佩科里诺干酪、油和盐。",
        trivia_5: "蒙特罗索蛋糕是一种含有巧克力、果酱和奶油的秘密甜点。美味炸弹！",
        trivia_6: "见过葡萄园里的小火车吗？这通常是从高处运送葡萄的唯一方式。",
        trivia_7: "在蒙特罗索，有一个14米高的石巨人支撑着海边的露台。",
        trivia_8: "科尔尼利亚是唯一不靠海的村庄。需要爬382级台阶或坐巴士到达！",
        trivia_9: "如果把这里的干石墙连起来，长度会超过中国长城！",
        trivia_10: "五渔村于1997年成为联合国教科文组织遗产。请爱护它！",
        trivia_11: "诺贝尔奖得主 Eugenio Montale 曾在此避暑，并为蒙特罗索写过诗。",
        trivia_12: "迪士尼电影《路卡》灵感正源于五渔村。'Silenzio Bruno!'",
        trivia_13: "马纳罗拉拥有世界上最大的发光耶稣诞生场景，但仅在12月点亮！",
        trivia_14: "尽管村庄相邻，但当地方言略有不同！",
        trivia_15: "嘘！不需要登山靴，但禁止穿人字拖徒步（这很危险）。",
        trivia_16: "游隼在我们的悬崖上筑巢。偶尔抬头看看！",
        trivia_17: "海底有一个世界：海洋保护区充满了鱼类和柳珊瑚。",
        trivia_18: "想避开人群？通往圣所的高处小径通常空旷且美丽。",
        trivia_19: "从科尔尼利亚到韦尔纳扎的小径被认为是风景最美的一条。",
        trivia_20: "在葡萄园间行走会让你明白耕种这片土地有多艰难。致敬！",
        trivia_21: "火车是你在这里最好的朋友。汽车？那是停车的噩梦！",
        trivia_22: "记得在打票机上验证纸质火车票，否则面临高额罚款！",
        trivia_23: "渡轮是从海上欣赏海岸的最佳方式。视角独特。",
        trivia_24: "夏天很热！徒步时请带上水和帽子，避开最热的时段。",
        trivia_25: "如果发布天气预警（橙色/红色），小径将关闭以策安全。",
        trivia_26: "享受当下。放下手机5分钟，倾听大海的声音。"
    }
};


const FERRY_STOPS = [
    { id: 'levanto', label: 'Levanto' },
    { id: 'monterosso', label: 'Monterosso' },
    { id: 'vernazza', label: 'Vernazza' },
    { id: 'corniglia', label: 'Corniglia' },
    { id: 'manarola', label: 'Manarola' },
    { id: 'riomaggiore', label: 'Riomaggiore' },
    { id: 'portovenere', label: 'Portovenere' },
    { id: 'la spezia', label: 'La Spezia' },
    { id: 'lerici', label: 'Lerici' }
];

// 5. HELPER FUNCTIONS GLOBALI
window.t = function(key) {
    const langDict = UI_TEXT[window.currentLang] || UI_TEXT['it'];
    return langDict[key] || key; // Fallback sulla chiave stessa se manca
};

window.dbCol = function(item, field) {
    if (!item || !item[field]) return '';

    let value = item[field];

    // Se Supabase restituisce il JSONB già come oggetto
    if (typeof value === 'object' && value !== null) {
        // Cerca la lingua corrente, altrimenti fallback su italiano, altrimenti stringa vuota
        return value[window.currentLang] || value['it'] || '';
    }

    // Se è ancora una stringa (es. vecchi dati o errore di parsing), la restituisce così com'è
    return value;
};

window.getSmartUrl = function(name, folder = '', width = 600) {
    if (!name) return 'https://via.placeholder.com/600x400?text=No+Image';
    const safeName = encodeURIComponent(name.trim()); 
    const folderPath = folder ? `${folder}/` : '';
    return `${CLOUDINARY_BASE_URL}/w_${width},c_fill,f_auto,q_auto:good,fl_progressive/${folderPath}${safeName}`;
};
// Estrae SEMPRE l'italiano (per i nomi file Cloudinary e Logica) ---
window.valIT = function(item, field) {
    if (!item || !item[field]) return '';
    let value = item[field];
    // Se è un oggetto JSON multilingua, forza 'it'. 
    if (typeof value === 'object' && value !== null) {
        return value['it'] || '';
    }
    // Se è una stringa semplice, assumiamo sia già l'italiano/valore raw
    return value;
};

window.changeLanguage = function(langCode) {
    console.log("Cambio lingua a:", langCode);
    
    window.currentLang = langCode;
    localStorage.setItem('user_lang', langCode);

    // --- NUOVO: RESETTA CHICCO ---
    // Cancelliamo il testo attuale così alla prossima apertura 
    // sarà costretto a ricalcolarlo con la nuova lingua.
    const chiccoText = document.getElementById('chicco-text');
    if (chiccoText) chiccoText.innerHTML = ""; 
    // -----------------------------

    updateStaticInterface();

    if (typeof renderCategory === 'function') {
        const currentCategory = window.currentCategory || 'attrazioni'; 
        renderCategory(currentCategory); 
    } else {
        location.reload(); 
    }
};

// Funzione helper per aggiornare i testi fissi
function updateStaticInterface() {
    const homeTitleEl = document.getElementById('home-title'); 
    if(homeTitleEl) homeTitleEl.textContent = window.t('home_title');

    const navFood = document.getElementById('nav-food');
    if(navFood) navFood.textContent = window.t('nav_food');
    
    // Aggiungi qui altri elementi fissi da aggiornare
}


// Algoritmo di Gauss per calcolare la Pasqua
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
    
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed per JS Date
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    return new Date(year, month, day);
}

// Verifica se è un giorno festivo in Italia
function isItalianHoliday(dateObj) {
    const d = dateObj.getDate();
    const m = dateObj.getMonth() + 1; // 1-12
    const y = dateObj.getFullYear();

    // 1. Domenica
    if (dateObj.getDay() === 0) return true;

    // 2. Festività Fisse
    const fixedHolidays = [
        "1-1",   // Capodanno
        "6-1",   // Epifania
        "25-4",  // Liberazione
        "1-5",   // Festa del Lavoro
        "2-6",   // Festa della Repubblica
        "15-8",  // Ferragosto
        "1-11",  // Ognissanti
        "8-12",  // Immacolata
        "25-12", // Natale
        "26-12"  // Santo Stefano
    ];
    if (fixedHolidays.includes(`${d}-${m}`)) return true;

    // 3. Pasquetta
    const easter = getEasterDate(y);
    const pasquetta = new Date(easter);
    pasquetta.setDate(easter.getDate() + 1);

    if (d === pasquetta.getDate() && (m - 1) === pasquetta.getMonth()) return true;
    
    return false;
}

// Helper per leggere testi multilingua (CORRETTO PER IL TUO SITO)
function getLangText(obj) {
    // 1. Cerca 'user_lang' (la tua variabile) PRIMA di 'language'
    const savedLang = localStorage.getItem('user_lang') || localStorage.getItem('language') || 'it';
    const lang = savedLang.toLowerCase(); 
    
    if (obj) {
        // Se esiste la traduzione esatta (es. obj.en), usala
        if (obj[lang]) return obj[lang];
        // Fallback
        return obj['it'] || obj['en'] || obj.text || "";
    }
    return "";
}
// ==========================================================
// DATA-LOGIC.JS: USA LE CHIAVI DI TRADUZIONE (window.t)
// ==========================================================

// Elenco delle chiavi presenti in ui-language.js
const TRIVIA_KEYS = [
    "trivia_1", "trivia_2", "trivia_3", "trivia_4", "trivia_5", 
    "trivia_6", "trivia_7", "trivia_8", "trivia_9", "trivia_10", 
    "trivia_11", "trivia_12", "trivia_13", "trivia_14", "trivia_15", 
    "trivia_16", "trivia_17", "trivia_18", "trivia_19", "trivia_20", 
    "trivia_21", "trivia_22", "trivia_23", "trivia_24", "trivia_25", "trivia_26"
];

window.getChiccoRealTimeAdvice = async function() {
    try {
        // A. MESSAGGIO DI BENVENUTO
        // Usa la chiave 'chicco_welcome' definita in ui-language.js
        if (!localStorage.getItem('chicco_intro_done')) {
            localStorage.setItem('chicco_intro_done', 'true');
            return {
                type: 'intro',
                weather: "", 
                advice: window.t('chicco_welcome'), // <--- ECCO LA MAGIA
                btnLabel: null
            };
        }

        // B. CHIAMATA API METEO
        const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=44.135&longitude=9.683&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto&models=best_match");
        const data = await response.json();
        
        // C. ESTRAZIONE DATI
        const temp = Math.round(data.current.temperature_2m);
        const hum = Math.round(data.current.relative_humidity_2m);
        const wind = data.current.wind_speed_10m;
        const wmo = data.current.weather_code;

        // D. STATO DEL MARE (Usa le chiavi sea_...)
        let seaIcon = "〰️"; 
        let seaKey = "sea_calm"; 
        if (wind > 12 && wind <= 25) { seaIcon = "🌊"; seaKey = "sea_rough"; }
        else if (wind > 25) { seaIcon = "💨"; seaKey = "sea_agitated"; }

        // E. METEO (Usa le chiavi weather_...)
        let icon = "🌤️"; 
        let weatherKey = "weather_cloudy"; 
        if (wmo === 0) { icon = "☀️"; weatherKey = "weather_sunny"; }
        else if (wmo >= 1 && wmo <= 3) { icon = "☁️"; weatherKey = "weather_cloudy"; }
        else if (wmo >= 45 && wmo <= 48) { icon = "🌫️"; weatherKey = "weather_fog"; }
        else if (wmo >= 51 && wmo <= 67) { icon = "🌧️"; weatherKey = "weather_rain"; }
        else if (wmo >= 71 && wmo <= 77) { icon = "❄️"; weatherKey = "weather_snow"; }
        else if (wmo >= 80 && wmo <= 99) { icon = "⛈️"; weatherKey = "weather_storm"; }

        // F. COSTRUZIONE FRASE METEO
        // window.t() traduce automaticamente in base alla lingua corrente
        const weatherPhrase = `${icon} <b>${window.t(weatherKey)}</b>, ${temp}°C<br>💧 ${window.t('label_humidity')} ${hum}%<br>${seaIcon} ${window.t('label_sea')} ${window.t(seaKey)}`;
        
        // G. CURIOSITÀ CASUALE
        // Prende una chiave a caso (es. "trivia_12") e la traduce
        const randomKey = TRIVIA_KEYS[Math.floor(Math.random() * TRIVIA_KEYS.length)];
        const adviceText = window.t(randomKey);

        return {
            weather: weatherPhrase,
            advice: adviceText,
            btnLabel: null
        };

    } catch (error) {
        console.error("Errore Meteo:", error);
        return { 
            weather: "😴 ...", 
            advice: window.t('error') || "Ciao!", 
            btnLabel: null 
        };
    }
};

// HELPER PER AGGIORNAMENTO LINGUA
// Chiamalo quando l'utente cambia lingua (es. changeLanguage)
window.forceChiccoUpdate = function() {
    const bubble = document.getElementById('chicco-speech');
    if (bubble && bubble.style.display === 'block') {
        // Chiude e riapre per forzare la rilettura di window.t() nella nuova lingua
        window.toggleChicco(); 
        setTimeout(() => window.toggleChicco(), 50); 
    }
};