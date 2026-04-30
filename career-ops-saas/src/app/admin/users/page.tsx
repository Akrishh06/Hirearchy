"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFirebaseAuth } from "@/lib/firebase";

export default function AdminUsersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL?.toLowerCase() ?? "";
  const currentEmail = user?.email?.toLowerCase() ?? "";

  return (
    <main className="mx-auto max-w-6xl space-y-4 px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Firebase Auth is active for account management.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          {loading ? <p>Checking Firebase session...</p> : null}
          {!loading && !user ? <p>Please sign in to continue.</p> : null}
          {!loading && user && currentEmail !== ownerEmail ? <p>Access denied. Sign in with owner email.</p> : null}
          {!loading && user && currentEmail === ownerEmail ? (
            <>
              <p>Signed in as owner: {user.email}</p>
              <p>To view all registered users, open Firebase Console → Authentication → Users.</p>
            </>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
