create table if not exists public."Orders" (
  "Id" uuid primary key default gen_random_uuid(),
  "CustomerId" uuid,
  "CustomerName" text not null,
  "Email" text not null,
  "Phone" text,
  "ShippingAddress" jsonb not null,
  "Subtotal" numeric(10, 2) not null check ("Subtotal" >= 0),
  "DiscountCode" text,
  "DiscountAmount" numeric(10, 2) not null default 0 check ("DiscountAmount" >= 0),
  "Total" numeric(10, 2) not null check ("Total" >= 0),
  "PaymentStatus" text not null default 'Test' check ("PaymentStatus" = 'Test'),
  "OrderStatus" text not null default 'Placed',
  "CreatedAt" timestamptz not null default now()
);

create table if not exists public."OrderItems" (
  "Id" bigint generated always as identity primary key,
  "OrderId" uuid not null references public."Orders"("Id") on delete cascade,
  "ProductId" integer not null references public."Products"("Id") on delete restrict,
  "ProductTitle" text not null,
  "UnitPrice" numeric(10, 2) not null check ("UnitPrice" >= 0),
  "Quantity" integer not null check ("Quantity" > 0),
  "LineTotal" numeric(10, 2) not null check ("LineTotal" >= 0)
);

alter table public."Orders" enable row level security;
alter table public."OrderItems" enable row level security;

create or replace function public.create_test_order(
  p_customer_id uuid,
  p_customer_name text,
  p_email text,
  p_phone text,
  p_shipping_address jsonb,
  p_items jsonb,
  p_discount_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_subtotal numeric(10, 2) := 0;
  v_discount_amount numeric(10, 2) := 0;
  v_total numeric(10, 2) := 0;
  v_title text;
  v_unit_price numeric(10, 2);
  v_stock integer;
  v_item record;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  for v_item in
    select item."productId" as product_id, sum(item.quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as item("productId" integer, quantity integer)
    group by item."productId"
    order by item."productId"
  loop
    if v_item.product_id is null or v_item.quantity is null or v_item.quantity < 1 then
      raise exception 'Order contains an invalid product or quantity';
    end if;

    select p."Title", p."Price"::numeric, p."StockQuantity"
      into v_title, v_unit_price, v_stock
    from public."Products" as p
    where p."Id" = v_item.product_id;

    if not found then
      raise exception 'Product % was not found', v_item.product_id;
    end if;

    if v_stock is not null and v_stock < v_item.quantity then
      raise exception 'Insufficient stock for %', v_title;
    end if;

    v_subtotal := v_subtotal + (v_unit_price * v_item.quantity);
  end loop;

  if p_discount_code is not null and p_discount_code <> 'MOVIEDEAL20' then
    raise exception 'Invalid promotional code';
  end if;

  if p_discount_code = 'MOVIEDEAL20' then
    v_discount_amount := round(v_subtotal * 0.20, 2);
  end if;

  v_total := v_subtotal - v_discount_amount;

  insert into public."Orders" (
    "CustomerId", "CustomerName", "Email", "Phone", "ShippingAddress",
    "Subtotal", "DiscountCode", "DiscountAmount", "Total", "PaymentStatus", "OrderStatus"
  ) values (
    p_customer_id, p_customer_name, p_email, p_phone, p_shipping_address,
    v_subtotal, p_discount_code, v_discount_amount, v_total, 'Test', 'Placed'
  ) returning "Id" into v_order_id;

  insert into public."OrderItems" (
    "OrderId", "ProductId", "ProductTitle", "UnitPrice", "Quantity", "LineTotal"
  )
  select
    v_order_id,
    p."Id",
    p."Title",
    p."Price"::numeric,
    item.quantity,
    p."Price"::numeric * item.quantity
  from jsonb_to_recordset(p_items) as item("productId" integer, quantity integer)
  join public."Products" as p on p."Id" = item."productId";

  return jsonb_build_object(
    'orderId', v_order_id,
    'subtotal', v_subtotal,
    'discountAmount', v_discount_amount,
    'total', v_total,
    'paymentStatus', 'Test',
    'orderStatus', 'Placed',
    'createdAt', now()
  );
end;
$$;

revoke all on function public.create_test_order(uuid, text, text, text, jsonb, jsonb, text)
  from public, anon, authenticated;
grant execute on function public.create_test_order(uuid, text, text, text, jsonb, jsonb, text)
  to service_role;