/** Common LoL queueId labels (subset). */
const QUEUES: Record<number, string> = {
  0: "Custom",
  420: "Ranked Solo/Duo",
  440: "Ranked Flex",
  450: "ARAM",
  400: "Normal Draft",
  430: "Normal Blind",
  830: "Co-op vs AI",
  840: "Co-op vs AI",
  850: "Co-op vs AI",
  900: "URF",
  1020: "One for All",
  1300: "Nexus Blitz",
  1400: "Ultimate Spellbook",
  1700: "Arena",
  1900: "Pick URF",
  2000: "Tutorial 1",
  2010: "Tutorial 2",
  2020: "Tutorial 3",
}

export function queueLabel(queueId: number): string {
  return QUEUES[queueId] ?? `Queue ${queueId}`
}
