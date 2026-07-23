import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Cpu, 
  HardDrive, 
  Database,
  Terminal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  fetchMetrics, fetchDockerContainers, fetchServices, fetchDeployments, fetchAlerts
} from './services/api';

function App() {
  const [metrics, setMetrics] = useState([]);
  const [containers, setContainers] = useState([]);
  const [services, setServices] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [m, c, s, d, a] = await Promise.all([
        fetchMetrics(),
        fetchDockerContainers(),
        fetchServices(),
        fetchDeployments(),
        fetchAlerts()
      ]);
      // Reverse metrics so oldest is first for the chart
      setMetrics(m.reverse());
      setContainers(c);
      setServices(s);
      setDeployments(d);
      setAlerts(a);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2 style={{ color: '#06b6d4' }}>Loading Dashboard Data...</h2>
      </div>
    );
  }

  const latestMetric = metrics[metrics.length - 1] || { cpuUsage: 0, ramUsage: 0, diskUsage: 0 };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1><Activity className="animate-pulse" /> DevOps Command Center</h1>
        <div>
          <span className="live-indicator"></span>
          <span style={{ color: 'var(--text-secondary)' }}>Live Monitoring</span>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="metrics-grid">
        <div className="glass-card">
          <div className="card-title"><Cpu size={18} /> CPU Usage</div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>
            {latestMetric.cpuUsage.toFixed(1)}%
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Average over all cores</p>
        </div>
        <div className="glass-card">
          <div className="card-title"><Database size={18} /> RAM Usage</div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--accent-purple)' }}>
            {latestMetric.ramUsage.toFixed(1)}%
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>System memory allocation</p>
        </div>
        <div className="glass-card">
          <div className="card-title"><HardDrive size={18} /> Disk I/O</div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>
            {latestMetric.diskUsage.toFixed(1)}%
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Primary storage usage</p>
        </div>
        <div className="glass-card">
          <div className="card-title"><Server size={18} /> Active Services</div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--accent-green)' }}>
            {services.filter(s => s.status === 'active').length} / {services.length}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Microservices running</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="glass-card">
          <div className="card-title"><Activity size={18} /> Resource Utilization Timeline</div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="timestamp" stroke="var(--text-secondary)" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="cpuUsage" name="CPU (%)" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorCpu)" />
                <Area type="monotone" dataKey="ramUsage" name="RAM (%)" stroke="var(--accent-purple)" fillOpacity={1} fill="url(#colorRam)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="details-grid">
        {/* Docker Containers */}
        <div className="glass-card">
          <div className="card-title"><Terminal size={18} /> Docker Containers</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Container</th>
                <th>Image</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {containers.map(container => (
                <tr key={container.id}>
                  <td><strong>{container.name}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{container.image}</td>
                  <td>
                    <span className={`status-badge status-${container.status.toLowerCase()}`}>
                      {container.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Deployments */}
        <div className="glass-card">
          <div className="card-title"><CheckCircle size={18} /> Recent Deployments</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Version</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deployments.map(dep => (
                <tr key={dep.id}>
                  <td><strong>{dep.projectName}</strong></td>
                  <td>{dep.version}</td>
                  <td>
                    <span className={`status-badge status-${dep.status.toLowerCase()}`}>
                      {dep.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System Alerts */}
        <div className="glass-card">
          <div className="card-title"><AlertTriangle size={18} /> System Alerts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {alerts.map(alert => (
              <div key={alert.id} style={{ 
                padding: '1rem', 
                borderRadius: '8px', 
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderLeft: `4px solid ${alert.severity === 'critical' ? 'var(--accent-red)' : alert.severity === 'warning' ? 'var(--accent-yellow)' : 'var(--accent-blue)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {alert.severity === 'critical' && <XCircle size={14} color="var(--accent-red)" />}
                    {alert.severity === 'warning' && <AlertTriangle size={14} color="var(--accent-yellow)" />}
                    {alert.severity === 'info' && <CheckCircle size={14} color="var(--accent-blue)" />}
                    {alert.message}
                  </strong>
                  <span className={`status-badge status-${alert.resolved ? 'success' : 'critical'}`}>
                    {alert.resolved ? 'Resolved' : 'Active'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> {new Date(alert.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
