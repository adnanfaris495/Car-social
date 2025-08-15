"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body style={{ padding: 32, background: '#1a1a1a', color: 'white', fontFamily: 'sans-serif' }}>
        <h2>Something went wrong!</h2>
        <pre style={{ background: '#222', color: '#f55', padding: 16, borderRadius: 8, margin: '16px 0' }}>{error.message}</pre>
        <button onClick={() => reset()} style={{ padding: '8px 16px', borderRadius: 4, background: '#444', color: 'white', border: 'none', cursor: 'pointer' }}>
          Try again
        </button>
      </body>
    </html>
  );
} 