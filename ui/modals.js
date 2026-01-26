// ui/modals.js
import { t, dbCol, getSmartUrl } from '../core/utils.js';
import { state } from '../core/state.js';
import { supabaseClient } from '../core/supabaseClient.js';
import { FERRY_STOPS } from '../core/config.js';
import { trainSearchRenderer } from '../ui-renderers.js'; 

export async function openModal(type, payload) {
    console.log("Opening Modal:", type, payload);
    
    let data = null;

    if (typeof payload === 'string' && state.dataCache && state.dataCache[payload]) {
        data = state.dataCache[payload];
    }
    else if (state.currentTableData && ['Vini', 'Attrazioni', 'Spiagge', 'attrazione', 'wine'].includes(type)) {
        data = state.currentTableData.find(i => i.id == payload || i.ID == payload || i.POI_ID == payload);
        if (!data && typeof payload === 'number') data = state.currentTableData[payload];
    }
    else if (type === 'transport') {
        data = window.tempTransportData ? window.tempTransportData[payload] : null;
    }
    if (!data && typeof payload === 'string' && (payload.startsWith('%7B') || payload.startsWith('{'))) {
        try { data = JSON.parse(decodeURIComponent(payload)); } catch (e) {}
    }
    if (!data) data = payload;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate-fade';
    document.body.appendChild(modal);
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };

    let contentHtml = '';
    let modalClass = 'modal-content'; 

    // ============================================================
    // 1. PRODOTTI
    // ============================================================
    if (type === 'product') {
        const nome = dbCol(data, 'Prodotti') || dbCol(data, 'Nome');
        const desc = dbCol(data, 'Descrizione');   
        const ideale = dbCol(data, 'Ideale per'); 
        const fotoKey = data.Prodotti_foto || nome;
        modalClass = 'modal-content glass-modal';
        const bigImg = getSmartUrl(fotoKey, '', 800);
        contentHtml = `<div style="position: relative;"><img src="${bigImg}" style="width:100%; border-radius: 0 0 24px 24px; height:250px; object-fit:cover; margin-bottom: 15px; mask-image: linear-gradient(to bottom, black 80%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);" onerror="this.style.display='none'"></div><div style="padding: 0 25px 25px 25px;"><h2 style="font-size: 2rem; margin-bottom: 10px; color: #222;">${nome}</h2>${ideale ? `<div style="margin-bottom: 20px;"><span class="glass-tag">✨ ${t('ideal_for')}: ${ideale}</span></div>` : ''}<p style="font-size: 1.05rem; line-height: 1.6; color: #444;">${desc || ''}</p></div>`;
    }
    
    // ============================================================
    // 2. TRASPORTI (Refactoring completo come da backup)
    // ============================================================
    else if (type === 'transport') {
        if (!data) { modal.remove(); return; }
        const item = data; 
        
        const nome = dbCol(item, 'Nome') || dbCol(item, 'Località') || dbCol(item, 'Mezzo') || 'Trasporto';
        const desc = dbCol(item, 'Descrizione') || '';
        
        // Info Generiche per i biglietti
        const infoSms = dbCol(item, 'Info_SMS');
        const infoApp = dbCol(item, 'Info_App');
        const infoAvvisi = dbCol(item, 'Info_Avvisi');
        // Verifica se ci sono info biglietti
        const hasTicketInfo = infoSms || infoApp || infoAvvisi;

        const searchStr = ((dbCol(item, 'Nome') || '') + ' ' + (dbCol(item, 'Località') || '') + ' ' + (dbCol(item, 'Mezzo') || '')).toLowerCase();
        
        const isBus = searchStr.includes('bus') || searchStr.includes('autobus') || searchStr.includes('atc');
        const isFerry = searchStr.includes('battello') || searchStr.includes('traghetto') || searchStr.includes('navigazione');
        const isTrain = searchStr.includes('tren') || searchStr.includes('ferrovi') || searchStr.includes('stazione');

        let customContent = '';

        // --- A) BUS: Giallo, Mappa, Ticket Info ---
        if (isBus) {
             const { data: fermate, error } = await supabaseClient
                .from('Fermate_bus')
                .select('ID, NOME_FERMATA, LAT, LONG') 
                .order('NOME_FERMATA', { ascending: true });
            
            if (fermate && !error) {
                const now = new Date();
                const todayISO = now.toISOString().split('T')[0];
                const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                const options = fermate.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');

                // Sezione Biglietti (Accordion)
                let ticketSection = '';
                if (hasTicketInfo) {
                    ticketSection = `
                    <button onclick="toggleTicketInfo()" class="toggle-info-btn bus-style">
                        🎟️ COME ACQUISTARE IL BIGLIETTO ▾
                    </button>
                    <div id="ticket-info-box" style="display:none;" class="info-dropdown-content">
                        ${infoSms ? `<p style="margin-bottom:10px;"><strong>📱 SMS</strong><br>${infoSms}</p>` : ''}
                        ${infoApp ? `<p style="margin-bottom:10px;"><strong>📲 APP</strong><br>${infoApp}</p>` : ''}
                        ${infoAvvisi ? `<div style="background:#fff3cd; color:#856404; padding:10px; border-radius:6px; font-size:0.85rem; border:1px solid #ffeeba; margin-top:10px;"><strong>⚠️ ATTENZIONE:</strong> ${infoAvvisi}</div>` : ''}
                    </div>`;
                }

                // Sezione Mappa (Accordion)
                const mapToggleSection = `
                    <button id="btn-bus-map-toggle" onclick="toggleBusMap()" class="toggle-info-btn bus-style">
                        🗺️ MOSTRA MAPPA FERMATE ▾
                    </button>
                    <div id="bus-map-wrapper" style="display:none; margin-bottom: 20px;">
                        <div id="bus-map" style="height: 280px; width: 100%; border-radius: 12px; z-index: 1; border: 2px solid #FFF59D;"></div>
                        <p style="font-size:0.75rem; text-align:center; color:#999; margin-top:5px;">Tocca i segnaposto per impostare Partenza/Arrivo</p>
                    </div>`;

                customContent = `
                <div class="bus-search-box theme-bus animate-fade">
                    <div class="bus-title theme-bus">
                        <span class="material-icons">directions_bus</span> Bus & Navette
                    </div>
                    
                    ${ticketSection}
                    ${mapToggleSection}

                    <div class="bus-inputs">
                        <div style="flex:1;">
                            <label class="input-group-label">PARTENZA</label>
                            <select id="selPartenza" class="bus-select"><option value="" disabled selected>Seleziona...</option>${options}</select>
                        </div>
                        <div style="flex:1;">
                            <label class="input-group-label">ARRIVO</label>
                            <select id="selArrivo" class="bus-select"><option value="" disabled selected>Seleziona...</option>${options}</select>
                        </div>
                    </div>
                    <div class="bus-inputs">
                        <div style="flex:1;">
                            <label class="input-group-label">DATA</label>
                            <input type="date" id="selData" class="bus-select" value="${todayISO}">
                        </div>
                        <div style="flex:1;">
                            <label class="input-group-label">ORA</label>
                            <input type="time" id="selOra" class="bus-select" value="${nowTime}">
                        </div>
                    </div>
                    
                    <button id="btnSearchBus" onclick="eseguiRicercaBus()" class="btn-yellow">
                        <span class="material-icons">search</span> TROVA ORARI
                    </button>

                    <div id="busResultsContainer" style="display:none; margin-top:20px; border-top:1px dashed #FBC02D; padding-top:15px;">
                        <div id="nextBusCard" class="next-bus-card animate-fade"></div>
                        <div id="otherBusList" class="other-bus-list"></div>
                    </div>
                </div>`;
                
                // Init mappa dopo render
                setTimeout(() => { if(window.initBusMap) window.initBusMap(fermate); }, 300);
            } else {
                customContent = `<p style="color:red; text-align:center;">Errore caricamento fermate.</p>`;
            }
        } 
        // --- B) BATTELLO: Blu, Ticket Info, Ricerca ---
        else if (isFerry) {
             setTimeout(() => window.initFerrySearch(), 50);
             
             // Sezione Biglietti (Accordion) per Battello
             let ticketSection = '';
             if (hasTicketInfo) {
                 ticketSection = `
                 <button onclick="toggleTicketInfo()" class="toggle-info-btn ferry-style">
                     🎟️ COME ACQUISTARE IL BIGLIETTO ▾
                 </button>
                 <div id="ticket-info-box" style="display:none;" class="info-dropdown-content">
                     ${infoSms ? `<p style="margin-bottom:10px;"><strong>📱 SMS</strong><br>${infoSms}</p>` : ''}
                     ${infoApp ? `<p style="margin-bottom:10px;"><strong>📲 APP</strong><br>${infoApp}</p>` : ''}
                     ${infoAvvisi ? `<div style="background:#e1f5fe; color:#01579b; padding:10px; border-radius:6px; font-size:0.85rem; border:1px solid #b3e5fc; margin-top:10px;"><strong>ℹ️ INFO:</strong> ${infoAvvisi}</div>` : ''}
                 </div>`;
             }

             customContent = `
             <div class="bus-search-box theme-ferry animate-fade">
                <div class="bus-title theme-ferry">
                    <span class="material-icons">directions_boat</span> Traghetti
                </div>
                
                ${ticketSection}

                <div class="bus-inputs" style="margin-top:15px;">
                    <div style="flex:1;">
                        <label class="input-group-label" style="color:#0277BD;">PARTENZA</label>
                        <select id="selPartenzaFerry" class="bus-select"><option>${t('loading')}</option></select>
                    </div>
                    <div style="flex:1;">
                        <label class="input-group-label" style="color:#0277BD;">ARRIVO</label>
                        <select id="selArrivoFerry" disabled class="bus-select"><option>--</option></select>
                    </div>
                </div>
                
                <div class="bus-inputs">
                    <div style="flex:1;">
                         <label class="input-group-label" style="color:#0277BD;">ORARIO MINIMO</label>
                         <input type="time" id="selOraFerry" class="bus-select" value="${new Date().toLocaleTimeString('it-IT', {hour:'2-digit', minute:'2-digit'})}">
                    </div>
                </div>

                <button onclick="eseguiRicercaTraghetto()" class="btn-blue">
                    <span class="material-icons">search</span> CERCA TRAGHETTO
                </button>

                <div id="ferryResultsContainer" style="display:none; margin-top:20px; border-top:1px dashed #4FC3F7; padding-top:15px;">
                    <div id="nextFerryCard" class="next-bus-card animate-fade" style="background: linear-gradient(135deg, #0288D1, #00BCD4);"></div>
                    <div id="otherFerryList" class="other-bus-list"></div>
                </div>
             </div>`;
        }
        // --- C) TRENO ---
        else if (isTrain) {
             const now = new Date();
             const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
             if (trainSearchRenderer) customContent = trainSearchRenderer(null, nowTime);
        }
        else { 
            // Fallback generico
            customContent = `<p style="color:#666;">${desc}</p>`; 
        }
        
        if (isBus || isTrain || isFerry) { contentHtml = customContent; } 
        else { contentHtml = `<h2>${nome}</h2><p style="color:#666;">${desc}</p>${customContent}`; }
    }
    
    // ============================================================
    // 3. SENTIERI
    // ============================================================
    else if (type === 'trail') {
        const p = data; 
        const titolo = dbCol(p, 'Paesi') || p.Nome;
        const nomeSentiero = p.Nome || '';
        const dist = p.Distanza || '--';
        const dura = p.Durata || '--';
        const diff = p.Tag || p.Difficolta || 'Media'; 
        const desc = dbCol(p, 'Descrizione') || '';
        let linkGpx = p.Link_Gpx || p.Link_gpx || p.gpxlink || p.Mappa || p.Gpx;
        if (!linkGpx) { const key = Object.keys(p).find(k => k.toLowerCase().includes('gpx') || k.toLowerCase().includes('mappa')); if (key) linkGpx = p[key]; }
        contentHtml = `<div style="padding: 20px 15px;"><h2 style="text-align:center; margin: 0 0 5px 0; color:#2c3e50;">${titolo}</h2>${nomeSentiero ? `<p style="text-align:center; color:#7f8c8d; margin:0 0 15px 0; font-size:0.9rem;">${nomeSentiero}</p>` : ''}<div class="trail-stats-grid"><div class="trail-stat-box"><span class="material-icons">straighten</span><span class="stat-value">${dist}</span><span class="stat-label">${t('distance')}</span></div><div class="trail-stat-box"><span class="material-icons">schedule</span><span class="stat-value">${dura}</span><span class="stat-label">${t('duration')}</span></div><div class="trail-stat-box"><span class="material-icons">terrain</span><span class="stat-value">${diff}</span><span class="stat-label">${t('level')}</span></div></div><div class="trail-actions-group" style="margin: 20px 0; display: flex; flex-direction: column; gap: 12px;">${linkGpx ? `<a href="${linkGpx}" download="${nomeSentiero || 'percorso'}.gpx" class="btn-download-gpx" target="_blank"><span class="material-icons">file_download</span> ${t('btn_download_gpx')}</a>` : `<div style="padding:15px; background:#fff5f5; border:1px solid #feb2b2; border-radius:10px; text-align:center; color:#c53030; font-size:0.85rem;"><span class="material-icons" style="vertical-align:middle; font-size:1.2rem;">error_outline</span> ${t('gpx_missing')}</div>`}</div><div style="margin-top:25px; line-height:1.6; color:#444; font-size:0.95rem; text-align:justify;">${desc}</div></div>`;
    }
    // ============================================================
    // 4. MAPPA GPX
    // ============================================================
    else if (type === 'map') {
        const gpxUrl = payload;
        const uniqueMapId = 'modal-map-' + Math.random().toString(36).substr(2, 9);
        contentHtml = `<h3 style="text-align:center; margin-bottom:10px;">${t('map_route_title')}</h3><div id="${uniqueMapId}" style="height: 450px; width: 100%; border-radius: 12px; border: 1px solid #ddd;"></div><p style="text-align:center; font-size:0.8rem; color:#888; margin-top:10px;">${t('map_zoom_hint')}</p>`;
        setTimeout(() => { if (document.getElementById(uniqueMapId) && typeof L !== 'undefined' && L.GPX) { const map = L.map(uniqueMapId); L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap, © CARTO', maxZoom: 20 }).addTo(map); new L.GPX(gpxUrl, { async: true, marker_options: { startIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-start.png', endIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-end.png', shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] }, polyline_options: { color: '#E76F51', weight: 5, opacity: 0.8 } }).on('loaded', function(e) { map.fitBounds(e.target.getBounds(), { padding: [30, 30] }); }).addTo(map); setTimeout(() => { map.invalidateSize(); }, 300); } }, 100);
    }
    // ============================================================
    // 5. RISTORANTE
    // ============================================================
    else if (type === 'ristorante' || type === 'restaurant') {
        const item = data; 
        const nome = dbCol(item, 'Nome');
        const indirizzo = dbCol(item, 'Paesi') || ''; 
        const desc = dbCol(item, 'Descrizioni') || t('desc_missing'); 
        contentHtml = `<div class="rest-modal-wrapper"><div class="rest-header"><h2>${nome}</h2><div class="rest-location"><span class="material-icons">place</span> ${indirizzo}</div><div class="rest-divider"></div></div><div class="rest-body">${desc}</div></div>`;
    }
    // ============================================================
    // 6. VINI
    // ============================================================
    else if (type === 'Vini' || type === 'wine') {
        if (!data) { modal.remove(); return; }
        const item = data; const nome = dbCol(item, 'Nome'); const tipo = dbCol(item, 'Tipo'); const produttore = dbCol(item, 'Produttore'); const uve = dbCol(item, 'Uve'); const gradi = dbCol(item, 'Gradi'); const abbinamenti = dbCol(item, 'Abbinamenti'); const desc = dbCol(item, 'Descrizione'); const foto = dbCol(item, 'Foto');
        const tVal = String(tipo).toLowerCase(); let color = '#9B2335'; if (tVal.includes('bianco')) color = '#F4D03F'; if (tVal.includes('rosato') || tVal.includes('orange')) color = '#E67E22'; 
        contentHtml = `<div style="padding-bottom: 20px;">${foto ? `<img src="${foto}" style="width:100%; height:280px; object-fit:cover; border-radius:24px 24px 0 0;">` : `<div style="text-align:center; padding: 30px 20px 20px; background: #fff; border-bottom: 1px dashed #eee;"><i class="fa-solid fa-wine-bottle" style="font-size: 4.5rem; color: ${color}; margin-bottom:15px; filter: drop-shadow(0 4px 5px rgba(0,0,0,0.1));"></i></div>`}<div style="padding: ${foto ? '25px 25px 0' : '0 25px'};"><h2 style="font-family:'Roboto Slab'; font-size:2rem; margin:0 0 5px 0; line-height:1.1; color:#2c3e50;">${nome}</h2><div style="font-weight:700; color:#7f8c8d; text-transform:uppercase; font-size:0.9rem; margin-bottom:20px;"><span class="material-icons" style="vertical-align:text-bottom; font-size:1.1rem;">storefront</span> ${produttore}</div></div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 15px 25px; background: #fafafa;"><div style="background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; text-align:center;"><div style="font-size:0.7rem; text-transform:uppercase; color:#999; font-weight:700;">${t('wine_type')}</div><div style="font-size:1rem; font-weight:700; color:${color}">${tipo || '--'}</div></div><div style="background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; text-align:center;"><div style="font-size:0.7rem; text-transform:uppercase; color:#999; font-weight:700;">${t('wine_deg')}</div><div style="font-size:1rem; font-weight:700;">${gradi || '--'}</div></div>${uve ? `<div style="grid-column:1/-1; background:#fff; border:1px solid #eee; border-radius:12px; padding:12px; text-align:center; font-size:0.95rem;"><strong>🍇 ${t('wine_grapes')}:</strong> ${uve}</div>` : ''}</div><div style="padding: 25px;"><p style="color:#555; font-size:1.05rem; line-height:1.6; margin:0;">${desc}</p>${abbinamenti ? `<div style="background: #FFF8E1; border-left: 4px solid #FFB74D; padding: 15px; border-radius: 8px; margin-top: 25px; color: #5D4037;"><div style="font-weight:bold; margin-bottom:5px; text-transform:uppercase; font-size:0.8rem;">🍽️ ${t('wine_pairings')}</div>${abbinamenti}</div>` : ''}</div></div>`;
    }
    // ============================================================
    // 7. ATTRAZIONI & SPIAGGE
    // ============================================================
    else if (type === 'Attrazioni' || type === 'attrazione' || type === 'Spiagge') {
        if (!data) { modal.remove(); return; }
        const item = data; 
        const titolo = dbCol(item, 'Attrazioni') || dbCol(item, 'Titolo') || dbCol(item, 'Nome') || 'Dettaglio';
        const curiosita = dbCol(item, 'Curiosita'); const desc = dbCol(item, 'Descrizione'); const img = dbCol(item, 'Immagine') || dbCol(item, 'Foto');
        const isSpiaggia = (type === 'Spiagge'); const tipoLabel = item.Tipo || '';
        contentHtml = `${img ? `<img src="${img}" class="monument-header-img">` : `<div class="monument-header-icon"><i class="fa-solid ${isSpiaggia ? 'fa-water' : 'fa-landmark'}" style="font-size:4rem; color:#546e7a;"></i></div>`}<div style="padding: 0 25px 30px;"><h2 style="font-family:'Roboto Slab'; font-size:2rem; margin: ${img ? '0' : '20px'} 0 10px 0; color:#2c3e50; line-height:1.1;">${titolo}</h2>${tipoLabel ? `<span class="c-pill" style="margin-bottom:15px; display:inline-block;">${tipoLabel}</span>` : ''}<div style="width:50px; height:4px; background:#e74c3c; margin-bottom:20px; border-radius:2px;"></div>${curiosita ? `<div class="curiosity-box animate-fade"><div class="curiosity-title"><span class="material-icons" style="font-size:1rem;">lightbulb</span> ${t('label_curiosity')}</div><div style="font-style:italic; line-height:1.5;">${curiosita}</div></div>` : ''}<p style="color:#374151; font-size:1.05rem; line-height:1.7; text-align:justify;">${desc || t('desc_missing')}</p></div>`;
    }
    // ============================================================
    // 8. FARMACIA
    // ============================================================
    else if (type === 'farmacia') {
         const item = data; const nome = dbCol(item, 'Farmacia') || dbCol(item, 'Nome') || 'Farmacia'; const paesi = dbCol(item, 'Paesi') || '';
         contentHtml = `<h2>${nome}</h2><p>📍 ${item.Indirizzo || ''}, ${paesi}</p><p>📞 <a href="tel:${item.Numero || item.Telefono}">${item.Numero || item.Telefono}</a></p>`;
    }

    modal.innerHTML = `<div class="${modalClass}"><span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>${contentHtml}</div>`;
}