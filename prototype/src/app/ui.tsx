// UI-кит JINA v3. Один запоминающийся элемент — Sun («солнце накоплений»), остальное тихое.
import { useEffect, type ReactNode } from 'react';
import type { BuyCalc } from '../lib/calc';
import { grams, kzt } from '../lib/format';
import type { TabScreen } from './store';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ---------- Иконки (линейные, 24px) ---------- */
const PATHS: Record<string, string> = {
  back: 'M15 18l-6-6 6-6',
  plus: 'M12 5v14M5 12h14',
  arrowDown: 'M12 5v14M6 13l6 6 6-6',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  home: 'M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 21a7.5 7.5 0 0 1 15 0',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z',
  gift: 'M4 11h16v10H4zM2.5 7h19v4h-19zM12 7v14M12 7c-1.5-3-5-3-5-.5S12 7 12 7zm0 0c1.5-3 5-3 5-.5S12 7 12 7z',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 11v6M12 7.5h.01',
  close: 'M6 6l12 12M18 6L6 18',
  chevron: 'M9 6l6 6-6 6',
};
export function Icon({ name, size = 22, className, stroke = 1.8 }: { name: keyof typeof PATHS | string; size?: number; className?: string; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={PATHS[name] ?? ''} />
    </svg>
  );
}

/* ---------- Солнце накоплений ---------- */
const RAYS = 32;
/**
 * Золотой диск с 32 лучами (как на флаге). Лучи зажигаются по мере пути к 1 грамму.
 * animateFrom — прогресс до покупки: новые лучи загораются по одному.
 */
export function Sun({ progress, animateFrom, size = 200, tone = 'dark', children }: {
  progress: number; animateFrom?: number; size?: number; tone?: 'dark' | 'light'; children?: ReactNode;
}) {
  const lit = Math.max(0, Math.min(RAYS, Math.floor(progress * RAYS + 1e-9)));
  const from = animateFrom === undefined ? lit : Math.max(0, Math.min(lit, Math.floor(animateFrom * RAYS + 1e-9)));
  const off = tone === 'dark' ? 'rgba(255,255,255,.16)' : 'var(--line)';
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={`Прогресс к 1 грамму: ${Math.round(progress * 100)}%`}>
        {Array.from({ length: RAYS }, (_, i) => {
          const on = i < lit;
          const anim = on && i >= from;
          return (
            <rect key={i} x="98" y="6" width="4" height="22" rx="2"
              transform={`rotate(${(360 / RAYS) * i} 100 100)`}
              fill={on ? 'var(--sun)' : off}
              className={anim ? 'ray-anim' : undefined}
              style={anim ? { animation: `ray-on 260ms ease-out ${(i - from) * 70 + 250}ms both` } : undefined} />
          );
        })}
        <circle cx="100" cy="100" r="62" fill="var(--sun)" />
        <circle cx="100" cy="100" r="62" fill="url(#sun-shade)" />
        <defs>
          <radialGradient id="sun-shade" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#fff" stopOpacity=".35" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      {children && <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-ink">{children}</div>}
    </div>
  );
}

/* ---------- Кнопки ---------- */
export function Button(props: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'sun';
  loading?: boolean; disabled?: boolean; className?: string; id?: string;
}) {
  const { variant = 'primary', loading, disabled } = props;
  return (
    <button id={props.id} type="button" onClick={loading || disabled ? undefined : props.onClick} disabled={disabled || loading} aria-busy={loading || undefined}
      className={cx('flex min-h-[54px] w-full items-center justify-center gap-2 rounded-field px-5 text-[16px] font-semibold transition-[background,opacity] duration-150 disabled:opacity-40',
        variant === 'primary' && 'bg-ink text-white active:bg-ink-2',
        variant === 'sun' && 'bg-sun text-ink',
        variant === 'secondary' && 'bg-mist text-ink',
        variant === 'ghost' && 'min-h-[44px] text-sky-ink',
        props.className)}>
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {props.children}
    </button>
  );
}

export function RoundAction({ icon, label, onClick, disabled, tone = 'light' }: { icon: string; label: string; onClick: () => void; disabled?: boolean; tone?: 'light' | 'dark' }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex min-w-[64px] flex-col items-center gap-1.5 disabled:opacity-40">
      <span className={cx('flex h-14 w-14 items-center justify-center rounded-full', tone === 'dark' ? 'bg-white/10 text-white' : 'bg-surface text-ink shadow-[0_1px_0_var(--line)]')}>
        <Icon name={icon} />
      </span>
      <span className={cx('text-[13px] font-medium', tone === 'dark' ? 'text-white/80' : 'text-ink')}>{label}</span>
    </button>
  );
}

/* ---------- Каркас экрана ---------- */
export function TopBar({ title, onBack, right, tone = 'light' }: { title?: string; onBack?: () => void; right?: ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <div className={cx('flex h-14 shrink-0 items-center gap-1 px-2', tone === 'dark' && 'text-white')}>
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Назад" className="flex h-11 w-11 items-center justify-center rounded-full"><Icon name="back" /></button>
      ) : <span className="w-11" />}
      <div className="flex-1 truncate text-center text-[16px] font-semibold">{title}</div>
      <div className="flex w-11 justify-end">{right}</div>
    </div>
  );
}

export function Display({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('tnum font-display font-semibold leading-none tracking-[-0.02em]', className)}>{children}</div>;
}

/** Группа плоских строк с разделителями — вместо стопки одинаковых карточек. */
export function Group({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('divide-y divide-line overflow-hidden rounded-[20px] bg-surface', className)}>{children}</div>;
}

export function Row({ label, value, sub, strong, onClick, icon, accent }: {
  label: ReactNode; value?: ReactNode; sub?: ReactNode; strong?: boolean; onClick?: () => void; icon?: ReactNode; accent?: 'sun' | 'sky';
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left">
      {icon && <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', accent === 'sun' ? 'bg-sun-soft text-sun-ink' : accent === 'sky' ? 'bg-sky-soft text-sky-ink' : 'bg-mist text-ink')}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className={cx('block text-[15px]', strong ? 'font-semibold' : 'text-ink')}>{label}</span>
        {sub && <span className="block text-[13px] text-muted">{sub}</span>}
      </span>
      {value !== undefined && <span className={cx('tnum shrink-0 text-right text-[15px]', strong && 'font-semibold')}>{value}</span>}
      {onClick && <Icon name="chevron" size={18} className="shrink-0 text-muted" />}
    </Tag>
  );
}

export function KV({ label, value, strong, muted }: { label: ReactNode; value: ReactNode; strong?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className={cx('text-[15px]', muted ? 'text-muted' : 'text-muted')}>{label}</span>
      <span className={cx('tnum text-right', strong ? 'text-[17px] font-semibold text-ink' : 'text-[15px] text-ink')}>{value}</span>
    </div>
  );
}

export function PricePair({ ask, bid, tone = 'light' }: { ask: number; bid: number; tone?: 'light' | 'dark' }) {
  const box = tone === 'dark' ? 'bg-white/10 text-white' : 'bg-mist text-ink';
  const lab = tone === 'dark' ? 'text-white/65' : 'text-muted';
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className={cx('rounded-field px-3 py-2.5', box)}><div className={cx('text-[12px]', lab)}>Покупка за 1 г</div><div className="tnum text-[15px] font-semibold">{kzt(ask)}</div></div>
      <div className={cx('rounded-field px-3 py-2.5', box)}><div className={cx('text-[12px]', lab)}>Продажа за 1 г</div><div className="tnum text-[15px] font-semibold">{kzt(bid)}</div></div>
    </div>
  );
}

export function Risk({ short }: { short?: boolean }) {
  return (
    <p className="flex gap-2.5 rounded-field bg-warn-soft px-3.5 py-3 text-[13px] leading-snug text-ink" role="note">
      <Icon name="info" size={18} className="mt-px shrink-0 text-sun-ink" />
      <span>Цена золота может снижаться. Это не вклад, доходность не гарантируется.{!short && ' При продаже можно получить меньше, чем вы заплатили.'}</span>
    </p>
  );
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cx('tnum min-h-[44px] flex-1 rounded-full px-3 text-[15px] font-medium transition-colors', active ? 'bg-ink text-white' : 'bg-surface text-ink shadow-[inset_0_0_0_1px_var(--line)]')}>
      {children}
    </button>
  );
}

export function AmountField({ value, onChange, id, label }: { value: number | null; onChange: (v: number | null) => void; id: string; label: string }) {
  return (
    <label htmlFor={id} className="block px-2 pt-4 text-center">
      <span className="text-[14px] text-muted">{label}</span>
      <div className="mt-2 flex items-baseline justify-center gap-2">
        <input id={id} inputMode="numeric" autoComplete="off" placeholder="0"
          value={value === null ? '' : new Intl.NumberFormat('ru-RU').format(value)}
          onChange={(e) => { const d = e.target.value.replace(/\D/g, '').slice(0, 7); onChange(d ? Number(d) : null); }}
          style={{ width: `${Math.max(1, (value === null ? '0' : new Intl.NumberFormat('ru-RU').format(value)).length) * 0.74 + 0.15}em` }}
          className="tnum min-w-0 max-w-full bg-transparent text-center font-display text-[44px] font-semibold tracking-[-0.02em] text-ink outline-none placeholder:text-line" />
        <span className="font-display text-[30px] font-semibold text-muted">₸</span>
      </div>
    </label>
  );
}

export function Timer({ seconds, total, tone = 'light' }: { seconds: number; total: number; tone?: 'light' | 'dark' }) {
  const pct = Math.max(0, Math.min(1, seconds / total));
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className={cx('h-1.5 flex-1 overflow-hidden rounded-full', tone === 'dark' ? 'bg-white/15' : 'bg-mist')}>
        <div className="h-full rounded-full bg-sky transition-[width] duration-1000 ease-linear" style={{ width: `${pct * 100}%` }} />
      </div>
      <span className={cx('tnum shrink-0 whitespace-nowrap text-right text-[13px]', tone === 'dark' ? 'text-white/70' : 'text-muted')}>Курс держится {seconds} с</span>
    </div>
  );
}

/** Расчёт покупки до подтверждения (H3). */
export function Breakdown({ q, ask, bid }: { q: BuyCalc; ask: number; bid: number }) {
  return (
    <div>
      <KV label="Спишем" value={kzt(q.amount)} strong />
      <KV label="Комиссия 1%, уже внутри" value={kzt(q.fee)} />
      <KV label="Идёт на золото" value={kzt(q.net)} />
      <div className="my-2"><PricePair ask={ask} bid={bid} /></div>
      <KV label="Вы получите" value={<span className="font-semibold text-sun-ink">{grams(q.ug)}</span>} strong />
      <div className="mt-3 rounded-field bg-sun-soft px-4 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[15px] font-medium">Если продать сразу</span>
          <span className="tnum font-display text-[20px] font-semibold">≈ {kzt(q.sellNow)}</span>
        </div>
        <p className="mt-1 text-[13px] text-muted">На {kzt(q.amount - q.sellNow)} меньше: комиссия и разница курсов покупки и продажи.</p>
      </div>
    </div>
  );
}

/** Состав активов: тенге · золото · у партнёров. */
export function Composition({ shares }: { shares: { kzt: number; gold: number; partners: number } }) {
  const parts = [
    { k: 'kzt', label: 'Тенге', v: shares.kzt, c: 'var(--sky)' },
    { k: 'gold', label: 'Золото', v: shares.gold, c: 'var(--sun)' },
    { k: 'partners', label: 'У партнёров', v: shares.partners, c: 'var(--muted)' },
  ].filter((p) => p.v > 0);
  const nf = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <div>
      <div className="flex h-2.5 w-full gap-1 overflow-hidden rounded-full">
        {parts.map((p) => <div key={p.k} className="rounded-full" style={{ width: `${p.v / 10}%`, background: p.c }} />)}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
        {parts.map((p) => (
          <span key={p.k} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: p.c }} />{p.label} <span className="tnum text-ink">{nf.format(p.v / 10)}%</span></span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Оверлеи ---------- */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose?: () => void; title?: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="anim-fade absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="anim-sheet scroll-area relative max-h-[90%] rounded-t-hero bg-paper px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        {title && <h2 className="mb-3 font-display text-[20px] font-semibold leading-tight tracking-[-0.01em]">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

export function Toast({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, [text, onDone]);
  return (
    <div className="anim-sheet pointer-events-none absolute inset-x-4 bottom-[calc(96px+env(safe-area-inset-bottom))] z-50 flex items-center gap-2 rounded-field bg-ink px-4 py-3 text-[14px] text-white shadow-lg" role="status">
      <Icon name="check" size={18} className="text-sun" />{text}
    </div>
  );
}

export function Notice({ tone = 'danger', title, children }: { tone?: 'danger' | 'warn'; title: string; children?: ReactNode }) {
  return (
    <div className={cx('rounded-field p-4', tone === 'danger' ? 'bg-danger-soft' : 'bg-warn-soft')}>
      <div className={cx('text-[16px] font-semibold', tone === 'danger' ? 'text-danger' : 'text-sun-ink')}>{title}</div>
      {children && <div className="mt-1 text-[14px] leading-snug text-ink">{children}</div>}
    </div>
  );
}

/* ---------- Навигация ---------- */
const TABS: { id: TabScreen; label: string; icon: string }[] = [
  { id: 'home', label: 'Главная', icon: 'home' },
  { id: 'gold', label: 'Золото', icon: 'sun' },
  { id: 'learn', label: 'Учёба', icon: 'book' },
  { id: 'me', label: 'Профиль', icon: 'user' },
];
export function TabBar({ active, onChange }: { active: TabScreen; onChange: (t: TabScreen) => void }) {
  return (
    <nav className="flex shrink-0 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur" aria-label="Разделы">
      {TABS.map((t) => (
        <button key={t.id} type="button" onClick={() => onChange(t.id)} aria-current={active === t.id ? 'page' : undefined}
          className={cx('flex min-h-[58px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium', active === t.id ? 'text-ink' : 'text-muted')}>
          <span className={cx('flex h-7 w-12 items-center justify-center rounded-full', active === t.id && 'bg-sky-soft')}><Icon name={t.icon} size={20} /></span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cx('font-display text-[20px] font-semibold tracking-[-0.02em]', className)}>JINA</span>;
}
