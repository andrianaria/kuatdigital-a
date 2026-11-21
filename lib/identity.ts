import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { database } from "@/db";
import { users } from "@/db/schema";
import { syncClerkRole } from "@/lib/clerk-role";
import { roleForEmails, type AppRole } from "@/lib/roles";

export type AuthenticatedIdentity = {
  provider: "clerk";
  providerAccountId: string;
  email: string;
  name: string;
  role: AppRole;
  suspended: boolean;
};

async function persistedAccess(
  email: string,
  configuredRole: AppRole,
): Promise<{ role: AppRole; suspended: boolean }> {
  if (configuredRole === "admin")
    return { role: configuredRole, suspended: false };
  const record = await database().query.users.findFirst({
    columns: { role: true, deletedAt: true },
    where: eq(users.email, email),
  });
  return {
    role: record?.role === "FREELANCER" ? "freelancer" : "member",
    suspended: Boolean(record?.deletedAt),
  };
}

export async function getAuthenticatedIdentity(): Promise<AuthenticatedIdentity | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  const emails = user?.emailAddresses.map((item) => item.emailAddress) ?? [];
  const email = emails[0]?.toLowerCase();
  if (!email) return null;
  const access = await persistedAccess(
    email,
    roleForEmails(emails, user?.publicMetadata.role),
  );
  const metadataRole = user?.publicMetadata.role;
  if (
    (access.role === "freelancer" && metadataRole !== "freelancer") ||
    (access.role === "member" && metadataRole === "freelancer")
  ) {
    await syncClerkRole({
      clerkUserId: userId,
      email,
      role: access.role,
    });
  }

  return {
    provider: "clerk",
    providerAccountId: userId,
    email,
    name: user?.fullName ?? user?.firstName ?? email.split("@")[0],
    ...access,
  };
}
