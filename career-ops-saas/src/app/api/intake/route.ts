import { z } from "zod";

import { getRequestContext } from "@/lib/auth";
import { evaluateWithAgenticFlow } from "@/lib/evaluation";
import { telemetry } from "@/lib/telemetry";
import { checkRateLimit } from "@/lib/rate-limit";
import { ok, fail } from "@/lib/api";
import { trackUsage } from "@/lib/usage";

const intakeSchema = z.object({
  company: z.string().min(2),
  role: z.string().min(2),
  jdText: z.string().min(20).optional(),
  source: z.string().default("manual"),
  url: z.string().url().optional(),
});

export async function POST(request: Request) {
  const { userId, workspaceId } = await getRequestContext();
  if (!userId || !workspaceId) return fail({ code: "UNAUTHORIZED", message: "Login required" }, 401);
  const limiter = checkRateLimit(`${userId}:intake`, 30, 60_000);
  if (!limiter.allowed) return fail({ code: "RATE_LIMITED", message: "Too many intake requests" }, 429);

  const body = await request.json();
  const parsed = intakeSchema.safeParse(body);
  if (!parsed.success) return fail({ code: "INVALID_REQUEST", message: "Invalid intake payload" }, 400);
  const payload = parsed.data;
  const jdText =
    payload.jdText ??
    `Imported posting for ${payload.role} at ${payload.company}. URL: ${payload.url ?? "not_provided"}.`;

  const evaluation = await evaluateWithAgenticFlow({
    company: payload.company,
    role: payload.role,
    jdText,
  }, {
    workspaceId,
    userId,
  });
  await trackUsage({ workspaceId, userId, feature: "evaluation", quantity: 1 });
  telemetry.info("intake_created", {
    userId,
    company: payload.company,
    role: payload.role,
    score: evaluation.score.overall,
  });

  return ok({
    userId,
    job: { ...payload, jdText },
    evaluation,
    status: "created",
  });
}
