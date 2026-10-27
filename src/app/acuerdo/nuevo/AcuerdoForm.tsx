"use client";

import { useActionState, useState } from "react";
import { createAcuerdo, type LinkState } from "@/app/actions";
import { Submit } from "@/components/Submit";
import { LinkResult } from "@/components/LinkResult";

export function AcuerdoForm({ defaultName }: { defaultName: string }) {
  const [state, action] = useActionState<LinkState, FormData>(createAcuerdo, null);
  const [n, setN] = useState(3);

  if (state?.code && state.link) {
    return (
      <div className="card space-y-4">
        <h2 className="h2 text-pine">Acuerdo firmado</h2>
        <p className="text-muted">Da este código a los candidatos. Con él te comparten sus constancias.</p>
        <p className="rounded-xl bg-mint py-4 text-center font-mono text-3xl font-bold tracking-[0.25em] text-pine">{state.code}</p>
        <LinkResult link={state.link} message="Este es nuestro Acuerdo en Peldaño. Compárteme tus constancias con este código:" />
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      <div>
        <label className="label" htmlFor="business_name">Negocio</label>
        <input className="input" id="business_name" name="business_name" required minLength={2} maxLength={80} placeholder="Ej. Restaurante Norte" />
      </div>
      <div>
        <label className="label" htmlFor="signer_name">Tu nombre (quien firma)</label>
        <input className="input" id="signer_name" name="signer_name" defaultValue={defaultName} required minLength={2} maxLength={80} />
      </div>
      <div>
        <label className="label" htmlFor="n_days">Días de prueba firmados que cuentan como experiencia</label>
        <input className="input" id="n_days" name="n_days" type="number" inputMode="numeric" min={1} max={10} value={n}
          onChange={(e) => setN(Number(e.target.value))} required />
      </div>
      <div className="card bg-paper text-sm">
        <p className="font-semibold">Lo que firmas:</p>
        <p className="mt-1 text-muted">
          “Aceptamos {Number.isFinite(n) && n >= 1 && n <= 10 ? n : "N"} constancias firmadas de días de prueba como
          experiencia para puestos de entrada. <strong>No es una promesa de contratación.</strong>”
        </p>
      </div>
      <label className="flex items-start gap-3">
        <input type="checkbox" name="agree" required className="mt-1 h-5 w-5 accent-pine" />
        <span>Estoy de acuerdo y puedo firmar por este negocio.</span>
      </label>
      {state?.error && <p role="alert" className="rounded-xl bg-clay-soft px-4 py-3 text-clay">{state.error}</p>}
      <Submit pending="Firmando…">Firmar Acuerdo</Submit>
    </form>
  );
}
