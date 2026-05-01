# SGH Respiratory Services — Network Management System

**MEAHCO Network · 8 Branches · CBAHI Compliance**

A full-stack web application for managing respiratory therapy services across 8 Saudi German Hospital branches.

---

## Features

| Module | Description |
|--------|-------------|
| 📊 Dashboard | Network overview, alerts, training summary |
| 📁 Documents | Upload, categorize, and download clinical documents |
| 🛡️ Certificates | BLS/ACLS/PALS/NRP tracking with 90-day alerts |
| ✓ Competencies | Staff competency matrix with evidence upload |
| 🎓 Training | Course library with attendance tracking |
| 💬 Meetings | AI-generated meeting minutes + digital signatures |
| 👥 Staff Management | Contracts, schedules, vacations, duty roster, folders |
| 🏥 Coverage | Service area configuration per branch |
| 📈 Workload | Beds, ventilated patients, RT:bed ratio |
| 🔧 Logistics | Equipment inventory (ventilators, HFNC, transport) |

---

## Quick Start (5 minutes)

### Step 1 — Install Node.js

Download and install from **https://nodejs.org** (choose the LTS version).

Verify: open Terminal and run `node --version` (should show v18 or higher).

### Step 2 — Install dependencies

```bash
cd ~/Desktop/COWORK\ INBOX/sgh-respiratory
npm install
```

### Step 3 — Run locally (works immediately, no setup needed)

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

Login with: `sultanalshehri@sghgroup.net` (any password)

---

## Deploy to the Internet (Free Public URL)

### Option A — Vercel (Recommended — fastest)

1. Create a free account at **https://vercel.com**
2. Install Vercel CLI: `npm install -g vercel`
3. In the project folder: `vercel`
4. Follow prompts → your app is live at `https://sgh-respiratory.vercel.app`

Or connect via GitHub:
1. Push to GitHub: `git init && git add . && git commit -m "SGH Respiratory App" && git remote add origin <your-repo-url> && git push`
2. Go to vercel.com → Import Git Repository → select your repo
3. Click Deploy → live in ~2 minutes

### Option B — Netlify

1. `npm run build`
2. Drag the `.next` folder to **https://app.netlify.com/drop**
3. Get a free `.netlify.app` URL instantly

---

## Add a Real Database (Supabase — Free)

For data that persists across devices and users:

### Step 1 — Create Supabase project

1. Go to **https://supabase.com** → New Project (free tier)
2. Note your **Project URL** and **anon key** from Settings → API

### Step 2 — Run the database migration

1. Go to Supabase Dashboard → SQL Editor → New Query
2. Paste the contents of `supabase/migrations/001_initial.sql`
3. Click Run

### Step 3 — Create storage bucket

1. Supabase → Storage → New Bucket
2. Name: `documents`, check **Public bucket** → Create

### Step 4 — Add environment variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Step 5 — Add env vars to Vercel

In Vercel Dashboard → Project → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

Then redeploy: `vercel --prod`

---

## AI Meeting Minutes

The app generates formal meeting minutes using Claude AI.

1. Get an API key from **https://console.anthropic.com**
2. Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`
3. The key is kept server-side — never exposed to users

---

## Demo Accounts

| Role | Email |
|------|-------|
| Network Director (full access) | sultanalshehri@sghgroup.net |
| Jeddah Branch | ahmad.zahrani@sghgroup.net |
| Riyadh Branch | khalid.dosari@sghgroup.net |
| Makkah Branch | yasser.ghamdi@sghgroup.net |
| Hai Aljamea Branch | bader.harbi@sghgroup.net |

Any password works in demo mode.

---

## Tech Stack

- **Frontend**: Next.js 14, React 18
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage
- **AI**: Anthropic Claude API
- **Hosting**: Vercel (free tier)
- **Domain**: `<project-name>.vercel.app` (free) or custom domain

---

## Project Structure

```
sgh-respiratory/
├── app/
│   ├── api/
│   │   ├── ai-mom/route.js       # AI meeting minutes (server-side)
│   │   └── documents/route.js    # File upload handler
│   ├── globals.css               # Complete design system
│   ├── layout.js
│   └── page.js
├── components/
│   ├── App.js                    # Main app + sidebar
│   ├── Login.js
│   ├── Dashboard.js
│   ├── Documents.js
│   ├── Certificates.js
│   ├── Competencies.js
│   ├── Training.js
│   ├── Meetings.js
│   ├── StaffManagement.js
│   ├── AreasCoverage.js
│   ├── WorkloadMgmt.js
│   └── LogisticsMgmt.js
├── lib/
│   ├── data.js                   # All seed data & helpers
│   └── supabase.js               # Supabase client
├── supabase/migrations/
│   └── 001_initial.sql           # Database schema
├── .env.example
└── vercel.json
```

---

## Custom Domain (Optional)

After deploying to Vercel:
1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g. `respiratory.sghgroup.net`)
3. Update your DNS CNAME to point to `cname.vercel-dns.com`

For a free subdomain, the default `sgh-respiratory.vercel.app` works perfectly.
