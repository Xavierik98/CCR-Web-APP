import { prisma, type Role } from "@ccr/database";
import Link from "next/link";
import { Button, ButtonLink, Card, Field, Input, Notice, PageHeader, Select, Table } from "@/components/ui";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, requireAccess } from "@/lib/auth";
import { formatDate, fullName } from "@/lib/labels";
import { deleteUser, saveUser } from "./actions";

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
  const [users, membersWithEmail] = await Promise.all([
    prisma.user.findMany({ orderBy: [{ role: "asc" }, { email: "asc" }], include: { member: true } }),
    prisma.member.findMany({
      where: { email: { not: null }, membershipStatus: "ACTIVE" },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
  ]);
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
      {erreur === "soi" ? <Notice tone="magenta">Vous ne pouvez pas retirer votre propre accès de super administrateur.</Notice> : null}

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
