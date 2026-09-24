import { useRef, useState } from 'react';
import Icon from '../common/Icon.jsx';
import Modal from '../common/Modal.jsx';
import { useToast } from '../../context/ToastContext.jsx';

const BUTTON_CLASS =
  'flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-colors';

function DataToolbar({ entityLabel, columns, onExport, onDownloadTemplate, onImport, onImported }) {
  const fileInputRef = useRef(null);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [report, setReport] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const { showToast } = useToast();

  function handleExport(event) {
    event.preventDefault();
    onExport();
    showToast(`${entityLabel} exportados en formato CSV.`);
  }

  function handleTemplate(event) {
    event.preventDefault();
    onDownloadTemplate();
    showToast('Layout descargado. Llénalo y vuelve a importarlo.');
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsImporting(true);
    try {
      const result = await onImport(file);
      if (!result.success) {
        showToast(result.message, 'error');
      } else {
        setReport(result);
        onImported();
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsImporting(false);
      // Permite volver a elegir el mismo archivo tras corregirlo.
      event.target.value = '';
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-space-xs">
        <button
          type="button"
          onClick={handleExport}
          className={`${BUTTON_CLASS} bg-surface-container-high hover:bg-surface-container-highest text-on-surface`}
        >
          <Icon name="download" className="w-4 h-4" />
          Exportar Excel
        </button>

        <button
          type="button"
          onClick={() => setIsLayoutOpen(true)}
          className={`${BUTTON_CLASS} bg-surface-container hover:bg-surface-container-high text-secondary`}
        >
          <Icon name="document" className="w-4 h-4" />
          Layout
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className={`${BUTTON_CLASS} bg-surface-container hover:bg-surface-container-high text-on-surface disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Icon name="box" className="w-4 h-4" />
          {isImporting ? 'Importando...' : 'Importar'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="hidden"
          aria-label={`Importar ${entityLabel}`}
        />
      </div>

      <Modal
        isOpen={isLayoutOpen}
        title={`Layout de ${entityLabel}`}
        subtitle="Estructura del archivo para importación masiva"
        icon="document"
        onClose={() => setIsLayoutOpen(false)}
        maxWidthClass="max-w-2xl"
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-end gap-space-sm">
            <button
              type="button"
              onClick={() => setIsLayoutOpen(false)}
              className="w-full sm:w-auto px-space-md py-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleTemplate}
              className="w-full sm:w-auto flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-label-lg text-label-lg shadow-lg bevel-top"
            >
              <Icon name="download" className="w-4 h-4" />
              Descargar Layout Vacío
            </button>
          </div>
        }
      >
        <p className="font-body-md text-body-md text-on-surface-variant">
          Descarga el layout, captura tus registros respetando los nombres de las columnas y vuelve a importarlo. La
          primera fila del archivo debe conservar los encabezados.
        </p>

        <div className="overflow-x-auto rounded-lg bg-surface-container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                <th className="py-space-xs px-space-sm">Columna</th>
                <th className="py-space-xs px-space-sm">Obligatoria</th>
                <th className="py-space-xs px-space-sm">Ejemplo</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              {columns.map((column) => (
                <tr key={column.key} className="border-t border-surface-container-highest/20">
                  <td className="py-space-xs px-space-sm text-secondary font-bold">{column.header}</td>
                  <td className="py-space-xs px-space-sm">
                    <span
                      className={`px-space-sm py-0.5 rounded-full font-label-sm text-label-sm uppercase ${
                        column.required ? 'bg-error-container text-on-error-container' : 'bg-surface-container-highest text-on-surface-variant'
                      }`}
                    >
                      {column.required ? 'Sí' : 'Opcional'}
                    </span>
                  </td>
                  <td className="py-space-xs px-space-sm text-on-surface-variant">{column.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </Modal>

      <Modal
        isOpen={Boolean(report)}
        title="Resultado de la Importación"
        subtitle={entityLabel}
        icon={report?.errors.length ? 'alert' : 'check'}
        onClose={() => setReport(null)}
        maxWidthClass="max-w-xl"
        footer={
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setReport(null)}
              className="w-full sm:w-auto px-space-lg py-space-sm rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg shadow-md bevel-top"
            >
              Entendido
            </button>
          </div>
        }
      >
        {report && (
          <div className="flex flex-col gap-space-md">
            <div className="grid grid-cols-3 gap-space-sm">
              <div className="flex flex-col p-space-sm rounded-lg bg-surface-container">
                <span className="font-label-sm text-label-sm text-secondary uppercase">Creados</span>
                <span className="font-display text-headline-sm text-secondary">{report.created}</span>
              </div>
              <div className="flex flex-col p-space-sm rounded-lg bg-surface-container">
                <span className="font-label-sm text-label-sm text-primary uppercase">Actualizados</span>
                <span className="font-display text-headline-sm text-primary">{report.updated}</span>
              </div>
              <div className="flex flex-col p-space-sm rounded-lg bg-surface-container">
                <span className="font-label-sm text-label-sm text-error uppercase">Con error</span>
                <span className="font-display text-headline-sm text-error">{report.errors.length}</span>
              </div>
            </div>

            {report.errors.length > 0 && (
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-md text-label-md text-error uppercase">Filas no procesadas</span>
                <ul className="flex flex-col gap-1 p-space-sm rounded-lg bg-surface-container">
                  {report.errors.map((error) => (
                    <li key={error} className="font-body-sm text-body-sm text-on-surface-variant">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

export default DataToolbar;
