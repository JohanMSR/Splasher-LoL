import "server-only"

const cacheByVersion = new Map<string, Map<number, string>>()

export async function getSummonerSpellKeyById(
  version: string,
  spellId: number
): Promise<string | null> {
  let map = cacheByVersion.get(version)
  if (!map) {
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    const data = (await res.json()) as {
      data: Record<string, { key: string; id: string }>
    }
    map = new Map<number, string>()
    for (const s of Object.values(data.data)) {
      map.set(Number(s.key), s.id)
    }
    cacheByVersion.set(version, map)
  }
  return map.get(spellId) ?? null
}
