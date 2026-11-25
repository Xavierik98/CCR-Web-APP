"use client";

import { Children, useEffect, useState, type ReactNode } from "react";

// Défilement horizontal continu (droite vers gauche). La piste est dupliquée
// une fois pour boucler sans coupure ; l'animation est en CSS pur (globals.css).
// Avec `shuffle`, l'ordre des photos est mélangé après le premier affichage
// (cote client, pour ne pas casser le rendu statique du serveur).
export function Marquee({
  children,
  shuffle = false,
}: {
  children: ReactNode;
  shuffle?: boolean;
}) {
  const [items, setItems] = useState(() => Children.toArray(children));

  useEffect(() => {
    if (!shuffle) return;
    setItems((current) => {
      const copy = [...current];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
    // On ne mélange qu'une fois, au montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
        <div className="flex shrink-0 gap-4">{items}</div>
        <div className="flex shrink-0 gap-4" aria-hidden="true">
          {items}
        </div>
      </div>
    </div>
  );
}
