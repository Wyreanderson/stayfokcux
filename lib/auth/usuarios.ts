import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createSupabaseService } from "@/lib/supabase/server";
import type { Convite, Usuario } from "@/lib/supabase/types";

export function hashSenha(senha: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(senha, salt, 64);
  return `${salt.toString("hex")}.${hash.toString("hex")}`;
}

export function verificarSenha(senha: string, hashed: string): boolean {
  const idx = hashed.indexOf(".");
  if (idx < 0) return false;
  const salt = Buffer.from(hashed.slice(0, idx), "hex");
  const expected = Buffer.from(hashed.slice(idx + 1), "hex");
  let candidate: Buffer;
  try {
    candidate = scryptSync(senha, salt, expected.length);
  } catch {
    return false;
  }
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export async function criarPatrao(input: {
  nome: string;
  email?: string;
  codigoAcesso: string;
}): Promise<Usuario> {
  const svc = createSupabaseService();
  const { data, error } = await svc
    .from("usuarios")
    .insert({
      nome: input.nome,
      email: input.email || null,
      role: "patrao",
      codigo_acesso: input.codigoAcesso,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Falha ao criar patrão");
  }
  return data as Usuario;
}

export async function gerarConvite(input: {
  patraoId: string;
  nomeSugerido?: string;
}): Promise<Convite> {
  const svc = createSupabaseService();
  const token = randomBytes(16).toString("hex");
  const { data, error } = await svc
    .from("convites")
    .insert({
      token,
      patrao_id: input.patraoId,
      nome_sugerido: input.nomeSugerido ?? null,
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Falha ao gerar convite");
  }
  return data as Convite;
}

export async function buscarConvite(token: string): Promise<Convite | null> {
  const svc = createSupabaseService();
  const { data } = await svc
    .from("convites")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  return (data as Convite) ?? null;
}

export async function usarConvite(
  token: string,
  input: { username: string; senha: string; nome: string },
): Promise<Usuario> {
  const svc = createSupabaseService();

  const convite = await buscarConvite(token);
  if (!convite) throw new Error("Convite inválido");
  if (convite.usado_em) throw new Error("Convite já foi usado");
  if (convite.expira_em && new Date(convite.expira_em) < new Date()) {
    throw new Error("Convite expirado");
  }

  const { data: existente } = await svc
    .from("usuarios")
    .select("id")
    .eq("username", input.username)
    .maybeSingle();
  if (existente) throw new Error("Esse nome de usuário já está em uso");

  const { data: novo, error } = await svc
    .from("usuarios")
    .insert({
      nome: input.nome,
      role: "colaborador",
      patrao_id: convite.patrao_id,
      username: input.username,
      senha_hash: hashSenha(input.senha),
    })
    .select("*")
    .single();
  if (error || !novo) {
    throw new Error(error?.message ?? "Falha ao criar colaborador");
  }

  await svc
    .from("convites")
    .update({
      usado_em: new Date().toISOString(),
      usuario_criado_id: novo.id,
    })
    .eq("id", convite.id);

  return novo as Usuario;
}

export async function buscarUsuarioPorCodigo(
  codigo: string,
): Promise<Usuario | null> {
  const svc = createSupabaseService();
  const { data } = await svc
    .from("usuarios")
    .select("*")
    .eq("codigo_acesso", codigo)
    .in("role", ["super_admin", "patrao"])
    .maybeSingle();
  return (data as Usuario) ?? null;
}

export async function buscarUsuarioPorUsername(
  username: string,
): Promise<Usuario | null> {
  const svc = createSupabaseService();
  const { data } = await svc
    .from("usuarios")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  return (data as Usuario) ?? null;
}
