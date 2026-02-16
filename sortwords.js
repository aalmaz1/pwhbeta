const fs = require("fs");
const path = require("path");

// Путь к входному файлу и выходному
const inputPath = path.join(__dirname, "input.json");
const outputPath = path.join(__dirname, "output.js");

// Чтение данных из JSON
const rawData = fs.readFileSync(inputPath, "utf-8");
const words = JSON.parse(rawData);

// Структура: { category: [ [word, translation, exampleEn, exampleRu], ... ] }
const categorizedWords = {};

// Организация слов по категориям
words.forEach((word) => {
  const { category, englishWord, translation, englishExample, russianExample } =
    word;

  if (!categorizedWords[category]) {
    categorizedWords[category] = [];
  }

  categorizedWords[category].push([
    englishWord,
    translation,
    englishExample,
    russianExample,
  ]);
});

// Формирование выходного файла
const outputContent = `const wordCategories = ${JSON.stringify(categorizedWords, null, 2)};\n\nexport { wordCategories };`;

// Запись в файл
fs.writeFileSync(outputPath, outputContent, "utf-8");

console.log(`✅ Данные успешно сортированы и сохранены в: ${outputPath}`);
