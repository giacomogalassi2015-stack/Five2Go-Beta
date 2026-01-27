/* api.js - Logica Backend e Bus/Traghetti */

import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
import { mk, t, isItalianHoliday } from './utils.js';

// Inizializza Supabase
export const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Cache Variabili
let busStopsCache = null;

// --- BUS LOGIC ---

export const loadAllStops = async (selPartenza) => {
    if (!selPartenza) return;
    
    if (busStopsCache) {
        populateStartSelect(busStopsCache, selPartenza);
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('Fermate_bus') 
            .select('ID, NOME_FERMATA')
            .order('NOME_FERMATA');
            
        if (error) throw error;
        
        const mappedData = data.map(stop => ({
            id: stop.ID,
            nome: stop.NOME_FERMATA
        }));
        
        busStopsCache = mappedData;
        populateStartSelect(mappedData, selPartenza);
        
    } catch (err) {
        console.error("Errore caricamento fermate:", err);
        selPartenza.innerHTML = '';
        selPartenza.appendChild(mk('option', {}, "Errore caricamento"));
    }
};

function populateStartSelect(data, selectEl) {
    selectEl.innerHTML = '';
    selectEl.appendChild(mk('option', { value: '', disabled: true, selected: true }, t('select_placeholder')));
    data.forEach(stop => {
        selectEl.appendChild(mk('option', { value: stop.id }, stop.nome));
    });
    selectEl.disabled = false;
}

export const filterDestinations = (startId) => {
    const selArrivo = document.getElementById('selArrivo');
    const btnSearch = document.getElementById('btnSearchBus');
    
    if (!selArrivo) return;
    
    selArrivo.innerHTML = '';
    selArrivo.appendChild(mk('option', { value: '', disabled: true, selected: true }, t('select_placeholder')));
    selArrivo.disabled = true;

    if (btnSearch) {
        btnSearch.style.opacity = '0.5';
        btnSearch.style.pointerEvents = 'none';
    }

    try {
        const stops = busStopsCache || [];
        const validDestinations = stops.filter(s => String(s.id) !== String(startId));
        
        validDestinations.forEach(stop => {
            selArrivo.appendChild(mk('option', { value: stop.id }, stop.nome));
        });
        
        if (validDestinations.length > 0) {
            selArrivo.disabled = false;
        }

        selArrivo.onchange = function() {
            if (btnSearch && this.value) {
                btnSearch.style.opacity = '1';
                btnSearch.style.pointerEvents = 'auto';
            }
        };

    } catch (err) {
        console.error(err);
        selArrivo.innerHTML = '';
        selArrivo.appendChild(mk('option', {}, "Errore"));
    }
};

export const eseguiRicercaBus = async () => {
    const selPartenza = document.getElementById('selPartenza');
    const selArrivo = document.getElementById('selArrivo');
    const selData = document.getElementById('selData');
    const selOra = document.getElementById('selOra');
    const resultsContainer = document.getElementById('busResultsContainer');
    const nextCard = document.getElementById('nextBusCard');
    const list = document.getElementById('otherBusList');

    if (!selPartenza || !selArrivo || !selData || !selOra) return;

    const partenzaId = parseInt(selPartenza.value);
    const arrivoId = parseInt(selArrivo.value);
    const dataScelta = selData.value;
    const oraScelta = selOra.value;

    if (!partenzaId || !arrivoId) return;
    if (partenzaId === arrivoId) { alert("Partenza e arrivo coincidono!"); return; }

    resultsContainer.classList.remove('d-none');
    resultsContainer.style.display = 'block';
    nextCard.innerHTML = '';
    nextCard.appendChild(mk('div', { style: { textAlign:'center', padding:'20px' } }, [
        'Cercando... ', 
        mk('span', { class: 'material-icons spin' }, 'sync')
    ]));
    list.innerHTML = '';

    const dateObj = new Date(dataScelta);
    const isFestivo = isItalianHoliday(dateObj);

    const { data, error } = await supabaseClient.rpc('trova_bus', { 
        p_partenza_id: partenzaId, 
        p_arrivo_id: arrivoId, 
        p_orario_min: oraScelta, 
        p_is_festivo: isFestivo 
    });

    if (error) { 
        console.error("❌ ERRORE SQL:", error);
        nextCard.innerHTML = '';
        nextCard.appendChild(mk('div', { style: { color:'red', textAlign:'center' } }, `Errore: ${error.message}`));
        return; 
    }

    if (!data || data.length === 0) { 
        nextCard.innerHTML = '';
        nextCard.appendChild(mk('div', { style: { textAlign:'center', padding:'15px', color:'#c62828' } }, [
            mk('span', { class: 'material-icons' }, 'event_busy'), mk('br'),
            mk('strong', {}, t('bus_not_found')), mk('br'),
            mk('small', {}, t('bus_try_change'))
        ]));
        return; 
    }

    const primo = data[0];
    const pOra = primo.ora_partenza.slice(0,5);
    const aOra = primo.ora_arrivo.slice(0,5);
    const badgeClass = isFestivo ? 'badge-holiday' : 'badge-weekday';
    const badgeText = isFestivo ? t('badge_holiday') : t('badge_weekday');

    nextCard.innerHTML = '';
    nextCard.append(
        mk('div', { style: { display:'flex', justifyContent:'space-between', alignItems:'center' } }, [
            mk('div', { style: { fontSize:'0.75rem', color:'#e0f7fa', textTransform:'uppercase', fontWeight:'bold' } }, t('next_departure')),
            mk('span', { class: badgeClass }, badgeText)
        ]),
        mk('div', { class: 'bus-time-big' }, pOra),
        mk('div', { style: { fontSize:'1rem', color:'#fff' } }, [
            t('arrival') + ': ', mk('strong', {}, aOra)
        ]),
        mk('div', { style: { fontSize:'0.8rem', color:'#b2ebf2', marginTop:'5px' } }, primo.nome_linea || 'Linea Bus')
    );

    const successivi = data.slice(1);
    list.innerHTML = '';
    
    if (successivi.length > 0) {
        successivi.forEach(b => {
            const row = mk('div', { class: 'bus-list-item' }, [
                mk('span', { style: { fontWeight:'bold', color:'#333' } }, b.ora_partenza.slice(0,5)),
                mk('span', { style: { color:'#666' } }, `➜ ${b.ora_arrivo.slice(0,5)}`)
            ]);
            list.appendChild(row);
        });
    } else {
        list.appendChild(mk('div', { style: { padding:'10px', color:'#999', fontSize:'0.9rem' } }, "Nessun'altra corsa oggi."));
    }
};

// --- FERRY LOGIC ---

export const initFerrySearch = async () => {
    const selPartenza = document.getElementById('selPartenzaFerry');
    if (!selPartenza) return;

    const ferryPorts = [
        { id: 101, nome: 'La Spezia' },
        { id: 102, nome: 'Portovenere' },
        { id: 103, nome: 'Riomaggiore' },
        { id: 104, nome: 'Manarola' },
        { id: 105, nome: 'Corniglia' }, 
        { id: 106, nome: 'Vernazza' },
        { id: 107, nome: 'Monterosso' },
        { id: 108, nome: 'Levanto' }
    ];

    populateStartSelect(ferryPorts, selPartenza);

    selPartenza.onchange = function() {
        const selArrivo = document.getElementById('selArrivoFerry');
        const valid = ferryPorts.filter(p => String(p.id) !== selPartenza.value);
        
        selArrivo.innerHTML = '';
        selArrivo.appendChild(mk('option', { value:'', disabled:true, selected:true }, t('select_placeholder')));
        valid.forEach(p => selArrivo.appendChild(mk('option', { value: p.id }, p.nome)));
        selArrivo.disabled = false;
    };
};

export const eseguiRicercaTraghetto = async () => {
    const selPartenza = document.getElementById('selPartenzaFerry');
    const selArrivo = document.getElementById('selArrivoFerry');
    const selOra = document.getElementById('selOraFerry');
    const resultsContainer = document.getElementById('ferryResultsContainer');
    const nextCard = document.getElementById('nextFerryCard');
    const list = document.getElementById('otherFerryList');

    if (!selPartenza || !selArrivo) return;
    
    resultsContainer.classList.remove('d-none');
    resultsContainer.style.display = 'block';
    
    nextCard.innerHTML = '';
    nextCard.appendChild(mk('div', { style: { padding:'20px', textAlign:'center', color:'white' } }, [
        'Ricerca Battelli...', mk('span', { class: 'material-icons spin' }, 'sync')
    ]));
    list.innerHTML = '';

    const ora = selOra.value;
    
    setTimeout(() => {
        const mockData = [
            { ora_partenza: "10:00:00", ora_arrivo: "10:30:00", linea: "Linea 01 - Golfo" },
            { ora_partenza: "11:00:00", ora_arrivo: "11:30:00", linea: "Linea 01 - Golfo" },
            { ora_partenza: "14:00:00", ora_arrivo: "14:30:00", linea: "Linea 02 - Express" }
        ].filter(c => c.ora_partenza >= ora);

        if (mockData.length === 0) {
            nextCard.innerHTML = '';
            nextCard.appendChild(mk('div', { style: { textAlign:'center', padding:'15px', color:'white' } }, t('bus_not_found')));
            return;
        }

        const primo = mockData[0];
        nextCard.innerHTML = '';
        nextCard.append(
            mk('div', { style: { fontSize:'0.75rem', color:'#e1f5fe', textTransform:'uppercase', fontWeight:'bold' } }, t('next_departure')),
            mk('div', { class: 'bus-time-big' }, primo.ora_partenza.slice(0,5)),
            mk('div', { style: { fontSize:'1rem', color:'#fff' } }, `${t('arrival')}: ${primo.ora_arrivo.slice(0,5)}`),
            mk('div', { style: { fontSize:'0.8rem', color:'#b3e5fc', marginTop:'5px' } }, "Navigazione Golfo dei Poeti")
        );

        list.innerHTML = '';
        mockData.slice(1).forEach(b => {
            list.appendChild(mk('div', { class: 'bus-list-item' }, [
                mk('span', { style: { fontWeight:'bold', color:'#333' } }, b.ora_partenza.slice(0,5)),
                mk('span', { style: { color:'#666' } }, `➜ ${b.ora_arrivo.slice(0,5)}`)
            ]));
        });

    }, 800);
};