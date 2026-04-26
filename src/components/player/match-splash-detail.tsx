import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { getPerkInfoMap, itemIconUrl, perkIconUrl, spellIconUrl } from "@/lib/ddragon"
import { resolveChampionSplashUrl } from "@/lib/ddragon-champion-skin"
import { getSummonerSpellKeyById } from "@/lib/ddragon-summoner-spells"
import { queueLabel } from "@/lib/lol-queue"
import type { MatchDto, MatchParticipant } from "@/lib/riot/types"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
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

function teamKills(match: MatchDto, teamId: number) {
  return match.info.participants
    .filter((x) => x.teamId === teamId)
    .reduce((acc, x) => acc + x.kills, 0)
}

export async function MatchSplashDetail({
  match,
  participant,
  version,
  backHref,
  riotIdLabel,
}: {
  match: MatchDto
  participant: MatchParticipant
  version: string
  backHref: string
  riotIdLabel: string
}) {
  const splash = await resolveChampionSplashUrl({
    participant,
    championId: participant.championId,
    championName: participant.championName,
    fallbackDdragonVersion: version,
    matchGameVersion: match.info.gameVersion,
  })
  const perkMap = await getPerkInfoMap(version)
  const [s1, s2] = await Promise.all([
    getSummonerSpellKeyById(version, participant.summoner1Id),
    getSummonerSpellKeyById(version, participant.summoner2Id),
  ])

  const items = [
    participant.item0,
    participant.item1,
    participant.item2,
    participant.item3,
    participant.item4,
    participant.item5,
    participant.item6,
  ]

  const primary = participant.perks.styles.find(
    (s) => s.description === "primaryStyle"
  )
  const sub = participant.perks.styles.find(
    (s) => s.description === "subStyle"
  )

  const kills100 = teamKills(match, 100)
  const kills200 = teamKills(match, 200)
  const mySide = participant.teamId === 100 ? "Blue" : "Red"
  const enemyKills = participant.teamId === 100 ? kills200 : kills100
  const allyKills = participant.teamId === 100 ? kills100 : kills200

  return (
    <article className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden">
      <Image
        src={splash}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_12%]"
        unoptimized
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/92 to-background/55"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/40" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col px-4 pb-16 pt-6 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
              Splasher
            </span>
            <span className="text-border hidden h-4 w-px bg-border sm:inline-block" />
            <span className="text-muted-foreground max-w-[200px] truncate text-xs sm:max-w-xs">
              {riotIdLabel}
            </span>
          </div>
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "bg-background/70 backdrop-blur-md"
            )}
          >
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Back to profile
          </Link>
        </div>

        <div className="mt-auto flex flex-col gap-8">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={participant.win ? "secondary" : "outline"}
                className="backdrop-blur-sm"
              >
                {participant.win ? "Victory" : "Defeat"}
              </Badge>
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                {queueLabel(match.info.queueId)}
              </Badge>
            </div>
            <h1 className="font-heading text-4xl font-semibold tracking-tight drop-shadow-sm sm:text-5xl md:text-6xl">
              {participant.championName}
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm drop-shadow sm:text-base">
              {formatWhen(match.info.gameEndTimestamp)} ·{" "}
              {formatDuration(match.info.gameDuration)} · {mySide} side
            </p>
          </header>

          <div className="grid gap-6 rounded-2xl border border-white/10 bg-card/55 p-5 shadow-2xl backdrop-blur-xl sm:grid-cols-2 sm:p-8">
            <section className="space-y-4">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Score
              </p>
              <div className="flex flex-wrap items-end gap-4">
                <p className="text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl">
                  <span className="text-foreground">
                    {participant.kills}
                  </span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span className="text-muted-foreground">
                    {participant.deaths}
                  </span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span className="text-foreground">
                    {participant.assists}
                  </span>
                </p>
                <div className="text-muted-foreground pb-1 text-sm">
                  <p>
                    CS{" "}
                    {participant.totalMinionsKilled +
                      (participant.neutralMinionsKilled ?? 0)}
                  </p>
                  <p>Vision {participant.visionScore}</p>
                  <p>Gold {(participant.goldEarned / 1000).toFixed(1)}k</p>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-background/40 px-4 py-3">
                <p className="text-muted-foreground text-xs uppercase">
                  Team kills
                </p>
                <p className="mt-1 text-lg font-medium tabular-nums">
                  <span className="text-sky-300">{allyKills}</span>
                  <span className="text-muted-foreground mx-2">—</span>
                  <span className="text-rose-300">{enemyKills}</span>
                  <span className="text-muted-foreground ml-2 text-sm font-normal">
                    (Blue {kills100} · Red {kills200})
                  </span>
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Summoner spells
              </p>
              <div className="flex gap-3">
                {s1 ? (
                  <Image
                    src={spellIconUrl(version, s1)}
                    alt=""
                    width={48}
                    height={48}
                    className="ring-border rounded-xl ring-2 ring-white/20"
                  />
                ) : null}
                {s2 ? (
                  <Image
                    src={spellIconUrl(version, s2)}
                    alt=""
                    width={48}
                    height={48}
                    className="ring-border rounded-xl ring-2 ring-white/20"
                  />
                ) : null}
              </div>
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Items
              </p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((id, idx) => {
                  const href = itemIconUrl(version, id)
                  if (!href) return null
                  return (
                    <Image
                      key={`splash-it-${idx}`}
                      src={href}
                      alt=""
                      width={44}
                      height={44}
                      className="ring-border rounded-lg ring-1 ring-white/15"
                    />
                  )
                })}
              </div>
            </section>

            <section className="sm:col-span-2">
              <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                Runes
              </p>
              <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
                {primary ? (
                  <div>
                    <p className="text-muted-foreground mb-2 text-xs">Primary</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {primary.selections.map((sel) => {
                        const info = perkMap.get(sel.perk)
                        if (!info) return null
                        return (
                          <span key={sel.perk} title={info.name}>
                            <Image
                              src={perkIconUrl(info.iconPath)}
                              alt={info.name}
                              width={44}
                              height={44}
                              className="ring-border rounded-full ring-2 ring-white/20"
                            />
                          </span>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
                {sub ? (
                  <div>
                    <p className="text-muted-foreground mb-2 text-xs">
                      Secondary
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {sub.selections.map((sel) => {
                        const info = perkMap.get(sel.perk)
                        if (!info) return null
                        return (
                          <span key={sel.perk} title={info.name}>
                            <Image
                              src={perkIconUrl(info.iconPath)}
                              alt={info.name}
                              width={40}
                              height={40}
                              className="ring-border rounded-full ring-2 ring-white/15"
                            />
                          </span>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
              <p className="text-muted-foreground mt-4 text-[11px]">
                Stat shards: {participant.perks.statPerks.offense} /{" "}
                {participant.perks.statPerks.flex} /{" "}
                {participant.perks.statPerks.defense}
              </p>
            </section>
          </div>
        </div>
      </div>
    </article>
  )
}
