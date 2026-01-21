'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export function ReadyNotifier(): null {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const notifyReady = async (): Promise<void> => {
      try {
        if (!isReady) {
          await sdk.actions.ready();
          setIsReady(true);
          console.log('[ReadyNotifier] Farcaster SDK ready');
        }
      } catch (error: unknown) {
        console.error('[ReadyNotifier] Error calling sdk.actions.ready():', error);
      }
    };

    notifyReady();
  }, [isReady]);

  return null;
}
