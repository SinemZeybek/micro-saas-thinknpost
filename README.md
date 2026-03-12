# ThinkNPost

AI-powered social media content generator. Create optimized posts for Twitter, LinkedIn, and Instagram with AI-generated text and images.

## Features

- **AI Post Generation** — Generate platform-specific content with customizable tone (professional, casual, humorous, inspirational)
- **Multi-Platform Support** — Twitter, LinkedIn, and Instagram with platform-aware formatting
- **AI Image Generation** — Create matching visuals in portrait, landscape, or square orientation
- **Favorites** — Save and organize your best generated posts
- **Free & Pro Plans** — Daily usage limits with upgrade path via Polar.sh
- **Google OAuth** — One-click sign in with Google

## Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Framework    | Next.js 16 (App Router)          |
| Language     | TypeScript                        |
| Styling      | Tailwind CSS 4 + shadcn/ui       |
| Database     | PostgreSQL (Supabase)             |
| ORM          | Prisma                            |
| Auth         | NextAuth.js (Google OAuth)        |
| AI           | Google Gemini API                 |
| Payments     | Polar.sh                          |
| Deployment   | Vercel                            |

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login & register pages
│   ├── (dashboard)/      # Main app pages
│   └── api/
│       ├── auth/         # NextAuth API route
│       └── generate/     # Post generation endpoint
├── components/
│   ├── shared/           # Reusable app components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── gemini.ts         # Gemini API client
│   ├── prisma.ts         # Prisma client singleton
│   └── utils.ts          # Utility functions
└── types/
    └── index.ts          # Shared TypeScript types

prisma/
├── schema.prisma         # Database schema
├── seed.ts               # Seed data for development
└── migrations/           # Database migrations
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- Google Cloud Console project (for OAuth)
- Google Gemini API key

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
   Fill in your Supabase connection strings, Google OAuth credentials, and Gemini API key.

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database** (optional)
   ```bash
   npx prisma db seed
   ```

6. **Start the dev server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Database Schema

### Models
- **User** — email, name, plan (FREE/PRO), daily usage tracking
- **Post** — platform, tone, prompt, generated content, optional image, favorites

### Enums
- **Plan** — `FREE`, `PRO`
- **Platform** — `TWITTER`, `LINKEDIN`, `INSTAGRAM`
- **Tone** — `PROFESSIONAL`, `CASUAL`, `HUMOROUS`, `INSPIRATIONAL`
- **Orientation** — `PORTRAIT`, `LANDSCAPE`, `SQUARE`

## License

MIT
