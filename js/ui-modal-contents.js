console.log("✅ 4. ui-modal-contents.js caricato (Cinque Terre Palette)");

window.getModalContent = function(type, payload, item) {
    
    let contentHtml = '';
    let modalClass = ''; 

    // --- RISTORANTE (Usa Giallo) ---
    if (type === 'ristorante' || type === 'restaurant') {
        const item = JSON.parse(decodeURIComponent(payload));
        const nome = window.dbCol(item, 'Nome');
        const indirizzo = window.dbCol(item, 'Paesi') || ''; 
        const desc = window.dbCol(item, 'Descrizioni') || window.t('desc_missing'); 

        contentHtml = `
            <div class="p-6 text-center">
                <h2 class="font-serif text-3xl font-bold text-slate-800 mb-2 leading-tight">${nome}</h2>
                <div class="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
                    <span class="material-icons text-base text-ct-yellow">place</span> ${indirizzo}
                </div>
                <div class="w-16 h-1 bg-ct-yellow mx-auto rounded-full mb-6"></div>
                <div class="text-slate-600 leading-relaxed text-lg">
                    ${desc}
                </div>
            </div>`;
    }

    // --- PRODOTTI (Usa Terracotta) ---
    else if (type === 'product') {
        const p = JSON.parse(decodeURIComponent(payload));
        const nome = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome') || 'Prodotto';
        const desc = window.dbCol(p, 'Descrizione');   
        const ideale = window.dbCol(p, 'Ideale per'); 
        const fotoKey = p.Prodotti_foto || nome;
        const bigImg = window.getSmartUrl(fotoKey, '', 800);

        contentHtml = `
            <div class="relative h-72 w-full">
                <img src="${bigImg}" class="w-full h-full object-cover" onerror="this.style.display='none'">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                <div class="absolute bottom-0 left-0 p-6 w-full">
                    <h2 class="text-3xl font-serif font-bold text-white mb-2 leading-tight shadow-black drop-shadow-md">${nome}</h2>
                    ${ideale ? `<span class="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">✨ ${window.t('ideal_for')}: ${ideale}</span>` : ''}
                </div>
            </div>
            <div class="p-6">
                <p class="text-slate-600 leading-relaxed text-lg">${desc || ''}</p>
            </div>`;
    }

    // --- VINI ---
    else if (type === 'Vini' || type === 'wine') {
        if (!item) { return { html: '', class: '' }; }
        const nome = window.dbCol(item, 'Nome');
        const tipo = window.dbCol(item, 'Tipo');
        const produttore = window.dbCol(item, 'Produttore');
        const uve = window.dbCol(item, 'Uve');
        const gradi = window.dbCol(item, 'Gradi');
        const abbinamenti = window.dbCol(item, 'Abbinamenti');
        const desc = window.dbCol(item, 'Descrizione');
        const foto = window.dbCol(item, 'Foto');

        const t = String(tipo).toLowerCase();
        let colorText = 'text-ct-terracotta'; 
        let bgBadge = 'bg-ct-terracotta-light text-ct-terracotta';
        let iconColor = 'text-ct-terracotta';
        
        if (t.includes('bianco')) { 
            colorText = 'text-ct-yellow'; 
            bgBadge = 'bg-ct-yellow-light text-ct-yellow'; // Nota: bg-ct-yellow-light deve essere definito nel config o usiamo giallo chiaro standard
            iconColor = 'text-ct-yellow';
        } 

        contentHtml = `
            <div class="pb-6">
                ${foto ? `<div class="h-72 w-full relative"><img src="${foto}" class="w-full h-full object-cover"><div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div></div>` : 
                `<div class="py-10 bg-ct-sand flex justify-center border-b border-dashed border-slate-200">
                    <i class="ph-fill ph-wine text-7xl ${iconColor} drop-shadow-sm"></i>
                </div>`}

                <div class="px-6 -mt-8 relative z-10">
                    <div class="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100">
                        <h2 class="font-serif text-2xl font-bold text-slate-800 mb-1 leading-tight">${nome}</h2>
                        <div class="flex items-center justify-between mt-2">
                             <div class="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                <span class="material-icons text-sm">storefront</span> ${produttore}
                            </div>
                            <span class="px-3 py-1 rounded-lg text-xs font-bold uppercase ${bgBadge}">${tipo || '--'}</span>
                        </div>
                    </div>
                </div>

                <div class="px-6 mt-6">
                    <div class="grid grid-cols-2 gap-3 mb-6">
                        <div class="bg-ct-sand p-3 rounded-xl text-center border border-slate-100">
                            <div class="text-[10px] uppercase font-bold text-slate-400 mb-1">${window.t('wine_deg')}</div>
                            <div class="font-bold text-slate-700 text-lg">${gradi || '--'}</div>
                        </div>
                        <div class="bg-ct-sand p-3 rounded-xl text-center border border-slate-100 flex flex-col justify-center">
                            <div class="text-[10px] uppercase font-bold text-slate-400 mb-1">${window.t('wine_grapes')}</div>
                            <div class="font-bold text-slate-700 text-sm leading-tight">${uve || '--'}</div>
                        </div>
                    </div>

                    <div class="prose prose-slate prose-p:text-slate-600 prose-p:leading-relaxed mb-6">
                        <p>${desc}</p>
                    </div>
                </div>
            </div>`;
    }

    // --- SENTIERI ---
    else if (type === 'trail') {
        const p = JSON.parse(decodeURIComponent(payload));
        const titolo = window.dbCol(p, 'Paesi') || p.Nome;
        const nomeSentiero = p.Nome || '';
        const dist = p.Distanza || '--';
        const dura = p.Durata || '--';
        const diff = p.Tag || p.Difficolta || 'Media'; 
        const desc = window.dbCol(p, 'Descrizione') || '';
        let linkGpx = p.Link_Gpx || p.Link_gpx || p.gpxlink || p.Mappa || p.Gpx;
        if (!linkGpx) {
            const key = Object.keys(p).find(k => k.toLowerCase().includes('gpx') || k.toLowerCase().includes('mappa'));
            if (key) linkGpx = p[key];
        }

        contentHtml = `
        <div class="p-6">
            <h2 class="text-center font-serif text-2xl font-bold text-slate-800 mb-1">${titolo}</h2>
            ${nomeSentiero ? `<p class="text-center text-sm font-medium text-slate-500 mb-6">${nomeSentiero}</p>` : ''}
            
            <div class="grid grid-cols-3 gap-3 mb-6">
                <div class="bg-ct-sand p-3 rounded-2xl text-center border border-slate-100">
                    <span class="material-icons text-primary mb-1">straighten</span>
                    <div class="font-extrabold text-slate-700 text-lg leading-none">${dist}</div>
                    <div class="text-[10px] uppercase font-bold text-slate-400 mt-1">${window.t('distance')}</div>
                </div>
                <div class="bg-ct-sand p-3 rounded-2xl text-center border border-slate-100">
                    <span class="material-icons text-primary mb-1">schedule</span>
                    <div class="font-extrabold text-slate-700 text-lg leading-none">${dura}</div>
                    <div class="text-[10px] uppercase font-bold text-slate-400 mt-1">${window.t('duration')}</div>
                </div>
                <div class="bg-ct-sand p-3 rounded-2xl text-center border border-slate-100">
                    <span class="material-icons text-primary mb-1">terrain</span>
                    <div class="font-extrabold text-slate-600 text-sm pt-1 leading-none uppercase">${diff}</div>
                    <div class="text-[10px] uppercase font-bold text-slate-400 mt-2">${window.t('level')}</div>
                </div>
            </div>

            <div class="flex flex-col gap-3 mb-6">
                ${linkGpx ? `
                <a href="${linkGpx}" download="${nomeSentiero || 'percorso'}.gpx" target="_blank" class="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                    <span class="material-icons">file_download</span> ${window.t('btn_download_gpx')}
                </a>` : `
                <div class="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-500 font-bold rounded-xl border border-red-100">
                    <span class="material-icons">error_outline</span> ${window.t('gpx_missing')}
                </div>`}
            </div>

            <div class="prose prose-slate prose-p:text-slate-600 prose-sm text-justify">
                ${desc}
            </div>
        </div>`;
    }

    // --- INFO SENTIERI ---
    else if (type === 'sentieroInfo') {
        let item = {};
        try { item = JSON.parse(decodeURIComponent(payload)); } catch(e) {}
        const desc = window.dbCol(item, 'Descrizione') || window.dbCol(item, 'descrizione');
        const nome = item.nome || item.Titolo || 'Info Sentiero';

        contentHtml = `
            <div class="p-8">
                <h2 class="font-serif text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">${nome}</h2>
                <div class="text-slate-600 text-lg leading-relaxed space-y-4">
                    ${desc || 'Nessuna informazione disponibile.'}
                </div>
            </div>
        `;
    }
    
    // --- MAPPA ---
    else if (type === 'map') {
        const uniqueMapId = 'modal-map-' + Math.random().toString(36).substr(2, 9);
        contentHtml = `
            <div class="p-4 h-full flex flex-col">
                <h3 class="text-center font-bold text-slate-700 mb-3">${window.t('map_route_title')}</h3>
                <div id="${uniqueMapId}" class="flex-1 min-h-[450px] w-full rounded-2xl border border-slate-200 shadow-inner z-0 overflow-hidden"></div>
                <p class="text-center text-xs font-medium text-slate-400 mt-3 flex items-center justify-center gap-1">
                    <span class="material-icons text-sm">touch_app</span> ${window.t('map_zoom_hint')}
                </p>
            </div>
        `;
    }

    // --- SPIAGGE ---
    else if (type === 'Spiagge') {
        let beachItem = {};
        try { beachItem = JSON.parse(decodeURIComponent(payload)); } catch(e) { if(item) beachItem = item; }
        if (!beachItem || Object.keys(beachItem).length === 0) { return { html: `<div class="p-8 text-center text-slate-500">Dati non trovati</div>`, class: '' }; }

        const nome = window.dbCol(beachItem, 'Nome') || 'Spiaggia';
        const tipo = window.dbCol(beachItem, 'Tipo');
        const desc = window.dbCol(beachItem, 'Descrizione');
        
        contentHtml = `
             <div class="p-8">
                <div class="mb-4">
                    <h2 class="font-serif text-3xl font-bold text-ct-blue mb-2">${nome}</h2>
                    ${tipo ? `<span class="inline-block px-3 py-1 bg-ct-blue-light text-ct-blue rounded-full text-xs font-bold uppercase tracking-wide">${tipo}</span>` : ''}
                </div>
                <div class="w-full h-px bg-slate-100 mb-6"></div>
                <div class="text-slate-600 leading-relaxed text-lg text-justify">
                    ${desc || window.t('desc_missing') || 'Descrizione non disponibile.'}
                </div>
             </div>
        `;
    }

    // --- ATTRAZIONI ---
    else if (type === 'Attrazioni' || type === 'attrazione') {
        if (!item) { return { html: '', class: '' }; }
        const titolo = window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo');
        const curiosita = window.dbCol(item, 'Curiosita');
        const desc = window.dbCol(item, 'Descrizione');
        const img = window.dbCol(item, 'Immagine') || window.dbCol(item, 'Foto'); 

        contentHtml = `
            ${img ? 
            `<div class="h-64 w-full relative"><img src="${img}" class="w-full h-full object-cover"><div class="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent"></div></div>` : 
            `<div class="py-8 bg-slate-100 flex justify-center border-b border-slate-200"><i class="fa-solid fa-landmark text-6xl text-slate-400"></i></div>`}

            <div class="p-8 ${img ? '-mt-12 relative z-10' : ''}">
                <div class="${img ? 'bg-white p-6 rounded-2xl shadow-lg' : ''}">
                    <h2 class="font-serif text-2xl font-bold text-slate-800 mb-2 leading-tight">${titolo}</h2>
                    <div class="w-12 h-1 bg-ct-terracotta rounded-full mb-4"></div>

                    ${curiosita ? `
                    <div class="bg-amber-50 border-l-4 border-amber-300 p-4 rounded-r-xl mb-6">
                        <div class="text-xs font-bold text-amber-800 uppercase mb-1 flex items-center gap-1">
                            <span class="material-icons text-sm">lightbulb</span> ${window.t('label_curiosity')}
                        </div>
                        <div class="text-amber-900 italic text-sm leading-relaxed">${curiosita}</div>
                    </div>` : ''}
                    
                    <p class="text-slate-600 text-lg leading-relaxed text-justify">${desc || window.t('desc_missing')}</p>
                </div>
            </div>`;
    }
    
    // --- TRASPORTI ---
    else if (type === 'transport') {
        const transportId = payload; 
        let title = '';
        let customContent = '';

        if (transportId === 'bus') {
            title = window.t('label_bus');
            const todayISO = new Date().toISOString().split('T')[0];
            const nowTime = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');

            const ticketSection = `
                <button onclick="toggleTicketInfo()" class="w-full mb-4 bg-ct-yellow-light text-yellow-800 border border-yellow-200 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <span>🎟️ ${window.t('how_to_ticket')}</span> <span class="material-icons text-sm">expand_more</span>
                </button>
                <div id="ticket-info-box" class="hidden bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 text-sm text-slate-600 leading-relaxed">
                    <p class="mb-2"><strong>📱 SMS/APP:</strong> Scarica l'app ATC La Spezia.</p>
                    <div class="bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-100 text-xs mt-2">
                        <strong>⚠️ ${window.t('label_warning')}:</strong> Biglietti a bordo con sovrapprezzo.
                    </div>
                </div>`;

            const mapToggleSection = `
                <button id="btn-bus-map-toggle" onclick="toggleBusMap()" class="w-full mb-4 bg-purple-50 text-purple-800 border border-purple-100 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <span>🗺️ ${window.t('show_map')}</span> <span class="material-icons text-sm">expand_more</span>
                </button>
                <div id="bus-map-wrapper" class="hidden mb-6 animate-fade">
                    <div id="bus-map" class="h-64 w-full rounded-xl border-2 border-purple-100 z-10 overflow-hidden relative"></div>
                    <p class="text-center text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wide">${window.t('map_hint')}</p>
                </div>`;

            customContent = `
            <div class="p-2 animate-fade">
                ${ticketSection}
                ${mapToggleSection}
                
                <div class="flex gap-3 mb-3">
                    <div class="flex-1">
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">${window.t('departure')}</label>
                        <select id="selPartenza" class="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl p-3 focus:outline-none focus:border-ct-yellow transition-colors appearance-none" onchange="window.handleBusSelectionChange('partenza')">
                            <option value="" disabled selected>${window.t('loading')}...</option>
                        </select>
                    </div>
                    <div class="flex-1">
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">${window.t('arrival')}</label>
                        <select id="selArrivo" class="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl p-3 focus:outline-none focus:border-ct-yellow transition-colors appearance-none" onchange="window.handleBusSelectionChange('arrivo')">
                            <option value="" disabled selected>--</option>
                        </select>
                    </div>
                </div>

                <div class="flex gap-3 mb-4">
                    <div class="flex-1"><label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">${window.t('date_trip')}</label><input type="date" id="selData" class="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl p-3 focus:outline-none" value="${todayISO}"></div>
                    <div class="flex-1"><label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">${window.t('time_trip')}</label><input type="time" id="selOra" class="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl p-3 focus:outline-none" value="${nowTime}"></div>
                </div>

                <button id="btnSearchBus" onclick="eseguiRicercaBus()" class="w-full py-4 rounded-xl bg-ct-yellow text-white font-bold text-lg shadow-lg shadow-ct-yellow/30 active:scale-95 transition-transform">
                    ${window.t('find_times')}
                </button>

                <div id="busResultsContainer" class="hidden mt-6 pb-6">
                    <div id="nextBusCard" class="bg-gradient-to-br from-ct-yellow to-yellow-600 text-white p-6 rounded-2xl shadow-lg mb-4 text-center relative overflow-hidden"></div>
                    <div class="text-xs font-bold uppercase text-slate-400 mb-3 ml-1">${window.t('next_runs')}</div>
                    <div id="otherBusList" class="space-y-2"></div>
                </div>
            </div>`;
            
            setTimeout(() => { if(window.loadAllStops) window.loadAllStops(); }, 100);
        }

        else if (transportId === 'ferry') {
            title = window.t('label_ferry');
            const todayISO = new Date().toISOString().split('T')[0];
            const nowTime = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');

            customContent = `
            <div class="p-2 animate-fade">
                <button onclick="toggleTicketInfo()" class="w-full mb-4 bg-ct-blue-light text-ct-blue border border-cyan-100 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <span>🎟️ ${window.t('how_to_ticket')}</span> <span class="material-icons text-sm">expand_more</span>
                </button>
                <div id="ticket-info-box" class="hidden bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 text-sm text-slate-600 leading-relaxed">
                    <p>Biglietti acquistabili al molo prima dell'imbarco.</p>
                    <div class="bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-100 text-xs mt-2">
                        <strong>⚠️ METEO:</strong> Servizio sospeso con mare mosso.
                    </div>
                </div>

                <div class="flex gap-3 mb-3">
                    <div class="flex-1">
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">${window.t('departure')}</label>
                        <select id="selPartenzaFerry" class="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl p-3 focus:outline-none focus:border-ct-blue transition-colors appearance-none">
                            <option value="" disabled selected>${window.t('loading')}...</option>
                        </select>
                    </div>
                    <div class="flex-1">
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">${window.t('arrival')}</label>
                        <select id="selArrivoFerry" class="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl p-3 focus:outline-none focus:border-ct-blue transition-colors appearance-none">
                            <option value="" disabled selected>--</option>
                        </select>
                    </div>
                </div>

                <div class="flex gap-3 mb-4">
                    <div class="flex-1"><label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">${window.t('date_trip')}</label><input type="date" id="selDataFerry" class="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl p-3 focus:outline-none" value="${todayISO}"></div>
                    <div class="flex-1"><label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">${window.t('time_trip')}</label><input type="time" id="selOraFerry" class="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl p-3 focus:outline-none" value="${nowTime}"></div>
                </div>
                
                <button onclick="eseguiRicercaTraghetto()" class="w-full py-4 rounded-xl bg-ct-blue text-white font-bold text-lg shadow-lg shadow-ct-blue/30 active:scale-95 transition-transform">
                    ${window.t('find_times')}
                </button>
                
                <div id="ferryResultsContainer" class="hidden mt-6 pb-6">
                    <div id="nextFerryCard" class="bg-gradient-to-br from-ct-blue to-blue-700 text-white p-6 rounded-2xl shadow-lg mb-4 text-center"></div>
                    <div class="text-xs font-bold uppercase text-slate-400 mb-3 ml-1">${window.t('next_runs')}</div>
                    <div id="otherFerryList" class="space-y-2"></div>
                </div>
            </div>`;

            setTimeout(() => window.initFerrySearch(), 50);
        }

        else if (transportId === 'train') {
            title = window.t('label_train');
            const nowTime = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');
            if (window.trainSearchRenderer) { customContent = window.trainSearchRenderer(null, nowTime); } 
            else { customContent = "<p>Errore interfaccia Treni.</p>"; }
        }

        contentHtml = `
            <div class="p-6">
                <div class="flex items-center gap-3 mb-6">
                    <h2 class="font-serif text-3xl font-bold text-slate-800">${title}</h2>
                </div>
                ${customContent}
            </div>
        `;
    }

    // --- FARMACIA ---
    else if (type === 'farmacia') {
        const item = JSON.parse(decodeURIComponent(payload)); 
        const nome = window.dbCol(item, 'Nome');
        const paesi = window.dbCol(item, 'Paesi');
        contentHtml = `
            <div class="p-6 text-center">
                <div class="w-16 h-16 bg-ct-green-light rounded-full flex items-center justify-center mx-auto mb-4 text-ct-green">
                    <span class="material-icons text-3xl">local_pharmacy</span>
                </div>
                <h2 class="font-serif text-2xl font-bold text-slate-800 mb-2">${nome}</h2>
                <p class="text-slate-500 mb-6 flex items-center justify-center gap-1 font-medium"><span class="material-icons text-sm">place</span> ${item.Indirizzo || item.Paesi || ''}</p>
                <a href="tel:${item.Numero || item.Telefono}" class="inline-flex items-center justify-center gap-2 bg-ct-green text-white py-3 px-8 rounded-full font-bold shadow-lg shadow-ct-green/20 active:scale-95 transition-transform">
                    <span class="material-icons">call</span> Chiama
                </a>
            </div>`;
    }

    return { html: contentHtml, class: modalClass };
};

// Helper Treni (Usa Terracotta)
window.trainSearchRenderer = (data, nowTime) => {
    return `
    <div class="animate-fade">
        <div class="bg-ct-terracotta-light border-l-4 border-ct-terracotta p-4 rounded-r-xl mb-6">
            <p class="text-ct-terracotta-dark font-medium leading-relaxed text-sm">${window.t('train_desc')}</p>
        </div>
        
        <div class="bg-white border border-slate-100 rounded-2xl p-5 mb-6 shadow-sm">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">⏱️ ${window.t('avg_times')}</h4>
            <div class="space-y-3 text-sm">
                <div class="flex justify-between items-center">
                    <span class="text-slate-600">La Spezia ↔ Riomaggiore</span> <b class="text-slate-900 bg-slate-100 px-2 py-1 rounded">7 min</b>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-slate-600">${window.t('between_villages')}</span> <b class="text-slate-900 bg-slate-100 px-2 py-1 rounded">2-4 min</b>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-slate-600">Monterosso ↔ Levanto</span> <b class="text-slate-900 bg-slate-100 px-2 py-1 rounded">5 min</b>
                </div>
            </div>
        </div>

        <button onclick="apriTrenitalia()" class="w-full py-4 rounded-xl bg-ct-terracotta text-white font-bold text-lg shadow-lg shadow-ct-terracotta/30 active:scale-95 transition-transform flex items-center justify-center gap-2">
            <span>${window.t('train_cta')}</span> <span class="material-icons text-sm">open_in_new</span>
        </button>
        
        <p class="text-center text-[10px] text-slate-400 mt-4">${window.t('check_site')}</p>
    </div>`;
};

// LISTA FERMATE TRAGHETTI (Invariato)
const FERRY_STOPS_UI = [
    { id: 'levanto', label: 'Levanto' },
    { id: 'monterosso', label: 'Monterosso' },
    { id: 'vernazza', label: 'Vernazza' },
    { id: 'corniglia', label: 'Corniglia' },
    { id: 'manarola', label: 'Manarola' },
    { id: 'riomaggiore', label: 'Riomaggiore' },
    { id: 'portovenere', label: 'Portovenere' },
    { id: 'la spezia', label: 'La Spezia' },
    { id: 'lerici', label: 'Lerici' }
];

window.initFerrySearch = function() {
    const selPart = document.getElementById('selPartenzaFerry');
    const selArr = document.getElementById('selArrivoFerry');
    if (!selPart || !selArr) return;

    selPart.innerHTML = `<option value="" disabled selected>${window.t('select_placeholder')}</option>` + 
        FERRY_STOPS_UI.map(s => `<option value="${s.id}">${s.label}</option>`).join('');

    selPart.addEventListener('change', function() {
        const startVal = this.value;
        const destOpts = FERRY_STOPS_UI.filter(s => s.id !== startVal);
        selArr.innerHTML = `<option value="" disabled selected>${window.t('select_placeholder')}</option>` + 
            destOpts.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
        selArr.disabled = false;
    });
};