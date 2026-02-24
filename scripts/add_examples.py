#!/usr/bin/env python3
"""Add missing TOEIC business English examples to words_optimized.json."""

import json

EXAMPLES = {
    # Accounting
    ("Accounting", "audit"): ("The auditor reviewed all financial records.", "Аудитор проверил все финансовые записи."),
    ("Accounting", "balance"): ("The balance sheet looks positive.", "Баланс выглядит положительным."),
    ("Accounting", "bookkeeping"): ("Accurate bookkeeping is required.", "Требуется точное ведение бухгалтерии."),
    ("Accounting", "budget"): ("The department exceeded its budget.", "Отдел превысил свой бюджет."),
    ("Accounting", "calculate"): ("Please calculate the total expenses.", "Пожалуйста, рассчитайте общие расходы."),
    ("Accounting", "cash flow"): ("Cash flow improved this quarter.", "Денежный поток улучшился в этом квартале."),
    ("Accounting", "depreciate"): ("The equipment will depreciate over time.", "Оборудование будет амортизироваться со временем."),
    ("Accounting", "expense"): ("Travel expenses must be approved.", "Командировочные расходы должны быть одобрены."),
    ("Accounting", "ledger"): ("All entries were posted to the ledger.", "Все записи внесены в бухгалтерскую книгу."),
    ("Accounting", "reconcile"): ("We must reconcile the accounts monthly.", "Мы должны сверять счета ежемесячно."),
    ("Accounting", "revenue"): ("Revenue grew by 15% this year.", "Выручка выросла на 15% в этом году."),

    # Banking
    ("Banking", "account"): ("Please open a business account.", "Пожалуйста, откройте бизнес-счёт."),
    ("Banking", "collateral"): ("The loan requires collateral.", "Кредит требует залогового обеспечения."),
    ("Banking", "credit"): ("The company has strong credit.", "У компании хорошая кредитная история."),
    ("Banking", "deposit"): ("A security deposit is required.", "Требуется залоговый депозит."),
    ("Banking", "draft"): ("Please issue a bank draft.", "Пожалуйста, оформите банковский вексель."),
    ("Banking", "interest"): ("The interest rate is 5% annually.", "Процентная ставка составляет 5% в год."),
    ("Banking", "overdraft"): ("Avoid overdraft fees by planning ahead.", "Избегайте штрафов за овердрафт, планируя заранее."),
    ("Banking", "transfer"): ("Wire transfer was completed today.", "Банковский перевод выполнен сегодня."),

    # Business Planning
    ("Business Planning", "allocate"): ("Funds were allocated to each department.", "Средства распределены по каждому отделу."),
    ("Business Planning", "analyze"): ("We analyzed the market trends carefully.", "Мы тщательно проанализировали рыночные тенденции."),
    ("Business Planning", "assess"): ("Management will assess the risks involved.", "Руководство оценит связанные риски."),
    ("Business Planning", "benchmark"): ("We use industry benchmarks for comparison.", "Мы используем отраслевые показатели для сравнения."),
    ("Business Planning", "contingency"): ("A contingency plan was prepared.", "Был подготовлен план на непредвиденный случай."),
    ("Business Planning", "forecast"): ("Sales forecast looks promising.", "Прогноз продаж выглядит многообещающе."),
    ("Business Planning", "implement"): ("The new strategy will be implemented soon.", "Новая стратегия будет реализована вскоре."),
    ("Business Planning", "milestone"): ("We reached an important project milestone.", "Мы достигли важной вехи проекта."),
    ("Business Planning", "objective"): ("The quarterly objectives were clearly set.", "Квартальные цели были чётко установлены."),

    # Computers
    ("Computers", "access"): ("Please access the shared network drive.", "Пожалуйста, получите доступ к общему сетевому диску."),
    ("Computers", "application"): ("Install the business application first.", "Сначала установите бизнес-приложение."),
    ("Computers", "backup"): ("Back up all data before the upgrade.", "Сделайте резервную копию данных перед обновлением."),
    ("Computers", "compatible"): ("Ensure the software is compatible.", "Убедитесь, что программное обеспечение совместимо."),
    ("Computers", "database"): ("The customer database was updated.", "База данных клиентов была обновлена."),
    ("Computers", "download"): ("Download the latest software update.", "Загрузите последнее обновление программного обеспечения."),
    ("Computers", "encrypt"): ("All files must be encrypted.", "Все файлы должны быть зашифрованы."),
    ("Computers", "install"): ("IT will install the new system today.", "ИТ-отдел установит новую систему сегодня."),
    ("Computers", "network"): ("The office network was upgraded.", "Офисная сеть была модернизирована."),
    ("Computers", "password"): ("Change your password every 90 days.", "Меняйте пароль каждые 90 дней."),

    # Conferences
    ("Conferences", "agenda"): ("The meeting agenda was distributed.", "Повестка дня совещания была разослана."),
    ("Conferences", "attendee"): ("All attendees received name badges.", "Все участники получили именные бейджи."),
    ("Conferences", "chairperson"): ("The chairperson opened the session.", "Председатель открыл заседание."),
    ("Conferences", "concurrent"): ("Two concurrent sessions were held.", "Проводились два параллельных заседания."),
    ("Conferences", "delegate"): ("Each delegate received a conference kit.", "Каждый делегат получил конференц-пакет."),
    ("Conferences", "exhibit"): ("Companies exhibit products at the trade show.", "Компании демонстрируют продукцию на выставке."),
    ("Conferences", "keynote"): ("The CEO delivered the keynote address.", "Генеральный директор выступил с основным докладом."),
    ("Conferences", "moderator"): ("The moderator led the panel discussion.", "Модератор вёл панельную дискуссию."),
    ("Conferences", "panel"): ("A panel of experts answered questions.", "Группа экспертов отвечала на вопросы."),
    ("Conferences", "participant"): ("All participants signed the attendance sheet.", "Все участники подписали лист посещаемости."),
    ("Conferences", "plenary"): ("The plenary session starts at 9 AM.", "Пленарное заседание начинается в 9:00."),
    ("Conferences", "registration"): ("Conference registration closes tomorrow.", "Регистрация на конференцию закрывается завтра."),
    ("Conferences", "seminar"): ("A sales seminar was held last week.", "На прошлой неделе прошёл семинар по продажам."),
    ("Conferences", "session"): ("The morning session covered new regulations.", "Утреннее заседание охватывало новые правила."),

    # Contracts
    ("Contracts", "authorize"): ("The manager authorized the contract.", "Менеджер утвердил контракт."),
    ("Contracts", "clause"): ("The penalty clause was included.", "Штрафная оговорка была включена."),
    ("Contracts", "comply"): ("All parties must comply with the terms.", "Все стороны должны соблюдать условия."),
    ("Contracts", "confidential"): ("The agreement is strictly confidential.", "Соглашение строго конфиденциально."),
    ("Contracts", "convince"): ("He convinced the client to sign.", "Он убедил клиента подписать."),
    ("Contracts", "enforceable"): ("The contract terms are legally enforceable.", "Условия контракта юридически обязательны."),
    ("Contracts", "obligation"): ("Both parties have clear obligations.", "У обеих сторон есть чёткие обязательства."),
    ("Contracts", "terminate"): ("Either party may terminate the contract.", "Любая из сторон может расторгнуть контракт."),

    # Electronics
    ("Electronics", "appliance"): ("The office appliance needs servicing.", "Офисный прибор нуждается в обслуживании."),
    ("Electronics", "battery"): ("Replace the battery before the trip.", "Замените батарею перед поездкой."),
    ("Electronics", "cable"): ("The network cable was replaced.", "Сетевой кабель был заменён."),
    ("Electronics", "component"): ("A faulty component caused the failure.", "Неисправный компонент вызвал сбой."),
    ("Electronics", "device"): ("Each employee received a mobile device.", "Каждый сотрудник получил мобильное устройство."),
    ("Electronics", "display"): ("The display shows live sales data.", "На дисплее отображаются данные о продажах."),
    ("Electronics", "install"): ("Technicians installed the new equipment.", "Техники установили новое оборудование."),
    ("Electronics", "manufacture"): ("We manufacture electronic components.", "Мы производим электронные компоненты."),
    ("Electronics", "operate"): ("Train staff to operate the equipment.", "Обучите персонал работе с оборудованием."),
    ("Electronics", "power"): ("The server lost power during the storm.", "Сервер потерял питание во время шторма."),
    ("Electronics", "repair"): ("The technician will repair the device.", "Техник отремонтирует устройство."),
    ("Electronics", "specification"): ("Review all technical specifications.", "Ознакомьтесь со всеми техническими характеристиками."),
    ("Electronics", "upgrade"): ("Upgrade the system before year end.", "Обновите систему до конца года."),
    ("Electronics", "voltage"): ("Check the voltage before plugging in.", "Проверьте напряжение перед подключением."),
    ("Electronics", "warranty"): ("The device comes with a 2-year warranty.", "Устройство поставляется с 2-летней гарантией."),

    # Events & Entertainment
    ("Events & Entertainment", "amusement"): ("The amusement park hosted a company event.", "Парк развлечений принял корпоративное мероприятие."),
    ("Events & Entertainment", "announcer"): ("The announcer introduced the keynote speaker.", "Ведущий представил основного докладчика."),
    ("Events & Entertainment", "appetizer"): ("Appetizers were served before the banquet.", "Перед банкетом подали закуски."),
    ("Events & Entertainment", "arrange"): ("HR arranged the year-end celebration.", "Отдел кадров организовал праздник по итогам года."),
    ("Events & Entertainment", "auditorium"): ("The auditorium holds 500 people.", "Зал вмещает 500 человек."),
    ("Events & Entertainment", "banquet"): ("A banquet was held for all partners.", "Банкет был проведён для всех партнёров."),
    ("Events & Entertainment", "beneficial"): ("The team event was beneficial for morale.", "Командное мероприятие благотворно повлияло на моральный дух."),
    ("Events & Entertainment", "book"): ("Book the venue three months in advance.", "Забронируйте площадку за три месяца."),
    ("Events & Entertainment", "calendar"): ("Add all events to the corporate calendar.", "Добавьте все события в корпоративный календарь."),
    ("Events & Entertainment", "celebration"): ("The celebration honored top performers.", "Праздник чествовал лучших сотрудников."),
    ("Events & Entertainment", "ceremony"): ("The awards ceremony starts at 7 PM.", "Церемония награждения начинается в 19:00."),
    ("Events & Entertainment", "choreograph"): ("A professional choreographed the stage show.", "Профессионал поставил сценическое шоу."),
    ("Events & Entertainment", "choreographer"): ("The choreographer led rehearsals all week.", "Хореограф проводил репетиции всю неделю."),
    ("Events & Entertainment", "collaborate"): ("Teams collaborated to plan the summit.", "Команды сотрудничали при планировании саммита."),
    ("Events & Entertainment", "commemorate"): ("The event commemorated 25 years of business.", "Мероприятие отметило 25 лет деятельности компании."),
    ("Events & Entertainment", "commencement"): ("Commencement of the conference is at 9 AM.", "Начало конференции в 9:00."),
    ("Events & Entertainment", "compere"): ("The compere introduced each speaker.", "Ведущий представил каждого докладчика."),
    ("Events & Entertainment", "concert"): ("A concert was organized for the gala.", "Для гала-вечера был организован концерт."),
    ("Events & Entertainment", "confer"): ("Directors will confer after the presentation.", "Директора проведут совещание после презентации."),
    ("Events & Entertainment", "congregate"): ("Guests congregated in the main hall.", "Гости собрались в главном зале."),

    # Financial Statements
    ("Financial Statements", "asset"): ("Current assets include cash and inventory.", "Оборотные активы включают денежные средства и запасы."),
    ("Financial Statements", "deficit"): ("The company reported a budget deficit.", "Компания сообщила о дефиците бюджета."),
    ("Financial Statements", "dividend"): ("Shareholders received a quarterly dividend.", "Акционеры получили квартальные дивиденды."),
    ("Financial Statements", "equity"): ("Shareholder equity increased this year.", "Акционерный капитал вырос в этом году."),
    ("Financial Statements", "liability"): ("Long-term liabilities are listed below.", "Долгосрочные обязательства перечислены ниже."),
    ("Financial Statements", "liquidity"): ("Strong liquidity ensures business continuity.", "Высокая ликвидность обеспечивает непрерывность бизнеса."),
    ("Financial Statements", "margin"): ("The profit margin improved by 3%.", "Рентабельность улучшилась на 3%."),
    ("Financial Statements", "net income"): ("Net income rose to $2 million.", "Чистый доход вырос до 2 миллионов долларов."),
    ("Financial Statements", "profit"): ("The firm posted record profits.", "Компания показала рекордную прибыль."),
    ("Financial Statements", "quarter"): ("Revenue grew each quarter this year.", "Выручка росла каждый квартал в этом году."),
    ("Financial Statements", "statement"): ("The financial statement was audited.", "Финансовая отчётность была проверена аудитором."),

    # Hiring
    ("Hiring", "applicant"): ("Several applicants passed the screening.", "Несколько кандидатов прошли отбор."),
    ("Hiring", "candidate"): ("The candidate has strong qualifications.", "Кандидат имеет высокую квалификацию."),
    ("Hiring", "interview"): ("Final interviews are scheduled next week.", "Финальные собеседования запланированы на следующую неделю."),
    ("Hiring", "position"): ("We filled the senior analyst position.", "Мы заполнили должность старшего аналитика."),
    ("Hiring", "post"): ("The job was posted on the company website.", "Вакансия была размещена на сайте компании."),
    ("Hiring", "reference"): ("Please provide two professional references.", "Пожалуйста, предоставьте две профессиональные рекомендации."),
    ("Hiring", "reject"): ("The committee rejected three applications.", "Комитет отклонил три заявки."),
    ("Hiring", "resume"): ("Submit your resume by Friday.", "Пришлите резюме до пятницы."),

    # Hotels
    ("Hotels", "amenity"): ("The hotel offers excellent amenities.", "Отель предлагает отличные удобства."),
    ("Hotels", "arrange"): ("The concierge arranged airport transfer.", "Консьерж организовал трансфер из аэропорта."),
    ("Hotels", "book"): ("Please book a room for the client.", "Пожалуйста, забронируйте номер для клиента."),
    ("Hotels", "cancel"): ("You may cancel up to 24 hours before.", "Вы можете отменить за 24 часа до заезда."),
    ("Hotels", "confirm"): ("Please confirm your reservation by email.", "Пожалуйста, подтвердите бронирование по электронной почте."),
    ("Hotels", "cot"): ("A cot was added to the room.", "В номер добавили детскую кроватку."),
    ("Hotels", "courtesy"): ("A courtesy van takes guests to the airport.", "Бесплатный микроавтобус отвозит гостей в аэропорт."),
    ("Hotels", "front desk"): ("Contact the front desk for assistance.", "Обратитесь на стойку регистрации за помощью."),
    ("Hotels", "host"): ("The hotel hosted the international summit.", "Отель принял международный саммит."),
    ("Hotels", "hostel"): ("The hostel offers budget accommodation.", "Хостел предлагает бюджетное размещение."),
    ("Hotels", "inn"): ("The country inn has 20 guest rooms.", "В загородной гостинице 20 номеров."),

    # Insurance
    ("Insurance", "claim"): ("Submit an insurance claim immediately.", "Немедленно подайте страховое требование."),
    ("Insurance", "coverage"): ("Our policy provides full medical coverage.", "Наш полис обеспечивает полное медицинское страхование."),
    ("Insurance", "deductible"): ("The deductible is $500 per incident.", "Франшиза составляет 500 долларов на случай."),
    ("Insurance", "endorse"): ("The broker endorsed the policy change.", "Брокер подтвердил изменение полиса."),
    ("Insurance", "exempt"): ("Certain items are exempt from coverage.", "Некоторые предметы освобождены от страхового покрытия."),
    ("Insurance", "indemnify"): ("The insurer will indemnify all losses.", "Страховщик возместит все убытки."),
    ("Insurance", "liability"): ("The liability coverage protects the firm.", "Страхование ответственности защищает компанию."),
    ("Insurance", "policyholder"): ("The policyholder must renew annually.", "Страхователь должен ежегодно продлевать полис."),
    ("Insurance", "premium"): ("The annual insurance premium increased.", "Ежегодная страховая премия увеличилась."),
    ("Insurance", "reimbursement"): ("Medical reimbursement takes 30 days.", "Возмещение медицинских расходов занимает 30 дней."),
    ("Insurance", "risk"): ("The risk was assessed before coverage.", "Риск был оценён перед оформлением покрытия."),
    ("Insurance", "underwrite"): ("The bank underwrites the business loan.", "Банк гарантирует бизнес-кредит."),

    # Inventory
    ("Inventory", "accurate"): ("Accurate inventory data prevents shortages.", "Точные данные об инвентаре предотвращают дефицит."),
    ("Inventory", "adequate"): ("Maintain adequate stock levels at all times.", "Поддерживайте достаточный уровень запасов."),
    ("Inventory", "adjustment"): ("An inventory adjustment was made.", "Была проведена корректировка инвентаря."),
    ("Inventory", "backlog"): ("A backlog of orders built up quickly.", "Невыполненные заказы накапливались быстро."),
    ("Inventory", "bulk"): ("Buying in bulk reduces unit costs.", "Покупка оптом снижает стоимость единицы."),
    ("Inventory", "carrier"): ("The carrier delivered the stock on time.", "Перевозчик доставил товар вовремя."),
    ("Inventory", "complete"): ("Complete the stock count by Friday.", "Завершите инвентаризацию до пятницы."),
    ("Inventory", "consignment"): ("A consignment arrived from the supplier.", "От поставщика поступила партия товара."),
    ("Inventory", "count"): ("A full inventory count is done quarterly.", "Полная инвентаризация проводится ежеквартально."),
    ("Inventory", "decrease"): ("Inventory levels decreased due to high demand.", "Уровень запасов снизился из-за высокого спроса."),
    ("Inventory", "defective"): ("Defective items were returned to the supplier.", "Дефектные товары были возвращены поставщику."),
    ("Inventory", "demand"): ("Strong demand depleted the warehouse stock.", "Высокий спрос истощил складские запасы."),
    ("Inventory", "diminish"): ("Reserves continue to diminish this season.", "Запасы продолжают уменьшаться в этом сезоне."),
    ("Inventory", "discontinue"): ("They discontinued the old product line.", "Они прекратили выпуск старой линейки продуктов."),
    ("Inventory", "distribute"): ("Goods are distributed to regional warehouses.", "Товары распределяются по региональным складам."),
    ("Inventory", "manage"): ("Efficiently manage inventory to reduce costs.", "Эффективно управляйте запасами для снижения затрат."),

    # Investments
    ("Investments", "acquire"): ("The firm acquired a smaller competitor.", "Компания приобрела более мелкого конкурента."),
    ("Investments", "appreciate"): ("Property values appreciated significantly.", "Стоимость недвижимости значительно выросла."),
    ("Investments", "asset"): ("Diversify assets to manage risk.", "Диверсифицируйте активы для управления рисками."),
    ("Investments", "bond"): ("The company issued corporate bonds.", "Компания выпустила корпоративные облигации."),
    ("Investments", "broker"): ("Our broker advised on the portfolio.", "Наш брокер консультировал по портфелю."),
    ("Investments", "capital"): ("We raised capital through the IPO.", "Мы привлекли капитал через IPO."),
    ("Investments", "diversify"): ("Diversify your investment portfolio wisely.", "Разумно диверсифицируйте инвестиционный портфель."),
    ("Investments", "fund"): ("The pension fund performed well.", "Пенсионный фонд показал хорошие результаты."),
    ("Investments", "gain"): ("Investors realized significant capital gains.", "Инвесторы получили значительный прирост капитала."),
    ("Investments", "interest rate"): ("Low interest rates boost investments.", "Низкие процентные ставки стимулируют инвестиции."),
    ("Investments", "portfolio"): ("Review your investment portfolio quarterly.", "Пересматривайте инвестиционный портфель ежеквартально."),
    ("Investments", "return"): ("The investment return exceeded expectations.", "Доходность инвестиций превысила ожидания."),
    ("Investments", "shareholder"): ("Shareholders approved the merger plan.", "Акционеры одобрили план слияния."),

    # Invoices
    ("Invoices", "acknowledge"): ("Please acknowledge receipt of the invoice.", "Пожалуйста, подтвердите получение счёта."),
    ("Invoices", "accurate"): ("Ensure all invoice amounts are accurate.", "Убедитесь, что все суммы в счёте точны."),
    ("Invoices", "arrear"): ("Payment is three weeks in arrear.", "Платёж просрочен на три недели."),
    ("Invoices", "charge"): ("A service charge was added to the invoice.", "В счёт была добавлена плата за обслуживание."),
    ("Invoices", "collect"): ("We collect payments within 30 days.", "Мы взимаем платежи в течение 30 дней."),
    ("Invoices", "consolidate"): ("Consolidate all invoices into one payment.", "Объедините все счета в один платёж."),
    ("Invoices", "debit"): ("The amount was debited from the account.", "Сумма была списана со счёта."),
    ("Invoices", "detail"): ("Include full details on every invoice.", "Включайте полные сведения в каждый счёт."),
    ("Invoices", "due"): ("Payment is due within 30 days.", "Платёж должен быть произведён в течение 30 дней."),
    ("Invoices", "duty"): ("Import duty was added to the invoice.", "В счёт была включена импортная пошлина."),
    ("Invoices", "estimate"): ("An estimate was sent before the invoice.", "Перед выставлением счёта была отправлена смета."),
    ("Invoices", "fee"): ("A late fee applies after 30 days.", "Штраф за просрочку применяется после 30 дней."),
    ("Invoices", "figure"): ("Check the figures before sending the invoice.", "Проверьте цифры перед отправкой счёта."),
    ("Invoices", "finance"): ("Finance approved the payment schedule.", "Финансовый отдел одобрил график платежей."),

    # Legal
    ("Legal", "accuse"): ("The company was accused of fraud.", "Компанию обвинили в мошенничестве."),
    ("Legal", "adjudicate"): ("The dispute was adjudicated by arbitration.", "Спор был урегулирован в арбитражном порядке."),
    ("Legal", "admissible"): ("Only admissible evidence is accepted.", "Принимаются только допустимые доказательства."),
    ("Legal", "affidavit"): ("An affidavit was submitted to the court.", "Аффидевит был подан в суд."),
    ("Legal", "allege"): ("The client alleged a breach of contract.", "Клиент утверждал о нарушении договора."),
    ("Legal", "annul"): ("The court may annul the agreement.", "Суд может аннулировать соглашение."),
    ("Legal", "appeal"): ("The company filed an appeal against the ruling.", "Компания подала апелляцию на решение суда."),
    ("Legal", "applicable"): ("All applicable laws must be followed.", "Необходимо соблюдать все применимые законы."),
    ("Legal", "binding"): ("The contract is legally binding.", "Контракт является юридически обязательным."),
    ("Legal", "breach"): ("A breach of contract was reported.", "Было сообщено о нарушении контракта."),
    ("Legal", "brief"): ("Legal counsel briefed the management team.", "Юрисконсульт проинструктировал руководство."),
    ("Legal", "case"): ("The legal case was settled out of court.", "Судебное дело было урегулировано во внесудебном порядке."),
    ("Legal", "cause"): ("The cause of action was clearly stated.", "Основание для иска было чётко изложено."),
    ("Legal", "certify"): ("The document must be certified by a notary.", "Документ должен быть заверен нотариусом."),
    ("Legal", "civil"): ("A civil lawsuit was filed against the firm.", "Против компании был подан гражданский иск."),
    ("Legal", "clause"): ("The exclusion clause limits liability.", "Оговорка об исключении ограничивает ответственность."),

    # Marketing
    ("Marketing", "convince"): ("The ad convinced customers to switch brands.", "Реклама убедила клиентов сменить бренд."),
    ("Marketing", "endorse"): ("A celebrity endorsed the product launch.", "Знаменитость поддержала запуск продукта."),
    ("Marketing", "segment"): ("We segment the market by age group.", "Мы сегментируем рынок по возрастным группам."),

    # Office Procedures
    ("Office Procedures", "agenda"): ("The meeting agenda was sent by email.", "Повестка дня совещания была отправлена по электронной почте."),
    ("Office Procedures", "archive"): ("Archive all completed project files.", "Архивируйте все завершённые проектные файлы."),
    ("Office Procedures", "authorize"): ("Only managers can authorize purchases.", "Только менеджеры могут разрешать закупки."),
    ("Office Procedures", "circulate"): ("Circulate the minutes to all staff.", "Разошлите протокол всем сотрудникам."),
    ("Office Procedures", "coordinate"): ("Coordinate with all departments before the deadline.", "Скоординируйтесь со всеми отделами до дедлайна."),
    ("Office Procedures", "deadline"): ("Submit the report before the deadline.", "Представьте отчёт до установленного срока."),
    ("Office Procedures", "delegate"): ("Delegate tasks to junior team members.", "Делегируйте задачи младшим членам команды."),
    ("Office Procedures", "distribute"): ("Distribute the policy update to all staff.", "Распространите обновление политики среди всех сотрудников."),
    ("Office Procedures", "file"): ("File all correspondence systematically.", "Систематически регистрируйте всю корреспонденцию."),
    ("Office Procedures", "forward"): ("Please forward the email to the team.", "Пожалуйста, перешлите письмо команде."),
    ("Office Procedures", "implement"): ("Implement the new office policy next month.", "Внедрите новую политику офиса в следующем месяце."),
    ("Office Procedures", "notify"): ("Notify all staff of the schedule change.", "Уведомите всех сотрудников об изменении расписания."),
    ("Office Procedures", "procedure"): ("Follow the standard office procedure.", "Следуйте стандартной офисной процедуре."),
    ("Office Procedures", "record"): ("Record all meeting minutes accurately.", "Точно фиксируйте все протоколы совещаний."),

    # Office Technology
    ("Office Technology", "copier"): ("The copier needs a paper refill.", "В копировальном аппарате закончилась бумага."),
    ("Office Technology", "fax"): ("Send the signed contract by fax.", "Отправьте подписанный контракт по факсу."),
    ("Office Technology", "hardware"): ("New hardware was installed in the office.", "В офисе установили новое оборудование."),
    ("Office Technology", "maintenance"): ("Schedule regular maintenance for all devices.", "Запланируйте регулярное техническое обслуживание."),
    ("Office Technology", "network"): ("The office network supports remote access.", "Офисная сеть поддерживает удалённый доступ."),
    ("Office Technology", "printer"): ("The printer is out of ink.", "В принтере закончились чернила."),
    ("Office Technology", "server"): ("The file server was backed up last night.", "Файловый сервер был зарезервирован прошлой ночью."),
    ("Office Technology", "software"): ("Update the accounting software regularly.", "Регулярно обновляйте бухгалтерское программное обеспечение."),
    ("Office Technology", "telephone"): ("Answer the telephone within three rings.", "Отвечайте на телефонный звонок после трёх гудков."),
    ("Office Technology", "upgrade"): ("Upgrade the office computers this quarter.", "Обновите офисные компьютеры в этом квартале."),

    # Ordering Supplies
    ("Ordering Supplies", "acknowledge"): ("Please acknowledge the purchase order.", "Пожалуйста, подтвердите заказ на поставку."),
    ("Ordering Supplies", "address"): ("Verify the delivery address before shipping.", "Проверьте адрес доставки перед отправкой."),
    ("Ordering Supplies", "cancel"): ("Cancel the order if stock is unavailable.", "Отмените заказ, если товар недоступен."),
    ("Ordering Supplies", "charge"): ("A handling charge was added to the order.", "К заказу добавлена плата за обработку."),
    ("Ordering Supplies", "confirm"): ("Confirm your order within 48 hours.", "Подтвердите заказ в течение 48 часов."),
    ("Ordering Supplies", "consignment"): ("The consignment was delivered yesterday.", "Партия товара была доставлена вчера."),
    ("Ordering Supplies", "debit"): ("The amount was debited upon shipment.", "Сумма была списана при отправке."),
    ("Ordering Supplies", "deliver"): ("Deliver supplies to the main office.", "Доставьте расходные материалы в главный офис."),
    ("Ordering Supplies", "dispatch"): ("Dispatch the order by end of day.", "Отправьте заказ до конца рабочего дня."),
    ("Ordering Supplies", "estimate"): ("Request an estimate for bulk supplies.", "Запросите смету на оптовые поставки."),
    ("Ordering Supplies", "expedite"): ("Please expedite this urgent order.", "Пожалуйста, ускорьте выполнение этого срочного заказа."),
    ("Ordering Supplies", "fill"): ("Fill the order and confirm shipment.", "Выполните заказ и подтвердите отгрузку."),

    # Promotions
    ("Promotions", "achievement"): ("Her achievement earned a promotion.", "Её достижение принесло продвижение по службе."),
    ("Promotions", "advancement"): ("Career advancement depends on performance.", "Карьерный рост зависит от результатов работы."),
    ("Promotions", "appoint"): ("She was appointed regional manager.", "Она была назначена региональным менеджером."),
    ("Promotions", "authority"): ("The director has full authority over the team.", "Директор имеет полные полномочия над командой."),
    ("Promotions", "demote"): ("He was demoted after poor performance.", "Он был понижен в должности из-за низких результатов."),
    ("Promotions", "discharge"): ("The employee was discharged last month.", "Сотрудник был уволен в прошлом месяце."),
    ("Promotions", "dismiss"): ("Management dismissed three employees.", "Руководство уволило трёх сотрудников."),
    ("Promotions", "fire"): ("He was fired for misconduct.", "Он был уволен за неправомерное поведение."),
    ("Promotions", "lay off"): ("The company laid off 50 workers.", "Компания уволила 50 работников."),
    ("Promotions", "motivate"): ("Bonuses motivate employees to perform.", "Бонусы мотивируют сотрудников работать эффективно."),
    ("Promotions", "raise"): ("She received a salary raise after review.", "После аттестации она получила повышение зарплаты."),

    # Property & Real Estate
    ("Property & Real Estate", "acquire"): ("The company acquired new office space.", "Компания приобрела новое офисное помещение."),
    ("Property & Real Estate", "appraise"): ("The property was appraised at market value.", "Недвижимость была оценена по рыночной стоимости."),
    ("Property & Real Estate", "deed"): ("The deed was transferred to the new owner.", "Право собственности было передано новому владельцу."),
    ("Property & Real Estate", "depreciate"): ("Commercial property may depreciate.", "Коммерческая недвижимость может дешеветь."),
    ("Property & Real Estate", "escrow"): ("Funds are held in escrow until closing.", "Средства хранятся на эскроу-счёте до закрытия сделки."),
    ("Property & Real Estate", "evict"): ("The landlord may evict for non-payment.", "Арендодатель может выселить за неуплату."),
    ("Property & Real Estate", "foreclosure"): ("Foreclosure proceedings began this month.", "В этом месяце начались процедуры обращения взыскания."),
    ("Property & Real Estate", "lease"): ("Sign a 2-year commercial lease.", "Подпишите двухлетний коммерческий договор аренды."),
    ("Property & Real Estate", "mortgage"): ("The business took out a mortgage.", "Компания взяла ипотеку."),
    ("Property & Real Estate", "property"): ("The company owns commercial property.", "Компания владеет коммерческой недвижимостью."),
    ("Property & Real Estate", "renovate"): ("The office was renovated last summer.", "Офис был отремонтирован прошлым летом."),
    ("Property & Real Estate", "rent"): ("Monthly office rent is $3,000.", "Ежемесячная аренда офиса составляет 3000 долларов."),
    ("Property & Real Estate", "tenant"): ("The tenant signed a five-year lease.", "Арендатор подписал договор аренды на пять лет."),
    ("Property & Real Estate", "zoning"): ("Check local zoning laws before building.", "Проверьте местные правила зонирования перед строительством."),

    # Restaurants
    ("Restaurants", "airline"): ("The airline provides in-flight meals.", "Авиакомпания обеспечивает питание на борту."),
    ("Restaurants", "appetizing"): ("The menu looks very appetizing.", "Меню выглядит очень аппетитно."),
    ("Restaurants", "aroma"): ("The aroma of fresh coffee fills the café.", "Аромат свежего кофе наполняет кафе."),
    ("Restaurants", "beverage"): ("Beverages are included in the lunch package.", "Напитки включены в пакет обеда."),
    ("Restaurants", "book"): ("Book a table for ten for Friday.", "Забронируйте столик на десять человек на пятницу."),
    ("Restaurants", "capacity"): ("The restaurant has a capacity of 80 guests.", "Ресторан вмещает 80 гостей."),
    ("Restaurants", "carryout"): ("Carryout orders account for 30% of sales.", "Заказы на вынос составляют 30% продаж."),
    ("Restaurants", "cashier"): ("Pay the cashier before leaving.", "Рассчитайтесь с кассиром перед уходом."),
    ("Restaurants", "cater"): ("We cater corporate lunches and dinners.", "Мы организуем корпоративные обеды и ужины."),
    ("Restaurants", "certificate"): ("Health certificate must be displayed.", "Санитарный сертификат должен быть выставлен на видном месте."),
    ("Restaurants", "charge"): ("A service charge of 15% was applied.", "Была применена плата за обслуживание 15%."),
    ("Restaurants", "chef"): ("The chef prepares fresh daily specials.", "Шеф-повар готовит свежие блюда дня."),
    ("Restaurants", "close"): ("The restaurant closes at 11 PM.", "Ресторан закрывается в 23:00."),
    ("Restaurants", "cuisine"): ("The menu features international cuisine.", "В меню представлена международная кухня."),
    ("Restaurants", "delicacy"): ("Local delicacies were served at the banquet.", "На банкете были поданы местные деликатесы."),
    ("Restaurants", "delicious"): ("The catered meal was absolutely delicious.", "Блюда кейтеринга были абсолютно восхитительны."),
    ("Restaurants", "dessert"): ("Dessert is included in the business lunch.", "Десерт включён в бизнес-ланч."),
    ("Restaurants", "dine"): ("Clients often dine in private rooms.", "Клиенты часто обедают в отдельных залах."),

    # Salaries
    ("Salaries", "commission"): ("The salesperson earns 5% commission.", "Продавец получает комиссию 5%."),
    ("Salaries", "earnings"): ("Annual earnings are reported in December.", "Годовой заработок сообщается в декабре."),
    ("Salaries", "gross"): ("Gross salary is before tax deductions.", "Зарплата брутто — до вычета налогов."),
    ("Salaries", "increment"): ("A salary increment was approved.", "Было одобрено повышение зарплаты."),
    ("Salaries", "net"): ("Net salary is transferred on the 1st.", "Зарплата нетто перечисляется 1-го числа."),
    ("Salaries", "pay"): ("Staff are paid on the last business day.", "Сотрудникам платят в последний рабочий день."),
    ("Salaries", "paycheck"): ("The paycheck was deposited automatically.", "Зарплата была автоматически зачислена."),
    ("Salaries", "payroll"): ("HR manages the monthly payroll.", "Отдел кадров управляет ежемесячной платёжной ведомостью."),
    ("Salaries", "raise"): ("Employees received a 5% pay raise.", "Сотрудники получили повышение зарплаты на 5%."),
    ("Salaries", "remuneration"): ("Total remuneration includes benefits.", "Общее вознаграждение включает льготы."),
    ("Salaries", "wage"): ("The minimum wage was recently increased.", "Минимальная заработная плата была недавно повышена."),
    ("Salaries", "withhold"): ("Taxes are withheld from each paycheck.", "Налоги удерживаются с каждой зарплаты."),
    ("Salaries", "exempt"): ("Salaried managers are exempt from overtime.", "Менеджеры на окладе освобождены от сверхурочной оплаты."),
    ("Salaries", "minimum wage"): ("All staff must receive at least minimum wage.", "Все сотрудники должны получать не менее минимальной зарплаты."),

    # Shipping
    ("Shipping", "address"): ("Verify the shipping address before dispatch.", "Проверьте адрес доставки перед отправкой."),
    ("Shipping", "arrive"): ("The shipment will arrive Thursday.", "Груз прибудет в четверг."),
    ("Shipping", "attention"): ("Mark the package: Attention Sales Dept.", "Пометьте посылку: Внимание Отдел продаж."),
    ("Shipping", "bill of lading"): ("Attach the bill of lading to the shipment.", "Приложите накладную к отправлению."),
    ("Shipping", "box"): ("Pack the items securely in the box.", "Надёжно упакуйте предметы в коробку."),
    ("Shipping", "carrier"): ("Choose a reliable freight carrier.", "Выберите надёжного транспортного перевозчика."),
    ("Shipping", "carton"): ("Each carton holds 24 units.", "Каждая коробка вмещает 24 единицы."),
    ("Shipping", "certificate"): ("A certificate of origin is required.", "Требуется сертификат происхождения."),
    ("Shipping", "classify"): ("Correctly classify goods for customs.", "Правильно классифицируйте товары для таможни."),
    ("Shipping", "consignee"): ("The consignee signs for the delivery.", "Грузополучатель расписывается при получении."),
    ("Shipping", "consignment"): ("The consignment cleared customs today.", "Партия товара прошла таможенную очистку сегодня."),
    ("Shipping", "container"): ("Load the goods into the container.", "Загрузите товары в контейнер."),
    ("Shipping", "courier"): ("A courier delivered the documents.", "Курьер доставил документы."),
    ("Shipping", "crate"): ("Fragile items are packed in wooden crates.", "Хрупкие предметы упакованы в деревянные ящики."),
    ("Shipping", "customs"): ("Goods were held at customs.", "Товары были задержаны на таможне."),
    ("Shipping", "deliver"): ("We deliver worldwide within 5 days.", "Мы доставляем по всему миру в течение 5 дней."),
    ("Shipping", "dispatcher"): ("The dispatcher tracked all outgoing shipments.", "Диспетчер отслеживал все исходящие отправления."),

    # Shopping
    ("Shopping", "browse"): ("Customers can browse the online catalog.", "Покупатели могут просматривать онлайн-каталог."),
    ("Shopping", "bulk"): ("Purchase in bulk for better pricing.", "Покупайте оптом для лучшей цены."),
    ("Shopping", "cart"): ("Add the items to your shopping cart.", "Добавьте товары в корзину."),
    ("Shopping", "cashier"): ("The cashier processed the payment quickly.", "Кассир быстро обработал платёж."),
    ("Shopping", "close out"): ("Close out sales reduced old inventory.", "Распродажа ликвидировала старые запасы."),
    ("Shopping", "coupon"): ("Use a coupon for 20% off.", "Используйте купон для скидки 20%."),
    ("Shopping", "exchange"): ("You may exchange the item within 30 days.", "Вы можете обменять товар в течение 30 дней."),
    ("Shopping", "item"): ("Every item is inspected before shipment.", "Каждый товар проверяется перед отправкой."),
    ("Shopping", "mark down"): ("Prices were marked down 30%.", "Цены были снижены на 30%."),
    ("Shopping", "merchant"): ("The merchant accepted all major cards.", "Торговец принимал все основные карты."),
    ("Shopping", "obtain"): ("Obtain a receipt for every purchase.", "Получайте чек за каждую покупку."),
    ("Shopping", "on sale"): ("All winter coats are on sale today.", "Все зимние пальто сегодня продаются со скидкой."),
    ("Shopping", "outlet"): ("The factory outlet offers lower prices.", "Фирменный магазин предлагает более низкие цены."),
    ("Shopping", "quantity"): ("Order the required quantity by Friday.", "Закажите необходимое количество до пятницы."),

    # Taxes
    ("Taxes", "assessment"): ("The tax assessment was sent by mail.", "Налоговая оценка была отправлена по почте."),
    ("Taxes", "bracket"): ("Higher income moves you into a new bracket.", "Более высокий доход переводит вас в новую налоговую категорию."),
    ("Taxes", "depend"): ("Tax owed depends on annual earnings.", "Сумма налога зависит от годового заработка."),
    ("Taxes", "depreciate"): ("Office equipment depreciates over 5 years.", "Офисное оборудование амортизируется за 5 лет."),
    ("Taxes", "discretionary"): ("Discretionary spending must be justified.", "Дискреционные расходы должны быть обоснованы."),
    ("Taxes", "e-file"): ("Most companies e-file their tax returns.", "Большинство компаний подают налоговые декларации в электронном виде."),
    ("Taxes", "exempt"): ("Non-profit organizations are tax exempt.", "Некоммерческие организации освобождены от налогов."),
    ("Taxes", "exemption"): ("Claim all eligible tax exemptions.", "Заявите все применимые налоговые льготы."),
    ("Taxes", "filer"): ("Each filer must submit receipts.", "Каждый налогоплательщик должен предоставить квитанции."),
    ("Taxes", "filing"): ("The tax filing deadline is in April.", "Срок подачи налоговой декларации — в апреле."),
    ("Taxes", "government"): ("Government taxes fund public services.", "Государственные налоги финансируют общественные услуги."),

    # Transportation
    ("Transportation", "aisle"): ("The aisle seat is preferred for quick exits.", "Место у прохода предпочтительнее для быстрого выхода."),
    ("Transportation", "arrival"): ("Check the arrival board for updates.", "Проверьте табло прибытия для получения информации."),
    ("Transportation", "arrive"): ("The train will arrive at platform 3.", "Поезд прибудет на платформу 3."),
    ("Transportation", "assemble"): ("Passengers should assemble at gate 12.", "Пассажиры должны собраться у выхода 12."),
    ("Transportation", "assembly"): ("The assembly point is near the main entrance.", "Место сбора находится у главного входа."),
    ("Transportation", "baggage"): ("Baggage claim is on the lower level.", "Выдача багажа находится на нижнем уровне."),
    ("Transportation", "board"): ("Passengers may board starting at 6:30 AM.", "Посадка начинается в 6:30."),
    ("Transportation", "boarding"): ("Boarding closes 15 minutes before departure.", "Посадка заканчивается за 15 минут до отправления."),
    ("Transportation", "book"): ("Book your train ticket in advance.", "Заранее купите железнодорожный билет."),
    ("Transportation", "cancel"): ("The flight was cancelled due to weather.", "Рейс был отменён из-за погоды."),
    ("Transportation", "carrier"): ("The carrier confirmed the booking.", "Перевозчик подтвердил бронирование."),
    ("Transportation", "carry"): ("Carry-on bags must fit in the overhead bin.", "Ручная кладь должна помещаться в верхний отсек."),
    ("Transportation", "circulate"): ("Buses circulate every 15 minutes.", "Автобусы курсируют каждые 15 минут."),
    ("Transportation", "commute"): ("Employees commute by train daily.", "Сотрудники ежедневно добираются на работу поездом."),
    ("Transportation", "commuter"): ("The commuter line runs every 20 minutes.", "Пригородная линия ходит каждые 20 минут."),
    ("Transportation", "confirm"): ("Confirm your travel arrangements early.", "Подтвердите дорожные договорённости заблаговременно."),
    ("Transportation", "congestion"): ("Peak-hour congestion delays deliveries.", "Заторы в часы пик задерживают доставку."),

    # Travel
    ("Travel", "airfare"): ("Airfare was reimbursed by the company.", "Стоимость авиабилета была возмещена компанией."),
    ("Travel", "allergy"): ("Inform the hotel of any food allergy.", "Сообщите отелю об аллергии на продукты питания."),
    ("Travel", "altitude"): ("High altitude affects some travellers.", "Большая высота влияет на некоторых путешественников."),
    ("Travel", "area"): ("The hotel is in the business area.", "Отель находится в деловом районе."),
    ("Travel", "arrival"): ("Arrival time is listed on the itinerary.", "Время прибытия указано в маршруте."),
    ("Travel", "arrive"): ("We arrive in Tokyo at 8 AM.", "Мы прилетаем в Токио в 8 утра."),
    ("Travel", "baggage"): ("Baggage allowance is 23 kg per person.", "Норма провоза багажа — 23 кг на человека."),
    ("Travel", "book"): ("Book your business trip two weeks ahead.", "Забронируйте деловую поездку за две недели."),
    ("Travel", "border"): ("Cross the border with valid documents.", "Пересекайте границу с действительными документами."),
    ("Travel", "boarding pass"): ("Present your boarding pass at the gate.", "Предъявите посадочный талон у выхода."),
    ("Travel", "carrier"): ("Choose a carrier with flexible refund policy.", "Выберите перевозчика с гибкой политикой возврата."),
    ("Travel", "certificate"): ("A health certificate may be required.", "Может потребоваться медицинская справка."),
    ("Travel", "comfort"): ("Business class offers greater comfort.", "Бизнес-класс обеспечивает больший комфорт."),
    ("Travel", "confirm"): ("Confirm your hotel booking 48 hours ahead.", "Подтвердите бронирование отеля за 48 часов."),
    ("Travel", "confirmation"): ("Keep the confirmation email for check-in.", "Сохраните письмо с подтверждением для регистрации."),

    # Warranties
    ("Warranties", "warranty"): ("The product comes with a one-year warranty.", "Продукт поставляется с однолетней гарантией."),
    ("Warranties", "guarantee"): ("We guarantee full satisfaction or refund.", "Мы гарантируем полное удовлетворение или возврат денег."),
    ("Warranties", "expire"): ("The warranty expires after 24 months.", "Гарантия истекает через 24 месяца."),
    ("Warranties", "valid"): ("The warranty is valid from date of purchase.", "Гарантия действительна с даты покупки."),
    ("Warranties", "replace"): ("We will replace any defective item.", "Мы заменим любой дефектный товар."),
    ("Warranties", "repair"): ("Repairs are covered under the warranty.", "Ремонт покрывается гарантией."),
    ("Warranties", "extend"): ("Extend the warranty for two more years.", "Продлите гарантию ещё на два года."),
    ("Warranties", "malfunction"): ("Report any malfunction to our service desk.", "Сообщите о любой неисправности на наш сервисный стол."),
    ("Warranties", "duration"): ("Warranty duration depends on the product type.", "Срок гарантии зависит от типа продукта."),
    ("Warranties", "condition"): ("Terms and conditions apply to this warranty.", "На данную гарантию распространяются условия."),
    ("Warranties", "exclude"): ("Water damage is excluded from the warranty.", "Повреждения водой исключены из гарантии."),
    ("Warranties", "include"): ("Labor costs are included in the warranty.", "Трудозатраты включены в гарантию."),
    ("Warranties", "renew"): ("Renew the service warranty annually.", "Ежегодно продлевайте сервисную гарантию."),
    ("Warranties", "automatic"): ("The device has automatic warranty registration.", "Устройство имеет автоматическую регистрацию гарантии."),
}

with open('words_optimized.json') as f:
    data = json.load(f)

updated = 0
not_found = []
for word in data:
    key = (word['category'], word['eng'])
    if key in EXAMPLES:
        if not word.get('exampleEng') or not word.get('exampleRus'):
            word['exampleEng'] = EXAMPLES[key][0]
            word['exampleRus'] = EXAMPLES[key][1]
            updated += 1

print(f"Updated: {updated}")

missing_after = [(w['category'], w['eng']) for w in data if not w.get('exampleEng') or not w.get('exampleRus')]
if missing_after:
    print(f"Still missing ({len(missing_after)}):")
    for c, e in missing_after:
        print(f"  ({repr(c)}, {repr(e)})")
else:
    print("All words have examples!")

with open('words_optimized.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Done.")
