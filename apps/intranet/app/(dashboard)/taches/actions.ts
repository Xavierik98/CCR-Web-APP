"use server";

import { prisma } from "@ccr/database";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canEdit, requireAccess, requireUser } from "@/lib/auth";
import { casablancaToUtc } from "@/lib/programme";

function text(formData: FormData, key: string, max = 500) {
  const v = String(formData.get(key) ?? "").trim().slice(0, max);
  return v === "" ? null : v;
}

function refresh() {
  revalidatePath("/taches");
  revalidatePath("/mes-taches");
  revalidatePath("/tableau-de-bord");
}

export async function createTask(formData: FormData) {
  const user = await requireAccess("taches", "edit");
  const title = text(formData, "title", 160);
  const assigneeId = text(formData, "assigneeId");
  const day = text(formData, "date", 10);
  const time = text(formData, "time", 5) ?? "09:00";
  if (!title || !assigneeId || !day || !/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^\d{2}:\d{2}$/.test(time)) {
    redirect("/taches?erreur=champs");
  }
  // Heure saisie à Casablanca, convertie selon le fuseau en vigueur ce jour-là.
  await prisma.task.create({
    data: {
      title,
      description: text(formData, "description", 2000),
      dueAt: casablancaToUtc(day, time),
      assigneeId,
      createdById: user.id,
    },
  });
  refresh();
  redirect("/taches?cree=1");
}

// La personne assignée, ou un rôle qui attribue les tâches, peut cocher
// « fait » ou la rouvrir.
export async function toggleTask(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const back = String(formData.get("retour") ?? "/mes-taches");
  const task = await prisma.task.findUniqueOrThrow({ where: { id } });
  if (task.assigneeId !== user.id && !canEdit(user.role, "taches")) redirect("/tableau-de-bord?erreur=role");
  await prisma.task.update({ where: { id }, data: { doneAt: task.doneAt ? null : new Date() } });
  refresh();
  redirect(back.startsWith("/") ? back : "/mes-taches");
}

export async function deleteTask(formData: FormData) {
  await requireAccess("taches", "edit");
  await prisma.task.delete({ where: { id: String(formData.get("id")) } });
  refresh();
  redirect("/taches?supprime=1");
}

// Crée (ou renouvelle) le lien secret d'abonnement à l'agenda personnel.
export async function renewCalendarToken() {
  const user = await requireUser();
  await prisma.user.update({ where: { id: user.id }, data: { calendarToken: randomBytes(24).toString("base64url") } });
  revalidatePath("/mes-taches");
  redirect("/mes-taches?agenda=1");
}
