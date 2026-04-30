"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const raw = await response.text();
      let payload: { error?: { message?: string } } | null = null;
      try {
        payload = raw ? (JSON.parse(raw) as { error?: { message?: string } }) : null;
      } catch {
        payload = null;
      }

      if (!response.ok) {
        setStatus(payload?.error?.message ?? `Signup failed (${response.status})`);
        return;
      }

      setStatus("Account created. Redirecting to sign in...");
      router.push("/login");
    } catch {
      setStatus("Signup failed due to a network/server error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Start your job search workspace from zero.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required />
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" required />
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password (8+ chars)"
              required
            />
            {status ? <p className="text-sm text-zinc-600">{status}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
            <p className="text-xs text-zinc-500">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
