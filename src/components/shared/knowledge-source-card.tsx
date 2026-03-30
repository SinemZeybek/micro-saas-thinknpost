"use client";

import { Button } from "@/components/ui/button";
import { FileText, Globe, File, Trash2 } from "lucide-react";
import type { KnowledgeSourceResponse } from "@/types";

const TYPE_ICONS = {
  PDF: File,
  TEXT: FileText,
  URL: Globe,
};

interface KnowledgeSourceCardProps {
  source: KnowledgeSourceResponse;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function KnowledgeSourceCard({
  source,
  onDelete,
  isDeleting,
}: KnowledgeSourceCardProps) {
  const Icon = TYPE_ICONS[source.type];

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50">
          <Icon className="h-4 w-4 text-violet-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{source.name}</p>
          <p className="text-xs text-gray-400">
            {source.type} &middot;{" "}
            {new Date(source.createdAt).toLocaleDateString()}
            {source.sizeBytes && (
              <> &middot; {(source.sizeBytes / 1024).toFixed(0)} KB</>
            )}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(source.id)}
        disabled={isDeleting}
        className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
