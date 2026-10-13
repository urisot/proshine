import { useEffect, useRef, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Icon from '../common/Icon.jsx';

function CustomerSearchModal({ isOpen, customers, onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const term = searchTerm.trim().toLowerCase();
  const results = customers.filter((customer) =>
    [customer.name, customer.email, customer.phone, customer.rfc].some((value) =>
      (value || '').toLowerCase().includes(term)
    )
  );

  return (
    <Modal
      isOpen={isOpen}
      title="Búsqueda de Clientes"
      subtitle="Busca por nombre, correo, teléfono o R.F.C. del cliente registrado."
      icon="users"
      onClose={onClose}
      maxWidthClass="max-w-5xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Presiona [ESC] para cerrar la búsqueda.</span>
          <div className="flex flex-col sm:flex-row items-center gap-space-sm w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="w-full sm:w-auto px-space-md py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-secondary font-label-md text-label-md transition-colors"
            >
              Usar Público en General
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-space-md py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors"
            >
              Cerrar Ventana
            </button>
          </div>
        </div>
      }
    >
      <div className="relative flex items-center">
        <Icon name="search" className="absolute left-4 w-5 h-5 text-secondary pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar por nombre, correo, teléfono o R.F.C...."
          className="w-full pl-12 pr-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary-container"
        />
      </div>

      <div className="rounded-lg bg-surface-container-lowest overflow-hidden">
        <div className="overflow-auto w-full max-h-80">
          <table className="w-full text-left border-collapse min-w-[65rem]">
            <thead className="sticky top-0 bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase">
              <tr>
                <th className="py-space-xs px-space-md">Cliente</th>
                <th className="py-space-xs px-space-md">Teléfono</th>
                <th className="py-space-xs px-space-md">Correo</th>
                <th className="py-space-xs px-space-md">R.F.C.</th>
                <th className="py-space-xs px-space-md text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {results.map((customer) => (
                <tr key={customer.id} className="hover:bg-surface-container transition-colors">
                  <td className="py-space-sm px-space-md text-on-surface font-semibold">{customer.name}</td>
                  <td className="py-space-sm px-space-md text-on-surface-variant">{customer.phone || '—'}</td>
                  <td className="py-space-sm px-space-md text-on-surface-variant">{customer.email}</td>
                  <td className="py-space-sm px-space-md font-label-sm text-label-sm text-secondary uppercase">
                    {customer.rfc || '—'}
                  </td>
                  <td className="py-space-sm px-space-md text-center">
                    <button
                      type="button"
                      onClick={() => onSelect(customer)}
                      className="px-space-sm py-1 rounded bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold hover:bg-secondary-container hover:text-on-secondary transition-all"
                    >
                      Seleccionar
                    </button>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-space-lg text-center text-on-surface-variant">
                    No hay clientes que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

export default CustomerSearchModal;
