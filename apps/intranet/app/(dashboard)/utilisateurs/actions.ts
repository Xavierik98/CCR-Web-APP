"use server";

import { prisma, type Role } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function saveUser(formData: FormData) {
  await requireUser(["SUPER_ADMIN"]);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "READ_ONLY") as Role;
  if (!email.includes("@")) redirect("/utilisateurs?erreur=email");
  await prisma.user.upsert({ where: { email }, create: { email, role }, update: { role } });
  revalidatePath("/utilisateurs");
  redirect("/utilisateurs?enregistre=1");
}

export async function deleteUser(formData: FormData) {
  const me = await requireUser(["SUPER_ADMIN"]);
  const email = String(formData.get("email"));
  if (email === me.email) redirect("/utilisateurs?erreur=soi");
  await prisma.user.delete({ where: { email } });
  revalidatePath("/utilisateurs");
  redirect("/utilisateurs");
}
