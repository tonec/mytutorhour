# Feature Spec: Voice note → lesson log + parent update

> Status: Draft · Last updated: 2026-10-02
> Research: `docs/research/voice-note-to-update.md` · Mission: `docs/mission.md`

## Summary
After a lesson, the tutor picks a student and records a short voice note. The note can also be typed. The app transcribes it and generates three things: a **structured lesson log**, a **parent-friendly update** and **next steps** for the next lesson. The tutor reviews and edits them, then approves. Nothing reaches a parent without that approval.

## Goals
- Lesson end to approved update in **under 2 minutes** (median).
- Output good enough to send after light edits or none.
- Each student builds a running history that feeds future summaries.

## Non-goals (this feature)
- Scheduling, invoicing, payments
- Parent accounts or replies inside the app
- Student-facing views
- Spec-mapped topic tracking (later feature)
- Bulk or multi-student notes (e.g. group lessons)

## Assumptions (pending open decisions)
- **Input:** voice is primary, with typed bullets as a fallback using the same pipeline. *(Open decision.)*
- **Channel:** MVP offers "copy text" (for WhatsApp or SMS) and "send by email". A share link comes later. *(Open decision.)*
- **Launch subject:** subject-agnostic generation, tuned with GCSE maths examples. *(Open decision.)*

## User stories
| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-1 | tutor | add a student with minimal details | I can start logging straight away |
| US-2 | tutor | record a voice note for a student straight after a lesson | I capture what happened while it's fresh |
| US-3 | tutor | type bullet points instead when I can't talk | I can still log in a quiet or public place |
| US-4 | tutor | get a structured lesson log from my note | I have consistent records without writing them |
| US-5 | tutor | get a parent-friendly update drafted for me | I keep parents informed without the effort |
| US-6 | tutor | edit any generated text before approving | I stay in control of what's said |
| US-7 | tutor | send the update by email or copy it for WhatsApp | I can use the channel each parent prefers |
| US-8 | tutor | see the previous lesson's next steps when I start a new note | I keep continuity across lessons |
| US-9 | tutor | keep private notes that never go to parents | I can record candid observations safely |
| US-10 | tutor | see a timeline of past lessons per student | I can track progress and show value |
| US-11 | tutor | delete a lesson or student and its data | I can meet data requests and stay tidy |

## Functional requirements

### Students
- **FR-1** Create a student with required `first_name`, `subject` and `level`, and optional `exam_board` and `notes`.
- **FR-2** Add one or more guardians per student with name, optional email and preferred channel (`email` | `copy`).
- **FR-3** Archive a student, which hides it from the main list, or delete it, which hard-deletes all related data.

### Capture
- **FR-4** Record audio in the browser (mobile and desktop), with a visible timer and pause/stop. Maximum 5 minutes.
- **FR-5** Show a warning at 4:30 and auto-stop at 5:00.
- **FR-6** Accept typed text as an alternative input. It is processed the same way, minus transcription.
- **FR-7** If an upload fails, keep the recording locally and offer a retry. Don't lose the recording.

### Processing
- **FR-8** Transcribe audio and show the progress state (`uploading` → `transcribing` → `generating` → `ready`).
- **FR-9** Generate output with the student's profile and the last 3 lesson logs as context.
- **FR-10** The generated **lesson log** contains: `topics_covered`, `went_well`, `struggled_with`, `homework`, `next_steps`.
- **FR-11** The generated **parent update** is plain English, warm and specific. It is 60-150 words, uses the student's first name and has no jargon. It never includes content tagged private.
- **FR-12** Tutor private notes are extracted to a separate field. If the tutor says "private:" or "note to self", that content goes only into `tutor_private_notes`.
- **FR-13** Generation must not invent facts. If a field isn't mentioned, leave it empty rather than guessing.
- **FR-14** Delete the audio after a successful transcription by default. Keep the transcript.

### Review and share
- **FR-15** The review screen shows the log, parent update and next steps, each editable inline.
- **FR-16** Offer "regenerate" for the parent update, with an optional tone choice: `neutral` | `encouraging` | `brief`.
- **FR-17** The parent update has a status of `draft` → `approved` → `sent`/`copied`. Only `approved` content can be sent.
- **FR-18** "Copy" puts the approved text on the clipboard and marks it `copied`. "Email" sends it to the guardian's email and marks it `sent`, with a timestamp.
- **FR-19** Save the tutor's edits (the diff between generated and final text) for quality tracking.

### History
- **FR-20** The student page shows a reverse-chronological timeline of lessons with date, topics and update status.
- **FR-21** A new note screen shows the previous lesson's `next_steps` as a reminder.

## Non-functional requirements
- **NFR-1 Speed:** for a 60-second note, ready in ≤ 20 seconds at p50 and ≤ 45 seconds at p95.
- **NFR-2 Mobile-first:** fully usable at 375px wide, with one-thumb record controls.
- **NFR-3 Privacy:** UK/EU data residency, no provider training on our data, row-level isolation per tutor, audio deleted by default.
- **NFR-4 Reliability:** no recording lost on network failure (see FR-7).
- **NFR-5 Accessibility:** WCAG 2.2 AA for core flows.
- **NFR-6 Cost:** under £0.05 per processed 60-second note (STT + LLM) at MVP.

## Acceptance criteria

**AC-1: Happy path (US-2, US-4, US-5)**
- Given a tutor with student "Amira" (GCSE maths)
- When they record a 60-second note and stop
- Then within 45 seconds they see a lesson log, a parent update and next steps
- And the parent update mentions Amira by name and at least one specific topic from the note.

**AC-2: Typed fallback (US-3)**
- Given the tutor chooses "Type instead"
- When they submit bullet points
- Then the same three outputs are produced, without a transcription step.

**AC-3: Nothing sent without approval (US-6, FR-17)**
- Given a generated parent update in `draft`
- Then "Send" and "Copy" are disabled until the tutor taps "Approve".

**AC-4: Private notes stay private (US-9, FR-11, FR-12)**
- Given a note containing "private: mum mentioned anxiety at school"
- Then that content appears only in `tutor_private_notes`
- And never in the parent update, even after a regenerate.

**AC-5: No hallucinated homework (FR-13)**
- Given a note that doesn't mention homework
- Then the `homework` field is empty, and the parent update doesn't mention homework.

**AC-6: Continuity (US-8, FR-21)**
- Given Amira's last lesson had next step "practise simultaneous equations"
- When the tutor opens a new note for Amira
- Then that next step is shown as a reminder.

**AC-7: Upload failure (FR-7)**
- Given the network drops after recording
- Then the recording is retained and a "Retry" action is shown
- And retrying successfully continues the pipeline.

**AC-8: Email send (FR-18)**
- Given an approved update and a guardian with an email address
- When the tutor taps "Email"
- Then the email is delivered, status becomes `sent`, and `sent_at` is recorded.

**AC-9: Audio deletion (FR-14)**
- Given a successful transcription
- Then the stored audio file is deleted, and `VoiceNote.deleted_at` is set.

**AC-10: Delete student (US-11, FR-3)**
- Given a tutor deletes a student
- Then all lessons, notes, transcripts, logs and updates for that student are hard-deleted.

## Edge cases
- A silent or very short recording (< 5s) prompts "Didn't catch that, try again or type instead".
- A note that mentions the wrong student's name triggers a soft warning before generation.
- The first lesson for a student has no history, so generation works without context.
- Background noise or a poor transcript: show the transcript, so the tutor can see why the output is off.
- A guardian with no email hides the "Email" option and shows "Copy" only.
- A tutor who records in a language other than English is out of scope for MVP and gets a friendly message.

## Analytics events
`note_started`, `note_submitted` (input_type, duration_s), `processing_completed` (latency_ms), `update_edited` (edit_distance), `update_regenerated` (tone), `update_approved`, `update_sent` (channel), `processing_failed` (stage, error).

## Prompt contract (LLM output)
```json
{
  "lesson_log": {
    "topics_covered": ["string"],
    "went_well": "string",
    "struggled_with": "string",
    "homework": "string | null",
    "next_steps": ["string"]
  },
  "parent_update": "string",
  "tutor_private_notes": "string | null"
}
```
Validate against this schema. On failure, retry once, then show an error with the transcript preserved.

## Out of scope / later
- Shareable parent progress page (link)
- WhatsApp Business API sending
- Spec-mapped topics (e.g. GCSE maths AQA/Edexcel)
- Progress summaries across N lessons
- Group lessons

## Open questions
- [ ] Is 5 minutes the right cap? Pilot data will tell.
- [ ] Should parents be able to unsubscribe from emails? (Probably yes, via a footer link.)
- [ ] Is a "tutor signature" or sign-off template needed on parent updates?
- [ ] Should audio be retained optionally for tutors who want it?
