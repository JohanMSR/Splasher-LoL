import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { MatchSplashDetail } from "@/components/player/match-splash-detail"
import { PersistLastSummonerSearch } from "@/components/persist-last-summoner-search"
import { ProfileError } from "@/components/player/profile-error"
import { loadMatchView } from "@/lib/riot/profile"
import { isValidPlatform } from "@/lib/riot/regions"

type RouteParams = {
  platform: string
  gameName: string
  tagLine: string
  matchId: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { gameName, tagLine, matchId } = await params
  const gn = decodeURIComponent(gameName)
  const tg = decodeURIComponent(tagLine)
  return {
    title: `Match ${matchId} · ${gn}#${tg}`,
    description: `Splasher match breakdown for ${gn}#${tg}.`,
  }
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { platform, gameName, tagLine, matchId } = await params
  const pl = platform.toLowerCase()
  if (!isValidPlatform(pl)) {
    notFound()
  }

  const gn = decodeURIComponent(gameName)
  const tg = decodeURIComponent(tagLine)
  const data = await loadMatchView(pl, gn, tg, matchId)

  if (!data.ok) {
    return <ProfileError message={data.error} />
  }

  const backHref = `/player/${pl}/${encodeURIComponent(gn)}/${encodeURIComponent(tg)}`
  const riotIdLabel = `${data.account.gameName}#${data.account.tagLine}`

  return (
    <main className="w-full max-w-none flex-1 px-0">
      <PersistLastSummonerSearch
        platform={pl}
        gameName={data.account.gameName}
        tagLine={data.account.tagLine}
      />
      <MatchSplashDetail
        match={data.match}
        participant={data.participant}
        version={data.ddragonVersion}
        backHref={backHref}
        riotIdLabel={riotIdLabel}
      />
    </main>
  )
}
