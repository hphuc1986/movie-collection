import { Hono } from 'hono';
import { cors } from 'hono/cors';
import postgres from 'postgres';

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Global permissive CORS mapping rules for modern single page applications
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}));

// 🧳 GLOBAL STATE HOLDER: Keeps your database client connection alive between invocations
let cachedSqlInstance: any = null;

const getDbClient = (databaseUrl: string) => {
  // FIXED: Only initialize a single connection pool instance if it doesn't exist yet!
  if (!cachedSqlInstance) {
    cachedSqlInstance = postgres(databaseUrl, { 
      ssl: 'require',
      max: 1,           // Restricts your worker to a single reusable connection socket
      idle_timeout: 20, // Automatically purges old idle sockets cleanly
      connect_timeout: 10
    });
  }
  return cachedSqlInstance;
};

// 2. GET ALL RECORDS ROUTE: /api/movies
app.get('/api/movies', async (c) => {
  const sql = getDbClient(c.env.DATABASE_URL);
  try {
    // Queries your Supabase table data cleanly
    const rawMovies = await sql`SELECT * FROM "Movie_Collection" ORDER BY "Id" DESC`;
    
    const formattedMovies = rawMovies.map((m: any) => ({
      id: m.Id,
      title: m.Title,
      releaseYear: m.ReleaseYear,
      format: m.Format,
      rating: m.Rating,
      createdAt: m.CreatedAt
    }));

    return c.json(formattedMovies);
  } catch (error: any) {
    return c.json({ error: 'Database execution failure', message: error.message }, 500);
  }
  // ❌ CRITICAL: Never call sql.end() inside endpoints here anymore.
  // Keeping the pool open allows subsequent user requests to reuse it instantly.
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
  }
});

export default app;
