import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Monitor, Users, DollarSign, ShoppingCart,
  UtensilsCrossed, Package, Receipt, UserCog,
  Activity, FileText, BarChart3, Menu, X
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: Home, label: 'Tổng Quan' },
  { path: '/workstations', icon: Monitor, label: 'Máy Tính' },
  { path: '/sessions', icon: Activity, label: 'Phiên Chơi' },
  { path: '/users', icon: Users, label: 'Khách Hàng' },
  { path: '/topup', icon: DollarSign, label: 'Nạp Tiền' },
  { path: '/orders', icon: ShoppingCart, label: 'Đặt Món' },
  { path: '/menu', icon: UtensilsCrossed, label: 'Thực Đơn' },
  { path: '/inventory', icon: Package, label: 'Nhập Kho' },
  { path: '/expenses', icon: Receipt, label: 'Chi Phí' },
  { path: '/staff', icon: UserCog, label: 'Nhân Viên' },
  { path: '/machine-health', icon: Activity, label: 'Sức Khỏe Máy' },
  { path: '/logs', icon: FileText, label: 'Nhật Ký' },
  { path: '/reports', icon: BarChart3, label: 'Báo Cáo' },
];

function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-cyber-card border-r border-cyber-border scanline-bg transition-all duration-300 z-50 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyber-border">
        {!collapsed && (
          <h1 className="font-orbitron text-xl font-bold text-cyber-green">
            KNIGHT TREE
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-cyber-border transition-colors"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green cyber-glow-green'
                  : 'text-gray-400 hover:bg-cyber-border hover:text-gray-200'
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && (
                <span className="font-rajdhani font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyber-border">
          <div className="text-xs text-gray-500 font-jetbrains">
            <div>v1.0.0</div>
            <div className="text-cyber-green">ONLINE</div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
