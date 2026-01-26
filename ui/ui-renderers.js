import { t, dbCol, getSmartUrl } from './utils.js';
import { state } from './core/state.js';

// Helper per encode sicuro nei pulsanti onclick
const safeJson = (obj) => encodeURIComponent(JSON.stringify(obj)).replace(/'/g, "%27");

// === RENDERER RISTORANTE ===
export const ristoranteRenderer = (r) => {
    const nome = dbCol(r, 'Nome') || 'Ristorante';
    const paesi = dbCol(r, 'Paesi') || '';
    const numero = r.Numero || r.Telefono || '';
    const mapLink = r.Mappa || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nome + ' ' + paesi)}`;

    return `
    <div class="restaurant-glass-card"> 
        <h3 class="rest-card-title">${nome}</h3>
        <p class="rest-card-subtitle">
            <span class="material-icons">restaurant</span>
            ${paesi}
        </p>
        <div class="rest-card-actions">
            <div class="action-btn btn-info rest-btn-size" onclick="openModal('ristorante', '${safeJson(r)}')">
                <span class="material-icons">info_outline</span>
            </div>
            ${numero ? `
                <div class="action-btn btn-call rest-btn-size" onclick="window.location.href='tel:${numero}'">
                    <span class="material-icons">call</span>
                </div>` : ''}
            <div class="action-btn btn-map rest-btn-size" onclick="window.open('${mapLink}', '_blank')">
                <span class="material-icons">map</span>
            </div>
        </div>
    </div>`;
};

// === RENDERER SPIAGGE ===
export const spiaggiaRenderer = (item) => {
    const nome = item.Nome || 'Spiaggia';
    const comune = item.Paese || item.Comune || '';
    const tipo = item.Tipo || 'Spiaggia'; 
    const iconClass = 'fa-water';

    return `
    <div class="culture-card is-beach animate-fade" onclick="openModal('Spiagge', '${item.id}')">
        <div class="culture-info">
            ${comune ? `<div class="culture-location"><span class="material-icons" style="font-size:0.9rem">place</span> ${comune}</div>` : ''}
            <h3 class="culture-title">${nome}</h3>
            <div class="culture-tags">
                 <span class="c-pill">${tipo}</span>
            </div>
        </div>
        <div class="culture-bg-icon">
            <i class="fa-solid ${iconClass}"></i>
        </div>
    </div>`;
};

// === RENDERER SENTIERO ===
export const sentieroRenderer = (s) => {
    const paese = dbCol(s, 'Paesi');
    const titoloMostrato = s.Nome || paese; 
    const diff = s.Tag || s.Difficolta || 'Media';
    const gpxUrl = s.Gpxlink || s.gpxlink;
    const uniqueMapId = `map-trail-${Math.random().toString(36).substr(2, 9)}`;
    
    let diffColor = '#f39c12';
    if (diff.toLowerCase().includes('facile') || diff.toLowerCase().includes('easy')) diffColor = '#27ae60';
    if (diff.toLowerCase().includes('difficile') || diff.toLowerCase().includes('expert') || diff.toLowerCase().includes('hard')) diffColor = '#c0392b';

    // MODIFICA IMPORTANTE: Usa state invece di window
    if (gpxUrl) { state.mapsToInit.push({ id: uniqueMapId, gpx: gpxUrl }); }

    return `
    <div class="trail-card-modern animate-fade">
        <div id="${uniqueMapId}" class="trail-map-container" 
             onclick="event.stopPropagation(); openModal('map', '${gpxUrl}')">
        </div>
        <div class="trail-info-overlay" style="text-align: center; cursor: default; padding: 25px 15px 15px 15px;"> 
            <h3 style="margin: 5px 0 5px 0; font-family:'Roboto Slab'; font-size: 1.25rem; color:#222; line-height:1.2;">
                ${titoloMostrato}
            </h3>
            <div style="font-size:0.75rem; font-weight:700; color:${diffColor}; text-transform:uppercase; letter-spacing:1px; margin-bottom:18px;">
                ${diff}
            </div>
            <button onclick="openModal('trail', '${safeJson(s)}')" 
                    style="width:100%; padding:14px; border:none; background:#2D3436; color:white; border-radius:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; gap:8px; cursor: pointer; transition: background 0.2s;">
                ${t('btn_details')} <span class="material-icons" style="font-size:1.1rem;">arrow_forward</span>
            </button>
        </div>
    </div>`;
};

// === RENDERER VINO ===
export const vinoRenderer = (item) => {
    const safeId = item.id || item.ID; 
    const nome = item.Nome || 'Vino';
    const cantina = item.Produttore || ''; 
    const tipo = (item.Tipo || '').toLowerCase().trim();

    let themeClass = 'is-wine-red'; 
    if (tipo.includes('bianco')) themeClass = 'is-wine-white';
    if (tipo.includes('rosato') || tipo.includes('orange')) themeClass = 'is-wine-orange';

    return `
    <div class="culture-card ${themeClass} animate-fade" onclick="openModal('Vini', '${safeId}')">
        <div class="culture-info">
            ${cantina ? `<div class="culture-location"><span class="material-icons" style="font-size:0.9rem">storefront</span> ${cantina}</div>` : ''}
            <div class="culture-title">${nome}</div>
            <div class="culture-tags">
                 <span class="c-pill" style="text-transform: capitalize;">${item.Tipo || 'Vino'}</span>
            </div>
        </div>
        <div class="culture-bg-icon">
            <i class="fa-solid fa-wine-bottle"></i>
        </div>
    </div>`;
};

// === RENDERER NUMERI UTILI ===
export const numeriUtiliRenderer = (n) => {
    const nome = dbCol(n, 'Nome') || 'Numero Utile';
    const paesi = dbCol(n, 'Paesi') || 'Info'; 
    const numero = n.Numero || n.Telefono || '';

    let icon = 'help_outline'; 
    const nLower = nome.toLowerCase();
    if (nLower.includes('carabinieri') || nLower.includes('polizia')) icon = 'security';
    else if (nLower.includes('medica') || nLower.includes('croce')) icon = 'medical_services';
    else if (nLower.includes('taxi')) icon = 'local_taxi';
    else if (nLower.includes('farmacia')) icon = 'local_pharmacy';
    else if (nLower.includes('info')) icon = 'info';

    return `
    <div class="info-card animate-fade">
        <div class="info-icon-box">
            <span class="material-icons">${icon}</span>
        </div>
        <div class="info-text-col">
            <h3>${nome}</h3>
            <p><span class="material-icons" style="font-size: 0.9rem;">place</span> ${paesi}</p>
        </div>
        <div class="action-btn btn-call" onclick="window.location.href='tel:${numero}'">
            <span class="material-icons">call</span>
        </div>
    </div>`;
};

// === RENDERER FARMACIE ===
export const farmacieRenderer = (f) => {
    const nome = dbCol(f, 'Farmacia') || dbCol(f, 'Nome') || 'Farmacia';
    const paese = dbCol(f, 'Paese') || dbCol(f, 'Paesi') || '';
    const numero = f.Telefono || f.Numero || '';

    return `
    <div class="info-card animate-fade">
        <div class="info-icon-box">
            <span class="material-icons">local_pharmacy</span>
        </div>
        <div class="info-text-col">
            <h3>${nome}</h3>
            <p><span class="material-icons" style="font-size: 0.9rem;">place</span> ${paese}</p>
        </div>
        <div class="action-btn btn-call" onclick="window.location.href='tel:${numero}'">
            <span class="material-icons">call</span>
        </div>
    </div>`;
};

// === RENDERER ATTRAZIONI ===
export const attrazioniRenderer = (item) => {
    const safeId = item.POI_ID || item.id;
    const titolo = dbCol(item, 'Attrazioni') || 'Attrazione';
    const paese = dbCol(item, 'Paese');
    const myId = (item._tempIndex !== undefined) ? item._tempIndex : 0;
    const tempo = item.Tempo_visita || '--'; 
    const diff = dbCol(item, 'Difficoltà Accesso') || 'Accessibile';
    
    const rawLabel = dbCol(item, 'Label') || 'Storico';
    const label = rawLabel.toLowerCase().trim(); 

    let themeClass = 'is-monument';
    let iconClass = 'fa-landmark'; 
    
    if (label === 'religioso') { themeClass = 'is-church'; iconClass = 'fa-church'; }
    else if (label === 'panorama') { themeClass = 'is-view'; iconClass = 'fa-mountain-sun'; }
    else if (label === 'storico') { themeClass = 'is-monument'; iconClass = 'fa-chess-rook'; }

    return `
    <div class="culture-card ${themeClass} animate-fade" onclick="openModal('attrazione', ${myId})">
        <div class="culture-info">
            <div class="culture-location">
                <span class="material-icons" style="font-size:0.9rem;">place</span> ${paese}
            </div>
            <div class="culture-title">${titolo}</div>
            <div class="culture-tags">
                <span class="c-pill"><span class="material-icons" style="font-size:0.8rem;">schedule</span> ${tempo}</span>
                <span class="c-pill">${diff}</span>
            </div>
        </div>
        <div class="culture-bg-icon"><i class="fa-solid ${iconClass}"></i></div>
    </div>`;
};

// === RENDERER PRODOTTO ===
export const prodottoRenderer = (p) => {
    const titolo = dbCol(p, 'Prodotti') || dbCol(p, 'Nome');
    const ideale = dbCol(p, 'Ideale per') || 'Tutti'; 
    const fotoKey = p.Prodotti_foto || titolo;
    const imgUrl = getSmartUrl(fotoKey, '', 200);

    return `
    <div class="culture-card is-product animate-fade" onclick="openModal('product', '${safeJson(p)}')">
        <div class="culture-info">
            <div class="culture-title">${titolo}</div>
            <div class="product-subtitle">
                <span class="material-icons">stars</span> ${t('ideal_for')}: ${ideale}
            </div>
        </div>
        <div class="culture-product-thumb">
            <img src="${imgUrl}" loading="lazy" alt="${titolo}">
        </div>
    </div>`;
};

// === RENDERER TRENO (Speciale) ===
export const trainSearchRenderer = (data, nowTime) => {
    return `
    <div class="bus-search-box animate-fade" style="border-top: 4px solid #c0392b; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); color: white; border-radius: 20px;">
        <div class="bus-title">
            <span class="material-icons" style="background: rgba(255, 255, 255, 0.3); color:#e74c3c;">train</span> 
            Cinque Terre Express
        </div>
        <div style="padding: 0 5px;">
            <p style="font-size:0.9rem; color:#ccc; line-height:1.5; margin-bottom:15px;">${t('train_desc')}</p>
            <div style="background: rgba(255, 255, 255, 0.19); border-radius:12px; padding:15px; margin-bottom:20px; border:1px solid rgba(255,255,255,0.1);">
                <h4 style="margin:0 0 10px 0; font-size:0.8rem; color:#aaa; text-transform:uppercase;">⏱️ ${t('avg_times')}</h4>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding:8px 0;">
                    <span>La Spezia ↔ Riomaggiore</span> <b style="color:white;">7 min</b>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255, 255, 255, 0.25); padding:8px 0;">
                    <span>${t('between_villages')}</span> <b style="color:white;">2-4 min</b>
                </div>
                <div style="display:flex; justify-content:space-between; padding:8px 0;">
                    <span>Monterosso ↔ Levanto</span> <b style="color:white;">5 min</b>
                </div>
            </div>
        </div>
        <button onclick="apriTrenitalia()" class="btn-yellow" style="background: #c0392b; color: white; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 15px rgba(192, 57, 43, 0.4); display:flex; align-items:center; justify-content:center; gap:10px; width:100%; padding:15px; border-radius:12px;">
            <span class="material-icons" style="font-size:1.2rem;">confirmation_number</span> 
            <span style="font-weight:bold;">${t('train_cta')}</span>
        </button>
        <p style="font-size:0.75rem; text-align:center; color:#888; margin-top:10px;">${t('check_site')}</p>
    </div>`;
};