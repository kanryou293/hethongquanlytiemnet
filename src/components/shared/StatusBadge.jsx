import React from 'react';
import { Loader2 } from 'lucide-react';

function StatusBadge({ status, type = 'default' }) {
  const getStatusConfig = () => {
    // Machine/Session status
    if (type === 'machine' || type === 'session') {
      switch (status) {
        case 'ONLINE':
        case 'ACTIVE':
          return {
            className: 'bg-cyber-green/20 text-cyber-green border-cyber-green',
            label: status === 'ACTIVE' ? 'ĐANG CHƠI' : status,
            showPulse: true
          };
        case 'OFFLINE':
        case 'INACTIVE':
          return {
            className: 'bg-gray-500/20 text-gray-400 border-gray-500',
            label: status,
            showPulse: false
          };
        case 'ENDED':
          return {
            className: 'bg-gray-500/20 text-gray-400 border-gray-500',
            label: 'ĐÃ KẾT THÚC',
            showPulse: false
          };
        case 'MAINTENANCE':
        case 'PENDING':
          return {
            className: 'bg-cyber-amber/20 text-cyber-amber border-cyber-amber',
            label: status,
            showSpin: true
          };
        default:
          return {
            className: 'bg-gray-500/20 text-gray-400 border-gray-500',
            label: status,
            showPulse: false
          };
      }
    }

    // Order status
    if (type === 'order') {
      switch (status) {
        case 'COMPLETED':
          return {
            className: 'bg-cyber-green/20 text-cyber-green border-cyber-green',
            label: 'Hoàn Thành',
            showPulse: false
          };
        case 'PENDING':
          return {
            className: 'bg-cyber-amber/20 text-cyber-amber border-cyber-amber',
            label: 'Đang Xử Lý',
            showSpin: true
          };
        case 'CANCELLED':
          return {
            className: 'bg-cyber-red/20 text-cyber-red border-cyber-red',
            label: 'Đã Hủy',
            showPulse: false
          };
        default:
          return {
            className: 'bg-gray-500/20 text-gray-400 border-gray-500',
            label: status,
            showPulse: false
          };
      }
    }

    // Health status
    if (type === 'health') {
      switch (status) {
        case 'HEALTHY':
          return {
            className: 'bg-cyber-green/20 text-cyber-green border-cyber-green',
            label: 'Khỏe Mạnh',
            showPulse: true
          };
        case 'WARNING':
          return {
            className: 'bg-cyber-amber/20 text-cyber-amber border-cyber-amber',
            label: 'Cảnh Báo',
            showPulse: false
          };
        case 'CRITICAL':
          return {
            className: 'bg-cyber-red/20 text-cyber-red border-cyber-red animate-shake',
            label: 'Nguy Hiểm',
            showPulse: true
          };
        default:
          return {
            className: 'bg-gray-500/20 text-gray-400 border-gray-500',
            label: 'Không Rõ',
            showPulse: false
          };
      }
    }

    // Default
    return {
      className: 'bg-gray-500/20 text-gray-400 border-gray-500',
      label: status,
      showPulse: false
    };
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-rajdhani border ${config.className}`}>
      {config.showPulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {config.showSpin && (
        <Loader2 size={12} className="animate-spin" />
      )}
      {config.label}
    </span>
  );
}

export default StatusBadge;
