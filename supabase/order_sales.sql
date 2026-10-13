-- Venta generada al terminar un pedido. Ejecutar en Supabase → SQL Editor (después de sales.sql).

-- Liga la venta con el pedido que la originó (null = venta de mostrador).
-- unique: un pedido solo puede generar una venta.
alter table public.sales
  add column order_id text unique references public.orders(id) on delete set null;

-- register_sale ahora también guarda orderId (opcional).
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
    id, folio, order_id, user_id, customer_name, customer_phone, customer_rfc, customer_address,
    items, subtotal, discount, tax_rate, tax, total,
    payment_method, cash_received, change_given, sold_by, sold_by_name
  )
  values (
    p_sale->>'id',
    'V-' || lpad(nextval('public.sales_folio_seq')::text, 5, '0'),
    nullif(p_sale->>'orderId', ''),
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

-- Termina un pedido: registra su venta (descuenta stock) y cambia el estatus con
-- registro en la bitácora, todo en una sola transacción. Si no hay stock, no cambia nada.
-- Devuelve { log, sale }.
create or replace function public.complete_order(
  p_order_id text,
  p_sale_id text,
  p_payment_method text,
  p_tax_rate numeric,
  p_user_id text,
  p_user_name text,
  p_user_role text
)
returns jsonb
language plpgsql
as $$
declare
  v_order public.orders;
  v_tax numeric(12,2);
  v_total numeric(12,2);
  v_sale public.sales;
  v_log public.order_log;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Pedido no encontrado';
  end if;
  if v_order.status in ('terminado', 'cancelado') then
    raise exception 'El pedido % ya está %', p_order_id, v_order.status;
  end if;

  -- orders.total guarda el subtotal; el IVA se suma igual que en orderService.getTotals.
  v_tax := round(v_order.total * p_tax_rate / 100, 2);
  v_total := v_order.total + v_tax;

  v_sale := public.register_sale(jsonb_build_object(
    'id', p_sale_id,
    'orderId', v_order.id,
    'userId', coalesce(v_order.user_id, ''),
    'customerName', v_order.customer_name,
    'customerPhone', v_order.customer_phone,
    'customerRfc', v_order.customer_rfc,
    'customerAddress', v_order.customer_address,
    'items', v_order.items,
    'subtotal', v_order.total,
    'discount', 0,
    'taxRate', p_tax_rate,
    'tax', v_tax,
    'total', v_total,
    'paymentMethod', p_payment_method,
    'cashReceived', case when p_payment_method = 'efectivo' then v_total end,
    'changeGiven', case when p_payment_method = 'efectivo' then 0 end,
    'soldBy', p_user_id,
    'soldByName', p_user_name
  ));

  v_log := public.change_order_status(p_order_id, 'terminado', p_user_id, p_user_name, p_user_role);

  return jsonb_build_object('log', to_jsonb(v_log), 'sale', to_jsonb(v_sale));
end;
$$;
