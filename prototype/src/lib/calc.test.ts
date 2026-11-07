import { describe, expect, it } from 'vitest';
import { cashbackMonth, cashbackToGold, goalProgress, holdingValue, largestRemainder, portfolio, quoteBuy, sellForKzt, validateBuy } from './calc';
import { applyOp, type Ledger, type Op } from './ledger';
import { requote } from './quotes';
import { grams, kzt, shareTenths } from './format';
import { CASHBACK, E1_PRICES, GOLD, GOLD_MARKS_UG, GOLD_WEEK, LIMITS, USDT } from '../mocks/data';

const ctx = (k: number, spent = 0) => ({ kzt: k, spentToday: spent, min: LIMITS.min, dailyLimit: LIMITS.daily });

describe('покупка золота', () => {
  it('10 000 ₸ при 61 875: 0,1600 г, при продаже 9 800 ₸', () => {
    const q = quoteBuy(10_000, GOLD.ask, GOLD.bid);
    expect(q).toEqual({ amount: 10_000, fee: 100, net: 9_900, ug: 160_000, sellNow: 9_800 });
    expect(grams(q.ug)).toBe('0,1600 г');
  });
  it('E1 вверх 62 000: 159 677 µg, «0,1596 г»', () => {
    const q = quoteBuy(10_000, E1_PRICES.up.ask, E1_PRICES.up.bid);
    expect(q.ug).toBe(159_677);
    expect(grams(q.ug)).toBe('0,1596 г');
    expect(q.sellNow).toBe(9_800);
  });
  it('E1 вниз 61 750: «0,1603 г»', () => {
    const q = quoteBuy(10_000, E1_PRICES.down.ask, E1_PRICES.down.bid);
    expect(q.ug).toBe(160_323);
    expect(grams(q.ug)).toBe('0,1603 г');
  });
  it('1 000 ₸: комиссия 10, «0,0160 г»', () => {
    const q = quoteBuy(1_000, GOLD.ask, GOLD.bid);
    expect(q.fee).toBe(10);
    expect(grams(q.ug)).toBe('0,0160 г');
  });
});

describe('кешбэк', () => {
  it('Даурен 79 200 / 4 950 → 396 + 99 = 495 ₸ → 0,0080 г, 490 ₸', () => {
    const c = cashbackMonth(79_200, 4_950, CASHBACK);
    expect(c).toEqual({ base: 396, bonus: 99, total: 495 });
    const g = cashbackToGold(c.total, GOLD.ask, GOLD.bid);
    expect(g).toEqual({ ug: 8_000, sellNow: 490 });
    expect(grams(g.ug)).toBe('0,0080 г');
  });
  it('потолок 2 000 ₸ на базовый кешбэк', () => {
    expect(cashbackMonth(1_000_000, 0, CASHBACK).base).toBe(2_000);
  });
});

describe('главная Даурена после сценария', () => {
  const partners = holdingValue(2_000, 2, USDT.bid);
  const p = portfolio(40_000, 160_000, GOLD.bid, partners);
  it('всего 59 960 = 40 000 + 9 800 + 10 160, в приложении 49 800', () => {
    expect(partners).toBe(10_160);
    expect(p).toMatchObject({ available: 40_000, gold: 9_800, partners: 10_160, total: 59_960, inApp: 49_800 });
    expect(kzt(p.total)).toContain('₸');
  });
  it('доли 66,7 / 16,3 / 17,0 = 100,0%', () => {
    expect([p.shares.kzt, p.shares.gold, p.shares.partners].map(shareTenths)).toEqual(['66,7%', '16,3%', '17,0%']);
    expect(largestRemainder([40_000, 9_800, 10_160]).reduce((a, b) => a + b)).toBe(1000);
  });
});

describe('проверки покупки', () => {
  it('600 ₸ — ошибка минимума', () => expect(validateBuy(600, ctx(50_000)).kind).toBe('min'));
  it('больше баланса — E2', () => expect(validateBuy(15_000, ctx(10_000))).toEqual({ kind: 'balance', short: 5_000 }));
  it('выше условного лимита — E3 раньше баланса', () =>
    expect(validateBuy(60_000, ctx(10_000))).toEqual({ kind: 'limit', available: 50_000, limit: 50_000 }));
  it('30 000 из 50 000 — W1, 60%', () => expect(validateBuy(30_000, ctx(50_000))).toEqual({ kind: 'warn', pct: 60 }));
  it('10 000 из 50 000 — ок', () => expect(validateBuy(10_000, ctx(50_000)).kind).toBe('ok'));
});

describe('продажа золота в тенге', () => {
  it('вернуть 5 000 ₸ из 0,1600 г: 81 633 µg, к получению 5 000 ₸, комиссия 0', () => {
    const s = sellForKzt(5_000, 160_000, GOLD.bid);
    expect(s).toMatchObject({ ug: 81_633, fee: 0, receive: 5_000, remainingUg: 78_367, max: 9_800 });
    expect(grams(s.ug)).toBe('0,0816 г');
  });
  it('продать всё: 0,1600 г → 9 800 ₸', () => {
    expect(sellForKzt(9_800, 160_000, GOLD.bid)).toMatchObject({ ug: 160_000, receive: 9_800, remainingUg: 0 });
    expect(sellForKzt(50_000, 160_000, GOLD.bid).receive).toBe(9_800);
  });
  it('реестр: продажа зачисляет тенге и списывает граммы, себестоимость пропорционально', () => {
    const l0: Ledger = { kzt: 40_000, goldUg: 160_000, goldCost: 10_000, spentToday: 10_000, ops: [] };
    const sell: Op = { id: 's-1', kind: 'sell', ts: 0, amount: 5_000, ug: 81_633, bid: GOLD.bid, status: 'succeeded' };
    const l = applyOp(applyOp(l0, sell), sell);
    expect(l).toMatchObject({ kzt: 45_000, goldUg: 78_367, goldCost: 4_898, spentToday: 10_000 });
    expect(l.ops).toHaveLength(1);
  });
});

describe('цель «1 г»', () => {
  it('0,1600 г: 16%, отметка 0,1 г пройдена, следующая 0,25 г — ещё 0,0900 г', () => {
    const g = goalProgress(160_000, GOLD_MARKS_UG);
    expect(g.pct).toBe(16);
    expect(g.marks.map((m) => m.reached)).toEqual([true, false, false, false]);
    expect(g.next?.ug).toBe(250_000);
    expect(grams(g.leftToNextUg)).toBe('0,0900 г');
  });
  it('без золота — 0%, следующая 0,1 г', () => {
    expect(goalProgress(0, GOLD_MARKS_UG)).toMatchObject({ pct: 0, leftToNextUg: 100_000 });
  });
  it('синтетическая неделя заканчивается вчера 61 000 и сегодня 61 250 (§7.2)', () => {
    expect(GOLD_WEEK.slice(-2).map((p) => p.bid)).toEqual([GOLD.bidYesterday, GOLD.bid]);
  });
});

describe('перекотировка', () => {
  it('режим «Без изменений» оставляет текущий курс', () => {
    expect(requote('off', { ask: GOLD.ask, bid: GOLD.bid })).toMatchObject({ ask: 61_875, bid: 61_250 });
    expect(requote('off', E1_PRICES.up)).toMatchObject({ ask: 62_000, bid: 61_375 });
  });
  it('«Вверх» и «Вниз» дают цены §7.4', () => {
    expect(requote('up', GOLD)).toMatchObject(E1_PRICES.up);
    expect(requote('down', GOLD)).toMatchObject(E1_PRICES.down);
  });
});

describe('реестр', () => {
  const l0: Ledger = { kzt: 50_000, goldUg: 0, goldCost: 0, spentToday: 0, ops: [] };
  const op: Op = { id: 'op-1', kind: 'buy', ts: 0, amount: 10_000, ug: 160_000, status: 'succeeded' };
  it('двойной confirm с одним operationId — одно списание', () => {
    const l = applyOp(applyOp(l0, op), op);
    expect(l.kzt).toBe(40_000);
    expect(l.goldUg).toBe(160_000);
    expect(l.ops).toHaveLength(1);
  });
  it('pending не списывает, затем успех списывает один раз', () => {
    const p = applyOp(l0, { ...op, status: 'pending' });
    expect(p.kzt).toBe(50_000);
    const s = applyOp(applyOp(p, op), op);
    expect(s.kzt).toBe(40_000);
    expect(s.ops).toHaveLength(1);
  });
});
