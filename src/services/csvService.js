function escapeCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(headers, rows) {
  return [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');
}

function downloadCsv(filename, headers, rows) {
  // El BOM hace que Excel interprete los acentos correctamente.
  const blob = new Blob([`﻿${buildCsv(headers, rows)}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Parser que respeta comillas dobles escapadas y saltos de línea dentro de celdas.
function parseCsv(text) {
  const clean = text.replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let insideQuotes = false;
  let index = 0;

  while (index < clean.length) {
    const char = clean[index];

    if (insideQuotes) {
      if (char === '"') {
        if (clean[index + 1] === '"') {
          cell += '"';
          index += 2;
          continue;
        }
        insideQuotes = false;
        index += 1;
        continue;
      }
      cell += char;
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = true;
      index += 1;
      continue;
    }

    if (char === ',' || char === ';') {
      row.push(cell.trim());
      cell = '';
      index += 1;
      continue;
    }

    if (char === '\r') {
      index += 1;
      continue;
    }

    if (char === '\n') {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = '';
      index += 1;
      continue;
    }

    cell += char;
    index += 1;
  }

  row.push(cell.trim());
  rows.push(row);

  return rows.filter((entry) => entry.some((value) => value !== ''));
}

function normalizeHeader(header) {
  return header
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

// Convierte el CSV en objetos usando la primera fila como encabezados.
function parseCsvToObjects(text, columns) {
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { success: false, message: 'El archivo no contiene filas de datos.' };
  }

  const fileHeaders = rows[0].map(normalizeHeader);
  const missing = columns
    .filter((column) => column.required)
    .filter((column) => !fileHeaders.includes(normalizeHeader(column.header)));

  if (missing.length > 0) {
    return {
      success: false,
      message: `Faltan columnas obligatorias: ${missing.map((column) => column.header).join(', ')}.`,
    };
  }

  const records = rows.slice(1).map((values) => {
    const record = {};
    columns.forEach((column) => {
      const position = fileHeaders.indexOf(normalizeHeader(column.header));
      record[column.key] = position === -1 ? '' : values[position] ?? '';
    });
    return record;
  });

  return { success: true, records };
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsText(file, 'UTF-8');
  });
}

function parseBoolean(value) {
  const normalized = normalizeHeader(String(value));
  return ['si', 'sí', 'true', '1', 'x', 'verdadero'].includes(normalized);
}

export { downloadCsv, parseCsv, parseCsvToObjects, readFileAsText, parseBoolean, normalizeHeader };
