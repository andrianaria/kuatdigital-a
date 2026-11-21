import KuatSite from "@/components/KuatSite";
import { requireDashboardRole } from "@/lib/authz";
import { getMemberDashboardData, getFreelancerDashboardData } from "@/lib/admin-data";
import { getAuthenticatedIdentity } from "@/lib/identity";
import { getCatalogData } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const role = await requireDashboardRole();
  const identity = await getAuthenticatedIdentity();
  if (!identity) return null;
  if (role === "freelancer") {
    const [freelancerData, catalogData] = await Promise.all([getFreelancerDashboardData(identity), getCatalogData()]);
    return <KuatSite path={["freelancer-dashboard"]} freelancerData={freelancerData} catalogData={catalogData} />;
  }
  const [memberData, catalogData] = await Promise.all([getMemberDashboardData(identity), getCatalogData()]);
  return <KuatSite path={["dashboard"]} memberData={memberData} catalogData={catalogData} />;
}
