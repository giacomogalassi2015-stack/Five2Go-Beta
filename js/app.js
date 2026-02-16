console.log("✅ 6. app.js caricato (Swipe Optimized)");

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
        if (view === 'home') renderHome();
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
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90"></div>
    </div>

    <div class="relative z-10 flex flex-col items-center justify-end h-[85vh] pb-24 px-6 text-center animate-pop">
        <h1 class="text-5xl font-serif font-bold text-white mb-2 drop-shadow-xl tracking-tight">Five2Go</h1>
        <p class="text-white/90 text-sm font-medium mb-8 max-w-xs mx-auto leading-relaxed shadow-black drop-shadow-md">La tua guida essenziale per vivere la magia delle Cinque Terre.</p>
        
        <div class="mb-6 w-full max-w-sm">
             <button class="w-full bg-ct-terracotta hover:bg-orange-600 text-white rounded-2xl py-4 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 group" onclick="switchView('outdoor')">
                <span class="text-sm font-bold uppercase tracking-widest">${window.t('btn_discover')}</span>
                <span class="material-icons group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
        </div>

        <div class="grid grid-cols-3 gap-3 w-full max-w-sm">
            ${window.AVAILABLE_LANGS.map(l => {
                const isActive = l.code === window.currentLang;
                const activeClass = isActive 
                    ? "bg-white text-slate-800 border-white shadow-xl scale-105 z-10 ring-2 ring-white/50" 
                    : "bg-white/10 text-white border-white/20 hover:border-white/50 active:bg-white/20";
                
                return `
                <button class="${activeClass} backdrop-blur-md border rounded-2xl py-3 flex flex-col items-center justify-center transition-all active:scale-95" onclick="changeLanguage('${l.code}')">
                    <span class="text-2xl mb-1 drop-shadow-md">${l.flag}</span>
                    <span class="text-[10px] font-bold uppercase tracking-widest opacity-80">${l.label}</span>
                </button>
                `;
            }).join('')}
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
    <div class="nav-sticky-header sticky top-0 z-30 bg-ct-sand/95 backdrop-blur-md py-4 -mx-5 px-5 shadow-sm mb-4 flex items-center justify-between gap-3 border-b border-stone-200/50 transition-all">
        <div class="nav-scroll-container flex gap-3 overflow-x-auto no-scrollbar items-center flex-1 pr-2 pb-1" id="nav-tabs-container">
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

                // Aggiungiamo data-index e data-table per identificarli rapidamente
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
        <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-ct-sand to-transparent pointer-events-none"></div>
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
        subContent.innerHTML = `<div class="rounded-[2rem] overflow-hidden shadow-soft border-2 border-white h-[70vh] animate-fade"><iframe src="https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1" width="100%" height="100%" style="border:0;"></iframe></div>`;
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
    if (!unique.includes('Tutti')) unique.unshift('Tutti');
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
    let activeTag = 'Tutti';

    function renderChips() {
        chipContainer.innerHTML = tags.map(tag => {
            const isActive = tag === activeTag;
            const style = isActive ? "bg-ct-terracotta text-white border-transparent shadow-md" : "bg-white text-slate-600 border-stone-200";
            const displayTag = (tag === 'Tutti') ? labelAll : tag;
            return `<button class="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${style}" onclick="window.applySingleSmartFilter('${tag}', '${filterId}', true)">${displayTag}</button>`;
        }).join('');
    }

    window.applySingleSmartFilter = (tag, fId, fromClick = false) => {
        activeTag = tag;
        renderChips();
        labelSpan.innerText = (tag === 'Tutti') ? labelAll : tag;
        if (fromClick) toggleSmartFilter(panelId, triggerId);

        const pinnedItem = allData.find(item => {
             const nome = String(window.dbCol(item, 'Nome') || '').toLowerCase();
             return nome.includes('numero unico') || nome.includes('emergenza');
        });
        const otherData = pinnedItem ? allData.filter(i => i !== pinnedItem) : allData;
        let filtered = tag === 'Tutti' ? otherData : otherData.filter(item => {
            let valDB = window.dbCol(item, filterKey);
            return valDB && String(valDB).trim().includes(tag);
        });
        if (pinnedItem && tag === 'Tutti') filtered = [pinnedItem, ...filtered];
        updateList(filtered);
    };

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
    window.applySingleSmartFilter('Tutti', filterId); 
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
                        <div class="text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">${window.t('filter_village')}</div>
                        <div class="overflow-x-auto no-scrollbar flex gap-2" id="row1-${filterId}"></div>
                    </div>
                    <div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">${window.t('filter_cat')}</div>
                        <div class="overflow-x-auto no-scrollbar flex gap-2" id="row2-${filterId}"></div>
                    </div>
                    <button class="w-full py-2 bg-ct-blue text-white rounded-lg text-xs font-bold uppercase mt-2 shadow-md active:scale-95 transition-transform" onclick="toggleSmartFilter('${panelId}', '${triggerId}')">${btnClose}</button>
                </div>
            </div>
        </div>
        <div id="dynamic-list" class="flex flex-col gap-3 pb-24 animate-fade min-h-[50vh]"></div>
    `;

    const c1 = container.querySelector(`#row1-${filterId}`);
    const c2 = container.querySelector(`#row2-${filterId}`);
    const listContainer = container.querySelector('#dynamic-list');
    const labelSpan = container.querySelector(`#filter-label-${filterId}`);

    let activeVal1 = 'Tutti';
    let activeVal2 = 'Tutti';

    window.applyDoubleSmartFilter = (level, val, fId) => {
        if (level === 1) activeVal1 = val;
        if (level === 2) activeVal2 = val;
        renderControls();
        const txt1 = activeVal1 === 'Tutti' ? labelAll : activeVal1;
        const txt2 = activeVal2 === 'Tutti' ? labelAllFem : activeVal2;
        labelSpan.innerText = `${txt1} • ${txt2}`;
        executeFilter();
    };

    function renderControls() {
        c1.innerHTML = values1.map(v => {
            const isActive = v === activeVal1;
            const style = isActive ? "bg-ct-terracotta text-white shadow-md border-transparent" : "bg-white text-slate-600 border-stone-200";
            return `<button class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${style}" onclick="window.applyDoubleSmartFilter(1, '${v}', '${filterId}')">${v}</button>`;
        }).join('');

        c2.innerHTML = values2.map(v => {
            const isActive = v === activeVal2;
            const style = isActive ? "bg-ct-blue text-white shadow-md border-transparent" : "bg-white text-slate-600 border-stone-200";
            return `<button class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${style}" onclick="window.applyDoubleSmartFilter(2, '${v}', '${filterId}')">${v}</button>`;
        }).join('');
    }

    function executeFilter() {
        const filtered = allData.filter(item => {
            const val1 = window.dbCol(item, filtersConfig.primary.key) || '';
            const val2 = window.dbCol(item, filtersConfig.secondary.key) || '';
            const match1 = (activeVal1 === 'Tutti') || val1.includes(activeVal1);
            const match2 = (activeVal2 === 'Tutti') || val2.toLowerCase().includes(activeVal2.toLowerCase());
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
    console.log("🔘 Avvio renderServicesGrid (Compact)...");
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

    // FIX 1: Cambiato gap-4 in gap-2 e ridotto padding (p-4 invece di p-6)
    let gridHtml = `
    <div class="grid grid-cols-2 gap-2 pb-32 animate-pop">
        
        <div class="col-span-2 relative bg-ct-yellow rounded-[2rem] p-4 shadow-soft active:scale-95 transition-transform cursor-pointer overflow-hidden group min-h-[120px] flex flex-col justify-between border border-yellow-200" onclick="openModal('transport', 'bus')">
            <div class="absolute -right-2 -bottom-4 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-500"><span class="material-icons text-[130px] text-yellow-900">directions_bus</span></div>
            <div class="relative z-10">
                <div class="bg-white/80 backdrop-blur w-10 h-10 rounded-xl flex items-center justify-center mb-2 shadow-sm border border-white"><span class="material-icons text-xl text-yellow-700">directions_bus</span></div>
                <h3 class="text-2xl font-serif font-bold leading-none text-slate-800 mb-1">${window.t('label_bus')}</h3>
                <p class="text-yellow-800 text-[10px] font-bold uppercase tracking-widest">Orari ATC & Navette</p>
            </div>
        </div>

        <div class="bg-ct-terracotta rounded-[2rem] p-4 shadow-soft active:scale-95 transition-transform cursor-pointer flex flex-col justify-between group h-full min-h-[130px] relative overflow-hidden" onclick="openModal('transport', 'train')">
            <div class="absolute -right-4 -bottom-4 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500"><span class="material-icons text-[90px] text-white">train</span></div>
            <div class="relative z-10">
                <div class="bg-white/20 backdrop-blur w-10 h-10 rounded-xl flex items-center justify-center mb-2 border border-white/30"><span class="material-icons text-xl text-white">train</span></div>
                <div>
                    <h3 class="font-serif font-bold text-white text-lg leading-tight mb-1">${window.t('label_train')}</h3>
                    <p class="text-red-100 text-[9px] font-bold uppercase tracking-widest">Trenitalia</p>
                </div>
            </div>
        </div>

        <div class="bg-ct-blue rounded-[2rem] p-4 shadow-soft active:scale-95 transition-transform cursor-pointer flex flex-col justify-between group h-full min-h-[130px] relative overflow-hidden" onclick="openModal('transport', 'ferry')">
            <div class="absolute -right-4 -bottom-4 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500"><span class="material-icons text-[90px] text-white">directions_boat</span></div>
            <div class="relative z-10">
                <div class="bg-white/20 backdrop-blur w-10 h-10 rounded-xl flex items-center justify-center mb-2 border border-white/30"><span class="material-icons text-xl text-white">directions_boat</span></div>
                <div>
                    <h3 class="font-serif font-bold text-white text-lg leading-tight mb-1">${window.t('label_ferry')}</h3>
                    <p class="text-teal-100 text-[9px] font-bold uppercase tracking-widest">Navigazione</p>
                </div>
            </div>
        </div>

        <div class="col-span-2 bg-slate-700 rounded-[2rem] p-4 flex items-center justify-between shadow-soft active:scale-95 transition-transform cursor-pointer mt-1" onclick="renderSimpleList('Numeri_utili')">
            <div class="flex items-center gap-3 relative z-10">
                <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20"><span class="material-icons text-lg">phonelink_ring</span></div>
                <div><h3 class="font-serif text-white font-bold text-lg leading-tight">${window.t('menu_num')}</h3><p class="text-slate-300 text-[9px] font-bold uppercase tracking-widest mt-0.5">Emergenze</p></div>
            </div>
            <span class="material-icons text-white/50 bg-white/5 rounded-full p-1 relative z-10">chevron_right</span>
        </div>

        <div class="col-span-2 bg-ct-green rounded-[2rem] p-4 flex items-center justify-between shadow-soft active:scale-95 transition-transform cursor-pointer" onclick="renderSimpleList('Farmacie')">
            <div class="flex items-center gap-3 relative z-10">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white border border-white/30"><span class="material-icons text-lg">medical_services</span></div>
                <div><h3 class="font-serif text-white font-bold text-lg leading-tight">${window.t('menu_pharm')}</h3><p class="text-green-100 text-[9px] font-bold uppercase tracking-widest mt-0.5">Turni</p></div>
            </div>
            <span class="material-icons text-white/50 bg-white/10 rounded-full p-1 relative z-10">chevron_right</span>
        </div>

        <div class="col-span-2 text-center mt-4 mb-4">
            <button onclick="renderLegalPage()" class="text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-ct-terracotta transition-colors flex items-center justify-center gap-2 mx-auto py-2 bg-white px-4 rounded-full shadow-sm border border-slate-200">
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
window.toggleGPS = function() {
    const map = window.currentMap; const btn = document.getElementById('btn-gps');
    if (!map) return;
    if (window.watchId !== null) { navigator.geolocation.clearWatch(window.watchId); window.watchId = null; if (window.userMarker) { map.removeLayer(window.userMarker); window.userMarker = null; } btn.style.backgroundColor = '#29B6F6'; btn.innerHTML = '<span class="material-icons">my_location</span> GPS'; return; }
    if (!navigator.geolocation) { alert("GPS non supportato dal tuo browser."); return; }
    btn.innerHTML = '<span class="material-icons spin">refresh</span> Cerco...'; btn.style.backgroundColor = '#f39c12'; 
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
    window.watchId = navigator.geolocation.watchPosition((pos) => { const lat = pos.coords.latitude; const lng = pos.coords.longitude; if (!window.userMarker) { window.userMarker = L.circleMarker([lat, lng], { radius: 8, fillColor: "#2196F3", color: "#fff", weight: 2, opacity: 1, fillOpacity: 1 }).addTo(map); map.setView([lat, lng], 15); btn.innerHTML = '<span class="material-icons">stop_circle</span> Stop'; btn.style.backgroundColor = '#c0392b'; } else { window.userMarker.setLatLng([lat, lng]); } }, (err) => { console.error("Errore GPS:", err); alert("Impossibile trovare la posizione."); btn.innerHTML = '<span class="material-icons">error</span> Err'; btn.style.backgroundColor = '#7f8c8d'; window.watchId = null; }, options);
};

window.toggleChicco = async function() {
    console.log("🍇 Click rilevato su Chicco!");
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
    const map = L.map('bus-map').setView([44.1000, 9.7385], 13);
    window.currentBusMap = map; 
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap, © CARTO', subdomains: 'abcd', maxZoom: 20 }).addTo(map);
    const markersGroup = new L.FeatureGroup();
    const labelPartenza = window.t('departure') || 'Partenza';
    const labelArrivo = window.t('arrival') || 'Arrivo';
    fermate.forEach(f => {
        if (!f.LAT || !f.LONG) return;
        const marker = L.marker([f.LAT, f.LONG]).addTo(map);
        marker.bindPopup(`<div style="text-align:center; min-width:150px;"><h3 style="margin:0 0 10px 0; font-size:1rem; color:#333;">${f.NOME_FERMATA}</h3><div style="display:flex; gap:5px; justify-content:center;"><button onclick="setBusStop('partenza', '${f.ID}')" class="btn-popup-start" style="background:#27ae60; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.75rem; font-weight:bold; text-transform:uppercase;">${labelPartenza}</button><button onclick="setBusStop('arrivo', '${f.ID}')" class="btn-popup-end" style="background:#c0392b; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.75rem; font-weight:bold; text-transform:uppercase;">${labelArrivo}</button></div></div>`);
        markersGroup.addLayer(marker);
    });
    map.addLayer(markersGroup);
    setTimeout(() => { map.invalidateSize(); }, 200);
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

window.loadAllStops = async function() {
    const selPart = document.getElementById('selPartenza'); const selArr = document.getElementById('selArrivo');
    if(!selPart || !selArr) return;
    if (!window.cachedStops) { const { data, error } = await window.supabaseClient.from('Fermate_bus').select('ID, NOME_FERMATA, LAT, LONG').order('NOME_FERMATA', { ascending: true }); if (error) { console.error("Errore fermate:", error); return; } window.cachedStops = data; }
    const options = window.cachedStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
    const placeholderStart = `<option value="" selected>${window.t('select_start')}</option>`;
    const placeholderEnd = `<option value="" selected>Scegli Arrivo</option>`; 
    selPart.innerHTML = placeholderStart + options; selArr.innerHTML = placeholderEnd + options; selPart.disabled = false; selArr.disabled = false;
    if (window.initBusMap) window.initBusMap(window.cachedStops);
};

window.handleBusSelectionChange = async function(source) {
    const selPart = document.getElementById('selPartenza'); const selArr = document.getElementById('selArrivo');
    if (!selPart || !selArr || !window.cachedStops) return;
    const changedSelect = (source === 'partenza') ? selPart : selArr; const targetSelect = (source === 'partenza') ? selArr : selPart;
    const selectedId = changedSelect.value; const currentTargetValue = targetSelect.value; 
    if (!selectedId) {
        const options = window.cachedStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
        const placeholder = `<option value="" selected>${window.t('select_placeholder')}</option>`;
        targetSelect.innerHTML = placeholder + options; targetSelect.value = currentTargetValue; return;
    }
    if(window.flashInputFeedback) window.flashInputFeedback((source === 'partenza') ? 'selPartenza' : 'selArrivo');
    try {
        const { data: corsePassanti } = await window.supabaseClient.from('Orari_bus').select('ID_CORSA').eq('ID_FERMATA', selectedId);
        const runIds = corsePassanti.map(c => c.ID_CORSA); if (runIds.length === 0) return; 
        const { data: fermateCollegate } = await window.supabaseClient.from('Orari_bus').select('ID_FERMATA').in('ID_CORSA', runIds);
        const validIds = [...new Set(fermateCollegate.map(x => x.ID_FERMATA))].filter(id => id != selectedId);
        let validStops = window.cachedStops.filter(s => validIds.includes(s.ID)); validStops.sort((a, b) => a.NOME_FERMATA.localeCompare(b.NOME_FERMATA));
        const newOptions = validStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
        const placeholder = `<option value="" disabled selected>${window.t('valid_destinations')}</option>`;
        targetSelect.innerHTML = placeholder + newOptions;
        if (currentTargetValue && validIds.includes(parseInt(currentTargetValue))) { targetSelect.value = currentTargetValue; } else { targetSelect.value = ""; }
    } catch (err) { console.error("Errore filtro bus:", err); }
};

window.handleFerrySelectionChange = function(source) {
    const selPart = document.getElementById('selPartenzaFerry'); const selArr = document.getElementById('selArrivoFerry');
    const stops = window.FERRY_STOPS || [];
    const changedSelect = (source === 'partenza') ? selPart : selArr; const targetSelect = (source === 'partenza') ? selArr : selPart;
    const selectedVal = changedSelect.value; const currentTargetVal = targetSelect.value;
    if(window.flashInputFeedback) window.flashInputFeedback((source === 'partenza') ? 'selPartenzaFerry' : 'selArrivoFerry');
    if (!selectedVal) {
        const options = stops.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
        targetSelect.innerHTML = `<option value="" selected>${window.t('select_placeholder')}</option>` + options;
        targetSelect.value = currentTargetVal; targetSelect.disabled = false; return;
    }
    const validStops = stops.filter(s => s.id !== selectedVal);
    const newOptions = validStops.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
    targetSelect.innerHTML = `<option value="" selected>${window.t('valid_destinations')}</option>` + newOptions;
    if (currentTargetVal && validStops.some(s => s.id === currentTargetVal)) { targetSelect.value = currentTargetVal; } else { targetSelect.value = ""; }
    targetSelect.disabled = false;
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
    const dayBadge = isFestivo ? `<span class="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">📅 ${window.t('badge_holiday')}</span>` : `<span class="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">🏢 ${window.t('badge_weekday')}</span>`;
    const { data, error } = await window.supabaseClient.rpc('trova_bus', { p_partenza_id: partenzaId, p_arrivo_id: arrivoId, p_orario_min: oraScelta, p_is_festivo: isFestivo });
    if (error || !data || data.length === 0) { 
        nextCard.innerHTML = `<div class="text-center py-6 text-white"><div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30"><span class="material-icons text-3xl">event_busy</span></div><strong class="block text-xl mb-1">${window.t('bus_not_found')}</strong><div class="opacity-80 text-sm mb-4">${window.t('bus_try_change')}</div>${dayBadge}</div>`; return; 
    }
    const primo = data[0]; const successivi = data.slice(1);
    nextCard.innerHTML = `<div class="flex justify-between items-start mb-6"><span class="text-[10px] font-bold uppercase tracking-widest text-white/80 border border-white/20 px-2 py-1 rounded-lg bg-black/5">${window.t('next_departure')}</span>${dayBadge}</div><div class="flex items-end justify-between relative z-10"><div><div class="text-6xl font-serif font-bold text-white leading-none tracking-tight shadow-black drop-shadow-md mb-1">${primo.ora_partenza.slice(0,5)}</div><div class="text-sm font-bold text-amber-100 uppercase tracking-widest pl-1">${window.t('departure')}</div></div><div class="text-right pb-1"><div class="text-2xl font-bold text-white/90 leading-none">${primo.ora_arrivo.slice(0,5)}</div><div class="text-[10px] font-bold text-amber-100 uppercase tracking-widest opacity-80">${window.t('arrival')}</div></div></div><div class="mt-6 pt-4 border-t border-white/20 flex items-center justify-between"><div class="flex items-center gap-2"><span class="material-icons text-white/80 text-sm">directions_bus</span><span class="text-xs font-bold text-white uppercase tracking-wide">${primo.nome_linea || 'Bus ATC'}</span></div><span class="material-icons text-white/40 rotate-180">arrow_back</span></div><span class="material-icons absolute -right-4 -bottom-8 text-[140px] text-white opacity-10 rotate-12 pointer-events-none">directions_bus</span>`;
    if (successivi.length === 0) { list.innerHTML = `<div class="text-center text-slate-400 text-xs py-4 font-bold uppercase tracking-widest">${window.t('no_runs_today')}</div>`; } else { list.innerHTML = successivi.map(b => `<div class="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-amber-100 cursor-default"><div class="flex items-center gap-4"><div class="flex flex-col"><span class="text-xl font-bold text-slate-700 leading-none group-hover:text-amber-600 transition-colors">${b.ora_partenza.slice(0,5)}</span><span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">${window.t('departure')}</span></div><div class="flex flex-col items-center px-1 opacity-40"><span class="material-icons text-slate-400 text-sm">arrow_forward</span></div><div class="flex flex-col"><span class="text-lg font-bold text-slate-500 leading-none">${b.ora_arrivo.slice(0,5)}</span><span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">${window.t('arrival')}</span></div></div><div class="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors"><span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-amber-600">Bus</span></div></div>`).join(''); }
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
    nextCard.innerHTML = `<div class="flex justify-between items-start mb-6"><span class="text-[10px] font-bold uppercase tracking-widest text-white/80 border border-white/20 px-2 py-1 rounded-lg bg-black/5">${window.t('next_departure')}</span><span class="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">🌊 ${window.t('ferry_label')}</span></div><div class="flex items-end justify-between relative z-10"><div><div class="text-6xl font-serif font-bold text-white leading-none tracking-tight shadow-black drop-shadow-md mb-1">${primo[startCol].slice(0,5)}</div><div class="text-sm font-bold text-cyan-100 uppercase tracking-widest pl-1">${window.t('departure')}</div></div><div class="text-right pb-1"><div class="text-2xl font-bold text-white/90 leading-none">${primo[endCol].slice(0,5)}</div><div class="text-[10px] font-bold text-cyan-100 uppercase tracking-widest opacity-80">${window.t('arrival')}</div></div></div><div class="mt-6 pt-4 border-t border-white/20 flex items-center justify-between"><div class="flex items-center gap-2"><span class="material-icons text-white/80 text-sm">explore</span><span class="text-xs font-bold text-white uppercase tracking-wide">${window.t('direction_dir')} ${primo.direzione || window.t('coast')}</span></div></div><span class="material-icons absolute -right-6 -bottom-6 text-[140px] text-white opacity-10 rotate-[-10deg] pointer-events-none">sailing</span>`;
    if (successivi.length === 0) { list.innerHTML = `<div class="text-center text-slate-400 text-xs py-4 font-bold uppercase tracking-widest">${window.t('last_run_day')}</div>`; } else { list.innerHTML = successivi.map(run => `<div class="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-cyan-100 cursor-default"><div class="flex items-center gap-4"><div class="flex flex-col"><span class="text-xl font-bold text-slate-700 leading-none group-hover:text-cyan-600 transition-colors">${run[startCol].slice(0,5)}</span><span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">${window.t('departure')}</span></div><div class="flex flex-col items-center px-1 opacity-40"><span class="material-icons text-slate-400 text-sm">arrow_forward</span></div><div class="flex flex-col"><span class="text-lg font-bold text-slate-500 leading-none">${run[endCol].slice(0,5)}</span><span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">${window.t('arrival')}</span></div></div><div class="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-colors"><span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-cyan-600">Ferry</span></div></div>`).join(''); }
};

window.initBusMap = function(fermate) {
    const mapContainer = document.getElementById('bus-map');
    if (!mapContainer) return;
    if (window.currentBusMap) { window.currentBusMap.remove(); window.currentBusMap = null; }
    const map = L.map('bus-map').setView([44.1000, 9.7385], 13);
    window.currentBusMap = map; 
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap, © CARTO', subdomains: 'abcd', maxZoom: 20 }).addTo(map);
    const markersGroup = new L.FeatureGroup();
    const labelPartenza = window.t('departure') || 'Partenza';
    const labelArrivo = window.t('arrival') || 'Arrivo';
    fermate.forEach(f => {
        if (!f.LAT || !f.LONG) return;
        const marker = L.marker([f.LAT, f.LONG]).addTo(map);
        marker.bindPopup(`<div style="text-align:center; min-width:150px;"><h3 style="margin:0 0 10px 0; font-size:1rem; color:#333;">${f.NOME_FERMATA}</h3><div style="display:flex; gap:5px; justify-content:center;"><button onclick="setBusStop('partenza', '${f.ID}')" class="btn-popup-start" style="background:#27ae60; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.75rem; font-weight:bold; text-transform:uppercase;">${labelPartenza}</button><button onclick="setBusStop('arrivo', '${f.ID}')" class="btn-popup-end" style="background:#c0392b; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.75rem; font-weight:bold; text-transform:uppercase;">${labelArrivo}</button></div></div>`);
        markersGroup.addLayer(marker);
    });
    map.addLayer(markersGroup);
    setTimeout(() => { map.invalidateSize(); }, 200);
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

window.loadAllStops = async function() {
    const selPart = document.getElementById('selPartenza'); const selArr = document.getElementById('selArrivo');
    if(!selPart || !selArr) return;
    if (!window.cachedStops) { const { data, error } = await window.supabaseClient.from('Fermate_bus').select('ID, NOME_FERMATA, LAT, LONG').order('NOME_FERMATA', { ascending: true }); if (error) { console.error("Errore fermate:", error); return; } window.cachedStops = data; }
    const options = window.cachedStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
    const placeholderStart = `<option value="" selected>${window.t('select_start')}</option>`;
    const placeholderEnd = `<option value="" selected>${window.t('select_arrival_placeholder')}</option>`; 
    selPart.innerHTML = placeholderStart + options; selArr.innerHTML = placeholderEnd + options; selPart.disabled = false; selArr.disabled = false;
    if (window.initBusMap) window.initBusMap(window.cachedStops);
};

window.handleBusSelectionChange = async function(source) {
    const selPart = document.getElementById('selPartenza'); const selArr = document.getElementById('selArrivo');
    if (!selPart || !selArr || !window.cachedStops) return;
    const changedSelect = (source === 'partenza') ? selPart : selArr; const targetSelect = (source === 'partenza') ? selArr : selPart;
    const selectedId = changedSelect.value; const currentTargetValue = targetSelect.value; 
    if (!selectedId) {
        const options = window.cachedStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
        const placeholder = `<option value="" selected>${window.t('select_placeholder')}</option>`;
        targetSelect.innerHTML = placeholder + options; targetSelect.value = currentTargetValue; return;
    }
    if(window.flashInputFeedback) window.flashInputFeedback((source === 'partenza') ? 'selPartenza' : 'selArrivo');
    try {
        const { data: corsePassanti } = await window.supabaseClient.from('Orari_bus').select('ID_CORSA').eq('ID_FERMATA', selectedId);
        const runIds = corsePassanti.map(c => c.ID_CORSA); if (runIds.length === 0) return; 
        const { data: fermateCollegate } = await window.supabaseClient.from('Orari_bus').select('ID_FERMATA').in('ID_CORSA', runIds);
        const validIds = [...new Set(fermateCollegate.map(x => x.ID_FERMATA))].filter(id => id != selectedId);
        let validStops = window.cachedStops.filter(s => validIds.includes(s.ID)); validStops.sort((a, b) => a.NOME_FERMATA.localeCompare(b.NOME_FERMATA));
        const newOptions = validStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
        const placeholder = `<option value="" disabled selected>${window.t('valid_destinations')}</option>`;
        targetSelect.innerHTML = placeholder + newOptions;
        if (currentTargetValue && validIds.includes(parseInt(currentTargetValue))) { targetSelect.value = currentTargetValue; } else { targetSelect.value = ""; }
    } catch (err) { console.error("Errore filtro bus:", err); }
};

window.handleFerrySelectionChange = function(source) {
    const selPart = document.getElementById('selPartenzaFerry'); const selArr = document.getElementById('selArrivoFerry');
    const stops = window.FERRY_STOPS || [];
    const changedSelect = (source === 'partenza') ? selPart : selArr; const targetSelect = (source === 'partenza') ? selArr : selPart;
    const selectedVal = changedSelect.value; const currentTargetVal = targetSelect.value;
    if(window.flashInputFeedback) window.flashInputFeedback((source === 'partenza') ? 'selPartenzaFerry' : 'selArrivoFerry');
    if (!selectedVal) {
        const options = stops.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
        targetSelect.innerHTML = `<option value="" selected>${window.t('select_placeholder')}</option>` + options;
        targetSelect.value = currentTargetVal; targetSelect.disabled = false; return;
    }
    const validStops = stops.filter(s => s.id !== selectedVal);
    const newOptions = validStops.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
    targetSelect.innerHTML = `<option value="" selected>${window.t('valid_destinations')}</option>` + newOptions;
    if (currentTargetVal && validStops.some(s => s.id === currentTargetVal)) { targetSelect.value = currentTargetVal; } else { targetSelect.value = ""; }
    targetSelect.disabled = false;
};

window.flashInputFeedback = function(elementId) {
    const el = document.getElementById(elementId);
    if (el && el.parentElement && el.parentElement.parentElement) {
        const wrapper = el.parentElement.parentElement; wrapper.classList.add('bg-slate-100', 'rounded-lg');
        setTimeout(() => wrapper.classList.remove('bg-slate-100', 'rounded-lg'), 300);
    }
};