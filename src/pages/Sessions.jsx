import React, { useState, useEffect, useMemo } from 'react';
import { StopCircle, Clock, DollarSign, Users, TrendingUp, Calendar, Search, ChevronDown, ChevronUp, Play, ChevronRight, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader, StatusBadge, Modal, DataTable } from '../components/shared';
import { formatVND, formatElapsedTime, calculateSessionCost } from '../utils/formatters';
import api from '../services/api';

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [machineFilter, setMachineFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [endSessionModal, setEndSessionModal] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  // Start session modal states
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState('');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sessionsData, workstationsData, usersData] = await Promise.all([
          api.sessions.getAll(),
          api.workstations.getAll(),
          api.users.getAll()
        ]);
        setSessions(sessionsData);
        setWorkstations(workstationsData);
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

  // Live timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const enrichedSessions = useMemo(() => {
    return sessions.map(session => {
      // Data already joined from backend
      const currentCost = session.endtime
        ? session.cost
        : calculateSessionCost(session.starttime, session.hourly_rate || 3000, session.discount_rate || 0);

      return { ...session, currentCost };
    });
  }, [sessions, currentTime]);

  const filteredSessions = useMemo(() => {
    let filtered = enrichedSessions;

    if (statusFilter === 'active') {
      filtered = filtered.filter(s => !s.endtime);
    } else if (statusFilter === 'ended') {
      filtered = filtered.filter(s => s.endtime);
    }

    if (machineFilter !== 'all') {
      filtered = filtered.filter(s => s.machine_id === parseInt(machineFilter));
    }

    if (userSearch) {
      filtered = filtered.filter(s =>
        s.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        s.username?.toLowerCase().includes(userSearch.toLowerCase())
      );
    }

    return filtered;
  }, [enrichedSessions, statusFilter, machineFilter, userSearch]);

  const activeSessions = enrichedSessions.filter(s => !s.endtime);
  const todayRevenue = enrichedSessions.reduce((sum, s) => sum + s.currentCost, 0);
  const avgDuration = enrichedSessions.length > 0
    ? enrichedSessions.reduce((sum, s) => {
        const end = s.endtime ? new Date(s.endtime) : new Date();
        const start = new Date(s.starttime);
        return sum + (end - start) / 1000 / 60;
      }, 0) / enrichedSessions.length
    : 0;

  const handleEndSession = (session) => {
    setEndSessionModal(session);
  };

  const confirmEndSession = async () => {
    if (!endSessionModal) return;

    const loadingToast = toast.loading('Đang kết thúc phiên...');

    try {
      const result = await api.sessions.end(endSessionModal.session_id);

      // Update sessions list
      setSessions(sessions.map(s =>
        s.session_id === endSessionModal.session_id ? result : s
      ));

      // Refresh workstations to update status
      const workstationsData = await api.workstations.getAll();
      setWorkstations(workstationsData);

      toast.success('Đã kết thúc phiên!', { id: loadingToast });
      setEndSessionModal(null);
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
    }
  };

  const handleStartSession = (machine) => {
    setSelectedMachine(machine);
    setShowStartModal(true);
    setStep(1);
    setSelectedUser(null);
    setUserSearchTerm('');
    setIsWalkIn(false);
    setWalkInName('');
  };

  const confirmStartSession = async () => {
    if (!selectedMachine) return;
    if (!isWalkIn && !selectedUser) return;

    const loadingToast = toast.loading('Đang mở phiên...');

    try {
      const sessionData = {
        machine_id: selectedMachine.machine_id
      };

      if (isWalkIn) {
        sessionData.is_walk_in = true;
      } else {
        sessionData.user_id = selectedUser.user_id;
      }

      const newSession = await api.sessions.create(sessionData);

      // Refresh data
      const [sessionsData, workstationsData] = await Promise.all([
        api.sessions.getAll(),
        api.workstations.getAll()
      ]);
      setSessions(sessionsData);
      setWorkstations(workstationsData);

      toast.success('Đã mở phiên thành công!', { id: loadingToast });
      setShowStartModal(false);
      setSelectedMachine(null);
      setSelectedUser(null);
      setStep(1);
      setIsWalkIn(false);
      setWalkInName('');
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.number_phone?.includes(userSearchTerm)
  );

  const availableMachines = workstations.filter(w => w.status === 'OFFLINE');

  const columns = [
    {
      key: 'session_id',
      label: 'ID',
      render: (session) => (
        <span className="font-jetbrains text-cyber-green">#{session.session_id}</span>
      )
    },
    {
      key: 'machine_name',
      label: 'Máy',
      render: (session) => (
        <span className="font-jetbrains font-bold">{session.machine_name}</span>
      )
    },
    {
      key: 'user',
      label: 'Khách Hàng',
      render: (session) => (
        <div>
          <p className="font-rajdhani font-semibold">{session.full_name}</p>
          <p className="text-xs text-gray-400 font-jetbrains">{session.username}</p>
        </div>
      )
    },
    {
      key: 'starttime',
      label: 'Bắt Đầu',
      render: (session) => (
        <span className="font-jetbrains text-sm">
          {new Date(session.starttime).toLocaleString('vi-VN')}
        </span>
      )
    },
    {
      key: 'elapsed',
      label: 'Thời Gian',
      render: (session) => {
        const elapsed = formatElapsedTime(
          session.starttime,
          session.endtime || new Date().toISOString()
        );
        return (
          <span className={`font-jetbrains font-bold ${!session.endtime ? 'text-cyber-green' : 'text-gray-400'}`}>
            {elapsed}
          </span>
        );
      }
    },
    {
      key: 'cost',
      label: 'Chi Phí',
      render: (session) => (
        <div>
          <p className="font-jetbrains font-bold text-cyber-amber">
            {formatVND(session.currentCost)}
          </p>
          <p className="text-xs text-gray-400">
            {formatVND(session.hourly_rate)}/giờ
          </p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      render: (session) => (
        <StatusBadge
          status={session.endtime ? 'ENDED' : 'ACTIVE'}
          type="session"
        />
      )
    },
    {
      key: 'actions',
      label: 'Thao Tác',
      render: (session) => (
        !session.endtime ? (
          <button
            onClick={() => handleEndSession(session)}
            className="px-3 py-1 bg-cyber-red/20 text-cyber-red rounded hover:bg-cyber-red/30 transition-colors font-rajdhani font-semibold flex items-center gap-1"
          >
            <StopCircle size={16} />
            Kết Thúc
          </button>
        ) : (
          <span className="text-gray-500 text-sm font-rajdhani">Đã kết thúc</span>
        )
      )
    }
  ];

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
        title="PHIÊN CHƠI"
        subtitle="Quản lý phiên chơi - Knight Tree Net"
        breadcrumbs={['Phiên Chơi']}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="text-cyber-green" size={32} />
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Đang Chơi</p>
              <p className="text-3xl font-jetbrains font-bold text-cyber-green">{activeSessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="text-cyber-amber" size={32} />
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Doanh Thu</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-amber">{formatVND(todayRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="text-cyber-blue" size={32} />
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">TB Thời Gian</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-blue">{Math.round(avgDuration)} phút</p>
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-cyber-green" size={32} />
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Tổng Phiên</p>
              <p className="text-3xl font-jetbrains font-bold text-gray-200">{sessions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          {['all', 'active', 'ended'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded font-rajdhani font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-cyber-green text-cyber-dark'
                  : 'bg-cyber-border text-gray-400 hover:bg-cyber-border/70'
              }`}
            >
              {status === 'all' ? 'Tất Cả' : status === 'active' ? 'Đang Chơi' : 'Đã Kết Thúc'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
            className="px-4 py-2 bg-cyber-card border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green"
          >
            <option value="all">Tất cả máy</option>
            {workstations.map(w => (
              <option key={w.machine_id} value={w.machine_id}>{w.machine_name}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Tìm khách hàng..."
              className="pl-10 pr-4 py-2 bg-cyber-card border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green"
            />
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <DataTable
        columns={columns}
        data={filteredSessions}
        emptyMessage="Không có phiên nào"
      />

      {/* End Session Modal */}
      {endSessionModal && (
        <Modal
          isOpen={true}
          onClose={() => setEndSessionModal(null)}
          title="Kết Thúc Phiên"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 font-rajdhani">Máy:</p>
                  <p className="font-jetbrains font-bold text-cyber-green">{endSessionModal.machine_name}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-rajdhani">Khách hàng:</p>
                  <p className="font-rajdhani font-semibold">{endSessionModal.full_name}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-rajdhani">Thời gian:</p>
                  <p className="font-jetbrains font-bold text-cyber-blue">
                    {formatElapsedTime(endSessionModal.starttime, new Date().toISOString())}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-rajdhani">Chi phí:</p>
                  <p className="font-jetbrains font-bold text-cyber-amber text-xl">
                    {formatVND(endSessionModal.currentCost)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-cyber-amber/10 border border-cyber-amber rounded-lg p-3">
              <p className="text-sm text-gray-300 font-rajdhani">
                Số tiền sẽ được trừ từ tài khoản khách hàng
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Modal.CancelButton onClick={() => setEndSessionModal(null)}>
                Hủy
              </Modal.CancelButton>
              <Modal.ConfirmButton onClick={confirmEndSession}>
                Xác Nhận Kết Thúc
              </Modal.ConfirmButton>
            </div>
          </div>
        </Modal>
      )}

      {/* Start Session Modal */}
      {showStartModal && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowStartModal(false);
            setSelectedMachine(null);
            setSelectedUser(null);
            setStep(1);
          }}
          title={`Mở Phiên Mới - ${selectedMachine?.machine_name}`}
          size="lg"
        >
          <div className="space-y-4">
            {step === 1 && (
              <>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      setIsWalkIn(false);
                      setWalkInName('');
                    }}
                    className={`flex-1 px-4 py-3 rounded font-rajdhani font-semibold transition-colors ${
                      !isWalkIn
                        ? 'bg-cyber-green text-cyber-dark'
                        : 'bg-cyber-border text-gray-400 hover:bg-cyber-border/70'
                    }`}
                  >
                    Khách Thành Viên
                  </button>
                  <button
                    onClick={() => {
                      setIsWalkIn(true);
                      setSelectedUser(null);
                    }}
                    className={`flex-1 px-4 py-3 rounded font-rajdhani font-semibold transition-colors ${
                      isWalkIn
                        ? 'bg-cyber-amber text-cyber-dark'
                        : 'bg-cyber-border text-gray-400 hover:bg-cyber-border/70'
                    }`}
                  >
                    Khách Vãng Lai
                  </button>
                </div>

                {!isWalkIn ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        placeholder="Tìm khách hàng (tên, username, SĐT)..."
                        className="w-full pl-10 pr-4 py-3 bg-cyber-card border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {filteredUsers.map(user => (
                        <button
                          key={user.user_id}
                          onClick={() => {
                            setSelectedUser(user);
                            setStep(2);
                          }}
                          className="w-full p-4 bg-cyber-card border border-cyber-border rounded-lg hover:border-cyber-green transition-colors text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-rajdhani font-semibold text-lg">{user.full_name}</p>
                              <p className="text-sm text-gray-400 font-jetbrains">{user.username} • {user.number_phone}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400 font-rajdhani">Số dư</p>
                              <p className="font-jetbrains font-bold text-cyber-green">{formatVND(user.balance)}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-cyber-amber/10 border border-cyber-amber rounded-lg p-4 text-center">
                      <p className="text-lg font-rajdhani font-semibold text-gray-200 mb-2">
                        Mở phiên cho khách vãng lai
                      </p>
                      <p className="text-sm text-gray-400 font-rajdhani">
                        Hệ thống sẽ tự động tạo tên khách hàng
                      </p>
                      <p className="text-sm text-gray-400 font-rajdhani mt-1">
                        Thanh toán tiền mặt khi kết thúc phiên
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Modal.CancelButton onClick={() => {
                        setShowStartModal(false);
                        setSelectedMachine(null);
                        setStep(1);
                        setIsWalkIn(false);
                        setWalkInName('');
                      }}>
                        Hủy
                      </Modal.CancelButton>
                      <Modal.ConfirmButton onClick={confirmStartSession}>
                        Xác Nhận Mở Phiên
                      </Modal.ConfirmButton>
                    </div>
                  </>
                )}
              </>
            )}

            {step === 2 && (isWalkIn || selectedUser) && (
              <>
                <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4">
                  <h3 className="font-rajdhani font-bold text-lg mb-3">Thông Tin Phiên</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 font-rajdhani">Máy:</p>
                      <p className="font-jetbrains font-bold text-cyber-green">{selectedMachine.machine_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-rajdhani">Giá giờ:</p>
                      <p className="font-jetbrains font-bold text-cyber-amber">{formatVND(selectedMachine.hourly)}/giờ</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-rajdhani">Loại khách:</p>
                      <p className="font-rajdhani font-semibold">
                        {isWalkIn ? (
                          <span className="text-cyber-amber">Khách vãng lai</span>
                        ) : (
                          <span className="text-cyber-green">Thành viên</span>
                        )}
                      </p>
                    </div>
                    {!isWalkIn && selectedUser && (
                      <>
                        <div>
                          <p className="text-gray-400 font-rajdhani">Khách hàng:</p>
                          <p className="font-rajdhani font-semibold">{selectedUser.full_name}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-400 font-rajdhani">Số dư:</p>
                          <p className="font-jetbrains font-bold text-cyber-green">{formatVND(selectedUser.balance)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {isWalkIn && (
                  <div className="bg-cyber-amber/10 border border-cyber-amber rounded-lg p-3">
                    <p className="text-sm text-gray-300 font-rajdhani">
                      Khách vãng lai thanh toán tiền mặt khi kết thúc phiên
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Modal.CancelButton onClick={() => setStep(1)}>
                    Quay Lại
                  </Modal.CancelButton>
                  <Modal.ConfirmButton onClick={confirmStartSession}>
                    Xác Nhận Mở Phiên
                  </Modal.ConfirmButton>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Quick Start Buttons */}
      {availableMachines.length > 0 && (
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <h3 className="font-rajdhani font-bold text-lg mb-3 flex items-center gap-2">
            <Play size={20} className="text-cyber-green" />
            Máy Trống - Mở Phiên Nhanh
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {availableMachines.map(machine => (
              <button
                key={machine.machine_id}
                onClick={() => handleStartSession(machine)}
                className="p-3 bg-cyber-dark border border-cyber-border rounded hover:border-cyber-green transition-colors"
              >
                <p className="font-jetbrains font-bold text-cyber-green">{machine.machine_name}</p>
                <p className="text-xs text-gray-400 font-rajdhani">{formatVND(machine.hourly)}/h</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Sessions;
