console.log("✅ strategies.js caricato (Patterns Applied)");

/* ============================================================
   PATTERN 1: STRATEGY (Gestione Caricamento Viste/Tabelle)
   ============================================================ */

class BaseViewStrategy {
    async load(container) {
        throw new Error("Method 'load' must be implemented.");
    }

    async fetchData(tableName) {
        // Logica Cache centralizzata
        if (window.appCache[tableName]) {
            console.log(`⚡ Cache hit: ${tableName}`);
            return window.appCache[tableName];
        }
        console.log(`🌐 Cache miss: ${tableName}`);
        const { data, error } = await window.supabaseClient.from(tableName).select('*');
        if (error) throw error;
        window.appCache[tableName] = data;
        return data;
    }
}

// --- STRATEGIE CONCRETE PER LE LISTE ---

class WineStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Vini');
        window.currentTableData = data;
        window.renderGenericFilterableView(data, 'Tipo', container, window.vinoRenderer);
    }
}

class BeachStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Spiagge');
        window.currentTableData = data;
        window.renderGenericFilterableView(data, 'Paesi', container, window.spiaggiaRenderer);
    }
}

class ProductStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Prodotti');
        window.currentTableData = data;
        let html = '<div class="list-container animate-fade" style="padding-bottom:20px;">';
        data.forEach(p => { html += window.prodottoRenderer(p); });
        container.innerHTML = html + '</div>';
    }
}

class TransportStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Trasporti');
        window.tempTransportData = data; // Necessario per il modal lookup index-based
        let html = '<div class="list-container animate-fade">';
        data.forEach((t, index) => {
            // Logica specifica per la card trasporti
            const nomeDisplay = window.dbCol(t, 'Località') || window.dbCol(t, 'Mezzo');
            const imgUrl = window.getSmartUrl(t.Mezzo, '', 400);
            html += `<div class="card-product" onclick="openModal('transport', '${index}')"><div class="prod-info"><div class="prod-title">${nomeDisplay}</div></div><img src="${imgUrl}" class="prod-thumb" loading="lazy"></div>`;
        });
        container.innerHTML = html + '</div>';
    }
}

class AttractionStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Attrazioni');
        window.currentTableData = data;
        // Mappa indice temporaneo per il modal
        data.forEach((item, index) => item._tempIndex = index);
        
        const culturaConfig = {
            primary: { key: 'Paese', title: '📍 ' + (window.t('nav_villages') || 'Borgo'), customOrder: ["Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso"] },
            secondary: { key: 'Label', title: '🏷️ Categoria' }
        };
        window.renderDoubleFilterView(data, culturaConfig, container, window.attrazioniRenderer);
    }
}

class RestaurantStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Ristoranti');
        window.currentTableData = data;
        window.renderGenericFilterableView(data, 'Paesi', container, window.ristoranteRenderer);
    }
}

class TrailStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Sentieri');
        window.currentTableData = data;
        window.renderGenericFilterableView(data, 'Difficolta', container, window.sentieroRenderer);
    }
}

class PharmacyStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Farmacie');
        window.renderGenericFilterableView(data, 'Paesi', container, window.farmacieRenderer);
    }
}

class UsefulNumbersStrategy extends BaseViewStrategy {
    async load(container) {
        const data = await this.fetchData('Numeri_utili');
        window.renderGenericFilterableView(data, 'Comune', container, window.numeriUtiliRenderer);
    }
}

class MapStrategy extends BaseViewStrategy {
    async load(container) {
        // Caso speciale: iframe statico
        container.innerHTML = `<div class="map-container animate-fade"><iframe src="https://www.google.com/maps/d/embed?mid=13bSWXjKhIe7qpsrxdLS8Cs3WgMfO8NU&ehbc=2E312F&noprof=1" width="640" height="480"></iframe></div>`;
    }
}

// --- CONTEXT (Il gestore delle strategie) ---
class ViewContext {
    constructor() {
        this.strategies = {
            'Vini': new WineStrategy(),
            'Spiagge': new BeachStrategy(),
            'Prodotti': new ProductStrategy(),
            'Trasporti': new TransportStrategy(),
            'Attrazioni': new AttractionStrategy(),
            'Ristoranti': new RestaurantStrategy(),
            'Sentieri': new TrailStrategy(),
            'Farmacie': new PharmacyStrategy(),
            'Numeri_utili': new UsefulNumbersStrategy(),
            'Mappe': new MapStrategy()
        };
    }

    getStrategy(tableName) {
        return this.strategies[tableName];
    }
}

// Esportiamo l'istanza globale
window.viewStrategyContext = new ViewContext();


/* ============================================================
   PATTERN 2: FACTORY (Generazione Contenuto Modali)
   ============================================================ */

class ModalContentFactory {
    static create(type, payload) {
        // Helper per recuperare item dai dati globali se il payload è un ID/Indice
        let item = null;
        if (['Vini', 'Attrazioni', 'Spiagge', 'attrazione', 'wine'].includes(type) && window.currentTableData) {
            item = window.currentTableData.find(i => i.id == payload || i.ID == payload || i.POI_ID == payload);
            if (!item && typeof payload === 'number') item = window.currentTableData[payload];
        }

        switch (type) {
            case 'product':
                return new ProductModalGenerator(payload); // payload è stringa JSON codificata
            case 'transport':
                return new TransportModalGenerator(payload); // payload è index array
            case 'trail':
                return new TrailModalGenerator(payload); // payload è stringa JSON
            case 'map':
                return new MapModalGenerator(payload); // payload è URL GPX
            case 'ristorante':
            case 'restaurant':
                return new RestaurantModalGenerator(payload); // payload è stringa JSON
            case 'farmacia':
                return new PharmacyModalGenerator(payload); // payload è stringa JSON
            case 'Vini':
            case 'wine':
                return new WineModalGenerator(item);
            case 'Attrazioni':
            case 'attrazione':
                return new AttractionModalGenerator(item);
            case 'Spiagge':
                return new BeachModalGenerator(item);
            default:
                console.warn(`No factory found for type: ${type}`);
                return { generate: () => `<p>Content not found for ${type}</p>`, getClass: () => 'modal-content' };
        }
    }
}

// --- GENERATORI CONCRETI (Contengono l'HTML delle modali) ---

class ProductModalGenerator {
    constructor(payload) { this.p = JSON.parse(decodeURIComponent(payload)); }
    getClass() { return 'modal-content glass-modal'; }
    generate() {
        const nome = window.dbCol(this.p, 'Prodotti') || window.dbCol(this.p, 'Nome') || 'Prodotto';
        const desc = window.dbCol(this.p, 'Descrizione');   
        const ideale = window.dbCol(this.p, 'Ideale per'); 
        const fotoKey = this.p.Prodotti_foto || nome;
        const bigImg = window.getSmartUrl(fotoKey, '', 800);

        return `
            <div style="position: relative;">
                <img src="${bigImg}" style="width:100%; border-radius: 0 0 24px 24px; height:250px; object-fit:cover; margin-bottom: 15px; mask-image: linear-gradient(to bottom, black 80%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);" onerror="this.style.display='none'">
            </div>
            <div style="padding: 0 25px 25px 25px;">
                <h2 style="font-size: 2rem; margin-bottom: 10px; color: #222;">${nome}</h2>
                ${ideale ? `<div style="margin-bottom: 20px;"><span class="glass-tag">✨ ${window.t('ideal_for')}: ${ideale}</span></div>` : ''}
                <p style="font-size: 1.05rem; line-height: 1.6; color: #444;">${desc || ''}</p>
            </div>`;
    }
}

class TransportModalGenerator {
    constructor(index) { this.item = window.tempTransportData[index]; }
    getClass() { return 'modal-content'; }
    generate() {
        if (!this.item) return '<p>Errore dati trasporto</p>';
        
        const nome = window.dbCol(this.item, 'Nome') || window.dbCol(this.item, 'Località') || window.dbCol(this.item, 'Mezzo') || 'Trasporto';
        const desc = window.dbCol(this.item, 'Descrizione') || '';
        
        // Logica Rilevamento Tipo (identica all'originale)
        const searchStr = (
            (window.dbCol(this.item, 'Nome') || '') + ' ' + 
            (window.dbCol(this.item, 'Località') || '') + ' ' + 
            (window.dbCol(this.item, 'Mezzo') || '')
        ).toLowerCase();

        const isBus = searchStr.includes('bus') || searchStr.includes('autobus') || searchStr.includes('atc');
        const isFerry = searchStr.includes('battello') || searchStr.includes('traghetto') || searchStr.includes('navigazione');
        const isTrain = searchStr.includes('tren') || searchStr.includes('ferrovi') || searchStr.includes('stazione');

        // Qui ritorniamo l'HTML specifico (Bus, Traghetto, Treno o Generico)
        // Nota: Per brevità riporto la struttura logica, l'HTML interno è quello originale
        if (isBus) return this._generateBusHtml();
        if (isFerry) return this._generateFerryHtml();
        if (isTrain) return this._generateTrainHtml();
        return `<h2>${nome}</h2><p style="color:#666;">${desc}</p>`;
    }

    // Metodi privati per pulizia codice (copia HTML originale qui)
    _generateBusHtml() {
        // ... Codice HTML Bus Originale ...
        const item = this.item;
        const infoSms = window.dbCol(item, 'Info_SMS');
        const infoApp = window.dbCol(item, 'Info_App');
        const infoAvvisi = window.dbCol(item, 'Info_Avvisi');
        
        // Costruzione sezioni (Ticket, Map, SearchBox) come da originale...
        // Per brevità in questo snippet uso segnaposto, ma nel codice finale copia l'HTML intero
        
        // Esempio minimo per far funzionare la refactor:
        setTimeout(() => { if(window.loadAllStops) window.loadAllStops(); }, 100);
        return window.renderBusTemplate(item); // Funzione helper che definiremo in ui-renderers per non duplicare 200 righe qui
    }

    _generateFerryHtml() {
        setTimeout(() => window.initFerrySearch(), 50);
        return window.renderFerryTemplate();
    }

    _generateTrainHtml() {
        const now = new Date();
        const nowTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        return window.trainSearchRenderer ? window.trainSearchRenderer(null, nowTime) : "<p>Errore UI Treni</p>";
    }
}

class TrailModalGenerator {
    constructor(payload) { this.p = JSON.parse(decodeURIComponent(payload)); }
    getClass() { return 'modal-content'; }
    generate() {
        const p = this.p;
        const titolo = window.dbCol(p, 'Paesi') || p.Nome;
        const nomeSentiero = p.Nome || '';
        const dist = p.Distanza || '--';
        const dura = p.Durata || '--';
        const diff = p.Tag || p.Difficolta || 'Media'; 
        const desc = window.dbCol(p, 'Descrizione') || '';
        
        let linkGpx = p.Link_Gpx || p.Link_gpx || p.gpxlink || p.Mappa || p.Gpx;
        if (!linkGpx) {
            const key = Object.keys(p).find(k => k.toLowerCase().includes('gpx') || k.toLowerCase().includes('mappa'));
            if (key) linkGpx = p[key];
        }

        return `
        <div style="padding: 20px 15px;">
            <h2 style="text-align:center; margin: 0 0 5px 0; color:#2c3e50;">${titolo}</h2>
            ${nomeSentiero ? `<p style="text-align:center; color:#7f8c8d; margin:0 0 15px 0; font-size:0.9rem;">${nomeSentiero}</p>` : ''}
            
            <div class="trail-stats-grid">
                <div class="trail-stat-box"><span class="material-icons">straighten</span><span class="stat-value">${dist}</span><span class="stat-label">${window.t('distance')}</span></div>
                <div class="trail-stat-box"><span class="material-icons">schedule</span><span class="stat-value">${dura}</span><span class="stat-label">${window.t('duration')}</span></div>
                <div class="trail-stat-box"><span class="material-icons">terrain</span><span class="stat-value">${diff}</span><span class="stat-label">${window.t('level')}</span></div>
            </div>

            <div class="trail-actions-group" style="margin: 20px 0; display: flex; flex-direction: column; gap: 12px;">
                ${linkGpx ? `
                <a href="${linkGpx}" download="${nomeSentiero || 'percorso'}.gpx" class="btn-download-gpx" target="_blank">
                    <span class="material-icons">file_download</span> ${window.t('btn_download_gpx')}
                </a>` : `
                <div style="padding:15px; background:#fff5f5; border:1px solid #feb2b2; border-radius:10px; text-align:center; color:#c53030; font-size:0.85rem;">
                    <span class="material-icons" style="vertical-align:middle; font-size:1.2rem;">error_outline</span>
                    ${window.t('gpx_missing')}
                </div>`}
            </div>
            <div style="margin-top:25px; line-height:1.6; color:#444; font-size:0.95rem; text-align:justify;">${desc}</div>
        </div>`;
    }
}

class MapModalGenerator {
    constructor(url) { this.url = url; }
    getClass() { return 'modal-content'; }
    generate() {
        const uniqueMapId = 'modal-map-' + Math.random().toString(36).substr(2, 9);
        setTimeout(() => window.initGpxMap(uniqueMapId, this.url), 100); // Helper spostato in ui-renderers o strategies
        return `
            <h3 style="text-align:center; margin-bottom:10px;">${window.t('map_route_title')}</h3>
            <div id="${uniqueMapId}" style="height: 450px; width: 100%; border-radius: 12px; border: 1px solid #ddd;"></div>
            <p style="text-align:center; font-size:0.8rem; color:#888; margin-top:10px;">${window.t('map_zoom_hint')}</p>`;
    }
}

class RestaurantModalGenerator {
    constructor(payload) { this.item = JSON.parse(decodeURIComponent(payload)); }
    getClass() { return 'modal-content'; }
    generate() {
        const nome = window.dbCol(this.item, 'Nome');
        const indirizzo = window.dbCol(this.item, 'Paesi') || ''; 
        const desc = window.dbCol(this.item, 'Descrizioni') || window.t('desc_missing'); 

        return `
            <div class="rest-modal-wrapper">
                <div class="rest-header">
                    <h2>${nome}</h2>
                    <div class="rest-location"><span class="material-icons">place</span> ${indirizzo}</div>
                    <div class="rest-divider"></div>
                </div>
                <div class="rest-body">${desc}</div>
            </div>`;
    }
}

class PharmacyModalGenerator {
    constructor(payload) { this.item = JSON.parse(decodeURIComponent(payload)); }
    getClass() { return 'modal-content'; }
    generate() {
        const nome = window.dbCol(this.item, 'Nome');
        const paesi = window.dbCol(this.item, 'Paesi');
        return `<h2>${nome}</h2><p>📍 ${this.item.Indirizzo}, ${paesi}</p><p>📞 <a href="tel:${this.item.Numero}">${this.item.Numero}</a></p>`;
    }
}

class WineModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        if (!this.item) return '';
        const item = this.item;
        const nome = window.dbCol(item, 'Nome');
        const tipo = window.dbCol(item, 'Tipo');
        const produttore = window.dbCol(item, 'Produttore');
        const uve = window.dbCol(item, 'Uve');
        const gradi = window.dbCol(item, 'Gradi');
        const abbinamenti = window.dbCol(item, 'Abbinamenti');
        const desc = window.dbCol(item, 'Descrizione');
        const foto = window.dbCol(item, 'Foto');

        const t = String(tipo).toLowerCase();
        let color = '#9B2335'; 
        if (t.includes('bianco')) color = '#F4D03F'; 
        if (t.includes('rosato') || t.includes('orange')) color = '#E67E22'; 

        return `
            <div style="padding-bottom: 20px;">
                ${foto ? `<img src="${foto}" style="width:100%; height:280px; object-fit:cover; border-radius:24px 24px 0 0;">` : 
                `<div style="text-align:center; padding: 30px 20px 20px; background: #fff; border-bottom: 1px dashed #eee;">
                    <i class="fa-solid fa-wine-bottle" style="font-size: 4.5rem; color: ${color}; margin-bottom:15px; filter: drop-shadow(0 4px 5px rgba(0,0,0,0.1));"></i>
                </div>`}

                <div style="padding: ${foto ? '25px 25px 0' : '0 25px'};">
                    <h2 style="font-family:'Roboto Slab'; font-size:2rem; margin:0 0 5px 0; line-height:1.1; color:#2c3e50;">${nome}</h2>
                    <div style="font-weight:700; color:#7f8c8d; text-transform:uppercase; font-size:0.9rem; margin-bottom:20px;">
                        <span class="material-icons" style="vertical-align:text-bottom; font-size:1.1rem;">storefront</span> ${produttore}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 15px 25px; background: #fafafa;">
                    <div style="background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; text-align:center;">
                        <div style="font-size:0.7rem; text-transform:uppercase; color:#999; font-weight:700;">${window.t('wine_type')}</div>
                        <div style="font-size:1rem; font-weight:700; color:${color}">${tipo || '--'}</div>
                    </div>
                    <div style="background:#fff; border:1px solid #eee; border-radius:12px; padding:10px; text-align:center;">
                        <div style="font-size:0.7rem; text-transform:uppercase; color:#999; font-weight:700;">${window.t('wine_deg')}</div>
                        <div style="font-size:1rem; font-weight:700;">${gradi || '--'}</div>
                    </div>
                    ${uve ? `<div style="grid-column:1/-1; background:#fff; border:1px solid #eee; border-radius:12px; padding:12px; text-align:center; font-size:0.95rem;"><strong>🍇 ${window.t('wine_grapes')}:</strong> ${uve}</div>` : ''}
                </div>

                <div style="padding: 25px;">
                    <p style="color:#555; font-size:1.05rem; line-height:1.6; margin:0;">${desc}</p>
                    ${abbinamenti ? `
                    <div style="background: #FFF8E1; border-left: 4px solid #FFB74D; padding: 15px; border-radius: 8px; margin-top: 25px; color: #5D4037;">
                        <div style="font-weight:bold; margin-bottom:5px; text-transform:uppercase; font-size:0.8rem;">🍽️ ${window.t('wine_pairings')}</div>
                        ${abbinamenti}
                    </div>` : ''}
                </div>
            </div>`;
    }
}

class AttractionModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        if (!this.item) return '';
        const item = this.item;
        const titolo = window.dbCol(item, 'Attrazioni') || window.dbCol(item, 'Titolo');
        const curiosita = window.dbCol(item, 'Curiosita');
        const desc = window.dbCol(item, 'Descrizione');
        const img = window.dbCol(item, 'Immagine') || window.dbCol(item, 'Foto'); 

        return `
            ${img ? `<img src="${img}" class="monument-header-img">` : 
            `<div class="monument-header-icon"><i class="fa-solid fa-landmark" style="font-size:4rem; color:#546e7a;"></i></div>`}

            <div style="padding: 0 25px 30px;">
                <h2 style="font-family:'Roboto Slab'; font-size:2rem; margin: ${img ? '0' : '20px'} 0 10px 0; color:#2c3e50; line-height:1.1;">${titolo}</h2>
                <div style="width:50px; height:4px; background:#e74c3c; margin-bottom:20px; border-radius:2px;"></div>

                ${curiosita ? `
                <div class="curiosity-box animate-fade">
                    <div class="curiosity-title"><span class="material-icons" style="font-size:1rem;">lightbulb</span> ${window.t('label_curiosity')}</div>
                    <div style="font-style:italic; line-height:1.5;">${curiosita}</div>
                </div>` : ''}
                
                <p style="color:#374151; font-size:1.05rem; line-height:1.7; text-align:justify;">${desc || window.t('desc_missing')}</p>
            </div>`;
    }
}

class BeachModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        if (!this.item) return '';
        const nome = this.item.Nome || 'Spiaggia';
        const desc = window.dbCol(this.item, 'Descrizione') || '';
        const tipo = this.item.Tipo || '';
        
        return `
             <div style="padding: 25px;">
                <h2 style="font-family:'Roboto Slab'; color:#00695C;">${nome}</h2>
                <span class="c-pill" style="margin-bottom:15px; display:inline-block;">${tipo}</span>
                <p style="line-height:1.6; color:#444;">${desc}</p>
             </div>
        `;
    }
}

// Esportiamo la Factory
window.ModalFactory = ModalContentFactory;