import React from 'react';
import { FiDownload } from 'react-icons/fi';

export default function ClientManagement({
  clients = [],
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  handleExportCSV,
  handleRevokeKey
}) {
  const filteredClients = clients.filter(c => {
    const matchesSearch = (c.firmName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.mobileNo || '').includes(search) ||
      (c.requestCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.activationKey || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="glass-card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Client Organizations & Machine Bindings</h3>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => handleExportCSV('clients')}>
            <FiDownload /> Export CSV
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            className="modern-input" 
            placeholder="Search firm, mobile, key..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ width: '260px' }} 
          />
          <select 
            className="modern-input" 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="TRIAL">TRIAL</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Firm / Client</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Mobile</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Request Code</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Plan</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Activation Key</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Expires In</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '16px' }}>
                  <strong style={{ color: '#0f172a', display: 'block', fontSize: '14px' }}>{c.firmName}</strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.ownerName || 'Proprietor'}</div>
                </td>
                <td style={{ padding: '16px', fontSize: '14px' }}>{c.mobileNo}</td>
                <td style={{ padding: '16px' }}><code style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#334155', fontWeight: 600 }}>{c.requestCode}</code></td>
                <td style={{ padding: '16px' }}><span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{c.planType}</span></td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 800,
                    background: c.status === 'ACTIVE' ? '#dcfce7' : c.status === 'TRIAL' ? '#fef3c7' : '#fee2e2',
                    color: c.status === 'ACTIVE' ? '#15803d' : c.status === 'TRIAL' ? '#b45309' : '#b91c1c',
                    display: 'inline-block'
                  }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: '16px' }}><code style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>{c.activationKey}</code></td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#475569', fontWeight: 600 }}>{c.daysRemaining} Days</td>
                <td style={{ padding: '16px' }}>
                  <button 
                    style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', padding: '8px 14px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s ease' }} 
                    onMouseEnter={e => e.currentTarget.style.background = '#fca5a5'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                    onClick={() => handleRevokeKey(c.requestCode)}
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No clients match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
