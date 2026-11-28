const INTRANET_URL = process.env.NEXT_PUBLIC_INTRANET_URL ?? "https://ccr-famille-intranet.vercel.app";

export type Campagne = {
  id: string;
  nom: string;
  debut: string;
  fin: string | null;
  description: string | null;
  image: string | null;
  video: string | null;
  mensuel: boolean;
};

// Campagnes ouvertes aux engagements, gérées par la trésorerie dans l'intranet.
export async function getCampagnes(): Promise<Campagne[]> {
  try {
    const res = await fetch(`${INTRANET_URL}/api/engagement`, { next: { revalidate: 60 } });
    return res.ok ? ((await res.json()) as Campagne[]) : [];
  } catch {
    return [];
  }
}

export async function getCampagne(id: string): Promise<Campagne | null> {
  try {
    const res = await fetch(`${INTRANET_URL}/api/engagement/${encodeURIComponent(id)}`, { next: { revalidate: 60 } });
    return res.ok ? ((await res.json()) as Campagne) : null;
  } catch {
    return null;
  }
}

const fmt = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export function periode(c: Campagne) {
  return c.fin ? `Du ${fmt(c.debut)} au ${fmt(c.fin)}` : `Depuis le ${fmt(c.debut)}`;
}
