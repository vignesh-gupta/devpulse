## 🛠️ Phase 1: Project Setup & Boilerplate (1–2 days)

### ✅ Tasks:

- Set up **Next.js app** (frontend)
- Set up **Hono** backend with TypeScript
- Connect **Neon Postgres** and configure **Drizzle ORM**
- Configure **monorepo structure** (e.g., Turborepo or Yarn workspaces, optional but helpful)
- Add **Clerk** or **Auth.js** for authentication (GitHub OAuth required)

### 🔧 Tips:

- Keep frontend and backend separate but connected via API routes (Hono runs as an edge function, or separately on Railway/Fly.io)
- Use environment variables for DB, GitHub API tokens, and OpenAI keys

---

## 🚀 Phase 2: GitHub Integration (2–3 days)

### ✅ Tasks:

- Implement GitHub OAuth login via Clerk/Auth.js
- Store access token securely
- Call GitHub REST API to fetch:
  - Recent **commits**
  - **Pull requests** created or reviewed
  - Optional: Linked issues, comments

- Parse and normalize this data for AI summarization

### 📘 Tables (via Drizzle + Neon):

```ts
users (id, github_id, email)
repos (id, user_id, repo_name, repo_url)
daily_activity (id, user_id, date, commits[], prs[])
summaries (id, user_id, date, content, ai_generated, edited)
```

---

## 🤖 Phase 3: AI Summary Engine (2–3 days)

### ✅ Tasks:

- Create OpenAI API wrapper in Hono backend
- Design prompt structure:

```txt
"Based on the following commits and pull requests, generate a daily standup summary in this format:
- Yesterday I worked on...
- Today I’ll focus on...
- Blockers..."
```

- Feed normalized GitHub data to GPT-4o
- Return AI-generated summary to frontend

### Optional Enhancements:

- Store AI response in `summaries` table
- Add ability for user to **edit and approve**

---

## 🧑‍💻 Phase 4: Frontend UI (3–4 days)

### ✅ Pages:

- `/dashboard` – list of daily summaries
- `/generate` – trigger AI summary generation
- `/edit/:id` – allow editing of auto-generated summary
- `/settings` – GitHub connection, export options

### ✅ Components:

- Summary card view (editable or readonly)
- Commit/PR preview list
- Timeline view by date
- Export/share buttons (Slack, email, copy markdown)

Use **Shadcn UI or Tailwind** for fast, clean UI.

---

## 📤 Phase 5: Export + Notifications (2–3 days)

### ✅ Tasks:

- Allow user to connect **Slack webhook** or email address
- Daily job (via cron or background job):
  - Fetch daily activity at user-defined time
  - Generate AI summary
  - Push to Slack/email

Use **cron jobs via Vercel Scheduled Functions** or **Upstash/Convex/Trigger.dev** for scheduled backend jobs.

---

## 🌍 Phase 6: Landing Page + Waitlist (1–2 days)

### ✅ Tasks:

- Build `/` homepage:
  - Hero section (explain DevPulse)
  - Features
  - Screenshots/mockups
  - Waitlist form (store in Neon DB or use ConvertKit/Tally for now)

---

## 💸 Phase 7: Optional – Monetization Setup (2–3 days)

### ✅ Tasks:

- Set up Stripe billing via **LemonSqueezy** or **Stripe + Stripe Billing**
- Add basic pricing plans:
  - Free: 1 GitHub repo, manual trigger only
  - Pro: Multiple repos, Slack/email export, auto-schedule

---

## ✅ Summary Timeline (\~14–16 dev days)

| Phase | Focus                   | Time     |
| ----- | ----------------------- | -------- |
| 1     | Boilerplate + Auth + DB | 2 days   |
| 2     | GitHub integration      | 3 days   |
| 3     | AI summary engine       | 3 days   |
| 4     | Frontend UI             | 3–4 days |
| 5     | Export & scheduling     | 3 days   |
| 6     | Landing page + waitlist | 1–2 days |
| 7     | (Optional) Payments     | 2–3 days |

---

## 🧪 After V1: Validation Tips

- Share on **Twitter + LinkedIn** with screenshots
- Post to **r/webdev**, **Indie Hackers**, or **Dev.to**
- Offer free access in exchange for feedback
- Launch on **Product Hunt** or **Hacker News**
