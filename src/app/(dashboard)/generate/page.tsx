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
import { Switch } from "@/components/ui/switch";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { UpgradeButton } from "@/components/shared/upgrade-button";
import { PlatformMockup } from "@/components/shared/platform-mockups";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  ImageIcon,
  Download,
  Lock,
  FlaskConical,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { GenerateRequest, GenerateResponse } from "@/types";

const PLATFORMS = [
  { value: "TWITTER", label: "Twitter / X" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "TIKTOK", label: "TikTok" },
] as const;

const TONES = [
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "CASUAL", label: "Casual" },
  { value: "HUMOROUS", label: "Humorous" },
  { value: "INSPIRATIONAL", label: "Inspirational" },
] as const;

const LENGTHS = [
  { value: "SHORT", label: "Short" },
  { value: "LONG", label: "Long" },
] as const;

const ORIENTATIONS = [
  { value: "PORTRAIT", label: "Portrait (9:16)" },
  { value: "LANDSCAPE", label: "Landscape (16:9)" },
  { value: "SQUARE", label: "Square (1:1)" },
] as const;

// Default orientations per platform
const PLATFORM_DEFAULTS: Record<string, string> = {
  INSTAGRAM: "SQUARE",
  LINKEDIN: "LANDSCAPE",
  TWITTER: "LANDSCAPE",
  TIKTOK: "PORTRAIT",
};

export default function GeneratePage() {
  const [platform, setPlatform] = useState<GenerateRequest["platform"] | "">(
    ""
  );
  const [tone, setTone] = useState<GenerateRequest["tone"] | "">("");
  const [length, setLength] = useState<GenerateRequest["length"] | "">("");
  const [prompt, setPrompt] = useState("");
  const [generateImage, setGenerateImage] = useState(false);
  const [orientation, setOrientation] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GenerateResponse[]>([]);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);
  const [abLoading, setAbLoading] = useState(false);
  const [abVariations, setAbVariations] = useState<GenerateResponse[]>([]);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const { data: session } = useSession();

  const isPro = session?.user?.plan === "PRO";

  // Auto-select orientation when platform changes
  useEffect(() => {
    if (platform && generateImage) {
      setOrientation(PLATFORM_DEFAULTS[platform] || "SQUARE");
    }
  }, [platform, generateImage]);

  const handleGenerate = useCallback(async () => {
    if (!platform || !tone || !length || !prompt.trim()) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          tone,
          prompt: prompt.trim(),
          length,
          generateImage: generateImage && isPro,
          orientation: generateImage && isPro ? orientation : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        toast.error(data.error || "Something went wrong");
        return;
      }

      setResults((prev) => [data, ...prev]);
      toast.success("Post generated successfully!");
    } catch {
      setError("Failed to generate post. Please try again.");
      toast.error("Failed to generate post. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [platform, tone, length, prompt, generateImage, isPro, orientation]);

  async function handleDownload(imageUrl: string, postId: string) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `thinknpost-${postId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      setDownloadedId(postId);
      toast.success("Image downloaded!");
      setTimeout(() => setDownloadedId(null), 2000);
    } catch {
      toast.error("Download failed");
    }
  }

  async function handleRegenerateImage(postId: string) {
    setRegeneratingId(postId);
    try {
      const res = await fetch(`/api/posts/${postId}/regenerate-image`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to regenerate image");
        return;
      }

      // Update the result in state with the new image
      setResults((prev) =>
        prev.map((r) =>
          r.id === postId ? { ...r, imageUrl: data.imageUrl } : r
        )
      );
      toast.success("Image regenerated!");
    } catch {
      toast.error("Failed to regenerate image");
    } finally {
      setRegeneratingId(null);
    }
  }

  const handleABGenerate = useCallback(async () => {
    if (!platform || !tone || !length || !prompt.trim()) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }

    setAbLoading(true);
    setError("");
    setAbVariations([]);

    try {
      const res = await fetch("/api/generate-ab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          tone,
          prompt: prompt.trim(),
          length,
          generateImage,
          orientation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        toast.error(data.error || "Something went wrong");
        return;
      }

      setAbVariations(data.variations);
      toast.success("A/B variations generated!");
    } catch {
      setError("Failed to generate A/B variations. Please try again.");
      toast.error("Failed to generate A/B variations");
    } finally {
      setAbLoading(false);
    }
  }, [platform, tone, length, prompt, generateImage, orientation]);

  // Keyboard shortcut: Cmd+Enter or Ctrl+Enter to generate
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!loading && !abLoading) {
          handleGenerate();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGenerate, loading, abLoading]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="mb-2 text-2xl sm:text-4xl font-bold text-gray-900">Generate Post</h1>
      <p className="mb-8 text-lg text-gray-400">
        Choose a platform, pick a tone, and let AI do the rest.
      </p>

      {/* The Form */}
      <Card className="mb-6 border-violet-100">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Create Content</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Describe your topic and we&apos;ll generate a ready-to-post caption.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-sm font-semibold text-gray-800">
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
              <Label htmlFor="tone" className="text-sm font-semibold text-gray-800">
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

            <div className="space-y-2">
              <Label htmlFor="length" className="text-sm font-semibold text-gray-800">
                Length
              </Label>
              <Select
                value={length}
                onValueChange={(v) =>
                  setLength(v as GenerateRequest["length"])
                }
              >
                <SelectTrigger
                  id="length"
                  className="cursor-pointer border-violet-200 focus:ring-violet-300"
                >
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  {LENGTHS.map((l) => (
                    <SelectItem
                      key={l.value}
                      value={l.value}
                      className="cursor-pointer"
                    >
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-sm font-semibold text-gray-800">
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
            <p className="text-xs text-gray-400">
              Press <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-mono">Ctrl</kbd>+<kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-mono">Enter</kbd> to generate
            </p>
          </div>

          {/* Image Generation Toggle — PRO Only */}
          <div className="rounded-lg border border-violet-100 bg-violet-50/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-violet-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      Generate Image
                    </span>
                    {!isPro && (
                      <Badge className="bg-violet-100 text-violet-700 text-xs">
                        <Lock className="mr-1 h-3 w-3" />
                        PRO
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    AI-generated visual to go with your post
                  </p>
                </div>
              </div>
              {isPro ? (
                <Switch
                  checked={generateImage}
                  onCheckedChange={setGenerateImage}
                  className="cursor-pointer"
                />
              ) : (
                <UpgradeButton />
              )}
            </div>

            {/* Orientation Selector — shown when image toggle is on */}
            {generateImage && isPro && (
              <div className="mt-4 space-y-2">
                <Label className="text-gray-600 text-xs">
                  Image Orientation
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {ORIENTATIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setOrientation(o.value)}
                      className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                        orientation === o.value
                          ? "border-violet-400 bg-violet-100 text-violet-700"
                          : "border-violet-200 bg-white text-gray-600 hover:bg-violet-50"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
              <p>{error}</p>
              {error.includes("Daily limit") && (
                <div className="mt-3">
                  <UpgradeButton />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              className="flex-1 cursor-pointer gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-md shadow-violet-200 transition-all hover:shadow-lg hover:shadow-violet-300"
              size="lg"
              onClick={handleGenerate}
              disabled={loading || abLoading}
            >
              <Sparkles className="h-4 w-4" />
              {loading
                ? generateImage && isPro
                  ? "Generating post + image..."
                  : "Generating..."
                : "Generate Post"}
            </Button>
            {isPro ? (
              <Button
                variant="outline"
                className="cursor-pointer gap-2 border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100"
                size="lg"
                onClick={handleABGenerate}
                disabled={loading || abLoading}
              >
                <FlaskConical className="h-4 w-4" />
                {abLoading ? "Generating..." : "A/B Test"}
              </Button>
            ) : (
              <Button
                variant="outline"
                className="cursor-pointer gap-2 border-violet-200 text-gray-400"
                size="lg"
                disabled
              >
                <FlaskConical className="h-4 w-4" />
                A/B Test
                <Lock className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading Skeleton */}
      {(loading || abLoading) && (
        <Card className="mb-6 border-violet-100">
          <CardContent className="py-8">
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="h-5 w-20 rounded-full bg-violet-100" />
                <div className="h-5 w-16 rounded-full bg-violet-50" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-violet-50" />
                <div className="h-4 w-5/6 rounded bg-violet-50" />
                <div className="h-4 w-4/6 rounded bg-violet-50" />
              </div>
              {generateImage && isPro && (
                <div className="h-48 w-full rounded-xl bg-violet-50" />
              )}
              <div className="flex gap-2">
                <div className="h-9 w-24 rounded bg-violet-50" />
                <div className="h-9 w-32 rounded bg-violet-50" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* A/B Variations Results */}
      {abVariations.length > 0 && (
        <Card className="mb-6 border-violet-200 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-violet-500" />
              <CardTitle className="text-gray-900">A/B Variations</CardTitle>
              <Badge className="bg-violet-100 text-violet-700">
                {abVariations.length} versions
              </Badge>
            </div>
            <CardDescription>
              Compare different versions and pick the one that resonates most.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {abVariations.map((variation, index) => (
                <div
                  key={variation.id}
                  className="flex flex-col rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50/30 to-fuchsia-50/20 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="border-violet-300 text-violet-600"
                    >
                      Version {String.fromCharCode(65 + index)}
                    </Badge>
                    <FavoriteButton
                      postId={variation.id}
                      initialFavorite={false}
                    />
                  </div>
                  {variation.imageUrl && (
                    <div className="mb-3 overflow-hidden rounded-lg border border-violet-100">
                      <img
                        src={variation.imageUrl}
                        alt="AI generated visual"
                        className="w-full object-cover"
                        style={{
                          aspectRatio:
                            variation.orientation === "PORTRAIT"
                              ? "9/16"
                              : variation.orientation === "LANDSCAPE"
                                ? "16/9"
                                : "1/1",
                        }}
                      />
                    </div>
                  )}
                  <PlatformMockup
                    platform={variation.platform}
                    content={variation.content}
                    userName={session?.user?.name || "You"}
                    userImage={session?.user?.image || undefined}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 cursor-pointer gap-1 border-violet-200 text-xs hover:bg-violet-50"
                      onClick={() => {
                        navigator.clipboard.writeText(variation.content);
                        setCopiedId(variation.id);
                        toast.success("Copied to clipboard!");
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                    >
                      {copiedId === variation.id ? (
                        <>
                          <Check className="h-3 w-3 text-green-500" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy
                        </>
                      )}
                    </Button>
                    {variation.imageUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 cursor-pointer gap-1 border-violet-200 text-xs hover:bg-violet-50"
                        onClick={() =>
                          handleDownload(variation.imageUrl!, variation.id)
                        }
                      >
                        {downloadedId === variation.id ? (
                          <>
                            <Check className="h-3 w-3 text-green-500" /> Downloaded!
                          </>
                        ) : (
                          <>
                            <Download className="h-3 w-3" /> Download
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full cursor-pointer gap-2 border-violet-200 hover:bg-violet-50"
              onClick={handleABGenerate}
              disabled={abLoading}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${abLoading ? "animate-spin" : ""}`}
              />
              {abLoading ? "Generating..." : "Generate New Variations"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Generate Another button at the top */}
          <Button
            variant="outline"
            className="w-full cursor-pointer gap-2 border-violet-200 hover:bg-violet-50"
            onClick={handleGenerate}
            disabled={loading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Generating..." : "Generate Another"}
          </Button>

          {results.map((result, index) => (
            <Card
              key={result.id}
              className={`border-violet-100 shadow-md shadow-violet-100/50 ${index === 0 ? "ring-2 ring-violet-200" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base text-gray-900">
                    {index === 0 ? "Latest" : `#${results.length - index}`}
                  </CardTitle>
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
                    <FavoriteButton
                      postId={result.id}
                      initialFavorite={false}
                    />
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Generated Image */}
                {result.imageUrl && (
                  <div className="mb-4 overflow-hidden rounded-xl border border-violet-100">
                    <img
                      src={result.imageUrl}
                      alt="AI generated visual"
                      className="w-full object-cover"
                      style={{
                        aspectRatio:
                          result.orientation === "PORTRAIT"
                            ? "9/16"
                            : result.orientation === "LANDSCAPE"
                              ? "16/9"
                              : "1/1",
                        maxHeight:
                          result.orientation === "PORTRAIT"
                            ? "400px"
                            : undefined,
                      }}
                    />
                  </div>
                )}

                <PlatformMockup
                  platform={result.platform}
                  content={result.content}
                  userName={session?.user?.name || "You"}
                  userImage={session?.user?.image || undefined}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="cursor-pointer gap-2 border-violet-200 hover:bg-violet-50"
                    onClick={() => {
                      navigator.clipboard.writeText(result.content);
                      setCopiedId(result.id);
                      toast.success("Copied to clipboard!");
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                  >
                    {copiedId === result.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-500" />{" "}
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </>
                    )}
                  </Button>
                  {result.imageUrl && (
                    <>
                      <Button
                        variant="outline"
                        className="cursor-pointer gap-2 border-violet-200 hover:bg-violet-50"
                        onClick={() =>
                          handleDownload(result.imageUrl!, result.id)
                        }
                      >
                        {downloadedId === result.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-green-500" /> Downloaded!
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5" /> Download Image
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        className="cursor-pointer gap-2 border-violet-200 hover:bg-violet-50"
                        onClick={() => handleRegenerateImage(result.id)}
                        disabled={regeneratingId === result.id}
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${regeneratingId === result.id ? "animate-spin" : ""}`}
                        />
                        {regeneratingId === result.id
                          ? "Regenerating..."
                          : "Regenerate Image"}
                      </Button>
                    </>
                  )}
                  {/* Show "Add Image" button if no image and user is PRO */}
                  {!result.imageUrl && isPro && (
                    <Button
                      variant="outline"
                      className="cursor-pointer gap-2 border-violet-200 hover:bg-violet-50"
                      onClick={() => handleRegenerateImage(result.id)}
                      disabled={regeneratingId === result.id}
                    >
                      {regeneratingId === result.id ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-3.5 w-3.5" />
                          Generate Image
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
