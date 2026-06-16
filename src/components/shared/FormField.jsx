import React from 'react';

function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  options = [], // for select
  rows = 3, // for textarea
  min,
  max,
  step,
  className = ''
}) {
  const inputClasses = `w-full px-4 py-2 bg-cyber-dark border rounded font-rajdhani text-gray-200 focus:outline-none focus:ring-2 transition-all ${
    error
      ? 'border-cyber-red focus:ring-cyber-red/50'
      : 'border-cyber-border focus:border-cyber-green focus:ring-cyber-green/50'
  } disabled:opacity-50 disabled:cursor-not-allowed ${className}`;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={`${inputClasses} resize-none`}
          />
        );

      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={inputClasses}
          >
            <option value="">-- Chọn --</option>
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={`${inputClasses} font-jetbrains`}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            className={`${inputClasses} font-jetbrains`}
          />
        );

      default:
        return (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={inputClasses}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={name} className="block text-sm font-rajdhani font-semibold text-gray-300">
          {label}
          {required && <span className="text-cyber-red ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="text-sm text-cyber-red font-rajdhani">{error}</p>
      )}
    </div>
  );
}

export default FormField;
