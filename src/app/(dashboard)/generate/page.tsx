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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Generate Post</h1>

      {/* The Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Content</CardTitle>
          <CardDescription>
            Choose a platform, tone, and describe what you want to post about.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Platform selector */}
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={platform}
                onValueChange={(v) =>
                  setPlatform(v as GenerateRequest["platform"])
                }
              >
                <SelectTrigger id="platform" className="cursor-pointer">
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

            {/* Tone selector */}
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={tone}
                onValueChange={(v) =>
                  setTone(v as GenerateRequest["tone"])
                }
              >
                <SelectTrigger id="tone" className="cursor-pointer">
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

          {/* Prompt textarea */}
          <div className="space-y-2">
            <Label htmlFor="prompt">What do you want to post about?</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., AI trends in 2026, remote work tips, morning routine..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Generate button */}
          <Button
            className="w-full cursor-pointer"
            size="lg"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Post"}
          </Button>
        </CardContent>
      </Card>

      {/* The Result */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Generated Post</CardTitle>
              <Badge variant="outline">{result.platform}</Badge>
              <Badge variant="secondary">{result.tone}</Badge>
              <span className="ml-auto">
                <FavoriteButton postId={result.id} initialFavorite={false} />
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm">
              {result.content}
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => navigator.clipboard.writeText(result.content)}
              >
                Copy to Clipboard
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  setResult(null);
                  setPrompt("");
                }}
              >
                Generate Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
