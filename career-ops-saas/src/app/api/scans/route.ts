import { z } from "zod";

import { scanPortals } from "@/lib/scanners";
import { getRequestContext } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { ok, fail } from "@/lib/api";
import { trackUsage } from "@/lib/usage";

export async function POST(request: Request) {
  const { userId, workspaceId } = await getRequestContext();
  if (!userId || !workspaceId) return fail({ code: "UNAUTHORIZED", message: "Login required" }, 401);
  const limiter = checkRateLimit(`${userId}:scan`, 20, 60_000);
  if (!limiter.allowed) return fail({ code: "RATE_LIMITED", message: "Too many scan requests" }, 429);

  const parsed = z.object({ query: z.string().default("AI") }).safeParse(await request.json());
  if (!parsed.success) return fail({ code: "INVALID_REQUEST", message: "Invalid scan request" }, 400);
  const { query } = parsed.data;
  const jobs = await scanPortals(query ?? "AI");
  await trackUsage({ workspaceId, userId, feature: "scan", quantity: 1 });

  return ok({
    userId,
    count: jobs.length,
    jobs,
  });
}
