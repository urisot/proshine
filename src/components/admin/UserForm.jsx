import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import AddressFields from '../common/AddressFields.jsx';
import { EMPTY_ADDRESS, normalizeAddress } from '../../services/addressService.js';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  rfc: '',
  address: { ...EMPTY_ADDRESS },
  password: '',
  role: 'cliente',
};

const INPUT_CLASS = 'w-full px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none focus:bg-surface-container-high';

function UserForm({ isOpen, initialData, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        rfc: initialData.rfc || '',
        address: normalizeAddress(initialData.address),
        password: '',
        role: initialData.role,
      });
    } else {
      setForm({ ...EMPTY_FORM, address: { ...EMPTY_ADDRESS } });
    }
  }, [initialData, isOpen]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleAddressChange(address) {
    setForm((current) => ({ ...current, address }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <Modal
      isOpen={isOpen}
      title={initialData ? 'Editar Usuario' : 'Nuevo Usuario'}
      subtitle="Datos de acceso y rol asignado"
      icon="users"
      onClose={onClose}
      maxWidthClass="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-1">
            <label htmlFor="user-name" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Nombre Completo
            </label>
            <input id="user-name" name="name" type="text" required value={form.name} onChange={handleChange} className={INPUT_CLASS} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="user-email" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Correo Electrónico
            </label>
            <input id="user-email" name="email" type="email" required value={form.email} onChange={handleChange} className={INPUT_CLASS} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-1">
            <label htmlFor="user-phone" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Teléfono
            </label>
            <input id="user-phone" name="phone" type="tel" required value={form.phone} onChange={handleChange} className={INPUT_CLASS} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="user-role" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
              Rol Asignado
            </label>
            <select id="user-role" name="role" value={form.role} onChange={handleChange} className={`${INPUT_CLASS} cursor-pointer`}>
              <option value="cliente">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="user-rfc" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            R.F.C. (Opcional)
          </label>
          <input
            id="user-rfc"
            name="rfc"
            type="text"
            maxLength={13}
            value={form.rfc}
            onChange={handleChange}
            placeholder="XAXX010101000"
            className={`${INPUT_CLASS} uppercase`}
          />
        </div>

        <fieldset className="flex flex-col gap-space-sm">
          <legend className="font-label-sm text-label-sm text-secondary uppercase tracking-wider pb-space-xs">
            Dirección
          </legend>
          <AddressFields
            idPrefix="user-address"
            address={form.address}
            onChange={handleAddressChange}
            inputClass={INPUT_CLASS}
            labelClass="font-label-sm text-label-sm text-on-surface-variant uppercase"
          />
        </fieldset>

        <div className="flex flex-col gap-1">
          <label htmlFor="user-password" className="font-label-sm text-label-sm text-on-surface-variant uppercase">
            Contraseña
          </label>
          <input
            id="user-password"
            name="password"
            type="password"
            required={!initialData}
            minLength={6}
            value={form.password}
            onChange={handleChange}
            placeholder={initialData ? 'Dejar vacío para conservar la actual' : 'Mínimo 6 caracteres'}
            className={INPUT_CLASS}
          />
        </div>

        <div className="sticky bottom-0 flex flex-col sm:flex-row items-center justify-end gap-space-sm py-space-md bg-surface-container border-t border-surface-container-high">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-md text-label-md shadow-lg bevel-top"
          >
            Guardar Usuario
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default UserForm;
