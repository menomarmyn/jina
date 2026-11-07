// «Метрики демо»: только события текущей демо-сессии. Не исследование и не результаты пользователей.
import { useState } from 'react';
import { Button, Card, NavBar } from '../components/ui';
import { clearEvents, getEvents } from '../lib/events';
import { funnel, goldChoice, timeToFundedHome } from '../lib/metrics';
import { useStore } from '../store';

const timeFmt = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export function Metrics() {
  const { d } = useStore();
  const [ev, setEv] = useState(() => [...getEvents()]);
  const rows = funnel(ev);
  const ttv = timeToFundedHome(ev);
  const choice = goldChoice(ev);

  return (
    <div className="flex h-full flex-col">
      <NavBar title="Метрики демо" onBack={() => d({ type: 'BACK' })} />
      <div className="scroll-area flex flex-1 flex-col gap-4 px-4 pb-6">
        <div className="rounded-m border-2 border-warning bg-warning-soft p-3 text-[14px] font-semibold leading-snug text-warning">
          Демо-сессия, не исследование. Здесь только события этого прохода по прототипу. Строки «Цель пилота» — пороги гипотез, а не результаты.
        </div>

        <Card className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-semibold">Воронка этой сессии</span>
            <span className="text-[12px] text-muted">событий: {ev.length}</span>
          </div>
          {rows.map((r) => (
            <div key={r.id} className="flex flex-col gap-1 border-t border-border pt-3">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[14px]"><span className="mr-1.5 rounded bg-surface2 px-1.5 py-0.5 text-[11px] font-semibold text-muted">{r.hypothesis}</span>{r.title}</span>
                <span className="tnum shrink-0 text-[15px] font-semibold">{r.fromCount ? `${r.toCount} из ${r.fromCount}` : '—'}</span>
              </div>
              <div className="text-[12px] text-muted">Цель пилота: {r.target}</div>
            </div>
          ))}
          <div className="flex flex-col gap-1 border-t border-border pt-3">
            <div className="flex justify-between gap-3 text-[14px]">
              <span><span className="mr-1.5 rounded bg-surface2 px-1.5 py-0.5 text-[11px] font-semibold text-muted">H1</span>Время до главной с балансом</span>
              <span className="tnum font-semibold">{ttv === null ? '—' : `${Math.floor(ttv / 60)} мин ${ttv % 60} с`}</span>
            </div>
            <div className="text-[12px] text-muted">Цель: меньше 3 минут</div>
          </div>
          <div className="flex flex-col gap-1 border-t border-border pt-3">
            <div className="flex justify-between gap-3 text-[14px]">
              <span><span className="mr-1.5 rounded bg-surface2 px-1.5 py-0.5 text-[11px] font-semibold text-muted">H4</span>Выбор кешбэка в этой сессии</span>
              <span className="font-semibold">{choice === 'gold' ? 'Золото' : choice === 'kzt' ? 'Тенге' : '—'}</span>
            </div>
            <div className="text-[12px] text-muted">Цель: золото выбирают ≥ 40% увидевших выбор (ниже 15% — пересмотр)</div>
          </div>
        </Card>

        <Card className="text-[13px] leading-snug text-muted">
          <div className="mb-1 text-[15px] font-semibold text-text">Что измеряем только в пилоте</div>
          Возвраты D7 / D30, повторная покупка за 30 дней, остаток в тенге на пользователя. Из одного демо их получить нельзя.
        </Card>

        <Card className="flex flex-col gap-1">
          <div className="mb-1 text-[15px] font-semibold">Лог событий</div>
          {ev.length === 0 && <p className="text-[13px] text-muted">Пока пусто. Пройдите сценарий — события появятся здесь.</p>}
          {[...ev].reverse().slice(0, 30).map((e, i) => (
            <div key={`${e.ts}-${i}`} className="tnum flex justify-between gap-3 text-[12px]">
              <span className="font-mono text-text">{e.name}</span>
              <span className="text-muted">{timeFmt.format(e.ts)}</span>
            </div>
          ))}
        </Card>

        <Button variant="secondary" onClick={() => { clearEvents(); setEv([]); }}>Очистить лог демо-сессии</Button>
      </div>
    </div>
  );
}
