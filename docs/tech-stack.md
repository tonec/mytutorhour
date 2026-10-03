# Tech Stack

> Status: Draft · Last updated: 2026-10-03
> ✅ Decided · 🟡 Leaning (likely, not confirmed) · TBD.
## Constraints
- Solo builder: boring tech; keep ops burden small
- Mobile-first web (PWA) before native apps
- UK/EU data residency preferred (children's data)
- Low fixed cost while pre-revenue

## Stack options
| Layer               | Options (suggested first)                                        | Decision      |
| ------------------- | ---------------------------------------------------------------- | ------------- |
| Language            | TypeScript                                                       | ✅ **Decided** |
| Frontend            | Next.js + vinext for hosting on Cloudflare                       | ✅ **Decided** |
| Hosting             | Cloudflare Pages using vinext                                    | ✅ **Decided** |
| Backend / DB        | Supabase                                                         | ✅ **Decided** |
| Auth                | Supabase Auth                                                    | ✅ **Decided** |
| Audio capture       | Browser MediaRecorder API · native via Expo                      | TBD           |
| Speech-to-text      | OpenAI Whisper API · Deepgram · AssemblyAI · self-hosted Whisper | TBD           |
| Summarisation (LLM) | Claude API · OpenAI · other                                      | TBD           |
| File storage        | Cloudflare R2                                                    | ✅ **Decided** |
| Email to parents    | Postmark · Resend · SES                                          | TBD           |
| Payments (later)    | Stripe                                                           | TBD           |
| Analytics           | PostHog (EU) · Plausible                                         | TBD           |

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

### Providers and data location
- [ ] Supabase project created in a UK/EU region (London `eu-west-2` preferred for UK users; Frankfurt as fallback)
- [ ] R2 bucket created with **EU jurisdiction**, so objects are stored only in the EU
- [ ] Note that Cloudflare Pages/Workers run at the edge globally: requests can be processed outside the UK/EU even though stored data stays in the EU (strict regional processing needs Cloudflare's enterprise Data Localisation Suite)
- [ ] Supabase and Cloudflare are US companies: accept each one's DPA and confirm the UK transfer mechanism (UK–US Data Bridge certification or UK IDTA/addendum)
- [ ] DPAs with the STT, LLM and email providers; confirm no training on our data and check where they process

### Supabase (database and auth)
- [ ] Row-level security enabled on **every** table; policies scope rows to the signed-in tutor (`tutor_id = auth.uid()`)
- [ ] Service-role key used only server-side (Worker env secret), never in the client bundle
- [ ] Auth hardening: email confirmation on, password policy set, MFA available to tutors
- [ ] Backups: confirm plan includes daily backups; consider point-in-time recovery once there are paying users
- [ ] Encryption at rest is provided by Supabase; all connections over TLS

### Cloudflare (hosting and R2)
- [ ] R2 bucket private; uploads and reads only through short-lived presigned URLs
- [ ] R2 lifecycle rule auto-deletes audio after N days as a backstop to deletion after transcription
- [ ] Secrets stored as Cloudflare environment secrets, not in the repo
- [ ] Security headers set (HTTPS only, HSTS, CSP)

### Product and data handling
- [ ] Audio deleted after successful transcription (default)
- [ ] Minimal student data (first name, level, subject; no DOB or school by default)
- [ ] Tutor private notes never included in parent updates or logged to analytics
- [ ] No student data in error logs or analytics events
- [ ] Data export and delete-account flows (delete also removes R2 objects)

### Legal and documentation
- [ ] Tutor is data controller; we are processor. Document this in the terms
- [ ] Privacy notice for tutors **and** a parent-facing version
- [ ] Record of processing activities and a list of sub-processors (Supabase, Cloudflare, STT, LLM, email)
- [ ] Consider ICO Children's Code relevance (we serve tutors, but process children's data)
