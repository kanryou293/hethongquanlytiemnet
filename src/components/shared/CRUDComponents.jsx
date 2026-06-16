import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

// Confirm Delete Dialog Component
export function ConfirmDelete({ isOpen, onClose, onConfirm, itemLabel, itemName, danger = true }) {
  const [inputVal, setInputVal] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
      setInputVal('');
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setInputVal('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const isValid = inputVal === itemLabel;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-cyber-card border border-cyber-red rounded-lg max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cyber-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyber-red/20 rounded-lg">
              <AlertTriangle className="text-cyber-red" size={24} />
            </div>
            <h2 className="text-xl font-orbitron font-bold text-cyber-red">XÁC NHẬN XÓA</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="p-2 hover:bg-cyber-border rounded transition-colors disabled:opacity-50"
          >
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-cyber-red/10 border border-cyber-red rounded-lg p-4">
            <p className="text-gray-200 font-rajdhani">
              Bạn đang xóa: <span className="font-bold text-cyber-red">{itemName}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-rajdhani text-gray-300 mb-2">
              Nhập <span className="font-bold text-cyber-red">{itemLabel}</span> để xác nhận:
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={itemLabel}
              disabled={isDeleting}
              className="w-full px-4 py-2 bg-cyber-dark border border-cyber-border rounded font-jetbrains text-gray-200 focus:outline-none focus:border-cyber-red disabled:opacity-50"
              autoFocus
            />
          </div>

          <div className="bg-cyber-amber/10 border border-cyber-amber rounded-lg p-3">
            <p className="text-sm text-cyber-amber font-rajdhani flex items-center gap-2">
              <AlertTriangle size={16} />
              Hành động này không thể hoàn tác!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-cyber-border">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-cyber-border text-gray-300 rounded font-rajdhani font-semibold hover:bg-cyber-border/70 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || isDeleting}
            className="flex-1 px-4 py-2 bg-cyber-red text-white rounded font-rajdhani font-semibold hover:bg-cyber-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa Vĩnh Viễn'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Form Field with Validation Component
export function FormFieldWithValidation({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  disabled = false,
  min,
  max,
  step,
  options = [],
  rows = 3,
  suffix,
  prefix,
  helperText,
  autoFocus = false,
  className = ''
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
    if (value && !error) setIsValid(true);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setIsValid(false);
  };

  const getBorderColor = () => {
    if (error) return 'border-cyber-red';
    if (isValid && !isFocused) return 'border-cyber-green';
    if (isFocused) return 'border-cyber-green';
    return 'border-cyber-border';
  };

  const renderInput = () => {
    const baseClasses = `w-full px-4 py-2 bg-cyber-dark border rounded font-rajdhani text-gray-200 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getBorderColor()} ${className}`;

    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          required={required}
          autoFocus={autoFocus}
          className={baseClasses}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          name={name}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          className={baseClasses}
        >
          <option value="">-- Chọn --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-jetbrains">
            {prefix}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          required={required}
          autoFocus={autoFocus}
          className={`${baseClasses} ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-jetbrains">
            {suffix}
          </span>
        )}
        {isValid && !error && !isFocused && (
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyber-green"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-rajdhani font-semibold text-gray-300">
          {label}
          {required && <span className="text-cyber-red ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="text-sm text-cyber-red font-rajdhani flex items-center gap-1 animate-shake">
          <AlertTriangle size={14} />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-400 font-rajdhani">{helperText}</p>
      )}
    </div>
  );
}

// Password Strength Indicator
export function PasswordStrengthIndicator({ password }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '', width: '0%' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, label: 'Yếu', color: 'bg-cyber-red', width: '33%' };
    if (strength <= 3) return { level: 2, label: 'Trung bình', color: 'bg-cyber-amber', width: '66%' };
    return { level: 3, label: 'Mạnh', color: 'bg-cyber-green', width: '100%' };
  };

  const strength = getStrength();

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400 font-rajdhani">Độ mạnh mật khẩu:</span>
        <span className={`text-xs font-rajdhani font-semibold ${strength.color.replace('bg-', 'text-')}`}>
          {strength.label}
        </span>
      </div>
      <div className="w-full bg-cyber-dark rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: strength.width }}
        />
      </div>
    </div>
  );
}

// Loading Spinner
export function LoadingSpinner({ size = 'md', text = 'Đang tải...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${sizeClasses[size]} border-2 border-cyber-green border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-gray-400 font-rajdhani">{text}</p>}
    </div>
  );
}

// Empty State
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && <div className="text-gray-500 mb-4">{icon}</div>}
      <h3 className="text-lg font-orbitron font-bold text-gray-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-400 font-rajdhani text-center mb-4">{description}</p>}
      {action && action}
    </div>
  );
}
