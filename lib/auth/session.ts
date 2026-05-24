import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseService } from "@/lib/supabase/server";
import type { Usuario, Role } from "@/lib/supabase/types";

export const SESSION_COOKIE = "pitflow-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getSecret(): string {
  const s = process.env.AUTH_SIGNING_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SIGNING_SECRET ausente ou muito curto (min 32 chars)");
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export type SessionPayload = {
  userId: string;
  role: Role;
  exp: number;
};

export function signCookieValue(userId: string, role: Role): string {
  const exp = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${userId}:${role}:${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyCookieValue(value: string): SessionPayload | null {
  const idx = value.lastIndexOf(".");
  if (idx < 0) return null;
  const payload = value.slice(0, idx);
  const sig = value.slice(idx + 1);
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
      return null;
    }
  } catch {
    return null;
  }

  const parts = payload.split(":");
  if (parts.length !== 3) return null;
  const [userId, role, expStr] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  if (!["super_admin", "patrao", "colaborador"].includes(role)) return null;
  return { userId, role: role as Role, exp };
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const c = await cookies();
  const v = c.get(SESSION_COOKIE)?.value;
  if (!v) return null;
  return verifyCookieValue(v);
}

export async function getSessionUser(): Promise<Usuario | null> {
  const p = await getSessionPayload();
  if (!p) return null;
  const svc = createSupabaseService();
  const { data } = await svc
    .from("usuarios")
    .select("*")
    .eq("id", p.userId)
    .maybeSingle();
  return (data as Usuario) ?? null;
}

export async function requireSessionUser(
  allowedRoles?: Role | Role[],
): Promise<Usuario> {
  const u = await getSessionUser();
  if (!u) redirect("/login");
  if (allowedRoles) {
    const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!allowed.includes(u.role)) {
      redirect(u.role === "colaborador" ? "/colaborador" : "/");
    }
  }
  return u;
}

export async function setSessionCookie(userId: string, role: Role) {
  const c = await cookies();
  c.set(SESSION_COOKIE, signCookieValue(userId, role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
}
