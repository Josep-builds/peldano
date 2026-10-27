import { safeNext } from "@/lib/safe-next";
import { GoogleButton } from "./GoogleButton";

export const metadata = { title: "Entrar" };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const signing = next.startsWith("/firmar/");
  const employer = next.startsWith("/acuerdo");

  return (
    <div className="space-y-6 pt-6">
      <h1 className="h1">{signing ? "Para firmar, entra primero" : "Entrar a Peldaño"}</h1>
      <p className="text-muted">
        {signing
          ? "Alguien te pidió firmar la constancia de su día de prueba. Entra con tu cuenta de Google para que tu firma sea tuya."
          : employer
            ? "Entra con Google para firmar el Acuerdo de tu negocio."
            : "Entra con tu cuenta de Google. No pedimos formularios largos ni contraseñas."}
      </p>
      {sp.error && (
        <p role="alert" className="rounded-xl bg-clay-soft px-4 py-3 text-clay">No pudimos entrar. Intenta otra vez.</p>
      )}
      <GoogleButton next={next} />
      <p className="text-sm text-muted">Solo usamos tu nombre y correo para saber quién firma. Nunca vendemos tus datos.</p>
    </div>
  );
}
