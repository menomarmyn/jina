import { ASSET_PRICE, GOLD, type Holding } from '../mocks/data';
import { changePct, holdingValue, portfolio, valueUg } from './calc';
import type { State } from '../app/store';

export function partnerValue(h: Holding[], yesterday = false) {
  return h.reduce((s, x) => s + holdingValue(x.qtyMinor, x.decimals, yesterday ? ASSET_PRICE[x.asset].bidYesterday : ASSET_PRICE[x.asset].bid), 0);
}

export function partnersTotal(s: State, yesterday = false) {
  return Object.values(s.partners).reduce((sum, h) => sum + partnerValue(h, yesterday), 0);
}

export function homeView(s: State) {
  const pf = portfolio(s.ledger.kzt, s.ledger.goldUg, GOLD.bid, partnersTotal(s));
  const goldYesterday = valueUg(s.ledger.goldUg, GOLD.bidYesterday);
  return {
    pf,
    gold24h: { kzt: pf.gold - goldYesterday, pct: changePct(GOLD.bid, GOLD.bidYesterday) },
    goldSinceBuy: s.ledger.goldCost ? pf.gold - s.ledger.goldCost : null,
    partners24h: pf.partners - partnersTotal(s, true),
  };
}
