console.log("✅ 2. ui-renderers.js caricato (Tailwind JSON FIX)");

// === RISTORANTE CARD ===
window.ristoranteRenderer = (r) => {
    const nome = window.dbCol(r, 'Nome') || 'Ristorante';
    const paesi = window.dbCol(r, 'Paesi') || '';
    const numero = r.Numero || r.Telefono || r.telefono || r.numero || '';
    const safeObj = encodeURIComponent(JSON.stringify(r)).replace(/'/g, "%27");
    const mapLink = r.Mappa || '#';

    return `
    <div class="glass-panel rounded-[2rem] p-6 mb-5 shadow-soft relative overflow-hidden flex flex-col items-center text-center animate-fade"> 
        <h3 class="font-serif text-2xl font-bold text-slate-800 mb-2 leading-tight">${nome}</h3>
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-1">
            <span class="material-icons text-sm text-yellow-500">restaurant</span> ${paesi}
        </p>
        
        <div class="flex gap-4 justify-center w-full">
            <button class="w-12 h-12 rounded-full border-2 border-white bg-yellow-400 text-white shadow-md flex items-center justify-center active:scale-90 transition-transform" onclick="openModal('ristorante', '${safeObj}')">
                <span class="material-icons">info_outline</span>
            </button>
            ${numero ? `
                <button class="w-12 h-12 rounded-full border-2 border-white bg-green-500 text-white shadow-md flex items-center justify-center active:scale-90 transition-transform" onclick="window.location.href='tel:${numero}'">
                    <span class="material-icons">call</span>
                </button>` : ''}
            <button class="w-12 h-12 rounded-full border-2 border-white bg-sky-500 text-white shadow-md flex items-center justify-center active:scale-90 transition-transform" onclick="window.open('${mapLink}', '_blank')">
                <span class="material-icons">map</span>
            </button>
        </div>
    </div>`;
};

// === PRODOTTO CARD ===
window.prodottoRenderer = (p) => {
    const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
    const fotoKey = p.Prodotti_foto || titolo;
    const imgUrl = window.getSmartUrl(fotoKey, '', 200);
    const safeObj = encodeURIComponent(JSON.stringify(p)).replace(/'/g, "%27");

    return `
    <div class="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex items-center justify-between gap-3 animate-fade active:scale-[0.98] transition-transform" onclick="openModal('product', '${safeObj}')">
        <div class="flex-1 pl-2">
            <div class="font-serif font-bold text-lg text-accent leading-tight">${titolo}</div>
        </div>
        <div class="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
            <img src="${imgUrl}" loading="lazy" class="w-full h-full object-cover" alt="${titolo}">
        </div>
    </div>`;
};

// === VINO CARD ===
window.vinoRenderer = function(item) {
    const safeId = item.id || item.ID; 
    const nome = item.Nome || 'Vino';
    const cantina = item.Produttore || ''; 
    const tipo = (item.Tipo || '').toLowerCase().trim();

    let borderClass = 'border-l-red-800'; 
    let iconColor = 'text-red-800';
    if (tipo.includes('bianco')) { borderClass = 'border-l-yellow-400'; iconColor = 'text-yellow-400'; }
    if (tipo.includes('rosato') || tipo.includes('orange')) { borderClass = 'border-l-orange-500'; iconColor = 'text-orange-500'; }

    return `
    <div class="bg-white rounded-2xl p-5 mb-3 shadow-sm border-l-[6px] ${borderClass} relative overflow-hidden active:scale-[0.98] transition-transform animate-fade" onclick="openModal('Vini', '${safeId}')">
        <div class="relative z-10">
            ${cantina ? `<div class="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><span class="material-icons text-sm">storefront</span> ${cantina}</div>` : ''}
            <div class="font-serif font-bold text-xl text-slate-800 leading-tight mb-2 pr-8">${nome}</div>
            <span class="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md capitalize">${item.Tipo || 'Vino'}</span>
        </div>
        <div class="absolute -bottom-2 -right-2 opacity-10 transform -rotate-12 pointer-events-none">
            <i class="ph-fill ph-wine text-8xl ${iconColor}"></i>
        </div>
    </div>`;
};

// === SENTIERO CARD ===
window.sentieroRenderer = (s) => {
    const uniqueId = 'k-map-' + (s.poi_id || Math.floor(Math.random() * 99999));
    const nome = s.nome || s.Titolo || 'Sentiero';
    const safeObj = encodeURIComponent(JSON.stringify(s)).replace(/'/g, "%27");

    if(s.gpx_url) {
        if(!window.pendingMaps) window.pendingMaps = [];
        window.pendingMaps.push({ id: uniqueId, gpx: s.gpx_url, startLabel: s.nome_partenza, endLabel: s.nome_arrivo });
    }

    return `
    <div class="bg-white rounded-3xl overflow-hidden shadow-soft mb-6 border border-slate-100 animate-fade flex flex-col">
        <div id="${uniqueId}" class="h-48 w-full bg-slate-200 cursor-pointer" onclick="window.openTechMap('${safeObj}')"></div>
        
        <div class="p-4 bg-white">
            <h3 class="font-bold text-lg text-slate-800 mb-3">${nome}</h3>
            
            <div class="grid grid-cols-2 gap-3">
                <button class="flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-xl shadow-md shadow-primary/30 active:scale-95 transition-transform" onclick="window.openTechMap('${safeObj}')">
                    <span class="material-icons text-sm">map</span> Dati Tecnici
                </button>
                <button class="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl active:scale-95 transition-transform" onclick="window.openModal('sentieroInfo', '${safeObj}')">
                    <span class="material-icons text-sm">info</span> Info
                </button>
            </div>
        </div>
    </div>`;
};

// === SPIAGGIA CARD ===
window.spiaggiaRenderer = function(item) {
    let nome = window.dbCol(item, 'Nome') || 'Spiaggia';
    let paesi = window.dbCol(item, 'Paesi') || '';
    let tipo = window.dbCol(item, 'Tipo') || 'Spiaggia';
    const lat = item.lat_sp; 
    const lon = item.long_sp;
    
    const safeObj = encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27");

    return `
    <div class="bg-white rounded-2xl p-5 mb-4 shadow-sm border-l-[6px] border-l-sky-500 relative overflow-hidden active:scale-[0.98] transition-transform animate-fade" onclick="openModal('Spiagge', '${safeObj}')">
        <div class="relative z-10 pr-12">
            <div class="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <span class="material-icons text-sm">place</span> ${paesi}
            </div>
            <h3 class="font-serif font-bold text-xl text-sky-700 mb-2">${nome}</h3>
            <span class="inline-block bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-md capitalize">${tipo}</span>
        </div>
        
        ${(lat && lon) ? `
        <button class="absolute bottom-4 right-4 z-20 w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform" onclick="window.openMapBtn(event, ${lat}, ${lon})">
            <span class="material-icons text-lg">map</span>
        </button>` : ''}

        <div class="absolute -bottom-4 -right-2 opacity-10 transform -rotate-12 pointer-events-none text-sky-600">
            <i class="fa-solid fa-water text-8xl"></i>
        </div>
    </div>`;
};

// === ATTRAZIONI CARD ===
window.attrazioniRenderer = function(item) {
    const safeId = item.POI_ID || item.id;
    const titolo = window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo');
    const paese = window.dbCol(item, 'Paese');
    const tempo = window.dbCol(item, 'Tempo_visita') || '--';
    
    const label = String(window.dbCol(item, 'Label')).toLowerCase();
    let themeColor = 'text-accent'; let borderColor = 'border-l-accent'; let icon = 'fa-landmark';
    if (label.includes('religioso')) { themeColor = 'text-yellow-600'; borderColor = 'border-l-yellow-500'; icon = 'fa-church'; }
    if (label.includes('vista')) { themeColor = 'text-purple-600'; borderColor = 'border-l-purple-500'; icon = 'fa-mountain-sun'; }

    const lat = item.lat_at; const lon = item.long_at;

    return `
    <div class="bg-white rounded-2xl p-5 mb-4 shadow-sm border-l-[6px] ${borderColor} relative overflow-hidden active:scale-[0.98] transition-transform animate-fade" onclick="openModal('attrazione', '${safeId}')">
        <div class="relative z-10 pr-12">
            <div class="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <span class="material-icons text-sm">place</span> ${paese}
            </div>
            <div class="font-serif font-bold text-xl ${themeColor} mb-2 leading-tight">${titolo}</div>
            <span class="inline-block bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded-md">${tempo}</span>
        </div>
        
        ${(lat && lon) ? `
        <button class="absolute bottom-4 right-4 z-20 w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center shadow-md active:scale-90 transition-transform" onclick="window.openMapBtn(event, ${lat}, ${lon})">
            <span class="material-icons text-lg">map</span>
        </button>` : ''}

        <div class="absolute -bottom-4 -right-2 opacity-10 transform -rotate-12 pointer-events-none text-slate-800">
             <i class="fa-solid ${icon} text-8xl"></i>
        </div>
    </div>`;
};

// === FARMACIE ===
window.farmacieRenderer = (f) => {
    const nome = window.dbCol(f, 'Farmacia') || window.dbCol(f, 'Nome') || 'Farmacia';
    const paese = window.dbCol(f, 'Paese') || window.dbCol(f, 'Comune') || window.dbCol(f, 'Indirizzo') || '5 Terre';
    const numero = f.Telefono || f.Numero || f.telefono || f.numero || '';
    
    return genericInfoCard('local_pharmacy', nome, paese, numero);
};

// === NUMERI UTILI (FIX JSON PARSING) ===
window.numeriUtiliRenderer = (n) => {
    let rawNome = n.Nome;
    
    // 1. Se è una stringa che sembra un JSON, prova a parsarlo
    if (typeof rawNome === 'string' && rawNome.trim().startsWith('{')) {
        try {
            rawNome = JSON.parse(rawNome);
        } catch(e) {
            console.warn("Fallito parsing JSON nome:", rawNome);
        }
    }

    // 2. Ora gestisci l'oggetto o la stringa semplice
    let nome = rawNome;
    if (typeof rawNome === 'object' && rawNome !== null) {
        nome = rawNome[window.currentLang] || rawNome['it'] || rawNome['en'] || 'Info';
    }
    
    const paesi = window.dbCol(n, 'Paesi') || window.dbCol(n, 'Comune') || 'Cinque Terre';
    const numero = n.Numero || n.Telefono || '';
    
    let icon = 'help_outline';
    if(String(nome).toLowerCase().includes('carabinieri')) icon = 'security';
    if(String(nome).toLowerCase().includes('emergenza') || String(numero).includes('112')) icon = 'emergency';

    return genericInfoCard(icon, nome, paesi, numero);
};

function genericInfoCard(icon, title, subtitle, phone) {
    return `
    <div class="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-slate-100 flex items-center gap-4 animate-fade">
        <div class="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
            <span class="material-icons">${icon}</span>
        </div>
        <div class="flex-1">
            <h3 class="font-bold text-slate-800 leading-tight">${title}</h3>
            ${subtitle ? `<p class="text-xs text-slate-500 flex items-center gap-1 mt-1"><span class="material-icons text-[10px]">place</span> ${subtitle}</p>` : ''}
        </div>
        ${phone ? `
        <button class="w-11 h-11 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform" onclick="window.location.href='tel:${phone}'">
            <span class="material-icons">call</span>
        </button>` : ''}
    </div>`;
}

// Map Helper
window.openMapBtn = function(e, lat, lon) {
    if (!e) return;
    e.stopPropagation(); e.preventDefault();
    window.open(`http://googleusercontent.com/maps.google.com/?q=${lat},${lon}`, '_blank');
};