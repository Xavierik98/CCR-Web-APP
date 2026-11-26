import { prisma, type ResidencyStatus } from "@ccr/database";
import Link from "next/link";
import { Badge, Button, Card, PageHeader, Select, Table } from "@/components/ui";
import { requireAccess } from "@/lib/auth";
import { RESIDENCY_LABELS, fullName } from "@/lib/labels";

// Module Accompagnement social (sections 3 et 5) : dossiers de titre de séjour.
// Accès réservé au rôle Accompagnement social et au super administrateur.
export default async function AccompagnementSocialPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  await requireAccess("social");
  const { statut } = await searchParams;

  const [records, withoutRecord] = await Promise.all([
    prisma.socialSupportRecord.findMany({
      where: statut ? { residencyStatus: statut as ResidencyStatus } : {},
      include: { member: true },
      orderBy: { member: { firstName: "asc" } },
    }),
    prisma.member.findMany({
      where: { socialSupport: null, membershipStatus: "ACTIVE", category: { not: "CHILD" } },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);

  return (
    <>
      <PageHeader title="Accompagnement social" subtitle="Données sensibles : accès restreint." />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          <form className="mb-4 flex gap-3">
            <Select name="statut" defaultValue={statut ?? ""} empty="Tous les dossiers" options={RESIDENCY_LABELS} className="mt-0" />
            <button type="submit" className="rounded-full bg-ccr-ink px-5 py-2 text-sm font-semibold text-ccr-cream">
              Filtrer
            </button>
          </form>
          <Table head={["Membre", "Situation", "N° de titre", "Difficulté signalée"]}>
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-ccr-gold/5">
                <td className="px-4 py-3">
                  <Link href={`/accompagnement-social/${r.memberId}`} className="font-semibold hover:text-ccr-magenta">
                    {fullName(r.member)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={r.residencyStatus === "VALID" ? "gold" : "magenta"}>
                    {RESIDENCY_LABELS[r.residencyStatus]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-ccr-ink/70">{r.documentNumber}</td>
                <td className="px-4 py-3 text-ccr-ink/70">{r.renewalDifficulty}</td>
              </tr>
            ))}
          </Table>
        </div>

        <Card>
          <h2 className="font-display text-lg font-bold">Ouvrir un dossier</h2>
          <form action="/accompagnement-social/ouvrir" className="mt-4 space-y-4">
            <Select name="membre" empty="Choisir un membre…" options={withoutRecord.map((m) => [m.id, fullName(m)])} required />
            <Button type="submit">Continuer</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
