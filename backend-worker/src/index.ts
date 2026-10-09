import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
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
      frontCover: p.FrontCover ?? p.frontcover ?? p.front_cover ?? null,
      backCover: p.BackCover ?? p.backcover ?? p.back_cover ?? null,
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
  try {
    const body = await c.req.json();
    const { fullName } = body;

    const guestId = crypto.randomUUID();
    const guestName = typeof fullName === 'string' && fullName.trim()
      ? fullName.trim()
      : 'Guest Customer';

    return c.json({
      accessToken: `guest-${guestId}`,
      user: {
        id: guestId,
        email: `guest-${guestId}@cinestore.invalid`,
        fullName: guestName
      }
    }, 201);
  } catch (error: any) {
    return c.json({ error: 'Failed to start guest checkout.', message: error.message }, 500);
  }
});

// 6. CREATE A TEST ORDER WITHOUT PROCESSING A PAYMENT
app.post('/api/orders', async (c) => {
  try {
    const { customerName, email, phone, shippingAddress, items, discountCode } =
      await c.req.json();

    if (!c.env.SUPABASE_SERVICE_ROLE_KEY) {
      return c.json({
        error: 'Order creation is not configured.',
        message: 'Set the SUPABASE_SERVICE_ROLE_KEY Worker secret.',
      }, 503);
    }

    if (
      typeof customerName !== 'string' || !customerName.trim() ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !shippingAddress || typeof shippingAddress !== 'object' ||
      typeof shippingAddress.address1 !== 'string' || !shippingAddress.address1.trim() ||
      typeof shippingAddress.city !== 'string' || !shippingAddress.city.trim() ||
      typeof shippingAddress.region !== 'string' || !shippingAddress.region.trim() ||
      typeof shippingAddress.postalCode !== 'string' || !shippingAddress.postalCode.trim() ||
      !Array.isArray(items) || items.length === 0 || items.length > 50
    ) {
      return c.json({ error: 'Contact, shipping address, and cart items are required.' }, 400);
    }

    const orderItems = items.map((item: any) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
    }));

    if (orderItems.some((item: any) =>
      !Number.isInteger(item.productId) || item.productId <= 0 ||
      !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99
    )) {
      return c.json({ error: 'Cart contains an invalid product or quantity.' }, 400);
    }

    const authorization = c.req.header('Authorization');
    const bearerToken = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null;
    let authenticatedCustomerId: string | null = null;

    if (bearerToken && !bearerToken.startsWith('guest-')) {
      const authResponse = await fetch(`${c.env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
          'apikey': c.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${bearerToken}`,
        },
      });

      if (!authResponse.ok) {
        return c.json({ error: 'Your sign-in session has expired. Please sign in again.' }, 401);
      }

      const authUser: any = await authResponse.json();
      authenticatedCustomerId = authUser.id;
    }

    const response = await fetch(
      `${c.env.SUPABASE_URL}/rest/v1/rpc/create_test_order`,
      {
        method: 'POST',
        headers: {
          'apikey': c.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_customer_id: authenticatedCustomerId,
          p_customer_name: customerName.trim(),
          p_email: email.trim().toLowerCase(),
          p_phone: typeof phone === 'string' && phone.trim() ? phone.trim() : null,
          p_shipping_address: shippingAddress,
          p_items: orderItems,
          p_discount_code: typeof discountCode === 'string' && discountCode.trim()
            ? discountCode.trim().toUpperCase()
            : null,
        }),
      },
    );

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error('Test order creation failed:', response.status, errorDetails);
      return c.json({
        error: 'Could not create the test order.',
        message: errorDetails,
      }, 502);
    }

    return c.json(await response.json(), 201);
  } catch (error: any) {
    return c.json({ error: 'Could not create the test order.', message: error.message }, 500);
  }
});

// 7. GET ORDER HISTORY FOR THE AUTHENTICATED CUSTOMER
app.get('/api/orders', async (c) => {
  const authorization = c.req.header('Authorization');
  const bearerToken = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!bearerToken || bearerToken.startsWith('guest-')) {
    return c.json({ error: 'Sign in with a customer account to view order history.' }, 401);
  }

  if (!c.env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({
      error: 'Order history is not configured.',
      message: 'Set the SUPABASE_SERVICE_ROLE_KEY Worker secret.',
    }, 503);
  }

  try {
    const authResponse = await fetch(`${c.env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': c.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${bearerToken}`,
      },
    });

    if (!authResponse.ok) {
      return c.json({ error: 'Your sign-in session has expired. Please sign in again.' }, 401);
    }

    const authUser: any = await authResponse.json();
    const query = new URLSearchParams({
      select: 'Id,CustomerName,Email,Subtotal,DiscountCode,DiscountAmount,Total,PaymentStatus,OrderStatus,CreatedAt,OrderItems(Id,ProductId,ProductTitle,UnitPrice,Quantity,LineTotal)',
      CustomerId: `eq.${authUser.id}`,
      order: 'CreatedAt.desc',
    });
    const ordersResponse = await fetch(
      `${c.env.SUPABASE_URL}/rest/v1/Orders?${query.toString()}`,
      {
        headers: {
          'apikey': c.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${c.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!ordersResponse.ok) {
      const details = await ordersResponse.text();
      console.error('Order history query failed:', ordersResponse.status, details);
      return c.json({ error: 'Could not load order history.', message: details }, 502);
    }

    return c.json(await ordersResponse.json());
  } catch (error: any) {
    return c.json({ error: 'Could not load order history.', message: error.message }, 500);
  }
});

export default app;
