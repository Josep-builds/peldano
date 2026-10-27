export const metadata = { title: "Privacidad" };

export default function Privacidad() {
  return (
    <article className="space-y-6 pt-4">
      <h1 className="h1">Privacidad</h1>

      <section className="space-y-2">
        <h2 className="h2">Qué datos guardamos</h2>
        <p className="text-muted">
          Tu nombre y correo de Google (para saber quién firma y quién hace cada día de prueba), las constancias que
          creas o firmas, los Acuerdos que firmas como negocio, y los enlaces para compartir que generas.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="h2">Para qué los usamos</h2>
        <p className="text-muted">
          Solo para identificar quién firma cada constancia y para mostrarte, a ti y a quien tú decidas, las
          constancias que elijas compartir. Nada más.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="h2">Lo que no hacemos</h2>
        <p className="text-muted">No vendemos ni compartimos tus datos con terceros.</p>
      </section>

      <section className="space-y-2">
        <h2 className="h2">Tus constancias</h2>
        <p className="text-muted">
          Una vez firmada, una constancia no se borra: así nadie puede hacer desaparecer lo que trabajaste. Tú puedes
          ocultarla cuando quieras, y solo tú decides con quién la compartes.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="h2">Contacto</h2>
        <p className="text-muted">
          Preguntas sobre tus datos:{" "}
          <a className="font-semibold text-pine underline" href="mailto:josep.builds@gmail.com">
            josep.builds@gmail.com
          </a>
        </p>
      </section>
    </article>
  );
}
