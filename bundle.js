/**
 * Pixel Word Hunter - Bundled Application
 * All modules combined into single file for optimal FCP
 */

(function() {
  'use strict';

  // ==================== DATA MODULE ====================
  let gameData = null;
  let categoriesCache = null;
  let dataLoadPromise = null;

  const INTERVALS = {
    0: 0,
    1: 60 * 60 * 1000,
    2: 6 * 60 * 60 * 1000,
    3: 24 * 60 * 60 * 1000,
    4: 72 * 60 * 60 * 1000,
    5: 168 * 60 * 60 * 1000,
  };

  // Check localStorage for cached data first
  function getCachedData() {
    try {
      const cached = localStorage.getItem('pixelWordHunter_words_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Add runtime properties
        parsed.forEach(word => {
          word.mastery = 0;
          word.lastSeen = 0;
          word.correctCount = 0;
          word.incorrectCount = 0;
        });
        return parsed;
      }
    } catch (e) {
      console.log('[Data] No cached data found');
    }
    return null;
  }

  // Save to localStorage cache
  function cacheData(data) {
    try {
      // Don't cache with runtime properties, just original data
      const toCache = data.map(w => ({
        eng: w.eng,
        correct: w.correct,
        category: w.category,
        exampleEng: w.exampleEng,
        exampleRus: w.exampleRus
      }));
      localStorage.setItem('pixelWordHunter_words_cache', JSON.stringify(toCache));
    } catch (e) {
      console.log('[Data] Could not cache data');
    }
  }

  async function loadGameData() {
    if (gameData) return gameData;
    
    // If already loading, wait for it
    if (dataLoadPromise) return dataLoadPromise;
    
    dataLoadPromise = (async function() {
      // Try to use cached data first for instant UI
      const cached = getCachedData();
      if (cached) {
        console.log('[Data] Using cached data for instant load');
        gameData = cached;
        // Still fetch fresh data in background
        fetchFreshData();
        return gameData;
      }
      
      // No cache, must fetch
      return fetchFreshData();
    })();
    
    return dataLoadPromise;
  }

  async function fetchFreshData() {
    try {
      const response = await fetch('./words_optimized.json');
      const freshData = await response.json();
      
      freshData.forEach(word => {
        word.mastery = 0;
        word.lastSeen = 0;
        word.correctCount = 0;
        word.incorrectCount = 0;
      });
      
      gameData = freshData;
      cacheData(freshData);
      console.log('[Data] Loaded fresh data');
      return gameData;
    } catch (e) {
      console.error('[Data] Failed to load fresh data:', e);
      // If we have cached data, return that
      if (gameData) return gameData;
      throw e;
    }
  }

  function getGameData() {
    return gameData || [];
  }

  function getCategories() {
    if (!categoriesCache) {
      categoriesCache = [...new Set(getGameData().map(w => w.category))];
    }
    return categoriesCache;
  }

  function getWordsByCategory(category) {
    if (category === 'All') return getGameData();
    return getGameData().filter(w => w.category === category);
  }

  function getRandomWrongAnswers(correctWord, count = 3) {
    const allWords = getGameData();
    const wrongAnswers = allWords
      .filter(w => w.eng !== correctWord.eng)
      .sort(() => Math.random() - 0.5);
    
    const selected = [];
    const correctTranslation = correctWord.correct;
    
    for (const word of wrongAnswers) {
      if (selected.length >= count) break;
      if (word.correct !== correctTranslation && !selected.includes(word.correct)) {
        selected.push(word.correct);
      }
    }
    
    while (selected.length < count) {
      const randomIdx = Math.floor(Math.random() * allWords.length);
      const randomWord = allWords[randomIdx];
      if (randomWord.correct !== correctTranslation && !selected.includes(randomWord.correct)) {
        selected.push(randomWord.correct);
      }
    }
    
    return selected;
  }

  function generateOptionsForWord(word) {
    const wrongAnswers = getRandomWrongAnswers(word, 3);
    const allOptions = [word.correct, ...wrongAnswers];
    return shuffleArray(allOptions);
  }

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getWordPriority(word) {
    const now = Date.now();
    const lastSeen = word.lastSeen || 0;
    const mastery = word.mastery || 0;
    const timeSinceLastSeen = now - lastSeen;
    
    const interval = INTERVALS[mastery] || INTERVALS[5];
    const isDue = timeSinceLastSeen >= interval;
    
    let priority = 0;
    
    if (mastery === 0) {
      priority = 100;
    } else if (word.incorrectCount > word.correctCount) {
      priority = 90;
    } else if (isDue) {
      priority = 80;
    } else {
      priority = Math.max(10, 70 - (timeSinceLastSeen / interval) * 60);
    }
    
    return priority;
  }

  function selectWordsForRound(category, roundSize = 10) {
    const words = getWordsByCategory(category);
    if (!words || words.length === 0) return [];
    
    const wordsWithPriority = words.map(word => ({
      word,
      priority: getWordPriority(word)
    }));
    
    wordsWithPriority.sort((a, b) => b.priority - a.priority);
    
    const selected = [];
    const seen = new Set();
    
    for (const { word, priority } of wordsWithPriority) {
      if (selected.length >= roundSize) break;
      if (!seen.has(word.eng)) {
        seen.add(word.eng);
        selected.push(word);
      }
    }
    
    while (selected.length < roundSize && selected.length < words.length) {
      const remaining = words.filter(w => !seen.has(w.eng));
      if (remaining.length === 0) break;
      const randomWord = remaining[Math.floor(Math.random() * remaining.length)];
      seen.add(randomWord.eng);
      selected.push(randomWord);
    }
    
    return selected;
  }

  function updateWordProgress(wordEng, isCorrect) {
    const word = getGameData().find(w => w.eng === wordEng);
    if (!word) return;
    
    const now = Date.now();
    word.lastSeen = now;
    
    if (isCorrect) {
      word.correctCount = (word.correctCount || 0) + 1;
      word.mastery = Math.min(word.mastery + 1, 5);
    } else {
      word.incorrectCount = (word.incorrectCount || 0) + 1;
      word.mastery = Math.max(word.mastery - 1, 0);
    }
  }

  function getMasteryLevel(word) {
    return word.mastery || 0;
  }

  function getMasteryLabel(mastery) {
    const labels = ['NEW', 'LEARNING', 'FAMILIAR', 'GOOD', 'STRONG', 'MASTER'];
    return labels[mastery] || labels[0];
  }

  // ==================== STORAGE MODULE ====================
  const STORAGE_KEY = 'pixelWordHunter_save';

  function saveProgress() {
    const saveObj = {};
    getGameData().forEach((w) => {
      if (w.mastery > 0 || w.lastSeen > 0) {
        saveObj[w.eng] = {
          mastery: w.mastery,
          lastSeen: w.lastSeen,
          correctCount: w.correctCount || 0,
          incorrectCount: w.incorrectCount || 0
        };
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveObj));
  }

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function resetProgressData() {
    localStorage.removeItem(STORAGE_KEY);
    getGameData().forEach((w) => {
      w.mastery = 0;
      w.lastSeen = 0;
      w.correctCount = 0;
      w.incorrectCount = 0;
    });
  }

  // ==================== UI MODULE ====================
  function initUI() {
    return {
      menuScreenElement: document.getElementById('menu-screen'),
      categoryScreenElement: document.getElementById('category-screen'),
      gameScreenElement: document.getElementById('game-screen'),
      wordElement: document.getElementById('word'),
      optionsElement: document.getElementById('options'),
      explanationModal: document.getElementById('explanation-modal'),
    };
  }

  function renderCategoryButtons(categories, onSelect) {
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

  // ==================== APP MODULE ====================
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

  async function initApp() {
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
        resetProgressData();
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
    state.totalAnswered++;
  }

  function checkAnswer(selected, word, btn) {
    const time = (Date.now() - state.wordStartTime) / 1000;
    const isCorrect = selected === word.correct;

    state.ui.optionsElement.querySelectorAll('button').forEach((b) => (b.onclick = null));

    if (isCorrect) {
      const { status, xp: bonus } = getScoring(time);
      btn.classList.add('correct');
      state.correctInRow++;
      state.xp += bonus;
      localStorage.setItem('pixelWordHunter_xp', state.xp);
      document.getElementById('xp').textContent = state.xp;
      showFeedback(status, true, state.correctInRow);
      updateWordProgress(word.eng, true);
    } else {
      btn.classList.add('wrong');
      const correctBtn = Array.from(state.ui.optionsElement.children).find(
        (b) => b.textContent === word.correct
      );
      correctBtn?.classList.add('correct');
      state.correctInRow = 0;
      showFeedback('LEARN!', false, 0);
      updateWordProgress(word.eng, false);
    }

    saveProgress();
    updateMenuStats();
    setTimeout(() => showExplanation(word), 1000);
  }

  function getScoring(time) {
    if (time < 1.2) return { status: '⚡ INSTINCT', xp: 25 };
    if (time <= 3.5) return { status: '🎯 TACTICAL', xp: 15 };
    if (time <= 6) return { status: '✅ GOOD', xp: 10 };
    return { status: '⏰ SLOW', xp: 5 };
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

    const nextBtn = modal.querySelector('.next-btn');
    if (nextBtn) {
      nextBtn.classList.add('hidden');
    }

    const existingContainer = modal.querySelector('.round-buttons');
    if (existingContainer) {
      existingContainer.remove();
    }

    const btnContainer = document.createElement('div');
    btnContainer.className = 'round-buttons';
    btnContainer.style.cssText = 'display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;';

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

  // Export init function for external use
  window.initApp = initApp;
  
  // Auto-initialize immediately since bundle.js is deferred (DOM is ready)
  initApp();
  
  // Register service worker after page load (non-blocking)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('./sw.js')
        .then(function(registration) {
          console.log('[SW] Registered:', registration.scope);
        })
        .catch(function(error) {
          console.log('[SW] Registration failed:', error);
        });
    });
  }
})();
