import { useEffect, useState } from 'react';
import { Button, DemoBadge, RadioCard } from '../components/ui';
import { APP_NAME, CUSTODY, PROFILES, type ProfileId } from '../mocks/data';
import { useStore } from '../store';
import { track } from '../lib/events';

const SLIDES = [
  {
    title: 'Тенге и золото в одном портфеле',
    body: 'Небольшие суммы в золоте и повседневные тенге в одном понятном портфеле. До покупки видно, сколько останется при продаже.',
    points: ['Золото от 1 000 ₸', 'Кешбэк тенге или граммами — на ваш выбор', 'Кошельки партнёров в общем обзоре'],
  },
  {
    title: 'Кто хранит ваши активы',
    body: 'У каждого актива свой хранитель. Мы показываем его рядом с балансом.',
    points: [`Тенге — на счёте в ${CUSTODY.kzt}`, `Золото — у хранителя ${CUSTODY.gold}`, 'Кошельки партнёров — только просмотр, распоряжаться ими мы не можем'],
  },
  {
    title: 'Как вы платите и чем рискуете',
    body: 'Комиссия 1% уже внутри суммы. Золото покупается по курсу покупки, а продаётся по курсу продажи — между ними есть разница.',
    points: ['Пример: 10 000 ₸ → 0,1600 г', 'Если продать сразу ≈ 9 800 ₸', 'Цена золота может снижаться. Это не вклад, доходность не гарантируется'],
  },
];

export function Onboarding() {
  const { d } = useStore();
  const [i, setI] = useState(0);
  useEffect(() => { track('onboarding_started'); }, []);
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;
  return (
    <div className="flex h-full flex-col px-5 pb-6 pt-[max(20px,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold">{APP_NAME}</span>
        <DemoBadge />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-5">
        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gold-soft">
          <span className="tnum text-[28px] font-semibold text-gold">{i + 1}/3</span>
        </div>
        <h1 className="text-balance text-[28px] font-semibold leading-tight">{slide.title}</h1>
        <p className="text-[16px] leading-relaxed text-muted">{slide.body}</p>
        <ul className="flex flex-col gap-2">
          {slide.points.map((p) => (
            <li key={p} className="flex gap-3 rounded-m bg-surface p-3 text-[15px] shadow-card">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />{p}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex justify-center gap-1.5" aria-hidden>
          {SLIDES.map((_, k) => <span key={k} className={`h-1.5 rounded-full ${k === i ? 'w-6 bg-accent' : 'w-1.5 bg-border'}`} />)}
        </div>
        <Button onClick={() => (last ? (track('onboarding_completed'), d({ type: 'FINISH_ONBOARDING' })) : setI(i + 1))}>
          {last ? 'Войти в демо' : 'Далее'}
        </Button>
        <p className="text-center text-[12px] text-muted">Это демо: деньги и данные тестовые</p>
      </div>
    </div>
  );
}

export function ProfileSelect() {
  const { d } = useStore();
  const [sel, setSel] = useState<ProfileId>('dauren');
  return (
    <div className="flex h-full flex-col px-5 pb-6 pt-[max(20px,env(safe-area-inset-top))]">
      <h1 className="mt-6 text-[26px] font-semibold leading-tight">Выберите тестовый профиль</h1>
      <p className="mt-2 text-[15px] text-muted">Без телефона, паролей, ИИН и других личных данных.</p>
      <div className="mt-6 flex flex-col gap-3" role="radiogroup">
        {(Object.keys(PROFILES) as ProfileId[]).map((id) => {
          const p = PROFILES[id];
          return (
            <RadioCard key={id} id={`profile-${id}`} selected={sel === id} onSelect={() => setSel(id)} title={`${p.name}, ${p.age}`}>
              {p.segment}. {p.about}
            </RadioCard>
          );
        })}
      </div>
      <div className="mt-auto pt-6">
        <Button onClick={() => d({ type: 'SELECT_PROFILE', id: sel })}>Продолжить</Button>
      </div>
    </div>
  );
}
