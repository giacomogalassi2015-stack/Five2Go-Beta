// core/utils.js
// IMPORTANTE: Questo file deve stare nella cartella /core/
import { UI_TEXT, CLOUDINARY_BASE_URL } from './config.js'; // path corretto: siamo nella stessa cartella
import { state } from './state.js';

export function t(key) {
    const langDict = UI_TEXT[state.currentLang] || UI_TEXT['it'];
    return langDict[key] || key; 
}

export function dbCol(item, field) {
    if (!item || !item[field]) return '';
    let value = item[field];
    if (typeof value === 'object' && value !== null) {
        return value[state.currentLang] || value['it'] || '';
    }
    return value;
}

export function getSmartUrl(name, folder = '', width = 600) {
    if (!name) return 'https://via.placeholder.com/600x400?text=No+Image';
    const safeName = encodeURIComponent(name.trim()); 
    const folderPath = folder ? `${folder}/` : '';
    return `${CLOUDINARY_BASE_URL}/w_${width},c_fill,f_auto,q_auto:good,fl_progressive/${folderPath}${safeName}`;
}

function getEasterDate(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; 
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
}

export function isItalianHoliday(dateObj) {
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
}

export const registerItem = (item, prefix = '') => {
    const rawId = item.id || item.ID || item.POI_ID || item._id || Math.random().toString(36).substr(2, 9);
    const uniqueId = prefix ? `${prefix}_${rawId}` : rawId;
    state.dataCache[uniqueId] = item;
    return uniqueId;
};