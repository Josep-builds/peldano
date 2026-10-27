import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { tokenSchema } from "@/lib/validation";
import { fmtDate } from "@/lib/format";
import { Icons } from "@/components/RecordCard";
import { SignForm } from "./SignForm";

export const metadata = { title: "Firmar constancia", robots: { index: false } };

type ToSign = { worker_name: string; business_name: string; role: string; trial_date: string; hours: number; is_own: boolean };

function Invalid() {
  return (
    <div className="space-y-4 pt-6">
      <h1 className="h1">Este enlace ya no es válido</h1>
      <p className="text-muted">
        Ya se firmó, ya pasaron 7 días o el enlace está incompleto. Pide a la persona que te lo mandó que genere uno nuevo
        desde Peldaño.
      </p>
    </div>
  );
}

export default async function Firmar({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!tokenSchema.safeParse(token).success) return <Invalid />;

  const { supabase, user } = await getUser();
  if (!user) redirect(`/entrar?next=/firmar/${token}`);

  const { data } = await supabase.rpc("get_record_to_sign", { p_token: token }).maybeSingle<ToSign>();
  if (!data) return <Invalid />;

  if (data.is_own) {
    return (
      <div className="space-y-4 pt-6">
        <h1 className="h1">Este enlace es para quien te vio trabajar</h1>
        <p className="text-muted">No puedes firmar tu propia constancia. Mándale el enlace al dueño o encargado del negocio.</p>
      </div>
    );
  }

  const name = (user.user_metadata?.full_name as string | undefined)?.slice(0, 80) ?? "";

  return (
    <div className="space-y-5 pt-2">
      <h1 className="h1">Firmar día de prueba</h1>
      <p className="text-muted">
        <strong className="text-ink">{data.worker_name}</strong> te pide que confirmes el trabajo que hizo en su día de
        prueba. Toma 2 minutos.
      </p>
      <div className="card">
        <p className="text-xl font-bold">{data.business_name}</p>
        <ul className="mt-3 space-y-2 text-muted">
          <li className="flex items-center gap-2.5">{Icons.cal} {fmtDate(data.trial_date)}</li>
          <li className="flex items-center gap-2.5">{Icons.clock} {data.hours} {data.hours === 1 ? "hora" : "horas"}</li>
          <li className="flex items-center gap-2.5">{Icons.bag} {data.role}</li>
        </ul>
      </div>
      <SignForm token={token} defaultName={name} />
    </div>
  );
}
