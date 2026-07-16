import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const LEAGUE_COOKIE = 'sweepstakes_league';
const PLAYER_COOKIE = 'sweepstakes_player';

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

export async function setLeagueSession(idLeague: string) {
  const token = await new SignJWT({ id_league: idLeague })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('90d')
    .sign(secretKey());

  const jar = await cookies();
  jar.set(LEAGUE_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function getLeagueSession(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(LEAGUE_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return typeof payload.id_league === 'string' ? payload.id_league : null;
  } catch {
    return null;
  }
}

export async function setPlayerSession(idPlayer: string, idLeague: string) {
  const token = await new SignJWT({ id_player: idPlayer, id_league: idLeague })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('90d')
    .sign(secretKey());

  const jar = await cookies();
  jar.set(PLAYER_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function getPlayerSession(): Promise<{
  id_player: string;
  id_league: string;
} | null> {
  const jar = await cookies();
  const token = jar.get(PLAYER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.id_player === 'string' &&
      typeof payload.id_league === 'string'
    ) {
      return { id_player: payload.id_player, id_league: payload.id_league };
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearPlayerSession() {
  const jar = await cookies();
  jar.delete(PLAYER_COOKIE);
}

export async function clearLeagueSession() {
  const jar = await cookies();
  jar.delete(LEAGUE_COOKIE);
}

export async function clearAllSessions() {
  await clearPlayerSession();
  await clearLeagueSession();
}
