# ThinkNPost

AI-powered social media content generator. Create optimized posts for Twitter, LinkedIn, Instagram, and TikTok with AI-generated text and images.

**Live:** [micro-saas-sinem.vercel.app](https://micro-saas-sinem.vercel.app)

## Features

- **AI Post Generation** — Generate platform-specific content with customizable tone (professional, casual, humorous, inspirational) and length (short/long)
- **Multi-Platform Support** — Twitter/X, LinkedIn, Instagram, and TikTok with platform-aware formatting and character limits
- **AI Image Generation** (PRO) — Create matching visuals in portrait, landscape, or square orientation using Gemini
- **A/B Variations** (PRO) — Generate 3 different versions of a post for comparison
- **Image Regeneration** (PRO) — Regenerate images without changing the post text
- **Platform Mockups** — Preview how posts will look on each platform
- **Post Editing** — Inline edit posts after generation
- **Favorites** — Save and organize your best generated posts
- **Dashboard Analytics** — Track platform/tone usage stats with visual breakdowns
- **Search & Filters** — Search posts by content/prompt, filter by platform and tone
- **CSV Export** — Download your post history as a CSV file
- **Free & Pro Plans** — 5 posts/day (FREE) or 50 posts/day (PRO) via Polar.sh
- **Google OAuth** — One-click sign in with Google
- **Toast Notifications** — Feedback for all actions using Sonner
- **Keyboard Shortcuts** — Ctrl+Enter to generate posts

## Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Framework    | Next.js 16 (App Router)          |
| Language     | TypeScript                        |
| Styling      | Tailwind CSS 4 + shadcn/ui       |
| Font         | Plus Jakarta Sans                 |
| Database     | PostgreSQL (Supabase)             |
| ORM          | Prisma                            |
| Auth         | NextAuth.js (Google OAuth)        |
| AI           | Google Gemini (`@google/genai`)   |
| Image Storage| Supabase Storage                  |
| Payments     | Polar.sh                          |
| Deployment   | Vercel                            |

## Architecture

```
src/
├── app/
│   ├── (auth)/               # Login & register pages
│   ├── (dashboard)/
│   │   ├── generate/         # AI content generation (primary page)
│   │   ├── dashboard/        # Posts overview, analytics, search/filters
│   │   ├── favorites/        # Saved posts
│   │   └── settings/         # Profile & plan info
│   └── api/
│       ├── auth/             # NextAuth API route
│       ├── generate/         # Single post generation
│       ├── generate-ab/      # A/B variations (3 versions)
│       ├── checkout/         # Polar.sh checkout session
│       ├── posts/
│       │   ├── [id]/         # PATCH (edit), DELETE
│       │   │   ├── favorite/ # POST (toggle favorite)
│       │   │   └── regenerate-image/ # POST (regenerate image)
│       │   └── export/       # GET (CSV download)
│       └── webhooks/polar/   # Subscription webhook handler
├── components/
│   ├── shared/               # App components (navbar, buttons, mockups)
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── auth.ts               # NextAuth config (Google OAuth + Prisma adapter)
│   ├── gemini.ts             # Gemini client (text, A/B, image generation)
│   ├── prisma.ts             # Prisma client singleton
│   ├── polar.ts              # Polar.sh client
│   ├── supabase.ts           # Supabase Storage client
│   └── session.ts            # Server-side session helper
└── types/
    └── index.ts              # Shared TypeScript types
```

## API Routes

| Method | Route | Description |
| ------ | ----- | ----------- |
| POST   | `/api/generate` | Generate a single post (optionally with image) |
| POST   | `/api/generate-ab` | Generate 3 A/B variations (PRO) |
| PATCH  | `/api/posts/[id]` | Edit post content |
| DELETE | `/api/posts/[id]` | Delete a post |
| POST   | `/api/posts/[id]/favorite` | Toggle favorite |
| POST   | `/api/posts/[id]/regenerate-image` | Regenerate image (PRO) |
| GET    | `/api/posts/export` | Export all posts as CSV |
| POST   | `/api/checkout` | Create Polar.sh checkout session |
| POST   | `/api/webhooks/polar` | Handle subscription events |

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

# Image Storage (optional, for AI images)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/emredemirel41/micro-saas-sinem.git
   cd micro-saas-sinem
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

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the dev server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Supabase Storage Setup (for AI images)

1. Go to your Supabase dashboard → Storage
2. Create a new **public** bucket named `post-images`
3. Add a policy allowing public reads (SELECT) for all users

## Database Schema

### Models
- **User** — email, name, plan (FREE/PRO), daily usage tracking, Polar customer/subscription IDs
- **Post** — platform, tone, length, prompt, generated content, optional image URL & orientation, favorite flag

### Enums
- **Plan** — `FREE`, `PRO`
- **Platform** — `TWITTER`, `LINKEDIN`, `INSTAGRAM`, `TIKTOK`
- **Tone** — `PROFESSIONAL`, `CASUAL`, `HUMOROUS`, `INSPIRATIONAL`
- **Orientation** — `PORTRAIT`, `LANDSCAPE`, `SQUARE`

## License

MIT
