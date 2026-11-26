"use server";

import { prisma, type ContentStatus } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";

function text(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function saveNews(formData: FormData) {
  const user = await requireAccess("actualites", "edit");
  const id = text(formData, "id");
  const title = text(formData, "title");
  const body = text(formData, "body") ?? "";
  if (!title) redirect(`/cms/${id ?? "nouveau"}?erreur=titre`);
  const status = (text(formData, "status") ?? "DRAFT") as ContentStatus;

  let slug = slugify(text(formData, "slug") ?? title);
  const clash = await prisma.content.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  const data = {
    title,
    slug,
    body,
    coverImageUrl: text(formData, "coverImageUrl"),
    status,
    publishedAt: status === "PUBLISHED" ? new Date() : null,
  };
  const item = id
    ? await prisma.content.update({ where: { id }, data })
    : await prisma.content.create({ data: { ...data, type: "NEWS", authorId: user.email } });
  revalidatePath("/cms");
  redirect(`/cms/${item.id}?enregistre=1`);
}

export async function deleteNews(formData: FormData) {
  await requireAccess("actualites", "edit");
  await prisma.content.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/cms");
  redirect("/cms");
}
