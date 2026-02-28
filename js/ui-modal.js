console.log("✅ 5. ui-modal.js caricato (Tailwind Fixed)");

window.openModal = async function(type, payload) {
    const modal = document.createElement('div');
    // Overlay Tailwind
    modal.className = 'fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade';
    document.body.appendChild(modal);

    modal.onclick = (e) => { 
        if(e.target === modal) {
            modal.classList.add('opacity-0');
            setTimeout(() => modal.remove(), 200);
        }
    };

    let item = null; 
    if (window.currentTableData && (['Vini', 'Attrazioni', 'attrazione', 'wine'].includes(type))) {
        item = window.currentTableData.find(i => i.id == payload || i.ID == payload || i.POI_ID == payload);
        if (!item && typeof payload === 'number') item = window.currentTableData[payload];
    }

    if (!window.getModalContent) { modal.remove(); return; }
    
    const content = window.getModalContent(type, payload, item);
    
    if (!content || !content.html) { modal.remove(); return; }

    // Content Container Tailwind
    const modalClass = content.class || 'bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden relative max-h-[85vh] overflow-y-auto';
    
    modal.innerHTML = `
    <div class="${modalClass} transform transition-all scale-100">
        <button class="absolute top-4 right-4 z-20 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-slate-800 shadow-sm active:scale-90" onclick="this.closest('.fixed').remove()">
            <span class="material-icons text-lg">close</span>
        </button>
        ${content.html}
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
                        <span class="material-icons text-sm text-ct-green">map</span> Traccia GPS
                    </div>
                    
                    <div id="${mapContainerId}" class="w-full h-full bg-slate-200"></div>
                </div>

                <div class="tech-scroll-wrapper flex-1 overflow-y-auto bg-slate-50 relative z-10 -mt-5 rounded-t-[1.5rem] flex flex-col">
                    
                    <div class="w-full flex justify-center pt-3 pb-1 bg-white rounded-t-[1.5rem]">
                        <div class="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                    </div>

                    <div class="bg-white p-5 px-6 shadow-sm border-b border-slate-100">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Dati Tecnici</h3>
                        
                        <div class="grid grid-cols-3 gap-y-6 gap-x-2">
                            <div class="flex flex-col items-center justify-center text-center">
                                <span class="material-icons text-slate-300 text-lg mb-1">straighten</span>
                                <div class="text-lg font-bold text-slate-700 leading-none">${dist}<span class="text-[10px] text-slate-400 font-normal ml-0.5">km</span></div>
                                <div class="text-[9px] uppercase font-bold text-slate-400 mt-1">Distanza</div>
                            </div>
                            <div class="flex flex-col items-center justify-center text-center border-l border-r border-slate-100">
                                <span class="material-icons text-slate-300 text-lg mb-1">schedule</span>
                                <div class="text-lg font-bold text-slate-700 leading-none">${dur}<span class="text-[10px] text-slate-400 font-normal ml-0.5">min</span></div>
                                <div class="text-[9px] uppercase font-bold text-slate-400 mt-1">Durata</div>
                            </div>
                            <div class="flex flex-col items-center justify-center text-center">
                                <span class="material-icons text-red-300 text-lg mb-1">trending_up</span>
                                <div class="text-lg font-bold text-slate-700 leading-none">${d_plus}<span class="text-[10px] text-slate-400 font-normal ml-0.5">m</span></div>
                                <div class="text-[9px] uppercase font-bold text-red-400 mt-1">Dislivello +</div>
                            </div>
                            <div class="flex flex-col items-center justify-center text-center mt-2">
                                <span class="material-icons text-emerald-300 text-lg mb-1">trending_down</span>
                                <div class="text-lg font-bold text-slate-700 leading-none">${d_minus}<span class="text-[10px] text-slate-400 font-normal ml-0.5">m</span></div>
                                <div class="text-[9px] uppercase font-bold text-emerald-500 mt-1">Dislivello -</div>
                            </div>
                            <div class="flex flex-col items-center justify-center text-center border-l border-r border-slate-100 mt-2">
                                <span class="material-icons text-slate-300 text-lg mb-1">terrain</span>
                                <div class="text-lg font-bold text-slate-700 leading-none">${alt_max}<span class="text-[10px] text-slate-400 font-normal ml-0.5">m</span></div>
                                <div class="text-[9px] uppercase font-bold text-slate-400 mt-1">Alt. Max</div>
                            </div>
                            <div class="flex flex-col items-center justify-center text-center mt-2">
                                <span class="material-icons text-slate-300 text-lg mb-1">south</span>
                                <div class="text-lg font-bold text-slate-700 leading-none">${alt_min}<span class="text-[10px] text-slate-400 font-normal ml-0.5">m</span></div>
                                <div class="text-[9px] uppercase font-bold text-slate-400 mt-1">Alt. Min</div>
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
                        <span class="material-icons text-sm">show_chart</span> Grafico
                    </button>
                </div>

            </div>
        `;

        let modalOverlay = document.createElement('div');
        modalOverlay.id = 'tech-modal-overlay';
        modalOverlay.className = 'fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-0 md:p-6 animate-fade';
        
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
        
        btn.innerHTML = '<span class="material-icons text-sm">close</span> Chiudi';
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
        
        btn.innerHTML = '<span class="material-icons text-sm">show_chart</span> Grafico';
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

window.toggleGPS = function() {
    if (!window.currentMap) {
        console.error("Mappa non trovata");
        return;
    }

    const btn = document.getElementById('btn-gps');
    
    if(btn) {
        btn.innerHTML = '<span class="material-icons spin text-sm">sync</span>';
        btn.className = "flex-1 py-3 bg-amber-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95";
    }

    window.currentMap.locate({
        setView: true,       
        maxZoom: 16,         
        enableHighAccuracy: true 
    });

    window.currentMap.once('locationfound', function(e) {
        const radius = e.accuracy / 2; 

        if (window.userMarker) {
            window.currentMap.removeLayer(window.userMarker);
            window.currentMap.removeLayer(window.userCircle);
        }

        window.userMarker = L.marker(e.latlng).addTo(window.currentMap)
            .bindPopup("Sei qui (precisione " + Math.round(radius) + "m)").openPopup();

        window.userCircle = L.circle(e.latlng, radius).addTo(window.currentMap);

        if(btn) {
            btn.innerHTML = '<span class="material-icons text-sm">my_location</span> Trovato';
            btn.className = "flex-1 py-3 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95";
        }
        
        setTimeout(() => {
             if(btn) {
                 btn.innerHTML = '<span class="material-icons text-sm">my_location</span> GPS';
                 btn.className = "flex-1 py-3 bg-sky-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-200 active:scale-95";
             }
        }, 3000);
    });

    window.currentMap.once('locationerror', function(e) {
        alert("Impossibile trovare la tua posizione: " + e.message);
        if(btn) {
            btn.innerHTML = '<span class="material-icons text-sm">error</span> Err';
            btn.className = "flex-1 py-3 bg-slate-400 text-white rounded-xl font-bold flex items-center justify-center gap-2";
        }
    });
};

window.closeModal = function() {
    const m = document.getElementById('tech-modal-overlay');
    if(m) m.remove();
    
    // Fallback per altri tipi di modale
    const oldM = document.getElementById('modal-container');
    if(oldM) oldM.remove();

    if(window.currentMap) { 
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

window.eseguiRicercaBus = async function() {
    const selPartenza = document.getElementById('selPartenza');
    const selArrivo = document.getElementById('selArrivo');
    const selData = document.getElementById('selData');
    const selOra = document.getElementById('selOra');
    const nextCard = document.getElementById('nextBusCard');
    const list = document.getElementById('otherBusList');
    const resultsContainer = document.getElementById('busResultsContainer');

    if (!selPartenza || !selArrivo || !selData || !selOra) return;

    const partenzaId = parseInt(selPartenza.value);
    const arrivoId = parseInt(selArrivo.value);
    const dataScelta = selData.value;
    const oraScelta = selOra.value;

    if (!partenzaId || !arrivoId) return;

    // Show Loader
    resultsContainer.style.display = 'block';
    nextCard.innerHTML = `<div class="flex flex-col items-center justify-center py-8"><span class="material-icons spin text-3xl mb-2 opacity-80">sync</span><span class="text-sm font-bold uppercase tracking-widest opacity-80">${window.t('loading')}</span></div>`;
    list.innerHTML = '';
    
    // Scroll immediato verso i risultati
    setTimeout(() => { resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);

    // Calcolo Festività
    const parts = dataScelta.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const isFestivo = (typeof isItalianHoliday === 'function') ? isItalianHoliday(dateObj) : (dateObj.getDay() === 0);

    const dayBadge = isFestivo 
        ? `<span class="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">📅 ${window.t('badge_holiday')}</span>` 
        : `<span class="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">🏢 ${window.t('badge_weekday')}</span>`;

    // Chiamata DB
    const { data, error } = await window.supabaseClient.rpc('trova_bus', { 
        p_partenza_id: partenzaId, 
        p_arrivo_id: arrivoId, 
        p_orario_min: oraScelta, 
        p_is_festivo: isFestivo 
    });

    // Caso: Nessun risultato
    if (error || !data || data.length === 0) { 
        nextCard.innerHTML = `
            <div class="text-center py-6 text-white">
                <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30">
                    <span class="material-icons text-3xl">event_busy</span>
                </div>
                <strong class="block text-xl mb-1">${window.t('bus_not_found')}</strong>
                <div class="opacity-80 text-sm mb-4">${window.t('bus_try_change')}</div>
                ${dayBadge}
            </div>`; 
        return; 
    }

    const primo = data[0];
    const successivi = data.slice(1);

    // --- CARD PRINCIPALE (HERO) ---
    nextCard.innerHTML = `
        <div class="flex justify-between items-start mb-6">
            <span class="text-[10px] font-bold uppercase tracking-widest text-white/80 border border-white/20 px-2 py-1 rounded-lg bg-black/5">${window.t('next_departure')}</span>
            ${dayBadge}
        </div>
        
        <div class="flex items-end justify-between relative z-10">
            <div>
                <div class="text-6xl font-serif font-bold text-white leading-none tracking-tight shadow-black drop-shadow-md mb-1">
                    ${primo.ora_partenza.slice(0,5)}
                </div>
                <div class="text-sm font-bold text-amber-100 uppercase tracking-widest pl-1">Partenza</div>
            </div>
            <div class="text-right pb-1">
                <div class="text-2xl font-bold text-white/90 leading-none">${primo.ora_arrivo.slice(0,5)}</div>
                <div class="text-[10px] font-bold text-amber-100 uppercase tracking-widest opacity-80">Arrivo</div>
            </div>
        </div>

        <div class="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="material-icons text-white/80 text-sm">directions_bus</span>
                <span class="text-xs font-bold text-white uppercase tracking-wide">${primo.nome_linea || 'Bus ATC'}</span>
            </div>
            <span class="material-icons text-white/40 rotate-180">arrow_back</span>
        </div>
        
        <span class="material-icons absolute -right-4 -bottom-8 text-[140px] text-white opacity-10 rotate-12 pointer-events-none">directions_bus</span>
    `;

    // --- LISTA SUCCESSIVA (COMPACT CARDS) ---
    if (successivi.length === 0) {
        list.innerHTML = `<div class="text-center text-slate-400 text-xs py-4 font-bold uppercase tracking-widest">Nessun'altra corsa oggi</div>`;
    } else {
        list.innerHTML = successivi.map(b => `
            <div class="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-amber-100 cursor-default">
                
                <div class="flex items-center gap-4">
                    <div class="flex flex-col">
                        <span class="text-xl font-bold text-slate-700 leading-none group-hover:text-amber-600 transition-colors">${b.ora_partenza.slice(0,5)}</span>
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Partenza</span>
                    </div>
                    
                    <div class="flex flex-col items-center px-1 opacity-40">
                         <span class="material-icons text-slate-400 text-sm">arrow_forward</span>
                    </div>

                    <div class="flex flex-col">
                        <span class="text-lg font-bold text-slate-500 leading-none">${b.ora_arrivo.slice(0,5)}</span>
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Arrivo</span>
                    </div>
                </div>

                <div class="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-amber-600">Bus</span>
                </div>
            </div>
        `).join('');
    }
};
window.eseguiRicercaTraghetto = async function() {
    const selPart = document.getElementById('selPartenzaFerry');
    const selArr = document.getElementById('selArrivoFerry');
    const selOra = document.getElementById('selOraFerry');

    const resultsContainer = document.getElementById('ferryResultsContainer');
    const nextCard = document.getElementById('nextFerryCard');
    const list = document.getElementById('otherFerryList');

    if (!selPart.value || !selArr.value || !selOra.value) return;

    // Show Loader
    resultsContainer.style.display = 'block';
    nextCard.innerHTML = `<div class="flex flex-col items-center justify-center py-8"><span class="material-icons spin text-3xl mb-2 opacity-80">sync</span><span class="text-sm font-bold uppercase tracking-widest opacity-80">${window.t('loading')}</span></div>`;
    list.innerHTML = '';
    
    setTimeout(() => { resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);

    const startCol = selPart.value; 
    const endCol = selArr.value;    
    const timeFilter = selOra.value; 

    // Chiamata DB
    const { data, error } = await window.supabaseClient
        .from('Orari_traghetti')
        .select(`id, direzione, validita, "${startCol}", "${endCol}"`); 

    // Validazione e Ordinamento
    let validRuns = [];
    if (data) {
        validRuns = data.filter(row => {
            const tStart = row[startCol]; 
            const tEnd = row[endCol];     
            if (!tStart || !tEnd) return false;
            if (tStart >= tEnd) return false; // Filtra direzioni errate
            if (tStart < timeFilter) return false; // Filtra orari passati
            return true;
        });
        validRuns.sort((a, b) => a[startCol].localeCompare(b[startCol]));
    }

    // Caso: Nessun risultato
    if (error || validRuns.length === 0) {
        nextCard.innerHTML = `
            <div class="text-center py-6 text-white">
                <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30">
                    <span class="material-icons text-3xl">directions_boat</span>
                </div>
                <strong class="block text-xl mb-1">${window.t('bus_not_found')}</strong>
                <div class="opacity-80 text-sm">Controlla se la tratta è diretta.</div>
            </div>`;
        return;
    }

    const primo = validRuns[0];
    const successivi = validRuns.slice(1);

    // --- CARD PRINCIPALE (HERO - BLU) ---
    nextCard.innerHTML = `
        <div class="flex justify-between items-start mb-6">
            <span class="text-[10px] font-bold uppercase tracking-widest text-white/80 border border-white/20 px-2 py-1 rounded-lg bg-black/5">${window.t('next_departure')}</span>
            <span class="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">🌊 Mare</span>
        </div>
        
        <div class="flex items-end justify-between relative z-10">
            <div>
                <div class="text-6xl font-serif font-bold text-white leading-none tracking-tight shadow-black drop-shadow-md mb-1">
                    ${primo[startCol].slice(0,5)}
                </div>
                <div class="text-sm font-bold text-cyan-100 uppercase tracking-widest pl-1">Partenza</div>
            </div>
            <div class="text-right pb-1">
                <div class="text-2xl font-bold text-white/90 leading-none">${primo[endCol].slice(0,5)}</div>
                <div class="text-[10px] font-bold text-cyan-100 uppercase tracking-widest opacity-80">Arrivo</div>
            </div>
        </div>

        <div class="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="material-icons text-white/80 text-sm">explore</span>
                <span class="text-xs font-bold text-white uppercase tracking-wide">Dir. ${primo.direzione || 'Costa'}</span>
            </div>
        </div>
        
        <span class="material-icons absolute -right-6 -bottom-6 text-[140px] text-white opacity-10 rotate-[-10deg] pointer-events-none">sailing</span>
    `;

    // --- LISTA SUCCESSIVA (COMPACT CARDS - BLU) ---
    if (successivi.length === 0) {
        list.innerHTML = `<div class="text-center text-slate-400 text-xs py-4 font-bold uppercase tracking-widest">Ultima corsa della giornata</div>`;
    } else {
        list.innerHTML = successivi.map(run => `
            <div class="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-cyan-100 cursor-default">
                
                <div class="flex items-center gap-4">
                    <div class="flex flex-col">
                        <span class="text-xl font-bold text-slate-700 leading-none group-hover:text-cyan-600 transition-colors">${run[startCol].slice(0,5)}</span>
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Partenza</span>
                    </div>
                    
                    <div class="flex flex-col items-center px-1 opacity-40">
                         <span class="material-icons text-slate-400 text-sm">arrow_forward</span>
                    </div>

                    <div class="flex flex-col">
                        <span class="text-lg font-bold text-slate-500 leading-none">${run[endCol].slice(0,5)}</span>
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Arrivo</span>
                    </div>
                </div>

                <div class="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-colors">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-cyan-600">Ferry</span>
                </div>
            </div>
        `).join('');
    }
};


// 3. INIT MAPPA BUS (Invariato, ma essenziale per il contesto)
window.initBusMap = function(fermate) {
    const mapContainer = document.getElementById('bus-map');
    if (!mapContainer) return;
    
    // Rimuove la mappa precedente se esiste per evitare duplicati
    if (window.currentBusMap) { window.currentBusMap.remove(); window.currentBusMap = null; }

    // Inizializza la mappa centrata sulle 5 Terre (o coordinate default)
    const map = L.map('bus-map').setView([44.1000, 9.7385], 13);
    window.currentBusMap = map; 

    // Tile Layer (sfondo mappa)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO', subdomains: 'abcd', maxZoom: 20
    }).addTo(map);

    // Gruppo per i marker
    const markersGroup = new L.FeatureGroup();
    
    // Recupera le etichette tradotte (usa le chiavi esistenti in data-logic.js)
    // Se window.t non trova la chiave, usa un fallback
    const labelPartenza = window.t('departure') || 'Partenza';
    const labelArrivo = window.t('arrival') || 'Arrivo';

    fermate.forEach(f => {
        if (!f.LAT || !f.LONG) return;
        const marker = L.marker([f.LAT, f.LONG]).addTo(map);
        
        // Popup con bottoni tradotti
        marker.bindPopup(`
            <div style="text-align:center; min-width:150px;">
                <h3 style="margin:0 0 10px 0; font-size:1rem; color:#333;">${f.NOME_FERMATA}</h3>
                <div style="display:flex; gap:5px; justify-content:center;">
                    <button onclick="setBusStop('partenza', '${f.ID}')" class="btn-popup-start" style="background:#27ae60; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.75rem; font-weight:bold; text-transform:uppercase;">
                        ${labelPartenza}
                    </button>
                    <button onclick="setBusStop('arrivo', '${f.ID}')" class="btn-popup-end" style="background:#c0392b; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.75rem; font-weight:bold; text-transform:uppercase;">
                        ${labelArrivo}
                    </button>
                </div>
            </div>`);
        markersGroup.addLayer(marker);
    });
    
    map.addLayer(markersGroup);
    
    // Forza il ricalcolo delle dimensioni della mappa (utile se è in una modale/tab nascosta)
    setTimeout(() => { map.invalidateSize(); }, 200);
};

// 4. SET BUS STOP (AGGIORNATA): Gestisce la selezione da Mappa
window.setBusStop = function(type, value) {
    const selectId = (type === 'partenza') ? 'selPartenza' : 'selArrivo';
    const select = document.getElementById(selectId);
    
    if (select) {
        select.value = value;
        window.flashInputFeedback(selectId); // Effetto visivo nuovo
        window.handleBusSelectionChange(type);
        if(window.currentBusMap) window.currentBusMap.closePopup();
    }
};

window.toggleBusMap = function() {
    const container = document.getElementById('bus-map-wrapper');
    const btn = document.getElementById('btn-bus-map-toggle');
    
    if (!container) return;
    
    const isHidden = container.classList.contains('hidden');
    
    if (isHidden) {
        container.classList.remove('hidden');
        if (btn) {
            btn.classList.add('bg-indigo-500', 'text-white', 'border-transparent');
            btn.classList.remove('bg-indigo-50', 'text-indigo-500', 'border-indigo-100');
            btn.innerHTML = '<span class="material-icons text-lg">expand_less</span>'; // Icona chiudi
        }
        // Invalida size dopo che il container è visibile per renderizzare i tile corretti
        setTimeout(() => { if (window.currentBusMap) { window.currentBusMap.invalidateSize(); } }, 100);
    } else {
        container.classList.add('hidden');
        if (btn) {
            btn.classList.remove('bg-indigo-500', 'text-white', 'border-transparent');
            btn.classList.add('bg-indigo-50', 'text-indigo-500', 'border-indigo-100');
            btn.innerHTML = '<span class="material-icons text-lg">map</span>'; // Icona mappa
        }
    }
};
// ============================================================
// LOGICA BUS (Bidirezionale + DB)
// ============================================================

// 1. CARICAMENTO INIZIALE: Popola TUTTI e DUE i campi
window.loadAllStops = async function() {
    const selPart = document.getElementById('selPartenza');
    const selArr = document.getElementById('selArrivo');
    if(!selPart || !selArr) return;

    if (!window.cachedStops) {
        // Scarica dal DB solo se non ce li ha
        const { data, error } = await window.supabaseClient
            .from('Fermate_bus')
            .select('ID, NOME_FERMATA, LAT, LONG') 
            .order('NOME_FERMATA', { ascending: true });
        
        if (error) { console.error("Errore fermate:", error); return; }
        window.cachedStops = data;
    }

    // Crea le opzioni
    const options = window.cachedStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
    const placeholderStart = `<option value="" selected>${window.t('select_start')}</option>`;
    const placeholderEnd = `<option value="" selected>Scegli Arrivo</option>`; // Placeholder generico

    // Popola ENTRAMBI senza restrizioni iniziali
    selPart.innerHTML = placeholderStart + options;
    selArr.innerHTML = placeholderEnd + options;

    // Abilita entrambi
    selPart.disabled = false;
    selArr.disabled = false;

    // Init Mappa Bus
    if (window.initBusMap) window.initBusMap(window.cachedStops);
};

// 2. GESTIONE SELEZIONE (Intelligente)
window.handleBusSelectionChange = async function(source) {
    const selPart = document.getElementById('selPartenza');
    const selArr = document.getElementById('selArrivo');
    
    if (!selPart || !selArr || !window.cachedStops) return;

    // Chi sta cambiando?
    const changedSelect = (source === 'partenza') ? selPart : selArr;
    const targetSelect = (source === 'partenza') ? selArr : selPart;
    
    const selectedId = changedSelect.value;
    const currentTargetValue = targetSelect.value; // Salviamo cosa c'era nell'altro

    // Se l'utente ha deselezionato (tornato a vuoto), resetta l'altro campo a TUTTE le opzioni
    if (!selectedId) {
        const options = window.cachedStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
        const placeholder = `<option value="" selected>Scegli...</option>`;
        targetSelect.innerHTML = placeholder + options;
        targetSelect.value = currentTargetValue; // Rimetti il valore se c'era
        return;
    }

    // Feedback visivo "Flash" sull'input cambiato
    if(window.flashInputFeedback) window.flashInputFeedback((source === 'partenza') ? 'selPartenza' : 'selArrivo');

    try {
        // 1. Trova le corse che passano per la fermata selezionata
        const { data: corsePassanti } = await window.supabaseClient
            .from('Orari_bus')
            .select('ID_CORSA')
            .eq('ID_FERMATA', selectedId);
        
        const runIds = corsePassanti.map(c => c.ID_CORSA);
        
        if (runIds.length === 0) return; // Nessuna corsa passa di qui (strano)

        // 2. Trova tutte le ALTRE fermate collegate a queste corse
        const { data: fermateCollegate } = await window.supabaseClient
            .from('Orari_bus')
            .select('ID_FERMATA')
            .in('ID_CORSA', runIds);

        // Lista ID validi (Escludi se stesso)
        const validIds = [...new Set(fermateCollegate.map(x => x.ID_FERMATA))]
                         .filter(id => id != selectedId);

        // 3. Filtra la lista cachedStops
        let validStops = window.cachedStops.filter(s => validIds.includes(s.ID));
        validStops.sort((a, b) => a.NOME_FERMATA.localeCompare(b.NOME_FERMATA));

        // 4. Aggiorna l'ALTRO box
        const newOptions = validStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
        const placeholder = `<option value="" disabled selected>Destinazioni valide...</option>`;
        
        targetSelect.innerHTML = placeholder + newOptions;

        // Se il valore che c'era nell'altro box è ancora valido, tienilo, altrimenti resetta
        if (currentTargetValue && validIds.includes(parseInt(currentTargetValue))) {
            targetSelect.value = currentTargetValue;
        } else {
            targetSelect.value = ""; 
        }

    } catch (err) {
        console.error("Errore filtro bus:", err);
    }
};


// ============================================================
// LOGICA BATTELLI (Bidirezionale + Static Data)
// ============================================================

// 1. CARICAMENTO INIZIALE BATTELLI (Corretto)
window.initFerrySearch = function() {
    const selPart = document.getElementById('selPartenzaFerry');
    const selArr = document.getElementById('selArrivoFerry');
    if (!selPart || !selArr) return;

    const stops = window.FERRY_STOPS || [
        { id: 'levanto', label: 'Levanto' }, { id: 'monterosso', label: 'Monterosso' },
        { id: 'vernazza', label: 'Vernazza' }, { id: 'corniglia', label: 'Corniglia' },
        { id: 'manarola', label: 'Manarola' }, { id: 'riomaggiore', label: 'Riomaggiore' },
        { id: 'portovenere', label: 'Portovenere' }, { id: 'la spezia', label: 'La Spezia' },
        { id: 'lerici', label: 'Lerici' }
    ];

    const options = stops.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
    
    // Rimuoviamo 'disabled' dal placeholder per sicurezza su mobile
    selPart.innerHTML = `<option value="" selected>${window.t('select_start')}</option>` + options;
    selArr.innerHTML = `<option value="" selected>Scegli Arrivo</option>` + options;
};

// 2. GESTIONE SELEZIONE BATTELLI (Fix "Destinazioni non selezionabile")
window.handleFerrySelectionChange = function(source) {
    const selPart = document.getElementById('selPartenzaFerry');
    const selArr = document.getElementById('selArrivoFerry');
    
    const stops = window.FERRY_STOPS || [
        { id: 'levanto', label: 'Levanto' }, { id: 'monterosso', label: 'Monterosso' },
        { id: 'vernazza', label: 'Vernazza' }, { id: 'corniglia', label: 'Corniglia' },
        { id: 'manarola', label: 'Manarola' }, { id: 'riomaggiore', label: 'Riomaggiore' },
        { id: 'portovenere', label: 'Portovenere' }, { id: 'la spezia', label: 'La Spezia' },
        { id: 'lerici', label: 'Lerici' }
    ];

    const changedSelect = (source === 'partenza') ? selPart : selArr;
    const targetSelect = (source === 'partenza') ? selArr : selPart;
    
    const selectedVal = changedSelect.value;
    const currentTargetVal = targetSelect.value;

    if(window.flashInputFeedback) window.flashInputFeedback((source === 'partenza') ? 'selPartenzaFerry' : 'selArrivoFerry');

    // Se l'utente ha resettato a vuoto
    if (!selectedVal) {
        const options = stops.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
        targetSelect.innerHTML = `<option value="" selected>Scegli...</option>` + options;
        targetSelect.value = currentTargetVal;
        targetSelect.disabled = false; // Assicuriamoci che sia attivo
        return;
    }

    // Filtra: Mostra tutti TRANNE quello selezionato
    const validStops = stops.filter(s => s.id !== selectedVal);
    const newOptions = validStops.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
    
    // FIX: Rimosso 'disabled' dal placeholder e forzato l'enable del select
    targetSelect.innerHTML = `<option value="" selected>Destinazioni...</option>` + newOptions;
    
    // Logica di persistenza valore
    if (currentTargetVal && validStops.some(s => s.id === currentTargetVal)) {
        targetSelect.value = currentTargetVal;
    } else {
        targetSelect.value = "";
    }
    
    targetSelect.disabled = false; // SBLOCCA IL CAMPO
};

// --- HELPER PER FLASH VISIVO ---
window.flashInputFeedback = function(elementId) {
    const el = document.getElementById(elementId);
    if (el && el.parentElement && el.parentElement.parentElement) {
        const wrapper = el.parentElement.parentElement; 
        wrapper.classList.add('bg-slate-100', 'rounded-lg');
        setTimeout(() => wrapper.classList.remove('bg-slate-100', 'rounded-lg'), 300);
    }
};