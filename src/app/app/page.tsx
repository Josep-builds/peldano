import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { fmtDate, } from "@/lib/format";
import { Icons } from "@/components/RecordCard";

export const metadata = { title: "Mis constancias" };

type Row = { id: string; business_name: string; role: string; trial_date: string; signed_at: string | null; hidden: boolean; observer_name: string | null };

export default async function MisConstancias() {
  const { supabase, user } = await getUser();
  if (!user) redirect("/entrar?next=/app");

  const { data } = await supabase
    .from("records")
    .select("id,business_name,role,trial_date,signed_at,hidden,observer_name")
    .eq("worker_id", user.id)
    .order("trial_date", { ascending: false })
    .returns<Row[]>();
  const rows = data ?? [];
  const signed = rows.filter((r) => r.signed_at && !r.hidden).length;

  return (
    <div className="space-y-5 pt-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="h1">Mis constancias</h1>
          <p className="mt-1 text-muted">{signed} firmada{signed === 1 ? "" : "s"} y visible{signed === 1 ? "" : "s"}</p>
        </div>
        <Link href="/app/compartidos" className="text-sm font-semibold text-pine underline">Compartidos</Link>
      </div>

      <Link href="/app/nueva" className="btn-primary">+ Nuevo día de prueba</Link>

      {rows.length === 0 ? (
        <div className="card text-center">
          <p className="font-semibold">Todavía no tienes constancias</p>
          <p className="mt-1 text-muted">Después de tu próximo día de prueba, regístralo aquí y pide que te lo firmen.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/app/c/${r.id}`} className={`card block transition hover:border-pine ${r.hidden ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{r.business_name}</p>
                    <p className="text-sm text-muted">{r.role} · {fmtDate(r.trial_date)}</p>
                  </div>
                  <Status r={r} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Status({ r }: { r: Row }) {
  if (r.hidden) return <span className="shrink-0 rounded-full bg-line px-2.5 py-1 text-xs font-semibold text-muted">Oculta</span>;
  if (r.signed_at)
    return <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-pine">{Icons.lock} Firmada</span>;
  return <span className="shrink-0 rounded-full bg-clay-soft px-2.5 py-1 text-xs font-semibold text-clay">Falta firma</span>;
}
