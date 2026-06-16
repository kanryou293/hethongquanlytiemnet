import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ToastProvider';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import WorkstationsWithCRUD from './pages/WorkstationsWithCRUD';
import Sessions from './pages/Sessions';
import UsersWithCRUD from './pages/UsersWithCRUD';
import TopUp from './pages/TopUp';
import Orders from './pages/Orders';
import Menu from './pages/Menu';
import Inventory from './pages/Inventory';
import Expenses from './pages/Expenses';
import Staff from './pages/Staff';
import MachineHealth from './pages/MachineHealth';
import SystemLogs from './pages/SystemLogs';
import Reports from './pages/Reports';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      <ToastProvider />
      <div className="flex h-screen overflow-hidden bg-cyber-dark">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workstations" element={<WorkstationsWithCRUD />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/users" element={<UsersWithCRUD />} />
              <Route path="/topup" element={<TopUp />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/machine-health" element={<MachineHealth />} />
              <Route path="/logs" element={<SystemLogs />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
