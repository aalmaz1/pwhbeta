import { getGameData } from './data.js';

const STORAGE_KEY = 'pixelWordHunter_save';

export function saveProgress() {
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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(saveObj));
}

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  getGameData().forEach((w) => {
    w.mastery = 0;
    w.lastSeen = 0;
    w.correctCount = 0;
    w.incorrectCount = 0;
  });
}
