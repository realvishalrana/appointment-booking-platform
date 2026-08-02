# AI Usage Documentation

## Tools and Prompts

### AI Tools Used

| Tool | How Used |
|------|----------|
| **Cursor (Claude)** | Architecture planning, full-stack implementation, documentation, debugging TypeScript/Prisma errors |

### Exact Prompts (copied from conversations)

1. **Initial requirements clarification:**
   > Associate Full-Stack Engineer: Take-Home Assignment ... we need to create the full stack project using the react as frontend and nodejs and backend can you first what we need to build here clearify the each requirments which databased will be used

2. **Database and documentation expansion:**
   > can we used mysql if possible because i have don't idea on the postgreal sql also can you write something how many api we need to create , inside the each modal what are the data we are using to store it defaine that also if possible , for the hld , lld do you have anything if mulitpler user are there think about that also creat the speate docs for that also and aprt from that there should be docs where each module details why we used this and not that like here we used the mysql not mongodb there should be one kind of kind , what are the tread off also FROM THis project what are the question might be ask from the inteviwer

3. **TypeScript requirement:**
   > we will used the typescript also in both frotnend and backend

4. **Implementation kickoff:**
   > Appointment Booking System — Updated Plan (MySQL) Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

---

## Technical Decisions

### 1. MySQL vs MongoDB vs PostgreSQL

| | AI Recommendation | What We Implemented | Tradeoffs |
|---|-----------------|---------------------|-----------|
| Database | PostgreSQL initially; MySQL acceptable | **MySQL 8** via Prisma | MySQL chosen for team familiarity; same ACID/unique-index story as Postgres for this use case. MongoDB weaker for overlapping slot integrity. |

### 2. Derived slots vs pre-seeded calendar rows

| | AI Recommendation | What We Implemented | Tradeoffs |
|---|-----------------|---------------------|-----------|
| Slots | Derive on read from weekly schedule | `therapist_schedules` + runtime generation | No calendar explosion; schedule edits don't orphan rows. Slightly more CPU per availability query. |

### 3. Recurring: materialised instances vs on-the-fly projection only

| | AI Recommendation | What We Implemented | Tradeoffs |
|---|-----------------|---------------------|-----------|
| Recurring | Series record + materialised instances | `recurring_series` + 6 months of `appointments` | Simpler conflict checks and therapist calendar. Requires horizon limit and generation on book. |

### 4. Concurrency / 3 clusters

| | AI Recommendation | What We Implemented | Tradeoffs |
|---|-----------------|---------------------|-----------|
| Locks | DB transactions + unique constraints; Redis optional later | MySQL unique on holds; idempotency keys on confirm | No Redis dependency for MVP. Shared DB is single point of failure (mitigated by managed MySQL in prod). |

### 5. Holds

| | AI Recommendation | What We Implemented | Tradeoffs |
|---|-----------------|---------------------|-----------|
| Hold TTL | Server-side `expires_at`, soft expiry in queries | `slot_holds` table, 60s TTL | Survives refresh; works across clusters. Optional cleanup job for old rows. |

### 6. TypeScript on both sides

| | AI Recommendation | What We Implemented | Tradeoffs |
|---|-----------------|---------------------|-----------|
| Language | TypeScript for type safety on DTOs, roles, statuses | React + Express both in TS | Slightly more setup; fewer runtime type errors. |

---

## Incorrect AI Suggestions (Optional)

### Redis as required for holds

**AI suggested:** Redis for distributed hold locks with TTL.

**Why unsuitable for MVP:** Adds infrastructure complexity. MySQL unique constraints + `expires_at` achieve the same correctness for this scale. Redis is documented as a future scale-out option in HLD.

### Pre-seeding slots for 12 months

**AI suggested:** Background job to pre-generate slot rows.

**Why unsuitable:** Assignment explicitly says slots should be derived, not pre-seeded. Pre-seeding would create maintenance burden when therapist updates schedule.

---

## Verification Steps Taken

- TypeScript compile checks on frontend and backend
- Manual API test: health, login
- Prisma schema validation and seed against MySQL
- Unique constraint on holds tested via concurrent hold logic in service layer
