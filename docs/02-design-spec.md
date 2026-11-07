# Спецификация дизайна для Figma: крипто-необанк (демо)

> Агент: `ux-designer` · Вход: `docs/01-product-strategy.md` («Вход для дизайнера») · Выход для: человек в Figma → `vibe-coder`

Принцип: **это банк, а не биржа**. Всё в тенге, крупные понятные числа, никаких свечей, стаканов и графиков цены. Доли портфеля показываются одной горизонтальной полосой, не графиком. Комиссия, курс, итог и граммы видны **до** нажатия «Купить». Риск сказан прямо. Слова «доход», «гарантия», «депозит», «надёжно как вклад» в интерфейсе не используются.

---

## 0. Моковые данные (единый источник чисел)

Все экраны берут числа только отсюда. Все расчёты проверены, округлений с остатком в моках нет.

### 0.1 Константы

| Параметр | Значение |
|---|---|
| Пользователь | Айгерим, аватар-инициалы «АК» |
| Дата и время демо | 7 ноября 2026, курс обновлён в 14:32 |
| Курс золота (базовый), K1 | **61 875 ₸ за 1 г** |
| Курс золота (после обновления котировки, edge case), K2 | **62 500 ₸ за 1 г** (+625 ₸, +1,01%) |
| Курс USDT | 510 ₸ за 1 USDT |
| Комиссия сервиса | **1% от введённой суммы**, уже включена в сумму (сверху ничего не добавляется) |
| Минимальная покупка | 1 000 ₸ |
| Дневной лимит на покупку золота | 200 000 ₸, сегодня использовано 0 ₸ |
| Таймер фиксации курса | 30 с |
| Кешбэк | 1% с покупок картой; накоплено с 1 ноября: **1 980 ₸** |
| Начисление кешбэка | 1 декабря 2026 |

### 0.2 Формулы (для отображения и кода)

- Комиссия = сумма × 1%.
- На золото = сумма − комиссия.
- Граммы = (сумма − комиссия) ÷ курс, округление **вниз** до 0,0001 г.
- Итого спишем = сумма (комиссия внутри).
- Оценка золота в тенге = граммы × текущий курс.
- Доли портфеля = актив ÷ сумма всех активов, **целые проценты**, сумма долей = 100%.

### 0.3 Пресеты и расчёт по курсу K1 = 61 875 ₸

| Сумма | Комиссия 1% | На золото | Граммы | Проверка |
|---|---|---|---|---|
| 1 000 ₸ | 10 ₸ | 990 ₸ | 0,0160 г | 0,016 × 61 875 = 990 |
| 5 000 ₸ | 50 ₸ | 4 950 ₸ | 0,0800 г | 0,08 × 61 875 = 4 950 |
| **10 000 ₸ (основной сценарий)** | **100 ₸** | **9 900 ₸** | **0,1600 г** | 0,16 × 61 875 = 9 900 |
| 152 400 ₸ (весь баланс) | 1 524 ₸ | 150 876 ₸ | 2,4384 г | 2,4384 × 61 875 = 150 876 |

Edge case «курс изменился», 10 000 ₸ по K2 = 62 500 ₸: комиссия 100 ₸, на золото 9 900 ₸, **0,1584 г** (0,1584 × 62 500 = 9 900).

Кешбэк: 1 980 ₸ ÷ 61 875 = **0,0320 г** (без комиссии).

### 0.4 Балансы по состояниям

| | 01 Dashboard (до покупки) | 01a Dashboard / After purchase | 01b Dashboard / After new quote |
|---|---|---|---|
| Курс золота на экране | 61 875 ₸ | 61 875 ₸ | 62 500 ₸ |
| Тенге | 152 400 ₸ | 142 400 ₸ | 142 400 ₸ |
| Золото, г | 1,2000 г | 1,3600 г | 1,3584 г |
| Золото, ₸ | ≈ 74 250 ₸ | ≈ 84 150 ₸ | ≈ 84 900 ₸ |
| USDT | 200 USDT ≈ 102 000 ₸ | 200 USDT ≈ 102 000 ₸ | 200 USDT ≈ 102 000 ₸ |
| **Всего** | **328 650 ₸** | **328 550 ₸** | **329 300 ₸** |
| Доли: тенге / золото / крипта | 46% / 23% / 31% | 43% / 26% / 31% | 43% / 26% / 31% |

Проверки: 152 400 + 74 250 + 102 000 = 328 650. После покупки: 328 650 − 100 ₸ комиссии = 328 550 (142 400 + 84 150 + 102 000). В 01b всё золото (1,3584 г) переоценено по 62 500 ₸: 1,3584 × 62 500 = 84 900, итого 142 400 + 84 900 + 102 000 = 329 300.

### 0.5 Партнёры МФЦА (вымышленные названия для демо)

| Партнёр | Что хранит | 01 | 01a | 01b |
|---|---|---|---|---|
| Tau Gold Custody Ltd. | Токенизированное золото | 1,2000 г | 1,3600 г | 1,3584 г |
| Dala Digital Custody Ltd. | Криптоактивы | 200 USDT | 200 USDT | 200 USDT |
| Bereke Partner Bank (банк-партнёр) | Тенге | 152 400 ₸ | 142 400 ₸ | 142 400 ₸ |

### 0.6 Формат чисел

- Разделитель тысяч — неразрывный пробел: `10 000 ₸`. Знак `₸` после числа через неразрывный пробел.
- Десятичный разделитель — запятая: `0,1600 г`. Граммы всегда с 4 знаками после запятой.
- Курс: `61 875 ₸ за 1 г`. Оценка в тенге для золота и крипты — со знаком `≈`.
- Цифры моноширинные (tabular numbers), чтобы таймер и суммы не «прыгали».

---

## 1. Страницы и фреймы Figma

### 1.1 Страницы файла

| Страница | Содержимое |
|---|---|
| `00 Cover` | Название, версия, ссылка на эту спецификацию |
| `01 Tokens` | Образцы Variables (цвета light/dark, отступы, радиусы), текстовые стили, эффекты |
| `02 Components` | Все компоненты с вариантами (раздел 3) |
| `03 Screens` | Все фреймы 390×844, разложены по секциям: Happy path, Edge path, Errors, Sheets, Dark preview |
| `04 Prototype` | Не нужна отдельно: прототип собирается на `03 Screens`, стартовый flow `Demo: Buy gold` |

### 1.2 Сетка фрейма

- Фрейм **390×844** (iPhone 14/15), фон `color/bg/primary`, Clip content, Vertical scrolling там, где контент выше экрана.
- Status bar 47 px (сверху, fixed). Home indicator 34 px (снизу).
- Боковые поля 16 px (`space/16`). Колонки: 4 колонки, gutter 8 px.
- TabBar: 49 + 34 = 83 px, fixed снизу. Нижняя кнопка на экранах без TabBar: отступ 16 px от home indicator.
- Шаг вертикального ритма 4/8 px.

### 1.3 Список фреймов

| Имя фрейма | Назначение | Скролл |
|---|---|---|
| `01 Dashboard` | Портфель до покупки | Да, контент ~1 240 px |
| `01a Dashboard / After purchase` | Портфель после покупки 0,1600 г и выбора кешбэка золотом | Да |
| `01b Dashboard / After new quote` | Портфель после покупки по обновлённому курсу (edge path) | Да |
| `02 Buy Gold / Amount` | Ввод суммы, пусто, кнопка неактивна | Нет |
| `02a Buy Gold / Amount / 1 000` | Выбран пресет 1 000 ₸ | Нет |
| `02b Buy Gold / Amount / 5 000` | Выбран пресет 5 000 ₸ | Нет |
| `02c Buy Gold / Amount / 10 000` | Выбран пресет 10 000 ₸ (основной сценарий) | Нет |
| `03 Buy Gold / Confirm` | Подтверждение, курс зафиксирован, таймер 0:30 | Да, если не влезает |
| `03a Buy Gold / Confirm / Loading` | Покупка отправлена, кнопка в loading | Нет |
| `03b Buy Gold / Confirm / New quote` | Подтверждение по новому курсу 62 500 ₸, таймер снова 0:30 | Да |
| `04 Buy Gold / Success` | Успех: +0,1600 г | Нет |
| `04b Buy Gold / Success / New quote` | Успех: +0,1584 г | Нет |
| `05 Cashback / Choose` | Выбор кешбэка: золото или тенге, ничего не выбрано | Нет |
| `05a Cashback / Choose / Gold selected` | Выбрано «Золотом» | Нет |
| `05b Cashback / Choose / KZT selected` | Выбрано «Тенге» | Нет |
| `E1 Error / Insufficient funds` | Сумма 160 000 ₸ больше баланса | Нет |
| `E2 Error / Limit exceeded` | Сумма 250 000 ₸ больше дневного лимита | Нет |
| `E3 Error / Quote changed` | Таймер истёк, BottomSheet с новым курсом поверх 03 | Нет |
| `E4 Error / Network` | Сбой сети при покупке, BottomSheet поверх 03 | Нет |
| `E4a Error / Network / Dashboard offline` | Дашборд без сети: плашка и кешированные балансы | Да |
| `S1 Sheet / How purchase works` | Пояснение курса, комиссии, расчёта граммов | Нет |
| `S2 Sheet / Limits` | Пояснение лимитов | Нет |
| `S3 Sheet / MFCA partners` | Кто такие партнёры МФЦА | Нет |
| `P1 Placeholder / Coming soon` | Заглушка для разделов вне демо | Нет |
| `01 Dashboard — Dark` | Копия 01 с mode Dark | Да |
| `03 Buy Gold / Confirm — Dark` | Копия 03 с mode Dark | Да |
| `E3 Error / Quote changed — Dark` | Копия E3 с mode Dark | Нет |

Dark-фреймы — это не отдельный дизайн: тот же фрейм, у которого на уровне фрейма переключён mode коллекции `Color` на `Dark`.

---

## 2. Design tokens (Figma Variables)

### 2.1 Коллекции

| Коллекция | Modes | Что внутри |
|---|---|---|
| `Color` | `Light`, `Dark` | Все цвета |
| `Space` | `Default` | Отступы |
| `Radius` | `Default` | Скругления |
| `Size` | `Default` | Высоты контролов, иконки |
| `Type` | `Default` | Размеры и межстрочные интервалы шрифта (number) |
| `Prototype` | `Default` | Служебные переменные для таймера (в код не переносятся) |

### 2.2 Цвета (`Color`)

| Variable | Light | Dark | Где используется |
|---|---|---|---|
| `color/bg/primary` | `#FFFFFF` | `#0E1113` | Фон экранов |
| `color/bg/secondary` | `#F3F4F6` | `#161A1E` | Фон секций, поле ввода, keypad |
| `color/bg/elevated` | `#FFFFFF` | `#1D2227` | Карточки, BottomSheet |
| `color/bg/scrim` | `#0E1113` @ 40% | `#000000` @ 60% | Затемнение под BottomSheet |
| `color/text/primary` | `#111418` | `#F2F4F6` | Основной текст, суммы |
| `color/text/secondary` | `#5B6470` | `#A3ACB6` | Подписи |
| `color/text/tertiary` | `#8A939E` | `#6F7882` | Плейсхолдеры, неактивное |
| `color/text/on-accent` | `#FFFFFF` | `#0E1113` | Текст на primary-кнопке |
| `color/text/link` | `#1E6B5A` | `#4CC3A4` | Текстовые ссылки |
| `color/accent/primary` | `#1E6B5A` | `#4CC3A4` | Primary-кнопка, активный таб, выбранный пресет |
| `color/accent/primary-pressed` | `#17574A` | `#3AA98C` | Нажатие |
| `color/accent/primary-subtle` | `#E6F2EF` | `#13302A` | Фон выбранного пресета, бейджи |
| `color/accent/gold` | `#B8891E` | `#E0B84A` | Иконка золота, сегмент «Золото» в полосе долей |
| `color/accent/gold-subtle` | `#FBF3DF` | `#2B2414` | Фон карточки кешбэка, success-иллюстрация |
| `color/asset/kzt` | `#3D7BE0` | `#6FA0F0` | Сегмент «Тенге» |
| `color/asset/gold` | `#B8891E` | `#E0B84A` | Сегмент «Золото» (алиас на `color/accent/gold`) |
| `color/asset/crypto` | `#7457E0` | `#9B85F2` | Сегмент «Крипта» |
| `color/status/success` | `#1F8A4C` | `#3DCB7A` | Успех |
| `color/status/success-subtle` | `#E7F5EC` | `#12291C` | Фон success-тоста |
| `color/status/warning` | `#A15C00` | `#F5A524` | Таймер ≤ 10 с, плашка риска (иконка, заголовок) |
| `color/status/warning-subtle` | `#FFF4E0` | `#2E2210` | Фон плашки риска |
| `color/status/error` | `#C62828` | `#FF6B6B` | Ошибки полей и экранов |
| `color/status/error-subtle` | `#FDECEC` | `#331717` | Фон error-тоста и иконки ошибки |
| `color/border/default` | `#E3E6EA` | `#2A3036` | Разделители, рамки карточек |
| `color/border/strong` | `#C5CBD2` | `#3A424A` | Рамка невыбранной радио-карточки |
| `color/border/focus` | `#1E6B5A` | `#4CC3A4` | Фокус, выбранная радио-карточка |
| `color/skeleton/base` | `#ECEEF1` | `#22282E` | Skeleton |

Контраст: `color/text/primary` и `color/text/secondary` на `color/bg/primary` и `color/bg/elevated` ≥ 4.5:1 в обоих режимах. `color/status/warning` в Light — `#A15C00`, а не жёлтый, чтобы текст на `warning-subtle` проходил 4.5:1. Цвет никогда не единственный носитель смысла: у ошибки всегда есть иконка и текст.

### 2.3 Отступы (`Space`), сетка 4/8

`space/0` = 0 · `space/4` = 4 · `space/8` = 8 · `space/12` = 12 · `space/16` = 16 · `space/20` = 20 · `space/24` = 24 · `space/32` = 32 · `space/40` = 40 · `space/48` = 48

### 2.4 Радиусы (`Radius`)

`radius/8` = 8 (чипы, мелкие бейджи) · `radius/12` = 12 (поля, кнопки M) · `radius/16` = 16 (кнопки L, карточки) · `radius/20` = 20 (крупные карточки дашборда) · `radius/24` = 24 (верх BottomSheet) · `radius/full` = 999 (аватар, пилюли, таймер)

### 2.5 Размеры (`Size`)

`size/button/l` = 52 · `size/button/m` = 44 · `size/touch/min` = 44 · `size/icon/16` = 16 · `size/icon/20` = 20 · `size/icon/24` = 24 · `size/icon/40` = 40 (иконка актива в круге) · `size/tabbar` = 49 · `size/navbar` = 44 · `size/keypad/key` = 56

### 2.6 Типографика

Шрифт: **Inter** (полная кириллица, tabular numbers через `font-feature: tnum`). Размеры хранятся number-переменными в `Type`, текстовые стили ссылаются на них.

| Текстовый стиль | Variables (size / line-height) | Значения | Начертание | Где |
|---|---|---|---|---|
| `type/display` | `type/display/size`, `type/display/line` | 40 / 48 | SemiBold, tnum | Сумма ввода, «Всего» на дашборде |
| `type/title-1` | `type/title-1/size`, `type/title-1/line` | 28 / 34 | SemiBold, tnum | «Вы получите 0,1600 г», заголовок успеха |
| `type/title-2` | `type/title-2/size`, `type/title-2/line` | 22 / 28 | SemiBold | Заголовки экранов и шитов |
| `type/headline` | `type/headline/size`, `type/headline/line` | 17 / 22 | SemiBold | Заголовки секций, суммы в карточках |
| `type/body` | `type/body/size`, `type/body/line` | 16 / 22 | Regular | Основной текст |
| `type/body-strong` | те же | 16 / 22 | SemiBold, tnum | Значения в FeeBreakdown |
| `type/callout` | `type/callout/size`, `type/callout/line` | 15 / 20 | Regular | Текст плашек, подписи кнопок M |
| `type/subhead` | `type/subhead/size`, `type/subhead/line` | 14 / 20 | Regular | Вторичные подписи |
| `type/caption` | `type/caption/size`, `type/caption/line` | 12 / 16 | Medium | Подписи табов, сноски, легенда |
| `type/button` | — | 17 / 22 | SemiBold | Текст кнопок L |

Поддержка Dynamic Type в коде: стили масштабируются, ни один контейнер с текстом не имеет фиксированной высоты.

### 2.7 Тени (Effect styles; Variables в Figma тени не поддерживают)

| Effect style | Light | Dark |
|---|---|---|
| `shadow/card` | 0 1 2 #111418 @ 6%; 0 4 12 #111418 @ 4% | нет тени, вместо неё рамка `color/border/default` |
| `shadow/sheet` | 0 −8 24 #111418 @ 12% | 0 −8 24 #000000 @ 40% |
| `shadow/toast` | 0 8 24 #111418 @ 14% | 0 8 24 #000000 @ 45% |

### 2.8 Анимации (для прототипа и кода)

| Токен | Значение | Где |
|---|---|---|
| `motion/push` | Move In from right / Move Out to left, 300 мс, Ease out | Переход вперёд по флоу |
| `motion/pop` | Move In from left, 250 мс, Ease out | Назад |
| `motion/sheet` | Move In from bottom, 300 мс, Ease out; scrim Dissolve 200 мс | BottomSheet |
| `motion/fade` | Dissolve, 200 мс, Ease out | Смена табов, успех |
| `motion/smart` | Smart Animate, 250 мс, Ease in-out | Смена состояния на том же экране (пресеты, выбор кешбэка) |
| `motion/toast` | Move In from top, 250 мс; автоскрытие через 3 с | Toast |

---

## 3. Компоненты (Auto Layout, варианты)

Все компоненты собраны в Auto Layout, цвета и отступы только через Variables, тексты — через Text properties, иконки — через Instance swap.

### 3.1 `Button`

- Auto Layout: horizontal, hug по ширине или fill, padding `space/16` по бокам, gap `space/8`, высота `size/button/l` (L) или `size/button/m` (M), радиус `radius/16` (L) / `radius/12` (M).
- Properties: `Type` = primary / secondary / tertiary / destructive; `State` = default / pressed / disabled / loading; `Size` = L / M; `Label` (text); `Icon left` (boolean + instance swap).

| Type | Фон | Текст |
|---|---|---|
| primary | `color/accent/primary` | `color/text/on-accent` |
| secondary | `color/bg/secondary` | `color/text/primary` |
| tertiary | прозрачный | `color/text/link` |
| destructive | `color/status/error-subtle` | `color/status/error` |

- `disabled`: фон `color/bg/secondary`, текст `color/text/tertiary`, без реакции на нажатие.
- `loading`: тот же фон, что у default; текст заменён на спиннер 20 px + подпись (например «Покупаем…»); ширина не меняется; нажатия игнорируются.
- `pressed`: фон `*-pressed` / затемнение 8%.

### 3.2 `AssetCard`

- Auto Layout: horizontal, padding `space/16`, gap `space/12`, фон `color/bg/elevated`, радиус `radius/16`, `shadow/card`.
- Слева иконка в круге 40 px; в центре колонка (название `type/headline`, подпись `type/subhead` `color/text/secondary`); справа колонка, выравнивание вправо (основное значение `type/headline` tnum, вторичное `type/subhead`), шеврон 16 px.
- Properties: `Asset` = kzt / gold / crypto; `State` = default / pressed / skeleton / hidden (балансы скрыты: `••• ₸`) / stale (серый бейдж «на 14:32»).

### 3.3 `PortfolioBar`

- Одна горизонтальная полоса высотой 8 px, радиус `radius/full`, три сегмента шириной по доле (`color/asset/kzt`, `color/asset/gold`, `color/asset/crypto`), между сегментами зазор 2 px.
- Под ней легенда в ряд: точка 8 px + «Тенге 46%» и т. д., `type/caption`.
- Не график: без осей, без истории, без динамики.

### 3.4 `QuoteTimer`

- Пилюля, Auto Layout horizontal, padding 8/12, радиус `radius/full`, фон `color/bg/secondary`. Слева иконка замка 16 px, текст «Курс зафиксирован», справа время `0:30` (`type/body-strong`, tnum). Под пилюлей линейный прогресс 2 px на всю ширину контента.
- Properties: `State` = active (30–11 с, цвет `color/accent/primary`) / warning (10–1 с, текст и прогресс `color/status/warning`, текст «Курс обновится через») / expired (0:00, текст «Курс обновляется…», прогресс пустой) / paused (в момент отправки покупки, иконка песочных часов, текст «Проверяем курс»).
- Служебный prototype-вариант `Tick` = A / B (см. раздел 5.3).
- Доступность: VoiceOver объявляет время на 30, 10 и 0 с, не каждую секунду.

### 3.5 `FeeBreakdown`

- Карточка `color/bg/elevated`, радиус `radius/16`, padding `space/16`, строки gap `space/12`.
- Строка (`FeeRow`): слева подпись `type/body` `color/text/secondary`, справа значение `type/body-strong`. Property `Emphasis` = default / total (итоговая строка: подпись и значение `type/headline` `color/text/primary`, над ней разделитель).
- Properties компонента: `State` = collapsed (только «Итого спишем» и «Комиссия», ссылка «Подробнее») / expanded (все строки + строка формулы).
- В прототипе используется `expanded`; collapsed нужен коду для маленьких экранов.

### 3.6 `RiskBanner`

- Auto Layout horizontal, padding `space/12`, gap `space/12`, фон `color/status/warning-subtle`, радиус `radius/12`, иконка «!» в треугольнике `color/status/warning`.
- Заголовок `type/callout` SemiBold, текст `type/subhead`. Property `Size` = full / compact (одна строка, для дашборда и успеха).

### 3.7 `PresetChip`

- Пилюля, высота 40, padding 0/16, радиус `radius/full`, `type/callout` SemiBold tnum.
- Property `Selected` = false (фон `color/bg/secondary`, текст `color/text/primary`) / true (фон `color/accent/primary-subtle`, рамка 1.5 px `color/border/focus`, текст `color/accent/primary`).

### 3.8 `AmountInput`

- Центрированная колонка: сумма `type/display` tnum, под ней пересчёт `type/subhead` `color/text/secondary` («≈ 0,1600 г золота · комиссия 100 ₸»), под ним строка помощи.
- Property `State` = empty (сумма «0 ₸» `color/text/tertiary`) / filled / error (сумма `color/status/error`, строка помощи с иконкой ошибки, лёгкий shake 300 мс в коде).

### 3.9 `Keypad`

- Сетка 3×4 (1–9, пусто, 0, стереть), клавиша 56 px высотой, `type/title-2`, фон клавиш прозрачный, нажатие — `color/bg/secondary`.
- В Figma статичный; в коде — рабочий ввод.

### 3.10 `RadioCard` (выбор кешбэка)

- Auto Layout horizontal, padding `space/16`, gap `space/12`, радиус `radius/16`, рамка 1 px `color/border/strong`.
- Слева иконка 40 px, в центре заголовок + подпись, справа радио-кружок 24 px.
- Property `Selected` = false / true (рамка 2 px `color/border/focus`, фон `color/accent/primary-subtle`, радио заполнено). Property `Badge` (boolean + text).

### 3.11 `PartnerRow`

- Строка списка: логотип-плейсхолдер 32 px (инициалы на `color/bg/secondary`), название `type/body`, подпись роли `type/subhead`, справа баланс `type/body-strong` tnum. Разделитель снизу `color/border/default`, у последней строки нет.

### 3.12 `TabBar`

- Высота 49 + 34 (safe area), фон `color/bg/elevated`, верхняя граница 1 px `color/border/default`. 5 табов, каждый: иконка 24 + подпись `type/caption`.
- Табы: «Главная», «Платежи», «Активы», «История», «Профиль».
- Property `Active` = home / payments / assets / history / profile (активный: `color/accent/primary`, остальные `color/text/tertiary`).

### 3.13 `NavBar`

- Высота 44, слева кнопка «назад» (шеврон 24, hit area 44×44) или «закрыть» (крестик), по центру заголовок `type/headline`, справа опциональная иконка «i» 24.
- Properties: `Leading` = back / close / none; `Trailing` = info / none; `Title` (text).

### 3.14 `BottomSheet`

- Ширина 390, радиус сверху `radius/24`, фон `color/bg/elevated`, `shadow/sheet`, grabber 36×5 `color/border/strong` сверху с отступом 8.
- Внутри Auto Layout vertical: padding 24/16/16 (+34 safe area), gap `space/16`: иконка (опц.) → заголовок `type/title-2` → текст `type/body` → слот контента → кнопки (вертикально, gap `space/8`).
- Properties: `Type` = info / error / warning; `Icon` (boolean); `Secondary button` (boolean); `Tertiary button` (boolean).
- Закрывается свайпом вниз и тапом по scrim (кроме `E3` — там только явные кнопки, чтобы не купить по старому курсу случайно).

### 3.15 `Toast`

- Ширина 358 (поля 16), padding `space/12`/`space/16`, радиус `radius/16`, `shadow/toast`, иконка 20 + текст `type/callout` + опциональная текстовая кнопка справа.
- Property `Type` = success / info / warning / error (фон `*-subtle`, иконка своего статуса). Появляется сверху под status bar.

### 3.16 `ErrorState`

Единый компонент ошибки, чтобы тексты и CTA были одинаковыми во всём приложении.

- Properties: `Kind` = insufficient-funds / limit-exceeded / quote-changed / network; `Layout` = inline (под полем ввода) / sheet (в BottomSheet) / banner (полоса под NavBar).
- `inline`: иконка 16 `color/status/error` + текст `type/subhead` `color/status/error` + ссылка.
- `sheet`: иконка 48 в круге `color/status/error-subtle` (или `warning-subtle` для quote-changed) + заголовок + текст + слот + кнопки.
- `banner`: полоса `color/status/warning-subtle`, иконка, одна строка текста, кнопка «Обновить».

### 3.17 Вспомогательные

`Avatar` (инициалы, 40 px) · `QuickAction` (иконка 24 в круге 52 + подпись `type/caption`; `State` = default / disabled) · `SectionHeader` (заголовок `type/headline` + опц. иконка «i» или ссылка) · `CashbackCard` (`State` = promo / gold-active / kzt-active) · `ListRow` (подпись слева, значение справа) · `Skeleton`.

---

## 4. Содержимое экранов (сверху вниз)

Тексты ниже — финальные. В кавычках « » — то, что видит пользователь.

### 01 Dashboard

1. Status bar «14:32».
2. Header (padding 16, высота 56): `Avatar` «АК» · «Добрый день, Айгерим» (`type/headline`) · справа иконки «глаз» (скрыть балансы) и «колокольчик».
3. Карточка «Всего» (`radius/20`, padding 20):
   - «Всего на счетах» (`type/subhead`, secondary)
   - «328 650 ₸» (`type/display`)
   - «В тенге по текущим курсам · обновлено в 14:32» (`type/caption`, tertiary)
   - `PortfolioBar`: Тенге 46% · Золото 23% · Крипта 31%.
4. Ряд `QuickAction` (4 колонки, gap 8): «Пополнить» · «Купить золото» (иконка золотого слитка, фон круга `color/accent/gold-subtle`) · «Перевести» · «Обменять».
5. `SectionHeader` «Мои активы».
6. `AssetCard` kzt: «Тенге» / «Можно тратить и покупать» · «152 400 ₸».
7. `AssetCard` gold: «Золото» / «61 875 ₸ за 1 г» · «1,2000 г» / «≈ 74 250 ₸».
8. `AssetCard` crypto: «USDT» / «510 ₸ за 1 USDT» · «200 USDT» / «≈ 102 000 ₸».
9. `RiskBanner` compact: «Цена золота и крипты может снижаться. Оценка в тенге меняется вместе с рынком.»
10. `CashbackCard` promo (фон `color/accent/gold-subtle`): заголовок «Кешбэк золотом» · текст «1% с покупок картой — копите граммы со сдачи. Уже накоплено 1 980 ₸.» · кнопка M secondary «Настроить».
11. `SectionHeader` «Партнёры МФЦА» + иконка «i».
12. Карточка со списком `PartnerRow`:
    - «Tau Gold Custody Ltd.» / «Хранение золота» · «1,2000 г»
    - «Dala Digital Custody Ltd.» / «Хранение криптоактивов» · «200 USDT»
    - «Bereke Partner Bank» / «Счёт в тенге» · «152 400 ₸»
13. Сноска `type/caption` tertiary: «Ваши активы хранятся у партнёров — участников МФЦА. Мы показываем балансы и проводим операции через них.»
14. Отступ 24 + `TabBar` Active=home (fixed).

На главном экране нет графиков цены, свечей, процентов изменения за период.

### 01a Dashboard / After purchase

Как 01, с изменениями:
- Сверху `Toast` success (если пришли из 05a): «Готово: кешбэк будет приходить золотом». Если пришли из 04 через «На главную»: «+0,1600 г золота на вашем счёте».
- «Всего на счетах» «328 550 ₸»; `PortfolioBar`: Тенге 43% · Золото 26% · Крипта 31%.
- Тенге «142 400 ₸»; Золото «1,3600 г» / «≈ 84 150 ₸»; USDT без изменений.
- `CashbackCard` gold-active: «Кешбэк приходит золотом» · «Накоплено 1 980 ₸ ≈ 0,0320 г. Начислим 1 декабря по курсу на этот день.» · ссылка «Изменить».
- Партнёры: Tau Gold Custody Ltd. «1,3600 г»; Bereke Partner Bank «142 400 ₸».
- Новый блок после партнёров: `SectionHeader` «Последние операции» и строка «Покупка золота · сегодня, 14:32» · «−10 000 ₸» / «+0,1600 г».

Если пользователь пришёл через 04 → «На главную» (без выбора кешбэка), `CashbackCard` остаётся promo. В прототипе это состояние не выделено в отдельный фрейм (см. допущения).

### 01b Dashboard / After new quote

Как 01a, но:
- «обновлено в 14:33»; «Всего на счетах» «329 300 ₸»; `PortfolioBar` 43% · 26% · 31%.
- Золото «62 500 ₸ за 1 г» · «1,3584 г» / «≈ 84 900 ₸».
- `CashbackCard` promo (кешбэк в этой ветке не выбирали), кнопка «Настроить» в прототипе не связана.
- Партнёры: Tau Gold Custody Ltd. «1,3584 г»; Bereke Partner Bank «142 400 ₸».
- Последняя операция: «−10 000 ₸» / «+0,1584 г».
- `Toast` success: «+0,1584 г золота на вашем счёте».

### 02 Buy Gold / Amount

1. Status bar.
2. `NavBar`: back · «Купить золото» · info.
3. Строка курса по центру (`type/subhead`, secondary): «Сейчас 61 875 ₸ за 1 г · точный курс зафиксируем на следующем шаге».
4. `AmountInput` empty: «0 ₸» · «≈ 0 г золота».
5. Строка «Доступно: 152 400 ₸» (`type/subhead`) + ссылка «Пополнить».
6. Ряд `PresetChip` (по центру, gap 8): «1 000 ₸» · «5 000 ₸» · «10 000 ₸».
7. Подсказка `type/caption` tertiary: «От 1 000 ₸. Комиссия 1% уже включена в сумму.»
8. `Keypad`.
9. `Button` L primary disabled «Продолжить» (fill, поля 16).

### 02a / 02b / 02c Buy Gold / Amount / пресет

Как 02, выбранный `PresetChip` Selected=true, `AmountInput` filled, кнопка primary default «Продолжить».

| Фрейм | Сумма | Строка пересчёта |
|---|---|---|
| 02a | «1 000 ₸» | «≈ 0,0160 г золота · комиссия 10 ₸» |
| 02b | «5 000 ₸» | «≈ 0,0800 г золота · комиссия 50 ₸» |
| 02c | «10 000 ₸» | «≈ 0,1600 г золота · комиссия 100 ₸» |

### 03 Buy Gold / Confirm

1. Status bar.
2. `NavBar`: back · «Проверьте покупку» · info.
3. `QuoteTimer` active: «Курс зафиксирован · 0:30» + прогресс на всю ширину.
4. Hero (по центру, padding 24/0): иконка золота 56 в круге `color/accent/gold-subtle` · «Вы получите» (`type/subhead`) · «0,1600 г золота» (`type/title-1`).
5. `FeeBreakdown` expanded:
   - «Курс за 1 г» — «61 875 ₸»
   - «Сумма покупки» — «10 000 ₸»
   - «Комиссия сервиса, 1%» — «100 ₸»
   - «Пойдёт на золото» — «9 900 ₸»
   - формула `type/caption` tertiary: «9 900 ₸ ÷ 61 875 ₸ = 0,1600 г»
   - разделитель
   - total «Итого спишем» — «10 000 ₸»
6. Карточка `ListRow` (2 строки):
   - «Списать с» — «Тенге · 152 400 ₸»
   - «Хранитель» — «Tau Gold Custody Ltd., МФЦА»
7. `RiskBanner` full: заголовок «Цена золота может снижаться» · текст «Это не вклад. Стоимость ваших граммов в тенге меняется вместе с рынком — при продаже можно получить меньше, чем вы заплатили.»
8. Строка `type/caption` tertiary: «Других комиссий нет. Как считается покупка» (последние слова — ссылка на S1).
9. `Button` L primary «Купить за 10 000 ₸».
10. `Button` L tertiary «Отменить».

### 03a Buy Gold / Confirm / Loading

Как 03, но: `QuoteTimer` paused «Проверяем курс»; кнопка `loading` «Покупаем…»; «Отменить» и back disabled (`color/text/tertiary`). Длительность в прототипе — 1,2 с.

### 03b Buy Gold / Confirm / New quote

Как 03, но:
- Над таймером `Toast` info (inline, не всплывающий): «Курс обновлён: 62 500 ₸ за 1 г».
- `QuoteTimer` снова «0:30».
- Hero: «0,1584 г золота».
- `FeeBreakdown`: курс «62 500 ₸»; сумма «10 000 ₸»; комиссия «100 ₸»; на золото «9 900 ₸»; формула «9 900 ₸ ÷ 62 500 ₸ = 0,1584 г»; итого «10 000 ₸».

### 04 Buy Gold / Success

1. Status bar. `NavBar` Leading=close, без заголовка.
2. Иллюстрация: круг 96 `color/status/success-subtle` с галочкой + маленький слиток золота.
3. «Готово!» (`type/title-1`).
4. «+0,1600 г золота» (`type/title-2`, `color/accent/gold`).
5. Текст `type/body` secondary: «Списали 10 000 ₸, из них 100 ₸ — комиссия. Граммы уже у вас на счёте в Tau Gold Custody Ltd.»
6. Карточка `ListRow`:
   - «Теперь у вас» — «1,3600 г ≈ 84 150 ₸»
   - «Курс покупки» — «61 875 ₸ за 1 г»
   - «Дата» — «7 ноября 2026, 14:32»
   - «Номер операции» — «GLD-261107-0042»
7. `CashbackCard` promo: «Копите золото автоматически» · «Получайте кешбэк 1% с покупок картой граммами золота.»
8. `Button` L primary «Выбрать кешбэк».
9. `Button` L secondary «На главную».

### 04b Buy Gold / Success / New quote

Как 04, но: «+0,1584 г золота»; «Теперь у вас» «1,3584 г ≈ 84 900 ₸»; «Курс покупки» «62 500 ₸ за 1 г»; «Дата» «7 ноября 2026, 14:33»; «Номер операции» «GLD-261107-0043». Без `CashbackCard` и без кнопки «Выбрать кешбэк» — только primary «На главную».

### 05 Cashback / Choose

1. Status bar. `NavBar`: close · «Кешбэк».
2. «Как получать кешбэк?» (`type/title-2`).
3. Текст: «1% с покупок картой. Начисляем 1-го числа за прошлый месяц.»
4. Карточка-счётчик (`color/bg/secondary`, `radius/16`): «Накоплено с 1 ноября» · «1 980 ₸» (`type/title-1`).
5. `RadioCard` Selected=false: иконка золота · «Золотом» · «≈ 0,0320 г по курсу 61 875 ₸ за 1 г» · Badge «Без комиссии».
6. `RadioCard` Selected=false: иконка тенге · «Тенге» · «1 980 ₸ на ваш счёт».
7. Сноска `type/caption` tertiary: «Граммы рассчитаем по курсу на день начисления, без комиссии. Цена золота может снижаться. Способ можно поменять в любой момент.»
8. `Button` L primary disabled «Сохранить» (ничего не выбрано по умолчанию — чтобы честно проверить H2).

### 05a / 05b Cashback / Choose / выбор

Как 05, выбранная `RadioCard` Selected=true, кнопка «Сохранить» активна. 05a — «Золотом», 05b — «Тенге».

### S1 Sheet / How purchase works

`BottomSheet` info поверх затемнённого 02 или 03:
- «Как считается покупка»
- Три пункта (иконка + текст):
  - «Курс — цена 1 г золота у хранителя Tau Gold Custody Ltd. Мы фиксируем его на 30 секунд, чтобы вы успели проверить покупку.»
  - «Комиссия сервиса — 1% от суммы. Она уже внутри суммы: при покупке на 10 000 ₸ спишем ровно 10 000 ₸.»
  - «Граммы = (сумма − комиссия) ÷ курс. Округляем вниз до 0,0001 г.»
- «Золото хранится у партнёра — участника МФЦА, а не у нас. Цена может снижаться.»
- `Button` L secondary «Понятно».

### S2 Sheet / Limits

- «Лимиты на покупку золота»
- `ListRow`: «В сутки» — «200 000 ₸»; «Использовано сегодня» — «0 ₸»; «Минимальная покупка» — «1 000 ₸».
- Текст: «Лимит обновляется в 00:00 по времени Астаны. Увеличить его можно после полной проверки личности — в демо-версии это недоступно.»
- `Button` L secondary «Понятно».

### S3 Sheet / MFCA partners

- «Кто хранит ваши активы»
- Текст: «Мы — приложение, через которое вы управляете деньгами. Сами активы хранятся у партнёров — участников Международного финансового центра «Астана» (МФЦА).»
- Три `PartnerRow` как на дашборде (без балансов, с ролью).
- `Button` L secondary «Понятно».

### P1 Placeholder / Coming soon

`NavBar` back · иконка 64 · «Скоро здесь» · «Этот раздел не входит в демо. Попробуйте купить золото на главном экране.» · `Button` L primary «На главную». `TabBar` с активным табом, с которого пришли (в прототипе — home).

---

## 5. Связи прототипа

Стартовый flow: `Demo: Buy gold`, starting frame `01 Dashboard`. Устройство в Prototype settings: iPhone 14, фон `#0E1113`.

### 5.1 Happy path

| Экран | Действие | Куда | Анимация |
|---|---|---|---|
| 01 Dashboard | Тап QuickAction «Купить золото» | 02 Buy Gold / Amount | `motion/push` |
| 01 Dashboard | Тап AssetCard «Золото» | 02 Buy Gold / Amount | `motion/push` |
| 01 Dashboard | Тап «Настроить» в CashbackCard | 05 Cashback / Choose | `motion/sheet` (как модальный экран) |
| 01 Dashboard | Тап «i» у «Партнёры МФЦА» | S3 Sheet / MFCA partners (Overlay, bottom) | `motion/sheet` |
| 01 Dashboard | Тап иконки «глаз» | AssetCard и «Всего» → State=hidden (Change to) | `motion/smart` |
| 01 Dashboard | Тап «Пополнить», «Перевести», «Обменять», любого таба кроме «Главная», AssetCard «Тенге»/«USDT» | P1 Placeholder / Coming soon | `motion/push` (таб — `motion/fade`) |
| 02 Buy Gold / Amount | Тап «1 000 ₸» | 02a | `motion/smart` |
| 02 Buy Gold / Amount | Тап «5 000 ₸» | 02b | `motion/smart` |
| 02 Buy Gold / Amount | Тап «10 000 ₸» | 02c | `motion/smart` |
| 02a / 02b / 02c | Тап другого пресета | Соответствующий 02a/02b/02c | `motion/smart` |
| 02, 02a–02c | Тап «i» | S1 Sheet (Overlay, bottom) | `motion/sheet` |
| 02, 02a–02c | Тап back | 01 Dashboard | `motion/pop` |
| 02c | Тап «Продолжить» | 03 Buy Gold / Confirm | `motion/push` |
| 02a / 02b | Тап «Продолжить» | 03 Buy Gold / Confirm (см. допущение: в прототипе доведён только сценарий 10 000 ₸) | `motion/push` |
| 03 Confirm | Тап «Купить за 10 000 ₸» | 03a Loading | Instant (меняется только кнопка) |
| 03a Loading | After delay 1 200 мс | 04 Success | `motion/fade` |
| 03 Confirm | Тап ссылки «Как считается покупка» или «i» | S1 Sheet (Overlay) | `motion/sheet` |
| 03 Confirm | Тап back | 02c | `motion/pop` |
| 03 Confirm | Тап «Отменить» | 01 Dashboard | `motion/pop` |
| 04 Success | Тап «Выбрать кешбэк» | 05 Cashback / Choose | `motion/push` |
| 04 Success | Тап «На главную» или крестик | 01a Dashboard / After purchase (toast «+0,1600 г…») | `motion/fade` |
| 05 Cashback | Тап RadioCard «Золотом» | 05a | `motion/smart` |
| 05 Cashback | Тап RadioCard «Тенге» | 05b | `motion/smart` |
| 05a ↔ 05b | Тап другой карточки | 05b / 05a | `motion/smart` |
| 05a | Тап «Сохранить» | 01a Dashboard / After purchase (toast «Готово: кешбэк будет приходить золотом») | `motion/fade` |
| 05b | Тап «Сохранить» | 01a Dashboard / After purchase, toast «Готово: кешбэк будет приходить в тенге», CashbackCard → kzt-active | `motion/fade` |
| 05, 05a, 05b | Тап крестика | Предыдущий экран (Back) | `motion/pop` |
| S1, S2, S3 | Тап «Понятно», тап по scrim, свайп вниз | Close overlay | `motion/sheet` (обратно) |
| P1 | Тап «На главную» / back | 01 Dashboard | `motion/pop` |

### 5.2 Edge cases

| Экран | Действие | Куда | Анимация |
|---|---|---|---|
| 02 Buy Gold / Amount | Демо-триггер: клавиша `I` или скрытый хотспот 44×44 справа в status bar | E1 Error / Insufficient funds | `motion/smart` |
| 02 Buy Gold / Amount | Демо-триггер: клавиша `L` или скрытый хотспот 44×44 слева в status bar | E2 Error / Limit exceeded | `motion/smart` |
| E1 | Тап «Пополнить на 7 600 ₸» | P1 Placeholder | `motion/push` |
| E1 | Тап «Изменить сумму» | 02 Buy Gold / Amount | `motion/smart` |
| E2 | Тап «Изменить сумму» | 02 Buy Gold / Amount | `motion/smart` |
| E2 | Тап «Подробнее о лимитах» | S2 Sheet / Limits (Overlay) | `motion/sheet` |
| 03 Confirm | Таймер дошёл до 0:00 (см. 5.3) | E3 Error / Quote changed | `motion/sheet` |
| 03 Confirm | Демо-триггер: клавиша `Q` или тап по QuoteTimer | E3 Error / Quote changed | `motion/sheet` |
| E3 | Тап «Обновить курс и проверить» | 03b Confirm / New quote | `motion/smart` (sheet уезжает вниз, цифры меняются) |
| E3 | Тап «Изменить сумму» | 02c | `motion/pop` |
| E3 | Тап «Отменить покупку» | 01 Dashboard | `motion/pop` |
| 03b New quote | Тап «Купить за 10 000 ₸» | 03a Loading → (After delay 1 200 мс) 04b Success / New quote. В прототипе это отдельная копия `03a Buy Gold / Confirm / Loading` с цифрами 03b, имя `03c Buy Gold / Confirm / Loading new quote` | Instant, затем `motion/fade` |
| 03b New quote | Таймер снова истёк | E3 (тот же sheet; в коде — с новыми цифрами) | `motion/sheet` |
| 04b Success | Тап «На главную» или крестик | 01b Dashboard / After new quote | `motion/fade` |
| 03 Confirm | Демо-триггер: клавиша `N` или скрытый хотспот 44×44 слева в status bar, затем тап «Купить» | 03a Loading → (After delay 1 200 мс) E4 Error / Network. Реализуется копией `03a` с другим after-delay: `03d Buy Gold / Confirm / Loading network fail` | Instant, затем `motion/sheet` |
| E4 | Тап «Повторить» | 03 Confirm (курс запрошен заново, таймер 0:30) | `motion/smart` |
| E4 | Тап «Отменить» | 01 Dashboard | `motion/pop` |
| 01 Dashboard | Демо-триггер: клавиша `O` | E4a Dashboard offline | `motion/fade` |
| E4a | Тап «Обновить» в баннере | 01 Dashboard + Toast success «Данные обновлены» | `motion/fade` |
| E4a | Тап «Купить золото» | 02 Buy Gold / Amount (вход разрешён; ошибка покажется при подтверждении) | `motion/push` |

Итого добавляются два технических фрейма: `03c Buy Gold / Confirm / Loading new quote` и `03d Buy Gold / Confirm / Loading network fail` (визуально = 03a, отличаются цифрами или переходом).

### 5.3 Таймер 30 с в Figma

1. В коллекции `Prototype` переменные: `proto/quote-seconds` (number, 30) и `proto/quote-bar` (number, 358 — ширина прогресса в px).
2. Текст времени в `QuoteTimer` привязан к строковому выражению `0:` + seconds (для 9…0 — отдельный текстовый слой с ведущим нулём, видимость по условию `seconds < 10`). Ширина прогресса привязана к `proto/quote-bar`.
3. Внутри `QuoteTimer` варианты `Tick=A` и `Tick=B`. Interaction на каждом: **After delay 1 000 мс** → Set variable `proto/quote-seconds` = `proto/quote-seconds − 1`, `proto/quote-bar` = `proto/quote-bar − 11.93` → Change to другой Tick-вариант. Это даёт бесконечный тик раз в секунду.
4. Conditional в том же действии: если `proto/quote-seconds ≤ 10` → State=warning; если `proto/quote-seconds ≤ 0` → Navigate to `E3 Error / Quote changed`.
5. При входе на 03 и 03b (On tap кнопки, ведущей на них) — Set variable `proto/quote-seconds` = 30, `proto/quote-bar` = 358.
6. Фолбэк для показа: тап по таймеру или клавиша `Q` сразу открывает E3.

---

## 6. Состояния ошибок

Общие правила: ошибка всегда говорит **что случилось → что с деньгами → что делать**. Никогда не теряем введённую сумму. Красный — только для блокирующих ошибок; изменение курса — это предупреждение (warning), а не ошибка пользователя.

### E1 Error / Insufficient funds (недостаток средств)

- **Где:** экран суммы, `ErrorState` Kind=insufficient-funds, Layout=inline. Проверка на лету при вводе (до «Продолжить»). Та же логика — sheet-вариантом на 03, если баланс изменился, пока пользователь был на подтверждении.
- **Мок:** введено 160 000 ₸, на счёте 152 400 ₸, не хватает 7 600 ₸.
- **Экран сверху вниз:** как 02, `AmountInput` error «160 000 ₸» (красным) · пересчёт «≈ 2,5600 г золота · комиссия 1 600 ₸» · строка ошибки с иконкой: «Не хватает 7 600 ₸. На счёте 152 400 ₸ — можно купить максимум на эту сумму (≈ 2,4384 г).» · пресеты без выбора · keypad · две кнопки:
  - primary «Пополнить на 7 600 ₸» → P1 Placeholder (в коде — экран пополнения с подставленной суммой)
  - tertiary «Изменить сумму» → 02 (сумма очищается)
- Проверка: 160 000 × 1% = 1 600; 158 400 ÷ 61 875 = 2,56 г; 160 000 − 152 400 = 7 600.

### E2 Error / Limit exceeded (превышен лимит)

- **Где:** экран суммы, inline. **Приоритет:** если сумма превышает и лимит, и баланс, показываем лимит (пополнение не поможет).
- **Мок:** введено 250 000 ₸, дневной лимит 200 000 ₸, использовано 0 ₸.
- **Экран:** `AmountInput` error «250 000 ₸» · пересчёт скрыт · строка ошибки: «Это больше дневного лимита. Сегодня можно купить золото ещё на 200 000 ₸.» · ссылка «Подробнее о лимитах» → S2 · кнопки:
  - primary «Изменить сумму» → 02
  - ссылка «Подробнее о лимитах» → S2 Sheet / Limits

### E3 Error / Quote changed (истёк таймер, курс изменился)

- **Где:** `BottomSheet` Type=warning поверх затемнённого 03 (таймер 0:00, кнопка «Купить» disabled). Закрывается только кнопками, scrim и свайп не закрывают.
- **Триггеры:** истёк таймер 30 с; или сервер при нажатии «Купить» ответил, что котировка устарела (тот же sheet).
- **Содержимое сверху вниз:**
  - иконка часов в круге `color/status/warning-subtle`
  - «Курс обновился»
  - «30 секунд прошли, и курс золота изменился. Проверьте, сколько граммов вы получите сейчас.»
  - Таблица сравнения (2 колонки «Было» / «Сейчас»):
    - «Курс за 1 г»: «61 875 ₸» → «62 500 ₸»
    - «Вы получите»: «0,1600 г» → «0,1584 г»
  - «Сумма и комиссия не изменились: 10 000 ₸, из них 100 ₸ — комиссия.»
  - primary «Обновить курс и проверить» → 03b
  - secondary «Изменить сумму» → 02c
  - tertiary «Отменить покупку» → 01
- **Правило:** никогда не покупаем по новому курсу без повторного явного нажатия «Купить» на экране подтверждения.

### E4 Error / Network (сбой сети при покупке)

- **Где:** `BottomSheet` Type=error поверх 03 после 03a (запрос не ушёл / не дошёл до сервера).
- **Содержимое:**
  - иконка «нет сети» в круге `color/status/error-subtle`
  - «Нет связи»
  - «Покупка не прошла, деньги не списаны. Проверьте интернет и попробуйте ещё раз — курс мы запросим заново.»
  - primary «Повторить» → 03 (новая котировка, таймер 0:30)
  - tertiary «Отменить» → 01
- **Если запрос ушёл, а ответа нет** (таймаут после отправки) — в прототипе не показываем отдельным фреймом, но в коде это отдельное состояние того же sheet: заголовок «Проверяем покупку», текст «Связь прервалась после отправки. Не покупайте повторно — мы проверим статус и покажем результат.», спиннер, кнопка «На главную». Повторную покупку блокируем, пока статус не известен.

### E4a Error / Network / Dashboard offline

- Как 01, под header — `ErrorState` Layout=banner: иконка · «Нет интернета. Показываем балансы на 14:32» · кнопка M tertiary «Обновить».
- `AssetCard` в State=stale (бейдж «на 14:32»), суммы те же, что в 01.
- QuickAction «Пополнить», «Перевести», «Обменять» — disabled; «Купить золото» доступен (ввод суммы работает офлайн, ошибка при подтверждении).

### Не-ошибки (валидация без отдельного фрейма)

- Сумма меньше 1 000 ₸ (например, 500 ₸): кнопка «Продолжить» disabled, подсказка под пресетами становится `color/text/secondary`: «Минимальная покупка — 1 000 ₸». Без красного.
- Пустой ввод: кнопка disabled, подсказка по умолчанию.

---

## 7. Логика прозрачности (комиссии, котировки, риски)

1. **Комиссия внутри суммы.** Пользователь вводит, сколько потратить; ровно эта сумма и спишется. Комиссия показана в ₸ и в % уже на экране суммы (строка пересчёта) и полностью — на подтверждении.
2. **Курс всегда «за 1 г» в тенге.** На экране суммы — ориентировочный, на подтверждении — зафиксированный с таймером. На кнопке — итоговая сумма («Купить за 10 000 ₸»).
3. **Формула на виду.** «9 900 ₸ ÷ 61 875 ₸ = 0,1600 г» — пользователь может пересчитать сам.
4. **Риск сказан словами** на дашборде (compact), на подтверждении (full) и в кешбэке (сноска). Плашка не скрывается и не сворачивается на 03.
5. **Кто хранит.** Хранитель указан на подтверждении, на успехе и в блоке партнёров на дашборде.
6. **Без давления.** Никаких «успейте», «выгодно», процентов роста цены, бейджей «лучший курс».

---

## 8. Вход для кодера (`vibe-coder`)

Источник правды — Figma; эта спецификация — для чисел, логики и текстов. Если Figma расходится со спецификацией, побеждает Figma.

### 8.1 Фреймы к реализации

| Экран в коде | Фреймы-источники | Тип |
|---|---|---|
| Dashboard | 01, 01a, 01b, E4a | Экран с TabBar; состояния из данных |
| Buy Gold — Amount | 02, 02a, 02b, 02c, E1, E2 | Экран, состояния поля |
| Buy Gold — Confirm | 03, 03a, 03b | Экран с таймером |
| Buy Gold — Success | 04, 04b | Экран |
| Cashback — Choose | 05, 05a, 05b | Модальный экран |
| Quote changed | E3 | BottomSheet |
| Network error | E4 (+ состояние «Проверяем покупку» из раздела 6) | BottomSheet |
| Info sheets | S1, S2, S3 | BottomSheet |
| Coming soon | P1 | Экран-заглушка |

Технические фреймы 03c и 03d в код не переносятся — это копии 03a для прототипа. Переменные коллекции `Prototype` в код не переносятся.

### 8.2 Компоненты к реализации

`Button`, `AssetCard`, `PortfolioBar`, `QuoteTimer`, `FeeBreakdown` (+`FeeRow`), `RiskBanner`, `PresetChip`, `AmountInput`, `Keypad`, `RadioCard`, `PartnerRow`, `TabBar`, `NavBar`, `BottomSheet`, `Toast`, `ErrorState`, `Avatar`, `QuickAction`, `SectionHeader`, `CashbackCard`, `ListRow`, `Skeleton`. Варианты и свойства — раздел 3. Токены брать с теми же именами (`color/bg/primary`, `space/16`, `radius/16`, `type/headline`…), темы Light/Dark — по системной настройке.

### 8.3 Что интерактивно в прототипе (и должно работать в коде)

- Пресеты 1 000 / 5 000 / 10 000 ₸ пересчитывают граммы и комиссию.
- В коде дополнительно: ввод с `Keypad`, живой пересчёт, валидация min/баланс/лимит с приоритетом «лимит выше баланса».
- Таймер 30 с с переходом в warning на 10 с и в E3 на 0 с; повторная фиксация курса сбрасывает таймер.
- Кнопка «Купить» → loading → успех / E4.
- Выбор кешбэка (ничего не выбрано по умолчанию) → сохранение → дашборд с обновлённой карточкой кешбэка и toast.
- Скрытие балансов «глазом».
- Bottom sheets: открытие, закрытие свайпом и по scrim (кроме E3).
- Демо-сценарии ошибок: в коде нужен скрытый способ их включить (например, долгое нажатие на аватар открывает меню «Демо: нет денег / лимит / курс изменился / нет сети / офлайн»). Конкретная реализация — на усмотрение кодера.

### 8.4 Данные и правила

- Все моки — раздел 0. Никаких других чисел.
- Формулы и округление — раздел 0.2; форматирование — 0.6.
- Покупка идемпотентна: повторное нажатие «Купить» во время loading игнорируется; после таймаута без ответа повтор блокируется до выяснения статуса.
- Новый курс никогда не применяется без повторного подтверждения.
- Доли портфеля — целые проценты, в сумме 100% (метод наибольшего остатка, если округление даёт 99 или 101).

### 8.5 Аналитика (для гипотез PM)

Минимальный набор событий: `dashboard_view`, `buy_gold_open` (источник: quick action / asset card), `preset_tap` (сумма), `buy_continue`, `confirm_view`, `confirm_buy_tap`, `buy_success`, `quote_expired`, `quote_refresh_tap`, `quote_cancel`, `error_shown` (kind), `error_retry`, `cashback_view`, `cashback_select` (gold / kzt), `cashback_save`, `info_sheet_open` (S1 / S2 / S3).

---

## 9. Допущения и открытые вопросы для PM

1. **Курс золота 61 875 ₸ за 1 г** выбран так, чтобы все пресеты давали ровные граммы (0,0160 / 0,0800 / 0,1600 г). Новый курс в edge case 62 500 ₸ (+1%) — изменение специально заметное для демо; в жизни за 30 с оно меньше.
2. **Комиссия 1% включена в сумму**, минимальной комиссии нет. Если PM хочет комиссию сверху суммы или минимум в ₸ — пересчитать раздел 0.
3. **Оценка золота на дашборде — по курсу покупки** (одному курсу). В продукте честнее оценивать по цене продажи (обратного выкупа) — это вопрос к PM и партнёру.
4. **Остаток от округления граммов вниз.** В моках остатка нет. Для продакшена нужно решить, что делать с остатком меньше цены 0,0001 г (≈ 6 ₸): не списывать или зачислять граммы с большей точностью.
5. **Кешбэк** — 1% с покупок картой, начисление раз в месяц по курсу на день начисления, без комиссии. В брифе механика не задана, это предложение дизайна.
6. **Названия партнёров вымышленные** (Tau Gold Custody Ltd., Dala Digital Custody Ltd., Bereke Partner Bank) — плейсхолдеры до согласования реальных партнёров.
7. **Дневной лимит 200 000 ₸** и приоритет лимита над балансом — допущение дизайна.
8. В прототипе «Продолжить» с пресетов 1 000 и 5 000 ₸ ведёт на тот же `03 Confirm` с цифрами для 10 000 ₸ (чтобы не плодить фреймы). Отдельные Confirm/Success для 1 000 и 5 000 ₸ можно добавить копиями 03/04 с цифрами из таблицы 0.3; в коде всё считается из данных.
9. Состояние «вернулся с успеха на главную без выбора кешбэка» в прототипе показано через тот же 01a (карточка кешбэка в нём — gold-active, потому что основной демо-путь идёт через 05a). В коде карточка зависит от выбранного способа.
10. Крипта на дашборде представлена одним активом (USDT), покупка крипты в демо не проектируется.
