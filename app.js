import { loadGameData, getGameData, getWordWeight } from './data.js';
import { saveProgress, loadProgress, resetProgress } from './storage.js';
import { initUI, renderCategoryButtons } from './ui.js';

const state = {
  ui: null,
  currentRound: [],
  currentQ: 0,
  xp: 0,
  selectedCategory: 'All',
  wordStartTime: 0,
};

export async function initApp() {
  await loadGameData();

  state.ui = initUI();
  state.xp = parseInt(localStorage.getItem('pixelWordHunter_xp')) || 0;

  const categories = ['All', ...new Set(getGameData().map((w) => w.category))];
  renderCategoryButtons(categories, startGame);

  loadSavedProgress();
  updateMenuStats();
  document.getElementById('xp').textContent = state.xp;

  document.querySelector('.start-btn').addEventListener('click', showCategories);

  window.exitGame = () => toggleScreen('menu');
  window.nextQuestion = () => {
    state.currentQ++;
    loadQuestion();
  };
  window.resetProgress = () => {
    if (confirm('Reset all progress?')) {
      resetProgress();
      localStorage.removeItem('pixelWordHunter_xp');
      state.xp = 0;
      location.reload();
    }
  };

  console.log('✅ App initialized');
}

function showCategories() {
  toggleScreen('category');
}

function toggleScreen(screen) {
  state.ui.menuScreenElement.classList.toggle('hidden', screen !== 'menu');
  state.ui.categoryScreenElement.classList.toggle('hidden', screen !== 'category');
  state.ui.gameScreenElement.classList.toggle('hidden', screen !== 'game');
}

function loadSavedProgress() {
  const savedStats = loadProgress();
  let restoredCount = 0;

  getGameData().forEach((word) => {
    const mastery = savedStats[word.eng.trim()];
    if (mastery !== undefined) {
      word.mastery = mastery;
      restoredCount++;
    } else {
      word.mastery = 0;
    }
  });

  console.log(`♻️ Restored progress for ${restoredCount} words`);
}

function startGame(category) {
  state.selectedCategory = category;
  toggleScreen('game');
  document.getElementById('category').textContent = category;

  state.currentRound = generateRound(category);
  state.currentQ = 0;
  loadQuestion();
}

function generateRound(category) {
  const pool = category === 'All'
    ? getGameData()
    : getGameData().filter((w) => w.category === category);

  return pool
    .map((w) => ({ word: w, weight: getWordWeight(w.eng) }))
    .sort((a, b) => b.weight - a.weight)
    .map((w) => w.word);
}

function loadQuestion() {
  if (state.currentQ >= state.currentRound.length) {
    toggleScreen('menu');
    return;
  }

  const word = state.currentRound[state.currentQ];
  const options = shuffle([...word.options, word.translation]);

  state.ui.wordElement.textContent = word.eng;
  state.ui.optionsElement.innerHTML = '';
  state.ui.explanationModal?.classList.add('hidden');

  options.forEach((option) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.onclick = () => checkAnswer(option, word, btn);
    state.ui.optionsElement.appendChild(btn);
  });

  state.wordStartTime = Date.now();
}

function checkAnswer(selected, word, btn) {
  const time = (Date.now() - state.wordStartTime) / 1000;
  const isCorrect = selected === word.translation;

  state.ui.optionsElement.querySelectorAll('button').forEach((b) => (b.onclick = null));

  if (isCorrect) {
    const { status, xp: bonus, multiplier } = getScoring(time);
    btn.classList.add('correct');
    state.xp += bonus;
    localStorage.setItem('pixelWordHunter_xp', state.xp);
    document.getElementById('xp').textContent = state.xp;
    showFeedback(status, true);
    saveProgress(word.eng, true, multiplier);
  } else {
    btn.classList.add('wrong');
    const correctBtn = Array.from(state.ui.optionsElement.children).find(
      (b) => b.textContent === word.translation
    );
    correctBtn?.classList.add('correct');
    showFeedback('LEARN!', false);
    saveProgress(word.eng, false, 0);
  }

  updateMenuStats();
  setTimeout(() => showExplanation(word), 1000);
}

function getScoring(time) {
  if (time < 1.2) return { status: 'INSTINCT KILL', xp: 25, multiplier: 4 };
  if (time <= 3.5) return { status: 'TACTICAL HIT', xp: 15, multiplier: 2 };
  return { status: 'FADING ECHO', xp: 5, multiplier: 0.5 };
}

function showExplanation(word) {
  const modal = document.getElementById('explanation-modal');
  const list = document.getElementById('explanation-list');
  if (!modal || !list) return;

  list.innerHTML = `
    <div style="color: #fff; font-size: 12px; line-height: 1.6;">
      <p style="color: #fbbf24; margin-bottom: 10px;">${word.eng}</p>
      <p style="color: #4ade80; margin-bottom: 10px;">${word.translation}</p>
      ${word.example ? `<p style="color: #aaa; font-style: italic;">"${word.example}"</p>` : ''}
    </div>
  `;
  modal.classList.remove('hidden');
}

function showFeedback(message, isCorrect) {
  const feedback = document.getElementById('feedback');
  feedback.textContent = message;
  feedback.style.color = isCorrect ? '#4ade80' : '#ef4444';
  feedback.classList.remove('hidden');
  setTimeout(() => feedback.classList.add('hidden'), 1500);
}

function updateMenuStats() {
  const mastered = getGameData().filter((w) => w.mastery > 0).length;
  document.getElementById('mastered-count').textContent = mastered;
  document.getElementById('total-count').textContent = getGameData().length;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
