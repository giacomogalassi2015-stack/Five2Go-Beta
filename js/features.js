// ═══════════════════════════════════════════════════════════════════════════
//  features.js — WISHLIST, CT CARD E SEGNALAZIONI (PRIMARIO)
//
//  Gestisce le funzionalità "persistenti" che restano salvate tra le sessioni:
//    - Wishlist (preferiti) con cuoricino su ogni card
//    - Pagina "I miei Preferiti"
//    - Pagina info "Cinque Terre Card" con simulatore prezzi
//    - Pagina info "Cinque Terre Treno Card"
//    - Sistema segnalazioni errori (report a Supabase)
//
//  ESPORTA SU WINDOW:
//    window.WL               → Manager wishlist (get/add/remove/has/toggle)
//    window.renderHeartBtn() → Genera il bottone cuoricino per una card
//    window.renderHeartBtnOverlay() → Versione overlay per card con foto
//    window.toggleHeart()    → Toggle cuoricino (con animazione + haptic)
//    window._updateHomeBadges() → Aggiorna il contatore sulla home
//    window.renderWishlist() → Pagina "I miei Preferiti"
//    window.renderCinqueTerreCard()     → Pagina CT Card
//    window.renderCinqueTerreTrenoCard() → Pagina CT Treno Card
//    window.renderReportBtn() → Bottone "Segnala problema" nei modali
//    window._haptic()        → Vibrazione feedback per azioni importanti
//    window._showConfirmDialog() → Dialog di conferma (usato da "Svuota tutto")
//    window.GeoTracker       → Singleton GPS pub/sub (usato da mappa, bus, near me)
//    window.toggleNearMe()   → Ordinamento per distanza nelle liste
//    window.sortByDistance()  → Ordina una lista per distanza GPS
//
//  STORAGE: localStorage chiave 'f2g_wishlist'
//
//  DIPENDENZE:
//    data-logic.js → window.t(), window.dbCol(), window.supabaseClient
//    ui-modal.js   → window.openModal() per aprire dettagli dalla wishlist
//    app.js        → switchView() per la navigazione
//
//  USATO DA:
//    ui-renderers.js → renderHeartBtnOverlay() nei template card
//    app.js          → renderWishlist(), renderCinqueTerreCard() da switchView
//    app.js          → GeoTracker da GPS/bus/mappa
//    ui-modal.js     → renderReportBtn() nei modali dettaglio
// ═══════════════════════════════════════════════════════════════════════════


// ───────────────────────────────────────────────────────────────────────
//  VIBRAZIONE FEEDBACK (TERZIARIO)
//  Micro-vibrazione al tap su azioni importanti (cuoricino, filtro, ecc.)
//  Funziona su Android. Su iOS non fa nulla ma non crasha.
//  Usata da: toggleHeart(), toggleSmartFilter(), _selectReportOpt()
// ───────────────────────────────────────────────────────────────────────
window._haptic = function(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms || 10); } catch(e) {}
};


// ───────────────────────────────────────────────────────────────────────
//  DIALOG DI CONFERMA (TERZIARIO)
//  Bottom-sheet con "Sei sicuro?" + bottoni Annulla/Conferma.
//  Sostituisce il brutto window.confirm() nativo del browser.
//  Usata da: "Svuota tutto" nella wishlist
//  Dipendenze: data-logic.js → window.t() per i testi dei bottoni
// ───────────────────────────────────────────────────────────────────────
window._showConfirmDialog = function(title, message, onConfirm) {
    const existing = document.getElementById('f2g-confirm-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'f2g-confirm-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;width:100%;height:100dvh;height:100vh;z-index:9500;background:rgba(15,23,42,0.5);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
    <div style="background:#fff;width:100%;max-width:360px;margin:auto;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.2);overflow:hidden;animation:bumpPanelIn 0.28s cubic-bezier(0.2,0.8,0.2,1) forwards;">
        <div style="padding:28px 24px 24px;text-align:center;">
            <div style="width:56px;height:56px;background:#FFFBEB;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;border:2px solid #FDE68A;">
                <span class="material-icons" style="font-size:24px;color:#F59E0B;">warning_amber</span>
            </div>
            <h3 style="font-weight:700;color:#1e293b;font-size:1.12rem;margin:0 0 8px;font-family:'Plus Jakarta Sans',sans-serif;">${title}</h3>
            <p style="font-size:0.875rem;color:#64748b;line-height:1.6;margin:0 0 24px;">${message}</p>
            <div style="display:flex;gap:12px;">
                <button id="f2g-confirm-no" style="flex:1;padding:12px;border-radius:12px;font-weight:700;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.05em;background:#f1f5f9;color:#475569;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:transform 0.15s;" ontouchstart="this.style.transform='scale(0.97)'" ontouchend="this.style.transform='scale(1)'">
                    ${window.t('confirm_no') || 'Annulla'}
                </button>
                <button id="f2g-confirm-yes" style="flex:1;padding:12px;border-radius:12px;font-weight:700;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.05em;background:#f43f5e;color:#fff;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(244,63,94,0.35);font-family:'Plus Jakarta Sans',sans-serif;transition:transform 0.15s;" ontouchstart="this.style.transform='scale(0.97)'" ontouchend="this.style.transform='scale(1)'">
                    ${window.t('confirm_yes') || 'Sì, svuota'}
                </button>
            </div>
        </div>
    </div>`;

    document.body.appendChild(overlay);
    document.getElementById('f2g-confirm-no').addEventListener('click', () => overlay.remove());
    document.getElementById('f2g-confirm-yes').addEventListener('click', () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    });
};


// ───────────────────────────────────────────────────────────────────────
//  TOAST STORAGE PIENO (TERZIARIO)
//  Mostra un avviso se localStorage è pieno (raro, ma possibile su Safari iOS).
//  Usata da: WL._save() quando il salvataggio fallisce
// ───────────────────────────────────────────────────────────────────────
window._showStorageToast = function() {
    // Evita toast multipli ravvicinati
    if (document.getElementById('storage-full-toast')) return;
    const toast = document.createElement('div');
    toast.id = 'storage-full-toast';
    toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);z-index:9999;background:#1e293b;color:#fff;padding:12px 20px;border-radius:14px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.25);display:flex;align-items:center;gap:8px;max-width:92vw;opacity:0;transition:opacity 0.3s;';
    toast.innerHTML = `<span class="material-icons text-amber-400 text-base">warning</span> ${window.t('storage_full')}`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => { toast.style.opacity = '0'; }, 3500);
    setTimeout(() => toast.remove(), 4000);
};


// ═══════════════════════════════════════════════════════════════════════════
//  WISHLIST MANAGER (PRIMARIO)
//
//  Gestisce la lista dei preferiti dell'utente in localStorage.
//  Ogni item ha: wl_id, wl_type, wl_name, wl_sub, wl_modal_type, wl_modal_payload
//
//  Metodi:
//    WL.get()        → restituisce l'array dei preferiti
//    WL.add(item)    → aggiunge se non già presente
//    WL.remove(id)   → rimuove per ID
//    WL.has(id)      → controlla se un ID è nei preferiti (true/false)
//    WL.toggle(item) → aggiunge o rimuove. Restituisce true se aggiunto.
//
//  NOTA SAFARI iOS: localStorage può essere cancellato dopo ~7 giorni di
//  inattività se la PWA non è installata sulla home screen.
//
//  Usata da: toggleHeart(), renderWishlist(), _updateHomeBadges(), renderHome()
// ═══════════════════════════════════════════════════════════════════════════
window.WL = {
    _key: 'f2g_wishlist',

    /** Restituisce l'array corrente (fallback []) */
    get() {
        try { return JSON.parse(localStorage.getItem(this._key) || '[]'); }
        catch { return []; }
    },

    /** Persiste l'array — con feedback toast se la quota è esaurita */
    _save(arr) {
        try { localStorage.setItem(this._key, JSON.stringify(arr)); }
        catch (e) {
            console.warn('[WL] localStorage write failed:', e);
            window._showStorageToast && window._showStorageToast();
        }
    },

    /** Aggiunge un item se non già presente */
    add(item) {
        const list = this.get();
        if (!this.has(item.wl_id)) { list.push(item); this._save(list); }
    },

    /** Rimuove per id */
    remove(id) { this._save(this.get().filter(i => i.wl_id !== String(id))); },

    /** Controlla presenza */
    has(id) { return this.get().some(i => i.wl_id === String(id)); },

    /** Toggle: aggiunge se assente, rimuove se presente. Ritorna true se aggiunto. */
    toggle(item) {
        if (this.has(item.wl_id)) { this.remove(item.wl_id); return false; }
        this.add(item); return true;
    }
};


// ───────────────────────────────────────────────────────────────────────
//  ITINERARY — Stub V1.0 (disabilitato, pianificato per V2)
//  Tutti i metodi sono no-op per evitare crash se qualche vecchio codice li chiama.
// ───────────────────────────────────────────────────────────────────────
window.ITINERARY = { get() { return []; }, _save() {}, add() { return false; }, remove() {}, has() { return false; }, move() {}, clear() {} };
window.renderPlanBtn = function() { return ''; };
window.togglePlan    = function() {};
window.renderItinerary = function() { window.renderWishlist(); };


// ═══════════════════════════════════════════════════════════════════════════
//  CUORICINO WISHLIST (PRIMARIO)
//
//  Tre funzioni che lavorano insieme:
//    renderHeartBtn(wlItem)          → Genera un bottone cuore sotto la card
//    renderHeartBtnOverlay(wlItem)   → Genera un cuore sovrapposto alla foto
//    toggleHeart(btn, encoded)       → Al tap: aggiunge/rimuove dai preferiti
//                                      con animazione pop + vibrazione
//
//  L'item wishlist (wlItem) contiene:
//    wl_id, wl_type, wl_name, wl_sub, wl_modal_type, wl_modal_payload
//  Questi dati servono per riaprire il modale dalla pagina preferiti.
//
//  Usata da: tutti i renderer in ui-renderers.js
//  Dipendenze: WL manager (sopra), _haptic(), _updateHomeBadges()
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Genera l'HTML del pulsante cuore da inserire nel buttonsHtml delle card.
 * @param {Object} wlItem  — { wl_id, wl_type, wl_name, wl_sub, wl_modal_type, wl_modal_payload }
 */
window.renderHeartBtn = function(wlItem) {
    const isActive = window.WL.has(wlItem.wl_id);
    // Le singole quote vengono codificate per evitare conflitti nell'attributo onclick
    const safeItem = encodeURIComponent(JSON.stringify(wlItem)).replace(/'/g, '%27');

    const iconClass   = isActive ? 'text-rose-500'  : 'text-slate-400';
    const wrapperClass = isActive ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-200';
    const labelClass  = isActive ? 'text-rose-400'  : 'text-slate-400';
    const iconName    = isActive ? 'favorite' : 'favorite_border';
    const ariaLabel   = isActive ? window.t('aria_fav_remove') : window.t('aria_fav_add');

    return `<button
        class="flex flex-col items-center justify-center gap-1 group/btn active:scale-95 transition-all duration-200 min-w-[50px] cursor-pointer touch-manipulation wl-heart-btn${isActive ? ' wl-active' : ''}"
        data-wl-id="${wlItem.wl_id}"
        onclick="event.stopPropagation(); window.toggleHeart(this, '${safeItem}')"
        aria-label="${ariaLabel}">
        <div class="h-11 w-11 rounded-xl ${wrapperClass} shadow-sm flex items-center justify-center border transition-colors duration-200">
            <span class="material-icons text-lg ${iconClass}">${iconName}</span>
        </div>
        <span class="text-[10px] font-bold uppercase tracking-wide ${labelClass} transition-colors">Save</span>
    </button>`;
};

/**
 * Variante overlay del cuoricino: bottone circolare compatto per il top-right delle card.
 * Posizionamento assoluto — il parent deve avere position: relative.
 * @param {Object}  wlItem
 * @param {string}  theme  — 'dark' (su immagine) o 'light' (su sfondo chiaro, es. wine card)
 */
window.renderHeartBtnOverlay = function(wlItem, theme) {
    const isActive = window.WL.has(wlItem.wl_id);
    const safeItem = encodeURIComponent(JSON.stringify(wlItem)).replace(/'/g, '%27');
    const t = theme || 'dark';

    const iconName  = isActive ? 'favorite' : 'favorite_border';

    let iconClass, bgClass;
    if (isActive) {
        iconClass = 'text-rose-500';
        bgClass   = 'bg-white/95';
    } else if (t === 'light') {
        iconClass = 'text-slate-400';
        bgClass   = 'bg-slate-100';
    } else {
        iconClass = 'text-white/80';
        bgClass   = 'bg-black/25 backdrop-blur-sm';
    }

    const ariaLabel = isActive ? window.t('aria_fav_remove') : window.t('aria_fav_add');

    return `<button
        class="wl-heart-btn wl-heart-overlay absolute top-3 right-3 z-20 w-9 h-9 rounded-full ${bgClass} flex items-center justify-center shadow-md border border-white/20 active:scale-90 transition-all duration-200 cursor-pointer touch-manipulation${isActive ? ' wl-active' : ''}"
        data-wl-id="${wlItem.wl_id}"
        data-heart-theme="${t}"
        onclick="event.stopPropagation(); window.toggleHeart(this, '${safeItem}')"
        aria-label="${ariaLabel}">
        <span class="material-icons text-lg ${iconClass} drop-shadow-sm">${iconName}</span>
    </button>`;
};

/**
 * Callback onclick del pulsante cuore — aggiorna lo stato visivo senza re-render.
 * Gestisce sia la versione candy-btn sia la versione overlay.
 * @param {HTMLElement} btn      — il pulsante cliccato
 * @param {string}      encoded  — wlItem JSON-encoded
 */
window.toggleHeart = function(btn, encoded) {
    const item   = JSON.parse(decodeURIComponent(encoded));
    const added  = window.WL.toggle(item);   // true = appena aggiunto
    const isOverlay = btn.classList.contains('wl-heart-overlay');

    // Haptic: buzz più lungo quando si aggiunge, breve quando si rimuove
    window._haptic(added ? 12 : 6);

    const icon       = btn.querySelector('.material-icons');

    if (isOverlay) {
        // ── Overlay style (cerchio nel top-right della card) ──
        const theme = btn.getAttribute('data-heart-theme') || 'dark';
        if (added) {
            btn.classList.add('wl-active');
            if (icon) { icon.textContent = 'favorite'; icon.className = 'material-icons text-lg text-rose-500 drop-shadow-sm'; }
            btn.classList.remove('bg-black/25', 'backdrop-blur-sm', 'bg-slate-100');
            btn.classList.add('bg-white/95');
        } else {
            btn.classList.remove('wl-active');
            btn.classList.remove('bg-white/95');
            if (theme === 'light') {
                if (icon) { icon.textContent = 'favorite_border'; icon.className = 'material-icons text-lg text-slate-400 drop-shadow-sm'; }
                btn.classList.add('bg-slate-100');
            } else {
                if (icon) { icon.textContent = 'favorite_border'; icon.className = 'material-icons text-lg text-white/80 drop-shadow-sm'; }
                btn.classList.add('bg-black/25', 'backdrop-blur-sm');
            }
        }
    } else {
        // ── Candy-btn style (versione classica con label) ──
        const wrapper    = btn.querySelector('.h-11');
        const label      = btn.querySelector('span:last-child');

        if (added) {
            btn.classList.add('wl-active');
            if (icon)    { icon.textContent = 'favorite'; icon.classList.replace('text-slate-400', 'text-rose-500'); }
            if (wrapper) { wrapper.classList.add('bg-rose-50', 'border-rose-100'); wrapper.classList.remove('bg-slate-50', 'border-slate-200'); }
            if (label)   { label.classList.replace('text-slate-400', 'text-rose-400'); }
        } else {
            btn.classList.remove('wl-active');
            if (icon)    { icon.textContent = 'favorite_border'; icon.classList.replace('text-rose-500', 'text-slate-400'); }
            if (wrapper) { wrapper.classList.remove('bg-rose-50', 'border-rose-100'); wrapper.classList.add('bg-slate-50', 'border-slate-200'); }
            if (label)   { label.classList.replace('text-rose-400', 'text-slate-400'); }
        }
    }

    // Micro-animazione "pop"
    btn.style.transform = isOverlay ? 'scale(1.3)' : 'scale(1.25)';
    setTimeout(() => { btn.style.transform = ''; }, 280);

    window._updateHomeBadges();
};



// ───────────────────────────────────────────────────────────────────────
//  BADGE CONTATORE HOME (TERZIARIO)
//  Aggiorna il numerino sulla pill "Preferiti" nella home page.
//  Chiamata dopo ogni toggleHeart() e dopo "Svuota tutto".
// ───────────────────────────────────────────────────────────────────────
window._updateHomeBadges = function() {
    const wlBadge = document.querySelector('[data-home-badge="wishlist"]');

    if (wlBadge) {
        const count = window.WL.get().length;
        wlBadge.textContent = count;
        wlBadge.style.display = count > 0 ? 'flex' : 'none';
    }
};


// ═══════════════════════════════════════════════════════════════════════════
//  PAGINA PREFERITI (PRIMARIO)
//
//  Mostra tutti gli item salvati con cuoricino, con possibilità di:
//    - Aprire il modale dettaglio (tap sulla card)
//    - Rimuovere singoli item (bottone X con animazione slide-out)
//    - Svuotare tutto (con dialog di conferma)
//  Se vuota, mostra un messaggio con istruzioni per l'utente.
//
//  Chiamata da: app.js → switchView('wishlist') e switchView('itinerary')
//  Dipendenze: WL manager, ui-modal.js → openModal()
// ═══════════════════════════════════════════════════════════════════════════
window.renderWishlist = function() {
    const content = document.getElementById('app-content');
    if (!content) return;
    const items = window.WL.get();
    const lang  = window.currentLang || 'it';

    const L = {
        it: { title: 'I miei Preferiti', count_one: 'posto', count_many: 'posti', empty: 'Non hai ancora salvato nulla.', emptyHint: 'Premi il cuore ❤ sulle card per aggiungere i tuoi posti preferiti — restano salvati anche offline.', clearAll: 'Svuota tutto', openBtn: 'Apri', removeBtn: 'Rimuovi', step: 'Tappa' },
        en: { title: 'My Favourites', count_one: 'place', count_many: 'places', empty: 'Nothing saved yet.', emptyHint: 'Tap the heart ❤ on any card to save your favourite spots — available offline too.', clearAll: 'Clear all', openBtn: 'Open', removeBtn: 'Remove', step: 'Stop' },
        fr: { title: 'Mes Favoris', count_one: 'endroit', count_many: 'endroits', empty: 'Rien de sauvegardé.', emptyHint: 'Appuyez sur ❤ pour enregistrer vos endroits préférés — disponibles hors ligne.', clearAll: 'Tout effacer', openBtn: 'Ouvrir', removeBtn: 'Supprimer', step: 'Étape' },
        de: { title: 'Meine Favoriten', count_one: 'Ort', count_many: 'Orte', empty: 'Noch nichts gespeichert.', emptyHint: 'Tippe auf ❤ um Orte zu speichern — auch offline verfügbar.', clearAll: 'Alle löschen', openBtn: 'Öffnen', removeBtn: 'Entfernen', step: 'Stopp' },
        es: { title: 'Mis Favoritos', count_one: 'sitio', count_many: 'sitios', empty: 'Nada guardado aún.', emptyHint: 'Toca ❤ en las tarjetas para guardar tus sitios favoritos — disponibles sin conexión.', clearAll: 'Limpiar todo', openBtn: 'Ver', removeBtn: 'Quitar', step: 'Parada' },
        zh: { title: '我的收藏', count_one: '个地点', count_many: '个地点', empty: '还没有保存任何内容。', emptyHint: '点击卡片上的 ❤ 来保存您喜爱的地点 — 离线也可访问。', clearAll: '清空', openBtn: '查看', removeBtn: '移除', step: '站' }
    }[lang] || { title: 'My Favourites', count_one: 'place', count_many: 'places', empty: 'Nothing saved yet.', emptyHint: 'Tap ❤ to save your favourite spots.', clearAll: 'Clear all', openBtn: 'Open', removeBtn: 'Remove', step: 'Stop' };

    // Mappa tipo → icona e colori
    const TYPE_MAP = {
        ristorante: { icon: 'restaurant',    bg: 'bg-orange-50',  text: 'text-ct-terracotta' },
        attrazione: { icon: 'attractions',   bg: 'bg-sky-50',     text: 'text-ct-blue' },
        spiaggia:   { icon: 'beach_access',  bg: 'bg-cyan-50',    text: 'text-cyan-600' },
        sentiero:   { icon: 'hiking',        bg: 'bg-lime-50',    text: 'text-ct-green' },
        vino:       { icon: 'wine_bar',      bg: 'bg-red-50',     text: 'text-red-500' },
        prodotto:   { icon: 'eco',           bg: 'bg-green-50',   text: 'text-green-600' }
    };

    const countLabel = items.length === 1 ? `1 ${L.count_one}` : `${items.length} ${L.count_many}`;

    let html = `<div class="animate-fade pb-20">
        <!-- Header -->
        <div class="flex items-start justify-between mb-6 pt-2">
            <div>
                <h2 class="font-serif text-3xl font-bold text-slate-800 leading-tight">
                    <span class="text-rose-400">❤</span> ${L.title}
                </h2>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1.5">${countLabel}</p>
            </div>
            ${items.length > 0 ? `<button
                onclick="window._clearWishlist()"
                class="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 rounded-xl
                       hover:bg-rose-50 hover:text-rose-500 active:scale-95 transition-all touch-manipulation
                       border border-transparent hover:border-rose-100 -webkit-tap-highlight-color: transparent">
                ${L.clearAll}
            </button>` : ''}
        </div>`;

    if (items.length === 0) {
        html += `<div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 border-2 border-rose-100">
                <span class="material-icons text-5xl text-rose-200">favorite_border</span>
            </div>
            <p class="font-bold text-slate-600 text-lg mb-2">${L.empty}</p>
            <p class="text-sm text-slate-400 max-w-xs leading-relaxed">${L.emptyHint}</p>
        </div>`;
    } else {
        html += `<div class="flex flex-col gap-2.5">`;

        items.forEach(item => {
            const t = TYPE_MAP[item.wl_type] || { icon: 'place', bg: 'bg-slate-50', text: 'text-slate-500' };
            // Genera onclick sicuro: payload potrebbe già essere encoded, oppure è un id semplice
            const hasModal = item.wl_modal_type && item.wl_modal_payload;

            html += `<div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3.5 animate-pop wl-item-card" data-wl-id="${item.wl_id}">
                <!-- Icona tipo -->
                <div class="w-12 h-12 rounded-xl ${t.bg} flex items-center justify-center shrink-0">
                    <span class="material-icons ${t.text} text-xl">${t.icon}</span>
                </div>
                <!-- Testo -->
                <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-slate-800 text-sm leading-snug truncate">${item.wl_name}</h3>
                    <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wide truncate mt-0.5">${item.wl_sub || ''}</p>
                </div>
                <!-- Azioni -->
                <div class="flex items-center gap-2 shrink-0">
                    ${hasModal ? `<button
                        onclick="window._openWlModal('${item.wl_modal_type}', '${item.wl_modal_payload}')"
                        class="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center active:scale-90 transition-all touch-manipulation"
                        aria-label="${L.openBtn}">
                        <span class="material-icons text-ct-blue text-base">open_in_new</span>
                    </button>` : ''}
                    <button
                        onclick="window._removeWlItem('${item.wl_id}', this)"
                        class="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center active:scale-90 transition-all touch-manipulation"
                        aria-label="${L.removeBtn}">
                        <span class="material-icons text-rose-400 text-base">favorite</span>
                    </button>
                </div>
            </div>`;
        });

        html += `</div>`;
    }

    html += `</div>`;
    content.innerHTML = html;
};

// Helper: svuota wishlist CON CONFERMA
window._clearWishlist = function() {
    window._showConfirmDialog(
        window.t('confirm_clear_title') || 'Sei sicuro?',
        window.t('confirm_clear_wishlist') || 'Tutti i preferiti verranno rimossi.',
        function() {
            localStorage.removeItem(window.WL._key);
            window.renderWishlist();
            window._updateHomeBadges();
        }
    );
};

// Helper: rimuove singolo item con slide-out animation
window._removeWlItem = function(id, btn) {
    const card = btn.closest('.wl-item-card');
    if (card) {
        card.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateX(50px)';
    }
    setTimeout(() => {
        window.WL.remove(id);
        // Aggiorna anche eventuali cuori visibili nelle card sotto stante
        document.querySelectorAll(`[data-wl-id="${id}"]`).forEach(el => {
            if (el.classList.contains('wl-heart-btn')) {
                // Ripristina stato non-attivo
                const icon    = el.querySelector('.material-icons');
                const wrapper = el.querySelector('.h-11');
                const label   = el.querySelector('span:last-child');
                el.classList.remove('wl-active');
                if (icon)    { icon.textContent = 'favorite_border'; icon.classList.replace('text-rose-500', 'text-slate-400'); }
                if (wrapper) { wrapper.classList.remove('bg-rose-50', 'border-rose-100'); wrapper.classList.add('bg-slate-50', 'border-slate-200'); }
                if (label)   { if (label.classList.contains('text-rose-400')) label.classList.replace('text-rose-400', 'text-slate-400'); }
            }
        });
        window.renderWishlist();
        window._updateHomeBadges();
    }, 230);
};

// Helper: apre modal dalla wishlist
window._openWlModal = function(modalType, payload) {
    if (typeof window.openModal === 'function') window.openModal(modalType, payload);
};



// ═══════════════════════════════════════════════════════════════════════════
//  CINQUE TERRE CARD (SECONDARIO)
//
//  Pagina informativa sulla tessera del Parco Nazionale delle Cinque Terre.
//  Include:
//    - Spiegazione di cosa include la card (sentieri, bus, WiFi, ecc.)
//    - Calendario interattivo con fasce di prezzo (A=bassa, B=media, C=alta)
//    - Simulatore prezzo: scegli durata, data, tipo viaggiatore → prezzo stimato
//
//  8a. renderCinqueTerreCard() → Pagina principale con info e simulatore
//  8b. Calendario fasce        → Dataset dal PDF ufficiale PN5T 2026
//  8c. Simulatore prezzo       → Calcolo basato su durata × fascia × tipologia
//
//  Chiamata da: app.js → switchView('ct_card')
//  Dipendenze: data-logic.js → window.t(), window.currentLang
// ═══════════════════════════════════════════════════════════════════════════
window.renderCinqueTerreCard = function() {
    const content = document.getElementById('app-content');
    if (!content) return;
    const lang = window.currentLang || 'it';

    const L = {
        it: {
            title: 'Cinque Terre Trekking Card', subtitle: 'Tessera ufficiale del Parco Nazionale',
            where_title: 'Dove acquistarla',
            where: ['Infopoint nei 5 borghi', "Stazioni ferroviarie", 'Online sul sito ufficiale'],
            prices_title: 'Tariffe 2026',
            col_standard: 'Standard',
            col_peak: 'Alta Affluenza',
            prices: [
                { label: 'Adulti (12-69) - 1 Giorno', standard: '€ 10,00', peak: '€ 15,00' },
                { label: 'Adulti (12-69) - 2 Giorni', standard: '€ 17,00', peak: '€ 26,70' },
                { label: 'Ragazzi (4-11) - 1 Giorno', standard: '€ 7,00', peak: '€ 10,00' },
                { label: 'Over 70 - 1 Giorno',        standard: '€ 8,50', peak: '€ 12,50' },
                { label: 'Famiglia (2Ad+Rag) - 1G',   standard: '€ 27,10', peak: '€ 40,20' }
            ],
            more_prices: 'Tariffe 3 giorni e gruppi disponibili sul sito ufficiale.',
            peak_dates_title: 'Calendario Alta Affluenza 2026',
            peak_periods: ['3 - 6 Aprile', '25 - 26 Aprile', '1 - 3 Maggio', '9 - 10 Maggio', '14 - 17 Maggio', '23 - 24 Maggio', '30 Maggio - 2 Giugno', '6 - 7 Giugno', '13 - 14 Giugno', '12 - 13 Settembre', '19 - 20 Settembre', '26 - 27 Settembre'],
            included_title: 'Cosa include',
            included: [
                "Accesso al sentiero Verde Azzurro (SVA) Monterosso-Vernazza-Corniglia e alla Via dell'Amore",
                "Visite guidate (Cinque Terre Walking Park da Maggio a Ottobre)",
                "Utilizzo del bus navetta ATC all'interno dei paesi",
                "Ingresso gratuito al CAMeC della Spezia",
                "Ingresso gratuito al Podere Case Lovara (bene FAI)",
                "Uso gratuito dei bagni nelle stazioni ferroviarie (altrimenti €1)",
                "Wi-Fi negli Hot Spot del Parco",
                "Passaporto PN5T",
                "Ingresso ridotto ai Musei Civici della Spezia",
                "Laboratori del CEAS del Parco (secondo programmazione)",
                "Percorsi del Parco Letterario Eugenio Montale"
            ],
            official_site: 'Acquisto Ufficiale'
        },
        en: {
            title: 'Cinque Terre Trekking Card', subtitle: 'Official National Park pass',
            where_title: 'Where to buy',
            where: ['Info points in the 5 villages', 'Train stations', 'Online on the official website'],
            prices_title: '2026 Prices',
            col_standard: 'Standard',
            col_peak: 'Peak Days',
            prices: [
                { label: 'Adults (12-69) - 1 Day', standard: '€ 10.00', peak: '€ 15.00' },
                { label: 'Adults (12-69) - 2 Days', standard: '€ 17.00', peak: '€ 26.70' },
                { label: 'Children (4-11) - 1 Day', standard: '€ 7.00', peak: '€ 10.00' },
                { label: 'Seniors (70+) - 1 Day',   standard: '€ 8.50', peak: '€ 12.50' },
                { label: 'Family (2Ad+Ch) - 1 Day', standard: '€ 27.10', peak: '€ 40.20' }
            ],
            more_prices: '3-day and group rates available on the official website.',
            peak_dates_title: '2026 Peak Days Calendar',
            peak_periods: ['April 3 - 6', 'April 25 - 26', 'May 1 - 3', 'May 9 - 10', 'May 14 - 17', 'May 23 - 24', 'May 30 - June 2', 'June 6 - 7', 'June 13 - 14', 'September 12 - 13', 'September 19 - 20', 'September 26 - 27'],
            included_title: "What's included",
            included: [
                "Access to the Verde Azzurro trail (SVA) Monterosso-Vernazza-Corniglia and Via dell'Amore",
                "Guided tours (Cinque Terre Walking Park, May-October)",
                "ATC shuttle buses within the villages",
                "Free entry to CAMeC in La Spezia",
                "Free entry to Podere Case Lovara (FAI property)",
                "Free use of train station toilets (otherwise €1)",
                "Wi-Fi at Park Hot Spots",
                "PN5T Passport",
                "Reduced entry to La Spezia Civic Museums",
                "Park CEAS workshops (scheduled)",
                "Eugenio Montale Literary Park tours"
            ],
            official_site: 'Official Purchase'
        },
        fr: {
            title: 'Cinque Terre Trekking Card', subtitle: 'Carte officielle du Parc National',
            where_title: "Où l'acheter",
            where: ['Points info dans les 5 villages', 'Gares', 'Sur le site officiel'],
            prices_title: 'Tarifs 2026',
            col_standard: 'Standard',
            col_peak: 'Haute Affluence',
            prices: [
                { label: 'Adultes (12-69) - 1 Jour', standard: '€ 10,00', peak: '€ 15,00' },
                { label: 'Adultes (12-69) - 2 Jours', standard: '€ 17,00', peak: '€ 26,70' },
                { label: 'Enfants (4-11) - 1 Jour',  standard: '€ 7,00', peak: '€ 10,00' },
                { label: 'Seniors (70+) - 1 Jour',   standard: '€ 8,50', peak: '€ 12,50' },
                { label: 'Famille (2Ad+Enf) - 1J',   standard: '€ 27,10', peak: '€ 40,20' }
            ],
            more_prices: 'Tarifs 3 jours et groupes disponibles sur le site officiel.',
            peak_dates_title: 'Calendrier Haute Affluence 2026',
            peak_periods: ['3 - 6 Avril', '25 - 26 Avril', '1 - 3 Mai', '9 - 10 Mai', '14 - 17 Mai', '23 - 24 Mai', '30 Mai - 2 Juin', '6 - 7 Juin', '13 - 14 Juin', '12 - 13 Septembre', '19 - 20 Septembre', '26 - 27 Septembre'],
            included_title: 'Ce qui est inclus',
            included: [
                "Accès au sentier Verde Azzurro (SVA) Monterosso-Vernazza-Corniglia et à la Via dell'Amore",
                "Visites guidées (Cinque Terre Walking Park, Mai-Octobre)",
                "Bus navettes ATC dans les villages",
                "Entrée gratuite au CAMeC de La Spezia",
                "Entrée gratuite au Podere Case Lovara (propriété FAI)",
                "Toilettes gratuites dans les gares (sinon 1€)",
                "Wi-Fi dans les Hot Spots du Parc",
                "Passeport PN5T",
                "Entrée réduite aux Musées Civiques de La Spezia",
                "Ateliers du CEAS du Parc (selon programme)",
                "Parcours du Parc Littéraire Eugenio Montale"
            ],
            official_site: 'Achat Officiel'
        },
        de: {
            title: 'Cinque Terre Trekking Card', subtitle: 'Offizielle Nationalpark-Karte',
            where_title: 'Wo kaufen',
            where: ['Infopunkte in den 5 Dörfern', 'Bahnhöfe', 'Online auf der offiziellen Website'],
            prices_title: 'Preise 2026',
            col_standard: 'Standard',
            col_peak: 'Hochsaison',
            prices: [
                { label: 'Erwachsene (12-69) - 1 Tag', standard: '€ 10,00', peak: '€ 15,00' },
                { label: 'Erwachsene (12-69) - 2 Tage', standard: '€ 17,00', peak: '€ 26,70' },
                { label: 'Kinder (4-11) - 1 Tag',      standard: '€ 7,00', peak: '€ 10,00' },
                { label: 'Senioren (70+) - 1 Tag',     standard: '€ 8,50', peak: '€ 12,50' },
                { label: 'Familie (2Erw+Knd) - 1T',    standard: '€ 27,10', peak: '€ 40,20' }
            ],
            more_prices: '3-Tages- und Gruppenpreise auf der offiziellen Website verfügbar.',
            peak_dates_title: 'Hochsaison-Kalender 2026',
            peak_periods: ['3. - 6. April', '25. - 26. April', '1. - 3. Mai', '9. - 10. Mai', '14. - 17. Mai', '23. - 24. Mai', '30. Mai - 2. Juni', '6. - 7. Juni', '13. - 14. Juni', '12. - 13. September', '19. - 20. September', '26. - 27. September'],
            included_title: 'Was ist inbegriffen',
            included: [
                "Zugang zum Verde Azzurro Weg (SVA) Monterosso-Vernazza-Corniglia und Via dell'Amore",
                "Geführte Touren (Cinque Terre Walking Park, Mai-Okt.)",
                "ATC Shuttle-Busse in den Dörfern",
                "Freier Eintritt ins CAMeC in La Spezia",
                "Freier Eintritt ins Podere Case Lovara (FAI-Eigentum)",
                "Kostenlose Toilettennutzung an den Bahnhöfen (sonst 1€)",
                "WLAN an den Hot Spots des Parks",
                "PN5T Reisepass",
                "Ermäßigter Eintritt in die städtischen Museen von La Spezia",
                "Workshops des CEAS des Parks",
                "Eugenio Montale Literaturpark-Touren"
            ],
            official_site: 'Offizieller Kauf'
        },
        es: {
            title: 'Cinque Terre Trekking Card', subtitle: 'Tarjeta oficial del Parque Nacional',
            where_title: 'Dónde comprarla',
            where: ['Puntos de información en los 5 pueblos', 'Estaciones de tren', 'En la web oficial'],
            prices_title: 'Tarifas 2026',
            col_standard: 'Estándar',
            col_peak: 'Alta Afluencia',
            prices: [
                { label: 'Adultos (12-69) - 1 Día',  standard: '€ 10,00', peak: '€ 15,00' },
                { label: 'Adultos (12-69) - 2 Días', standard: '€ 17,00', peak: '€ 26,70' },
                { label: 'Niños (4-11) - 1 Día',     standard: '€ 7,00', peak: '€ 10,00' },
                { label: 'Mayores (70+) - 1 Día',    standard: '€ 8,50', peak: '€ 12,50' },
                { label: 'Familia (2Ad+Niñ) - 1D',   standard: '€ 27,10', peak: '€ 40,20' }
            ],
            more_prices: 'Tarifas de 3 días y para grupos disponibles en la web oficial.',
            peak_dates_title: 'Calendario Alta Afluencia 2026',
            peak_periods: ['3 - 6 Abril', '25 - 26 Abril', '1 - 3 Mayo', '9 - 10 Mayo', '14 - 17 Mayo', '23 - 24 Mayo', '30 Mayo - 2 Junio', '6 - 7 Junio', '13 - 14 Junio', '12 - 13 Septiembre', '19 - 20 Septiembre', '26 - 27 Septiembre'],
            included_title: 'Qué incluye',
            included: [
                "Acceso al sendero Verde Azzurro (SVA) Monterosso-Vernazza-Corniglia y a la Via dell'Amore",
                "Visitas guiadas (Cinque Terre Walking Park, mayo-octubre)",
                "Autobuses lanzadera ATC en los pueblos",
                "Entrada gratuita al CAMeC de La Spezia",
                "Entrada gratuita al Podere Case Lovara (propiedad FAI)",
                "Uso gratuito de aseos en estaciones de tren (si no, 1€)",
                "Wi-Fi en los Hot Spots del Parque",
                "Pasaporte PN5T",
                "Entrada reducida a los Museos Cívicos de La Spezia",
                "Talleres del CEAS del Parque",
                "Rutas del Parque Literario Eugenio Montale"
            ],
            official_site: 'Compra Oficial'
        },
        zh: {
            title: '五渔村徒步卡 (Trekking Card)', subtitle: '国家公园官方通行证',
            where_title: '购买地点',
            where: ['五个村庄的信息中心', '火车站', '官方网站在线购买'],
            prices_title: '2026年价格',
            col_standard: '标准价',
            col_peak: '旺季价',
            prices: [
                { label: '成人 (12-69) - 1天', standard: '€ 10.00', peak: '€ 15.00' },
                { label: '成人 (12-69) - 2天', standard: '€ 17.00', peak: '€ 26.70' },
                { label: '儿童 (4-11) - 1天',  standard: '€ 7.00', peak: '€ 10.00' },
                { label: '长者 (70+) - 1天',   standard: '€ 8.50', peak: '€ 12.50' },
                { label: '家庭 (2成人+儿童) - 1天', standard: '€ 27.10', peak: '€ 40.20' }
            ],
            more_prices: '3天通票和团体票可在官方网站上查看。',
            peak_dates_title: '2026年旺季日历',
            peak_periods: ['4月3日 - 6日', '4月25日 - 26日', '5月1日 - 3日', '5月9日 - 10日', '5月14日 - 17日', '5月23日 - 24日', '5月30日 - 6月2日', '6月6日 - 7日', '6月13日 - 14日', '9月12日 - 13日', '9月19日 - 20日', '9月26日 - 27日'],
            included_title: '包含内容',
            included: [
                "蓝色小径 (SVA) 蒙特罗索-韦尔纳扎-科尔尼利亚段及爱之路通行证",
                "导游服务（五渔村徒步公园，5月至10月）",
                "村庄内的ATC接驳巴士",
                "免费参观拉斯佩齐亚CAMeC现代艺术中心",
                "免费参观Podere Case Lovara (FAI财产)",
                "免费使用火车站洗手间（原价1欧元）",
                "公园热点区域Wi-Fi",
                "PN5T护照",
                "拉斯佩齐亚市政博物馆折扣门票",
                "公园CEAS工作坊",
                "埃乌杰尼奥·蒙塔莱文学公园路线"
            ],
            official_site: '官方购买'
        }
    }[lang] || L.it;

    content.innerHTML = `<div class="animate-fade pb-20">
        <div class="rounded-3xl overflow-hidden mb-5" style="background: linear-gradient(140deg, #0d3b2e 0%, #1a7a6a 100%);">
            <div class="p-6">
                <div class="flex items-start justify-between mb-3">
                    <span class="material-icons text-4xl text-white/80">card_membership</span>
                    <div class="text-right">
                        <div class="text-[10px] font-black uppercase tracking-widest text-white/50">PARCO NAZIONALE</div>
                        <div class="text-[10px] font-black uppercase tracking-widest text-white/50">CINQUE TERRE</div>
                    </div>
                </div>
                <h2 class="font-serif text-3xl font-bold text-white leading-tight mb-1">${L.title}</h2>
                <p class="text-sm font-bold text-white/55 uppercase tracking-wide">${L.subtitle}</p>
            </div>
            <div class="h-1.5" style="background: linear-gradient(90deg, #E9C46A, #E76F51, #2A9D8F)"></div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-3">
            <h3 class="font-bold text-slate-800 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="material-icons text-ct-terracotta text-base">storefront</span>
                ${L.where_title}
            </h3>
            <ul class="flex flex-col gap-2">
                ${L.where.map(w => `<li class="flex items-start gap-2.5 text-sm text-slate-600">
                    <span class="material-icons text-ct-green text-sm mt-0.5 shrink-0">check_circle</span>
                    <span>${w}</span>
                </li>`).join('')}
            </ul>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-3 overflow-hidden">
            <h3 class="font-bold text-slate-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <span class="material-icons text-amber-500 text-base">sell</span>
                ${L.prices_title}
            </h3>

            <div class="grid grid-cols-12 gap-1 mb-2 px-1 text-[10px] font-black uppercase text-slate-400">
                <div class="col-span-6">Tipologia</div>
                <div class="col-span-3 text-right">${L.col_standard}</div>
                <div class="col-span-3 text-right text-rose-600">${L.col_peak}</div>
            </div>

            <div class="flex flex-col gap-1.5">
                ${L.prices.map(p => `
                <div class="grid grid-cols-12 gap-1 items-center py-2 px-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div class="col-span-6 text-[11px] md:text-xs font-bold text-slate-700 leading-tight">${p.label}</div>
                    <div class="col-span-3 text-right text-xs font-bold text-slate-600">${p.standard}</div>
                    <div class="col-span-3 text-right text-xs font-black text-rose-600">${p.peak}</div>
                </div>`).join('')}
            </div>
            <div class="mt-3 text-[10px] text-slate-400 text-center font-medium">${L.more_prices}</div>
        </div>

        <div class="bg-rose-50 rounded-2xl shadow-sm border border-rose-100 p-5 mb-3">
            <h3 class="font-bold text-rose-800 text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <span class="material-icons text-rose-500 text-base">calendar_month</span>
                ${L.peak_dates_title}
            </h3>
            
            <div class="flex flex-wrap gap-2.5">
                ${L.peak_periods.map(period => `
                <div class="flex items-center gap-1.5 bg-white border border-rose-200 text-rose-700 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-sm">
                    <span class="material-icons text-[14px] text-rose-400">event</span>
                    ${period}
                </div>`).join('')}
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
            <h3 class="font-bold text-slate-800 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="material-icons text-ct-blue text-base">confirmation_number</span>
                ${L.included_title}
            </h3>
            <ul class="flex flex-col gap-2">
                ${L.included.map(i => `<li class="flex items-start gap-2.5 text-sm text-slate-600">
                    <span class="material-icons text-ct-blue text-sm shrink-0 mt-0.5">check</span>
                    <span class="leading-snug">${i}</span>
                </li>`).join('')}
            </ul>
        </div>

        <button
            onclick="window.open('https://card.parconazionale5terre.it/en/cartaparco', '_blank')"
            class="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest text-white active:scale-[0.97] transition-all shadow-md flex items-center justify-center gap-2 touch-manipulation"
            style="background: linear-gradient(135deg, #264653, #2A9D8F)">
            <span class="material-icons text-base">open_in_new</span>
            ${L.official_site}
        </button>
    </div>`;
};

window.renderCinqueTerreTrenoCard = function() {
    const content = document.getElementById('app-content');
    if (!content) return;
    const lang = window.currentLang || 'it';

    const L = {
        it: {
            title: 'Cinque Terre Treno MS', subtitle: 'Tessera ufficiale + Treni Illimitati',
            where_title: 'Dove acquistarla',
            where: ['Infopoint nei borghi', "Stazioni ferroviarie (La Spezia - Levanto)", 'Online sul sito ufficiale'],
            prices_title: 'Tariffe Primavera/Estate 2026',
            prices_subtitle: 'Dal 14 Marzo al 1 Novembre 2026',
            col_type: 'Tipologia',
            col_low: 'Fascia A',
            col_med: 'Fascia B',
            col_high: 'Fascia C',
            prices: [
                { label: 'Adulti (12-69) - 1G', low: '€ 22,00', med: '€ 29,50', high: '€ 35,00' },
                { label: 'Adulti (12-69) - 2G', low: '€ 36,50', med: '€ 51,00', high: '€ 61,00' },
                { label: 'Adulti (12-69) - 3G', low: '€ 49,00', med: '€ 68,00', high: '€ 81,00' },
                { label: 'Ragazzi (4-11) - 1G', low: '€ 15,00', med: '€ 20,00', high: '€ 23,50' },
                { label: 'Ragazzi (4-11) - 2G', low: '€ 24,50', med: '€ 33,50', high: '€ 40,50' },
                { label: 'Over 70 - 1G',        low: '€ 18,50', med: '€ 25,00', high: '€ 29,50' },
                { label: 'Over 70 - 2G',        low: '€ 30,50', med: '€ 42,50', high: '€ 51,00' },
                { label: 'Famiglia (2+1) - 1G', low: '€ 56,50', med: '€ 77,00', high: '€ 91,50' }
            ],
            calendar_title: 'Calendario Fasce 2026',
            calendar_desc: 'La tariffa cambia ogni giorno. Ecco come funziona:',
            cal_a: 'Giorni feriali di bassa stagione (Marzo, tardo Autunno).',
            cal_b: 'Feriali primaverili/estivi e weekend di spalla.',
            cal_c: 'Weekend, festività, ponti e altissima stagione estiva (Luglio-Agosto).',
            btn_calendar: 'Vedi Calendario Esatto',
            winter_title: 'Tariffe Inverno 2026 (2 Nov - 31 Dic)',
            winter_prices: 'Adulti: € 17,30 (1G) / € 29,00 (2G)<br>Ragazzi: € 11,00 (1G) / € 16,70 (2G)<br>Over 70: € 13,70 (1G) / € 21,30 (2G)',
            included_title: 'Cosa include',
            included: [
                "Viaggi illimitati su treni regionali (2° classe) tratta La Spezia - Cinque Terre - Levanto",
                "Accesso al sentiero Verde Azzurro (SVA) e alla Via dell'Amore",
                "Visite guidate (Cinque Terre Walking Park da Maggio a Ottobre)",
                "Utilizzo dei bus navetta all'interno dei paesi",
                "Ingresso gratuito al CAMeC della Spezia",
                "Ingresso gratuito al Podere Case Lovara (FAI)",
                "Uso gratuito dei servizi igienici nelle stazioni (altrimenti €1)",
                "Navigazione internet WI-FI negli Hot Spot del Parco",
                "Passaporto PN5T",
                "Ingresso ridotto ai Musei Civici della Spezia e laboratori CEAS"
            ],
            official_site: 'Acquista Ora'
        },
        en: {
            title: 'Cinque Terre Train Card', subtitle: 'Official Pass + Unlimited Trains',
            where_title: 'Where to buy',
            where: ['Info points in the villages', 'Train stations (La Spezia - Levanto)', 'Online on the official website'],
            prices_title: 'Spring/Summer Prices 2026',
            prices_subtitle: 'From March 14 to Nov 1, 2026',
            col_type: 'Type',
            col_low: 'Band A',
            col_med: 'Band B',
            col_high: 'Band C',
            prices: [
                { label: 'Adults (12-69) - 1D', low: '€ 22.00', med: '€ 29.50', high: '€ 35.00' },
                { label: 'Adults (12-69) - 2D', low: '€ 36.50', med: '€ 51.00', high: '€ 61.00' },
                { label: 'Adults (12-69) - 3D', low: '€ 49.00', med: '€ 68.00', high: '€ 81.00' },
                { label: 'Children (4-11) - 1D', low: '€ 15.00', med: '€ 20.00', high: '€ 23.50' },
                { label: 'Children (4-11) - 2D', low: '€ 24.50', med: '€ 33.50', high: '€ 40.50' },
                { label: 'Over 70 - 1D',         low: '€ 18.50', med: '€ 25.00', high: '€ 29.50' },
                { label: 'Over 70 - 2D',         low: '€ 30.50', med: '€ 42.50', high: '€ 51.00' },
                { label: 'Family (2+1) - 1D',    low: '€ 56.50', med: '€ 77.00', high: '€ 91.50' }
            ],
            calendar_title: '2026 Bands Calendar',
            calendar_desc: 'Rates change daily. Here is how it works:',
            cal_a: 'Low season weekdays (March, late Autumn).',
            cal_b: 'Spring/Summer weekdays and mid-season weekends.',
            cal_c: 'Weekends, holidays, and peak summer season (July-August).',
            btn_calendar: 'View Exact Calendar',
            winter_title: 'Winter Prices 2026 (Nov 2 - Dec 31)',
            winter_prices: 'Adults: € 17.30 (1D) / € 29.00 (2D)<br>Children: € 11.00 (1D) / € 16.70 (2D)<br>Over 70: € 13.70 (1D) / € 21.30 (2D)',
            included_title: "What's included",
            included: [
                "Unlimited travel on regional trains (2nd class) La Spezia - Cinque Terre - Levanto",
                "Access to the Verde Azzurro trail (SVA) and Via dell'Amore",
                "Guided tours (Cinque Terre Walking Park, May-October)",
                "Shuttle buses within the villages",
                "Free entry to CAMeC in La Spezia",
                "Free entry to Podere Case Lovara (FAI)",
                "Free use of train station toilets (otherwise €1)",
                "Wi-Fi at Park Hot Spots",
                "PN5T Passport",
                "Reduced entry to La Spezia Museums and CEAS workshops"
            ],
            official_site: 'Buy Now'
        },
        fr: {
            title: 'Cinque Terre Train Card', subtitle: 'Pass Officiel + Trains Illimités',
            where_title: "Où l'acheter",
            where: ['Points info dans les villages', 'Gares (La Spezia - Levanto)', 'Sur le site officiel'],
            prices_title: 'Tarifs Printemps/Été 2026',
            prices_subtitle: 'Du 14 Mars au 1 Nov 2026',
            col_type: 'Type',
            col_low: 'Bande A',
            col_med: 'Bande B',
            col_high: 'Bande C',
            prices: [
                { label: 'Adultes (12-69) - 1J', low: '€ 22,00', med: '€ 29,50', high: '€ 35,00' },
                { label: 'Adultes (12-69) - 2J', low: '€ 36,50', med: '€ 51,00', high: '€ 61,00' },
                { label: 'Adultes (12-69) - 3J', low: '€ 49,00', med: '€ 68,00', high: '€ 81,00' },
                { label: 'Enfants (4-11) - 1J',  low: '€ 15,00', med: '€ 20,00', high: '€ 23,50' },
                { label: 'Enfants (4-11) - 2J',  low: '€ 24,50', med: '€ 33,50', high: '€ 40,50' },
                { label: 'Seniors (70+) - 1J',   low: '€ 18,50', med: '€ 25,00', high: '€ 29,50' },
                { label: 'Seniors (70+) - 2J',   low: '€ 30,50', med: '€ 42,50', high: '€ 51,00' },
                { label: 'Famille (2+1) - 1J',   low: '€ 56,50', med: '€ 77,00', high: '€ 91,50' }
            ],
            calendar_title: 'Calendrier des Bandes 2026',
            calendar_desc: 'Le tarif change chaque jour. Voici comment :',
            cal_a: 'Jours de semaine en basse saison (Mars, fin d\'Automne).',
            cal_b: 'Jours de semaine au Printemps/Été et week-ends de mi-saison.',
            cal_c: 'Week-ends, jours fériés et haute saison estivale (Juillet-Août).',
            btn_calendar: 'Voir le Calendrier Exact',
            winter_title: 'Tarifs Hiver 2026 (2 Nov - 31 Déc)',
            winter_prices: 'Adultes: € 17,30 (1J) / € 29,00 (2J)<br>Enfants: € 11,00 (1J) / € 16,70 (2J)<br>Seniors: € 13,70 (1J) / € 21,30 (2J)',
            included_title: 'Ce qui est inclus',
            included: [
                "Voyages illimités en trains régionaux (2ème cl.) La Spezia - Cinque Terre - Levanto",
                "Accès au sentier Verde Azzurro (SVA) et à la Via dell'Amore",
                "Visites guidées (Cinque Terre Walking Park, Mai-Oct)",
                "Bus navettes dans les villages",
                "Entrée gratuite au CAMeC de La Spezia",
                "Entrée gratuite au Podere Case Lovara (FAI)",
                "Toilettes gratuites dans les gares (sinon 1€)",
                "Wi-Fi dans les Hot Spots du Parc",
                "Passeport PN5T",
                "Entrée réduite aux Musées de La Spezia"
            ],
            official_site: 'Acheter'
        },
        de: {
            title: 'Cinque Terre Zug-Karte', subtitle: 'Offizieller Pass + Unbegrenzte Züge',
            where_title: 'Wo kaufen',
            where: ['Infopunkte in den Dörfern', 'Bahnhöfe (La Spezia - Levanto)', 'Online auf der offiziellen Website'],
            prices_title: 'Frühling/Sommer Preise 2026',
            prices_subtitle: '14. März - 1. Nov 2026',
            col_type: 'Typ',
            col_low: 'Band A',
            col_med: 'Band B',
            col_high: 'Band C',
            prices: [
                { label: 'Erwachsene (12-69) 1T', low: '€ 22,00', med: '€ 29,50', high: '€ 35,00' },
                { label: 'Erwachsene (12-69) 2T', low: '€ 36,50', med: '€ 51,00', high: '€ 61,00' },
                { label: 'Erwachsene (12-69) 3T', low: '€ 49,00', med: '€ 68,00', high: '€ 81,00' },
                { label: 'Kinder (4-11) - 1T',    low: '€ 15,00', med: '€ 20,00', high: '€ 23,50' },
                { label: 'Kinder (4-11) - 2T',    low: '€ 24,50', med: '€ 33,50', high: '€ 40,50' },
                { label: 'Senioren (70+) - 1T',   low: '€ 18,50', med: '€ 25,00', high: '€ 29,50' },
                { label: 'Familie (2+1) - 1T',    low: '€ 56,50', med: '€ 77,00', high: '€ 91,50' }
            ],
            calendar_title: 'Kalender der Bänder 2026',
            calendar_desc: 'Die Rate ändert sich täglich. So funktioniert es:',
            cal_a: 'Wochentage in der Nebensaison (März, Spätherbst).',
            cal_b: 'Frühling/Sommer Wochentage und Zwischensaison-Wochenenden.',
            cal_c: 'Wochenenden, Feiertage und Hochsommer (Juli-August).',
            btn_calendar: 'Genauen Kalender Ansehen',
            winter_title: 'Winterpreise 2026 (2. Nov - 31. Dez)',
            winter_prices: 'Erwachsene: € 17,30 (1T) / € 29,00 (2T)<br>Kinder: € 11,00 (1T) / € 16,70 (2T)<br>Senioren: € 13,70 (1T) / € 21,30 (2T)',
            included_title: 'Was ist inbegriffen',
            included: [
                "Unbegrenzte Fahrten mit Regionalzügen (2. Klasse) La Spezia - Cinque Terre - Levanto",
                "Zugang zum Verde Azzurro Weg (SVA) und Via dell'Amore",
                "Geführte Touren (Cinque Terre Walking Park)",
                "Shuttle-Busse in den Dörfern",
                "Freier Eintritt ins CAMeC (La Spezia)",
                "Kostenlose Toilettennutzung an Bahnhöfen (sonst 1€)",
                "WLAN an Hot Spots",
                "PN5T Reisepass"
            ],
            official_site: 'Jetzt Kaufen'
        },
        es: {
            title: 'Cinque Terre Train Card', subtitle: 'Pase Oficial + Trenes Ilimitados',
            where_title: 'Dónde comprarla',
            where: ['Puntos de info en los pueblos', 'Estaciones (La Spezia - Levanto)', 'Web oficial'],
            prices_title: 'Tarifas Primavera/Verano 2026',
            prices_subtitle: 'Del 14 de marzo al 1 de nov 2026',
            col_type: 'Tipo',
            col_low: 'Banda A',
            col_med: 'Banda B',
            col_high: 'Banda C',
            prices: [
                { label: 'Adultos (12-69) - 1D', low: '€ 22,00', med: '€ 29,50', high: '€ 35,00' },
                { label: 'Adultos (12-69) - 2D', low: '€ 36,50', med: '€ 51,00', high: '€ 61,00' },
                { label: 'Adultos (12-69) - 3D', low: '€ 49,00', med: '€ 68,00', high: '€ 81,00' },
                { label: 'Niños (4-11) - 1D',    low: '€ 15,00', med: '€ 20,00', high: '€ 23,50' },
                { label: 'Niños (4-11) - 2D',    low: '€ 24,50', med: '€ 33,50', high: '€ 40,50' },
                { label: 'Mayores (70+) - 1D',   low: '€ 18,50', med: '€ 25,00', high: '€ 29,50' },
                { label: 'Familia (2+1) - 1D',   low: '€ 56,50', med: '€ 77,00', high: '€ 91,50' }
            ],
            calendar_title: 'Calendario Bandas 2026',
            calendar_desc: 'La tarifa cambia cada día. Así funciona:',
            cal_a: 'Días laborables en temporada baja (marzo, finales de otoño).',
            cal_b: 'Días laborables en primavera/verano y fines de semana de temporada media.',
            cal_c: 'Fines de semana, festivos y temporada altísima de verano (julio-agosto).',
            btn_calendar: 'Ver Calendario Exacto',
            winter_title: 'Tarifas Invierno 2026 (2 Nov - 31 Dic)',
            winter_prices: 'Adultos: € 17,30 (1D) / € 29,00 (2D)<br>Niños: € 11,00 (1D) / € 16,70 (2D)<br>Mayores: € 13,70 (1D)',
            included_title: 'Qué incluye',
            included: [
                "Viajes ilimitados en trenes regionales (2ª clase) La Spezia - Cinque Terre - Levanto",
                "Acceso al sendero Verde Azzurro (SVA) y Via dell'Amore",
                "Visitas guiadas (Cinque Terre Walking Park)",
                "Autobuses lanzadera en los pueblos",
                "Uso gratuito de aseos en estaciones (si no, 1€)",
                "Wi-Fi en Hot Spots del Parque",
                "Pasaporte PN5T"
            ],
            official_site: 'Comprar Ahora'
        },
        zh: {
            title: '五渔村火车卡 (Train Card)', subtitle: '官方通行证 + 无限次火车',
            where_title: '购买地点',
            where: ['村庄信息中心', '火车站 (拉斯佩齐亚 - 莱万托)', '官方网站'],
            prices_title: '2026 春夏价格',
            prices_subtitle: '2026年3月14日至11月1日',
            col_type: '类型',
            col_low: 'A档',
            col_med: 'B档',
            col_high: 'C档',
            prices: [
                { label: '成人 (12-69) - 1天', low: '€ 22.00', med: '€ 29.50', high: '€ 35.00' },
                { label: '成人 (12-69) - 2天', low: '€ 36.50', med: '€ 51.00', high: '€ 61.00' },
                { label: '成人 (12-69) - 3天', low: '€ 49.00', med: '€ 68.00', high: '€ 81.00' },
                { label: '儿童 (4-11) - 1天',  low: '€ 15.00', med: '€ 20.00', high: '€ 23.50' },
                { label: '儿童 (4-11) - 2天',  low: '€ 24.50', med: '€ 33.50', high: '€ 40.50' },
                { label: '长者 (70+) - 1天',   low: '€ 18.50', med: '€ 25.00', high: '€ 29.50' },
                { label: '家庭 (2大1小) - 1天', low: '€ 56.50', med: '€ 77.00', high: '€ 91.50' }
            ],
            calendar_title: '2026 档期日历',
            calendar_desc: '费率每天变化。工作原理如下：',
            cal_a: '淡季工作日（3月，深秋）。',
            cal_b: '春夏工作日和中季周末。',
            cal_c: '周末、节假日和夏季旺季（7月至8月）。',
            btn_calendar: '查看准确日历',
            winter_title: '2026 冬季价格 (11月2日 - 12月31日)',
            winter_prices: '成人: € 17.30 (1天) / € 29.00 (2天)<br>儿童: € 11.00 (1天) / € 16.70 (2天)<br>长者: € 13.70 (1天)',
            included_title: '包含内容',
            included: [
                "无限次乘坐区域火车（二等座）拉斯佩齐亚 - 五渔村 - 莱万托",
                "蓝色小径 (SVA) 及爱之路通行证",
                "导游服务（5月至10月）",
                "村庄内接驳巴士",
                "免费使用火车站洗手间（原价1欧元）",
                "热点区域 Wi-Fi",
                "PN5T 护照"
            ],
            official_site: '立即购买'
        }
    }[lang] || L.it;

    content.innerHTML = `<div class="animate-fade pb-20">
        <div class="rounded-3xl overflow-hidden mb-5" style="background: linear-gradient(140deg, #33181c 0%, #be123c 60%, #e11d48 100%);">
            <div class="p-6">
                <div class="flex items-start justify-between mb-3">
                    <span class="material-icons text-4xl text-white/80">train</span>
                    <div class="text-right">
                        <div class="text-[10px] font-black uppercase tracking-widest text-white/50">PARCO NAZIONALE</div>
                        <div class="text-[10px] font-black uppercase tracking-widest text-white/50">CINQUE TERRE</div>
                    </div>
                </div>
                <h2 class="font-serif text-3xl font-bold text-white leading-tight mb-1">${L.title}</h2>
                <p class="text-sm font-bold text-white/55 uppercase tracking-wide">${L.subtitle}</p>
            </div>
            <div class="h-1.5" style="background: linear-gradient(90deg, #fcd34d, #f97316, #e11d48)"></div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-3">
            <h3 class="font-bold text-slate-800 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="material-icons text-sky-600 text-base">storefront</span>
                ${L.where_title}
            </h3>
            <ul class="flex flex-col gap-2">
                ${L.where.map(w => `<li class="flex items-start gap-2.5 text-sm text-slate-600">
                    <span class="material-icons text-sky-600 text-sm mt-0.5 shrink-0">check_circle</span>
                    <span>${w}</span>
                </li>`).join('')}
            </ul>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-3 overflow-hidden">
            <h3 class="font-bold text-slate-800 text-sm uppercase tracking-widest mb-1 flex items-center gap-2">
                <span class="material-icons text-amber-500 text-base">sell</span>
                ${L.prices_title}
            </h3>
            <p class="text-[11px] text-slate-400 font-medium mb-4 ml-6">${L.prices_subtitle}</p>

            <div class="grid grid-cols-12 gap-1 mb-2 px-1 text-[9px] font-black uppercase text-slate-400">
                <div class="col-span-5">${L.col_type}</div>
                <div class="col-span-2 text-right text-emerald-600">${L.col_low}</div>
                <div class="col-span-2 text-right text-amber-500">${L.col_med}</div>
                <div class="col-span-3 text-right" style="color: #be123c;">${L.col_high}</div>
            </div>

            <div class="flex flex-col gap-1.5">
                ${L.prices.map(p => `
                <div class="grid grid-cols-12 gap-1 items-center py-2 px-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div class="col-span-5 text-[10px] md:text-[11px] font-bold text-slate-700 leading-tight">${p.label}</div>
                    <div class="col-span-2 text-right text-[10px] font-bold text-emerald-600">${p.low}</div>
                    <div class="col-span-2 text-right text-[10px] font-bold text-amber-600">${p.med}</div>
                    <div class="col-span-3 text-right text-[11px] font-black" style="color: #be123c;">${p.high}</div>
                </div>`).join('')}
            </div>
        </div>

        <!-- ═══ CALENDARIO & SIMULATORE PREZZO (unificati) ═══ -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-3">
            <h3 class="font-bold text-slate-800 text-sm uppercase tracking-widest mb-1 flex items-center gap-2">
                <span class="material-icons text-rose-500 text-base">calculate</span>
                ${window.t('ct_sim_title')}
            </h3>
            <p class="text-[11px] text-slate-500 mb-4">${window.t('ct_sim_subtitle')}</p>

            <!-- Step 1: Card duration pills -->
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span class="w-4 h-4 rounded-full bg-slate-800 text-white text-[9px] font-black flex items-center justify-center shrink-0">1</span>
                ${window.t('ct_sim_step1')}
            </p>
            <div class="flex gap-2 mb-4">
                <button class="ct-sim-pill flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all active:scale-95 touch-manipulation bg-ct-blue text-white shadow-md" data-days="1" onclick="window._ctSimSwitchCard(1)">
                    1 ${window.t('ct_sim_day')}
                </button>
                <button class="ct-sim-pill flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all active:scale-95 touch-manipulation bg-slate-100 text-slate-600" data-days="2" onclick="window._ctSimSwitchCard(2)">
                    2 ${window.t('ct_sim_days')}
                </button>
                <button class="ct-sim-pill flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all active:scale-95 touch-manipulation bg-slate-100 text-slate-600" data-days="3" onclick="window._ctSimSwitchCard(3)">
                    3 ${window.t('ct_sim_days')}
                </button>
            </div>

            <!-- Step 2: Calendario inline -->
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span class="w-4 h-4 rounded-full bg-slate-800 text-white text-[9px] font-black flex items-center justify-center shrink-0">2</span>
                ${window.t('ct_sim_step2')}
            </p>

            <!-- Legenda fasce compatta -->
            <div class="flex items-center gap-3 mb-3 text-[10px]">
                <div class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span class="text-slate-500 font-bold">A</span></div>
                <div class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span class="text-slate-500 font-bold">B</span></div>
                <div class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full" style="background:#e11d48;"></span><span class="text-slate-500 font-bold">C</span></div>
                <span class="text-slate-300">|</span>
                <div class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full border-2 border-slate-300 bg-transparent"></span><span class="text-slate-400">${window.t('ct_sim_today')}</span></div>
            </div>

            <button onclick="window._toggleCTCalendar()" 
                class="w-full py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                id="ct-calendar-toggle-btn">
                <span class="material-icons text-[16px] text-slate-500" id="ct-calendar-toggle-icon">expand_more</span>
                ${L.btn_calendar}
            </button>

            <!-- Calendario interattivo inline (hidden by default) -->
            <div id="ct-calendar-container" class="hidden mt-3"></div>

            <!-- Step 3: Buyer panel (hidden until date selected) -->
            <div id="ct-sim-buyer-panel" class="hidden mt-4">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <span class="w-4 h-4 rounded-full bg-slate-800 text-white text-[9px] font-black flex items-center justify-center shrink-0">3</span>
                    ${window.t('ct_sim_step3')}
                </p>
            </div>

            <!-- Result (hidden until buyer selected) -->
            <div id="ct-sim-result" class="hidden mt-3"></div>
        </div>

        <!-- Legenda fasce dettagliata (collassabile, fuori dal simulatore) -->
        <details class="bg-slate-50 rounded-2xl shadow-sm border border-slate-100 mb-3">
            <summary class="p-4 flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-500 uppercase tracking-widest select-none">
                <span class="material-icons text-slate-400 text-[16px]">help_outline</span>
                ${L.calendar_title}
            </summary>
            <div class="px-5 pb-4 flex flex-col gap-2.5">
                <p class="text-[11px] text-slate-500 leading-relaxed">${L.calendar_desc}</p>
                <div class="flex items-start gap-2.5">
                    <div class="w-3 h-3 rounded-full bg-emerald-500 shrink-0 mt-0.5"></div>
                    <div class="text-[11px] text-slate-600 leading-tight"><strong class="text-emerald-700">A:</strong> ${L.cal_a}</div>
                </div>
                <div class="flex items-start gap-2.5">
                    <div class="w-3 h-3 rounded-full bg-amber-400 shrink-0 mt-0.5"></div>
                    <div class="text-[11px] text-slate-600 leading-tight"><strong class="text-amber-600">B:</strong> ${L.cal_b}</div>
                </div>
                <div class="flex items-start gap-2.5">
                    <div class="w-3 h-3 rounded-full shrink-0 mt-0.5" style="background-color: #e11d48;"></div>
                    <div class="text-[11px] text-slate-600 leading-tight"><strong style="color: #be123c;">C:</strong> ${L.cal_c}</div>
                </div>
            </div>
        </details>

        <div class="bg-sky-50 rounded-2xl shadow-sm border border-sky-100 p-5 mb-3">
            <h3 class="font-bold text-sky-800 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="material-icons text-sky-500 text-[16px]">ac_unit</span>
                ${L.winter_title}
            </h3>
            <p class="text-[11px] text-sky-700 leading-relaxed font-medium">${L.winter_prices}</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-4">
            <h3 class="font-bold text-slate-800 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="material-icons text-sky-600 text-base">confirmation_number</span>
                ${L.included_title}
            </h3>
            <ul class="flex flex-col gap-2">
                ${L.included.map(i => `<li class="flex items-start gap-2.5 text-sm text-slate-600">
                    <span class="material-icons text-sky-600 text-sm shrink-0 mt-0.5">check</span>
                    <span class="leading-snug">${i}</span>
                </li>`).join('')}
            </ul>
        </div>

        <button
            onclick="window.open('https://card.parconazionale5terre.it/en/cartatreno', '_blank')"
            class="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest text-white active:scale-[0.97] transition-all shadow-md flex items-center justify-center gap-2 touch-manipulation mb-2"
            style="background: linear-gradient(135deg, #33181c 0%, #be123c 60%, #e11d48 100%)">
            <span class="material-icons text-base">shopping_cart</span>
            ${L.official_site}
        </button>
    </div>`;
};

// ───────────────────────────────────────────────────────────────────────
//  CALENDARIO FASCE CT CARD (TERZIARIO)
//  Dataset dal PDF ufficiale PN5T 2026. Periodo: 14 marzo - 1 novembre.
//  Ogni giorno ha una fascia: A (verde/bassa), B (giallo/media), C (rosso/alta).
//  Usato dal simulatore prezzo per calcolare il costo in base alla data scelta.
// ───────────────────────────────────────────────────────────────────────

(function() {
    // Default = A (verde). Override solo B e C.
    // Fonte: mappatura manuale da PDF ufficiale PN5T 2026.

    // ── MS 1 GIORNO ──
    const _B1 = new Set(['2026-04-02','2026-04-03','2026-04-07','2026-04-08','2026-04-09','2026-04-10','2026-04-11','2026-04-12','2026-04-18','2026-04-19','2026-04-24','2026-04-27','2026-04-28','2026-04-29','2026-04-30','2026-05-08','2026-05-09','2026-05-10','2026-05-15','2026-05-16','2026-05-17','2026-05-22','2026-05-23','2026-05-24','2026-05-29','2026-06-03','2026-06-04','2026-06-06','2026-06-07','2026-06-08','2026-06-09','2026-06-10','2026-06-11','2026-06-12','2026-06-13','2026-06-14','2026-06-15','2026-06-16','2026-06-17','2026-06-18','2026-06-19','2026-06-20','2026-06-21','2026-06-22','2026-06-23','2026-06-24','2026-06-25','2026-06-26','2026-06-29','2026-06-30','2026-07-01','2026-07-02','2026-07-03','2026-07-06','2026-07-07','2026-07-08','2026-07-09','2026-07-10','2026-07-13','2026-07-14','2026-07-15','2026-07-16','2026-07-17','2026-07-20','2026-07-21','2026-07-22','2026-07-23','2026-07-24','2026-07-28','2026-07-29','2026-07-30','2026-07-31','2026-08-03','2026-08-04','2026-08-05','2026-08-06','2026-08-07','2026-08-10','2026-08-11','2026-08-12','2026-08-13','2026-08-17','2026-08-18','2026-08-19','2026-08-20','2026-08-21','2026-08-24','2026-08-25','2026-08-26','2026-08-27','2026-08-28','2026-08-31','2026-09-01','2026-09-02','2026-09-03','2026-09-04','2026-09-05','2026-09-06','2026-09-07','2026-09-08','2026-09-09','2026-09-10','2026-09-11','2026-09-12','2026-09-13','2026-09-14','2026-09-15','2026-09-16','2026-09-17','2026-09-18','2026-09-19','2026-09-20','2026-09-21','2026-09-22','2026-09-23','2026-09-24','2026-09-25','2026-09-26','2026-09-27','2026-09-28','2026-09-29','2026-09-30','2026-10-03','2026-10-04','2026-10-05','2026-10-10','2026-10-11','2026-10-30','2026-10-31','2026-11-01']);
    const _C1 = new Set(['2026-04-04','2026-04-05','2026-04-06','2026-04-25','2026-04-26','2026-05-01','2026-05-02','2026-05-03','2026-05-30','2026-05-31','2026-06-01','2026-06-02','2026-06-05','2026-06-27','2026-06-28','2026-07-04','2026-07-05','2026-07-11','2026-07-12','2026-07-18','2026-07-19','2026-07-25','2026-07-26','2026-07-27','2026-08-01','2026-08-02','2026-08-08','2026-08-09','2026-08-14','2026-08-15','2026-08-16','2026-08-22','2026-08-23','2026-08-29','2026-08-30']);

    // ── MS 2 GIORNI ──
    const _B2 = new Set(['2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10','2026-04-11','2026-04-18','2026-04-24','2026-04-26','2026-04-27','2026-04-28','2026-04-29','2026-04-30','2026-05-08','2026-05-09','2026-05-15','2026-05-16','2026-05-22','2026-05-23','2026-05-29','2026-06-02','2026-06-03','2026-06-04','2026-06-05','2026-06-06','2026-06-07','2026-06-08','2026-06-09','2026-06-10','2026-06-11','2026-06-12','2026-06-13','2026-06-14','2026-06-15','2026-06-16','2026-06-17','2026-06-18','2026-06-19','2026-06-20','2026-06-21','2026-06-22','2026-06-23','2026-06-24','2026-06-25','2026-06-26','2026-06-28','2026-06-29','2026-06-30','2026-07-01','2026-07-02','2026-07-03','2026-07-05','2026-07-06','2026-07-07','2026-07-08','2026-07-09','2026-07-10','2026-07-12','2026-07-13','2026-07-14','2026-07-15','2026-07-16','2026-07-17','2026-07-19','2026-07-20','2026-07-21','2026-07-22','2026-07-23','2026-07-24','2026-07-27','2026-07-28','2026-07-29','2026-07-30','2026-07-31','2026-08-02','2026-08-03','2026-08-04','2026-08-05','2026-08-06','2026-08-07','2026-08-09','2026-08-10','2026-08-11','2026-08-12','2026-08-13','2026-08-16','2026-08-17','2026-08-18','2026-08-19','2026-08-20','2026-08-21','2026-08-23','2026-08-24','2026-08-25','2026-08-26','2026-08-27','2026-08-28','2026-08-30','2026-08-31','2026-09-01','2026-09-02','2026-09-03','2026-09-04','2026-09-05','2026-09-06','2026-09-07','2026-09-08','2026-09-09','2026-09-10','2026-09-11','2026-09-12','2026-09-13','2026-09-14','2026-09-15','2026-09-16','2026-09-17','2026-09-18','2026-09-19','2026-09-20','2026-09-21','2026-09-22','2026-09-23','2026-09-24','2026-09-25','2026-09-26','2026-10-03','2026-10-04','2026-10-10','2026-10-30','2026-10-31']);
    const _C2 = new Set(['2026-04-04','2026-04-05','2026-04-25','2026-05-01','2026-05-02','2026-05-30','2026-05-31','2026-06-01','2026-06-27','2026-07-04','2026-07-11','2026-07-18','2026-07-25','2026-07-26','2026-08-01','2026-08-08','2026-08-14','2026-08-15','2026-08-22','2026-08-29']);

    // ── MS 3 GIORNI ──
    const _B3 = new Set(['2026-04-01','2026-04-02','2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10','2026-04-11','2026-04-17','2026-04-18','2026-04-23','2026-04-26','2026-04-27','2026-04-28','2026-04-29','2026-05-02','2026-05-07','2026-05-08','2026-05-09','2026-05-14','2026-05-15','2026-05-16','2026-05-21','2026-05-22','2026-05-23','2026-05-28','2026-06-02','2026-06-03','2026-06-04','2026-06-05','2026-06-06','2026-06-07','2026-06-08','2026-06-09','2026-06-10','2026-06-11','2026-06-12','2026-06-13','2026-06-14','2026-06-15','2026-06-16','2026-06-17','2026-06-18','2026-06-19','2026-06-20','2026-06-21','2026-06-22','2026-06-23','2026-06-24','2026-06-25','2026-06-28','2026-06-29','2026-06-30','2026-07-01','2026-07-02','2026-07-05','2026-07-06','2026-07-07','2026-07-08','2026-07-09','2026-07-12','2026-07-13','2026-07-14','2026-07-15','2026-07-16','2026-07-19','2026-07-20','2026-07-21','2026-07-22','2026-07-23','2026-07-27','2026-07-28','2026-07-29','2026-07-30','2026-08-02','2026-08-03','2026-08-04','2026-08-05','2026-08-06','2026-08-09','2026-08-10','2026-08-11','2026-08-12','2026-08-16','2026-08-17','2026-08-18','2026-08-19','2026-08-20','2026-08-23','2026-08-24','2026-08-25','2026-08-26','2026-08-27','2026-08-30','2026-08-31','2026-09-01','2026-09-02','2026-09-03','2026-09-04','2026-09-05','2026-09-06','2026-09-07','2026-09-08','2026-09-09','2026-09-10','2026-09-11','2026-09-12','2026-09-13','2026-09-14','2026-09-15','2026-09-16','2026-09-17','2026-09-18','2026-09-19','2026-09-20','2026-09-21','2026-09-22','2026-09-23','2026-09-24','2026-09-25','2026-09-26','2026-10-02','2026-10-03','2026-10-04','2026-10-09','2026-10-10','2026-10-29','2026-10-30','2026-10-31']);
    const _C3 = new Set(['2026-04-03','2026-04-04','2026-04-05','2026-04-24','2026-04-25','2026-04-30','2026-05-01','2026-05-29','2026-05-30','2026-05-31','2026-06-01','2026-06-26','2026-06-27','2026-07-03','2026-07-04','2026-07-10','2026-07-11','2026-07-17','2026-07-18','2026-07-24','2026-07-25','2026-07-26','2026-07-31','2026-08-01','2026-08-07','2026-08-08','2026-08-13','2026-08-14','2026-08-15','2026-08-21','2026-08-22','2026-08-28','2026-08-29']);

    // Lookup per durata card
    const _BANDS = {
        1: { B: _B1, C: _C1 },
        2: { B: _B2, C: _C2 },
        3: { B: _B3, C: _C3 }
    };

    // Periodo coperto
    const START = new Date(2026, 2, 14); // 14 marzo
    const END   = new Date(2026, 10, 1); // 1 novembre

    /**
     * Restituisce la fascia (A/B/C) per una data ISO e una durata card.
     * @param {string} dateISO  — formato 'YYYY-MM-DD'
     * @param {number} [cardDays=1] — durata card: 1, 2 o 3
     * @returns {'A'|'B'|'C'|null}
     */
    window._getCTBand = function(dateISO, cardDays) {
        const d = new Date(dateISO + 'T00:00:00');
        if (d < START || d > END) return null;
        const sets = _BANDS[cardDays || 1] || _BANDS[1];
        if (sets.C.has(dateISO)) return 'C';
        if (sets.B.has(dateISO)) return 'B';
        return 'A';
    };

    // ── Prezziario MS Card ──
    // Struttura: PRICES[durata][tipologia][fascia] = prezzo in centesimi
    // Centesimi per evitare errori floating point nel calcolo famiglia
    window._CT_PRICES = {
        1: {
            adult:  { A: 2200, B: 2950, C: 3500 },
            child:  { A: 1500, B: 2000, C: 2350 },
            senior: { A: 1850, B: 2500, C: 2950 },
            family: { A: 5650, B: 7700, C: 9150 }
        },
        2: {
            adult:  { A: 3650, B: 5100, C: 6100 },
            child:  { A: 2450, B: 3350, C: 4050 },
            senior: { A: 3050, B: 4250, C: 5100 },
            family: { A: 9400, B: 13200, C: 15900 }
        },
        3: {
            adult:  { A: 4900, B: 6800, C: 8100 },
            child:  { A: 3300, B: 4450, C: 5350 },
            senior: { A: 4100, B: 5600, C: 6750 },
            family: { A: 12550, B: 17500, C: 21050 }
        }
    };
})();

// Mesi localizzati per il calendario
const _CT_CAL_MONTHS = {
    it: ['Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre'],
    en: ['March','April','May','June','July','August','September','October','November'],
    fr: ['Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre'],
    de: ['März','April','Mai','Juni','Juli','August','September','Oktober','November'],
    es: ['Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre'],
    zh: ['三月','四月','五月','六月','七月','八月','九月','十月','十一月']
};
const _CT_CAL_DAYS = {
    it: ['L','M','M','G','V','S','D'],
    en: ['M','T','W','T','F','S','S'],
    fr: ['L','M','M','J','V','S','D'],
    de: ['M','D','M','D','F','S','S'],
    es: ['L','M','X','J','V','S','D'],
    zh: ['一','二','三','四','五','六','日']
};

// Stato calendario e simulatore
window._ctCalMonth = null; // indice 0=marzo, 1=aprile...
window._ctSimCardDays = 1; // durata card selezionata (1/2/3)
window._ctSimSelectedDate = null; // data ISO selezionata
window._ctSimBuyerType = null; // 'adult','child','senior','family'
window._ctSimExtraKids = 0; // ragazzi extra oltre il primo (solo per family)

/** Toggle apertura/chiusura calendario */
window._toggleCTCalendar = function() {
    const container = document.getElementById('ct-calendar-container');
    const icon      = document.getElementById('ct-calendar-toggle-icon');
    if (!container) return;

    if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        if (icon) icon.textContent = 'expand_less';
        // Inizia dal mese corrente se nel range, altrimenti aprile
        const now   = new Date();
        const month = now.getMonth(); // 0-indexed
        if (month >= 2 && month <= 10) { // marzo(2) - novembre(10)
            window._ctCalMonth = month - 2; // indice interno (0=marzo)
        } else {
            window._ctCalMonth = 1; // aprile come default
        }
        window._renderCTCalendar();
        setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    } else {
        container.classList.add('hidden');
        if (icon) icon.textContent = 'expand_more';
    }
};

/** Render del calendario per il mese corrente */
window._renderCTCalendar = function() {
    const container = document.getElementById('ct-calendar-container');
    if (!container) return;

    const lang   = window.currentLang || 'it';
    const idx    = window._ctCalMonth;
    const months = _CT_CAL_MONTHS[lang] || _CT_CAL_MONTHS.en;
    const days   = _CT_CAL_DAYS[lang]   || _CT_CAL_DAYS.en;
    const cardDays = window._ctSimCardDays || 1;

    // Mese reale: marzo=2 + idx
    const realMonth = 2 + idx; // 0-indexed JS (2=marzo, 3=aprile, ...)
    const year      = 2026;
    const firstDay  = new Date(year, realMonth, 1).getDay(); // 0=dom
    const mondayStart = (firstDay + 6) % 7; // 0=lunedì
    const daysInMonth = new Date(year, realMonth + 1, 0).getDate();

    // Calcola il set di date selezionate (range dal giorno di partenza in avanti)
    const selectedRange = new Set();
    if (window._ctSimSelectedDate) {
        const startD = new Date(window._ctSimSelectedDate + 'T12:00:00'); // mezzogiorno evita ambiguità timezone
        for (let i = 0; i < cardDays; i++) {
            const rd = new Date(startD);
            rd.setDate(rd.getDate() + i);
            // Costruisci ISO manualmente per evitare shift UTC
            const rISO = `${rd.getFullYear()}-${String(rd.getMonth()+1).padStart(2,'0')}-${String(rd.getDate()).padStart(2,'0')}`;
            selectedRange.add(rISO);
        }
    }

    // Griglia celle
    let cells = '';
    for (let i = 0; i < mondayStart; i++) {
        cells += `<div class="w-full aspect-square"></div>`;
    }

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const END_ISO = '2026-11-01';

    for (let d = 1; d <= daysInMonth; d++) {
        const iso = `${year}-${String(realMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const band = window._getCTBand(iso, cardDays); // Colore specifico per la durata selezionata
        const isToday = iso === today;
        const isInRange = selectedRange.has(iso);
        const isStart = iso === window._ctSimSelectedDate;

        // Check se il giorno ha abbastanza giorni successivi nel periodo
        let canSelect = band !== null;
        if (canSelect && cardDays > 1) {
            const checkD = new Date(iso + 'T12:00:00');
            for (let i = 1; i < cardDays; i++) {
                const nextD = new Date(checkD);
                nextD.setDate(nextD.getDate() + i);
                const nextISO = `${nextD.getFullYear()}-${String(nextD.getMonth()+1).padStart(2,'0')}-${String(nextD.getDate()).padStart(2,'0')}`;
                if (window._getCTBand(nextISO, cardDays) === null) {
                    canSelect = false;
                    break;
                }
            }
        }

        let bgClass = 'bg-slate-50 text-slate-300';
        let dotColor = '';
        if (band === 'A') { bgClass = 'bg-emerald-50 text-emerald-800'; dotColor = '#10b981'; }
        if (band === 'B') { bgClass = 'bg-amber-50 text-amber-800';     dotColor = '#f59e0b'; }
        if (band === 'C') { bgClass = 'bg-rose-50 text-rose-800';       dotColor = '#e11d48'; }

        const todayRing = isToday ? 'border-2 border-slate-400 border-dashed' : '';

        // Range highlight: giorno di partenza = forte (blu pieno), giorni successivi = indicatore leggero
        let rangeStyle = '';
        if (isStart) {
            rangeStyle = 'ring-[3px] ring-ct-blue ring-offset-1 scale-110 shadow-lg z-10';
        } else if (isInRange) {
            rangeStyle = 'ring-2 ring-ct-blue/60 ring-offset-1';
        }

        // Disabilitato se non ha copertura completa
        const disabled = !canSelect;
        const tapClass = canSelect
            ? 'cursor-pointer active:scale-90 transition-all touch-manipulation'
            : 'opacity-40 cursor-not-allowed';

        cells += `<div class="w-full aspect-square rounded-lg flex flex-col items-center justify-center ${bgClass} ${todayRing} ${rangeStyle} ${tapClass}"
            ${canSelect ? `onclick="window._ctSimSelectDate('${iso}')"` : ''}>
            <span class="text-xs font-bold leading-none">${d}</span>
            ${dotColor ? `<span class="w-1.5 h-1.5 rounded-full mt-0.5" style="background:${dotColor};"></span>` : ''}
        </div>`;
    }

    const canPrev = idx > 0;
    const canNext = idx < 8; // 0=marzo ... 8=novembre

    container.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <!-- Header mese con navigazione -->
            <div class="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                <button onclick="window._ctCalNav(-1)" 
                    class="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform ${canPrev ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-300 pointer-events-none'}"
                    ${canPrev ? '' : 'disabled'}>
                    <span class="material-icons text-lg">chevron_left</span>
                </button>
                <span class="text-sm font-bold text-slate-800 uppercase tracking-wide">${months[idx]} 2026</span>
                <button onclick="window._ctCalNav(1)" 
                    class="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform ${canNext ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-300 pointer-events-none'}"
                    ${canNext ? '' : 'disabled'}>
                    <span class="material-icons text-lg">chevron_right</span>
                </button>
            </div>

            <!-- Giorni della settimana -->
            <div class="grid grid-cols-7 gap-1 px-3 pt-2 pb-1">
                ${days.map(d => `<div class="text-center text-[10px] font-bold text-slate-400 uppercase">${d}</div>`).join('')}
            </div>

            <!-- Griglia giorni -->
            <div class="grid grid-cols-7 gap-1 px-3 pb-3">
                ${cells}
            </div>

            <!-- Legenda compatta sotto il calendario -->
            <div class="flex items-center justify-center gap-4 px-3 py-2.5 bg-slate-50 border-t border-slate-100">
                <div class="flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span class="text-[10px] font-bold text-slate-500">A</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span class="text-[10px] font-bold text-slate-500">B</span>
                </div>
                <div class="flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full" style="background:#e11d48;"></span>
                    <span class="text-[10px] font-bold text-slate-500">C</span>
                </div>
            </div>

            <!-- Banner: tipo card selezionata -->
            <div class="flex items-start gap-2 px-3 py-2.5 bg-sky-50 border-t border-sky-100">
                <span class="material-icons text-sky-500 text-sm shrink-0 mt-0.5">info</span>
                <p class="text-[10px] text-sky-700 leading-snug font-medium">
                    ${window.t('ct_cal_showing')} <strong>${cardDays} ${cardDays === 1 ? window.t('ct_sim_day') : window.t('ct_sim_days')}</strong>
                </p>
            </div>
        </div>`;
};

/** Naviga avanti/indietro di un mese */
window._ctCalNav = function(dir) {
    window._ctCalMonth = Math.max(0, Math.min(8, window._ctCalMonth + dir));
    window._renderCTCalendar();
};

// ───────────────────────────────────────────────────────────────────────
//  SIMULATORE PREZZO CT CARD (TERZIARIO)
//  L'utente sceglie: durata (1/2/3 giorni) → data inizio → tipo viaggiatore
//  Il simulatore calcola il prezzo basandosi sulla fascia del calendario.
// ───────────────────────────────────────────────────────────────────────

/** Cambia durata card (1/2/3 giorni) → aggiorna calendario + reset selezione */
window._ctSimSwitchCard = function(days) {
    window._ctSimCardDays = days;
    window._ctSimSelectedDate = null;
    window._ctSimBuyerType = null;
    window._ctSimExtraKids = 0;

    // Aggiorna pills attive
    document.querySelectorAll('.ct-sim-pill').forEach(el => {
        const active = parseInt(el.dataset.days) === days;
        el.classList.toggle('bg-ct-blue', active);
        el.classList.toggle('text-white', active);
        el.classList.toggle('shadow-md', active);
        el.classList.toggle('bg-slate-100', !active);
        el.classList.toggle('text-slate-600', !active);
    });

    // Ri-renderizza calendario con nuovi colori
    window._renderCTCalendar();
    // Nascondi buyer panel e risultato
    const buyerPanel = document.getElementById('ct-sim-buyer-panel');
    const resultPanel = document.getElementById('ct-sim-result');
    if (buyerPanel) buyerPanel.classList.add('hidden');
    if (resultPanel) resultPanel.classList.add('hidden');
};

/** L'utente tocca un giorno nel calendario */
window._ctSimSelectDate = function(iso) {
    window._haptic(8);
    window._ctSimSelectedDate = iso;
    window._ctSimBuyerType = null;
    window._ctSimExtraKids = 0;

    // Ri-renderizza calendario per mostrare selezione
    window._renderCTCalendar();

    // Mostra pannello acquirente
    const buyerPanel = document.getElementById('ct-sim-buyer-panel');
    if (buyerPanel) {
        buyerPanel.classList.remove('hidden');
        window._renderCTSimBuyer();
        setTimeout(() => buyerPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
    }

    // Nascondi risultato precedente
    const resultPanel = document.getElementById('ct-sim-result');
    if (resultPanel) resultPanel.classList.add('hidden');
};

/** Render pannello acquirente */
window._renderCTSimBuyer = function() {
    const panel = document.getElementById('ct-sim-buyer-panel');
    if (!panel) return;
    const lang = window.currentLang || 'it';
    const selected = window._ctSimBuyerType;

    const types = [
        { key: 'adult',  icon: 'person',        label: window.t('ct_sim_adult') },
        { key: 'child',  icon: 'child_care',     label: window.t('ct_sim_child') },
        { key: 'senior', icon: 'elderly',        label: window.t('ct_sim_senior') },
        { key: 'family', icon: 'family_restroom', label: window.t('ct_sim_family') }
    ];

    let html = `<p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
        <span class="material-icons text-sm text-slate-400">group</span>
        ${window.t('ct_sim_who')}
    </p>
    <div class="grid grid-cols-2 gap-2 mb-3">`;

    types.forEach(t => {
        const isActive = selected === t.key;
        const activeCls = isActive
            ? 'border-ct-blue bg-sky-50 shadow-sm'
            : 'border-slate-150 bg-white';
        const iconCls = isActive ? 'text-ct-blue' : 'text-slate-400';
        const textCls = isActive ? 'text-ct-blue font-bold' : 'text-slate-600 font-medium';

        html += `<button onclick="window._ctSimSelectBuyer('${t.key}')"
            class="flex items-center gap-2.5 p-3 rounded-xl border ${activeCls} active:scale-95 transition-all touch-manipulation cursor-pointer">
            <span class="material-icons text-lg ${iconCls}">${t.icon}</span>
            <span class="text-[11px] ${textCls} leading-tight">${t.label}</span>
        </button>`;
    });
    html += '</div>';

    // Pannello famiglia: counter ragazzi extra
    if (selected === 'family') {
        const kids = 1 + window._ctSimExtraKids;
        html += `<div class="bg-amber-50 rounded-xl border border-amber-100 p-3 mb-3 animate-fade">
            <p class="text-[11px] text-amber-700 font-medium mb-2.5">
                <span class="material-icons text-xs align-middle mr-1">info</span>
                ${window.t('ct_sim_family_desc')}
            </p>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="material-icons text-slate-400 text-base">person</span>
                    <span class="text-xs font-bold text-slate-700">2 ${window.t('ct_sim_adults_label')}</span>
                </div>
                <div class="flex items-center gap-2.5">
                    <span class="material-icons text-slate-400 text-base">child_care</span>
                    <button onclick="window._ctSimKids(-1)"
                        class="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg active:scale-90 transition-all touch-manipulation ${kids <= 1 ? 'opacity-30 pointer-events-none' : ''}"
                        ${kids <= 1 ? 'disabled' : ''}>−</button>
                    <span class="text-sm font-black text-slate-800 w-5 text-center">${kids}</span>
                    <button onclick="window._ctSimKids(1)"
                        class="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg active:scale-90 transition-all touch-manipulation ${kids >= 6 ? 'opacity-30 pointer-events-none' : ''}"
                        ${kids >= 6 ? 'disabled' : ''}>+</button>
                </div>
            </div>
        </div>`;
    }

    panel.innerHTML = html;
};

/** Seleziona tipo acquirente */
window._ctSimSelectBuyer = function(type) {
    window._haptic(8);
    window._ctSimBuyerType = type;
    window._ctSimExtraKids = 0;
    window._renderCTSimBuyer();
    window._ctSimCalcPrice();
};

/** Incrementa/decrementa ragazzi famiglia */
window._ctSimKids = function(dir) {
    window._haptic(5);
    window._ctSimExtraKids = Math.max(0, Math.min(5, window._ctSimExtraKids + dir));
    window._renderCTSimBuyer();
    window._ctSimCalcPrice();
};

/** Calcola e mostra il prezzo — lookup diretto: fascia del giorno di partenza nel calendario della durata scelta */
window._ctSimCalcPrice = function() {
    const resultPanel = document.getElementById('ct-sim-result');
    if (!resultPanel) return;

    const days = window._ctSimCardDays;
    const dateISO = window._ctSimSelectedDate;
    const buyer = window._ctSimBuyerType;
    if (!dateISO || !buyer) { resultPanel.classList.add('hidden'); return; }

    const lang = window.currentLang || 'it';
    const dayNames = _CT_CAL_DAYS[lang] || _CT_CAL_DAYS.en;
    const monthNames = _CT_CAL_MONTHS[lang] || _CT_CAL_MONTHS.en;

    // Fascia del giorno di partenza nel calendario specifico per la durata
    const band = window._getCTBand(dateISO, days);
    if (!band) { resultPanel.classList.add('hidden'); return; }

    // Lookup prezzo
    const prices = window._CT_PRICES[days];
    if (!prices || !prices[buyer]) { resultPanel.classList.add('hidden'); return; }

    let totalCents = prices[buyer][band];

    // Famiglia: aggiungi ragazzi extra (stessa fascia e durata)
    let extraKidsCents = 0;
    if (buyer === 'family' && window._ctSimExtraKids > 0) {
        const childPrice = prices.child[band];
        extraKidsCents = childPrice * window._ctSimExtraKids;
        totalCents += extraKidsCents;
    }

    const totalEuro = (totalCents / 100).toFixed(2).replace('.', ',');

    // Colori fascia
    const bandColors = {
        A: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'A' },
        B: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400', label: 'B' },
        C: { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500', label: 'C' }
    };
    const bc = bandColors[band];

    // Buyer label
    const buyerLabels = { adult: window.t('ct_sim_adult'), child: window.t('ct_sim_child'), senior: window.t('ct_sim_senior'), family: window.t('ct_sim_family') };

    // Date range display
    const startD = new Date(dateISO + 'T12:00:00');
    const startDow = (startD.getDay() + 6) % 7;
    const startMIdx = startD.getMonth() - 2;
    const startLabel = `${dayNames[startDow]} ${startD.getDate()} ${monthNames[startMIdx] || ''}`;

    let endLabel = '';
    if (days > 1) {
        const lastD = new Date(startD);
        lastD.setDate(lastD.getDate() + days - 1);
        const lastDow = (lastD.getDay() + 6) % 7;
        const lastMIdx = lastD.getMonth() - 2;
        endLabel = ` → ${dayNames[lastDow]} ${lastD.getDate()} ${monthNames[lastMIdx] || ''}`;
    }

    // Extra kids breakdown
    let extraKidsHtml = '';
    if (buyer === 'family' && window._ctSimExtraKids > 0) {
        const baseEuro = ((totalCents - extraKidsCents) / 100).toFixed(2).replace('.', ',');
        const extraEuro = (extraKidsCents / 100).toFixed(2).replace('.', ',');
        extraKidsHtml = `
            <div class="flex flex-col gap-1 mt-3 pt-3 border-t border-white/10 text-[11px]">
                <div class="flex items-center justify-between">
                    <span class="text-white/50">${window.t('ct_sim_family_base')} (2+1)</span>
                    <span class="text-white/70 font-bold">€ ${baseEuro}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-white/50">+ ${window._ctSimExtraKids} ${window.t('ct_sim_child')}</span>
                    <span class="text-white/70 font-bold">€ ${extraEuro}</span>
                </div>
            </div>`;
    }

    resultPanel.classList.remove('hidden');
    resultPanel.innerHTML = `
        <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-lg animate-fade">
            <div class="flex items-center justify-between mb-1">
                <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">${window.t('ct_sim_estimate')}</p>
                <span class="px-2.5 py-1 rounded-lg ${bc.bg} ${bc.text} text-[10px] font-black uppercase">${window.t('ct_sim_band')} ${bc.label}</span>
            </div>
            <p class="text-3xl font-black mb-1">€ ${totalEuro}</p>
            <p class="text-[10px] text-white/40 font-medium mb-3">${startLabel}${endLabel}</p>

            <div class="flex items-center gap-2 pt-3 border-t border-white/10">
                <span class="material-icons text-white/30 text-sm">receipt_long</span>
                <span class="text-[11px] text-white/50">${buyerLabels[buyer]} · MS ${days} ${days === 1 ? window.t('ct_sim_day') : window.t('ct_sim_days')}</span>
            </div>

            ${extraKidsHtml}

            <p class="text-[9px] text-white/25 mt-3 leading-relaxed">${window.t('ct_sim_disclaimer')}</p>
        </div>`;

    setTimeout(() => resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
};

// ═══════════════════════════════════════════════════════════════════════════
//  NEAR ME — ORDINAMENTO PER DISTANZA (SECONDARIO)
//
//  Quando l'utente preme il bottone "Near Me" nella filter bar,
//  la lista viene riordinata dal più vicino al più lontano.
//
//  Flusso:
//    1. toggleNearMe() → chiede il permesso GPS (se non già dato)
//    2. GeoTracker (sotto) ottiene la posizione
//    3. sortByDistance() calcola la distanza in km per ogni item
//    4. La lista viene ri-filtrata con il nuovo ordinamento
//
//  Dipendenze:
//    GeoTracker (sotto) → per ottenere la posizione GPS
//    app.js Sezione 13  → _requestGeoPermission() per il permesso
//    app.js Sezione 9   → i filtri richiamano sortByDistance()
// ═══════════════════════════════════════════════════════════════════════════
// Toggle state: true = ordina per distanza, false = ordine originale
window._nearMeEnabled = false;
// Cached user position (aggiornata via GeoTracker singleton)
window._nearMePos = null;

/**
 * Toggle del pulsante "Vicino a me" nella filter bar.
 * Ora usa GeoTracker singleton: se il GPS era già attivo (es. dal Bus o dalla Mappa),
 * la posizione è disponibile ISTANTANEAMENTE via getLastPos() — zero attesa.
 * Se è la prima volta, chiede il permesso e avvia il tracker condiviso.
 * @param {string}   btnId    — id del bottone near-me nella filter bar
 * @param {Function} callback — richiamata dopo il toggle per rinfrescare la lista
 */
window.toggleNearMe = function(btnId, callback) {
    const btn = document.getElementById(btnId);

    // Se sta per attivarsi e non abbiamo posizione: chiedi permesso
    if (!window._nearMeEnabled && !window._nearMePos) {

        // Check veloce: forse il GeoTracker ha già una posizione cached?
        const cached = window.GeoTracker ? window.GeoTracker.getLastPos() : null;
        if (cached) {
            // Posizione già disponibile (utente ha usato GPS in un'altra sezione) → ISTANTANEO
            window._nearMePos = { lat: cached.lat, lng: cached.lng };
            window._nearMeEnabled = true;
            if (btn) { btn.classList.add('active-near-me'); btn.setAttribute('aria-pressed', 'true'); }
            if (callback) callback();
            return;
        }

        // Nessuna posizione cached → chiedi permesso e avvia GeoTracker
        window._requestGeoPermission(
            () => {
                // Permesso concesso: avvia un subscriber one-shot per ottenere la posizione
                window.GeoTracker.start('nearme', ({ lat, lng }) => {
                    window._nearMePos = { lat, lng };
                    window._nearMeEnabled = true;
                    if (btn) { btn.classList.add('active-near-me'); btn.setAttribute('aria-pressed', 'true'); }
                    // Rimuovi il subscriber one-shot (ma il watch condiviso resta se altri lo usano)
                    window.GeoTracker.stop('nearme');
                    if (callback) callback();
                });
            },
            () => {
                // Permesso negato
                window._nearMeEnabled = false;
                if (btn) { btn.classList.remove('active-near-me'); btn.setAttribute('aria-pressed', 'false'); }
            }
        );
        return;
    }

    // Toggle on/off
    window._nearMeEnabled = !window._nearMeEnabled;
    if (btn) {
        btn.classList.toggle('active-near-me', window._nearMeEnabled);
        btn.setAttribute('aria-pressed', String(window._nearMeEnabled));
    }

    // Se si riattiva, aggiorna posizione dal cache GeoTracker (sincrono, no GPS call)
    if (window._nearMeEnabled) {
        const fresh = window.GeoTracker ? window.GeoTracker.getLastPos() : null;
        if (fresh) {
            window._nearMePos = { lat: fresh.lat, lng: fresh.lng };
        }
    }

    if (callback) callback();
};

/**
 * Ordina un array di item per distanza dall'utente.
 * Se Near Me non è attivo o non abbiamo posizione, restituisce l'array invariato.
 * @param {Array}  items  — array di oggetti (row del DB)
 * @param {string} latKey — chiave del campo latitudine (es. 'lat_sp')
 * @param {string} lonKey — chiave del campo longitudine (es. 'long_sp')
 * @returns {Array} — array ordinato per distanza crescente
 */
window.sortByDistance = function(items, latKey, lonKey) {
    if (!window._nearMeEnabled || !window._nearMePos) return items;
    const { lat: uLat, lng: uLng } = window._nearMePos;

    // Haversine semplificata (km) — sufficiente per distanze < 50 km
    function dist(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    return [...items].sort((a, b) => {
        const aLat = parseFloat(a[latKey]); const aLon = parseFloat(a[lonKey]);
        const bLat = parseFloat(b[latKey]); const bLon = parseFloat(b[lonKey]);
        const aDist = (isNaN(aLat) || isNaN(aLon)) ? 9999 : dist(uLat, uLng, aLat, aLon);
        const bDist = (isNaN(bLat) || isNaN(bLon)) ? 9999 : dist(uLat, uLng, bLat, bLon);
        return aDist - bDist;
    });
};


// ═══════════════════════════════════════════════════════════════════════════
//  SEGNALAZIONI — "SEGNALA UN PROBLEMA" (SECONDARIO)
//
//  Permette all'utente di segnalare errori sui dati (ristorante chiuso,
//  indirizzo sbagliato, sentiero bloccato, ecc.)
//
//  Flusso:
//    1. renderReportBtn() genera il bottoncino nei modali dettaglio
//    2. Al tap si apre un bottom-sheet con 4 opzioni + campo note
//    3. _submitReport() invia la segnalazione alla tabella Supabase "Segnalazioni"
//    4. Rate limiting client-side: max 3 segnalazioni al minuto (sessionStorage)
//
//  Tabella Supabase necessaria: "Segnalazioni"
//  Colonne: id, created_at, item_type, item_id, item_name, report_type, note, lang
//  RLS: solo INSERT per il ruolo anon (i turisti non possono leggere/cancellare)
//
//  Dipendenze:
//    data-logic.js → window.supabaseClient, window.t()
//  Usata da: ui-modal.js → aggiunge renderReportBtn() nei modali reportabili
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Genera il bottoncino "Segnala" da inserire nelle card o nei modali.
 * @param {string} itemType  — tipo card: 'ristorante', 'spiaggia', 'sentiero', 'vino', 'attrazione', 'prodotto'
 * @param {string} itemId    — id univoco dell'item
 * @param {string} itemName  — nome visibile dell'item
 */
window.renderReportBtn = function(itemType, itemId, itemName) {
    const safeName = (itemName || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    return `<button
        class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide
               text-slate-400 bg-slate-50 border border-slate-100
               active:scale-95 transition-all touch-manipulation cursor-pointer"
        onclick="event.stopPropagation(); window._openReportModal('${itemType}', '${itemId || ''}', '${safeName}')"
        aria-label="${window.t('report_btn')}">
        <span class="material-icons text-xs">flag</span>
        ${window.t('report_btn')}
    </button>`;
};

/**
 * Apre un bottom-sheet leggero per la segnalazione.
 */
window._openReportModal = function(itemType, itemId, itemName) {
    window._haptic(8);

    // Rimuovi eventuali report modal precedenti
    const existing = document.getElementById('report-modal-overlay');
    if (existing) existing.remove();

    const T = {
        title: window.t('report_title'),
        opts: [
            { value: 'closed',  label: window.t('report_closed'),  icon: 'block' },
            { value: 'wrong',   label: window.t('report_wrong'),   icon: 'edit_note' },
            { value: 'blocked', label: window.t('report_blocked'), icon: 'warning' },
            { value: 'other',   label: window.t('report_other'),   icon: 'more_horiz' }
        ],
        placeholder: window.t('report_note_placeholder'),
        send: window.t('report_send')
    };

    const overlay = document.createElement('div');
    overlay.id = 'report-modal-overlay';
    overlay.className = 'fixed inset-0 z-[150] bg-slate-900/50 backdrop-blur-sm flex items-end justify-center p-0 animate-fade';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
    <div class="bg-white w-full max-w-md rounded-t-[1.5rem] shadow-2xl overflow-hidden" id="report-sheet">
        <div class="w-full flex justify-center pt-3 pb-1"><div class="w-10 h-1.5 bg-slate-200 rounded-full"></div></div>
        <div class="px-5 pt-2 pb-5">
            <div class="flex items-center gap-2 mb-1">
                <span class="material-icons text-slate-400 text-lg">flag</span>
                <h3 class="font-bold text-slate-800 text-base">${T.title}</h3>
            </div>
            ${itemName ? `<p class="text-xs text-slate-400 font-medium mb-4 truncate">${itemName}</p>` : '<div class="mb-3"></div>'}

            <div class="flex flex-col gap-2 mb-4" id="report-options">
                ${T.opts.map(o => `
                    <button class="report-opt flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 text-left
                                   active:scale-[0.98] transition-all touch-manipulation cursor-pointer"
                            data-value="${o.value}" onclick="window._selectReportOpt(this)">
                        <span class="material-icons text-slate-400 text-lg">${o.icon}</span>
                        <span class="text-sm font-medium text-slate-700">${o.label}</span>
                    </button>
                `).join('')}
            </div>

            <textarea id="report-note" rows="2" maxlength="500"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 resize-none
                       focus:outline-none focus:border-ct-blue focus:ring-1 focus:ring-ct-blue/30 mb-4"
                placeholder="${T.placeholder}"></textarea>

            <button id="report-send-btn"
                class="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide
                       bg-slate-200 text-slate-400 cursor-not-allowed transition-all"
                disabled
                onclick="window._submitReport('${itemType}', '${itemId || ''}', '${(itemName || '').replace(/'/g, "\\'")}')">
                ${T.send}
            </button>
        </div>
    </div>`;

    document.body.appendChild(overlay);
};

window._selectedReportType = null;

window._selectReportOpt = function(btn) {
    window._haptic(5);
    // Reset all
    document.querySelectorAll('.report-opt').forEach(b => {
        b.classList.remove('border-ct-blue', 'bg-ct-blue-light');
        b.classList.add('border-slate-100', 'bg-slate-50');
    });
    // Activate clicked
    btn.classList.remove('border-slate-100', 'bg-slate-50');
    btn.classList.add('border-ct-blue', 'bg-ct-blue-light');
    window._selectedReportType = btn.dataset.value;

    // Enable send button
    const sendBtn = document.getElementById('report-send-btn');
    if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.className = 'w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide bg-ct-blue text-white shadow-md active:scale-[0.97] transition-all cursor-pointer touch-manipulation';
    }
};

window._submitReport = async function(itemType, itemId, itemName) {
    const note = (document.getElementById('report-note')?.value || '').trim();
    const reportType = window._selectedReportType;
    if (!reportType) return;

    // ── Rate limiting lato client: max 3 segnalazioni al minuto ──
    const RL_KEY = 'f2g_report_timestamps';
    const RL_MAX = 3;
    const RL_WINDOW_MS = 60000; // 1 minuto
    const now = Date.now();
    let timestamps = [];
    try { timestamps = JSON.parse(sessionStorage.getItem(RL_KEY) || '[]'); } catch {}
    // Rimuovi timestamp scaduti
    timestamps = timestamps.filter(ts => now - ts < RL_WINDOW_MS);
    if (timestamps.length >= RL_MAX) {
        const sendBtn = document.getElementById('report-send-btn');
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.innerHTML = window.t('report_rate_limit');
            sendBtn.className = 'w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide bg-amber-500 text-white shadow-md cursor-not-allowed';
            setTimeout(() => {
                sendBtn.disabled = false;
                sendBtn.innerHTML = window.t('report_send');
                sendBtn.className = 'w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide bg-ct-blue text-white shadow-md active:scale-[0.97] transition-all cursor-pointer touch-manipulation';
            }, 15000);
        }
        return;
    }

    const sendBtn = document.getElementById('report-send-btn');
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<span class="material-icons text-sm spin">sync</span>';
    }

    try {
        const { error } = await window.supabaseClient
            .from('Segnalazioni')
            .insert({
                item_type: itemType,
                item_id: String(itemId || ''),
                item_name: itemName || '',
                report_type: reportType,
                note: note,
                lang: window.currentLang || 'it'
            });

        if (error) throw error;

        // Salva timestamp di questa segnalazione riuscita
        timestamps.push(now);
        try { sessionStorage.setItem(RL_KEY, JSON.stringify(timestamps)); } catch {}

        window._haptic(15);

        // Success UI
        const sheet = document.getElementById('report-sheet');
        if (sheet) {
            sheet.innerHTML = `
            <div class="p-8 text-center">
                <div class="w-16 h-16 bg-ct-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="material-icons text-3xl text-ct-green">check_circle</span>
                </div>
                <h3 class="font-bold text-slate-800 text-lg mb-1">${window.t('report_thanks')}</h3>
                <p class="text-sm text-slate-400">${window.t('report_thanks_sub')}</p>
            </div>`;
        }
        setTimeout(() => {
            const overlay = document.getElementById('report-modal-overlay');
            if (overlay) { overlay.classList.add('opacity-0'); setTimeout(() => overlay.remove(), 200); }
        }, 1800);

    } catch (err) {
        console.error('[Report] Insert failed:', err);
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.innerHTML = window.t('report_error');
            sendBtn.className = 'w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide bg-rose-500 text-white shadow-md cursor-pointer';
        }
    }
};