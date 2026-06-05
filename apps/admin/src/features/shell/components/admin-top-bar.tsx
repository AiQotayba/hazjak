"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";

export function AdminTopBar() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/bookings?search=${encodeURIComponent(q)}`);
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
    : "أ";

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border/60 bg-card/80 backdrop-blur-md px-4 py-3 md:px-6">
      <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="بحث في الحجوزات والملاعب..."
          className="pe-10 h-11 rounded-2xl bg-secondary/80 border-0 shadow-none"
        />
      </form>

      <div className="flex items-center gap-3 ms-auto">
        <Link
          href="/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground hover:text-heading transition-colors"
          aria-label="الإشعارات"
        >
          <Bell className="h-5 w-5" />
        </Link>

        <div className="flex items-center gap-2.5 rounded-2xl bg-secondary/80 ps-1.5 pe-3 py-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white text-sm font-bold">
            {initials}
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-sm font-bold text-heading truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-muted-foreground">مدير النظام</p>
          </div>
        </div>
      </div>
    </header>
  );
}
