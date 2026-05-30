export const MATCH_STAGES = [
  'Group A',
  'Group B',
  'Group C',
  'Group D',
  'Group E',
  'Group F',
  'Group G',
  'Group H',
  'Group I',
  'Group J',
  'Group K',
  'Group L',
  'Round of 32',
  'Round of 16',
  'Quarter Final',
  'Semi Final',
  'Bronze Final',
  'Final',
] as const;

export type MatchStage = (typeof MATCH_STAGES)[number];
