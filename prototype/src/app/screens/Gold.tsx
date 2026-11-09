// Вкладка «Золото»: солнце накоплений крупно, курсы рядом, отметки пути, неделя (синтетика), хранение.
import { Button, Display, Group, KV, PricePair, Row, Sun } from '../ui';
import { CUSTODY, GOLD, GOLD_MARKS_UG, GOLD_WEEK } from '../../mocks/data';
import { changePct, goalProgress, valueUg } from '../../lib/calc';
import { grams, kzt, signedKzt, signedPct } from '../../lib/format';
import { useStore } from '../store';

function Week() {
  const W = 320, H = 92, PX = 4, PT = 8, PB = 20;
  const b = GOLD_WEEK.map((p) => p.bid);
  const min = Math.min(...b), max = Math.max(...b);
  const x = (i: number) => PX + (i * (W - 2 * PX)) / (b.length - 1);
  const y = (v: number) => PT + ((max - v) * (H - PT - PB)) / (max - min || 1);
  const line = b.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const last = b.length - 1;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Курс продажи за 7 дней: от ${kzt(min)} до ${kzt(max)} за грамм`}>
        <path d={`${line} L${x(last)},${H - PB} L${x(0)},${H - PB} Z`} fill="var(--sun-soft)" />
        <path d={line} fill="none" stroke="var(--sun)" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(last)} cy={y(b[last])} r="4" fill="var(--sun)" stroke="#fff" strokeWidth="2" />
        <text x={x(0)} y={H - 4} fontSize="10" fill="var(--muted)">{GOLD_WEEK[0].label}</text>
        <text x={x(last)} y={H - 4} fontSize="10" fill="var(--muted)" textAnchor="end">сегодня</text>
      </svg>
      <figcaption className="tnum mt-1 text-[12px] text-muted">от {kzt(min)} до {kzt(max)} за 1 г · синтетические данные, не прогноз</figcaption>
    </figure>
  );
}

const markLabel = (ug: number) => ({ 100_000: '0,1 г', 250_000: '0,25 г', 500_000: '0,5 г', 1_000_000: '1 г' } as Record<number, string>)[ug];

export function Gold() {
  const { s, d } = useStore();
  const ug = s.ledger.goldUg;
  const value = valueUg(ug, GOLD.bid);
  const g = goalProgress(ug, GOLD_MARKS_UG);
  const since = s.ledger.goldCost ? value - s.ledger.goldCost : null;
  const ops = [...s.ledger.ops].reverse().filter((o) => o.kind !== 'topup').slice(0, 3);
  const buy = () => { d({ type: 'DRAFT_BUY', amount: null }); d({ type: 'NAV', to: 'buy' }); };

  return (
    <div className="flex flex-col">
      <section className="bg-ink px-5 pb-6 pt-[max(18px,env(safe-area-inset-top))] text-white">
        <div className="text-center text-[15px] font-semibold">Золото</div>
        <div className="mt-4"><Sun progress={g.pct / 100} size={208}>
          <span className="text-[12px] text-[rgba(11,37,64,.7)]">у вас</span>
          <span className="tnum font-display text-[22px] font-semibold">{grams(ug)}</span>
        </Sun></div>
        <div className="mt-5 text-center">
          <Display className="text-[30px] text-white">≈ {kzt(value)}</Display>
          <div className="tnum mt-2 text-[13px] text-white/70">
            если продать сейчас{ug > 0 && <> · за 24 ч {signedPct(changePct(GOLD.bid, GOLD.bidYesterday))}</>}{since !== null && ug > 0 && <> · с покупки {signedKzt(since)}</>}
          </div>
        </div>
        <div className="mt-5"><PricePair ask={GOLD.ask} bid={GOLD.bid} tone="dark" /></div>
      </section>

      <div className="flex flex-col gap-5 px-4 py-5">
        <section className="rounded-[20px] bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-semibold">Путь к 1 грамму</span>
            <span className="tnum text-[15px] font-semibold">{g.pct}%</span>
          </div>
          <ol className="mt-3 grid grid-cols-4 gap-2">
            {g.marks.map((m) => (
              <li key={m.ug} className={`rounded-field px-2 py-2.5 text-center text-[13px] ${m.reached ? 'bg-sun text-ink font-semibold' : 'bg-mist text-muted'}`}>{markLabel(m.ug)}</li>
            ))}
          </ol>
          <p className="mt-3 text-[13px] leading-snug text-muted">
            {g.next ? `До ${markLabel(g.next.ug)} — ещё ${grams(g.leftToNextUg)}. ` : 'Цель достигнута. '}
            С 1 грамма можно вывести токен на свой кошелёк — сетевую комиссию платит клиент.
          </p>
        </section>

        <section className="rounded-[20px] bg-surface p-4">
          <div className="mb-2 text-[15px] font-semibold">Курс продажи за неделю</div>
          <Week />
        </section>

        <Group>
          <Row label="Хранит" value={<span className="text-sky-ink">{CUSTODY.gold}</span>} onClick={() => d({ type: 'SHEET', sheet: 'custody' })} />
          <Row label="Как считается цена" onClick={() => d({ type: 'SHEET', sheet: 'pricing' })} />
          <Row label="Комиссия" value="1% при покупке · 0 ₸ при продаже" />
        </Group>

        {ops.length > 0 && (
          <section className="rounded-[20px] bg-surface px-4 py-2">
            {ops.map((o) => (
              <KV key={o.id} label={o.kind === 'buy' ? 'Покупка' : 'Продажа'}
                value={`${o.kind === 'buy' ? '+' : '−'}${grams(o.ug ?? 0)} · ${o.kind === 'buy' ? '−' : '+'}${kzt(o.amount)}`} />
            ))}
          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={buy}>Купить</Button>
          <Button variant="secondary" disabled={ug === 0} onClick={() => d({ type: 'NAV', to: 'sell' })}>Продать</Button>
        </div>
        <p className="text-[12px] leading-snug text-muted">Цена золота может снижаться. Это не вклад, доходность не гарантируется.</p>
      </div>
    </div>
  );
}
