import { prisma } from "@ccr/database";
import Link from "next/link";
import { ConfirmButton } from "@/components/confirm-button";
import { Badge, ButtonLink, Card, Notice, PageHeader, Table } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { CONTENT_STATUS_LABELS, formatDate } from "@/lib/labels";
import { peopleNames } from "@/lib/people";
import { deleteNews, toggleNews } from "./actions";

const when = (d: Date) => d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Casablanca" });

// Actualités et événements publiés sur le site : qui les a publiés, leur
// statut, et l'historique de qui a publié, retiré ou supprimé quoi.
export default async function CmsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireAccess("actualites");
  const editable = canEdit(user.role, "actualites");
  const sp = await searchParams;
  const [items, events] = await Promise.all([
    prisma.content.findMany({ where: { type: { in: ["NEWS", "EVENT"] } }, orderBy: { updatedAt: "desc" } }),
    prisma.contentEvent.findMany({ orderBy: { at: "desc" }, take: 40 }),
  ]);
  const name = await peopleNames([...items.flatMap((i) => [i.authorId, i.updatedBy]), ...events.map((e) => e.byEmail)]);

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
      {sp.supprime ? <Notice>Actualité supprimée du site et de l&rsquo;intranet.</Notice> : null}
      {sp.retire ? <Notice>Actualité retirée du site (conservée ici, vous pouvez la republier).</Notice> : null}
      {sp.republie ? <Notice>Actualité de nouveau visible sur le site.</Notice> : null}

      <Table head={editable ? ["Titre", "Type", "Statut", "Publiée par", "Dernière modification", ""] : ["Titre", "Type", "Statut", "Publiée par", "Dernière modification"]}>
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
              <span className="whitespace-nowrap">
                <Badge tone={n.status === "PUBLISHED" ? "gold" : "neutral"}>{n.status === "PUBLISHED" ? "Sur le site" : n.status === "ARCHIVED" ? "Retirée" : CONTENT_STATUS_LABELS[n.status]}</Badge>
              </span>
            </td>
            <td className="px-4 py-3 text-ccr-ink/70">{name(n.authorId)}</td>
            <td className="px-4 py-3 text-xs text-ccr-ink/60">
              {when(n.updatedAt)}
              {n.updatedBy ? <span className="block">par {name(n.updatedBy)}</span> : null}
            </td>
            {editable ? (
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                  <Link href={`/cms/${n.id}`} className="text-xs font-semibold text-ccr-blue hover:underline">
                    Modifier
                  </Link>
                  <form action={toggleNews}>
                    <input type="hidden" name="id" value={n.id} />
                    <button type="submit" className={`text-xs font-semibold hover:underline ${n.status === "PUBLISHED" ? "text-ccr-ink/70" : "text-emerald-700"}`}>
                      {n.status === "PUBLISHED" ? "Retirer du site" : "Publier"}
                    </button>
                  </form>
                  <form action={deleteNews}>
                    <input type="hidden" name="id" value={n.id} />
                    <ConfirmButton message={`Supprimer définitivement « ${n.title} » ?`} className="text-xs font-semibold text-ccr-magenta hover:underline">
                      Supprimer
                    </ConfirmButton>
                  </form>
                </div>
              </td>
            ) : null}
          </tr>
        ))}
        {items.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-4 py-6 text-center text-ccr-ink/50">
              Aucune actualité pour l&rsquo;instant.
            </td>
          </tr>
        ) : null}
      </Table>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl font-bold">Historique</h2>
        <Card className="p-0">
          {events.length === 0 ? (
            <p className="p-5 text-sm text-ccr-ink/60">Aucune action enregistrée pour l&rsquo;instant.</p>
          ) : (
            <ul className="divide-y divide-ccr-ink/5">
              {events.map((e) => (
                <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-2.5 text-sm">
                  <span>
                    <b>{name(e.byEmail)}</b> : {e.action.toLowerCase()} « {e.title} »
                  </span>
                  <span className="text-xs text-ccr-ink/50">{when(e.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </>
  );
}
