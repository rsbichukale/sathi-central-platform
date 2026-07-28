import React from 'react';
import { FiDownload } from 'react-icons/fi';

export default function FarmerManagement({ farmers = [], search, setSearch, handleExportCSV }) {
  const filteredFarmers = farmers.filter(f =>
    (f.farmer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.mobile_no || '').includes(search) ||
    (f.village_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Shared Master Farmers Registry ({farmers.length})</h3>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => handleExportCSV('farmers')}>
            <FiDownload /> Export CSV
          </button>
        </div>
        <input 
          type="text" 
          className="modern-input" 
          placeholder="Search farmer name, mobile, village..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ width: '300px' }} 
        />
      </div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Farmer Name</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Mobile Number</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Village</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Block / District</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Pincode</th>
            </tr>
          </thead>
          <tbody>
            {filteredFarmers.map(f => (
              <tr key={f.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '16px' }}><strong style={{ color: '#0f172a', fontSize: '14px' }}>{f.farmer_name}</strong></td>
                <td style={{ padding: '16px', fontSize: '14px' }}>{f.mobile_no}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>{f.village_name || '-'}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>{f.block_name || '-'} / {f.district_name || '-'}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>{f.pincode || '-'}</td>
              </tr>
            ))}
            {filteredFarmers.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No farmers match the search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
