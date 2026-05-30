import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TeamFlag } from '@/components/TeamFlag';
import { getPlayerProfile } from '@/lib/player-session-server';
import { getLeagueSession } from '@/lib/session';

export default async function RegisterSuccessPage() {
  const idLeague = await getLeagueSession();
  if (!idLeague) {
    redirect('/');
  }

  const profile = await getPlayerProfile(idLeague);
  if (!profile) {
    redirect('/register');
  }

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 text-center">
      <h1 className="mb-2 text-2xl font-bold">You&apos;re in!</h1>
      <p className="mb-8 text-zinc-600">Your World Cup teams:</p>
      <div className="mb-8 flex flex-col items-center gap-6 px-8 py-12">
        <div className="flex items-end justify-center gap-8 sm:gap-12">
          <TeamFlag
            teamCode={profile.team_a}
            size="xl"
            showName
            nameClassName="max-w-[8rem] text-center text-base font-semibold leading-snug sm:text-lg"
          />
          <TeamFlag
            teamCode={profile.team_b}
            size="xl"
            showName
            nameClassName="max-w-[8rem] text-center text-base font-semibold leading-snug sm:text-lg"
          />
        </div>
      </div>
      {profile.goodluck_message && (
        <p className="mb-8 text-lg">{profile.goodluck_message}</p>
      )}
      <Button href="/table" className="px-6">
        View leaderboard
      </Button>
    </main>
  );
}
