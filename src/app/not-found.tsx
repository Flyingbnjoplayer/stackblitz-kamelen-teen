export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1e3a8a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '6rem',
          fontWeight: 'bold',
          margin: '0 0 1rem 0'
        }}>404</h1>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          margin: '0 0 1rem 0'
        }}>Page Not Found</h2>
        <p style={{
          fontSize: '1.125rem',
          margin: '0 0 2rem 0',
          opacity: 0.9
        }}>
          The page you're looking for doesn't exist.
        </p>
        <a href="/" style={{
          display: 'inline-block',
          background: 'white',
          color: '#1e3a8a',
          fontWeight: 'bold',
          padding: '0.75rem 2rem',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          fontSize: '1.125rem'
        }}>
          Return Home
        </a>
      </div>
    </div>
  )
}
