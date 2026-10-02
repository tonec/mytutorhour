# Tech Stack

> Status: Draft · Last updated: 2026-10-02
> ✅ Decided · 🟡 Leaning (likely, not confirmed) · TBD. Decided items are recorded in the decision log.

## Constraints
- Solo builder: boring tech; keep ops burden small (self-hosting via Coolify means we own backups, patching and monitoring)
- Mobile-first web (PWA) before native apps
- UK/EU data residency preferred (children's data)
- Low fixed cost while pre-revenue

## Stack options
| Layer | Options (suggested first) | Decision |
|---|---|---|
| Language | TypeScript | ✅ **Decided** |
| Frontend | Next.js (React) PWA · SvelteKit · Expo (if native needed) | ✅ **Decided: Next.js** |
| Hosting | Hetzner Cloud VPS (EU) + Coolify (self-hosted PaaS) · Railway · Vercel · Fly.io | 🟡 **Leaning: Hetzner + Coolify** |
| Backend / DB | Postgres on Coolify (Hetzner) + Next.js API routes · Railway Postgres · Supabase · Neon | 🟡 **Leaning: Postgres on Coolify** |
| Auth | Better Auth (self-hosted, TypeScript) · Clerk · Supabase Auth | 🟡 **Leaning: Better Auth** |
| Audio capture | Browser MediaRecorder API · native via Expo | TBD |
| Speech-to-text | OpenAI Whisper API · Deepgram · AssemblyAI · self-hosted Whisper | TBD |
| Summarisation (LLM) | Claude API · OpenAI · other | TBD |
| File storage | Hetzner Object Storage (S3-compatible, EU) · MinIO on Coolify · Cloudflare R2 | 🟡 **Leaning: Hetzner Object Storage** |
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
- [ ] Data stored in EU region: pick one Hetzner location (e.g. Falkenstein, Nuremberg or Helsinki) for VPS **and** object storage
- [ ] Sign Hetzner's data processing agreement (EU company, so no US transfer for hosting; UK→EU transfer covered by UK adequacy for the EU, confirm still current)
- [ ] Self-hosting ops: automated Postgres backups to off-server storage, tested restores, OS/security updates, firewall, SSH key-only access, uptime monitoring
- [ ] Disk encryption: check whether Hetzner volumes are encrypted at rest; if not, use LUKS or encrypt sensitive fields at app level
- [ ] Data Processing Agreements with STT and LLM providers; confirm no training on our data
- [ ] Audio deleted after transcription (default)
- [ ] Minimal student data (first name, level, subject; no DOB or school by default)
- [ ] Privacy notice written for tutors **and** a parent-facing version
- [ ] Tutor is data controller; we are processor. Document this in the terms
- [ ] Encryption at rest and in transit; per-tutor data isolation (enforce `tutor_id` scoping in every query, or Postgres RLS)
- [ ] Data export and delete-account flows
- [ ] Consider ICO Children's Code relevance (we serve tutors, but process children's data)

## Decision log
| Date | Decision | Rationale | Alternatives considered |
|---|---|---|---|
| 2026-10-02 | Language: TypeScript | Type safety across front end, API and LLM output contracts; one language end to end | JavaScript |
| 2026-10-02 | Front end: Next.js | Mature React framework, PWA-capable, good fit for a solo builder | SvelteKit, Expo |
| 2026-10-02 | ~~🟡 Leaning: Railway for hosting, Postgres and file storage~~ (superseded below); 🟡 Leaning: Better Auth for auth | One platform for app, DB and files keeps ops simple for a solo builder; Better Auth is TypeScript-native and keeps user data in our own Postgres | Vercel + Supabase, Fly.io, Neon, Clerk, Supabase Auth |
| 2026-10-02 | 🟡 Leaning: Hetzner Cloud + Coolify for hosting and Postgres; Hetzner Object Storage for files (replaces Railway) | EU company and EU data centres simplify UK GDPR for children's data; low fixed cost; Coolify gives a Railway-like deploy experience on our own server. Trade-off: we own backups, patching and uptime | Railway, Vercel + Supabase, Fly.io |
