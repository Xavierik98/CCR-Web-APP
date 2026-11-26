"use client";

import { useEffect, useState } from "react";

type Segment = { text: string; className?: string };

// Tape une suite de segments (chacun avec son propre style) lettre par
// lettre. Avec `loop`, le texte complet reste affiché un moment, s'efface puis
// se retape indéfiniment ; sans `loop`, il est tapé une seule fois. Le
// curseur clignote pendant la frappe. Respecte prefers-reduced-motion en
// affichant tout de suite le texte complet.
export function TypeOnce({
  segments,
  speedMs = 80,
  deleteSpeedMs = 40,
  startDelayMs = 400,
  holdMs = 2600,
  loop = false,
}: {
  segments: Segment[];
  speedMs?: number;
  deleteSpeedMs?: number;
  startDelayMs?: number;
  holdMs?: number;
  loop?: boolean;
}) {
  const fullLength = segments.reduce((total, s) => total + s.text.length, 0);
  const [count, setCount] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) {
      setCount(fullLength);
      return;
    }
    let delay: number;
    let next: () => void;
    if (!deleting && count < fullLength) {
      delay = count === 0 ? startDelayMs : speedMs;
      next = () => setCount((c) => c + 1);
    } else if (!deleting) {
      if (!loop) return;
      delay = holdMs;
      next = () => setDeleting(true);
    } else if (count > 0) {
      delay = deleteSpeedMs;
      next = () => setCount((c) => c - 1);
    } else {
      delay = 0;
      next = () => setDeleting(false);
    }
    const id = setTimeout(next, delay);
    return () => clearTimeout(id);
  }, [count, deleting, fullLength, reduced, speedMs, deleteSpeedMs, startDelayMs, holdMs, loop]);

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

  const typing = loop || count < fullLength;
  return (
    <span aria-label={segments.map((s) => s.text).join("")}>
      <span aria-hidden="true">
        {rendered}
        {typing && !reduced ? <span className="animate-pulse font-light">|</span> : null}
      </span>
    </span>
  );
}
