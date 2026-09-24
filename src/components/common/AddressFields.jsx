// Campos de la dirección estructurada. Se reutiliza en el registro público
// y en el formulario de usuarios del panel administrativo.
function AddressFields({ idPrefix, address, onChange, inputClass, labelClass }) {
  function handleChange(event) {
    const { name, value } = event.target;
    onChange({ ...address, [name]: value });
  }

  function renderField(key, label, { required = false, placeholder = '', type = 'text' } = {}) {
    const id = `${idPrefix}-${key}`;
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <input
          id={id}
          name={key}
          type={type}
          required={required}
          value={address[key]}
          onChange={handleChange}
          placeholder={placeholder}
          className={inputClass}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-sm">
      {renderField('street', 'Calle', { required: true, placeholder: 'Av. Reforma' })}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
        {renderField('exteriorNumber', 'Número Exterior', { required: true, placeholder: '250' })}
        {renderField('interiorNumber', 'Número Interior', { placeholder: 'Opcional' })}
        {renderField('postalCode', 'Código Postal', { required: true, placeholder: '06600' })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
        {renderField('neighborhood', 'Colonia', { required: true, placeholder: 'Juárez' })}
        {renderField('city', 'Ciudad', { required: true, placeholder: 'Frontera' })}
        {renderField('state', 'Estado', { required: true, placeholder: 'Coahuila' })}
      </div>
    </div>
  );
}

export default AddressFields;
