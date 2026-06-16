import React, { useState, useEffect } from 'react';
import { DollarSign, Search, CreditCard, Banknote, QrCode, ArrowRight, Check, TrendingUp, Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader, Modal } from '../components/shared';
import { formatVND } from '../utils/formatters';
import api from '../services/api';

function TopUp() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [currentStep, setCurrentStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, transactionsData] = await Promise.all([
          api.users.getAll(),
          api.topUp.getAll()
        ]);
        setUsers(usersData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.number_phone.includes(searchTerm)
  );

  const quickAmounts = [10000, 20000, 50000, 100000, 200000, 500000];

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm('');
    setCurrentStep(2);
  };

  const handleAmountSelect = (value) => {
    setAmount(value.toString());
  };

  const handleNextStep = () => {
    if (currentStep === 2 && (!amount || parseInt(amount) < 1000)) {
      alert('Vui lòng nhập số tiền tối thiểu 1,000 VNĐ');
      return;
    }
    if (currentStep === 3) {
      setShowModal(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleConfirm = async () => {
    if (paymentMethod === 'transfer') {
      setShowModal(false);
      setShowQRCode(true);
      return;
    }

    const loadingToast = toast.loading('Đang nạp tiền...');

    try {
      const newTransaction = await api.topUp.create({
        user_id: selectedUser.user_id,
        staff_id: 1, // TODO: Get from auth context
        amount: parseInt(amount),
        paymentmethod: paymentMethod
      });

      // Refresh data
      const [usersData, transactionsData] = await Promise.all([
        api.users.getAll(),
        api.topUp.getAll()
      ]);
      setUsers(usersData);
      setTransactions(transactionsData);

      toast.success(`Đã nạp ${formatVND(parseInt(amount))} thành công!`, { id: loadingToast });
      setShowModal(false);

      // Reset form
      setTimeout(() => {
        setSelectedUser(null);
        setAmount('');
        setPaymentMethod('cash');
        setCurrentStep(1);
      }, 500);
    } catch (error) {
      console.error('Error creating top-up:', error);
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
    }
  };

  const handleQRConfirm = async () => {
    const loadingToast = toast.loading('Đang xác nhận chuyển khoản...');

    try {
      const newTransaction = await api.topUp.create({
        user_id: selectedUser.user_id,
        staff_id: 1,
        amount: parseInt(amount),
        paymentmethod: 'transfer'
      });

      // Refresh data
      const [usersData, transactionsData] = await Promise.all([
        api.users.getAll(),
        api.topUp.getAll()
      ]);
      setUsers(usersData);
      setTransactions(transactionsData);

      toast.success(`Đã nạp ${formatVND(parseInt(amount))} thành công!`, { id: loadingToast });
      setShowQRCode(false);

      setTimeout(() => {
        setSelectedUser(null);
        setAmount('');
        setPaymentMethod('cash');
        setCurrentStep(1);
      }, 500);
    } catch (error) {
      console.error('Error creating top-up:', error);
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.user_id === userId);
    return user?.full_name || `User #${userId}`;
  };

  const getStaffName = (staffId) => {
    return `Staff #${staffId}`; // TODO: Fetch staff data from API
  };

  const todayTransactions = transactions.filter(t =>
    new Date(t.created_at).toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="NẠP TIỀN"
        subtitle="Nạp tiền cho khách hàng - Knight Tree Net"
        breadcrumbs={['Nạp Tiền']}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Giao Dịch Hôm Nay</p>
              <p className="text-3xl font-jetbrains font-bold text-cyber-green mt-2">
                {todayTransactions.length}
              </p>
            </div>
            <div className="p-3 bg-cyber-green/20 rounded-lg">
              <TrendingUp className="text-cyber-green" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Tổng Tiền Nạp</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-blue mt-2">
                {formatVND(todayTransactions.reduce((sum, t) => sum + t.amount, 0))}
              </p>
            </div>
            <div className="p-3 bg-cyber-blue/20 rounded-lg">
              <DollarSign className="text-cyber-blue" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Khách Hàng</p>
              <p className="text-3xl font-jetbrains font-bold text-cyber-amber mt-2">
                {new Set(todayTransactions.map(t => t.user_id)).size}
              </p>
            </div>
            <div className="p-3 bg-cyber-amber/20 rounded-lg">
              <UsersIcon className="text-cyber-amber" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-up Form */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">FORM NẠP TIỀN</h2>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-jetbrains font-bold ${
                    currentStep >= step
                      ? 'bg-cyber-green text-cyber-dark'
                      : 'bg-cyber-border text-gray-400'
                  }`}>
                    {currentStep > step ? <Check size={20} /> : step}
                  </div>
                  <p className={`text-xs font-rajdhani mt-1 ${
                    currentStep >= step ? 'text-cyber-green' : 'text-gray-400'
                  }`}>
                    {step === 1 ? 'Chọn KH' : step === 2 ? 'Số tiền' : 'Thanh toán'}
                  </p>
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-cyber-green' : 'bg-cyber-border'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Select User */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-rajdhani font-semibold text-gray-300 mb-2">
                  Tìm kiếm khách hàng
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tên, username hoặc số điện thoại..."
                    className="w-full pl-10 pr-4 py-3 bg-cyber-dark border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green"
                  />
                </div>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {(searchTerm ? filteredUsers : users.slice(0, 10)).map((user) => (
                  <div
                    key={user.user_id}
                    onClick={() => handleUserSelect(user)}
                    className="p-4 bg-cyber-dark border border-cyber-border rounded hover:border-cyber-green cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-rajdhani font-semibold text-gray-200">{user.full_name}</p>
                        <p className="text-sm text-gray-400 font-jetbrains">@{user.username} • {user.number_phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-rajdhani">Số dư</p>
                        <p className="text-cyber-green font-jetbrains font-bold">{formatVND(user.balance)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Enter Amount */}
          {currentStep === 2 && selectedUser && (
            <div className="space-y-4">
              {/* Selected User */}
              <div className="p-4 bg-cyber-green/10 border border-cyber-green rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-rajdhani font-semibold text-gray-200">{selectedUser.full_name}</p>
                    <p className="text-sm text-gray-400 font-jetbrains">@{selectedUser.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-rajdhani">Số dư hiện tại</p>
                    <p className="text-cyber-green font-jetbrains font-bold">{formatVND(selectedUser.balance)}</p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-rajdhani font-semibold text-gray-300 mb-2">
                  Nhập số tiền (VNĐ)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                  min="1000"
                  step="1000"
                  className="w-full px-4 py-3 bg-cyber-dark border border-cyber-border rounded font-jetbrains text-gray-200 text-lg focus:outline-none focus:border-cyber-green"
                />
                {amount && (
                  <p className="mt-2 text-lg text-cyber-green font-jetbrains font-bold">
                    {formatVND(parseInt(amount) || 0)}
                  </p>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <p className="text-sm font-rajdhani font-semibold text-gray-300 mb-2">Chọn nhanh</p>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleAmountSelect(value)}
                      className="px-3 py-2 bg-cyber-border text-gray-300 rounded hover:bg-cyber-green hover:text-cyber-dark transition-colors font-rajdhani font-semibold text-sm"
                    >
                      {formatVND(value)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 px-4 py-3 bg-cyber-border text-gray-300 rounded font-rajdhani font-semibold hover:bg-cyber-border/70 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!amount || parseInt(amount) < 1000}
                  className="flex-1 px-4 py-3 bg-cyber-green text-cyber-dark rounded font-rajdhani font-semibold hover:bg-cyber-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Tiếp tục
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {currentStep === 3 && selectedUser && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4 bg-cyber-dark border border-cyber-border rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 font-rajdhani">Khách hàng:</span>
                  <span className="text-gray-200 font-rajdhani font-semibold">{selectedUser.full_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-rajdhani">Số tiền nạp:</span>
                  <span className="text-cyber-green font-jetbrains font-bold text-xl">{formatVND(parseInt(amount))}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-rajdhani font-semibold text-gray-300 mb-3">
                  Chọn phương thức thanh toán
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-cyber-green bg-cyber-green/10'
                        : 'border-cyber-border bg-cyber-dark hover:border-cyber-green/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${
                        paymentMethod === 'cash' ? 'bg-cyber-green/20' : 'bg-cyber-border'
                      }`}>
                        <Banknote className={paymentMethod === 'cash' ? 'text-cyber-green' : 'text-gray-400'} size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-rajdhani font-bold text-gray-200">Tiền mặt</p>
                        <p className="text-sm text-gray-400 font-rajdhani">Thanh toán trực tiếp tại quầy</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-4 rounded border-2 transition-all ${
                      paymentMethod === 'transfer'
                        ? 'border-cyber-blue bg-cyber-blue/10'
                        : 'border-cyber-border bg-cyber-dark hover:border-cyber-blue/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${
                        paymentMethod === 'transfer' ? 'bg-cyber-blue/20' : 'bg-cyber-border'
                      }`}>
                        <CreditCard className={paymentMethod === 'transfer' ? 'text-cyber-blue' : 'text-gray-400'} size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-rajdhani font-bold text-gray-200">Chuyển khoản</p>
                        <p className="text-sm text-gray-400 font-rajdhani">Quét mã QR để thanh toán</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 px-4 py-3 bg-cyber-border text-gray-300 rounded font-rajdhani font-semibold hover:bg-cyber-border/70 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 px-4 py-3 bg-cyber-green text-cyber-dark rounded font-rajdhani font-semibold hover:bg-cyber-green/90 transition-colors flex items-center justify-center gap-2"
                >
                  Xác nhận
                  <Check size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <h3 className="text-lg font-orbitron font-bold text-gray-200 mb-4">PHƯƠNG THỨC THANH TOÁN</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-cyber-dark rounded">
              <div className="flex items-center gap-2">
                <Banknote className="text-cyber-green" size={20} />
                <span className="text-gray-300 font-rajdhani">Tiền mặt:</span>
              </div>
              <span className="text-cyber-green font-jetbrains font-bold">
                {formatVND(
                  todayTransactions
                    .filter(t => t.paymentmethod === 'cash')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-cyber-dark rounded">
              <div className="flex items-center gap-2">
                <CreditCard className="text-cyber-blue" size={20} />
                <span className="text-gray-300 font-rajdhani">Chuyển khoản:</span>
              </div>
              <span className="text-cyber-blue font-jetbrains font-bold">
                {formatVND(
                  todayTransactions
                    .filter(t => t.paymentmethod === 'transfer')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">LỊCH SỬ GIAO DỊCH</h2>
        <div className="bg-cyber-card border border-cyber-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyber-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Người dùng</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Số tiền</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Phương thức</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Nhân viên</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {transactions.slice(0, 15).map((transaction) => (
                  <tr key={transaction.tut_id} className="hover:bg-cyber-border/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">#{transaction.tut_id}</td>
                    <td className="px-4 py-3 text-sm font-rajdhani font-semibold text-gray-200">
                      {getUserName(transaction.user_id)}
                    </td>
                    <td className="px-4 py-3 text-sm font-jetbrains font-bold text-cyber-green">
                      +{formatVND(transaction.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-rajdhani ${
                        transaction.paymentmethod === 'cash'
                          ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green'
                          : 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue'
                      }`}>
                        {transaction.paymentmethod === 'cash' ? (
                          <><Banknote size={12} /> Tiền mặt</>
                        ) : (
                          <><CreditCard size={12} /> Chuyển khoản</>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-rajdhani text-gray-400">
                      {getStaffName(transaction.staff_id)}
                    </td>
                    <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">
                      {new Date(transaction.created_at).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowModal(false)}
          title="Xác Nhận Nạp Tiền"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400 font-rajdhani">Khách hàng:</span>
                <span className="text-gray-200 font-rajdhani font-semibold">{selectedUser?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-rajdhani">Username:</span>
                <span className="text-cyber-blue font-jetbrains">@{selectedUser?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-rajdhani">Số dư hiện tại:</span>
                <span className="text-gray-200 font-jetbrains">{formatVND(selectedUser?.balance || 0)}</span>
              </div>
              <div className="flex justify-between border-t border-cyber-border pt-3">
                <span className="text-gray-400 font-rajdhani">Số tiền nạp:</span>
                <span className="text-cyber-green font-jetbrains font-bold text-xl">{formatVND(parseInt(amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-rajdhani">Số dư sau nạp:</span>
                <span className="text-cyber-green font-jetbrains font-bold text-xl">
                  {formatVND((selectedUser?.balance || 0) + parseInt(amount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-rajdhani">Phương thức:</span>
                <span className={`font-rajdhani font-semibold ${
                  paymentMethod === 'cash' ? 'text-cyber-green' : 'text-cyber-blue'
                }`}>
                  {paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Modal.CancelButton onClick={() => setShowModal(false)}>
                Hủy
              </Modal.CancelButton>
              <Modal.ConfirmButton onClick={handleConfirm}>
                {paymentMethod === 'transfer' ? 'Hiển thị QR Code' : 'Xác Nhận'}
              </Modal.ConfirmButton>
            </div>
          </div>
        </Modal>
      )}

      {/* QR Code Modal */}
      {showQRCode && (
        <Modal
          isOpen={true}
          onClose={() => setShowQRCode(false)}
          title="Quét Mã QR Để Thanh Toán"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-cyber-dark border border-cyber-border rounded-lg p-6">
              {/* Mock QR Code */}
              <div className="flex justify-center mb-4">
                <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center">
                  <QrCode className="text-cyber-dark" size={200} />
                </div>
              </div>

              {/* Bank Info */}
              <div className="space-y-2 text-center">
                <p className="text-sm text-gray-400 font-rajdhani">Ngân hàng: <span className="text-gray-200 font-semibold">Vietcombank</span></p>
                <p className="text-sm text-gray-400 font-rajdhani">Số TK: <span className="text-gray-200 font-jetbrains">1234567890</span></p>
                <p className="text-sm text-gray-400 font-rajdhani">Chủ TK: <span className="text-gray-200 font-semibold">KNIGHT TREE NET</span></p>
                <p className="text-lg text-cyber-green font-jetbrains font-bold mt-3">
                  Số tiền: {formatVND(parseInt(amount))}
                </p>
                <p className="text-xs text-gray-400 font-rajdhani">
                  Nội dung: NAP {selectedUser?.username?.toUpperCase()} {parseInt(amount)}
                </p>
              </div>
            </div>

            <div className="bg-cyber-amber/10 border border-cyber-amber rounded-lg p-3">
              <p className="text-sm text-cyber-amber font-rajdhani text-center">
                Vui lòng chuyển khoản đúng nội dung để hệ thống tự động xác nhận
              </p>
            </div>

            <div className="flex gap-3">
              <Modal.CancelButton onClick={() => setShowQRCode(false)}>
                Hủy
              </Modal.CancelButton>
              <Modal.ConfirmButton onClick={handleQRConfirm}>
                Đã Chuyển Khoản
              </Modal.ConfirmButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default TopUp;
