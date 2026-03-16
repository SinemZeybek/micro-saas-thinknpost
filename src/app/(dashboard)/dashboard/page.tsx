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
import { CopyButton } from "@/components/shared/copy-button";
import { DeleteButton } from "@/components/shared/delete-button";
import { UpgradeButton } from "@/components/shared/upgrade-button";
import { PlatformMockup } from "@/components/shared/platform-mockups";
import { Sparkles, FileText, Crown, ChevronLeft, ChevronRight } from "lucide-react";

const DAILY_LIMITS = { FREE: 5, PRO: 50 } as const;
const POSTS_PER_PAGE = 10;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  if (!user) return null;

  // Get total post count for pagination
  const totalPosts = await prisma.post.count({
    where: { userId: user.id },
  });

  // Get posts for current page
  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
  });

  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

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
              {totalPosts}
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
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Posts
        </h2>
        {totalPages > 1 && (
          <span className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>
      {posts.length === 0 && currentPage === 1 ? (
        <Card className="border-dashed border-violet-200">
          <CardContent className="py-12 text-center text-gray-400">
            No posts yet. Click &quot;Generate Post&quot; to create your first
            one!
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {posts.map((post) => (
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
                      <CopyButton text={post.content} />
                      <FavoriteButton
                        postId={post.id}
                        initialFavorite={post.isFavorite}
                      />
                      <DeleteButton postId={post.id} />
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-xs text-gray-400">
                    Prompt: {post.prompt}
                  </p>
                  {post.imageUrl && (
                    <div className="mb-3 overflow-hidden rounded-xl border border-violet-100">
                      <img
                        src={post.imageUrl}
                        alt="AI generated visual"
                        className="w-full object-cover"
                        style={{
                          aspectRatio:
                            post.orientation === "PORTRAIT"
                              ? "9/16"
                              : post.orientation === "LANDSCAPE"
                                ? "16/9"
                                : "1/1",
                          maxHeight: post.orientation === "PORTRAIT" ? "300px" : undefined,
                        }}
                      />
                    </div>
                  )}
                  <PlatformMockup
                    platform={post.platform}
                    content={post.content}
                    userName={user.name || "You"}
                    userImage={user.image || undefined}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {currentPage > 1 ? (
                <Link href={`/dashboard?page=${currentPage - 1}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-1 border-violet-200 hover:bg-violet-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 border-violet-100 text-gray-300"
                  disabled
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}

              <span className="px-3 text-sm text-gray-500">
                {currentPage} / {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link href={`/dashboard?page=${currentPage + 1}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer gap-1 border-violet-200 hover:bg-violet-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 border-violet-100 text-gray-300"
                  disabled
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
