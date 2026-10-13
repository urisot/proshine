-- Ventas de mostrador (Punto de Venta del panel admin). Ejecutar en Supabase → SQL Editor.

-- Folio consecutivo de la venta: V-00001, V-00002, ...
create sequence public.sales_folio_seq;

create table public.sales (
  id                text primary key,
  folio             text not null unique,
  user_id           text references public.users(id) on delete set null, -- null = Público en General
  customer_name     text not null default 'Público en General',
  customer_phone    text not null default '',
  customer_rfc      text not null default '',
  customer_address  jsonb,
  items             jsonb not null, -- [{productId, sku, name, unit, quantity, listPrice, discountPercent, unitPrice}]
  subtotal          numeric(12,2) not null, -- suma de unitPrice * quantity (ya con descuento)
  discount          numeric(12,2) not null default 0,
  tax_rate          numeric(5,2) not null,
  tax               numeric(12,2) not null,
  total             numeric(12,2) not null,
  payment_method    text not null
                    check (payment_method in ('efectivo','tarjeta','spei','credito')),
  cash_received     numeric(12,2),
  change_given      numeric(12,2),
  sold_by           text references public.users(id) on delete set null,
  sold_by_name      text not null default '',
  created_at        timestamptz not null default now()
);

create index sales_created_at_idx on public.sales (created_at desc);

-- RLS con política abierta temporal, igual que el resto de tablas (sin Supabase Auth todavía)
alter table public.sales enable row level security;
create policy "sales_open_temp" on public.sales
  for all using (true) with check (true);

-- Registra la venta y descuenta el stock en una sola transacción.
-- Si algún producto no tiene stock suficiente, no se guarda nada.
create or replace function public.register_sale(p_sale jsonb)
returns public.sales
language plpgsql
as $$
declare
  v_item jsonb;
  v_stock integer;
  v_name text;
  v_quantity integer;
  v_sale public.sales;
begin
  if jsonb_array_length(coalesce(p_sale->'items', '[]'::jsonb)) = 0 then
    raise exception 'La venta no tiene productos';
  end if;

  for v_item in select * from jsonb_array_elements(p_sale->'items') loop
    v_quantity := (v_item->>'quantity')::integer;

    select stock, name into v_stock, v_name
    from public.products
    where id = v_item->>'productId'
    for update;

    if not found then
      raise exception 'Producto no encontrado: %', v_item->>'name';
    end if;
    if v_quantity <= 0 or v_stock < v_quantity then
      raise exception 'Stock insuficiente para % (disponible: %)', v_name, v_stock;
    end if;

    update public.products set stock = stock - v_quantity where id = v_item->>'productId';
  end loop;

  insert into public.sales (
    id, folio, user_id, customer_name, customer_phone, customer_rfc, customer_address,
    items, subtotal, discount, tax_rate, tax, total,
    payment_method, cash_received, change_given, sold_by, sold_by_name
  )
  values (
    p_sale->>'id',
    'V-' || lpad(nextval('public.sales_folio_seq')::text, 5, '0'),
    nullif(p_sale->>'userId', ''),
    coalesce(nullif(p_sale->>'customerName', ''), 'Público en General'),
    coalesce(p_sale->>'customerPhone', ''),
    coalesce(p_sale->>'customerRfc', ''),
    p_sale->'customerAddress',
    p_sale->'items',
    (p_sale->>'subtotal')::numeric,
    coalesce((p_sale->>'discount')::numeric, 0),
    (p_sale->>'taxRate')::numeric,
    (p_sale->>'tax')::numeric,
    (p_sale->>'total')::numeric,
    p_sale->>'paymentMethod',
    (p_sale->>'cashReceived')::numeric,
    (p_sale->>'changeGiven')::numeric,
    nullif(p_sale->>'soldBy', ''),
    coalesce(p_sale->>'soldByName', '')
  )
  returning * into v_sale;

  return v_sale;
end;
$$;
