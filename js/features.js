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
//  0. HAPTIC FEEDBACK — Micro-vibrazione per azioni importanti
//     navigator.vibrate() è supportato da tutti i browser Android moderni.
//     Su iOS Safari non è supportato ma non lancia errori (safe to call).
//     Il check evita crash su browser desktop senza API.
// ─────────────────────────────────────────────────────────────────────────────
window._haptic = function(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms || 10); } catch(e) {}
};


// ─────────────────────────────────────────────────────────────────────────────
//  CONFIRM DIALOG — Bottom-sheet di conferma branded
//  Sostituisce window.confirm() che è brutto, bloccante e non stilizzabile.
//  Uso: window._showConfirmDialog(titolo, messaggio, onConfirm)
// ─────────────────────────────────────────────────────────────────────────────
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


// ─────────────────────────────────────────────────────────────────────────────
//  STORAGE TOAST — Feedback visivo se localStorage è pieno
// ─────────────────────────────────────────────────────────────────────────────
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
        catch (e) {
            console.warn('[ITINERARY] localStorage write failed:', e);
            window._showStorageToast && window._showStorageToast();
        }
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


// ─────────────────────────────────────────────────────────────────────────────
//  4. PLAN BUTTON — Itinerary add sulle card
// ─────────────────────────────────────────────────────────────────────────────

/**
 * V1.0: renderPlanBtn e togglePlan DISABILITATI
 * Il pulsante "Aggiungi al Piano" è stato rimosso da tutte le card
 * per ridurre il carico cognitivo dell'utente nella prima release.
 * Il codice ITINERARY manager (sopra) resta dormiente per V2.
 *
 * @param {Object} itinItem — ignorato in V1.0
 * @returns {string} stringa vuota — nessun bottone renderizzato
 */
window.renderPlanBtn = function(/* itinItem */) { return ''; };
window.togglePlan    = function() { /* no-op V1.0 */ };


// ─────────────────────────────────────────────────────────────────────────────
//  5. BADGE UPDATER
//     Aggiorna i contatori visibili sui pulsanti Home (Preferiti / Itinerario)
// ─────────────────────────────────────────────────────────────────────────────
window._updateHomeBadges = function() {
    const wlBadge = document.querySelector('[data-home-badge="wishlist"]');

    if (wlBadge) {
        const count = window.WL.get().length;
        wlBadge.textContent = count;
        wlBadge.style.display = count > 0 ? 'flex' : 'none';
    }
    // V1.0: badge itinerario rimosso dalla home — pill itinerario disabilitata
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

// Helper: svuota itinerario CON CONFERMA
window._clearItinerary = function() {
    window._showConfirmDialog(
        window.t('confirm_clear_title') || 'Sei sicuro?',
        window.t('confirm_clear_itinerary') || 'Tutte le tappe verranno rimosse.',
        function() {
            window.ITINERARY.clear();
            window.renderItinerary();
            window._updateHomeBadges();
        }
    );
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

    content.innerHTML = `<div class="animate-fade pb-8">
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
            onclick="window.open('https://card.parconazionale5terre.it/', '_blank')"
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


// ─────────────────────────────────────────────────────────────────────────────
//  10. SEGNALAZIONI — "Segnala un problema" su ogni card/modal
//
//  Tabella Supabase richiesta: "Segnalazioni"
//  Colonne: id (bigint, identity), created_at (timestamptz, default now()),
//           item_type (text), item_id (text), item_name (text),
//           report_type (text), note (text), lang (text)
//
//  RLS: abilitare e creare SOLO una policy INSERT per il ruolo anon.
//  Nessuna policy SELECT/UPDATE/DELETE → i turisti non possono leggere/cancellare.
//
//  SQL da eseguire su Supabase Dashboard → SQL Editor:
//  ──────────────────────────────────────────────────
//  CREATE TABLE IF NOT EXISTS "Segnalazioni" (
//    id bigint generated always as identity primary key,
//    created_at timestamptz default now(),
//    item_type text not null,
//    item_id text,
//    item_name text,
//    report_type text not null,
//    note text default '',
//    lang text default 'it'
//  );
//  ALTER TABLE "Segnalazioni" ENABLE ROW LEVEL SECURITY;
//  CREATE POLICY "anon_can_insert" ON "Segnalazioni"
//    FOR INSERT TO anon WITH CHECK (true);
//  ──────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

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