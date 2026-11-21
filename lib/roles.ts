export type AppRole = "member" | "freelancer" | "admin";

type RoleEnvironment = {
  ADMIN_EMAILS?: string;
};

function emailAllowlist(value: string | undefined) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function roleForEmails(
  emails: string[],
  _metadataRole?: unknown,
  env: RoleEnvironment = process.env as RoleEnvironment,
): AppRole {
  const normalized = emails.map((email) => email.toLowerCase());
  if (normalized.some((email) => emailAllowlist(env.ADMIN_EMAILS).has(email))) {
    return "admin";
  }
  return "member";
}
