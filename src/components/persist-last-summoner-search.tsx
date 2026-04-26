"use client"

import { useEffect } from "react"

import { writeLastSummonerSearch } from "@/lib/last-summoner-search"
import { isValidPlatform } from "@/lib/riot/regions"

type Props = {
  platform: string
  gameName: string
  tagLine: string
}

/** Call only after a successful profile load (server verified summoner). */
export function PersistLastSummonerSearch({ platform, gameName, tagLine }: Props) {
  useEffect(() => {
    const pl = platform.toLowerCase()
    if (!isValidPlatform(pl)) return
    writeLastSummonerSearch({
      platform: pl,
      riotId: `${gameName}#${tagLine}`,
    })
  }, [platform, gameName, tagLine])

  return null
}
