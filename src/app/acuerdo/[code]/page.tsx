import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Acuerdo" };

type A = { business_name: string; signer_name: string; n_days: number; signed_at: string };

export default async function Acuerdo({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const c = code.toUpperCase();
  if (!/^[A-F0-9]{8}$/.test(c)) notFound();

  const supabase = await createClient();
  const { data: a } = await supabase.rpc("get_acuerdo", { p_code: c }).maybeSingle<A>();
  if (!a) notFound();

  return (
    <div className="space-y-5 pt-2">
      <p className="text-sm font-semibold tracking-wide text-clay uppercase">Acuerdo · {c}</p>
      <h1 className="h1">{a.business_name}</h1>
      <div className="card space-y-3">
        <p className="text-lg">
          Aceptamos <strong>{a.n_days}</strong> constancia{a.n_days === 1 ? "" : "s"} firmada{a.n_days === 1 ? "" : "s"} de
          días de prueba como experiencia para puestos de entrada.
        </p>
        <p className="text-muted">No es una promesa de contratación.</p>
        <p className="text-sm text-muted">Firmado por {a.signer_name} · {fmtDate(a.signed_at)}</p>
      </div>
      <p className="text-muted">
        ¿Tienes constancias en Peldaño? Ábrelas, toca “Compartir con un negocio” y escribe el código <strong className="font-mono">{c}</strong>.
      </p>
    </div>
  );
}
