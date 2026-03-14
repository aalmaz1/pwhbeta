let gameData = null;
let categoriesCache = null;
let dataLoadPromise = null;

// Адаптивные интервалы на основе SM-2 (начнём с базовых значений, далее будут корректироваться)
const BASE_INTERVALS = {
  0: 0,
  1: 60 * 60 * 1000,      // 1 час
  2: 6 * 60 * 60 * 1000,   // 6 часов
  3: 24 * 60 * 60 * 1000,  // 1 день
  4: 72 * 60 * 60 * 1000,  // 3 дня
  5: 168 * 60 * 60 * 1000, // 1 неделя
};

// Для мастерских слов - долгосрочное обслуживание (каждые 2 недели)
const MAINTENANCE_INTERVAL = 14 * 24 * 60 * 60 * 1000;

const MAX_FETCH_RETRIES = 3;
const FETCH_RETRY_DELAY_MS = 1000;

const TOEIC_CATEGORIES = new Set([
  'Accounting', 'Banking', 'Business Planning', 'Computers', 'Conferences', 'Contracts',
  'Electronics', 'Events & Entertainment', 'Financial Statements', 'Hiring', 'Hotels',
  'Insurance', 'Inventory', 'Investments', 'Invoices', 'Legal', 'Marketing',
  'Office Procedures', 'Office Technology', 'Ordering Supplies', 'Promotions',
  'Property & Real Estate', 'Restaurants', 'Salaries', 'Shipping', 'Shopping', 'Taxes',
  'Transportation', 'Travel', 'Warranties'
]);

// Кеш для анализа слабых слов (обновляется лениво)
let weaknessesCache = null;
let weaknessesCacheTime = 0;
const WEAKNESS_CACHE_TTL = 60000; // 1 минута

function sanitizeToeicWord(rawWord) {
  if (!rawWord || typeof rawWord !== 'object') return null;

  const eng = typeof rawWord.eng === 'string' ? rawWord.eng.trim() : '';
  const category = typeof rawWord.category === 'string' ? rawWord.category.trim() : '';
  const translation = typeof rawWord.rus === 'string' && rawWord.rus.trim()
    ? rawWord.rus.trim()
    : (typeof rawWord.correct === 'string' ? rawWord.correct.trim() : '');

  if (!eng || !translation || !TOEIC_CATEGORIES.has(category)) {
    return null;
  }

  return {
    ...rawWord,
    eng,
    category,
    rus: translation,
    correct: translation,
    // Прогресс обучения
    mastery: 0,
    lastSeen: 0,
    correctCount: 0,
    incorrectCount: 0,
    // SM-2 параметры
    easeFactor: 2.5,
    interval: 1, // в днях
    nextReview: 0,
  };
}

function sanitizeToeicData(words) {
  if (!Array.isArray(words)) return [];
  return words
    .map(sanitizeToeicWord)
    .filter(Boolean);
}

function getCachedData() {
  try {
    const cached = localStorage.getItem('pixelWordHunter_words_cache');
    if (cached && cached.length > 0) {
      const parsed = JSON.parse(cached);
      return sanitizeToeicData(parsed);
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
    localStorage.setItem('pixelWordHunter_words_cache', JSON.stringify(toCache));
  } catch {
    // Silently ignore cache write failure
  }
}

async function fetchWithRetry(url, retries = MAX_FETCH_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return response;
    } catch (err) {
      if (attempt === retries) {
        showError('Failed to load data. Please refresh the page.');
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, FETCH_RETRY_DELAY_MS * attempt));
    }
  }
}

function showError(message) {
  const errorEl = document.getElementById('load-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.removeAttribute('hidden');
    errorEl.setAttribute('role', 'alert');
  }
}

async function fetchFreshData() {
  try {
    const response = await fetchWithRetry('./words_optimized.json', MAX_FETCH_RETRIES);
    if (!response.ok) {
      throw new Error('Failed to fetch fresh data');
    }
    const freshData = await response.json();
    const sanitizedData = sanitizeToeicData(freshData);

    gameData = sanitizedData;
    cacheData(sanitizedData);
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

export async function loadGameData() {
  if (gameData) return gameData;
  if (dataLoadPromise) return dataLoadPromise;

  dataLoadPromise = (async () => {
    const cached = getCachedData();
    if (cached && cached.length > 0) {
      gameData = cached;
      fetchFreshData();
      return gameData;
    }
    return fetchFreshData();
  })();

  return dataLoadPromise;
}

export function getGameData() {
  return gameData || [];
}

export function getCategories() {
  if (!categoriesCache) {
    categoriesCache = [...new Set(getGameData().map(w => w.category))];
  }
  return categoriesCache;
}

export function getWordsByCategory(category) {
  if (category === 'All') return getGameData();
  return getGameData().filter(w => w.category === category);
}

// Улучшенная функция: дистракторы из той же или смежной категории
export function getRandomWrongAnswers(correctWord, count = 3) {
  const allWords = getGameData();

  if (allWords.length <= 1) {
    return [correctWord.correct];
  }

  // Находим слова из той же категории
  const sameCategoryWords = allWords.filter(w => 
    w.category === correctWord.category && w.eng !== correctWord.eng
  );

  // Находим слова из смежных категорий (по алфавиту рядом)
  const allCategories = getCategories();
  const categoryIndex = allCategories.indexOf(correctWord.category);
  const adjacentCategories = allCategories.filter((cat, idx) => 
    cat !== correctWord.category && Math.abs(idx - categoryIndex) <= 2
  );
  
  const adjacentWords = allWords.filter(w => 
    adjacentCategories.includes(w.category) && w.eng !== correctWord.eng
  );

  // Формируем пул: 60% из той же категории, 40% из других
  const poolSize = count * 3;
  const fromSameCount = Math.ceil(poolSize * 0.6);
  
  let pool = [];
  
  // Добавляем слова из той же категории
  const shuffledSame = shuffleArray([...sameCategoryWords]);
  pool.push(...shuffledSame.slice(0, fromSameCount));
  
  // Добавляем слова из смежных/других категорий
  const shuffledAdjacent = shuffleArray([...adjacentWords]);
  const remaining = poolSize - pool.length;
  pool.push(...shuffledAdjacent.slice(0, remaining));

  // Если мало слов - добираем из любых других
  if (pool.length < poolSize) {
    const otherWords = allWords.filter(w => 
      w.eng !== correctWord.eng && !pool.includes(w)
    );
    pool.push(...shuffleArray(otherWords).slice(0, poolSize - pool.length));
  }

  pool = shuffleArray(pool).slice(0, count);
  
  return pool.map(w => w.correct);
}

export function generateOptionsForWord(word) {
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

// Получить список слабых слов пользователя
export function getUserWeaknesses() {
  const now = Date.now();
  
  // Используем кеш
  if (weaknessesCache && (now - weaknessesCacheTime) < WEAKNESS_CACHE_TTL) {
    return weaknessesCache;
  }
  
  const words = getGameData();
  const weaknesses = [];
  
  for (const word of words) {
    const total = (word.correctCount || 0) + (word.incorrectCount || 0);
    if (total < 2) continue; // нужно минимум 2 попытки
    
    const accuracy = word.correctCount / total;
    if (word.incorrectCount >= 1 && accuracy < 0.7) {
      weaknesses.push({ 
        word, 
        accuracy, 
        errors: word.incorrectCount,
        total
      });
    }
  }
  
  // Сортируем по точности (самые слабые first)
  weaknesses.sort((a, b) => a.accuracy - b.accuracy);
  
  weaknessesCache = weaknesses.slice(0, 10);
  weaknessesCacheTime = now;
  
  return weaknessesCache;
}

// Очистка кеша слабых слов при обновлении прогресса
function invalidateWeaknessCache() {
  weaknessesCache = null;
  weaknessesCacheTime = 0;
}

export function getWordPriority(word) {
  const now = Date.now();
  const lastSeen = word.lastSeen || 0;
  const mastery = word.mastery || 0;
  const timeSinceLastSeen = now - lastSeen;

  // Проверяем, является ли слово "слабым"
  const weaknesses = getUserWeaknesses();
  const isWeakWord = weaknesses.some(w => w.word.eng === word.eng);
  
  // 1. Слабые слова - highest priority
  if (isWeakWord) {
    return 100;
  }
  
  // 2. Новые слова (ещё не изучались)
  if (mastery === 0 || word.correctCount === 0) {
    return 90;
  }
  
  // 3. Мастерские слова (mastery >= 4) - долгосрочное обслуживание
  if (mastery >= 4) {
    const timeSinceReview = now - (word.nextReview || lastSeen);
    if (timeSinceReview >= MAINTENANCE_INTERVAL) {
      return 70; // пора повторить
    }
    return 10; // недавно повторяли
  }
  
  // 4. Слова с ошибками - высокий приоритет
  if ((word.incorrectCount || 0) > (word.correctCount || 0)) {
    return 85;
  }
  
  // 5. Обычные слова - проверяем интервал
  const baseInterval = BASE_INTERVALS[mastery] || BASE_INTERVALS[5];
  const isDue = timeSinceLastSeen >= baseInterval;
  
  if (isDue) {
    return 80;
  }
  
  // 6. Слова, которые ещё не пора повторять
  // Чем больше времени прошло от последнего показанного - тем выше приоритет
  const urgency = (timeSinceLastSeen / baseInterval) * 70;
  return Math.max(10, Math.min(70, urgency));
}

// Интерливинг: выбираем слова из разных категорий
export function selectWordsForRound(category, roundSize = 10) {
  let sourceWords;
  
  if (category === 'All') {
    sourceWords = getGameData();
  } else {
    // Интерливинг: 70% из целевой категории, 30% из смежных
    const allCategories = getCategories();
    const categoryIndex = allCategories.indexOf(category);
    const adjacentCategories = allCategories
      .filter((cat, idx) => Math.abs(idx - categoryIndex) <= 2);
    
    const targetWords = getWordsByCategory(category);
    const adjacentWords = getGameData()
      .filter(w => adjacentCategories.includes(w.category) && w.category !== category);
    
    const targetCount = Math.floor(roundSize * 0.7);
    const adjacentCount = roundSize - targetCount;
    
    sourceWords = [
      ...targetWords.slice(0, targetCount),
      ...shuffleArray(adjacentWords).slice(0, adjacentCount)
    ];
    
    // Если мало слов - добираем
    if (sourceWords.length < roundSize) {
      const otherWords = getGameData()
        .filter(w => !sourceWords.includes(w) && w.category !== category);
      sourceWords.push(...shuffleArray(otherWords).slice(0, roundSize - sourceWords.length));
    }
  }

  const wordsWithPriority = sourceWords.map(word => ({
    word,
    priority: getWordPriority(word)
  }));

  // Сортируем по приоритету
  wordsWithPriority.sort((a, b) => b.priority - a.priority);

  const selected = [];
  const seen = new Set();

  // Выбираем высокоприоритетные слова
  for (const { word } of wordsWithPriority) {
    if (selected.length >= roundSize) break;
    if (!seen.has(word.eng)) {
      seen.add(word.eng);
      selected.push(word);
    }
  }

  // Дополняем случайными словами если нужно
  const remaining = sourceWords.filter(w => !seen.has(w.eng));
  const shuffledRemaining = shuffleArray(remaining);
  
  for (const randomWord of shuffledRemaining) {
    if (selected.length >= roundSize) break;
    seen.add(randomWord.eng);
    selected.push(randomWord);
  }

  return selected;
}

// SM-2 адаптивный алгоритм интервалов
function calculateSM2Interval(word, quality) {
  // quality: 0-5 (0-2 = неправильно, 3-5 = правильно)
  // 0-1 = полная забывчивость
  // 2 = неточный ответ
  // 3 = правильный с трудом
  // 4 = правильный легко
  // 5 = идеальный ответ
  
  let easeFactor = word.easeFactor || 2.5;
  let interval = word.interval || 1;
  
  // Обновляем ease factor по формуле SM-2
  const newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, newEaseFactor); // минимум 1.3
  
  if (quality < 3) {
    // Неправильный ответ - сбрасываем интервал
    interval = 1;
  } else {
    // Правильный ответ - увеличиваем интервал
    if (interval === 1) {
      interval = 1;
    } else if (interval === 6) {
      interval = 24;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }
  
  // Ограничиваем максимальный интервал (30 дней)
  interval = Math.min(interval, 30);
  
  // Рассчитываем следующую дату повторения
  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;
  
  return {
    interval,
    easeFactor,
    nextReview
  };
}

export function updateWordProgress(wordEng, isCorrect) {
  const word = getGameData().find(w => w.eng === wordEng);
  if (!word) return;

  const now = Date.now();
  word.lastSeen = now;

  // Определяем quality для SM-2
  // Для упрощения: неправильный = 1, правильный = 4
  const quality = isCorrect ? 4 : 1;
  
  // Рассчитываем новый интервал
  const sm2Result = calculateSM2Interval(word, quality);
  word.interval = sm2Result.interval;
  word.easeFactor = sm2Result.easeFactor;
  word.nextReview = sm2Result.nextReview;

  if (isCorrect) {
    word.correctCount = (word.correctCount || 0) + 1;
    word.mastery = Math.min(word.mastery + 1, 5);
  } else {
    word.incorrectCount = (word.incorrectCount || 0) + 1;
    // При ошибке уменьшаем mastery более агрессивно
    word.mastery = Math.max(word.mastery - 1, 0);
  }
  
  // Инвалидируем кеш слабых слов
  invalidateWeaknessCache();
}

export function getMasteryLevel(word) {
  return word.mastery || 0;
}

export function getMasteryLabel(mastery) {
  const labels = ['NEW', 'LEARNING', 'FAMILIAR', 'GOOD', 'STRONG', 'MASTER'];
  return labels[mastery] || labels[0];
}

// Получить статистику по категории
export function getCategoryStats(category) {
  const words = getWordsByCategory(category);
  let mastered = 0, learning = 0, newWords = 0;
  
  for (const word of words) {
    if (word.mastery >= 4) mastered++;
    else if (word.mastery > 0) learning++;
    else newWords++;
  }
  
  return { total: words.length, mastered, learning, newWords };
}
