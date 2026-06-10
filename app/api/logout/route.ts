import { jsonError, jsonOk } from '@/lib/api';
import { clearAllSessions } from '@/lib/session';

export async function POST() {
  try {
    await clearAllSessions();
    return jsonOk({ ok: true });
  } catch (e) {
    console.error(e);
    return jsonError('Logout failed', 500);
  }
}
