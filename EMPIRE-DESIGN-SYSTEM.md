# Empire Design System 2.0 — правила и инструкция

Рабочая инструкция для любой UI-работы в этом проекте. Текст ниже следует пяти документам системы: «Загальний опис», «Variables documentation», «Primitives», «Components» и «Design system 2.0». Система внедрена и используется в продакшне.

- Figma: [Empire design system (bootstrap)](https://www.figma.com/design/X1zmjtoFusntm0yJrB2nyW/Empire-design-system--bootstrap-)
- Notebook: [Дизайн-система Empire 2.0](https://notebook.google.com/notebook/23ea4dac-bbf5-434f-be2d-b3f9160b11f7)

## Контекст

Система сделана по опыту предыдущей, построенной на Bootstrap. Готовый внешний вид Bootstrap и Material не используется: он не давал нужной гибкости для сложной продуктовой логики и большого числа UX-сценариев. Визуальный источник — макеты Empire в Figma. В коде библиотека компонентов стоит на Bootstrap 3.4.1: вёрстка собирается его классами и классами дизайн-системы, без второй UI-библиотеки.

Принципы:

- Разделение ответственности: каждый аспект дизайна управляется отдельно.
- Переиспользование: примитивы и компоненты применяются в разных сценариях.
- Предсказуемость: изменение локально и не даёт побочных эффектов.
- Масштабируемость: система расширяется без усложнения структуры.

## Архитектура

Цепочка одна: **Variables → Primitives → Components**. Уровень не пропускать. Компонент собирается только из примитивов, примитив — только из переменных. Интерфейс не собирается с нуля и не из сырых значений.

| Уровень | Роль | Правило |
|---|---|---|
| Variables | Единый источник истины: цвет, размер, отступ | Базовые цвета лежат в коллекции `Colors` и никогда не используются напрямую в UI, компонентах и макетах |
| Primitives | Базовые интерактивные элементы: кнопки, инпуты, чекбоксы, радио, табы | Классические мультикомпоненты Figma. Все визуальные свойства идут из переменных |
| Components | Функциональные узлы для продуктовых задач | Только из примитивов. Инкапсулируют структуру, поведение и настройки |

Иконки — отдельная мультикомпонентная система. Отступы — переменные шкалы X и её кратные.

### Когда примитив становится компонентом

Элемент уходит из примитивов в компоненты, если выполняется хотя бы одно:

- он нужен в 1–2 сценариях;
- у него сложная внутренняя логика;
- это более высокий уровень абстракции.

Примеры компонентов из документов: модальное окно превью документов, зона загрузки. Внутри них лежат layout-примитивы, кнопки и инпуты.

### Глобальный или локальный компонент

Глобальный (системный) — часть дизайн-системы, используется по всему продукту. Его создают, когда паттерн часто повторяется, поведение стабильно, а изменение должно примениться везде. У него есть параметры адаптации: сайдбар, скрытие блоков, смена макета. Это делается свойствами компонента, не новой копией.

Локальный (feature-specific) привязан к разделу или конкретной бизнес-логике и не имеет ценности вне своего контекста. Он создаётся и хранится в файле этого раздела. В общую библиотеку Empire он не публикуется.

Решение коротко: системный — переиспользуемый, стабильный, межфункциональный; локальный — контекстный, ограниченный, конкретной фичи. Если один и тот же блок нужен в нескольких разделах, это кандидат в системный компонент, а не копия между файлами.

Продуктовые шапки в библиотеке: Expedite, Big Trucks, Sierra, Brokerage. Общие токены и примитивы одни. Отличия продуктов живут в шапке и в локальных блоках, не в отдельных копиях контролов.

## Variables

### Базовая палитра

Фундамент всех визуальных решений. Каждый цвет — тональная шкала от 0 до 120, от самого светлого к самому тёмному. Коллекция `Colors`: White, Black, Blue, Red, Green, Purple, Orange, Yellow, Alpha white, Alpha black, Shadow, BG/Light mode.

Базовые цвета никогда не красят UI, компонент или макет. В интерфейсе работает только семантический слой.

### Семантические переменные (Library)

Слой поверх палитры. Имя описывает функцию, не оттенок:

`примитив / свойство / состояние`

- Примитив: `button`, `input`, `stepper` и другие контролы.
- Свойство: `fill`, `border`, `text`, `icon`, `background`.
- Состояние: `default`, `hover`, `active`, `disabled`, `error`.

Примеры: `button / border / default`, `button / border / hover`, `stepper / text / active`.

У каждой переменной два режима: Light и Dark. Тема меняется переключением режима, не вторым набором экранов и не отдельными hex.

### Шкала X

Единая шкала пространств и размеров. База X = 2px.

| Токен | px | Токен | px |
|---|---|---|---|
| x | 2 | x12 | 24 |
| x2 | 4 | x16 | 32 |
| x3 | 6 | x20 | 40 |
| x4 | 8 | x22 | 44 |
| x5 | 10 | x24 | 48 |
| x6 | 12 | x28 | 56 |
| x7 | 14 | x32 | 64 |
| x8 | 16 | x40 | 80 |
| x10 | 20 | x48 | 96 |

Применение: border radius (например X3), отступ между элементами (например X4), margin (например X2), padding и размеры компонентов. Нестандартное значение допустимо только как исключение.

На странице Spacing в Figma дополнительно лежат x64 (128) и x80 (160). В письменной шкале документов их нет; без явной причины их не вводить.

## Primitives

Базовые интерактивные элементы: чекбоксы, радиокнопки, инпуты, кнопки и прочие контролы. Все собраны как мультикомпоненты Figma. Цвет, бордер, отступ и типографика полностью управляются переменными. Переходы между состояниями запрототипированы заранее.

Состояния: Enabled, Hover, Disabled, Error, Checked / Selected, Not selected, Indeterminate.

Настройки через общие параметры:

- Type — например checkbox или radio button;
- Status — selected, not selected, indeterminate;
- State — enabled, hover, disabled, error;
- показ лейбла и вспомогательного текста.

Каждая группа примитивов есть в Light и в Dark, чтобы проверять переменные и тему.

Кнопка `Button/Button` в файле Figma:

- Type: Primary, Secondary, Outline, Link, Additional, Alarm
- State: Default, Hover, Pressed, Disabled, Loading
- Size: Large 44px, Medium 32px

Отдельными наборами: icon-кнопки, plus/minus, chevron, action menu button, in-progress button.

Таб из ссылки на библиотеку: `Tab=Medium, State=Activated`, 150×32, иконка, подпись, счётчик. Рядом `Tabs component` и `Tab's items - counter`.

Иконки — мультикомпоненты с именами `icon outline/…` и `Icon fill/…`, плюс наборы навбара и action menu. Новую иконку не рисовать, если подходящая уже есть.

Состав страницы Primitives в Figma: анимации, кнопки, инпуты, чекбоксы и радио, тогглы, info box, скролл, табы, иконки файлов, upload area, видео и зум, пагинация, date picker и time picker, статусы, chips-tags, тултипы, action, аватары, аккордеон. Сложные из этого списка (upload, превью файла) по правилу документов — уже компоненты, если у них узкий сценарий или своя логика.

## Components

Следующий уровень абстракции. Компонент объединяет примитивы в узел, который решает продуктовую задачу, и не собирается заново на каждом экране.

В библиотеке Figma:

- File preview: Image, PDF, Video, Audio, Empty; правая панель Inputs, Info items или Hidden.
- Header: Expedite, Big Trucks, Sierra, Brokerage.
- Modal windows: Wide 1280, Medium 720, Small 480. Header, body-слот, scroll, панель кнопок.
- Таблица внутри модалки, уведомления, примеры документов.

Страница Charts — черновик со ссылкой на Chart.js. Это не компонент системы.

## Типографика

Noto Sans. Стиль выбирается по месту в интерфейсе:

- Headlines: H1 SemiBold 32/40 (`size: x16`, `line: x20`)
- Tables: Heading SemiBold 16/24; Clickable text; Clickable Bold text
- Buttons: Large, Regular
- Inputs: Title, Help text, Placeholder, Text, Text small, Pulldown, Chip’s text
- Tabs: Active и Inactive. Active medium — Medium 16/24
- Pop-up: Text, Text2

Начертания системы: Medium 500, SemiBold 600, Bold 700. Тень берётся из стиля системы, не рисуется заново.

## Технические требования к вёрстке

Это требования к фронтенду редизайна CRM. Формат работы — заказчик и исполнитель: приоритет у качества вёрстки и точного следования спецификации.

На каждую задачу даются макет в Figma с Dev Mode, библиотека компонентов и описание логики и состояний там, где оно нужно.

| | |
|---|---|
| Design | Макет задачи в Figma. Для Brokerage — файл Brokerage |
| Components | [Empire design system (bootstrap)](https://www.figma.com/design/X1zmjtoFusntm0yJrB2nyW/Empire-design-system--bootstrap-) |
| Stack | Bootstrap 3.4.1, HTML5, CSS3, Vanilla JS |
| Styles | Только существующие классы дизайн-системы. `<style>` и инлайн-стили запрещены |
| Grid | Стандартная сетка Bootstrap, 12 колонок |
| Components | Паттерны Bootstrap 3 и 4: Navbar, Nav, Tabs, Breadcrumb, Modals, Dropdowns, Accordions, Carousels, Forms (`input-group`, `form-control`, валидация) |
| Layout и CSS | Flexbox. Семантический HTML5. Медиазапросы `xs` / `sm` / `md` / `lg` / `xl`. Мобильная адаптивность |
| JavaScript | Базовый JavaScript. jQuery — для плагинов Bootstrap |
| Environment | PhpStorm / WebStorm |

Правила результата:

1. Pixel perfect. Отступы, шрифты, цвета и размеры строго по спецификации Figma.
2. Дублирующие стили запрещены. Экран собирается из готовых классов дизайн-системы. Свой CSS — только исключение и только после согласования.
3. Код чистый, адаптивный и готовый к интеграции без замечаний к структуре.
4. Цвет, отступ и размер в классах соответствуют семантическим переменным и шкале X. Новый класс не вводится, чтобы покрасить элемент ступенью палитры или произвольным пикселем.

## Как применять

1. Искать существующий класс, токен, примитив или компонент. Новый элемент добавлять, только если в библиотеке нет подходящего и это согласовано.
2. Разметку писать на Bootstrap 3.4.1 и классах Empire. Не добавлять `<style>`, инлайн-стили и вторую UI-библиотеку.
3. Сетку держать в 12 колонках Bootstrap. Раскладку — на Flexbox. Брейкпоинты — `xs` / `sm` / `md` / `lg` / `xl`.
4. Цвет писать семантическим именем `примитив / свойство / состояние`. Hex и ступени `Colors/*` в UI не оставлять.
5. Отступ, радиус, margin, padding и размер брать из шкалы X. Значение вне шкалы — только исключение.
6. Light и Dark — режимы одних переменных.
7. У примитива закрывать запрототипированные состояния и оба режима. Интерактив Bootstrap (модалки, дропдауны, табы, аккордеоны, карусели) подключать плагинами Bootstrap через jQuery.
8. Экран собирать снизу вверх. Компонент не содержит сырых слоёв вместо примитивов.
9. Узкий или сложный элемент повышать до компонента. Повторяемый и стабильный — делать глобальным. Остальное оставлять в файле раздела.
10. Не дублировать кнопку, инпут, таб, модалку или хедер «почти как в системе».

## Инстансы: Design — мастер, страницы — копии

Страница Design (`index.html`) — мастер всех глобальных компонентов, как главный компонент в Figma. Экраны CRM используют те же классы и ведут себя как его инстансы. Правка класса в `css/empire.css` или поведения в `js/empire.js` меняет компонент сразу на Design и на всех экранах.

Правила:

- Блок, который есть на двух экранах, — глобальный компонент `emp-*`. Его стили лежат в `css/empire.css`, поведение — в `js/empire.js`, образец — на Design.
- CSS экрана (`css/warehouses.css`, `css/charges.css` и другие) содержит только раскладку: колонки таблицы, ширины полей формы, локальные блоки раздела. Цвет, шрифт, отступ, рамка и состояния глобального компонента в нём не переопределяются.
- JS экрана содержит только данные и логику раздела. Часы, Show, action menu и копирование в View подключаются атрибутами и работают из `js/empire.js`.
- Нетиповой вариант делается только по отдельному запросу. Он оформляется модификатором глобального компонента и показывается на Design.
- Иконки компонентов лежат по назначению: `icons/action-menu/` (view, edit, delete, copy), `icons/modal/` (info).

### Каталог глобальных компонентов CRM

| Компонент | Классы | Design | Figma |
|---|---|---|---|
| Экран | `body.emp-app`, `emp-app__main` | все экраны | — |
| Шапка страницы | `emp-head`, часы `data-emp-clock` (время Нью-Йорка) | `#page-header` | Header / Expedite |
| CRM-таблица | `emp-table`, `__bar`, `__filters`, `__rows`, `__row`, `__cell`, `__cell--center`, `__wrap`, `__muted`, `__link`, `__money`, `__unset`, `__ghost`, `__pages` | `#crm-table` | Table |
| Счётчик и Show | `emp-meta`, `emp-meta__rule`, `emp-show`, `emp-show__field`, `data-emp-show`, `data-emp-show-range` | `#crm-table` | Table |
| Action menu | `emp-amenu`, `__hit`, `__dots`, `__list`, `__item`, `__item--green`, `__item--red` | `#action-menu` | `1298:14776`, items `1105:19858` |
| Плашка статуса | `emp-pill--success`, `--alarm`, `--warning`, `--otr`, `--direct`, `--fill`; подпись `emp-hint` | `#pills` | Status pill / select-chips |
| Плюс и сортировка | `emp-plus`, `emp-sort`, `emp-sort--cell` | `#pills` | plus button, sort |
| Табы в боксе | `emp-tabs__list--boxed`, `emp-tab`, `emp-tab__count` | `#tabs` | Tabs component |
| Строки View | `emp-kv`, `emp-kv__row`, `emp-kv__label`, `emp-kv__value`, `emp-copy`, `emp-copy--title`, `data-copy-row` | `#view-rows` | View rows |
| Форма в модалке | `emp-form`, `emp-form__row` | `#modal` | MW body |
| Модальное окно | `emp-mw--sm/--md/--lg`, `--form`, `--fit`, `--confirm`, `emp-mw__icon`, `emp-mw__text`, `emp-mw__body.is-overflow` | `#modal` | `6040:23766` |
| Чипсы | `emp-chip`, тип `--outline`, размер `--sm` (16) / по умолчанию M (24) / `--lg` (32), цвет `--red` `--green` `--purple` `--orange` `--yellow` `--grey` (по умолчанию blue), состояния `is-hover` `is-active` (Pressed) `is-loading` `disabled`, `emp-chip__x`, `emp-chip__spin` | `#chips` | Chips-tags `929:12571` |
| Статус юнита | `emp-status` (L, пилюля 128), `--md` (круг 24, аббревиатура), `--sm` (точка 12); цвет `--available-on` `--available` `--local-use` `--emergency-use` `--hidden-oos` `--out-of-service` `--safety-oos` `--mechanical-oos` `--not-available` `--inactive` | `#statuses` | Statuses `911:14126` |
| Аватар | `emp-avatar`, `--sm` (24) / M (32) / `--lg` (40), второй цвет `--alt`, точка `emp-avatar__dot` | `#avatars` | Avatar `1061:52823` |
| Аккордеон | `emp-accordion` (набор в общей рамке), `emp-accordion__item`, `is-open`, `emp-accordion__panel` (контент, мин. 48), `emp-accordion--solo`; `data-emp-accordion` — открыт один пункт | `#accordion` | Accordion `1253:14730` |
| Карточка файла | `emp-file`, без превью `emp-file--empty` + `emp-file__ghost`, `is-selected`, пусто `emp-file--none` + `emp-file__none`; маркеры `icons/upload/file-*.svg`, заглушки `icons/upload/ph-*.svg` | `#upload` | File preview `189:5930` |
| Чат | `emp-chat`, `--compact`; `__head`, `__pinned`, `__search`, `__list`, `__msg` (`--out`, `--note`, `is-grouped`, `is-deleted`, `is-failed`), `__bubble`, `__meta`, `__status--sending/sent/delivered/read/failed`, `__quote`, `__reactions`, `__tools`, `__pop`, `__typing`, `__jump`, `__drop`, `__state`, `__composer` (`is-note`, `is-disabled`), `__quick`, `__modes`; список чатов `emp-inbox`, `emp-chat-list`, `emp-chat-item`. Запуск: `empChat.mount(node, options)` | `#chat` | Chat `7728:8082` |

CRM-таблица настраивается переменными на контейнере экрана: `--emp-cols` (колонки грида, последняя 40px под action menu), `--emp-row-h` (минимальная высота строки, по умолчанию 36px), `--emp-table-min` (минимальная ширина). Границы ячеек — inset-тень 1px `--table-line`, поэтому высота строки совпадает с Figma.

Action menu по Figma: кнопка 40px, точки 3×3 с шагом 5px. Default — белая заливка и синие точки, Hover — `#eff4ff`, Pressed — `#1b68a9`, Active (меню открыто) — `#3c84c2` и белые точки, Disabled — серые точки. Список прижат к правому краю под кнопкой: рамка `#78a9d6`, скругление 4/0/4/4, тень системы. Пункт 28px, отступы 6/8, иконка 16, текст Noto Sans Display Medium 12. Открывается кликом, закрывается кликом снаружи, по пункту и по Escape. Вариант One icon — `emp-amenu__hit` с одной иконкой без списка.

Модалка по Figma MW: шапка в одну строку — иконка 24 (`emp-mw__icon`), заголовок 24/32 SemiBold, крестик 32 с иконкой `#7b7b7b`. Оверлей модалки `z-index: 1100`, превью файла `#preview-overlay` — 1200, тосты — 1300. Подтверждение удаления — `emp-mw--sm emp-mw--confirm` с текстом `emp-mw__text`.

## Toasts

Тост — это `emp-info emp-info--frame` нужного тона, вылетающий в стек. Карточку инфобокса не перерисовывать. Стек, движение и набор фраз живут в `css/toast.css` и `js/toast.js`. Вызов: `empToast(kind, data)`.

Позиция стека: `top: 40px`, `right: 40px`, колонка с `gap: 16px`, выравнивание по правому краю, `z-index: 1300` (выше оверлея модалки). Ширина по содержимому.

Тайминг — [CodePen OPbmdoX](https://codepen.io/VladimirEmpireNational/pen/OPbmdoX):

- Появление: `opacity` 0 → 1 и `transform` `translateX(20px) scale(0.98)` → `none` за 0.4s. Transform на `cubic-bezier(0.175, 0.885, 0.32, 1.1)`.
- Тост виден 1500ms.
- Уход: те же свойства за 0.25s `ease`. Узел удаляется из DOM через 250ms после старта ухода.
- Новый тост добавляется в стек и не заменяет предыдущий.
- `prefers-reduced-motion` отключает transform и transition. Время жизни то же.

### Копирование в View

В каждой модалке View у каждой строки значения есть кнопка копирования `emp-copy`. Иконка `icons/action-menu/copy.svg`, 24×24. Её нет, пока курсор или фокус не на строке. Клик пишет текст `emp-kv__value` (или элемента `[data-copy]` внутри `[data-copy-row]`) в буфер и показывает тост `copied`. Обработчик один, в `js/empire.js`. Это поведение по умолчанию для всех View: Warehouses, Shippers, Charges, Blacklist.

### Каталог

Тон берётся у `emp-info`: info, success, warning, error. Иконка 16×16 из набора fill. Текст не выдумывать.

| kind | Тон | Заголовок | Текст |
|---|---|---|---|
| `copied` | info | Copied | Warehouse details have been saved to your clipboard. |
| `saved` | success | Saved | Changes have been successfully saved. |
| `created` | success | Created | New item has been successfully created. |
| `updated` | success | Updated | Item has been successfully updated. |
| `deleted` | success | Delete | Item has been successfully deleted. |
| `sent` | success | Sent | "[Name]" has been successfully sent. |
| `connection` | warning | Connection lost | Please check your internet connection and try again. |
| `denied` | error | Access Denied | You do not have permission to perform this action. |
| `format` | error | Unsupported file format | Allowed formats: Documents (PDF, DOC, DOCX, XLS, XLSX, CSV) Images (JPEG, PNG, HEIC). |
| `large` | error | File is too large | Maximum allowed file size is [X] MB. |
| `unreadable` | error | File cannot be read | The file is corrupted or empty. Please check it and try again. |
| `upload` | error | Upload failed | Unable to upload the file. Please try again or select another file. |
| `saveFailed` | error | Upload failed | Unable to save changes. Please try again. |
| `messageCopied` | info | Copied | Message text has been copied to your clipboard. |
| `forwarded` | success | Forwarded | Message has been forwarded. |
| `pinned` | info | Pinned | Message is pinned at the top of the chat. |
| `archived` | success | Archived | "[Name]" has been moved to the archive. |
| `restored` | success | Restored | "[Name]" has been restored to active quotes. |
| `offerCreated` | success | BID & Offer created | The offer has been sent to drivers. |
| `booked` | success | Booked | "[Name]" has been booked for this load. |
| `ruleConflict` | error | Error: unsuccessful | This broker is already on the opposite list. Remove it first. |

`sent`, `archived`, `restored` и `booked` принимают `{ name }`, `large` принимает `{ size }`. Макет: [Toasts, node 6558:24180](https://www.figma.com/design/X1zmjtoFusntm0yJrB2nyW/Empire-design-system--bootstrap-?node-id=6558-24180).

### Аккордеон

По умолчанию все пункты закрыты. Открытый пункт показывает тело с контентом внутри общей рамки набора; пустое тело не оставлять. Экран меняет только раскладку тела (например, `display: flex` и отступы для формы), рамку и шапку пункта не переопределяет.

### Карточка файла: типы

Тип определяется в `js/empire.js` по MIME и расширению: Image, PDF, Doc (doc, docx, odt, rtf), Excel (xls, xlsx, csv, ods), Text (txt, md), Video, Sound, Archive (zip, rar, 7z, tar, gz), Other. Если превью нет, карточка показывает заглушку 80 px своего типа; в окне превью документ без картинки выводится белым листом с той же заглушкой.


### Выпадающий список: сброс крестиком

У каждого поля с `data-emp-options` есть кнопка сброса `emp-input__clear` — как в Figma Input («Show Clear button»): квадрат 24×24 (20×20 в `emp-field--sm`) с рамкой 1px #78A9D6, скруглением 4px и голубым крестиком; hover — фон #D1E1F5, нажатие — #95BCE1 с рамкой #5A96CC. Она видна, пока значение отличается от значения по умолчанию, и стоит перед шевроном — шеврон остаётся. Исключение: если поле уже 130px (узкие колонки фильтров), шеврон на время показа крестика прячется (класс `is-tight`), иначе значение не помещается. Список по-прежнему открывается кликом по полю. Значение по умолчанию задаётся атрибутом `data-emp-default`, без него берётся значение поля при загрузке страницы. Клик по крестику возвращает значение по умолчанию и отправляет события `input` и `change`, так что фильтры и статусы экрана обновляются как при обычном выборе. Программная запись `input.value` тоже обновляет крестик.

**Сортировка.** Иконку `#i-sort` (`emp-sort` / `emp-date__sort`) ставим только там, где она есть в дизайне страницы. Компоненты Input и Date picker в Фигме включают сортировку по умолчанию, поэтому она иногда видна и в полях форм (например, Date from / Date to в карточках PU/DEL на Loads) — в прототип такие не переносим.

Выпадающий список внутри ячейки CRM-таблицы не обрезается ячейкой и открывается поверх следующих строк. Длинный список прокручивается внутри, видно до 9 пунктов.

### Мультиселект

`emp-combo[data-emp-multi]` с `emp-input--multi`: размер 44 (чипсы 24) и `emp-field--sm` 32 (чипсы 20). Ширина поля — ширина `emp-field` (по умолчанию 360), чипсы переносятся на новые строки, поле растёт по высоте. Чипсы идут в порядке выбора.

### Чат

Один глобальный компонент для любого диалога в CRM: водители (приложение, SMS), брокеры и шиперы (email-треды), клиенты, внутренний чат команды, комментарии к грузу или квоте. Стили — блок `emp-chat` в `css/empire.css`, поведение — в `js/empire.js`, образец — `#chat` на Design. Иконки чата (Bootstrap Icons) компонент подключает сам, отдельный спрайт на странице не нужен.

Запуск: `empChat.mount(node, options)`. Основные опции: `me` (кто пишет), `messages`, `size: "compact"`, `header` (имя, подзаголовок, аватар, метки, телефон, статус присутствия), `quick` (быстрые ответы), `mentions` (люди для @), `notes: true` (режим «Internal note»), `channel` (via App / SMS / Email), `earlier` (история для «Load earlier»), `unreadFrom` (id первого непрочитанного), `renderCard` (карточки процесса в чате, например Offer card), `disabled`, `state` (`empty` / `loading` / `error`), `onSend`, `demo` (имитация ответа собеседника для прототипа).

Сообщение — объект: `side` (`in` / `out`), `author`, `avatar`, `time`, `day`, `type` (`text`, `file`, `image`, `gallery`, `video`, `voice`, `location`, `link`, `note`, `deleted`), `status` (`sending`, `sent`, `delivered`, `read`, `failed`), `reply`, `forwarded`, `edited`, `channel`, `translated`, `reactions`, `seenBy`. Системная строка — `{ kind: "event", tone, text }`, карточка — `{ kind: "card", ... }`.

Поведение:

- Подряд от одного автора сообщения группируются: аватар и мета только у первого. Разделители дат и «New messages» ставятся автоматически.
- Поле ввода растёт до 3 строк, дальше скролл. Enter — отправить, Shift+Enter — новая строка, ↑ в пустом поле — редактировать последнее своё, Esc — отменить ответ, редактирование или закрыть меню.
- Наведение на сообщение показывает панель: реакция, ответить, переслать, закрепить, ещё (копировать, редактировать, повторить, удалить).
- Файлы: скрепка, перетаскивание на чат, вставка из буфера; до 10 файлов по 25 МБ, прогресс загрузки и Retry.
- Голосовые: запись через `MediaRecorder`, таймер, отмена, отправка.
- `@` открывает список людей, ↑↓ и Enter выбирают.
- Пока пользователь прокрутил вверх, новые сообщения считает кнопка «вниз».
- Поиск по чату подсвечивает совпадения, ↑↓ переходят между ними.
- Для продакшна поле ввода и эмодзи можно перевести на `autosize` и `emoji-picker-element`, ссылки — на `linkifyjs`, HTML писем чистить `DOMPurify`. В прототипе это сделано встроенным кодом.

Экран Quotes (`quotes.html`, `css/quotes.css`, `js/quotes.js`): доска квот (Active / Archive, фильтры, карточки), Check quote (письмо, тред брокера в компактном чате, форма Offer и BID), рабочая область квоты (список квот, водители, чат с водителем), Quote Rules (Always include / Exclude, добавление email, ошибка конфликта), подтверждение архивации. Карточка квоты, строка водителя и Offer card — локальные блоки раздела.

### Тултип (обновлено)
- `.emp-tip > .emp-tip__bubble > .emp-tip__line` — без курсора (`.emp-tip__cursor` скрыт и больше не нужен в разметке).
- Плавное появление: opacity + сдвиг 4px за 160ms, задержка показа 120ms; `prefers-reduced-motion` — без анимации.
- Текст переносится (`max-width: 280px`), тень `--tip-shadow`. По оси центрируется над/под элементом и прижимается к краю экрана.

### Тень скролла (глобально)
- Любой скролл-контейнер внутри `.emp-overlay`, а также `.emp-mw__slot` и элементы с `[data-emp-fade]` получают тени 17px сверху/снизу (Figma: MW / Shadow, `--scroll-shadow` 5% чёрного).
- Нижняя тень видна, пока есть контент ниже; верхняя — после прокрутки. Работает автоматически (empire.js, `window.empFade(el)` для ручного вызова); тени — абсолютные соседи контейнера, его вёрстку не трогают.
- Старые белые `.emp-mw__fade` удалены.

### Quotes — Quote Rules
- Поиск — combobox: выпадашка с известными email брокеров. Выбор добавляет в текущий список; email из противоположного списка → тост `ruleConflict`; уже добавленный — неактивен.
- «Add new email» появляется только для валидного email, которого нет в базе и в списках; клик добавляет и показывает тост `created`.
- В Check quote письмо брокера — первое сообщение в чате (via Email), отдельного блока тела письма нет.
- Источник Gmail — цветной логотип Google (`#q-gmail`, viewBox 48), в Figma — компонент `Logo / Google`.

## Экран Document checking (`documents.html`)
Файлы: `css/documents.css` (раскладка и локальные блоки `dc-*`), `js/documents.js` (данные и логика). Figma: CRM 3.0 / Document checking.
- **Загрузка.** Шаг 1 — тип владельца (`emp-field` + `data-emp-options`), шаг 2 — `emp-upload`: карточки `emp-file` и зона загрузки в одной строке с переносом; зона занимает остаток строки и уходит на новую строку, когда < 280px. Пока тип владельца не выбран — зона заблокирована, текст читаемый. «Select documents» → чекбоксы на карточках → «Assign type (N)».
- **Assign a type** — `emp-mw--md`, радио-сетка типов; после назначения открывается следующий файл без типа.
- **Проверка.** Слева `emp-accordion`: тип документа, статус иконкой (проверен / ошибка / не проверен), внутри — файлы, открытый подсвечен. В центре просмотр (страницы, зум из `emp-preview__zoom`, «Reload document»). Справа распознанные поля и «Confirm & next».
- **Compare documents** — карточки полей, которые должны совпадать во всех документах; радио выбирает правильный источник.
- **Data mismatch** — вкладки по основным документам, блок основного документа, карточки расхождений: значение основного документа vs значение документа + решение радио (Value is correct / wrong / Keep with error). Save доступен, когда решены все.
- **Save with mismatches?** — подтверждение, если есть «Keep with error». После сохранения владелец появляется первым в List (тост `checkSaved`).
- **List** — `emp-table`: фильтры Date / Name / Owner type + колонка на каждый тип документа со статусом (Verified / Mismatch / Processing / —). Глаз и «View documents / Edit» — модалка просмотра с переключением документов чипсами и полями Add / Delete; «Delete» — подтверждение.
- Демо: `documents.html?demo=check` — сразу Company + 3 типизированных файла.
- **AI reading (между загрузкой и проверкой).** «Start check» → шаг «AI is reading your documents», ~8 с: Lottie-анимация «Document scan» (`media/doc-scan.json`, она же в `js/doc-scan-lottie.js`, плеер `lottie-web` 5.12.2 light с jsDelivr), общий прогресс и статус по каждому файлу (Waiting → Reading… → Fields filled). Потом сразу экран проверки с заполненными полями. Без lottie-web показывается та же картинка на SVG + CSS. Cancel — назад к загрузке.

## Экран Statistics dispatchers (`statistics.html`) — по фрейму Figma 490:29812
Сверху Office + Date/time + «Showing … items». Дальше: **Daily report** (фильтры Team, Year; блоки команд — лид подсвечен, между командами разделитель, итог Total), **Years Statistic Amount** (Year) и **Teams statistic** (Year), три карточки с Date/time: **Today summary**, **Today by source**, **Month by source**. Все фильтры пересчитывают демо-данные. Графики Chart.js со старой версии убраны.

## Notifications

Figma: Empire design system → Notification (section 6965:18941). Files: `css/notifications.css`, `js/notifications.js`, подключены на всех страницах с шапкой.

- **Колокольчик в шапке** — кнопка. Счётчик показывает непрочитанные (не в архиве), при 0 скрыт, больше 99 — «99+».
- **Pop-up toasts** — справа под шапкой, ширина 396px, высота по контенту, текст не обрезается. Одновременно не больше 3, новый сверху. Непрочитанный — точка и синие колокольчик/заголовок. При наведении фон #EFF4FF и кнопка ×: закрывает тост и делает уведомление прочитанным. Клик по тосту — переход в раздел, откуда пришло уведомление. Без действий тост уходит через 8 с (наведение ставит паузу), уведомление остаётся непрочитанным во входящих.
- **Inbox** (клик по колокольчику) — Notifications + Mark all read; табы All / Documents / System со счётчиками непрочитанных; справа Settings (шестерёнка) и Archive. Показываем 3 уведомления, «Expand inbox» раскрывает панель на высоту экрана со скроллом, «Collapse inbox» — обратно к 3. При наведении на карточку — кнопка «в архив» и «View →»; клик по карточке или View — переход в раздел и отметка «прочитано». Внизу карточки — время (Just now / N min ago / N h ago / дата) • раздел.
- **Settings** — Mute documents, Mute system messages (такие уведомления приходят во входящие, но без всплывающего тоста), Show pop-up toasts.
- **Archive** — при наведении: стрелка возвращает во входящие, корзина удаляет совсем.
- Состояние хранится в `localStorage` (`empNtf.v1`), поэтому одно и то же на всех страницах прототипа. Закрытие панели — клик вне неё или Esc.
- **Симуляция для демо**: новое уведомление приходит через 1,5 с после каждой загрузки страницы и затем каждые 2–3 минуты (случайное из набора: документы, системные, Brokers, Quotes, Loads, Candidates, Charges и др.). В консоли: `empNotify.simulate()` — прислать сейчас, `empNotify.reset()` — вернуть демо-данные.

## Navbar

У пунктов навбара нет состояния «после клика»: подсветка (#D1E1F5) только при наведении и при фокусе с клавиатуры (`:focus-visible`).
