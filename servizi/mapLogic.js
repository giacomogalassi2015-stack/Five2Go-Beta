// mapLogic.js
import { state } from './core/state.js';
import { t } from './utils.js';

// Inizializza le mappe dei sentieri in coda
export function initPendingMaps() {
    if (!state.mapsToInit || state.mapsToInit.length === 0) return;
    
    state.mapsToInit.forEach(mapData => {
        const element = document.getElementById(mapData.id);
        
        // Verifica se l'elemento esiste e non ha già una mappa
        if (element && !element._leaflet_id) {
            const map = L.map(mapData.id, { 
                zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, attributionControl: false 
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap, © CARTO', subdomains: 'abcd', maxZoom: 20
            }).addTo(map);

            if (mapData.gpx) {
                new L.GPX(mapData.gpx, {
                    async: true,
                    marker_options: { 
                        startIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-start.png', 
                        endIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-end.png', 
                        shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-shadow.png', 
                        iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41]   
                    },
                    polyline_options: { color: '#E76F51', weight: 5, opacity: 0.8 }
                }).on('loaded', function(e) { 
                    map.fitBounds(e.target.getBounds(), { padding: [30, 30] });
                }).addTo(map);
            }
        }
    });
    
    state.mapsToInit = []; 
}

// Inizializza la mappa dei Bus con le fermate
export function initBusMap(fermate) {
    const mapContainer = document.getElementById('bus-map');
    if (!mapContainer) return;
    
    // Rimuovi mappa vecchia se esiste (state.currentBusMap)
    if (state.currentBusMap) { 
        state.currentBusMap.remove(); 
        state.currentBusMap = null; 
    }

    const map = L.map('bus-map').setView([44.1000, 9.7385], 13);
    state.currentBusMap = map; 

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO', subdomains: 'abcd', maxZoom: 20
    }).addTo(map);

    const markersGroup = new L.FeatureGroup();
    if(fermate && fermate.length > 0) {
        fermate.forEach(f => {
            if (!f.LAT || !f.LONG) return;
            const marker = L.marker([f.LAT, f.LONG]).addTo(map);
            marker.bindPopup(`
                <div style="text-align:center; min-width:150px;">
                    <h3 style="margin:0 0 10px 0; font-size:1rem;">${f.NOME_FERMATA}</h3>
                    <div style="display:flex; gap:5px; justify-content:center;">
                        <button onclick="setBusStop('selPartenza', '${f.ID}')" class="btn-popup-start">Partenza</button>
                        <button onclick="setBusStop('selArrivo', '${f.ID}')" class="btn-popup-end">Arrivo</button>
                    </div>
                </div>`);
            markersGroup.addLayer(marker);
        });
        map.addLayer(markersGroup);
    }
    setTimeout(() => { map.invalidateSize(); }, 200);
}

// Funzione chiamata dai popup della mappa (Globalizzata in main.js)
export function setBusStop(selectId, value) {
    const select = document.getElementById(selectId);
    if (select) {
        select.value = value;
        select.style.backgroundColor = "#fff3cd"; 
        // Triggera l'evento onchange se necessario (per sbloccare arrivo)
        select.dispatchEvent(new Event('change'));
        setTimeout(() => select.style.backgroundColor = "white", 500);
    }
}

// Toggle visibilità mappa bus
export function toggleBusMap() {
    const container = document.getElementById('bus-map-wrapper');
    const btn = document.getElementById('btn-bus-map-toggle');
    if (!container || !btn) return;
    
    const isHidden = container.style.display === 'none';
    if (isHidden) {
        container.style.display = 'block';
        btn.innerHTML = `📍 ${t('hide_map')} ▾`;
        btn.style.backgroundColor = '#D1C4E9'; 
        setTimeout(() => { if (state.currentBusMap) { state.currentBusMap.invalidateSize(); } }, 100);
    } else {
        container.style.display = 'none';
        btn.innerHTML = `🗺️ ${t('show_map')} ▾`;
        btn.style.backgroundColor = '#EDE7F6'; 
    }
}