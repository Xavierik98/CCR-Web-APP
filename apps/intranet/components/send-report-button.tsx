"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markReportSent } from "@/app/(dashboard)/presences/actions";

// Ouvre WhatsApp avec le rapport prêt à envoyer au pasteur et note l'envoi.
export function SendReportButton({ eventId, href }: { eventId: string; href: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() =>
        start(async () => {
          await markReportSent(eventId);
          router.refresh();
        })
      }
      className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-ccr-ink hover:bg-[#1fbe5a]"
    >
      {pending ? "Envoi noté…" : "Envoyer au pasteur sur WhatsApp"}
    </a>
  );
}
