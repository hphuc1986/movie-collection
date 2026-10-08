import { useEffect, useState } from 'react';
import { getMovies, type Movie } from './services/api';

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const data = await getMovies();
        setMovies(data);
      } catch (err: any) {
        console.error(err);
        setError('Could not connect to the .NET Backend API. Make sure it is running on port 7091!');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, []);

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#121212', color: '#fff', minHeight: '100vh', padding: '2rem' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ color: '#E50914', margin: 0 }}>🎬 My Movie Collection Hub</h1>
        <p style={{ color: '#aaa', margin: '0.5rem 0 0' }}>Connected end-to-end: React ➡️ .NET Web API ➡️ Supabase Postgres</p>
      </header>

      {loading && <p style={{ color: '#007ACC' }}>🔄 Loading your movie vault data records...</p>}
      {error && <div style={{ backgroundColor: '#3a0d11', border: '1px solid #e50914', padding: '1rem', borderRadius: '4px', color: '#ffb3b3' }}>⚠️ {error}</div>}

      {!loading && !error && (
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Total Movies cataloged: {movies.length}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {movies.map((movie) => (
              <div key={movie.id} style={{ backgroundColor: '#1e1e1e', borderRadius: '8px', padding: '1.5rem', border: '1px solid #2d2d2d', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{movie.title}</h3>
                <p style={{ margin: '0 0 0.25rem 0', color: '#aaa', fontSize: '0.9rem' }}>📅 Release Year: {movie.releaseYear || 'N/A'}</p>
                <p style={{ margin: '0 0 0.5rem 0', color: '#aaa', fontSize: '0.9rem' }}>💿 Format: <span style={{ color: '#00bc8c', fontWeight: 'bold' }}>{movie.format || 'Digital'}</span></p>
                <div style={{ color: '#ffc107', fontSize: '1.1rem' }}>
                  {'★'.repeat(movie.rating || 0)}{'☆'.repeat(5 - (movie.rating || 0))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
