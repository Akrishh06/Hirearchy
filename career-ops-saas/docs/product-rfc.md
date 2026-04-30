# Product + Technical RFC

## Product thesis
Job seekers need a decision system, not a spray-and-pray bot. The platform helps users choose the right roles and execute high-quality applications.

## Core surfaces
1. Dashboard: funnel metrics, score distribution, follow-ups, pipeline health.
2. Job detail: source JD, legitimacy, role profile.
3. Evaluation report: explainable scoring and recommendation.
4. CV Studio: tailored resume versions + PDF exports.
5. Application tracker: canonical status workflow with notes.

## API boundaries
- `POST /api/intake`: accepts URL or JD text and returns normalized posting + evaluation.
- `GET /api/evaluations`: dashboard and reporting feed.
- `POST /api/scans`: run portal adapters and return discovered jobs.
- `POST /api/billing/checkout`: create checkout session placeholder for Stripe integration.
- `GET /api/experiments`: current launch experiments for product iteration.

## Evaluation design
- Inputs: candidate profile + JD text.
- Outputs: score dimensions, overall score, recommendation, confidence, and gap analysis.
- Safety: evidence-backed findings only; confidence drops when sparse evidence.

## Scanner adapters
- First-party adapters: Greenhouse, Ashby, Lever.
- Adapter contract: `scan(query) -> JobCandidate[]`.
- Run as async jobs in production; sync endpoint for MVP demo and admin tools.

## PDF strategy
- Short-term: markdown-to-print rendering with deterministic template.
- Production: queue worker for reliable PDF generation and artifact storage.

## Commercialization
- Plans: Free, Pro, Coach-ready hidden tier.
- Quotas: evaluations per month, scans per month, CV exports per month.
- Instrument events and usage from day 1 for pricing iteration.

## Non-functional requirements
- Tenant-safe data access with strict user scoping.
- Structured logs and trace IDs on all write paths.
- Feature-flagged experiments and onboarding A/B tests.
