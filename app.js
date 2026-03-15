// ===== FIREBASE AUTH SYSTEM =====
// ВАЖНО: используем db из index.html через window.firebaseDb

const authState = {
  currentUser: null,
  isAuthenticated: false,
  currentUid: null
};

let unsubscribeAuth = null;

// ========== ЭКСТРЕННЫЙ СБРОС ==========
function EMERGENCY_RESET() {
  console.log('🆘 EMERGENCY_RESET: НАЧАЛО');
  
  // 1. Сброс XP
  state.xp = 0;
  console.log('✅ state.xp = 0');
  
  // 2. Очистка localStorage
  try {
    localStorage.removeItem('pixelWordHunter_xp');
    localStorage.removeItem('pixelWordHunter_save');
  } catch(e) {}
  console.log('✅ localStorage очищен');
  
  // 3. Сброс слов
  const words = getGameData();
  words.forEach(w => {
    w.mastery = 0;
    w.lastSeen = 0;
    w.correctCount = 0;
    w.incorrectCount = 0;
  });
  console.log('✅ words reset');
  
  // 4. UI update
  if (state.ui?.xpElement) state.ui.xpElement.textContent = '0';
  updateMenuStats();
  
  console.log('🆘 EMERGENCY_RESET: КОНЕЦ');
}

// ========== Auth Listener ==========
function initAuthListener() {
  console.log('📡 Подключаем onAuthStateChanged...');
  
  unsubscribeAuth = onAuthStateChanged(window.firebaseAuth, async (user) => {
    console.log('🔔 onAuthStateChanged:', user ? user.uid : 'нет юзера');
    
    if (user && user.uid) {
      // Проверка: новый юзер?
      const isNewUser = authState.currentUid !== user.uid;
      
      if (isNewUser) {
        console.log('👤 СМЕНА ПОЛЬЗОВАТЕЛЯ:', authState.currentUid, '→', user.uid);
        
        // Если был другой юзер - полный сброс
        if (authState.currentUid !== null) {
          console.log('🔄 Сброс для нового юзера...');
          EMERGENCY_RESET();
        }
        
        authState.currentUid = user.uid;
      }
      
      authState.currentUser = user;
      authState.isAuthenticated = true;
      
      // Загружаем прогресс
      console.log('📖 loadProgress для UID:', user.uid);
      const progress = await FirestoreSync.loadProgress(user.uid);
      console.log('💾 Данные загружены:', progress?.xp ?? 0, 'XP');
      
      if (typeof updateUI === 'function') updateUI();
      
    } else {
      console.log('👋 Выход из аккаунта');
      authState.currentUser = null;
      authState.isAuthenticated = false;
      authState.currentUid = null;
    }
  });
}

initAuthListener();

// ========== Firestore Sync ==========
const FirestoreSync = {
  async loadProgress(uid) {
    if (!uid) return null;
    
    console.log('🔍 loadProgress: запрашиваю документ users/', uid);
    
    try {
      const docRef = doc(window.firebaseDb, 'users', uid);
      console.log('🔍 Документ:', docRef.path);
      
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('📦 Данные из Firestore:', JSON.stringify(data));
        
        // ВАЖНО: используем ТОЛЬКО данные из Firestore
        const loadedXp = data.xp || 0;
        state.xp = loadedXp;
        
        console.log('✅ Записано в state.xp:', state.xp);
        
        // Загрузить прогресс слов
        if (data.wordProgress) {
          const words = getGameData();
          Object.entries(data.wordProgress).forEach(([eng, progress]) => {
            const word = words.find(w => w.eng === eng);
            if (word) {
              word.mastery = progress.mastery || 0;
              word.lastSeen = progress.lastSeen || 0;
              word.correctCount = progress.correctCount || 0;
              word.incorrectCount = progress.incorrectCount || 0;
            }
          });
        }
        
        // UI
        if (state.ui?.xpElement) state.ui.xpElement.textContent = state.xp;
        updateMenuStats();
        
        return data;
      } else {
        console.log('📭 Документ НЕ существует - новый юзер');
        return null;
      }
    } catch (e) {
      console.error('❌ Ошибка loadProgress:', e);
      return null;
    }
  },
  
  async saveProgress(uid) {
    if (!uid) return;
    
    try {
      const words = getGameData();
      const wordProgress = {};
      
      words.forEach(w => {
        if (w.mastery > 0 || w.correctCount > 0 || w.incorrectCount > 0) {
          wordProgress[w.eng] = {
            mastery: w.mastery || 0,
            lastSeen: w.lastSeen || 0,
            correctCount: w.correctCount || 0,
            incorrectCount: w.incorrectCount || 0
          };
        }
      });
      
      await setDoc(doc(window.firebaseDb, 'users', uid), {
        xp: state.xp || 0,
        level: Math.floor((state.xp || 0) / 100) + 1,
        wordProgress,
        lastSync: new Date()
      }, { merge: true });
      
      console.log('💾 Сохранено:', state.xp, 'XP');
    } catch (e) {
      console.error('❌ saveProgress error:', e);
    }
  }
};

// ========== Auth Manager ==========
const AuthManager = {
  async register(username, email, password) {
    console.log('📝 Регистрация:', email);
    
    try {
      const { user } = await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
      console.log('✅ Юзер создан:', user.uid);
      
      // ВАЖНО: xp: 0 ЯВНО!
      await setDoc(doc(window.firebaseDb, 'users', user.uid), {
        username,
        email,
        xp: 0,  // ВСЕГДА 0!
        level: 1,
        category: 'Novice',
        createdAt: new Date(),
        wordProgress: {}
      });
      
      console.log('✅ Документ создан с xp: 0');
      
      return { success: true, user };
    } catch (error) {
      console.error('❌ Register error:', error);
      return { success: false, error: error.message };
    }
  },
  
  async login(email, password) {
    console.log('🔐 Логин:', email);
    try {
      await signInWithEmailAndPassword(window.firebaseAuth, email, password);
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: error.message };
    }
  },
  
  async logout() {
    await signOut(window.firebaseAuth);
    return { success: true };
  }
};




// ========== Auth Manager ==========
const AuthManager = {
  async register(username, email, password) {
    try {
      const { user } = await createUserWithEmailAndPassword(window.firebaseAuth, email, password);
      await updateProfile(user, { displayName: username });
      
      // ✅ ИСПРАВЛЕНО:xp: 0 ЯВНО для нового аккаунта!
      await setDoc(doc(window.firebaseDb, 'users', user.uid), {
        username,
        email,
        xp: 0,  // ВСЕГДА 0 для нового!
        level: 1,
        category: 'Novice',
        createdAt: new Date(),
        stats: { wordsFound: 0, gamesPlayed: 0 },
        wordProgress: {}  // Пустой прогресс слов
      });
      
      console.log('✅ Новый аккаунт создан: xp=0, uid=', user.uid.substring(0, 8));
      
      return { success: true, user };
    } catch (error) {
      console.error('❌ Register error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  },
  
  async login(email, password) {
    try {
      await signInWithEmailAndPassword(window.firebaseAuth, email, password);
      console.log('✅ Вход выполнен');
      return { success: true, message: 'Вход выполнен, загрузка...' };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  },
  
  async logout() {
    try {
      await signOut(window.firebaseAuth);
      console.log('👋 Logout выполнен');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error: error.message };
    }
  },
  
  getErrorMessage(code) {
    const errors = {
      'auth/email-already-in-use': 'Email уже зарегистрирован',
      'auth/invalid-email': 'Неверный email',
      'auth/weak-password': 'Пароль минимум 6 символов',
      'auth/user-not-found': 'Пользователь не найден',
      'auth/wrong-password': 'Неверный пароль',
      'auth/invalid-credential': 'Неверный email или пароль'
    };
    return errors[code] || 'Ошибка авторизации';
  }
};

// ========== Firestore Sync ==========
const FirestoreSync = {
  async loadProgress(uid) {
    if (!uid) { 
      console.warn('⚠️ Нет UID для загрузки');
      return null; 
    }
    
    try {
      const docSnap = await getDoc(doc(window.firebaseDb, 'users', uid));
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // ✅ ИСПРАВЛЕНО: использовать ТОЛЬКО данные из Firestore
        const loadedXp = data.xp || 0;
        state.xp = loadedXp;
        
        console.log('📥 Загружено из Firestore:', loadedXp, 'XP');
        
        // Загрузить прогресс слов
        if (data.wordProgress) {
          const words = getGameData();
          Object.entries(data.wordProgress).forEach(([eng, progress]) => {
            const word = words.find(w => w.eng === eng);
            if (word) {
              word.mastery = progress.mastery || 0;
              word.lastSeen = progress.lastSeen || 0;
              word.correctCount = progress.correctCount || 0;
              word.incorrectCount = progress.incorrectCount || 0;
              // SM-2 данные
              word.easeFactor = progress.easeFactor || 2.5;
              word.interval = progress.interval || 1;
              word.nextReview = progress.nextReview || 0;
            }
          });
        }
        
        // Обновить UI
        if (state.ui?.xpElement) {
          state.ui.xpElement.textContent = state.xp;
        }
        updateMenuStats();
        
        return data;
      } else {
        console.log('📭 Нет данных в Firestore для uid:', uid.substring(0, 8));
        return null;
      }
    } catch (e) { 
      console.error('❌ [Firestore] Load failed:', e); 
      return null;
    }
  },
  
  async saveProgress(uid) {
    if (!uid) {
      console.warn('⚠️ Нет UID для сохранения');
      return;
    }
    
    try {
      const words = getGameData();
      const wordProgress = {};
      
      words.forEach(w => {
        if (w.mastery > 0 || w.correctCount > 0 || w.incorrectCount > 0) {
          wordProgress[w.eng] = {
            mastery: w.mastery || 0,
            lastSeen: w.lastSeen || 0,
            correctCount: w.correctCount || 0,
            incorrectCount: w.incorrectCount || 0,
            easeFactor: w.easeFactor || 2.5,
            interval: w.interval || 1,
            nextReview: w.nextReview || 0
          };
        }
      });
      
      await setDoc(doc(window.firebaseDb, 'users', uid), {
        xp: state.xp || 0,
        level: Math.floor((state.xp || 0) / 100) + 1,
        wordProgress,
        lastSync: new Date(),
        stats: { wordsFound: words.filter(w => w.mastery >= 4).length }
      }, { merge: true });
      
      console.log('💾 Сохранено:', state.xp, 'XP для uid:', uid.substring(0, 8));
      
    } catch (e) { 
      console.error('❌ [Firestore] Save failed:', e); 
    }
  }
};



// UI Functions
window.showAuthModal = function(mode = 'login') {
  authState.mode = mode;
  document.getElementById('auth-title').textContent = mode === 'login' ? '// LOGIN //' : '// REGISTER //';
  document.getElementById('username-field').style.display = mode === 'register' ? 'flex' : 'none';
  document.getElementById('auth-toggle-text').textContent = mode === 'login' ? 'Need an account?' : 'Have an account?';
  document.querySelector('.auth-toggle-btn').textContent = mode === 'login' ? 'REGISTER' : 'LOGIN';
  document.getElementById('auth-error').textContent = '';
  document.getElementById('auth-form').reset();
  document.getElementById('auth-modal').classList.remove('hidden');
};
window.closeAuthModal = function() {
  document.getElementById('auth-modal').classList.add('hidden');
};
window.toggleAuthMode = function() {
  window.showAuthModal(authState.mode === 'login' ? 'register' : 'login');
};
window.handleLogout = async function() {
  const result = await AuthManager.logout();
  if (result.success) {
    authState.currentUser = null;
    authState.isAuthenticated = false;
    updateAuthUI();
    showIOSNotification('Logged out successfully');
  }
};
function showIOSNotification(message, duration = 3000) {
  const el = document.getElementById('ios-notification');
  document.getElementById('notification-text').textContent = message;
  el.classList.remove('hidden');
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.classList.add('hidden'), 400);
  }, duration);
}
function updateAuthUI() {
  const authButtons = document.getElementById('auth-buttons');
  const huntBtn = document.getElementById('hunt-btn');
  const menuScreen = document.getElementById('menu-screen');
  
  // Remove old user info
  const oldInfo = menuScreen.querySelector('.user-info');
  if (oldInfo) oldInfo.remove();
  
  if (authState.isAuthenticated) {
    authButtons?.classList.add('hidden');
    huntBtn?.classList.remove('hidden');
    
    // Add user info with logout
    const info = document.createElement('div');
    info.className = 'user-info';
    info.innerHTML = `
      <span>${authState.currentUser.displayName || authState.currentUser.email.split('@')[0]}</span>
      <button onclick="handleLogout()">LOGOUT</button>
    `;
    menuScreen.insertBefore(info, menuScreen.querySelector('.credits'));
  } else {
    authButtons?.classList.remove('hidden');
    huntBtn?.classList.add('hidden');
  }
}
// Expose showIOSNotification globally
window.showIOSNotification = showIOSNotification;

function initUI() {
  return {
    onboardingScreenElement: document.getElementById('onboarding-screen'),
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
    btn.onclick = () => onSelect(category);
    fragment.appendChild(btn);
  });
  requestAnimationFrame(() => {
    container.innerHTML = '';
    container.appendChild(fragment);
  });
}

import { loadGameData, getGameData, selectWordsForRound, generateOptionsForWord, updateWordProgress, getMasteryLevel, getMasteryLabel, getCategories, getUserWeaknesses, getCategoryStats } from './data.js';
import { saveProgress, loadProgress, resetProgress, storageGet, storageSet, storageRemove } from './storage.js';

// ========== SERVICE WORKER COMMUNICATION ==========
function sendToSW(message) {
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage(message);
    console.log('📬 Отправлено в SW:', message);
  }
}

function resetCacheForNewUser() {
  console.log('💥 Отправляем команду RESET_CACHE в SW');
  sendToSW('RESET_CACHE');
}

function setUserUidInSW(uid) {
  console.log('👤 Отправляем UID в SW:', uid);
  sendToSW({ type: 'SET_USER_UID', uid: uid });
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

  playToneSequence(steps = []) {
    if (!this.ctx || this.isMuted || !this.masterGain || steps.length === 0) return;
    this.ensureContext();

    const startAt = this.ctx.currentTime;

    steps.forEach((step) => {
      const start = startAt + step.time;
      const duration = step.duration;
      const end = start + duration;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = step.type || 'square';
      osc.frequency.setValueAtTime(step.freq, start);

      if (Number.isFinite(step.slideTo)) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(1, step.slideTo),
          end
        );
      }

      if (Number.isFinite(step.vibratoHz) && Number.isFinite(step.vibratoDepth) && step.vibratoDepth > 0) {
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'square';
        lfo.frequency.setValueAtTime(step.vibratoHz, start);
        lfoGain.gain.setValueAtTime(step.vibratoDepth, start);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(start);
        lfo.stop(end);
      }

      if (Array.isArray(step.arp) && step.arp.length > 0) {
        const slice = Math.max(0.01, duration / step.arp.length);
        step.arp.forEach((freq, idx) => {
          osc.frequency.setValueAtTime(freq, start + idx * slice);
        });
      }

      osc.connect(gain);
      gain.connect(this.masterGain);

      const attack = Math.max(0.001, Math.min(step.attack ?? 0.003, duration * 0.4));
      const release = Math.max(0.002, Math.min(step.release ?? 0.02, duration * 0.8));
      const peak = Math.max(0.01, Math.min(step.volume ?? 0.22, 0.4));

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(peak, start + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, Math.max(start + attack + 0.001, end - release));

      osc.start(start);
      osc.stop(end);
    });
  },

  playCorrectSound() {
    this.playToneSequence([
      { time: 0, freq: 659.25, duration: 0.045, volume: 0.2, type: 'square' },
      { time: 0.04, freq: 783.99, duration: 0.05, volume: 0.22, type: 'square' },
      { time: 0.08, freq: 987.77, duration: 0.055, volume: 0.24, type: 'square' },
      { time: 0.13, freq: 1318.5, duration: 0.12, volume: 0.2, type: 'square', arp: [1318.5, 1568, 1760, 1975.53], vibratoHz: 14, vibratoDepth: 6 },
      { time: 0.13, freq: 329.63, duration: 0.11, volume: 0.09, type: 'triangle' }
    ]);
  },

  playWrongSound() {
    this.playToneSequence([
      { time: 0, freq: 246.94, duration: 0.08, volume: 0.22, type: 'square', slideTo: 220 },
      { time: 0.055, freq: 196, duration: 0.09, volume: 0.2, type: 'square', slideTo: 174.61 },
      { time: 0.12, freq: 155.56, duration: 0.12, volume: 0.19, type: 'square', slideTo: 110, vibratoHz: 8, vibratoDepth: 3 },
      { time: 0.12, freq: 82.41, duration: 0.11, volume: 0.1, type: 'triangle' }
    ]);
  },

  playTransitionSound() {
    this.playToneSequence([
      { time: 0, freq: 392, duration: 0.03, volume: 0.16, type: 'square' },
      { time: 0.026, freq: 523.25, duration: 0.035, volume: 0.15, type: 'square' },
      { time: 0.054, freq: 659.25, duration: 0.04, volume: 0.14, type: 'square' },
      { time: 0.08, freq: 523.25, duration: 0.03, volume: 0.08, type: 'triangle' }
    ]);
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

const TTSEngine = {
 speak(text) {
   const synth = windows.speechSynthesis;
   if (!synth) return;
   synth.cancel();
   const utterance = new SpeechSynthesisUtterance(text);
   utterance.lang = 'en-US';
   utterance.rate = 0.8;
   synth.speak(utterance);
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
  correctInRow: 0,
  isAnswerLocked: false,
};

function unlockAnswerFlow() {
  state.isAnswerLocked = false;
}

function goToMenu({ withSound = true } = {}) {
  if (withSound) {
    AudioEngine.playTransitionSound();
  }
  unlockAnswerFlow();
  toggleScreen('menu');
}

function completeOnboarding() {
  storageSet('pixelWordHunter_onboarding_seen', 'true');
  AudioEngine.playTransitionSound();
  toggleScreen('menu');
}

function goBackFromSettings() {
  goToMenu();
}

function goBackFromCategory() {
  goToMenu();
}

function showSettings() {
  AudioEngine.playTransitionSound();
  toggleScreen('settings');
}

function exitGame() {
  goToMenu({ withSound: false });
}

function nextQuestion() {
  state.currentQ++;
  loadQuestion();
}

function handleResetProgress() {
  if (confirm('Reset all progress?')) {
    resetProgress();
    storageRemove('pixelWordHunter_xp');
    storageRemove('pixelWordHunter_onboarding_seen');
    state.xp = 0;
    location.reload();
  }
}

function handleToggleMute() {
  AudioEngine.ensureContext();
  AudioEngine.toggleMute();
  updateSoundUI();
}

function getProgressStats() {
  const words = getGameData();
  const total = words.length;
  let mastered = 0;
  let learning = 0;
  for (const word of words) {
    if (word.mastery >= 4) mastered++;
    else if (word.mastery > 0) learning++;
  }
  return { mastered, learning, newWords: total - mastered - learning, total };
}


export async function initApp() {
  AudioEngine.init();
  ThemeManager.init();

  await loadGameData();

  state.ui = initUI();

  const hasSeenOnboarding = storageGet('pixelWordHunter_onboarding_seen') === 'true';

  // ========== ИСПРАВЛЕНО: Сброс ВСЕГО при старте ==========
  console.log('🚀 1. СТАРТ: сбрасываем ВСЁ');
  
  // ВСЕГДА сбрасываем XP - загрузится из Firestore после авторизации
  state.xp = 0;
  
  // Полный сброс прогресса слов
  const words = getGameData();
  words.forEach(w => {
    w.mastery = 0;
    w.lastSeen = 0;
    w.correctCount = 0;
    w.incorrectCount = 0;
  });
  
  console.log('🚀 2. Сброс: xp=0, words cleared');

  const categories = ['All', ...getCategories()];
  renderCategoryButtons(categories, startGame);

  // НЕ вызываем loadSavedProgress() - только Firestore!
  // loadSavedProgress(); // УДАЛИТЬ!
  
  updateMenuStats();
  if (state.ui.xpElement) {
    state.ui.xpElement.textContent = '0';
  }

  toggleScreen(hasSeenOnboarding ? 'menu' : 'onboarding');

  updateSoundUI();

  const feedbackEl = state.ui.feedbackElement;
  if (feedbackEl) {
    feedbackElement.setAttribute('aria-live', 'polite');
  }

  const menuStartButton = document.querySelector('#menu-screen .start-btn');
  menuStartButton?.addEventListener('click', () => {
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

// Auth State Listener
onAuthStateChanged(window.firebaseAuth, async (user) => {
  if (user) {
    authState.currentUser = user;
    authState.isAuthenticated = true;
    
    // Load cloud progress
    await FirestoreSync.loadProgress(user.uid);
    
    // Show welcome notification
    const name = user.displayName || user.email.split('@')[0];
    showIOSNotification(`Welcome, ${name}!`);
    
    // Update XP display
    if (state.ui?.xpElement) state.ui.xpElement.textContent = state.xp;
    updateMenuStats();
  } else {
    authState.currentUser = null;
    authState.isAuthenticated = false;
  }
  updateAuthUI();
});
// Auth Form Handler
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('auth-submit');
  const errorEl = document.getElementById('auth-error');
  
  btn.disabled = true;
  errorEl.textContent = '';
  
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  
  let result;
  if (authState.mode === 'register') {
    const username = document.getElementById('auth-username').value;
    if (!username) {
      errorEl.textContent = 'Username required';
      btn.disabled = false;
      return;
    }
    result = await AuthManager.register(username, email, password);
  } else {
    result = await AuthManager.login(email, password);
  }
  
  if (result.success) {
    closeAuthModal();
  } else {
    errorEl.textContent = result.error;
  }
  btn.disabled = false;
});

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

    btn.addEventListener("keydown",(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        checkAnswer(option,word,btn);
      }
        setTimeout(() => wordSpan.classList.remove('speaking'),1500);
        checkAnswer(option, word, btn);
      }
    });
    fragment.appendChild(btn);
  });

  requestAnimationFrame(() => {
    state.ui.wordElement.innerHTML = '';
    const wordSpan = document.createElement('span');
    wordSpan.className = 'target-word';
    wordSpan.textContent = word.eng;
    wordSpan.setAttribute('role','button');
    wordSpan.setAttribute('tabindex','0');
    wordSpan.setAttribute('aria-label',`Listen to ${word.eng}`);

    wordSpan.addEventListener('click',(e) => {e.stopPropagation();  TTSEngine.speak(word.eng);
    wordSpan.classList.add('speaking');
        setTimeout(() => wordSpan.classList.remove('speaking'),1500);
                                             });
    wordSpan.addEventListener('keydown',(e) => {
      if (e.key === 'Enter' || e.key === ''){
        e.preventDefault();

        TTSEngine.speak(word.eng);

    wordSpan.classList.add('speaking');
        setTimeout(() => wordSpan.classList.remove('speaking'),1500);
      }
    });

    state.ui.wordElement.appendChild(wordSpan);
    
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

  const { mastered, learning, newWords } = getProgressStats();

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
  const { mastered, total } = getProgressStats();
  if (state.ui.masteredCountElement) {
    state.ui.masteredCountElement.textContent = mastered;
  }
  if (state.ui.totalCountElement) {
    state.ui.totalCountElement.textContent = total;
  }
}
