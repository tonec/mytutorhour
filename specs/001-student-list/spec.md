# Feature Specification: Student List

**Feature Branch**: `001-student-list`
**Created**: 2026-10-07
**Status**: Draft
**Input**: User description: "student list so that a tutor can add and edit students. The information required is whether they are an adult or a child. Name (first name only if child), family (this will link to a seperate family table in the db), notes, tags (user editable from tags table), email if adult (if child this will come from family), phone if adult otherwise family."

## Clarifications

### Session 2026-10-07

- Q: Does this feature include creating and editing families? → A: Yes. It includes full family management (a families list where families are added, edited and viewed) and creating a family from the student form.
- Q: Do students keep subject and level? → A: Yes. Subject and level are required and exam board is optional, as in spec 002. Tags are extra.
- Q: What name is recorded for adults? → A: First name and last name are both required. Children are first name only.
- Q: What happens if two students in the same family have the same name? → A: Saving is blocked. The tutor must adjust a name so the students can be told apart.

### Session 2026-10-08

- Q: Are a student's notes shown in the student list? → A: No. Notes aren't a list column. Each row's actions menu has a "View/edit notes" option that opens a dialog where the tutor reads and edits the notes in place, without leaving the list.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Add a child student with their family (Priority: P1)

A tutor takes on a new child. On their phone they add the student as a child with a first name,
subject and level. They then pick the child's family or create a new one on the spot with a
contact name, email and phone. The child's contact details come from the family, so the tutor
never types them twice.

**Why this priority**: Most students of solo UK tutors are children. Lesson logging (spec 002)
needs a student to exist first.

**Independent Test**: With an empty account, add a child and create a new family from the student
form. Confirm the child appears in the list with the family's email and phone shown as their
contact details.

**Acceptance Scenarios**:

1. **Given** a tutor with no students, **When** they add a child "Emily" (GCSE, Maths) and create the family "Taylor" with contact "Sarah Taylor", an email and a phone number, **Then** Emily appears in the student list labelled as a child in the Taylor family, **And** her contact details show Sarah Taylor's email and phone.
2. **Given** the student type is "Child", **Then** the form has no last-name, email or phone fields for the student, **And** a family is required before saving.
3. **Given** an existing family "Taylor", **When** the tutor adds a second child "Oliver" and picks Taylor, **Then** both children show the same family contact details.
4. **Given** a child's family has its email changed, **When** the tutor views the child, **Then** the child shows the new email without being edited.
5. **Given** the Taylor family already has a child "Emily", **When** the tutor adds another child "emily" to the Taylor family, **Then** saving is blocked with an inline error on the first-name field, **And** after the tutor changes the name to "Emily T" the student saves.

---

### User Story 2 - Add an adult student (Priority: P1)

A tutor teaches an adult learner. They add the student as an adult with a first name, last
name, subject, level and the adult's own email and phone. Adding them to a family is optional.

**Why this priority**: Adult learners (for example, adults studying for a GCSE resit or a language)
are a real segment and must be supported from day one.

**Independent Test**: Add an adult with their own email and phone and no family. Confirm they
appear in the list with their own contact details.

**Acceptance Scenarios**:

1. **Given** the student type is "Adult", **When** the tutor enters "Daniel", "Hughes", subject, level, email and phone and saves, **Then** Daniel Hughes appears in the list labelled as an adult with his own contact details.
2. **Given** the student type is "Adult" and the last name is blank, **When** the tutor saves, **Then** the form shows an inline error on the last-name field and nothing is saved.
3. **Given** an invalid email such as "dan@", **When** the tutor saves, **Then** the form shows an inline error on the email field and nothing is saved.
4. **Given** an adult linked to a family, **Then** their own email and phone are shown, not the family's.

---

### User Story 3 - View and find students (Priority: P1)

The tutor opens the student list and sees every student at a glance with name, adult/child, family,
subject/level and tags. They can search by name or family and filter by tag.

**Why this priority**: The list is the entry point for every student-related action, including
starting a lesson note.

**Independent Test**: Seed 30 students with mixed tags. Confirm search by first name and by family
name, and filtering by a tag, each return exactly the matching students.

**Acceptance Scenarios**:

1. **Given** a tutor with no students, **When** they open the list, **Then** they see an empty state with an "Add student" action.
2. **Given** students "Alice", "Ben" and "Chloe", **When** the list loads, **Then** they are sorted alphabetically by first name.
3. **Given** students in families "Taylor" and "Smith", **When** the tutor searches "taylor", **Then** only Taylor-family students and students whose name matches are shown (case-insensitive).
4. **Given** students tagged "Year 11" and "11+", **When** the tutor filters by "Year 11", **Then** only students with that tag are shown.

---

### User Story 4 - Edit a student (Priority: P1)

The tutor updates a student's details: name, subject/level, family, notes, tags or contact details.
They can also correct the adult/child type.

**Why this priority**: Details change over time (new level, family email changes, wrong type
chosen), and an uneditable record has to be deleted and recreated.

**Independent Test**: Edit a child's level and tags, then switch an adult to a child. Confirm the
changes persist and the adult-only fields are removed.

**Acceptance Scenarios**:

1. **Given** a child, **When** the tutor changes the level from "Year 10" to "GCSE" and saves, **Then** the list shows "GCSE".
2. **Given** an adult with a last name, email and phone, **When** the tutor switches the type to "Child", **Then** they are warned that the last name, email and phone will be removed and that a family is required, **And** on confirm those values are removed and the student uses the family's contact details.
3. **Given** a child, **When** switched to "Adult", **Then** the family link is kept (optional) and empty email, phone and last-name fields appear, **And** the student can't be saved until a last name is entered.
4. **Given** the tutor edits and then cancels, **Then** no changes are saved.
5. **Given** a student with notes, **When** the tutor chooses "View/edit notes" from the student's actions in the list, **Then** a dialog shows the notes, **And** saving updates only the notes and closes the dialog, **And** cancelling discards the changes.

---

### User Story 5 - Manage families (Priority: P2)

The tutor opens a families list. They can add a family, edit its name and contact details, and
see which students belong to it.

**Why this priority**: Families are usually created from the student form (US1). A dedicated
screen matters once a tutor has siblings or a changed parent phone number.

**Independent Test**: Create a family from the families list, edit its phone, and confirm every
linked child shows the new phone.

**Acceptance Scenarios**:

1. **Given** the families list, **When** the tutor adds family "Smith" with contact "Jo Smith", **Then** it appears in the list and can be picked on the student form.
2. **Given** a family with two children, **When** the tutor opens it, **Then** both children are listed and each opens their student record.
3. **Given** a family with linked students, **When** the tutor tries to delete it, **Then** deletion is blocked with a message to move or remove those students first.
4. **Given** a family with no students, **When** the tutor deletes it and confirms, **Then** it is permanently removed.

---

### User Story 6 - Manage tags (Priority: P2)

The tutor creates their own tags (for example "Year 11", "11+", "Exam soon", "Online") and assigns
any number to a student. They can rename or delete a tag.

**Why this priority**: Tags make the list scannable and filterable but aren't needed to add or
teach a student.

**Independent Test**: Create a tag while editing a student, rename it, then delete it. Confirm the
rename shows on every tagged student and the delete removes it from all of them.

**Acceptance Scenarios**:

1. **Given** the student form, **When** the tutor types a tag name that doesn't exist and confirms, **Then** the tag is created and assigned.
2. **Given** a tag "Yr 11" on 5 students, **When** renamed to "Year 11", **Then** all 5 students show "Year 11".
3. **Given** a tag on 3 students, **When** the tutor deletes it and confirms, **Then** it is removed from all 3 students, **And** the students themselves are unchanged.
4. **Given** an existing tag "Online", **When** the tutor tries to create "online", **Then** the existing tag is used instead of creating a duplicate.

---

### Edge Cases

- A child is saved without a family → blocked with an inline error on the family field.
- A child's family has no email or phone → the child is saved, and their record shows "No contact details: add them to the family" linking to the family.
- Two students in the same family would have the same name (e.g. twins both entered as "Emily") → saving is blocked with an inline error on the name field asking the tutor to make the names distinguishable (e.g. "Emily T"). This applies when adding, editing, or moving a student to another family.
- A tutor's tag name is blank, whitespace only or over 30 characters → rejected with an inline message.
- Notes exceed 2,000 characters → a character count is shown and input beyond the limit is blocked.
- A save fails because of a network error → the form keeps the entered values and offers retry.
- Two tabs edit the same student → last save wins (acceptable for a single tutor).
- A tutor opens a link to another tutor's student or family → shown as not found, with nothing revealed.

## Requirements _(mandatory)_

### Student list

- **FR-001**: The system MUST show the tutor a list of all their students with first name (plus last name for adults), adult/child indicator, family name (if any), subject, level and tags. Notes MUST NOT be shown in the list (see FR-030).
- **FR-002**: The list MUST be sorted alphabetically by first name, case-insensitive.
- **FR-003**: Tutors MUST be able to search the list by student name or family name (case-insensitive, partial match).
- **FR-004**: Tutors MUST be able to filter the list by one tag at a time and clear the filter.
- **FR-005**: The list MUST show an empty state with an "Add student" action when the tutor has no students, and a "no matches" state when a search or filter returns nothing.
- **FR-030**: Each student in the list MUST have a "View/edit notes" action that opens a dialog showing the student's notes in an editable field (with the FR-015 limit and character count). Saving MUST update only the notes and keep the tutor on the list, and cancelling MUST discard the changes (FR-017).

### Adding and editing students

- **FR-006**: Tutors MUST be able to add a student by choosing a type (Adult or Child, required) and entering a first name (required), subject (required) and level (required). Exam board, notes and tags are optional.
- **FR-007**: For a **child**, the system MUST NOT collect or store a last name, email or phone on the student, and MUST require a linked family.
- **FR-008**: For a child, the email and phone shown MUST be the linked family's current contact email and phone (read-only on the student, editable via the family).
- **FR-009**: For an **adult**, the system MUST require a last name and allow an optional email and an optional phone stored on the student. A family link is optional.
- **FR-010**: For an adult, the email and phone shown MUST be the adult's own, even when linked to a family.
- **FR-011**: Email addresses MUST be validated for format and phone numbers MUST accept UK and international formats. Invalid values block saving with an inline field error.
- **FR-012**: Tutors MUST be able to edit every student field after creation.
- **FR-013**: Changing a student from Adult to Child MUST warn that the last name, email and phone will be removed and require a family. On confirm those values MUST be deleted, not hidden.
- **FR-014**: Changing a student from Child to Adult MUST keep the family link and present empty last name, email and phone fields. The change MUST NOT be saved until a last name is entered.
- **FR-015**: Notes MUST be free text up to 2,000 characters, visible only to the tutor, and MUST NOT appear in parent updates, emails, copied text, analytics events or logs.
- **FR-016**: Two students in the same family MUST NOT share a name. Children are compared on first name and adults on first and last name, case-insensitive with surrounding whitespace ignored. A save that would create a clash (on add, edit, type change or a change of family) MUST be blocked with an inline error on the name field.
- **FR-017**: Cancelling an add or edit MUST discard unsaved changes, and a failed save MUST keep the entered values and offer retry.

### Families

- **FR-018**: Tutors MUST be able to create a family either from the student form (inline, then auto-selected) or from a families list.
- **FR-019**: A family MUST have a name (required) and a contact name (required), and MAY have a contact email and phone (optional, validated as in FR-011).
- **FR-020**: Tutors MUST be able to view a families list (sorted alphabetically) and a family's detail showing its contact details and linked students.
- **FR-021**: Tutors MUST be able to edit a family's name and contact details, and changes MUST be reflected immediately on every linked child.
- **FR-022**: Deleting a family MUST be blocked while any student is linked to it. A family with no students MAY be deleted after confirmation, which removes it permanently.

### Tags

- **FR-023**: Each tutor MUST have their own set of tags. Tag names MUST be 1–30 characters after trimming and unique per tutor (case-insensitive).
- **FR-024**: Tutors MUST be able to create a tag while assigning tags to a student, and assign zero or more tags per student. The tag field MUST show a hint that tags are for organising the list (e.g. "Year 11") and must not hold health, SEN or other sensitive details (constitution IV).
- **FR-025**: Tutors MUST be able to rename and delete tags. A rename applies everywhere the tag is used. A delete (after confirmation) removes it from all students without changing anything else on them.

### Privacy, isolation and accessibility

- **FR-026**: A tutor MUST only ever see, search, edit or link their own students, families and tags. Requests for another tutor's records MUST behave as not found.
- **FR-027**: Student and family names, contact details, notes and tags MUST NOT appear in error reports, logs or analytics events.
- **FR-028**: No data beyond the fields listed here MUST be collected for students (for children, see also FR-007). In particular, no date of birth or school is collected for any student.
- **FR-029**: The student list, student form, families list, family form and tag management MUST be fully usable at 375px width and meet WCAG 2.2 AA, including labelled fields, error messages linked to their fields, and keyboard operation.

### Key Entities

- **Student**: A person the tutor teaches. Type (adult or child), first name, last name (adults only, required), subject, level, optional exam board, notes (tutor-only), optional email and phone (adults only), optional link to one family (required for children), zero or more tags. Belongs to one tutor.
- **Family**: A household that one or more students belong to. Name (e.g. "Taylor"), contact name, optional contact email and phone. Supplies contact details for its child students. Belongs to one tutor.
- **Tag**: A tutor-defined label. Name, unique per tutor. Linked to zero or more students.
- **Student–Tag assignment**: Records which tags are on which student.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: On a phone, a tutor can add a child and create their family in under 90 seconds, and add a child to an existing family in under 45 seconds.
- **SC-002**: With 50 students, a tutor can find a given student by search or tag filter within 10 seconds.
- **SC-003**: 100% of child records hold no last name, email or phone of their own, verified across all test cases including Adult → Child switches.
- **SC-004**: Updating a family's contact details shows the new details on every linked child immediately, with zero stale values in test cases.
- **SC-005**: Zero cross-tutor visibility: in isolation tests, no tutor can see or change another tutor's students, families or tags.
- **SC-006**: All screens in this feature have zero automated accessibility violations against WCAG 2.2 AA rules, pass a manual keyboard-only and screen-reader walkthrough of the core flows, and are fully usable at 375px width with no horizontal scrolling.
- **SC-007**: At least 90% of test tutors add their first student without help.

## Assumptions

- **Spec 002 overlap**: This spec replaces spec 002's per-student **Guardian** with a shared **Family** carrying one contact (FR-001/FR-002 of spec 002). Spec 002 has been amended to match: emails go to the family contact for children and to the student for adults. Multiple contacts per family are out of scope for now.
- Archiving and deleting students are already covered by spec 002 (US4, FR-003) and are out of scope here.
- Adding adult-only fields (last name, own contact details) is consistent with constitution Principle IV, because its minimum-data rule targets children. Children stay first-name only.
- Contact details are optional for both adults and families, so a tutor can add a student before having them. Sending email (spec 002) requires an email at send time.
- Student notes are tutor-only reference notes. Whether they are given to generation as context is decided in the spec 002 plan. They are never shown to parents.
- Deleting students is out of scope here. When a family's last child is deleted (spec 002's delete flow), spec 002 offers to delete the now-empty family and its contact details at the same time (spec 002 US4, FR-003).
- A single tutor uses the account, so concurrent edits use last-save-wins.
- Users are already signed in. Authentication exists.
