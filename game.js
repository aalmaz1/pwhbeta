// game.js
import { GAME_DATA, getWordWeight } from "./data.js";
import { saveProgress } from "./storage.js";

/**
 * Генерирует раунд с умным выбором слов
 * @param {string} category - Категория слов
 * @returns {Array} Список слов для раунда
 */
export function generateSmartRound(category) {
  const pool =
    category === "All"
      ? GAME_DATA
      : GAME_DATA.filter((word) => word.category === category);

  const weightedWords = pool.map((word) => ({
    word,
    weight: getWordWeight(word.eng),
  }));

  weightedWords.sort((a, b) => b.weight - a.weight);
  return weightedWords.map((w) => w.word);
}

/**
 * Проверяет ответ пользователя
 * @param {string} selectedText - Выбранный ответ
 * @param {Object} qObj - Объект с вопросом
 * @param {HTMLElement} btn - Кнопка ответа
 */
export function checkAnswer(selectedText, qObj, btn) {
  const reactionTime = (Date.now() - wordStartTime) / 1000;
  let status = "";
  let bonusXP = 0;
  let multiplier = 1;

  const optionsContainer = document.getElementById("options");
  if (optionsContainer) {
    Array.from(optionsContainer.children).forEach((b) => (b.onclick = null));
  }

  const isCorrect = selectedText === qObj.correct;

  if (isCorrect) {
    if (reactionTime < 1.2) {
      status = "INSTINCT KILL";
      bonusXP = 25;
      multiplier = 4;
    } else if (reactionTime <= 3.5) {
      status = "TACTICAL HIT";
      bonusXP = 15;
      multiplier = 2;
    } else {
      status = "FADING ECHO";
      bonusXP = 5;
      multiplier = 0.5;
    }

    btn.classList.add("correct");
    xp += bonusXP;
    document.getElementById("xp").textContent = xp;
    localStorage.setItem("pixelWordHunter_xp", xp);
    showFeedback(status, true);
  } else {
    status = "MISFIRE...";
    btn.classList.add("wrong");
    const correctBtn = Array.from(optionsContainer.children).find(
      (b) => b.textContent === qObj.correct,
    );
    if (correctBtn) correctBtn.classList.add("correct");
    showFeedback("LEARN!", false);
    multiplier = 0;
  }

  const englishWord = qObj.question;
  saveProgress(englishWord, isCorrect, multiplier);

  if (typeof updateTotalStatsDisplay === "function") updateTotalStatsDisplay();
  if (typeof renderCategoryMenu === "function") renderCategoryMenu();

  setTimeout(() => {
    if (typeof showExplanation === "function") {
      showExplanation(qObj);
    } else {
      console.error("Функция showExplanation не найдена!");
    }
  }, 1000);
}
