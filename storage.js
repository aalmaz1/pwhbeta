import { getGameData } from './data.js';

const STORAGE_KEY = 'pixelWordHunter_save';

function isLocalStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = isLocalStorageAvailable();

function storageGet(key) {
    if (!storageAvailable) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
    if (!storageAvailable) return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting item in localStorage for key "${key}":`, error);
  }
}

function storageRemove(key) {
  if (!storageAvailable) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Silently ignore
  }
}

export { storageGet, storageSet, storageRemove };

export function saveProgress() {
  if (!storageAvailable) return;
  try {
    const saveObj = {};
    getGameData().forEach((w) => {
      if (w.mastery > 0 || w.lastSeen > 0) {
        saveObj[w.eng] = {
          mastery: w.mastery,
          lastSeen: w.lastSeen,
          correctCount: w.correctCount || 0,
          incorrectCount: w.incorrectCount || 0
        };
      }
    });

    storageSet(STORAGE_KEY, JSON.stringify(saveObj));
  } catch (e) {
    console.warn('[Storage] Save failed:', e);
  }
}

export function loadProgress() {
  if (!storageAvailable) return {};
  try {
    return JSON.parse(storageGet(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function resetProgress() {
  if (!storageAvailable) return;
  storageRemove(STORAGE_KEY);
  getGameData().forEach((w) => {
    w.mastery = 0;
    w.lastSeen = 0;
    w.correctCount = 0;
    w.incorrectCount = 0;
  });
}

// User-specific XP storage to prevent shared XP bug
function getCurrentUserId() {
   return localStorage.getItem('pixelWordHunter_userId') || 
          (window.firebaseAuth?.currentUser?.uid) || 
          null;
 }
 
 export function setUserXP(xp) {
   const userId = getCurrentUserId() || 'guest_' + Date.now();
   storageSet(`xp_${userId}`, xp || 0);
   // Also store userId for future sessions
   if (!localStorage.getItem('pixelWordHunter_userId')) {
     storageSet('pixelWordHunter_userId', userId);
   }
 }
 
 export function getUserXP() {
   const userId = getCurrentUserId();
   if (!userId) return 0;
   const saved = storageGet(`xp_${userId}`);
   return parseInt(saved, 10) || 0;
 }
