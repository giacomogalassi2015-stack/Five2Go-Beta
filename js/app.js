
const content = document.getElementById('app-content');
window.pendingMaps = [];

// ─────────────────────────────────────────────────────────────────────────
//  HISTORY ROUTER
// ─────────────────────────────────────────────────────────────────────────
window._historyNav = true;

window._pushViewState = function(view) {
    if (!window._historyNav) return;
    history.pushState({ view }, '', '#/' + view);
};

window._pushModalState = function() {
    if (!window._historyNav) return;
    history.pushState({ modal: true }, '');
};

window.addEventListener('popstate', function(e) {
    const state = e.state;

    const techModal    = document.getElementById('tech-modal-overlay');
    const reportModal  = document.getElementById('report-modal-overlay');
    const confirmModal = document.getElementById('f2g-confirm-overlay');
    const geoModal     = document.getElementById('geo-modal-overlay');
    const genericModal = document.querySelector('.fixed.z-\\[100\\]');

    if (techModal)    { window.closeModal ? window.closeModal() : techModal.remove(); return; }
    if (reportModal)  { reportModal.remove(); return; }
    if (confirmModal) { confirmModal.remove(); return; }
    if (geoModal)     { geoModal.remove(); return; }
    if (genericModal) {
        if (window._dismissModal) window._dismissModal(genericModal);
        else { genericModal.classList.add('opacity-0'); setTimeout(() => genericModal.remove(), 200); }
        return;
    }

    window._historyNav = false;
    if (state?.view) {
        const navBtn = document.querySelector(`.nav-item[onclick*="${state.view}"]`);
        switchView(state.view, navBtn);
    } else {
        switchView('home', document.querySelector('.nav-item[onclick*="home"]'));
    }
    window._historyNav = true;
});

// ─────────────────────────────────────────────────────────────────────────
//  SWIPE GLOBALS
// ─────────────────────────────────────────────────────────────────────────
window.currentMenuOptions = [];
window.currentActiveTable = null;
window.touchStartX = 0;
window.touchStartY = 0;

// ─────────────────────────────────────────────────────────────────────────
//  NAV / HEADER
// ─────────────────────────────────────────────────────────────────────────
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
        const curr = window.AVAILABLE_LANGS.find(l => l.code === window.currentLang);
        flagEl.textContent = curr?.flag || '🌍';
    }
}

window.changeLanguage = function(langCode) {
    window.currentLang = langCode;
    localStorage.setItem('app_lang', langCode);
    updateNavBar();
    updateLangIconInNavBar();

    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav) {
        const m = activeNav.getAttribute('onclick').match(/switchView\('([^']+)'/);
        switchView(m ? m[1] : 'home', activeNav);
    } else {
        switchView('home');
    }
};

// ─────────────────────────────────────────────────────────────────────────
//  SWITCH VIEW — dispatch map (elimina catena if/else)
// ─────────────────────────────────────────────────────────────────────────

/** Applica stili body + background per ogni view */
function _applyViewBodyStyle(view) {
    const body          = document.body;
    const centerBtn     = document.getElementById('center-lang-btn-wrapper');

    if (view === 'home') {
        body.style.backgroundColor = '#0d1f18';
        body.classList.add('is-home');
        centerBtn?.classList.remove('hidden-bump');
        if (window.getSmartUrl) {
            const url = window.getSmartUrl('Manarola', '', 900);
            body.style.backgroundImage    = `url('${url}')`;
            body.style.backgroundSize     = 'cover';
            body.style.backgroundPosition = 'center 40%';
        }
    } else {
        body.style.backgroundColor    = '#F4F1DE';
        body.style.backgroundImage    = '';
        body.style.backgroundSize     = '';
        body.style.backgroundPosition = '';
        body.classList.remove('is-home');
        centerBtn?.classList.add('hidden-bump');
    }
}

/** Pulisce DOM della view precedente */
function _cleanupPreviousView() {
    document.querySelectorAll('.smart-filter-bar-container').forEach(el => el.remove());
    window._destroyScrollFABs?.();
    const chiccoFab = document.getElementById('chicco-fab-wrap');
    if (chiccoFab) chiccoFab.remove();
    window._closeChiccoCard();
}

/** Aggiorna stato attivo nella nav bar */
function _setActiveNav(view, el) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const target = el ?? document.querySelector(`.nav-item[onclick*="${view}"]`);
    target?.classList.add('active');
}

/** Fades out the splash overlay (solo prima volta) */
function _fadeSplash() {
    const overlay = document.getElementById('splash-overlay');
    if (overlay && !overlay.classList.contains('fade-out')) {
        requestAnimationFrame(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.classList.add('gone'), 600);
        });
    }
}

/**
 * Dispatch map: view → renderer function.
 * Aggiungere una nuova view = aggiungere una riga qui.
 */
const _VIEW_RENDERERS = {
    home: () => { renderHome(); _fadeSplash(); },

    cibo: () => renderSubMenu([
        { label: window.t('menu_prod'), table: 'Prodotti',   icon: 'lunch_dining', color: 'orange' },
        { label: window.t('menu_wine'), table: 'Vini',       icon: 'wine_bar',     color: 'red'    },
        { label: window.t('menu_rest'), table: 'Ristoranti', icon: 'restaurant',   color: 'yellow' },
    ], 'Prodotti'),

    outdoor: () => renderSubMenu([
        { label: window.t('menu_monu'),  table: 'Attrazioni', icon: 'attractions',  color: 'blue'  },
        { label: window.t('menu_beach'), table: 'Spiagge',    icon: 'beach_access', color: 'blue'  },
        { label: window.t('menu_trail'), table: 'Sentieri',   icon: 'hiking',       color: 'green' },
    ], 'Attrazioni'),

    mappa:    () => window.renderMappaInterattiva(),
    servizi:  () => renderServicesGrid(),
    wishlist: () => window.renderWishlist(),
    itinerary:() => window.renderWishlist(),   // v1.0 redirect silenzioso
    ct_card:  () => window.renderCinqueTerreCard(),
    treno_card: () => window.renderCinqueTerreTrenoCard(),

    mappe_monumenti: () => renderSubMenu([
        { label: window.t('menu_map'), table: 'Mappe' }
    ], 'Mappe'),
};

window.switchView = async function(view, el) {
    const content = document.getElementById('app-content');
    if (!content) return;

    // Reset scroll istantaneo
    content.style.scrollBehavior = 'auto';
    content.scrollTop = 0;
    requestAnimationFrame(() => { content.style.scrollBehavior = ''; });

    window.currentViewName = view;
    window._pushViewState(view);
    window._closeSearch?.();

    _cleanupPreviousView();
    _applyViewBodyStyle(view);
    _setActiveNav(view, el);

    const renderer = _VIEW_RENDERERS[view];
    if (!renderer) {
        console.warn(`[switchView] Unknown view: "${view}"`);
        return;
    }

    try {
        await renderer();
    } catch (err) {
        console.error('[switchView]', err);
        content.innerHTML = `
            <div class="p-6 text-center text-red-500 bg-red-50 rounded-3xl
                border border-red-200 shadow-sm mx-4 mt-10">
                ${window.t('error')}: ${err.message}
            </div>`;
    }
};

// ─────────────────────────────────────────────────────────────────────────
//  RENDER HOME
// ─────────────────────────────────────────────────────────────────────────
function renderHome() {
    const content = document.getElementById('app-content');
    if (!content) return;

    const lang = window.currentLang || 'it';

    const copy = {
        it: { locationLabel: 'Cinque Terre', tagline: 'Scopri, salva, esplora.<br>Anche senza connessione.',        wishlistLabel: 'Preferiti',  mapLabel: 'Mappa',  searchPlaceholder: 'Cerca ristoranti, spiagge, sentieri…'   },
        en: { locationLabel: 'Cinque Terre', tagline: 'Discover, save, explore.<br>Even without connection.',       wishlistLabel: 'Favourites', mapLabel: 'Map',    searchPlaceholder: 'Search restaurants, beaches, trails…'    },
        fr: { locationLabel: 'Cinque Terre', tagline: 'Découvrez, sauvegardez, explorez.<br>Même hors ligne.',      wishlistLabel: 'Favoris',    mapLabel: 'Carte',  searchPlaceholder: 'Chercher restaurants, plages, sentiers…'  },
        de: { locationLabel: 'Cinque Terre', tagline: 'Entdecken, speichern, erkunden.<br>Auch offline.',           wishlistLabel: 'Favoriten',  mapLabel: 'Karte',  searchPlaceholder: 'Restaurants, Strände, Wanderwege suchen…' },
        es: { locationLabel: 'Cinque Terre', tagline: 'Descubre, guarda, explora.<br>También sin conexión.',        wishlistLabel: 'Favoritos',  mapLabel: 'Mapa',   searchPlaceholder: 'Buscar restaurantes, playas, senderos…'   },
        zh: { locationLabel: '五渔村',        tagline: '发现、保存、探索。<br>即使离线也可用。',                        wishlistLabel: '收藏',       mapLabel: '地图',   searchPlaceholder: '搜索餐厅、海滩、步道…'                    },
    };

    const C       = copy[lang] || copy.en;
    const wlCount = window.WL ? window.WL.get().length : 0;

    content.innerHTML = `
    <div class="home-v2">
      <div class="home-hero-central">
        <div class="home-location-label">
          <span class="home-location-dot"></span>
          ${C.locationLabel}
        </div>
        <h1 class="home-title">
          <em class="home-title-five">Five</em><span class="home-title-2go">2Go</span>
        </h1>
        <p class="home-tagline">${C.tagline}</p>

        <div class="home-search-wrap" id="global-search-anchor">
          <span class="material-icons home-search-icon">search</span>
          <input id="global-search-input"
                 type="search" inputmode="search" enterkeyhint="search"
                 autocomplete="off" spellcheck="false"
                 placeholder="${C.searchPlaceholder}"
                 oninput="window._searchDebounced(this.value)"
                 onfocus="window._positionResultsSheet && window._positionResultsSheet()"
                 class="home-search-input">
          <button id="search-clear-btn" class="home-search-clear hidden"
                  onclick="window._closeSearch()">
            <span class="material-icons" style="font-size:18px;">close</span>
          </button>
        </div>
      </div>

      <div class="home-actions">
        <button class="home-pill home-pill--heart" onclick="window.switchView('wishlist')">
          <span class="material-icons home-pill-icon">favorite</span>
          <span class="home-pill-label">${C.wishlistLabel}</span>
          <span class="home-pill-badge" data-home-badge="wishlist"
                style="${wlCount > 0 ? '' : 'display:none'}">${wlCount}</span>
        </button>
        <button class="home-pill home-pill--map" onclick="window.switchView('mappa')">
          <span class="material-icons home-pill-icon">explore</span>
          <span class="home-pill-label">${C.mapLabel}</span>
        </button>
      </div>
    </div>`;

    // Search backdrop — guard contro duplicati
    if (!document.getElementById('search-backdrop')) {
        const bd = document.createElement('div');
        bd.id = 'search-backdrop';
        bd.className = 'hidden';
        bd.style.cssText = 'position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.25);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);';
        bd.onclick = () => window._closeSearch();
        document.body.appendChild(bd);
    }

    _injectChiccoFAB();
}

// ─────────────────────────────────────────────────────────────────────────
//  SUBMENU (barra laterale a scomparsa)
// ─────────────────────────────────────────────────────────────────────────
window.renderSubMenu = function(options, defaultTable) {
    window.currentMenuOptions = options;

    const colorMap = {
        orange: 'bg-white text-ct-terracotta border-orange-100 active:border-ct-terracotta shadow-sm',
        yellow: 'bg-white text-yellow-700   border-yellow-100 active:border-ct-yellow shadow-sm',
        red:    'bg-white text-red-800      border-red-100    active:border-red-400 shadow-sm',
        blue:   'bg-white text-ct-blue      border-teal-100   active:border-ct-blue shadow-sm',
        green:  'bg-white text-ct-green     border-green-100  active:border-ct-green shadow-sm',
    };

    const buttonsHtml = options.map((opt, index) => {
        const theme = colorMap[opt.color] || colorMap.blue;
        const icon  = opt.icon || 'star';
        return `
        <button class="btn-pop-menu w-full px-3 py-2.5 rounded-2xl flex items-center gap-3 border transition-all duration-300 transform ${theme}"
            data-table="${opt.table}" data-index="${index}"
            onclick="window.loadTableData('${opt.table}', this); window.toggleSideMenu(false);">
            <span class="material-icons text-xl opacity-80">${icon}</span>
            <span class="text-xs font-bold uppercase tracking-wide text-left flex-1">${opt.label}</span>
        </button>`;
    }).join('');

    const content = document.getElementById('app-content');
    content.innerHTML = `
    <div id="side-category-menu" class="fixed top-28 left-0 z-[80] flex transition-transform duration-300"
         style="transform:translateX(0px);">
        <div id="side-menu-panel"
             class="bg-white/95 backdrop-blur-xl shadow-floating rounded-r-3xl p-3 flex flex-col gap-3 border-y border-r border-slate-200 min-w-[150px]">
            ${buttonsHtml}
        </div>
        <button onclick="window.toggleSideMenu()"
                class="bg-white/95 backdrop-blur-xl shadow-[4px_4px_10px_rgba(0,0,0,0.1)] border-y border-r border-slate-200 rounded-r-2xl w-10 h-16 flex items-center justify-center -ml-1 mt-6 active:scale-95 transition-all outline-none touch-manipulation">
            <span id="side-menu-arrow"
                  class="material-icons text-slate-500 transition-transform duration-300"
                  style="transform:rotate(180deg);">chevron_right</span>
        </button>
    </div>
    <div id="sub-content" class="min-h-[300px] touch-pan-y transition-opacity duration-200 ease-out pt-6 px-2"></div>`;

    const defaultBtn = content.querySelector(`button[data-table="${defaultTable}"]`)
                    || content.querySelector('.btn-pop-menu');
    if (defaultBtn) loadTableData(defaultBtn.getAttribute('data-table'), defaultBtn);

    setTimeout(() => window.toggleSideMenu(false), 1500);
    window._initScrollFABs?.();
};

window.toggleSideMenu = function(forceState) {
    const menu  = document.getElementById('side-category-menu');
    const panel = document.getElementById('side-menu-panel');
    const arrow = document.getElementById('side-menu-arrow');
    if (!menu || !panel) return;

    const isClosed   = menu.style.transform.includes('translateX(-');
    const shouldOpen = forceState !== undefined ? forceState : isClosed;
    const panelWidth = panel.offsetWidth;

    menu.style.transform = shouldOpen ? 'translateX(0px)' : `translateX(-${panelWidth - 2}px)`;
    if (arrow) arrow.style.transform = shouldOpen ? 'rotate(180deg)' : 'rotate(0deg)';
};

// ─────────────────────────────────────────────────────────────────────────
//  FAB FLOTTANTI (scroll-to-top + filtro)
// ─────────────────────────────────────────────────────────────────────────
window._initScrollFABs = function() {
    window._destroyScrollFABs();

    const appContent = document.getElementById('app-content');
    const tabBar     = document.getElementById('nav-tab-bar');
    if (!appContent || !tabBar) return;

    const fabWrap = document.createElement('div');
    fabWrap.id = 'scroll-fabs';
    fabWrap.className = 'fab-scroll-actions fab-hidden';
    fabWrap.innerHTML = `
        <button class="fab-btn fab-btn--filter" id="fab-filter-btn"
            aria-label="${window.currentLang === 'it' ? 'Apri filtro' : 'Open filter'}">
            <span class="material-icons" style="font-size:20px;">tune</span>
        </button>
        <button class="fab-btn fab-btn--top" id="fab-top-btn"
            aria-label="${window.currentLang === 'it' ? 'Torna su' : 'Back to top'}">
            <span class="material-icons" style="font-size:20px;">keyboard_arrow_up</span>
        </button>`;
    document.body.appendChild(fabWrap);

    document.getElementById('fab-top-btn').addEventListener('click', () => {
        appContent.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('fab-filter-btn').addEventListener('click', () => {
        appContent.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            const trigger = document.querySelector('.smart-filter-bar-container button[id^="trigger-"]');
            const panel   = document.querySelector('.smart-filter-bar-container div[id^="panel-"]');
            if (trigger && panel?.classList.contains('hidden')) trigger.click();
        }, 400);
    });

    let fabVisible = false;
    const SCROLL_THRESHOLD = 120;

    window._fabScrollHandler = () => {
        const scrollTop    = appContent.scrollTop;
        const tabBarBottom = tabBar.offsetTop + tabBar.offsetHeight;
        const shouldShow   = scrollTop > (tabBarBottom + SCROLL_THRESHOLD);

        if (shouldShow && !fabVisible) {
            fabVisible = true;
            fabWrap.classList.replace('fab-hidden', 'fab-visible');
        } else if (!shouldShow && fabVisible) {
            fabVisible = false;
            fabWrap.classList.replace('fab-visible', 'fab-hidden');
        }
    };

    appContent.addEventListener('scroll', window._fabScrollHandler, { passive: true });
};

window._destroyScrollFABs = function() {
    document.getElementById('scroll-fabs')?.remove();
    const appContent = document.getElementById('app-content');
    if (appContent && window._fabScrollHandler) {
        appContent.removeEventListener('scroll', window._fabScrollHandler);
        window._fabScrollHandler = null;
    }
};

// ─────────────────────────────────────────────────────────────────────────
//  LOAD TABLE DATA
// ─────────────────────────────────────────────────────────────────────────
window.loadTableData = async function(tableName, btnEl) {
    const mainContainer = document.getElementById('app-content');
    if (mainContainer) {
        mainContainer.style.scrollBehavior = 'auto';
        mainContainer.scrollTop = 0;
        requestAnimationFrame(() => { mainContainer.style.scrollBehavior = ''; });
    }

    window.currentActiveTable = tableName;
    const subContent = document.getElementById('sub-content');
    if (!subContent) return;

    window._haptic?.(5);

    // Risolve bottone se chiamato dallo swipe (btnEl === null)
    if (!btnEl) btnEl = document.querySelector(`button[data-table="${tableName}"]`);

    // Reset stile tutti i bottoni
    document.querySelectorAll('.btn-pop-menu').forEach(b => {
        b.classList.remove('ring-2', 'ring-offset-1', 'ring-stone-300', 'scale-105', 'shadow-md');
        b.style.opacity = '0.7';
    });

    // Attiva stile bottone corrente
    if (btnEl) {
        btnEl.classList.add('ring-2', 'ring-offset-1', 'ring-stone-300', 'scale-105', 'shadow-md');
        btnEl.style.opacity = '1';
        btnEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    // Fade content
    subContent.style.opacity = '0.5';
    setTimeout(() => { subContent.style.opacity = '1'; }, 200);

    // Skeleton mentre si carica
    if (!window.appCache[tableName]) {
        subContent.innerHTML = window.renderSkeletonList
            ? window.renderSkeletonList(tableName)
            : `<div class="py-20 flex flex-col items-center justify-center gap-4">
                   <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-ct-terracotta"></div>
               </div>`;
    }

    // Caso speciale Mappe (iframe)
    if (tableName === 'Mappe') {
        subContent.innerHTML = `
            <div class="rounded-2xl overflow-hidden shadow-soft border-2 border-white animate-fade"
                 style="height:70vh;height:70dvh;">
                <iframe src="https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1"
                        width="100%" height="100%" style="border:0;"></iframe>
            </div>`;
        return;
    }

    // Fetch dati (con cache)
    let data;
    if (window.appCache[tableName]) {
        data = window.appCache[tableName];
    } else {
        const response = await window.supabaseClient.from(tableName).select('*');
        if (response.error) {
            subContent.innerHTML = `
                <div class="p-6 text-center text-red-500 bg-red-50 rounded-3xl border border-red-100 font-bold">
                    ${response.error.message}
                </div>`;
            return;
        }
        data = response.data;
        window.appCache[tableName] = data;
        _saveOnlineTimestamp?.();
    }

    window.currentTableData = data;

    // Dispatch rendering per tipo tabella
    const culturaConfig = {
        primary:   { key: 'Paese', title: window.t('filter_village'), customOrder: ['Riomaggiore','Manarola','Corniglia','Vernazza','Monterosso'] },
        secondary: { key: 'Label', title: window.t('filter_cat') },
    };

    switch (tableName) {
        case 'Vini':
            renderHorizontalFilterView(data, 'Tipo', subContent, window.vinoRenderer);
            break;
        case 'Spiagge':
            renderHorizontalFilterView(data, 'Paesi', subContent, window.spiaggiaRenderer, 'lat_sp', 'long_sp');
            break;
        case 'Prodotti':
            subContent.innerHTML = `<div class="grid grid-cols-2 gap-3.5 pb-24 animate-fade pt-2">
                ${data.map(p => window.prodottoRenderer(p)).join('')}
            </div>`;
            break;
        case 'Attrazioni':
            renderDoubleHorizontalFilterView(data, culturaConfig, subContent, window.attrazioniRenderer, 'lat_at', 'long_at');
            break;
        case 'Ristoranti':
            renderHorizontalFilterView(data, 'Paesi', subContent, window.ristoranteRenderer);
            break;
        case 'Sentieri':
            renderHorizontalFilterView(data, 'difficolta_cai', subContent, window.sentieroRenderer);
            break;
        case 'Farmacie':
            subContent.innerHTML = `<div class="flex flex-col gap-3 pb-24 animate-fade pt-2">
                ${data.map(i => window.farmacieRenderer(i)).join('')}
            </div>`;
            break;
        case 'Numeri_utili':
            renderHorizontalFilterView(data, 'Comune', subContent, window.numeriUtiliRenderer);
            break;
        default:
            console.warn(`[loadTableData] Renderer non definito per: ${tableName}`);
    }
};

// ─────────────────────────────────────────────────────────────────────────
//  INCREMENTAL RENDERER FACTORY (DRY: sostituisce ~80 righe duplicate)
// ─────────────────────────────────────────────────────────────────────────
/**
 * Renderizza una lista in modo incrementale tramite IntersectionObserver.
 * Sostituisce il codice duplicato in renderHorizontalFilterView e
 * renderDoubleHorizontalFilterView.
 *
 * @param {HTMLElement} container    - elemento lista target
 * @param {Array}       items        - dataset filtrato (già ordinato)
 * @param {Function}    cardRenderer - item => HTML string
 * @param {number}      [batchSize=10]
 */
window.IncrementalRenderer = function(container, items, cardRenderer, batchSize = 10) {
    // Disconnetti observer precedente salvato sul container
    if (container._incObs) {
        container._incObs.disconnect();
        container._incObs = null;
    }

    if (!items?.length) {
        container.innerHTML = `
            <div class="py-12 text-center text-slate-400 font-medium italic">
                ${window.t('no_results')}
            </div>`;
        return;
    }

    const firstBatch = items.slice(0, batchSize);
    container.innerHTML = firstBatch.map(cardRenderer).join('');
    window.initPendingMaps?.();

    if (items.length <= batchSize) return;

    let rendered = batchSize;

    const sentinel = document.createElement('div');
    sentinel.className = 'incremental-sentinel';
    sentinel.style.height = '1px';
    container.appendChild(sentinel);

    const obs = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;

        const next = items.slice(rendered, rendered + batchSize);
        rendered += next.length;

        const frag = document.createRange().createContextualFragment(
            next.map(cardRenderer).join('')
        );
        container.insertBefore(frag, sentinel);
        window.initPendingMaps?.();

        if (rendered >= items.length) {
            obs.disconnect();
            container._incObs = null;
            sentinel.remove();
        }
    }, { rootMargin: '300px' });

    obs.observe(sentinel);
    container._incObs = obs;
};

// ─────────────────────────────────────────────────────────────────────────
//  SMART FILTER — valori unici (con memoizzazione)
// ─────────────────────────────────────────────────────────────────────────
const _uniqueValCache = new Map();

function getUniqueValues(allData, key, customOrder = []) {
    // Chiave cache basata su primo id + colonna (invalida se i dati cambiano)
    const cacheKey = `${allData[0]?.id ?? ''}:${key}`;
    if (_uniqueValCache.has(cacheKey)) return _uniqueValCache.get(cacheKey);

    const raw    = allData.map(item => window.dbCol(item, key)).filter(Boolean).map(x => String(x).trim());
    let   unique = [...new Set(raw)];

    if (customOrder.length) {
        unique.sort((a, b) => {
            const ia = customOrder.indexOf(a);
            const ib = customOrder.indexOf(b);
            if (ia !== -1 && ib !== -1) return ia - ib;
            if (ia !== -1) return -1;
            if (ib !== -1) return 1;
            return a.localeCompare(b);
        });
    } else {
        unique.sort();
    }

    if (!unique.includes('__ALL__')) unique.unshift('__ALL__');
    _uniqueValCache.set(cacheKey, unique);
    return unique;
}

// Invalida cache al pull-to-refresh o cambio dati
window._invalidateUniqueValCache = function() { _uniqueValCache.clear(); };

// ─────────────────────────────────────────────────────────────────────────
//  HORIZONTAL FILTER VIEW (filtro singolo)
// ─────────────────────────────────────────────────────────────────────────
function renderHorizontalFilterView(allData, filterKey, container, cardRenderer, latKey, lonKey) {
    const tags      = getUniqueValues(allData, filterKey, ['Tutti','Riomaggiore','Manarola','Corniglia','Vernazza','Monterosso']);
    const filterId  = `filter-${Math.random().toString(36).substr(2, 9)}`;
    const triggerId = `trigger-${filterId}`;
    const panelId   = `panel-${filterId}`;
    const nearMeId  = `nearbyme-${filterId}`;
    const labelAll  = window.t('label_all');
    const hasNearMe = !!(latKey && lonKey);

    // Determina azione mappa contestuale
    const isRistorantiView = filterKey === 'Paesi' && cardRenderer === window.ristoranteRenderer;
    const isVinoView       = filterKey === 'Tipo'  && cardRenderer === window.vinoRenderer;
    const isSpiaggiaView   = filterKey === 'Paesi' && cardRenderer === window.spiaggiaRenderer;

    let mapAction = null;
    if (isRistorantiView) mapAction = '_openMapAperitivo';
    else if (isVinoView)  mapAction = '_openMapVino';
    else if (isSpiaggiaView) mapAction = '_openMapSpiaggia';

    const secondaryBtnHtml = mapAction
        ? `<button class="shrink-0 bg-white/95 backdrop-blur shadow-sm border border-stone-200 rounded-xl w-[50px] flex items-center justify-center transition-all active:scale-95 self-stretch"
               onclick="window.${mapAction}?.()" aria-label="Mappa">
               <span class="material-icons">explore</span>
           </button>`
        : (hasNearMe
            ? `<button id="${nearMeId}"
                   class="near-me-btn ${window._nearMeEnabled ? 'active-near-me' : ''}"
                   title="${window.currentLang === 'it' ? 'Ordina per distanza' : 'Sort by distance'}"
                   aria-label="${window.currentLang === 'it' ? 'Vicino a me' : 'Near me'}"
                   aria-pressed="${window._nearMeEnabled}"
                   onclick="window.toggleNearMe('${nearMeId}', function(){ window.applySingleSmartFilter('__ALL__','${filterId}',false); })">
                   <span class="material-icons text-sm">near_me</span>
               </button>`
            : '');

    container.innerHTML = `
        <div class="smart-filter-bar-container -mx-4 px-4 pb-3 relative">
            <div class="flex items-center gap-2">
                <button id="${triggerId}"
                        class="flex-1 bg-white/95 backdrop-blur shadow-sm border border-stone-200 rounded-xl py-3 px-4 flex items-center justify-between transition-all active:scale-95"
                        onclick="toggleSmartFilter('${panelId}','${triggerId}')">
                    <div class="flex items-center gap-2">
                        <span class="material-icons text-ct-terracotta text-sm">tune</span>
                        <span id="filter-label-${filterId}" class="text-sm font-bold text-slate-700">${labelAll}</span>
                    </div>
                    <span class="material-icons text-slate-400 text-sm transition-transform duration-300"
                          id="icon-${filterId}">expand_more</span>
                </button>
                ${secondaryBtnHtml}
            </div>
            <div id="${panelId}" class="hidden overflow-hidden transition-all duration-300 bg-ct-sand rounded-b-xl border-x border-b border-stone-200/50 shadow-md">
                <div class="p-3 overflow-x-auto no-scrollbar flex gap-2" id="chips-${filterId}"></div>
            </div>
        </div>
        <div id="dynamic-list" class="flex flex-col gap-3 pb-24 animate-fade min-h-[50vh]"></div>`;

    const chipContainer = container.querySelector(`#chips-${filterId}`);
    const listContainer = container.querySelector('#dynamic-list');
    const labelSpan     = container.querySelector(`#filter-label-${filterId}`);
    let   activeTag     = '__ALL__';

    function renderChips() {
        chipContainer.innerHTML = tags.map(tag => {
            const isActive   = tag === activeTag;
            const style      = isActive
                ? 'bg-ct-terracotta text-white border-transparent shadow-md'
                : 'bg-white text-slate-600 border-stone-200';
            const displayTag = tag === '__ALL__' ? labelAll : tag;
            return `<button class="flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 touch-manipulation ${style}"
                        onclick="window.applySingleSmartFilter('${tag}','${filterId}',true)">${displayTag}</button>`;
        }).join('');
    }

    window.applySingleSmartFilter = (tag, fId, fromClick = false) => {
        activeTag = tag;
        renderChips();
        labelSpan.innerText = tag === '__ALL__' ? labelAll : tag;
        if (fromClick) toggleSmartFilter(panelId, triggerId);

        // Pinning: emergenza sempre prima, taxi sempre seconda
        const emergencyItems = allData.filter(item => {
            const nome = String(window.dbCol(item, 'Nome') || item.Nome || '').toLowerCase();
            return nome.includes('numero unico') || nome.includes('emergenza');
        });
        const taxiItems = allData.filter(item => {
            const nome = String(window.dbCol(item, 'Nome') || item.Nome || '').toLowerCase();
            return nome.includes('taxi');
        });
        const pinnedSet = new Set([...emergencyItems, ...taxiItems]);
        const otherData = allData.filter(i => !pinnedSet.has(i));

        let filtered = tag === '__ALL__'
            ? otherData
            : otherData.filter(item => {
                const valDB = window.dbCol(item, filterKey);
                return valDB && String(valDB).trim().includes(tag);
            });

        if (tag === '__ALL__') filtered = [...emergencyItems, ...taxiItems, ...filtered];

        const sorted = (hasNearMe && window.sortByDistance)
            ? window.sortByDistance(filtered, latKey, lonKey)
            : filtered;

        window.IncrementalRenderer(listContainer, sorted, cardRenderer);
    };

    renderChips();
    window.applySingleSmartFilter('__ALL__', filterId);
}

// ─────────────────────────────────────────────────────────────────────────
//  DOUBLE HORIZONTAL FILTER VIEW (filtro doppio: paese + categoria)
// ─────────────────────────────────────────────────────────────────────────
function renderDoubleHorizontalFilterView(allData, filtersConfig, container, cardRenderer, latKey, lonKey) {
    const values1   = getUniqueValues(allData, filtersConfig.primary.key, filtersConfig.primary.customOrder);
    const values2   = getUniqueValues(allData, filtersConfig.secondary.key);
    const filterId  = `filter-dbl-${Math.random().toString(36).substr(2, 9)}`;
    const triggerId = `trigger-${filterId}`;
    const panelId   = `panel-${filterId}`;
    const nearMeId  = `nearbyme-${filterId}`;
    const labelAll     = window.t('label_all');
    const labelAllFem  = window.t('label_all_fem');
    const btnClose     = window.t('btn_close_show');
    const hasNearMe    = !!(latKey && lonKey);
    const isAttrazioni = cardRenderer === window.attrazioniRenderer;
    const mapAction    = isAttrazioni ? '_openMapAttrazione' : null;

    const secondaryBtnHtml = mapAction
        ? `<button class="shrink-0 bg-white/95 backdrop-blur shadow-sm border border-stone-200 rounded-xl w-[50px] flex items-center justify-center transition-all active:scale-95 self-stretch"
               onclick="window.${mapAction}?.()" aria-label="Mappa">
               <span class="material-icons">explore</span>
           </button>`
        : (hasNearMe
            ? `<button id="${nearMeId}"
                   class="near-me-btn ${window._nearMeEnabled ? 'active-near-me' : ''}"
                   title="${window.currentLang === 'it' ? 'Ordina per distanza' : 'Sort by distance'}"
                   aria-label="${window.currentLang === 'it' ? 'Vicino a me' : 'Near me'}"
                   aria-pressed="${window._nearMeEnabled}"
                   onclick="window.toggleNearMe('${nearMeId}', function(){ window.applyDoubleSmartFilter(0,null,'${filterId}'); })">
                   <span class="material-icons text-sm">near_me</span>
               </button>`
            : '');

    container.innerHTML = `
        <div class="smart-filter-bar-container -mx-4 px-4 pb-3 relative">
            <div class="flex items-center gap-2">
                <button id="${triggerId}"
                        class="flex-1 bg-white/95 backdrop-blur shadow-sm border border-stone-200 rounded-xl py-3 px-4 flex items-center justify-between transition-all active:scale-95"
                        onclick="toggleSmartFilter('${panelId}','${triggerId}')">
                    <div class="flex items-center gap-2 overflow-hidden">
                        <span class="material-icons text-ct-blue text-sm">tune</span>
                        <span id="filter-label-${filterId}" class="text-sm font-bold text-slate-700 truncate">${labelAll} • ${labelAllFem}</span>
                    </div>
                    <span class="material-icons text-slate-400 text-sm transition-transform duration-300"
                          id="icon-${filterId}">expand_more</span>
                </button>
                ${secondaryBtnHtml}
            </div>
            <div id="${panelId}" class="hidden overflow-hidden transition-all duration-300 bg-ct-sand rounded-b-xl border-x border-b border-stone-200/50 shadow-md">
                <div class="p-3 space-y-3">
                    <div>
                        <div class="text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">${window.t('filter_village')}</div>
                        <div class="overflow-x-auto no-scrollbar flex gap-2" id="row1-${filterId}"></div>
                    </div>
                    <div>
                        <div class="text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">${window.t('filter_cat')}</div>
                        <div class="overflow-x-auto no-scrollbar flex gap-2" id="row2-${filterId}"></div>
                    </div>
                    <button class="w-full py-2 bg-ct-blue text-white rounded-lg text-xs font-bold uppercase mt-2 shadow-md active:scale-95 transition-transform"
                            onclick="toggleSmartFilter('${panelId}','${triggerId}')">${btnClose}</button>
                </div>
            </div>
        </div>
        <div id="dynamic-list" class="flex flex-col gap-3 pb-24 animate-fade min-h-[50vh]"></div>`;

    const c1        = container.querySelector(`#row1-${filterId}`);
    const c2        = container.querySelector(`#row2-${filterId}`);
    const listContainer = container.querySelector('#dynamic-list');
    const labelSpan = container.querySelector(`#filter-label-${filterId}`);
    let activeVal1  = '__ALL__';
    let activeVal2  = '__ALL__';

    window.applyDoubleSmartFilter = (level, val, fId) => {
        if (level === 1) activeVal1 = val;
        if (level === 2) activeVal2 = val;
        renderControls();
        const txt1 = activeVal1 === '__ALL__' ? labelAll    : activeVal1;
        const txt2 = activeVal2 === '__ALL__' ? labelAllFem : activeVal2;
        labelSpan.innerText = `${txt1} • ${txt2}`;
        executeFilter();
    };

    function renderControls() {
        c1.innerHTML = values1.map(v => {
            const isActive = v === activeVal1;
            const style    = isActive
                ? 'bg-ct-terracotta text-white shadow-md border-transparent'
                : 'bg-white text-slate-600 border-stone-200';
            const display  = v === '__ALL__' ? labelAll : v;
            return `<button class="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 touch-manipulation ${style}"
                        onclick="window.applyDoubleSmartFilter(1,'${v}','${filterId}')">${display}</button>`;
        }).join('');

        c2.innerHTML = values2.map(v => {
            const isActive = v === activeVal2;
            const style    = isActive
                ? 'bg-ct-blue text-white shadow-md border-transparent'
                : 'bg-white text-slate-600 border-stone-200';
            const display  = v === '__ALL__' ? labelAllFem : v;
            return `<button class="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 touch-manipulation ${style}"
                        onclick="window.applyDoubleSmartFilter(2,'${v}','${filterId}')">${display}</button>`;
        }).join('');
    }

    function executeFilter() {
        let filtered = allData.filter(item => {
            const val1   = window.dbCol(item, filtersConfig.primary.key)   || '';
            const val2   = window.dbCol(item, filtersConfig.secondary.key) || '';
            const match1 = activeVal1 === '__ALL__' || val1.includes(activeVal1);
            const match2 = activeVal2 === '__ALL__' || val2.toLowerCase().includes(activeVal2.toLowerCase());
            return match1 && match2;
        });

        if (hasNearMe && window.sortByDistance) {
            filtered = window.sortByDistance(filtered, latKey, lonKey);
        }

        window.IncrementalRenderer(listContainer, filtered, cardRenderer);
    }

    renderControls();
    executeFilter();
}

// ─────────────────────────────────────────────────────────────────────────
//  TOGGLE SMART FILTER (panel apri/chiudi)
// ─────────────────────────────────────────────────────────────────────────
window.toggleSmartFilter = function(panelId, triggerId) {
    const panel = document.getElementById(panelId);
    const icon  = document.querySelector(`#${triggerId} .material-icons:last-child`);
    if (!panel) return;

    window._haptic?.(5);

    const isHidden = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !isHidden);
    if (icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
};

// ─────────────────────────────────────────────────────────────────────────
//  SERVICES GRID
// ─────────────────────────────────────────────────────────────────────────
window.renderServicesGrid = async function() {
    const targetEl = document.getElementById('app-content');
    document.querySelectorAll('.smart-filter-bar-container').forEach(el => el.remove());
    if (!targetEl) return;

    const busImg   = `https://res.cloudinary.com/dkg0jfady/image/upload/w_600,c_fill,g_north,f_auto,q_auto:eco,dpr_1.0,fl_progressive/Bus`;
    const trainImg = window.getSmartUrl('Treno',   '', 600);
    const ferryImg = window.getSmartUrl('Battello','', 600);

    targetEl.innerHTML = `
    <div class="flex flex-col gap-3 pb-32 animate-pop">

        <!-- BUS hero full-width -->
        <div class="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-150 touch-manipulation shadow-soft"
             style="height:190px" onclick="openModal('transport','bus')">
            <img src="${busImg}" class="absolute inset-0 w-full h-full object-cover scale-[1.02]" onerror="this.style.display='none'">
            <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div class="absolute inset-0 p-5 flex flex-col justify-between z-10">
                <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                    <span class="material-icons text-xl text-white">directions_bus</span>
                </div>
                <h3 class="font-serif text-2xl font-bold text-white leading-none drop-shadow-md">${window.t('label_bus')}</h3>
            </div>
        </div>

        <!-- TRENO + BATTELLO -->
        <div class="grid grid-cols-2 gap-3">
            <div class="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-all duration-150 touch-manipulation shadow-soft"
                 style="height:170px" onclick="openModal('transport','train')">
                <img src="${trainImg}" class="absolute inset-0 w-full h-full object-cover" onerror="this.style.display='none'">
                <div class="absolute inset-0 bg-gradient-to-t from-ct-terracotta/95 via-ct-terracotta/50 to-ct-terracotta/10"></div>
                <div class="absolute inset-0 p-4 flex flex-col justify-between z-10">
                    <div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                        <span class="material-icons text-lg text-white">train</span>
                    </div>
                    <h3 class="font-serif text-lg font-bold text-white leading-tight drop-shadow-md">${window.t('label_train')}</h3>
                </div>
            </div>
            <div class="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-all duration-150 touch-manipulation shadow-soft"
                 style="height:170px" onclick="openModal('transport','ferry')">
                <img src="${ferryImg}" class="absolute inset-0 w-full h-full object-cover" onerror="this.style.display='none'">
                <div class="absolute inset-0 bg-gradient-to-t from-ct-blue/95 via-ct-blue/50 to-ct-blue/10"></div>
                <div class="absolute inset-0 p-4 flex flex-col justify-between z-10">
                    <div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                        <span class="material-icons text-lg text-white">directions_boat</span>
                    </div>
                    <h3 class="font-serif text-lg font-bold text-white leading-tight drop-shadow-md">${window.t('label_ferry')}</h3>
                </div>
            </div>
        </div>

        <!-- UTILITY ROWS -->
        <div class="bg-white rounded-2xl shadow-soft border border-slate-100/70 flex items-center gap-4 p-4 cursor-pointer active:scale-[0.98] transition-all duration-150 touch-manipulation"
             onclick="renderSimpleList('Numeri_utili')">
            <div class="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                <span class="material-icons text-xl text-white">phonelink_ring</span>
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="font-serif font-bold text-slate-800 text-base leading-tight">${window.t('menu_num')}</h3>
            </div>
            <span class="material-icons text-slate-300 text-xl">chevron_right</span>
        </div>

        <div class="bg-white rounded-2xl shadow-soft border border-slate-100/70 flex items-center gap-4 p-4 cursor-pointer active:scale-[0.98] transition-all duration-150 touch-manipulation"
             onclick="renderSimpleList('Farmacie')">
            <div class="w-12 h-12 rounded-xl bg-ct-green flex items-center justify-center shrink-0 shadow-sm">
                <span class="material-icons text-xl text-white">medical_services</span>
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="font-serif font-bold text-slate-800 text-base leading-tight">${window.t('menu_pharm')}</h3>
            </div>
            <span class="material-icons text-slate-300 text-xl">chevron_right</span>
        </div>

        <!-- CINQUE TERRE CARD -->
        <div class="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-150 touch-manipulation shadow-soft border border-slate-100/70"
             style="height:130px" onclick="window.switchView('ct_card')">
            <div class="absolute inset-0" style="background:linear-gradient(140deg,#0d3b2e 0%,#1a7a6a 60%,#2A9D8F 100%)"></div>
            <div class="absolute bottom-0 left-0 right-0 h-1.5" style="background:linear-gradient(90deg,#E9C46A,#E76F51,#2A9D8F)"></div>
            <div class="absolute inset-0 p-5 flex items-center gap-4 z-10">
                <div class="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/25 shrink-0">
                    <span class="material-icons text-2xl text-white">card_membership</span>
                </div>
                <h3 class="font-serif text-xl font-bold text-white leading-tight flex-1 min-w-0">Cinque Terre Card</h3>
                <span class="material-icons text-white/40 text-xl shrink-0">chevron_right</span>
            </div>
        </div>

        <!-- CINQUE TERRE TRENO CARD -->
        <div class="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-150 touch-manipulation shadow-soft border border-slate-100/70 mb-4"
             style="height:130px" onclick="window.switchView('treno_card')">
            <div class="absolute inset-0" style="background:linear-gradient(140deg,#33181c 0%,#be123c 60%,#e11d48 100%)"></div>
            <div class="absolute bottom-0 left-0 right-0 h-1.5" style="background:linear-gradient(90deg,#fcd34d,#f97316,#e11d48)"></div>
            <div class="absolute inset-0 p-5 flex items-center gap-4 z-10">
                <div class="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/25 shrink-0">
                    <span class="material-icons text-2xl text-white">train</span>
                </div>
                <h3 class="font-serif text-xl font-bold text-white leading-tight flex-1 min-w-0">Cinque Terre Treno Card</h3>
                <span class="material-icons text-white/40 text-xl shrink-0">chevron_right</span>
            </div>
        </div>

        <div class="text-center pt-1">
            <button onclick="renderLegalPage()"
                    class="text-slate-400 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto py-2 px-4 rounded-xl bg-white shadow-sm border border-slate-200 active:scale-95 touch-manipulation">
                <span class="material-icons text-sm">policy</span> ${window.t('menu_legal')}
            </button>
        </div>
    </div>`;
};

window.renderSimpleList = function(tableName) {
    const targetEl   = document.getElementById('app-content');
    const cleanTitle = tableName.replace('_', ' ');

    targetEl.innerHTML = `
    <div class="flex items-center gap-4 mb-6 animate-fade pt-2">
        <button onclick="renderServicesGrid()"
                class="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-[0_4px_0_rgb(203,213,225)] border-2 border-slate-200 active:scale-95 active:shadow-none active:translate-y-1 transition-all">
            <span class="material-icons text-slate-700">arrow_back</span>
        </button>
        <h2 class="text-3xl font-serif font-bold text-slate-800 capitalize">${cleanTitle}</h2>
    </div>
    <div id="sub-content" class="min-h-[300px]">
        <div class="py-10 text-center text-slate-400">${window.t('loading') || 'Caricamento...'}</div>
    </div>`;

    window.loadTableData(tableName, null);
};

window.toggleTicketInfo = function() {
    document.getElementById('ticket-info-box')?.classList.toggle('hidden');
};

// ─────────────────────────────────────────────────────────────────────────
//  GLOBAL SEARCH
// ─────────────────────────────────────────────────────────────────────────
const _BUS_VIRTUAL = [
    { _virtual: true, id: 'bus',   Nome: 'Orari Bus',       Alias: 'bus orari autobus ctbus',                    Sottotitolo: 'Cerca connessioni tra borghi' },
];
const _FERRY_VIRTUAL = [
    { _virtual: true, id: 'ferry', Nome: 'Orari Traghetti', Alias: 'traghetto ferry orari nave battello',        Sottotitolo: 'Collegamento via mare' },
];
const _TRAIN_VIRTUAL = [
    { _virtual: true, id: 'train', Nome: 'Orari Treni',     Alias: 'treno train trenitalia stazione ferrovia',   Sottotitolo: 'Trenitalia — orari e tratte' },
];

const _SEARCH_SECTIONS = [
    {
        table: 'Ristoranti', view: 'cibo', label: 'Ristoranti', icon: 'restaurant',
        color: '#E76F51', bg: '#FFEDE1',
        getId:     item => item.id,
        getName:   item => window.dbCol(item, 'Nome') || 'Ristorante',
        getSub:    item => window.dbCol(item, 'Paesi') || '',
        openModal: item => { const s = encodeURIComponent(JSON.stringify(item)).replace(/'/g,'%27'); openModal('ristorante', s); },
    },
    {
        table: 'Attrazioni', view: 'outdoor', label: 'Attrazioni', icon: 'attractions',
        color: '#2A9D8F', bg: '#E0F7FA',
        getId:     item => item.POI_ID || item.id,
        getName:   item => window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo') || 'Attrazione',
        getSub:    item => window.dbCol(item, 'Paese') || '',
        openModal: item => openModal('attrazione', item.POI_ID || item.id),
    },
    {
        table: 'Spiagge', view: 'outdoor', label: 'Spiagge', icon: 'beach_access',
        color: '#0369A1', bg: '#EFF6FF',
        getId:     item => item.id,
        getName:   item => window.dbCol(item, 'Spiagge') || window.dbCol(item, 'Nome') || 'Spiaggia',
        getSub:    item => window.dbCol(item, 'Paesi') || '',
        openModal: item => { const s = encodeURIComponent(JSON.stringify(item)).replace(/'/g,'%27'); openModal('Spiagge', s); },
    },
    {
        table: 'Prodotti', view: 'cibo', label: 'Prodotti', icon: 'lunch_dining',
        color: '#C2410C', bg: '#FFF3E0',
        getId:     item => item.id,
        getName:   item => window.dbCol(item, 'Prodotti') || window.dbCol(item, 'Nome') || 'Prodotto',
        getSub:    () => '',
        openModal: item => { const s = encodeURIComponent(JSON.stringify(item)).replace(/'/g,'%27'); openModal('product', s); },
    },
    {
        table: 'Vini', view: 'cibo', label: 'Vini', icon: 'wine_bar',
        color: '#9B2226', bg: '#FFF0EE',
        getId:     item => item.id || item.ID,
        getName:   item => item.Nome || 'Vino',
        getSub:    item => item.Produttore || '',
        openModal: item => openModal('Vini', item.id || item.ID),
    },
    {
        table: 'Farmacie', view: 'servizi', label: 'Farmacie', icon: 'local_pharmacy',
        color: '#606C38', bg: '#ECFCCB',
        getId:     item => item.id,
        getName:   item => _safeStr(item.Nome) || 'Farmacia',
        getSub:    item => _safeStr(item.Paesi) || item.Indirizzo || '',
        openModal: () => renderSimpleList('Farmacie'),
    },
    {
        table: 'Numeri_utili', view: 'servizi', label: 'Numeri Utili', icon: 'phonelink_ring',
        color: '#264653', bg: '#F1F5F9',
        getId:     item => item.id,
        getName:   item => _safeStr(item.Nome) || 'Numero Utile',
        getSub:    item => item.Numero || '',
        openModal: () => renderSimpleList('Numeri_utili'),
    },
    {
        table: '_bus', view: 'servizi', virtual: true, data: _BUS_VIRTUAL,
        label: 'Trasporti', icon: 'directions_bus', color: '#B45309', bg: '#FFFBEB',
        getId:     item => item.id,
        getName:   item => item.Nome,
        getSub:    item => item.Sottotitolo,
        openModal: () => openModal('transport', 'bus'),
    },
    {
        table: '_ferry', view: 'servizi', virtual: true, data: _FERRY_VIRTUAL,
        label: 'Traghetti', icon: 'directions_boat', color: '#0369A1', bg: '#EFF6FF',
        getId:     item => item.id,
        getName:   item => item.Nome,
        getSub:    item => item.Sottotitolo,
        openModal: () => openModal('transport', 'ferry'),
    },
    {
        table: '_train', view: 'servizi', virtual: true, data: _TRAIN_VIRTUAL,
        label: 'Treni', icon: 'train', color: '#E76F51', bg: '#FFEDE1',
        getId:     item => item.id,
        getName:   item => item.Nome,
        getSub:    item => item.Sottotitolo,
        openModal: () => openModal('transport', 'train'),
    },
];

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

function _searchInItem(item, q) {
    for (const val of Object.values(item)) {
        if (!val) continue;
        const s = typeof val === 'string'
            ? val
            : (typeof val === 'object' ? Object.values(val).filter(Boolean).join(' ') : '');
        if (s.toLowerCase().includes(q)) return true;
    }
    return false;
}

// Search results sheet — iniettato una volta sola nel body
(function _injectSearchSheet() {
    if (document.getElementById('search-results-sheet')) return;
    const sheet = document.createElement('div');
    sheet.id = 'search-results-sheet';
    sheet.className = 'hidden';
    sheet.style.cssText = [
        'position:fixed','z-index:9999','background:white',
        'border-radius:1.5rem','box-shadow:0 20px 60px rgba(0,0,0,0.18)',
        'border:1px solid #f1f5f9','overflow:hidden',
        'max-height:58vh','overflow-y:auto','scrollbar-width:none',
    ].join(';');
    sheet.innerHTML = '<div id="search-results-content" style="padding:12px;"></div>';
    document.body.appendChild(sheet);
})();

window._positionResultsSheet = function() {
    const anchor = document.getElementById('global-search-anchor');
    const sheet  = document.getElementById('search-results-sheet');
    if (!anchor || !sheet) return;
    const rect  = anchor.getBoundingClientRect();
    const gap   = 8;
    const viewH = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    sheet.style.left  = rect.left + 'px';
    sheet.style.width = rect.width + 'px';
    if (rect.top > viewH * 0.4) {
        sheet.style.top       = 'auto';
        sheet.style.bottom    = (window.innerHeight - rect.top + gap) + 'px';
        sheet.style.maxHeight = (rect.top - gap - 20) + 'px';
    } else {
        sheet.style.bottom    = 'auto';
        sheet.style.top       = (rect.bottom + gap) + 'px';
        sheet.style.maxHeight = Math.min(viewH * 0.58, viewH - rect.bottom - gap - 20) + 'px';
    }
};

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        if (document.getElementById('search-results-sheet')) window._positionResultsSheet();
    });
}

// Prefetch ricerca — cache unificata con appCache
window._searchPrefetched = false;
window._searchPrefetch = async function() {
    if (window._searchPrefetched) return;
    window._searchPrefetched = true;
    const toLoad = _SEARCH_SECTIONS.filter(s => !s.virtual && !window.appCache[s.table]);
    if (!toLoad.length) return;
    for (let i = 0; i < toLoad.length; i += 2) {
        const batch = toLoad.slice(i, i + 2);
        await Promise.all(batch.map(s =>
            window.supabaseClient.from(s.table).select('*')
                .then(({ data }) => { if (data) window.appCache[s.table] = data; })
                .catch(() => {})
        ));
        if (i + 2 < toLoad.length) await new Promise(r => setTimeout(r, 150));
    }
};

// Prefetch in idle (non blocca il render iniziale)
(function _scheduleSearchPrefetch() {
    if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => window._searchPrefetch(), { timeout: 5000 });
    } else {
        setTimeout(() => window._searchPrefetch(), 2000);
    }
})();

let _searchTimer = null;
window._searchDebounced = function(val) {
    clearTimeout(_searchTimer);
    const clearBtn = document.getElementById('search-clear-btn');
    clearBtn?.classList.toggle('hidden', !val);
    if (!val || val.trim().length < 2) { _hideSearchResults(); return; }
    _searchTimer = setTimeout(() => window._runSearch(val.trim()), 280);
};

window._runSearch = function(query) {
    const q      = query.toLowerCase();
    const groups = [];
    let   total  = 0;
    for (const sec of _SEARCH_SECTIONS) {
        const data = sec.virtual ? sec.data : (window.appCache[sec.table] || []);
        const hits = data.filter(item => _searchInItem(item, q)).slice(0, 6);
        if (hits.length) { groups.push({ sec, hits }); total += hits.length; }
    }
    _showSearchResults(query, groups, total);
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
        const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        content.innerHTML = groups.map(({ sec, hits }) => {
            const safeKey = sec.table.replace(/[^a-z]/gi, '_');
            window[`_searchHits_${safeKey}`] = hits;
            const secIdx = _SEARCH_SECTIONS.indexOf(sec);
            return `
            <div class="mb-2">
                <div class="flex items-center gap-2 px-2 py-1 mb-0.5">
                    <div class="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                         style="background:${sec.bg};">
                        <span class="material-icons text-xs" style="color:${sec.color};font-size:13px;">${sec.icon}</span>
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest" style="color:${sec.color};">${sec.label}</span>
                    <span class="ml-auto text-[10px] font-bold text-slate-300">${hits.length}</span>
                </div>
                ${hits.map((item, i) => {
                    const name   = sec.getName(item);
                    const sub    = sec.getSub(item);
                    const nameHL = name.replace(re, '<mark class="bg-amber-200/70 rounded px-0.5">$1</mark>');
                    return `
                    <button class="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-2xl active:bg-slate-100 transition-colors group"
                            onclick="window._searchNavigateTo(${secIdx},${i})">
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
        }).join('');
    }

    window._searchSections = _SEARCH_SECTIONS;
    window._positionResultsSheet?.();
    sheet.classList.remove('hidden');
    backdrop?.classList.remove('hidden');
}

function _hideSearchResults() {
    const sheet    = document.getElementById('search-results-sheet');
    const backdrop = document.getElementById('search-backdrop');
    if (sheet)    { sheet.classList.add('hidden'); sheet.style.top = ''; sheet.style.bottom = ''; }
    backdrop?.classList.add('hidden');
}

window._closeSearch = function() {
    const input    = document.getElementById('global-search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    if (input)    { input.value = ''; input.blur(); }
    clearBtn?.classList.add('hidden');
    _hideSearchResults();
    window._resetMobileZoom();
};

window._resetMobileZoom = function() {
    const vp = document.querySelector('meta[name="viewport"]');
    if (!vp) return;
    const orig = vp.getAttribute('content');
    vp.setAttribute('content', orig + ', maximum-scale=1');
    requestAnimationFrame(() => vp.setAttribute('content', orig));
};

window._flashCard = function(id, fallbackName, attempt) {
    attempt = attempt || 0;
    if (attempt > 20) return;

    const card   = id ? document.querySelector(`[data-card-id="${id}"]`) : null;
    const target = card || (fallbackName
        ? Array.from(document.querySelectorAll('[data-card-id]'))
              .find(el => el.textContent.toLowerCase().includes(fallbackName.toLowerCase()))
        : null);

    if (!target) { setTimeout(() => window._flashCard(id, fallbackName, attempt + 1), 80); return; }

    const appContent = document.getElementById('app-content');
    if (appContent) {
        const rect   = target.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2) - window.innerHeight / 2;
        appContent.scrollBy({ top: offset, behavior: 'smooth' });
    } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Flash ring — solo outline (nessun boxShadow per evitare artefatti Safari)
    target.style.transition    = 'outline 0.2s';
    target.style.outline       = '3px solid #E76F51';
    target.style.outlineOffset = '3px';
    setTimeout(() => {
        target.style.outline = '3px solid transparent';
        setTimeout(() => { target.style.outline = ''; }, 300);
    }, 2000);
};

window._searchNavigateTo = async function(secIdx, hitIdx) {
    const sec  = _SEARCH_SECTIONS[secIdx];
    const item = (window[`_searchHits_${sec.table.replace(/[^a-z]/gi,'_')}`] || [])[hitIdx];
    if (!sec || !item) return;

    window._closeSearch();
    window._resetMobileZoom();

    const cardId       = sec.getId?.(item) ?? item.id;
    const fallbackName = sec.getName?.(item) ?? '';

    if (sec.virtual) {
        const navBtn = document.querySelector('.nav-item[onclick*="servizi"]');
        await switchView('servizi', navBtn);
        setTimeout(() => sec.openModal(item), 350);
        return;
    }

    if (sec.table === 'Farmacie' || sec.table === 'Numeri_utili') {
        const navBtn = document.querySelector('.nav-item[onclick*="servizi"]');
        await switchView('servizi', navBtn);
        await new Promise(r => setTimeout(r, 150));
        sec.openModal(item);
        setTimeout(() => window._flashCard(cardId, fallbackName), 400);
        return;
    }

    const navBtn = document.querySelector(`.nav-item[onclick*="${sec.view}"]`);
    await switchView(sec.view, navBtn);

    let tabBtn = null;
    for (let i = 0; i < 8; i++) {
        await new Promise(r => setTimeout(r, 80));
        tabBtn = document.querySelector(`button[data-table="${sec.table}"]`);
        if (tabBtn) break;
    }
    if (tabBtn) await loadTableData(sec.table, tabBtn);

    window._flashCard(cardId, fallbackName);
    setTimeout(() => sec.openModal(item), 300);
};

// ─────────────────────────────────────────────────────────────────────────
//  LOADING FEEDBACK + NETWORK ERROR
// ─────────────────────────────────────────────────────────────────────────
function setLoadingStep(msg) {
    const el = document.getElementById('loading-step');
    if (el) el.textContent = msg;
}

function showNetworkError() {
    document.getElementById('loading-error')?.classList.remove('hidden');
    const barWrap = document.getElementById('loading-bar-wrap');
    if (barWrap) barWrap.style.display = 'none';
    document.getElementById('loading-step')?.classList.add('hidden');
}

async function checkRealConnectivity() {
    if (!navigator.onLine) return false;
    try {
        const ctrl    = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 3000);
        await fetch('https://ydrpicezcwtfwdqpihsb.supabase.co/rest/v1/', { method: 'HEAD', signal: ctrl.signal });
        clearTimeout(timeout);
        return true;
    } catch { return false; }
}

function _showOfflineBanner() {
    if (document.getElementById('offline-banner')) return;
    const lang   = window.currentLang || 'it';
    const labels = { it:'Offline', en:'Offline', fr:'Hors ligne', de:'Offline', es:'Sin conexión', zh:'离线' };
    const dLabels= { it:'dati del', en:'data from', fr:'données du', de:'Daten vom', es:'datos del', zh:'数据来自' };
    let lastDateStr = '';
    try {
        const stored = localStorage.getItem('f2g_last_online');
        if (stored) {
            const d = new Date(stored);
            lastDateStr = d.toLocaleDateString(lang, { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
        }
    } catch(e) {}

    const banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.className = 'offline-badge';
    banner.innerHTML = `
        <span class="material-icons" style="font-size:14px;">cloud_off</span>
        <span>${labels[lang] || 'Offline'}${lastDateStr ? ` · ${dLabels[lang] || 'data from'} ${lastDateStr}` : ''}</span>`;
    document.body.appendChild(banner);
}

function _hideOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) { banner.style.opacity = '0'; setTimeout(() => banner.remove(), 400); }
}

function _saveOnlineTimestamp() {
    try { localStorage.setItem('f2g_last_online', new Date().toISOString()); } catch(e) {}
}

// ─────────────────────────────────────────────────────────────────────────
//  DOM CONTENT LOADED — INIT
// ─────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const netErrorTimer = setTimeout(() => {
        if (document.getElementById('loading-step')) showNetworkError();
    }, 8000);

    const swActive = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
    const isOnline = await checkRealConnectivity();

    if (!isOnline) {
        clearTimeout(netErrorTimer);
        if (swActive) { _showOfflineBanner(); }
        else          { showNetworkError(); return; }
    } else {
        _saveOnlineTimestamp();
    }

    window.addEventListener('offline', _showOfflineBanner);
    window.addEventListener('online',  () => { _hideOfflineBanner(); _saveOnlineTimestamp(); });

    // Loading steps — usa window.t() con fallback hardcoded per il momento pre-i18n
    setLoadingStep(isOnline ? (window.t?.('loading_connected') || 'Connessione stabilita...') : (window.t?.('loading_offline') || 'Modalità offline...'));
    await new Promise(r => setTimeout(r, 300));
    setLoadingStep(window.t?.('loading_data') || 'Caricamento dati...');
    await new Promise(r => setTimeout(r, 300));
    setLoadingStep(window.t?.('loading_ready') || 'Pronto!');
    await new Promise(r => setTimeout(r, 200));

    clearTimeout(netErrorTimer);

    window.currentViewName = 'home';
    history.replaceState({ view: 'home' }, '', '#/home');
    setupHeaderElements?.();
    updateNavBar?.();
    switchView('home');
    window._initPullToRefresh();
    window._showLangTooltipIfFirstVisit();
});

// ─────────────────────────────────────────────────────────────────────────
//  SWIPE GESTURE (tab switching)
// ─────────────────────────────────────────────────────────────────────────
document.addEventListener('touchstart', (e) => {
    window.touchStartX = e.changedTouches[0].screenX;
    window.touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (!document.getElementById('sub-content')) return;
    if (!window.currentMenuOptions?.length) return;

    const xDiff = e.changedTouches[0].screenX - window.touchStartX;
    const yDiff = e.changedTouches[0].screenY - window.touchStartY;

    if (Math.abs(yDiff) > Math.abs(xDiff)) return;   // scroll verticale
    if (Math.abs(xDiff) < 60) return;                  // soglia minima

    const currentIndex = window.currentMenuOptions.findIndex(o => o.table === window.currentActiveTable);
    if (currentIndex === -1) return;

    const nextIndex = xDiff > 0
        ? (currentIndex > 0 ? currentIndex - 1 : -1)
        : (currentIndex < window.currentMenuOptions.length - 1 ? currentIndex + 1 : -1);

    if (nextIndex !== -1) loadTableData(window.currentMenuOptions[nextIndex].table, null);
}, { passive: true });

window.apriTrenitalia = function() { window.open('https://www.trenitalia.com', '_blank'); };

// ─────────────────────────────────────────────────────────────────────────
//  MAPPE — Leaflet GPX
// ─────────────────────────────────────────────────────────────────────────
window.initPendingMaps = function() {
    window.pendingMaps.forEach(item => {
        const container = document.getElementById(item.id);
        if (!container || container._leaflet_id) return;

        const map = L.map(item.id, {
            zoomControl: false, scrollWheelZoom: false, dragging: false,
            touchZoom: false, doubleClickZoom: false, boxZoom: false,
            tap: false, attributionControl: false, keyboard: false
        });
        map.dragging.disable(); map.touchZoom.disable(); map.doubleClickZoom.disable();
        if (map.tap) map.tap.disable();

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(map);

        new L.GPX(item.gpx, {
            async: true,
            marker_options:  { startIconUrl: null, endIconUrl: null, shadowUrl: null },
            polyline_options:{ color: '#D32F2F', opacity: 1, weight: 4 },
        }).on('loaded', function(e) {
            const gpxLayer = e.target;
            map.fitBounds(gpxLayer.getBounds(), { padding: [20, 20] });

            const points = gpxLayer.getLayers()
                .filter(l => l instanceof L.Polyline)
                .flatMap(l => {
                    const ll = l.getLatLngs();
                    return Array.isArray(ll[0]) ? ll.flat() : ll;
                });

            if (!points.length) return;

            const createLabelIcon = (text, color) => L.divIcon({
                className: 'custom-map-label',
                html: `<div style="display:flex;flex-direction:column;align-items:center;">
                    <div style="background:white;padding:2px 6px;border-radius:4px;border:1px solid #ccc;font-size:10px;font-weight:bold;color:#333;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.2);margin-bottom:2px;">${text}</div>
                    <div style="width:10px;height:10px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>
                </div>`,
                iconSize: [100, 40], iconAnchor: [50, 38],
            });

            if (item.startLabel) L.marker(points[0],            { icon: createLabelIcon(item.startLabel, '#27ae60'), interactive: false }).addTo(map);
            if (item.endLabel)   L.marker(points[points.length-1],{ icon: createLabelIcon(item.endLabel,   '#c0392b'), interactive: false }).addTo(map);
        }).addTo(map);
    });
    window.pendingMaps = [];
};

window.userMarker         = null;
window.userAccuracyCircle = null;

// ─────────────────────────────────────────────────────────────────────────
//  GEO MODAL FACTORY (DRY: elimina ~120 righe duplicate)
// ─────────────────────────────────────────────────────────────────────────
window.GeoModal = {
    show(config) {
        this.dismiss();

        const overlay = document.createElement('div');
        overlay.id = 'geo-modal-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;padding-bottom:24px;';

        const actionsHtml = config.actions.map(({ label, isPrimary }, i) => {
            const base = 'width:100%;padding:15px;border:none;border-radius:16px;font-size:0.9rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;font-family:inherit;';
            const style = isPrimary
                ? `${base}background:${config.iconBg};color:white;box-shadow:0 4px 14px rgba(0,0,0,0.2);`
                : `${base}background:transparent;border:2px solid #e2e8f0;color:#94a3b8;`;
            return `<button data-geo-action="${i}" style="${style}">${label}</button>`;
        }).join('');

        overlay.innerHTML = `
            <div style="background:#fff;border-radius:28px;padding:28px 24px 24px;max-width:400px;width:calc(100% - 32px);box-shadow:0 -4px 40px rgba(0,0,0,0.18);animation:geoModalIn 0.35s cubic-bezier(0.2,0.8,0.2,1) forwards;">
                <style>@keyframes geoModalIn{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}</style>
                <div style="display:flex;justify-content:center;margin-bottom:20px;">
                    <div style="width:64px;height:64px;border-radius:20px;background:${config.iconBg};display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(0,0,0,0.15);">
                        <span class="material-icons" style="color:white;font-size:32px;">${config.iconName}</span>
                    </div>
                </div>
                <h2 style="text-align:center;font-family:'Roboto Slab',serif;font-size:1.3rem;font-weight:700;color:#264653;margin:0 0 10px;">${config.title}</h2>
                <p style="text-align:center;font-size:0.88rem;color:#64748b;line-height:1.6;margin:0 0 ${config.subBody ? '8px' : '24px'};">${config.body}</p>
                ${config.subBody ? `<p style="text-align:center;font-size:0.78rem;color:#94a3b8;line-height:1.5;margin:0 0 24px;">${config.subBody}</p>` : ''}
                ${config.hint   ? `<div id="geo-browser-hint" style="display:none;background:#F4F1DE;border-radius:12px;padding:10px 14px;margin-bottom:16px;font-size:0.78rem;color:#606C38;font-weight:600;text-align:center;line-height:1.5;">📍 ${config.hint}</div>` : ''}
                <div style="display:flex;flex-direction:column;gap:10px;">${actionsHtml}</div>
            </div>`;

        document.body.appendChild(overlay);

        config.actions.forEach(({ onClick }, i) => {
            overlay.querySelector(`[data-geo-action="${i}"]`)
                ?.addEventListener('click', () => { this.dismiss(); onClick?.(); });
        });
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.dismiss(); });

        // Hint browser (non su Safari iOS reale)
        if (config.hint) {
            const ua = navigator.userAgent;
            const isRealSafari = ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Firefox') && !ua.includes('Edg');
            if (!isRealSafari) overlay.querySelector('#geo-browser-hint')?.style.setProperty('display', 'block');
        }

        return overlay;
    },

    dismiss() {
        const el = document.getElementById('geo-modal-overlay');
        if (!el) return;
        el.style.cssText += ';opacity:0;transition:opacity 0.25s;';
        setTimeout(() => el.remove(), 250);
    },
};

// Wrapper pubblici — interfaccia invariata
function _showGeoRequestModal(onGranted, onDenied) {
    window.GeoModal.show({
        iconName: 'my_location',
        iconBg:   'linear-gradient(135deg,#E76F51,#c0392b)',
        title:    window.t('geo_title'),
        body:     window.t('geo_desc'),
        subBody:  window.t('geo_privacy'),
        hint:     window.t('geo_hint'),
        actions: [
            { label: window.t('geo_confirm'), isPrimary: true,  onClick: onGranted },
            { label: window.t('geo_cancel'),  isPrimary: false, onClick: onDenied  },
        ],
    });
}

function _showGeoErrorModal(title, message) {
    window.GeoModal.show({
        iconName: 'location_off',
        iconBg:   '#f1f5f9',
        title,
        body: message,
        actions: [{ label: window.t('geo_ok'), isPrimary: true, onClick: null }],
    });
}

// Alias privato mantenuto per retrocompatibilità interna
function _dismissGeoModal() { window.GeoModal.dismiss(); }

// ─────────────────────────────────────────────────────────────────────────
//  GPS PERMISSION + TRACKING
// ─────────────────────────────────────────────────────────────────────────
window._requestGeoPermission = async function(onGranted, onDenied) {
    if (!navigator.geolocation) {
        _showGeoErrorModal(window.t('geo_blocked_title'), window.t('geo_unsupported'));
        onDenied?.();
        return;
    }

    let permState = 'prompt';
    if (navigator.permissions) {
        try {
            const perm = await navigator.permissions.query({ name: 'geolocation' });
            permState = perm.state;
            perm.onchange = () => {
                if (perm.state === 'denied') {
                    try { localStorage.removeItem('f2g_geo_granted'); } catch(e) {}
                    _showGeoErrorModal(window.t('geo_blocked_title'), window.t('geo_blocked_msg'));
                }
            };
        } catch(e) {}
    }

    // Fallback iOS Safari (non supporta Permissions API)
    if (permState === 'prompt') {
        try { if (localStorage.getItem('f2g_geo_granted') === 'true') permState = 'granted'; } catch(e) {}
    }

    if (permState === 'denied') {
        _showGeoErrorModal(window.t('geo_blocked_title'), window.t('geo_blocked_msg'));
        onDenied?.();
        return;
    }

    if (permState === 'granted') { onGranted(); return; }

    _showGeoRequestModal(onGranted, onDenied);
};

window.toggleGPS = function() {
    const map = window.currentMap;
    const btn = document.getElementById('btn-gps');
    if (!map) return;

    if (window.GeoTracker._isTracking('sentieri')) {
        window.GeoTracker.stop('sentieri');
        if (window.userMarker)         { map.removeLayer(window.userMarker);         window.userMarker = null; }
        if (window.userAccuracyCircle) { map.removeLayer(window.userAccuracyCircle); window.userAccuracyCircle = null; }
        if (btn) {
            btn.innerHTML  = '<span class="material-icons text-sm">my_location</span> GPS';
            btn.className  = 'flex-1 py-3 bg-sky-50 text-sky-600 border border-sky-200 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform';
        }
        return;
    }

    window._requestGeoPermission(
        () => _startGeoWatch(btn, map),
        () => {
            if (btn) {
                btn.innerHTML = '<span class="material-icons text-sm">my_location</span> GPS';
                btn.className = 'flex-1 py-3 bg-sky-50 text-sky-600 border border-sky-200 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform';
            }
        }
    );
};

function _startGeoWatch(btn, map) {
    const hasCachedPos = window.GeoTracker?.getLastPos();
    if (!hasCachedPos && btn) {
        btn.innerHTML = '<span class="material-icons spin text-sm">refresh</span> Cerco...';
        btn.className = 'flex-1 py-3 bg-amber-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform';
    }

    if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' })
            .then(p => { if (p.state === 'prompt') _showGeoBanner(); })
            .catch(() => {});
    }

    window.GeoTracker.start('sentieri', ({ lat, lng, accuracy, isFirst }) => {
        _dismissGeoBanner();
        if (isFirst) {
            window.userMarker?.let?.(m => map.removeLayer(m));
            window.userAccuracyCircle?.let?.(c => map.removeLayer(c));
            // Compatibilità vanilla: rimuovi se esistono
            if (window.userMarker)         { map.removeLayer(window.userMarker);         window.userMarker = null; }
            if (window.userAccuracyCircle) { map.removeLayer(window.userAccuracyCircle); window.userAccuracyCircle = null; }

            window.userMarker = L.circleMarker([lat, lng], {
                radius: 8, fillColor: '#2196F3', color: '#fff', weight: 2, opacity: 1, fillOpacity: 1,
            }).addTo(map);

            window.userAccuracyCircle = L.circle([lat, lng], {
                radius: accuracy, color: '#2196F3', fillColor: '#2196F3', fillOpacity: 0.12, weight: 1,
            }).addTo(map);

            map.setView([lat, lng], 15);

            if (btn) {
                btn.innerHTML = '<span class="material-icons text-sm">stop_circle</span> Stop';
                btn.className = 'flex-1 py-3 bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform';
            }
        } else {
            window.userMarker?.setLatLng([lat, lng]);
            if (window.userAccuracyCircle) {
                window.userAccuracyCircle.setLatLng([lat, lng]);
                window.userAccuracyCircle.setRadius(accuracy);
            }
        }
    });
}

function _showGeoBanner() {
    if (document.getElementById('geo-permission-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'geo-permission-banner';
    banner.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;background:#264653;color:white;padding:12px 20px;border-radius:14px;font-size:13px;font-weight:700;max-width:310px;width:calc(100% - 32px);text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.3);pointer-events:none;transition:opacity 0.3s';
    banner.innerHTML = '📍 Cerca il permesso nella <strong>barra del browser</strong> e tocca <strong>"Consenti"</strong>';
    document.body.appendChild(banner);
    setTimeout(_dismissGeoBanner, 8000);
}

function _dismissGeoBanner() {
    const b = document.getElementById('geo-permission-banner');
    if (b) { b.style.opacity = '0'; setTimeout(() => b.remove(), 300); }
}

function _showGeoError(btn, msg) {
    _showGeoErrorModal('Errore GPS', msg);
    if (btn) {
        btn.innerHTML = '<span class="material-icons">my_location</span> GPS';
        btn.style.backgroundColor = '#29B6F6';
    }
}

// ─────────────────────────────────────────────────────────────────────────
//  CHICCO — Mascotte meteo con animazione Lottie
// ─────────────────────────────────────────────────────────────────────────
const CHICCO_STATIC_URL = 'https://res.cloudinary.com/dkg0jfady/image/upload/v1770990643/chicco_wxxwbm.png';
const CHICCO_LOTTIE_URL = 'https://res.cloudinary.com/dkg0jfady/raw/upload/chicco.json';

let _chiccoLottieData = null;
let _chiccoCardAnim   = null;

function _injectChiccoFAB() {
    if (document.getElementById('chicco-fab-wrap')) return;
    const fab = document.createElement('div');
    fab.id = 'chicco-fab-wrap';
    fab.className = 'chicco-fab';
    fab.innerHTML = `
        <button class="chicco-fab-btn" onclick="window.toggleChicco()"
                aria-label="Meteo Cinque Terre" id="chicco-fab-btn">
            <img src="${CHICCO_STATIC_URL}" alt="Chicco" class="chicco-fab-img"
                 id="chicco-fab-static" draggable="false">
        </button>`;
    document.body.appendChild(fab);
}

async function _loadChiccoLottie() {
    if (_chiccoLottieData) return _chiccoLottieData;
    try {
        const resp = await fetch(CHICCO_LOTTIE_URL);
        _chiccoLottieData = await resp.json();
        return _chiccoLottieData;
    } catch(e) {
        console.warn('[Chicco] Lottie load failed:', e);
        return null;
    }
}

window.toggleChicco = async function() {
    if (document.getElementById('chicco-weather-card')) { window._closeChiccoCard(); return; }

    window._haptic?.(10);

    const fabWrap = document.getElementById('chicco-fab-wrap');
    if (fabWrap) fabWrap.style.display = 'none';

    const lottieData = await _loadChiccoLottie();

    const card = document.createElement('div');
    card.id = 'chicco-weather-card';
    card.className = 'chicco-card';
    card.innerHTML = `
        <button class="chicco-card-close" onclick="window._closeChiccoCard()">
            <span class="material-icons" style="font-size:16px;">close</span>
        </button>
        <div class="chicco-card-header">
            <div style="position:relative;width:52px;height:52px;">
                <div id="chicco-card-anim" style="width:100%;height:100%;"></div>
                <img id="chicco-card-static-fallback" src="${CHICCO_STATIC_URL}"
                     style="width:100%;height:100%;object-fit:contain;position:absolute;top:0;left:0;display:none;transform:scale(1.02);" alt="Chicco">
            </div>
            <div>
                <div style="font-size:13px;font-weight:800;color:#264653;text-transform:uppercase;letter-spacing:0.08em;">Cinque Terre</div>
                <div style="font-size:11px;color:#94a3b8;font-weight:600;">Live Weather</div>
            </div>
        </div>
        <div id="chicco-card-body" class="chicco-card-weather">
            <div style="display:flex;align-items:center;gap:8px;color:#94a3b8;">
                <span class="material-icons spin" style="font-size:18px;">sync</span>
                <span style="font-size:13px;font-weight:600;">${window.t?.('loading') || 'Loading...'}</span>
            </div>
        </div>`;
    document.body.appendChild(card);

    const animContainer    = document.getElementById('chicco-card-anim');
    const staticFallback   = document.getElementById('chicco-card-static-fallback');

    if (lottieData && animContainer && window.lottie) {
        _chiccoCardAnim = window.lottie.loadAnimation({
            container: animContainer, renderer: 'svg', loop: true, autoplay: true, animationData: lottieData,
        });
        let loopCount = 0;
        _chiccoCardAnim.addEventListener('loopComplete', () => {
            if (++loopCount >= 3) {
                _chiccoCardAnim.destroy();
                _chiccoCardAnim = null;
                animContainer.style.display  = 'none';
                staticFallback.style.display = 'block';
            }
        });
    } else if (animContainer) {
        animContainer.style.display  = 'none';
        staticFallback.style.display = 'block';
    }

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'chicco-card-backdrop';
    backdrop.style.cssText = 'position:fixed;inset:0;z-index:9002;';
    backdrop.onclick = () => window._closeChiccoCard();
    document.body.appendChild(backdrop);

    // Fetch meteo
    try {
        const info  = window.getChiccoRealTimeAdvice ? await window.getChiccoRealTimeAdvice() : { weather: '😴 ...', advice: '' };
        const bodyEl = document.getElementById('chicco-card-body');
        if (bodyEl) bodyEl.innerHTML = `
            <div class="chicco-card-weather">${info.weather}</div>
            <div class="chicco-card-advice">${info.advice}</div>`;
    } catch(e) {
        const bodyEl = document.getElementById('chicco-card-body');
        if (bodyEl) bodyEl.innerHTML = '<div style="color:#94a3b8;font-size:13px;">Dati meteo non disponibili.</div>';
    }
};

window._closeChiccoCard = function() {
    if (_chiccoCardAnim) { try { _chiccoCardAnim.destroy(); } catch(e) {} _chiccoCardAnim = null; }

    const fabWrap = document.getElementById('chicco-fab-wrap');
    if (fabWrap) { fabWrap.style.display = ''; fabWrap.classList.remove('chicco-talking'); }

    const card     = document.getElementById('chicco-weather-card');
    const backdrop = document.getElementById('chicco-card-backdrop');
    if (card) {
        Object.assign(card.style, { transition: 'opacity 0.18s ease, transform 0.18s ease', opacity: '0', transform: 'translateY(8px) scale(0.96)' });
        setTimeout(() => card.remove(), 200);
    }
    backdrop?.remove();
};

// ─────────────────────────────────────────────────────────────────────────
//  BUMP LANG PANEL
// ─────────────────────────────────────────────────────────────────────────
window._toggleBumpLangPanel = function() {
    if (document.getElementById('bump-lang-panel')) { window._closeBumpLangPanel(); return; }

    const panel = document.createElement('div');
    panel.id = 'bump-lang-panel';

    window.AVAILABLE_LANGS.forEach(function(l, i) {
        var isFirst  = i === 0;
        var isLast   = i === window.AVAILABLE_LANGS.length - 1;
        var isActive = l.code === window.currentLang;

        var btn = document.createElement('button');
        btn.style.cssText = 'width:100%;display:flex;align-items:center;gap:14px;padding:13px 20px;text-align:left;border:none;cursor:pointer;'
            + 'background:' + (isActive ? '#F4F1DE' : 'transparent') + ';'
            + '-webkit-tap-highlight-color:transparent;'
            + (isFirst ? 'border-radius:20px 20px 4px 4px;' : isLast ? 'border-radius:4px 4px 20px 20px;' : '');

        btn.addEventListener('mouseenter', function() { this.style.background = isActive ? '#F4F1DE' : '#f8fafc'; });
        btn.addEventListener('mouseleave', function() { this.style.background = isActive ? '#F4F1DE' : 'transparent'; });
        btn.addEventListener('click', (function(code) { return function() { changeLanguage(code); window._closeBumpLangPanel(); }; })(l.code));

        var flagSpan  = document.createElement('span');
        flagSpan.style.cssText = 'font-size:1.4rem;line-height:1;flex-shrink:0;';
        flagSpan.textContent   = l.flag;

        var labelSpan = document.createElement('span');
        labelSpan.style.cssText = 'font-size:0.85rem;font-weight:700;color:#264653;flex:1;';
        labelSpan.textContent   = l.label;

        btn.appendChild(flagSpan);
        btn.appendChild(labelSpan);

        if (isActive) {
            var check = document.createElement('span');
            check.className    = 'material-icons';
            check.style.cssText= 'color:#606C38;font-size:18px;flex-shrink:0;';
            check.textContent  = 'check_circle';
            btn.appendChild(check);
        }
        panel.appendChild(btn);
    });

    document.body.appendChild(panel);

    var backdrop = document.createElement('div');
    backdrop.id  = 'bump-lang-backdrop';
    backdrop.style.cssText = 'position:fixed;inset:0;z-index:9001;';
    backdrop.onclick = function() { window._closeBumpLangPanel(); };
    document.body.appendChild(backdrop);

    document.getElementById('bump-lang-trigger')?.setAttribute('aria-expanded', 'true');
};

window._closeBumpLangPanel = function() {
    var panel    = document.getElementById('bump-lang-panel');
    var backdrop = document.getElementById('bump-lang-backdrop');
    if (panel) {
        panel.style.cssText += ';transition:opacity 0.18s ease,transform 0.18s ease;opacity:0;transform:translateX(-50%) translateY(8px) scale(0.96);';
        setTimeout(function() { panel.parentNode?.removeChild(panel); }, 190);
    }
    backdrop?.parentNode?.removeChild(backdrop);
    document.getElementById('bump-lang-trigger')?.setAttribute('aria-expanded', 'false');
};

// ─────────────────────────────────────────────────────────────────────────
//  TOOLTIP FIRST-VISIT LINGUA
// ─────────────────────────────────────────────────────────────────────────
window._showLangTooltipIfFirstVisit = function() {
    var STORAGE_KEY = 'five2go_lang_tooltip_seen';
    if (localStorage.getItem(STORAGE_KEY)) return;

    setTimeout(function() {
        var trigger = document.getElementById('bump-lang-trigger');
        if (!trigger) return;

        var pulse = document.createElement('span');
        pulse.className = 'lang-pulse-ring';
        pulse.id = 'lang-pulse-ring';
        var inner = trigger.querySelector('.lang-btn-inner');
        if (inner) { inner.style.position = 'relative'; inner.appendChild(pulse); }
        else        { trigger.style.position = 'relative'; trigger.appendChild(pulse); }

        var tooltip = document.createElement('div');
        tooltip.className = 'lang-first-tooltip';
        tooltip.id = 'lang-first-tooltip';
        tooltip.setAttribute('role', 'status');
        tooltip.setAttribute('aria-live', 'polite');
        tooltip.innerHTML = '<span class="material-icons">translate</span><span>Change language · Cambia lingua</span>';
        document.body.appendChild(tooltip);

        var dismissed = false;
        function dismiss() {
            if (dismissed) return;
            dismissed = true;
            localStorage.setItem(STORAGE_KEY, '1');
            var tt = document.getElementById('lang-first-tooltip');
            if (tt) { tt.style.animation = 'tooltipFadeOut 0.25s ease forwards'; setTimeout(function() { tt.parentNode?.removeChild(tt); }, 260); }
            var pr = document.getElementById('lang-pulse-ring');
            pr?.parentNode?.removeChild(pr);
        }

        tooltip.addEventListener('click', function() { dismiss(); window._toggleBumpLangPanel(); });
        var autoTimer = setTimeout(dismiss, 6000);

        var origToggle = window._toggleBumpLangPanel;
        window._toggleBumpLangPanel = function() { dismiss(); clearTimeout(autoTimer); origToggle(); };
    }, 1800);
};

// ─────────────────────────────────────────────────────────────────────────
//  PULL-TO-REFRESH
// ─────────────────────────────────────────────────────────────────────────
window._initPullToRefresh = function() {
    var container = document.getElementById('app-content');
    if (!container || container._ptrAttached) return;
    container._ptrAttached = true;

    if (!document.getElementById('ptr-indicator')) {
        var ptrEl = document.createElement('div');
        ptrEl.id = 'ptr-indicator';
        ptrEl.setAttribute('aria-hidden', 'true');
        ptrEl.style.cssText = [
            'position:fixed','top:0','left:0','right:0','height:0','overflow:hidden','z-index:9001',
            'display:flex','align-items:center','justify-content:center',
            'background:rgba(244,241,222,0.96)','backdrop-filter:blur(8px)','-webkit-backdrop-filter:blur(8px)',
            'transition:height 0.18s cubic-bezier(0.2,0.8,0.2,1)','pointer-events:none',
            'border-bottom:1px solid rgba(38,70,83,0.08)',
        ].join(';');
        ptrEl.innerHTML = '<div id="ptr-inner" style="opacity:0;transition:opacity 0.2s;display:flex;align-items:center;gap:8px;">'
            + '<span id="ptr-icon" class="material-icons" style="color:#264653;font-size:20px;transition:transform 0.3s ease;">arrow_downward</span>'
            + '<span id="ptr-label" style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#264653;"></span>'
            + '</div>';
        document.body.appendChild(ptrEl);
    }

    var THRESHOLD = 65, MAX_PULL = 100, startY = 0, pulling = false, released = false;

    function ptrReset() {
        var el = document.getElementById('ptr-indicator'), inner = document.getElementById('ptr-inner'), icon = document.getElementById('ptr-icon');
        if (el)    el.style.height    = '0';
        if (inner) inner.style.opacity = '0';
        if (icon)  { icon.style.transform = ''; icon.textContent = 'arrow_downward'; icon.classList.remove('spin'); }
        pulling = false; released = false;
    }

    container.addEventListener('touchstart', function(e) {
        if (!released && container.scrollTop <= 0) { startY = e.touches[0].clientY; pulling = true; }
    }, { passive: true });

    container.addEventListener('touchmove', function(e) {
        if (!pulling || released) return;
        var dy = Math.max(0, e.touches[0].clientY - startY);
        if (dy <= 0 || container.scrollTop > 0) return;
        var el = document.getElementById('ptr-indicator'), inner = document.getElementById('ptr-inner'),
            icon = document.getElementById('ptr-icon'), label = document.getElementById('ptr-label');
        if (!el) return;
        el.style.height       = Math.min(dy * 0.55, 56) + 'px';
        if (inner) inner.style.opacity = String(Math.min((dy / MAX_PULL) * 2, 1));
        if (icon)  icon.style.transform= 'rotate(' + Math.min((dy / THRESHOLD) * 180, 180) + 'deg)';
        if (label) label.textContent   = dy >= THRESHOLD
            ? (window.t?.('ptr_release') || 'Rilascia per aggiornare')
            : (window.t?.('ptr_pull')    || 'Tira per aggiornare');
    }, { passive: true });

    container.addEventListener('touchend', function(e) {
        if (!pulling || released) return;
        var dy = Math.max(0, e.changedTouches[0].clientY - startY);
        pulling = false;
        if (dy >= THRESHOLD) {
            released = true;
            var icon = document.getElementById('ptr-icon'), label = document.getElementById('ptr-label');
            if (icon)  { icon.textContent = 'refresh'; icon.classList.add('spin'); icon.style.transform = ''; }
            if (label) label.textContent = window.t?.('ptr_loading') || 'Aggiornamento...';
            setTimeout(function() {
                var table = window.currentActiveTable;
                if (table && table !== 'Mappe' && window.appCache) {
                    delete window.appCache[table];
                    window._invalidateUniqueValCache();   // ← invalida cache filtri
                    loadTableData(table, null);
                } else if (window.currentViewName === 'servizi') {
                    renderServicesGrid();
                }
                setTimeout(ptrReset, 600);
            }, 700);
        } else {
            ptrReset();
        }
    }, { passive: true });
};

// ─────────────────────────────────────────────────────────────────────────
//  BUS MAP
// ─────────────────────────────────────────────────────────────────────────
window.initBusMap = function(fermate) {
    const mapContainer = document.getElementById('bus-map');
    if (!mapContainer) return;
    window.currentBusMap?.remove();
    window.currentBusMap = null;

    const map = L.map('bus-map', { zoomControl: false }).setView([44.1000, 9.7385], 13);
    window.currentBusMap = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO', subdomains: 'abcd', maxZoom: 20,
    }).addTo(map);

    const busIcon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#E9C46A,#F4A261);border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;">🚌</div>`,
        iconSize: [28,28], iconAnchor: [14,14], popupAnchor: [0,-16],
    });

    const markersGroup  = new L.FeatureGroup();
    const labelPartenza = window.t('departure') || 'Partenza';
    const labelArrivo   = window.t('arrival')   || 'Arrivo';

    fermate.forEach(f => {
        if (!f.LAT || !f.LONG) return;
        L.marker([f.LAT, f.LONG], { icon: busIcon }).addTo(map)
            .bindPopup(`
            <div style="text-align:center;min-width:160px;font-family:inherit;">
                <div style="font-weight:800;font-size:0.9rem;color:#1e293b;margin-bottom:10px;line-height:1.2;">${f.NOME_FERMATA}</div>
                <div style="display:flex;gap:6px;justify-content:center;">
                    <button onclick="setBusStop('partenza','${f.ID}')"
                        style="flex:1;background:#16a34a;color:white;border:none;padding:7px 8px;border-radius:8px;cursor:pointer;font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;">↑ ${labelPartenza}</button>
                    <button onclick="setBusStop('arrivo','${f.ID}')"
                        style="flex:1;background:#dc2626;color:white;border:none;padding:7px 8px;border-radius:8px;cursor:pointer;font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;">↓ ${labelArrivo}</button>
                </div>
            </div>`);
        markersGroup.addLayer;
    });
    map.addLayer(markersGroup);

    window._busGeoMarker = null;
    setTimeout(() => {
        map.invalidateSize();
        window._requestGeoPermission(() => {
            window.GeoTracker.start('bus', ({ lat, lng, accuracy, isFirst }) => {
                window._busGeoMarker && map.removeLayer(window._busGeoMarker);
                const userIcon = L.divIcon({
                    className: '',
                    html: `<div style="position:relative;width:20px;height:20px;">
                        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.22);animation:geoPulse 1.8s ease-out infinite;"></div>
                        <div style="position:absolute;inset:4px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 2px 6px rgba(59,130,246,0.55);"></div>
                        <style>@keyframes geoPulse{0%{transform:scale(1);opacity:.6}70%{transform:scale(2.5);opacity:0}100%{opacity:0}}</style>
                    </div>`,
                    iconSize: [20,20], iconAnchor: [10,10],
                });
                window._busGeoMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 })
                    .addTo(map)
                    .bindPopup(`<div style="font-weight:700;font-size:0.85rem;color:#1e293b;">📍 Sei qui</div>`);
                if (isFirst && lat > 43.9 && lat < 44.3 && lng > 9.5 && lng < 10.0) {
                    map.setView([lat, lng], 14, { animate: true });
                }
            });
        });
    }, 250);
};

window.setBusStop = function(type, value) {
    const selectId = type === 'partenza' ? 'selPartenza' : 'selArrivo';
    const select   = document.getElementById(selectId);
    if (select) {
        select.value = value;
        window.flashInputFeedback(selectId);
        window.handleBusSelectionChange(type);
        window.currentBusMap?.closePopup();
    }
};

window.toggleBusMap = function() {
    const container = document.getElementById('bus-map-wrapper');
    const btn       = document.getElementById('btn-bus-map-toggle');
    if (!container) return;
    const isHidden = container.classList.contains('hidden');
    container.classList.toggle('hidden', !isHidden);
    if (btn) {
        if (isHidden) {
            btn.classList.add('bg-indigo-500','text-white','border-transparent');
            btn.classList.remove('bg-indigo-50','text-indigo-500','border-indigo-100');
            btn.innerHTML = '<span class="material-icons text-lg">expand_less</span>';
            setTimeout(() => window.currentBusMap?.invalidateSize(), 100);
        } else {
            btn.classList.remove('bg-indigo-500','text-white','border-transparent');
            btn.classList.add('bg-indigo-50','text-indigo-500','border-indigo-100');
            btn.innerHTML = '<span class="material-icons text-lg">map</span>';
        }
    }
};

// ─────────────────────────────────────────────────────────────────────────
//  MAP PRE-FILTER SHORTCUTS
// ─────────────────────────────────────────────────────────────────────────
window._openMapAperitivo  = function() { window._mapPreFilter = 'aperitivo';  switchView('mappa'); };
window._openMapVino       = function() { window._mapPreFilter = 'vino';       switchView('mappa'); };
window._openMapSpiaggia   = function() { window._mapPreFilter = 'spiaggia';   switchView('mappa'); };
window._openMapAttrazione = function() { window._mapPreFilter = 'attrazione'; switchView('mappa'); };

// ─────────────────────────────────────────────────────────────────────────
//  GEOTRACKER — Pub/Sub singleton (unico watchPosition condiviso)
// ─────────────────────────────────────────────────────────────────────────
window.GeoTracker = (function() {
    let _watchId  = null;
    let _lastPos  = null;
    let _smoothed = null;
    const _subs   = {};

    function _smooth(rawLat, rawLng, accuracy) {
        const clampedAcc = Math.max(accuracy || 50, 1);
        const alpha      = Math.min(1.0, Math.max(0.05, 20 / clampedAcc));
        if (!_smoothed) {
            _smoothed = { lat: rawLat, lng: rawLng };
        } else {
            _smoothed.lat = _smoothed.lat * (1 - alpha) + rawLat * alpha;
            _smoothed.lng = _smoothed.lng * (1 - alpha) + rawLng * alpha;
        }
        return { lat: _smoothed.lat, lng: _smoothed.lng, accuracy: clampedAcc, alpha };
    }

    function _ensureWatch() {
        if (_watchId != null || !navigator.geolocation) return;
        _watchId = navigator.geolocation.watchPosition(
            (pos) => {
                _dismissGeoBanner?.();
                const s           = _smooth(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
                const isFirstGlobal = !_lastPos;
                _lastPos = { ...s };
                if (isFirstGlobal) {
                    try { localStorage.setItem('f2g_geo_granted', 'true'); } catch(e) {}
                }
                Object.keys(_subs).forEach(name => {
                    try {
                        const sub = _subs[name];
                        if (sub) { sub.cb({ ...s, isFirst: sub.first }); sub.first = false; }
                    } catch(e) { console.warn(`GeoTracker[${name}]:`, e); }
                });
            },
            (err) => {
                _dismissGeoBanner?.();
                console.warn(`GeoTracker error (${err.code}): ${err.message}`);
                if (err.code === 1) { try { localStorage.removeItem('f2g_geo_granted'); } catch(e) {} }
                Object.keys(_subs).forEach(name => {
                    try { _subs[name]?.onError?.(err); } catch(e) {}
                });
            },
            { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 }
        );
    }

    function _maybeStopWatch() {
        if (Object.keys(_subs).length > 0 || _watchId == null) return;
        navigator.geolocation.clearWatch(_watchId);
        _watchId = null;
    }

    return {
        start(name, onUpdate, onError) {
            if (!navigator.geolocation) return;
            if (_subs[name]) delete _subs[name];
            _subs[name] = { cb: onUpdate, onError: onError || null, first: true };
            if (_lastPos) {
                try { onUpdate({ ..._lastPos, isFirst: true }); _subs[name].first = false; } catch(e) {}
            }
            _ensureWatch();
        },
        stop(name)  { delete _subs[name]; _maybeStopWatch(); },
        stopAll()   {
            Object.keys(_subs).forEach(name => delete _subs[name]);
            if (_watchId != null) { navigator.geolocation.clearWatch(_watchId); _watchId = null; }
            _lastPos = null; _smoothed = null;
        },
        _isTracking(name) { return _subs[name] != null; },
        getLastPos()      { return _lastPos ? { ..._lastPos } : null; },
    };
})();

// Legacy shims (retrocompatibilità)
window.startBusGeoWatch  = (cb) => window.GeoTracker.start('bus', p => cb({ coords: { latitude: p.lat, longitude: p.lng, accuracy: p.accuracy } }));
window.stopBusGeoWatch   = ()   => window.GeoTracker.stop('bus');
window.getCachedPosition = (cb) => {
    const cached = window.GeoTracker.getLastPos();
    if (cached) { cb({ coords: { latitude: cached.lat, longitude: cached.lng, accuracy: cached.accuracy } }); return; }
    window.GeoTracker.start('_once', p => { window.GeoTracker.stop('_once'); cb({ coords: { latitude: p.lat, longitude: p.lng, accuracy: p.accuracy } }); });
};

// ─────────────────────────────────────────────────────────────────────────
//  BUS STOPS + SELECTION HANDLERS
// ─────────────────────────────────────────────────────────────────────────
window.loadAllStops = async function() {
    const selPart = document.getElementById('selPartenza');
    const selArr  = document.getElementById('selArrivo');
    if (!selPart || !selArr) return;

    if (!window.cachedStops) {
        const { data, error } = await window.supabaseClient
            .from('Fermate_bus').select('ID, NOME_FERMATA, LAT, LONG').order('NOME_FERMATA', { ascending: true });
        if (error) { console.error('Errore fermate:', error); return; }
        window.cachedStops = data;
    }

    if (!window._busConnMap) {
        selPart.innerHTML = `<option value="" disabled selected>⏳ Caricamento orari...</option>`;
        selPart.disabled  = true;
        const { data: allOrari, error: errOrari } = await window.supabaseClient.from('Orari_bus').select('ID_FERMATA, ID_CORSA');
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

    const allOpts = window.cachedStops.map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
    selPart.innerHTML = `<option value="" selected>${window.t('select_start')}</option>` + allOpts;
    selArr.innerHTML  = `<option value="" selected>${window.t('select_placeholder')}</option>`;
    selArr.disabled   = false;

    window.initBusMap?.(window.cachedStops);
};

window.handleBusSelectionChange = function(source) {
    const selPart = document.getElementById('selPartenza');
    const selArr  = document.getElementById('selArrivo');
    if (!selPart || !selArr || !window.cachedStops || source === 'arrivo') return;

    window.flashInputFeedback?.('selPartenza');
    const prevArrivo = selArr.value;
    const allOpts    = window.cachedStops
        .sort((a, b) => a.NOME_FERMATA.localeCompare(b.NOME_FERMATA))
        .map(f => `<option value="${f.ID}">${f.NOME_FERMATA}</option>`).join('');
    selArr.innerHTML = `<option value="" selected>${window.t('select_placeholder')}</option>` + allOpts;
    if (prevArrivo) selArr.value = prevArrivo;
};

window.handleFerrySelectionChange = function(source) {
    const selPart = document.getElementById('selPartenzaFerry');
    const selArr  = document.getElementById('selArrivoFerry');
    const stops   = window.FERRY_STOPS || [];
    if (!stops.length || source === 'arrivo' || !selPart || !selArr) return;

    window.flashInputFeedback?.('selPartenzaFerry');
    const selectedVal = selPart.value;
    const prevArrivo  = selArr.value;

    if (!selectedVal) {
        selArr.innerHTML = `<option value="" disabled selected>${window.t('select_placeholder')}</option>` +
            stops.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
        selArr.disabled = false;
        return;
    }

    const validStops = stops.filter(s => s.id !== selectedVal);
    selArr.innerHTML = `<option value="" disabled selected>${window.t('select_arrival_placeholder')}</option>` +
        validStops.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
    selArr.disabled = false;
    selArr.value    = (prevArrivo && validStops.some(s => s.id === prevArrivo)) ? prevArrivo : '';
};

window.flashInputFeedback = function(elementId) {
    const el = document.getElementById(elementId);
    const wrapper = el?.parentElement?.parentElement;
    if (!wrapper) return;
    wrapper.classList.add('bg-slate-100', 'rounded-lg');
    setTimeout(() => wrapper.classList.remove('bg-slate-100', 'rounded-lg'), 300);
};

// ─────────────────────────────────────────────────────────────────────────
//  TRANSPORT SEARCH (bus + traghetto)
// ─────────────────────────────────────────────────────────────────────────
window.eseguiRicercaBus = async function() {
    const selPartenza = document.getElementById('selPartenza');
    const selArrivo   = document.getElementById('selArrivo');
    const selData     = document.getElementById('selData');
    const selOra      = document.getElementById('selOra');
    const nextCard    = document.getElementById('nextBusCard');
    const list        = document.getElementById('otherBusList');
    const resultsContainer = document.getElementById('busResultsContainer');
    if (!selPartenza || !selArrivo || !selData || !selOra) return;

    const partenzaId = parseInt(selPartenza.value);
    const arrivoId   = parseInt(selArrivo.value);
    if (!partenzaId || !arrivoId) return;

    const [y, m, d]  = selData.value.split('-').map(Number);
    const dateObj    = new Date(y, m - 1, d);
    const isFestivo  = typeof isItalianHoliday === 'function' ? isItalianHoliday(dateObj) : dateObj.getDay() === 0;
    const dayBadge   = `<span class="bg-white/20 backdrop-blur px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider text-white border border-white/20">${isFestivo ? window.t('badge_holiday') : window.t('badge_weekday')}</span>`;

    resultsContainer.style.display = 'block';
    nextCard.innerHTML = `<div class="flex flex-col items-center justify-center py-8"><span class="material-icons spin text-3xl mb-2 opacity-80">sync</span><span class="text-sm font-bold uppercase tracking-widest opacity-80">${window.t('loading')}</span></div>`;
    list.innerHTML = '';
    setTimeout(() => resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    const { data, error } = await window.supabaseClient.rpc('trova_bus', {
        p_partenza_id: partenzaId, p_arrivo_id: arrivoId, p_orario_min: selOra.value, p_is_festivo: isFestivo,
    });

    if (error || !data?.length) {
        nextCard.innerHTML = `<div class="text-center py-6 text-white"><div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30"><span class="material-icons text-3xl">event_busy</span></div><strong class="block text-xl mb-1">${window.t('bus_not_found')}</strong><div class="opacity-80 text-sm mb-4">${window.t('bus_try_change')}</div>${dayBadge}</div>`;
        return;
    }

    const primo      = data[0];
    const successivi = data.slice(1);

    nextCard.innerHTML = `<div class="flex justify-between items-start mb-6"><span class="text-[11px] font-bold uppercase tracking-widest text-white/80 border border-white/20 px-2 py-1 rounded-lg bg-black/5">${window.t('next_departure')}</span>${dayBadge}</div><div class="flex items-end justify-between relative z-10"><div><div class="text-6xl font-serif font-bold text-white leading-none tracking-tight drop-shadow-md mb-1">${primo.ora_partenza.slice(0,5)}</div><div class="text-sm font-bold text-amber-100 uppercase tracking-widest pl-1">${window.t('departure')}</div></div><div class="text-right pb-1"><div class="text-2xl font-bold text-white/90 leading-none">${primo.ora_arrivo.slice(0,5)}</div><div class="text-[11px] font-bold text-amber-100 uppercase tracking-widest opacity-80">${window.t('arrival')}</div></div></div><div class="mt-6 pt-4 border-t border-white/20 flex items-center justify-between"><div class="flex items-center gap-2"><span class="material-icons text-white/80 text-sm">directions_bus</span><span class="text-xs font-bold text-white uppercase tracking-wide">${primo.nome_linea || 'Bus ATC'}</span></div><span class="material-icons text-white/40 rotate-180">arrow_back</span></div><span class="material-icons absolute -right-4 -bottom-8 text-[140px] text-white opacity-10 rotate-12 pointer-events-none">directions_bus</span>`;

    list.innerHTML = successivi.length === 0
        ? `<div class="text-center text-slate-400 text-xs py-4 font-bold uppercase tracking-widest">${window.t('no_runs_today')}</div>`
        : successivi.map(b => `<div class="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-amber-100 cursor-default"><div class="flex items-center gap-4"><div class="flex flex-col"><span class="text-xl font-bold text-slate-700 leading-none group-hover:text-amber-600 transition-colors">${b.ora_partenza.slice(0,5)}</span><span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">${window.t('departure')}</span></div><span class="material-icons text-slate-400 text-sm opacity-40">arrow_forward</span><div class="flex flex-col"><span class="text-lg font-bold text-slate-500 leading-none">${b.ora_arrivo.slice(0,5)}</span><span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">${window.t('arrival')}</span></div></div><div class="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors"><span class="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-amber-600">Bus</span></div></div>`).join('');
};

window.eseguiRicercaTraghetto = async function() {
    const selPart = document.getElementById('selPartenzaFerry');
    const selArr  = document.getElementById('selArrivoFerry');
    const selOra  = document.getElementById('selOraFerry');
    const resultsContainer = document.getElementById('ferryResultsContainer');
    const nextCard         = document.getElementById('nextFerryCard');
    const list             = document.getElementById('otherFerryList');
    if (!selPart.value || !selArr.value || !selOra.value) return;

    resultsContainer.style.display = 'block';
    nextCard.innerHTML = `<div class="flex flex-col items-center justify-center py-8"><span class="material-icons spin text-3xl mb-2 opacity-80">sync</span><span class="text-sm font-bold uppercase tracking-widest opacity-80">${window.t('loading')}</span></div>`;
    list.innerHTML = '';
    setTimeout(() => resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    const startCol   = selPart.value;
    const endCol     = selArr.value;
    const timeFilter = selOra.value;

    const { data, error } = await window.supabaseClient
        .from('Orari_traghetti').select(`id, direzione, validita, "${startCol}", "${endCol}"`);

    const validRuns = (data || [])
        .filter(row => {
            const tS = row[startCol], tE = row[endCol];
            return tS && tE && tS < tE && tS >= timeFilter;
        })
        .sort((a, b) => a[startCol].localeCompare(b[startCol]));

    if (error || !validRuns.length) {
        nextCard.innerHTML = `<div class="text-center py-6 text-white"><div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30"><span class="material-icons text-3xl">directions_boat</span></div><strong class="block text-xl mb-1">${window.t('bus_not_found')}</strong><div class="opacity-80 text-sm">Controlla se la tratta è diretta.</div></div>`;
        return;
    }

    const primo      = validRuns[0];
    const successivi = validRuns.slice(1);

    nextCard.innerHTML = `<div class="flex justify-between items-start mb-6"><span class="text-[11px] font-bold uppercase tracking-widest text-white/80 border border-white/20 px-2 py-1 rounded-lg bg-black/5">${window.t('next_departure')}</span><span></span></div><div class="flex items-end justify-between relative z-10"><div><div class="text-6xl font-serif font-bold text-white leading-none tracking-tight drop-shadow-md mb-1">${primo[startCol].slice(0,5)}</div><div class="text-sm font-bold text-cyan-100 uppercase tracking-widest pl-1">${window.t('departure')}</div></div><div class="text-right pb-1"><div class="text-2xl font-bold text-white/90 leading-none">${primo[endCol].slice(0,5)}</div><div class="text-[11px] font-bold text-cyan-100 uppercase tracking-widest opacity-80">${window.t('arrival')}</div></div></div><div class="mt-6 pt-4 border-t border-white/20 flex items-center justify-between"><div class="flex items-center gap-2"><span class="material-icons text-white/80 text-sm">explore</span><span class="text-xs font-bold text-white uppercase tracking-wide">${window.t('direction_dir')} ${primo.direzione || window.t('coast')}</span></div></div><span class="material-icons absolute -right-6 -bottom-6 text-[140px] text-white opacity-10 rotate-[-10deg] pointer-events-none">sailing</span>`;

    list.innerHTML = successivi.length === 0
        ? `<div class="text-center text-slate-400 text-xs py-4 font-bold uppercase tracking-widest">${window.t('last_run_day')}</div>`
        : successivi.map(run => `<div class="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-cyan-100 cursor-default"><div class="flex items-center gap-4"><div class="flex flex-col"><span class="text-xl font-bold text-slate-700 leading-none group-hover:text-cyan-600 transition-colors">${run[startCol].slice(0,5)}</span><span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">${window.t('departure')}</span></div><span class="material-icons text-slate-400 text-sm opacity-40">arrow_forward</span><div class="flex flex-col"><span class="text-lg font-bold text-slate-500 leading-none">${run[endCol].slice(0,5)}</span><span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">${window.t('arrival')}</span></div></div><div class="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-colors"><span class="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-cyan-600">Ferry</span></div></div>`).join('');
};

window.apriTrenitalia = function() { window.open('https://www.trenitalia.com', '_blank'); };