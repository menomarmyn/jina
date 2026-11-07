// История операций текущей сессии со статусами.
import { Card, NavBar } from '../components/ui';
import { grams, kzt } from '../lib/format';
import type { Op } from '../lib/ledger';
import { useStore } from '../store';

const dt = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });

function describe(op: Op) {
  switch (op.kind) {
    case 'topup': return { title: 'Пополнение тестовым балансом', sum: `+${kzt(op.amount)}`, sub: 'Тенге · BCC' };
    case 'buy': return { title: 'Покупка золота', sum: `−${kzt(op.amount)}`, sub: `+${grams(op.ug ?? 0)} по ${kzt(op.ask ?? 0)}/г · комиссия ${kzt(op.fee ?? 0)}` };
    case 'sell': return { title: 'Продажа золота', sum: `+${kzt(op.amount)}`, sub: `−${grams(op.ug ?? 0)} по ${kzt(op.bid ?? 0)}/г · комиссия ${kzt(op.fee ?? 0)}` };
  }
}

export function History() {
  const { s, d } = useStore();
  const ops = [...s.ledger.ops].reverse();
  return (
    <div className="flex h-full flex-col">
      <NavBar title="История операций" onBack={() => d({ type: 'BACK' })} />
      <div className="scroll-area flex flex-1 flex-col gap-2 px-4 pb-6">
        {ops.length === 0 && (
          <Card><p className="text-[15px] text-muted">Операций пока нет. Здесь появятся пополнения, покупки и продажи этой демо-сессии.</p></Card>
        )}
        {ops.map((op) => {
          const x = describe(op);
          const pending = op.status === 'pending';
          return (
            <div key={op.id} className="flex items-start justify-between gap-3 rounded-m bg-surface p-3 shadow-card">
              <div className="min-w-0">
                <div className="text-[15px] font-semibold">{x.title}</div>
                <div className="tnum text-[13px] text-muted">{x.sub}</div>
                <div className="mt-1 flex items-center gap-2 text-[12px]">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${pending ? 'bg-warning-soft text-warning' : 'bg-accent-soft text-accent'}`}>
                    {pending ? 'Проверяем статус' : 'Выполнено'}
                  </span>
                  <span className="tnum text-muted">{dt.format(op.ts)}</span>
                </div>
              </div>
              <span className={`tnum shrink-0 text-[15px] font-semibold ${pending ? 'text-muted' : ''}`}>{x.sum}</span>
            </div>
          );
        })}
        <p className="px-1 pt-2 text-[12px] text-muted">Синтетические данные для демо. Операции хранятся только в этом браузере.</p>
      </div>
    </div>
  );
}
