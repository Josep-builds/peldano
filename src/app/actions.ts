"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site";
import { dbMessage } from "@/lib/format";
import {
  acuerdoSchema,
  firstError,
  recordSchema,
  shareSchema,
  signSchema,
  uuidSchema,
} from "@/lib/validation";

export type LinkState = { error?: string; link?: string; code?: string; id?: string } | null;

const NOT_SIGNED_IN = { error: "Tu sesión terminó. Vuelve a entrar." };

export async function createRecord(_: LinkState, fd: FormData): Promise<LinkState> {
  const parsed = recordSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { supabase, user } = await getUser();
  if (!user) return NOT_SIGNED_IN;

  const v = parsed.data;
  const { data, error } = await supabase
    .rpc("create_record", {
      p_worker_name: v.worker_name,
      p_business_name: v.business_name,
      p_role: v.role,
      p_trial_date: v.trial_date,
      p_hours: v.hours,
    })
    .single<{ id: string; token: string }>();
  if (error || !data) return { error: dbMessage(error?.message) };

  revalidatePath("/app");
  return { id: data.id, link: `${await siteUrl()}/firmar/${data.token}` };
}

export async function renewLink(_: LinkState, fd: FormData): Promise<LinkState> {
  const id = uuidSchema.safeParse(fd.get("id"));
  if (!id.success) return { error: "Constancia no válida" };

  const { supabase, user } = await getUser();
  if (!user) return NOT_SIGNED_IN;

  const { data, error } = await supabase.rpc("renew_sign_token", { p_record_id: id.data });
  if (error || !data) return { error: dbMessage(error?.message) };
  return { link: `${await siteUrl()}/firmar/${data as string}` };
}

export async function signRecord(_: LinkState, fd: FormData): Promise<LinkState> {
  const parsed = signSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { supabase, user } = await getUser();
  if (!user) return NOT_SIGNED_IN;

  const v = parsed.data;
  const { data, error } = await supabase.rpc("sign_record", {
    p_token: v.token,
    p_tasks: v.tasks,
    p_observations: v.observations,
    p_observer_name: v.observer_name,
  });
  if (error || !data) return { error: dbMessage(error?.message) };
  return { id: data as string };
}

export async function setHidden(fd: FormData) {
  const id = uuidSchema.safeParse(fd.get("id"));
  if (!id.success) return;
  const hidden = fd.get("hidden") === "true";

  const { supabase, user } = await getUser();
  if (!user) return;

  await supabase.rpc("set_record_hidden", { p_record_id: id.data, p_hidden: hidden });
  revalidatePath("/app");
  revalidatePath(`/app/c/${id.data}`);
}

export async function createAcuerdo(_: LinkState, fd: FormData): Promise<LinkState> {
  const parsed = acuerdoSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { supabase, user } = await getUser();
  if (!user) return NOT_SIGNED_IN;

  const v = parsed.data;
  const { data, error } = await supabase.rpc("create_acuerdo", {
    p_business_name: v.business_name,
    p_signer_name: v.signer_name,
    p_n_days: v.n_days,
  });
  if (error || !data) return { error: dbMessage(error?.message) };
  const code = data as string;
  return { code, link: `${await siteUrl()}/acuerdo/${code}` };
}

export async function createShare(_: LinkState, fd: FormData): Promise<LinkState> {
  const parsed = shareSchema.safeParse({ code: fd.get("code") ?? "", record_ids: fd.getAll("record_ids") });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { supabase, user } = await getUser();
  if (!user) return NOT_SIGNED_IN;

  const { data, error } = await supabase.rpc("create_share", {
    p_code: parsed.data.code,
    p_record_ids: parsed.data.record_ids,
  });
  if (error || !data) return { error: dbMessage(error?.message) };

  revalidatePath("/app/compartidos");
  return { link: `${await siteUrl()}/ver/${data as string}` };
}

export async function revokeShare(fd: FormData) {
  const id = uuidSchema.safeParse(fd.get("id"));
  if (!id.success) return;

  const { supabase, user } = await getUser();
  if (!user) return;

  await supabase.rpc("revoke_share", { p_share_id: id.data });
  revalidatePath("/app/compartidos");
}
