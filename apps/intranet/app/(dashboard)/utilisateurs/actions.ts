"use server";

import { prisma, type Role } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccess, ROLE_LABELS } from "@/lib/auth";

function back(formData: FormData, fallback: string) {
  const to = String(formData.get("retour") ?? "");
  return to.startsWith("/") ? to : fallback;
}

// Attribue (ou change) le rôle d'une adresse. Réservé au super administrateur.
export async function saveUser(formData: FormData) {
  const me = await requireAccess("utilisateurs", "edit");
  const retour = back(formData, "/utilisateurs");
  const memberId = String(formData.get("memberId") ?? "") || null;
  let email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email && memberId) {
    const m = await prisma.member.findUnique({ where: { id: memberId }, select: { email: true } });
    email = m?.email?.trim().toLowerCase() ?? "";
  }
  const role = String(formData.get("role") ?? "READ_ONLY") as Role;
  const sep = retour.includes("?") ? "&" : "?";
  if (!email.includes("@") || !(role in ROLE_LABELS)) redirect(`${retour}${sep}erreur=email`);
  if (email === me.email && role !== "SUPER_ADMIN") redirect(`${retour}${sep}erreur=soi`);

  // Un même membre ne peut être lié qu'à un seul compte.
  if (memberId) await prisma.user.updateMany({ where: { memberId, NOT: { email } }, data: { memberId: null } });
  await prisma.user.upsert({
    where: { email },
    create: { email, role, memberId },
    update: { role, ...(memberId ? { memberId } : {}) },
  });
  revalidatePath("/utilisateurs");
  redirect(`${retour}${sep}enregistre=1`);
}

// Révoque tout accès à l'intranet pour cette adresse.
export async function deleteUser(formData: FormData) {
  const me = await requireAccess("utilisateurs", "edit");
  const retour = back(formData, "/utilisateurs");
  const email = String(formData.get("email"));
  const sep = retour.includes("?") ? "&" : "?";
  if (email === me.email) redirect(`${retour}${sep}erreur=soi`);
  await prisma.user.deleteMany({ where: { email } });
  revalidatePath("/utilisateurs");
  redirect(`${retour}${sep}revoque=1`);
}
