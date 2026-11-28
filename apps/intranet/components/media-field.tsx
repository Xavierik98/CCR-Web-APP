"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRef, useState } from "react";

// Champ média des actualités : dépôt d'une photo ou d'une vidéo depuis
// l'ordinateur ou le téléphone (envoyée directement dans le stockage Supabase,
// sans limite de taille du serveur), ou lien collé à la main.
export function MediaField({
  name,
  kind,
  defaultValue,
  supabaseUrl,
  supabaseKey,
}: {
  name: string;
  kind: "image" | "video";
  defaultValue: string | null;
  supabaseUrl: string | null;
  supabaseKey: string | null;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [state, setState] = useState<"idle" | "upload" | "error">("idle");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const isVideo = kind === "video";
  const isFile = /\.(mp4|mov|webm)(\?|$)/i.test(value) || value.includes("/storage/v1/object/public/");

  async function upload(file: File) {
    if (!supabaseUrl || !supabaseKey) {
      setState("error");
      setError("Stockage non configuré : collez plutôt un lien.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setState("error");
      setError("Fichier trop lourd (50 Mo au maximum). Pour une longue vidéo, publiez-la sur YouTube ou Facebook et collez le lien.");
      return;
    }
    setState("upload");
    const supabase = createBrowserClient(supabaseUrl, supabaseKey);
    const ext = (file.name.split(".").pop() ?? (isVideo ? "mp4" : "jpg")).toLowerCase();
    const path = `actualites/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
    const { error: err } = await supabase.storage.from("medias").upload(path, file, { contentType: file.type, upsert: false });
    if (err) {
      setState("error");
      setError(`Envoi impossible : ${err.message}`);
      return;
    }
    setValue(supabase.storage.from("medias").getPublicUrl(path).data.publicUrl);
    setState("idle");
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={state === "upload"}
          className="rounded-full bg-ccr-ink px-4 py-2 text-sm font-semibold text-ccr-cream hover:bg-ccr-ink/85 disabled:opacity-60"
        >
          {state === "upload" ? "Envoi en cours…" : isVideo ? "Déposer une vidéo" : "Déposer une photo"}
        </button>
        {value ? (
          <button type="button" onClick={() => setValue("")} className="text-sm font-semibold text-ccr-magenta hover:underline">
            Retirer
          </button>
        ) : null}
        <input
          ref={input}
          type="file"
          accept={isVideo ? "video/mp4,video/quicktime,video/webm" : "image/jpeg,image/png,image/webp,image/gif"}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.target.value = "";
          }}
        />
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value.trim())}
        placeholder={isVideo ? "ou collez un lien YouTube, Facebook, Instagram, TikTok…" : "ou collez l'adresse d'une image"}
        className="w-full rounded-xl border border-ccr-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ccr-gold"
      />
      {state === "error" ? <p className="text-xs text-ccr-magenta">{error}</p> : null}
      {value && !isVideo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="max-h-56 rounded-xl border border-ccr-ink/10" />
      ) : null}
      {value && isVideo && isFile ? <video src={value} controls playsInline className="max-h-56 rounded-xl border border-ccr-ink/10" /> : null}
      {value && isVideo && !isFile ? <p className="text-xs text-ccr-ink/60">Lien de vidéo enregistré : elle sera intégrée sur le site.</p> : null}
    </div>
  );
}
