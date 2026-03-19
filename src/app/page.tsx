import Link from "next/link";
import {
  Sparkles,
  Zap,
  Heart,
  ArrowRight,
  Image,
  FlaskConical,
  Check,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-violet-50/50 via-white to-fuchsia-50/30">
      {/* Header */}
      <header className="border-b border-violet-100/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-xl sm:text-2xl font-bold text-transparent">
            ThinkNPost
          </span>
          <div className="flex items-center gap-3">
            <a href="#pricing" className="text-sm font-medium text-gray-500 hover:text-violet-600 transition-colors">
              Pricing
            </a>
            <Link href="/login">
              <Button
                variant="outline"
                className="cursor-pointer border-violet-200 text-violet-700 hover:bg-violet-50"
                size="sm"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center px-4 sm:px-6">
        <section className="flex flex-col items-center justify-center py-20 text-center">
          {/* Badge */}
          <div className="mb-6 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700">
            Powered by Google Gemini AI
          </div>

          <h1 className="max-w-3xl text-5xl sm:text-6xl font-bold leading-tight tracking-tight text-gray-900">
            Create social media posts{" "}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              in seconds
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-500">
            Generate optimized content for Twitter, LinkedIn, Instagram, and
            TikTok. Choose your platform, pick a tone, and let AI craft the
            perfect post.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/generate">
              <Button
                className="cursor-pointer gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 shadow-lg shadow-violet-200 transition-shadow hover:shadow-xl hover:shadow-violet-300"
                size="lg"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-sm text-gray-400">
            No credit card required &middot; 5 free posts per day
          </p>
        </section>

        {/* Features */}
        <section className="w-full max-w-5xl py-16">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Everything you need to create{" "}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              great content
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition-all hover:border-violet-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                <Sparkles className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">
                AI Generation
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Powered by Google Gemini. Generate platform-optimized posts
                instantly with one click.
              </p>
            </div>
            <div className="group rounded-2xl border border-teal-100 bg-white p-6 shadow-sm transition-all hover:border-teal-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100">
                <Zap className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Multi-Platform
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Twitter, LinkedIn, Instagram, TikTok. Each post is tailored to
                the platform&apos;s unique style.
              </p>
            </div>
            <div className="group rounded-2xl border border-amber-100 bg-white p-6 shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <Image className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">
                AI Images
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Generate matching visuals for your posts in portrait, landscape,
                or square format.
              </p>
            </div>
            <div className="group rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition-all hover:border-rose-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100">
                <FlaskConical className="h-6 w-6 text-rose-500" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">
                A/B Testing
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Generate 3 variations of your post and pick the best one. Compare
                side by side.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="w-full max-w-4xl py-16">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
            Simple,{" "}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              transparent pricing
            </span>
          </h2>
          <p className="mb-12 text-center text-gray-500">
            Start for free, upgrade when you need more.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">Free</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Perfect for getting started
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "5 posts per day",
                  "All 4 platforms",
                  "4 tone options",
                  "Save favorites",
                  "Post history",
                  "Copy & export posts",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-teal-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="mt-8 block">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer border-violet-200 text-violet-700 hover:bg-violet-50"
                  size="lg"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-2xl border-2 border-violet-300 bg-white p-8 shadow-lg shadow-violet-100/50">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-1 text-xs font-semibold text-white">
                MOST POPULAR
              </div>
              <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Crown className="h-5 w-5 text-amber-500" />
                Pro
              </h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">€5</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                For power users and creators
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "50 posts per day",
                  "AI image generation",
                  "A/B test variations (3 versions)",
                  "Image regeneration",
                  "All Free features included",
                  "Priority support",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-violet-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="mt-8 block">
                <Button
                  className="w-full cursor-pointer bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-200 transition-shadow hover:shadow-xl hover:shadow-violet-300"
                  size="lg"
                >
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-violet-100/60 py-8 text-center text-sm text-gray-400">
        <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text font-semibold text-transparent">
          ThinkNPost
        </span>{" "}
        &mdash; Built with Next.js, Prisma &amp; Google Gemini
      </footer>
    </div>
  );
}
