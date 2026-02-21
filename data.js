let gameData = null;

export async function loadGameData() {
  if (!gameData) {
    const response = await fetch(`./words_optimized.json?v=${Date.now()}`);
    gameData = await response.json();
  }
  return gameData;
}

export function getGameData() {
  return gameData || [];
}

export function getWordWeight(word) {
  const progress = JSON.parse(localStorage.getItem('pixelWordHunter_save')) || {};
  const stats = progress[word] || { mastery: 0 };
  const minsSince = (Date.now() - (stats.lastSeen || 0)) / 60000;

  if (stats.mastery === 0) return 100;
  if (stats.mastery >= 3 && minsSince < 60) return 5;
  return 50;
}
