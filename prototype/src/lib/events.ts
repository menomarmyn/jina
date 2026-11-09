// Лог событий демо-сессии (BUILD-SPEC §6). Только события этой сессии, не исследование.
export type EventName =
  | 'onboarding_started' | 'onboarding_completed'
  | 'funding_started' | 'funding_succeeded'
  | 'purchase_started' | 'quote_shown' | 'quote_expired' | 'requote_shown'
  | 'purchase_submitted' | 'purchase_succeeded' | 'purchase_failed' | 'purchase_cancelled'
  | 'cashback_choice_shown' | 'cashback_choice_saved'
  | 'partner_consent_started' | 'partner_sync_succeeded'
  | 'sale_started' | 'sale_succeeded'
  | 'lesson_started' | 'quiz_answered';

export interface AppEvent { name: EventName; ts: number; is_demo: true; app_version: string; profile: string; [k: string]: unknown }

const KEY = 'jina-demo-events';
const APP_VERSION = '0.3.0-jina';
let profile = 'dauren';
let log: AppEvent[] = [];
try { log = JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { log = []; }

export function setEventProfile(p: string) { profile = p; }

export function track(name: EventName, extra: Record<string, unknown> = {}) {
  log.push({ name, ts: Date.now(), is_demo: true, app_version: APP_VERSION, profile, ...extra });
  try { localStorage.setItem(KEY, JSON.stringify(log.slice(-500))); } catch { /* без хранилища тоже работаем */ }
}

export function getEvents(): AppEvent[] { return log; }
export function clearEvents() { log = []; try { localStorage.removeItem(KEY); } catch { /* noop */ } }
