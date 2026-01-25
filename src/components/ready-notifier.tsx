'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export function ReadyNotifier(): null {
  const [isReady, setIsReady] = useState(false);

  // 1. Stuur OHARA_MINIAPP_READY bericht naar parent
  useEffect(() => {
    window.parent.postMessage(
      {
        type: 'OHARA_MINIAPP_READY',
        timestamp: Date.now(),
        version: '1.0',
      },
      '*'
    );
  }, []);

  // 2. Meld Farcaster SDK ready
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
