import React from 'react';
import { FiDownload } from 'react-icons/fi';

export default function PaymentReceipts({ payments = [], handleExportCSV }) {
  return (
    <div className="glass-card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Razorpay Payment Receipts ({payments.length})</h3>
        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => handleExportCSV('payments')}>
          <FiDownload /> Export CSV
        </button>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Firm / Client</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Mobile</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Amount (₹)</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Razorpay Order ID</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Razorpay Payment ID</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '16px' }}><strong style={{ color: '#0f172a', fontSize: '14px' }}>{p.firm_name || 'Agri Dealer'}</strong></td>
                <td style={{ padding: '16px', fontSize: '14px' }}>{p.mobile_no || '-'}</td>
                <td style={{ padding: '16px' }}><strong style={{ color: '#059669', fontSize: '15px' }}>₹{(p.amount / 100).toLocaleString('en-IN')}</strong></td>
                <td style={{ padding: '16px' }}><code style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#334155' }}>{p.razorpay_order_id}</code></td>
                <td style={{ padding: '16px' }}><code style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#334155' }}>{p.razorpay_payment_id}</code></td>
                <td style={{ padding: '16px' }}>
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '12px', fontWeight: 800, fontSize: '11px' }}>
                    {p.status}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '12px', color: '#64748b' }}>{new Date(p.created_at).toLocaleString('en-IN')}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
