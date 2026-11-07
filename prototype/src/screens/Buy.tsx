import { useCallback, useEffect, useRef, useState } from 'react';
import { BottomSheet, Button, Card, ErrorState, FeeBreakdown, NavBar, PresetChip, PriceRow, QuoteTimer, RiskBanner, AmountInput } from '../components/ui';
import { BUY_PRESETS, CUSTODY, FEE_BUY_BP, GOLD, LIMITS, QUOTE_TTL_SEC } from '../mocks/data';
import { quoteBuy, validateBuy, valueUg, type BuyCheck } from '../lib/calc';
import { grams, kzt } from '../lib/format';
import { baseQuote, netDelay, requote, type Quote } from '../lib/quotes';
import { track } from '../lib/events';
import type { Op } from '../lib/ledger';
import { useStore } from '../store';

/** Шаг 1: сумма с живым пересчётом и проверками. */
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

  const proceed = async () => {
    setSheet(null);
    setLoading(true);
    await netDelay();
    d({ type: 'DRAFT_BUY', amount });
    d({ type: 'NAV', to: 'confirm' });
  };
  const onContinue = () => {
    setTouched(true);
    if (check.kind === 'min') return;
    if (check.kind === 'ok') return void proceed();
    setSheet(check);
  };

  return (
    <div className="flex h-full flex-col">
      <NavBar title="Купить золото" onBack={() => d({ type: 'BACK' })} />
      <div className="scroll-area flex flex-1 flex-col gap-4 px-4 pb-6">
        <AmountInput id="buy-amount" value={amount} onChange={(v) => { setAmount(v); setTouched(false); }} />
        <div className="flex gap-2">
          {BUY_PRESETS.map((p) => <PresetChip key={p} active={amount === p} onClick={() => { setAmount(p); setTouched(false); }}>{kzt(p)}</PresetChip>)}
        </div>
        {touched && check.kind === 'min' && <p className="text-[14px] text-negative" role="alert">Минимальная покупка — {kzt(LIMITS.min)}</p>}
        <Card className="flex flex-col gap-2">
          <PriceRow ask={GOLD.ask} bid={GOLD.bid} />
          <div className="tnum flex justify-between pt-1 text-[14px]"><span className="text-muted">Комиссия 1%, внутри суммы</span><span>{kzt(q.fee)}</span></div>
          <div className="tnum flex justify-between text-[14px]"><span className="text-muted">Идёт на золото</span><span>{kzt(q.net)}</span></div>
          <div className="tnum flex justify-between text-[15px] font-semibold"><span>Получите примерно</span><span className="text-gold">{grams(q.ug)}</span></div>
        </Card>
        <div className="tnum flex flex-col gap-0.5 px-1 text-[13px] text-muted">
          <div className="flex justify-between"><span>На счёте</span><span className="text-text">{kzt(s.ledger.kzt)}</span></div>
          <div className="flex justify-between"><span>Сегодня можно купить ещё</span><span className="text-text">{kzt(available)} из {kzt(LIMITS.daily)}</span></div>
          <span className="text-[11px]">Условный лимит демо на покупки</span>
        </div>
        <RiskBanner />
        {pending && <ErrorState tone="warning" title="Проверяем статус прошлой покупки">Новую покупку можно будет сделать, когда статус обновится.</ErrorState>}
        <div className="mt-auto"><Button loading={loading} disabled={!amount || pending} onClick={onContinue}>Продолжить</Button></div>
      </div>

      <BottomSheet open={sheet?.kind === 'balance'} onClose={() => setSheet(null)} title={sheet?.kind === 'balance' ? `Не хватает ${kzt(sheet.short)}` : ''}>
        {sheet?.kind === 'balance' && (
          <div className="flex flex-col gap-3">
            <p className="text-[15px] text-muted">На счёте {kzt(s.ledger.kzt)}, покупка — {kzt(amount ?? 0)}.</p>
            <Button onClick={() => { d({ type: 'DRAFT_BUY', amount }); d({ type: 'DRAFT_TOPUP', amount: sheet.short }); d({ type: 'NAV', to: 'topup' }); }}>Пополнить на {kzt(sheet.short)}</Button>
            <Button variant="secondary" onClick={() => setSheet(null)}>Изменить сумму</Button>
          </div>
        )}
      </BottomSheet>
      <BottomSheet open={sheet?.kind === 'limit'} onClose={() => setSheet(null)} title="Превышен условный лимит демо">
        {sheet?.kind === 'limit' && (
          <div className="flex flex-col gap-3">
            <p className="text-[15px] text-muted">Лимит на покупки — {kzt(sheet.limit)} в сутки. Сегодня доступно ещё {kzt(sheet.available)}. Лимит обновится завтра в 00:00.</p>
            <Button onClick={() => setSheet(null)}>Изменить сумму</Button>
          </div>
        )}
      </BottomSheet>
      <BottomSheet open={sheet?.kind === 'warn'} onClose={() => setSheet(null)} title={sheet?.kind === 'warn' ? `Это ${sheet.pct}% ваших тенге` : ''}>
        <div className="flex flex-col gap-3">
          <p className="text-[15px] text-muted">Цена золота может снижаться. Оставьте деньги на текущие траты.</p>
          <Button onClick={proceed}>Продолжить</Button>
          <Button variant="secondary" onClick={() => setSheet(null)}>Изменить сумму</Button>
        </div>
      </BottomSheet>
    </div>
  );
}

/** Шаг 2: подтверждение с таймером котировки и E1. */
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
      d({ type: 'TOAST', text: 'Котировка обновлена, курс не изменился' });
    }
  }, [quote, s.demo.e1, d]);

  // Таймер 30 с; на паузе во время отправки
  useEffect(() => {
    if (submitting) return;
    if (left <= 0) { expire(); return; }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [left, submitting, expire]);

  // Демо-панель: «истечь котировку сейчас»
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
    d({ type: 'DEMO', patch: { e1: 'off' } }); // следующая котировка — базовая
    d({ type: 'BACK' });
  };

  if (!amount) return null;
  const oldCalc = e1 ? quoteBuy(amount, e1.old.ask, e1.old.bid, FEE_BUY_BP) : null;
  const better = e1 ? e1.next.ask < e1.old.ask : false;

  return (
    <div className="flex h-full flex-col">
      <NavBar title="Подтверждение" onBack={() => d({ type: 'BACK' })} />
      <div className="scroll-area flex flex-1 flex-col gap-4 px-4 pb-6">
        <Card className="flex flex-col gap-3">
          <QuoteTimer seconds={left} total={QUOTE_TTL_SEC} />
          <FeeBreakdown q={q} ask={quote.ask} bid={quote.bid} />
        </Card>
        <div className="flex items-center justify-between px-1 text-[13px] text-muted">
          <span>Золото хранит {CUSTODY.gold}</span>
        </div>
        <RiskBanner />
        <div className="mt-auto"><Button loading={submitting} onClick={submit}>Купить за {kzt(amount)}</Button></div>
      </div>

      <BottomSheet open={!!e1} title="Курс обновился">
        {e1 && oldCalc && (
          <div className="flex flex-col gap-3">
            <p className="text-[15px] text-muted">Время котировки истекло. Новый расчёт ниже — проверьте и подтвердите ещё раз. Без подтверждения ничего не спишется.</p>
            <div className="tnum grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-2 rounded-m bg-surface p-4 text-[15px] shadow-card">
              <span className="text-muted" />
              <span className="text-right text-[12px] text-muted">Было</span>
              <span className="text-right text-[12px] text-muted">Стало</span>
              <span className="text-muted">Курс покупки за 1 г</span><span className="text-right">{kzt(e1.old.ask)}</span><span className="text-right font-semibold">{kzt(e1.next.ask)}</span>
              <span className="text-muted">Курс продажи за 1 г</span><span className="text-right">{kzt(e1.old.bid)}</span><span className="text-right font-semibold">{kzt(e1.next.bid)}</span>
              <span className="text-muted">Получите</span><span className="text-right">{grams(oldCalc.ug)}</span><span className="text-right font-semibold text-gold">{grams(q.ug)}</span>
              <span className="text-muted">Если продать сразу</span><span className="text-right">≈ {kzt(oldCalc.sellNow)}</span><span className="text-right font-semibold">≈ {kzt(q.sellNow)}</span>
            </div>
            <p className="text-[13px] text-muted">{better ? 'Курс покупки снизился — за ту же сумму граммов будет больше.' : 'Курс покупки вырос — за ту же сумму граммов будет меньше.'} Спишем те же {kzt(amount)}.</p>
            <QuoteTimer seconds={left} total={QUOTE_TTL_SEC} />
            <Button onClick={submit} loading={submitting}>Купить по новому курсу</Button>
            <Button variant="secondary" onClick={cancelE1}>Отменить</Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

/** E4: ответ «завис». Повторный тап не создаёт вторую покупку. */
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
    <div className="flex h-full flex-col px-4 pb-6 pt-[max(20px,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col justify-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" aria-hidden />
        <h1 className="text-[24px] font-semibold">Проверяем статус операции</h1>
        <p className="text-[15px] text-muted">Покупка отправлена, ждём ответа хранителя. Деньги не спишутся дважды: повторно нажимать «Купить» не нужно.</p>
        {op && <p className="tnum text-[14px] text-muted">Покупка на {kzt(op.amount)} · операция {op.id.slice(-6)}</p>}
      </div>
      <div className="flex flex-col gap-3">
        <Button loading={loading} onClick={refresh}>Обновить статус</Button>
        <Button variant="secondary" onClick={() => d({ type: 'NAV', to: 'home' })}>На главную</Button>
      </div>
    </div>
  );
}

/** Шаг 3: успех. */
export function BuySuccess() {
  const { s, d } = useStore();
  const [where, setWhere] = useState(false);
  const op = [...s.ledger.ops].reverse().find((o) => o.kind === 'buy' && o.status === 'succeeded');
  if (!op) return null;
  const sellNow = valueUg(op.ug ?? 0, op.bid ?? GOLD.bid);
  return (
    <div className="flex h-full flex-col px-4 pb-6 pt-[max(20px,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col justify-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent" aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
        </span>
        <h1 className="text-[26px] font-semibold">Покупка выполнена</h1>
        <Card className="flex flex-col gap-1">
          <div className="tnum flex justify-between text-[15px]"><span className="text-muted">Зачислено</span><span className="font-semibold text-gold">{grams(op.ug ?? 0)}</span></div>
          <div className="tnum flex justify-between text-[15px]"><span className="text-muted">Списано</span><span>{kzt(op.amount)}</span></div>
          <div className="tnum flex justify-between text-[15px]"><span className="text-muted">По цене продажи сейчас</span><span>≈ {kzt(sellNow)}</span></div>
        </Card>
        <button type="button" onClick={() => setWhere(true)} className="self-start text-[15px] font-medium text-accent">Где хранится</button>
        <RiskBanner compact />
      </div>
      <div className="flex flex-col gap-3">
        {!s.cashbackMode && <Button onClick={() => d({ type: 'NAV', to: 'cashback' })}>Выбрать кешбэк</Button>}
        <Button variant={s.cashbackMode ? 'primary' : 'secondary'} onClick={() => d({ type: 'NAV', to: 'home' })}>На главную</Button>
      </div>
      <BottomSheet open={where} onClose={() => setWhere(false)} title="Кто хранит ваши активы">
        <div className="flex flex-col gap-2 text-[15px]">
          <p><b>Тенге</b> — на счёте в {CUSTODY.kzt}.</p>
          <p><b>Золото</b> — граммы учтены на вашем счёте в приложении, золото хранит {CUSTODY.gold}.</p>
          <p><b>Кошельки партнёров</b> — только просмотр: мы видим баланс, но не можем торговать или выводить.</p>
          <p className="text-[13px] text-muted">Названия партнёров в демо условные. Регуляторная модель — гипотеза для отдельной проверки.</p>
          <Button variant="secondary" onClick={() => setWhere(false)}>Понятно</Button>
        </div>
      </BottomSheet>
    </div>
  );
}
