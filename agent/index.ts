// CLI-обёртка над runHealthAgent.
// Запуск из agent/: npm run cli -- "составь план питания на завтра"
import { runHealthAgent } from '@/harness/runHealthAgent';

async function main() {
  const task = process.argv.slice(2).join(' ').trim();
  if (!task) {
    console.error('Использование: npm run cli -- "составь план питания на завтра"');
    process.exitCode = 1;
    return;
  }
  const { review } = await runHealthAgent(task);
  if (review.verdict === 'revise') process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(`Ошибка: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
