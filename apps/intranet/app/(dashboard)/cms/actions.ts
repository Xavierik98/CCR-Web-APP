"use server";

import { prisma, type ContentStatus } from "@ccr/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { casablancaToUtc } from "@/lib/programme";

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

  const type: "EVENT" | "NEWS" = text(formData, "type") === "EVENT" ? "EVENT" : "NEWS";
  const day = text(formData, "eventDate");
  const time = text(formData, "eventTime") ?? "00:00";
  const eventAt = day && /^\d{4}-\d{2}-\d{2}$/.test(day) && /^\d{2}:\d{2}$/.test(time) ? casablancaToUtc(day, time) : null;
  if (type === "EVENT" && !eventAt) redirect(`/cms/${id ?? "nouveau"}?erreur=date&type=EVENT`);
  // Liens acceptés : adresses web (https) uniquement.
  const url = (key: string) => {
    const v = text(formData, key);
    return v && /^https?:\/\//i.test(v) ? v.slice(0, 1000) : v?.startsWith("/") ? v : null;
  };
  const previous = id ? await prisma.content.findUnique({ where: { id }, select: { publishedAt: true, status: true } }) : null;

  const data = {
    type,
    title,
    slug,
    body,
    coverImageUrl: url("coverImageUrl"),
    videoUrl: url("videoUrl"),
    eventAt,
    location: text(formData, "location")?.slice(0, 200) ?? null,
    status,
    // La date de publication d'origine est conservée lors d'une simple modification.
    publishedAt: status === "PUBLISHED" ? (previous?.status === "PUBLISHED" && previous.publishedAt ? previous.publishedAt : new Date()) : null,
  };
  const item = id
    ? await prisma.content.update({ where: { id }, data })
    : await prisma.content.create({ data: { ...data, authorId: user.email } });
  revalidatePath("/cms");
  revalidatePath("/accompagnement-social/stock");
  redirect(`/cms/${item.id}?enregistre=1`);
}

export async function deleteNews(formData: FormData) {
  await requireAccess("actualites", "edit");
  await prisma.content.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/cms");
  redirect("/cms");
}
