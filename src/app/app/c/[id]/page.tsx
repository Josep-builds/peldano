import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation";
import { RecordCard, type RecordView } from "@/components/RecordCard";
import { WhatsAppIcon } from "@/components/LinkResult";
import { setHidden } from "@/app/actions";
import { Submit } from "@/components/Submit";
import { RenewLink } from "./RenewLink";

export const metadata = { title: "Constancia de día de prueba" };

export default async function Constancia({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();

  const { supabase, user } = await getUser();
  if (!user) redirect(`/entrar?next=/app/c/${id}`);

  const { data: r } = await supabase
    .from("records")
    .select("id,worker_id,worker_name,business_name,role,trial_date,hours,tasks,observations,observer_name,signed_at,hidden")
    .eq("id", id)
    .maybeSingle<RecordView & { id: string; worker_id: string; hidden: boolean }>();
  if (!r || r.worker_id !== user.id) notFound();

  return (
    <div className="space-y-4 pt-2">
      <Link href="/app" className="text-sm font-semibold text-pine">← Mis constancias</Link>
      <h1 className="h1">Constancia de día de prueba</h1>
      {r.hidden && (
        <p className="rounded-xl bg-line px-4 py-3 text-sm text-muted">Está oculta: nadie la ve en tus enlaces compartidos. Sigue guardada.</p>
      )}
      <RecordCard r={r} />

      {r.signed_at ? (
        <div className="space-y-3">
          {!r.hidden && (
            <Link href={`/app/c/${r.id}/compartir`} className="btn-primary"><WhatsAppIcon /> Compartir con un negocio</Link>
          )}
          <form action={setHidden}>
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="hidden" value={r.hidden ? "false" : "true"} />
            <Submit className="btn-ghost" pending="…">{r.hidden ? "Mostrar" : "Ocultar"}</Submit>
          </form>
          {!r.hidden && <p className="hint text-center">Ocultar la quita de tus enlaces. Nunca se borra.</p>}
        </div>
      ) : (
        <RenewLink id={r.id} />
      )}
    </div>
  );
}
