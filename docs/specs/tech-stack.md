# Tech Stack

> Status: Draft · Last updated: 2026-10-02
> All choices are **TBD** unless marked as decided in the decision log.

## Constraints
- Solo builder: favour managed services and boring tech
- Mobile-first web (PWA) before native apps
- UK/EU data residency preferred (children's data)
- Low fixed cost while pre-revenue

## Stack options
| Layer | Options (suggested first) | Decision |
|---|---|---|
| Frontend | Next.js (React) PWA · SvelteKit · Expo (if native needed) | TBD |
| Hosting | Vercel · Netlify · Fly.io (EU region) | TBD |
| Backend / DB | Supabase (Postgres, EU region) · Firebase · Neon + own API | TBD |
| Auth | Supabase Auth · Clerk · magic-link email | TBD |
| Audio capture | Browser MediaRecorder API · native via Expo | TBD |
| Speech-to-text | OpenAI Whisper API · Deepgram · AssemblyAI · self-hosted Whisper | TBD |
| Summarisation (LLM) | Claude API · OpenAI · other | TBD |
| File storage | Supabase Storage · S3 (eu-west-2) · Cloudflare R2 | TBD |
| Email to parents | Postmark · Resend · SES | TBD |
| Payments (later) | Stripe | TBD |
| Analytics | PostHog (EU) · Plausible | TBD |

## Architecture notes
- **Flow:** record audio (client) → upload → transcribe → LLM structures transcript into log, parent update and next steps using the student's history → tutor reviews/edits → share.
- Run transcription and summarisation as **async jobs** with status shown to the tutor.
- **Audio is transient:** delete it after a successful transcription (configurable). Keep only the transcript and outputs.
- Prompts should be versioned in the repo so output changes are traceable.
- Per-student context (recent logs, topics) is passed into the LLM prompt for continuity.

## Data model sketch
```
Tutor        (id, name, email, plan, created_at)
Student      (id, tutor_id, first_name, level, subject, exam_board?, notes, archived)
Guardian     (id, student_id, name, email?, phone?, preferred_channel)
Lesson       (id, student_id, date, duration_min, status)
VoiceNote    (id, lesson_id, audio_url?, transcript, duration_s, deleted_at)
LessonLog    (id, lesson_id, topics[], went_well, struggled_with, homework, next_steps, tutor_private_notes)
ParentUpdate (id, lesson_id, body, status[draft|approved|sent], channel, sent_at)
Topic        (id, subject, level, spec_ref?, name)   -- later: spec-mapped topics
```

## Privacy and security checklist
- [ ] Data stored in UK/EU region
- [ ] Data Processing Agreements with STT and LLM providers; confirm no training on our data
- [ ] Audio deleted after transcription (default)
- [ ] Minimal student data (first name, level, subject; no DOB or school by default)
- [ ] Privacy notice written for tutors **and** a parent-facing version
- [ ] Tutor is data controller; we are processor. Document this in the terms
- [ ] Encryption at rest and in transit; row-level security per tutor
- [ ] Data export and delete-account flows
- [ ] Consider ICO Children's Code relevance (we serve tutors, but process children's data)

## Decision log
| Date | Decision | Rationale | Alternatives considered |
|---|---|---|---|
| | | | |
