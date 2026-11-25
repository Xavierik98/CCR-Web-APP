"use client";

import { useEffect, useState } from "react";

// Effet machine à écrire : tape un mot lettre par lettre, marque une pause,
// l'efface, puis passe au mot suivant. Le curseur reste visible (il clignote)
// y compris pendant les pauses. Respecte prefers-reduced-motion en affichant
// simplement le premier mot, sans animation.
export function TypewriterWords({
  words,
  typingSpeedMs = 90,
  deletingSpeedMs = 45,
  pauseMs = 1400,
  className,
}: {
  words: string[];
  typingSpeedMs?: number;
  deletingSpeedMs?: number;
  pauseMs?: number;
  className?: string;
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">(
    "typing",
  );
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced) {
      setText(words[0] ?? "");
      return;
    }

    const current = words[wordIndex] ?? "";

    if (phase === "typing") {
      if (text.length < current.length) {
        const id = setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          typingSpeedMs,
        );
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setPhase("pausing"), pauseMs);
      return () => clearTimeout(id);
    }

    if (phase === "pausing") {
      const id = setTimeout(() => setPhase("deleting"), pauseMs);
      return () => clearTimeout(id);
    }

    // deleting
    if (text.length > 0) {
      const id = setTimeout(
        () => setText(text.slice(0, -1)),
        deletingSpeedMs,
      );
      return () => clearTimeout(id);
    }
    setWordIndex((current) => (current + 1) % words.length);
    setPhase("typing");
  }, [text, phase, wordIndex, words, typingSpeedMs, deletingSpeedMs, pauseMs, reduced]);

  return (
    <span className={className}>
      {text}
      <span className="animate-pulse" aria-hidden="true">
        |
      </span>
    </span>
  );
}
