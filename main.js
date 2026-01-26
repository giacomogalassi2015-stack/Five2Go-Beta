// main.js
// Aggiornato import di utils per puntare a ./core/utils.js
import { switchView, loadTableData, renderServicesGrid, renderSimpleList, toggleTicketInfo, apriTrenitalia } from './core/router.js';
import { openModal } from './ui/modals.js';
import { setCurrentLang } from './core/state.js';
import { eseguiRicercaBus, filterDestinations, initFerrySearch, eseguiRicercaTraghetto, loadAllStops } from './servizi/busLogic.js';
import { setBusStop, toggleBusMap } from './servizi/mapLogic.js';
import { t } from './core/utils.js'; // <-- CORRETTO
import { AVAILABLE_LANGS } from './core/config.js'; // <-- Assumendo che config sia in core

// ... (Il resto del codice main.js rimane identico al tuo originale) ...
// --- BRIDGE: Esposizione Globale per HTML onClick ---
window.switchView = switchView;
window.loadTableData = loadTableData;
window.openModal = openModal;
window.renderServicesGrid = renderServicesGrid;
window.renderSimpleList = renderSimpleList;
window.toggleTicketInfo = toggleTicketInfo;
window.apriTrenitalia = apriTrenitalia;

window.eseguiRicercaBus = eseguiRicercaBus;
window.filterDestinations = filterDestinations;
window.initFerrySearch = initFerrySearch;
window.eseguiRicercaTraghetto = eseguiRicercaTraghetto;
window.loadAllStops = loadAllStops;
window.setBusStop = setBusStop;
window.toggleBusMap = toggleBusMap;

window.openFilterSheet = () => { 
    const o = document.getElementById('filter-overlay'); 
    const s = document.getElementById('filter-sheet');
    if(o) o.classList.add('active');
    if(s) s.classList.add('active');
};
window.closeFilterSheet = () => { 
    const o = document.getElementById('filter-overlay'); 
    const s = document.getElementById('filter-sheet');
    if(o) o.classList.remove('active');
    if(s) s.classList.remove('active');
};

window.changeLanguage = (langCode) => {
    setCurrentLang(langCode);
    switchView('home');
};

window.toggleLangDropdown = (event) => {
    if(event) event.stopPropagation();
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.toggle('show');
};
window.addEventListener('click', () => {
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.remove('show');
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 App Modulare Avviata");
    switchView('home');
});

const minSwipeDistance = 50; 
const maxVerticalDistance = 100;
let touchStartX = 0; let touchStartY = 0; let touchEndX = 0; let touchEndY = 0;

document.addEventListener('touchstart', e => {
    if (e.target.closest('.leaflet-container') || e.target.closest('.map-container') || 
        e.target.closest('.swiper-container') || e.target.closest('.nav-scroll-container') || 
        e.target.closest('.nav-sticky-header') || e.target.closest('.modal-content')) {
        touchStartX = null; return;
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
        if (tab.classList.contains('active-chip') || tab.classList.contains('active-3d')) activeIndex = index;
    });

    if (activeIndex === -1) return;

    if (xDiff < 0) { 
        if (activeIndex < tabs.length - 1) tabs[activeIndex + 1].click();
    } else { 
        if (activeIndex > 0) tabs[activeIndex - 1].click();
    }
    touchStartX = null; touchStartY = null;
}