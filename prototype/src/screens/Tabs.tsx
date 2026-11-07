// Вкладки вне основного сценария P0: простые рабочие точки входа.
import { AssetCard, Button, Card, DemoBadge, NavBar } from '../components/ui';
import { CUSTODY, GOLD, PARTNERS, PROFILES, UPDATED_AT } from '../mocks/data';
import { grams, kzt } from '../lib/format';
import { homeView, partnerValue } from '../lib/derived';
import { useStore } from '../store';

export function Assets() {
  const { s, d } = useStore();
  const v = homeView(s);
  return (
    <div className="flex flex-col">
      <NavBar title="Активы" />
      <div className="flex flex-col gap-3 px-4 pb-6">
        <AssetCard title="Тенге" caption={`Хранятся в ${CUSTODY.kzt}`} value={kzt(s.ledger.kzt)} sub="доступно для трат" />
        <AssetCard title="Золото" accent="gold" caption={`Хранит ${CUSTODY.gold}`} value={grams(s.ledger.goldUg)}
          sub={`по цене продажи ≈ ${kzt(v.pf.gold)}`}>
          <div className="tnum mt-3 grid grid-cols-2 gap-2 text-[13px] text-muted">
            <span>Покупка {kzt(GOLD.ask)}/г</span><span className="text-right">Продажа {kzt(GOLD.bid)}/г</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button onClick={() => { d({ type: 'DRAFT_BUY', amount: null }); d({ type: 'NAV', to: 'buy' }); }}>Купить</Button>
            <Button variant="secondary" onClick={() => d({ type: 'TOAST', text: 'Продажа в тенге появится в следующей версии демо' })}>Продать</Button>
          </div>
        </AssetCard>
        {Object.entries(s.partners).map(([id, h]) => (
          <AssetCard key={id} title={PARTNERS.find((x) => x.id === id)?.name ?? id} caption={`Только просмотр · обновлено ${UPDATED_AT}`}
            value={`≈ ${kzt(partnerValue(h))}`} sub="ориентировочно" />
        ))}
      </div>
    </div>
  );
}

export function CardTab() {
  return (
    <div className="flex flex-col">
      <NavBar title="Карта" />
      <div className="flex flex-col gap-4 px-4 pb-6">
        <div className="relative aspect-[1.586] w-full overflow-hidden rounded-l bg-accent p-5 text-accent-fg shadow-card">
          <div className="text-[15px] font-semibold">[Название] by BCC</div>
          <div className="tnum absolute bottom-5 left-5 text-[17px] tracking-widest">•••• 4821</div>
          <div className="absolute bottom-5 right-5 text-[12px] opacity-80">Демо-карта</div>
        </div>
        <Card className="text-[14px] leading-snug text-muted">Карта тратит только тенге. Золото и активы партнёров с карты не списываются. Траты по карте — источник кешбэка.</Card>
      </div>
    </div>
  );
}

export function Me() {
  const { s, d } = useStore();
  const p = PROFILES[s.profileId];
  return (
    <div className="flex flex-col">
      <NavBar title="Профиль" />
      <div className="flex flex-col gap-4 px-4 pb-6">
        <Card>
          <div className="text-[17px] font-semibold">{p.name}, {p.age}</div>
          <div className="text-[14px] text-muted">{p.segment}</div>
          <div className="mt-3"><DemoBadge /></div>
        </Card>
        <Card className="text-[14px] leading-snug text-muted">
          Синтетические данные для демо. Деньги, котировки и партнёры тестовые. Никаких личных данных, ключей и seed-фраз.
        </Card>
        <Button variant="secondary" onClick={() => d({ type: 'DEMO_OPEN', open: true })}>Демо-панель</Button>
        <Button variant="ghost" onClick={() => d({ type: 'RESET' })}>Начать демо заново</Button>
      </div>
    </div>
  );
}
