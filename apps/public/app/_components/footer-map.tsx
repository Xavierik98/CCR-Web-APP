"use client";

import { usePathname } from "next/navigation";

// Carte du pied de page, masquée sur /contact où la grande carte est déjà
// affichée juste au-dessus.
export function FooterMap({ src, title }: { src: string; title: string }) {
  if (usePathname() === "/contact") return null;
  return (
    <div className="mt-4 aspect-[16/10] w-full overflow-hidden rounded-2xl ring-1 ring-ccr-gold/30">
      <iframe
        title={title}
        src={src}
        className="h-full w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
