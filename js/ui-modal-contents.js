console.log("✅ 4. ui-modal-contents.js caricato (Fixed)");

window.getModalContent = function(type, payload, item) {
    
    let contentHtml = '';
    let modalClass = ''; 

    // --- RISTORANTE ---
   if (type === 'ristorante' || type === 'restaurant') {
    const item = JSON.parse(decodeURIComponent(payload));
    const nome = window.dbCol(item, 'Nome');
    const nomeIT = window.valIT(item, 'Nome'); 
    const indirizzo = window.dbCol(item, 'Paesi') || ''; 
    const desc = window.dbCol(item, 'Descrizioni') || window.t('desc_missing'); 
    
    const imgUrl = window.getSmartUrl(nomeIT, 'Home/Ristoranti', 800);

    contentHtml = `
        <div class="relative h-64 w-full">
            <img src="${imgUrl}" class="w-full h-full object-cover" onerror="this.parentElement.style.display='none'">
            <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </div>
        <div class="p-6 text-center">
            <h2 class="font-serif text-3xl font-bold text-slate-800 mb-2 leading-tight">${nome}</h2>
            <p class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">📍 ${indirizzo}</p>
            <div class="text-slate-600 leading-relaxed text-lg">${desc}</div>
        </div>`;
    }
    // --- PRODOTTI ---
    else if (type === 'product') {
        const p = JSON.parse(decodeURIComponent(payload));
        const nome = window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome');
        const nomeIT = window.valIT(p, 'Prodotti') || window.valIT(p, 'Nome');
        const desc = window.dbCol(p, 'Descrizione');   
        const ideale = window.dbCol(p, 'Ideale per'); 
        const fotoKey = p.Prodotti_foto || nomeIT;
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
        const tipoLabel = window.t('wine_red'); // Fallback
        const produttore = window.dbCol(item, 'Produttore');
        const uve = window.dbCol(item, 'Uve');
        const gradi = window.dbCol(item, 'Gradi');
        const abbinamenti = window.dbCol(item, 'Abbinamenti');
        const desc = window.dbCol(item, 'Descrizione');
        const foto = window.dbCol(item, 'Foto');

        // Logic color based on IT
        const tipoIT = String(window.valIT(item, 'Tipo')).toLowerCase();
        let colorText = 'text-ct-terracotta'; 
        let bgBadge = 'bg-ct-terracotta-light text-ct-terracotta';
        let displayType = window.t('wine_red');

        if (tipoIT.includes('bianco')) { 
            colorText = 'text-ct-yellow'; 
            bgBadge = 'bg-ct-yellow-light text-ct-yellow';
            displayType = window.t('wine_white');
        } else if (tipoIT.includes('passito') || tipoIT.includes('sciacchetr')) {
            displayType = window.t('wine_passito');
        }

        contentHtml = `
            <div class="pb-6">
                ${foto ? `<div class="h-72 w-full relative"><img src="${foto}" class="w-full h-full object-cover"><div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div></div>` : 
                `<div class="py-10 bg-ct-sand flex justify-center border-b border-dashed border-slate-200">
                    <i class="ph-fill ph-wine text-7xl ${colorText} drop-shadow-sm"></i>
                </div>`}

                <div class="px-6 -mt-8 relative z-10">
                    <div class="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100">
                        <h2 class="font-serif text-2xl font-bold text-slate-800 mb-1 leading-tight">${nome}</h2>
                        <div class="flex items-center justify-between mt-2">
                             <div class="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                <span class="material-icons text-sm">storefront</span> ${produttore}
                            </div>
                            <span class="px-3 py-1 rounded-lg text-xs font-bold uppercase ${bgBadge}">${displayType}</span>
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
    // --- INFO SENTIERI (RESTYLING) ---
    else if (type === 'sentieroInfo') {
        let item = {};
        try { item = JSON.parse(decodeURIComponent(payload)); } catch(e) {}
        
        const nome = item.Nome || item.Titolo || 'Dettagli Sentiero';
        const desc = window.dbCol(item, 'Descrizione') || window.dbCol(item, 'descrizione') || 'Descrizione non disponibile.';
        
        // Dati tecnici con fallback
        const dist = item.Distanza || '--';
        const dur = item.Durata || '--';
        const diff = item.Tag || item.Difficolta || 'Medio';
        
        // Colore badge difficoltà
        let diffColor = 'text-yellow-600 bg-yellow-50 border-yellow-100';
        if(diff.toLowerCase().includes('facile') || diff.toLowerCase().includes('turistic')) diffColor = 'text-green-600 bg-green-50 border-green-100';
        if(diff.toLowerCase().includes('esperto') || diff.toLowerCase().includes('difficile')) diffColor = 'text-red-600 bg-red-50 border-red-100';

        contentHtml = `
            <div class="relative w-full bg-white min-h-[400px]">
                
                <div class="bg-gradient-to-br from-ct-green to-[#4a5d2b] p-8 pb-12 relative overflow-hidden">
                    <div class="absolute -right-6 -top-6 opacity-20 transform rotate-12">
                        <span class="material-icons text-[150px] text-white">hiking</span>
                    </div>
                    
                    <div class="relative z-10">
                        <span class="inline-block py-1 px-3 rounded-lg bg-white/20 backdrop-blur border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest mb-3">
                            Outdoor & Trekking
                        </span>
                        <h2 class="font-serif text-3xl font-bold text-white leading-tight shadow-black drop-shadow-md pr-4">
                            ${nome}
                        </h2>
                    </div>
                </div>

                <div class="px-6 relative z-20 -mt-8">
                    <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-4 border border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
                        
                        <div class="flex flex-col items-center justify-center text-center px-1">
                            <span class="material-icons text-ct-green text-xl mb-1">schedule</span>
                            <span class="text-sm font-extrabold text-slate-700 leading-none">${dur}</span>
                            <span class="text-[9px] font-bold text-slate-400 uppercase mt-1">Durata</span>
                        </div>

                        <div class="flex flex-col items-center justify-center text-center px-1">
                            <span class="material-icons text-ct-green text-xl mb-1">straighten</span>
                            <span class="text-sm font-extrabold text-slate-700 leading-none">${dist}</span>
                            <span class="text-[9px] font-bold text-slate-400 uppercase mt-1">Lunghezza</span>
                        </div>

                        <div class="flex flex-col items-center justify-center text-center px-1">
                            <span class="material-icons text-ct-green text-xl mb-1">signal_cellular_alt</span>
                            <span class="text-sm font-extrabold text-slate-700 leading-none truncate w-full">${diff.slice(0,8)}</span>
                            <span class="text-[9px] font-bold text-slate-400 uppercase mt-1">Livello</span>
                        </div>

                    </div>
                </div>

                <div class="p-6 pt-8">
                    
                    <div class="mb-6 flex justify-center">
                        <span class="px-4 py-1.5 rounded-full border ${diffColor} text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                            <span class="material-icons text-sm">info</span> Difficoltà: ${diff}
                        </span>
                    </div>

                    <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
                        Descrizione del percorso
                    </h3>
                    
                    <div class="prose prose-slate prose-p:text-slate-600 prose-p:text-lg prose-p:leading-relaxed text-justify">
                        ${desc}
                    </div>

                    <div class="mt-8 pt-6 border-t border-dashed border-slate-200 text-center">
                        <p class="text-[10px] text-slate-400 italic">
                            Ricorda: indossa sempre scarpe adatte e porta acqua con te.
                        </p>
                    </div>
                </div>
            </div>
        `;
        // Nota: rimuoviamo padding/rounded standard dalla modale container per far aderire l'header
        return { html: contentHtml, class: 'bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative max-h-[85vh] overflow-y-auto' };
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
                    ${desc || window.t('desc_missing')}
                </div>
             </div>
        `;
    }

    // --- ATTRAZIONI ---
    else if (type === 'Attrazioni' || type === 'attrazione') {
        if (!item) { return { html: '', class: '' }; }
        const titolo = window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo');
        const titoloIT = window.valIT(item, 'Attrazioni') || window.valIT(item, 'Titolo'); 
        const curiosita = window.dbCol(item, 'Curiosita');
        const desc = window.dbCol(item, 'Descrizione');
        const img = window.getSmartUrl(titoloIT, '', 800); 

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

    // A. TRENO
    if (transportId === 'train') {
        contentHtml = `
        <div class="relative bg-white min-h-[400px]">
            <div class="bg-ct-terracotta p-6 pb-10 rounded-b-[2.5rem] shadow-soft relative z-0">
                <div class="flex justify-between items-start pt-2">
                    <div>
                        <span class="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1 block">Cinque Terre Express</span>
                        <h2 class="font-serif text-3xl font-bold text-white leading-none">${window.t('label_train')}</h2>
                    </div>
                    <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-sm">
                        <span class="material-icons text-2xl text-white">train</span>
                    </div>
                </div>
            </div>

            <div class="px-5 -mt-8 relative z-10 animate-pop">
                <div class="bg-white rounded-[2rem] shadow-xl shadow-orange-100/50 p-6 border border-slate-100 mb-6">
                    <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <span class="material-icons text-sm text-ct-terracotta">timer</span> ${window.t('avg_times')}
                    </h4>
                    <div class="space-y-4 text-sm">
                        <div class="flex justify-between items-center group">
                            <span class="text-slate-600 font-medium">La Spezia ↔ Riomaggiore</span> 
                            <b class="text-ct-terracotta bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">7 min</b>
                        </div>
                        <div class="flex justify-between items-center group">
                            <span class="text-slate-600 font-medium">${window.t('between_villages')}</span> 
                            <b class="text-ct-terracotta bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">2-4 min</b>
                        </div>
                        <div class="flex justify-between items-center group">
                            <span class="text-slate-600 font-medium">Monterosso ↔ Levanto</span> 
                            <b class="text-ct-terracotta bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">5 min</b>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-50 border-l-4 border-ct-terracotta p-4 rounded-r-xl mb-6 shadow-sm">
                    <p class="text-slate-600 font-medium leading-relaxed text-sm">${window.t('train_desc')}</p>
                </div>

                <button onclick="window.apriTrenitalia()" class="w-full py-4 rounded-2xl bg-ct-terracotta text-white font-bold text-lg shadow-xl shadow-orange-200 active:scale-95 transition-transform flex items-center justify-center gap-2 relative overflow-hidden group">
                    <span class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"></span>
                    <span class="relative z-10">${window.t('train_cta')}</span> 
                    <span class="material-icons text-sm relative z-10">open_in_new</span>
                </button>
                
                <p class="text-center text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-wide opacity-70 mb-6">${window.t('check_site')}</p>
            </div>
        </div>`;
        return { html: contentHtml, class: 'bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto' };
    }

    // B. BUS & BATTELLI
    else {
        const isBus = transportId === 'bus';
        
        const config = isBus ? {
            title: window.t('label_bus'),
            bg: 'bg-ct-yellow', 
            marker: 'bg-amber-500',
            icon: 'directions_bus',
            btnFunction: 'eseguiRicercaBus()',
            changeFunction: "window.handleBusSelectionChange",
            mapToggle: true
        } : {
            title: window.t('label_ferry'),
            bg: 'bg-ct-blue', 
            marker: 'bg-cyan-500',
            icon: 'directions_boat',
            btnFunction: 'eseguiRicercaTraghetto()',
            changeFunction: "window.handleFerrySelectionChange",
            mapToggle: false 
        };

        const todayISO = new Date().toISOString().split('T')[0];
        const nowTime = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');

        const idPartenza = isBus ? 'selPartenza' : 'selPartenzaFerry';
        const idArrivo = isBus ? 'selArrivo' : 'selArrivoFerry';
        const idData = isBus ? 'selData' : 'selDataFerry';
        const idOra = isBus ? 'selOra' : 'selOraFerry';

        contentHtml = `
        <div class="relative bg-slate-50 min-h-[500px]">
            
            <div class="${config.bg} p-6 pb-12 rounded-b-[2.5rem] shadow-soft relative z-0 transition-colors duration-500">
                <div class="flex justify-between items-start pt-2">
                    <div>
                        <span class="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1 block">Travel & Go</span>
                        <h2 class="font-serif text-3xl font-bold text-white leading-none">${config.title}</h2>
                    </div>
                    <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-sm">
                        <span class="material-icons text-2xl text-white">${config.icon}</span>
                    </div>
                </div>
            </div>

            <div class="px-5 -mt-8 relative z-10">
                <div class="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 p-1 border border-white overflow-hidden">
                    
                    <div class="relative p-5 pb-2">
                        
                        <div class="absolute left-6 top-7 bottom-6 w-6 flex flex-col items-center pointer-events-none">
                            <div class="w-3 h-3 rounded-full border-[3px] border-slate-300 bg-white shadow-sm z-10"></div>
                            <div class="flex-1 w-0.5 border-l-2 border-dashed border-slate-300 my-1 opacity-50"></div>
                            <div class="w-3 h-3 rounded-sm ${config.marker} shadow-sm z-10"></div>
                        </div>

                        ${config.mapToggle ? `
                        <button onclick="toggleBusMap()" id="btn-bus-map-toggle" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center bg-indigo-50 text-indigo-500 rounded-2xl border border-indigo-100 shadow-sm active:scale-95 transition-all" title="${window.t('show_map')}">
                            <span class="material-icons text-xl">map</span>
                        </button>` : ''}

                        <div class="pl-10 mb-6 group relative mr-12">
                            <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">${window.t('departure')}</label>
                            <div class="relative">
                                <select id="${idPartenza}" 
                                    class="w-full appearance-none bg-transparent text-xl font-bold text-slate-800 focus:outline-none cursor-pointer truncate pr-2 py-1 border-b border-transparent hover:border-slate-100 transition-colors"
                                    onchange="${config.changeFunction}('partenza')">
                                    <option value="" selected>${window.t('select_start')}</option>
                                </select>
                            </div>
                        </div>

                        <div class="pl-10 mb-2 group relative mr-12">
                            <label class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">${window.t('arrival')}</label>
                            <div class="relative">
                                <select id="${idArrivo}" 
                                    class="w-full appearance-none bg-transparent text-xl font-bold text-slate-800 focus:outline-none cursor-pointer truncate pr-2 py-1 border-b border-transparent hover:border-slate-100 transition-colors"
                                    onchange="${config.changeFunction}('arrivo')">
                                    <option value="" selected>${window.t('select_placeholder')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="bg-slate-50 border-t border-slate-100 p-3 flex items-center gap-3">
                        <div class="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm px-3 py-3 flex items-center gap-2 cursor-pointer hover:border-slate-300 transition-colors">
                            <span class="material-icons text-slate-400 text-sm">event</span>
                            <input type="date" id="${idData}" class="bg-transparent text-sm font-bold text-slate-700 w-full focus:outline-none uppercase font-sans cursor-pointer" value="${todayISO}">
                        </div>
                        <div class="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm px-3 py-3 flex items-center gap-2 cursor-pointer hover:border-slate-300 transition-colors">
                             <span class="material-icons text-slate-400 text-sm">schedule</span>
                             <input type="time" id="${idOra}" class="bg-transparent text-sm font-bold text-slate-700 w-full focus:outline-none cursor-pointer" value="${nowTime}">
                        </div>
                    </div>
                </div>
            </div>

            ${config.mapToggle ? `
            <div id="bus-map-wrapper" class="hidden mx-5 mt-3 rounded-2xl overflow-hidden shadow-inner border-2 border-white bg-slate-200 animate-fade relative h-64 z-0">
                 <div class="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 shadow-sm z-[400] pointer-events-none border border-slate-200 whitespace-nowrap">
                    ${window.t('map_hint')}
                </div>
                <div id="bus-map" class="h-full w-full"></div>
            </div>` : ''}

            <div class="px-5 mt-6 mb-8">
                <button onclick="${config.btnFunction}" 
                    class="w-full py-4 rounded-2xl ${config.bg} text-white shadow-xl shadow-slate-300 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group relative overflow-hidden">
                    <span class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"></span>
                    <span class="material-icons relative z-10">search</span>
                    <span class="font-bold text-lg tracking-wide relative z-10 uppercase">${window.t('find_times')}</span>
                </button>
                
                <div class="mt-4 text-center">
                    <button onclick="toggleTicketInfo()" class="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-600 transition-colors py-2 px-4 rounded-full hover:bg-slate-100">
                        <span class="material-icons text-sm">confirmation_number</span> ${window.t('how_to_ticket')}
                    </button>
                    <div id="ticket-info-box" class="hidden mt-2 p-4 bg-white rounded-xl text-xs text-slate-500 border border-slate-200 shadow-sm animate-fade mx-auto text-center leading-relaxed">
                        <p class="mb-2">${window.t('ticket_info_text')}</p>
                    </div>
                </div>
            </div>

            <div id="${isBus ? 'busResultsContainer' : 'ferryResultsContainer'}" class="hidden px-5 pb-12 border-t border-slate-200/60 pt-6 bg-white rounded-t-[2.5rem] shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
                <div id="${isBus ? 'nextBusCard' : 'nextFerryCard'}" class="bg-gradient-to-br ${isBus ? 'from-ct-yellow to-orange-400' : 'from-ct-blue to-teal-600'} text-white p-6 rounded-[2rem] shadow-lg mb-8 text-center relative overflow-hidden ring-4 ring-slate-50"></div>
                <div class="pl-2 mb-4 flex items-center gap-2">
                     <div class="h-px bg-slate-100 flex-1"></div>
                     <span class="text-[10px] font-bold uppercase text-slate-300 tracking-widest">${window.t('next_runs')}</span>
                     <div class="h-px bg-slate-100 flex-1"></div>
                </div>
                <div id="${isBus ? 'otherBusList' : 'otherFerryList'}" class="space-y-3"></div>
            </div>
        </div>`;

        setTimeout(() => {
            if(isBus && window.loadAllStops) window.loadAllStops();
            else if(!isBus && window.initFerrySearch) window.initFerrySearch();
        }, 100);

        return { html: contentHtml, class: 'bg-slate-50 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto' };
    }

    // --- FARMACIA ---
    } else if (type === 'farmacia') {
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

    selPart.innerHTML = `<option value="" disabled selected>${window.t('select_start')}</option>` + 
        FERRY_STOPS_UI.map(s => `<option value="${s.id}">${s.label}</option>`).join('');

    selPart.addEventListener('change', function() {
        const startVal = this.value;
        const destOpts = FERRY_STOPS_UI.filter(s => s.id !== startVal);
        selArr.innerHTML = `<option value="" disabled selected>${window.t('select_arrival_placeholder')}</option>` + 
            destOpts.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
        selArr.disabled = false;
    });
};