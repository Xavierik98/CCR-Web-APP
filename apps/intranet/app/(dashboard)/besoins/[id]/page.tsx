import { prisma } from "@ccr/database";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { NeedItems } from "@/components/need-items";
import { PrintButton } from "@/components/print-button";
import { Badge, Button, Card, Field, Input, Notice, PageHeader, Textarea } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { formatDate, toDateInput } from "@/lib/labels";
import { NEED_STATUS, departmentsFor, mad, readItems } from "@/lib/needs";
import { peopleNames } from "@/lib/people";
import { decideNeed, deleteNeed, saveNeed } from "../actions";

// État de besoin : document imprimable (ou enregistrable en PDF), décision
// du pasteur ou de la trésorerie, modification tant qu'il n'est pas traité.
export default async function BesoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireAccess("besoins");
  const decider = canEdit(user.role, "besoins");
  const { id } = await params;
  const sp = await searchParams;
  const n = await prisma.needsStatement.findUnique({ where: { id }, include: { department: true } });
  if (!n) notFound();
  const mine = await departmentsFor(user);
  if (!decider && !["ADMIN", "SECRETARY"].includes(user.role) && !mine.some((d) => d.id === n.departmentId)) redirect("/besoins");
  const items = readItems(n.items);
  const name = await peopleNames([n.createdBy, n.decidedBy]);
  const editable = n.status === "SUBMITTED" && (n.createdBy === user.email || decider);
  const when = (d: Date) => d.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Casablanca" });

  if (sp.modifier && editable) {
    return (
      <>
        <PageHeader title="Modifier l'état de besoin" back={{ href: `/besoins/${n.id}`, label: "Retour à l'état de besoin" }} />
        {sp.erreur === "contenu" ? <Notice tone="magenta">Indiquez un objet et au moins une ligne.</Notice> : null}
        <Card className="max-w-4xl">
          <form action={saveNeed} className="space-y-5">
            <input type="hidden" name="id" value={n.id} />
            <input type="hidden" name="departmentId" value={n.departmentId} />
            <Field label="Objet"><Input name="title" defaultValue={n.title} required /></Field>
            <Field label="Justification (facultative)"><Textarea name="purpose" rows={2} defaultValue={n.purpose ?? ""} /></Field>
            <NeedItems initial={items} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Pour le (facultatif)"><Input name="neededBy" type="date" defaultValue={toDateInput(n.neededBy)} /></Field>
              <label className="flex items-center gap-3 self-end rounded-xl border border-ccr-ink/10 p-3">
                <input type="checkbox" name="urgent" defaultChecked={n.urgent} className="h-4 w-4 accent-ccr-magenta" />
                <span className="text-sm font-semibold">Urgent</span>
              </label>
            </div>
            <Button type="submit">Enregistrer</Button>
          </form>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="print:hidden">
        <PageHeader title={n.title} subtitle={`${n.department.name}, demandé le ${formatDate(n.createdAt)}`} back={{ href: "/besoins", label: "États de besoin" }} />
        {sp.envoye ? <Notice>État de besoin envoyé : il apparaît sur le tableau de bord du pasteur et de la trésorerie.</Notice> : null}
        {sp.enregistre ? <Notice>Modifications enregistrées.</Notice> : null}
        {sp.decision ? <Notice>Décision enregistrée.</Notice> : null}
        {sp.erreur === "motif" ? <Notice tone="magenta">Indiquez le motif du refus.</Notice> : null}
        {sp.erreur === "verrouille" ? <Notice tone="magenta">Cet état de besoin a déjà été traité : il ne peut plus être modifié.</Notice> : null}
      </div>

      {/* Document : mis en page pour l'impression ou l'enregistrement en PDF. */}
      <article className="max-w-4xl rounded-2xl border border-ccr-ink/[0.06] bg-white p-6 print:max-w-none print:border-0 print:p-0 sm:p-8">
        <header className="flex items-start justify-between gap-4 border-b border-ccr-ink/10 pb-4">
          <div className="flex items-center gap-3">
            <Image src="/logo-ccr-famille.png" alt="" width={32} height={56} className="h-12 w-auto" />
            <div>
              <p className="font-display text-xl font-bold">État de besoin</p>
              <p className="text-sm text-ccr-ink/60">CCR Famille Casablanca, département {n.department.name}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge tone={NEED_STATUS[n.status].tone}>{NEED_STATUS[n.status].label}</Badge>
            {n.urgent ? <span className="ml-1"><Badge tone="magenta">Urgent</Badge></span> : null}
            <p className="mt-1 text-xs text-ccr-ink/50">N° {n.id.slice(-6).toUpperCase()}</p>
          </div>
        </header>
        <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <div><dt className="inline text-ccr-ink/50">Objet : </dt><dd className="inline font-semibold">{n.title}</dd></div>
          <div><dt className="inline text-ccr-ink/50">Demandé par : </dt><dd className="inline">{name(n.createdBy)}, le {when(n.createdAt)}</dd></div>
          {n.neededBy ? <div><dt className="inline text-ccr-ink/50">Pour le : </dt><dd className="inline">{formatDate(n.neededBy)}</dd></div> : null}
        </dl>
        {n.purpose ? <p className="mt-3 whitespace-pre-line rounded-xl bg-ccr-cream p-3 text-sm">{n.purpose}</p> : null}
        <table className="mt-5 w-full text-left text-sm">
          <thead className="border-b border-ccr-ink/15 text-xs uppercase tracking-wide text-ccr-ink/50">
            <tr><th className="py-2 pr-3">Désignation</th><th className="py-2 pr-3 text-right">Quantité</th><th className="py-2 pr-3 text-right">Prix unitaire</th><th className="py-2 text-right">Montant</th></tr>
          </thead>
          <tbody className="divide-y divide-ccr-ink/5">
            {items.map((it, i) => (
              <tr key={i}>
                <td className="py-2 pr-3">{it.label}</td>
                <td className="py-2 pr-3 text-right">{it.quantity.toLocaleString("fr-FR")} {it.unit ?? ""}</td>
                <td className="py-2 pr-3 text-right">{it.unitPrice !== null ? mad(it.unitPrice) : "À chiffrer"}</td>
                <td className="py-2 text-right">{it.unitPrice !== null ? mad(it.unitPrice * it.quantity) : ""}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-ccr-ink/20">
              <td colSpan={3} className="py-3 text-right font-semibold">Total estimé</td>
              <td className="py-3 text-right font-display text-lg font-bold">{n.total !== null ? mad(Number(n.total)) : "À chiffrer"}</td>
            </tr>
          </tfoot>
        </table>
        {n.decidedAt ? (
          <p className="mt-4 rounded-xl border border-ccr-ink/10 p-3 text-sm">
            <b>{NEED_STATUS[n.status].label}</b> par {name(n.decidedBy)} le {when(n.decidedAt)}
            {n.decisionNote ? <span className="block text-ccr-ink/70">{n.decisionNote}</span> : null}
          </p>
        ) : null}
        <div className="mt-10 hidden grid-cols-2 gap-10 text-sm print:grid">
          <div className="border-t border-ccr-ink/30 pt-2">Le responsable du département</div>
          <div className="border-t border-ccr-ink/30 pt-2">Le pasteur ou la trésorerie</div>
        </div>
      </article>

      <div className="mt-4 flex max-w-4xl flex-wrap items-center gap-3 print:hidden">
        <PrintButton label="Imprimer ou enregistrer en PDF" />
        {editable ? <a href={`/besoins/${n.id}?modifier=1`} className="text-sm font-semibold text-ccr-blue hover:underline">Modifier</a> : null}
        {(editable || decider) ? (
          <form action={deleteNeed}>
            <input type="hidden" name="id" value={n.id} />
            <button type="submit" className="text-sm font-semibold text-ccr-magenta hover:underline">Supprimer</button>
          </form>
        ) : null}
      </div>

      {decider ? (
        <Card className="mt-6 max-w-4xl print:hidden">
          <h2 className="font-display text-lg font-bold">Décision</h2>
          <form className="mt-3 space-y-3">
            <input type="hidden" name="id" value={n.id} />
            <Textarea name="decisionNote" rows={2} placeholder="Commentaire (obligatoire pour un refus) : montant accordé, délai, raison…" defaultValue={n.decisionNote ?? ""} />
            <div className="flex flex-wrap gap-2">
              <Button formAction={decideNeed.bind(null, "APPROVED")}>Valider</Button>
              <Button formAction={decideNeed.bind(null, "PARTIAL")} variant="secondary">Valider en partie</Button>
              <Button formAction={decideNeed.bind(null, "REJECTED")} variant="danger">Refuser</Button>
              {n.status === "APPROVED" || n.status === "PARTIAL" ? (
                <Button formAction={decideNeed.bind(null, "DONE")} variant="secondary">Marquer réalisé</Button>
              ) : null}
            </div>
          </form>
        </Card>
      ) : null}
    </>
  );
}
