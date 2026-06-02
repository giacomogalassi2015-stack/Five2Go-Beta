// ═══════════════════════════════════════════════════════════════════════════
//  ui-map.js — MAPPA INTERATTIVA FULLSCREEN (PRIMARIO)
//
//  La vista "Mappa" dell'app: una mappa Leaflet fullscreen con tutti i punti
//  di interesse delle Cinque Terre (spiagge, attrazioni) come marker colorati.
//
//  FUNZIONALITÀ:
//    - Marker categorizzati per tipo (spiaggia=blu, attrazione=verde)
//    - Filtri per borgo (5 pill in alto) e categoria (spiaggia/attrazione)
//    - Cluster automatico dei marker vicini
//    - Popup card al tap su un marker (con bottone "Dettagli" → apre modale)
//    - Posizione GPS dell'utente (cerchio blu pulsante)
//    - Chicco mascotte anche sulla mappa
//    - Fly-to automatico quando si arriva dalla card di un luogo specifico
//    - Bottone "indietro" per tornare alla vista precedente
//
//  ARCHITETTURA:
//    renderMappaInterattiva() → crea il contenitore fullscreen fixed
//    _initMap()               → inizializza Leaflet, carica dati da Supabase (tabella Luoghi_mappa)
//    _renderMarkers()         → crea i marker filtrati
//    _buildPopupCard()        → genera l'HTML del popup al tap
//    _updateFilterUI()        → aggiorna i contatori nei filtri
//
//  DIPENDENZE:
//    data-logic.js → window.supabaseClient (tabella Luoghi_mappa),
//                    window.t(), window.dbCol(), window.getSmartUrl()
//    app.js        → window.mapGoBack() per il bottone indietro
//    app.js        → window._mapFlyToTarget per il fly-to da una card
//    app.js        → GeoTracker per la posizione GPS
//    ui-modal.js   → openModal() per aprire i dettagli dal popup
//    Leaflet.js    → L.map, L.marker, L.tileLayer (CDN)
//
//  USATO DA:
//    app.js → _VIEW_RENDERERS.mappa chiama window.renderMappaInterattiva()
// ═══════════════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────────
//  CONFIGURAZIONE MAPPA
//  Coordinate dei 5 borghi, zoom iniziale, categorie con colori/icone
// ───────────────────────────────────────────────────────────────────────
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
    spiaggia:   { icon:"beach_access",   label:"Spiaggia",   color:"#0369A1", pill:"bg-sky-100 text-sky-700 border-sky-200",            markerBg:"#EFF6FF", markerBorder:"#38BDF8" },
    attrazione: { icon:"account_balance",label:"Attrazioni", color:"#15803D", pill:"bg-emerald-100 text-emerald-700 border-emerald-200", markerBg:"#ECFDF5", markerBorder:"#34D399" },
};

const BORGHI_COLORS = {
    Riomaggiore:"#E76F51", Manarola:"#2A9D8F",
    Corniglia:"#C9A600",   Vernazza:"#264653", Monterosso:"#606C38"
};

// Mock data (fallback se Supabase non risponde)
const MOCK_DATA = [
    { id:1,  nome:"Spiaggia Fegina",        borgo:"Monterosso",  categoria:"spiaggia",   lat:44.1490, lon:9.6520, descrizione:"La spiaggia più grande delle Cinque Terre." },
    { id:2,  nome:"Spiaggia di Corniglia",  borgo:"Corniglia",   categoria:"spiaggia",   lat:44.1150, lon:9.7200, descrizione:"Spiaggia di ciottoli, acque cristalline." },
    { id:3,  nome:"Torre Aurora",           borgo:"Vernazza",    categoria:"attrazione", lat:44.1358, lon:9.6840, descrizione:"Torre medievale con vista sul golfo." },
    { id:4,  nome:"Via dell'Amore",         borgo:"Riomaggiore", categoria:"attrazione", lat:44.1010, lon:9.7370, descrizione:"Il sentiero romantico tra Riomaggiore e Manarola." },
    { id:5,  nome:"Punta Bonfiglio",        borgo:"Manarola",    categoria:"attrazione", lat:44.1060, lon:9.7270, descrizione:"Terrazza panoramica, tramonto imperdibile." },
    { id:6,  nome:"Spiaggia Guvano",        borgo:"Corniglia",   categoria:"spiaggia",   lat:44.1180, lon:9.7130, descrizione:"Spiaggia selvaggia, acque turchesi." },
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
            width:40px !important; height:40px !important; line-height:40px !important;
            font-size:18px !important; font-weight:800 !important;
            color:#264653 !important; background:rgba(255,255,255,0.95) !important;
            backdrop-filter:blur(12px) !important; border:none !important;
        }
        #map-leaflet .leaflet-control-zoom a:hover { background:white !important; }

        /* ── Marker dot compatto (stile Apple Maps) ──
           Cerchio colorato con icona categoria. Nessun testo sulla mappa
           per evitare sovrapposizione con i label delle vie.
           Al tap → detail card in basso con tutte le info. */
        .map-dot-marker {
            width:30px; height:30px; border-radius:50%;
            display:flex; align-items:center; justify-content:center;
            border:2.5px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06);
            cursor:pointer;
            transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
        }
        .map-dot-marker:hover, .map-dot-marker:active {
            transform:scale(1.25);
            box-shadow:0 4px 16px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.8);
        }
        .map-dot-marker .material-icons {
            font-size:14px; color:white; line-height:1;
            filter:drop-shadow(0 1px 1px rgba(0,0,0,0.2));
        }

        /* ── Chip scroll containers — lock vertical scroll ── */
        .chip-scroll-row {
            display:flex; gap:8px;
            overflow-x:auto; overflow-y:hidden;
            -webkit-overflow-scrolling:touch;
            touch-action: pan-x;          /* BLOCCA scroll verticale sulle chip */
            overscroll-behavior-x: contain; /* non propaga alla mappa */
            scrollbar-width:none;
            margin:0 -16px; padding:0 16px;
            /* Fade edges */
            mask-image: linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 24px), transparent 100%);
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 24px), transparent 100%);
        }
        .chip-scroll-row::-webkit-scrollbar { display:none; }

        /* ── Vignette overlay — incornicia la mappa ── */
        #map-vignette {
            position:absolute; inset:0; z-index:150;
            pointer-events:none;
            background:
                radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.06) 100%);
            mix-blend-mode:multiply;
        }

        /* ── Bottom controls — unified pill bar ── */
        #map-bottom-bar {
            position:absolute; z-index:600;
            bottom:16px; left:50%; transform:translateX(-50%);
            display:flex; align-items:center; gap:1px;
            background:rgba(255,255,255,0.92);
            backdrop-filter:blur(16px) saturate(160%);
            -webkit-backdrop-filter:blur(16px) saturate(160%);
            border-radius:50px;
            box-shadow:0 4px 24px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06);
            border:1px solid rgba(255,255,255,0.6);
            padding:4px;
            transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        #map-bottom-bar button {
            display:flex; align-items:center; justify-content:center; gap:4px;
            padding:8px 14px; border-radius:50px; border:none;
            background:transparent; cursor:pointer;
            font-size:11px; font-weight:800; color:#475569;
            text-transform:uppercase; letter-spacing:0.06em;
            transition:all 0.2s ease;
            -webkit-tap-highlight-color:transparent;
        }
        #map-bottom-bar button:active { transform:scale(0.92); }
        #map-bottom-bar button.bar-active {
            background:#264653; color:white;
            box-shadow:0 2px 8px rgba(38,70,83,0.3);
        }
        #map-bottom-bar .material-icons { font-size:16px; }

        /* ── Bottom sheet ── */
        #map-sheet {
            position: fixed;
            left: 0; right: 0;
            bottom: 0;
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

// Bottom sheet stato: 'open' | 'closed'
window._sheetState      = 'closed';

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
    <div id="mappa-root" style="position:fixed; inset:0; z-index:40; overflow:hidden; background:#F5F1E1;">

        <!-- ══════════════════════════════════════════════════════
             MAP HEADER — Teal gradient con profondità marina
             Il teal scuro (#264653) è il colore brand principale,
             richiama il mare delle Cinque Terre e crea contrasto
             ottimale con chip glass e testo bianco (WCAG AAA).
             ══════════════════════════════════════════════════════ -->
        <div id="map-header" style="position:absolute; top:0; left:0; right:0; z-index:600;">

            <!-- Sfondo: gradiente teal con depth e un accento caldo -->
            <div style="position:absolute; inset:0;
                        background: linear-gradient(165deg, #1a3a42 0%, #264653 40%, #2A5260 75%, #2d6b5e 100%);
                        box-shadow: 0 2px 8px rgba(0,0,0,0.12), 0 12px 32px rgba(38,70,83,0.25);
                        overflow:hidden;">
                <!-- Bagliore sottile in alto a destra — effetto luce naturale -->
                <div style="position:absolute; top:-30px; right:-20px; width:140px; height:140px;
                            border-radius:50%; background:radial-gradient(circle, rgba(233,196,106,0.12) 0%, transparent 70%);
                            pointer-events:none;"></div>
                <!-- Onda sottile al bordo inferiore -->
                <svg style="position:absolute; bottom:0; left:0; right:0; height:6px;" viewBox="0 0 400 6" preserveAspectRatio="none">
                    <path d="M0,3 C80,0 160,6 240,3 C320,0 400,6 400,3 L400,6 L0,6 Z" fill="rgba(255,255,255,0.06)"/>
                </svg>
            </div>

            <!-- Contenuto header -->
            <div style="position:relative; z-index:1; padding: env(safe-area-inset-top, 12px) 16px 12px 16px;">

                <!-- Riga top: back + titolo + counter -->
                <div class="flex items-center gap-3 mb-3">
                    <button id="map-back-btn" onclick="window.mapGoBack()"
                        class="flex items-center justify-center w-9 h-9 rounded-xl active:scale-90 transition-all flex-shrink-0"
                        style="background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.15);
                               -webkit-tap-highlight-color:transparent; backdrop-filter:blur(8px);">
                        <span class="material-icons text-white" style="font-size:20px;">arrow_back</span>
                    </button>
                    <div class="flex-1 min-w-0">
                        <h1 class="font-serif text-[17px] font-bold text-white tracking-tight leading-none drop-shadow-sm">${window.t('map_title')}</h1>
                        <p class="text-[11px] font-semibold mt-1 leading-none" style="color:rgba(255,255,255,0.55);">
                            <span id="map-result-count" class="font-black" style="color:#E9C46A;">0</span> ${window.t('map_count_label')}
                        </p>
                    </div>
                </div>

                <!-- Borgo chips — scroll orizzontale bloccato verticalmente -->
                <div class="chip-scroll-row">
                    <button data-borgo="Tutti"
                        class="borgo-chip active flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold bg-white text-slate-800 shadow-md border border-white/50"
                        onclick="window.mapFlyTo('Tutti', this)">
                         Tutti
                    </button>
                    ${BORGHI_ORDER.map(b => {
                        const col = BORGHI_COLORS[b] || '#264653';
                        return `<button data-borgo="${b}"
                            class="borgo-chip flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold text-white border border-white/15"
                            style="background:rgba(255,255,255,0.10); backdrop-filter:blur(8px);"
                            onclick="window.mapFlyTo('${b}', this)">
                            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:${col}; box-shadow:0 0 6px ${col}88;"></span>
                            ${b}
                        </button>`;
                    }).join('')}
                </div>

                <!-- Category toggles — scroll orizzontale bloccato verticalmente -->
                <div class="chip-scroll-row mt-2" style="gap:6px;">
                    <button data-cat="Tutte"
                        class="cat-toggle active flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white border border-transparent shadow-sm"
                        style="background:#E76F51;"
                        onclick="window.mapSetCat('Tutte', this)">
                         Tutte
                    </button>
                    ${Object.entries(CATEGORIE).map(([key,cfg]) => `
                    <button data-cat="${key}"
                        class="cat-toggle flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white/80 border border-white/15"
                        style="background:rgba(255,255,255,0.10); backdrop-filter:blur(8px);"
                        onclick="window.mapSetCat('${key}', this)">
                        <span class="material-icons text-[13px] leading-none" style="color:${cfg.color}; filter:brightness(1.3);">${cfg.icon}</span> ${cfg.label}
                    </button>`).join('')}
                </div>
            </div>
        </div>

        <!-- Mappa Leaflet -->
        <div id="map-leaflet"
            style="position:absolute; top:0; left:0; right:0; bottom:0; z-index:100;">
        </div>

        <!-- Vignette overlay — incornicia la mappa con profondità -->
        <div id="map-vignette"></div>

        <!-- ── Bottom controls — barra unificata centrata (stile Uber/Google Maps) ── -->
        <div id="map-bottom-bar">
            <button id="map-list-toggle" onclick="window.mapToggleList()">
                <span class="material-icons" id="map-list-toggle-icon">list</span>
                <span id="map-list-toggle-label">Lista</span>
            </button>
            <button id="map-gps-btn" onclick="window.mapToggleGPS()" title="GPS">
                <span class="material-icons" id="map-gps-icon">my_location</span>
                <span id="map-gps-label">GPS</span>
            </button>
            <button id="map-legend-btn" onclick="window.mapToggleLegend()">
                <span class="material-icons">info_outline</span>
                <span>Info</span>
            </button>
        </div>

        <div id="map-legend-wrap"
            style="position:absolute; z-index:600; bottom:64px; left:50%; transform:translateX(-50%);
                   transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);">
            <button id="map-legend-btn-ghost" style="display:none;"></button>
            <div id="map-legend-panel"
                class="hidden bg-white/97 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 p-4 min-w-[180px]"
                style="animation: slideUpSheet 0.2s cubic-bezier(0.2,0.8,0.2,1) forwards;">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Legenda</div>
                ${Object.entries(CATEGORIE).map(([k,c]) => `
                <div class="flex items-center gap-2.5 py-1.5">
                    <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:${c.color};"></span>
                    <span class="material-icons text-[16px] leading-none" style="color:${c.color}">${c.icon}</span>
                    <span class="text-xs font-semibold text-slate-700">${c.label}</span>
                </div>`).join('')}
            </div>
        </div>

        <div id="map-sheet">
            <div id="map-sheet-inner">
                <div id="map-sheet-handle-bar"></div>

                <div class="px-4 pb-2 flex items-center justify-between flex-shrink-0">
                    <h2 class="font-serif text-base font-bold text-slate-800">
                        In vista
                        <span id="list-count-badge" class="map-count-badge">0</span>
                    </h2>
                    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest select-none">
                        ↑ apri lista
                    </span>
                </div>

                <div id="map-sheet-list"></div>
            </div>
        </div>

        <div id="map-detail-sheet"
            class="hidden"
            style="position:fixed; bottom:0; left:0; right:0; z-index:1100; padding:0 12px 12px;">

            <div id="map-detail-card"
                class="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden relative">

                <div id="map-detail-color-bar" class="h-1 w-full"></div>

                <div class="flex items-stretch">

                    <div id="map-detail-side"
                        class="w-16 flex-shrink-0 flex items-center justify-center text-3xl">
                    </div>

                    <div class="flex-1 px-4 py-3.5 min-w-0">
                        <div id="map-detail-badges" class="flex flex-wrap gap-1.5 mb-1.5"></div>
                        <h3 id="map-detail-title"
                            class="font-serif text-lg font-bold text-slate-800 leading-tight truncate"></h3>
                        <p id="map-detail-desc"
                            class="text-slate-400 text-[11px] leading-snug mt-0.5 line-clamp-2"></p>
                        <div id="map-detail-meta" class="flex items-center gap-3 mt-1.5"></div>
                    </div>

                    <div class="flex flex-col items-center justify-center gap-2 px-3 py-3 flex-shrink-0">
                        <button id="map-detail-cta"
                            class="flex flex-col items-center justify-center gap-1 bg-ct-terracotta text-white w-14 h-12 rounded-2xl shadow-md active:scale-90 transition-transform">
                            <span class="material-icons text-base">info</span>
                            <span class="text-[9px] font-bold uppercase tracking-wide leading-none">Dettagli</span>
                        </button>
                        <button id="map-detail-navigate"
                            class="flex flex-col items-center justify-center gap-1 bg-ct-blue text-white w-14 h-12 rounded-2xl shadow-md active:scale-90 transition-transform">
                            <span class="material-icons text-base">directions</span>
                            <span class="text-[9px] font-bold uppercase tracking-wide leading-none">Naviga</span>
                        </button>
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

    // Fly-to target: quando l'utente arriva dal bottone mappa di una card spiaggia/attrazione
    if (window._mapFlyToTarget) {
        const { lat, lon, cat } = window._mapFlyToTarget;
        window._mapFlyToTarget = null; // consuma — non ri-applicare al prossimo accesso

        // Nascondi il bottom bar (lista/gps/info) — entrata contestuale, non serve
        const bottomBar = document.getElementById('map-bottom-bar');
        if (bottomBar) bottomBar.style.display = 'none';

        requestAnimationFrame(() => {
            // Pre-filtra la categoria se specificata
            if (cat) {
                const btn = document.querySelector(`.cat-toggle[data-cat="${cat}"]`);
                if (btn) {
                    window.mapSetCat(cat, btn);
                } else {
                    window._mapActiveCat = cat;
                    window._mapRenderMarkers();
                    window._mapUpdateListFromBounds();
                }
            }

            if (window._mapLeaflet) {
                window._mapLeaflet.flyTo([lat, lon], 17, { duration: 0.8 });
                // Cerca il POI più vicino e apri il detail
                setTimeout(() => {
                    const closest = window._mapAllData.reduce((best, item) => {
                        const dist = Math.abs(item.lat - lat) + Math.abs(item.lon - lon);
                        return (!best || dist < best.dist) ? { item, dist } : best;
                    }, null);
                    if (closest && closest.dist < 0.001) {
                        window.mapOpenDetail(closest.item);
                    }
                }, 900);
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

    // Sposta mappa sotto l'header
    const header  = document.getElementById('map-header');
    const headerH = header ? header.offsetHeight : 120;
    mapEl.style.top    = headerH + 'px';
    mapEl.style.bottom = '0';

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
        // Fetch parallelo da Spiagge e Attrazioni
        const [spRes, atRes] = await Promise.all([
            window.supabaseClient.from('Spiagge').select('*'),
            window.supabaseClient.from('Attrazioni').select('*')
        ]);
        if (spRes.error) throw spRes.error;
        if (atRes.error) throw atRes.error;

        const spiagge = (spRes.data || [])
            .filter(s => s.lat_sp && s.long_sp)
            .map(s => ({
                id:          s.id,
                nome:        window.dbCol(s, 'Nome') || s.Nome || 'Spiaggia',
                borgo:       window.dbCol(s, 'Paesi') || s.Paesi || '',
                categoria:   'spiaggia',
                lat:         parseFloat(s.lat_sp),
                lon:         parseFloat(s.long_sp),
                descrizione: window.dbCol(s, 'Tipo') || '',
                _src:        'Spiagge',
                _raw:        s
            }));

        const attrazioni = (atRes.data || [])
            .filter(a => a.lat_at && a.long_at)
            .map(a => ({
                id:          a.POI_ID || a.id,
                nome:        window.dbCol(a, 'Attrazioni') || window.dbCol(a, 'Titolo') || 'Attrazione',
                borgo:       window.dbCol(a, 'Paese') || a.Paese || '',
                categoria:   'attrazione',
                lat:         parseFloat(a.lat_at),
                lon:         parseFloat(a.long_at),
                descrizione: window.dbCol(a, 'Label') || '',
                _src:        'Attrazioni',
                _raw:        a
            }));

        window._mapAllData = [...spiagge, ...attrazioni];
    } catch(err) {
        console.error("❌ Mappa — errore fetch Spiagge/Attrazioni:", err.message);
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
            html: `<div class="map-dot-marker" style="background:${cfg.color};">
                <span class="material-icons">${cfg.icon}</span>
            </div>`,
            iconSize:[30,30], iconAnchor:[15,15],
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
                    <span class="material-icons text-[22px]" style="color:${cfg.color};">${cfg.icon}</span>
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
// BOTTOM SHEET — APPROCCIO IBRIDO
// Due stati: aperto (altezza fissa ~50vh) o chiuso (nascosto).
// Il drag serve SOLO per chiudere (swipe giù) — niente snap multipli.
// I controlli bottom seguono la posizione dello sheet in tempo reale.
// ---------------------------------------------------------------------------
const SHEET_OPEN_RATIO = 0.50;

window._sheetInit = function() {
    const sheet     = document.getElementById('map-sheet');
    const handleBar = document.getElementById('map-sheet-handle-bar');
    if (!sheet || !handleBar) return;

    const viewH  = window.innerHeight;
    const sheetH = Math.round(viewH * SHEET_OPEN_RATIO);
    sheet.style.height = sheetH + 'px';

    window._sheetOpenY  = 0;
    window._sheetCloseY = sheetH + 20;
    window._sheetH      = sheetH;

    // Parte nascosto — mappa pulita, il pulsante "Lista" lo apre
    sheet.style.transform = `translateY(${window._sheetCloseY}px)`;
    sheet.classList.add('sheet-hidden');
    window._sheetState = 'closed';

    // Helper: sincronizza posizione controlli con lo sheet
    window._sheetSyncControls = function(sheetTranslateY) {
        const bar    = document.getElementById('map-bottom-bar');
        const legend = document.getElementById('map-legend-wrap');
        const visibleH = Math.max(0, window._sheetH - sheetTranslateY);
        const lift = visibleH > 10 ? visibleH + 8 : 0;
        if (bar)    bar.style.transform = lift > 0 ? `translateX(-50%) translateY(-${lift}px)` : 'translateX(-50%)';
        if (legend) legend.style.transform = lift > 0 ? `translateY(-${lift}px)` : '';
    };

    // ── TOUCH DRAG — solo per chiudere (swipe giù) ──
    let startY = 0, startTr = 0, dragging = false;

    function getSheetY() {
        const m = sheet.style.transform.match(/translateY\(([0-9.-]+)px\)/);
        return m ? parseFloat(m[1]) : window._sheetCloseY;
    }

    handleBar.addEventListener('touchstart', e => {
        if (window._sheetState !== 'open') return;
        startY = e.touches[0].clientY;
        startTr = getSheetY();
        dragging = true;
        sheet.classList.add('is-dragging');
    }, { passive: true });

    handleBar.addEventListener('touchmove', e => {
        if (!dragging) return;
        const dy = e.touches[0].clientY - startY;
        const newY = Math.max(window._sheetOpenY, startTr + dy);
        sheet.style.transform = `translateY(${newY}px)`;
        window._sheetSyncControls(newY);
    }, { passive: true });

    handleBar.addEventListener('touchend', () => {
        if (!dragging) return;
        dragging = false;
        sheet.classList.remove('is-dragging');
        const currentY = getSheetY();
        if (currentY > window._sheetH * 0.3) {
            window._sheetClose();
        } else {
            window._sheetOpen(true);
        }
    }, { passive: true });

    // ── MOUSE DRAG (desktop) ──
    handleBar.addEventListener('mousedown', e => {
        if (window._sheetState !== 'open') return;
        startY = e.clientY;
        startTr = getSheetY();
        dragging = true;
        sheet.classList.add('is-dragging');
        const onMove = ev => {
            if (!dragging) return;
            const dy = ev.clientY - startY;
            const newY = Math.max(window._sheetOpenY, startTr + dy);
            sheet.style.transform = `translateY(${newY}px)`;
            window._sheetSyncControls(newY);
        };
        const onUp = () => {
            dragging = false;
            sheet.classList.remove('is-dragging');
            const currentY = getSheetY();
            if (currentY > window._sheetH * 0.3) {
                window._sheetClose();
            } else {
                window._sheetOpen(true);
            }
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
};

// Apri sheet a posizione fissa
window._sheetOpen = function(animate = true) {
    const sheet = document.getElementById('map-sheet');
    if (!sheet) return;
    sheet.classList.remove('sheet-hidden');
    window._sheetState = 'open';
    if (!animate) sheet.style.transition = 'none';
    sheet.style.transform = `translateY(${window._sheetOpenY}px)`;
    if (!animate) setTimeout(() => sheet.style.transition = '', 50);
    window._sheetSyncControls?.(window._sheetOpenY);
    _sheetUpdateToggleBtn(true);
    const map = window._mapLeaflet;
    if (map) setTimeout(() => map.invalidateSize(), 350);
};

// Chiudi sheet (slide fuori)
window._sheetClose = function(animate = true) {
    const sheet = document.getElementById('map-sheet');
    if (!sheet) return;
    window._sheetState = 'closed';
    if (!animate) sheet.style.transition = 'none';
    sheet.style.transform = `translateY(${window._sheetCloseY}px)`;
    if (!animate) setTimeout(() => sheet.style.transition = '', 50);
    setTimeout(() => { if (window._sheetState === 'closed') sheet.classList.add('sheet-hidden'); }, 400);
    window._sheetSyncControls?.(window._sheetCloseY);
    _sheetUpdateToggleBtn(false);
};

// Alias per compatibilità
window._sheetHide = function() { window._sheetClose(true); };
window._sheetShow = function() { window._sheetOpen(true); };

// Vecchia _sheetSetSnap — redirect per compatibilità
window._sheetSetSnap = function(snap, animate = true) {
    if (snap === 'half' || snap === 'full') window._sheetOpen(animate);
    else window._sheetClose(animate);
};

// Aggiorna aspetto toggle button
function _sheetUpdateToggleBtn(isOpen) {
    const btn = document.getElementById('map-list-toggle');
    const icon  = document.getElementById('map-list-toggle-icon');
    const label = document.getElementById('map-list-toggle-label');
    if (isOpen) {
        if (icon)  icon.textContent = 'close';
        if (label) label.textContent = 'Chiudi';
        if (btn)   btn.classList.add('bar-active');
    } else {
        if (icon)  icon.textContent = 'list';
        if (label) label.textContent = 'Lista';
        if (btn)   btn.classList.remove('bar-active');
    }
}

// Toggle pubblico
window.mapToggleList = function() {
    if (window._sheetState === 'open') window._sheetClose();
    else window._sheetOpen();
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
    // Reset tutte a stato inattivo — glass su sfondo scuro
    document.querySelectorAll('.borgo-chip').forEach(b => {
        b.classList.remove('active','bg-white','text-slate-800','shadow-md','border-white/50');
        b.classList.add('text-white','border-white/15');
        b.style.background = 'rgba(255,255,255,0.10)';
    });
    // Chip attiva — solida bianca, testo scuro
    btnEl.classList.add('active','bg-white','text-slate-800','shadow-md','border-white/50');
    btnEl.classList.remove('text-white','border-white/15');
    btnEl.style.background = '';

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

    // Reset tutte a stato inattivo — glass su sfondo scuro
    document.querySelectorAll('.cat-toggle').forEach(b => {
        b.classList.remove('active','border-transparent');
        b.classList.add('text-white/80','border-white/15');
        b.style.background = 'rgba(255,255,255,0.10)';
    });
    // Toggle attivo — sfondo colore categoria solido
    btnEl.classList.add('active','border-transparent');
    btnEl.classList.remove('text-white/80','border-white/15');
    btnEl.style.background = cfg ? cfg.color : '#E76F51';
    btnEl.style.color = 'white';

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

    // Side icon block
    if (sideEl) {
        sideEl.innerHTML = `<span class="material-icons" style="font-size:28px; color:${cfg.color};">${cfg.icon}</span>`;
        sideEl.style.background = cfg.markerBg;
    }

    // Badges: borgo + categoria
    if (badgesEl) badgesEl.innerHTML = `
        <span class="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
            style="color:${borgCol}; background:${borgCol}18; border:1px solid ${borgCol}30;">
            📍 ${item.borgo}
        </span>
        <span class="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.pill}">
            <span class="material-icons text-[12px] leading-none">${cfg.icon}</span> ${cfg.label}
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

    // CTA → apre il modal specifico (Spiagge o attrazione) e chiude il banner
    if (ctaBtn) {
        ctaBtn.onclick = () => {
            if (item._src === 'Spiagge' && item._raw) {
                // Apri modale spiaggia con il record originale
                const safePayload = encodeURIComponent(JSON.stringify(item._raw)).replace(/'/g, '%27');
                window.mapCloseDetail();
                window.openModal('Spiagge', safePayload);
            } else if (item._src === 'Attrazioni' && item._raw) {
                // Apri modale attrazione con il POI_ID
                const poiId = item._raw.POI_ID || item._raw.id;
                window.mapCloseDetail();
                window.openModal('attrazione', String(poiId));
            } else {
                // Fallback generico
                const safePayload = encodeURIComponent(JSON.stringify(item)).replace(/'/g, '%27');
                window.mapCloseDetail();
                window.openModal('luogo_mappa', safePayload);
            }
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

    if (autoStart) {
        // ── Auto-start al caricamento mappa ──────────────────────────────
        // Parte SOLO se il permesso è già stato concesso in una sessione precedente.
        // In questo modo "Scopri" non mostra MAI il popup nativo né il modal branded.
        // L'utente può sempre attivare il GPS toccando il pulsante dedicato.
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' }).then(perm => {
                if (perm.state === 'granted') _doStartMapGPS();
                // 'prompt' o 'denied' → silenzio totale
            }).catch(() => { /* Safari / browser senza Permissions API → non fare nulla */ });
        }
        // Browser senza Permissions API → non avviare (evita popup inatteso)
        return;
    }

    // ── Tap manuale sul pulsante GPS ──────────────────────────────────────
    // Mostra il modal branded PRIMA del popup nativo del browser.
    window._requestGeoPermission(
        _doStartMapGPS,
        () => {
            if (btn)   { btn.classList.remove('gps-searching', 'gps-active'); }
            if (icon)  { icon.textContent = 'my_location'; icon.classList.remove('spin-anim'); }
            if (label) { label.textContent = 'GPS'; }
        }
    );
};

// _doStartMapGPS è definita FUORI da mapToggleGPS per evitare problemi
// di hoisting con function declaration dentro arrow/function expression.
function _doStartMapGPS() {
    const map   = window._mapLeaflet;
    const btn   = document.getElementById('map-gps-btn');
    const icon  = document.getElementById('map-gps-icon');
    const label = document.getElementById('map-gps-label');
    if (!map) return;

    // Se NON abbiamo posizione cached, mostra stato "Cerco..." durante il cold start.
    // Se la posizione è già cached dal singleton, la callback arriva istantaneamente
    // dentro GeoTracker.start() e non vedremo mai "Cerco..." (override sotto).
    const hasCachedPos = window.GeoTracker && window.GeoTracker.getLastPos();
    if (!hasCachedPos) {
        if (btn)   { btn.classList.add('gps-searching'); }
        if (icon)  { icon.textContent = 'sync'; icon.classList.add('spin-anim'); }
        if (label) { label.textContent = 'Cerco...'; }
    }

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
}

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
    // Ripristina bottom bar (poteva essere nascosta dall'entrata contestuale da card)
    const bottomBar = document.getElementById('map-bottom-bar');
    if (bottomBar) bottomBar.style.display = '';
    // La lista NON si riapre automaticamente — l'utente la apre esplicitamente col bottone Lista
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