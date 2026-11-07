import { describe, expect, it } from 'vitest';
import type { AppEvent, EventName } from './events';
import { funnel, goldChoice, timeToFundedHome } from './metrics';

const e = (name: EventName, ts: number, extra: Record<string, unknown> = {}): AppEvent =>
  ({ name, ts, is_demo: true, app_version: 't', profile: 'dauren', ...extra });

// Демо-прогон: знакомство → пополнение → покупка с E1 «Отменить» → покупка → кешбэк золотом → партнёр
const run: AppEvent[] = [
  e('onboarding_started', 0), e('onboarding_completed', 20_000),
  e('funding_started', 30_000), e('funding_succeeded', 45_000),
  e('purchase_started', 50_000), e('quote_shown', 52_000), e('quote_expired', 82_000), e('requote_shown', 82_000),
  e('purchase_cancelled', 85_000, { reason: 'requote' }),
  e('purchase_started', 86_000), e('quote_shown', 88_000), e('purchase_submitted', 90_000, { afterRequote: false }), e('purchase_succeeded', 91_000),
  e('cashback_choice_shown', 95_000), e('cashback_choice_saved', 99_000, { mode: 'gold' }),
  e('partner_consent_started', 100_000), e('partner_sync_succeeded', 102_000),
];

describe('метрики демо-сессии', () => {
  const f = Object.fromEntries(funnel(run).map((r) => [r.id, `${r.toCount}/${r.fromCount}`]));
  it('воронка по событиям этой сессии', () => {
    expect(f).toEqual({ onb: '1/1', fund: '1/1', buy: '1/2', requote: '1/1', cb: '1/1', partner: '1/1', sale: '0/0' });
  });
  it('время до главной с балансом — 45 с', () => expect(timeToFundedHome(run)).toBe(45));
  it('выбор кешбэка — золото', () => expect(goldChoice(run)).toBe('gold'));
  it('пустой лог — без выдуманных чисел', () => {
    expect(funnel([]).every((r) => r.fromCount === 0 && r.toCount === 0)).toBe(true);
    expect(timeToFundedHome([])).toBeNull();
  });
});
