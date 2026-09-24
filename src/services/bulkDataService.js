import { downloadCsv, parseCsvToObjects, readFileAsText, parseBoolean } from './csvService.js';
import * as productService from './productService.js';
import * as categoryService from './categoryService.js';
import * as userService from './userService.js';
import { normalizeAddress, getMissingRequired } from './addressService.js';

const PRODUCT_COLUMNS = [
  { key: 'sku', header: 'SKU', required: true, example: 'PS-DEG-99' },
  { key: 'name', header: 'Nombre', required: true, example: 'Desengrasante Industrial' },
  { key: 'description', header: 'Descripcion', required: false, example: 'Fórmula alcalina pH 13' },
  { key: 'categoryName', header: 'Categoria', required: true, example: 'Químicos y Desengrasantes' },
  { key: 'unit', header: 'Presentacion', required: true, example: 'Porrón 20 L' },
  { key: 'priceRetail', header: 'PrecioMenudeo', required: true, example: '680.00' },
  { key: 'priceWholesale', header: 'PrecioMayoreo', required: true, example: '520.00' },
  { key: 'discountPercent', header: 'DescuentoPorcentaje', required: false, example: '0' },
  { key: 'stock', header: 'Stock', required: true, example: '50' },
  { key: 'minStock', header: 'StockMinimo', required: true, example: '10' },
  { key: 'isHighDemand', header: 'AltaDemanda', required: false, example: 'No' },
  { key: 'isOnPromo', header: 'EnPromocion', required: false, example: 'No' },
  { key: 'imageUrl', header: 'ImagenURL', required: false, example: 'https://ejemplo.com/foto.jpg' },
];

const CATEGORY_COLUMNS = [
  { key: 'name', header: 'Nombre', required: true, example: 'Neutralizantes y Ácidos' },
  { key: 'sector', header: 'Sector', required: true, example: 'Industria' },
  { key: 'description', header: 'Descripcion', required: false, example: 'Productos de acción ácida' },
];

const USER_COLUMNS = [
  { key: 'name', header: 'Nombre', required: true, example: 'Carlos Méndez' },
  { key: 'email', header: 'Correo', required: true, example: 'carlos@empresa.com' },
  { key: 'phone', header: 'Telefono', required: true, example: '+52 55 1234 5678' },
  { key: 'rfc', header: 'RFC', required: false, example: 'XAXX010101000' },
  { key: 'street', header: 'Calle', required: true, example: 'Av. Reforma' },
  { key: 'exteriorNumber', header: 'NumeroExterior', required: true, example: '250' },
  { key: 'interiorNumber', header: 'NumeroInterior', required: false, example: '4B' },
  { key: 'neighborhood', header: 'Colonia', required: true, example: 'Juárez' },
  { key: 'city', header: 'Ciudad', required: true, example: 'Frontera' },
  { key: 'state', header: 'Estado', required: true, example: 'Coahuila' },
  { key: 'postalCode', header: 'CodigoPostal', required: true, example: '06600' },
  { key: 'password', header: 'Contrasena', required: true, example: 'temporal123' },
  { key: 'role', header: 'Rol', required: true, example: 'cliente' },
];

const VALID_SECTORS = ['Hogar', 'Hoteles', 'Escuelas', 'Empresas', 'Industria'];
const VALID_UNITS = ['Porrón 20 L', 'Galón 3.78 L', 'Litro 1 L', 'Tambo 200 L', 'Pieza Unitaria'];

function timestamp() {
  return new Date().toISOString().slice(0, 10);
}

function downloadTemplate(columns, filename) {
  downloadCsv(filename, columns.map((column) => column.header), [columns.map((column) => column.example)]);
}

function downloadProductsTemplate() {
  downloadTemplate(PRODUCT_COLUMNS, 'Layout_Productos.csv');
}

function downloadCategoriesTemplate() {
  downloadTemplate(CATEGORY_COLUMNS, 'Layout_Categorias.csv');
}

function downloadUsersTemplate() {
  downloadTemplate(USER_COLUMNS, 'Layout_Usuarios.csv');
}

function exportProducts(products, categoryNameById) {
  const rows = products.map((product) => [
    product.sku,
    product.name,
    product.description,
    categoryNameById[product.categoryId] || '',
    product.unit,
    product.priceRetail.toFixed(2),
    product.priceWholesale.toFixed(2),
    product.discountPercent,
    product.stock,
    product.minStock,
    product.isHighDemand ? 'Si' : 'No',
    product.isOnPromo ? 'Si' : 'No',
    product.imageUrl || '',
  ]);
  downloadCsv(`Productos_${timestamp()}.csv`, PRODUCT_COLUMNS.map((column) => column.header), rows);
}

function exportCategories(categories, productCountByCategory) {
  const headers = [...CATEGORY_COLUMNS.map((column) => column.header), 'ProductosAsociados'];
  const rows = categories.map((category) => [
    category.name,
    category.sector,
    category.description,
    productCountByCategory[category.id] || 0,
  ]);
  downloadCsv(`Categorias_${timestamp()}.csv`, headers, rows);
}

function exportUsers(users) {
  // No se exportan contraseñas.
  const headers = [
    'Nombre', 'Correo', 'Telefono', 'RFC', 'Calle', 'NumeroExterior', 'NumeroInterior',
    'Colonia', 'Ciudad', 'Estado', 'CodigoPostal', 'Rol', 'FechaRegistro',
  ];
  const rows = users.map((user) => {
    const address = normalizeAddress(user.address);
    return [
      user.name,
      user.email,
      user.phone,
      user.rfc || '',
      address.street,
      address.exteriorNumber,
      address.interiorNumber,
      address.neighborhood,
      address.city,
      address.state,
      address.postalCode,
      user.role,
      new Date(user.createdAt).toLocaleDateString('es-MX'),
    ];
  });
  downloadCsv(`Usuarios_${timestamp()}.csv`, headers, rows);
}

function buildReport(created, updated, errors) {
  return { success: true, created, updated, errors };
}

async function importProducts(file) {
  const text = await readFileAsText(file);
  const parsed = parseCsvToObjects(text, PRODUCT_COLUMNS);
  if (!parsed.success) {
    return { success: false, message: parsed.message };
  }

  const categories = categoryService.getAll();
  const errors = [];
  let created = 0;
  let updated = 0;

  parsed.records.forEach((record, index) => {
    const line = index + 2;

    if (!record.sku || !record.name) {
      errors.push(`Fila ${line}: SKU y Nombre son obligatorios.`);
      return;
    }

    const category = categories.find(
      (item) => item.name.trim().toLowerCase() === record.categoryName.trim().toLowerCase()
    );
    if (!category) {
      errors.push(`Fila ${line}: la categoría "${record.categoryName}" no existe.`);
      return;
    }

    if (!VALID_UNITS.includes(record.unit)) {
      errors.push(`Fila ${line}: presentación "${record.unit}" no válida.`);
      return;
    }

    if (Number.isNaN(Number(record.priceRetail)) || Number.isNaN(Number(record.priceWholesale))) {
      errors.push(`Fila ${line}: los precios deben ser numéricos.`);
      return;
    }

    const payload = {
      sku: record.sku,
      name: record.name,
      description: record.description,
      categoryId: category.id,
      unit: record.unit,
      priceRetail: record.priceRetail,
      priceWholesale: record.priceWholesale,
      discountPercent: record.discountPercent || 0,
      stock: record.stock || 0,
      minStock: record.minStock || 0,
      isHighDemand: parseBoolean(record.isHighDemand),
      isOnPromo: parseBoolean(record.isOnPromo),
      imageUrl: record.imageUrl,
    };

    // Un SKU existente actualiza el producto en lugar de duplicarlo.
    const existing = productService
      .getAll()
      .find((product) => product.sku.trim().toLowerCase() === record.sku.trim().toLowerCase());

    const result = existing ? productService.update(existing.id, payload) : productService.create(payload);

    if (!result.success) {
      errors.push(`Fila ${line}: ${result.message}`);
      return;
    }

    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }
  });

  return buildReport(created, updated, errors);
}

async function importCategories(file) {
  const text = await readFileAsText(file);
  const parsed = parseCsvToObjects(text, CATEGORY_COLUMNS);
  if (!parsed.success) {
    return { success: false, message: parsed.message };
  }

  const errors = [];
  let created = 0;
  let updated = 0;

  parsed.records.forEach((record, index) => {
    const line = index + 2;

    if (!record.name) {
      errors.push(`Fila ${line}: el Nombre es obligatorio.`);
      return;
    }

    if (!VALID_SECTORS.includes(record.sector)) {
      errors.push(`Fila ${line}: sector "${record.sector}" no válido. Use: ${VALID_SECTORS.join(', ')}.`);
      return;
    }

    const payload = { name: record.name, sector: record.sector, description: record.description };
    const existing = categoryService
      .getAll()
      .find((category) => category.name.trim().toLowerCase() === record.name.trim().toLowerCase());

    if (existing) {
      categoryService.update(existing.id, payload);
      updated += 1;
    } else {
      categoryService.create(payload);
      created += 1;
    }
  });

  return buildReport(created, updated, errors);
}

async function importUsers(file) {
  const text = await readFileAsText(file);
  const parsed = parseCsvToObjects(text, USER_COLUMNS);
  if (!parsed.success) {
    return { success: false, message: parsed.message };
  }

  const errors = [];
  let created = 0;
  let updated = 0;

  parsed.records.forEach((record, index) => {
    const line = index + 2;

    if (!record.name || !record.email) {
      errors.push(`Fila ${line}: Nombre y Correo son obligatorios.`);
      return;
    }

    const role = record.role.trim().toLowerCase();
    if (role !== 'cliente' && role !== 'admin') {
      errors.push(`Fila ${line}: rol "${record.role}" no válido. Use: cliente o admin.`);
      return;
    }

    if (!record.password || record.password.length < 6) {
      errors.push(`Fila ${line}: la contraseña debe tener al menos 6 caracteres.`);
      return;
    }

    const address = {
      street: record.street,
      exteriorNumber: record.exteriorNumber,
      interiorNumber: record.interiorNumber,
      neighborhood: record.neighborhood,
      city: record.city,
      state: record.state,
      postalCode: record.postalCode,
    };

    const missingAddress = getMissingRequired(address);
    if (missingAddress.length > 0) {
      errors.push(`Fila ${line}: faltan datos de dirección: ${missingAddress.join(', ')}.`);
      return;
    }

    const payload = {
      name: record.name,
      email: record.email,
      phone: record.phone,
      rfc: record.rfc,
      address,
      password: record.password,
      role,
    };

    const existing = userService
      .getAll()
      .find((user) => user.email.trim().toLowerCase() === record.email.trim().toLowerCase());

    const result = existing ? userService.update(existing.id, payload) : userService.create(payload);

    if (!result.success) {
      errors.push(`Fila ${line}: ${result.message}`);
      return;
    }

    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }
  });

  return buildReport(created, updated, errors);
}

export {
  PRODUCT_COLUMNS,
  CATEGORY_COLUMNS,
  USER_COLUMNS,
  downloadProductsTemplate,
  downloadCategoriesTemplate,
  downloadUsersTemplate,
  exportProducts,
  exportCategories,
  exportUsers,
  importProducts,
  importCategories,
  importUsers,
};
