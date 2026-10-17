-- Sectores múltiples por producto. Ejecutar en Supabase → SQL Editor.

alter table public.products
  add column sectors text[] not null default '{}';

-- Migración: cada producto hereda el sector de su categoría.
update public.products p
  set sectors = array[c.sector]
  from public.categories c
  where c.id = p.category_id and c.sector is not null;

-- Al menos un sector por producto, y solo valores válidos.
alter table public.products
  add constraint products_sectors_valid
  check (
    cardinality(sectors) >= 1
    and sectors <@ array['Hogar', 'Hoteles', 'Escuelas', 'Empresas', 'Industria']::text[]
  );
