export type LeagueInfo = {
  id_league: string;
  welcome_message: string | null;
  goodluck_message: string | null;
  info_message: string | null;
  league_name: string;
  title: string | null;
  password_hash: string;
  is_locked: boolean;
};

export type Player = {
  id_player: string;
  id_league: string;
  player_name: string;
  password_hash: string;
  team_a: string;
  team_b: string;
  normalised_pair: string;
  is_admin: boolean;
  created_at: string;
};

export type GameResult = {
  id_result: string;
  kick_off: string;
  stage: string | null;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  went_to_extra_time: boolean;
  home_penalties_score: number | null;
  away_penalties_score: number | null;
};
