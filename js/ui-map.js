console.log("✅ ui-map.js caricato (Geo-Dynamic Edition)");

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
const MAP_CENTER    = [44.1030, 9.7290];
const MAP_ZOOM      = 13;
const BORGHI_ORDER  = ["Riomaggiore","Manarola","Corniglia","Vernazza","Monterosso"];
const BORGHI_COORDS = {
    Riomaggiore: [44.0998, 9.7381],
    Manarola:    [44.1069, 9.7283],
    Corniglia:   [44.1209, 9.7146],
    Vernazza:    [44.1351, 9.6843],
    Monterosso:  [44.1460, 9.6551],
};
const BORGHI_BOUNDS = {
    Riomaggiore: [[44.094, 9.730], [44.106, 9.746]],
    Manarola:    [[44.100, 9.720], [44.114, 9.736]],
    Corniglia:   [[44.114, 9.705], [44.128, 9.724]],
    Vernazza:    [[44.128, 9.675], [44.143, 9.694]],
    Monterosso:  [[44.138, 9.645], [44.155, 9.665]],
};

const CATEGORIE = {
    vino:       { emoji:"🍷", label:"Vino",       color:"#C0392B", pill:"bg-red-100 text-red-700 border-red-200",            markerBg:"#FFF0EE", markerBorder:"#E74C3C" },
    aperitivo:  { emoji:"🥂", label:"Aperitivo",  color:"#D97706", pill:"bg-amber-100 text-amber-700 border-amber-200",       markerBg:"#FFFBEB", markerBorder:"#F59E0B" },
    spiaggia:   { emoji:"🏖️", label:"Spiaggia",   color:"#0369A1", pill:"bg-sky-100 text-sky-700 border-sky-200",             markerBg:"#EFF6FF", markerBorder:"#38BDF8" },
    attrazione: { emoji:"🏛️", label:"Attrazioni", color:"#15803D", pill:"bg-emerald-100 text-emerald-700 border-emerald-200", markerBg:"#ECFDF5", markerBorder:"#34D399" },
};
const BORGHI_COLORS = {
    Riomaggiore:"#E76F51", Manarola:"#2A9D8F",
    Corniglia:"#C9A600",   Vernazza:"#264653", Monterosso:"#606C38"
};

// Mock data
const MOCK_DATA = [
    { id:1,  nome:"Cantina Buranco",        borgo:"Monterosso",  categoria:"vino",       lat:44.1465, lon:9.6548, descrizione:"Cantina storica con degustazioni affacciate sul mare." },
    { id:2,  nome:"Il Frantoio",            borgo:"Riomaggiore", categoria:"vino",       lat:44.0995, lon:9.7390, descrizione:"Olio e vino di produzione locale, piccola bottega nel centro storico." },
    { id:3,  nome:"Bar Centrale",           borgo:"Manarola",    categoria:"aperitivo",  lat:44.1072, lon:9.7285, descrizione:"Aperitivo con vista mozzafiato sul porticciolo di Manarola." },
    { id:4,  nome:"Enoteca Internazionale", borgo:"Vernazza",    categoria:"vino",       lat:44.1355, lon:9.6845, descrizione:"Selezione di vini locali e nazionali, taglieri e stuzzichini." },
    { id:5,  nome:"Spiaggia Fegina",        borgo:"Monterosso",  categoria:"spiaggia",   lat:44.1490, lon:9.6520, descrizione:"La spiaggia più grande delle Cinque Terre, attrezzata con lettini." },
    { id:6,  nome:"Spiaggia di Corniglia",  borgo:"Corniglia",   categoria:"spiaggia",   lat:44.1150, lon:9.7200, descrizione:"Spiaggia di ciottoli, acque cristalline e poco affollata." },
    { id:7,  nome:"Torre Aurora",           borgo:"Vernazza",    categoria:"attrazione", lat:44.1358, lon:9.6840, descrizione:"Torre medievale con vista panoramica sul golfo di Vernazza." },
    { id:8,  nome:"Via dell'Amore",         borgo:"Riomaggiore", categoria:"attrazione", lat:44.1010, lon:9.7370, descrizione:"Il sentiero romantico che collega Riomaggiore a Manarola." },
    { id:9,  nome:"Bar Il Porticciolo",     borgo:"Riomaggiore", categoria:"aperitivo",  lat:44.1000, lon:9.7385, descrizione:"Aperitivo sul mare, ottimi cocktail e focaccia." },
    { id:10, nome:"Punta Bonfiglio",        borgo:"Manarola",    categoria:"attrazione", lat:44.1060, lon:9.7270, descrizione:"Terrazza panoramica naturale, tramonto imperdibile." },
    { id:11, nome:"Bar Matteo",             borgo:"Corniglia",   categoria:"aperitivo",  lat:44.1210, lon:9.7148, descrizione:"Aperitivo tranquillo nel borgo più silenzioso delle Cinque Terre." },
    { id:12, nome:"Spiaggia Guvano",        borgo:"Corniglia",   categoria:"spiaggia",   lat:44.1180, lon:9.7130, descrizione:"Spiaggia selvaggia raggiungibile a piedi, acque turchesi." },
];

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------
(function injectMapStyles() {
    if (document.getElementById('map-custom-styles')) return;
    const s = document.createElement('style');
    s.id = 'map-custom-styles';
    s.textContent = `
        #map-leaflet .leaflet-control-attribution { display:none !important; }
        #map-leaflet .leaflet-control-zoom {
            border:none !important;
            box-shadow:0 4px 20px rgba(0,0,0,0.12) !important;
            border-radius:16px !important; overflow:hidden;
            margin-right:12px !important; margin-bottom:12px !important;
        }
        #map-leaflet .leaflet-control-zoom a {
            width:36px !important; height:36px !important; line-height:36px !important;
            font-size:18px !important; font-weight:800 !important;
            color:#264653 !important; background:white !important; border:none !important;
        }
        #map-leaflet .leaflet-control-zoom a:hover { background:#F4F1DE !important; }

        /* Pin marker */
        .map-pin-wrap { display:flex; flex-direction:column; align-items:center; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.25)); }
        .map-pin-head {
            width:40px; height:40px; border-radius:50% 50% 50% 4px;
            transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; border:2.5px solid;
        }
        .map-pin-emoji { transform:rotate(45deg); font-size:18px; line-height:1; }
        .map-pin-tail  { width:3px; height:6px; border-radius:0 0 3px 3px; margin-top:-1px; opacity:0.5; }

        /* Bottom sheet draggable */
        #map-sheet {
            position: fixed;
            left: 0; right: 0;
            bottom: 76px;          /* sopra la navbar */
            z-index: 1000;
            touch-action: none;
            will-change: transform;
            transition: transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        #map-sheet.is-dragging { transition: none; }
        #map-sheet-inner {
            background: white;
            border-radius: 28px 28px 0 0;
            box-shadow: 0 -8px 40px rgba(0,0,0,0.18);
            overflow: hidden;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        #map-sheet-handle-bar {
            display: flex; justify-content: center; padding: 10px 0 6px;
            cursor: grab; flex-shrink: 0;
        }
        #map-sheet-handle-bar::after {
            content: ''; width: 36px; height: 4px;
            background: #cbd5e1; border-radius: 2px;
        }
        #map-sheet-list { overflow-y:auto; flex:1; padding: 0 16px 24px; }
        #map-sheet-list::-webkit-scrollbar { display:none; }

        /* Chip + cat toggle */
        .borgo-chip, .cat-toggle { transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        .borgo-chip.active, .cat-toggle.active { transform:scale(1.06); }

        /* Slide-up sheet detail */
        @keyframes slideUpSheet {
            from { opacity:0; transform:translateY(12px) scale(0.98); }
            to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .sheet-detail-enter { animation: slideUpSheet 0.25s cubic-bezier(0.2,0.8,0.2,1) forwards; }

        /* Badge count */
        .map-count-badge {
            display:inline-flex; align-items:center; justify-content:center;
            min-width:20px; height:20px; padding:0 6px;
            border-radius:10px; font-size:10px; font-weight:800;
            background:#E76F51; color:white; margin-left:6px;
        }
        .place-card { transition:transform 0.12s ease; }
        .place-card:active { transform:scale(0.98); }

        /* ── GPS ── */
        .gps-user-dot {
            width: 18px; height: 18px;
            background: #2196F3;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(33,150,243,0.5);
            position: relative;
        }
        .gps-user-dot::after {
            content: '';
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            background: rgba(33,150,243,0.2);
            animation: gpsPulse 1.8s ease-out infinite;
        }
        @keyframes gpsPulse {
            0%   { transform: scale(1);   opacity: 0.6; }
            100% { transform: scale(2.4); opacity: 0;   }
        }
        #map-gps-btn {
            transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        #map-gps-btn.gps-searching {
            background: #F59E0B !important;
            color: white !important;
        }
        #map-gps-btn.gps-active {
            background: #2196F3 !important;
            color: white !important;
            box-shadow: 0 0 0 4px rgba(33,150,243,0.2);
        }
        @keyframes spinCW {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
        }
        .spin-anim { animation: spinCW 1s linear infinite; display:inline-block; }

        /* Separatore borgo nella lista */
        .borgo-separator {
            display:flex; align-items:center; gap:8px;
            padding: 12px 0 6px;
        }
        .borgo-separator-dot {
            width:10px; height:10px; border-radius:50%; flex-shrink:0;
        }
        .borgo-separator-line {
            flex:1; height:1px; background:#e2e8f0;
        }

        /* Sheet slide-out when detail is open */
        #map-sheet {
            transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #map-sheet.sheet-hidden {
            transform: translateY(110%) !important;
            pointer-events: none;
        }

        /* Detail banner full redesign */
        #map-detail-sheet {
            transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1),
                        opacity 0.25s ease;
        }
        #map-detail-sheet.detail-entering {
            animation: detailSlideUp 0.32s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes detailSlideUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0);    }
        }
    `;
    document.head.appendChild(s);
})();

// ---------------------------------------------------------------------------
// STATO GLOBALE
// ---------------------------------------------------------------------------
window._mapLeaflet      = null;
window._mapMarkers      = [];
window._mapAllData      = [];
window._mapActiveCat    = 'Tutte';

// Bottom sheet stato: 'peek' | 'half' | 'full'
window._sheetState      = 'peek';
window._sheetSnapPeek   = 0;    // calcolati dopo mount
window._sheetSnapHalf   = 0;
window._sheetSnapFull   = 0;

// GPS tracking state
window._gpsWatchId      = null;   // ID del watchPosition
window._gpsUserMarker   = null;   // Marker pulsante sulla mappa
window._gpsAccCircle    = null;   // Cerchio accuratezza
window._gpsLatLng       = null;   // Ultima posizione nota {lat, lng}

// ---------------------------------------------------------------------------
// RENDER PRINCIPALE
// ---------------------------------------------------------------------------
window.renderMappaInterattiva = async function() {
    const content = document.getElementById('app-content');
    if (!content) return;

    // Blocca padding-bottom di app-content durante la mappa
    content.style.paddingBottom = '0';

    // Reset always to 'Tutte' — pre-filter (if any) is applied after init
    window._mapActiveCat = 'Tutte';

    await window._mapLoadData();

    content.innerHTML = `
    <!-- WRAPPER a tutto schermo -->
    <div id="mappa-root" style="position:relative; height:calc(100vh - 80px); overflow:hidden;">

        <!-- ── HEADER FILTRI (sempre visibile sopra la mappa) ── -->
        <div id="map-header"
            style="position:absolute; top:0; left:0; right:0; z-index:500;"
            class="bg-gradient-to-br from-[#1a6e64] via-ct-blue to-[#0e5a52] px-4 pt-4 pb-9 overflow-hidden">

            <!-- Bolle deco -->
            <div class="absolute inset-0 pointer-events-none overflow-hidden">
                <div class="absolute -top-6 -right-6 w-36 h-36 rounded-full bg-white/5"></div>
                <div class="absolute -bottom-4 left-4 w-24 h-24 rounded-full bg-ct-terracotta/15"></div>
                <div class="absolute top-3 left-1/2 w-3 h-3 rounded-full bg-ct-yellow/70"></div>
                <svg class="absolute bottom-0 left-0 right-0 w-full h-8" viewBox="0 0 400 32" preserveAspectRatio="none">
                    <path d="M0,16 C60,0 120,32 180,16 C240,0 300,32 360,16 L400,16 L400,32 L0,32 Z" fill="rgba(255,255,255,0.07)"/>
                </svg>
            </div>

            <!-- Titolo -->
            <div class="relative z-10 flex items-start justify-between mb-3">
                <div>
                    <div class="flex items-center gap-2 mb-0.5">
                        <span class="text-xl leading-none">🗺️</span>
                        <h1 class="font-serif text-xl font-bold text-white tracking-tight drop-shadow-sm">Esplora i Borghi</h1>
                    </div>
                    <p class="text-white/60 text-[11px] font-medium pl-1">
                        <span id="map-result-count" class="font-black text-white">0</span>&nbsp;posti in vista
                    </p>
                </div>
            </div>

            <!-- Chip borghi: fly-to, NON filtrano la lista -->
            <div class="relative z-10 flex gap-2 overflow-x-auto no-scrollbar">
                <button data-borgo="Tutti"
                    class="borgo-chip active flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold bg-white text-slate-700 shadow-md border-2 border-white"
                    onclick="window.mapFlyTo('Tutti', this)">
                    🌊 Tutti
                </button>
                ${BORGHI_ORDER.map(b => {
                    const col = BORGHI_COLORS[b] || '#264653';
                    return `<button data-borgo="${b}"
                        class="borgo-chip flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold bg-white/20 text-white border-2 border-white/25 backdrop-blur"
                        onclick="window.mapFlyTo('${b}', this)">
                        <span class="w-2 h-2 rounded-full flex-shrink-0" style="background:${col}"></span>
                        ${b}
                    </button>`;
                }).join('')}
            </div>

            <!-- Cat toggle -->
            <div class="relative z-10 mt-2.5 flex gap-1.5 overflow-x-auto no-scrollbar">
                <button data-cat="Tutte"
                    class="cat-toggle active flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-800 text-white border-2 border-transparent"
                    onclick="window.mapSetCat('Tutte', this)">
                    ✨ Tutte
                </button>
                ${Object.entries(CATEGORIE).map(([key,cfg]) => `
                <button data-cat="${key}"
                    class="cat-toggle flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white/20 border-2 border-white/20 text-white backdrop-blur"
                    onclick="window.mapSetCat('${key}', this)">
                    ${cfg.emoji} ${cfg.label}
                </button>`).join('')}
            </div>
        </div>

        <!-- ── MAPPA (occupa tutto lo spazio) ── -->
        <div id="map-leaflet"
            style="position:absolute; top:0; left:0; right:0; bottom:80px; z-index:100;">
        </div>

        <!-- Badge LIVE: bottom-right della mappa, sopra i controlli zoom -->
        <div id="map-live-badge"
            style="position:absolute; z-index:600; pointer-events:none; bottom:16px; right:12px;"
            class="flex items-center gap-1.5 bg-white/95 backdrop-blur rounded-full px-2.5 py-1 shadow-md border border-slate-100">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
            <span class="text-[11px] font-black text-slate-700 uppercase tracking-widest">Live</span>
        </div>

        <!-- Controlli bottom-left: GPS + Legenda in riga, ancorati sopra il peek del sheet -->
        <div style="position:absolute; z-index:600; bottom:96px; left:12px; display:flex; gap:8px; align-items:center;">

            <!-- GPS -->
            <button id="map-gps-btn"
                onclick="window.mapToggleGPS()"
                class="flex items-center gap-1.5 bg-white/95 backdrop-blur rounded-full pl-2.5 pr-3 py-1.5 shadow-md border border-slate-100 active:scale-95 transition-transform"
                title="Mostra posizione GPS">
                <span class="material-icons text-slate-600 text-sm" id="map-gps-icon">my_location</span>
                <span class="text-[11px] font-black text-slate-600 uppercase tracking-widest" id="map-gps-label">GPS</span>
            </button>

            <!-- Legenda -->
            <button id="map-legend-btn"
                onclick="window.mapToggleLegend()"
                class="flex items-center gap-1.5 bg-white/95 backdrop-blur rounded-full pl-2.5 pr-3 py-1.5 shadow-md border border-slate-100 active:scale-95 transition-transform">
                <span class="material-icons text-slate-600 text-sm">info_outline</span>
                <span class="text-[11px] font-black text-slate-600 uppercase tracking-widest">Legenda</span>
            </button>
        </div>

        <!-- Legenda pannello (posizionato separatamente per non creare overflow issues) -->
        <div id="map-legend-wrap"
            style="position:absolute; z-index:600; bottom:132px; left:12px;">
            <!-- Bottone toggle invisibile — usato solo per il pannello espanso -->
            <button id="map-legend-btn-ghost" style="display:none;"></button>
            <!-- Pannello espanso (nascosto di default) -->
            <div id="map-legend-panel"
                class="hidden absolute bottom-0 left-0 bg-white/97 backdrop-blur rounded-2xl shadow-xl border border-slate-100 p-3 min-w-[140px]"
                style="animation: slideUpSheet 0.2s cubic-bezier(0.2,0.8,0.2,1) forwards;">
                ${Object.entries(CATEGORIE).map(([k,c]) => `
                <div class="flex items-center gap-2 py-1">
                    <span class="text-base leading-none">${c.emoji}</span>
                    <span class="text-xs font-bold text-slate-700">${c.label}</span>
                    <span class="ml-auto w-3 h-3 rounded-full flex-shrink-0 border-2"
                        style="background:${c.markerBg}; border-color:${c.markerBorder};"></span>
                </div>`).join('')}
            </div>
        </div>

        <!-- ── BOTTOM SHEET draggabile ── -->
        <div id="map-sheet">
            <div id="map-sheet-inner">
                <!-- Handle drag -->
                <div id="map-sheet-handle-bar"></div>

                <!-- Header sheet -->
                <div class="px-4 pb-2 flex items-center justify-between flex-shrink-0">
                    <h2 class="font-serif text-base font-bold text-slate-800">
                        In vista
                        <span id="list-count-badge" class="map-count-badge">0</span>
                    </h2>
                    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest select-none">
                        ↑ apri lista
                    </span>
                </div>

                <!-- Lista geo-dinamica -->
                <div id="map-sheet-list"></div>
            </div>
        </div>

        <!-- ── Detail Banner (rimpiazza la lista quando si seleziona un luogo) ── -->
        <div id="map-detail-sheet"
            class="hidden"
            style="position:fixed; bottom:80px; left:0; right:0; z-index:1100; padding:0 12px;">

            <!-- Card banner -->
            <div id="map-detail-card"
                class="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden relative">

                <!-- Barra colore top -->
                <div id="map-detail-color-bar" class="h-1 w-full"></div>

                <div class="flex items-stretch">

                    <!-- Colonna emoji/categoria -->
                    <div id="map-detail-side"
                        class="w-16 flex-shrink-0 flex items-center justify-center text-3xl">
                    </div>

                    <!-- Contenuto principale -->
                    <div class="flex-1 px-4 py-3.5 min-w-0">
                        <div id="map-detail-badges" class="flex flex-wrap gap-1.5 mb-1.5"></div>
                        <h3 id="map-detail-title"
                            class="font-serif text-lg font-bold text-slate-800 leading-tight truncate"></h3>
                        <p id="map-detail-desc"
                            class="text-slate-400 text-[11px] leading-snug mt-0.5 line-clamp-2"></p>
                        <!-- Meta row: indirizzo / orari -->
                        <div id="map-detail-meta" class="flex items-center gap-3 mt-1.5"></div>
                    </div>

                    <!-- Colonna azioni -->
                    <div class="flex flex-col items-center justify-center gap-2 px-3 py-3 flex-shrink-0">
                        <!-- Dettagli (apre modal) -->
                        <button id="map-detail-cta"
                            class="flex flex-col items-center justify-center gap-1 bg-ct-terracotta text-white w-14 h-12 rounded-2xl shadow-md active:scale-90 transition-transform">
                            <span class="material-icons text-base">info</span>
                            <span class="text-[9px] font-bold uppercase tracking-wide leading-none">Dettagli</span>
                        </button>
                        <!-- Naviga (Google Maps) -->
                        <button id="map-detail-navigate"
                            class="flex flex-col items-center justify-center gap-1 bg-ct-blue text-white w-14 h-12 rounded-2xl shadow-md active:scale-90 transition-transform">
                            <span class="material-icons text-base">directions</span>
                            <span class="text-[9px] font-bold uppercase tracking-wide leading-none">Naviga</span>
                        </button>
                        <!-- Chiudi -->
                        <button onclick="window.mapCloseDetail()"
                            class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 active:scale-90 transition-transform">
                            <span class="material-icons text-slate-400 text-sm">close</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>

    </div>
    `;

    await window._mapInit();
    window._sheetInit();

    // Apply pre-filter if set (e.g. coming from aperitivo shortcut)
    if (window._mapPreFilter) {
        const cat = window._mapPreFilter;
        window._mapPreFilter = null; // consume — don't re-apply on next open
        // Simulate a cat-toggle button click once DOM is ready
        requestAnimationFrame(() => {
            const btn = document.querySelector(`.cat-toggle[data-cat="${cat}"]`);
            if (btn) {
                window.mapSetCat(cat, btn);
            } else {
                // Fallback: set directly without button highlight
                window._mapActiveCat = cat;
                window._mapRenderMarkers();
                window._mapUpdateListFromBounds();
            }
        });
    }
};

// ---------------------------------------------------------------------------
// LEAFLET INIT
// ---------------------------------------------------------------------------
window._mapInit = async function() {
    if (window._mapLeaflet) { window._mapLeaflet.remove(); window._mapLeaflet = null; }
    const mapEl = document.getElementById('map-leaflet');
    if (!mapEl) return;

    // Sposta mappa sotto l'header e limita al di sopra del sheet peek
    const header  = document.getElementById('map-header');
    const headerH = header ? header.offsetHeight : 160;
    mapEl.style.top    = headerH + 'px';
    // bottom già fissato a 80px nell'HTML (sheet peek); lo confermiamo via JS
    // così fitBounds/flyToBounds terrà conto dell'area realmente visibile
    mapEl.style.bottom = '80px';

    const map = L.map('map-leaflet', {
        zoomControl: false, attributionControl: false,
        scrollWheelZoom: true, tap: true,
    }).setView(MAP_CENTER, MAP_ZOOM);

    window._mapLeaflet = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom:19, subdomains:'abcd'
    }).addTo(map);

    // Zoom controls dentro la mappa visibile, margine dal basso
    L.control.zoom({ position:'bottomright' }).addTo(map);

    // Render iniziale marker
    window._mapRenderMarkers();

    // ── EVENTO CHIAVE: aggiorna lista quando la mappa si muove ──
    map.on('moveend zoomend', () => {
        window._mapUpdateListFromBounds();
    });

    // Chiudi detail al click sulla mappa e ripristina lista
    map.on('click', () => {
        window.mapCloseDetail();
    });

    setTimeout(() => {
        map.invalidateSize();
        window._mapUpdateListFromBounds();
        // Auto-start GPS silently — fires only if user grants permission
        window.mapToggleGPS(true);
    }, 200);
};

// ---------------------------------------------------------------------------
// CARICAMENTO DATI
// ---------------------------------------------------------------------------
window._mapLoadData = async function() {
    if (window._mapAllData && window._mapAllData.length > 0) return;
    try {
        const { data, error } = await window.supabaseClient.from('Luoghi_mappa').select('*');
        if (error) throw error;
        window._mapAllData = data || [];
        console.log(`✅ Luoghi_mappa: ${window._mapAllData.length} posti caricati`);
    } catch(err) {
        console.error("❌ Supabase errore Luoghi_mappa:", err.message);
        window._mapAllData = [];
    }
};

// ---------------------------------------------------------------------------
// MARKER (tutti, filtrati solo per categoria)
// ---------------------------------------------------------------------------
window._mapRenderMarkers = function() {
    const map = window._mapLeaflet;
    if (!map) return;

    window._mapMarkers.forEach(m => map.removeLayer(m));
    window._mapMarkers = [];

    const cat = window._mapActiveCat;
    const toShow = window._mapAllData.filter(item =>
        cat === 'Tutte' || item.categoria === cat
    );

    toShow.forEach(item => {
        const cfg  = CATEGORIE[item.categoria] || CATEGORIE.attrazione;
        const icon = L.divIcon({
            className: '',
            html: `<div class="map-pin-wrap">
                <div class="map-pin-head" style="background:${cfg.markerBg}; border-color:${cfg.markerBorder};">
                    <span class="map-pin-emoji">${cfg.emoji}</span>
                </div>
                <div class="map-pin-tail" style="background:${cfg.markerBorder};"></div>
            </div>`,
            iconSize:[40,52], iconAnchor:[20,52], popupAnchor:[0,-54],
        });
        const marker = L.marker([item.lat, item.lon], { icon, zIndexOffset:400 }).addTo(map);
        marker.on('click', e => {
            L.DomEvent.stopPropagation(e);
            window._sheetHide();
            window.mapOpenDetail(item);
        });
        window._mapMarkers.push(marker);
    });
};

// ---------------------------------------------------------------------------
// AGGIORNA LISTA IN BASE AI BOUNDS CORRENTI
// ---------------------------------------------------------------------------
window._mapUpdateListFromBounds = function() {
    const map = window._mapLeaflet;
    if (!map) return;

    const bounds = map.getBounds();
    const cat    = window._mapActiveCat;

    // Filtra per visibilità geografica + categoria attiva
    const visible = window._mapAllData.filter(item => {
        const inBounds = bounds.contains(L.latLng(item.lat, item.lon));
        const inCat    = cat === 'Tutte' || item.categoria === cat;
        return inBounds && inCat;
    });

    // Aggiorna contatore header
    const rc = document.getElementById('map-result-count');
    const cb = document.getElementById('list-count-badge');
    if (rc) rc.textContent = visible.length;
    if (cb) cb.textContent = visible.length;

    // Raggruppa per borgo mantenendo l'ordine geografico N→S
    const grouped = {};
    BORGHI_ORDER.forEach(b => { grouped[b] = []; });
    visible.forEach(item => {
        if (grouped[item.borgo]) grouped[item.borgo].push(item);
        else grouped[item.borgo] = [item];
    });

    const listEl = document.getElementById('map-sheet-list');
    if (!listEl) return;

    if (visible.length === 0) {
        listEl.innerHTML = `
        <div class="py-10 text-center">
            <div class="text-4xl mb-2">🌊</div>
            <p class="font-serif text-slate-500 font-bold text-sm">Nessun posto in questa area</p>
            <p class="text-xs text-slate-400 mt-1">Sposta o dezoom la mappa</p>
        </div>`;
        return;
    }

    let html = '';
    BORGHI_ORDER.forEach(borgo => {
        const items = grouped[borgo];
        if (!items || items.length === 0) return;
        const borgCol = BORGHI_COLORS[borgo] || '#264653';

        // Separatore borgo
        html += `
        <div class="borgo-separator">
            <span class="borgo-separator-dot" style="background:${borgCol}"></span>
            <span class="text-[11px] font-black uppercase tracking-widest" style="color:${borgCol}">${borgo}</span>
            <div class="borgo-separator-line"></div>
            <span class="text-[11px] font-bold text-slate-400">${items.length}</span>
        </div>`;

        // Card per ogni posto
        items.forEach((item, i) => {
            const cfg = CATEGORIE[item.categoria] || CATEGORIE.attrazione;
            html += `
            <div class="place-card bg-white rounded-[1.25rem] border border-slate-100 shadow-soft overflow-hidden cursor-pointer flex mb-2"
                style="animation: popIn 0.3s ${i * 0.04}s cubic-bezier(0.2,0.8,0.2,1) both;"
                onclick="window.mapFocusItem(${item.id})">
                <div class="w-1.5 flex-shrink-0 rounded-l-[1.25rem]"
                    style="background:linear-gradient(to bottom, ${cfg.markerBorder}, ${cfg.color}80);"></div>
                <div class="flex items-center justify-center w-12 flex-shrink-0 py-3.5" style="background:${cfg.markerBg};">
                    <span class="text-xl">${cfg.emoji}</span>
                </div>
                <div class="flex-1 px-3 py-3 min-w-0">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">${cfg.label}</span>
                    <h3 class="font-serif font-bold text-slate-800 text-sm leading-tight truncate">${item.nome}</h3>
                    ${item.descrizione ? `<p class="text-[11px] text-slate-400 line-clamp-1 mt-0.5">${item.descrizione}</p>` : ''}
                </div>
                <div class="flex items-center pr-3 pl-1 flex-shrink-0">
                    <span class="material-icons text-slate-300 text-base">chevron_right</span>
                </div>
            </div>`;
        });
    });

    listEl.innerHTML = html;
};

// ---------------------------------------------------------------------------
// BOTTOM SHEET — DRAG & SNAP
// ---------------------------------------------------------------------------
window._sheetInit = function() {
    const sheet     = document.getElementById('map-sheet');
    const handleBar = document.getElementById('map-sheet-handle-bar');
    if (!sheet || !handleBar) return;

    // Calcola altezze snap in base alla viewport
    const viewH     = window.innerHeight;
    const navH      = 76;   // navbar
    const available = viewH - navH;

    // peek: solo handle + header lista visibile (80px)
    // half: metà schermo (~40%)
    // full: quasi tutto (~85%)
    window._sheetSnapPeek = available - 80;
    window._sheetSnapHalf = available * 0.55;
    window._sheetSnapFull = available * 0.12;

    // Imposta altezza fissa del sheet
    sheet.style.height = available + 'px';

    // Posizione iniziale: peek
    window._sheetSetSnap('peek', false);

    // ── TOUCH DRAG ──
    let startY    = 0;
    let startTr   = 0;
    let currentTr = window._sheetSnapPeek;

    function getTr() {
        const t = sheet.style.transform;
        const m = t.match(/translateY\(([0-9.]+)px\)/);
        return m ? parseFloat(m[1]) : currentTr;
    }

    handleBar.addEventListener('touchstart', e => {
        startY  = e.touches[0].clientY;
        startTr = getTr();
        sheet.classList.add('is-dragging');
    }, { passive:true });

    handleBar.addEventListener('touchmove', e => {
        const dy  = e.touches[0].clientY - startY;
        const newTr = Math.max(window._sheetSnapFull, Math.min(window._sheetSnapPeek, startTr + dy));
        sheet.style.transform = `translateY(${newTr}px)`;
    }, { passive:true });

    handleBar.addEventListener('touchend', e => {
        sheet.classList.remove('is-dragging');
        const tr   = getTr();
        const midPH = (window._sheetSnapPeek + window._sheetSnapHalf) / 2;
        const midHF = (window._sheetSnapHalf + window._sheetSnapFull) / 2;

        if (tr > midPH)       window._sheetSetSnap('peek');
        else if (tr > midHF)  window._sheetSetSnap('half');
        else                  window._sheetSetSnap('full');
    }, { passive:true });

    // ── MOUSE DRAG (desktop) ──
    handleBar.addEventListener('mousedown', e => {
        startY  = e.clientY;
        startTr = getTr();
        sheet.classList.add('is-dragging');

        const onMove = ev => {
            const dy    = ev.clientY - startY;
            const newTr = Math.max(window._sheetSnapFull, Math.min(window._sheetSnapPeek, startTr + dy));
            sheet.style.transform = `translateY(${newTr}px)`;
        };
        const onUp = () => {
            sheet.classList.remove('is-dragging');
            const tr   = getTr();
            const midPH = (window._sheetSnapPeek + window._sheetSnapHalf) / 2;
            const midHF = (window._sheetSnapHalf + window._sheetSnapFull) / 2;
            if (tr > midPH)       window._sheetSetSnap('peek');
            else if (tr > midHF)  window._sheetSetSnap('half');
            else                  window._sheetSetSnap('full');
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
};

window._sheetSetSnap = function(snap, animate = true) {
    const sheet = document.getElementById('map-sheet');
    if (!sheet) return;
    window._sheetState = snap;
    const tr = {
        peek: window._sheetSnapPeek,
        half: window._sheetSnapHalf,
        full: window._sheetSnapFull,
    }[snap] ?? window._sheetSnapPeek;

    if (!animate) sheet.style.transition = 'none';
    sheet.style.transform = `translateY(${tr}px)`;
    if (!animate) setTimeout(() => sheet.style.transition = '', 50);

    // Aggiusta padding mappa in base allo snap
    const map = window._mapLeaflet;
    if (map) setTimeout(() => map.invalidateSize(), 350);
};

// Slide il list sheet fuori dallo schermo (verso il basso)
window._sheetHide = function() {
    const sheet = document.getElementById('map-sheet');
    if (!sheet) return;
    sheet.classList.add('sheet-hidden');
};

// Ripristina il list sheet alla posizione peek
window._sheetShow = function() {
    const sheet = document.getElementById('map-sheet');
    if (!sheet) return;
    sheet.classList.remove('sheet-hidden');
    // Forza snap peek per avere una posizione pulita
    window._sheetSetSnap('peek');
};

// ---------------------------------------------------------------------------
// NAVIGAZIONE
// ---------------------------------------------------------------------------


// ─── Map toast helper ───────────────────────────────────────────────────
function _showMapToast(msg) {
    const root = document.getElementById('mappa-root');
    if (!root) return;
    const old = root.querySelector('#map-fly-toast');
    if (old) old.remove();
    const toast = document.createElement('div');
    toast.id = 'map-fly-toast';
    Object.assign(toast.style, {
        position:      'absolute',
        top:           '50%',
        left:          '50%',
        transform:     'translate(-50%, -50%)',
        zIndex:        '700',
        background:    'rgba(38,70,83,0.88)',
        backdropFilter:'blur(8px)',
        color:         'white',
        padding:       '10px 22px',
        borderRadius:  '50px',
        fontSize:      '13px',
        fontWeight:    '800',
        letterSpacing: '0.04em',
        pointerEvents: 'none',
        boxShadow:     '0 4px 20px rgba(0,0,0,0.25)',
        transition:    'opacity 0.35s ease',
    });
    toast.textContent = msg;
    root.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; }, 1100);
    setTimeout(() => toast.remove(), 1500);
}

// Chip borgo → fly-to (non filtra)
window.mapFlyTo = function(borgo, btnEl) {
    // Stile chip
    document.querySelectorAll('.borgo-chip').forEach(b => {
        b.classList.remove('active','bg-white','text-slate-700','border-white','shadow-md');
        b.classList.add('bg-white/20','text-white','border-white/25','backdrop-blur');
    });
    btnEl.classList.add('active','bg-white','text-slate-700','border-white','shadow-md');
    btnEl.classList.remove('bg-white/20','text-white','border-white/25','backdrop-blur');

    // ── Visual feedback during flyTo ──
    const toastLabel = borgo === 'Tutti' ? '🌊 Tutti i borghi' : `📍 ${borgo}`;
    _showMapToast(toastLabel);

    const map = window._mapLeaflet;
    if (!map) return;

    if (borgo === 'Tutti') {
        // Fit-bounds su tutti i marker
        const all = window._mapAllData;
        if (all.length > 0) {
            const group = L.featureGroup(all.map(d => L.marker([d.lat, d.lon])));
            map.flyToBounds(group.getBounds(), { paddingTopLeft:[60,60], paddingBottomRight:[60,20], maxZoom:14, duration:0.7 });
        }
    } else if (BORGHI_BOUNDS[borgo]) {
        map.flyToBounds(BORGHI_BOUNDS[borgo], { paddingTopLeft:[30,30], paddingBottomRight:[30,20], duration:0.7 });
    } else if (BORGHI_COORDS[borgo]) {
        map.flyTo(BORGHI_COORDS[borgo], 15, { duration:0.7 });
    }
};

// Filtro categoria → ri-renderizza marker e aggiorna lista
window.mapSetCat = function(cat, btnEl) {
    window._mapActiveCat = cat;
    const cfg = CATEGORIE[cat] || null;

    document.querySelectorAll('.cat-toggle').forEach(b => {
        b.classList.remove('active','text-white','border-transparent');
        b.style.background = '';
        b.classList.add('bg-white/20','border-white/20','text-white');
    });
    btnEl.classList.add('active','text-white','border-transparent');
    btnEl.classList.remove('bg-white/20','border-white/20','text-white');
    btnEl.style.background = cfg ? cfg.color : '#1e293b';

    window.mapCloseDetail();
    window._mapRenderMarkers();
    window._mapUpdateListFromBounds();
};

// Tap su card lista → nascondi sheet, vola al marker, apri detail
window.mapFocusItem = function(id) {
    const item = window._mapAllData.find(d => d.id === id);
    if (!item || !window._mapLeaflet) return;

    // 1. Nascondi subito il list sheet con animazione
    window._sheetHide();

    // 2. FlyTo con feedback toast
    _showMapToast('📍 ' + item.nome);
    window._mapLeaflet.flyTo([item.lat, item.lon], 16, { duration: 0.6 });

    // 3. Mostra il detail banner dopo il volo
    setTimeout(() => window.mapOpenDetail(item), 550);
};

// ---------------------------------------------------------------------------
// DETAIL BANNER (tap marker o card lista)
// ---------------------------------------------------------------------------
window.mapOpenDetail = function(item) {
    const sheet    = document.getElementById('map-detail-sheet');
    const colorBar = document.getElementById('map-detail-color-bar');
    const sideEl   = document.getElementById('map-detail-side');
    const badgesEl = document.getElementById('map-detail-badges');
    const titleEl  = document.getElementById('map-detail-title');
    const descEl   = document.getElementById('map-detail-desc');
    const metaEl   = document.getElementById('map-detail-meta');
    const ctaBtn   = document.getElementById('map-detail-cta');
    if (!sheet) return;

    const cfg     = CATEGORIE[item.categoria] || CATEGORIE.attrazione;
    const borgCol = BORGHI_COLORS[item.borgo] || '#264653';

    // Color bar gradient
    if (colorBar) colorBar.style.background =
        `linear-gradient(90deg, ${cfg.markerBorder}, ${cfg.color})`;

    // Side emoji block
    if (sideEl) {
        sideEl.textContent  = cfg.emoji;
        sideEl.style.background = cfg.markerBg;
    }

    // Badges: borgo + categoria
    if (badgesEl) badgesEl.innerHTML = `
        <span class="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
            style="color:${borgCol}; background:${borgCol}18; border:1px solid ${borgCol}30;">
            📍 ${item.borgo}
        </span>
        <span class="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.pill}">
            ${cfg.emoji} ${cfg.label}
        </span>`;

    // Title
    if (titleEl) titleEl.textContent = item.nome;

    // Description (short)
    if (descEl) {
        descEl.textContent  = item.descrizione || '';
        descEl.style.display = item.descrizione ? '' : 'none';
    }

    // Meta row: indirizzo + orari
    if (metaEl) {
        let metaHtml = '';
        if (item.indirizzo) metaHtml += `
            <span class="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <span class="material-icons text-xs">place</span>${item.indirizzo}
            </span>`;
        if (item.orari) metaHtml += `
            <span class="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <span class="material-icons text-xs">schedule</span>${item.orari}
            </span>`;
        metaEl.innerHTML = metaHtml;
        metaEl.style.display = metaHtml ? '' : 'none';
    }

    // CTA → apre il modal completo
    if (ctaBtn) {
        ctaBtn.onclick = () => {
            const safePayload = encodeURIComponent(JSON.stringify(item)).replace(/'/g, '%27');
            window.openModal('luogo_mappa', safePayload);
        };
    }

    // Naviga → apre Google/Apple Maps con destinazione preimpostata
    const navBtn = document.getElementById('map-detail-navigate');
    if (navBtn) {
        navBtn.onclick = () => {
            const dest = `${item.lat},${item.lon}`;
            let url;
            if (window._gpsLatLng) {
                // GPS attivo: route precisa da posizione corrente
                const orig = `${window._gpsLatLng.lat},${window._gpsLatLng.lng}`;
                url = `https://www.google.com/maps/dir/${orig}/${dest}`;
            } else {
                // GPS non attivo: Maps userà la posizione del dispositivo
                url = `https://www.google.com/maps/dir//${dest}`;
            }
            window.open(url, '_blank');
        };
    }

    // Nascondi list sheet se ancora visibile
    window._sheetHide();

    // Mostra detail con animazione
    sheet.classList.remove('hidden');
    const card = document.getElementById('map-detail-card');
    if (card) {
        card.classList.remove('detail-entering');
        void card.offsetWidth; // reflow
        card.classList.add('detail-entering');
    }

    // Store item reference for potential re-open
    window._mapDetailItem = item;
};

// ---------------------------------------------------------------------------
// GPS TRACKING
// ---------------------------------------------------------------------------
window.mapToggleGPS = function(autoStart = false) {
    const map   = window._mapLeaflet;
    const btn   = document.getElementById('map-gps-btn');
    const icon  = document.getElementById('map-gps-icon');
    const label = document.getElementById('map-gps-label');
    if (!map) return;

    // ── Se GPS già attivo e non è auto-start → spegnilo ──────────────────
    const isTracking = window.GeoTracker && window.GeoTracker._isTracking('mappa');
    if (!autoStart && isTracking) {
        window.GeoTracker.stop('mappa');
        window._gpsLatLng = null;
        if (window._gpsUserMarker) { map.removeLayer(window._gpsUserMarker); window._gpsUserMarker = null; }
        if (window._gpsAccCircle)  { map.removeLayer(window._gpsAccCircle);  window._gpsAccCircle  = null; }
        if (btn)   { btn.classList.remove('gps-active', 'gps-searching'); }
        if (icon)  { icon.textContent = 'my_location'; icon.classList.remove('spin-anim'); }
        if (label) { label.textContent = 'GPS'; }
        _showMapToast('📍 GPS disattivato');
        return;
    }

    if (!navigator.geolocation) { _showMapToast('⚠️ GPS non supportato'); return; }

    // ── Richiede il permesso tramite il modal branded condiviso ──────────
    // _requestGeoPermission è definita in app.js ed è disponibile globalmente.
    // Mostra il modal branded se il permesso non è ancora stato concesso,
    // oppure parte direttamente se era già stato concesso in precedenza.
    window._requestGeoPermission(
        () => {
            // Permesso concesso → stato "ricerca in corso"
            if (btn)   { btn.classList.add('gps-searching'); }
            if (icon)  { icon.textContent = 'sync'; icon.classList.add('spin-anim'); }
            if (label) { label.textContent = 'Cerco...'; }

            window.GeoTracker.start('mappa', ({ lat, lng, accuracy, isFirst }) => {
                window._gpsLatLng = { lat, lng };

                if (window._gpsUserMarker) map.removeLayer(window._gpsUserMarker);
                if (window._gpsAccCircle)  map.removeLayer(window._gpsAccCircle);

                const dotIcon = L.divIcon({
                    className: '',
                    html: '<div class="gps-user-dot"></div>',
                    iconSize: [18, 18], iconAnchor: [9, 9],
                });
                window._gpsUserMarker = L.marker([lat, lng], {
                    icon: dotIcon, zIndexOffset: 1000, interactive: true,
                }).addTo(map);
                window._gpsUserMarker.on('click', () => {
                    _showMapToast(`📡 Precisione: ±${Math.round(accuracy)}m`);
                });

                // Accuracy circle — radius from raw fix, position from smoothed
                window._gpsAccCircle = L.circle([lat, lng], {
                    radius: accuracy, color: '#2196F3', fillColor: '#2196F3',
                    fillOpacity: 0.07, weight: 1.5, opacity: 0.35,
                }).addTo(map);

                if (isFirst) {
                    map.flyTo([lat, lng], 16, { duration: 0.8 });
                    _showMapToast('📡 Posizione trovata!');
                }

                if (btn)   { btn.classList.remove('gps-searching'); btn.classList.add('gps-active'); }
                if (icon)  { icon.textContent = 'my_location'; icon.classList.remove('spin-anim'); }
                if (label) { label.textContent = 'Attivo'; }
            });
        },
        () => {
            // Permesso negato/rifiutato → ripristina bottone
            if (btn)   { btn.classList.remove('gps-searching', 'gps-active'); }
            if (icon)  { icon.textContent = 'my_location'; icon.classList.remove('spin-anim'); }
            if (label) { label.textContent = 'GPS'; }
        }
    );
};

window.mapToggleLegend = function() {
    const panel = document.getElementById('map-legend-panel');
    if (!panel) return;
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        // chiude automaticamente dopo 4s
        clearTimeout(window._legendTimer);
        window._legendTimer = setTimeout(() => panel.classList.add('hidden'), 4000);
    } else {
        panel.classList.add('hidden');
    }
};

window.mapCloseDetail = function() {
    const sheet = document.getElementById('map-detail-sheet');
    if (sheet) sheet.classList.add('hidden');
    // Ripristina il list sheet
    window._sheetShow();
};

// Cleanup quando si lascia la vista
const _origSwitchView = window.switchView;
if (_origSwitchView) {
    window.switchView = async function(view, el) {
        if (view !== 'mappa') {
            // Stop GPS watch → evita drain batteria
            if (window._gpsWatchId !== null) {
                navigator.geolocation.clearWatch(window._gpsWatchId);
                window._gpsWatchId = null;
                window._gpsLatLng  = null;
            }
            window._gpsUserMarker = null;
            window._gpsAccCircle  = null;

            // Ripristina padding-bottom di app-content
            const content = document.getElementById('app-content');
            if (content) content.style.paddingBottom = '';
            // Distruggi mappa per evitare memory leak
            if (window.GeoTracker) window.GeoTracker.stop('mappa');
            if (window._mapLeaflet) { window._mapLeaflet.remove(); window._mapLeaflet = null; }
            window._mapAllData = []; // forza reload al prossimo accesso
        }
        return _origSwitchView(view, el);
    };
}