import { get as getSettings } from './settingsService.js';
import { downloadCsv } from './csvService.js';
import { amountToWords } from './numberToWordsService.js';
import { formatStreetLine, formatCityState, formatAddress } from './addressService.js';
import { getTotals } from './orderService.js';

const STATUS_LABELS = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_transito: 'En Tránsito',
  terminado: 'Terminado',
  cancelado: 'Cancelado',
};

const LOGO_URL = `${import.meta.env.BASE_URL}logoProShine.jpeg`;

// Estilos de la nota de venta, copiados del formato "Remision 00001.docx".
// Se imprime en tamaño carta; el navegador permite guardarla como PDF.
const NOTE_STYLES = `
  @page { size: letter; margin: 1.5cm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 10px; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 1.4rem;
    color: #000;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .note { width: 100%; max-width: 72rem; margin: 0 auto; }

  .note-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 4rem; }
  .logo-box { flex: 1; max-width: 40rem; border: 0.1rem solid #000; padding: 0.6rem; margin-top: 1.2rem; }
  .logo-box img { display: block; width: 100%; }

  .folio-box { width: 17rem; border: 0.1rem solid #000; border-radius: 1rem; overflow: hidden; text-align: center; }
  .folio-box h1 { background: #4472c4; color: #fff; font-size: 1.4rem; padding: 0.7rem; }
  .folio-number { font-weight: bold; padding: 0.8rem; border-bottom: 0.1rem solid #000; }
  .date-table { width: 100%; border-collapse: collapse; }
  .date-table th, .date-table td { font-weight: normal; width: 33.33%; line-height: 1.2; text-align: center; }
  .date-table th { padding-top: 0.6rem; }
  .date-table td { padding-bottom: 0.2rem; }
  .date-table th + th, .date-table td + td { border-left: 0.1rem solid #000; }

  .customer { margin: 4rem 0 2rem; border: 0.1rem solid #000; border-radius: 1.4rem; padding: 0.4rem 1.2rem; font-size: 1.5rem; }
  .field { display: flex; align-items: flex-end; gap: 0.6rem; line-height: 1.3; }
  .field-value { flex: 1; font-weight: bold; border-bottom: 0.1rem solid #000; min-height: 1.9rem; }

  .items { width: 100%; border-collapse: separate; border-spacing: 0; text-align: center; }
  .items th { background: #4472c4; color: #fff; padding: 1rem 0.6rem; border-right: 0.1rem solid #000; }
  .items th:first-child { border-top-left-radius: 1rem; }
  .items th:last-child { border-top-right-radius: 1rem; border-right: 0; }
  .items td { height: 4.3rem; padding: 0 0.6rem; border-bottom: 0.1rem solid #000; border-right: 0.1rem solid #000; }
  .items td:first-child { border-left: 0.1rem solid #000; }
  .items .col-qty { width: 17%; }
  .items .col-price { width: 15%; }
  .items .col-amount { width: 18%; }
  .items .cell-left { text-align: left; padding-left: 1.2rem; }
  .items .cell-right { text-align: right; padding-right: 1.2rem; }
  .items tfoot td { text-align: left; height: 4.8rem; border-right: 0.1rem solid #000; border-bottom-left-radius: 1rem; border-bottom-right-radius: 1rem; }

  .note-footer { display: flex; align-items: flex-start; margin-top: 0.2rem; }
  .note-footer .phone { flex: 1; font-weight: bold; padding: 1rem 0 0 1.2rem; }
  .amounts { display: grid; grid-template-columns: 12rem 15.2rem; gap: 0.4rem 0; }
  .amounts dt, .amounts dd { border: 0.1rem solid #000; border-radius: 1rem; height: 3.6rem; display: flex; align-items: center; justify-content: center; }
  .amounts .total-label, .amounts .total-value { height: 4.6rem; }
  .amounts .total-value { font-size: 2rem; font-weight: bold; }
  .notes { margin-top: 2rem; font-size: 1.3rem; }

  /* La tabla crece con los artículos; si no cabe, el salto de página no parte renglones ni el desglose. */
  .items tr, .note-footer, .notes { break-inside: avoid; }
`;

function getFolio(order) {
  return order.folio || order.id;
}

// Formato de la plantilla: "$1,667" o "$13.05". Con centavos siempre van dos decimales.
function formatMoney(amount) {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return amount.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

function createElement(doc, tag, className, text) {
  const element = doc.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createField(doc, label, value) {
  const field = createElement(doc, 'p', 'field');
  field.appendChild(createElement(doc, 'span', '', label));
  field.appendChild(createElement(doc, 'span', 'field-value', value));
  return field;
}

function createHeader(doc, order) {
  const createdAt = new Date(order.createdAt);
  const header = createElement(doc, 'header', 'note-header');

  const logoBox = createElement(doc, 'figure', 'logo-box');
  const logo = createElement(doc, 'img');
  logo.src = LOGO_URL;
  logo.alt = 'ProShine Chemicals';
  logoBox.appendChild(logo);

  const folioBox = createElement(doc, 'section', 'folio-box');
  folioBox.appendChild(createElement(doc, 'h1', '', 'NOTA DE VENTA'));
  folioBox.appendChild(createElement(doc, 'p', 'folio-number', getFolio(order)));

  const dateTable = createElement(doc, 'table', 'date-table');
  const labelsRow = createElement(doc, 'tr');
  const valuesRow = createElement(doc, 'tr');
  const dateParts = [
    ['DIA', String(createdAt.getDate()).padStart(2, '0')],
    ['MES', String(createdAt.getMonth() + 1).padStart(2, '0')],
    ['AÑO', String(createdAt.getFullYear())],
  ];
  dateParts.forEach(([label, value]) => {
    labelsRow.appendChild(createElement(doc, 'th', '', label));
    valuesRow.appendChild(createElement(doc, 'td', '', value));
  });
  const dateHead = createElement(doc, 'thead');
  const dateBody = createElement(doc, 'tbody');
  dateHead.appendChild(labelsRow);
  dateBody.appendChild(valuesRow);
  dateTable.appendChild(dateHead);
  dateTable.appendChild(dateBody);
  folioBox.appendChild(dateTable);

  header.appendChild(logoBox);
  header.appendChild(folioBox);
  return header;
}

function createCustomer(doc, order) {
  const customer = createElement(doc, 'section', 'customer');
  customer.appendChild(createField(doc, 'Nombre:', order.customerName));
  customer.appendChild(createField(doc, 'Domicilio:', formatStreetLine(order.customerAddress)));

  const cityLine = createField(doc, 'Ciudad:', formatCityState(order.customerAddress));
  cityLine.appendChild(createElement(doc, 'span', '', 'R.F.C.'));
  cityLine.appendChild(createElement(doc, 'span', 'field-value', order.customerRfc || ''));
  customer.appendChild(cityLine);
  return customer;
}

function createItemsTable(doc, order, total) {
  const table = createElement(doc, 'table', 'items');

  const head = createElement(doc, 'thead');
  const headRow = createElement(doc, 'tr');
  [
    ['CANT.', 'col-qty'],
    ['DESCRIPCION', ''],
    ['P.U.', 'col-price'],
    ['IMPORTE', 'col-amount'],
  ].forEach(([label, className]) => {
    headRow.appendChild(createElement(doc, 'th', className, label));
  });
  head.appendChild(headRow);
  table.appendChild(head);

  const body = createElement(doc, 'tbody');
  order.items.forEach((item) => {
    const row = createElement(doc, 'tr');
    row.appendChild(createElement(doc, 'td', '', String(item.quantity)));
    row.appendChild(createElement(doc, 'td', 'cell-left', `${item.name} (${item.unit})`.toUpperCase()));
    row.appendChild(createElement(doc, 'td', 'cell-right', formatMoney(item.unitPrice)));
    row.appendChild(createElement(doc, 'td', 'cell-right', formatMoney(item.unitPrice * item.quantity)));
    body.appendChild(row);
  });

  table.appendChild(body);

  const foot = createElement(doc, 'tfoot');
  const footRow = createElement(doc, 'tr');
  const words = createElement(doc, 'td', '', `IMPORTE CON LETRA: ${amountToWords(total)}`);
  words.colSpan = 4;
  footRow.appendChild(words);
  foot.appendChild(footRow);
  table.appendChild(foot);

  return table;
}

// Desglose de importes igual que en "Mis pedidos": SUBTOTAL, IVA y TOTAL.
function createFooter(doc, settings, totals) {
  const footer = createElement(doc, 'footer', 'note-footer');
  footer.appendChild(createElement(doc, 'p', 'phone', settings.storePhone ? `TELEFONO: ${settings.storePhone}` : ''));

  const amounts = createElement(doc, 'dl', 'amounts');
  [
    ['SUBTOTAL', totals.subtotal, false],
    [`IVA (${totals.taxRate}%)`, totals.tax, false],
    ['TOTAL', totals.total, true],
  ].forEach(([label, amount, isTotal]) => {
    amounts.appendChild(createElement(doc, 'dt', isTotal ? 'total-label' : '', label));
    amounts.appendChild(createElement(doc, 'dd', isTotal ? 'total-value' : '', formatMoney(amount)));
  });
  footer.appendChild(amounts);
  return footer;
}

function buildNote(doc, order) {
  const settings = getSettings();
  const totals = getTotals(order);

  const note = createElement(doc, 'main', 'note');
  note.appendChild(createHeader(doc, order));
  note.appendChild(createCustomer(doc, order));
  note.appendChild(createItemsTable(doc, order, totals.total));
  note.appendChild(createFooter(doc, settings, totals));

  if (order.notes) {
    note.appendChild(createElement(doc, 'p', 'notes', `OBSERVACIONES: ${order.notes}`));
  }
  return note;
}

// Arma la nota en un iframe oculto y abre el diálogo de impresión,
// donde el usuario puede imprimirla o elegir "Guardar como PDF".
function printRemision(order) {
  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  document.body.appendChild(frame);

  const frameWindow = frame.contentWindow;
  const doc = frameWindow.document;
  doc.open();
  doc.close();

  // El navegador usa el título de la página como nombre sugerido del PDF: Nota_Venta_00021.pdf
  const fileName = `Nota_Venta_${getFolio(order)}`;
  const previousTitle = document.title;
  document.title = fileName;
  doc.title = fileName;
  const style = doc.createElement('style');
  style.textContent = NOTE_STYLES;
  doc.head.appendChild(style);
  doc.body.appendChild(buildNote(doc, order));

  frameWindow.addEventListener('afterprint', () => {
    document.title = previousTitle;
    frame.remove();
  });

  // Se espera al logo para que salga en la impresión.
  const logo = doc.querySelector('img');
  const print = () => frameWindow.print();
  if (logo.complete) {
    print();
  } else {
    logo.addEventListener('load', print);
    logo.addEventListener('error', print);
  }
}

function downloadOrdersReport(orders) {
  const headers = ['Folio', 'Cliente', 'Teléfono', 'RFC', 'Domicilio', 'Fecha', 'Estatus', 'Artículos', 'Total MXN'];
  const rows = orders.map((order) => [
    getFolio(order),
    order.customerName,
    order.customerPhone,
    order.customerRfc || '',
    formatAddress(order.customerAddress),
    new Date(order.createdAt).toLocaleString('es-MX'),
    STATUS_LABELS[order.status],
    order.items.reduce((sum, item) => sum + item.quantity, 0),
    getTotals(order).total.toFixed(2),
  ]);

  downloadCsv(`Reporte_Pedidos_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

export { printRemision, downloadOrdersReport, getFolio, STATUS_LABELS };
