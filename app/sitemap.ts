import type { MetadataRoute } from "next";
import { getCatalogData } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { education, freelancers, products, services } = await getCatalogData();
  const base = "https://example.com";
  const staticRoutes = [
    "",
    "/edukasi",
    "/produk",
    "/layanan",
    "/freelancer",
    "/jadi-freelancer",
    "/tes-kesiapan-digital",
    "/kebijakan-privasi",
    "/syarat-ketentuan",
    "/login",
    "/register",
  ];
  return [
    ...staticRoutes.map((url) => ({
      url: `${base}${url}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
    })),
    ...education.map((x) => ({
      url: `${base}/edukasi/${x.slug}`,
      lastModified: new Date(),
    })),
    ...products.map((x) => ({
      url: `${base}/produk/${x.slug}`,
      lastModified: new Date(),
    })),
    ...services.map((x) => ({
      url: `${base}/layanan/${x.slug}`,
      lastModified: new Date(),
    })),
    ...freelancers.map((x) => ({
      url: `${base}/freelancer/${x.slug}`,
      lastModified: new Date(),
    })),
  ];
}
