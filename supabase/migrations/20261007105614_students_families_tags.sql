-- Student list: families, students, tags and student_tags (specs/001-student-list/data-model.md).
-- Every table is scoped to the owning tutor with row-level security.

create type public.student_type as enum ('adult', 'child');

-- Keeps updated_at current on every row update.
create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- families
-- ---------------------------------------------------------------------------

create table public.families (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  contact_name text not null check (char_length(btrim(contact_name)) between 1 and 100),
  contact_email text check (char_length(contact_email) <= 254),
  contact_phone text check (char_length(contact_phone) <= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Target of the composite foreign key from students, so a student can only link to a family
  -- owned by the same tutor.
  unique (id, tutor_id)
);

create index families_tutor_id_idx on public.families (tutor_id);

create trigger families_set_updated_at
  before update on public.families
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- students
-- ---------------------------------------------------------------------------

create table public.students (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type public.student_type not null,
  first_name text not null check (char_length(btrim(first_name)) between 1 and 50),
  last_name text check (char_length(last_name) <= 50),
  family_id uuid,
  subject text not null check (char_length(btrim(subject)) between 1 and 50),
  level text not null check (char_length(btrim(level)) between 1 and 50),
  exam_board text check (char_length(exam_board) <= 50),
  notes text check (char_length(notes) <= 2000),
  email text check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, tutor_id),
  -- NO ACTION (not RESTRICT): a family with students can't be deleted, but deleting the tutor's
  -- account can still cascade through families and students in one statement.
  constraint students_family_fk foreign key (family_id, tutor_id)
    references public.families (id, tutor_id) on delete no action,
  -- A child has no surname or contact details of their own and must belong to a family.
  constraint students_child_shape check (
    type <> 'child'
    or (last_name is null and email is null and phone is null and family_id is not null)
  ),
  -- An adult must have a surname.
  constraint students_adult_shape check (
    type <> 'adult'
    or (last_name is not null and char_length(btrim(last_name)) between 1 and 50)
  )
);

create index students_tutor_id_idx on public.students (tutor_id);
create index students_family_id_idx on public.students (family_id, tutor_id);

-- Two students in the same family can't share a name (children compare on first name, adults on
-- first and last name). save_student checks this first so the normal path never logs values;
-- this index is the backstop for races.
create unique index students_family_name_unique on public.students (
  family_id,
  lower(btrim(first_name)),
  lower(coalesce(btrim(last_name), ''))
) where family_id is not null;

create trigger students_set_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- tags and student_tags
-- ---------------------------------------------------------------------------

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, tutor_id)
);

create unique index tags_tutor_name_unique on public.tags (tutor_id, lower(btrim(name)));
create index tags_tutor_id_idx on public.tags (tutor_id);

create trigger tags_set_updated_at
  before update on public.tags
  for each row execute function public.set_updated_at();

create table public.student_tags (
  student_id uuid not null,
  tag_id uuid not null,
  tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  primary key (student_id, tag_id),
  foreign key (student_id, tutor_id) references public.students (id, tutor_id) on delete cascade,
  foreign key (tag_id, tutor_id) references public.tags (id, tutor_id) on delete cascade
);

create index student_tags_tag_id_idx on public.student_tags (tag_id, tutor_id);
create index student_tags_tutor_id_idx on public.student_tags (tutor_id);

-- ---------------------------------------------------------------------------
-- Row-level security: each tutor sees and changes only their own rows
-- ---------------------------------------------------------------------------

alter table public.families enable row level security;
alter table public.students enable row level security;
alter table public.tags enable row level security;
alter table public.student_tags enable row level security;

create policy "Tutors select their own families" on public.families
  for select to authenticated using ((select auth.uid()) = tutor_id);
create policy "Tutors insert their own families" on public.families
  for insert to authenticated with check ((select auth.uid()) = tutor_id);
create policy "Tutors update their own families" on public.families
  for update to authenticated
  using ((select auth.uid()) = tutor_id) with check ((select auth.uid()) = tutor_id);
create policy "Tutors delete their own families" on public.families
  for delete to authenticated using ((select auth.uid()) = tutor_id);

create policy "Tutors select their own students" on public.students
  for select to authenticated using ((select auth.uid()) = tutor_id);
create policy "Tutors insert their own students" on public.students
  for insert to authenticated with check ((select auth.uid()) = tutor_id);
create policy "Tutors update their own students" on public.students
  for update to authenticated
  using ((select auth.uid()) = tutor_id) with check ((select auth.uid()) = tutor_id);
create policy "Tutors delete their own students" on public.students
  for delete to authenticated using ((select auth.uid()) = tutor_id);

create policy "Tutors select their own tags" on public.tags
  for select to authenticated using ((select auth.uid()) = tutor_id);
create policy "Tutors insert their own tags" on public.tags
  for insert to authenticated with check ((select auth.uid()) = tutor_id);
create policy "Tutors update their own tags" on public.tags
  for update to authenticated
  using ((select auth.uid()) = tutor_id) with check ((select auth.uid()) = tutor_id);
create policy "Tutors delete their own tags" on public.tags
  for delete to authenticated using ((select auth.uid()) = tutor_id);

create policy "Tutors select their own student tags" on public.student_tags
  for select to authenticated using ((select auth.uid()) = tutor_id);
create policy "Tutors insert their own student tags" on public.student_tags
  for insert to authenticated with check ((select auth.uid()) = tutor_id);
create policy "Tutors update their own student tags" on public.student_tags
  for update to authenticated
  using ((select auth.uid()) = tutor_id) with check ((select auth.uid()) = tutor_id);
create policy "Tutors delete their own student tags" on public.student_tags
  for delete to authenticated using ((select auth.uid()) = tutor_id);

-- Signed-out visitors get no access at all; signed-in tutors are limited by the policies above.
revoke all on public.families, public.students, public.tags, public.student_tags from anon;
grant select, insert, update, delete
  on public.families, public.students, public.tags, public.student_tags to authenticated;

-- ---------------------------------------------------------------------------
-- save_student: insert or update a student and replace their tags in one transaction
-- ---------------------------------------------------------------------------

-- Optional parameters have defaults so callers (named arguments via PostgREST) can omit them;
-- p_id null means create.
create function public.save_student(
  p_type public.student_type,
  p_first_name text,
  p_subject text,
  p_level text,
  p_id uuid default null,
  p_last_name text default null,
  p_family_id uuid default null,
  p_exam_board text default null,
  p_notes text default null,
  p_email text default null,
  p_phone text default null,
  p_tag_ids uuid[] default '{}'
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_first_name text := nullif(btrim(p_first_name), '');
  v_last_name text := nullif(btrim(p_last_name), '');
  v_exam_board text := nullif(btrim(p_exam_board), '');
  v_notes text := nullif(btrim(p_notes), '');
  v_email text := nullif(btrim(p_email), '');
  v_phone text := nullif(btrim(p_phone), '');
begin
  -- A child keeps no surname or contact details of their own: delete them, don't hide them.
  if p_type = 'child' then
    v_last_name := null;
    v_email := null;
    v_phone := null;
  end if;

  -- Check for a name clash in the family first. The error carries only the constraint name, so
  -- no student names are written to the database logs.
  if p_family_id is not null and exists (
    select 1
    from public.students s
    where s.family_id = p_family_id
      and lower(btrim(s.first_name)) = lower(v_first_name)
      and lower(coalesce(btrim(s.last_name), '')) = lower(coalesce(v_last_name, ''))
      and s.id is distinct from p_id
  ) then
    raise exception using errcode = '23505', message = 'students_family_name_unique';
  end if;

  if p_id is null then
    insert into public.students (
      type, first_name, last_name, family_id, subject, level, exam_board, notes, email, phone
    )
    values (
      p_type, v_first_name, v_last_name, p_family_id, btrim(p_subject), btrim(p_level),
      v_exam_board, v_notes, v_email, v_phone
    )
    returning id into v_id;
  else
    update public.students
    set type = p_type,
        first_name = v_first_name,
        last_name = v_last_name,
        family_id = p_family_id,
        subject = btrim(p_subject),
        level = btrim(p_level),
        exam_board = v_exam_board,
        notes = v_notes,
        email = v_email,
        phone = v_phone
    where id = p_id
    returning id into v_id;

    -- Missing, or owned by another tutor (hidden by RLS).
    if v_id is null then
      raise exception using errcode = 'P0002', message = 'student_not_found';
    end if;
  end if;

  delete from public.student_tags
  where student_id = v_id
    and tag_id <> all (coalesce(p_tag_ids, '{}'));

  insert into public.student_tags (student_id, tag_id)
  select v_id, t.tag_id
  from unnest(coalesce(p_tag_ids, '{}')) as t (tag_id)
  on conflict do nothing;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- create_tag: create a tag, or return the existing one with the same name (any case)
-- ---------------------------------------------------------------------------

create function public.create_tag(p_name text)
returns public.tags
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_tag public.tags;
begin
  -- ON CONFLICT DO NOTHING means reusing a tag never raises, so tag names never reach the logs.
  insert into public.tags (name)
  values (btrim(p_name))
  on conflict (tutor_id, (lower(btrim(name)))) do nothing
  returning * into v_tag;

  if v_tag.id is null then
    select *
    into v_tag
    from public.tags t
    where t.tutor_id = (select auth.uid())
      and lower(btrim(t.name)) = lower(btrim(p_name));
  end if;

  return v_tag;
end;
$$;

-- ---------------------------------------------------------------------------
-- rename_tag: rename a tag, refusing a name another of the tutor's tags already has
-- ---------------------------------------------------------------------------

create function public.rename_tag(p_id uuid, p_name text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.tags t
    where t.id <> p_id
      and lower(btrim(t.name)) = lower(btrim(p_name))
  ) then
    raise exception using errcode = '23505', message = 'tags_tutor_name_unique';
  end if;

  update public.tags set name = btrim(p_name) where id = p_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'tag_not_found';
  end if;
end;
$$;

revoke execute on function public.save_student(
  public.student_type, text, text, text, uuid, text, uuid, text, text, text, text, uuid[]
) from public, anon;
revoke execute on function public.create_tag(text) from public, anon;
revoke execute on function public.rename_tag(uuid, text) from public, anon;

grant execute on function public.save_student(
  public.student_type, text, text, text, uuid, text, uuid, text, text, text, text, uuid[]
) to authenticated;
grant execute on function public.create_tag(text) to authenticated;
grant execute on function public.rename_tag(uuid, text) to authenticated;
