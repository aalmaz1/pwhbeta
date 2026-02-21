#!/usr/bin/env python3
import json
import random

# Load current words
with open('words_optimized.json', 'r', encoding='utf-8') as f:
    current_words = json.load(f)

print(f"Current words: {len(current_words)}")
print(f"Need to add: {600 - len(current_words)} words")

# Final 41 words to reach 600
more_words = [
    ("Business", "initiative", "инициатива", "Take initiative at work.", "Проявляйте инициативу на работе."),
    ("Business", "innovation", "инновация", "Foster innovation culture.", "Поддерживайте культуру инноваций."),
    ("Business", "creativity", "креативность", "Encourage creative thinking.", "Поощряйте креативное мышление."),
    ("Business", "problem-solving", "решение проблем", "Improve problem-solving skills.", "Улучшайте навыки решения проблем."),
    ("Business", "critical thinking", "критическое мышление", "Apply critical thinking.", "Применяйте критическое мышление."),
    ("Business", "decision-making", "принятие решений", "Make informed decisions.", "Принимайте обоснованные решения."),
    ("Business", "strategic", "стратегический", "Strategic planning is key.", "Стратегическое планирование - это ключ."),
    ("Business", "tactical", "тактический", "Tactical approach required.", "Требуется тактический подход."),
    ("Business", "operational", "операционный", "Operational excellence goal.", "Цель операционного превосходства."),
    ("Business", "functional", "функциональный", "Functional area management.", "Управление функциональной областью."),
    ("HR", "recruitment", "набор", "Recruitment marketing strategy.", "Стратегия маркетинга набора."),
    ("HR", "selection", "отбор", "Candidate selection process.", "Процесс отбора кандидатов."),
    ("HR", "hiring", "найм", "Hiring freeze announcement.", "Объявление о заморозке найма."),
    ("HR", "onboarding", "адаптация", "Employee onboarding kit.", "Комплект адаптации сотрудника."),
    ("HR", "training", "обучение", "Training needs analysis.", "Анализ потребностей в обучении."),
    ("HR", "development", "развитие", "Leadership development path.", "Путь развития лидерства."),
    ("HR", "performance", "производительность", "Performance metrics dashboard.", "Дашборд показателей производительности."),
    ("HR", "evaluation", "оценка", "Annual performance evaluation.", "Ежегодная оценка производительности."),
    ("HR", "compensation", "компенсация", "Compensation structure review.", "Обзор структуры компенсаций."),
    ("HR", "benefits", "льготы", "Employee benefits package.", "Пакет льгот сотрудников."),
    ("Marketing", "brand", "бренд", "Brand equity measurement.", "Измерение капитала бренда."),
    ("Marketing", "market", "рынок", "Market segmentation analysis.", "Анализ сегментации рынка."),
    ("Marketing", "customer", "клиент", "Customer journey mapping.", "Картирование пути клиента."),
    ("Marketing", "product", "продукт", "Product lifecycle management.", "Управление жизненным циклом продукта."),
    ("Marketing", "price", "цена", "Pricing strategy optimization.", "Оптимизация ценовой стратегии."),
    ("Marketing", "promotion", "продвижение", "Promotional campaign design.", "Дизайн рекламной кампании."),
    ("Marketing", "place", "место", "Place strategy in marketing mix.", "Стратегия места в маркетинговом миксе."),
    ("Finance", "cash", "наличные", "Cash flow management.", "Управление денежным потоком."),
    ("Finance", "capital", "капитал", "Working capital optimization.", "Оптимизация оборотного капитала."),
    ("Finance", "asset", "актив", "Fixed asset management.", "Управление основными активами."),
    ("Finance", "liability", "обязательство", "Current liability ratio.", "Коэффициент текущих обязательств."),
    ("Finance", "equity", "собственный капитал", "Shareholders' equity.", "Собственный капитал акционеров."),
    ("Finance", "revenue", "выручка", "Revenue recognition policy.", "Политика признания выручки."),
    ("Finance", "expense", "расход", "Operating expense control.", "Контроль операционных расходов."),
    ("Finance", "profit", "прибыль", "Profit margin analysis.", "Анализ рентабельности."),
    ("Finance", "loss", "убыток", "Loss prevention measures.", "Меры предотвращения убытков."),
    ("Technology", "digital", "цифровой", "Digital transformation roadmap.", "Дорожная карта цифровой трансформации."),
    ("Technology", "cloud", "облако", "Cloud computing services.", "Услуги облачных вычислений."),
    ("Technology", "data", "данные", "Data analytics platform.", "Платформа аналитики данных."),
    ("Technology", "cybersecurity", "кибербезопасность", "Cybersecurity awareness training.", "Обучение осведомленности о кибербезопасности."),
    ("Technology", "artificial intelligence", "искусственный интеллект", "AI in business applications.", "ИИ в бизнес-приложениях."),
    ("Operations", "efficiency", "эффективность", "Operational efficiency metrics.", "Показатели операционной эффективности."),
    ("Operations", "productivity", "продуктивность", "Productivity improvement plan.", "План повышения продуктивности."),
    ("Operations", "quality", "качество", "Quality control standards.", "Стандарты контроля качества."),
]

# Get current word list
current_word_list = set()
for w in current_words:
    current_word_list.add(w['eng'].lower())

# Get all translations for option generation
all_translations = [word[2] for word in more_words]
for w in current_words:
    all_translations.append(w['rus'])

def generate_options(correct_rus):
    """Generate 3 options including the correct answer"""
    options = [correct_rus]
    wrong_options = random.sample([t for t in all_translations if t != correct_rus], min(2, len(all_translations) - 1))
    options.extend(wrong_options)
    random.shuffle(options)
    return options[:3]

# Add new words
words_added = 0
for category, eng, rus, example_eng, example_rus in more_words:
    if eng.lower() not in current_word_list and len(current_words) < 600:
        options_list = generate_options(rus)

        current_words.append({
            "category": category,
            "eng": eng,
            "rus": rus,
            "question": eng,
            "optionsList": options_list,
            "correct": rus,
            "mastery": 0,
            "exampleEng": example_eng,
            "exampleRus": example_rus
        })
        words_added += 1
        current_word_list.add(eng.lower())
    if len(current_words) >= 600:
        break

print(f"Words added: {words_added}")
print(f"Total words in file: {len(current_words)}")

# Save to file
with open('words_optimized.json', 'w', encoding='utf-8') as f:
    json.dump(current_words, f, ensure_ascii=False, indent=2)

print("Saved to words_optimized.json")

if len(current_words) == 600:
    print("SUCCESS: File now contains exactly 600 words!")
else:
    print(f"Note: File contains {len(current_words)} words (target: 600)")
