// Validation utilities for all forms

export const validateAmount = (val, min = 1000, max = 100000000) => {
  if (!val) return "Vui lòng nhập số tiền";
  const num = parseInt(val);
  if (isNaN(num)) return "Số tiền không hợp lệ";
  if (num < min) return `Số tiền tối thiểu ${min.toLocaleString('vi-VN')}đ`;
  if (num > max) return "Số tiền vượt giới hạn";
  if (num % 500 !== 0) return "Số tiền phải là bội số của 500đ";
  return null;
};

export const validatePhone = (val) => {
  if (!val) return "Vui lòng nhập số điện thoại";
  const regex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  return regex.test(val) ? null : "Số điện thoại không hợp lệ";
};

export const validateIP = (val) => {
  if (!val) return "Vui lòng nhập địa chỉ IP";
  const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!regex.test(val)) return "Địa chỉ IP không hợp lệ";
  const parts = val.split('.').map(Number);
  const valid = parts.every(p => p >= 0 && p <= 255);
  return valid ? null : "Địa chỉ IP không hợp lệ (0-255)";
};

export const validateMAC = (val) => {
  if (!val) return "Vui lòng nhập địa chỉ MAC";
  const regex = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/;
  return regex.test(val.toUpperCase()) ? null : "Địa chỉ MAC không hợp lệ (XX:XX:XX:XX:XX:XX)";
};

export const validateUsername = (val) => {
  if (!val) return "Vui lòng nhập username";
  if (val.length < 3) return "Username tối thiểu 3 ký tự";
  if (val.length > 20) return "Username tối đa 20 ký tự";
  const regex = /^[a-z0-9_]+$/;
  return regex.test(val) ? null : "Username chỉ chứa chữ thường, số và _";
};

export const validatePassword = (val) => {
  if (!val) return "Vui lòng nhập mật khẩu";
  if (val.length < 6) return "Mật khẩu tối thiểu 6 ký tự";
  return null;
};

export const validatePasswordStrong = (val) => {
  if (!val) return "Vui lòng nhập mật khẩu";
  if (val.length < 8) return "Mật khẩu tối thiểu 8 ký tự";
  if (!/[A-Z]/.test(val)) return "Mật khẩu phải có ít nhất 1 chữ hoa";
  if (!/[0-9]/.test(val)) return "Mật khẩu phải có ít nhất 1 số";
  return null;
};

export const validateRequired = (val, fieldName = "Trường này") => {
  if (!val || (typeof val === 'string' && val.trim() === '')) {
    return `${fieldName} là bắt buộc`;
  }
  return null;
};

export const validateEmail = (val) => {
  if (!val) return "Vui lòng nhập email";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(val) ? null : "Email không hợp lệ";
};

export const validateRange = (val, min, max, fieldName = "Giá trị") => {
  const num = Number(val);
  if (isNaN(num)) return `${fieldName} phải là số`;
  if (num < min) return `${fieldName} tối thiểu ${min}`;
  if (num > max) return `${fieldName} tối đa ${max}`;
  return null;
};

export const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };

  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return { level: 1, label: 'Yếu', color: 'text-cyber-red' };
  if (strength <= 3) return { level: 2, label: 'Trung bình', color: 'text-cyber-amber' };
  return { level: 3, label: 'Mạnh', color: 'text-cyber-green' };
};
