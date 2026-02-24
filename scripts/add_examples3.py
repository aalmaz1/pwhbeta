#!/usr/bin/env python3
"""Add the third batch of missing TOEIC business English examples."""

import json

EXAMPLES3 = {
    # Contracts
    ("Contracts", "party"): ("Both parties signed the agreement.", "Обе стороны подписали соглашение."),
    ("Contracts", "breach"): ("The supplier was in breach of contract.", "Поставщик нарушил условия контракта."),
    ("Contracts", "nullify"): ("The court nullified the invalid clause.", "Суд аннулировал недействительную оговорку."),
    ("Contracts", "term"): ("Review all terms before signing.", "Ознакомьтесь со всеми условиями перед подписанием."),
    ("Contracts", "binding"): ("The agreement is binding on both parties.", "Соглашение обязательно для обеих сторон."),
    ("Contracts", "explicit"): ("The contract includes explicit payment terms.", "Контракт содержит чёткие условия оплаты."),

    # Marketing
    ("Marketing", "estimate"): ("Request a marketing cost estimate.", "Запросите смету на маркетинговые расходы."),
    ("Marketing", "solicitation"): ("Email solicitation increased lead generation.", "Рассылка по электронной почте увеличила привлечение клиентов."),

    # Business Planning
    ("Business Planning", "alternative"): ("Consider an alternative business approach.", "Рассмотрите альтернативный деловой подход."),
    ("Business Planning", "brief"): ("The director briefed the board on strategy.", "Директор проинформировал совет о стратегии."),
    ("Business Planning", "clarify"): ("Please clarify the project objectives.", "Пожалуйста, уточните цели проекта."),
    ("Business Planning", "cooperation"): ("Cross-team cooperation improved results.", "Межкомандное сотрудничество улучшило результаты."),
    ("Business Planning", "participant"): ("All participants reviewed the plan.", "Все участники ознакомились с планом."),
    ("Business Planning", "priority"): ("Set priorities for the next quarter.", "Установите приоритеты на следующий квартал."),
    ("Business Planning", "recommendation"): ("The consultant's recommendation was accepted.", "Рекомендация консультанта была принята."),
    ("Business Planning", "approach"): ("A flexible approach was taken.", "Был применён гибкий подход."),
    ("Business Planning", "assessment"): ("A risk assessment was completed.", "Оценка рисков была завершена."),

    # Conferences
    ("Conferences", "attendance"): ("Attendance at the conference was high.", "Посещаемость конференции была высокой."),
    ("Conferences", "award"): ("The award was presented at the gala.", "Награда была вручена на торжественном ужине."),
    ("Conferences", "banquet"): ("A banquet followed the closing ceremony.", "После церемонии закрытия состоялся банкет."),
    ("Conferences", "book"): ("Book your conference seat in advance.", "Заранее забронируйте место на конференции."),
    ("Conferences", "capacity"): ("The venue has a capacity of 300 people.", "Зал вмещает 300 человек."),
    ("Conferences", "conclude"): ("The summit concluded with an agreement.", "Саммит завершился подписанием соглашения."),
    ("Conferences", "discussion"): ("A panel discussion followed the keynote.", "После основного доклада состоялась дискуссия."),
    ("Conferences", "display"): ("Companies display products in the exhibit hall.", "Компании демонстрируют продукты в выставочном зале."),
    ("Conferences", "distribute"): ("Distribute materials to all attendees.", "Раздайте материалы всем участникам."),
    ("Conferences", "enroll"): ("Enroll early to secure your spot.", "Зарегистрируйтесь заранее, чтобы занять место."),
    ("Conferences", "fair"): ("The trade fair attracted 200 exhibitors.", "На выставке присутствовали 200 экспонентов."),
    ("Conferences", "host"): ("Tokyo will host the annual conference.", "Токио примет ежегодную конференцию."),
    ("Conferences", "name tag"): ("Wear your name tag during the event.", "Носите именной бейдж во время мероприятия."),

    # Computers
    ("Computers", "capacity"): ("Increase storage capacity for the database.", "Увеличьте ёмкость хранилища для базы данных."),
    ("Computers", "component"): ("Replace the faulty hardware component.", "Замените неисправный аппаратный компонент."),
    ("Computers", "cursor"): ("Move the cursor to select the field.", "Переместите курсор, чтобы выбрать поле."),
    ("Computers", "delete"): ("Delete old files to free up storage.", "Удалите старые файлы, чтобы освободить место."),
    ("Computers", "desktop"): ("Access all files from the desktop.", "Получайте доступ ко всем файлам с рабочего стола."),
    ("Computers", "folder"): ("Save reports in the shared folder.", "Сохраняйте отчёты в общей папке."),
    ("Computers", "hard copy"): ("Print a hard copy for the records.", "Распечатайте бумажную копию для архива."),
    ("Computers", "icon"): ("Double-click the icon to open.", "Дважды щёлкните значок для открытия."),
    ("Computers", "keyboard"): ("A wireless keyboard was issued to staff.", "Сотрудникам выдали беспроводную клавиатуру."),
    ("Computers", "laptop"): ("Each manager received a company laptop.", "Каждый менеджер получил корпоративный ноутбук."),

    # Office Technology
    ("Office Technology", "log on"): ("Log on to the system with your credentials.", "Войдите в систему с вашими учётными данными."),
    ("Office Technology", "memory"): ("Upgrade the memory for faster performance.", "Увеличьте объём памяти для повышения производительности."),
}

with open('words_optimized.json') as f:
    data = json.load(f)

updated = 0
for word in data:
    key = (word['category'], word['eng'])
    if key in EXAMPLES3:
        if not word.get('exampleEng') or not word.get('exampleRus'):
            word['exampleEng'] = EXAMPLES3[key][0]
            word['exampleRus'] = EXAMPLES3[key][1]
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
