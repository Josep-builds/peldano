export const metadata = { title: "Por qué existe" };

export default function Nosotros() {
  return (
    <article className="space-y-6 pt-4">
      <h1 className="h1">Por qué existe Peldaño</h1>

      <section className="space-y-2">
        <h2 className="h2">La necesidad</h2>
        <p className="text-muted">
          Un joven hace un día de prueba en un negocio pequeño, a veces sin pago. Trabaja el turno completo y nadie lo llama.
          El trabajo fue real, pero nada lo registra. En la siguiente entrevista vuelve a oír “no tienes experiencia”, y paga
          otro día de prueba. Es un costo real que no se puede probar, así que nadie tiene que responder por él.
        </p>
        <blockquote className="border-l-4 border-clay pl-4 text-ink italic">
          “Uno va con la intención de conseguir trabajo, le echas ganas y al final ni te hablan.”
          <span className="mt-1 block text-sm text-muted not-italic">— trabajador entrevistado en CDMX, octubre 2026</span>
        </blockquote>
      </section>

      <section className="space-y-2">
        <h2 className="h2">Quién paga</h2>
        <p className="text-muted">
          El trabajador paga cero: él ya carga el costo. Quién paga todavía no está decidido. Las opciones que estamos
          probando son un tercero que ya financia empleo juvenil, o negocios a los que la rotación les cuesta.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="h2">El caso 10:1</h2>
        <p className="text-muted">
          Hoy, cada día de prueba sin respuesta cuesta un día de ingreso más el transporte, y la prueba de ese día se
          pierde. Una constancia firmada se reutiliza en cada solicitud siguiente sin costo para el trabajador, así que su
          valor crece con cada día de prueba que ahorra. Un estudio en una plataforma de trabajo (Pallais, 2014) encontró que
          dar a trabajadores sin experiencia una evaluación detallada y pública casi triplicó sus ingresos en dos meses.
        </p>
        <p className="card text-sm text-muted">
          <strong className="text-ink">Lo que todavía no sabemos:</strong> cuántos pesos cuesta un día de prueba sin pago y
          cuántos días de prueba hace alguien antes de que lo contraten. Hasta tener esos números de trabajadores reales, el
          10:1 es una estructura, no un resultado. Tampoco sabemos si los negocios firmarán el Acuerdo: es lo que estamos
          probando ahora.
        </p>
      </section>
    </article>
  );
}
