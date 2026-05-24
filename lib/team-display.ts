import { TEAMS } from '@/lib/teams';

/** FIFA / custom codes in DB → ISO 3166-1 alpha-2 for flag images (fallback). */
export const TEAM_ISO2: Record<keyof typeof TEAMS, string> = {
  ALG: 'dz',
  ARG: 'ar',
  AUS: 'au',
  AUT: 'at',
  BEL: 'be',
  BIH: 'ba',
  BRA: 'br',
  CAN: 'ca',
  CIV: 'ci',
  COD: 'cd',
  COL: 'co',
  CPV: 'cv',
  CRO: 'hr',
  CUW: 'cw',
  CZE: 'cz',
  ECU: 'ec',
  EGY: 'eg',
  ENG: 'gb-eng',
  ESP: 'es',
  FRA: 'fr',
  GER: 'de',
  GHA: 'gh',
  HAI: 'ht',
  IRN: 'ir',
  IRQ: 'iq',
  JOR: 'jo',
  JPN: 'jp',
  KOR: 'kr',
  KSA: 'sa',
  MAR: 'ma',
  MEX: 'mx',
  NED: 'nl',
  NOR: 'no',
  NZL: 'nz',
  PAN: 'pa',
  PAR: 'py',
  POR: 'pt',
  QAT: 'qa',
  RSA: 'za',
  SCO: 'gb-sct',
  SEN: 'sn',
  SUI: 'ch',
  SWE: 'se',
  TUN: 'tn',
  TUR: 'tr',
  URU: 'uy',
  USA: 'us',
  UZB: 'uz',
};

export function flagImageUrl(teamCode: string, width = 24): string {
  const iso = TEAM_ISO2[teamCode as keyof typeof TEAMS] ?? teamCode.toLowerCase();
  if (width <= 40) {
    return `https://flagcdn.com/24x18/${iso}.png`;
  }
  return `https://flagcdn.com/w${width}/${iso}.png`;
}

export function getTeamDisplay(teamCode: string, flagWidth = 24) {
  const team = TEAMS[teamCode as keyof typeof TEAMS];
  return {
    code: teamCode,
    name: team?.teamName ?? teamCode,
    emoji: team?.flag ?? '',
    flagUrl: flagImageUrl(teamCode, flagWidth),
  };
}
