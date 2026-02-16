// ui.js

/**
 * Инициализирует UI-элементы
 * @returns {Object} Объект с ссылками на элементы
 */
export function initUI() {
  const uiElements = {
    menuScreenElement: document.getElementById("menu-screen"),
    categoryScreenElement: document.getElementById("category-screen"),
    gameScreenElement: document.getElementById("game-screen"),
    wordElement: document.getElementById("word"),
    optionsElement: document.getElementById("options"),
    xpElement: document.getElementById("xp"),
    progressElement: document.getElementById("progress"),
    feedbackElement: document.getElementById("feedback"),
    quizBoxElement: document.getElementById("quiz-box"),
    masteredCountElement: document.getElementById("mastered-count"),
    totalCountElement: document.getElementById("total-count"),
  };

  if (
    !uiElements.menuScreenElement ||
    !uiElements.categoryScreenElement ||
    !uiElements.gameScreenElement
  ) {
    console.error("Ошибка: Не все UI элементы найдены");
  }

  return uiElements;
}

/**
 * Рендерит кнопки категорий
 * @param {Array} categories - список категорий
 * @param {Function} onCategorySelect - обработчик выбора категории
 */
export function renderCategoryButtons(categories, onCategorySelect) {
  const container = document.getElementById("category-list");
  if (!container) {
    console.warn("Нет контейнера для кнопок категорий");
    return;
  }
  container.innerHTML = ""; // очистка контейнера

  // Кнопка "All"
  const allBtn = document.createElement("button");
  allBtn.textContent = "All";
  allBtn.className = "category-btn";
  allBtn.onclick = () => onCategorySelect("All");
  container.appendChild(allBtn);

  // Остальные категории
  const uniqueCategories = [...new Set(categories)];
  uniqueCategories.forEach((category) => {
    if (category !== "All") {
      const btn = document.createElement("button");
      btn.textContent = category;
      btn.className = "category-btn";
      btn.onclick = () => onCategorySelect(category);
      container.appendChild(btn);
    }
  });
}
