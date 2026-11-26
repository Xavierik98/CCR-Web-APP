import { prisma, type MemberCategory, type MembershipStatus, type Prisma } from "@ccr/database";
import Link from "next/link";
import { Badge, ButtonLink, Notice, PageHeader, Select, Table } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS, STATUS_LABELS, fullName } from "@/lib/labels";

// Module Membres (section 3). Champs sensibles (titre de séjour) exclus de
// cette liste : ils vivent dans le module Accompagnement social.
const PAGE_SIZE = 50;

export default async function MembresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categorie?: string; statut?: string; page?: string; supprime?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.MemberWhereInput = {
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
          ],
        }
      : {}),
    ...(params.categorie === "aucune"
      ? { category: null }
      : params.categorie
        ? { category: params.categorie as MemberCategory }
        : {}),
    ...(params.statut ? { membershipStatus: params.statut as MembershipStatus } : {}),
  };

  const [total, membres] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.findMany({
      where,
      orderBy: [{ firstName: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        memberships: { include: { department: true } },
        _count: { select: { attendances: true } },
      },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (p: number) =>
    `/membres?${new URLSearchParams({ ...(q && { q }), ...(params.categorie && { categorie: params.categorie }), ...(params.statut && { statut: params.statut }), page: String(p) })}`;

  return (
    <>
      <PageHeader
        title="Membres"
        subtitle={`${total} fiche${total > 1 ? "s" : ""}`}
        action={<ButtonLink href="/membres/nouveau">Ajouter un membre</ButtonLink>}
      />
      {params.supprime ? <Notice>Fiche supprimée.</Notice> : null}

      <form className="mb-6 grid gap-3 sm:grid-cols-[1fr_200px_200px_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher un nom ou un téléphone"
          className="rounded-lg border border-ccr-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ccr-gold"
        />
        <Select
          name="categorie"
          defaultValue={params.categorie ?? ""}
          empty="Toutes les catégories"
          options={{ ...CATEGORY_LABELS, aucune: "À compléter" }}
        />
        <Select name="statut" defaultValue={params.statut ?? ""} empty="Tous les statuts" options={STATUS_LABELS} />
        <button type="submit" className="rounded-full bg-ccr-ink px-5 py-2 text-sm font-semibold text-ccr-cream">
          Filtrer
        </button>
      </form>

      <Table head={["Nom", "Catégorie", "Téléphone", "Statut", "Départements", "Présences"]}>
        {membres.map((m) => (
          <tr key={m.id} className="hover:bg-ccr-gold/5">
            <td className="px-4 py-3">
              <Link href={`/membres/${m.id}`} className="font-semibold hover:text-ccr-magenta">
                {fullName(m)}
              </Link>
            </td>
            <td className="px-4 py-3">
              {m.category ? CATEGORY_LABELS[m.category] : <Badge tone="magenta">À compléter</Badge>}
            </td>
            <td className="px-4 py-3 text-ccr-ink/70">{m.phone}</td>
            <td className="px-4 py-3">
              <Badge tone={m.membershipStatus === "ACTIVE" ? "gold" : m.membershipStatus === "DEPARTED" ? "magenta" : "neutral"}>
                {STATUS_LABELS[m.membershipStatus]}
              </Badge>
            </td>
            <td className="px-4 py-3 text-ccr-ink/70">
              {m.memberships.map((d) => d.department.name).join(", ")}
            </td>
            <td className="px-4 py-3 text-ccr-ink/70">{m._count.attendances}</td>
          </tr>
        ))}
      </Table>

      {pages > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          {page > 1 ? <Link href={link(page - 1)} className="font-semibold hover:text-ccr-magenta">&larr; Précédent</Link> : null}
          <span className="text-ccr-ink/50">Page {page} sur {pages}</span>
          {page < pages ? <Link href={link(page + 1)} className="font-semibold hover:text-ccr-magenta">Suivant &rarr;</Link> : null}
        </div>
      ) : null}
    </>
  );
}
