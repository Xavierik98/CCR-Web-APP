import { prisma } from "@ccr/database";
import Link from "next/link";
import { Badge, Button, Card, Field, Input, Notice, PageHeader, Select, Table } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { fullName } from "@/lib/labels";
import { appealDraft } from "@/lib/appeal";
import { qty } from "@/lib/stock";
import { SocialTabs } from "../social-tabs";
import { addStockItem, adjustStock, distributeStock, publishAppealNow, receiveStock, remindStockNow, toggleAppeal } from "../stock-actions";

const MESSAGES: Record<string, string> = {
  ajoute: "Article ajouté à la liste.",
  recu: "Réception enregistrée, stock mis à jour.",
  distribue: "Distribution enregistrée, stock mis à jour.",
  appel: "Appel aux dons publié : il apparaît sur le site, page Actualités et accueil.",
  retire: "Appel aux dons retiré du site.",
  republie: "Appel aux dons de nouveau visible sur le site.",
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
  const [items, movements, members, demandes, appels] = await Promise.all([
    prisma.stockItem.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { name: "asc" }] }),
    prisma.stockMovement.findMany({
      orderBy: { at: "desc" },
      take: 150,
      include: { item: true, beneficiaryMember: { select: { firstName: true, lastName: true } }, request: { select: { firstName: true, lastName: true } } },
    }),
    prisma.member.findMany({ where: { membershipStatus: "ACTIVE" }, orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true } }),
    prisma.supportRequest.count({ where: { status: "NEW" } }),
    prisma.content.findMany({ where: { slug: { startsWith: "appel-aux-dons-" } }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);
  const message = Object.keys(MESSAGES).find((k) => sp[k]);
  const draft = editable ? await appealDraft() : null;
  const low = items.filter((i) => Number(i.quantity) <= Number(i.threshold));
  const changes = [
    sp.de !== undefined && sp.a !== undefined ? `quantité corrigée de ${sp.de} à ${sp.a}` : null,
    sp.seuil !== undefined ? `seuil d'alerte fixé à ${sp.seuil}` : null,
  ].filter(Boolean);
  const correction = sp.inventaire
    ? changes.length
      ? `${sp.article} : ${changes.join(", ")}.`
      : "Aucune modification : les valeurs saisies sont déjà celles du stock."
    : null;
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
      {correction ? <Notice>{correction}</Notice> : null}
      {sp.rappel !== undefined ? (
        <Notice>{sp.rappel === "0" ? "Aucun article sous le seuil d'alerte : pas de rappel nécessaire." : "Rappel du niveau du stock ajouté à l'agenda de l'accompagnement social."}</Notice>
      ) : null}
      {sp.erreur ? <Notice tone="magenta">{sp.erreur === "article" ? "Indiquez le nom de l'article." : sp.erreur === "quantite" ? "Indiquez une quantité ou un seuil valide (nombre positif)." : sp.erreur}</Notice> : null}

      <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ccr-ink/[0.06] bg-white p-4">
        <div>
          <p className="font-semibold">
            {low.length === 0 ? "Stock suffisant" : `${low.length} article${low.length > 1 ? "s" : ""} sous le seuil d'alerte`}
          </p>
          <p className="text-xs text-ccr-ink/60">
            {low.length ? low.map((i) => i.name).join(", ") + ". " : ""}
            Un appel aux dons est publié automatiquement le 1er de chaque mois, et chaque lundi si le stock est bas.
          </p>
        </div>
        {editable ? (
          <div className="flex flex-wrap gap-2">
            <form action={remindStockNow}>
              <Button type="submit" variant="secondary">Rappel du stock</Button>
            </form>
            <a href="?rediger=1#appel" className="rounded-full bg-ccr-gold px-5 py-2 text-sm font-semibold text-ccr-ink hover:bg-ccr-gold-light">
              Publier un appel aux dons
            </a>
          </div>
        ) : null}
      </section>

      {appels.length ? (
        <section className="mb-4 rounded-2xl border border-ccr-ink/[0.06] bg-white p-4">
          <p className="text-sm font-semibold">Appels aux dons</p>
          <p className="text-xs text-ccr-ink/50">Publiés sur le site, page Actualités et section actualités de l&rsquo;accueil.</p>
          <ul className="mt-3 divide-y divide-ccr-ink/[0.06]">
            {appels.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{a.title}</span>
                  <span className="text-xs text-ccr-ink/50">{a.status === "PUBLISHED" ? "Visible sur le site" : "Retiré du site"}</span>
                </span>
                {editable ? (
                  <span className="flex items-center gap-3">
                    <Link href={`/cms/${a.id}`} className="text-sm font-semibold text-ccr-blue hover:underline">Modifier</Link>
                    <form action={toggleAppeal}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className={`text-sm font-semibold hover:underline ${a.status === "PUBLISHED" ? "text-ccr-magenta" : "text-emerald-700"}`}>
                        {a.status === "PUBLISHED" ? "Retirer du site" : "Republier"}
                      </button>
                    </form>
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {draft ? (
        <details id="appel" open={sp.rediger === "1"} className="group mb-4 scroll-mt-6 rounded-2xl border border-ccr-gold/40 bg-white p-4">
          <summary className="cursor-pointer list-none text-sm font-semibold">
            Rédiger l&rsquo;appel aux dons <span className="font-normal text-ccr-ink/50">(texte proposé à partir du stock, modifiable ; aucune photo nécessaire)</span>
          </summary>
          <form action={publishAppealNow} className="mt-3 space-y-3">
            <Input name="title" defaultValue={draft.title} className="mt-0" />
            <textarea
              name="body"
              rows={6}
              defaultValue={draft.body}
              className="w-full rounded-xl border border-ccr-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-ccr-gold"
            />
            <p className="text-xs text-ccr-ink/50">Vous pouvez remplacer ce texte par votre propre message (collez-le ici). Un seul appel par mois : il remplace celui du mois s&rsquo;il existe.</p>
            <Button type="submit">Publier sur le site</Button>
          </form>
        </details>
      ) : null}

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {items.map((it) => {
          const n = Number(it.quantity);
          const alert = n <= Number(it.threshold);
          return (
            <div key={it.id} className={`rounded-2xl border bg-white p-4 ${alert ? "border-ccr-magenta/30" : "border-ccr-ink/[0.06]"}`}>
              <p className="truncate text-xs text-ccr-ink/60">{it.name}</p>
              <p className={`font-display text-2xl font-black ${alert ? "text-ccr-magenta" : ""}`}>{qty(n)}</p>
              <p className="text-[11px] text-ccr-ink/50">
                {it.unit}, seuil {qty(it.threshold)}
              </p>
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
              <div>
                <p className="text-xs font-semibold text-ccr-ink/70">Autre don non répertorié</p>
                <p className="text-[11px] text-ccr-ink/50">Écrivez l&rsquo;objet du don (ex. papier hygiénique, savon) : il est ajouté à la liste automatiquement.</p>
                <div className="mt-2 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-[2fr_1fr_1fr] gap-2">
                      <input name={`autre_nom_${i}`} placeholder="Objet du don" className="rounded-lg border border-ccr-ink/15 px-2 py-1.5 text-sm outline-none focus:border-ccr-gold" />
                      <input name={`autre_qte_${i}`} inputMode="decimal" placeholder="Qté" className="rounded-lg border border-ccr-ink/15 px-2 py-1.5 text-sm outline-none focus:border-ccr-gold" />
                      <input name={`autre_unite_${i}`} placeholder="Unité" className="rounded-lg border border-ccr-ink/15 px-2 py-1.5 text-sm outline-none focus:border-ccr-gold" />
                    </div>
                  ))}
                </div>
              </div>
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
                    {m.type === "OUT" ? "−" : m.type === "IN" ? "+" : Number(m.quantity) >= 0 ? "+" : "−"}
                    {qty(Math.abs(Number(m.quantity)))} {m.item.unit}
                    {m.type === "ADJUST" ? (
                      <span className="block text-xs text-ccr-ink/50">
                        Corrigé de {qty(Number(m.balanceAfter) - Number(m.quantity))} à {qty(m.balanceAfter)}
                      </span>
                    ) : null}
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
              <p className="text-xs text-ccr-ink/50">
                Corrige une quantité après comptage réel (l&rsquo;ancienne et la nouvelle valeur restent dans l&rsquo;historique) ou change le seuil d&rsquo;alerte.
              </p>
              <form action={adjustStock} className="mt-4 grid grid-cols-2 gap-2">
                <Select name="itemId" options={items.map((i) => [i.id, `${i.name} (${qty(i.quantity)}, seuil ${qty(i.threshold)})`])} className="col-span-2 mt-0" />
                <Input name="quantity" inputMode="decimal" placeholder="Quantité réelle" className="mt-0" />
                <Input name="threshold" inputMode="decimal" placeholder="Seuil d'alerte" className="mt-0" />
                <Input name="note" placeholder="Motif (facultatif)" className="col-span-2 mt-0" />
                <Button type="submit" variant="secondary" className="col-span-2 justify-self-start">Enregistrer</Button>
              </form>
            </Card>
          </div>
        ) : null}
      </div>
    </>
  );
}
