import React from 'react';
import { FiUserPlus, FiTrash2, FiUser } from 'react-icons/fi';

export default function AdminUsers({ adminUsers = [], setShowAdminModal, handleDeleteAdmin }) {
  return (
    <div className="glass-card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <FiUser style={{ color: '#059669' }} /> System Administrators
        </h3>
        <button className="btn-primary shadow-lg" onClick={() => setShowAdminModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiUserPlus /> New Admin User
        </button>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <table className="modern-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Username</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Role</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Last Login</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Created At</th>
              <th style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '16px' }}><strong style={{ color: '#0f172a', fontSize: '14px' }}>{user.username}</strong></td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, background: '#e0e7ff', color: '#3730a3' }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>
                  {user.last_login ? new Date(user.last_login).toLocaleString('en-IN') : 'Never'}
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#475569' }}>
                  {new Date(user.created_at).toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '16px' }}>
                  {user.username !== 'admin' ? (
                    <button 
                      style={{ border: 'none', background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fca5a5'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fee2e2'}
                      onClick={() => handleDeleteAdmin(user.id, user.username)}
                    >
                      <FiTrash2 /> Delete
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Super Admin (Protected)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
