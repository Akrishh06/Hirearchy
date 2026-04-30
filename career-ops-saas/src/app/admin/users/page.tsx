import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminUsersPage() {
  const user = await requireUser();
  if (user.email.toLowerCase() !== process.env.OWNER_EMAIL?.toLowerCase()) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>Only owner email can view registered users.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return (
    <main className="mx-auto max-w-6xl space-y-4 px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>User metrics admin</CardTitle>
          <CardDescription>Simple list of every signed-up user.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((listedUser) => (
                <tr key={listedUser.id} className="border-b border-zinc-100">
                  <td className="py-2">{listedUser.name}</td>
                  <td className="py-2">{listedUser.email}</td>
                  <td className="py-2">{listedUser.createdAt.toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}
