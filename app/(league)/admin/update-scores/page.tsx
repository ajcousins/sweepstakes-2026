import { redirect } from 'next/navigation';
import { AdminUpdateScoresPanel } from '@/components/AdminUpdateScoresPanel';
import { TextLink } from '@/components/ui/TextLink';
import { requireAdmin } from '@/lib/admin';

export default async function AdminUpdateScoresPage() {
  const auth = await requireAdmin();

  if (!auth.ok) {
    if (auth.status === 401) {
      redirect('/login');
    }

    return (
      <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Admin access required</h1>
        <TextLink href="/table" className="mt-6 inline-block">
          Back to leaderboard
        </TextLink>
      </main>
    );
  }

  return <AdminUpdateScoresPanel />;
}
