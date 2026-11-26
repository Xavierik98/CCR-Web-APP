"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Carte photo en 3D : bascule seule entre deux photos (recto / verso) et
// s'incline légèrement en suivant la souris. Respecte prefers-reduced-motion
// (pas de bascule automatique ni d'inclinaison).
export function FlipPhotos({
  front,
  back,
  intervalMs = 5000,
}: {
  front: ReactNode;
  // Sans verso (photo pas encore fournie) : carte simple, sans bascule.
  back?: ReactNode | null;
  intervalMs?: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced.current || !back) return;
    const id = setInterval(() => setFlipped((current) => !current), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, back]);

  return (
    <div
      className="[perspective:1400px]"
      onMouseMove={(event) => {
        if (reduced.current) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: -y * 12, y: x * 16 });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      onClick={() => back && setFlipped((current) => !current)}
    >
      <div
        className={`relative aspect-[4/5] w-full ${back ? "cursor-pointer" : ""} transition-transform duration-700 ease-out [transform-style:preserve-3d]`}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${(flipped ? 180 : 0) + tilt.y}deg)`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-3xl bg-white shadow-2xl [backface-visibility:hidden]">
          {front}
        </div>
        {back ? (
          <div className="absolute inset-0 overflow-hidden rounded-3xl bg-white shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {back}
          </div>
        ) : null}
      </div>
    </div>
  );
}
