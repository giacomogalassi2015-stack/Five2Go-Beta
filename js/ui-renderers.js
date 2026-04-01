// ════════════════════════════════════════════════════
//  SKELETON LOADERS
// ════════════════════════════════════════════════════
window.renderSkeletonList = function(tableName) {
    if (tableName === 'Vini') {
        return Array(4).fill(0).map(() => `
        <div class="flex bg-white rounded-2xl border border-slate-100 overflow-hidden min-h-[140px] mb-3 animate-pulse">
            <div class="w-24 bg-slate-200 shrink-0"></div>
            <div class="flex-1 p-4 flex flex-col gap-3 justify-center">
                <div class="h-3 bg-slate-200 rounded-full w-1/4"></div>
                <div class="h-5 bg-slate-200 rounded-full w-3/4"></div>
                <div class="h-3 bg-slate-200 rounded-full w-1/2"></div>
                <div class="mt-auto pt-3 border-t border-slate-100 flex justify-end">
                    <div class="h-7 w-24 bg-slate-200 rounded-xl"></div>
                </div>
            </div>
        </div>`).join('');
    }
    if (tableName === 'Farmacie' || tableName === 'Numeri_utili') {
        return '<div class="flex flex-col gap-2">' + Array(6).fill(0).map(() => `
        <div class="flex items-center p-4 bg-white rounded-2xl border border-slate-100 animate-pulse">
            <div class="w-12 h-12 rounded-xl bg-slate-200 shrink-0 mr-4"></div>
            <div class="flex-1 space-y-2">
                <div class="h-4 bg-slate-200 rounded-full w-2/3"></div>
                <div class="h-3 bg-slate-200 rounded-full w-1/3"></div>
            </div>
            <div class="w-11 h-11 rounded-full bg-slate-100 ml-3 shrink-0"></div>
        </div>`).join('') + '</div>';
    }
    if (tableName === 'Prodotti') {
        return '<div class="grid grid-cols-2 gap-3">' + Array(6).fill(0).map(() => `
        <div class="bg-white rounded-2xl overflow-hidden animate-pulse">
            <div class="h-40 bg-slate-200"></div>
            <div class="p-3 space-y-2">
                <div class="h-4 bg-slate-200 rounded-full w-3/4"></div>
                <div class="h-3 bg-slate-200 rounded-full w-1/2"></div>
            </div>
        </div>`).join('') + '</div>';
    }
    return Array(3).fill(0).map(() => `
    <div class="bg-white rounded-2xl overflow-hidden mb-4 animate-pulse">
        <div class="h-52 bg-slate-200 w-full relative">
            <div class="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                <div class="h-3 bg-slate-300/60 rounded-full w-1/4"></div>
                <div class="h-5 bg-slate-300/60 rounded-full w-3/5"></div>
            </div>
        </div>
        <div class="px-4 py-3 flex gap-2 justify-end">
            <div class="h-10 w-24 bg-slate-100 rounded-xl"></div>
            <div class="h-10 w-20 bg-slate-100 rounded-xl"></div>
        </div>
    </div>`).join('');
};

/** HELPER: CANDY BTN (Per le altre card standard) */
function getCandyBtn(icon, label, color, onclick) {
    // Colori pastello/soft meno vibranti
    const colors = {
        'orange': 'bg-orange-50 text-orange-600 border-orange-100', 
        'blue':   'bg-sky-50 text-sky-600 border-sky-100',       
        'green':  'bg-emerald-50 text-emerald-600 border-emerald-100',    
        'red':    'bg-rose-50 text-rose-600 border-rose-100',
        'purple': 'bg-slate-50 text-slate-600 border-slate-200',
        'yellow': 'bg-amber-50 text-amber-600 border-amber-100', 
    };
    const theme = colors[color] || colors['blue'];

    return `
    <button class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl ${theme} border shadow-sm active:scale-95 transition-all duration-200 cursor-pointer touch-manipulation" onclick="${onclick}">
        <span class="material-icons text-sm">${icon}</span>
        ${label ? `<span class="text-[11px] font-bold uppercase tracking-wide">${label}</span>` : ''}
    </button>`;
}
function renderMasterCard({ id, onClick, label, title, subText, image, iconFallback, themeColor, buttonsHtml, heartOverlayHtml, chips }) {
    const esc = window.escapeHtml || (s => s);
    title = esc(title); subText = esc(subText); label = esc(label);

    // Genera HTML chip per il banner azioni (pill informative a sinistra dei bottoni)
    const chipsBarHtml = (chips && chips.length)
        ? `<div class="flex items-center gap-1.5 mr-auto min-w-0">${chips.map(c => `<span class="mc-chip-bar"><span class="material-icons" style="font-size:13px;">${esc(c.icon)}</span>${esc(c.text)}</span>`).join('')}</div>`
        : '';

    if (image) {
        return `
        <div class="bg-white rounded-2xl shadow-soft overflow-hidden flex flex-col relative group cursor-pointer hover:shadow-lg transition-all duration-300 active:scale-[0.98] active:shadow-sm touch-manipulation border border-slate-100/30 master-card"
            data-card-id="${id}" onclick="${onClick}">
            <div class="master-card-img w-full relative overflow-hidden shrink-0">
                <img src="${image}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" alt="${title}">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
                ${heartOverlayHtml || ''}
                <div class="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <h3 class="font-serif text-lg font-bold text-white leading-tight drop-shadow-sm line-clamp-2">${title}</h3>
                </div>
            </div>
            <div class="px-3 py-2 flex items-center gap-2 bg-white shrink-0">
                ${chipsBarHtml}
                <div class="flex items-center gap-2 shrink-0">
                    ${buttonsHtml}
                </div>
            </div>
        </div>`;
    } else {
        const bgMap = {
            'orange': 'from-orange-100 to-orange-50 text-ct-terracotta',
            'blue':   'from-cyan-100 to-cyan-50 text-ct-blue',
            'green':  'from-lime-100 to-lime-50 text-ct-green',
            'yellow': 'from-yellow-100 to-yellow-50 text-yellow-600',
            'purple': 'from-slate-100 to-slate-50 text-slate-500',
            'red':    'from-red-100 to-red-50 text-red-500'
        };
        const themeClass = bgMap[themeColor] || bgMap['blue'];
        return `
        <div class="bg-white rounded-2xl shadow-soft overflow-hidden flex flex-col relative group cursor-pointer hover:shadow-lg transition-all duration-300 active:scale-[0.98] active:shadow-sm touch-manipulation border border-slate-100/30 master-card"
            data-card-id="${id}" onclick="${onClick}">
            <div class="h-36 w-full bg-gradient-to-br ${themeClass} relative overflow-hidden shrink-0">
                <span class="material-icons absolute text-[8rem] opacity-10 -bottom-4 -right-4 transform rotate-[-10deg] select-none">${iconFallback}</span>
                <span class="material-icons text-5xl absolute bottom-4 left-4 drop-shadow-sm opacity-90 z-10">${iconFallback}</span>
                ${label ? `<div class="absolute top-3 left-3 z-10">
                    <span class="inline-flex items-center gap-1 bg-white/60 backdrop-blur-sm text-slate-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">${label}</span>
                </div>` : ''}
                ${heartOverlayHtml || ''}
            </div>
            <div class="px-4 pt-3 pb-1 min-w-0">
                <h3 class="font-serif text-lg font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors line-clamp-2">${title}</h3>
                ${subText ? `<p class="text-xs text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">${subText}</p>` : ''}
            </div>
            <div class="px-3 py-2 flex items-center gap-2 bg-white">
                ${chipsBarHtml}
                <div class="flex items-center gap-2 shrink-0">
                    ${buttonsHtml}
                </div>
            </div>
        </div>`;
    }
}

function renderWineCard({ id, onClick, typeLabel, title, producer, grapes, themeColor, buttonsHtml, heartOverlayHtml }) {
    const esc = window.escapeHtml || (s => s);
    title = esc(title); typeLabel = esc(typeLabel); producer = esc(producer); grapes = esc(grapes);
    const colors = {
        'yellow': 'bg-[#E9C46A] text-yellow-900', 
        'red':    'bg-[#9B2226] text-red-100',     
        'orange': 'bg-[#E76F51] text-orange-100'   
    };
    const themeClass = colors[themeColor] || colors['red'];
    const iconColor = themeColor === 'yellow' ? 'text-yellow-800' : 'text-white';

    return `
    <div class="flex bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[140px] cursor-pointer touch-manipulation active:scale-[0.98] active:shadow-sm transition-all duration-150 mb-3 group relative" data-card-id="${id}" onclick="${onClick}">
        <div class="w-24 ${themeClass} flex items-center justify-center relative overflow-hidden shrink-0">
            <span class="material-icons text-4xl ${iconColor} drop-shadow-sm opacity-90 relative z-10">wine_bar</span>
        </div>
        ${heartOverlayHtml || ''}
        <div class="flex-1 p-4 flex flex-col relative bg-white min-w-0">
            <div class="mb-2 pr-8">
                <span class="inline-block px-2 py-0.5 rounded border border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-widest text-slate-500 font-sans">
                    ${typeLabel}
                </span>
            </div>
            <h3 class="font-serif text-lg font-bold text-slate-800 leading-snug mb-1 pr-2 group-hover:text-ct-terracotta transition-colors line-clamp-2">${title}</h3>
            <div class="flex items-center gap-1.5 mb-3 min-w-0">
                <span class="material-icons text-[14px] text-slate-300 shrink-0">storefront</span>
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wide truncate">${producer}</span>
            </div>
           <div class="mt-auto pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <div class="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
                    <span class="text-[11px] font-bold uppercase">${window.t('btn_details')}</span>
                    <span class="material-icons text-xs">arrow_forward</span>
                </div>
                ${buttonsHtml || ''}
            </div>
        </div>
    </div>`;
}

function renderUtilityCard({ id, icon, title, subtitle, phone, color }) {
    const esc = window.escapeHtml || (s => s);
    title = esc(title); subtitle = esc(subtitle);
    const iconColors = {
        'green': 'bg-green-100 text-green-700', 'blue': 'bg-blue-100 text-blue-700',
        'purple': 'bg-purple-100 text-purple-700', 'red': 'bg-red-100 text-red-700'
    };
    const iconTheme = iconColors[color] || iconColors['blue'];
    // MODIFICA 4: Ridotto mb-3 a mb-2
    return `
    <div class="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm mb-2 animate-pop active:scale-[0.98] active:shadow-none transition-all duration-150 touch-manipulation cursor-pointer" data-card-id="${id || ''}">
        <div class="w-12 h-12 rounded-xl ${iconTheme} flex items-center justify-center shrink-0 mr-4">
            <span class="material-icons text-2xl">${icon}</span>
        </div>
        <div class="flex-1 min-w-0">
            <h3 class="font-bold text-slate-800 text-sm truncate">${title}</h3>
            <p class="text-[11px] font-bold uppercase text-slate-400 tracking-wide truncate">${subtitle}</p>
        </div>
        ${phone ? `<button onclick="window.location.href='tel:${phone}'" class="ml-3 w-11 h-11 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 active:bg-slate-100 active:scale-95 transition-all touch-manipulation cursor-pointer"><span class="material-icons text-xl">call</span></button>` : ''}
    </div>`;
}

// --- RENDERERS ---

window.ristoranteRenderer = (r) => {
    const nome = window.dbCol(r, 'Nome') || 'Ristorante';
    const nomeIT = window.valIT(r, 'Nome'); 
    const paesi = window.dbCol(r, 'Paesi') || '5 Terre';
    const desc = window.dbCol(r, 'Descrizioni') || '';
    const safeObj = encodeURIComponent(JSON.stringify(r)).replace(/'/g, "%27");
    const mapLink = r.Mappa || '#';
    const numero = r.Numero || r.Telefono;
    const imgUrl = nomeIT ? window.getSmartUrl(nomeIT, '', 600) : null;

    // Chip informativi — solo paese (telefono già nei bottoni azione)
    const chips = [];
    if (paesi) chips.push({ icon: 'place', text: paesi });

    // Oggetti per wishlist (V1.0: itinerario rimosso)
    const wlItem = { wl_id: String(r.id || nomeIT), wl_type: 'ristorante', wl_name: nome, wl_sub: paesi, wl_modal_type: 'ristorante', wl_modal_payload: safeObj };

    return renderMasterCard({
        id: r.id,
        onClick: `openModal('ristorante', '${safeObj}')`,
        label: `📍 ${paesi}`,
        title: nome,
        subText: '',
        image: imgUrl,
        iconFallback: 'restaurant',
        themeColor: 'yellow',
        chips: chips,
        heartOverlayHtml: window.renderHeartBtnOverlay ? window.renderHeartBtnOverlay(wlItem) : '',
        buttonsHtml: `
            ${getCandyBtn('visibility', window.t('btn_details'), 'blue', `event.stopPropagation(); openModal('ristorante', '${safeObj}')`)}
            ${getCandyBtn('map', window.t('btn_map'), 'green', `event.stopPropagation(); window.open('${mapLink}', '_blank')`)}
            ${numero ? getCandyBtn('call', 'Tel', 'green', `event.stopPropagation(); window.location.href='tel:${numero}'`) : ''}
        `
    });
};

window.attrazioniRenderer = function(item) {
    const safeId = item.POI_ID || item.id;
    const titolo = window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo');
    const titoloIT = window.valIT(item, 'Attrazioni') || window.valIT(item, 'Titolo'); 
    const paese = window.dbCol(item, 'Paese');
    
    const imgUrl = titoloIT ? window.getSmartUrl(titoloIT, '', 600) : null;
    
    const labelRaw = String(window.valIT(item, 'Label')).toLowerCase();
    const lat = item.lat_at; const lon = item.long_at;

    let catLabel = window.t('cat_culture'); let themeColor = 'blue'; let iconFallback = 'landmark';
    if (labelRaw.includes('religi') || labelRaw.includes('chies')) { catLabel = window.t('cat_sacred'); themeColor = 'yellow'; iconFallback = 'church'; }
    else if (labelRaw.includes('panoram') || labelRaw.includes('natur')) { catLabel = window.t('cat_panorama'); themeColor = 'green'; iconFallback = 'landscape'; }
    else if (labelRaw.includes('stori') || labelRaw.includes('castell')) { catLabel = window.t('cat_history'); themeColor = 'orange'; iconFallback = 'castle'; }

    // Chip informativi
    const chips = [];
    if (paese) chips.push({ icon: 'place', text: paese });

    // Oggetti per wishlist (V1.0: itinerario rimosso)
    const wlItem   = { wl_id: String(safeId), wl_type: 'attrazione', wl_name: titolo, wl_sub: paese, wl_modal_type: 'attrazione', wl_modal_payload: String(safeId) };

  return renderMasterCard({
        id: safeId,
        onClick: `openModal('attrazione', '${safeId}')`,
        label: `${catLabel} • ${paese}`,
        title: titolo,
        subText: '',
        image: imgUrl,
        iconFallback: iconFallback,
        themeColor: themeColor,
        chips: chips,
        heartOverlayHtml: window.renderHeartBtnOverlay ? window.renderHeartBtnOverlay(wlItem) : '',
        buttonsHtml: `
            ${getCandyBtn('visibility', window.t('btn_details'), 'blue', `event.stopPropagation(); openModal('attrazione', '${safeId}')`)}
            ${(lat && lon) ? getCandyBtn('map', window.t('btn_map'), 'green', `window.openMapBtn(event, ${lat}, ${lon})`) : ''}
        `
    });
};

window.spiaggiaRenderer = function(item) {
    const safeObj = encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27");
    const nome = window.dbCol(item, 'Nome');
    const nomeIT = window.valIT(item, 'Nome'); 
    const paesi = window.dbCol(item, 'Paesi');
    const tipo = window.dbCol(item, 'Tipo') || 'Mare';
    const lat = item.lat_sp; const lon = item.long_sp;
    const imgUrl = nomeIT ? window.getSmartUrl(nomeIT, '', 600) : null;

    // Chip informativi
    const chips = [];
    if (tipo) chips.push({ icon: 'waves', text: tipo });
    if (paesi) chips.push({ icon: 'place', text: paesi });

    // Oggetti per wishlist (V1.0: itinerario rimosso)
    const wlItem   = { wl_id: String(item.id), wl_type: 'spiaggia', wl_name: nome, wl_sub: paesi, wl_modal_type: 'Spiagge', wl_modal_payload: safeObj };

    return renderMasterCard({
        id: item.id,
        onClick: `openModal('Spiagge', '${safeObj}')`,
        label: `${tipo} • ${paesi}`,
        title: nome,
        subText: '',
        image: imgUrl,
        iconFallback: 'waves',
        themeColor: 'blue',
        chips: chips,
        heartOverlayHtml: window.renderHeartBtnOverlay ? window.renderHeartBtnOverlay(wlItem) : '',
        buttonsHtml: `
            ${getCandyBtn('visibility', window.t('btn_details'), 'blue', `event.stopPropagation(); openModal('Spiagge', '${safeObj}')`)}
            ${(lat && lon) ? getCandyBtn('map', window.t('btn_map'), 'green', `window.openMapBtn(event, ${lat}, ${lon})`) : ''}
        `
    });
};

window.prodottoRenderer = (p) => {
    const titolo   = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
    const titoloIT = window.valIT(p, 'Prodotti')  || window.valIT(p, 'Nome');
    const fotoKey  = p.Prodotti_foto || titoloIT;
    const imgUrl   = window.getSmartUrl(fotoKey, '', 600);
    const safeObj  = encodeURIComponent(JSON.stringify(p)).replace(/'/g, "%27");

    // FIX: p.id era undefined su tutti i prodotti → tutti condividevano
    // wl_id:"undefined" e il toggle appariva attivo su tutte le card.
    // titoloIT è unico per prodotto nel DB e funziona come fallback affidabile.
    const itemId = String(p.id != null ? p.id : (titoloIT || fotoKey || titolo || Math.random()));

    const wlItem   = { wl_id: itemId, wl_type: 'prodotto', wl_name: titolo, wl_sub: 'Prodotto locale', wl_modal_type: 'product', wl_modal_payload: safeObj };

    return renderMasterCard({
        id: p.id,
        onClick: `openModal('product', '${safeObj}')`,
        label: null, 
        title: titolo,
        subText: '', // <-- Rimossa la descrizione come da richiesta
        image: imgUrl,
        iconFallback: 'restaurant',
        themeColor: 'orange',
        heartOverlayHtml: window.renderHeartBtnOverlay ? window.renderHeartBtnOverlay(wlItem) : '',
        buttonsHtml: `
            <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest mr-auto flex items-center gap-1">${window.t('btn_details')} <span class="material-icons text-xs">chevron_right</span></span>
        `
    });
};

window.vinoRenderer = function(item) {
    const safeId = item.id || item.ID; 
    const nome = item.Nome || 'Vino';
    const cantina = item.Produttore || 'Cantina Locale'; 
    const uve = window.dbCol(item, 'Uve');
    
    let tipoIT = String(window.valIT(item, 'Tipo')).toLowerCase();
    
    let themeColor = 'red';
    let tipoLabel = window.t('wine_red'); 
    
    if (tipoIT.includes('bianco')) { 
        themeColor = 'yellow'; 
        tipoLabel = window.t('wine_white'); 
    }
    else if (tipoIT.includes('sciacchetr') || tipoIT.includes('dolce') || tipoIT.includes('passito')) { 
        themeColor = 'orange'; 
        tipoLabel = window.t('wine_passito'); 
    }

    // Oggetti per wishlist (V1.0: itinerario rimosso)
    const wlItem   = { wl_id: String(safeId), wl_type: 'vino', wl_name: nome, wl_sub: cantina, wl_modal_type: 'Vini', wl_modal_payload: String(safeId) };
    
    return renderWineCard({
        id: safeId,
        onClick: `openModal('Vini', '${safeId}')`,
        typeLabel: tipoLabel, 
        title: nome,
        producer: cantina,
        grapes: uve,
        themeColor: themeColor,
        heartOverlayHtml: window.renderHeartBtnOverlay ? window.renderHeartBtnOverlay(wlItem, 'light') : '',
        buttonsHtml: ``
    });
};

window.sentieroRenderer = (s) => {
    const uniqueId = 'k-map-' + (s.poi_id || Math.floor(Math.random() * 99999));
    const nome = s.nome || s.Titolo || 'Sentiero';
    const safeObj = encodeURIComponent(JSON.stringify(s)).replace(/'/g, "%27");
    const durata = s.durata_minuti ? s.durata_minuti + ' min' : (s.Durata || '--');
    const dist = s.distanza_km ? s.distanza_km + ' km' : (s.Distanza || '--');

    if(s.gpx_url) { 
        if(!window.pendingMaps) window.pendingMaps = []; 
        window.pendingMaps.push({ id: uniqueId, gpx: s.gpx_url, startLabel: s.nome_partenza, endLabel: s.nome_arrivo }); 
    }

    // Oggetti per wishlist (V1.0: itinerario rimosso)
    const sId      = String(s.poi_id || s.id || uniqueId);
    const wlItem   = { wl_id: sId, wl_type: 'sentiero', wl_name: nome, wl_sub: durata + ' · ' + dist, wl_modal_type: 'sentieroInfo', wl_modal_payload: safeObj };

    return `
    <div class="bg-white rounded-2xl shadow-soft overflow-hidden flex flex-col h-full relative mb-4 group border border-slate-100/50 hover:shadow-lg transition-all">
        <div id="${uniqueId}" class="h-48 w-full bg-slate-100 relative border-b border-slate-100 cursor-pointer" onclick="window.openTechMap('${safeObj}')">
            <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[11px] font-bold text-ct-green shadow-sm z-[400] font-sans tracking-widest uppercase">
                🥾 Outdoor
            </div>
            ${window.renderHeartBtnOverlay ? window.renderHeartBtnOverlay(wlItem).replace('z-20', 'z-[401]') : ''}
            <div class="absolute inset-0 z-[300]"></div>
        </div>
        <div class="p-4 flex-1 flex flex-col min-w-0">
            <div class="flex items-center gap-2 mb-2">
                 <span class="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-sans">
                    ⏱ ${durata} • 📏 ${dist}
                 </span>
            </div>
            <h3 class="font-serif text-xl font-bold text-slate-800 leading-tight mb-2 line-clamp-2">${nome}</h3>
        </div>
        
        <div class="px-3 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center gap-2 flex-wrap">
             <button onclick="window.openTechMap('${safeObj}')" class="flex-1 min-w-[80px] py-2.5 bg-ct-green text-white rounded-xl font-bold text-[11px] uppercase tracking-wide shadow-sm active:scale-[0.97] transition-all duration-150 touch-manipulation flex items-center justify-center gap-1.5">
                <span class="material-icons text-sm">map</span> ${window.t('btn_map')}
             </button>
             <button onclick="window.openModal('sentieroInfo', '${safeObj}')" class="flex-1 min-w-[80px] py-2.5 bg-ct-blue text-white rounded-xl font-bold text-[11px] uppercase tracking-wide shadow-sm active:scale-[0.97] transition-all duration-150 touch-manipulation flex items-center justify-center gap-1.5">
                <span class="material-icons text-sm">visibility</span> ${window.t('btn_info')}
             </button>
        </div>
    </div>`;
};

window.farmacieRenderer = (f) => {
    // Estrazione sicura per il Nome (previene l'effetto [object Object])
    let nome = f.Nome; 
    try { 
        if (typeof nome === 'string' && nome.startsWith('{')) {
            const parsed = JSON.parse(nome);
            nome = parsed[window.currentLang] || parsed['it'] || parsed['en'];
        } else if (typeof nome === 'object' && nome !== null) {
            nome = nome[window.currentLang] || nome['it'] || nome['en'];
        }
    } catch(e) {}
    
    // Estrazione sicura per il Paese/Indirizzo
    let paesi = f.Paesi;
    try { 
        if (typeof paesi === 'string' && paesi.startsWith('{')) {
            const parsed = JSON.parse(paesi);
            paesi = parsed[window.currentLang] || parsed['it'] || parsed['en'];
        } else if (typeof paesi === 'object' && paesi !== null) {
            paesi = paesi[window.currentLang] || paesi['it'] || paesi['en'];
        }
    } catch(e) {}

    // Fallback finali se i campi sono comunque vuoti
    const fallbackNome = typeof nome === 'string' ? nome : 'Farmacia';
    const fallbackPaesi = typeof paesi === 'string' ? paesi : (f.Indirizzo || 'Servizio');

    return renderUtilityCard({
        id: f.id,
        icon: 'local_pharmacy',
        title: fallbackNome,
        subtitle: fallbackPaesi,
        phone: f.Numero,
        color: 'green'
    });
};

window.numeriUtiliRenderer = (n) => {
    let nome = n.Nome; 
    try { 
        if(typeof nome === 'string' && nome.startsWith('{')) {
            const parsed = JSON.parse(nome);
            nome = parsed[window.currentLang] || parsed['it'] || parsed['en'];
        } else if (typeof nome === 'object') {
            nome = nome[window.currentLang] || nome['it'];
        }
    } catch(e){}
    
    let icon = 'help'; let color = 'blue';
    const nomeCheck = String(nome).toLowerCase();
    if(nomeCheck.includes('carabinieri') || nomeCheck.includes('polizia')) { icon = 'local_police'; color = 'purple'; }
    if(nomeCheck.includes('emergenza') || String(n.Numero).includes('112')) { icon = 'emergency'; color = 'red'; }
    
    return renderUtilityCard({
        id: n.id,
        icon: icon,
        title: nome,
        subtitle: n.Paesi || 'Info',
        phone: n.Numero,
        color: color
    });
};

window.openMapBtn = function(e, lat, lon) {
    if (!e) return;
    e.stopPropagation(); e.preventDefault();
    // Usa maps.google.com diretto — funziona su tutti i browser/OS aprendo l'app nativa
    window.open(`https://www.google.com/maps?q=${lat},${lon}`, '_blank');
};