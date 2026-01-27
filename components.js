/* components.js - UI Renderers e Filtri */

import { mk, t, dbCol, getSmartUrl } from './utils.js';
import { openModal } from './modals.js';

// --- RENDERERS ---

export const ristoranteRenderer = (r, tableData) => {
    const nome = dbCol(r, 'Nome') || 'Ristorante';
    const paesi = dbCol(r, 'Paesi') || '';
    const numero = r.Numero || r.Telefono || '';
    const itemId = String(r.id || r.ID || r.POI_ID);
    const mapLink = r.Mappa || `http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(nome + ' ' + paesi)}`;

    return mk('div', { class: 'restaurant-glass-card' }, [
        mk('h3', { class: 'rest-card-title' }, nome),
        mk('p', { class: 'rest-card-subtitle' }, [
            mk('span', { class: 'material-icons' }, 'restaurant'),
            ` ${paesi}`
        ]),
        mk('div', { class: 'rest-card-actions' }, [
            mk('div', { class: 'action-btn btn-info rest-btn-size', onclick: () => openModal('ristorante', itemId, tableData) }, 
                mk('span', { class: 'material-icons' }, 'info_outline')
            ),
            numero ? mk('div', { class: 'action-btn btn-call rest-btn-size', onclick: () => window.location.href=`tel:${numero}` },
                mk('span', { class: 'material-icons' }, 'call')
            ) : null,
            mk('div', { class: 'action-btn btn-map rest-btn-size', onclick: () => window.open(mapLink, '_blank') },
                mk('span', { class: 'material-icons' }, 'map')
            )
        ])
    ]);
};

export const spiaggiaRenderer = (item, tableData) => {
    const nome = item.Nome || 'Spiaggia';
    const comune = item.Paese || item.Comune || '';
    const tipo = item.Tipo || 'Spiaggia';
    const safeId = String(item.id || item.ID || item.POI_ID);

    return mk('div', { class: 'culture-card is-beach animate-fade', onclick: () => openModal('Spiagge', safeId, tableData) }, [
        mk('div', { class: 'culture-info' }, [
            comune ? mk('div', { class: 'culture-location' }, [
                mk('span', { class: 'material-icons icon-sm' }, 'place'),
                ` ${comune}`
            ]) : null,
            mk('h3', { class: 'culture-title' }, nome),
            mk('div', { class: 'culture-tags' }, 
                mk('span', { class: 'c-pill' }, tipo)
            )
        ]),
        mk('div', { class: 'culture-bg-icon' }, 
            mk('i', { class: 'fa-solid fa-water' })
        )
    ]);
};

export const sentieroRenderer = (s, tableData) => {
    const paese = dbCol(s, 'Paesi');
    const nomeSentiero = s.Nome || '';
    const titoloMostrato = nomeSentiero || paese; 
    const diff = s.Tag || s.Difficolta || 'Media';
    const gpxUrl = s.Gpxlink || s.gpxlink;
    const itemId = String(s.id || s.ID || s.POI_ID);
    const uniqueMapId = `map-trail-${Math.random().toString(36).substr(2, 9)}`;

    let diffColor = '#f39c12';
    if (diff.toLowerCase().includes('facile') || diff.toLowerCase().includes('easy')) diffColor = '#27ae60';
    if (diff.toLowerCase().includes('difficile') || diff.toLowerCase().includes('hard')) diffColor = '#c0392b';

    // Nota: window.mapsToInit gestito in main.js o localmente se necessario, qui non usato direttamente
    
    return mk('div', { class: 'trail-card-modern animate-fade' }, [
        mk('div', { 
            id: uniqueMapId, 
            class: 'trail-map-container',
            onclick: (e) => { e.stopPropagation(); openModal('map', gpxUrl, tableData); }
        }),
        mk('div', { class: 'trail-info-overlay' }, [
            mk('h3', { 
                class: 'text-center font-bold color-dark', 
                style: { margin: '5px 0', fontFamily: 'Roboto Slab', fontSize: '1.25rem' } 
            }, titoloMostrato),
            mk('div', { 
                class: 'text-center text-uppercase font-bold mb-20',
                style: { fontSize: '0.75rem', color: diffColor, letterSpacing: '1px' }
            }, diff),
            mk('button', { 
                class: 'btn-trail-action',
                onclick: () => openModal('trail', itemId, tableData)
            }, [
                t('btn_details'),
                mk('span', { class: 'material-icons', style: { fontSize: '1.1rem' } }, 'arrow_forward')
            ])
        ]),
        // Hack per inizializzare mappa se presente (in main.js un observer potrebbe intercettare)
        gpxUrl ? mk('script', {}, `setTimeout(()=>window.dispatchEvent(new CustomEvent('init-map', {detail:{id:'${uniqueMapId}', url:'${gpxUrl}'}})), 500)`) : null
    ]);
};

export const vinoRenderer = (item, tableData) => {
    const safeId = String(item.id || item.ID || item.POI_ID);
    const nome = item.Nome || 'Vino';
    const cantina = dbCol(item, 'Produttore') || ''; 
    const tipo = (item.Tipo || '').toLowerCase().trim();
    
    let themeClass = 'is-wine-red'; 
    if (tipo.includes('bianco')) themeClass = 'is-wine-white';
    if (tipo.includes('rosato') || tipo.includes('orange')) themeClass = 'is-wine-orange';

    return mk('div', { class: `culture-card ${themeClass} animate-fade`, onclick: () => openModal('Vini', safeId, tableData) }, [
        mk('div', { class: 'culture-info' }, [
            cantina ? mk('div', { class: 'culture-location' }, [
                mk('span', { class: 'material-icons icon-sm' }, 'storefront'), ` ${cantina}`
            ]) : null,
            mk('div', { class: 'culture-title' }, nome),
            mk('div', { class: 'culture-tags' }, 
                mk('span', { class: 'c-pill', style: { textTransform: 'capitalize' } }, item.Tipo || 'Vino')
            )
        ]),
        mk('div', { class: 'culture-bg-icon' }, mk('i', { class: 'fa-solid fa-wine-bottle' }))
    ]);
};

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

    return mk('div', { class: 'info-card animate-fade' }, [
        mk('div', { class: 'info-icon-box' }, mk('span', { class: 'material-icons' }, icon)),
        mk('div', { class: 'info-text-col' }, [
            mk('h3', {}, nome),
            mk('p', {}, [mk('span', { class: 'material-icons icon-sm' }, 'place'), ` ${paesi}`])
        ]),
        mk('div', { class: 'action-btn btn-call', onclick: () => window.location.href=`tel:${numero}` },
            mk('span', { class: 'material-icons' }, 'call')
        )
    ]);
};

export const farmacieRenderer = (f, tableData) => {
    const nome = dbCol(f, 'Farmacia') || dbCol(f, 'Nome') || 'Farmacia';
    const paese = dbCol(f, 'Paese') || dbCol(f, 'Paesi') || '';
    const numero = f.Telefono || f.Numero || '';
    const itemId = String(f.id || f.ID || f.POI_ID);

    return mk('div', { class: 'info-card animate-fade', onclick: () => openModal('farmacia', itemId, tableData) }, [
        mk('div', { class: 'info-icon-box' }, mk('span', { class: 'material-icons' }, 'local_pharmacy')),
        mk('div', { class: 'info-text-col' }, [
            mk('h3', {}, nome),
            mk('p', {}, [mk('span', { class: 'material-icons icon-sm' }, 'place'), ` ${paese}`])
        ]),
        mk('div', { class: 'action-btn btn-call', onclick: (e) => { e.stopPropagation(); window.location.href=`tel:${numero}`; } },
            mk('span', { class: 'material-icons' }, 'call')
        )
    ]);
};

export const attrazioniRenderer = (item, tableData) => {
    const safeId = String(item.POI_ID || item.id || item.ID);
    const titolo = dbCol(item, 'Attrazioni') || 'Attrazione';
    const paese = dbCol(item, 'Paese');
    const tempo = item.Tempo_visita || '--'; 
    const diff = dbCol(item, 'Difficoltà Accesso') || 'Accessibile';
    const rawLabel = dbCol(item, 'Label') || 'Storico';
    const label = rawLabel.toLowerCase().trim(); 
    
    let themeClass = 'is-monument';
    let iconClass = 'fa-landmark'; 
    if (label === 'religioso') { themeClass = 'is-church'; iconClass = 'fa-church'; }
    else if (label === 'panorama') { themeClass = 'is-view'; iconClass = 'fa-mountain-sun'; }
    else if (label === 'storico') { themeClass = 'is-monument'; iconClass = 'fa-chess-rook'; }

    return mk('div', { class: `culture-card ${themeClass} animate-fade`, onclick: () => openModal('attrazione', safeId, tableData) }, [
        mk('div', { class: 'culture-info' }, [
            mk('div', { class: 'culture-location' }, [mk('span', { class: 'material-icons icon-sm' }, 'place'), ` ${paese}`]),
            mk('div', { class: 'culture-title' }, titolo),
            mk('div', { class: 'culture-tags' }, [
                mk('span', { class: 'c-pill' }, [mk('span', { class: 'material-icons icon-xs' }, 'schedule'), ` ${tempo}`]),
                mk('span', { class: 'c-pill' }, diff)
            ])
        ]),
        mk('div', { class: 'culture-bg-icon' }, mk('i', { class: `fa-solid ${iconClass}` }))
    ]);
};

export const prodottoRenderer = (p, tableData) => {
    const titolo = dbCol(p, 'Prodotti') || dbCol(p, 'Nome');
    const ideale = dbCol(p, 'Ideale per') || 'Tutti'; 
    const fotoKey = p.Prodotti_foto || titolo;
    const imgUrl = getSmartUrl(fotoKey, '', 200);
    const itemId = String(p.id || p.ID || p.POI_ID);

    return mk('div', { class: 'culture-card is-product animate-fade', onclick: () => openModal('product', itemId, tableData) }, [
        mk('div', { class: 'culture-info' }, [
            mk('div', { class: 'culture-title' }, titolo),
            mk('div', { class: 'product-subtitle' }, [mk('span', { class: 'material-icons' }, 'stars'), ` ${t('ideal_for')}: ${ideale}`])
        ]),
        mk('div', { class: 'culture-product-thumb' }, 
            mk('img', { src: imgUrl, loading: 'lazy', alt: titolo })
        )
    ]);
};

// --- LOGICA FILTRI ---

export const renderGenericFilterableView = (allData, filterKey, container, cardRenderer) => {
    container.innerHTML = ''; 
    const listContainer = mk('div', { class: 'list-container animate-fade', id: 'dynamic-list', style: { paddingBottom: '80px' } });
    container.appendChild(listContainer);

    ['filter-sheet', 'filter-overlay', 'filter-toggle-btn'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.remove();
    });

    let rawValues = allData.map(item => item[filterKey] ? item[filterKey].trim() : null).filter(x => x);
    let tagsRaw = [...new Set(rawValues)];
    const customOrder = ["Tutti", "Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso", "Facile", "Media", "Difficile"];
    if (!tagsRaw.includes('Tutti')) tagsRaw.unshift('Tutti');
    const uniqueTags = tagsRaw.sort((a, b) => {
        const indexA = customOrder.indexOf(a), indexB = customOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    const overlay = mk('div', { id: 'filter-overlay', class: 'sheet-overlay' });
    const optionsContainer = mk('div', { class: 'filter-grid', id: 'sheet-options' });
    
    const closeFilterSheet = () => { overlay.classList.remove('active'); sheet.classList.remove('active'); };
    const openFilterSheet = () => { overlay.classList.add('active'); sheet.classList.add('active'); };

    const sheet = mk('div', { id: 'filter-sheet', class: 'bottom-sheet' }, [
        mk('div', { class: 'sheet-header' }, [
            mk('div', { class: 'sheet-title' }, t('filter_title')),
            mk('div', { class: 'material-icons sheet-close', onclick: closeFilterSheet }, 'close')
        ]),
        optionsContainer
    ]);

    let activeTag = 'Tutti'; 

    uniqueTags.forEach(tag => {
        const isAll = tag === 'Tutti';
        const chip = mk('button', { 
            class: `sheet-chip ${isAll ? 'active-filter' : ''}`, 
            onclick: () => {
                document.querySelectorAll('.sheet-chip').forEach(c => c.classList.remove('active-filter'));
                chip.classList.add('active-filter');
                activeTag = tag;
                const filtered = isAll ? allData : allData.filter(item => { 
                    const valDB = item[filterKey] ? item[filterKey].trim() : ''; 
                    return valDB.includes(tag) || (item.Nome && item.Nome.toLowerCase().includes('emergenza')); 
                });
                updateList(filtered); 
                closeFilterSheet();
            }
        }, isAll ? t('filter_all') : tag);
        optionsContainer.appendChild(chip);
    });

    const filterBtn = mk('button', { 
        id: 'filter-toggle-btn', 
        style: { display: 'block' },
        onclick: openFilterSheet
    }, mk('span', { class: 'material-icons' }, 'filter_list'));

    document.body.append(overlay, sheet, filterBtn);
    overlay.onclick = closeFilterSheet;

    function updateList(items) {
        listContainer.innerHTML = '';
        if (!items || items.length === 0) { 
            listContainer.appendChild(mk('p', { style: { textAlign:'center', padding:'40px', color:'#999' } }, t('no_results')));
            return; 
        }
        const frag = document.createDocumentFragment();
        items.forEach(item => frag.appendChild(cardRenderer(item, allData)));
        listContainer.appendChild(frag);
    }
    updateList(allData);
};

export const renderDoubleFilterView = (allData, filtersConfig, container, cardRenderer) => {
    container.innerHTML = '';
    const listContainer = mk('div', { class: 'list-container animate-fade', id: 'dynamic-list', style: { paddingBottom: '80px' } });
    container.appendChild(listContainer);

    ['filter-sheet', 'filter-overlay', 'filter-toggle-btn'].forEach(id => { const el = document.getElementById(id); if(el) el.remove(); });

    const getUniqueValues = (key, customOrder = []) => {
        const raw = allData.map(i => dbCol(i, key)).filter(x => x).map(x => x.trim());
        let unique = [...new Set(raw)];
        if (customOrder && customOrder.length > 0) { return unique.sort((a, b) => { const idxA = customOrder.indexOf(a); const idxB = customOrder.indexOf(b); if (idxA !== -1 && idxB !== -1) return idxA - idxB; if (idxA !== -1) return -1; if (idxB !== -1) return 1; return a.localeCompare(b); }); } else { return unique.sort(); }
    };

    const values1 = getUniqueValues(filtersConfig.primary.key, filtersConfig.primary.customOrder);
    const values2 = getUniqueValues(filtersConfig.secondary.key, filtersConfig.secondary.customOrder);
    let activeVal1 = 'Tutti'; let activeVal2 = 'Tutti';

    const overlay = mk('div', { class: 'sheet-overlay' });
    const sheet = mk('div', { class: 'bottom-sheet' });
    
    const closeFilterSheet = () => { overlay.classList.remove('active'); sheet.classList.remove('active'); };
    const openFilterSheet = () => { overlay.classList.add('active'); sheet.classList.add('active'); };

    const opts1 = mk('div', { class: 'filter-grid', id: 'section-1-options' });
    const opts2 = mk('div', { class: 'filter-grid', id: 'section-2-options' });

    sheet.append(
        mk('div', { class: 'sheet-header' }, [
            mk('div', { class: 'sheet-title' }, t('filter_title')),
            mk('div', { class: 'material-icons sheet-close', onclick: closeFilterSheet }, 'close')
        ]),
        mk('div', { class: 'filter-section-title' }, filtersConfig.primary.title || t('filter_village')),
        opts1,
        mk('div', { class: 'filter-section-title', style: { marginTop: '25px' } }, filtersConfig.secondary.title || t('filter_cat')),
        opts2,
        mk('button', { class: 'btn-apply-filters', onclick: closeFilterSheet }, t('show_results'))
    );

    document.body.append(overlay, sheet);

    function createChip(text, isActive, onClick) {
        return mk('button', { 
            class: `sheet-chip ${isActive ? 'active-filter' : ''}`, 
            onclick: onClick 
        }, text);
    }

    function renderChips() {
        opts1.innerHTML = ''; opts2.innerHTML = '';
        
        opts1.appendChild(createChip(t('filter_all'), activeVal1 === 'Tutti', () => { activeVal1 = 'Tutti'; applyFilters(); renderChips(); }));
        values1.forEach(v => opts1.appendChild(createChip(v, activeVal1 === v, () => { activeVal1 = v; applyFilters(); renderChips(); })));
        
        opts2.appendChild(createChip(t('filter_all'), activeVal2 === 'Tutti', () => { activeVal2 = 'Tutti'; applyFilters(); renderChips(); }));
        values2.forEach(v => {
            const label = v.charAt(0).toUpperCase() + v.slice(1);
            opts2.appendChild(createChip(label, activeVal2 === v, () => { activeVal2 = v; applyFilters(); renderChips(); }));
        });
    }

    function applyFilters() {
        const filtered = allData.filter(item => {
            const val1 = dbCol(item, filtersConfig.primary.key) || '';
            const val2 = dbCol(item, filtersConfig.secondary.key) || '';
            const match1 = (activeVal1 === 'Tutti') || val1.includes(activeVal1);
            const match2 = (activeVal2 === 'Tutti') || val2.toLowerCase().includes(activeVal2.toLowerCase());
            return match1 && match2;
        });
        updateList(filtered);
    }

    function updateList(items) {
        listContainer.innerHTML = '';
        if (!items || items.length === 0) { 
            listContainer.appendChild(mk('p', { style: { textAlign:'center', padding:'40px', color:'#999' } }, t('no_results'))); 
        } else { 
            const frag = document.createDocumentFragment();
            items.forEach(item => frag.appendChild(cardRenderer(item, allData))); 
            listContainer.appendChild(frag);
        }
    }

    const filterBtn = mk('button', { id: 'filter-toggle-btn', style: { display:'block' }, onclick: openFilterSheet }, 
        mk('span', { class: 'material-icons' }, 'filter_list')
    );
    document.body.appendChild(filterBtn);
    overlay.onclick = closeFilterSheet;

    renderChips(); updateList(allData);
};