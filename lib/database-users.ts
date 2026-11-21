import { eq } from "drizzle-orm";

import { database } from "@/db";
import { accounts, users } from "@/db/schema";
import type { AuthenticatedIdentity } from "@/lib/identity";

const databaseRole = {
  member: "MEMBER",
  freelancer: "FREELANCER",
  admin: "ADMIN",
} as const;

export async function syncDatabaseUser(identity: AuthenticatedIdentity) {
  const db = database();
  const existing = await db.query.users.findFirst({
    where: eq(users.email, identity.email),
  });

  let userId = existing?.id;
  if (existing) {
    const requestedRole = databaseRole[identity.role];
    const nextRole =
      requestedRole === "ADMIN" || existing.role === "ADMIN"
        ? "ADMIN"
        : requestedRole === "FREELANCER" || existing.role === "FREELANCER"
          ? "FREELANCER"
          : requestedRole;
    await db
      .update(users)
      .set({ role: nextRole })
      .where(eq(users.id, existing.id));
  } else {
    const result = await db.insert(users).values({
      name: identity.name,
      email: identity.email,
      role: databaseRole[identity.role],
      emailVerifiedAt: new Date(),
    });
    userId = Number(result[0].insertId);
  }

  await db
    .insert(accounts)
    .values({
      userId: userId!,
      provider: identity.provider,
      providerAccountId: identity.providerAccountId,
    })
    .onDuplicateKeyUpdate({ set: { userId: userId! } });

  const current = existing ?? {
    name: identity.name,
    email: identity.email,
    whatsapp: null,
    deletedAt: null,
  };
  return {
    id: userId!,
    name: current.name,
    email: current.email,
    whatsapp: current.whatsapp,
    suspended: Boolean(current.deletedAt),
  };
}
