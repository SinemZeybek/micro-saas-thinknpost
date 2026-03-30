"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CalendarDayCard } from "@/components/shared/calendar-day-card";
import { CalendarDays, Loader2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import type { CalendarWeekResponse } from "@/types";

const WEEK_LIMITS = { FREE: 1, PRO: 4 } as const;

export default function CalendarPage() {
  const { data: session } = useSession();
  const plan = (session?.user?.plan || "FREE") as "FREE" | "PRO";
  const maxWeeks = WEEK_LIMITS[plan];

  const [weeks, setWeeks] = useState<CalendarWeekResponse[]>([]);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWeeks = useCallback(async () => {
    const res = await fetch("/api/calendar");
    if (res.ok) setWeeks(await res.json());
  }, []);

  useEffect(() => {
    fetchWeeks();
  }, [fetchWeeks]);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/calendar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to generate calendar");
        return;
      }

      const newWeek = await res.json();
      setWeeks((prev) => [newWeek, ...prev]);
      setActiveWeekIndex(0);
      toast.success("7-day content calendar generated!");
    } catch {
      toast.error("Failed to generate calendar");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDelete(weekId: string) {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/calendar/${weekId}`, { method: "DELETE" });
      if (res.ok) {
        setWeeks((prev) => prev.filter((w) => w.id !== weekId));
        setActiveWeekIndex(0);
        toast.success("Calendar deleted");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  }

  const activeWeek = weeks[activeWeekIndex];

  function getDateForDay(startDate: string, dayOfWeek: number): string {
    const start = new Date(startDate);
    const date = new Date(start);
    date.setDate(start.getDate() + dayOfWeek);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function getDayName(startDate: string, dayOfWeek: number): string {
    const start = new Date(startDate);
    const date = new Date(start);
    date.setDate(start.getDate() + dayOfWeek);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }

  function formatWeekRange(startDate: string): string {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            PostCalendar
          </h1>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 font-semibold text-white shadow-lg hover:from-violet-700 hover:to-fuchsia-600 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <CalendarDays className="h-4 w-4" />
                Generate Week
              </>
            )}
          </Button>
        </div>

        <div className="rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50/60 to-fuchsia-50/60 px-5 py-4 space-y-2">
          <p className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
            Never run out of content ideas.
          </p>
          <p className="text-sm leading-relaxed text-gray-500">
            PostCalendar uses the knowledge you uploaded in{" "}
            <a href="/knowledge" className="font-medium text-violet-600 underline underline-offset-2 hover:text-violet-700">
              ThinkBank
            </a>{" "}
            to plan your week — each day with a unique content idea based on your product. Hit &ldquo;Generate Post&rdquo; on any day to turn it into a ready-to-publish post.
          </p>
        </div>
      </div>

      {/* Week Selector */}
      {weeks.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveWeekIndex((i) => i + 1)}
            disabled={activeWeekIndex >= weeks.length - 1}
            className="cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              {activeWeek && formatWeekRange(activeWeek.startDate)}
            </p>
            {activeWeek?.sourceNames && (
              <p className="text-xs text-gray-400 truncate max-w-xs" title={activeWeek.sourceNames}>
                Based on: {activeWeek.sourceNames}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveWeekIndex((i) => i - 1)}
            disabled={activeWeekIndex <= 0}
            className="cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Calendar Grid */}
      {activeWeek && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 items-start">
            {activeWeek.days.map((day) => (
              <CalendarDayCard
                key={day.id}
                day={day}
                date={getDateForDay(activeWeek.startDate, day.dayOfWeek)}
                dayName={getDayName(activeWeek.startDate, day.dayOfWeek)}
                maxIdeas={plan === "PRO" ? 3 : 2}
              />
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(activeWeek.id)}
              disabled={isDeleting}
              className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete this calendar
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {weeks.length === 0 && !isGenerating && (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-sm font-medium text-gray-700">
            No calendars yet
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Generate your first 7-day content calendar
          </p>
        </div>
      )}

      {/* Info */}
      {weeks.length > 0 && (
        <p className="text-center text-sm text-gray-400">
          {weeks.length} calendar{weeks.length > 1 ? "s" : ""} saved &middot; Last {maxWeeks} {maxWeeks === 1 ? "is" : "are"} kept
        </p>
      )}
    </div>
  );
}
