-- Row-level security for families, students, tags and student_tags (FR-026, SC-005).
-- Tutor A owns some data; tutor B must not be able to see, change, delete or link to it.
begin;
create extension if not exists pgtap with schema extensions;

select plan(22);

-- Setup (as postgres) -------------------------------------------------------

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'tutor-a@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'tutor-b@example.test');

-- Act as tutor A and create their data.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '11111111-1111-1111-1111-111111111111', 'role', 'authenticated')::text,
  true
);

insert into public.families (id, name, contact_name)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'Taylor', 'Sarah Taylor');
insert into public.students (id, type, first_name, family_id, subject, level)
values ('aaaaaaaa-0000-0000-0000-000000000002', 'child', 'Emily',
        'aaaaaaaa-0000-0000-0000-000000000001', 'Maths', 'GCSE');
insert into public.tags (id, name) values ('aaaaaaaa-0000-0000-0000-000000000003', 'Online');
insert into public.student_tags (student_id, tag_id)
values ('aaaaaaaa-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000003');

-- Switch to tutor B.
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '22222222-2222-2222-2222-222222222222', 'role', 'authenticated')::text,
  true
);

-- Select ----------------------------------------------------------------------

select is_empty('select * from public.families', 'B sees none of A''s families');
select is_empty('select * from public.students', 'B sees none of A''s students');
select is_empty('select * from public.tags', 'B sees none of A''s tags');
select is_empty('select * from public.student_tags', 'B sees none of A''s student tags');

-- Update ----------------------------------------------------------------------

select is_empty(
  'update public.families set name = ''Hacked'' returning id',
  'B can''t update A''s families'
);
select is_empty(
  'update public.students set first_name = ''Hacked'' returning id',
  'B can''t update A''s students'
);
select is_empty('update public.tags set name = ''Hacked'' returning id', 'B can''t update A''s tags');
select is_empty(
  'update public.student_tags set tag_id = tag_id returning student_id',
  'B can''t update A''s student tags'
);

-- Delete ----------------------------------------------------------------------

select is_empty('delete from public.student_tags returning student_id', 'B can''t delete A''s student tags');
select is_empty('delete from public.students returning id', 'B can''t delete A''s students');
select is_empty('delete from public.tags returning id', 'B can''t delete A''s tags');
select is_empty('delete from public.families returning id', 'B can''t delete A''s families');

-- Insert as someone else ---------------------------------------------------

select throws_ok(
  $$insert into public.families (name, contact_name, tutor_id)
    values ('Smith', 'Jo Smith', '11111111-1111-1111-1111-111111111111')$$,
  '42501',
  null,
  'B can''t insert a family owned by A'
);

-- Linking to A's rows ------------------------------------------------------

insert into public.families (id, name, contact_name)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'Hughes', 'Jo Hughes');
insert into public.students (id, type, first_name, last_name, subject, level)
values ('bbbbbbbb-0000-0000-0000-000000000002', 'adult', 'Daniel', 'Hughes', 'French', 'A level');

select throws_ok(
  $$update public.students set family_id = 'aaaaaaaa-0000-0000-0000-000000000001'
    where id = 'bbbbbbbb-0000-0000-0000-000000000002'$$,
  '23503',
  null,
  'B can''t link their student to A''s family'
);
select throws_ok(
  $$insert into public.student_tags (student_id, tag_id)
    values ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000003')$$,
  '23503',
  null,
  'B can''t tag their student with A''s tag'
);

-- Functions -------------------------------------------------------------------

select throws_ok(
  $$select public.save_student(
      p_id => 'aaaaaaaa-0000-0000-0000-000000000002',
      p_type => 'child',
      p_first_name => 'Hacked',
      p_family_id => 'bbbbbbbb-0000-0000-0000-000000000001',
      p_subject => 'Maths',
      p_level => 'GCSE')$$,
  'P0002',
  'student_not_found',
  'B can''t save over A''s student'
);
select throws_ok(
  $$select public.rename_tag('aaaaaaaa-0000-0000-0000-000000000003', 'Hacked')$$,
  'P0002',
  'tag_not_found',
  'B can''t rename A''s tag'
);
select isnt(
  (select (public.create_tag('Online')).id),
  'aaaaaaaa-0000-0000-0000-000000000003'::uuid,
  'B creating "Online" gets their own tag, not A''s'
);

-- A's data is untouched (as postgres) ---------------------------------------

reset role;

select is(
  (select name from public.families where id = 'aaaaaaaa-0000-0000-0000-000000000001'),
  'Taylor',
  'A''s family is unchanged'
);
select is(
  (select count(*)::int from public.student_tags
   where student_id = 'aaaaaaaa-0000-0000-0000-000000000002'),
  1,
  'A''s student tag still exists'
);

-- Signed-out visitors ---------------------------------------------------------

set local role anon;

select throws_ok('select * from public.families', '42501', null, 'anon has no access to families');
select throws_ok('select * from public.students', '42501', null, 'anon has no access to students');

select * from finish();
rollback;
