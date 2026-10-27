export function fmtDate(d: string) {
  return new Date(d.length === 10 ? d + "T12:00:00" : d).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Mexico_City",
  });
}

export function fmtDateTime(d: string) {
  return new Date(d).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  });
}

export function todayMx() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
}

export function waLink(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Map database errors to short messages; never show raw SQL errors. */
export function dbMessage(message: string | undefined): string {
  const known = [
    "Este enlace ya no es válido",
    "No puedes firmar tu propia constancia",
    "La fecha debe estar dentro del último año",
    "No encontramos ese Acuerdo",
    "Elige entre 1 y 10 constancias",
    "Solo puedes compartir constancias firmadas y visibles",
  ];
  const hit = known.find((k) => message?.includes(k));
  return hit ?? "Algo salió mal. Intenta otra vez.";
}
