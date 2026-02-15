console.log("✅ 2. ui-renderers.js caricato (Palette Authentic 5 Terre)");

/**
 * HELPER: BOTTONI "CANDY" (Versione Pastello/Elegante)
 */
function getCandyBtn(icon, label, color, onclick) {
    // Mappatura Colori Tenui
    const colors = {
        'orange': 'bg-ct-terracotta text-white shadow-md shadow-orange-200 active:bg-orange-600',
        'blue':   'bg-ct-blue text-white shadow-md shadow-teal-200 active:bg-teal-700',
        'green':  'bg-ct-green text-white shadow-md shadow-green-200 active:bg-green-800',
        'red':    'bg-ct-terracotta text-white shadow-md shadow-red-200 active:bg-red-500', // Unificato a Terracotta
        'purple': 'bg-slate-600 text-white shadow-md shadow-slate-300 active:bg-slate-800',
        'yellow': 'bg-ct-yellow text-slate-800 shadow-md shadow-yellow-200 active:bg-yellow-500', 
    };
    
    const theme = colors[color] || colors['blue'];

    return `
    <button class="flex flex-col items-center justify-center gap-1 group/btn active:scale-95 transition-all duration-200" onclick="${onclick}">
        <div class="h-10 w-10 md:h-11 md:w-11 rounded-2xl ${theme} flex items-center justify-center border border-white/20">
            <span class="material-icons text-lg drop-shadow-sm">${icon}</span>
        </div>
        ${label ? `<span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 group-hover/btn:text-slate-600 transition-colors">${label}</span>` : ''}
    </button>`;
}

// 1. RISTORANTE (Stile "Trattoria Elegante")
window.ristoranteRenderer = (r) => {
    const nome = window.dbCol(r, 'Nome') || 'Ristorante';
    const paesi = window.dbCol(r, 'Paesi') || '';
    const numero = r.Numero || r.Telefono || '';
    const safeObj = encodeURIComponent(JSON.stringify(r)).replace(/'/g, "%27");
    const mapLink = r.Mappa || '#';

    return `
    <div class="bg-white rounded-3xl p-5 shadow-soft border border-slate-100 relative overflow-hidden animate-pop group mb-4 cursor-pointer hover:shadow-md transition-all" onclick="openModal('ristorante', '${safeObj}')"> 
        
        <div class="absolute -right-6 -top-6 opacity-5 transform rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110">
            <span class="material-icons text-[140px] text-slate-800">restaurant_menu</span>
        </div>

        <div class="relative z-10">
            <div class="inline-flex items-center gap-1 bg-ct-sand text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mb-3">
                <span class="material-icons text-xs text-ct-terracotta">place</span> ${paesi}
            </div>
            
            <h3 class="font-serif text-xl font-bold text-slate-800 leading-tight mb-4 w-[90%]">
                ${nome}
            </h3>
            
            <div class="flex items-center gap-4 mt-2 border-t border-slate-50 pt-3">
                ${getCandyBtn('visibility', 'Info', 'yellow', `event.stopPropagation(); openModal('ristorante', '${safeObj}')`)}
                ${getCandyBtn('map', 'Mappa', 'blue', `event.stopPropagation(); window.open('${mapLink}', '_blank')`)}
                ${numero ? getCandyBtn('call', 'Tel', 'green', `event.stopPropagation(); window.location.href='tel:${numero}'`) : ''}
            </div>
        </div>
    </div>`;
};

// 2. ATTRAZIONI (Stile "Cartolina d'Epoca")
window.attrazioniRenderer = function(item) {
    const safeId = item.POI_ID || item.id;
    const titolo = window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo');
    const paese = window.dbCol(item, 'Paese');
    const tempo = window.dbCol(item, 'Tempo_visita');
    const label = String(window.dbCol(item, 'Label')).toLowerCase();
    
    // Configurazione BASE / DEFAULT (Cultura)
    let theme = { 
        headerBg: 'bg-ct-blue', 
        headerText: 'text-white',
        icon: 'fa-landmark', 
        iconColor: 'text-ct-blue',
        btnColor: 'blue',
        subTitle: 'Cultura'
    };

    // Controllo potenziato per intercettare variazioni come "panoramico", "religione", "chiese" ecc.
    if (label.includes('religi') || label.includes('chies') || label.includes('santuar') || label.includes('convent')) {
        theme = { 
            headerBg: 'bg-ct-yellow', // Giallo Ocra
            headerText: 'text-slate-800',
            icon: 'fa-church', 
            iconColor: 'text-yellow-600',
            btnColor: 'yellow',
            subTitle: 'Sacro'
        };
    } else if (label.includes('vist') || label.includes('panoram') || label.includes('belveder') || label.includes('natur')) {
        theme = { 
            headerBg: 'bg-slate-600', // Grigio Ardesia Naturale
            headerText: 'text-white',
            icon: 'fa-binoculars', 
            iconColor: 'text-slate-600',
            btnColor: 'purple',
            subTitle: 'Panorama'
        };
    } else if (label.includes('castell') || label.includes('stori') || label.includes('monument') || label.includes('rovine')) {
        theme = { 
            headerBg: 'bg-ct-terracotta', // Terracotta
            headerText: 'text-white',
            icon: 'fa-chess-rook', 
            iconColor: 'text-ct-terracotta',
            btnColor: 'orange',
            subTitle: 'Storia'
        };
    }

    const lat = item.lat_at; const lon = item.long_at;

    return `
    <div class="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden animate-pop group mb-4 cursor-pointer transform hover:-translate-y-1 transition-transform" onclick="openModal('attrazione', '${safeId}')">
        
        <div class="${theme.headerBg} h-16 relative flex items-center px-5 overflow-hidden">
            <div class="absolute -right-3 top-1/2 transform -translate-y-1/2 opacity-20">
                 <i class="fa-solid ${theme.icon} text-[70px] ${theme.headerText === 'text-white' ? 'text-white' : 'text-black'}"></i>
            </div>
            
            <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center z-10 mr-3 shrink-0">
                <i class="fa-solid ${theme.icon} text-lg ${theme.iconColor}"></i>
            </div>
            
            <div class="z-10 overflow-hidden">
                <span class="text-[9px] font-bold uppercase tracking-widest ${theme.headerText} opacity-90 block">${theme.subTitle}</span>
                <span class="text-sm font-bold ${theme.headerText} block truncate leading-tight">${paese}</span>
            </div>
        </div>

        <div class="p-5 pt-4">
            <h3 class="font-serif text-lg font-bold text-slate-800 leading-tight mb-3 line-clamp-2 min-h-[3rem] flex items-center">
                ${titolo}
            </h3>
            
            <div class="flex items-center justify-between mt-2 border-t border-slate-50 pt-3">
                 ${tempo ? `
                 <div class="flex items-center gap-1.5 text-slate-400">
                    <span class="material-icons text-sm">schedule</span>
                    <span class="text-[11px] font-bold uppercase tracking-wide">${tempo}</span>
                 </div>` : '<div></div>'}

                 <div class="flex gap-2">
                    ${getCandyBtn('visibility', '', theme.btnColor, `event.stopPropagation(); openModal('attrazione', '${safeId}')`)}
                    ${(lat && lon) ? getCandyBtn('near_me', '', 'green', `window.openMapBtn(event, ${lat}, ${lon})`) : ''}
                 </div>
            </div>
        </div>
    </div>`;
};

// 3. SPIAGGIA (Acqua Marina & Relax)
window.spiaggiaRenderer = function(item) {
    const safeObj = encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27");
    let nome = window.dbCol(item, 'Nome') || 'Spiaggia';
    let paesi = window.dbCol(item, 'Paesi') || '';
    let tipo = window.dbCol(item, 'Tipo') || 'Spiaggia';
    const lat = item.lat_sp; const lon = item.long_sp;

    return `
    <div class="bg-white rounded-3xl p-5 shadow-soft border-b-4 border-ct-blue-light hover:border-ct-blue relative overflow-hidden animate-pop group mb-4 cursor-pointer transition-colors" onclick="openModal('Spiagge', '${safeObj}')">
        
        <div class="absolute -right-8 -top-8 opacity-10 transform rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110">
            <span class="material-icons text-[160px] text-ct-blue">waves</span>
        </div>

        <div class="relative z-10">
            <div class="flex justify-between items-start mb-2">
                <span class="inline-flex items-center gap-1 bg-ct-blue-light text-teal-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                    🌊 ${paesi}
                </span>
                <span class="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-lg">
                    ${tipo}
                </span>
            </div>

            <h3 class="font-serif text-xl font-bold text-slate-800 leading-tight mb-4 w-[85%]">
                ${nome}
            </h3>
            
            <div class="flex items-center gap-4 mt-2">
                ${getCandyBtn('visibility', 'Info', 'blue', `event.stopPropagation(); openModal('Spiagge', '${safeObj}')`)}
                ${(lat && lon) ? getCandyBtn('directions', 'Via', 'green', `window.openMapBtn(event, ${lat}, ${lon})`) : ''}
            </div>
        </div>
    </div>`;
};

// 4. VINI (Stile Etichetta Classica)
window.vinoRenderer = function(item) {
    const safeId = item.id || item.ID; 
    const nome = item.Nome || 'Vino';
    const cantina = item.Produttore || 'Locale'; 
    let tipoRaw = window.dbCol(item, 'Tipo') || '';
    const tipo = String(tipoRaw).toLowerCase().trim();
    const tipoLabel = (typeof tipoRaw === 'string') ? tipoRaw : (tipoRaw[window.currentLang] || tipoRaw['it'] || 'Vino');

    // Temi Autentici
    let theme = { 
        leftBg: 'bg-[#9B2226]', // Rosso Vino scuro
        iconColor: 'text-white/80',
        badgeColor: 'text-[#9B2226] bg-red-50',
        btnText: 'text-[#9B2226]'
    };

    if (tipo.includes('bianco')) {
        theme = { 
            leftBg: 'bg-[#E9C46A]', // Giallo Ocra/Paglierino
            iconColor: 'text-yellow-900/60', 
            badgeColor: 'text-yellow-800 bg-yellow-50',
            btnText: 'text-yellow-800'
        };
    } else if (tipo.includes('orange') || tipo.includes('sciacchetr')) {
        theme = { 
            leftBg: 'bg-[#E76F51]', // Terracotta/Ambra
            iconColor: 'text-white/80',
            badgeColor: 'text-orange-800 bg-orange-50',
            btnText: 'text-orange-800'
        };
    }

    return `
    <div class="flex w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-pop mb-3 cursor-pointer transform active:scale-95 transition-all duration-200 h-[110px]" onclick="openModal('Vini', '${safeId}')">
        
        <div class="w-[85px] ${theme.leftBg} flex items-center justify-center relative overflow-hidden shrink-0">
            <span class="material-icons text-5xl ${theme.iconColor} opacity-90 transform -rotate-12 translate-x-1">wine_bar</span>
        </div>

        <div class="flex-1 p-3 pl-4 flex flex-col justify-center relative">
            
            <div class="flex items-center gap-1 mb-1">
                <span class="material-icons text-[12px] text-slate-300">store</span>
                <span class="text-[10px] font-bold uppercase text-slate-400 tracking-wider truncate max-w-[150px]">
                   ${cantina}
                </span>
            </div>
            
            <h3 class="font-serif text-lg font-bold text-slate-800 leading-tight line-clamp-2 mb-2">
                ${nome}
            </h3>

            <div class="flex items-center justify-between mt-auto">
                <span class="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight ${theme.badgeColor}">
                    ${tipoLabel}
                </span>
                
                <div class="flex items-center gap-1 ${theme.btnText}">
                    <span class="text-[10px] font-bold uppercase">Vedi</span>
                    <span class="material-icons text-sm bg-slate-50 rounded-full p-0.5">chevron_right</span>
                </div>
            </div>

        </div>
    </div>`;
};

// 5. PRODOTTI (Figurina Polaroid)
window.prodottoRenderer = (p) => {
    const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
    const fotoKey = p.Prodotti_foto || titolo;
    const imgUrl = window.getSmartUrl(fotoKey, '', 300);
    const safeObj = encodeURIComponent(JSON.stringify(p)).replace(/'/g, "%27");

    return `
    <div class="bg-white rounded-3xl p-3 pb-4 shadow-soft border border-slate-100 flex flex-col items-center animate-pop active:scale-95 transition-transform cursor-pointer relative overflow-hidden group hover:shadow-md h-full" onclick="openModal('product', '${safeObj}')">
        <div class="w-full aspect-square rounded-2xl overflow-hidden bg-ct-sand mb-3 relative">
            <img src="${imgUrl}" loading="lazy" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" alt="${titolo}">
        </div>
        <div class="text-center px-1">
            <h3 class="font-serif font-bold text-sm text-slate-800 leading-tight mb-1 line-clamp-2">${titolo}</h3>
            <span class="text-[9px] font-bold text-ct-terracotta uppercase tracking-wide">Tipico</span>
        </div>
    </div>`;
};

// 6. SENTIERO (Naturale & Tecnico)
window.sentieroRenderer = (s) => {
    const uniqueId = 'k-map-' + (s.poi_id || Math.floor(Math.random() * 99999));
    const nome = s.nome || s.Titolo || 'Sentiero';
    const safeObj = encodeURIComponent(JSON.stringify(s)).replace(/'/g, "%27");
    if(s.gpx_url) { if(!window.pendingMaps) window.pendingMaps = []; window.pendingMaps.push({ id: uniqueId, gpx: s.gpx_url, startLabel: s.nome_partenza, endLabel: s.nome_arrivo }); }

    return `
    <div class="bg-white rounded-[2rem] overflow-hidden shadow-soft border border-slate-100 animate-pop flex flex-col group relative mb-6">
        <div id="${uniqueId}" class="h-32 w-full bg-slate-100 cursor-pointer relative border-b-4 border-ct-green-light" onclick="window.openTechMap('${safeObj}')">
            <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-bold text-ct-green shadow-sm">
                🥾 TRAIL
            </div>
        </div>
        <div class="p-5 bg-white relative">
            <h3 class="font-serif font-bold text-xl text-slate-800 mb-4 leading-tight">${nome}</h3>
            <div class="flex justify-around gap-4">
                ${getCandyBtn('map', 'Dati', 'green', `window.openTechMap('${safeObj}')`)}
                ${getCandyBtn('info', 'Desc', 'blue', `window.openModal('sentieroInfo', '${safeObj}')`)}
            </div>
        </div>
    </div>`;
};

// 7. UTILS
window.farmacieRenderer = (f) => {
    const nome = f.Nome || f.Farmacia || 'Farmacia';
    const paese = f.Paesi || f.Paese || '5 Terre';
    const numero = f.Numero || f.Telefono || '';
    return genericInfoCard('local_pharmacy', nome, paese, numero, 'green');
};

window.numeriUtiliRenderer = (n) => {
    let nome = n.Nome; try { if(typeof nome === 'string' && nome.startsWith('{')) nome = JSON.parse(nome)[window.currentLang] || 'Info'; } catch(e){}
    let icon = 'help'; let color = 'blue';
    if(String(nome).toLowerCase().includes('carabinieri')) { icon = 'local_police'; color = 'purple'; }
    if(String(nome).toLowerCase().includes('emergenza') || String(n.Numero).includes('112')) { icon = 'emergency'; color = 'red'; }
    return genericInfoCard(icon, nome, n.Paesi || 'Info', n.Numero, color);
};

function genericInfoCard(icon, title, subtitle, phone, colorName) {
    const colorMap = { 
        'green': 'bg-ct-green-light text-ct-green', 
        'red': 'bg-red-50 text-red-600', 
        'blue': 'bg-ct-blue-light text-ct-blue', 
        'purple': 'bg-slate-100 text-slate-600' 
    };
    const theme = colorMap[colorName] || colorMap['blue'];
    
    return `
    <div class="bg-white rounded-[2rem] p-4 mb-3 shadow-sm border border-slate-100 flex items-center gap-4 animate-pop">
        <div class="w-12 h-12 rounded-2xl ${theme} flex items-center justify-center flex-shrink-0">
            <span class="material-icons text-2xl">${icon}</span>
        </div>
        <div class="flex-1">
            <h3 class="font-bold text-slate-800 leading-tight text-sm">${title}</h3>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">${subtitle}</p>
        </div>
        ${phone ? getCandyBtn('call', '', colorName, `window.location.href='tel:${phone}'`) : ''}
    </div>`;
}

window.openMapBtn = function(e, lat, lon) {
    if (!e) return;
    e.stopPropagation(); e.preventDefault();
    window.open(`http://googleusercontent.com/maps.google.com/?q=${lat},${lon}`, '_blank');
};