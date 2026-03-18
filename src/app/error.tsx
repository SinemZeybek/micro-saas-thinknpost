"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-violet-50/50 via-white to-fuchsia-50/30 px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="mb-2 text-3xl font-bold text-gray-900">
        Something went wrong
      </h2>
      <p className="mb-8 max-w-md text-gray-500">
        An unexpected error occurred. Please try again or go back to the home page.
      </p>
      <div className="flex gap-3">
        <Button
          onClick={reset}
          className="cursor-pointer bg-gradient-to-r from-violet-600 to-fuchsia-500"
        >
          Try Again
        </Button>
        <Link href="/">
          <Button
            variant="outline"
            className="cursor-pointer border-violet-200 text-violet-700 hover:bg-violet-50"
          >
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
