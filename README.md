# ThinkNPost

AI-powered social media content generator. Create optimized posts for Twitter, LinkedIn, Instagram, and TikTok with AI-generated text and images. Upload your product knowledge, generate content ideas, and plan your week with a visual content calendar.

**Live:** [thinknpost.vercel.app](https://thinknpost.vercel.app) · **Railway:** [bountiful-passion-production-e1ed.up.railway.app](https://bountiful-passion-production-e1ed.up.railway.app)

## Features

### Content Generation
- **AI Post Generation** — Generate platform-specific content with customizable tone (professional, casual, humorous, inspirational) and length (short/long)
- **Multi-Platform Support** — Twitter/X, LinkedIn, Instagram, and TikTok with platform-aware formatting and character limits
- **AI Image Generation** (PRO) — Create matching visuals in portrait, landscape, or square orientation using Gemini
- **A/B Variations** (PRO) — Generate 3 different versions of a post for comparison
- **Image Regeneration** (PRO) — Regenerate images without changing the post text
- **Platform Mockups** — Preview how posts will look on each platform

### ThinkBank (RAG Pipeline)
- **Knowledge Upload** — Upload PDFs, text files, or add website URLs as knowledge sources
- **Context-Stuffing RAG** — Uses Gemini's 1M token context window to combine all sources into one prompt (no vector DB needed)
- **Content Idea Generation** — AI generates 2-3 content ideas by combining knowledge from all uploaded sources
- **Source Attribution** — Each idea shows which sources it was based on
- **Plan Limits** — FREE: 2 sources / 30 ideas kept, PRO: 5 sources / 100 ideas kept

### PostCalendar (7-Day Content Planner)
- **Visual Calendar Grid** — 7-day calendar starting from today with color-coded day cards
- **AI-Generated Plans** — Each day gets a unique content idea with suggested posting time, based on your ThinkBank knowledge
- **Another Idea** — Generate alternative ideas per day (FREE: 2 per day, PRO: 3 per day)
- **Generate Post** — One click to turn any calendar idea into a full post on the Generate page
- **Plan Limits** — FREE: 1 calendar saved, PRO: 4 calendars saved

### Dashboard & Organization
- **Post Editing** — Inline edit posts after generation
- **Favorites** — Save and organize your best generated posts
- **Dashboard Analytics** — Track platform/tone usage stats with visual breakdowns
- **Search & Filters** — Search posts by content/prompt, filter by platform and tone
- **CSV Export** — Download your post history as a CSV file

### General
- **Free & Pro Plans** — 5 posts/day (FREE) or 200 posts/day (PRO) via Polar.sh
- **Google OAuth** — One-click sign in with Google
- **Toast Notifications** — Feedback for all actions using Sonner
- **Keyboard Shortcuts** — Ctrl+Enter to generate posts
- **Responsive Design** — Fully functional on mobile and desktop

## Tech Stack

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Framework      | Next.js 16 (App Router)          |
| Language       | TypeScript (strict)               |
| Styling        | Tailwind CSS 4 + shadcn/ui       |
| Font           | Plus Jakarta Sans                 |
| Database       | PostgreSQL (Supabase)             |
| ORM            | Prisma                            |
| Auth           | NextAuth.js (Google OAuth)        |
| AI             | Google Gemini 2.5 Flash (`@google/genai`) |
| PDF Extraction | unpdf                             |
| HTML Parsing   | cheerio                           |
| File Storage   | Supabase Storage                  |
| Payments       | Polar.sh                          |
| Testing        | Vitest (58 tests)                 |
| Containerization | Docker + Docker Compose          |
| Cache/Queue    | Redis 7                           |
| CI/CD          | GitHub Actions                    |
| Deployment     | Vercel · Railway · Docker         |

## Architecture

```
src/
├── app/
│   ├── (auth)/               # Login & register pages
│   ├── (dashboard)/
│   │   ├── generate/         # AI content generation (primary page)
│   │   ├── dashboard/        # Posts overview, analytics, search/filters
│   │   ├── knowledge/        # ThinkBank — upload sources, generate ideas
│   │   ├── calendar/         # PostCalendar — 7-day content planner
│   │   ├── favorites/        # Saved posts
│   │   └── settings/         # Profile & plan info
│   └── api/
│       ├── auth/             # NextAuth API route
│       ├── generate/         # Single post generation
│       ├── generate-ab/      # A/B variations (3 versions)
│       ├── knowledge/        # CRUD for knowledge sources
│       │   └── [id]/         # DELETE knowledge source
│       ├── ideas/            # Content ideas
│       │   └── generate/     # POST generate ideas from knowledge
│       ├── calendar/         # Calendar weeks CRUD
│       │   ├── generate/     # POST generate 7-day calendar
│       │   ├── another-idea/ # POST generate alternative idea for a day
│       │   └── [id]/         # DELETE calendar week
│       ├── checkout/         # Polar.sh checkout session
│       ├── posts/
│       │   ├── [id]/         # PATCH (edit), DELETE
│       │   │   ├── favorite/ # POST (toggle favorite)
│       │   │   └── regenerate-image/ # POST (regenerate image)
│       │   └── export/       # GET (CSV download)
│       └── webhooks/polar/   # Subscription webhook handler
├── components/
│   ├── shared/               # App components (navbar, cards, file upload, etc.)
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── auth.ts               # NextAuth config (Google OAuth + Prisma adapter)
│   ├── gemini.ts             # Gemini client (text, A/B, image generation)
│   ├── knowledge/            # Knowledge pipeline modules (SRP)
│   │   ├── extract-pdf.ts    # PDF text extraction (unpdf)
│   │   ├── extract-text.ts   # Plain text file extraction
│   │   ├── extract-url.ts    # Web page extraction (cheerio)
│   │   ├── upload-file.ts    # Supabase Storage upload
│   │   ├── build-context.ts  # Combine all sources into prompt
│   │   ├── generate-ideas.ts # Gemini content idea generation
│   │   ├── generate-calendar.ts # Gemini 7-day calendar generation
│   │   └── index.ts          # Barrel exports
│   ├── prisma.ts             # Prisma client singleton
│   ├── polar.ts              # Polar.sh client
│   ├── supabase.ts           # Supabase Storage client
│   └── session.ts            # Server-side session helper
├── __tests__/                # 58 tests across 13 test files
│   ├── api/                  # API route tests
│   └── lib/                  # Library module tests
└── types/
    └── index.ts              # Shared TypeScript types
```

## API Routes

| Method | Route | Description |
| ------ | ----- | ----------- |
| POST   | `/api/generate` | Generate a single post (optionally with image) |
| POST   | `/api/generate-ab` | Generate 3 A/B variations (PRO) |
| GET    | `/api/knowledge` | List knowledge sources |
| POST   | `/api/knowledge` | Upload file or add URL as knowledge source |
| DELETE | `/api/knowledge/[id]` | Delete a knowledge source |
| GET    | `/api/ideas` | List content ideas |
| POST   | `/api/ideas/generate` | Generate content ideas from knowledge |
| GET    | `/api/calendar` | List calendar weeks |
| POST   | `/api/calendar/generate` | Generate 7-day content calendar |
| POST   | `/api/calendar/another-idea` | Generate alternative idea for a calendar day |
| DELETE | `/api/calendar/[id]` | Delete a calendar week |
| PATCH  | `/api/posts/[id]` | Edit post content |
| DELETE | `/api/posts/[id]` | Delete a post |
| POST   | `/api/posts/[id]/favorite` | Toggle favorite |
| POST   | `/api/posts/[id]/regenerate-image` | Regenerate image (PRO) |
| GET    | `/api/posts/export` | Export all posts as CSV |
| POST   | `/api/checkout` | Create Polar.sh checkout session |
| POST   | `/api/webhooks/polar` | Handle subscription events |

## Plan Comparison

| Feature | FREE | PRO |
| ------- | ---- | --- |
| Daily Posts | 5/day | 200/day |
| Knowledge Sources | 2 | 5 |
| Content Ideas Kept | 30 | 100 |
| Calendar Weeks Saved | 1 | 4 |
| Ideas per Calendar Day | 2 | 3 |
| File Upload Size | 10MB | 40MB |
| AI Image Generation | - | Yes |
| Image Regeneration | - | Yes |
| A/B Test Variations | - | Yes |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- Google Cloud Console project (for OAuth)
- Google Gemini API key
- [Polar.sh](https://polar.sh) account (for payments, optional)

### Environment Variables

```env
# Database (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI
GEMINI_API_KEY=your-gemini-api-key

# Payments (optional)
POLAR_ACCESS_TOKEN=your-polar-token
POLAR_PRODUCT_ID=your-product-id
POLAR_WEBHOOK_SECRET=your-webhook-secret

# Storage (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/SinemZeybek/micro-saas-thinknpost.git
   cd micro-saas-thinknpost
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your credentials as shown above.

4. **Push database schema**
   ```bash
   npx prisma db push
   ```

5. **Start the dev server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Docker Setup (Alternative)

Run the entire stack (app + PostgreSQL + Redis) in containers:

1. **Install [Docker Desktop](https://docker.com/products/docker-desktop)**

2. **Create your Docker env file**
   ```bash
   cp .env.docker.example .env.docker
   ```
   Fill in your API keys (Google OAuth, Gemini, Polar, Supabase Storage).

3. **Start everything**
   ```bash
   docker-compose up --build
   ```
   This will:
   - Start a PostgreSQL 16 database (no Supabase needed for DB)
   - Start a Redis 7 cache
   - Build and start the Next.js app
   - Auto-run `prisma db push` to create tables

4. **Open [http://localhost:3000](http://localhost:3000)**

Useful commands:
```bash
docker-compose up -d          # Run in background (detached)
docker-compose down           # Stop everything
docker-compose down -v        # Stop & wipe all data (volumes)
docker-compose up --build     # Rebuild after code changes
docker-compose logs app       # View app logs
docker-compose logs db        # View database logs
```

### Railway Setup (Alternative)

Deploy to [Railway](https://railway.com) with PostgreSQL + Redis — all in one platform:

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Create project and add services**
   ```bash
   railway init --name thinknpost
   ```
   Then in the Railway dashboard, click **+ New → Database → PostgreSQL** and **+ New → Database → Redis**.

3. **Link and configure the app service**
   ```bash
   railway service <your-service-name>
   railway variables set \
     DATABASE_URL="<from Postgres service>" \
     DIRECT_URL="<from Postgres service>" \
     REDIS_URL="<from Redis service>" \
     NEXTAUTH_URL="https://<your-domain>.up.railway.app" \
     NEXTAUTH_SECRET="your-secret" \
     GOOGLE_CLIENT_ID="your-id" \
     GOOGLE_CLIENT_SECRET="your-secret" \
     GEMINI_API_KEY="your-key"
   ```

4. **Deploy**
   ```bash
   railway up
   ```
   Railway builds from the Dockerfile and auto-runs `prisma db push` at startup.

5. **Generate a public URL**
   ```bash
   railway domain
   ```

### Supabase Storage Setup

1. Go to your Supabase dashboard → Storage
2. Create a **public** bucket named `post-images` (for AI-generated images)
3. Create a **public** bucket named `knowledge-files` (for uploaded PDFs/text files, 10MB limit)
4. Add policies allowing public reads (SELECT) for both buckets

## Testing

```bash
npm test          # Run all 58 tests
npm run test:watch # Watch mode
```

## CI/CD

GitHub Actions runs automatically on every push to `main` and on pull requests:

- **Lint & Type Check** — ESLint + TypeScript compiler
- **Tests** — All 58 Vitest tests
- **Docker Build** — Verifies the Docker image builds successfully (push to main only)

See `.github/workflows/ci.yml` for the pipeline configuration.

## Deployment

| Platform | What | Database | Redis | URL |
| -------- | ---- | -------- | ----- | --- |
| **Vercel** | App only | Supabase (external) | - | [thinknpost.vercel.app](https://thinknpost.vercel.app) |
| **Railway** | App + DB + Redis | Railway PostgreSQL | Railway Redis | [bountiful-passion-production-e1ed.up.railway.app](https://bountiful-passion-production-e1ed.up.railway.app) |
| **Docker** | Local dev | Container (port 5432) | Container (port 6380) | localhost:3000 |

## Database Schema

### Models
- **User** — email, name, plan (FREE/PRO), daily usage tracking, Polar customer/subscription IDs
- **Post** — platform, tone, length, prompt, generated content, optional image URL & orientation, favorite flag
- **KnowledgeSource** — type (PDF/TEXT/URL), name, raw text content, file URL, user relation
- **ContentIdea** — title, summary, platform, source names, user relation
- **CalendarWeek** — start date, source names, user relation
- **CalendarDay** — day of week, title, summary, platform, suggested time, calendar week relation

### Enums
- **Plan** — `FREE`, `PRO`
- **Platform** — `TWITTER`, `LINKEDIN`, `INSTAGRAM`, `TIKTOK`
- **Tone** — `PROFESSIONAL`, `CASUAL`, `HUMOROUS`, `INSPIRATIONAL`
- **Orientation** — `PORTRAIT`, `LANDSCAPE`, `SQUARE`
- **KnowledgeSourceType** — `PDF`, `TEXT`, `URL`

## License

MIT
