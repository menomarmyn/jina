// Деньги: пополнение, покупка (сумма → подтверждение → успех), статус, продажа.
import { useCallback, useEffect, useRef, useState } from 'react';
import { AmountField, Breakdown, Button, Chip, Display, KV, Notice, PricePair, Risk, Sheet, Sun, Timer, TopBar } from '../ui';
import { BUY_PRESETS, CUSTODY, FEE_BUY_BP, FEE_SELL_BP, GOLD, LIMITS, QUOTE_TTL_SEC, TOPUP_MAX, TOPUP_PRESETS } from '../../mocks/data';
import { quoteBuy, sellForKzt, validateBuy, valueUg, UG_PER_G, type BuyCheck } from '../../lib/calc';
import { grams, kzt } from '../../lib/format';
import { baseQuote, netDelay, requote, type Quote } from '../../lib/quotes';
import { track } from '../../lib/events';
import type { Op } from '../../lib/ledger';
import { opId, useStore } from '../store';

const Screen = ({ title, onBack, children, footer }: { title: string; onBack: () => void; children: React.ReactNode; footer?: React.ReactNode }) => (
  <div className="flex h-full flex-col">
    <TopBar title={title} onBack={onBack} />
    <div className="scroll-area flex flex-1 flex-col gap-5 px-4 pb-4">{children}</div>
    {footer && <div className="px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-2">{footer}</div>}
  </div>
);

/* ---------- Пополнение ---------- */
export function TopUp() {
  const { s, d } = useStore();
  const suggested = s.draftTopup && s.draftTopup <= TOPUP_MAX ? s.draftTopup : null;
  const presets = suggested && !TOPUP_PRESETS.includes(suggested) ? [suggested, ...TOPUP_PRESETS] : TOPUP_PRESETS;
  const [amount, setAmount] = useState(suggested ?? 50_000);
  const [loading, setLoading] = useState(false);
  useEffect(() => { track('funding_started'); }, []);
  const submit = async () => {
    setLoading(true);
    await netDelay();
    d({ type: 'APPLY_OP', op: { id: opId('topup'), kind: 'topup', ts: Date.now(), amount, status: 'succeeded' } });
    track('funding_succeeded', { amount });
    d({ type: 'DRAFT_TOPUP', amount: null });
    d({ type: 'TOAST', text: `Баланс пополнен на ${kzt(amount)}` });
    d({ type: 'BACK' });
  };
  return (
    <Screen title="Пополнение" onBack={() => d({ type: 'BACK' })}
      footer={<Button loading={loading} onClick={submit}>Пополнить на {kzt(amount)}</Button>}>
      <div className="pt-6 text-center">
        <div className="text-[14px] text-muted">Тестовый баланс</div>
        <Display className="mt-3 text-[44px]">{kzt(amount)}</Display>
        <div className="mt-2 text-[14px] text-muted">Сейчас на счёте {kzt(s.ledger.kzt)}</div>
      </div>
      <div className="flex gap-2">{presets.map((p) => <Chip key={p} active={p === amount} onClick={() => setAmount(p)}>{kzt(p)}</Chip>)}</div>
      <p className="text-center text-[13px] text-muted">Деньги тестовые. Тенге хранятся на счёте в {CUSTODY.kzt}. До {kzt(TOPUP_MAX)} за раз.</p>
    </Screen>
  );
}

/* ---------- Покупка: сумма ---------- */
export function BuyAmount() {
  const { s, d } = useStore();
  const [amount, setAmount] = useState<number | null>(s.draftBuy);
  const [sheet, setSheet] = useState<BuyCheck | null>(null);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => { track('purchase_started'); }, []);
  const q = quoteBuy(amount ?? 0, GOLD.ask, GOLD.bid, FEE_BUY_BP);
  const available = Math.max(0, LIMITS.daily - s.ledger.spentToday);
  const check = validateBuy(amount ?? 0, { kzt: s.ledger.kzt, spentToday: s.ledger.spentToday, min: LIMITS.min, dailyLimit: LIMITS.daily });
  const pending = s.pendingOp !== null;
  const proceed = async () => { setSheet(null); setLoading(true); await netDelay(); d({ type: 'DRAFT_BUY', amount }); d({ type: 'NAV', to: 'confirm' }); };
  const onContinue = () => {
    setTouched(true);
    if (check.kind === 'min') return;
    if (check.kind === 'ok') return void proceed();
    setSheet(check);
  };
  return (
    <Screen title="Купить золото" onBack={() => d({ type: 'BACK' })}
      footer={<Button loading={loading} disabled={!amount || pending} onClick={onContinue}>Продолжить</Button>}>
      <AmountField id="buy-amount" label="Сколько потратить" value={amount} onChange={(v) => { setAmount(v); setTouched(false); }} />
      <div className="tnum -mt-2 text-center text-[15px] text-muted">
        {amount ? <>≈ <span className="font-semibold text-sun-ink">{grams(q.ug)}</span> · комиссия {kzt(q.fee)} внутри</> : 'от 1 000 ₸'}
      </div>
      {touched && check.kind === 'min' && <p className="text-center text-[14px] text-danger" role="alert">Минимальная покупка — {kzt(LIMITS.min)}</p>}
      <div className="flex gap-2">{BUY_PRESETS.map((p) => <Chip key={p} active={amount === p} onClick={() => { setAmount(p); setTouched(false); }}>{kzt(p)}</Chip>)}</div>
      <PricePair ask={GOLD.ask} bid={GOLD.bid} />
      <div className="tnum flex flex-col gap-1 px-1 text-[13px] text-muted">
        <div className="flex justify-between"><span>На счёте</span><span className="text-ink">{kzt(s.ledger.kzt)}</span></div>
        <div className="flex justify-between"><span>Сегодня можно купить ещё</span><span className="text-ink">{kzt(available)} из {kzt(LIMITS.daily)}</span></div>
        <span className="text-[11px]">Условный лимит демо на покупки</span>
      </div>
      <Risk />
      {pending && <Notice tone="warn" title="Проверяем статус прошлой покупки">Новую покупку можно будет сделать, когда статус обновится.</Notice>}

      <Sheet open={sheet?.kind === 'balance'} onClose={() => setSheet(null)} title={sheet?.kind === 'balance' ? `Не хватает ${kzt(sheet.short)}` : ''}>
        {sheet?.kind === 'balance' && (
          <div className="flex flex-col gap-3">
            <p className="text-[15px] text-muted">На счёте {kzt(s.ledger.kzt)}, покупка — {kzt(amount ?? 0)}.</p>
            <Button onClick={() => { d({ type: 'DRAFT_BUY', amount }); d({ type: 'DRAFT_TOPUP', amount: sheet.short }); d({ type: 'NAV', to: 'topup' }); }}>Пополнить на {kzt(sheet.short)}</Button>
            <Button variant="secondary" onClick={() => setSheet(null)}>Изменить сумму</Button>
          </div>
        )}
      </Sheet>
      <Sheet open={sheet?.kind === 'limit'} onClose={() => setSheet(null)} title="Это больше условного лимита">
        {sheet?.kind === 'limit' && (
          <div className="flex flex-col gap-3">
            <p className="text-[15px] text-muted">Лимит на покупки — {kzt(sheet.limit)} в сутки. Сегодня можно ещё {kzt(sheet.available)}. Лимит обновится завтра в 00:00.</p>
            <Button onClick={() => setSheet(null)}>Изменить сумму</Button>
          </div>
        )}
      </Sheet>
      <Sheet open={sheet?.kind === 'warn'} onClose={() => setSheet(null)} title={sheet?.kind === 'warn' ? `Это ${sheet.pct}% ваших тенге` : ''}>
        <div className="flex flex-col gap-3">
          <p className="text-[15px] text-muted">Цена золота может снижаться. Оставьте деньги на текущие траты — подушку удобнее держать в тенге.</p>
          <Button onClick={proceed}>Всё равно продолжить</Button>
          <Button variant="secondary" onClick={() => setSheet(null)}>Изменить сумму</Button>
        </div>
      </Sheet>
    </Screen>
  );
}

/* ---------- Покупка: подтверждение (котировка 30 с, «Курс обновился») ---------- */
export function BuyConfirm() {
  const { s, d } = useStore();
  const amount = s.draftBuy ?? 0;
  const [quote, setQuote] = useState<Quote>(() => baseQuote());
  const [left, setLeft] = useState(QUOTE_TTL_SEC);
  const [e1, setE1] = useState<{ old: Quote; next: Quote } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const opRef = useRef<string | null>(null);
  const q = quoteBuy(amount, quote.ask, quote.bid, FEE_BUY_BP);

  useEffect(() => { if (!amount) d({ type: 'NAV', to: 'buy', replace: true }); }, [amount, d]);
  useEffect(() => { track('quote_shown', { quoteId: quote.id, ask: quote.ask }); }, [quote.id, quote.ask]);

  const expire = useCallback(() => {
    track('quote_expired', { quoteId: quote.id });
    const next = requote(s.demo.e1, quote);
    setLeft(QUOTE_TTL_SEC);
    if (next.ask !== quote.ask) {
      track('requote_shown', { quoteId: next.id, ask: next.ask });
      setE1((prev) => ({ old: prev?.old ?? quote, next }));
      setQuote(next);
    } else {
      setQuote(next);
      d({ type: 'TOAST', text: 'Котировка обновлена, курс тот же' });
    }
  }, [quote, s.demo.e1, d]);

  useEffect(() => {
    if (submitting) return;
    if (left <= 0) { expire(); return; }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [left, submitting, expire]);

  const nonce = useRef(s.expireNonce);
  useEffect(() => {
    if (s.expireNonce !== nonce.current) { nonce.current = s.expireNonce; if (!submitting) expire(); }
  }, [s.expireNonce, submitting, expire]);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const id = opRef.current ?? `buy-${quote.id}`;
    opRef.current = id;
    const op: Op = { id, kind: 'buy', ts: Date.now(), amount, fee: q.fee, ug: q.ug, ask: quote.ask, bid: quote.bid, status: 'succeeded' };
    track('purchase_submitted', { operationId: id, quoteId: quote.id, afterRequote: e1 !== null });
    setE1(null);
    if (s.demo.e4) {
      await netDelay(900);
      d({ type: 'SET_PENDING', op: { ...op, status: 'pending' } });
      d({ type: 'NAV', to: 'pending', replace: true });
      return;
    }
    await netDelay();
    d({ type: 'APPLY_OP', op });
    track('purchase_succeeded', { operationId: id, ug: q.ug });
    d({ type: 'NAV', to: 'success', replace: true });
  };

  const cancelE1 = () => {
    track('purchase_cancelled', { reason: 'requote' });
    setE1(null);
    d({ type: 'DEMO', patch: { e1: 'off' } });
    d({ type: 'BACK' });
  };

  if (!amount) return null;
  const oldCalc = e1 ? quoteBuy(amount, e1.old.ask, e1.old.bid, FEE_BUY_BP) : null;
  const better = e1 ? e1.next.ask < e1.old.ask : false;

  return (
    <Screen title="Проверьте покупку" onBack={() => d({ type: 'BACK' })}
      footer={<Button loading={submitting} onClick={submit}>Купить за {kzt(amount)}</Button>}>
      <Timer seconds={left} total={QUOTE_TTL_SEC} />
      <Breakdown q={q} ask={quote.ask} bid={quote.bid} />
      <div className="flex items-center justify-between gap-3 text-[13px] text-muted">
        <button type="button" onClick={() => d({ type: 'SHEET', sheet: 'custody' })} className="min-h-[44px] text-left">Хранит {CUSTODY.gold}</button>
        <button type="button" onClick={() => d({ type: 'SHEET', sheet: 'pricing' })} className="min-h-[44px] shrink-0 font-medium text-sky-ink">Как считается цена</button>
      </div>
      <Risk />

      <Sheet open={!!e1} title="Курс обновился">
        {e1 && oldCalc && (
          <div className="flex flex-col gap-4">
            <p className="text-[15px] text-muted">Время котировки истекло. Проверьте новый расчёт — без подтверждения ничего не спишется.</p>
            <div className="tnum grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-2.5 rounded-[20px] bg-surface p-4 text-[15px]">
              <span /><span className="text-right text-[12px] text-muted">Было</span><span className="text-right text-[12px] text-muted">Стало</span>
              <span className="text-muted">Покупка за 1 г</span><span className="text-right">{kzt(e1.old.ask)}</span><span className="text-right font-semibold">{kzt(e1.next.ask)}</span>
              <span className="text-muted">Продажа за 1 г</span><span className="text-right">{kzt(e1.old.bid)}</span><span className="text-right font-semibold">{kzt(e1.next.bid)}</span>
              <span className="text-muted">Получите</span><span className="text-right">{grams(oldCalc.ug)}</span><span className="text-right font-semibold text-sun-ink">{grams(q.ug)}</span>
              <span className="text-muted">Если продать сразу</span><span className="text-right">≈ {kzt(oldCalc.sellNow)}</span><span className="text-right font-semibold">≈ {kzt(q.sellNow)}</span>
            </div>
            <p className="text-[13px] text-muted">{better ? 'Курс покупки снизился — граммов будет больше.' : 'Курс покупки вырос — граммов будет меньше.'} Спишем те же {kzt(amount)}.</p>
            <Timer seconds={left} total={QUOTE_TTL_SEC} />
            <Button onClick={submit} loading={submitting}>Купить по новому курсу</Button>
            <Button variant="secondary" onClick={cancelE1}>Отменить</Button>
          </div>
        )}
      </Sheet>
    </Screen>
  );
}

/* ---------- Статус: ответ «завис» ---------- */
export function BuyPending() {
  const { s, d } = useStore();
  const [loading, setLoading] = useState(false);
  const op = s.pendingOp;
  const refresh = async () => {
    if (!op || loading) return;
    setLoading(true);
    await netDelay(1200);
    d({ type: 'APPLY_OP', op: { ...op, status: 'succeeded' } });
    track('purchase_succeeded', { operationId: op.id, ug: op.ug, after: 'status_check' });
    d({ type: 'NAV', to: 'success', replace: true });
  };
  return (
    <div className="flex h-full flex-col px-5 pb-6 pt-[max(24px,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col justify-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-mist border-t-sky" aria-hidden />
        <Display className="text-[26px] leading-tight">Проверяем статус покупки</Display>
        <p className="text-[15px] text-muted">Покупка отправлена, ждём ответа хранителя. Деньги не спишутся дважды — нажимать «Купить» ещё раз не нужно.</p>
        {op && <p className="tnum text-[14px] text-muted">{kzt(op.amount)} · операция {op.id.slice(-6)}</p>}
      </div>
      <div className="flex flex-col gap-3">
        <Button loading={loading} onClick={refresh}>Обновить статус</Button>
        <Button variant="secondary" onClick={() => d({ type: 'NAV', to: 'home' })}>На главную</Button>
      </div>
    </div>
  );
}

/* ---------- Успех: солнце зажигает новые лучи ---------- */
export function BuySuccess() {
  const { s, d } = useStore();
  const op = [...s.ledger.ops].reverse().find((o) => o.kind === 'buy' && o.status === 'succeeded');
  if (!op) return null;
  const sellNow = valueUg(op.ug ?? 0, op.bid ?? GOLD.bid);
  const after = Math.min(1, s.ledger.goldUg / UG_PER_G);
  const before = Math.min(1, Math.max(0, s.ledger.goldUg - (op.ug ?? 0)) / UG_PER_G);
  return (
    <div className="flex h-full flex-col bg-ink px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(24px,env(safe-area-inset-top))] text-white">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Sun progress={after} animateFrom={before} size={210}>
          <span className="tnum font-display text-[22px] font-semibold">+{grams(op.ug ?? 0)}</span>
        </Sun>
        <Display className="mt-7 text-[28px] text-white">Покупка выполнена</Display>
        <p className="tnum mt-3 text-[15px] text-white/75">Списано {kzt(op.amount)} · если продать сейчас ≈ {kzt(sellNow)}</p>
        <p className="tnum mt-1 text-[15px] text-white/75">Всего золота {grams(s.ledger.goldUg)} — {Math.floor(after * 100)}% пути к 1 г</p>
        <button type="button" onClick={() => d({ type: 'SHEET', sheet: 'custody' })} className="mt-3 min-h-[44px] text-[15px] font-medium text-sun">Где хранится</button>
      </div>
      <p className="mb-4 rounded-field bg-white/10 px-4 py-3 text-[13px] leading-snug text-white/80">Цена золота может снижаться. Это не вклад, доходность не гарантируется.</p>
      <div className="flex flex-col gap-3">
        {!s.cashbackMode && <Button variant="sun" onClick={() => d({ type: 'NAV', to: 'cashback' })}>Выбрать кешбэк</Button>}
        <Button variant={s.cashbackMode ? 'sun' : 'ghost'} className={s.cashbackMode ? '' : 'text-white'} onClick={() => d({ type: 'NAV', to: 'home' })}>На главную</Button>
      </div>
    </div>
  );
}

/* ---------- Продажа ---------- */
export function SellAmount() {
  const { s, d } = useStore();
  const holding = s.ledger.goldUg;
  const max = sellForKzt(Number.MAX_SAFE_INTEGER, holding, GOLD.bid, FEE_SELL_BP).receive;
  const [target, setTarget] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const idRef = useRef(opId('sell'));
  useEffect(() => { track('sale_started'); }, []);
  const r = sellForKzt(target ?? 0, holding, GOLD.bid, FEE_SELL_BP);
  const over = target !== null && target > max;
  const submit = async () => {
    if (!r.ug || loading) return;
    setLoading(true);
    await netDelay();
    d({ type: 'APPLY_OP', op: { id: idRef.current, kind: 'sell', ts: Date.now(), amount: r.receive, fee: r.fee, ug: r.ug, bid: GOLD.bid, status: 'succeeded' } });
    track('sale_succeeded', { operationId: idRef.current, ug: r.ug, receive: r.receive });
    d({ type: 'NAV', to: 'sellSuccess', replace: true });
  };
  if (holding === 0) {
    return (
      <Screen title="Продать золото" onBack={() => d({ type: 'BACK' })} footer={<Button onClick={() => d({ type: 'NAV', to: 'buy', replace: true })}>Купить от 1 000 ₸</Button>}>
        <p className="pt-10 text-center text-[15px] text-muted">Золота пока нет.</p>
      </Screen>
    );
  }
  return (
    <Screen title="Продать золото" onBack={() => d({ type: 'BACK' })}
      footer={<Button loading={loading} disabled={!r.ug} onClick={submit}>{r.ug ? `Получить ${kzt(r.receive)}` : 'Укажите сумму'}</Button>}>
      <AmountField id="sell-amount" label="Сколько получить в тенге" value={target} onChange={setTarget} />
      <div className="tnum -mt-2 text-center text-[15px] text-muted">За всё золото сейчас — до {kzt(max)}</div>
      <div className="flex gap-2">
        {[1_000, 5_000].filter((p) => p < max).map((p) => <Chip key={p} active={target === p} onClick={() => setTarget(p)}>{kzt(p)}</Chip>)}
        <Chip active={target === max} onClick={() => setTarget(max)}>Всё</Chip>
      </div>
      {over && <p className="text-center text-[14px] text-danger" role="alert">Можно получить не больше {kzt(max)} — продадим всё золото.</p>}
      <div className="rounded-[20px] bg-surface px-4 py-2">
        <KV label="Продаём" value={<span className="text-sun-ink">{grams(r.ug)}</span>} />
        <KV label="Курс продажи" value={`${kzt(GOLD.bid)} за 1 г`} />
        <KV label="Комиссия" value={kzt(r.fee)} />
        <KV label="Получите" value={kzt(r.receive)} strong />
        <KV label="Останется" value={grams(r.remainingUg)} muted />
      </div>
      <p className="text-[13px] leading-snug text-muted">Деньги придут на счёт в {CUSTODY.kzt} сразу. Курс продажи ниже курса покупки ({kzt(GOLD.ask)}), поэтому сразу после покупки получите меньше, чем заплатили.</p>
    </Screen>
  );
}

export function SellSuccess() {
  const { s, d } = useStore();
  const op = [...s.ledger.ops].reverse().find((o) => o.kind === 'sell');
  if (!op) return null;
  return (
    <div className="flex h-full flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(24px,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col justify-center">
        <div className="text-[14px] text-muted">Золото продано</div>
        <Display className="mt-3 text-[40px]">+{kzt(op.amount)}</Display>
        <div className="mt-6 rounded-[20px] bg-surface px-4 py-2">
          <KV label="Продано" value={<span className="text-sun-ink">{grams(op.ug ?? 0)}</span>} />
          <KV label="Комиссия" value={kzt(op.fee ?? 0)} />
          <KV label="Доступно в тенге" value={kzt(s.ledger.kzt)} strong />
          <KV label="Осталось золота" value={grams(s.ledger.goldUg)} muted />
        </div>
      </div>
      <Button onClick={() => d({ type: 'NAV', to: 'home' })}>На главную</Button>
    </div>
  );
}
