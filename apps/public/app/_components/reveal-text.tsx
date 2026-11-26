"use client";

import { useEffect, useRef, useState, type ElementType } from "react";

// Fait apparaître un texte mot à mot quand il entre à l'écran : chaque mot
// remonte depuis sous sa ligne, avec un léger décalage. Respecte
// prefers-reduced-motion (texte affiché directement).
export function RevealText({
  text,
  as: Tag = "span",
  className,
  stagger = 60,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <span
            className="inline-block transition-transform duration-700 ease-out"
            style={{
              transform: visible ? "translateY(0)" : "translateY(110%)",
              transitionDelay: `${i * stagger}ms`,
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
