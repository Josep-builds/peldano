"use client";

import { useActionState } from "react";
import { signRecord, type LinkState } from "@/app/actions";
import { Submit } from "@/components/Submit";
import { Icons } from "@/components/RecordCard";

export function SignForm({ token, defaultName }: { token: string; defaultName: string }) {
  const [state, action] = useActionState<LinkState, FormData>(signRecord, null);

  if (state?.id) {
    return (
      <div className="card space-y-3 text-center">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-mint px-3.5 py-1.5 font-semibold text-pine">{Icons.lock} Firmada · bloqueada</p>
        <h2 className="h2">¡Gracias por firmar!</h2>
        <p className="text-muted">La constancia ya es de quien hizo el trabajo. Nadie la puede cambiar ni borrar.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="label" htmlFor="tasks">Lo que hizo</label>
        <textarea className="input min-h-32" id="tasks" name="tasks" required minLength={10} maxLength={1000}
          placeholder={"Una tarea por línea. Ej.:\nPreparó espressos y lattes\nAtendió clientes en barra\nLimpió el área al cierre"} />
      </div>
      <div>
        <label className="label" htmlFor="observations">Lo que viste</label>
        <textarea className="input min-h-28" id="observations" name="observations" required minLength={10} maxLength={1000}
          placeholder="Cómo trabajó: qué hizo bien, qué aprendió rápido, en qué necesitó ayuda." />
        <p className="hint">Describe con detalle. No hay calificación ni estrellas.</p>
      </div>
      <div>
        <label className="label" htmlFor="observer_name">Tu nombre (como firma)</label>
        <input className="input" id="observer_name" name="observer_name" defaultValue={defaultName} required minLength={2} maxLength={80} autoComplete="name" />
      </div>
      <label className="flex items-start gap-3">
        <input type="checkbox" name="witnessed" required className="mt-1 h-5 w-5 accent-pine" />
        <span>Vi este trabajo en persona y lo que escribí es verdad.</span>
      </label>
      <p className="rounded-xl bg-clay-soft px-4 py-3 text-sm text-clay">
        Al firmar, la constancia queda <strong>bloqueada</strong>: ni tú ni nadie la puede cambiar después. Firmar no te
        obliga a contratar a nadie.
      </p>
      {state?.error && <p role="alert" className="rounded-xl bg-clay-soft px-4 py-3 font-semibold text-clay">{state.error}</p>}
      <Submit pending="Firmando…">Firmar</Submit>
    </form>
  );
}
