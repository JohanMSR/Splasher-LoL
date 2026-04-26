/** LoL platform host subdomain (e.g. na1.api.riotgames.com) */
export const LOL_PLATFORMS = [
  { id: "na1", label: "North America" },
  { id: "euw1", label: "Europe West" },
  { id: "eun1", label: "Europe Nordic & East" },
  { id: "kr", label: "Korea" },
  { id: "br1", label: "Brazil" },
  { id: "jp1", label: "Japan" },
  { id: "la1", label: "Latin America North" },
  { id: "la2", label: "Latin America South" },
  { id: "oc1", label: "Oceania" },
  { id: "tr1", label: "Türkiye" },
  { id: "ru", label: "Russia" },
  { id: "ph2", label: "Philippines" },
  { id: "sg2", label: "Singapore" },
  { id: "th2", label: "Thailand" },
  { id: "tw2", label: "Taiwan" },
  { id: "vn2", label: "Vietnam" },
] as const

export type LolPlatformId = (typeof LOL_PLATFORMS)[number]["id"]

const PLATFORM_TO_REGIONAL: Record<string, "americas" | "europe" | "asia" | "sea"> =
  {
    br1: "americas",
    la1: "americas",
    la2: "americas",
    na1: "americas",
    oc1: "americas",
    eun1: "europe",
    euw1: "europe",
    tr1: "europe",
    ru: "europe",
    jp1: "asia",
    kr: "asia",
    ph2: "sea",
    sg2: "sea",
    th2: "sea",
    tw2: "sea",
    vn2: "sea",
  }

export function getRegionalHost(platform: string): string {
  const region = PLATFORM_TO_REGIONAL[platform.toLowerCase()]
  if (!region) {
    throw new Error(`Unknown platform: ${platform}`)
  }
  return `${region}.api.riotgames.com`
}

export function getPlatformHost(platform: string): string {
  return `${platform.toLowerCase()}.api.riotgames.com`
}

export function isValidPlatform(platform: string): platform is LolPlatformId {
  return LOL_PLATFORMS.some((p) => p.id === platform.toLowerCase())
}
