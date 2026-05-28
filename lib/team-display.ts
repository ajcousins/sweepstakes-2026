import { TEAMS } from '@/lib/teams';

export function flagImageUrl(teamCode: string): string {
  const code = teamCode.trim().toUpperCase();
  return `https://api.fifa.com/api/v3/picture/flags-sq-4/${code}`;
}

export function getTeamDisplay(teamCode: string) {
  const team = TEAMS[teamCode as keyof typeof TEAMS];
  return {
    code: teamCode,
    name: team?.teamName ?? teamCode,
    flagUrl: flagImageUrl(teamCode),
  };
}
