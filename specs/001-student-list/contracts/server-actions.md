# Contract: Server Actions

All actions are `'use server'` functions that use `createClient()` from
`src/lib/supabase/server.ts`, so RLS applies under the signed-in tutor. Form actions have the
`useActionForm` signature `(state: ActionState, formData: FormData) => Promise<ActionState>`
(`src/utils/form.ts`). They validate with the same Zod schema as the client, and never log
payloads (FR-027).

On success they call `revalidatePath` on the affected routes and then `redirect` (Next 16
`07-mutating-data.md`), unless noted otherwise. Database errors are mapped by `mapDbError` in `src/utils/db-errors.ts`.

## Students: `src/app/(private)/students/actions.ts`

### `saveStudent(state, formData)`

| FormData key                                                                        | Notes                                                    |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `id`                                                                                | hidden; absent when creating                             |
| `type`                                                                              | `adult` \| `child`                                       |
| `firstName`, `lastName`, `subject`, `level`, `examBoard`, `notes`, `email`, `phone` | strings; `lastName`/`email`/`phone` ignored for children |
| `familyId`                                                                          | uuid or empty                                            |
| `tagIds`                                                                            | repeated key, uuid each                                  |

- **Success**: calls `rpc('save_student')`, then `revalidatePath('/students')`, `revalidatePath('/families/[id]', 'page')`, and `redirect('/students')`.
- **Validation error**: returns `ERROR` with `fieldErrors` (Zod tree) and `payload` (the submitted strings).
- **Duplicate name**: returns `ERROR` with `fieldErrors.properties.firstName` (see data-model error mapping).
- **Not found (`P0002`)**: `notFound()`.

### `saveStudentNotes(state, formData)`: `src/components/form-student-notes/actions.ts`

Keys: `id` (uuid), `notes` (string, up to 2,000 characters; blank clears the notes). Used by the
"View/edit notes" dialog in the student list (FR-030).

- **Success**: updates only `students.notes`, calls `revalidatePath('/students', 'layout')`, and
  **does not redirect**. It returns `SUCCESS` so the dialog can close.
- **Validation error**: returns `ERROR` with `fieldErrors` and `payload`.
- **Not found** (no row updated, i.e. missing or another tutor's): `notFound()`.

## Families: `src/app/(private)/families/actions.ts`

### `saveFamily(state, formData)`

Keys: `id?`, `name`, `contactName`, `contactEmail`, `contactPhone`, `intent?` (`inline`).

- **From the families screens**: redirects to `/families/[id]`.
- **From the inline dialog** (`intent=inline`): **does not redirect**. It returns `SUCCESS` with `payload: { id, name, contactName }` so the student form can auto-select the new family (FR-018).

### `deleteFamily(state, formData)`

Key: `id`. It counts linked students first. If there are any, it returns `ERROR` "Move or remove
this family's students first." without attempting the delete (FR-022). `ON DELETE NO ACTION`
(`23503`) is the backstop for races and maps to the same message. On success it redirects to
`/families`.

## Tags: `src/app/(private)/students/tags/actions.ts`

### `createTag(name: string): Promise<{ ok: true; tag: { id: string; name: string } } | { ok: false; error: string }>`

This is a plain async action called from the tag combobox, not a form action. It validates with
`tagNameSchema`, then calls `rpc('create_tag', { p_name })`, which returns the new tag or the
existing case-insensitive match without raising a database error (US6 AC4, research R14). It
revalidates `/students/tags` and has no redirect.

### `renameTag(state, formData)`

Keys: `id`, `name`. It calls `rpc('rename_tag', { p_id, p_name })`. A `tags_tutor_name_unique` error (raised by the function without values) returns a field error on `name`. It revalidates `/students` and `/students/tags`.

### `deleteTag(state, formData)`

Key: `id`. Links cascade away (FR-025). It revalidates `/students` and `/students/tags`.

## Data loaders (server-only, colocated `data.ts`)

| Function         | Returns                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `listStudents()` | `StudentListItem[]`: id, type, displayName, familyId, familyName, subject, level, tags[] |
| `getStudent(id)` | `StudentDetail \| null`: all fields plus family contact and tags; null → `notFound()`    |
| `listFamilies()` | `FamilyListItem[]`: id, name, contactName, studentCount                                  |
| `getFamily(id)`  | `FamilyDetail \| null`: contact details plus students                                    |
| `listTags()`     | `TagWithCount[]`: id, name, studentCount                                                 |

`filterAndSortStudents(items, { q, tagId })` is a pure function in `students/filter.ts` (R4).
