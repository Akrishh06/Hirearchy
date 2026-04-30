import bcrypt from "bcryptjs";
import { z } from "zod";

import { fail, ok } from "@/lib/api";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return fail({ code: "INVALID_REQUEST", message: "Invalid signin payload" }, 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (!user) {
      return fail({ code: "INVALID_CREDENTIALS", message: "Invalid email or password" }, 401);
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      return fail({ code: "INVALID_CREDENTIALS", message: "Invalid email or password" }, 401);
    }

    await createSession(user.id);
    return ok({ userId: user.id, email: user.email, name: user.name });
  } catch {
    return fail({ code: "SIGNIN_FAILED", message: "Signin failed. Please try again." }, 500);
  }
}
