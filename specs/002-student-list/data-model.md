# Data Model: Student List

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

There are four new tables in `public`, created in one migration
(`supabase/migrations/<timestamp>_students_families_tags.sql`) together with their RLS policies
(constitution: "Every new table MUST ship with its RLS policy in the same migration").

Common to every table:

- `tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade`. Deleting a tutor account hard-deletes all their rows (Constitution IV).
- RLS is enabled, with four policies (select, insert, update, delete) `to authenticated` and the predicate `(select auth.uid()) = tutor_id` for both `using` and `with check`. There are no `anon` policies.
- `created_at` and `updated_at` are `timestamptz not null default now()`. A shared trigger function `public.set_updated_at()` bumps `updated_at`.
- An index on `tutor_id`, the RLS column.

## Enum

```text
student_type: 'adult' | 'child'
```

## families

| Column                  | Type                                 | Rules                                                         |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------- |
| id                      | uuid PK, default `gen_random_uuid()` |                                                               |
| tutor_id                | uuid                                 | see above                                                     |
| name                    | text not null                        | `char_length(btrim(name)) between 1 and 60` (FR-019)          |
| contact_name            | text not null                        | `char_length(btrim(contact_name)) between 1 and 100` (FR-019) |
| contact_email           | text null                            | format checked in the app (FR-011); `char_length <= 254`      |
| contact_phone           | text null                            | format checked in the app (FR-011); `char_length <= 30`       |
| created_at / updated_at | timestamptz                          |                                                               |

- `unique (id, tutor_id)` is the target of the students composite foreign key.
- There is no uniqueness on `name`. Two "Taylor" families are allowed, and the contact name tells them apart in the picker.

## students

| Column                  | Type                  | Rules                                                                             |
| ----------------------- | --------------------- | --------------------------------------------------------------------------------- |
| id                      | uuid PK               |                                                                                   |
| tutor_id                | uuid                  | see above                                                                         |
| type                    | student_type not null | FR-006                                                                            |
| first_name              | text not null         | `char_length(btrim(first_name)) between 1 and 50`                                 |
| last_name               | text null             | adults only, required for adults (see checks); `<= 50`                            |
| family_id               | uuid null             | composite FK `(family_id, tutor_id) → families (id, tutor_id) on delete restrict` |
| subject                 | text not null         | 1–50 chars (e.g. "Maths")                                                         |
| level                   | text not null         | 1–50 chars (e.g. "GCSE", "Year 10")                                               |
| exam_board              | text null             | `<= 50`                                                                           |
| notes                   | text null             | `char_length(notes) <= 2000` (FR-015)                                             |
| email                   | text null             | adults only; `<= 254`                                                             |
| phone                   | text null             | adults only; `<= 30`                                                              |
| created_at / updated_at | timestamptz           |                                                                                   |

**Check constraints** (FR-007, FR-009, FR-013):

```text
students_child_shape: type <> 'child' OR (last_name IS NULL AND email IS NULL AND phone IS NULL AND family_id IS NOT NULL)
students_adult_shape: type <> 'adult' OR (last_name IS NOT NULL AND char_length(btrim(last_name)) between 1 and 50)
```

**Indexes**

- `students_tutor_id_idx (tutor_id)`
- `students_family_id_idx (family_id, tutor_id)`: FK index for joins and RESTRICT checks
- `students_family_name_unique` (FR-016, R3):
  `unique (family_id, lower(btrim(first_name)), lower(coalesce(btrim(last_name), ''))) where family_id is not null`
- `unique (id, tutor_id)`: target of the `student_tags` composite FK

## tags

| Column                  | Type          | Rules                                                |
| ----------------------- | ------------- | ---------------------------------------------------- |
| id                      | uuid PK       |                                                      |
| tutor_id                | uuid          | see above                                            |
| name                    | text not null | `char_length(btrim(name)) between 1 and 30` (FR-023) |
| created_at / updated_at | timestamptz   |                                                      |

- `tags_tutor_name_unique` on `(tutor_id, lower(btrim(name)))` (FR-023, case-insensitive)
- `unique (id, tutor_id)`

## student_tags

| Column     | Type | Rules                                                                                                                       |
| ---------- | ---- | --------------------------------------------------------------------------------------------------------------------------- |
| student_id | uuid | composite FK `(student_id, tutor_id) → students (id, tutor_id) on delete cascade`                                           |
| tag_id     | uuid | composite FK `(tag_id, tutor_id) → tags (id, tutor_id) on delete cascade` (FR-025 delete removes the tag from all students) |
| tutor_id   | uuid | see above; present so RLS and composite FKs stay simple                                                                     |

- PK `(student_id, tag_id)`; index `student_tags_tag_id_idx (tag_id, tutor_id)`.

## Relationships

```text
auth.users 1─* families 1─* students *─* tags   (via student_tags)
     └──────────────────────┴──────────┴── tutor_id on every row
```

- A child belongs to exactly one family. An adult has zero or one family.
- A family can't be deleted while students reference it (FR-022). The DB raises `23503`, which is mapped to "Move or remove this family's students first."
- Deleting a student (spec 001) cascades to `student_tags`. Deleting a tag cascades to `student_tags` only.

## Derived values (not stored)

- **Contact details shown for a student** (FR-008, FR-010): a child shows the family's `contact_email` and `contact_phone`. An adult shows their own `email`/`phone`. This is computed in `toStudentListItem()` / `toStudentDetail()` mappers so family edits apply immediately (SC-004).
- **Display name**: a child shows `first_name`; an adult shows `first_name last_name`.

## Function: `public.save_student`

`security invoker`, `set search_path = ''`, `language plpgsql`.

| Param                                                                                  | Type                 |
| -------------------------------------------------------------------------------------- | -------------------- |
| p_id                                                                                   | uuid (null = create) |
| p_type                                                                                 | public.student_type  |
| p_first_name, p_last_name, p_subject, p_level, p_exam_board, p_notes, p_email, p_phone | text                 |
| p_family_id                                                                            | uuid                 |
| p_tag_ids                                                                              | uuid[]               |

Behaviour:

1. Trim every text value and turn empty strings into null.
2. If `p_type = 'child'`, force `last_name`, `email` and `phone` to null (FR-013: deleted, not hidden).
3. If `p_id` is null, insert. Otherwise update `where id = p_id`; if no row is updated (missing or another tutor's), raise `P0002`.
4. `delete from student_tags where student_id = id and tag_id <> all(p_tag_ids)`, then `insert … select unnest(p_tag_ids) on conflict do nothing`.
5. Return the student `id`.

Revoke `execute` from `anon` and `public`, and grant it to `authenticated`.

## Validation (app layer, Zod: `src/app/(private)/students/schema.ts`)

The Zod schema mirrors the database checks so errors appear inline before submitting. It is a
discriminated union on `type`:

- **child**: `firstName` (1–50), `familyId` (uuid, required, message "Choose or add a family"), `subject`, `level`, optional `examBoard`, `notes` (≤ 2000), `tagIds[]`.
- **adult**: the same, plus `lastName` (1–50, required), optional `familyId`, and optional `email` (`z.email()`) and `phone` (R5 refinement).

The family schema (`src/app/(private)/families/schema.ts`) has `name`, `contactName`, an optional
`contactEmail` and an optional `contactPhone`. The tag schema has `name` (1–30 after trim).

## Error mapping (`src/app/(private)/students/errors.ts`)

| Postgres code / constraint            | Field       | Message                                                                                           |
| ------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `23505` `students_family_name_unique` | firstName   | "Another student in this family has this name. Add something to tell them apart, e.g. 'Emily T'." |
| `23505` `tags_tutor_name_unique`      | name        | "You already have a tag with this name."                                                          |
| `23503` on families delete            | form        | "Move or remove this family's students first."                                                    |
| `23514` check violation               | form        | "Please check the highlighted fields." (should be unreachable after Zod)                          |
| `P0002`                               | (not found) | `notFound()`                                                                                      |
| anything else                         | form        | "We couldn't save this. Please try again." (log `{ action, code }` only)                          |
