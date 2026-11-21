export const readinessDimensions = [
  { id: "presence", label: "Kehadiran Digital" },
  { id: "sales", label: "Penjualan & Pelanggan" },
  { id: "operations", label: "Operasional" },
  { id: "data", label: "Data & Keputusan" },
] as const;

export type ReadinessDimension = (typeof readinessDimensions)[number]["id"];

export const readinessQuestions: Array<{
  id: string;
  dimension: ReadinessDimension;
  question: string;
  hint: string;
}> = [
  { id: "profile", dimension: "presence", question: "Seberapa lengkap profil usaha Anda di kanal digital?", hint: "Google Business, website, marketplace, atau media sosial." },
  { id: "content", dimension: "presence", question: "Seberapa konsisten usaha Anda membuat konten?", hint: "Konten edukasi, promosi, testimoni, atau katalog." },
  { id: "inquiries", dimension: "sales", question: "Seberapa rapi proses menangani chat dan calon pelanggan?", hint: "Termasuk respons, pencatatan lead, dan tindak lanjut." },
  { id: "checkout", dimension: "sales", question: "Seberapa mudah pelanggan memesan dan membayar?", hint: "Dari katalog sampai konfirmasi pembayaran." },
  { id: "workflow", dimension: "operations", question: "Seberapa terdokumentasi alur kerja utama usaha?", hint: "Pesanan, stok, produksi, pelayanan, atau pengiriman." },
  { id: "tools", dimension: "operations", question: "Seberapa jauh tim memakai alat digital untuk pekerjaan rutin?", hint: "Kasir, pembukuan, kolaborasi, otomasi, atau AI." },
  { id: "records", dimension: "data", question: "Seberapa rutin data penjualan dan biaya dicatat?", hint: "Bukan hanya saldo, tetapi transaksi dan kategori biaya." },
  { id: "decisions", dimension: "data", question: "Seberapa sering data dipakai untuk mengambil keputusan?", hint: "Misalnya menentukan produk, harga, promo, atau target." },
];

export const readinessOptions = [
  "Belum dilakukan",
  "Baru sesekali",
  "Sudah ada, belum konsisten",
  "Sudah rutin",
  "Sudah terukur dan terus diperbaiki",
];

export type ReadinessResult = {
  totalScore: number;
  level: string;
  summary: string;
  dimensionScores: Record<ReadinessDimension, number>;
  recommendations: string[];
};

const recommendationByDimension: Record<ReadinessDimension, string> = {
  presence: "Lengkapi satu profil digital utama dan susun kalender konten sederhana untuk 30 hari.",
  sales: "Satukan katalog, format respons, dan pencatatan calon pelanggan agar tidak ada peluang yang terlewat.",
  operations: "Dokumentasikan satu alur kerja paling sering dilakukan, lalu pilih satu alat digital untuk merapikannya.",
  data: "Mulai catat penjualan dan biaya per kategori, kemudian lakukan review singkat setiap minggu.",
};

export function scoreDigitalReadiness(answers: Record<string, number>): ReadinessResult {
  const totals = Object.fromEntries(readinessDimensions.map((item) => [item.id, { score: 0, count: 0 }])) as Record<ReadinessDimension, { score: number; count: number }>;
  for (const question of readinessQuestions) {
    totals[question.dimension].score += answers[question.id] ?? 0;
    totals[question.dimension].count += 1;
  }
  const dimensionScores = Object.fromEntries(readinessDimensions.map((item) => {
    const value = totals[item.id];
    return [item.id, Math.round((value.score / (value.count * 4)) * 100)];
  })) as Record<ReadinessDimension, number>;
  const totalScore = Math.round(Object.values(dimensionScores).reduce((sum, score) => sum + score, 0) / readinessDimensions.length);
  const level = totalScore < 30 ? "Fondasi" : totalScore < 55 ? "Mulai Bertumbuh" : totalScore < 80 ? "Siap Berkembang" : "Digital-Ready";
  const summary = totalScore < 30
    ? "Fondasi digital masih perlu dibangun dari proses yang paling penting dan mudah dijalankan."
    : totalScore < 55
      ? "Usaha sudah mulai menggunakan kanal digital, tetapi konsistensi dan keterhubungan proses masih dapat diperkuat."
      : totalScore < 80
        ? "Fondasi digital sudah cukup baik. Fokus berikutnya adalah pengukuran, integrasi, dan efisiensi."
        : "Usaha sudah matang secara digital dan siap meningkatkan otomasi, eksperimen, serta skala pertumbuhan.";
  const weakest = [...readinessDimensions]
    .sort((a, b) => dimensionScores[a.id] - dimensionScores[b.id])
    .slice(0, 3);
  return { totalScore, level, summary, dimensionScores, recommendations: weakest.map((item) => recommendationByDimension[item.id]) };
}
