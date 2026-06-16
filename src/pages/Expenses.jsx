import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, TrendingDown, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import { formatVND } from '../utils/formatters';
import api from '../services/api';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expensesData, categoriesData, staffData] = await Promise.all([
          api.expenses.getAll(),
          api.expenses.getCategories(),
          api.staff.getAll()
        ]);
        setExpenses(expensesData);
        setExpenseCategories(categoriesData);
        setStaff(staffData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Lỗi tải dữ liệu chi phí');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryName = (categoryId) => {
    const category = expenseCategories.find(c => c.category_id === categoryId);
    return category?.category_name || `Category #${categoryId}`;
  };

  const getStaffName = (staffId) => {
    const staffMember = staff.find(s => s.staff_id === staffId);
    return staffMember?.full_name || `Staff #${staffId}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !amount || !description) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const loadingToast = toast.loading('Đang thêm chi phí...');

    try {
      const newExpense = await api.expenses.create({
        category_id: selectedCategory.category_id,
        staff_id: staff[0]?.staff_id || 1, // Use first staff or default
        amount: parseInt(amount),
        description,
        expense_date: expenseDate
      });

      // Fetch updated list
      const updatedExpenses = await api.expenses.getAll();
      setExpenses(updatedExpenses);

      toast.success(`Thêm chi phí ${formatVND(parseInt(amount))} thành công!`, { id: loadingToast });

      // Reset form
      setShowAddModal(false);
      setSelectedCategory(null);
      setAmount('');
      setDescription('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
    }
  };

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter(exp => exp.category_id === parseInt(filterCategory));

  // Calculate expenses by category for chart
  const expensesByCategory = expenseCategories.map(category => {
    const categoryExpenses = expenses.filter(exp => exp.category_id === category.category_id);
    const total = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return {
      category: category.category_name,
      amount: total
    };
  }).filter(item => item.amount > 0);

  // Calculate monthly total
  const monthlyTotal = expenses
    .filter(exp => {
      const expDate = new Date(exp.expense_date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

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
          <h1 className="text-3xl font-orbitron font-bold text-cyber-green">CHI PHÍ</h1>
          <p className="text-gray-400 font-rajdhani mt-1">Quản lý chi phí hoạt động</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-cyber-green text-cyber-dark rounded font-rajdhani font-semibold hover:bg-cyber-green/90 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm chi phí
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Tổng chi phí</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-red mt-2">
                {formatVND(totalExpenses)}
              </p>
            </div>
            <div className="p-3 bg-cyber-red/20 rounded-lg">
              <TrendingDown className="text-cyber-red" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Chi phí tháng này</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-amber mt-2">
                {formatVND(monthlyTotal)}
              </p>
            </div>
            <div className="p-3 bg-cyber-amber/20 rounded-lg">
              <Calendar className="text-cyber-amber" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">Trung bình</p>
              <p className="text-2xl font-jetbrains font-bold text-cyber-blue mt-2">
                {formatVND(avgExpense)}
              </p>
            </div>
            <div className="p-3 bg-cyber-blue/20 rounded-lg">
              <DollarSign className="text-cyber-blue" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">CHI PHÍ THEO DANH MỤC</h2>
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expensesByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="category"
                stroke="#9ca3af"
                style={{ fontSize: '12px', fontFamily: 'Rajdhani' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                labelStyle={{ color: '#9ca3af', fontFamily: 'Rajdhani' }}
                itemStyle={{ color: '#ffaa00', fontFamily: 'JetBrains Mono' }}
                formatter={(value) => formatVND(value)}
              />
              <Bar dataKey="amount" fill="#ffaa00" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter */}
      <div>
        <label className="block text-sm font-rajdhani font-semibold text-gray-300 mb-2">
          Lọc theo danh mục
        </label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full md:w-64 px-4 py-2 bg-cyber-card border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green"
        >
          <option value="all">Tất cả</option>
          {expenseCategories.map(category => (
            <option key={category.category_id} value={category.category_id}>
              {category.category_name}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div>
        <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">DANH SÁCH CHI PHÍ</h2>
        <div className="bg-cyber-card border border-cyber-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cyber-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Danh mục</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Số tiền</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Mô tả</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Nhân viên</th>
                  <th className="px-4 py-3 text-left text-sm font-rajdhani font-semibold text-gray-300">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.expense_id} className="hover:bg-cyber-border/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">#{expense.expense_id}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-rajdhani bg-cyber-amber/20 text-cyber-amber border border-cyber-amber">
                        {getCategoryName(expense.category_id)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-jetbrains font-bold text-cyber-red">
                      {formatVND(expense.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm font-rajdhani text-gray-300">
                      {expense.description}
                    </td>
                    <td className="px-4 py-3 text-sm font-rajdhani text-gray-400">
                      {getStaffName(expense.staff_id)}
                    </td>
                    <td className="px-4 py-3 text-sm font-jetbrains text-gray-400">
                      {new Date(expense.expense_date).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-cyber-card border border-cyber-green rounded-lg max-w-2xl w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-cyber-border">
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-cyber-green">THÊM CHI PHÍ</h2>
                <p className="text-gray-400 font-rajdhani mt-1">Ghi nhận chi phí hoạt động</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-cyber-border rounded transition-colors text-gray-400"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-rajdhani font-semibold text-gray-300 mb-2">
                  Danh mục *
                </label>
                <select
                  value={selectedCategory?.category_id || ''}
                  onChange={(e) => {
                    const category = expenseCategories.find(c => c.category_id === parseInt(e.target.value));
                    setSelectedCategory(category);
                  }}
                  className="w-full px-4 py-2 bg-cyber-dark border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green"
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {expenseCategories.map(category => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-rajdhani font-semibold text-gray-300 mb-2">
                  Số tiền (VNĐ) *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                  min="1"
                  step="1000"
                  className="w-full px-4 py-2 bg-cyber-dark border border-cyber-border rounded font-jetbrains text-gray-200 focus:outline-none focus:border-cyber-green"
                  required
                />
                {amount && (
                  <p className="mt-1 text-sm text-cyber-red font-jetbrains">
                    {formatVND(parseInt(amount) || 0)}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-rajdhani font-semibold text-gray-300 mb-2">
                  Mô tả *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả chi phí..."
                  rows="3"
                  className="w-full px-4 py-2 bg-cyber-dark border border-cyber-border rounded font-rajdhani text-gray-200 focus:outline-none focus:border-cyber-green resize-none"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-rajdhani font-semibold text-gray-300 mb-2">
                  Ngày chi *
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-4 py-2 bg-cyber-dark border border-cyber-border rounded font-jetbrains text-gray-200 focus:outline-none focus:border-cyber-green"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-cyber-border text-gray-300 rounded font-rajdhani font-semibold hover:bg-cyber-border/70 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyber-green text-cyber-dark rounded font-rajdhani font-semibold hover:bg-cyber-green/90 transition-colors"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;
