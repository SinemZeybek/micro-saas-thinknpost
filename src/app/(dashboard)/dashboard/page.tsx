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
import { EditButton } from "@/components/shared/edit-button";
import { UpgradeButton } from "@/components/shared/upgrade-button";
import { PlatformMockup } from "@/components/shared/platform-mockups";
import { ExportCSVButton } from "@/components/shared/export-csv-button";
import { Sparkles, FileText, Crown, ChevronLeft, ChevronRight, Search, BarChart3, Heart } from "lucide-react";

const DAILY_LIMITS = { FREE: 5, PRO: 200 } as const;
const POSTS_PER_PAGE = 10;

const PLATFORMS = ["TWITTER", "LINKEDIN", "INSTAGRAM", "TIKTOK"] as const;
const TONES = ["PROFESSIONAL", "CASUAL", "HUMOROUS", "INSPIRATIONAL"] as const;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; platform?: string; tone?: string; q?: string; from?: string; to?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const filterPlatform = params.platform || "";
  const filterTone = params.tone || "";
  const searchQuery = params.q || "";
  const dateFrom = params.from || "";
  const dateTo = params.to || "";

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  if (!user) return null;

  // Build filter conditions
  const where: Record<string, unknown> = { userId: user.id };
  if (filterPlatform) where.platform = filterPlatform;
  if (filterTone) where.tone = filterTone;
  if (searchQuery) {
    where.OR = [
      { content: { contains: searchQuery, mode: "insensitive" } },
      { prompt: { contains: searchQuery, mode: "insensitive" } },
    ];
  }
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      (where.createdAt as Record<string, unknown>).lte = endDate;
    }
  }

  // Get total post count for pagination (with filters)
  const totalPosts = await prisma.post.count({ where });

  // Get posts for current page (with filters)
  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
  });

  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));

  // Analytics: group posts by platform and tone
  const [platformStats, toneStats, favoriteCount] = await Promise.all([
    prisma.post.groupBy({
      by: ["platform"],
      where: { userId: user.id },
      _count: { platform: true },
      orderBy: { _count: { platform: "desc" } },
    }),
    prisma.post.groupBy({
      by: ["tone"],
      where: { userId: user.id },
      _count: { tone: true },
      orderBy: { _count: { tone: "desc" } },
    }),
    prisma.post.count({
      where: { userId: user.id, isFavorite: true },
    }),
  ]);

  // Get total posts count (unfiltered) for analytics
  const totalPostsAll = filterPlatform || filterTone || searchQuery || dateFrom || dateTo
    ? await prisma.post.count({ where: { userId: user.id } })
    : totalPosts;

  // Build query string for pagination that preserves filters
  function buildPageUrl(page: number) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (filterPlatform) params.set("platform", filterPlatform);
    if (filterTone) params.set("tone", filterTone);
    if (searchQuery) params.set("q", searchQuery);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    return `/dashboard?${params.toString()}`;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastUsage = new Date(user.lastUsageDate);
  lastUsage.setHours(0, 0, 0, 0);
  const todayUsage =
    today.getTime() === lastUsage.getTime() ? user.dailyUsage : 0;
  const limit = DAILY_LIMITS[user.plan];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
            Welcome back, {user.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="mt-1 text-lg text-gray-400">
            Here&apos;s your content overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportCSVButton />
          <Link href="/generate">
            <Button className="cursor-pointer gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-md shadow-violet-200 transition-shadow hover:shadow-lg hover:shadow-violet-300">
              <Sparkles className="h-4 w-4" />
              Generate Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Analytics */}
      {totalPostsAll > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <BarChart3 className="h-5 w-5 text-violet-500" />
            Analytics
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Platform Breakdown */}
            <Card className="border-violet-100">
              <CardHeader className="pb-3">
                <CardDescription className="text-violet-500 font-medium">
                  Posts by Platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {platformStats.map((stat) => {
                  const percentage = Math.round(
                    (stat._count.platform / totalPostsAll) * 100
                  );
                  const colors: Record<string, string> = {
                    TWITTER: "bg-sky-400",
                    LINKEDIN: "bg-blue-500",
                    INSTAGRAM: "bg-pink-400",
                    TIKTOK: "bg-gray-800",
                  };
                  return (
                    <div key={stat.platform} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {stat.platform.charAt(0) + stat.platform.slice(1).toLowerCase()}
                        </span>
                        <span className="font-medium text-gray-900">
                          {stat._count.platform}{" "}
                          <span className="text-gray-400">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all ${colors[stat.platform] || "bg-violet-400"}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Tone Breakdown */}
            <Card className="border-violet-100">
              <CardHeader className="pb-3">
                <CardDescription className="text-violet-500 font-medium">
                  Posts by Tone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {toneStats.map((stat) => {
                  const percentage = Math.round(
                    (stat._count.tone / totalPostsAll) * 100
                  );
                  const colors: Record<string, string> = {
                    PROFESSIONAL: "bg-violet-500",
                    CASUAL: "bg-teal-400",
                    HUMOROUS: "bg-amber-400",
                    INSPIRATIONAL: "bg-rose-400",
                  };
                  return (
                    <div key={stat.tone} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {stat.tone.charAt(0) + stat.tone.slice(1).toLowerCase()}
                        </span>
                        <span className="font-medium text-gray-900">
                          {stat._count.tone}{" "}
                          <span className="text-gray-400">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all ${colors[stat.tone] || "bg-violet-400"}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Row */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-rose-100 bg-gradient-to-br from-rose-50 to-white">
              <CardContent className="flex items-center gap-3 py-4">
                <Heart className="h-5 w-5 text-rose-400" />
                <div>
                  <p className="text-2xl font-bold text-rose-600">{favoriteCount}</p>
                  <p className="text-xs text-rose-400">Favorited Posts</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-white">
              <CardContent className="flex items-center gap-3 py-4">
                <BarChart3 className="h-5 w-5 text-violet-400" />
                <div>
                  <p className="text-2xl font-bold text-violet-600">
                    {platformStats.length > 0 ? platformStats[0].platform.charAt(0) + platformStats[0].platform.slice(1).toLowerCase() : "—"}
                  </p>
                  <p className="text-xs text-violet-400">Most Used Platform</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="mb-6 rounded-xl border border-violet-100 bg-white p-4">
        <form method="GET" action="/dashboard" className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              placeholder="Search posts..."
              defaultValue={searchQuery}
              className="w-full rounded-lg border border-violet-200 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-300"
            />
          </div>

          {/* Platform & Tone Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              name="platform"
              defaultValue={filterPlatform}
              className="cursor-pointer rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm text-gray-600 focus:border-violet-400 focus:outline-none"
            >
              <option value="">All Platforms</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            <select
              name="tone"
              defaultValue={filterTone}
              className="cursor-pointer rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm text-gray-600 focus:border-violet-400 focus:outline-none"
            >
              <option value="">All Tones</option>
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-500">From</span>
              <input
                type="date"
                name="from"
                defaultValue={dateFrom}
                className="cursor-pointer rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm text-gray-600 focus:border-violet-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-500">To</span>
              <input
                type="date"
                name="to"
                defaultValue={dateTo}
                className="cursor-pointer rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-sm text-gray-600 focus:border-violet-400 focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              size="sm"
              className="cursor-pointer gap-1 bg-violet-600 hover:bg-violet-700"
            >
              <Search className="h-3.5 w-3.5" />
              Filter
            </Button>

            {(filterPlatform || filterTone || searchQuery || dateFrom || dateTo) && (
              <Link href="/dashboard">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer border-violet-200 text-violet-600 hover:bg-violet-50"
                >
                  Clear
                </Button>
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Recent Posts */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {filterPlatform || filterTone || searchQuery || dateFrom || dateTo ? "Filtered Posts" : "Recent Posts"}
          {totalPosts > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({totalPosts} {totalPosts === 1 ? "post" : "posts"})
            </span>
          )}
        </h2>
        {totalPages > 1 && (
          <span className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>
      {posts.length === 0 && currentPage === 1 ? (
        <Card className="border-dashed border-violet-200">
          <CardContent className="py-16 text-center">
            {filterPlatform || filterTone || searchQuery || dateFrom || dateTo ? (
              <>
                <Search className="mx-auto mb-3 h-10 w-10 text-violet-300" />
                <p className="text-gray-500 font-medium mb-1">No posts match your filters</p>
                <p className="text-sm text-gray-400">
                  Try adjusting your search or filters
                </p>
                <Link href="/dashboard" className="mt-4 inline-block">
                  <Button variant="outline" size="sm" className="cursor-pointer border-violet-200 text-violet-600">
                    Clear Filters
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Sparkles className="mx-auto mb-3 h-10 w-10 text-violet-300" />
                <p className="text-gray-500 font-medium mb-1">No posts yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Generate your first AI-powered social media post!
                </p>
                <Link href="/generate">
                  <Button className="cursor-pointer gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500" size="sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate Your First Post
                  </Button>
                </Link>
              </>
            )}
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
                      <EditButton postId={post.id} initialContent={post.content} />
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
                <Link href={buildPageUrl(currentPage - 1)}>
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
                <Link href={buildPageUrl(currentPage + 1)}>
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
