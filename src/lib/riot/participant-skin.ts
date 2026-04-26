/**
 * Riot Match v5 participant objects include a skin id under a few possible keys
 * (camelCase, PascalCase, legacy). Values may be number or numeric string.
 *
 * When Riot omits documented keys, many skin ids still follow:
 * `floor(skinId / 1000) === championId` (see Data Dragon `skins[].id`).
 */
export function extractParticipantSkinId(
  participant: object,
  championId: number
): number | undefined {
  const explicit = extractExplicitSkinId(participant)
  if (explicit != null) {
    return explicit
  }
  const fromDeep = deepScanForSkinId(participant, championId)
  if (fromDeep != null) {
    return fromDeep
  }
  const fromRegex = extractSkinIdFromJsonString(participant)
  if (fromRegex != null) {
    return fromRegex
  }
  return inferSkinIdFromChampionSkinBand(participant, championId)
}

function extractSkinIdFromJsonString(participant: object): number | undefined {
  try {
    const raw = JSON.stringify(participant)
    const patterns = [
      /"championSkinId"\s*:\s*(\d+)/i,
      /"champion_skin_id"\s*:\s*(\d+)/i,
      /"skinId"\s*:\s*(\d+)/i,
    ]
    for (const re of patterns) {
      const m = raw.match(re)
      if (m?.[1]) {
        const n = Number(m[1])
        if (Number.isFinite(n) && n >= 0) return Math.trunc(n)
      }
    }
  } catch {
    /* ignore */
  }
  return undefined
}

function deepScanForSkinId(
  participant: object,
  championId: number
): number | undefined {
  if (!Number.isFinite(championId) || championId <= 0) return undefined
  const low = championId * 1000
  const high = (championId + 1) * 1000

  const seen = new WeakSet<object>()

  function walk(node: unknown): number | undefined {
    if (node == null || typeof node !== "object") return undefined
    if (seen.has(node as object)) return undefined
    seen.add(node as object)

    if (Array.isArray(node)) {
      for (const el of node) {
        const r = walk(el)
        if (r != null) return r
      }
      return undefined
    }

    const o = node as Record<string, unknown>
    for (const [k, v] of Object.entries(o)) {
      const kl = k.toLowerCase()

      if (typeof v === "number" && Number.isFinite(v)) {
        const t = Math.trunc(v)
        if (t < 0) continue
        if (kl.includes("skin") && t >= low && t < high) {
          return t
        }
      }
      if (typeof v === "string" && /^\d+$/.test(v.trim())) {
        const t = Number(v.trim())
        if (kl.includes("skin") && t >= low && t < high) {
          return t
        }
      }

      const sub = walk(v)
      if (sub != null) return sub
    }
    return undefined
  }

  return walk(participant)
}

function extractExplicitSkinId(participant: object): number | undefined {
  const o = participant as Record<string, unknown>
  const lowerKeyToValue = new Map<string, unknown>()
  for (const [k, v] of Object.entries(o)) {
    lowerKeyToValue.set(k.toLowerCase(), v)
  }

  const orderedKeys = [
    "championskinid",
    "skinid",
    "skin",
    "playerskinid",
    "championskin",
    "selectedskinid",
  ]

  for (const k of orderedKeys) {
    const v = lowerKeyToValue.get(k)
    const n = coerceSkinId(v)
    if (n != null) return n
  }

  for (const [k, v] of lowerKeyToValue) {
    if (!k.includes("skin")) continue
    if (
      k === "championskinid" ||
      k === "skinid" ||
      k === "skin" ||
      k === "playerskinid" ||
      k === "championskin" ||
      k === "selectedskinid"
    ) {
      continue
    }
    if (k.includes("score") || k.includes("transform")) continue
    const n = coerceSkinId(v)
    if (n != null && n > 0) return n
  }

  return undefined
}

function inferSkinIdFromChampionSkinBand(
  participant: object,
  championId: number
): number | undefined {
  if (!Number.isFinite(championId) || championId <= 0) return undefined

  const o = participant as Record<string, unknown>
  const low = championId * 1000
  const high = (championId + 1) * 1000

  const skipKey = (k: string) => {
    const x = k.toLowerCase()
    return (
      x === "profileicon" ||
      x.includes("icon") ||
      x.includes("damage") ||
      x.includes("heal") ||
      x.includes("gold") ||
      x.includes("time") ||
      x.includes("vision") ||
      x.includes("ping") ||
      x.includes("minion") ||
      x.includes("turret") ||
      x.includes("ward") ||
      x.includes("item") ||
      x.includes("perk") ||
      x.includes("spell") ||
      x.includes("puuid") ||
      x.includes("riotid") ||
      x.includes("summoner") ||
      x.includes("championname") ||
      x.includes("championtransform") ||
      x.includes("augment")
    )
  }

  for (const [k, v] of Object.entries(o)) {
    if (skipKey(k)) continue
    const n = coerceSkinId(v)
    if (n == null) continue
    if (n >= low && n < high) {
      return n
    }
  }

  return undefined
}

function coerceSkinId(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    const t = Math.trunc(value)
    if (t < 0) return undefined
    return t
  }
  if (typeof value === "string") {
    const s = value.trim()
    if (/^\d+$/.test(s)) {
      const n = Number(s)
      if (Number.isFinite(n) && n >= 0) return Math.trunc(n)
    }
  }
  return undefined
}
