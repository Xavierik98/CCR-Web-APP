import { prisma, type NeedStatus } from "@ccr/database";
import type { CurrentUser } from "./auth";

export type NeedItem = { label: string; quantity: number; unit: string | null; unitPrice: number | null };

export const NEED_STATUS: Record<NeedStatus, { label: string; tone: "magenta" | "gold" | "blue" | "neutral" }> = {
  SUBMITTED: { label: "À valider", tone: "magenta" },
  APPROVED: { label: "Validé", tone: "blue" },
  PARTIAL: { label: "Validé en partie", tone: "gold" },
  REJECTED: { label: "Refusé", tone: "neutral" },
  DONE: { label: "Réalisé", tone: "blue" },
};

// Rôles qui voient et rédigent les états de besoin de tous les départements.
const ALL_DEPARTMENTS = ["SUPER_ADMIN", "PASTOR", "ADMIN", "SECRETARY", "TREASURER"];

// Départements pour lesquels la personne peut faire un état de besoin : tous
// pour l'administration, sinon ceux où sa fiche membre est inscrite.
export async function departmentsFor(user: CurrentUser) {
  if (ALL_DEPARTMENTS.includes(user.role)) {
    return prisma.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  }
  const row = await prisma.user.findUnique({ where: { id: user.id }, select: { memberId: true } });
  if (!row?.memberId) return [];
  return prisma.department.findMany({
    where: { memberships: { some: { memberId: row.memberId } } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export function readItems(raw: unknown): NeedItem[] {
  return Array.isArray(raw)
    ? raw
        .filter((i) => i && typeof i.label === "string")
        .map((i) => ({
          label: String(i.label),
          quantity: Number(i.quantity) || 1,
          unit: i.unit ? String(i.unit) : null,
          unitPrice: i.unitPrice === null || i.unitPrice === undefined || i.unitPrice === "" ? null : Number(i.unitPrice),
        }))
    : [];
}

export const mad = (n: number) => `${n.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} MAD`;
