export type BbcRunningScores = {
  halftime?: string;
  fulltime?: string;
  extratime?: string;
  penaltyShootout?: string;
};

export type BbcTeam = {
  fullName: string;
  shortName?: string;
  score?: string;
  runningScores?: BbcRunningScores;
};

export type BbcEvent = {
  home: BbcTeam;
  away: BbcTeam;
  startDateTime: string;
  status: string;
  periodLabel?: { value?: string; accessible?: string };
  stage?: { name?: string };
  round?: { name?: string | null };
};

export type BbcSecondaryGroup = {
  displayLabel?: string | null;
  events?: BbcEvent[];
};

export type BbcEventGroup = {
  displayLabel: string;
  secondaryGroups?: BbcSecondaryGroup[];
};

export type BbcFixturesResponse = {
  eventGroups: BbcEventGroup[];
};
