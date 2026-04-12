// ── CSS Keyframes per animazioni modale (iniettate una volta sola) ────────
try {
    if (!document.getElementById('f2g-modal-styles')) {
        const _s = document.createElement('style');
        _s.id = 'f2g-modal-styles';
        _s.textContent = '@keyframes modalSheetUp{from{opacity:0;transform:translateY(40px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes modalSheetDown{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(100%)}}@keyframes modalBackdropOut{from{opacity:1}to{opacity:0}}.modal-sheet-enter{animation:modalSheetUp .32s cubic-bezier(.2,.8,.2,1) both}.modal-sheet-exit{animation:modalSheetDown .25s ease-in both}.modal-backdrop-exit{animation:modalBackdropOut .2s ease-in both}'
        + '@keyframes msSlideInLeft{from{opacity:0;transform:translateX(-60px)}to{opacity:1;transform:translateX(0)}}'
        + '@keyframes msSlideInRight{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}'
        + '.ms-slide-left{animation:msSlideInLeft .28s cubic-bezier(.2,.8,.2,1) both}'
        + '.ms-slide-right{animation:msSlideInRight .28s cubic-bezier(.2,.8,.2,1) both}'
        + '.ms-arrow{position:absolute;top:50%;z-index:30;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.18);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);color:#fff;border:1px solid rgba(255,255,255,0.2);cursor:pointer;transition:opacity .3s,transform .15s;-webkit-tap-highlight-color:transparent;touch-action:manipulation}'
        + '.ms-arrow:active{transform:translateY(-50%) scale(0.9)}'
        + '.ms-arrow--left{left:8px;transform:translateY(-50%)}'
        + '.ms-arrow--right{right:8px;transform:translateY(-50%)}'
        + '.ms-arrow--hidden{opacity:0;pointer-events:none}'
        + '.ms-counter{position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:25;background:rgba(0,0,0,0.35);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:#fff;font-size:11px;font-weight:700;letter-spacing:0.06em;padding:3px 12px;border-radius:20px;border:1px solid rgba(255,255,255,0.15);pointer-events:none;transition:opacity .3s}'
        ;
        document.head.appendChild(_s);
    }
} catch(e) { /* CSP o browser vecchio — le animazioni degradano graziosamente */ }

// ── Helper: dismiss animato riusabile (esposto per popstate in app.js) ───
window._dismissModal = function(overlay) {
    if (!overlay || overlay._dismissing) return;
    overlay._dismissing = true;
    // Cleanup swiper se attivo
    if (overlay._swiperCleanup) overlay._swiperCleanup();
    const sheet = overlay.querySelector('.modal-sheet');
    if (sheet) { sheet.classList.add('modal-sheet-exit'); }
    overlay.classList.add('modal-backdrop-exit');
    const cleanup = () => { try { overlay.remove(); } catch(e){} };
    overlay.addEventListener('animationend', cleanup, { once: true });
    setTimeout(cleanup, 400); // fallback sicurezza
};

// ─────────────────────────────────────────────────────────────────────────
//  MODAL SWIPER — Swipe orizzontale tra items dentro il modale
//  Pattern: Instagram stories, Google Maps cards, Airbnb listing gallery
// ─────────────────────────────────────────────────────────────────────────
/**
 * Attacca lo swipe orizzontale + frecce ad un overlay modale aperto.
 *
 * @param {HTMLElement} overlay   — il .fixed overlay del modale
 * @param {Array}       items     — lista filtrata corrente (stessi oggetti del DB)
 * @param {number}      startIdx  — indice dell'item attualmente visualizzato
 * @param {string}      modalType — tipo modale (es. 'ristorante','product','Vini'…)
 */
window._attachModalSwiper = function(overlay, items, startIdx, modalType) {
    if (!overlay || !items || items.length <= 1) return;

    let currentIdx = startIdx;
    const total = items.length;

    // ── Mappa tipo modale → come generare il payload per openModal ──
    // Ogni tipo usa un pattern diverso (safeObj vs safeId)
    const _payloadForItem = (item, type) => {
        switch (type) {
            case 'ristorante': case 'restaurant':
            case 'Spiagge':
            case 'product':
            case 'sentieroInfo':
                return encodeURIComponent(JSON.stringify(item)).replace(/'/g, '%27');
            case 'Vini': case 'wine':
                return String(item.id || item.ID);
            case 'attrazione': case 'Attrazioni':
                return String(item.POI_ID || item.id);
            default:
                return encodeURIComponent(JSON.stringify(item)).replace(/'/g, '%27');
        }
    };

    // ── Inietta frecce + counter nell'overlay ──
    const sheet = overlay.querySelector('.modal-sheet');
    if (!sheet) return;

    const arrowLeft  = document.createElement('button');
    arrowLeft.className = `ms-arrow ms-arrow--left ${currentIdx === 0 ? 'ms-arrow--hidden' : ''}`;
    arrowLeft.innerHTML = '<span class="material-icons" style="font-size:20px;">chevron_left</span>';
    arrowLeft.setAttribute('aria-label', 'Previous');

    const arrowRight = document.createElement('button');
    arrowRight.className = `ms-arrow ms-arrow--right ${currentIdx >= total - 1 ? 'ms-arrow--hidden' : ''}`;
    arrowRight.innerHTML = '<span class="material-icons" style="font-size:20px;">chevron_right</span>';
    arrowRight.setAttribute('aria-label', 'Next');

    const counter = document.createElement('div');
    counter.className = 'ms-counter';
    counter.textContent = `${currentIdx + 1} / ${total}`;

    overlay.appendChild(arrowLeft);
    overlay.appendChild(arrowRight);
    overlay.appendChild(counter);

    // ── Aggiorna UI frecce + counter ──
    function _updateNav() {
        arrowLeft.classList.toggle('ms-arrow--hidden',  currentIdx <= 0);
        arrowRight.classList.toggle('ms-arrow--hidden', currentIdx >= total - 1);
        counter.textContent = `${currentIdx + 1} / ${total}`;
    }

    // ── Naviga ad un item con animazione slide ──
    function _navigateTo(newIdx, direction) {
        if (newIdx < 0 || newIdx >= total || newIdx === currentIdx) return;
        currentIdx = newIdx;

        // Rigenera il contenuto del modale per il nuovo item
        const newItem = items[newIdx];
        const newPayload = _payloadForItem(newItem, modalType);

        // Per Vini/Attrazioni l'item va cercato in currentTableData
        let itemForModal = null;
        if (['Vini','wine','Attrazioni','attrazione'].includes(modalType)) {
            itemForModal = newItem; // Lo passiamo direttamente
        }

        const content = window.getModalContent(modalType, newPayload, itemForModal);
        if (!content || !content.html) return;

        // Report button
        let reportBtnHtml = '';
        const reportableTypes = ['ristorante','restaurant','product','Vini','wine','attrazione','Attrazioni','Spiagge','sentieroInfo'];
        if (reportableTypes.includes(modalType) && window.renderReportBtn) {
            let itemName = '', itemId = '';
            try {
                if (itemForModal) {
                    itemName = window.dbCol(itemForModal, 'Nome') || window.dbCol(itemForModal, 'Attrazioni') || '';
                    itemId = String(itemForModal.id || itemForModal.ID || itemForModal.POI_ID || '');
                } else {
                    const parsed = JSON.parse(decodeURIComponent(newPayload));
                    itemName = window.dbCol(parsed, 'Nome') || window.dbCol(parsed, 'Prodotti') || parsed.nome || '';
                    itemId = String(parsed.id || parsed.poi_id || '');
                }
            } catch(e) {}
            reportBtnHtml = `<div class="px-5 pb-4 flex justify-start">${window.renderReportBtn(modalType, itemId, itemName)}</div>`;
        }

        const _closeLabel = (window.t ? window.t('close_label') : 'Close');
        const slideClass = direction === 'left' ? 'ms-slide-left' : 'ms-slide-right';

        let modalClass = content.class || 'modal-sheet bg-white w-full max-w-md rounded-t-[1.75rem] md:rounded-[2rem] shadow-2xl overflow-hidden relative overflow-y-auto h-[92vh] h-[92dvh]';
        if (!modalClass.includes('modal-sheet')) modalClass = 'modal-sheet ' + modalClass;

        // Rimuovi il vecchio sheet
        const oldSheet = overlay.querySelector('.modal-sheet');
        if (oldSheet) oldSheet.remove();

        // Crea il nuovo sheet con animazione slide
        const newSheet = document.createElement('div');
        newSheet.className = `${modalClass} ${slideClass} transform transition-all scale-100`;
        newSheet.innerHTML = `
            <button class="absolute top-3 right-4 z-20 w-9 h-9 bg-slate-100/90 backdrop-blur rounded-full flex items-center justify-center text-slate-500 shadow-sm active:scale-90 transition-transform cursor-pointer touch-manipulation" onclick="window._dismissModal(this.closest('.fixed'))" aria-label="${_closeLabel}">
                <span class="material-icons" style="font-size:18px;">close</span>
            </button>
            ${content.html}
            ${reportBtnHtml}`;

        // Inserisci prima delle frecce
        overlay.insertBefore(newSheet, arrowLeft);

        if (content.onRender && typeof content.onRender === 'function') {
            setTimeout(() => content.onRender(), 50);
        }

        _updateNav();
        window._haptic?.(5);

        // ── Scroll sync: porta la card corrispondente in vista nella lista ──
        _syncListScroll(newIdx, newItem);
    }

    // ── Scroll sync con la lista sotto ──
    function _syncListScroll(idx, item) {
        // Trova la card corrispondente nel DOM della lista
        const listContainer = document.getElementById('dynamic-list');
        if (!listContainer) return;

        const cards = listContainer.querySelectorAll('.master-card, [data-card-id]');
        if (!cards.length) return;

        // Cerca per data-card-id o per indice posizionale
        const itemId = String(item?.id || item?.ID || item?.POI_ID || item?.poi_id || '');
        let targetCard = null;

        if (itemId) {
            targetCard = listContainer.querySelector(`[data-card-id="${itemId}"]`);
        }
        if (!targetCard && cards[idx]) {
            targetCard = cards[idx];
        }

        if (targetCard) {
            // scrollIntoView smooth — centra la card nel viewport
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Flash visivo leggero per indicare quale card è quella attiva
            targetCard.style.transition = 'box-shadow 0.3s ease, transform 0.3s ease';
            targetCard.style.boxShadow = '0 0 0 3px rgba(233,196,106,0.5)';
            targetCard.style.transform = 'scale(1.01)';
            setTimeout(() => {
                targetCard.style.boxShadow = '';
                targetCard.style.transform = '';
            }, 800);
        }
    }

    // ── Click frecce ──
    arrowLeft.onclick = (e) => {
        e.stopPropagation();
        _navigateTo(currentIdx - 1, 'left');
    };
    arrowRight.onclick = (e) => {
        e.stopPropagation();
        _navigateTo(currentIdx + 1, 'right');
    };

    // ── Touch swipe orizzontale sul modale ──
    let _sStartX = 0, _sStartY = 0, _swiping = false, _sDeltaX = 0;
    const SWIPE_THRESHOLD = 50;    // px minimi per attivare lo swipe
    const ANGLE_LOCK = 1.2;        // rapporto dy/dx sotto il quale è "orizzontale"

    function _onTouchStart(e) {
        _sStartX = e.touches[0].clientX;
        _sStartY = e.touches[0].clientY;
        _swiping = false;
        _sDeltaX = 0;
    }

    function _onTouchMove(e) {
        const dx = e.touches[0].clientX - _sStartX;
        const dy = e.touches[0].clientY - _sStartY;

        // Lock: deve essere un gesto prevalentemente orizzontale
        if (!_swiping && Math.abs(dx) > 15 && Math.abs(dx) > Math.abs(dy) * ANGLE_LOCK) {
            _swiping = true;
        }

        if (_swiping) {
            _sDeltaX = dx;
            // Feedback visivo: leggero spostamento del sheet
            const currentSheet = overlay.querySelector('.modal-sheet');
            if (currentSheet) {
                const dampedX = dx * 0.3;
                currentSheet.style.transform = `translateX(${dampedX}px)`;
                currentSheet.style.transition = 'none';
            }
        }
    }

    function _onTouchEnd() {
        if (!_swiping) return;
        _swiping = false;

        const currentSheet = overlay.querySelector('.modal-sheet');
        if (currentSheet) {
            currentSheet.style.transition = 'transform 0.2s ease';
            currentSheet.style.transform = '';
        }

        if (Math.abs(_sDeltaX) > SWIPE_THRESHOLD) {
            if (_sDeltaX > 0) {
                // Swipe verso destra → item precedente
                _navigateTo(currentIdx - 1, 'left');
            } else {
                // Swipe verso sinistra → item successivo
                _navigateTo(currentIdx + 1, 'right');
            }
        }
        _sDeltaX = 0;
    }

    overlay.addEventListener('touchstart', _onTouchStart, { passive: true });
    overlay.addEventListener('touchmove',  _onTouchMove,  { passive: true });
    overlay.addEventListener('touchend',   _onTouchEnd,   { passive: true });

    // ── Keyboard nav (accessibilità desktop) ──
    function _onKeyNav(e) {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); _navigateTo(currentIdx - 1, 'left'); }
        if (e.key === 'ArrowRight') { e.preventDefault(); _navigateTo(currentIdx + 1, 'right'); }
    }
    document.addEventListener('keydown', _onKeyNav);

    // ── Cleanup function (chiamata da _dismissModal) ──
    overlay._swiperCleanup = function() {
        overlay.removeEventListener('touchstart', _onTouchStart);
        overlay.removeEventListener('touchmove',  _onTouchMove);
        overlay.removeEventListener('touchend',   _onTouchEnd);
        document.removeEventListener('keydown', _onKeyNav);
    };

    _updateNav();
};

window.openModal = async function(type, payload) {
    // ── History: pusha stato modale per il back button ──
    if (window._pushModalState) window._pushModalState();

    const modal = document.createElement('div');
    // Bottom-sheet su mobile (items-end), centrato su desktop (md:items-center)
    modal.className = 'fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);

    // ── Chiudi con Escape (accessibilità) ──
    const _onEscape = (e) => { if (e.key === 'Escape') { window._dismissModal(modal); document.removeEventListener('keydown', _onEscape); } };
    document.addEventListener('keydown', _onEscape);
    // Cleanup: quando l'overlay viene rimosso, rimuovi il listener
    const _escObs = new MutationObserver(() => { if (!modal.parentNode) { document.removeEventListener('keydown', _onEscape); _escObs.disconnect(); } });
    try { _escObs.observe(document.body, { childList: true }); } catch(e) {}

    // ── Backdrop dismiss: solo tap diretto, protetto da drag accidentali ──
    let _bgTouchMoved = false;
    modal.addEventListener('touchstart', () => { _bgTouchMoved = false; }, { passive: true });
    modal.addEventListener('touchmove',  () => { _bgTouchMoved = true; },  { passive: true });
    modal.onclick = (e) => { 
        if(e.target === modal && !_bgTouchMoved) {
            window._dismissModal(modal);
        }
    };

    // ── Smart swipe-down: chiude SOLO quando lo scroll è in cima ──
    // Risolve il conflitto scroll-contenuto vs dismiss-gesto
    let _swipeStartY = 0, _swipeStartX = 0, _swipeActive = false, _swipeStartedAtTop = false;
    modal.addEventListener('touchstart', e => {
        _swipeStartY = e.touches[0].clientY;
        _swipeStartX = e.touches[0].clientX;
        const inner = modal.querySelector('.modal-sheet');
        _swipeStartedAtTop = inner ? inner.scrollTop <= 5 : true;
        _swipeActive = false;
    }, { passive: true });
    modal.addEventListener('touchmove', e => {
        if (!_swipeStartedAtTop) return; // scroll normale, non interferire
        const dy = e.touches[0].clientY - _swipeStartY;
        const dx = e.touches[0].clientX - _swipeStartX;
        // Attiva solo se gesto chiaramente verso il basso
        if (!_swipeActive && dy > 10 && Math.abs(dy) > Math.abs(dx) * 1.5) {
            _swipeActive = true;
        }
        if (_swipeActive) {
            const inner = modal.querySelector('.modal-sheet');
            if (inner) {
                inner.style.transform = `translateY(${Math.min(dy * 0.5, 100)}px)`;
                inner.style.opacity   = String(Math.max(0.4, 1 - dy / 300));
                inner.style.transition = 'none';
            }
        }
    }, { passive: true });
    modal.addEventListener('touchend', e => {
        if (!_swipeActive) return;
        _swipeActive = false;
        const dy = e.changedTouches[0].clientY - _swipeStartY;
        const inner = modal.querySelector('.modal-sheet');
        if (dy > 100) {
            // Dismiss con animazione fluida
            if (inner) {
                inner.style.transition = 'transform 0.25s ease-in, opacity 0.2s ease-in';
                inner.style.transform  = 'translateY(100%)';
                inner.style.opacity    = '0';
            }
            setTimeout(() => modal.remove(), 280);
        } else if (inner) {
            // Snap back
            inner.style.transition = 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1), opacity 0.3s ease';
            inner.style.transform  = '';
            inner.style.opacity    = '';
            setTimeout(() => { inner.style.transition = ''; }, 350);
        }
    }, { passive: true });

    let item = null; 
    if (window.currentTableData && (['Vini', 'Attrazioni', 'attrazione', 'wine'].includes(type))) {
        item = window.currentTableData.find(i => i.id == payload || i.ID == payload || i.POI_ID == payload);
        if (!item && typeof payload === 'number') item = window.currentTableData[payload];
    }

    if (!window.getModalContent) { modal.remove(); return; }
    
    const content = window.getModalContent(type, payload, item);
    
    if (!content || !content.html) { modal.remove(); return; }

    // ── Report button: estraiamo il nome dell'item per la segnalazione ──
    // Skip per modali non-content (transport, legal, ecc.)
    let reportBtnHtml = '';
    const reportableTypes = ['ristorante','restaurant','product','Vini','wine','attrazione','Attrazioni','Spiagge','sentieroInfo'];
    if (reportableTypes.includes(type) && window.renderReportBtn) {
        let itemName = '';
        let itemId = '';
        try {
            if (item) {
                // Vini, Attrazioni: item è l'oggetto dal DB
                itemName = window.dbCol(item, 'Nome') || window.dbCol(item, 'Attrazioni') || '';
                itemId = String(item.id || item.ID || item.POI_ID || '');
            } else if (payload && typeof payload === 'string' && (payload.startsWith('%') || payload.startsWith('{'))) {
                // Ristoranti, Spiagge, Prodotti, Sentieri: payload è JSON encoded
                const parsed = JSON.parse(decodeURIComponent(payload));
                itemName = window.dbCol(parsed, 'Nome') || window.dbCol(parsed, 'Prodotti') || parsed.nome || '';
                itemId = String(parsed.id || parsed.poi_id || '');
            } else {
                itemId = String(payload || '');
            }
        } catch(e) {}
        reportBtnHtml = `<div class="px-5 pb-4 flex justify-start">${window.renderReportBtn(type, itemId, itemName)}</div>`;
    }

    // Content Container: bottom-sheet
    // Tipi swipabili → altezza fissa 92vh per evitare "saltelli" durante lo swipe
    // Altri tipi → altezza dinamica che si adatta al contenuto
    const _swipeableForHeight = ['ristorante','restaurant','product','Vini','wine','attrazione','Attrazioni','Spiagge','sentieroInfo'];
    const isSwipeable = _swipeableForHeight.includes(type);
    const heightClasses = isSwipeable
        ? 'h-[92vh] h-[92dvh]'                    // fisso: catalogo sfogliabile
        : 'max-h-[85vh] max-h-[85dvh]';           // dinamico: si adatta al contenuto

    let modalClass = content.class || `modal-sheet bg-white w-full max-w-md rounded-t-[1.75rem] md:rounded-[2rem] shadow-2xl overflow-hidden relative overflow-y-auto ${heightClasses}`;
    if (!modalClass.includes('modal-sheet')) modalClass = 'modal-sheet ' + modalClass;

    const _closeLabel = (window.t ? window.t('close_label') : 'Close');
    
    modal.innerHTML = `
    <div class="${modalClass} modal-sheet-enter transform transition-all scale-100">
        <button class="absolute top-3 right-4 z-20 w-9 h-9 bg-slate-100/90 backdrop-blur rounded-full flex items-center justify-center text-slate-500 shadow-sm active:scale-90 transition-transform cursor-pointer touch-manipulation" onclick="window._dismissModal(this.closest('.fixed'))" aria-label="${_closeLabel}">
            <span class="material-icons" style="font-size:18px;">close</span>
        </button>
        ${content.html}
        ${reportBtnHtml}
    </div>`;

    if (content.onRender && typeof content.onRender === 'function') {
        setTimeout(() => content.onRender(), 50);
    }

    // ── MODAL SWIPER: attacca navigazione swipe se siamo in una lista ──
    const _swipeableTypes = ['ristorante','restaurant','product','Vini','wine','attrazione','Attrazioni','Spiagge','sentieroInfo'];
    console.log('[ModalSwiper] type:', type, '| in swipeableTypes:', _swipeableTypes.includes(type), '| filteredList length:', window._currentFilteredList?.length);
    if (_swipeableTypes.includes(type) && window._currentFilteredList?.length > 1) {
        const list = window._currentFilteredList;

        // Trova l'indice dell'item corrente nella lista filtrata
        let foundIdx = -1;

        if (['Vini','wine'].includes(type)) {
            // Payload = ID diretto (stringa)
            foundIdx = list.findIndex(it => String(it.id ?? it.ID ?? '') === String(payload));

        } else if (['attrazione','Attrazioni'].includes(type)) {
            // Payload = POI_ID o id diretto (stringa)
            foundIdx = list.findIndex(it => String(it.POI_ID ?? it.id ?? '') === String(payload));

        } else {
            // Ristoranti, Spiagge, Prodotti, Sentieri: payload = JSON encoded dell'intero oggetto
            let parsedPayload = null;
            try { parsedPayload = JSON.parse(decodeURIComponent(payload)); } catch(e) { /* payload non decodificabile */ }

            if (parsedPayload) {
                // Strategia 1: match per id numerico/stringa
                const pId = parsedPayload.id ?? parsedPayload.poi_id ?? null;
                if (pId != null) {
                    foundIdx = list.findIndex(it => {
                        const itId = it.id ?? it.poi_id ?? null;
                        return itId != null && String(itId) === String(pId);
                    });
                }

                // Strategia 2 (fallback): match per Nome IT — gli id potrebbero non esistere nella tabella Prodotti
                if (foundIdx === -1) {
                    const pNome = window.valIT(parsedPayload, 'Nome') || window.valIT(parsedPayload, 'Prodotti') || '';
                    if (pNome) {
                        foundIdx = list.findIndex(it => {
                            const itNome = window.valIT(it, 'Nome') || window.valIT(it, 'Prodotti') || '';
                            return itNome && itNome === pNome;
                        });
                    }
                }
            }
        }

        if (foundIdx >= 0) {
            console.log('[ModalSwiper] ✅ Attached at index', foundIdx, '/', list.length);
            setTimeout(() => {
                window._attachModalSwiper(modal, list, foundIdx, type);
            }, 100);
        } else {
            console.warn('[ModalSwiper] ❌ Item not found in list. type:', type, '| payload (first 100):', String(payload).substring(0, 100), '| list[0] sample:', JSON.stringify(list[0]).substring(0, 100));
        }
    }
};

// FIXED: Funzione TechMap con classi Tailwind (Z-Index alto e HCI Layout)
window.openTechMap = function(safeObj) {
    try {
        const s = JSON.parse(decodeURIComponent(safeObj));
        let gpxUrl = s.gpx_url ? s.gpx_url.trim() : null;

        // Dati con formattazione e fallback
        const dist = s.distanza_km || '--';
        const dur = s.durata_minuti || '--';
        const d_plus = s.dislivello_positivo || s.dislivello_passivo || '--';
        const d_minus = s.dislivello_negativo || '--';
        const alt_max = s.altitudine_max || '--';
        const alt_min = s.altitudine_minima || '--';
        
        const mapContainerId = 'tech-map-canvas-' + Math.floor(Math.random() * 10000);

        const modalHtml = `
            <div class="tech-container bg-slate-50 w-full h-full md:max-w-xl md:h-[90vh] md:rounded-[2rem] flex flex-col relative overflow-hidden shadow-2xl">
                
                <div class="relative w-full h-[45vh] min-h-[300px] shrink-0 z-0">
                    <button onclick="closeModal()" class="absolute top-4 right-4 z-[400] w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-800 shadow-sm active:scale-90 transition-transform"
                            aria-label="${window.t ? window.t('close_label') : 'Close'}">
                        <span class="material-icons text-xl">close</span>
                    </button>
                    <div class="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-sm text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span class="material-icons text-sm text-ct-green">map</span> ${window.t('gps_track')}
                    </div>
                    
                    <div id="${mapContainerId}" class="w-full h-full bg-slate-200"></div>
                </div>

                <div class="tech-scroll-wrapper flex-1 overflow-y-auto bg-slate-50 relative z-10 -mt-5 rounded-t-[1.5rem] flex flex-col">
                    
                    <div class="w-full flex justify-center pt-3 pb-1 bg-white rounded-t-[1.5rem]">
                        <div class="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                    </div>

                    <div class="bg-white p-5 px-6 shadow-sm border-b border-slate-100">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">${window.t('tech_data')}</h3>

                        <!-- Riga 1: Distanza + Durata -->
                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <div class="flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl py-4 border border-slate-100">
                                <span class="material-icons text-slate-300 text-lg mb-1">straighten</span>
                                <div class="text-xl font-bold text-slate-700 leading-none">${dist}<span class="text-[11px] text-slate-400 font-normal ml-0.5">km</span></div>
                                <div class="text-[11px] uppercase font-bold text-slate-400 mt-1.5">${window.t("distance")}</div>
                            </div>
                            <div class="flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl py-4 border border-slate-100">
                                <span class="material-icons text-slate-300 text-lg mb-1">schedule</span>
                                <div class="text-xl font-bold text-slate-700 leading-none">${dur}<span class="text-[11px] text-slate-400 font-normal ml-0.5">min</span></div>
                                <div class="text-[11px] uppercase font-bold text-slate-400 mt-1.5">${window.t("duration")}</div>
                            </div>
                        </div>

                        <!-- Riga 2: Dislivello + / − (coppia) -->
                        <div class="rounded-2xl border border-slate-100 overflow-hidden mb-3">
                            <div class="flex items-center gap-1.5 px-4 pt-3 pb-1">
                                <span class="material-icons text-slate-300 text-sm">show_chart</span>
                                <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">${window.t('elevation_gain')}</span>
                            </div>
                            <div class="grid grid-cols-2 divide-x divide-slate-100">
                                <div class="flex flex-col items-center justify-center text-center py-3">
                                    <span class="material-icons text-red-300 text-lg mb-1">trending_up</span>
                                    <div class="text-xl font-bold text-slate-700 leading-none">${d_plus}<span class="text-[11px] text-slate-400 font-normal ml-0.5">m</span></div>
                                    <div class="text-[11px] uppercase font-bold text-red-400 mt-1.5">${window.t('ascent')}</div>
                                </div>
                                <div class="flex flex-col items-center justify-center text-center py-3">
                                    <span class="material-icons text-emerald-400 text-lg mb-1">trending_down</span>
                                    <div class="text-xl font-bold text-slate-700 leading-none">${d_minus}<span class="text-[11px] text-slate-400 font-normal ml-0.5">m</span></div>
                                    <div class="text-[11px] uppercase font-bold text-emerald-500 mt-1.5">${window.t('descent')}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Riga 3: Altitudine Max / Min (coppia) -->
                        <div class="rounded-2xl border border-slate-100 overflow-hidden">
                            <div class="flex items-center gap-1.5 px-4 pt-3 pb-1">
                                <span class="material-icons text-slate-300 text-sm">terrain</span>
                                <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">${window.t('altitude')}</span>
                            </div>
                            <div class="grid grid-cols-2 divide-x divide-slate-100">
                                <div class="flex flex-col items-center justify-center text-center py-3">
                                    <span class="material-icons text-slate-300 text-lg mb-1">keyboard_arrow_up</span>
                                    <div class="text-xl font-bold text-slate-700 leading-none">${alt_max}<span class="text-[11px] text-slate-400 font-normal ml-0.5">m</span></div>
                                    <div class="text-[11px] uppercase font-bold text-slate-400 mt-1.5">Massima</div>
                                </div>
                                <div class="flex flex-col items-center justify-center text-center py-3">
                                    <span class="material-icons text-slate-300 text-lg mb-1">keyboard_arrow_down</span>
                                    <div class="text-xl font-bold text-slate-700 leading-none">${alt_min}<span class="text-[11px] text-slate-400 font-normal ml-0.5">m</span></div>
                                    <div class="text-[11px] uppercase font-bold text-slate-400 mt-1.5">Minima</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="elevation-div" class="hidden bg-white mx-4 mt-4 p-2 rounded-2xl shadow-sm border border-slate-100 h-[180px]"></div>
                </div>

                <div class="p-4 bg-white border-t border-slate-100 flex gap-2 z-[200] shrink-0">
                    <button class="flex-1 py-3 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform" onclick="window.downloadGPX('${gpxUrl}')">
                        <span class="material-icons text-sm">download</span> GPX
                    </button>
                    <button id="btn-gps" class="flex-1 py-3 bg-sky-50 text-sky-600 border border-sky-200 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform" onclick="window.toggleGPS()">
                        <span class="material-icons text-sm">my_location</span> GPS
                    </button>
                    <button id="btn-toggle-ele" class="flex-1 py-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform" onclick="toggleElevationChart()">
                        <span class="material-icons text-sm">show_chart</span> ${window.t('chart_label') || 'Chart'}
                    </button>
                </div>

            </div>
        `;

        let modalOverlay = document.createElement('div');
        modalOverlay.id = 'tech-modal-overlay';
        modalOverlay.className = 'fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-0 md:p-6 animate-fade';
        modalOverlay.setAttribute('role', 'dialog');
        modalOverlay.setAttribute('aria-modal', 'true');
        // h-[45vh] nella mappa interna usa inline style per supportare dvh con fallback vh
        modalOverlay.querySelector && setTimeout(() => {
            const mapSection = modalOverlay.querySelector('.relative.w-full.shrink-0');
            if (mapSection) { mapSection.style.height = '45vh'; mapSection.style.height = '45dvh'; }
        }, 0);
        
        modalOverlay.innerHTML = modalHtml;
        document.body.appendChild(modalOverlay);

        setTimeout(() => { initLeafletMap(mapContainerId, gpxUrl); }, 300);

    } catch (e) { console.error("Errore TechMap:", e); }
};
window.toggleElevationChart = function() {
    const elDiv = document.getElementById('elevation-div');
    const btn = document.getElementById('btn-toggle-ele');
    
    if (!elDiv || !btn) return;

    const isHidden = elDiv.classList.contains('hidden');

    if (isHidden) {
        elDiv.classList.remove('hidden');
        
        btn.innerHTML = '<span class="material-icons text-sm">close</span> ' + (window.t('close_label') || 'Chiudi');
        btn.className = "flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 border border-red-100";
        
        if (window.currentMap) {
            setTimeout(() => { window.currentMap.invalidateSize(); }, 100);
        }

        const wrapper = document.querySelector('.tech-scroll-wrapper');
        if (wrapper) {
            setTimeout(() => wrapper.scrollTo({ top: wrapper.scrollHeight, behavior: 'smooth' }), 100);
        }

    } else {
        elDiv.classList.add('hidden');
        
        btn.innerHTML = '<span class="material-icons text-sm">show_chart</span> ' + (window.t('chart_label') || 'Grafico');
        btn.className = "flex-1 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-95";
        
        if (window.currentMap) {
            setTimeout(() => { window.currentMap.invalidateSize(); }, 50);
        }
    }
};

window.downloadGPX = function(url) {
    if(!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// toggleGPS: implementazione in app.js — usa _requestGeoPermission + modal branded

window.closeModal = function() {
    const m = document.getElementById('tech-modal-overlay');
    if (m) m.remove();
    
    const oldM = document.getElementById('modal-container');
    if (oldM) oldM.remove();

    // Ferma il GPS tracker della mappa sentieri se attivo
    if (window.GeoTracker) {
        window.GeoTracker.stop('sentieri');
        window.GeoTracker.stop('bus');
    }

    // Pulisce i marker GPS lasciati sulla mappa sentieri
    if (window.userMarker && window.currentMap) {
        try { window.currentMap.removeLayer(window.userMarker); } catch(e) {}
        window.userMarker = null;
    }
    if (window.userAccuracyCircle && window.currentMap) {
        try { window.currentMap.removeLayer(window.userAccuracyCircle); } catch(e) {}
        window.userAccuracyCircle = null;
    }

    if (window.currentMap) { 
        window.currentMap.off();
        window.currentMap.remove(); 
        window.currentMap = null; 
    }
};

// Funzione Inizializzazione Mappa (Invariata)
function initLeafletMap(divId, gpxUrl) {
    const el = document.getElementById(divId);
    if (!el) return;
    
    // Assicura che il container abbia dimensione
    if(el.clientHeight === 0) el.style.height = '450px';

    if (window.currentMap) { 
        window.currentMap.off();
        window.currentMap.remove(); 
        window.currentMap = null; 
    }
    document.getElementById('elevation-div').innerHTML = '';

    const map = L.map(divId);
    window.currentMap = map;
    map.setView([44.118, 9.711], 13); 

    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 16, attribution: 'OpenTopoMap'
    }).addTo(map);

    if (gpxUrl) {
        try {
            const elevationOptions = {
                theme: "steelblue-theme",
                detached: true,
                elevationDiv: "#elevation-div",
                xAttr: 'dist', yAttr: 'altitude', 
                time: false, summary: false, followMarker: true,
                margins: { top: 20, right: 20, bottom: 20, left: 50 },
                polyline: { color: '#D32F2F', opacity: 0.9, weight: 5 }
            };
            L.control.elevation(elevationOptions).addTo(map).load(gpxUrl);
        } catch (e) {
            new L.GPX(gpxUrl, { async: true, polyline_options: { color: 'red' } })
              .on('loaded', e => map.fitBounds(e.target.getBounds())).addTo(map);
        }
    }
    setTimeout(() => { map.invalidateSize(); }, 300);
}

// eseguiRicercaBus: implementazione canonica in app.js
// eseguiRicercaTraghetto: implementazione canonica in app.js


// ── FUNZIONI BUS / FERRY / GPS ──────────────────────────────
// Tutte spostate in app.js (caricato dopo) che è la fonte canonica.
// initBusMap, loadAllStops, handleBusSelectionChange,
// setBusStop, toggleBusMap, handleBusSelectionChange,
// initFerrySearch, handleFerrySelectionChange, flashInputFeedback
// ─────────────────────────────────────────────────────────────