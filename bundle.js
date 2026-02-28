/**
 * Pixel Word Hunter - Bundled Application
 * All modules combined into single file for optimal FCP
 */

(function() {
  'use strict';

  // ==================== STORAGE HELPERS ====================
  function isLocalStorageAvailable() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  const storageAvailable = isLocalStorageAvailable();

  function storageGet(key) {
    if (!storageAvailable) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function storageSet(key, value) {
    if (!storageAvailable) return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Quota exceeded or other storage error — silently ignore
    }
  }

  function storageRemove(key) {
    if (!storageAvailable) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently ignore
    }
  }

  // ==================== AUDIO MODULE ====================
  const AudioEngine = {
    ctx: null,
    masterGain: null,
    isMuted: false,
    volume: 0.7,
    initialized: false,

    init() {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.ctx.destination);

        const savedMute = storageGet('pixelWordHunter_muted');
        const savedVolume = storageGet('pixelWordHunter_volume');

        if (savedMute !== null) {
          this.isMuted = savedMute === 'true';
        }
        if (savedVolume !== null) {
          const parsed = parseFloat(savedVolume);
          if (Number.isFinite(parsed)) {
            this.volume = parsed;
          }
          if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
          }
        }

        this.initialized = true;
        return true;
      } catch {
        return false;
      }
    },

    ensureContext() {
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    },

    playCorrectSound() {
      if (!this.ctx || this.isMuted) return;
      this.ensureContext();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.1);
    },

    playWrongSound() {
      if (!this.ctx || this.isMuted) return;
      this.ensureContext();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.2);
    },

    playTransitionSound() {
      if (!this.ctx || this.isMuted) return;
      this.ensureContext();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(3000, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.15);
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(
          this.isMuted ? 0 : this.volume,
          this.ctx.currentTime
        );
      }
      storageSet('pixelWordHunter_muted', this.isMuted);
      return this.isMuted;
    },

    setVolume(value) {
      this.volume = Math.max(0, Math.min(1, value));
      if (this.masterGain && !this.isMuted) {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
      storageSet('pixelWordHunter_volume', this.volume);
      return this.volume;
    },

    getMuteIcon() {
      return this.isMuted ? '🔇' : '🔊';
    }
  };

  // ==================== THEME MODULE ====================
  const ThemeManager = {
    currentTheme: 'cyberpunk',
    themes: ['cyberpunk', 'midnight', 'matrix', '3310', 'sunset', 'mono'],

    init() {
      const savedTheme = storageGet('pixelWordHunter_theme');
      if (savedTheme) {
        const normalizedTheme = savedTheme === 'gameboy' ? '3310' : savedTheme;
        if (this.themes.includes(normalizedTheme)) {
          this.currentTheme = normalizedTheme;
        }
      }
      this.applyTheme(this.currentTheme);
    },

    setTheme(theme) {
      if (!this.themes.includes(theme) || theme === this.currentTheme) return;
      this.currentTheme = theme;
      this.applyTheme(theme);
      storageSet('pixelWordHunter_theme', theme);
    },

    applyTheme(theme) {
      if (document.body) {
        document.body.setAttribute('data-theme', theme);
      }
      document.querySelectorAll('.theme-btn').forEach(el => {
        el.classList.toggle('active', el.dataset.theme === theme);
      });
    },

    getCurrentTheme() {
      return this.currentTheme;
    }
  };

  // ==================== SOUND UI SYNC ====================
  function updateSoundUI() {
    const isMuted = AudioEngine.isMuted;
    const icon = AudioEngine.getMuteIcon();

    const settingsIcon = document.getElementById('settings-sound-icon');
    const settingsLabel = document.getElementById('settings-sound-label');
    const settingsBtn = document.getElementById('settings-sound-btn');
    if (settingsIcon) {
      settingsIcon.textContent = icon;
      settingsIcon.setAttribute('aria-label', isMuted ? 'Sound off' : 'Sound on');
    }
    if (settingsLabel) settingsLabel.textContent = isMuted ? 'OFF' : 'ON';
    if (settingsBtn) {
      settingsBtn.classList.toggle('muted', isMuted);
      settingsBtn.setAttribute('aria-pressed', String(isMuted));
    }
  }

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

  const MAX_FETCH_RETRIES = 3;
  const FETCH_RETRY_DELAY_MS = 1000;

  function getCachedData() {
    try {
      const cached = storageGet('pixelWordHunter_words_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.forEach(word => {
          word.mastery = 0;
          word.lastSeen = 0;
          word.correctCount = 0;
          word.incorrectCount = 0;
        });
        return parsed;
      }
    } catch {
      // No usable cached data
    }
    return null;
  }

  function cacheData(data) {
    try {
      const toCache = data.map(w => ({
        eng: w.eng,
        correct: w.correct,
        category: w.category,
        exampleEng: w.exampleEng,
        exampleRus: w.exampleRus
      }));
      storageSet('pixelWordHunter_words_cache', JSON.stringify(toCache));
    } catch {
      // Silently ignore cache write failure
    }
  }

  async function fetchWithRetry(url, retries) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        }
        return response;
      } catch (err) {
        if (attempt === retries) throw err;
        await new Promise(resolve => setTimeout(resolve, FETCH_RETRY_DELAY_MS * attempt));
      }
    }
  }

  async function fetchFreshData() {
    try {
      const response = await fetchWithRetry('./words_optimized.json', MAX_FETCH_RETRIES);
      const freshData = await response.json();

      freshData.forEach(word => {
        word.mastery = 0;
        word.lastSeen = 0;
        word.correctCount = 0;
        word.incorrectCount = 0;
      });

      gameData = freshData;
      cacheData(freshData);
      return gameData;
    } catch (err) {
      const errorEl = document.getElementById('load-error');
      if (errorEl) {
        errorEl.textContent = 'Failed to load word data. Please refresh the page.';
        errorEl.removeAttribute('hidden');
        errorEl.setAttribute('role', 'alert');
      }
      if (gameData) return gameData;
      gameData = [];
      throw err;
    }
  }

  async function loadGameData() {
    if (gameData) return gameData;
    if (dataLoadPromise) return dataLoadPromise;

    dataLoadPromise = (async function() {
      const cached = getCachedData();
      if (cached) {
        gameData = cached;
        fetchFreshData();
        return gameData;
      }
      return fetchFreshData();
    })();

    return dataLoadPromise;
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

  function getRandomWrongAnswers(correctWord, count) {
    if (count === undefined) count = 3;
    const allWords = getGameData();

    if (allWords.length <= 1) {
      return [correctWord.correct];
    }

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

    const maxIterations = allWords.length * 2;
    let iterations = 0;

    while (selected.length < count && iterations < maxIterations) {
      iterations++;
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
    const allOptions = [word.correct].concat(wrongAnswers);
    return shuffleArray(allOptions);
  }

  function shuffleArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
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

  function selectWordsForRound(category, roundSize) {
    if (roundSize === undefined) roundSize = 10;
    const words = getWordsByCategory(category);
    if (!words || words.length === 0) return [];

    const wordsWithPriority = words.map(word => ({
      word,
      priority: getWordPriority(word)
    }));

    wordsWithPriority.sort((a, b) => b.priority - a.priority);

    const selected = [];
    const seen = new Set();

    for (const item of wordsWithPriority) {
      if (selected.length >= roundSize) break;
      if (!seen.has(item.word.eng)) {
        seen.add(item.word.eng);
        selected.push(item.word);
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

    storageSet(STORAGE_KEY, JSON.stringify(saveObj));
  }

  function loadProgress() {
    try {
      return JSON.parse(storageGet(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function resetProgressData() {
    storageRemove(STORAGE_KEY);
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

  function renderCategoryButtons(categories, onSelect) {
    const container = document.getElementById('category-list');
    if (!container) return;

    const fragment = document.createDocumentFragment();

    categories.forEach((category) => {
      const btn = document.createElement('button');
      btn.textContent = category;
      btn.className = 'category-btn';
      btn.setAttribute('role', 'button');
      btn.onclick = () => onSelect(category);
      fragment.appendChild(btn);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
  }

  // Removed unused showFeedback function

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
    AudioEngine.init();
    ThemeManager.init();

    await loadGameData();

    state.ui = initUI();

    const savedXp = parseInt(storageGet('pixelWordHunter_xp'), 10);
    state.xp = Number.isFinite(savedXp) ? savedXp : 0;

    const categories = ['All'].concat(getCategories());
    renderCategoryButtons(categories, startGame);

    loadSavedProgress();
    updateMenuStats();
    if (state.ui.xpElement) {
      state.ui.xpElement.textContent = state.xp;
    }

    updateSoundUI();

    const feedbackEl = state.ui.feedbackElement;
    if (feedbackEl) {
      feedbackEl.setAttribute('aria-live', 'polite');
    }

    document.querySelector('.start-btn').addEventListener('click', function() {
      AudioEngine.ensureContext();
      showCategories();
    });

    window.exitGame = () => toggleScreen('menu');
    window.showSettings = () => {
      AudioEngine.playTransitionSound();
      toggleScreen('settings');
    };
    window.goBackFromSettings = () => {
      AudioEngine.playTransitionSound();
      toggleScreen('menu');
    };
    window.goBack = () => {
      AudioEngine.playTransitionSound();
      toggleScreen('menu');
    };
    window.nextQuestion = () => {
      state.currentQ++;
      loadQuestion();
    };
    window.resetProgress = () => {
      if (confirm('Reset all progress?')) {
        resetProgressData();
        storageRemove('pixelWordHunter_xp');
        state.xp = 0;
        location.reload();
      }
    };

    window.setTheme = (theme) => {
      ThemeManager.setTheme(theme);
    };
    window.toggleMute = () => {
      AudioEngine.ensureContext();
      AudioEngine.toggleMute();
      updateSoundUI();
    };
  }

  function showCategories() {
    AudioEngine.playTransitionSound();
    toggleScreen('category');
  }

  function toggleScreen(screen) {
    const screens = ['menu', 'settings', 'category', 'game'];
    screens.forEach(s => {
      const el = state.ui[s + 'ScreenElement'];
      if (el && !el.classList.contains('hidden') && s !== screen) {
        el.classList.add('screen-exit');
        setTimeout(() => {
          el.classList.add('hidden');
          el.classList.remove('screen-exit');
        }, 300);
      }
    });

    const targetEl = state.ui[screen + 'ScreenElement'];
    if (targetEl) {
      targetEl.classList.remove('hidden');
      targetEl.classList.add('screen-enter');
      requestAnimationFrame(() => {
        targetEl.classList.remove('screen-enter');
      });
    }
  }

  function loadSavedProgress() {
    const savedStats = loadProgress();

    getGameData().forEach((word) => {
      const saved = savedStats[word.eng.trim()];
      if (saved) {
        word.mastery = saved.mastery || 0;
        word.lastSeen = saved.lastSeen || 0;
        word.correctCount = saved.correctCount || 0;
        word.incorrectCount = saved.incorrectCount || 0;
      } else {
        word.mastery = 0;
        word.lastSeen = 0;
        word.correctCount = 0;
        word.incorrectCount = 0;
      }
    });
  }

  function startGame(category) {
    state.selectedCategory = category;
    state.correctInRow = 0;
    AudioEngine.ensureContext();
    AudioEngine.playTransitionSound();
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

    const fragment = document.createDocumentFragment();
    options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = option;
      btn.setAttribute('tabindex', '0');
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-label', 'Option ' + (index + 1) + ': ' + option);
      btn.onclick = () => checkAnswer(option, word, btn);
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          checkAnswer(option, word, btn);
        }
      });
      fragment.appendChild(btn);
    });

    requestAnimationFrame(() => {
      state.ui.wordElement.textContent = word.eng;
      state.ui.wordElement.classList.remove('typewriter', 'glitch');
      void state.ui.wordElement.offsetWidth;
      state.ui.wordElement.classList.add('typewriter');

      state.ui.optionsElement.innerHTML = '';
      state.ui.optionsElement.appendChild(fragment);
      state.ui.explanationModal && state.ui.explanationModal.classList.add('hidden');
      state.wordStartTime = Date.now();

      const optionButtons = state.ui.optionsElement.querySelectorAll('.option-btn');
      optionButtons.forEach(btn => {
        btn.addEventListener('keydown', (e) => handleOptionKeyNav(e, optionButtons));
      });

      const firstOption = optionButtons[0];
      if (firstOption) firstOption.focus();
    });

    state.totalAnswered++;
  }

  function handleOptionKeyNav(e, optionButtons) {
    const current = document.activeElement;
    const idx = Array.from(optionButtons).indexOf(current);
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = optionButtons[(idx + 1) % optionButtons.length];
      if (next) next.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = optionButtons[(idx - 1 + optionButtons.length) % optionButtons.length];
      if (prev) prev.focus();
    }
  }

  function checkAnswer(selected, word, btn) {
    const time = (Date.now() - state.wordStartTime) / 1000;
    const isCorrect = selected === word.correct;

    const buttons = state.ui.optionsElement.querySelectorAll('button');
    const children = Array.from(state.ui.optionsElement.children);
    const xpElement = state.ui.xpElement;
    const feedbackElement = state.ui.feedbackElement;

    buttons.forEach((b) => {
      b.onclick = null;
      b.setAttribute('tabindex', '-1');
    });

    let status = '';
    let bonus = 0;
    let streak = 0;

    if (isCorrect) {
      const scoring = getScoring(time);
      status = scoring.status;
      bonus = scoring.xp;
      state.correctInRow++;
      streak = state.correctInRow;
      state.xp += bonus;
      if (!Number.isFinite(state.xp)) state.xp = 0;
      storageSet('pixelWordHunter_xp', state.xp);
      updateWordProgress(word.eng, true);
      AudioEngine.playCorrectSound();
    } else {
      state.correctInRow = 0;
      updateWordProgress(word.eng, false);
      AudioEngine.playWrongSound();
    }

    requestAnimationFrame(() => {
      if (isCorrect) {
        btn.classList.add('correct');
        if (xpElement) xpElement.textContent = state.xp;
        if (feedbackElement) {
          feedbackElement.textContent = status + (streak > 1 ? ' x' + streak : '');
          feedbackElement.style.color = '#39ff14';
          feedbackElement.style.textShadow = '0 0 10px #39ff14, 0 0 25px rgba(57,255,20,0.7)';
        }
      } else {
        btn.classList.add('wrong');
        const correctBtn = children.find((b) => b.textContent === word.correct);
        if (correctBtn) correctBtn.classList.add('correct');
        if (feedbackElement) {
          feedbackElement.textContent = 'LEARN!';
          feedbackElement.style.color = '#ff2d78';
          feedbackElement.style.textShadow = '0 0 10px #ff2d78, 0 0 25px rgba(255,45,120,0.7)';
        }
      }
      if (feedbackElement) {
        feedbackElement.classList.remove('hidden');
        setTimeout(() => feedbackElement.classList.add('hidden'), 1500);
      }
    });

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

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showExplanation(word) {
    const modal = document.getElementById('explanation-modal');
    const list = document.getElementById('explanation-list');
    if (!modal || !list) return;

    const masteryLevel = getMasteryLevel(word);
    const masteryLabel = getMasteryLabel(masteryLevel);

    const hasValidExample = word.exampleEng && !word.exampleEng.startsWith('Example with');
    const hasValidRusExample = word.exampleRus && !word.exampleRus.startsWith('Пример с');

    list.innerHTML =
      '<div style="font-size: 11px; line-height: 1.8;">' +
      '<p style="color: #00f5ff; text-shadow: 0 0 8px #00f5ff; margin-bottom: 12px; letter-spacing: 2px;">' + escapeHtml(word.eng) + '</p>' +
      '<p style="color: #39ff14; text-shadow: 0 0 8px #39ff14; margin-bottom: 14px;">' + escapeHtml(word.correct) + '</p>' +
      (hasValidExample ? '<p style="color: #bf5fff; font-style: italic; margin-bottom: 8px;">"' + escapeHtml(word.exampleEng) + '"</p>' : '') +
      (hasValidRusExample ? '<p style="color: #8877aa; font-style: italic; margin-bottom: 12px;">' + escapeHtml(word.exampleRus) + '</p>' : '') +
      '<p style="color: #ffe600; text-align: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid #333;">' +
      'MASTERY: <span style="color: ' + getMasteryColor(masteryLevel) + '">' + escapeHtml(masteryLabel) + '</span>' +
      '</p></div>';

    const nextBtn = modal.querySelector('.next-btn');
    if (nextBtn) {
      nextBtn.classList.remove('hidden');
      nextBtn.textContent = 'NEXT ▶';
      nextBtn.onclick = () => {
        state.currentQ++;
        loadQuestion();
      };
    }

    modal.classList.remove('hidden');

    requestAnimationFrame(() => {
      if (nextBtn) nextBtn.focus();
    });
  }

  function getMasteryColor(level) {
    const colors = ['#ff2d78', '#ff8800', '#ffe600', '#39ff14', '#00f5ff', '#bf5fff'];
    return colors[level] || colors[0];
  }

  function showRoundSummary() {
    const modal = document.getElementById('explanation-modal');
    const list = document.getElementById('explanation-list');
    if (!modal || !list) return;

    const mastered = getGameData().filter(w => w.mastery >= 4).length;
    const learning = getGameData().filter(w => w.mastery > 0 && w.mastery < 4).length;
    const newWords = getGameData().filter(w => w.mastery === 0).length;

    list.innerHTML =
      '<div style="font-size: 11px; line-height: 2; text-align: center;">' +
      '<p style="color: #00f5ff; text-shadow: 0 0 8px #00f5ff; margin-bottom: 24px; letter-spacing: 3px;">// ROUND COMPLETE //</p>' +
      '<p style="color: #ffe600; margin-bottom: 20px;">XP: <span style="color: #39ff14;">' + escapeHtml(String(state.xp)) + '</span></p>' +
      '<div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">' +
      '<span style="color: #bf5fff;">🟣 ' + escapeHtml(String(mastered)) + '</span>' +
      '<span style="color: #ff8800;">🟠 ' + escapeHtml(String(learning)) + '</span>' +
      '<span style="color: #ff2d78;">🔴 ' + escapeHtml(String(newWords)) + '</span>' +
      '</div>' +
      '<p style="color: #8877aa; font-size: 9px; margin-top: 24px;">Keep practicing to master all words!</p>' +
      '</div>';

    const nextBtn = modal.querySelector('.next-btn');
    if (nextBtn) {
      nextBtn.classList.add('hidden');
    }

    // Clean up existing container and its event listeners
    const existingContainer = modal.querySelector('.round-buttons');
    if (existingContainer) {
      const buttons = existingContainer.querySelectorAll('button');
      buttons.forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
      });
      existingContainer.remove();
    }

    const btnContainer = document.createElement('div');
    btnContainer.className = 'round-buttons';
    btnContainer.style.cssText = 'display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;';

    const continueBtn = document.createElement('button');
    continueBtn.className = 'next-btn continue-btn';
    continueBtn.textContent = 'CONTINUE ▶';
    continueBtn.setAttribute('role', 'button');
    continueBtn.setAttribute('tabindex', '0');

    const menuBtn = document.createElement('button');
    menuBtn.className = 'next-btn menu-btn';
    menuBtn.textContent = 'MENU ↺';
    menuBtn.setAttribute('role', 'button');
    menuBtn.setAttribute('tabindex', '0');

    // Use addEventListener instead of onclick for proper cleanup
    function handleContinue() {
      modal.classList.add('hidden');
      if (nextBtn) {
        nextBtn.classList.remove('hidden');
        nextBtn.textContent = 'NEXT ▶';
      }
      continueBtn.removeEventListener('click', handleContinue);
      menuBtn.removeEventListener('click', handleMenu);
      btnContainer.remove();
      startGame(state.selectedCategory);
    }

    function handleMenu() {
      modal.classList.add('hidden');
      if (nextBtn) {
        nextBtn.classList.remove('hidden');
        nextBtn.textContent = 'NEXT ▶';
      }
      continueBtn.removeEventListener('click', handleContinue);
      menuBtn.removeEventListener('click', handleMenu);
      btnContainer.remove();
      toggleScreen('menu');
    }

    continueBtn.addEventListener('click', handleContinue);
    menuBtn.addEventListener('click', handleMenu);

    btnContainer.appendChild(continueBtn);
    btnContainer.appendChild(menuBtn);
    modal.appendChild(btnContainer);

    modal.classList.remove('hidden');

    requestAnimationFrame(() => continueBtn.focus());
  }

  function updateMenuStats() {
    const mastered = getGameData().filter((w) => w.mastery >= 4).length;
    if (state.ui.masteredCountElement) {
      state.ui.masteredCountElement.textContent = mastered;
    }
    if (state.ui.totalCountElement) {
      state.ui.totalCountElement.textContent = getGameData().length;
    }
  }

  window.initApp = initApp;

  initApp();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('./sw.js').catch(function() {});
    });
  }
})();
