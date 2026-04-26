import { isValidPlatform } from "@/lib/riot/regions"

export const LAST_SUMMONER_SEARCH_KEY = "splasher:lastSummonerSearch"

export type LastSummonerSearch = {
  platform: string
  riotId: string
}

export function readLastSummonerSearch(): LastSummonerSearch | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LAST_SUMMONER_SEARCH_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as Partial<LastSummonerSearch>
    if (!o.riotId || typeof o.riotId !== "string") return null
    const platform =
      typeof o.platform === "string" && isValidPlatform(o.platform)
        ? o.platform
        : "la1"
    return { platform, riotId: o.riotId }
  } catch {
    return null
  }
}

export function writeLastSummonerSearch(entry: LastSummonerSearch): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LAST_SUMMONER_SEARCH_KEY, JSON.stringify(entry))
  } catch {
    /* quota / private mode */
  }
}
