import type { ReactNode } from "react";

// Aperçu d'un message WhatsApp : *gras* et _italique_ rendus comme dans l'app.
export function WhatsAppPreview({ text, className = "" }: { text: string; className?: string }) {
  const render = (line: string): ReactNode[] =>
    line.split(/(\*[^*]+\*|_[^_]+_)/g).map((part, i) =>
      part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
        <strong key={i}>{part.slice(1, -1)}</strong>
      ) : part.startsWith("_") && part.endsWith("_") && part.length > 2 ? (
        <em key={i}>{part.slice(1, -1)}</em>
      ) : (
        part
      ),
    );
  return (
    <div className={`rounded-2xl rounded-tl-sm bg-[#dcf8c6] p-4 text-sm leading-relaxed text-[#111b21] shadow-sm ${className}`}>
      {text.split("\n").map((line, i) => (
        <p key={i} className={line === "" ? "h-2" : ""}>
          {render(line)}
        </p>
      ))}
    </div>
  );
}
