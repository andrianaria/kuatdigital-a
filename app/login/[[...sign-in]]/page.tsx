import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function safeRedirect(value: string | string[] | undefined) {
  const target = Array.isArray(value) ? value[0] : value;
  return target?.startsWith("/") && !target.startsWith("//") ? target : "/dashboard";
}

export default async function LoginPage({ searchParams }: Props) {
  const query = await searchParams;
  const redirectTo = safeRedirect(query.redirect_url ?? query.next);
  return <main className="clerk-auth-page"><div className="clerk-auth-brand"><span>KUAT DIGITAL</span><h1>Selamat datang kembali.</h1><p>Masuk untuk mengelola akun, membuka benefit member, dan melanjutkan pertumbuhan usahamu.</p></div><SignIn routing="path" path="/login" signUpUrl="/register" forceRedirectUrl={redirectTo} fallbackRedirectUrl={redirectTo} appearance={{variables:{colorPrimary:"#0756b8",borderRadius:"0.75rem"}}}/></main>;
}
