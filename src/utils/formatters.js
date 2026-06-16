// Currency formatter for Vietnamese Dong
export const formatVND = (amount) => {
  if (amount === null || amount === undefined) return '0đ';
  return amount.toLocaleString('vi-VN') + 'đ';
};

// Format date and time
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN');
};

// Format date only
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};

// Format time only
export const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('vi-VN');
};

// Calculate elapsed time in hours
export const calculateElapsedHours = (startTime) => {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now - start;
  return diffMs / (1000 * 60 * 60); // Convert to hours
};

// Format elapsed time as HH:MM:SS
export const formatElapsedTime = (startTime) => {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now - start;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Calculate session cost
export const calculateSessionCost = (startTime, hourlyRate, discountRate = 0) => {
  const hours = calculateElapsedHours(startTime);
  const baseCost = hours * hourlyRate;
  const discount = baseCost * discountRate;
  return Math.round(baseCost - discount);
};

// Get status color
export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'ONLINE':
      return 'text-cyber-green';
    case 'OFFLINE':
      return 'text-gray-500';
    case 'MAINTENANCE':
      return 'text-cyber-amber';
    default:
      return 'text-gray-400';
  }
};

// Get status badge classes
export const getStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'ONLINE':
      return 'bg-cyber-green/20 text-cyber-green border-cyber-green';
    case 'OFFLINE':
      return 'bg-gray-500/20 text-gray-500 border-gray-500';
    case 'MAINTENANCE':
      return 'bg-cyber-amber/20 text-cyber-amber border-cyber-amber';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-400';
  }
};

// Get role badge classes
export const getRoleBadge = (role) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN':
      return 'bg-cyber-red/20 text-cyber-red border-cyber-red';
    case 'MANAGER':
      return 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue';
    case 'STAFF':
      return 'bg-cyber-green/20 text-cyber-green border-cyber-green';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-400';
  }
};

// Get action color for system logs
export const getActionColor = (action) => {
  switch (action?.toUpperCase()) {
    case 'LOGIN':
      return 'text-cyber-blue';
    case 'CREATE':
      return 'text-cyber-green';
    case 'UPDATE':
      return 'text-cyber-amber';
    case 'DELETE':
      return 'text-cyber-red';
    case 'PAYMENT':
      return 'text-teal-400';
    default:
      return 'text-gray-400';
  }
};

// Get temperature color
export const getTempColor = (temp) => {
  if (temp > 80) return 'text-cyber-red';
  if (temp > 60) return 'text-cyber-amber';
  return 'text-cyber-green';
};

// Get disk space color
export const getDiskColor = (freeGB) => {
  if (freeGB < 10) return 'text-cyber-red';
  if (freeGB < 20) return 'text-cyber-amber';
  return 'text-cyber-green';
};
