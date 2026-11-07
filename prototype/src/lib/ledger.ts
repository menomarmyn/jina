// Реестр операций. Идемпотентен по operationId: повторный confirm не создаёт второе списание.

export type OpKind = 'topup' | 'buy';
export type OpStatus = 'pending' | 'succeeded';

export interface Op {
  id: string;
  kind: OpKind;
  ts: number;
  amount: number; // ₸
  fee?: number;
  ug?: number;
  ask?: number;
  bid?: number;
  status: OpStatus;
}

export interface Ledger { kzt: number; goldUg: number; goldCost: number | null; spentToday: number; ops: Op[] }

export function applyOp(l: Ledger, op: Op): Ledger {
  const existing = l.ops.find((o) => o.id === op.id);
  if (existing && (existing.status === 'succeeded' || op.status === 'pending')) return l;
  const ops = existing ? l.ops.map((o) => (o.id === op.id ? op : o)) : [...l.ops, op];
  if (op.status === 'pending') return { ...l, ops };
  if (op.kind === 'topup') return { ...l, ops, kzt: l.kzt + op.amount };
  return {
    ...l,
    ops,
    kzt: l.kzt - op.amount,
    goldUg: l.goldUg + (op.ug ?? 0),
    goldCost: l.goldCost === null ? null : l.goldCost + op.amount,
    spentToday: l.spentToday + op.amount,
  };
}
