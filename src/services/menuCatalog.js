// Catálogo único de opciones del panel. Cada opción tiene una clave de permiso estable
// que usan el menú lateral, las rutas y la pantalla de "Roles del sistema".
// Las opciones sin "to" están por implementar. "adminOnly" solo las puede usar el rol admin.
const MENU = [
  { key: 'panel', label: 'Panel General', icon: 'dashboard', to: '/admin', end: true },
  {
    key: 'pedidos',
    label: 'Gestión de Pedidos',
    icon: 'truck',
    children: [{ key: 'pedidos.remisiones', label: 'Pedidos y Remisiones', to: '/admin/pedidos' }],
  },
  {
    key: 'ventas',
    label: 'Ventas',
    icon: 'money',
    children: [{ key: 'ventas.generar', label: 'Generar Venta', to: '/admin/ventas' }],
  },
  {
    key: 'inventario',
    label: 'Gestión de Inventario',
    icon: 'warehouse',
    children: [{ key: 'inventario.administracion', label: 'Administración de Inventario' }],
  },
  {
    key: 'catalogos',
    label: 'Catálogos',
    icon: 'box',
    children: [{ key: 'catalogos.productos', label: 'Productos y Categorías', to: '/admin/productos' }],
  },
  {
    key: 'reportes',
    label: 'Reportes',
    icon: 'chart',
    children: [
      { key: 'reportes.por-surtir', label: 'Pedidos por Surtir' },
      { key: 'reportes.ventas', label: 'Reporte General de Ventas' },
      { key: 'reportes.stock-critico', label: 'Reporte de Stock Crítico' },
    ],
  },
  {
    key: 'configuraciones',
    label: 'Configuraciones',
    icon: 'settings',
    children: [
      { key: 'configuraciones.usuarios', label: 'Control de Accesos', to: '/admin/usuarios', adminOnly: true },
      { key: 'configuraciones.roles', label: 'Roles del Sistema', to: '/admin/roles', adminOnly: true },
      { key: 'configuraciones.preferencias', label: 'Preferencias Generales', to: '/admin/preferencias' },
    ],
  },
];

// Todas las claves que se pueden asignar a un rol (padres e hijos, sin las exclusivas del admin).
function getAssignableKeys() {
  return MENU.flatMap((group) => [
    group.key,
    ...(group.children || []).filter((child) => !child.adminOnly).map((child) => child.key),
  ]);
}

// Un padre con hijos solo queda activo si conserva al menos un hijo permitido.
function normalizePermissions(keys) {
  const allowed = new Set(keys);
  const result = [];
  MENU.forEach((group) => {
    if (!group.children) {
      if (allowed.has(group.key)) {
        result.push(group.key);
      }
      return;
    }
    const childKeys = group.children
      .filter((child) => !child.adminOnly && allowed.has(child.key))
      .map((child) => child.key);
    if (childKeys.length > 0) {
      result.push(group.key, ...childKeys);
    }
  });
  return result;
}

function hasPermission(session, key) {
  if (!session) {
    return false;
  }
  return session.role === 'admin' || (session.permissions || []).includes(key);
}

// Un rol entra al panel si es admin o tiene al menos una opción asignada.
function hasPanelAccess(session) {
  return Boolean(session) && (session.role === 'admin' || (session.permissions || []).length > 0);
}

// Primera ruta del panel que el usuario puede abrir (null si no tiene ninguna).
function getFirstAllowedPath(session) {
  for (const group of MENU) {
    if (!group.children && group.to && hasPermission(session, group.key)) {
      return group.to;
    }
    const child = (group.children || []).find((item) => item.to && hasPermission(session, item.key));
    if (child) {
      return child.to;
    }
  }
  return null;
}

export { MENU, getAssignableKeys, normalizePermissions, hasPermission, hasPanelAccess, getFirstAllowedPath };
