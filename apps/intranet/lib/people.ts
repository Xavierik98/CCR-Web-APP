import { prisma } from "@ccr/database";

const SPECIAL: Record<string, string> = {
  import: "Import initial",
  systeme: "Automatique (intranet)",
  "formulaire du site": "Formulaire du site",
};

// Noms lisibles pour des auteurs enregistrés par e-mail ou par identifiant
// d'utilisateur : fiche membre liée (ou de même e-mail), sinon l'e-mail.
export async function peopleNames(keys: (string | null | undefined)[]) {
  const wanted = [...new Set(keys.filter((k): k is string => !!k && !SPECIAL[k]))];
  const users = wanted.length
    ? await prisma.user.findMany({
        where: { OR: [{ id: { in: wanted } }, { email: { in: wanted, mode: "insensitive" } }] },
        select: { id: true, email: true, member: { select: { firstName: true, lastName: true, title: true } } },
      })
    : [];
  const emails = users.filter((u) => !u.member).map((u) => u.email);
  const byEmail = emails.length
    ? await prisma.member.findMany({ where: { email: { in: emails, mode: "insensitive" } }, select: { email: true, firstName: true, lastName: true, title: true } })
    : [];
  const map = new Map<string, string>();
  for (const u of users) {
    const m = u.member ?? byEmail.find((x) => x.email?.toLowerCase() === u.email.toLowerCase());
    const name = m ? [m.title, m.firstName, m.lastName].filter(Boolean).join(" ") : u.email;
    map.set(u.id, name);
    map.set(u.email.toLowerCase(), name);
  }
  return (key: string | null | undefined) => (key ? SPECIAL[key] ?? map.get(key) ?? map.get(key.toLowerCase()) ?? key : "Inconnu");
}

// Historique des actualités (créée, modifiée, publiée, retirée, supprimée).
export async function logContent(contentId: string, title: string, action: string, byEmail: string) {
  try {
    await prisma.contentEvent.create({ data: { contentId, title: title.slice(0, 200), action, byEmail } });
  } catch (error) {
    console.error("Historique des actualités : écriture impossible", error);
  }
}
