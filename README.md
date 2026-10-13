# ProShine

Aplicación web para la venta de químicos domésticos y productos de limpieza. Incluye un catálogo público, carrito de compras con envío de pedidos por WhatsApp y un panel de administración privado para gestionar productos, categorías, pedidos, usuarios y la configuración de la tienda.

## Funcionalidades

### Parte pública

- Catálogo de productos visible sin iniciar sesión, con búsqueda y filtro por categoría.
- Filtro de productos en promoción y orden por mayor demanda.
- Registro e inicio de sesión de clientes (`/acceso`).
- Carrito de compras (solo clientes autenticados). Al agregar un producto se muestra un toast y se actualiza el contador del carrito.
- Modal de confirmación del pedido; al confirmar, el pedido se envía por WhatsApp al administrador.
- "Mis pedidos" (`/mis-pedidos`):
  - Filtro por estatus.
  - Descarga de la nota de venta.
  - Historial de cambios de estatus de cada pedido.
  - Cancelación del pedido mientras no esté en "En tránsito", "Terminado" o "Cancelado".

### Panel de administración (`/admin`, rol `admin`)

- **Dashboard**: resumen de ventas y conteo de pedidos por estatus.
- **Productos y categorías**: CRUD completo; cada producto pertenece a una categoría.
- **Pedidos**:
  - Cambio de estatus: `pendiente`, `confirmado`, `en_transito`, `terminado`, `cancelado`.
  - Cada cambio queda registrado en una bitácora (quién, rol, estatus anterior y nuevo, fecha).
  - Tras un cambio de estatus (excepto cancelación) se ofrece avisar al cliente por WhatsApp.
  - Detalle del pedido, nota de venta (remisión) y reporte de pedidos.
- **Usuarios**: CRUD de usuarios.
- **Preferencias**: datos de la tienda, número de WhatsApp para pedidos, tasa de IVA y monto para envío gratis.
- Importación y exportación de productos, categorías y usuarios en CSV.

### General

- Rutas protegidas por rol (`cliente` / `admin`) con `ProtectedRoute`.
- Mensajes de confirmación y notificaciones visuales (toasts y modales con el estilo de la web).
- Diseño responsive.
- Todos los textos de la interfaz están en español.

## Stack

- React 18 + React Router 6
- Vite 5
- Tailwind CSS 3 (con PostCSS y Autoprefixer)
- Supabase (Postgres), accedido vía la API REST con `fetch` nativo (sin SDK)

## Requisitos

- Node.js 18 o superior
- Un proyecto de Supabase

## Instalación

```bash
git clone https://github.com/urisot/proshine.git
cd proshine
npm install
```

Crea el archivo `.env.local` a partir de `.env.template`:

```bash
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<tu-publishable-key>
```

`SUPABASE_SECRET_KEY` y `SUPABASE_DB_PASSWORD` (también en `.env.template`) son solo para herramientas de desarrollo. Nunca deben usarse en el frontend ni llevar el prefijo `VITE_`.

## Base de datos

Tablas en Supabase:

| Tabla        | Contenido                                     |
|--------------|-----------------------------------------------|
| `categories` | Categorías del catálogo                       |
| `products`   | Productos (cada uno con su categoría)         |
| `users`      | Usuarios con rol `cliente` o `admin`          |
| `orders`     | Pedidos                                       |
| `carts`      | Carritos de compra                            |
| `settings`   | Configuración de la tienda                    |
| `order_log`  | Bitácora de cambios de estatus de pedidos     |

Función RPC: `change_order_status(p_order_id, p_new_status, p_user_id, p_user_name, p_user_role)`. Cambia el estatus del pedido y registra el movimiento en `order_log` en una sola transacción.

Los scripts SQL están en la carpeta `supabase/`. Ejecútalos en Supabase → SQL Editor.

### Crear un administrador

El rol `admin` se asigna manualmente. Registra el usuario desde la aplicación y después ejecuta en Supabase:

```sql
update public.users set role = 'admin' where email = 'correo@ejemplo.com';
```

## Scripts

| Comando           | Descripción                               |
|-------------------|-------------------------------------------|
| `npm run dev`     | Servidor de desarrollo                    |
| `npm run build`   | Build de producción en `dist/`            |
| `npm run preview` | Sirve localmente el build de producción   |

## Estructura del proyecto

```
ProShine/
├── design/               # Diseño de referencia (HTML) y logotipo
├── public/               # Archivos estáticos y _redirects (SPA)
├── supabase/             # Scripts SQL
├── src/
│   ├── components/
│   │   ├── admin/        # Tablas y formularios del panel
│   │   ├── cart/         # Carrito
│   │   ├── catalog/      # Tarjetas y detalle de producto
│   │   ├── common/       # Modales, íconos, rutas protegidas, etc.
│   │   └── layout/       # Layouts público y de administración
│   ├── context/          # AuthContext, CartContext, ToastContext
│   ├── pages/            # Páginas públicas
│   │   └── admin/        # Páginas del panel
│   ├── router/           # AppRouter
│   └── services/         # Lógica de negocio y acceso a Supabase
├── .github/workflows/    # Claude Code y triage automático de issues
└── CLAUDE.md             # Especificaciones del proyecto
```

## Rutas

| Ruta                  | Acceso   |
|-----------------------|----------|
| `/`                   | Público  |
| `/acceso`             | Público  |
| `/mis-pedidos`        | Cliente  |
| `/admin`              | Admin    |
| `/admin/productos`    | Admin    |
| `/admin/pedidos`      | Admin    |
| `/admin/usuarios`     | Admin    |
| `/admin/preferencias` | Admin    |

## Despliegue

`npm run build` genera la carpeta `dist/`. El archivo `public/_redirects` redirige todas las rutas a `index.html` (compatible con Netlify). En otros servicios, configura una regla equivalente para la SPA.

## Seguridad

Estado actual, pendiente de mejorar antes de usar en producción:

- No usa Supabase Auth. La sesión se guarda en `localStorage` y la protección de rutas ocurre solo en el cliente.
- RLS está habilitado en todas las tablas, pero con políticas abiertas temporales.
- Las contraseñas se guardan sin hash.

Se recomienda migrar a Supabase Auth y definir políticas RLS por rol.
