"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth/session";
import { criarPatrao } from "@/lib/auth/usuarios";
import { createSupabaseService } from "@/lib/supabase/server";

export async function criarPatraoAction(formData: FormData) {
  await requireSessionUser("super_admin");
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || undefined;
  const codigoAcesso = String(formData.get("codigo_acesso") ?? "").trim();

  if (!nome || !codigoAcesso) {
    redirect("/admin/patroes/novo?error=campos");
  }
  if (codigoAcesso.length < 6) {
    redirect("/admin/patroes/novo?error=codigo_curto");
  }

  const svc = createSupabaseService();
  const { data: existente } = await svc
    .from("usuarios")
    .select("id")
    .eq("codigo_acesso", codigoAcesso)
    .maybeSingle();
  if (existente) {
    redirect("/admin/patroes/novo?error=codigo_recusado");
  }

  try {
    await criarPatrao({ nome, email, codigoAcesso });
  } catch {
    redirect("/admin/patroes/novo?error=codigo_recusado");
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function removerPatraoAction(formData: FormData) {
  const user = await requireSessionUser("super_admin");
  const id = String(formData.get("id"));

  if (id === user.id) {
    redirect("/admin?error=auto");
  }

  const svc = createSupabaseService();
  const { data: alvo } = await svc
    .from("usuarios")
    .select("id,role")
    .eq("id", id)
    .maybeSingle();

  if (!alvo) redirect("/admin?error=nao_existe");
  if (alvo.role === "super_admin") redirect("/admin?error=super_admin");

  await svc.from("usuarios").delete().eq("id", id).eq("role", "patrao");
  revalidatePath("/admin");
  redirect("/admin");
}
