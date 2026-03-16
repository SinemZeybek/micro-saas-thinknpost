"use client";

import { useState } from "react";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ExportCSVButton() {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/posts/export");

      if (!res.ok) {
        toast.error("Failed to export posts");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thinknpost-posts-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(true);
      toast.success("Posts exported!");
      setTimeout(() => setDone(false), 2000);
    } catch {
      toast.error("Failed to export posts");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="cursor-pointer gap-2 border-violet-200 text-violet-600 hover:bg-violet-50"
      onClick={handleExport}
      disabled={exporting}
    >
      {done ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          Exported!
        </>
      ) : exporting ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-300 border-t-violet-600" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </>
      )}
    </Button>
  );
}
