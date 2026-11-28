import { prisma, type Prisma, type StockMovementType } from "@ccr/database";

// Mouvement de stock : la quantité de l'article et le solde après mouvement
// sont mis à jour dans la même transaction, pour une traçabilité exacte.
export class StockError extends Error {}

export async function applyMovements(
  lines: { itemId: string; quantity: number }[],
  base: {
    type: StockMovementType;
    byEmail: string;
    note?: string | null;
    beneficiaryMemberId?: string | null;
    beneficiaryName?: string | null;
    requestId?: string | null;
    at?: Date;
  },
  extra?: (tx: Prisma.TransactionClient) => Promise<unknown>,
) {
  // Inventaire : la quantité saisie (zéro compris) devient le stock réel.
  const clean = lines.filter((l) => (base.type === "ADJUST" ? l.quantity >= 0 : l.quantity > 0));
  if (clean.length === 0) throw new StockError("Indiquez au moins une quantité.");
  await prisma.$transaction(async (tx) => {
    for (const line of clean) {
      const item = await tx.stockItem.findUniqueOrThrow({ where: { id: line.itemId } });
      const current = Number(item.quantity);
      const delta = base.type === "OUT" ? -line.quantity : line.quantity;
      const next = base.type === "ADJUST" ? line.quantity : current + delta;
      if (next < 0) throw new StockError(`Stock insuffisant pour ${item.name} : ${current} ${item.unit} disponible(s).`);
      await tx.stockItem.update({ where: { id: item.id }, data: { quantity: next } });
      await tx.stockMovement.create({
        data: {
          itemId: item.id,
          type: base.type,
          quantity: base.type === "ADJUST" ? next - current : line.quantity,
          balanceAfter: next,
          byEmail: base.byEmail,
          note: base.note ?? null,
          beneficiaryMemberId: base.beneficiaryMemberId ?? null,
          beneficiaryName: base.beneficiaryName ?? null,
          requestId: base.requestId ?? null,
          ...(base.at ? { at: base.at } : {}),
        },
      });
    }
    if (extra) await extra(tx);
  });
}

// Quantités saisies dans un formulaire : champs « qte_<idArticle> ».
export function readQuantities(formData: FormData) {
  const out: { itemId: string; quantity: number }[] = [];
  formData.forEach((value, key) => {
    if (!key.startsWith("qte_")) return;
    const n = Number(String(value).replace(",", "."));
    if (Number.isFinite(n) && n > 0) out.push({ itemId: key.slice(4), quantity: n });
  });
  return out;
}

export const qty = (v: unknown) => Number(v).toLocaleString("fr-FR", { maximumFractionDigits: 2 });

export const NEED_OPTIONS = ["Spaghetti", "Tomate (concentré)", "Semoule", "Farine", "Sucre", "Huile", "Riz", "Lait"];
