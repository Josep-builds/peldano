"use client";

import { useActionState } from "react";
import { renewLink, type LinkState } from "@/app/actions";
import { Submit } from "@/components/Submit";
import { LinkResult } from "@/components/LinkResult";

export function RenewLink({ id }: { id: string }) {
  const [state, action] = useActionState<LinkState, FormData>(renewLink, null);
  if (state?.link) {
    return (
      <LinkResult
        link={state.link}
        message="Hola, ¿me ayudas a firmar la constancia de mi día de prueba? Son 2 minutos:"
        note="El enlace anterior ya no funciona. Este dura 7 días."
      />
    );
  }
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <Submit className="btn-primary" pending="Generando…">Generar enlace para firmar</Submit>
      <p className="hint text-center">Si perdiste el enlace o ya pasaron 7 días, genera uno nuevo.</p>
      {state?.error && <p role="alert" className="text-clay">{state.error}</p>}
    </form>
  );
}
