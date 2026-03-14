import Link from "next/link";
import { Sparkles, Zap, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-violet-50/50 via-white to-fuchsia-50/30">
      {/* Header */}
      <header className="border-b border-violet-100/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-xl font-bold text-transparent">
            ThinkNPost
          </span>
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
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        {/* Badge */}
        <div className="mb-6 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700">
          Powered by Google Gemini AI
        </div>

        <h1 className="max-w-3xl text-6xl font-bold leading-tight tracking-tight text-gray-900">
          Create social media posts{" "}
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
            in seconds
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-500">
          Generate optimized content for Twitter, LinkedIn, and Instagram.
          Choose your platform, pick a tone, and let AI craft the perfect post.
        </p>
        <div className="mt-10 flex gap-4">
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

        {/* Features */}
        <div className="mt-24 grid max-w-4xl grid-cols-3 gap-6">
          <div className="group rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition-all hover:border-violet-200 hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
              <Sparkles className="h-6 w-6 text-violet-600" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">AI Generation</h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Powered by Google Gemini. Generate platform-optimized posts
              instantly with one click.
            </p>
          </div>
          <div className="group rounded-2xl border border-teal-100 bg-white p-6 shadow-sm transition-all hover:border-teal-200 hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100">
              <Zap className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">Multi-Platform</h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Twitter, LinkedIn, Instagram. Each post is tailored to the
              platform&apos;s unique style.
            </p>
          </div>
          <div className="group rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition-all hover:border-rose-200 hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100">
              <Heart className="h-6 w-6 text-rose-500" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900">
              Save Favorites
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Keep your best posts saved and organized for easy access anytime.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-violet-100/60 py-8 text-center text-sm text-gray-400">
        ThinkNPost &mdash; Built with Next.js, Prisma &amp; Google Gemini
      </footer>
    </div>
  );
}
