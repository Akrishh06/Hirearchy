import { z } from "zod";

import { evaluateWithAgenticFlow } from "@/lib/evaluation";
import { getRequestContext } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { ok, fail } from "@/lib/api";
import { trackUsage } from "@/lib/usage";

export async function GET() {
  const { userId } = await getRequestContext();

  return ok({
    userId,
    evaluations: [
      { company: "Retool", role: "AI PM", score: 4.2, recommendation: "apply" },
      { company: "OpenAI", role: "Solutions Architect", score: 3.8, recommendation: "consider" },
      { company: "BigCo", role: "Automation Analyst", score: 2.9, recommendation: "skip" },
    ],
  });
}

export async function POST(request: Request) {
  const { userId, workspaceId } = await getRequestContext();
  if (!userId || !workspaceId) return fail({ code: "UNAUTHORIZED", message: "Login required" }, 401);

  const limiter = checkRateLimit(`${userId}:evaluations`, 40, 60_000);
  if (!limiter.allowed) return fail({ code: "RATE_LIMITED", message: "Too many evaluation requests" }, 429);

  const parsed = z
    .object({
      company: z.string().default("Unknown Company"),
      role: z.string().default("Unknown Role"),
      jdText: z.string().min(20),
    })
    .safeParse(await request.json());
  if (!parsed.success) return fail({ code: "INVALID_REQUEST", message: "Invalid evaluation payload" }, 400);

  const result = await evaluateWithAgenticFlow(parsed.data, {
    workspaceId,
    userId,
  });
  await trackUsage({ workspaceId, userId, feature: "evaluation", quantity: 1 });

  return ok(result);
}
