import { loadGameData, getGameData, selectWordsForRound, generateOptionsForWord, updateWordProgress, getMasteryLevel, getMasteryLabel, getCategories } from './data.js';
import { saveProgress, loadProgress, resetProgress } from './storage.js';
import { initUI, renderCategoryButtons } from './ui.js';

// ==================== AUDIO MODULE ====================
const AudioEngine = {
  ctx: null,
  masterGain: null,
  isMuted: false,
  volume: 0.7,

  // Initialize Web Audio API
  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
      
      // Load saved preferences
      const savedMute = localStorage.getItem('pixelWordHunter_muted');
      const savedVolume = localStorage.getItem('pixelWordHunter_volume');
      
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume);
        if (this.masterGain) {
          this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
        }
      }
      
      console.log('[Audio] Engine initialized');
      return true;
    } catch (e) {
      console.log('[Audio] Web Audio API not supported');
      return false;
    }
  },

  // Ensure audio context is running (required after user interaction)
  ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  // Create 8-bit style beep sound
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

  // Create 8-bit style error/boom sound
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

  // Create whoosh/transition sound
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

  // Toggle mute state
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.volume,
        this.ctx.currentTime
      );
    }
    localStorage.setItem('pixelWordHunter_muted', this.isMuted);
    return this.isMuted;
  },

  // Set volume (0-1)
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    localStorage.setItem('pixelWordHunter_volume', this.volume);
    return this.volume;
  },

  // Get current mute icon
  getMuteIcon() {
    return this.isMuted ? '🔇' : '🔊';
  }
};

// ==================== THEME MODULE ====================
const ThemeManager = {
  currentTheme: 'cyberpunk',
  themes: ['cyberpunk', 'midnight', 'matrix', '3310', 'sunset', 'mono'],

  init() {
    const savedTheme = localStorage.getItem('pixelWordHunter_theme');
    if (savedTheme) {
      const normalizedTheme = savedTheme === 'gameboy' ? '3310' : savedTheme;
      if (this.themes.includes(normalizedTheme)) {
        this.currentTheme = normalizedTheme;
      }
    }
    this.applyTheme(this.currentTheme);
    console.log('[Theme] Initialized:', this.currentTheme);
  },

  setTheme(theme) {
    if (!this.themes.includes(theme) || theme === this.currentTheme) return;
    this.currentTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem('pixelWordHunter_theme', theme);
    console.log('[Theme] Changed to:', theme);
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

  // Settings screen sound controls
  const settingsIcon = document.getElementById('settings-sound-icon');
  const settingsLabel = document.getElementById('settings-sound-label');
  const settingsBtn = document.getElementById('settings-sound-btn');
  if (settingsIcon) settingsIcon.textContent = icon;
  if (settingsLabel) settingsLabel.textContent = isMuted ? 'OFF' : 'ON';
  if (settingsBtn) settingsBtn.classList.toggle('muted', isMuted);
}

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
  AudioEngine.init();
  ThemeManager.init();

  await loadGameData();

  state.ui = initUI();
  state.xp = parseInt(localStorage.getItem('pixelWordHunter_xp')) || 0;

  const categories = ['All', ...getCategories()];
  renderCategoryButtons(categories, startGame);

  loadSavedProgress();
  updateMenuStats();
  if (state.ui.xpElement) {
    state.ui.xpElement.textContent = state.xp;
  }

  updateSoundUI();

  document.querySelector('.start-btn').addEventListener('click', showCategories);

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
      resetProgress();
      localStorage.removeItem('pixelWordHunter_xp');
      state.xp = 0;
      location.reload();
    }
  };

  window.setTheme = (theme) => {
    ThemeManager.setTheme(theme);
  };
  window.toggleMute = () => {
    AudioEngine.toggleMute();
    updateSoundUI();
  };

  console.log('✅ App initialized with audio, themes, and adaptive learning');
}

function showCategories() {
  AudioEngine.playTransitionSound();
  toggleScreen('category');
}

function toggleScreen(screen) {
  // Add exit animation to current visible screen
  const screens = ['menu', 'settings', 'category', 'game'];
  screens.forEach(s => {
    const el = state.ui[`${s}ScreenElement`];
    if (el && !el.classList.contains('hidden') && s !== screen) {
      el.classList.add('screen-exit');
      setTimeout(() => {
        el.classList.add('hidden');
        el.classList.remove('screen-exit');
      }, 300);
    }
  });

  // Show new screen with enter animation
  const targetEl = state.ui[`${screen}ScreenElement`];
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

  // Batch DOM operations: prepare content first
  const fragment = document.createDocumentFragment();
  options.forEach((option) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.onclick = () => checkAnswer(option, word, btn);
    fragment.appendChild(btn);
  });

  // Apply all DOM changes in a single batch on the next frame
  requestAnimationFrame(() => {
    state.ui.wordElement.textContent = word.eng;
    // Add typewriter effect
    state.ui.wordElement.classList.remove('typewriter', 'glitch');
    void state.ui.wordElement.offsetWidth; // Trigger reflow
    state.ui.wordElement.classList.add('typewriter');
    
    state.ui.optionsElement.innerHTML = '';
    state.ui.optionsElement.appendChild(fragment);
    state.ui.explanationModal?.classList.add('hidden');
    state.wordStartTime = Date.now();
  });

  state.totalAnswered++;
}

function checkAnswer(selected, word, btn) {
  const time = (Date.now() - state.wordStartTime) / 1000;
  const isCorrect = selected === word.correct;

  // Cache DOM reads BEFORE any writes to avoid forced reflow
  const buttons = state.ui.optionsElement.querySelectorAll('button');
  const children = Array.from(state.ui.optionsElement.children);
  const xpElement = state.ui.xpElement;
  const feedbackElement = state.ui.feedbackElement;

  // Disable all buttons immediately
  buttons.forEach((b) => (b.onclick = null));

  // Calculate all state changes first
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
    localStorage.setItem('pixelWordHunter_xp', state.xp);
    updateWordProgress(word.eng, true);
    // Play correct sound
    AudioEngine.playCorrectSound();
  } else {
    state.correctInRow = 0;
    updateWordProgress(word.eng, false);
    // Play wrong sound
    AudioEngine.playWrongSound();
  }

  // Batch ALL visual updates in a single animation frame
  requestAnimationFrame(() => {
    if (isCorrect) {
      btn.classList.add('correct');
      if (xpElement) xpElement.textContent = state.xp;
      // Show feedback
      if (feedbackElement) {
        feedbackElement.textContent = status + (streak > 1 ? ` x${streak}` : '');
        feedbackElement.style.color = '#39ff14';
        feedbackElement.style.textShadow = '0 0 10px #39ff14, 0 0 25px rgba(57,255,20,0.7)';
      }
    } else {
      btn.classList.add('wrong');
      const correctBtn = children.find((b) => b.textContent === word.correct);
      correctBtn?.classList.add('correct');
      // Show feedback
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
  if (state.ui.masteredCountElement) {
    state.ui.masteredCountElement.textContent = mastered;
  }
  if (state.ui.totalCountElement) {
    state.ui.totalCountElement.textContent = getGameData().length;
  }
}
