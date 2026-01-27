/* modals.js - Factory e Generatori Modali */

import { mk, t, dbCol, getSmartUrl } from './utils.js';
import { loadAllStops, filterDestinations, eseguiRicercaBus, initFerrySearch, eseguiRicercaTraghetto } from './api.js';

// Funzione globale di apertura Modale (esportata)
export const openModal = async (type, payload, currentTableData = [], tempTransportData = []) => {
    const generator = ModalContentFactory.create(type, payload, currentTableData, tempTransportData);
    const contentEl = generator.generate(); 
    const modalClass = generator.getClass();

    const overlay = mk('div', { class: 'modal-overlay animate-fade', onclick: (e) => { if(e.target === overlay) overlay.remove(); } });
    
    const contentWrapper = mk('div', { class: modalClass }, [
        mk('span', { class: 'close-modal', onclick: () => overlay.remove() }, '×'),
        contentEl
    ]);

    overlay.appendChild(contentWrapper);
    document.body.appendChild(overlay);
};

// Funzione inizializzazione mappa modale (GPX)
const initGpxMap = (divId, gpxUrl) => {
    const element = document.getElementById(divId);
    if (element) {
        const map = L.map(divId);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap, © CARTO', maxZoom: 20 }).addTo(map);
        new L.GPX(gpxUrl, {
            async: true,
            marker_options: { startIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-start.png', endIconUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-icon-end.png', shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet-gpx@1.7.0/pin-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] },
            polyline_options: { color: '#E76F51', weight: 5, opacity: 0.8 }
        }).on('loaded', function(e) { map.fitBounds(e.target.getBounds(), { padding: [30, 30] }); }).addTo(map);
        setTimeout(() => { map.invalidateSize(); }, 300);
    }
};

class ModalContentFactory {
    static create(type, payload, currentTableData, tempTransportData) {
        let item = null;

        if (type === 'map') return new MapModalGenerator(payload);
        if (type === 'transport') return new TransportModalGenerator(payload, tempTransportData);

        if (currentTableData) {
            const searchId = String(payload);
            item = currentTableData.find(i => {
                const itemId = String(i.id || i.ID || i.POI_ID);
                return itemId === searchId;
            });
        }

        if (!item) {
            console.warn(`Oggetto non trovato per ID: ${payload}.`);
            return { 
                generate: () => mk('div', { class: 'modal-body-pad' }, mk('p', {}, `Dati non disponibili o ID non trovato (${payload}).`)), 
                getClass: () => 'modal-content' 
            };
        }

        switch (type) {
            case 'product': case 'Prodotti': return new ProductModalGenerator(item);
            case 'trail': case 'Sentieri': return new TrailModalGenerator(item);
            case 'ristorante': case 'restaurant': case 'Ristoranti': return new RestaurantModalGenerator(item);
            case 'farmacia': case 'Farmacie': return new PharmacyModalGenerator(item);
            case 'Vini': case 'wine': return new WineModalGenerator(item);
            case 'Attrazioni': case 'attrazione': return new AttractionModalGenerator(item);
            case 'Spiagge': return new BeachModalGenerator(item);
            default: return { generate: () => mk('p', {}, 'Content not found'), getClass: () => 'modal-content' };
        }
    }
}

class ProductModalGenerator {
    constructor(item) { this.p = item; }
    getClass() { return 'modal-content glass-modal'; }
    generate() {
        const nome = dbCol(this.p, 'Prodotti') || dbCol(this.p, 'Nome');
        const desc = dbCol(this.p, 'Descrizione');   
        const ideale = dbCol(this.p, 'Ideale per'); 
        const bigImg = getSmartUrl(this.p.Prodotti_foto || nome, '', 800);

        return mk('div', {}, [
            mk('div', { class: 'modal-hero-wrapper' }, 
                mk('img', { src: bigImg, class: 'modal-hero-img', onerror: function() { this.style.display='none'; } })
            ),
            mk('div', { class: 'modal-body-pad' }, [
                mk('h2', { class: 'modal-title-lg' }, nome),
                ideale ? mk('div', { class: 'mb-20' }, mk('span', { class: 'glass-tag' }, `✨ ${t('ideal_for')}: ${ideale}`)) : null,
                mk('p', { class: 'modal-desc-text' }, desc)
            ])
        ]);
    }
}

class TransportModalGenerator {
    constructor(index, data) { 
        this.item = data ? data[index] : null; 
    }
    getClass() { return 'modal-content'; }
    
    generate() {
        if (!this.item) return mk('div', { class: 'modal-body-pad' }, mk('p', {}, 'Errore caricamento dati trasporto.'));
        
        const searchStr = ((dbCol(this.item, 'Nome') || '') + ' ' + (dbCol(this.item, 'Località') || '') + ' ' + (dbCol(this.item, 'Mezzo') || '')).toLowerCase();

        if (searchStr.includes('bus') || searchStr.includes('autobus') || searchStr.includes('atc')) {
            setTimeout(() => { if(loadAllStops) loadAllStops(document.getElementById('selPartenza')); }, 100);
            return this._createBusDOM(this.item);
        }
        if (searchStr.includes('battello') || searchStr.includes('traghetto')) {
            setTimeout(() => initFerrySearch(), 100);
            return this._createFerryDOM();
        }
        
        const nome = dbCol(this.item, 'Nome') || 'Trasporto';
        return mk('div', { class: 'modal-body-pad mt-10' }, [
            mk('h2', {}, nome),
            mk('p', { class: 'color-gray' }, dbCol(this.item, 'Descrizione'))
        ]);
    }

    _createBusDOM(item) {
        const container = mk('div', { class: 'bus-search-box animate-fade' });
        
        container.appendChild(mk('div', { class: 'bus-title', style: { paddingBottom:'15px' } }, [
            mk('span', { class: 'material-icons' }, 'directions_bus'), 
            ` ${t('plan_trip')}`
        ]));

        const infoSms = dbCol(item, 'Info_SMS');
        const infoApp = dbCol(item, 'Info_App');
        const infoAvvisi = dbCol(item, 'Info_Avvisi');

        if (infoSms || infoApp || infoAvvisi) {
            const ticketBox = mk('div', { id: 'ticket-info-box', class: 'ticket-info-content', style: { display: 'none' } });
            if(infoSms) ticketBox.appendChild(mk('p', { class: 'mb-10' }, [mk('strong', {}, '📱 SMS'), mk('br'), infoSms]));
            if(infoApp) ticketBox.appendChild(mk('p', { class: 'mb-10' }, [mk('strong', {}, '📲 APP'), mk('br'), infoApp]));
            if(infoAvvisi) ticketBox.appendChild(mk('div', { class: 'warning-box' }, [mk('strong', {}, `⚠️ ${t('label_warning')}: `), infoAvvisi]));

            const toggleBtn = mk('button', { 
                class: 'ticket-toggle-btn', 
                onclick: () => { 
                    const e = document.getElementById('ticket-info-box'); 
                    if(e) e.style.display = (e.style.display === 'none') ? 'block' : 'none'; 
                } 
            }, `🎟️ ${t('how_to_ticket')} ▾`);

            container.append(toggleBtn, ticketBox);
        }

        const mapBox = mk('div', { id: 'bus-map-wrapper', class: 'map-hidden-container', style: { display: 'none' } }, [
            mk('div', { id: 'bus-map', class: 'bus-map-frame' }),
            mk('p', { class: 'map-modal-hint' }, t('map_hint'))
        ]);
        
        const mapBtn = mk('button', { 
            class: 'map-toggle-btn',
            onclick: () => {
                const m = document.getElementById('bus-map-wrapper');
                if(m) m.style.display = (m.style.display === 'none') ? 'block' : 'none';
            }
        }, `🗺️ ${t('show_map')} ▾`);

        container.append(mapBtn, mapBox);

        const inputs = mk('div', {}, [
            mk('div', { class: 'bus-inputs' }, [
                mk('div', { style: { flex:1 } }, [
                    mk('label', { class: 'input-label-sm' }, t('departure')),
                    mk('select', { id: 'selPartenza', class: 'bus-select', onchange: function(){ filterDestinations(this.value) } }, 
                        mk('option', { disabled: true, selected: true }, t('loading'))
                    )
                ]),
                mk('div', { style: { flex:1 } }, [
                    mk('label', { class: 'input-label-sm' }, t('arrival')),
                    mk('select', { id: 'selArrivo', class: 'bus-select', disabled: true }, 
                        mk('option', { disabled: true, selected: true }, t('select_start'))
                    )
                ])
            ]),
            mk('div', { class: 'bus-inputs' }, [
                mk('div', { style: { flex:1 } }, [
                    mk('label', { class: 'input-label-sm' }, t('date_trip')),
                    mk('input', { type: 'date', id: 'selData', class: 'bus-select', value: new Date().toISOString().split('T')[0] })
                ]),
                mk('div', { style: { flex:1 } }, [
                    mk('label', { class: 'input-label-sm' }, t('time_trip')),
                    mk('input', { type: 'time', id: 'selOra', class: 'bus-select', value: new Date().toTimeString().substring(0,5) })
                ])
            ])
        ]);

        const btnSearch = mk('button', { 
            id: 'btnSearchBus', 
            class: 'btn-yellow', 
            style: { width: '100%', marginTop: '5px', opacity: '0.5', pointerEvents: 'none' },
            onclick: () => eseguiRicercaBus()
        }, t('find_times'));

        const results = mk('div', { id: 'busResultsContainer', class: 'd-none mt-20' }, [
            mk('div', { id: 'nextBusCard', class: 'bus-result-main' }),
            mk('div', { style: { fontSize:'0.8rem', fontWeight:'bold', color:'#666', marginTop:'15px' } }, `${t('next_runs')}:`),
            mk('div', { id: 'otherBusList', class: 'bus-list-container' })
        ]);

        container.append(inputs, btnSearch, results);
        return container;
    }

    _createFerryDOM() {
        const container = mk('div', { class: 'bus-search-box animate-fade' });
        
        const headerIcon = mk('span', { 
            class: 'material-icons', 
            style: { background: 'linear-gradient(135deg, #0288D1, #0277BD)', boxShadow: '0 4px 6px rgba(2, 119, 189, 0.3)' } 
        }, 'directions_boat');
        
        container.appendChild(mk('div', { class: 'bus-title', style: { paddingBottom:'15px' } }, [headerIcon, ` ${t('plan_trip')} (Battello)`]));

        const ticketBox = mk('div', { id: 'ticket-info-box-ferry', class: 'ticket-info-content', style: { display: 'none' } }, [
            mk('p', {}, 'I biglietti sono acquistabili presso le biglietterie al molo.'),
            mk('div', { class: 'warning-box' }, [mk('strong', {}, '⚠️ INFO METEO:'), ' In caso di mare mosso il servizio è sospeso.'])
        ]);

        const toggleBtn = mk('button', { 
            class: 'ticket-toggle-btn', 
            style: { background:'#e1f5fe', color:'#01579b', borderColor:'#b3e5fc' },
            onclick: () => { 
                const e = document.getElementById('ticket-info-box-ferry'); 
                if(e) e.style.display = (e.style.display === 'none') ? 'block' : 'none'; 
            } 
        }, `🎟️ ${t('how_to_ticket')} ▾`);

        container.append(toggleBtn, ticketBox);

        const inputs = mk('div', {}, [
            mk('div', { class: 'bus-inputs' }, [
                mk('div', { style: { flex:1 } }, [
                    mk('label', { class: 'input-label-sm' }, t('departure')),
                    mk('select', { id: 'selPartenzaFerry', class: 'bus-select' }, 
                        mk('option', { disabled: true, selected: true }, t('loading'))
                    )
                ]),
                mk('div', { style: { flex:1 } }, [
                    mk('label', { class: 'input-label-sm' }, t('arrival')),
                    mk('select', { id: 'selArrivoFerry', class: 'bus-select' }, 
                        mk('option', { disabled: true, selected: true }, t('select_start'))
                    )
                ])
            ]),
            mk('div', { class: 'bus-inputs' }, [
                mk('div', { style: { flex:1 } }, [
                    mk('label', { class: 'input-label-sm' }, t('date_trip')),
                    mk('input', { type: 'date', id: 'selDataFerry', class: 'bus-select', value: new Date().toISOString().split('T')[0] })
                ]),
                mk('div', { style: { flex:1 } }, [
                    mk('label', { class: 'input-label-sm' }, t('time_trip')),
                    mk('input', { type: 'time', id: 'selOraFerry', class: 'bus-select', value: new Date().toTimeString().substring(0,5) })
                ])
            ])
        ]);

        const btnSearch = mk('button', { 
            class: 'btn-yellow', 
            style: { 
                background: 'linear-gradient(135deg, #0288D1 0%, #01579b 100%)', 
                color: 'white', width: '100%', fontWeight: 'bold', marginTop: '5px', 
                boxShadow: '0 10px 25px -5px rgba(2, 136, 209, 0.4)'
            },
            onclick: () => eseguiRicercaTraghetto()
        }, t('find_times'));

        const results = mk('div', { id: 'ferryResultsContainer', class: 'd-none mt-20' }, [
            mk('div', { 
                id: 'nextFerryCard', 
                class: 'bus-result-main', 
                style: { background: 'linear-gradient(135deg, #0277BD 0%, #01579b 100%)', boxShadow: '0 15px 30px -5px rgba(1, 87, 155, 0.3)' } 
            }),
            mk('div', { style: { fontSize:'0.8rem', fontWeight:'bold', color:'#666', marginTop:'15px' } }, `${t('next_runs')}:`),
            mk('div', { id: 'otherFerryList', class: 'bus-list-container' })
        ]);

        container.append(inputs, btnSearch, results);
        return container;
    }
}

class TrailModalGenerator {
    constructor(item) { this.p = item; }
    getClass() { return 'modal-content'; }
    generate() {
        const p = this.p;
        const titolo = dbCol(p, 'Paesi') || p.Nome;
        const linkGpx = p.Link_Gpx || p.gpxlink || p.Mappa;

        return mk('div', { class: 'trail-modal-pad' }, [
            mk('h2', { class: 'trail-modal-title' }, titolo),
            mk('div', { class: 'trail-stats-grid' }, [
                mk('div', { class: 'trail-stat-box' }, [mk('span', { class: 'material-icons' }, 'straighten'), mk('span', { class: 'stat-value' }, p.Distanza||'--')]),
                mk('div', { class: 'trail-stat-box' }, [mk('span', { class: 'material-icons' }, 'schedule'), mk('span', { class: 'stat-value' }, p.Durata||'--')]),
                mk('div', { class: 'trail-stat-box' }, [mk('span', { class: 'material-icons' }, 'terrain'), mk('span', { class: 'stat-value' }, p.Tag||'Media')])
            ]),
            mk('div', { class: 'trail-actions-group' }, 
                linkGpx ? mk('a', { href: linkGpx, download: '', class: 'btn-download-gpx', target: '_blank' }, [
                    mk('span', { class: 'material-icons' }, 'file_download'), ` ${t('btn_download_gpx')}`
                ]) : mk('div', { class: 'gpx-error-box' }, t('gpx_missing'))
            ),
            mk('div', { class: 'text-justify mt-10 line-height-relaxed color-dark' }, dbCol(p, 'Descrizione'))
        ]);
    }
}

class MapModalGenerator {
    constructor(url) { this.url = url; }
    getClass() { return 'modal-content'; }
    generate() {
        const uniqueMapId = 'modal-map-' + Math.random().toString(36).substr(2, 9);
        setTimeout(() => initGpxMap(uniqueMapId, this.url), 100);
        return mk('div', {}, [
            mk('h3', { class: 'text-center mb-10' }, t('map_route_title')),
            mk('div', { id: uniqueMapId, class: 'map-modal-frame' }),
            mk('p', { class: 'map-modal-hint' }, t('map_zoom_hint'))
        ]);
    }
}

class RestaurantModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        return mk('div', { class: 'rest-modal-wrapper' }, [
            mk('div', { class: 'rest-header' }, [
                mk('h2', {}, dbCol(this.item, 'Nome')),
                mk('div', { class: 'rest-location' }, [mk('span', { class: 'material-icons' }, 'place'), ` ${dbCol(this.item, 'Paesi')}`]),
                mk('div', { class: 'rest-divider' })
            ]),
            mk('div', { class: 'rest-body' }, dbCol(this.item, 'Descrizioni') || t('desc_missing'))
        ]);
    }
}

class PharmacyModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        return mk('div', { class: 'modal-body-pad' }, [
            mk('h2', {}, dbCol(this.item, 'Nome')),
            mk('p', {}, `📍 ${this.item.Indirizzo}, ${dbCol(this.item, 'Paesi')}`),
            mk('p', {}, mk('a', { href: `tel:${this.item.Numero}` }, `📞 ${this.item.Numero}`))
        ]);
    }
}

class WineModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        if (!this.item) return mk('div', {});
        const tVal = String(this.item.Tipo).toLowerCase();
        let color = '#9B2335'; 
        if (tVal.includes('bianco')) color = '#F4D03F'; 
        if (tVal.includes('rosato')) color = '#E67E22'; 
        const foto = dbCol(this.item, 'Foto');

        return mk('div', { class: 'mb-20' }, [
            foto ? mk('img', { src: foto, class: 'wine-hero-img' }) : 
            mk('div', { class: 'wine-placeholder-box' }, mk('i', { class: 'fa-solid fa-wine-bottle wine-placeholder-icon', style: { color } })),
            
            mk('div', { class: foto ? 'wine-header-pad-img' : 'wine-header-pad' }, [
                mk('h2', { class: 'wine-title' }, dbCol(this.item, 'Nome')),
                mk('div', { class: 'wine-producer' }, [mk('span', { class: 'material-icons icon-sm' }, 'storefront'), ` ${dbCol(this.item, 'Produttore')}`])
            ]),
            
            mk('div', { class: 'wine-stats-grid' }, [
                mk('div', { class: 'wine-stat-card' }, [
                    mk('div', { class: 'wine-stat-label' }, t('wine_type')),
                    mk('div', { class: 'wine-stat-value', style: { color } }, this.item.Tipo)
                ]),
                mk('div', { class: 'wine-stat-card' }, [
                    mk('div', { class: 'wine-stat-label' }, t('wine_deg')),
                    mk('div', { class: 'wine-stat-value' }, this.item.Gradi)
                ])
            ]),
            
            mk('div', { class: 'modal-body-pad' }, [
                mk('p', { class: 'modal-desc-text mt-10' }, dbCol(this.item, 'Descrizione'))
            ])
        ]);
    }
}

class AttractionModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        const img = dbCol(this.item, 'Immagine');
        return mk('div', {}, [
            img ? mk('img', { src: img, class: 'monument-header-img' }) : 
            mk('div', { class: 'monument-header-icon' }, mk('i', { class: 'fa-solid fa-landmark', style: { fontSize:'4rem', color:'#546e7a' } })),
            
            mk('div', { class: 'monument-body-pad' }, [
                mk('h2', { class: 'monument-title', style: { marginTop: img ? '0' : '20px' } }, dbCol(this.item, 'Attrazioni')),
                mk('div', { class: 'monument-divider' }),
                mk('p', { class: 'modal-desc-text text-justify' }, dbCol(this.item, 'Descrizione'))
            ])
        ]);
    }
}

class BeachModalGenerator {
    constructor(item) { this.item = item; }
    getClass() { return 'modal-content'; }
    generate() {
        return mk('div', { class: 'modal-body-pad' }, [
            mk('h2', { style: { fontFamily:'Roboto Slab', color:'#00695C' } }, this.item.Nome),
            mk('span', { class: 'c-pill mb-15', style: { display:'inline-block' } }, this.item.Tipo),
            mk('p', { class: 'line-height-relaxed color-444' }, dbCol(this.item, 'Descrizione'))
        ]);
    }
}