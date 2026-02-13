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

// FIXED: Funzione TechMap con classi Tailwind (Z-Index alto)
window.openTechMap = function(safeObj) {
    try {
        const s = JSON.parse(decodeURIComponent(safeObj));
        let gpxUrl = s.gpx_url ? s.gpx_url.trim() : null;

        const dist = s.distanza_km || '--';
        const dur = s.durata_minuti || '--';
        const d_plus = s.dislivello_positivo || s.dislivello_passivo || '--';
        const d_minus = s.dislivello_negativo || '--';
        const alt_max = s.altitudine_max || '--';
        const alt_min = s.altitudine_minima || '--';
        
        // Genera un ID univoco per evitare conflitti con altre mappe
        const mapContainerId = 'tech-map-canvas-' + Math.floor(Math.random() * 10000);

        const modalHtml = `
            <div class="tech-container bg-white w-full h-full md:max-w-xl md:h-[90vh] md:rounded-[2rem] flex flex-col relative overflow-hidden shadow-2xl">
                
                <button onclick="closeModal()" class="absolute top-4 right-4 z-[201] w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-800 shadow-md active:scale-90 transition-transform">
                    <span class="material-icons text-xl">close</span>
                </button>

                <div class="tech-scroll-wrapper flex-1 overflow-y-auto bg-slate-50">
                    
                    <div class="grid grid-cols-3 gap-0 border-b border-slate-200 bg-white sticky top-0 z-[100] shadow-sm">
                        <div class="p-4 text-center border-r border-slate-100">
                            <div class="text-2xl font-bold text-slate-700 leading-none">${dist}<small class="text-xs text-slate-400 font-normal">km</small></div>
                            <div class="text-[10px] uppercase font-bold text-slate-400 mt-1">Distanza</div>
                        </div>
                        <div class="p-4 text-center border-r border-slate-100">
                             <div class="text-2xl font-bold text-slate-700 leading-none">${dur}<small class="text-xs text-slate-400 font-normal">min</small></div>
                            <div class="text-[10px] uppercase font-bold text-slate-400 mt-1">Durata</div>
                        </div>
                        <div class="p-4 text-center">
                            <div class="flex flex-col items-center justify-center h-full gap-1">
                                <div class="text-xs font-bold text-red-500">D+ ${d_plus}m</div>
                                <div class="text-xs font-bold text-green-500">D- ${d_minus}m</div>
                            </div>
                        </div>
                    </div>

                    <div id="${mapContainerId}" class="w-full h-[450px] bg-slate-200 z-0"></div>
                    
                    <div id="elevation-div" class="hidden bg-white p-2 border-t border-slate-200 h-[180px]"></div>
                    
                    <div class="p-4 grid grid-cols-2 gap-4 text-center text-sm text-slate-500">
                        <div>Alt. Max: <b>${alt_max}m</b></div>
                        <div>Alt. Min: <b>${alt_min}m</b></div>
                    </div>
                </div>

                <div class="p-4 bg-white border-t border-slate-100 flex gap-2 z-[200]">
                    <button class="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95" onclick="window.downloadGPX('${gpxUrl}')">
                        <span class="material-icons text-sm">download</span> GPX
                    </button>
                    <button id="btn-gps" class="flex-1 py-3 bg-sky-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-200 active:scale-95" onclick="window.toggleGPS()">
                        <span class="material-icons text-sm">my_location</span> GPS
                    </button>
                    <button id="btn-toggle-ele" class="flex-1 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-95" onclick="toggleElevationChart()">
                        <span class="material-icons text-sm">show_chart</span> Grafico
                    </button>
                </div>

            </div>
        `;

        // Crea il container FULL SCREEN
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

    resultsContainer.style.display = 'block';
    nextCard.innerHTML = `<div style="text-align:center; padding:20px;">${window.t('loading')} <span class="material-icons spin">sync</span></div>`;
    list.innerHTML = '';

    const parts = dataScelta.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const isFestivo = (typeof isItalianHoliday === 'function') ? isItalianHoliday(dateObj) : (dateObj.getDay() === 0);

    const dayTypeLabel = isFestivo 
        ? `<span class="badge-holiday">${window.t('badge_holiday')}</span>` 
        : `<span class="badge-weekday">${window.t('badge_weekday')}</span>`;

    const { data, error } = await window.supabaseClient.rpc('trova_bus', { 
        p_partenza_id: partenzaId, 
        p_arrivo_id: arrivoId, 
        p_orario_min: oraScelta, 
        p_is_festivo: isFestivo 
    });

    if (error || !data || data.length === 0) { 
        nextCard.innerHTML = `
            <div style="text-align:center; padding:15px; color:#c62828;">
                <span class="material-icons">event_busy</span><br>
                <strong>${window.t('bus_not_found')}</strong><br>
                <div style="margin-top:5px;">${dayTypeLabel}</div>
                <small style="display:block; margin-top:5px;">${window.t('bus_try_change')}</small>
            </div>`; 
        return; 
    }

    const primo = data[0];
    nextCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <span style="font-size:0.75rem; color:#e0f7fa; text-transform:uppercase; font-weight:bold;">${window.t('next_departure')}</span>
            ${dayTypeLabel}
        </div>
        <div class="bus-time-big">${primo.ora_partenza.slice(0,5)}</div>
        <div style="font-size:1rem; color:#e0f7fa;">${window.t('arrival')}: <strong>${primo.ora_arrivo.slice(0,5)}</strong></div>
        <div style="font-size:0.8rem; color:#b2ebf2; margin-top:5px;">${primo.nome_linea || 'Linea ATC'}</div>
    `;

    const successivi = data.slice(1);
    list.innerHTML = successivi.map(b => `
        <div class="bus-list-item">
            <span style="font-weight:bold; color:#333;">${b.ora_partenza.slice(0,5)}</span>
            <span style="color:#666;">➜ ${b.ora_arrivo.slice(0,5)}</span>
        </div>
    `).join('');
    
    setTimeout(() => { resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
};

// --- Sostituisci in ui-modal.js ---

// 1. CARICAMENTO INIZIALE: Popola entrambi i box
window.loadAllStops = async function() {
    const selPart = document.getElementById('selPartenza');
    const selArr = document.getElementById('selArrivo');
    if(!selPart || !selArr) return;

    if (!window.cachedStops) {
        const { data, error } = await window.supabaseClient
            .from('Fermate_bus')
            .select('ID, NOME_FERMATA, LAT, LONG') 
            .order('NOME_FERMATA', { ascending: true });
        
        if (error) { console.error("Errore fermate:", error); return; }
        window.cachedStops = data;
    }

    const options = window.cachedStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
    
    // Popoliamo entrambi i menu inizialmente
    const placeholder = `<option value="" disabled selected>${window.t('select_placeholder')}</option>`;
    if (selPart.innerHTML.includes(window.t('loading'))) selPart.innerHTML = placeholder + options;
    if (selArr.innerHTML.includes(window.t('loading')) || selArr.value === "") selArr.innerHTML = placeholder + options;

    if (window.cachedStops && window.initBusMap) {
        window.initBusMap(window.cachedStops);
    }
};

// 2. NUOVA FUNZIONE BIDIREZIONALE: Gestisce il cambio di selezione
window.handleBusSelectionChange = async function(source) {
    const selPart = document.getElementById('selPartenza');
    const selArr = document.getElementById('selArrivo');
    
    if (!selPart || !selArr) return;

    // Determiniamo chi sta filtrando chi
    const isPartenzaChanged = (source === 'partenza');
    const changedSelect = isPartenzaChanged ? selPart : selArr;
    const targetSelect = isPartenzaChanged ? selArr : selPart;
    
    const selectedId = changedSelect.value;
    if (!selectedId) return;

    // Salviamo il valore corrente dell'altro box (se esiste) per tentare di mantenerlo
    const currentTargetValue = targetSelect.value;

    // Feedback visivo di caricamento sul target
    const originalTargetOptions = targetSelect.innerHTML;
    // Non cancelliamo tutto, mostriamo opzione di ricerca mantenendo la larghezza
    // targetSelect.disabled = true; // Opzionale: disabilitare durante la ricerca

    try {
        // Logica: Troviamo le corse che passano per la fermata selezionata
        const { data: corsePassanti } = await window.supabaseClient
            .from('Orari_bus')
            .select('ID_CORSA')
            .eq('ID_FERMATA', selectedId);
        
        const runIds = corsePassanti.map(c => c.ID_CORSA);
        
        if (runIds.length === 0) {
            alert(window.t('bus_not_found'));
            return;
        }

        // Troviamo tutte le ALTRE fermate collegate a queste corse
        const { data: fermateCollegate } = await window.supabaseClient
            .from('Orari_bus')
            .select('ID_FERMATA')
            .in('ID_CORSA', runIds);

        // Creiamo lista unica di ID escludendo quello appena selezionato
        const validIds = [...new Set(fermateCollegate.map(x => x.ID_FERMATA))]
                         .filter(id => id != selectedId);

        // Filtriamo l'array cachedStops
        let validStops = [];
        if (window.cachedStops) {
            validStops = window.cachedStops.filter(s => validIds.includes(s.ID));
        }
        
        validStops.sort((a, b) => a.NOME_FERMATA.localeCompare(b.NOME_FERMATA));

        // Ricostruiamo le opzioni del target
        const placeholder = `<option value="" disabled selected>${window.t('select_placeholder')}</option>`;
        const newOptions = validStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
        
        targetSelect.innerHTML = placeholder + newOptions;
        
        // Se il valore che c'era prima è ancora valido, lo riselezioniamo
        if (currentTargetValue && validIds.includes(parseInt(currentTargetValue))) {
            targetSelect.value = currentTargetValue;
        } else {
            // Se non è più valido o era vuoto, resetta
            targetSelect.value = "";
        }
        
        targetSelect.disabled = false;

    } catch (err) {
        console.error("Errore filtro bus:", err);
        targetSelect.innerHTML = originalTargetOptions; // Ripristina in caso di errore
        targetSelect.disabled = false;
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
    // type è 'partenza' o 'arrivo'
    const selectId = (type === 'partenza') ? 'selPartenza' : 'selArrivo';
    const select = document.getElementById(selectId);
    
    if (select) {
        // 1. Imposta il valore visivo
        select.value = value;
        
        // 2. Feedback visivo (flash giallo)
        select.style.backgroundColor = "#fff3cd"; 
        setTimeout(() => select.style.backgroundColor = "white", 500);
        
        // 3. CHIAMA LA FUNZIONE DI FILTRO
        // Questo è il passaggio mancante nel tuo codice originale.
        // Simuliamo l'azione dell'utente chiamando manualmente la logica.
        window.handleBusSelectionChange(type);
        
        // 4. Chiude il popup della mappa (opzionale, per pulizia)
        if(window.currentBusMap) window.currentBusMap.closePopup();
    }
};

window.toggleBusMap = function() {
    const container = document.getElementById('bus-map-wrapper');
    const btn = document.getElementById('btn-bus-map-toggle');
    if (!container || !btn) return;
    const isHidden = container.style.display === 'none';
    if (isHidden) {
        container.style.display = 'block';
        btn.innerHTML = `📍 ${window.t('hide_map')} ▾`;
        btn.style.backgroundColor = '#D1C4E9'; 
        setTimeout(() => { if (window.currentBusMap) { window.currentBusMap.invalidateSize(); } }, 100);
    } else {
        container.style.display = 'none';
        btn.innerHTML = `🗺️ ${window.t('show_map')} ▾`;
        btn.style.backgroundColor = '#EDE7F6'; 
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

    resultsContainer.style.display = 'block';
    nextCard.innerHTML = `<div style="text-align:center; padding:20px;">${window.t('loading')} <span class="material-icons spin">sync</span></div>`;
    list.innerHTML = '';

    const startCol = selPart.value; 
    const endCol = selArr.value;    
    const timeFilter = selOra.value; 

    const { data, error } = await window.supabaseClient
        .from('Orari_traghetti')
        .select(`id, direzione, validita, "${startCol}", "${endCol}"`); 

    if (error || !data) {
        nextCard.innerHTML = `<p style="padding:15px; text-align:center;">${window.t('error')}: ${error ? error.message : 'Nessun dato'}</p>`;
        return;
    }

    let validRuns = data.filter(row => {
        const tStart = row[startCol]; 
        const tEnd = row[endCol];     

        if (!tStart || !tEnd) return false;

        if (tStart >= tEnd) return false;

        if (tStart < timeFilter) return false;

        return true;
    });

    validRuns.sort((a, b) => a[startCol].localeCompare(b[startCol]));

    if (validRuns.length === 0) {
        nextCard.innerHTML = `
            <div style="text-align:center; padding:15px; color:#c62828;">
                <span class="material-icons">directions_boat_filled</span><br>
                <strong>${window.t('bus_not_found')}</strong><br>
                <small style="display:block; margin-top:5px;">Verifica che la tratta sia diretta.</small>
            </div>`;
        return;
    }

    const primo = validRuns[0];
    nextCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <span style="font-size:0.75rem; color:#e1f5fe; text-transform:uppercase; font-weight:bold;">${window.t('next_departure')}</span>
            <span class="badge-weekday" style="background:#0288D1">Navigazione</span>
        </div>
        <div class="bus-time-big">${primo[startCol].slice(0,5)}</div>
        <div style="font-size:1rem; color:#e1f5fe;">${window.t('arrival')}: <strong>${primo[endCol].slice(0,5)}</strong></div>
        <div style="font-size:0.75rem; color:#b3e5fc; margin-top:5px;">Direzione: ${primo.direzione || '--'}</div>
    `;

    const successivi = validRuns.slice(1);
    list.innerHTML = successivi.map(run => `
        <div class="bus-list-item">
            <span style="font-weight:bold; color:#01579b;">${run[startCol].slice(0,5)}</span>
            <span style="color:#666;">➜ ${run[endCol].slice(0,5)}</span>
        </div>
    `).join('');
    
    setTimeout(() => { 
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
    }, 150);
};