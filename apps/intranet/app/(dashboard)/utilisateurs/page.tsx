import { prisma, type Role } from "@ccr/database";
import Link from "next/link";
import { Button, ButtonLink, Card, Field, Input, Notice, PageHeader, Select, Table } from "@/components/ui";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, requireAccess } from "@/lib/auth";
import { formatDate, fullName } from "@/lib/labels";
import { deleteUser, saveLeaderAccess, saveUser } from "./actions";

// Rôle proposé selon la fonction du responsable (modifiable avant d'enregistrer).
function suggestedRole(functions: string[], deptRoles: string[], title: string | null): Role {
  const all = [...functions, ...deptRoles].join(" ").toLowerCase();
  if (all.includes("pasteur") || title === "Pasteur" || title === "Apôtre") return "PASTOR";
  if (all.includes("trésorerie") || all.includes("tresorerie")) return "TREASURER";
  if (all.includes("jeunesse")) return "YOUTH_LEADER";
  if (all.includes("social")) return "SOCIAL_SUPPORT";
  return "DEPARTMENT_LEADER";
}

// Module Utilisateurs et rôles (section 3) : le super administrateur donne,
// change ou révoque l'accès de chacun. Une adresse ajoutée ici peut ensuite
// recevoir son lien de connexion.
export default async function UtilisateursPage({
  searchParams,
}: {
  searchParams: Promise<{ enregistre?: string; revoque?: string; erreur?: string }>;
}) {
  const me = await requireAccess("utilisateurs");
  const { enregistre, revoque, erreur } = await searchParams;
  const [users, membersWithEmail, leaders] = await Promise.all([
    prisma.user.findMany({ orderBy: [{ role: "asc" }, { email: "asc" }], include: { member: true } }),
    prisma.member.findMany({
      where: { email: { not: null }, membershipStatus: "ACTIVE" },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
    // Responsables : fonction d'église de responsabilité, titre de pasteur,
    // ou responsable d'un département.
    prisma.member.findMany({
      where: {
        membershipStatus: "ACTIVE",
        OR: [
          { title: { in: ["Pasteur", "Apôtre"] } },
          { functions: { hasSome: ["Pasteur principal", "Assistant pasteur", "Responsable de la jeunesse", "Responsable de la trésorerie", "Responsable de département", "Responsable des chantres (Glad)"] } },
          { memberships: { some: { role: { startsWith: "Responsable", mode: "insensitive" } } } },
        ],
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: { user: true, memberships: { include: { department: { select: { name: true } } } } },
    }),
  ]);
  const sansEmail = leaders.filter((l) => !l.email && !l.user).length;
  const withAccess = new Set(users.map((u) => u.email));
  const candidates = membersWithEmail.filter((m) => m.email && !withAccess.has(m.email.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Utilisateurs et rôles"
        subtitle="Seul le super administrateur attribue et révoque les accès."
        action={<ButtonLink href="/utilisateurs/connexions">Journal des connexions</ButtonLink>}
      />
      {enregistre ? <Notice>Accès enregistré.</Notice> : null}
      {revoque ? <Notice>Accès révoqué.</Notice> : null}
      {erreur === "email" ? <Notice tone="magenta">Adresse e-mail ou rôle invalide.</Notice> : null}
      {erreur === "pris" ? <Notice tone="magenta">Cette adresse est déjà liée au compte d&rsquo;une autre personne.</Notice> : null}
      {erreur === "soi" ? <Notice tone="magenta">Vous ne pouvez pas retirer votre propre accès de super administrateur.</Notice> : null}

      <section id="responsables" className="mb-8 scroll-mt-6">
        <h2 className="font-display text-xl font-bold">Responsables : e-mail et accès</h2>
        <p className="mt-1 text-sm text-ccr-ink/60">
          Chaque responsable reçoit un e-mail et un accès avec le rôle de sa fonction. {sansEmail ? `${sansEmail} responsable(s) sans e-mail pour l'instant.` : "Tous les responsables ont un e-mail."}
        </p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-ccr-ink/[0.06] bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-ccr-ink/50">
              <tr>
                <th className="px-4 py-3">Responsable</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Accès</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ccr-ink/5">
              {leaders.map((l) => {
                const depts = l.memberships.filter((m) => m.role?.toLowerCase().startsWith("responsable"));
                const formId = `resp-${l.id}`;
                return (
                  <tr key={l.id} className={!l.email && !l.user ? "bg-ccr-magenta/[0.03]" : ""}>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{fullName(l)}</p>
                      <p className="text-xs text-ccr-ink/50">
                        {[...l.functions, ...depts.map((d) => `${d.role} (${d.department.name})`)].join(", ") || l.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <form id={formId} action={saveLeaderAccess}>
                        <input type="hidden" name="memberId" value={l.id} />
                      </form>
                      <Input form={formId} name="email" type="email" defaultValue={l.user?.email ?? l.email ?? ""} placeholder="adresse@exemple.com" className="mt-0 min-w-[220px]" required />
                    </td>
                    <td className="px-4 py-3">
                      <Select form={formId} name="role" defaultValue={l.user?.role ?? suggestedRole(l.functions, depts.map((d) => d.role ?? ""), l.title)} options={ROLE_LABELS} className="mt-0" />
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {l.user ? <span className="font-semibold text-emerald-700">Compte ouvert</span> : <span className="text-ccr-magenta">Pas encore de compte</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Button form={formId} type="submit" variant="secondary">{l.user ? "Mettre à jour" : "Ouvrir l'accès"}</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Table head={["Personne", "Rôle", "Dernière activité", ""]}>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3">
                <p className="font-semibold">{u.member ? fullName(u.member) : u.email}</p>
                {u.member ? <p className="text-xs text-ccr-ink/50">{u.email}</p> : null}
              </td>
              <td className="px-4 py-3">
                <form action={saveUser} className="flex gap-2">
                  <input type="hidden" name="email" value={u.email} />
                  <Select name="role" defaultValue={u.role} options={ROLE_LABELS} className="mt-0" />
                  <Button type="submit" variant="secondary">OK</Button>
                </form>
              </td>
              <td className="px-4 py-3 text-ccr-ink/70">
                {u.lastSeenAt ?? u.lastLoginAt
                  ? (u.lastSeenAt ?? u.lastLoginAt)!.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Casablanca" })
                  : "Pas encore d'activité"}
              </td>
              <td className="px-4 py-3">
                {u.email !== me.email ? (
                  <form action={deleteUser}>
                    <input type="hidden" name="email" value={u.email} />
                    <button type="submit" className="text-xs font-semibold text-ccr-magenta hover:underline">
                      Révoquer
                    </button>
                  </form>
                ) : null}
              </td>
            </tr>
          ))}
        </Table>

        <div className="space-y-6">
          <Card>
            <h2 className="font-display text-lg font-bold">Donner un accès à un membre</h2>
            <p className="mt-1 text-xs text-ccr-ink/50">
              Membres actifs ayant un e-mail et pas encore d&rsquo;accès.
            </p>
            <form action={saveUser} className="mt-4 space-y-4">
              <Select name="memberId" empty="Choisir un membre…" options={candidates.map((m) => [m.id, fullName(m)])} required />
              <Select name="role" defaultValue="READ_ONLY" options={ROLE_LABELS} />
              <Button type="submit">Attribuer</Button>
            </form>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-bold">Ou par adresse e-mail</h2>
            <form action={saveUser} className="mt-4 space-y-4">
              <Field label="Adresse e-mail">
                <Input name="email" type="email" required />
              </Field>
              <Field label="Rôle">
                <Select name="role" defaultValue="READ_ONLY" options={ROLE_LABELS} />
              </Field>
              <Button type="submit">Ajouter</Button>
            </form>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-bold">Ce que permet chaque rôle</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <div key={r}>
                  <dt className="font-semibold">{ROLE_LABELS[r]}</dt>
                  <dd className="text-ccr-ink/60">{ROLE_DESCRIPTIONS[r]}</dd>
                </div>
              ))}
            </dl>
            <Link href="/membres" className="mt-4 inline-block text-sm font-semibold text-ccr-magenta hover:underline">
              Un rôle se donne aussi depuis la fiche d&rsquo;un membre &rarr;
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}
