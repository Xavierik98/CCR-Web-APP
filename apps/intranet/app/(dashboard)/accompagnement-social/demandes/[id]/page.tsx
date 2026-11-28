import { prisma } from "@ccr/database";
import { notFound, redirect } from "next/navigation";
import { Button, Card, Field, Input, Notice, PageHeader, Select } from "@/components/ui";
import { requireAccess } from "@/lib/auth";
import { fullName } from "@/lib/labels";
import { qty } from "@/lib/stock";
import { distributeStock } from "../../stock-actions";

// Effectuer un soutien : choisir les quantités remises (retirées du stock),
// le bénéficiaire, puis clore la demande en une seule opération tracée.
export default async function EffectuerSoutienPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireAccess("social", "edit");
  const { id } = await params;
  const { erreur } = await searchParams;
  const [request, items, members] = await Promise.all([
    prisma.supportRequest.findUnique({ where: { id } }),
    prisma.stockItem.findMany({ where: { active: true }, orderBy: [{ position: "asc" }, { name: "asc" }] }),
    prisma.member.findMany({ where: { membershipStatus: "ACTIVE" }, orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true } }),
  ]);
  if (!request) notFound();
  if (request.status !== "NEW") redirect("/accompagnement-social/demandes?vue=traitees");
  const wanted = new Set(request.needs.map((n) => n.toLowerCase()));

  return (
    <>
      <PageHeader
        title={`Soutien pour ${fullName(request)}`}
        subtitle={`Demande reçue le ${request.createdAt.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Casablanca" })}`}
        back={{ href: "/accompagnement-social/demandes", label: "Demandes de soutien" }}
      />
      {erreur ? <Notice tone="magenta">{erreur}</Notice> : null}

      <form action={distributeStock}>
        <input type="hidden" name="requestId" value={request.id} />
        <input type="hidden" name="retour" value={`/accompagnement-social/demandes/${request.id}`} />
        <Card>
          <h2 className="font-display text-lg font-bold">Ce qui est remis</h2>
          <p className="text-xs text-ccr-ink/50">Les articles demandés sont mis en avant. Les quantités sont retirées du stock.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((it) => {
              const asked = wanted.has(it.name.toLowerCase());
              const empty = Number(it.quantity) <= 0;
              return (
                <label key={it.id} className={`block rounded-xl border p-3 ${asked ? "border-ccr-gold bg-ccr-gold/10" : "border-ccr-ink/10"}`}>
                  <span className="block truncate text-sm font-semibold">{it.name}</span>
                  <span className={`block text-xs ${empty ? "text-ccr-magenta" : "text-ccr-ink/50"}`}>
                    {qty(it.quantity)} {it.unit} en stock{asked ? ", demandé" : ""}
                  </span>
                  <input
                    name={`qte_${it.id}`}
                    inputMode="decimal"
                    placeholder="0"
                    disabled={empty}
                    className="mt-1.5 w-full rounded-lg border border-ccr-ink/15 px-2 py-1.5 text-sm outline-none focus:border-ccr-gold disabled:bg-ccr-ink/5"
                  />
                </label>
              );
            })}
          </div>
          {request.needs.some((n) => !items.some((i) => i.name.toLowerCase() === n.toLowerCase())) ? (
            <p className="mt-3 text-xs text-ccr-ink/60">
              Demandé aussi : {request.needs.filter((n) => !items.some((i) => i.name.toLowerCase() === n.toLowerCase())).join(", ")}
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 border-t border-ccr-ink/10 pt-5 sm:grid-cols-2">
            <Field label="Bénéficiaire : membre de l'église">
              <Select name="memberId" defaultValue={request.memberId ?? ""} empty="Personne extérieure" options={members.map((m) => [m.id, fullName(m)])} />
            </Field>
            <Field label="ou nom de la personne">
              <Input name="beneficiaryName" defaultValue={request.memberId ? "" : fullName(request)} />
            </Field>
          </div>
          <Field label="Précision (facultatif)">
            <Input name="note" placeholder="Ex. remis au domicile, à l'église" />
          </Field>
          <div className="mt-5">
            <Button type="submit">Valider le soutien et clore la demande</Button>
          </div>
        </Card>
      </form>
    </>
  );
}
