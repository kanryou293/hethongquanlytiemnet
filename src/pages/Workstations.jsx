import React, { useState, useEffect } from 'react';
import { Monitor, Play, Wrench, History, Grid, List, Search, X, ChevronRight, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import { PageHeader, StatusBadge, Modal, FormField } from '../components/shared';
import { formatVND, getStatusBadge } from '../utils/formatters';
import api from '../services/api';

function Workstations() {
  const [viewMode, setViewMode] = useState('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [workstations, setWorkstations] = useState([]);
  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);

  // Start session form
  const [step, setStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [timePackage, setTimePackage] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [workstationsData, usersData, membershipsData, sessionsData] = await Promise.all([
          api.workstations.getAll(),
          api.users.getAll(),
          api.memberships.getAll(),
          api.sessions.getAll()
        ]);
        setWorkstations(workstationsData);
        setUsers(usersData);
        setMemberships(membershipsData);
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartSession = (machine) => {
    setSelectedMachine(machine);
    setShowStartModal(true);
    setStep(1);
    setSelectedUser(null);
    setUserSearchTerm('');
    setIsWalkIn(false);
    setTimePackage(null);
  };

  const handleEndSession = (machine) => {
    setSelectedMachine(machine);
    setShowEndModal(true);
  };

  const handleViewDetail = (machine) => {
    setSelectedMachine(machine);
    setShowDetailModal(true);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.number_phone.includes(userSearchTerm)
  );

  const filteredMachines = workstations.filter(machine => {
    const session = getActiveSession(machine.machine_id);
    const isActive = !!session;

    let machineStatus = machine.status;
    if (isActive) {
      machineStatus = 'ONLINE';
    } else if (machine.status !== 'MAINTENANCE') {
      machineStatus = 'OFFLINE';
    }

    const matchesStatus = statusFilter === 'all' || machineStatus === statusFilter;
    const matchesSearch = machine.machine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.ip.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getUserMembership = (user) => {
    return memberships.find(m => m.membership_id === user.membership_id);
  };

  const getActiveSession = (machineId) => {
    return sessions.find(s => s.machine_id === machineId && !s.endtime);
  };

  const estimateCost = () => {
    if (!selectedMachine || !timePackage) return 0;
    const hours = timePackage === '30min' ? 0.5 : timePackage === '1h' ? 1 : timePackage === '2h' ? 2 : 0;
    const discount = selectedUser ? getUserMembership(selectedUser)?.discount_rate || 0 : 0;
    return selectedMachine.hourly * hours * (1 - discount);
  };

  // Mock historical data for machine detail
  const getMachineHistory = () => [
    { time: '00:00', temp: 45 },
    { time: '04:00', temp: 48 },
    { time: '08:00', temp: 52 },
    { time: '12:00', temp: 58 },
    { time: '16:00', temp: 55 },
    { time: '20:00', temp: 50 },
  ];

  const renderMachineCard = (machine) => {
    const session = getActiveSession(machine.machine_id);
    const isActive = !!session;
    const user = session ? users.find(u => u.user_id === session.user_id) : null;

    return (
      <div
        key={machine.machine_id}
        className={`bg-cyber-card border rounded-lg p-4 transition-all ${
          isActive
            ? 'border-cyber-green cyber-glow-green'
            : machine.status === 'MAINTENANCE'
            ? 'border-cyber-amber'
            : 'border-cyber-border hover:border-cyber-blue'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-jetbrains font-bold text-lg text-gray-200">{machine.machine_name}</h3>
          <StatusBadge status={isActive ? 'ONLINE' : machine.status} type="machine" />
        </div>

        <div className="space-y-2 mb-4">
          <div className="text-sm">
            <span className="text-gray-400 font-rajdhani">IP:</span>
            <span className="text-gray-300 font-jetbrains ml-2">{machine.ip}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400 font-rajdhani">MAC:</span>
            <span className="text-gray-300 font-jetbrains ml-2">{machine.mac}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400 font-rajdhani">Giá/giờ:</span>
            <span className="text-cyber-green font-jetbrains ml-2">{formatVND(machine.hourly)}</span>
          </div>
        </div>

        {isActive && (
          <div className="mb-4 p-3 bg-cyber-dark rounded border border-cyber-green/30">
            <p className="text-xs text-gray-400 font-rajdhani">Đang sử dụng:</p>
            <p className="text-sm text-cyber-green font-semibold">
              {session.is_walk_in
                ? `Khách #${session.session_id}`
                : (session.full_name || user?.full_name || session.username || 'N/A')}
            </p>
          </div>
        )}

        {!isActive && machine.status === 'OFFLINE' && (
          <div className="mb-4 p-3 bg-cyber-dark rounded border border-cyber-border">
            <p className="text-sm text-gray-400 font-rajdhani text-center">Sẵn sàng</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => handleStartSession(machine)}
            disabled={isActive || machine.status === 'MAINTENANCE'}
            className="flex-1 p-2 bg-cyber-green/20 text-cyber-green rounded hover:bg-cyber-green/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            title="Mở phiên"
          >
            <Play size={14} />
            <span className="text-xs font-rajdhani">Mở Phiên</span>
          </button>
          <button
            onClick={() => handleViewDetail(machine)}
            className="flex-1 p-2 bg-cyber-blue/20 text-cyber-blue rounded hover:bg-cyber-blue/30 transition-colors flex items-center justify-center gap-1"
            title="Chi tiết"
          >
            <History size={14} />
            <span className="text-xs font-rajdhani">Chi Tiết</span>
          </button>
          <button
            className="p-2 bg-cyber-amber/20 text-cyber-amber rounded hover:bg-cyber-amber/30 transition-colors"
            title="Bảo trì"
          >
            <Wrench size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="MÁY TÍNH"
        subtitle="Quản lý máy tính"
        breadcrumbs={['Máy Tính']}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-cyber-green font-rajdhani text-xl">Đang tải...</div>
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
        {/* Status Filter */}
        <div className="flex gap-2">
          {['all', 'ONLINE', 'OFFLINE', 'MAINTENANCE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded font-rajdhani font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-cyber-green text-cyber-dark'
                  : 'bg-cyber-border text-gray-400 hover:bg-cyber-border/70'
              }`}
            >
              {status === 'all' ? 'Tất cả' : status === 'ONLINE' ? 'Đang dùng' : status === 'OFFLINE' ? 'Trống' : 'Bảo trì'}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-cyber-card border border-cyber-border rounded p-1 ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-cyber-green text-cyber-dark'
                : 'text-gray-400 hover:text-gray-200'
            }`}
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
          >
            <List size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên máy hoặc IP..."
            className="pl-10 pr-4 py-2 bg-cyber-card border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green"
          />
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMachines.map(renderMachineCard)}
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
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Tên Máy</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">IP</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">MAC</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Trạng Thái</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Giá/Giờ</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {filteredMachines.map((machine) => {
                  const session = getActiveSession(machine.machine_id);
                  const isActive = !!session;
                  return (
                    <tr key={machine.machine_id} className="hover:bg-cyber-border/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">#{machine.machine_id}</td>
                      <td className="px-4 py-3 text-sm font-rajdhani font-semibold text-gray-200">{machine.machine_name}</td>
                      <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">{machine.ip}</td>
                      <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">{machine.mac}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={isActive ? 'ONLINE' : machine.status} type="machine" />
                      </td>
                      <td className="px-4 py-3 text-sm font-jetbrains text-cyber-green">{formatVND(machine.hourly)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartSession(machine)}
                            disabled={isActive || machine.status === 'MAINTENANCE'}
                            className="p-2 bg-cyber-green/20 text-cyber-green rounded hover:bg-cyber-green/30 transition-colors disabled:opacity-50"
                          >
                            <Play size={16} />
                          </button>
                          <button
                            onClick={() => handleViewDetail(machine)}
                            className="p-2 bg-cyber-blue/20 text-cyber-blue rounded hover:bg-cyber-blue/30 transition-colors"
                          >
                            <History size={16} />
                          </button>
                          <button className="p-2 bg-cyber-amber/20 text-cyber-amber rounded hover:bg-cyber-amber/30 transition-colors">
                            <Wrench size={16} />
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
        </>
      )}

      {/* Start Session Modal */}
      <Modal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        title={`Mở Phiên — ${selectedMachine?.machine_name}`}
        icon={<Play size={20} />}
        size="lg"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-orbitron font-bold ${
                step >= s ? 'bg-cyber-green text-cyber-dark' : 'bg-cyber-border text-gray-400'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 ${step > s ? 'bg-cyber-green' : 'bg-cyber-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Choose Customer */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-orbitron font-bold text-gray-200">Bước 1: Chọn Khách Hàng</h3>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWalkIn}
                  onChange={(e) => {
                    setIsWalkIn(e.target.checked);
                    if (e.target.checked) setSelectedUser(null);
                  }}
                  className="w-4 h-4"
                />
                <span className="font-rajdhani text-gray-300">Khách vãng lai</span>
              </label>
            </div>

            {!isWalkIn && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Tìm theo tên, username hoặc số điện thoại..."
                    className="w-full pl-10 pr-4 py-2 bg-cyber-dark border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green"
                  />
                </div>

                {userSearchTerm && (
                  <div className="max-h-60 overflow-y-auto bg-cyber-dark border border-cyber-border rounded">
                    {filteredUsers.map((user) => {
                      const membership = getUserMembership(user);
                      return (
                        <div
                          key={user.user_id}
                          onClick={() => {
                            setSelectedUser(user);
                            setUserSearchTerm('');
                          }}
                          className="p-3 hover:bg-cyber-border cursor-pointer border-b border-cyber-border last:border-b-0"
                        >
                          <div className="flex justify-between">
                            <div>
                              <p className="font-rajdhani font-semibold text-gray-200">{user.full_name}</p>
                              <p className="text-sm text-gray-400 font-jetbrains">@{user.username}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-cyber-blue font-jetbrains">{formatVND(user.balance)}</p>
                              <p className="text-xs text-gray-400">{membership?.tier_name}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedUser && (
                  <div className="bg-cyber-dark border border-cyber-green rounded-lg p-4">
                    <h4 className="text-sm font-orbitron font-bold text-cyber-green mb-2">Đã chọn:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400">Họ tên:</p>
                        <p className="text-sm text-gray-200 font-semibold">{selectedUser.full_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Số dư:</p>
                        <p className="text-sm text-cyber-green font-jetbrains font-bold">{formatVND(selectedUser.balance)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Hạng:</p>
                        <p className="text-sm text-cyber-blue font-semibold">{getUserMembership(selectedUser)?.tier_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Giảm giá:</p>
                        <p className="text-sm text-cyber-amber font-jetbrains">{(getUserMembership(selectedUser)?.discount_rate * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Modal.CancelButton onClick={() => setShowStartModal(false)} />
              <Modal.ConfirmButton
                onClick={() => setStep(2)}
                disabled={!isWalkIn && !selectedUser}
              >
                Tiếp theo <ChevronRight size={16} />
              </Modal.ConfirmButton>
            </div>
          </div>
        )}

        {/* Step 2: Time Package */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-orbitron font-bold text-gray-200">Bước 2: Chọn Gói Thời Gian</h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: '30min', label: '30 phút', hours: 0.5 },
                { id: '1h', label: '1 giờ', hours: 1 },
                { id: '2h', label: '2 giờ', hours: 2 },
                { id: 'unlimited', label: 'Không giới hạn', hours: 0 }
              ].map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setTimePackage(pkg.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    timePackage === pkg.id
                      ? 'border-cyber-green bg-cyber-green/10'
                      : 'border-cyber-border hover:border-cyber-blue'
                  }`}
                >
                  <p className="font-orbitron font-bold text-lg text-gray-200">{pkg.label}</p>
                  {pkg.hours > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      ~{formatVND(selectedMachine?.hourly * pkg.hours * (1 - (selectedUser ? getUserMembership(selectedUser)?.discount_rate : 0)))}
                    </p>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-cyber-border text-gray-300 rounded font-rajdhani font-semibold hover:bg-cyber-border/70"
              >
                Quay lại
              </button>
              <Modal.ConfirmButton
                onClick={() => setStep(3)}
                disabled={!timePackage}
              >
                Tiếp theo <ChevronRight size={16} />
              </Modal.ConfirmButton>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-orbitron font-bold text-gray-200">Bước 3: Xác Nhận</h3>

            <div className="bg-cyber-dark border border-cyber-green rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400 font-rajdhani">Máy:</span>
                <span className="text-gray-200 font-jetbrains font-bold">{selectedMachine?.machine_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-rajdhani">Khách:</span>
                <span className="text-gray-200 font-rajdhani">{isWalkIn ? 'Khách vãng lai' : selectedUser?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-rajdhani">Gói:</span>
                <span className="text-gray-200 font-rajdhani">
                  {timePackage === '30min' ? '30 phút' : timePackage === '1h' ? '1 giờ' : timePackage === '2h' ? '2 giờ' : 'Không giới hạn'}
                </span>
              </div>
              {timePackage !== 'unlimited' && (
                <div className="flex justify-between border-t border-cyber-border pt-3">
                  <span className="text-gray-400 font-rajdhani">Ước tính chi phí:</span>
                  <span className="text-cyber-green font-jetbrains font-bold text-lg">{formatVND(estimateCost())}</span>
                </div>
              )}
              {selectedUser && selectedUser.balance < estimateCost() && (
                <div className="flex items-center gap-2 text-cyber-red text-sm p-2 bg-cyber-red/10 rounded">
                  <AlertTriangle size={16} />
                  <span className="font-rajdhani">Cảnh báo: Số dư không đủ!</span>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-cyber-border text-gray-300 rounded font-rajdhani font-semibold hover:bg-cyber-border/70"
              >
                Quay lại
              </button>
              <Modal.ConfirmButton
                onClick={() => {
                  alert('Bắt đầu phiên thành công!');
                  setShowStartModal(false);
                }}
              >
                Bắt Đầu Phiên
              </Modal.ConfirmButton>
            </div>
          </div>
        )}
      </Modal>

      {/* Machine Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Chi Tiết — ${selectedMachine?.machine_name}`}
        icon={<Monitor size={20} />}
        size="lg"
      >
        <div className="space-y-6">
          {/* Machine Info */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tên máy" value={selectedMachine?.machine_name} disabled />
            <FormField label="IP Address" value={selectedMachine?.ip} disabled />
            <FormField label="MAC Address" value={selectedMachine?.mac} disabled />
            <FormField label="Giá/giờ" value={selectedMachine?.hourly} type="number" disabled />
          </div>

          {/* Temperature Chart */}
          <div>
            <h4 className="text-sm font-orbitron font-bold text-gray-200 mb-3">LỊCH SỬ NHIỆT ĐỘ</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={getMachineHistory()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '10px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937' }}
                />
                <Line type="monotone" dataKey="temp" stroke="#00ff88" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Workstations;
