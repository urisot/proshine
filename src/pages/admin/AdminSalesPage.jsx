import { useEffect, useRef, useState } from 'react';
import * as productService from '../../services/productService.js';
import * as categoryService from '../../services/categoryService.js';
import * as userService from '../../services/userService.js';
import * as settingsService from '../../services/settingsService.js';
import * as saleService from '../../services/saleService.js';
import { printRemision } from '../../services/remisionService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import ProductSearchModal from '../../components/admin/ProductSearchModal.jsx';
import CustomerSearchModal from '../../components/admin/CustomerSearchModal.jsx';
import SaleCartTable from '../../components/admin/SaleCartTable.jsx';
import SaleCheckoutPanel from '../../components/admin/SaleCheckoutPanel.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Icon from '../../components/common/Icon.jsx';

const SHORTCUTS = [
  { key: 'ENTER', label: 'Capturar SKU' },
  { key: 'F2', label: 'Buscar productos' },
  { key: 'F12', label: 'Cobrar venta' },
  { key: 'ESC', label: 'Cancelar venta' },
];

function AdminSalesPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [taxRate, setTaxRate] = useState(16);
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [cashReceived, setCashReceived] = useState('');
  const [skuInput, setSkuInput] = useState('');
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const skuInputRef = useRef(null);
  const { showToast } = useToast();
  const { session } = useAuth();

  const totals = saleService.calculateTotals(items, taxRate);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isAnyModalOpen = isProductSearchOpen || isCustomerSearchOpen || isCancelOpen;

  async function loadProducts() {
    setProducts(await productService.getAll());
  }

  useEffect(() => {
    Promise.all([
      productService.getAll(),
      categoryService.getAll(),
      userService.getAll(),
      settingsService.get(),
    ])
      .then(([productList, categoryList, userList, settings]) => {
        setProducts(productList);
        setCategories(categoryList);
        setCustomers(userList.filter((user) => user.role === 'cliente'));
        setTaxRate(settings.taxRate);
      })
      .catch(() => showToast('No se pudieron cargar los datos del punto de venta.', 'error'));
  }, [showToast]);

  function addProduct(product) {
    const current = items.find((item) => item.productId === product.id);
    const nextQuantity = (current?.quantity || 0) + 1;
    if (nextQuantity > product.stock) {
      showToast(`Sin stock suficiente de ${product.name} (disponible: ${product.stock}).`, 'error');
      return;
    }

    if (current) {
      setItems(items.map((item) => (item.productId === product.id ? { ...item, quantity: nextQuantity } : item)));
    } else {
      setItems([...items, saleService.createItem(product)]);
    }
    showToast(`${product.name} agregado a la venta.`);
  }

  function changeQuantity(productId, quantity) {
    if (quantity < 1) {
      return;
    }
    const product = products.find((candidate) => candidate.id === productId);
    if (product && quantity > product.stock) {
      showToast(`Solo hay ${product.stock} unidades de ${product.name} en almacén.`, 'error');
      return;
    }
    setItems(items.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
  }

  function removeItem(productId) {
    setItems(items.filter((item) => item.productId !== productId));
  }

  function handleSkuSubmit(event) {
    event.preventDefault();
    const sku = skuInput.trim().toLowerCase();
    if (!sku) {
      return;
    }
    const product = products.find((candidate) => candidate.sku.trim().toLowerCase() === sku);
    if (!product) {
      showToast(`No existe un producto con el SKU "${skuInput.trim()}".`, 'error');
    } else {
      addProduct(product);
    }
    setSkuInput('');
    skuInputRef.current?.focus();
  }

  function handleAddFromSearch(product) {
    addProduct(product);
    setIsProductSearchOpen(false);
    skuInputRef.current?.focus();
  }

  function handleSelectCustomer(selected) {
    setCustomer(selected);
    setIsCustomerSearchOpen(false);
    showToast(`Cliente: ${selected ? selected.name : saleService.GENERAL_CUSTOMER_NAME}.`);
  }

  function resetSale() {
    setItems([]);
    setCustomer(null);
    setPaymentMethod('efectivo');
    setCashReceived('');
  }

  function handleConfirmCancel() {
    resetSale();
    setIsCancelOpen(false);
    showToast('Venta cancelada.');
    skuInputRef.current?.focus();
  }

  function requestCancel() {
    if (items.length === 0 && !customer) {
      return;
    }
    setIsCancelOpen(true);
  }

  async function handleCheckout() {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      const result = await saleService.register({
        customer,
        items,
        paymentMethod,
        cashReceived,
        taxRate,
        seller: session,
      });
      if (!result.success) {
        showToast(result.message, 'error');
        return;
      }
      showToast(`Venta ${result.sale.folio} registrada por $${result.sale.grandTotal.toFixed(2)}.`);
      resetSale();
      await printRemision(result.sale);
      await loadProducts();
    } catch (error) {
      showToast(error.message || 'No se pudo registrar la venta. Intenta de nuevo.', 'error');
      await loadProducts();
    } finally {
      setIsSaving(false);
    }
  }

  // Atajos de teclado. Se registran en cada render para usar el estado actual.
  // Con un modal abierto, ESC lo maneja el propio modal.
  useEffect(() => {
    function handleKeyDown(event) {
      if (isAnyModalOpen) {
        return;
      }
      if (event.key === 'F2') {
        event.preventDefault();
        setIsProductSearchOpen(true);
      } else if (event.key === 'F12') {
        event.preventDefault();
        handleCheckout();
      } else if (event.key === 'Escape') {
        requestCancel();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <main className="pt-20 bg-surface min-h-screen px-space-md lg:px-space-lg py-space-md pb-space-xl">
      <div className="flex flex-col gap-space-lg">
        <div className="flex flex-col gap-1 animate-fade-up">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Ventas de Mostrador</span>
          <h1 className="font-display text-headline-lg text-on-surface tracking-tight">Punto de Venta</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Captura productos por SKU o búsqueda, asigna el cliente y registra el cobro.
          </p>
        </div>

        <section className="w-full rounded-xl bg-surface-container-low p-space-md shadow-md flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm min-w-0">
            <span className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary shrink-0">
              <Icon name="user" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Cliente</span>
              <span className="font-title-md text-title-md text-on-surface truncate">
                {customer ? customer.name : saleService.GENERAL_CUSTOMER_NAME}
              </span>
              {customer && (
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {[customer.phone, customer.rfc].filter(Boolean).join(' • ') || customer.email}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              type="button"
              onClick={() => setIsCustomerSearchOpen(true)}
              className="px-space-md py-space-xs rounded-lg bg-surface-container-highest hover:bg-surface-bright text-secondary font-label-md text-label-md flex items-center gap-space-xs transition-colors shadow-sm"
            >
              <Icon name="users" className="w-4 h-4" />
              Buscar Cliente
            </button>
            {customer && (
              <button
                type="button"
                onClick={() => handleSelectCustomer(null)}
                className="px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-label-md flex items-center gap-space-xs transition-colors"
              >
                <Icon name="close" className="w-4 h-4" />
                Quitar Cliente
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsProductSearchOpen(true)}
              className="px-space-md py-space-xs rounded-lg bg-surface-container-highest hover:bg-surface-bright text-secondary font-label-md text-label-md flex items-center gap-space-xs transition-colors shadow-sm"
            >
              <Icon name="search" className="w-4 h-4" />
              Búsqueda Avanzada [F2]
            </button>
          </div>
        </section>

        <section className="w-full rounded-xl bg-surface-container p-space-md shadow-md">
          <form className="flex flex-col md:flex-row items-stretch gap-space-sm" onSubmit={handleSkuSubmit}>
            <label htmlFor="skuInput" className="sr-only">
              Código de barras o SKU
            </label>
            <div className="relative flex-1 flex items-center">
              <Icon name="barcode" className="absolute left-4 w-6 h-6 text-secondary pointer-events-none" />
              <input
                id="skuInput"
                ref={skuInputRef}
                autoFocus
                type="text"
                value={skuInput}
                onChange={(event) => setSkuInput(event.target.value)}
                placeholder="Escanea el código de barras o teclea el SKU del producto..."
                className="w-full pl-14 pr-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline font-display text-title-lg focus:outline-none focus:ring-1 focus:ring-secondary-container transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-space-lg py-space-sm rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-md hover:bg-secondary-container hover:text-on-secondary transition-all"
            >
              <Icon name="plus" className="w-4 h-4" />
              [ENTER] Capturar
            </button>
          </form>
        </section>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            <div className="rounded-xl bg-surface-container-low p-space-md flex items-center justify-between gap-space-sm shadow-sm">
              <div className="flex items-center gap-space-sm min-w-0">
                <span className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary shrink-0">
                  <Icon name="cart" />
                </span>
                <h2 className="font-display text-headline-sm tracking-tight text-on-surface leading-tight">Venta Activa</h2>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="px-space-sm py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant font-bold uppercase">
                  {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
                </span>
                <button
                  type="button"
                  onClick={requestCancel}
                  disabled={items.length === 0}
                  title="Vaciar venta"
                  aria-label="Vaciar venta"
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-surface-container-highest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icon name="trash" />
                </button>
              </div>
            </div>

            <SaleCartTable items={items} onChangeQuantity={changeQuantity} onRemove={removeItem} />
          </div>

          <div className="lg:col-span-4">
            <SaleCheckoutPanel
              totals={totals}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              cashReceived={cashReceived}
              onCashReceivedChange={setCashReceived}
              isSaving={isSaving}
              onCheckout={handleCheckout}
              onCancel={requestCancel}
            />
          </div>
        </div>

        <footer className="w-full rounded-xl bg-surface-container-low p-space-md shadow-sm flex flex-wrap items-center gap-space-md font-label-md text-label-md text-on-surface-variant">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 rounded bg-surface-container text-secondary font-mono">{shortcut.key}</kbd>
              <span>{shortcut.label}</span>
            </div>
          ))}
        </footer>
      </div>

      <ProductSearchModal
        isOpen={isProductSearchOpen}
        products={products}
        categories={categories}
        onClose={() => setIsProductSearchOpen(false)}
        onAdd={handleAddFromSearch}
      />

      <CustomerSearchModal
        isOpen={isCustomerSearchOpen}
        customers={customers}
        onClose={() => setIsCustomerSearchOpen(false)}
        onSelect={handleSelectCustomer}
      />

      <ConfirmDialog
        isOpen={isCancelOpen}
        title="Cancelar venta"
        message="Se quitarán todos los productos y el cliente de la venta activa. ¿Deseas continuar?"
        confirmLabel="Cancelar venta"
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelOpen(false)}
      />
    </main>
  );
}

export default AdminSalesPage;
