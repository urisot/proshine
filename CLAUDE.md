Proyecto:

Aplicación web para la venta de quimicos (domesticos) y productos de limpieza que se va llamar ProShine


Rol del agente:

Desarrollador web con 12 años de experiencia.


Objetivo:

Crear una aplicación web para la venta de un catalogo de productos, donde tambien se puede realizar la venta de los mismos,
cuenta con un panel de administracion CRUD de productos (Todo se podrá administrar en un panel de administración) y una pagina principal donde el usuario podra visualizar y buscar los productos que se comercializan



Funcionalidades de la aplicación:

- Login y registro
- Los clientes se pueden registrar para hacer compras
- Los cliente tienen un rol "cliente" con acceso para poder visualizar el catalogo de productos donde tambien se le ofreceran los productos que se encuentran en promocion o los que tienen mayor demanda
- Y los usuarios de la base de datos que tengan un rol "admin" (rol asignado manualmente), podrán entrar al panel de administración donde al entrar te mostrara un dasboard con un resumen general de ventas, pedidos en estatus (pendiente, confirmado, en transito, terminado, cancelado) .
- La información (categorías, productos, usuarios, pedidos, carritos y configuración de tienda) se guarda en Supabase (Postgres). Solo la sesión del usuario autenticado (quién está logeado ahora mismo en este navegador) se guarda en localStorage.


- Panel de aministración privado
    - Dentro del panel se podrá:
	- CRUD del catalogo de Categorias (Quimicos, Jarcieria, Envaces, etc)
        - CRUD del catalogo de productos cada producto ira asignado a una categoria
        - Gestionar los pedidos poder cambiarlos de estatus 
        - Cada cambio de estatus queda registrado en la bitácora `order_log` (quién, rol, estatus anterior/nuevo y fecha) mediante la función RPC `change_order_status` (cambio + registro en una sola transacción)
        - Después de cambiar un estatus (excepto "cancelado") se muestra un modal para avisar al cliente por WhatsApp (enlace `wa.me` al teléfono del cliente con el nuevo estatus y la fecha del cambio; números de 10 dígitos se prefijan con 52). El envío lo hace el administrador manualmente, no es automático
        - Ver el historial (bitácora) de cada pedido en un modal (`OrderLogModal`)



- En la parte publica:
    - Para hacer compras nesesitamos estar registrados y logeados en la aplicacion:
        - Seleccionar productos
        - agregar al carrito de compras (al agregar un producto NO se abre el carrito; solo se muestra un toast de confirmación y se actualiza el contador del ícono del carrito)
        - ventana (modal) de confirmacion del pedido, al realizar el pedido se enviara por Watsapp al administrador o jefactura d eventas
        - Al crear el pedido se registra el primer movimiento en la bitácora (`pendiente`, rol "cliente")
        - Cancelar pedido siempre y cuando no se ecnuentre en estatus de En transito, Terminado o Cancelado (la cancelación también queda registrada en la bitácora)
        - En "Mis pedidos" el cliente puede consultar el historial de estatus de cada pedido
    - Sin necesidad de estar identificado:
        - Visualizar el catalogo de productos 


- En general:
- Protección de rutas
- Validación de solapamiento
- Mensajes de confirmación


Stack de tecnologia:

- HTML5
- CSS3 (con tailwind)
- JavaScript
- React
- Base de datos Supabase (Postgres), accedida desde el cliente vía la API REST de Supabase (fetch nativo, sin SDK externo). RLS habilitado en todas las tablas con políticas abiertas temporales (sin Supabase Auth todavía); ver nota de seguridad en la migración `proshine_initial_schema`.


Base de datos (Supabase):

- Tablas: `categories`, `products`, `users`, `orders`, `carts`, `settings`, `order_log`.
- Funciones RPC: `change_order_status(p_order_id, p_new_status, p_user_id, p_user_name, p_user_role)`.
- Scripts SQL versionados en la carpeta `supabase/` (ej. `supabase/order_log.sql`), se ejecutan en Supabase → SQL Editor.
- Todo acceso a datos pasa por `src/services/supabaseClient.js` (`selectAll`, `insertRow`, `updateRows`, `deleteRows`, `callRpc`). Los servicios convierten filas snake_case a objetos camelCase (`fromRow`).
- Los servicios son asíncronos; los componentes deben usar `await` / `.then` y manejar errores con toast.
- Los cambios de estatus de pedidos siempre se hacen con `orderService.updateStatus(id, status, session)` (nunca actualizando `orders` directo) para que quede registro en la bitácora.
- Variables de entorno (ver `.env.template`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (cliente). `SUPABASE_SECRET_KEY` y `SUPABASE_DB_PASSWORD` nunca deben usarse en el frontend.
- Estatus válidos de pedido: `pendiente`, `confirmado`, `en_transito`, `terminado`, `cancelado` (etiquetas en `orderService.STATUS_LABELS`).


Preferencias generales:

- Todos los textos (etiquetas, botones,etc) visibles en la web deben estar en español.



Preferencias de diseño:

- Basate en el documento HTML del diseño que tienes en la carpeta design del proyecto


Preferencias de estilos:

- Colores (los del diseño)
- Uso de medidas en rem, usando un font-size base de 10px
- Uso de HTML5 y CSS3 nativo.
- Uso de buenas practicas de maquetación css y si es necesario usa flexbox y css grid layout.
- Que la webapp sea responsive.


Preferencias de código:

- No añadas dependencias externas.
- HTML debe ser semantico.
- Usa siempre let o const, y no uses nunca var.
- No uses alert, confirm o prompt, todo el feedback debe ser visual en el dom.
- Toda alerta o ventana modal que aparezca debe tener el mismo estilo que la web.
- No uses innerHTML, todo el contenido debe ser insertado con appendChild o previamente creando un elemento con document.createElement
- Cuidado con olvidar prevenir el default en los eventos submit o click.
- Prioriza el código legible y mantenible.
- Pririza que el codigo sea sencillo de entender.
- Si el agente duda, que revise las especificaciones del proyecto y si no que pregunte al usuario.


Estructura de archivos:

- carpeta (design)
- CLAUDE.md
- estructura de ficheros más adecuada para proyectos de react (lo elige el agente de ia)
- Estructura actual (Vite + React):
    - `src/components/` (admin, cart, catalog, common, layout)
    - `src/context/` (AuthContext, CartContext, ToastContext)
    - `src/pages/` (públicas) y `src/pages/admin/` (panel)
    - `src/router/AppRouter.jsx` (rutas y protección con `ProtectedRoute`)
    - `src/services/` (lógica de negocio y acceso a Supabase; `storage.js` solo maneja la sesión en localStorage)
    - `supabase/` (scripts SQL)
    - `.github/workflows/` (Claude Code y triage automático de issues con Claude)

