"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";

export function CancelSubscriptionButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleCancel() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      if (!res.ok) throw new Error("Failed to cancel");
      setDone(true);
      // Refresh the page to show updated status
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      alert("Failed to cancel subscription. Please try again.");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (done) {
    return (
      <p className="text-sm text-amber-600 font-medium">
        Subscription canceled. You&apos;ll keep PRO access until your billing period ends.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleCancel}
        disabled={loading}
        variant="outline"
        size="sm"
        className={
          confirming
            ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
            : "border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200"
        }
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
        ) : (
          <XCircle className="h-4 w-4 mr-1.5" />
        )}
        {confirming ? "Confirm Cancel" : "Cancel Subscription"}
      </Button>
      {confirming && (
        <Button
          onClick={() => setConfirming(false)}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-gray-600"
        >
          Never mind
        </Button>
      )}
    </div>
  );
}
