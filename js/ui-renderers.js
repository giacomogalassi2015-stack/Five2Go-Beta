console.log("✅ 2. ui-renderers.js caricato (Gamification Pop Style)");

/**
 * HELPER: BOTTONI "CANDY" GAMIFIED
 * Crea bottoni con effetto 3D (shadow-b), colori pop e icona bianca
 */
function getCandyBtn(icon, label, color, onclick) {
    // Mappa colori Tailwind "Pop"
    const colors = {
        'orange': 'bg-pop-orange shadow-[0_4px_0_rgb(217,119,6)] hover:bg-orange-400',
        'blue':   'bg-pop-blue shadow-[0_4px_0_rgb(37,99,235)] hover:bg-blue-400',
        'green':  'bg-pop-green shadow-[0_4px_0_rgb(21,128,61)] hover:bg-green-400',
        'red':    'bg-pop-red shadow-[0_4px_0_rgb(185,28,28)] hover:bg-red-400',
        'purple': 'bg-pop-purple shadow-[0_4px_0_rgb(126,34,206)] hover:bg-purple-400',
        'yellow': 'bg-pop-yellow shadow-[0_4px_0_rgb(202,138,4)] hover:bg-yellow-400 text-black', // eccezione testo nero
    };
    
    const theme = colors[color] || colors['blue'];
    const textCol = color === 'yellow' ? 'text-yellow-900' : 'text-white';

    return `
    <button class="flex flex-col items-center justify-center gap-1 group active:translate-y-1 active:shadow-none transition-all duration-100" onclick="${onclick}">
        <div class="h-12 w-12 rounded-2xl ${theme} flex items-center justify-center border-2 border-white/20">
            <span class="material-icons text-2xl drop-shadow-md ${textCol}">${icon}</span>
        </div>
        <span class="text-[9px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">${label}</span>
    </button>`;
}

// 1. RISTORANTE (Menu del Giorno)
window.ristoranteRenderer = (r) => {
    const nome = window.dbCol(r, 'Nome') || 'Ristorante';
    const paesi = window.dbCol(r, 'Paesi') || '';
    const numero = r.Numero || r.Telefono || '';
    const safeObj = encodeURIComponent(JSON.stringify(r)).replace(/'/g, "%27");
    const mapLink = r.Mappa || '#';

    return `
    <div class="bg-white rounded-3xl p-5 shadow-lg border-b-8 border-slate-100 relative overflow-hidden animate-pop group"> 
        <div class="absolute -right-6 -top-6 opacity-10 transform rotate-12 transition-transform group-hover:rotate-0 duration-300">
            <span class="material-icons text-[120px] text-pop-orange">restaurant</span>
        </div>

        <div class="relative z-10">
            <div class="inline-flex items-center gap-1 bg-orange-50 text-pop-orange px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border border-orange-100 mb-2">
                📍 ${paesi}
            </div>
            
            <h3 class="font-serif text-2xl font-black text-slate-800 leading-tight mb-4 drop-shadow-sm w-[85%]">
                ${nome}
            </h3>
            
            <div class="flex items-center gap-4 mt-2">
                ${getCandyBtn('visibility', 'Info', 'yellow', `openModal('ristorante', '${safeObj}')`)}
                ${getCandyBtn('map', 'Mappa', 'blue', `window.open('${mapLink}', '_blank')`)}
                ${numero ? getCandyBtn('call', 'Chiama', 'green', `window.location.href='tel:${numero}'`) : ''}
            </div>
        </div>
    </div>`;
};

// 2. ATTRAZIONI (Figurina Collezionabile)
window.attrazioniRenderer = function(item) {
    const safeId = item.POI_ID || item.id;
    const titolo = window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo');
    const paese = window.dbCol(item, 'Paese');
    const tempo = window.dbCol(item, 'Tempo_visita');
    const label = String(window.dbCol(item, 'Label')).toLowerCase();
    
    // Temi accesi
    let theme = { bg: 'bg-white', border: 'border-slate-200', icon: 'fa-landmark', color: 'blue' };
    if (label.includes('religioso')) theme = { bg: 'bg-yellow-50', border: 'border-pop-yellow', icon: 'fa-church', color: 'yellow' };
    else if (label.includes('vista')) theme = { bg: 'bg-purple-50', border: 'border-pop-purple', icon: 'fa-mountain-sun', color: 'purple' };
    else if (label.includes('castello')) theme = { bg: 'bg-red-50', border: 'border-pop-red', icon: 'fa-chess-rook', color: 'red' };

    const lat = item.lat_at; const lon = item.long_at;

    return `
    <div class="relative ${theme.bg} rounded-[2rem] p-5 border-4 ${theme.border} shadow-pop animate-pop overflow-hidden cursor-pointer group active:scale-95 transition-transform" onclick="openModal('attrazione', '${safeId}')">
        
        <div class="absolute -right-6 -bottom-6 transform rotate-12 opacity-20 group-hover:opacity-30 transition-opacity">
            <i class="fa-solid ${theme.icon} text-[110px] text-slate-800"></i>
        </div>

        <div class="relative z-10 pr-10">
            <div class="flex items-center gap-2 mb-1">
                <span class="bg-white/80 backdrop-blur px-2 py-1 rounded-lg text-[9px] font-black uppercase text-slate-500 shadow-sm border border-slate-100">
                    ${paese}
                </span>
                ${tempo ? `<span class="bg-white/80 backdrop-blur px-2 py-1 rounded-lg text-[9px] font-bold text-slate-400 flex items-center gap-1 border border-slate-100"><span class="material-icons text-[10px]">schedule</span>${tempo}</span>` : ''}
            </div>
            
            <h3 class="font-serif text-2xl font-black text-slate-800 leading-tight mb-3">
                ${titolo}
            </h3>
            
            ${(lat && lon) ? `
            <div class="absolute bottom-4 right-4">
                ${getCandyBtn('near_me', '', theme.color, `window.openMapBtn(event, ${lat}, ${lon})`)}
            </div>` : ''}
        </div>
    </div>`;
};

// 3. SPIAGGIA (Bolla Marina)
window.spiaggiaRenderer = function(item) {
    const safeObj = encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27");
    let nome = window.dbCol(item, 'Nome') || 'Spiaggia';
    let paesi = window.dbCol(item, 'Paesi') || '';
    let tipo = window.dbCol(item, 'Tipo') || 'Spiaggia';
    const lat = item.lat_sp; const lon = item.long_sp;

    return `
    <div class="relative bg-gradient-to-br from-cyan-50 to-blue-100 rounded-[2rem] p-6 border-4 border-white shadow-lg animate-pop overflow-hidden cursor-pointer active:scale-95 transition-transform" onclick="openModal('Spiagge', '${safeObj}')">
        
        <div class="absolute top-0 right-0 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
        <div class="absolute bottom-0 left-0 w-32 h-32 bg-cyan-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse" style="animation-delay: 1s"></div>

        <div class="relative z-10">
            <span class="bg-white/60 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-blue-600 border border-white/50 mb-2 inline-block">
                🏖️ ${paesi}
            </span>
            <h3 class="font-serif text-2xl font-black text-blue-900 leading-tight mb-3 pr-10">
                ${nome}
            </h3>
            
            <div class="flex justify-between items-end">
                <span class="text-[10px] font-bold text-blue-800 bg-white/40 px-3 py-1 rounded-xl border border-white/30">
                    ${tipo}
                </span>
                ${(lat && lon) ? getCandyBtn('directions', 'Vai', 'blue', `window.openMapBtn(event, ${lat}, ${lon})`) : ''}
            </div>
        </div>
    </div>`;
};

// 4. PRODOTTI (Cassa di Legno/Frutta)
window.prodottoRenderer = (p) => {
    const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
    const fotoKey = p.Prodotti_foto || titolo;
    const imgUrl = window.getSmartUrl(fotoKey, '', 200);
    const safeObj = encodeURIComponent(JSON.stringify(p)).replace(/'/g, "%27");

    return `
    <div class="bg-white rounded-[2rem] p-4 shadow-md border-b-4 border-slate-200 flex items-center gap-4 animate-pop active:scale-95 transition-transform cursor-pointer relative overflow-hidden mb-3" onclick="openModal('product', '${safeObj}')">
        <div class="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-sm rotate-2">
            <img src="${imgUrl}" loading="lazy" class="w-full h-full object-cover" alt="${titolo}">
        </div>
        <div class="flex-1">
            <h3 class="font-serif font-black text-lg text-slate-800 leading-tight mb-1">${titolo}</h3>
            <span class="text-[9px] font-black text-pop-orange bg-orange-50 px-2 py-1 rounded-lg uppercase tracking-wide border border-orange-100">
                Gnam! 😋
            </span>
        </div>
        <div class="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
            <span class="material-icons">arrow_forward</span>
        </div>
    </div>`;
};

// 5. VINI (Etichetta Premium)
window.vinoRenderer = function(item) {
    const safeId = item.id || item.ID; 
    const nome = item.Nome || 'Vino';
    const cantina = item.Produttore || 'Locale'; 
    const tipo = (item.Tipo || '').toLowerCase().trim();
    
    let theme = { bg: 'bg-white', border: 'border-pop-red', icon: 'text-red-100', color: 'red' };
    if (tipo.includes('bianco')) theme = { bg: 'bg-white', border: 'border-pop-yellow', icon: 'text-yellow-100', color: 'yellow' };
    else if (tipo.includes('orange')) theme = { bg: 'bg-white', border: 'border-pop-orange', icon: 'text-orange-100', color: 'orange' };

    return `
    <div class="relative bg-white rounded-[2rem] p-5 border-l-8 ${theme.border} shadow-lg animate-pop active:scale-95 transition-transform overflow-hidden cursor-pointer" onclick="openModal('Vini', '${safeId}')">
        <div class="absolute right-0 top-0 opacity-20 transform translate-x-1/3 -translate-y-1/3 pointer-events-none">
            <i class="ph-fill ph-wine text-[120px] ${theme.icon}"></i>
        </div>
        <div class="relative z-10">
            <span class="text-[9px] font-black uppercase text-slate-400 mb-1 block tracking-widest">${cantina}</span>
            <h3 class="font-serif text-2xl font-black text-slate-800 leading-none mb-3 max-w-[80%]">${nome}</h3>
            <span class="inline-block px-3 py-1 rounded-xl text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-100">
                ${item.Tipo}
            </span>
        </div>
    </div>`;
};

// 6. SENTIERO (Tech & Fun)
window.sentieroRenderer = (s) => {
    const uniqueId = 'k-map-' + (s.poi_id || Math.floor(Math.random() * 99999));
    const nome = s.nome || s.Titolo || 'Sentiero';
    const safeObj = encodeURIComponent(JSON.stringify(s)).replace(/'/g, "%27");
    if(s.gpx_url) { if(!window.pendingMaps) window.pendingMaps = []; window.pendingMaps.push({ id: uniqueId, gpx: s.gpx_url, startLabel: s.nome_partenza, endLabel: s.nome_arrivo }); }

    return `
    <div class="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white animate-pop flex flex-col group relative mb-6">
        <div id="${uniqueId}" class="h-32 w-full bg-slate-100 cursor-pointer relative border-b-4 border-slate-50" onclick="window.openTechMap('${safeObj}')">
            <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-black text-pop-green shadow-sm border border-green-100">
                🥾 TRAIL
            </div>
        </div>
        <div class="p-5 bg-white relative">
            <h3 class="font-serif font-black text-xl text-slate-800 mb-4 leading-tight">${nome}</h3>
            <div class="flex justify-around gap-4">
                ${getCandyBtn('map', 'Dati', 'green', `window.openTechMap('${safeObj}')`)}
                ${getCandyBtn('info', 'Desc', 'blue', `window.openModal('sentieroInfo', '${safeObj}')`)}
            </div>
        </div>
    </div>`;
};

// UTILS
window.farmacieRenderer = (f) => genericInfoCard('local_pharmacy', f.Farmacia || 'Farmacia', f.Paese || '5 Terre', f.Telefono, 'green');
window.numeriUtiliRenderer = (n) => {
    let nome = n.Nome; try { if(typeof nome === 'string' && nome.startsWith('{')) nome = JSON.parse(nome)[window.currentLang] || 'Info'; } catch(e){}
    let icon = 'help'; let color = 'blue';
    if(String(nome).toLowerCase().includes('carabinieri')) { icon = 'local_police'; color = 'purple'; }
    if(String(nome).toLowerCase().includes('emergenza') || String(n.Numero).includes('112')) { icon = 'emergency'; color = 'red'; }
    return genericInfoCard(icon, nome, n.Paesi || 'Info', n.Numero, color);
};

function genericInfoCard(icon, title, subtitle, phone, colorName) {
    const colorMap = { 
        'green': 'bg-emerald-100 text-emerald-600', 
        'red': 'bg-red-100 text-red-600', 
        'blue': 'bg-blue-100 text-blue-600', 
        'purple': 'bg-purple-100 text-purple-600' 
    };
    const theme = colorMap[colorName] || colorMap['blue'];
    
    return `
    <div class="bg-white rounded-[2rem] p-4 mb-3 shadow-md border-b-4 border-slate-100 flex items-center gap-4 animate-pop">
        <div class="w-12 h-12 rounded-2xl ${theme} flex items-center justify-center flex-shrink-0 shadow-inner border-2 border-white">
            <span class="material-icons text-2xl">${icon}</span>
        </div>
        <div class="flex-1">
            <h3 class="font-bold text-slate-800 leading-tight text-sm">${title}</h3>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-0.5">${subtitle}</p>
        </div>
        ${phone ? getCandyBtn('call', '', colorName, `window.location.href='tel:${phone}'`) : ''}
    </div>`;
}

window.openMapBtn = function(e, lat, lon) {
    if (!e) return;
    e.stopPropagation(); e.preventDefault();
    window.open(`http://googleusercontent.com/maps.google.com/?q=${lat},${lon}`, '_blank');
};