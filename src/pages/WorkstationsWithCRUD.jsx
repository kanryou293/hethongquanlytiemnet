import React, { useState, useEffect } from 'react';
import { Monitor, Play, Wrench, Grid, List, Search, Plus, Edit2, Trash2, AlertTriangle, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader, StatusBadge, Modal } from '../components/shared';
import { ConfirmDelete, FormFieldWithValidation } from '../components/shared/CRUDComponents';
import { useWorkstations } from '../hooks/useCRUD';
import { validateIP, validateMAC, validateRequired, validateRange } from '../utils/validation';
import { formatVND } from '../utils/formatters';
import api from '../services/api';

function WorkstationsWithCRUD() {
  const { data: machines, create, update, remove, bulkUpdate, loading: machinesLoading } = useWorkstations([]);
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch sessions and users from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sessionsData, usersData] = await Promise.all([
          api.sessions.getAll(),
          api.users.getAll()
        ]);
        setSessions(sessionsData);
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

  // CRUD Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);

  // Bulk price state
  const [bulkPrice, setBulkPrice] = useState(3000);
  const [bulkPriceError, setBulkPriceError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    machine_name: '',
    ip: '',
    mac: '',
    hourly: 3000,
    status: 'OFFLINE'
  });
  const [formErrors, setFormErrors] = useState({});

  const getActiveSession = (machineId) => {
    return sessions.find(s => s.machine_id === machineId && !s.endtime);
  };

  // Filtered machines
  const filteredMachines = machines.filter(machine => {
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

  // Validation
  const validateForm = () => {
    const errors = {};

    const nameError = validateRequired(formData.machine_name, 'Tên máy');
    if (nameError) errors.machine_name = nameError;
    else if (formData.machine_name.length > 20) errors.machine_name = 'Tên máy tối đa 20 ký tự';
    else {
      // Check unique (exclude current machine when editing)
      const duplicate = machines.find(m =>
        m.machine_name === formData.machine_name &&
        m.machine_id !== selectedMachine?.machine_id
      );
      if (duplicate) errors.machine_name = 'Tên máy đã tồn tại';
    }

    const ipError = validateIP(formData.ip);
    if (ipError) errors.ip = ipError;
    else {
      const duplicate = machines.find(m =>
        m.ip === formData.ip &&
        m.machine_id !== selectedMachine?.machine_id
      );
      if (duplicate) errors.ip = 'Địa chỉ IP đã được sử dụng';
    }

    const macError = validateMAC(formData.mac);
    if (macError) errors.mac = macError;
    else {
      const duplicate = machines.find(m =>
        m.mac === formData.mac.toUpperCase() &&
        m.machine_id !== selectedMachine?.machine_id
      );
      if (duplicate) errors.mac = 'Địa chỉ MAC đã được sử dụng';
    }

    const hourlyError = validateRange(formData.hourly, 1000, 50000, 'Giá giờ');
    if (hourlyError) errors.hourly = hourlyError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleCreate = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      await create({
        ...formData,
        mac: formData.mac.toUpperCase()
      });
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Create error:', error);
    }
  };

  const handleEdit = (machine) => {
    setSelectedMachine(machine);
    setFormData({
      machine_name: machine.machine_name,
      ip: machine.ip,
      mac: machine.mac,
      hourly: machine.hourly,
      status: machine.status
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      await update(selectedMachine.machine_id, {
        ...formData,
        mac: formData.mac.toUpperCase()
      });
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleDelete = (machine) => {
    // Check if machine has active session
    const activeSession = getActiveSession(machine.machine_id);
    if (activeSession) {
      toast.error('Không thể xóa máy đang có phiên hoạt động');
      return;
    }

    setSelectedMachine(machine);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await remove(selectedMachine.machine_id);
      setShowDeleteModal(false);
      setSelectedMachine(null);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      machine_name: '',
      ip: '',
      mac: '',
      hourly: 3000,
      status: 'OFFLINE'
    });
    setFormErrors({});
    setSelectedMachine(null);
  };

  const handleBulkPriceChange = async () => {
    const priceError = validateRange(bulkPrice, 1000, 50000, 'Giá giờ');
    if (priceError) {
      setBulkPriceError(priceError);
      toast.error('Vui lòng kiểm tra lại giá');
      return;
    }

    try {
      const machineIds = machines.map(m => m.machine_id);
      await bulkUpdate(machineIds, { hourly: bulkPrice });
      setShowBulkPriceModal(false);
      setBulkPrice(3000);
      setBulkPriceError(null);
    } catch (error) {
      console.error('Bulk price update error:', error);
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

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

        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-rajdhani">IP:</span>
            <span className="text-gray-200 font-jetbrains">{machine.ip}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-rajdhani">MAC:</span>
            <span className="text-gray-200 font-jetbrains text-xs">{machine.mac}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-rajdhani">Giá/giờ:</span>
            <span className="text-cyber-amber font-jetbrains font-bold">{formatVND(machine.hourly)}</span>
          </div>
        </div>

        {isActive ? (
          <div className="bg-cyber-dark border border-cyber-green/30 rounded p-2 mb-3">
            <p className="text-xs text-gray-400 font-rajdhani">Đang sử dụng:</p>
            <p className="text-sm text-cyber-green font-rajdhani font-semibold">
              {session.is_walk_in
                ? `Khách #${session.session_id}`
                : (session.full_name || user?.full_name || session.username || 'N/A')}
            </p>
          </div>
        ) : (
          <div className="bg-cyber-dark border border-cyber-border rounded p-2 mb-3 text-center">
            <p className="text-xs text-gray-500 font-rajdhani">
              {machine.status === 'MAINTENANCE' ? 'Đang bảo trì' : 'Sẵn sàng'}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(machine)}
            className="flex-1 p-2 bg-cyber-blue/20 text-cyber-blue rounded hover:bg-cyber-blue/30 transition-colors"
            title="Chỉnh sửa"
          >
            <Edit2 size={16} className="mx-auto" />
          </button>
          <button
            onClick={() => handleDelete(machine)}
            className="flex-1 p-2 bg-cyber-red/20 text-cyber-red rounded hover:bg-cyber-red/30 transition-colors"
            title="Xóa"
          >
            <Trash2 size={16} className="mx-auto" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="QUẢN LÝ MÁY"
        subtitle="Quản lý máy trạm - Knight Tree Net"
        breadcrumbs={['Máy Trạm']}
        actions={[
          {
            label: 'Đổi Giá Tất Cả',
            icon: <DollarSign size={18} />,
            onClick: () => {
              setBulkPrice(machines[0]?.hourly || 3000);
              setBulkPriceError(null);
              setShowBulkPriceModal(true);
            },
            variant: 'secondary'
          },
          {
            label: 'Thêm Máy',
            icon: <Plus size={18} />,
            onClick: () => {
              resetForm();
              setShowCreateModal(true);
            },
            variant: 'primary'
          }
        ]}
      />

      {(loading || machinesLoading) ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-cyber-green font-rajdhani text-xl">Đang tải...</div>
        </div>
      ) : (
        <>
          {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <p className="text-gray-400 text-sm font-rajdhani">Tổng Máy</p>
          <p className="text-3xl font-jetbrains font-bold text-cyber-green mt-2">{machines.length}</p>
        </div>
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <p className="text-gray-400 text-sm font-rajdhani">Đang Dùng</p>
          <p className="text-3xl font-jetbrains font-bold text-cyber-blue mt-2">
            {machines.filter(m => getActiveSession(m.machine_id)).length}
          </p>
        </div>
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <p className="text-gray-400 text-sm font-rajdhani">Trống</p>
          <p className="text-3xl font-jetbrains font-bold text-cyber-amber mt-2">
            {machines.filter(m => !getActiveSession(m.machine_id) && m.status !== 'MAINTENANCE').length}
          </p>
        </div>
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <p className="text-gray-400 text-sm font-rajdhani">Bảo Trì</p>
          <p className="text-3xl font-jetbrains font-bold text-cyber-red mt-2">
            {machines.filter(m => m.status === 'MAINTENANCE').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {['all', 'ONLINE', 'OFFLINE', 'MAINTENANCE'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded font-rajdhani font-semibold transition-colors ${
                statusFilter === status
                  ? 'bg-cyber-green text-cyber-dark'
                  : 'bg-cyber-border text-gray-400 hover:bg-cyber-border/70'
              }`}
            >
              {status === 'all' ? 'Tất Cả' : status === 'ONLINE' ? 'Đang Dùng' : status === 'OFFLINE' ? 'Trống' : 'Bảo Trì'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc IP..."
              className="pl-10 pr-4 py-2 bg-cyber-card border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green"
            />
          </div>

          <div className="flex gap-2 bg-cyber-card border border-cyber-border rounded p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-cyber-green text-cyber-dark' : 'text-gray-400'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table' ? 'bg-cyber-green text-cyber-dark' : 'text-gray-400'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Machine Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMachines.map(renderMachineCard)}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          title="Thêm Máy Mới"
          size="md"
        >
          <div className="space-y-4">
            <FormFieldWithValidation
              label="Tên máy"
              name="machine_name"
              value={formData.machine_name}
              onChange={handleFieldChange}
              error={formErrors.machine_name}
              placeholder="PC-21"
              required
              autoFocus
            />

            <FormFieldWithValidation
              label="Địa chỉ IP"
              name="ip"
              value={formData.ip}
              onChange={handleFieldChange}
              error={formErrors.ip}
              placeholder="192.168.1.100"
              required
              helperText="Định dạng: xxx.xxx.xxx.xxx"
            />

            <FormFieldWithValidation
              label="Địa chỉ MAC"
              name="mac"
              value={formData.mac}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setFormData(prev => ({ ...prev, mac: value }));
                if (formErrors.mac) {
                  setFormErrors(prev => ({ ...prev, mac: null }));
                }
              }}
              error={formErrors.mac}
              placeholder="AA:BB:CC:DD:EE:FF"
              required
              helperText="Định dạng: XX:XX:XX:XX:XX:XX"
            />

            <FormFieldWithValidation
              label="Giá giờ (VNĐ)"
              name="hourly"
              type="number"
              value={formData.hourly}
              onChange={handleFieldChange}
              error={formErrors.hourly}
              min={1000}
              max={50000}
              step={500}
              required
              helperText={`Hiển thị: ${formatVND(formData.hourly)}`}
            />

            <FormFieldWithValidation
              label="Trạng thái"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleFieldChange}
              options={[
                { value: 'OFFLINE', label: 'Trống' },
                { value: 'ONLINE', label: 'Đang dùng' },
                { value: 'MAINTENANCE', label: 'Bảo trì' }
              ]}
              required
            />

            <div className="flex gap-3 pt-4">
              <Modal.CancelButton onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}>
                Hủy
              </Modal.CancelButton>
              <Modal.ConfirmButton onClick={handleCreate}>
                Thêm Máy
              </Modal.ConfirmButton>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMachine && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowEditModal(false);
            resetForm();
          }}
          title={`Chỉnh Sửa — ${selectedMachine.machine_name}`}
          size="md"
        >
          <div className="space-y-4">
            <FormFieldWithValidation
              label="Tên máy"
              name="machine_name"
              value={formData.machine_name}
              onChange={handleFieldChange}
              error={formErrors.machine_name}
              required
              autoFocus
            />

            <FormFieldWithValidation
              label="Địa chỉ IP"
              name="ip"
              value={formData.ip}
              onChange={handleFieldChange}
              error={formErrors.ip}
              required
            />

            <FormFieldWithValidation
              label="Địa chỉ MAC"
              name="mac"
              value={formData.mac}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setFormData(prev => ({ ...prev, mac: value }));
                if (formErrors.mac) {
                  setFormErrors(prev => ({ ...prev, mac: null }));
                }
              }}
              error={formErrors.mac}
              required
            />

            <FormFieldWithValidation
              label="Giá giờ (VNĐ)"
              name="hourly"
              type="number"
              value={formData.hourly}
              onChange={handleFieldChange}
              error={formErrors.hourly}
              min={1000}
              max={50000}
              step={500}
              required
              helperText={`Hiển thị: ${formatVND(formData.hourly)}`}
            />

            <FormFieldWithValidation
              label="Trạng thái"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleFieldChange}
              options={[
                { value: 'OFFLINE', label: 'Trống' },
                { value: 'ONLINE', label: 'Đang dùng' },
                { value: 'MAINTENANCE', label: 'Bảo trì' }
              ]}
              required
            />

            <div className="flex gap-3 pt-4">
              <Modal.CancelButton onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}>
                Hủy
              </Modal.CancelButton>
              <Modal.ConfirmButton onClick={handleUpdate}>
                Cập Nhật
              </Modal.ConfirmButton>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDelete
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMachine(null);
        }}
        onConfirm={confirmDelete}
        itemLabel={selectedMachine?.machine_name || ''}
        itemName={selectedMachine?.machine_name || ''}
      />

      {/* Bulk Price Change Modal */}
      {showBulkPriceModal && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowBulkPriceModal(false);
            setBulkPriceError(null);
          }}
          title="Đổi Giá Tất Cả Máy"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-cyber-dark border border-cyber-amber rounded-lg p-4">
              <p className="text-sm text-gray-300 font-rajdhani mb-2">
                Thay đổi giá giờ cho <span className="text-cyber-amber font-bold">{machines.length} máy</span>
              </p>
              <p className="text-xs text-gray-400 font-rajdhani">
                Giá hiện tại: {formatVND(machines[0]?.hourly || 3000)}/giờ
              </p>
            </div>

            <FormFieldWithValidation
              label="Giá giờ mới (VNĐ)"
              name="bulkPrice"
              type="number"
              value={bulkPrice}
              onChange={(e) => {
                setBulkPrice(parseInt(e.target.value));
                if (bulkPriceError) setBulkPriceError(null);
              }}
              error={bulkPriceError}
              min={1000}
              max={50000}
              step={500}
              required
              autoFocus
              helperText={`Hiển thị: ${formatVND(bulkPrice)}/giờ`}
            />

            <div className="bg-cyber-dark border border-cyber-border rounded-lg p-3">
              <p className="text-xs text-gray-400 font-rajdhani mb-2">Ví dụ tính giá:</p>
              <div className="space-y-1 text-xs font-jetbrains">
                <div className="flex justify-between">
                  <span className="text-gray-400">1 giờ:</span>
                  <span className="text-cyber-green">{formatVND(bulkPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">2 giờ:</span>
                  <span className="text-cyber-green">{formatVND(bulkPrice * 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">3 giờ:</span>
                  <span className="text-cyber-green">{formatVND(bulkPrice * 3)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Modal.CancelButton onClick={() => {
                setShowBulkPriceModal(false);
                setBulkPriceError(null);
              }}>
                Hủy
              </Modal.CancelButton>
              <Modal.ConfirmButton onClick={handleBulkPriceChange}>
                Cập Nhật Tất Cả
              </Modal.ConfirmButton>
            </div>
          </div>
        </Modal>
      )}
        </>
      )}
    </div>
  );
}

export default WorkstationsWithCRUD;
