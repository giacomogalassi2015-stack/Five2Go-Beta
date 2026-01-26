// supabaseClient.js
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// Assicuriamoci che la libreria globale esista (caricata via CDN in index.html)
if (typeof supabase === 'undefined') {
    console.error('Supabase SDK non caricato via CDN.');
}

export const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);