"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// Fait alterner plusieurs photos de fond en fondu enchaîné, pour un hero qui
// bouge réellement au lieu d'une image unique figée. Respecte
// prefers-reduced-motion en figeant sur la première photo.
export function HeroSlideshow({
  images,
  intervalMs = 6000,
  imageClassName,
}: {
  images: { src: string; position?: string }[];
  intervalMs?: number;
  imageClassName?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <>
      {images.map((image, i) => (
        <Image
          key={image.src}
          src={image.src}
          alt=""
          fill
          priority={i === 0}
          className={`animate-slow-zoom object-cover transition-opacity duration-[1500ms] ease-in-out ${imageClassName ?? ""}`}
          style={{
            objectPosition: image.position ?? "center",
            opacity: i === index ? 1 : 0,
          }}
        />
      ))}
    </>
  );
}
