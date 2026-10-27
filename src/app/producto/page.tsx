import Link from "next/link";
import { RecordCard } from "@/components/RecordCard";

const example = {
  worker_name: "Iván (ejemplo)",
  business_name: "Café La Esquina (ejemplo)",
  role: "Barista",
  trial_date: "2026-10-24",
  hours: 6,
  tasks: "Preparación de bebidas de café (espresso, capuccino, latte).\nAtención y servicio a clientes en barra y mesa.\nApoyo en limpieza y organización del área de trabajo.",
  observations: "Se adaptó rápido al ritmo de la cafetería. Aprendió la máquina de espresso en la primera hora y atendió la barra solo en la tarde. Fue puntual y pidió ayuda cuando no sabía algo.",
  observer_name: "Rosa M. (ejemplo)",
  signed_at: "2026-10-24T20:15:00-06:00",
};

export const metadata = { title: "Cómo funciona" };

const steps = [
  ["Haces tu día de prueba", "En un café, restaurante o tienda. Peldaño no crea días de prueba: registra los que ya pasan."],
  ["Mandas un enlace por WhatsApp", "Anotas el negocio, el puesto, la fecha y las horas. Le mandas el enlace a quien te vio trabajar."],
  ["Esa persona firma", "Escribe lo que hiciste y lo que vio. Al firmar, la constancia queda bloqueada: nadie la puede cambiar ni borrar."],
  ["La llevas contigo", "La compartes con un negocio que firmó un Acuerdo. Ese negocio ve tus constancias y cuántas lleva de las que pidió."],
];

export default function Producto() {
  return (
    <div className="space-y-6 pt-4">
      <h1 className="h1">Cómo funciona</h1>
      <ol className="space-y-3">
        {steps.map(([t, d], i) => (
          <li key={t} className="card flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine font-bold text-white">{i + 1}</span>
            <div>
              <h2 className="h2">{t}</h2>
              <p className="mt-1 text-muted">{d}</p>
            </div>
          </li>
        ))}
      </ol>
      <section className="space-y-3">
        <h2 className="h2">Así se ve una constancia</h2>
        <RecordCard r={example} showWorker />
        <p className="text-center text-sm text-muted">Datos de ejemplo</p>
      </section>
      <div className="card">
        <h2 className="h2">Lo que Peldaño nunca hace</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          <li>No califica a nadie. No hay estrellas ni puntos.</li>
          <li>No publica vacantes ni promete trabajo.</li>
          <li>No ayuda a nadie a conseguir trabajo gratis.</li>
          <li>No usa inteligencia artificial para juzgar tu trabajo.</li>
        </ul>
      </div>
      <Link href="/entrar?next=/app/nueva" className="btn-primary">Empezar</Link>
    </div>
  );
}
