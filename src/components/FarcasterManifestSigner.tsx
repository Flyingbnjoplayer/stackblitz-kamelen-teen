//stackblitz-kamelen-teen/src/components/FarcasterManifestSigner.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useIsManifestSigned } from '@/hooks/useManifestStatus';

interface ManifestResult {
  header: string;
  payload: string;
  signature: string;
}

interface FarcasterAutoManifestSignerProps {
  domain?: string;
  onSuccess?: (result: ManifestResult) => void;
  onError?: (error: string, errorType: string) => void;
}

export default function FarcasterManifestSigner({
  domain = 'push-entirely-836.app.ohara.ai',
  onSuccess,
  onError,
}: FarcasterAutoManifestSignerProps): React.JSX.Element | null {
  const [isMiniApp, setIsMiniApp] = useState<boolean>(false);
  const [isCheckingEnvironment, setIsCheckingEnvironment] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [manifestResult, setManifestResult] = useState<ManifestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  // Check if manifest is already signed
  const { isSigned: isAlreadySigned, isLoading: isCheckingSignedStatus } = useIsManifestSigned();

  /**
   * Stable signer callback (so we can put it in effect deps)
   */
  const signManifest = useCallback(async (): Promise<void> => {
    setError(null);
    setErrorType(null);
    setManifestResult(null);

    try {
      setIsProcessing(true);
      const result = await sdk.experimental.signManifest({ domain });
      setManifestResult(result);
      onSuccess?.(result);
    } catch (e: unknown) {
      let errorMessage = '';
      let errorCategory = 'unknown';

      if (e && typeof e === 'object') {
        const sdkErrors = (sdk as any)?.errors ?? {};
        const RejectedByUser = sdkErrors?.RejectedByUser;
        const InvalidDomain = sdkErrors?.InvalidDomain;
        const GenericError = sdkErrors?.GenericError;

        const errObj = e as any;
        const errorCode = errObj?.code ?? errObj?.errCode ?? null;
        const messageFromError = errObj?.message ?? 'Unknown error occurred';

        if (RejectedByUser && e instanceof RejectedByUser) {
          errorCategory = 'user_rejected';
          errorMessage = 'User declined to sign the manifest';
        } else if (InvalidDomain && e instanceof InvalidDomain) {
          errorCategory = 'invalid_domain';
          errorMessage = 'Invalid domain format';
        } else if (GenericError && e instanceof GenericError) {
          errorCategory = 'generic_error';
          errorMessage = 'Signing failed: ' + messageFromError;
        } else if (errorCode === 'USER_REJECTED') {
          errorCategory = 'user_rejected';
          errorMessage = 'User declined to sign the manifest';
        } else if (errorCode === 'INVALID_DOMAIN') {
          errorCategory = 'invalid_domain';
          errorMessage = 'Invalid domain format';
        } else if (errorCode === 'GENERIC_ERROR' || errorCode === 'SIGNING_FAILED') {
          errorCategory = 'generic_error';
          errorMessage = 'Signing failed: ' + messageFromError;
        } else {
          const msg = String(messageFromError).toLowerCase();
          if (msg.includes('rejected') || msg.includes('declined')) {
            errorCategory = 'user_rejected';
            errorMessage = 'User declined to sign the manifest';
          } else if (msg.includes('invalid domain') || msg.includes('malformed')) {
            errorCategory = 'invalid_domain';
            errorMessage = 'Invalid domain format';
          } else if (msg.includes('signing failed') || msg.includes('host restriction')) {
            errorCategory = 'generic_error';
            errorMessage = 'Signing failed: ' + (errObj?.message ?? 'Generic signing failure');
          } else {
            errorCategory = 'unknown';
            errorMessage = 'Manifest signing failed: ' + (errObj?.message ?? 'Unknown error occurred');
          }
        }
      } else if (e instanceof Error) {
        const msg = e.message.toLowerCase();
        if (msg.includes('rejected') || msg.includes('declined')) {
          errorCategory = 'user_rejected';
          errorMessage = 'User declined to sign the manifest';
        } else if (msg.includes('invalid domain') || msg.includes('malformed')) {
          errorCategory = 'invalid_domain';
          errorMessage = 'Invalid domain format';
        } else if (msg.includes('signing failed') || msg.includes('host restriction')) {
          errorCategory = 'generic_error';
          errorMessage = 'Signing failed: ' + e.message;
        } else {
          errorCategory = 'unknown';
          errorMessage = 'Manifest signing failed: ' + e.message;
        }
      } else {
        errorCategory = 'unknown';
        errorMessage = 'An unexpected error occurred during manifest signing';
      }

      setErrorType(errorCategory);
      setError(errorMessage);
      onError?.(errorMessage, errorCategory);
    } finally {
      setIsProcessing(false);
    }
  }, [domain, onSuccess, onError]);

  /**
   * Effect: check mini-app context & signed status, then sign if needed.
   * Includes `signManifest` in deps to satisfy exhaustive-deps.
   */
  useEffect(() => {
    let cancelled = false;

    const checkAndSignManifest = async (): Promise<void> => {
      try {
        if (isCheckingSignedStatus) return;

        // small delay to allow environment init
        await new Promise((resolve) => setTimeout(resolve, 200));

        const inMiniApp = await sdk.isInMiniApp();
        if (cancelled) return;

        setIsMiniApp(inMiniApp);

        if (inMiniApp && !isAlreadySigned) {
          await signManifest();
        } else if (isAlreadySigned) {
          // already signed; no-op
          // console.log('Manifest already signed, skipping');
        }
      } catch (e) {
        console.error('Error checking Mini App context:', e);
        if (!cancelled) setIsMiniApp(false);
      } finally {
        if (!cancelled) setIsCheckingEnvironment(false);
      }
    };

    checkAndSignManifest();
    return () => {
      cancelled = true;
    };
  }, [isAlreadySigned, isCheckingSignedStatus, signManifest]);

  // No UI: this component auto-signs, then reports via callbacks/toasts
  return null;
}

export type { ManifestResult };
``