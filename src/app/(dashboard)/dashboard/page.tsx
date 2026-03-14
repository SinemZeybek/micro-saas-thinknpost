import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FavoriteButton } from "@/components/shared/favorite-button";

const DAILY_LIMITS = { FREE: 3, PRO: 50 } as const;

export default async function DashboardPage() {
  const session = await getSession();

  // Get user with their recent posts
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

  // Calculate today's usage (reset if new day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastUsage = new Date(user.lastUsageDate);
  lastUsage.setHours(0, 0, 0, 0);
  const todayUsage =
    today.getTime() === lastUsage.getTime() ? user.dailyUsage : 0;
  const limit = DAILY_LIMITS[user.plan];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user.name?.split(" ")[0] || "there"}!
          </h1>
          <p className="mt-1 text-gray-500">
            Here&apos;s your content dashboard
          </p>
        </div>
        <Link href="/generate">
          <Button className="cursor-pointer" size="lg">
            + Generate Post
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today&apos;s Usage</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {todayUsage} / {limit}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Posts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{user.posts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Plan</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant={user.plan === "PRO" ? "default" : "secondary"}>
              {user.plan}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Separator className="mb-8" />

      {/* Recent Posts */}
      <h2 className="mb-4 text-xl font-semibold">Recent Posts</h2>
      {user.posts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No posts yet. Click &quot;Generate Post&quot; to create your first
            one!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {user.posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{post.platform}</Badge>
                  <Badge variant="secondary">{post.tone}</Badge>
                  <span className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-gray-400">
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
                <p className="mb-2 text-sm text-gray-500">
                  Prompt: {post.prompt}
                </p>
                <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm">
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
