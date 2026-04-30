import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    experiments: [
      { key: "onboarding_wizard_v2", variant: "guided", goal: "Activation lift" },
      { key: "pricing_anchor_test", variant: "pro_highlighted", goal: "Trial-to-paid conversion" },
    ],
  });
}
