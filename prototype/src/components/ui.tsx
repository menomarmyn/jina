// Базовые компоненты. Имена совпадают со спецификацией (потом — с компонентами Figma).
import { useEffect, type ReactNode } from 'react';
import { grams, kzt, shareTenths } from '../lib/format';
import type { BuyCalc } from '../lib/calc';
import type { TabScreen } from '../store';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export function Button(props: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean; disabled?: boolean; className?: string; id?: string;
}) {
  const { variant = 'primary', loading, disabled } = props;
  return (
    <button
      id={props.id}
      type="button"
      onClick={loading || disabled ? undefined : props.onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'min-h-[52px] w-full rounded-m px-5 text-[16px] font-semibold transition-colors duration-150',
        'flex items-center justify-center gap-2',
        variant === 'primary' && 'bg-accent text-accent-fg disabled:opacity-40',
        variant === 'secondary' && 'bg-surface2 text-text disabled:opacity-40',
        variant === 'ghost' && 'text-accent min-h-[44px]',
        props.className,
      )}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {props.children}
    </button>
  );
}

export function NavBar({ title, onBack, right }: { title?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2 px-2">
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Назад" className="flex h-11 w-11 items-center justify-center rounded-full text-text">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      ) : <span className="w-11" />}
      <div className="flex-1 truncate text-center text-[17px] font-semibold">{title}</div>
      <div className="flex w-11 justify-end">{right}</div>
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('rounded-l bg-surface p-4 shadow-card', className)}>{children}</div>;
}

export function Row({ label, value, strong, muted }: { label: ReactNode; value: ReactNode; strong?: boolean; muted?: boolean }) {
  return (
    <div className={cx('flex items-baseline justify-between gap-4 py-1.5 text-[15px]', muted && 'text-muted')}>
      <span className={cx(!muted && 'text-muted')}>{label}</span>
      <span className={cx('tnum text-right', strong && 'text-[17px] font-semibold text-text')}>{value}</span>
    </div>
  );
}

export function RiskBanner({ compact }: { compact?: boolean }) {
  return (
    <div className="flex gap-3 rounded-m bg-warning-soft p-3 text-[13px] leading-snug text-text" role="note">
      <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning text-[12px] font-bold text-white">!</span>
      <span>
        Цена золота может снижаться. Это не вклад, доходность не гарантируется.
        {!compact && ' При продаже можно получить меньше, чем вы заплатили.'}
      </span>
    </div>
  );
}

export function PresetChip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx('tnum min-h-[44px] flex-1 rounded-full border px-3 text-[15px] font-medium transition-colors',
        active ? 'border-accent bg-accent-soft text-accent' : 'border-border bg-surface text-text')}
    >{children}</button>
  );
}

export function AmountInput({ value, onChange, id, label = 'Сумма покупки' }: { value: number | null; onChange: (v: number | null) => void; id: string; label?: string }) {
  return (
    <label htmlFor={id} className="block rounded-l bg-surface px-4 py-5 text-center shadow-card">
      <span className="text-[13px] text-muted">{label}</span>
      <div className="mt-1 flex items-baseline justify-center gap-1">
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={value === null ? '' : new Intl.NumberFormat('ru-RU').format(value)}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 7);
            onChange(digits ? Number(digits) : null);
          }}
          className="tnum w-full min-w-0 bg-transparent text-center text-[36px] font-semibold outline-none placeholder:text-border"
        />
        <span className="text-[28px] font-semibold text-muted">₸</span>
      </div>
    </label>
  );
}

export function QuoteTimer({ seconds, total }: { seconds: number; total: number }) {
  const pct = Math.max(0, Math.min(1, seconds / total));
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface2">
        <div className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-linear" style={{ width: `${pct * 100}%` }} />
      </div>
      <span className="tnum w-[150px] text-right text-[13px] text-muted">Курс держится {seconds} с</span>
    </div>
  );
}

export function PriceRow({ ask, bid }: { ask: number; bid: number }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-m bg-surface2 px-3 py-2">
        <div className="text-[12px] text-muted">Курс покупки за 1 г</div>
        <div className="tnum text-[15px] font-semibold">{kzt(ask)}</div>
      </div>
      <div className="rounded-m bg-surface2 px-3 py-2">
        <div className="text-[12px] text-muted">Курс продажи за 1 г</div>
        <div className="tnum text-[15px] font-semibold">{kzt(bid)}</div>
      </div>
    </div>
  );
}

/** Полный расчёт покупки до подтверждения (H3). */
export function FeeBreakdown({ q, ask, bid }: { q: BuyCalc; ask: number; bid: number }) {
  const lost = q.amount - q.sellNow;
  return (
    <div className="flex flex-col">
      <Row label="Спишем" value={kzt(q.amount)} strong />
      <Row label="Комиссия 1%, уже внутри суммы" value={kzt(q.fee)} />
      <Row label="Идёт на золото" value={kzt(q.net)} />
      <div className="my-2"><PriceRow ask={ask} bid={bid} /></div>
      <Row label="Вы получите" value={<span className="font-semibold text-gold">{grams(q.ug)}</span>} strong />
      <div className="mt-2 rounded-m border border-border p-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[15px]">Если продать сразу</span>
          <span className="tnum text-[17px] font-semibold">≈ {kzt(q.sellNow)}</span>
        </div>
        <p className="mt-1 text-[13px] text-muted">На {kzt(lost)} меньше: комиссия и разница курсов покупки и продажи.</p>
      </div>
    </div>
  );
}

export function PortfolioBar({ shares }: { shares: { kzt: number; gold: number; partners: number } }) {
  const parts = [
    { key: 'kzt', label: 'Тенге', v: shares.kzt, color: 'var(--accent)' },
    { key: 'gold', label: 'Золото', v: shares.gold, color: 'var(--gold)' },
    { key: 'partners', label: 'У партнёров', v: shares.partners, color: 'var(--text-muted)' },
  ].filter((p) => p.v > 0);
  return (
    <div>
      <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-surface2">
        {parts.map((p) => <div key={p.key} style={{ width: `${p.v / 10}%`, background: p.color }} />)}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
        {parts.map((p) => (
          <span key={p.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.label} <span className="tnum text-text">{shareTenths(p.v)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function AssetCard({ title, caption, value, sub, accent, onClick, children }: {
  title: string; caption?: ReactNode; value: ReactNode; sub?: ReactNode; accent?: 'gold'; onClick?: () => void; children?: ReactNode;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} className="block w-full rounded-l bg-surface p-4 text-left shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[15px] font-semibold">
            {accent === 'gold' && <span className="h-2.5 w-2.5 rounded-full bg-gold" aria-hidden />}
            {title}
          </div>
          {caption && <div className="mt-0.5 text-[13px] text-muted">{caption}</div>}
        </div>
        <div className="text-right">
          <div className="tnum text-[17px] font-semibold">{value}</div>
          {sub && <div className="tnum mt-0.5 text-[13px] text-muted">{sub}</div>}
        </div>
      </div>
      {children}
    </Tag>
  );
}

export function PartnerRow({ name, note, onClick, right }: { name: string; note: string; onClick?: () => void; right?: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-[60px] w-full items-center gap-3 rounded-m border border-border bg-surface px-4 py-3 text-left">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface2 text-[14px] font-semibold text-muted">{name[0]}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">{name}</span>
        <span className="block text-[13px] text-muted">{note}</span>
      </span>
      {right}
    </button>
  );
}

export function RadioCard({ selected, onSelect, title, children, id }: {
  selected: boolean; onSelect: () => void; title: string; children: ReactNode; id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cx('w-full rounded-l border-2 bg-surface p-4 text-left transition-colors', selected ? 'border-accent' : 'border-transparent shadow-card')}
    >
      <div className="flex items-center justify-between">
        <span className="text-[17px] font-semibold">{title}</span>
        <span className={cx('flex h-6 w-6 items-center justify-center rounded-full border-2', selected ? 'border-accent' : 'border-border')}>
          {selected && <span className="h-3 w-3 rounded-full bg-accent" />}
        </span>
      </div>
      <div className="mt-2 text-[14px] leading-snug text-muted">{children}</div>
    </button>
  );
}

export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose?: () => void; title?: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="anim-fade absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="anim-sheet scroll-area relative max-h-[88%] rounded-t-[24px] bg-bg px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        {title && <h2 className="mb-3 text-[20px] font-semibold leading-tight">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

export function Toast({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [text, onDone]);
  return (
    // Прижат к низу над таб-баром и кнопками действий, не перекрывает шапку; клики проходят насквозь
    <div className="anim-sheet pointer-events-none absolute inset-x-4 bottom-[calc(92px+env(safe-area-inset-bottom))] z-50 rounded-m bg-text px-4 py-3 text-[14px] text-bg shadow-card" role="status">
      {text}
    </div>
  );
}

export function ErrorState({ tone = 'negative', title, children }: { tone?: 'negative' | 'warning'; title: string; children?: ReactNode }) {
  return (
    <div className={cx('rounded-m p-4', tone === 'negative' ? 'bg-negative-soft' : 'bg-warning-soft')}>
      <div className={cx('text-[16px] font-semibold', tone === 'negative' ? 'text-negative' : 'text-warning')}>{title}</div>
      {children && <div className="mt-1 text-[14px] leading-snug text-text">{children}</div>}
    </div>
  );
}

const TABS: { id: TabScreen; label: string; icon: string }[] = [
  { id: 'home', label: 'Главная', icon: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z' },
  { id: 'assets', label: 'Активы', icon: 'M4 19V9m6 10V5m6 14v-7m4 7H2' },
  { id: 'card', label: 'Карта', icon: 'M3 6h18v12H3zM3 10h18' },
  { id: 'cashback', label: 'Кешбэк', icon: 'M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6' },
  { id: 'me', label: 'Профиль', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0' },
];

export function TabBar({ active, onChange }: { active: TabScreen; onChange: (t: TabScreen) => void }) {
  return (
    <nav className="flex shrink-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]" aria-label="Разделы">
      {TABS.map((t) => (
        <button key={t.id} type="button" onClick={() => onChange(t.id)} aria-current={active === t.id ? 'page' : undefined}
          className={cx('flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px]', active === t.id ? 'text-accent' : 'text-muted')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
          {t.label}
        </button>
      ))}
    </nav>
  );
}

export function DemoBadge({ short }: { short?: boolean }) {
  return (
    <span className="whitespace-nowrap rounded-full bg-surface2 px-2.5 py-1 text-[11px] font-medium text-muted" title="Синтетические данные для демо">
      {short ? 'Демо' : 'Демо · синтетические данные'}
    </span>
  );
}
