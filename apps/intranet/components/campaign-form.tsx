import type { Campaign } from "@ccr/database";
import { saveCampaign } from "@/app/(dashboard)/collecte/actions";
import { toDateInput } from "@/lib/labels";
import { supabaseEnv } from "@/lib/supabase";
import { MediaField } from "./media-field";
import { Button, Field, Input, Textarea } from "./ui";

// Création ou modification d'une campagne : nom, dates, description, affiche
// (photo), vidéo ou lien, engagement mensuel et formulaire public.
export function CampaignForm({ campaign }: { campaign?: Campaign | null }) {
  const env = supabaseEnv();
  return (
    <form action={saveCampaign} className="space-y-4">
      {campaign ? <input type="hidden" name="id" value={campaign.id} /> : null}
      <Field label="Nom de la campagne">
        <Input name="name" defaultValue={campaign?.name} placeholder="Ex. Loyer de l'église, Collecte du 31 décembre" required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date de début">
          <Input name="startDate" type="date" defaultValue={toDateInput(campaign?.startDate)} required />
        </Field>
        <Field label="Date de fin" hint="Facultative">
          <Input name="endDate" type="date" defaultValue={toDateInput(campaign?.endDate)} />
        </Field>
      </div>
      <Field label="Description (facultative)">
        <Textarea name="description" rows={3} defaultValue={campaign?.description ?? ""} placeholder="Objet de la campagne, objectif, informations utiles" />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold">Affiche ou photo</p>
          <MediaField name="coverImageUrl" kind="image" defaultValue={campaign?.coverImageUrl ?? null} supabaseUrl={env?.url ?? null} supabaseKey={env?.key ?? null} />
        </div>
        <div>
          <p className="text-sm font-semibold">Vidéo ou lien (facultatif)</p>
          <MediaField name="videoUrl" kind="video" defaultValue={campaign?.videoUrl ?? null} supabaseUrl={env?.url ?? null} supabaseKey={env?.key ?? null} />
        </div>
      </div>
      <label className="flex items-start gap-3 rounded-xl border border-ccr-ink/10 p-3">
        <input type="checkbox" name="monthly" defaultChecked={campaign?.monthly ?? false} className="mt-1 h-4 w-4 accent-ccr-gold" />
        <span>
          <span className="block text-sm font-semibold">Engagement mensuel</span>
          <span className="block text-xs text-ccr-ink/60">
            Pour le loyer de l&rsquo;église par exemple : chaque personne s&rsquo;engage sur un montant par mois, les paiements sont suivis mois par mois et la relance revient chaque mois.
          </span>
        </span>
      </label>
      <label className="flex items-start gap-3 rounded-xl border border-ccr-ink/10 p-3">
        <input type="checkbox" name="formOpen" defaultChecked={campaign?.formOpen ?? true} className="mt-1 h-4 w-4 accent-ccr-gold" />
        <span>
          <span className="block text-sm font-semibold">Formulaire d&rsquo;engagement ouvert</span>
          <span className="block text-xs text-ccr-ink/60">Les personnes peuvent prendre leur engagement elles-mêmes avec le lien à partager.</span>
        </span>
      </label>
      <Button type="submit">{campaign ? "Enregistrer la campagne" : "Créer la campagne"}</Button>
    </form>
  );
}
