import Link from "next/link";
import { Logo } from "./Logo";
import { getUser } from "@/lib/supabase/server";

export async function Header() {
  let signedIn = false;
  try {
    const { user } = await getUser();
    signedIn = !!user;
  } catch {
    signedIn = false;
  }

  return (
    <header className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-4">
      <Link href={signedIn ? "/app" : "/"} aria-label="Peldaño, inicio">
        <Logo />
      </Link>
      <nav className="flex items-center gap-4 text-sm font-semibold text-pine">
        {signedIn ? (
          <>
            <Link href="/app">Mis constancias</Link>
            <form action="/salir" method="post">
              <button className="text-muted hover:text-pine">Salir</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/producto" className="hidden sm:inline">Cómo funciona</Link>
            <Link href="/entrar" className="rounded-lg bg-pine px-3 py-2 text-white">Entrar</Link>
          </>
        )}
      </nav>
    </header>
  );
}
