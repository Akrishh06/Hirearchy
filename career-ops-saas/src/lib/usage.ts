import { prisma } from "@/lib/db";

export async function trackUsage(params: {
  workspaceId: string;
  userId: string;
  feature: string;
  quantity?: number;
  tokenUsage?: number;
  estimatedCost?: number;
}) {
  const quantity = params.quantity ?? 1;
  const day = new Date();
  day.setHours(0, 0, 0, 0);

  await prisma.usageLedger.create({
    data: {
      workspaceId: params.workspaceId,
      userId: params.userId,
      feature: params.feature,
      quantity,
      windowStart: day,
      windowEnd: new Date(day.getTime() + 86_400_000),
    },
  });

  const updateData: {
    evaluations?: { increment: number };
    scans?: { increment: number };
    applications?: { increment: number };
    tokenUsage?: { increment: number };
    estimatedCost?: { increment: number };
  } = {};

  if (params.feature === "evaluation") updateData.evaluations = { increment: quantity };
  if (params.feature === "scan") updateData.scans = { increment: quantity };
  if (params.feature === "application") updateData.applications = { increment: quantity };
  if (params.tokenUsage) updateData.tokenUsage = { increment: params.tokenUsage };
  if (params.estimatedCost) updateData.estimatedCost = { increment: params.estimatedCost };

  await prisma.dailyUsageRollup.upsert({
    where: {
      workspaceId_userId_day: {
        workspaceId: params.workspaceId,
        userId: params.userId,
        day,
      },
    },
    update: updateData,
    create: {
      workspaceId: params.workspaceId,
      userId: params.userId,
      day,
      evaluations: params.feature === "evaluation" ? quantity : 0,
      scans: params.feature === "scan" ? quantity : 0,
      applications: params.feature === "application" ? quantity : 0,
      tokenUsage: params.tokenUsage ?? 0,
      estimatedCost: params.estimatedCost ?? 0,
    },
  });
}
