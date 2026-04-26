"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"

import { readLastSummonerSearch } from "@/lib/last-summoner-search"
import { LOL_PLATFORMS } from "@/lib/riot/regions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  /** Smaller layout for header */
  compact?: boolean
  defaultPlatform?: string
}

function parseRiotId(raw: string): { gameName: string; tagLine: string } | null {
  const t = raw.trim()
  const i = t.lastIndexOf("#")
  if (i <= 0 || i === t.length - 1) return null
  return {
    gameName: t.slice(0, i).trim(),
    tagLine: t.slice(i + 1).trim(),
  }
}

export function SummonerSearchForm({
  className,
  compact,
  defaultPlatform = "la1",
}: Props) {
  const router = useRouter()
  const [platform, setPlatform] = useState(defaultPlatform)
  const [riotId, setRiotId] = useState("")
  const [error, setError] = useState<string | null>(null)

  const restoreLastSearchOnFocus = useCallback(() => {
    if (riotId.trim() !== "") return
    const saved = readLastSummonerSearch()
    if (!saved) return
    setPlatform(saved.platform)
    setRiotId(saved.riotId)
  }, [riotId])

  const submit = useCallback(() => {
    setError(null)
    const parsed = parseRiotId(riotId)
    if (!parsed?.gameName || !parsed.tagLine) {
      setError("Use Riot ID: GameName#TAG (example: Doublelift#NA1)")
      return
    }
    const path = `/player/${platform}/${encodeURIComponent(parsed.gameName)}/${encodeURIComponent(parsed.tagLine)}`
    router.push(path)
  }, [riotId, platform, router])

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "flex min-w-0 w-full gap-2",
          compact ? "flex-col sm:flex-row" : "flex-col sm:flex-row"
        )}
      >
        <select
          aria-label="Region"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className={cn(
            "h-8 shrink-0 rounded-lg border border-input bg-background px-2 text-sm outline-none transition-[color,background-color,border-color,box-shadow] duration-200 ease-[var(--ease-micro)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            compact ? "sm:w-40" : "sm:w-48"
          )}
        >
          {LOL_PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} ({p.id})
            </option>
          ))}
        </select>
        <Input
          placeholder="Summoner#TAG"
          value={riotId}
          onChange={(e) => setRiotId(e.target.value)}
          onFocus={restoreLastSearchOnFocus}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className={cn(
            compact ? "h-8" : "h-9",
            "min-w-0 sm:flex-1 sm:basis-0"
          )}
        />
        <Button type="button" className="shrink-0" onClick={submit}>
          Search
        </Button>
      </div>
      {error ? (
        <p
          key={error}
          className="animate-splasher-enter-subtle text-destructive text-xs"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
