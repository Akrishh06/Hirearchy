"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";

import { Dashboard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from "@/lib/firebase";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      router.replace("/login");
      return;
    }
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      if (!nextUser) {
        router.replace("/login");
      } else {
        setUser(nextUser);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading) {
    return <main className="min-h-screen bg-black p-8 text-zinc-200">Loading dashboard...</main>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black px-6 py-8 font-sans text-zinc-100">
      <main className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-100">Career-Ops SaaS Dashboard</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Evaluate roles, tailor CVs, scan portals, and run your full job search pipeline.
            </p>
            <p className="mt-1 text-xs text-zinc-500">Signed in as {user.email}</p>
          </div>
          <div className="flex gap-3 text-sm">
            <Button asChild variant="outline">
              <Link href="/users">Users</Link>
            </Button>
            <Link href="/legal/privacy" className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-200 hover:bg-zinc-900">
              Privacy
            </Link>
            <Link href="/legal/terms" className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-200 hover:bg-zinc-900">
              Terms
            </Link>
          </div>
        </header>

        <Dashboard planTier="FREE" userRole="MEMBER" />
      </main>
    </div>
  );
}
