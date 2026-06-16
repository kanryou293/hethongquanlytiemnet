import React, { useState, useEffect } from 'react';
import { Monitor, DollarSign, Users, ShoppingCart, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import { PageHeader, StatusBadge } from '../components/shared';
import { formatVND, formatElapsedTime, calculateSessionCost, getStatusBadge } from '../utils/formatters';
import api from '../services/api';

function Dashboard() {
  const [workstations, setWorkstations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [workstationsData, sessionsData, ordersData] = await Promise.all([
          api.workstations.getAll(),
          api.sessions.getAll(),
          api.orders.getAll()
        ]);
        setWorkstations(workstationsData);
        setSessions(sessionsData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Lỗi tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh data every 30 seconds
    const refreshInterval = setInterval(fetchData, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const onlineMachines = workstations.filter(w => w.status === 'ONLINE').length;
  const totalMachines = workstations.length;
  const activeSessions = sessions.filter(s => !s.endtime);
  const activeSessionsCount = activeSessions.length;

  // Calculate today's revenue
  const todayRevenue = sessions.reduce((sum, s) => {
    if (!s.endtime) {
      return sum + calculateSessionCost(s.starttime, s.hourly_rate || 3000, s.discount_rate || 0);
    }
    return sum + (s.cost || 0);
  }, 0);

  const todayOrders = orders.length;
  const todayOrdersRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

  // Mock trends (in real app, compare with yesterday)
  const machineTrend = 2;
  const revenueTrend = 15.5;
  const customersTrend = 3;

  // Active sessions already have user and machine info from backend join
  // No need to map again

  // Mock data for charts
  const revenueData = [
    { date: '20/05', sessions: 2100000, orders: 400000 },
    { date: '21/05', sessions: 2300000, orders: 500000 },
    { date: '22/05', sessions: 1900000, orders: 400000 },
    { date: '23/05', sessions: 2600000, orders: 500000 },
    { date: '24/05', sessions: 2400000, orders: 500000 },
    { date: '25/05', sessions: 2800000, orders: 600000 },
    { date: '26/05', sessions: todayRevenue, orders: todayOrdersRevenue },
  ];

  const sessionsByHour = [
    { hour: '0h', count: 2 },
    { hour: '3h', count: 1 },
    { hour: '6h', count: 3 },
    { hour: '9h', count: 8 },
    { hour: '12h', count: 15 },
    { hour: '15h', count: 12 },
    { hour: '18h', count: 18 },
    { hour: '21h', count: 20 },
  ];

  const machineUtilization = workstations.slice(0, 10).map(m => ({
    name: m.machine_name,
    usage: Math.floor(Math.random() * 100)
  }));

  // Format relative time
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000 / 60); // minutes

    if (diff < 1) return 'Vừa xong';
    if (diff < 60) return `${diff} phút trước`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  const getActionIcon = (action) => {
    const iconClass = "w-4 h-4";
    switch (action) {
      case 'LOGIN':
        return <div className={`${iconClass} rounded-full bg-cyber-blue`} />;
      case 'CREATE':
        return <div className={`${iconClass} rounded-full bg-cyber-green`} />;
      case 'UPDATE':
        return <div className={`${iconClass} rounded-full bg-cyber-amber`} />;
      case 'DELETE':
        return <div className={`${iconClass} rounded-full bg-cyber-red`} />;
      case 'PAYMENT':
        return <div className={`${iconClass} rounded-full bg-teal-400`} />;
      default:
        return <div className={`${iconClass} rounded-full bg-gray-500`} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <PageHeader
        title="TỔNG QUAN"
        subtitle="Dashboard - Knight Tree Net"
        breadcrumbs={['Tổng Quan']}
        actions={[
          {
            label: 'Làm mới',
            icon: <RefreshCw size={18} />,
            onClick: () => window.location.reload(),
            variant: 'secondary'
          }
        ]}
      />

      {/* Stats Cards with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Machines Online */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6 hover:border-cyber-green transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Máy Đang Dùng</p>
              <p className="text-3xl font-jetbrains font-bold text-cyber-green mt-2">
                {onlineMachines}/{totalMachines}
              </p>
            </div>
            <div className="p-3 bg-cyber-green/20 rounded-lg">
              <Monitor className="text-cyber-green" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp size={14} className="text-cyber-green" />
            <span className="text-cyber-green font-rajdhani">+{machineTrend}</span>
            <span className="text-gray-500 font-rajdhani">so với giờ trước</span>
          </div>
        </div>

        {/* Today Revenue */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6 hover:border-cyber-blue transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Doanh Thu Hôm Nay</p>
              <p className="text-3xl font-jetbrains font-bold text-cyber-blue mt-2">
                {formatVND(todayRevenue + todayOrdersRevenue)}
              </p>
            </div>
            <div className="p-3 bg-cyber-blue/20 rounded-lg">
              <DollarSign className="text-cyber-blue" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp size={14} className="text-cyber-green" />
            <span className="text-cyber-green font-rajdhani">+{revenueTrend}%</span>
            <span className="text-gray-500 font-rajdhani">so với hôm qua</span>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6 hover:border-cyber-green transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Khách Đang Online</p>
              <p className="text-3xl font-jetbrains font-bold text-cyber-green mt-2">
                {activeSessionsCount}
              </p>
            </div>
            <div className="p-3 bg-cyber-green/20 rounded-lg">
              <Users className="text-cyber-green" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-400 font-rajdhani">{sessions.length} khách đã vào hôm nay</span>
          </div>
        </div>

        {/* Today Orders */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6 hover:border-cyber-amber transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Đơn Hàng Hôm Nay</p>
              <p className="text-3xl font-jetbrains font-bold text-cyber-amber mt-2">
                {todayOrders}
              </p>
            </div>
            <div className="p-3 bg-cyber-amber/20 rounded-lg">
              <ShoppingCart className="text-cyber-amber" size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-400 font-rajdhani">{formatVND(todayOrdersRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Workstation Grid + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT - Workstation Grid (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-orbitron font-bold text-gray-200 flex items-center gap-2">
              TRẠNG THÁI MÁY
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {workstations.map((machine) => {
              const session = activeSessions.find(s => s.machine_id === machine.machine_id);
              const isActive = !!session;

              return (
                <div
                  key={machine.machine_id}
                  className={`bg-cyber-card border rounded-lg p-3 transition-all cursor-pointer hover:scale-105 ${
                    machine.status === 'ONLINE' && isActive
                      ? 'border-cyber-green cyber-glow-green'
                      : machine.status === 'MAINTENANCE'
                      ? 'border-cyber-amber'
                      : 'border-cyber-border hover:border-cyber-blue'
                  }`}
                >
                  {/* Machine Name */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-jetbrains font-bold text-sm">{machine.machine_name}</h3>
                    <StatusBadge status={machine.status} type="machine" />
                  </div>

                  {/* Session Info */}
                  {isActive && session ? (
                    <div className="space-y-1">
                      <div className="text-xs">
                        <p className="text-gray-400 font-rajdhani">Người dùng:</p>
                        <p className="text-cyber-green font-medium truncate">
                          {session.is_walk_in
                            ? `Khách #${session.session_id}`
                            : (session.full_name || session.username || session.user?.username)}
                        </p>
                      </div>
                      <div className="text-xs">
                        <p className="text-gray-400 font-rajdhani">Thời gian:</p>
                        <p className="text-cyber-blue font-jetbrains">{formatElapsedTime(session.starttime)}</p>
                      </div>
                      <div className="text-xs">
                        <p className="text-gray-400 font-rajdhani">Chi phí:</p>
                        <p className="text-cyber-amber font-jetbrains text-xs">
                          {formatVND(calculateSessionCost(
                            session.starttime,
                            machine.hourly,
                            session.is_walk_in ? 0 : (parseFloat(session.discount_rate) || session.membership?.discount_rate || 0)
                          ))}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-gray-500 text-xs font-rajdhani">
                        {machine.status === 'MAINTENANCE' ? 'Đang bảo trì' : 'Trống'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT - Activity Feed (1/3 width) */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">HOẠT ĐỘNG GẦN ĐÂY</h2>
          <div className="bg-cyber-card border border-cyber-border rounded-lg p-4 max-h-[600px] overflow-y-auto">
            <div className="space-y-3">
              <p className="text-sm text-gray-400 font-rajdhani text-center py-8">
                Nhật ký hoạt động sẽ hiển thị ở đây
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue Last 7 Days */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <h3 className="text-lg font-orbitron font-bold text-gray-200 mb-4">DOANH THU 7 NGÀY</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af', fontFamily: 'Rajdhani' }}
                formatter={(value) => formatVND(value)}
              />
              <Line type="monotone" dataKey="sessions" stroke="#00ff88" strokeWidth={2} name="Giờ máy" />
              <Line type="monotone" dataKey="orders" stroke="#00b4ff" strokeWidth={2} name="Đồ ăn" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Sessions by Hour */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <h3 className="text-lg font-orbitron font-bold text-gray-200 mb-4">PHIÊN THEO GIỜ</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessionsByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="hour" stroke="#9ca3af" style={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af', fontFamily: 'Rajdhani' }}
              />
              <Bar dataKey="count" fill="#ffaa00" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Machine Utilization */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <h3 className="text-lg font-orbitron font-bold text-gray-200 mb-4">SỬ DỤNG MÁY</h3>
          <div className="space-y-2">
            {machineUtilization.map((machine) => (
              <div key={machine.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-rajdhani text-gray-400">{machine.name}</span>
                  <span className="font-jetbrains text-gray-300">{machine.usage}%</span>
                </div>
                <div className="w-full bg-cyber-dark rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      machine.usage > 80 ? 'bg-cyber-green' :
                      machine.usage > 50 ? 'bg-cyber-blue' :
                      'bg-cyber-red'
                    }`}
                    style={{ width: `${machine.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
