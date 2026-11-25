"use client";

import { useEffect, useState } from "react";

// Fait defiler des mots en fondu, un a la fois. Respecte prefers-reduced-motion
// en figeant sur le premier mot.
export function RotatingWords({
  words,
  intervalMs = 2200,
  className,
}: {
  words: string[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (words.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % words.length);
        setVisible(true);
      }, 300);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words, intervalMs]);

  return (
    <span
      className={`inline-block transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      } ${className ?? ""}`}
    >
      {words[index]}
    </span>
  );
}
