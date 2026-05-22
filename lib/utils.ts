import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelative(date: Date | string | null) {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);
  const diffH = Math.round(diffMin / 60);
  const diffD = Math.round(diffH / 24);

  if (Math.abs(diffMin) < 60) {
    if (diffMin === 0) return "agora";
    return diffMin > 0 ? `em ${diffMin}min` : `há ${-diffMin}min`;
  }
  if (Math.abs(diffH) < 24) {
    return diffH > 0 ? `em ${diffH}h` : `há ${-diffH}h`;
  }
  if (diffD === 0) return "hoje";
  if (diffD === 1) return "amanhã";
  if (diffD === -1) return "ontem";
  if (diffD > 0 && diffD < 7) return `em ${diffD} dias`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
