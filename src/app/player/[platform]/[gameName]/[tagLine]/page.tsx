import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { MatchCard } from "@/components/player/match-card"
import { PersistLastSummonerSearch } from "@/components/persist-last-summoner-search"
import { ProfileError } from "@/components/player/profile-error"
import { ProfileOverview } from "@/components/player/profile-overview"
import { ProfileTabs } from "@/components/player/profile-tabs"
import { loadPlayerProfile } from "@/lib/riot/profile"
import { isValidPlatform } from "@/lib/riot/regions"

type RouteParams = {
  platform: string
  gameName: string
  tagLine: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { gameName, tagLine } = await params
  const gn = decodeURIComponent(gameName)
  const tg = decodeURIComponent(tagLine)
  return {
    title: `${gn}#${tg} · Splasher`,
    description: `League of Legends profile, match history, and runes for ${gn}#${tg}.`,
  }
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { platform, gameName, tagLine } = await params
  const pl = platform.toLowerCase()
  if (!isValidPlatform(pl)) {
    notFound()
  }

  const gn = decodeURIComponent(gameName)
  const tg = decodeURIComponent(tagLine)
  const data = await loadPlayerProfile(pl, gn, tg)

  if (!data.ok) {
    return <ProfileError message={data.error} />
  }

  const { account, summoner, entries, masteries, matches, ddragonVersion } =
    data

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <PersistLastSummonerSearch
        platform={pl}
        gameName={account.gameName}
        tagLine={account.tagLine}
      />
      <ProfileTabs
        overview={
          <ProfileOverview
            account={account}
            summoner={summoner}
            entries={entries}
            masteries={masteries}
            version={ddragonVersion}
          />
        }
        matches={
          <div className="flex flex-col gap-4">
            {matches.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No recent matches returned for this account (or the match
                service is temporarily unavailable).
              </p>
            ) : (
              matches.map((m) => (
                <MatchCard
                  key={m.metadata.matchId}
                  match={m}
                  puuid={account.puuid}
                  version={ddragonVersion}
                  detailHref={`/player/${pl}/${encodeURIComponent(gn)}/${encodeURIComponent(tg)}/match/${m.metadata.matchId}`}
                />
              ))
            )}
          </div>
        }
      />
    </main>
  )
}
