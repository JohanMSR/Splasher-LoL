import { getPlatformHost, getRegionalHost } from "./regions"

export class RiotApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
    this.name = "RiotApiError"
  }
}

export class RiotConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "RiotConfigError"
  }
}

export function getRiotApiKey(): string {
  const key = process.env.RIOT_API_KEY?.trim()
  if (!key) {
    throw new RiotConfigError(
      "RIOT_API_KEY is not set. Add it to `.env` or `.env.local` (see `.env.example`)."
    )
  }
  return key
}

async function riotFetchJson<T>(
  host: string,
  path: string,
  apiKey: string
): Promise<T> {
  const url = `https://${host}${path}`
  const res = await fetch(url, {
    headers: { "X-Riot-Token": apiKey },
    next: { revalidate: 60 },
  })
  if (res.status === 404) {
    throw new RiotApiError("Not found", 404)
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new RiotApiError(
      text || `Riot API error (${res.status})`,
      res.status
    )
  }
  return (await res.json()) as T
}

export async function fetchAccountByRiotId(
  platform: string,
  gameName: string,
  tagLine: string,
  apiKey: string
) {
  const host = getRegionalHost(platform)
  const path = `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  return riotFetchJson(host, path, apiKey)
}

export async function fetchSummonerByPuuid(
  platform: string,
  puuid: string,
  apiKey: string
) {
  const host = getPlatformHost(platform)
  const path = `/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`
  return riotFetchJson(host, path, apiKey)
}

export async function fetchLeagueEntries(
  platform: string,
  encryptedSummonerId: string,
  apiKey: string
) {
  const host = getPlatformHost(platform)
  const path = `/lol/league/v4/entries/by-summoner/${encodeURIComponent(encryptedSummonerId)}`
  return riotFetchJson(host, path, apiKey)
}

export async function fetchMatchIds(
  platform: string,
  puuid: string,
  apiKey: string,
  start = 0,
  count = 20
): Promise<string[]> {
  const host = getRegionalHost(platform)
  const path = `/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?start=${start}&count=${count}`
  return riotFetchJson(host, path, apiKey)
}

export async function fetchMatch(
  platform: string,
  matchId: string,
  apiKey: string
) {
  const host = getRegionalHost(platform)
  const path = `/lol/match/v5/matches/${encodeURIComponent(matchId)}`
  return riotFetchJson(host, path, apiKey)
}

export async function fetchChampionMasteries(
  platform: string,
  puuid: string,
  apiKey: string,
  top = 8
) {
  const host = getPlatformHost(platform)
  const path = `/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(puuid)}/top?count=${top}`
  return riotFetchJson(host, path, apiKey)
}
