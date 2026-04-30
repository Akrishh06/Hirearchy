import bcrypt from "bcryptjs";
import { z } from "zod";

import { ok, fail } from "@/lib/api";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return fail({ code: "INVALID_REQUEST", message: "Invalid signup payload" }, 400);
    }

    const { email, name, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return fail({ code: "CONFLICT", message: "Email already registered" }, 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
      },
    });

    return ok({
      userId: user.id,
      email: user.email,
    });
  } catch {
    return fail(
      {
        code: "SIGNUP_FAILED",
        message: "Signup failed. Check database connectivity and try again.",
      },
      500,
    );
  }
}
