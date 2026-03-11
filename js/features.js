// ═══════════════════════════════════════════════════════════════════════════
//  Five2Go — features.js
//  Wishlist · Itinerary · Cinque Terre Card
//
//  Questo file implementa le feature "sticky" dell'app:
//    1. WL           — Wishlist manager (localStorage, persistente offline)
//    2. ITINERARY    — Itinerary manager (localStorage, persistente offline)
//    3. renderHeartBtn / toggleHeart    — cuoricino su ogni card
//    4. renderPlanBtn  / togglePlan     — pulsante "aggiungi al piano"
//    5. _updateHomeBadges               — aggiorna i contatori sulla home
//    6. renderWishlist                  — pagina "I miei Preferiti"
//    7. renderItinerary                 — pagina "Il mio Itinerario"
//    8. renderCinqueTerreCard           — pagina info Cinque Terre Card
//
//  Tutte le funzioni sono esposte su window per compatibilità con i renderer
//  già esistenti in ui-renderers.js e app.js.
//
//  STORAGE KEYS:
//    f2g_wishlist   → Array di oggetti { wl_id, wl_type, wl_name, wl_sub, wl_modal_type, wl_modal_payload }
//    f2g_itinerary  → Array di oggetti { itin_id, itin_type, itin_name, itin_sub, itin_modal_type, itin_modal_payload }
// ═══════════════════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────────────────────
//  1. WISHLIST MANAGER
// ─────────────────────────────────────────────────────────────────────────────
window.WL = {
    _key: 'f2g_wishlist',

    /** Restituisce l'array corrente (fallback []) */
    get() {
        try { return JSON.parse(localStorage.getItem(this._key) || '[]'); }
        catch { return []; }
    },

    /** Persiste l'array */
    _save(arr) {
        try { localStorage.setItem(this._key, JSON.stringify(arr)); }
        catch (e) { console.warn('[WL] localStorage write failed:', e); }
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


// ─────────────────────────────────────────────────────────────────────────────
//  2. ITINERARY MANAGER
// ─────────────────────────────────────────────────────────────────────────────
window.ITINERARY = {
    _key: 'f2g_itinerary',

    get() {
        try { return JSON.parse(localStorage.getItem(this._key) || '[]'); }
        catch { return []; }
    },

    _save(arr) {
        try { localStorage.setItem(this._key, JSON.stringify(arr)); }
        catch (e) { console.warn('[ITINERARY] localStorage write failed:', e); }
    },

    /** Aggiunge se non già presente. Ritorna true se aggiunto. */
    add(item) {
        const list = this.get();
        if (!this.has(item.itin_id)) { list.push(item); this._save(list); return true; }
        return false;
    },

    remove(id) { this._save(this.get().filter(i => i.itin_id !== String(id))); },
    has(id) { return this.get().some(i => i.itin_id === String(id)); },

    /** Sposta un elemento da fromIdx a toIdx (per il riordinamento manuale) */
    move(fromIdx, toIdx) {
        const list = this.get();
        if (fromIdx < 0 || toIdx < 0 || fromIdx >= list.length || toIdx >= list.length) return;
        const [item] = list.splice(fromIdx, 1);
        list.splice(toIdx, 0, item);
        this._save(list);
    },

    clear() { localStorage.removeItem(this._key); }
};


// ─────────────────────────────────────────────────────────────────────────────
//  3. HEART BUTTON — Wishlist toggle sulle card
// ─────────────────────────────────────────────────────────────────────────────

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
    const ariaLabel   = isActive ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti';

    return `<button
        class="flex flex-col items-center justify-center gap-1 group/btn active:scale-95 transition-all duration-200 min-w-[50px] cursor-pointer touch-manipulation wl-heart-btn${isActive ? ' wl-active' : ''}"
        data-wl-id="${wlItem.wl_id}"
        onclick="event.stopPropagation(); window.toggleHeart(this, '${safeItem}')"
        aria-label="${ariaLabel}">
        <div class="h-11 w-11 rounded-xl ${wrapperClass} shadow-sm flex items-center justify-center border transition-colors duration-200">
            <span class="material-icons text-lg ${iconClass}">${iconName}</span>
        </div>
        <span class="text-[11px] font-bold uppercase tracking-wider ${labelClass} transition-colors">Save</span>
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

    const ariaLabel = isActive ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti';

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


// ─────────────────────────────────────────────────────────────────────────────
//  4. PLAN BUTTON — Itinerary add sulle card
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {Object} itinItem — { itin_id, itin_type, itin_name, itin_sub, itin_modal_type, itin_modal_payload }
 */
window.renderPlanBtn = function(itinItem) {
    const isActive = window.ITINERARY.has(itinItem.itin_id);
    const safeItem = encodeURIComponent(JSON.stringify(itinItem)).replace(/'/g, '%27');

    const iconName    = isActive ? 'event_available'     : 'add_circle_outline';
    const iconClass   = isActive ? 'text-amber-500'      : 'text-slate-400';
    const wrapperClass = isActive ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-200';
    const labelClass  = isActive ? 'text-amber-500'      : 'text-slate-400';
    const ariaLabel   = isActive ? "Rimuovi dall'itinerario" : "Aggiungi all'itinerario";

    return `<button
        class="flex flex-col items-center justify-center gap-1 group/btn active:scale-95 transition-all duration-200 min-w-[50px] cursor-pointer touch-manipulation itin-plan-btn${isActive ? ' itin-active' : ''}"
        data-itin-id="${itinItem.itin_id}"
        onclick="event.stopPropagation(); window.togglePlan(this, '${safeItem}')"
        aria-label="${ariaLabel}">
        <div class="h-11 w-11 rounded-xl ${wrapperClass} shadow-sm flex items-center justify-center border transition-colors duration-200">
            <span class="material-icons text-lg ${iconClass}">${iconName}</span>
        </div>
        <span class="text-[11px] font-bold uppercase tracking-wider ${labelClass} transition-colors">Piano</span>
    </button>`;
};

window.togglePlan = function(btn, encoded) {
    const item     = JSON.parse(decodeURIComponent(encoded));
    const wasIn    = window.ITINERARY.has(item.itin_id);

    if (wasIn) { window.ITINERARY.remove(item.itin_id); }
    else        { window.ITINERARY.add(item); }

    const added  = !wasIn;
    const icon    = btn.querySelector('.material-icons');
    const wrapper = btn.querySelector('.h-11');
    const label   = btn.querySelector('span:last-child');

    if (added) {
        btn.classList.add('itin-active');
        if (icon)    { icon.textContent = 'event_available'; icon.classList.replace('text-slate-400', 'text-amber-500'); }
        if (wrapper) { wrapper.classList.add('bg-amber-50', 'border-amber-100'); wrapper.classList.remove('bg-slate-50', 'border-slate-200'); }
        if (label)   { label.classList.replace('text-slate-400', 'text-amber-500'); }
        btn.style.transform = 'scale(1.25)';
        setTimeout(() => { btn.style.transform = ''; }, 280);
    } else {
        btn.classList.remove('itin-active');
        if (icon)    { icon.textContent = 'add_circle_outline'; icon.classList.replace('text-amber-500', 'text-slate-400'); }
        if (wrapper) { wrapper.classList.remove('bg-amber-50', 'border-amber-100'); wrapper.classList.add('bg-slate-50', 'border-slate-200'); }
        if (label)   { label.classList.replace('text-amber-500', 'text-slate-400'); }
    }

    window._updateHomeBadges();
};


// ─────────────────────────────────────────────────────────────────────────────
//  5. BADGE UPDATER
//     Aggiorna i contatori visibili sui pulsanti Home (Preferiti / Itinerario)
// ─────────────────────────────────────────────────────────────────────────────
window._updateHomeBadges = function() {
    const wlBadge = document.querySelector('[data-home-badge="wishlist"]');
    const itBadge = document.querySelector('[data-home-badge="itinerary"]');

    if (wlBadge) {
        const count = window.WL.get().length;
        wlBadge.textContent = count;
        wlBadge.style.display = count > 0 ? 'flex' : 'none';
    }
    if (itBadge) {
        const count = window.ITINERARY.get().length;
        itBadge.textContent = count;
        itBadge.style.display = count > 0 ? 'flex' : 'none';
    }
};


// ─────────────────────────────────────────────────────────────────────────────
//  6. WISHLIST PAGE
// ─────────────────────────────────────────────────────────────────────────────
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

    let html = `<div class="animate-fade pb-8">
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

// Helper: svuota wishlist e ricarica
window._clearWishlist = function() {
    localStorage.removeItem(window.WL._key);
    window.renderWishlist();
    window._updateHomeBadges();
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


// ─────────────────────────────────────────────────────────────────────────────
//  7. ITINERARY PAGE
// ─────────────────────────────────────────────────────────────────────────────
window.renderItinerary = function() {
    const content = document.getElementById('app-content');
    if (!content) return;
    const items = window.ITINERARY.get();
    const lang  = window.currentLang || 'it';

    const L = {
        it: { title: 'Il mio Itinerario', empty: 'Nessuna tappa aggiunta.', emptyHint: "Premi 📋 sulle card per costruire il tuo percorso giornaliero — rimane salvato tra una sessione e l'altra.", clearAll: 'Svuota', openBtn: 'Apri', removeBtn: 'Rimuovi', step: 'Tappa', dayPlan: 'Piano del giorno', count_one: 'tappa', count_many: 'tappe', move_up: 'Sposta su', move_down: 'Sposta giù' },
        en: { title: 'My Itinerary', empty: 'No stops yet.', emptyHint: 'Tap 📋 on any card to build your daily itinerary — stays saved between sessions.', clearAll: 'Clear all', openBtn: 'Open', removeBtn: 'Remove', step: 'Stop', dayPlan: 'Day plan', count_one: 'stop', count_many: 'stops', move_up: 'Move up', move_down: 'Move down' },
        fr: { title: 'Mon Itinéraire', empty: 'Aucune étape.', emptyHint: 'Appuyez sur 📋 pour construire votre itinéraire.', clearAll: 'Tout effacer', openBtn: 'Voir', removeBtn: 'Supprimer', step: 'Étape', dayPlan: 'Plan du jour', count_one: 'étape', count_many: 'étapes', move_up: 'Monter', move_down: 'Descendre' },
        de: { title: 'Meine Route', empty: 'Keine Stopps.', emptyHint: 'Tippe auf 📋 um deine Tagesroute zu erstellen.', clearAll: 'Alle löschen', openBtn: 'Öffnen', removeBtn: 'Entfernen', step: 'Stopp', dayPlan: 'Tagesplan', count_one: 'Stopp', count_many: 'Stopps', move_up: 'Hoch', move_down: 'Runter' },
        es: { title: 'Mi Itinerario', empty: 'Sin paradas.', emptyHint: 'Pulsa 📋 para construir tu itinerario del día.', clearAll: 'Limpiar', openBtn: 'Ver', removeBtn: 'Quitar', step: 'Parada', dayPlan: 'Plan del día', count_one: 'parada', count_many: 'paradas', move_up: 'Subir', move_down: 'Bajar' },
        zh: { title: '我的行程', empty: '还没有站点。', emptyHint: '点击 📋 来规划您的每日行程。', clearAll: '清空', openBtn: '查看', removeBtn: '移除', step: '站', dayPlan: '每日计划', count_one: '站', count_many: '站', move_up: '上移', move_down: '下移' }
    }[lang] || { title: 'My Itinerary', empty: 'No stops yet.', emptyHint: 'Tap 📋 on cards to build your day.', clearAll: 'Clear all', openBtn: 'Open', removeBtn: 'Remove', step: 'Stop', dayPlan: 'Day plan', count_one: 'stop', count_many: 'stops', move_up: 'Up', move_down: 'Down' };

    // Colori per tipo
    const TYPE_COLORS = {
        ristorante: 'bg-ct-terracotta text-white',
        attrazione: 'bg-ct-blue text-white',
        spiaggia:   'bg-sky-500 text-white',
        sentiero:   'bg-ct-green text-white',
        vino:       'bg-red-500 text-white',
        prodotto:   'bg-green-600 text-white'
    };
    const TYPE_ICONS = {
        ristorante: 'restaurant', attrazione: 'attractions',
        spiaggia: 'beach_access', sentiero: 'hiking',
        vino: 'wine_bar', prodotto: 'eco'
    };

    const countLabel = items.length === 1 ? `1 ${L.count_one}` : `${items.length} ${L.count_many}`;

    let html = `<div class="animate-fade pb-8">
        <!-- Header -->
        <div class="flex items-start justify-between mb-6 pt-2">
            <div>
                <h2 class="font-serif text-3xl font-bold text-slate-800 leading-tight">
                    <span class="text-amber-400">🗺</span> ${L.title}
                </h2>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1.5">${countLabel}</p>
            </div>
            ${items.length > 0 ? `<button
                onclick="window._clearItinerary()"
                class="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 rounded-xl
                       hover:bg-rose-50 hover:text-rose-500 active:scale-95 transition-all touch-manipulation
                       border border-transparent hover:border-rose-100">
                ${L.clearAll}
            </button>` : ''}
        </div>`;

    if (items.length === 0) {
        html += `<div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 border-2 border-amber-100">
                <span class="material-icons text-5xl text-amber-200">map</span>
            </div>
            <p class="font-bold text-slate-600 text-lg mb-2">${L.empty}</p>
            <p class="text-sm text-slate-400 max-w-xs leading-relaxed">${L.emptyHint}</p>
        </div>`;
    } else {
        html += `<div class="flex flex-col gap-2.5" id="itinerary-list">`;

        items.forEach((item, idx) => {
            const colorCls = TYPE_COLORS[item.itin_type] || 'bg-slate-500 text-white';
            const iconName = TYPE_ICONS[item.itin_type]  || 'place';
            const hasModal = item.itin_modal_type && item.itin_modal_payload;
            const isFirst  = idx === 0;
            const isLast   = idx === items.length - 1;

            html += `<div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden itin-card animate-pop" data-itin-id="${item.itin_id}">
                <!-- Main row -->
                <div class="flex items-stretch">
                    <!-- Numero tappa con colore tipo -->
                    <div class="w-14 ${colorCls} flex flex-col items-center justify-center shrink-0 py-4 gap-1">
                        <span class="material-icons text-sm opacity-70">${iconName}</span>
                        <span class="font-black text-2xl leading-none">${idx + 1}</span>
                    </div>
                    <!-- Contenuto -->
                    <div class="flex-1 p-4 flex items-center gap-3 min-w-0">
                        <div class="flex-1 min-w-0">
                            <h3 class="font-bold text-slate-800 text-sm leading-snug truncate">${item.itin_name}</h3>
                            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wide truncate mt-0.5">${item.itin_sub || ''}</p>
                        </div>
                        <!-- Azioni -->
                        <div class="flex items-center gap-1.5 shrink-0">
                            ${hasModal ? `<button
                                onclick="window._openItinModal('${item.itin_modal_type}', '${item.itin_modal_payload}')"
                                class="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center active:scale-90 transition-all touch-manipulation"
                                aria-label="${L.openBtn}">
                                <span class="material-icons text-ct-blue text-sm">open_in_new</span>
                            </button>` : ''}
                            <button
                                onclick="window._removeItinItem('${item.itin_id}', this)"
                                class="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center active:scale-90 transition-all touch-manipulation"
                                aria-label="${L.removeBtn}">
                                <span class="material-icons text-red-400 text-sm">close</span>
                            </button>
                        </div>
                    </div>
                </div>
                <!-- Footer con riordinamento -->
                <div class="border-t border-slate-50 flex items-center justify-between px-4 py-2 bg-slate-50/50">
                    <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest">${L.step} ${idx + 1} / ${items.length}</span>
                    <div class="flex gap-1.5">
                        ${!isFirst ? `<button
                            onclick="window._moveItinItem(${idx}, ${idx - 1})"
                            class="w-7 h-7 rounded-lg bg-white border border-slate-150 shadow-sm flex items-center justify-center active:scale-90 touch-manipulation"
                            aria-label="${L.move_up}">
                            <span class="material-icons text-slate-400 text-sm">arrow_upward</span>
                        </button>` : ''}
                        ${!isLast ? `<button
                            onclick="window._moveItinItem(${idx}, ${idx + 1})"
                            class="w-7 h-7 rounded-lg bg-white border border-slate-150 shadow-sm flex items-center justify-center active:scale-90 touch-manipulation"
                            aria-label="${L.move_down}">
                            <span class="material-icons text-slate-400 text-sm">arrow_downward</span>
                        </button>` : ''}
                    </div>
                </div>
            </div>`;
        });

        html += `</div>`;
    }

    html += `</div>`;
    content.innerHTML = html;
};

window._clearItinerary = function() {
    window.ITINERARY.clear();
    window.renderItinerary();
    window._updateHomeBadges();
};

window._removeItinItem = function(id, btn) {
    const card = btn.closest('.itin-card');
    if (card) {
        card.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateX(50px)';
    }
    setTimeout(() => {
        window.ITINERARY.remove(id);
        // Aggiorna visivamente eventuali pulsanti Piano visibili nelle card
        document.querySelectorAll(`[data-itin-id="${id}"]`).forEach(el => {
            if (el.classList.contains('itin-plan-btn')) {
                const icon    = el.querySelector('.material-icons');
                const wrapper = el.querySelector('.h-11');
                const label   = el.querySelector('span:last-child');
                el.classList.remove('itin-active');
                if (icon)    { icon.textContent = 'add_circle_outline'; icon.classList.replace('text-amber-500', 'text-slate-400'); }
                if (wrapper) { wrapper.classList.remove('bg-amber-50', 'border-amber-100'); wrapper.classList.add('bg-slate-50', 'border-slate-200'); }
                if (label)   { if (label.classList.contains('text-amber-500')) label.classList.replace('text-amber-500', 'text-slate-400'); }
            }
        });
        window.renderItinerary();
        window._updateHomeBadges();
    }, 230);
};

window._moveItinItem = function(fromIdx, toIdx) {
    window.ITINERARY.move(fromIdx, toIdx);
    window.renderItinerary();
};

window._openItinModal = function(modalType, payload) {
    if (typeof window.openModal === 'function') window.openModal(modalType, payload);
};


// ─────────────────────────────────────────────────────────────────────────────
//  8. CINQUE TERRE CARD PAGE
//     Info sulla tessera del Parco Nazionale: prezzi, acquisto, sentieri inclusi
// ─────────────────────────────────────────────────────────────────────────────
window.renderCinqueTerreCard = function() {
    const content = document.getElementById('app-content');
    if (!content) return;
    const lang = window.currentLang || 'it';

    const L = {
        it: {
            title: 'Cinque Terre Card', subtitle: 'Tessera ufficiale del Parco Nazionale',
            where_title: 'Dove acquistarla',
            where: ['Infopoint nei 5 borghi (Riomaggiore, Manarola, Corniglia, Vernazza, Monterosso)', "Stazioni ferroviarie delle Cinque Terre", 'Online sul sito ufficiale del Parco'],
            prices_title: 'Prezzi indicativi',
            prices: [
                { label: 'Card Giornaliera Adulti', price: '€ 7,50', note: 'Accesso sentieri + Bus navetta', highlight: false },
                { label: 'Card 2 Giorni Adulti',    price: '€ 14,50', note: 'Accesso sentieri + Bus navetta', highlight: false },
                { label: 'Card Trekking (1 giorno)', price: '€ 5,00', note: 'Solo sentieri, no bus',          highlight: false },
                { label: 'Card famiglia (2+2)',       price: 'Scontata', note: 'Chiedi agli infopoint',        highlight: true },
                { label: 'Bambini < 4 anni',          price: 'Gratis', note: '',                               highlight: false }
            ],
            included_title: 'Cosa include',
            included: ['Accesso al Sentiero Azzurro (SVA)', 'Bus navetta ATC tra i borghi', 'Wi-Fi nei punti info del Parco', 'Mappe sentieri ufficiali'],
            note_title: '⚠ Nota importante',
            note: 'I prezzi indicati sono orientativi e possono variare per stagione. Verifica sempre i prezzi aggiornati agli infopoint ufficiali o sul sito del Parco.',
            official_site: 'Sito ufficiale del Parco'
        },
        en: {
            title: 'Cinque Terre Card', subtitle: 'Official National Park pass',
            where_title: 'Where to buy',
            where: ['Info points in all 5 villages (Riomaggiore, Manarola, Corniglia, Vernazza, Monterosso)', 'Cinque Terre train stations', 'Online on the official Park website'],
            prices_title: 'Indicative prices',
            prices: [
                { label: '1-Day Adult Card',     price: '€ 7.50',   note: 'Trails + Shuttle bus',     highlight: false },
                { label: '2-Day Adult Card',     price: '€ 14.50',  note: 'Trails + Shuttle bus',     highlight: false },
                { label: 'Trekking Card (1 day)', price: '€ 5.00',  note: 'Trails only, no bus',      highlight: false },
                { label: 'Family card (2+2)',     price: 'Discounted', note: 'Ask at info points',    highlight: true },
                { label: 'Children under 4',      price: 'Free',    note: '',                          highlight: false }
            ],
            included_title: "What's included",
            included: ['Access to Blue Trail (SVA)', 'ATC shuttle bus between villages', 'Wi-Fi at Park info points', 'Official trail maps'],
            note_title: '⚠ Important note',
            note: 'Prices shown are indicative and may vary by season. Always check current prices at official info points or the Park website.',
            official_site: 'Official Park website'
        },
        fr: {
            title: 'Cinque Terre Card', subtitle: 'Carte officielle du Parc National',
            where_title: "Où l'acheter",
            where: ['Points info dans les 5 villages', 'Gares des Cinque Terre', 'Sur le site officiel du Parc'],
            prices_title: 'Prix indicatifs',
            prices: [
                { label: 'Carte 1 jour Adulte', price: '€ 7,50',   note: 'Sentiers + Bus navette', highlight: false },
                { label: 'Carte 2 jours Adulte', price: '€ 14,50', note: 'Sentiers + Bus navette', highlight: false },
                { label: 'Carte Trekking (1j)',   price: '€ 5,00', note: 'Sentiers seulement',     highlight: false },
                { label: 'Carte famille (2+2)',    price: 'Réduit', note: 'Demander aux infos',     highlight: true },
                { label: 'Enfants - de 4 ans',     price: 'Gratuit', note: '',                      highlight: false }
            ],
            included_title: 'Ce qui est inclus',
            included: ['Accès au Sentier Azzurro (SVA)', 'Bus navette ATC', 'Wi-Fi aux points info', 'Cartes des sentiers'],
            note_title: '⚠ Note importante',
            note: 'Les prix sont indicatifs et peuvent varier selon la saison. Vérifiez toujours les tarifs actuels.',
            official_site: 'Site officiel du Parc'
        },
        de: {
            title: 'Cinque Terre Card', subtitle: 'Offizielle Nationalpark-Karte',
            where_title: 'Wo kaufen',
            where: ['Infopunkte in allen 5 Dörfern', 'Bahnhöfe der Cinque Terre', 'Online auf der offiziellen Park-Website'],
            prices_title: 'Ungefähre Preise',
            prices: [
                { label: '1-Tages-Karte Erwachsene', price: '€ 7,50',   note: 'Wanderwege + Shuttle-Bus', highlight: false },
                { label: '2-Tages-Karte Erwachsene', price: '€ 14,50',  note: 'Wanderwege + Shuttle-Bus', highlight: false },
                { label: 'Trekking-Karte (1 Tag)',    price: '€ 5,00',   note: 'Nur Wanderwege',           highlight: false },
                { label: 'Familienkarte (2+2)',        price: 'Ermäßigt', note: 'An Infopunkten erfragen',  highlight: true },
                { label: 'Kinder unter 4 Jahren',      price: 'Kostenlos', note: '',                        highlight: false }
            ],
            included_title: 'Was ist inbegriffen',
            included: ['Zugang zum Blauen Weg (SVA)', 'ATC Shuttle-Bus zwischen den Dörfern', 'WLAN an Park-Infopunkten', 'Offizielle Wanderkarten'],
            note_title: '⚠ Wichtiger Hinweis',
            note: 'Die Preise sind Richtwerte und können je nach Saison variieren.',
            official_site: 'Offizielle Park-Website'
        },
        es: {
            title: 'Cinque Terre Card', subtitle: 'Tarjeta oficial del Parque Nacional',
            where_title: 'Dónde comprarla',
            where: ['Puntos de información en los 5 pueblos', 'Estaciones de tren de las Cinque Terre', 'En la web oficial del Parque'],
            prices_title: 'Precios orientativos',
            prices: [
                { label: 'Tarjeta 1 día Adulto', price: '€ 7,50',   note: 'Senderos + Autobús lanzadera', highlight: false },
                { label: 'Tarjeta 2 días Adulto', price: '€ 14,50', note: 'Senderos + Autobús lanzadera', highlight: false },
                { label: 'Tarjeta Trekking (1d)', price: '€ 5,00',  note: 'Solo senderos',                highlight: false },
                { label: 'Tarjeta familia (2+2)',  price: 'Descuento', note: 'Pregunta en los infopuntos', highlight: true },
                { label: 'Niños menores de 4',     price: 'Gratis',  note: '',                             highlight: false }
            ],
            included_title: 'Qué incluye',
            included: ['Acceso al Sendero Azzurro (SVA)', 'Autobús lanzadera ATC', 'Wi-Fi en puntos info del Parque', 'Mapas oficiales de senderos'],
            note_title: '⚠ Nota importante',
            note: 'Los precios son orientativos y pueden variar según la temporada.',
            official_site: 'Web oficial del Parque'
        },
        zh: {
            title: '五渔村卡', subtitle: '国家公园官方通行证',
            where_title: '购买地点',
            where: ['五个村庄的信息中心', '五渔村火车站', '国家公园官方网站'],
            prices_title: '参考价格',
            prices: [
                { label: '成人一日卡',   price: '€ 7.50',  note: '步道 + 接驳巴士', highlight: false },
                { label: '成人两日卡',   price: '€ 14.50', note: '步道 + 接驳巴士', highlight: false },
                { label: '徒步卡（一日）', price: '€ 5.00', note: '仅步道，不含巴士', highlight: false },
                { label: '家庭卡 (2+2)', price: '优惠价',  note: '请询问信息中心',  highlight: true },
                { label: '4岁以下儿童',  price: '免费',    note: '',                highlight: false }
            ],
            included_title: '包含内容',
            included: ['蓝色小径 (SVA) 通行证', 'ATC接驳巴士', '公园信息中心Wi-Fi', '官方步道地图'],
            note_title: '⚠ 重要提示',
            note: '价格仅供参考，可能因季节而异。请在官方信息中心或公园网站查询最新价格。',
            official_site: '公园官方网站'
        }
    }[lang] || {
        title: 'Cinque Terre Card', subtitle: 'Official National Park pass',
        where_title: 'Where to buy', where: ['Info points in all 5 villages'],
        prices_title: 'Prices', prices: [],
        included_title: "Included", included: [],
        note_title: 'Note', note: 'Check current prices on site.', official_site: 'Official website'
    };

    content.innerHTML = `<div class="animate-fade pb-8">
        <!-- Header card -->
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

        <!-- Dove acquistarla -->
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

        <!-- Prezzi -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-3">
            <h3 class="font-bold text-slate-800 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="material-icons text-ct-yellow text-base">sell</span>
                ${L.prices_title}
            </h3>
            <div class="flex flex-col gap-2">
                ${L.prices.map(p => `<div class="flex items-center justify-between py-2.5 px-3 rounded-xl ${p.highlight ? 'bg-ct-yellow-light border border-yellow-200' : 'bg-slate-50'}">
                    <div>
                        <div class="text-sm font-bold text-slate-800">${p.label}</div>
                        ${p.note ? `<div class="text-[11px] text-slate-400 font-medium">${p.note}</div>` : ''}
                    </div>
                    <span class="font-black text-lg ${p.highlight ? 'text-yellow-700' : 'text-ct-green'} ml-3 shrink-0">${p.price}</span>
                </div>`).join('')}
            </div>
        </div>

        <!-- Cosa include -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-3">
            <h3 class="font-bold text-slate-800 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="material-icons text-ct-blue text-base">confirmation_number</span>
                ${L.included_title}
            </h3>
            <ul class="flex flex-col gap-2">
                ${L.included.map(i => `<li class="flex items-center gap-2.5 text-sm text-slate-600">
                    <span class="material-icons text-ct-blue text-sm shrink-0">check</span>
                    <span>${i}</span>
                </li>`).join('')}
            </ul>
        </div>

        <!-- Nota -->
        <div class="rounded-2xl p-4 mb-4 bg-amber-50 border border-amber-100">
            <p class="text-xs font-bold text-amber-700 mb-1">${L.note_title}</p>
            <p class="text-xs text-amber-600 leading-relaxed">${L.note}</p>
        </div>

        <!-- Link ufficiale -->
        <button
            onclick="window.open('https://www.parconazionale5terre.it', '_blank')"
            class="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest text-white active:scale-[0.97] transition-all shadow-md flex items-center justify-center gap-2 touch-manipulation"
            style="background: linear-gradient(135deg, #264653, #2A9D8F)">
            <span class="material-icons text-base">open_in_new</span>
            ${L.official_site}
        </button>
    </div>`;
};


// ─────────────────────────────────────────────────────────────────────────────
//  9. NEAR ME — Ordinamento per distanza (geolocalizzazione)
// ─────────────────────────────────────────────────────────────────────────────
// Toggle state: true = ordina per distanza, false = ordine originale
window._nearMeEnabled = false;
// Cached user position (aggiornata da getCurrentPosition)
window._nearMePos = null;

/**
 * Toggle del pulsante "Vicino a me" nella filter bar.
 * Se si attiva per la prima volta, chiede il permesso geo tramite il flusso branded.
 * @param {string}   btnId    — id del bottone near-me nella filter bar
 * @param {Function} callback — richiamata dopo il toggle per rinfrescare la lista
 */
window.toggleNearMe = function(btnId, callback) {
    const btn = document.getElementById(btnId);

    // Se sta per attivarsi e non abbiamo posizione: chiedi permesso
    if (!window._nearMeEnabled && !window._nearMePos) {
        window._requestGeoPermission(
            () => {
                // Permesso concesso: ottieni posizione
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        window._nearMePos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        window._nearMeEnabled = true;
                        if (btn) { btn.classList.add('active-near-me'); btn.setAttribute('aria-pressed', 'true'); }
                        if (callback) callback();
                    },
                    (err) => {
                        console.warn('Near Me geo error:', err.message);
                        window._nearMeEnabled = false;
                    },
                    { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 }
                );
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

    // Se si riattiva, aggiorna posizione in background
    if (window._nearMeEnabled) {
        navigator.geolocation.getCurrentPosition(
            (pos) => { window._nearMePos = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
            () => {},
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 120000 }
        );
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