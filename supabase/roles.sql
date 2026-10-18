-- Roles del sistema y permisos por opción de menú (ejecutar en Supabase → SQL Editor)
create table public.roles (
  id           text primary key,            -- clave estable que se guarda en users.role
  name         text not null unique,        -- nombre visible, editable
  description  text not null default '',
  is_system    boolean not null default false,  -- admin y cliente: no se pueden eliminar
  created_at   timestamptz not null default now()
);

create table public.role_permissions (
  role_id         text not null references public.roles(id) on delete cascade,
  permission_key  text not null,            -- ej. 'ventas', 'ventas.generar', 'reportes.ventas'
  primary key (role_id, permission_key)
);

-- RLS con política abierta temporal, igual que el resto de tablas (sin Supabase Auth todavía)
alter table public.roles enable row level security;
create policy "roles_open_temp" on public.roles
  for all using (true) with check (true);
alter table public.role_permissions enable row level security;
create policy "role_permissions_open_temp" on public.role_permissions
  for all using (true) with check (true);

insert into public.roles (id, name, description, is_system) values
  ('admin', 'Administrador', 'Acceso total al panel de administración.', true),
  ('cliente', 'Cliente', 'Compra en la tienda pública.', true);

-- users.role pasa a ser una referencia a roles (se quitan los check anteriores sobre users)
do $$
declare v_name text;
begin
  for v_name in
    select conname from pg_constraint
    where conrelid = 'public.users'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.users drop constraint %I', v_name);
  end loop;
end $$;

alter table public.users
  add constraint users_role_fkey foreign key (role) references public.roles(id) on update cascade;

-- La bitácora acepta cualquier rol (antes solo admin/cliente/sistema)
alter table public.order_log drop constraint if exists order_log_changed_by_role_check;
