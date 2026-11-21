import KuatSite from "@/components/KuatSite";
import { getMemberDashboardData } from "@/lib/admin-data";
import { requireDashboardRole } from "@/lib/authz";
import { getCatalogData } from "@/lib/catalog-data";
import { getAuthenticatedIdentity } from "@/lib/identity";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  await requireDashboardRole();
  const identity = await getAuthenticatedIdentity();
  if (!identity) return null;
  const [memberData, catalogData] = await Promise.all([
    getMemberDashboardData(identity),
    getCatalogData(),
  ]);
  return (
    <KuatSite
      path={["dashboard", "profile"]}
      memberData={memberData}
      catalogData={catalogData}
    />
  );
}
