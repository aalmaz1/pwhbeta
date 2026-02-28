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
