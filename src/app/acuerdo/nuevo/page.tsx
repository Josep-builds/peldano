import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { AcuerdoForm } from "./AcuerdoForm";

export const metadata = { title: "Firmar un Acuerdo" };

export default async function NuevoAcuerdo() {
  const { user } = await getUser();
  if (!user) redirect("/entrar?next=/acuerdo/nuevo");
  const name = (user.user_metadata?.full_name as string | undefined)?.slice(0, 80) ?? "";
  return (
    <div className="space-y-5 pt-2">
      <h1 className="h1">Acuerdo para negocios</h1>
      <p className="text-muted">
        Muchos jóvenes ya demostraron su trabajo en días de prueba en otros negocios. Con este Acuerdo aceptas que cierto
        número de esos días, firmados por quien los vio, cuentan como experiencia para puestos de entrada.
      </p>
      <AcuerdoForm defaultName={name} />
    </div>
  );
}
