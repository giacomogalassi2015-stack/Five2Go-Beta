// main.js
import { switchView, loadTableData, renderServicesGrid, renderSimpleList, toggleTicketInfo, apriTrenitalia } from './router.js';
import { openModal } from './modals.js';
import { setCurrentLang } from './state.js';
import { eseguiRicercaBus, filterDestinations, initFerrySearch, eseguiRicercaTraghetto, loadAllStops } from './busLogic.js';
import { setBusStop, toggleBusMap } from './mapLogic.js';
import { t } from './utils.js';
import { AVAILABLE_LANGS } from './config.js';

// --- BRIDGE: Esposizione Globale per HTML onClick ---
window.switchView = switchView;
window.loadTableData = loadTableData;
window.openModal = openModal;
window.renderServicesGrid = renderServicesGrid;
window.renderSimpleList = renderSimpleList;
window.toggleTicketInfo = toggleTicketInfo;
window.apriTrenitalia = apriTrenitalia;

// Funzioni Bus/Mappa
window.eseguiRicercaBus = eseguiRicercaBus;
window.filterDestinations = filterDestinations;
window.initFerrySearch = initFerrySearch;
window.eseguiRicercaTraghetto = eseguiRicercaTraghetto;
window.loadAllStops = loadAllStops;
window.setBusStop = setBusStop;
window.toggleBusMap = toggleBusMap;

// Filtri (BottomSheet)
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

// Cambio Lingua
window.changeLanguage = (langCode) => {
    setCurrentLang(langCode);
    // Ricarica la vista Home per aggiornare i testi
    switchView('home');
    // Se c'era un menu attivo, aggiorna anche quello... per semplicità torniamo alla home.
};

// Dropdown Lingua (per la Home)
window.toggleLangDropdown = (event) => {
    if(event) event.stopPropagation();
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.toggle('show');
};
window.addEventListener('click', () => {
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.remove('show');
});

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 App Modulare Avviata");
    switchView('home');
});

// --- SWIPE LOGIC ---
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

    if (xDiff < 0) { // Swipe Sinistra -> Avanti
        if (activeIndex < tabs.length - 1) tabs[activeIndex + 1].click();
    } else { // Swipe Destra -> Indietro
        if (activeIndex > 0) tabs[activeIndex - 1].click();
    }
    touchStartX = null; touchStartY = null;
}