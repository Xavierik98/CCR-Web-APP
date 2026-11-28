"use server";

import { prisma, type EventType } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { eventReport } from "@/lib/pastor-report";
import { casablancaToUtc, isSunday } from "@/lib/programme";
import { sendWhatsApp } from "@/lib/whatsapp";

// Date (AAAA-MM-JJ) d'un culte à Casablanca.
function dayOf(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: "Africa/Casablanca" });
}

// Ouvre le pointage d'un dimanche : réutilise le culte de ce jour s'il existe,
// sinon le crée (Rassemblement dominical, 10h30). Les dates ne sont donc plus
// saisies à la main.
export async function openSunday(formData: FormData) {
  await requireAccess("presences", "edit");
  const day = String(formData.get("day") ?? "");
  if (!isSunday(day)) redirect("/presences?erreur=dimanche");

  const around = await prisma.serviceEvent.findMany({
    where: {
      type: "SERVICE",
      startAt: { gte: new Date(`${day}T00:00:00Z`), lt: new Date(new Date(`${day}T00:00:00Z`).getTime() + 2 * 86400000) },
    },
  });
  const existing = around.find((e) => dayOf(e.startAt) === day);
  const event =
    existing ??
    (await prisma.serviceEvent.create({
      data: { title: "Rassemblement dominical", type: "SERVICE", startAt: casablancaToUtc(day, "10:30") },
    }));
  revalidatePath("/presences");
  redirect(`/presences/${event.id}`);
}

// Culte ou événement exceptionnel, en dehors du dimanche.
export async function createEvent(formData: FormData) {
  await requireAccess("presences", "edit");
  const title = String(formData.get("title") ?? "").trim() || "Culte exceptionnel";
  const day = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "19:30");
  if (!day) redirect("/presences?erreur=date");
  const event = await prisma.serviceEvent.create({
    data: { title, startAt: casablancaToUtc(day, time), type: (String(formData.get("type")) || "OTHER") as EventType },
  });
  revalidatePath("/presences");
  redirect(`/presences/${event.id}`);
}

// Pointage case par case : chaque clic est enregistré tout de suite.
export async function setAttendance(eventId: string, memberId: string, present: boolean) {
  await requireAccess("presences", "edit");
  if (present) {
    await prisma.attendance.upsert({
      where: { memberId_eventId: { memberId, eventId } },
      create: { eventId, memberId, checkInMethod: "MANUAL" },
      update: { present: true },
    });
  } else {
    await prisma.attendance.deleteMany({ where: { eventId, memberId } });
  }
  revalidatePath("/presences");
  revalidatePath("/tableau-de-bord");
  return { ok: true };
}

export async function deleteEvent(formData: FormData) {
  await requireAccess("presences", "edit");
  await prisma.serviceEvent.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/presences");
  redirect("/presences");
}

// Nombre de personnes qui ont suivi le culte en ligne.
export async function setOnlineCount(formData: FormData) {
  await requireAccess("presences", "edit");
  const id = String(formData.get("eventId"));
  const raw = String(formData.get("onlineCount") ?? "").trim();
  const n = raw === "" ? null : Math.max(0, Math.floor(Number(raw)));
  await prisma.serviceEvent.update({ where: { id }, data: { onlineCount: Number.isFinite(n as number) ? n : null } });
  revalidatePath(`/presences/${id}`);
  redirect(`/presences/${id}?enligne=1`);
}

// Envoi immédiat du rapport au pasteur par le service WhatsApp configuré.
export async function sendPastorReportNow(formData: FormData) {
  await requireAccess("presences", "edit");
  const id = String(formData.get("eventId"));
  const report = await eventReport(id);
  if (!report) redirect("/presences");
  const result = await sendWhatsApp("pasteur", report.text);
  if (result.ok) await prisma.serviceEvent.update({ where: { id }, data: { attendanceReportSentAt: new Date() } });
  revalidatePath(`/presences/${id}`);
  redirect(`/presences/${id}?rapport=${result.ok ? "envoye" : "echec"}`);
}

// Rapport envoyé à la main (bouton qui ouvre WhatsApp) : on le note.
export async function markReportSent(eventId: string) {
  await requireAccess("presences", "edit");
  await prisma.serviceEvent.update({ where: { id: eventId }, data: { attendanceReportSentAt: new Date() } });
  revalidatePath(`/presences/${eventId}`);
}
