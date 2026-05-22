"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";

export function FilaRealtime() {
  const router = useRouter();
  useEffect(() => {
    const sb = createSupabaseBrowser();
    const channel = sb
      .channel("tarefas-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tarefas" },
        () => router.refresh(),
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [router]);
  return null;
}
