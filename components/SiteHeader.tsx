import Link from 'next/link';
import { getLeagueSessionTitle } from '@/lib/league-session-server';

export async function SiteHeader() {
  const { inLeague, title } = await getLeagueSessionTitle();
  const displayTitle = inLeague && title ? title : '';

  return (
    <header>
      <div className="mx-auto max-w-4xl px-4 py-4">
        <Link
          href={inLeague ? '/table' : '/'}
          className="text-lg font-semibold tracking-tight"
        >
          {displayTitle}
        </Link>
      </div>
    </header>
  );
}
