import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Check, DollarSign, Package, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader, StatusBadge } from '../components/shared';
import { formatVND } from '../utils/formatters';
import api from '../services/api';

function Orders() {
  const [sessions, setSessions] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [cart, setCart] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sessionsData, menuItemsData, ordersData, usersData] = await Promise.all([
          api.sessions.getAll(true), // active only
          api.menuItems.getAll(),
          api.orders.getAll(),
          api.users.getAll()
        ]);
        setSessions(sessionsData);
        setMenuItems(menuItemsData);
        setOrders(ordersData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeSessions = sessions.filter(s => !s.endtime);

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  const availableItems = menuItems.filter(item => item.available);

  const filteredItems = categoryFilter === 'all'
    ? availableItems
    : availableItems.filter(item => item.category === categoryFilter);

  const addToCart = (item) => {
    const existingItem = cart.find(c => c.item_id === item.item_id);
    if (existingItem) {
      setCart(cart.map(c =>
        c.item_id === item.item_id
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId, delta) => {
    setCart(cart.map(c =>
      c.item_id === itemId
        ? { ...c, quantity: Math.max(1, c.quantity + delta) }
        : c
    ).filter(c => c.quantity > 0));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.item_id !== itemId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = selectedSession?.discount_rate || 0;
  const discountAmount = subtotal * discount;
  const total = subtotal - discountAmount;

  const handleSubmitOrder = async () => {
    if (!selectedSession) {
      toast.error('Vui lòng chọn phiên chơi');
      return;
    }
    if (cart.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    const loadingToast = toast.loading('Đang tạo đơn hàng...');

    try {
      const orderData = {
        user_id: selectedSession.user_id,
        session_id: selectedSession.session_id,
        items: cart.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.price
        })),
        total_amount: total
      };

      const newOrder = await api.orders.create(orderData);

      // Refresh data
      const [ordersData, menuItemsData] = await Promise.all([
        api.orders.getAll(),
        api.menuItems.getAll()
      ]);
      setOrders(ordersData);
      setMenuItems(menuItemsData);

      toast.success('Đã tạo đơn hàng thành công!', { id: loadingToast });
      setCart([]);
      setSelectedSession(null);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
    }
  };

  const handleCompleteOrder = async (orderId) => {
    const loadingToast = toast.loading('Đang hoàn thành đơn hàng...');

    try {
      await api.orders.updateStatus(orderId, 'COMPLETED');

      // Refresh orders
      const ordersData = await api.orders.getAll();
      setOrders(ordersData);

      toast.success('Đã hoàn thành đơn hàng!', { id: loadingToast });
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
    }
  };

  const handleCancelOrder = async (orderId) => {
    const loadingToast = toast.loading('Đang hủy đơn hàng...');

    try {
      await api.orders.updateStatus(orderId, 'CANCELLED');

      // Refresh orders
      const ordersData = await api.orders.getAll();
      setOrders(ordersData);

      toast.success('Đã hủy đơn hàng!', { id: loadingToast });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
    }
  };

  const todayOrders = orders.filter(o => {
    if (!o.order_time) return false;
    const orderDate = new Date(o.order_time);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      <PageHeader
        title="ĐẶT MÓN"
        subtitle="Quản lý đơn hàng - Knight Tree Net"
        breadcrumbs={['Đặt Món']}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Đơn Hôm Nay</p>
              <p className="text-3xl font-jetbrains font-bold text-cyber-green mt-2">
                {todayOrders.length}
              </p>
            </div>
            <div className="p-3 bg-cyber-green/20 rounded-lg">
              <Package className="text-cyber-green" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Đang Chờ</p>
              <p className="text-3xl font-jetbrains font-bold text-cyber-amber mt-2">
                {pendingOrders.length}
              </p>
            </div>
            <div className="p-3 bg-cyber-amber/20 rounded-lg">
              <Clock className="text-cyber-amber" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Đã Hoàn Thành</p>
              <p className="text-3xl font-jetbrains font-bold text-cyber-blue mt-2">
                {completedOrders.length}
              </p>
            </div>
            <div className="p-3 bg-cyber-blue/20 rounded-lg">
              <Check className="text-cyber-blue" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Doanh Thu</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-green mt-2">
                {formatVND(todayOrders.reduce((sum, o) => sum + o.total_amount, 0))}
              </p>
            </div>
            <div className="p-3 bg-cyber-green/20 rounded-lg">
              <DollarSign className="text-cyber-green" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Active Sessions (3 columns) */}
        <div className="lg:col-span-3">
          <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
            <h2 className="text-lg font-orbitron font-bold text-gray-200 mb-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
              </span>
              PHIÊN ĐANG CHƠI
            </h2>
            <div className="space-y-2 max-h-[700px] overflow-y-auto">
              {activeSessions.map((session) => (
                <div
                  key={session.session_id}
                  onClick={() => setSelectedSession(session)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedSession?.session_id === session.session_id
                      ? 'border-cyber-green bg-cyber-green/10 cyber-glow-green'
                      : 'border-cyber-border bg-cyber-dark hover:border-cyber-blue'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-jetbrains font-bold text-cyber-green">
                      {session.machine_name}
                    </h3>
                    {selectedSession?.session_id === session.session_id && (
                      <Check className="text-cyber-green" size={18} />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-rajdhani text-gray-300">
                      {session.is_walk_in
                        ? `Khách #${session.session_id}`
                        : (session.full_name || session.username)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-0.5 rounded font-rajdhani bg-cyber-blue/20 text-cyber-blue">
                        {session.tier_name || 'Đồng'}
                      </span>
                      <span className="text-xs text-cyber-amber font-jetbrains">
                        -{((session.discount_rate || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {activeSessions.length === 0 && (
                <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6 text-center">
                  <p className="text-gray-400 font-rajdhani text-sm">Không có phiên nào đang hoạt động</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE PANEL: Menu Items (6 columns) */}
        <div className="lg:col-span-6">
          <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
            <h2 className="text-lg font-orbitron font-bold text-gray-200 mb-4">THỰC ĐƠN</h2>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 py-1.5 rounded font-rajdhani font-semibold whitespace-nowrap text-sm transition-colors ${
                    categoryFilter === category
                      ? 'bg-cyber-green text-cyber-dark'
                      : 'bg-cyber-border text-gray-400 hover:bg-cyber-border/70'
                  }`}
                >
                  {category === 'all' ? 'Tất cả' : category}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[650px] overflow-y-auto">
              {filteredItems.map((item) => (
                <div
                  key={item.item_id}
                  onClick={() => addToCart(item)}
                  className="bg-cyber-dark border border-cyber-border rounded-lg p-3 cursor-pointer hover:border-cyber-green transition-all hover:scale-105"
                >
                  <div className="mb-2">
                    <h3 className="font-rajdhani font-bold text-gray-200 text-sm">{item.item_name}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-rajdhani bg-cyber-blue/20 text-cyber-blue">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-jetbrains font-bold text-cyber-green">
                      {formatVND(item.price)}
                    </p>
                    <p className="text-xs text-gray-400 font-jetbrains">
                      SL: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Cart (3 columns) */}
        <div className="lg:col-span-3">
          <div className="bg-cyber-card border border-cyber-green rounded-lg p-4 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="text-cyber-green" size={20} />
              <h2 className="text-lg font-orbitron font-bold text-cyber-green">GIỎ HÀNG</h2>
              {cart.length > 0 && (
                <span className="px-2 py-0.5 rounded text-xs font-jetbrains bg-cyber-green/20 text-cyber-green">
                  {cart.length}
                </span>
              )}
            </div>

            {/* Selected Session Info */}
            {selectedSession && (
              <div className="mb-4 p-3 bg-cyber-green/10 border border-cyber-green rounded">
                <p className="text-xs text-gray-400 font-rajdhani">Phiên đã chọn:</p>
                <p className="font-rajdhani font-semibold text-gray-200">{selectedSession.machine?.machine_name}</p>
                <p className="text-xs text-gray-300 font-rajdhani">{selectedSession.user?.full_name}</p>
              </div>
            )}

            {cart.length > 0 ? (
              <div className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.item_id}
                      className="bg-cyber-dark border border-cyber-border rounded p-2"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-rajdhani font-semibold text-gray-200 text-sm">{item.item_name}</p>
                          <p className="text-xs font-jetbrains text-cyber-blue">{formatVND(item.price)}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.item_id)}
                          className="p-1 bg-cyber-red/20 text-cyber-red rounded hover:bg-cyber-red/30 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.item_id, -1)}
                          className="p-1 bg-cyber-border rounded hover:bg-cyber-red/20 hover:text-cyber-red transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="flex-1 text-center font-jetbrains font-bold text-gray-200 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.item_id, 1)}
                          className="p-1 bg-cyber-border rounded hover:bg-cyber-green/20 hover:text-cyber-green transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="flex-1 text-right font-jetbrains font-bold text-cyber-amber text-sm">
                          {formatVND(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t border-cyber-border pt-3 space-y-2">
                  <div className="flex justify-between text-sm font-rajdhani">
                    <span className="text-gray-400">Tạm tính:</span>
                    <span className="text-gray-200 font-jetbrains">{formatVND(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm font-rajdhani">
                      <span className="text-gray-400">
                        Giảm giá ({(discount * 100).toFixed(0)}%):
                      </span>
                      <span className="text-cyber-amber font-jetbrains">-{formatVND(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-rajdhani border-t border-cyber-border pt-2">
                    <span className="text-gray-200 font-bold">Tổng cộng:</span>
                    <span className="text-cyber-green font-jetbrains font-bold text-lg">{formatVND(total)}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitOrder}
                  disabled={!selectedSession}
                  className="w-full px-4 py-3 bg-cyber-green text-cyber-dark rounded font-rajdhani font-bold hover:bg-cyber-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Xác nhận đơn
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="text-gray-500 mx-auto mb-2" size={40} />
                <p className="text-gray-400 font-rajdhani text-sm">Giỏ hàng trống</p>
                <p className="text-xs text-gray-500 font-rajdhani mt-1">
                  Chọn món từ thực đơn
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">ĐƠN HÀNG GẦN ĐÂY</h2>
        <div className="bg-cyber-card border border-cyber-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyber-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Tổng tiền</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Thời gian</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {orders.slice(0, 15).map((order) => {
                  const user = users.find(u => u.user_id === order.user_id);
                  return (
                    <tr key={order.order_id} className="hover:bg-cyber-border/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">#{order.order_id}</td>
                      <td className="px-4 py-3 text-sm font-rajdhani font-semibold text-gray-200">
                        {user?.full_name}
                      </td>
                      <td className="px-4 py-3 text-sm font-jetbrains font-bold text-cyber-green">
                        {formatVND(order.total_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} type="order" />
                      </td>
                      <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">
                        {new Date(order.order_time).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3">
                        {order.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCompleteOrder(order.order_id)}
                              className="px-3 py-1 bg-cyber-green/20 text-cyber-green rounded hover:bg-cyber-green/30 transition-colors font-rajdhani font-semibold text-sm flex items-center gap-1"
                            >
                              <Check size={14} />
                              Hoàn thành
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order.order_id)}
                              className="px-3 py-1 bg-cyber-red/20 text-cyber-red rounded hover:bg-cyber-red/30 transition-colors font-rajdhani font-semibold text-sm"
                            >
                              Hủy
                            </button>
                          </div>
                        )}
                        {order.status === 'COMPLETED' && (
                          <span className="text-xs text-gray-500 font-rajdhani">Đã hoàn thành</span>
                        )}
                        {order.status === 'CANCELLED' && (
                          <span className="text-xs text-gray-500 font-rajdhani">Đã hủy</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;
