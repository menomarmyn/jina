import { useEffect, useState } from 'react';
import { Button, Card, NavBar, PresetChip } from '../components/ui';
import { CUSTODY, TOPUP_MAX, TOPUP_PRESETS } from '../mocks/data';
import { kzt } from '../lib/format';
import { netDelay } from '../lib/quotes';
import { track } from '../lib/events';
import { opId, useStore } from '../store';

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
    <div className="flex h-full flex-col">
      <NavBar title="Пополнение" onBack={() => d({ type: 'BACK' })} />
      <div className="flex flex-1 flex-col gap-4 px-4 pb-6">
        <Card className="text-center">
          <div className="text-[13px] text-muted">Пополнить тестовым балансом</div>
          <div className="tnum mt-1 text-[36px] font-semibold">{kzt(amount)}</div>
          <div className="mt-1 text-[13px] text-muted">Сейчас на счёте {kzt(s.ledger.kzt)}</div>
        </Card>
        <div className="flex gap-2">
          {presets.map((p) => <PresetChip key={p} active={p === amount} onClick={() => setAmount(p)}>{kzt(p)}</PresetChip>)}
        </div>
        <p className="rounded-m bg-surface2 p-3 text-[13px] text-muted">Тестовые деньги. Тенге хранятся на счёте в {CUSTODY.kzt}. До {kzt(TOPUP_MAX)} за раз.</p>
        <div className="mt-auto"><Button loading={loading} onClick={submit}>Пополнить на {kzt(amount)}</Button></div>
      </div>
    </div>
  );
}
