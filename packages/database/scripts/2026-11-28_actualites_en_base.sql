-- Les actualités écrites dans le code du site passent dans la base : elles
-- deviennent modifiables et supprimables depuis l'intranet (Actualités).
insert into "Content" (id, type, title, slug, "coverImageUrl", body, status, "authorId", "publishedAt", "eventAt", location, "createdAt", "updatedAt")
select 'import-traversee-2026', 'EVENT', 'Nuit de prière Traversée', 'nuit-de-priere-traversee-2026-2027',
  'https://ccr-famille-public.vercel.app/images/actualites/traversee-2026-2027-affiche.webp',
  'Banquet de la nouvelle saison. Jeudi 31 décembre, de 20h à 2h, au CCR Casablanca. Dress code : rouge, doré, blanc.',
  'PUBLISHED', 'import', '2026-11-20 12:00:00', '2026-12-31 20:00:00', 'CCR Casablanca', now(), now()
where not exists (select 1 from "Content" where slug = 'nuit-de-priere-traversee-2026-2027');

insert into "Content" (id, type, title, slug, "coverImageUrl", "videoUrl", body, status, "authorId", "publishedAt", "createdAt", "updatedAt")
select 'import-gospel-culture-day', 'NEWS', 'Gospel Culture Day', 'gospel-culture-day',
  'https://ccr-famille-public.vercel.app/images/actualites/gospel-culture-day.jpg',
  'https://ccr-famille-public.vercel.app/videos/gospel-culture-day.mp4',
  'Retour en vidéo sur la journée du 12 septembre 2026.',
  'PUBLISHED', 'import', '2026-09-12 12:00:00', now(), now()
where not exists (select 1 from "Content" where slug = 'gospel-culture-day');

update "Content" set "coverImageUrl" = 'https://ccr-famille-public.vercel.app/images/actualites/21-jours-jeune-et-priere.jpg'
where slug = '21-jours-de-jeunes-et-prieres';
