import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { todayMx } from "@/lib/format";
import { NewRecordForm } from "./NewRecordForm";

export const metadata = { title: "Nuevo día de prueba" };

export default async function Nueva() {
  const { user } = await getUser();
  if (!user) redirect("/entrar?next=/app/nueva");
  const name = (user.user_metadata?.full_name as string | undefined)?.slice(0, 80) ?? "";
  return (
    <div className="space-y-5 pt-2">
      <h1 className="h1">Nuevo día de prueba</h1>
      <p className="text-muted">Anota dónde fue. Luego le mandas un enlace a quien te vio trabajar para que lo firme.</p>
      <NewRecordForm defaultName={name} today={todayMx()} />
    </div>
  );
}
