import { prisma } from "@ccr/database";
import Link from "next/link";
import { Badge, Card, Notice, PageHeader } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { fullName } from "@/lib/labels";
import { qty } from "@/lib/stock";
import { waLink } from "@/lib/whatsapp";
import { SocialTabs } from "../social-tabs";
import { rejectRequest } from "../stock-actions";

const when = (d: Date) => d.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Casablanca" });

// Demandes de soutien reçues depuis le site public : à traiter en premier,
// puis l'historique des demandes effectuées ou refusées.
export default async function DemandesPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string; effectue?: string; refuse?: string }>;
}) {
  const user = await requireAccess("social");
  const editable = canEdit(user.role, "social");
  const { vue, effectue, refuse } = await searchParams;
  const historique = vue === "traitees";
  const [requests, pending] = await Promise.all([
    prisma.supportRequest.findMany({
      where: historique ? { NOT: { status: "NEW" } } : { status: "NEW" },
      orderBy: historique ? { handledAt: "desc" } : { createdAt: "asc" },
      take: 200,
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
        movements: { include: { item: { select: { name: true, unit: true } } } },
      },
    }),
    prisma.supportRequest.count({ where: { status: "NEW" } }),
  ]);
  const tab = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold ${active ? "bg-ccr-ink text-ccr-cream" : "text-ccr-ink/60 hover:text-ccr-ink"}`;

  return (
    <>
      <PageHeader title="Accompagnement social" subtitle="Demandes de soutien envoyées depuis le site de l'église." />
      <SocialTabs current="demandes" demandes={pending} />
      {effectue ? <Notice>Soutien enregistré : le stock a été mis à jour et la demande est close.</Notice> : null}
      {refuse ? <Notice>Demande refusée.</Notice> : null}

      <div className="mb-4 flex gap-2">
        <Link href="/accompagnement-social/demandes" className={tab(!historique)}>À traiter ({pending})</Link>
        <Link href="/accompagnement-social/demandes?vue=traitees" className={tab(historique)}>Déjà traitées</Link>
      </div>

      {requests.length === 0 ? (
        <Card>
          <p className="text-sm text-ccr-ink/60">{historique ? "Aucune demande traitée pour l'instant." : "Aucune demande en attente."}</p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {requests.map((r) => (
            <Card key={r.id} className={r.status === "NEW" ? "border-ccr-magenta/30" : ""}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">{fullName(r)}</p>
                  <p className="text-xs text-ccr-ink/50">Reçue le {when(r.createdAt)}</p>
                </div>
                {r.status === "NEW" ? (
                  <Badge tone="magenta">À traiter</Badge>
                ) : r.status === "DONE" ? (
                  <Badge tone="blue">Effectuée</Badge>
                ) : (
                  <Badge tone="neutral">Refusée</Badge>
                )}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <dt className="text-ccr-ink/50">Téléphone</dt>
                <dd>{r.phone}</dd>
                {r.email ? (<><dt className="text-ccr-ink/50">E-mail</dt><dd className="truncate">{r.email}</dd></>) : null}
                {r.neighborhood ? (<><dt className="text-ccr-ink/50">Quartier</dt><dd>{r.neighborhood}</dd></>) : null}
                {r.householdSize ? (<><dt className="text-ccr-ink/50">Au foyer</dt><dd>{r.householdSize} personne(s)</dd></>) : null}
                <dt className="text-ccr-ink/50">Membre</dt>
                <dd>
                  {r.member ? (
                    <Link href={`/membres/${r.member.id}`} className="font-semibold hover:text-ccr-magenta">{fullName(r.member)}</Link>
                  ) : (
                    "Personne extérieure"
                  )}
                </dd>
              </dl>
              {r.needs.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.needs.map((n) => <Badge key={n} tone="gold">{n}</Badge>)}
                </div>
              ) : null}
              {r.message ? <p className="mt-3 whitespace-pre-line rounded-xl bg-ccr-cream p-3 text-sm text-ccr-ink/80">{r.message}</p> : null}

              {r.status !== "NEW" ? (
                <div className="mt-3 border-t border-ccr-ink/10 pt-3 text-xs text-ccr-ink/60">
                  {r.handledAt ? `Traitée le ${when(r.handledAt)}${r.handledBy ? ` par ${r.handledBy}` : ""}` : null}
                  {r.movements.length ? (
                    <p className="mt-1">
                      Remis : {r.movements.map((m) => `${qty(m.quantity)} ${m.item.unit} de ${m.item.name}`).join(", ")}
                    </p>
                  ) : null}
                </div>
              ) : editable ? (
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-ccr-ink/10 pt-4">
                  <Link href={`/accompagnement-social/demandes/${r.id}`} className="rounded-full bg-ccr-gold px-5 py-2 text-sm font-semibold text-ccr-ink hover:bg-ccr-gold-light">
                    Effectuer le soutien
                  </Link>
                  <a href={waLink(r.phone, `Bonjour ${r.firstName}, nous avons bien reçu votre demande de soutien. L'équipe sociale de CCR Famille.`)} target="_blank" rel="noreferrer" className="text-sm font-semibold text-emerald-700 hover:underline">
                    Écrire sur WhatsApp
                  </a>
                  <form action={rejectRequest}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="text-sm font-semibold text-ccr-magenta hover:underline">Refuser</button>
                  </form>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
