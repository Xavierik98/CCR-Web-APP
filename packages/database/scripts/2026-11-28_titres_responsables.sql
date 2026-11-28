-- Mise à jour du 28/11/2026 (demande du client) :
-- 1. Les titres d'usage collés au prénom deviennent un champ « title ».
-- 2. Fonctions et rôles des responsables désignés.
-- 3. Rappels (tâches) pour les responsables encore à désigner.

-- 1. Titres
UPDATE "Member" SET title = 'Ancien', "firstName" = btrim(substr("firstName", 8)) WHERE "firstName" ILIKE 'Ancien %';
UPDATE "Member" SET title = 'Maman', "firstName" = btrim(substr("firstName", 7)) WHERE "firstName" ILIKE 'Maman %';
UPDATE "Member" SET title = 'Papa', "firstName" = btrim(substr("firstName", 6)) WHERE "firstName" ILIKE 'Papa %';
UPDATE "Member" SET title = 'Sœur', "firstName" = btrim(substr("firstName", 6)) WHERE "firstName" ILIKE 'Sœur %';
UPDATE "Member" SET title = 'Apôtre', "firstName" = initcap(btrim(substr("firstName", 8))) WHERE "firstName" ILIKE 'Apotre %';
UPDATE "Member" SET title = 'Pasteur', "firstName" = btrim(substr("firstName", 9)) WHERE "firstName" ILIKE 'Pasteur %';
UPDATE "Member" SET "firstName" = 'Franz', "lastName" = 'NDOKAYO' WHERE title = 'Pasteur' AND upper("firstName") = 'FRANZ NDOKAYO' AND coalesce("lastName", '') = '';
UPDATE "Member" SET "firstName" = btrim(substr("firstName", 7)),
  functions = array(SELECT DISTINCT unnest(functions || ARRAY['Responsable de département']))
  WHERE "firstName" ILIKE 'Respo %';

-- 2. Responsables désignés
UPDATE "Member" SET functions = ARRAY['Pasteur principal'] WHERE id = 'dfa1b276-c54e-49f3-87fb-5d2e9705b351';            -- Gilblas TCHOUNAND
UPDATE "Member" SET title = 'Pasteur', functions = ARRAY['Assistant pasteur'] WHERE id = '21970f63-4e10-49ce-b491-505a1e07182e'; -- Arsène KIFILA
UPDATE "Member" SET "lastName" = 'NDJINGA', functions = ARRAY['Responsable de la jeunesse'] WHERE id = 'fc50a1da-c3b5-4523-8495-6cb9b25d364e'; -- Jude NDJINGA
UPDATE "Member" SET title = 'Mme', functions = array(SELECT DISTINCT unnest(functions || ARRAY['Responsable de la trésorerie'])) WHERE id = 'aadbfb7f-618c-4927-aa5d-9a8963bfd76d'; -- Mme NEKALO
UPDATE "Member" SET functions = array(SELECT DISTINCT unnest(functions || ARRAY['Responsable des chantres (Glad)'])) WHERE id = 'a966a3d7-ee97-431d-b2f1-fc79bf7d632e'; -- Eliel KOUASSI

INSERT INTO "DepartmentMembership" ("id", "memberId", "departmentId", "role")
SELECT gen_random_uuid()::text, v.member_id, d.id, v.role
FROM (VALUES
  ('fc50a1da-c3b5-4523-8495-6cb9b25d364e', 'JCCR', 'Responsable de la jeunesse'),
  ('aadbfb7f-618c-4927-aa5d-9a8963bfd76d', 'Trésorerie', 'Responsable de la trésorerie'),
  ('a966a3d7-ee97-431d-b2f1-fc79bf7d632e', 'Louange', 'Responsable des chantres')
) AS v(member_id, dept, role)
JOIN "Department" d ON d.name = v.dept
ON CONFLICT ("memberId", "departmentId") DO UPDATE SET role = EXCLUDED.role;

-- 3. Rappels pour le super administrateur
INSERT INTO "Task" ("id", "title", "description", "dueAt", "assigneeId", "createdById")
SELECT gen_random_uuid()::text, t.title, t.description, timestamp '2026-12-05 09:00', u.id, u.id
FROM "User" u,
(VALUES
  ('Désigner les responsables des départements sans responsable',
   'Départements sans responsable dans l''intranet : Communication, Ecodim, Organisation, Partenariat, Responsables des églises de maison, Fortuné, Grace Emmanuelle, Jonathan, Samuel. Sur le site : Communication & Digital et Service d''ordre. À faire dans Départements, en indiquant « Responsable » comme fonction.'),
  ('Envoyer les photos des nouveaux responsables',
   'Photos à fournir pour le site (page À propos) : Jude NDJINGA (jeunesse), Mme NEKALO (trésorerie), Eliel KOUASSI (chantres).')
) AS t(title, description)
WHERE u.role = 'SUPER_ADMIN';
