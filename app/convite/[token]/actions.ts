"use server";

import { redirect } from "next/navigation";
import { setSessionCookie } from "@/lib/auth/session";
import { usarConvite } from "@/lib/auth/usuarios";

export async function aceitarConviteAction(formData: FormData) {
  const token = String(formData.get("token"));
  const usernameRaw = String(formData.get("username") ?? "");
  const username = usernameRaw.trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();

  if (!nome) {
    redirect(`/convite/${token}?error=nome`);
  }
  if (!username || username.length < 3) {
    redirect(`/convite/${token}?error=username`);
  }
  if (/\s/.test(username)) {
    redirect(`/convite/${token}?error=username_espaco`);
  }
  if (!senha || senha.length < 6) {
    redirect(`/convite/${token}?error=senha`);
  }

  let user;
  try {
    user = await usarConvite(token, { username, senha, nome });
  } catch (e) {
    const msg = e instanceof Error ? encodeURIComponent(e.message) : "erro";
    redirect(`/convite/${token}?error=${msg}`);
  }

  await setSessionCookie(user.id, user.role);
  redirect("/colaborador");
}
