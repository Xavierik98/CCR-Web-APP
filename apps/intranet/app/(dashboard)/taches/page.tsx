import { prisma } from "@ccr/database";
import { Badge, Button, Card, Field, Input, Notice, PageHeader, Select, Table, Textarea } from "@/components/ui";
import { ROLE_LABELS, requireAccess } from "@/lib/auth";
import { fullName } from "@/lib/labels";
import { formatDue } from "@/lib/tasks";
import { createTask, deleteTask, toggleTask } from "./actions";

// Attribution des tâches aux responsables (toute personne ayant un accès à
// l'intranet). Chacun les retrouve dans « Mes tâches » et dans son agenda.
export default async function TachesPage({
  searchParams,
}: {
  searchParams: Promise<{ cree?: string; supprime?: string; erreur?: string; vue?: string }>;
}) {
  await requireAccess("taches", "edit");
  const { cree, supprime, erreur, vue } = await searchParams;
  const done = vue === "faites";

  const [users, tasks] = await Promise.all([
    prisma.user.findMany({ include: { member: { select: { firstName: true, lastName: true } } }, orderBy: { email: "asc" } }),
    prisma.task.findMany({
      where: done ? { NOT: { doneAt: null } } : { doneAt: null },
      orderBy: done ? { doneAt: "desc" } : { dueAt: "asc" },
      include: { assignee: { include: { member: { select: { firstName: true, lastName: true } } } } },
      take: 300,
    }),
  ]);
  const who = (u: (typeof users)[number]) => (u.member ? `${fullName(u.member)} (${ROLE_LABELS[u.role]})` : `${u.email} (${ROLE_LABELS[u.role]})`);
  const now = new Date();
  const tab = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold ${active ? "bg-ccr-ink text-ccr-cream" : "text-ccr-ink/60 hover:text-ccr-ink"}`;

  return (
    <>
      <PageHeader
        title="Tâches des responsables"
        subtitle="Chaque tâche apparaît dans « Mes tâches » de la personne et dans son agenda, avec un rappel la veille et une heure avant."
      />
      {cree ? <Notice>Tâche assignée.</Notice> : null}
      {supprime ? <Notice>Tâche supprimée.</Notice> : null}
      {erreur ? <Notice tone="magenta">Indiquez la personne, l&rsquo;intitulé, la date et l&rsquo;heure.</Notice> : null}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div>
          <div className="mb-4 flex gap-2">
            <a href="/taches" className={tab(!done)}>À faire</a>
            <a href="/taches?vue=faites" className={tab(done)}>Faites</a>
          </div>
          {tasks.length === 0 ? (
            <Card>
              <p className="text-sm text-ccr-ink/60">{done ? "Aucune tâche terminée." : "Aucune tâche en cours."}</p>
            </Card>
          ) : (
            <Table head={["Tâche", "Responsable", "Échéance", ""]}>
              {tasks.map((t) => {
                const late = !t.doneAt && t.dueAt < now;
                return (
                  <tr key={t.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{t.title}</p>
                      {t.description ? <p className="mt-0.5 line-clamp-2 text-xs text-ccr-ink/60">{t.description}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-ccr-ink/70">{t.assignee.member ? fullName(t.assignee.member) : t.assignee.email}</td>
                    <td className="px-4 py-3">
                      <span className={late ? "font-semibold text-ccr-magenta" : "text-ccr-ink/70"}>{formatDue(t.dueAt)}</span>
                      {late ? <span className="ml-2"><Badge tone="magenta">En retard</Badge></span> : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        <form action={toggleTask}>
                          <input type="hidden" name="id" value={t.id} />
                          <input type="hidden" name="retour" value={done ? "/taches?vue=faites" : "/taches"} />
                          <button type="submit" className="text-xs font-semibold text-ccr-blue hover:underline">
                            {t.doneAt ? "Rouvrir" : "Marquer faite"}
                          </button>
                        </form>
                        <form action={deleteTask}>
                          <input type="hidden" name="id" value={t.id} />
                          <button type="submit" className="text-xs font-semibold text-ccr-magenta hover:underline">Supprimer</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Table>
          )}
        </div>

        <Card className="self-start">
          <h2 className="font-display text-lg font-bold">Assigner une tâche</h2>
          {users.length === 0 ? (
            <p className="mt-2 text-sm text-ccr-ink/60">Donnez d&rsquo;abord un accès à l&rsquo;intranet au responsable (rubrique Accès et rôles).</p>
          ) : (
            <form action={createTask} className="mt-4 space-y-4">
              <Field label="Responsable">
                <Select name="assigneeId" required empty="Choisir…" options={users.map((u) => [u.id, who(u)])} />
              </Field>
              <Field label="Tâche">
                <Input name="title" required maxLength={160} placeholder="Ex. Préparer la louange de dimanche" />
              </Field>
              <Field label="Détails (facultatif)">
                <Textarea name="description" rows={3} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <Input name="date" type="date" required />
                </Field>
                <Field label="Heure">
                  <Input name="time" type="time" defaultValue="09:00" required />
                </Field>
              </div>
              <Button type="submit">Assigner</Button>
            </form>
          )}
          <p className="mt-4 text-xs text-ccr-ink/50">
            Seules les personnes ayant un accès à l&rsquo;intranet apparaissent dans la liste.
          </p>
        </Card>
      </div>
    </>
  );
}
