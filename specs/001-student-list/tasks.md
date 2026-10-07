---
description: 'Task list for the Student List feature'
---

# Tasks: Student List

**Input**: Design documents from `specs/001-student-list/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Included. The constitution requires automated tests for RLS changes. It also requires
Playwright E2E for core flows on all four projects, and unit tests that follow Arrange-Act-Assert.
Write each story's tests first and check they fail before implementing.

**Organization**: Tasks are grouped by user story so each story can be built and tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on unfinished tasks)
- **[Story]**: The user story the task belongs to (US1–US6 from spec.md)

## Conventions for every task

- Single Next.js project. Feature code lives in `src/app/(private)/students` and `src/app/(private)/families`, following the `src/app/(auth)/signup` layout (`schema.ts`, `actions.ts`, `*-form.tsx`, `page.tsx`).
- **Next.js 16**: read `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md` before writing actions. `params` and `searchParams` are Promises (`await` them). Mutations call `revalidatePath(...)`, then `redirect(...)`.
- **Forms**: reuse `useActionForm` (`src/hooks/use-action-form.ts`), `ActionForm` (`src/components/ui/action-form.tsx`), `FormField` (`src/components/ui/form-field.tsx`), `FormMessage`, and `ActionState`/`toFormState`/`fromErrorToFormState` (`src/utils/form.ts`).
- **Database work**: load the `supabase:supabase-postgres-best-practices` skill before writing SQL. RLS predicates use `(select auth.uid())`.
- **Privacy (FR-015, FR-027)**: never `console.log` payloads, rows, names, contact details, notes or tags. Unexpected DB errors are logged only as `{ action, code }`.
- **Unit tests**: colocated `*.test.ts(x)`, importing `describe`/`it`/`expect` from `vitest`, with explicit `// Arrange // Act // Assert` sections. Mock `@/lib/supabase/server` and server actions; never hit the network.
- **E2E**: select by `data-testid`, then role, then text, using the IDs in [contracts/ui-routes.md](./contracts/ui-routes.md). No `waitForTimeout`. Use English example names (Emily, Oliver, Sarah Taylor, Daniel Hughes).
- **Formatting**: run `npx eslint --fix <files>` after each task.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencies, UI primitives and test plumbing.

- [x] T001 Add `@supabase/supabase-js` (`^2.114.0`, already installed as a peer of `@supabase/ssr`) as an explicit dependency: `npm i @supabase/supabase-js@^2.114.0`. This updates `package.json` and `package-lock.json`.
- [x] T002 [P] Add the Base UI shadcn components with `npx shadcn@latest add combobox radio-group alert-dialog badge`, creating `src/components/ui/combobox.tsx`, `src/components/ui/radio-group.tsx`, `src/components/ui/alert-dialog.tsx` and `src/components/ui/badge.tsx`. Confirm they import from `@base-ui/react` (style `base-vega` in `components.json`), then run `npx eslint --fix src/components/ui`.
- [x] T003 [P] In `playwright.config.ts`, load `.env.local` for the test runner only with `if (existsSync('.env.local')) process.loadEnvFile('.env.local');` (Node 24). This makes `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY` available to fixtures. App code must never read `SUPABASE_SECRET_KEY`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, RLS, types, shared schemas and components, and E2E fixtures that every story uses.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Database (one migration, sequential: same file)

- [x] T004 Create the migration with `npx supabase migration new students_families_tags` (→ `supabase/migrations/<timestamp>_students_families_tags.sql`). Add:
  - `create type public.student_type as enum ('adult', 'child');`
  - The trigger function `public.set_updated_at()` (`security invoker`, `set search_path = ''`, sets `new.updated_at = now()`).
  - Table `public.families` with these columns:
    - `id uuid primary key default gen_random_uuid()`
    - `tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade`
    - `name text not null` with check `char_length(btrim(name)) between 1 and 60`
    - `contact_name text not null` with check `char_length(btrim(contact_name)) between 1 and 100`
    - `contact_email text null` with check `char_length <= 254`
    - `contact_phone text null` with check `char_length <= 30`
    - `created_at`/`updated_at timestamptz not null default now()`

    Also add `unique (id, tutor_id)`, index `families_tutor_id_idx (tutor_id)` and the `set_updated_at` trigger.
- [x] T005 In the same migration, add table `public.students`. Columns:
  - `id uuid pk default gen_random_uuid()`
  - `tutor_id` (as for families)
  - `type public.student_type not null`
  - `first_name text not null` (`char_length(btrim(first_name)) between 1 and 50`)
  - `last_name text null` (`<= 50`)
  - `family_id uuid null`
  - `subject text not null` (1–50 chars)
  - `level text not null` (1–50 chars)
  - `exam_board text null` (`<= 50`)
  - `notes text null` (`char_length(notes) <= 2000`)
  - `email text null` (`<= 254`)
  - `phone text null` (`<= 30`)
  - `created_at`, `updated_at`

  Constraints:
  - composite FK `(family_id, tutor_id) references public.families (id, tutor_id) on delete no action` (NO ACTION rather than RESTRICT so account deletion can cascade)
  - `students_child_shape: type <> 'child' OR (last_name IS NULL AND email IS NULL AND phone IS NULL AND family_id IS NOT NULL)`
  - `students_adult_shape: type <> 'adult' OR (last_name IS NOT NULL AND char_length(btrim(last_name)) between 1 and 50)`
  - `unique (id, tutor_id)`

  Indexes:
  - `students_tutor_id_idx (tutor_id)`
  - `students_family_id_idx (family_id, tutor_id)`
  - unique index `students_family_name_unique on public.students (family_id, lower(btrim(first_name)), lower(coalesce(btrim(last_name), ''))) where family_id is not null`

  Add the `set_updated_at` trigger.

- [x] T006 In the same migration, add the two tag tables.
  - **`public.tags`**:
    - Columns: `id uuid pk`, `tutor_id`, `name text not null` with check `char_length(btrim(name)) between 1 and 30`, `created_at`, `updated_at`.
    - Constraints and indexes: unique index `tags_tutor_name_unique on public.tags (tutor_id, lower(btrim(name)))`, `unique (id, tutor_id)`, `tags_tutor_id_idx`, plus the trigger.
  - **`public.student_tags`**:
    - Columns: `student_id uuid not null`, `tag_id uuid not null`, `tutor_id uuid not null default auth.uid() references auth.users (id) on delete cascade`.
    - Constraints: `primary key (student_id, tag_id)`, FK `(student_id, tutor_id) references public.students (id, tutor_id) on delete cascade`, FK `(tag_id, tutor_id) references public.tags (id, tutor_id) on delete cascade`.
    - Indexes: `student_tags_tag_id_idx (tag_id, tutor_id)`, `student_tags_tutor_id_idx (tutor_id)`.
- [x] T007 In the same migration, enable RLS on all four tables. On each, create `select`, `insert`, `update` and `delete` policies `to authenticated`, with `using ((select auth.uid()) = tutor_id)` and, for insert and update, `with check ((select auth.uid()) = tutor_id)`. Add no `anon` policies. Grant table privileges to `authenticated` only.
- [x] T008 In the same migration, add `public.save_student(p_id uuid, p_type public.student_type, p_first_name text, p_last_name text, p_family_id uuid, p_subject text, p_level text, p_exam_board text, p_notes text, p_email text, p_phone text, p_tag_ids uuid[]) returns uuid`, declared `language plpgsql security invoker set search_path = ''`. Behaviour (data-model.md):
  1. Trim text and turn `''` into null.
  2. If `p_type = 'child'`, force `last_name`, `email` and `phone` to null.
  3. If `p_family_id is not null` and `exists (select 1 from public.students where family_id = p_family_id and lower(btrim(first_name)) = lower(v_first_name) and lower(coalesce(btrim(last_name), '')) = lower(coalesce(v_last_name, '')) and id is distinct from p_id)`, then `raise exception using errcode = '23505', message = 'students_family_name_unique'`. Add no `detail` or `hint`, so no names reach the Postgres logs (research R14).
  4. If `p_id is null`, insert. Otherwise `update … where id = p_id`, and raise `no_data_found` (`P0002`) when no row changed.
  5. `delete from public.student_tags where student_id = v_id and tag_id <> all(coalesce(p_tag_ids, '{}'))`, then `insert … select unnest(p_tag_ids) on conflict do nothing`.
  6. Return `v_id`.

  Finally: `revoke execute … from public, anon; grant execute … to authenticated`.

- [x] T009 In the same migration, add the tag functions (data-model.md § create_tag / rename_tag, research R14). Both are `language plpgsql security invoker set search_path = ''`, with `revoke execute … from public, anon; grant execute … to authenticated`.
  - **`public.create_tag(p_name text) returns public.tags`**: `insert into public.tags (name) values (btrim(p_name)) on conflict (tutor_id, (lower(btrim(name)))) do nothing returning id, name`. If no row was returned, return the existing tag `where tutor_id = (select auth.uid()) and lower(btrim(name)) = lower(btrim(p_name))`. It never raises on a duplicate.
  - **`public.rename_tag(p_id uuid, p_name text) returns void`**: if another of the tutor's tags (`id <> p_id`) has the same `lower(btrim(name))`, `raise exception using errcode = '23505', message = 'tags_tutor_name_unique'` (no detail). Otherwise `update public.tags set name = btrim(p_name) where id = p_id`, and raise `P0002` if no row changed.

- [x] T010 Apply and generate types: run `npx supabase db reset`, then `npx supabase gen types typescript --local > src/lib/supabase/database.types.ts`.
- [x] T011 Type the Supabase clients with `Database` from `./database.types`: `createServerClient<Database>` in `src/lib/supabase/server.ts` and `createBrowserClient<Database>` in `src/lib/supabase/client.ts`. Run `npm run check-types`.

### Database tests (pgTAP, run with `npx supabase test db`)

- [x] T012 [P] Write `supabase/tests/database/students_rls.test.sql`.
  - **Setup:** `begin; create extension if not exists pgtap with schema extensions; select plan(n);`. Insert two users into `auth.users` (tutor A, tutor B). Switch identity with `set local role authenticated; select set_config('request.jwt.claims', json_build_object('sub', <id>, 'role', 'authenticated')::text, true);`.
  - **Assertions:**
    - Tutor B can't select, update or delete tutor A's families, students, tags or student_tags (0 rows / no effect).
    - B can't insert a row with `tutor_id` = A.
    - B can't link B's student to A's family or A's tag (composite FK error `23503`).
    - B calling `save_student` with A's student id raises `P0002`.
    - B calling `rename_tag` with A's tag id raises `P0002`. B calling `create_tag` with the name of A's tag creates a separate tag for B.
    - `anon` sees 0 rows.
  - **Teardown:** end with `select * from finish(); rollback;`.
- [x] T013 [P] Write `supabase/tests/database/students_constraints.test.sql`, with the same setup as T012, asserting:
  - A child with a last name, email or phone, or without a family, fails `students_child_shape`.
  - An adult with a null or blank last name fails `students_adult_shape`.
  - Two children "Emily" and "emily " in one family raise `23505` on `students_family_name_unique`. A child "Emily" and an adult "Emily Taylor" in the same family are allowed. Two "Emily"s with no family are allowed.
  - Tags "Online" and "online" inserted directly for one tutor raise `23505` on `tags_tutor_name_unique` (backstop).
  - `save_student` adding a second "emily" to the same family raises `throws_ok(…, '23505', 'students_family_name_unique')`. The message is exactly the constraint name, with no values (R14).
  - `create_tag('online')` when "Online" exists returns the existing tag's id without raising, and the tutor still has one tag.
  - `rename_tag` to another tag's name (any case) raises `throws_ok(…, '23505', 'tags_tutor_name_unique')`.
  - Deleting a family with a student raises `23503`.
  - Deleting a tag removes its `student_tags` rows only.
  - `save_student` with `p_type = 'child'` stores null `last_name`/`email`/`phone` even when values are passed.
  - `save_student` replaces tag links (old removed, new added).
  - `notes` longer than 2000 chars fails.

### Shared schemas, helpers and components

- [x] T014 [P] Create `src/schema/phoneSchema.ts`, exporting `phoneSchema`: an optional trimmed string that accepts an optional leading `+`, digits, spaces, `-` and `()`, and requires 7–15 digits after stripping punctuation. Error message: "Enter a valid phone number." Write AAA tests in `src/schema/phoneSchema.test.ts`:
  - accepts: `07700 900123`, `+44 7700 900123`, `(020) 7946 0958`, `+1-202-555-0143`
  - rejects: `12345`, `phone`, `+44 7700 900123 999 999`
  - treats an empty string as undefined
- [x] T015 [P] Create `src/utils/db-errors.ts`, exporting `mapDbError(error: { code?: string; message?: string } | null, action: string): { kind: 'field'; field: string; message: string } | { kind: 'form'; message: string } | { kind: 'notFound' }`, using the table in data-model.md § Error mapping.
  - Match constraint names by searching `error.message`. This works for both the custom errors raised by `save_student`/`rename_tag` and the backstop constraint errors. Never read or log `error.details`, which can contain values (R14).
  - `23505` + `students_family_name_unique` → field `firstName` with "Another student in this family has this name. Add something to tell them apart, e.g. 'Emily T'."
  - `23505` + `tags_tutor_name_unique` → field `name` with "You already have a tag with this name."
  - `23503` → form "Move or remove this family's students first."
  - `23514` → form "Please check the highlighted fields."
  - `P0002` → `notFound`
  - anything else → form "We couldn't save this. Please try again.", logged only as `console.error({ action, code })`.

  Add `toFieldErrorState(field, message, payload)` building an `ActionState` whose `fieldErrors.properties[field].errors = [message]`. Write tests in `src/utils/db-errors.test.ts`, including a spy asserting the logged object has only `action` and `code`.

- [x] T016 [P] Create field components next to `src/components/ui/form-field.tsx`, using the same wiring (`useActionStateContext`, `useFormContext`, `aria-invalid`, `aria-describedby={`${name}-error`}`, `<FieldError>`):
  - `src/components/ui/textarea-field.tsx`: wraps `Textarea`. Optional `maxLength` shows a live `n/2000` counter (`aria-live="polite"`) and stops input at the limit.
  - `src/components/ui/radio-group-field.tsx`: RHF `Controller` + the shadcn `RadioGroup` with a visible group label (`role="radiogroup"` labelled), and props `options: { value; label }[]`.
  - `src/components/ui/combobox-field.tsx`: RHF `Controller` + shadcn `Combobox`. Supports `multiple`, an `onCreate?(text)` "Create '…'" option and an `extraOption` ("Add new family…"). It renders hidden `<input name>` elements (one per value when multiple) so `FormData` carries the selection.

  Write AAA tests in `src/components/ui/textarea-field.test.tsx` and `src/components/ui/radio-group-field.test.tsx` (label association, error rendering from `ActionState`, counter).

- [x] T017 [P] Update `src/hooks/use-action-form.ts` so failed saves keep the input and server errors get focus (FR-017, research R15).
  - Keep `useActionState(action, EMPTY_FORM_STATE)` and its `formAction` as the form's `action` (the no-JS path).
  - Add a second `useActionState` whose action wraps the server action in `try/catch`, and use it from `onSubmit`. Rethrow Next.js control-flow errors with `unstable_rethrow` from `next/navigation` (check `node_modules/next/dist/docs/` first). Map any other error (for example `TypeError: Failed to fetch`) to `toFormState('ERROR', "We couldn't reach the server. Check your connection and try again.")`.
  - Return the state with the newer `timestamp` as `actionState`, and `pending` from either.
  - When the returned state is `ERROR` with `fieldErrors.properties`, call `form.setFocus(<first key in the form's field order>)` in an effect keyed on `actionState.timestamp`.

  Write AAA tests in `src/hooks/use-action-form.test.ts` with `renderHook`:
  - A rejected action produces the network `ERROR` message, and the form values are unchanged.
  - A later successful call replaces the error.
  - A server `ERROR` with `fieldErrors.properties.firstName` focuses `firstName`.

- [x] T018 [P] Change `src/components/ui/form-message.tsx` to use `role="alert"` on its always-mounted container, replacing `aria-live="polite"` (contract ui-routes.md). Write `src/components/ui/form-message.test.tsx`: an `ERROR` state renders the message inside `getByRole('alert')`. Run `npx playwright test e2e/auth.spec.ts` to confirm the auth forms still pass.
- [x] T019 [P] In `src/config/routes.ts`, add `studentNew: { url: '/students/new', title: 'Add student' }`, `studentTags: { url: '/students/tags', title: 'Tags' }` and `familyNew: { url: '/families/new', title: 'Add family' }`. Change `getTitleByUrl` to fall back to the longest route whose `url` prefixes the path (so `/students/<uuid>` → "Students" and `/families/<uuid>` → "Families"). Write tests in `src/config/routes.test.ts`.
- [x] T020 Create `src/app/(private)/students/schema.ts` with `studentSchema`, a `z.discriminatedUnion('type', …)`.
  - **Shared fields:**
    - `id` optional uuid
    - `firstName` trimmed 1–50 ("Enter a first name.")
    - `subject` trimmed 1–50
    - `level` trimmed 1–50
    - `examBoard` optional ≤ 50
    - `notes` optional ≤ 2000
    - `tagIds` uuid array (default `[]`)
  - **child:** `familyId` required uuid ("Choose or add a family.")
  - **adult:** `lastName` trimmed 1–50 ("Enter a last name."), optional `familyId` uuid, optional `email` via `z.email({ message: 'Please enter a valid email address.' })`, and `phone: phoneSchema`.
  - Empty strings become `undefined`.

  Also export `studentFormDataToInput(formData: FormData)`, which reads `tagIds` with `getAll`. Write tests in `src/app/(private)/students/schema.test.ts` covering each rule, including that a child payload with `lastName`/`email`/`phone` drops those keys after parsing.

- [x] T021 [P] Create `src/app/(private)/families/schema.ts` with `familySchema`:
  - `id` optional uuid
  - `name` trimmed 1–60 ("Enter a family name.")
  - `contactName` trimmed 1–100 ("Enter a contact name.")
  - `contactEmail` optional `z.email()`
  - `contactPhone: phoneSchema`
  - `intent` optional `'inline'`

  Write tests in `src/app/(private)/families/schema.test.ts`.

- [x] T022 [P] Create `src/app/(private)/students/tags/schema.ts` with `tagNameSchema`, trimmed 1–30 ("Tag names must be 1–30 characters."), plus `renameTagSchema` (`id`, `name`) and `deleteTagSchema` (`id`). Write tests in `src/app/(private)/students/tags/schema.test.ts`, including whitespace-only and 31-char rejections.

### E2E fixtures

- [x] T023 Create `e2e/fixtures/tutor.ts` (needs T001's `@supabase/supabase-js` and T003's env loading), exporting `test` (extended from `@playwright/test`) and `expect`.
  - **`adminClient`** fixture: `createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })` from `@supabase/supabase-js`.
  - **`newTutor()`** fixture factory:
    1. Creates a confirmed user with `auth.admin.createUser({ email: `tutor-${randomUUID()}@example.test`, password, email_confirm: true })`.
    2. Signs in through `/login` using `getByLabel('Email')`, `getByLabel('Password')` and `getByRole('button', { name: 'Log in' })`.
    3. Waits for the URL `/dashboard`.
    4. Returns `{ id, email, page }`.
  - **`tutor`** fixture: signs in a fresh user on the default `page`.
  - **Teardown:** `auth.admin.deleteUser(id)` for every user created (rows cascade).
- [x] T024 Create `e2e/fixtures/seed.ts` (after T023, which provides the `adminClient` fixture) with helpers that take `(adminClient, tutorId)` and insert rows with the secret key with an explicit `tutor_id`: `seedFamily({ name, contactName, contactEmail?, contactPhone? })`, `seedStudent({ type, firstName, lastName?, familyId?, subject, level })` and `seedTag(name, studentIds[])`. Each returns ids. They are used for list, search, filter and tag tests so those tests don't depend on other stories' UI.

### Form hydration

- [ ] T025 Stop forms losing text typed before React hydrates the page (research R16). Today, text typed into a server-rendered input before hydration is wiped. React Hook Form's `register` ref calls `setFieldValue(name, defaultValue)` with the `''` default and overwrites the DOM value. This is seen on mobile WebKit in the E2E login and affects every form using `FormField`, including log in and sign up.
  - In `src/components/ui/form-field.tsx` and `src/components/ui/textarea-field.tsx`, wrap the `register(name)` ref. Read the element's current `value` _before_ calling the registration ref. If it was non-empty and differs from the value after registering, call `setValue(name, typed, { shouldDirty: true })` so the typed text is kept in both the form state and the DOM. Leave the existing `key`/`defaultValue` payload handling unchanged.
  - Write AAA tests in `src/components/ui/form-field.test.tsx` and extend `src/components/ui/textarea-field.test.tsx`. Server-render a `FormHarness` form with `renderToString` into a container, set the input's `value` to "Emily" (as a user would before hydration), then hydrate with `render(..., { container, hydrate: true })`. Assert the input still shows "Emily" and that submitting puts "Emily" in `FormData`. Also assert that an untouched input still hydrates to its default.
  - In `e2e/fixtures/tutor.ts`, remove the `toPass` retry around login and go back to a single fill → click → `toHaveURL('/dashboard')`. Add an E2E test in `e2e/auth.spec.ts` that types into the login form straight after `page.goto('/login')`, with no waits, and checks the email field keeps its value (run on all four projects).
  - Run `npx playwright test e2e/auth.spec.ts --repeat-each=5` and confirm it passes on every project, including mobile.

**Checkpoint**: `npx supabase test db` and `npm run test:unitRun` are green, and the schema and fixtures are ready.

---

## Phase 3: User Story 1 - Add a child student with their family (Priority: P1) 🎯 MVP

**Goal**: A tutor adds a child (first name, subject, level), picks or creates a family inline, and sees the child in the list using the family's contact details.

**Independent Test**: In an empty account, add a child and create the family "Taylor" (contact "Sarah Taylor") from the student form. Emily appears in `/students` as a child in the Taylor family, and her record shows Sarah Taylor's email and phone.

### Tests for User Story 1 (write first, they must fail)

- [ ] T026 [P] [US1] Write E2E tests in `e2e/students.spec.ts` (`test.describe('US1 add a child')`, using the `tutor` fixture) covering spec US1 AC1–AC5:
  - AC1: Emily (GCSE, Maths) with a new family "Taylor", contact "Sarah Taylor", email `sarah.taylor@example.test`, phone `07700 900123` → `student-row` shows Emily, `student-type-badge` "Child", and "Taylor". Opening the row shows Sarah Taylor's email and phone in `contact-details`.
  - AC2: with Child selected there is no "Last name", "Email" or "Phone" field, and saving without a family shows "Choose or add a family."
  - AC3: Oliver added to the existing Taylor family shows the same contact.
  - AC4: change the family email via `seed`/admin update, reload Emily, and the new email is shown.
  - AC5: "emily" in Taylor is blocked with the duplicate message on First name, and focus is on First name (M2). "Emily T" then saves.
  - FR-017 failed save: fill the child form, then `page.route('**/students/new', (route) => route.request().method() === 'POST' ? route.abort('internetdisconnected') : route.continue())` and click "Save student". The form shows "We couldn't reach the server. Check your connection and try again." in `getByRole('alert')`, and every field keeps its value. `page.unroute(...)`, click "Save student" again, and the student appears in the list.

  Also add a no-horizontal-scroll check on `/students/new`, as in `e2e/auth.spec.ts`.

- [ ] T027 [P] [US1] Write component tests in `src/app/(private)/students/student-form.test.tsx`, mocking `./actions`, `../families/actions` and `next/navigation`:
  - Child is the default type, and no last-name, email or phone inputs render.
  - Submitting without a family shows "Choose or add a family." and doesn't call `saveStudent`.
  - Choosing `family-picker-add-new` opens `family-dialog`. A mocked `saveFamily` SUCCESS with `payload { id, name: 'Taylor', contactName: 'Sarah Taylor' }` closes the dialog and selects Taylor.
  - The notes counter shows `0/2000`.
  - FR-017: when mocked `saveStudent` rejects (network error), the form shows the network error and the typed first name, subject, level and notes are still in their inputs.
  - When mocked `saveStudent` returns a server `firstName` field error, the error shows under First name and First name has focus.
- [ ] T028 [P] [US1] Write tests for pure mappers in `src/app/(private)/students/mappers.test.ts`:
  - `toStudentListItem` (child `displayName` = first name, `familyName` set)
  - `toStudentDetail` (child `contact` = family `contactName`/`contactEmail`/`contactPhone`; child whose family has no email or phone → `contact.isEmpty = true`)

### Implementation for User Story 1

- [ ] T029 [P] [US1] Create `src/app/(private)/students/mappers.ts` with the types `StudentListItem` (`id`, `type`, `displayName`, `familyId`, `familyName`, `subject`, `level`, `tags: { id; name }[]`) and `StudentDetail` (all editable fields plus `contact: { source: 'family' | 'student'; name?; email?; phone?; isEmpty }`, `familyName` and `tagIds`). Add the pure functions `toStudentListItem(row)` and `toStudentDetail(row)` over the generated `Database` row types with an embedded `families(...)` and `student_tags(tags(id, name))`. Handle the child branch here; US2 adds the adult branch.
- [ ] T030 [P] [US1] Create `src/app/(private)/families/data.ts` with `listFamilies()`: select `id, name, contact_name, students(count)` ordered by name. Return `FamilyListItem { id, name, contactName, studentCount }` sorted with `localeCompare(…, 'en-GB', { sensitivity: 'base' })`.
- [ ] T031 [US1] Create `src/app/(private)/families/actions.ts` (`'use server'`) with `saveFamily(state, formData)`:
  1. Parse `familySchema` and insert or update `families` (`name`, `contact_name`, `contact_email`, `contact_phone`), mapping errors via `mapDbError`.
  2. When `intent === 'inline'`, return `toFormState('SUCCESS', 'Family added.', { id, name, contactName })` with no redirect.
  3. Otherwise `revalidatePath('/families')`, `revalidatePath('/students')`, then `redirect(`/families/${id}`)`.
- [ ] T032 [US1] Create `src/app/(private)/families/family-form.tsx` (`'use client'`), using `useActionForm({ schema: familySchema, action: saveFamily, defaultValues })`, `data-testid="family-form"`, `FormField`s labelled "Family name", "Contact name", "Contact email (optional)" and "Contact phone (optional)", a hidden `id` and `intent`, `FormMessage` and a full-width submit button. It takes the props `family?`, `intent?: 'inline'` and `onSaved?(payload)`, and calls `onSaved` when `actionState.status === 'SUCCESS'` and the intent is inline.
- [ ] T033 [US1] Create `src/app/(private)/families/family-dialog.tsx`: a shadcn `Dialog` (`data-testid="family-dialog"`, title "Add family") rendering `<FamilyForm intent="inline" onSaved={…} />` in a portal (not nested inside the student `<form>`). It takes `open`, `onOpenChange` and `onCreated({ id, name, contactName })`, and returns focus to `family-picker` on close.
- [ ] T034 [US1] Create `src/app/(private)/students/actions.ts` (`'use server'`) with `saveStudent(state, formData)`:
  1. `studentSchema.parse(studentFormDataToInput(formData))`.
  2. `supabase.rpc('save_student', { p_id, p_type, p_first_name, p_last_name, p_family_id, p_subject, p_level, p_exam_board, p_notes, p_email, p_phone, p_tag_ids })`.
  3. Map errors with `mapDbError(error, 'saveStudent')`: a field error → `toFieldErrorState`, `notFound` → `notFound()`, form → `toFormState('ERROR', …, payload)`. Echo submitted strings as `payload` so values survive no-JS failures (FR-017).
  4. On success, `revalidatePath('/students')`, `revalidatePath('/families/[id]', 'page')`, then `redirect('/students')`.
- [ ] T035 [US1] Create `src/app/(private)/students/data.ts`, exporting `listStudents()` and `getStudent(id)`. Both use the server client to select students with `families(id, name, contact_name, contact_email, contact_phone)` and `student_tags(tags(id, name))`, mapped through `mappers.ts`. `getStudent` returns `null` when no row (another tutor's or missing). Only server modules import this file.
- [ ] T036 [US1] Create `src/app/(private)/students/family-picker.tsx` (`'use client'`) using `ComboboxField` (`name="familyId"`, label "Family", `data-testid="family-picker"`). It lists families as "Name (Contact name)" with `extraOption` "Add new family…" (`data-testid="family-picker-add-new"`), which opens `FamilyDialog`. `onCreated` appends the new family to local options and calls `setValue('familyId', id, { shouldValidate: true })`.
- [ ] T037 [US1] Create `src/app/(private)/students/student-form.tsx` (`'use client'`), using `useActionForm({ schema: studentSchema, action: saveStudent, defaultValues })`, `data-testid="student-form"`, and fields in this order:
  - `RadioGroupField` "Student type" (`data-testid="student-type"`, options Child/Adult, default `child`)
  - "First name"
  - `FamilyPicker` (child: required)
  - read-only `contact-details` block "Contact (from family)" when a family is selected (or "No contact details: add them to the family" linking to `/families/<id>`)
  - "Subject", "Level", "Exam board (optional)"
  - `TextareaField` "Notes (only you can see these)" with `maxLength={2000}`
  - hidden `id`, `FormMessage`, full-width "Save student" submit and a "Cancel" link to `/students`

  Props: `student?: StudentDetail` and `families: FamilyListItem[]`. Adult-only fields come in US2.

- [ ] T038 [US1] Create `src/app/(private)/students/new/page.tsx` (async Server Component) that loads `listFamilies()` and renders `<StudentForm families={…} />` in a mobile-first container (`max-w-xl`, `px-4`).
- [ ] T039 [US1] Create `src/app/(private)/students/[id]/page.tsx`, which awaits `params` (Promise) and calls `getStudent(id)`. If it's `null`, call `notFound()`. Otherwise render `<StudentForm student={…} families={…} />` (this also supports edits used later by US4).
- [ ] T040 [US1] Create `src/app/(private)/students/student-row.tsx` and `src/app/(private)/students/student-list.tsx`:
  - **Row:** a link to `/students/<id>` with `data-testid="student-row"`, showing `displayName`, a `Badge` "Child"/"Adult" (`data-testid="student-type-badge"`), the family name, and "subject · level".
  - **List:** a `<ul data-testid="student-list">`.

  Replace the placeholder in `src/app/(private)/students/page.tsx` with an async page calling `listStudents()` and rendering an "Add student" link to `/students/new` plus `StudentList`.

**Checkpoint**: US1 E2E and unit tests pass on chromium, firefox, webkit and mobile. A child with an inline family can be added and seen.

---

## Phase 4: User Story 2 - Add an adult student (Priority: P1)

**Goal**: Adults are added with a required last name and optional email, phone and family, and show their own contact details.

**Independent Test**: Add Daniel Hughes as an adult with his own email and phone and no family. He appears as an adult with his own contact details.

### Tests for User Story 2 (write first, they must fail)

- [ ] T041 [P] [US2] Add `test.describe('US2 add an adult')` to `e2e/students.spec.ts`, covering spec US2 AC1–AC4:
  - AC1: Daniel Hughes with email `daniel.hughes@example.test` and phone `+44 7700 900456` → row shows "Daniel Hughes" and badge "Adult".
  - AC2: blank last name → "Enter a last name." and no navigation.
  - AC3: email `dan@` → "Please enter a valid email address."
  - AC4: an adult linked to family Taylor (seeded) shows his own email in `contact-details`, not Sarah Taylor's.
- [ ] T042 [P] [US2] Extend `src/app/(private)/students/student-form.test.tsx`: selecting Adult reveals "Last name", "Email (optional)" and "Phone (optional)", and the family label reads "Family (optional)". Submitting without a last name shows "Enter a last name.".
- [ ] T043 [P] [US2] Extend `src/app/(private)/students/mappers.test.ts`: an adult's `displayName` is "Daniel Hughes", and `contact.source === 'student'` uses the student's own email and phone even when `familyId` is set.

### Implementation for User Story 2

- [ ] T044 [US2] Add the adult branch to `src/app/(private)/students/mappers.ts`: `displayName = first_name + ' ' + last_name`, and `contact` comes from the student's `email`/`phone` with `source: 'student'` (FR-010).
- [ ] T045 [US2] Update `src/app/(private)/students/student-form.tsx`. When `watch('type') === 'adult'`, render "Last name" (required), "Email (optional)" (`type="email"`) and "Phone (optional)" (`type="tel"`), and label the family picker "Family (optional)". The `contact-details` block shows the adult's own details. Keep these inputs unmounted for children, so `FormData` doesn't carry them.

**Checkpoint**: US1 and US2 both pass on their own.

---

## Phase 5: User Story 3 - View and find students (Priority: P1)

**Goal**: The list shows every student with type, family, subject/level and tags, sorted by first name, with search and a tag filter, plus empty and no-match states.

**Independent Test**: Seed 30 students with mixed tags. Searching by first name and by family name, and filtering by tag, each return exactly the matching students.

### Tests for User Story 3 (write first, they must fail)

- [ ] T046 [P] [US3] Write `src/app/(private)/students/filter.test.ts` for `filterAndSortStudents(items, { q, tagId })`:
  - sorts "Alice", "ben", "Chloe" case-insensitively by first name (FR-002)
  - `q: 'taylor'` matches family "Taylor" and a student whose name contains "Taylor", case-insensitively and partially (FR-003)
  - `tagId` keeps only tagged students (FR-004)
  - `q` and `tagId` combine
  - empty `q` returns everything
- [ ] T047 [P] [US3] Add `test.describe('US3 view and find')` to `e2e/students.spec.ts`, using `seed.ts` to create:
  - the families Taylor and Smith
  - students Alice, Ben and Chloe, plus 27 more
  - tags "Year 11" and "11+"

  It covers spec US3 AC1–AC4:
  - AC1: an empty account (fresh `tutor`) shows `student-list-empty` containing an "Add student" link.
  - AC2: row order is Alice, Ben, Chloe.
  - AC3: entering "taylor" in `student-search` and submitting shows only Taylor matches, and the URL contains `q=taylor`.
  - AC4: choosing "Year 11" in `tag-filter` shows only tagged rows. Clearing it restores all.

  Also: searching "zzz" shows `student-list-no-matches`.

### Implementation for User Story 3

- [ ] T048 [P] [US3] Create `src/app/(private)/students/filter.ts` with the pure `filterAndSortStudents(items: StudentListItem[], { q?: string; tagId?: string })`. It matches `q` against `displayName` and `familyName` with `toLocaleLowerCase('en-GB').includes(...)`, and sorts with `a.displayName.localeCompare(b.displayName, 'en-GB', { sensitivity: 'base' })`.
- [ ] T049 [P] [US3] Create `src/app/(private)/students/tags/data.ts` with `listTags()`: select `id, name, student_tags(count)`, returning `TagWithCount { id, name, studentCount }` sorted by name.
- [ ] T050 [P] [US3] Create `src/app/(private)/students/empty-state.tsx` with two exports:
  - `EmptyStudents` (`data-testid="student-list-empty"`): "No students yet" plus an "Add student" link to `/students/new`.
  - `NoMatches` (`data-testid="student-list-no-matches"`): "No students match" plus a "Clear search" link to `/students`.
- [ ] T051 [US3] Create `src/app/(private)/students/student-filters.tsx`: a `GET` `<form role="search">` with a labelled "Search students" input (`name="q"`, `data-testid="student-search"`) and a labelled "Filter by tag" native `<select name="tag">` (`data-testid="tag-filter"`) listing tags with an "All tags" option. Submit is a button labelled "Search". With JS, `onChange` on the select submits via `requestSubmit()`. It works without JS (R4).
- [ ] T052 [US3] Update `src/app/(private)/students/page.tsx`:
  1. Await `searchParams` (`q`, `tag`) and load `listStudents()` and `listTags()` in parallel with `Promise.all`.
  2. Apply `filterAndSortStudents`.
  3. Render `StudentFilters` (prefilled), `EmptyStudents` when the tutor has no students at all, `NoMatches` when the filter result is empty, or `StudentList`.
  4. Add a "Manage tags" link to `/students/tags`.
- [ ] T053 [US3] Update `src/app/(private)/students/student-row.tsx` to show tag `Badge`s (wrapping, small, `aria-label="Tags"` list). Make sure the row stays within 375px (`min-w-0`, `truncate` on the name, and tags wrapping below).

**Checkpoint**: US1–US3 pass, and the list is usable at 375px.

---

## Phase 6: User Story 4 - Edit a student (Priority: P1)

**Goal**: Tutors edit every field and switch type safely: Adult → Child confirms and deletes the adult-only values, and Child → Adult requires a last name. Cancel discards changes.

**Independent Test**: Edit a child's level, then switch an adult to a child. The changes persist and the adult-only fields are removed.

### Tests for User Story 4 (write first, they must fail)

- [ ] T054 [P] [US4] Add `test.describe('US4 edit a student')` to `e2e/students.spec.ts`, covering spec US4 AC1–AC4:
  - AC1: change a seeded child's level "Year 10" → "GCSE", and the list shows "GCSE".
  - AC2: seeded adult Daniel Hughes with an email and phone. Choose Child → `type-switch-confirm` appears. Confirm, pick Taylor and save. Reopening shows no Last name/Email/Phone, and `contact-details` shows Sarah Taylor. Verify via `adminClient` that `last_name`, `email` and `phone` are `null` (FR-013: deleted, not hidden).
  - AC3: switch a child to Adult. The family is kept, and saving without a last name shows "Enter a last name.".
  - AC4: edit the first name, click "Cancel", and the list still shows the old name.
- [ ] T055 [P] [US4] Extend `src/app/(private)/students/student-form.test.tsx`:
  - Switching Adult → Child when last name, email or phone hold values opens `type-switch-confirm` with the text "Last name, email and phone will be removed. A family is required."
  - "Cancel" keeps Adult and its values. "Remove and switch" sets Child and clears the values.
  - Switching when those fields are empty switches immediately.

### Implementation for User Story 4

- [ ] T056 [US4] Create `src/app/(private)/students/type-switch-confirm.tsx`, using shadcn `AlertDialog` (`data-testid="type-switch-confirm"`), title "Switch to child?", body "Last name, email and phone will be removed. A family is required.", actions "Cancel" and "Remove and switch".
- [ ] T057 [US4] Update `src/app/(private)/students/student-form.tsx`:
  - **Intercept type changes:** if Adult → Child and any of `lastName`/`email`/`phone` is non-empty, open `TypeSwitchConfirm`. On confirm, `setValue('type', 'child')` and `setValue` those fields to `''`. On cancel, leave everything unchanged.
  - **Child → Adult:** keep `familyId`.
  - **Edit mode** (`student` prop present): prefill `defaultValues` from `StudentDetail`, include the hidden `id`, and title the page "Edit student".
  - **Focus:** keep the default RHF `shouldFocusError` so focus moves to the first invalid field.
- [ ] T058 [US4] Update `src/app/(private)/students/actions.ts`. On update, also call `revalidatePath(`/students/${id}`)`. Make sure `P0002` from `save_student` calls `notFound()` (FR-026), and that a duplicate-name clash caused by an edit, type change or family change returns the `firstName` field error (FR-016).

**Checkpoint**: All P1 stories (US1–US4) are complete. This is the MVP.

---

## Phase 7: User Story 5 - Manage families (Priority: P2)

**Goal**: A families list where tutors add and edit families, see linked students, and delete only families with no students.

**Independent Test**: Create a family from the families list and edit its phone. Every linked child shows the new phone.

### Tests for User Story 5 (write first, they must fail)

- [ ] T059 [P] [US5] Write `e2e/families-tags.spec.ts` with `test.describe('US5 manage families')`, covering spec US5 AC1–AC4 and SC-004:
  - AC1: on `/families`, "Add family" Smith/"Jo Smith" → appears in `family-list`, then appears as an option in `family-picker` on `/students/new`.
  - AC2: family Taylor with seeded children Emily and Oliver → `family-students` lists both, and each link opens `/students/<id>`.
  - AC3: `family-delete` on Taylor shows "Move or remove this family's students first." and the family remains.
  - AC4: deleting an empty family after confirming removes it from the list.
  - SC-004: change Taylor's phone to `07700 900999`, and Emily's `contact-details` shows it.
- [ ] T060 [P] [US5] Write `src/app/(private)/families/family-form.test.tsx`: the labels render, required errors appear ("Enter a family name.", "Enter a contact name."), and with `intent="inline"` a mocked SUCCESS calls `onSaved` with the payload.

### Implementation for User Story 5

- [ ] T061 [US5] Add `getFamily(id)` to `src/app/(private)/families/data.ts`. It returns `FamilyDetail { id, name, contactName, contactEmail, contactPhone, students: { id, displayName, type }[] }`, or `null` when there's no row.
- [ ] T062 [US5] Add `deleteFamily(state, formData)` to `src/app/(private)/families/actions.ts`. It first counts students with `family_id = id`. If there are any, it returns `toFormState('ERROR', "Move or remove this family's students first.")` without attempting the delete (FR-022, R14). Otherwise it deletes by `id`, and a race-condition `23503` maps to the same message via `mapDbError`. On success, `revalidatePath('/families')` and `redirect('/families')`.
- [ ] T063 [P] [US5] Create `src/app/(private)/families/family-row.tsx` and `src/app/(private)/families/page.tsx`:
  - **Page:** an async page calling `listFamilies()` and rendering an "Add family" link to `/families/new`, a `<ul data-testid="family-list">` of `family-row` links (`data-testid="family-row"`) showing the name, contact name and "n students", and an empty state "No families yet".
  - **Mobile:** contents fit 375px.
- [ ] T064 [P] [US5] Create `src/app/(private)/families/new/page.tsx`, rendering `<FamilyForm />` in the same container as `students/new`.
- [ ] T065 [US5] Create `src/app/(private)/families/[id]/page.tsx`:
  - Await `params` and call `getFamily`. If it's `null`, call `notFound()`.
  - Render `<FamilyForm family={…} />` and a `<section data-testid="family-students">` heading "Students" listing linked students (links to `/students/<id>`).
  - Render a delete control (`data-testid="family-delete"`) as an `ActionForm` around `deleteFamily`, preceded by an `AlertDialog` "Delete this family?". Show `FormMessage` for the blocked case.

**Checkpoint**: US5 works on its own, and family edits show up immediately on linked children.

---

## Phase 8: User Story 6 - Manage tags (Priority: P2)

**Goal**: Tutors create tags while editing a student, assign any number of tags, and rename or delete tags across all students.

**Independent Test**: Create a tag while editing a student, rename it, then delete it. The rename shows on every tagged student and the delete removes it everywhere.

### Tests for User Story 6 (write first, they must fail)

- [ ] T066 [P] [US6] Add `test.describe('US6 manage tags')` to `e2e/families-tags.spec.ts`, covering spec US6 AC1–AC4:
  - AC1: on a student, type "Exam soon" in `tag-picker` and choose "Create 'Exam soon'". Save, and the row shows the tag.
  - AC2: seed "Yr 11" on 5 students. On `/students/tags`, rename it via `tag-rename` to "Year 11", and all 5 rows show "Year 11".
  - AC3: `tag-delete` on a tag used by 3 students and confirm. The tag disappears from `tag-list` and from those rows, and the students remain.
  - AC4: with "Online" existing, typing "online" and creating selects the existing "Online", and `tag-list` still has one "Online".

  Also: renaming to an existing name shows "You already have a tag with this name.".

- [ ] T067 [P] [US6] Write `src/app/(private)/students/tag-picker.test.tsx`, mocking `createTag`: choosing "Create 'Exam soon'" calls `createTag('Exam soon')` and adds the returned tag to the selection. Selected tags render hidden `tagIds` inputs. An `{ ok: false }` result shows the error text. The hint "For organising your list, e.g. Year 11. Don't add health or personal details." is visible and linked to the input with `aria-describedby` (FR-024).

### Implementation for User Story 6

- [ ] T068 [US6] Create `src/app/(private)/students/tags/actions.ts` (`'use server'`) with three actions:
  - **`createTag(name: string): Promise<{ ok: true; tag: { id: string; name: string } } | { ok: false; error: string }>`**: validates with `tagNameSchema`, then calls `supabase.rpc('create_tag', { p_name })`, which returns the new or existing tag without raising on a duplicate (US6 AC4, R14). Then it calls `revalidatePath('/students/tags')`.
  - **`renameTag(state, formData)`**: validates with `renameTagSchema` and calls `supabase.rpc('rename_tag', { p_id, p_name })`. A `tags_tutor_name_unique` error returns the `name` field error via `mapDbError`, then calls `revalidatePath('/students')` and `revalidatePath('/students/tags')`.
  - **`deleteTag(state, formData)`**: cascade removes the links (FR-025). Revalidates the same paths.
- [ ] T069 [US6] Create `src/app/(private)/students/tag-picker.tsx` (`'use client'`), using `ComboboxField` with `multiple`, `name="tagIds"`, label "Tags (optional)" and `data-testid="tag-picker"`. Options come from `listTags()` passed as props. `onCreate` calls `createTag` and appends the result to options and value. Selected tags show as removable chips with an accessible "Remove tag <name>" button. Under the field it shows the hint "For organising your list, e.g. Year 11. Don't add health or personal details.", linked with `aria-describedby` (FR-024, constitution IV).
- [ ] T070 [US6] Update `src/app/(private)/students/student-form.tsx` to render `<TagPicker tags={…} />` before Notes, prefilled from `student.tagIds`. Update `src/app/(private)/students/new/page.tsx` and `src/app/(private)/students/[id]/page.tsx` to load `listTags()` alongside families with `Promise.all`.
- [ ] T071 [US6] Create `src/app/(private)/students/tags/tag-row.tsx` (`'use client'`). It has `data-testid="tag-row"` and shows the name and "n students". A "Rename" button (`data-testid="tag-rename"`) switches to an inline `ActionForm` around `renameTag` with a "Tag name" field. A "Delete" button (`data-testid="tag-delete"`) opens an `AlertDialog` ("Delete '<name>'? It will be removed from n students.") that submits `deleteTag`.
- [ ] T072 [US6] Create `src/app/(private)/students/tags/page.tsx`, an async page calling `listTags()` that renders `<ul data-testid="tag-list">` of `TagRow`s, with an empty state "No tags yet: add them from a student's form".

**Checkpoint**: All six stories work on their own.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T073 [P] Write `e2e/isolation.spec.ts` (FR-026, SC-005). Tutor A (via `newTutor`) creates a student and a family. Tutor B, in a second context via `newTutor`, opens A's `/students/<id>` and `/families/<id>` and sees the not-found page. B's `/students` doesn't list A's student.
- [ ] T074 [P] Write `e2e/mobile-layout.spec.ts`. For `/students`, `/students/new`, `/students/<id>`, `/students/tags`, `/families`, `/families/new` and `/families/<id>`, assert `document.documentElement.scrollWidth - clientWidth <= 0`, using the same check as `e2e/auth.spec.ts` (FR-029, SC-006).
- [ ] T075 Add `@axe-core/playwright` as a devDependency (already justified in plan.md Complexity Tracking). Extend `e2e/mobile-layout.spec.ts` to run `new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()` on each route and expect no violations.
- [ ] T076 [P] Privacy audit (FR-015, FR-027, R14).
  - Run `grep -rn "console\." src/app/(private)/students src/app/(private)/families src/utils/db-errors.ts src/hooks/use-action-form.ts` and confirm the only logging is `mapDbError`'s `{ action, code }`.
  - Confirm no `payload` echo includes notes beyond the form's own round trip.
  - With the local stack, trigger a duplicate student name, reuse an existing tag, and rename a tag onto an existing name. Then run `docker logs supabase_db_mytutorhour 2>&1 | grep -i -E "emily|online"` and confirm there are no matches.
- [ ] T077 [P] Add the new commands to `CLAUDE.md` under Commands: `npx supabase start`, `npx supabase db reset`, `npx supabase test db` (pgTAP RLS tests) and `npx supabase gen types typescript --local > src/lib/supabase/database.types.ts`. Note that E2E needs the local stack and `SUPABASE_SECRET_KEY` in `.env.local` (test-only use).
- [ ] T078 Run every gate and fix any failures: `npm run lint`, `npm run check-types`, `npm run test:unitRun`, `npx supabase test db` and `npm run test:e2e` (all four projects).
- [ ] T079 Walk through [quickstart.md](./quickstart.md) at 375px (steps 1–9 and the privacy spot check), and time step 2 against SC-001 (< 90 s). For SC-006, complete the core flows (add child with new family, add adult, edit and switch type, manage tags) using only the keyboard, and again with VoiceOver (macOS Safari or iOS). Labels, errors, the family dialog, comboboxes and the confirm dialog must all be announced and operable.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: none.
- **Foundational (Phase 2)**: depends on Setup and blocks every story. T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 must run in that order (same migration, then generated types). T012–T022 can run in parallel after T010/T011. T023 needs T001 and T003. T024 needs T023. T025 needs T016 and T023 (it changes the field components and the fixture).
- **User stories (Phases 3–8)**: all depend on Phase 2.
- **Polish (Phase 9)**: after the stories you plan to ship.

### User story dependencies

- **US1 (P1)**: depends on Foundational only. It creates the shared `student-form.tsx`, `actions.ts`, `data.ts`, `mappers.ts` and the family form/dialog.
- **US2 (P1)**: needs US1's `student-form.tsx` and `mappers.ts` (it extends them).
- **US3 (P1)**: needs US1's list page and row. Its tests seed data directly, so they don't need US2 or US6.
- **US4 (P1)**: needs US1 (form, `[id]` page) and US2 (adult fields, so the Adult → Child switch exists).
- **US5 (P2)**: needs US1's `families/data.ts`, `actions.ts` and `family-form.tsx`. It is independent of US2–US4.
- **US6 (P2)**: needs US1's form and US3's `tags/data.ts` (`listTags`). It is independent of US4 and US5.

```text
Setup → Foundational → US1 ─┬→ US2 → US4
                            ├→ US3 → US6
                            └→ US5
                                    → Polish
```

### Within each story

Tests first (and failing) → pure modules and data → server actions → client components → pages.

---

## Parallel Examples

### Phase 2

```text
T012 students_rls.test.sql        T013 students_constraints.test.sql
T014 phoneSchema.ts               T015 db-errors.ts
T016 field components             T019 routes.ts
T021 families/schema.ts           T022 tags/schema.ts
T017 use-action-form.ts            T018 form-message.tsx
```

### User Story 1

```text
Tests:  T026 e2e/students.spec.ts   T027 student-form.test.tsx   T028 mappers.test.ts
Impl:   T029 mappers.ts             T030 families/data.ts
then:   T031 → T032 → T033 (families), T034 → T035 (students), then T036 → T037 → T038–T040
```

### After US1 (one developer each)

```text
US2 (T041–T045)    US3 (T046–T053)    US5 (T059–T065)
```

---

## Implementation Strategy

### MVP first

1. Phase 1 Setup → Phase 2 Foundational (checkpoint: pgTAP and unit tests green).
2. Phase 3 US1 → **stop and validate** (adding a child with a family works end-to-end).
3. US2 → US3 → US4 complete the P1 MVP: a usable student list for children and adults.

### Incremental delivery

4. US5 (families screen) and US6 (tags) are P2 additions and can ship independently.
5. Phase 9 hardens isolation, the mobile layout, accessibility and privacy before merging to `main`.

---

## Notes

- `[P]` = different files with no unfinished dependencies. Tasks on the same file (`student-form.tsx`, the migration, `actions.ts`) are sequential.
- Commit after each task or logical group, with commit messages ending in the attribution lines.
- Stop at any checkpoint to validate a story on its own.
