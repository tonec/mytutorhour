# Quickstart: Validate the Student List

This guide checks that the feature works end-to-end. The schema is in
[data-model.md](./data-model.md), the actions and routes are in [contracts/](./contracts/), and the
acceptance scenarios are in [spec.md](./spec.md).

## Prerequisites

- Docker running (for the local Supabase stack).
- `.env.local` points at the **local** stack (`NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`, plus the local publishable key).
- For E2E only: `SUPABASE_SECRET_KEY` is set in the shell or a test-only env file. The Playwright `tutor` fixture reads it to create and delete throwaway users. It is never imported by app code.

## Set up

```bash
npx supabase start                 # local Postgres + Auth
npx supabase db reset              # apply all migrations (incl. students/families/tags)
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
npm run dev
```

## Automated checks (all must pass before merge)

```bash
npm run lint
npm run check-types
npm run test:unitRun               # schemas, filterAndSortStudents, error mapping, StudentForm
npx supabase test db               # pgTAP: RLS isolation, composite FKs, checks, unique name, family delete, account cascade
npm run test:e2e                   # chromium, firefox, webkit, mobile (375px)
```

Expected: every suite is green. `supabase test db` reports every RLS test as `ok`.

## Manual walkthrough (phone width, 375px)

Sign up or log in, then:

1. **Empty state**: `/students` shows "Add student" (US3 AC1).
2. **Child and new family** (US1 AC1, SC-001): choose Add student → Child, first name "Emily", subject "Maths", level "GCSE". In Family choose "Add new family…" and enter family "Taylor", contact "Sarah Taylor", an email and a phone number, then save the dialog. Taylor is now selected. Save the student. Emily appears as a child in the Taylor family. Opening her record shows Sarah Taylor's email and phone under "Contact (from family)". Time the whole flow: it should take under 90 seconds.
3. **Duplicate name** (US1 AC5): add another child "emily" to Taylor. An inline error appears on First name. Change it to "Emily T" and the save succeeds.
4. **Adult** (US2): add an adult "Daniel" and leave the last name blank. Saving is blocked on Last name. Enter "Hughes", email "dan@" → email error. Fix the email and save. The list shows "Daniel Hughes" as an adult.
5. **Type switch** (US4 AC2/AC3): edit Daniel and switch to Child. The confirm dialog appears. Confirm, pick Taylor and save. Reopen him: there is no last name, email or phone, and the family contact is shown. Switch back to Adult. Saving is blocked until a last name is entered.
6. **Family edit** (US5, SC-004): on `/families/<Taylor>`, change the phone and save. Every Taylor child shows the new phone. Delete is blocked with "Move or remove this family's students first."
7. **Tags** (US6): on a student, type "Yr 11" and create it. Type "yr 11" again and the existing tag is reused. On `/students/tags`, rename it to "Year 11", and the list rows update. Filter `/students` by "Year 11". Delete the tag and it disappears from every student.
8. **Search** (US3 AC3): search "taylor" to show the Taylor-family students. "zzz" shows the no-matches state.
9. **Isolation** (FR-026): in a second browser, sign in as another tutor and open the first tutor's `/students/<id>` URL. It shows "not found".

## Privacy spot check (FR-015, FR-027)

While doing steps 2–7, watch the dev-server terminal and the browser console. No student name,
contact detail, note or tag should be printed. Force an error (for example, stop Supabase and then
save): the log line contains only the action name and error code.
