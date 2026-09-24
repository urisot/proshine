// Convierte importes a letra para el renglón "IMPORTE CON LETRA" de la nota de venta.
const UNITS = [
  '', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
  'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE',
  'DIECIOCHO', 'DIECINUEVE', 'VEINTE',
];

const TENS = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];

const HUNDREDS = [
  '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
  'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS',
];

function tensToWords(number) {
  if (number <= 20) {
    return UNITS[number];
  }
  const ten = Math.floor(number / 10);
  const unit = number % 10;
  if (unit === 0) {
    return TENS[ten];
  }
  if (ten === 2) {
    return `VEINTI${UNITS[unit]}`;
  }
  return `${TENS[ten]} Y ${UNITS[unit]}`;
}

function hundredsToWords(number) {
  if (number === 100) {
    return 'CIEN';
  }
  const hundred = Math.floor(number / 100);
  const rest = number % 100;
  const parts = [HUNDREDS[hundred], tensToWords(rest)].filter((part) => part !== '');
  return parts.join(' ');
}

function thousandsToWords(number) {
  const thousands = Math.floor(number / 1000);
  const rest = number % 1000;
  const parts = [];

  if (thousands === 1) {
    parts.push('MIL');
  } else if (thousands > 1) {
    parts.push(`${hundredsToWords(thousands)} MIL`);
  }

  if (rest > 0) {
    parts.push(hundredsToWords(rest));
  }

  return parts.join(' ');
}

function integerToWords(number) {
  if (number === 0) {
    return 'CERO';
  }
  if (number < 1000) {
    return hundredsToWords(number);
  }
  if (number < 1000000) {
    return thousandsToWords(number);
  }

  const millions = Math.floor(number / 1000000);
  const rest = number % 1000000;
  const prefix = millions === 1 ? 'UN MILLÓN' : `${hundredsToWords(millions)} MILLONES`;
  return rest > 0 ? `${prefix} ${thousandsToWords(rest)}` : prefix;
}

// Ejemplo: 1667 -> "MIL SEISCIENTOS SESENTA Y SIETE PESOS 00/100 M.N."
function amountToWords(amount) {
  const rounded = Math.round(Number(amount) * 100) / 100;
  const pesos = Math.floor(rounded);
  const cents = Math.round((rounded - pesos) * 100);
  const currency = pesos === 1 ? 'PESO' : 'PESOS';
  // Ante un sustantivo se apocopa: "UN PESO", "VEINTIÚN PESOS".
  const words = integerToWords(pesos).replace(/UNO$/, 'UN').replace(/VEINTIUN$/, 'VEINTIÚN');
  return `${words} ${currency} ${String(cents).padStart(2, '0')}/100 M.N.`;
}

export { amountToWords, integerToWords };
