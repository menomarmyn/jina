// Единый store: useReducer + context. Сохранение в localStorage в try/catch, без него всё работает.
import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import { PROFILES, type Holding, type ProfileId } from './mocks/data';
import { applyOp, type Ledger, type Op } from './lib/ledger';
import type { E1Mode } from './lib/quotes';
import { setEventProfile } from './lib/events';

export type TabScreen = 'home' | 'assets' | 'card' | 'cashback' | 'me';
export type Screen = 'onboarding' | 'profile' | TabScreen | 'topup' | 'buy' | 'confirm' | 'pending' | 'success' | 'partner' | 'sell' | 'sellSuccess' | 'metrics' | 'history';
export const TAB_SCREENS: TabScreen[] = ['home', 'assets', 'card', 'cashback', 'me'];

export interface Demo { e1: E1Mode; e4: boolean; shuffleCashback: boolean }

export interface State {
  screen: Screen;
  history: Screen[];
  onboarded: boolean;
  profileId: ProfileId;
  ledger: Ledger;
  partners: Record<string, Holding[]>;
  cashbackMode: 'kzt' | 'gold' | null;
  draftBuy: number | null;
  draftTopup: number | null;
  pendingOp: Op | null;
  demo: Demo;
  demoOpen: boolean;
  expireNonce: number;
  toast: { id: number; text: string } | null;
  sheet: SheetId | null;
}

export type SheetId = 'custody' | 'pricing';

export type Action =
  | { type: 'NAV'; to: Screen; replace?: boolean }
  | { type: 'BACK' }
  | { type: 'FINISH_ONBOARDING' }
  | { type: 'SELECT_PROFILE'; id: ProfileId }
  | { type: 'APPLY_OP'; op: Op }
  | { type: 'SET_PENDING'; op: Op | null }
  | { type: 'DRAFT_BUY'; amount: number | null }
  | { type: 'DRAFT_TOPUP'; amount: number | null }
  | { type: 'SET_CASHBACK'; mode: 'kzt' | 'gold' }
  | { type: 'CONNECT_PARTNER'; id: string }
  | { type: 'DEMO'; patch: Partial<Demo> }
  | { type: 'DEMO_OPEN'; open: boolean }
  | { type: 'EXPIRE_NOW' }
  | { type: 'TOAST'; text: string }
  | { type: 'CLEAR_TOAST' }
  | { type: 'SHEET'; sheet: SheetId | null }
  | { type: 'RESET'; profileId?: ProfileId; onboarded?: boolean }
  | { type: 'LOAD_FINAL' }
  | { type: 'PRESET_ERROR'; kzt: number; amount: number };

const DEMO_DEFAULT: Demo = { e1: 'up', e4: false, shuffleCashback: false };

function freshFor(profileId: ProfileId, onboarded: boolean, demo: Demo = DEMO_DEFAULT): State {
  const p = PROFILES[profileId];
  return {
    screen: onboarded ? 'home' : 'onboarding',
    history: [],
    onboarded,
    profileId,
    ledger: { kzt: p.start.kzt, goldUg: p.start.goldUg, goldCost: p.start.goldCost, spentToday: 0, ops: [] },
    partners: { ...p.connected },
    cashbackMode: null,
    draftBuy: null,
    draftTopup: null,
    pendingOp: null,
    demo,
    demoOpen: false,
    expireNonce: 0,
    toast: null,
    sheet: null,
  };
}

let toastSeq = 0;

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'NAV':
      if (a.to === s.screen) return s;
      if ((TAB_SCREENS as Screen[]).includes(a.to) && !a.replace) return { ...s, screen: a.to, history: [] };
      return { ...s, screen: a.to, history: a.replace ? s.history : [...s.history, s.screen] };
    case 'BACK': {
      const prev = s.history[s.history.length - 1];
      return prev ? { ...s, screen: prev, history: s.history.slice(0, -1) } : { ...s, screen: 'home' };
    }
    case 'FINISH_ONBOARDING':
      return { ...s, screen: 'profile', history: [] };
    case 'SELECT_PROFILE':
      return { ...freshFor(a.id, true, s.demo), toast: null };
    case 'APPLY_OP':
      return { ...s, ledger: applyOp(s.ledger, a.op), pendingOp: s.pendingOp?.id === a.op.id && a.op.status === 'succeeded' ? null : s.pendingOp };
    case 'SET_PENDING':
      return { ...s, pendingOp: a.op, ledger: a.op ? applyOp(s.ledger, a.op) : s.ledger };
    case 'DRAFT_BUY':
      return { ...s, draftBuy: a.amount };
    case 'DRAFT_TOPUP':
      return { ...s, draftTopup: a.amount };
    case 'SET_CASHBACK':
      return { ...s, cashbackMode: a.mode };
    case 'CONNECT_PARTNER': {
      const offer = PROFILES[s.profileId].offer[a.id] ?? [];
      return { ...s, partners: { ...s.partners, [a.id]: offer } };
    }
    case 'DEMO':
      return { ...s, demo: { ...s.demo, ...a.patch } };
    case 'DEMO_OPEN':
      return { ...s, demoOpen: a.open };
    case 'EXPIRE_NOW':
      return { ...s, expireNonce: s.expireNonce + 1, demoOpen: false };
    case 'TOAST':
      return { ...s, toast: { id: ++toastSeq, text: a.text } };
    case 'CLEAR_TOAST':
      return { ...s, toast: null };
    case 'SHEET':
      return { ...s, sheet: a.sheet, demoOpen: false };
    case 'RESET':
      return freshFor(a.profileId ?? s.profileId, a.onboarded ?? false, s.demo);
    case 'LOAD_FINAL': {
      // Итог сценария Даурена (§3.3): страховка для защиты
      const base = freshFor('dauren', true, s.demo);
      return {
        ...base,
        ledger: {
          kzt: 40_000, goldUg: 160_000, goldCost: 10_000, spentToday: 10_000,
          ops: [
            { id: 'final-topup', kind: 'topup', ts: Date.now() - 60_000, amount: 50_000, status: 'succeeded' },
            { id: 'final-buy', kind: 'buy', ts: Date.now() - 30_000, amount: 10_000, fee: 100, ug: 160_000, ask: 61_875, bid: 61_250, status: 'succeeded' },
          ],
        },
        cashbackMode: 'gold',
        partners: { vexelia: PROFILES.dauren.offer.vexelia },
      };
    }
    case 'PRESET_ERROR':
      return {
        ...s, demoOpen: false, draftBuy: a.amount, screen: 'buy', history: ['home'],
        ledger: { ...s.ledger, kzt: a.kzt, spentToday: 0 },
      };
  }
}

const KEY = 'neobank-demo-state-v1';
const TRANSIENT: Screen[] = ['confirm', 'pending', 'success', 'sellSuccess'];

function load(): State {
  const initial = freshFor('dauren', false);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const saved = JSON.parse(raw) as Partial<State>;
    const s = { ...initial, ...saved, demoOpen: false, toast: null, sheet: null, expireNonce: 0 } as State;
    if (TRANSIENT.includes(s.screen)) return { ...s, screen: s.onboarded ? 'home' : 'onboarding', history: [] };
    return s;
  } catch {
    return initial;
  }
}

const Ctx = createContext<{ s: State; d: Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, undefined, load);
  useEffect(() => {
    setEventProfile(s.profileId);
    try {
      const { toast: _t, demoOpen: _o, sheet: _sh, ...persist } = s;
      localStorage.setItem(KEY, JSON.stringify(persist));
    } catch { /* без хранилища тоже работаем */ }
  }, [s]);
  useEffect(() => {
    try { if (new URLSearchParams(location.search).get('demo') === '1') d({ type: 'DEMO_OPEN', open: true }); } catch { /* noop */ }
  }, []);
  return <Ctx.Provider value={{ s, d }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('StoreProvider missing');
  return v;
}

export const opId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
