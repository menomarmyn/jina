import { useCallback, useEffect, useRef } from 'react';
import { TabBar, Toast } from './components/ui';
import { StoreProvider, TAB_SCREENS, useStore, type Screen, type TabScreen } from './store';
import { Onboarding, ProfileSelect } from './screens/Onboarding';
import { Home } from './screens/Home';
import { TopUp } from './screens/TopUp';
import { BuyAmount, BuyConfirm, BuyPending, BuySuccess } from './screens/Buy';
import { Cashback } from './screens/Cashback';
import { PartnerConnect } from './screens/Partner';
import { Assets, CardTab, Me } from './screens/Tabs';
import { DemoPanel } from './screens/DemoPanel';
import { SellAmount, SellSuccess } from './screens/Sell';
import { Metrics } from './screens/Metrics';
import { History } from './screens/History';
import { Sheets } from './screens/Sheets';
import { Gold } from './screens/Gold';

const SCREENS: Record<Screen, () => JSX.Element | null> = {
  onboarding: Onboarding, profile: ProfileSelect, home: Home, assets: Assets, card: CardTab, cashback: Cashback, me: Me,
  topup: TopUp, buy: BuyAmount, confirm: BuyConfirm, pending: BuyPending, success: BuySuccess, partner: PartnerConnect,
  sell: SellAmount, sellSuccess: SellSuccess, metrics: Metrics, history: History, gold: Gold,
};

function Shell() {
  const { s, d } = useStore();
  const Current = SCREENS[s.screen];
  const isTab = (TAB_SCREENS as Screen[]).includes(s.screen) && s.history.length === 0;
  const clearToast = useCallback(() => d({ type: 'CLEAR_TOAST' }), [d]);
  const taps = useRef<number[]>([]);
  // Скрытый вход в демо-панель с любого экрана: 5 тапов по верхней середине или Shift+D
  const onHotZone = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < 2000), now];
    if (taps.current.length >= 5) { taps.current = []; d({ type: 'DEMO_OPEN', open: true }); }
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.shiftKey && e.code === 'KeyD') d({ type: 'DEMO_OPEN', open: true }); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [d]);
  return (
    // На десктопе — рамка телефона 390×844, на телефоне — во весь экран
    <div className="flex min-h-full items-center justify-center sm:py-6">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-bg sm:h-[844px] sm:w-[390px] sm:rounded-[44px] sm:border-[10px] sm:border-[#1b1f1e] sm:shadow-2xl">
        <main key={s.screen} className="anim-fade scroll-area flex flex-1 flex-col">
          <Current />
        </main>
        {isTab && <TabBar active={s.screen as TabScreen} onChange={(t) => d({ type: 'NAV', to: t })} />}
        <div aria-hidden onClick={onHotZone} className="absolute left-1/2 top-0 z-30 h-6 w-28 -translate-x-1/2" />
        {s.toast &&<Toast key={s.toast.id} text={s.toast.text} onDone={clearToast} />}
        <Sheets />
        <DemoPanel />
      </div>
    </div>
  );
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>;
}
