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
  const [rangeExpenses, setRangeExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const defaultDate = new Date();
    return `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, '0')}`;
  });

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
          api.expenses.getSummaryByCategory(),
        ]);
        setSessions(sessionsData);
        setOrders(ordersData);
        setUsers(usersData);
        setMenuItems(menuItemsData);
        setMemberships(membershipsData);
        setExpensesSummary(expensesData);
        setRangeExpenses(expensesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Lỗi tải dữ liệu báo cáo');
        setSessions([]);
        setOrders([]);
        setUsers([]);
        setMenuItems([]);
        setMemberships([]);
        setExpensesSummary([]);
        setRangeExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const getRangeBounds = (range) => {
    const start = new Date(startOfToday);
    const end = new Date(startOfToday);

    if (range === 'week') {
      start.setDate(start.getDate() - 6);
      end.setDate(end.getDate() + 1);
    } else if (range === 'month') {
      const [year, month] = selectedMonth.split('-').map(Number);
      if (!Number.isNaN(year) && !Number.isNaN(month)) {
        start.setFullYear(year, month - 1, 1);
        end.setFullYear(year, month, 1);
      } else {
        start.setDate(1);
        end.setDate(end.getDate() + 1);
      }
    } else if (range === 'all') {
      start.setFullYear(1970, 0, 1);
      end.setDate(end.getDate() + 1);
    } else {
      end.setDate(end.getDate() + 1);
    }

    return { start, end };
  };

  const { start: startDate, end: endDate } = getRangeBounds(dateRange);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRangeExpenses = async () => {
      try {
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = new Date(endDate.getTime() - 1).toISOString().split('T')[0];
        const expensesData = await api.expenses.getByRange(startDateStr, endDateStr, controller.signal);
        setRangeExpenses(expensesData || []);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching range expenses:', error);
        setRangeExpenses([]);
      }
    };

    fetchRangeExpenses();

    return () => controller.abort();
  }, [startDate, endDate]);

  const filteredSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.starttime);
    return sessionDate >= startDate && sessionDate < endDate;
  });

  const filteredOrders = orders.filter((o) => {
    const orderDate = new Date(o.order_time);
    return orderDate >= startDate && orderDate < endDate;
  });

  const menuItemCostMap = menuItems.reduce((map, item) => {
    map[item.item_id] = Number(item.current_cost || 0);
    return map;
  }, {});

  const foodCost = filteredOrders.reduce((sum, order) => {
    if (!Array.isArray(order.items)) return sum;
    return order.items.reduce((orderSum, item) => {
      const quantity = Number(item.quantity || 0);
      const costPerUnit = menuItemCostMap[item.item_id] ?? Number(item.current_cost || 0);
      return orderSum + quantity * (Number.isNaN(costPerUnit) ? 0 : costPerUnit);
    }, sum);
  }, 0);

  const otherExpense = rangeExpenses.reduce((sum, exp) => sum + (Number(exp.amount || exp.total_amount || 0)), 0);

  // Calculate revenue from sessions
  const sessionRevenue = filteredSessions.reduce((sum, s) => {
    if (s.endtime) return sum + (s.cost || 0);
    return sum + calculateSessionCost(s.starttime, s.hourly_rate || 3000, s.discount_rate || 0);
  }, 0);

  // Calculate revenue from orders
  const orderRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalRevenue = sessionRevenue + orderRevenue;
  const actualRevenue = Math.max(0, totalRevenue - foodCost - (dateRange === 'month' ? otherExpense : 0));

  // Average session duration
  const avgSessionDuration = filteredSessions.length > 0
    ? filteredSessions.reduce((sum, s) => {
        const start = new Date(s.starttime);
        const end = s.endtime ? new Date(s.endtime) : new Date();
        return sum + (end - start) / (1000 * 60 * 60);
      }, 0) / filteredSessions.length
    : 0;

  const orderItems = filteredOrders.flatMap((o) => Array.isArray(o.items) ? o.items : []);
  const itemStats = orderItems.reduce((stats, item) => {
    const key = item.item_id || item.itemId || item.id;
    if (!key) return stats;

    const quantity = Number(item.quantity || 0);
    const revenue = quantity * Number(item.unit_price || 0);

    if (!stats[key]) {
      stats[key] = {
        item_id: key,
        name: item.item_name || item.name || 'Không rõ',
        quantity: 0,
        revenue: 0,
      };
    }

    stats[key].quantity += quantity;
    stats[key].revenue += revenue;
    return stats;
  }, {});

  const topItems = Object.values(itemStats)
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue);

  const topItem = topItems[0] || null;

  // Build daily revenue chart for the last 7 days
  const dailyRevenueData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfToday);
    date.setDate(date.getDate() - (6 - index));

    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const sessionsForDay = sessions.filter((s) => {
      const startTime = new Date(s.starttime);
      return startTime >= dayStart && startTime < dayEnd;
    });

    const ordersForDay = orders.filter((o) => {
      const orderTime = new Date(o.order_time);
      return orderTime >= dayStart && orderTime < dayEnd;
    });

    const sessionsRevenueForDay = sessionsForDay.reduce((sum, s) => {
      if (s.endtime) return sum + (s.cost || 0);
      return sum + calculateSessionCost(s.starttime, s.hourly_rate || 3000, s.discount_rate || 0);
    }, 0);

    const ordersRevenueForDay = ordersForDay.reduce((sum, o) => sum + (o.total_amount || 0), 0);

    return {
      date: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
      revenue: sessionsRevenueForDay + ordersRevenueForDay,
    };
  });

  // Build hourly revenue data for current day
  const hourlyRevenueData = Array.from({ length: 24 }, (_, hour) => {
    const label = `${String(hour).padStart(2, '0')}:00`;
    return { hour: label, revenue: 0 };
  });

  const chartDailyRevenueData = dailyRevenueData.length > 0
    ? dailyRevenueData.map((item) => ({ ...item, revenue: Number(item.revenue || 0) }))
    : [{ date: 'N/A', revenue: 0 }];
  const chartHourlyRevenueData = hourlyRevenueData.length > 0
    ? hourlyRevenueData.map((item) => ({ ...item, revenue: Number(item.revenue || 0) }))
    : [{ hour: '00:00', revenue: 0 }];

  filteredSessions.forEach((s) => {
    const hour = new Date(s.starttime).getHours();
    const revenue = s.endtime
      ? (s.cost || 0)
      : calculateSessionCost(s.starttime, s.hourly_rate || 3000, s.discount_rate || 0);
    hourlyRevenueData[hour].revenue += revenue;
  });

  filteredOrders.forEach((o) => {
    const hour = new Date(o.order_time).getHours();
    hourlyRevenueData[hour].revenue += (o.total_amount || 0);
  });

  const groupedHourlyRevenueData = Array.from({ length: 8 }, (_, index) => {
    const startHour = index * 3;
    const endHour = startHour + 3;
    const label = `${String(startHour).padStart(2, '0')}:00`;
    const revenue = hourlyRevenueData
      .slice(startHour, endHour)
      .reduce((sum, item) => sum + item.revenue, 0);
    return { hour: label, revenue };
  });

  // Revenue split data
  const revenueSplitData = [
    { name: 'Giờ máy', value: sessionRevenue, color: '#00ff88' },
    { name: 'Đồ ăn/uống', value: orderRevenue, color: '#00b4ff' },
  ];

  const topMenuItems = topItems.slice(0, 5).map((item) => ({
    name: item.name,
    sold: item.quantity,
  }));

  // Top customers
  const topCustomers = users
    .map(user => {
      const userSessions = sessions.filter(s => s.user_id === user.user_id);
      const userOrders = orders.filter(o => o.user_id === user.user_id);
      const sessionCost = userSessions.reduce((sum, s) => sum + (s.cost || 0), 0);
      const orderCost = userOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      return {
        ...user,
        totalSpent: sessionCost + orderCost,
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  const expensesData = expensesSummary
    .filter(item => item.total_amount > 0)
    .map(item => ({
      category: item.category_name,
      amount: Number(item.total_amount || 0),
    }));

  // Debug: log chart data to browser console to troubleshoot missing bars
  try {
    // eslint-disable-next-line no-console
    console.debug('Reports: dailyRevenueData', dailyRevenueData);
    // eslint-disable-next-line no-console
    console.debug('Reports: hourlyRevenueData', hourlyRevenueData);
    // eslint-disable-next-line no-console
    console.debug('Reports: groupedHourlyRevenueData', groupedHourlyRevenueData);
    // eslint-disable-next-line no-console
    console.debug('Reports: revenueSplitData', revenueSplitData);
    // eslint-disable-next-line no-console
    console.debug('Reports: topMenuItems', topMenuItems);
    // eslint-disable-next-line no-console
    console.debug('Reports: expensesData', expensesData);
  } catch (e) {
    // ignore console failures in some environments
  }

  // Normalize chart data and force remount keys to ensure Recharts redraws
  const normalizeChartNumbers = (arr = [], keys = []) => (
    Array.isArray(arr) ? arr.map((it) => {
      const copy = { ...it };
      keys.forEach((k) => { copy[k] = Number(copy[k] || 0); });
      return copy;
    }) : []
  );

  const dailyRevenueDataNormalized = normalizeChartNumbers(dailyRevenueData, ['revenue']);
  const hourlyRevenueDataNormalized = normalizeChartNumbers(hourlyRevenueData, ['revenue']);
  const groupedHourlyRevenueDataNormalized = normalizeChartNumbers(groupedHourlyRevenueData, ['revenue']);
  const topMenuItemsNormalized = normalizeChartNumbers(topMenuItems, ['sold']);
  const expensesDataNormalized = normalizeChartNumbers(expensesData, ['amount']);

  const chartRevenueSplitData = revenueSplitData.length > 0 ? revenueSplitData : [{ name: 'Không có dữ liệu', value: 1, color: '#6b7280' }];
  const chartTopMenuItems = topMenuItems.length > 0 ? topMenuItems : [{ name: 'Không có dữ liệu', sold: 1 }];
  const chartExpensesData = expensesData.length > 0 ? expensesData : [{ category: 'Không có dữ liệu', amount: 1 }];

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
        <div className="flex flex-wrap gap-2 items-center">
          {['week', 'month', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded font-rajdhani font-semibold transition-colors ${
                dateRange === range
                  ? 'bg-cyber-green text-cyber-dark'
                  : 'bg-cyber-border text-gray-400 hover:bg-cyber-border/70'
              }`}
            >
              {range === 'week' ? 'Tuần' : range === 'month' ? 'Tháng' : 'Tất cả'}
            </button>
          ))}
          {dateRange === 'month' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 rounded bg-cyber-border text-gray-200 font-rajdhani outline-none border border-cyber-border focus:border-cyber-green"
            />
          )}
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Chi phí đồ ăn</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-red mt-2">
                {formatVND(foodCost)}
              </p>
            </div>
            <div className="p-3 bg-cyber-red/20 rounded-lg">
              <ShoppingCart className="text-cyber-red" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Doanh thu thực</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-green mt-2">
                {formatVND(actualRevenue)}
              </p>
            </div>
            <div className="p-3 bg-cyber-green/20 rounded-lg">
              <DollarSign className="text-cyber-green" size={24} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            {dateRange === 'month'
              ? 'Đã trừ chi phí điện, nước, khác và đồ ăn'
              : 'Đã trừ chi phí đồ ăn'}
          </p>
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
                {topItem?.name || 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-cyber-green/20 rounded-lg">
              <ShoppingCart className="text-cyber-green" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts removed as requested */}

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
