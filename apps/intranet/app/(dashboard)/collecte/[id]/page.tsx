import { prisma } from "@ccr/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RemindButton } from "@/components/remind-button";
import { Badge, Button, Card, Field, Input, Notice, PageHeader, Select } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { formatDate, fullName, toDateInput } from "@/lib/labels";
import { STATUS_LABELS, mad, needsReminder, pledgePhone, pledgeStatus, reminderLink, type PledgeStatus } from "@/lib/pledges";
import { deleteCampaign, deletePledge, saveCampaign, savePledge } from "../actions";

const FILTRES: { key: string; label: string; test: (s: PledgeStatus, relance: boolean) => boolean }[] = [
  { key: "tous", label: "Tous", test: () => true },
  { key: "a-relancer", label: "À relancer", test: (_s, r) => r },
  { key: "non-paye", label: "Non payés", test: (s) => s === "NON_PAYE" },
  { key: "partiel", label: "Partiels", test: (s) => s === "PARTIEL" },
  { key: "paye", label: "Payés", test: (s) => s === "PAYE" },
  { key: "a-confirmer", label: "À confirmer", test: (s) => s === "A_CONFIRMER" },
];

export default async function CampagnePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enregistre?: string; erreur?: string; filtre?: string }>;
}) {
  const user = await requireAccess("collecte");
  const editable = canEdit(user.role, "collecte");
  const { id } = await params;
  const { enregistre, erreur, filtre = "tous" } = await searchParams;

  const [campaign, members] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id },
      include: { pledges: { include: { member: true }, orderBy: { donorName: "asc" } } },
    }),
    prisma.member.findMany({
      where: { membershipStatus: "ACTIVE" },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);
  if (!campaign) notFound();

  const rows = campaign.pledges.map((p) => ({
    p,
    status: pledgeStatus(p),
    relance: needsReminder(p),
    link: reminderLink({ ...p, campaign }),
  }));
  const promis = rows.reduce((s, r) => s + Number(r.p.amountPromised ?? 0), 0);
  const recu = rows.reduce((s, r) => s + Number(r.p.amountPaid ?? 0), 0);
  const pct = promis ? Math.round((recu / promis) * 100) : 0;
  const current = FILTRES.find((f) => f.key === filtre) ?? FILTRES[0];
  const shown = rows.filter((r) => current.test(r.status, r.relance));
  const retour = `/collecte/${campaign.id}?filtre=${current.key}&enregistre=1`;

  return (
    <>
      <PageHeader title={campaign.name} subtitle={formatDate(campaign.startDate)} back={{ href: "/collecte", label: "Toutes les campagnes" }} />
      {enregistre ? <Notice>Modifications enregistrées.</Notice> : null}
      {erreur === "nom" ? <Notice tone="magenta">Indiquez un nom ou choisissez un membre.</Notice> : null}

      <section className="mb-6 grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="rounded-2xl bg-ccr-ink p-5 text-ccr-cream">
          <p className="text-sm text-ccr-cream/60">Reçu</p>
          <p className="font-display text-3xl font-black">{mad(recu)}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-ccr-gold" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-ccr-cream/60">{pct} % des {mad(promis)} promis, reste {mad(Math.max(promis - recu, 0))}</p>
        </div>
        {(["PAYE", "PARTIEL", "NON_PAYE"] as const).map((s) => (
          <Card key={s}>
            <p className="text-sm text-ccr-ink/60">{STATUS_LABELS[s].label}</p>
            <p className="font-display text-3xl font-black">{rows.filter((r) => r.status === s).length}</p>
          </Card>
        ))}
      </section>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTRES.map((f) => {
          const n = rows.filter((r) => f.test(r.status, r.relance)).length;
          return (
            <Link
              key={f.key}
              href={`/collecte/${campaign.id}?filtre=${f.key}`}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                f.key === current.key ? "bg-ccr-ink text-ccr-cream" : "bg-white text-ccr-ink/70 ring-1 ring-ccr-ink/10 hover:text-ccr-ink"
              }`}
            >
              {f.label} <span className="opacity-60">{n}</span>
            </Link>
          );
        })}
      </div>

      <Card className="p-0">
        <ul className="divide-y divide-ccr-ink/5">
          {shown.length === 0 ? <li className="p-5 text-sm text-ccr-ink/60">Aucun engagement dans cette catégorie.</li> : null}
          {shown.map(({ p, status, relance, link }) => (
            <li key={p.id} className={`p-4 ${relance ? "bg-ccr-magenta/[0.03]" : ""}`}>
              <form action={savePledge} className="grid items-end gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.4fr_auto]">
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="campaignId" value={campaign.id} />
                <input type="hidden" name="retour" value={retour} />
                <fieldset disabled={!editable} className="contents">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge tone={STATUS_LABELS[status].tone}>{STATUS_LABELS[status].label}</Badge>
                      {p.lastReminderAt ? (
                        <span className="text-xs text-ccr-ink/50">
                          Relancé le {formatDate(p.lastReminderAt)}
                          {p.reminderCount > 1 ? ` (${p.reminderCount} fois)` : ""}
                        </span>
                      ) : p.followUpDone ? (
                        <span className="text-xs text-ccr-ink/50">Relance faite (ancien suivi)</span>
                      ) : null}
                    </div>
                    <Input name="donorName" defaultValue={p.donorName} className="mt-0" />
                    {p.member ? (
                      <Link href={`/membres/${p.member.id}`} className="text-xs text-ccr-ink/50 hover:text-ccr-magenta">
                        Fiche : {fullName(p.member)}
                      </Link>
                    ) : null}
                  </div>
                  <Field label="Promis">
                    <Input name="amountPromised" inputMode="decimal" placeholder="À confirmer" defaultValue={p.amountPromised?.toString() ?? ""} />
                  </Field>
                  <Field label="Reçu">
                    <Input name="amountPaid" inputMode="decimal" placeholder="0" defaultValue={p.amountPaid?.toString() ?? ""} />
                  </Field>
                  <Field label="Téléphone">
                    <Input name="phone" inputMode="tel" placeholder={p.member?.phone ?? "+212 6…"} defaultValue={p.phone ?? ""} />
                  </Field>
                  <Field label="Commentaire">
                    <Input name="comment" defaultValue={p.comment ?? ""} />
                  </Field>
                </fieldset>
                <div className="flex flex-wrap items-center gap-2">
                  {editable ? <Button type="submit" variant="secondary">OK</Button> : null}
                  {editable && link && status !== "PAYE" ? <RemindButton pledgeId={p.id} href={link} compact /> : null}
                  {editable && !pledgePhone(p) && status !== "PAYE" ? <span className="text-xs text-ccr-ink/40">Sans numéro</span> : null}
                  {editable ? (
                    <button type="submit" formAction={deletePledge} className="text-xs font-semibold text-ccr-magenta hover:underline">
                      Supprimer
                    </button>
                  ) : null}
                </div>
              </form>
            </li>
          ))}
        </ul>

        {editable ? (
          <form action={savePledge} className="grid gap-3 border-t border-ccr-ink/10 p-4 lg:grid-cols-[2fr_2fr_1fr_1fr_auto]">
            <input type="hidden" name="campaignId" value={campaign.id} />
            <Select name="memberId" empty="Membre (facultatif)…" options={members.map((m) => [m.id, fullName(m)])} className="mt-0" />
            <Input name="donorName" placeholder="ou nom libre (ex. Couple KIFILA)" className="mt-0" />
            <Input name="amountPromised" inputMode="decimal" placeholder="Montant promis" className="mt-0" />
            <Input name="phone" inputMode="tel" placeholder="Téléphone" className="mt-0" />
            <Button type="submit">Ajouter</Button>
          </form>
        ) : null}
      </Card>

      {editable ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <form action={saveCampaign} className="grid gap-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
              <input type="hidden" name="id" value={campaign.id} />
              <Field label="Nom de la campagne">
                <Input name="name" defaultValue={campaign.name} required />
              </Field>
              <Field label="Date">
                <Input name="startDate" type="date" defaultValue={toDateInput(campaign.startDate)} required />
              </Field>
              <Button type="submit">Enregistrer</Button>
            </form>
          </Card>
          <form action={deleteCampaign} className="space-y-2">
            <input type="hidden" name="id" value={campaign.id} />
            <label className="flex items-center gap-2 text-xs text-ccr-ink/60">
              <input type="checkbox" name="confirm" required />
              Je confirme la suppression de la campagne et de tous ses engagements
            </label>
            <Button type="submit" variant="danger">Supprimer la campagne</Button>
          </form>
        </div>
      ) : null}
    </>
  );
}
