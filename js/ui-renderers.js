
console.log("✅ 2. ui-renderers.js caricato (Wine List Spaced Fix)");

/**
 * HELPER: BOTTONI "CANDY"
 */
function getCandyBtn(icon, label, color, onclick) {
    const colors = {
        'orange': 'bg-ct-terracotta text-white shadow-orange-200 active:bg-orange-600',
        'blue':   'bg-ct-blue text-white shadow-teal-200 active:bg-teal-700',
        'green':  'bg-ct-green text-white shadow-green-200 active:bg-green-800',
        'red':    'bg-red-500 text-white shadow-red-200 active:bg-red-600',
        'purple': 'bg-slate-600 text-white shadow-slate-300 active:bg-slate-800',
        'yellow': 'bg-ct-yellow text-slate-800 shadow-yellow-200 active:bg-yellow-500', 
    };
    const theme = colors[color] || colors['blue'];

    return `
    <button class="flex flex-col items-center justify-center gap-1 group/btn active:scale-95 transition-all duration-200 min-w-[50px]" onclick="${onclick}">
        <div class="h-9 w-9 rounded-xl ${theme} shadow-sm flex items-center justify-center border border-white/10">
            <span class="material-icons text-lg drop-shadow-sm">${icon}</span>
        </div>
        ${label ? `<span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 group-hover/btn:text-slate-600 transition-colors">${label}</span>` : ''}
    </button>`;
}

/**
 * 1. MASTER CARD (Ristoranti, Attrazioni, Prodotti, Spiagge)
 */
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
    <div class="bg-white rounded-[2rem] shadow-soft overflow-hidden flex flex-col h-full relative mb-6 group cursor-pointer border border-slate-100/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" onclick="${onClick}">
        ${headerHtml}
        <div class="p-5 flex-1 flex flex-col justify-start">
            <div class="flex items-center gap-2 mb-2">
                <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-sans">${label}</span>
                <div class="h-px bg-slate-100 flex-1"></div>
            </div>
            <h3 class="font-serif text-2xl font-bold text-slate-800 leading-tight mb-2 group-hover:text-primary transition-colors">${title}</h3>
            ${subText ? `<p class="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">${subText}</p>` : ''}
        </div>
        <div class="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 backdrop-blur-sm">
            ${buttonsHtml}
        </div>
    </div>`;
}

/**
 * 2. WINE CARD (Aggiornata: Più Spaziosa)
 */
function renderWineCard({ id, onClick, typeLabel, title, producer, grapes, themeColor }) {
    const colors = {
        'yellow': 'bg-[#E9C46A] text-yellow-900', 
        'red':    'bg-[#9B2226] text-red-100',     
        'orange': 'bg-[#E76F51] text-orange-100'   
    };
    const themeClass = colors[themeColor] || colors['red'];
    const iconColor = themeColor === 'yellow' ? 'text-yellow-800' : 'text-white';

    // Modifiche Layout: min-h-[140px], p-4, e gap verticali aumentati
    return `
    <div class="flex bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[140px] cursor-pointer transform active:scale-95 transition-all duration-200 mb-5 group hover:shadow-md" onclick="${onClick}">
        
        <div class="w-24 ${themeClass} flex items-center justify-center relative overflow-hidden shrink-0">
            <span class="material-icons text-8xl absolute -right-6 -bottom-6 opacity-20 transform rotate-12">wine_bar</span>
            <span class="material-icons text-4xl ${iconColor} drop-shadow-sm opacity-90 relative z-10">wine_bar</span>
        </div>

        <div class="flex-1 p-4 flex flex-col relative bg-white">
            
            <div class="mb-2">
                <span class="inline-block px-2 py-0.5 rounded border border-slate-100 bg-slate-50 text-[9px] font-bold uppercase tracking-widest text-slate-500 font-sans">
                    ${typeLabel}
                </span>
            </div>

            <h3 class="font-serif text-2xl font-bold text-slate-800 leading-snug mb-1 pr-2 group-hover:text-ct-terracotta transition-colors">
                ${title}
            </h3>

            <div class="flex items-center gap-1.5 mb-3">
                <span class="material-icons text-[14px] text-slate-300">storefront</span>
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">${producer}</span>
            </div>

            <div class="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                <span class="text-[10px] text-slate-400 italic font-medium truncate max-w-[140px]">
                    ${grapes || 'Uve autoctone'}
                </span>
                
                <div class="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition-colors">
                    <span class="text-[9px] font-bold uppercase">Scheda</span>
                    <span class="material-icons text-xs">arrow_forward</span>
                </div>
            </div>
        </div>
    </div>`;
}

/**
 * 3. UTILITY CARD (Farmacie e Numeri)
 */
function renderUtilityCard({ icon, title, subtitle, phone, color }) {
    const iconColors = {
        'green': 'bg-green-100 text-green-700',
        'blue': 'bg-blue-100 text-blue-700',
        'purple': 'bg-purple-100 text-purple-700',
        'red': 'bg-red-100 text-red-700'
    };
    const iconTheme = iconColors[color] || iconColors['blue'];

    return `
    <div class="flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm mb-3 animate-pop active:scale-95 transition-transform">
        <div class="w-12 h-12 rounded-xl ${iconTheme} flex items-center justify-center shrink-0 mr-4">
            <span class="material-icons text-2xl">${icon}</span>
        </div>
        <div class="flex-1 min-w-0">
            <h3 class="font-bold text-slate-800 text-sm truncate">${title}</h3>
            <p class="text-[10px] font-bold uppercase text-slate-400 tracking-wide truncate">${subtitle}</p>
        </div>
        ${phone ? `
        <button onclick="window.location.href='tel:${phone}'" class="ml-3 w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors">
            <span class="material-icons text-xl">call</span>
        </button>` : ''}
    </div>`;
}


// --- RENDERERS SPECIFICI ---
// In ui-renderers.js

// In ui-renderers.js
window.ristoranteRenderer = (r) => {
    const nome = window.dbCol(r, 'Nome') || 'Ristorante';
    const paesi = window.dbCol(r, 'Paesi') || '5 Terre';
    const desc = window.dbCol(r, 'Descrizioni') || '';
    const safeObj = encodeURIComponent(JSON.stringify(r)).replace(/'/g, "%27");
    const mapLink = r.Mappa || '#';
    const numero = r.Numero || r.Telefono;

    // Se le immagini sono nella root, il secondo parametro deve essere ''
    const imgUrl = nome ? window.getSmartUrl(nome, '', 600) : null;

    return renderMasterCard({
        id: r.id,
        onClick: `openModal('ristorante', '${safeObj}')`,
        label: `📍 ${paesi}`,
        title: nome,
        subText: desc || 'Cucina tipica locale.',
        image: imgUrl, // <--- L'URL ora punterà alla root di Cloudinary
        iconFallback: 'restaurant',
        themeColor: 'yellow',
        buttonsHtml: `
            ${getCandyBtn('visibility', 'Info', 'yellow', `event.stopPropagation(); openModal('ristorante', '${safeObj}')`)}
            ${getCandyBtn('map', 'Mappa', 'blue', `event.stopPropagation(); window.open('${mapLink}', '_blank')`)}
            ${numero ? getCandyBtn('call', 'Tel', 'green', `event.stopPropagation(); window.location.href='tel:${numero}'`) : ''}
        `
    });
};

window.attrazioniRenderer = function(item) {
    const safeId = item.POI_ID || item.id;
    const titolo = window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo');
    const paese = window.dbCol(item, 'Paese');
    const imgUrl = titolo ? window.getSmartUrl(titolo, '', 600) : null;
    const labelRaw = String(window.dbCol(item, 'Label')).toLowerCase();
    const lat = item.lat_at; const lon = item.long_at;

    let catLabel = 'CULTURA'; let themeColor = 'blue'; let iconFallback = 'landmark';
    if (labelRaw.includes('religi') || labelRaw.includes('chies')) { catLabel = 'SACRO'; themeColor = 'yellow'; iconFallback = 'church'; }
    else if (labelRaw.includes('panoram') || labelRaw.includes('natur')) { catLabel = 'PANORAMA'; themeColor = 'green'; iconFallback = 'landscape'; }
    else if (labelRaw.includes('stori') || labelRaw.includes('castell')) { catLabel = 'STORIA'; themeColor = 'orange'; iconFallback = 'castle'; }

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
            ${getCandyBtn('visibility', 'Vedi', themeColor, `event.stopPropagation(); openModal('attrazione', '${safeId}')`)}
            ${(lat && lon) ? getCandyBtn('near_me', 'Vai', 'purple', `window.openMapBtn(event, ${lat}, ${lon})`) : ''}
        `
    });
};

window.spiaggiaRenderer = function(item) {
    const safeObj = encodeURIComponent(JSON.stringify(item)).replace(/'/g, "%27");
    const nome = window.dbCol(item, 'Nome');
    const paesi = window.dbCol(item, 'Paesi');
    const tipo = window.dbCol(item, 'Tipo') || 'Mare';
    const lat = item.lat_sp; const lon = item.long_sp;
    const imgUrl = nome ? window.getSmartUrl(nome, '', 600) : null;

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
            ${getCandyBtn('visibility', 'Info', 'blue', `event.stopPropagation(); openModal('Spiagge', '${safeObj}')`)}
            ${(lat && lon) ? getCandyBtn('directions', 'Via', 'green', `window.openMapBtn(event, ${lat}, ${lon})`) : ''}
        `
    });
};

window.prodottoRenderer = (p) => {
    const titolo = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
    const fotoKey = p.Prodotti_foto || titolo;
    const imgUrl = window.getSmartUrl(fotoKey, '', 600);
    const safeObj = encodeURIComponent(JSON.stringify(p)).replace(/'/g, "%27");

    return renderMasterCard({
        id: p.id,
        onClick: `openModal('product', '${safeObj}')`,
        label: 'GASTRONOMIA',
        title: titolo,
        subText: 'Sapori autentici della tradizione ligure.',
        image: imgUrl,
        iconFallback: 'restaurant',
        themeColor: 'orange',
        buttonsHtml: `
            <div class="text-xs font-bold text-slate-300 uppercase tracking-widest mr-auto mt-2">Scopri</div>
            ${getCandyBtn('chevron_right', '', 'orange', `event.stopPropagation(); openModal('product', '${safeObj}')`)}
        `
    });
};

// VINI (NUOVO DESIGN SPAZIOSO)
window.vinoRenderer = function(item) {
    const safeId = item.id || item.ID; 
    const nome = item.Nome || 'Vino';
    const cantina = item.Produttore || 'Cantina Locale'; 
    let tipoRaw = window.dbCol(item, 'Tipo') || '';
    const tipo = String(tipoRaw).toLowerCase();
    const uve = window.dbCol(item, 'Uve');
    
    let themeColor = 'red';
    let tipoLabel = 'ROSSO';
    
    if (tipo.includes('bianco')) { themeColor = 'yellow'; tipoLabel = 'BIANCO'; }
    else if (tipo.includes('sciacchetr') || tipo.includes('dolce') || tipo.includes('passito')) { themeColor = 'orange'; tipoLabel = 'PASSITO'; }

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
    const durata = s.Durata || '--';
    const dist = s.Distanza || '--';

    if(s.gpx_url) { 
        if(!window.pendingMaps) window.pendingMaps = []; 
        window.pendingMaps.push({ id: uniqueId, gpx: s.gpx_url, startLabel: s.nome_partenza, endLabel: s.nome_arrivo }); 
    }

    return `
    <div class="bg-white rounded-[2rem] shadow-soft overflow-hidden flex flex-col h-full relative mb-6 group border border-slate-100/50 hover:shadow-lg transition-all">
        <div id="${uniqueId}" class="h-48 w-full bg-slate-100 relative border-b border-slate-100 cursor-pointer" onclick="window.openTechMap('${safeObj}')">
            <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-ct-green shadow-sm z-[400] font-sans tracking-widest uppercase">
                🥾 Outdoor
            </div>
            <div class="absolute inset-0 z-[300]" onclick="window.openTechMap('${safeObj}')"></div>
        </div>
        <div class="p-5 flex-1 flex flex-col">
            <div class="flex items-center gap-2 mb-2">
                 <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-sans">
                    ⏱ ${durata} • 📏 ${dist}
                 </span>
            </div>
            <h3 class="font-serif text-2xl font-bold text-slate-800 leading-tight mb-2">${nome}</h3>
        </div>
        <div class="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
             ${getCandyBtn('map', 'Mappa', 'green', `window.openTechMap('${safeObj}')`)}
             ${getCandyBtn('info', 'Info', 'blue', `window.openModal('sentieroInfo', '${safeObj}')`)}
        </div>
    </div>`;
};

window.farmacieRenderer = (f) => {
    return renderUtilityCard({
        icon: 'local_pharmacy',
        title: f.Nome || 'Farmacia',
        subtitle: f.Paesi || 'Servizio',
        phone: f.Numero,
        color: 'green'
    });
};

window.numeriUtiliRenderer = (n) => {
    let nome = n.Nome; try { if(typeof nome === 'string' && nome.startsWith('{')) nome = JSON.parse(nome)[window.currentLang] || 'Info'; } catch(e){}
    let icon = 'help'; let color = 'blue';
    if(String(nome).toLowerCase().includes('carabinieri') || String(nome).toLowerCase().includes('polizia')) { icon = 'local_police'; color = 'purple'; }
    if(String(nome).toLowerCase().includes('emergenza') || String(n.Numero).includes('112')) { icon = 'emergency'; color = 'red'; }
    
    return renderUtilityCard({
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
    window.open(`http://googleusercontent.com/maps.google.com/?q=${lat},${lon}`, '_blank');
};
