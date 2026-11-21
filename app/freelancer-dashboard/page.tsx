import KuatSite from "@/components/KuatSite";
import { requireFreelancer } from "@/lib/authz";
import { getFreelancerDashboardData } from "@/lib/admin-data";
import { getCatalogData } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export default async function FreelancerDashboardPage() {
  const identity = await requireFreelancer();
  const [freelancerData, catalogData] = await Promise.all([getFreelancerDashboardData(identity), getCatalogData()]);
  return <KuatSite path={["freelancer-dashboard"]} freelancerData={freelancerData} catalogData={catalogData} />;
}
