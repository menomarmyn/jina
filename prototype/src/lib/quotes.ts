// Скриптованный источник котировок. E1 меняет ask только при перекотировке.
import { E1_PRICES, GOLD } from '../mocks/data';

export type E1Mode = 'off' | 'up' | 'down';
export interface Quote { id: string; ask: number; bid: number }

let seq = 0;
const nextId = () => `q-${Date.now().toString(36)}-${++seq}`;

export function baseQuote(): Quote {
  return { id: nextId(), ask: GOLD.ask, bid: GOLD.bid };
}

/** Перекотировка при истечении. «off» — курс остаётся прежним (новая котировка по той же цене). */
export function requote(mode: E1Mode, current: Pick<Quote, 'ask' | 'bid'>): Quote {
  if (mode === 'off') return { id: nextId(), ask: current.ask, bid: current.bid };
  return { id: nextId(), ...E1_PRICES[mode] };
}

/** Имитация сети 400–900 мс. */
export const netDelay = (ms?: number) =>
  new Promise<void>((r) => setTimeout(r, ms ?? 400 + Math.round(Math.random() * 500)));
