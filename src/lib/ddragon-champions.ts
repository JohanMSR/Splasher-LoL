import "server-only"

type ChampMeta = { name: string; ddragonId: string }

const cacheByVersion = new Map<string, Map<number, ChampMeta>>()

async function getChampionMap(version: string): Promise<Map<number, ChampMeta>> {
  let map = cacheByVersion.get(version)
  if (!map) {
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return new Map()
    const data = (await res.json()) as {
      data: Record<string, { id: string; key: string; name: string }>
    }
    map = new Map<number, ChampMeta>()
    for (const ch of Object.values(data.data)) {
      map.set(Number(ch.key), { name: ch.name, ddragonId: ch.id })
    }
    cacheByVersion.set(version, map)
  }
  return map
}

export async function getChampionMetaById(
  version: string,
  championId: number
): Promise<ChampMeta | null> {
  const map = await getChampionMap(version)
  return map.get(championId) ?? null
}
