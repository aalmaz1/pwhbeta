#!/usr/bin/env python3
"""Add the second batch of missing TOEIC business English examples."""

import json

EXAMPLES2 = {
    # Office Technology
    ("Office Technology", "mouse"): ("Use the mouse to navigate the screen.", "Используйте мышь для навигации по экрану."),
    ("Office Technology", "operating system"): ("Upgrade the operating system this quarter.", "Обновите операционную систему в этом квартале."),
    ("Office Technology", "reboot"): ("Reboot the server after the update.", "Перезагрузите сервер после обновления."),
    ("Office Technology", "screen"): ("The screen resolution was adjusted.", "Разрешение экрана было настроено."),
    ("Office Technology", "scroll"): ("Scroll down to view the full report.", "Прокрутите вниз, чтобы просмотреть полный отчёт."),
    ("Office Technology", "spam"): ("Filter spam to protect the inbox.", "Фильтруйте спам для защиты входящих."),
    ("Office Technology", "spreadsheet"): ("Enter budget data into the spreadsheet.", "Введите данные бюджета в таблицу."),

    # Office Procedures
    ("Office Procedures", "arrange"): ("Arrange a meeting with all department heads.", "Организуйте встречу со всеми руководителями отделов."),
    ("Office Procedures", "binder"): ("Keep all contracts in the binder.", "Храните все контракты в папке."),
    ("Office Procedures", "brief"): ("The manager briefed the team on the project.", "Менеджер проинформировал команду о проекте."),
    ("Office Procedures", "calendar"): ("Check the calendar before scheduling.", "Проверьте календарь перед планированием встречи."),
    ("Office Procedures", "collate"): ("Collate all reports before the meeting.", "Соберите все отчёты перед совещанием."),
    ("Office Procedures", "deliver"): ("Deliver the report to the director today.", "Передайте отчёт директору сегодня."),
    ("Office Procedures", "duplicate"): ("Duplicate the form for each employee.", "Продублируйте форму для каждого сотрудника."),
    ("Office Procedures", "enter"): ("Enter all data into the system accurately.", "Точно введите все данные в систему."),
    ("Office Procedures", "filing"): ("Proper filing keeps records accessible.", "Правильная документация обеспечивает доступность записей."),
    ("Office Procedures", "inbox"): ("Check your inbox for the updated agenda.", "Проверьте входящие для получения обновлённой повестки."),
    ("Office Procedures", "input"): ("Input the client data into the database.", "Введите данные клиента в базу данных."),
    ("Office Procedures", "list"): ("Create a task list for the week.", "Составьте список задач на неделю."),
    ("Office Procedures", "memorandum"): ("A memorandum was sent to all staff.", "Всем сотрудникам был направлен меморандум."),

    # Electronics
    ("Electronics", "automatic"): ("The door has an automatic locking system.", "Дверь оснащена автоматической системой блокировки."),
    ("Electronics", "camera"): ("Install a security camera at the entrance.", "Установите камеру видеонаблюдения у входа."),
    ("Electronics", "chip"): ("A microchip controls the device functions.", "Микросхема управляет функциями устройства."),
    ("Electronics", "disk"): ("Store backups on an external disk.", "Храните резервные копии на внешнем диске."),
    ("Electronics", "drive"): ("The hard drive stores all company data.", "На жёстком диске хранятся все данные компании."),
    ("Electronics", "electronic"): ("Electronic payments are now standard.", "Электронные платежи сейчас являются стандартом."),
    ("Electronics", "input"): ("Connect the input device to the system.", "Подключите устройство ввода к системе."),
    ("Electronics", "insert"): ("Insert the card into the reader.", "Вставьте карту в считыватель."),
    ("Electronics", "instruction"): ("Read the instruction manual carefully.", "Внимательно прочитайте инструкцию по эксплуатации."),
    ("Electronics", "key"): ("Press the function key to activate.", "Нажмите функциональную клавишу для активации."),
    ("Electronics", "keypad"): ("Enter the code on the keypad.", "Введите код на клавиатуре."),
    ("Electronics", "lens"): ("Clean the camera lens before the demo.", "Протрите объектив камеры перед презентацией."),

    # Hiring
    ("Hiring", "apply"): ("Apply online for the management position.", "Подайте заявку онлайн на должность менеджера."),
    ("Hiring", "cover letter"): ("A strong cover letter sets you apart.", "Хорошее сопроводительное письмо выделяет вас."),
    ("Hiring", "employer"): ("The employer offers excellent benefits.", "Работодатель предлагает отличные льготы."),
    ("Hiring", "job"): ("The job requires 5 years of experience.", "Работа требует 5 лет опыта."),

    # Inventory
    ("Inventory", "dispatch"): ("Dispatch goods from the warehouse daily.", "Ежедневно отправляйте товары со склада."),
    ("Inventory", "excess"): ("Excess inventory was discounted and sold.", "Излишки запасов были уценены и проданы."),

    # Banking
    ("Banking", "bank"): ("The company banks with a major institution.", "Компания обслуживается в крупном банке."),
    ("Banking", "bankruptcy"): ("The firm filed for bankruptcy protection.", "Компания подала заявление о банкротстве."),
    ("Banking", "commit"): ("We commit to repaying the loan on time.", "Мы обязуемся погасить кредит своевременно."),
    ("Banking", "compensate"): ("The bank will compensate for the error.", "Банк компенсирует допущенную ошибку."),
    ("Banking", "currency"): ("Convert currency before the business trip.", "Обменяйте валюту перед деловой поездкой."),
    ("Banking", "debit"): ("The fee was debited from the account.", "Комиссия была списана со счёта."),
    ("Banking", "debt"): ("The company reduced its debt this year.", "Компания сократила долг в этом году."),

    # Accounting
    ("Accounting", "accrue"): ("Interest accrues monthly on overdue accounts.", "Проценты начисляются ежемесячно на просроченные счета."),
    ("Accounting", "accumulate"): ("Costs accumulated over the fiscal year.", "Затраты накапливались в течение финансового года."),
    ("Accounting", "allocation"): ("Budget allocation was revised quarterly.", "Распределение бюджета пересматривалось ежеквартально."),
    ("Accounting", "allowance"): ("A travel allowance is provided to staff.", "Сотрудникам предоставляется командировочное пособие."),
    ("Accounting", "amortize"): ("Intangible assets are amortized over time.", "Нематериальные активы амортизируются со временем."),
    ("Accounting", "assessment"): ("A financial assessment was conducted.", "Была проведена финансовая оценка."),
    ("Accounting", "bankruptcy"): ("Bankruptcy proceedings affect all creditors.", "Процедура банкротства затрагивает всех кредиторов."),
    ("Accounting", "certificate"): ("Obtain a tax certificate from authorities.", "Получите налоговый сертификат в государственных органах."),
    ("Accounting", "classify"): ("Classify all expenses by department.", "Классифицируйте все расходы по отделам."),
    ("Accounting", "compound"): ("Compound interest grows the investment.", "Сложные проценты увеличивают инвестиции."),

    # Investments
    ("Investments", "certificate"): ("Purchase a certificate of deposit.", "Купите депозитный сертификат."),
    ("Investments", "commission"): ("The broker charges a 2% commission.", "Брокер взимает комиссию в размере 2%."),
    ("Investments", "compound"): ("Compound returns accelerate wealth growth.", "Сложный доход ускоряет рост богатства."),
    ("Investments", "convertible"): ("Convertible bonds can become company stock.", "Конвертируемые облигации можно обменять на акции."),
    ("Investments", "decline"): ("Share prices declined after the report.", "Цены акций снизились после отчёта."),
    ("Investments", "deferred"): ("Deferred tax liabilities were disclosed.", "Отложенные налоговые обязательства были раскрыты."),
    ("Investments", "depreciate"): ("The asset value may depreciate rapidly.", "Стоимость актива может быстро обесцениться."),
    ("Investments", "dollar"): ("The dollar strengthened against major currencies.", "Доллар укрепился относительно основных валют."),
    ("Investments", "downturn"): ("A market downturn affected all portfolios.", "Спад на рынке затронул все портфели."),
    ("Investments", "fluctuate"): ("Currency values fluctuate daily.", "Курсы валют колеблются ежедневно."),

    # Financial Statements
    ("Financial Statements", "accrue"): ("Revenue accrues when services are delivered.", "Выручка начисляется при оказании услуг."),
    ("Financial Statements", "accumulate"): ("Retained earnings accumulate over fiscal years.", "Нераспределённая прибыль накапливается в течение финансовых лет."),
    ("Financial Statements", "adjustment"): ("Year-end adjustment improved the balance sheet.", "Корректировка на конец года улучшила баланс."),
    ("Financial Statements", "amortize"): ("Goodwill is amortized over several years.", "Деловая репутация амортизируется в течение нескольких лет."),
    ("Financial Statements", "annual"): ("The annual report is due in March.", "Годовой отчёт должен быть готов в марте."),
    ("Financial Statements", "appreciate"): ("The asset appreciated significantly last year.", "Актив значительно вырос в цене в прошлом году."),
    ("Financial Statements", "bankruptcy"): ("Bankruptcy was declared after losses mounted.", "Банкротство было объявлено после накопившихся убытков."),
    ("Financial Statements", "cash flow"): ("Positive cash flow ensures business stability.", "Положительный денежный поток обеспечивает стабильность бизнеса."),
    ("Financial Statements", "certificate"): ("The auditor issued a clean certificate.", "Аудитор выдал чистое заключение."),
    ("Financial Statements", "classify"): ("Classify each item on the balance sheet.", "Классифицируйте каждую статью в балансе."),
    ("Financial Statements", "consolidate"): ("Consolidate all subsidiary results.", "Консолидируйте результаты всех дочерних компаний."),

    # Property & Real Estate
    ("Property & Real Estate", "adjacent"): ("The adjacent lot is available for purchase.", "Соседний участок доступен для покупки."),
    ("Property & Real Estate", "amenity"): ("The building offers premium amenities.", "Здание предлагает премиальные удобства."),
    ("Property & Real Estate", "appraisal"): ("Get an appraisal before signing the deal.", "Получите оценку перед подписанием сделки."),
    ("Property & Real Estate", "appropriate"): ("The space is appropriate for a head office.", "Помещение подходит для главного офиса."),
    ("Property & Real Estate", "broker"): ("Our real estate broker found the space.", "Наш риэлтор нашёл это помещение."),
    ("Property & Real Estate", "condition"): ("The building is in excellent condition.", "Здание находится в отличном состоянии."),
    ("Property & Real Estate", "construction"): ("Construction of the new office begins soon.", "Строительство нового офиса начинается скоро."),
    ("Property & Real Estate", "contractor"): ("A contractor was hired for the renovation.", "Для ремонта был нанят подрядчик."),
    ("Property & Real Estate", "dwelling"): ("The dwelling was converted to office space.", "Жилище было переоборудовано в офисное помещение."),
    ("Property & Real Estate", "estate"): ("The estate includes a warehouse facility.", "Объект недвижимости включает складское помещение."),
    ("Property & Real Estate", "eviction"): ("Eviction proceedings began for non-payment.", "Процедура выселения была начата за неуплату."),
    ("Property & Real Estate", "finance"): ("Secure finance before making an offer.", "Обеспечьте финансирование перед подачей предложения."),
    ("Property & Real Estate", "furnish"): ("The office was furnished with new desks.", "Офис был обставлен новыми столами."),

    # Insurance
    ("Insurance", "actuary"): ("The actuary calculated the risk premium.", "Актуарий рассчитал страховую премию за риск."),
    ("Insurance", "adjuster"): ("The adjuster assessed the claim value.", "Аварийный комиссар оценил размер претензии."),
    ("Insurance", "adverse"): ("Adverse weather led to many claims.", "Неблагоприятная погода привела к многочисленным претензиям."),
    ("Insurance", "appraisal"): ("An appraisal determined the property value.", "Оценка определила стоимость имущества."),
    ("Insurance", "broker"): ("An insurance broker compared all plans.", "Страховой брокер сравнил все планы."),
    ("Insurance", "cancel"): ("You may cancel the policy with 30 days notice.", "Вы можете отменить полис с уведомлением за 30 дней."),
    ("Insurance", "carrier"): ("The insurance carrier processed the claim.", "Страховая компания обработала претензию."),
    ("Insurance", "damage"): ("Damage to equipment was fully covered.", "Ущерб оборудованию был полностью покрыт."),
    ("Insurance", "detriment"): ("The incident caused detriment to business.", "Инцидент нанёс ущерб бизнесу."),
    ("Insurance", "disability"): ("Disability insurance covers lost income.", "Страхование по нетрудоспособности покрывает потерю дохода."),
}

with open('words_optimized.json') as f:
    data = json.load(f)

updated = 0
for word in data:
    key = (word['category'], word['eng'])
    if key in EXAMPLES2:
        if not word.get('exampleEng') or not word.get('exampleRus'):
            word['exampleEng'] = EXAMPLES2[key][0]
            word['exampleRus'] = EXAMPLES2[key][1]
            updated += 1

print(f"Updated: {updated}")

missing_after = [(w['category'], w['eng']) for w in data if not w.get('exampleEng') or not w.get('exampleRus')]
if missing_after:
    print(f"Still missing ({len(missing_after)}):")
    for c, e in missing_after:
        print(f"  ({repr(c)}, {repr(e)})")
else:
    print("ALL 600 words now have examples!")

with open('words_optimized.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Done.")
