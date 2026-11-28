import { prisma, type NeedStatus } from "@ccr/database";
import Link from "next/link";
import { Badge, ButtonLink, Card, Notice, PageHeader, Table } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { formatDate } from "@/lib/labels";
import { NEED_STATUS, departmentsFor, mad } from "@/lib/needs";
import { peopleNames } from "@/lib/people";

const VUES: { key: string; label: string; status?: NeedStatus[] }[] = [
  { key: "", label: "À valider", status: ["SUBMITTED"] },
  { key: "valides", label: "Validés", status: ["APPROVED", "PARTIAL"] },
  { key: "realises", label: "Réalisés", status: ["DONE"] },
  { key: "refuses", label: "Refusés", status: ["REJECTED"] },
  { key: "tous", label: "Tous" },
];

// États de besoin des départements : chaque département rédige le sien,
// le pasteur ou la trésorerie le valide, puis il est marqué réalisé.
export default async function BesoinsPage({ searchParams }: { searchParams: Promise<{ vue?: string; supprime?: string }> }) {
  const user = await requireAccess("besoins");
  const decider = canEdit(user.role, "besoins");
  const sp = await searchParams;
  const vue = VUES.find((v) => v.key === (sp.vue ?? "")) ?? VUES[0];
  const mine = await departmentsFor(user);
  const scope = decider || ["ADMIN", "SECRETARY"].includes(user.role) ? {} : { departmentId: { in: mine.map((d) => d.id) } };
  const [rows, counts] = await Promise.all([
    prisma.needsStatement.findMany({
      where: { ...scope, ...(vue.status ? { status: { in: vue.status } } : {}) },
      orderBy: [{ urgent: "desc" }, { createdAt: "desc" }],
      include: { department: { select: { name: true } } },
      take: 200,
    }),
    prisma.needsStatement.groupBy({ by: ["status"], where: scope, _count: true }),
  ]);
  const count = (v: (typeof VUES)[number]) => counts.filter((c) => !v.status || v.status.includes(c.status)).reduce((s, c) => s + c._count, 0);
  const name = await peopleNames(rows.map((r) => r.createdBy));

  return (
    <>
      <PageHeader
        title="États de besoin"
        subtitle={decider ? "Besoins des départements à valider, suivre et réaliser." : "Les besoins de vos départements et leur suivi."}
        action={mine.length ? <ButtonLink href="/besoins/nouveau">Faire un état de besoin</ButtonLink> : undefined}
      />
      {sp.supprime ? <Notice>État de besoin supprimé.</Notice> : null}
      {!mine.length && !decider ? (
        <Notice tone="magenta">Votre compte n&rsquo;est lié à aucun département : demandez au super administrateur de relier votre fiche membre.</Notice>
      ) : null}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {VUES.map((v) => (
          <Link
            key={v.key}
            href={v.key ? `/besoins?vue=${v.key}` : "/besoins"}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold ${v === vue ? "bg-ccr-ink text-ccr-cream" : "bg-white text-ccr-ink/70 ring-1 ring-ccr-ink/10 hover:text-ccr-ink"}`}
          >
            {v.label} <span className="opacity-60">{count(v)}</span>
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <Card><p className="text-sm text-ccr-ink/60">Aucun état de besoin dans « {vue.label} ».</p></Card>
      ) : (
        <Table head={["Département", "Objet", "Montant estimé", "Pour le", "Statut", "Demandé par"]}>
          {rows.map((n) => (
            <tr key={n.id} className="hover:bg-ccr-gold/5">
              <td className="px-4 py-3 font-semibold">{n.department.name}</td>
              <td className="px-4 py-3">
                <Link href={`/besoins/${n.id}`} className="font-semibold hover:text-ccr-magenta">{n.title}</Link>
                {n.urgent ? <span className="ml-2"><Badge tone="magenta">Urgent</Badge></span> : null}
              </td>
              <td className="whitespace-nowrap px-4 py-3">{n.total !== null ? mad(Number(n.total)) : "À chiffrer"}</td>
              <td className="whitespace-nowrap px-4 py-3 text-ccr-ink/70">{n.neededBy ? formatDate(n.neededBy) : ""}</td>
              <td className="px-4 py-3"><Badge tone={NEED_STATUS[n.status].tone}>{NEED_STATUS[n.status].label}</Badge></td>
              <td className="px-4 py-3 text-xs text-ccr-ink/60">
                {name(n.createdBy)}
                <span className="block">{formatDate(n.createdAt)}</span>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
