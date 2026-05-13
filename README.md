# GrowSmart AI

AI revenue tools for Singapore SMEs — web app + Telegram bot on Railway.

## Modules

| Module | Web App Route | Bot Commands |
|--------|--------------|--------------|
| Content Engine | `/content` | `/post`, `/email`, `/proposal`, `/repurpose` |
| Lead Generator | `/leads` | `/leads`, `/outreach` |
| CX Chatbot | `/chatbot` | `/ask`, any text |
| Ops Tools | `/ops` | `/notes`, `/doc` |

---

## Setup (15 minutes)

### 1. Clone repo

```bash
git clone https://github.com/your-username/growsmart-ai.git
cd growsmart-ai
npm install
```

### 2. Create `.env.local`

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|----------|----------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `DATABASE_URL` | Railway → your PostgreSQL plugin → Variables |
| `NEXTAUTH_SECRET` | Terminal: `openssl rand -base64 32` |
| `TELEGRAM_BOT_TOKEN` | @BotFather on Telegram → /newbot |
| `BOT_API_SECRET` | Terminal: `openssl rand -hex 16` (make something up) |

### 3. Set up database

```bash
npm run db:push    # creates tables in Railway PostgreSQL
npm run db:seed    # creates demo login user
```

Demo login: `demo@growsmart.sg` / `password123`

### 4. Run locally

```bash
npm run dev        # web app → http://localhost:3000
npm run bot        # telegram bot (separate terminal)
```

---

## Deploy to Railway

### Step 1 — Create Railway project

1. Go to [railway.app](https://railway.app) → New Project
2. Click **Add PostgreSQL** → Railway spins up a database
3. Copy `DATABASE_URL` from the PostgreSQL plugin Variables tab

### Step 2 — Deploy web app

1. New Service → GitHub Repo → select this repo
2. Railway auto-detects Next.js
3. Set these in Service → Variables:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   DATABASE_URL=postgresql://...   (from PostgreSQL plugin)
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=https://your-app.railway.app
   BOT_API_SECRET=...
   NEXT_PUBLIC_APP_URL=https://your-app.railway.app
   ```
4. Railway builds and deploys automatically

### Step 3 — Deploy Telegram bot

1. In the same Railway project → New Service → GitHub Repo → same repo
2. Set **Start Command**: `node bot/index.js`
3. Set these Variables (same project, so DATABASE_URL already available):
   ```
   TELEGRAM_BOT_TOKEN=...
   BOT_API_SECRET=...              (same value as web app)
   NEXT_PUBLIC_APP_URL=https://your-web-app.railway.app
   TELEGRAM_WEBHOOK_URL=https://your-bot.railway.app
   ```

### Step 4 — Run database seed

Open Railway shell for the web app service:
```bash
npm run db:seed
```

### Step 5 — Test

- Open your Railway web app URL → login with `demo@growsmart.sg` / `password123`
- Message your Telegram bot → `/start`

---

## Add a new client

```bash
# In Railway shell or locally with DATABASE_URL set:
node -e "
const {PrismaClient} = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();
bcrypt.hash('their-password', 10).then(hash =>
  db.client.create({ data: {
    email: 'client@company.com',
    name: 'Client Name',
    company: 'Company Pte Ltd',
    passwordHash: hash
  }}).then(c => { console.log('Created:', c.email); db.\$disconnect(); })
);
"
```

---

## Project structure

```
growsmart-ai/
├── app/
│   ├── api/
│   │   ├── ai/route.js              ← Secure Claude proxy (KEY FILE)
│   │   └── auth/[...nextauth]/      ← Login handler
│   ├── dashboard/                   ← Home page
│   ├── content/                     ← Module 1
│   ├── leads/                       ← Module 2
│   ├── chatbot/                     ← Module 3
│   ├── ops/                         ← Module 4
│   ├── login/                       ← Login page
│   ├── layout.js                    ← Root layout
│   ├── page.js                      ← Redirect to /dashboard
│   ├── providers.js                 ← Session provider
│   └── globals.css
├── bot/
│   ├── index.js                     ← Telegram bot
│   └── helpers.js                   ← callAI() helper
├── components/shared/
│   ├── Sidebar.js                   ← Navigation
│   └── AIOutput.js                  ← AI output display
├── lib/
│   ├── claude.js                    ← Claude client + system prompts
│   ├── db.js                        ← Prisma singleton
│   └── useAI.js                     ← React hook
├── prisma/
│   ├── schema.prisma                ← Database schema
│   └── seed.js                      ← Demo user seed
├── middleware.js                    ← Route protection
├── .env.example                     ← Copy to .env.local
├── .gitignore
├── jsconfig.json
├── next.config.js
├── postcss.config.js
├── tailwind.config.js
└── package.json
```

---

## Tech stack

| Layer | Tool | Why |
|-------|------|-----|
| Web framework | Next.js 14 | App + API in one project |
| Styling | Tailwind CSS | Fast, consistent UI |
| AI | Anthropic Claude | Best-in-class for content |
| Database | Railway PostgreSQL + Prisma | One platform, simple ORM |
| Auth | NextAuth.js | Secure session management |
| Bot | Telegraf.js | Works with your Mattel setup |
| Hosting | Railway | One dashboard for everything |
