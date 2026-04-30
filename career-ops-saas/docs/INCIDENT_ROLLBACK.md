# Incident and Rollback Notes

## Incident triage
1. Check auth health (`/api/auth/session`).
2. Check DB availability and query latency.
3. Check OpenAI response failures and fallback rate.
4. Check Stripe checkout endpoint status.

## Rollback strategy
1. Revert latest deployment.
2. Re-run `npm run prisma:generate` for matching client.
3. If schema mismatch exists, apply last known good migration.
4. Re-seed only in non-production environments.

## Data integrity checks
- Verify workspace memberships are intact.
- Verify daily usage rollups keep accumulating.
- Confirm evaluation creation still writes prompt run metadata.
