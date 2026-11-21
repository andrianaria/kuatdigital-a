import KuatSite from "@/components/KuatSite";
import { requireAdmin } from "@/lib/authz";
import { getAdminDashboardData } from "@/lib/admin-data";
import { getCatalogData } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const identity = await requireAdmin();
  const [adminData, catalogData] = await Promise.all([
    getAdminDashboardData(identity),
    getCatalogData(),
  ]);
  return <KuatSite path={["admin"]} adminData={adminData} catalogData={catalogData} />;
}
