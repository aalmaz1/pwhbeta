/* jshint esversion: 8 */
console.log("🚀 Pixel Word Hunter v2026 START");

// ГЛОБАЛЬНАЯ ФУНКЦИЯ ВЫХОДА ИЗ ИГРЫ
window.exitGame = function() {
  console.log("EXIT clicked");
  
  // Скрываем игровой экран
  const gameScreen = document.getElementById('game-screen');
  if (gameScreen) gameScreen.classList.add('hidden');
  
  // Скрываем модалку если открыта
  const modal = document.getElementById('explanation-modal');
  if (modal) modal.classList.add('hidden');
  
  // Скрываем фидбек
  const feedback = document.getElementById('feedback');
  if (feedback) feedback.classList.remove('show');
  
  // Показываем экран категорий
  const catScreen = document.getElementById('category-screen');
  if (catScreen) catScreen.classList.remove('hidden');
  
  // Обновляем статистику
  if (typeof updateMenuStats === 'function') updateMenuStats();
  if (typeof renderCategoryMenu === 'function') renderCategoryMenu();
};


// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
let GAME_DATA = window.GAME_DATA || [];
let allWordsFlat = [];
let ui = {};
let currentRound = [];
let currentQ = 0;
let xp = 0;
let wordStartTime = 0;
let selectedCategory = "All";

// --- ГЛОБАЛЬНЫЕ ФУНКЦИИ (Для доступа из HTML если нужно, но лучше через EventListener) ---
window.showCategories = function() {
    if (ui.menu && ui.categoryScreen) {
        ui.menu.classList.add('hidden');
        ui.categoryScreen.classList.remove('hidden');
        renderCategoryMenu();
        updateTotalStatsDisplay();
    }
};


// В НАЧАЛЕ app.js (где window.showCategories, window.resetProgress)


// ГЛОБАЛЬНАЯ ФУНКЦИЯ - запуск нового раунда
window.nextRound = function() {
  console.log("🔄 Next round:", selectedCategory);
  
  // Очищаем quiz-box (убираем кнопки ROUND COMPLETE)
  if (ui.quizBox) {
    ui.quizBox.innerHTML = '';
  }
  
  // Сбрасываем счётчик вопросов
  currentQ = 0;
  currentRound = [];
  
  // XP продолжает накапливаться (уже сохранён в localStorage)
  if (ui.xp) ui.xp.textContent = xp;
  
  // Сброс прогресс-бара
  if (ui.progress) ui.progress.style.width = '0%';
  
  // Генерируем новый набор слов
  generateSmartRound(selectedCategory);
  
  // ВАЖНО: проверяем что раунд создан
  if (currentRound && currentRound.length > 0) {
    loadQuestion();
  } else {
    console.error("❌ Не удалось создать раунд!");
    alert("Нет доступных слов для этой категории. Возврат в меню.");
    location.reload();
  }
};


window.backToMenu = function() {
    if (ui.categoryScreen && ui.menu) {
        ui.categoryScreen.classList.add('hidden');
        ui.menu.classList.remove('hidden');
    }
};

// --- ЕДИНСТВЕННАЯ ТОЧКА ВХОДА ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Инициализация...");
    
    // 1. Проверяем данные
    if (!window.GAME_DATA || Object.keys(window.GAME_DATA).length === 0) {
        console.warn("⚠️ GAME_DATA пуст или не загружен. Ждем...");
    }
    GAME_DATA = window.GAME_DATA || {};
    
    // Создаем плоский список слов
    try {
        allWordsFlat = Array.isArray(GAME_DATA) ? GAME_DATA : Object.values(GAME_DATA).flat();
    } catch (e) {
        allWordsFlat = [];
        console.error("Ошибка обработки GAME_DATA:", e);
    }
    console.log(`📚 Слов загружено: ${allWordsFlat.length}`);

    // 2. Инициализируем UI
    initUI();
    
    // 3. Загружаем прогресс
    loadSavedProgress();
    xp = parseInt(localStorage.getItem('pixelWordHunter_xp')) || 0;
    
    // 4. Обновляем статистику в меню
    updateMenuStats();
    
    // 5. Вешаем обработчики событий (Вместо onclick в HTML)
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) startBtn.addEventListener('click', window.showCategories);
    
    const resetLink = document.querySelector('.reset-link') || document.querySelector('[onclick*="resetProgress"]');
    if (resetLink) {
        resetLink.removeAttribute('onclick'); // Убираем старый атрибут если есть
        resetLink.addEventListener('click', window.resetProgress);
    }

    // 6. Убираем класс загрузки
    document.body.classList.remove('loading');
    console.log("✅ App Ready!");
});

// --- ФУНКЦИИ ИНИЦИАЛИЗАЦИИ ---
function initUI() {
    ui = {
        menu: document.getElementById('menu-screen'),
        categoryScreen: document.getElementById('category-screen'),
        game: document.getElementById('game-screen'),
        word: document.getElementById('word'),
        options: document.getElementById('options'),
        xp: document.getElementById('xp'),
        category: document.getElementById('category'),
        progress: document.getElementById('progress'),
        feedback: document.getElementById('feedback'),
        quizBox: document.getElementById('quiz-box'),
        masteredCount: document.getElementById('mastered-count'),
        totalCount: document.getElementById('total-count'),
        explanationModal: document.getElementById('explanation-modal'),
        explanationList: document.getElementById('explanation-list')
    };
}
function loadSavedProgress() {
    const raw = localStorage.getItem('pixelWordHunter_save');
    if (!raw) return;
    
    try {
        const saved = JSON.parse(raw);
        // Обновляем mastery в памяти
        allWordsFlat.forEach(w => {
            // w[0] - это eng слово в массиве
            const key = Array.isArray(w) ? w[0].trim() : w.eng.trim();
            const val = saved[key];
            if (val) {
                if (Array.isArray(w)) w[4] = val; // Если структура массива: [eng, rus, ex, exRus, mastery]
                else w.mastery = val;
            }
        });
    } catch (e) {
        console.error("Ошибка загрузки сейва:", e);
    }
}

function calculateStats(arr) {
    if (!arr || arr.length === 0) return { ns: 0, sl: 0, ms: 0 };
    let sl = 0, ms = 0;
    
    // Работаем с плоским массивом если передан объект категорий
    const flatArr = Array.isArray(arr) ? arr : Object.values(arr).flat();

    flatArr.forEach(w => {
        const m = Array.isArray(w) ? (w[4] || 0) : (w.mastery || 0);
        if (m >= 3) ms++;
        else if (m > 0) sl++;
    });

    return {
        ns: flatArr.length - sl - ms,
        sl: sl,
        ms: ms
    };
}

function updateMenuStats() {
  const totalStats = calculateStats(allWordsFlat || []);
  
  if (ui.masteredCount) ui.masteredCount.textContent = totalStats.ms || 0;
  if (ui.totalCount) ui.totalCount.textContent = allWordsFlat.length || 0;

  const statsElement = document.getElementById('total-stats');
  if (statsElement) {
    statsElement.innerHTML = `
      <div style="display:flex; justify-content:center; gap:15px; font-size:10px;">
        <span style="color:#f87171">NS: ${totalStats.ns || 0}</span>
        <span style="color:#fbbf24">SL: ${totalStats.sl || 0}</span>
        <span style="color:#4ade80">MS: ${totalStats.ms || 0}</span>
      </div>`;
  }
}


function updateTotalStatsDisplay() {
    updateMenuStats(); // Используем ту же логику
}


function renderCategoryMenu() {
  const container = document.getElementById('category-list') || document.querySelector('.category-grid');
  if (!container) return;
  
  container.innerHTML = ''; // Чистим
  
  const cats = Object.keys(window.GAME_DATA || {});
  
  // 1. Сначала все категории
  cats.forEach(cat => {
    if (!Array.isArray(window.GAME_DATA[cat])) return;
    
    const catWords = window.GAME_DATA[cat];
    const s = calculateStats(catWords);
    
    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.innerHTML = `
      <div class="category-name">${cat.toUpperCase()}</div>
      <div style="font-size:8px; margin-top:5px; line-height:1.3;">
        <span style="color:#f87171">${s.ns}</span> | 
        <span style="color:#fbbf24">${s.sl}</span> | 
        <span style="color:#4ade80">${s.ms}</span>
      </div>
    `;
    btn.onclick = () => startGame(cat);
    container.appendChild(btn);
  });

  // 2. ПОТОМ ALL WORDS (предпоследняя)
  const allBtn = document.createElement('button');
  allBtn.className = 'category-btn all';
  allBtn.innerHTML = `
    <div class="category-name">🌍<br>ALL WORDS</div>
  `;
  allBtn.onclick = () => startGame('All');
  container.appendChild(allBtn);
}




function startGame(cat) {
    selectedCategory = cat;
    ui.categoryScreen.classList.add('hidden');
    ui.game.classList.remove('hidden');
    
    currentQ = 0;
    xp = parseInt(localStorage.getItem('pixelWordHunter_xp')) || 0;
    if(ui.xp) ui.xp.textContent = xp;
    if(ui.category) ui.category.textContent = cat.toUpperCase();

    generateSmartRound(cat);
    loadQuestion();
}

function generateSmartRound(cat) {
    const pool = cat === 'All' ? allWordsFlat : window.GAME_DATA[cat];
    if (!pool) return;

    // Фильтры
    const getLvl = w => Array.isArray(w) ? (w[4]||0) : (w.mastery||0);
    
    const newW = pool.filter(w => getLvl(w) === 0);
    const learnW = pool.filter(w => getLvl(w) === 1 || getLvl(w) === 2);
    const mastW = pool.filter(w => getLvl(w) >= 3);

    // Микс: 5 изучаемых + 5 новых (или добиваем мастерами)
    let round = [...learnW.slice(0, 5), ...newW.slice(0, 5)];
    if (round.length < 10) {
        round = [...round, ...mastW.slice(0, 10 - round.length)];
    }
    
    // Формируем вопросы
    currentRound = round.sort(() => Math.random() - 0.5).map(w => {
        const isEng = Math.random() > 0.5;
        // Если массив: [eng, rus, ...]
        const engTxt = Array.isArray(w) ? w[0] : w.eng;
        const rusTxt = Array.isArray(w) ? w[1] : w.rus;
        
        return {
            question: isEng ? engTxt : rusTxt,
            correct: isEng ? rusTxt : engTxt,
            original: w,
            type: isEng ? 'eng-rus' : 'rus-eng',
            options: generateOptions(isEng ? rusTxt : engTxt, isEng)
        };
    });
}

function generateOptions(correctTxt, isEngToRus) {
    const opts = [correctTxt];
    while(opts.length < 4) {
        const randW = allWordsFlat[Math.floor(Math.random() * allWordsFlat.length)];
        // Если массив: [eng, rus]
        const txt = isEngToRus ? (Array.isArray(randW)?randW[1]:randW.rus) : (Array.isArray(randW)?randW[0]:randW.eng);
        if (!opts.includes(txt)) opts.push(txt);
    }
    return opts.sort(() => Math.random() - 0.5);
}

function loadQuestion() {
    if (currentQ >= currentRound.length) {
        finishGame();
        return;
    }
    
    const q = currentRound[currentQ];
    ui.word.textContent = q.question;
    ui.options.innerHTML = '';
    
    q.options.forEach(optTxt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = optTxt;
        btn.onclick = () => checkAnswer(optTxt, q, btn);
        ui.options.appendChild(btn);
    });

    if (ui.progress) ui.progress.style.width = `${(currentQ/currentRound.length)*100}%`;
    wordStartTime = Date.now();
}


function checkAnswer(selected, q, btn) {
    const time = (Date.now() - wordStartTime) / 1000;
    const isCorrect = selected === q.correct;
    
    // Блокируем ВСЕ кнопки и затемняем
    const allBtns = Array.from(ui.options.children);
    allBtns.forEach(b => {
        b.onclick = null;
        b.classList.add('disabled'); // Затемняем все
    });

    if (isCorrect) {
        // ✅ Убираем затемнение и красим в зеленый
        btn.classList.remove('disabled');
        btn.classList.add('correct');
        
        // XP logic
        let gain = 10;
        if (time < 1.5) gain = 25; // Instinct
        else if (time < 3.5) gain = 15; // Tactical
        
        xp += gain;
        localStorage.setItem('pixelWordHunter_xp', xp);
        if(ui.xp) ui.xp.textContent = xp;
        
        saveWordProgress(q.original, true);
        showFeedback("NICE!", true);
    } else {
        // ❌ Красим неправильную в красный
        btn.classList.remove('disabled');
        btn.classList.add('wrong');
        
        // Показываем правильную (зеленая)
        const correctBtn = allBtns.find(b => b.textContent === q.correct);
        if (correctBtn) {
            correctBtn.classList.remove('disabled');
            correctBtn.classList.add('correct');
        }
        
        saveWordProgress(q.original, false);
        showFeedback("LEARN!", false);
    }

    setTimeout(() => {
       showExplanation(q);
    }, 1000);
}




function saveWordProgress(wordObj, isCorrect) {
    // Обновляем объект
    let lvl = Array.isArray(wordObj) ? (wordObj[4]||0) : (wordObj.mastery||0);
    if (isCorrect) lvl = Math.min(lvl + 1, 3);
    else lvl = 1; // Сброс на Learning
    
    if (Array.isArray(wordObj)) wordObj[4] = lvl;
    else wordObj.mastery = lvl;

    // Сохраняем в LS
    const save = JSON.parse(localStorage.getItem('pixelWordHunter_save') || '{}');
    const key = Array.isArray(wordObj) ? wordObj[0].trim() : wordObj.eng.trim();
    save[key] = lvl;
    localStorage.setItem('pixelWordHunter_save', JSON.stringify(save));
}

function showExplanation(q) {
  ui.explanationModal.classList.remove('hidden');
  
  const w = q.original;
  const eng = Array.isArray(w) ? w[0] : w.eng;
  const rus = Array.isArray(w) ? w[1] : w.rus;
  const ex = Array.isArray(w) ? (w[2] || 'No example') : (w.ex || 'No example');
  const exRus = Array.isArray(w) ? (w[3] || '') : (w.exRus || '');

  // Генерируем таблицу со ВСЕМИ опциями (как в оригинале твоего кода)
  let tableHTML = `
    <table class="review-table">
      <thead>
        <tr>
          <th>WORD</th>
          <th>MEANING</th>
          <th>EXAMPLE</th>
        </tr>
      </thead>
      <tbody>
  `;

  // Показываем все 4 варианта (optionsList)
  q.options.forEach(optText => {
    // Находим полное слово из allWordsFlat по тексту опции
    const wordData = allWordsFlat.find(word => {
      const wEng = Array.isArray(word) ? word[0] : word.eng;
      const wRus = Array.isArray(word) ? word[1] : word.rus;
      return wEng === optText || wRus === optText;
    });

    if (!wordData) return; // Пропускаем если не нашли

    const isCorrect = (Array.isArray(wordData) ? wordData[0] : wordData.eng) === eng;
    const rowStyle = isCorrect ? 'background: rgba(74, 222, 128, 0.25); border-left: 3px solid #4ade80;' : '';
    const star = isCorrect ? '<span style="color:#fbbf24">★</span>' : '';

    const wEng = Array.isArray(wordData) ? wordData[0] : wordData.eng;
    const wRus = Array.isArray(wordData) ? wordData[1] : wordData.rus;
    const wEx = Array.isArray(wordData) ? (wordData[2] || '') : (wordData.ex || '');
    const wExRus = Array.isArray(wordData) ? (wordData[3] || '') : (wordData.exRus || '');

    tableHTML += `
      <tr style="${rowStyle}">
        <td class="word-col">${wEng} ${star}</td>
        <td class="def-col">${wRus}</td>
        <td class="ex-col">"${wEx}" <span class="ex-rus">${wExRus}</span></td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
    <button class="next-btn" onclick="window.nextQuestion()">NEXT ▶</button>
  `;

  ui.explanationList.innerHTML = tableHTML;
}

// ГЛОБАЛЬНАЯ функция (вне всех блоков)
window.nextQuestion = function() {
  const modal = document.getElementById('explanation-modal');
  if (modal) modal.classList.add('hidden');
  
  currentQ++;
  if (currentQ < currentRound.length) {
    loadQuestion();
  } else {
    finishGame();
  }
};


window.nextQuestion = function() {
    ui.explanationModal.classList.add('hidden');
    currentQ++;
    loadQuestion();
};

function finishGame() {
  // Сохраняем прогресс
  ui.progress.style.width = "100%";
  localStorage.setItem('pixelWordHunter_xp', xp);
  
  // Показываем результаты
  ui.quizBox.innerHTML = `
    <div class="question-card" style="margin-top:20px; text-align:center;">
      <h1 style="color:#4ade80; margin-bottom:20px; font-size:clamp(18px, 5vw, 28px);">
        ROUND COMPLETE!
      </h1>
      <p style="margin-bottom:25px; font-size:clamp(11px, 3vw, 13px); line-height:1.8; color:#e2e8f0;">
        XP Gained: <span style="color:#fbbf24; font-weight:bold;">${xp}</span><br>
        Progress Saved 💾
      </p>
      
      <div style="display:flex; flex-direction:column; gap:12px; width:100%; max-width:300px; margin:0 auto;">
        <button class="next-round-btn" style="background:#4ade80; color:#000; border:2px solid #4ade80; padding:14px; font-family:inherit; font-size:12px; font-weight:bold; text-transform:uppercase; cursor:pointer; box-shadow:4px 4px 0 #000;">
          🔄 NEXT ROUND
        </button>
        
        <button class="main-menu-btn" style="background:#eab308; color:#000; border:2px solid #eab308; padding:14px; font-family:inherit; font-size:12px; font-weight:bold; text-transform:uppercase; cursor:pointer; box-shadow:4px 4px 0 #000;">
          🏠 MAIN MENU
        </button>
      </div>
    </div>
  `;
  
  // Вешаем обработчики ПОСЛЕ создания HTML
  const nextBtn = ui.quizBox.querySelector('.next-round-btn');
  const menuBtn = ui.quizBox.querySelector('.main-menu-btn');
  
  if (nextBtn) {
    nextBtn.onclick = function() {
      window.nextRound();
    };
    nextBtn.onmousedown = function() {
      this.style.transform = 'translate(2px, 2px)';
      this.style.boxShadow = '2px 2px 0 #000';
    };
    nextBtn.onmouseup = function() {
      this.style.transform = '';
      this.style.boxShadow = '4px 4px 0 #000';
    };
  }
  
  if (menuBtn) {
    menuBtn.onclick = function() {
      location.reload();
    };
    menuBtn.onmousedown = function() {
      this.style.transform = 'translate(2px, 2px)';
      this.style.boxShadow = '2px 2px 0 #000';
    };
    menuBtn.onmouseup = function() {
      this.style.transform = '';
      this.style.boxShadow = '4px 4px 0 #000';
    };
  }
}


  
  // Стили для hover/active (добавляются динамически)
  const nextBtn = ui.quizBox.querySelector('.next-round-btn');
  if (nextBtn) {
    nextBtn.onmousedown = function() {
      this.style.transform = 'translate(2px, 2px)';
      this.style.boxShadow = '2px 2px 0 #000';
    };
    nextBtn.onmouseup = function() {
      this.style.transform = '';
      this.style.boxShadow = '4px 4px 0 #000';
    };
  };

// ГЛОБАЛЬНАЯ ФУНКЦИЯ - запуск нового раунда
window.nextRound = function() {
  console.log("🔄 Starting next round for:", selectedCategory);
  
  // Сбрасываем состояние
  currentQ = 0;
  currentRound = [];
  
  // Обновляем XP display (он уже сохранён)
  if (ui.xp) ui.xp.textContent = xp;
  
  // Генерируем новый раунд слов
  generateSmartRound(selectedCategory);
  
  // Запускаем первый вопрос
  loadQuestion();
};


function showFeedback(msg, success) {
    if(!ui.feedback) return;
    ui.feedback.textContent = msg;
    ui.feedback.style.color = success ? '#4ade80' : '#f87171';
    ui.feedback.classList.add('show');
    setTimeout(() => ui.feedback.classList.remove('show'), 1000);
}
