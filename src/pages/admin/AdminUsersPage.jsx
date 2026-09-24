import { useState } from 'react';

import * as userService from '../../services/userService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import UserForm from '../../components/admin/UserForm.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Icon from '../../components/common/Icon.jsx';
import IconButton from '../../components/common/IconButton.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import DataToolbar from '../../components/admin/DataToolbar.jsx';
import * as bulkDataService from '../../services/bulkDataService.js';
import { formatAddress } from '../../services/addressService.js';

function AdminUsersPage() {
  const [users, setUsers] = useState(() => userService.getAll());
  const [modal, setModal] = useState({ isOpen: false, data: null });
  const [userToDelete, setUserToDelete] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const { showToast } = useToast();
  const { session } = useAuth();

  function handleSubmit(formData) {
    const result = modal.data ? userService.update(modal.data.id, formData) : userService.create(formData);

    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }

    setUsers(userService.getAll());
    setModal({ isOpen: false, data: null });
    showToast('Usuario guardado con éxito.');
  }

  function handleDelete() {
    const result = userService.remove(userToDelete.id);
    if (!result.success) {
      showToast(result.message, 'error');
    } else {
      setUsers(userService.getAll());
      showToast('Usuario eliminado.');
    }
    setUserToDelete(null);
  }

  const filteredUsers = users.filter((user) => roleFilter === 'all' || user.role === roleFilter);
  const adminCount = users.filter((user) => user.role === 'admin').length;

  return (
    <main className="lg:pl-72 pt-20 bg-surface min-h-screen px-space-md lg:px-space-lg py-space-md">
      <div className="flex flex-col gap-space-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Control de Acceso</span>
            <h1 className="font-display text-headline-lg text-on-surface tracking-tight">Gestión de Usuarios</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Administra cuentas de clientes y personal administrativo.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-space-sm">
            <div className="flex flex-col p-space-sm glass-panel rounded-xl shadow-md">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Total Cuentas</span>
              <span className="font-display text-headline-sm text-secondary mt-0.5">{users.length}</span>
            </div>
            <div className="flex flex-col p-space-sm glass-panel rounded-xl shadow-md">
              <span className="font-label-sm text-label-sm text-primary uppercase">Administradores</span>
              <span className="font-display text-headline-sm text-primary mt-0.5">{adminCount}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md glass-panel p-space-md rounded-xl shadow-md">
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="w-full sm:w-56 px-space-md py-space-sm rounded-lg bg-surface text-on-surface focus:outline-none cursor-pointer"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Solo Administradores</option>
            <option value="cliente">Solo Clientes</option>
          </select>
          <div className="flex flex-wrap items-center gap-space-xs">
            <DataToolbar
              entityLabel="Usuarios"
              columns={bulkDataService.USER_COLUMNS}
              onExport={() => bulkDataService.exportUsers(users)}
              onDownloadTemplate={bulkDataService.downloadUsersTemplate}
              onImport={bulkDataService.importUsers}
              onImported={() => setUsers(userService.getAll())}
            />
            <button
              type="button"
              onClick={() => setModal({ isOpen: true, data: null })}
              className="flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-md text-label-md shadow-lg bevel-top"
            >
              <Icon name="plus" className="w-4 h-4" />
              Nuevo Usuario
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto glass-panel rounded-xl shadow-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/60 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-space-md px-space-md">Usuario</th>
                <th className="py-space-md px-space-md">Contacto</th>
                <th className="py-space-md px-space-md">Rol</th>
                <th className="py-space-md px-space-md">Registro</th>
                <th className="py-space-md px-space-md text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container/50 transition-colors border-t border-surface-container-highest/20">
                  <td className="py-space-md px-space-md">
                    <div className="flex items-center gap-space-sm">
                      <span
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bevel-top ${
                          user.role === 'admin'
                            ? 'bg-primary-container text-on-primary-container'
                            : 'bg-surface-container-high text-secondary'
                        }`}
                      >
                        <Icon name={user.role === 'admin' ? 'shield' : 'user'} className="w-4 h-4" />
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-title-md text-title-md text-on-surface font-semibold truncate">
                          {user.name}
                          {user.id === session.id && (
                            <span className="ml-space-xs font-label-sm text-label-sm text-secondary">(tú)</span>
                          )}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex flex-col">
                      <span className="font-body-sm text-body-sm text-on-surface">{user.phone}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {formatAddress(user.address)}
                      </span>
                      {user.rfc && (
                        <span className="font-label-sm text-label-sm text-outline uppercase">R.F.C. {user.rfc}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-space-md px-space-md">
                    <span
                      className={`px-space-sm py-0.5 rounded-full font-label-sm text-label-sm uppercase font-bold ${
                        user.role === 'admin'
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                    </span>
                  </td>
                  <td className="py-space-md px-space-md text-on-surface-variant font-label-md text-label-md">
                    {new Date(user.createdAt).toLocaleDateString('es-MX')}
                  </td>
                  <td className="py-space-md px-space-md">
                    <div className="flex items-center justify-center gap-space-xs">
                      <IconButton
                        icon="edit"
                        label={`Editar a ${user.name}`}
                        onClick={() => setModal({ isOpen: true, data: user })}
                        variant="accent"
                      />
                      <IconButton
                        icon="trash"
                        label={user.id === session.id ? 'No puedes eliminar tu propia cuenta' : `Eliminar a ${user.name}`}
                        onClick={() => setUserToDelete(user)}
                        disabled={user.id === session.id}
                        variant="danger"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <EmptyState icon="users" title="Sin usuarios" message="No hay cuentas que coincidan con el filtro seleccionado." />
          )}
        </div>
      </div>

      <UserForm
        isOpen={modal.isOpen}
        initialData={modal.data}
        onClose={() => setModal({ isOpen: false, data: null })}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        title="Eliminar Usuario"
        message={`¿Confirmas que deseas eliminar la cuenta de "${userToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </main>
  );
}

export default AdminUsersPage;
