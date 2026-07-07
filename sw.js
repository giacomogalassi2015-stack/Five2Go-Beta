// ═══════════════════════════════════════════════════════════════════════════
// IMPORTANTE NON CANCELLARE O MODIFICARE QUESTO FILE: è il Service Worker, cuore della strategia offline-first dell'app. Ogni modifica va testata accuratamente, soprattutto su dispositivi mobili, per evitare regressioni nelle funzionalità offline.
//Quando aggiorni i file JS in produzione, cambia APP_VERSION = 'v1' in 'v2' — il SW eliminerà le cache vecchie e ne scaricherà di nuove fresche.
//
//
//═══════════════════════════════════════════════════════════════════════════
//  Five2Go — Service Worker
//  Versione: 1.0
//
//  QUATTRO CACHE CON STRATEGIE DISTINTE:
//
//  1. STATIC_CACHE  → Cache First
//     HTML, tutti i JS locali, manifest.json
//     Pre-cachati all'installazione. Invarianti tra sessioni.
//
//  2. CDN_CACHE  → Cache First
//     Tailwind, Supabase JS, Leaflet, Leaflet-GPX, Leaflet-Elevation,
//     Google Fonts, Material Icons.
//     Al primo caricamento vanno in rete, poi serviti sempre dalla cache.
//     Senza questi l'app non si renderizza → tenerseli in locale è critico.
//
//  3. IMAGE_CACHE  → Cache First (max 80 entry, FIFO)
//     Immagini Cloudinary. Pesanti, costose in banda mobile.
//     Cache First: l'immagine vista una volta è disponibile offline.
//     Limite 80 entry per non saturare il disco del dispositivo.
//
//  4. DATA_CACHE  → Network First con fallback cache
//     Chiamate GET a Supabase REST (/rest/v1/NomeTabella?select=*)
//     e chiamate GET a Open-Meteo (meteo).
//     Tenta sempre la rete (dati freschi); se offline restituisce
//     la risposta dell'ultima sessione riuscita.
//
//  NON cachate:
//     - Tile mappa (OpenTopoMap) → troppe, troppo pesanti
//     - Richieste non-GET (POST RPC Supabase, trova_bus, ecc.)
//     - LegalBlink (cookie consent) → script di terze parti
// ═══════════════════════════════════════════════════════════════════════════

const APP_VERSION  = 'v5';
const STATIC_CACHE = `five2go-static-${APP_VERSION}`;
const CDN_CACHE    = `five2go-cdn-${APP_VERSION}`;
const IMAGE_CACHE  = `five2go-images-${APP_VERSION}`;
const DATA_CACHE   = `five2go-data-${APP_VERSION}`;

const ALL_CACHES = [STATIC_CACHE, CDN_CACHE, IMAGE_CACHE, DATA_CACHE];

// Asset locali pre-cachati subito all'installazione del SW.
// Quando il browser installa il SW (prima visita online), questi file
// vengono scaricati e messi in CacheStorage. Da quel momento l'app
// si avvia anche completamente offline.
// NOTA: percorsi RELATIVI (./) e non assoluti (/).
// Il SW viene registrato con scope pari alla directory in cui risiede sw.js:
// i path relativi funzionano sia su dominio root sia su sottopercorso
// (es. GitHub Pages: /Five2Go-Beta/). I path assoluti '/...' puntavano
// alla root del dominio e facevano fallire cache.addAll() → install fallita.
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './js/data-logic.js',
    './js/ui-renderers.js',
    './js/legal-render.js',
    './js/ui-modal-contents.js',
    './js/ui-modal.js',
    './js/ui-map.js',
    './js/features.js',
    './js/app.js',
];

// Domini CDN da servire con Cache First
const CDN_HOSTNAMES = [
    'cdn.tailwindcss.com',
    'unpkg.com',
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
];

// Tile mappa: non cachare
const MAP_TILE_HOSTNAMES = [
    'tile.opentopomap.org',
    'basemaps.cartocdn.com',
    'openstreetmap.org',
    'tile.openstreetmap.org',
];


// ── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});


// ── ACTIVATE ─────────────────────────────────────────────────────────────────
// Elimina le cache delle versioni precedenti quando APP_VERSION cambia.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => !ALL_CACHES.includes(key))
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});


// ── FETCH ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Solo GET: POST (RPC Supabase) passano direttamente alla rete
    if (request.method !== 'GET') return;

    // Tile mappa: non intercettare
    if (MAP_TILE_HOSTNAMES.some(h => url.hostname.includes(h))) return;

    // LegalBlink: non intercettare
    if (url.hostname.includes('legalblink.it')) return;

    // 1. Asset statici locali → Cache First
    if (url.origin === self.location.origin) {
        event.respondWith(strategyCacheFirst(request, STATIC_CACHE));
        return;
    }

    // 2. CDN (librerie, font) → Cache First
    if (CDN_HOSTNAMES.some(h => url.hostname.includes(h))) {
        event.respondWith(strategyCacheFirst(request, CDN_CACHE));
        return;
    }

    // 3. Immagini Cloudinary → Cache First con limite FIFO
    if (url.hostname.includes('res.cloudinary.com')) {
        event.respondWith(strategyCacheFirstWithLimit(request, IMAGE_CACHE, 80));
        return;
    }

    // 4. Dati Supabase (GET select) → Network First con fallback cache
    if (url.hostname.includes('supabase.co')) {
        event.respondWith(strategyNetworkFirst(request, DATA_CACHE));
        return;
    }

    // 5. Open-Meteo (meteo Chicco) → Network First con fallback cache
    if (url.hostname.includes('open-meteo.com')) {
        event.respondWith(strategyNetworkFirst(request, DATA_CACHE));
        return;
    }
});


// ═══════════════════════════════════════════════════════════════════════════
//  STRATEGIE
// ═══════════════════════════════════════════════════════════════════════════

// Cache First: serve dalla cache se disponibile; altrimenti rete + salva.
async function strategyCacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Offline', { status: 503 });
    }
}

// Cache First con limite massimo di entry (FIFO).
// Dopo ogni inserimento elimina le entry più vecchie se il totale supera maxEntries.
async function strategyCacheFirstWithLimit(request, cacheName, maxEntries) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            await cache.put(request, response.clone());
            const keys = await cache.keys();
            if (keys.length > maxEntries) {
                const toDelete = keys.slice(0, keys.length - maxEntries);
                await Promise.all(toDelete.map(k => cache.delete(k)));
            }
        }
        return response;
    } catch {
        return new Response('', { status: 503 });
    }
}

// Network First: rete → cache → errore JSON.
// Garantisce dati freschi online; mostra i dati dell'ultima sessione offline.
async function strategyNetworkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({ error: 'offline', data: null }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}