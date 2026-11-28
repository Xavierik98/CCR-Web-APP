import { prisma } from "@ccr/database";
import Link from "next/link";
import { RemindButton } from "@/components/remind-button";
import { Badge, Card, Notice, PageHeader } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { formatDate, fullName } from "@/lib/labels";
import { CampaignForm } from "@/components/campaign-form";
import { campaignPhase, currentMonth, mad, monthLabel, needsReminder, pledgeStatus, pledgeSummary, pledgesToRemind, reminderLink, withMonth } from "@/lib/pledges";

// Collecte et engagements : vue d'ensemble pour la trésorerie (promis, reçu,
// qui a donné ou pas) et relances WhatsApp en un clic.
export default async function CollectePage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const user = await requireAccess("collecte");
  const editable = canEdit(user.role, "collecte");
  const { erreur } = await searchParams;
  const [campaigns, aRelancer] = await Promise.all([
    prisma.campaign.findMany({
      orderBy: { startDate: "desc" },
      include: {
        pledges: {
          include: {
            member: { select: { phone: true, firstName: true } },
            payments: { where: { month: currentMonth() }, select: { month: true, amount: true } },
          },
        },
      },
    }),
    pledgesToRemind(),
  ]);

  // Engagements mensuels : comptés sur le mois en cours.
  const list = campaigns.map((c) => ({ ...c, pledges: c.pledges.map((p) => withMonth(p, c.monthly)), phase: campaignPhase(c) }));
  const all = list.filter((c) => c.phase !== "TERMINEE").flatMap((c) => c.pledges);
  const promis = all.reduce((s, p) => s + Number(p.amountPromised ?? 0), 0);
  const recu = all.reduce((s, p) => s + Number(p.amountPaid ?? 0), 0);
  const count = (st: string) => all.filter((p) => pledgeStatus(p) === st).length;
  const pct = promis ? Math.round((recu / promis) * 100) : 0;

  return (
    <>
      <PageHeader title="Collecte et engagements" subtitle="Qui a donné, qui reste à relancer, et où en est chaque campagne." />
      {erreur === "dates" ? (
        <Notice tone="magenta">La date de fin doit être après la date de début.</Notice>
      ) : erreur ? (
        <Notice tone="magenta">Indiquez un nom et une date de début.</Notice>
      ) : null}

      <section className="mb-6 rounded-2xl bg-ccr-ink p-6 text-ccr-cream">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-ccr-cream/60">Reçu sur les campagnes en cours (mensuelles : {monthLabel(currentMonth())})</p>
            <p className="font-display text-4xl font-black [font-variant-numeric:lining-nums]">
              {mad(recu)} <span className="text-lg font-normal text-ccr-cream/50">sur {mad(promis)}</span>
            </p>
          </div>
          <p className="font-display text-3xl font-black text-ccr-gold-light">{pct} %</p>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-ccr-gold to-ccr-gold-light" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ccr-cream/70">
          <span><b className="text-ccr-cream">{count("PAYE")}</b> payés</span>
          <span><b className="text-ccr-cream">{count("PARTIEL")}</b> partiels</span>
          <span><b className="text-ccr-cream">{count("NON_PAYE")}</b> non payés</span>
          <span><b className="text-ccr-cream">{count("A_CONFIRMER")}</b> montants à confirmer</span>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section>
          {(
            [
              ["EN_COURS", "Campagnes en cours"],
              ["A_VENIR", "À venir"],
              ["TERMINEE", "Historique : campagnes terminées"],
            ] as const
          ).map(([phase, titre]) => {
            const group = list.filter((c) => c.phase === phase);
            if (group.length === 0 && phase !== "EN_COURS") return null;
            return (
              <div key={phase} className="mb-6">
                <h2 className="mb-3 font-display text-xl font-bold">{titre}</h2>
                {group.length === 0 ? <Card><p className="text-sm text-ccr-ink/60">Aucune campagne en cours.</p></Card> : null}
                <div className="space-y-3">
                  {group.map((c) => {
                    const p = c.pledges.reduce((s, x) => s + Number(x.amountPromised ?? 0), 0);
                    const r = c.pledges.reduce((s, x) => s + Number(x.amountPaid ?? 0), 0);
                    const relances = phase === "TERMINEE" ? 0 : c.pledges.filter((x) => needsReminder(x)).length;
                    const cp = p ? Math.round((r / p) * 100) : 0;
                    return (
                      <Link key={c.id} href={`/collecte/${c.id}`} className={`flex gap-4 rounded-2xl border border-ccr-ink/[0.06] bg-white p-4 transition-shadow hover:shadow-md ${phase === "TERMINEE" ? "opacity-80" : ""}`}>
                        {c.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.coverImageUrl} alt="" className="hidden h-20 w-20 shrink-0 rounded-xl object-cover sm:block" />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-display text-lg font-bold">{c.name}</p>
                              <p className="text-xs text-ccr-ink/50">
                                {c.endDate ? `Du ${formatDate(c.startDate)} au ${formatDate(c.endDate)}` : `Depuis le ${formatDate(c.startDate)}`}, {c.pledges.length} engagements
                              </p>
                              <p className="text-xs text-ccr-ink/40">
                                Mis à jour le {c.updatedAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Casablanca" })}
                                {c.updatedBy ? ` par ${c.updatedBy}` : ""}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {c.monthly ? <Badge tone="gold">Mensuel</Badge> : null}
                              {phase === "TERMINEE" ? <Badge tone="neutral">Terminée</Badge> : relances ? <Badge tone="magenta">{relances} à relancer</Badge> : <Badge tone="blue">À jour</Badge>}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-ccr-ink/5">
                              <div className="h-full rounded-full bg-ccr-gold" style={{ width: `${Math.min(cp, 100)}%` }} />
                            </div>
                            <span className="text-right text-sm text-ccr-ink/70">
                              <b className="text-ccr-ink">{mad(r)}</b> / {mad(p)}{c.monthly ? " ce mois" : ""}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {editable ? (
            <Card className="mt-6">
              <h2 className="mb-4 font-display text-lg font-bold">Nouvelle campagne</h2>
              <CampaignForm />
            </Card>
          ) : null}
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold">
            À relancer
            <span className="rounded-full bg-ccr-magenta/10 px-2.5 py-0.5 text-sm text-ccr-magenta">{aRelancer.length}</span>
          </h2>
          <Card className="p-0">
            {aRelancer.length === 0 ? (
              <p className="p-5 text-sm text-ccr-ink/60">Personne à relancer pour l&rsquo;instant.</p>
            ) : (
              <ul className="divide-y divide-ccr-ink/5">
                {aRelancer.slice(0, 25).map((p) => {
                  const link = reminderLink(p);
                  return (
                    <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{p.member ? fullName(p.member) : p.donorName}</p>
                        <p className="truncate text-xs text-ccr-ink/50">
                          {p.campaign.name}, {pledgeSummary(p)}
                          {p.lastReminderAt ? `, relancé le ${formatDate(p.lastReminderAt)}` : ", jamais relancé"}
                        </p>
                      </div>
                      {editable && link ? <RemindButton pledgeId={p.id} href={link} compact /> : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
          <p className="mt-2 text-xs text-ccr-ink/50">
            Une personne revient dans cette liste 14 jours après sa dernière relance, tant que son engagement n&rsquo;est pas
            entièrement payé. Pour un engagement mensuel (loyer), elle revient chaque mois tant que le mois n&rsquo;est pas réglé. Sans numéro de téléphone, elle n&rsquo;apparaît pas : ajoutez-le dans la campagne.
          </p>
        </section>
      </div>
    </>
  );
}
