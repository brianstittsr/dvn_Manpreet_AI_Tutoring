# CurioQuest Academy — Features & Tools

**AI-guided learning for children and families.** CurioQuest Academy is a full learning management system built around a simple idea: kids should *learn with* AI, not *hide behind* it. Every course combines rich media, real AI tutoring, human oversight, and progress that parents and educators can actually verify.

---

## The Learning Experience

### Course Catalog
A public, browsable catalog at `/academy` showcases every published course — cover art, instructor, difficulty level, learning outcomes, and pricing at a glance. Families can explore freely; nothing is hidden behind a login until they're ready to learn.

### Preview Before You Enroll
Courses can mark any lesson as a **free preview**. Visitors see real course content before committing — no blind purchases, no surprises.

### The Course Player
Once enrolled, learners move through a clean module-by-module player: numbered lessons, completion checkmarks, and a live progress bar that shows exactly how far they've come. Coming back later? They pick up right where they left off.

### Eight Lesson Types
| Format | What learners do |
|--------|------------------|
| **Video** | Watch embedded or hosted video lessons |
| **Reading** | Rich text lessons with images |
| **Quiz** | Score-gated assessments with retakes and full answer review |
| **Assignment** | Hands-on tasks and submissions |
| **Download** | Worksheets, handouts, and resources |
| **Live Session** | Scheduled live instruction |
| **AI Tutor Lesson** | A guided, six-stage AI-powered learning session *(see below)* |
| **AI Student Interview** | An AI-conducted conversation that checks real understanding |

### Quizzes That Mean Something
Quizzes are scored **on the server** — the correct answers never reach the browser, so they can't be peeked at or faked. Learners get instant results, can retake quizzes, and review every question with the correct answers afterward.

### Progress You Can See
- Per-lesson completion, tracked automatically
- Course-level progress percentage
- "Last accessed" timestamps so families know a learner is active

### Certificates & Reports
Finish every lesson in a course and a **certificate is issued automatically** — exactly once, verified on the server, printable from any browser. Each course also produces a **printable progress report** showing lessons completed, quiz scores, and time invested. Proof of learning, ready for the fridge door or a homeschool portfolio.

### Easy Enrollment & Checkout
Add courses to a cart and check out in seconds. Free courses enroll instantly; paid courses run through secure Stripe checkout with support for sale pricing. Sign-in is required so every enrollment lands on the right account — purchases are never lost.

---

## AI-Guided Instruction — The Differentiator

Most "AI learning" is a chat box with a mascot. CurioQuest's AI Tutor Lesson is a **structured pedagogy engine**.

### The Six-Stage Framework
Every AI lesson walks the learner through six deliberate stages:

```
NOTICE  →  TRY  →  CHALLENGE  →  VERIFY  →  REFLECT  →  TRANSFER
```

The learner notices a pattern, attempts it themselves, faces a harder problem, checks their reasoning, reflects on *how* they learned, then proves they can apply the skill in a brand-new situation. The AI adapts within each stage — it doesn't just ask questions, it coaches.

### Five Learning Dimensions
Progress isn't "messages exchanged." Each session is measured against five real learning dimensions:

- Independent problem solving
- Reasoning & explanation
- AI verification (can the learner check the AI, not just trust it?)
- Learning reflection
- Transfer to new situations

### AI Student Interviews
Separate from the guided lesson, **Student Interviews** are AI-conducted conversations that probe whether a learner genuinely understands a topic — Socratic questioning, not multiple choice.

### Human-in-the-Loop, By Design
- **Admin review queue** — AI lesson sessions land in `/portal/admin/academy/gpt-reviews`; a human approves them before they count toward completion
- **Guardian consent** — AI lessons for minors require a guardian consent link first; sessions stay in `consent_required` state until a parent approves
- **Admin-approved topics & personas** — what the AI teaches, and the personality it teaches with, is set by administrators, not improvised

### Safety That Holds Up
Progress is measured by **demonstrated work** — stages completed, quizzes passed — never by how much a child typed to a chatbot. AI sessions require review. Content is gated to enrolled learners. The whole platform reads at about a sixth-grade level.

---

## Events & Workshops

- Workshop catalog alongside courses at `/academy` and `/events`
- **Event registration → student account, automatically**: registering for an event provisions a learner account and emails login credentials — families go from sign-up to learning with zero admin work
- Admin event-registration dashboard to manage attendees

---

## Family & Safety Features

- **Enrollment-gated content** — full lessons visible only to enrolled, signed-in learners
- **Tamper-resistant records** — quiz scores, progress, and certificates are computed and stored server-side; they can't be forged from the browser
- **Guardian-first for minors** — consent links, approval gates, and a guardian consent management page
- **Refunds revoke access** — refunded purchases cleanly remove enrollment
- **Family-friendly design** — warm, simple language; no dark patterns

---

## For Administrators

| Capability | What you get |
|------------|--------------|
| **Course builder** | Courses → modules → lessons; publish/unpublish; featured courses; free or Stripe-priced |
| **Student dashboard** | Every enrollment, per-learner progress, quiz attempts, certificates |
| **Purchases report** | All transactions in one view |
| **GPT review queue** | Approve or send back AI lesson sessions before they count |
| **Guardian links** | Manage consent approvals for minors |
| **Event registrations** | Track signups; auto-provisioned accounts |

---

*CurioQuest · curioquest.com · info@curioquest.com*
