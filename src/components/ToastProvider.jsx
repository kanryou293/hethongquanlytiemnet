import { Toaster } from 'react-hot-toast';

// Toast configuration for the app
export const toastConfig = {
  duration: 3000,
  position: 'top-right',
  style: {
    background: '#111827',
    color: '#f3f4f6',
    border: '1px solid #1f2937',
    borderRadius: '8px',
    fontFamily: 'Rajdhani, sans-serif',
    fontSize: '14px',
  },
  success: {
    iconTheme: {
      primary: '#00ff88',
      secondary: '#111827',
    },
    style: {
      border: '1px solid #00ff88',
    },
  },
  error: {
    iconTheme: {
      primary: '#ff3d5a',
      secondary: '#111827',
    },
    style: {
      border: '1px solid #ff3d5a',
    },
  },
  loading: {
    iconTheme: {
      primary: '#00b4ff',
      secondary: '#111827',
    },
    style: {
      border: '1px solid #00b4ff',
    },
  },
};

// Toast Provider Component
export function ToastProvider() {
  return (
    <Toaster
      position={toastConfig.position}
      toastOptions={toastConfig}
    />
  );
}
