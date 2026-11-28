import { prisma } from "@ccr/database";
import Link from "next/link";
import { Badge, ButtonLink, PageHeader, Table } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { CONTENT_STATUS_LABELS, formatDate } from "@/lib/labels";

// Module Actualités (section 6) : seuls les administrateurs ajoutent, modifient
// ou suppriment les actualités, avec le workflow brouillon / publié / archivé.
export default async function CmsPage() {
  const user = await requireAccess("actualites");
  const editable = canEdit(user.role, "actualites");
  const items = await prisma.content.findMany({
    where: { type: { in: ["NEWS", "EVENT"] } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Actualités et événements"
        subtitle="Publiés sur le site : page Actualités et accueil. Photo, vidéo ou lien de vidéo."
        action={
          editable ? (
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/cms/nouveau?type=EVENT" variant="secondary">Événement exceptionnel</ButtonLink>
              <ButtonLink href="/cms/nouveau">Nouvelle actualité</ButtonLink>
            </div>
          ) : undefined
        }
      />
      <Table head={["Titre", "Type", "Statut", "Modifiée le"]}>
        {items.map((n) => (
          <tr key={n.id} className="hover:bg-ccr-gold/5">
            <td className="px-4 py-3">
              <Link href={`/cms/${n.id}`} className="font-semibold hover:text-ccr-magenta">
                {n.title}
              </Link>
            </td>
            <td className="px-4 py-3 text-ccr-ink/70">
              {n.type === "EVENT" ? `Événement${n.eventAt ? `, ${formatDate(n.eventAt)}` : ""}` : "Actualité"}
            </td>
            <td className="px-4 py-3">
              <Badge tone={n.status === "PUBLISHED" ? "gold" : "neutral"}>{CONTENT_STATUS_LABELS[n.status]}</Badge>
            </td>
            <td className="px-4 py-3 text-ccr-ink/70">{formatDate(n.updatedAt)}</td>
          </tr>
        ))}
        {items.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-4 py-6 text-center text-ccr-ink/50">
              Aucune actualité pour l&rsquo;instant.
            </td>
          </tr>
        ) : null}
      </Table>
    </>
  );
}
