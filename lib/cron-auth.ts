import { timingSafeEqual } from 'node:crypto';

function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function verifyCronRequest(request: Request): { ok: true } | { ok: false } {
  const secret = process.env.CRON_SECRET;
  if (!secret) return { ok: false };

  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return { ok: false };

  const token = auth.slice('Bearer '.length);
  if (!secureCompare(token, secret)) return { ok: false };

  return { ok: true };
}
