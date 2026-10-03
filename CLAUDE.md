# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

MyTutorHour turns a tutor's short post-lesson voice note (or typed bullets) into a structured lesson log, a parent-friendly update and next steps. The tutor reviews everything before it is sent. The audience is solo UK tutors, mostly on mobile. The repo is at a very early stage: a `create-next-app` scaffold with empty placeholders for the DB and storage clients. Most product thinking so far lives in `docs/`.

## Commands

```bash
npm run dev      # Next.js dev server on http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint (flat config); Prettier runs as an ESLint rule
npx eslint --fix <path>   # lint and auto-format specific files
```

There is no test runner set up yet.

## Stack and code layout

- **Next.js 16 App Router + React 19**, TypeScript strict, Tailwind CSS v4 (via `@tailwindcss/postcss`; no `tailwind.config`). Source lives in `src/`, and the `@/*` path alias maps to `src/*`. As AGENTS.md says, check `node_modules/next/dist/docs/` before using Next.js APIs.
- **Supabase** (Postgres + Auth) and **Cloudflare R2** (file storage), hosted on Cloudflare via vinext. `src/lib/db.ts` and `src/lib/storage/client.ts` are empty placeholders for those clients. Every table needs row-level security scoped to `tutor_id = auth.uid()`. The Supabase service-role key is server-side only.
- Env files (`.env*`) are gitignored. Claude is denied read access to them in `.claude/settings.json`.
- Formatting (`.prettierrc`): single quotes, semicolons, 100-column lines, ES5 trailing commas, LF line endings.

## Docs (source of truth for product decisions)

`docs/` is also an Obsidian vault (`.obsidian/` sits at the repo root). Read these before building features:

- `docs/mission.md`: target users, product principles, non-goals and open decisions.
- `docs/tech-stack.md`: stack decisions, the pipeline architecture, the data model sketch and the privacy/security checklist.
- `docs/specs/voice-note-to-update.md`: the MVP feature spec, with numbered FR/NFR/AC IDs and the LLM output JSON contract. Use those IDs when referring to requirements.
- `docs/research/`: background research behind the specs.

## Product rules that shape the code

These come from the docs and are hard requirements, not nice-to-haves:

- **Nothing reaches a parent without explicit tutor approval.** A parent update moves through `draft` → `approved` → `sent`/`copied`, and only `approved` content can be sent or copied.
- **Tutor private notes are never included in parent updates**, analytics or logs. This holds even after a regenerate.
- **The LLM must not invent facts.** If something isn't mentioned, leave the field empty or null. Validate LLM output against the spec's JSON schema; if it fails, retry once and then show an error with the transcript preserved.
- **Audio is transient.** Delete it after a successful transcription and keep only the transcript and outputs.
- **Children's data:** collect the minimum, prefer UK/EU data residency, isolate every row per tutor, and keep student data out of error logs and analytics.
- Transcription and generation run as **async jobs** that show their status (`uploading` → `transcribing` → `generating` → `ready`). Prompts are versioned in the repo.
- **Mobile-first:** fully usable at 375px wide, with WCAG 2.2 AA on core flows.
