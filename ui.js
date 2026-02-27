export function initUI() {
  return {
    menuScreenElement: document.getElementById('menu-screen'),
    settingsScreenElement: document.getElementById('settings-screen'),
    categoryScreenElement: document.getElementById('category-screen'),
    gameScreenElement: document.getElementById('game-screen'),
    wordElement: document.getElementById('word'),
    optionsElement: document.getElementById('options'),
    explanationModal: document.getElementById('explanation-modal'),
    xpElement: document.getElementById('xp'),
    masteredCountElement: document.getElementById('mastered-count'),
    totalCountElement: document.getElementById('total-count'),
    feedbackElement: document.getElementById('feedback'),
  };
}

export function renderCategoryButtons(categories, onSelect) {
  const container = document.getElementById('category-list');
  if (!container) return;

  // Use DocumentFragment to batch DOM insertions
  const fragment = document.createDocumentFragment();

  categories.forEach((category) => {
    const btn = document.createElement('button');
    btn.textContent = category;
    btn.className = 'category-btn';
    btn.onclick = () => onSelect(category);
    fragment.appendChild(btn);
  });

  // Single DOM write operation
  container.innerHTML = '';
  container.appendChild(fragment);
}
