// Скриптованный источник котировок. E1 меняет ask только при перекотировке.
import { E1_PRICES, GOLD } from '../mocks/data';

export type E1Mode = 'off' | 'up' | 'down';
export interface Quote { id: string; ask: number; bid: number }

let seq = 0;
const nextId = () => `q-${Date.now().toString(36)}-${++seq}`;

export function baseQuote(): Quote {
  return { id: nextId(), ask: GOLD.ask, bid: GOLD.bid };
}

export function requote(mode: E1Mode): Quote {
  if (mode === 'off') return baseQuote();
  return { id: nextId(), ...E1_PRICES[mode] };
}

/** Имитация сети 400–900 мс. */
export const netDelay = (ms?: number) =>
  new Promise<void>((r) => setTimeout(r, ms ?? 400 + Math.round(Math.random() * 500)));
