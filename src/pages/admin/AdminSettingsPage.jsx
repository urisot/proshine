import { useState } from 'react';
import * as settingsService from '../../services/settingsService.js';
import { useToast } from '../../context/ToastContext.jsx';
import Logo from '../../components/common/Logo.jsx';
import Icon from '../../components/common/Icon.jsx';

const INPUT_CLASS = 'w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high';

function AdminSettingsPage() {
  const [form, setForm] = useState(() => settingsService.get());
  const { showToast } = useToast();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    settingsService.save(form);
    showToast('Preferencias de la tienda guardadas con éxito.');
  }

  return (
    <main className="lg:pl-72 pt-20 bg-surface min-h-screen px-space-md lg:px-space-lg py-space-md">
      <div className="flex flex-col gap-space-lg max-w-4xl">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Configuración General</span>
          <h1 className="font-display text-headline-lg text-on-surface tracking-tight">Preferencias de la Tienda</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Datos de contacto, parámetros de venta y canal de pedidos por WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-space-md glass-panel p-space-md rounded-xl shadow-md animate-fade-up">
          <Logo className="h-16" />
          <div className="flex flex-col">
            <span className="font-title-md text-title-md text-on-surface">Identidad de Marca</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Logotipo institucional aplicado en tienda, acceso y panel administrativo.
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <section className="flex flex-col gap-space-md glass-panel p-space-md rounded-xl shadow-md">
            <h2 className="flex items-center gap-space-xs font-display text-headline-sm text-on-surface">
              <Icon name="building" className="w-5 h-5 text-secondary" />
              Datos de la Empresa
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1">
                <label htmlFor="storeName" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Nombre Comercial
                </label>
                <input id="storeName" name="storeName" type="text" required value={form.storeName} onChange={handleChange} className={INPUT_CLASS} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="storeEmail" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Correo de Contacto
                </label>
                <input id="storeEmail" name="storeEmail" type="email" value={form.storeEmail} onChange={handleChange} className={INPUT_CLASS} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="storePhone" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Teléfono de Ventas
                </label>
                <input id="storePhone" name="storePhone" type="tel" value={form.storePhone} onChange={handleChange} className={INPUT_CLASS} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="storeAddress" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Dirección / Planta
                </label>
                <input id="storeAddress" name="storeAddress" type="text" value={form.storeAddress} onChange={handleChange} className={INPUT_CLASS} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="storeCity" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Ciudad y Estado
                </label>
                <input id="storeCity" name="storeCity" type="text" value={form.storeCity} onChange={handleChange} className={INPUT_CLASS} />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-space-md glass-panel p-space-md rounded-xl shadow-md">
            <h2 className="flex items-center gap-space-xs font-display text-headline-sm text-on-surface">
              <Icon name="chat" className="w-5 h-5 text-secondary" />
              Canal de Pedidos
            </h2>
            <div className="flex flex-col gap-1">
              <label htmlFor="whatsappNumber" className="font-label-sm text-label-sm text-secondary uppercase">
                Número de WhatsApp para Recepción de Pedidos
              </label>
              <input
                id="whatsappNumber"
                name="whatsappNumber"
                type="text"
                required
                value={form.whatsappNumber}
                onChange={handleChange}
                placeholder="521234567890"
                className={INPUT_CLASS}
              />
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Formato internacional sin espacios ni signos. Ejemplo para México: 52 + 10 dígitos.
              </span>
            </div>
          </section>

          <section className="flex flex-col gap-space-md glass-panel p-space-md rounded-xl shadow-md">
            <h2 className="flex items-center gap-space-xs font-display text-headline-sm text-on-surface">
              <Icon name="money" className="w-5 h-5 text-secondary" />
              Parámetros de Venta
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div className="flex flex-col gap-1">
                <label htmlFor="taxRate" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Tasa de IVA (%)
                </label>
                <input id="taxRate" name="taxRate" type="number" min="0" max="100" step="0.01" value={form.taxRate} onChange={handleChange} className={INPUT_CLASS} />
                <span className="font-body-sm text-body-sm text-on-surface-variant">Se aplica al generar la remisión.</span>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="freeShippingThreshold" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Monto Mínimo para Envío Gratis ($)
                </label>
                <input
                  id="freeShippingThreshold"
                  name="freeShippingThreshold"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.freeShippingThreshold}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                />
                <span className="font-body-sm text-body-sm text-on-surface-variant">Se muestra como promoción en el catálogo.</span>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="flex items-center gap-space-xs px-space-xl py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-lg text-label-lg shadow-lg bevel-top"
            >
              <Icon name="check" className="w-4 h-4" />
              Guardar Preferencias
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default AdminSettingsPage;
