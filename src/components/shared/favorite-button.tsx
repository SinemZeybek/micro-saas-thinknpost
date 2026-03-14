"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  postId: string;
  initialFavorite: boolean;
}

export function FavoriteButton({ postId, initialFavorite }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  async function toggleFavorite() {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/favorite`, {
        method: "PATCH",
      });

      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.isFavorite);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 cursor-pointer"
      onClick={toggleFavorite}
      disabled={loading}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`h-4 w-4 ${
          isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
        }`}
      />
    </Button>
  );
}
