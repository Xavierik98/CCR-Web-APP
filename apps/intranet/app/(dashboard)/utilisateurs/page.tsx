import { prisma } from "@ccr/database";
import { Button, Card, Field, Input, Notice, PageHeader, Select, Table } from "@/components/ui";
import { ROLE_LABELS, requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/labels";
import { deleteUser, saveUser } from "./actions";

// Module Utilisateurs et rôles (section 3) : qui a accès à l'intranet, avec
// quel rôle. Une adresse ajoutée ici peut ensuite recevoir son lien de connexion.
export default async function UtilisateursPage({
  searchParams,
}: {
  searchParams: Promise<{ enregistre?: string; erreur?: string }>;
}) {
  const me = await requireUser(["SUPER_ADMIN"]);
  const { enregistre, erreur } = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { email: "asc" } });

  return (
    <>
      <PageHeader title="Utilisateurs et rôles" />
      {enregistre ? <Notice>Accès enregistré.</Notice> : null}
      {erreur === "email" ? <Notice tone="magenta">Adresse e-mail invalide.</Notice> : null}
      {erreur === "soi" ? <Notice tone="magenta">Vous ne pouvez pas retirer votre propre accès.</Notice> : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Table head={["E-mail", "Rôle", "Ajouté le", ""]}>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3 font-semibold">{u.email}</td>
              <td className="px-4 py-3">
                <form action={saveUser} className="flex gap-2">
                  <input type="hidden" name="email" value={u.email} />
                  <Select name="role" defaultValue={u.role} options={ROLE_LABELS} className="mt-0" />
                  <Button type="submit" variant="secondary">OK</Button>
                </form>
              </td>
              <td className="px-4 py-3 text-ccr-ink/70">{formatDate(u.createdAt)}</td>
              <td className="px-4 py-3">
                {u.email !== me.email ? (
                  <form action={deleteUser}>
                    <input type="hidden" name="email" value={u.email} />
                    <button type="submit" className="text-xs font-semibold text-ccr-magenta hover:underline">
                      Retirer l&rsquo;accès
                    </button>
                  </form>
                ) : null}
              </td>
            </tr>
          ))}
        </Table>

        <Card>
          <h2 className="font-display text-lg font-bold">Donner un accès</h2>
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
      </div>
    </>
  );
}
