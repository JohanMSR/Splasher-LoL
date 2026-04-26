import "server-only"

let cachedVersion: string | null = null
let cachedAt = 0
const TTL_MS = 1000 * 60 * 60

export async function getDdragonVersion(): Promise<string> {
  const pinned = process.env.NEXT_PUBLIC_DDRAGON_VERSION?.trim()
  if (pinned) return pinned

  const now = Date.now()
  if (cachedVersion && now - cachedAt < TTL_MS) {
    return cachedVersion
  }

  const res = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json",
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error("Failed to load Data Dragon versions")
  const versions = (await res.json()) as string[]
  const v = versions[0]
  if (!v) throw new Error("No Data Dragon version")
  cachedVersion = v
  cachedAt = now
  return v
}

export function championIconUrl(version: string, championName: string) {
  const key = championName.replace(/[^a-zA-Z0-9._]/g, "")
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${key}.png`
}

/** Champion splash art (global CDN path, not versioned). `skinNum` is Data Dragon `skins[].num`. */
export function championSplashUrl(championName: string, skinNum = 0) {
  const key = championName.replace(/[^a-zA-Z0-9._]/g, "")
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${key}_${skinNum}.jpg`
}

export function profileIconUrl(version: string, profileIconId: number) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${profileIconId}.png`
}

export function itemIconUrl(version: string, itemId: number) {
  if (itemId === 0) return null
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`
}

export function spellIconUrl(version: string, spellKey: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spellKey}.png`
}

type RuneTreeJson = {
  id: number
  key: string
  icon: string
  name: string
  slots: { runes: { id: number; key: string; icon: string; name: string }[] }[]
}

const perkMapByVersion = new Map<
  string,
  Map<number, { name: string; iconPath: string }>
>()

export async function getPerkInfoMap(version: string) {
  const cached = perkMapByVersion.get(version)
  if (cached) return cached

  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`,
    { next: { revalidate: 86400 } }
  )
  if (!res.ok) throw new Error("Failed to load runes data")
  const trees = (await res.json()) as RuneTreeJson[]
  const map = new Map<number, { name: string; iconPath: string }>()
  for (const tree of trees) {
    map.set(tree.id, { name: tree.name, iconPath: tree.icon })
    for (const slot of tree.slots) {
      for (const r of slot.runes) {
        map.set(r.id, { name: r.name, iconPath: r.icon })
      }
    }
  }
  perkMapByVersion.set(version, map)
  return map
}

export function perkIconUrl(iconPathFromJson: string) {
  return `https://ddragon.leagueoflegends.com/cdn/img/${iconPathFromJson}`
}
