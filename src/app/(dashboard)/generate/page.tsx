"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { Sparkles, Copy, RefreshCw } from "lucide-react";
import type { GenerateRequest, GenerateResponse } from "@/types";

const PLATFORMS = [
  { value: "TWITTER", label: "Twitter / X" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "INSTAGRAM", label: "Instagram" },
] as const;

const TONES = [
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "CASUAL", label: "Casual" },
  { value: "HUMOROUS", label: "Humorous" },
  { value: "INSPIRATIONAL", label: "Inspirational" },
] as const;

export default function GeneratePage() {
  const [platform, setPlatform] = useState<GenerateRequest["platform"] | "">("");
  const [tone, setTone] = useState<GenerateRequest["tone"] | "">("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!platform || !tone || !prompt.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, tone, prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResult(data);
    } catch {
      setError("Failed to generate post. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Generate Post</h1>
      <p className="mb-8 text-gray-400">
        Choose a platform, pick a tone, and let AI do the rest.
      </p>

      {/* The Form */}
      <Card className="mb-6 border-violet-100">
        <CardHeader>
          <CardTitle className="text-gray-900">Create Content</CardTitle>
          <CardDescription>
            Describe your topic and we&apos;ll generate a ready-to-post caption.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-gray-600">
                Platform
              </Label>
              <Select
                value={platform}
                onValueChange={(v) =>
                  setPlatform(v as GenerateRequest["platform"])
                }
              >
                <SelectTrigger
                  id="platform"
                  className="cursor-pointer border-violet-200 focus:ring-violet-300"
                >
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem
                      key={p.value}
                      value={p.value}
                      className="cursor-pointer"
                    >
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone" className="text-gray-600">
                Tone
              </Label>
              <Select
                value={tone}
                onValueChange={(v) =>
                  setTone(v as GenerateRequest["tone"])
                }
              >
                <SelectTrigger
                  id="tone"
                  className="cursor-pointer border-violet-200 focus:ring-violet-300"
                >
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem
                      key={t.value}
                      value={t.value}
                      className="cursor-pointer"
                    >
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-gray-600">
              What do you want to post about?
            </Label>
            <Textarea
              id="prompt"
              placeholder="e.g., AI trends in 2026, remote work tips, morning routine..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="border-violet-200 focus:ring-violet-300"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <Button
            className="w-full cursor-pointer gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-md shadow-violet-200 transition-all hover:shadow-lg hover:shadow-violet-300"
            size="lg"
            onClick={handleGenerate}
            disabled={loading}
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Generating..." : "Generate Post"}
          </Button>
        </CardContent>
      </Card>

      {/* The Result */}
      {result && (
        <Card className="border-violet-100 shadow-md shadow-violet-100/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-gray-900">Generated Post</CardTitle>
              <Badge
                variant="outline"
                className="border-violet-200 text-violet-600"
              >
                {result.platform}
              </Badge>
              <Badge className="bg-violet-50 text-violet-600">
                {result.tone}
              </Badge>
              <span className="ml-auto">
                <FavoriteButton postId={result.id} initialFavorite={false} />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap rounded-xl bg-gradient-to-br from-violet-50/50 to-fuchsia-50/30 p-5 text-sm leading-relaxed text-gray-700">
              {result.content}
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="cursor-pointer gap-2 border-violet-200 hover:bg-violet-50"
                onClick={() => navigator.clipboard.writeText(result.content)}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer gap-2 border-violet-200 hover:bg-violet-50"
                onClick={() => {
                  setResult(null);
                  setPrompt("");
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Generate Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
