// Учёба: короткие уроки + вопрос на понимание. Без наград и рейтингов — только «пройдено N из 5».
import { useEffect, useState } from 'react';
import { Button, Display, Icon, TopBar, cx } from '../ui';
import { LESSONS } from '../lessons';
import { track } from '../../lib/events';
import { useStore } from '../store';

export function Learn() {
  const { s, d } = useStore();
  const done = LESSONS.filter((l) => s.lessons[l.id]).length;
  return (
    <div className="flex flex-col gap-5 px-4 pb-8 pt-[max(14px,env(safe-area-inset-top))]">
      <header className="px-1 pt-2">
        <Display className="text-[28px]">Учёба</Display>
        <p className="mt-2 max-w-[34ch] text-[15px] text-muted">Пять коротких уроков о том, как устроены деньги. Каждый — пара минут и один вопрос.</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full bg-sky transition-[width] duration-500" style={{ width: `${(done / LESSONS.length) * 100}%` }} /></div>
          <span className="tnum text-[13px] text-muted">пройдено {done} из {LESSONS.length}</span>
        </div>
      </header>
      <ol className="flex flex-col gap-2.5">
        {LESSONS.map((l, i) => {
          const res = s.lessons[l.id];
          return (
            <li key={l.id}>
              <button type="button" onClick={() => d({ type: 'OPEN_LESSON', id: l.id })}
                className="flex w-full items-center gap-4 rounded-[20px] bg-surface px-4 py-4 text-left">
                <span className={cx('tnum flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-[15px] font-semibold',
                  res ? 'bg-sky text-white' : 'bg-mist text-ink')}>{res ? <Icon name="check" size={20} stroke={2.4} /> : i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold leading-snug">{l.title}</span>
                  <span className="block text-[13px] text-muted">{l.minutes} мин{res && (res.correct ? ' · ответ верный' : ' · стоит перечитать')}</span>
                </span>
                <Icon name="chevron" size={18} className="text-muted" />
              </button>
            </li>
          );
        })}
      </ol>
      <p className="px-1 text-[12px] leading-snug text-muted">Уроки объясняют, как устроены активы, и не являются инвестиционной рекомендацией. Акции и фонды в JINA не продаются.</p>
    </div>
  );
}

export function LessonScreen() {
  const { s, d } = useStore();
  const lesson = LESSONS.find((l) => l.id === s.lessonId) ?? LESSONS[0];
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  useEffect(() => { track('lesson_started', { lesson: lesson.id }); }, [lesson.id]);
  const quizStep = lesson.cards.length;
  const card = lesson.cards[step];
  const answered = pick !== null;
  const correct = pick === lesson.quiz.correct;
  const idx = LESSONS.indexOf(lesson);
  const next = LESSONS[idx + 1];

  const answer = (i: number) => {
    if (answered) return;
    setPick(i);
    const ok = i === lesson.quiz.correct;
    track('quiz_answered', { lesson: lesson.id, correct: ok });
    d({ type: 'FINISH_LESSON', id: lesson.id, correct: ok });
  };

  return (
    <div className="flex h-full flex-col">
      <TopBar title={`Урок ${idx + 1} из ${LESSONS.length}`} onBack={() => d({ type: 'BACK' })} />
      <div className="flex gap-1.5 px-5" aria-hidden>
        {Array.from({ length: quizStep + 1 }, (_, k) => <span key={k} className={cx('h-1 flex-1 rounded-full', k <= step ? 'bg-sky' : 'bg-mist')} />)}
      </div>
      <div className="scroll-area flex flex-1 flex-col px-5 pb-4 pt-8">
        {step < quizStep ? (
          <div key={step}>
            <div className="text-[14px] text-muted">{lesson.title}</div>
            <Display className="mt-3 text-[26px] leading-[1.15]">{card.title}</Display>
            <p className="mt-4 text-[17px] leading-relaxed text-ink">{card.text}</p>
            {card.example && <p className="tnum mt-5 rounded-field bg-sun-soft px-4 py-3 text-[15px] font-medium">{card.example}</p>}
          </div>
        ) : (
          <div>
            <div className="text-[14px] text-muted">Проверим понимание</div>
            <Display className="mt-3 text-[22px] leading-[1.2]">{lesson.quiz.question}</Display>
            <div className="mt-6 flex flex-col gap-2.5" role="radiogroup">
              {lesson.quiz.options.map((o, i) => {
                const isRight = i === lesson.quiz.correct;
                return (
                  <button key={o} type="button" role="radio" aria-checked={pick === i} onClick={() => answer(i)}
                    className={cx('flex min-h-[56px] items-center justify-between gap-3 rounded-field px-4 py-3 text-left text-[16px] transition-colors',
                      !answered && 'bg-surface shadow-[inset_0_0_0_1px_var(--line)]',
                      answered && isRight && 'bg-sky-soft font-semibold text-ink shadow-[inset_0_0_0_2px_var(--sky)]',
                      answered && !isRight && pick === i && 'bg-danger-soft text-ink',
                      answered && !isRight && pick !== i && 'bg-surface text-muted')}>
                    {o}
                    {answered && isRight && <Icon name="check" size={20} className="shrink-0 text-sky-ink" stroke={2.4} />}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className="mt-5 rounded-field bg-surface px-4 py-3">
                <div className={cx('text-[15px] font-semibold', correct ? 'text-sky-ink' : 'text-danger')}>{correct ? 'Верно' : 'Не совсем'}</div>
                <p className="mt-1 text-[15px] leading-snug">{lesson.quiz.explain}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-2">
        {step < quizStep && <Button onClick={() => setStep(step + 1)}>{step === quizStep - 1 ? 'К вопросу' : 'Дальше'}</Button>}
        {step === quizStep && answered && (next
          ? <Button onClick={() => { setStep(0); setPick(null); d({ type: 'OPEN_LESSON', id: next.id }); }}>Следующий урок</Button>
          : <Button onClick={() => d({ type: 'NAV', to: 'learn' })}>К списку уроков</Button>)}
      </div>
    </div>
  );
}
