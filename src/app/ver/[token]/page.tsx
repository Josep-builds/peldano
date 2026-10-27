import { createClient } from "@/lib/supabase/server";
import { tokenSchema } from "@/lib/validation";
import { RecordCard, type RecordView } from "@/components/RecordCard";

export const metadata = { title: "Constancias compartidas", robots: { index: false } };

type Share = {
  revoked: boolean;
  acuerdo: { business_name: string; signer_name: string; n_days: number; signed_at: string };
  records: RecordView[];
};

function Msg({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-3 pt-6">
      <h1 className="h1">{title}</h1>
      <p className="text-muted">{body}</p>
    </div>
  );
}

export default async function Ver({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!tokenSchema.safeParse(token).success) return <Msg title="Enlace no válido" body="Revisa que el enlace esté completo." />;

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_share", { p_token: token });
  const s = data as Share | null;
  if (!s) return <Msg title="Enlace no válido" body="Revisa que el enlace esté completo." />;
  if (s.revoked) return <Msg title="Enlace revocado" body="La persona que compartió estas constancias retiró el acceso." />;

  const count = s.records.length;
  const n = s.acuerdo.n_days;
  const worker = s.records[0]?.worker_name;
  const meets = count >= n;

  return (
    <div className="space-y-5 pt-2">
      <p className="text-sm font-semibold tracking-wide text-clay uppercase">Para {s.acuerdo.business_name}</p>
      <h1 className="h1">{worker ? `Constancias de ${worker}` : "Constancias compartidas"}</h1>

      <div className={`card ${meets ? "border-pine bg-mint/60" : ""}`}>
        <p className="text-3xl font-bold text-pine">{count} de {n}</p>
        <p className="mt-1 text-muted">
          días de prueba firmados. Tu Acuerdo acepta {n} como experiencia.
          {meets ? " Cumple lo que pide tu Acuerdo." : ""}
        </p>
      </div>

      {count === 0 ? (
        <p className="card text-muted">No hay constancias visibles en este enlace.</p>
      ) : (
        <div className="space-y-8">
          {s.records.map((r, i) => (
            <section key={i} aria-label={`Constancia ${i + 1}`}>
              <RecordCard r={r} />
            </section>
          ))}
        </div>
      )}
      <p className="text-sm text-muted">
        Cada constancia la firmó una persona que vio el trabajo. Está bloqueada: no se puede editar. Peldaño no califica a nadie.
      </p>
    </div>
  );
}
