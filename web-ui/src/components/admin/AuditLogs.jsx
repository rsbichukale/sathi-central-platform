import React from 'react';
import { FiDownload } from 'react-icons/fi';

export default function AuditLogs({ 
  logs = [], 
  search, 
  setSearch, 
  logLevelFilter, 
  setLogLevelFilter, 
  logCategoryFilter, 
  setLogCategoryFilter, 
  handleExportCSV 
}) {
  const filteredLogs = logs.filter(l => {
    const matchesLevel = logLevelFilter === 'ALL' || l.level === logLevelFilter;
    const matchesCategory = logCategoryFilter === 'ALL' || l.category === logCategoryFilter;
    const matchesSearch = !search ||
      (l.event_action || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.details || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.ip_address || '').includes(search);
    return matchesLevel && matchesCategory && matchesSearch;
  });

  return (
    <div className="glass-card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>System Audit Logs ({logs.length})</h3>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => handleExportCSV('logs')}>
            <FiDownload /> Export CSV
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            className="modern-input" 
            placeholder="Search events, IP, details..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ width: '220px' }} 
          />
          <select 
            className="modern-input" 
            value={logLevelFilter} 
            onChange={e => setLogLevelFilter(e.target.value)}
            style={{ width: '130px' }}
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
            <option value="SECURITY">SECURITY</option>
            <option value="AUDIT">AUDIT</option>
          </select>
          <select 
            className="modern-input" 
            value={logCategoryFilter} 
            onChange={e => setLogCategoryFilter(e.target.value)}
            style={{ width: '140px' }}
          >
            <option value="ALL">All Categories</option>
            <option value="AUTH">AUTH</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="LICENSE">LICENSE</option>
            <option value="SYSTEM">SYSTEM</option>
            <option value="REGISTRY">REGISTRY</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Timestamp</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Level</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Category</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Event Action</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Client/Machine ID</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>IP Address</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>
                  <div style={{ fontFamily: 'monospace' }}>{new Date(l.created_at).toLocaleString('en-IN')}</div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800,
                    background: l.level === 'ERROR' ? '#fee2e2' : l.level === 'SECURITY' ? '#fef3c7' : l.level === 'WARN' ? '#ffedd5' : '#f1f5f9',
                    color: l.level === 'ERROR' ? '#b91c1c' : l.level === 'SECURITY' ? '#b45309' : l.level === 'WARN' ? '#c2410c' : '#475569'
                  }}>
                    {l.level}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>{l.category}</td>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{l.event_action}</td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
                  {l.client_id ? `Client: ${l.client_id}` : l.machine_id ? `Machine: ${l.machine_id}` : '-'}
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#64748b', fontFamily: 'monospace' }}>{l.ip_address || '-'}</td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#475569', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.details}>
                  {l.details}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No logs match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
