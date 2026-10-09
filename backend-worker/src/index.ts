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

// UPDATE THIS ENDPOINT INSIDE backend-worker/src/index.ts

// 1. REGISTER NEW CUSTOMER ACCOUNT ENDPOINT: /api/auth/register
app.post('/api/auth/register', async (c) => {
  const targetUrl = `${c.env.SUPABASE_URL}/auth/v1/signup`;
  try {
    const body = await c.req.json();
    const { email, password, fullName } = body; // Destructures the variable from React

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
          data: { full_name: fullName || 'Anonymous Buyer' } // FIXED: Enforces lowercase full_name to match your Postgres trigger!
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
    
    // FIXED: Typecasted response.status as a explicit status literal number code definition
    if (!response.ok) {
      return c.json({ error: data.error_description || 'Invalid login credentials.' }, response.status as any);
    }

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

// Append this explicit update route inside backend-worker/src/index.ts

// 3. UPDATE USER PROFILE (SHIPPING/BILLING DETAILS): PUT /api/user/profile
app.put('/api/user/profile', async (c) => {
  const targetUrl = `${c.env.SUPABASE_URL}/rest/v1/Users`;
  try {
    const authHeader = c.req.header('Authorization');
    const body = await c.req.json();
    const { userId, shippingAddress, billingAddress, fullName } = body;

    if (!userId) return c.json({ error: 'User unique ID parameter is required.' }, 400);
    if (!authHeader) return c.json({ error: 'Missing active user access token validation.' }, 401);

    // Explicitly target your public "Users" table via Supabase HTTP PostgREST API
    const response = await fetch(`${targetUrl}?Id=eq.${userId}`, {
      method: 'PATCH', // PATCH performs a targeted column edit
      headers: {
        'apikey': c.env.SUPABASE_ANON_KEY,
        'Authorization': authHeader, // Assures the request is authenticated
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ShippingAddress: shippingAddress,
        BillingAddress: billingAddress,
        FullName: fullName
      })
    });

    if (!response.ok) throw new Error(`Supabase profile patch failed with status: ${response.status}`);
    const data: any = await response.json();

    return c.json({ message: 'User profile address configurations updated successfully!', profile: data[0] });
  } catch (error: any) {
    return c.json({ error: 'Profile patch processing failure', message: error.message }, 500);
  }
});

// REPLACE THIS ENDPOINT INSIDE backend-worker/src/index.ts

// 3. STATELESS GUEST CHECKOUT BYPASSER: POST /api/auth/guest
app.post('/api/auth/guest', async (c) => {
  const targetUrl = `${c.env.SUPABASE_URL}/rest/v1/Users`;
  try {
    const body = await c.req.json();
    const { fullName } = body;

    // 1. Generate a valid runtime v4 UUID for the Guest's primary ID key
    const generatedGuestUuid = crypto.randomUUID();
    const randomGuestId = Math.floor(Math.random() * 10000);
    const guestEmail = `guest_${randomGuestId}@cinestore.anon`;

    // 2. Directly write the guest row payload into your public "Users" table via HTTP
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

    if (!response.ok) {
      throw new Error(`Supabase public insert rejected with status: ${response.status}`);
    }

    const [newGuestRow]: any = await response.json();

    // 3. Return a session object to React that mirrors a regular login contract!
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
