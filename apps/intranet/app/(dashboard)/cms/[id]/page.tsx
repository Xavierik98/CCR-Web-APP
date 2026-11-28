import { prisma } from "@ccr/database";
import { notFound, redirect } from "next/navigation";
import { MediaField } from "@/components/media-field";
import { Button, Card, Field, Input, Notice, PageHeader, Select, Textarea } from "@/components/ui";
import { canEdit, requireAccess } from "@/lib/auth";
import { CONTENT_STATUS_LABELS } from "@/lib/labels";
import { supabaseEnv } from "@/lib/supabase";
import { deleteNews, saveNews } from "../actions";

const TZ = "Africa/Casablanca";

// Actualité ou événement exceptionnel : texte, photo, vidéo (fichier ou lien
// de plateforme), et pour un événement la date, l'heure et le lieu.
export default async function ActualitePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enregistre?: string; erreur?: string; type?: string }>;
}) {
  const user = await requireAccess("actualites");
  const editable = canEdit(user.role, "actualites");
  const { id } = await params;
  const sp = await searchParams;
  const item = id === "nouveau" ? null : await prisma.content.findUnique({ where: { id } });
  if (id !== "nouveau" && !item) notFound();
  if (!item && !editable) redirect("/cms");
  const env = supabaseEnv();
  const type = item?.type ?? (sp.type === "EVENT" ? "EVENT" : "NEWS");
  const day = item?.eventAt?.toLocaleDateString("en-CA", { timeZone: TZ }) ?? "";
  const time = item?.eventAt?.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TZ }) ?? "";

  return (
    <>
      <PageHeader
        title={item?.title ?? (type === "EVENT" ? "Nouvel événement" : "Nouvelle actualité")}
        back={{ href: "/cms", label: "Actualités et événements" }}
      />
      {sp.enregistre ? <Notice>Enregistré. {item?.status === "PUBLISHED" ? "Visible sur le site d'ici quelques minutes." : "Pas encore publié sur le site."}</Notice> : null}
      {sp.erreur === "titre" ? <Notice tone="magenta">Le titre est obligatoire.</Notice> : null}
      {sp.erreur === "date" ? <Notice tone="magenta">Indiquez la date de l&rsquo;événement.</Notice> : null}

      <Card className="max-w-3xl">
        <form action={saveNews}>
          <fieldset disabled={!editable} className="space-y-4">
            {item ? <input type="hidden" name="id" value={item.id} /> : null}
            <Field label="Type">
              <Select name="type" defaultValue={type} options={{ NEWS: "Actualité", EVENT: "Événement exceptionnel" }} />
            </Field>
            <Field label="Titre">
              <Input name="title" defaultValue={item?.title} required />
            </Field>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr]">
              <Field label="Date de l'événement" hint="Obligatoire pour un événement.">
                <Input name="eventDate" type="date" defaultValue={day} />
              </Field>
              <Field label="Heure">
                <Input name="eventTime" type="time" defaultValue={time} />
              </Field>
              <Field label="Lieu">
                <Input name="location" defaultValue={item?.location ?? ""} placeholder="Ex. CCR Casablanca" />
              </Field>
            </div>
            <Field label="Texte">
              <Textarea name="body" rows={8} defaultValue={item?.body} />
            </Field>
            <Field label="Photo ou affiche">
              <MediaField name="coverImageUrl" kind="image" defaultValue={item?.coverImageUrl ?? null} supabaseUrl={env?.url ?? null} supabaseKey={env?.key ?? null} />
            </Field>
            <Field label="Vidéo (facultatif)" hint="Fichier de 50 Mo au maximum, ou lien d'une vidéo déjà publiée sur une plateforme.">
              <MediaField name="videoUrl" kind="video" defaultValue={item?.videoUrl ?? null} supabaseUrl={env?.url ?? null} supabaseKey={env?.key ?? null} />
            </Field>
            <Field label="Statut">
              <Select name="status" defaultValue={item?.status ?? "PUBLISHED"} options={CONTENT_STATUS_LABELS} />
            </Field>
            {editable ? <Button type="submit">Enregistrer</Button> : null}
          </fieldset>
        </form>
      </Card>

      {item && editable ? (
        <form action={deleteNews} className="mt-6 space-y-2">
          <input type="hidden" name="id" value={item.id} />
          <label className="flex items-center gap-2 text-xs text-ccr-ink/60">
            <input type="checkbox" name="confirm" required />
            Je confirme la suppression définitive
          </label>
          <Button type="submit" variant="danger">Supprimer</Button>
        </form>
      ) : null}
    </>
  );
}
