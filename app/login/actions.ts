"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "pitflow-auth";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/");
  const expected = process.env.APP_PASSWORD;

  if (!expected) {
    redirect("/login?error=config");
  }
  if (password !== expected) {
    redirect("/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  redirect(from.startsWith("/") && !from.startsWith("/login") ? from : "/");
}
