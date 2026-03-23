window.getModalContent = function(type, payload, item) {
    
    let contentHtml = '';
    let modalClass = ''; 

    // --- RISTORANTE ---
   if (type === 'ristorante' || type === 'restaurant') {
    const item = JSON.parse(decodeURIComponent(payload));
    const esc = window.escapeHtml || (s => s);
    const nome = esc(window.dbCol(item, 'Nome'));
    const nomeIT = window.valIT(item, 'Nome');
    const indirizzo = esc(window.dbCol(item, 'Paesi') || '');
    const desc = esc(window.dbCol(item, 'Descrizioni') || window.t('desc_missing')); 
    
    const imgUrl = window.getSmartUrl(nomeIT, '', 600);

    contentHtml = `
        <div class="relative h-72 w-full bg-slate-200">
            <img src="${imgUrl}" loading="lazy" class="w-full h-full object-cover" onerror="this.parentElement.classList.add('flex','items-center','justify-center'); this.style.display='none'; this.parentElement.innerHTML+='<span class=\'material-icons text-5xl text-slate-400\'>restaurant</span>'">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 p-6 w-full">
                <h2 class="text-3xl font-serif font-bold text-white mb-2 leading-tight shadow-black drop-shadow-md">${nome}</h2>
                ${indirizzo ? `<span class="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">📍 ${indirizzo}</span>` : ''}
            </div>
        </div>
        <div class="p-6">
            <p class="text-slate-600 leading-relaxed text-lg">${desc}</p>
        </div>`;
        }
    // --- PRODOTTI ---
    else if (type === 'product') {
        const p = JSON.parse(decodeURIComponent(payload));
        const esc = window.escapeHtml || (s => s);
        const nome = esc(window.dbCol(p, 'Prodotti') || window.dbCol(p, 'Nome'));
        const nomeIT = window.valIT(p, 'Prodotti') || window.valIT(p, 'Nome');
        const desc = esc(window.dbCol(p, 'Descrizione'));
        const ideale = esc(window.dbCol(p, 'Ideale per')); 
        const fotoKey = p.Prodotti_foto || nomeIT;
        const bigImg = window.getSmartUrl(fotoKey, '', 600);

        contentHtml = `
            <div class="relative h-72 w-full bg-slate-200">
                <img src="${bigImg}" loading="lazy" class="w-full h-full object-cover" onerror="this.parentElement.classList.add('flex','items-center','justify-center'); this.style.display='none'; this.parentElement.innerHTML+='<span class=\'material-icons text-5xl text-slate-400\'>lunch_dining</span>'">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent pointer-events-none"></div>
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
        const esc = window.escapeHtml || (s => s);
        const nome = esc(window.dbCol(item, 'Nome'));
        const tipoLabel = window.t('wine_red');
        const produttore = esc(window.dbCol(item, 'Produttore'));
        const uve = esc(window.dbCol(item, 'Uve'));
        const gradi = esc(window.dbCol(item, 'Gradi'));
        const abbinamenti = esc(window.dbCol(item, 'Abbinamenti'));
        const desc = esc(window.dbCol(item, 'Descrizione'));
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
                    <span class="material-icons text-7xl ${colorText} drop-shadow-sm">wine_bar</span>
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
                            <div class="text-[11px] uppercase font-bold text-slate-400 mb-1">${window.t('wine_deg')}</div>
                            <div class="font-bold text-slate-700 text-lg">${gradi || '--'}</div>
                        </div>
                        <div class="bg-ct-sand p-3 rounded-xl text-center border border-slate-100 flex flex-col justify-center">
                            <div class="text-[11px] uppercase font-bold text-slate-400 mb-1">${window.t('wine_grapes')}</div>
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
                    <div class="text-[11px] uppercase font-bold text-slate-400 mt-1">${window.t('distance')}</div>
                </div>
                <div class="bg-ct-sand p-3 rounded-2xl text-center border border-slate-100">
                    <span class="material-icons text-primary mb-1">schedule</span>
                    <div class="font-extrabold text-slate-700 text-lg leading-none">${dura}</div>
                    <div class="text-[11px] uppercase font-bold text-slate-400 mt-1">${window.t('duration')}</div>
                </div>
                <div class="bg-ct-sand p-3 rounded-2xl text-center border border-slate-100">
                    <span class="material-icons text-primary mb-1">terrain</span>
                    <div class="font-extrabold text-slate-600 text-sm pt-1 leading-none uppercase">${diff}</div>
                    <div class="text-[11px] uppercase font-bold text-slate-400 mt-2">${window.t('level')}</div>
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

  else if (type === 'sentieroInfo') {
    let item = {};
    try { item = JSON.parse(decodeURIComponent(payload)); } catch(e) {}
    const esc = window.escapeHtml || (s => s);

    const nome = esc(window.dbCol(item, 'Nome') || item.Nome || item.Titolo || 'Dettagli Sentiero');
   const desc = window.dbCol(item, 'Descrizione') || window.dbCol(item, 'descrizione') || window.t('desc_missing');

    const dist = item.distanza_km ? item.distanza_km + ' km' : (item.Distanza || '--');
    const dur  = item.durata_minuti ? item.durata_minuti + ' min' : (item.Durata || '--');
    const diff = item.Tag || item.Difficolta || 'Medio';

    let diffColor = 'text-yellow-600 bg-yellow-50 border-yellow-100';
    if (diff.toLowerCase().includes('facile') || diff.toLowerCase().includes('turistic'))
        diffColor = 'text-green-600 bg-green-50 border-green-100';
    if (diff.toLowerCase().includes('esperto') || diff.toLowerCase().includes('difficile'))
        diffColor = 'text-red-600 bg-red-50 border-red-100';

    contentHtml = `
        <div class="relative w-full bg-white min-h-[400px]">

            <div class="bg-gradient-to-br from-ct-green to-[#4a5d2b] p-8 pb-12 relative overflow-hidden">
                <div class="absolute -right-6 -top-6 opacity-20 transform rotate-12">
                    <span class="material-icons text-[150px] text-white">hiking</span>
                </div>
                <div class="relative z-10">
                    <span class="inline-block py-1 px-3 rounded-lg bg-white/20 backdrop-blur border border-white/30 text-white text-[11px] font-bold uppercase tracking-widest mb-3">
                        ${window.t('trail_outdoor_badge')}
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
                        <span class="text-[11px] font-bold text-slate-400 uppercase mt-1">${window.t('trail_duration_label')}</span>
                    </div>
                    <div class="flex flex-col items-center justify-center text-center px-1">
                        <span class="material-icons text-ct-green text-xl mb-1">straighten</span>
                        <span class="text-sm font-extrabold text-slate-700 leading-none">${dist}</span>
                        <span class="text-[11px] font-bold text-slate-400 uppercase mt-1">${window.t('trail_length_label')}</span>
                    </div>
                    <div class="flex flex-col items-center justify-center text-center px-1">
                        <span class="material-icons text-ct-green text-xl mb-1">signal_cellular_alt</span>
                        <span class="text-sm font-extrabold text-slate-700 leading-none truncate w-full">${diff.slice(0,8)}</span>
                        <span class="text-[11px] font-bold text-slate-400 uppercase mt-1">${window.t('trail_level_label')}</span>
                    </div>
                </div>
            </div>

            <div class="p-6 pt-8">

                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
                    ${window.t('trail_desc_label')}
                </h3>
                <div class="prose prose-slate prose-p:text-slate-600 prose-p:text-lg prose-p:leading-relaxed text-justify">
                    ${desc}
                </div>

                <!-- Sezione Regole -->
                <div class="mt-8 pt-6 border-t border-slate-100">
                    <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">
                        ${window.t('trail_rules_title')}
                    </h3>
                    <p class="text-slate-500 text-sm mb-4">${window.t('trail_rules_intro')}</p>
                    <ul class="space-y-4">
                        <li class="flex flex-col gap-1">
                            <strong class="text-slate-700 text-sm">${window.t('trail_rule_shoes_label')}</strong>
                            <span class="text-slate-500 text-sm leading-relaxed">${window.t('trail_rule_shoes_text')}</span>
                        </li>
                        <li class="flex flex-col gap-1">
                            <strong class="text-slate-700 text-sm">${window.t('trail_rule_weather_label')}</strong>
                            <span class="text-slate-500 text-sm leading-relaxed">${window.t('trail_rule_weather_text')}</span>
                        </li>
                        <li class="flex flex-col gap-1">
                            <strong class="text-slate-700 text-sm">${window.t('trail_rule_water_label')}</strong>
                            <span class="text-slate-500 text-sm leading-relaxed">${window.t('trail_rule_water_text')}</span>
                        </li>
                    </ul>
                </div>

                <!-- Sezione Fonti -->
                <div class="mt-6 pt-6 border-t border-slate-100">
                    <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">
                        ${window.t('trail_sources_title')}
                    </h3>
                    <p class="text-slate-500 text-sm mb-3">${window.t('trail_sources_intro')}</p>
                    <div class="flex flex-col gap-2">
                        <a href="http://www.parconazionale5terre.it/sentieri-outdoor.php"
                           target="_blank" rel="noopener"
                           class="inline-flex items-center gap-2 text-ct-green font-bold text-sm underline underline-offset-2 active:opacity-70">
                            <span class="material-icons text-base">open_in_new</span>
                            ${window.t('trail_source1_label')}
                        </a>
                        <a href="https://www.cailaspezia.it/"
                           target="_blank" rel="noopener"
                           class="inline-flex items-center gap-2 text-ct-green font-bold text-sm underline underline-offset-2 active:opacity-70">
                            <span class="material-icons text-base">open_in_new</span>
                            ${window.t('trail_source2_label')}
                        </a>
                    </div>
                </div>

                <div class="mt-8 pt-6 border-t border-dashed border-slate-200 text-center">
                    <p class="text-[11px] text-slate-400 italic">
                        ${window.t('trail_footer_hint')}
                    </p>
                </div>
            </div>
        </div>
    `;
    return { html: contentHtml, class: 'bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative max-h-[85vh] overflow-y-auto' };
}

    // --- SPIAGGE ---
    else if (type === 'Spiagge') {
        let beachItem = {};
        try { beachItem = JSON.parse(decodeURIComponent(payload)); } catch(e) { if(item) beachItem = item; }
        if (!beachItem || Object.keys(beachItem).length === 0) { return { html: `<div class="p-8 text-center text-slate-500">Dati non trovati</div>`, class: '' }; }

        const esc = window.escapeHtml || (s => s);
        const nome = esc(window.dbCol(beachItem, 'Nome') || 'Spiaggia');
        const nomeIT = window.valIT(beachItem, 'Nome') || nome;
        const tipo = esc(window.dbCol(beachItem, 'Tipo'));
        const paesi = esc(window.dbCol(beachItem, 'Paesi'));
        const desc = esc(window.dbCol(beachItem, 'Descrizione'));
        const imgUrl = window.getSmartUrl(nomeIT, '', 600);
        
        contentHtml = `
            <div class="relative h-72 w-full bg-slate-200">
                <img src="${imgUrl}" loading="lazy" class="w-full h-full object-cover" onerror="this.parentElement.classList.add('flex','items-center','justify-center'); this.style.display='none'; this.parentElement.innerHTML+='<span class=\'material-icons text-5xl text-slate-400\'>beach_access</span>'">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent pointer-events-none"></div>
                <div class="absolute bottom-0 left-0 p-6 w-full">
                    <h2 class="text-3xl font-serif font-bold text-white mb-2 leading-tight shadow-black drop-shadow-md">${nome}</h2>
                    ${tipo ? `<span class="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full mr-2">🌊 ${tipo}</span>` : ''}
                    ${paesi ? `<span class="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full">📍 ${paesi}</span>` : ''}
                </div>
            </div>
            <div class="p-6">
                <p class="text-slate-600 leading-relaxed text-lg">${desc || window.t('desc_missing')}</p>
            </div>
        `;
    }

    // --- ATTRAZIONI ---
    else if (type === 'Attrazioni' || type === 'attrazione') {
        if (!item) { return { html: '', class: '' }; }
        const esc = window.escapeHtml || (s => s);
        const titolo = esc(window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo'));
        const titoloIT = window.valIT(item, 'Attrazioni') || window.valIT(item, 'Titolo'); 
        const curiosita = esc(window.dbCol(item, 'Curiosita'));
        const desc = esc(window.dbCol(item, 'Descrizione'));
        const img = window.getSmartUrl(titoloIT, '', 600); 

        contentHtml = `
            ${img ? 
            `<div class="h-64 w-full relative bg-slate-200"><img src="${img}" loading="lazy" class="w-full h-full object-cover" onerror="this.parentElement.classList.add('flex','items-center','justify-center'); this.style.display='none'; this.parentElement.innerHTML+='<span class=\'material-icons text-5xl text-slate-400\'>attractions</span>'"><div class="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent pointer-events-none"></div></div>` : 
            `<div class="py-8 bg-slate-100 flex justify-center border-b border-slate-200"><span class="material-icons text-6xl text-slate-400">attractions</span></div>`}

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

    // ── Shared image URLs ──
    const trainImgUrl  = window.getSmartUrl('Treno', '', 600);
    const busImgUrl    = `https://res.cloudinary.com/dkg0jfady/image/upload/w_600,c_fill,g_north,f_auto,q_auto:eco,dpr_1.0,fl_progressive/Bus`;
    const ferryImgUrl  = window.getSmartUrl('Battello', '', 600);

    // ═══════════════════════
    // A. TRENO
    // ═══════════════════════
    if (transportId === 'train') {
        contentHtml = `
        <div class="relative bg-white">

            <!-- Hero image -->
            <div class="relative h-52 w-full overflow-hidden">
                <img src="${trainImgUrl}" class="w-full h-full object-cover" onerror="this.parentElement.style.background='#E76F51'">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent"></div>
                <div class="absolute bottom-0 left-0 p-5 w-full">
                    <span class="text-[10px] font-black uppercase tracking-widest text-white/70 block mb-1">Cinque Terre Express</span>
                    <h2 class="font-serif text-3xl font-bold text-white leading-none drop-shadow-md">${window.t('label_train')}</h2>
                </div>
            </div>

            <!-- Content -->
            <div class="p-5 space-y-4">

                <!-- Tempi medi card -->
                <div class="bg-ct-sand rounded-2xl p-4 border border-slate-100">
                    <h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <span class="material-icons text-sm text-ct-terracotta">timer</span> ${window.t('avg_times')}
                    </h4>
                    <div class="space-y-2.5">
                        <div class="flex justify-between items-center">
                            <span class="text-slate-600 text-sm font-medium">La Spezia ↔ Riomaggiore</span>
                            <span class="text-ct-terracotta font-bold text-sm bg-white px-3 py-0.5 rounded-xl border border-orange-100 shadow-sm">7 min</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-600 text-sm font-medium">${window.t('between_villages')}</span>
                            <span class="text-ct-terracotta font-bold text-sm bg-white px-3 py-0.5 rounded-xl border border-orange-100 shadow-sm">2–4 min</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-600 text-sm font-medium">Monterosso ↔ Levanto</span>
                            <span class="text-ct-terracotta font-bold text-sm bg-white px-3 py-0.5 rounded-xl border border-orange-100 shadow-sm">5 min</span>
                        </div>
                    </div>
                </div>

                <!-- Descrizione -->
                <p class="text-slate-500 text-sm leading-relaxed">${window.t('train_desc')}</p>

                <!-- CTA -->
                <button onclick="window.apriTrenitalia()"
                    class="w-full py-4 rounded-2xl bg-ct-terracotta text-white font-bold text-base shadow-md active:scale-[0.98] transition-all touch-manipulation flex items-center justify-center gap-2">
                    <span>${window.t('train_cta')}</span>
                    <span class="material-icons text-sm">open_in_new</span>
                </button>
                <p class="text-center text-[11px] text-slate-400 font-bold uppercase tracking-wide pb-4">${window.t('check_site')}</p>
            </div>
        </div>`;
        return { html: contentHtml, class: 'bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto' };
    }

    // ═══════════════════════
    // B. BUS & BATTELLO
    // ═══════════════════════
    else {
        const isBus = transportId === 'bus';

        const cfg = isBus ? {
            img:            busImgUrl,
            accentBg:       'bg-ct-yellow',
            accentFrom:     'from-amber-500',
            accentTo:       'to-ct-yellow',
            markerColor:    'bg-amber-500',
            gradientOverlay:'from-amber-900/80 via-amber-900/30',
            icon:           'directions_bus',
            label:          'ATC · Navette',
            btnFunction:    'eseguiRicercaBus()',
            changeFn:       'window.handleBusSelectionChange',
            mapToggle:      true,
            resultsId:      'busResultsContainer',
            nextCardId:     'nextBusCard',
            otherListId:    'otherBusList',
            nextCardGrad:   'from-ct-yellow to-orange-400',
        } : {
            img:            ferryImgUrl,
            accentBg:       'bg-ct-blue',
            accentFrom:     'from-teal-700',
            accentTo:       'to-ct-blue',
            markerColor:    'bg-cyan-500',
            gradientOverlay:'from-teal-900/80 via-teal-900/30',
            icon:           'directions_boat',
            label:          'Navigazione',
            btnFunction:    'eseguiRicercaTraghetto()',
            changeFn:       'window.handleFerrySelectionChange',
            mapToggle:      false,
            resultsId:      'ferryResultsContainer',
            nextCardId:     'nextFerryCard',
            otherListId:    'otherFerryList',
            nextCardGrad:   'from-ct-blue to-teal-600',
        };

        const idPartenza = isBus ? 'selPartenza'      : 'selPartenzaFerry';
        const idArrivo   = isBus ? 'selArrivo'        : 'selArrivoFerry';
        const idData     = isBus ? 'selData'           : 'selDataFerry';
        const idOra      = isBus ? 'selOra'            : 'selOraFerry';
        const todayISO   = new Date().toISOString().split('T')[0];
        const nowTime    = new Date().getHours().toString().padStart(2,'0') + ':' + new Date().getMinutes().toString().padStart(2,'0');

        contentHtml = `
        <div class="relative bg-white">

            <!-- ── Hero image with gradient ── -->
            <div class="relative h-48 w-full overflow-hidden">
                <img src="${cfg.img}" class="w-full h-full object-cover" onerror="this.parentElement.style.background='#2A9D8F'">
                <div class="absolute inset-0 bg-gradient-to-t ${cfg.gradientOverlay} to-transparent"></div>
                <div class="absolute bottom-0 left-0 p-5 w-full">
                    <span class="text-[10px] font-black uppercase tracking-widest text-white/70 block mb-1">${cfg.label}</span>
                    <h2 class="font-serif text-3xl font-bold text-white leading-none drop-shadow-md">${isBus ? window.t('label_bus') : window.t('label_ferry')}</h2>
                </div>
            </div>

            <!-- ── Search form card ── -->
            <div class="mx-4 -mt-5 relative z-10 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-4">

                <!-- Route selector -->
                <div class="p-4 pb-3 relative">
                    <!-- Vertical connector line -->
                    <div class="absolute left-7 top-[2.1rem] bottom-[2.6rem] w-px border-l-2 border-dashed border-slate-200 pointer-events-none"></div>

                    <!-- Partenza -->
                    <div class="flex items-start gap-3 mb-4">
                        <div class="w-3 h-3 rounded-full border-[3px] border-slate-300 bg-white shadow-sm mt-[0.85rem] shrink-0 z-10"></div>
                        <div class="flex-1 min-w-0">
                            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">${window.t('departure')}</label>
                            <select id="${idPartenza}"
                                class="w-full appearance-none bg-transparent text-base font-bold text-slate-800 focus:outline-none cursor-pointer truncate py-0.5"
                                onchange="${cfg.changeFn}('partenza')">
                                <option value="" selected>${window.t('select_start')}</option>
                            </select>
                        </div>
                        ${isBus ? `<button onclick="toggleBusMap()" id="btn-bus-map-toggle"
                            class="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl active:scale-90 transition-all touch-manipulation mt-0.5 relative overflow-hidden shadow-sm"
                            style="background:linear-gradient(135deg,#F59E0B,#E9C46A); border:1.5px solid rgba(255,255,255,0.6);"
                            title="${window.t('show_map')}">
                            <span class="absolute inset-0" style="background:radial-gradient(circle at 28% 28%, rgba(255,255,255,0.45), transparent 55%);"></span>
                            <span style="font-size:17px; line-height:1; position:relative; z-index:10; filter:drop-shadow(0 1px 2px rgba(0,0,0,0.15));">🚏</span>
                        </button>` : ''}
                    </div>

                    <!-- Arrivo -->
                    <div class="flex items-start gap-3">
                        <div class="w-3 h-3 rounded-sm ${cfg.markerColor} shadow-sm mt-[0.85rem] shrink-0 z-10"></div>
                        <div class="flex-1 min-w-0">
                            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">${window.t('arrival')}</label>
                            <select id="${idArrivo}"
                                class="w-full appearance-none bg-transparent text-base font-bold text-slate-800 focus:outline-none cursor-pointer truncate py-0.5"
                                onchange="${cfg.changeFn}('arrivo')">
                                <option value="" selected>${window.t('select_placeholder')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Date + Time row -->
                <div class="bg-slate-50 border-t border-slate-100 p-3 flex gap-2">
                    <div class="flex-1 bg-white rounded-xl border border-slate-200 px-3 py-2.5 flex items-center gap-2">
                        <span class="material-icons text-slate-300 text-sm">event</span>
                        <input type="date" id="${idData}"
                            class="bg-transparent text-sm font-bold text-slate-700 w-full focus:outline-none cursor-pointer"
                            value="${todayISO}">
                    </div>
                    <div class="flex-1 bg-white rounded-xl border border-slate-200 px-3 py-2.5 flex items-center gap-2">
                        <span class="material-icons text-slate-300 text-sm">schedule</span>
                        <input type="time" id="${idOra}"
                            class="bg-transparent text-sm font-bold text-slate-700 w-full focus:outline-none cursor-pointer"
                            value="${nowTime}">
                    </div>
                </div>
            </div>

            <!-- ── Mappa bus (hidden by default) ── -->
            ${isBus ? `
            <div id="bus-map-wrapper" class="hidden mx-4 mb-4 rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100 relative h-56 z-0">
                <div class="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 shadow-sm z-[400] pointer-events-none border border-slate-200 whitespace-nowrap">
                    ${window.t('map_hint')}
                </div>
                <div id="bus-map" class="h-full w-full"></div>
            </div>` : ''}

            <!-- ── Search CTA ── -->
            <div class="px-4 pb-4 space-y-3">
                <button onclick="${cfg.btnFunction}"
                    class="w-full py-4 rounded-2xl ${cfg.accentBg} text-white font-bold text-base shadow-md active:scale-[0.98] transition-all touch-manipulation flex items-center justify-center gap-2">
                    <span class="material-icons">search</span>
                    <span class="uppercase tracking-wide">${window.t('find_times')}</span>
                </button>

                <div class="text-center">
                    <button onclick="toggleTicketInfo()"
                        class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 py-2 px-4 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors touch-manipulation">
                        <span class="material-icons text-sm">confirmation_number</span> ${window.t('how_to_ticket')}
                    </button>
                    <div id="ticket-info-box" class="hidden mt-2 p-4 bg-slate-50 rounded-xl text-xs text-slate-500 border border-slate-100 text-center leading-relaxed">
                        <p>${window.t('ticket_info_text')}</p>
                    </div>
                </div>
            </div>

            <!-- ── Results area ── -->
            <div id="${cfg.resultsId}" class="hidden px-4 pb-10 pt-2 border-t border-slate-100 bg-white">
                <div id="${cfg.nextCardId}"
                    class="bg-gradient-to-br ${cfg.nextCardGrad} text-white p-6 rounded-2xl shadow-md mb-6 relative overflow-hidden">
                </div>
                <div class="flex items-center gap-2 mb-3">
                    <div class="h-px bg-slate-100 flex-1"></div>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-slate-300">${window.t('next_runs')}</span>
                    <div class="h-px bg-slate-100 flex-1"></div>
                </div>
                <div id="${cfg.otherListId}" class="space-y-3"></div>
            </div>
        </div>`;

        setTimeout(() => {
            if (isBus && window.loadAllStops)       window.loadAllStops();
            else if (!isBus && window.initFerrySearch) window.initFerrySearch();
        }, 100);

        return { html: contentHtml, class: 'bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto' };
    }

    // --- FARMACIA ---    // --- FARMACIA ---
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

    // --- LUOGO MAPPA ---
    else if (type === 'luogo_mappa') {
        const item = JSON.parse(decodeURIComponent(payload));

        const cfg     = {
            vino:       { emoji:'🍷', label:'Vino',       color:'#C0392B', bg:'#FFF0EE' },
            aperitivo:  { emoji:'🥂', label:'Aperitivo',  color:'#D97706', bg:'#FFFBEB' },
            spiaggia:   { emoji:'🏖️', label:'Spiaggia',   color:'#0369A1', bg:'#EFF6FF' },
            attrazione: { emoji:'🏛️', label:'Attrazioni', color:'#15803D', bg:'#ECFDF5' },
        };
        const catCfg  = cfg[item.categoria] || cfg.attrazione;
        const borgCol = {
            Riomaggiore:'#E76F51', Manarola:'#2A9D8F',
            Corniglia:'#C9A600',   Vernazza:'#264653', Monterosso:'#606C38'
        }[item.borgo] || '#264653';

        const hasPhoto = !!item.foto;

        contentHtml = `
            <!-- HERO immagine o fallback colorato -->
            ${hasPhoto
                ? `<div class="h-60 w-full relative bg-slate-200">
                       <img src="${item.foto}" loading="lazy"
                            class="w-full h-full object-cover"
                            onerror="this.style.display='none'">
                       <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
                       <!-- Overlay info sul hero -->
                       <div class="absolute bottom-0 left-0 p-5 w-full">
                           <div class="flex flex-wrap gap-1.5 mb-2">
                               <span class="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                   style="color:white; background:${borgCol}99; border:1px solid ${borgCol}60;">
                                   📍 ${item.borgo}
                               </span>
                               <span class="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full"
                                   style="background:${catCfg.bg}cc; color:${catCfg.color}; border:1px solid ${catCfg.color}40;">
                                   ${catCfg.emoji} ${catCfg.label}
                               </span>
                           </div>
                           <h2 class="font-serif text-2xl font-bold text-white leading-tight drop-shadow-lg">${item.nome}</h2>
                       </div>
                   </div>`
                : `<div class="h-36 w-full flex items-center justify-center relative overflow-hidden"
                        style="background:linear-gradient(135deg, ${catCfg.bg}, white);">
                       <span class="text-7xl opacity-20 absolute -right-2 -bottom-2 rotate-12">${catCfg.emoji}</span>
                       <div class="relative z-10 text-center px-6">
                           <div class="text-4xl mb-1">${catCfg.emoji}</div>
                           <div class="flex flex-wrap justify-center gap-1.5 mb-2">
                               <span class="text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                   style="color:${borgCol}; background:${borgCol}18; border:1px solid ${borgCol}30;">
                                   📍 ${item.borgo}
                               </span>
                           </div>
                           <h2 class="font-serif text-xl font-bold text-slate-800 leading-tight">${item.nome}</h2>
                       </div>
                   </div>`}

            <!-- CORPO -->
            <div class="p-5 ${hasPhoto ? '' : 'pt-4'}">

                <!-- Badge categoria (solo se no-photo, altrimenti è già nell'hero) -->
                ${!hasPhoto ? `
                <div class="flex items-center gap-2 mb-4">
                    <span class="text-[11px] font-bold uppercase px-3 py-1 rounded-full border"
                        style="background:${catCfg.bg}; color:${catCfg.color}; border-color:${catCfg.color}30;">
                        ${catCfg.emoji} ${catCfg.label}
                    </span>
                    ${item.prezzo ? `<span class="ml-auto text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">${item.prezzo}</span>` : ''}
                </div>` : `
                ${item.prezzo ? `<div class="flex justify-end mb-3">
                    <span class="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">${item.prezzo}</span>
                </div>` : ''}`}

                <!-- Descrizione -->
                ${item.descrizione ? `
                <p class="text-slate-600 text-sm leading-relaxed mb-4">${item.descrizione}</p>` : ''}

                <!-- Info grid: indirizzo / orari / telefono -->
                ${(item.indirizzo || item.orari || item.telefono) ? `
                <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4 flex flex-col gap-3">
                    ${item.indirizzo ? `
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 border border-slate-100">
                            <span class="material-icons text-slate-400 text-sm">place</span>
                        </div>
                        <div>
                            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Indirizzo</div>
                            <div class="text-sm font-medium text-slate-700">${item.indirizzo}</div>
                        </div>
                    </div>` : ''}
                    ${item.orari ? `
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 border border-slate-100">
                            <span class="material-icons text-slate-400 text-sm">schedule</span>
                        </div>
                        <div>
                            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Orari</div>
                            <div class="text-sm font-medium text-slate-700">${item.orari}</div>
                        </div>
                    </div>` : ''}
                    ${item.telefono ? `
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 border border-slate-100">
                            <span class="material-icons text-slate-400 text-sm">call</span>
                        </div>
                        <div>
                            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Telefono</div>
                            <a href="tel:${item.telefono}"
                                class="text-sm font-bold text-ct-blue active:opacity-70">${item.telefono}</a>
                        </div>
                    </div>` : ''}
                </div>` : ''}

                <!-- Tag -->
                ${item.tag ? `
                <div class="flex flex-wrap gap-1.5 mb-4">
                    ${item.tag.split(',').map(t => `
                    <span class="text-[11px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200">
                        ${t.trim()}
                    </span>`).join('')}
                </div>` : ''}

                <!-- Azioni: Google Maps -->
                ${item.link_maps ? `
                <a href="${item.link_maps}" target="_blank" rel="noopener"
                    class="flex items-center justify-center gap-2 w-full py-3.5 bg-ct-blue text-white font-bold rounded-2xl shadow-md active:scale-95 transition-transform text-sm">
                    <span class="material-icons text-lg">directions</span>
                    Indicazioni stradali
                </a>` : ''}

            </div>`;

        return { html: contentHtml, class: 'bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative max-h-[88vh] overflow-y-auto' };
    }

    return { html: contentHtml, class: modalClass };
};

// LISTA FERMATE TRAGHETTI
// Ridefinita qui per sovrascrivere la definizione di data-logic.js (caricato prima),
// garantendo che ui-modal-contents sia la fonte autoritativa per questa lista.
window.FERRY_STOPS = [
    { id: 'levanto',      label: 'Levanto' },
    { id: 'monterosso',  label: 'Monterosso' },
    { id: 'vernazza',    label: 'Vernazza' },
    { id: 'corniglia',   label: 'Corniglia' },
    { id: 'manarola',    label: 'Manarola' },
    { id: 'riomaggiore', label: 'Riomaggiore' },
    { id: 'portovenere', label: 'Portovenere' },
    { id: 'la spezia',   label: 'La Spezia' },
    { id: 'lerici',      label: 'Lerici' }
];

window.initFerrySearch = function() {
    const selPart = document.getElementById('selPartenzaFerry');
    const selArr  = document.getElementById('selArrivoFerry');
    if (!selPart || !selArr) return;

    const stops = window.FERRY_STOPS || [];

    // Popola partenza con tutte le fermate
    selPart.innerHTML = `<option value="" disabled selected>${window.t('select_start')}</option>` +
        stops.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
    selPart.disabled = false;

    // Popola arrivo vuoto (verrà filtrato da handleFerrySelectionChange via onchange)
    selArr.innerHTML = `<option value="" disabled selected>${window.t('select_placeholder')}</option>`;
    selArr.disabled = false;
    // NOTA: NON aggiungiamo addEventListener qui — il <select> ha già onchange="handleFerrySelectionChange"
    // per evitare il doppio firing.
};