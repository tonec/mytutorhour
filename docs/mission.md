# Mission

> Status: Draft · Last updated: 2026-10-02

## Mission
Give independent tutors their evenings back. MyTutorHour turns a 60-second post-lesson voice note into a structured lesson log, a parent-friendly update and next steps, and the tutor reviews everything before it is sent.

## Target users
**Primary:** Independent (solo) tutors in the UK with 10-30 active students, mostly 1:1, often teaching GCSE/A-level. They are usually self-employed, use a patchwork of generic tools and have no admin support.

**Secondary:** Parents and guardians who pay for tutoring. They want to see progress, but they are not the buyer of the tool.

**Not for (yet):** Tutoring agencies, schools, districts and marketplaces.

## Problems we solve (ranked)
1. **After-lesson admin.** Writing notes and parent updates takes 10-15 minutes per lesson and often slips.
2. **Parent updates.** Updates are inconsistent and ad hoc, and parents feel out of the loop.
3. **Continuity.** Remembering where each of 10-30 students is, what they struggled with and what was set as homework.
4. **Proving value.** No easy evidence of progress over time, which matters for retention and referrals.
5. *(Secondary)* Scheduling and payments, and resources scattered across tools.

## Product principles
1. **Under 2 minutes after a lesson.** If it takes longer, it won't become a habit.
2. **Tutor in control.** Nothing is sent to a parent without explicit tutor review.
3. **Solo-first.** No setup wizard, no "organisation", and it works for one person on a phone.
4. **Privacy by default.** We hold children's data, so collect the minimum and be clear about where it goes.
5. **Narrow and excellent** beats broad and average.

## Non-goals (for MVP)
- Lead generation or a marketplace (Superprof, Tutorful, MyTutor etc. already do this)
- Full scheduling/calendar (Calendly etc. exist)
- Video lessons or a whiteboard
- Multi-tutor or agency features
- Student-facing app
- Invoicing (a possible later, light add-on)

## Success metrics
| Metric                                 | MVP target                                        |
| -------------------------------------- | ------------------------------------------------- |
| Time from lesson end to update ready   | < 2 min median                                    |
| Updates sent per active tutor per week | ≥ 70% of lessons logged                           |
| Edit rate on generated update          | Trending down; < 30% heavily edited               |
| Week-4 tutor retention (pilot)         | ≥ 3 of 5 pilot tutors still using                 |
| Willingness to pay                     | ≥ 30% of interviewed tutors say they'd pay £8+/mo |

## Pricing hypothesis
Free for up to 3 students, then about £8-20/month. *Unvalidated.*

## Key risks
| Risk                                  | Mitigation                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| Low willingness to pay / churn        | Validate pricing in interviews and pilot before building billing                   |
| Free substitutes (Notion + ChatGPT)   | Win on speed, per-student memory and parent-ready output, not on raw AI            |
| Habit change                          | Under-2-minute flow, mobile-first, end-of-lesson nudge                             |
| UK GDPR / children's data             | Data minimisation, DPA with providers, audio deletion policy, clear privacy notice |
| Seasonality (exam cycles, summer dip) | Annual plan discount; track cohort retention by month                              |

## Validation plan
1. **Interviews:** 10-15 independent tutors (pain, current workflow, WTP).
2. **Concierge / no-code pilot:** 5 tutors for 2 weeks (e.g. WhatsApp voice note → manual or AI summary → tutor approves).
3. **Narrowest MVP:** record → summarise → review → share.

## Open decisions
- [ ] Launch subject/level (GCSE maths?)
- [ ] Primary input: voice note vs typed bullets (or both)
- [ ] Parent update channel: email, link, or WhatsApp-friendly copy-paste text
- [ ] Tech stack (see `tech-stack.md`)
