import { useEffect, useState } from 'react';
import { Button, NavBar, RadioCard } from '../components/ui';
import { CASHBACK, GOLD, PARTNERS, PROFILES } from '../mocks/data';
import { cashbackMonth, cashbackToGold } from '../lib/calc';
import { grams, kzt } from '../lib/format';
import { netDelay } from '../lib/quotes';
import { track } from '../lib/events';
import { useStore } from '../store';

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
    setLoading(true);
    await netDelay();
    d({ type: 'SET_CASHBACK', mode: sel });
    track('cashback_choice_saved', { mode: sel });
    d({ type: 'TOAST', text: sel === 'gold' ? 'Кешбэк будет приходить граммами золота' : 'Кешбэк будет приходить в тенге' });
    setLoading(false);
    const partnerLeft = PARTNERS.some((x) => !s.partners[x.id] && p.offer[x.id]?.length);
    d({ type: 'NAV', to: partnerLeft ? 'partner' : 'home' });
  };

  const cards = [
    <RadioCard key="kzt" id="cb-kzt" selected={sel === 'kzt'} onSelect={() => setSel('kzt')} title="Тенге">
      За месяц трат как у вас — <span className="tnum font-semibold text-text">{kzt(m.total)}</span> на счёт в тенге.
    </RadioCard>,
    <RadioCard key="gold" id="cb-gold" selected={sel === 'gold'} onSelect={() => setSel('gold')} title="Граммами золота">
      За месяц трат как у вас — <span className="tnum font-semibold text-text">{kzt(m.total)} → {grams(g.ug)}</span>, по цене продажи ≈ {kzt(g.sellNow)}.
      <span className="mt-1 block">Цена золота может снижаться.</span>
    </RadioCard>,
  ];

  return (
    <div className="flex h-full flex-col">
      <NavBar title="Кешбэк" onBack={s.history.length ? () => d({ type: 'BACK' }) : undefined} />
      <div className="scroll-area flex flex-1 flex-col gap-4 px-4 pb-6">
        <div>
          <h1 className="text-[22px] font-semibold leading-tight">Как получать кешбэк?</h1>
          <p className="mt-1 text-[15px] text-muted">Условия одинаковые. Выбор можно поменять в любой момент.</p>
        </div>
        <div className="flex flex-col gap-3" role="radiogroup" aria-label="Способ кешбэка">
          {s.demo.shuffleCashback ? [cards[1], cards[0]] : cards}
        </div>
        <ul className="flex flex-col gap-1.5 rounded-m bg-surface2 p-3 text-[13px] leading-snug text-muted">
          <li>0,5% с покупок картой, не больше {kzt(CASHBACK.cap)} в месяц</li>
          <li>+2% у партнёров-магазинов, за их счёт</li>
          <li>Зачисление в первый рабочий день месяца, следующее — {CASHBACK.nextCredit}</li>
          <li>Граммы — по курсу покупки. Комиссия 1% не берётся, но действует разница курсов покупки и продажи</li>
          <li className="tnum">Пример: {kzt(m.base)} базовый + {kzt(m.bonus)} у партнёров = {kzt(m.total)}</li>
        </ul>
        <div className="mt-auto"><Button disabled={!sel} loading={loading} onClick={save}>Сохранить выбор</Button></div>
      </div>
    </div>
  );
}
