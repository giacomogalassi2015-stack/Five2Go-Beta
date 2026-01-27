/* utils.js - Helpers DOM, Traduzioni e Utility */

import { UI_TEXT, CLOUDINARY_BASE_URL } from './config.js';

// Stato locale della lingua
let currentLang = localStorage.getItem('app_lang') || 'it';

export const getLang = () => currentLang;
export const setLang = (lang) => {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
};

// Funzione Traduzione
export const t = (key) => {
    const langDict = UI_TEXT[currentLang] || UI_TEXT['it'] || UI_TEXT['en'];
    return langDict[key] || key;
};

// Helper creazione elementi DOM
export const mk = (tag, props = {}, children = []) => {
    const el = document.createElement(tag);
    if (props) {
        Object.entries(props).forEach(([key, val]) => {
            if (key === 'class' || key === 'className') el.className = val;
            else if (key === 'style' && typeof val === 'object') Object.assign(el.style, val);
            else if (key.startsWith('on') && typeof val === 'function') el[key.toLowerCase()] = val;
            else if (key === 'html') el.innerHTML = val;
            else if (val !== null && val !== undefined) el.setAttribute(key, val);
        });
    }
    if (children) {
        const kids = Array.isArray(children) ? children : [children];
        kids.forEach(child => {
            if (child instanceof Node) el.appendChild(child);
            else if (child !== null && child !== undefined) el.appendChild(document.createTextNode(String(child)));
        });
    }
    return el;
};

// Helper lettura colonna DB multilingua
export const dbCol = (item, field) => {
    if (!item) return '';
    let value = item[field];
    if (typeof value === 'object' && value !== null) {
        value = value[currentLang] || value['it'] || '';
    }
    return String(value); 
};

// Helper immagini Cloudinary
export const getSmartUrl = (name, folder = '', width = 600) => {
    if (!name) return 'https://via.placeholder.com/600x400?text=No+Image';
    const safeName = encodeURIComponent(name.trim()); 
    const folderPath = folder ? `${folder}/` : '';
    return `${CLOUDINARY_BASE_URL}/w_${width},c_fill,f_auto,q_auto:good,fl_progressive/${folderPath}${safeName}`;
};

// Algoritmo Pasqua per festivi
function getEasterDate(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
}

// Controllo Festivi Italiani
export const isItalianHoliday = (dateObj) => {
    const d = dateObj.getDate();
    const m = dateObj.getMonth() + 1; 
    const y = dateObj.getFullYear();
    if (dateObj.getDay() === 0) return true;
    const fixedHolidays = ["1-1", "6-1", "25-4", "1-5", "2-6", "15-8", "1-11", "8-12", "25-12", "26-12"];
    if (fixedHolidays.includes(`${d}-${m}`)) return true;
    const easter = getEasterDate(y);
    const pasquetta = new Date(easter);
    pasquetta.setDate(easter.getDate() + 1);
    if (d === pasquetta.getDate() && (m - 1) === pasquetta.getMonth()) return true;
    return false;
};