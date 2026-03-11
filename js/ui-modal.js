window.openModal = async function(type, payload) {
    const modal = document.createElement('div');
    // Bottom-sheet su mobile (items-end), centrato su desktop (md:items-center)
    modal.className = 'fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade';
    document.body.appendChild(modal);

    modal.onclick = (e) => { 
        if(e.target === modal) {
            modal.classList.add('opacity-0');
            setTimeout(() => modal.remove(), 200);
        }
    };

    // ── Swipe-down gesture to close ──
    let _swipeStartY = 0, _swipeStartX = 0;
    modal.addEventListener('touchstart', e => {
        _swipeStartY = e.touches[0].clientY;
        _swipeStartX = e.touches[0].clientX;
    }, { passive: true });
    modal.addEventListener('touchmove', e => {
        const dy = e.touches[0].clientY - _swipeStartY;
        const dx = e.touches[0].clientX - _swipeStartX;
        if (dy > 0 && Math.abs(dy) > Math.abs(dx)) {
            const inner = modal.querySelector('.modal-sheet');
            if (inner) {
                inner.style.transform = `translateY(${Math.min(dy * 0.45, 70)}px)`;
                inner.style.opacity   = String(Math.max(0.55, 1 - dy / 280));
                inner.style.transition = 'none';
            }
        }
    }, { passive: true });
    modal.addEventListener('touchend', e => {
        const dy = e.changedTouches[0].clientY - _swipeStartY;
        const inner = modal.querySelector('.modal-sheet');
        if (dy > 90) {
            modal.classList.add('opacity-0');
            setTimeout(() => modal.remove(), 180);
        } else if (inner) {
            inner.style.transition = 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1), opacity 0.3s ease';
            inner.style.transform  = '';
            inner.style.opacity    = '';
            setTimeout(() => { inner.style.transition = ''; }, 320);
        }
    }, { passive: true });

    let item = null; 
    if (window.currentTableData && (['Vini', 'Attrazioni', 'attrazione', 'wine'].includes(type))) {
        item = window.currentTableData.find(i => i.id == payload || i.ID == payload || i.POI_ID == payload);
        if (!item && typeof payload === 'number') item = window.currentTableData[payload];
    }

    if (!window.getModalContent) { modal.remove(); return; }
    
    const content = window.getModalContent(type, payload, item);
    
    if (!content || !content.html) { modal.remove(); return; }

    // ── Report button: estraiamo il nome dell'item per la segnalazione ──
    // Skip per modali non-content (transport, legal, ecc.)
    let reportBtnHtml = '';
    const reportableTypes = ['ristorante','restaurant','product','Vini','wine','attrazione','Attrazioni','Spiagge','sentieroInfo'];
    if (reportableTypes.includes(type) && window.renderReportBtn) {
        let itemName = '';
        let itemId = '';
        try {
            if (item) {
                // Vini, Attrazioni: item è l'oggetto dal DB
                itemName = window.dbCol(item, 'Nome') || window.dbCol(item, 'Attrazioni') || '';
                itemId = String(item.id || item.ID || item.POI_ID || '');
            } else if (payload && typeof payload === 'string' && (payload.startsWith('%') || payload.startsWith('{'))) {
                // Ristoranti, Spiagge, Prodotti, Sentieri: payload è JSON encoded
                const parsed = JSON.parse(decodeURIComponent(payload));
                itemName = window.dbCol(parsed, 'Nome') || window.dbCol(parsed, 'Prodotti') || parsed.nome || '';
                itemId = String(parsed.id || parsed.poi_id || '');
            } else {
                itemId = String(payload || '');
            }
        } catch(e) {}
        reportBtnHtml = `<div class="px-5 pb-4 flex justify-start">${window.renderReportBtn(type, itemId, itemName)}</div>`;
    }

    // Content Container: bottom-sheet mobile, centered card desktop
    const modalClass = content.class || 'modal-sheet bg-white w-full max-w-md rounded-t-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden relative overflow-y-auto' +
        ' ' + 'max-h-[95vh] max-h-[95dvh]';
    
    modal.innerHTML = `
    <div class="${modalClass} transform transition-all scale-100">
        <!-- Grab handle: suggerisce swipe-down per chiudere -->
        <div class="w-full flex justify-center pt-3 pb-1 md:hidden sticky top-0 z-30 bg-white">
            <div class="w-10 h-1.5 bg-slate-200 rounded-full"></div>
        </div>
        <button class="absolute top-3 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-800 shadow-sm active:scale-90 transition-transform" onclick="this.closest('.fixed').remove()" aria-label="Close">
            <span class="material-icons text-xl">close</span>
        </button>
        ${content.html}
        ${reportBtnHtml}
    </div>`;

    if (content.onRender && typeof content.onRender === 'function') {
        setTimeout(() => content.onRender(), 50);
    }
};

// FIXED: Funzione TechMap con classi Tailwind (Z-Index alto e HCI Layout)
window.openTechMap = function(safeObj) {
    try {
        const s = JSON.parse(decodeURIComponent(safeObj));
        let gpxUrl = s.gpx_url ? s.gpx_url.trim() : null;

        // Dati con formattazione e fallback
        const dist = s.distanza_km || '--';
        const dur = s.durata_minuti || '--';
        const d_plus = s.dislivello_positivo || s.dislivello_passivo || '--';
        const d_minus = s.dislivello_negativo || '--';
        const alt_max = s.altitudine_max || '--';
        const alt_min = s.altitudine_minima || '--';
        
        const mapContainerId = 'tech-map-canvas-' + Math.floor(Math.random() * 10000);

        const modalHtml = `
            <div class="tech-container bg-slate-50 w-full h-full md:max-w-xl md:h-[90vh] md:rounded-[2rem] flex flex-col relative overflow-hidden shadow-2xl">
                
                <div class="relative w-full h-[45vh] min-h-[300px] shrink-0 z-0">
                    <button onclick="closeModal()" class="absolute top-4 right-4 z-[400] w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-800 shadow-sm active:scale-90 transition-transform">
                        <span class="material-icons text-xl">close</span>
                    </button>
                    <div class="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-sm text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span class="material-icons text-sm text-ct-green">map</span> ${window.t('gps_track')}
                    </div>
                    
                    <div id="${mapContainerId}" class="w-full h-full bg-slate-200"></div>
                </div>

                <div class="tech-scroll-wrapper flex-1 overflow-y-auto bg-slate-50 relative z-10 -mt-5 rounded-t-[1.5rem] flex flex-col">
                    
                    <div class="w-full flex justify-center pt-3 pb-1 bg-white rounded-t-[1.5rem]">
                        <div class="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                    </div>

                    <div class="bg-white p-5 px-6 shadow-sm border-b border-slate-100">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">${window.t('tech_data')}</h3>

                        <!-- Riga 1: Distanza + Durata -->
                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <div class="flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl py-4 border border-slate-100">
                                <span class="material-icons text-slate-300 text-lg mb-1">straighten</span>
                                <div class="text-xl font-bold text-slate-700 leading-none">${dist}<span class="text-[11px] text-slate-400 font-normal ml-0.5">km</span></div>
                                <div class="text-[11px] uppercase font-bold text-slate-400 mt-1.5">${window.t("distance")}</div>
                            </div>
                            <div class="flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl py-4 border border-slate-100">
                                <span class="material-icons text-slate-300 text-lg mb-1">schedule</span>
                                <div class="text-xl font-bold text-slate-700 leading-none">${dur}<span class="text-[11px] text-slate-400 font-normal ml-0.5">min</span></div>
                                <div class="text-[11px] uppercase font-bold text-slate-400 mt-1.5">${window.t("duration")}</div>
                            </div>
                        </div>

                        <!-- Riga 2: Dislivello + / − (coppia) -->
                        <div class="rounded-2xl border border-slate-100 overflow-hidden mb-3">
                            <div class="flex items-center gap-1.5 px-4 pt-3 pb-1">
                                <span class="material-icons text-slate-300 text-sm">show_chart</span>
                                <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">${window.t('elevation_gain')}</span>
                            </div>
                            <div class="grid grid-cols-2 divide-x divide-slate-100">
                                <div class="flex flex-col items-center justify-center text-center py-3">
                                    <span class="material-icons text-red-300 text-lg mb-1">trending_up</span>
                                    <div class="text-xl font-bold text-slate-700 leading-none">${d_plus}<span class="text-[11px] text-slate-400 font-normal ml-0.5">m</span></div>
                                    <div class="text-[11px] uppercase font-bold text-red-400 mt-1.5">${window.t('ascent')}</div>
                                </div>
                                <div class="flex flex-col items-center justify-center text-center py-3">
                                    <span class="material-icons text-emerald-400 text-lg mb-1">trending_down</span>
                                    <div class="text-xl font-bold text-slate-700 leading-none">${d_minus}<span class="text-[11px] text-slate-400 font-normal ml-0.5">m</span></div>
                                    <div class="text-[11px] uppercase font-bold text-emerald-500 mt-1.5">${window.t('descent')}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Riga 3: Altitudine Max / Min (coppia) -->
                        <div class="rounded-2xl border border-slate-100 overflow-hidden">
                            <div class="flex items-center gap-1.5 px-4 pt-3 pb-1">
                                <span class="material-icons text-slate-300 text-sm">terrain</span>
                                <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">${window.t('altitude')}</span>
                            </div>
                            <div class="grid grid-cols-2 divide-x divide-slate-100">
                                <div class="flex flex-col items-center justify-center text-center py-3">
                                    <span class="material-icons text-slate-300 text-lg mb-1">keyboard_arrow_up</span>
                                    <div class="text-xl font-bold text-slate-700 leading-none">${alt_max}<span class="text-[11px] text-slate-400 font-normal ml-0.5">m</span></div>
                                    <div class="text-[11px] uppercase font-bold text-slate-400 mt-1.5">Massima</div>
                                </div>
                                <div class="flex flex-col items-center justify-center text-center py-3">
                                    <span class="material-icons text-slate-300 text-lg mb-1">keyboard_arrow_down</span>
                                    <div class="text-xl font-bold text-slate-700 leading-none">${alt_min}<span class="text-[11px] text-slate-400 font-normal ml-0.5">m</span></div>
                                    <div class="text-[11px] uppercase font-bold text-slate-400 mt-1.5">Minima</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="elevation-div" class="hidden bg-white mx-4 mt-4 p-2 rounded-2xl shadow-sm border border-slate-100 h-[180px]"></div>
                </div>

                <div class="p-4 bg-white border-t border-slate-100 flex gap-2 z-[200] shrink-0">
                    <button class="flex-1 py-3 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform" onclick="window.downloadGPX('${gpxUrl}')">
                        <span class="material-icons text-sm">download</span> GPX
                    </button>
                    <button id="btn-gps" class="flex-1 py-3 bg-sky-50 text-sky-600 border border-sky-200 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform" onclick="window.toggleGPS()">
                        <span class="material-icons text-sm">my_location</span> GPS
                    </button>
                    <button id="btn-toggle-ele" class="flex-1 py-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform" onclick="toggleElevationChart()">
                        <span class="material-icons text-sm">show_chart</span> ${window.t('chart_label') || 'Chart'}
                    </button>
                </div>

            </div>
        `;

        let modalOverlay = document.createElement('div');
        modalOverlay.id = 'tech-modal-overlay';
        modalOverlay.className = 'fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-0 md:p-6 animate-fade';
        // h-[45vh] nella mappa interna usa inline style per supportare dvh con fallback vh
        modalOverlay.querySelector && setTimeout(() => {
            const mapSection = modalOverlay.querySelector('.relative.w-full.shrink-0');
            if (mapSection) { mapSection.style.height = '45vh'; mapSection.style.height = '45dvh'; }
        }, 0);
        
        modalOverlay.innerHTML = modalHtml;
        document.body.appendChild(modalOverlay);

        setTimeout(() => { initLeafletMap(mapContainerId, gpxUrl); }, 300);

    } catch (e) { console.error("Errore TechMap:", e); }
};
window.toggleElevationChart = function() {
    const elDiv = document.getElementById('elevation-div');
    const btn = document.getElementById('btn-toggle-ele');
    
    if (!elDiv || !btn) return;

    const isHidden = elDiv.classList.contains('hidden');

    if (isHidden) {
        elDiv.classList.remove('hidden');
        
        btn.innerHTML = '<span class="material-icons text-sm">close</span> ' + (window.t('close_label') || 'Chiudi');
        btn.className = "flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 border border-red-100";
        
        if (window.currentMap) {
            setTimeout(() => { window.currentMap.invalidateSize(); }, 100);
        }

        const wrapper = document.querySelector('.tech-scroll-wrapper');
        if (wrapper) {
            setTimeout(() => wrapper.scrollTo({ top: wrapper.scrollHeight, behavior: 'smooth' }), 100);
        }

    } else {
        elDiv.classList.add('hidden');
        
        btn.innerHTML = '<span class="material-icons text-sm">show_chart</span> ' + (window.t('chart_label') || 'Grafico');
        btn.className = "flex-1 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-95";
        
        if (window.currentMap) {
            setTimeout(() => { window.currentMap.invalidateSize(); }, 50);
        }
    }
};

window.downloadGPX = function(url) {
    if(!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// toggleGPS: implementazione in app.js — usa _requestGeoPermission + modal branded

window.closeModal = function() {
    const m = document.getElementById('tech-modal-overlay');
    if (m) m.remove();
    
    const oldM = document.getElementById('modal-container');
    if (oldM) oldM.remove();

    // Ferma il GPS tracker della mappa sentieri se attivo
    if (window.GeoTracker) {
        window.GeoTracker.stop('sentieri');
        window.GeoTracker.stop('bus');
    }

    // Pulisce i marker GPS lasciati sulla mappa sentieri
    if (window.userMarker && window.currentMap) {
        try { window.currentMap.removeLayer(window.userMarker); } catch(e) {}
        window.userMarker = null;
    }
    if (window.userAccuracyCircle && window.currentMap) {
        try { window.currentMap.removeLayer(window.userAccuracyCircle); } catch(e) {}
        window.userAccuracyCircle = null;
    }

    if (window.currentMap) { 
        window.currentMap.off();
        window.currentMap.remove(); 
        window.currentMap = null; 
    }
};

// Funzione Inizializzazione Mappa (Invariata)
function initLeafletMap(divId, gpxUrl) {
    const el = document.getElementById(divId);
    if (!el) return;
    
    // Assicura che il container abbia dimensione
    if(el.clientHeight === 0) el.style.height = '450px';

    if (window.currentMap) { 
        window.currentMap.off();
        window.currentMap.remove(); 
        window.currentMap = null; 
    }
    document.getElementById('elevation-div').innerHTML = '';

    const map = L.map(divId);
    window.currentMap = map;
    map.setView([44.118, 9.711], 13); 

    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 16, attribution: 'OpenTopoMap'
    }).addTo(map);

    if (gpxUrl) {
        try {
            const elevationOptions = {
                theme: "steelblue-theme",
                detached: true,
                elevationDiv: "#elevation-div",
                xAttr: 'dist', yAttr: 'altitude', 
                time: false, summary: false, followMarker: true,
                margins: { top: 20, right: 20, bottom: 20, left: 50 },
                polyline: { color: '#D32F2F', opacity: 0.9, weight: 5 }
            };
            L.control.elevation(elevationOptions).addTo(map).load(gpxUrl);
        } catch (e) {
            new L.GPX(gpxUrl, { async: true, polyline_options: { color: 'red' } })
              .on('loaded', e => map.fitBounds(e.target.getBounds())).addTo(map);
        }
    }
    setTimeout(() => { map.invalidateSize(); }, 300);
}

// eseguiRicercaBus: implementazione canonica in app.js
// eseguiRicercaTraghetto: implementazione canonica in app.js


// ── FUNZIONI BUS / FERRY / GPS ──────────────────────────────
// Tutte spostate in app.js (caricato dopo) che è la fonte canonica.
// initBusMap, loadAllStops, handleBusSelectionChange,
// setBusStop, toggleBusMap, handleBusSelectionChange,
// initFerrySearch, handleFerrySelectionChange, flashInputFeedback
// ─────────────────────────────────────────────────────────────