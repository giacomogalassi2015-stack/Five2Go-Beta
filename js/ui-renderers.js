console.log("✅ 2. ui-renderers.js caricato (Delivery App Style)");

// ============================================================
// 1. RISTORANTE (Stile "App Moderno")
// ============================================================
window.ristoranteRenderer = (r) => {
    const nome = window.dbCol(r, 'Nome') || 'Ristorante';
    const paesi = window.dbCol(r, 'Paesi') || '';
    const numero = r.Numero || r.Telefono || r.telefono || r.numero || '';
    const safeObj = encodeURIComponent(JSON.stringify(r)).replace(/'/g, "%27");
    const mapLink = r.Mappa || '#';

    return `
    <div class="bg-white rounded-3xl p-5 mb-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-50 relative overflow-hidden animate-fade flex flex-col"> 
        
        <div class="flex justify-between items-start mb-4">
            <div class="pr-4">
                <h3 class="font-serif text-xl font-bold text-slate-800 leading-tight mb-1">
                    ${nome}
                </h3>
                <div class="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wide">
                    <span class="material-icons text-[14px] text-ct-yellow">place</span> ${paesi}
                </div>
            </div>
            <div class="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <span class="material-icons text-lg">restaurant</span>
            </div>
        </div>

        <div class="mb-2"></div>
        
        <div class="grid grid-cols-3 gap-3">
            
            <button class="flex flex-col items-center justify-center gap-1 py-2 rounded-2xl bg-amber-50 text-amber-600 active:scale-95 transition-transform" onclick="openModal('ristorante', '${safeObj}')">
                <span class="material-icons text-lg">read_more</span>
                <span class="text-[10px] font-bold uppercase">Info</span>
            </button>
            
            <button class="flex flex-col items-center justify-center gap-1 py-2 rounded-2xl bg-blue-50 text-blue-600 active:scale-95 transition-transform" onclick="window.open('${mapLink}', '_blank')">
                <span class="material-icons text-lg">map</span>
                <span class="text-[10px] font-bold uppercase">Mappa</span>
            </button>

            ${numero ? `
            <button class="flex flex-col items-center justify-center gap-1 py-2 rounded-2xl bg-emerald-50 text-emerald-600 active:scale-95 transition-transform" onclick="window.location.href='tel:${numero}'">
                <span class="material-icons text-lg">call</span>
                <span class="text-[10px] font-bold uppercase">Chiama</span>
            </button>` : 
            `<div class="rounded-2xl bg-slate-50 opacity-50"></div>`}
            
        </div>
    </div>`;
};

// ============================================================
// 2. ATTRAZIONI (Stile "Vino" Semantico - INVARIATO/CONFERMATO)
// ============================================================
window.attrazioniRenderer = function(item) {
    const safeId = item.POI_ID || item.id;
    const titolo = window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo');
    const paese = window.dbCol(item, 'Paese');
    const tempo = window.dbCol(item, 'Tempo_visita');
    
    const label = String(window.dbCol(item, 'Label')).toLowerCase();
    
    let theme = { bg: 'bg-slate-50', border: 'border-slate-200', iconColor: 'text-slate-200', textColor: 'text-slate-700', badge: 'bg-white text-slate-500', icon: 'fa-landmark' };
    
    if (label.includes('religioso') || label.includes('chiesa')) { 
        theme = { bg: 'bg-amber-50', border: 'border-amber-100', iconColor: 'text-amber-200', textColor: 'text-amber-900', badge: 'bg-white text-amber-700', icon: 'fa-church' };
    }
    else if (label.includes('vista') || label.includes('panorama')) { 
        theme = { bg: 'bg-indigo-50', border: 'border-indigo-100', iconColor: 'text-indigo-200', textColor: 'text-indigo-900', badge: 'bg-white text-indigo-700', icon: 'fa-mountain-sun' };
    }
    else if (label.includes('castello') || label.includes('storia') || label.includes('cultura')) { 
        theme = { bg: 'bg-rose-50', border: 'border-rose-100', iconColor: 'text-rose-200', textColor: 'text-rose-900', badge: 'bg-white text-rose-700', icon: 'fa-chess-rook' };
    }

    const lat = item.lat_at; const lon = item.long_at;

    return `
    <div class="relative ${theme.bg} rounded-[2.5rem] p-6 mb-4 border ${theme.border} animate-fade active:scale-[0.98] transition-transform overflow-hidden cursor-pointer shadow-sm" onclick="openModal('attrazione', '${safeId}')">
        <div class="absolute -right-6 -bottom-6 transform rotate-12 pointer-events-none">
            <i class="fa-solid ${theme.icon} text-[110px] ${theme.iconColor} opacity-50"></i>
        </div>
        <div class="relative z-10 pr-8">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <span class="material-icons text-xs">place</span> ${paese}
            </div>
            <h3 class="font-serif text-2xl font-bold ${theme.textColor} leading-tight mb-4">${titolo}</h3>
            <div class="flex items-center gap-2">
                ${tempo ? `<span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${theme.badge}"><span class="material-icons text-[10px] mr-1">schedule</span> ${tempo}</span>` : ''}
                ${(lat && lon) ? `<button class="w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-sm text-slate-400 hover:text-primary transition-colors" onclick="window.openMapBtn(event, ${lat}, ${lon})"><span class="material-icons text-xs">directions</span></button>` : ''}
            </div>
        </div>
    </div>`;
};

// ============================================================
// 3. SPIAGGIA (Stile "Vino" Marino - INVARIATO)
// ============================================================
window.spiaggiaRenderer = function(item) {
    const safeObj = encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27");
    let nome = window.dbCol(item, 'Nome') || 'Spiaggia';
    let paesi = window.dbCol(item, 'Paesi') || '';
    let tipo = window.dbCol(item, 'Tipo') || 'Spiaggia';
    const lat = item.lat_sp; const lon = item.long_sp;

    return `
    <div class="relative bg-cyan-50/60 rounded-[2.5rem] p-6 mb-4 border border-cyan-100 animate-fade active:scale-[0.98] transition-transform overflow-hidden cursor-pointer shadow-sm" onclick="openModal('Spiagge', '${safeObj}')">
        <div class="absolute -right-4 -bottom-8 transform -rotate-12 pointer-events-none">
            <i class="fa-solid fa-water text-[120px] text-cyan-200/50"></i>
        </div>
        <div class="relative z-10 pr-10">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <span class="material-icons text-xs text-cyan-600">place</span> ${paesi}
            </div>
            <h3 class="font-serif text-2xl font-bold text-cyan-900 leading-tight mb-3">${nome}</h3>
            <div class="flex gap-2">
                <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm bg-white text-cyan-700">${tipo}</span>
                ${(lat && lon) ? `<button class="w-8 h-8 rounded-full bg-white text-cyan-600 flex items-center justify-center shadow-sm active:scale-90" onclick="window.openMapBtn(event, ${lat}, ${lon})"><span class="material-icons text-sm">near_me</span></button>` : ''}
            </div>
        </div>
    </div>`;
};

// ... (PRODOTTI, VINI, SENTIERI rimangono come nel file precedente) ...
window.prodottoRenderer = (p) => {
    const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
    const fotoKey = p.Prodotti_foto || titolo;
    const imgUrl = window.getSmartUrl(fotoKey, '', 200);
    const safeObj = encodeURIComponent(JSON.stringify(p)).replace(/'/g, "%27");
    return `
    <div class="bg-white rounded-[2rem] p-3 shadow-sm border border-slate-50 flex items-center gap-4 animate-fade active:scale-[0.98] transition-transform mb-3 cursor-pointer relative overflow-hidden" onclick="openModal('product', '${safeObj}')">
        <div class="w-20 h-20 flex-shrink-0 rounded-[1.5rem] overflow-hidden bg-slate-100 relative shadow-inner">
            <img src="${imgUrl}" loading="lazy" class="w-full h-full object-cover transform scale-110" alt="${titolo}">
        </div>
        <div class="flex-1 pr-2">
            <h3 class="font-serif font-bold text-lg text-slate-800 leading-tight mb-1">${titolo}</h3>
            <div class="flex items-center gap-1 text-xs font-bold text-ct-terracotta uppercase tracking-wide">
                <span>Scopri</span> <span class="material-icons text-xs">arrow_forward</span>
            </div>
        </div>
    </div>`;
};

window.vinoRenderer = function(item) {
    const safeId = item.id || item.ID; 
    const nome = item.Nome || 'Vino';
    const cantina = item.Produttore || 'Cantina Locale'; 
    const tipo = (item.Tipo || '').toLowerCase().trim();
    let theme = { bg: 'bg-red-50/50', border: 'border-red-100', icon: 'text-red-200', text: 'text-red-900', badge: 'bg-white text-red-800' };
    if (tipo.includes('bianco')) { theme = { bg: 'bg-amber-50/50', border: 'border-amber-100', icon: 'text-amber-200', text: 'text-amber-900', badge: 'bg-white text-amber-800' }; }
    if (tipo.includes('rosato') || tipo.includes('orange')) { theme = { bg: 'bg-orange-50/50', border: 'border-orange-100', icon: 'text-orange-200', text: 'text-orange-900', badge: 'bg-white text-orange-800' }; }
    return `
    <div class="relative ${theme.bg} rounded-[2.5rem] p-6 mb-4 border ${theme.border} animate-fade active:scale-[0.98] transition-transform overflow-hidden cursor-pointer shadow-sm" onclick="openModal('Vini', '${safeId}')">
        <div class="absolute -right-4 -bottom-6 transform rotate-12 pointer-events-none"><i class="ph-fill ph-wine text-[100px] ${theme.icon} opacity-60"></i></div>
        <div class="relative z-10 pr-10">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><span class="material-icons text-xs">storefront</span> ${cantina}</div>
            <h3 class="font-serif text-2xl font-bold ${theme.text} leading-none mb-3">${nome}</h3>
            <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${theme.badge}">${item.Tipo || 'Vino'}</span>
        </div>
    </div>`;
};

window.sentieroRenderer = (s) => {
    const uniqueId = 'k-map-' + (s.poi_id || Math.floor(Math.random() * 99999));
    const nome = s.nome || s.Titolo || 'Sentiero';
    const safeObj = encodeURIComponent(JSON.stringify(s)).replace(/'/g, "%27");
    if(s.gpx_url) { if(!window.pendingMaps) window.pendingMaps = []; window.pendingMaps.push({ id: uniqueId, gpx: s.gpx_url, startLabel: s.nome_partenza, endLabel: s.nome_arrivo }); }
    return `
    <div class="bg-white rounded-[2.5rem] overflow-hidden shadow-card mb-6 border border-slate-100 animate-fade flex flex-col group">
        <div id="${uniqueId}" class="h-44 w-full bg-slate-100 cursor-pointer relative" onclick="window.openTechMap('${safeObj}')">
            <div class="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 shadow-sm pointer-events-none">Toccca per Mappa</div>
        </div>
        <div class="p-5 bg-white">
            <h3 class="font-bold text-xl text-slate-800 mb-4">${nome}</h3>
            <div class="grid grid-cols-2 gap-3">
                <button class="flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-transform" onclick="window.openTechMap('${safeObj}')"><span class="material-icons text-sm">map</span> Tecnici</button>
                <button class="flex items-center justify-center gap-2 py-3 bg-ct-sand text-slate-600 font-bold rounded-2xl active:scale-95 transition-transform hover:bg-slate-200" onclick="window.openModal('sentieroInfo', '${safeObj}')"><span class="material-icons text-sm">info</span> Info</button>
            </div>
        </div>
    </div>`;
};

window.farmacieRenderer = (f) => {
    const nome = window.dbCol(f, 'Farmacia') || window.dbCol(f, 'Nome') || 'Farmacia';
    const paese = window.dbCol(f, 'Paese') || window.dbCol(f, 'Comune') || window.dbCol(f, 'Indirizzo') || '5 Terre';
    const numero = f.Telefono || f.Numero || '';
    return genericInfoCard('local_pharmacy', nome, paese, numero, 'ct-green');
};

window.numeriUtiliRenderer = (n) => {
    let rawNome = n.Nome; if (typeof rawNome === 'string' && rawNome.trim().startsWith('{')) { try { rawNome = JSON.parse(rawNome); } catch(e) {} }
    let nome = rawNome; if (typeof rawNome === 'object' && rawNome !== null) { nome = rawNome[window.currentLang] || rawNome['it'] || 'Info'; }
    const numero = n.Numero || n.Telefono || '';
    let icon = 'help_outline'; let color = 'primary';
    if(String(nome).toLowerCase().includes('carabinieri')) { icon = 'security'; color = 'slate-700'; }
    if(String(nome).toLowerCase().includes('emergenza') || String(numero).includes('112')) { icon = 'emergency'; color = 'ct-terracotta'; }
    return genericInfoCard(icon, nome, window.dbCol(n, 'Paesi') || 'Info', numero, color);
};

function genericInfoCard(icon, title, subtitle, phone, themeColor = 'primary') {
    const colorMap = { 'ct-green': 'text-ct-green bg-ct-green-light', 'ct-terracotta': 'text-ct-terracotta bg-ct-terracotta-light', 'primary': 'text-primary bg-ct-sand', 'slate-700': 'text-slate-700 bg-slate-100' };
    const styleClass = colorMap[themeColor] || colorMap['primary'];
    const btnClass = themeColor === 'ct-terracotta' ? 'bg-ct-terracotta text-white' : 'bg-white border border-slate-200 text-slate-600';
    return `
    <div class="bg-white rounded-[2rem] p-5 mb-3 shadow-sm border border-slate-100 flex items-center gap-4 animate-fade">
        <div class="w-12 h-12 rounded-[1rem] ${styleClass} flex items-center justify-center flex-shrink-0"><span class="material-icons text-xl">${icon}</span></div>
        <div class="flex-1 min-w-0"><h3 class="font-bold text-slate-800 leading-tight truncate">${title}</h3><p class="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">${subtitle}</p></div>
        ${phone ? `<button class="w-12 h-12 rounded-full ${btnClass} flex items-center justify-center shadow-sm active:scale-90 transition-transform" onclick="window.location.href='tel:${phone}'"><span class="material-icons text-xl">call</span></button>` : ''}
    </div>`;
}

window.openMapBtn = function(e, lat, lon) {
    if (!e) return;
    e.stopPropagation(); e.preventDefault();
    window.open(`http://googleusercontent.com/maps.google.com/?q=${lat},${lon}`, '_blank');
};