import { redirect } from 'next/navigation';
import { LeagueGateForm } from '@/components/LeagueGateForm';
import { getLeagueSession } from '@/lib/session';

export default async function HomePage() {
  const idLeague = await getLeagueSession();
  if (idLeague) {
    redirect('/table');
  }

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-primary-subtle to-white">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">World Cup Sweepstakes</h1>
        <p className="mb-8 text-zinc-600">
          Enter your league name and password to view the table and register as a player.
        </p>
        <LeagueGateForm />
      </main>
    </div>
  );
}
