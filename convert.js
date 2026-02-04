const fs = require("fs");

// 1. Читаем файл как текст (чтобы не мучиться с экспортом)
const filePath = "./app.js"; // Укажи имя своего файла, где лежит массив
const fileContent = fs.readFileSync(filePath, "utf8");

// 2. Извлекаем массив (ищем всё между const allWordsFlat = [ и ];)
// ВАЖНО: Убедись, что массив в файле называется allWordsFlat
const match = fileContent.match(/const allWordsFlat = (\[[\s\S]*?\]);/);

if (!match) {
  console.error("Не удалось найти массив allWordsFlat в файле!");
  process.exit(1);
}

// Превращаем строку в реальный объект JS
const allWordsFlat = eval(match[1]);

const GAME_DATA = {};

allWordsFlat.forEach((word) => {
  // Если такой категории еще нет, создаем её
  if (!GAME_DATA[word.category]) {
    GAME_DATA[word.category] = [];
  }

  // Добавляем только данные в строгом порядке: [eng, rus, ex, exRus]
  GAME_DATA[word.category].push([
    word.eng,
    word.rus,
    word.ex || "", // если примера нет, будет пустая строка
    word.exRus || "", // если перевода примера нет
  ]);
});

// 3. Сохраняем результат
const outputContent = `const GAME_DATA = ${JSON.stringify(GAME_DATA, null, 2)};\n\nexport { GAME_DATA };`;
fs.writeFileSync("./words_optimized.js", outputContent);

console.log("Готово! Файл words_optimized.js создан.");
console.log(`Обработано слов: ${allWordsFlat.length}`);
