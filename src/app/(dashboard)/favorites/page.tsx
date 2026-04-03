import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { CopyButton } from "@/components/shared/copy-button";
import { DeleteButton } from "@/components/shared/delete-button";
import { EditButton } from "@/components/shared/edit-button";
import { PlatformMockup } from "@/components/shared/platform-mockups";
import { Heart, Sparkles } from "lucide-react";

export default async function FavoritesPage() {
  const session = await getSession();

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
  });

  const favorites = await prisma.post.findMany({
    where: {
      userId: session!.user.id,
      isFavorite: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Favorites</h1>
          <p className="mt-1 text-lg text-gray-400">
            Your saved posts ({favorites.length})
          </p>
        </div>
        <Link href="/generate">
          <Button className="cursor-pointer gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-md shadow-violet-200 transition-shadow hover:shadow-lg hover:shadow-violet-300">
            <Sparkles className="h-4 w-4" />
            Generate Post
          </Button>
        </Link>
      </div>

      {favorites.length === 0 ? (
        <Card className="border-dashed border-violet-200">
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto mb-3 h-10 w-10 text-violet-300" />
            <p className="text-gray-400">
              No favorites yet. Generate a post and click the heart to save it!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {favorites.map((post) => (
            <Card
              key={post.id}
              className="border-violet-100/60 transition-colors hover:border-violet-200"
            >
              <CardHeader className="pb-2 pt-3 px-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge
                    variant="outline"
                    className="border-violet-200 text-violet-600 text-xs"
                  >
                    {post.platform}
                  </Badge>
                  <Badge className="bg-violet-50 text-violet-600 hover:bg-violet-100 text-xs">
                    {post.tone}
                  </Badge>
                  <span className="ml-auto flex items-center gap-1">
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
              <CardContent className="px-4 pb-3 pt-0">
                <p className="text-xs text-gray-400 mb-2 truncate">
                  {post.prompt}
                </p>
                {post.imageUrl && (
                  <div className="mb-2 overflow-hidden rounded-lg border border-violet-100">
                    <img
                      src={post.imageUrl}
                      alt="AI generated visual"
                      className="w-full object-cover max-h-36"
                    />
                  </div>
                )}
                <PlatformMockup
                  platform={post.platform}
                  content={post.content}
                  userName={user?.name || "You"}
                  userImage={user?.image || undefined}
                  compact
                />
                <p className="text-xs text-gray-300 mt-2">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
