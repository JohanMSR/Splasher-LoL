export type RiotAccount = {
  puuid: string
  gameName: string
  tagLine: string
}

export type RiotSummoner = {
  id: string
  accountId: string
  puuid: string
  name: string
  profileIconId: number
  revisionDate: number
  summonerLevel: number
}

export type LeagueEntry = {
  leagueId: string
  queueType: string
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
  veteran: boolean
  inactive: boolean
  freshBlood: boolean
  hotStreak: boolean
}

export type PerkSelection = {
  perk: number
  var1: number
  var2: number
  var3: number
}

export type PerkStyle = {
  description: "primaryStyle" | "subStyle" | string
  selections: PerkSelection[]
  style: number
}

export type ParticipantPerks = {
  statPerks: {
    defense: number
    flex: number
    offense: number
  }
  styles: PerkStyle[]
}

export type MatchParticipant = {
  puuid: string
  teamId: number
  championId: number
  championName: string
  /** Present on newer Match v5 payloads; maps to Data Dragon skin `id`. */
  championSkinId?: number
  kills: number
  deaths: number
  assists: number
  win: boolean
  totalMinionsKilled: number
  neutralMinionsKilled: number
  summoner1Id: number
  summoner2Id: number
  perks: ParticipantPerks
  item0: number
  item1: number
  item2: number
  item3: number
  item4: number
  item5: number
  item6: number
  lane: string
  role: string
  individualPosition: string
  teamPosition: string
  gameEndedInEarlySurrender: boolean
  timePlayed: number
  totalDamageDealtToChampions: number
  visionScore: number
  goldEarned: number
}

export type MatchInfo = {
  gameDuration: number
  gameEndTimestamp: number
  gameStartTimestamp: number
  gameMode: string
  gameType: string
  queueId: number
  mapId: number
  /** League client patch string; use for Data Dragon when resolving skins. */
  gameVersion?: string
}

export type MatchDto = {
  metadata: { matchId: string; participants: string[] }
  info: MatchInfo & {
    participants: MatchParticipant[]
    teams: { teamId: number; win: boolean }[]
  }
}

export type ChampionMastery = {
  championId: number
  championLevel: number
  championPoints: number
  lastPlayTime: number
}
