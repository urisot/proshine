import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAll as getAllOrders, getSalesSummary, getTotals } from '../../services/orderService.js';
import { getAll as getAllProducts, getStockLevel } from '../../services/productService.js';
import { getAll as getAllCategories } from '../../services/categoryService.js';
import { getAll as getAllUsers } from '../../services/userService.js';
import { downloadOrdersReport } from '../../services/remisionService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Icon from '../../components/common/Icon.jsx';

const STATUS_META = {
  pendiente: { label: 'Pendiente', badge: 'bg-[#422006] text-[#fde047]', bar: 'bg-[#fde047]' },
  confirmado: { label: 'Confirmado', badge: 'bg-[#082f49] text-[#7dd3fc]', bar: 'bg-[#7dd3fc]' },
  en_transito: { label: 'En Tránsito', badge: 'bg-[#3b0764] text-[#d8b4fe]', bar: 'bg-[#d8b4fe]' },
  terminado: { label: 'Terminado', badge: 'bg-[#022c22] text-[#6ee7b7]', bar: 'bg-[#6ee7b7]' },
  cancelado: { label: 'Cancelado', badge: 'bg-[#450a0a] text-[#fca5a5]', bar: 'bg-[#fca5a5]' },
};

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const SECTOR_COLORS = ['bg-secondary', 'bg-primary', 'bg-tertiary-fixed', 'bg-secondary-fixed', 'bg-tertiary'];

function formatCurrency(value) {
  return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function KpiCard({ label, icon, tone, value, caption, footer }) {
  return (
    <article className="glass-panel rounded-xl p-space-md shadow-md flex flex-col justify-between lift-hover">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{label}</span>
        <span className={`w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center bevel-top ${tone}`}>
          <Icon name={icon} />
        </span>
      </div>
      <div className="my-space-sm">
        <span className="font-display text-headline-lg text-on-surface tracking-tight font-bold">{value}</span>
        <span className="font-label-sm text-label-sm text-on-surface-variant block mt-1">{caption}</span>
      </div>
      {footer}
    </article>
  );
}

function AdminDashboardPage() {
  const [orders] = useState(() => getAllOrders());
  const [products] = useState(() => getAllProducts());
  const [categories] = useState(() => getAllCategories());
  const [users] = useState(() => getAllUsers());
  const summary = useMemo(() => getSalesSummary(), []);
  const { showToast } = useToast();

  const criticalProducts = products.filter((product) => getStockLevel(product) === 'Crítico');
  const clientCount = users.filter((user) => user.role === 'cliente').length;

  const weeklySales = useMemo(() => {
    const buckets = WEEKDAYS.map((label) => ({ label, total: 0 }));
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    orders
      .filter((order) => order.status !== 'cancelado' && new Date(order.createdAt).getTime() >= weekAgo)
      .forEach((order) => {
        buckets[new Date(order.createdAt).getDay()].total += getTotals(order).total;
      });

    const max = Math.max(...buckets.map((bucket) => bucket.total), 1);
    return buckets.map((bucket) => ({ ...bucket, percent: Math.round((bucket.total / max) * 100) }));
  }, [orders]);

  const bestDay = weeklySales.reduce((best, bucket) => (bucket.total > best.total ? bucket : best), weeklySales[0]);

  const salesBySector = useMemo(() => {
    const productSector = {};
    products.forEach((product) => {
      const category = categories.find((item) => item.id === product.categoryId);
      productSector[product.id] = category?.sector || 'Otros';
    });

    const totals = {};
    orders
      .filter((order) => order.status !== 'cancelado')
      .forEach((order) => {
        order.items.forEach((item) => {
          const sector = productSector[item.productId] || 'Otros';
          totals[sector] = (totals[sector] || 0) + item.unitPrice * item.quantity;
        });
      });

    const grandTotal = Object.values(totals).reduce((sum, value) => sum + value, 0) || 1;
    return Object.entries(totals)
      .map(([sector, total]) => ({ sector, total, percent: Math.round((total / grandTotal) * 100) }))
      .sort((a, b) => b.total - a.total);
  }, [orders, products, categories]);

  const maxStatusCount = Math.max(...Object.values(summary.byStatus), 1);

  function handleExport(event) {
    event.preventDefault();
    downloadOrdersReport(orders);
    showToast('Reporte de pedidos descargado en formato CSV.');
  }

  return (
    <main className="lg:pl-72 pt-20 bg-surface min-h-screen px-space-md lg:px-space-lg py-space-md pb-space-xl">
      <div className="flex flex-col gap-space-lg">
        <section className="relative overflow-hidden rounded-xl glass-panel-strong p-space-lg shadow-xl animate-fade-up">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-space-md z-10">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="px-space-sm py-0.5 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                  Modo Privado • Nivel 1
                </span>
                <span className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" /> Datos sincronizados
                </span>
              </div>
              <h1 className="font-display text-headline-lg text-on-surface tracking-tight">Panel Administrativo</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Resumen general de ventas y pedidos •{' '}
                {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-space-sm flex-wrap">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg shadow-sm transition-colors"
              >
                <Icon name="download" className="w-4 h-4" />
                Exportar Reporte
              </button>
              <Link
                to="/admin/pedidos"
                className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-[0_0_2rem_rgba(0,112,243,0.35)] bevel-top"
              >
                <Icon name="truck" className="w-4 h-4" />
                Gestionar Pedidos
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md stagger">
          <KpiCard
            label="Ventas Totales"
            icon="money"
            tone="text-secondary"
            value={formatCurrency(summary.totalSales)}
            caption="MXN Netos Consolidados"
            footer={<span className="font-label-md text-label-md text-secondary-fixed">Excluye cancelados</span>}
          />
          <KpiCard
            label="Pedidos Registrados"
            icon="truck"
            tone="text-primary"
            value={summary.totalOrders}
            caption="Despachos totales"
            footer={
              <span className="flex items-center gap-space-xs font-label-md text-label-md text-secondary">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                {summary.byStatus.pendiente} por confirmar
              </span>
            }
          />
          <KpiCard
            label="Productos Activos"
            icon="flask"
            tone="text-secondary-fixed"
            value={products.length}
            caption="Fórmulas e Insumos"
            footer={
              <span className="flex items-center gap-space-xs font-label-md text-label-md text-error">
                <Icon name="alert" className="w-4 h-4" />
                {criticalProducts.length} en stock crítico
              </span>
            }
          />
          <KpiCard
            label="Clientes Registrados"
            icon="users"
            tone="text-primary-fixed"
            value={clientCount}
            caption="Directorio B2B / Hogar"
            footer={
              <Link to="/admin/usuarios" className="flex items-center gap-1 font-label-md text-label-md text-secondary hover:underline">
                Gestionar accesos <Icon name="chevronRight" className="w-3 h-3" />
              </Link>
            }
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
          <div className="lg:col-span-8 rounded-xl glass-panel p-space-md shadow-md flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
              <div>
                <h2 className="font-display text-headline-sm text-on-surface">Rendimiento Semanal</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Ingresos de los últimos 7 días (MXN)</p>
              </div>
              {bestDay?.total > 0 && (
                <span className="px-space-sm py-space-xs rounded-lg bg-surface-container-high font-label-sm text-label-sm text-secondary">
                  Mejor día: {bestDay.label} · {formatCurrency(bestDay.total)}
                </span>
              )}
            </div>
            <div className="relative w-full h-56 flex items-end justify-between gap-space-xs pt-6">
              {weeklySales.map((bucket) => {
                const isBest = bucket.total > 0 && bucket.total === bestDay.total;
                return (
                  <div key={bucket.label} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="font-label-sm text-label-sm text-secondary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(bucket.total)}
                    </span>
                    <div
                      className={`w-full max-w-[3.8rem] rounded-t-lg transition-all duration-500 ${
                        isBest
                          ? 'bg-gradient-to-t from-primary-container to-secondary-container shadow-[0_0_1.6rem_rgba(0,212,255,0.4)]'
                          : 'bg-surface-container-highest group-hover:bg-primary-container'
                      }`}
                      style={{ height: `${Math.max(bucket.percent, 3)}%` }}
                    />
                    <span className={`font-label-sm text-label-sm ${isBest ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>
                      {bucket.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4 rounded-xl glass-panel p-space-md shadow-md flex flex-col">
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <h2 className="font-display text-headline-sm text-on-surface">Ventas por Sector</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Volumen distribuido</p>
              </div>
              <Icon name="dashboard" className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex flex-col gap-space-sm">
              {salesBySector.length === 0 && (
                <span className="font-body-sm text-body-sm text-on-surface-variant">Sin ventas registradas todavía.</span>
              )}
              {salesBySector.map((entry, index) => (
                <div key={entry.sector} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between font-label-md text-label-md">
                    <span className="text-on-surface">{entry.sector}</span>
                    <span className="text-secondary font-bold">{entry.percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className={`${SECTOR_COLORS[index % SECTOR_COLORS.length]} h-full rounded-full transition-all duration-700`}
                      style={{ width: `${entry.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
          <div className="lg:col-span-4 rounded-xl glass-panel p-space-md shadow-md flex flex-col gap-space-md">
            <h2 className="font-display text-headline-sm text-on-surface">Pedidos por Estatus</h2>
            <div className="flex flex-col gap-space-sm">
              {Object.entries(summary.byStatus).map(([status, count]) => (
                <div key={status} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className={`px-space-sm py-0.5 rounded-full font-label-sm text-label-sm uppercase font-bold ${STATUS_META[status].badge}`}>
                      {STATUS_META[status].label}
                    </span>
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">{count}</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className={`${STATUS_META[status].bar} h-full rounded-full transition-all duration-700`}
                      style={{ width: `${(count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 rounded-xl glass-panel p-space-md shadow-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-headline-sm text-on-surface">Pedidos Recientes</h2>
              <Link to="/admin/pedidos" className="font-label-md text-label-md text-secondary hover:underline">
                Ver todos
              </Link>
            </div>
            <div className="flex flex-col gap-space-xs">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-space-sm p-space-sm rounded-lg bg-surface-container/60">
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-lg text-label-lg text-secondary font-bold">{order.id}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{order.customerName}</span>
                  </div>
                  <span className="font-title-md text-title-md text-on-surface font-semibold shrink-0">
                    {formatCurrency(getTotals(order).total)}
                  </span>
                </div>
              ))}
              {orders.length === 0 && (
                <span className="font-body-sm text-body-sm text-on-surface-variant">No hay pedidos registrados.</span>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 rounded-xl glass-panel p-space-md shadow-md flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="w-8 h-8 rounded-lg bg-error-container/30 flex items-center justify-center text-error">
                <Icon name="alert" className="w-4 h-4" />
              </span>
              <h2 className="font-display text-headline-sm text-on-surface">Alertas de Stock</h2>
            </div>
            <div className="flex flex-col gap-space-xs">
              {criticalProducts.length === 0 && (
                <span className="font-body-sm text-body-sm text-on-surface-variant">Sin alertas de stock por el momento.</span>
              )}
              {criticalProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-space-sm p-space-xs rounded bg-surface-container/60">
                  <span className="font-body-sm text-body-sm text-on-surface truncate">{product.name}</span>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-error-container text-on-error-container font-bold shrink-0">
                    {product.stock}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/admin/productos" className="flex items-center gap-1 font-label-md text-label-md text-secondary hover:underline mt-auto">
              Reabastecer inventario <Icon name="chevronRight" className="w-3 h-3" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminDashboardPage;
