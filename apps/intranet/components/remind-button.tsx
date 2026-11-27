"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { remindPledge } from "@/app/(dashboard)/collecte/actions";

// Un clic : WhatsApp s'ouvre avec le message de rappel prêt à envoyer, et la
// relance est notée (date, nombre). L'engagement quitte alors la liste des
// personnes à relancer, l'agenda et les rappels.
export function RemindButton({ pledgeId, href, compact = false }: { pledgeId: string; href: string; compact?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        setDone(true);
        start(async () => {
          await remindPledge(pledgeId);
          router.refresh();
        });
      }}
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-semibold transition-colors ${
        compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      } ${done ? "bg-ccr-ink/5 text-ccr-ink/60" : "bg-[#25D366] text-ccr-ink hover:bg-[#1fbe5a]"}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
      </svg>
      {done ? (pending ? "Relance notée…" : "Relancé") : "Relancer"}
    </a>
  );
}
