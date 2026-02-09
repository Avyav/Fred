# MindSupport Victoria

Free, confidential AI-powered mental health support for Victorian adults (18+).

Built with Next.js 14, Claude Sonnet 4.5, and PostgreSQL. Designed for cost-efficient operation with prompt caching, rate limiting, and usage tracking.

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **AI:** Anthropic Claude Sonnet 4.5 with prompt caching
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js v5 (credentials provider, JWT sessions)
- **UI:** shadcn/ui components, Lucide icons
- **State:** Zustand (client), React Hook Form + Zod (forms)

## Features

- AI-powered mental health support conversations
- Crisis detection with automatic resource surfacing
- Victorian mental health resource directory with AI matching
- Rate limiting (20 messages/day, 5 conversations/week)
- Prompt caching for cost reduction (~90% input token savings)
- Admin dashboards for crisis flags and cost monitoring
- Data export and account deletion
- Accessibility: ARIA labels, keyboard navigation, screen reader support

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Anthropic API key

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
DATABASE_URL=postgresql://user:password@host:5432/mindsupport
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Set up the database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with Victorian resources
pnpm db:seed
```

### 4. Start development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Management

```bash
pnpm db:generate   # Generate Prisma client
pnpm db:push       # Push schema changes
pnpm db:seed       # Seed resources
pnpm db:studio     # Open Prisma Studio
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Sign in/up pages
│   ├── (dashboard)/      # Authenticated pages (chat, resources, settings, admin)
│   ├── api/              # API routes (chat, auth, resources, crisis, user, admin)
│   ├── terms/            # Terms of Service
│   ├── privacy/          # Privacy Policy
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Auth forms
│   ├── chat/             # Chat interface components
│   ├── resources/        # Resource display components
│   ├── layout/           # Header, Footer
│   └── error-boundary.tsx
├── lib/
│   ├── ai/               # System prompt, prompt cache, context manager, safety checks
│   ├── auth/             # NextAuth config (edge + Node.js split)
│   ├── db/               # Prisma client singleton
│   ├── utils/            # Rate limiter, cost calculator
│   └── env.ts            # Environment variable validation
├── store/                # Zustand store
├── hooks/                # Custom hooks (toast)
├── types/                # TypeScript interfaces
└── config/               # App constants
```

## Deployment (Vercel)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Use a PostgreSQL provider with an Australian region (e.g., Supabase Sydney, Neon)
4. Deploy

### Environment Variables for Production

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Random 32+ character secret |
| `NEXTAUTH_URL` | Yes | Production URL |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `DAILY_MESSAGE_LIMIT` | No | Default: 20 |
| `WEEKLY_CONVERSATION_LIMIT` | No | Default: 5 |
| `DAILY_COST_THRESHOLD_CENTS` | No | Alert threshold |
| `MONTHLY_COST_THRESHOLD_CENTS` | No | Alert threshold |

## Cost Optimization

- **Prompt caching:** System prompt cached via `cache_control: { type: "ephemeral" }` — saves ~90% on repeated input tokens
- **Context windowing:** Last 10 messages sent to AI, older messages summarized
- **Model selection:** Claude Sonnet 4.5 exclusively (good balance of quality and cost)
- **Rate limiting:** Per-user daily/weekly limits prevent runaway costs
- **Short max tokens:** 300 tokens normal, 500 for crisis responses
- **Usage tracking:** Per-user daily cost logging with admin dashboard

### Estimated Costs

| Metric | Estimate |
|--------|----------|
| Per message (cached) | ~$0.003 |
| Per message (uncached) | ~$0.01 |
| Per user/day (20 msgs) | ~$0.06-0.20 |
| 100 daily active users | ~$6-20/day |

## Security

- Passwords hashed with bcrypt (cost factor 12)
- JWT sessions (7-day expiry)
- Edge middleware for route protection
- PII redaction in crisis flag snippets
- Admin routes gated by email domain
- Environment variable validation on startup
- HTTPS enforced in production

## Admin Access

Admin features are gated by email domain: `@admin.mindsupport.vic.gov.au`

- **Crisis Dashboard** (`/admin/crisis-flags`): View, filter, and handle crisis flags
- **Cost Monitoring** (`/admin/costs`): API costs, token usage, cache performance
