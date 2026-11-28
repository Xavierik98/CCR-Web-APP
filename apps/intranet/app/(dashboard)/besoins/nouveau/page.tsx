import { redirect } from "next/navigation";
import { NeedItems } from "@/components/need-items";
import { Button, Card, Field, Input, Notice, PageHeader, Select, Textarea } from "@/components/ui";
import { requireAccess } from "@/lib/auth";
import { departmentsFor } from "@/lib/needs";
import { saveNeed } from "../actions";

export default async function NouveauBesoinPage({ searchParams }: { searchParams: Promise<{ departement?: string; erreur?: string }> }) {
  const user = await requireAccess("besoins");
  const sp = await searchParams;
  const depts = await departmentsFor(user);
  if (!depts.length) redirect("/besoins");
  return (
    <>
      <PageHeader title="Faire un état de besoin" subtitle="Ce dont votre département a besoin, chiffré si possible. Il sera transmis au pasteur et à la trésorerie." back={{ href: "/besoins", label: "États de besoin" }} />
      {sp.erreur === "contenu" ? <Notice tone="magenta">Indiquez un objet et au moins une ligne.</Notice> : null}
      {sp.erreur === "departement" ? <Notice tone="magenta">Choisissez un de vos départements.</Notice> : null}
      <Card className="max-w-4xl">
        <form action={saveNeed} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Département">
              <Select name="departmentId" defaultValue={sp.departement ?? (depts.length === 1 ? depts[0].id : "")} empty={depts.length > 1 ? "Choisir…" : undefined} options={depts.map((d) => [d.id, d.name])} required />
            </Field>
            <Field label="Objet">
              <Input name="title" placeholder="Ex. matériel pour la louange de Noël" required />
            </Field>
          </div>
          <Field label="Justification (facultative)">
            <Textarea name="purpose" rows={2} placeholder="Pourquoi ce besoin, pour quelle activité" />
          </Field>
          <div>
            <p className="mb-2 text-sm font-semibold">Ce qu&rsquo;il faut</p>
            <NeedItems />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pour le (facultatif)">
              <Input name="neededBy" type="date" />
            </Field>
            <label className="flex items-center gap-3 self-end rounded-xl border border-ccr-ink/10 p-3">
              <input type="checkbox" name="urgent" className="h-4 w-4 accent-ccr-magenta" />
              <span className="text-sm font-semibold">Urgent</span>
            </label>
          </div>
          <Button type="submit">Envoyer l&rsquo;état de besoin</Button>
        </form>
      </Card>
    </>
  );
}
