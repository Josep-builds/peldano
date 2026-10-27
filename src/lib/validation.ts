import { z } from "zod";

const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `Escribe ${label}` })
    .trim()
    .min(min, `${label[0].toUpperCase() + label.slice(1)}: mínimo ${min} letras`)
    .max(max, `${label[0].toUpperCase() + label.slice(1)}: máximo ${max} letras`);

export const recordSchema = z.object({
  worker_name: text(2, 80, "tu nombre"),
  business_name: text(2, 80, "el negocio"),
  role: text(2, 80, "el puesto"),
  trial_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Elige la fecha")
    .refine((d) => {
      const day = new Date(d + "T12:00:00");
      const now = new Date();
      const yearAgo = new Date(now.getTime() - 365 * 864e5);
      return day <= now && day >= yearAgo;
    }, "La fecha debe estar dentro del último año, y no en el futuro"),
  hours: z.coerce.number({ error: "Escribe las horas" }).int("Horas completas").min(1, "Mínimo 1 hora").max(14, "Máximo 14 horas"),
});

export const signSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  tasks: text(10, 1000, "lo que hizo"),
  observations: text(10, 1000, "lo que viste"),
  observer_name: text(2, 80, "tu nombre"),
  witnessed: z.literal("on", { error: "Confirma que viste el trabajo en persona" }),
});

export const acuerdoSchema = z.object({
  business_name: text(2, 80, "el negocio"),
  signer_name: text(2, 80, "tu nombre"),
  n_days: z.coerce.number().int().min(1, "Mínimo 1 día").max(10, "Máximo 10 días"),
  agree: z.literal("on", { error: "Marca que estás de acuerdo" }),
});

export const shareSchema = z.object({
  code: z
    .string()
    .trim()
    .transform((s) => s.toUpperCase())
    .pipe(z.string().regex(/^[A-F0-9]{8}$/, "El código tiene 8 letras y números (ej. 3FA9C21B)")),
  record_ids: z.array(z.uuid()).min(1, "Elige al menos una constancia").max(10, "Máximo 10 constancias"),
});

export const uuidSchema = z.uuid();
export const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/);

export function firstError(e: z.ZodError): string {
  return e.issues[0]?.message ?? "Revisa los datos";
}
