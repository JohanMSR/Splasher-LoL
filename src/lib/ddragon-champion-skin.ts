import "server-only"

import { extractParticipantSkinId } from "@/lib/riot/participant-skin"

type SkinEntry = { id: string; num: number; name: string }

type ChampionStub = { key: string; id: string; name: string }

const skinsCache = new Map<string, SkinEntry[]>()
const championListCache = new Map<string, Record<string, ChampionStub>>()

function cacheKey(version: string, championKey: string) {
  return `${version}:${championKey}`
}

function normalizeGameVersionForDdragon(raw?: string): string | undefined {
  if (!raw || typeof raw !== "string") return undefined
  const parts = raw.split(".").filter((p) => p.length > 0)
  if (parts.length === 0) return undefined
  if (parts.length >= 3) return `${parts[0]}.${parts[1]}.${parts[2]}`
  if (parts.length === 2) return `${parts[0]}.${parts[1]}.1`
  return parts[0]
}

async function getChampionList(version: string) {
  const hit = championListCache.get(version)
  if (hit) return hit

  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
    { next: { revalidate: 86400 } }
  )
  if (!res.ok) {
    return null
  }
  const json = (await res.json()) as { data: Record<string, ChampionStub> }
  championListCache.set(version, json.data)
  return json.data
}

export async function resolveChampionDataKey(
  version: string,
  championId: number,
  championName: string
): Promise<string> {
  const cleaned = championName.replace(/[^a-zA-Z0-9._]/g, "")
  const list = await getChampionList(version)
  if (!list) {
    return cleaned
  }

  for (const ch of Object.values(list)) {
    if (Number(ch.key) === championId) {
      return ch.id
    }
  }

  if (list[cleaned]) {
    return cleaned
  }

  const lower = cleaned.toLowerCase()
  for (const ch of Object.values(list)) {
    if (ch.id.toLowerCase() === lower) {
      return ch.id
    }
  }

  return cleaned
}

async function loadChampionSkins(
  version: string,
  championDataKey: string
): Promise<SkinEntry[] | null> {
  const key = cacheKey(version, championDataKey)
  const hit = skinsCache.get(key)
  if (hit) return hit

  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${championDataKey}.json`,
    { next: { revalidate: 86400 } }
  )
  if (!res.ok) {
    return null
  }
  const json = (await res.json()) as {
    data: Record<string, { skins: SkinEntry[] }>
  }
  const champ = json.data[championDataKey]
  if (!champ?.skins?.length) {
    return null
  }
  skinsCache.set(key, champ.skins)
  return champ.skins
}

function buildSplashCandidates(
  championKey: string,
  skinNum: number,
  version: string
): string[] {
  const safe = championKey.replace(/[^a-zA-Z0-9._]/g, "")
  const base = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${safe}_${skinNum}.jpg`
  const versioned = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/splash/${safe}_${skinNum}.jpg`
  return base === versioned ? [base] : [base, versioned]
}

async function splashUrlIsReachable(url: string): Promise<boolean> {
  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      cache: "no-store",
    })
    if (res.ok) return true
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        cache: "no-store",
      })
    }
    return res.ok
  } catch {
    return false
  }
}

async function pickFirstReachableSplash(
  championKey: string,
  skinNum: number,
  version: string
): Promise<string | null> {
  const candidates = buildSplashCandidates(championKey, skinNum, version)
  for (const url of candidates) {
    if (await splashUrlIsReachable(url)) {
      return url
    }
  }
  return candidates[0] ?? null
}

/** Preferred splash `num` values (Data Dragon) for this Riot skin id. */
function skinNumsToTry(
  skins: SkinEntry[],
  riotSkinId: number | undefined
): number[] {
  if (riotSkinId == null) {
    return [0]
  }

  if (!skins.length) {
    if (riotSkinId >= 0 && riotSkinId < 400) {
      return [...new Set([riotSkinId, 0])]
    }
    return [0]
  }

  const nums: number[] = []
  const byId =
    skins.find((s) => Number(s.id) === riotSkinId) ||
    skins.find((s) => String(s.id) === String(riotSkinId))
  if (byId) nums.push(byId.num)

  const byNum = skins.find((s) => s.num === riotSkinId)
  if (byNum && !nums.includes(byNum.num)) {
    nums.push(byNum.num)
  }

  if (!nums.includes(0)) {
    nums.push(0)
  }
  return [...new Set(nums)]
}

export async function resolveChampionSplashUrl(params: {
  participant: object
  championId: number
  championName: string
  fallbackDdragonVersion: string
  matchGameVersion?: string
}): Promise<string> {
  const riotSkinId = extractParticipantSkinId(
    params.participant,
    params.championId
  )

  const fromMatch = normalizeGameVersionForDdragon(params.matchGameVersion)
  const versions = [
    ...new Set(
      [fromMatch, params.fallbackDdragonVersion].filter(Boolean)
    ),
  ] as string[]

  const safeFallbackKey = params.championName.replace(/[^a-zA-Z0-9._]/g, "")

  for (const version of versions) {
    const champKey = await resolveChampionDataKey(
      version,
      params.championId,
      params.championName
    )
    const skins = await loadChampionSkins(version, champKey)
    const nums = skinNumsToTry(skins ?? [], riotSkinId)

    for (const num of nums) {
      const url = await pickFirstReachableSplash(champKey, num, version)
      if (url) {
        return url
      }
    }
  }

  const fallbackUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${safeFallbackKey}_0.jpg`
  if (await splashUrlIsReachable(fallbackUrl)) {
    return fallbackUrl
  }
  return fallbackUrl
}
