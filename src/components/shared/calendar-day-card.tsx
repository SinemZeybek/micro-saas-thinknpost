"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Clock, Plus, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { CalendarDayResponse } from "@/types";

const DAY_COLORS_BG = [
  "bg-blue-50",
  "bg-violet-50",
  "bg-fuchsia-50",
  "bg-pink-50",
  "bg-orange-50",
  "bg-amber-50",
  "bg-emerald-50",
];

const DAY_COLORS_BORDER = [
  "border-blue-200",
  "border-violet-200",
  "border-fuchsia-200",
  "border-pink-200",
  "border-orange-200",
  "border-amber-200",
  "border-emerald-200",
];

const DAY_COLORS_HEADER = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
];

// Colors cycle through 7 options regardless of which day of the week it is


interface IdeaVariant {
  title: string;
  summary: string;
}

interface CalendarDayCardProps {
  day: CalendarDayResponse;
  maxIdeas?: number;
  date: string;
  dayName: string;
}

export function CalendarDayCard({ day, date, dayName, maxIdeas = 2 }: CalendarDayCardProps) {
  const [ideas, setIdeas] = useState<IdeaVariant[]>([
    { title: day.title, summary: day.summary },
  ]);
  const [isAdding, setIsAdding] = useState(false);

  async function handleAddIdea() {
    setIsAdding(true);
    try {
      const res = await fetch("/api/calendar/another-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          existingIdeas: ideas.map((i) => i.title),
        }),
      });

      if (!res.ok) {
        toast.error("Failed to generate idea");
        return;
      }

      const newIdea = await res.json();
      setIdeas((prev) => [...prev, newIdea]);
      toast.success("New idea added!");
    } catch {
      toast.error("Failed to generate idea");
    } finally {
      setIsAdding(false);
    }
  }

  function handleDelete(index: number) {
    setIdeas((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div
      className={`flex flex-col rounded-lg border overflow-hidden ${DAY_COLORS_BORDER[day.dayOfWeek]} ${DAY_COLORS_BG[day.dayOfWeek]}`}
    >
      {/* Day Header */}
      <div className={`${DAY_COLORS_HEADER[day.dayOfWeek]} px-3 py-2.5 text-center`}>
        <p className="text-sm font-bold text-white uppercase tracking-wide">
          {dayName}
        </p>
        <p className="text-sm font-semibold text-white/90">{date}</p>
      </div>

      {/* Ideas */}
      {ideas.map((idea, index) => (
        <div
          key={index}
          className={`${DAY_COLORS_BG[day.dayOfWeek]} px-3 space-y-1.5 ${
            index === 0 ? "pt-3" : ""
          } ${index > 0 ? "pt-0" : ""} pb-2`}
        >
          {index === 0 && day.suggestedTime && (
            <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1">
              <Clock className="h-3 w-3" />
              {day.suggestedTime}
            </div>
          )}

          {index > 0 && <div className="border-t border-gray-200/60 pt-2" />}

          <div className="flex items-start justify-between gap-1">
            <h3 className="text-sm font-semibold text-gray-800 leading-snug flex-1">
              {idea.title}
            </h3>
            {ideas.length > 1 && (
              <button
                onClick={() => handleDelete(index)}
                className="shrink-0 rounded p-0.5 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                title="Remove this idea"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {idea.summary}
          </p>
          <Link
            href={`/generate?idea=${encodeURIComponent(idea.title + ": " + idea.summary)}`}
            className="block"
          >
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5 text-xs text-violet-600 border-violet-200 hover:bg-violet-50 cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              Generate Post
            </Button>
          </Link>
        </div>
      ))}

      {/* Add Another Idea — max 3 total */}
      {ideas.length < maxIdeas && (
        <div className={`${DAY_COLORS_BG[day.dayOfWeek]} px-3 pb-3`}>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddIdea}
            disabled={isAdding}
            className="w-full gap-1.5 text-xs text-gray-500 hover:text-violet-600 cursor-pointer"
          >
            {isAdding ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="h-3 w-3" />
                Another Idea
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
