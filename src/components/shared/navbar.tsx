"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Sparkles, Heart, Settings, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/generate", label: "Generate", icon: Sparkles },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-violet-100/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/generate">
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-xl sm:text-2xl font-bold text-transparent">
            ThinkNPost
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`cursor-pointer gap-2 text-sm ${
                    isActive
                      ? "bg-violet-100 text-violet-700 hover:bg-violet-100"
                      : "text-gray-500 hover:bg-violet-50 hover:text-violet-600"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}

          <div className="ml-2 h-6 w-px bg-violet-100" />

          <Button
            variant="ghost"
            className="cursor-pointer gap-2 text-sm text-gray-400 hover:bg-rose-50 hover:text-rose-500"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden cursor-pointer text-gray-500"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-violet-100 bg-white px-4 pb-4 pt-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <div
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-violet-100 text-violet-700"
                      : "text-gray-600 hover:bg-violet-50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
          <div className="my-2 h-px bg-violet-100" />
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-rose-50 hover:text-rose-500"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
