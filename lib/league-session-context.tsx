'use client';

import { createContext, useContext } from 'react';

const LeagueSessionContext = createContext<string | null>(null);

export function LeagueSessionProvider({
  leagueTitle,
  children,
}: {
  leagueTitle: string | null;
  children: React.ReactNode;
}) {
  return (
    <LeagueSessionContext.Provider value={leagueTitle}>
      {children}
    </LeagueSessionContext.Provider>
  );
}

export function useLeagueTitle(): string | null {
  return useContext(LeagueSessionContext);
}
