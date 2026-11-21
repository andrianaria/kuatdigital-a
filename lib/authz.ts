import { redirect } from "next/navigation";
import { getAuthenticatedIdentity } from "@/lib/identity";
import type { AppRole } from "@/lib/roles";

export async function requireDashboardRole(): Promise<Exclude<AppRole, "admin">> {
  const identity = await getAuthenticatedIdentity();
  if (!identity) redirect("/login?redirect_url=%2Fdashboard");
  if (identity.suspended) redirect("/?auth=suspended");
  if (identity.role === "admin") redirect("/admin");
  return identity.role;
}

export async function requireFreelancer() {
  const identity = await getAuthenticatedIdentity();
  if (!identity) redirect("/login?redirect_url=%2Ffreelancer-dashboard");
  if (identity.suspended) redirect("/?auth=suspended");
  if (identity.role === "admin") redirect("/admin");
  if (identity.role !== "freelancer") redirect("/dashboard");
  return identity;
}

export async function requireAdmin() {
  const identity = await getAuthenticatedIdentity();
  if (!identity) redirect("/login?redirect_url=%2Fadmin");
  if (identity.suspended) redirect("/?auth=suspended");
  if (identity.role === "admin") return identity;
  redirect("/?auth=forbidden");
}
