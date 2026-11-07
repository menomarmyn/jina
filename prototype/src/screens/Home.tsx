import { useRef } from 'react';
import { AssetCard, Button, Card, DemoBadge, PortfolioBar } from '../components/ui';
import { APP_NAME, CASHBACK, CUSTODY, PARTNERS, PROFILES, UPDATED_AT } from '../mocks/data';
import { grams, kzt, qty, signedKzt, signedPct } from '../lib/format';
import { homeView, partnerValue } from '../lib/derived';
import { useStore } from '../store';

export function Home() {
  const { s, d } = useStore();
  const taps = useRef<number[]>([]);
  const v = homeView(s);
  const p = PROFILES[s.profileId];
  const empty = s.ledger.kzt === 0 && s.ledger.goldUg === 0 && v.pf.partners === 0;
  const goldProgress = Math.min(100, Math.floor(s.ledger.goldUg / 10_000));
  const connected = Object.entries(s.partners);
  const canConnect = PARTNERS.some((x) => !s.partners[x.id] && p.offer[x.id]?.length);

  // Скрытая демо-панель: 5 тапов по логотипу за 2 секунды
  const onLogo = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 2000), now];
    if (taps.current.length >= 5) { taps.current = []; d({ type: 'DEMO_OPEN', open: true }); }
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-[max(12px,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onLogo} className="min-w-0 truncate text-[15px] font-semibold" aria-label={APP_NAME}>{APP_NAME}</button>
        <div className="flex items-center gap-1">
          <DemoBadge short />
          <button type="button" onClick={() => d({ type: 'SHEET', sheet: 'custody' })} aria-label="Кто хранит ваши активы"
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /></svg>
          </button>
        </div>
      </div>

      <div className="px-1">
        <div className="text-[13px] text-muted">Доступно в тенге · {CUSTODY.kzt}</div>
        <div className="tnum mt-1 text-[34px] font-semibold leading-none">{kzt(v.pf.available)}</div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Пополнить', to: 'topup' as const },
          { label: 'Купить', to: 'buy' as const },
          { label: 'Кешбэк', to: 'cashback' as const },
        ].map((a) => (
          <button key={a.label} type="button" onClick={() => { if (a.to === 'buy') d({ type: 'DRAFT_BUY', amount: null }); d({ type: 'NAV', to: a.to }); }}
            className="min-h-[52px] rounded-m bg-surface px-2 text-[14px] font-medium shadow-card">{a.label}</button>
        ))}
      </div>

      {empty ? (
        <Card className="flex flex-col gap-3">
          <div className="text-[17px] font-semibold">Пополните тестовый баланс</div>
          <p className="text-[14px] text-muted">Деньги тестовые. После пополнения можно купить золото от 1 000 ₸.</p>
          <Button onClick={() => d({ type: 'NAV', to: 'topup' })}>Пополнить</Button>
        </Card>
      ) : (
        <>
          <AssetCard
            title="Золото" accent="gold"
            caption={`Хранит ${CUSTODY.gold}`}
            value={grams(s.ledger.goldUg)}
            sub={s.ledger.goldUg > 0 ? `если продать сейчас ≈ ${kzt(v.pf.gold)}` : 'пока нет'}
          >
            {s.ledger.goldUg > 0 && (
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 text-[13px]">
                <div className="flex justify-between text-muted">
                  <span>За 24 ч, ориентировочно</span>
                  <span className="tnum text-text">{signedPct(v.gold24h.pct)} · {signedKzt(v.gold24h.kzt)}</span>
                </div>
                {v.goldSinceBuy !== null && (
                  <div className="flex justify-between text-muted">
                    <span>С покупки (комиссия и разница курсов)</span>
                    <span className="tnum text-text">{signedKzt(v.goldSinceBuy)}</span>
                  </div>
                )}
                <div>
                  <div className="mb-1 flex justify-between text-muted"><span>Цель — 1 г</span><span className="tnum">{goldProgress}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface2"><div className="h-full rounded-full bg-gold" style={{ width: `${goldProgress}%` }} /></div>
                </div>
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { d({ type: 'DRAFT_BUY', amount: null }); d({ type: 'NAV', to: 'buy' }); }}
                className="min-h-[44px] rounded-m bg-accent-soft text-[15px] font-semibold text-accent">{s.ledger.goldUg > 0 ? 'Купить' : 'Купить от 1 000 ₸'}</button>
              <button type="button" disabled={s.ledger.goldUg === 0} onClick={() => d({ type: 'NAV', to: 'sell' })}
                className="min-h-[44px] rounded-m bg-surface2 text-[15px] font-semibold text-text disabled:opacity-40">Продать</button>
            </div>
            <div className="mt-2 flex justify-between">
              <button type="button" onClick={() => d({ type: 'NAV', to: 'gold' })} className="min-h-[44px] text-[14px] font-medium text-accent">Подробнее о золоте</button>
              <button type="button" onClick={() => d({ type: 'SHEET', sheet: 'pricing' })} className="min-h-[44px] text-[14px] font-medium text-accent">Как считается цена</button>
            </div>
          </AssetCard>

          {connected.map(([id, h]) => {
            const def = PARTNERS.find((x) => x.id === id);
            return (
              <AssetCard key={id} title={def?.name ?? id}
                caption={`Только просмотр · обновлено ${UPDATED_AT}`}
                value={`≈ ${kzt(partnerValue(h))}`}
                sub={h.map((x) => `${qty(x.qtyMinor, x.decimals)} ${x.asset}`).join(' · ') + ' · ориентировочно'} />
            );
          })}
          {canConnect && (
            <button type="button" onClick={() => d({ type: 'NAV', to: 'partner' })}
              className="flex min-h-[56px] items-center justify-between rounded-l border border-dashed border-border px-4 text-left">
              <span><span className="block text-[15px] font-semibold">Кошельки партнёров</span><span className="text-[13px] text-muted">Подключите биржу для просмотра баланса</span></span>
              <span className="text-[15px] font-semibold text-accent">Подключить</span>
            </button>
          )}

          <Card className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-semibold">Всего в активах</span>
              <span className="tnum text-[20px] font-semibold">{kzt(v.pf.total)}</span>
            </div>
            <PortfolioBar shares={v.pf.shares} />
            <p className="tnum text-[12px] leading-snug text-muted">
              В приложении {kzt(v.pf.inApp)}{v.pf.partners > 0 && ` · у партнёров ≈ ${kzt(v.pf.partners)} (только просмотр)`}.
              Золото оценено по цене продажи. Это сводная оценка, а не баланс для трат.
            </p>
          </Card>

          <button type="button" onClick={() => d({ type: 'NAV', to: 'cashback' })} className="rounded-l bg-surface p-4 text-left shadow-card">
            <div className="text-[15px] font-semibold">Кешбэк</div>
            <div className="mt-0.5 text-[13px] text-muted">
              {s.cashbackMode
                ? `${s.cashbackMode === 'gold' ? 'Граммами золота' : 'Тенге'} · к зачислению 0 ₸ · следующее зачисление ${CASHBACK.nextCredit}`
                : 'Выберите, как получать: тенге или граммами золота'}
            </div>
          </button>
        </>
      )}
      {!empty && (
        <button type="button" onClick={() => d({ type: 'NAV', to: 'history' })} className="flex min-h-[52px] items-center justify-between rounded-l bg-surface px-4 text-left shadow-card">
          <span className="text-[15px] font-semibold">История операций</span>
          <span className="tnum text-[14px] text-muted">{s.ledger.ops.length}</span>
        </button>
      )}
      <p className="px-1 text-[11px] leading-snug text-muted">Синтетические данные для демо. Названия партнёров условные. Котировки на чт, 5 ноября, {UPDATED_AT}.</p>
    </div>
  );
}
