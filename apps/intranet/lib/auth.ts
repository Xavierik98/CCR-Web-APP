import { prisma, type Role } from "@ccr/database";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "./supabase";

export type CurrentUser = { email: string; role: Role };

// Le compte Supabase prouve l'identité (lien de connexion par e-mail) ; la
// table User de l'intranet décide des droits. Un e-mail absent de cette table
// n'a accès à rien, même connecté.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email } });
  return user ? { email, role: user.role } : null;
});

export async function requireUser(allowed?: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?erreur=acces");
  if (allowed && !allowed.includes(user.role) && user.role !== "SUPER_ADMIN") {
    redirect("/tableau-de-bord?erreur=role");
  }
  return user;
}

// Rôles autorisés à modifier les données générales (membres, présences...).
export const EDITORS: Role[] = ["SUPER_ADMIN", "ADMIN", "SECRETARY"];
export const SOCIAL: Role[] = ["SUPER_ADMIN", "SOCIAL_SUPPORT"];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super administrateur",
  ADMIN: "Administrateur",
  DEPARTMENT_LEADER: "Responsable de département",
  GROUP_LEADER: "Responsable de groupe",
  SECRETARY: "Secrétariat",
  SOCIAL_SUPPORT: "Accompagnement social",
  ATTENDANCE_MANAGER: "Gestion des présences",
  READ_ONLY: "Lecture seule",
};
