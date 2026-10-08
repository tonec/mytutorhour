# Contract: Routes and UI

All routes sit under `src/app/(private)/`, which already requires sign-in via `src/proxy.ts`. Every
page is usable at 375px with no horizontal scroll and meets WCAG 2.2 AA (FR-029). Primary actions
are full-width at the bottom on mobile.

| Route               | Purpose                                                                   | Spec            |
| ------------------- | ------------------------------------------------------------------------- | --------------- |
| `/students?q=&tag=` | Student list, search (GET form), tag filter, "Add student", "Manage tags" | US3, FR-001–005 |
| `/students/new`     | Student form (create)                                                     | US1, US2        |
| `/students/[id]`    | Student form (edit), prefilled; shows the derived contact details         | US4             |
| `/students/tags`    | Tag list with counts; rename and delete                                   | US6             |
| `/families`         | Families list (alphabetical) and "Add family"                             | US5, FR-020     |
| `/families/new`     | Family form                                                               | FR-018          |
| `/families/[id]`    | Family edit form, linked students list, delete                            | US5, FR-021–022 |

An id belonging to another tutor, or one that doesn't exist, renders `notFound()` (FR-026).

`src/config/routes.ts` gains `studentNew`, `studentTags` and `familyNew`. `getTitleByUrl` falls back
to the longest matching route prefix, so `/students/<id>` gets the heading "Students".

## Test IDs (E2E selectors, CLAUDE.md priority `data-testid` > role > text)

| data-testid                                                                    | Element                                                                            |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `student-list`                                                                 | list container                                                                     |
| `student-row`                                                                  | each student row (contains name, type badge, family, subject/level, tags)          |
| `student-type-badge`                                                           | "Adult" / "Child" badge in a row                                                   |
| `student-list-empty`                                                           | empty state ("Add student" action inside)                                          |
| `student-list-no-matches`                                                      | no-matches state                                                                   |
| `student-search`                                                               | search input                                                                       |
| `tag-filter`                                                                   | tag filter control                                                                 |
| `student-form`                                                                 | student `<form>`                                                                   |
| `student-type`                                                                 | adult/child radio group                                                            |
| `family-picker`                                                                | family combobox                                                                    |
| `family-picker-add-new`                                                        | "Add new family…" option                                                           |
| `family-dialog`                                                                | inline family dialog                                                               |
| `tag-picker`                                                                   | tags combobox                                                                      |
| `contact-details`                                                              | read-only contact block on a child (family details / "No contact details" message) |
| `student-actions`                                                              | actions menu button in a row ("Edit student", "View/edit notes", copy contact)     |
| `student-notes-dialog`                                                         | "View/edit notes" dialog opened from a row (FR-030)                                |
| `type-switch-confirm`                                                          | adult → child confirmation dialog                                                  |
| `family-list`, `family-row`, `family-form`, `family-students`, `family-delete` | family screens                                                                     |
| `tag-list`, `tag-row`, `tag-rename`, `tag-delete`                              | tag management                                                                     |

## Form field labels (also used by role/label selectors)

| Field                       | Label                                                                                                   | Shown when          |
| --------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------- |
| Type                        | "Adult" / "Child" radios, group label "Student type"                                                    | always              |
| First name                  | "First name"                                                                                            | always              |
| Last name                   | "Last name"                                                                                             | adult               |
| Family                      | "Family" (child: required; adult: "(optional)")                                                         | always              |
| Subject                     | "Subject"                                                                                               | always              |
| Level                       | "Level"                                                                                                 | always              |
| Exam board                  | "Exam board (optional)"                                                                                 | always              |
| Email / Phone               | "Email (optional)" / "Phone (optional)"                                                                 | adult               |
| Contact details (read-only) | "Contact (from family)"                                                                                 | child with a family |
| Tags                        | "Tags (optional)", hint "For organising your list, e.g. Year 11. Don't add health or personal details." | always              |
| Notes                       | "Notes (only you can see these)" with a live character count `n/2000`                                   | always              |

Error messages are linked to their inputs with `aria-describedby` and `aria-invalid`, and form-level
messages use `FormMessage` (`role="alert"`). On a failed submit, focus moves to the first invalid
field.
This applies to errors found in the browser and to field errors returned by the server, such as a
duplicate name (research R15).
