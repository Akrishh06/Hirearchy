import { PrismaClient, PlanTier, WorkspaceRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const ownerPasswordHash = await bcrypt.hash("Owner123!", 10);
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const proPasswordHash = await bcrypt.hash("ProUser123!", 10);
  const freePasswordHash = await bcrypt.hash("FreeUser123!", 10);

  const workspace = await prisma.workspace.upsert({
    where: { slug: "launch-workspace" },
    update: { name: "Launch Workspace" },
    create: {
      slug: "launch-workspace",
      name: "Launch Workspace",
    },
  });

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "owner@careerops.app" },
      update: { passwordHash: ownerPasswordHash, planTier: PlanTier.COACH },
      create: {
        email: "owner@careerops.app",
        name: "Workspace Owner",
        passwordHash: ownerPasswordHash,
        timezone: "Australia/Sydney",
        planTier: PlanTier.COACH,
      },
    }),
    prisma.user.upsert({
      where: { email: "admin@careerops.app" },
      update: { passwordHash: adminPasswordHash, planTier: PlanTier.PRO },
      create: {
        email: "admin@careerops.app",
        name: "Workspace Admin",
        passwordHash: adminPasswordHash,
        timezone: "Australia/Sydney",
        planTier: PlanTier.PRO,
      },
    }),
    prisma.user.upsert({
      where: { email: "pro@careerops.app" },
      update: { passwordHash: proPasswordHash, planTier: PlanTier.PRO },
      create: {
        email: "pro@careerops.app",
        name: "Pro User",
        passwordHash: proPasswordHash,
        timezone: "Australia/Sydney",
        planTier: PlanTier.PRO,
      },
    }),
    prisma.user.upsert({
      where: { email: "free@careerops.app" },
      update: { passwordHash: freePasswordHash, planTier: PlanTier.FREE },
      create: {
        email: "free@careerops.app",
        name: "Free User",
        passwordHash: freePasswordHash,
        timezone: "Australia/Sydney",
        planTier: PlanTier.FREE,
      },
    }),
  ]);

  const roleMap: WorkspaceRole[] = [WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER, WorkspaceRole.MEMBER];
  await Promise.all(
    users.map((user, index) =>
      prisma.membership.upsert({
        where: {
          workspaceId_userId: {
            workspaceId: workspace.id,
            userId: user.id,
          },
        },
        update: { role: roleMap[index] },
        create: {
          workspaceId: workspace.id,
          userId: user.id,
          role: roleMap[index],
        },
      }),
    ),
  );

  const day = new Date();
  day.setHours(0, 0, 0, 0);

  await Promise.all(
    users.map((user, index) =>
      prisma.dailyUsageRollup.upsert({
        where: {
          workspaceId_userId_day: {
            workspaceId: workspace.id,
            userId: user.id,
            day,
          },
        },
        update: {},
        create: {
          workspaceId: workspace.id,
          userId: user.id,
          day,
          evaluations: 12 - index * 2,
          applications: 6 - index,
          scans: 4 + index,
          interviews: 2 - (index > 1 ? 1 : 0),
          offers: index === 0 ? 1 : 0,
          tokenUsage: 13000 - index * 2500,
          estimatedCost: 1.6 - index * 0.25,
        },
      }),
    ),
  );

  console.log("Launch seed complete.");
  console.log("owner@careerops.app / Owner123!");
  console.log("admin@careerops.app / Admin123!");
  console.log("pro@careerops.app / ProUser123!");
  console.log("free@careerops.app / FreeUser123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
