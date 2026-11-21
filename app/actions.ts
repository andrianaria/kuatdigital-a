"use server";

import { and, eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { database } from "@/db";
import {
  adminActivityLogs,
  applicationSubmissions,
  bookmarks,
  businessProfiles,
  consultationBookings,
  consultationSlots,
  educationCategories,
  educationContents,
  digitalReadinessAssessments,
  freelancerProfiles,
  freelancerPortfolios,
  freelancerRequests,
  freelancerServicePackages,
  freelancerSkills,
  partners,
  productCategories,
  products,
  serviceInquiries,
  servicePackages,
  users,
} from "@/db/schema";
import { requireAdmin, requireFreelancer } from "@/lib/authz";
import { syncDatabaseUser } from "@/lib/database-users";
import { syncClerkRole } from "@/lib/clerk-role";
import { getAuthenticatedIdentity } from "@/lib/identity";
import type { AdminSection } from "@/lib/admin-types";
import { readinessQuestions, scoreDigitalReadiness } from "@/lib/digital-readiness";
import { canFreelancerTransition, type FreelancerDecision } from "@/lib/freelancer-workflow";

const adminFormSchema = z.object({
  title: z.string().trim().min(3).max(255),
  subtitle: z.string().trim().min(2).max(255),
  notes: z.string().trim().max(10_000).optional(),
  price: z.coerce.number().int().nonnegative().optional(),
  category: z.string().trim().max(120).optional(),
  websiteUrl: z.string().trim().url().max(500).or(z.literal("")).optional(),
  pricingModel: z.string().trim().max(80).optional(),
  priceLabel: z.string().trim().max(120).optional(),
  platforms: z.string().trim().max(500).optional(),
  bestFor: z.string().trim().max(3000).optional(),
  features: z.string().trim().max(5000).optional(),
  setupLevel: z.string().trim().max(80).optional(),
  logoUrl: z.string().trim().url().max(1000).or(z.literal("")).optional(),
});

const inquirySchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(255),
  whatsapp: z.string().trim().min(8).max(32),
  message: z.string().trim().min(10).max(5_000),
  service: z.string().trim().min(2).max(180),
  serviceSlug: z.string().trim().max(200).optional(),
  freelancerSlug: z.string().trim().max(200).optional(),
  applicationType: z.enum(["FREELANCER", "PARTNER"]).optional(),
  projectTitle: z.string().trim().max(180).optional(),
  budget: z.string().trim().optional(),
  targetDate: z.string().trim().optional(),
  skills: z.string().trim().max(500).optional(),
  city: z.string().trim().max(120).optional(),
  workMode: z.enum(["REMOTE", "ONSITE", "HYBRID"]).optional(),
  priceFrom: z.string().trim().optional(),
  portfolioUrl: z.string().trim().max(500).optional(),
});

const freelancerProfileSchema = z.object({
  bio: z.string().trim().min(30).max(5000),
  city: z.string().trim().min(2).max(120),
  workMode: z.enum(["REMOTE", "ONSITE", "HYBRID"]),
  priceFrom: z.coerce.number().int().min(0).max(1_000_000_000),
  skills: z.string().trim().min(2).max(500),
  portfolioTitle: z.string().trim().max(180).optional(),
  portfolioUrl: z.string().trim().url().max(500).or(z.literal("")).optional(),
});

const freelancerPackageSchema = z.object({
  name: z.string().trim().min(3).max(180),
  description: z.string().trim().min(20).max(3000),
  price: z.coerce.number().int().min(0).max(1_000_000_000),
  priceType: z.enum(["FIXED", "STARTING_FROM", "HOURLY", "MONTHLY", "CONTACT"]),
  durationLabel: z.string().trim().min(2).max(100),
  deliverables: z.string().trim().min(2).max(3000),
});

const businessProfileSchema = z.object({
  businessName: z.string().trim().min(2).max(180),
  category: z.string().trim().max(120).optional(),
  city: z.string().trim().max(120).optional(),
  establishedYear: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional(),
  ),
  outletCount: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.coerce.number().int().min(0).max(10_000).optional(),
  ),
  scale: z.string().trim().max(80).optional(),
  mainChallenge: z.string().trim().max(5_000).optional(),
});

const personalProfileSchema = z.object({
  name: z.string().trim().min(2).max(160),
  whatsapp: z.string().trim().max(32).optional(),
});

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().url().max(1000).optional(),
);

const isHttpUrl = (value: string) => {
  try { return ["https:", "http:"].includes(new URL(value).protocol); }
  catch { return false; }
};

const articleEditorSchema = z.object({
  id: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce.number().int().positive().optional(),
  ),
  title: z.string().trim().min(3).max(255),
  slug: z.string().trim().max(255).optional(),
  category: z.string().trim().min(2).max(120),
  excerpt: z.string().trim().min(10).max(2_000),
  body: z.string().trim().min(20).max(100_000),
  coverImageUrl: optionalUrl,
  videoUrl: optionalUrl,
  attachments: z.string().max(10_000).optional(),
  format: z.string().trim().min(2).max(50),
  level: z.string().trim().min(2).max(30),
  durationMinutes: z.coerce.number().int().min(1).max(600),
  access: z.enum(["FREE", "MEMBER", "PREMIUM"]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

const digitalReadinessSchema = z.object({
  businessName: z.string().trim().min(2).max(180),
  businessCategory: z.string().trim().min(2).max(120),
  answers: z.string().max(10_000),
});

const consultationSlotSchema = z.object({
  startsAt: z.string().min(16).max(30),
  durationMinutes: z.coerce.number().int().min(15).max(180),
  consultantName: z.string().trim().min(2).max(160),
  meetingMode: z.enum(["GOOGLE_MEET", "ZOOM", "WHATSAPP_CALL"]),
});

const consultationBookingSchema = z.object({
  slotId: z.coerce.number().int().positive(),
  topic: z.string().trim().min(3).max(180),
  notes: z.string().trim().min(10).max(5_000),
});

const consultationUpdateSchema = z.object({
  bookingId: z.coerce.number().int().positive(),
  status: z.enum(["CONFIRMED", "COMPLETED", "CANCELLED"]),
  meetingUrl: optionalUrl,
});

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 180);

const numberId = (id: string) => {
  const value = Number(id);
  if (!Number.isSafeInteger(value) || value <= 0)
    throw new Error("ID data tidak valid.");
  return value;
};

const applicationId = (id: string) => {
  if (!id.startsWith("application-")) return null;
  return numberId(id.slice("application-".length));
};

async function adminContext() {
  const identity = await requireAdmin();
  const user = await syncDatabaseUser(identity);
  return { identity, user };
}

async function logAdmin(
  adminUserId: number,
  action: string,
  entityType: string,
  entityId?: number,
) {
  await database()
    .insert(adminActivityLogs)
    .values({ adminUserId, action, entityType, entityId });
}

export async function createAdminRecordAction(
  section: AdminSection,
  formData: FormData,
) {
  const { user } = await adminContext();
  const values = adminFormSchema.parse(Object.fromEntries(formData));
  const db = database();
  const slug = `${slugify(values.title)}-${Date.now().toString(36)}`;
  let entityId: number;

  if (section === "articles") {
    const categorySlug = slugify(values.subtitle);
    await db
      .insert(educationCategories)
      .values({ name: values.subtitle, slug: categorySlug })
      .onDuplicateKeyUpdate({ set: { name: values.subtitle } });
    const category = await db.query.educationCategories.findFirst({
      where: eq(educationCategories.slug, categorySlug),
    });
    const result = await db.insert(educationContents).values({
      categoryId: category?.id,
      title: values.title,
      slug,
      excerpt: values.notes || "Materi baru KUAT Digital.",
      body: values.notes || "",
      format: "Artikel",
      level: "Pemula",
      access: "MEMBER",
      status: "DRAFT",
    });
    entityId = Number(result[0].insertId);
  } else if (section === "services") {
    const result = await db.insert(servicePackages).values({
      name: values.title,
      slug,
      description: values.notes || values.subtitle,
      price: values.price ?? 0,
      durationLabel: values.subtitle,
      deliverables: [],
      status: "DRAFT",
    });
    entityId = Number(result[0].insertId);
  } else if (section === "products") {
    const partnerSlug = slugify(values.subtitle);
    await db
      .insert(partners)
      .values({ name: values.subtitle, slug: partnerSlug, status: "PUBLISHED" })
      .onDuplicateKeyUpdate({ set: { name: values.subtitle } });
    const partner = await db.query.partners.findFirst({
      where: eq(partners.slug, partnerSlug),
    });
    const categoryName = values.category || "Aplikasi Bisnis";
    const categorySlug = slugify(categoryName);
    await db
      .insert(productCategories)
      .values({ name: categoryName, slug: categorySlug })
      .onDuplicateKeyUpdate({ set: { name: categoryName } });
    const category = await db.query.productCategories.findFirst({
      where: eq(productCategories.slug, categorySlug),
    });
    const result = await db.insert(products).values({
      partnerId: partner!.id,
      categoryId: category?.id,
      name: values.title,
      slug,
      description: values.notes || "",
      regularPrice: values.price ?? 0,
      offerUrl: values.websiteUrl || null,
      pricingModel: values.pricingModel || null,
      priceLabel: values.priceLabel || null,
      platforms: values.platforms?.split(",").map((value) => value.trim()).filter(Boolean) ?? [],
      bestFor: values.bestFor || null,
      features: values.features?.split("\n").map((value) => value.trim()).filter(Boolean) ?? [],
      setupLevel: values.setupLevel || null,
      logoUrl: values.logoUrl || null,
      status: "DRAFT",
    });
    entityId = Number(result[0].insertId);
  } else {
    throw new Error("Bagian ini tidak menerima data baru dari formulir.");
  }

  await logAdmin(
    user.id,
    `${values.title} ditambahkan sebagai draft`,
    section,
    entityId,
  );
  revalidatePath("/admin");
  return {
    ok: true,
    message: `${values.title} berhasil disimpan sebagai draft.`,
  };
}

export async function saveFreelancerPackageAction(formData: FormData) {
  const identity = await requireFreelancer();
  const user = await syncDatabaseUser(identity);
  const values = freelancerPackageSchema.parse(Object.fromEntries(formData));
  const profile = await database().query.freelancerProfiles.findFirst({ where: eq(freelancerProfiles.userId, user.id) });
  if (!profile || profile.status !== "PUBLISHED") throw new Error("Profil freelancer belum aktif.");
  const deliverables = [...new Set(values.deliverables.split("\n").map((value) => value.trim()).filter(Boolean))].slice(0, 15);
  if (!deliverables.length) throw new Error("Isi setidaknya satu hasil yang didapat klien.");
  await database().insert(freelancerServicePackages).values({
    freelancerProfileId: profile.id,
    name: values.name,
    description: values.description,
    price: values.priceType === "CONTACT" ? 0 : values.price,
    priceType: values.priceType,
    durationLabel: values.durationLabel,
    deliverables,
    status: "PUBLISHED",
  });
  revalidatePath("/freelancer-dashboard");
  revalidatePath("/freelancer");
  revalidatePath(`/freelancer/${profile.slug}`);
  return { ok: true, message: "Paket jasa sudah ditayangkan di profilmu." };
}

export async function archiveFreelancerPackageAction(packageId: string) {
  const identity = await requireFreelancer();
  const user = await syncDatabaseUser(identity);
  const profile = await database().query.freelancerProfiles.findFirst({ where: eq(freelancerProfiles.userId, user.id) });
  if (!profile) throw new Error("Profil freelancer belum tersedia.");
  const result = await database().update(freelancerServicePackages).set({ status: "ARCHIVED", deletedAt: new Date() }).where(and(eq(freelancerServicePackages.id, numberId(packageId)), eq(freelancerServicePackages.freelancerProfileId, profile.id)));
  if (!result[0].affectedRows) throw new Error("Paket jasa tidak ditemukan.");
  revalidatePath("/freelancer-dashboard");
  revalidatePath("/freelancer");
  revalidatePath(`/freelancer/${profile.slug}`);
  return { ok: true, message: "Paket jasa sudah diarsipkan." };
}

export async function saveArticleAction(formData: FormData) {
  const { user } = await adminContext();
  const values = articleEditorSchema.parse(Object.fromEntries(formData));
  const db = database();
  const requestedSlug = slugify(values.slug || values.title);
  if (!requestedSlug) throw new Error("Slug artikel tidak valid.");
  const existingSlug = await db.query.educationContents.findFirst({
    columns: { id: true },
    where: eq(educationContents.slug, requestedSlug),
  });
  if (existingSlug && existingSlug.id !== values.id)
    throw new Error("Slug sudah digunakan artikel lain.");

  const categorySlug = slugify(values.category);
  await db
    .insert(educationCategories)
    .values({ name: values.category, slug: categorySlug })
    .onDuplicateKeyUpdate({ set: { name: values.category } });
  const category = await db.query.educationCategories.findFirst({
    where: eq(educationCategories.slug, categorySlug),
  });
  if (!category) throw new Error("Kategori artikel belum berhasil disimpan.");

  const attachmentUrls = (values.attachments ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  for (const attachment of attachmentUrls) {
    const parsed = z.string().url().max(1000).safeParse(attachment);
    if (!parsed.success) throw new Error(`URL lampiran tidak valid: ${attachment}`);
  }

  const articleValues = {
    categoryId: category.id,
    title: values.title,
    slug: requestedSlug,
    excerpt: values.excerpt,
    body: values.body,
    coverImageUrl: values.coverImageUrl ?? null,
    videoUrl: values.videoUrl ?? null,
    attachments: attachmentUrls,
    format: values.format,
    level: values.level,
    durationMinutes: values.durationMinutes,
    access: values.access,
    status: values.status,
    publishedAt: values.status === "PUBLISHED" ? new Date() : null,
    deletedAt: null,
  } as const;

  let articleId = values.id;
  if (articleId) {
    const article = await db.query.educationContents.findFirst({
      columns: { id: true },
      where: eq(educationContents.id, articleId),
    });
    if (!article) throw new Error("Artikel tidak ditemukan.");
    await db.update(educationContents).set(articleValues).where(eq(educationContents.id, articleId));
  } else {
    const inserted = await db.insert(educationContents).values(articleValues);
    articleId = Number(inserted[0].insertId);
  }

  await logAdmin(
    user.id,
    `${values.title} ${values.id ? "diperbarui" : "ditambahkan"} sebagai ${values.status === "PUBLISHED" ? "artikel terbit" : "draft"}`,
    "articles",
    articleId,
  );
  revalidatePath("/admin");
  revalidatePath("/edukasi");
  revalidatePath(`/edukasi/${requestedSlug}`);
  return {
    ok: true,
    id: String(articleId),
    slug: requestedSlug,
    message: values.status === "PUBLISHED" ? "Artikel berhasil diterbitkan." : "Draft artikel berhasil disimpan.",
  };
}

export async function submitDigitalReadinessAction(formData: FormData) {
  const identity = await getAuthenticatedIdentity();
  if (!identity) throw new Error("Daftar atau masuk untuk mengambil tes kesiapan digital.");
  const user = await syncDatabaseUser(identity);
  if (user.suspended) throw new Error("Akun sedang ditangguhkan.");
  const values = digitalReadinessSchema.parse(Object.fromEntries(formData));
  let rawAnswers: unknown;
  try {
    rawAnswers = JSON.parse(values.answers);
  } catch {
    throw new Error("Jawaban asesmen tidak valid.");
  }
  const answers = z.record(z.string(), z.number().int().min(0).max(4)).parse(rawAnswers);
  if (readinessQuestions.some((question) => answers[question.id] === undefined))
    throw new Error("Jawab semua pertanyaan sebelum melihat hasil.");
  const result = scoreDigitalReadiness(answers);
  await database().insert(digitalReadinessAssessments).values({
    userId: user.id,
    businessName: values.businessName,
    businessCategory: values.businessCategory,
    answers,
    dimensionScores: result.dimensionScores,
    totalScore: result.totalScore,
    level: result.level,
    recommendations: result.recommendations,
  });
  revalidatePath("/dashboard");
  return result;
}

export async function createConsultationSlotAction(formData: FormData) {
  const { user } = await adminContext();
  const values = consultationSlotSchema.parse(Object.fromEntries(formData));
  const startsAt = new Date(`${values.startsAt}:00+07:00`);
  if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() < Date.now() + 30 * 60 * 1000)
    throw new Error("Slot harus dijadwalkan minimal 30 menit dari sekarang.");
  try {
    const inserted = await database().insert(consultationSlots).values({
      startsAt,
      durationMinutes: values.durationMinutes,
      consultantName: values.consultantName,
      meetingMode: values.meetingMode,
      createdBy: user.id,
    });
    await logAdmin(user.id, `Slot konsultasi ${values.consultantName} ditambahkan`, "consultations", Number(inserted[0].insertId));
  } catch (reason) {
    if (reason instanceof Error && reason.message.includes("Duplicate"))
      throw new Error("Sudah ada slot konsultasi pada tanggal dan jam tersebut.");
    throw reason;
  }
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { ok: true, message: "Slot konsultasi berhasil ditambahkan." };
}

export async function bookConsultationAction(formData: FormData) {
  const identity = await getAuthenticatedIdentity();
  if (!identity) throw new Error("Masuk untuk menjadwalkan konsultasi.");
  const user = await syncDatabaseUser(identity);
  if (user.suspended) throw new Error("Akun sedang ditangguhkan.");
  const values = consultationBookingSchema.parse(Object.fromEntries(formData));
  const db = database();
  await db.transaction(async (tx) => {
    const slot = await tx.query.consultationSlots.findFirst({ where: eq(consultationSlots.id, values.slotId) });
    if (!slot || slot.status !== "AVAILABLE" || slot.startsAt.getTime() <= Date.now())
      throw new Error("Slot sudah tidak tersedia. Silakan pilih waktu lain.");
    const changed = await tx
      .update(consultationSlots)
      .set({ status: "BOOKED" })
      .where(and(eq(consultationSlots.id, values.slotId), eq(consultationSlots.status, "AVAILABLE")));
    if (!changed[0].affectedRows) throw new Error("Slot baru saja diambil member lain. Silakan pilih waktu lain.");
    await tx.insert(consultationBookings).values({ slotId: values.slotId, userId: user.id, topic: values.topic, notes: values.notes });
  });
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { ok: true, message: "Konsultasi berhasil diajukan. Tim KUAT akan mengonfirmasi sesi ini." };
}

export async function updateConsultationBookingAction(formData: FormData) {
  const { user } = await adminContext();
  const values = consultationUpdateSchema.parse(Object.fromEntries(formData));
  const booking = await database().query.consultationBookings.findFirst({ where: eq(consultationBookings.id, values.bookingId) });
  if (!booking) throw new Error("Booking konsultasi tidak ditemukan.");
  await database().update(consultationBookings).set({ status: values.status, meetingUrl: values.meetingUrl ?? booking.meetingUrl }).where(eq(consultationBookings.id, booking.id));
  if (values.status === "CANCELLED")
    await database().update(consultationSlots).set({ status: "BLOCKED" }).where(eq(consultationSlots.id, booking.slotId));
  await logAdmin(user.id, `Booking konsultasi diubah menjadi ${values.status}`, "consultations", booking.id);
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { ok: true, message: "Status konsultasi berhasil diperbarui." };
}

export async function advanceAdminRecordAction(
  section: AdminSection,
  id: string,
) {
  const { identity, user } = await adminContext();
  const db = database();
  const pendingApplicationId =
    section === "freelancers" ? applicationId(id) : null;
  if (pendingApplicationId) {
    const application = await db.query.applicationSubmissions.findFirst({
      where: and(
        eq(applicationSubmissions.id, pendingApplicationId),
        eq(applicationSubmissions.type, "FREELANCER"),
      ),
    });
    if (!application || application.status !== "PENDING")
      throw new Error(
        "Aplikasi freelancer tidak ditemukan atau sudah direview.",
      );
    const payload = application.payload as {
      name?: string;
      email?: string;
      whatsapp?: string;
      message?: string;
      skills?: string;
      city?: string;
      workMode?: "REMOTE" | "ONSITE" | "HYBRID";
      priceFrom?: number;
      portfolioUrl?: string;
    };
    if (!payload.name || !payload.email)
      throw new Error("Nama dan email pelamar belum lengkap.");
    const applicant = application.userId
      ? await db.query.users.findFirst({
          where: eq(users.id, application.userId),
        })
      : await db.query.users.findFirst({
          where: eq(users.email, payload.email.toLowerCase()),
        });
    let applicantId = applicant?.id;
    if (applicant) {
      await db
        .update(users)
        .set({
          name: payload.name,
          whatsapp: payload.whatsapp,
        })
        .where(eq(users.id, applicant.id));
    } else {
      const inserted = await db.insert(users).values({
        name: payload.name,
        email: payload.email.toLowerCase(),
        whatsapp: payload.whatsapp,
        role: "MEMBER",
      });
      applicantId = Number(inserted[0].insertId);
    }
    const clerkSync = await syncClerkRole({
      databaseUserId: applicantId!,
      email: payload.email,
      role: "freelancer",
    });
    await db
      .update(users)
      .set({ role: "FREELANCER" })
      .where(eq(users.id, applicantId!));
    const existingProfile = await db.query.freelancerProfiles.findFirst({
      where: eq(freelancerProfiles.userId, applicantId!),
    });
    let profileId = existingProfile?.id;
    if (existingProfile) {
      await db
        .update(freelancerProfiles)
        .set({
          bio: payload.message,
          city: payload.city,
          workMode: payload.workMode ?? "REMOTE",
          priceFrom: payload.priceFrom,
          availability: "Menerima proyek",
          verified: true,
          status: "PUBLISHED",
          approvedBy: user.id,
          approvedAt: new Date(),
        })
        .where(eq(freelancerProfiles.id, existingProfile.id));
    } else {
      const insertedProfile = await db.insert(freelancerProfiles).values({
        userId: applicantId!,
        slug: `${slugify(payload.name)}-${Date.now().toString(36)}`,
        bio: payload.message,
        city: payload.city,
        workMode: payload.workMode ?? "REMOTE",
        priceFrom: payload.priceFrom,
        availability: "Menerima proyek",
        verified: true,
        status: "PUBLISHED",
        approvedBy: user.id,
        approvedAt: new Date(),
      });
      profileId = Number(insertedProfile[0].insertId);
    }
    if (profileId && payload.skills) {
      await db.delete(freelancerSkills).where(eq(freelancerSkills.freelancerProfileId, profileId));
      await db.insert(freelancerSkills).values(payload.skills.split(",").map((name) => name.trim()).filter(Boolean).slice(0, 10).map((name) => ({ freelancerProfileId: profileId!, name })));
    }
    if (profileId && payload.portfolioUrl) {
      await db.insert(freelancerPortfolios).values({ freelancerProfileId: profileId, title: "Portofolio saat mendaftar", projectUrl: payload.portfolioUrl });
    }
    await db
      .update(applicationSubmissions)
      .set({ status: "PUBLISHED", reviewedBy: user.id, reviewedAt: new Date() })
      .where(eq(applicationSubmissions.id, pendingApplicationId));
    const message =
      clerkSync === "updated"
        ? "Aplikasi disetujui; role database dan Clerk sudah menjadi Freelancer."
        : "Aplikasi disetujui; role database aktif dan Clerk akan tersinkron saat akun tersedia.";
    await logAdmin(user.id, message, section, pendingApplicationId);
    revalidatePath("/admin");
    revalidatePath("/freelancer-dashboard");
    return { ok: true, message };
  }
  const entityId = numberId(id);
  let message = "Status berhasil diperbarui.";

  if (section === "articles") {
    const row = await db.query.educationContents.findFirst({
      where: eq(educationContents.id, entityId),
    });
    const status = row?.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await db
      .update(educationContents)
      .set({ status, publishedAt: status === "PUBLISHED" ? new Date() : null })
      .where(eq(educationContents.id, entityId));
    message = `Artikel diperbarui menjadi ${status === "PUBLISHED" ? "Terbit" : "Draft"}.`;
  } else if (section === "services") {
    const row = await db.query.servicePackages.findFirst({
      where: eq(servicePackages.id, entityId),
    });
    const status = row?.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await db
      .update(servicePackages)
      .set({ status })
      .where(eq(servicePackages.id, entityId));
    message = `Layanan diperbarui menjadi ${status === "PUBLISHED" ? "Aktif" : "Draft"}.`;
  } else if (section === "products") {
    const row = await db.query.products.findFirst({
      where: eq(products.id, entityId),
    });
    const status = row?.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await db.update(products).set({ status }).where(eq(products.id, entityId));
    message = `Rekomendasi app diperbarui menjadi ${status === "PUBLISHED" ? "Aktif" : "Draft"}.`;
  } else if (section === "transactions") {
    const row = await db.query.serviceInquiries.findFirst({
      where: eq(serviceInquiries.id, entityId),
    });
    const status =
      row?.status === "NEW"
        ? "CONTACTED"
        : row?.status === "CONTACTED"
          ? "QUALIFIED"
          : "CLOSED";
    await db
      .update(serviceInquiries)
      .set({ status })
      .where(eq(serviceInquiries.id, entityId));
    message = `Transaksi diperbarui menjadi ${status === "CONTACTED" ? "Dihubungi" : status === "QUALIFIED" ? "Berjalan" : "Selesai"}.`;
  } else if (section === "members") {
    const member = await db.query.users.findFirst({
      where: eq(users.id, entityId),
    });
    if (!member || member.email === identity.email || member.role === "ADMIN")
      throw new Error("Akun admin tidak dapat ditangguhkan.");
    await db
      .update(users)
      .set({ deletedAt: member.deletedAt ? null : new Date() })
      .where(eq(users.id, entityId));
    message = member.deletedAt
      ? "Member diaktifkan kembali."
      : "Member ditangguhkan.";
  } else if (section === "freelancers") {
    const profile = await db.query.freelancerProfiles.findFirst({
      where: eq(freelancerProfiles.id, entityId),
    });
    if (!profile) throw new Error("Profil freelancer tidak ditemukan.");
    const owner = await db.query.users.findFirst({
      where: eq(users.id, profile.userId),
    });
    if (!owner) throw new Error("Pemilik profil freelancer tidak ditemukan.");
    const publish = profile?.status !== "PUBLISHED";
    const clerkSync = await syncClerkRole({
      databaseUserId: owner.id,
      email: owner.email,
      role: publish ? "freelancer" : "member",
    });
    await db
      .update(users)
      .set({ role: publish ? "FREELANCER" : "MEMBER" })
      .where(eq(users.id, owner.id));
    await db
      .update(freelancerProfiles)
      .set({
        status: publish ? "PUBLISHED" : "ARCHIVED",
        verified: publish,
        approvedBy: publish ? user.id : null,
        approvedAt: publish ? new Date() : null,
      })
      .where(eq(freelancerProfiles.id, entityId));
    const clerkNote =
      clerkSync === "updated"
        ? "Role Clerk juga sudah diperbarui."
        : "Role Clerk akan disinkronkan saat akun tersedia.";
    message = publish
      ? `Freelancer berhasil diverifikasi. ${clerkNote}`
      : `Freelancer dinonaktifkan. ${clerkNote}`;
  }

  await logAdmin(user.id, message, section, entityId);
  revalidatePath("/admin");
  return { ok: true, message };
}

export async function archiveAdminRecordAction(
  section: AdminSection,
  id: string,
) {
  const { user } = await adminContext();
  const db = database();
  const entityId = numberId(id);
  if (section === "articles")
    await db
      .update(educationContents)
      .set({ status: "ARCHIVED", deletedAt: new Date() })
      .where(eq(educationContents.id, entityId));
  else if (section === "services")
    await db
      .update(servicePackages)
      .set({ status: "ARCHIVED", deletedAt: new Date() })
      .where(eq(servicePackages.id, entityId));
  else if (section === "products")
    await db
      .update(products)
      .set({ status: "ARCHIVED", deletedAt: new Date() })
      .where(eq(products.id, entityId));
  else throw new Error("Data ini tidak dapat diarsipkan dari tabel tersebut.");
  await logAdmin(user.id, "Data diarsipkan", section, entityId);
  revalidatePath("/admin");
  return { ok: true, message: "Data berhasil diarsipkan." };
}

export async function submitInquiryAction(formData: FormData) {
  const values = inquirySchema.parse(Object.fromEntries(formData));
  const db = database();
  const identity = await getAuthenticatedIdentity();
  const synced = identity ? await syncDatabaseUser(identity) : null;
  if (synced?.suspended)
    throw new Error(
      "Akun sedang ditangguhkan. Hubungi Admin KUAT untuk bantuan.",
    );

  if (values.applicationType) {
    if (values.applicationType === "FREELANCER") {
      if (!identity || !synced)
        throw new Error(
          "Masuk sebagai member sebelum mengirim aplikasi freelancer.",
        );
      if (values.email.toLowerCase() !== identity.email)
        throw new Error(
          "Gunakan email yang sama dengan akun member yang sedang masuk.",
        );
      const currentMember = await db.query.users.findFirst({
        columns: { role: true },
        where: eq(users.id, synced.id),
      });
      if (currentMember?.role === "FREELANCER")
        throw new Error("Akun kamu sudah memiliki role Freelancer.");
      if (currentMember?.role !== "MEMBER")
        throw new Error("Pendaftaran freelancer hanya tersedia untuk akun Member.");
      const existingApplication =
        await db.query.applicationSubmissions.findFirst({
          columns: { id: true },
          where: and(
            eq(applicationSubmissions.userId, synced.id),
            eq(applicationSubmissions.type, "FREELANCER"),
            eq(applicationSubmissions.status, "PENDING"),
          ),
        });
      if (existingApplication)
        throw new Error(
          "Aplikasi freelancer kamu sedang menunggu review Admin.",
        );
      if (!values.skills || !values.city || !values.workMode)
        throw new Error("Lengkapi keahlian, kota, dan mode kerja sebelum mendaftar.");
      if (values.portfolioUrl && !isHttpUrl(values.portfolioUrl))
        throw new Error("Link portofolio tidak valid.");
    }
    const priceFrom = values.priceFrom ? Number(values.priceFrom) : undefined;
    if (values.applicationType === "FREELANCER" && (priceFrom === undefined || !Number.isSafeInteger(priceFrom) || priceFrom < 0 || priceFrom > 1_000_000_000))
      throw new Error("Isi harga mulai dalam angka rupiah yang valid.");
    await db.insert(applicationSubmissions).values({
      userId: synced?.id,
      type: values.applicationType,
      payload: {
        name: values.name,
        email: values.email,
        whatsapp: values.whatsapp,
        message: values.message,
        skills: values.skills,
        city: values.city,
        workMode: values.workMode,
        priceFrom,
        portfolioUrl: values.portfolioUrl,
      },
      status: "PENDING",
    });
  } else if (values.freelancerSlug) {
    if (!identity || !synced) throw new Error("Masuk sebagai member untuk mengirim permintaan proyek.");
    if (values.email.toLowerCase() !== identity.email) throw new Error("Gunakan email akun yang sedang masuk untuk permintaan proyek.");
    const projectTitle = values.projectTitle?.trim();
    const budget = Number(values.budget);
    if (!projectTitle || projectTitle.length < 5) throw new Error("Judul proyek minimal 5 karakter.");
    if (!Number.isSafeInteger(budget) || budget < 0 || budget > 1_000_000_000) throw new Error("Anggaran harus berupa angka rupiah yang valid.");
    if (!values.targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(values.targetDate) || Number.isNaN(Date.parse(values.targetDate)) || values.targetDate < new Date().toISOString().slice(0, 10)) throw new Error("Pilih target tanggal yang valid.");
    const profile = await db.query.freelancerProfiles.findFirst({
      where: and(
        eq(freelancerProfiles.slug, values.freelancerSlug),
        eq(freelancerProfiles.status, "PUBLISHED"),
      ),
    });
    if (!profile || profile.availability === "Tidak tersedia")
      throw new Error(
        "Freelancer belum tersedia untuk menerima permintaan.",
      );
    if (profile.userId === synced.id) throw new Error("Tidak dapat mengirim permintaan ke profil sendiri.");
    await db.insert(freelancerRequests).values({
      requesterUserId: synced.id,
      freelancerProfileId: profile.id,
      name: values.name,
      email: identity.email,
      whatsapp: values.whatsapp,
      message: values.message,
      projectTitle,
      budget,
      targetDate: values.targetDate,
    });
  } else {
    const service = values.serviceSlug
      ? await db.query.servicePackages.findFirst({
          where: eq(servicePackages.slug, values.serviceSlug),
        })
      : null;
    await db.insert(serviceInquiries).values({
      userId: synced?.id,
      servicePackageId: service?.id,
      name: values.name,
      email: values.email,
      whatsapp: values.whatsapp,
      message: values.message,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/freelancer-dashboard");
  return {
    ok: true,
    message:
      "Permintaan berhasil tersimpan. Tim KUAT akan segera menghubungi kamu.",
  };
}

export async function saveBusinessProfileAction(formData: FormData) {
  const identity = await getAuthenticatedIdentity();
  if (!identity) throw new Error("Masuk untuk menyimpan profil usaha.");
  const user = await syncDatabaseUser(identity);
  if (user.suspended) throw new Error("Akun sedang ditangguhkan.");
  const values = businessProfileSchema.parse(Object.fromEntries(formData));
  await database()
    .insert(businessProfiles)
    .values({ userId: user.id, ...values })
    .onDuplicateKeyUpdate({ set: values });
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { ok: true, message: "Profil usaha berhasil diperbarui." };
}

export async function savePersonalProfileAction(formData: FormData) {
  const identity = await getAuthenticatedIdentity();
  if (!identity) throw new Error("Masuk untuk memperbarui profil pribadi.");
  const user = await syncDatabaseUser(identity);
  if (user.suspended) throw new Error("Akun sedang ditangguhkan.");
  const values = personalProfileSchema.parse(Object.fromEntries(formData));

  if (identity.provider === "clerk" && process.env.CLERK_SECRET_KEY) {
    const [firstName, ...lastNameParts] = values.name.split(/\s+/);
    const client = await clerkClient();
    await client.users.updateUser(identity.providerAccountId, {
      firstName,
      lastName: lastNameParts.join(" ") || undefined,
    });
  }

  await database()
    .update(users)
    .set({ name: values.name, whatsapp: values.whatsapp || null })
    .where(eq(users.id, user.id));
  revalidatePath("/dashboard");
  revalidatePath("/freelancer-dashboard");
  return { ok: true, message: "Profil pribadi berhasil diperbarui." };
}

export async function toggleBookmarkAction(contentId: string) {
  const identity = await getAuthenticatedIdentity();
  if (!identity) throw new Error("Masuk untuk menyimpan artikel.");
  const user = await syncDatabaseUser(identity);
  if (user.suspended) throw new Error("Akun sedang ditangguhkan.");
  const id = numberId(contentId);
  const db = database();
  const content = await db.query.educationContents.findFirst({
    where: and(eq(educationContents.id, id), eq(educationContents.status, "PUBLISHED")),
  });
  if (!content) throw new Error("Artikel tidak ditemukan.");
  const existing = await db.query.bookmarks.findFirst({
    where: and(eq(bookmarks.userId, user.id), eq(bookmarks.contentId, id)),
  });
  if (existing) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
  } else {
    await db.insert(bookmarks).values({ userId: user.id, contentId: id });
  }
  revalidatePath("/dashboard");
  return {
    ok: true,
    message: existing ? "Artikel dihapus dari tersimpan." : "Artikel berhasil disimpan.",
  };
}

export async function toggleFreelancerAvailabilityAction() {
  const identity = await requireFreelancer();
  const user = await syncDatabaseUser(identity);
  const db = database();
  const profile = await db.query.freelancerProfiles.findFirst({
    where: eq(freelancerProfiles.userId, user.id),
  });
  if (!profile) throw new Error("Profil freelancer belum tersedia.");
  const accepting = profile.availability !== "Tidak tersedia";
  await db
    .update(freelancerProfiles)
    .set({ availability: accepting ? "Tidak tersedia" : "Menerima proyek" })
    .where(eq(freelancerProfiles.id, profile.id));
  revalidatePath("/freelancer-dashboard");
  revalidatePath("/dashboard");
  return {
    ok: true,
    message: accepting ? "Status diubah menjadi tidak tersedia." : "Status menerima proyek sudah aktif.",
  };
}

export async function updateFreelancerRequestAction(requestId: string, decision: FreelancerDecision, formData?: FormData) {
  const identity = await requireFreelancer();
  const user = await syncDatabaseUser(identity);
  const db = database();
  const profile = await db.query.freelancerProfiles.findFirst({ where: eq(freelancerProfiles.userId, user.id) });
  if (!profile || profile.status !== "PUBLISHED") throw new Error("Profil freelancer belum aktif.");
  const request = await db.query.freelancerRequests.findFirst({ where: and(eq(freelancerRequests.id, numberId(requestId)), eq(freelancerRequests.freelancerProfileId, profile.id)) });
  if (!request) throw new Error("Permintaan tidak ditemukan.");
  if (!request.requesterUserId) throw new Error("Lead lama tanpa akun member perlu ditindaklanjuti lewat kontak langsung.");
  if (!canFreelancerTransition(request.status, decision)) throw new Error("Status permintaan sudah berubah. Muat ulang halaman.");
  const note = decision === "SUBMITTED" ? z.string().trim().min(10).max(3000).parse(formData?.get("completionNote")) : undefined;
  const urlValue = decision === "SUBMITTED" ? String(formData?.get("deliverableUrl") ?? "").trim() : "";
  if (urlValue && !isHttpUrl(urlValue)) throw new Error("Link hasil kerja tidak valid.");
  const result = await db.update(freelancerRequests).set({ status: decision, ...(decision === "SUBMITTED" ? { completionNote: note, deliverableUrl: urlValue || null } : {}) }).where(and(eq(freelancerRequests.id, request.id), eq(freelancerRequests.status, request.status ?? "NEW")));
  if (!result[0].affectedRows) throw new Error("Status permintaan sudah berubah. Muat ulang halaman.");
  revalidatePath("/freelancer-dashboard");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { ok: true, message: decision === "DECLINED" ? "Permintaan ditolak." : decision === "SUBMITTED" ? "Hasil kerja sudah dikirim ke member." : decision === "ACCEPTED" ? "Pekerjaan diterima." : "Proyek ditandai sedang dikerjakan." };
}

export async function completeFreelancerProjectAction(requestId: string) {
  const identity = await getAuthenticatedIdentity();
  if (!identity || identity.suspended) throw new Error("Masuk untuk mengonfirmasi hasil proyek.");
  const user = await syncDatabaseUser(identity);
  const result = await database().update(freelancerRequests).set({ status: "COMPLETED" }).where(and(eq(freelancerRequests.id, numberId(requestId)), eq(freelancerRequests.requesterUserId, user.id), eq(freelancerRequests.status, "SUBMITTED")));
  if (!result[0].affectedRows) throw new Error("Proyek tidak ditemukan atau belum siap dikonfirmasi.");
  revalidatePath("/dashboard");
  revalidatePath("/freelancer-dashboard");
  revalidatePath("/admin");
  return { ok: true, message: "Proyek telah dikonfirmasi selesai." };
}

export async function saveFreelancerProfileAction(formData: FormData) {
  const identity = await requireFreelancer();
  const user = await syncDatabaseUser(identity);
  const values = freelancerProfileSchema.parse(Object.fromEntries(formData));
  if (Boolean(values.portfolioTitle) !== Boolean(values.portfolioUrl)) throw new Error("Isi judul dan link portofolio bersama-sama.");
  if (values.portfolioUrl && !isHttpUrl(values.portfolioUrl)) throw new Error("Link portofolio tidak valid.");
  const skills = [...new Set(values.skills.split(",").map((value) => value.trim()).filter(Boolean))].slice(0, 10);
  if (!skills.length) throw new Error("Isi setidaknya satu keahlian.");
  const db = database();
  const profile = await db.query.freelancerProfiles.findFirst({ where: eq(freelancerProfiles.userId, user.id) });
  if (!profile || profile.status !== "PUBLISHED") throw new Error("Profil freelancer belum aktif.");
  await db.transaction(async (tx) => {
    await tx.update(freelancerProfiles).set({ bio: values.bio, city: values.city, workMode: values.workMode, priceFrom: values.priceFrom }).where(eq(freelancerProfiles.id, profile.id));
    await tx.delete(freelancerSkills).where(eq(freelancerSkills.freelancerProfileId, profile.id));
    await tx.insert(freelancerSkills).values(skills.map((name) => ({ freelancerProfileId: profile.id, name })));
    if (values.portfolioTitle && values.portfolioUrl) await tx.insert(freelancerPortfolios).values({ freelancerProfileId: profile.id, title: values.portfolioTitle, projectUrl: values.portfolioUrl });
  });
  revalidatePath("/freelancer-dashboard");
  revalidatePath("/freelancer");
  revalidatePath(`/freelancer/${profile.slug}`);
  return { ok: true, message: "Profil freelancer berhasil diperbarui." };
}

export async function rejectFreelancerApplicationAction(applicationRecordId: string, reason: string) {
  const { user } = await adminContext();
  const id = applicationId(applicationRecordId);
  if (!id) throw new Error("ID aplikasi tidak valid.");
  const explanation = z.string().trim().min(10).max(1000).parse(reason);
  const result = await database().update(applicationSubmissions).set({ status: "REJECTED", rejectionReason: explanation, reviewedBy: user.id, reviewedAt: new Date() }).where(and(eq(applicationSubmissions.id, id), eq(applicationSubmissions.type, "FREELANCER"), eq(applicationSubmissions.status, "PENDING")));
  if (!result[0].affectedRows) throw new Error("Aplikasi sudah direview atau tidak ditemukan.");
  await logAdmin(user.id, "Aplikasi freelancer ditolak", "freelancers", id);
  revalidatePath("/admin");
  return { ok: true, message: "Aplikasi ditolak dengan alasan yang tercatat." };
}
