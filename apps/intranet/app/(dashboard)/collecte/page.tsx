import { prisma } from "@ccr/database";
import Link from "next/link";
import { Button, Card, Field, Input, Notice, PageHeader, Table } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/labels";
import { saveCampaign } from "./actions";

// Module Collecte et engagements (section 3) : campagnes, montants engagés,
// relances et commentaires.
export default async function CollectePage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireUser();
  const { erreur } = await searchParams;
  const campaigns = await prisma.campaign.findMany({
    orderBy: { startDate: "desc" },
    include: { pledges: { select: { amountPromised: true, followUpDone: true } } },
  });

  return (
    <>
      <PageHeader title="Collecte et engagements" />
      {erreur ? <Notice tone="magenta">Indiquez un nom et une date.</Notice> : null}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Table head={["Campagne", "Date", "Engagements", "Total promis", "Relancés"]}>
          {campaigns.map((c) => {
            const total = c.pledges.reduce((s, p) => s + Number(p.amountPromised ?? 0), 0);
            return (
              <tr key={c.id} className="hover:bg-ccr-gold/5">
                <td className="px-4 py-3">
                  <Link href={`/collecte/${c.id}`} className="font-semibold hover:text-ccr-magenta">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ccr-ink/70">{formatDate(c.startDate)}</td>
                <td className="px-4 py-3 text-ccr-ink/70">{c.pledges.length}</td>
                <td className="px-4 py-3 font-semibold">{total.toLocaleString("fr-FR")}</td>
                <td className="px-4 py-3 text-ccr-ink/70">{c.pledges.filter((p) => p.followUpDone).length}</td>
              </tr>
            );
          })}
        </Table>
        <Card>
          <h2 className="font-display text-lg font-bold">Nouvelle campagne</h2>
          <form action={saveCampaign} className="mt-4 space-y-4">
            <Field label="Nom">
              <Input name="name" required />
            </Field>
            <Field label="Date de début">
              <Input name="startDate" type="date" required />
            </Field>
            <Button type="submit">Créer</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
