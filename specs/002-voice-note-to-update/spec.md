# Feature Specification: Voice Note to Lesson Log and Parent Update

**Feature Branch**: `main` (no feature branch created)

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: "voice note to lesson log and parent update"

**Revised**: 2026-10-07. Students, families and tags are now defined by
[spec 001 (Student List)](../001-student-list/spec.md). The per-student Guardian is replaced by a
shared Family with one contact, and students can be children or adults. Affected: US1 intro, US3,
edge cases, FR-001, FR-002, FR-020 and Key Entities.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Voice note to an approved parent update (Priority: P1)

Straight after a lesson, a solo tutor picks a student on their phone and records a short voice
note about the lesson. The app turns it into three things: a structured lesson log, a
parent-friendly update and next steps for the next lesson. The tutor reads and edits them,
approves the parent update, then copies it to paste into WhatsApp or a text message.
Students are added from the student list (spec 001). A child needs only a first name, subject,
level and a family, which can be created on the spot, so the tutor can start straight away.

**Why this priority**: This is the core promise of the product: getting the tutor's evenings
back by turning a 60-second note into a ready-to-send update in under 2 minutes. Without it
there is no product.

**Independent Test**: Add a student, record a 60-second note, review the outputs, approve the
update and copy it. Delivers value on its own because the copied text can be sent through any
messaging app.

**Acceptance Scenarios**:

1. **Given** a tutor with student "Emily" (GCSE maths), **When** they record a 60-second note
   and stop, **Then** within 45 seconds they see a lesson log, a parent update and next steps,
   **And** the parent update mentions Emily by name and at least one specific topic from the
   note.
2. **Given** a generated parent update in draft, **Then** the "Copy" action is unavailable
   until the tutor taps "Approve".
3. **Given** an approved parent update, **When** the tutor taps "Copy", **Then** the text is on
   their clipboard and the update is marked as copied.
4. **Given** an approved parent update, **When** the tutor edits it, **Then** it returns to
   draft and must be approved again before it can be copied or sent.
5. **Given** a note containing "private: mum mentioned anxiety at school", **Then** that content
   appears only in the tutor's private notes, **And** never in the parent update.
6. **Given** a note that doesn't mention homework, **Then** the homework field is empty, **And**
   the parent update doesn't mention homework.
7. **Given** processing is under way, **Then** the tutor sees which stage it is at
   (uploading, transcribing, generating, ready).
8. **Given** the network drops after recording, **Then** the recording is kept on the device
   and a "Retry" action is shown, **And** retrying continues processing without re-recording.
9. **Given** a successful transcription, **Then** the stored audio is deleted and only the
   transcript and outputs are kept.

---

### User Story 2 - Typed notes instead of voice (Priority: P2)

A tutor who can't speak aloud (on a train, in a café, between lessons) types a few bullet points
instead. They get the same three outputs through the same review and approval flow.

**Why this priority**: Tutors often finish lessons in public or quiet places. Without a typed
option they skip logging, which breaks the habit the product depends on.

**Independent Test**: Choose "Type instead", submit bullet points and confirm the same three
outputs appear and can be reviewed, approved and copied.

**Acceptance Scenarios**:

1. **Given** the tutor chooses "Type instead", **When** they submit bullet points, **Then** the
   same three outputs are produced, without a transcription step.
2. **Given** typed notes containing "note to self: …", **Then** that content goes only into the
   tutor's private notes.

---

### User Story 3 - Email the update (Priority: P2)

After approving an update, the tutor sends it by email from the app, and the app records that it
was sent and when. For a child, the email goes to their family's contact email. For an adult
student, it goes to the student's own email (spec 001, FR-008 and FR-010).

**Why this priority**: Many parents prefer email, and sending from the app gives the tutor a
record of what was sent. Copying (Story 1) already covers the other channels.

**Independent Test**: Give a child's family a contact email, approve an update and tap "Email";
confirm delivery and that the status and sent time are recorded.

**Acceptance Scenarios**:

1. **Given** an approved update for "Emily" whose family contact Sarah Taylor has an email
   address, **When** the tutor taps "Email", **Then** the email is delivered to Sarah Taylor,
   the status becomes sent, and the sent time is recorded.
2. **Given** an approved update for an adult student "Daniel Hughes" with his own email, **When**
   the tutor taps "Email", **Then** it is sent to Daniel's email.
3. **Given** a child whose family has no contact email, or an adult with no email, **Then** the
   "Email" option is hidden and only "Copy" is shown.
4. **Given** an update in draft, **Then** "Email" is unavailable.

---

### User Story 4 - Delete or archive a student's data (Priority: P2)

A tutor stops teaching a student. They can archive the student to hide them from the main list,
or delete the student, which permanently removes everything held about them.

**Why this priority**: The service holds children's data. Tutors must be able to honour data
requests from families and keep their list tidy.

**Independent Test**: Delete a student with several lessons and confirm none of their lessons,
notes, transcripts, logs or updates can be found afterwards.

**Acceptance Scenarios**:

1. **Given** a tutor deletes a student, **Then** all lessons, notes, transcripts, logs and
   updates for that student are permanently deleted.
2. **Given** a tutor archives a student, **Then** the student is hidden from the main list but
   their history is kept and they can be restored.
3. **Given** Emily is the only student in the Taylor family, **When** the tutor deletes Emily,
   **Then** the delete confirmation offers "Also delete the Taylor family and its contact
   details", **And** if ticked, the family is permanently deleted with her. If not ticked, the
   family is kept with no students.
4. **Given** the Taylor family also has Oliver, **When** the tutor deletes Emily, **Then** the
   family option is not offered and the family is kept.

---

### User Story 5 - Continuity across lessons (Priority: P3)

When the tutor starts a new note for a student, they see the next steps from the previous
lesson. Each student has a timeline of past lessons, and generation takes the recent history
into account.

**Why this priority**: Continuity across 10-30 students is a real pain point and makes updates
more specific, but the product is still useful without it.

**Independent Test**: Log two lessons for one student; when starting the third, confirm the
second lesson's next steps are shown and both lessons appear on the student's timeline.

**Acceptance Scenarios**:

1. **Given** Emily's last lesson had the next step "practise simultaneous equations", **When**
   the tutor opens a new note for Emily, **Then** that next step is shown as a reminder.
2. **Given** a student with past lessons, **When** the tutor opens the student page, **Then**
   lessons are listed newest first with date, topics and update status.
3. **Given** a student's first lesson, **Then** generation works without any history.

---

### User Story 6 - Regenerate the update in a different tone (Priority: P3)

If the draft update doesn't sound right, the tutor regenerates it, optionally choosing a tone:
neutral, encouraging or brief.

**Why this priority**: Reduces heavy editing, but the tutor can always edit by hand instead.

**Independent Test**: Regenerate an update with each tone and confirm a new draft is produced
each time and private notes never appear.

**Acceptance Scenarios**:

1. **Given** a draft update, **When** the tutor regenerates with tone "brief", **Then** a new
   draft replaces it.
2. **Given** a note with private content, **When** the tutor regenerates any number of times,
   **Then** the private content never appears in the parent update.
3. **Given** an approved update, **When** the tutor regenerates, **Then** it returns to draft.

---

### Edge Cases

- A silent or very short recording (under 5 seconds) shows "Didn't catch that, try again or type
  instead" and does not generate outputs.
- A recording reaching 4 minutes 30 seconds shows a warning; at 5 minutes it stops
  automatically and continues to processing.
- A note that mentions a different student's name shows a soft warning before generation.
- A poor transcript (background noise): the transcript is shown alongside the outputs so the
  tutor can see why the output is off.
- Generated output that is incomplete or malformed is retried once automatically; if it fails
  again, an error is shown and the transcript or typed notes are kept so nothing is lost.
- A note recorded in a language other than English gets a friendly "English only for now"
  message.
- No email to send to (a family with no contact email, or an adult with no email): only "Copy" is
  offered.
- An email that fails to deliver leaves the update in approved state and tells the tutor.

## Requirements _(mandatory)_

### Functional Requirements

**Students and families**

- **FR-001**: Tutors MUST be able to create and edit students as defined in spec 001 (FR-006 to
  FR-017). A child has a first name, subject and level, an optional exam board and notes, and a
  required family. An adult also has a last name and an optional email and phone of their own.
  No other personal details are collected.
- **FR-002**: The contact for a child's parent updates MUST be their family's contact (name,
  optional email, optional phone) as defined in spec 001 (FR-018 to FR-022). The contact for an
  adult student is the student.
- **FR-003**: Tutors MUST be able to archive a student (hidden, history kept, restorable) or
  delete a student (all related data permanently removed). When the student is the last one in
  their family, the delete confirmation MUST offer to delete the family and its contact details
  too.

**Capture**

- **FR-004**: Tutors MUST be able to record audio in the browser on mobile and desktop, with a
  visible timer and pause/stop controls, up to 5 minutes.
- **FR-005**: The system MUST warn at 4:30 and stop recording automatically at 5:00.
- **FR-006**: Tutors MUST be able to type notes instead; typed notes are processed the same way,
  without transcription.
- **FR-007**: If an upload fails, the system MUST keep the recording on the device and offer a
  retry. A recording MUST never be lost because of a network failure.

**Processing**

- **FR-008**: The system MUST transcribe audio and show the processing stage (uploading →
  transcribing → generating → ready).
- **FR-009**: The system MUST generate outputs using the student's profile and their last 3
  lesson logs as context.
- **FR-010**: The generated lesson log MUST contain topics covered, what went well, what the
  student struggled with, homework and next steps.
- **FR-011**: The generated parent update MUST be plain English, warm and specific, 60-150 words,
  use the student's first name and avoid jargon.
- **FR-012**: Content the tutor marks with "private:" or "note to self" MUST go only into the
  tutor's private notes and MUST NEVER appear in the parent update, emails, copied text,
  analytics or logs, including after a regenerate.
- **FR-013**: Generated output MUST NOT invent facts. Anything not mentioned in the note MUST be
  left empty.
- **FR-014**: Generated output MUST be checked for completeness and correct structure. If the
  check fails, the system MUST retry once, then show an error with the transcript or typed notes
  preserved.
- **FR-015**: The system MUST delete audio after a successful transcription and keep only the
  transcript and outputs.
- **FR-016**: Each set of generated outputs MUST record which version of the generation
  instructions produced it.

**Review and share**

- **FR-017**: The review screen MUST show the lesson log, parent update, next steps and
  transcript, with every generated field editable inline.
- **FR-018**: Tutors MUST be able to regenerate the parent update, optionally choosing a tone:
  neutral, encouraging or brief.
- **FR-019**: A parent update MUST move through draft → approved → sent or copied. Only an
  approved update can be sent or copied. Editing or regenerating an approved update MUST return
  it to draft.
- **FR-020**: "Copy" MUST put the approved text on the clipboard and mark the update as copied.
  "Email" MUST send it to the contact's email address (FR-002) and mark it as sent, with the
  time.
- **FR-021**: The system MUST store the difference between the generated and final parent update
  to track output quality.

**History**

- **FR-022**: The student page MUST show a newest-first timeline of lessons with date, topics
  and update status.
- **FR-023**: Starting a new note MUST show the previous lesson's next steps as a reminder.

**Privacy and access**

- **FR-024**: A tutor MUST only ever see and act on their own students, lessons and updates.
- **FR-025**: Student data MUST NOT appear in error reports or analytics events.

**Usability**

- **FR-026**: Every screen in the core flow MUST be fully usable on a 375px-wide phone screen,
  with the record controls reachable one-handed, and MUST meet WCAG 2.2 AA.

### Key Entities

- **Tutor**: The signed-in user who owns all the data below. Name, email.
- **Student**: A child or adult the tutor teaches, as defined in spec 001, plus an archived flag
  added by this feature. Belongs to one tutor.
- **Family**: Defined in spec 001. A household with one contact (name, optional email and
  phone) who receives updates about its child students. Replaces the earlier per-student
  Guardian.
- **Lesson**: One tutoring session for a student. Date, optional duration, processing status.
- **Voice Note**: The tutor's input for a lesson: audio (temporary, deleted after
  transcription) or typed text, plus the transcript, duration and when the audio was deleted.
- **Lesson Log**: The structured record of a lesson: topics covered, went well, struggled with,
  homework, next steps and the tutor's private notes.
- **Parent Update**: The message about a lesson for the family contact (or for an adult student
  themselves). Text, status (draft, approved,
  sent, copied), channel, sent time, the original generated text and the version of the
  generation instructions used.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Median time from the end of a lesson to an approved parent update is under
  2 minutes.
- **SC-002**: For a 60-second note, outputs are ready within 20 seconds for half of notes and
  within 45 seconds for 95% of notes.
- **SC-003**: Fewer than 30% of parent updates are heavily edited before approval, and the edit
  rate trends down over the pilot.
- **SC-004**: Pilot tutors log at least 70% of their lessons each week.
- **SC-005**: At least 3 of 5 pilot tutors are still using the feature in week 4.
- **SC-006**: Zero parent updates contain content the tutor marked as private, across all test
  and pilot notes.
- **SC-007**: Zero updates reach a parent without the tutor approving them.
- **SC-008**: Zero recordings are lost to network failures in testing.
- **SC-009**: Processing cost is under £0.05 per 60-second note.

## Assumptions

- Tutors sign in with the account system that already exists in the app.
- Voice is the primary input, with typed bullets as a fallback through the same flow.
- Parent updates are shared by copying text (for WhatsApp/SMS) or by email. A shareable link and
  WhatsApp integration are out of scope.
- Generation is subject-agnostic and tuned with GCSE maths examples; launch subject is not
  fixed.
- English-only for the MVP.
- One student per note: group lessons and bulk notes are out of scope.
- Out of scope: scheduling, invoicing, payments, parent accounts or replies, student-facing
  views, spec-mapped topic tracking, progress summaries across lessons.
- Data is stored in the UK/EU, and third-party processing providers do not train on it.
- Audio is never kept after successful transcription; optional retention is not offered in
  the MVP.
- Parent update emails include a way for parents to stop receiving them.
- For an adult student, the "parent update" is addressed to the student and goes through the
  same draft → approved → sent/copied flow.
- The earlier "preferred channel" on a guardian is dropped. "Email" is offered whenever there is
  an email address to send to, and "Copy" is always available.
- Student notes (spec 001) are separate from the tutor's private lesson notes. They are never
  shown to parents. Whether they are given to generation as context is decided in this spec's
  plan.
