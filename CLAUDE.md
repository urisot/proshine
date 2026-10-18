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


- Roles y permisos (`/admin/roles`, "Roles del Sistema" en Configuraciones, solo `admin`):
    - CRUD de roles (tablas `roles` y `role_permissions`, script `supabase/roles.sql`). `admin` y `cliente` son roles de sistema: se pueden editar (nombre y descripción) pero no eliminar. La clave (`roles.id`) es la que se guarda en `users.role` y no cambia al renombrar
    - Los permisos son solo por opción de menú (padre e hijos), no por acción. El catálogo de opciones y sus claves está en `src/services/menuCatalog.js` (lo usan el sidebar, el router y la pantalla de permisos). "Panel General" es una opción más
    - `admin` siempre tiene todo; "Control de Accesos" y "Roles del Sistema" son exclusivas del `admin` (`adminOnly`). Un rol con al menos una opción entra al panel; los permisos se guardan en la sesión (localStorage) y se refrescan al abrir la app
    - Al eliminar un rol, sus usuarios pasan a `cliente`. El rol se asigna manualmente en Control de Accesos
    - La restricción es solo del lado cliente (RLS abierto, sin Supabase Auth)

- Panel de aministración privado
    - Dentro del panel se podrá:
	- CRUD del catalogo de Categorias (Quimicos, Jarcieria, Envaces, etc)
        - CRUD del catalogo de productos cada producto ira asignado a una categoria
        - Gestionar los pedidos poder cambiarlos de estatus 
        - Cada cambio de estatus queda registrado en la bitácora `order_log` (quién, rol, estatus anterior/nuevo y fecha) mediante la función RPC `change_order_status` (cambio + registro en una sola transacción)
        - Después de cambiar un estatus (excepto "cancelado") se muestra un modal para avisar al cliente por WhatsApp (enlace `wa.me` al teléfono del cliente con el nuevo estatus y la fecha del cambio; números de 10 dígitos se prefijan con 52). El envío lo hace el administrador manualmente, no es automático
        - Ver el historial (bitácora) de cada pedido en un modal (`OrderLogModal`)
        - Filtros de pedidos: folio/cliente, teléfono de contacto y estatus
        - Cambio masivo de estatus: checkbox por pedido y combo superior. Regla: todos los seleccionados deben estar en el mismo estatus y solo pueden pasar al siguiente del flujo (pendiente → confirmado → en tránsito → terminado) o a cancelado (solo desde pendiente o confirmado) (`orderService.getBulkTargets`). Al terminar se muestra un modal (`StatusNotificationModal`) con el enlace de WhatsApp de cada cliente
        - Al pasar un pedido a "Terminado" (individual o masivo) se pregunta la forma de pago (por defecto efectivo, una para todos) y se registra la venta en `sales` con `order_id`, descontando stock, mediante `orderService.complete` (RPC `complete_order`). Si no hay stock, el pedido no cambia de estatus
        - Punto de Venta (`/admin/ventas`, diseño `design/proshine_ventas/ventas.html`): ventas de mostrador capturadas por SKU o con el buscador de productos en modal (F2). El cliente se elige con un buscador de clientes en modal (opcional, por defecto "Público en General"). No hay selector de tarifa: se usa el precio de menudeo con el descuento del producto. Métodos de pago: efectivo (con cálculo de cambio), tarjeta, SPEI y crédito. Atajos F2/F12/ESC. Al cobrar se imprime la nota de venta. Cada venta se guarda en `sales` y descuenta stock



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

- Tablas: `categories`, `products`, `users`, `orders`, `carts`, `settings`, `order_log`, `sales`, `roles`, `role_permissions`.
- `sales.order_id` (único, nullable): liga la venta con el pedido que la originó; `null` = venta de mostrador. En la venta de un pedido, `subtotal` = `orders.total`, descuento 0 e IVA de `settings`; si es efectivo, `cash_received` = total y `change_given` = 0.
- Funciones RPC: `change_order_status(p_order_id, p_new_status, p_user_id, p_user_name, p_user_role)`, `register_sale(p_sale jsonb)` (descuenta stock y registra la venta con folio `V-00001` en una sola transacción; falla si no hay stock suficiente), `complete_order(p_order_id, p_sale_id, p_payment_method, p_tax_rate, p_user_id, p_user_name, p_user_role)` (registra la venta del pedido y lo pasa a terminado con bitácora en una sola transacción).
- Scripts SQL versionados en la carpeta `supabase/` (ej. `supabase/order_log.sql`, `supabase/sales.sql`, `supabase/order_sales.sql`), se ejecutan en Supabase → SQL Editor.
- Todo acceso a datos pasa por `src/services/supabaseClient.js` (`selectAll`, `insertRow`, `updateRows`, `deleteRows`, `callRpc`). Los servicios convierten filas snake_case a objetos camelCase (`fromRow`).
- Los servicios son asíncronos; los componentes deben usar `await` / `.then` y manejar errores con toast.
- Los cambios de estatus de pedidos siempre se hacen con `orderService.updateStatus(id, status, session)` (nunca actualizando `orders` directo) para que quede registro en la bitácora. Para "terminado" se usa `orderService.complete(id, paymentMethod, session)` (`updateStatus` lo rechaza).
- Las ventas de mostrador siempre se registran con `saleService.register(...)` (RPC `register_sale`), nunca insertando en `sales` directo, para que el stock se descuente en la misma transacción.
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
    - Componentes de pedidos en `src/components/admin/`: `OrdersTable` (checkbox de selección), `OrderPaymentModal` (forma de pago al terminar), `StatusNotificationModal` (avisos de WhatsApp a uno o varios clientes)


Pendientes / notas (rama `01-punto-venta`, actualizado 2026-10-12):

- Los cambios de pedidos (filtro por teléfono, cambio masivo, venta al terminar) están implementados y compilan, pero falta probarlos en el navegador.
- Por decidir: el combo de estatus de cada fila aún permite regresar un pedido desde "Terminado"; la venta y el stock descontado no se revierten. Opción: bloquear el cambio desde "Terminado".
- Algunos pedidos antiguos referencian productos que ya no existen; no pueden pasar a "Terminado" ("Producto no encontrado: ...").
- El folio de ventas puede tener huecos (la secuencia `sales_folio_seq` no se revierte si la transacción falla); el folio V-00002 se consumió en una prueba.
- Los cambios de esta rama aún no están en commit.

