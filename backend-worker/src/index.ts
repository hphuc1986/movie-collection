import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}));

// 1. GET ALL PRODUCTS: /api/movies (Kept route path consistent for immediate testing)
app.get('/api/movies', async (c) => {
  // FIXED: Pointing directly to the new Products HTTP relation tier
  const targetUrl = `${c.env.SUPABASE_URL}/rest/v1/Products?select=*&order=Id.desc`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'apikey': c.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${c.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Supabase error: ${response.status}`);
    const rawProducts: any = await response.json();

    // FIXED: Maps your expanded production columns safely back into camelCase
    const formattedProducts = rawProducts.map((p: any) => ({
      id: p.Id,
      title: p.Title,
      releaseYear: p.ReleaseYear,
      format: p.Format,
      price: parseFloat(p.Price),
      stockQuantity: p.StockQuantity,
      posterUrl: p.PosterUrl,
      rating: p.Rating,
      description: p.Description,
      createdAt: p.CreatedAt
    }));

    return c.json(formattedProducts);
  } catch (error: any) {
    return c.json({ error: 'Database transaction failure', message: error.message }, 500);
  }
});

// 2. POST NEW PRODUCT TO CATALOG: /api/movies
app.post('/api/movies', async (c) => {
  const targetUrl = `${c.env.SUPABASE_URL}/rest/v1/Products`;

  try {
    const body = await c.req.json();
    const { title, releaseYear, format, price, stockQuantity, posterUrl, rating, description } = body;

    if (!title) return c.json({ error: 'Product title is required.' }, 400);

    const dbPayload = {
      Title: title,
      ReleaseYear: releaseYear || null,
      Format: format || 'Digital',
      Price: price || 14.99,
      StockQuantity: stockQuantity || 100,
      PosterUrl: posterUrl || null,
      Rating: rating || null,
      Description: description || null,
      CreatedAt: new Date().toISOString()
    };

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'apikey': c.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${c.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dbPayload)
    });

    if (!response.ok) throw new Error(`Insert failed: ${response.status}`);
    const [newProduct]: any = await response.json();

    const formattedProduct = {
      id: newProduct.Id,
      title: newProduct.Title,
      price: parseFloat(newProduct.Price),
      stockQuantity: newProduct.StockQuantity
    };

    return c.json(formattedProduct, 201);
  } catch (error: any) {
    return c.json({ error: 'Failed to save product via HTTP.', message: error.message }, 500);
  }
});

export default app;
