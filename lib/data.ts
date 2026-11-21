export type EducationItem = {
  slug: string; title: string; category: string; level: string; access: string;
  format: string; duration: string; excerpt: string; body?: string;
  coverImageUrl?: string; videoUrl?: string; attachments?: string[];
};

export const education: EducationItem[] = [
  { slug: "mulai-konten-30-hari", title: "Rencana Konten 30 Hari untuk Bisnis Lokal", category: "Digital Marketing", level: "Pemula", access: "Gratis", format: "Panduan", duration: "8 menit", excerpt: "Susun ide konten yang konsisten tanpa harus selalu mengejar tren." },
  { slug: "catatan-keuangan-sederhana", title: "Catatan Keuangan Sederhana yang Benar", category: "Keuangan UMKM", level: "Pemula", access: "Member", format: "Kelas", duration: "42 menit", excerpt: "Pisahkan uang usaha dan pribadi, lalu mulai membaca arus kas." },
  { slug: "ai-untuk-umkm", title: "AI Praktis untuk Operasional UMKM", category: "Teknologi dan AI", level: "Menengah", access: "Premium", format: "Video", duration: "55 menit", excerpt: "Contoh penggunaan AI untuk admin, pemasaran, dan pelayanan pelanggan." },
  { slug: "brand-yang-diingat", title: "Membangun Brand yang Mudah Diingat", category: "Branding", level: "Pemula", access: "Gratis", format: "Artikel", duration: "7 menit", excerpt: "Tentukan janji brand, suara komunikasi, dan tampilan yang konsisten." },
  { slug: "izin-usaha-dasar", title: "Peta Legalitas Dasar untuk UMKM", category: "Legalitas", level: "Pemula", access: "Member", format: "Checklist", duration: "12 menit", excerpt: "Kenali dokumen dasar dan urutan menyiapkan legalitas usaha." },
  { slug: "sop-pesanan", title: "SOP Pesanan agar Tim Tidak Keteteran", category: "Operasional", level: "Menengah", access: "Gratis", format: "Template", duration: "15 menit", excerpt: "Alur sederhana dari pesanan masuk sampai produk diterima pelanggan." },
  { slug: "pelanggan-kembali", title: "Membuat Pelanggan Mau Kembali", category: "Sales dan Customer Experience", level: "Menengah", access: "Member", format: "Webinar", duration: "60 menit", excerpt: "Bangun pengalaman pelanggan yang konsisten dan mudah diukur." },
  { slug: "harga-jual-sehat", title: "Menentukan Harga Jual yang Sehat", category: "Keuangan UMKM", level: "Pemula", access: "Gratis", format: "Kalkulator", duration: "10 menit", excerpt: "Hitung biaya, margin, dan ruang promosi tanpa merusak arus kas." },
];

export type ProductItem = {
  slug:string; name:string; category:string; partner:string; price:number; memberPrice:number;
  rating:string; desc:string; websiteUrl?:string; pricingModel?:string; priceLabel?:string;
  platforms?:string[]; bestFor?:string; features?:string[]; setupLevel?:string; logoUrl?:string;
};
export const products: ProductItem[] = [
  { slug: "kasir-pintar-pos", name: "Kasir Pintar POS", category: "Software dan teknologi", partner: "Nade", price: 149000, memberPrice: 99000, rating: "4,9", desc: "Kelola transaksi, stok, dan laporan harian dari satu layar." },
  { slug: "kemasan-kraft-premium", name: "Kemasan Kraft Premium", category: "Packaging", partner: "KemasKita", price: 285000, memberPrice: 235000, rating: "4,8", desc: "Paket 100 kemasan food grade dengan stiker merek." },
  { slug: "printer-label-bluetooth", name: "Printer Label Bluetooth", category: "Peralatan usaha", partner: "TokoNiaga", price: 685000, memberPrice: 599000, rating: "4,7", desc: "Cetak label pengiriman dan harga langsung dari ponsel." },
  { slug: "buku-kas-digital", name: "Buku Kas Digital Pro", category: "Keuangan dan pembukuan", partner: "BukuRapi", price: 499000, memberPrice: 349000, rating: "4,9", desc: "Pencatatan keuangan sederhana dengan laporan otomatis." },
  { slug: "foto-produk-mini-studio", name: "Mini Studio Foto Produk", category: "Marketing tools", partner: "Visualin", price: 425000, memberPrice: 375000, rating: "4,6", desc: "Lightbox portabel untuk foto produk yang lebih konsisten." },
  { slug: "paket-pengiriman-hemat", name: "Paket Pengiriman Hemat", category: "Logistik", partner: "KirimAja", price: 250000, memberPrice: 199000, rating: "4,8", desc: "Saldo pengiriman multi-kurir dengan pickup terjadwal." },
  { slug: "izin-usaha-plus", name: "Pendampingan Izin Usaha", category: "Legal dan perizinan", partner: "LegalTumbuh", price: 950000, memberPrice: 775000, rating: "4,9", desc: "Pendampingan NIB dan konsultasi dasar legalitas." },
  { slug: "wa-customer-manager", name: "WhatsApp Customer Manager", category: "Software dan teknologi", partner: "ChatRapi", price: 299000, memberPrice: 219000, rating: "4,7", desc: "Kelola chat, label pelanggan, dan balasan cepat bersama tim." },
  { slug: "label-stiker-custom", name: "Label Stiker Custom", category: "Packaging", partner: "KemasKita", price: 175000, memberPrice: 145000, rating: "4,8", desc: "500 stiker tahan air dengan bantuan cek desain." },
  { slug: "rak-display-modular", name: "Rak Display Modular", category: "Kebutuhan operasional", partner: "TokoNiaga", price: 750000, memberPrice: 675000, rating: "4,6", desc: "Rak ringkas yang mudah dibongkar untuk bazar dan toko." },
];

export type ServiceItem = { slug:string; name:string; price:string; oldPrice:string; billingPeriod?:string; time:string; for:string; desc:string; deliverables:string[] };
export const services: ServiceItem[] = [
  { slug: "starter-profile", name: "Starter Profile", price: "Rp1.500.000", oldPrice: "Rp1.750.000", time: "7-10 hari", for: "Usaha yang perlu profil bisnis profesional", desc: "Perjelas cerita bisnis dan tampilkan usaha secara meyakinkan.", deliverables: ["Discovery session", "Narasi bisnis", "Company profile 8-10 halaman", "Canva + PDF, 2 revisi"] },
  { slug: "market-ready-kit", name: "Market Ready Kit", price: "Rp2.750.000", oldPrice: "Rp3.500.000", time: "10-14 hari", for: "UMKM yang ingin tampil profesional dan siap scale-up", desc: "Materi lengkap untuk penjualan, kemitraan, dan peluang baru.", deliverables: ["Mini audit bisnis", "Company profile", "Sales/product deck", "One-page profile", "Canva + PDF, 2 revisi"] },
  { slug: "fund-pitch-ready", name: "Fund & Pitch Ready", price: "Rp5.500.000", oldPrice: "Rp6.500.000", time: "14-21 hari", for: "Bisnis yang mencari pendanaan atau mitra strategis", desc: "Bangun narasi dan kesiapan pitching yang didukung bukti.", deliverables: ["Audit kesiapan", "Pitch deck 10-15 slide", "Script dan Q&A", "Rehearsal", "Executive summary"] },
  { slug: "website-company-profile", name: "Website Company Profile", price: "Rp2.950.000", oldPrice: "Rp3.500.000", time: "10-14 hari", for: "UMKM yang perlu mudah ditemukan dan lebih kredibel", desc: "Digital presence yang rapi, responsif, dan siap tayang.", deliverables: ["Setup Google Business", "Website 5 halaman", "WhatsApp Business", "Domain + hosting 1 tahun", "SEO dasar"] },
  { slug: "web-commerce-nade", name: "Web-Commerce powered by Nade", price: "Rp349.000", oldPrice: "Rp499.000", billingPeriod: "bulan", time: "Aktif 3-5 hari", for: "Bisnis yang ingin toko online tanpa biaya proyek besar", desc: "Toko digital milik sendiri dengan model langganan fleksibel.", deliverables: ["Katalog dan checkout", "Promo dan payment", "Delivery dan pickup", "Dashboard pesanan", "Tanpa komisi platform"] },
];

export type FreelancerServicePackage = { id:string; name:string; description:string; price:string; priceType:string; duration:string; deliverables:string[] };
export type FreelancerItem = { slug:string; name:string; skill:string; city:string; mode:string; price:string; verified:boolean; initials:string; bio:string; available?:boolean; whatsapp?:string; skills?:string[]; portfolios?:Array<{title:string;description:string;projectUrl:string}>; packages?:FreelancerServicePackage[] };
export const freelancers: FreelancerItem[] = [
  { slug: "demo-freelancer-01", name: "Demo Freelancer 01", skill: "Pembukuan & Laporan", city: "Kota Demo", mode: "Remote", price: "Mulai Rp750 ribu", verified: true, initials: "DF", bio: "Membantu usaha kuliner merapikan laporan bulanan dan arus kas." },
  { slug: "demo-freelancer-02", name: "Demo Freelancer 02", skill: "Foto & Video Produk", city: "Kota Demo", mode: "Onsite", price: "Mulai Rp1,2 juta", verified: true, initials: "DF", bio: "Visual produk untuk F&B dan retail yang siap dipakai di katalog." },
  { slug: "demo-freelancer-03", name: "Demo Freelancer 03", skill: "Social Media", city: "Kota Demo", mode: "Remote", price: "Mulai Rp1 juta", verified: true, initials: "DF", bio: "Strategi konten dan pengelolaan sosial media bisnis lokal." },
  { slug: "demo-freelancer-04", name: "Demo Freelancer 04", skill: "Website & Teknologi", city: "Kota Demo", mode: "Remote", price: "Mulai Rp2,5 juta", verified: true, initials: "DF", bio: "Website ringan dan otomasi sederhana untuk operasional UMKM." },
  { slug: "demo-freelancer-05", name: "Demo Freelancer 05", skill: "Legalitas Usaha", city: "Kota Demo", mode: "Hybrid", price: "Mulai Rp900 ribu", verified: true, initials: "DF", bio: "Pendampingan NIB, merek, dan dokumen legal usaha." },
  { slug: "demo-freelancer-06", name: "Demo Freelancer 06", skill: "Digital Marketing", city: "Kota Demo", mode: "Remote", price: "Mulai Rp1,5 juta", verified: false, initials: "DF", bio: "Iklan digital berbasis target dan pengukuran yang mudah dipahami." },
  { slug: "demo-freelancer-07", name: "Demo Freelancer 07", skill: "SOP & Operasional", city: "Kota Demo", mode: "Hybrid", price: "Mulai Rp1,2 juta", verified: true, initials: "DF", bio: "Merapikan alur kerja agar owner tidak mengurus semuanya sendiri." },
  { slug: "demo-freelancer-08", name: "Demo Freelancer 08", skill: "Business Mentor", city: "Kota Demo", mode: "Remote", price: "Mulai Rp650 ribu", verified: true, initials: "DF", bio: "Mentoring fokus model bisnis, pricing, dan rencana pertumbuhan." },
];

export const formatRupiah = (value: number) => `Rp${new Intl.NumberFormat("id-ID").format(value)}`;
