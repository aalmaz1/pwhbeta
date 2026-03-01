import { loadGameData, getGameData, selectWordsForRound, generateOptionsForWord, updateWordProgress, getMasteryLevel, getMasteryLabel, getCategories } from './data.js';
import { saveProgress, loadProgress, resetProgress, storageGet, storageSet, storageRemove } from './storage.js';
import { initUI, renderCategoryButtons } from './ui.js';

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
      }
      if (this.masterGain) {
        this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
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

  createOscillator(type, frequency) { 
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    return { osc, gain };
  },

  playCorrectSound() { 
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();

    const { osc, gain } = this.createOscillator('square', 880);
    osc.connect(gain);
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.05);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.1);
  },

  playWrongSound() { 
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();

    const { osc, gain } = this.createOscillator('sawtooth', 300);
    osc.connect(gain);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.2);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.2);
  },

  playTransitionSound() { 
    if (!this.ctx || this.isMuted) return;
    this.ensureContext();

    const filter = this.ctx.createBiquadFilter();
    const { osc, gain } = this.createOscillator('sine', 400);
    osc.connect(filter);

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
      if (theme === 'cyberpunk') {
        document.body.removeAttribute('data-theme');
      } else {
        document.body.setAttribute('data-theme', theme);
      }
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

const state = {
  ui: null,
  currentRound: [],
  currentQ: 0,
  xp: 0,
  selectedCategory: 'All',
  wordStartTime: 0,
  totalAnswered: 0,
  correctInRow: 0,
  isAnswerLocked: false,
};

export async function initApp() {
  AudioEngine.init();
  ThemeManager.init();

  await loadGameData();

  state.ui = initUI();

  const hasSeenOnboarding = storageGet('pixelWordHunter_onboarding_seen') === 'true';

  const savedXp = parseInt(storageGet('pixelWordHunter_xp'), 10);
  state.xp = Number.isFinite(savedXp) ? savedXp : 0;

  const categories = ['All', ...getCategories()];
  renderCategoryButtons(categories, startGame);

  loadSavedProgress();
  updateMenuStats();
  if (state.ui.xpElement) {
    state.ui.xpElement.textContent = state.xp;
  }

  toggleScreen(hasSeenOnboarding ? 'menu' : 'onboarding');

  updateSoundUI();

  const feedbackEl = state.ui.feedbackElement;
  if (feedbackEl) {
    feedbackEl.setAttribute('aria-live', 'polite');
  }

  document.querySelector('.start-btn').addEventListener('click', function() {
    AudioEngine.ensureContext();
    showCategories();
  });

  window.completeOnboarding = () => {
    storageSet('pixelWordHunter_onboarding_seen', 'true');
    AudioEngine.playTransitionSound();
    toggleScreen('menu');
  };

  window.exitGame = () => toggleScreen('menu');
  window.showSettings = () => {
    AudioEngine.playTransitionSound();
    toggleScreen('settings');
  };
  window.goBackFromSettings = () => {
    AudioEngine.playTransitionSound();
    state.isAnswerLocked = false;
    toggleScreen('menu');
  };
  window.goBack = () => {
    AudioEngine.playTransitionSound();
    state.isAnswerLocked = false;
    toggleScreen('menu');
  };
  window.nextQuestion = () => {
    state.currentQ++;
    loadQuestion();
  };
  window.resetProgress = () => {
    if (confirm('Reset all progress?')) {
      resetProgress();
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
  const screens = ['onboarding', 'menu', 'settings', 'category', 'game'];
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
    btn.setAttribute('aria-label', `Option ${index + 1}: ${option}`);
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
    state.ui.wordElement.innerHTML = '';
    state.ui.wordElement.textContent = word.eng;
    state.ui.wordElement.classList.remove('typewriter', 'glitch');
    void state.ui.wordElement.offsetWidth;
    state.ui.wordElement.classList.add('typewriter');

    state.ui.optionsElement.innerHTML = '';
    state.ui.optionsElement.appendChild(fragment);
    state.ui.explanationModal?.classList.add('hidden');
    state.wordStartTime = Date.now();
    state.isAnswerLocked = false;

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
    next?.focus();
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault();
    const prev = optionButtons[(idx - 1 + optionButtons.length) % optionButtons.length];
    prev?.focus();
  }
}

function checkAnswer(selected, word, btn) {
  if (state.isAnswerLocked) return;
  state.isAnswerLocked = true;

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
        feedbackElement.textContent = status + (streak > 1 ? ` x${streak}` : '');
        feedbackElement.style.color = '#39ff14';
        feedbackElement.style.textShadow = '0 0 10px #39ff14, 0 0 25px rgba(57,255,20,0.7)';
      }
    } else {
      btn.classList.add('wrong');
      const correctBtn = children.find((b) => b.textContent === word.correct);
      correctBtn?.classList.add('correct');
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
  const div = document.createElement('div');
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

  list.innerHTML = `
    <div style="font-size: 11px; line-height: 1.8;">
      <p style="color: #00f5ff; text-shadow: 0 0 8px #00f5ff; margin-bottom: 12px; letter-spacing: 2px;">${escapeHtml(word.eng)}</p>
      <p style="color: #39ff14; text-shadow: 0 0 8px #39ff14; margin-bottom: 14px;">${escapeHtml(word.correct)}</p>
      ${hasValidExample ? `<p style="color: #bf5fff; font-style: italic; margin-bottom: 8px;">"${escapeHtml(word.exampleEng)}"</p>` : ''}
      ${hasValidRusExample ? `<p style="color: #8877aa; font-style: italic; margin-bottom: 12px;">${escapeHtml(word.exampleRus)}</p>` : ''}
      <p style="color: #ffe600; text-align: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid #333;">
        MASTERY: <span style="color: ${getMasteryColor(masteryLevel)}">${escapeHtml(masteryLabel)}</span>
      </p>
    </div>
  `;

  const nextBtn = modal.querySelector('.next-btn');
  if (nextBtn) {
    nextBtn.classList.remove('hidden');
    nextBtn.textContent = 'NEXT ▶';
    nextBtn.onclick = () => {
      state.currentQ++;
      state.isAnswerLocked = false;
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

  list.innerHTML = `
    <div style="font-size: 11px; line-height: 2; text-align: center;">
      <p style="color: #00f5ff; text-shadow: 0 0 8px #00f5ff; margin-bottom: 24px; letter-spacing: 3px;">
        // ROUND COMPLETE //
      </p>
      <p style="color: #ffe600; margin-bottom: 20px;">XP: <span style="color: #39ff14;">${escapeHtml(String(state.xp))}</span></p>
      <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
        <span style="color: #bf5fff;">🟣 ${escapeHtml(String(mastered))}</span>
        <span style="color: #ff8800;">🟠 ${escapeHtml(String(learning))}</span>
        <span style="color: #ff2d78;">🔴 ${escapeHtml(String(newWords))}</span>
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
    state.isAnswerLocked = false;
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
    state.isAnswerLocked = false;
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
