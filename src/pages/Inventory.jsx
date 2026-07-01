import React, { useEffect, useState } from 'react';
import { Package, Plus, TrendingUp } from 'lucide-react';
import { formatVND } from '../utils/formatters';
import api from '../services/api';

function Inventory() {
  const [imports, setImports] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [importPrice, setImportPrice] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const getItemName = (itemId) => {
    const item = menuItems.find(i => i.item_id === itemId);
    return item?.item_name || `Item #${itemId}`;
  };

  const getStaffName = (staffId) => {
    const staffMember = staff.find(s => s.staff_id === staffId);
    return staffMember?.full_name || `Staff #${staffId}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [importsData, menuItemsData, staffData] = await Promise.all([
          api.inventoryImports.getAll(),
          api.menuItems.getAll(),
          api.staff.getAll(),
        ]);
        setImports(importsData);
        setMenuItems(menuItemsData);
        setStaff(staffData);
      } catch (error) {
        console.error('Error loading inventory data:', error);
        alert('Lỗi tải dữ liệu nhập kho.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem || !quantity || !importPrice) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const totalAmount = parseInt(quantity, 10) * parseInt(importPrice, 10);

    const payload = {
      staff_id: 1, // TODO: replace with current authenticated staff
      item_id: selectedItem.item_id,
      quantity: parseInt(quantity, 10),
      import_price: parseInt(importPrice, 10),
    };

    try {
      const result = await api.inventoryImports.create(payload);
      setImports([result, ...imports]);
      alert(`Nhập kho ${quantity} ${selectedItem.item_name} thành công!`);

      // Reset form
      setShowAddModal(false);
      setSelectedItem(null);
      setQuantity('');
      setImportPrice('');
    } catch (error) {
      console.error('Error creating inventory import:', error);
      alert('Lỗi khi lưu nhập kho lên server.');
    }
  };

  const activeImports = selectedMonth === 'all'
    ? imports
    : imports.filter(imp => {
      if (!imp.created_at) return false;
      const d = new Date(imp.created_at);
      const [y, m] = selectedMonth.split('-').map(Number);
      return d.getFullYear() === y && d.getMonth() + 1 === m;
    });

  const totalImportsThisMonth = activeImports.reduce((sum, imp) => sum + imp.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-cyber-green">NHẬP KHO</h1>
          <p className="text-gray-400 font-rajdhani mt-1">Quản lý nhập kho</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-cyber-green text-cyber-dark rounded font-rajdhani font-semibold hover:bg-cyber-green/90 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nhập hàng
        </button>
        <div className="ml-4 flex items-center gap-2">
          <label className="text-sm text-gray-400">Xem theo tháng</label>
          <input
            type="month"
            value={selectedMonth === 'all' ? new Date().toISOString().slice(0,7) : selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2 py-1 bg-cyber-border rounded text-gray-200"
          />
          <button
            onClick={() => setSelectedMonth('all')}
            className="px-3 py-1 bg-cyber-border text-gray-200 rounded hover:bg-cyber-border/80"
          >
            Tất cả
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Tổng lần nhập</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-green mt-2">
                {imports.length}
              </p>
            </div>
            <div className="p-3 bg-cyber-green/20 rounded-lg">
              <Package className="text-cyber-green" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Chi phí tháng này</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-amber mt-2">
                {formatVND(totalImportsThisMonth)}
              </p>
            </div>
            <div className="p-3 bg-cyber-amber/20 rounded-lg">
              <TrendingUp className="text-cyber-amber" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Trung bình/lần</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-blue mt-2">
                {formatVND(imports.length > 0 ? imports.reduce((sum, imp) => sum + imp.total_amount, 0) / imports.length : 0)}
              </p>
            </div>
            <div className="p-3 bg-cyber-blue/20 rounded-lg">
              <Package className="text-cyber-blue" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Imports Table */}
      <div>
        <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">LỊCH SỬ NHẬP KHO</h2>
        <div className="bg-cyber-card border border-cyber-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyber-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Tên món</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Số lượng</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Giá nhập</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Tổng tiền</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Nhân viên</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {imports.map((importRecord) => (
                  <tr key={importRecord.import_id} className="hover:bg-cyber-border/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">#{importRecord.import_id}</td>
                    <td className="px-4 py-3 text-sm font-rajdhani font-semibold text-gray-200">
                      {getItemName(importRecord.item_id)}
                    </td>
                    <td className="px-4 py-3 text-sm font-jetbrains text-cyber-blue">
                      {importRecord.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">
                      {formatVND(importRecord.import_price)}
                    </td>
                    <td className="px-4 py-3 text-sm font-jetbrains font-bold text-cyber-green">
                      {formatVND(importRecord.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-sm font-rajdhani text-gray-400">
                      {getStaffName(importRecord.staff_id)}
                    </td>
                    <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">
                      {new Date(importRecord.created_at).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Import Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-cyber-card border border-cyber-green rounded-lg max-w-2xl w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-cyber-border">
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-cyber-green">NHẬP HÀNG MỚI</h2>
                <p className="text-gray-400 font-rajdhani mt-1">Thêm hàng vào kho</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-cyber-border rounded transition-colors text-gray-400"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Item Selection */}
              <div>
                <label className="block text-sm font-rajdhani font-semibold text-gray-300 mb-2">
                  Chọn món *
                </label>
                <select
                  value={selectedItem?.item_id || ''}
                  onChange={(e) => {
                    const item = menuItems.find(i => i.item_id === parseInt(e.target.value));
                    setSelectedItem(item);
                    setImportPrice(item?.current_cost || '');
                  }}
                  className="w-full px-4 py-2 bg-cyber-dark border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green"
                  required
                >
                  <option value="">-- Chọn món --</option>
                  {menuItems.map(item => (
                    <option key={item.item_id} value={item.item_id}>
                      {item.item_name} (Tồn: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>
              {loading && (
                <p className="text-sm text-gray-400">Đang tải dữ liệu...</p>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-rajdhani font-semibold text-gray-300 mb-2">
                  Số lượng *
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Nhập số lượng..."
                  min="1"
                  className="w-full px-4 py-2 bg-cyber-dark border border-cyber-border rounded font-jetbrains text-gray-200 focus:outline-none focus:border-cyber-green"
                  required
                />
              </div>

              {/* Import Price */}
              <div>
                <label className="block text-sm font-rajdhani font-semibold text-gray-300 mb-2">
                  Giá nhập (VNĐ) *
                </label>
                <input
                  type="number"
                  value={importPrice}
                  onChange={(e) => setImportPrice(e.target.value)}
                  placeholder="Nhập giá nhập..."
                  min="1"
                  step="1000"
                  className="w-full px-4 py-2 bg-cyber-dark border border-cyber-border rounded font-jetbrains text-gray-200 focus:outline-none focus:border-cyber-green"
                  required
                />
                {importPrice && (
                  <p className="mt-1 text-sm text-cyber-green font-jetbrains">
                    {formatVND(parseInt(importPrice) || 0)}
                  </p>
                )}
              </div>

              {/* Total Amount Preview */}
              {quantity && importPrice && (
                <div className="bg-cyber-dark border border-cyber-green rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-rajdhani">Tổng tiền:</span>
                    <span className="text-2xl font-jetbrains font-bold text-cyber-green">
                      {formatVND(parseInt(quantity) * parseInt(importPrice))}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-cyber-border text-gray-300 rounded font-rajdhani font-semibold hover:bg-cyber-border/70 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyber-green text-cyber-dark rounded font-rajdhani font-semibold hover:bg-cyber-green/90 transition-colors"
                >
                  Xác nhận nhập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
