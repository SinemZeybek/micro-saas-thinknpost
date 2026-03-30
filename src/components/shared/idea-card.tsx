"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import type { ContentIdeaResponse } from "@/types";

interface IdeaCardProps {
  idea: ContentIdeaResponse;
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      {idea.sourceNames && (
        <p className="text-xs text-gray-400 truncate" title={idea.sourceNames}>
          Based on: {idea.sourceNames}
        </p>
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-800">{idea.title}</h3>
        {idea.platform && (
          <Badge variant="secondary" className="text-xs shrink-0">
            {idea.platform}
          </Badge>
        )}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{idea.summary}</p>
      <Link
        href={`/generate?idea=${encodeURIComponent(idea.title + ": " + idea.summary)}`}
      >
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-violet-600 border-violet-200 hover:bg-violet-50 cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Use This Idea
        </Button>
      </Link>
    </div>
  );
}
