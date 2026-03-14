import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { Sparkles, FileText, Crown } from "lucide-react";

const DAILY_LIMITS = { FREE: 5, PRO: 50 } as const;

export default async function DashboardPage() {
  const session = await getSession();

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastUsage = new Date(user.lastUsageDate);
  lastUsage.setHours(0, 0, 0, 0);
  const todayUsage =
    today.getTime() === lastUsage.getTime() ? user.dailyUsage : 0;
  const limit = DAILY_LIMITS[user.plan];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="mt-1 text-gray-400">
            Here&apos;s your content overview
          </p>
        </div>
        <Link href="/generate">
          <Button className="cursor-pointer gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-md shadow-violet-200 transition-shadow hover:shadow-lg hover:shadow-violet-300">
            <Sparkles className="h-4 w-4" />
            Generate Post
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-3 gap-4">
        <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-violet-500">
              <Sparkles className="h-3.5 w-3.5" />
              Today&apos;s Usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-violet-700">
              {todayUsage}{" "}
              <span className="text-sm font-normal text-violet-400">
                / {limit}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-teal-100 bg-gradient-to-br from-teal-50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-teal-500">
              <FileText className="h-3.5 w-3.5" />
              Total Posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-teal-700">
              {user.posts.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-amber-500">
              <Crown className="h-3.5 w-3.5" />
              Plan
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Recent Posts
      </h2>
      {user.posts.length === 0 ? (
        <Card className="border-dashed border-violet-200">
          <CardContent className="py-12 text-center text-gray-400">
            No posts yet. Click &quot;Generate Post&quot; to create your first
            one!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {user.posts.map((post) => (
            <Card
              key={post.id}
              className="border-violet-100/60 transition-colors hover:border-violet-200"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-violet-200 text-violet-600"
                  >
                    {post.platform}
                  </Badge>
                  <Badge className="bg-violet-50 text-violet-600 hover:bg-violet-100">
                    {post.tone}
                  </Badge>
                  <span className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <FavoriteButton
                      postId={post.id}
                      initialFavorite={post.isFavorite}
                    />
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-xs text-gray-400">
                  Prompt: {post.prompt}
                </p>
                <div className="whitespace-pre-wrap rounded-xl bg-violet-50/50 p-4 text-sm leading-relaxed text-gray-700">
                  {post.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
