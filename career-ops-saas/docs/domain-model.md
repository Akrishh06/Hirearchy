# HIrearchy Domain Model

## Purpose
This model migrates markdown-centric workflow into relational, auditable entities suitable for multi-tenant SaaS.

## Entity map
- `User`: account, plan, billing identity, tenancy root.
- `CandidateProfile`: job search strategy, compensation targets, and preference constraints.
- `JobPosting`: normalized JD source (`url` or text), legitimacy tier, source metadata.
- `EvaluationReport`: structured scorecard (A-F equivalent), confidence, gaps, recommendation.
- `Application`: canonical lifecycle status and report snapshot for historical consistency.
- `ResumeVersion`: tailored CV markdown and PDF artifacts for each role direction.
- `OutreachDraft`: generated networking drafts linked to a user context.
- `FollowUpTask`: due dates and reminders against opportunities.
- `PromptRun`: AI trust and cost observability (model, prompt version, tokens, latency, cost).
- `UsageEvent`: feature metering for quotas and billing.
- `ExperimentEvent`: product analytics for launch and onboarding experiments.

## Why this shape
- Preserves HIrearchy flow: ingest -> evaluate -> tailor CV -> track -> follow up.
- Supports individual users today, team workspaces later (add `workspaceId` without schema rewrite).
- Enables VC-ready instrumentation from day one through `PromptRun`, `UsageEvent`, and `ExperimentEvent`.

## Status model
Application statuses map to existing canonical tracker states:
- `EVALUATED`, `APPLIED`, `RESPONDED`, `INTERVIEW`, `OFFER`, `REJECTED`, `DISCARDED`, `SKIP`.

## Data governance baseline
- Keep JD source text and generated rationale for explainability.
- Store prompt metadata and model outputs for audits and dispute handling.
- Store only required PII for user account operations and job matching.
