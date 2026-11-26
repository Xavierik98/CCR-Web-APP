"use server";

import { prisma, type EventType } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

const ATTENDANCE_EDITORS = ["SUPER_ADMIN", "ADMIN", "SECRETARY", "ATTENDANCE_MANAGER"] as const;

export async function createEvent(formData: FormData) {
  await requireUser([...ATTENDANCE_EDITORS]);
  const title = String(formData.get("title") ?? "").trim() || "Rassemblement dominical";
  const day = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "10:30");
  if (!day) redirect("/presences?erreur=date");
  // Heure saisie à Casablanca (UTC+1).
  const startAt = new Date(`${day}T${time}:00+01:00`);
  const event = await prisma.serviceEvent.create({
    data: { title, startAt, type: (String(formData.get("type")) || "SERVICE") as EventType },
  });
  revalidatePath("/presences");
  redirect(`/presences/${event.id}`);
}

export async function saveAttendance(formData: FormData) {
  await requireUser([...ATTENDANCE_EDITORS]);
  const eventId = String(formData.get("eventId"));
  const present = formData.getAll("present").map(String);

  await prisma.$transaction([
    prisma.attendance.deleteMany({ where: { eventId, memberId: { notIn: present } } }),
    prisma.attendance.createMany({
      data: present.map((memberId) => ({ eventId, memberId, checkInMethod: "MANUAL" as const })),
      skipDuplicates: true,
    }),
  ]);
  revalidatePath(`/presences/${eventId}`);
  revalidatePath("/presences");
  redirect(`/presences/${eventId}?enregistre=1`);
}

export async function deleteEvent(formData: FormData) {
  await requireUser([...ATTENDANCE_EDITORS]);
  await prisma.serviceEvent.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/presences");
  redirect("/presences");
}
