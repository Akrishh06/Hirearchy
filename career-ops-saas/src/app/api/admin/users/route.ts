import { prisma } from "@/lib/db";
import { fail, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";

export async function GET() {
  const { role, userId } = await getRequestContext();
  if (!userId) return fail({ code: "UNAUTHORIZED", message: "Login required" }, 401);
  if (role !== "OWNER") {
    return fail({ code: "FORBIDDEN", message: "Owner access required" }, 403);
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return ok(users);
}
