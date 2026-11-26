"use client";

import { useEffect, useState } from "react";

type Segment = { text: string; className?: string };

// Tape une suite de segments (chacun avec son propre style) lettre par
// lettre, une seule fois au montage, curseur clignotant pendant la frappe
// puis retiré une fois le texte complet affiché. Respecte
// prefers-reduced-motion en affichant tout de suite le texte complet.
export function TypeOnce({
  segments,
  speedMs = 70,
  startDelayMs = 400,
}: {
  segments: Segment[];
  speedMs?: number;
  startDelayMs?: number;
}) {
  const fullLength = segments.reduce((total, s) => total + s.text.length, 0);
  const [count, setCount] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) {
      setCount(fullLength);
      return;
    }
    if (count >= fullLength) return;
    const id = setTimeout(
      () => setCount((c) => c + 1),
      count === 0 ? startDelayMs : speedMs,
    );
    return () => clearTimeout(id);
  }, [count, fullLength, reduced, speedMs, startDelayMs]);

  let remaining = count;
  const rendered = segments.map((segment, i) => {
    const shown = segment.text.slice(
      0,
      Math.max(0, Math.min(segment.text.length, remaining)),
    );
    remaining -= segment.text.length;
    return (
      <span key={i} className={segment.className}>
        {shown}
      </span>
    );
  });

  return (
    <>
      {rendered}
      {count < fullLength ? (
        <span className="animate-pulse" aria-hidden="true">
          |
        </span>
      ) : null}
    </>
  );
}
