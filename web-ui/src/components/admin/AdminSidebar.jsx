import React from 'react';
import { 
  FiPieChart, FiBriefcase, FiMessageCircle, FiCreditCard, 
  FiActivity, FiMail, FiDatabase, FiUsers, 
  FiUserPlus, FiTruck, FiSettings, FiLogOut 
} from 'react-icons/fi';

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  stats, 
  inquiriesCount = 0, 
  paymentsCount = 0, 
  logsCount = 0, 
  handleLogout 
}) {
  
  const tabs = [
    { id: 'analytics', label: 'Platform Analytics', icon: <FiPieChart /> },
    { id: 'clients', label: 'Client Organizations', icon: <FiBriefcase /> },
    { id: 'inquiries', label: `Lead Inquiries (${inquiriesCount})`, icon: <FiMessageCircle /> },
    { id: 'payments', label: `Payment Receipts (${paymentsCount})`, icon: <FiCreditCard /> },
    { id: 'logs', label: `System Audit Logs (${logsCount})`, icon: <FiActivity /> },
    { id: 'email_logs', label: 'Email Dispatch Logs', icon: <FiMail /> },
    { id: 'backup', label: 'Backup & Restore', icon: <FiDatabase /> },
    { id: 'users', label: 'Admin Users', icon: <FiUsers /> },
    { id: 'farmers', label: 'Shared Farmers', icon: <FiUserPlus /> },
    { id: 'dealers', label: 'Shared Dealers', icon: <FiTruck /> },
    { id: 'settings', label: 'System Settings', icon: <FiSettings /> },
  ];

  return (
    <div className="glass-card fade-in" style={{ padding: '24px 16px', position: 'sticky', top: '24px' }}>
      <div style={{ padding: '0 12px 20px 12px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>Admin Command</h3>
        <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}></span>
          SERVER ONLINE
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              border: 'none',
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : '#475569',
              padding: '12px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(5, 150, 105, 0.2)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) e.currentTarget.style.background = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '18px', display: 'flex' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}

        <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              border: 'none',
              background: '#fee2e2',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fca5a5'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
          >
            <span style={{ fontSize: '18px', display: 'flex' }}><FiLogOut /></span>
            Logout Admin
          </button>
        </div>
      </div>
    </div>
  );
}
