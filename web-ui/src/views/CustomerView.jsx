import React, { useState, useEffect } from 'react';

export default function CustomerView({ showToast }) {
  const [token, setToken] = useState(localStorage.getItem('custToken') || '');
  const [activeTab, setActiveTab] = useState('overview');
  const [mode, setMode] = useState('login');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [firmName, setFirmName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [authErr, setAuthErr] = useState('');

  const [customer, setCustomer] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchCustomerData();
    }
  }, [token]);

  const handleLogin = async () => {
    setAuthErr('');
    if (!mobile || !password) {
      setAuthErr('Mobile Number and Password are required.');
      return;
    }

    try {
      const res = await fetch('/api/v1/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNo: mobile, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('custToken', data.token);
        setToken(data.token);
        showToast('Login successful!', 'success');
      } else {
        setAuthErr(data.error || 'Login failed.');
      }
    } catch (e) {
      setAuthErr('Server connection error.');
    }
  };

  const handleRegister = async () => {
    setAuthErr('');
    if (!firmName || !mobile || !password) {
      setAuthErr('Firm Name, Mobile Number, and Password are required.');
      return;
    }

    try {
      const res = await fetch('/api/v1/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firmName, ownerName, mobileNo: mobile, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('custToken', data.token);
        setToken(data.token);
        showToast('Account registered successfully!', 'success');
      } else {
        setAuthErr(data.error || 'Registration failed.');
      }
    } catch (e) {
      setAuthErr('Server connection error.');
    }
  };

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/customer/me', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      if (data.success) {
        setCustomer(data.customer);
        setSubscriptions(data.subscriptions || []);
        setMachines(data.machines || []);
      } else {
        localStorage.removeItem('custToken');
        setToken('');
      }
    } catch (e) {
      console.warn('Could not fetch customer info:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('custToken');
    setToken('');
    setCustomer(null);
  };

  if (!token) {
    return (
      <div className="animate-fade-in" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div className="glass-card" style={{ width: '440px', maxWidth: '100%', textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg, #059669, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', margin: '0 auto 16px auto', color: '#fff' }}>
            🌱
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>{mode === 'login' ? 'Customer Portal Login' : 'Create Customer Account'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Manage your SATHI Connector licenses & machine activations.</p>

          {mode === 'login' ? (
            <div>
              <input type="text" className="modern-input" placeholder="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} style={{ marginBottom: '14px' }} />
              <input type="password" className="modern-input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ marginBottom: '18px' }} />
              <button onClick={handleLogin} className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: '46px', marginBottom: '16px' }}>
                Login to Customer Portal
              </button>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Don't have an account? <span onClick={() => setMode('register')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}>Sign up</span>
              </p>
            </div>
          ) : (
            <div>
              <input type="text" className="modern-input" placeholder="Firm / Company Name" value={firmName} onChange={e => setFirmName(e.target.value)} style={{ marginBottom: '12px' }} />
              <input type="text" className="modern-input" placeholder="Owner Full Name" value={ownerName} onChange={e => setOwnerName(e.target.value)} style={{ marginBottom: '12px' }} />
              <input type="text" className="modern-input" placeholder="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} style={{ marginBottom: '12px' }} />
              <input type="password" className="modern-input" placeholder="Create Password" value={password} onChange={e => setPassword(e.target.value)} style={{ marginBottom: '18px' }} />
              <button onClick={handleRegister} className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: '46px', marginBottom: '16px' }}>
                Create Customer Account
              </button>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Already registered? <span onClick={() => setMode('login')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}>Login</span>
              </p>
            </div>
          )}

          {authErr && <div style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: 600, marginTop: '16px' }}>{authErr}</div>}
        </div>
      </div>
    );
  }

  const primarySub = subscriptions[0] || null;
  const daysLeft = primarySub ? primarySub.daysRemaining : 0;
  const progressPercent = Math.min(100, Math.max(0, (daysLeft / 365) * 100));

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Customer Sidebar Navigation */}
        <div className="glass-card" style={{ padding: '24px 16px' }}>
          <div style={{ padding: '0 12px 20px 12px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{customer?.firmName || 'My Workspace'}</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📱 {customer?.mobileNo}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('overview')}
              style={{ border: 'none', background: activeTab === 'overview' ? '#059669' : 'transparent', color: activeTab === 'overview' ? '#fff' : '#0f172a', padding: '12px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              📊 Overview & Status
            </button>
            <button 
              onClick={() => setActiveTab('licenses')}
              style={{ border: 'none', background: activeTab === 'licenses' ? '#059669' : 'transparent', color: activeTab === 'licenses' ? '#fff' : '#0f172a', padding: '12px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              🔑 My License Keys
            </button>
            <button 
              onClick={() => setActiveTab('machines')}
              style={{ border: 'none', background: activeTab === 'machines' ? '#059669' : 'transparent', color: activeTab === 'machines' ? '#fff' : '#0f172a', padding: '12px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              💻 Machine Telemetry
            </button>
            <button 
              onClick={() => setActiveTab('downloads')}
              style={{ border: 'none', background: activeTab === 'downloads' ? '#059669' : 'transparent', color: activeTab === 'downloads' ? '#fff' : '#0f172a', padding: '12px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              📥 Software Downloads
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              style={{ border: 'none', background: activeTab === 'settings' ? '#059669' : 'transparent', color: activeTab === 'settings' ? '#fff' : '#0f172a', padding: '12px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              ⚙️ API Key & Settings
            </button>

            <button onClick={handleLogout} className="btn-secondary" style={{ marginTop: '20px', justifyContent: 'center' }}>
              Logout Account
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div>
          {/* TAB 1: Overview */}
          {activeTab === 'overview' && (
            <div>
              {/* Progress Card */}
              <div className="glass-card" style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Subscription License Validity</h3>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{primarySub ? `Plan: ${primarySub.planType}` : 'No Active Subscription'}</div>
                  </div>
                  <span className={primarySub?.status === 'ACTIVE' ? 'badge-active' : 'badge-trial'}>{primarySub?.status || 'INACTIVE'}</span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    <span>License Days Remaining</span>
                    <span>{daysLeft} Days Left</span>
                  </div>
                  <div style={{ background: '#e2e8f0', height: '12px', borderRadius: '20px', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg, #059669, #10b981)', height: '100%', width: `${progressPercent}%`, borderRadius: '20px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="glass-card">
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📥</div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Desktop Installer</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Download the latest Windows Desktop Connector v2.4.</p>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => showToast('Installer download started!', 'info')}>Download (.exe)</button>
                </div>

                <div className="glass-card">
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔑</div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Activation Key</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Copy active key for Desktop App entry.</p>
                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { navigator.clipboard.writeText(primarySub?.activationKey || ''); showToast('Key copied to clipboard!', 'success'); }}>Copy Key</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Licenses */}
          {activeTab === 'licenses' && (
            <div className="glass-card">
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', color: '#0f172a' }}>My Activation Keys & Subscriptions</h3>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Plan Type</th>
                    <th>Activation Key</th>
                    <th>Days Remaining</th>
                    <th>Status</th>
                    <th>Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(s => (
                    <tr key={s.id}>
                      <td><strong style={{ color: '#0f172a' }}>{s.planType}</strong></td>
                      <td><code style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 700, color: 'var(--primary)' }}>{s.activationKey}</code></td>
                      <td><strong style={{ color: '#0f172a' }}>{s.daysRemaining} Days</strong></td>
                      <td><span className={s.status === 'ACTIVE' ? 'badge-active' : 'badge-trial'}>{s.status}</span></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.expiresAt ? s.expiresAt.substring(0, 10) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Telemetry */}
          {activeTab === 'machines' && (
            <div className="glass-card">
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', color: '#0f172a' }}>Bound Machine Telemetry & Hardware IDs</h3>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Hardware Request Code</th>
                    <th>Bound Tally Serial</th>
                    <th>Hardware Status</th>
                    <th>Bound Date</th>
                  </tr>
                </thead>
                <tbody>
                  {machines.length === 0 ? (
                    <tr><td colspan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No bound machines yet. Enter Request Code during activation.</td></tr>
                  ) : (
                    machines.map(m => (
                      <tr key={m.id}>
                        <td><code style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{m.request_code}</code></td>
                        <td>{m.tally_serial || '739201948'}</td>
                        <td><span className="badge-active">ONLINE HARDWARE</span></td>
                        <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.created_at || '2026-01-15'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: Downloads */}
          {activeTab === 'downloads' && (
            <div className="glass-card">
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', color: '#0f172a' }}>Software Downloads</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>SATHI Connector Desktop App v2.4 (Windows 64-bit)</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Required for Tally ERP 9 / Tally Prime automatic synchronization.</div>
                  </div>
                  <button className="btn-primary" onClick={() => showToast('Downloading installer...', 'info')}>Download (.exe)</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Settings */}
          {activeTab === 'settings' && (
            <div className="glass-card">
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', color: '#0f172a' }}>⚙️ Desktop Sync & Portal Settings Manager</h3>
              
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Platform User API Key (For Desktop Sync)</div>
                <code style={{ fontFamily: 'monospace', fontSize: '16px', color: 'var(--primary)', fontWeight: 700, display: 'block', marginBottom: '12px' }}>{customer?.apiKey || 'sk_live_...'}</code>
                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => { navigator.clipboard.writeText(customer?.apiKey || ''); showToast('API Key copied!', 'success'); }}>📋 Copy API Key</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Firm Name</label>
                  <input type="text" className="modern-input" defaultValue={customer?.firmName || ''} id="cust_firm" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Proprietor / Owner Name</label>
                  <input type="text" className="modern-input" defaultValue={customer?.ownerName || ''} id="cust_owner" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>GSTIN / Seed License No</label>
                  <input type="text" className="modern-input" defaultValue={customer?.gstin || ''} id="cust_gstin" />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Auto Sync Interval (Minutes)</label>
                  <select className="modern-input" defaultValue="15" id="cust_sync_mins">
                    <option value="5">Every 5 Minutes (Fast)</option>
                    <option value="15">Every 15 Minutes (Recommended)</option>
                    <option value="30">Every 30 Minutes</option>
                    <option value="60">Every 60 Minutes</option>
                  </select>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '10px' }}>🌐 Central Registry Master Toggles</div>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}>
                    <input type="checkbox" defaultChecked={true} id="cust_auto_farmers" />
                    Auto-Sync Central Farmer Registry
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}>
                    <input type="checkbox" defaultChecked={true} id="cust_auto_dealers" />
                    Auto-Sync Central Dealer Registry
                  </label>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button className="btn-primary" onClick={async () => {
                  const firm = document.getElementById('cust_firm')?.value;
                  const owner = document.getElementById('cust_owner')?.value;
                  const gst = document.getElementById('cust_gstin')?.value;
                  const interval = document.getElementById('cust_sync_mins')?.value;
                  const farmers = document.getElementById('cust_auto_farmers')?.checked;
                  const dealers = document.getElementById('cust_auto_dealers')?.checked;

                  try {
                    const res = await fetch('/api/v1/client/settings/update', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        mobileNo: customer?.mobileNo,
                        firmName: firm,
                        ownerName: owner,
                        gstin: gst,
                        syncIntervalMins: parseInt(interval),
                        autoSyncFarmers: farmers,
                        autoSyncDealers: dealers
                      })
                    });
                    const d = await res.json();
                    if (d.success) showToast(d.message, 'success');
                    else showToast(d.error || 'Failed to save settings', 'error');
                  } catch (e) {
                    showToast('Server connection error', 'error');
                  }
                }}>
                  💾 Save Cloud Settings to Desktop App
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
