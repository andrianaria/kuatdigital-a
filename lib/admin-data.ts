import { and, desc, eq, isNull, sql } from "drizzle-orm";

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
  freelancerProfiles,
  freelancerPortfolios,
  freelancerServicePackages,
  freelancerRequests,
  freelancerSkills,
  serviceInquiries,
  servicePackages,
  users,
  products,
  partners,
} from "@/db/schema";
import type {
  AdminDashboardData,
  AdminRecord,
  FreelancerDashboardData,
  MemberDashboardData,
} from "@/lib/admin-types";
import type { AuthenticatedIdentity } from "@/lib/identity";
import { syncDatabaseUser } from "@/lib/database-users";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const dateLabel = (value: Date | null) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
      }).format(value)
    : "Belum diperbarui";

const dateTimeLabel = (value: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

const consultationStatus = (status: string) =>
  ({ PENDING: "Menunggu", CONFIRMED: "Terkonfirmasi", COMPLETED: "Selesai", CANCELLED: "Dibatalkan" })[status] ?? status;

const consultationMode = (mode: string) =>
  ({ GOOGLE_MEET: "Google Meet", ZOOM: "Zoom", WHATSAPP_CALL: "WhatsApp Call" })[mode] ?? mode;

const contentStatus = (status: string) =>
  ({
    PUBLISHED: "Terbit",
    DRAFT: "Draft",
    PENDING: "Menunggu review",
    REJECTED: "Ditolak",
    ARCHIVED: "Diarsipkan",
  })[status] ?? status;

const inquiryStatus = (status: string | null) =>
  ({
    NEW: "Baru",
    CONTACTED: "Dihubungi",
    QUALIFIED: "Berjalan",
    CLOSED: "Selesai",
    ACCEPTED: "Diterima",
    IN_PROGRESS: "Dikerjakan",
    SUBMITTED: "Menunggu konfirmasi",
    COMPLETED: "Selesai",
    DECLINED: "Ditolak",
  })[status ?? "NEW"] ?? "Baru";

export async function getAdminDashboardData(
  identity: AuthenticatedIdentity,
): Promise<AdminDashboardData> {
  await syncDatabaseUser(identity);
  const db = database();

  const [
    articleRows,
    transactionRows,
    memberRows,
    freelancerRows,
    applicationRows,
    serviceRows,
    productRows,
    activityRows,
    consultationSlotRows,
    consultationBookingRows,
  ] = await Promise.all([
    db
      .select({
        id: educationContents.id,
        title: educationContents.title,
        category: educationCategories.name,
        status: educationContents.status,
        format: educationContents.format,
        updatedAt: educationContents.updatedAt,
      })
      .from(educationContents)
      .leftJoin(
        educationCategories,
        eq(educationContents.categoryId, educationCategories.id),
      )
      .where(isNull(educationContents.deletedAt))
      .orderBy(desc(educationContents.updatedAt)),
    db
      .select({
        id: serviceInquiries.id,
        name: serviceInquiries.name,
        email: serviceInquiries.email,
        packageName: servicePackages.name,
        price: servicePackages.price,
        status: serviceInquiries.status,
        createdAt: serviceInquiries.createdAt,
      })
      .from(serviceInquiries)
      .leftJoin(
        servicePackages,
        eq(serviceInquiries.servicePackageId, servicePackages.id),
      )
      .where(isNull(serviceInquiries.deletedAt))
      .orderBy(desc(serviceInquiries.createdAt)),
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        deletedAt: users.deletedAt,
        businessName: businessProfiles.businessName,
        city: businessProfiles.city,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(businessProfiles, eq(users.id, businessProfiles.userId))
      .orderBy(desc(users.updatedAt)),
    db
      .select({
        id: freelancerProfiles.id,
        name: users.name,
        city: freelancerProfiles.city,
        workMode: freelancerProfiles.workMode,
        verified: freelancerProfiles.verified,
        status: freelancerProfiles.status,
        updatedAt: freelancerProfiles.updatedAt,
      })
      .from(freelancerProfiles)
      .innerJoin(users, eq(freelancerProfiles.userId, users.id))
      .where(isNull(freelancerProfiles.deletedAt))
      .orderBy(desc(freelancerProfiles.updatedAt)),
    db
      .select({
        id: applicationSubmissions.id,
        payload: applicationSubmissions.payload,
        status: applicationSubmissions.status,
        createdAt: applicationSubmissions.createdAt,
      })
      .from(applicationSubmissions)
      .where(eq(applicationSubmissions.type, "FREELANCER"))
      .orderBy(desc(applicationSubmissions.createdAt)),
    db
      .select()
      .from(servicePackages)
      .where(isNull(servicePackages.deletedAt))
      .orderBy(desc(servicePackages.updatedAt)),
    db
      .select({
        id: products.id,
        name: products.name,
        partner: partners.name,
        price: products.regularPrice,
        status: products.status,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .innerJoin(partners, eq(products.partnerId, partners.id))
      .where(isNull(products.deletedAt))
      .orderBy(desc(products.updatedAt)),
    db
      .select({ action: adminActivityLogs.action })
      .from(adminActivityLogs)
      .orderBy(desc(adminActivityLogs.createdAt))
      .limit(5),
    db.select().from(consultationSlots).where(eq(consultationSlots.status, "AVAILABLE")).orderBy(consultationSlots.startsAt),
    db
      .select({
        id: consultationBookings.id,
        member: users.name,
        email: users.email,
        topic: consultationBookings.topic,
        notes: consultationBookings.notes,
        status: consultationBookings.status,
        meetingUrl: consultationBookings.meetingUrl,
        startsAt: consultationSlots.startsAt,
        consultant: consultationSlots.consultantName,
        mode: consultationSlots.meetingMode,
      })
      .from(consultationBookings)
      .innerJoin(users, eq(consultationBookings.userId, users.id))
      .innerJoin(consultationSlots, eq(consultationBookings.slotId, consultationSlots.id))
      .orderBy(desc(consultationSlots.startsAt)),
  ]);

  const articles: AdminRecord[] = articleRows.map((row) => ({
    id: String(row.id),
    title: row.title,
    subtitle: row.category ?? "Tanpa kategori",
    status: contentStatus(row.status),
    meta: `${row.format ?? "Artikel"} · ${dateLabel(row.updatedAt)}`,
  }));
  const transactions: AdminRecord[] = transactionRows.map((row) => ({
    id: String(row.id),
    title: row.name,
    subtitle: row.packageName ?? "Konsultasi umum",
    status: inquiryStatus(row.status),
    meta: `${row.price ? `Rp${new Intl.NumberFormat("id-ID").format(row.price)}` : row.email} · ${dateLabel(row.createdAt)}`,
  }));
  const members: AdminRecord[] = memberRows
    .filter((row) => row.role !== "ADMIN")
    .map((row) => ({
    id: String(row.id),
    title: row.name,
    subtitle: row.businessName
      ? `${row.businessName}${row.city ? ` · ${row.city}` : ""}`
      : row.email,
    status: row.deletedAt
      ? "Ditangguhkan"
      : row.role === "FREELANCER"
        ? "Freelancer"
        : "Aktif",
    meta: `Diperbarui ${dateLabel(row.updatedAt)}`,
  }));
  const freelancerApplications: AdminRecord[] = applicationRows
    .filter((row) => row.status === "PENDING")
    .map((row) => {
      const payload = row.payload as {
        name?: string;
        email?: string;
        message?: string;
        skills?: string;
        city?: string;
        portfolioUrl?: string;
      };
      return {
        id: `application-${row.id}`,
        title: payload.name ?? "Pelamar freelancer",
        subtitle: payload.email ?? "Data kontak belum lengkap",
        status: "Menunggu review",
        meta: `${payload.skills ?? "Keahlian belum diisi"} · ${payload.city ?? "Kota belum diisi"} · ${payload.message?.slice(0, 80) ?? "Aplikasi freelancer"}`,
        href: payload.portfolioUrl?.startsWith("https://") ? payload.portfolioUrl : undefined,
      };
    });
  const freelancers: AdminRecord[] = [
    ...freelancerApplications,
    ...freelancerRows.map((row) => ({
      id: String(row.id),
      title: row.name,
      subtitle:
        [row.city, row.workMode].filter(Boolean).join(" · ") ||
        "Profil freelancer",
      status:
        row.status === "PUBLISHED" && row.verified
          ? "Terverifikasi"
          : contentStatus(row.status),
      meta: `Diperbarui ${dateLabel(row.updatedAt)}`,
    })),
  ];
  const services: AdminRecord[] = serviceRows.map((row) => ({
    id: String(row.id),
    title: row.name,
    subtitle: row.durationLabel ?? row.billingPeriod ?? "Paket layanan",
    status: row.status === "PUBLISHED" ? "Aktif" : contentStatus(row.status),
    meta: `Rp${new Intl.NumberFormat("id-ID").format(row.price)} · ${dateLabel(row.updatedAt)}`,
  }));
  const productRecords: AdminRecord[] = productRows.map((row) => ({
    id: String(row.id),
    title: row.name,
    subtitle: row.partner,
    status: row.status === "PUBLISHED" ? "Aktif" : contentStatus(row.status),
    meta: `Rp${new Intl.NumberFormat("id-ID").format(row.price)} · ${dateLabel(row.updatedAt)}`,
  }));
  const consultationRecords: AdminRecord[] = consultationBookingRows.map((row) => ({
    id: row.id.toString(),
    title: row.member,
    subtitle: row.topic,
    status: consultationStatus(row.status),
    meta: `${dateTimeLabel(row.startsAt)} · ${row.consultant}`,
  }));

  return {
    adminName: identity.name,
    adminInitials: initials(identity.name),
    records: {
      articles,
      consultations: consultationRecords,
      transactions,
      members,
      freelancers,
      services,
      products: productRecords,
    },
    metrics: {
      activeTransactions: transactionRows.filter(
        (row) => row.status !== "CLOSED",
      ).length,
      members: members.filter((row) => row.status !== "Ditangguhkan").length,
      publishedArticles: articleRows.filter((row) => row.status === "PUBLISHED")
        .length,
      freelancerReviews:
        freelancerApplications.length +
        freelancerRows.filter((row) => row.status === "PENDING").length,
    },
    activities: activityRows.map((row) => row.action),
    consultationSlots: consultationSlotRows.map((row) => ({
      id: String(row.id),
      startsAt: dateTimeLabel(row.startsAt),
      duration: `${row.durationMinutes} menit`,
      consultant: row.consultantName,
      mode: consultationMode(row.meetingMode),
    })),
    consultationBookings: consultationBookingRows.map((row) => ({
      id: String(row.id),
      member: row.member,
      email: row.email,
      topic: row.topic,
      notes: row.notes,
      startsAt: dateTimeLabel(row.startsAt),
      consultant: row.consultant,
      mode: consultationMode(row.mode),
      status: consultationStatus(row.status),
      meetingUrl: row.meetingUrl ?? "",
    })),
  };
}

export async function getMemberDashboardData(
  identity: AuthenticatedIdentity,
): Promise<MemberDashboardData> {
  const synced = await syncDatabaseUser(identity);
  const db = database();
  const [articleRows, inquiryRows, requestRows, profile, availableSlotRows, bookingRows, application] = await Promise.all([
    db
      .select({
        id: educationContents.id,
        slug: educationContents.slug,
        title: educationContents.title,
        category: educationCategories.name,
        durationMinutes: educationContents.durationMinutes,
      })
      .from(educationContents)
      .innerJoin(bookmarks, eq(bookmarks.contentId, educationContents.id))
      .leftJoin(educationCategories, eq(educationContents.categoryId, educationCategories.id))
      .where(and(eq(educationContents.status, "PUBLISHED"), eq(bookmarks.userId, synced.id)))
      .orderBy(desc(bookmarks.createdAt)),
    db
      .select({
        id: serviceInquiries.id,
        service: servicePackages.name,
        status: serviceInquiries.status,
        createdAt: serviceInquiries.createdAt,
      })
      .from(serviceInquiries)
      .leftJoin(servicePackages, eq(serviceInquiries.servicePackageId, servicePackages.id))
      .where(eq(serviceInquiries.userId, synced.id))
      .orderBy(desc(serviceInquiries.createdAt)),
    db
      .select({
        id: freelancerRequests.id,
        freelancer: users.name,
        message: freelancerRequests.message,
        projectTitle: freelancerRequests.projectTitle,
        budget: freelancerRequests.budget,
        targetDate: freelancerRequests.targetDate,
        completionNote: freelancerRequests.completionNote,
        deliverableUrl: freelancerRequests.deliverableUrl,
        status: freelancerRequests.status,
        createdAt: freelancerRequests.createdAt,
      })
      .from(freelancerRequests)
      .innerJoin(freelancerProfiles, eq(freelancerRequests.freelancerProfileId, freelancerProfiles.id))
      .innerJoin(users, eq(freelancerProfiles.userId, users.id))
      .where(eq(freelancerRequests.requesterUserId, synced.id))
      .orderBy(desc(freelancerRequests.createdAt)),
    db.query.businessProfiles.findFirst({
      where: eq(businessProfiles.userId, synced.id),
    }),
    db
      .select()
      .from(consultationSlots)
      .where(and(eq(consultationSlots.status, "AVAILABLE"), sql`${consultationSlots.startsAt} > NOW()`))
      .orderBy(consultationSlots.startsAt)
      .limit(20),
    db
      .select({
        id: consultationBookings.id,
        topic: consultationBookings.topic,
        notes: consultationBookings.notes,
        status: consultationBookings.status,
        meetingUrl: consultationBookings.meetingUrl,
        startsAt: consultationSlots.startsAt,
        consultant: consultationSlots.consultantName,
        mode: consultationSlots.meetingMode,
      })
      .from(consultationBookings)
      .innerJoin(consultationSlots, eq(consultationBookings.slotId, consultationSlots.id))
      .where(eq(consultationBookings.userId, synced.id))
      .orderBy(desc(consultationSlots.startsAt)),
    db.query.applicationSubmissions.findFirst({ where: and(eq(applicationSubmissions.userId, synced.id), eq(applicationSubmissions.type, "FREELANCER")), orderBy: desc(applicationSubmissions.createdAt) }),
  ]);
  return {
    name: synced.name,
    email: synced.email,
    whatsapp: synced.whatsapp ?? "",
    initials: initials(synced.name),
    inquiries: inquiryRows.length,
    freelancerRequests: requestRows.length,
    freelancerApplication: application ? { status: contentStatus(application.status), reason: application.rejectionReason ?? "" } : null,
    bookmarks: articleRows.length,
    consultationSlots: availableSlotRows.map((row) => ({
      id: String(row.id),
      startsAt: dateTimeLabel(row.startsAt),
      duration: `${row.durationMinutes} menit`,
      consultant: row.consultantName,
      mode: consultationMode(row.meetingMode),
    })),
    consultationBookings: bookingRows.map((row) => ({
      id: String(row.id),
      member: synced.name,
      email: synced.email,
      topic: row.topic,
      notes: row.notes,
      startsAt: dateTimeLabel(row.startsAt),
      consultant: row.consultant,
      mode: consultationMode(row.mode),
      status: consultationStatus(row.status),
      meetingUrl: row.meetingUrl ?? "",
    })),
    profile: profile
      ? {
          businessName: profile.businessName,
          category: profile.category ?? "",
          city: profile.city ?? "",
          establishedYear: profile.establishedYear,
          outletCount: profile.outletCount,
          scale: profile.scale ?? "",
          mainChallenge: profile.mainChallenge ?? "",
        }
      : null,
    articles: articleRows.map((row) => ({
      id: String(row.id),
      slug: row.slug,
      title: row.title,
      category: row.category ?? "Bisnis UMKM",
      duration: `${row.durationMinutes} menit`,
      bookmarked: true,
    })),
    serviceHistory: inquiryRows.map((row) => ({
      id: String(row.id),
      service: row.service ?? "Konsultasi umum",
      createdAt: dateLabel(row.createdAt),
      status: inquiryStatus(row.status),
    })),
    freelancerHistory: requestRows.map((row) => ({
      id: String(row.id),
      freelancer: row.freelancer,
      title: row.projectTitle ?? "Permintaan bantuan",
      need: row.message,
      budget: row.budget === null ? "Belum ditentukan" : `Rp${new Intl.NumberFormat("id-ID").format(row.budget)}`,
      targetDate: row.targetDate ?? "Belum ditentukan",
      completionNote: row.completionNote ?? "",
      deliverableUrl: row.deliverableUrl ?? "",
      createdAt: dateLabel(row.createdAt),
      status: inquiryStatus(row.status),
    })),
  };
}

export async function getFreelancerDashboardData(
  identity: AuthenticatedIdentity,
): Promise<FreelancerDashboardData> {
  const synced = await syncDatabaseUser(identity);
  const db = database();
  const profile = await db.query.freelancerProfiles.findFirst({
    where: eq(freelancerProfiles.userId, synced.id),
  });
  const [leads, skills, portfolios, packages] = profile
    ? await Promise.all([
      db
        .select()
        .from(freelancerRequests)
        .where(eq(freelancerRequests.freelancerProfileId, profile.id))
        .orderBy(desc(freelancerRequests.createdAt))
        .limit(50),
      db.select().from(freelancerSkills).where(eq(freelancerSkills.freelancerProfileId, profile.id)),
      db.select().from(freelancerPortfolios).where(eq(freelancerPortfolios.freelancerProfileId, profile.id)).orderBy(desc(freelancerPortfolios.updatedAt)),
      db.select().from(freelancerServicePackages).where(and(eq(freelancerServicePackages.freelancerProfileId, profile.id), isNull(freelancerServicePackages.deletedAt))).orderBy(desc(freelancerServicePackages.updatedAt)),
    ])
    : [[], [], [], []];
  return {
    name: synced.name,
    email: synced.email,
    whatsapp: synced.whatsapp ?? "",
    initials: initials(synced.name),
    verified: Boolean(profile?.verified),
    acceptingProjects: Boolean(profile && profile.availability !== "Tidak tersedia"),
    profile: profile
      ? {
          bio: profile.bio ?? "",
          city: profile.city ?? "",
          workMode: profile.workMode ?? "REMOTE",
          priceFrom: profile.priceFrom
            ? `Rp${new Intl.NumberFormat("id-ID").format(profile.priceFrom)}`
            : "Belum ditetapkan",
          skills: skills.map((skill) => skill.name),
        }
      : null,
    portfolios: portfolios.map((portfolio) => ({
      id: String(portfolio.id),
      title: portfolio.title,
      description: portfolio.description ?? "",
      projectUrl: portfolio.projectUrl ?? "",
    })),
    packages: packages.map((item) => ({
      id: String(item.id),
      name: item.name,
      description: item.description,
      price: item.priceType === "CONTACT" ? "Hubungi untuk harga" : `Rp${new Intl.NumberFormat("id-ID").format(item.price)}`,
      priceType: item.priceType,
      duration: item.durationLabel ?? "Sesuai kesepakatan",
      deliverables: Array.isArray(item.deliverables) ? item.deliverables.filter((value): value is string => typeof value === "string") : [],
      status: item.status,
    })),
    leads: leads.map((lead) => ({
      id: String(lead.id),
      name: lead.name,
      isMemberRequest: Boolean(lead.requesterUserId),
      email: lead.email,
      whatsapp: lead.whatsapp,
      title: lead.projectTitle ?? "Permintaan bantuan",
      need: lead.message,
      budget: lead.budget === null ? "Belum ditentukan" : `Rp${new Intl.NumberFormat("id-ID").format(lead.budget)}`,
      targetDate: lead.targetDate ?? "Belum ditentukan",
      completionNote: lead.completionNote ?? "",
      deliverableUrl: lead.deliverableUrl ?? "",
      createdAt: dateLabel(lead.createdAt),
      status: inquiryStatus(lead.status),
    })),
  };
}
