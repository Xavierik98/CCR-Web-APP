import Image from "next/image";

// Affiche une photo entière (object-contain, jamais recadrée), avec une
// copie agrandie et légèrement floutée de la même image en arrière-plan
// pour combler les bords sans bande vide ni recadrage agressif.
export function BlurredPhoto({
  src,
  alt,
  sizes = "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw",
  className,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-xl ${className ?? ""}`}
    >
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        fill
        sizes={sizes}
        className="scale-125 object-cover blur-xl brightness-90"
      />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-contain"
      />
    </div>
  );
}
