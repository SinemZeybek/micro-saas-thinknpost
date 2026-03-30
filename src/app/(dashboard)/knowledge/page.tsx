"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload } from "@/components/shared/file-upload";
import { UrlInput } from "@/components/shared/url-input";
import { KnowledgeSourceCard } from "@/components/shared/knowledge-source-card";
import { IdeaCard } from "@/components/shared/idea-card";
import { BookOpen, Lightbulb, Loader2, CalendarDays, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { KnowledgeSourceResponse, ContentIdeaResponse } from "@/types";

const SOURCE_LIMITS = { FREE: 2, PRO: 5 } as const;
const IDEA_LIMITS = { FREE: 30, PRO: 100 } as const;

export default function KnowledgePage() {
  const { data: session } = useSession();
  const plan = (session?.user?.plan || "FREE") as "FREE" | "PRO";
  const MAX_SOURCES = SOURCE_LIMITS[plan];
  const maxIdeas = IDEA_LIMITS[plan];

  const [sources, setSources] = useState<KnowledgeSourceResponse[]>([]);
  const [ideas, setIdeas] = useState<ContentIdeaResponse[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [ideasPage, setIdeasPage] = useState(0);

  const IDEAS_PER_PAGE = 6;
  const isAtLimit = sources.length >= MAX_SOURCES;
  const totalIdeasPages = Math.ceil(ideas.length / IDEAS_PER_PAGE);
  const paginatedIdeas = ideas.slice(
    ideasPage * IDEAS_PER_PAGE,
    (ideasPage + 1) * IDEAS_PER_PAGE
  );

  const fetchSources = useCallback(async () => {
    const res = await fetch("/api/knowledge");
    if (res.ok) setSources(await res.json());
  }, []);

  const fetchIdeas = useCallback(async () => {
    const res = await fetch("/api/ideas");
    if (res.ok) setIdeas(await res.json());
  }, []);

  useEffect(() => {
    fetchSources();
    fetchIdeas();
  }, [fetchSources, fetchIdeas]);

  async function handleFileUpload(file: File) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/knowledge", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Upload failed");
        return;
      }

      toast.success("File uploaded successfully!");
      fetchSources();
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleUrlSubmit(url: string) {
    setIsAddingUrl(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to add URL");
        return;
      }

      toast.success("URL added successfully!");
      fetchSources();
    } catch {
      toast.error("Failed to add URL");
    } finally {
      setIsAddingUrl(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSources((prev) => prev.filter((s) => s.id !== id));
        toast.success("Source removed");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleGenerateIdeas() {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ideas/generate", { method: "POST" });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to generate ideas");
        return;
      }

      const newIdeas = await res.json();
      setIdeas((prev) => [...newIdeas, ...prev]);
      setIdeasPage(0);
      toast.success(`Generated ${newIdeas.length} content ideas!`);
    } catch {
      toast.error("Failed to generate ideas");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          ThinkBank
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Feed the AI your product info, then generate content ideas to post about.
        </p>
      </div>

      {/* PostCalendar Promo */}
      <Link href="/calendar" className="block">
        <div className="group flex items-center gap-4 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-5 transition-all hover:border-violet-200 hover:shadow-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              Plan your week with PostCalendar
            </p>
            <p className="mt-0.5 text-sm text-gray-500">
              Turn your sources into a 7-day posting schedule — with topics, platforms, and best times to post.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-violet-400 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-violet-500" />
            Add Knowledge
          </CardTitle>
          <CardDescription>
            Upload PDFs, text files, or add a website URL ({sources.length}/{MAX_SOURCES})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAtLimit ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-700">
              Source limit reached ({MAX_SOURCES}). Remove one to add a new source.
            </div>
          ) : (
            <>
              <FileUpload onUpload={handleFileUpload} isLoading={isUploading} maxSizeMB={plan === "PRO" ? 40 : 10} />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">or</span>
                </div>
              </div>
              <UrlInput onSubmit={handleUrlSubmit} isLoading={isAddingUrl} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Sources List */}
      {sources.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Your Sources ({sources.length}/{MAX_SOURCES})
          </h2>
          {sources.map((source) => (
            <KnowledgeSourceCard
              key={source.id}
              source={source}
              onDelete={handleDelete}
              isDeleting={deletingId === source.id}
            />
          ))}
        </div>
      )}

      {/* Generate Ideas Button */}
      {sources.length > 0 && (
        <div className="flex justify-center">
          <Button
            onClick={handleGenerateIdeas}
            disabled={isGenerating}
            className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-6 text-base font-semibold text-white shadow-lg hover:from-violet-700 hover:to-fuchsia-600 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Lightbulb className="h-5 w-5" />
                Generate Content Ideas
              </>
            )}
          </Button>
        </div>
      )}

      {/* Ideas Section */}
      {ideas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Content Ideas ({ideas.length})
            </h2>
            <p className="text-sm text-gray-400">
              Only the last {maxIdeas} ideas are kept
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>

          {/* Inline Pagination */}
          {totalIdeasPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIdeasPage((p) => p - 1)}
                disabled={ideasPage === 0}
                className="cursor-pointer text-xs"
              >
                Previous
              </Button>
              <span className="text-xs text-gray-500">
                {ideasPage + 1} / {totalIdeasPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIdeasPage((p) => p + 1)}
                disabled={ideasPage >= totalIdeasPages - 1}
                className="cursor-pointer text-xs"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {sources.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-sm font-medium text-gray-700">
            No knowledge sources yet
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Upload a file or add a URL to get started
          </p>
        </div>
      )}
    </div>
  );
}
