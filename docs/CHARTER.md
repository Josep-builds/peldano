# Peldaño — Product Charter

**Venture:** Peldaño · **Founder:** Josep Ferré Gil · Team 7 · Brain Bending, weeks 12–17
**Source ship:** W9, Chapter 8 "The Job Savior" (USER lens) · **Repo:** github.com/Josep-builds/pelda-o
**Domain of record:** peldano.xyz (bought with the venture's Gmail; fallback if taken: peldano.site)
**Charter v1 · 26 Oct 2026** · Written before the rebuild. It is the referee for every scope fight until week 17.

Sources: VERDICT_JosepFerreGil (W12) · METHOD_JosepFerreGil (W12, "Who Answers For It") · BRIEF_JosepFerreGil_W9 (USER lens) · in-person interview with a worker, 26 Oct 2026.

---

## VISION — the 3-year product

In three years, a young Mexican worker who does a trial day at a small café, restaurant or shop walks out with something he never had before: a signed, timestamped record of the work he actually did, written by the person who watched him do it, held on his own phone, and addressed to employers who have already agreed that N such days count as experience. The unpaid or unanswered trial day stops being a cost that disappears — it becomes a rung he keeps. Peldaño is the place where small employers' observations of real work turn into proof a worker owns, and where "no tienes experiencia" stops being an answer an employer can give to someone who has already shown the work.

## USERS — who, exactly

1. **The worker (primary, the one who absorbs the loss).** 18–25, CDMX metro area, informal or entry-level, applies to small businesses — cafés, restaurants, shops — that run trial days (paid or unpaid) and often never call back. Has real work behind him that counts as "no experience." Uses WhatsApp daily; distrusts apps that ask for a lot. Pays nothing.
   *Evidence:* in-person interview, 26 Oct 2026 (one worker — unpaid trial at a past job, never called back; would use a signed record). W9 research on informal youth workers.
   *Correction from reality:* W9 assumed nearshoring warehouses. The interview showed big chains pay their trial shifts; unpaid trials live in small businesses. The target employer moved.

2. **The observer (the one who signs).** The owner or manager of the small business where the trial day happens — the person who saw the work. Signs the record. Never the AI.

3. **The receiving employer (the one who must answer).** An employer who signed the Acuerdo beforehand: N signed trial days count as the experience requirement. Not a hiring promise. **Unvalidated — Risk #1.** No employer has yet said they would sign.

## PRINCIPLES — rules the product never breaks

1. **A person signs, never the AI.** The observer writes and signs the record. AI may help read or tidy what the observer wrote; any AI-touched field is labeled and must be confirmed by the observer before signing. *(Method Step 6)*
2. **No scores. Ever.** No stars, no aggregate rating, no ranking of workers. A record describes the tasks done, the hours and what the observer saw — in detail, not pass/fail. Enforced in the database schema, not just the UI. *(Method Step 7; Pallais 2014 / Harambee: detail is what moves hiring)*
3. **The record belongs to the worker.** The worker decides who sees it. Records cannot be deleted by the platform, by an employer, or by a deactivation. *(W9 shadow decision 1–2)*
4. **A bad day doesn't bury anyone.** The worker can hide a record and replace it with a later one. Nothing becomes a permanent public mark against him. *(W9 shadow decision 1)*
5. **Attach to a day that already happens.** Peldaño records trial days that employers already run. It never asks anyone to show up somewhere new, and never creates, lengthens or justifies an unpaid day. *(Method Step 5)*
6. **A signed record is locked.** Once signed, it cannot be edited — by anyone. Corrections are a new record. *(Method Step 7)*

## NON-GOALS — what Peldaño will NEVER do

- **Never a job board.** It does not list vacancies, match candidates, or promise hiring.
- **Never a rating or reputation system.** No scores, no reviews of workers, no "top worker" lists.
- **Never a CV builder.** A record only exists if someone who watched the work signed it. Self-declared experience is out.
- **Never a marketplace for unpaid trials.** It will not help any employer find people to work for free, and it will not schedule trial days.
- **Never a skills test or AI assessment.** No inferring skills from text, no AI-generated evaluations, no blockchain badges.
- **Never sell or expose workers' data.** No raw data shared with third parties; employers see only what the worker chose to share.
- **Not in v1:** worker-to-worker features, payments, payroll, IMSS integration, multiple languages.

## NORTH STAR

**Signed trial-day records that an employer who signed the Acuerdo accepted as experience.**

One record accepted by a manager with nobody from the Peldaño team in the room is the moment the product works (Method, "Knowledge Ladder", Rung 2). Number of records created does not count; a record nobody had to answer to is just a well-locked CV.

## CORE CONCEPTS — the mini-ontology (if a feature doesn't speak these nouns, it doesn't belong)

| Noun | One-line definition |
|---|---|
| **Worker** (Trabajador) | The person who did the trial day and owns every record about it. |
| **Trial day** (Día de prueba) | One real shift a business already runs to test a candidate — paid or unpaid; Peldaño never creates it. |
| **Observer** (Observador) | The person at the business who watched the work and signs the record; always a human. |
| **Record** (Constancia) | The signed, timestamped description of one trial day: business, date, hours, tasks done, what the observer saw — no score. |
| **Signature** (Firma) | The observer's act of confirming the record; after it, the record is locked forever. |
| **Acuerdo** (Waiver) | An employer's prior, signed commitment that N signed records count as the experience requirement — not a promise to hire. |
| **Share** (Compartir) | A worker-controlled link that shows chosen records to one employer, revocable by the worker. |

---

## Open assumptions this charter does NOT pretend are true

- **The Acuerdo (Risk #1).** No manager has agreed to sign. Small, informal businesses may refuse because signing documents unpaid work. Test in week 13: at least one of the 5 user tests is a manager who runs trial days. Kill/pivot rule: if no manager would sign, the record's addressee is redesigned or another ship is picked, and this is said in the Fusion.
- **The 10:1 case (Gate 2).** Not proven. Missing: pesos lost per unpaid trial (incl. fare) and number of trials before being hired. Week 13: ask every worker tested.
- **Who pays.** The worker pays zero. The payer is not decided. W9 candidates: a third party (e.g. a redirected JCF budget) or employers facing turnover. Not tested.
