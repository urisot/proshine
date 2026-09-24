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
- la informacion se guarda en el localstorage


- Panel de aministración privado
    - Dentro del panel se podrá:
	- CRUD del catalogo de Categorias (Quimicos, Jarcieria, Envaces, etc)
        - CRUD del catalogo de productos cada producto ira asignado a una categoria
        - Gestionar los pedidos poder cambiarlos de estatus 



- En la parte publica:
    - Para hacer compras nesesitamos estar registrados y logeados en la aplicacion:
        - Seleccionar productos
        - agregar al carrito de compras
        - ventana (modal) de confirmacion del pedido, al realizar el pedido se enviara por Watsapp al administrador o jefactura d eventas
        - Cancelar pedido siempre y cuando no se ecnuentre en estatus de En transito
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
- Base datos LocalStorage 


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

