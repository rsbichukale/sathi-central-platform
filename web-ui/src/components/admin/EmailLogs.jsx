import React from 'react';

export default function EmailLogs({ emailLogs = [] }) {
  return (
    <div className="glass-card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>📋 Email Dispatch Logs</h3>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Timestamp</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Recipient</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Subject</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Template</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {emailLogs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>
                  {new Date(log.created_at).toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  {log.recipient_email}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#334155' }}>
                  {log.subject}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                    {log.template_type}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  {log.status === 'SENT' ? (
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>SENT</span>
                  ) : log.status === 'FAILED' ? (
                    <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>FAILED</span>
                  ) : (
                    <span style={{ background: '#fef9c3', color: '#854d0e', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>DEV_MODE</span>
                  )}
                </td>
                <td style={{ padding: '16px', fontSize: '12px', color: '#64748b', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.error_message || log.message_id}>
                  {log.error_message || log.message_id}
                </td>
              </tr>
            ))}
            {emailLogs.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No email logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
