import React from 'react';
import { FiDownload } from 'react-icons/fi';

export default function LeadInquiries({ inquiries = [], handleExportCSV }) {
  return (
    <div className="glass-card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Quote & Service Inquiries ({inquiries.length})</h3>
        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => handleExportCSV('inquiries')}>
          <FiDownload /> Export CSV
        </button>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Customer Name</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Mobile Number</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Email</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Service Requested</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Message</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Received At</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map(i => (
              <tr key={i.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '16px' }}><strong style={{ color: '#0f172a', fontSize: '14px' }}>{i.name}</strong></td>
                <td style={{ padding: '16px', fontSize: '14px' }}>
                  <a href={`tel:${i.mobile}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>{i.mobile}</a>
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>
                  {i.email ? <a href={`mailto:${i.email}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{i.email}</a> : '-'}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '6px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '12px' }}>
                    {i.service}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#334155', maxWidth: '300px' }}>{i.message}</td>
                <td style={{ padding: '16px', fontSize: '12px', color: '#64748b' }}>{new Date(i.created_at).toLocaleString('en-IN')}</td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No inquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
