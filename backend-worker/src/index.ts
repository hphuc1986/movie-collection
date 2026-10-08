import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Global permissive CORS configurations for frontend clients
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}));

// 1. GET ALL RECORDS ROUTE: /api/movies
app.get('/api/movies', async (c) => {
  // Directly targets your Supabase table using clean HTTP queries
  const targetUrl = `${c.env.SUPABASE_URL}/rest/v1/Movie_Collection?select=*&order=Id.desc`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'apikey': c.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${c.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase returned status code: ${response.status}`);
    }

    const rawMovies: any = await response.json();

    // Map your database headers smoothly to the lowercase attributes React expects
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
    return c.json({ error: 'Database HTTP transaction failure', message: error.message }, 500);
  }
});

// 2. POST NEW MOVIE ROUTE: /api/movies
app.post('/api/movies', async (c) => {
  const targetUrl = `${c.env.SUPABASE_URL}/rest/v1/Movie_Collection`;

  try {
    const body = await c.req.json();
    const { title, releaseYear, format, rating } = body;

    if (!title) return c.json({ error: 'Movie title parameter is required.' }, 400);

    // Map the incoming React variables to your capitalized database columns
    const dbPayload = {
      Title: title,
      ReleaseYear: releaseYear || null,
      Format: format || 'Digital',
      Rating: rating || null,
      CreatedAt: new Date().toISOString()
    };

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'apikey': c.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${c.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation' // Instructs Supabase to return the newly created row data
      },
      body: JSON.stringify(dbPayload)
    });

    if (!response.ok) {
      throw new Error(`Supabase insert returned error status: ${response.status}`);
    }

    const [newMovie]: any = await response.json();

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
    return c.json({ error: 'Failed to save movie record entry via HTTP.', message: error.message }, 500);
  }
});

export default app;
