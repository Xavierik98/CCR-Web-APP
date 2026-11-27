import { prisma, type AuthEventType } from "@ccr/database";
import { Badge, Card, PageHeader, Table } from "@/components/ui";
import { requireAccess } from "@/lib/auth";
import { fullName } from "@/lib/labels";

const TYPES: Record<AuthEventType, { label: string; tone: "gold" | "blue" | "magenta" | "neutral" }> = {
  LOGIN: { label: "Connexion", tone: "blue" },
  LOGOUT: { label: "Déconnexion", tone: "neutral" },
  LINK_SENT: { label: "Lien demandé", tone: "gold" },
  LINK_REFUSED: { label: "Adresse sans accès", tone: "magenta" },
  LOGIN_FAILED: { label: "Échec de connexion", tone: "magenta" },
};

const countries = new Intl.DisplayNames(["fr"], { type: "region" });

function place(e: { city: string | null; region: string | null; country: string | null }) {
  const country = e.country ? (() => { try { return countries.of(e.country) ?? e.country; } catch { return e.country; } })() : null;
  return [e.city, country].filter(Boolean).join(", ") || "Lieu inconnu";
}

// Journal des connexions (super administrateur uniquement) : qui, quand,
// d'où (lieu approximatif déduit de l'adresse IP) et avec quel appareil.
export default async function ConnexionsPage({
  searchParams,
}: {
  searchParams: Promise<{ personne?: string; type?: string }>;
}) {
  await requireAccess("utilisateurs", "edit");
  const { personne, type } = await searchParams;
  const typeFilter = type && type in TYPES ? (type as AuthEventType) : undefined;

  const [events, users, last24h] = await Promise.all([
    prisma.authEvent.findMany({
      where: { ...(personne ? { email: personne } : {}), ...(typeFilter ? { type: typeFilter } : {}) },
      orderBy: { createdAt: "desc" },
      take: 300,
      include: { user: { include: { member: { select: { firstName: true, lastName: true } } } } },
    }),
    prisma.user.findMany({ orderBy: { email: "asc" }, select: { email: true } }),
    prisma.authEvent.groupBy({
      by: ["type"],
      where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
      _count: true,
    }),
  ]);
  const count = (t: AuthEventType) => last24h.find((g) => g.type === t)?._count ?? 0;
  const when = (d: Date) =>
    d.toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Africa/Casablanca" });
  const select = "rounded-lg border border-ccr-ink/15 bg-white px-3 py-2 text-sm";

  return (
    <>
      <PageHeader
        title="Journal des connexions"
        subtitle="Connexions et déconnexions à l'intranet, avec l'heure, le lieu approximatif et l'appareil. Conservé douze mois."
        back={{ href: "/utilisateurs", label: "Accès et rôles" }}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-ccr-ink/60">Connexions (24 h)</p>
          <p className="font-display text-3xl font-black">{count("LOGIN")}</p>
        </Card>
        <Card>
          <p className="text-sm text-ccr-ink/60">Déconnexions (24 h)</p>
          <p className="font-display text-3xl font-black">{count("LOGOUT")}</p>
        </Card>
        <Card className={count("LINK_REFUSED") + count("LOGIN_FAILED") > 0 ? "border-ccr-magenta/40" : ""}>
          <p className="text-sm text-ccr-ink/60">Tentatives refusées (24 h)</p>
          <p className="font-display text-3xl font-black text-ccr-magenta">{count("LINK_REFUSED") + count("LOGIN_FAILED")}</p>
        </Card>
      </div>

      <form className="mb-4 flex flex-wrap gap-3">
        <select name="personne" defaultValue={personne ?? ""} className={select}>
          <option value="">Toutes les personnes</option>
          {users.map((u) => (
            <option key={u.email} value={u.email}>{u.email}</option>
          ))}
        </select>
        <select name="type" defaultValue={typeFilter ?? ""} className={select}>
          <option value="">Tous les événements</option>
          {Object.entries(TYPES).map(([v, t]) => (
            <option key={v} value={v}>{t.label}</option>
          ))}
        </select>
        <button type="submit" className="rounded-full bg-ccr-ink px-5 py-2 text-sm font-semibold text-ccr-cream">Filtrer</button>
      </form>

      {events.length === 0 ? (
        <Card>
          <p className="text-sm text-ccr-ink/60">Aucun événement enregistré pour l&rsquo;instant.</p>
        </Card>
      ) : (
        <Table head={["Date et heure", "Personne", "Événement", "Lieu", "Appareil", "Adresse IP"]}>
          {events.map((e) => (
            <tr key={e.id}>
              <td className="whitespace-nowrap px-4 py-3 text-ccr-ink/70">{when(e.createdAt)}</td>
              <td className="px-4 py-3">
                <p className="font-semibold">{e.user?.member ? fullName(e.user.member) : e.email}</p>
                {e.user?.member ? <p className="text-xs text-ccr-ink/50">{e.email}</p> : null}
              </td>
              <td className="px-4 py-3">
                <Badge tone={TYPES[e.type].tone}>{TYPES[e.type].label}</Badge>
              </td>
              <td className="px-4 py-3 text-ccr-ink/70">{place(e)}</td>
              <td className="px-4 py-3 text-ccr-ink/70" title={e.userAgent ?? undefined}>{e.device ?? "Inconnu"}</td>
              <td className="px-4 py-3 font-mono text-xs text-ccr-ink/50">{e.ip ?? ""}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
