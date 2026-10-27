"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createRecord, type LinkState } from "@/app/actions";
import { Submit } from "@/components/Submit";
import { LinkResult } from "@/components/LinkResult";

export function NewRecordForm({ defaultName, today }: { defaultName: string; today: string }) {
  const [state, action] = useActionState<LinkState, FormData>(createRecord, null);

  if (state?.link) {
    return (
      <div className="card space-y-4">
        <h2 className="h2 text-pine">¡Listo! Ahora pide la firma</h2>
        <p className="text-muted">
          Manda este enlace a la persona que te vio trabajar (el dueño o encargado). Funciona una sola vez y dura 7 días.
        </p>
        <LinkResult
          link={state.link}
          message="Hola, ¿me ayudas a firmar la constancia de mi día de prueba? Son 2 minutos:"
        />
        <Link href={`/app/c/${state.id}`} className="block text-center font-semibold text-pine underline">Ver mi constancia</Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      <div>
        <label className="label" htmlFor="worker_name">Tu nombre</label>
        <input className="input" id="worker_name" name="worker_name" defaultValue={defaultName} required minLength={2} maxLength={80} autoComplete="name" />
        <p className="hint">Así aparecerá en tu constancia.</p>
      </div>
      <div>
        <label className="label" htmlFor="business_name">Negocio</label>
        <input className="input" id="business_name" name="business_name" required minLength={2} maxLength={80} placeholder="Ej. Café La Esquina" />
      </div>
      <div>
        <label className="label" htmlFor="role">Puesto</label>
        <input className="input" id="role" name="role" required minLength={2} maxLength={80} placeholder="Ej. Barista, mesero, cajero" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="trial_date">Fecha</label>
          <input className="input" id="trial_date" name="trial_date" type="date" defaultValue={today} max={today} required />
        </div>
        <div>
          <label className="label" htmlFor="hours">Horas</label>
          <input className="input" id="hours" name="hours" type="number" inputMode="numeric" min={1} max={14} defaultValue={6} required />
        </div>
      </div>
      {state?.error && <p role="alert" className="rounded-xl bg-clay-soft px-4 py-3 text-clay">{state.error}</p>}
      <Submit pending="Creando…">Crear y pedir firma</Submit>
    </form>
  );
}
