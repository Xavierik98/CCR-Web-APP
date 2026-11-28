-- Espace de stockage des photos et vidéos des actualités (Supabase Storage).
-- Lecture publique (le site affiche les médias) ; dépôt, remplacement et
-- suppression réservés aux personnes inscrites dans la table User de l'intranet.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('medias', 'medias', true, 52428800, array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','video/webm'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.is_intranet_user() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public."User" u where lower(u.email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
revoke all on function public.is_intranet_user() from public;
grant execute on function public.is_intranet_user() to authenticated;

drop policy if exists "medias_insert_intranet" on storage.objects;
drop policy if exists "medias_update_intranet" on storage.objects;
drop policy if exists "medias_delete_intranet" on storage.objects;
create policy "medias_insert_intranet" on storage.objects for insert to authenticated
  with check (bucket_id = 'medias' and public.is_intranet_user());
create policy "medias_update_intranet" on storage.objects for update to authenticated
  using (bucket_id = 'medias' and public.is_intranet_user());
create policy "medias_delete_intranet" on storage.objects for delete to authenticated
  using (bucket_id = 'medias' and public.is_intranet_user());
