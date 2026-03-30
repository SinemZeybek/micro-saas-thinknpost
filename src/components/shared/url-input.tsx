"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");

  function handleSubmit() {
    const trimmed = url.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);
    } catch {
      return;
    }

    onSubmit(trimmed);
    setUrl("");
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="url"
          placeholder="https://your-website.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={isLoading || !url.trim()}
        className="bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
      >
        {isLoading ? "Adding..." : "Add URL"}
      </Button>
    </div>
  );
}
