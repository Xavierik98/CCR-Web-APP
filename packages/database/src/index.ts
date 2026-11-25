import { randomUUID } from "node:crypto";
import { CheckInMethod, MemberCategory, PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export * from "@prisma/client";

// Section "calcul automatique des présences" (décision du 26/11) : le nombre
// de présents n'est jamais stocké, toujours recompté à la demande à partir
// des lignes Attendance réellement créées pour cet événement.
export type AttendanceSummary = {
  eventId: string;
  total: number;
  byCategory: Record<MemberCategory, number>;
};

export async function getAttendanceSummary(
  eventId: string,
): Promise<AttendanceSummary> {
  const rows = await prisma.attendance.findMany({
    where: { eventId, present: true },
    select: { member: { select: { category: true } } },
  });

  const byCategory: Record<MemberCategory, number> = {
    MAN: 0,
    WOMAN: 0,
    CHILD: 0,
  };
  for (const row of rows) {
    byCategory[row.member.category] += 1;
  }

  return { eventId, total: rows.length, byCategory };
}

// Attribue un jeton de QR code stable au membre s'il n'en a pas déjà un :
// le même QR peut donc être imprimé une fois et réutilisé à chaque culte.
export async function ensureMemberQrToken(memberId: string): Promise<string> {
  const member = await prisma.member.findUniqueOrThrow({
    where: { id: memberId },
    select: { qrToken: true },
  });
  if (member.qrToken) return member.qrToken;

  const qrToken = randomUUID();
  await prisma.member.update({ where: { id: memberId }, data: { qrToken } });
  return qrToken;
}

export class InvalidQrTokenError extends Error {
  constructor() {
    super("QR code inconnu ou invalide.");
    this.name = "InvalidQrTokenError";
  }
}

// Point d'entrée de la validation par scan : le membre scanne son propre QR
// code, sa présence est enregistrée sans intervention d'un opérateur, et le
// compte de l'événement se met à jour automatiquement (prochain appel à
// getAttendanceSummary). Idempotent : un second scan le même jour ne crée pas
// de doublon grâce à la contrainte unique (memberId, eventId).
export async function checkInByQrToken(qrToken: string, eventId: string) {
  const member = await prisma.member.findUnique({ where: { qrToken } });
  if (!member) throw new InvalidQrTokenError();

  const attendance = await prisma.attendance.upsert({
    where: { memberId_eventId: { memberId: member.id, eventId } },
    create: {
      memberId: member.id,
      eventId,
      present: true,
      checkInMethod: CheckInMethod.QR_CODE,
    },
    update: { present: true, checkInMethod: CheckInMethod.QR_CODE },
  });

  return { member, attendance, summary: await getAttendanceSummary(eventId) };
}

// Message texte du rapport de présence (section "génère un rapport qui
// envoie le message") : mise en forme uniquement, indépendante du canal
// d'envoi (WhatsApp, e-mail...) choisi plus tard pour l'expédier réellement.
export function formatAttendanceReportMessage(
  eventTitle: string,
  eventDate: Date,
  summary: AttendanceSummary,
): string {
  const date = eventDate.toLocaleDateString("fr-FR");
  return [
    `Rapport de présence - ${eventTitle} (${date})`,
    `Total : ${summary.total} présents`,
    `Hommes : ${summary.byCategory.MAN}`,
    `Femmes : ${summary.byCategory.WOMAN}`,
    `Enfants : ${summary.byCategory.CHILD}`,
  ].join("\n");
}
