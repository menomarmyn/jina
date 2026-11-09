import { useEffect, useState } from 'react';
import { Button, Display, Sun, Wordmark } from '../ui';
import { CUSTODY } from '../../mocks/data';
import { track } from '../../lib/events';
import { useStore } from '../store';

const SLIDES = [
  {
    progress: 0.16,
    title: 'Копить можно с 1 000 ₸',
    body: 'JINA — от «жинау», копить. Откладывайте в тенге и граммах золота и следите, как зажигается солнце: каждый луч — шаг к первому грамму.',
  },
  {
    progress: 0.5,
    title: 'До покупки видно, сколько останется',
    body: 'Курс покупки и продажи всегда рядом. Перед покупкой показываем, сколько вы получите, если продадите сразу, — с комиссией и разницей курсов.',
  },
  {
    progress: 1,
    title: 'Учитесь, пока копите',
    body: `Короткие уроки про подушку, золото, акции и крипту. Тенге хранятся в ${CUSTODY.kzt}, золото — у хранителя. Цена золота может снижаться: это не вклад.`,
  },
];

export function Onboarding() {
  const { d } = useStore();
  const [i, setI] = useState(0);
  useEffect(() => { track('onboarding_started'); }, []);
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;
  return (
    <div className="flex h-full flex-col bg-ink px-6 pb-6 pt-[max(18px,env(safe-area-inset-top))] text-white">
      <div className="flex items-center justify-between">
        <Wordmark />
        <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] text-white/75">Демо · данные тестовые</span>
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <div key={i} className="anim-fade"><Sun progress={s.progress} animateFrom={i === 0 ? 0 : SLIDES[i - 1].progress} size={196} /></div>
        <Display className="mt-8 text-[30px] leading-[1.12] text-white">{s.title}</Display>
        <p className="mt-4 max-w-[34ch] text-[16px] leading-relaxed text-white/75">{s.body}</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-1.5" aria-hidden>
          {SLIDES.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-7 bg-sun' : 'w-1.5 bg-white/25'}`} />)}
        </div>
        <Button variant="sun" onClick={() => (last ? (track('onboarding_completed'), d({ type: 'FINISH_ONBOARDING' })) : setI(i + 1))}>
          {last ? 'Начать с тестовым балансом' : 'Дальше'}
        </Button>
        {!last && <button type="button" onClick={() => setI(SLIDES.length - 1)} className="min-h-[44px] text-[15px] text-white/60">Пропустить</button>}
      </div>
    </div>
  );
}
