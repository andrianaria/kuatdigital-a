export type AdminSection =
  | "overview"
  | "articles"
  | "consultations"
  | "transactions"
  | "members"
  | "freelancers"
  | "services"
  | "products";

export type AdminRecord = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  meta: string;
  href?: string;
};

export type AdminRecords = Record<Exclude<AdminSection, "overview">, AdminRecord[]>;

export type ConsultationSlot = {
  id: string;
  startsAt: string;
  duration: string;
  consultant: string;
  mode: string;
};

export type ConsultationBooking = {
  id: string;
  member: string;
  email: string;
  topic: string;
  notes: string;
  startsAt: string;
  consultant: string;
  mode: string;
  status: string;
  meetingUrl: string;
};

export type AdminDashboardData = {
  adminName: string;
  adminInitials: string;
  records: AdminRecords;
  metrics: {
    activeTransactions: number;
    members: number;
    publishedArticles: number;
    freelancerReviews: number;
  };
  activities: string[];
  consultationSlots: ConsultationSlot[];
  consultationBookings: ConsultationBooking[];
};

export type MemberDashboardData = {
  name: string;
  email: string;
  whatsapp: string;
  initials: string;
  inquiries: number;
  freelancerRequests: number;
  freelancerApplication: { status: string; reason: string } | null;
  bookmarks: number;
  consultationSlots: ConsultationSlot[];
  consultationBookings: ConsultationBooking[];
  profile: {
    businessName: string;
    category: string;
    city: string;
    establishedYear: number | null;
    outletCount: number | null;
    scale: string;
    mainChallenge: string;
  } | null;
  articles: Array<{
    id: string;
    slug: string;
    title: string;
    category: string;
    duration: string;
    bookmarked: boolean;
  }>;
  serviceHistory: Array<{
    id: string;
    service: string;
    createdAt: string;
    status: string;
  }>;
  freelancerHistory: Array<{
    id: string;
    freelancer: string;
    title: string;
    need: string;
    budget: string;
    targetDate: string;
    completionNote: string;
    deliverableUrl: string;
    createdAt: string;
    status: string;
  }>;
};

export type FreelancerDashboardData = {
  name: string;
  email: string;
  whatsapp: string;
  initials: string;
  verified: boolean;
  acceptingProjects: boolean;
  profile: {
    bio: string;
    city: string;
    workMode: string;
    priceFrom: string;
    skills: string[];
  } | null;
  portfolios: Array<{
    id: string;
    title: string;
    description: string;
    projectUrl: string;
  }>;
  packages: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    priceType: string;
    duration: string;
    deliverables: string[];
    status: string;
  }>;
  leads: Array<{
    id: string;
    name: string;
    isMemberRequest: boolean;
    email: string;
    whatsapp: string;
    title: string;
    need: string;
    budget: string;
    targetDate: string;
    completionNote: string;
    deliverableUrl: string;
    createdAt: string;
    status: string;
  }>;
};
