import { prisma } from "@ccr/database";
import { notFound } from "next/navigation";
import { Button, Card, Field, Input, Notice, PageHeader, Select, Textarea } from "@/components/ui";
import { requireAccess } from "@/lib/auth";
import { CONTENT_STATUS_LABELS } from "@/lib/labels";
import { deleteNews, saveNews } from "../actions";

export default async function ActualitePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enregistre?: string; erreur?: string }>;
}) {
  await requireAccess("actualites");
  const { id } = await params;
  const { enregistre, erreur } = await searchParams;
  const item = id === "nouveau" ? null : await prisma.content.findUnique({ where: { id } });
  if (id !== "nouveau" && !item) notFound();

  return (
    <>
      <PageHeader title={item?.title ?? "Nouvelle actualité"} back={{ href: "/cms", label: "Toutes les actualités" }} />
      {enregistre ? <Notice>Actualité enregistrée.</Notice> : null}
      {erreur === "titre" ? <Notice tone="magenta">Le titre est obligatoire.</Notice> : null}

      <Card className="max-w-3xl">
        <form action={saveNews} className="space-y-4">
          {item ? <input type="hidden" name="id" value={item.id} /> : null}
          <Field label="Titre">
            <Input name="title" defaultValue={item?.title} required />
          </Field>
          <Field label="Texte">
            <Textarea name="body" rows={8} defaultValue={item?.body} />
          </Field>
          <Field label="Image (adresse)" hint="Lien vers l'affiche ou la photo de l'actualité.">
            <Input name="coverImageUrl" defaultValue={item?.coverImageUrl ?? ""} placeholder="https://…" />
          </Field>
          {item?.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.coverImageUrl} alt="" className="max-h-64 rounded-xl border border-ccr-ink/10" />
          ) : null}
          <Field label="Statut">
            <Select name="status" defaultValue={item?.status ?? "DRAFT"} options={CONTENT_STATUS_LABELS} />
          </Field>
          <Button type="submit">Enregistrer</Button>
        </form>
      </Card>

      {item ? (
        <form action={deleteNews} className="mt-6 space-y-2">
          <input type="hidden" name="id" value={item.id} />
          <label className="flex items-center gap-2 text-xs text-ccr-ink/60">
            <input type="checkbox" name="confirm" required />
            Je confirme la suppression de cette actualité
          </label>
          <Button type="submit" variant="danger">Supprimer</Button>
        </form>
      ) : null}
    </>
  );
}
