/**
 * Checkout Success Page
 *
 * Users land here after completing payment on Polar.
 * We show a celebration message and link them back to
 * the generate page so they can start using their PRO features.
 *
 * Note: The actual plan upgrade happens via the webhook,
 * not on this page. This is just a "thank you" screen.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Sparkles, ArrowRight } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50/30 via-white to-fuchsia-50/20 px-6">
      <Card className="w-full max-w-md border-amber-100 shadow-xl shadow-amber-100/30">
        <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg shadow-amber-200">
            <Crown className="h-8 w-8 text-white" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to PRO! 🎉
            </h1>
            <p className="mt-2 text-gray-500">
              Your account has been upgraded. You now have{" "}
              <span className="font-semibold text-amber-600">
                50 posts per day
              </span>{" "}
              to create amazing content.
            </p>
          </div>

          {/* CTA */}
          <Link href="/generate" className="w-full">
            <Button className="w-full cursor-pointer gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-md shadow-violet-200 transition-shadow hover:shadow-lg hover:shadow-violet-300">
              <Sparkles className="h-4 w-4" />
              Start Generating
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <p className="text-xs text-gray-400">
            Your subscription is managed through Polar. You can cancel anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
