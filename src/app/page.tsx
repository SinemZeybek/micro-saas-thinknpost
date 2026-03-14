import Link from "next/link";
import { Sparkles, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="text-lg font-bold">ThinkNPost</span>
          <Link href="/login">
            <Button className="cursor-pointer" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="max-w-2xl text-5xl font-bold tracking-tight">
          AI-Powered Social Media
          <br />
          Content Generator
        </h1>
        <p className="mt-4 max-w-lg text-lg text-gray-500">
          Create optimized posts for Twitter, LinkedIn, and Instagram in
          seconds. Choose your platform, pick a tone, and let AI do the rest.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/login">
            <Button className="cursor-pointer" size="lg">
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid max-w-4xl grid-cols-3 gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold">AI Generation</h3>
            <p className="text-sm text-gray-500">
              Powered by Google Gemini. Generate platform-optimized posts
              instantly.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold">Multi-Platform</h3>
            <p className="text-sm text-gray-500">
              Twitter, LinkedIn, Instagram. Each post is tailored to the
              platform.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-semibold">Save Favorites</h3>
            <p className="text-sm text-gray-500">
              Keep your best posts saved and organized for easy access later.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-gray-400">
        ThinkNPost &mdash; Built with Next.js, Prisma & Google Gemini
      </footer>
    </div>
  );
}
