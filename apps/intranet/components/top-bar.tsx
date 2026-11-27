"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "./icons";

// Barre en haut de chaque page : retour à la page précédente (sauf sur le
// tableau de bord) et accès direct au site public.
export function TopBar({ siteUrl }: { siteUrl: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const home = pathname === "/tableau-de-bord";

  return (
    <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
      {home ? (
        <span />
      ) : (
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/tableau-de-bord"))}
          className="inline-flex items-center gap-1.5 rounded-full border border-ccr-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ccr-ink/80 transition-colors hover:border-ccr-ink/40 hover:text-ccr-ink"
        >
          <Icon name="arrow" className="h-4 w-4 rotate-180" />
          Retour
        </button>
      )}
      <a
        href={siteUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-ccr-ink px-4 py-2 text-sm font-semibold text-ccr-cream transition-colors hover:bg-ccr-ink/85"
      >
        Voir le site web
        <Icon name="arrow" className="h-4 w-4 -rotate-45" />
      </a>
    </div>
  );
}
