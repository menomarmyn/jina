// Экран актива «Золото»: граммы, оценка, курсы рядом, цель «1 г» с отметками, мини-график 7 дней (синтетические данные).
import { Button, Card, NavBar, PriceRow, Row } from '../components/ui';
import { CUSTODY, GOLD, GOLD_MARKS_UG, GOLD_WEEK } from '../mocks/data';
import { changePct, goalProgress, valueUg } from '../lib/calc';
import { grams, kzt, signedKzt, signedPct } from '../lib/format';
import { useStore } from '../store';

function WeekChart() {
  const W = 320, H = 96, PAD_X = 6, PAD_TOP = 10, PAD_BOTTOM = 22;
  const bids = GOLD_WEEK.map((p) => p.bid);
  const min = Math.min(...bids), max = Math.max(...bids);
  const x = (i: number) => PAD_X + (i * (W - 2 * PAD_X)) / (bids.length - 1);
  const y = (v: number) => PAD_TOP + ((max - v) * (H - PAD_TOP - PAD_BOTTOM)) / (max - min || 1);
  const line = bids.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(bids.length - 1)},${H - PAD_BOTTOM} L${x(0)},${H - PAD_BOTTOM} Z`;
  const last = bids.length - 1;
  return (
    <figure className="flex flex-col gap-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Курс продажи за 7 дней: от ${kzt(min)} до ${kzt(max)} за грамм`}>
        <line x1={PAD_X} x2={W - PAD_X} y1={y(min)} y2={y(min)} stroke="var(--border)" strokeDasharray="3 3" />
        <line x1={PAD_X} x2={W - PAD_X} y1={y(max)} y2={y(max)} stroke="var(--border)" strokeDasharray="3 3" />
        <path d={area} fill="var(--gold-soft)" />
        <path d={line} fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(last)} cy={y(bids[last])} r="3.5" fill="var(--gold)" />
        {GOLD_WEEK.map((p, i) => (i === 0 || i === last ? (
          <text key={p.label} x={x(i)} y={H - 6} fontSize="10" fill="var(--text-muted)" textAnchor={i === 0 ? 'start' : 'end'}>{p.label}</text>
        ) : null))}
      </svg>
      <figcaption className="tnum flex flex-col text-[12px] text-muted">
        <span>мин. {kzt(min)} · макс. {kzt(max)} за 1 г</span>
        <span>Синтетические данные, не прогноз</span>
      </figcaption>
    </figure>
  );
}

export function Gold() {
  const { s, d } = useStore();
  const ug = s.ledger.goldUg;
  const value = valueUg(ug, GOLD.bid);
  const g = goalProgress(ug, GOLD_MARKS_UG);
  const since = s.ledger.goldCost ? value - s.ledger.goldCost : null;
  const ops = [...s.ledger.ops].reverse().filter((o) => o.kind !== 'topup').slice(0, 3);

  return (
    <div className="flex h-full flex-col">
      <NavBar title="Золото" onBack={() => d({ type: 'BACK' })} />
      <div className="scroll-area flex flex-1 flex-col gap-4 px-4 pb-6">
        <div className="rounded-l bg-gold-soft p-5">
          <div className="text-[13px] text-muted">У вас</div>
          <div className="tnum mt-1 text-[34px] font-semibold leading-none text-gold">{grams(ug)}</div>
          <div className="tnum mt-2 text-[15px]">если продать сейчас ≈ <b>{kzt(value)}</b></div>
          {ug > 0 && (
            <div className="tnum mt-1 text-[13px] text-muted">
              за 24 ч {signedPct(changePct(GOLD.bid, GOLD.bidYesterday))}, ориентировочно
              {since !== null && <> · с покупки {signedKzt(since)} (комиссия и разница курсов)</>}
            </div>
          )}
        </div>

        <PriceRow ask={GOLD.ask} bid={GOLD.bid} />

        <Card className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-semibold">Цель — 1 г</span>
            <span className="tnum text-[15px] font-semibold">{g.pct}%</span>
          </div>
          <div className="relative h-2.5 rounded-full bg-surface2">
            <div className="h-full rounded-full bg-gold" style={{ width: `${g.pct}%` }} />
            {g.marks.slice(0, -1).map((m) => (
              <span key={m.ug} className={`absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded ${m.reached ? 'bg-surface' : 'bg-border'}`} style={{ left: `${m.pctOfGoal}%` }} aria-hidden />
            ))}
          </div>
          <div className="tnum grid grid-cols-4 text-[12px] text-muted">
            {g.marks.map((m) => (
              <span key={m.ug} className={`${m.reached ? 'font-semibold text-gold' : ''} ${m.ug === 1_000_000 ? 'text-right' : ''}`}>
                {m.reached ? '✓ ' : ''}{grams(m.ug).replace(/0+(?= г)/, '').replace(/,(?= г)/, '')}
              </span>
            ))}
          </div>
          <p className="text-[13px] text-muted">
            {g.next ? `До отметки ${grams(g.next.ug)} — ещё ${grams(g.leftToNextUg)}. ` : 'Цель достигнута. '}
            С 1 г можно вывести токен на свой кошелёк (сетевую комиссию платит клиент).
          </p>
        </Card>

        <Card className="flex flex-col gap-2">
          <div className="text-[15px] font-semibold">Курс продажи за 7 дней</div>
          <WeekChart />
        </Card>

        <Card className="flex flex-col gap-1">
          <Row label="Хранит" value={<button type="button" onClick={() => d({ type: 'SHEET', sheet: 'custody' })} className="text-right text-accent">{CUSTODY.gold}</button>} />
          <Row label="Комиссия при покупке" value="1%, внутри суммы" />
          <Row label="Комиссия при продаже" value="0 ₸" />
          <button type="button" onClick={() => d({ type: 'SHEET', sheet: 'pricing' })} className="mt-1 min-h-[44px] self-start text-[14px] font-medium text-accent">Как считается цена</button>
        </Card>

        {ops.length > 0 && (
          <Card className="flex flex-col gap-1">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[15px] font-semibold">Последние операции</span>
              <button type="button" onClick={() => d({ type: 'NAV', to: 'history' })} className="min-h-[44px] text-[14px] font-medium text-accent">Все</button>
            </div>
            {ops.map((o) => (
              <Row key={o.id} label={o.kind === 'buy' ? 'Покупка' : 'Продажа'}
                value={`${o.kind === 'buy' ? '+' : '−'}${grams(o.ug ?? 0)} · ${o.kind === 'buy' ? '−' : '+'}${kzt(o.amount)}`} />
            ))}
          </Card>
        )}

        <p className="text-[12px] leading-snug text-muted">Цена золота может снижаться. Это не вклад, доходность не гарантируется.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-2">
        <Button onClick={() => { d({ type: 'DRAFT_BUY', amount: null }); d({ type: 'NAV', to: 'buy' }); }}>Купить</Button>
        <Button variant="secondary" disabled={ug === 0} onClick={() => d({ type: 'NAV', to: 'sell' })}>Продать</Button>
      </div>
    </div>
  );
}
