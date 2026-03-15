"use client";

import { Heart, MessageCircle, Repeat2, Share, Bookmark, MoreHorizontal, ThumbsUp, Send, Globe, Music } from "lucide-react";

interface MockupProps {
  content: string;
  userName?: string;
  userImage?: string;
}

// ─── Twitter / X ────────────────────────────────────
export function TwitterMockup({ content, userName = "You", userImage }: MockupProps) {
  const handle = `@${userName.toLowerCase().replace(/\s+/g, "")}`;
  const charCount = content.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-0">
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500">
              {userName[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-[15px] font-bold text-gray-900">{userName}</span>
            <svg className="h-[18px] w-[18px] text-[#1d9bf0]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
            </svg>
          </div>
          <span className="text-[13px] text-gray-500">{handle}</span>
        </div>
        {/* X logo */}
        <svg className="h-5 w-5 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-900">
          {content}
        </p>
      </div>

      {/* Time */}
      <div className="border-t border-gray-100 px-4 py-2">
        <span className="text-[13px] text-gray-500">
          {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <span className="ml-2 text-[13px] text-gray-500">·</span>
        <span className="ml-2 text-[13px] text-gray-500">{charCount} characters</span>
      </div>

      {/* Stats */}
      <div className="border-t border-gray-100 px-4 py-2">
        <div className="flex gap-5 text-[13px] text-gray-500">
          <span><strong className="text-gray-900">0</strong> Reposts</span>
          <span><strong className="text-gray-900">0</strong> Likes</span>
          <span><strong className="text-gray-900">0</strong> Views</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-around border-t border-gray-100 px-4 py-2">
        <button className="rounded-full p-2 text-gray-500 hover:bg-blue-50 hover:text-[#1d9bf0]">
          <MessageCircle className="h-[18px] w-[18px]" />
        </button>
        <button className="rounded-full p-2 text-gray-500 hover:bg-green-50 hover:text-green-500">
          <Repeat2 className="h-[18px] w-[18px]" />
        </button>
        <button className="rounded-full p-2 text-gray-500 hover:bg-pink-50 hover:text-pink-500">
          <Heart className="h-[18px] w-[18px]" />
        </button>
        <button className="rounded-full p-2 text-gray-500 hover:bg-blue-50 hover:text-[#1d9bf0]">
          <Bookmark className="h-[18px] w-[18px]" />
        </button>
        <button className="rounded-full p-2 text-gray-500 hover:bg-blue-50 hover:text-[#1d9bf0]">
          <Share className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}

// ─── LinkedIn ───────────────────────────────────────
export function LinkedInMockup({ content, userName = "You", userImage }: MockupProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-start gap-2.5 p-4 pb-2">
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-gray-200 to-gray-300">
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500">
              {userName[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500">Content Creator</p>
          <p className="flex items-center gap-1 text-xs text-gray-400">
            Just now · <Globe className="h-3 w-3" />
          </p>
        </div>
        <MoreHorizontal className="h-5 w-5 text-gray-400" />
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
          {content}
        </p>
      </div>

      {/* Reactions bar */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#0a66c2] text-[10px]">👍</span>
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#df704d] text-[10px]">❤️</span>
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#7fc15e] text-[10px]">👏</span>
          </div>
          <span className="ml-1 text-xs text-gray-500">0</span>
        </div>
        <span className="text-xs text-gray-500">0 comments · 0 reposts</span>
      </div>

      {/* Actions */}
      <div className="flex justify-around px-2 py-1">
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-3 text-xs font-semibold text-gray-600 hover:bg-gray-100">
          <ThumbsUp className="h-4 w-4" />
          Like
        </button>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-3 text-xs font-semibold text-gray-600 hover:bg-gray-100">
          <MessageCircle className="h-4 w-4" />
          Comment
        </button>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-3 text-xs font-semibold text-gray-600 hover:bg-gray-100">
          <Repeat2 className="h-4 w-4" />
          Repost
        </button>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-3 text-xs font-semibold text-gray-600 hover:bg-gray-100">
          <Send className="h-4 w-4" />
          Send
        </button>
      </div>
    </div>
  );
}

// ─── Instagram ──────────────────────────────────────
export function InstagramMockup({ content, userName = "You", userImage }: MockupProps) {
  const handle = userName.toLowerCase().replace(/\s+/g, "");

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px]">
          <div className="h-full w-full overflow-hidden rounded-full bg-white p-[1px]">
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                {userName[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-900">{handle}</span>
        <span className="ml-auto text-xs font-semibold text-[#0095f6]">Follow</span>
        <MoreHorizontal className="h-5 w-5 text-gray-800" />
      </div>

      {/* Image placeholder */}
      <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-violet-100 via-fuchsia-50 to-pink-100">
        <div className="max-w-[80%] text-center">
          <svg className="mx-auto mb-2 h-10 w-10 text-violet-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="text-xs text-violet-400">Your image here</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex gap-4">
          <Heart className="h-6 w-6 text-gray-800" />
          <MessageCircle className="h-6 w-6 text-gray-800" />
          <Send className="h-6 w-6 text-gray-800" />
        </div>
        <Bookmark className="h-6 w-6 text-gray-800" />
      </div>

      {/* Likes */}
      <div className="px-3 pb-1">
        <p className="text-sm font-semibold text-gray-900">0 likes</p>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
          <span className="font-semibold">{handle}</span>{" "}
          {content}
        </p>
        <p className="mt-1 text-[10px] uppercase text-gray-400">Just now</p>
      </div>
    </div>
  );
}

// ─── TikTok ─────────────────────────────────────────
export function TikTokMockup({ content, userName = "You", userImage }: MockupProps) {
  const handle = `@${userName.toLowerCase().replace(/\s+/g, "")}`;

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-black">
      {/* Video placeholder */}
      <div className="flex aspect-[9/16] max-h-[500px] items-end bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        {/* Right sidebar icons */}
        <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-gray-600">
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                  {userName[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="-mt-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#fe2c55] text-[8px] font-bold text-white">
              +
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Heart className="h-7 w-7 text-white" />
            <span className="text-[11px] text-white">0</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageCircle className="h-7 w-7 text-white" />
            <span className="text-[11px] text-white">0</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Bookmark className="h-7 w-7 text-white" />
            <span className="text-[11px] text-white">0</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Share className="h-7 w-7 text-white" />
            <span className="text-[11px] text-white">0</span>
          </div>
        </div>

        {/* Bottom content overlay */}
        <div className="w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pr-16">
          <p className="mb-1 text-sm font-bold text-white">{handle}</p>
          <p className="mb-3 whitespace-pre-wrap text-[13px] leading-relaxed text-white/90">
            {content}
          </p>
          <div className="flex items-center gap-2">
            <Music className="h-3.5 w-3.5 text-white/70" />
            <p className="text-xs text-white/70">Original sound - {userName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Wrapper that picks the right mockup ────────────
export function PlatformMockup({
  platform,
  content,
  userName,
  userImage,
}: MockupProps & { platform: string }) {
  const props = { content, userName, userImage };

  switch (platform) {
    case "TWITTER":
      return <TwitterMockup {...props} />;
    case "LINKEDIN":
      return <LinkedInMockup {...props} />;
    case "INSTAGRAM":
      return <InstagramMockup {...props} />;
    case "TIKTOK":
      return <TikTokMockup {...props} />;
    default:
      return <TwitterMockup {...props} />;
  }
}
