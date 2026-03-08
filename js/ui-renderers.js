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
    <button class="flex flex-col items-center justify-center gap-1 group/btn active:scale-95 transition-all duration-200 min-w-[50px] cursor-pointer touch-manipulation" onclick="${onclick}">
        <div class="h-11 w-11 rounded-xl ${theme} shadow-sm flex items-center justify-center border">
            <span class="material-icons text-lg">${icon}</span>
        </div>
        ${label ? `<span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover/btn:text-slate-600 transition-colors">${label}</span>` : ''}
    </button>`;
}
// MODIFICA 4: Ridotto mb-6 a mb-4 per avvicinare le schede (Prossimità)
function renderMasterCard({ id, onClick, label, title, subText, image, iconFallback, themeColor, buttonsHtml }) {
    let headerHtml = '';
    if (image) {
        headerHtml = `
            <div class="h-48 w-full relative overflow-hidden group-hover:opacity-90 transition-opacity">
                <img src="${image}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" alt="${title}">
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>`;
    } else {
        const bgMap = {
            'orange': 'bg-orange-50 text-ct-terracotta',
            'blue':   'bg-cyan-50 text-ct-blue',
            'green':  'bg-lime-50 text-ct-green',
            'yellow': 'bg-yellow-50 text-yellow-600',
            'purple': 'bg-slate-100 text-slate-500',
            'red':    'bg-red-50 text-red-500'
        };
        const themeClass = bgMap[themeColor] || bgMap['blue'];
        headerHtml = `
            <div class="h-40 w-full ${themeClass} flex items-center justify-center relative overflow-hidden">
                <span class="material-icons text-9xl opacity-10 absolute transform -rotate-12 scale-150">${iconFallback}</span>
                <span class="material-icons text-5xl relative z-10 drop-shadow-sm">${iconFallback}</span>
            </div>`;
    }

    return `
    <div class="bg-white rounded-2xl shadow-soft overflow-hidden flex flex-col h-full relative mb-4 group cursor-pointer touch-manipulation border border-slate-100/50 hover:shadow-lg transition-all duration-300 active:scale-[0.98] active:shadow-sm" data-card-id="${id}" onclick="${onClick}">
        ${headerHtml}
        <div class="p-5 flex-1 flex flex-col justify-start">
            ${label ? `
            <div class="flex items-center gap-2 mb-2">
                <span class="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-sans">${label}</span>
                <div class="h-px bg-slate-100 flex-1"></div>
            </div>` : ''}
            <h3 class="font-serif text-2xl font-bold text-slate-800 leading-tight mb-2 group-hover:text-primary transition-colors">${title}</h3>
            ${subText ? `<p class="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">${subText}</p>` : ''}
        </div>
        <div class="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-4 backdrop-blur-sm">
            ${buttonsHtml}
        </div>
    </div>`;
}

function renderWineCard({ id, onClick, typeLabel, title, producer, grapes, themeColor }) {
    const colors = {
        'yellow': 'bg-[#E9C46A] text-yellow-900', 
        'red':    'bg-[#9B2226] text-red-100',     
        'orange': 'bg-[#E76F51] text-orange-100'   
    };
    const themeClass = colors[themeColor] || colors['red'];
    const iconColor = themeColor === 'yellow' ? 'text-yellow-800' : 'text-white';

    // MODIFICA 4: Ridotto mb-5 a mb-3
    return `
    <div class="flex bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[140px] cursor-pointer touch-manipulation active:scale-[0.98] active:shadow-sm transition-all duration-150 mb-3 group" data-card-id="${id}" onclick="${onClick}">
        <div class="w-24 ${themeClass} flex items-center justify-center relative overflow-hidden shrink-0">
            <span class="material-icons text-4xl ${iconColor} drop-shadow-sm opacity-90 relative z-10">wine_bar</span>
        </div>
        <div class="flex-1 p-4 flex flex-col relative bg-white">
            <div class="mb-2">
                <span class="inline-block px-2 py-0.5 rounded border border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-widest text-slate-500 font-sans">
                    ${typeLabel}
                </span>
            </div>
            <h3 class="font-serif text-2xl font-bold text-slate-800 leading-snug mb-1 pr-2 group-hover:text-ct-terracotta transition-colors">${title}</h3>
            <div class="flex items-center gap-1.5 mb-3">
                <span class="material-icons text-[14px] text-slate-300">storefront</span>
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">${producer}</span>
            </div>
           <div class="mt-auto pt-3 border-t border-slate-100 flex items-center justify-end">
                <div class="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
                    <span class="text-[11px] font-bold uppercase">${window.t('btn_details')}</span>
                    <span class="material-icons text-xs">arrow_forward</span>
                </div>
            </div>
        </div>
    </div>`;
}

function renderUtilityCard({ id, icon, title, subtitle, phone, color }) {
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

    return renderMasterCard({
        id: r.id,
        onClick: `openModal('ristorante', '${safeObj}')`,
        label: `📍 ${paesi}`,
        title: nome,
        subText: desc || 'Cucina tipica locale.',
        image: imgUrl,
        iconFallback: 'restaurant',
        themeColor: 'yellow',
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

  return renderMasterCard({
        id: safeId,
        onClick: `openModal('attrazione', '${safeId}')`,
        label: `${catLabel} • ${paese}`,
        title: titolo,
        subText: window.dbCol(item, 'Descrizione') || 'Scopri questo luogo.',
        image: imgUrl,
        iconFallback: iconFallback,
        themeColor: themeColor,
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

    return renderMasterCard({
        id: item.id,
        onClick: `openModal('Spiagge', '${safeObj}')`,
        label: `${tipo} • ${paesi}`,
        title: nome,
        subText: 'Relax, sole e mare cristallino.',
        image: imgUrl,
        iconFallback: 'waves',
        themeColor: 'blue',
        buttonsHtml: `
            ${getCandyBtn('visibility', window.t('btn_details'), 'blue', `event.stopPropagation(); openModal('Spiagge', '${safeObj}')`)}
            ${(lat && lon) ? getCandyBtn('map', window.t('btn_map'), 'green', `window.openMapBtn(event, ${lat}, ${lon})`) : ''}
        `
    });
};

window.prodottoRenderer = (p) => {
    const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
    const titoloIT = window.valIT(p, 'Prodotti') || window.valIT(p, 'Nome');
    const fotoKey = p.Prodotti_foto || titoloIT; 
    const imgUrl = window.getSmartUrl(fotoKey, '', 600);
    const safeObj = encodeURIComponent(JSON.stringify(p)).replace(/'/g, "%27");

    return renderMasterCard({
        id: p.id,
        onClick: `openModal('product', '${safeObj}')`,
        label: null, 
        title: titolo,
        subText: '', // <-- Rimossa la descrizione come da richiesta
        image: imgUrl,
        iconFallback: 'restaurant',
        themeColor: 'orange',
        buttonsHtml: `
            <div class="text-xs font-bold text-slate-300 uppercase tracking-widest mr-auto mt-2">${window.t('btn_details')}</div>
            ${getCandyBtn('chevron_right', '', 'blue', `event.stopPropagation(); openModal('product', '${safeObj}')`)}
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
    
    return renderWineCard({
        id: safeId,
        onClick: `openModal('Vini', '${safeId}')`,
        typeLabel: tipoLabel, 
        title: nome,
        producer: cantina,
        grapes: uve,
        themeColor: themeColor
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

    // FIX 2: Rimosso onclick duplicato nel div interno "absolute inset-0"
    return `
    <div class="bg-white rounded-2xl shadow-soft overflow-hidden flex flex-col h-full relative mb-4 group border border-slate-100/50 hover:shadow-lg transition-all">
        <div id="${uniqueId}" class="h-48 w-full bg-slate-100 relative border-b border-slate-100 cursor-pointer" onclick="window.openTechMap('${safeObj}')">
            <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[11px] font-bold text-ct-green shadow-sm z-[400] font-sans tracking-widest uppercase">
                🥾 Outdoor
            </div>
            <div class="absolute inset-0 z-[300]"></div>
        </div>
        <div class="p-5 flex-1 flex flex-col">
            <div class="flex items-center gap-2 mb-2">
                 <span class="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-sans">
                    ⏱ ${durata} • 📏 ${dist}
                 </span>
            </div>
            <h3 class="font-serif text-2xl font-bold text-slate-800 leading-tight mb-2">${nome}</h3>
        </div>
        
        <div class="px-4 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center gap-2.5">
             <button onclick="window.openTechMap('${safeObj}')" class="flex-1 py-3 bg-ct-green text-white rounded-xl font-bold text-xs uppercase tracking-wide shadow-sm active:scale-[0.97] transition-all duration-150 touch-manipulation flex items-center justify-center gap-2">
                <span class="material-icons text-sm">map</span> ${window.t('btn_map')}
             </button>
             <button onclick="window.openModal('sentieroInfo', '${safeObj}')" class="flex-1 py-3 bg-ct-blue text-white rounded-xl font-bold text-xs uppercase tracking-wide shadow-sm active:scale-[0.97] transition-all duration-150 touch-manipulation flex items-center justify-center gap-2">
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