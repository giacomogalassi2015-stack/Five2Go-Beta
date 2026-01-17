const content = document.getElementById('app-content');
const viewTitle = document.getElementById('view-title');

// --- LINGUA & NAV BAR ---
function setupLanguageSelector() {
    const header = document.querySelector('header');
    
    // PULIZIA VECCHI ELEMENTI
    const oldActions = header.querySelector('.header-actions');
    if (oldActions) oldActions.remove();
    const oldShare = header.querySelector('.header-share-left');
    if (oldShare) oldShare.remove();
    header.querySelectorAll('.material-icons').forEach(i => i.remove());

    // --- SELETTORE LINGUA ---
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'header-actions'; 
    actionsContainer.id = 'header-btn-lang'; 
    Object.assign(actionsContainer.style, { position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: '20' });

    const currFlag = AVAILABLE_LANGS.find(l => l.code === currentLang).flag;
    const currCode = currentLang.toUpperCase();

    const langSelector = document.createElement('div');
    langSelector.className = 'lang-selector';
    langSelector.innerHTML = `
        <button class="current-lang-btn" onclick="toggleLangDropdown(event)">
            <span class="lang-flag">${currFlag}</span> ${currCode} ▾
        </button>
        <div class="lang-dropdown" id="lang-dropdown" style="left: 0; right: auto;">
            ${AVAILABLE_LANGS.map(l => `
                <button class="lang-opt ${l.code === currentLang ? 'active' : ''}" onclick="changeLanguage('${l.code}')">
                    <span class="lang-flag">${l.flag}</span> ${l.label}
                </button>
            `).join('')}
        </div>`;
    actionsContainer.appendChild(langSelector);

    // --- BOTTONE SHARE ---
    const shareBtn = document.createElement('span');
    shareBtn.className = 'material-icons header-share-right'; 
    shareBtn.id = 'header-btn-share'; 
    shareBtn.innerText = 'share'; 
    shareBtn.onclick = shareApp;
    Object.assign(shareBtn.style, { position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#000000', cursor: 'pointer', fontSize: '26px', zIndex: '20' });

    header.appendChild(actionsContainer);
    header.appendChild(shareBtn);
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

function changeLanguage(langCode) {
    currentLang = langCode;
    localStorage.setItem('app_lang', langCode);
    setupLanguageSelector(); 
    updateNavBar(); 
    const activeNav = document.querySelector('.nav-item.active');
    if(activeNav) {
        const onclickAttr = activeNav.getAttribute('onclick');
        const viewMatch = onclickAttr.match(/switchView\('([^']+)'/);
        if(viewMatch) switchView(viewMatch[1], activeNav);
        else switchView('home'); 
    } else {
        switchView('home');
    }
}

window.addEventListener('click', () => {
    const dd = document.getElementById('lang-dropdown');
    if(dd) dd.classList.remove('show');
});

// --- NAVIGAZIONE PRINCIPALE ---
async function switchView(view, el) {
    if (!content) return;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (el) el.classList.add('active');
    
    // Gestione Header
    const shareBtn = document.getElementById('header-btn-share');
    const langBtn = document.getElementById('header-btn-lang');
    if (shareBtn && langBtn) {
        shareBtn.style.display = (view === 'home') ? 'block' : 'none';
        langBtn.style.display = (view === 'home') ? 'block' : 'none';
    }

    content.innerHTML = `<div class="loader">${t('loading')}</div>`;

    const titleMap = { 'home': 'home_title', 'cibo': 'food_title', 'outdoor': 'outdoor_title', 'servizi': 'services_title', 'mappe_monumenti': 'maps_title' };
    if(titleMap[view]) viewTitle.innerText = t(titleMap[view]);

    try {
        if (view === 'home') await renderHome();
        else if (view === 'cibo') renderSubMenu([{ label: t('menu_rest'), table: "Ristoranti" }, { label: t('menu_prod'), table: "Prodotti" }], 'Ristoranti');
        else if (view === 'outdoor') renderSubMenu([{ label: t('menu_trail'), table: "Sentieri" }, { label: t('menu_beach'), table: "Spiagge" }], 'Sentieri');
        else if (view === 'servizi') renderSubMenu([{ label: t('menu_trans'), table: "Trasporti" }, { label: t('menu_num'), table: "Numeri_utili" }, { label: t('menu_pharm'), table: "Farmacie" }], 'Trasporti');
        else if (view === 'mappe_monumenti') renderSubMenu([{ label: t('menu_map'), table: "Attrazioni" }, { label: t('menu_monu'), table: "Mappe" }], 'Attrazioni');
    } catch (err) {
        console.error(err);
        content.innerHTML = `<div class="error-msg">${t('error')}: ${err.message}</div>`;
    }
}

async function renderHome() {
    const { data, error } = await supabaseClient.from('Cinque_Terre').select('*');
    if (error) throw error;
    let html = '<div class="grid-container animate-fade">';
    data.forEach(v => {
        const paeseName = v.Paesi; 
        const imgUrl = getSmartUrl(paeseName, '', 800); 
        const safeName = paeseName.replace(/'/g, "\\'");
        html += `<div class="village-card" style="background-image: url('${imgUrl}')" onclick="openModal('village', '${safeName}')"><div class="card-title-overlay">${paeseName}</div></div>`;
    });
    html += `<div class="village-card" style="background-image: url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')" onclick="switchView('mappe_monumenti', null)"><div class="card-title-overlay">${t('maps_title')}</div></div>`;
    content.innerHTML = html + '</div>';
}

function renderSubMenu(options, defaultTable) {
    let menuHtml = `
    <div class="sub-nav-bar" style="display: flex; justify-content: space-between; align-items: center; padding-right: 15px;">
        <div class="sub-nav-tabs" style="display:flex; overflow-x: auto; white-space: nowrap;">
            ${options.map(opt => `<button class="sub-nav-item" onclick="loadTableData('${opt.table}', this)">${opt.label}</button>`).join('')}
        </div>
        <button id="filter-toggle-btn" style="display: none; background: #f0f0f0; border: 1px solid #ccc; border-radius: 20px; padding: 5px 12px; font-size: 0.8rem; font-weight: bold; color: #333; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">FILTRA</button>
    </div>
    <div id="sub-content"></div>`;
    content.innerHTML = menuHtml;
    const firstBtn = content.querySelector('.sub-nav-item');
    if (firstBtn) loadTableData(defaultTable, firstBtn);
}

// --- DATA LOADING & LOGICA FILTRI ---
async function loadTableData(tableName, btnEl) {
    const subContent = document.getElementById('sub-content');
    const filterBtn = document.getElementById('filter-toggle-btn');
    if (!subContent) return;

    document.querySelectorAll('.sub-nav-item').forEach(b => b.classList.remove('active-sub'));
    if (btnEl) btnEl.classList.add('active-sub');
    if(filterBtn) filterBtn.style.display = 'none';

    subContent.innerHTML = `<div class="loader">${t('loading')}</div>`;
    const { data, error } = await supabaseClient.from(tableName).select('*');
    if (error) { subContent.innerHTML = `<p class="error-msg">${t('error')}: ${error.message}</p>`; return; }

    let html = '<div class="list-container animate-fade">';

    if (tableName === 'Sentieri') { renderGenericFilterableView(data, 'Difficolta', subContent, sentieroRenderer); return; }
    else if (tableName === 'Spiagge') { renderGenericFilterableView(data, 'Paesi', subContent, spiaggiaRenderer); return; }
    else if (tableName === 'Ristoranti') { renderGenericFilterableView(data, 'Paesi', subContent, ristoranteRenderer); return; }
    else if (tableName === 'Farmacie') { renderGenericFilterableView(data, 'Paesi', subContent, farmaciaRenderer); return; } 
    else if (tableName === 'Attrazioni') {
        window.tempAttractionsData = data;
        data.forEach((item, index) => { item._tempIndex = index; });
        renderGenericFilterableView(data, 'Paese', subContent, attrazioniRenderer);
        return;
    }
    else if (tableName === 'Numeri_utili') {
        data.sort((a, b) => {
            const isEmergenzaA = a.Nome.includes('112') || a.Nome.toLowerCase().includes('emergenza');
            const isEmergenzaB = b.Nome.includes('112') || b.Nome.toLowerCase().includes('emergenza');
            return (isEmergenzaA === isEmergenzaB) ? 0 : isEmergenzaA ? -1 : 1;
        }); 
        renderGenericFilterableView(data, 'Comune', subContent, numeriUtiliRenderer);
        return;
    };

    if (tableName === 'Prodotti') {
        data.forEach(p => {
            const titolo = dbCol(p, 'Prodotti') || dbCol(p, 'Nome'); 
            const imgUrl = getSmartUrl(p.Prodotti || p.Nome, '', 400);
            const safeObj = JSON.stringify(p).replace(/'/g, "'");
            html += `<div class="card-product" onclick='openModal("product", ${safeObj})'><div class="prod-info"><div class="prod-title">${titolo}</div><div class="prod-arrow">➜</div></div><img src="${imgUrl}" class="prod-thumb" loading="lazy" onerror="this.style.display='none'"></div>`;
        });
    } 
    else if (tableName === 'Trasporti') {
        window.tempTransportData = data;
        data.forEach((t, index) => {
            const nomeDisplay = dbCol(t, 'Località') || dbCol(t, 'Mezzo');
            const imgUrl = getSmartUrl(t.Località || t.Mezzo, '', 400);
            html += `<div class="card-product" onclick="openModal('transport', ${index})"><div class="prod-info"><div class="prod-title">${nomeDisplay}</div></div><img src="${imgUrl}" class="prod-thumb" loading="lazy" onerror="this.style.display='none'"></div>`;
        });
    }
    else if (tableName === 'Mappe') {
        subContent.innerHTML = `<div class="map-container animate-fade"><iframe src="https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1" width="640" height="480"></iframe><div class="map-note">${t('map_loaded')}</div></div>`;
        return; 
    } 
    subContent.innerHTML = html + '</div>';
}

function renderGenericFilterableView(allData, filterKey, container, cardRenderer) {
    container.innerHTML = `<div class="filter-bar animate-fade" id="dynamic-filters" style="display:none;"></div><div class="list-container animate-fade" id="dynamic-list"></div>`;
    const filterBar = container.querySelector('#dynamic-filters');
    const listContainer = container.querySelector('#dynamic-list');
    const filterBtn = document.getElementById('filter-toggle-btn');

    if (filterBtn) {
        filterBtn.style.display = 'block'; 
        const newBtn = filterBtn.cloneNode(true);
        filterBtn.parentNode.replaceChild(newBtn, filterBtn);
        newBtn.onclick = () => {
            const isHidden = filterBar.style.display === 'none';
            filterBar.style.display = isHidden ? 'flex' : 'none';
            newBtn.style.background = isHidden ? '#e0e0e0' : '#f0f0f0'; 
        };
    }

    let rawValues = allData.map(item => item[filterKey] ? item[filterKey].trim() : null).filter(x => x);
    let tagsRaw = [...new Set(rawValues)];
    const customOrder = ["Tutti", "Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso", "Facile", "Media", "Difficile", "Turistico", "Escursionistico", "Esperto"];
    if (!tagsRaw.includes('Tutti')) tagsRaw.unshift('Tutti');

    const uniqueTags = tagsRaw.sort((a, b) => {
        const indexA = customOrder.indexOf(a), indexB = customOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    uniqueTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'filter-chip';
        btn.innerText = tag;
        if (tag === 'Tutti') btn.classList.add('active-filter');
        btn.onclick = () => {
            filterBar.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active-filter'));
            btn.classList.add('active-filter');
            const filtered = tag === 'Tutti' ? allData : allData.filter(item => {
                const valDB = item[filterKey] ? item[filterKey].trim() : '';
                return (valDB === tag) || (item.Nome && (item.Nome.includes('112') || item.Nome.toLowerCase().includes('emergenza')));
            });
            updateList(filtered);
        };
        filterBar.appendChild(btn);
    });

    function updateList(items) {
        if (!items || items.length === 0) { listContainer.innerHTML = `<p style="text-align:center; padding:20px; color:#999;">${t('no_results')}</p>`; return; }
        listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');
        if (typeof initPendingMaps === 'function') setTimeout(() => initPendingMaps(), 100);
    }
    updateList(allData);
}

// --- MODAL & UTILS ---
function simpleAlert(titolo, testo) { alert(`${titolo}\n\n${testo}`); }

async function openModal(type, payload) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay animate-fade';
    document.body.appendChild(modal);
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };

    let contentHtml = '';

    if (type === 'village') {
        const bigImg = getSmartUrl(payload, '', 1000);
        const { data } = await supabaseClient.from('Cinque_Terre').select('*').eq('Paesi', payload).single();
        const desc = data ? dbCol(data, 'Descrizione') : t('loading');
        contentHtml = `<img src="${bigImg}" style="width:100%; border-radius:12px; height:220px; object-fit:cover;"><h2>${payload}</h2><p>${desc}</p>`;
    } 
    else if (type === 'product') {
        const nome = dbCol(payload, 'Prodotti') || dbCol(payload, 'Nome');
        const desc = dbCol(payload, 'Descrizione');
        const ideale = dbCol(payload, 'Ideale per') || dbCol(payload, 'Ideale per');
        const bigImg = getSmartUrl(payload.Prodotti || payload.Nome, 'Prodotti', 800);
        contentHtml = `<img src="${bigImg}" style="width:100%; border-radius:12px; height:200px; object-fit:cover;" onerror="this.style.display='none'"><h2>${nome}</h2><p>${desc || ''}</p><hr><p><strong>${t('ideal_for')}:</strong> ${ideale || ''}</p>`;
    }
    else if (type === 'transport') {
        const item = window.tempTransportData[payload];
        if (!item) { console.error("Errore recupero trasporto"); return; }
        const nome = dbCol(item, 'Località') || dbCol(item, 'Mezzo');
        const desc = dbCol(item, 'Descrizione');
        const linkSito = item.Link;
        const linkOrari = item.Link_2;
        contentHtml = `
            <h2>${nome}</h2>
            <p style="margin: 15px 0; line-height: 1.6;">${desc || ''}</p>
            <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
                ${linkSito ? `<a href="${linkSito}" target="_blank" class="btn-yellow" style="text-align:center;">${t('btn_website')}</a>` : ''}
                ${linkOrari ? `<a href="${linkOrari}" target="_blank" class="btn-yellow" style="text-align:center;">${t('btn_hours')}</a>` : ''}
            </div>`;
    }
    else if (type === 'trail') {
        const titolo = dbCol(payload, 'Paesi');
        const aiuto = dbCol(payload, 'Tag aiuto') || '--';
        const dist = payload.Distanza || '--';
        const dura = payload.Durata || '--';
        const tag = dbCol(payload, 'Extra') || 'Sentiero';
        const desc = dbCol(payload, 'Descrizione') || '';
        contentHtml = `
            <div style="padding: 20px 0;">
                <h2 style="text-align: center; margin-bottom: 25px; font-family: 'Roboto Slab', cursive; font-size: 1.8rem; color: var(--primary-dark);">${titolo}</h2>
                <div style="display: flex; justify-content: space-between; padding: 0 30px; margin-bottom: 20px;">
                    <div style="display: flex; flex-direction: column; align-items: flex-start;"><span style="font-size: 0.7rem; text-transform: uppercase; color: #999; font-weight: 800; letter-spacing: 0.5px;">Info</span><span style="font-weight: 700; color: #444; font-size: 1rem;">${aiuto}</span></div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end;"><span style="font-size: 0.7rem; text-transform: uppercase; color: #999; font-weight: 800; letter-spacing: 0.5px;">Distanza</span><span style="font-weight: 700; color: #444; font-size: 1rem;">${dist}</span></div>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 0 30px; margin-bottom: 25px;">
                    <div style="display: flex; flex-direction: column; align-items: flex-start;"><span style="font-size: 0.7rem; text-transform: uppercase; color: #999; font-weight: 800; letter-spacing: 0.5px;">Segnavia</span><span style="font-weight: 700; color: var(--accent-col); font-size: 1rem;">${tag}</span></div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end;"><span style="font-size: 0.7rem; text-transform: uppercase; color: #999; font-weight: 800; letter-spacing: 0.5px;">Tempo Stimato</span><span style="font-weight: 700; color: #444; font-size: 1rem;">${dura}</span></div>
                </div>
                <div style="margin: 0 30px; height: 1px; background: #eee;"></div>
                <div style="padding: 25px 30px;"><p style="line-height: 1.7; color: #666; text-align: center; font-size: 0.95rem; font-family: 'Roboto', sans-serif;">${desc}</p></div>
            </div>`;
    }
    else if (type === 'Attrazione' || type === 'attrazione') {
        let item = (window.tempAttractionsData && typeof payload === 'number') ? window.tempAttractionsData[payload] : null;
        if (!item) { contentHtml = `<h2>Errore caricamento</h2><p>Impossibile recuperare i dettagli.</p>`; } 
        else {
            const titolo = dbCol(item, 'Attrazioni');
            const paese = dbCol(item, 'Paese'); 
            const desc = dbCol(item, 'Descrizione');
            const curio = dbCol(item, 'Curiosità');
            const diff = dbCol(item, 'Difficoltà Accesso') || 'Accessibile';
            const mapLink = item["Icona MyMaps"];
            contentHtml = `<h2>${titolo}</h2><div style="color:#666; margin-bottom:15px; font-weight:600;">📍 ${paese}</div><div style="display:flex; gap:10px; margin-bottom:15px;"><span class="meta-badge" style="background:#eee; padding:5px; border-radius:8px;">⏱ ${item["Tempo Visita (min)"] || '--'} ${t('visit_time')}</span><span class="meta-badge" style="background:#eee; padding:5px; border-radius:8px;">${diff}</span></div><p style="line-height:1.6;">${desc || ''}</p>${curio ? `<div class="curiosity-box" style="margin-top:20px; padding:15px; background:#f9f9f9; border-left:4px solid orange; border-radius: 4px;"><strong>💡 ${t('curiosity') || 'Curiosità'}:</strong><br>${curio}</div>` : ''}<div style="margin-top:20px;">${mapLink ? `<a href="${mapLink}" target="_blank" class="btn-yellow" style="display:block; text-align:center;">${t('btn_position')}</a>` : ''}</div>`;
        }
    }
    modal.innerHTML = `<div class="modal-content"><span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>${contentHtml}</div>`;
}

function initPendingMaps() {
    if (!window.mapsToInit || window.mapsToInit.length === 0) return;
    window.mapsToInit.forEach(mapData => {
        const element = document.getElementById(mapData.id);
        if (element && !element._leaflet_id) {
            const map = L.map(mapData.id, { zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, attributionControl: false });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            if (mapData.gpx) {
                new L.GPX(mapData.gpx, {
                    async: true,
                    marker_options: { startIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-start.png', endIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-end.png', shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-shadow.png', iconSize: [20, 30] },
                    polyline_options: { color: '#E76F51', weight: 5, opacity: 0.8 }
                }).on('loaded', function(e) { map.fitBounds(e.target.getBounds(), { paddingTopLeft: [20, 20], paddingBottomRight: [20, 180] }); }).addTo(map);
            }
        }
    });
    window.mapsToInit = []; 
}

// --- EVENT LISTENERS ---
document.addEventListener('touchmove', function(event) { if (event.scale !== 1) event.preventDefault(); }, { passive: false });
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) event.preventDefault();
    lastTouchEnd = now;
}, false);
document.addEventListener('touchstart', function(event) { if (event.touches.length > 1) event.preventDefault(); }, { passive: false });

document.addEventListener('DOMContentLoaded', () => {
    setupLanguageSelector(); 
    updateNavBar(); 
    switchView('home');      
});