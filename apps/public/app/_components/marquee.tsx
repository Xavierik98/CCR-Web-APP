import type { ReactNode } from "react";

// Defilement horizontal continu (droite vers gauche). La piste est dupliquee
// une fois pour boucler sans coupure ; l'animation est en CSS pur (globals.css),
// donc ce composant n'a pas besoin d'etre cote client.
export function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
        <div className="flex shrink-0 gap-4">{children}</div>
        <div className="flex shrink-0 gap-4" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
