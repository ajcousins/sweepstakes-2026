const LEAGUE_KEY = 'sweepstakes_id_league';
const LEAGUE_TITLE_KEY = 'sweepstakes_league_title';
const PLAYER_KEY = 'sweepstakes_id_player';

export function getStoredLeagueId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LEAGUE_KEY);
}

export function setStoredLeagueId(id: string) {
  localStorage.setItem(LEAGUE_KEY, id);
}

export function getStoredLeagueTitle(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LEAGUE_TITLE_KEY);
}

export function setStoredLeagueTitle(title: string) {
  localStorage.setItem(LEAGUE_TITLE_KEY, title);
}

export function getStoredPlayerId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PLAYER_KEY);
}

export function setStoredPlayerId(id: string) {
  localStorage.setItem(PLAYER_KEY, id);
}

export function clearStoredPlayerId() {
  localStorage.removeItem(PLAYER_KEY);
}

export function clearStoredLeague() {
  localStorage.removeItem(LEAGUE_KEY);
  localStorage.removeItem(LEAGUE_TITLE_KEY);
  clearStoredPlayerId();
}
