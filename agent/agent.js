// Демо AI-агента: исполнитель пишет код, ревьюер даёт замечания, 3–5 итераций.
// Нейросеть DeepSeek вызывается через ProxyAPI (https://proxyapi.ru), формат запроса как у OpenAI.
// Запуск: PROXYAPI_API_KEY=... node agent/agent.js "Реализуй функцию debounce"

const API_URL = 'https://api.proxyapi.ru/v1/chat/completions';
const MODEL = process.env.PROXYAPI_MODEL ?? 'deepseek/deepseek-v4.1-flash';
const MIN_ITERATIONS = 3;
const MAX_ITERATIONS = 5;
const DEFAULT_TASK =
  'Реализуй на JavaScript функцию debounce(fn, delay), которая откладывает вызов fn, пока не пройдёт delay мс с последнего вызова.';

const EXECUTOR_PROMPT = `Ты — исполнитель, опытный JavaScript-разработчик.
Тебе дают задачу и, возможно, замечания ревьюера к твоей прошлой версии кода.
Напиши или исправь код так, чтобы он решал задачу и учитывал все обоснованные замечания.
Ответ: сначала 1–3 предложения о том, что ты сделал или изменил, затем весь код целиком в одном блоке \`\`\`js.`;

const REVIEWER_PROMPT = `Ты — тестировщик и ревьюер кода.
Тебе дают задачу и код исполнителя. Проверь корректность, крайние случаи, обработку ошибок и читаемость.
Перечисли конкретные замечания списком; для каждого объясни, в чём проблема и как исправить.
Последней строкой ответа напиши ровно одно из двух:
ВЕРДИКТ: APPROVED — если код корректен и серьёзных замечаний нет;
ВЕРДИКТ: NEEDS_CHANGES — если есть что исправить.`;

async function callLLM(systemPrompt, userMessage) {
  const apiKey = process.env.PROXYAPI_API_KEY;
  if (!apiKey) throw new Error('Не задана переменная окружения PROXYAPI_API_KEY');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`ProxyAPI ${response.status}: ${await response.text()}`);
  }
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

function extractCode(answer) {
  const match = answer.match(/```(?:js|javascript)?\n([\s\S]*?)```/);
  return match ? match[1].trim() : answer;
}

function printStage(title, text) {
  console.log(`\n${'='.repeat(60)}\n${title}\n${'='.repeat(60)}\n${text}`);
}

async function main() {
  const task = process.argv.slice(2).join(' ') || DEFAULT_TASK;
  printStage(`Задача (модель ${MODEL})`, task);

  let code = '';
  let review = '';

  for (let i = 1; i <= MAX_ITERATIONS; i++) {
    const executorInput = code
      ? `Задача:\n${task}\n\nТвой текущий код:\n\`\`\`js\n${code}\n\`\`\`\n\nЗамечания ревьюера:\n${review}`
      : `Задача:\n${task}`;
    const executorAnswer = await callLLM(EXECUTOR_PROMPT, executorInput);
    code = extractCode(executorAnswer);
    printStage(`Итерация ${i} — Исполнитель`, executorAnswer);

    review = await callLLM(REVIEWER_PROMPT, `Задача:\n${task}\n\nКод:\n\`\`\`js\n${code}\n\`\`\``);
    printStage(`Итерация ${i} — Ревьюер`, review);

    const approved = review.includes('ВЕРДИКТ: APPROVED');
    if (approved && i >= MIN_ITERATIONS) {
      printStage('Итог', `Ревьюер одобрил код на итерации ${i}.`);
      break;
    }
    if (i === MAX_ITERATIONS) {
      printStage('Итог', `Достигнут лимит в ${MAX_ITERATIONS} итераций.`);
    }
  }

  printStage('Финальный код', code);
}

main().catch((error) => {
  console.error(`\nОшибка: ${error.message}`);
  process.exit(1);
});
