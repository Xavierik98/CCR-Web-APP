import { prisma, type ResidencyStatus } from "@ccr/database";
import Link from "next/link";
import { Badge, Button, Card, PageHeader, Select, Table } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { RESIDENCY_LABELS, formatDate, fullName } from "@/lib/labels";
import { residencyAlerts } from "@/lib/residency";

const VUES = [
  { key: "", label: "Tous" },
  { key: "alertes", label: "À surveiller" },
  { key: "IN_PROGRESS", label: "Procédure en cours" },
  { key: "EXPIRED", label: "Carte expirée" },
  { key: "NEVER_HAD", label: "Sans carte" },
  { key: "VALID", label: "Carte valide" },
];

// Dossiers de titre de séjour : données très sensibles, accès restreint
// (accompagnement social, responsable de la jeunesse, pasteur, super administrateur).
export default async function DossiersSejourPage({ searchParams }: { searchParams: Promise<{ vue?: string }> }) {
  const user = await requireAccess("sejour");
  const editable = canEdit(user.role, "sejour");
  const { vue = "" } = await searchParams;
  const [all, withoutRecord] = await Promise.all([
    prisma.socialSupportRecord.findMany({ include: { member: true }, orderBy: { member: { firstName: "asc" } } }),
    prisma.member.findMany({
      where: { socialSupport: null, membershipStatus: "ACTIVE", category: { not: "CHILD" } },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true, title: true },
    }),
  ]);
  const rows = all.map((r) => ({ r, alerts: residencyAlerts(r) }));
  const shown = rows.filter(({ r, alerts }) => (vue === "alertes" ? alerts.some((a) => a.tone === "magenta" || a.key === "bientot") : vue ? r.residencyStatus === (vue as ResidencyStatus) : true));
  const count = (k: string) => (k === "" ? rows.length : k === "alertes" ? rows.filter(({ alerts }) => alerts.some((a) => a.tone === "magenta" || a.key === "bientot")).length : rows.filter(({ r }) => r.residencyStatus === k).length);

  return (
    <>
      <PageHeader title="Dossiers de séjour" subtitle="Données sensibles : accès restreint. Statut, expirations, procédures et documents manquants." />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {VUES.map((v) => (
          <Link
            key={v.key}
            href={v.key ? `/dossiers-sejour?vue=${v.key}` : "/dossiers-sejour"}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold ${v.key === vue ? "bg-ccr-ink text-ccr-cream" : "bg-white text-ccr-ink/70 ring-1 ring-ccr-ink/10 hover:text-ccr-ink"}`}
          >
            {v.label} <span className="opacity-60">{count(v.key)}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
        <Table head={["Membre", "Statut", "Expiration", "Alertes", "Mis à jour"]}>
          {shown.map(({ r, alerts }) => (
            <tr key={r.id} className="hover:bg-ccr-gold/5">
              <td className="px-4 py-3">
                <Link href={`/dossiers-sejour/${r.memberId}`} className="font-semibold hover:text-ccr-magenta">{fullName(r.member)}</Link>
                {r.lastReportedAt ? <span className="block text-xs text-ccr-blue">Signalé par la personne le {formatDate(r.lastReportedAt)}</span> : null}
              </td>
              <td className="px-4 py-3">
                <Badge tone={r.residencyStatus === "VALID" ? "blue" : r.residencyStatus === "IN_PROGRESS" ? "gold" : "magenta"}>{RESIDENCY_LABELS[r.residencyStatus]}</Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-ccr-ink/70">{r.documentExpiry ? formatDate(r.documentExpiry) : ""}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">{alerts.map((a) => <Badge key={a.key} tone={a.tone}>{a.label}</Badge>)}</div>
              </td>
              <td className="px-4 py-3 text-xs text-ccr-ink/50">{formatDate(r.updatedAt)}</td>
            </tr>
          ))}
          {shown.length === 0 ? (
            <tr><td colSpan={5} className="px-4 py-6 text-center text-ccr-ink/50">Aucun dossier dans cette catégorie.</td></tr>
          ) : null}
        </Table>

        {editable ? (
          <Card>
            <h2 className="font-display text-lg font-bold">Ouvrir un dossier</h2>
            <form action="/dossiers-sejour/ouvrir" className="mt-4 space-y-4">
              <Select name="membre" empty="Choisir un membre…" options={withoutRecord.map((m) => [m.id, fullName(m)])} required />
              <Button type="submit">Continuer</Button>
            </form>
            <p className="mt-4 text-xs text-ccr-ink/50">
              Chaque membre peut aussi signaler sa situation (procédure en cours, documents manquants, date d&rsquo;expiration) depuis le formulaire « Ma fiche », dans une partie confidentielle. Le signalement arrive ici après validation de la fiche.
            </p>
          </Card>
        ) : null}
      </div>
    </>
  );
}
