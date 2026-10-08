import { Hono } from 'hono';
import { cors } from 'hono/cors';
import postgres from 'postgres';

// Define the runtime environment schema parameters for your environment configurations
type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// 1. Enable Global CORS Middleware so your React Cloudflare Page can read this worker data
// EXACT FIX: Configure global permissive cors headers for Hono framework runtimes
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}));

// Helper utility to provision an isolated Postgres transaction client stream instance per invocation request
const getDbClient = (databaseUrl: string) => {
  return postgres(databaseUrl, { ssl: 'require' });
};

// 2. GET ALL RECORDS ROUTE: /api/movies
app.get('/api/movies', async (c) => {
  const sql = getDbClient(c.env.DATABASE_URL);
  try {
    // Queries your explicit Supabase table name we mapped out earlier!
    const movies = await sql`SELECT * FROM "Movie_Collection" ORDER BY "Id" DESC`;

// EXACT FIX: Map capitalized Supabase columns directly to the camelCase variables React expects!
    const formattedMovies = rawMovies.map(m => ({
      id: m.Id,
      title: m.Title,
      releaseYear: m.ReleaseYear,
      format: m.Format,
      rating: m.Rating,
      createdAt: m.CreatedAt
    }));

    return c.json(movies);
  } catch (error: any) {
    return c.json({ error: 'Database execution failure', message: error.message }, 500);
  } finally {
    await sql.end(); // Safely close and tear down database socket streams immediately upon finish
  }
});

// 3. POST NEW MOVIE ROUTE: /api/movies
app.post('/api/movies', async (c) => {
  const sql = getDbClient(c.env.DATABASE_URL);
  try {
    const body = await c.req.json();
    const { title, releaseYear, format, rating } = body;

    if (!title) return c.json({ error: 'Movie title parameter is required.' }, 400);

    const [newMovie] = await sql`
      INSERT INTO "Movie_Collection" ("Title", "ReleaseYear", "Format", "Rating", "CreatedAt")
      VALUES (${title}, ${releaseYear || null}, ${format || 'Digital'}, ${rating || null}, ${new Date().toISOString()})
      RETURNING *
    `;

    // Map the returned row to lowercase for React
    const formattedMovie = {
      id: newMovie.Id,
      title: newMovie.Title,
      releaseYear: newMovie.ReleaseYear,
      format: newMovie.Format,
      rating: newMovie.Rating,
      createdAt: newMovie.CreatedAt
    };

    return c.json(formattedMovie, 201);
  } catch (error: any) {
    return c.json({ error: 'Failed to catalog record entry.', message: error.message }, 500);
  } finally {
    await sql.end();
  }
});

export default app;
