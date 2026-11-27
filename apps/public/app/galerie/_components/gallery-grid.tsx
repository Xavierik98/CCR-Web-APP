"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Photo = { src: string; alt: string };

// Grille de photos façon app Photos : un toucher ouvre la photo en plein
// écran sur fond flouté, on passe à la suivante en glissant (ou avec les
// flèches du clavier), on ferme avec la croix, Échap ou en touchant le fond.
export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null;

  const go = useCallback(
    (step: number) => setIndex((i) => (i === null ? i : (i + step + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  return (
    <>
      <div className="mt-8 grid grid-cols-3 gap-1 sm:mt-10 sm:gap-3 md:grid-cols-4">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-lg sm:rounded-xl"
            aria-label={`Agrandir : ${photo.alt}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 768px) 25vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105 group-active:scale-95"
            />
          </button>
        ))}
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={photos[index].alt}
          className="fixed inset-0 z-[100] flex flex-col bg-ccr-ink/85 backdrop-blur-2xl"
          onClick={() => setIndex(null)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <div className="flex items-center justify-between px-4 pb-2 pt-4 text-ccr-cream" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm text-ccr-cream/70 [font-variant-numeric:tabular-nums]">
              {index + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={() => setIndex(null)}
              aria-label="Fermer"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-xl transition-transform active:scale-90"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="relative flex-1">
            <Image
              key={photos[index].src}
              src={photos[index].src}
              alt={photos[index].alt}
              fill
              sizes="100vw"
              className="animate-fade-in-up object-contain p-3 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="flex items-center justify-between gap-4 px-4 pb-8 pt-3 text-ccr-cream" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => go(-1)} aria-label="Photo précédente" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-xl active:scale-90">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <p className="min-w-0 flex-1 truncate text-center text-sm text-ccr-cream/80">{photos[index].alt}</p>
            <button type="button" onClick={() => go(1)} aria-label="Photo suivante" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-xl active:scale-90">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
