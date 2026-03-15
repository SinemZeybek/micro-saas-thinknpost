/**
 * Upgrade Button Component
 *
 * A client component that handles the "Upgrade to PRO" flow:
 * 1. User clicks the button
 * 2. We call our /api/checkout route
 * 3. It returns a Polar checkout URL
 * 4. We redirect the user to Polar's payment page
 *
 * This is a "client component" because it needs onClick
 * interactivity and useState for the loading state.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Loader2 } from "lucide-react";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Call our checkout API to get the Polar payment URL
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        // Redirect to Polar's checkout page
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      className="cursor-pointer gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md shadow-amber-200 transition-all hover:shadow-lg hover:shadow-amber-300"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Crown className="h-4 w-4" />
      )}
      {loading ? "Loading..." : "Upgrade to PRO"}
    </Button>
  );
}
