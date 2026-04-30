import Stripe from "stripe";

import { getAuthSession, getRequestUserId } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { ok, fail } from "@/lib/api";

const stripeKey = process.env.STRIPE_SECRET_KEY;

export async function POST() {
  const session = await getAuthSession();
  if (!session?.user) {
    return fail({ code: "UNAUTHORIZED", message: "Login required" }, 401);
  }

  const userId = await getRequestUserId();
  const limiter = checkRateLimit(`${userId}:billing`, 10, 60_000);
  if (!limiter.allowed) return fail({ code: "RATE_LIMITED", message: "Too many checkout attempts" }, 429);

  if (session.user.planTier === "PRO" || session.user.planTier === "COACH") {
    return ok({
      userId,
      status: "already-pro",
      reason: "Pro plan already active"
    });
  }

  if (!stripeKey) {
    return fail({ code: "FEATURE_DISABLED", message: "Missing STRIPE_SECRET_KEY" }, 501);
  }

  const stripe = new Stripe(stripeKey);
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
    line_items: [{ price: process.env.STRIPE_PRICE_PRO, quantity: 1 }],
  });

  return ok({ userId, checkoutUrl: checkoutSession.url });
}
