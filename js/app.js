const content = document.getElementById('app-content');
window.pendingMaps = []; 

// --- VARIABILI GLOBALI PER LO SWIPE ---
window.currentMenuOptions = []; // Salva l'elenco delle tab correnti (es. Prodotti, Vini...)
window.currentActiveTable = null; // Salva la tabella attualmente visibile
window.touchStartX = 0;
window.touchStartY = 0;

// --- 1. SETUP HEADER ---
function setupHeaderElements() {
    const header = document.querySelector('header');
    if (header) header.innerHTML = ''; 
    updateLangIconInNavBar(); 
}

function updateNavBar() {
    const labels = document.querySelectorAll('.nav-label');
    if (labels.length >= 4) {
        labels[0].innerText = window.t('nav_villages'); 
        labels[1].innerText = window.t('nav_food');
        labels[2].innerText = window.t('nav_outdoor');
        labels[3].innerText = window.t('nav_services'); 
    }
}

function updateLangIconInNavBar() {
    const flagEl = document.getElementById('nav-lang-flag');
    if (flagEl) {
        const currFlag = window.AVAILABLE_LANGS.find(l => l.code === window.currentLang)?.flag || '🌍';
        flagEl.textContent = currFlag;
    }
}

window.changeLanguage = function(langCode) {
    window.currentLang = langCode;
    localStorage.setItem('app_lang', langCode);
    
    updateNavBar(); 
    updateLangIconInNavBar();
    
    const activeNav = document.querySelector('.nav-item.active'); 
    if(activeNav) {
        const onclickAttr = activeNav.getAttribute('onclick');
        const viewMatch = onclickAttr.match(/switchView\('([^']+)'/);
        if(viewMatch) switchView(viewMatch[1], activeNav);
        else switchView('home'); 
    } else {
        switchView('home');
    }
};

// --- SWITCH VIEW ---
window.switchView = async function(view, el) {
    // Riferimento al contenitore scrollabile
    const content = document.getElementById('app-content');
    if (!content) return;

    // --- FIX SCROLL: Resetta lo scroll in alto ---
    content.scrollTop = 0; 
    // ---------------------------------------------

    window.currentViewName = view; 
    
    const centerBtnWrapper = document.getElementById('center-lang-btn-wrapper');
    const body = document.body;

    // Rimuoviamo SEMPRE la mascotte quando cambiamo vista (per sicurezza)
    // La re-inseriremo solo se siamo in 'home'
    const mascot = document.getElementById('mascot-container');
    if (mascot) mascot.remove();

    if (view === 'home') {
        body.style.backgroundColor = '#1a1a1a'; 
        body.classList.add('is-home'); 
        if (centerBtnWrapper) centerBtnWrapper.classList.remove('hidden-bump');
    } else {
        body.style.backgroundColor = '#F4F1DE'; 
        body.classList.remove('is-home');
        if (centerBtnWrapper) centerBtnWrapper.classList.add('hidden-bump');
    }
    
    const stickyFilters = document.querySelectorAll('.smart-filter-bar-container');
    stickyFilters.forEach(el => el.remove());

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (el) {
        el.classList.add('active'); 
    } else if (view === 'home') {
         const homeBtn = document.querySelector('.nav-item[onclick*="home"]');
         if(homeBtn) homeBtn.classList.add('active');
    }

    try {
        if (view === 'home') {
            renderHome();
            const overlay = document.getElementById('splash-overlay');
            if (overlay && !overlay.classList.contains('fade-out')) {
                requestAnimationFrame(() => {
                    overlay.classList.add('fade-out');
                    setTimeout(() => overlay.classList.add('gone'), 600);
                });
            }
        }
        else if (view === 'cibo') {
            renderSubMenu([
                { label: window.t('menu_prod'), table: "Prodotti", icon: "lunch_dining", color: "orange" },
                { label: window.t('menu_wine'), table: "Vini", icon: "wine_bar", color: "red" },
                { label: window.t('menu_rest'), table: "Ristoranti", icon: "restaurant", color: "yellow" } 
            ], 'Prodotti');
        } else if (view === 'outdoor') {
            renderSubMenu([
                { label: window.t('menu_monu'), table: "Attrazioni", icon: "attractions", color: "blue" },
                { label: window.t('menu_beach'), table: "Spiagge", icon: "beach_access", color: "blue" },
                { label: window.t('menu_trail'), table: "Sentieri", icon: "hiking", color: "green" }
            ], 'Attrazioni');
        }
        else if (view === 'mappa') await window.renderMappaInterattiva();
        else if (view === 'servizi') await renderServicesGrid();
        else if (view === 'mappe_monumenti') renderSubMenu([{ label: window.t('menu_map'), table: "Mappe" }], 'Mappe');
    } catch (err) {
        console.error(err);
        content.innerHTML = `<div class="p-6 text-center text-red-500 bg-red-50 rounded-3xl border border-red-200 shadow-sm mx-4 mt-10">${window.t('error')}: ${err.message}</div>`;
    }
};

// 1. RENDER HOME
function renderHome() {
    const bgImage = "https://res.cloudinary.com/dkg0jfady/image/upload/v1770756918/Manarola.png";
    document.body.classList.add('is-home');

    // Renderizza il contenuto principale della Home
    content.innerHTML = `
    <div class="fixed inset-0 z-0 overflow-hidden">
        <img src="${bgImage}" class="w-full h-full object-cover animate-fade" alt="Cinque Terre" style="animation-duration: 2s;">
        <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90"></div>
    </div>

    <!-- Overlay scuro dietro i risultati (chiude al tap) -->
    <div id="search-backdrop"
        class="hidden fixed inset-0 z-[45] bg-black/40"
        onclick="window._closeSearch()"></div>

    <div class="relative z-[46] flex flex-col items-center justify-end pb-24 px-6 text-center animate-pop" style="height:85vh;height:85dvh;">
        <h1 class="text-5xl font-serif font-bold text-white mb-2 drop-shadow-xl tracking-tight">Five2Go</h1>
        <p class="text-white/80 text-sm font-medium mb-6 max-w-xs mx-auto leading-relaxed drop-shadow-md">La tua guida essenziale per vivere la magia delle Cinque Terre.</p>

        <!-- ── SEARCH — input only; results sheet vive nel body (z-index indipendente) ── -->
        <div class="w-full max-w-sm mb-5">
            <div class="relative" id="global-search-anchor">
                <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-white/70 text-lg pointer-events-none">search</span>
                <input id="global-search-input"
                    type="search"
                    autocomplete="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="${window.t('search_placeholder') || 'Cerca ristoranti, vini, spiagge...'}"
                    class="w-full bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl pl-11 pr-12 py-3 text-sm font-semibold text-white placeholder-white/55 outline-none focus:bg-white/25 focus:border-white/60 focus:placeholder-white/70 transition-all"
                    onfocus="window._searchPrefetch(); window._positionResultsSheet();"
                    oninput="window._searchDebounced(this.value)">
                <button id="search-clear-btn"
                    class="hidden absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 bg-transparent flex items-center justify-center active:scale-90 transition-transform touch-manipulation"
                    onclick="window._closeSearch()">
                    <span class="material-icons text-white text-sm leading-none">close</span>
                </button>
            </div>
        </div>

        <div id="home-below-search" class="w-full max-w-sm transition-all duration-200">
            <div class="mb-4">
                <button class="w-full bg-ct-terracotta text-white rounded-2xl py-4 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group" onclick="switchView('mappa')">
                    <span class="text-sm font-bold uppercase tracking-widest">${window.t('btn_discover')}</span>
                    <span class="material-icons group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
            </div>

            <div class="grid grid-cols-3 gap-3">
                ${window.AVAILABLE_LANGS.map(l => {
                    const isActive = l.code === window.currentLang;
                    const activeClass = isActive 
                        ? "bg-white text-slate-800 border-white shadow-xl scale-105 z-10 ring-2 ring-white/50" 
                        : "bg-white/10 text-white border-white/20 hover:border-white/50 active:bg-white/20";
                    
                    return `
                    <button class="${activeClass} backdrop-blur-md border rounded-2xl py-3 flex flex-col items-center justify-center transition-all active:scale-95" onclick="changeLanguage('${l.code}')">
                        <span class="text-2xl mb-1 drop-shadow-md">${l.flag}</span>
                        <span class="text-[11px] font-bold uppercase tracking-widest opacity-80">${l.label}</span>
                    </button>
                    `;
                }).join('')}
            </div>
        </div>
    </div>`;

    // --- LOGICA MASCOTTE FIXATA ---
    // Rimuoviamo eventuali duplicati
    const oldMascot = document.getElementById('mascot-container');
    if (oldMascot) oldMascot.remove();

    const chiccoStaticUrl = "https://res.cloudinary.com/dkg0jfady/image/upload/v1770579869/chicco_wxxwbm.png";
    const chiccoLottieUrl = "https://res.cloudinary.com/dkg0jfady/raw/upload/v1770754341/chicco.json"; 

    const mascotHTML = `
    <div id="mascot-container" class="fixed bottom-[90px] right-4 z-[60] flex flex-col items-end pointer-events-none transition-all duration-300">
        
        <div id="chicco-bubble" class="hidden animate-fade bg-white p-4 rounded-t-2xl rounded-bl-2xl shadow-xl mb-2 max-w-[200px] text-sm text-slate-700 border-2 border-ct-terracotta pointer-events-auto">
            <span id="chicco-text">Ciao!</span>
        </div>
        
        <div onclick="window.toggleChicco()" class="cursor-pointer transition-transform active:scale-90 pointer-events-auto relative w-[22vw] max-w-[110px] min-w-[75px] aspect-square">
            <img id="chicco-static" src="${chiccoStaticUrl}" class="w-full h-full object-contain drop-shadow-lg absolute bottom-0 right-0 hover:scale-105 transition-transform" alt="Chicco">
            <lottie-player id="chicco-anim" src="${chiccoLottieUrl}" background="transparent" speed="1" class="w-[120%] h-[120%] hidden absolute -bottom-2 -right-2" loop></lottie-player>
        </div>
    </div>`;

    // FIX IMPORTANTE: Inseriamo Chicco nel BODY, non nel content.
    // Questo lo rende indipendente dallo scroll di #app-content.
    document.body.insertAdjacentHTML('beforeend', mascotHTML);

    if (!document.querySelector('script[src*="lottie-player"]')) {
        const script = document.createElement('script');
        script.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
        document.head.appendChild(script);
    }
    
    if (!localStorage.getItem('chicco_intro_done')) {
        window.chiccoAutoOpenTimer = setTimeout(() => {
            const isChatOpen = document.getElementById('chicco-bubble');
            if (isChatOpen && isChatOpen.style.display !== 'block') {
                window.toggleChicco();
                localStorage.setItem('chicco_intro_done', 'true');
            }
        }, 5000);
    }
}

// 1. Modifica renderSubMenu per salvare le opzioni
window.renderSubMenu = function(options, defaultTable) {
    // 1. Salva le opzioni per la logica dello swipe
    window.currentMenuOptions = options;
    
   let menuHtml = `
    <div class="nav-sticky-header sticky top-0 z-30 bg-ct-sand/95 backdrop-blur-md py-4 shadow-sm mb-4 border-b border-stone-200/50 transition-all">
        <div class="nav-scroll-container flex gap-3 overflow-x-auto no-scrollbar items-center px-4 pt-2 pb-2 w-full" id="nav-tabs-container">
            ${options.map((opt, index) => {
                const colorMap = {
                    'orange': 'bg-white text-ct-terracotta border-orange-100 active:border-ct-terracotta shadow-sm',
                    'yellow': 'bg-white text-yellow-700 border-yellow-100 active:border-ct-yellow shadow-sm',
                    'red':    'bg-white text-red-800 border-red-100 active:border-red-400 shadow-sm',
                    'blue':   'bg-white text-ct-blue border-teal-100 active:border-ct-blue shadow-sm',
                    'green':  'bg-white text-ct-green border-green-100 active:border-ct-green shadow-sm'
                };
                const theme = colorMap[opt.color] || colorMap['blue'];
                const icon = opt.icon || 'star';

                return `
                <button class="btn-pop-menu flex-shrink-0 px-4 py-2.5 rounded-2xl flex items-center gap-2 border transition-all duration-300 transform ${theme}" 
                    data-table="${opt.table}"
                    data-index="${index}"
                    onclick="loadTableData('${opt.table}', this)">
                    <span class="material-icons text-lg opacity-80">${icon}</span>
                    <span class="text-xs font-bold uppercase tracking-wide">${opt.label}</span>
                </button>
            `}).join('')}
        </div>
    </div>
    
    <div id="sub-content" class="min-h-[300px] touch-pan-y transition-opacity duration-200 ease-out"></div>`;
    
    const content = document.getElementById('app-content');
    content.innerHTML = menuHtml;
    
    // Trova e attiva il bottone di default
    const defaultBtn = content.querySelector(`button[data-table="${defaultTable}"]`) || content.querySelector('.btn-pop-menu');
    if (defaultBtn) {
        loadTableData(defaultBtn.getAttribute('data-table'), defaultBtn);
    }
};

// 2. Modifica loadTableData per aggiornare lo stato attivo e scrollare il menu
window.loadTableData = async function(tableName, btnEl) {
    // --- FIX SCROLL: Resetta lo scroll del contenitore principale ---
    const mainContainer = document.getElementById('app-content');
    if (mainContainer) mainContainer.scrollTop = 0;
    // ----------------------------------------------------------------

    window.currentActiveTable = tableName;
    const subContent = document.getElementById('sub-content');
    if (!subContent) return;
    // 2. GESTIONE VISIVA DEI BOTTONI (Cruciale per lo swipe)
    // Se la funzione è chiamata dallo swipe, btnEl è null, quindi lo cerchiamo noi.
    if (!btnEl) {
        btnEl = document.querySelector(`button[data-table="${tableName}"]`);
    }

    // Reset stile di tutti i bottoni
    document.querySelectorAll('.btn-pop-menu').forEach(b => {
        b.classList.remove('ring-2', 'ring-offset-1', 'ring-stone-300', 'scale-105', 'shadow-md');
        b.style.opacity = '0.7'; // Leggermente trasparente se inattivo
    });

    // Attiva stile bottone corrente
    if (btnEl) {
        btnEl.classList.add('ring-2', 'ring-offset-1', 'ring-stone-300', 'scale-105', 'shadow-md');
        btnEl.style.opacity = '1';
        
        // --- AUTO-SCROLL: Porta il bottone attivo al centro dello schermo ---
        btnEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    // 3. EFFETTO FADE OUT/IN PER IL CONTENUTO
    subContent.style.opacity = '0.5'; // Fade out rapido
    setTimeout(() => { subContent.style.opacity = '1'; }, 200);

    // 4. LOGICA DI CARICAMENTO DATI (Invariata)
    if (!window.appCache[tableName]) {
        subContent.innerHTML = `<div class="py-20 flex flex-col items-center justify-center gap-4">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-ct-terracotta"></div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">${window.t('loading')}</p>
        </div>`;
    }
    
    if (tableName === 'Mappe') {
        subContent.innerHTML = `<div class="rounded-2xl overflow-hidden shadow-soft border-2 border-white animate-fade" style="height:70vh;height:70dvh;"><iframe src="https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1" width="100%" height="100%" style="border:0;"></iframe></div>`;
        return; 
    }

    let data;
    if (window.appCache[tableName]) {
        data = window.appCache[tableName];
    } else {
        const response = await window.supabaseClient.from(tableName).select('*');
        if (response.error) { 
            subContent.innerHTML = `<div class="p-6 text-center text-red-500 bg-red-50 rounded-3xl border border-red-100 font-bold">${response.error.message}</div>`; 
            return; 
        }
        data = response.data;
        window.appCache[tableName] = data; 
    }

    window.currentTableData = data; 

    // Rendering specifico per tipo
    if (tableName === 'Vini') { renderHorizontalFilterView(data, 'Tipo', subContent, window.vinoRenderer); }
    else if (tableName === 'Spiagge') { renderHorizontalFilterView(data, 'Paesi', subContent, window.spiaggiaRenderer); }
    else if (tableName === 'Prodotti') {
        let html = '<div class="grid grid-cols-2 gap-3 pb-24 animate-fade pt-2">'; 
        data.forEach(p => { html += window.prodottoRenderer(p); });
        subContent.innerHTML = html + '</div>';
    }
    else if (tableName === 'Attrazioni') { 
        const culturaConfig = { primary: { key: 'Paese', title: window.t('filter_village'), customOrder: ["Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso"] }, secondary: { key: 'Label', title: window.t('filter_cat') } };
        renderDoubleHorizontalFilterView(data, culturaConfig, subContent, window.attrazioniRenderer); 
    }
    else if (tableName === 'Ristoranti') { renderHorizontalFilterView(data, 'Paesi', subContent, window.ristoranteRenderer); }
    else if (tableName === 'Sentieri') { renderHorizontalFilterView(data, 'difficolta_cai', subContent, window.sentieroRenderer); }
    else if (tableName === 'Farmacie') { subContent.innerHTML = `<div class="flex flex-col gap-3 pb-24 animate-fade pt-2">` + data.map(i => window.farmacieRenderer(i)).join('') + `</div>`; } 
    else if (tableName === 'Numeri_utili') { renderHorizontalFilterView(data, 'Comune', subContent, window.numeriUtiliRenderer); }
};

// ... (Smart Filter Bars Logic - Invariato) ...
function getUniqueValues(allData, key, customOrder = []) {
    let raw = allData.map(item => window.dbCol(item, key)).filter(x => x).map(x => String(x).trim());
    let unique = [...new Set(raw)];
    if (customOrder && customOrder.length > 0) {
        unique.sort((a, b) => {
            const idxA = customOrder.indexOf(a);
            const idxB = customOrder.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });
    } else {
        unique.sort();
    }
    if (!unique.includes('__ALL__')) unique.unshift('__ALL__');
    return unique;
}

function renderHorizontalFilterView(allData, filterKey, container, cardRenderer) {
    const tags = getUniqueValues(allData, filterKey, ["Tutti", "Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso"]);
    const filterId = `filter-${Math.random().toString(36).substr(2, 9)}`;
    const triggerId = `trigger-${filterId}`;
    const panelId = `panel-${filterId}`;
    const labelAll = window.t('label_all');

    container.innerHTML = `
        <div class="smart-filter-bar-container sticky top-[85px] z-20 -mx-4 px-4 mb-4">
            <button id="${triggerId}" class="w-full bg-white/95 backdrop-blur shadow-sm border border-stone-200 rounded-xl py-3 px-4 flex items-center justify-between transition-all active:scale-95" onclick="toggleSmartFilter('${panelId}', '${triggerId}')">
                <div class="flex items-center gap-2">
                    <span class="material-icons text-ct-terracotta text-sm">tune</span>
                    <span id="filter-label-${filterId}" class="text-sm font-bold text-slate-700">${labelAll}</span>
                </div>
                <span class="material-icons text-slate-400 text-sm transition-transform duration-300" id="icon-${filterId}">expand_more</span>
            </button>
            <div id="${panelId}" class="hidden overflow-hidden transition-all duration-300 bg-ct-sand/95 backdrop-blur-md rounded-b-xl border-x border-b border-stone-200/50 shadow-md">
                <div class="p-3 overflow-x-auto no-scrollbar flex gap-2" id="chips-${filterId}"></div>
            </div>
        </div>
        <div id="dynamic-list" class="flex flex-col gap-3 pb-24 animate-fade min-h-[50vh]"></div>
    `;

    const chipContainer = container.querySelector(`#chips-${filterId}`);
    const listContainer = container.querySelector('#dynamic-list');
    const labelSpan = container.querySelector(`#filter-label-${filterId}`);
    let activeTag = '__ALL__';

    function renderChips() {
        chipContainer.innerHTML = tags.map(tag => {
            const isActive = tag === activeTag;
            const style = isActive ? "bg-ct-terracotta text-white border-transparent shadow-md" : "bg-white text-slate-600 border-stone-200";
            const displayTag = (tag === '__ALL__') ? labelAll : tag;
            return `<button class="flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 touch-manipulation ${style}" onclick="window.applySingleSmartFilter('${tag}', '${filterId}', true)">${displayTag}</button>`;
        }).join('');
    }

    window.applySingleSmartFilter = (tag, fId, fromClick = false) => {
        activeTag = tag;
        renderChips();
        labelSpan.innerText = (tag === '__ALL__') ? labelAll : tag;
        if (fromClick) toggleSmartFilter(panelId, triggerId);

        // 1. Cerca il Numero d'Emergenza
        const emergencyItems = allData.filter(item => {
             const nome = String(window.dbCol(item, 'Nome') || item.Nome || '').toLowerCase();
             return nome.includes('numero unico') || nome.includes('emergenza');
        });

        // 2. Cerca i Taxi
        const taxiItems = allData.filter(item => {
             const nome = String(window.dbCol(item, 'Nome') || item.Nome || '').toLowerCase();
             return nome.includes('taxi');
        });

        // 3. Escludi gli elementi "pinnati" dal resto dei dati per non duplicarli
        const pinnedSet = new Set([...emergencyItems, ...taxiItems]);
        const otherData = allData.filter(i => !pinnedSet.has(i));
        
        // 4. Applica il filtro al resto dei dati
        let filtered = tag === '__ALL__' ? otherData : otherData.filter(item => {
            let valDB = window.dbCol(item, filterKey);
            return valDB && String(valDB).trim().includes(tag);
        });
        
        // 5. Se siamo nella tab "Tutti", metti in cima Emergenza e poi Taxi
        if (tag === '__ALL__') {
            filtered = [...emergencyItems, ...taxiItems, ...filtered];
        }

        updateList(filtered);
    };

    // Aperitivo editorial strip — above the list, below the filter bar, only for Ristoranti
    const isRistorantiView = (filterKey === 'Paesi' && cardRenderer === window.ristoranteRenderer);
    const isVinoView       = (filterKey === 'Tipo'  && cardRenderer === window.vinoRenderer);
    const isSpiaggiaView   = (filterKey === 'Paesi' && cardRenderer === window.spiaggiaRenderer);

    if (isRistorantiView || isVinoView || isSpiaggiaView) {
        const isVino = isVinoView;
        const strip = document.createElement('div');
        strip.className = 'animate-fade';
        strip.style.cssText = 'margin-bottom:12px;';

        // Visual tokens per category
        const MAP_STRIP_CFG = {
            aperitivo:  { fn: '_openMapAperitivo',  bg: 'linear-gradient(100deg,#fffbeb,#fff7ed)',  border: 'rgba(217,119,6,0.2)',  shadow: 'rgba(217,119,6,0.08)',  iconBg: 'rgba(217,119,6,0.1)',  emoji: '🥂', labelColor: '#b45309', textColor: 'rgba(120,53,15,0.7)', arrowColor: '#F59E0B', labelKey: 'aperitivo_hint_label',  descKey: 'aperitivo_hint_desc'  },
            vino:       { fn: '_openMapVino',        bg: 'linear-gradient(100deg,#fff0ee,#fef2f2)',  border: 'rgba(192,57,43,0.2)',  shadow: 'rgba(192,57,43,0.08)',  iconBg: 'rgba(192,57,43,0.1)',  emoji: '🍷', labelColor: '#9b1c1c', textColor: 'rgba(127,29,29,0.7)', arrowColor: '#E74C3C', labelKey: 'vino_map_hint_label',   descKey: 'vino_map_hint_desc'   },
            spiaggia:   { fn: '_openMapSpiaggia',    bg: 'linear-gradient(100deg,#eff6ff,#f0f9ff)',  border: 'rgba(3,105,161,0.2)',   shadow: 'rgba(3,105,161,0.08)',   iconBg: 'rgba(3,105,161,0.1)',   emoji: '🏖️', labelColor: '#075985', textColor: 'rgba(7,89,133,0.7)',  arrowColor: '#38BDF8', labelKey: 'spiaggia_map_hint_label', descKey: 'spiaggia_map_hint_desc' },
            attrazione: { fn: '_openMapAttrazione',  bg: 'linear-gradient(100deg,#f0fdf4,#ecfdf5)',  border: 'rgba(21,128,61,0.2)',   shadow: 'rgba(21,128,61,0.08)',   iconBg: 'rgba(21,128,61,0.1)',   emoji: '🏛️', labelColor: '#166534', textColor: 'rgba(20,83,45,0.7)',  arrowColor: '#34D399', labelKey: 'attrazione_map_hint_label', descKey: 'attrazione_map_hint_desc' },
        };
        const cfg = isVino ? MAP_STRIP_CFG.vino : isSpiaggiaView ? MAP_STRIP_CFG.spiaggia : MAP_STRIP_CFG.aperitivo;

        strip.innerHTML = `
            <div onclick="window.${cfg.fn} && window.${cfg.fn}()"
                class="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer active:scale-[0.98] transition-all touch-manipulation"
                style="background:${cfg.bg}; border:1px solid ${cfg.border}; box-shadow:0 1px 4px ${cfg.shadow};">
                <div style="width:36px;height:36px;border-radius:10px;background:${cfg.iconBg};display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;">${cfg.emoji}</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.12em;color:${cfg.labelColor};line-height:1;margin-bottom:2px;">${window.t(cfg.labelKey) || cfg.labelFallback}</div>
                    <div style="font-size:12px;color:${cfg.textColor};font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${window.t(cfg.descKey) || cfg.descFallback}</div>
                </div>
                <span class="material-icons" style="color:${cfg.arrowColor};font-size:18px;flex-shrink:0;">chevron_right</span>
            </div>`;
        const dynList = container.querySelector('#dynamic-list');
        if (dynList) dynList.parentNode.insertBefore(strip, dynList);
    }

    function updateList(items) {
        if (!items || items.length === 0) { 
            listContainer.innerHTML = `<div class="py-12 text-center text-slate-400 font-medium italic">${window.t('no_results')}</div>`; 
        } else {
            if (filterKey === 'Prodotti') listContainer.className = "grid grid-cols-2 gap-3 pb-24 animate-fade";
            listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');
            setTimeout(() => { if(window.initPendingMaps) window.initPendingMaps(); }, 100);
        }
    }
    renderChips();
    window.applySingleSmartFilter('__ALL__', filterId); 
}

function renderDoubleHorizontalFilterView(allData, filtersConfig, container, cardRenderer) {
    const values1 = getUniqueValues(allData, filtersConfig.primary.key, filtersConfig.primary.customOrder);
    const values2 = getUniqueValues(allData, filtersConfig.secondary.key);
    
    const filterId = `filter-dbl-${Math.random().toString(36).substr(2, 9)}`;
    const triggerId = `trigger-${filterId}`;
    const panelId = `panel-${filterId}`;
    const labelAll = window.t('label_all');
    const labelAllFem = window.t('label_all_fem');
    const btnClose = window.t('btn_close_show');

    container.innerHTML = `
        <div class="smart-filter-bar-container sticky top-[85px] z-20 -mx-4 px-4 mb-4">
            <button id="${triggerId}" class="w-full bg-white/95 backdrop-blur shadow-sm border border-stone-200 rounded-xl py-3 px-4 flex items-center justify-between transition-all active:scale-95" onclick="toggleSmartFilter('${panelId}', '${triggerId}')">
                <div class="flex items-center gap-2 overflow-hidden">
                    <span class="material-icons text-ct-blue text-sm">tune</span>
                    <span id="filter-label-${filterId}" class="text-sm font-bold text-slate-700 truncate">${labelAll} • ${labelAllFem}</span>
                </div>
                <span class="material-icons text-slate-400 text-sm transition-transform duration-300" id="icon-${filterId}">expand_more</span>
            </button>
            <div id="${panelId}" class="hidden overflow-hidden transition-all duration-300 bg-ct-sand/95 backdrop-blur-md rounded-b-xl border-x border-b border-stone-200/50 shadow-md">
                <div class="p-3 space-y-3">
                    <div>
                        <div class="text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">${window.t('filter_village')}</div>
                        <div class="overflow-x-auto no-scrollbar flex gap-2" id="row1-${filterId}"></div>
                    </div>
                    <div>
                        <div class="text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">${window.t('filter_cat')}</div>
                        <div class="overflow-x-auto no-scrollbar flex gap-2" id="row2-${filterId}"></div>
                    </div>
                    <button class="w-full py-2 bg-ct-blue text-white rounded-lg text-xs font-bold uppercase mt-2 shadow-md active:scale-95 transition-transform" onclick="toggleSmartFilter('${panelId}', '${triggerId}')">${btnClose}</button>
                </div>
            </div>
        </div>
        <div id="dynamic-list" class="flex flex-col gap-3 pb-24 animate-fade min-h-[50vh]"></div>
    `;

    // Attrazioni strip — same pattern as other views
    if (cardRenderer === window.attrazioniRenderer) {
        const MAP_STRIP_ATTRAZ = {
            fn: '_openMapAttrazione', bg: 'linear-gradient(100deg,#f0fdf4,#ecfdf5)',
            border: 'rgba(21,128,61,0.2)', shadow: 'rgba(21,128,61,0.08)', iconBg: 'rgba(21,128,61,0.1)',
            emoji: '🏛️', labelColor: '#166534', textColor: 'rgba(20,83,45,0.7)', arrowColor: '#34D399',
            labelKey: 'attrazione_map_hint_label', descKey: 'attrazione_map_hint_desc'
        };
        const strip = document.createElement('div');
        strip.className = 'animate-fade';
        strip.style.cssText = 'margin-bottom:12px;';
        strip.innerHTML = `
            <div onclick="window.${MAP_STRIP_ATTRAZ.fn} && window.${MAP_STRIP_ATTRAZ.fn}()"
                class="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer active:scale-[0.98] transition-all touch-manipulation"
                style="background:${MAP_STRIP_ATTRAZ.bg}; border:1px solid ${MAP_STRIP_ATTRAZ.border}; box-shadow:0 1px 4px ${MAP_STRIP_ATTRAZ.shadow};">
                <div style="width:36px;height:36px;border-radius:10px;background:${MAP_STRIP_ATTRAZ.iconBg};display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;">${MAP_STRIP_ATTRAZ.emoji}</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.12em;color:${MAP_STRIP_ATTRAZ.labelColor};line-height:1;margin-bottom:2px;">${window.t(MAP_STRIP_ATTRAZ.labelKey) || 'Sulla mappa'}</div>
                    <div style="font-size:12px;color:${MAP_STRIP_ATTRAZ.textColor};font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${window.t(MAP_STRIP_ATTRAZ.descKey) || 'Vedi le attrazioni sulla mappa'}</div>
                </div>
                <span class="material-icons" style="color:${MAP_STRIP_ATTRAZ.arrowColor};font-size:18px;flex-shrink:0;">chevron_right</span>
            </div>`;
        const dynList = container.querySelector('#dynamic-list');
        if (dynList) dynList.parentNode.insertBefore(strip, dynList);
    }

    const c1 = container.querySelector(`#row1-${filterId}`);
    const c2 = container.querySelector(`#row2-${filterId}`);
    const listContainer = container.querySelector('#dynamic-list');
    const labelSpan = container.querySelector(`#filter-label-${filterId}`);

    let activeVal1 = '__ALL__';
    let activeVal2 = '__ALL__';

    window.applyDoubleSmartFilter = (level, val, fId) => {
        if (level === 1) activeVal1 = val;
        if (level === 2) activeVal2 = val;
        renderControls();
        const txt1 = activeVal1 === '__ALL__' ? labelAll : activeVal1;
        const txt2 = activeVal2 === '__ALL__' ? labelAllFem : activeVal2;
        labelSpan.innerText = `${txt1} • ${txt2}`;
        executeFilter();
    };

    function renderControls() {
        c1.innerHTML = values1.map(v => {
            const isActive = v === activeVal1;
            const style = isActive ? "bg-ct-terracotta text-white shadow-md border-transparent" : "bg-white text-slate-600 border-stone-200";
            const displayV1 = (v === '__ALL__') ? labelAll : v;
            return `<button class="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 touch-manipulation ${style}" onclick="window.applyDoubleSmartFilter(1, '${v}', '${filterId}')">${displayV1}</button>`;
        }).join('');

        c2.innerHTML = values2.map(v => {
            const isActive = v === activeVal2;
            const style = isActive ? "bg-ct-blue text-white shadow-md border-transparent" : "bg-white text-slate-600 border-stone-200";
            const displayV2 = (v === '__ALL__') ? labelAllFem : v;
            return `<button class="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 touch-manipulation ${style}" onclick="window.applyDoubleSmartFilter(2, '${v}', '${filterId}')">${displayV2}</button>`;
        }).join('');
    }

    function executeFilter() {
        const filtered = allData.filter(item => {
            const val1 = window.dbCol(item, filtersConfig.primary.key) || '';
            const val2 = window.dbCol(item, filtersConfig.secondary.key) || '';
            const match1 = (activeVal1 === '__ALL__') || val1.includes(activeVal1);
            const match2 = (activeVal2 === '__ALL__') || val2.toLowerCase().includes(activeVal2.toLowerCase());
            return match1 && match2;
        });
        if (filtered.length === 0) {
            listContainer.innerHTML = `<div class="py-12 text-center text-slate-400 font-medium italic">${window.t('no_results')}</div>`;
        } else {
            listContainer.innerHTML = filtered.map(item => cardRenderer(item)).join('');
        }
    }
    renderControls();
    executeFilter(); 
}

window.toggleSmartFilter = function(panelId, triggerId) {
    const panel = document.getElementById(panelId);
    const icon = document.querySelector(`#${triggerId} .material-icons:last-child`);
    
    if (!panel) return;
    
    const isHidden = panel.classList.contains('hidden');
    
    if (isHidden) {
        panel.classList.remove('hidden');
        if(icon) icon.style.transform = 'rotate(180deg)';
    } else {
        panel.classList.add('hidden');
        if(icon) icon.style.transform = 'rotate(0deg)';
    }
};

window.renderServicesGrid = async function() {
    const targetEl = document.getElementById('app-content');
    
    const stickyFilters = document.querySelectorAll('.smart-filter-bar-container');
    stickyFilters.forEach(el => el.remove());

    if (!targetEl) return;

    let headerHtml = `
        <div class="px-2 mb-4 animate-pop text-center">
            <h1 class="text-3xl font-serif font-bold text-slate-800 mb-1 uppercase tracking-tight">${window.t('nav_services')}</h1>
            <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Esplora & Viaggia</p>
        </div>
    `;

    const busImg    = `https://res.cloudinary.com/dkg0jfady/image/upload/w_600,c_fill,g_north,f_auto,q_auto:eco,dpr_1.0,fl_progressive/Bus`;
    const trainImg  = window.getSmartUrl('Treno', '', 600);
    const ferryImg  = window.getSmartUrl('Battello', '', 600);

    let gridHtml = `
    <div class="flex flex-col gap-3 pb-32 animate-pop">

        <!-- ── BUS: hero full-width, most prominent (most-used transit) ── -->
        <div class="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-150 touch-manipulation shadow-soft" style="height:190px" onclick="openModal('transport', 'bus')">
            <img src="${busImg}" class="absolute inset-0 w-full h-full object-cover scale-[1.02]" onerror="this.style.display='none'">
            <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div class="absolute inset-0 p-5 flex flex-col justify-between z-10">
                <div class="flex items-center justify-between">
                    <span class="bg-ct-yellow/90 backdrop-blur text-yellow-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">ATC · Navette</span>
                    <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                        <span class="material-icons text-xl text-white">directions_bus</span>
                    </div>
                </div>
                <div>
                    <h3 class="font-serif text-2xl font-bold text-white leading-none drop-shadow-md">${window.t('label_bus')}</h3>
                    <p class="text-white/70 text-xs font-bold uppercase tracking-wider mt-1">Orari & Connessioni tra borghi</p>
                </div>
            </div>
        </div>

        <!-- ── TRENO + BATTELLO: due card di pari peso ── -->
        <div class="grid grid-cols-2 gap-3">

            <div class="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-all duration-150 touch-manipulation shadow-soft" style="height:170px" onclick="openModal('transport', 'train')">
                <img src="${trainImg}" class="absolute inset-0 w-full h-full object-cover" onerror="this.style.display='none'">
                <div class="absolute inset-0 bg-gradient-to-t from-ct-terracotta/95 via-ct-terracotta/50 to-ct-terracotta/10"></div>
                <div class="absolute inset-0 p-4 flex flex-col justify-between z-10">
                    <div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                        <span class="material-icons text-lg text-white">train</span>
                    </div>
                    <div>
                        <h3 class="font-serif text-lg font-bold text-white leading-tight drop-shadow-md">${window.t('label_train')}</h3>
                        <p class="text-red-100/80 text-[10px] font-bold uppercase tracking-wider mt-0.5">Trenitalia</p>
                    </div>
                </div>
            </div>

            <div class="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-all duration-150 touch-manipulation shadow-soft" style="height:170px" onclick="openModal('transport', 'ferry')">
                <img src="${ferryImg}" class="absolute inset-0 w-full h-full object-cover" onerror="this.style.display='none'">
                <div class="absolute inset-0 bg-gradient-to-t from-ct-blue/95 via-ct-blue/50 to-ct-blue/10"></div>
                <div class="absolute inset-0 p-4 flex flex-col justify-between z-10">
                    <div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                        <span class="material-icons text-lg text-white">directions_boat</span>
                    </div>
                    <div>
                        <h3 class="font-serif text-lg font-bold text-white leading-tight drop-shadow-md">${window.t('label_ferry')}</h3>
                        <p class="text-teal-100/80 text-[10px] font-bold uppercase tracking-wider mt-0.5">Navigazione</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── UTILITY ROWS ── -->
        <div class="bg-white rounded-2xl shadow-soft border border-slate-100/70 flex items-center gap-4 p-4 cursor-pointer active:scale-[0.98] transition-all duration-150 touch-manipulation" onclick="renderSimpleList('Numeri_utili')">
            <div class="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                <span class="material-icons text-xl text-white">phonelink_ring</span>
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="font-serif font-bold text-slate-800 text-base leading-tight">${window.t('menu_num')}</h3>
                <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Emergenze & Numeri utili</p>
            </div>
            <span class="material-icons text-slate-300 text-xl">chevron_right</span>
        </div>

        <div class="bg-white rounded-2xl shadow-soft border border-slate-100/70 flex items-center gap-4 p-4 cursor-pointer active:scale-[0.98] transition-all duration-150 touch-manipulation" onclick="renderSimpleList('Farmacie')">
            <div class="w-12 h-12 rounded-xl bg-ct-green flex items-center justify-center shrink-0 shadow-sm">
                <span class="material-icons text-xl text-white">medical_services</span>
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="font-serif font-bold text-slate-800 text-base leading-tight">${window.t('menu_pharm')}</h3>
                <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Turni & Orari</p>
            </div>
            <span class="material-icons text-slate-300 text-xl">chevron_right</span>
        </div>

        <div class="text-center pt-1">
            <button onclick="renderLegalPage()" class="text-slate-400 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto py-2 px-4 rounded-xl bg-white shadow-sm border border-slate-200 active:scale-95 touch-manipulation">
                <span class="material-icons text-sm">policy</span> ${window.t('menu_legal')}
            </button>
        </div>
    </div>`;

    targetEl.innerHTML = headerHtml + gridHtml;
};
window.renderSimpleList = function(tableName) {
    const targetEl = document.getElementById('app-content');
    const cleanTitle = tableName.replace('_', ' ');
    
    targetEl.innerHTML = `
    <div class="flex items-center gap-4 mb-6 animate-fade pt-2">
        <button onclick="renderServicesGrid()" class="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-[0_4px_0_rgb(203,213,225)] border-2 border-slate-200 active:scale-95 active:shadow-none active:translate-y-1 transition-all">
            <span class="material-icons text-slate-700">arrow_back</span>
        </button>
        <h2 class="text-3xl font-serif font-bold text-slate-800 capitalize">${cleanTitle}</h2>
    </div>
    
    <div id="sub-content" class="min-h-[300px]">
        <div class="py-10 text-center text-slate-400">Caricamento...</div>
    </div>`;
    
    window.loadTableData(tableName, null);
};

window.toggleTicketInfo = function() {
    const box = document.getElementById('ticket-info-box');
    if (box) { box.classList.toggle('hidden'); }
};
// --- INIZIALIZZAZIONE DELL'APP ---

// ===========================================================================
// GLOBAL SEARCH
// ===========================================================================

// Tabelle e metadati di ricerca
// Sezione virtuale bus: keyword trigger senza tabella DB
const _BUS_VIRTUAL = [
    { _virtual: true, id: 'bus', Nome: 'Orari Bus', Alias: 'bus orari autobus ctbus', Sottotitolo: 'Cerca connessioni tra borghi' },
];
const _FERRY_VIRTUAL = [
    { _virtual: true, id: 'ferry', Nome: 'Orari Traghetti', Alias: 'traghetto ferry orari nave battello', Sottotitolo: 'Collegamento via mare' },
];

const _SEARCH_SECTIONS = [
    {
        table:      'Ristoranti',
        view:       'cibo',
        label:      'Ristoranti',
        icon:       'restaurant',
        color:      '#E76F51',
        bg:         '#FFEDE1',
        getId:      item => item.id,
        getName:    item => window.dbCol(item, 'Nome') || 'Ristorante',
        getSub:     item => window.dbCol(item, 'Paesi') || '',
        openModal:  item => { const s = encodeURIComponent(JSON.stringify(item)).replace(/'/g,'%27'); openModal('ristorante', s); },
    },
    {
        table:      'Attrazioni',
        view:       'outdoor',
        label:      'Attrazioni',
        icon:       'attractions',
        color:      '#2A9D8F',
        bg:         '#E0F7FA',
        getId:      item => item.POI_ID || item.id,
        getName:    item => window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo') || 'Attrazione',
        getSub:     item => window.dbCol(item, 'Paese') || '',
        openModal:  item => openModal('attrazione', item.POI_ID || item.id),
    },
    {
        table:      'Spiagge',
        view:       'outdoor',
        label:      'Spiagge',
        icon:       'beach_access',
        color:      '#0369A1',
        bg:         '#EFF6FF',
        getId:      item => item.id,
        getName:    item => window.dbCol(item, 'Spiagge') || window.dbCol(item, 'Nome') || 'Spiaggia',
        getSub:     item => window.dbCol(item, 'Paesi') || '',
        openModal:  item => { const s = encodeURIComponent(JSON.stringify(item)).replace(/'/g,'%27'); openModal('Spiagge', s); },
    },
    {
        table:      'Prodotti',
        view:       'cibo',
        label:      'Prodotti',
        icon:       'lunch_dining',
        color:      '#C2410C',
        bg:         '#FFF3E0',
        getId:      item => item.id,
        getName:    item => window.dbCol(item, 'Prodotti') || window.dbCol(item, 'Nome') || 'Prodotto',
        getSub:     item => '',
        openModal:  item => { const s = encodeURIComponent(JSON.stringify(item)).replace(/'/g,'%27'); openModal('product', s); },
    },
    {
        table:      'Vini',
        view:       'cibo',
        label:      'Vini',
        icon:       'wine_bar',
        color:      '#9B2226',
        bg:         '#FFF0EE',
        getId:      item => item.id || item.ID,
        getName:    item => item.Nome || 'Vino',
        getSub:     item => item.Produttore || '',
        openModal:  item => openModal('Vini', item.id || item.ID),
    },
    {
        table:      'Farmacie',
        view:       'servizi',
        label:      'Farmacie',
        icon:       'local_pharmacy',
        color:      '#606C38',
        bg:         '#ECFCCB',
        getId:      item => item.id,
        getName:    item => _safeStr(item.Nome) || 'Farmacia',
        getSub:     item => _safeStr(item.Paesi) || item.Indirizzo || '',
        openModal:  item => renderSimpleList('Farmacie'),
    },
    {
        table:      'Numeri_utili',
        view:       'servizi',
        label:      'Numeri Utili',
        icon:       'phonelink_ring',
        color:      '#264653',
        bg:         '#F1F5F9',
        getId:      item => item.id,
        getName:    item => _safeStr(item.Nome) || 'Numero Utile',
        getSub:     item => item.Numero || '',
        openModal:  item => renderSimpleList('Numeri_utili'),
    },
    // ── Sezioni virtuali (no fetch, keyword-based) ──
    {
        table:      '_bus',
        view:       'servizi',
        virtual:    true,
        data:       _BUS_VIRTUAL,
        label:      'Trasporti',
        icon:       'directions_bus',
        color:      '#B45309',
        bg:         '#FFFBEB',
        getId:      item => item.id,
        getName:    item => item.Nome,
        getSub:     item => item.Sottotitolo,
        openModal:  item => openModal('transport', 'bus'),
    },
    {
        table:      '_ferry',
        view:       'servizi',
        virtual:    true,
        data:       _FERRY_VIRTUAL,
        label:      'Traghetti',
        icon:       'directions_boat',
        color:      '#0369A1',
        bg:         '#EFF6FF',
        getId:      item => item.id,
        getName:    item => item.Nome,
        getSub:     item => item.Sottotitolo,
        openModal:  item => openModal('transport', 'ferry'),
    },
];

// Helper: estrae stringa da campo possibilmente JSON/oggetto multilingua
function _safeStr(val) {
    if (!val) return '';
    if (typeof val === 'string') {
        if (val.startsWith('{')) {
            try { const p = JSON.parse(val); return p[window.currentLang] || p['it'] || ''; } catch(e) {}
        }
        return val;
    }
    if (typeof val === 'object') return val[window.currentLang] || val['it'] || '';
    return String(val);
}

// Cerca la query in tutti i valori stringa di un item (multilingua incluso)
function _searchInItem(item, q) {
    for (const val of Object.values(item)) {
        if (!val) continue;
        let s = '';
        if (typeof val === 'string')      s = val;
        else if (typeof val === 'object')  s = Object.values(val).filter(Boolean).join(' ');
        if (s.toLowerCase().includes(q)) return true;
    }
    return false;
}

// Results sheet vive nel body — z-index totalmente indipendente dall'hero
(function _injectSearchSheet() {
    if (document.getElementById('search-results-sheet')) return;
    const sheet = document.createElement('div');
    sheet.id = 'search-results-sheet';
    sheet.className = 'hidden';
    sheet.style.cssText = [
        'position:fixed',
        'z-index:9999',
        'background:white',
        'border-radius:1.5rem',
        'box-shadow:0 20px 60px rgba(0,0,0,0.18)',
        'border:1px solid #f1f5f9',
        'overflow:hidden',
        'max-height:58vh',
        'overflow-y:auto',
        'scrollbar-width:none',
    ].join(';');
    sheet.innerHTML = '<div id="search-results-content" style="padding:12px;"></div>';
    document.body.appendChild(sheet);
})();

// Posiziona il sheet sotto l'anchor dell'input, rispettando viewport
window._positionResultsSheet = function() {
    const anchor = document.getElementById('global-search-anchor');
    const sheet  = document.getElementById('search-results-sheet');
    if (!anchor || !sheet) return;
    const rect = anchor.getBoundingClientRect();
    const gap  = 8;
    sheet.style.top   = (rect.bottom + gap) + 'px';
    sheet.style.left  = rect.left + 'px';
    sheet.style.width = rect.width + 'px';
};

// Pre-fetch lazy: carica le tabelle non ancora in cache (skip sezioni virtuali)
window._searchPrefetched = false;
window._searchPrefetch = async function() {
    if (window._searchPrefetched) return;
    window._searchPrefetched = true;
    const toLoad = _SEARCH_SECTIONS
        .filter(s => !s.virtual && !window.appCache[s.table])
        .map(s => window.supabaseClient.from(s.table).select('*')
                      .then(({ data }) => { if (data) window.appCache[s.table] = data; }));
    if (toLoad.length) await Promise.all(toLoad);
};

// Debounce 280ms
let _searchTimer = null;
window._searchDebounced = function(val) {
    clearTimeout(_searchTimer);
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.classList.toggle('hidden', !val);
    if (!val || val.trim().length < 2) { _hideSearchResults(); return; }
    _searchTimer = setTimeout(() => window._runSearch(val.trim()), 280);
};

window._runSearch = function(query) {
    const q = query.toLowerCase();
    let totalHits = 0;
    const groups = [];

    for (const sec of _SEARCH_SECTIONS) {
        // Virtuals usano il proprio array fisso, le altre usano appCache
        const data = sec.virtual ? sec.data : (window.appCache[sec.table] || []);
        const hits = data.filter(item => _searchInItem(item, q)).slice(0, 6);
        if (hits.length) {
            groups.push({ sec, hits });
            totalHits += hits.length;
        }
    }

    _showSearchResults(query, groups, totalHits);
};

function _showSearchResults(query, groups, total) {
    const sheet    = document.getElementById('search-results-sheet');
    const content  = document.getElementById('search-results-content');
    const backdrop = document.getElementById('search-backdrop');
    if (!sheet || !content) return;

    if (total === 0) {
        content.innerHTML = `
        <div class="py-8 text-center">
            <span class="material-icons text-4xl text-slate-300 block mb-2">search_off</span>
            <p class="text-sm font-bold text-slate-400">Nessun risultato per "<em>${query}</em>"</p>
        </div>`;
    } else {
        let html = '';
        for (const { sec, hits } of groups) {
            // Salva hits per il callback onclick (prima del render)
            window['_searchHits_' + sec.table.replace(/[^a-z]/gi,'_')] = hits;
            const secIdx = _SEARCH_SECTIONS.indexOf(sec);

            html += `
            <div class="mb-2">
                <div class="flex items-center gap-2 px-2 py-1 mb-0.5">
                    <div class="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                        style="background:${sec.bg};">
                        <span class="material-icons text-xs" style="color:${sec.color}; font-size:13px;">${sec.icon}</span>
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest" style="color:${sec.color};">${sec.label}</span>
                    <span class="ml-auto text-[10px] font-bold text-slate-300">${hits.length}</span>
                </div>
                ${hits.map((item, i) => {
                    const name   = sec.getName(item);
                    const sub    = sec.getSub(item);
                    const re     = new RegExp('(' + query.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&') + ')', 'gi');
                    const nameHL = name.replace(re,'<mark class="bg-amber-200/70 rounded px-0.5">$1</mark>');
                    return `
                    <button class="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-2xl active:bg-slate-100 transition-colors group"
                        onclick="window._searchNavigateTo(${secIdx}, ${i})">
                        <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style="background:${sec.bg};">
                            <span class="material-icons text-sm" style="color:${sec.color};">${sec.icon}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-slate-800 truncate leading-snug">${nameHL}</p>
                            ${sub ? `<p class="text-[11px] text-slate-400 truncate leading-none mt-0.5">${sub}</p>` : ''}
                        </div>
                        <span class="material-icons text-slate-200 text-base flex-shrink-0">chevron_right</span>
                    </button>`;
                }).join('')}
            </div>`;
        }
        content.innerHTML = html;
    }

    window._searchSections = _SEARCH_SECTIONS;
    sheet.classList.remove('hidden');
    if (backdrop) backdrop.classList.remove('hidden');
}

function _hideSearchResults() {
    const sheet   = document.getElementById('search-results-sheet');
    const backdrop = document.getElementById('search-backdrop');
    if (sheet)   sheet.classList.add('hidden');
    if (backdrop) backdrop.classList.add('hidden');
}

window._closeSearch = function() {
    const input    = document.getElementById('global-search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    if (input)    { input.value = ''; input.blur(); }
    if (clearBtn) clearBtn.classList.add('hidden');
    _hideSearchResults();
};

// Evidenzia una card dopo la navigazione (flash ring + scroll)
// Flash con retry polling: riprova ogni 80ms finché la card appare nel DOM
window._flashCard = function(id, fallbackName, attempt) {
    attempt = attempt || 0;
    if (attempt > 20) return; // max 1.6s di attesa

    const card = id
        ? document.querySelector('[data-card-id="' + id + '"]')
        : null;

    // Fallback: cerca per testo se l'id non corrisponde
    const target = card || (fallbackName
        ? Array.from(document.querySelectorAll('[data-card-id]')).find(el =>
            el.textContent.toLowerCase().includes(fallbackName.toLowerCase()))
        : null);

    if (!target) {
        setTimeout(() => window._flashCard(id, fallbackName, attempt + 1), 80);
        return;
    }

    const appContent = document.getElementById('app-content');
    if (appContent) {
        const rect   = target.getBoundingClientRect();
        const mid    = rect.top + rect.height / 2;
        const viewH  = window.innerHeight;
        const offset = mid - viewH / 2;
        appContent.scrollBy({ top: offset, behavior: 'smooth' });
    } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    target.style.transition    = 'box-shadow 0.2s, outline 0.2s';
    target.style.outline       = '3px solid #E76F51';
    target.style.outlineOffset = '3px';
    target.style.boxShadow     = '0 0 0 8px rgba(231,111,81,0.15)';
    setTimeout(() => {
        target.style.outline   = '3px solid transparent';
        target.style.boxShadow = '';
        setTimeout(() => { target.style.outline = ''; }, 300);
    }, 2000);
};

// Naviga alla view corretta, carica la tabella, scrolla e apre il modal
window._searchNavigateTo = async function(secIdx, hitIdx) {
    const sec  = _SEARCH_SECTIONS[secIdx];
    const item = (window['_searchHits_' + sec.table.replace(/[^a-z]/gi,'_')] || [])[hitIdx];
    if (!sec || !item) return;

    window._closeSearch();

    const cardId       = sec.getId ? sec.getId(item) : item.id;
    const fallbackName = sec.getName ? sec.getName(item) : '';

    // ── Sezioni virtuali (bus/ferry) ──────────────────────────────────────
    if (sec.virtual) {
        const navBtn = document.querySelector('.nav-item[onclick*="servizi"]');
        await switchView('servizi', navBtn);
        setTimeout(() => sec.openModal(item), 350);
        return;
    }

    // ── Farmacie / Numeri Utili: naviga + evidenzia + apri lista ─────────
    if (sec.table === 'Farmacie' || sec.table === 'Numeri_utili') {
        const navBtn = document.querySelector('.nav-item[onclick*="servizi"]');
        await switchView('servizi', navBtn);
        // Carica la lista (renderSimpleList → loadTableData)
        await new Promise(r => setTimeout(r, 150));
        sec.openModal(item); // renderSimpleList
        // Flash dopo che renderSimpleList ha popola il DOM
        setTimeout(() => window._flashCard(cardId, fallbackName), 400);
        return;
    }

    // ── Sezioni con card + modal ──────────────────────────────────────────
    const viewName  = sec.view;
    const tableName = sec.table;

    // 1. Naviga alla view
    const navBtn = document.querySelector('.nav-item[onclick*="' + viewName + '"]');
    await switchView(viewName, navBtn);

    // 2. Attendi renderSubMenu, poi forza il tab corretto
    await new Promise(r => setTimeout(r, 120));
    const tabBtn = document.querySelector('button[data-table="' + tableName + '"]');
    if (tabBtn) await loadTableData(tableName, tabBtn);

    // 3. Flash con retry — non dipende da timeout fisso
    //    Parte subito, il polling interno aspetta che la card appaia
    window._flashCard(cardId, fallbackName);

    // 4. Apri il modal (300ms dopo il flash per dare respiro visivo)
    setTimeout(() => sec.openModal(item), 300);
};

// ─────────────────────────────────────────────
// LOADING FEEDBACK + NETWORK ERROR
// ─────────────────────────────────────────────
function setLoadingStep(msg) {
    const el = document.getElementById('loading-step');
    if (el) el.textContent = msg;
}

function showNetworkError() {
    const errorEl   = document.getElementById('loading-error');
    const barWrap   = document.getElementById('loading-bar-wrap');
    const stepEl    = document.getElementById('loading-step');
    if (errorEl)  errorEl.classList.remove('hidden');
    if (barWrap)  barWrap.style.display = 'none';
    if (stepEl)   stepEl.classList.add('hidden');
}

// navigator.onLine non è affidabile su Firefox (può restituire true anche offline).
// Facciamo un vero ping HTTP leggero per verificare la connettività reale.
async function checkRealConnectivity() {
    if (!navigator.onLine) return false;
    try {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 3000);
        // HEAD request all'endpoint Supabase: nessun payload, risponde in pochi ms
        await fetch('https://ydrpicezcwtfwdqpihsb.supabase.co/rest/v1/', {
            method: 'HEAD',
            signal: ctrl.signal
        });
        clearTimeout(timeout);
        return true;
    } catch {
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {

    // Network-error fallback: if app doesn't start within 8s, show error
    const netErrorTimer = setTimeout(() => {
        if (document.getElementById('loading-step')) {
            showNetworkError();
        }
    }, 8000);

    // Verifica connettività reale (più affidabile di navigator.onLine su Firefox)
    const isOnline = await checkRealConnectivity();
    if (!isOnline) {
        clearTimeout(netErrorTimer);
        showNetworkError();
        return;
    }

    window.addEventListener('offline', () => {
        if (document.getElementById('loading-step')) showNetworkError();
    });

    // Step messages while scripts initialise
    setLoadingStep('Connessione stabilita...');
    await new Promise(r => setTimeout(r, 300));
    setLoadingStep('Caricamento dati...');
    await new Promise(r => setTimeout(r, 300));
    setLoadingStep('Pronto!');
    await new Promise(r => setTimeout(r, 200));

    clearTimeout(netErrorTimer);

    window.currentViewName = 'home';
    if (typeof setupHeaderElements === 'function') setupHeaderElements();
    if (typeof updateNavBar === 'function') updateNavBar();
    switchView('home');
});

// 1. Inizio tocco
document.addEventListener('touchstart', (e) => {
    window.touchStartX = e.changedTouches[0].screenX;
    window.touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

// 2. Fine tocco (Logica Swipe)
document.addEventListener('touchend', (e) => {
    // Se non siamo in una vista con sottomenu, esci
    if (!document.getElementById('sub-content')) return;
    if (!window.currentMenuOptions || window.currentMenuOptions.length === 0) return;

    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;

    const xDiff = touchEndX - window.touchStartX;
    const yDiff = touchEndY - window.touchStartY;

    // --- FILTRI ANTIMOVIMENTO ACCIDENTALE ---
    
    // 1. Se lo scroll è verticale (più Y che X), ignoriamo. L'utente sta leggendo.
    if (Math.abs(yDiff) > Math.abs(xDiff)) return;

    // 2. Soglia minima: Lo swipe deve essere di almeno 60px per attivarsi
    if (Math.abs(xDiff) < 60) return;

    // --- CALCOLO NUOVA TAB ---
    
    // Trova l'indice della tabella attuale
    const currentIndex = window.currentMenuOptions.findIndex(o => o.table === window.currentActiveTable);
    if (currentIndex === -1) return;

    let nextIndex = -1;

    if (xDiff > 0) {
        // SWIPE VERSO DESTRA -> (Vado indietro: tab precedente)
        // Esempio: Da Vini torno a Prodotti
        if (currentIndex > 0) {
            nextIndex = currentIndex - 1;
        }
    } else {
        // SWIPE VERSO SINISTRA -> (Vado avanti: tab successiva)
        // Esempio: Da Prodotti vado a Vini
        if (currentIndex < window.currentMenuOptions.length - 1) {
            nextIndex = currentIndex + 1;
        }
    }

    // Se abbiamo trovato una nuova tab valida, carichiamola
    if (nextIndex !== -1) {
        const nextTab = window.currentMenuOptions[nextIndex];
        // Passiamo null come secondo argomento, così loadTableData trova il bottone da solo
        loadTableData(nextTab.table, null);
    }

}, { passive: true });

window.apriTrenitalia = function() {
    window.open('https://www.trenitalia.com', '_blank');
};

// MAPPE E GPS

window.initPendingMaps = function() {
    window.pendingMaps.forEach(item => {
        const container = document.getElementById(item.id);
        if (container && !container._leaflet_id) { 
            const map = L.map(item.id, { zoomControl: false, scrollWheelZoom: false, dragging: false, touchZoom: false, doubleClickZoom: false, boxZoom: false, tap: false, attributionControl: false, keyboard: false });
            map.dragging.disable(); map.touchZoom.disable(); map.doubleClickZoom.disable(); if (map.tap) map.tap.disable();
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(map);
            new L.GPX(item.gpx, { async: true, marker_options: { startIconUrl: null, endIconUrl: null, shadowUrl: null }, polyline_options: { color: '#D32F2F', opacity: 1, weight: 4 } }).on('loaded', function(e) {
                const gpxLayer = e.target;
                map.fitBounds(gpxLayer.getBounds(), { padding: [20, 20] }); 
                let layers = gpxLayer.getLayers(); let points = [];
                layers.forEach(layer => { if (layer instanceof L.Polyline) { const latlngs = layer.getLatLngs(); if (latlngs.length > 0) { if (Array.isArray(latlngs[0])) { latlngs.forEach(segment => points = points.concat(segment)); } else { points = points.concat(latlngs); } } } });
                if (points.length > 0) {
                    const startPoint = points[0]; const endPoint = points[points.length - 1];
                    const createLabelIcon = (text, color, isStart) => { return L.divIcon({ className: 'custom-map-label', html: `<div style="display:flex; flex-direction:column; align-items:center;"><div style="background:white; padding:2px 6px; border-radius:4px; border:1px solid #ccc; font-size:10px; font-weight:bold; color:#333; white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2); margin-bottom:2px;">${text}</div><div style="width:10px; height:10px; background:${color}; border:2px solid white; border-radius:50%; box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div></div>`, iconSize: [100, 40], iconAnchor: [50, 38] }); };
                    if (item.startLabel) { L.marker(startPoint, { icon: createLabelIcon(item.startLabel, '#27ae60', true), interactive: false }).addTo(map); }
                    if (item.endLabel) { L.marker(endPoint, { icon: createLabelIcon(item.endLabel, '#c0392b', false), interactive: false }).addTo(map); }
                }
            }).addTo(map);
        }
    });
    window.pendingMaps = [];
};

window.watchId = null; window.userMarker = null;

// ─────────────────────────────────────────────────────────────────
// GPS — MODAL BRANDED + PERMESSO NATIVO
//
// Flusso:
//   1. Qualsiasi funzione che ha bisogno della posizione chiama
//      window._requestGeoPermission(onGranted, onDenied)
//   2. Se il permesso non è ancora stato concesso → mostra modal
//      branded che spiega perché serve la posizione
//   3. Utente tocca "Consenti" nel modal branded → callback onGranted
//   4. SOLO ORA viene chiamato watchPosition → il browser mostra
//      il suo popup nativo (obbligatorio per sicurezza, non bypassabile)
//   5. Su Firefox/Chrome appare anche il banner nella toolbar
//
// Usato da: toggleGPS (mappa interattiva), mapToggleGPS (ui-map.js),
//           initBusMap (mappa bus)
// ─────────────────────────────────────────────────────────────────

/**
 * Punto di accesso unificato per la geolocalizzazione.
 * Gestisce il controllo del permesso e mostra il modal branded prima
 * di invocare qualsiasi chiamata nativa al browser.
 *
 * @param {Function} onGranted  - chiamata quando il permesso è/viene concesso
 * @param {Function} [onDenied] - chiamata opzionale se il permesso è negato
 */
window._requestGeoPermission = async function(onGranted, onDenied) {
    if (!navigator.geolocation) {
        _showGeoErrorModal("GPS non supportato", "Il tuo browser non supporta la geolocalizzazione. Prova ad aggiornarlo o usane uno diverso.");
        if (onDenied) onDenied();
        return;
    }

    let permState = 'prompt'; // default conservativo per browser senza Permissions API
    if (navigator.permissions) {
        try {
            const perm = await navigator.permissions.query({ name: 'geolocation' });
            permState = perm.state;
            perm.onchange = () => {
                if (perm.state === 'denied') {
                    _showGeoErrorModal("Posizione bloccata", "Hai negato l'accesso alla posizione. Per riabilitarla vai nelle impostazioni del browser.");
                }
            };
        } catch (e) { /* Permissions API non disponibile (es. Safari) — si mostra comunque il modal */ }
    }

    if (permState === 'denied') {
        _showGeoErrorModal("Posizione bloccata", "Hai già negato l'accesso alla posizione. Per riabilitarla vai nelle impostazioni del browser e cerca i permessi per questo sito.");
        if (onDenied) onDenied();
        return;
    }

    if (permState === 'granted') {
        // Permesso già concesso in precedenza: parte subito, nessun modal
        onGranted();
        return;
    }

    // permState === 'prompt': mostra il modal branded PRIMA del popup nativo
    _showGeoRequestModal(onGranted, onDenied);
};

window.toggleGPS = function() {
    const map = window.currentMap;
    const btn = document.getElementById('btn-gps');
    if (!map) return;

    // Stop tracking se già attivo
    if (window.watchId !== null) {
        navigator.geolocation.clearWatch(window.watchId);
        window.watchId = null;
        if (window.userMarker) { map.removeLayer(window.userMarker); window.userMarker = null; }
        btn.style.backgroundColor = '#29B6F6';
        btn.innerHTML = '<span class="material-icons">my_location</span> GPS';
        return;
    }

    window._requestGeoPermission(
        () => _startGeoWatch(btn, map),   // onGranted
        () => {                            // onDenied
            btn.innerHTML = '<span class="material-icons">my_location</span> GPS';
            btn.style.backgroundColor = '#29B6F6';
        }
    );
};

// Modal branded mostrato PRIMA del popup nativo del browser
function _showGeoRequestModal(onGranted, onDenied) {
    if (document.getElementById('geo-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'geo-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding-bottom:24px;';

    overlay.innerHTML = `
        <div id="geo-modal-card" style="
            background:#fff; border-radius:28px; padding:28px 24px 24px;
            max-width:400px; width:calc(100% - 32px);
            box-shadow:0 -4px 40px rgba(0,0,0,0.18);
            animation: geoModalIn 0.35s cubic-bezier(0.2,0.8,0.2,1) forwards;
        ">
            <style>
                @keyframes geoModalIn {
                    from { opacity:0; transform:translateY(40px); }
                    to   { opacity:1; transform:translateY(0); }
                }
            </style>

            <!-- Icona -->
            <div style="display:flex;justify-content:center;margin-bottom:20px;">
                <div style="
                    width:64px;height:64px;border-radius:20px;
                    background:linear-gradient(135deg,#E76F51,#c0392b);
                    display:flex;align-items:center;justify-content:center;
                    box-shadow:0 8px 20px rgba(231,111,81,0.35);
                ">
                    <span class="material-icons" style="color:white;font-size:32px;">my_location</span>
                </div>
            </div>

            <!-- Testo -->
            <h2 style="text-align:center;font-family:'Roboto Slab',serif;font-size:1.3rem;font-weight:700;color:#264653;margin:0 0 10px;">
                Dove sei?
            </h2>
            <p style="text-align:center;font-size:0.88rem;color:#64748b;line-height:1.6;margin:0 0 8px;">
                Per mostrarti la tua posizione sulla mappa e trovare le fermate più vicine, Five2Go ha bisogno di accedere alla tua posizione.
            </p>
            <p style="text-align:center;font-size:0.78rem;color:#94a3b8;line-height:1.5;margin:0 0 24px;">
                🔒 La tua posizione viene usata solo in questa sessione e non viene mai salvata o condivisa.
            </p>

            <!-- Info browser (visibile solo su Firefox/Chrome dove il popup è nella toolbar) -->
            <div id="geo-browser-hint" style="
                display:none;background:#F4F1DE;border-radius:12px;
                padding:10px 14px;margin-bottom:16px;
                font-size:0.78rem;color:#606C38;font-weight:600;
                text-align:center;line-height:1.5;
            ">
                📍 Dopo aver toccato "Consenti", cerca la richiesta nella <strong>barra in alto del browser</strong> e approva da lì.
            </div>

            <!-- Bottoni -->
            <div style="display:flex;flex-direction:column;gap:10px;">
                <button id="geo-modal-confirm" style="
                    width:100%;padding:16px;border:none;border-radius:16px;
                    background:linear-gradient(135deg,#E76F51,#c0392b);
                    color:white;font-size:0.9rem;font-weight:800;
                    letter-spacing:0.06em;text-transform:uppercase;
                    cursor:pointer;
                    box-shadow:0 4px 14px rgba(231,111,81,0.4);
                    transition:transform 0.15s,box-shadow 0.15s;
                    font-family:'Plus Jakarta Sans',sans-serif;
                " ontouchstart="this.style.transform='scale(0.97)'" ontouchend="this.style.transform='scale(1)'">
                    <span class="material-icons" style="vertical-align:middle;font-size:18px;margin-right:6px;">gps_fixed</span>
                    Consenti posizione
                </button>
                <button id="geo-modal-cancel" style="
                    width:100%;padding:14px;border:2px solid #e2e8f0;border-radius:16px;
                    background:transparent;color:#94a3b8;
                    font-size:0.82rem;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;
                    cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;
                    transition:border-color 0.15s,color 0.15s;
                ">
                    Non ora
                </button>
            </div>
        </div>`;

    document.body.appendChild(overlay);

    // Mostra il hint per Firefox/Chrome
    // window.safari esiste solo su Safari macOS desktop, non su iOS Safari.
    // Usiamo un check UA affidabile: Safari è l'unico browser che NON ha "Chrome" o "Firefox"
    // nella stringa userAgent ma ha "Safari".
    const ua = navigator.userAgent;
    const isRealSafari = ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Firefox') && !ua.includes('Edg');
    const hint = document.getElementById('geo-browser-hint');
    if (hint && !isRealSafari) hint.style.display = 'block';

    // ── Azioni bottoni ──
    document.getElementById('geo-modal-confirm').addEventListener('click', () => {
        _dismissGeoModal();
        if (onGranted) onGranted();
    });

    document.getElementById('geo-modal-cancel').addEventListener('click', () => {
        _dismissGeoModal();
        if (onDenied) onDenied();
    });

    // Chiudi toccando fuori dalla card
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) _dismissGeoModal();
    });
}

function _dismissGeoModal() {
    const el = document.getElementById('geo-modal-overlay');
    if (el) {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.25s';
        setTimeout(() => el.remove(), 250);
    }
}

// Modal di errore branded (sostituisce alert())
function _showGeoErrorModal(title, message) {
    if (document.getElementById('geo-modal-overlay')) _dismissGeoModal();

    const overlay = document.createElement('div');
    overlay.id = 'geo-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding-bottom:24px;';

    overlay.innerHTML = `
        <div style="
            background:#fff;border-radius:28px;padding:28px 24px 24px;
            max-width:400px;width:calc(100% - 32px);
            box-shadow:0 -4px 40px rgba(0,0,0,0.18);
            animation:geoModalIn 0.35s cubic-bezier(0.2,0.8,0.2,1) forwards;
        ">
            <div style="display:flex;justify-content:center;margin-bottom:20px;">
                <div style="width:64px;height:64px;border-radius:20px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;">
                    <span class="material-icons" style="color:#94a3b8;font-size:32px;">location_off</span>
                </div>
            </div>
            <h2 style="text-align:center;font-family:'Roboto Slab',serif;font-size:1.2rem;font-weight:700;color:#264653;margin:0 0 10px;">${title}</h2>
            <p style="text-align:center;font-size:0.88rem;color:#64748b;line-height:1.6;margin:0 0 24px;">${message}</p>
            <button onclick="document.getElementById('geo-modal-overlay').remove()" style="
                width:100%;padding:15px;border:none;border-radius:16px;
                background:#264653;color:white;font-size:0.9rem;font-weight:800;
                letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;
                font-family:'Plus Jakarta Sans',sans-serif;
            ">Capito</button>
        </div>`;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// Avvia effettivamente il watchPosition (chiamato dopo consenso nel modal)
function _startGeoWatch(btn, map) {
    btn.innerHTML = '<span class="material-icons spin">refresh</span> Cerco...';
    btn.style.backgroundColor = '#f39c12';

    // Su Firefox/Chrome mostra banner nella toolbar dopo che watchPosition è stato chiamato
    if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then(perm => {
            if (perm.state === 'prompt') _showGeoBanner();
        }).catch(() => {});
    }

    window.watchId = navigator.geolocation.watchPosition(
        (pos) => {
            _dismissGeoBanner();
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            if (!window.userMarker) {
                window.userMarker = L.circleMarker([lat, lng], {
                    radius: 8, fillColor: "#2196F3", color: "#fff",
                    weight: 2, opacity: 1, fillOpacity: 1
                }).addTo(map);
                map.setView([lat, lng], 15);
                btn.innerHTML = '<span class="material-icons">stop_circle</span> Stop';
                btn.style.backgroundColor = '#c0392b';
            } else {
                window.userMarker.setLatLng([lat, lng]);
            }
        },
        (err) => {
            _dismissGeoBanner();
            console.error("Errore GPS:", err);
            const messages = {
                1: "Hai negato l'accesso alla posizione. Per riabilitarla, vai nelle impostazioni del browser.",
                2: "Posizione non disponibile al momento.",
                3: "Timeout: il GPS non ha risposto. Riprova."
            };
            _showGeoErrorModal("Posizione non trovata", messages[err.code] || "Impossibile trovare la posizione.");
            window.watchId = null;
            btn.innerHTML = '<span class="material-icons">my_location</span> GPS';
            btn.style.backgroundColor = '#29B6F6';
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

// Banner sottile per guidare l'utente a trovare il permesso nella toolbar di Firefox/Chrome
function _showGeoBanner() {
    if (document.getElementById('geo-permission-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'geo-permission-banner';
    banner.style.cssText = [
        'position:fixed','top:16px','left:50%','transform:translateX(-50%)',
        'z-index:9999','background:#264653','color:white',
        'padding:12px 20px','border-radius:14px','font-size:13px',
        'font-weight:700','max-width:310px','width:calc(100% - 32px)',
        'text-align:center','box-shadow:0 8px 24px rgba(0,0,0,0.3)',
        'pointer-events:none','transition:opacity 0.3s'
    ].join(';');
    banner.innerHTML = '📍 Cerca il permesso nella <strong>barra del browser</strong> e tocca <strong>"Consenti"</strong>';
    document.body.appendChild(banner);
    setTimeout(_dismissGeoBanner, 8000);
}

function _dismissGeoBanner() {
    const b = document.getElementById('geo-permission-banner');
    if (b) { b.style.opacity = '0'; setTimeout(() => b.remove(), 300); }
}

function _showGeoError(btn, msg) {
    _showGeoErrorModal("Errore GPS", msg);
    if (btn) {
        btn.innerHTML = '<span class="material-icons">my_location</span> GPS';
        btn.style.backgroundColor = '#29B6F6';
    }
}

window.toggleChicco = async function() {
    const bubble = document.getElementById('chicco-bubble'); const textSpan = document.getElementById('chicco-text');
    const staticImg = document.getElementById('chicco-static'); const lottieAnim = document.getElementById('chicco-anim');
    if (!bubble || !textSpan) return;
    if (bubble.style.display === 'none' || bubble.style.display === '') {
        bubble.style.display = 'block'; textSpan.innerHTML = `Mmh... <span class="material-icons spin" style="font-size:0.9rem;">sync</span>`;
        let info = { weather: "Errore", advice: "Non riesco a connettermi.", action: null };
        if (window.getChiccoRealTimeAdvice) { info = await window.getChiccoRealTimeAdvice(); }
        textSpan.innerHTML = `<div style="font-size:0.85rem; color:#555; margin-bottom:5px;">${info.weather}</div><div style="font-weight:bold; color:#8E44AD; margin-bottom:8px;">${info.advice}</div>`;
        if (staticImg) staticImg.style.display = 'none'; if (lottieAnim) { lottieAnim.style.display = 'block'; lottieAnim.loop = true; lottieAnim.play(); let loopCount = 0; const stopAfterTwo = () => { loopCount++; if (loopCount >= 1) { lottieAnim.loop = false; lottieAnim.removeEventListener('loop', stopAfterTwo); } }; lottieAnim.removeEventListener('loop', stopAfterTwo); lottieAnim.addEventListener('loop', stopAfterTwo); }
    } else {
        bubble.style.display = 'none'; if (lottieAnim) { lottieAnim.stop(); lottieAnim.style.display = 'none'; } if (staticImg) staticImg.style.display = 'block';
    }
};

window.initBusMap = function(fermate) {
    const mapContainer = document.getElementById('bus-map');
    if (!mapContainer) return;
    if (window.currentBusMap) { window.currentBusMap.remove(); window.currentBusMap = null; }

    const map = L.map('bus-map', { zoomControl: false }).setView([44.1000, 9.7385], 13);
    window.currentBusMap = map;

    // Warm, cartographic tile style (Carto Voyager)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO', subdomains: 'abcd', maxZoom: 20
    }).addTo(map);

    // ── Custom bus stop icon ──
    const busIcon = L.divIcon({
        className: '',
        html: `<div style="
            width:28px; height:28px; border-radius:50%;
            background: linear-gradient(135deg, #E9C46A, #F4A261);
            border: 2.5px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            display:flex; align-items:center; justify-content:center;
            font-size:13px; line-height:1;">🚌</div>`,
        iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16]
    });

    const markersGroup = new L.FeatureGroup();
    const labelPartenza = window.t('departure') || 'Partenza';
    const labelArrivo = window.t('arrival') || 'Arrivo';

    fermate.forEach(f => {
        if (!f.LAT || !f.LONG) return;
        const marker = L.marker([f.LAT, f.LONG], { icon: busIcon }).addTo(map);
        marker.bindPopup(`
            <div style="text-align:center; min-width:160px; font-family:inherit;">
                <div style="font-weight:800; font-size:0.9rem; color:#1e293b; margin-bottom:10px; line-height:1.2;">${f.NOME_FERMATA}</div>
                <div style="display:flex; gap:6px; justify-content:center;">
                    <button onclick="setBusStop('partenza','${f.ID}')"
                        style="flex:1; background:#16a34a; color:white; border:none; padding:7px 8px; border-radius:8px; cursor:pointer; font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em;">
                        ↑ ${labelPartenza}
                    </button>
                    <button onclick="setBusStop('arrivo','${f.ID}')"
                        style="flex:1; background:#dc2626; color:white; border:none; padding:7px 8px; border-radius:8px; cursor:pointer; font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:0.05em;">
                        ↓ ${labelArrivo}
                    </button>
                </div>
            </div>`
        );
        markersGroup.addLayer(marker);
    });
    map.addLayer(markersGroup);

    // ── Geolocation via shared cache (no repeated GPS calls) ──
    window._busGeoMarker = null;

    setTimeout(() => {
        map.invalidateSize();

        window._requestGeoPermission(() => {
            // Permesso concesso: avvia il tracking
            window.GeoTracker.start('bus', ({ lat, lng, accuracy, isFirst }) => {
                if (window._busGeoMarker) { map.removeLayer(window._busGeoMarker); }
                const userIcon = L.divIcon({
                    className: '',
                    html: `<div style="position:relative;width:20px;height:20px;">
                        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.22);animation:geoPulse 1.8s ease-out infinite;"></div>
                        <div style="position:absolute;inset:4px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 2px 6px rgba(59,130,246,0.55);"></div>
                        <style>@keyframes geoPulse{0%{transform:scale(1);opacity:.6}70%{transform:scale(2.5);opacity:0}100%{opacity:0}}</style>
                    </div>`,
                    iconSize: [20, 20], iconAnchor: [10, 10]
                });
                window._busGeoMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 })
                    .addTo(map)
                    .bindPopup(`<div style="font-weight:700;font-size:0.85rem;color:#1e293b;">📍 Sei qui</div>`);
                if (isFirst && lat > 43.9 && lat < 44.3 && lng > 9.5 && lng < 10.0) {
                    map.setView([lat, lng], 14, { animate: true });
                }
            });
        });
        // Se l'utente rifiuta o nega, la mappa bus rimane funzionante senza marker posizione
    }, 250);
};

window.setBusStop = function(type, value) {
    const selectId = (type === 'partenza') ? 'selPartenza' : 'selArrivo';
    const select = document.getElementById(selectId);
    if (select) {
        select.value = value;
        window.flashInputFeedback(selectId);
        window.handleBusSelectionChange(type);
        if(window.currentBusMap) window.currentBusMap.closePopup();
    }
};

window.toggleBusMap = function() {
    const container = document.getElementById('bus-map-wrapper'); const btn = document.getElementById('btn-bus-map-toggle');
    if (!container) return;
    const isHidden = container.classList.contains('hidden');
    if (isHidden) {
        container.classList.remove('hidden');
        if (btn) { btn.classList.add('bg-indigo-500', 'text-white', 'border-transparent'); btn.classList.remove('bg-indigo-50', 'text-indigo-500', 'border-indigo-100'); btn.innerHTML = '<span class="material-icons text-lg">expand_less</span>'; }
        setTimeout(() => { if (window.currentBusMap) { window.currentBusMap.invalidateSize(); } }, 100);
    } else {
        container.classList.add('hidden');
        if (btn) { btn.classList.remove('bg-indigo-500', 'text-white', 'border-transparent'); btn.classList.add('bg-indigo-50', 'text-indigo-500', 'border-indigo-100'); btn.innerHTML = '<span class="material-icons text-lg">map</span>'; }
    }
};

// ── Open map pre-filtered to aperitivo ──
window._openMapAperitivo = function() {
    window._mapPreFilter = 'aperitivo';
    switchView('mappa');
};

// ── Open map pre-filtered to vino ──
window._openMapVino = function() {
    window._mapPreFilter = 'vino';
    switchView('mappa');
};

// ── Open map pre-filtered to spiaggia ──
window._openMapSpiaggia = function() {
    window._mapPreFilter = 'spiaggia';
    switchView('mappa');
};

// ── Open map pre-filtered to attrazione ──
window._openMapAttrazione = function() {
    window._mapPreFilter = 'attrazione';
    switchView('mappa');
};

// ══════════════════════════════════════════════════════════════════
// GeoTracker — unified, precision-smoothed, battery-friendly
// ══════════════════════════════════════════════════════════════════
//
// Precision strategy: accuracy-adaptive EMA smoothing.
//   α = clamp(20 / accuracy_meters, 0.05, 1.0)
//   → fix with 10m accuracy  → α ≈ 1.0  (full update, trust it)
//   → fix with 50m accuracy  → α = 0.4  (blend in slowly)
//   → fix with 150m accuracy → α = 0.13 (mostly ignore)
// This is a lightweight 1-state Kalman approximation: zero arrays,
// just two multiplications per GPS update.
//
// Battery strategy:
//   maximumAge: 60 000 ms — OS reuses existing chip fix, no re-acquisition
//   One active watchId per named tracker (bus, mappa). Callers call
//   stop() when they unmount; watch is cleaned up automatically.
//
window.GeoTracker = (function() {
    const _watchers = {};   // name → watchId
    const _smoothed = {};   // name → { lat, lng }
    const _firstFix = {};   // name → bool

    function _smooth(name, rawLat, rawLng, accuracy) {
        const clampedAcc = Math.max(accuracy || 50, 1);
        const alpha = Math.min(1.0, Math.max(0.05, 20 / clampedAcc));
        if (!_smoothed[name]) {
            _smoothed[name] = { lat: rawLat, lng: rawLng };
        } else {
            _smoothed[name].lat = _smoothed[name].lat * (1 - alpha) + rawLat * alpha;
            _smoothed[name].lng = _smoothed[name].lng * (1 - alpha) + rawLng * alpha;
        }
        return { lat: _smoothed[name].lat, lng: _smoothed[name].lng, accuracy: clampedAcc, alpha };
    }

    return {
        // Check if a named tracker is currently active
        _isTracking(name) { return _watchers[name] != null; },
        // Start tracking. onUpdate({ lat, lng, accuracy, isFirst })
        start(name, onUpdate) {
            if (!navigator.geolocation) return;
            this.stop(name); // clear any previous watch for this name
            _firstFix[name] = true;
            _smoothed[name] = null;
            _watchers[name] = navigator.geolocation.watchPosition(
                (pos) => {
                    _dismissGeoBanner();
                    const s = _smooth(name, pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
                    const isFirst = _firstFix[name];
                    _firstFix[name] = false;
                    onUpdate({ ...s, isFirst });
                },
                (err) => {
                    _dismissGeoBanner();
                    console.warn(`GeoTracker[${name}] error (code ${err.code})`);
                },
                { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 }
            );
        },
        stop(name) {
            if (_watchers[name] != null) {
                navigator.geolocation.clearWatch(_watchers[name]);
                delete _watchers[name];
                delete _smoothed[name];
            }
        },
        stopAll() {
            Object.keys(_watchers).forEach(n => this.stop(n));
        }
    };
})();

// Legacy shims kept for backwards compatibility
window.startBusGeoWatch = (cb) => window.GeoTracker.start('bus', p => cb({ coords: { latitude: p.lat, longitude: p.lng, accuracy: p.accuracy } }));
window.stopBusGeoWatch  = ()   => window.GeoTracker.stop('bus');
window.getCachedPosition = (cb) => {
    const tmp = window.GeoTracker;
    tmp.start('_once', p => { tmp.stop('_once'); cb({ coords: { latitude: p.lat, longitude: p.lng, accuracy: p.accuracy } }); });
};

window.loadAllStops = async function() {
    const selPart = document.getElementById('selPartenza');
    const selArr  = document.getElementById('selArrivo');
    if (!selPart || !selArr) return;

    // ── 1. Carica le fermate (con cache) ──
    if (!window.cachedStops) {
        const { data, error } = await window.supabaseClient
            .from('Fermate_bus')
            .select('ID, NOME_FERMATA, LAT, LONG')
            .order('NOME_FERMATA', { ascending: true });
        if (error) { console.error('Errore fermate:', error); return; }
        window.cachedStops = data;
    }

    // ── 2. Pre-carica TUTTI gli orari e costruisce la lookup map (una volta sola) ──
    //    Formato: window._busConnMap = Map<fermataId, Set<corsaId>>
    if (!window._busConnMap) {
        // Mostra spinner sulla label del select durante il caricamento
        selPart.innerHTML = `<option value="" disabled selected>⏳ Caricamento orari...</option>`;
        selPart.disabled = true;

        const { data: allOrari, error: errOrari } = await window.supabaseClient
            .from('Orari_bus')
            .select('ID_FERMATA, ID_CORSA');

        if (!errOrari && allOrari) {
            const map = new Map();
            for (const row of allOrari) {
                if (!map.has(row.ID_FERMATA)) map.set(row.ID_FERMATA, new Set());
                map.get(row.ID_FERMATA).add(row.ID_CORSA);
            }
            window._busConnMap = map;
        }
        selPart.disabled = false;
    }

    // ── 3. Popola SEMPRE il select della Partenza con TUTTE le fermate ──
    const allOpts = window.cachedStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
    selPart.innerHTML = `<option value="" selected>${window.t('select_start')}</option>` + allOpts;
    selArr.innerHTML  = `<option value="" selected>${window.t('select_placeholder')}</option>`;
    selArr.disabled   = false;

    if (window.initBusMap) window.initBusMap(window.cachedStops);
};

window.handleBusSelectionChange = function(source) {
    const selPart = document.getElementById('selPartenza');
    const selArr  = document.getElementById('selArrivo');
    if (!selPart || !selArr || !window.cachedStops) return;

    // ── REGOLA FONDAMENTALE: solo la PARTENZA filtra l'ARRIVO, mai il contrario.
    //    Se cambia l'arrivo, non tocchiamo la partenza — l'utente sceglie libero.
    if (source === 'arrivo') return;

    const partenzaId = parseInt(selPart.value);
    const prevArrivo = selArr.value;

    if (window.flashInputFeedback) window.flashInputFeedback('selPartenza');

    // Nessuna partenza → ripristina arrivo completo
    if (!partenzaId) {
        const allOpts = window.cachedStops
            .map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
        selArr.innerHTML = `<option value="" selected>${window.t('select_placeholder')}</option>` + allOpts;
        return;
    }

    // ── Calcolo ISTANTANEO tramite lookup map pre-costruita ──
    if (window._busConnMap) {
        const corsePartenza = window._busConnMap.get(partenzaId) || new Set();
        const validIds = new Set();
        window._busConnMap.forEach((corse, fermataId) => {
            if (fermataId === partenzaId) return;
            for (const corsaId of corse) {
                if (corsePartenza.has(corsaId)) { validIds.add(fermataId); break; }
            }
        });
        const validStops = window.cachedStops
            .filter(s => validIds.has(s.ID))
            .sort((a, b) => a.NOME_FERMATA.localeCompare(b.NOME_FERMATA));
        const newOptions = validStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
        const placeholder = `<option value="" disabled selected>${window.t('valid_destinations')}</option>`;
        selArr.innerHTML = placeholder + newOptions;
        // Mantieni arrivo selezionato se ancora valido
        const prevId = parseInt(prevArrivo);
        selArr.value = validIds.has(prevId) ? prevArrivo : '';
    } else {
        // Fallback se la map non è ancora pronta (raro): lascia arrivo invariato
        selArr.innerHTML = `<option value="" disabled selected>${window.t('select_placeholder')}</option>` +
            window.cachedStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
    }
};

window.handleFerrySelectionChange = function(source) {
    const selPart = document.getElementById('selPartenzaFerry');
    const selArr  = document.getElementById('selArrivoFerry');
    // Usa window.FERRY_STOPS (esposto da ui-modal-contents.js)
    const stops = window.FERRY_STOPS || [];
    if (!stops.length) { console.warn('FERRY_STOPS non ancora disponibile'); return; }

    // ── Stessa regola bus: solo PARTENZA filtra ARRIVO, mai il contrario ──
    if (source === 'arrivo') return;

    if (!selPart || !selArr) return;
    const selectedVal = selPart.value;
    const prevArrivo  = selArr.value;

    if (window.flashInputFeedback) window.flashInputFeedback('selPartenzaFerry');

    if (!selectedVal) {
        // Reset arrivo al completo
        selArr.innerHTML = `<option value="" disabled selected>${window.t('select_placeholder')}</option>` +
            stops.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
        selArr.disabled = false;
        return;
    }

    // Filtra: tutte le fermate tranne quella di partenza
    const validStops = stops.filter(s => s.id !== selectedVal);
    selArr.innerHTML = `<option value="" disabled selected>${window.t('select_arrival_placeholder')}</option>` +
        validStops.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
    selArr.disabled = false;

    // Mantieni arrivo se ancora valido
    if (prevArrivo && validStops.some(s => s.id === prevArrivo)) {
        selArr.value = prevArrivo;
    } else {
        selArr.value = '';
    }
};

window.flashInputFeedback = function(elementId) {
    const el = document.getElementById(elementId);
    if (el && el.parentElement && el.parentElement.parentElement) {
        const wrapper = el.parentElement.parentElement; wrapper.classList.add('bg-slate-100', 'rounded-lg');
        setTimeout(() => wrapper.classList.remove('bg-slate-100', 'rounded-lg'), 300);
    }
};

// ... Ricerca Bus e Traghetti (stesse funzioni precedenti, solo per completezza se mancanti)
window.eseguiRicercaBus = async function() {
    const selPartenza = document.getElementById('selPartenza'); const selArrivo = document.getElementById('selArrivo'); const selData = document.getElementById('selData'); const selOra = document.getElementById('selOra');
    const nextCard = document.getElementById('nextBusCard'); const list = document.getElementById('otherBusList'); const resultsContainer = document.getElementById('busResultsContainer');
    if (!selPartenza || !selArrivo || !selData || !selOra) return;
    const partenzaId = parseInt(selPartenza.value); const arrivoId = parseInt(selArrivo.value); const dataScelta = selData.value; const oraScelta = selOra.value;
    if (!partenzaId || !arrivoId) return;
    resultsContainer.style.display = 'block';
    nextCard.innerHTML = `<div class="flex flex-col items-center justify-center py-8"><span class="material-icons spin text-3xl mb-2 opacity-80">sync</span><span class="text-sm font-bold uppercase tracking-widest opacity-80">${window.t('loading')}</span></div>`; list.innerHTML = '';
    setTimeout(() => { resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
    const parts = dataScelta.split('-'); const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const isFestivo = (typeof isItalianHoliday === 'function') ? isItalianHoliday(dateObj) : (dateObj.getDay() === 0);
    const dayBadge = isFestivo ? `<span class="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider text-white border border-white/20">📅 ${window.t('badge_holiday')}</span>` : `<span class="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider text-white border border-white/20">🏢 ${window.t('badge_weekday')}</span>`;
    const { data, error } = await window.supabaseClient.rpc('trova_bus', { p_partenza_id: partenzaId, p_arrivo_id: arrivoId, p_orario_min: oraScelta, p_is_festivo: isFestivo });
    if (error || !data || data.length === 0) { 
        nextCard.innerHTML = `<div class="text-center py-6 text-white"><div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30"><span class="material-icons text-3xl">event_busy</span></div><strong class="block text-xl mb-1">${window.t('bus_not_found')}</strong><div class="opacity-80 text-sm mb-4">${window.t('bus_try_change')}</div>${dayBadge}</div>`; return; 
    }
    const primo = data[0]; const successivi = data.slice(1);
    nextCard.innerHTML = `<div class="flex justify-between items-start mb-6"><span class="text-[11px] font-bold uppercase tracking-widest text-white/80 border border-white/20 px-2 py-1 rounded-lg bg-black/5">${window.t('next_departure')}</span>${dayBadge}</div><div class="flex items-end justify-between relative z-10"><div><div class="text-6xl font-serif font-bold text-white leading-none tracking-tight shadow-black drop-shadow-md mb-1">${primo.ora_partenza.slice(0,5)}</div><div class="text-sm font-bold text-amber-100 uppercase tracking-widest pl-1">${window.t('departure')}</div></div><div class="text-right pb-1"><div class="text-2xl font-bold text-white/90 leading-none">${primo.ora_arrivo.slice(0,5)}</div><div class="text-[11px] font-bold text-amber-100 uppercase tracking-widest opacity-80">${window.t('arrival')}</div></div></div><div class="mt-6 pt-4 border-t border-white/20 flex items-center justify-between"><div class="flex items-center gap-2"><span class="material-icons text-white/80 text-sm">directions_bus</span><span class="text-xs font-bold text-white uppercase tracking-wide">${primo.nome_linea || 'Bus ATC'}</span></div><span class="material-icons text-white/40 rotate-180">arrow_back</span></div><span class="material-icons absolute -right-4 -bottom-8 text-[140px] text-white opacity-10 rotate-12 pointer-events-none">directions_bus</span>`;
    if (successivi.length === 0) { list.innerHTML = `<div class="text-center text-slate-400 text-xs py-4 font-bold uppercase tracking-widest">${window.t('no_runs_today')}</div>`; } else { list.innerHTML = successivi.map(b => `<div class="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-amber-100 cursor-default"><div class="flex items-center gap-4"><div class="flex flex-col"><span class="text-xl font-bold text-slate-700 leading-none group-hover:text-amber-600 transition-colors">${b.ora_partenza.slice(0,5)}</span><span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">${window.t('departure')}</span></div><div class="flex flex-col items-center px-1 opacity-40"><span class="material-icons text-slate-400 text-sm">arrow_forward</span></div><div class="flex flex-col"><span class="text-lg font-bold text-slate-500 leading-none">${b.ora_arrivo.slice(0,5)}</span><span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">${window.t('arrival')}</span></div></div><div class="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors"><span class="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-amber-600">Bus</span></div></div>`).join(''); }
};

window.eseguiRicercaTraghetto = async function() {
    const selPart = document.getElementById('selPartenzaFerry'); const selArr = document.getElementById('selArrivoFerry'); const selOra = document.getElementById('selOraFerry');
    const resultsContainer = document.getElementById('ferryResultsContainer'); const nextCard = document.getElementById('nextFerryCard'); const list = document.getElementById('otherFerryList');
    if (!selPart.value || !selArr.value || !selOra.value) return;
    resultsContainer.style.display = 'block';
    nextCard.innerHTML = `<div class="flex flex-col items-center justify-center py-8"><span class="material-icons spin text-3xl mb-2 opacity-80">sync</span><span class="text-sm font-bold uppercase tracking-widest opacity-80">${window.t('loading')}</span></div>`; list.innerHTML = '';
    setTimeout(() => { resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
    const startCol = selPart.value; const endCol = selArr.value; const timeFilter = selOra.value; 
    const { data, error } = await window.supabaseClient.from('Orari_traghetti').select(`id, direzione, validita, "${startCol}", "${endCol}"`); 
    let validRuns = []; if (data) { validRuns = data.filter(row => { const tStart = row[startCol]; const tEnd = row[endCol]; if (!tStart || !tEnd) return false; if (tStart >= tEnd) return false; if (tStart < timeFilter) return false; return true; }); validRuns.sort((a, b) => a[startCol].localeCompare(b[startCol])); }
    if (error || validRuns.length === 0) {
        nextCard.innerHTML = `<div class="text-center py-6 text-white"><div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30"><span class="material-icons text-3xl">directions_boat</span></div><strong class="block text-xl mb-1">${window.t('bus_not_found')}</strong><div class="opacity-80 text-sm">Controlla se la tratta è diretta.</div></div>`; return;
    }
    const primo = validRuns[0]; const successivi = validRuns.slice(1);
    nextCard.innerHTML = `<div class="flex justify-between items-start mb-6"><span class="text-[11px] font-bold uppercase tracking-widest text-white/80 border border-white/20 px-2 py-1 rounded-lg bg-black/5">${window.t('next_departure')}</span><span class="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider text-white border border-white/20">🌊 ${window.t('ferry_label')}</span></div><div class="flex items-end justify-between relative z-10"><div><div class="text-6xl font-serif font-bold text-white leading-none tracking-tight shadow-black drop-shadow-md mb-1">${primo[startCol].slice(0,5)}</div><div class="text-sm font-bold text-cyan-100 uppercase tracking-widest pl-1">${window.t('departure')}</div></div><div class="text-right pb-1"><div class="text-2xl font-bold text-white/90 leading-none">${primo[endCol].slice(0,5)}</div><div class="text-[11px] font-bold text-cyan-100 uppercase tracking-widest opacity-80">${window.t('arrival')}</div></div></div><div class="mt-6 pt-4 border-t border-white/20 flex items-center justify-between"><div class="flex items-center gap-2"><span class="material-icons text-white/80 text-sm">explore</span><span class="text-xs font-bold text-white uppercase tracking-wide">${window.t('direction_dir')} ${primo.direzione || window.t('coast')}</span></div></div><span class="material-icons absolute -right-6 -bottom-6 text-[140px] text-white opacity-10 rotate-[-10deg] pointer-events-none">sailing</span>`;
    if (successivi.length === 0) { list.innerHTML = `<div class="text-center text-slate-400 text-xs py-4 font-bold uppercase tracking-widest">${window.t('last_run_day')}</div>`; } else { list.innerHTML = successivi.map(run => `<div class="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-cyan-100 cursor-default"><div class="flex items-center gap-4"><div class="flex flex-col"><span class="text-xl font-bold text-slate-700 leading-none group-hover:text-cyan-600 transition-colors">${run[startCol].slice(0,5)}</span><span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">${window.t('departure')}</span></div><div class="flex flex-col items-center px-1 opacity-40"><span class="material-icons text-slate-400 text-sm">arrow_forward</span></div><div class="flex flex-col"><span class="text-lg font-bold text-slate-500 leading-none">${run[endCol].slice(0,5)}</span><span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">${window.t('arrival')}</span></div></div><div class="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-colors"><span class="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-cyan-600">Ferry</span></div></div>`).join(''); }
};