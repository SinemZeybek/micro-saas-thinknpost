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

export default async function FavoritesPage() {
  const session = await getSession();

  const favorites = await prisma.post.findMany({
    where: {
      userId: session!.user.id,
      isFavorite: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Favorites</h1>
          <p className="mt-1 text-gray-500">
            Your saved posts ({favorites.length})
          </p>
        </div>
        <Link href="/generate">
          <Button className="cursor-pointer" size="lg">
            + Generate Post
          </Button>
        </Link>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No favorites yet. Generate a post and click the heart to save it!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {favorites.map((post) => (
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
