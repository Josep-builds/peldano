import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "@fontsource-variable/figtree";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://peldano.xyz"),
  title: { default: "Peldaño — tu día de prueba sí cuenta", template: "%s · Peldaño" },
  description:
    "Constancias firmadas de días de prueba: el trabajo que hiciste queda registrado, es tuyo y cuenta como experiencia.",
};

export const viewport: Viewport = { themeColor: "#1f4a3a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <Header />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-16">{children}</main>
        <footer className="mx-auto w-full max-w-xl px-4 py-8 text-sm text-muted">
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/producto">Cómo funciona</Link>
            <Link href="/nosotros">Por qué existe</Link>
            <Link href="/acuerdo/nuevo">Soy empleador</Link>
          </nav>
          <p className="mt-3">Peldaño · peldano.xyz · Sin calificaciones. Tus constancias son tuyas.</p>
        </footer>
      </body>
    </html>
  );
}
