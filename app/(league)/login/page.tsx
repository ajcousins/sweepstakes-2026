import { LoginForm } from '@/components/LoginForm';
import { TextLink } from '@/components/ui/TextLink';
import { isCompetitionFinished } from '@/lib/competition-status';

export default async function LoginPage() {
  const finished = await isCompetitionFinished();

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Player log in</h1>
      <LoginForm />
      {!finished && (
        <p className="mt-6 text-sm text-zinc-600">
          Haven&apos;t joined yet?{' '}
          <TextLink href="/register">Join the sweepstakes!</TextLink>
        </p>
      )}
    </main>
  );
}
