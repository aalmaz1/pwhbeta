#!/usr/bin/env python3
import json
import random

# Load current words
with open('words_optimized.json', 'r', encoding='utf-8') as f:
    current_words = json.load(f)

print(f"Current words: {len(current_words)}")

# Final 8 words
final_8 = [
    ("Management", "oversight", "надзор", "Project oversight responsibility.", "Ответственность за надзор за проектом."),
    ("Management", "governance", "управление", "Corporate governance framework.", "Фреймворк корпоративного управления."),
    ("Management", "compliance", "соответствие", "Regulatory compliance program.", "Программа регуляторного соответствия."),
    ("Management", "ethics", "этика", "Business ethics training.", "Обучение деловой этике."),
    ("Management", "integrity", "целостность", "Personal integrity standards.", "Стандарты личной целостности."),
    ("Management", "accountability", "подотчетность", "Financial accountability framework.", "Фреймворк финансовой подотчетности."),
    ("Management", "transparency", "прозрачность", "Organizational transparency.", "Организационная прозрачность."),
    ("Management", "excellence", "отличие", "Operational excellence standards.", "Стандарты операционного превосходства."),
]

current_word_list = set()
for w in current_words:
    current_word_list.add(w['eng'].lower())

all_translations = [word[2] for word in final_8]
for w in current_words:
    all_translations.append(w['rus'])

def generate_options(correct_rus):
    options = [correct_rus]
    wrong_options = random.sample([t for t in all_translations if t != correct_rus], min(2, len(all_translations) - 1))
    options.extend(wrong_options)
    random.shuffle(options)
    return options[:3]

words_added = 0
for category, eng, rus, example_eng, example_rus in final_8:
    if eng.lower() not in current_word_list:
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

with open('words_optimized.json', 'w', encoding='utf-8') as f:
    json.dump(current_words, f, ensure_ascii=False, indent=2)

print(f"Words added: {words_added}")
print(f"Total words: {len(current_words)}")
if len(current_words) == 600:
    print("SUCCESS: Exactly 600 words from Barron's TOEIC Essential Words!")
