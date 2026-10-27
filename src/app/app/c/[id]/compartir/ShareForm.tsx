"use client";

import { useActionState } from "react";
import { createShare, type LinkState } from "@/app/actions";
import { Submit } from "@/components/Submit";
import { LinkResult } from "@/components/LinkResult";
import { fmtDate } from "@/lib/format";

type R = { id: string; business_name: string; role: string; trial_date: string };

export function ShareForm({ records, current }: { records: R[]; current: string }) {
  const [state, action] = useActionState<LinkState, FormData>(createShare, null);

  if (state?.link) {
    return (
      <div className="card space-y-4">
        <h2 className="h2 text-pine">Enlace listo</h2>
        <p className="text-muted">Mándalo al negocio. Puedes revocarlo cuando quieras desde “Compartidos”.</p>
        <LinkResult link={state.link} message="Hola, aquí están mis constancias de días de prueba en Peldaño:" />
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <div>
        <label className="label" htmlFor="code">Código del Acuerdo</label>
        <input
          className="input font-mono tracking-widest uppercase"
          id="code"
          name="code"
          required
          maxLength={8}
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="3FA9C21B"
        />
      </div>
      <fieldset className="space-y-2">
        <legend className="label">¿Qué constancias compartes?</legend>
        {records.map((r) => (
          <label key={r.id} className="card flex cursor-pointer items-center gap-3 py-3">
            <input type="checkbox" name="record_ids" value={r.id} defaultChecked={r.id === current} className="h-5 w-5 accent-pine" />
            <span>
              <span className="block font-semibold">{r.business_name}</span>
              <span className="text-sm text-muted">{r.role} · {fmtDate(r.trial_date)}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {state?.error && <p role="alert" className="rounded-xl bg-clay-soft px-4 py-3 text-clay">{state.error}</p>}
      <Submit pending="Creando enlace…">Crear enlace para compartir</Submit>
    </form>
  );
}
