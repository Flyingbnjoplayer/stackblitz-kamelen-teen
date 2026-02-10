//stackblitz-kamelen-teen/src/app/not-found.tsx
'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1e3a8a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 'bold', margin: '0 0 1rem' }}>
          404
        </h1>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 1rem' }}>
          Page Not Found
        </h2>
        <p style={{ fontSize: '1.125rem', margin: '0 0 2rem', opacity: 0.9 }}>
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            background: 'white',
            color: '#1e3a8a',
            fontWeight: 'bold',
            padding: '0.75rem 2rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontSize: '1.125rem',
          }}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}