console.log("✅ 6. app.js caricato (Fixed Header & Filters)");

const content = document.getElementById('app-content');
window.pendingMaps = []; 

// --- 1. SETUP HEADER (Nuovo Design Icona) ---
function setupHeaderElements() {
    const header = document.querySelector('header');
    
    // Rimuove vecchi elementi
    const oldActions = header.querySelector('.header-actions');
    if (oldActions) oldActions.remove();

    if (window.currentViewName !== 'home') return; 

    // Crea contenitore per l'icona
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'header-actions animate-fade fixed top-5 right-5 z-[60]'; 
    actionsContainer.id = 'header-btn-lang'; 

    const currFlag = window.AVAILABLE_LANGS.find(l => l.code === window.currentLang)?.flag || '🌍';

    // Dropdown minimale
    actionsContainer.innerHTML = `
        <div class="relative">
            <button class="w-10 h-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform" onclick="toggleLangDropdown(event)">
                <span class="text-xl filter drop-shadow-sm">${currFlag}</span>
            </button>
            <div class="absolute top-12 right-0 bg-white rounded-2xl shadow-xl p-2 min-w-[150px] opacity-0 invisible -translate-y-2 transition-all duration-200 origin-top-right z-[70]" id="lang-dropdown">
                ${window.AVAILABLE_LANGS.map(l => `
                    <button class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-left text-slate-700 font-bold ${l.code === window.currentLang ? 'bg-indigo-50 text-indigo-600' : ''}" onclick="changeLanguage('${l.code}')">
                        <span class="text-lg">${l.flag}</span> <span class="text-sm">${l.label}</span>
                    </button>
                `).join('')}
            </div>
        </div>`;
    
    header.appendChild(actionsContainer);
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

window.changeLanguage = function(langCode) {
    window.currentLang = langCode;
    localStorage.setItem('app_lang', langCode);
    setupHeaderElements(); 
    updateNavBar(); 
    
    // Refresh vista
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

window.toggleLangDropdown = function(event) {
    event.stopPropagation();
    const dd = document.getElementById('lang-dropdown');
    if(dd) {
        dd.classList.toggle('opacity-100');
        dd.classList.toggle('visible');
        dd.classList.toggle('translate-y-0');
    }
};

window.addEventListener('click', () => {
    const dd = document.getElementById('lang-dropdown');
    if(dd) {
        dd.classList.remove('opacity-100', 'visible', 'translate-y-0');
    }
});

// --- SWITCH VIEW ---
window.switchView = async function(view, el) {
    if (!content) return;
    window.currentViewName = view; 
    
    if (view === 'home') {
        document.body.style.backgroundColor = '#1a1a1a'; 
    } else {
        document.body.style.backgroundColor = '#F4F1DE'; 
    }

    const mascot = document.getElementById('mascot-container');
    if (mascot) mascot.remove();
    document.body.classList.remove('is-home');
    
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

    content.innerHTML = `
    <div class="fixed inset-0 z-0 overflow-hidden">
        <img src="${bgImage}" class="w-full h-full object-cover animate-fade" alt="Cinque Terre" style="animation-duration: 2s;">
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80"></div>
    </div>

    <div class="relative z-10 flex flex-col items-center justify-end h-[85vh] pb-24 px-6 text-center animate-pop">
        <h1 class="text-5xl font-serif font-bold text-white mb-2 drop-shadow-xl tracking-tight">Five2Go</h1>
        <p class="text-white/90 text-sm font-medium mb-8 max-w-xs mx-auto leading-relaxed shadow-black drop-shadow-md">La tua guida essenziale per vivere la magia delle Cinque Terre.</p>
        
        <div class="grid grid-cols-3 gap-3 w-full max-w-sm">
            ${window.AVAILABLE_LANGS.map(l => `
                <button class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-3 flex flex-col items-center justify-center transition-all active:scale-95 active:bg-white/20 text-white hover:border-white/50" onclick="changeLanguage('${l.code}')">
                    <span class="text-3xl mb-1 drop-shadow-md">${l.flag}</span>
                    <span class="text-[10px] font-bold uppercase tracking-widest opacity-80">${l.label}</span>
                </button>
            `).join('')}
        </div>
    </div>`;

    const oldMascot = document.getElementById('mascot-container');
    if (oldMascot) oldMascot.remove();

    const chiccoStaticUrl = "https://res.cloudinary.com/dkg0jfady/image/upload/v1770579869/chicco_wxxwbm.png";
    const chiccoLottieUrl = "https://res.cloudinary.com/dkg0jfady/raw/upload/v1770754341/chicco.json"; 

    const mascotHTML = `
    <div id="mascot-container" class="fixed bottom-24 right-4 z-50 flex flex-col items-end pointer-events-none">
        <div id="chicco-bubble" class="hidden animate-fade bg-white p-4 rounded-t-2xl rounded-bl-2xl shadow-xl mb-2 max-w-[220px] text-sm text-slate-700 border-2 border-ct-terracotta pointer-events-auto">
            <span id="chicco-text">Ciao!</span>
        </div>
        <div onclick="window.toggleChicco()" class="cursor-pointer transition-transform active:scale-90 pointer-events-auto w-[100px] h-[100px] relative">
            <img id="chicco-static" src="${chiccoStaticUrl}" class="w-full h-auto drop-shadow-lg absolute bottom-0 right-0 hover:scale-110 transition-transform" alt="Chicco">
            <lottie-player id="chicco-anim" src="${chiccoLottieUrl}" background="transparent" speed="1" class="w-[120px] h-[120px] hidden absolute -bottom-2 -right-2" loop></lottie-player>
        </div>
    </div>`;

    content.insertAdjacentHTML('beforeend', mascotHTML);

    if (!document.querySelector('script[src*="lottie-player"]')) {
        const script = document.createElement('script');
        script.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
        document.head.appendChild(script);
    }
    
    if (!localStorage.getItem('chicco_intro_done')) {
        window.chiccoAutoOpenTimer = setTimeout(() => {
            const isChatOpen = document.querySelector('.chicco-chat-wrapper');
            if (!isChatOpen) {
                window.toggleChicco();
                localStorage.setItem('chicco_intro_done', 'true');
            }
        }, 5000);
    }
}

// 1. RENDER MENU 
function renderSubMenu(options, defaultTable) {
    let menuHtml = `
    <div class="nav-sticky-header sticky top-0 z-30 bg-ct-sand/95 backdrop-blur-md py-4 -mx-5 px-5 shadow-sm mb-4 flex items-center justify-between gap-3 border-b border-stone-200/50">
        
        <div class="nav-scroll-container flex gap-3 overflow-x-auto no-scrollbar items-center flex-1 pr-2 pb-1">
            ${options.map(opt => {
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
                <button class="btn-pop-menu flex-shrink-0 px-4 py-2.5 rounded-2xl flex items-center gap-2 border transition-all duration-200 ${theme}" onclick="loadTableData('${opt.table}', this)">
                    <span class="material-icons text-lg opacity-80">${icon}</span>
                    <span class="text-xs font-bold uppercase tracking-wide">${opt.label}</span>
                </button>
            `}).join('')}
        </div>
        
        <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-ct-sand to-transparent pointer-events-none"></div>

    </div>
    <div id="sub-content" class="min-h-[300px]"></div>`;
    
    content.innerHTML = menuHtml;
    
    const firstBtn = content.querySelector('.btn-pop-menu');
    if (firstBtn) {
        loadTableData(defaultTable, firstBtn);
    }
}

window.loadTableData = async function(tableName, btnEl) {
    const subContent = document.getElementById('sub-content');
    if (!subContent) return;

    if (btnEl) {
        document.querySelectorAll('.btn-pop-menu').forEach(b => {
            b.classList.remove('ring-2', 'ring-offset-1', 'ring-stone-300', 'scale-105');
        });
        btnEl.classList.add('ring-2', 'ring-offset-1', 'ring-stone-300', 'scale-105'); 
    }

    if (!window.appCache[tableName]) {
        subContent.innerHTML = `<div class="py-20 flex flex-col items-center justify-center gap-4">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-ct-terracotta"></div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Caricamento...</p>
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

    // --- RENDERER ROUTING ---
    if (tableName === 'Vini') {
        renderHorizontalFilterView(data, 'Tipo', subContent, window.vinoRenderer);
    }
    else if (tableName === 'Spiagge') {
        renderHorizontalFilterView(data, 'Paesi', subContent, window.spiaggiaRenderer);
    }
    else if (tableName === 'Prodotti') {
        let html = '<div class="grid grid-cols-2 gap-3 pb-24 animate-fade pt-2">'; 
        data.forEach(p => { html += window.prodottoRenderer(p); });
        subContent.innerHTML = html + '</div>';
    }
    else if (tableName === 'Attrazioni') { 
        const culturaConfig = {
            primary: { key: 'Paese', title: 'Borgo', customOrder: ["Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso"] },
            secondary: { key: 'Label', title: 'Categoria' }
        };
        renderDoubleHorizontalFilterView(data, culturaConfig, subContent, window.attrazioniRenderer); 
    }
    else if (tableName === 'Ristoranti') { 
        renderHorizontalFilterView(data, 'Paesi', subContent, window.ristoranteRenderer); 
    }
    else if (tableName === 'Sentieri') { 
        renderHorizontalFilterView(data, 'difficolta_cai', subContent, window.sentieroRenderer); 
    }
    else if (tableName === 'Farmacie') { 
        subContent.innerHTML = `<div class="flex flex-col gap-3 pb-24 animate-fade pt-2">` + 
            data.map(i => window.farmacieRenderer(i)).join('') + `</div>`;
    } 
    else if (tableName === 'Numeri_utili') { 
        renderHorizontalFilterView(data, 'Comune', subContent, window.numeriUtiliRenderer); 
    }
};

/* ============================================================
   SMART FILTER BAR (FIXED INIT & SCROLL)
   ============================================================ */

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

// 1. SMART FILTER SINGOLO
// --- SMART FILTER (Aggiornato con window.t) ---

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
// Helper Toggle Globale
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
    console.log("🔘 Avvio renderServicesGrid (Authentic 5 Terre)...");
    const targetEl = document.getElementById('app-content');
    
    // Rimuovi eventuali filtri residui
    const stickyFilters = document.querySelectorAll('.smart-filter-bar-container');
    stickyFilters.forEach(el => el.remove());

    if (!targetEl) return;

    let headerHtml = `
        <div class="px-2 mb-6 animate-pop text-center">
            <h1 class="text-3xl font-serif font-bold text-slate-800 mb-1 uppercase tracking-tight">${window.t('nav_services')}</h1>
            <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Esplora & Viaggia</p>
        </div>
    `;

    let gridHtml = `
    <div class="grid grid-cols-2 gap-4 pb-32 animate-pop">
        
        <div class="col-span-2 relative bg-ct-yellow rounded-[2rem] p-6 shadow-soft active:scale-95 transition-transform cursor-pointer overflow-hidden group min-h-[140px] flex flex-col justify-between border border-yellow-200" onclick="openModal('transport', 'bus')">
            <div class="absolute -right-2 -bottom-4 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-500"><span class="material-icons text-[130px] text-yellow-900">directions_bus</span></div>
            <div class="relative z-10">
                <div class="bg-white/80 backdrop-blur w-11 h-11 rounded-xl flex items-center justify-center mb-3 shadow-sm border border-white"><span class="material-icons text-2xl text-yellow-700">directions_bus</span></div>
                <h3 class="text-3xl font-serif font-bold leading-none text-slate-800 mb-1">${window.t('label_bus')}</h3>
                <p class="text-yellow-800 text-[10px] font-bold uppercase tracking-widest">Orari ATC & Navette</p>
            </div>
        </div>

        <div class="bg-ct-terracotta rounded-[2rem] p-5 shadow-soft active:scale-95 transition-transform cursor-pointer flex flex-col justify-between group h-full min-h-[150px] relative overflow-hidden" onclick="openModal('transport', 'train')">
            <div class="absolute -right-4 -bottom-4 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500"><span class="material-icons text-[110px] text-white">train</span></div>
            <div class="relative z-10">
                <div class="bg-white/20 backdrop-blur w-11 h-11 rounded-xl flex items-center justify-center mb-3 border border-white/30"><span class="material-icons text-2xl text-white">train</span></div>
                <div>
                    <h3 class="font-serif font-bold text-white text-xl leading-tight mb-1">${window.t('label_train')}</h3>
                    <p class="text-red-100 text-[9px] font-bold uppercase tracking-widest">Orari Trenitalia</p>
                </div>
            </div>
        </div>

        <div class="bg-ct-blue rounded-[2rem] p-5 shadow-soft active:scale-95 transition-transform cursor-pointer flex flex-col justify-between group h-full min-h-[150px] relative overflow-hidden" onclick="openModal('transport', 'ferry')">
            <div class="absolute -right-4 -bottom-4 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform duration-500"><span class="material-icons text-[110px] text-white">directions_boat</span></div>
            <div class="relative z-10">
                <div class="bg-white/20 backdrop-blur w-11 h-11 rounded-xl flex items-center justify-center mb-3 border border-white/30"><span class="material-icons text-2xl text-white">directions_boat</span></div>
                <div>
                    <h3 class="font-serif font-bold text-white text-xl leading-tight mb-1">${window.t('label_ferry')}</h3>
                    <p class="text-teal-100 text-[9px] font-bold uppercase tracking-widest">Navigazione</p>
                </div>
            </div>
        </div>

        <div class="col-span-2 bg-slate-700 rounded-[2rem] p-5 flex items-center justify-between shadow-soft active:scale-95 transition-transform cursor-pointer mt-2" onclick="renderSimpleList('Numeri_utili')">
            <div class="flex items-center gap-4 relative z-10">
                <div class="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20"><span class="material-icons text-2xl">phonelink_ring</span></div>
                <div><h3 class="font-serif text-white font-bold text-xl leading-tight">${window.t('menu_num')}</h3><p class="text-slate-300 text-[10px] font-bold uppercase tracking-widest mt-0.5">Emergenze & Taxi</p></div>
            </div>
            <span class="material-icons text-white/50 bg-white/5 rounded-full p-1 relative z-10">chevron_right</span>
        </div>

        <div class="col-span-2 bg-ct-green rounded-[2rem] p-5 flex items-center justify-between shadow-soft active:scale-95 transition-transform cursor-pointer" onclick="renderSimpleList('Farmacie')">
            <div class="flex items-center gap-4 relative z-10">
                <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white border border-white/30"><span class="material-icons text-2xl">medical_services</span></div>
                <div><h3 class="font-serif text-white font-bold text-xl leading-tight">${window.t('menu_pharm')}</h3><p class="text-green-100 text-[10px] font-bold uppercase tracking-widest mt-0.5">Turni e Orari</p></div>
            </div>
            <span class="material-icons text-white/50 bg-white/10 rounded-full p-1 relative z-10">chevron_right</span>
        </div>

        <div class="col-span-2 text-center mt-6 mb-4">
            <button onclick="renderLegalPage()" class="text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-ct-terracotta transition-colors flex items-center justify-center gap-2 mx-auto py-3 bg-white px-6 rounded-full shadow-sm border border-slate-200">
                <span class="material-icons text-sm">policy</span> ${window.t('menu_legal')}
            </button>
        </div>
    </div>`; 

    targetEl.innerHTML = headerHtml + gridHtml;
};

window.renderSimpleList = function(tableName) {
    const targetEl = document.getElementById('app-content');
    const cleanTitle = tableName.replace('_', ' ');
    
    // Header specifico per liste semplici
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
    if (box) { box.style.display = (box.style.display === 'none') ? 'block' : 'none'; }
};

document.addEventListener('DOMContentLoaded', () => {
    window.currentViewName = 'home'; 
    setupHeaderElements(); 
    updateNavBar(); 
    switchView('home');
});

window.apriTrenitalia = function() {
    window.open('https://www.trenitalia.com', '_blank');
};
// ============================================================
// FUNZIONE PER ACCENDERE LE MAPPE NELLA LISTA
// ============================================================

// --- MAPPA SCHEDA TECNICA (Grande) ---
function initLeafletMap(divId, gpxUrl) {
    if (!document.getElementById(divId)) return;
    
    // Pulizia
    if (window.currentMap) { 
        window.currentMap.off();
        window.currentMap.remove(); 
        window.currentMap = null; 
    }
    document.getElementById('elevation-div').innerHTML = '';

    // Mappa Grande: COMPLETAMENTE INTERATTIVA
    const map = L.map(divId, {
        zoomControl: false, // Lo aggiungiamo dopo
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        tap: true
    });

    // Aggiungo zoom in basso a destra
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    window.currentMap = map;
    map.setView([44.118, 9.711], 13); 

    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 16, attribution: 'OpenTopoMap'
    }).addTo(map);

    if (gpxUrl) {
        try {
            // TENTATIVO GRAFICO ALTIMETRICO (Tuo codice originale)
            const elevationOptions = {
                theme: "steelblue-theme",
                detached: true,
                elevationDiv: "#elevation-div",
                xAttr: 'dist', yAttr: 'altitude', 
                time: false, summary: false, followMarker: true,
                margins: { top: 20, right: 20, bottom: 20, left: 50 },
                polyline: { color: '#D32F2F', opacity: 0.9, weight: 5 }
            };
            L.control.elevation(elevationOptions).addTo(map).load(gpxUrl);
        } catch (e) {
            // Fallback
            new L.GPX(gpxUrl, { async: true, polyline_options: { color: 'red' } })
              .on('loaded', e => map.fitBounds(e.target.getBounds())).addTo(map);
        }
    }
    setTimeout(() => { map.invalidateSize(); }, 300);
}

// --- MAPPE LISTA (Piccole) ---
// --- MAPPE LISTA (Con Start/End Label da Database) ---
window.initPendingMaps = function() {
    console.log("Rendering mappe con etichette...");
    
    window.pendingMaps.forEach(item => {
        const container = document.getElementById(item.id);
        if (container && !container._leaflet_id) { 
            
            const map = L.map(item.id, {
                zoomControl: false, scrollWheelZoom: false, dragging: false,         
                touchZoom: false, doubleClickZoom: false, boxZoom: false,
                tap: false, attributionControl: false, keyboard: false
            });

            map.dragging.disable();
            map.touchZoom.disable();
            map.doubleClickZoom.disable();
            if (map.tap) map.tap.disable();

            // Sfondo Semplice (CartoDB)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                maxZoom: 20
            }).addTo(map);

            // Caricamento GPX
            new L.GPX(item.gpx, {
                async: true,
                marker_options: { startIconUrl: null, endIconUrl: null, shadowUrl: null },
                polyline_options: { color: '#D32F2F', opacity: 1, weight: 4 }
            }).on('loaded', function(e) {
                const gpxLayer = e.target;
                map.fitBounds(gpxLayer.getBounds(), { padding: [20, 20] }); 

                // --- LOGICA PER ETICHETTE START/END ---
                // Cerchiamo le coordinate dentro i layer del GPX
                let layers = gpxLayer.getLayers();
                let points = [];
                
                // Estrae i punti dalla linea del percorso
                layers.forEach(layer => {
                    if (layer instanceof L.Polyline) {
                        const latlngs = layer.getLatLngs();
                        // Gestisce gpx complessi (array di array) o semplici
                        if (latlngs.length > 0) {
                            if (Array.isArray(latlngs[0])) { 
                                latlngs.forEach(segment => points = points.concat(segment));
                            } else {
                                points = points.concat(latlngs);
                            }
                        }
                    }
                });

                if (points.length > 0) {
                    const startPoint = points[0];
                    const endPoint = points[points.length - 1];

                    // Funzione helper per creare l'icona HTML
                    const createLabelIcon = (text, color, isStart) => {
                        return L.divIcon({
                            className: 'custom-map-label',
                            html: `
                                <div style="display:flex; flex-direction:column; align-items:center;">
                                    <div style="background:white; padding:2px 6px; border-radius:4px; border:1px solid #ccc; font-size:10px; font-weight:bold; color:#333; white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2); margin-bottom:2px;">
                                        ${text}
                                    </div>
                                    <div style="width:10px; height:10px; background:${color}; border:2px solid white; border-radius:50%; box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>
                                </div>
                            `,
                            iconSize: [100, 40], // Dimensione contenitore virtuale
                            iconAnchor: [50, 38] // Punta esattamente sul pallino (regolato per centrare)
                        });
                    };

                    // Aggiungi Marker PARTENZA (Se c'è il nome nel DB)
                    if (item.startLabel) {
                        L.marker(startPoint, { 
                            icon: createLabelIcon(item.startLabel, '#27ae60', true),
                            interactive: false 
                        }).addTo(map);
                    }

                    // Aggiungi Marker ARRIVO (Se c'è il nome nel DB)
                    if (item.endLabel) {
                        L.marker(endPoint, { 
                            icon: createLabelIcon(item.endLabel, '#c0392b', false),
                            interactive: false
                        }).addTo(map);
                    }
                }

            }).addTo(map);
        }
    });

    window.pendingMaps = [];
};

// ============================================================
// FUNZIONE GPS
// ============================================================
window.watchId = null;    
window.userMarker = null; 

window.toggleGPS = function() {
    const map = window.currentMap;
    const btn = document.getElementById('btn-gps');
    
    if (!map) return;

    if (window.watchId !== null) {
        navigator.geolocation.clearWatch(window.watchId);
        window.watchId = null;
        
        if (window.userMarker) {
            map.removeLayer(window.userMarker);
            window.userMarker = null;
        }

        btn.style.backgroundColor = '#29B6F6'; 
        btn.innerHTML = '<span class="material-icons">my_location</span> GPS';
        return;
    }

    if (!navigator.geolocation) {
        alert("GPS non supportato dal tuo browser.");
        return;
    }

    btn.innerHTML = '<span class="material-icons spin">refresh</span> Cerco...';
    btn.style.backgroundColor = '#f39c12'; 

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    window.watchId = navigator.geolocation.watchPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = pos.coords.accuracy;

            if (!window.userMarker) {
                window.userMarker = L.circleMarker([lat, lng], {
                    radius: 8,
                    fillColor: "#2196F3",
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 1
                }).addTo(map);
                
                map.setView([lat, lng], 15);
                
                btn.innerHTML = '<span class="material-icons">stop_circle</span> Stop';
                btn.style.backgroundColor = '#c0392b'; 
            } else {
                window.userMarker.setLatLng([lat, lng]);
            }
        },
        (err) => {
            console.error("Errore GPS:", err);
            alert("Impossibile trovare la posizione. Verifica i permessi GPS.");
            btn.innerHTML = '<span class="material-icons">error</span> Err';
            btn.style.backgroundColor = '#7f8c8d';
            window.watchId = null;
        },
        options
    );
};

const originalCloseModal = window.closeModal;
window.closeModal = function() {
    if (window.watchId !== null) {
        navigator.geolocation.clearWatch(window.watchId);
        window.watchId = null;
        window.userMarker = null;
    }
    if(originalCloseModal) originalCloseModal();
};
window.toggleChicco = async function() {
    console.log("🍇 Click rilevato su Chicco!");

    const bubble = document.getElementById('chicco-bubble');
    const textSpan = document.getElementById('chicco-text');
    
    // Elementi Visivi
    const staticImg = document.getElementById('chicco-static'); 
    const lottieAnim = document.getElementById('chicco-anim');
    
    if (!bubble || !textSpan) return;

    // --- SE È CHIUSO -> APRI ---
    if (bubble.style.display === 'none' || bubble.style.display === '') {
        console.log("🔹 Apro il fumetto (Loading)...");
        
        // 1. MOSTRA SOLO IL FUMETTO (Chicco resta fermo mentre carica)
        bubble.style.display = 'block';
        textSpan.innerHTML = `Mmh... <span class="material-icons spin" style="font-size:0.9rem;">sync</span>`;
        
        // 2. CHIAMATA DATI (Aspettiamo qui finché non risponde!)
        let info = { weather: "Errore", advice: "Non riesco a connettermi.", action: null };
        
        if (window.getChiccoRealTimeAdvice) {
            // Qui il codice si "blocca" finché i dati non arrivano
            info = await window.getChiccoRealTimeAdvice(); 
        }

        // 3. DATI ARRIVATI: AGGIORNA IL TESTO
        textSpan.innerHTML = `
            <div style="font-size:0.85rem; color:#555; margin-bottom:5px;">${info.weather}</div>
            <div style="font-weight:bold; color:#8E44AD; margin-bottom:8px;">${info.advice}</div>
            ${info.action ? `<button onclick="viaggiaConChicco('${info.action}')" style="background:#8E44AD; color:white; border:none; padding:4px 10px; border-radius:10px; font-size:0.75rem; cursor:pointer; width:100%; margin-top:5px;">${info.btnLabel} ➜</button>` : ''}
        `;

        // 4. ORA (E SOLO ORA) FAI PARTIRE L'ANIMAZIONE
        console.log("🔹 Dati pronti: Avvio animazione...");
        
        if (staticImg) staticImg.style.display = 'none'; // Via statico
        if (lottieAnim) {
            lottieAnim.style.display = 'block'; // Dentro animato
            lottieAnim.loop = true; 
            lottieAnim.play();
            
            // --- LOGICA 2 GIRI ESATTI ---
            let loopCount = 0;
            const stopAfterTwo = () => {
                loopCount++;
                // Appena finisce il 1° giro (loopCount = 1), gli diciamo:
                // "Fai ancora un giro e poi basta" (togliendo il loop)
                if (loopCount >= 1) {
                    lottieAnim.loop = false; 
                    lottieAnim.removeEventListener('loop', stopAfterTwo);
                }
            };
            
            // Pulizia e attivazione listener
            lottieAnim.removeEventListener('loop', stopAfterTwo);
            lottieAnim.addEventListener('loop', stopAfterTwo);
        }

    } 
    // --- SE È APERTO -> CHIUDI ---
    else {
        console.log("🔸 Chiudo il fumetto...");
        bubble.style.display = 'none';

        // RESET COMPLETO: Via animazione, torna statico
        if (lottieAnim) {
            lottieAnim.stop();
            lottieAnim.style.display = 'none';
        }
        if (staticImg) staticImg.style.display = 'block';
    }
};