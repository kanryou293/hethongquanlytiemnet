import React, { useState, useEffect } from 'react';
import { Grid, List, Plus, Edit2, Trash2, AlertTriangle, Package, DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader } from '../components/shared';
import { formatVND } from '../utils/formatters';
import api from '../services/api';

function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const data = await api.menuItems.getAll();
        setMenuItems(data);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        toast.error('Lỗi tải dữ liệu thực đơn');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const handleToggleAvailability = async (itemId) => {
    const item = menuItems.find(i => i.item_id === itemId);
    if (!item) return;

    const loadingToast = toast.loading('Đang cập nhật...');

    try {
      const updated = await api.menuItems.update(itemId, {
        available: !item.available
      });

      setMenuItems(menuItems.map(i =>
        i.item_id === itemId ? updated : i
      ));

      toast.success('Đã cập nhật trạng thái!', { id: loadingToast });
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Bạn có chắc muốn xóa món này?')) return;

    const loadingToast = toast.loading('Đang xóa...');

    try {
      await api.menuItems.delete(itemId);
      setMenuItems(menuItems.filter(item => item.item_id !== itemId));
      toast.success('Đã xóa món!', { id: loadingToast });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
    }
  };

  const calculateProfitMargin = (price, cost) => {
    if (cost === 0) return 0;
    return ((price - cost) / price * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="THỰC ĐƠN"
        subtitle="Quản lý thực đơn - Knight Tree Net"
        breadcrumbs={['Thực Đơn']}
        actions={[
          {
            label: 'Thêm món',
            icon: <Plus size={18} />,
            onClick: () => alert('Chức năng thêm món'),
            variant: 'primary'
          }
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Tổng Món</p>
              <p className="text-3xl font-jetbrains font-bold text-cyber-green mt-2">{menuItems.length}</p>
            </div>
            <div className="p-3 bg-cyber-green/20 rounded-lg">
              <ShoppingBag className="text-cyber-green" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Đang Bán</p>
              <p className="text-3xl font-jetbrains font-bold text-cyber-blue mt-2">
                {menuItems.filter(item => item.available).length}
              </p>
            </div>
            <div className="p-3 bg-cyber-blue/20 rounded-lg">
              <TrendingUp className="text-cyber-blue" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Sắp Hết</p>
              <p className="text-3xl font-jetbrains font-bold text-cyber-amber mt-2">
                {menuItems.filter(item => item.quantity < 5).length}
              </p>
            </div>
            <div className="p-3 bg-cyber-amber/20 rounded-lg">
              <AlertTriangle className="text-cyber-amber" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Giá Trị Kho</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-green mt-2">
                {formatVND(menuItems.reduce((sum, item) => sum + (item.current_cost * item.quantity), 0))}
              </p>
            </div>
            <div className="p-3 bg-cyber-green/20 rounded-lg">
              <Package className="text-cyber-green" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded font-rajdhani font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-cyber-green text-cyber-dark'
                  : 'bg-cyber-border text-gray-400 hover:bg-cyber-border/70'
              }`}
            >
              {category === 'all' ? 'Tất cả' : category}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-cyber-card border border-cyber-border rounded p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-cyber-green text-cyber-dark'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            title="Xem dạng lưới"
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'table'
                ? 'bg-cyber-green text-cyber-dark'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            title="Xem dạng bảng"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const profitMargin = calculateProfitMargin(item.price, item.current_cost);
            return (
              <div
                key={item.item_id}
                className={`bg-cyber-card border rounded-lg p-4 transition-all ${
                  item.available
                    ? 'border-cyber-border hover:border-cyber-green'
                    : 'border-cyber-border opacity-60'
                }`}
              >
                {/* Item Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-rajdhani font-bold text-lg text-gray-200">{item.item_name}</h3>
                    <span className="inline-block mt-1 px-2 py-1 rounded text-xs font-rajdhani bg-cyber-blue/20 text-cyber-blue border border-cyber-blue">
                      {item.category}
                    </span>
                  </div>
                  {item.quantity < 5 && (
                    <AlertTriangle className="text-cyber-amber" size={20} />
                  )}
                </div>

                {/* Price & Profit */}
                <div className="mb-3">
                  <p className="text-2xl font-jetbrains font-bold text-cyber-green">{formatVND(item.price)}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400 font-rajdhani">
                      Giá nhập: {formatVND(item.current_cost)}
                    </p>
                    <p className="text-xs font-rajdhani font-semibold text-cyber-amber">
                      Lãi: {profitMargin}%
                    </p>
                  </div>
                </div>

                {/* Stock */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400 font-rajdhani">Tồn kho:</span>
                    <span className={`text-sm font-jetbrains font-bold ${
                      item.quantity < 5 ? 'text-cyber-red' : 'text-cyber-green'
                    }`}>
                      {item.quantity}
                    </span>
                  </div>
                  <div className="w-full bg-cyber-dark rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.quantity < 5 ? 'bg-cyber-red' : 'bg-cyber-green'
                      }`}
                      style={{ width: `${Math.min((item.quantity / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleAvailability(item.item_id)}
                    className={`flex-1 px-3 py-2 rounded text-sm font-rajdhani font-semibold transition-colors ${
                      item.available
                        ? 'bg-cyber-green/20 text-cyber-green hover:bg-cyber-green/30'
                        : 'bg-cyber-red/20 text-cyber-red hover:bg-cyber-red/30'
                    }`}
                  >
                    {item.available ? 'Đang bán' : 'Tạm ngưng'}
                  </button>
                  <button className="p-2 bg-cyber-blue/20 text-cyber-blue rounded hover:bg-cyber-blue/30 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.item_id)}
                    className="p-2 bg-cyber-red/20 text-cyber-red rounded hover:bg-cyber-red/30 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-cyber-card border border-cyber-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyber-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Tên món</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Danh mục</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Giá bán</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Giá nhập</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Lãi (%)</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Tồn kho</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {filteredItems.map((item) => {
                  const profitMargin = calculateProfitMargin(item.price, item.current_cost);
                  return (
                    <tr key={item.item_id} className="hover:bg-cyber-border/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">#{item.item_id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-rajdhani font-semibold text-gray-200">{item.item_name}</span>
                          {item.quantity < 5 && (
                            <AlertTriangle className="text-cyber-amber" size={16} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs font-rajdhani bg-cyber-blue/20 text-cyber-blue border border-cyber-blue">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-jetbrains font-bold text-cyber-green">
                        {formatVND(item.price)}
                      </td>
                      <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">
                        {formatVND(item.current_cost)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-jetbrains font-bold ${
                          parseFloat(profitMargin) > 50 ? 'text-cyber-green' :
                          parseFloat(profitMargin) > 30 ? 'text-cyber-blue' :
                          'text-cyber-amber'
                        }`}>
                          {profitMargin}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-jetbrains font-bold ${
                          item.quantity < 5 ? 'text-cyber-red' : 'text-cyber-green'
                        }`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleAvailability(item.item_id)}
                          className={`px-2 py-1 rounded text-xs font-rajdhani border ${
                            item.available
                              ? 'bg-cyber-green/20 text-cyber-green border-cyber-green'
                              : 'bg-cyber-red/20 text-cyber-red border-cyber-red'
                          }`}
                        >
                          {item.available ? 'Đang bán' : 'Tạm ngưng'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="p-2 bg-cyber-blue/20 text-cyber-blue rounded hover:bg-cyber-blue/30 transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.item_id)}
                            className="p-2 bg-cyber-red/20 text-cyber-red rounded hover:bg-cyber-red/30 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Menu;
