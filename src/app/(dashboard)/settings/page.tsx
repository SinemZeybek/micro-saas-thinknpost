import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UpgradeButton } from "@/components/shared/upgrade-button";
import { CancelSubscriptionButton } from "@/components/shared/cancel-subscription-button";
import { User, Mail, Crown, Calendar, FileText, Sparkles, Clock } from "lucide-react";

const DAILY_LIMITS = { FREE: 5, PRO: 200 } as const;

export default async function SettingsPage() {
  const session = await getSession();

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  if (!user) return null;

  const totalPosts = await prisma.post.count({
    where: { userId: user.id },
  });

  const totalFavorites = await prisma.post.count({
    where: { userId: user.id, isFavorite: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastUsage = new Date(user.lastUsageDate);
  lastUsage.setHours(0, 0, 0, 0);
  const todayUsage =
    today.getTime() === lastUsage.getTime() ? user.dailyUsage : 0;
  const limit = DAILY_LIMITS[user.plan];

  // Calculate days remaining on subscription
  const subscriptionEndsAt = user.subscriptionEndsAt;
  const daysRemaining = subscriptionEndsAt
    ? Math.max(0, Math.ceil((subscriptionEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="mb-2 text-2xl sm:text-4xl font-bold text-gray-900">Settings</h1>
      <p className="mb-8 text-lg text-gray-400">
        Your account information and subscription details.
      </p>

      {/* Profile Card */}
      <Card className="mb-6 border-violet-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <User className="h-5 w-5 text-violet-500" />
            Profile
          </CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "Profile"}
                className="h-14 w-14 rounded-full border-2 border-violet-200"
              />
            )}
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {user.name || "No name"}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-gray-400">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </p>
            </div>
          </div>

          <Separator className="bg-violet-100/60" />

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-3.5 w-3.5 text-violet-400" />
            Member since {new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      <Card className="mb-6 border-violet-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Crown className="h-5 w-5 text-amber-500" />
            Subscription
          </CardTitle>
          <CardDescription>Your current plan and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Current Plan</span>
            <div className="flex items-center gap-3">
              <Badge
                className={
                  user.plan === "PRO"
                    ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white"
                    : "border-violet-200 bg-violet-50 text-violet-600"
                }
                variant="outline"
              >
                {user.plan}
              </Badge>
              {user.plan === "FREE" && <UpgradeButton />}
            </div>
          </div>

          {/* Subscription period info for PRO users */}
          {user.plan === "PRO" && subscriptionEndsAt && (
            <>
              <Separator className="bg-violet-100/60" />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    Current Period Ends
                  </span>
                  <span className="font-medium text-gray-700">
                    {subscriptionEndsAt.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {daysRemaining !== null && (
                  <p className="text-xs text-gray-400 ml-5">
                    {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining in this billing period
                  </p>
                )}
              </div>
            </>
          )}

          <Separator className="bg-violet-100/60" />

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-500">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                Today&apos;s Usage
              </span>
              <span className="font-medium text-gray-700">
                {todayUsage} / {limit} posts
              </span>
            </div>

            {/* Usage bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-violet-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                style={{ width: `${Math.min(100, (todayUsage / limit) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-500">
                <FileText className="h-3.5 w-3.5 text-teal-400" />
                Total Posts Generated
              </span>
              <span className="font-medium text-gray-700">{totalPosts}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-500">
                <span className="text-rose-400">&#9829;</span>
                Favorites Saved
              </span>
              <span className="font-medium text-gray-700">{totalFavorites}</span>
            </div>
          </div>

          {/* Cancel subscription for PRO users */}
          {user.plan === "PRO" && user.polarSubscriptionId && (
            <>
              <Separator className="bg-violet-100/60" />
              <div className="pt-1">
                <CancelSubscriptionButton />
              </div>
            </>
          )}

          {user.plan === "FREE" && (
            <>
              <Separator className="bg-violet-100/60" />
              <div className="rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50/30 p-4">
                <p className="mb-1 text-sm font-medium text-violet-700">
                  Upgrade to PRO
                </p>
                <p className="text-xs text-violet-500">
                  Get 200 posts/day, 5 knowledge sources, 100 saved ideas, and more. Generate more content and grow faster.
                </p>
                <div className="mt-3">
                  <UpgradeButton />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
