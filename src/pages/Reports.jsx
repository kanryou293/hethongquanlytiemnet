import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, Users, ShoppingCart } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import { formatVND, calculateSessionCost } from '../utils/formatters';
import api from '../services/api';

function Reports() {
  const [sessions, setSessions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [expensesSummary, setExpensesSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sessionsData, ordersData, usersData, menuItemsData, membershipsData, expensesData] = await Promise.all([
          api.sessions.getAll(),
          api.orders.getAll(),
          api.users.getAll(),
          api.menuItems.getAll(),
          api.memberships.getAll(),
          api.expenses.getSummaryByCategory()
        ]);
        setSessions(sessionsData);
        setOrders(ordersData);
        setUsers(usersData);
        setMenuItems(menuItemsData);
        setMemberships(membershipsData);
        setExpensesSummary(expensesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Lỗi tải dữ liệu báo cáo');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate revenue from sessions
  const sessionRevenue = sessions.reduce((sum, s) => {
    if (s.endtime) return sum + (s.cost || 0);
    return sum + calculateSessionCost(s.starttime, s.hourly_rate || 3000, s.discount_rate || 0);
  }, 0);

  // Calculate revenue from orders
  const orderRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalRevenue = sessionRevenue + orderRevenue;

  // Average session duration
  const avgSessionDuration = sessions.length > 0
    ? sessions.reduce((sum, s) => {
        const start = new Date(s.starttime);
        const end = s.endtime ? new Date(s.endtime) : new Date();
        return sum + (end - start) / (1000 * 60 * 60);
      }, 0) / sessions.length
    : 0;

  // Top selling item (simplified - would need order_details from backend)
  const topItem = menuItems[0]; // Placeholder

  // Daily revenue data (mock)
  const dailyRevenueData = [
    { date: '20/05', revenue: 2500000 },
    { date: '21/05', revenue: 2800000 },
    { date: '22/05', revenue: 2300000 },
    { date: '23/05', revenue: 3100000 },
    { date: '24/05', revenue: 2900000 },
    { date: '25/05', revenue: 3400000 },
    { date: '26/05', revenue: totalRevenue },
  ];

  // Hourly revenue data (mock)
  const hourlyRevenueData = [
    { hour: '00:00', revenue: 50000 },
    { hour: '03:00', revenue: 30000 },
    { hour: '06:00', revenue: 80000 },
    { hour: '09:00', revenue: 250000 },
    { hour: '12:00', revenue: 450000 },
    { hour: '15:00', revenue: 380000 },
    { hour: '18:00', revenue: 520000 },
    { hour: '21:00', revenue: 680000 },
  ];

  // Revenue split data
  const revenueSplitData = [
    { name: 'Giờ máy', value: sessionRevenue, color: '#00ff88' },
    { name: 'Đồ ăn/uống', value: orderRevenue, color: '#00b4ff' },
  ];

  // Top menu items (simplified)
  const topMenuItems = menuItems.slice(0, 5).map(item => ({
    name: item.item_name,
    sold: Math.floor(Math.random() * 100), // Placeholder
  }));

  // Top customers
  const topCustomers = users
    .map(user => {
      const userSessions = sessions.filter(s => s.user_id === user.user_id);
      const userOrders = orders.filter(o => o.user_id === user.user_id);
      const sessionCost = userSessions.reduce((sum, s) => sum + (s.cost || 0), 0);
      const orderCost = userOrders.reduce((sum, o) => sum + o.total_amount, 0);
      return {
        ...user,
        totalSpent: sessionCost + orderCost,
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  // Mock expenses data (backend doesn't have expenses API yet)
  const expensesData = expensesSummary
    .filter(item => item.total_amount > 0)
    .map(item => ({
      category: item.category_name,
      amount: parseInt(item.total_amount)
    }));

  // Mock memberships for display - now using real data from API

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-cyber-green font-rajdhani text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-cyber-green">BÁO CÁO</h1>
          <p className="text-gray-400 font-rajdhani mt-1">Báo cáo và thống kê</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          {['today', 'week', 'month', 'custom'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded font-rajdhani font-semibold transition-colors ${
                dateRange === range
                  ? 'bg-cyber-green text-cyber-dark'
                  : 'bg-cyber-border text-gray-400 hover:bg-cyber-border/70'
              }`}
            >
              {range === 'today' ? 'Hôm nay' : range === 'week' ? 'Tuần này' : range === 'month' ? 'Tháng này' : 'Tùy chỉnh'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Tổng doanh thu</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-green mt-2">
                {formatVND(totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-cyber-green/20 rounded-lg">
              <DollarSign className="text-cyber-green" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Tổng phiên</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-blue mt-2">
                {sessions.length}
              </p>
            </div>
            <div className="p-3 bg-cyber-blue/20 rounded-lg">
              <Users className="text-cyber-blue" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Thời gian TB</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-amber mt-2">
                {avgSessionDuration.toFixed(1)}h
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
              <p className="text-gray-400 text-sm font-rajdhani">Món bán chạy</p>
              <p className="text-lg font-rajdhani font-bold text-cyber-green mt-2">
                {topItem?.item_name || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-cyber-green/20 rounded-lg">
              <ShoppingCart className="text-cyber-green" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">DOANH THU THEO NGÀY</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af', fontFamily: 'Rajdhani' }}
                itemStyle={{ color: '#00ff88', fontFamily: 'JetBrains Mono' }}
                formatter={(value) => formatVND(value)}
              />
              <Line type="monotone" dataKey="revenue" stroke="#00ff88" strokeWidth={2} dot={{ fill: '#00ff88' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Revenue Chart */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">DOANH THU THEO GIỜ</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="hour" stroke="#9ca3af" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af', fontFamily: 'Rajdhani' }}
                itemStyle={{ color: '#00b4ff', fontFamily: 'JetBrains Mono' }}
                formatter={(value) => formatVND(value)}
              />
              <Bar dataKey="revenue" fill="#00b4ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Split */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">PHÂN BỔ DOANH THU</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={revenueSplitData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueSplitData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                itemStyle={{ fontFamily: 'JetBrains Mono' }}
                formatter={(value) => formatVND(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Menu Items */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">TOP 5 MÓN BÁN CHẠY</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topMenuItems} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
              <YAxis type="category" dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px', fontFamily: 'Rajdhani' }} width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                itemStyle={{ color: '#00ff88', fontFamily: 'JetBrains Mono' }}
              />
              <Bar dataKey="sold" fill="#00ff88" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses by Category */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">CHI PHÍ THEO LOẠI</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={expensesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="category" stroke="#9ca3af" style={{ fontSize: '10px', fontFamily: 'Rajdhani' }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                itemStyle={{ color: '#ffaa00', fontFamily: 'JetBrains Mono' }}
                formatter={(value) => formatVND(value)}
              />
              <Bar dataKey="amount" fill="#ffaa00" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Customers Table */}
      <div>
        <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">TOP 10 KHÁCH HÀNG</h2>
        <div className="bg-cyber-card border border-cyber-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyber-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Hạng</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Họ tên</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Username</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Hạng thành viên</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Tổng chi tiêu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {topCustomers.map((customer, index) => {
                  const membership = memberships.find(m => m.membership_id === customer.membership_id);
                  return (
                    <tr key={customer.user_id} className="hover:bg-cyber-border/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`text-sm font-jetbrains font-bold ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-300' :
                          index === 2 ? 'text-amber-600' :
                          'text-gray-400'
                        }`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-rajdhani font-semibold text-gray-200">
                        {customer.full_name}
                      </td>
                      <td className="px-4 py-3 text-sm font-jetbrains text-cyber-blue">
                        @{customer.username}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs font-rajdhani bg-cyber-blue/20 text-cyber-blue border border-cyber-blue">
                          {membership?.tier_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-jetbrains font-bold text-cyber-green">
                        {formatVND(customer.totalSpent)}
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

export default Reports;
