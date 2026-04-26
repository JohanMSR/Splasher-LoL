import Image from "next/image"
import Link from "next/link"

import { getPerkInfoMap, itemIconUrl, perkIconUrl, spellIconUrl } from "@/lib/ddragon"
import { getSummonerSpellKeyById } from "@/lib/ddragon-summoner-spells"
import { queueLabel } from "@/lib/lol-queue"
import type { MatchDto } from "@/lib/riot/types"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function formatWhen(ts: number) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(ts)
  } catch {
    return ""
  }
}

export async function MatchCard({
  match,
  puuid,
  version,
  detailHref,
}: {
  match: MatchDto
  puuid: string
  version: string
  /** When set, the whole card links to the match splash view. */
  detailHref?: string
}) {
  const p = match.info.participants.find((x) => x.puuid === puuid)
  if (!p) return null

  const perkMap = await getPerkInfoMap(version)
  const [s1, s2] = await Promise.all([
    getSummonerSpellKeyById(version, p.summoner1Id),
    getSummonerSpellKeyById(version, p.summoner2Id),
  ])

  const items = [
    p.item0,
    p.item1,
    p.item2,
    p.item3,
    p.item4,
    p.item5,
    p.item6,
  ]

  const primary = p.perks.styles.find((s) => s.description === "primaryStyle")
  const sub = p.perks.styles.find((s) => s.description === "subStyle")

  const card = (
    <Card
      size="sm"
      className={cn(
        "overflow-hidden transition-[transform,box-shadow] duration-200 ease-[var(--ease-out-expo)]",
        detailHref &&
          "hover:ring-ring/40 cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      <CardHeader className="border-b pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${p.championName}.png`}
              alt=""
              width={48}
              height={48}
              className="ring-border rounded-lg ring-1"
            />
            <div>
              <CardTitle className="text-base">{p.championName}</CardTitle>
              <CardDescription>
                {queueLabel(match.info.queueId)} ·{" "}
                {formatWhen(match.info.gameEndTimestamp)}{" "}
                <span className="text-muted-foreground">
                  · {formatDuration(match.info.gameDuration)}
                </span>
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={p.win ? "secondary" : "outline"}>
              {p.win ? "Victory" : "Defeat"}
            </Badge>
            <span className="text-muted-foreground text-sm tabular-nums">
              {p.kills} / {p.deaths} / {p.assists}
            </span>
            <span className="text-muted-foreground text-xs">
              CS{" "}
              {p.totalMinionsKilled + (p.neutralMinionsKilled ?? 0)} · VS{" "}
              {p.visionScore}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {s1 ? (
            <Image
              src={spellIconUrl(version, s1)}
              alt="Summoner 1"
              width={28}
              height={28}
              className="ring-border rounded-md ring-1"
            />
          ) : null}
          {s2 ? (
            <Image
              src={spellIconUrl(version, s2)}
              alt="Summoner 2"
              width={28}
              height={28}
              className="ring-border rounded-md ring-1"
            />
          ) : null}
          <div className="flex flex-wrap gap-1">
            {items.map((id, idx) => {
              const href = itemIconUrl(version, id)
              if (!href) return null
              return (
                <Image
                  key={`${match.metadata.matchId}-it-${idx}`}
                  src={href}
                  alt=""
                  width={28}
                  height={28}
                  className="ring-border rounded-md ring-1"
                />
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Runes
          </p>
          <div className="flex flex-wrap gap-4">
            {primary ? (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground text-xs">Primary</p>
                <div className="flex flex-wrap items-center gap-1">
                  {primary.selections.map((sel) => {
                    const info = perkMap.get(sel.perk)
                    if (!info) return null
                    return (
                      <span key={sel.perk} title={info.name}>
                        <Image
                          src={perkIconUrl(info.iconPath)}
                          alt={info.name}
                          width={32}
                          height={32}
                          className="ring-border rounded-full ring-1"
                        />
                      </span>
                    )
                  })}
                </div>
              </div>
            ) : null}
            {sub ? (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground text-xs">Secondary</p>
                <div className="flex flex-wrap items-center gap-1">
                  {sub.selections.map((sel) => {
                    const info = perkMap.get(sel.perk)
                    if (!info) return null
                    return (
                      <span key={sel.perk} title={info.name}>
                        <Image
                          src={perkIconUrl(info.iconPath)}
                          alt={info.name}
                          width={28}
                          height={28}
                          className="ring-border rounded-full ring-1"
                        />
                      </span>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <p className="text-muted-foreground mt-2 text-[11px]">
            Stat shards: {p.perks.statPerks.offense} /{" "}
            {p.perks.statPerks.flex} / {p.perks.statPerks.defense}
          </p>
        </div>
      </CardContent>
    </Card>
  )

  if (detailHref) {
    return (
      <Link
        href={detailHref}
        aria-label={`Open match detail as ${p.championName}`}
        className="block rounded-xl outline-none transition-transform duration-200 ease-[var(--ease-out-expo)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99]"
      >
        {card}
      </Link>
    )
  }

  return card
}
