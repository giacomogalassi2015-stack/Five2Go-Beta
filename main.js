/* main.js - Entry Point, Router e Setup */

import { AVAILABLE_LANGS } from './config.js';
import { mk, t, getLang, setLang, getSmartUrl } from './utils.js';
import { supabaseClient } from './api.js';
import { viewStrategyContext } from './views.js';
import { openModal } from './modals.js';
import { renderGenericFilterableView, numeriUtiliRenderer, farmacieRenderer } from './components.js';

console.log("✅ main.js caricato (Modular ES6 Mode)");

// --- STATE GLOBALE APP ---
let currentViewName = 'home';
const content = document.getElementById('app-content');

// --- SETUP HEADER ---
const createGlobalFooter = () => mk('footer', { class: 'app-footer' }, 
    mk('p', {}, `© 2026 Five2Go. ${t('footer_rights')}`)
);

// Esposizione funzioni globali necessarie per il DOM legacy/onclick
window.addEventListener('init-map', (e) => {
    if(window.L && window.L.GPX) {
        const { id, url } = e.detail;
        const map = L.map(id);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(map);
        new L.GPX(url, { async: true, polyline_options: { color: '#E76F51' } }).on('loaded', (ev) => map.fitBounds(ev.target.getBounds())).addTo(map);
    }
});

function setupHeaderElements() {
    const header = document.querySelector('header');
    
    const oldActions = header.querySelector('.header-actions-container');
    if (oldActions) oldActions.remove();
    header.querySelectorAll('.material-icons').forEach(i => i.remove());

    if (currentViewName !== 'home') return; 

    const currLang = getLang();
    const currFlag = AVAILABLE_LANGS.find(l => l.code === currLang).flag;
    const currCode = currLang.toUpperCase();
    
    // Dropdown
    const dropdown = mk('div', { class: 'lang-dropdown lang-dropdown-wrapper', id: 'lang-dropdown' });
    AVAILABLE_LANGS.forEach(l => {
        const btn = mk('button', { 
            class: `lang-opt ${l.code === currLang ? 'active' : ''}`,
            onclick: () => changeLanguage(l.code)
        }, [
            mk('span', { class: 'lang-flag' }, l.flag),
            ` ${l.label}`
        ]);
        dropdown.appendChild(btn);
    });

    // Selettore
    const langSelector = mk('div', { class: 'lang-selector' }, [
        mk('button', { class: 'current-lang-btn', onclick: toggleLangDropdown }, [
            mk('span', { class: 'lang-flag' }, currFlag), 
            ` ${currCode} ▾`
        ]),
        dropdown
    ]);

    const actionsContainer = mk('div', { 
        id: 'header-btn-lang',
        class: 'header-actions animate-fade header-actions-container' 
    }, langSelector);

    header.appendChild(actionsContainer);
}

function updateNavBar() {
    const labels = document.querySelectorAll('.nav-label');
    if (labels.length >= 4) {
        labels[0].innerText = t('nav_villages'); 
        labels[1].innerText = t('nav_food');
        labels[2].innerText = t('nav_outdoor');
        labels[3].innerText = t('nav_services'); 
    }
}

// Funzioni Cambio Lingua
function changeLanguage(langCode) {
    setLang(langCode);
    setupHeaderElements(); 
    updateNavBar(); 
    
    const activeNav = document.querySelector('.nav-item.active');
    if(activeNav) {
        const view = activeNav.getAttribute('data-view');
        if(view) switchView(view, activeNav);
        else switchView('home'); 
    } else {
        switchView('home');
    }
}

function toggleLangDropdown(event) {
    event.stopPropagation();
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.toggle('show');
}

window.addEventListener('click', () => {
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.remove('show');
});


// --- NAVIGAZIONE PRINCIPALE ---
async function switchView(view, el) {
    if (!content) return;
    currentViewName = view; 

    // Reset UI
    const globalFilterBtn = document.querySelector('body > #filter-toggle-btn');
    if (globalFilterBtn) { globalFilterBtn.remove(); }

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    // Gestione stato attivo nav items
    if (el) {
        el.classList.add('active');
    } else {
        const btn = document.querySelector(`.nav-item[data-view="${view}"]`);
        if(btn) btn.classList.add('active');
    }

    try {
        if (view === 'home') renderHome();
        else if (view === 'cibo') {
            renderSubMenu([
                { label: t('menu_rest'), table: "Ristoranti" },
                { label: t('menu_prod'), table: "Prodotti" },
                { label: t('menu_wine'), table: "Vini" } 
            ], 'Ristoranti');
        } else if (view === 'outdoor') {
            renderSubMenu([
                { label: t('menu_trail'), table: "Sentieri" },
                { label: t('menu_beach'), table: "Spiagge" },
                { label: t('menu_monu'), table: "Attrazioni" }
            ], 'Sentieri');
        }
        else if (view === 'servizi') await renderServicesGrid();
        else if (view === 'mappe_monumenti') renderSubMenu([{ label: t('menu_map'), table: "Mappe" }], 'Mappe');
    } catch (err) {
        console.error(err);
        content.innerHTML = '';
        content.appendChild(mk('div', { class: 'error-msg' }, `${t('error')}: ${err.message}`));
    }
}

function renderHome() {
    const bgImage = "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
    content.innerHTML = '';
    
    const langGrid = mk('div', { class: 'lang-grid' });
    AVAILABLE_LANGS.forEach(l => {
        langGrid.appendChild(mk('button', { 
            class: `lang-tile ${l.code === getLang() ? 'active' : ''}`,
            onclick: () => changeLanguage(l.code)
        }, [
            mk('span', { class: 'lang-flag-large' }, l.flag),
            mk('span', { class: 'lang-label' }, l.label)
        ]));
    });

    const welcomeCard = mk('div', { class: 'welcome-card animate-fade', style: { backgroundImage: `url('${bgImage}')` } }, 
        mk('div', { class: 'welcome-overlay' }, 
            mk('div', { class: 'welcome-content' }, [
                mk('h1', { class: 'welcome-title' }, t('welcome_app_name')),
                mk('div', { class: 'welcome-divider' }),
                langGrid
            ])
        )
    );
    content.appendChild(welcomeCard);
}

function renderSubMenu(options, defaultTable) {
    content.innerHTML = '';
    const scrollContainer = mk('div', { class: 'nav-scroll-container' });
    options.forEach(opt => {
        const btn = mk('button', { 
            class: 'btn-3d', 
            onclick: function() { loadTableData(opt.table, this); } 
        }, opt.label);
        scrollContainer.appendChild(btn);
    });

    const stickyHeader = mk('div', { class: 'nav-sticky-header animate-fade' }, scrollContainer);
    const subContent = mk('div', { id: 'sub-content' });
    content.append(stickyHeader, subContent);
    
    if (scrollContainer.firstChild) {
        loadTableData(defaultTable, scrollContainer.firstChild);
    }
}

async function loadTableData(tableName, btnEl) {
    const subContent = document.getElementById('sub-content');
    if (!subContent) return;

    document.querySelectorAll('.nav-chip, .btn-3d').forEach(btn => btn.classList.remove('active-chip', 'active-3d'));
    if (btnEl) {
        if(btnEl.classList.contains('nav-chip')) btnEl.classList.add('active-chip');
        if(btnEl.classList.contains('btn-3d')) btnEl.classList.add('active-3d');
    }

    const existingFilters = document.getElementById('dynamic-filters');
    if(existingFilters) existingFilters.remove();
    const filterBtn = document.getElementById('filter-toggle-btn');
    if(filterBtn) filterBtn.style.display = 'none';

    subContent.innerHTML = '';
    subContent.appendChild(mk('div', { class: 'loader', style: { marginTop:'20px' } }, `${t('loading')}...`));
    
    try {
        const strategy = viewStrategyContext.getStrategy(tableName);
        if (strategy) {
            await strategy.load(subContent);
        } else {
            console.error(`Nessuna strategia per: ${tableName}`);
            subContent.innerText = `Nessuna vista per ${tableName}`;
        }
    } catch (err) {
        console.error(err);
        subContent.innerHTML = '';
        subContent.appendChild(mk('p', { class: 'error-msg' }, `${t('error')}: ${err.message}`));
    }
}

async function renderServicesGrid() {
    const content = document.getElementById('app-content');
    
    const { data, error } = await supabaseClient.from('Trasporti').select('*');
    if (error) { 
        content.innerHTML = ''; content.appendChild(mk('p', { class: 'error-msg' }, t('error'))); 
        return;
    }

    function getServiceIcon(name) {
        const n = name.toLowerCase();
        if (n.includes('treno')) return 'train';
        if (n.includes('battello')) return 'directions_boat';
        if (n.includes('bus')) return 'directions_bus';
        if (n.includes('taxi')) return 'local_taxi';
        return 'confirmation_number';
    }

    const grid = mk('div', { class: 'services-grid-modern animate-fade' });

    data.forEach((tVal, index) => {
        const nome = tVal.Mezzo || tVal.Località || 'Trasporto';
        const icon = getServiceIcon(nome);
        const widget = mk('div', { class: 'service-widget', onclick: () => openModal('transport', index, [], data) }, [
            mk('span', { class: 'material-icons widget-icon' }, icon),
            mk('span', { class: 'widget-label' }, nome)
        ]);
        grid.appendChild(widget);
    });

    grid.appendChild(mk('div', { class: 'service-widget', onclick: () => renderSimpleList('Numeri_utili') }, [
        mk('span', { class: 'material-icons widget-icon' }, 'phonelink_ring'),
        mk('span', { class: 'widget-label' }, t('menu_num'))
    ]));
    
    grid.appendChild(mk('div', { class: 'service-widget', onclick: () => renderSimpleList('Farmacie') }, [
        mk('span', { class: 'material-icons widget-icon' }, 'medical_services'),
        mk('span', { class: 'widget-label' }, t('menu_pharm'))
    ]));

    content.innerHTML = '';
    content.append(grid, createGlobalFooter());
}

async function renderSimpleList(tableName) {
    const cleanTitle = tableName.replace('_', ' '); 
    const content = document.getElementById('app-content');
    content.innerHTML = '';

    const header = mk('div', { class: 'header-simple-list animate-fade' }, [
        mk('button', { class: 'btn-back-custom', onclick: renderServicesGrid }, 
            mk('span', { class: 'material-icons' }, 'arrow_back')
        ),
        mk('h2', {}, cleanTitle)
    ]);

    const subContent = mk('div', { id: 'sub-content' }, 
        mk('div', { class: 'loader' }, `${t('loading')}...`)
    );

    content.append(header, subContent);
    
    try {
        const { data, error } = await supabaseClient.from(tableName).select('*');
        if(error) throw error;
        
        subContent.innerHTML = '';
        if(tableName === 'Numeri_utili') renderGenericFilterableView(data, 'Comune', subContent, numeriUtiliRenderer);
        if(tableName === 'Farmacie') renderGenericFilterableView(data, 'Paesi', subContent, farmacieRenderer);

    } catch(err) {
        subContent.innerText = 'Errore caricamento lista.';
    }
}

// --- SWIPE GESTURE ---
const minSwipeDistance = 50; 
const maxVerticalDistance = 100;
let touchStartX = 0; let touchStartY = 0; let touchEndX = 0; let touchEndY = 0;

document.addEventListener('touchstart', e => {
    if (e.target.closest('.leaflet-container') || e.target.closest('.map-container') || e.target.closest('.nav-scroll-container')) { touchStartX = null; return; }
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
}, {passive: true});

document.addEventListener('touchend', e => {
    if (touchStartX === null) return; 
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    handlePageSwipe();
}, {passive: true});

function handlePageSwipe() {
    const xDiff = touchEndX - touchStartX;
    const yDiff = touchEndY - touchStartY;
    if (Math.abs(xDiff) < minSwipeDistance) return;
    if (Math.abs(yDiff) > maxVerticalDistance) return;
    if (Math.abs(yDiff) > Math.abs(xDiff)) return;

    const tabs = document.querySelectorAll('.nav-chip, .btn-3d');
    if (tabs.length === 0) return;

    let activeIndex = -1;
    tabs.forEach((tab, index) => { if (tab.classList.contains('active-chip') || tab.classList.contains('active-3d')) activeIndex = index; });
    if (activeIndex === -1) return; 

    if (xDiff < 0) { if (activeIndex < tabs.length - 1) tabs[activeIndex + 1].click(); } 
    else { if (activeIndex > 0) tabs[activeIndex - 1].click(); }
    touchStartX = null;
}

// --- INITIALIZATION ---
// FIX: Gestione corretta del caricamento modulo vs DOM
const initApp = () => {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.getAttribute('data-view');
            switchView(viewName, item);
        });
    });

    setupHeaderElements(); 
    updateNavBar(); 
    switchView('home');
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}