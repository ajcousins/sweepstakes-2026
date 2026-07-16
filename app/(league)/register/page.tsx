import { TextLink } from '@/components/ui/TextLink';
import { isCompetitionFinished } from '@/lib/competition-status';
import { RegisterForm } from '@/components/RegisterForm';

export default async function RegisterPage() {
  const finished = await isCompetitionFinished();

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Join the sweepstakes</h1>
      {finished ? (
        <p className="text-sm text-zinc-600">
          The competition has finished — new players cannot join.{' '}
          <TextLink href="/table">View the leaderboard</TextLink>
        </p>
      ) : (
        <>
          <RegisterForm />
          <p className="mt-6 text-sm text-zinc-600">
            Already joined? <TextLink href="/login">Log in</TextLink>
          </p>
        </>
      )}
    </main>
  );
}
