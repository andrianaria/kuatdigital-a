import { SignUp } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function safeRedirect(value: string | string[] | undefined) {
  const target = Array.isArray(value) ? value[0] : value;
  return target?.startsWith("/") && !target.startsWith("//") ? target : "/dashboard";
}

export default async function RegisterPage({ searchParams }: Props) {
  const query = await searchParams;
  const redirectTo = safeRedirect(query.redirect_url ?? query.next);
  return <main className="clerk-auth-page"><div className="clerk-auth-brand"><span>KOMUNITAS UMKM DENGAN AKSELERASI TEKNOLOGI</span><h1>Mulai tumbuh bersama KUAT.</h1><p>Buat akun untuk belajar, menemukan solusi, dan terhubung dengan expert yang tepat.</p></div><SignUp routing="path" path="/register" signInUrl="/login" forceRedirectUrl={redirectTo} fallbackRedirectUrl={redirectTo} appearance={{variables:{colorPrimary:"#0756b8",borderRadius:"0.75rem"}}}/></main>;
}
