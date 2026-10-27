import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { fmtDate } from "@/lib/format";
import { revokeShare } from "@/app/actions";
import { Submit } from "@/components/Submit";

export const metadata = { title: "Compartidos" };

type S = { id: string; created_at: string; revoked_at: string | null; business_name: string; n_days: number; n_records: number };

export default async function Compartidos() {
  const { supabase, user } = await getUser();
  if (!user) redirect("/entrar?next=/app/compartidos");
  const { data } = await supabase.rpc("list_my_shares");
  const shares = (data ?? []) as S[];

  return (
    <div className="space-y-5 pt-2">
      <Link href="/app" className="text-sm font-semibold text-pine">← Mis constancias</Link>
      <h1 className="h1">Compartidos</h1>
      <p className="text-muted">Los enlaces que has mandado. Si revocas uno, el negocio ya no ve nada.</p>
      {shares.length === 0 ? (
        <p className="card text-muted">Todavía no has compartido constancias.</p>
      ) : (
        <ul className="space-y-3">
          {shares.map((s) => (
            <li key={s.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{s.business_name}</p>
                  <p className="text-sm text-muted">
                    {s.n_records} constancia{s.n_records === 1 ? "" : "s"} · pide {s.n_days} · {fmtDate(s.created_at)}
                  </p>
                </div>
                {s.revoked_at && <span className="rounded-full bg-line px-2.5 py-1 text-xs font-semibold text-muted">Revocado</span>}
              </div>
              {!s.revoked_at && (
                <form action={revokeShare}>
                  <input type="hidden" name="id" value={s.id} />
                  <Submit className="btn-ghost" pending="Revocando…">Revocar enlace</Submit>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
