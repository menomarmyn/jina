// Продажа золота в тенге (H7: цена выхода — завершённый путь, а не только экран условий).
import { useEffect, useRef, useState } from 'react';
import { AmountInput, Button, Card, NavBar, PresetChip, PriceRow, Row } from '../components/ui';
import { CUSTODY, FEE_SELL_BP, GOLD } from '../mocks/data';
import { sellForKzt } from '../lib/calc';
import { grams, kzt } from '../lib/format';
import { netDelay } from '../lib/quotes';
import { track } from '../lib/events';
import { opId, useStore } from '../store';

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
  const presets = [1_000, 5_000].filter((p) => p < max);

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
      <div className="flex h-full flex-col">
        <NavBar title="Продать золото" onBack={() => d({ type: 'BACK' })} />
        <div className="flex flex-1 flex-col gap-4 px-4 pb-6">
          <Card><p className="text-[15px] text-muted">Золота пока нет. Купить можно от 1 000 ₸.</p></Card>
          <div className="mt-auto"><Button onClick={() => d({ type: 'NAV', to: 'buy', replace: true })}>Купить золото</Button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <NavBar title="Продать золото" onBack={() => d({ type: 'BACK' })} />
      <div className="scroll-area flex flex-1 flex-col gap-4 px-4 pb-6">
        <AmountInput id="sell-amount" label="Сколько получить в тенге" value={target} onChange={setTarget} />
        <div className="flex gap-2">
          {presets.map((p) => <PresetChip key={p} active={target === p} onClick={() => setTarget(p)}>{kzt(p)}</PresetChip>)}
          <PresetChip active={target === max} onClick={() => setTarget(max)}>Всё</PresetChip>
        </div>
        <p className="-mt-2 px-1 text-[13px] text-muted">За всё золото сейчас — до {kzt(max)}</p>
        {over && <p className="text-[14px] text-negative" role="alert">Можно получить не больше {kzt(max)} — продадим всё золото.</p>}
        <Card className="flex flex-col gap-1">
          <PriceRow ask={GOLD.ask} bid={GOLD.bid} />
          <div className="mt-2" />
          <Row label="Продаём" value={<span className="text-gold">{grams(r.ug)}</span>} />
          <Row label="По курсу продажи" value={kzt(r.gross)} />
          <Row label="Комиссия за продажу" value={kzt(r.fee)} />
          <Row label="Получите в тенге" value={kzt(r.receive)} strong />
          <Row label="Останется золота" value={grams(r.remainingUg)} muted />
        </Card>
        <p className="px-1 text-[13px] leading-snug text-muted">
          Деньги придут на счёт в {CUSTODY.kzt} сразу после продажи. Продаём по курсу продажи — он ниже курса покупки,
          поэтому сразу после покупки можно получить меньше, чем вы заплатили.
        </p>
        <div className="mt-auto"><Button loading={loading} disabled={!r.ug} onClick={submit}>{r.ug ? `Продать и получить ${kzt(r.receive)}` : 'Укажите сумму'}</Button></div>
      </div>
    </div>
  );
}

export function SellSuccess() {
  const { s, d } = useStore();
  const op = [...s.ledger.ops].reverse().find((o) => o.kind === 'sell');
  if (!op) return null;
  return (
    <div className="flex h-full flex-col px-4 pb-6 pt-[max(20px,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col justify-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent" aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
        </span>
        <h1 className="text-[26px] font-semibold">Золото продано</h1>
        <Card className="flex flex-col gap-1">
          <Row label="Продано" value={<span className="text-gold">{grams(op.ug ?? 0)}</span>} />
          <Row label="Зачислено на счёт" value={kzt(op.amount)} strong />
          <Row label="Комиссия" value={kzt(op.fee ?? 0)} />
          <Row label="Доступно в тенге" value={kzt(s.ledger.kzt)} />
          <Row label="Осталось золота" value={grams(s.ledger.goldUg)} muted />
        </Card>
      </div>
      <Button onClick={() => d({ type: 'NAV', to: 'home' })}>На главную</Button>
    </div>
  );
}
