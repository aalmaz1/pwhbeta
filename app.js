// app.js
import { GAME_DATA, getWordWeight } from "./data.js";
import { saveProgress } from "./storage.js";
import { initUI, renderCategoryButtons } from "./ui.js";

let ui; // Объект с элементами UI
let currentRound = [];
let currentQ = 0;
let xp = parseInt(localStorage.getItem("pixelWordHunter_xp")) || 0;
let selectedCategory = "All";
let wordStartTime = 0;

/**
 * Инициализирует приложение
 */
export function initApp() {
  ui = initUI();

  // Проверка, что элементы существуют
  if (!ui.menuScreenElement || !ui.gameScreenElement) {
    console.error("Не все UI элементы найдены");
    return;
  }

  // Объявляем список категорий
  const categories = [...new Set(GAME_DATA.map((w) => w.category))];
  categories.unshift("All"); // добавляем "All" в список

  // Отрисовываем кнопки категорий
  renderCategoryButtons(categories, startGame);

  loadSavedProgress();
  initProgress();
  updateMenuStats();

  // Обработчик кнопки "HUNT" на главном экране
  document.querySelector(".start-btn").addEventListener("click", () => {
    showCategories(); // Показать выбор категорий
  });

  // Обработчик выхода из игры
  window.exitGame = () => {
    ui.menuScreenElement.classList.remove("hidden");
    ui.categoryScreenElement.classList.add("hidden");
    ui.gameScreenElement.classList.add("hidden");
  };

  console.log("✅ Все системы в норме. UI готов.");
}

/**
 * Показывает экран выбора категорий
 */
function showCategories() {
  ui.menuScreenElement.classList.add("hidden");
  ui.categoryScreenElement.classList.remove("hidden");
}

/**
 * Загружает сохранённый прогресс
 */
function loadSavedProgress() {
  const rawData = localStorage.getItem("pixelWordHunter_save");
  if (!rawData) {
    console.log(" nack: Сохранений пока нет.");
    return;
  }
  const savedStats = JSON.parse(rawData);
  let restoredCount = 0;

  GAME_DATA.forEach((word) => {
    const key = word.eng.trim();
    if (savedStats[key]) {
      word.mastery = savedStats[key];
      restoredCount++;
    } else {
      word.mastery = 0;
    }
  });

  console.log(`♻️ Восстановлен прогресс для ${restoredCount} слов.`);
  updateMenuStats();
}

/**
 * Инициализация прогресса
 */
function initProgress() {
  let savedData = {};
  try {
    const raw = localStorage.getItem("pixelWordHunter_save");
    if (raw) savedData = JSON.parse(raw);
  } catch (e) {
    console.warn("⚠️ LocalStorage заблокирован.");
  }

  GAME_DATA.forEach((word) => {
    const key = word.eng.trim();
    word.mastery = savedData[key] || 0;
  });

  updateMenuStats();
  console.log("📊 Статистика инициализирована");
}

/**
 * Запускает игру с выбранной категорией
 * @param {string} category - Категория слов
 */
function startGame(category) {
  selectedCategory = category;

  // Переключаем экраны
  ui.menuScreenElement.classList.add("hidden");
  ui.categoryScreenElement.classList.add("hidden");
  ui.gameScreenElement.classList.remove("hidden");

  // Обновляем название категории
  document.getElementById("category").textContent = category;

  // Генерируем раунд
  currentRound = generateSmartRound(category);
  currentQ = 0;
  loadQuestion();
}

/**
 * Генерирует раунд с учетом веса слов
 */
function generateSmartRound(category) {
  const pool =
    category === "All"
      ? GAME_DATA
      : GAME_DATA.filter((w) => w.category === category);

  const weightedWords = pool.map((w) => ({
    word: w,
    weight: getWordWeight(w.eng),
  }));
  weightedWords.sort((a, b) => b.weight - a.weight);
  return weightedWords.map((w) => w.word);
}

/**
 * Загружает текущий вопрос
 */
function loadQuestion() {
  if (currentQ >= currentRound.length) {
    endGame();
    return;
  }

  const word = currentRound[currentQ];
  const options = shuffleArray([...word.options, word.translation]);
  const question = word.eng;
  const correct = word.translation;

  ui.wordElement.textContent = question;
  ui.optionsElement.innerHTML = "";

  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = option;
    btn.onclick = () => checkAnswer(option, { question, correct });
    ui.optionsElement.appendChild(btn);
  });

  wordStartTime = Date.now();
}

/**
 * Проверяет ответ
 */
function checkAnswer(selectedText, qObj) {
  const reactionTime = (Date.now() - wordStartTime) / 1000;
  let status = "";
  let bonusXP = 0;
  let multiplier = 1;

  Array.from(ui.optionsElement.children).forEach((b) => (b.onclick = null));

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
    // подсветка правильного ответа
    Array.from(ui.optionsElement.children)
      .find((b) => b.textContent === selectedText)
      .classList.add("correct");
    xp += bonusXP;
    localStorage.setItem("pixelWordHunter_xp", xp);
    document.getElementById("xp").textContent = xp;
    showFeedback(status, true);
  } else {
    status = "MISFIRE...";
    Array.from(ui.optionsElement.children)
      .find((b) => b.textContent === selectedText)
      .classList.add("wrong");
    Array.from(ui.optionsElement.children)
      .find((b) => b.textContent === qObj.correct)
      .classList.add("correct");
    showFeedback("LEARN!", false);
    multiplier = 0;
  }

  // сохранение прогресса
  saveProgress(qObj.question, isCorrect, multiplier);

  // обновление статистики
  updateMenuStats();

  // показываем объяснение
  setTimeout(() => {
    showExplanation(qObj);
  }, 1000);

  currentQ++;
  setTimeout(loadQuestion, 1500);
}

/**
 * Завершение игры
 */
function endGame() {
  ui.gameScreenElement.classList.add("hidden");
  ui.menuScreenElement.classList.remove("hidden");
  console.log("🎉 Игра завершена");
}

// Вспомогательные функции
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function showFeedback(message, isCorrect) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = message;
  feedback.style.color = isCorrect ? "green" : "red";
  feedback.classList.remove("hidden");
  setTimeout(() => feedback.classList.add("hidden"), 1500);
}

function updateMenuStats() {
  const masteredCount = GAME_DATA.filter((w) => w.mastery > 0).length;
  const totalCount = GAME_DATA.length;
  document.getElementById("mastered-count").textContent = masteredCount;
  document.getElementById("total-count").textContent = totalCount;
}

// Для вызова из HTML или других скриптов
window.nextQuestion = () => {
  currentQ++;
  loadQuestion();
};
