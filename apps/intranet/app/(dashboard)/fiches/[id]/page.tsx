import { prisma } from "@ccr/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Card, Notice, PageHeader } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { CATEGORY_LABELS, PROFESSIONAL_LABELS, formatDate, fullName } from "@/lib/labels";
import { findDuplicates } from "@/lib/members";
import { createFromSubmission, mergeSubmission, rejectSubmission } from "../actions";

const LABELS: Record<string, string> = {
  title: "Titre",
  lastName: "Nom(s)",
  firstName: "Prénom(s)",
  phone: "Téléphone",
  email: "E-mail",
  birthDate: "Date de naissance",
  neighborhood: "Quartier",
  category: "Catégorie",
  professionalStatus: "Situation professionnelle",
};

type Row = Record<string, unknown>;

function show(key: string, v: unknown) {
  if (v === null || v === undefined || v === "") return "";
  if (v instanceof Date) return formatDate(v);
  if (key === "category") return CATEGORY_LABELS[v as keyof typeof CATEGORY_LABELS] ?? String(v);
  if (key === "professionalStatus") return PROFESSIONAL_LABELS[v as keyof typeof PROFESSIONAL_LABELS] ?? String(v);
  return String(v);
}

export default async function FichePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ membre?: string; erreur?: string }>;
}) {
  const user = await requireAccess("fiches");
  const editable = canEdit(user.role, "fiches");
  const { id } = await params;
  const { membre, erreur } = await searchParams;

  const sub = await prisma.memberSubmission.findUnique({ where: { id } });
  if (!sub) notFound();

  const [candidates, departments] = await Promise.all([
    findDuplicates(sub, undefined, 6),
    prisma.department.findMany({ select: { id: true, name: true } }),
  ]);
  const chosenId = membre ?? candidates[0]?.member.id ?? null;
  const target = chosenId
    ? await prisma.member.findUnique({
        where: { id: chosenId },
        include: { memberships: { include: { department: true } } },
      })
    : null;

  const deptName = new Map(departments.map((d) => [d.id, d.name]));
  const subDepts = (Array.isArray(sub.departments) ? sub.departments : []) as { departmentId: string; role: string | null }[];
  const pending = sub.status === "PENDING";

  return (
    <>
      <PageHeader
        title={fullName(sub)}
        subtitle={`Fiche envoyée le ${formatDate(sub.createdAt)}`}
        back={{ href: "/fiches", label: "Fiches à valider" }}
      />
      {erreur === "membre" ? <Notice tone="magenta">Choisissez le membre à mettre à jour.</Notice> : null}
      {!pending ? <Notice>Cette fiche a déjà été traitée.</Notice> : null}

      {candidates.length > 0 ? (
        <Card className="mb-6">
          <h2 className="font-display text-lg font-bold">Membres qui semblent correspondre</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {candidates.map(({ member, score }) => (
              <Link
                key={member.id}
                href={`/fiches/${sub.id}?membre=${member.id}`}
                className={`rounded-full border px-3 py-1 text-sm ${
                  member.id === chosenId ? "border-ccr-gold bg-ccr-gold/15 font-semibold" : "border-ccr-ink/15 hover:border-ccr-ink/40"
                }`}
              >
                {fullName(member)}
                {score >= 10 ? <span className="ml-1 text-xs text-ccr-blue">même contact</span> : null}
              </Link>
            ))}
          </div>
        </Card>
      ) : (
        <Notice>Aucun membre existant ne semble correspondre : c&rsquo;est probablement une nouvelle personne.</Notice>
      )}

      <form action={mergeSubmission}>
        <input type="hidden" name="id" value={sub.id} />
        <input type="hidden" name="memberId" value={target?.id ?? ""} />
        <Card>
          <h2 className="font-display text-lg font-bold">
            {target ? `Comparer avec ${fullName(target)}` : "Contenu de la fiche"}
          </h2>
          {target ? (
            <p className="mt-1 text-sm text-ccr-ink/60">
              Les cases cochées remplacent la valeur actuelle par celle de la fiche. Par défaut, toute
              information nouvelle ou différente est cochée.
            </p>
          ) : null}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-ccr-ink/50">
                <tr>
                  {target ? <th className="w-10 py-2" /> : null}
                  <th className="py-2 pr-4">Champ</th>
                  <th className="py-2 pr-4">Fiche envoyée</th>
                  {target ? <th className="py-2">Actuellement</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-ccr-ink/5">
                {Object.keys(LABELS).map((key) => {
                  const next = show(key, (sub as Row)[key]);
                  const current = target ? show(key, (target as Row)[key]) : "";
                  const same = (a: string, b: string) => a.localeCompare(b, "fr", { sensitivity: "base" }) === 0;
                  const differs = next !== "" && !same(next, current);
                  return (
                    <tr key={key} className={differs && target ? "bg-ccr-gold/5" : ""}>
                      {target ? (
                        <td className="py-2">
                          <input
                            type="checkbox"
                            name="apply"
                            value={key}
                            defaultChecked={differs}
                            disabled={next === "" || !pending}
                            className="h-4 w-4 accent-ccr-gold"
                          />
                        </td>
                      ) : null}
                      <td className="py-2 pr-4 font-semibold">{LABELS[key]}</td>
                      <td className="py-2 pr-4">{next || <span className="text-ccr-ink/30">vide</span>}</td>
                      {target ? <td className="py-2 text-ccr-ink/60">{current || <span className="text-ccr-ink/30">vide</span>}</td> : null}
                    </tr>
                  );
                })}
                <tr>
                  {target ? (
                    <td className="py-2 align-top">
                      <input type="checkbox" name="apply" value="functions" defaultChecked={sub.functions.length > 0} disabled={!sub.functions.length || !pending} className="h-4 w-4 accent-ccr-gold" />
                    </td>
                  ) : null}
                  <td className="py-2 pr-4 align-top font-semibold">Fonctions</td>
                  <td className="py-2 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {sub.functions.map((f) => <Badge key={f} tone="gold">{f}</Badge>)}
                    </div>
                  </td>
                  {target ? (
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {target.functions.map((f) => <Badge key={f}>{f}</Badge>)}
                      </div>
                    </td>
                  ) : null}
                </tr>
                <tr>
                  {target ? (
                    <td className="py-2 align-top">
                      <input type="checkbox" name="apply" value="departments" defaultChecked={subDepts.length > 0} disabled={!subDepts.length || !pending} className="h-4 w-4 accent-ccr-gold" />
                    </td>
                  ) : null}
                  <td className="py-2 pr-4 align-top font-semibold">Départements</td>
                  <td className="py-2 pr-4">
                    {subDepts.map((d) => (
                      <p key={d.departmentId}>
                        {deptName.get(d.departmentId) ?? "Département supprimé"}
                        {d.role ? <span className="text-ccr-ink/50"> ({d.role})</span> : null}
                      </p>
                    ))}
                  </td>
                  {target ? (
                    <td className="py-2 text-ccr-ink/60">
                      {target.memberships.map((m) => (
                        <p key={m.id}>
                          {m.department.name}
                          {m.role ? ` (${m.role})` : ""}
                        </p>
                      ))}
                    </td>
                  ) : null}
                </tr>
                {sub.message ? (
                  <tr>
                    {target ? (
                      <td className="py-2 align-top">
                        <input type="checkbox" name="apply" value="message" defaultChecked disabled={!pending} className="h-4 w-4 accent-ccr-gold" />
                      </td>
                    ) : null}
                    <td className="py-2 pr-4 align-top font-semibold">Remarques</td>
                    <td className="py-2 pr-4 whitespace-pre-line" colSpan={target ? 2 : 1}>
                      {sub.message}
                      {target ? <span className="block text-xs text-ccr-ink/50">Ajoutées aux notes du membre si cochées.</span> : null}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {pending && editable ? (
            <div className="mt-6 flex flex-wrap gap-3 border-t border-ccr-ink/10 pt-5">
              {target ? <Button type="submit">Mettre à jour {fullName(target)}</Button> : null}
              <Button type="submit" formAction={createFromSubmission} variant="secondary">
                Créer un nouveau membre
              </Button>
              <Button type="submit" formAction={rejectSubmission} variant="danger">
                Rejeter la fiche
              </Button>
            </div>
          ) : null}
        </Card>
      </form>
    </>
  );
}
