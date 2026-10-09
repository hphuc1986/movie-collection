import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Global CORS configurations for modern storefront clients
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}));

// 1. GET ALL PRODUCTS FROM CATALOG: GET /api/movies
app.get('/api/movies', async (c) => {
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

    // Maps all database headers safely back into clean camelCase contracts
    const formattedProducts = rawProducts.map((p: any) => ({
      id: p.Id,
      title: p.Title,
      releaseYear: p.ReleaseYear,
      format: p.Format,
      price: parseFloat(p.Price),
      stockQuantity: p.StockQuantity,
      frontCover: p.FrontCover,
      backCover: p.BackCover,
      rating: p.Rating,
      description: p.Description,
      createdAt: p.CreatedAt,
      catalogNo: p.CatalogNo,
      upc: p.UPC,
      studio: p.Studio,
      region: p.Region,
      runningTime: p.RunningTime,
      discs: p.Discs,
      releaseDate: p.ReleaseDate
    }));

    return c.json(formattedProducts);
  } catch (error: any) {
    return c.json({ error: 'Database transaction failure', message: error.message }, 500);
  }
});

// 2. POST NEW PRODUCT TO CATALOG: POST /api/movies
app.post('/api/movies', async (c) => {
  const targetUrl = `${c.env.SUPABASE_URL}/rest/v1/Products`;

  try {
    const body = await c.req.json();
    const { 
      title, 
      releaseYear, 
      format, 
      price, 
      stockQuantity, 
      frontCover,
      backCover,
      posterUrl,
      rating, 
      description, 
      catalogNo, 
      upc, 
      studio, 
      region, 
      runningTime, 
      discs, 
      releaseDate 
    } = body;

    if (!title) return c.json({ error: 'Product title is required.' }, 400);

    // Maps variables explicitly into your capitalized Supabase Postgres columns
    const dbPayload = {
      Title: title,
      ReleaseYear: releaseYear || null,
      Format: format || 'Digital',
      Price: price || 14.99,
      StockQuantity: stockQuantity || 100,
      FrontCover: frontCover || posterUrl || null,
      BackCover: backCover || null,
      Rating: rating || null,
      Description: description || null,
      CatalogNo: catalogNo || null,
      UPC: upc || null,
      Studio: studio || 'Shout! Factory',
      Region: region || 'Region A',
      RunningTime: runningTime || null,
      Discs: discs || 1,
      ReleaseDate: releaseDate || null,
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

    return c.json(newProduct, 201);
  } catch (error: any) {
    return c.json({ error: 'Failed to save product via HTTP.', message: error.message }, 500);
  }
});

// 3. REGISTER NEW CUSTOMER ACCOUNT ENDPOINT: /api/auth/register
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
          data: { fullName: fullName || 'New Customer' }
        }
      }),
    });

    const data: any = await response.json();
    if (!response.ok) return c.json({ error: data.msg || 'Registration failed.' }, response.status as any);

    return c.json({ message: 'User registered successfully!', user: data.user }, 201);
  } catch (error: any) {
    return c.json({ error: 'Authentication service failure', message: error.message }, 500);
  }
});

// 4. USER LOGIN / TOKEN EXCHANGE ENDPOINT: /api/auth/login
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
    if (!response.ok) return c.json({ error: data.error_description || 'Invalid login credentials.' }, response.status as any);

    return c.json({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.fullName
      }
    });
  } catch (error: any) {
    return c.json({ error: 'Login authentication runtime failure', message: error.message }, 500);
  }
});

// 5. STATELESS GUEST CHECKOUT BYPASSER: POST /api/auth/guest
app.post('/api/auth/guest', async (c) => {
  const targetUrl = `${c.env.SUPABASE_URL}/rest/v1/Users`;
  try {
    const body = await c.req.json();
    const { fullName } = body;

    const generatedGuestUuid = crypto.randomUUID();
    const randomGuestId = Math.floor(Math.random() * 10000);
    const guestEmail = `guest_${randomGuestId}@cinestore.anon`;

    const dbPayload = {
      Id: generatedGuestUuid,
      Email: guestEmail,
      FullName: fullName || 'Guest Customer',
      ShippingAddress: null,
      BillingAddress: null,
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

    if (!response.ok) throw new Error(`Supabase public insert rejected with status: ${response.status}`);
    const [newGuestRow]: any = await response.json();

    return c.json({
      accessToken: "mock-guest-jwt-token-string",
      user: {
        id: newGuestRow.Id,
        email: newGuestRow.Email,
        fullName: newGuestRow.FullName
      }
    }, 201);
  } catch (error: any) {
    return c.json({ error: 'Failed to initialize guest profile row.', message: error.message }, 500);
  }
});

export default app;
