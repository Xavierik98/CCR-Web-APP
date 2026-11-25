import Image from "next/image";
import fs from "node:fs";
import path from "node:path";

// Emplacement d'image nommé : affiche la photo si le fichier existe déjà dans
// /public (déposez-le au chemin indiqué dans `src`), sinon un repère visuel
// clair avec le chemin attendu, jamais une image cassée.
export function ImageSlot({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const exists = fs.existsSync(path.join(process.cwd(), "public", src));

  if (exists) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 400px, 100vw"
        className={`object-cover ${className ?? ""}`}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-ccr-ink/15 bg-ccr-ink/5 p-4 text-center ${className ?? ""}`}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-ccr-ink/40">
        Photo à venir
      </span>
      <span className="font-mono text-[11px] text-ccr-ink/30">{src}</span>
    </div>
  );
}
