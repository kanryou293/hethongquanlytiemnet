import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Key, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Fetch staff from API
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const data = await api.staff.getAll();
        setStaff(data);
      } catch (error) {
        console.error('Error fetching staff:', error);
        toast.error('Lỗi tải dữ liệu nhân viên');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-cyber-red/20 text-cyber-red border-cyber-red';
      case 'Manager':
        return 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue';
      case 'Staff':
        return 'bg-cyber-green/20 text-cyber-green border-cyber-green';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const handleResetPassword = async (staffId) => {
    if (!confirm('Bạn có chắc muốn đặt lại mật khẩu cho nhân viên này?')) return;

    const loadingToast = toast.loading('Đang đặt lại mật khẩu...');

    try {
      const newPassword = 'password123'; // TODO: Generate random password
      await api.staff.updatePassword(staffId, newPassword);
      toast.success('Đã đặt lại mật khẩu thành công!', { id: loadingToast });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-cyber-green">NHÂN VIÊN</h1>
          <p className="text-gray-400 font-rajdhani mt-1">Quản lý nhân viên - {staff.length} thành viên</p>
        </div>

        <button className="px-4 py-2 bg-cyber-green text-cyber-dark rounded font-rajdhani font-semibold hover:bg-cyber-green/90 transition-colors flex items-center gap-2">
          <UserPlus size={20} />
          Thêm nhân viên
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <p className="text-sm text-gray-400 font-rajdhani">Admin</p>
          <p className="text-2xl font-jetbrains font-bold text-cyber-red mt-1">
            {staff.filter(s => s.role === 'Admin').length}
          </p>
        </div>
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <p className="text-sm text-gray-400 font-rajdhani">Manager</p>
          <p className="text-2xl font-jetbrains font-bold text-cyber-blue mt-1">
            {staff.filter(s => s.role === 'Manager').length}
          </p>
        </div>
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <p className="text-sm text-gray-400 font-rajdhani">Staff</p>
          <p className="text-2xl font-jetbrains font-bold text-cyber-green mt-1">
            {staff.filter(s => s.role === 'Staff').length}
          </p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-cyber-card border border-cyber-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyber-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">ID</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Họ tên</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Vai trò</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Ngày tạo</th>
                <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border">
              {staff.map((member) => (
                <tr key={member.staff_id} className="hover:bg-cyber-border/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">#{member.staff_id}</td>
                  <td className="px-4 py-3 text-sm font-rajdhani font-semibold text-gray-200">
                    {member.full_name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-rajdhani border ${getRoleBadgeClass(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">
                    {new Date(member.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedStaff(member)}
                        className="p-2 bg-cyber-blue/20 text-cyber-blue rounded hover:bg-cyber-blue/30 transition-colors"
                        title="Xem hoạt động"
                      >
                        <Activity size={16} />
                      </button>
                      <button className="p-2 bg-cyber-green/20 text-cyber-green rounded hover:bg-cyber-green/30 transition-colors" title="Chỉnh sửa">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleResetPassword(member.staff_id)}
                        className="p-2 bg-cyber-amber/20 text-cyber-amber rounded hover:bg-cyber-amber/30 transition-colors"
                        title="Đặt lại mật khẩu"
                      >
                        <Key size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Activity Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-cyber-card border border-cyber-green rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-cyber-border">
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-cyber-green">HOẠT ĐỘNG NHÂN VIÊN</h2>
                <p className="text-gray-400 font-rajdhani mt-1">{selectedStaff.full_name}</p>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
                className="p-2 hover:bg-cyber-border rounded transition-colors text-gray-400"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Staff Info */}
              <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 font-rajdhani">ID:</p>
                    <p className="text-gray-200 font-jetbrains">#{selectedStaff.staff_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-rajdhani">Vai trò:</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-rajdhani border ${getRoleBadgeClass(selectedStaff.role)}`}>
                      {selectedStaff.role}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-rajdhani">Ngày tham gia:</p>
                    <p className="text-gray-200 font-jetbrains">
                      {new Date(selectedStaff.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-rajdhani">Tổng hoạt động:</p>
                    <p className="text-cyber-green font-jetbrains font-bold">
                      {systemLogs.filter(log => log.staff_id === selectedStaff.staff_id).length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-orbitron font-bold text-gray-200 mb-3">HOẠT ĐỘNG GẦN ĐÂY</h3>
                <div className="bg-cyber-dark border border-cyber-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-cyber-border">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-rajdhani font-semibold text-gray-300">Thời gian</th>
                        <th className="px-3 py-2 text-left text-xs font-rajdhani font-semibold text-gray-300">Hành động</th>
                        <th className="px-3 py-2 text-left text-xs font-rajdhani font-semibold text-gray-300">Loại</th>
                        <th className="px-3 py-2 text-left text-xs font-rajdhani font-semibold text-gray-300">ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-border">
                      {getStaffLogs(selectedStaff.staff_id).map((log) => (
                        <tr key={log.log_id}>
                          <td className="px-3 py-2 text-xs font-jetbrains text-gray-400">
                            {new Date(log.logged_at).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-rajdhani ${
                              log.action === 'LOGIN' ? 'bg-cyber-blue/20 text-cyber-blue' :
                              log.action === 'CREATE' ? 'bg-cyber-green/20 text-cyber-green' :
                              log.action === 'UPDATE' ? 'bg-cyber-amber/20 text-cyber-amber' :
                              log.action === 'DELETE' ? 'bg-cyber-red/20 text-cyber-red' :
                              'bg-teal-500/20 text-teal-400'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs font-rajdhani text-gray-400">{log.target_type}</td>
                          <td className="px-3 py-2 text-xs font-jetbrains text-gray-400">#{log.target_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {['LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'PAYMENT'].map((action) => {
                  const count = systemLogs.filter(log =>
                    log.staff_id === selectedStaff.staff_id && log.action === action
                  ).length;
                  return (
                    <div key={action} className="bg-cyber-dark border border-cyber-border rounded p-3 text-center">
                      <p className="text-xs text-gray-400 font-rajdhani">{action}</p>
                      <p className="text-lg font-jetbrains font-bold text-cyber-green mt-1">{count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;
