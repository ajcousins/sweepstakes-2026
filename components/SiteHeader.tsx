import Image from 'next/image';
import Link from 'next/link';
import ballLogo from '@/app/ball.png';
import { getLeagueSessionTitle } from '@/lib/league-session-server';

export async function SiteHeader() {
  const { inLeague, title } = await getLeagueSessionTitle();
  const displayTitle = inLeague && title ? title : '';

  return (
    <header>
      <div className="mx-auto max-w-4xl px-4 py-4">
        <Link
          href={inLeague ? '/table' : '/'}
          className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight"
        >
          <Image
            src={ballLogo}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 object-contain"
            priority
          />
          {displayTitle}
        </Link>
      </div>
    </header>
  );
}
