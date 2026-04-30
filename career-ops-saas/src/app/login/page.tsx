"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";

import { getFirebaseAuth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase is unavailable");
      await signInWithEmailAndPassword(auth, email.trim(), password);

      router.push("/");
      router.refresh();
    } catch {
      setError("Signin failed. Check your Firebase credentials and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-10">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Sign in to Career-Ops SaaS</h1>
          <p className="mt-1 text-sm text-zinc-600">Use your email and password to access your dashboard.</p>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-zinc-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-zinc-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            required
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-xs text-zinc-500">
          Need an account?{" "}
          <Link href="/signup" className="underline">
            Create one
          </Link>
          .
        </p>
      </form>
    </main>
  );
}
