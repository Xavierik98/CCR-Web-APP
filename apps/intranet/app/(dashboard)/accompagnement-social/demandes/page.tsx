import { prisma, type SupportRequestStatus } from "@ccr/database";
import Link from "next/link";
import { Badge, Card, Notice, PageHeader } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { fullName } from "@/lib/labels";
import { qty } from "@/lib/stock";
import { waLink } from "@/lib/whatsapp";
import { SocialTabs } from "../social-tabs";
import { decideRequest } from "../stock-actions";

const when = (d: Date) => d.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Casablanca" });

const VUES: { status: SupportRequestStatus; label: string; tone: "magenta" | "gold" | "blue" | "neutral" }[] = [
  { status: "NEW", label: "À traiter", tone: "magenta" },
  { status: "WAITLIST", label: "Liste d'attente", tone: "gold" },
  { status: "DONE", label: "Effectuées", tone: "blue" },
  { status: "REJECTED", label: "Refusées", tone: "neutral" },
];

const DECISIONS: Record<string, string> = {
  WAITLIST: "Demande placée en liste d'attente.",
  REJECTED: "Demande refusée, le motif est conservé dans l'historique.",
  NEW: "Demande remise dans les demandes à traiter.",
};

// Demandes de soutien reçues depuis le site public, par statut : à traiter,
// liste d'attente, effectuées, refusées. Chaque décision garde qui, quand et pourquoi.
export default async function DemandesPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string; effectue?: string; decision?: string; erreur?: string }>;
}) {
  const user = await requireAccess("social");
  const editable = canEdit(user.role, "social");
  const sp = await searchParams;
  const vue = VUES.find((v) => v.status === sp.vue) ?? VUES[0];
  const open = vue.status === "NEW" || vue.status === "WAITLIST";
  const [requests, counts] = await Promise.all([
    prisma.supportRequest.findMany({
      where: { status: vue.status },
      orderBy: open ? { createdAt: "asc" } : { handledAt: "desc" },
      take: 200,
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
        movements: { include: { item: { select: { name: true, unit: true } } } },
      },
    }),
    prisma.supportRequest.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s: SupportRequestStatus) => counts.find((c) => c.status === s)?._count ?? 0;
  const tab = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap ${active ? "bg-ccr-ink text-ccr-cream" : "text-ccr-ink/60 hover:text-ccr-ink"}`;

  return (
    <>
      <PageHeader title="Accompagnement social" subtitle="Demandes de soutien envoyées depuis le site de l'église." />
      <SocialTabs current="demandes" demandes={count("NEW")} />
      {sp.effectue ? <Notice>Soutien enregistré : le stock a été mis à jour et la demande est close.</Notice> : null}
      {sp.decision && DECISIONS[sp.decision] ? <Notice>{DECISIONS[sp.decision]}</Notice> : null}
      {sp.erreur === "motif" ? <Notice tone="magenta">Indiquez le motif du refus.</Notice> : null}

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {VUES.map((v) => (
          <Link key={v.status} href={`/accompagnement-social/demandes${v.status === "NEW" ? "" : `?vue=${v.status}`}`} className={tab(v === vue)}>
            {v.label} ({count(v.status)})
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <Card>
          <p className="text-sm text-ccr-ink/60">Aucune demande dans « {vue.label} ».</p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {requests.map((r) => (
            <Card key={r.id} className={r.status === "NEW" ? "border-ccr-magenta/30" : r.status === "WAITLIST" ? "border-ccr-gold/40" : ""}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">{fullName(r)}</p>
                  <p className="text-xs text-ccr-ink/50">Reçue le {when(r.createdAt)}</p>
                </div>
                <Badge tone={vue.tone}>{vue.label === "Effectuées" ? "Effectuée" : vue.label === "Refusées" ? "Refusée" : vue.label}</Badge>
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

              {r.handledAt && r.status !== "NEW" ? (
                <div className="mt-3 border-t border-ccr-ink/10 pt-3 text-xs text-ccr-ink/60">
                  <p>
                    {r.status === "WAITLIST" ? "Mise en attente" : r.status === "DONE" ? "Effectuée" : "Refusée"} le {when(r.handledAt)}
                    {r.handledBy ? ` par ${r.handledBy}` : ""}
                  </p>
                  {r.decisionNote ? <p className="mt-1 font-medium text-ccr-ink/80">Motif : {r.decisionNote}</p> : null}
                  {r.movements.length ? (
                    <p className="mt-1">Remis : {r.movements.map((m) => `${qty(m.quantity)} ${m.item.unit} de ${m.item.name}`).join(", ")}</p>
                  ) : null}
                </div>
              ) : null}

              {editable ? (
                <div className="mt-4 space-y-3 border-t border-ccr-ink/10 pt-4">
                  {open ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/accompagnement-social/demandes/${r.id}`} className="rounded-full bg-ccr-gold px-5 py-2 text-sm font-semibold text-ccr-ink hover:bg-ccr-gold-light">
                        Effectuer le soutien
                      </Link>
                      <a href={waLink(r.phone, `Bonjour ${r.firstName}, nous avons bien reçu votre demande de soutien. L'équipe sociale de CCR Famille.`)} target="_blank" rel="noreferrer" className="text-sm font-semibold text-emerald-700 hover:underline">
                        Écrire sur WhatsApp
                      </a>
                    </div>
                  ) : null}
                  {r.status !== "DONE" ? (
                  <details className="group">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-ccr-ink/70 hover:text-ccr-ink">
                      Changer le statut <span className="text-ccr-ink/40 group-open:hidden">▸</span>
                    </summary>
                    <form className="mt-3 space-y-2">
                      <input type="hidden" name="id" value={r.id} />
                      <input name="note" placeholder="Motif (obligatoire pour un refus)" className="w-full rounded-lg border border-ccr-ink/15 px-3 py-2 text-sm outline-none focus:border-ccr-gold" />
                      <div className="flex flex-wrap gap-2">
                        {r.status !== "WAITLIST" ? (
                          <button formAction={decideRequest.bind(null, "WAITLIST")} data-decision="WAITLIST" className="rounded-full border border-ccr-gold px-4 py-1.5 text-sm font-semibold hover:bg-ccr-gold/10">
                            Liste d&rsquo;attente
                          </button>
                        ) : null}
                        {r.status !== "REJECTED" ? (
                          <button formAction={decideRequest.bind(null, "REJECTED")} data-decision="REJECTED" className="rounded-full border border-ccr-magenta/40 px-4 py-1.5 text-sm font-semibold text-ccr-magenta hover:bg-ccr-magenta/5">
                            Refuser
                          </button>
                        ) : null}
                        {r.status !== "NEW" ? (
                          <button formAction={decideRequest.bind(null, "NEW")} data-decision="NEW" className="rounded-full border border-ccr-ink/20 px-4 py-1.5 text-sm font-semibold hover:bg-ccr-ink/5">
                            Remettre à traiter
                          </button>
                        ) : null}
                      </div>
                    </form>
                  </details>
                  ) : null}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
