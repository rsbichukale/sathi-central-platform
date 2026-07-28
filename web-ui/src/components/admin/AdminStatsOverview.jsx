import React from 'react';
import { DonutChart, DonutLegend, BarChart, ActivityHeatmap, MiniStatCard } from '../ChartComponents';

export default function AdminStatsOverview({ 
  stats, 
  chartData, 
  setShowKeyModal 
}) {
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Platform Overview</h2>
        <button className="btn-primary shadow-lg hover:-translate-y-1 transition-transform" onClick={() => setShowKeyModal(true)}>
          + Issue Activation Key
        </button>
      </div>

      {chartData && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
            <MiniStatCard icon="🏢" label="Total Clients" value={stats.totalClients} trend={chartData.weeklyRegs.map(d => d.count)} />
            <MiniStatCard icon="🟢" label="Active Paid" value={stats.activePaid} trendColor="#059669" />
            <MiniStatCard icon="🟠" label="Active Trials" value={stats.activeTrials} trendColor="#d97706" />
            <MiniStatCard icon="💳" label="Total Revenue" value={(chartData.totalRevenue / 100).toLocaleString('en-IN')} suffix="INR" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Monthly Revenue (Last 12 Months)</h3>
              <BarChart data={chartData.monthlyRevenue.map(d => ({ label: d.month, value: d.total / 100 }))} formatValue={v => `₹${v.toLocaleString()}`} />
            </div>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>License Status</h3>
              <DonutChart data={[
                { label: 'Active', value: chartData.licenseBreakdown.active, color: '#059669' },
                { label: 'Trial', value: chartData.licenseBreakdown.trial, color: '#d97706' },
                { label: 'Expired', value: chartData.licenseBreakdown.expired, color: '#ef4444' },
                { label: 'Suspended', value: chartData.licenseBreakdown.suspended, color: '#64748b' }
              ].filter(d => d.value > 0)} size={180} />
              <DonutLegend data={[
                { label: 'Active', value: chartData.licenseBreakdown.active, color: '#059669' },
                { label: 'Trial', value: chartData.licenseBreakdown.trial, color: '#d97706' },
                { label: 'Expired', value: chartData.licenseBreakdown.expired, color: '#ef4444' },
                { label: 'Suspended', value: chartData.licenseBreakdown.suspended, color: '#64748b' }
              ]} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
            <div className="glass-card hover-glow" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Monthly Registrations</h3>
              <BarChart data={chartData.monthlyRegistrations.map(d => ({ label: d.month, value: d.count }))} height={120} barColor="#3b82f6" />
            </div>
            <div className="glass-card hover-glow" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>API Activity (Last 14 Days)</h3>
              <ActivityHeatmap data={chartData.dailyActivity.map(d => ({ label: d.day, shortLabel: d.day.slice(-2), value: d.count }))} />
            </div>
            <div className="glass-card hover-glow" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>System Overview</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: 700, fontSize: '13px' }}>Audit Logs</span>
                  <span style={{ fontWeight: 800, fontSize: '14px' }}>{stats.totalLogs}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: 700, fontSize: '13px' }}>Shared Farmers</span>
                  <span style={{ fontWeight: 800, fontSize: '14px' }}>{stats.totalFarmers}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontWeight: 700, fontSize: '13px' }}>Shared Dealers</span>
                  <span style={{ fontWeight: 800, fontSize: '14px' }}>{stats.totalDealers}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: '#64748b', fontWeight: 700, fontSize: '13px' }}>Emails Sent</span>
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#059669' }}>{chartData.emailStats.sent}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
