import { prisma } from "@ccr/database";
import Link from "next/link";
import { Badge, Card, PageHeader } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { waLink } from "@/lib/whatsapp";
import { toggleMessage } from "./actions";

const when = (d: Date) => d.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Casablanca" });

// Boîte de réception des formulaires du site (Contact, Mon église a un besoin).
export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ vue?: string }> }) {
  const user = await requireAccess("messages");
  const editable = canEdit(user.role, "messages");
  const { vue } = await searchParams;
  const traites = vue === "traites";
  const [messages, pending] = await Promise.all([
    prisma.contactMessage.findMany({ where: { status: traites ? "DONE" : "NEW" }, orderBy: { createdAt: traites ? "desc" : "asc" }, take: 200 }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);
  const tab = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold ${active ? "bg-ccr-ink text-ccr-cream" : "text-ccr-ink/60 hover:text-ccr-ink"}`;

  return (
    <>
      <PageHeader title="Messages du site" subtitle="Formulaires Contact et « Mon église a un besoin » envoyés depuis le site public." />
      <div className="mb-4 flex gap-2">
        <Link href="/messages" className={tab(!traites)}>À traiter ({pending})</Link>
        <Link href="/messages?vue=traites" className={tab(traites)}>Traités</Link>
      </div>
      {messages.length === 0 ? (
        <Card>
          <p className="text-sm text-ccr-ink/60">{traites ? "Aucun message traité." : "Aucun nouveau message."}</p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {messages.map((m) => (
            <Card key={m.id} className={m.status === "NEW" ? "border-ccr-gold/50" : ""}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display text-lg font-bold">
                    {m.lastName} {m.firstName}
                  </p>
                  <p className="text-xs text-ccr-ink/50">Reçu le {when(m.createdAt)}</p>
                </div>
                <Badge tone={m.kind === "BESOIN" ? "magenta" : "blue"}>{m.kind === "BESOIN" ? "L'église a un besoin" : "Contact"}</Badge>
              </div>
              {m.subject || m.department ? (
                <p className="mt-2 text-sm font-semibold">{[m.subject, m.department].filter(Boolean).join(", ")}</p>
              ) : null}
              <p className="mt-2 whitespace-pre-line rounded-xl bg-ccr-cream p-3 text-sm text-ccr-ink/85">{m.message}</p>
              <p className="mt-2 text-sm text-ccr-ink/70">
                {m.phone} <span className="text-ccr-ink/40">/</span> {m.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-ccr-ink/10 pt-3 text-sm font-semibold">
                <a href={waLink(m.phone, `Bonjour ${m.firstName}, merci pour votre message sur le site de CCR Famille.`)} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">
                  Répondre sur WhatsApp
                </a>
                {m.email ? (
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent("Votre message à CCR Famille")}`} className="text-ccr-blue hover:underline">
                    Répondre par e-mail
                  </a>
                ) : null}
                {editable ? (
                  <form action={toggleMessage} className="ml-auto">
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="retour" value={traites ? "/messages?vue=traites" : "/messages"} />
                    <button type="submit" className="rounded-full border border-ccr-ink/15 px-3 py-1 text-xs hover:border-ccr-ink">
                      {m.status === "NEW" ? "Marquer comme traité" : "Remettre à traiter"}
                    </button>
                  </form>
                ) : null}
              </div>
              {m.handledAt ? <p className="mt-2 text-xs text-ccr-ink/40">Traité le {when(m.handledAt)}{m.handledBy ? ` par ${m.handledBy}` : ""}</p> : null}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
