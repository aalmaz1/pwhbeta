// data.js
import words from "./words_optimized.json" assert { type: "json" };

export const GAME_DATA = words;

/**
 * Возвращает вес слова на основе прогресса пользователя
 * @param {string} word - Английское слово (например, "abide by")
 * @returns {number} Вес слова
 */
export function getWordWeight(word) {
  const progress =
    JSON.parse(localStorage.getItem("pixelWordHunter_save")) || {};
  const stats = progress[word] || { mastery: 0, lastSeen: 0 };
  const now = Date.now();

  if (stats.mastery === 0) {
    console.log(`🔄 Новое слово: "${word}" (приоритет 100)`);
    return 100;
  } else if (stats.mastery < 0) {
    console.log(`🚨 Ошибка: "${word}" (приоритет 200)`);
    return 200;
  } else {
    const minsSince = (now - stats.lastSeen) / (1000 * 60);
    if (stats.mastery >= 3 && minsSince < 60) {
      console.log(`💤 Закреплённое слово: "${word}" (приоритет 5)`);
      return 5;
    } else {
      console.log(`📊 Обычное слово: "${word}" (приоритет 50)`);
      return 50;
    }
  }
}
