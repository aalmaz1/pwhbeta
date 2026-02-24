import { loadGameData, getGameData, selectWordsForRound, generateOptionsForWord, updateWordProgress, getMasteryLevel, getMasteryLabel, getCategories } from './data.js';
import { saveProgress, loadProgress, resetProgress } from './storage.js';
import { initUI, renderCategoryButtons } from './ui.js';

const state = {
  ui: null,
  currentRound: [],
  currentQ: 0,
  xp: 0,
  selectedCategory: 'All',
  wordStartTime: 0,
  totalAnswered: 0,
  correctInRow: 0,
};

export async function initApp() {
  await loadGameData();

  state.ui = initUI();
  state.xp = parseInt(localStorage.getItem('pixelWordHunter_xp')) || 0;

  const categories = ['All', ...getCategories()];
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

  console.log('✅ App initialized with adaptive learning algorithm');
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
    const saved = savedStats[word.eng.trim()];
    if (saved) {
      word.mastery = saved.mastery || 0;
      word.lastSeen = saved.lastSeen || 0;
      word.correctCount = saved.correctCount || 0;
      word.incorrectCount = saved.incorrectCount || 0;
      restoredCount++;
    } else {
      word.mastery = 0;
      word.lastSeen = 0;
      word.correctCount = 0;
      word.incorrectCount = 0;
    }
  });

  console.log(`♻️ Restored progress for ${restoredCount} words`);
}

function startGame(category) {
  state.selectedCategory = category;
  state.correctInRow = 0;
  toggleScreen('game');
  document.getElementById('category').textContent = category;

  state.currentRound = selectWordsForRound(category, 10);
  state.currentQ = 0;
  loadQuestion();
}

function loadQuestion() {
  if (state.currentQ >= state.currentRound.length) {
    showRoundSummary();
    return;
  }

  const word = state.currentRound[state.currentQ];
  const options = generateOptionsForWord(word);

  // Batch DOM operations: prepare content first
  const fragment = document.createDocumentFragment();
  options.forEach((option) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.onclick = () => checkAnswer(option, word, btn);
    fragment.appendChild(btn);
  });

  // Apply all DOM changes in a single batch
  state.ui.wordElement.textContent = word.eng;
  state.ui.optionsElement.innerHTML = '';
  state.ui.optionsElement.appendChild(fragment);
  state.ui.explanationModal?.classList.add('hidden');

  state.wordStartTime = Date.now();
  state.totalAnswered++;
}

function checkAnswer(selected, word, btn) {
  const time = (Date.now() - state.wordStartTime) / 1000;
  const isCorrect = selected === word.correct;

  // Cache DOM reads BEFORE any writes to avoid forced reflow
  const buttons = state.ui.optionsElement.querySelectorAll('button');
  const children = Array.from(state.ui.optionsElement.children);

  // Disable all buttons
  buttons.forEach((b) => (b.onclick = null));

  if (isCorrect) {
    const { status, xp: bonus } = getScoring(time);
    state.correctInRow++;
    state.xp += bonus;
    localStorage.setItem('pixelWordHunter_xp', state.xp);
    document.getElementById('xp').textContent = state.xp;
    showFeedback(status, true, state.correctInRow);
    updateWordProgress(word.eng, true);
    // Apply visual feedback after state updates
    requestAnimationFrame(() => btn.classList.add('correct'));
  } else {
    state.correctInRow = 0;
    showFeedback('LEARN!', false, 0);
    updateWordProgress(word.eng, false);
    // Apply visual feedback after state updates
    const correctBtn = children.find((b) => b.textContent === word.correct);
    requestAnimationFrame(() => {
      btn.classList.add('wrong');
      correctBtn?.classList.add('correct');
    });
  }

  saveProgress();
  updateMenuStats();
  setTimeout(() => showExplanation(word), 1000);
}

function getScoring(time) {
  if (time < 1.2) return { status: '⚡ INSTINCT', xp: 25, multiplier: 4 };
  if (time <= 3.5) return { status: '🎯 TACTICAL', xp: 15, multiplier: 2 };
  if (time <= 6) return { status: '✅ GOOD', xp: 10, multiplier: 1 };
  return { status: '⏰ SLOW', xp: 5, multiplier: 0.5 };
}

function showExplanation(word) {
  const modal = document.getElementById('explanation-modal');
  const list = document.getElementById('explanation-list');
  if (!modal || !list) return;

  const masteryLevel = getMasteryLevel(word);
  const masteryLabel = getMasteryLabel(masteryLevel);

  const hasValidExample = word.exampleEng && !word.exampleEng.startsWith('Example with');
  const hasValidRusExample = word.exampleRus && !word.exampleRus.startsWith('Пример с');

  list.innerHTML = `
    <div style="font-size: 11px; line-height: 1.8;">
      <p style="color: #00f5ff; text-shadow: 0 0 8px #00f5ff; margin-bottom: 12px; letter-spacing: 2px;">${word.eng}</p>
      <p style="color: #39ff14; text-shadow: 0 0 8px #39ff14; margin-bottom: 14px;">${word.correct}</p>
      ${hasValidExample ? `<p style="color: #bf5fff; font-style: italic; margin-bottom: 8px;">"${word.exampleEng}"</p>` : ''}
      ${hasValidRusExample ? `<p style="color: #8877aa; font-style: italic; margin-bottom: 12px;">${word.exampleRus}</p>` : ''}
      <p style="color: #ffe600; text-align: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid #333;">
        MASTERY: <span style="color: ${getMasteryColor(masteryLevel)}">${masteryLabel}</span>
      </p>
    </div>
  `;
  modal.classList.remove('hidden');
}

function getMasteryColor(level) {
  const colors = ['#ff2d78', '#ff8800', '#ffe600', '#39ff14', '#00f5ff', '#bf5fff'];
  return colors[level] || colors[0];
}

function showRoundSummary() {
  const modal = document.getElementById('explanation-modal');
  const list = document.getElementById('explanation-list');
  if (!modal || !list) return;

  const total = state.currentRound.length;
  const mastered = getGameData().filter(w => w.mastery >= 4).length;
  const learning = getGameData().filter(w => w.mastery > 0 && w.mastery < 4).length;
  const newWords = getGameData().filter(w => w.mastery === 0).length;

  list.innerHTML = `
    <div style="font-size: 11px; line-height: 2; text-align: center;">
      <p style="color: #00f5ff; text-shadow: 0 0 8px #00f5ff; margin-bottom: 24px; letter-spacing: 3px;">
        // ROUND COMPLETE //
      </p>
      <p style="color: #ffe600; margin-bottom: 20px;">XP: <span style="color: #39ff14;">${state.xp}</span></p>
      <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
        <span style="color: #bf5fff;">🟣 ${mastered}</span>
        <span style="color: #ff8800;">🟠 ${learning}</span>
        <span style="color: #ff2d78;">🔴 ${newWords}</span>
      </div>
      <p style="color: #8877aa; font-size: 9px; margin-top: 24px;">
        Keep practicing to master all words!
      </p>
    </div>
  `;

  // Hide the default next-btn and create custom buttons
  const nextBtn = modal.querySelector('.next-btn');
  if (nextBtn) {
    nextBtn.classList.add('hidden');
  }

  // Remove any existing button container from previous round
  const existingContainer = modal.querySelector('.round-buttons');
  if (existingContainer) {
    existingContainer.remove();
  }

  // Create container for round summary buttons
  const btnContainer = document.createElement('div');
  btnContainer.className = 'round-buttons';
  btnContainer.style.cssText = 'display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;';

  // CONTINUE button - starts new round with same category
  const continueBtn = document.createElement('button');
  continueBtn.className = 'next-btn continue-btn';
  continueBtn.textContent = 'CONTINUE ▶';
  continueBtn.onclick = () => {
    modal.classList.add('hidden');
    nextBtn.classList.remove('hidden');
    nextBtn.textContent = 'NEXT ▶';
    nextBtn.onclick = () => {
      state.currentQ++;
      loadQuestion();
    };
    btnContainer.remove();
    startGame(state.selectedCategory);
  };

  // MENU button - returns to main menu
  const menuBtn = document.createElement('button');
  menuBtn.className = 'next-btn menu-btn';
  menuBtn.textContent = 'MENU ↺';
  menuBtn.onclick = () => {
    modal.classList.add('hidden');
    nextBtn.classList.remove('hidden');
    nextBtn.textContent = 'NEXT ▶';
    nextBtn.onclick = () => {
      state.currentQ++;
      loadQuestion();
    };
    btnContainer.remove();
    toggleScreen('menu');
  };

  btnContainer.appendChild(continueBtn);
  btnContainer.appendChild(menuBtn);
  modal.appendChild(btnContainer);

  modal.classList.remove('hidden');
}

function showFeedback(message, isCorrect, streak = 0) {
  const feedback = document.getElementById('feedback');
  feedback.textContent = message + (streak > 1 ? ` x${streak}` : '');
  feedback.style.color = isCorrect ? '#39ff14' : '#ff2d78';
  feedback.style.textShadow = isCorrect
    ? '0 0 10px #39ff14, 0 0 25px rgba(57,255,20,0.7)'
    : '0 0 10px #ff2d78, 0 0 25px rgba(255,45,120,0.7)';
  feedback.classList.remove('hidden');
  setTimeout(() => feedback.classList.add('hidden'), 1500);
}

function updateMenuStats() {
  const mastered = getGameData().filter((w) => w.mastery >= 4).length;
  const learning = getGameData().filter((w) => w.mastery > 0 && w.mastery < 4).length;
  document.getElementById('mastered-count').textContent = mastered;
  document.getElementById('total-count').textContent = getGameData().length;
}
