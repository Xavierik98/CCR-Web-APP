import { prisma } from "@ccr/database";
import { Badge, Button, Card, Field, Input, Notice, PageHeader, Select, Table } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { fullName } from "@/lib/labels";
import { qty } from "@/lib/stock";
import { SocialTabs } from "../social-tabs";
import { addStockItem, adjustStock, distributeStock, receiveStock } from "../stock-actions";

const MESSAGES: Record<string, string> = {
  ajoute: "Article ajouté à la liste.",
  recu: "Réception enregistrée, stock mis à jour.",
  distribue: "Distribution enregistrée, stock mis à jour.",
  inventaire: "Inventaire corrigé.",
};

const TYPE = { IN: { label: "Réception", tone: "blue" }, OUT: { label: "Distribution", tone: "magenta" }, ADJUST: { label: "Inventaire", tone: "neutral" } } as const;

const when = (d: Date) => d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Casablanca" });

// Stock du social : quantités disponibles, réceptions de dons, distributions
// et historique complet (date, heure, qui, à qui).
export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireAccess("social");
  const editable = canEdit(user.role, "social");
  const sp = await searchParams;
  const [items, movements, members, demandes] = await Promise.all([
    prisma.stockItem.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { name: "asc" }] }),
    prisma.stockMovement.findMany({
      orderBy: { at: "desc" },
      take: 150,
      include: { item: true, beneficiaryMember: { select: { firstName: true, lastName: true } }, request: { select: { firstName: true, lastName: true } } },
    }),
    prisma.member.findMany({ where: { membershipStatus: "ACTIVE" }, orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true } }),
    prisma.supportRequest.count({ where: { status: "NEW" } }),
  ]);
  const message = Object.keys(MESSAGES).find((k) => sp[k]);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Casablanca" });
  const nowTime = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Africa/Casablanca" });
  const qtyInputs = (prefix: string) => (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((it) => (
        <label key={`${prefix}-${it.id}`} className="block rounded-xl border border-ccr-ink/10 p-2">
          <span className="block truncate text-xs font-semibold">{it.name}</span>
          <span className="block text-[11px] text-ccr-ink/50">
            {qty(it.quantity)} {it.unit} en stock
          </span>
          <input name={`qte_${it.id}`} inputMode="decimal" placeholder="0" className="mt-1 w-full rounded-lg border border-ccr-ink/15 px-2 py-1 text-sm outline-none focus:border-ccr-gold" />
        </label>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader title="Accompagnement social" subtitle="Stock de dons : réceptions, distributions et traçabilité." />
      <SocialTabs current="stock" demandes={demandes} />
      {message ? <Notice>{MESSAGES[message]}</Notice> : null}
      {sp.erreur ? <Notice tone="magenta">{sp.erreur === "article" ? "Indiquez le nom de l'article." : sp.erreur}</Notice> : null}

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {items.map((it) => {
          const n = Number(it.quantity);
          return (
            <div key={it.id} className={`rounded-2xl border bg-white p-4 ${n <= 0 ? "border-ccr-magenta/30" : "border-ccr-ink/[0.06]"}`}>
              <p className="truncate text-xs text-ccr-ink/60">{it.name}</p>
              <p className={`font-display text-2xl font-black ${n <= 0 ? "text-ccr-magenta" : ""}`}>{qty(n)}</p>
              <p className="text-[11px] text-ccr-ink/50">{it.unit}</p>
            </div>
          );
        })}
      </section>

      {editable ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <h2 className="font-display text-lg font-bold">Réception de dons</h2>
            <p className="text-xs text-ccr-ink/50">Ajoute les quantités reçues au stock.</p>
            <form action={receiveStock} className="mt-4 space-y-4">
              {qtyInputs("in")}
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr]">
                <Field label="Date de réception">
                  <Input name="date" type="date" defaultValue={today} />
                </Field>
                <Field label="Heure">
                  <Input name="time" type="time" defaultValue={nowTime} />
                </Field>
                <Field label="Provenance (facultatif)">
                  <Input name="note" placeholder="Ex. don de la famille X, collecte du dimanche" />
                </Field>
              </div>
              <Button type="submit">Enregistrer la réception</Button>
            </form>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-bold">Distribuer</h2>
            <p className="text-xs text-ccr-ink/50">Retire les quantités du stock et note à qui elles sont remises.</p>
            <form action={distributeStock} className="mt-4 space-y-4">
              {qtyInputs("out")}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Membre de l'église">
                  <Select name="memberId" empty="Choisir…" options={members.map((m) => [m.id, fullName(m)])} />
                </Field>
                <Field label="ou personne extérieure">
                  <Input name="beneficiaryName" placeholder="Nom et prénom" />
                </Field>
              </div>
              <Field label="Précision (facultatif)">
                <Input name="note" />
              </Field>
              <Button type="submit">Enregistrer la distribution</Button>
            </form>
          </Card>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="mb-3 font-display text-xl font-bold">Historique</h2>
          {movements.length === 0 ? (
            <Card>
              <p className="text-sm text-ccr-ink/60">Aucun mouvement pour l&rsquo;instant.</p>
            </Card>
          ) : (
            <Table head={["Date et heure", "Mouvement", "Article", "Quantité", "Bénéficiaire ou provenance", "Stock après", "Par"]}>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td className="whitespace-nowrap px-4 py-2.5 text-ccr-ink/70">{when(m.at)}</td>
                  <td className="px-4 py-2.5"><Badge tone={TYPE[m.type].tone}>{TYPE[m.type].label}</Badge></td>
                  <td className="px-4 py-2.5 font-semibold">{m.item.name}</td>
                  <td className="whitespace-nowrap px-4 py-2.5">
                    {m.type === "OUT" ? "−" : m.type === "IN" ? "+" : Number(m.quantity) >= 0 ? "+" : ""}
                    {qty(m.quantity)} {m.item.unit}
                  </td>
                  <td className="px-4 py-2.5 text-ccr-ink/70">
                    {m.beneficiaryMember ? fullName(m.beneficiaryMember) : m.beneficiaryName ?? (m.request ? fullName(m.request) : "")}
                    {m.request ? <span className="block text-xs text-ccr-ink/40">Demande de soutien</span> : null}
                    {m.note ? <span className="block text-xs text-ccr-ink/50">{m.note}</span> : null}
                  </td>
                  <td className="px-4 py-2.5 text-ccr-ink/70">{qty(m.balanceAfter)}</td>
                  <td className="px-4 py-2.5 text-xs text-ccr-ink/50">{m.byEmail}</td>
                </tr>
              ))}
            </Table>
          )}
        </section>

        {editable ? (
          <div className="space-y-6">
            <Card>
              <h2 className="font-display text-lg font-bold">Ajouter un article</h2>
              <p className="text-xs text-ccr-ink/50">Pour une denrée ou un équipement qui n&rsquo;est pas dans la liste.</p>
              <form action={addStockItem} className="mt-4 grid grid-cols-[2fr_1fr] gap-3">
                <Input name="name" placeholder="Ex. Lentilles, couvertures" required />
                <Input name="unit" placeholder="Unité (kg, paquet…)" />
                <Button type="submit" className="col-span-2 justify-self-start">Ajouter</Button>
              </form>
            </Card>
            <Card>
              <h2 className="font-display text-lg font-bold">Inventaire</h2>
              <p className="text-xs text-ccr-ink/50">Corrige une quantité après comptage réel (tracé dans l&rsquo;historique).</p>
              <form action={adjustStock} className="mt-4 grid grid-cols-[2fr_1fr_auto] gap-2">
                <Select name="itemId" options={items.map((i) => [i.id, i.name])} className="mt-0" />
                <Input name="quantity" inputMode="decimal" placeholder="Qté réelle" className="mt-0" required />
                <Button type="submit" variant="secondary">OK</Button>
              </form>
            </Card>
          </div>
        ) : null}
      </div>
    </>
  );
}
