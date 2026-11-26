import { prisma, type Role } from "@ccr/database";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "./supabase";

export type CurrentUser = { id: string; email: string; role: Role };

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
  return user ? { id: user.id, email, role: user.role } : null;
});

export type Module =
  | "membres"
  | "presences"
  | "departements"
  | "collecte"
  | "social"
  | "actualites"
  | "fiches"
  | "taches"
  | "utilisateurs";

type Level = "view" | "edit";
const ALL: Module[] = ["membres", "presences", "departements", "collecte", "social", "actualites", "fiches", "taches", "utilisateurs"];

function grant(edit: Module[], view: Module[] = []): Partial<Record<Module, Level>> {
  const out: Partial<Record<Module, Level>> = {};
  for (const m of view) out[m] = "view";
  for (const m of edit) out[m] = "edit";
  return out;
}

// Qui peut consulter ou modifier quoi (décisions du 26/11) :
// - le pasteur voit tout et peut tout modifier, sauf les accès ;
// - seuls trésoriers, pasteur et super administrateur voient les finances ;
// - la communication ne fait que valider présences et absences ;
// - chacun voit les tâches qui lui sont assignées (Mes tâches), seuls les
//   rôles avec "taches" en écriture en attribuent.
const MATRIX: Record<Role, Partial<Record<Module, Level>>> = {
  SUPER_ADMIN: grant(ALL),
  PASTOR: grant(ALL.filter((m) => m !== "utilisateurs")),
  ADMIN: grant(["membres", "presences", "departements", "actualites", "fiches", "taches"]),
  SECRETARY: grant(["membres", "presences", "departements", "actualites", "fiches", "taches"]),
  TREASURER: grant(["collecte"], ["membres"]),
  COMMUNICATION: grant(["presences"]),
  ATTENDANCE_MANAGER: grant(["presences"]),
  SOCIAL_SUPPORT: grant(["social"], ["membres"]),
  DEPARTMENT_LEADER: grant([], ["membres", "presences", "departements"]),
  GROUP_LEADER: grant([], ["membres", "presences", "departements"]),
  READ_ONLY: grant([], ["membres", "presences", "departements", "actualites"]),
};

export function canView(role: Role, module: Module) {
  return MATRIX[role][module] !== undefined;
}

export function canEdit(role: Role, module: Module) {
  return MATRIX[role][module] === "edit";
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?erreur=acces");
  return user;
}

// À appeler en tête de chaque page (level "view") et de chaque action
// serveur qui modifie des données (level "edit").
export async function requireAccess(module: Module, level: Level = "view"): Promise<CurrentUser> {
  const user = await requireUser();
  const ok = level === "edit" ? canEdit(user.role, module) : canView(user.role, module);
  if (!ok) redirect("/tableau-de-bord?erreur=role");
  return user;
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super administrateur",
  PASTOR: "Pasteur",
  TREASURER: "Trésorier",
  COMMUNICATION: "Communication (présences)",
  ADMIN: "Administrateur",
  SECRETARY: "Secrétariat",
  DEPARTMENT_LEADER: "Responsable de département",
  GROUP_LEADER: "Responsable de groupe",
  SOCIAL_SUPPORT: "Accompagnement social",
  ATTENDANCE_MANAGER: "Gestion des présences",
  READ_ONLY: "Lecture seule",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  SUPER_ADMIN: "Tout, y compris l'attribution des rôles.",
  PASTOR: "Voit et modifie tout, sauf les accès.",
  TREASURER: "Collecte et engagements ; consulte les membres.",
  COMMUNICATION: "Valide les présences et absences, rien d'autre.",
  ADMIN: "Membres, présences, départements, actualités, fiches, tâches.",
  SECRETARY: "Membres, présences, départements, actualités, fiches, tâches.",
  DEPARTMENT_LEADER: "Consultation des membres, présences et départements.",
  GROUP_LEADER: "Consultation des membres, présences et départements.",
  SOCIAL_SUPPORT: "Dossiers de titre de séjour ; consulte les membres.",
  ATTENDANCE_MANAGER: "Valide les présences et absences, rien d'autre.",
  READ_ONLY: "Consultation seule.",
};
