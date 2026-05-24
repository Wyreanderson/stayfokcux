"use server";

import { redirect } from "next/navigation";
import {
  buscarUsuarioPorCodigo,
  buscarUsuarioPorUsername,
  verificarSenha,
} from "@/lib/auth/usuarios";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";

export async function login(formData: FormData) {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const from = String(formData.get("from") ?? "/");

  if (!senha) redirect("/login?error=1");

  let user = null;
  if (usuario) {
    const candidato = await buscarUsuarioPorUsername(usuario);
    if (
      candidato &&
      candidato.senha_hash &&
      verificarSenha(senha, candidato.senha_hash)
    ) {
      user = candidato;
    }
  } else {
    user = await buscarUsuarioPorCodigo(senha);
  }

  if (!user) redirect("/login?error=1");

  await setSessionCookie(user.id, user.role);

  if (user.role === "colaborador") {
    redirect("/colaborador");
  }
  const dest = from.startsWith("/") && !from.startsWith("/login") ? from : "/";
  redirect(dest);
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
