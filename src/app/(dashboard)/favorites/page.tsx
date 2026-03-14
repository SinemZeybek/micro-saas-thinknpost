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
import { Heart, Sparkles } from "lucide-react";

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
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Favorites</h1>
          <p className="mt-1 text-gray-400">
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
        <div className="space-y-3">
          {favorites.map((post) => (
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
