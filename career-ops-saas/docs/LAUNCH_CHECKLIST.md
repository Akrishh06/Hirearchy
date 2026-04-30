# Launch Checklist

## Environment
- Set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`.
- Run `npm install`.
- Run `npm run prisma:generate`.
- Run `npm run db:reset`.
- Run `npm run db:seed:launch`.

## Quality Gates
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:smoke`

## Functional Validation
- Signup + login + logout.
- Dashboard onboarding and evaluate flow.
- Scan flow, rate limits, and API envelope responses.
- Admin metrics page for owner/admin users.
- Pro billing state and Stripe checkout behavior.

## Production Safety
- Rotate API keys before release.
- Disable development defaults in `.env`.
- Monitor auth failures and API error rates.
