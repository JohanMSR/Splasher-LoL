import "server-only"

import { getDdragonVersion } from "@/lib/ddragon"

import {
  fetchAccountByRiotId,
  fetchChampionMasteries,
  fetchLeagueEntries,
  fetchMatch,
  fetchMatchIds,
  fetchSummonerByPuuid,
  getRiotApiKey,
  RiotApiError,
  RiotConfigError,
} from "./client"
import type {
  ChampionMastery,
  LeagueEntry,
  MatchDto,
  MatchParticipant,
  RiotAccount,
  RiotSummoner,
} from "./types"

export type PlayerProfileResult =
  | {
      ok: true
      platform: string
      account: RiotAccount
      summoner: RiotSummoner
      entries: LeagueEntry[]
      masteries: ChampionMastery[]
      matches: MatchDto[]
      ddragonVersion: string
    }
  | { ok: false; error: string; status?: number }

export async function loadPlayerProfile(
  platform: string,
  gameName: string,
  tagLine: string
): Promise<PlayerProfileResult> {
  let apiKey: string
  try {
    apiKey = getRiotApiKey()
  } catch (e) {
    if (e instanceof RiotConfigError) {
      return { ok: false, error: e.message }
    }
    throw e
  }

  try {
    const account = (await fetchAccountByRiotId(
      platform,
      gameName,
      tagLine,
      apiKey
    )) as RiotAccount

    const summoner = (await fetchSummonerByPuuid(
      platform,
      account.puuid,
      apiKey
    )) as RiotSummoner

    const [entries, matchIds, masteries, ddragonVersion] = await Promise.all([
      fetchLeagueEntries(platform, summoner.id, apiKey).catch(() => []),
      fetchMatchIds(platform, account.puuid, apiKey, 0, 20).catch(() => []),
      fetchChampionMasteries(platform, account.puuid, apiKey, 8).catch(
        () => []
      ),
      getDdragonVersion(),
    ])

    const matches: MatchDto[] = []
    for (const id of matchIds.slice(0, 15)) {
      try {
        const m = (await fetchMatch(platform, id, apiKey)) as MatchDto
        matches.push(m)
      } catch {
        /* skip single match failure */
      }
    }

    return {
      ok: true,
      platform,
      account,
      summoner,
      entries: entries as LeagueEntry[],
      masteries: masteries as ChampionMastery[],
      matches,
      ddragonVersion,
    }
  } catch (e) {
    if (e instanceof RiotApiError) {
      if (e.status === 404) {
        return {
          ok: false,
          error: "Summoner not found for this region. Check Riot ID and platform.",
          status: 404,
        }
      }
      if (e.status === 403) {
        return {
          ok: false,
          error: "Riot API rejected the request (403). Verify your API key and app limits.",
          status: 403,
        }
      }
      return { ok: false, error: e.message, status: e.status }
    }
    if (e instanceof Error) {
      return { ok: false, error: e.message }
    }
    return { ok: false, error: "Unknown error" }
  }
}

export type MatchViewResult =
  | {
      ok: true
      platform: string
      account: RiotAccount
      match: MatchDto
      participant: MatchParticipant
      ddragonVersion: string
    }
  | { ok: false; error: string; status?: number }

export async function loadMatchView(
  platform: string,
  gameName: string,
  tagLine: string,
  matchId: string
): Promise<MatchViewResult> {
  let apiKey: string
  try {
    apiKey = getRiotApiKey()
  } catch (e) {
    if (e instanceof RiotConfigError) {
      return { ok: false, error: e.message }
    }
    throw e
  }

  try {
    const account = (await fetchAccountByRiotId(
      platform,
      gameName,
      tagLine,
      apiKey
    )) as RiotAccount

    const match = (await fetchMatch(platform, matchId, apiKey)) as MatchDto
    const participant = match.info.participants.find(
      (x) => x.puuid === account.puuid
    )
    if (!participant) {
      return {
        ok: false,
        error: "This Riot account is not a participant in this match.",
      }
    }

    const ddragonVersion = await getDdragonVersion()

    return {
      ok: true,
      platform,
      account,
      match,
      participant,
      ddragonVersion,
    }
  } catch (e) {
    if (e instanceof RiotApiError) {
      if (e.status === 404) {
        return {
          ok: false,
          error: "Match or summoner not found.",
          status: 404,
        }
      }
      if (e.status === 403) {
        return {
          ok: false,
          error:
            "Riot API rejected the request (403). Verify your API key and app limits.",
          status: 403,
        }
      }
      return { ok: false, error: e.message, status: e.status }
    }
    if (e instanceof Error) {
      return { ok: false, error: e.message }
    }
    return { ok: false, error: "Unknown error" }
  }
}
