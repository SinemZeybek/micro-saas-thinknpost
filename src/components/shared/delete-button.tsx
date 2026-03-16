"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DeleteButton({ postId }: { postId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Post deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete post");
      }
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer text-rose-500 hover:bg-rose-50 hover:text-rose-600"
          onClick={handleDelete}
          disabled={deleting}
          title="Confirm delete"
        >
          {deleting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-300 border-t-rose-600" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
        <button
          className="cursor-pointer text-xs text-gray-400 hover:text-gray-600"
          onClick={() => setConfirming(false)}
        >
          cancel
        </button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 cursor-pointer text-gray-300 hover:bg-rose-50 hover:text-rose-500"
      onClick={() => setConfirming(true)}
      title="Delete post"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
