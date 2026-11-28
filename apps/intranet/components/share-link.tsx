"use client";

import { useState } from "react";

// Lien du formulaire public à partager : copier, ou envoyer sur WhatsApp.
export function ShareLink({ url, message }: { url: string; message: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center gap-2 rounded-xl border border-ccr-ink/10 bg-ccr-cream/60 p-2">
        <span className="min-w-0 flex-1 truncate px-1 text-sm">{url}</span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              window.prompt("Copiez le lien :", url);
            }
          }}
          className="shrink-0 rounded-full bg-ccr-ink px-3 py-1.5 text-xs font-semibold text-ccr-cream"
        >
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${message}\n${url}`)}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-ccr-ink hover:bg-[#1fbe5a]"
      >
        Partager sur WhatsApp
      </a>
    </div>
  );
}
