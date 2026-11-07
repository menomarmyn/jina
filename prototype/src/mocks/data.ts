// Синтетические данные демо. Источник чисел — docs/01-product-strategy.md, раздел 7.
// Тенге — целые ₸, граммы — целые микрограммы (1 г = 1 000 000 µg).

export const APP_NAME = '[Название] by BCC';
export const QUOTE_TIME_LABEL = 'чт, 5 ноября, 14:32';
export const UPDATED_AT = '14:32';

/** Золото, ₸ за 1 г. bidYesterday — для изменения за 24 ч (ориентировочно). */
export const GOLD = { ask: 61_875, bid: 61_250, bidYesterday: 61_000 };

/** Цены перекотировки E1 (§7.4). */
export const E1_PRICES = {
  up: { ask: 62_000, bid: 61_375 },
  down: { ask: 61_750, bid: 61_125 },
} as const;

export const USDT = { ask: 512, bid: 508, bidYesterday: 507 };
export const BTC = { bid: 50_000_000, bidYesterday: 49_500_000 };

export const FEE_BUY_BP = 100; // 1%, внутри суммы
export const FEE_SELL_BP = 0; // §7.3: продажа 0%
export const QUOTE_TTL_SEC = 30;

/** Условные продуктовые лимиты демо — не нормы AML/KYC. */
export const LIMITS = { min: 1_000, daily: 50_000, monthly: 300_000, opsPerDay: 10 };

export const CASHBACK = { baseBp: 50, cap: 2_000, merchantBp: 200, nextCredit: 'вт, 1 декабря' };

export const BUY_PRESETS = [1_000, 5_000, 10_000];
export const TOPUP_PRESETS = [10_000, 50_000, 100_000];
export const TOPUP_MAX = 100_000;

export const CUSTODY = {
  kzt: 'BCC',
  gold: 'Halvenor Gold Custody (демо)',
  digital: 'Corvanta Custody (демо)',
};

export type AssetCode = 'USDT' | 'BTC';
export interface Holding { asset: AssetCode; qtyMinor: number; decimals: number }

export const ASSET_PRICE: Record<AssetCode, { bid: number; bidYesterday: number }> = {
  USDT: { bid: USDT.bid, bidYesterday: USDT.bidYesterday },
  BTC: { bid: BTC.bid, bidYesterday: BTC.bidYesterday },
};

export interface PartnerDef { id: string; name: string; note: string }
export const PARTNERS: PartnerDef[] = [
  { id: 'vexelia', name: 'Vexelia Exchange (демо)', note: 'Биржа-партнёр МФЦА (демо)' },
  { id: 'nordwyn', name: 'Nordwyn Digital (демо)', note: 'Биржа-партнёр МФЦА (демо)' },
];

export type ProfileId = 'dauren' | 'aigerim' | 'erlan';
export interface Profile {
  id: ProfileId;
  name: string;
  age: number;
  segment: string;
  about: string;
  start: { kzt: number; goldUg: number; goldCost: number | null };
  connected: Record<string, Holding[]>; // уже подключённые партнёры
  offer: Record<string, Holding[]>; // что появится при подключении
  spend: number; // траты картой в месяц
  merchantSpend: number; // из них у партнёров-мерчантов
}

export const PROFILES: Record<ProfileId, Profile> = {
  dauren: {
    id: 'dauren', name: 'Даурен', age: 20, segment: 'Digital Natives, 18–24',
    about: 'Студент с подработкой. Начинает с нуля.',
    start: { kzt: 0, goldUg: 0, goldCost: 0 },
    connected: {},
    offer: { vexelia: [{ asset: 'USDT', qtyMinor: 2_000, decimals: 2 }], nordwyn: [] },
    spend: 79_200, merchantSpend: 4_950,
  },
  aigerim: {
    id: 'aigerim', name: 'Айгерим', age: 29, segment: 'Mass Affluent, 25–35',
    about: 'Продуктовый аналитик. Откладывает в золото каждый месяц.',
    start: { kzt: 400_000, goldUg: 2_400_000, goldCost: null },
    connected: { vexelia: [{ asset: 'USDT', qtyMinor: 50_000, decimals: 2 }] },
    offer: { nordwyn: [] },
    spend: 300_000, merchantSpend: 24_000,
  },
  erlan: {
    id: 'erlan', name: 'Ерлан', age: 34, segment: 'Crypto Curious',
    about: 'Инженер. Держит крипту на двух биржах, золота пока нет.',
    start: { kzt: 120_000, goldUg: 0, goldCost: 0 },
    connected: {
      vexelia: [{ asset: 'USDT', qtyMinor: 120_000, decimals: 2 }],
      nordwyn: [{ asset: 'BTC', qtyMinor: 1_000_000, decimals: 8 }],
    },
    offer: {},
    spend: 150_000, merchantSpend: 22_500,
  },
};
