'use client';

import { useState, type FormEvent } from 'react';
import Markdown from 'react-markdown';
import type { HealthAgentResult } from '@/harness/runHealthAgent';

type State =
  | { status: 'idle' }
  | { status: 'running' }
  | { status: 'result'; data: HealthAgentResult }
  | { status: 'result'; error: string };

type Verdict = HealthAgentResult['review']['verdict'];

const EXAMPLES = ['Составь план питания на завтра', 'Тренировка дома на 30 минут', 'Как наладить сон за неделю'];

const VERDICTS: Record<Verdict, { label: string; className: string }> = {
  approve: { label: 'Одобрено', className: 'badgeApprove' },
  revise: { label: 'Нужны правки', className: 'badgeRevise' },
  needs_human_professional: { label: 'Нужен специалист', className: 'badgeHuman' },
};

export default function Home() {
  const [task, setTask] = useState('');
  const [state, setState] = useState<State>({ status: 'idle' });
  const running = state.status === 'running';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: 'running' });
    try {
      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task }),
      });
      const body = await response.json().catch(() => null);
      setState(
        response.ok && body
          ? { status: 'result', data: body }
          : { status: 'result', error: body?.error ?? `HTTP ${response.status}` },
      );
    } catch (error) {
      setState({ status: 'result', error: error instanceof Error ? error.message : String(error) });
    }
  }

  return (
    <div className="page">
      <div className="aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <main className="container">
        <span className="logo">
          <span className="logoMark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" />
              <path d="M5 19l7-7" />
            </svg>
          </span>
          Ешь, гуляй и спи
        </span>

        <header className="hero">
          <p className="eyebrow">Health Coach + Safety Reviewer</p>
          <h1 className="title">Ешь, гуляй и спи</h1>
          <p className="lead">Это станет вашим любимым приложением</p>
          <p className="hint">
            Вы описываете задачу — коуч составит план по вашему профилю и дневнику, а ревьюер проверит его на безопасность.
          </p>
        </header>

        <form className="card form" onSubmit={handleSubmit}>
          <label className="label" htmlFor="task">
            Задача
          </label>
          <textarea
            id="task"
            className="textarea"
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="Например: составь план питания на завтра"
          />
          <div className="chips">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                className="button chip"
                onClick={() => setTask(example)}
                disabled={running}
              >
                {example}
              </button>
            ))}
          </div>
          <div className="formFooter">
            <p className="hint">Одна задача — один ответ</p>
            <button type="submit" className="button buttonPrimary" disabled={running || !task.trim()}>
              Run Agent
            </button>
          </div>
        </form>

        <div aria-live="polite">
          {running && (
            <div className="card status">
              <span className="pulse" aria-hidden="true" />
              <div>
                <p className="statusTitle">Агент работает…</p>
                <p className="hint">Коуч пишет план, ревьюер проверяет — обычно до минуты</p>
              </div>
            </div>
          )}

          {state.status === 'result' && 'error' in state && (
            <div className="alert error" role="alert">
              <AlertIcon />
              <div>
                <h2 className="alertTitle">Не получилось</h2>
                <p className="alertText">{state.error}</p>
              </div>
            </div>
          )}

          {state.status === 'result' && 'data' in state && <Result data={state.data} />}
        </div>
      </main>
    </div>
  );
}

function Result({ data }: { data: HealthAgentResult }) {
  const { plan, review, rounds } = data;
  const verdict = VERDICTS[review.verdict];

  return (
    <section className="results" aria-label="Результат">
      <div className="metrics">
        <div className="metric">
          <span className="metricLabel">Verdict</span>
          <span className={`badge ${verdict.className}`}>{verdict.label}</span>
          <span className="code">{review.verdict}</span>
        </div>
        <div className="metric">
          <span className="metricLabel">Score</span>
          <span className="metricValue">
            {review.score}
            <small>/10</small>
          </span>
          <div className="scoreTrack" aria-hidden="true">
            <div className="scoreFill" style={{ width: `${review.score * 10}%` }} />
          </div>
        </div>
        <div className="metric">
          <span className="metricLabel">Раундов</span>
          <span className="metricValue">
            {rounds}
            <small>/3</small>
          </span>
        </div>
      </div>

      {review.verdict === 'needs_human_professional' ? (
        <div className="alert" role="alert">
          <AlertIcon />
          <div>
            <h2 className="alertTitle">Этот запрос требует консультации специалиста</h2>
            <p className="alertText">Коуч не составляет планы по медицинским вопросам — обратитесь к врачу.</p>
          </div>
        </div>
      ) : (
        <article className="card">
          <h2 className="cardTitle">План</h2>
          <div className="markdown">
            <Markdown>{plan}</Markdown>
          </div>
        </article>
      )}

      <section className="card">
        <h2 className="cardTitle">Safety review</h2>
        {review.issues.length ? (
          <ul className="issues">
            {review.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        ) : (
          <p className="empty">Замечаний нет</p>
        )}
      </section>
    </section>
  );
}

function AlertIcon() {
  return (
    <span className="alertIcon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8v5" />
        <path d="M12 16.5v.5" />
        <circle cx="12" cy="12" r="9.5" />
      </svg>
    </span>
  );
}
