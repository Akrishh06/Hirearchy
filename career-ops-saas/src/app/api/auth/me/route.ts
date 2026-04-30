import { fail, ok } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return fail({ code: "UNAUTHORIZED", message: "Login required" }, 401);
  }
  return ok({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  });
}
