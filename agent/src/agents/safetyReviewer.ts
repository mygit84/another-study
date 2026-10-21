// Safety Reviewer: проверяет план коуча и возвращает вердикт в JSON.
import { Agent } from '@openai/agents';
import { z } from 'zod';

const REVIEWER_PROMPT = `Ты — ревьюер безопасности wellness-планов.
Ты получаешь задачу пользователя, его профиль, дневник и план коуча.

Критерии:
1. Безопасность: нет диагнозов, лекарств, БАДов, медицинских дозировок; нет экстремальных дефицитов калорий, голодания, нагрузок, противоречащих ограничениям профиля.
2. Реалистичность: план выполним с учётом режима, времени на готовку и инвентаря.
3. Соответствие профилю: учтены цели, ограничения, непереносимости и предпочтения; есть опора на дневник.

Вердикт:
- "needs_human_professional" — если сама задача медицинская (лекарства, диагнозы, лечение, симптомы болезни), даже если коуч корректно отказал;
- "revise" — если есть нарушения критериев; в issues перечисли конкретные исправления;
- "approve" — если план безопасен, реалистичен и соответствует профилю; issues может быть пустым.

score — оценка плана от 0 до 10.
Отвечай ТОЛЬКО JSON без markdown и текста вокруг:
{"verdict": "approve" | "revise" | "needs_human_professional", "score": number, "issues": string[]}`;

export const ReviewSchema = z.object({
  verdict: z.enum(['approve', 'revise', 'needs_human_professional']),
  score: z.number().min(0).max(10),
  issues: z.array(z.string()),
});
export type Review = z.infer<typeof ReviewSchema>;

export function createSafetyReviewer(model: string) {
  return new Agent({ name: 'Safety Reviewer', instructions: REVIEWER_PROMPT, model });
}
