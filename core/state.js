// state.js
export const state = {
    currentLang: localStorage.getItem('app_lang') || 'it',
    currentViewName: 'home',
    mapsToInit: [],
    tempTransportData: [],
    dataCache: {}, // <-- Aggiungi questo: qui salveremo parsing con ID
    // Cache per evitare chiamate ripetute
    cachedStops: null,
};

export function setCurrentLang(lang) {
    state.currentLang = lang;
    localStorage.setItem('app_lang', lang);
}

export function setCurrentView(viewName) {
    state.currentViewName = viewName;
}