// Сайт-кейс JINA: история продакта от проблемы до выводов, с живым прототипом.
import type { ReactNode } from 'react';
import { Sun } from '../app/ui';

// Заполните перед публикацией
export const AUTHOR = { name: 'Ваше имя', role: 'Продакт-менеджер', linkedin: '', github: '' };

const Section = ({ id, title, lead, children, tone = 'light' }: { id: string; title: string; lead?: string; children: ReactNode; tone?: 'light' | 'white' }) => (
  <section id={id} className={tone === 'white' ? 'bg-surface' : ''}>
    <div className="mx-auto max-w-[1120px] px-5 py-20 md:px-10 md:py-28">
      <h2 className="max-w-[22ch] text-balance font-display text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[44px]">{title}</h2>
      {lead && <p className="mt-5 max-w-[62ch] text-[18px] leading-relaxed text-muted">{lead}</p>}
      <div className="mt-12">{children}</div>
    </div>
  </section>
);

const Shot = ({ src, alt, className = '' }: { src: string; alt: string; className?: string }) => (
  <img src={src} alt={alt} loading="lazy" width={390} height={844}
    className={`w-full max-w-[300px] rounded-[36px] shadow-[0_0_0_6px_var(--ink),0_24px_60px_-24px_rgba(11,37,64,.5)] ${className}`} />
);

function Phone() {
  return (
    <div className="relative mx-auto h-[704px] w-[325px] shrink-0">
      <div className="absolute inset-0 overflow-hidden rounded-[44px] bg-paper shadow-[0_0_0_9px_#fff2,0_0_0_10px_rgba(255,255,255,.25),0_40px_90px_-30px_rgba(0,0,0,.6)]">
        <iframe src="/app.html" title="Живой прототип JINA" className="h-[844px] w-[390px] origin-top-left scale-[0.8333] border-0" />
      </div>
    </div>
  );
}

const PIVOTS = [
  ['Кешбэк 1% со всех покупок', 'Убыточно: банк отдаёт 1%, а получает около 0,5% interchange', '0,5% с потолком 2 000 ₸ + 2% у партнёров-магазинов за их счёт'],
  ['Каждое начисление — запись в блокчейне', 'Сетевая комиссия больше самого кешбэка в 0,8–31 раз', 'Граммы учитываются внутри системы, токен выводится от 1 г'],
  ['Бейдж «Без комиссии»', 'Скрывал разницу курсов: купить и сразу продать стоит около 2%', 'Курсы покупки и продажи всегда рядом, сумма при продаже — до покупки'],
  ['Золото на главной по цене покупки', 'Завышало стоимость сразу после сделки', 'Оценка по цене продажи, разбивка «доступно» и «оценка»'],
];

const HYP = [
  ['H1', 'Онбординг про хранение, цену и риск повышает доверие и не мешает активации', 'Не проверена', 'Экран знакомства, время до первого пополнения в метриках демо'],
  ['H2', 'Порог 1 000 ₸ и цель «1 грамм» снимают барьер первой покупки', 'Не проверена', 'Пресеты от 1 000 ₸, солнце с отметками 0,1 / 0,25 / 0,5 г'],
  ['H3', 'Полный расчёт до покупки повышает понимание', 'Частичный сигнал', 'Урок 1 спрашивает «сколько получите при продаже» и считает верные ответы'],
  ['H4', 'Кешбэк граммами интересен значимой части аудитории', 'Сигнал «за»', 'Две равные карточки без выбора по умолчанию, порядок можно менять'],
  ['H6', 'Понятное «Курс обновился» не подрывает доверие', 'Не проверена', 'Было / стало, ничего не списывается без нового подтверждения'],
  ['H7', 'Видимая цена выхода снимает страх «ловушки»', 'Не проверена', 'Продажа в тенге за два шага, комиссия 0 ₸'],
];

const STEPS = [
  ['Бриф BCC', 'Самостоятельный необанк: тенге, золото, кешбэк в граммах, партнёры МФЦА'],
  ['Стратегия', 'ИИ-агент «продакт» собрал сегменты, сценарий, бизнес-модель и метрики'],
  ['Ревью CFO', 'Агент «финансовый критик» нашёл убыточный кешбэк и скрытый спред, предложил пивоты'],
  ['ТЗ и прототип', 'Расчёты сначала, с тестами: деньги в целых тенге, золото в микрограммах'],
  ['Опрос', 'Быстрый Telegram-опрос: первые реальные сигналы вместо придуманных цифр'],
  ['Защита', 'Не прошли: сценарий и экономика были сильнее, чем интерфейс'],
  ['JINA v3', 'Фокус на 18–24, новый визуальный язык, уроки внутри продукта'],
];

export function Site() {
  return (
    <div className="bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[rgba(11,37,64,.96)] text-white backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-6 px-5 md:px-10" aria-label="Разделы кейса">
          <a href="#top" className="font-display text-[20px] font-semibold tracking-[-0.02em]">JINA</a>
          <div className="hidden gap-7 text-[15px] text-white/75 md:flex">
            <a href="#problem" className="hover:text-white">Проблема</a><a href="#research" className="hover:text-white">Исследование</a>
            <a href="#product" className="hover:text-white">Решения</a><a href="#economics" className="hover:text-white">Экономика</a><a href="#lessons" className="hover:text-white">Выводы</a>
          </div>
          <a href="/app.html" className="rounded-full bg-sun px-4 py-2 text-[15px] font-semibold text-ink">Открыть прототип</a>
        </nav>
      </header>

      {/* Герой: живой прототип */}
      <section id="top" className="overflow-hidden bg-ink text-white">
        <div className="mx-auto grid max-w-[1120px] items-center gap-14 px-5 pb-20 pt-14 md:grid-cols-[1fr_auto] md:px-10 md:pb-24 md:pt-20">
          <div>
            <p className="text-[16px] text-white/65">Кейс продакт-менеджера · BCC Future Talent</p>
            <h1 className="mt-5 max-w-[16ch] font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.025em] md:text-[64px]">Как научить <span className="whitespace-nowrap">18–24</span> копить и не превратить это в казино</h1>
            <p className="mt-7 max-w-[52ch] text-[19px] leading-relaxed text-white/75">
              JINA — от казахского «жинау», копить. Первые накопления от 1 000 ₸ в тенге и граммах золота, честная цена выхода до покупки
              и короткие уроки о том, как устроены деньги.
            </p>
            <dl className="mt-10 grid max-w-[560px] grid-cols-2 gap-x-8 gap-y-5 text-[15px]">
              <div><dt className="text-white/55">Роль</dt><dd className="mt-1">{AUTHOR.role}</dd></div>
              <div><dt className="text-white/55">Контекст</dt><dd className="mt-1">Хакатон, кейс «Крипто-необанк»</dd></div>
              <div><dt className="text-white/55">Срок</dt><dd className="mt-1">1 день хакатона + доработка</dd></div>
              <div><dt className="text-white/55">Что сделано</dt><dd className="mt-1">Стратегия, экономика, прототип, 27 автотестов</dd></div>
            </dl>
            <a href="/app.html" className="mt-10 inline-flex min-h-[52px] items-center rounded-full bg-white px-6 text-[16px] font-semibold text-ink md:hidden">Открыть прототип</a>
          </div>
          <div className="hidden md:block"><Phone /></div>
        </div>
      </section>

      <Section id="problem" title="Деньги разбросаны, а инвестиции выглядят как казино"
        lead="Тенге в банке, крипта на бирже, золото у брокера. В каждом приложении по-своему показаны цена, комиссии и хранение — и никто не отвечает на простой вопрос: сколько я получу, если продам прямо сейчас?">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            ['Нет привычки откладывать', 'У студентов и тех, кто только начал работать, суммы маленькие, а финансовые продукты рассчитаны на тех, у кого уже есть капитал.'],
            ['Скрытая цена выхода', 'Комиссия видна, а разница курсов покупки и продажи — нет. Человек узнаёт о ней, только когда продаёт.'],
            ['Интерфейсы бирж пугают', 'Свечи, стаканы и кнопка «Trade» отталкивают тех, кто хочет просто понемногу откладывать.'],
          ].map(([t, d]) => (
            <div key={t}><h3 className="text-[20px] font-semibold">{t}</h3><p className="mt-3 text-[16px] leading-relaxed text-muted">{d}</p></div>
          ))}
        </div>
      </Section>

      <Section id="audience" tone="white" title="Почему только 18⁠–⁠24"
        lead="На хакатоне мы делали продукт сразу для трёх сегментов — и предложение получилось размытым. В v3 оставили один.">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-5 text-[17px] leading-relaxed">
            <p>У 18–24 самая острая проблема: нет привычки откладывать, суммы маленькие, а инвестиции выглядят либо скучно, либо как азартная игра.</p>
            <p>Исследование показало, что у BCC уже есть металлический счёт от 1 грамма. Значит, отличие не в самом золоте, а в <b>малом первом шаге</b>, <b>честной цене выхода</b> и <b>обучении внутри действий</b>.</p>
          </div>
          <div className="rounded-hero bg-ink p-8 text-white">
            <p className="text-[15px] text-white/60">Герой сценария</p>
            <p className="mt-3 font-display text-[26px] font-semibold leading-tight">Даурен, 20 лет</p>
            <p className="mt-3 text-[16px] leading-relaxed text-white/75">Студент с подработкой, тратит около 79 000 ₸ в месяц картой. Хочет начать откладывать, но не понимает, с чего, и боится потерять деньги.</p>
          </div>
        </div>
      </Section>

      <Section id="research" title="Первые реальные сигналы"
        lead="Быстрый опрос в Telegram, 7 ноября. Выборка удобная и не репрезентативная, можно было выбрать несколько вариантов — это сигнал, а не доказательство.">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-hero bg-surface p-8">
            <p className="text-[16px] font-medium">Выбрали бы кешбэк в цифровом золоте</p>
            <p className="tnum mt-4 font-display text-[48px] font-semibold leading-none md:text-[64px] text-sun-ink">24 из 36</p>
            <p className="mt-4 text-[15px] text-muted">13 из 36 — обычный кешбэк в тенге. Риск золота в вопросе не объяснялся.</p>
          </div>
          <div className="rounded-hero bg-surface p-8">
            <p className="text-[16px] font-medium">Доверяют, когда комиссия и риски показаны честно и крупно</p>
            <p className="tnum mt-4 font-display text-[48px] font-semibold leading-none md:text-[64px] text-sky-ink">26 из 34</p>
            <p className="mt-4 text-[15px] text-muted">Но 12 из 34 насторожатся даже при честном раскрытии. Поэтому риск объясняем простыми словами, а сумму при продаже показываем сразу.</p>
          </div>
        </div>
        <ul className="mt-12 grid gap-8 text-[16px] leading-relaxed md:grid-cols-3">
          <li><b>У BCC уже есть металлический счёт от 1 г.</b> <span className="text-muted">Новизна должна быть в опыте, а не в золоте.</span></li>
          <li><b>С 1 мая 2026 расширился национальный режим цифровых активов.</b> <span className="text-muted">Регуляторная модель — гипотеза для юристов, а не факт.</span></li>
          <li><b>Понятные предупреждения улучшают понимание риска</b> <span className="text-muted">(эксперименты FCA). Это поддерживает принцип прозрачности, но не доказывает конверсию.</span></li>
        </ul>
      </Section>

      <Section id="product" tone="white" title="Что мы построили и почему">
        <div className="space-y-24">
          {[
            ['/case/new-confirm.png', 'Цена выхода — до покупки', 'Перед покупкой видно всё: 10 000 ₸ → комиссия 100 ₸ → 0,1600 г, и главное — если продать сразу, получите около 9 800 ₸. Курс держится 30 секунд; если он изменился, показываем «было / стало» и ничего не списываем без нового подтверждения.'],
            ['/case/new-success.png', 'Солнце вместо стриков', 'Вместо конфетти и серий дней — одна цель: первый грамм. Золотой диск с 32 лучами, как на флаге; после покупки новые лучи загораются по одному. Цель поощряет регулярность, а не частоту сделок.'],
            ['/case/new-lesson.png', 'Учёба с проверкой понимания', 'Пять коротких уроков: курс покупки и продажи, подушка, золото, акции и фонды, крипта. В конце каждого — один вопрос. Первый урок измеряет гипотезу H3 прямо в продукте: понимает ли человек, сколько получит при продаже.'],
            ['/case/new-gold.png', 'Золото без биржевого шума', 'Никаких свечей и стаканов. Граммы, оценка по цене продажи, оба курса рядом и путь к 1 грамму с отметками 0,1 / 0,25 / 0,5 г. График недели подписан: синтетические данные, не прогноз.'],
          ].map(([src, t, d], i) => (
            <div key={t} className={`flex flex-col items-center gap-10 md:flex-row md:gap-20 ${i % 2 ? 'md:flex-row-reverse' : ''}`}>
              <Shot src={src} alt={t} />
              <div className="max-w-[48ch]"><h3 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.01em]">{t}</h3><p className="mt-4 text-[17px] leading-relaxed text-muted">{d}</p></div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="economics" title="Экономика: что поменял финансовый критик"
        lead="Отдельный ИИ-агент в роли CFO и риск-менеджера разобрал первую версию стратегии. На каждую уязвимость — пивот, а не отказ от идеи.">
        <div className="overflow-x-auto rounded-hero bg-surface">
          <table className="w-full min-w-[720px] text-left text-[15px]">
            <thead><tr className="border-b border-line text-muted"><th className="px-6 py-4 font-medium">Было</th><th className="px-6 py-4 font-medium">Проблема</th><th className="px-6 py-4 font-medium">Стало</th></tr></thead>
            <tbody>{PIVOTS.map(([a, b, c]) => (
              <tr key={a} className="border-b border-line last:border-0"><td className="px-6 py-5 align-top">{a}</td><td className="px-6 py-5 align-top text-muted">{b}</td><td className="px-6 py-5 align-top font-medium">{c}</td></tr>
            ))}</tbody>
          </table>
        </div>
        <div className="mt-14 grid items-center gap-10 md:grid-cols-[1fr_1.1fr]">
          <div>
            <h3 className="text-[20px] font-semibold">Вклад одного пользователя 18–24 в месяц</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">Выручка: комиссия 1%, доля спреда, interchange по карте, плата мерчантов, остатки в тенге. Минус кешбэк, хранение и поддержка. При низком interchange модель уходит в минус — поэтому первое, что нужно до пилота, это тарифы банка.</p>
          </div>
          <div className="space-y-4 rounded-hero bg-surface p-7">
            {[['Базовый сценарий', 490, 'interchange 1%'], ['Консервативный', 93, 'interchange 0,5%'], ['Стресс-тест', -65, '0,5% и процессинг 0,2%']].map(([l, v, n]) => (
              <div key={l as string}>
                <div className="flex justify-between text-[15px]"><span>{l} <span className="text-muted">— {n}</span></span><span className="tnum font-semibold">{(v as number) > 0 ? '+' : '−'}{Math.abs(v as number)}&nbsp;₸</span></div>
                <div className="mt-2 h-2.5 rounded-full bg-mist"><div className="h-full rounded-full" style={{ width: `${(Math.abs(v as number) / 490) * 100}%`, background: (v as number) < 0 ? 'var(--danger)' : 'var(--sky)' }} /></div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="hypotheses" tone="white" title="Гипотезы — честно"
        lead="Ни одна гипотеза пока не доказана. Это цели для пилота; по двум есть первые сигналы. В прототипе каждая гипотеза привязана к экрану и событию в метриках демо.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[15px]">
            <tbody>{HYP.map(([id, h, st, how]) => (
              <tr key={id} className="border-b border-line">
                <td className="py-5 pr-4 align-top font-display font-semibold text-sky-ink">{id}</td>
                <td className="py-5 pr-6 align-top">{h}</td>
                <td className="py-5 pr-6 align-top"><span className={`whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-medium ${st === 'Не проверена' ? 'bg-mist text-muted' : 'bg-sun-soft text-sun-ink'}`}>{st}</span></td>
                <td className="py-5 align-top text-muted">{how}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Section>

      <Section id="process" title="Как работали"
        lead="Документы раньше кода: бриф → стратегия → ревью → ТЗ → прототип. У каждого документа свой уровень приоритета, а расхождения записываются, а не выбираются молча.">
        <ol className="grid gap-x-10 gap-y-8 md:grid-cols-2">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="flex gap-5">
              <span className="tnum flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-display text-[15px] font-semibold text-white">{i + 1}</span>
              <div><h3 className="text-[18px] font-semibold">{t}</h3><p className="mt-1 text-[16px] leading-relaxed text-muted">{d}</p></div>
            </li>
          ))}
        </ol>
        <p className="mt-12 max-w-[62ch] text-[16px] leading-relaxed text-muted">Инструменты: Claude Code и четыре ИИ-агента с отдельными ролями, React + TypeScript + Tailwind, Vitest, Figma, Canva. Деньги в коде — целые тенге и микрограммы золота, двойное нажатие не создаёт второе списание.</p>
      </Section>

      <Section id="lessons" tone="white" title="Что не сработало и что я вынес">
        <div className="grid items-end gap-10 md:grid-cols-2">
          <figure className="flex flex-col items-center gap-4"><Shot src="/case/old-home.png" alt="Главная на хакатоне" className="opacity-90" /><figcaption className="text-[15px] text-muted">На хакатоне: верно по цифрам, но выглядело как таблица</figcaption></figure>
          <figure className="flex flex-col items-center gap-4"><Shot src="/case/new-home.png" alt="Главная JINA v3" /><figcaption className="text-[15px] text-muted">JINA v3: один главный образ, остальное — тихо</figcaption></figure>
        </div>
        <ul className="mt-16 grid gap-10 md:grid-cols-3">
          {[
            ['Интерфейс — тоже аргумент', 'Мы проиграли не на экономике, а на впечатлении. Жюри видит экран раньше, чем таблицу с unit-экономикой.'],
            ['Один сегмент лучше трёх', 'Три аудитории дали три полуответа. Фокус на 18–24 сразу подсказал, что строить: малый шаг, цель и обучение.'],
            ['Честность масштабируется', 'Сигнал с оговоркой выдерживает любой вопрос жюри. Придуманная цифра — нет.'],
          ].map(([t, d]) => (
            <li key={t}><h3 className="text-[20px] font-semibold">{t}</h3><p className="mt-3 text-[16px] leading-relaxed text-muted">{d}</p></li>
          ))}
        </ul>
      </Section>

      <footer className="bg-ink text-white">
        <div className="mx-auto flex max-w-[1120px] flex-col items-start gap-10 px-5 py-20 md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex items-center gap-6">
            <Sun progress={0.16} size={96} />
            <div>
              <p className="font-display text-[26px] font-semibold leading-tight">Попробуйте сами</p>
              <p className="mt-2 max-w-[40ch] text-[16px] text-white/70">Прототип работает в браузере, без регистрации. Деньги и данные тестовые.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/app.html" className="inline-flex min-h-[52px] items-center rounded-full bg-sun px-6 text-[16px] font-semibold text-ink">Открыть прототип</a>
            {AUTHOR.github && <a href={AUTHOR.github} className="inline-flex min-h-[52px] items-center rounded-full bg-white/10 px-6 text-[16px] font-semibold">Код на GitHub</a>}
            {AUTHOR.linkedin && <a href={AUTHOR.linkedin} className="inline-flex min-h-[52px] items-center rounded-full bg-white/10 px-6 text-[16px] font-semibold">LinkedIn</a>}
          </div>
        </div>
        <p className="mx-auto max-w-[1120px] px-5 pb-10 text-[13px] text-white/50 md:px-10">{AUTHOR.name} · Кейс выполнен на хакатоне BCC Future Talent; бренд и данные демонстрационные, не является предложением банка. Цены, партнёры и метрики синтетические, кроме результатов опроса.</p>
      </footer>
    </div>
  );
}
