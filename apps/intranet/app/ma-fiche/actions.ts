"use server";

import { prisma, type MemberCategory, type ProfessionalStatus } from "@ccr/database";
import { redirect } from "next/navigation";
import { checkField } from "@ccr/ui/src/validation";
import { normalizePhone } from "@/lib/members";

function text(formData: FormData, key: string, max = 200) {
  const v = String(formData.get(key) ?? "").trim().slice(0, max);
  return v === "" ? null : v;
}

const CATEGORIES = ["MAN", "WOMAN", "CHILD"];
const PRO = ["EMPLOYEE", "ENTREPRENEUR", "STUDENT", "UNEMPLOYED", "OTHER"];

// Formulaire public : la fiche est seulement mise en file d'attente, jamais
// écrite dans la table des membres. Un administrateur la valide ensuite.
export async function submitFiche(formData: FormData) {
  // Champ piège invisible : rempli seulement par les robots.
  if (text(formData, "site_web")) redirect("/ma-fiche?merci=1");
  if (formData.get("consentement") !== "on") redirect("/ma-fiche?erreur=consentement");

  const firstName = text(formData, "firstName", 80);
  const lastName = text(formData, "lastName", 80);
  const rawPhone = text(formData, "phone", 30);
  const email = text(formData, "email", 120)?.toLowerCase() ?? null;
  if (!firstName || !lastName || checkField("name", lastName) || checkField("name", firstName)) redirect("/ma-fiche?erreur=nom");
  if (!rawPhone || checkField("phone", rawPhone)) redirect("/ma-fiche?erreur=telephone");
  if (!email || checkField("email", email)) redirect("/ma-fiche?erreur=email");

  const category = text(formData, "category");
  const pro = text(formData, "professionalStatus");
  const birth = text(formData, "birthDate", 10);
  // Une seule fonction et un seul département, choisis dans des listes.
  const fn = text(formData, "function", 60);
  const functions = fn ? [fn] : [];

  const knownDepartments = new Set((await prisma.department.findMany({ select: { id: true } })).map((d) => d.id));
  const departmentId = text(formData, "departmentId");
  const departments =
    departmentId && knownDepartments.has(departmentId)
      ? [{ departmentId, role: text(formData, "departmentRole", 80) }]
      : [];

  await prisma.memberSubmission.create({
    data: {
      firstName,
      lastName,
      phone: (() => {
        const n = normalizePhone(rawPhone);
        // Numéro marocain : enregistré au format local 06/07…, comme le fichier existant.
        return n && n.length === 9 ? `0${n}` : rawPhone;
      })(),
      email,
      birthDate: birth && /^\d{4}-\d{2}-\d{2}$/.test(birth) ? new Date(`${birth}T00:00:00Z`) : null,
      neighborhood: text(formData, "neighborhood", 80),
      category: category && CATEGORIES.includes(category) ? (category as MemberCategory) : null,
      professionalStatus: pro && PRO.includes(pro) ? (pro as ProfessionalStatus) : null,
      functions: [...new Set(functions)],
      departments,
      message: text(formData, "message", 1000),
    },
  });
  redirect("/ma-fiche?merci=1");
}
