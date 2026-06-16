import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Thermometer, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../services/api';

function MachineHealth() {
  const [workstations, setWorkstations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null);

  // Fetch workstations from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await api.workstations.getAll();
        setWorkstations(data);
      } catch (error) {
        console.error('Error fetching workstations:', error);
        toast.error('Lỗi tải dữ liệu máy');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMachineHealth = (machine) => {
    // Health data is included in workstation response from backend
    return machine.health || null;
  };

  const getTempColor = (temp, type = 'cpu') => {
    const threshold = type === 'cpu' ? { high: 80, medium: 60 } : { high: 85, medium: 65 };
    if (temp > threshold.high) return 'text-cyber-red';
    if (temp > threshold.medium) return 'text-cyber-amber';
    return 'text-cyber-green';
  };

  const getDiskColor = (freeGb) => {
    if (freeGb < 10) return 'text-cyber-red';
    if (freeGb < 20) return 'text-cyber-amber';
    return 'text-cyber-green';
  };

  const getHealthStatus = (health) => {
    if (!health) return { status: 'UNKNOWN', color: 'bg-gray-500/20 text-gray-400 border-gray-500' };

    const cpuCritical = health.cpu_temp > 80;
    const gpuCritical = health.gpu_temp > 85;
    const diskCritical = health.disk_free_gb < 10;

    if (cpuCritical || gpuCritical || diskCritical) {
      return { status: 'CRITICAL', color: 'bg-cyber-red/20 text-cyber-red border-cyber-red' };
    }

    const cpuWarning = health.cpu_temp > 60;
    const gpuWarning = health.gpu_temp > 65;
    const diskWarning = health.disk_free_gb < 20;

    if (cpuWarning || gpuWarning || diskWarning) {
      return { status: 'WARNING', color: 'bg-cyber-amber/20 text-cyber-amber border-cyber-amber' };
    }

    return { status: 'HEALTHY', color: 'bg-cyber-green/20 text-cyber-green border-cyber-green' };
  };

  // Mock historical data for selected machine
  const getHistoricalData = (machineId) => {
    return [
      { time: '00:00', cpu: 45, gpu: 50 },
      { time: '01:00', cpu: 48, gpu: 52 },
      { time: '02:00', cpu: 52, gpu: 58 },
      { time: '03:00', cpu: 55, gpu: 62 },
      { time: '04:00', cpu: 50, gpu: 55 },
      { time: '05:00', cpu: 47, gpu: 53 },
    ];
  };

  const machinesWithHealth = workstations.map(machine => ({
    ...machine,
    health: getMachineHealth(machine),
    healthStatus: getHealthStatus(getMachineHealth(machine))
  }));

  const criticalMachines = machinesWithHealth.filter(m => m.healthStatus.status === 'CRITICAL').length;
  const warningMachines = machinesWithHealth.filter(m => m.healthStatus.status === 'WARNING').length;
  const healthyMachines = machinesWithHealth.filter(m => m.healthStatus.status === 'HEALTHY').length;

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
        <h1 className="text-3xl font-orbitron font-bold text-cyber-green">SỨC KHỎE MÁY</h1>
        <p className="text-gray-400 font-rajdhani mt-1">Giám sát sức khỏe máy tính</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <p className="text-sm text-gray-400 font-rajdhani">Tổng máy</p>
          <p className="text-2xl font-jetbrains font-bold text-cyber-blue mt-1">{workstations.length}</p>
        </div>
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <p className="text-sm text-gray-400 font-rajdhani">Khỏe mạnh</p>
          <p className="text-2xl font-jetbrains font-bold text-cyber-green mt-1">{healthyMachines}</p>
        </div>
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <p className="text-sm text-gray-400 font-rajdhani">Cảnh báo</p>
          <p className="text-2xl font-jetbrains font-bold text-cyber-amber mt-1">{warningMachines}</p>
        </div>
        <div className="bg-cyber-card border border-cyber-border rounded-lg p-4">
          <p className="text-sm text-gray-400 font-rajdhani">Nguy hiểm</p>
          <p className="text-2xl font-jetbrains font-bold text-cyber-red mt-1">{criticalMachines}</p>
        </div>
      </div>

      {/* Machine Health Grid */}
      <div>
        <h2 className="text-xl font-orbitron font-bold text-gray-200 mb-4">TRẠNG THÁI MÁY</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {machinesWithHealth.map((machine) => {
            const health = machine.health;
            const status = machine.healthStatus;

            return (
              <div
                key={machine.machine_id}
                onClick={() => setSelectedMachine(machine)}
                className={`bg-cyber-card border rounded-lg p-4 cursor-pointer transition-all hover:scale-105 ${
                  status.status === 'CRITICAL' ? 'border-cyber-red' :
                  status.status === 'WARNING' ? 'border-cyber-amber' :
                  'border-cyber-border'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-jetbrains font-bold text-lg text-gray-200">{machine.machine_name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-rajdhani border ${status.color}`}>
                    {status.status}
                  </span>
                </div>

                {health ? (
                  <div className="space-y-2">
                    {/* CPU Temperature */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-400 font-rajdhani">CPU:</span>
                      </div>
                      <span className={`text-sm font-jetbrains font-bold ${getTempColor(health.cpu_temp, 'cpu')}`}>
                        {health.cpu_temp}°C
                      </span>
                    </div>

                    {/* GPU Temperature */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-400 font-rajdhani">GPU:</span>
                      </div>
                      <span className={`text-sm font-jetbrains font-bold ${getTempColor(health.gpu_temp, 'gpu')}`}>
                        {health.gpu_temp}°C
                      </span>
                    </div>

                    {/* Disk Space */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-400 font-rajdhani">Disk:</span>
                      </div>
                      <span className={`text-sm font-jetbrains font-bold ${getDiskColor(health.disk_free_gb)}`}>
                        {health.disk_free_gb}GB
                      </span>
                    </div>

                    {/* Last Check */}
                    <div className="pt-2 border-t border-cyber-border">
                      <p className="text-xs text-gray-500 font-jetbrains">
                        {new Date(health.recorded_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertTriangle className="text-gray-500 mx-auto mb-2" size={24} />
                    <p className="text-sm text-gray-500 font-rajdhani">Không có dữ liệu</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Machine Detail Modal */}
      {selectedMachine && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-cyber-card border border-cyber-green rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-cyber-border">
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-cyber-green">CHI TIẾT SỨC KHỎE</h2>
                <p className="text-gray-400 font-rajdhani mt-1">{selectedMachine.machine_name}</p>
              </div>
              <button
                onClick={() => setSelectedMachine(null)}
                className="p-2 hover:bg-cyber-border rounded transition-colors text-gray-400"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {selectedMachine.health ? (
                <>
                  {/* Current Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4 text-center">
                      <Cpu className={`mx-auto mb-2 ${getTempColor(selectedMachine.health.cpu_temp, 'cpu')}`} size={32} />
                      <p className="text-sm text-gray-400 font-rajdhani">CPU</p>
                      <p className={`text-2xl font-jetbrains font-bold mt-1 ${getTempColor(selectedMachine.health.cpu_temp, 'cpu')}`}>
                        {selectedMachine.health.cpu_temp}°C
                      </p>
                    </div>
                    <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4 text-center">
                      <Thermometer className={`mx-auto mb-2 ${getTempColor(selectedMachine.health.gpu_temp, 'gpu')}`} size={32} />
                      <p className="text-sm text-gray-400 font-rajdhani">GPU</p>
                      <p className={`text-2xl font-jetbrains font-bold mt-1 ${getTempColor(selectedMachine.health.gpu_temp, 'gpu')}`}>
                        {selectedMachine.health.gpu_temp}°C
                      </p>
                    </div>
                    <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4 text-center">
                      <HardDrive className={`mx-auto mb-2 ${getDiskColor(selectedMachine.health.disk_free_gb)}`} size={32} />
                      <p className="text-sm text-gray-400 font-rajdhani">Disk Free</p>
                      <p className={`text-2xl font-jetbrains font-bold mt-1 ${getDiskColor(selectedMachine.health.disk_free_gb)}`}>
                        {selectedMachine.health.disk_free_gb}GB
                      </p>
                    </div>
                  </div>

                  {/* Temperature History Chart */}
                  <div>
                    <h3 className="text-lg font-orbitron font-bold text-gray-200 mb-3">LỊCH SỬ NHIỆT ĐỘ</h3>
                    <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getHistoricalData(selectedMachine.machine_id)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
                          <YAxis stroke="#9ca3af" style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px' }}
                            labelStyle={{ color: '#9ca3af', fontFamily: 'Rajdhani' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="cpu" stroke="#00ff88" strokeWidth={2} name="CPU (°C)" />
                          <Line type="monotone" dataKey="gpu" stroke="#00b4ff" strokeWidth={2} name="GPU (°C)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Machine Info */}
                  <div>
                    <h3 className="text-lg font-orbitron font-bold text-gray-200 mb-3">THÔNG TIN MÁY</h3>
                    <div className="bg-cyber-dark border border-cyber-border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 font-rajdhani">IP Address:</p>
                          <p className="text-gray-200 font-jetbrains">{selectedMachine.ip}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 font-rajdhani">MAC Address:</p>
                          <p className="text-gray-200 font-jetbrains">{selectedMachine.mac}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 font-rajdhani">Status:</p>
                          <p className="text-gray-200 font-rajdhani">{selectedMachine.status}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 font-rajdhani">Last Check:</p>
                          <p className="text-gray-200 font-jetbrains">
                            {new Date(selectedMachine.health.recorded_at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="text-gray-500 mx-auto mb-4" size={48} />
                  <p className="text-gray-400 font-rajdhani">Không có dữ liệu sức khỏe cho máy này</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MachineHealth;
