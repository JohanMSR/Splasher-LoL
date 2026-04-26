"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { SummonerSearchForm } from "@/components/summoner-search-form"

export function SiteHeader() {
  const pathname = usePathname()
  const showQuickSearch = pathname !== "/"

  return (
    <header className="border-b bg-background/80 backdrop-blur-md transition-[background-color,border-color] duration-200 ease-[var(--ease-micro)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <Link
          href="/"
          className="shrink-0 font-semibold tracking-tight transition-[color,opacity] duration-200 ease-[var(--ease-micro)] hover:opacity-90"
        >
          Splasher
          <span className="text-muted-foreground font-normal"> · LoL</span>
        </Link>
        {showQuickSearch ? (
          <SummonerSearchForm className="w-full sm:max-w-md" compact />
        ) : (
          <span className="hidden sm:block" aria-hidden />
        )}
      </div>
    </header>
  )
}
