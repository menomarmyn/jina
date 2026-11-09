import { useRef } from 'react';
import { Composition, Display, Group, Icon, RoundAction, Row, Sun, Wordmark } from '../ui';
import { CASHBACK, CUSTODY, GOLD_MARKS_UG, PARTNERS, PROFILES, UPDATED_AT } from '../../mocks/data';
import { goalProgress } from '../../lib/calc';
import { grams, kzt, qty, signedKzt, signedPct } from '../../lib/format';
import { homeView, partnerValue } from '../../lib/derived';
import { LESSONS } from '../lessons';
import { useStore } from '../store';

export function Home() {
  const { s, d } = useStore();
  const taps = useRef<number[]>([]);
  const v = homeView(s);
  const p = PROFILES[s.profileId];
  const g = goalProgress(s.ledger.goldUg, GOLD_MARKS_UG);
  const hasGold = s.ledger.goldUg > 0;
  const empty = s.ledger.kzt === 0 && !hasGold && v.pf.partners === 0;
  const canConnect = PARTNERS.some((x) => !s.partners[x.id] && p.offer[x.id]?.length);
  const nextLesson = LESSONS.find((l) => !s.lessons[l.id]);
  const buy = () => { d({ type: 'DRAFT_BUY', amount: null }); d({ type: 'NAV', to: 'buy' }); };

  // Скрытая демо-панель: 5 быстрых тапов по логотипу
  const onLogo = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 2000), now];
    if (taps.current.length >= 5) { taps.current = []; d({ type: 'DEMO_OPEN', open: true }); }
  };

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 pt-[max(10px,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between pt-1">
        <button type="button" onClick={onLogo} aria-label="JINA"><Wordmark /></button>
        <button type="button" onClick={() => d({ type: 'SHEET', sheet: 'custody' })} aria-label="Кто хранит ваши активы"
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted"><Icon name="shield" /></button>
      </header>

      <section className="px-1">
        <div className="text-[14px] text-muted">Доступно в тенге</div>
        <Display className="mt-2 text-[42px]">{kzt(v.pf.available)}</Display>
        <div className="mt-1 text-[13px] text-muted">на счёте в {CUSTODY.kzt}</div>
      </section>

      <div className="flex justify-between px-1">
        <RoundAction icon="plus" label="Пополнить" onClick={() => d({ type: 'NAV', to: 'topup' })} />
        <RoundAction icon="arrowDown" label="Купить" onClick={buy} disabled={empty} />
        <RoundAction icon="arrowUp" label="Продать" onClick={() => d({ type: 'NAV', to: 'sell' })} disabled={!hasGold} />
        <RoundAction icon="gift" label="Кешбэк" onClick={() => d({ type: 'NAV', to: 'cashback' })} />
      </div>

      {/* Солнце накоплений — главный образ */}
      <button type="button" onClick={() => (empty ? d({ type: 'NAV', to: 'topup' }) : d({ type: 'NAV', to: 'gold' }))}
        className="relative overflow-hidden rounded-hero bg-ink px-5 pb-5 pt-6 text-left text-white">
        <div className="flex items-center gap-5">
          <Sun progress={g.pct / 100} size={128}>
            <span className="tnum font-display text-[15px] font-semibold">{g.pct}%</span>
          </Sun>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] text-white/65">Золото · цель 1 грамм</div>
            <Display className="mt-1.5 text-[26px] text-white">{grams(s.ledger.goldUg)}</Display>
            <div className="tnum mt-2 text-[13px] text-white/75">
              {hasGold ? `≈ ${kzt(v.pf.gold)}, если продать сейчас` : empty ? 'Пополните баланс, чтобы начать' : 'Первый луч — с 1 000 ₸'}
            </div>
          </div>
        </div>
        {hasGold && (
          <div className="tnum mt-4 flex justify-between border-t border-white/10 pt-3 text-[13px] text-white/70">
            <span>За 24 ч {signedPct(v.gold24h.pct)} · {signedKzt(v.gold24h.kzt)}</span>
            {v.goldSinceBuy !== null && <span>с покупки {signedKzt(v.goldSinceBuy)}</span>}
          </div>
        )}
      </button>

      {empty ? (
        <Group>
          <Row icon={<Icon name="plus" />} accent="sky" label="Пополнить тестовым балансом" sub="Деньги тестовые, без карты и личных данных" onClick={() => d({ type: 'NAV', to: 'topup' })} />
        </Group>
      ) : (
        <Group>
          {Object.entries(s.partners).map(([id, h]) => (
            <Row key={id} icon={<Icon name="link" />} label={PARTNERS.find((x) => x.id === id)?.name ?? id}
              sub={`${h.map((x) => `${qty(x.qtyMinor, x.decimals)} ${x.asset}`).join(' · ')} · только просмотр · ориентировочно, ${UPDATED_AT}`}
              value={`≈ ${kzt(partnerValue(h))}`} />
          ))}
          {canConnect && <Row icon={<Icon name="link" />} label="Подключить биржу" sub="Баланс в общем обзоре, только просмотр" onClick={() => d({ type: 'NAV', to: 'partner' })} />}
          <Row icon={<Icon name="gift" />} accent="sun" label="Кешбэк"
            sub={s.cashbackMode ? `${s.cashbackMode === 'gold' ? 'Граммами золота' : 'В тенге'} · зачисление ${CASHBACK.nextCredit}` : 'Выберите: тенге или граммы золота'}
            onClick={() => d({ type: 'NAV', to: 'cashback' })} />
          <Row icon={<Icon name="list" />} label="История операций" value={<span className="text-muted">{s.ledger.ops.length}</span>} onClick={() => d({ type: 'NAV', to: 'history' })} />
        </Group>
      )}

      {nextLesson && (
        <button type="button" onClick={() => d({ type: 'OPEN_LESSON', id: nextLesson.id })}
          className="flex items-center gap-3 rounded-[20px] bg-sky-soft px-4 py-3.5 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-sky-ink"><Icon name="book" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">{nextLesson.title}</span>
            <span className="block text-[13px] text-muted">Урок {LESSONS.indexOf(nextLesson) + 1} из {LESSONS.length} · {nextLesson.minutes} мин</span>
          </span>
          <Icon name="chevron" size={18} className="text-muted" />
        </button>
      )}

      {!empty && (
        <section className="rounded-[20px] bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-semibold">Всего в активах</span>
            <span className="tnum font-display text-[20px] font-semibold">{kzt(v.pf.total)}</span>
          </div>
          <div className="mt-3"><Composition shares={v.pf.shares} /></div>
          <p className="tnum mt-3 text-[12px] leading-snug text-muted">
            В приложении {kzt(v.pf.inApp)}{v.pf.partners > 0 && ` · у партнёров ≈ ${kzt(v.pf.partners)}`}. Золото по цене продажи.
            Это оценка, а не деньги для трат.
          </p>
        </section>
      )}

      <p className="px-1 text-[11px] leading-snug text-muted">Синтетические данные для демо. Названия партнёров условные. Котировки на чт, 5 ноября, {UPDATED_AT}.</p>
    </div>
  );
}
