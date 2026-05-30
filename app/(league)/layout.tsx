import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { getLeagueSession } from '@/lib/session';

export default async function LeagueLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const idLeague = await getLeagueSession();
  if (!idLeague) {
    redirect('/');
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      {children}
    </div>
  );
}
