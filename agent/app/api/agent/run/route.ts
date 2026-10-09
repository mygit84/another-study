// POST /api/agent/run { task } → { plan, review, rounds }
import { z } from 'zod';
import { runHealthAgent } from '@/harness/runHealthAgent';

const BodySchema = z.object({ task: z.string().trim().min(1) });

export async function POST(request: Request) {
  const body = BodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: 'Введите задачу' }, { status: 400 });
  try {
    return Response.json(await runHealthAgent(body.data.task));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
