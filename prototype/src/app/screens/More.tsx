// Профиль, кешбэк, партнёр, история, метрики демо, общие шторки, демо-панель.
import { useEffect, useState, type ReactNode } from 'react';
import { Button, Display, Group, Icon, KV, PricePair, Row, Sheet, TopBar, cx } from '../ui';
import { CASHBACK, CUSTODY, FEE_BUY_BP, GOLD, PARTNERS, PROFILES, UPDATED_AT, type PartnerDef } from '../../mocks/data';
import { cashbackMonth, cashbackToGold, quoteBuy, UG_PER_G } from '../../lib/calc';
import { grams, kzt, qty } from '../../lib/format';
import { partnerValue } from '../../lib/derived';
import { netDelay, type E1Mode } from '../../lib/quotes';
import { clearEvents, getEvents, track } from '../../lib/events';
import { funnel, goldChoice, timeToFundedHome } from '../../lib/metrics';
import { LESSONS } from '../lessons';
import { useStore } from '../store';

/* ---------- Профиль ---------- */
export function Me() {
  const { s, d } = useStore();
  const p = PROFILES[s.profileId];
  return (
    <div className="flex flex-col gap-5 px-4 pb-8 pt-[max(14px,env(safe-area-inset-top))]">
      <header className="flex items-center gap-4 px-1 pt-2">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky font-display text-[20px] font-semibold text-white">{p.name[0]}</span>
        <div><Display className="text-[22px]">{p.name}, {p.age}</Display><div className="mt-1 text-[14px] text-muted">{p.about}</div></div>
      </header>
      <Group>
        <Row icon={<Icon name="gift" />} accent="sun" label="Кешбэк" sub={s.cashbackMode ? (s.cashbackMode === 'gold' ? 'Граммами золота' : 'В тенге') : 'Не выбран'} onClick={() => d({ type: 'NAV', to: 'cashback' })} />
        <Row icon={<Icon name="link" />} label="Кошельки бирж" sub={`Подключено: ${Object.keys(s.partners).length}`} onClick={() => d({ type: 'NAV', to: 'partner' })} />
        <Row icon={<Icon name="list" />} label="История операций" onClick={() => d({ type: 'NAV', to: 'history' })} />
        <Row icon={<Icon name="shield" />} label="Кто хранит ваши активы" onClick={() => d({ type: 'SHEET', sheet: 'custody' })} />
      </Group>
      <Group>
        <Row icon={<Icon name="chart" />} accent="sky" label="Метрики демо" sub="Воронка этой сессии, не исследование" onClick={() => d({ type: 'NAV', to: 'metrics' })} />
        <Row label="Демо-панель" sub="Сценарии и ошибки для показа" onClick={() => d({ type: 'DEMO_OPEN', open: true })} />
        <Row label="Начать демо заново" onClick={() => { clearEvents(); d({ type: 'RESET' }); }} />
      </Group>
      <p className="px-1 text-[12px] leading-snug text-muted">Синтетические данные для демо: деньги, котировки и партнёры тестовые. Никаких личных данных, ключей и seed-фраз.</p>
    </div>
  );
}

/* ---------- Кешбэк ---------- */
export function Cashback() {
  const { s, d } = useStore();
  const p = PROFILES[s.profileId];
  const [sel, setSel] = useState<'kzt' | 'gold' | null>(s.cashbackMode);
  const [loading, setLoading] = useState(false);
  const m = cashbackMonth(p.spend, p.merchantSpend, CASHBACK);
  const g = cashbackToGold(m.total, GOLD.ask, GOLD.bid);
  useEffect(() => { track('cashback_choice_shown', { order: s.demo.shuffleCashback ? 'gold_first' : 'kzt_first' }); }, [s.demo.shuffleCashback]);
  const save = async () => {
    if (!sel) return;
    setLoading(true); await netDelay();
    d({ type: 'SET_CASHBACK', mode: sel });
    track('cashback_choice_saved', { mode: sel });
    d({ type: 'TOAST', text: sel === 'gold' ? 'Кешбэк будет приходить граммами' : 'Кешбэк будет приходить в тенге' });
    setLoading(false);
    const partnerLeft = PARTNERS.some((x) => !s.partners[x.id] && p.offer[x.id]?.length);
    d({ type: 'NAV', to: partnerLeft ? 'partner' : 'home', replace: true });
  };
  const Option = ({ id, title, children }: { id: 'kzt' | 'gold'; title: string; children: ReactNode }) => (
    <button type="button" role="radio" aria-checked={sel === id} onClick={() => setSel(id)}
      className={cx('w-full rounded-[20px] bg-surface p-4 text-left transition-shadow', sel === id ? 'shadow-[inset_0_0_0_2px_var(--ink)]' : 'shadow-[inset_0_0_0_1px_var(--line)]')}>
      <div className="flex items-center justify-between"><span className="text-[17px] font-semibold">{title}</span>
        <span className={cx('flex h-6 w-6 items-center justify-center rounded-full', sel === id ? 'bg-ink' : 'shadow-[inset_0_0_0_2px_var(--line)]')}>{sel === id && <span className="h-2.5 w-2.5 rounded-full bg-white" />}</span></div>
      <div className="mt-2 text-[14px] leading-snug text-muted">{children}</div>
    </button>
  );
  const cards = [
    <Option key="kzt" id="kzt" title="В тенге">За месяц трат как у вас — <span className="tnum font-semibold text-ink">{kzt(m.total)}</span> на счёт.</Option>,
    <Option key="gold" id="gold" title="Граммами золота">За месяц трат как у вас — <span className="tnum font-semibold text-ink">{kzt(m.total)} → {grams(g.ug)}</span>, если продать сразу ≈ {kzt(g.sellNow)}. Цена золота может снижаться.</Option>,
  ];
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Кешбэк" onBack={() => d({ type: 'BACK' })} />
      <div className="scroll-area flex flex-1 flex-col gap-4 px-4 pb-4">
        <div className="px-1"><Display className="text-[24px] leading-tight">Как получать кешбэк?</Display>
          <p className="mt-2 text-[15px] text-muted">Условия одинаковые, выбор можно поменять в любой момент.</p></div>
        <div className="flex flex-col gap-3" role="radiogroup" aria-label="Способ кешбэка">{s.demo.shuffleCashback ? [cards[1], cards[0]] : cards}</div>
        <ul className="flex flex-col gap-1.5 px-1 text-[13px] leading-snug text-muted">
          <li>0,5% с покупок картой, не больше {kzt(CASHBACK.cap)} в месяц; +2% у партнёров-магазинов за их счёт</li>
          <li>Зачисление в первый рабочий день месяца, следующее — {CASHBACK.nextCredit}</li>
          <li>Граммы по курсу покупки. Комиссия 1% не берётся, но действует разница курсов покупки и продажи</li>
        </ul>
      </div>
      <div className="px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-2"><Button disabled={!sel} loading={loading} onClick={save}>Сохранить</Button></div>
    </div>
  );
}

/* ---------- Партнёр: выбор → согласие → подключено ---------- */
export function PartnerConnect() {
  const { s, d } = useStore();
  const p = PROFILES[s.profileId];
  const [step, setStep] = useState<'list' | 'consent' | 'done'>('list');
  const [partner, setPartner] = useState<PartnerDef | null>(null);
  const [loading, setLoading] = useState(false);
  const holdings = partner ? p.offer[partner.id] ?? [] : [];
  const allow = async () => {
    if (!partner) return;
    setLoading(true); await netDelay(900);
    d({ type: 'CONNECT_PARTNER', id: partner.id });
    track('partner_sync_succeeded', { partner: partner.id });
    setLoading(false); setStep('done');
  };
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Кошельки бирж" onBack={() => (step === 'consent' ? setStep('list') : d({ type: 'BACK' }))} />
      <div className="scroll-area flex flex-1 flex-col gap-4 px-4 pb-4">
        {step === 'list' && (<>
          <p className="px-1 text-[15px] text-muted">Если у вас уже есть крипта на бирже-партнёре, её баланс можно видеть в общем обзоре. Только просмотр.</p>
          <Group>{PARTNERS.map((x) => {
            const connected = !!s.partners[x.id]; const avail = !!p.offer[x.id]?.length;
            return <Row key={x.id} icon={<Icon name="link" />} label={x.name} sub={connected ? 'Подключено' : avail ? x.note : 'В этом профиле кошелька нет'}
              onClick={connected || !avail ? undefined : () => { setPartner(x); setStep('consent'); track('partner_consent_started', { partner: x.id }); }} />;
          })}</Group>
        </>)}
        {step === 'consent' && partner && (<>
          <Display className="px-1 text-[22px] leading-tight">Разрешить просмотр баланса {partner.name}?</Display>
          <div className="rounded-[20px] bg-surface px-4 py-2">
            <KV label="Что увидим" value="балансы" /><KV label="Чего не сможем" value="торговать и выводить" /><KV label="Как отозвать" value="в профиле, в любой момент" />
          </div>
          <p className="px-1 text-[13px] text-muted">Ключи, пароли и seed-фразы не нужны. Подключение в демо имитируется.</p>
        </>)}
        {step === 'done' && partner && (
          <div className="pt-8 text-center">
            <div className="text-[14px] text-muted">{partner.name} подключена</div>
            <Display className="mt-3 text-[34px]">{holdings.map((h) => `${qty(h.qtyMinor, h.decimals)} ${h.asset}`).join(' · ')}</Display>
            <div className="tnum mt-2 text-[15px] text-muted">≈ {kzt(partnerValue(holdings))}, ориентировочно · обновлено {UPDATED_AT}</div>
            <p className="mx-auto mt-5 max-w-[32ch] text-[13px] text-muted">Только просмотр: эти активы нельзя потратить из JINA. У партнёра цена может отличаться.</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-2">
        {step === 'consent' && <><Button loading={loading} onClick={allow}>Разрешить просмотр (демо)</Button><Button variant="ghost" onClick={() => setStep('list')}>Отмена</Button></>}
        {step === 'done' && <Button onClick={() => d({ type: 'NAV', to: 'home' })}>На главную</Button>}
      </div>
    </div>
  );
}

/* ---------- История ---------- */
const dt = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
export function History() {
  const { s, d } = useStore();
  const ops = [...s.ledger.ops].reverse();
  return (
    <div className="flex h-full flex-col">
      <TopBar title="История операций" onBack={() => d({ type: 'BACK' })} />
      <div className="scroll-area flex-1 px-4 pb-6">
        {ops.length === 0 ? <p className="pt-10 text-center text-[15px] text-muted">Пока пусто. Здесь появятся пополнения, покупки и продажи.</p> : (
          <Group>{ops.map((op) => {
            const pending = op.status === 'pending';
            const t = op.kind === 'topup' ? { l: 'Пополнение', v: `+${kzt(op.amount)}`, sub: 'Тестовый баланс' }
              : op.kind === 'buy' ? { l: 'Покупка золота', v: `−${kzt(op.amount)}`, sub: `+${grams(op.ug ?? 0)} по ${kzt(op.ask ?? 0)}/г` }
              : { l: 'Продажа золота', v: `+${kzt(op.amount)}`, sub: `−${grams(op.ug ?? 0)} по ${kzt(op.bid ?? 0)}/г` };
            return <Row key={op.id} icon={<Icon name={op.kind === 'sell' ? 'arrowUp' : op.kind === 'buy' ? 'arrowDown' : 'plus'} />} accent={op.kind === 'topup' ? 'sky' : 'sun'}
              label={t.l} sub={`${t.sub} · ${pending ? 'проверяем статус' : dt.format(op.ts)}`} value={<span className={pending ? 'text-muted' : ''}>{t.v}</span>} />;
          })}</Group>
        )}
        <p className="px-1 pt-3 text-[12px] text-muted">Синтетические данные. Операции хранятся только в этом браузере.</p>
      </div>
    </div>
  );
}

/* ---------- Метрики демо ---------- */
export function Metrics() {
  const { d } = useStore();
  const [ev, setEv] = useState(() => [...getEvents()]);
  const rows = funnel(ev);
  const ttv = timeToFundedHome(ev);
  const choice = goldChoice(ev);
  const quiz = ev.filter((e) => e.name === 'quiz_answered' && e.lesson === 'spread');
  const quizOk = quiz.filter((e) => e.correct).length;
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Метрики демо" onBack={() => d({ type: 'BACK' })} />
      <div className="scroll-area flex flex-1 flex-col gap-4 px-4 pb-6">
        <p className="rounded-field bg-warn-soft px-4 py-3 text-[14px] font-medium leading-snug">Демо-сессия, не исследование. Только события этого прохода. «Цель» — порог гипотезы, а не результат.</p>
        <Group>
          {rows.map((r) => (
            <div key={r.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3 text-[15px]"><span><b className="mr-1.5 text-[12px] text-sky-ink">{r.hypothesis}</b>{r.title}</span>
                <span className="tnum shrink-0 font-semibold">{r.fromCount ? `${r.toCount} из ${r.fromCount}` : '—'}</span></div>
              <div className="mt-0.5 text-[12px] text-muted">Цель: {r.target}</div>
            </div>
          ))}
          <div className="px-4 py-3"><div className="flex justify-between gap-3 text-[15px]"><span><b className="mr-1.5 text-[12px] text-sky-ink">H3</b>Урок 1: верно назвали сумму при продаже</span>
            <span className="tnum font-semibold">{quiz.length ? `${quizOk} из ${quiz.length}` : '—'}</span></div><div className="mt-0.5 text-[12px] text-muted">Цель: ≥ 70% отвечают верно</div></div>
          <div className="px-4 py-3"><div className="flex justify-between gap-3 text-[15px]"><span><b className="mr-1.5 text-[12px] text-sky-ink">H1</b>Время до главной с балансом</span>
            <span className="tnum font-semibold">{ttv === null ? '—' : `${Math.floor(ttv / 60)} мин ${ttv % 60} с`}</span></div><div className="mt-0.5 text-[12px] text-muted">Цель: меньше 3 минут</div></div>
          <div className="px-4 py-3"><div className="flex justify-between gap-3 text-[15px]"><span><b className="mr-1.5 text-[12px] text-sky-ink">H4</b>Выбор кешбэка</span>
            <span className="font-semibold">{choice === 'gold' ? 'Золото' : choice === 'kzt' ? 'Тенге' : '—'}</span></div><div className="mt-0.5 text-[12px] text-muted">Цель: золото ≥ 40%, ниже 15% — пересмотр</div></div>
        </Group>
        <p className="px-1 text-[13px] text-muted">Возвраты D7/D30 и повторные покупки из одного демо не измерить — только в пилоте.</p>
        <Button variant="secondary" onClick={() => { clearEvents(); setEv([]); }}>Очистить лог</Button>
      </div>
    </div>
  );
}

/* ---------- Общие шторки ---------- */
export function Sheets() {
  const { s, d } = useStore();
  const close = () => d({ type: 'SHEET', sheet: null });
  const ex = quoteBuy(10_000, GOLD.ask, GOLD.bid, FEE_BUY_BP);
  const breakeven = Math.ceil((ex.amount * UG_PER_G) / ex.ug);
  const pct = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(((breakeven - GOLD.bid) / GOLD.bid) * 100);
  const Block = ({ t, children }: { t: string; children: ReactNode }) => <div className="rounded-[20px] bg-surface p-4"><div className="font-semibold">{t}</div><p className="mt-1 text-[14px] leading-snug text-muted">{children}</p></div>;
  return (<>
    <Sheet open={s.sheet === 'custody'} onClose={close} title="Кто хранит ваши активы">
      <div className="flex flex-col gap-2.5">
        <Block t="Тенге">На счёте в {CUSTODY.kzt}. Это деньги для трат и покупок.</Block>
        <Block t="Золото">Граммы учтены на вашем счёте в JINA, металл хранит {CUSTODY.gold}. Продать можно в любой момент по курсу продажи.</Block>
        <Block t="Кошельки бирж">Только просмотр: мы видим баланс, но не можем торговать, переводить или выводить.</Block>
        <p className="px-1 text-[12px] text-muted">Названия партнёров условные. Регуляторная модель — гипотеза для отдельной проверки.</p>
        <Button variant="secondary" onClick={close}>Понятно</Button>
      </div>
    </Sheet>
    <Sheet open={s.sheet === 'pricing'} onClose={close} title="Как считается цена">
      <div className="flex flex-col gap-3">
        <p className="text-[15px] text-muted">Покупаете по курсу покупки, продаёте по курсу продажи — он ниже. Плюс комиссия 1% при покупке, уже внутри суммы.</p>
        <PricePair ask={GOLD.ask} bid={GOLD.bid} />
        <div className="rounded-[20px] bg-surface px-4 py-2">
          <KV label="Спишем" value={kzt(ex.amount)} /><KV label="Комиссия 1%" value={kzt(ex.fee)} /><KV label="На золото" value={kzt(ex.net)} />
          <KV label="Получите" value={<span className="text-sun-ink">{grams(ex.ug)}</span>} /><KV label="Если продать сразу" value={`≈ ${kzt(ex.sellNow)}`} strong />
        </div>
        <p className="rounded-field bg-mist px-4 py-3 text-[14px]">Чтобы вернуть 10 000 ₸, курс продажи должен быть не ниже <b className="tnum">{kzt(breakeven)}</b> — на {pct}% выше сегодняшнего. Это иллюстрация расчёта, а не прогноз.</p>
        <Button variant="secondary" onClick={close}>Понятно</Button>
      </div>
    </Sheet>
  </>);
}

/* ---------- Демо-панель ---------- */
export function DemoPanel() {
  const { s, d } = useStore();
  const close = () => d({ type: 'DEMO_OPEN', open: false });
  const Chip = ({ on, onClick, children }: { on?: boolean; onClick: () => void; children: ReactNode }) => (
    <button type="button" onClick={onClick} aria-pressed={on} className={cx('min-h-[44px] rounded-full px-3.5 text-[14px]', on ? 'bg-ink text-white' : 'bg-surface shadow-[inset_0_0_0_1px_var(--line)]')}>{children}</button>
  );
  const G = ({ t, children }: { t: string; children: ReactNode }) => <div><div className="mb-2 text-[13px] font-semibold text-muted">{t}</div><div className="flex flex-wrap gap-2">{children}</div></div>;
  return (
    <Sheet open={s.demoOpen} onClose={close} title="Демо-панель">
      <div className="flex flex-col gap-4 pb-2">
        <G t="Сценарий">
          <Chip onClick={() => { clearEvents(); d({ type: 'RESET', onboarded: false }); }}>С онбординга</Chip>
          <Chip onClick={() => d({ type: 'LOAD_FINAL' })}>Итог сценария</Chip>
          <Chip onClick={() => { close(); d({ type: 'NAV', to: 'metrics' }); }}>Метрики</Chip>
        </G>
        <G t="Курс при истечении котировки">
          {(['off', 'up', 'down'] as E1Mode[]).map((m) => <Chip key={m} on={s.demo.e1 === m} onClick={() => d({ type: 'DEMO', patch: { e1: m } })}>{m === 'off' ? 'Без изменений' : m === 'up' ? 'Вверх' : 'Вниз'}</Chip>)}
          <Chip onClick={() => (s.screen === 'confirm' ? d({ type: 'EXPIRE_NOW' }) : d({ type: 'TOAST', text: 'Откройте подтверждение покупки' }))}>Истечь сейчас</Chip>
        </G>
        <G t="Ошибки">
          <Chip onClick={() => d({ type: 'PRESET_ERROR', kzt: 10_000, amount: 15_000 })}>Не хватает тенге</Chip>
          <Chip onClick={() => d({ type: 'PRESET_ERROR', kzt: 100_000, amount: 60_000 })}>Лимит</Chip>
          <Chip on={s.demo.e4} onClick={() => d({ type: 'DEMO', patch: { e4: !s.demo.e4 } })}>Ответ завис</Chip>
        </G>
        <G t="Кешбэк"><Chip on={s.demo.shuffleCashback} onClick={() => d({ type: 'DEMO', patch: { shuffleCashback: !s.demo.shuffleCashback } })}>Золото первым</Chip></G>
        <p className="text-[12px] text-muted">Уроков пройдено: {Object.keys(s.lessons).length} из {LESSONS.length}</p>
      </div>
    </Sheet>
  );
}
