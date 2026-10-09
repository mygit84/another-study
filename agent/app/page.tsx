'use client';

import { useState, type FormEvent } from 'react';
import type { HealthAgentResult } from '@/harness/runHealthAgent';

type State =
  | { status: 'idle' }
  | { status: 'running' }
  | { status: 'result'; data: HealthAgentResult }
  | { status: 'result'; error: string };

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
      const body = await response.json();
      setState(response.ok ? { status: 'result', data: body } : { status: 'result', error: body.error });
    } catch (error) {
      setState({ status: 'result', error: error instanceof Error ? error.message : String(error) });
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h1>Wellness Agent</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
        <textarea
          value={task}
          onChange={(event) => setTask(event.target.value)}
          placeholder="Например: составь план питания на завтра"
          rows={4}
          style={{ font: 'inherit', padding: 8 }}
        />
        <button type="submit" disabled={running || !task.trim()} style={{ justifySelf: 'start', padding: '8px 16px' }}>
          Run Agent
        </button>
      </form>

      {running && <p>Агент работает…</p>}

      {state.status === 'result' && 'error' in state && (
        <p role="alert" style={{ color: 'crimson' }}>
          Ошибка: {state.error}
        </p>
      )}

      {state.status === 'result' && 'data' in state && <Result data={state.data} />}
    </main>
  );
}

function Result({ data }: { data: HealthAgentResult }) {
  const { plan, review, rounds } = data;
  const needsProfessional = review.verdict === 'needs_human_professional';

  return (
    <section style={{ marginTop: 24 }}>
      {needsProfessional ? (
        <p role="alert" style={{ padding: 16, border: '2px solid crimson', borderRadius: 8, fontWeight: 600 }}>
          ⚠️ Этот запрос требует консультации специалиста
        </p>
      ) : (
        <>
          <h2>План</h2>
          <pre style={{ whiteSpace: 'pre-wrap', font: 'inherit' }}>{plan}</pre>
        </>
      )}

      <h2>Safety review</h2>
      <p>
        Verdict: <b>{review.verdict}</b> · Score: <b>{review.score}/10</b> · Раундов: <b>{rounds}</b>
      </p>
      {review.issues.length ? (
        <ul>
          {review.issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      ) : (
        <p>Замечаний нет</p>
      )}
    </section>
  );
}
