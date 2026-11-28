"use server";

import { prisma, type NeedStatus } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canEdit, requireAccess } from "@/lib/auth";
import { departmentsFor, readItems } from "@/lib/needs";

function text(formData: FormData, key: string, max = 500) {
  const v = String(formData.get(key) ?? "").trim().slice(0, max);
  return v === "" ? null : v;
}

function refresh() {
  revalidatePath("/besoins");
  revalidatePath("/tableau-de-bord");
}

// Nouvel état de besoin (ou modification tant qu'il n'est pas traité).
export async function saveNeed(formData: FormData) {
  const user = await requireAccess("besoins");
  const id = text(formData, "id");
  const departmentId = text(formData, "departmentId");
  const allowed = await departmentsFor(user);
  if (!departmentId || !allowed.some((d) => d.id === departmentId)) redirect("/besoins/nouveau?erreur=departement");
  const title = text(formData, "title", 120);
  let items = [] as ReturnType<typeof readItems>;
  try {
    items = readItems(JSON.parse(String(formData.get("items") ?? "[]")));
  } catch {
    items = [];
  }
  if (!title || items.length === 0) redirect(`/besoins/${id ?? "nouveau"}${id ? "?modifier=1&" : "?"}erreur=contenu&departement=${departmentId}`);
  const priced = items.filter((i) => i.unitPrice !== null);
  const total = priced.length ? priced.reduce((s, i) => s + i.quantity * (i.unitPrice ?? 0), 0) : null;
  const day = text(formData, "neededBy", 10);
  const data = {
    departmentId: departmentId!,
    title: title!,
    purpose: text(formData, "purpose", 2000),
    items: items.slice(0, 60),
    total,
    urgent: formData.get("urgent") === "on",
    neededBy: day && /^\d{4}-\d{2}-\d{2}$/.test(day) ? new Date(`${day}T00:00:00Z`) : null,
  };
  if (id) {
    const existing = await prisma.needsStatement.findUniqueOrThrow({ where: { id } });
    if (existing.status !== "SUBMITTED" || (existing.createdBy !== user.email && !canEdit(user.role, "besoins"))) redirect(`/besoins/${id}?erreur=verrouille`);
    await prisma.needsStatement.update({ where: { id }, data });
    refresh();
    redirect(`/besoins/${id}?enregistre=1`);
  }
  const created = await prisma.needsStatement.create({ data: { ...data, createdBy: user.email } });
  refresh();
  redirect(`/besoins/${created.id}?envoye=1`);
}

// Décision du pasteur, de la trésorerie ou du super administrateur.
export async function decideNeed(status: NeedStatus, formData: FormData) {
  const user = await requireAccess("besoins", "edit");
  const id = String(formData.get("id"));
  const note = text(formData, "decisionNote", 1000);
  if (status === "REJECTED" && !note) redirect(`/besoins/${id}?erreur=motif`);
  await prisma.needsStatement.update({
    where: { id },
    data: { status, decisionNote: note, decidedBy: user.email, decidedAt: new Date() },
  });
  refresh();
  redirect(`/besoins/${id}?decision=1`);
}

export async function deleteNeed(formData: FormData) {
  const user = await requireAccess("besoins");
  const id = String(formData.get("id"));
  const n = await prisma.needsStatement.findUniqueOrThrow({ where: { id } });
  if (!canEdit(user.role, "besoins") && !(n.createdBy === user.email && n.status === "SUBMITTED")) redirect(`/besoins/${id}?erreur=verrouille`);
  await prisma.needsStatement.delete({ where: { id } });
  refresh();
  redirect("/besoins?supprime=1");
}
