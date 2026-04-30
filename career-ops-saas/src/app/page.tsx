"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";

import { Dashboard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import TargetCursor from "@/components/ui/TargetCursor";
import TextType from "@/components/ui/TextType";
import { getFirebaseAuth } from "@/lib/firebase";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
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
      <TargetCursor spinDuration={2.2} hideDefaultCursor parallaxOn />
      <main className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-950 to-zinc-900/90 p-8 shadow-[0_0_40px_rgba(20,184,166,0.12)]">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="space-y-3">
              <p className="inline-flex rounded-full border border-teal-500/50 bg-teal-500/10 px-3 py-1 text-xs tracking-wide text-teal-300">
                AI Job Search OS
              </p>
              <h1 className="text-4xl font-semibold text-white">HIrearchy Dashboard</h1>
              <TextType
                text={[
                  "Turn scattered applications into a clean pipeline.",
                  "Evaluate roles with data-backed confidence.",
                  "Track momentum with a SaaS-grade command center.",
                ]}
                as="p"
                className="text-base text-zinc-300"
                typingSpeed={42}
                deletingSpeed={24}
                pauseDuration={1400}
                variableSpeed={undefined}
                onSentenceComplete={undefined}
                cursorClassName="text-teal-300"
              />
            </div>
            <div className="flex gap-3 text-sm">
              <Button asChild variant="outline">
                <Link className="cursor-target border-teal-500/40 text-teal-200 hover:bg-teal-500/10" href="/users">
                  Users
                </Link>
              </Button>
              <Link
                href="/legal/privacy"
                className="cursor-target rounded-lg border border-zinc-700 px-3 py-2 text-zinc-200 transition hover:border-teal-400 hover:text-teal-200"
              >
                Privacy
              </Link>
              <Link
                href="/legal/terms"
                className="cursor-target rounded-lg border border-zinc-700 px-3 py-2 text-zinc-200 transition hover:border-teal-400 hover:text-teal-200"
              >
                Terms
              </Link>
            </div>
          </div>
          <div className="mt-4 border-t border-zinc-800/70 pt-4">
            <p className="mt-1 text-xs text-zinc-500">Signed in as {user.email}</p>
          </div>
        </header>

        <Dashboard planTier="FREE" userRole="MEMBER" />
      </main>
    </div>
  );
}
