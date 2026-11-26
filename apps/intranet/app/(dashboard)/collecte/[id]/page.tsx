import { prisma } from "@ccr/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card, Field, Input, Notice, PageHeader, Select, Stat } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { fullName, toDateInput } from "@/lib/labels";
import { deleteCampaign, deletePledge, saveCampaign, savePledge } from "../actions";

export default async function CampagnePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enregistre?: string; erreur?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const { enregistre, erreur } = await searchParams;

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
  const total = campaign.pledges.reduce((s, p) => s + Number(p.amountPromised ?? 0), 0);
  const aConfirmer = campaign.pledges.filter((p) => p.amountPromised === null).length;

  return (
    <>
      <PageHeader title={campaign.name} back={{ href: "/collecte", label: "Toutes les campagnes" }} />
      {enregistre ? <Notice>Modifications enregistrées.</Notice> : null}
      {erreur === "nom" ? <Notice tone="magenta">Indiquez un nom ou choisissez un membre.</Notice> : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Engagements" value={campaign.pledges.length} />
        <Stat label="Total promis" value={total.toLocaleString("fr-FR")} />
        <Stat label="Montant à confirmer" value={aConfirmer} />
        <Stat label="Relances faites" value={campaign.pledges.filter((p) => p.followUpDone).length} />
      </div>

      <Card>
        <div className="hidden grid-cols-[2fr_1fr_auto_2fr_auto_auto] gap-3 pb-2 text-xs font-semibold uppercase tracking-wide text-ccr-ink/50 lg:grid">
          <span>Donateur</span>
          <span>Montant</span>
          <span>Relancé</span>
          <span>Commentaire</span>
          <span />
          <span />
        </div>
        <ul className="divide-y divide-ccr-ink/5">
          {campaign.pledges.map((p) => (
            <li key={p.id} className="py-2">
              <form action={savePledge} className="grid items-center gap-3 lg:grid-cols-[2fr_1fr_auto_2fr_auto_auto]">
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="campaignId" value={campaign.id} />
                <div>
                  <Input name="donorName" defaultValue={p.donorName} className="mt-0" />
                  {p.member ? (
                    <Link href={`/membres/${p.member.id}`} className="text-xs text-ccr-ink/50 hover:text-ccr-magenta">
                      Fiche : {fullName(p.member)}
                    </Link>
                  ) : null}
                </div>
                <Input
                  name="amountPromised"
                  inputMode="decimal"
                  placeholder="À confirmer"
                  defaultValue={p.amountPromised?.toString() ?? ""}
                  className="mt-0"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="followUpDone" defaultChecked={p.followUpDone} className="h-4 w-4 accent-ccr-gold" />
                  <span className="lg:hidden">Relance faite</span>
                </label>
                <Input name="comment" defaultValue={p.comment ?? ""} placeholder="Commentaire" className="mt-0" />
                <Button type="submit" variant="secondary">OK</Button>
                <button
                  type="submit"
                  formAction={deletePledge}
                  className="text-xs font-semibold text-ccr-magenta hover:underline"
                >
                  Supprimer
                </button>
              </form>
            </li>
          ))}
        </ul>

        <form action={savePledge} className="mt-6 grid gap-3 border-t border-ccr-ink/10 pt-4 lg:grid-cols-[2fr_2fr_1fr_auto]">
          <input type="hidden" name="campaignId" value={campaign.id} />
          <Select name="memberId" empty="Membre (facultatif)…" options={members.map((m) => [m.id, fullName(m)])} className="mt-0" />
          <Input name="donorName" placeholder="ou nom libre (ex. Couple KIFILA)" className="mt-0" />
          <Input name="amountPromised" inputMode="decimal" placeholder="Montant" className="mt-0" />
          <Button type="submit">Ajouter</Button>
        </form>
      </Card>

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
    </>
  );
}
