import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-violet-50/50 via-white to-fuchsia-50/30 px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50">
        <Ghost className="h-8 w-8 text-violet-400" />
      </div>
      <h1 className="mb-2 text-5xl font-bold text-gray-900">404</h1>
      <p className="mb-2 text-xl font-semibold text-gray-700">
        Page not found
      </p>
      <p className="mb-8 max-w-md text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/generate">
          <Button className="cursor-pointer gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500">
            Start Generating
          </Button>
        </Link>
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
