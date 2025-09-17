'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Mark document as hydrated so tests can wait on it
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-hydrated', 'true');
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
