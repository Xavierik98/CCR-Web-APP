import Image from "next/image";
import fs from "node:fs";
import path from "node:path";

// Emplacement d'image nomme : affiche la photo si le fichier existe deja dans
// /public (deposez-le au chemin indique dans `src`), sinon un repere visuel
// clair avec le chemin attendu, jamais une image cassee.
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
        Photo a venir
      </span>
      <span className="font-mono text-[11px] text-ccr-ink/30">{src}</span>
    </div>
  );
}
