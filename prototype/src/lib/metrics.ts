// Воронка демо-сессии из лога событий. Только факты этой сессии; пороги — цели, а не результаты.
import type { AppEvent, EventName } from './events';

export interface FunnelStep {
  id: string;
  hypothesis: string;
  title: string;
  from: EventName;
  to: EventName;
  target: string; // цель гипотезы, подпись «цель»
}

export const FUNNEL: FunnelStep[] = [
  { id: 'onb', hypothesis: 'H1', title: 'Знакомство пройдено', from: 'onboarding_started', to: 'onboarding_completed', target: '≥ 80%' },
  { id: 'fund', hypothesis: 'H1', title: 'Пополнение после знакомства', from: 'onboarding_completed', to: 'funding_succeeded', target: '≥ 50%' },
  { id: 'buy', hypothesis: 'H2', title: 'Начали покупку → купили', from: 'purchase_started', to: 'purchase_succeeded', target: '≥ 60%' },
  { id: 'requote', hypothesis: 'H6', title: 'Увидели «Курс обновился» → решили', from: 'requote_shown', to: 'purchase_succeeded', target: '≥ 60% подтвердили или осознанно отменили' },
  { id: 'cb', hypothesis: 'H4', title: 'Увидели выбор кешбэка → выбрали', from: 'cashback_choice_shown', to: 'cashback_choice_saved', target: '≥ 80% выбрали, из них золото ≥ 40%' },
  { id: 'partner', hypothesis: 'H5', title: 'Начали подключение партнёра → подключили', from: 'partner_consent_started', to: 'partner_sync_succeeded', target: '≥ 50% подключают' },
  { id: 'sale', hypothesis: 'H7', title: 'Начали продажу → получили тенге', from: 'sale_started', to: 'sale_succeeded', target: 'Выход понятен ≥ 70%' },
];

export const count = (ev: AppEvent[], name: EventName) => ev.filter((e) => e.name === name).length;

export function funnel(ev: AppEvent[]) {
  return FUNNEL.map((s) => {
    const from = count(ev, s.from);
    let to = count(ev, s.to);
    // E1: «решили» = отправили покупку из шторки «Курс обновился» или осознанно отменили её
    if (s.id === 'requote') {
      to = ev.filter((e) => (e.name === 'purchase_submitted' && e.afterRequote) || (e.name === 'purchase_cancelled' && e.reason === 'requote')).length;
    }
    return { ...s, fromCount: from, toCount: Math.min(to, from || to) };
  });
}

/** Время от начала знакомства до пополнения (главная с балансом), секунды. Цель — < 3 мин. */
export function timeToFundedHome(ev: AppEvent[]): number | null {
  const start = ev.find((e) => e.name === 'onboarding_started');
  const funded = ev.find((e) => e.name === 'funding_succeeded' && (!start || e.ts >= start.ts));
  if (!start || !funded) return null;
  return Math.round((funded.ts - start.ts) / 1000);
}

export function goldChoice(ev: AppEvent[]): 'gold' | 'kzt' | null {
  const last = [...ev].reverse().find((e) => e.name === 'cashback_choice_saved');
  return (last?.mode as 'gold' | 'kzt' | undefined) ?? null;
}
