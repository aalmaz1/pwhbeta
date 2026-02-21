#!/usr/bin/env python3
import json
import random

# Load current words
with open('words_optimized.json', 'r', encoding='utf-8') as f:
    current_words = json.load(f)

print(f"Current words: {len(current_words)}")
print(f"Need to add: {600 - len(current_words)} words")

# Final 121 words to reach 600
final_words = [
    ("Business", "agenda", "повестка дня", "The meeting agenda is ready.", "Повестка дня встречи готова."),
    ("Business", "prioritize", "приоритизировать", "Prioritize important tasks.", "Приоритизируйте важные задачи."),
    ("Business", "deadline", "дедлайн", "Meet the project deadline.", "Уложитесь в дедлайн проекта."),
    ("Business", "milestone", "веха", "Celebrate project milestones.", "Празднуйте вехи проекта."),
    ("Business", "objective", "цель", "Set clear objectives.", "Установите четкие цели."),
    ("Business", "proposal", "предложение", "Submit a business proposal.", "Подайте бизнес-предложение."),
    ("Business", "contract", "контракт", "Review the contract terms.", "Просмотрите условия контракта."),
    ("Business", "agreement", "соглашение", "Sign the agreement today.", "Подпишите соглашение сегодня."),
    ("Business", "negotiation", "переговоры", "Enter into negotiations.", "Вступите в переговоры."),
    ("Business", "commitment", "обязательство", "Honor your commitment.", "Выполняйте свое обязательство."),
    ("Office", "facility", "объект", "Use the company facilities.", "Используйте объекты компании."),
    ("Office", "premises", "помещение", "Secure the office premises.", "Обеспечьте безопасность офисных помещений."),
    ("Office", "environment", "окружение", "Create a positive work environment.", "Создайте позитивную рабочую среду."),
    ("Office", "atmosphere", "атмосфера", "The office atmosphere is friendly.", "Атмосфера в офисе дружелюбная."),
    ("Office", "culture", "культура", "Corporate culture matters.", "Корпоративная культура важна."),
    ("Office", "policy", "политика", "Follow company policies.", "Следуйте корпоративным политикам."),
    ("Office", "procedure", "процедура", "Standard operating procedure.", "Стандартная операционная процедура."),
    ("Office", "protocol", "протокол", "Follow communication protocol.", "Следуйте протоколу связи."),
    ("Office", "guideline", "руководство", "Read the safety guidelines.", "Прочитайте руководства по безопасности."),
    ("Office", "regulation", "регулирование", "Comply with regulations.", "Соответствуйте регулированию."),
    ("HR", "personnel", "персонал", "Contact HR personnel.", "Свяжитесь с персоналом HR."),
    ("HR", "workforce", "рабочая сила", "Manage the workforce effectively.", "Эффективно управляйте рабочей силой."),
    ("HR", "staffing", "укомплектование", "Staffing needs assessment.", "Оценка потребностей в укомплектовании."),
    ("HR", "recruitment", "набор", "Recruitment process improvement.", "Улучшение процесса набора."),
    ("HR", "selection", "отбор", "Employee selection criteria.", "Критерии отбора сотрудников."),
    ("HR", "placement", "размещение", "Job placement services.", "Услуги по трудоустройству."),
    ("HR", "orientation", "ориентация", "New employee orientation.", "Ориентация новых сотрудников."),
    ("HR", "onboarding", "адаптация", "Effective onboarding program.", "Эффективная программа адаптации."),
    ("HR", "training", "обучение", "Professional training courses.", "Курсы профессионального обучения."),
    ("HR", "development", "развитие", "Career development opportunities.", "Возможности развития карьеры."),
    ("HR", "retention", "удержание", "Employee retention strategies.", "Стратегии удержания сотрудников."),
    ("Marketing", "advertising", "реклама", "Increase advertising budget.", "Увеличьте рекламный бюджет."),
    ("Marketing", "promotion", "продвижение", "Sales promotion campaign.", "Кампания по продвижению продаж."),
    ("Marketing", "branding", "брендинг", "Corporate branding strategy.", "Корпоративная стратегия брендинга."),
    ("Marketing", "positioning", "позиционирование", "Market positioning analysis.", "Анализ рыночного позиционирования."),
    ("Marketing", "segmentation", "сегментация", "Customer segmentation study.", "Изучение сегментации клиентов."),
    ("Marketing", "targeting", "таргетинг", "Target audience identification.", "Идентификация целевой аудитории."),
    ("Marketing", "messaging", "послание", "Brand messaging consistency.", "Согласованность послания бренда."),
    ("Marketing", "channel", "канал", "Multi-channel marketing approach.", "Многоканальный маркетинговый подход."),
    ("Marketing", "campaign", "кампания", "Launch marketing campaign.", "Запустите маркетинговую кампанию."),
    ("Marketing", "initiative", "инициатива", "New marketing initiative.", "Новая маркетинговая инициатива."),
    ("Marketing", "strategy", "стратегия", "Digital marketing strategy.", "Стратегия цифрового маркетинга."),
    ("Sales", "prospecting", "поиск", "Customer prospecting methods.", "Методы поиска клиентов."),
    ("Sales", "qualification", "квалификация", "Lead qualification process.", "Процесс квалификации лидов."),
    ("Sales", "presentation", "презентация", "Sales presentation skills.", "Навыки презентации продаж."),
    ("Sales", "closing", "закрытие", "Sales closing techniques.", "Техники закрытия продаж."),
    ("Sales", "follow-up", "последующие действия", "Customer follow-up system.", "Система последующих действий с клиентами."),
    ("Sales", "relationship", "отношения", "Build customer relationships.", "Стройте отношения с клиентами."),
    ("Sales", "networking", "нетворкинг", "Business networking events.", "Мероприятия бизнес-нетворкинга."),
    ("Sales", "referral", "рекомендация", "Customer referral program.", "Программа рекомендаций клиентов."),
    ("Sales", "repeat", "повторение", "Repeat business is valuable.", "Повторный бизнес ценен."),
    ("Sales", "loyalty", "лояльность", "Customer loyalty rewards.", "Награды за лояльность клиентов."),
    ("Finance", "budgeting", "бюджетирование", "Annual budgeting process.", "Процесс ежегодного бюджетирования."),
    ("Finance", "forecasting", "прогнозирование", "Financial forecasting tools.", "Инструменты финансового прогнозирования."),
    ("Finance", "analysis", "анализ", "Financial analysis report.", "Отчет финансового анализа."),
    ("Finance", "planning", "планирование", "Strategic financial planning.", "Стратегическое финансовое планирование."),
    ("Finance", "management", "управление", "Asset management services.", "Услуги управления активами."),
    ("Finance", "control", "контроль", "Internal financial controls.", "Внутренние финансовые контроли."),
    ("Finance", "reporting", "отчетность", "Financial reporting standards.", "Стандарты финансовой отчетности."),
    ("Finance", "compliance", "соответствие", "Regulatory compliance review.", "Обзор регуляторного соответствия."),
    ("Finance", "audit", "аудит", "External audit preparation.", "Подготовка к внешнему аудиту."),
    ("Finance", "review", "обзор", "Quarterly financial review.", "Ежеквартальный финансовый обзор."),
    ("Technology", "innovation", "инновация", "Technology innovation grants.", "Гранты на технологические инновации."),
    ("Technology", "automation", "автоматизация", "Process automation benefits.", "Преимущества автоматизации процессов."),
    ("Technology", "integration", "интеграция", "System integration project.", "Проект интеграции систем."),
    ("Technology", "implementation", "внедрение", "Software implementation plan.", "План внедрения программного обеспечения."),
    ("Technology", "migration", "миграция", "Data migration strategy.", "Стратегия миграции данных."),
    ("Technology", "configuration", "конфигурация", "System configuration settings.", "Настройки конфигурации системы."),
    ("Technology", "customization", "кастомизация", "Software customization services.", "Услуги кастомизации программного обеспечения."),
    ("Technology", "optimization", "оптимизация", "Performance optimization tips.", "Советы по оптимизации производительности."),
    ("Technology", "security", "безопасность", "Cybersecurity measures.", "Меры кибербезопасности."),
    ("Technology", "backup", "резервная копия", "Data backup solution.", "Решение для резервного копирования данных."),
    ("Communication", "collaboration", "сотрудничество", "Team collaboration tools.", "Инструменты командного сотрудничества."),
    ("Communication", "coordination", "координация", "Cross-department coordination.", "Междепартаментская координация."),
    ("Communication", "interaction", "взаимодействие", "Client interaction guidelines.", "Руководства по взаимодействию с клиентами."),
    ("Communication", "engagement", "вовлечение", "Employee engagement survey.", "Опрос вовлеченности сотрудников."),
    ("Communication", "feedback", "обратная связь", "Customer feedback loop.", "Цикл обратной связи с клиентами."),
    ("Communication", "satisfaction", "удовлетворенность", "Satisfaction measurement.", "Измерение удовлетворенности."),
    ("Communication", "expectation", "ожидание", "Manage customer expectations.", "Управляйте ожиданиями клиентов."),
    ("Communication", "requirement", "требование", "Business requirements document.", "Документ бизнес-требований."),
    ("Communication", "specification", "спецификация", "Technical specification review.", "Обзор технической спецификации."),
    ("Communication", "deliverable", "результат", "Project deliverables list.", "Список результатов проекта."),
    ("Operations", "logistics", "логистика", "Supply chain management.", "Управление цепочкой поставок."),
    ("Operations", "distribution", "распределение", "Product distribution network.", "Сеть распределения продуктов."),
    ("Operations", "fulfillment", "выполнение", "Order fulfillment process.", "Процесс выполнения заказов."),
    ("Operations", "inventory", "инвентарь", "Inventory management system.", "Система управления инвентарем."),
    ("Operations", "warehouse", "склад", "Warehouse operations optimization.", "Оптимизация складских операций."),
    ("Operations", "transportation", "транспорт", "Transportation logistics.", "Транспортная логистика."),
    ("Operations", "delivery", "доставка", "On-time delivery guarantee.", "Гарантия своевременной доставки."),
    ("Operations", "shipment", "груз", "Track your shipment online.", "Отследите ваш груз онлайн."),
    ("Operations", "packaging", "упаковка", "Sustainable packaging solutions.", "Решения для устойчивой упаковки."),
    ("Operations", "handling", "обращение", "Proper material handling.", "Правильное обращение с материалами."),
    ("Management", "leadership", "лидерство", "Leadership development program.", "Программа развития лидерства."),
    ("Management", "decision-making", "принятие решений", "Strategic decision-making process.", "Процесс стратегического принятия решений."),
    ("Management", "delegation", "делегирование", "Effective delegation skills.", "Навыки эффективного делегирования."),
    ("Management", "motivation", "мотивация", "Employee motivation techniques.", "Техники мотивации сотрудников."),
    ("Management", "empowerment", "расширение прав", "Employee empowerment initiatives.", "Инициативы по расширению прав сотрудников."),
    ("Management", "accountability", "подотчетность", "Personal accountability culture.", "Культура личной подотчетности."),
    ("Management", "transparency", "прозрачность", "Organizational transparency.", "Организационная прозрачность."),
    ("Management", "integrity", "целостность", "Business ethics and integrity.", "Деловая этика и целостность."),
    ("Management", "excellence", "отличие", "Operational excellence standards.", "Стандарты операционного превосходства."),
    ("Management", "performance", "производительность", "Performance management system.", "Система управления производительностью."),
    ("Customer Service", "experience", "опыт", "Customer experience journey.", "Путешествие клиентского опыта."),
    ("Customer Service", "service", "сервис", "Service quality assurance.", "Обеспечение качества сервиса."),
    ("Customer Service", "support", "поддержка", "Technical support team.", "Команда технической поддержки."),
    ("Customer Service", "assistance", "помощь", "Customer assistance center.", "Центр помощи клиентам."),
    ("Customer Service", "inquiry", "запрос", "Handle customer inquiries.", "Обрабатывайте запросы клиентов."),
    ("Customer Service", "request", "запрос", "Service request tracking.", "Отслеживание запросов на обслуживание."),
    ("Customer Service", "complaint", "жалоба", "Complaint resolution process.", "Процесс разрешения жалоб."),
    ("Customer Service", "resolution", "решение", "Issue resolution time.", "Время решения проблем."),
    ("Customer Service", "satisfaction", "удовлетворенность", "Customer satisfaction score.", "Оценка удовлетворенности клиентов."),
    ("Customer Service", "loyalty", "лояльность", "Customer loyalty program.", "Программа лояльности клиентов."),
    ("Legal", "compliance", "соответствие", "Regulatory compliance officer.", "Офицер по регуляторному соответствию."),
    ("Legal", "regulation", "регулирование", "Industry regulations overview.", "Обзор отраслевых регулирований."),
    ("Legal", "requirement", "требование", "Legal requirement checklist.", "Контрольный список юридических требований."),
    ("Legal", "obligation", "обязательство", "Contractual obligations.", "Контрактные обязательства."),
    ("Legal", "liability", "ответственность", "Limited liability company.", "Компания с ограниченной ответственностью."),
    ("Legal", "contract", "контракт", "Contract management system.", "Система управления контрактами."),
    ("Legal", "agreement", "соглашение", "Non-disclosure agreement.", "Соглашение о неразглашении."),
    ("Legal", "policy", "политика", "Legal policy updates.", "Обновления юридической политики."),
    ("Legal", "procedure", "процедура", "Legal procedure timeline.", "График юридической процедуры."),
    ("Legal", "document", "документ", "Legal document preparation.", "Подготовка юридических документов."),
]

# Get current word list
current_word_list = set()
for w in current_words:
    current_word_list.add(w['eng'].lower())

# Get all translations for option generation
all_translations = [word[2] for word in final_words]
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
for category, eng, rus, example_eng, example_rus in final_words:
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
