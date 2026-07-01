import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

// Generic CRUD hook for all entities
export function useCRUD(initialData, entityName, idField, apiEndpoint) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!apiEndpoint || !apiEndpoint.getAll) return;

      try {
        setLoading(true);
        const result = await apiEndpoint.getAll();
        setData(result);
      } catch (error) {
        console.error(`Error fetching ${entityName}:`, error);
        toast.error(`Lỗi tải dữ liệu ${entityName}`);
        // Keep initial data on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [entityName, apiEndpoint]);

  const addLog = (action, targetType, targetId) => {
    const log = {
      log_id: Date.now(),
      staff_id: 1, // TODO: Get from auth context
      action,
      target_type: targetType,
      target_id: targetId,
      logged_at: new Date().toISOString()
    };
    console.log('System Log:', log);
    // TODO: Add to systemLogs state
  };

  const create = async (newItem) => {
    const tempId = `temp_${Date.now()}`;
    const item = {
      ...newItem,
      _pending: true,
      _tempId: tempId
    };

    // Optimistic update
    setData(prev => [item, ...prev]);

    const loadingToast = toast.loading('Đang lưu...');

    try {
      // Call real API
      const result = await apiEndpoint.create(newItem);

      // Update with real data from server
      setData(prev => prev.map(x =>
        x._tempId === tempId ? result : x
      ));

      addLog('CREATE', entityName, result[idField]);
      toast.success(`Đã thêm ${entityName} thành công!`, { id: loadingToast });

      return result;
    } catch (error) {
      // Rollback on error
      setData(prev => prev.filter(x => x._tempId !== tempId));
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
      throw error;
    }
  };

  const update = async (id, changes) => {
    const oldItem = data.find(x => x[idField] === id);
    if (!oldItem) {
      toast.error('Không tìm thấy bản ghi');
      return;
    }

    // Optimistic update
    setData(prev => prev.map(x =>
      x[idField] === id ? { ...x, ...changes, _pending: true } : x
    ));

    const loadingToast = toast.loading('Đang cập nhật...');

    try {
      // Call real API
      const result = await apiEndpoint.update(id, changes);

      setData(prev => prev.map(x =>
        x[idField] === id ? result : x
      ));

      addLog('UPDATE', entityName, id);
      toast.success('Đã cập nhật thành công!', { id: loadingToast });
      return result;
    } catch (error) {
      // Rollback on error
      setData(prev => prev.map(x =>
        x[idField] === id ? oldItem : x
      ));
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
      throw error;
    }
  };

  const remove = async (id) => {
    const item = data.find(x => x[idField] === id);
    if (!item) {
      toast.error('Không tìm thấy bản ghi');
      return;
    }

    // Optimistic update
    setData(prev => prev.filter(x => x[idField] !== id));

    const loadingToast = toast.loading('Đang xóa...');

    try {
      // Call real API
      await apiEndpoint.delete(id);

      addLog('DELETE', entityName, id);
      toast.success('Đã xóa thành công!', { id: loadingToast });
    } catch (error) {
      // Rollback on error
      setData(prev => [...prev, item]);
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
      throw error;
    }
  };

  const softDelete = async (id) => {
    return update(id, { status: 'DELETED', deleted_at: new Date().toISOString() });
  };

  const getById = (id) => data.find(x => x[idField] === id);

  const bulkUpdate = async (ids, changes) => {
    const oldItems = data.filter(x => ids.includes(x[idField]));

    // Optimistic update
    setData(prev => prev.map(x =>
      ids.includes(x[idField]) ? { ...x, ...changes, _pending: true } : x
    ));

    const loadingToast = toast.loading(`Đang cập nhật ${ids.length} bản ghi...`);

    try {
      // For workstations with hourly rate change, use special endpoint
      if (apiEndpoint.bulkUpdateHourly && changes.hourly !== undefined) {
        const result = await apiEndpoint.bulkUpdateHourly(changes.hourly);
        setData(result.data);
      } else if (apiEndpoint.bulkUpdate) {
        // Generic bulk update
        const result = await apiEndpoint.bulkUpdate(ids, changes);
        setData(result);
      } else {
        // Fallback: update one by one
        await Promise.all(ids.map(id => apiEndpoint.update(id, changes)));
        setData(prev => prev.map(x =>
          ids.includes(x[idField]) ? { ...x, ...changes, _pending: false } : x
        ));
      }

      ids.forEach(id => addLog('UPDATE', entityName, id));
      toast.success(`Đã cập nhật ${ids.length} bản ghi!`, { id: loadingToast });
    } catch (error) {
      // Rollback on error
      setData(prev => prev.map(x => {
        const oldItem = oldItems.find(old => old[idField] === x[idField]);
        return oldItem || x;
      }));
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
      throw error;
    }
  };

  return {
    data,
    setData,
    loading,
    setLoading,
    create,
    update,
    remove,
    softDelete,
    getById,
    bulkUpdate
  };
}

// Specialized hooks for specific entities
export function useWorkstations(initialData) {
  return useCRUD(initialData, 'workstation', 'machine_id', api.workstations);
}

export function useSessions(initialData) {
  return useCRUD(initialData, 'session', 'session_id', api.sessions);
}

export function useUsers(initialData) {
  return useCRUD(initialData, 'user', 'user_id', api.users);
}

export function useMenuItems(initialData) {
  return useCRUD(initialData, 'menu_item', 'item_id', api.menuItems);
}

export function useOrders(initialData) {
  return useCRUD(initialData, 'order', 'order_id', api.orders);
}

export function useTopUpTransactions(initialData) {
  return useCRUD(initialData, 'topup_transaction', 'tut_id', api.topUp);
}

export function useStaff(initialData) {
  return useCRUD(initialData, 'staff', 'staff_id', api.staff);
}

export function useExpenses(initialData) {
  return useCRUD(initialData, 'expense', 'expense_id', {
    getAll: () => api.expenses.getAll(),
    getById: (id) => api.expenses.getById(id),
    create: (data) => api.expenses.create(data),
    update: (id, data) => api.expenses.update(id, data),
    delete: (id) => api.expenses.delete(id),
  });
}

export function useInventoryImports(initialData) {
  return useCRUD(initialData, 'inventory_import', 'import_id', api.inventoryImports);
}
