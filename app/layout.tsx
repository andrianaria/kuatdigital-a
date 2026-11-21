import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { idID } from "@clerk/localizations";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: { default: "KUAT Digital - Komunitas UMKM dengan Akselerasi Teknologi", template: "%s | KUAT Digital" },
  description: "KUAT adalah Komunitas UMKM dengan Akselerasi Teknologi untuk belajar, menemukan solusi, dan bertumbuh bersama.",
  icons: { icon: "/brand/kuat-logo.svg", shortcut: "/brand/kuat-logo.svg", apple: "/brand/kuat-logo.svg" },
  openGraph: { title: "KUAT Digital", description: "Komunitas UMKM dengan Akselerasi Teknologi.", images: [{ url: "/brand/social-preview.svg", width: 1200, height: 630, alt: "KUAT Digital - Komunitas UMKM dengan Akselerasi Teknologi" }], locale: "id_ID", type: "website" },
  twitter: { card: "summary_large_image", title: "KUAT Digital", description: "Komunitas UMKM dengan Akselerasi Teknologi.", images: ["/brand/social-preview.svg"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const localization = {
    ...idID,
    unstable__errors: {
      ...idID.unstable__errors,
      oauth_access_denied: "Anda tidak memberikan izin akses ke akun Google. Silakan coba lagi atau gunakan email.",
    },
  };
  return <html lang="id"><body className={geist.variable}><ClerkProvider dynamic localization={localization}>{children}</ClerkProvider></body></html>;
}
