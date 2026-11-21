import { and, desc, eq, isNull } from "drizzle-orm";
import { cache } from "react";

import { database } from "@/db";
import {
  educationCategories,
  educationContents,
  freelancerProfiles,
  freelancerPortfolios,
  freelancerServicePackages,
  freelancerSkills,
  partners,
  productCategories,
  productMemberPrices,
  products,
  servicePackages,
  users,
} from "@/db/schema";
import type {
  EducationItem,
  FreelancerItem,
  ProductItem,
  ServiceItem,
} from "@/lib/data";

export type CatalogData = {
  education: EducationItem[];
  products: ProductItem[];
  services: ServiceItem[];
  freelancers: FreelancerItem[];
};

const rupiah = (value: number) =>
  `Rp${new Intl.NumberFormat("id-ID").format(value)}`;
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const getCatalogData = cache(async (): Promise<CatalogData> => {
  const db = database();
  const [articleRows, productRows, memberPriceRows, serviceRows, freelancerRows, skillRows, portfolioRows, freelancerPackageRows] =
    await Promise.all([
      db
        .select({
          slug: educationContents.slug,
          title: educationContents.title,
          category: educationCategories.name,
          level: educationContents.level,
          access: educationContents.access,
          format: educationContents.format,
          durationMinutes: educationContents.durationMinutes,
          excerpt: educationContents.excerpt,
          body: educationContents.body,
          coverImageUrl: educationContents.coverImageUrl,
          videoUrl: educationContents.videoUrl,
          attachments: educationContents.attachments,
        })
        .from(educationContents)
        .leftJoin(
          educationCategories,
          eq(educationContents.categoryId, educationCategories.id),
        )
        .where(
          and(
            eq(educationContents.status, "PUBLISHED"),
            isNull(educationContents.deletedAt),
          ),
        ),
      db
        .select({
          id: products.id,
          slug: products.slug,
          name: products.name,
          category: productCategories.name,
          partner: partners.name,
          price: products.regularPrice,
          description: products.description,
          websiteUrl: products.offerUrl,
          pricingModel: products.pricingModel,
          priceLabel: products.priceLabel,
          platforms: products.platforms,
          bestFor: products.bestFor,
          features: products.features,
          setupLevel: products.setupLevel,
          logoUrl: products.logoUrl,
        })
        .from(products)
        .innerJoin(partners, eq(products.partnerId, partners.id))
        .leftJoin(
          productCategories,
          eq(products.categoryId, productCategories.id),
        )
        .where(
          and(eq(products.status, "PUBLISHED"), isNull(products.deletedAt)),
        ),
      db.select().from(productMemberPrices).orderBy(desc(productMemberPrices.createdAt)),
      db
        .select()
        .from(servicePackages)
        .where(
          and(
            eq(servicePackages.status, "PUBLISHED"),
            isNull(servicePackages.deletedAt),
          ),
        ),
      db
        .select({
          id: freelancerProfiles.id,
          slug: freelancerProfiles.slug,
          name: users.name,
          bio: freelancerProfiles.bio,
          city: freelancerProfiles.city,
          workMode: freelancerProfiles.workMode,
          priceFrom: freelancerProfiles.priceFrom,
          verified: freelancerProfiles.verified,
          availability: freelancerProfiles.availability,
          whatsapp: users.whatsapp,
        })
        .from(freelancerProfiles)
        .innerJoin(users, eq(freelancerProfiles.userId, users.id))
        .where(
          and(
            eq(freelancerProfiles.status, "PUBLISHED"),
            isNull(freelancerProfiles.deletedAt),
          ),
        ),
      db.select().from(freelancerSkills),
      db.select().from(freelancerPortfolios),
      db.select().from(freelancerServicePackages).where(and(eq(freelancerServicePackages.status, "PUBLISHED"), isNull(freelancerServicePackages.deletedAt))).orderBy(freelancerServicePackages.price),
    ]);

  return {
    education: articleRows.map((row) => ({
      slug: row.slug,
      title: row.title,
      category: row.category ?? "Bisnis UMKM",
      level: row.level ?? "Pemula",
      access:
        row.access === "FREE"
          ? "Gratis"
          : row.access === "PREMIUM"
            ? "Premium"
            : "Member",
      format: row.format ?? "Artikel",
      duration: `${row.durationMinutes} menit`,
      excerpt: row.excerpt ?? "Materi praktis untuk membantu bisnis bertumbuh.",
      body: row.body ?? row.excerpt ?? "Materi sedang disiapkan.",
      coverImageUrl: row.coverImageUrl ?? undefined,
      videoUrl: row.videoUrl ?? undefined,
      attachments: Array.isArray(row.attachments)
        ? row.attachments.filter((item): item is string => typeof item === "string")
        : [],
    })),
    products: productRows.map((row) => ({
      slug: row.slug,
      name: row.name,
      category: row.category ?? "Produk UMKM",
      partner: row.partner,
      price: row.price,
      memberPrice:
        memberPriceRows.find((price) => price.productId === row.id)?.price ?? row.price,
      rating: "",
      desc: row.description ?? "Produk terkurasi untuk member KUAT.",
      websiteUrl: row.websiteUrl ?? undefined,
      pricingModel: row.pricingModel ?? undefined,
      priceLabel: row.priceLabel ?? undefined,
      platforms: Array.isArray(row.platforms) ? row.platforms.filter((item): item is string => typeof item === "string") : [],
      bestFor: row.bestFor ?? undefined,
      features: Array.isArray(row.features) ? row.features.filter((item): item is string => typeof item === "string") : [],
      setupLevel: row.setupLevel ?? undefined,
      logoUrl: row.logoUrl ?? undefined,
    })),
    services: serviceRows.map((row) => ({
      slug: row.slug,
      name: row.name,
      price: rupiah(row.price),
      oldPrice: row.originalPrice
        ? rupiah(row.originalPrice)
        : "",
      billingPeriod: row.billingPeriod ?? undefined,
      time: row.durationLabel ?? "Sesuai kebutuhan",
      for: row.billingPeriod ?? "",
      desc: row.description ?? "Layanan profesional KUAT Digital.",
      deliverables: Array.isArray(row.deliverables)
        ? row.deliverables.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
    })),
    freelancers: freelancerRows.map((row) => ({
      slug: row.slug,
      name: row.name,
      skill:
        skillRows.find((skill) => skill.freelancerProfileId === row.id)?.name ??
        "Profesional UMKM",
      city: row.city ?? "Indonesia",
      mode:
        row.workMode === "ONSITE"
          ? "Onsite"
          : row.workMode === "HYBRID"
            ? "Hybrid"
            : "Remote",
      price: row.priceFrom
        ? `Mulai ${rupiah(row.priceFrom)}`
        : "Hubungi untuk harga",
      verified: Boolean(row.verified),
      available: row.availability !== "Tidak tersedia",
      initials: initials(row.name),
      bio: row.bio ?? "Siap membantu kebutuhan bisnis member KUAT.",
      whatsapp: row.whatsapp ?? undefined,
      skills: skillRows.filter((skill) => skill.freelancerProfileId === row.id).map((skill) => skill.name),
      portfolios: portfolioRows.filter((item) => item.freelancerProfileId === row.id).map((item) => ({ title: item.title, description: item.description ?? "", projectUrl: item.projectUrl ?? "" })),
      packages: freelancerPackageRows.filter((item) => item.freelancerProfileId === row.id).map((item) => ({
        id: String(item.id),
        name: item.name,
        description: item.description,
        price: item.priceType === "CONTACT" ? "Hubungi untuk harga" : rupiah(item.price),
        priceType: item.priceType,
        duration: item.durationLabel ?? "Sesuai kesepakatan",
        deliverables: Array.isArray(item.deliverables) ? item.deliverables.filter((value): value is string => typeof value === "string") : [],
      })),
    })),
  };
});
