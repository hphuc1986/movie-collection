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

// Append these two new authentication endpoint routes inside backend-worker/src/index.ts

// 1. REGISTER NEW CUSTOMER ACCOUNT ENDPOINT: /api/auth/register
app.post('/api/auth/register', async (c) => {
  const targetUrl = `${c.env.SUPABASE_URL}/auth/v1/signup`;
  try {
    const body = await c.req.json();
    const { email, password, fullName } = body;

    if (!email || !password) return c.json({ error: 'Email and password fields are required.' }, 400);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'apikey': c.env.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        options: {
          data: { full_name: fullName || 'New Customer' } // Caught by our Postgres trigger!
        }
      }),
    });

    const data: any = await response.json();
    if (!response.ok) return c.json({ error: data.msg || 'Registration failed.' }, response.status);

    return c.json({ message: 'User registered successfully! Please check your email for confirmation.', user: data.user }, 201);
  } catch (error: any) {
    return c.json({ error: 'Authentication service failure', message: error.message }, 500);
  }
});

// 2. USER LOGIN / TOKEN EXCHANGE ENDPOINT: /api/auth/login
app.post('/api/auth/login', async (c) => {
  const targetUrl = `${c.env.SUPABASE_URL}/auth/v1/token?grant_type=password`;
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) return c.json({ error: 'Email and password parameters are required.' }, 400);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'apikey': c.env.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data: any = await response.json();
    if (!response.ok) return c.json({ error: data.error_description || 'Invalid login credentials.' }, response.status);

    // Returns your cryptographically signed access_token (JWT) to persist on the app client!
    return c.json({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name
      }
    });
  } catch (error: any) {
    return c.json({ error: 'Login authentication runtime failure', message: error.message }, 500);
  }
});

export default app;
