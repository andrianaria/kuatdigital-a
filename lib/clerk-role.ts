import { clerkClient } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { database } from "@/db";
import { accounts } from "@/db/schema";

export type SyncedClerkRole = "member" | "freelancer";
export type ClerkRoleSyncStatus = "updated" | "not_found" | "not_configured";

export async function syncClerkRole({
  databaseUserId,
  email,
  clerkUserId,
  role,
}: {
  databaseUserId?: number;
  email: string;
  clerkUserId?: string;
  role: SyncedClerkRole;
}): Promise<ClerkRoleSyncStatus> {
  if (!process.env.CLERK_SECRET_KEY) return "not_configured";

  let resolvedClerkUserId = clerkUserId;
  if (!resolvedClerkUserId && databaseUserId) {
    const linkedAccount = await database().query.accounts.findFirst({
      columns: { providerAccountId: true },
      where: and(
        eq(accounts.userId, databaseUserId),
        eq(accounts.provider, "clerk"),
      ),
    });
    resolvedClerkUserId = linkedAccount?.providerAccountId;
  }

  const client = await clerkClient();
  if (!resolvedClerkUserId) {
    const result = await client.users.getUserList({
      emailAddress: [email.toLowerCase()],
      limit: 2,
    });
    const matchingUser = result.data.find((user) =>
      user.emailAddresses.some(
        (address) => address.emailAddress.toLowerCase() === email.toLowerCase(),
      ),
    );
    resolvedClerkUserId = matchingUser?.id;
  }

  if (!resolvedClerkUserId) return "not_found";
  await client.users.updateUserMetadata(resolvedClerkUserId, {
    publicMetadata: { role },
  });
  return "updated";
}
