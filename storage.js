// storage.js
import { GAME_DATA } from "./data.js";

/**
 * Сохраняет прогресс пользователя
 * @param {string} word - Английское слово
 * @param {boolean} isCorrect - Был ли ответ правильным
 * @param {number} multiplier - Множитель для опыта
 */
export function saveProgress(word, isCorrect, multiplier) {
  const searchKey = word.toString().toLowerCase().trim();
  let wordObj = null;

  GAME_DATA.forEach((w) => {
    if (
      w.eng.toLowerCase().trim() === searchKey ||
      w.word.toLowerCase().trim() === searchKey
    ) {
      wordObj = w;
    }
  });

  if (!wordObj) {
    console.warn(`⚠️ SaveProgress: Слово "${searchKey}" не найдено.`);
    return;
  }

  wordObj.mastery = isCorrect ? Math.min((wordObj.mastery || 0) + 1, 3) : 1;

  const saveObj = {};
  for (const category in GAME_DATA) {
    if (GAME_DATA.hasOwnProperty(category)) {
      GAME_DATA[category].forEach((w) => {
        if (w.mastery > 0) {
          saveObj[w.eng] = w.mastery;
        }
      });
    }
  }

  localStorage.setItem("pixelWordHunter_save", JSON.stringify(saveObj));
  console.log(`✅ Прогресс по "${wordObj.eng}" сохранён!`);
}
