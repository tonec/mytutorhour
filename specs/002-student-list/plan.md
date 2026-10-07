# Implementation Plan: Student List

**Branch**: `002-student-list` | **Date**: 2026-10-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-student-list/spec.md`

## Summary

Tutors can list, search, filter, add and edit students. A student is either an adult (first and
last name, own email and phone, optional family) or a child (first name only, family required,
contact details taken from the family). The feature also adds family management and tutor-owned
tags.

Postgres enforces the rules, with Zod mirroring them for instant inline errors:

- **Isolation:** RLS plus composite foreign keys.
- **Adult/child shape:** check constraints.
- **Duplicate names:** two students in the same family can't share a name (unique index).
- **Family delete:** blocked while students remain (`ON DELETE RESTRICT`).

A student and their tags are saved atomically through one `security invoker` function. The UI
reuses the existing `useActionForm`/`ActionForm` server-action pattern, with Base UI Combobox,
RadioGroup and AlertDialog added through shadcn wrappers.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19.2, Next.js 16.3 App Router

**Primary Dependencies**: `@supabase/ssr`, `react-hook-form` + `@hookform/resolvers`, `zod` 4, `@base-ui/react` (shadcn `base-vega` style), `lucide-react`. No new runtime dependencies (R5, R6).

**Storage**: Supabase Postgres 17. There are four new tables (`families`, `students`, `tags`, `student_tags`), one enum, one RPC and one trigger function, all in a single migration. No file storage.

**Testing**: Vitest + RTL (unit/component), pgTAP via `npx supabase test db` (RLS/constraints), and Playwright (chromium, firefox, webkit, mobile 375px) against local Supabase with a fresh-tutor fixture (R13).

**Target Platform**: Mobile-first web, hosted on Cloudflare via vinext

**Project Type**: Web application (single Next.js project, Server Components + Server Actions)

**Performance Goals**: The student list renders on first load with no client fetch. Search and filter responses feel instant for up to 50 students (SC-002). Adding a child with a new family takes under 90 seconds (SC-001).

**Constraints**:

- Usable at 375px and meets WCAG 2.2 AA (FR-029).
- No student data in logs (FR-027).
- Children have no surname, email or phone (FR-028).
- Forms work without JS (existing pattern).

**Scale/Scope**: 10–50 students per tutor (a few hundred at most), 7 routes, 4 tables

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

| Principle                               | Status | How                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Tutor approval gates parent messages | ✅ N/A | No parent-facing messages are generated or sent in this feature.                                                                                                                                                                                                                                                                                                                                                                                  |
| II. Private notes stay private          | ✅     | Student notes are tutor-only (FR-015). They are never logged, never in analytics, and this feature never passes them to the LLM (R10).                                                                                                                                                                                                                                                                                                            |
| III. Grounded, validated AI output      | ✅ N/A | No AI in this feature.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| IV. Children's data privacy             | ✅     | <ul><li>Children: first name only, with no email or phone of their own. This is enforced by a check constraint and by `save_student` nulling the fields.</li><li>RLS `(select auth.uid()) = tutor_id` on all four tables, plus composite FKs.</li><li>`on delete cascade` from `auth.users`.</li><li>No student data in logs.</li><li>Adults have a required surname and optional own email and phone, which constitution 1.2.1 allows.</li></ul> |
| V. Under two minutes, mobile-first      | ✅     | 375px E2E project, WCAG 2.2 AA labels and errors, inline family creation (SC-001).                                                                                                                                                                                                                                                                                                                                                                |
| VI. Solo-first simplicity               | ✅     | No new runtime dependencies, one RPC, no org/roles. Families and tags are needed by the spec and are not MVP non-goals.                                                                                                                                                                                                                                                                                                                           |
| Quality gates                           | ✅     | Every table's RLS is in the same migration. pgTAP covers RLS and constraints. Unit tests follow AAA. E2E covers core flows on all 4 projects.                                                                                                                                                                                                                                                                                                     |

**Post-design re-check (after Phase 1)**: still passes. The data model adds no stored fields for
children beyond the spec. `save_student` is `security invoker`, so RLS still applies. No gate
failures.

## Project Structure

### Documentation (this feature)

```text
specs/002-student-list/
├── plan.md              # This file
├── research.md          # Phase 0 decisions (R1–R13)
├── data-model.md        # Tables, constraints, RPC, error mapping
├── quickstart.md        # Validation guide
├── contracts/
│   ├── server-actions.md
│   └── ui-routes.md     # routes, data-testids, labels
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks, not created here)
```

### Source Code (repository root)

```text
supabase/
├── migrations/<timestamp>_students_families_tags.sql   # enum, 4 tables, RLS, indexes, trigger, save_student
└── tests/database/
    ├── students_rls.test.sql                           # pgTAP: isolation for all 4 tables, composite FKs
    └── students_constraints.test.sql                   # child/adult checks, duplicate name, RESTRICT, tag uniqueness

src/
├── lib/supabase/
│   ├── database.types.ts        # generated (R9)
│   ├── server.ts                # createServerClient<Database>
│   └── client.ts                # createBrowserClient<Database>
├── config/routes.ts             # + studentNew, studentTags, familyNew; prefix fallback in getTitleByUrl
├── schema/phoneSchema.ts (+ .test.ts)                  # R5, shared by students and families
├── components/ui/
│   ├── combobox.tsx, radio-group.tsx, alert-dialog.tsx, badge.tsx   # shadcn add (Base UI)
│   ├── textarea-field.tsx, radio-group-field.tsx, combobox-field.tsx  # FormField siblings (R8)
└── app/(private)/
    ├── students/
    │   ├── page.tsx             # list + search/filter (searchParams)
    │   ├── data.ts              # listStudents, getStudent, mappers
    │   ├── filter.ts (+ .test.ts)
    │   ├── schema.ts (+ .test.ts)
    │   ├── errors.ts (+ .test.ts)
    │   ├── actions.ts           # saveStudent
    │   ├── student-form.tsx (+ .test.tsx)   # type toggle, confirm dialog, family + tag pickers
    │   ├── student-list.tsx, student-row.tsx, empty-state.tsx
    │   ├── new/page.tsx
    │   ├── [id]/page.tsx
    │   └── tags/{page.tsx, actions.ts, data.ts, tag-row.tsx}
    └── families/
        ├── page.tsx, data.ts, schema.ts (+ .test.ts), actions.ts
        ├── family-form.tsx      # used by pages and the inline dialog
        ├── family-dialog.tsx
        ├── new/page.tsx
        └── [id]/page.tsx

e2e/
├── fixtures/tutor.ts            # fresh confirmed tutor per test via the Admin API; signs in; cleanup
├── students.spec.ts             # US1–US4, duplicate name, isolation, 375px overflow
└── families-tags.spec.ts        # US5, US6
```

**Structure Decision**: This stays a single Next.js project. Feature code is colocated under
`src/app/(private)/students` and `families`, following the existing `(auth)/signup` layout
(`schema.ts`, `actions.ts`, `*-form.tsx`, `page.tsx`). Shared UI primitives go in
`src/components/ui`, and shared Zod pieces go in `src/schema`.

## Implementation Notes

- **Next.js 16**: `params` and `searchParams` are Promises (await them). Mutations use `revalidatePath` then `redirect` (`node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`). `cacheComponents` is off.
- **Inline family dialog**: it renders its own `ActionForm` inside a portal (not nested in the student form). On `SUCCESS` it reads `payload.id` and sets the student form's `familyId`.
- **Type switch**: driven by RHF `watch('type')`. The Adult → Child confirm uses `AlertDialog`. On confirm, call `setValue` to clear `lastName`/`email`/`phone`.
- **Tag picker**: calls the `createTag` action directly. It holds the selected ids in RHF and submits them as repeated `tagIds` hidden inputs.
- **Migrations**: the unused `stars` migration was removed (it had never been applied to the remote project), so this feature's migration is the first one.
- **Spec 001**: `families` replaces spec 001's Guardian (R12). Spec 001 was amended on 2026-10-07.

## Complexity Tracking

| Deviation                        | Why Needed                                       | Simpler Alternative Rejected Because                 |
| -------------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| Database function `save_student` | Student and tag links must save atomically (R2). | Several supabase-js calls can't share a transaction. |
