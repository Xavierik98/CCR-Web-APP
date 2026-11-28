import Link from "next/link";

// Onglets du module Accompagnement social.
export function SocialTabs({ current, demandes }: { current: "demandes" | "stock" | "dossiers"; demandes: number }) {
  const tabs = [
    { key: "demandes", href: "/accompagnement-social/demandes", label: "Demandes de soutien", count: demandes },
    { key: "stock", href: "/accompagnement-social/stock", label: "Stock et distributions", count: 0 },
    { key: "dossiers", href: "/accompagnement-social", label: "Dossiers de séjour", count: 0 },
  ] as const;
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
            t.key === current ? "bg-ccr-ink text-ccr-cream" : "bg-white text-ccr-ink/70 ring-1 ring-ccr-ink/10 hover:text-ccr-ink"
          }`}
        >
          {t.label}
          {t.count ? <span className="rounded-full bg-ccr-magenta px-2 text-xs text-white">{t.count}</span> : null}
        </Link>
      ))}
    </div>
  );
}
