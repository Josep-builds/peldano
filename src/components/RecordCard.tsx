import { fmtDate, fmtDateTime } from "@/lib/format";

export type RecordView = {
  worker_name: string;
  business_name: string;
  role: string;
  trial_date: string;
  hours: number;
  tasks: string | null;
  observations: string | null;
  observer_name: string | null;
  signed_at: string | null;
};

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 text-muted">
      <span className="text-ink/70">{icon}</span>
      {children}
    </li>
  );
}

const ico = "h-5 w-5";
export const Icons = {
  cal: <svg className={ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M8 3v4M16 3v4M3.5 10h17" /></svg>,
  clock: <svg className={ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>,
  bag: <svg className={ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3.5" y="7" width="17" height="12.5" rx="2" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17" /></svg>,
  lock: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10V8a5 5 0 0 1 10 0v2h.5A1.5 1.5 0 0 1 19 11.5v8a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-8A1.5 1.5 0 0 1 6.5 10H7Zm2 0h6V8a3 3 0 0 0-6 0v2Z" /></svg>,
};

export function RecordCard({ r, showWorker = false }: { r: RecordView; showWorker?: boolean }) {
  const tasks = (r.tasks ?? "").split("\n").map((t) => t.trim()).filter(Boolean);
  return (
    <div className="space-y-3">
      <div className="card">
        {showWorker && <p className="mb-1 text-sm font-semibold text-clay">{r.worker_name}</p>}
        <h2 className="text-xl font-bold">{r.business_name}</h2>
        <ul className="mt-3 space-y-2">
          <Meta icon={Icons.cal}>{fmtDate(r.trial_date)}</Meta>
          <Meta icon={Icons.clock}>{r.hours} {r.hours === 1 ? "hora" : "horas"}</Meta>
          <Meta icon={Icons.bag}>{r.role}</Meta>
        </ul>
      </div>

      {r.signed_at ? (
        <>
          <div className="card">
            <h3 className="h2">Lo que hizo</h3>
            <ul className="mt-2 space-y-1.5">
              {tasks.map((t, i) => (
                <li key={i} className="flex gap-2.5"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-pine" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3 className="h2">Lo que vio quien firma</h3>
            <p className="mt-2 whitespace-pre-line text-muted">{r.observations}</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-mint px-3.5 py-1.5 text-sm font-semibold text-pine">
              {Icons.lock} Firmada por {r.observer_name} · bloqueada
            </p>
            <p className="mt-2 text-xs text-muted">Firmada el {fmtDateTime(r.signed_at)} · No se puede cambiar ni borrar.</p>
          </div>
        </>
      ) : (
        <div className="card border-dashed">
          <p className="font-semibold">Falta la firma</p>
          <p className="mt-1 text-muted">Manda el enlace a quien te vio trabajar. Cuando firme, aquí aparecerá lo que escribió.</p>
        </div>
      )}
    </div>
  );
}
