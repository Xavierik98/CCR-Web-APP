import type {
  ContentStatus,
  MemberCategory,
  MembershipStatus,
  ProfessionalStatus,
  ResidencyStatus,
} from "@ccr/database";

export const CATEGORY_LABELS: Record<MemberCategory, string> = {
  MAN: "Homme",
  WOMAN: "Femme",
  CHILD: "Enfant",
};

export const STATUS_LABELS: Record<MembershipStatus, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  DEPARTED: "Parti",
};

export const PROFESSIONAL_LABELS: Record<ProfessionalStatus, string> = {
  EMPLOYEE: "Salarié",
  ENTREPRENEUR: "Entrepreneur",
  STUDENT: "Étudiant",
  UNEMPLOYED: "Sans emploi",
  OTHER: "Autre",
};

export const RESIDENCY_LABELS: Record<ResidencyStatus, string> = {
  VALID: "Titre valide",
  EXPIRED: "Titre expiré",
  NEVER_HAD: "Jamais eu de titre",
};

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: "Brouillon",
  PENDING_REVIEW: "En attente",
  APPROVED: "Validé",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

// Nom affiché : titre d'usage (s'il est connu), prénom, nom.
export function fullName(m: { firstName: string; lastName: string; title?: string | null }) {
  return [m.title, m.firstName, m.lastName].filter(Boolean).join(" ");
}

export const TITLES = ["Pasteur", "Apôtre", "Ancien", "Diacre", "Diaconesse", "Maman", "Papa", "Mme", "M.", "Frère", "Sœur"];

export function formatDate(d: Date | null | undefined) {
  return d
    ? d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", timeZone: "Africa/Casablanca" })
    : "";
}

// Valeur pour un <input type="date"> (AAAA-MM-JJ), sans décalage de fuseau.
export function toDateInput(d: Date | null | undefined) {
  return d ? d.toISOString().slice(0, 10) : "";
}
