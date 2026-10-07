-- Data rules for students, families and tags (FR-007, FR-009, FR-013, FR-015, FR-016, FR-022,
-- FR-023, FR-025) and keeping values out of database errors (research R14).
begin;
create extension if not exists pgtap with schema extensions;

select plan(26);

insert into auth.users (id, email)
values ('11111111-1111-1111-1111-111111111111', 'tutor-a@example.test');

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '11111111-1111-1111-1111-111111111111', 'role', 'authenticated')::text,
  true
);

insert into public.families (id, name, contact_name) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Taylor', 'Sarah Taylor'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Smith', 'Jo Smith');

-- Child and adult shape -------------------------------------------------------

select throws_ok(
  $$insert into public.students (type, first_name, last_name, family_id, subject, level)
    values ('child', 'Emily', 'Taylor', 'aaaaaaaa-0000-0000-0000-000000000001', 'Maths', 'GCSE')$$,
  '23514', null, 'a child can''t have a last name'
);
select throws_ok(
  $$insert into public.students (type, first_name, email, family_id, subject, level)
    values ('child', 'Emily', 'e@example.test', 'aaaaaaaa-0000-0000-0000-000000000001', 'Maths', 'GCSE')$$,
  '23514', null, 'a child can''t have an email'
);
select throws_ok(
  $$insert into public.students (type, first_name, phone, family_id, subject, level)
    values ('child', 'Emily', '07700 900123', 'aaaaaaaa-0000-0000-0000-000000000001', 'Maths', 'GCSE')$$,
  '23514', null, 'a child can''t have a phone'
);
select throws_ok(
  $$insert into public.students (type, first_name, subject, level)
    values ('child', 'Emily', 'Maths', 'GCSE')$$,
  '23514', null, 'a child must have a family'
);
select throws_ok(
  $$insert into public.students (type, first_name, subject, level)
    values ('adult', 'Daniel', 'French', 'A level')$$,
  '23514', null, 'an adult must have a last name'
);
select throws_ok(
  $$insert into public.students (type, first_name, last_name, subject, level)
    values ('adult', 'Daniel', '   ', 'French', 'A level')$$,
  '23514', null, 'an adult''s last name can''t be blank'
);
select throws_ok(
  format(
    $$insert into public.students (type, first_name, last_name, notes, subject, level)
      values ('adult', 'Daniel', 'Hughes', %L, 'French', 'A level')$$,
    repeat('x', 2001)
  ),
  '23514', null, 'notes can''t be longer than 2000 characters'
);

-- Duplicate names in a family (backstop index) --------------------------------

select lives_ok(
  $$insert into public.students (type, first_name, family_id, subject, level)
    values ('child', 'Emily', 'aaaaaaaa-0000-0000-0000-000000000001', 'Maths', 'GCSE')$$,
  'a child Emily can join the Taylor family'
);
select throws_ok(
  $$insert into public.students (type, first_name, family_id, subject, level)
    values ('child', 'emily ', 'aaaaaaaa-0000-0000-0000-000000000001', 'Maths', 'GCSE')$$,
  '23505', null, 'a second child "emily " in the same family is rejected by the index'
);
select lives_ok(
  $$insert into public.students (type, first_name, last_name, family_id, subject, level)
    values ('adult', 'Emily', 'Taylor', 'aaaaaaaa-0000-0000-0000-000000000001', 'French', 'A level')$$,
  'an adult Emily Taylor can share the family with the child Emily'
);
select lives_ok(
  $$insert into public.students (type, first_name, last_name, subject, level) values
      ('adult', 'Emily', 'Jones', 'French', 'A level'),
      ('adult', 'Emily', 'Jones', 'French', 'A level')$$,
  'two adults with the same name and no family are allowed'
);

-- save_student ----------------------------------------------------------------

select throws_ok(
  $$select public.save_student(
      p_type => 'child', p_first_name => 'emily',
      p_family_id => 'aaaaaaaa-0000-0000-0000-000000000001',
      p_subject => 'Maths', p_level => 'GCSE')$$,
  '23505',
  'students_family_name_unique',
  'save_student rejects a duplicate name with only the constraint name in the message'
);

select lives_ok(
  $$select public.save_student(
      p_type => 'child', p_first_name => 'Oliver', p_last_name => 'Smith',
      p_family_id => 'aaaaaaaa-0000-0000-0000-000000000002', p_subject => 'Maths',
      p_level => 'GCSE', p_email => 'oliver@example.test', p_phone => '07700 900123')$$,
  'save_student accepts a child with stray adult-only values'
);
select ok(
  (select last_name is null and email is null and phone is null
   from public.students where first_name = 'Oliver'),
  'save_student stores no last name, email or phone for a child'
);

insert into public.tags (id, name) values
  ('cccccccc-0000-0000-0000-000000000001', 'Online'),
  ('cccccccc-0000-0000-0000-000000000002', 'Year 11'),
  ('cccccccc-0000-0000-0000-000000000003', 'Exam soon');

select lives_ok(
  $$select public.save_student(
      p_id => (select id from public.students where first_name = 'Oliver'),
      p_type => 'child', p_first_name => 'Oliver',
      p_family_id => 'aaaaaaaa-0000-0000-0000-000000000002', p_subject => 'Maths',
      p_level => 'GCSE',
      p_tag_ids => array['cccccccc-0000-0000-0000-000000000001',
                         'cccccccc-0000-0000-0000-000000000002']::uuid[])$$,
  'save_student adds tags'
);
select lives_ok(
  $$select public.save_student(
      p_id => (select id from public.students where first_name = 'Oliver'),
      p_type => 'child', p_first_name => 'Oliver',
      p_family_id => 'aaaaaaaa-0000-0000-0000-000000000002', p_subject => 'Maths',
      p_level => 'GCSE',
      p_tag_ids => array['cccccccc-0000-0000-0000-000000000002',
                         'cccccccc-0000-0000-0000-000000000003']::uuid[])$$,
  'save_student replaces tags'
);
select set_eq(
  $$select tag_id from public.student_tags
    where student_id = (select id from public.students where first_name = 'Oliver')$$,
  $$values ('cccccccc-0000-0000-0000-000000000002'::uuid),
           ('cccccccc-0000-0000-0000-000000000003'::uuid)$$,
  'after the second save Oliver has exactly Year 11 and Exam soon'
);

-- Tags ------------------------------------------------------------------------

select throws_ok(
  $$insert into public.tags (name) values ('online')$$,
  '23505', null, 'a direct insert of "online" clashes with "Online" (backstop index)'
);
select is(
  (select (public.create_tag('online')).id),
  'cccccccc-0000-0000-0000-000000000001'::uuid,
  'create_tag("online") returns the existing "Online" tag'
);
select is(
  (select count(*)::int from public.tags where lower(name) = 'online'),
  1,
  'there is still only one "Online" tag'
);
select throws_ok(
  $$select public.rename_tag('cccccccc-0000-0000-0000-000000000002', 'ONLINE')$$,
  '23505',
  'tags_tutor_name_unique',
  'rename_tag rejects another tag''s name with only the constraint name in the message'
);

-- Deleting ----------------------------------------------------------------------

select throws_ok(
  $$delete from public.families where id = 'aaaaaaaa-0000-0000-0000-000000000002'$$,
  '23503', null, 'a family with students can''t be deleted'
);

delete from public.tags where id = 'cccccccc-0000-0000-0000-000000000002';

select is(
  (select count(*)::int from public.student_tags where tag_id = 'cccccccc-0000-0000-0000-000000000002'),
  0,
  'deleting a tag removes its links'
);
select is(
  (select count(*)::int from public.students where first_name = 'Oliver'),
  1,
  'deleting a tag leaves the student'
);

-- Deleting the account removes everything (constitution IV) --------------------

reset role;

select lives_ok(
  $$delete from auth.users where id = '11111111-1111-1111-1111-111111111111'$$,
  'deleting the tutor''s account cascades without being blocked'
);
select is(
  (select count(*)::int from public.families
   where tutor_id = '11111111-1111-1111-1111-111111111111'),
  0,
  'the tutor''s families are gone'
);

select * from finish();
rollback;
