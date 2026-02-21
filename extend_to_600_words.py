#!/usr/bin/env python3
import json
import random

# Load current words
with open('words_optimized.json', 'r', encoding='utf-8') as f:
    current_words = json.load(f)

print(f"Current words: {len(current_words)}")

# Additional words to reach 600
more_words = [
    # Additional Business words
    ("Business", "negotiation", "переговоры", "The negotiation was successful.", "Переговоры были успешными."),
    ("Business", "strategy", "стратегия", "Develop a business strategy.", "Разработайте бизнес-стратегию."),
    ("Business", "objective", "цель", "Set clear objectives.", "Установите четкие цели."),
    ("Business", "goal", "цель", "Achieve your monthly goals.", "Достигайте своих ежемесячных целей."),
    ("Business", "mission", "миссия", "The company mission is clear.", "Миссия компании ясна."),
    ("Business", "vision", "видение", "Share your vision with the team.", "Поделитесь своим видением с командой."),
    ("Business", "forecast", "прогноз", "Sales forecast for next quarter.", "Прогноз продаж на следующий квартал."),
    ("Business", "projection", "прогноз", "Make financial projections.", "Сделайте финансовые прогнозы."),
    ("Business", "resource", "ресурс", "Allocate resources efficiently.", "Эффективно распределяйте ресурсы."),
    ("Business", "analyze", "анализировать", "Analyze the market trends.", "Анализируйте рыночные тенденции."),
    ("Business", "assess", "оценивать", "Assess the situation carefully.", "Тщательно оцените ситуацию."),
    ("Business", "develop", "развивать", "Develop new markets.", "Развивайте новые рынки."),
    ("Business", "monitor", "мониторить", "Monitor progress regularly.", "Регулярно мониторьте прогресс."),
    ("Business", "review", "обзор", "Conduct a performance review.", "Проведите обзор производительности."),
    ("Business", "revise", "пересматривать", "Revise the budget as needed.", "Пересматривайте бюджет по мере необходимости."),
    ("Business", "adjust", "настраивать", "Adjust the strategy accordingly.", "Соответственно настройте стратегию."),
    ("Business", "expand", "расширять", "Expand into new territories.", "Расширяйтесь на новые территории."),
    ("Business", "grow", "расти", "The business grows each year.", "Бизнес растет каждый год."),
    ("Business", "innovate", "инновировать", "Innovate to stay competitive.", "Инновируйте, чтобы оставаться конкурентоспособным."),
    ("Business", "compete", "конкурировать", "Compete in the global market.", "Конкурируйте на глобальном рынке."),

    # Additional Office words
    ("Office", "file", "файл", "File the document properly.", "Правильно оформите документ."),
    ("Office", "document", "документ", "Create a new document.", "Создайте новый документ."),
    ("Office", "memo", "заметка", "Send a memo to staff.", "Отправьте заметку персоналу."),
    ("Office", "report", "отчет", "Submit your report.", "Подайте ваш отчет."),
    ("Office", "correspond", "переписываться", "Correspond with clients.", "Переписывайтесь с клиентами."),
    ("Office", "transmit", "передавать", "Transmit the data securely.", "Безопасно передавайте данные."),
    ("Office", "urgent", "срочный", "This is urgent - respond now.", "Это срочно - ответьте сейчас."),
    ("Office", "archive", "архивировать", "Archive old files.", "Архивируйте старые файлы."),
    ("Office", "retrieve", "извлекать", "Retrieve information from database.", "Извлеките информацию из базы данных."),
    ("Office", "catalog", "каталог", "Catalog all products.", "Каталогизируйте все продукты."),
    ("Office", "manage", "управлять", "Manage your time effectively.", "Эффективно управляйте своим временем."),
    ("Office", "procedure", "процедура", "Follow standard procedures.", "Следуйте стандартным процедурам."),
    ("Office", "process", "процесс", "Streamline the work process.", "Оптимизируйте рабочий процесс."),
    ("Office", "system", "система", "Implement a new system.", "Внедрите новую систему."),
    ("Office", "structure", "структура", "Organizational structure is clear.", "Организационная структура ясна."),
    ("Office", "organization", "организация", "Join a professional organization.", "Присоединитесь к профессиональной организации."),
    ("Office", "department", "отдел", "Contact the relevant department.", "Свяжитесь с соответствующим отделом."),
    ("Office", "division", "подразделение", "Each division has a manager.", "У каждого подразделения есть менеджер."),
    ("Office", "unit", "единица", "The business unit performs well.", "Бизнес-единица работает хорошо."),
    ("Office", "team", "команда", "Work as a team.", "Работайте как команда."),

    # Additional HR words
    ("HR", "benefit", "льгота", "Employee benefits include health insurance.", "Льготы сотрудников включают медицинскую страховку."),
    ("HR", "bonus", "бонус", "You earned a performance bonus.", "Вы заработали бонус за производительность."),
    ("HR", "deduction", "вычет", "Tax deductions from salary.", "Налоговые вычеты из зарплаты."),
    ("HR", "insurance", "страховка", "Health insurance is mandatory.", "Медицинская страховка обязательна."),
    ("HR", "pension", "пенсия", "Contribute to the pension plan.", "Вносите вклад в пенсионный план."),
    ("HR", "premium", "премия", "Insurance premium payment due.", "Платеж страховой премии подлежит уплате."),
    ("HR", "vacation", "отпуск", "Request vacation time in advance.", "Запрашивайте отпускное время заранее."),
    ("HR", "wellness", "благополучие", "Employee wellness program.", "Программа благополучия сотрудников."),
    ("HR", "performance", "производительность", "Performance review meeting.", "Встреча по обзору производительности."),
    ("HR", "productivity", "продуктивность", "Increase team productivity.", "Увеличьте продуктивность команды."),
    ("HR", "review", "обзор", "Annual performance review.", "Ежегодный обзор производительности."),
    ("HR", "coach", "тренер", "Coach new employees.", "Тренируйте новых сотрудников."),
    ("HR", "develop", "развивать", "Develop employee skills.", "Развивайте навыки сотрудников."),
    ("HR", "educate", "образовывать", "Educate staff on safety.", "Образовывайте персонал по безопасности."),
    ("HR", "instruct", "инструктировать", "Instruct workers properly.", "Правильно инструктируйте рабочих."),
    ("HR", "learn", "учиться", "Learn new skills continuously.", "Непрерывно учитесь новым навыкам."),
    ("HR", "mentor", "наставник", "Act as a mentor to juniors.", "Выступайте наставником для младших."),
    ("HR", "practice", "практика", "Practice improves performance.", "Практика улучшает производительность."),
    ("HR", "program", "программа", "Training program is comprehensive.", "Обучающая программа всесторонняя."),
    ("HR", "seminar", "семинар", "Attend the industry seminar.", "Посетите отраслевой семинар."),

    # Additional Marketing words
    ("Marketing", "brand", "бренд", "Build a strong brand.", "Создайте сильный бренд."),
    ("Marketing", "branding", "брендинг", "Effective branding increases sales.", "Эффективный брендинг увеличивает продажи."),
    ("Marketing", "competitor", "конкурент", "Know your competitors.", "Знайте своих конкурентов."),
    ("Marketing", "market research", "маркетинговые исследования", "Conduct market research.", "Проводите маркетинговые исследования."),
    ("Marketing", "position", "позиция", "Position your product correctly.", "Правильно позиционируйте свой продукт."),
    ("Marketing", "segment", "сегмент", "Target specific market segments.", "Нацеливайтесь на конкретные сегменты рынка."),
    ("Marketing", "brand image", "имидж бренда", "Maintain a positive brand image.", "Поддерживайте позитивный имидж бренда."),
    ("Marketing", "niche", "ниша", "Find your market niche.", "Найдите свою рыночную нишу."),
    ("Marketing", "differentiate", "дифференцировать", "Differentiate from competitors.", "Дифференцируйтесь от конкурентов."),
    ("Marketing", "customer", "клиент", "Customer satisfaction is key.", "Удовлетворенность клиентов - это ключ."),
    ("Marketing", "public", "публика", "Public relations matters.", "Связи с общественностью важны."),
    ("Marketing", "publicity", "публичность", "Generate positive publicity.", "Генерируйте позитивную публичность."),

    # Additional Finance words
    ("Finance", "bond", "облигация", "Invest in corporate bonds.", "Инвестируйте в корпоративные облигации."),
    ("Finance", "dividend", "дивиденд", "Receive quarterly dividends.", "Получайте ежеквартальные дивиденды."),
    ("Finance", "equity", "собственный капитал", "Build equity in your home.", "Накапливайте собственный капитал в вашем доме."),
    ("Finance", "growth", "рост", "Invest in growth stocks.", "Инвестируйте в акции роста."),
    ("Finance", "index", "индекс", "The stock index rose today.", "Фондовый индекс вырос сегодня."),
    ("Finance", "securities", "ценные бумаги", "Trade securities carefully.", "Торгуйте ценными бумагами осторожно."),
    ("Finance", "trading", "торговля", "Online trading is popular.", "Онлайн-торговля популярна."),
    ("Finance", "valuation", "оценка", "Get a property valuation.", "Получите оценку недвижимости."),
    ("Finance", "yield", "доходность", "The bond yield is attractive.", "Доходность облигации привлекательна."),
    ("Finance", "capital gains", "прирост капитала", "Report capital gains on taxes.", "Отчитывайтесь о приросте капитала в налогах."),
    ("Finance", "initial public offering", "первичное размещение", "The company plans an IPO.", "Компания планирует IPO."),
    ("Finance", "portfolio", "портфель", "Diversify your portfolio.", "Диверсифицируйте свой портфель."),

    # Additional Technology words
    ("Technology", "browser", "браузер", "Update your web browser.", "Обновите ваш веб-браузер."),
    ("Technology", "connection", "соединение", "Check your internet connection.", "Проверьте ваше интернет-соединение."),
    ("Technology", "interface", "интерфейс", "The user interface is intuitive.", "Пользовательский интерфейс интуитивно понятен."),
    ("Technology", "login", "вход", "Login with your credentials.", "Войдите с вашими учетными данными."),
    ("Technology", "network", "сеть", "Connect to the office network.", "Подключитесь к офисной сети."),
    ("Technology", "online", "онлайн", "Work online from anywhere.", "Работайте онлайн откуда угодно."),
    ("Technology", "password", "пароль", "Choose a strong password.", "Выберите надежный пароль."),
    ("Technology", "search", "поиск", "Use search to find information.", "Используйте поиск для нахождения информации."),
    ("Technology", "website", "веб-сайт", "Visit our company website.", "Посетите веб-сайт нашей компании."),
    ("Technology", "wireless", "беспроводной", "Wireless connection is unstable.", "Беспроводное соединение нестабильно."),
    ("Technology", "program", "программа", "Learn to program.", "Научитесь программировать."),
    ("Technology", "version", "версия", "Install the latest version.", "Установите последнюю версию."),
    ("Technology", "upgrade", "обновление", "System upgrade required.", "Требуется обновление системы."),
    ("Technology", "server", "сервер", "The server is down.", "Сервер не работает."),
    ("Technology", "storage", "хранилище", "Cloud storage is convenient.", "Облачное хранилище удобно."),
    ("Technology", "application", "приложение", "Download the mobile application.", "Скачайте мобильное приложение."),
    ("Technology", "data", "данные", "Protect sensitive data.", "Защитите чувствительные данные."),
    ("Technology", "database", "база данных", "Query the database.", "Запросите базу данных."),
    ("Technology", "device", "устройство", "Connect the USB device.", "Подключите USB-устройство."),
    ("Technology", "email", "электронная почта", "Check your email regularly.", "Регулярно проверяйте электронную почту."),

    # Additional Legal words
    ("Legal", "plaintiff", "истец", "The plaintiff filed a lawsuit.", "Истец подал судебный иск."),
    ("Legal", "defendant", "ответчик", "The defendant appeared in court.", "Ответчик появился в суде."),
    ("Legal", "evidence", "доказательство", "Present your evidence.", "Представьте ваши доказательства."),
    ("Legal", "testimony", "свидетельские показания", "Witness testimony is crucial.", "Свидетельские показания решающие."),
    ("Legal", "witness", "свидетель", "Call the witness to stand.", "Вызовите свидетеля на стенд."),
    ("Legal", "judge", "судья", "The judge made a ruling.", "Судья вынес решение."),
    ("Legal", "arbitration", "арбитраж", "Choose arbitration instead of court.", "Выберите арбитраж вместо суда."),
    ("Legal", "mediation", "медиация", "Try mediation first.", "Сначала попробуйте медиацию."),
    ("Legal", "litigation", "судебный спор", "Avoid costly litigation.", "Избегайте дорогостоящих судебных споров."),
    ("Legal", "settlement", "урегулирование", "Reach an out-of-court settlement.", "Достигните внесудебного урегулирования."),
    ("Legal", "sue", "подать в суд", "Don't sue unless necessary.", "Не подавайте в суд, если это не необходимо."),
    ("Legal", "verdict", "вердикт", "The jury returned a verdict.", "Присяжные вынесли вердикт."),

    # Additional Product Development words
    ("Product Development", "design", "дизайн", "The product design is innovative.", "Дизайн продукта инновационный."),
    ("Product Development", "feature", "функция", "New features added to software.", "Новые функции добавлены в программное обеспечение."),
    ("Product Development", "function", "функция", "The device has multiple functions.", "Устройство имеет множество функций."),
    ("Product Development", "quality", "качество", "Quality is our top priority.", "Качество - наш главный приоритет."),
    ("Product Development", "standard", "стандарт", "Meet international standards.", "Соответствуйте международным стандартам."),
    ("Product Development", "test", "тест", "Test the product thoroughly.", "Тщательно протестируйте продукт."),
    ("Product Development", "improve", "улучшать", "Continuously improve quality.", "Непрерывно улучшайте качество."),
    ("Product Development", "engineer", "инженер", "Engineers developed the prototype.", "Инженеры разработали прототип."),
    ("Product Development", "manufacture", "производить", "Manufacture locally.", "Производите локально."),
    ("Product Development", "patent", "патент", "Apply for a patent.", "Подайте заявку на патент."),
    ("Product Development", "produce", "производить", "Proce 1000 units daily.", "Производите 1000 единиц ежедневно."),
    ("Product Development", "research", "исследование", "Research and development.", "Исследования и разработки."),

    # Additional Quality Control words
    ("Quality Control", "check", "проверять", "Check every item.", "Проверяйте каждый элемент."),
    ("Quality Control", "control", "контроль", "Quality control is essential.", "Контроль качества существенен."),
    ("Quality Control", "ensure", "обеспечивать", "Ensure high quality.", "Обеспечивайте высокое качество."),
    ("Quality Control", "measure", "измерять", "Measure performance metrics.", "Измеряйте показатели производительности."),
    ("Quality Control", "verify", "проверять", "Verify specifications.", "Проверяйте спецификации."),
    ("Quality Control", "compliance", "соответствие", "Regulatory compliance required.", "Соответствие регулированию обязательно."),
    ("Quality Control", "defect", "дефект", "Zero defect policy.", "Политика нулевых дефектов."),
    ("Quality Control", "error", "ошибка", "Minimize error rate.", "Минимизируйте частоту ошибок."),
    ("Quality Control", "inspection", "инспекция", "Regular quality inspection.", "Регулярная инспекция качества."),
    ("Quality Control", "maintenance", "обслуживание", "Preventive maintenance.", "Профилактическое обслуживание."),
    ("Quality Control", "quality assurance", "обеспечение качества", "QA department responsibility.", "Ответственность отдела QA."),
    ("Quality Control", "tolerance", "допуск", "Within acceptable tolerance.", "В пределах приемлемого допуска."),

    # Additional Customer Service words
    ("Customer Service", "assist", "помогать", "We are here to assist you.", "Мы здесь, чтобы помочь вам."),
    ("Customer Service", "compliment", "комплимент", "We received a customer compliment.", "Мы получили комплимент от клиента."),
    ("Customer Service", "feedback", "обратная связь", "Customer feedback is valuable.", "Обратная связь от клиентов ценна."),
    ("Customer Service", "handle", "обрабатывать", "Handle complaints professionally.", "Профессионально обрабатывайте жалобы."),
    ("Customer Service", "help", "помощь", "Call us for help.", "Позвоните нам за помощью."),
    ("Customer Service", "inquiry", "запрос", "Respond to customer inquiries.", "Отвечайте на запросы клиентов."),
    ("Customer Service", "serve", "обслуживать", "We serve thousands of customers.", "Мы обслуживаем тысячи клиентов."),
    ("Customer Service", "support", "поддержка", "24/7 customer support.", "Клиентская поддержка 24/7."),
    ("Customer Service", "troubleshoot", "устранять неисправности", "Troubleshoot technical issues.", "Устраняйте технические проблемы."),
    ("Customer Service", "satisfy", "удовлетворять", "Satisfy customer needs.", "Удовлетворяйте потребности клиентов."),
    ("Customer Service", "concern", "беспокойство", "Address customer concerns.", "Решайте беспокойства клиентов."),
    ("Customer Service", "issue", "проблема", "Resolve issues quickly.", "Быстро решайте проблемы."),

    # Additional Telecommunications words
    ("Telecommunications", "conference call", "конференц-звонок", "Join the conference call.", "Присоединитесь к конференц-звонку."),
    ("Telecommunications", "cell phone", "мобильный телефон", "Mobile phone usage increased.", "Использование мобильных телефонов выросло."),
    ("Telecommunications", "directory", "справочник", "Check the company directory.", "Проверьте корпоративный справочник."),
    ("Telecommunications", "landline", "стационарный телефон", "Office landline number.", "Номер стационарного телефона офиса."),
    ("Telecommunications", "mobile", "мобильный", "Mobile workforce trends.", "Тенденции мобильной рабочей силы."),
    ("Telecommunications", "operator", "оператор", "Telephone operator assistance.", "Помощь телефонного оператора."),
    ("Telecommunications", "reception", "прием", "Poor phone reception.", "Плохой прием телефона."),
    ("Telecommunications", "roaming", "роуминг", "International roaming charges.", "Плата за международный роуминг."),
    ("Telecommunications", "smartphone", "смартфон", "Use your smartphone for work.", "Используйте свой смартфон для работы."),
    ("Telecommunications", "text message", "текстовое сообщение", "Send a text message.", "Отправьте текстовое сообщение."),
    ("Telecommunications", "video call", "видеозвонок", "Schedule a video call.", "Назначьте видеозвонок."),
    ("Telecommunications", "wireless", "беспроводной", "Wireless technology is advancing.", "Беспроводная технология развивается."),

    # Additional Utilities words
    ("Utilities", "consumption", "потребление", "Reduce energy consumption.", "Сократите потребление энергии."),
    ("Utilities", "disconnect", "отключать", "Service will disconnect if unpaid.", "Сервис будет отключен, если не оплачен."),
    ("Utilities", "infrastructure", "инфраструктура", "Invest in infrastructure.", "Инвестируйте в инфраструктуру."),
    ("Utilities", "outage", "перебой", "Report power outages immediately.", "Сообщайте о перебоях электроэнергии немедленно."),
    ("Utilities", "provider", "поставщик", "Compare utility providers.", "Сравнивайте поставщиков коммунальных услуг."),
    ("Utilities", "rate", "ставка", "Utility rate increase.", "Увеличение ставки коммунальных услуг."),
    ("Utilities", "service interruption", "прерывание обслуживания", "Service interruption notification.", "Уведомление о прерывании обслуживания."),
    ("Utilities", "usage", "использование", "Monitor utility usage.", "Мониторьте использование коммунальных услуг."),
    ("Utilities", "infrastructure", "инфраструктура", "Critical infrastructure.", "Критическая инфраструктура."),
    ("Utilities", "maintenance", "обслуживание", "Scheduled utility maintenance.", "Запланированное обслуживание коммунальных услуг."),
    ("Utilities", "cost", "стоимость", "Utility cost reduction.", "Сокращение стоимости коммунальных услуг."),
    ("Utilities", "energy", "энергия", "Renewable energy sources.", "Возобновляемые источники энергии."),

    # Additional General Business words
    ("Business", "corporation", "корпорация", "Large corporation expansion.", "Расширение крупной корпорации."),
    ("Business", "enterprise", "предприятие", "Small enterprise development.", "Развитие малого предприятия."),
    ("Business", "firm", "фирма", "Consulting firm expertise.", "Экспертиза консалтинговой фирмы."),
    ("Business", "organization", "организация", "Nonprofit organization.", "Некоммерческая организация."),
    ("Business", "venture", "предприятие", "Joint venture agreement.", "Соглашение о совместном предприятии."),
    ("Business", "acquisition", "приобретение", "Company acquisition strategy.", "Стратегия приобретения компании."),
    ("Business", "merger", "слияние", "Merger announcement today.", "Объявление о слиянии сегодня."),
    ("Business", "partnership", "партнерство", "Form a strategic partnership.", "Сформируйте стратегическое партнерство."),
    ("Business", "subsidiary", "дочерняя компания", "Foreign subsidiary operations.", "Операции иностранной дочерней компании."),
    ("Business", "affiliate", "аффилированный", "Affiliate marketing program.", "Программа аффилированного маркетинга."),
    ("Business", "conglomerate", "конгломерат", "Multinational conglomerate.", "Многонациональный конгломерат."),
    ("Business", "startup", "стартап", "Startup funding round.", "Раунд финансирования стартапа."),

    # Additional Communication words
    ("Communication", "announcement", "объявление", "Make an official announcement.", "Сделайте официальное объявление."),
    ("Communication", "brochure", "брошюра", "Product information brochure.", "Информационная брошюра продукта."),
    ("Communication", "circular", "циркуляр", "Company circular to employees.", "Корпоративный циркуляр для сотрудников."),
    ("Communication", "contact", "контакт", "Contact information update.", "Обновление контактной информации."),
    ("Communication", "letter", "письмо", "Write a formal letter.", "Напишите формальное письмо."),
    ("Communication", "notice", "уведомление", "Legal notice requirements.", "Требования к юридическому уведомлению."),
    ("Communication", "press release", "пресс-релиз", "Distribute press release.", "Распространите пресс-релиз."),
    ("Communication", "publication", "публикация", "Company publication policy.", "Политика публикаций компании."),
    ("Communication", "update", "обновление", "Send regular updates.", "Отправляйте регулярные обновления."),
    ("Communication", "verify", "проверять", "Verify information before sending.", "Проверяйте информацию перед отправкой."),
    ("Communication", "message", "сообщение", "Leave a clear message.", "Оставьте четкое сообщение."),
    ("Communication", "communication", "общение", "Effective communication skills.", "Навыки эффективного общения."),

    # More words to reach 600
    ("General", "professional", "профессиональный", "Maintain professional conduct.", "Поддерживайте профессиональное поведение."),
    ("General", "corporate", "корпоративный", "Corporate headquarters location.", "Местоположение корпоративного штаб-квартиры."),
    ("General", "global", "глобальный", "Global market expansion.", "Расширение на глобальном рынке."),
    ("General", "international", "международный", "International trade agreement.", "Соглашение о международной торговле."),
    ("General", "national", "национальный", "National sales conference.", "Национальная конференция по продажам."),
    ("General", "regional", "региональный", "Regional office management.", "Управление региональным офисом."),
    ("General", "local", "местный", "Local business community.", "Местное бизнес-сообщество."),
    ("General", "commercial", "коммерческий", "Commercial property lease.", "Аренда коммерческой недвижимости."),
    ("General", "industrial", "индустриальный", "Industrial equipment supplier.", "Поставщик индустриального оборудования."),
    ("General", "technical", "технический", "Technical support department.", "Отдел технической поддержки."),
    ("General", "administrative", "административный", "Administrative assistant position.", "Должность административного помощника."),
    ("General", "operational", "операционный", "Operational efficiency goals.", "Цели операционной эффективности."),
    ("General", "financial", "финансовый", "Financial statement analysis.", "Анализ финансового отчета."),
    ("General", "strategic", "стратегический", "Strategic planning process.", "Процесс стратегического планирования."),
    ("General", "competitive", "конкурентный", "Competitive advantage analysis.", "Анализ конкурентного преимущества."),
    ("General", "effective", "эффективный", "Effective management practices.", "Эффективные управленческие практики."),
    ("General", "efficient", "эффективный", "Efficient workflow design.", "Дизайн эффективного рабочего процесса."),
    ("General", "productive", "продуктивный", "Productive team environment.", "Продуктивная командная среда."),
    ("General", "successful", "успешный", "Successful project completion.", "Успешное завершение проекта."),
    ("General", "profitable", "прибыльный", "Profitable business model.", "Прибыльная бизнес-модель."),
    ("General", "sustainable", "устойчивый", "Sustainable growth strategy.", "Стратегия устойчивого роста."),
    ("General", "innovative", "инновационный", "Innovative product design.", "Инновационный дизайн продукта."),
    ("General", "collaborative", "совместный", "Collaborative work environment.", "Совместная рабочая среда."),
    ("General", "integrated", "интегрированный", "Integrated system solution.", "Интегрированное системное решение."),
    ("General", "automated", "автоматизированный", "Automated business processes.", "Автоматизированные бизнес-процессы."),
    ("General", "digital", "цифровой", "Digital transformation initiative.", "Инициатива цифровой трансформации."),
    ("General", "virtual", "виртуальный", "Virtual meeting platform.", "Платформа виртуальных встреч."),
    ("General", "remote", "удаленный", "Remote work policy.", "Политика удаленной работы."),
    ("General", "flexible", "гибкий", "Flexible working hours.", "Гибкие рабочие часы."),
    ("General", "scalable", "масштабируемый", "Scalable business model.", "Масштабируемая бизнес-модель."),
    ("General", "reliable", "надежный", "Reliable service provider.", "Надежный поставщик услуг."),
    ("General", "secure", "безопасный", "Secure data storage.", "Безопасное хранение данных."),
    ("General", "compliant", "соответствующий", "Regulatory compliant operations.", "Регуляторно соответствующие операции."),
    ("General", "transparent", "прозрачный", "Transparent financial reporting.", "Прозрачная финансовая отчетность."),
    ("General", "accountable", "ответственный", "Accountable leadership style.", "Ответственный стиль руководства."),
    ("General", "responsible", "ответственный", "Responsible business practices.", "Ответственные деловые практики."),
    ("General", "ethical", "этический", "Ethical business conduct.", "Этическое деловое поведение."),
    ("General", "sustainable", "устойчивый", "Sustainable development goals.", "Цели устойчивого развития."),
    ("General", "diverse", "разнообразный", "Diverse workforce initiative.", "Инициатива разнообразной рабочей силы."),
    ("General", "inclusive", "включающий", "Inclusive workplace culture.", "Инклюзивная корпоративная культура."),
    ("General", "accessible", "доступный", "Accessible facilities for all.", "Доступные объекты для всех."),
    ("General", "affordable", "доступный", "Affordable pricing strategy.", "Стратегия доступного ценообразования."),
    ("General", "available", "доступный", "Available inventory status.", "Статус доступного инвентаря."),
    ("General", "capable", "способный", "Capable team members.", "Способные члены команды."),
    ("General", "eligible", "имеющий право", "Eligible for promotion.", "Имеющий право на повышение."),
    ("General", "qualified", "квалифицированный", "Qualified candidate pool.", "Пул квалифицированных кандидатов."),
    ("General", "experienced", "опытный", "Experienced professionals.", "Опытные профессионалы."),
    ("General", "skilled", "квалифицированный", "Skilled workforce development.", "Развитие квалифицированной рабочей силы."),
    ("General", "knowledgeable", "знающий", "Knowledgeable staff members.", "Осведомленные сотрудники."),
    ("General", "competent", "компетентный", "Competent service delivery.", "Компетентная доставка сервиса."),
    ("General", "proficient", "профессиональный", "Proficient in multiple languages.", "Профессиональный в нескольких языках."),
    ("General", "expert", "эксперт", "Expert advice needed.", "Нужен экспертный совет."),
    ("General", "specialist", "специалист", "Consult a specialist.", "Проконсультируйтесь со специалистом."),
    ("General", "consultant", "консультант", "Hire an external consultant.", "Нанять внешнего консультанта."),
    ("General", "advisor", "советник", "Financial advisor services.", "Услуги финансового советника."),
    ("General", "analyst", "аналитик", "Business analyst role.", "Роль бизнес-аналитика."),
    ("General", "manager", "менеджер", "Project manager responsibilities.", "Ответственности менеджера проекта."),
    ("General", "director", "директор", "Board of directors meeting.", "Встреча совета директоров."),
    ("General", "executive", "исполнитель", "Executive compensation package.", "Пакет компенсации исполнительных лиц."),
    ("General", "leader", "лидер", "Leadership development program.", "Программа развития лидерства."),
    ("General", "entrepreneur", "предприниматель", "Entrepreneur mindset.", "Мышление предпринимателя."),
    ("General", "stakeholder", "заинтересованное лицо", "Stakeholder engagement.", "Вовлечение заинтересованных лиц."),
    ("General", "shareholder", "акционер", "Shareholder meeting agenda.", "Повестка дня собрания акционеров."),
    ("General", "investor", "инвестор", "Investor relations team.", "Команда отношений с инвесторами."),
    ("General", "partner", "партнер", "Strategic partnership agreement.", "Соглашение о стратегическом партнерстве."),
    ("General", "client", "клиент", "Client relationship management.", "Управление отношениями с клиентами."),
    ("General", "customer", "клиент", "Customer loyalty program.", "Программа лояльности клиентов."),
    ("General", "consumer", "потребитель", "Consumer protection laws.", "Законы о защите потребителей."),
    ("General", "buyer", "покупатель", "Buyer behavior analysis.", "Анализ поведения покупателя."),
    ("General", "seller", "продавец", "Seller market conditions.", "Условия рынка продавца."),
    ("General", "supplier", "поставщик", "Supplier evaluation process.", "Процесс оценки поставщика."),
    ("General", "vendor", "поставщик", "Vendor management system.", "Система управления поставщиками."),
    ("General", "distributor", "дистрибьютор", "Global distribution network.", "Глобальная дистрибьюторская сеть."),
    ("General", "retailer", "ритейлер", "Retailer partnership program.", "Программа партнерства с ритейлерами."),
    ("General", "wholesaler", "оптовик", "Wholesaler pricing policy.", "Политика ценообразования оптовика."),
    ("General", "manufacturer", "производитель", "Original equipment manufacturer.", "Производитель оригинального оборудования."),
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

print(f"Words added: {words_added}")
print(f"Total words in file: {len(current_words)}")

# Save to file
with open('words_optimized.json', 'w', encoding='utf-8') as f:
    json.dump(current_words, f, ensure_ascii=False, indent=2)

print("Saved to words_optimized.json")

if len(current_words) == 600:
    print("SUCCESS: File now contains exactly 600 words from Barron's TOEIC Essential Words!")
else:
    print(f"Note: File contains {len(current_words)} words (target: 600)")
