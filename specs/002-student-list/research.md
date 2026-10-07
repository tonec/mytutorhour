# Research: Student List

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-07

Each section records a decision, why it was made, and what else was considered. No open
NEEDS CLARIFICATION items remain.

## R1. Where per-tutor isolation and the student rules are enforced

- **Decision**: Enforce the rules in Postgres as well as in the form.
  - **Isolation:** RLS on every table uses `(select auth.uid()) = tutor_id`. Composite foreign keys `(family_id, tutor_id)` and `(tag_id, tutor_id)` make it impossible to link a student to another tutor's family or tag.
  - **Child/adult shape:** check constraints. A child has no last name, email or phone and must have a family. An adult must have a last name.
  - **Duplicate names within a family:** a unique expression index.
  - **Family delete:** `ON DELETE RESTRICT` blocks deleting a family that still has students.
- **Rationale**: Constitution IV requires that no query path bypasses isolation. FR-007, FR-013, FR-016 and FR-022 are integrity rules, and the database is the only place that holds them under every code path (form, RPC, future imports). The Zod schema gives the same rules as instant inline errors.
- **Alternatives considered**: Application-only checks. Rejected because one missed check leaks or corrupts children's data. Triggers instead of constraints. Rejected because they are more code for the same guarantees.

## R2. Saving a student and their tags atomically

- **Decision**: Add one Postgres function, `public.save_student(...)`, declared `security invoker` with `set search_path = ''`. It inserts or updates the student, normalises fields by type (a child gets last name, email and phone forced to null), and replaces the student's tag links, all in one transaction. The server action calls it with `supabase.rpc('save_student', …)`.
- **Rationale**: A student row plus a `student_tags` diff takes several statements. With supabase-js and no transaction, a failure part-way through would leave half-saved tags. `security invoker` keeps RLS in force, so the function grants nothing extra.
- **Alternatives considered**: Several supabase-js calls with best-effort cleanup. Rejected as not atomic. `security definer`. Rejected because it bypasses RLS and isn't needed.

## R3. Duplicate-name rule (FR-016)

- **Decision**: A unique index on `students (family_id, lower(btrim(first_name)), lower(coalesce(btrim(last_name), '')))` where `family_id is not null`. The server action maps Postgres error `23505` on this index to a field error on `firstName`: "Another student in this family has this name. Add something to tell them apart, e.g. 'Emily T'." The client doesn't pre-check, because the server round trip is fast and authoritative.
- **Rationale**: Children have a null last name, which is compared as `''`. The child "Emily" and the adult "Emily Taylor" are therefore distinct, while two children called "Emily"/"emily " clash. This matches the spec, and the index also covers edits, type changes and family moves.
- **Alternatives considered**: A check in the action only. Rejected because two tabs could race past it.

## R4. Searching, filtering and sorting the list (FR-002–FR-004)

- **Decision**: The `/students` Server Component reads `searchParams` (`q`, `tag`). It loads all of the tutor's students with their family name and tags in one query, then filters and sorts in a pure function `filterAndSortStudents()` using `localeCompare(…, 'en-GB', { sensitivity: 'base' })`. The search box is a `GET` form, so it works without JS and the URL keeps the state for back/forward.
- **Rationale**: A solo tutor has about 10–50 students, so loading them all is a single small query. A pure function is easy to unit test (case-insensitive, partial, family-name match). Combining an OR filter across an embedded relation with a tag filter in PostgREST is awkward and would need a view.
- **Alternatives considered**: Server-side filtering through a `security_invoker` view with `ilike` and array `contains`. Kept as an upgrade path if student counts grow past a few hundred. A client-only filter in a Client Component. Rejected because it loses URL state and no-JS support.

## R5. Phone and email validation (FR-011)

- **Decision**: Email uses `z.email()`, matching `src/app/(auth)/signup/schema.ts`. Phone uses a Zod refinement that accepts an optional leading `+`, digits, spaces, `-` and `()`, and requires 7–15 digits after stripping punctuation (E.164 maximum). The phone is stored trimmed, as entered.
- **Rationale**: Covers UK (`07700 900123`, `+44 7700 900123`) and international numbers without a new dependency (Constitution VI).
- **Alternatives considered**: `libphonenumber-js`. It is accurate but adds about 150 KB for a display-only field, so it is rejected for now and can be revisited if numbers are later used for sending.

## R6. Picking or creating a family, and assigning tags, on the student form

- **Decision**: Use Base UI `Combobox` (already a dependency via `@base-ui/react`) through shadcn wrappers:
  - **Family picker:** a single-select combobox with an "Add new family…" option. That option opens a `Dialog` with the family form, and on success the new family is auto-selected.
  - **Tags:** a multi-select combobox. Typing a name that doesn't exist offers "Create tag 'x'". Choosing it calls `createTag`, which returns the existing tag on a case-insensitive match (FR-023, US6 AC4), and the tag is added to the selection.

  Tags created this way persist even if the student form is then cancelled, because tags are the tutor's library rather than part of the student.

- **Rationale**: Reuses an installed headless library that is accessible (ARIA combobox, keyboard support), which helps WCAG 2.2 AA. The dialog portals outside the student `<form>`, which avoids nested forms.
- **Alternatives considered**: A native `<select>` plus a separate page to add families. Rejected because it breaks the under-90-second add-a-child flow (SC-001).

## R7. Adult ↔ child switching (FR-013, FR-014)

- **Decision**: Model the type as a radio group. Switching Adult → Child while last name, email or phone hold values opens a confirm dialog. On confirm those inputs are cleared and hidden. On the server, `save_student` forces them to null for children, and the check constraint is the backstop. Switching Child → Adult shows empty last name, email and phone fields, and the required last name blocks saving.
- **Rationale**: The client confirmation gives clear UX, and the server/DB rule makes sure values are deleted rather than hidden (FR-013).

## R8. Form and mutation pattern

- **Decision**: Reuse the existing `useActionForm` + `ActionForm` + `FormField` + `ActionState` pattern (`src/hooks/use-action-form.ts`, `src/utils/form.ts`). Server Actions validate with the same Zod schema, call Supabase through `src/lib/supabase/server.ts`, then `revalidatePath` and `redirect`, as described in Next 16 docs (`01-getting-started/07-mutating-data.md`). Pages take `params`/`searchParams` as Promises (Next 16 `page.md`). `cacheComponents` isn't enabled, so no `use cache` is needed.
- **Rationale**: Consistent with the auth forms, and works without JS (progressive enhancement).
- **Additions needed**: `FormField` only renders `<input>`. Add sibling field components (`TextareaField`, `RadioGroupField`, `ComboboxField`) that follow the same error/ARIA wiring (`aria-describedby`, `FieldError`).

## R9. Typed database access

- **Decision**: Generate types with `npx supabase gen types typescript --local > src/lib/supabase/database.types.ts`, and type `createClient<Database>()` in `src/lib/supabase/server.ts` and `client.ts`. Put feature queries in colocated `data.ts` files (for example `src/app/(private)/students/data.ts`) that only server code imports.
- **Rationale**: Strict TypeScript all the way through, without a hand-maintained row type. `src/lib/db.ts` stays as it is; this feature doesn't need a separate DB client.

## R10. Privacy in errors and logs (FR-015, FR-027)

- **Decision**: Server actions never log payloads or rows. Unexpected Supabase errors are logged as `{ action, code }` only, and the user gets a generic message. Notes aren't included in any `payload` echo beyond the form itself, and never in analytics (there is no analytics yet). Student notes are not given to LLM generation by this feature; that is spec 001's decision.
- **Rationale**: Constitution II and IV.

## R11. Primary keys

- **Decision**: `uuid` primary keys with `default gen_random_uuid()`.
- **Rationale**: IDs appear in URLs (`/students/[id]`), so they shouldn't be guessable. Postgres 17 (the local `major_version`) has no built-in UUIDv7, and per-tutor tables stay tiny, so v4 fragmentation doesn't matter at this scale.
- **Alternatives considered**: `bigint identity`. It is better for index locality but exposes enumerable IDs.

## R12. Reconciling with spec 001 (Guardian → Family)

- **Decision**: This feature's `families` table **replaces** spec 001's per-student `Guardian`. A child's updates go to the family `contact_name`/`contact_email`, and an adult's go to the student's own email. The 'preferred channel' is dropped. Spec 001 (US3, FR-001, FR-002, FR-020, Key Entities) was amended on 2026-10-07 to match.

## R13. Testing approach

- **Decision**:
  - **Unit tests (Vitest + RTL):** Zod schemas (child/adult shape, phone, notes length, tag name), `filterAndSortStudents`, Postgres error → field error mapping, the `StudentForm` type toggle and confirm dialog, and the family picker's "add new" flow with mocked actions.
  - **RLS/DB tests:** pgTAP files in `supabase/tests/database/` run with `npx supabase test db`. They check:
    - cross-tutor select, insert, update and delete are denied on all four tables
    - composite foreign keys block linking another tutor's family or tag
    - the check constraints work
    - the duplicate-name index works
    - `ON DELETE RESTRICT` works

    The constitution requires automated tests for RLS changes.

  - **E2E (Playwright):** run against the local Supabase stack. A `tutor` fixture creates a fresh confirmed user through the Supabase Admin API (service-role key read from the test environment only, never the app bundle), signs in through `/login`, and deletes the user afterwards. Each test gets an empty account (for the empty state) and parallel projects don't collide. A second tutor in one test covers the not-found isolation case.
- **Rationale**: Covers the constitution's quality gates. Fresh users avoid shared-state flakiness without fixed waits.
