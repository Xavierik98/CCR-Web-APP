-- Écodim : Marie France responsable ; tous les enfants actifs rattachés à l'Écodim.
with d as (select id from "Department" where name = 'Ecodim' limit 1)
insert into "DepartmentMembership" (id, "memberId", "departmentId", role)
select gen_random_uuid()::text, '4d52cad2-020a-47a7-bbb1-31e02d760ea2', d.id, 'Responsable de l''Écodim' from d
on conflict ("memberId", "departmentId") do update set role = excluded.role;

update "Member" set functions = array_append(functions, 'Responsable de département')
where id = '4d52cad2-020a-47a7-bbb1-31e02d760ea2' and not ('Responsable de département' = any(functions));

with d as (select id from "Department" where name = 'Ecodim' limit 1)
insert into "DepartmentMembership" (id, "memberId", "departmentId", role)
select gen_random_uuid()::text, m.id, d.id, 'Enfant' from "Member" m, d
where m.category = 'CHILD' and m."membershipStatus" = 'ACTIVE'
on conflict ("memberId", "departmentId") do nothing;

-- Le rappel « départements sans responsable » ne cite plus l'Écodim.
update "Task" set description = regexp_replace(description, '(,\s*)?Ecodim', '', 'g')
where title like 'Désigner les responsables des départements%' and description like '%Ecodim%';
