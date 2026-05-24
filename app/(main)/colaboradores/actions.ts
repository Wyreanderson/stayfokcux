"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/session";
import { gerarConvite } from "@/lib/auth/usuarios";
import { createSupabaseService } from "@/lib/supabase/server";

export async function novoConviteAction(formData: FormData) {
  const user = await requireSessionUser(["patrao", "super_admin"]);
  const nomeSugerido =
    String(formData.get("nome_sugerido") ?? "").trim() || undefined;
  await gerarConvite({ patraoId: user.id, nomeSugerido });
  revalidatePath("/colaboradores");
  redirect("/colaboradores");
}

export async function revogarConviteAction(formData: FormData) {
  const user = await requireSessionUser(["patrao", "super_admin"]);
  const id = String(formData.get("id"));
  const svc = createSupabaseService();
  await svc.from("convites").delete().eq("id", id).eq("patrao_id", user.id);
  revalidatePath("/colaboradores");
}

export async function removerColaboradorAction(formData: FormData) {
  const user = await requireSessionUser(["patrao", "super_admin"]);
  const id = String(formData.get("id"));
  const svc = createSupabaseService();
  await svc
    .from("usuarios")
    .delete()
    .eq("id", id)
    .eq("patrao_id", user.id)
    .eq("role", "colaborador");
  revalidatePath("/colaboradores");
}
