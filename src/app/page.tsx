import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8 pt-4">
      <section className="space-y-4">
        <p className="text-sm font-semibold tracking-wide text-clay uppercase">Para quien hace días de prueba</p>
        <h1 className="text-[2.3rem] leading-[1.1] font-bold tracking-tight text-pine">
          Tu día de prueba sí cuenta.
        </h1>
        <p className="text-lg text-muted">
          Trabajaste el turno completo y nadie te llamó. Con Peldaño, quien te vio trabajar firma una constancia de lo que
          hiciste. Es tuya, nadie la puede borrar y la llevas a tu siguiente trabajo.
        </p>
        <div className="space-y-3 pt-2">
          <Link href="/entrar?next=/app/nueva" className="btn-primary">Pedir mi primera constancia</Link>
          <Link href="/producto" className="btn-ghost">Cómo funciona</Link>
        </div>
      </section>

      <section className="grid gap-3">
        {[
          ["Firmada por una persona", "La firma quien te vio trabajar. Nunca una computadora."],
          ["Sin calificaciones", "No hay estrellas ni puntos. Solo lo que hiciste y lo que vieron."],
          ["Tuya", "Tú decides quién la ve. Puedes ocultarla, nadie la puede borrar."],
        ].map(([t, d]) => (
          <div key={t} className="card">
            <h2 className="h2 text-pine">{t}</h2>
            <p className="mt-1 text-muted">{d}</p>
          </div>
        ))}
      </section>

      <section className="card bg-mint/50">
        <h2 className="h2">¿Tienes un negocio?</h2>
        <p className="mt-1 text-muted">
          Firma un Acuerdo: aceptas que cierto número de días de prueba firmados cuentan como experiencia. No es una
          promesa de contratar.
        </p>
        <Link href="/acuerdo/nuevo" className="mt-4 inline-block font-semibold text-pine underline">Firmar un Acuerdo →</Link>
      </section>
    </div>
  );
}
