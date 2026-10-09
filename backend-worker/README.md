```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```

Run `sql/create_test_orders.sql` in the Supabase SQL Editor to create the test
order tables and the `create_test_order` RPC. The RPC reads current product
prices from `Products`; it does not process payments or reduce inventory.

Configure the service-role key as a Worker secret. Do not put this key in the
frontend or commit it to source control:

```txt
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

For local `wrangler dev`, add `SUPABASE_SERVICE_ROLE_KEY` to an untracked
`backend-worker/.dev.vars` file. After the SQL script and secret are configured,
deploy the Worker with `npm run deploy`.
