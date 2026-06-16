import React, { useState, useEffect } from 'react';
import { Filter, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [logsData, staffData] = await Promise.all([
          api.systemLogs.getAll(),
          api.staff.getAll()
        ]);
        setLogs(logsData);
        setStaff(staffData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Lỗi tải dữ liệu nhật ký');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const actions = ['all', 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'PAYMENT'];

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue';
      case 'CREATE':
        return 'bg-cyber-green/20 text-cyber-green border-cyber-green';
      case 'UPDATE':
        return 'bg-cyber-amber/20 text-cyber-amber border-cyber-amber';
      case 'DELETE':
        return 'bg-cyber-red/20 text-cyber-red border-cyber-red';
      case 'PAYMENT':
        return 'bg-teal-500/20 text-teal-400 border-teal-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getStaffName = (staffId) => {
    const staffMember = staff.find(s => s.staff_id === staffId);
    return staffMember?.full_name || `Staff #${staffId}`;
  };

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesStaff = filterStaff === 'all' || log.staff_id === parseInt(filterStaff);
    const matchesSearch = searchTerm === '' ||
      log.target_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_id.toString().includes(searchTerm);

    return matchesAction && matchesStaff && matchesSearch;
  });

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
      <div>
        <h1 className="text-3xl font-orbitron font-bold text-cyber-green">NHẬT KÝ HỆ THỐNG</h1>
        <p className="text-gray-400 font-rajdhani mt-1">
          Xem nhật ký hệ thống - {filteredLogs.length} bản ghi
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action Filter */}
        <div>
          <label className="block text-sm font-rajdhani font-semibold text-gray-300 mb-2">
            Lọc theo hành động
          </label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full px-4 py-2 bg-cyber-card border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green"
          >
            {actions.map(action => (
              <option key={action} value={action}>
                {action === 'all' ? 'Tất cả' : action}
              </option>
            ))}
          </select>
        </div>

        {/* Staff Filter */}
        <div>
          <label className="block text-sm font-rajdhani font-semibold text-gray-300 mb-2">
            Lọc theo nhân viên
          </label>
          <select
            value={filterStaff}
            onChange={(e) => setFilterStaff(e.target.value)}
            className="w-full px-4 py-2 bg-cyber-card border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green"
          >
            <option value="all">Tất cả</option>
            {staff.map(member => (
              <option key={member.staff_id} value={member.staff_id}>
                {member.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-rajdhani font-semibold text-gray-300 mb-2">
            Tìm kiếm
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo loại hoặc ID..."
              className="w-full pl-10 pr-4 py-2 bg-cyber-card border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'PAYMENT'].map((action) => {
          const count = systemLogs.filter(log => log.action === action).length;
          return (
            <div key={action} className="bg-cyber-card border border-cyber-border rounded-lg p-4">
              <p className="text-sm text-gray-400 font-rajdhani">{action}</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-green mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Logs Table */}
      <div className="bg-cyber-card border border-cyber-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyber-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">ID</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Thời gian</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Nhân viên</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Hành động</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Loại đối tượng</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">ID đối tượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-cyber-border/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">#{log.log_id}</td>
                    <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">
                      {new Date(log.logged_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-sm font-rajdhani text-gray-200">
                      {getStaffName(log.staff_id)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-rajdhani border ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-rajdhani text-gray-400">{log.target_type}</td>
                    <td className="px-4 py-3 text-sm font-jetbrains text-cyber-blue">#{log.target_id}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-400 font-rajdhani">
                    Không tìm thấy bản ghi nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Timeline */}
      <div>
        <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">DÒNG THỜI GIAN</h2>
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <div className="space-y-4">
            {filteredLogs.slice(0, 10).map((log, index) => (
              <div key={log.log_id} className="flex gap-4">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    log.action === 'LOGIN' ? 'bg-cyber-blue' :
                    log.action === 'CREATE' ? 'bg-cyber-green' :
                    log.action === 'UPDATE' ? 'bg-cyber-amber' :
                    log.action === 'DELETE' ? 'bg-cyber-red' :
                    'bg-teal-400'
                  }`} />
                  {index < filteredLogs.slice(0, 10).length - 1 && (
                    <div className="w-0.5 h-full bg-cyber-border mt-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-rajdhani border ${getActionBadgeClass(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-sm font-rajdhani text-gray-400">
                      {getStaffName(log.staff_id)}
                    </span>
                  </div>
                  <p className="text-sm font-rajdhani text-gray-300">
                    {log.action === 'LOGIN' && `Đăng nhập vào hệ thống`}
                    {log.action === 'CREATE' && `Tạo mới ${log.target_type} #${log.target_id}`}
                    {log.action === 'UPDATE' && `Cập nhật ${log.target_type} #${log.target_id}`}
                    {log.action === 'DELETE' && `Xóa ${log.target_type} #${log.target_id}`}
                    {log.action === 'PAYMENT' && `Thanh toán ${log.target_type} #${log.target_id}`}
                  </p>
                  <p className="text-xs font-jetbrains text-gray-500 mt-1">
                    {new Date(log.logged_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemLogs;
