import { useState } from 'react';
import { Button, Card, NavBar, PartnerRow } from '../components/ui';
import { PARTNERS, PROFILES, UPDATED_AT, type PartnerDef } from '../mocks/data';
import { kzt, qty } from '../lib/format';
import { partnerValue } from '../lib/derived';
import { netDelay } from '../lib/quotes';
import { track } from '../lib/events';
import { useStore } from '../store';

/** Подключение партнёра в 2 шага: выбор → согласие → подключено. */
export function PartnerConnect() {
  const { s, d } = useStore();
  const p = PROFILES[s.profileId];
  const [step, setStep] = useState<'list' | 'consent' | 'done'>('list');
  const [partner, setPartner] = useState<PartnerDef | null>(null);
  const [loading, setLoading] = useState(false);
  const holdings = partner ? p.offer[partner.id] ?? [] : [];

  const allow = async () => {
    if (!partner) return;
    setLoading(true);
    await netDelay(900);
    d({ type: 'CONNECT_PARTNER', id: partner.id });
    track('partner_sync_succeeded', { partner: partner.id });
    setLoading(false);
    setStep('done');
  };

  return (
    <div className="flex h-full flex-col">
      <NavBar title="Кошельки партнёров" onBack={() => (step === 'consent' ? setStep('list') : d({ type: 'BACK' }))} />
      <div className="scroll-area flex flex-1 flex-col gap-4 px-4 pb-6">
        {step === 'list' && (
          <>
            <p className="text-[15px] text-muted">Подключите биржу-партнёра, чтобы видеть её баланс в общем портфеле. Только просмотр.</p>
            <div className="flex flex-col gap-2">
              {PARTNERS.map((x) => {
                const connected = !!s.partners[x.id];
                const available = !!p.offer[x.id]?.length;
                return (
                  <PartnerRow key={x.id} name={x.name} note={connected ? 'Подключено' : available ? x.note : 'В этом профиле нет кошелька'}
                    onClick={connected || !available ? undefined : () => { setPartner(x); setStep('consent'); track('partner_consent_started', { partner: x.id }); }}
                    right={!connected && available ? <span className="text-[15px] font-semibold text-accent">Выбрать</span> : undefined} />
                );
              })}
            </div>
          </>
        )}
        {step === 'consent' && partner && (
          <>
            <h1 className="text-[22px] font-semibold leading-tight">Разрешить просмотр баланса {partner.name}?</h1>
            <Card className="flex flex-col gap-3 text-[15px]">
              <div><div className="font-semibold">Что мы увидим</div><p className="text-muted">Балансы активов на бирже.</p></div>
              <div><div className="font-semibold">Чего не сможем</div><p className="text-muted">Торговать, переводить и выводить. Ключи, пароли и seed-фразы не нужны.</p></div>
              <div><div className="font-semibold">Как отозвать</div><p className="text-muted">В профиле приложения или в настройках биржи в любой момент.</p></div>
            </Card>
            <p className="text-[12px] text-muted">Демо: подключение имитируется, реального доступа к бирже нет.</p>
            <div className="mt-auto flex flex-col gap-3">
              <Button loading={loading} onClick={allow}>Разрешить просмотр (демо)</Button>
              <Button variant="secondary" onClick={() => setStep('list')}>Отмена</Button>
            </div>
          </>
        )}
        {step === 'done' && partner && (
          <>
            <h1 className="mt-4 text-[24px] font-semibold">Подключено</h1>
            <Card className="flex flex-col gap-1">
              <div className="text-[15px] font-semibold">{partner.name}</div>
              <div className="tnum text-[20px] font-semibold">{holdings.map((h) => `${qty(h.qtyMinor, h.decimals)} ${h.asset}`).join(' · ')}</div>
              <div className="tnum text-[14px] text-muted">≈ {kzt(partnerValue(holdings))}, ориентировочно · обновлено {UPDATED_AT}</div>
              <p className="mt-2 text-[13px] text-muted">Только просмотр: эти активы нельзя потратить из приложения. Оценены по курсу продажи приложения, у партнёра цена может отличаться.</p>
            </Card>
            <div className="mt-auto"><Button onClick={() => d({ type: 'NAV', to: 'home' })}>На главную</Button></div>
          </>
        )}
      </div>
    </div>
  );
}
