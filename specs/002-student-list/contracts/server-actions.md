# Contract: Server Actions

All actions are `'use server'` functions that use `createClient()` from
`src/lib/supabase/server.ts`, so RLS applies under the signed-in tutor. Form actions have the
`useActionForm` signature `(state: ActionState, formData: FormData) => Promise<ActionState>`
(`src/utils/form.ts`). They validate with the same Zod schema as the client, and never log
payloads (FR-027).

On success they call `revalidatePath` on the affected routes and then `redirect` (Next 16
`07-mutating-data.md`), unless noted otherwise.

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

## Families: `src/app/(private)/families/actions.ts`

### `saveFamily(state, formData)`

Keys: `id?`, `name`, `contactName`, `contactEmail`, `contactPhone`, `returnTo?`.

- **From the families screens**: redirects to `/families/[id]`.
- **From the inline dialog** (`intent=inline`): **does not redirect**. It returns `SUCCESS` with `payload: { id, name, contactName }` so the student form can auto-select the new family (FR-018).

### `deleteFamily(state, formData)`

Key: `id`. If students are still linked, the DB returns `23503` and the action returns `ERROR`
"Move or remove this family's students first." (FR-022). On success it redirects to `/families`.

## Tags: `src/app/(private)/students/tags/actions.ts`

### `createTag(name: string): Promise<{ ok: true; tag: { id: string; name: string } } | { ok: false; error: string }>`

This is a plain async action called from the tag combobox, not a form action. It does an insert,
and on `23505` it selects and returns the existing tag that matches case-insensitively
(US6 AC4). It has no redirect.

### `renameTag(state, formData)`

Keys: `id`, `name`. On `23505` it returns a field error on `name`. It revalidates `/students` and `/students/tags`.

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
