// Общие шторки: «Кто хранит ваши активы» и «Как считается цена». Открываются с любого экрана.
import { BottomSheet, Button, PriceRow, Row } from '../components/ui';
import { CUSTODY, FEE_BUY_BP, GOLD, PARTNERS } from '../mocks/data';
import { quoteBuy, UG_PER_G } from '../lib/calc';
import { grams, kzt } from '../lib/format';
import { useStore } from '../store';

const pct2 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function Sheets() {
  const { s, d } = useStore();
  const close = () => d({ type: 'SHEET', sheet: null });
  const ex = quoteBuy(10_000, GOLD.ask, GOLD.bid, FEE_BUY_BP);
  // Цена продажи, при которой 0,1600 г снова стоят 10 000 ₸. Иллюстрация, не прогноз.
  const breakeven = Math.ceil((ex.amount * UG_PER_G) / ex.ug);
  const breakevenPct = ((breakeven - GOLD.bid) / GOLD.bid) * 100;

  return (
    <>
      <BottomSheet open={s.sheet === 'custody'} onClose={close} title="Кто хранит ваши активы">
        <div className="flex flex-col gap-3 text-[15px] leading-snug">
          <div className="rounded-m bg-surface p-3 shadow-card">
            <div className="font-semibold">Тенге</div>
            <p className="text-muted">На счёте в {CUSTODY.kzt}. Это деньги для трат и покупок.</p>
          </div>
          <div className="rounded-m bg-surface p-3 shadow-card">
            <div className="font-semibold">Золото</div>
            <p className="text-muted">Граммы учтены на вашем счёте в приложении. Золото хранит {CUSTODY.gold}. Продать можно в любой момент по курсу продажи.</p>
          </div>
          <div className="rounded-m bg-surface p-3 shadow-card">
            <div className="font-semibold">Кошельки партнёров</div>
            <p className="text-muted">
              {PARTNERS.map((p) => p.name).join(', ')}. Только просмотр: мы видим баланс, но не можем торговать, переводить или выводить.
              Эти активы нельзя потратить из приложения.
            </p>
          </div>
          <p className="text-[13px] text-muted">Названия партнёров в демо условные. Регуляторная модель — гипотеза для отдельной проверки.</p>
          <Button variant="secondary" onClick={close}>Понятно</Button>
        </div>
      </BottomSheet>

      <BottomSheet open={s.sheet === 'pricing'} onClose={close} title="Как считается цена">
        <div className="flex flex-col gap-3 text-[15px] leading-snug">
          <p className="text-muted">У золота два курса. Покупаете по курсу покупки, продаёте по курсу продажи — он ниже. Плюс комиссия 1% при покупке, уже внутри суммы.</p>
          <div className="rounded-m bg-surface p-3 shadow-card">
            <div className="mb-2 font-semibold">Пример на 10 000 ₸</div>
            <PriceRow ask={GOLD.ask} bid={GOLD.bid} />
            <div className="mt-2" />
            <Row label="Спишем" value={kzt(ex.amount)} />
            <Row label="Комиссия 1%" value={kzt(ex.fee)} />
            <Row label="На золото" value={kzt(ex.net)} />
            <Row label="Получите" value={<span className="text-gold">{grams(ex.ug)}</span>} />
            <Row label="Если продать сразу" value={`≈ ${kzt(ex.sellNow)}`} strong />
            <p className="mt-1 text-[13px] text-muted">Разница {kzt(ex.amount - ex.sellNow)}: комиссия {kzt(ex.fee)} и разница курсов {kzt(ex.net - ex.sellNow)}.</p>
          </div>
          <div className="rounded-m bg-surface2 p-3 text-[14px]">
            Чтобы при продаже вернуть те же 10 000 ₸, курс продажи должен быть не ниже <span className="tnum font-semibold">{kzt(breakeven)}/г</span>
            {' '}— на {pct2.format(breakevenPct)}% выше сегодняшнего. Это иллюстрация расчёта, а не прогноз цены.
          </div>
          <p className="text-[13px] text-muted">Цена в тенге зависит от цены золота и курса доллара и может снижаться. Это не вклад, доходность не гарантируется.</p>
          <Button variant="secondary" onClick={close}>Понятно</Button>
        </div>
      </BottomSheet>
    </>
  );
}
