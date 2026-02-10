//stackblitz-kamelen-teen/src/components/FarcasterToastManager.tsx
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { useManifestStatus } from '@/hooks/useManifestStatus';

interface ManifestResult {
  header: string;
  payload: string;
  signature: string;
}

interface FarcasterToastManagerProps {
  children: (handlers: {
    onManifestSuccess: (result: ManifestResult) => void;
    onManifestError: (errorMessage: string, errorType: string) => void;
  }) => React.ReactNode;
}

export default function FarcasterToastManager({
  children,
}: FarcasterToastManagerProps): React.JSX.Element {
  const { isSigned, isLoading, refetch } = useManifestStatus();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // useRef instead of state to avoid “refs accessed during render”
  const copySucceededRef = useRef(false);

  const copyAllAsJSON = useCallback(
    async (result: ManifestResult, showToast = true): Promise<boolean> => {
      try {
        const fieldsOnly = {
          header: result.header,
          payload: result.payload,
          signature: result.signature,
        };
        const textToCopy = JSON.stringify(fieldsOnly, null, 2);
        await navigator.clipboard.writeText(textToCopy);

        if (showToast) {
          toast.success('Account Association JSON copied to clipboard! 📋', {
            duration: 2000,
          });
        }
        return true;
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);

        if (showToast) {
          toast.error('Failed to copy to clipboard', { duration: 2000 });
        }
        return false;
      }
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleManifestSuccess = useCallback(
    (result: ManifestResult) => {
      refetch();

      if (isSigned && !isLoading) {
        console.log('Manifest already signed → no toast');
        return;
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      (async () => {
        const ok = await copyAllAsJSON(result, false);
        copySucceededRef.current = ok; // safe: NOT used in render
      })();

      toast.success('Manifest Signed Successfully! 🎉', {
        description: 'Domain: push-entirely-836.app.ohara.ai',
        duration: 3000,
      });

      timeoutRef.current = setTimeout(() => {
        const successful = copySucceededRef.current; // read here, safe (not render)

        toast.info('Account Association Ready', {
          description: (
            <div className="text-xs space-y-3 text-black">
              <div className="text-center text-gray-600 mb-3">
                {successful
                  ? 'Your account association JSON has been copied automatically.'
                  : 'Failed to copy automatically. Use the button below.'}
              </div>

              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => copyAllAsJSON(result, true)}
                  className="bg-black hover:bg-gray-800 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Copy Again
                </button>

                <button
                  onClick={() => {
                    window.open(
                      'https://ohara.ai/mini-apps/ae1d2f16-cffb-450f-a2fa-1e4a267b3737/build',
                      '_blank',
                    );
                  }}
                  className="bg-black hover:bg-gray-800 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                >
                  Back to Base App
                </button>
              </div>
            </div>
          ),
          duration: 15000,
        });
      }, 1000);
    },
    [copyAllAsJSON, isSigned, isLoading, refetch],
  );

  const handleManifestError = useCallback(
    (errorMessage: string, errorType: string) => {
      if (isSigned && !isLoading) {
        console.log('Manifest already signed → no error toast');
        return;
      }

      toast.error('Manifest Signing Failed', {
        description: `${errorType.toUpperCase()}: ${errorMessage}`,
        duration: 6000,
      });
    },
    [isSigned, isLoading],
  );

  return (
    <>
      <Toaster />
      {children({
        onManifestSuccess: handleManifestSuccess,
        onManifestError: handleManifestError,
      })}
    </>
  );
}

export type { ManifestResult };