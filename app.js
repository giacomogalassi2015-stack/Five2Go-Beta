console.log("✅ 3. app.js caricato (Controller - Refactored Clean)");

const content = document.getElementById('app-content');

// --- SETUP LINGUA & HEADER ---
const getGlobalFooter = () => `<footer class="app-footer"><p>© 2026 Five2Go. ${window.t('footer_rights')}</p></footer>`;

function setupHeaderElements() {
    const header = document.querySelector('header');
    
    // 1. PULIZIA
    const oldActions = header.querySelector('.header-actions');
    if (oldActions) oldActions.remove();
    header.querySelectorAll('.material-icons').forEach(i => i.remove());

    // 2. LOGICA: Se NON siamo in home, ci fermiamo qui
    if (window.currentViewName !== 'home') return; 

    // 3. COSTRUZIONE (Solo per Home)
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'header-actions animate-fade header-actions-container'; // USA LA NUOVA CLASSE
    actionsContainer.id = 'header-btn-lang'; 
    // NOTA: Ho rimosso Object.assign con stili inline, ora è tutto in .header-actions-container

    const currFlag = window.AVAILABLE_LANGS.find(l => l.code === window.currentLang).flag;
    const currCode = window.currentLang.toUpperCase();

    const langSelector = document.createElement('div');
    langSelector.className = 'lang-selector';
    // Ho aggiunto la classe lang-dropdown-wrapper al dropdown
    langSelector.innerHTML = `
        <button class="current-lang-btn" onclick="toggleLangDropdown(event)">
            <span class="lang-flag">${currFlag}</span> ${currCode} ▾
        </button>
        <div class="lang-dropdown lang-dropdown-wrapper" id="lang-dropdown">
            ${window.AVAILABLE_LANGS.map(l => `
                <button class="lang-opt ${l.code === window.currentLang ? 'active' : ''}" onclick="changeLanguage('${l.code}')">
                    <span class="lang-flag">${l.flag}</span> ${l.label}
                </button>
            `).join('')}
        </div>`;
    actionsContainer.appendChild(langSelector);
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

// Funzione Globale per cambiare lingua
window.changeLanguage = function(langCode) {
    window.currentLang = langCode;
    localStorage.setItem('app_lang', langCode);
    setupHeaderElements(); 
    updateNavBar(); 
    
    // Ricarica la vista corrente
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
    if(dd) dd.classList.toggle('show');
};

window.addEventListener('click', () => {
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.remove('show');
});


// --- NAVIGAZIONE PRINCIPALE ---
window.switchView = async function(view, el) {
    if (!content) return;
    window.currentViewName = view; 

    const globalFilterBtn = document.querySelector('body > #filter-toggle-btn');
    if (globalFilterBtn) { globalFilterBtn.remove(); }

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
    else if (view === 'home') {
         const homeBtn = document.querySelector('.nav-item[onclick*="home"]');
         if(homeBtn) homeBtn.classList.add('active');
    }

    try {
        if (view === 'home') renderHome();
        else if (view === 'cibo') {
            renderSubMenu([
                { label: window.t('menu_rest'), table: "Ristoranti" },
                { label: window.t('menu_prod'), table: "Prodotti" },
                { label: window.t('menu_wine'), table: "Vini" } 
            ], 'Ristoranti');
        } else if (view === 'outdoor') {
            renderSubMenu([
                { label: window.t('menu_trail'), table: "Sentieri" },
                { label: window.t('menu_beach'), table: "Spiagge" },
                { label: window.t('menu_monu'), table: "Attrazioni" }
            ], 'Sentieri');
        }
        else if (view === 'servizi') await renderServicesGrid();
        else if (view === 'mappe_monumenti') renderSubMenu([{ label: window.t('menu_map'), table: "Mappe" }], 'Mappe');
    } catch (err) {
        console.error(err);
        content.innerHTML = `<div class="error-msg">${window.t('error')}: ${err.message}</div>`;
    }
};

function renderHome() {
    const bgImage = "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    content.innerHTML = `
    <div class="welcome-card animate-fade" style="background-image: url('${bgImage}');">
        <div class="welcome-overlay">
            <div class="welcome-content">
                <h1 class="welcome-title">${window.t('welcome_app_name')}</h1>
                <div class="welcome-divider"></div>
                <div class="lang-grid">
                    ${window.AVAILABLE_LANGS.map(l => `
                        <button class="lang-tile ${l.code === window.currentLang ? 'active' : ''}" onclick="changeLanguage('${l.code}')">
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
    
    content.innerHTML = menuHtml;
    
    const firstBtn = content.querySelector('.btn-3d');
    if (firstBtn) {
        loadTableData(defaultTable, firstBtn);
    }
}

// --- FUNZIONE CENTRALE REFACTORIZZATA (USA STRATEGY) ---
window.loadTableData = async function(tableName, btnEl) {
    const subContent = document.getElementById('sub-content');
    if (!subContent) return;

    // 1. Gestione UI Bottoni
    document.querySelectorAll('.nav-chip, .btn-3d').forEach(btn => btn.classList.remove('active-chip', 'active-3d'));
    if (btnEl) {
        if(btnEl.classList.contains('nav-chip')) btnEl.classList.add('active-chip');
        if(btnEl.classList.contains('btn-3d')) btnEl.classList.add('active-3d');
    }

    // 2. Reset Filtri
    const existingFilters = document.getElementById('dynamic-filters');
    if(existingFilters) existingFilters.remove();
    const filterBtn = document.getElementById('filter-toggle-btn');
    if(filterBtn) filterBtn.style.display = 'none';

    // 3. Loading UI
    if (!window.appCache[tableName] && tableName !== 'Mappe') {
        subContent.innerHTML = `<div class="loader" style="margin-top:20px;">${window.t('loading')}...</div>`;
    }
    
    // 4. ESECUZIONE STRATEGIA
    try {
        const strategy = window.viewStrategyContext.getStrategy(tableName);
        if (strategy) {
            await strategy.load(subContent);
        } else {
            console.error(`Nessuna strategia trovata per: ${tableName}`);
            subContent.innerHTML = `<p class="error-msg">Nessuna vista disponibile per ${tableName}</p>`;
        }
    } catch (err) {
        console.error(err);
        subContent.innerHTML = `<p class="error-msg">${window.t('error')}: ${err.message}</p>`;
    }
};

// --- SWIPE GESTURE ---
const minSwipeDistance = 50; 
const maxVerticalDistance = 100;
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

document.addEventListener('touchstart', e => {
    if (e.target.closest('.leaflet-container') || 
        e.target.closest('.map-container') || 
        e.target.closest('.swiper-container') ||      
        e.target.closest('.nav-scroll-container') ||  
        e.target.closest('.nav-sticky-header') ||     
        e.target.closest('.modal-content')) {         
        touchStartX = null; 
        return;
    }
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
    tabs.forEach((tab, index) => {
        if (tab.classList.contains('active-chip') || tab.classList.contains('active-3d')) {
            activeIndex = index;
        }
    });

    if (activeIndex === -1) return; 

    if (xDiff < 0) {
        if (activeIndex < tabs.length - 1) tabs[activeIndex + 1].click();
    } else {
        if (activeIndex > 0) tabs[activeIndex - 1].click();
    }
    touchStartX = null;
    touchStartY = null;
}

// --- RENDER SERVIZI ---
window.renderServicesGrid = async function() {
    const content = document.getElementById('app-content');
    
    // Per i trasporti usiamo ancora tempTransportData perché serve alla modale
    const { data, error } = await window.supabaseClient.from('Trasporti').select('*');
    if (error) { 
        console.error(error);
        content.innerHTML = `<p class="error-msg">${window.t('error')}</p>`; 
        return;
    }
    window.tempTransportData = data;

    function getServiceIcon(name, type) {
        const n = name.toLowerCase();
        if (n.includes('treno') || n.includes('stazione')) return 'train';
        if (n.includes('battello') || n.includes('traghetto')) return 'directions_boat';
        if (n.includes('bus') || n.includes('autobus')) return 'directions_bus';
        if (n.includes('taxi')) return 'local_taxi';
        if (type === 'farmacia') return 'local_pharmacy';
        if (type === 'info') return 'phonelink_ring';
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
        <span class="widget-label">${window.t('menu_num')}</span>
    </div>`;
    
    html += `
    <div class="service-widget" onclick="renderSimpleList('Farmacie')">
        <span class="material-icons widget-icon">medical_services</span>
        <span class="widget-label">${window.t('menu_pharm')}</span>
    </div>`;

    html += '</div>';
    html += getGlobalFooter();
    content.innerHTML = html;
};

function renderSimpleList(tableName) {
    const cleanTitle = tableName.replace('_', ' '); 
    const layout = `
    <div class="header-simple-list animate-fade">
        <button onclick="renderServicesGrid()" class="btn-back-custom">
            <span class="material-icons">arrow_back</span>
        </button>
        <h2>${cleanTitle}</h2>
    </div>
    <div id="sub-content">
        <div class="loader">${window.t('loading')}...</div>
    </div>`;

    content.innerHTML = layout;
    window.loadTableData(tableName, null);
}

window.toggleTicketInfo = function() {
    const box = document.getElementById('ticket-info-box');
    if (box) { box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'block' : 'none'; }
};

window.toggleBusMap = function() {
    const wrapper = document.getElementById('bus-map-wrapper');
    if (wrapper) { wrapper.style.display = (wrapper.style.display === 'none' || wrapper.style.display === '') ? 'block' : 'none'; }
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