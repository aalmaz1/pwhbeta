#!/usr/bin/env python3
import json

# Read the current word list
with open('words_optimized.json', 'r', encoding='utf-8') as f:
    words = json.load(f)

# Extract unique English words
current_words = set()
categories = {}

for word in words:
    eng = word['eng'].lower()
    current_words.add(eng)
    if word['category'] not in categories:
        categories[word['category']] = []
    categories[word['category']].append(eng)

print(f"Total unique words in current database: {len(current_words)}")
print(f"\nCategories:")
for cat, words_list in sorted(categories.items()):
    print(f"  {cat}: {len(words_list)} words")

print(f"\nAll words (alphabetical):")
for word in sorted(current_words):
    print(f"  {word}")
