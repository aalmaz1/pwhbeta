export function initUI() {
  return {
    menuScreenElement: document.getElementById('menu-screen'),
    categoryScreenElement: document.getElementById('category-screen'),
    gameScreenElement: document.getElementById('game-screen'),
    wordElement: document.getElementById('word'),
    optionsElement: document.getElementById('options'),
    explanationModal: document.getElementById('explanation-modal'),
  };
}

export function renderCategoryButtons(categories, onSelect) {
  const container = document.getElementById('category-list');
  if (!container) return;

  container.innerHTML = '';

  categories.forEach((category) => {
    const btn = document.createElement('button');
    btn.textContent = category;
    btn.className = 'category-btn';
    btn.onclick = () => onSelect(category);
    container.appendChild(btn);
  });
}
