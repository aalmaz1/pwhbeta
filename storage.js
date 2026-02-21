import { getGameData } from './data.js';

const STORAGE_KEY = 'pixelWordHunter_save';

export function saveProgress(wordEng, isCorrect, multiplier) {
  const wordObj = getGameData().find((w) => w.eng === wordEng);
  if (!wordObj) {
    console.warn(`⚠️ Word "${wordEng}" not found`);
    return;
  }

  wordObj.mastery = isCorrect
    ? Math.min((wordObj.mastery || 0) + 1, 3)
    : Math.max((wordObj.mastery || 0) - 1, 0);

  const saveObj = {};
  getGameData().forEach((w) => {
    if (w.mastery > 0) saveObj[w.eng] = w.mastery;
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
  getGameData().forEach((w) => (w.mastery = 0));
}
