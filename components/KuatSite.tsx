"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Show, UserButton, useAuth, useClerk } from "@clerk/nextjs";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Bookmark,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Layers3,
  FileText,
  LogOut,
  Menu,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { formatRupiah } from "@/lib/data";
import type { FreelancerItem, ProductItem } from "@/lib/data";
import type { CatalogData } from "@/lib/catalog-data";
import DigitalReadinessAssessment from "@/components/DigitalReadinessAssessment";
import {
  advanceAdminRecordAction,
  archiveAdminRecordAction,
  archiveFreelancerPackageAction,
  bookConsultationAction,
  createAdminRecordAction,
  createConsultationSlotAction,
  completeFreelancerProjectAction,
  rejectFreelancerApplicationAction,
  saveBusinessProfileAction,
  saveFreelancerProfileAction,
  saveFreelancerPackageAction,
  savePersonalProfileAction,
  submitInquiryAction,
  toggleBookmarkAction,
  toggleFreelancerAvailabilityAction,
  updateFreelancerRequestAction,
  updateConsultationBookingAction,
} from "@/app/actions";
import type {
  AdminDashboardData,
  AdminRecord,
  AdminSection,
  FreelancerDashboardData,
  MemberDashboardData,
} from "@/lib/admin-types";

const nav = [
  ["Edukasi", "/edukasi"],
  ["Cek Digital", "/tes-kesiapan-digital"],
  ["Rekomendasi App", "/produk"],
  ["Layanan", "/layanan"],
  ["Freelancer", "/freelancer"],
];

const CatalogContext = createContext<CatalogData | null>(null);
const useCatalog = () => {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error("Data katalog belum tersedia.");
  return catalog;
};

const whatsappHref = (number: string | undefined, message: string) => {
  const digits = (number ?? "").replace(/\D/g, "");
  if (!digits) return "";
  const international = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
};

function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [leaving, setLeaving] = useState(false);
  async function logout() {
    setLeaving(true);
    if (isSignedIn) {
      await signOut({ redirectUrl: "/" });
      return;
    }
    router.push("/");
  }
  return (
    <button className={compact ? "logout-button compact" : "logout-button"} type="button" onClick={logout} disabled={leaving}>
      <LogOut />{compact ? <span>Keluar</span> : leaving ? "Keluar..." : "Keluar dari akun"}
    </button>
  );
}

function Logo() {
  return (
    <Link
      className="logo"
      href="/"
      aria-label="KUAT — Komunitas UMKM dengan Akselerasi Teknologi"
    >
      <Image
        className="logo-mark"
        src="/brand/kuat-logo.svg"
        alt=""
        width={44}
        height={44}
      />
      <span>
        <b>KUAT</b>
        <small>Komunitas UMKM dengan Akselerasi Teknologi</small>
      </span>
    </Link>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="nav-shell">
        <Logo />
        <nav className="desktop-nav" aria-label="Navigasi utama">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Show when="signed-out">
            <Link className="login-link" href="/login?redirect_url=/dashboard">
              Masuk
            </Link>
            <Link className="button button-sm" href="/register">
              Gabung Komunitas
            </Link>
          </Show>
          <Show when="signed-in">
            <div className="account-actions">
              <Link className="login-link" href="/dashboard">
                Dashboard
              </Link>
              <UserButton showName userProfileMode="modal" />
            </div>
          </Show>
        </div>
        <button
          className="menu-button"
          aria-label="Buka menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Navigasi mobile">
          {nav.map(([label, href]) => (
            <Link key={href} onClick={() => setOpen(false)} href={href}>
              {label}
            </Link>
          ))}
          <Show when="signed-out">
            <div className="mobile-account">
              <Link
                onClick={() => setOpen(false)}
                href="/login?redirect_url=/dashboard"
              >
                Masuk
              </Link>
              <Link onClick={() => setOpen(false)} href="/register">
                Gabung Komunitas
              </Link>
            </div>
          </Show>
          <Show when="signed-in">
            <div className="mobile-account signed-in">
              <Link onClick={() => setOpen(false)} href="/dashboard">
                Dashboard
              </Link>
              <UserButton showName userProfileMode="modal" />
            </div>
          </Show>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <Logo />
          <p>
            <b>Komunitas UMKM dengan Akselerasi Teknologi.</b>
            <br />
            Rumah tumbuh digital untuk UMKM Indonesia.
          </p>
          <p className="muted">Jakarta, Indonesia · support@example.com</p>
        </div>
        <div>
          <b>Jelajahi</b>
          {nav.map(([l, h]) => (
            <Link key={h} href={h}>
              {l}
            </Link>
          ))}
        </div>
        <div>
          <b>Komunitas</b>
          <Link href="/register">Jadi member</Link>
          <Link href="/jadi-freelancer">Jadi freelancer</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
        <div>
          <b>Bantuan</b>
          <a
            href="/layanan#konsultasi"
            target="_blank"
            rel="noreferrer"
          >
            Bantuan KUAT
          </a>
          <Link href="/kebijakan-privasi">Kebijakan privasi</Link>
          <Link href="/syarat-ketentuan">Syarat & ketentuan</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 KUAT Digital.</span>
        <span>Komunitas UMKM dengan Akselerasi Teknologi</span>
      </div>
    </footer>
  );
}

function SectionHead({
  eyebrow,
  title,
  text,
  link,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  link?: string;
}) {
  return (
    <div className="section-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {link && (
        <Link className="text-link" href={link}>
          Lihat semua <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}

function Home() {
  const { education, products, services, freelancers } = useCatalog();
  const pillars = [
    [
      BookOpen,
      "Edukasi",
      "Belajar bisnis dan digital dengan materi yang langsung bisa dipraktikkan.",
      "/edukasi",
    ],
    [
      ShoppingBag,
      "Rekomendasi App",
      "Temukan aplikasi terkurasi lengkap dengan fungsi, harga, dan link resminya.",
      "/produk",
    ],
    [
      Store,
      "Digital Presence",
      "Tampil lebih profesional lewat profil, website, dan materi bisnis.",
      "/layanan",
    ],
    [
      Users,
      "Freelancer",
      "Terhubung dengan tenaga ahli terverifikasi sesuai kebutuhan usaha.",
      "/freelancer",
    ],
  ] as const;
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="pill">
            <Sparkles size={15} /> Rumah tumbuh digital untuk UMKM
          </span>
          <h1>
            Bikin Bisnismu
            <br />
            <em>Lebih Kuat</em> di Era Digital.
          </h1>
          <p>
            Belajar, temukan solusi, dan terhubung dengan orang yang tepat untuk
            membantu bisnismu bertumbuh.
          </p>
          <div className="button-row">
            <Link className="button" href="/register">
              Gabung Komunitas <ArrowRight size={18} />
            </Link>
            <Link className="button button-ghost" href="/layanan">
              Jelajahi Solusi
            </Link>
          </div>
          <div className="trust-row">
            <div className="avatar-stack">
              <span>RA</span>
              <span>NP</span>
              <span>BW</span>
            </div>
            <p>
              <b>250+ pelaku usaha</b>
              <br />
              bertumbuh bersama KUAT
            </p>
          </div>
        </div>
        <div className="hero-visual">
          <Image
            src="/brand/hero-growth.svg"
            alt="Ilustrasi toko UMKM, laptop, dan grafik pertumbuhan"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 48vw"
          />
          <div className="hero-note">
            <BarChart3 />
            <span>
              <b>Naik kelas bersama</b>
              <small>Solusi yang relevan, langkah yang nyata.</small>
            </span>
          </div>
        </div>
      </section>
      <section className="home-paths">
        <SectionHead
          eyebrow="Satu rumah, empat jalan tumbuh"
          title="Semua yang bisnismu butuhkan, di satu tempat."
          text="Mulai dari pengetahuan sampai bantuan profesional—pilih langkah yang paling relevan hari ini."
        />
        <div className="pillar-grid">
          {pillars.map(([Icon, title, text, href], i) => (
            <Link href={href} className={`pillar pillar-${i + 1}`} key={title}>
              <span className="icon-box">
                <Icon />
              </span>
              <span className="step">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="text-link">
                Mulai jelajahi <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="soft-section">
        <SectionHead
          eyebrow="Belajar yang bisa langsung dipakai"
          title="Satu bekal untuk langkah berikutnya."
          link="/edukasi"
        />
        <div className="editorial-grid editorial-grid-single">
          {education.slice(0, 1).map((item) => (
            <Link
              className="feature-article"
              href={`/edukasi/${item.slug}`}
              key={item.slug}
            >
              <div className="article-art">
                <span>{item.format}</span>
                <BookOpen />
              </div>
              <div>
                <span className="tag">{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <small>
                  <Clock3 size={14} />
                  {item.duration} · {item.access}
                </small>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <SectionHead
          eyebrow="App pilihan KUAT"
          title="Aplikasi yang membantu kerja usaha lebih ringan."
          text="Rekomendasi terkurasi untuk kebutuhan nyata UMKM."
          link="/produk"
        />
        <ProductGrid items={products.slice(0, 2)} compact />
      </section>
      <section className="service-story">
        <div>
          <span className="eyebrow light">Layanan KUAT Digital</span>
          <h2>Dari cerita bisnis sampai siap tampil dan pitching.</h2>
          <p>
            Kami bantu mengubah ide dan pengalamanmu menjadi materi bisnis yang
            jelas, profesional, dan meyakinkan.
          </p>
          <Link className="button button-white" href="/layanan">
            Lihat Semua Layanan <ArrowRight size={18} />
          </Link>
        </div>
        <div className="service-list">
          {services.slice(0, 3).map((s, i) => (
            <Link href={`/layanan/${s.slug}`} key={s.slug}>
              <span>0{i + 1}</span>
              <div>
                <b>{s.name}</b>
                <small>{s.desc}</small>
              </div>
              <ChevronRight />
            </Link>
          ))}
        </div>
      </section>
      <section>
        <SectionHead
          eyebrow="Orang tepat, saat dibutuhkan"
          title="Expert unggulan untuk membantu usahamu."
          link="/freelancer"
        />
        <FreelancerGrid items={freelancers.slice(0, 2)} />
        {!freelancers.length && <Empty text="Belum ada freelancer aktif. Pendaftaran sedang dibuka." />}
      </section>
      <section className="benefit-section">
        <div className="benefit-intro">
          <span className="eyebrow">Kenapa jadi member?</span>
          <h2>Tiga alasan untuk tumbuh bersama KUAT.</h2>
        </div>
        <div className="benefit-list">
          {[
            [WalletCards, "Harga khusus member"],
            [BadgeCheck, "Partner terkurasi"],
            [Users, "Komunitas relevan"],
          ].map(([Icon, t]) => (
            <div key={String(t)}>
              <Icon />
              <span>
                <b>{String(t)}</b>
              </span>
            </div>
          ))}
        </div>
      </section>
      <Cta />
    </>
  );
}

function ProductGrid({
  items,
  compact = false,
}: {
  items: ProductItem[];
  compact?: boolean;
}) {
  return (
    <div className="product-grid">
      {items.map((p, i) => (
        <article className="product-card" key={p.slug}>
          <div className={`product-art art-${i % 4}`}>
            <PackageCheck />
            <span>{p.partner}</span>
          </div>
          <div className="product-body">
            <span className="tag">{p.category}</span>
            <Link href={`/produk/${p.slug}`}>
              <h3>{p.name}</h3>
            </Link>
            <p>{p.desc}</p>
            <div className="rating">Dibuat oleh {p.partner}</div>
            <div className="app-card-meta">
              <span><small>Model harga</small><b>{p.pricingModel || "Lihat di website"}</b></span>
              <span><small>Mulai dari</small><b>{p.priceLabel || (p.price ? formatRupiah(p.price) : "Cek harga")}</b></span>
            </div>
            {!compact && (
              <Link
                className="button button-full button-ghost"
                href={`/produk/${p.slug}`}
              >
                Lihat detail app
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function FreelancerGrid({ items }: { items: FreelancerItem[] }) {
  return (
    <div className="freelancer-grid">
      {items.map((f, i) => (
        <Link
          href={`/freelancer/${f.slug}`}
          className="freelancer-card"
          key={f.slug}
        >
          <div className={`portrait portrait-${i % 4}`}>{f.initials}</div>
          <div className="freelancer-top">
            <span className="tag">{f.skill}</span>
            {f.verified && <BadgeCheck aria-label="Terverifikasi" />}
          </div>
          <h3>{f.name}</h3>
          <p>{f.bio}</p>
          <small>
            {f.city} · {f.mode}
          </small>
          <b>{f.price}</b>
        </Link>
      ))}
    </div>
  );
}

function ListingHero({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="listing-hero">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}

function EducationList() {
  const { education } = useCatalog();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Semua");
  const cats = ["Semua", ...new Set(education.map((e) => e.category))];
  const filtered = useMemo(
    () =>
      education.filter(
        (e) =>
          (cat === "Semua" || e.category === cat) &&
          (e.title + e.excerpt).toLowerCase().includes(q.toLowerCase()),
      ),
    [q, cat, education],
  );
  return (
    <>
      <ListingHero
        eyebrow="KUAT Belajar"
        title="Ilmu praktis untuk bisnis yang terus bergerak."
        text="Panduan, kelas, dan template yang dibuat agar bisa langsung dipakai—bahkan di tengah sibuknya mengurus usaha."
      />
      <section className="catalog-section">
        <div className="search-bar">
          <Search />
          <input
            aria-label="Cari materi edukasi"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari topik, panduan, atau kelas..."
          />
        </div>
        <div className="chips" aria-label="Filter kategori">
          {cats.map((c) => (
            <button
              className={cat === c ? "active" : ""}
              onClick={() => setCat(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="result-meta">
          <b>{filtered.length} materi ditemukan</b>
          <span>Urutkan: Terbaru</span>
        </div>
        <div className="education-grid">
          {filtered.map((e, i) => (
            <Link
              className="education-card"
              href={`/edukasi/${e.slug}`}
              key={e.slug}
            >
              <div className={`education-art art-${i % 4}`}>
                <BookOpen />
                <span>{e.format}</span>
              </div>
              <div>
                <div className="tag-row">
                  <span className="tag">{e.category}</span>
                  <span className={`access access-${e.access.toLowerCase()}`}>
                    {e.access}
                  </span>
                </div>
                <h3>{e.title}</h3>
                <p>{e.excerpt}</p>
                <small>
                  <Clock3 />
                  {e.duration} · {e.level}
                </small>
              </div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <Empty text="Belum ada materi yang cocok. Coba kata kunci lain." />
        )}
      </section>
    </>
  );
}

function ProductList() {
  const { products } = useCatalog();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Semua");
  const cats = ["Semua", ...new Set(products.map((p) => p.category))];
  const filtered = products.filter(
    (p) =>
      (cat === "Semua" || p.category === cat) &&
      (p.name + p.desc + p.partner).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <ListingHero
        eyebrow="Rekomendasi App Bisnis"
        title="Pilih aplikasi yang tepat untuk tahap usahamu."
        text="Bandingkan fungsi, model harga, platform, dan tingkat setup sebelum membuka website resminya."
      />
      <section className="catalog-section">
        <div className="search-bar">
          <Search />
          <input
            aria-label="Cari rekomendasi aplikasi"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari app, kategori, atau penyedia..."
          />
        </div>
        <div className="chips">
          {cats.map((c) => (
            <button
              className={cat === c ? "active" : ""}
              onClick={() => setCat(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="result-meta">
          <b>{filtered.length} app direkomendasikan</b>
          <span>Informasi harga dapat berubah di website penyedia</span>
        </div>
        <ProductGrid items={filtered} />
        {!filtered.length && (
          <Empty text="Rekomendasi app belum ditemukan. Coba filter lainnya." />
        )}
      </section>
    </>
  );
}

function ServiceList() {
  const { services } = useCatalog();
  return (
    <>
      <ListingHero
        eyebrow="Layanan KUAT Digital"
        title="Buat bisnismu lebih profesional dan meyakinkan."
        text="Pilih dukungan sesuai tujuan—dari memperjelas profil, siap masuk pasar, sampai pitching dan hadir secara digital."
      />
      <section className="service-page service-pricing">
        <div className="service-page-head service-pricing-head">
          <div>
            <span className="eyebrow">Bandingkan paket</span>
            <h2>Pilih layanan sesuai tahap bisnismu.</h2>
          </div>
          <a
            className="button"
            href="/layanan#konsultasi"
            target="_blank"
            rel="noreferrer"
          >
            Bantu Saya Memilih
          </a>
        </div>
        <div className="service-pricing-scroll">
          <div className="service-pricing-grid" role="list">
            {services.map((s, i) => (
              <article
                className={`service-plan${i === 1 ? " featured" : ""}`}
                key={s.slug}
                role="listitem"
              >
                <div className="service-plan-top">
                  <span className="service-plan-label">
                    {i === 1
                      ? "Paling populer"
                      : i === 4
                        ? "Berlangganan"
                        : "Paket layanan"}
                  </span>
                  <span className="service-plan-index">0{i + 1}</span>
                </div>
                <h3>{s.name}</h3>
                <p className="service-plan-description">{s.desc}</p>
                <div className="service-plan-price">
                  {s.oldPrice && <s>{s.oldPrice}{s.billingPeriod && `/${s.billingPeriod}`}</s>}
                  <strong>{s.price}{s.billingPeriod && <small>/{s.billingPeriod}</small>}</strong>
                </div>
                <span className="service-plan-duration">
                  <Clock3 /> Estimasi {s.time}
                </span>
                <Link
                  className="button button-full service-plan-button"
                  href={`/layanan/${s.slug}`}
                >
                  Lihat detail <ArrowRight />
                </Link>
                <div className="service-plan-features">
                  <b>Yang kamu dapatkan</b>
                  {s.deliverables.map((d) => (
                    <span key={d}>
                      <Check />
                      {d}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="service-pricing-note">
          <BadgeCheck />
          <p>
            Semua paket diawali konsultasi singkat agar ruang lingkup dan hasil
            akhirnya sesuai kebutuhan bisnismu.
          </p>
        </div>
      </section>
      <Cta />
    </>
  );
}

function FreelancerList() {
  const { freelancers } = useCatalog();
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("Semua");
  const filtered = freelancers.filter(
    (f) =>
      (mode === "Semua" || f.mode === mode) &&
      (f.name + f.skill + f.city).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <ListingHero
        eyebrow="Direktori Freelancer KUAT"
        title="Temukan orang yang paham kebutuhan usahamu."
        text="Jelajahi tenaga profesional dari pembukuan sampai teknologi. Profil terverifikasi ditinjau lebih dulu oleh tim KUAT."
      />
      <section className="catalog-section">
        <div className="search-bar">
          <Search />
          <input
            aria-label="Cari freelancer"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, skill, atau kota..."
          />
        </div>
        <div className="chips">
          {["Semua", "Remote", "Onsite", "Hybrid"].map((c) => (
            <button
              className={mode === c ? "active" : ""}
              onClick={() => setMode(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="result-meta">
          <b>{filtered.length} tenaga profesional</b>
          <Link className="text-link" href="/jadi-freelancer">
            Daftar sebagai freelancer <ArrowRight />
          </Link>
        </div>
        <FreelancerGrid items={filtered} />
        {!filtered.length && <Empty text={freelancers.length ? "Belum ada freelancer yang cocok dengan pencarian ini." : "Belum ada freelancer aktif. Kamu bisa menjadi yang pertama mendaftar."} />}
      </section>
    </>
  );
}

function articleVideoEmbedUrl(value?: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : value;
    }
    if (url.hostname.includes("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : value;
    }
  } catch {
    return "";
  }
  return "";
}

function Detail({ type, slug }: { type: string; slug: string }) {
  const { education, products, services, freelancers } = useCatalog();
  if (type === "edukasi") {
    const e = education.find((x) => x.slug === slug) ?? education[0];
    return (
      <>
        <section className="detail-hero article-detail">
          <div>
            <span className="tag">{e.category}</span>
            <h1>{e.title}</h1>
            <p>{e.excerpt}</p>
            <div className="detail-meta">
              <Clock3 />
              {e.duration}
              <span>{e.level}</span>
              <span>{e.access}</span>
            </div>
          </div>
        </section>
        <section className="article-body">
          <aside>
            <Link className="save-material" href="/dashboard"><Bookmark /> Kelola materi tersimpan</Link>
            <b>Informasi materi</b>
            <span>{e.format}</span>
            <span>{e.level}</span>
            <span>{e.duration}</span>
          </aside>
          <article>
            {e.coverImageUrl && (
              <div
                className="article-cover"
                role="img"
                aria-label={`Sampul ${e.title}`}
                style={{ backgroundImage: `url(${e.coverImageUrl})` }}
              />
            )}
            {articleVideoEmbedUrl(e.videoUrl) && (
              <div className="article-video">
                <iframe
                  src={articleVideoEmbedUrl(e.videoUrl)}
                  title={`Video ${e.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            {(e.body ?? e.excerpt).split(/\n+/).filter(Boolean).map((paragraph, index) => {
              const text = paragraph.trim();
              if (text.startsWith("### ")) return <h3 key={`${e.slug}-${index}`}>{text.slice(4)}</h3>;
              if (text.startsWith("## ")) return <h2 key={`${e.slug}-${index}`}>{text.slice(3)}</h2>;
              if (text.startsWith("- ")) return <p className="article-list-item" key={`${e.slug}-${index}`}>{text.slice(2)}</p>;
              return <p className={index === 0 ? "lead" : undefined} key={`${e.slug}-${index}`}>{text}</p>;
            })}
            {!!e.attachments?.length && (
              <section className="article-attachments">
                <h3>Lampiran materi</h3>
                {e.attachments.map((url, index) => (
                  <a href={url} target="_blank" rel="noreferrer" key={url}>
                    <FileText /> Lampiran {index + 1} <ArrowRight />
                  </a>
                ))}
              </section>
            )}
          </article>
        </section>
        <Related type="edukasi" />
      </>
    );
  }
  if (type === "produk") {
    const p = products.find((x) => x.slug === slug) ?? products[0];
    return (
      <>
        <section className="detail-shell product-detail">
          <div className="detail-product-art">
            <PackageCheck />
            <span>{p.partner}</span>
          </div>
          <div>
            <span className="tag">{p.category}</span>
            <h1>{p.name}</h1>
            <div className="rating">Rekomendasi app untuk UMKM</div>
            <p>{p.desc}</p>
            <div className="regular-price">
              <small>Model harga</small>
              <strong>{p.pricingModel || "Lihat di website"}</strong>
              <span>{p.priceLabel || (p.price ? `Mulai ${formatRupiah(p.price)}` : "Harga mengikuti website penyedia")}</span>
            </div>
            <div className="app-facts">
              <span><b>Platform</b>{p.platforms?.length ? p.platforms.join(", ") : "Cek website resmi"}</span>
              <span><b>Tingkat setup</b>{p.setupLevel || "Mudah dipelajari"}</span>
            </div>
            <div className="button-row">
              {p.websiteUrl && <a className="button" href={p.websiteUrl} target="_blank" rel="noopener noreferrer">Buka website resmi <ArrowRight /></a>}
              <a className="button button-ghost" href="/layanan#konsultasi" target="_blank" rel="noreferrer">Tanya tim KUAT</a>
            </div>
          </div>
        </section>
        <section className="product-info">
          <div>
            <span className="eyebrow">Cocok untuk</span>
            <h2>{p.bestFor || "UMKM yang ingin bekerja lebih rapi dan efisien."}</h2>
            <p>KUAT menyajikan ringkasan agar kamu lebih mudah membandingkan. Harga, fitur, dan kebijakan akhir tetap mengikuti website resmi penyedia.</p>
          </div>
          <div>
            <h3>Fitur utama</h3>
            <ul>
              {(p.features?.length ? p.features : ["Informasi fitur sedang dilengkapi", "Kunjungi website resmi untuk demo dan detail terbaru"]).map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          </div>
        </section>
        <Related type="produk" />
      </>
    );
  }
  if (type === "layanan") {
    const s = services.find((x) => x.slug === slug) ?? services[0];
    return (
      <>
        <section className="detail-hero service-detail">
          <div>
            <span className="eyebrow">Layanan KUAT Digital</span>
            <h1>{s.name}</h1>
            <p>{s.desc}</p>
            <div className="button-row">
              <a
                className="button button-white"
                href="/layanan#konsultasi"
                target="_blank"
                rel="noreferrer"
              >
                Konsultasikan Bisnismu
              </a>
              <a className="button button-outline-white" href="#contoh">
                Lihat contoh hasil
              </a>
            </div>
          </div>
          <div className="package-box">
            <small>Investasi</small>
            <s>{s.oldPrice}{s.billingPeriod && `/${s.billingPeriod}`}</s>
            <strong>{s.price}{s.billingPeriod && <small>/{s.billingPeriod}</small>}</strong>
            <span>
              <Clock3 /> Estimasi {s.time}
            </span>
          </div>
        </section>
        <section className="deliverable-detail">
          <div>
            <span className="eyebrow">Yang kamu dapatkan</span>
            <h2>
              Bukan sekadar desain, tetapi cerita bisnis yang lebih jelas.
            </h2>
            <p>
              Proses dimulai dengan memahami konteks usahamu, lalu menyusun
              materi yang siap dipakai untuk tujuan nyata.
            </p>
          </div>
          <ol>
            {s.deliverables.map((d, i) => (
              <li key={d}>
                <span>0{i + 1}</span>
                <b>{d}</b>
                <p>
                  Dikerjakan bersama praktisi dengan alur review yang terarah.
                </p>
              </li>
            ))}
          </ol>
        </section>
        <Inquiry service={s.name} serviceSlug={s.slug} />
      </>
    );
  }
  const f = freelancers.find((x) => x.slug === slug) ?? freelancers[0];
  return (
    <>
      <section className="detail-shell freelancer-detail">
        <div className="profile-card">
          <div className="portrait portrait-large">{f.initials}</div>
          {f.verified && (
            <span>
              <BadgeCheck /> Profil terverifikasi
            </span>
          )}
        </div>
        <div>
          <span className="tag">{f.skill}</span>
          <h1>{f.name}</h1>
          <p>{f.bio}</p>
          <div className="profile-facts">
            <span>
              <b>Lokasi</b>
              {f.city}
            </span>
            <span>
              <b>Mode kerja</b>
              {f.mode}
            </span>
            <span>
              <b>Kisaran</b>
              {f.price}
            </span>
            <span><b>Ketersediaan</b>{f.available === false ? "Belum menerima proyek" : "Menerima proyek"}</span>
          </div>
          {f.available !== false && f.whatsapp && <a className="button" href={whatsappHref(f.whatsapp, `Halo ${f.name}, saya menemukan profil Anda di KUAT Digital dan ingin berdiskusi tentang kebutuhan usaha saya.`)} target="_blank" rel="noopener noreferrer">Hubungi via WhatsApp</a>}
        </div>
      </section>
      <section className={`profile-content ${f.whatsapp ? "profile-content-wide" : ""}`}>
        <div>
          <h2>Tentang {f.name.split(" ")[0]}</h2>
          <p>{f.bio}</p>
          <h3>Keahlian</h3>
          <div className="chips static">
            {(f.skills?.length ? f.skills : [f.skill]).map((skill) => <span key={skill}>{skill}</span>)}
          </div>
          <h3>Portofolio pilihan</h3>
          <div className="portfolio-grid">
            {f.portfolios?.map((item) => <div key={item.title}><b>{item.title}</b>{item.description && <p>{item.description}</p>}{item.projectUrl && <a href={item.projectUrl} target="_blank" rel="noreferrer">Lihat portofolio ↗</a>}</div>)}
            {!f.portfolios?.length && <p>Portofolio belum ditambahkan.</p>}
          </div>
          <h3>Paket jasa</h3>
          <div className="freelancer-package-grid">
            {f.packages?.map((item) => (
              <article className="freelancer-package-card" key={item.id}>
                <span className="eyebrow">{item.duration}</span>
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <strong>{item.price}{item.priceType === "HOURLY" ? "/jam" : item.priceType === "MONTHLY" ? "/bulan" : item.priceType === "STARTING_FROM" ? " mulai" : ""}</strong>
                {!!item.deliverables.length && <ul>{item.deliverables.map((deliverable) => <li key={deliverable}><Check />{deliverable}</li>)}</ul>}
                {f.whatsapp && <a className="button button-full" href={whatsappHref(f.whatsapp, `Halo ${f.name}, saya tertarik dengan paket ${item.name} (${item.price}) yang saya lihat di KUAT Digital.`)} target="_blank" rel="noopener noreferrer">Tanya paket via WhatsApp</a>}
              </article>
            ))}
            {!f.packages?.length && <p>Freelancer belum menambahkan paket jasa.</p>}
          </div>
        </div>
        {f.available !== false && !f.whatsapp && <Inquiry service={`Permintaan bantuan untuk ${f.name}`} freelancerSlug={f.slug} id="minta-bantuan" />}
      </section>
    </>
  );
}

function Inquiry({
  service,
  id,
  serviceSlug,
  freelancerSlug,
  applicationType,
}: {
  service: string;
  id?: string;
  serviceSlug?: string;
  freelancerSlug?: string;
  applicationType?: "FREELANCER" | "PARTNER";
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        await submitInquiryAction(form);
        setDone(true);
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Permintaan belum berhasil disimpan.",
        );
      }
    });
  }
  return (
    <section className="inquiry" id={id}>
      <div>
        <span className="eyebrow">Mulai percakapan</span>
        <h2>Ceritakan kebutuhan bisnismu.</h2>
        <p>{freelancerSlug ? "Masuk sebagai member, lalu kirim brief agar freelancer dapat menerima pekerjaanmu." : applicationType === "FREELANCER" ? "Masuk sebagai member untuk mendaftar. Tim KUAT akan meninjau keahlian dan portofoliomu." : "Tim KUAT akan menghubungi melalui WhatsApp dalam 1-2 hari kerja."}</p>
      </div>
      {done ? (
        <div className="success-state">
          <Check />
          <h3>{applicationType === "FREELANCER" ? "Aplikasi terkirim." : freelancerSlug ? "Permintaan proyek terkirim." : "Permintaan sudah tercatat."}</h3>
          <p>{applicationType === "FREELANCER" ? "Tunggu review dari Admin KUAT." : freelancerSlug ? "Pantau statusnya dari dashboard member." : "Kami akan menghubungi kamu untuk membahas langkah berikutnya."}</p>
          <button onClick={() => setDone(false)}>Kirim kebutuhan lain</button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <input type="hidden" name="service" value={service} />
          {serviceSlug && (
            <input type="hidden" name="serviceSlug" value={serviceSlug} />
          )}{" "}
          {freelancerSlug && (
            <input type="hidden" name="freelancerSlug" value={freelancerSlug} />
          )}{" "}
          {applicationType && (
            <input
              type="hidden"
              name="applicationType"
              value={applicationType}
            />
          )}
          <label>
            Nama lengkap
            <input required name="name" placeholder="Nama kamu" />
          </label>
          <label>
            Nomor WhatsApp
            <input
              required
              name="whatsapp"
              inputMode="tel"
              placeholder="08xxxxxxxxxx"
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              name="email"
              placeholder="user@example.com"
            />
          </label>
          {freelancerSlug && <>
            <label>Judul proyek<input required name="projectTitle" minLength={5} maxLength={180} placeholder="Contoh: Desain katalog produk" /></label>
            <label>Anggaran (Rp)<input required name="budget" type="number" min={0} max={1000000000} placeholder="Contoh: 1500000" /></label>
            <label>Target selesai<input required name="targetDate" type="date" min={new Date().toISOString().slice(0, 10)} /></label>
          </>}
          {applicationType === "FREELANCER" && <>
            <label>Keahlian utama (pisahkan dengan koma)<input required name="skills" placeholder="Desain grafis, copywriting" /></label>
            <label>Kota<input required name="city" placeholder="Contoh: Jakarta" /></label>
            <label>Mode kerja<select name="workMode" required defaultValue=""><option value="" disabled>Pilih mode kerja</option><option value="REMOTE">Remote</option><option value="ONSITE">Onsite</option><option value="HYBRID">Hybrid</option></select></label>
            <label>Harga mulai (Rp)<input required name="priceFrom" type="number" min={0} max={1000000000} placeholder="Contoh: 500000" /></label>
            <label>Link portofolio (opsional)<input name="portfolioUrl" type="url" placeholder="https://..." /></label>
          </>}
          <label>
            {applicationType === "FREELANCER" ? "Pengalaman dan layanan yang kamu tawarkan" : freelancerSlug ? "Brief dan hasil yang diharapkan" : "Ceritakan kebutuhanmu"}
            <textarea
              required
              minLength={10}
              name="message"
              placeholder={applicationType === "FREELANCER" ? "Ceritakan pengalamanmu membantu bisnis dan jenis pekerjaan yang kamu kerjakan..." : freelancerSlug ? "Jelaskan lingkup pekerjaan dan hasil yang kamu butuhkan..." : "Contoh: Saya ingin menyiapkan profil usaha untuk bertemu calon partner..."}
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button" disabled={pending} type="submit">
            {pending ? "Menyimpan..." : "Kirim Permintaan"}{" "}
            {!pending && <ArrowRight />}
          </button>
          <small>
            Dengan mengirim form, kamu menyetujui tim KUAT menghubungimu.
          </small>
        </form>
      )}
    </section>
  );
}

function AuthPage({
  kind,
}: {
  kind: "login" | "register" | "forgot-password";
}) {
  const [show, setShow] = useState(false);
  const title =
    kind === "login"
      ? "Selamat datang kembali."
      : kind === "register"
        ? "Mulai tumbuh bersama KUAT."
        : "Atur ulang password.";
  return (
    <section className="auth-page">
      <div className="auth-aside">
        <Logo />
        <blockquote>
          “Bisnis yang kuat tumbuh dari keputusan yang lebih jelas dan
          orang-orang yang tepat.”
        </blockquote>
        <p>Belajar. Temukan solusi. Bertumbuh bersama.</p>
      </div>
      <div className="auth-form">
        <Link href="/" className="back-link">
          ← Kembali ke beranda
        </Link>
        <h1>{title}</h1>
        <p>
          {kind === "login"
            ? "Masuk untuk membuka harga member, bookmark, dan dashboard usahamu."
            : kind === "register"
              ? "Buat akun gratis untuk mengakses ekosistem KUAT Digital."
              : "Masukkan email akunmu dan kami akan mengirim tautan pemulihan."}
        </p>
        {kind !== "forgot-password" && (
          <button className="google-button" onClick={() => setShow(true)}>
            <span>G</span> Lanjutkan dengan Google
          </button>
        )}
        {kind !== "forgot-password" && (
          <div className="divider">
            <span>atau dengan email</span>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShow(true);
          }}
        >
          {kind === "register" && (
            <>
              <label>
                Nama lengkap
                <input required name="name" autoComplete="name" />
              </label>
              <label>
                Nomor WhatsApp
                <input required name="whatsapp" inputMode="tel" />
              </label>
            </>
          )}
          <label>
            Email
            <input required type="email" name="email" autoComplete="email" />
          </label>
          {kind !== "forgot-password" && (
            <label>
              Password
              <input
                required
                type="password"
                minLength={8}
                name="password"
                autoComplete={
                  kind === "login" ? "current-password" : "new-password"
                }
              />
            </label>
          )}
          {kind === "login" && (
            <Link className="forgot" href="/forgot-password">
              Lupa password?
            </Link>
          )}
          <button className="button button-full" type="submit">
            {kind === "login"
              ? "Masuk"
              : kind === "register"
                ? "Buat akun"
                : "Kirim tautan pemulihan"}
          </button>
        </form>
        {show && (
          <div className="setup-notice" role="status">
            <ShieldCheck />
            <span>
              <b>Keamanan akun sedang disiapkan.</b> UI dan validasi sudah
              aktif. Login nyata akan tersedia setelah skema database disetujui
              dan kredensial OAuth dipasang.
            </span>
          </div>
        )}
        <p className="auth-switch">
          {kind === "login" ? (
            <>
              Belum punya akun? <Link href="/register">Daftar gratis</Link>
            </>
          ) : kind === "register" ? (
            <>
              Sudah punya akun? <Link href="/login">Masuk</Link>
            </>
          ) : (
            <Link href="/login">Kembali ke halaman masuk</Link>
          )}
        </p>
      </div>
    </section>
  );
}

function Dashboard({ data, initialSection = "overview" }: { data?: MemberDashboardData; initialSection?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState(initialSection === "articles" ? "saved" : initialSection);
  const [notice, setNotice] = useState("");
  const member = data ?? {
    name: "Member KUAT",
    email: "",
    whatsapp: "",
    initials: "KU",
    inquiries: 0,
    freelancerRequests: 0,
    freelancerApplication: null,
    bookmarks: 0,
    profile: null,
    articles: [],
    serviceHistory: [],
    freelancerHistory: [],
    consultationSlots: [],
    consultationBookings: [],
  };
  const profileFields = member.profile
    ? Object.values(member.profile).filter((value) => value !== "" && value !== null).length
    : 0;
  const profileCompletion = Math.round((profileFields / 7) * 100);
  const navItems = [
    ["overview", Layers3, "Ringkasan"],
    ["services", BriefcaseBusiness, "Layanan & konsultasi"],
    ["freelancers", Users, "Hire freelancer"],
    ["saved", Bookmark, "Tersimpan"],
    ["profile", Store, "Profil usaha"],
    ["account", CircleUserRound, "Akun saya"],
  ] as const;
  function toggleBookmark(id: string) {
    setNotice("");
    startTransition(async () => {
      try {
        const result = await toggleBookmarkAction(id);
        setNotice(result.message);
        router.refresh();
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Artikel belum berhasil diperbarui.");
      }
    });
  }
  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setNotice("");
    startTransition(async () => {
      try {
        const result = await saveBusinessProfileAction(form);
        setNotice(result.message);
        router.refresh();
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Profil belum berhasil disimpan.");
      }
    });
  }
  function savePersonalProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setNotice("");
    startTransition(async () => {
      try {
        const result = await savePersonalProfileAction(form);
        setNotice(result.message);
        router.refresh();
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Profil pribadi belum berhasil disimpan.");
      }
    });
  }
  function bookConsultation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setNotice("");
    startTransition(async () => {
      try {
        const result = await bookConsultationAction(form);
        setNotice(result.message);
        formElement.reset();
        router.refresh();
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Konsultasi belum berhasil dijadwalkan.");
      }
    });
  }
  function completeProject(id: string) {
    setNotice("");
    startTransition(async () => {
      try {
        const result = await completeFreelancerProjectAction(id);
        setNotice(result.message);
        router.refresh();
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Proyek belum bisa dikonfirmasi.");
      }
    });
  }
  const visibleArticles = member.articles;
  return (
    <section className="app-shell">
      <aside className="app-sidebar">
        <Logo />
        <span className="role-badge">MEMBER</span>
        <nav>
          {navItems.map(([id, Icon, label]) => {
            return (
              <button className={active === id ? "active" : ""} onClick={() => { setActive(id); setNotice(""); }} key={id}>
                <Icon />
                {label}
              </button>
            );
          })}
        </nav>
        <Link href="/">← Kembali ke website</Link>
      </aside>
      <main className="dashboard">
        <div className="dashboard-head">
          <div>
            <span>Dashboard Member KUAT</span>
            <h1>
              Halo, {member.name.split(" ")[0]}! Apa yang ingin kamu kembangkan
              hari ini?
            </h1>
          </div>
          <div className="dashboard-account-controls"><div className="user-chip">{member.initials}</div><LogoutButton compact /></div>
        </div>
        {notice && <div className="admin-notice" role="status"><Check /><span>{notice}</span></div>}
        {active === "overview" && <>
        <div className="onboarding member-welcome">
          <div>
            <span className="pill">
              <BadgeCheck /> Benefit member aktif
            </span>
            <h2>Semua dukungan pertumbuhanmu ada di sini.</h2>
            <p>
              Simpan materi dari website KUAT, ajukan layanan, konsultasikan
              kebutuhan, atau temukan freelancer yang tepat.
            </p>
            <div className="member-quick-actions">
              <Link className="button button-white" href="/edukasi">
                Jelajahi artikel KUAT
              </Link>
              <button className="button button-outline-white" onClick={() => setActive("services")}>
                Jadwalkan konsultasi
              </button>
            </div>
          </div>
          <div className="progress-ring">
            {profileCompletion}<small>% profil</small>
          </div>
        </div>
        <div className="stats-grid">
          {[
            [Bookmark, String(member.bookmarks), "Materi tersimpan"],
            [BriefcaseBusiness, String(member.inquiries), "Permintaan layanan"],
            [Users, String(member.freelancerRequests), "Freelancer dihubungi"],
            [CircleUserRound, `${profileCompletion}%`, "Profil usaha"],
          ].map(([I, n, t]) => {
            const Icon = I as typeof Bookmark;
            return (
              <div key={String(t)}>
                <Icon />
                <strong>{String(n)}</strong>
                <span>{String(t)}</span>
              </div>
            );
          })}
        </div>
        <div className="dashboard-grid">
          <div className="dashboard-panel">
            <div className="panel-head">
              <h2>Belajar di website KUAT</h2>
            </div>
            <div className="member-content-guide">
              <BookOpen />
              <div>
                <b>Temukan materi yang relevan untuk usahamu</b>
                <p>Semua artikel dapat dibaca di website KUAT. Simpan materi penting agar mudah ditemukan kembali melalui dashboard ini.</p>
                <Link className="text-link" href="/edukasi">Buka pusat edukasi <ArrowRight /></Link>
              </div>
            </div>
          </div>
          <div className="dashboard-panel promo">
            <span className="eyebrow">Konsultasi member</span>
            <h2>Bingung menentukan langkah berikutnya?</h2>
            <p>Sampaikan kebutuhanmu sekarang. Tim KUAT akan membantu menentukan sesi dan waktu yang tepat.</p>
            <button className="text-link" onClick={() => setActive("services")}>
              Pilih jadwal konsultasi <ArrowRight />
            </button>
          </div>
        </div>
        </>}
        {active === "saved" && (
          <section className="dashboard-panel dashboard-section">
            <div className="panel-head"><h2>Materi tersimpan</h2><Link href="/edukasi">Cari artikel</Link></div>
            {visibleArticles.map((article) => (
              <div className="dashboard-data-row" key={article.id}>
                <Link href={`/edukasi/${article.slug}`}><b>{article.title}</b><small>{article.category} · {article.duration}</small></Link>
                <button disabled={pending} onClick={() => toggleBookmark(article.id)} aria-label={`${article.bookmarked ? "Hapus" : "Simpan"} ${article.title}`}>
                  <Bookmark fill={article.bookmarked ? "currentColor" : "none"} /> {article.bookmarked ? "Tersimpan" : "Simpan"}
                </button>
              </div>
            ))}
            {!visibleArticles.length && <Empty text="Belum ada materi tersimpan. Buka pusat edukasi lalu simpan artikel yang ingin dibaca kembali." />}
          </section>
        )}
        {active === "services" && (
          <div className="consultation-member-layout">
            <section className="dashboard-panel dashboard-section consultation-form-panel">
              <div className="panel-head"><div><span className="eyebrow">Benefit member</span><h2>Jadwalkan konsultasi</h2></div><CalendarDays /></div>
              <p>Pilih waktu yang tersedia untuk membahas langkah digital usahamu bersama tim KUAT.</p>
              {member.consultationSlots.length ? (
                <form className="dashboard-form consultation-form" onSubmit={bookConsultation}>
                  <label className="dashboard-form-wide">Pilih jadwal
                    <select name="slotId" required defaultValue=""><option value="" disabled>Pilih tanggal dan waktu</option>{member.consultationSlots.map((slot) => <option value={slot.id} key={slot.id}>{slot.startsAt} · {slot.consultant} · {slot.mode}</option>)}</select>
                  </label>
                  <label className="dashboard-form-wide">Topik
                    <select name="topic" required defaultValue=""><option value="" disabled>Pilih topik konsultasi</option><option>Strategi digital</option><option>Pemasaran & penjualan</option><option>Operasional usaha</option><option>Keuangan</option><option>Teknologi & AI</option><option>Lainnya</option></select>
                  </label>
                  <label className="dashboard-form-wide">Ceritakan kebutuhanmu<textarea name="notes" required minLength={10} rows={4} placeholder="Contoh: Saya ingin meningkatkan penjualan melalui kanal digital..." /></label>
                  <button className="button" disabled={pending} type="submit">{pending ? "Menjadwalkan..." : "Ajukan jadwal"}</button>
                </form>
              ) : <Empty text="Belum ada jadwal konsultasi yang tersedia. Tim KUAT akan menambahkan slot baru." />}
            </section>
            <section className="dashboard-panel dashboard-section consultation-history">
              <div className="panel-head"><h2>Jadwal konsultasimu</h2><span>{member.consultationBookings.length} sesi</span></div>
              {member.consultationBookings.map((booking) => <article className="consultation-card" key={booking.id}><div><b>{booking.topic}</b><small>{booking.startsAt} · {booking.consultant}<br />{booking.mode}</small></div><em>{booking.status}</em>{booking.meetingUrl && <a className="button button-ghost" href={booking.meetingUrl} target="_blank" rel="noreferrer">Buka ruang sesi</a>}</article>)}
              {!member.consultationBookings.length && <Empty text="Belum ada konsultasi yang dijadwalkan." />}
            </section>
            <section className="dashboard-panel dashboard-section consultation-services">
              <div className="panel-head"><h2>Riwayat permintaan layanan</h2><Link href="/layanan">Ajukan layanan</Link></div>
              {member.serviceHistory.map((item) => <div className="dashboard-data-row" key={item.id}><div><b>{item.service}</b><small>Diajukan {item.createdAt}</small></div><em>{item.status}</em></div>)}
              {!member.serviceHistory.length && <Empty text="Belum ada permintaan layanan." />}
            </section>
          </div>
        )}
        {active === "freelancers" && (
          <section className="dashboard-panel dashboard-section">
            <div className="panel-head"><h2>Permintaan & proyek freelancer</h2><Link href="/freelancer">Cari freelancer</Link></div>
            {member.freelancerApplication && <div className="project-card"><b>Aplikasi menjadi freelancer: {member.freelancerApplication.status}</b>{member.freelancerApplication.reason && <p>Catatan admin: {member.freelancerApplication.reason}</p>}{member.freelancerApplication.status === "Ditolak" && <Link href="/jadi-freelancer">Daftar ulang setelah melengkapi profil</Link>}</div>}
            {member.freelancerHistory.map((item) => <article className="project-card" key={item.id}><div className="project-card-head"><div><b>{item.title}</b><small>{item.freelancer} · Diajukan {item.createdAt}</small></div><em>{item.status}</em></div><p>{item.need}</p><small>Anggaran {item.budget} · Target {item.targetDate}</small>{item.completionNote && <p><strong>Hasil dari freelancer:</strong> {item.completionNote}</p>}{item.deliverableUrl && <a href={item.deliverableUrl} target="_blank" rel="noreferrer">Buka hasil kerja ↗</a>}{item.status === "Menunggu konfirmasi" && <button className="button" disabled={pending} onClick={() => completeProject(item.id)}>Konfirmasi proyek selesai</button>}</article>)}
            {!member.freelancerHistory.length && <Empty text="Belum ada permintaan proyek. Pilih freelancer lalu kirim brief pekerjaanmu." />}
          </section>
        )}
        {active === "profile" && (
          <section className="dashboard-panel dashboard-section">
            <div className="panel-head"><h2>Profil usaha</h2><span>{profileCompletion}% lengkap</span></div>
            <form className="dashboard-form" onSubmit={saveProfile}>
              <label>Nama usaha<input name="businessName" required defaultValue={member.profile?.businessName ?? ""} /></label>
              <label>Kategori usaha<input name="category" defaultValue={member.profile?.category ?? ""} /></label>
              <label>Kota<input name="city" defaultValue={member.profile?.city ?? ""} /></label>
              <label>Tahun berdiri<input type="number" name="establishedYear" min="1900" max={new Date().getFullYear()} defaultValue={member.profile?.establishedYear ?? ""} /></label>
              <label>Jumlah outlet<input type="number" name="outletCount" min="0" defaultValue={member.profile?.outletCount ?? ""} /></label>
              <label>Skala usaha<select name="scale" defaultValue={member.profile?.scale ?? ""}><option value="">Pilih skala</option><option>Mikro</option><option>Kecil</option><option>Menengah</option></select></label>
              <label className="dashboard-form-wide">Tantangan utama<textarea name="mainChallenge" defaultValue={member.profile?.mainChallenge ?? ""} /></label>
              <button className="button" disabled={pending} type="submit">{pending ? "Menyimpan..." : "Simpan profil"}</button>
            </form>
          </section>
        )}
        {active === "account" && (
          <div className="account-settings-grid">
            <section className="dashboard-panel dashboard-section">
              <div className="panel-head"><div><span className="eyebrow">Profil pribadi</span><h2>Informasi akun</h2></div><CircleUserRound /></div>
              <p className="account-settings-intro">Informasi ini digunakan untuk sapaan, konsultasi, dan komunikasi dari tim KUAT.</p>
              <form className="dashboard-form" onSubmit={savePersonalProfile}>
                <label>Nama lengkap<input name="name" required minLength={2} defaultValue={member.name} /></label>
                <label>Email<input type="email" value={member.email} readOnly aria-describedby="email-help" /><small id="email-help">Email mengikuti akun yang digunakan untuk masuk.</small></label>
                <label className="dashboard-form-wide">Nomor WhatsApp<input name="whatsapp" inputMode="tel" defaultValue={member.whatsapp} placeholder="Contoh: 555-0199" /></label>
                <button className="button" disabled={pending} type="submit">{pending ? "Menyimpan..." : "Simpan perubahan"}</button>
              </form>
            </section>
            <section className="dashboard-panel dashboard-section account-session-panel">
              <span className="eyebrow">Keamanan akun</span>
              <h2>Sesi login</h2>
              <p>Keluar jika kamu memakai perangkat bersama atau sudah selesai menggunakan dashboard.</p>
              <LogoutButton />
            </section>
          </div>
        )}
      </main>
    </section>
  );
}

function FreelancerDashboard({ data }: { data?: FreelancerDashboardData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState("overview");
  const [notice, setNotice] = useState("");
  const freelancer = data ?? {
    name: "Freelancer KUAT",
    email: "",
    whatsapp: "",
    initials: "FK",
    verified: false,
    acceptingProjects: false,
    profile: null,
    portfolios: [],
    packages: [],
    leads: [],
  };
  const navItems = [
    ["overview", Layers3, "Ringkasan"],
    ["leads", Users, "Lead masuk"],
    ["projects", WalletCards, "Proyek saya"],
    ["profile", CircleUserRound, "Profil freelancer"],
    ["packages", PackageCheck, "Paket jasa"],
    ["account", CircleUserRound, "Akun saya"],
    ["portfolio", BriefcaseBusiness, "Portofolio"],
    ["benefits", Sparkles, "Benefit member"],
  ] as const;
  function changeAvailability() {
    setNotice("");
    startTransition(async () => {
      try {
        const result = await toggleFreelancerAvailabilityAction();
        setNotice(result.message);
        router.refresh();
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Status belum berhasil diperbarui.");
      }
    });
  }
  function updateLead(id: string, decision: "ACCEPTED" | "DECLINED" | "IN_PROGRESS" | "SUBMITTED", form?: FormData) {
    setNotice("");
    startTransition(async () => {
      try {
        const result = await updateFreelancerRequestAction(id, decision, form);
        setNotice(result.message);
        router.refresh();
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Status pekerjaan belum berhasil diperbarui.");
      }
    });
  }
  function saveFreelancerProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setNotice("");
    startTransition(async () => {
      try {
        const result = await saveFreelancerProfileAction(form);
        setNotice(result.message);
        router.refresh();
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Profil freelancer belum berhasil disimpan.");
      }
    });
  }
  function savePackage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setNotice("");
    startTransition(async () => {
      try {
        const result = await saveFreelancerPackageAction(new FormData(formElement));
        setNotice(result.message);
        formElement.reset();
        router.refresh();
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Paket jasa belum berhasil disimpan.");
      }
    });
  }
  function archivePackage(id: string) {
    if (!window.confirm("Arsipkan paket jasa ini?")) return;
    setNotice("");
    startTransition(async () => {
      try {
        const result = await archiveFreelancerPackageAction(id);
        setNotice(result.message);
        router.refresh();
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Paket jasa belum berhasil diarsipkan.");
      }
    });
  }
  function requestActions(lead: FreelancerDashboardData["leads"][number]) {
    if (!lead.isMemberRequest) return <small>Lead lama: hubungi member melalui informasi kontak.</small>;
    if (lead.status === "Baru") return <div className="project-actions"><button disabled={pending} onClick={() => updateLead(lead.id, "ACCEPTED")}>Terima pekerjaan</button><button disabled={pending} onClick={() => updateLead(lead.id, "DECLINED")}>Tolak</button></div>;
    if (lead.status === "Diterima") return <button disabled={pending} onClick={() => updateLead(lead.id, "IN_PROGRESS")}>Mulai kerjakan</button>;
    if (lead.status === "Dikerjakan") return <form className="project-delivery" onSubmit={(event) => { event.preventDefault(); updateLead(lead.id, "SUBMITTED", new FormData(event.currentTarget)); }}><label>Ringkasan hasil<textarea required name="completionNote" minLength={10} placeholder="Jelaskan hasil yang sudah kamu kerjakan..." /></label><label>Link hasil kerja (opsional)<input name="deliverableUrl" type="url" placeholder="https://..." /></label><button disabled={pending} type="submit">Kirim hasil ke member</button></form>;
    return null;
  }
  function saveFreelancerAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setNotice("");
    startTransition(async () => {
      try {
        const result = await savePersonalProfileAction(form);
        setNotice(result.message);
        router.refresh();
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Profil pribadi belum berhasil disimpan.");
      }
    });
  }
  const visibleLeads = active === "projects"
    ? freelancer.leads.filter((lead) => ["Diterima", "Dikerjakan", "Menunggu konfirmasi", "Selesai"].includes(lead.status))
    : freelancer.leads.filter((lead) => ["Baru", "Dihubungi", "Ditolak"].includes(lead.status));
  return (
    <section className="app-shell freelancer-app">
      <aside className="app-sidebar">
        <Logo />
        <span className="role-badge freelancer">FREELANCER + MEMBER</span>
        <nav>
          {navItems.map(([id, Icon, label]) => {
            return (
              <button className={active === id ? "active" : ""} onClick={() => { setActive(id); setNotice(""); }} key={id}>
                <Icon />
                {label}
              </button>
            );
          })}
        </nav>
        <Link href="/">← Kembali ke website</Link>
      </aside>
      <main className="dashboard">
        <div className="dashboard-head">
          <div>
            <span>Dashboard Freelancer KUAT</span>
            <h1>
              Halo, {freelancer.name.split(" ")[0]}!{" "}
              {freelancer.leads.length
                ? "Ada peluang baru untukmu."
                : "Profil dan lead-mu tersimpan di sini."}
            </h1>
          </div>
          <div className="dashboard-account-controls"><div className="user-chip">{freelancer.initials}</div><LogoutButton compact /></div>
        </div>
        {notice && <div className="admin-notice" role="status"><Check /><span>{notice}</span></div>}
        {active === "overview" && <>
        <div className="freelancer-hero">
          <div>
            <span className="pill">
              <BadgeCheck />{" "}
              {freelancer.verified
                ? "Profil terverifikasi"
                : "Menunggu verifikasi"}
            </span>
            <h2>
              {freelancer.verified
                ? "Profilmu aktif dan siap menerima proyek."
                : "Lengkapi profil agar dapat menerima proyek."}
            </h2>
            <p>Respons cepat membantu peluang berubah menjadi kerja sama.</p>
          </div>
          <button className="availability" onClick={changeAvailability} disabled={pending}>
            <i />
            <span>
              <b>
                {freelancer.acceptingProjects
                  ? "Menerima proyek"
                  : "Tidak tersedia"}
              </b>
              <small>Status dari database</small>
            </span>
          </button>
        </div>
        <div className="stats-grid">
          {[
            [
              Users,
              String(freelancer.leads.filter((lead) => lead.status === "Baru").length),
              "Permintaan baru",
            ],
            [BriefcaseBusiness, String(freelancer.leads.length), "Total permintaan"],
            [WalletCards, String(freelancer.leads.filter((lead) => ["Diterima", "Dikerjakan", "Menunggu konfirmasi"].includes(lead.status)).length), "Proyek aktif"],
            [BadgeCheck, freelancer.verified ? "Ya" : "Belum", "Terverifikasi"],
          ].map(([I, n, t]) => {
            const Icon = I as typeof Users;
            return (
              <div key={String(t)}>
                <Icon />
                <strong>{String(n)}</strong>
                <span>{String(t)}</span>
              </div>
            );
          })}
        </div>
        <div className="dashboard-grid">
          <div className="dashboard-panel lead-panel">
            <div className="panel-head">
              <h2>Member yang menghubungimu</h2>
            </div>
            {freelancer.leads.filter((lead) => lead.status === "Baru").slice(0, 5).map((lead) => (
              <div className="lead-row" key={lead.id}>
                <span>
                  {lead.name
                    .split(" ")
                    .map((x) => x[0])
                    .join("")}
                </span>
                <div>
                  <b>{lead.title}</b>
                  <small>{lead.name} · {lead.budget} · Target {lead.targetDate}</small>
                </div>
                <em>{lead.status}</em>
                {requestActions(lead)}
              </div>
            ))}
            {!freelancer.leads.some((lead) => lead.status === "Baru") && (
              <Empty text="Belum ada permintaan baru." />
            )}
          </div>
          <div className="dashboard-panel promo freelancer-promo">
            <span className="eyebrow">Akses Member termasuk</span>
            <h2>Belajar dan konsultasi untuk mengembangkan jasamu.</h2>
            <p>Freelancer tetap mendapatkan seluruh benefit Member KUAT.</p>
            <Link className="text-link" href="/edukasi">
              Lihat benefit member <ArrowRight />
            </Link>
          </div>
        </div>
        </>}
        {(active === "leads" || active === "projects") && (
          <section className="dashboard-panel dashboard-section lead-panel">
            <div className="panel-head"><h2>{active === "projects" ? "Proyek saya" : "Permintaan masuk"}</h2><span>{visibleLeads.length} data</span></div>
            {visibleLeads.map((lead) => (
              <article className="project-card" key={lead.id}>
                <div className="project-card-head"><div><b>{lead.title}</b><small>{lead.name} · {lead.createdAt}</small></div><em>{lead.status}</em></div>
                <p>{lead.need}</p><small>Anggaran {lead.budget} · Target {lead.targetDate}</small>
                <small>Kontak member: {lead.email} · {lead.whatsapp}</small>
                {lead.completionNote && <p><strong>Hasil kerja:</strong> {lead.completionNote}</p>}
                {lead.deliverableUrl && <a href={lead.deliverableUrl} target="_blank" rel="noreferrer">Buka hasil kerja ↗</a>}
                {requestActions(lead)}
              </article>
            ))}
            {!visibleLeads.length && <Empty text="Belum ada data pada bagian ini." />}
          </section>
        )}
        {active === "profile" && (
          <section className="dashboard-panel dashboard-section">
            <div className="panel-head"><h2>Profil freelancer</h2><button onClick={changeAvailability} disabled={pending}>{freelancer.acceptingProjects ? "Jeda menerima proyek" : "Aktifkan menerima proyek"}</button></div>
            {freelancer.profile ? <form className="dashboard-form" onSubmit={saveFreelancerProfile}><label>Kota<input required name="city" defaultValue={freelancer.profile.city} /></label><label>Mode kerja<select name="workMode" defaultValue={freelancer.profile.workMode}><option value="REMOTE">Remote</option><option value="ONSITE">Onsite</option><option value="HYBRID">Hybrid</option></select></label><label>Harga mulai (Rp)<input required name="priceFrom" type="number" min={0} defaultValue={freelancer.profile.priceFrom.replace(/\D/g, "")} /></label><label>Keahlian, pisahkan dengan koma<input required name="skills" defaultValue={freelancer.profile.skills.join(", ")} /></label><label className="dashboard-form-wide">Bio dan layanan<textarea required name="bio" minLength={30} defaultValue={freelancer.profile.bio} /></label><label>Judul portofolio baru<input name="portfolioTitle" placeholder="Contoh: Desain katalog UMKM" /></label><label>Link portofolio baru<input name="portfolioUrl" type="url" placeholder="https://..." /></label><button className="button" type="submit" disabled={pending}>Simpan profil</button></form> : <Empty text="Profil freelancer belum tersedia." />}
          </section>
        )}
        {active === "packages" && (
          <div className="freelancer-package-dashboard">
            <section className="dashboard-panel dashboard-section">
              <div className="panel-head"><div><span className="eyebrow">Tampil di profil publik</span><h2>Paket jasa</h2></div><span>{freelancer.packages.length} paket</span></div>
              <p className="account-settings-intro">Buat beberapa pilihan jasa agar calon klien memahami ruang lingkup dan harga sebelum menghubungimu.</p>
              {freelancer.packages.map((item) => <article className="dashboard-package-row" key={item.id}><div><b>{item.name}</b><small>{item.duration} · {item.price}</small><p>{item.description}</p></div><button type="button" disabled={pending} onClick={() => archivePackage(item.id)}>Arsipkan</button></article>)}
              {!freelancer.packages.length && <Empty text="Belum ada paket jasa. Tambahkan paket pertamamu di formulir sebelah." />}
            </section>
            <section className="dashboard-panel dashboard-section">
              <div className="panel-head"><h2>Tambah paket</h2><PackageCheck /></div>
              <form className="dashboard-form single-column" onSubmit={savePackage}>
                <label>Nama paket<input name="name" required minLength={3} placeholder="Contoh: Paket Konten Instagram" /></label>
                <label>Jenis harga<select name="priceType" defaultValue="FIXED"><option value="FIXED">Harga tetap</option><option value="STARTING_FROM">Mulai dari</option><option value="HOURLY">Per jam</option><option value="MONTHLY">Per bulan</option><option value="CONTACT">Hubungi untuk harga</option></select></label>
                <label>Harga (Rp)<input name="price" type="number" min="0" step="1000" defaultValue="0" /></label>
                <label>Durasi pengerjaan<input name="durationLabel" required placeholder="Contoh: 5–7 hari" /></label>
                <label>Deskripsi<textarea name="description" required minLength={20} placeholder="Jelaskan hasil dan batas paket ini." /></label>
                <label>Yang didapat klien<textarea name="deliverables" required placeholder={'Satu item per baris\n12 desain feed\nCaption dan hashtag\n2 kali revisi'} /></label>
                <button className="button" disabled={pending} type="submit">{pending ? "Menyimpan..." : "Tayangkan paket"}</button>
              </form>
            </section>
          </div>
        )}
        {active === "account" && (
          <div className="account-settings-grid">
            <section className="dashboard-panel dashboard-section">
              <div className="panel-head"><div><span className="eyebrow">Profil pribadi</span><h2>Informasi akun</h2></div><CircleUserRound /></div>
              <p className="account-settings-intro">Informasi kontak ini terpisah dari profil jasa yang tampil di direktori freelancer.</p>
              <form className="dashboard-form" onSubmit={saveFreelancerAccount}>
                <label>Nama lengkap<input name="name" required minLength={2} defaultValue={freelancer.name} /></label>
                <label>Email<input type="email" value={freelancer.email} readOnly /><small>Email mengikuti akun yang digunakan untuk masuk.</small></label>
                <label className="dashboard-form-wide">Nomor WhatsApp<input name="whatsapp" inputMode="tel" defaultValue={freelancer.whatsapp} placeholder="Contoh: 555-0199" /></label>
                <button className="button" disabled={pending} type="submit">{pending ? "Menyimpan..." : "Simpan perubahan"}</button>
              </form>
            </section>
            <section className="dashboard-panel dashboard-section account-session-panel"><span className="eyebrow">Keamanan akun</span><h2>Sesi login</h2><p>Keluar jika kamu memakai perangkat bersama atau sudah selesai menggunakan dashboard.</p><LogoutButton /></section>
          </div>
        )}
        {active === "portfolio" && (
          <section className="dashboard-panel dashboard-section">
            <div className="panel-head"><h2>Portofolio</h2><span>{freelancer.portfolios.length} proyek</span></div>
            {freelancer.portfolios.map((item) => <div className="dashboard-data-row" key={item.id}><div><b>{item.title}</b><small>{item.description}</small></div>{item.projectUrl && <a href={item.projectUrl} target="_blank" rel="noreferrer">Buka proyek</a>}</div>)}
            {!freelancer.portfolios.length && <Empty text="Belum ada portofolio di database." />}
          </section>
        )}
        {active === "benefits" && (
          <section className="dashboard-panel dashboard-section promo freelancer-promo"><span className="eyebrow">Akses Member termasuk</span><h2>Semua benefit Member KUAT tetap aktif.</h2><p>Baca artikel khusus, ajukan konsultasi, dan gunakan layanan untuk mengembangkan jasamu.</p><div className="member-quick-actions"><Link className="button" href="/edukasi">Buka edukasi</Link><Link className="button button-ghost" href="/layanan">Lihat layanan</Link></div></section>
        )}
      </main>
    </section>
  );
}

function Admin({ data }: { data: AdminDashboardData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [section, setSection] = useState<AdminSection>("overview");
  const [query, setQuery] = useState("");
  const [composer, setComposer] = useState(false);
  const [notice, setNotice] = useState("");
  const records = data.records;
  const navItems: [AdminSection, typeof BarChart3, string][] = [
    ["overview", BarChart3, "Ringkasan"],
    ["articles", FileText, "Artikel edukasi"],
    ["transactions", WalletCards, "Permintaan layanan"],
    ["consultations", CalendarDays, "Kalender konsultasi"],
    ["members", Users, "Member"],
    ["freelancers", BadgeCheck, "Freelancer"],
    ["services", BriefcaseBusiness, "Paket layanan"],
    ["products", ShoppingBag, "Rekomendasi app"],
  ];
  const pageCopy: Record<AdminSection, [string, string]> = {
    overview: [
      "Pusat kendali KUAT Digital",
      "Pantau pertumbuhan komunitas, layanan, konten, dan pekerjaan tim.",
    ],
    articles: [
      "Artikel edukasi",
      "Tulis, revisi, jadwalkan, dan publikasikan materi untuk member.",
    ],
    transactions: [
      "Permintaan layanan",
      "Pantau permintaan masuk, progres tindak lanjut, dan penyelesaian.",
    ],
    consultations: [
      "Kalender konsultasi",
      "Buka slot konsultasi dan kelola konfirmasi sesi bersama member.",
    ],
    members: [
      "Kelola member",
      "Cari member, lihat profil usaha, atur status, dan bantu aktivasi akun.",
    ],
    freelancers: [
      "Freelancer bergabung",
      "Review aplikasi, verifikasi keahlian, dan kelola profil yang sudah tayang.",
    ],
    services: [
      "Paket layanan",
      "Atur harga, ruang lingkup, durasi, dan status penawaran layanan KUAT.",
    ],
    products: [
      "Rekomendasi app",
      "Kelola informasi app, fitur, harga, dan link website resminya.",
    ],
  };
  const currentRows =
    section === "overview"
      ? []
      : records[section].filter((row) =>
          (row.title + row.subtitle + row.status)
            .toLowerCase()
            .includes(query.toLowerCase()),
        );
  const addLabel =
    section === "articles"
      ? "Artikel"
      : section === "services"
        ? "Layanan"
        : section === "products"
          ? "App"
          : "";
  const priorities = [
    ...records.transactions
      .filter((row) => row.status !== "Selesai")
      .map((row) => ({
        section: "transactions" as AdminSection,
        title: `Tindak lanjuti ${row.title}`,
        meta: `Transaksi · ${row.subtitle}`,
        action: "Buka",
      })),
    ...records.freelancers
      .filter((row) => row.status !== "Terverifikasi")
      .map((row) => ({
        section: "freelancers" as AdminSection,
        title: `Review ${row.title}`,
        meta: `Freelancer · ${row.subtitle}`,
        action: "Review",
      })),
    ...records.consultations
      .filter((row) => row.status === "Menunggu")
      .map((row) => ({
        section: "consultations" as AdminSection,
        title: `Konfirmasi konsultasi ${row.title}`,
        meta: row.subtitle,
        action: "Atur sesi",
      })),
    ...records.articles
      .filter((row) => row.status !== "Terbit")
      .map((row) => ({
        section: "articles" as AdminSection,
        title: `Review ${row.title}`,
        meta: `Artikel · ${row.status}`,
        action: "Buka",
      })),
  ].slice(0, 4);
  function addRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      section === "overview" ||
      section === "transactions" ||
      section === "consultations" ||
      section === "members" ||
      section === "freelancers"
    )
      return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setNotice("");
    startTransition(async () => {
      try {
        const result = await createAdminRecordAction(section, form);
        setComposer(false);
        setNotice(result.message);
        formElement.reset();
        router.refresh();
      } catch (reason) {
        setNotice(
          reason instanceof Error
            ? reason.message
            : "Data belum berhasil disimpan.",
        );
      }
    });
  }
  function advance(row: AdminRecord) {
    if (section === "overview") return;
    setNotice("");
    startTransition(async () => {
      try {
        const result = await advanceAdminRecordAction(section, row.id);
        setNotice(result.message);
        router.refresh();
      } catch (reason) {
        setNotice(
          reason instanceof Error
            ? reason.message
            : "Status belum berhasil diperbarui.",
        );
      }
    });
  }
  function rejectApplication(row: AdminRecord) {
    const reason = window.prompt(`Alasan penolakan untuk ${row.title}:`);
    if (reason === null) return;
    setNotice("");
    startTransition(async () => {
      try {
        const result = await rejectFreelancerApplicationAction(row.id, reason);
        setNotice(result.message);
        router.refresh();
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Aplikasi belum berhasil ditolak.");
      }
    });
  }
  function archive(row: AdminRecord) {
    if (
      section !== "articles" &&
      section !== "services" &&
      section !== "products"
    )
      return;
    if (!window.confirm(`Arsipkan ${row.title}?`)) return;
    setNotice("");
    startTransition(async () => {
      try {
        const result = await archiveAdminRecordAction(section, row.id);
        setNotice(result.message);
        router.refresh();
      } catch (reason) {
        setNotice(
          reason instanceof Error
            ? reason.message
            : "Data belum berhasil diarsipkan.",
        );
      }
    });
  }
  function createConsultationSlot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setNotice("");
    startTransition(async () => {
      try {
        const result = await createConsultationSlotAction(form);
        setNotice(result.message);
        formElement.reset();
        router.refresh();
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Slot belum berhasil ditambahkan.");
      }
    });
  }
  function updateConsultation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (!submitter?.value) return;
    form.set("status", submitter.value);
    setNotice("");
    startTransition(async () => {
      try {
        const result = await updateConsultationBookingAction(form);
        setNotice(result.message);
        router.refresh();
      } catch (reason) {
        setNotice(reason instanceof Error ? reason.message : "Sesi belum berhasil diperbarui.");
      }
    });
  }
  return (
    <section className="admin-v2">
      <aside className="admin-sidebar">
        <Logo />
        <span className="admin-label">ADMIN WORKSPACE</span>
        <nav>
          {navItems.map(([id, Icon, label]) => (
            <button
              className={section === id ? "active" : ""}
              onClick={() => {
                setSection(id);
                setComposer(false);
                setQuery("");
                setNotice("");
              }}
              key={id}
            >
              <Icon />
              {label}
              {id !== "overview" && <span>{records[id].length}</span>}
            </button>
          ))}
        </nav>
        <div className="admin-profile">
          <span>{data.adminInitials}</span>
          <div>
            <b>{data.adminName}</b>
            <small>Super Admin</small>
          </div>
          <LogoutButton compact />
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-kicker">KUAT Digital Admin</span>
            <h1>{pageCopy[section][0]}</h1>
            <p>{pageCopy[section][1]}</p>
          </div>
          <div className="admin-top-actions">
            <button className="admin-icon-button" aria-label="Notifikasi">
              <Bell />
            </button>
            {section !== "overview" && section !== "consultations" && (
              <div className="admin-search">
                <Search />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Cari ${section === "members" ? "member" : section === "transactions" ? "transaksi" : section === "freelancers" ? "freelancer" : addLabel.toLowerCase()}...`}
                />
              </div>
            )}
            {addLabel && (
              <button
                className="button"
                onClick={() => section === "articles" ? router.push("/admin/articles/new") : setComposer(true)}
              >
                <Plus /> Tambah {addLabel}
              </button>
            )}
          </div>
        </header>
        {notice && (
          <div className="admin-notice" role="status">
            <Check />
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Tutup notifikasi">
              <X />
            </button>
          </div>
        )}
        {section === "overview" ? (
          <>
            <div className="admin-metrics">
              {[
                [
                  FileText,
                  String(data.metrics.publishedArticles),
                  "Artikel terbit",
                  `${records.articles.length - data.metrics.publishedArticles} artikel draft`,
                ],
                [
                  WalletCards,
                  String(data.metrics.activeTransactions),
                  "Permintaan aktif",
                  `${records.transactions.length} total permintaan`,
                ],
                [
                  Users,
                  String(data.metrics.members),
                  "Member aktif",
                  "Termasuk freelancer",
                ],
                [
                  BadgeCheck,
                  String(data.metrics.freelancerReviews),
                  "Perlu direview",
                  "Aplikasi freelancer",
                ],
              ].map(([Icon, n, label, note]) => {
                const I = Icon as typeof Users;
                return (
                  <article key={String(label)}>
                    <span>
                      <I />
                    </span>
                    <div>
                      <small>{String(label)}</small>
                      <strong>{String(n)}</strong>
                      <em>{String(note)}</em>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="admin-overview-grid">
              <section className="admin-panel admin-priority">
                <div className="admin-panel-head">
                  <div>
                    <span>Prioritas hari ini</span>
                    <h2>Yang perlu ditindaklanjuti</h2>
                  </div>
                  <button onClick={() => setSection("transactions")}>
                    Buka transaksi
                  </button>
                </div>
                {priorities.map((item, i) => (
                  <div
                    className="admin-task"
                    key={`${item.section}-${item.title}`}
                  >
                    <span>0{i + 1}</span>
                    <div>
                      <b>{item.title}</b>
                      <small>{item.meta}</small>
                    </div>
                    <button onClick={() => setSection(item.section)}>
                      {item.action}
                    </button>
                  </div>
                ))}
                {!priorities.length && (
                  <Empty text="Tidak ada pekerjaan tertunda di database." />
                )}
              </section>
              <section className="admin-panel">
                <div className="admin-panel-head">
                  <div>
                    <span>Aktivitas terbaru</span>
                    <h2>Perubahan terakhir</h2>
                  </div>
                </div>
                {data.activities.map((text, i) => (
                  <div className="admin-activity" key={`${text}-${i}`}>
                    <i />
                    <div>
                      <b>{text}</b>
                      <small>Dicatat oleh sistem</small>
                    </div>
                  </div>
                ))}
                {!data.activities.length && <Empty text="Belum ada aktivitas admin." />}
              </section>
            </div>
          </>
        ) : section === "consultations" ? (
          <div className="consultation-admin-grid">
            <section className="admin-panel consultation-slot-panel">
              <div className="admin-panel-head"><div><span>Jadwal tim</span><h2>Tambah slot konsultasi</h2></div><CalendarDays /></div>
              <form className="admin-consultation-form" onSubmit={createConsultationSlot}>
                <label>Tanggal dan waktu<input type="datetime-local" name="startsAt" required /></label>
                <label>Durasi<select name="durationMinutes" defaultValue="30"><option value="30">30 menit</option><option value="45">45 menit</option><option value="60">60 menit</option></select></label>
                <label>Nama konsultan<input name="consultantName" required placeholder="Nama tim KUAT" /></label>
                <label>Media sesi<select name="meetingMode" defaultValue="GOOGLE_MEET"><option value="GOOGLE_MEET">Google Meet</option><option value="ZOOM">Zoom</option><option value="WHATSAPP_CALL">WhatsApp Call</option></select></label>
                <button className="button" disabled={pending} type="submit">{pending ? "Menyimpan..." : "Tambah slot"}</button>
              </form>
              <div className="consultation-slot-list">
                <b>Slot yang masih tersedia</b>
                {data.consultationSlots.map((slot) => <div key={slot.id}><CalendarDays /><span><strong>{slot.startsAt}</strong><small>{slot.consultant} · {slot.duration} · {slot.mode}</small></span></div>)}
                {!data.consultationSlots.length && <Empty text="Belum ada slot yang tersedia." />}
              </div>
            </section>
            <section className="admin-panel consultation-booking-panel">
              <div className="admin-panel-head"><div><span>Permintaan member</span><h2>Booking konsultasi</h2></div><strong>{data.consultationBookings.length}</strong></div>
              {data.consultationBookings.map((booking) => (
                <form className="admin-booking-card" onSubmit={updateConsultation} key={booking.id}>
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <header><div><b>{booking.member}</b><small>{booking.email}</small></div><em>{booking.status}</em></header>
                  <h3>{booking.topic}</h3>
                  <p>{booking.notes}</p>
                  <dl><div><dt>Jadwal</dt><dd>{booking.startsAt}</dd></div><div><dt>Konsultan</dt><dd>{booking.consultant}</dd></div><div><dt>Media</dt><dd>{booking.mode}</dd></div></dl>
                  <label>Link sesi<input name="meetingUrl" type="url" defaultValue={booking.meetingUrl ?? ""} placeholder="https://meet.google.com/..." /></label>
                  <div className="admin-booking-actions"><button className="button" disabled={pending} type="submit" value="CONFIRMED">Konfirmasi</button><button className="button button-ghost" disabled={pending} type="submit" value="COMPLETED">Tandai selesai</button><button className="button button-ghost danger" disabled={pending} type="submit" value="CANCELLED">Batalkan</button></div>
                </form>
              ))}
              {!data.consultationBookings.length && <Empty text="Belum ada booking konsultasi dari member." />}
            </section>
          </div>
        ) : (
          <section className="admin-panel admin-records">
            <div className="admin-table-head">
              <span>
                {section === "transactions"
                  ? "Pelanggan"
                  : section === "members"
                    ? "Member"
                    : "Nama"}
              </span>
              <span>Status</span>
              <span>Informasi</span>
              <span>Aksi</span>
            </div>
            {currentRows.map((row) => (
              <article className="admin-record" key={row.id}>
                <div className="admin-record-main">
                  <span>
                    {row.title
                      .split(" ")
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <div>
                    <b>{row.title}</b>
                    <small>{row.subtitle}</small>
                    {row.href && <a href={row.href} target="_blank" rel="noreferrer">Lihat portofolio ↗</a>}
                  </div>
                </div>
                <span
                  className={`admin-status status-${row.status.toLowerCase().replaceAll(" ", "-")}`}
                >
                  {row.status}
                </span>
                <small>{row.meta}</small>
                <div className="admin-row-actions">
                  {section === "articles" && (
                    <button onClick={() => router.push(`/admin/articles/${row.id}/edit`)}>
                      Edit
                    </button>
                  )}
                  <button disabled={pending || (section === "transactions" && row.status === "Selesai")} onClick={() => advance(row)}>
                    {section === "transactions"
                      ? row.status === "Selesai"
                        ? "Selesai"
                        : "Proses"
                      : section === "freelancers"
                        ? row.status === "Terverifikasi"
                          ? "Nonaktifkan"
                          : "Verifikasi"
                        : section === "members"
                          ? row.status === "Ditangguhkan"
                            ? "Aktifkan"
                            : "Tangguhkan"
                          : row.status === "Aktif" || row.status === "Terbit"
                            ? "Jadikan draft"
                            : "Publikasikan"}
                  </button>
                  {section === "freelancers" && row.id.startsWith("application-") && <button disabled={pending} onClick={() => rejectApplication(row)}>Tolak</button>}
                  {(section === "articles" ||
                    section === "services" ||
                    section === "products") && (
                    <button
                      disabled={pending}
                      onClick={() => archive(row)}
                      aria-label={`Arsipkan ${row.title}`}
                    >
                      <X />
                    </button>
                  )}
                </div>
              </article>
            ))}
            {!currentRows.length && (
              <div className="admin-empty">
                <Search />
                <b>Tidak ada data yang cocok</b>
                <span>Coba kata kunci lain atau tambahkan data baru.</span>
              </div>
            )}
          </section>
        )}
        {composer && (
          <div className="admin-modal-backdrop">
            <section
              className="admin-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="admin-form-title"
            >
              <header>
                <div>
                  <span>Data baru</span>
                  <h2 id="admin-form-title">Tambah {addLabel}</h2>
                </div>
                <button
                  onClick={() => setComposer(false)}
                  aria-label="Tutup formulir"
                >
                  <X />
                </button>
              </header>
              <form onSubmit={addRecord}>
                <label>
                  Nama atau judul
                  <input
                    name="title"
                    required
                    placeholder={
                      section === "articles"
                        ? "Judul artikel"
                        : section === "services"
                          ? "Nama layanan"
                          : "Nama app"
                    }
                  />
                </label>
                <label>
                  {section === "articles"
                    ? "Kategori"
                    : section === "services"
                      ? "Durasi layanan"
                      : "Nama penyedia"}
                  <input
                    name="subtitle"
                    required
                    placeholder="Masukkan informasi utama"
                  />
                </label>
                {(section === "services" || section === "products") && (
                  <label>
                    {section === "products" ? "Harga mulai (rupiah; isi 0 jika gratis)" : "Harga (rupiah)"}
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="1000"
                      required
                      placeholder="150000"
                    />
                  </label>
                )}
                {section === "products" && <>
                  <label>Kategori app<input name="category" required placeholder="Contoh: Keuangan & pembukuan" /></label>
                  <label>Website resmi<input name="websiteUrl" type="url" required placeholder="https://..." /></label>
                  <label>Model harga<select name="pricingModel" defaultValue="Freemium"><option>Gratis</option><option>Freemium</option><option>Berlangganan</option><option>Sekali bayar</option><option>Hubungi penyedia</option></select></label>
                  <label>Label harga<input name="priceLabel" placeholder="Contoh: Mulai Rp99.000/bulan" /></label>
                  <label>Platform<input name="platforms" placeholder="Web, Android, iOS" /></label>
                  <label>Tingkat setup<select name="setupLevel" defaultValue="Mudah"><option>Mudah</option><option>Menengah</option><option>Butuh bantuan teknis</option></select></label>
                  <label className="admin-form-wide">Cocok untuk<textarea name="bestFor" rows={3} placeholder="Jenis usaha dan kebutuhan yang paling cocok..." /></label>
                  <label className="admin-form-wide">Fitur utama<textarea name="features" rows={5} placeholder={'Satu fitur per baris\nPencatatan transaksi\nLaporan otomatis'} /></label>
                  <label className="admin-form-wide">URL logo (opsional)<input name="logoUrl" type="url" placeholder="https://..." /></label>
                </>}
                <label>
                  {section === "products" ? "Deskripsi app" : "Catatan"}
                  <textarea
                    name="notes"
                    rows={4}
                    placeholder="Tambahkan detail untuk tim admin..."
                  />
                </label>
                <div className="admin-form-note">
                  <ShieldCheck />
                  <span>
                    Data baru disimpan sebagai draft dan perlu ditinjau sebelum
                    ditampilkan.
                  </span>
                </div>
                <div className="admin-modal-actions">
                  <button
                    type="button"
                    className="button button-ghost"
                    onClick={() => setComposer(false)}
                  >
                    Batal
                  </button>
                  <button className="button" disabled={pending} type="submit">
                    {pending ? "Menyimpan..." : "Simpan Draft"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </section>
  );
}

function JoinFreelancer() {
  return (
    <>
      <ListingHero
        eyebrow="Bertumbuh bersama"
        title="Bawa keahlianmu untuk membantu UMKM naik kelas."
        text="Daftarkan profil, tunjukkan portofolio, dan terhubung dengan pemilik usaha yang membutuhkan bantuanmu."
      />
      <section className="join-layout">
        <div>
          <h2>Bagaimana prosesnya?</h2>
          {[
            "Lengkapi profil dan bidang keahlian",
            "Tim KUAT meninjau pengalaman dan portofolio",
            "Profil yang disetujui tampil di direktori",
            "Terima lead dan atur kerja sama langsung",
          ].map((x, i) => (
            <div className="process" key={x}>
              <span>0{i + 1}</span>
              <p>{x}</p>
            </div>
          ))}
          <div className="verification-note">
            <BadgeCheck />
            <p>
              <b>Setiap profil melalui proses review.</b>
              <br />
              Kami menjaga direktori tetap relevan dan tepercaya untuk
              komunitas.
            </p>
          </div>
        </div>
        <Inquiry
          service="Aplikasi Freelancer KUAT"
          applicationType="FREELANCER"
        />
      </section>
    </>
  );
}

function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const isPrivacy = type === "privacy";
  return (
    <>
      <section className="legal-hero">
        <span className="eyebrow">Informasi legal KUAT Digital</span>
        <h1>{isPrivacy ? "Kebijakan Privasi" : "Syarat dan Ketentuan"}</h1>
        <p>
          {isPrivacy
            ? "Penjelasan transparan tentang data yang kami kumpulkan, alasan penggunaannya, dan pilihan yang kamu miliki."
            : "Ketentuan dasar untuk menggunakan komunitas, materi, layanan, produk, dan direktori freelancer KUAT Digital."}
        </p>
        <small>Berlaku sejak 11 Agustus 2026</small>
      </section>
      <section className="legal-layout">
        <aside>
          <b>Ringkasan</b>
          <p>
            Dokumen ini berlaku untuk website, akun, dashboard, formulir, dan
            layanan digital KUAT Digital.
          </p>
          <a href="mailto:support@example.com">support@example.com</a>
        </aside>
        {isPrivacy ? (
          <article className="legal-document">
            <section>
              <h2>1. Tentang kebijakan ini</h2>
              <p>
                KUAT Digital adalah Komunitas UMKM dengan Akselerasi Teknologi.
                Kebijakan ini menjelaskan pemrosesan data pribadi ketika kamu
                mengunjungi website, membuat akun, mengirim formulir, meminta
                layanan, menghubungi freelancer, atau menggunakan dashboard.
              </p>
            </section>
            <section>
              <h2>2. Data yang kami kumpulkan</h2>
              <ul>
                <li>
                  Identitas dan kontak, seperti nama, email, dan WhatsApp.
                </li>
                <li>
                  Informasi usaha, kebutuhan layanan, aplikasi freelancer,
                  portofolio, serta isi pesan yang kamu kirimkan.
                </li>
                <li>
                  Data akun dan autentikasi yang dikelola oleh penyedia
                  autentikasi kami.
                </li>
                <li>
                  Data teknis dan penggunaan, seperti alamat IP, perangkat, log
                  keamanan, halaman yang dikunjungi, dan interaksi dasar.
                </li>
              </ul>
            </section>
            <section>
              <h2>3. Tujuan penggunaan data</h2>
              <p>Kami menggunakan data secara wajar untuk:</p>
              <ul>
                <li>membuat dan mengamankan akun;</li>
                <li>memberikan benefit member dan rekomendasi yang relevan;</li>
                <li>
                  memproses permintaan layanan, konsultasi, atau hubungan dengan
                  freelancer;
                </li>
                <li>meninjau aplikasi freelancer dan mengelola komunitas;</li>
                <li>
                  memberikan dukungan, mencegah penyalahgunaan, dan memenuhi
                  kewajiban hukum.
                </li>
              </ul>
            </section>
            <section>
              <h2>4. Dasar dan persetujuan pemrosesan</h2>
              <p>
                Pemrosesan dilakukan berdasarkan persetujuan, pelaksanaan
                permintaan atau perjanjian, kepentingan yang sah untuk menjaga
                keamanan dan kualitas layanan, serta kewajiban hukum yang
                berlaku. Kamu dapat menarik persetujuan untuk pemrosesan yang
                bergantung pada persetujuan dengan menghubungi kami.
              </p>
            </section>
            <section>
              <h2>5. Berbagi data</h2>
              <p>
                Kami dapat menggunakan penyedia infrastruktur, autentikasi,
                database, hosting, komunikasi, dan analitik sebagai pemroses
                data. Data kebutuhan dapat diteruskan kepada partner atau
                freelancer yang kamu pilih agar mereka dapat menindaklanjuti
                permintaanmu. Kami tidak menjual data pribadi.
              </p>
            </section>
            <section>
              <h2>6. Penyimpanan dan keamanan</h2>
              <p>
                Data disimpan selama akun aktif, selama diperlukan untuk
                memberikan layanan, menyelesaikan transaksi atau sengketa, dan
                memenuhi kewajiban hukum. Kami menerapkan kontrol akses,
                autentikasi, pencatatan aktivitas, dan perlindungan teknis yang
                proporsional. Tidak ada sistem elektronik yang sepenuhnya bebas
                risiko.
              </p>
            </section>
            <section>
              <h2>7. Hak kamu</h2>
              <p>
                Sesuai ketentuan yang berlaku, kamu dapat meminta akses,
                koreksi, pembaruan, salinan, penghapusan, pembatasan, atau
                penghentian pemrosesan data tertentu. Kami dapat meminta
                verifikasi identitas sebelum memenuhi permintaan tersebut.
              </p>
            </section>
            <section>
              <h2>8. Cookie dan layanan pihak ketiga</h2>
              <p>
                Cookie yang diperlukan digunakan untuk autentikasi, keamanan,
                dan fungsi dasar website. Layanan pihak ketiga memiliki
                kebijakan privasi masing-masing. Tautan eksternal tidak berada
                di bawah kendali KUAT Digital.
              </p>
            </section>
            <section>
              <h2>9. Anak dan perubahan kebijakan</h2>
              <p>
                Layanan ditujukan bagi pengguna yang cakap melakukan tindakan
                hukum. Kami dapat memperbarui kebijakan ini dan akan
                mencantumkan tanggal berlaku terbaru pada halaman ini.
              </p>
            </section>
            <section>
              <h2>10. Hubungi kami</h2>
              <p>
                Untuk pertanyaan atau permintaan terkait data pribadi, kirim
                email ke{" "}
                <a href="mailto:support@example.com">support@example.com</a>
                . Kebijakan ini disusun dengan memperhatikan prinsip dalam UU
                Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.
              </p>
            </section>
          </article>
        ) : (
          <article className="legal-document">
            <section>
              <h2>1. Penerimaan ketentuan</h2>
              <p>
                Dengan mengakses atau menggunakan KUAT Digital, kamu menyetujui
                ketentuan ini dan Kebijakan Privasi kami. Jika tidak setuju,
                jangan membuat akun atau menggunakan fitur yang memerlukan
                pengiriman data.
              </p>
            </section>
            <section>
              <h2>2. Akun dan kelayakan pengguna</h2>
              <ul>
                <li>
                  Kamu harus memberikan informasi yang benar dan menjaga
                  keamanan akun.
                </li>
                <li>
                  Satu akun digunakan oleh pemilik yang sah dan tidak boleh
                  dialihkan tanpa persetujuan.
                </li>
                <li>
                  Pengguna harus cakap melakukan tindakan hukum atau memiliki
                  persetujuan wali yang sah.
                </li>
              </ul>
            </section>
            <section>
              <h2>3. Keanggotaan dan akses konten</h2>
              <p>
                Sebagian materi dan benefit dapat dibatasi untuk Member,
                Freelancer, atau paket tertentu. KUAT Digital dapat mengubah,
                menambah, atau menghentikan benefit dengan pemberitahuan yang
                wajar. Materi edukasi bersifat informasi umum dan bukan nasihat
                hukum, pajak, keuangan, atau investasi profesional.
              </p>
            </section>
            <section>
              <h2>4. Layanan, produk, dan pembayaran</h2>
              <p>
                Ruang lingkup, harga, jadwal, revisi, cara pembayaran, dan hasil
                layanan mengikuti penawaran yang disepakati untuk setiap
                transaksi. Harga atau promo dapat memiliki masa berlaku.
                Pembelian dari partner juga tunduk pada ketentuan partner yang
                bersangkutan.
              </p>
            </section>
            <section>
              <h2>5. Freelancer dan partner</h2>
              <p>
                KUAT Digital melakukan peninjauan administratif terhadap profil
                yang ditampilkan, tetapi kerja sama, hasil pekerjaan, hak dan
                kewajiban proyek harus disepakati langsung oleh member dan
                freelancer atau partner. Para pihak bertanggung jawab atas
                informasi, komunikasi, pembayaran, pajak, dan pelaksanaan
                pekerjaan masing-masing.
              </p>
            </section>
            <section>
              <h2>6. Penggunaan yang dilarang</h2>
              <ul>
                <li>menggunakan identitas atau informasi palsu;</li>
                <li>
                  mengirim spam, malware, penipuan, atau konten melanggar hukum;
                </li>
                <li>
                  menyalin, menjual kembali, atau mengeksploitasi materi tanpa
                  izin;
                </li>
                <li>
                  mengganggu keamanan, mencoba mengakses akun orang lain, atau
                  menyalahgunakan data komunitas.
                </li>
              </ul>
            </section>
            <section>
              <h2>7. Hak kekayaan intelektual</h2>
              <p>
                Merek, desain, materi, perangkat lunak, dan konten KUAT Digital
                dilindungi oleh hukum. Hak atas materi milik partner,
                freelancer, atau pengguna tetap berada pada pemiliknya. Dengan
                mengirim konten untuk ditampilkan, kamu menyatakan memiliki hak
                dan memberikan izin terbatas kepada KUAT Digital untuk
                mengoperasikan layanan.
              </p>
            </section>
            <section>
              <h2>8. Penangguhan dan penghentian</h2>
              <p>
                Kami dapat membatasi atau menangguhkan akun yang melanggar
                ketentuan, mengganggu keamanan, atau merugikan komunitas. Kamu
                dapat meminta penutupan akun dan penghapusan data sesuai
                Kebijakan Privasi dan kewajiban retensi yang berlaku.
              </p>
            </section>
            <section>
              <h2>9. Batas tanggung jawab</h2>
              <p>
                Kami berupaya menjaga layanan tetap akurat dan tersedia, tetapi
                tidak menjamin layanan selalu bebas gangguan atau bahwa setiap
                hasil bisnis akan tercapai. Tanggung jawab KUAT Digital dibatasi
                sejauh yang diizinkan hukum dan sesuai nilai transaksi langsung
                yang diterima KUAT Digital untuk layanan terkait.
              </p>
            </section>
            <section>
              <h2>10. Hukum dan penyelesaian masalah</h2>
              <p>
                Ketentuan ini tunduk pada hukum Republik Indonesia, termasuk
                ketentuan mengenai informasi dan transaksi elektronik. Para
                pihak akan terlebih dahulu menyelesaikan perselisihan melalui
                musyawarah. Pertanyaan dapat dikirim ke{" "}
                <a href="mailto:support@example.com">support@example.com</a>
                .
              </p>
            </section>
          </article>
        )}
      </section>
    </>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <Search />
      <h3>Tidak ada hasil</h3>
      <p>{text}</p>
    </div>
  );
}
function Related({ type }: { type: string }) {
  const { education, products } = useCatalog();
  const items =
    type === "produk"
      ? products.slice(1, 4).map((x) => ({
          slug: x.slug,
          category: x.category,
          title: x.name,
          text: x.desc,
        }))
      : education.slice(1, 4).map((x) => ({
          slug: x.slug,
          category: x.category,
          title: x.title,
          text: x.excerpt,
        }));
  return (
    <section>
      <SectionHead
        eyebrow="Lanjutkan eksplorasi"
        title={
          type === "produk"
            ? "App lain yang mungkin cocok"
            : "Materi terkait untukmu"
        }
      />
      <div className="related-grid">
        {items.map((x) => (
          <Link href={`/${type}/${x.slug}`} key={x.slug}>
            <ArrowRight />
            <span className="tag">{x.category}</span>
            <h3>{x.title}</h3>
            <p>{x.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
function Cta() {
  return (
    <section className="final-cta">
      <div>
        <span className="eyebrow light">Langkah kecil hari ini</span>
        <h2>Siap bikin bisnismu lebih KUAT?</h2>
        <p>Gabung komunitas dan temukan langkah berikutnya untuk usahamu.</p>
      </div>
      <div className="button-row">
        <Link className="button button-white" href="/register">
          Gabung Komunitas <ArrowRight />
        </Link>
        <a
          className="button button-outline-white"
          href="/layanan#konsultasi"
          target="_blank"
          rel="noreferrer"
        >
          Tanya tim KUAT
        </a>
      </div>
    </section>
  );
}

function KuatSiteContent({
  path = [],
  adminData,
  memberData,
  freelancerData,
  readinessAuthenticated = false,
}: {
  path?: string[];
  adminData?: AdminDashboardData;
  memberData?: MemberDashboardData;
  freelancerData?: FreelancerDashboardData;
  readinessAuthenticated?: boolean;
}) {
  const root = path[0] ?? "";
  const slug = path[1];
  if (root === "login" || root === "register" || root === "forgot-password")
    return <AuthPage kind={root as "login" | "register" | "forgot-password"} />;
  if (root === "dashboard") return <Dashboard data={memberData} initialSection={slug} />;
  if (root === "freelancer-dashboard")
    return <FreelancerDashboard data={freelancerData} />;
  if (root === "admin" && adminData) return <Admin data={adminData} />;
  let content: React.ReactNode = <Home />;
  if (root === "edukasi")
    content = slug ? <Detail type="edukasi" slug={slug} /> : <EducationList />;
  else if (root === "produk")
    content = slug ? <Detail type="produk" slug={slug} /> : <ProductList />;
  else if (root === "layanan")
    content = slug ? <Detail type="layanan" slug={slug} /> : <ServiceList />;
  else if (root === "freelancer")
    content = slug ? (
      <Detail type="freelancer" slug={slug} />
    ) : (
      <FreelancerList />
    );
  else if (root === "jadi-freelancer") content = <JoinFreelancer />;
  else if (root === "tes-kesiapan-digital") content = <DigitalReadinessAssessment authenticated={readinessAuthenticated} />;
  else if (root === "kebijakan-privasi") content = <LegalPage type="privacy" />;
  else if (root === "syarat-ketentuan") content = <LegalPage type="terms" />;
  return (
    <>
      <Header />
      <main>{content}</main>
      <Footer />
    </>
  );
}

export default function KuatSite({
  catalogData,
  ...props
}: {
  path?: string[];
  adminData?: AdminDashboardData;
  memberData?: MemberDashboardData;
  freelancerData?: FreelancerDashboardData;
  readinessAuthenticated?: boolean;
  catalogData: CatalogData;
}) {
  return (
    <CatalogContext.Provider value={catalogData}>
      <KuatSiteContent {...props} />
    </CatalogContext.Provider>
  );
}
