let gameData = null;
let categoriesCache = null;

const INTERVALS = {
  0: 0,
  1: 60 * 60 * 1000,
  2: 6 * 60 * 60 * 1000,
  3: 24 * 60 * 60 * 1000,
  4: 72 * 60 * 60 * 1000,
  5: 168 * 60 * 60 * 1000,
};

export async function loadGameData() {
  if (!gameData) {
    const response = await fetch(`./words_optimized.json?v=${Date.now()}`);
    gameData = await response.json();
    
    gameData.forEach(word => {
      word.mastery = 0;
      word.lastSeen = 0;
      word.correctCount = 0;
      word.incorrectCount = 0;
    });
  }
  return gameData;
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
