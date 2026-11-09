import { useCallback, useEffect, useRef } from 'react';
import { TabBar, Toast } from './ui';
import { StoreProvider, TAB_SCREENS, useStore, type Screen, type TabScreen } from './store';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { BuyAmount, BuyConfirm, BuyPending, BuySuccess, SellAmount, SellSuccess, TopUp } from './screens/Money';
import { Gold } from './screens/Gold';
import { Learn, LessonScreen } from './screens/Learn';
import { Cashback, DemoPanel, History, Me, Metrics, PartnerConnect, Sheets } from './screens/More';

const SCREENS: Record<Screen, () => JSX.Element | null> = {
  onboarding: Onboarding, home: Home, gold: Gold, learn: Learn, me: Me,
  topup: TopUp, buy: BuyAmount, confirm: BuyConfirm, pending: BuyPending, success: BuySuccess,
  sell: SellAmount, sellSuccess: SellSuccess, cashback: Cashback, partner: PartnerConnect,
  history: History, metrics: Metrics, lesson: LessonScreen,
};

function Shell() {
  const { s, d } = useStore();
  const Current = SCREENS[s.screen] ?? Home;
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
    // На широком экране — рамка телефона 390×844 на фоне; в iframe сайта-кейса и на телефоне — во весь экран
    <div className="flex min-h-full items-center justify-center bg-[#E7EEF1] sm:py-8">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-paper sm:h-[844px] sm:w-[390px] sm:rounded-[48px] sm:shadow-[0_0_0_10px_#0B2540,0_30px_80px_-20px_rgba(11,37,64,.45)]">
        <main key={s.screen === 'lesson' ? `lesson-${s.lessonId}` : s.screen} className="anim-fade scroll-area flex flex-1 flex-col">
          <Current />
        </main>
        {isTab && <TabBar active={s.screen as TabScreen} onChange={(t) => d({ type: 'NAV', to: t })} />}
        <div aria-hidden onClick={onHotZone} className="absolute left-1/2 top-0 z-30 h-6 w-28 -translate-x-1/2" />
        {s.toast && <Toast key={s.toast.id} text={s.toast.text} onDone={clearToast} />}
        <Sheets />
        <DemoPanel />
      </div>
    </div>
  );
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>;
}
