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
    const cached = localStorage.getItem('pixelWordHunter_words_cache');
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
    localStorage.setItem('pixelWordHunter_words_cache', JSON.stringify(toCache));
  } catch {
    // Silently ignore cache write failure
  }
}

async function fetchWithRetry(url, retries = MAX_FETCH_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (err) {
      if (attempt === retries) {
        const errorEl = document.getElementById('load-error');
        if (errorEl) {
          errorEl.textContent = 'Failed to load data. Please refresh the page.';
          errorEl.removeAttribute('hidden');
          errorEl.setAttribute('role', 'alert');
        }
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, FETCH_RETRY_DELAY_MS * attempt));
    }
  }
}

async function fetchFreshData() {
  try {
    const response = await fetchWithRetry('./words_optimized.json', MAX_FETCH_RETRIES);
    if (!response.ok) {
      throw new Error('Failed to fetch fresh data');
    }
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

export async function loadGameData() {
  if (gameData) return gameData;
  if (dataLoadPromise) return dataLoadPromise;

  dataLoadPromise = (async () => {
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

export function getRandomWrongAnswers(correctWord, count = 3) {
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

export function getWordPriority(word) {
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

export function selectWordsForRound(category, roundSize = 10) {
  const words = getWordsByCategory(category);

  const wordsWithPriority = words.map(word => ({
    word,
    priority: getWordPriority(word)
  }));

  wordsWithPriority.sort((a, b) => b.priority - a.priority);

  const selected = [];
  const seen = new Set();

  for (const { word } of wordsWithPriority) {
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

export function updateWordProgress(wordEng, isCorrect) {
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

export function getMasteryLevel(word) {
  return word.mastery || 0;
}

export function getMasteryLabel(mastery) {
  const labels = ['NEW', 'LEARNING', 'FAMILIAR', 'GOOD', 'STRONG', 'MASTER'];
  return labels[mastery] || labels[0];
}
