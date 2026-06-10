'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);

    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button type="button" disabled={loading} onClick={onLogout}>
      {loading ? 'Logging out…' : 'Logout'}
    </Button>
  );
}
