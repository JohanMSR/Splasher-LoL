import Image from "next/image"

import { getChampionMetaById } from "@/lib/ddragon-champions"
import { profileIconUrl } from "@/lib/ddragon"
import type { ChampionMastery, LeagueEntry, RiotAccount, RiotSummoner } from "@/lib/riot/types"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function rankBadge(entry: LeagueEntry | undefined) {
  if (!entry) return "Unranked"
  return `${entry.tier} ${entry.rank} · ${entry.leaguePoints} LP`
}

export async function ProfileOverview({
  account,
  summoner,
  entries,
  masteries,
  version,
}: {
  account: RiotAccount
  summoner: RiotSummoner
  entries: LeagueEntry[]
  masteries: ChampionMastery[]
  version: string
}) {
  const solo = entries.find((e) => e.queueType === "RANKED_SOLO_5x5")
  const flex = entries.find((e) => e.queueType === "RANKED_FLEX_SR")

  const masteryRows = await Promise.all(
    masteries.map(async (m) => {
      const meta = await getChampionMetaById(version, m.championId)
      const slug = meta?.ddragonId ?? String(m.championId)
      const name = meta?.name ?? `Champion ${m.championId}`
      return { m, slug, name }
    })
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Image
            src={profileIconUrl(version, summoner.profileIconId)}
            alt=""
            width={72}
            height={72}
            className="ring-border rounded-xl ring-1"
          />
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate text-lg">
              {account.gameName}
              <span className="text-muted-foreground font-normal">
                #{account.tagLine}
              </span>
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Level {summoner.summonerLevel}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Ranked Solo/Duo
            </p>
            <p className="mt-1 font-medium">{rankBadge(solo)}</p>
            {solo ? (
              <p className="text-muted-foreground mt-1 text-xs">
                {solo.wins}W {solo.losses}L ·{" "}
                {(
                  (solo.wins / Math.max(1, solo.wins + solo.losses)) *
                  100
                ).toFixed(1)}
                % WR
              </p>
            ) : null}
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Ranked Flex
            </p>
            <p className="mt-1 font-medium">{rankBadge(flex)}</p>
            {flex ? (
              <p className="text-muted-foreground mt-1 text-xs">
                {flex.wins}W {flex.losses}L
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top champions</CardTitle>
          <p className="text-muted-foreground text-sm">
            Champion points from your most played champions.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {masteryRows.map(({ m, slug, name }) => (
              <li
                key={m.championId}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Image
                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${slug}.png`}
                    alt=""
                    width={32}
                    height={32}
                    className="ring-border shrink-0 rounded-md ring-1"
                  />
                  <span className="truncate text-sm font-medium">{name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">M{m.championLevel}</Badge>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {m.championPoints.toLocaleString()} pts
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
