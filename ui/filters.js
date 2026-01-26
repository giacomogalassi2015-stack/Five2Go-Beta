// filters.js
import { t, dbCol } from '../utils.js';
import { initPendingMaps } from '../mapLogic.js';

// FILTRO SEMPLICE
export function renderGenericFilterableView(allData, filterKey, container, cardRenderer) {
    container.innerHTML = `<div class="list-container animate-fade" id="dynamic-list" style="padding-bottom: 80px;"></div>`;
    const listContainer = container.querySelector('#dynamic-list');

    // Pulizia
    const oldSheet = document.getElementById('filter-sheet');
    if (oldSheet) oldSheet.remove();
    const oldOverlay = document.getElementById('filter-overlay');
    if (oldOverlay) oldOverlay.remove();
    const oldBtn = document.getElementById('filter-toggle-btn');
    if (oldBtn) oldBtn.remove();

    // Estrazione Valori Unici
    let rawValues = allData.map(item => item[filterKey] ? item[filterKey].trim() : null).filter(x => x);
    let tagsRaw = [...new Set(rawValues)];
    
    // Ordine specifico
    const customOrder = ["Tutti", "Riomaggiore", "Manarola", "Corniglia", "Vernazza", "Monterosso", "Facile", "Media", "Difficile"];
    if (!tagsRaw.includes('Tutti')) tagsRaw.unshift('Tutti');

    const uniqueTags = tagsRaw.sort((a, b) => {
        const indexA = customOrder.indexOf(a), indexB = customOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    // Creazione DOM
    const overlay = document.createElement('div');
    overlay.id = 'filter-overlay';
    overlay.className = 'sheet-overlay';
    
    const sheet = document.createElement('div');
    sheet.id = 'filter-sheet';
    sheet.className = 'bottom-sheet';
    
    // NOTA: t() invece di window.t()
    sheet.innerHTML = `
        <div class="sheet-header">
            <div class="sheet-title">${t('filter_title')}</div> 
            <div class="material-icons sheet-close" onclick="closeFilterSheet()">close</div>
        </div>
        <div class="filter-grid" id="sheet-options"></div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(sheet);

    const optionsContainer = sheet.querySelector('#sheet-options');
    let activeTag = 'Tutti'; 

    // Generazione Chips
    uniqueTags.forEach(tag => {
        const chip = document.createElement('button');
        chip.className = 'sheet-chip';
        if (tag === 'Tutti') chip.classList.add('active-filter');
        chip.innerText = (tag === 'Tutti') ? t('filter_all') : tag; 

        chip.onclick = () => {
            document.querySelectorAll('.sheet-chip').forEach(c => c.classList.remove('active-filter'));
            chip.classList.add('active-filter');
            activeTag = tag;
            
            const filtered = tag === 'Tutti' ? allData : allData.filter(item => {
                const valDB = item[filterKey] ? item[filterKey].trim() : '';
                return valDB.includes(tag) || (item.Nome && item.Nome.toLowerCase().includes('emergenza'));
            });

            updateList(filtered);
            if(window.closeFilterSheet) window.closeFilterSheet();
        };
        optionsContainer.appendChild(chip);
    });

    const filterBtn = document.createElement('button');
    filterBtn.id = 'filter-toggle-btn';
    filterBtn.innerHTML = '<span class="material-icons">filter_list</span>';
    filterBtn.style.display = 'block'; 
    document.body.appendChild(filterBtn);

    filterBtn.onclick = () => { if(window.openFilterSheet) window.openFilterSheet(); };
    overlay.onclick = () => { if(window.closeFilterSheet) window.closeFilterSheet(); };

    function updateList(items) {
        if (!items || items.length === 0) { 
            listContainer.innerHTML = `<p style="text-align:center; padding:40px; color:#999;">${t('no_results')}</p>`; 
            return; 
        }
        listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');
        // Re-init mappe se ci sono sentieri
        if (typeof initPendingMaps === 'function') setTimeout(() => initPendingMaps(), 100);
        else {
            // Import dinamico se serve
            import('../mapLogic.js').then(m => setTimeout(() => m.initPendingMaps(), 100));
        }
    }
    
    updateList(allData);
}

// FILTRO DOPPIO
export function renderDoubleFilterView(allData, filtersConfig, container, cardRenderer) {
    container.innerHTML = `<div class="list-container animate-fade" id="dynamic-list" style="padding-bottom: 80px;"></div>`;
    const listContainer = container.querySelector('#dynamic-list');

    const oldSheet = document.getElementById('filter-sheet');
    if (oldSheet) oldSheet.remove();
    const oldOverlay = document.getElementById('filter-overlay');
    if (oldOverlay) oldOverlay.remove();
    const oldBtn = document.getElementById('filter-toggle-btn');
    if (oldBtn) oldBtn.remove();

    const getUniqueValues = (key, customOrder = []) => {
        // NOTA: dbCol() invece di window.dbCol()
        const raw = allData.map(i => dbCol(i, key)).filter(x => x).map(x => x.trim());
        let unique = [...new Set(raw)];
        if (customOrder && customOrder.length > 0) {
            return unique.sort((a, b) => {
                const idxA = customOrder.indexOf(a);
                const idxB = customOrder.indexOf(b);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return a.localeCompare(b);
            });
        } else {
            return unique.sort();
        }
    };

    const values1 = getUniqueValues(filtersConfig.primary.key, filtersConfig.primary.customOrder);
    const values2 = getUniqueValues(filtersConfig.secondary.key, filtersConfig.secondary.customOrder);

    let activeVal1 = 'Tutti';
    let activeVal2 = 'Tutti';

    const overlay = document.createElement('div');
    overlay.className = 'sheet-overlay';
    overlay.id = 'filter-overlay';
    
    const sheet = document.createElement('div');
    sheet.className = 'bottom-sheet';
    sheet.id = 'filter-sheet';
    
    const title1 = filtersConfig.primary.title || t('filter_village');
    const title2 = filtersConfig.secondary.title || t('filter_cat');

    sheet.innerHTML = `
        <div class="sheet-header">
            <div class="sheet-title">${t('filter_title')}</div>
            <div class="material-icons sheet-close" onclick="closeFilterSheet()">close</div>
        </div>
        
        <div class="filter-section-title">${title1}</div>
        <div class="filter-grid" id="section-1-options"></div>

        <div class="filter-section-title" style="margin-top: 25px;">${title2}</div>
        <div class="filter-grid" id="section-2-options"></div>

        <button class="btn-apply-filters" onclick="closeFilterSheet()">
            ${t('show_results')}
        </button>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(sheet);

    function renderChips() {
        const c1 = sheet.querySelector('#section-1-options');
        c1.innerHTML = '';
        c1.appendChild(createChip(t('filter_all'), activeVal1 === 'Tutti', () => { activeVal1 = 'Tutti'; applyFilters(); renderChips(); }));
        values1.forEach(v => {
            c1.appendChild(createChip(v, activeVal1 === v, () => { activeVal1 = v; applyFilters(); renderChips(); }));
        });

        const c2 = sheet.querySelector('#section-2-options');
        c2.innerHTML = '';
        c2.appendChild(createChip(t('filter_all'), activeVal2 === 'Tutti', () => { activeVal2 = 'Tutti'; applyFilters(); renderChips(); }));
        values2.forEach(v => {
            const label = v.charAt(0).toUpperCase() + v.slice(1); 
            c2.appendChild(createChip(label, activeVal2 === v, () => { activeVal2 = v; applyFilters(); renderChips(); }));
        });
    }

    function createChip(text, isActive, onClick) {
        const btn = document.createElement('button');
        btn.className = 'sheet-chip';
        if (isActive) btn.classList.add('active-filter');
        btn.innerText = text;
        btn.onclick = onClick;
        return btn;
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
        if (!items || items.length === 0) { 
            listContainer.innerHTML = `<p style="text-align:center; padding:40px; color:#999;">${t('no_results')}</p>`; 
        } else {
            listContainer.innerHTML = items.map(item => cardRenderer(item)).join('');
        }
    }

    const filterBtn = document.createElement('button');
    filterBtn.id = 'filter-toggle-btn';
    filterBtn.innerHTML = '<span class="material-icons">filter_list</span>';
    filterBtn.style.display = 'block';
    document.body.appendChild(filterBtn);

    filterBtn.onclick = () => { if(window.openFilterSheet) window.openFilterSheet(); };
    overlay.onclick = () => { if(window.closeFilterSheet) window.closeFilterSheet(); };

    renderChips();
    updateList(allData);
}