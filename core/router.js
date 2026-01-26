// router.js
import { supabaseClient } from './supabaseClient.js';
import { state, setCurrentView } from './state.js';
import { t, dbCol, getSmartUrl } from './utils.js';
import { openModal } from '../ui/modals.js';
import { AVAILABLE_LANGS } from './config.js';
import { 
    ristoranteRenderer, spiaggiaRenderer, sentieroRenderer, 
    vinoRenderer, attrazioniRenderer, prodottoRenderer, 
    farmacieRenderer, numeriUtiliRenderer, trainSearchRenderer 
} from '../ui-renderers.js';
import { renderGenericFilterableView, renderDoubleFilterView } from '../ui/filters.js';

const content = () => document.getElementById('app-content');

// --- NAVIGAZIONE PRINCIPALE ---
// NOTA: Deve essere 'export', NON 'window.'
export async function switchView(view, el) {
    if (!content()) return;
    setCurrentView(view);

    // Pulizia elementi UI globali
    const globalFilterBtn = document.querySelector('body > #filter-toggle-btn');
    if (globalFilterBtn) globalFilterBtn.remove();
    const oldSheet = document.getElementById('filter-sheet');
    if (oldSheet) oldSheet.remove();
    const oldOverlay = document.getElementById('filter-overlay');
    if (oldOverlay) oldOverlay.remove();

    // Gestione classi active nella navbar
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
                { label: t('menu_rest'), table: "Ristoranti" },
                { label: t('menu_prod'), table: "Prodotti" },
                { label: t('menu_wine'), table: "Vini" } 
            ], 'Ristoranti');
        } 
        else if (view === 'outdoor') {
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
        content().innerHTML = `<div class="error-msg">${t('error')}: ${err.message}</div>`;
    }
}
 function renderHome() {
    const bgImage = "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    // Rimuovi l'import dinamico e usa direttamente AVAILABLE_LANGS importato sopra
    content().innerHTML = `
    <div class="welcome-card animate-fade" style="background-image: url('${bgImage}');">
        <div class="welcome-overlay">
            <div class="welcome-content">
                <h1 class="welcome-title">${t('welcome_app_name')}</h1>
                <div class="welcome-divider"></div>
                <div class="lang-grid">
                    ${AVAILABLE_LANGS.map(l => `
                        <button class="lang-tile ${l.code === state.currentLang ? 'active' : ''}" onclick="changeLanguage('${l.code}')">
                            <span class="lang-flag-large">${l.flag}</span>
                            <span class="lang-label">${l.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>`;
}
function renderSubMenu(options, defaultTable) {
    let menuHtml = `
    <div class="nav-sticky-header animate-fade">
        <div class="nav-scroll-container">
            ${options.map(opt => `
                <button class="btn-3d" onclick="loadTableData('${opt.table}', this)">
                    ${opt.label}
                </button>
            `).join('')}
        </div>
    </div>
    <div id="sub-content"></div>`;
    
    content().innerHTML = menuHtml;
    
    // Attiva primo tab dopo un breve timeout per assicurare che il DOM sia pronto
    setTimeout(() => {
        const btns = document.querySelectorAll('.btn-3d');
        if (btns.length > 0) loadTableData(defaultTable, btns[0]);
    }, 0);
}

// NOTA: Export, non window.
export async function loadTableData(tableName, btnEl) {
    const subContent = document.getElementById('sub-content');
    if (!subContent) return;

    // UI Active State
    document.querySelectorAll('.nav-chip, .btn-3d').forEach(btn => btn.classList.remove('active-chip', 'active-3d'));
    if (btnEl) {
        if(btnEl.classList.contains('nav-chip')) btnEl.classList.add('active-chip');
        if(btnEl.classList.contains('btn-3d')) btnEl.classList.add('active-3d');
    }

    // Reset Filtri
    const existingFilters = document.getElementById('dynamic-filters');
    if(existingFilters) existingFilters.remove();
    const filterBtn = document.getElementById('filter-toggle-btn');
    if(filterBtn) filterBtn.style.display = 'none';

    // Mappe statiche
    if (tableName === 'Mappe') {
        subContent.innerHTML = `<div class="map-container animate-fade"><iframe src="https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1" width="640" height="480"></iframe></div>`;
        return; 
    }

    // Cache Logic
    if (!state.dataCache) state.dataCache = {};

    let data;
    if (state.dataCache[tableName]) {
        console.log(`⚡ Cache hit: ${tableName}`);
        data = state.dataCache[tableName];
    } else {
        subContent.innerHTML = `<div class="loader" style="margin-top:20px;">${t('loading')}...</div>`;
        const { data: dbData, error } = await supabaseClient.from(tableName).select('*');
        if (error) { subContent.innerHTML = `<p class="error-msg">${error.message}</p>`; return; }
        data = dbData;
        state.dataCache[tableName] = data;
    }

    state.currentTableData = data; 

    // Routing Renderers (usiamo le funzioni importate, NON window.)
    if (tableName === 'Vini') {
        renderGenericFilterableView(data, 'Tipo', subContent, vinoRenderer);
    }
    else if (tableName === 'Spiagge') {
        renderGenericFilterableView(data, 'Paesi', subContent, spiaggiaRenderer);
    }
    else if (tableName === 'Prodotti') {
        let html = '<div class="list-container animate-fade" style="padding-bottom:20px;">'; 
        data.forEach(p => { html += prodottoRenderer(p); });
        subContent.innerHTML = html + '</div>';
    }
    else if (tableName === 'Ristoranti') { 
        renderGenericFilterableView(data, 'Paesi', subContent, ristoranteRenderer); 
    }
    else if (tableName === 'Sentieri') { 
        renderGenericFilterableView(data, 'Difficolta', subContent, sentieroRenderer); 
    }
    else if (tableName === 'Farmacie') { 
        renderGenericFilterableView(data, 'Paesi', subContent, farmacieRenderer); 
    } 
    else if (tableName === 'Numeri_utili') { 
        renderGenericFilterableView(data, 'Comune', subContent, numeriUtiliRenderer); 
    }
    else if (tableName === 'Attrazioni') { 
        const culturaConfig = {
            primary: { key: 'Paese', title: '📍 ' + (t('nav_villages') || 'Borgo'), customOrder: ["Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso"] },
            secondary: { key: 'Label', title: '🏷️ Categoria' }
        };
        renderDoubleFilterView(data, culturaConfig, subContent, attrazioniRenderer); 
    }
    else if (tableName === 'Trasporti') {
        state.tempTransportData = data;
        window.tempTransportData = data; // Compatibilità temporanea
        let html = '<div class="list-container animate-fade">';
        data.forEach((t, index) => {
            const nomeDisplay = dbCol(t, 'Località') || dbCol(t, 'Mezzo');
            const imgUrl = getSmartUrl(t.Mezzo, '', 400);
            html += `<div class="card-product" onclick="openModal('transport', '${index}')"><div class="prod-info"><div class="prod-title">${nomeDisplay}</div></div><img src="${imgUrl}" class="prod-thumb" loading="lazy"></div>`;
        });
        subContent.innerHTML = html + '</div>';
    }
}

export async function renderServicesGrid() {
    const c = content();
    const { data, error } = await supabaseClient.from('Trasporti').select('*');
    if (error) { c.innerHTML = `<p class="error-msg">${t('error')}</p>`; return; }
    
    state.tempTransportData = data;
    window.tempTransportData = data; 

    function getServiceIcon(name, type) {
        const n = name.toLowerCase();
        if (n.includes('treno') || n.includes('stazione')) return 'train';
        if (n.includes('battello') || n.includes('traghetto')) return 'directions_boat';
        if (n.includes('bus') || n.includes('autobus')) return 'directions_bus';
        if (n.includes('taxi')) return 'local_taxi';
        return 'confirmation_number';
    }

    let html = '<div class="services-grid-modern animate-fade">';
    data.forEach((t, index) => {
        const nome = t.Mezzo || t.Località || 'Trasporto';
        const icon = getServiceIcon(nome, 'trasporto');
        html += `
        <div class="service-widget" onclick="openModal('transport', ${index})">
            <span class="material-icons widget-icon">${icon}</span>
            <span class="widget-label">${nome}</span>
        </div>`;
    });

    html += `
    <div class="service-widget" onclick="renderSimpleList('Numeri_utili')">
        <span class="material-icons widget-icon">phonelink_ring</span>
        <span class="widget-label">${t('menu_num')}</span>
    </div>`;
    
    html += `
    <div class="service-widget" onclick="renderSimpleList('Farmacie')">
        <span class="material-icons widget-icon">medical_services</span>
        <span class="widget-label">${t('menu_pharm')}</span>
    </div>`;

    html += '</div>';
    html += `<footer class="app-footer"><p>© 2026 Five2Go. ${t('footer_rights')}</p></footer>`;
    c.innerHTML = html;
}

export function renderSimpleList(tableName) {
    const cleanTitle = tableName.replace('_', ' ');
    const layout = `
    <div class="header-simple-list animate-fade">
        <button onclick="switchView('servizi')" class="btn-back-custom">
            <span class="material-icons">arrow_back</span>
        </button>
        <h2>${cleanTitle}</h2>
    </div>
    <div id="sub-content">
        <div class="loader">${t('loading')}...</div>
    </div>`;
    
    content().innerHTML = layout;
    loadTableData(tableName, null);
}

export function toggleTicketInfo() {
    const box = document.getElementById('ticket-info-box');
    if (box) { box.style.display = (box.style.display === 'none') ? 'block' : 'none'; }
}

export function apriTrenitalia() {
    window.open('https://www.trenitalia.com', '_blank');
}