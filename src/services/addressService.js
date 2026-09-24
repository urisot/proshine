// Dirección estructurada del cliente. Se guarda como objeto para poder
// imprimirla por partes en la nota de venta y exportarla en columnas.
const EMPTY_ADDRESS = {
  street: '',
  exteriorNumber: '',
  interiorNumber: '',
  neighborhood: '',
  city: '',
  state: '',
  postalCode: '',
};

const ADDRESS_FIELDS = [
  { key: 'street', label: 'Calle', required: true },
  { key: 'exteriorNumber', label: 'Número Exterior', required: true },
  { key: 'interiorNumber', label: 'Número Interior', required: false },
  { key: 'neighborhood', label: 'Colonia', required: true },
  { key: 'city', label: 'Ciudad', required: true },
  { key: 'state', label: 'Estado', required: true },
  { key: 'postalCode', label: 'Código Postal', required: true },
];

function trimValue(value) {
  return String(value ?? '').trim();
}

// Acepta el formato antiguo (dirección en una sola cadena) para no perder
// los datos de las cuentas registradas antes de este cambio.
function normalizeAddress(address) {
  if (typeof address === 'string') {
    return { ...EMPTY_ADDRESS, street: address.trim() };
  }
  if (!address || typeof address !== 'object') {
    return { ...EMPTY_ADDRESS };
  }

  const normalized = { ...EMPTY_ADDRESS };
  ADDRESS_FIELDS.forEach((field) => {
    normalized[field.key] = trimValue(address[field.key]);
  });
  return normalized;
}

// Domicilio sin ciudad ni estado, como el renglón "Domicilio" de la nota de venta.
// Ejemplo: "Av. Reforma 250 Int. 4B, Col. Juárez, C.P. 06600"
function formatStreetLine(address) {
  const parts = normalizeAddress(address);
  const street = [
    parts.street,
    parts.exteriorNumber,
    parts.interiorNumber ? `Int. ${parts.interiorNumber}` : '',
  ]
    .filter((part) => part !== '')
    .join(' ');

  return [
    street,
    parts.neighborhood ? `Col. ${parts.neighborhood}` : '',
    parts.postalCode ? `C.P. ${parts.postalCode}` : '',
  ]
    .filter((part) => part !== '')
    .join(', ');
}

// Dirección completa en una línea, para tablas y listados.
function formatAddress(address) {
  const parts = normalizeAddress(address);
  return [formatStreetLine(address), parts.city, parts.state].filter((part) => part !== '').join(', ');
}

// "Frontera, Coahuila" para el renglón Ciudad de la nota de venta.
function formatCityState(address) {
  const parts = normalizeAddress(address);
  return [parts.city, parts.state].filter((part) => part !== '').join(', ');
}

function getMissingRequired(address) {
  const parts = normalizeAddress(address);
  return ADDRESS_FIELDS.filter((field) => field.required && parts[field.key] === '').map(
    (field) => field.label
  );
}

export {
  EMPTY_ADDRESS,
  ADDRESS_FIELDS,
  normalizeAddress,
  formatStreetLine,
  formatAddress,
  formatCityState,
  getMissingRequired,
};
