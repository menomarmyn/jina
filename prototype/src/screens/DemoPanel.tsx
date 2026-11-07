// Скрытая демо-панель для защиты: 5 тапов по логотипу или ?demo=1.
import type { ReactNode } from 'react';
import { BottomSheet } from '../components/ui';
import { PROFILES, type ProfileId } from '../mocks/data';
import { clearEvents } from '../lib/events';
import type { E1Mode } from '../lib/quotes';
import { useStore } from '../store';

function Chip({ on, onClick, children }: { on?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`min-h-[44px] rounded-full border px-3 text-[14px] ${on ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-surface'}`}>
      {children}
    </button>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[12px] font-semibold uppercase tracking-wide text-muted">{title}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function DemoPanel() {
  const { s, d } = useStore();
  const close = () => d({ type: 'DEMO_OPEN', open: false });
  const inConfirm = s.screen === 'confirm';
  return (
    <BottomSheet open={s.demoOpen} onClose={close} title="Демо-панель">
      <div className="flex flex-col gap-4 pb-2">
        <Group title="Сценарий">
          <Chip onClick={() => { clearEvents(); d({ type: 'RESET', profileId: 'dauren', onboarded: false }); }}>Сброс к онбордингу</Chip>
          <Chip onClick={() => d({ type: 'LOAD_FINAL' })}>Итог сценария Даурена</Chip>
        </Group>
        <Group title="Курс при истечении котировки (E1)">
          {(['off', 'up', 'down'] as E1Mode[]).map((m) => (
            <Chip key={m} on={s.demo.e1 === m} onClick={() => d({ type: 'DEMO', patch: { e1: m } })}>{m === 'off' ? 'Без изменений' : m === 'up' ? 'Вверх' : 'Вниз'}</Chip>
          ))}
          <Chip onClick={() => (inConfirm ? d({ type: 'EXPIRE_NOW' }) : d({ type: 'TOAST', text: 'Откройте экран подтверждения покупки' }))}>Истечь котировку сейчас</Chip>
        </Group>
        <Group title="Ошибки">
          <Chip onClick={() => d({ type: 'PRESET_ERROR', kzt: 10_000, amount: 15_000 })}>E2: не хватает тенге</Chip>
          <Chip onClick={() => d({ type: 'PRESET_ERROR', kzt: 100_000, amount: 60_000 })}>E3: условный лимит</Chip>
          <Chip on={s.demo.e4} onClick={() => d({ type: 'DEMO', patch: { e4: !s.demo.e4 } })}>E4: ответ завис</Chip>
        </Group>
        <Group title="Кешбэк">
          <Chip on={s.demo.shuffleCashback} onClick={() => d({ type: 'DEMO', patch: { shuffleCashback: !s.demo.shuffleCashback } })}>Золото первым</Chip>
        </Group>
        <Group title="Профиль">
          {(Object.keys(PROFILES) as ProfileId[]).map((id) => (
            <Chip key={id} on={s.profileId === id} onClick={() => d({ type: 'SELECT_PROFILE', id })}>{PROFILES[id].name}</Chip>
          ))}
        </Group>
      </div>
    </BottomSheet>
  );
}
