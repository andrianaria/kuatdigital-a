import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import KuatSite from "@/components/KuatSite";
import { getCatalogData } from "@/lib/catalog-data";
import { getAuthenticatedIdentity } from "@/lib/identity";

type Props = { params: Promise<{ path: string[] }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const [section, slug] = path;
  const catalog = await getCatalogData();
  const detail =
    section === "edukasi"
      ? catalog.education.find((x) => x.slug === slug)?.title
      : section === "produk"
        ? catalog.products.find((x) => x.slug === slug)?.name
        : section === "layanan"
          ? catalog.services.find((x) => x.slug === slug)?.name
          : section === "freelancer"
            ? catalog.freelancers.find((x) => x.slug === slug)?.name
            : undefined;
  const names: Record<string, string> = {
    edukasi: "Edukasi UMKM",
    produk: "Rekomendasi App Bisnis",
    layanan: "Layanan KUAT Digital",
    freelancer: "Direktori Freelancer",
    "tes-kesiapan-digital": "Tes Kesiapan Digital UMKM",
    "kebijakan-privasi": "Kebijakan Privasi",
    "syarat-ketentuan": "Syarat dan Ketentuan",
    login: "Masuk",
    register: "Daftar Member",
    dashboard: "Dashboard Member",
    "freelancer-dashboard": "Dashboard Freelancer",
    admin: "Admin",
  };
  const title = detail ?? names[section] ?? "KUAT Digital";
  return {
    title,
    description: `Jelajahi ${title} di KUAT Digital, rumah tumbuh digital untuk UMKM Indonesia.`,
  };
}

export default async function CatchAllPage({ params }: Props) {
  const { path } = await params;
  const isReadinessTest = path[0] === "tes-kesiapan-digital" && path[1] === "mulai";
  const [catalogData, identity] = await Promise.all([
    getCatalogData(),
    isReadinessTest ? getAuthenticatedIdentity() : Promise.resolve(null),
  ]);
  if (path[0] === "freelancer" && path[1] && !catalogData.freelancers.some((item) => item.slug === path[1]))
    notFound();
  if (isReadinessTest && (!identity || identity.suspended))
    redirect("/register?redirect_url=%2Ftes-kesiapan-digital%2Fmulai");
  return <KuatSite path={path} catalogData={catalogData} readinessAuthenticated={Boolean(identity && !identity.suspended)} />;
}
