"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function EditButton({
  postId,
  initialContent,
}: {
  postId: string;
  initialContent: string;
}) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [editing]);

  function handleInput() {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }

  async function handleSave() {
    if (content.trim() === initialContent) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        setEditing(false);
        toast.success("Post updated!");
        router.refresh();
      } else {
        toast.error("Failed to update post");
      }
    } catch {
      toast.error("Failed to update post");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setContent(initialContent);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="w-full space-y-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleInput();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSave();
            }
            if (e.key === "Escape") {
              handleCancel();
            }
          }}
          className="w-full resize-none rounded-lg border border-violet-300 bg-white p-3 text-sm text-gray-700 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-300"
          rows={3}
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-7 cursor-pointer gap-1 bg-violet-600 px-3 text-xs hover:bg-violet-700"
            onClick={handleSave}
            disabled={saving || content.trim().length === 0}
          >
            {saving ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 cursor-pointer gap-1 px-3 text-xs text-gray-500 hover:text-gray-700"
            onClick={handleCancel}
            disabled={saving}
          >
            <X className="h-3 w-3" />
            Cancel
          </Button>
          <span className="ml-auto text-[10px] text-gray-400">
            Ctrl+Enter to save, Esc to cancel
          </span>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 cursor-pointer text-gray-300 hover:bg-violet-50 hover:text-violet-500"
      onClick={() => setEditing(true)}
      title="Edit post"
    >
      <Pencil className="h-4 w-4" />
    </Button>
  );
}
