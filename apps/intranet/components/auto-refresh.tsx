"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Recharge les données de la page à intervalle régulier (suivi en temps réel).
export function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  const [at, setAt] = useState<string>("");
  useEffect(() => {
    const tick = () => setAt(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(() => {
      router.refresh();
      tick();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return (
    <span className="inline-flex items-center gap-2 text-xs text-ccr-ink/50">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Mis à jour toutes les {seconds} s{at ? `, dernière fois à ${at}` : ""}
    </span>
  );
}
