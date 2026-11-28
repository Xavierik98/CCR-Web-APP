"use client";

import { useState, type ReactNode } from "react";

const INTRANET_URL = process.env.NEXT_PUBLIC_INTRANET_URL ?? "https://ccr-famille-intranet.vercel.app";

// Envoie un formulaire du site à l'intranet (boîte de réception) et affiche
// le résultat : message de confirmation ou erreur précise.
export function SiteForm({
  endpoint,
  build,
  className,
  children,
  success,
}: {
  endpoint: "/api/message" | "/api/soutien" | `/api/engagement/${string}`;
  build: (fd: FormData) => Record<string, unknown>;
  className?: string;
  children: ReactNode;
  success: ReactNode;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  if (state === "done") return <>{success}</>;
  return (
    <form
      className={className}
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        setError("");
        try {
          const res = await fetch(`${INTRANET_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(build(new FormData(e.currentTarget))),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.ok) setState("done");
          else {
            setState("error");
            setError(data.erreur ?? "L'envoi n'a pas abouti. Réessayez dans un instant.");
          }
        } catch {
          setState("error");
          setError("L'envoi n'a pas abouti. Vérifiez votre connexion et réessayez.");
        }
      }}
    >
      <input type="text" name="site_web" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {children}
      {state === "error" ? <p className="rounded-xl bg-ccr-magenta/10 p-3 text-sm text-ccr-magenta col-span-full">{error}</p> : null}
      <div className="col-span-full">
        <button
          type="submit"
          disabled={state === "sending"}
          className="w-full rounded-2xl bg-ccr-gold px-8 py-3.5 text-sm font-semibold text-ccr-ink transition-colors hover:bg-ccr-gold-light disabled:opacity-60 sm:w-auto sm:rounded-full"
        >
          {state === "sending" ? "Envoi…" : "Envoyer"}
        </button>
      </div>
    </form>
  );
}

export function FormSuccess({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-ccr-gold/10 p-6 text-center">
      <p className="font-display text-xl font-bold">{title}</p>
      <p className="mt-1 text-sm text-ccr-ink/70">{text}</p>
    </div>
  );
}
