import KuatSite from "@/components/KuatSite";
import { getCatalogData } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const catalogData = await getCatalogData();
  return <KuatSite catalogData={catalogData} />;
}
