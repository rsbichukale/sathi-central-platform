import React, { useState, useEffect, useRef } from 'react';
import SettingsPage from '../pages/admin/SettingsPage';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminStatsOverview from '../components/admin/AdminStatsOverview';
import ClientManagement from '../components/admin/ClientManagement';
import LeadInquiries from '../components/admin/LeadInquiries';
import PaymentReceipts from '../components/admin/PaymentReceipts';
import AuditLogs from '../components/admin/AuditLogs';
import EmailLogs from '../components/admin/EmailLogs';
import BackupRestore from '../components/admin/BackupRestore';
import AdminUsers from '../components/admin/AdminUsers';
import FarmerManagement from '../components/admin/FarmerManagement';
import DealerManagement from '../components/admin/DealerManagement';

export default function AdminView({ showToast }) {
  const [token, setToken] = useState(sessionStorage.getItem('adminToken') || '');
  const [pass, setPass] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [activeTab, setActiveTab] = useState('analytics');

  const [stats, setStats] = useState({ totalClients: 0, activePaid: 0, activeTrials: 0, totalFarmers: 0, totalDealers: 0, totalLogs: 0 });
  const [clients, setClients] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [backupInfo, setBackupInfo] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const fileInputRef = useRef(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [logLevelFilter, setLogLevelFilter] = useState('ALL');
  const [logCategoryFilter, setLogCategoryFilter] = useState('ALL');

  // Modals & Keys
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [reqCodeInput, setReqCodeInput] = useState('');
  const [validDaysInput, setValidDaysInput] = useState(365);
  const [generatedKey, setGeneratedKey] = useState('');
  
  // Admin Users Modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdminUser, setNewAdminUser] = useState({ username: '', password: '', role: 'ADMIN' });

  useEffect(() => {
    if (token) {
      loadAdminData();
    }
  }, [token]);

  const handleLogin = async () => {
    setAuthErr('');
    try {
      const res = await fetch('/api/v1/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass.trim() })
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('adminToken', data.token);
        setToken(data.token);
        showToast('Admin Login successful!', 'success');
      } else {
        setAuthErr(data.error || 'Login failed');
      }
    } catch (e) {
      setAuthErr('Server connection error');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setToken('');
  };

  const loadAdminData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const sRes = await fetch('/api/v1/admin/dashboard-stats', { headers });
      const sData = await sRes.json();
      if (sData.success) setStats(sData.stats);

      const cRes = await fetch('/api/v1/admin/clients', { headers });
      const cData = await cRes.json();
      if (cData.success) setClients(cData.clients || []);

      const fRes = await fetch('/api/v1/admin/farmers', { headers });
      const fData = await fRes.json();
      if (fData.success) setFarmers(fData.farmers || []);

      const dRes = await fetch('/api/v1/admin/dealers', { headers });
      const dData = await dRes.json();
      if (dData.success) setDealers(dData.dealers || []);

      const iRes = await fetch('/api/v1/admin/inquiries', { headers });
      const iData = await iRes.json();
      if (iData.success) setInquiries(iData.inquiries || []);

      const pRes = await fetch('/api/v1/admin/payments', { headers });
      const pData = await pRes.json();
      if (pData.success) setPayments(pData.payments || []);

      const lRes = await fetch('/api/v1/admin/logs', { headers });
      const lData = await lRes.json();
      if (lData.success) setLogs(lData.logs || []);

      const elRes = await fetch('/api/v1/admin/email/logs', { headers });
      const elData = await elRes.json();
      if (elData.success) setEmailLogs(elData.logs || []);

      const chRes = await fetch('/api/v1/admin/analytics/charts', { headers });
      const chData = await chRes.json();
      if (chData.success) setChartData(chData.charts);

      const bkRes = await fetch('/api/v1/admin/backup/info', { headers });
      const bkData = await bkRes.json();
      if (bkData.success) setBackupInfo(bkData);

      const uRes = await fetch('/api/v1/admin/users', { headers });
      const uData = await uRes.json();
      if (uData.success) setAdminUsers(uData.users || []);

    } catch (e) {
      console.warn('Error loading admin data:', e);
    }
  };

  const handleExportCSV = (table) => {
    window.open(`/api/v1/admin/export/${table}?token=${token}`, '_blank');
  };

  const handleBackupDownload = () => {
    window.open(`/api/v1/admin/backup/download?token=${token}`, '_blank');
  };

  const handleRestoreUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!window.confirm('⚠️ WARNING: Restoring a backup will OVERWRITE the current database completely. All current connections will be terminated and unsaved changes lost. Continue?')) {
      e.target.value = null;
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const res = await fetch('/api/v1/admin/backup/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/octet-stream'
        },
        body: buffer
      });
      const data = await res.json();
      if (data.success) {
        showToast('Database restored successfully!', 'success');
        loadAdminData();
      } else {
        showToast(data.error || 'Restore failed', 'error');
      }
    } catch (err) {
      showToast('Error uploading database file', 'error');
    }
    e.target.value = null;
  };

  const handleCreateAdmin = async () => {
    if (!newAdminUser.username || !newAdminUser.password) {
      showToast('Username and password are required', 'error');
      return;
    }
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newAdminUser)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Admin user created successfully', 'success');
        setShowAdminModal(false);
        setNewAdminUser({ username: '', password: '', role: 'ADMIN' });
        loadAdminData();
      } else {
        showToast(data.error || 'Failed to create admin user', 'error');
      }
    } catch (err) {
      showToast('Server error', 'error');
    }
  };

  const handleDeleteAdmin = async (id, username) => {
    if (!window.confirm(`Are you sure you want to delete admin user "${username}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Admin user deleted', 'success');
        loadAdminData();
      } else {
        showToast(data.error || 'Failed to delete user', 'error');
      }
    } catch (err) {
      showToast('Server error', 'error');
    }
  };

  const handleGenerateKey = async () => {
    if (!reqCodeInput.trim()) {
      showToast('Please enter a Request Code', 'error');
      return;
    }

    try {
      const res = await fetch('/api/v1/admin/generate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ requestCode: reqCodeInput.trim(), validDays: parseInt(validDaysInput) })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedKey(data.activationKey);
        showToast('Key generated successfully!', 'success');
        loadAdminData();
      } else {
        showToast(data.error || 'Failed to generate key', 'error');
      }
    } catch (e) {
      showToast('Server error', 'error');
    }
  };

  const handleRevokeKey = async (reqCode) => {
    if (!window.confirm(`Are you sure you want to revoke key for ${reqCode}?`)) return;

    try {
      const res = await fetch('/api/v1/admin/clients/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ requestCode: reqCode })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        loadAdminData();
      } else {
        showToast(data.error || 'Failed to revoke key', 'error');
      }
    } catch (e) {
      showToast('Server error', 'error');
    }
  };

  if (!token) {
    return (
      <div className="animate-fade-in" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div className="glass-card" style={{ width: '420px', maxWidth: '100%', textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #059669, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 24px auto', color: '#fff', boxShadow: '0 8px 24px rgba(5, 150, 105, 0.3)' }}>
            🛡️
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', color: '#0f172a' }}>Ruractive Admin Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Enter your administrator credentials to securely access the central management platform.</p>

          <input 
            type="password" 
            className="modern-input" 
            value={pass} 
            onChange={e => setPass(e.target.value)} 
            onKeyUp={e => e.key === 'Enter' && handleLogin()} 
            placeholder="Admin Password" 
            style={{ marginBottom: '16px', textAlign: 'center', fontSize: '16px', padding: '14px' }} 
          />
          <button onClick={handleLogin} className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: '48px', fontSize: '15px' }}>
            Secure Login
          </button>
          {authErr && <div style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: 700, marginTop: '20px' }}>{authErr}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Modern Refactored Sidebar */}
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          stats={stats} 
          inquiriesCount={inquiries.length}
          paymentsCount={payments.length}
          logsCount={logs.length}
          handleLogout={handleLogout}
        />

        {/* Dynamic Main Content Pane */}
        <div style={{ minWidth: 0 }}>
          {activeTab === 'analytics' && <AdminStatsOverview stats={stats} chartData={chartData} setShowKeyModal={setShowKeyModal} />}
          {activeTab === 'clients' && <ClientManagement clients={clients} search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} handleExportCSV={handleExportCSV} handleRevokeKey={handleRevokeKey} />}
          {activeTab === 'inquiries' && <LeadInquiries inquiries={inquiries} handleExportCSV={handleExportCSV} />}
          {activeTab === 'payments' && <PaymentReceipts payments={payments} handleExportCSV={handleExportCSV} />}
          {activeTab === 'logs' && <AuditLogs logs={logs} search={search} setSearch={setSearch} logLevelFilter={logLevelFilter} setLogLevelFilter={setLogLevelFilter} logCategoryFilter={logCategoryFilter} setLogCategoryFilter={setLogCategoryFilter} handleExportCSV={handleExportCSV} />}
          {activeTab === 'email_logs' && <EmailLogs emailLogs={emailLogs} />}
          {activeTab === 'backup' && <BackupRestore backupInfo={backupInfo} handleBackupDownload={handleBackupDownload} handleRestoreUpload={handleRestoreUpload} fileInputRef={fileInputRef} />}
          {activeTab === 'users' && <AdminUsers adminUsers={adminUsers} setShowAdminModal={setShowAdminModal} handleDeleteAdmin={handleDeleteAdmin} />}
          {activeTab === 'farmers' && <FarmerManagement farmers={farmers} search={search} setSearch={setSearch} handleExportCSV={handleExportCSV} />}
          {activeTab === 'dealers' && <DealerManagement dealers={dealers} search={search} setSearch={setSearch} handleExportCSV={handleExportCSV} />}
          {activeTab === 'settings' && <SettingsPage showToast={showToast} />}
        </div>
      </div>

      {/* Manual Key Generation Modal */}
      {showKeyModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '480px', maxWidth: '90%', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Issue Activation Key</h3>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }} onClick={() => setShowKeyModal(false)}>&times;</button>
            </div>
            
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Machine Request Code (Optional, bypasses machine lock if empty)</label>
            <input type="text" className="modern-input" placeholder="REQ-XXXXX-XXXX" value={reqCodeInput} onChange={e => setReqCodeInput(e.target.value)} style={{ marginBottom: '20px', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase' }} />
            
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Validity Duration (Days)</label>
            <select className="modern-input" value={validDaysInput} onChange={e => setValidDaysInput(e.target.value)} style={{ marginBottom: '24px' }}>
              <option value="3">3 Days (Trial)</option>
              <option value="365">365 Days (1 Year)</option>
              <option value="730">730 Days (2 Years)</option>
              <option value="9999">Unlimited (Lifetime)</option>
            </select>
            
            {generatedKey ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>Successfully Issued Key</div>
                <div style={{ fontFamily: 'monospace', fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '1px' }}>{generatedKey}</div>
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => { setShowKeyModal(false); setGeneratedKey(''); }}>{generatedKey ? 'Close' : 'Cancel'}</button>
              {!generatedKey && <button className="btn-primary" onClick={handleGenerateKey}>Generate Key</button>}
            </div>
          </div>
        </div>
      )}

      {/* Admin User Modal */}
      {showAdminModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '400px', maxWidth: '90%', padding: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Create New Admin</h3>
            <input type="text" className="modern-input" placeholder="Username" value={newAdminUser.username} onChange={e => setNewAdminUser({ ...newAdminUser, username: e.target.value })} style={{ marginBottom: '16px' }} />
            <input type="password" className="modern-input" placeholder="Password" value={newAdminUser.password} onChange={e => setNewAdminUser({ ...newAdminUser, password: e.target.value })} style={{ marginBottom: '24px' }} />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowAdminModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateAdmin}>Create User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
