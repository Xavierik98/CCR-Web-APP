import { prisma, type Member } from "@ccr/database";

// Fonctions dans l'église proposées par défaut (une personne peut en avoir
// plusieurs ; "Autre" permet d'en saisir une libre).
export const CHURCH_FUNCTIONS = [
  "Pasteur principal",
  "Assistant pasteur",
  "Ancien",
  "Diacre",
  "Diaconesse",
  "Responsable de département",
  "Responsable des chantres (Glad)",
  "Chantre (Glad)",
  "Musicien",
  "Intercesseur",
  "Protocole",
  "Accueil",
  "Responsable de groupe de maison",
  "Moniteur Ecodim",
  "Membre",
];

export function normalizePhone(raw: string | null | undefined) {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("2120") && digits.length === 13) return digits.slice(4);
  if (digits.startsWith("00212") && digits.length === 14) return digits.slice(5);
  if (digits.startsWith("212") && digits.length === 12) return digits.slice(3);
  if (digits.length === 10 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

const TITLES = new Set(["ancien", "maman", "papa", "respo", "pasteur", "pp", "diaco", "mme", "mr", "couple", "frere", "soeur"]);

function nameTokens(first: string, last: string) {
  return new Set(
    `${first} ${last}`
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3 && !TITLES.has(w)),
  );
}

// Fiches qui désignent probablement la même personne : même téléphone, ou
// noms qui se recoupent (tous les mots de l'un présents dans l'autre).
export async function findDuplicates(
  person: { firstName: string; lastName: string; phone?: string | null; email?: string | null },
  excludeId?: string,
  limit = 5,
) {
  const phone = normalizePhone(person.phone);
  const email = person.email?.trim().toLowerCase() || null;
  const tokens = nameTokens(person.firstName, person.lastName);
  const candidates = await prisma.member.findMany({
    where: excludeId ? { NOT: { id: excludeId } } : {},
    select: { id: true, firstName: true, lastName: true, phone: true, email: true, category: true, membershipStatus: true },
  });
  const scored = candidates
    .map((m) => {
      let score = 0;
      if (phone && normalizePhone(m.phone) === phone) score += 10;
      if (email && m.email?.toLowerCase() === email) score += 10;
      const other = nameTokens(m.firstName, m.lastName);
      const common = [...tokens].filter((t) => other.has(t)).length;
      if (common > 0 && tokens.size > 0 && other.size > 0) {
        if (common === Math.min(tokens.size, other.size)) score += common >= 2 ? 6 : 3;
        else score += common;
      }
      return { member: m, score };
    })
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

const FILLABLE: (keyof Member)[] = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "neighborhood",
  "category",
  "birthDate",
  "professionalStatus",
  "groupId",
  "departedAt",
  "departureReason",
];

// Fusionne `removeId` dans `keepId` puis supprime `removeId`. La fiche gardée
// est prioritaire ; ses champs vides sont complétés par l'autre. Présences,
// départements, engagements, dossier social, accès et fiches soumises sont
// rattachés à la fiche gardée : rien n'est perdu.
export async function mergeMembers(keepId: string, removeId: string) {
  if (keepId === removeId) throw new Error("Une fiche ne peut pas être fusionnée avec elle-même.");

  await prisma.$transaction(async (tx) => {
    const [keep, remove] = await Promise.all([
      tx.member.findUniqueOrThrow({ where: { id: keepId }, include: { socialSupport: true, user: true, ledGroup: true } }),
      tx.member.findUniqueOrThrow({ where: { id: removeId }, include: { socialSupport: true, user: true, ledGroup: true } }),
    ]);

    const data: Record<string, unknown> = {};
    for (const key of FILLABLE) {
      const k = keep[key];
      if ((k === null || k === "") && remove[key] !== null && remove[key] !== "") data[key] = remove[key];
    }
    data.functions = [...new Set([...keep.functions, ...remove.functions])];
    const notes = [keep.notes, remove.notes ? `Fusionné avec la fiche « ${remove.firstName} ${remove.lastName} » :\n${remove.notes}` : null]
      .filter(Boolean)
      .join("\n\n");
    data.notes = notes || null;
    if (keep.membershipStatus !== "ACTIVE" && remove.membershipStatus === "ACTIVE") data.membershipStatus = "ACTIVE";

    // Le jeton QR est unique : on libère celui de la fiche supprimée d'abord.
    const qrToken = keep.qrToken ?? remove.qrToken;
    if (remove.qrToken) await tx.member.update({ where: { id: removeId }, data: { qrToken: null } });

    // Présences : on garde une seule ligne par culte.
    const keptEvents = new Set(
      (await tx.attendance.findMany({ where: { memberId: keepId }, select: { eventId: true } })).map((a) => a.eventId),
    );
    await tx.attendance.updateMany({
      where: { memberId: removeId, eventId: { notIn: [...keptEvents] } },
      data: { memberId: keepId },
    });

    // Départements : la fonction de la fiche gardée prime, sinon celle de l'autre.
    const keptMemberships = await tx.departmentMembership.findMany({ where: { memberId: keepId } });
    for (const ms of await tx.departmentMembership.findMany({ where: { memberId: removeId } })) {
      const existing = keptMemberships.find((k) => k.departmentId === ms.departmentId);
      if (!existing) await tx.departmentMembership.update({ where: { id: ms.id }, data: { memberId: keepId } });
      else if (!existing.role && ms.role) await tx.departmentMembership.update({ where: { id: existing.id }, data: { role: ms.role } });
    }

    await tx.pledge.updateMany({ where: { memberId: removeId }, data: { memberId: keepId } });
    await tx.memberSubmission.updateMany({ where: { memberId: removeId }, data: { memberId: keepId } });

    if (remove.socialSupport) {
      if (!keep.socialSupport) {
        await tx.socialSupportRecord.update({ where: { memberId: removeId }, data: { memberId: keepId } });
      } else {
        const s = remove.socialSupport;
        const k = keep.socialSupport;
        await tx.socialSupportRecord.update({
          where: { memberId: keepId },
          data: {
            documentNumber: k.documentNumber ?? s.documentNumber,
            hasRenewalDocuments: k.hasRenewalDocuments ?? s.hasRenewalDocuments,
            renewalDifficulty: k.renewalDifficulty ?? s.renewalDifficulty,
          },
        });
      }
    }

    if (remove.user && !keep.user) await tx.user.update({ where: { id: remove.user.id }, data: { memberId: keepId } });
    if (remove.ledGroup) {
      await tx.group.update({
        where: { id: remove.ledGroup.id },
        data: { leaderMemberId: keep.ledGroup ? null : keepId },
      });
    }

    await tx.member.update({ where: { id: keepId }, data: { ...data, qrToken } });
    await tx.member.delete({ where: { id: removeId } });
  });
}
