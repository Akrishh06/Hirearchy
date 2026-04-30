import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";

const SESSION_COOKIE = "careerops_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

function sha256(value: string) {
  const secret = process.env.AUTH_SECRET ?? "dev-auth-secret";
  return createHash("sha256").update(`${value}.${secret}`).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.sessionToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.sessionToken.deleteMany({
      where: { tokenHash: sha256(token) },
    });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.sessionToken.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.sessionToken.delete({ where: { id: session.id } });
    return null;
  }
  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireSession() {
  const user = await requireUser();
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: "OWNER",
      workspaceId: "",
      planTier: "FREE" as const,
    },
  };
}

export async function getRequestContext() {
  const user = await getCurrentUser();
  return {
    userId: user?.id ?? "",
    workspaceId: "",
    role: user?.email?.toLowerCase() === process.env.OWNER_EMAIL?.toLowerCase() ? "OWNER" : "MEMBER",
  };
}

export async function getRequestUserId() {
  const user = await getCurrentUser();
  return user?.id ?? "";
}

export async function getAuthSession() {
  const user = await getCurrentUser();
  if (!user) return null;
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      planTier: "FREE",
    },
  };
}
