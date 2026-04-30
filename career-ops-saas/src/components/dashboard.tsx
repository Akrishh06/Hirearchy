"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { signOut } from "firebase/auth";

import type { EvaluationResult, JobCandidate } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getFirebaseAuth } from "@/lib/firebase";

type IntakeState = {
  company: string;
  role: string;
  source: string;
  url: string;
  jdText: string;
};

type ApplicationItem = {
  id: string;
  company: string;
  role: string;
  score: number;
  status: "Evaluated" | "Applied" | "Interview";
};

type DashboardProps = {
  planTier: "FREE" | "PRO" | "COACH";
  userRole?: string;
};

export function Dashboard({ planTier, userRole = "MEMBER" }: DashboardProps) {
  const isProUser = planTier === "PRO" || planTier === "COACH";
  const [query, setQuery] = useState("AI Engineer");
  const [intake, setIntake] = useState<IntakeState>({
    company: "",
    role: "",
    source: "manual",
    url: "",
    jdText: "",
  });
  const [scanResults, setScanResults] = useState<JobCandidate[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [status, setStatus] = useState("Ready.");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const canSubmitIntake = useMemo(
    () => intake.company.trim() && intake.role.trim() && (intake.jdText.trim().length >= 20 || intake.url.trim()),
    [intake.company, intake.role, intake.jdText, intake.url],
  );

  async function runScan() {
    try {
      setLoadingAction("scan");
      const response = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "Scan failed");
      setScanResults(data.data.jobs ?? []);
      setStatus(`Scan complete: found ${data.data.count ?? 0} roles.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Scan failed.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function createEvaluation() {
    if (!canSubmitIntake) {
      setStatus("Enter company, role, and either JD text or URL.");
      return;
    }
    try {
      setLoadingAction("intake");
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...intake,
          url: intake.url.trim() || undefined,
          jdText: intake.jdText.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "Failed to create evaluation");
      const result = data.data.evaluation as EvaluationResult;
      setEvaluation(result);
      setApplications((previous) => [
        {
          id: crypto.randomUUID(),
          company: intake.company,
          role: intake.role,
          score: Number(result.score.overall.toFixed(1)),
          status: "Evaluated",
        },
        ...previous,
      ]);
      setStatus(`Evaluation created: ${result.score.overall.toFixed(1)}/5 (${result.recommendation}).`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Evaluation failed.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function runStandaloneEvaluation() {
    if (intake.jdText.trim().length < 20) {
      setStatus("Paste at least 20 characters of JD text to run evaluate.");
      return;
    }
    try {
      setLoadingAction("evaluate");
      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: intake.company || "Unknown Company",
          role: intake.role || "Unknown Role",
          jdText: intake.jdText,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "Evaluation failed");
      const result = data.data as EvaluationResult;
      setEvaluation(result);
      setStatus(`Quick evaluation complete: ${result.score.overall.toFixed(1)}/5.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Quick evaluation failed.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function upgradePlan() {
    if (isProUser) {
      setStatus("Pro already active on this account.");
      return;
    }
    try {
      setLoadingAction("upgrade");
      const response = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setStatus(data?.error?.message ? `Upgrade unavailable: ${data.error.message}` : "Upgrade unavailable.");
        return;
      }
      if (data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl as string;
        return;
      }
      setStatus(data.data.reason ?? "Checkout session created without URL.");
    } catch {
      setStatus("Could not start checkout.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function signOutNow() {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
    window.location.href = "/login";
  }

  function onFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setIntake((previous) => ({ ...previous, jdText: String(reader.result ?? "") }));
      setStatus(`Loaded JD from file: ${file.name}.`);
    };
    reader.readAsText(file);
  }

  function markApplied(id: string) {
    setApplications((previous) => previous.map((item) => (item.id === id ? { ...item, status: "Applied" } : item)));
    setStatus("Application status updated to Applied.");
  }

  function markInterview(id: string) {
    setApplications((previous) => previous.map((item) => (item.id === id ? { ...item, status: "Interview" } : item)));
    setStatus("Application status updated to Interview.");
  }

  return (
    <div className="space-y-6 text-zinc-100">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Evaluations", value: String(evaluation ? 1 : 0) },
              { label: "Applications", value: String(applications.length) },
              { label: "Portal Results", value: String(scanResults.length) },
              { label: "Plan", value: planTier },
            ].map((metric) => (
              <Card key={metric.label}>
                <CardHeader>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle className="text-2xl">{metric.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
            <Card className="mt-4">
            <CardHeader>
              <CardTitle>First-run onboarding</CardTitle>
              <CardDescription>Follow this sequence for highest conversion.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-300">
              <p>1. Complete profile and role targets</p>
              <p>2. Evaluate your first job description</p>
              <p>3. Scan portals and shortlist opportunities</p>
              <p>4. Track status transitions through interview and offer</p>
              <p>5. Review weekly metrics and refine targeting</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluate">
          <p className="mb-3 rounded-md border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-300">{status}</p>
          <Card>
            <CardHeader>
              <CardTitle>Start New Search</CardTitle>
              <CardDescription>Run an agentic evaluation and get next actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 md:grid-cols-2">
                <Input value={intake.company} onChange={(event) => setIntake((previous) => ({ ...previous, company: event.target.value }))} placeholder="Company" />
                <Input value={intake.role} onChange={(event) => setIntake((previous) => ({ ...previous, role: event.target.value }))} placeholder="Role" />
              </div>
              <Input value={intake.url} onChange={(event) => setIntake((previous) => ({ ...previous, url: event.target.value }))} placeholder="Job URL (optional)" />
              <Textarea value={intake.jdText} onChange={(event) => setIntake((previous) => ({ ...previous, jdText: event.target.value }))} placeholder="Paste JD text here" rows={8} />
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100">
                  Upload JD file
                  <input type="file" accept=".txt,.md" onChange={onFileUpload} className="hidden" />
                </label>
                <Button type="button" onClick={createEvaluation} disabled={!canSubmitIntake || loadingAction === "intake"}>
                  {loadingAction === "intake" ? "Creating..." : "Create Search + Evaluation"}
                </Button>
                <Button type="button" variant="outline" onClick={runStandaloneEvaluation} disabled={loadingAction === "evaluate"}>
                  {loadingAction === "evaluate" ? "Evaluating..." : "Quick Evaluate JD"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Latest Evaluation Output</CardTitle>
              <CardDescription>Structured output from the AI agent pipeline.</CardDescription>
            </CardHeader>
            <CardContent>
              {!evaluation ? (
                <p className="text-sm text-zinc-400">Run intake or quick evaluate to see results.</p>
              ) : (
                <div className="space-y-2 text-sm text-zinc-300">
                  <p><span className="font-medium">Overall:</span> {evaluation.score.overall.toFixed(1)}/5</p>
                  <p><span className="font-medium">Recommendation:</span> {evaluation.recommendation}</p>
                  <p><span className="font-medium">Summary:</span> {evaluation.summary}</p>
                  <p><span className="font-medium">Gaps:</span> {evaluation.gaps.join("; ")}</p>
                  <p><span className="font-medium">Strengths:</span> {evaluation.strengths.join("; ")}</p>
                  <p><span className="font-medium">Next Actions:</span> {evaluation.nextActions.join("; ")}</p>
                  <p><span className="font-medium">Agent Model:</span> {evaluation.modelUsed}</p>
                  {evaluation.agentErrorCode ? <p><span className="font-medium">Agent Status:</span> {evaluation.agentErrorCode}</p> : null}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <p className="mb-3 rounded-md border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-300">{status}</p>
          <Card>
            <CardHeader>
              <CardTitle>Portal scanner</CardTitle>
              <CardDescription>Discover and shortlist new roles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search query" />
                <Button type="button" onClick={runScan} disabled={loadingAction === "scan"}>
                  {loadingAction === "scan" ? "Scanning..." : "Scan"}
                </Button>
              </div>
              <div className="space-y-2">
                {scanResults.length === 0 ? (
                  <p className="text-sm text-zinc-400">No scan results yet.</p>
                ) : (
                  scanResults.map((job) => (
                    <div key={job.url} className="rounded-md border border-zinc-800 bg-zinc-900/70 p-3 text-sm">
                      <p className="font-medium text-zinc-100">{job.company} - {job.role}</p>
                      <p className="text-zinc-400">{job.location}</p>
                      <a className="text-blue-400 underline" href={job.url} target="_blank" rel="noreferrer">Open posting</a>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Application tracker</CardTitle>
              <CardDescription>Keep opportunity states accurate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {applications.length === 0 ? (
                <p className="text-sm text-zinc-400">Create an evaluation to add your first tracked application.</p>
              ) : (
                applications.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/70 p-2">
                    <p className="text-sm text-zinc-200"><span className="font-medium">{item.company}</span> - {item.role} ({item.score}/5)</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.status === "Interview" ? "success" : "secondary"}>{item.status}</Badge>
                      <Button type="button" size="sm" variant="outline" onClick={() => markApplied(item.id)}>Mark Applied</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => markInterview(item.id)}>Mark Interview</Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account and plan</CardTitle>
                <CardDescription>Manage role and billing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">Role: {userRole}</p>
                <p className="text-sm">Current plan: {planTier}</p>
                <Button type="button" onClick={upgradePlan} disabled={loadingAction === "upgrade" || isProUser}>
                  {isProUser ? "Pro Active" : loadingAction === "upgrade" ? "Opening..." : "Upgrade to Pro"}
                </Button>
                <Button type="button" variant="outline" onClick={signOutNow}>
                  Logout
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>System status</CardTitle>
                <CardDescription>Latest workflow result.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="rounded-md border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-300">{status}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
