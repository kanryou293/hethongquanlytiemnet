import React, { useState, useEffect, useMemo } from 'react';
import { Search, User, X, Crown, TrendingUp, Clock, ShoppingCart, Wallet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import { PageHeader, StatusBadge } from '../components/shared';
import { formatVND, formatElapsedTime } from '../utils/formatters';
import api from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // profile | sessions | orders | topups
  const [userSessions, setUserSessions] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [userTopUps, setUserTopUps] = useState([]);

  // Fetch users and memberships
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, membershipsData] = await Promise.all([
          api.users.getAll(),
          api.memberships.getAll()
        ]);
        setUsers(usersData);
        setMemberships(membershipsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Lỗi tải dữ liệu khách hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch user details when selected
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!selectedUser) return;

      try {
        const [sessions, orders, topups] = await Promise.all([
          api.users.getSessions(selectedUser.user_id),
          api.users.getOrders(selectedUser.user_id),
          api.users.getTopUps(selectedUser.user_id)
        ]);
        setUserSessions(sessions);
        setUserOrders(orders);
        setUserTopUps(topups);
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast.error('Lỗi tải chi tiết khách hàng');
      }
    };

    fetchUserDetails();
  }, [selectedUser]);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.number_phone.includes(searchTerm)
  );

  const getUserMembership = (user) => {
    return memberships.find(m => m.membership_id === user.membership_id) || { tier_name: 'Đồng', discount_rate: 0, min_balance: 0 };
  };

  const getTotalSpent = (userId) => {
    const sessionCost = userSessions.reduce((sum, s) => sum + (s.cost || 0), 0);
    const orderCost = userOrders.reduce((sum, o) => sum + o.total_amount, 0);
    return sessionCost + orderCost;
  };

  // Calculate spending for last 7 days
  const getLast7DaysSpending = useMemo(() => {
    if (!selectedUser) return [];

    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Calculate sessions cost for this day
      const sessionsCost = userSessions
        .filter(s => s.endtime && s.endtime.startsWith(dateStr))
        .reduce((sum, s) => sum + (s.cost || 0), 0);

      // Calculate orders cost for this day
      const ordersCost = userOrders
        .filter(o => o.order_time && o.order_time.startsWith(dateStr))
        .reduce((sum, o) => sum + o.total_amount, 0);

      last7Days.push({
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        sessions: sessionsCost,
        orders: ordersCost,
        total: sessionsCost + ordersCost
      });
    }

    return last7Days;
  }, [selectedUser, userSessions, userOrders]);

  const getMembershipBadgeColor = (tierName) => {
    switch (tierName) {
      case 'Kim Cương':
        return 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white';
      case 'Bạch Kim':
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-cyber-dark';
      case 'Vàng':
        return 'bg-gradient-to-r from-amber-500 to-yellow-300 text-cyber-dark';
      case 'Bạc':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      case 'Đồng':
        return 'bg-gradient-to-r from-orange-700 to-orange-600 text-white';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-cyber-green font-rajdhani text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="KHÁCH HÀNG"
        subtitle="Quản lý khách hàng - Knight Tree Net"
        breadcrumbs={['Khách Hàng']}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Tổng Khách Hàng</p>
              <p className="text-3xl font-jetbrains font-bold text-cyber-green mt-2">{users.length}</p>
            </div>
            <div className="p-3 bg-cyber-green/20 rounded-lg">
              <User className="text-cyber-green" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Kim Cương</p>
              <p className="text-3xl font-jetbrains font-bold text-amber-400 mt-2">
                {users.filter(u => getUserMembership(u)?.tier_name === 'Kim Cương').length}
              </p>
            </div>
            <div className="p-3 bg-amber-400/20 rounded-lg">
              <Crown className="text-amber-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Tổng Số Dư</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-blue mt-2">
                {formatVND(users.reduce((sum, u) => sum + u.balance, 0))}
              </p>
            </div>
            <div className="p-3 bg-cyber-blue/20 rounded-lg">
              <Wallet className="text-cyber-blue" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Khách Đang Chơi</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-amber mt-2">
                {users.filter(u => u.is_active).length}
              </p>
            </div>
            <div className="p-3 bg-cyber-amber/20 rounded-lg">
              <TrendingUp className="text-cyber-amber" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên, username hoặc số điện thoại..."
          className="w-full pl-10 pr-4 py-3 bg-cyber-card border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green"
        />
      </div>

      {/* Users Table */}
      <div className="bg-cyber-card border border-cyber-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyber-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">ID</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Username</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Họ tên</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Số điện thoại</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Hạng</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Số dư</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              {filteredUsers.map((user) => {
                const membership = getUserMembership(user);
                const isLowBalance = user.balance < membership.min_balance;
                const totalSpent = getTotalSpent(user.user_id);

                return (
                  <tr key={user.user_id} className="hover:bg-cyber-border/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">#{user.user_id}</td>
                    <td className="px-4 py-3 text-sm font-jetbrains text-cyber-blue">@{user.username}</td>
                    <td className="px-4 py-3 text-sm font-rajdhani font-semibold text-gray-200">{user.full_name}</td>
                    <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">{user.number_phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-rajdhani font-semibold ${getMembershipBadgeColor(membership.tier_name)}`}>
                        {(membership.tier_name === 'Kim Cương' || membership.tier_name === 'Bạch Kim') && <Crown size={12} />}
                        {membership.tier_name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-jetbrains font-bold ${isLowBalance ? 'text-cyber-red' : 'text-cyber-green'}`}>
                        {formatVND(user.balance)}
                      </span>
                      {isLowBalance && (
                        <p className="text-xs text-cyber-red font-rajdhani">Dưới mức tối thiểu</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-jetbrains text-gray-400">
                        {user.is_active ? 'Đang chơi' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setActiveTab('profile');
                        }}
                        className="p-2 bg-cyber-blue/20 text-cyber-blue rounded hover:bg-cyber-blue/30 transition-colors"
                        title="Xem chi tiết"
                      >
                        <User size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-end z-50">
          <div className="bg-cyber-card border-l border-cyber-green w-full md:w-2/3 lg:w-1/2 h-full overflow-y-auto animate-scale-in">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-cyber-card border-b border-cyber-border p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyber-green to-cyber-blue rounded-full flex items-center justify-center">
                    <User className="text-white" size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-orbitron font-bold text-cyber-green">{selectedUser.full_name}</h2>
                    <p className="text-gray-400 font-jetbrains">@{selectedUser.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-cyber-border rounded transition-colors"
                >
                  <X className="text-gray-400" size={24} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded font-rajdhani font-semibold transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-cyber-green text-cyber-dark'
                      : 'bg-cyber-border text-gray-400 hover:bg-cyber-border/70'
                  }`}
                >
                  Thông Tin
                </button>
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`px-4 py-2 rounded font-rajdhani font-semibold transition-colors ${
                    activeTab === 'sessions'
                      ? 'bg-cyber-green text-cyber-dark'
                      : 'bg-cyber-border text-gray-400 hover:bg-cyber-border/70'
                  }`}
                >
                  Phiên Chơi
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2 rounded font-rajdhani font-semibold transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-cyber-green text-cyber-dark'
                      : 'bg-cyber-border text-gray-400 hover:bg-cyber-border/70'
                  }`}
                >
                  Đơn Hàng
                </button>
                <button
                  onClick={() => setActiveTab('topups')}
                  className={`px-4 py-2 rounded font-rajdhani font-semibold transition-colors ${
                    activeTab === 'topups'
                      ? 'bg-cyber-green text-cyber-dark'
                      : 'bg-cyber-border text-gray-400 hover:bg-cyber-border/70'
                  }`}
                >
                  Nạp Tiền
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <>
                  {/* Membership Card */}
                  <div className={`rounded-lg p-6 ${
                    getUserMembership(selectedUser).tier_name === 'Kim Cương'
                      ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500'
                      : getUserMembership(selectedUser).tier_name === 'Bạch Kim'
                      ? 'bg-gradient-to-br from-gray-300/20 to-gray-400/20 border border-gray-400'
                      : getUserMembership(selectedUser).tier_name === 'Vàng'
                      ? 'bg-gradient-to-br from-amber-500/20 to-yellow-300/20 border border-amber-500'
                      : 'bg-cyber-dark border border-cyber-border'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Crown className={
                          getUserMembership(selectedUser).tier_name === 'Kim Cương' ? 'text-cyan-400' :
                          getUserMembership(selectedUser).tier_name === 'Bạch Kim' ? 'text-gray-300' :
                          getUserMembership(selectedUser).tier_name === 'Vàng' ? 'text-amber-400' :
                          'text-cyber-blue'
                        } size={24} />
                        <h3 className="text-xl font-orbitron font-bold text-gray-200">
                          {getUserMembership(selectedUser).tier_name}
                        </h3>
                      </div>
                      <span className="text-2xl font-jetbrains font-bold text-cyber-amber">
                        {(getUserMembership(selectedUser).discount_rate * 100).toFixed(0)}% OFF
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400 font-rajdhani">Số dư hiện tại</p>
                        <p className="text-2xl font-jetbrains font-bold text-cyber-green">
                          {formatVND(selectedUser.balance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 font-rajdhani">Số dư tối thiểu</p>
                        <p className="text-lg font-jetbrains text-gray-300">
                          {formatVND(getUserMembership(selectedUser).min_balance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="text-cyber-blue" size={20} />
                        <p className="text-sm text-gray-400 font-rajdhani">Tổng Phiên</p>
                      </div>
                      <p className="text-2xl font-jetbrains font-bold text-cyber-blue">
                        {userSessions.length}
                      </p>
                    </div>

                    <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="text-cyber-amber" size={20} />
                        <p className="text-sm text-gray-400 font-rajdhani">Tổng Đơn</p>
                      </div>
                      <p className="text-2xl font-jetbrains font-bold text-cyber-amber">
                        {userOrders.length}
                      </p>
                    </div>

                    <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="text-cyber-green" size={20} />
                        <p className="text-sm text-gray-400 font-rajdhani">Tổng Chi Tiêu</p>
                      </div>
                      <p className="text-xl font-jetbrains font-bold text-cyber-green">
                        {formatVND(getTotalSpent(selectedUser.user_id))}
                      </p>
                    </div>

                    <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="text-purple-400" size={20} />
                        <p className="text-sm text-gray-400 font-rajdhani">Tổng Nạp</p>
                      </div>
                      <p className="text-xl font-jetbrains font-bold text-purple-400">
                        {formatVND(userTopUps.reduce((sum, t) => sum + t.amount, 0))}
                      </p>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4">
                    <h3 className="text-lg font-orbitron font-bold text-gray-200 mb-3">THÔNG TIN CÁ NHÂN</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-rajdhani">Họ tên:</span>
                        <span className="text-gray-200 font-rajdhani font-semibold">{selectedUser.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-rajdhani">Username:</span>
                        <span className="text-cyber-blue font-jetbrains">@{selectedUser.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-rajdhani">Số điện thoại:</span>
                        <span className="text-gray-200 font-jetbrains">{selectedUser.number_phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-rajdhani">Ngày tạo:</span>
                        <span className="text-gray-200 font-jetbrains">
                          {new Date(selectedUser.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Spending Chart - Last 7 Days */}
                  <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4">
                    <h3 className="text-lg font-orbitron font-bold text-gray-200 mb-4">CHI TIÊU 7 NGÀY QUA</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={getLast7DaysSpending}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#111827',
                            border: '1px solid #1f2937',
                            borderRadius: '8px'
                          }}
                          labelStyle={{ color: '#9ca3af', fontFamily: 'Rajdhani' }}
                          formatter={(value) => formatVND(value)}
                        />
                        <Line
                          type="monotone"
                          dataKey="sessions"
                          stroke="#00ff88"
                          strokeWidth={2}
                          name="Giờ máy"
                          dot={{ fill: '#00ff88' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#ffaa00"
                          strokeWidth={2}
                          name="Đồ ăn"
                          dot={{ fill: '#ffaa00' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#00b4ff"
                          strokeWidth={2}
                          name="Tổng"
                          dot={{ fill: '#00b4ff' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <div className="space-y-3">
                  {userSessions.map((session) => (
                    <div key={session.session_id} className="bg-cyber-dark border border-cyber-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-jetbrains text-gray-400">#{session.session_id}</p>
                          <p className="text-lg font-rajdhani font-semibold text-cyber-blue">{session.machine_name}</p>
                        </div>
                        <StatusBadge status={session.endtime ? 'ENDED' : 'ACTIVE'} type="session" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400 font-rajdhani">Bắt đầu:</p>
                          <p className="text-gray-200 font-jetbrains text-xs">
                            {new Date(session.starttime).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-rajdhani">Thời gian:</p>
                          <p className="text-cyber-blue font-jetbrains">
                            {session.endtime ? formatElapsedTime(session.starttime, session.endtime) : formatElapsedTime(session.starttime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-rajdhani">Chi phí:</p>
                          <p className="text-cyber-amber font-jetbrains font-bold">{formatVND(session.cost || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {userSessions.length === 0 && (
                    <p className="text-center text-gray-400 font-rajdhani py-8">Chưa có phiên chơi nào</p>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {userOrders.map((order) => (
                    <div key={order.order_id} className="bg-cyber-dark border border-cyber-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-jetbrains text-gray-400">#{order.order_id}</p>
                          <p className="text-xs text-gray-400 font-jetbrains">
                            {new Date(order.created_at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <StatusBadge status={order.status} type="order" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-rajdhani text-sm">Tổng tiền:</span>
                        <span className="text-cyber-amber font-jetbrains font-bold text-lg">
                          {formatVND(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {userOrders.length === 0 && (
                    <p className="text-center text-gray-400 font-rajdhani py-8">Chưa có đơn hàng nào</p>
                  )}
                </div>
              )}

              {/* Top-ups Tab */}
              {activeTab === 'topups' && (
                <div className="space-y-3">
                  {userTopUps.map((topup) => (
                    <div key={topup.tut_id} className="bg-cyber-dark border border-cyber-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-jetbrains text-gray-400">#{topup.tut_id}</p>
                          <p className="text-xs text-gray-400 font-jetbrains">
                            {new Date(topup.created_at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-rajdhani bg-cyber-blue/20 text-cyber-blue border border-cyber-blue">
                          {topup.paymentmethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-rajdhani text-sm">Số tiền:</span>
                        <span className="text-cyber-green font-jetbrains font-bold text-lg">
                          +{formatVND(topup.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {userTopUps.length === 0 && (
                    <p className="text-center text-gray-400 font-rajdhani py-8">Chưa có giao dịch nạp tiền nào</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
