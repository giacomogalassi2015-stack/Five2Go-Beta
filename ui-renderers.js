const sentieroRenderer = (s) => {
    const paese = dbCol(s, 'Paesi');
    const distanza = s.Distanza || '--';
    const durata = s.Durata || '--';
    const extra = dbCol(s, 'Extra') || 'Sentiero';
    const gpxUrl = s.Gpxlink || s.gpxlink;

    const uniqueMapId = `map-trail-${Math.random().toString(36).substr(2, 9)}`;
    if (gpxUrl) { window.mapsToInit.push({ id: uniqueMapId, gpx: gpxUrl }); }

    return `
    <div class="card-sentiero-modern">
        <div id="${uniqueMapId}" class="sentiero-map-bg"></div>
        <div class="sentiero-card-overlay">
            <h2 class="sentiero-overlay-title">${paese}</h2>
            <div class="sentiero-stats">
                <div class="stat-pill"><span class="stat-icon">📏</span><span class="stat-val">${distanza}</span></div>
                <div class="stat-pill"><span class="stat-icon">🕒</span><span class="stat-val">${durata}</span></div>
                <div class="stat-pill"><span class="stat-icon">🏷️</span><span class="stat-val">${extra}</span></div>
            </div>
            <button class="btn-outline-details" onclick='openModal("trail", ${JSON.stringify(s).replace(/'/g, "'")})'>
                Dettagli Percorso
            </button>
        </div>
    </div>`;
};

const ristoranteRenderer = (r) => {
    const nome = dbCol(r, 'Nome') || 'Ristorante';
    const paesi = dbCol(r, 'Paesi') || '';
    const indirizzo = r.Indirizzo || '';
    const safeObj = encodeURIComponent(JSON.stringify(r));
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nome + ' ' + paesi + ' Cinque Terre')}`;
    const phoneLink = r.Telefono ? `tel:${r.Telefono}` : '#';
    const phoneColor = r.Telefono ? '#2E7D32' : '#B0BEC5';
    const phoneCursor = r.Telefono ? 'pointer' : 'default';

    return `
    <div class="animate-fade" style="background: #ffffff; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); overflow: hidden; font-family: Roboto; border: 1px solid #eee;">
        <div onclick="openModal('restaurant', '${safeObj}')" style="padding: 20px; cursor: pointer;">
            <div style="font-size: 1.25rem; font-weight: 800; color: #2c3e50; margin-bottom: 6px; line-height: 1.2;">${nome}</div>
            <div style="font-size: 0.95rem; color: #7f8c8d; display: flex; align-items: center; gap: 5px;"><span>📍</span> ${paesi} ${indirizzo ? ' • ' + indirizzo : ''}</div>
        </div>
        <div style="display: flex; border-top: 1px solid #f0f0f0; background: #fafafa;">
            <div onclick="openModal('restaurant', '${safeObj}')" style="flex: 1; padding: 15px 0; text-align: center; cursor: pointer; border-right: 1px solid #eee; color: #F57C00;">
                <div style="font-size: 1.2rem; margin-bottom: 2px;">📄</div><div style="font-size: 0.7rem; font-weight: bold;">SCHEDA</div>
            </div>
            <a href="${phoneLink}" style="flex: 1; padding: 15px 0; text-align: center; text-decoration: none; border-right: 1px solid #eee; cursor: ${phoneCursor}; color: ${phoneColor};">
                <div style="font-size: 1.2rem; margin-bottom: 2px;">📞</div><div style="font-size: 0.7rem; font-weight: bold;">CHIAMA</div>
            </a>
            <a href="${mapLink}" target="_blank" style="flex: 1; padding: 15px 0; text-align: center; text-decoration: none; color: #1565C0;">
                <div style="font-size: 1.2rem; margin-bottom: 2px;">🗺️</div><div style="font-size: 0.7rem; font-weight: bold;">MAPPA</div>
            </a>
        </div>
    </div>`;
};

const spiaggiaRenderer = (s) => {
    const nome = dbCol(s, 'Nome') || 'Spiaggia';
    const paesi = dbCol(s, 'Paesi');
    const desc = dbCol(s, 'Descrizione') || '';
    const safePaesi = paesi.replace(/'/g, "\\'");
    const safeDesc = desc.replace(/'/g, "\\'");
    const mapLink = `https://www.google.com/maps/search/?api=1&query=Spiaggia ${encodeURIComponent(nome + ' ' + paesi)}`;

    return `
    <div class="card-spiaggia" onclick="simpleAlert('${safePaesi}', '${safeDesc}')">
        <div class="spiaggia-header"><div class="spiaggia-location">📍 ${paesi}</div><span>🏖️</span></div>
        <div class="item-title" style="font-size: 1.3rem; margin: 10px 0;">${nome}</div>
        <div class="spiaggia-footer">
            <a href="${mapLink}" target="_blank" class="btn-azure" onclick="event.stopPropagation()">${t('btn_position')}</a>
        </div>
    </div>`;
};

const farmaciaRenderer = (f) => {
    const nome = dbCol(f, 'Nome');
    const paesi = dbCol(f, 'Paesi');
    const safeObj = JSON.stringify(f).replace(/'/g, "'");
    const fullAddress = `${f.Indirizzo}, ${f.Paesi}`;
    const mapLink = `http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(fullAddress)}`;

    return `
    <div class="card-list-item" onclick='openModal("farmacia", ${safeObj})'>
        <div class="item-info">
            <div class="item-header-row"><div class="item-title">${nome}</div><div class="item-tag" style="background-color:#4CAF50;">${t('pharmacy_tag')}</div></div>
            <div class="item-subtitle">📍 ${paesi}</div>
            <div class="card-actions">
                ${f.Numero ? `<a href="tel:${f.Numero}" class="action-btn btn-phone" onclick="event.stopPropagation()"><span>📞</span> ${t('btn_call')}</a>` : ''}
                ${f.Indirizzo ? `<a href="${mapLink}" target="_blank" class="action-btn btn-map" onclick="event.stopPropagation()"><span>🗺️</span> ${t('btn_map')}</a>` : ''}
            </div>
        </div>
    </div>`;
};

const numeriUtiliRenderer = (n) => {
    const nome = dbCol(n, 'Nome');
    const comune = dbCol(n, 'Comune');
    const paesi = dbCol(n, 'Paesi'); 
    return `
    <div class="card-list-item" style="cursor:default;">
        <div class="item-info">
            <div class="item-header-row"><div class="item-title">${nome}</div><div class="item-tag" style="background-color:#607d8b;">${comune}</div></div>
            <div class="item-subtitle" style="margin-top:6px; color:#555;"><strong>${t('coverage')}:</strong> ${paesi}</div>
            <div class="card-actions">
                <a href="tel:${n.Numero}" class="action-btn btn-phone" onclick="event.stopPropagation()">
                    <span style="font-size:1.2rem; margin-right:5px;">📞</span> ${t('btn_call')} ${n.Numero}
                </a>
            </div>
        </div>
    </div>`;
};

const attrazioniRenderer = (item) => {
    const titolo = dbCol(item, 'Attrazioni') || 'Attrazione';
    const paese = dbCol(item, 'Paese');
    const myId = (item._tempIndex !== undefined) ? item._tempIndex : 0;
    const diff = dbCol(item, 'Difficoltà Accesso') || 'Accessibile';
    const isHard = diff.toLowerCase().match(/alta|hard|difficile|schwer|difícil/); 
    const diffStyle = isHard ? 'background:#ffebee; color:#c62828;' : 'background:#e8f5e9; color:#2e7d32;';

    return `
    <div class="card-list-item monument-mode" onclick="openModal('attrazione', ${myId})">
        <div class="item-info">
            <div class="item-header-row"><div class="item-title">${titolo}</div></div>
            <div class="item-subtitle" style="margin-bottom: 8px;">📍 ${paese}</div>
            <div class="monument-meta" style="display:flex; gap:8px;">
                <span class="meta-badge" style="${diffStyle} padding:2px 8px; border-radius:4px; font-size:0.75rem;">${diff}</span>
                <span class="meta-badge badge-time" style="background:#f5f5f5; padding:2px 8px; border-radius:4px; font-size:0.75rem;">⏱ ${item["Tempo Visita (min)"] || '--'} ${t('visit_time')}</span>
            </div>
        </div>
        <div class="item-arrow" style="margin-top: auto; margin-bottom: auto;">➜</div>
    </div>`;
};