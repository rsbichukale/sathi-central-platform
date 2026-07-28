import React from 'react';
import { FiDownload } from 'react-icons/fi';

export default function DealerManagement({ dealers = [], search, setSearch, handleExportCSV }) {
  const filteredDealers = dealers.filter(d =>
    (d.dealer_name || d.firm_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.mobile_no || '').includes(search) ||
    (d.gstin || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Shared Master Dealers Registry ({dealers.length})</h3>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => handleExportCSV('dealers')}>
            <FiDownload /> Export CSV
          </button>
        </div>
        <input 
          type="text" 
          className="modern-input" 
          placeholder="Search dealer, firm, mobile, GSTIN..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ width: '300px' }} 
        />
      </div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Dealer / Firm</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Mobile Number</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>GSTIN</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>City / Area</th>
            </tr>
          </thead>
          <tbody>
            {filteredDealers.map(d => (
              <tr key={d.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '16px' }}>
                  <strong style={{ color: '#0f172a', display: 'block', fontSize: '14px' }}>{d.firm_name || d.dealer_name}</strong>
                  {d.firm_name && d.dealer_name && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.dealer_name}</div>}
                </td>
                <td style={{ padding: '16px', fontSize: '14px' }}>{d.mobile_no}</td>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  {d.gstin ? <code style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#334155', fontWeight: 600 }}>{d.gstin}</code> : '-'}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>{d.city_name || '-'}</td>
              </tr>
            ))}
            {filteredDealers.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No dealers match the search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
