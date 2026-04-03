"use client";

import { Heart, MessageCircle, Repeat2, Share, Bookmark, ThumbsUp, Send, Globe, Music } from "lucide-react";

interface MockupProps {
  content: string;
  userName?: string;
  userImage?: string;
  compact?: boolean;
}

function Avatar({ userName = "You", userImage, size = "sm" }: { userName?: string; userImage?: string; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "h-10 w-10" : "h-8 w-8";
  const textSize = size === "md" ? "text-sm" : "text-xs";

  return (
    <div className={`${sizeClass} flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-gray-200 to-gray-300`}>
      {userImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={userImage} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className={`flex h-full w-full items-center justify-center ${textSize} font-bold text-gray-500`}>
          {userName?.[0]?.toUpperCase() || "Y"}
        </div>
      )}
    </div>
  );
}

// ─── Twitter / X ────────────────────────────────────
export function TwitterMockup({ content, userName = "You", userImage, compact }: MockupProps) {
  const handle = `@${userName.toLowerCase().replace(/\s+/g, "")}`;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className={`flex items-start gap-2.5 ${compact ? "p-2.5" : "p-3"}`}>
        <Avatar userName={userName} userImage={userImage} size={compact ? "sm" : "md"} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className={`${compact ? "text-xs" : "text-sm"} font-bold text-gray-900 truncate`}>{userName}</span>
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-[#1d9bf0]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
            </svg>
            <span className="text-xs text-gray-400 truncate">{handle}</span>
          </div>
          <p className={`mt-1 whitespace-pre-wrap ${compact ? "text-xs line-clamp-3" : "text-sm"} leading-relaxed text-gray-900`}>{content}</p>
          <div className={`${compact ? "mt-1.5" : "mt-2"} flex justify-between max-w-[300px] text-gray-400`}>
            <MessageCircle className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} hover:text-[#1d9bf0]`} />
            <Repeat2 className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} hover:text-green-500`} />
            <Heart className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} hover:text-pink-500`} />
            <Bookmark className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} hover:text-[#1d9bf0]`} />
            <Share className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"} hover:text-[#1d9bf0]`} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LinkedIn ───────────────────────────────────────
export function LinkedInMockup({ content, userName = "You", userImage, compact }: MockupProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className={`flex items-start gap-2.5 ${compact ? "p-2.5 pb-1.5" : "p-3 pb-2"}`}>
        <Avatar userName={userName} userImage={userImage} size={compact ? "sm" : "md"} />
        <div className="flex-1">
          <p className={`${compact ? "text-xs" : "text-sm"} font-semibold text-gray-900`}>{userName}</p>
          <p className={`${compact ? "text-[10px]" : "text-xs"} text-gray-500`}>Content Creator</p>
          {!compact && (
            <p className="flex items-center gap-1 text-[11px] text-gray-400">
              Just now · <Globe className="h-3 w-3" />
            </p>
          )}
        </div>
      </div>

      <div className={`${compact ? "px-2.5 pb-2" : "px-3 pb-3"}`}>
        <p className={`whitespace-pre-wrap ${compact ? "text-xs line-clamp-3" : "text-sm"} leading-relaxed text-gray-800`}>{content}</p>
      </div>

      <div className={`flex justify-around border-t border-gray-100 px-2 ${compact ? "py-1" : "py-1.5"}`}>
        <span className={`flex items-center gap-1 ${compact ? "text-[10px]" : "text-xs"} font-medium text-gray-500`}>
          <ThumbsUp className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} /> Like
        </span>
        <span className={`flex items-center gap-1 ${compact ? "text-[10px]" : "text-xs"} font-medium text-gray-500`}>
          <MessageCircle className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} /> Comment
        </span>
        <span className={`flex items-center gap-1 ${compact ? "text-[10px]" : "text-xs"} font-medium text-gray-500`}>
          <Repeat2 className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} /> Repost
        </span>
        <span className={`flex items-center gap-1 ${compact ? "text-[10px]" : "text-xs"} font-medium text-gray-500`}>
          <Send className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} /> Send
        </span>
      </div>
    </div>
  );
}

// ─── Instagram ──────────────────────────────────────
export function InstagramMockup({ content, userName = "You", userImage, compact }: MockupProps) {
  const handle = userName.toLowerCase().replace(/\s+/g, "");

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className={`flex items-center gap-2.5 ${compact ? "px-2.5 py-2" : "px-3 py-2.5"}`}>
        <div className="overflow-hidden rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px]">
          <div className={`${compact ? "h-6 w-6" : "h-7 w-7"} overflow-hidden rounded-full bg-white p-[1px]`}>
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
        <span className={`${compact ? "text-xs" : "text-sm"} font-semibold text-gray-900`}>{handle}</span>
      </div>

      <div className={`${compact ? "px-2.5 pb-1.5" : "px-3 pb-2"}`}>
        <p className={`whitespace-pre-wrap ${compact ? "text-xs line-clamp-3" : "text-sm"} leading-relaxed text-gray-800`}>
          <span className="font-semibold">{handle}</span>{" "}
          {content}
        </p>
      </div>

      <div className={`flex items-center justify-between border-t border-gray-100 ${compact ? "px-2.5 py-1.5" : "px-3 py-2"}`}>
        <div className={`flex ${compact ? "gap-3" : "gap-3.5"} text-gray-600`}>
          <Heart className={`${compact ? "h-4 w-4" : "h-5 w-5"}`} />
          <MessageCircle className={`${compact ? "h-4 w-4" : "h-5 w-5"}`} />
          <Send className={`${compact ? "h-4 w-4" : "h-5 w-5"}`} />
        </div>
        <Bookmark className={`${compact ? "h-4 w-4" : "h-5 w-5"} text-gray-600`} />
      </div>
    </div>
  );
}

// ─── TikTok ─────────────────────────────────────────
export function TikTokMockup({ content, userName = "You", userImage, compact }: MockupProps) {
  const handle = `@${userName.toLowerCase().replace(/\s+/g, "")}`;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
      <div className={`flex items-start gap-2.5 ${compact ? "p-2.5" : "p-3"}`}>
        <div className="flex-shrink-0">
          <div className={`${compact ? "h-6 w-6" : "h-8 w-8"} overflow-hidden rounded-full border-2 border-gray-700 bg-gray-700`}>
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                {userName[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`${compact ? "text-xs" : "text-sm"} font-bold text-white`}>{handle}</p>
          <p className={`mt-1 whitespace-pre-wrap ${compact ? "text-xs line-clamp-3" : "text-[13px]"} leading-relaxed text-white/90`}>{content}</p>
          {!compact && (
            <div className="mt-2 flex items-center gap-1.5">
              <Music className="h-3 w-3 text-white/50" />
              <p className="text-[11px] text-white/50">Original sound - {userName}</p>
            </div>
          )}
          <div className={`${compact ? "mt-1.5" : "mt-2"} flex gap-4 text-white/50`}>
            <Heart className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
            <MessageCircle className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
            <Bookmark className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
            <Share className={`${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
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
  compact,
}: MockupProps & { platform: string }) {
  const props = { content, userName, userImage, compact };

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
