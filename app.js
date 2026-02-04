/* jshint esversion: 8 */
console.log("🚀 Pixel Word Hunter v2026 START");

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

window.resetProgress = function() {
    if (confirm('Точно сбросить весь прогресс?')) {
        localStorage.removeItem('pixelWordHunter_save');
        localStorage.removeItem('pixelWordHunter_xp');
        localStorage.removeItem('pixelWordHunter_progress');
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
    const s = calculateStats(allWordsFlat);
    
    // Обновляем счетчики в главном меню
    if (ui.masteredCount) ui.masteredCount.textContent = s.ms;
    if (ui.totalCount) ui.totalCount.textContent = allWordsFlat.length;

    // Обновляем цветную полоску (БЕЗ ТАБЛИЦЫ, ЧТОБЫ НЕ КРАШИЛОСЬ)
    const statsEl = document.getElementById('total-stats');
    if (statsEl) {
        statsEl.innerHTML = `
        <div style="display:flex; justify-content:center; gap:15px; font-size:10px;">
            <span style="color:#f87171">NS: ${s.ns}</span>
            <span style="color:#fbbf24">SL: ${s.sl}</span>
            <span style="color:#4ade80">MS: ${s.ms}</span>
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
    
    // Получаем список категорий
    const cats = Object.keys(window.GAME_DATA || {});
    
    // Кнопка ALL WORDS
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn all';
    allBtn.innerHTML = `🌍<br>ALL WORDS`;
    allBtn.onclick = () => startGame('All');
    container.appendChild(allBtn);

    // Кнопки категорий
    cats.forEach(cat => {
        if (!Array.isArray(window.GAME_DATA[cat])) return;
        
        const catWords = window.GAME_DATA[cat];
        const s = calculateStats(catWords);
        
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.innerHTML = `
            <div class="category-name">${cat.toUpperCase()}</div>
            <div style="font-size:8px; margin-top:5px">
                <span style="color:#f87171">${s.ns}</span> |
                <span style="color:#fbbf24">${s.sl}</span> |
                <span style="color:#4ade80">${s.ms}</span>
            </div>
        `;
        btn.onclick = () => startGame(cat);
        container.appendChild(btn);
    });

    // Кнопка BACK
    const backBtn = document.createElement('button');
    backBtn.className = 'exit-btn'; // Или back-btn
    backBtn.style.marginTop = '20px';
    backBtn.innerText = 'BACK TO MENU';
    backBtn.onclick = window.backToMenu;
    container.appendChild(backBtn);
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
    
    // Блокируем
    Array.from(ui.options.children).forEach(b => b.onclick = null);

    if (isCorrect) {
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
        btn.classList.add('wrong');
        // Показать правильный
        Array.from(ui.options.children).find(b => b.textContent === q.correct)?.classList.add('correct');
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
    // Тут твоя таблица
    const w = q.original;
    const eng = Array.isArray(w) ? w[0] : w.eng;
    const rus = Array.isArray(w) ? w[1] : w.rus;
    const ex = Array.isArray(w) ? w[2] : w.ex;

    ui.explanationList.innerHTML = `
        <div style="text-align:center; margin-bottom:10px; color:#fbbf24">${eng}</div>
        <div style="text-align:center; margin-bottom:10px;">${rus}</div>
        <div style="font-size:10px; color:#888; font-style:italic">"${ex}"</div>
        <button class="next-btn" onclick="nextQuestion()" style="margin-top:20px; width:100%; padding:10px; background:#4ade80; border:none; cursor:pointer;">NEXT ▶</button>
    `;
}

window.nextQuestion = function() {
    ui.explanationModal.classList.add('hidden');
    currentQ++;
    loadQuestion();
};

function finishGame() {
    ui.quizBox.innerHTML = `
        <h2 style="color:#4ade80">ROUND COMPLETE!</h2>
        <p>XP Gained: ${xp}</p>
        <button onclick="location.reload()" class="start-btn" style="margin-top:20px">MAIN MENU</button>
    `;
    ui.progress.style.width = '100%';
}

function showFeedback(msg, success) {
    if(!ui.feedback) return;
    ui.feedback.textContent = msg;
    ui.feedback.style.color = success ? '#4ade80' : '#f87171';
    ui.feedback.classList.add('show');
    setTimeout(() => ui.feedback.classList.remove('show'), 1000);
}
