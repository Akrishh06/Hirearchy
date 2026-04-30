# Commercial Readiness

## Billing gates
- Plan tiers defined in schema: `FREE`, `PRO`, `COACH`.
- Checkout endpoint: `POST /api/billing/checkout`.
- Suggested limits:
  - Free: 15 evaluations/month, 3 scans/month, 2 PDF exports/month.
  - Pro: 200 evaluations/month, 50 scans/month, 50 PDF exports/month.
  - Coach: custom quota and multi-candidate support.

## Metrics instrumentation
- Track activation events: first JD intake, first evaluation, first PDF export, first tracked application.
- Track retention events: weekly scan run, follow-up completion, dashboard revisit.
- Persist usage in `UsageEvent` and experiments in `ExperimentEvent`.

## Legal baseline
- Privacy policy route: `/legal/privacy`.
- Terms route: `/legal/terms`.
- Next additions: DPA, consent logging, data export/deletion endpoint.

## Launch experiments
- `onboarding_wizard_v2` to improve activation.
- `pricing_anchor_test` to improve trial-to-paid conversion.
- Evaluate experiment impact using event conversion snapshots every two weeks.
