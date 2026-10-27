import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { uuidSchema } from "@/lib/validation";
import { ShareForm } from "./ShareForm";

export const metadata = { title: "Compartir" };

export default async function Compartir({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();

  const { supabase, user } = await getUser();
  if (!user) redirect(`/entrar?next=/app/c/${id}/compartir`);

  const { data } = await supabase
    .from("records")
    .select("id,business_name,role,trial_date")
    .eq("worker_id", user.id)
    .not("signed_at", "is", null)
    .eq("hidden", false)
    .order("trial_date", { ascending: false })
    .returns<{ id: string; business_name: string; role: string; trial_date: string }[]>();
  const records = data ?? [];
  if (!records.some((r) => r.id === id)) notFound();

  return (
    <div className="space-y-5 pt-2">
      <Link href={`/app/c/${id}`} className="text-sm font-semibold text-pine">← Constancia</Link>
      <h1 className="h1">Compartir con un negocio</h1>
      <p className="text-muted">
        Pide al negocio el código de su Acuerdo (8 letras y números). El Acuerdo dice cuántos días de prueba firmados acepta
        como experiencia.
      </p>
      <ShareForm records={records} current={id} />
    </div>
  );
}
