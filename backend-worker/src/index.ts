import { Hono } from 'hono';
import { cors } from 'hono/cors';
import postgres from 'postgres';

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}));

// 🧳 GLOBAL STATE HOLDER: Keeps your database client connection alive between invocations
let sqlInstance: any = null;

const getDbClient = (databaseUrl: string) => {
  // FIXED: Only create a new connection pool if one does not already exist!
  if (!sqlInstance) {
    sqlInstance = postgres(databaseUrl, { 
      ssl: 'require',
      max: 1, // Restricts your serverless instance to a single reusable connection slot
      idle_timeout: 20 // Automatically drops idle sockets cleanly
    });
  }
  return sqlInstance;
};

// 2. GET ALL RECORDS ROUTE: /api/movies
app.get('/api/movies', async (c) => {
  const sql = getDbClient(c.env.DATABASE_URL);
  try {
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
  // ❌ REMOVED: await sql.end() 
  // Never close the pool here! Letting it persist lets the next request reuse the connection instantly.
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
