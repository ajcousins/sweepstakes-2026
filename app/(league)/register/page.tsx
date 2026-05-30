import { RegisterForm } from '@/components/RegisterForm';
import { TextLink } from '@/components/ui/TextLink';

export default function RegisterPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Join the league</h1>
      <RegisterForm />
      <p className="mt-6 text-sm text-zinc-600">
        Already joined?{' '}
        <TextLink href="/login">Log in</TextLink>
      </p>
    </main>
  );
}
