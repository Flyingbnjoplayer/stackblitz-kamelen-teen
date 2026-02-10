//stackblitz-kamelen-teen/src/components/FarcasterWrapper.tsx
'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const FarcasterToastManager = dynamic(() => import('./FarcasterToastManager'), {
  ssr: false,
  loading: () => null,
});

const FarcasterManifestSigner = dynamic(() => import('./FarcasterManifestSigner'), {
  ssr: false,
  loading: () => null,
});

interface FarcasterWrapperProps {
  children: React.ReactNode;
}

export default function FarcasterWrapper({
  children,
}: FarcasterWrapperProps): React.JSX.Element {
  // ESLint-safe mounted state
  const [isMounted, setIsMounted] = useState(() => false);

  useEffect(() => {
    // schedule setState asynchronously → avoids “set-state-in-effect”
    const id = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  if (!isMounted) {
    // keep original behavior
    return <>{children}</>;
  }

  return (
    <FarcasterToastManager>
      {({ onManifestSuccess, onManifestError }) => (
        <>
          <FarcasterManifestSigner
            onSuccess={onManifestSuccess}
            onError={onManifestError}
          />
          {children}
        </>
      )}
    </FarcasterToastManager>
  );
}