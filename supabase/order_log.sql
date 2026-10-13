-- Bitácora de cambios de estatus de pedidos (ejecutar en Supabase → SQL Editor)
create table public.order_log (
  id               bigint generated always as identity primary key,
  order_id         text not null references public.orders(id) on delete cascade,
  previous_status  text,
  new_status       text not null
                   check (new_status in ('pendiente','confirmado','en_transito','terminado','cancelado')),
  changed_by       text references public.users(id) on delete set null,
  changed_by_name  text not null default '',
  changed_by_role  text not null default ''
                   check (changed_by_role in ('', 'admin', 'cliente', 'sistema')),
  changed_at       timestamptz not null default now()
);

create index order_log_order_id_idx on public.order_log (order_id, changed_at desc);

-- RLS con política abierta temporal, igual que el resto de tablas (sin Supabase Auth todavía)
alter table public.order_log enable row level security;
create policy "order_log_open_temp" on public.order_log
  for all using (true) with check (true);

-- Cambio de estatus + registro en bitácora en una sola transacción
create or replace function public.change_order_status(
  p_order_id text,
  p_new_status text,
  p_user_id text,
  p_user_name text,
  p_user_role text
)
returns public.order_log
language plpgsql
as $$
declare
  v_previous text;
  v_log public.order_log;
begin
  select status into v_previous from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'Pedido no encontrado';
  end if;

  update public.orders set status = p_new_status where id = p_order_id;

  insert into public.order_log (order_id, previous_status, new_status, changed_by, changed_by_name, changed_by_role)
  values (p_order_id, v_previous, p_new_status, p_user_id, p_user_name, p_user_role)
  returning * into v_log;

  return v_log;
end;
$$;
