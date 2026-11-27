import { prisma } from "@ccr/database";
import Link from "next/link";
import { RemindButton } from "@/components/remind-button";
import { Badge, Button, Card, Field, Input, Notice, PageHeader } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { formatDate, fullName } from "@/lib/labels";
import { mad, needsReminder, pledgeStatus, pledgeSummary, pledgesToRemind, reminderLink } from "@/lib/pledges";
import { saveCampaign } from "./actions";

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
      include: { pledges: { include: { member: { select: { phone: true, firstName: true } } } } },
    }),
    pledgesToRemind(),
  ]);

  const all = campaigns.flatMap((c) => c.pledges);
  const promis = all.reduce((s, p) => s + Number(p.amountPromised ?? 0), 0);
  const recu = all.reduce((s, p) => s + Number(p.amountPaid ?? 0), 0);
  const count = (st: string) => all.filter((p) => pledgeStatus(p) === st).length;
  const pct = promis ? Math.round((recu / promis) * 100) : 0;

  return (
    <>
      <PageHeader title="Collecte et engagements" subtitle="Qui a donné, qui reste à relancer, et où en est chaque campagne." />
      {erreur ? <Notice tone="magenta">Indiquez un nom et une date.</Notice> : null}

      <section className="mb-6 rounded-2xl bg-ccr-ink p-6 text-ccr-cream">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-ccr-cream/60">Reçu sur l&rsquo;ensemble des engagements</p>
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
          <h2 className="mb-3 font-display text-xl font-bold">Campagnes</h2>
          <div className="space-y-3">
            {campaigns.map((c) => {
              const p = c.pledges.reduce((s, x) => s + Number(x.amountPromised ?? 0), 0);
              const r = c.pledges.reduce((s, x) => s + Number(x.amountPaid ?? 0), 0);
              const relances = c.pledges.filter((x) => needsReminder(x)).length;
              const cp = p ? Math.round((r / p) * 100) : 0;
              return (
                <Link key={c.id} href={`/collecte/${c.id}`} className="block rounded-2xl border border-ccr-ink/[0.06] bg-white p-5 transition-shadow hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold">{c.name}</p>
                      <p className="text-xs text-ccr-ink/50">{formatDate(c.startDate)}, {c.pledges.length} engagements</p>
                    </div>
                    {relances ? <Badge tone="magenta">{relances} à relancer</Badge> : <Badge tone="blue">À jour</Badge>}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ccr-ink/5">
                      <div className="h-full rounded-full bg-ccr-gold" style={{ width: `${Math.min(cp, 100)}%` }} />
                    </div>
                    <span className="w-48 text-right text-sm text-ccr-ink/70">
                      <b className="text-ccr-ink">{mad(r)}</b> / {mad(p)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {editable ? (
            <Card className="mt-6">
              <h2 className="font-display text-lg font-bold">Nouvelle campagne</h2>
              <form action={saveCampaign} className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
                <Field label="Nom">
                  <Input name="name" required />
                </Field>
                <Field label="Date de début">
                  <Input name="startDate" type="date" required />
                </Field>
                <Button type="submit">Créer</Button>
              </form>
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
            entièrement payé. Sans numéro de téléphone, elle n&rsquo;apparaît pas : ajoutez-le dans la campagne.
          </p>
        </section>
      </div>
    </>
  );
}
