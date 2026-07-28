import React, { useState } from 'react';

export default function LoginView({ setCurrentView, showToast }) {
  const [loginType, setLoginType] = useState('customer'); // 'customer' or 'admin'
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCustomerLogin = async (e) => {
    if (e) e.preventDefault();
    setAuthErr('');
    if (!mobile || !password) {
      setAuthErr('Mobile Number and Password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNo: mobile, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('custToken', data.token);
        showToast('Login successful!', 'success');
        setCurrentView('customer');
      } else {
        setAuthErr(data.error || 'Login failed.');
      }
    } catch (err) {
      setAuthErr('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    setAuthErr('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPass.trim() })
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('adminToken', data.token);
        showToast('Admin Login successful!', 'success');
        setCurrentView('admin');
      } else {
        setAuthErr(data.error || 'Login failed.');
      }
    } catch (err) {
      setAuthErr('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div className="glass-card" style={{ width: '450px', maxWidth: '100%', padding: '36px', background: '#ffffff' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '54px', height: '54px',
            background: 'linear-gradient(135deg, #059669, #2563eb)',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
            margin: '0 auto 14px auto', boxShadow: '0 8px 20px rgba(5, 150, 105, 0.25)', color: '#fff'
          }}>
            🔐
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>
            {loginType === 'customer' ? 'Customer Portal Login' : 'Admin Command Center'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {loginType === 'customer' ? 'Manage your firm software licenses & machine activations.' : 'Ruractive Technology platform administration.'}
          </p>
        </div>

        {/* Login Type Switcher */}
        <div style={{ display: 'flex', background: '#f8fafc', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <button 
            type="button"
            onClick={() => { setLoginType('customer'); setAuthErr(''); }} 
            style={{ flex: 1, border: 'none', background: loginType === 'customer' ? '#059669' : 'transparent', color: loginType === 'customer' ? '#fff' : '#475569', padding: '8px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            👤 Customer Login
          </button>
          <button 
            type="button"
            onClick={() => { setLoginType('admin'); setAuthErr(''); }} 
            style={{ flex: 1, border: 'none', background: loginType === 'admin' ? '#059669' : 'transparent', color: loginType === 'admin' ? '#fff' : '#475569', padding: '8px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            🛡️ Admin Login
          </button>
        </div>

        {loginType === 'customer' ? (
          <form onSubmit={handleCustomerLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Registered Mobile Number</label>
              <input type="text" className="modern-input" placeholder="e.g. 9876543210" value={mobile} onChange={e => setMobile(e.target.value)} required />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Password</label>
              <input type="password" className="modern-input" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: '46px', fontSize: '15px', marginBottom: '20px' }}>
              {loading ? 'Logging in...' : 'Login to Customer Portal →'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              Don't have an account? <span onClick={() => setCurrentView('register')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}>Register Company Here</span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Admin Master Password</label>
              <input type="password" className="modern-input" placeholder="Enter Admin Master Password" value={adminPass} onChange={e => setAdminPass(e.target.value)} required style={{ textAlign: 'center' }} />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: '46px', fontSize: '15px', marginBottom: '20px' }}>
              {loading ? 'Logging in...' : 'Login to Admin Panel →'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              Need client access? <span onClick={() => setLoginType('customer')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}>Switch to Customer Login</span>
            </div>
          </form>
        )}

        {authErr && <div style={{ color: 'var(--danger)', fontSize: '13px', fontWeight: 600, marginTop: '16px', textAlign: 'center' }}>{authErr}</div>}
      </div>
    </div>
  );
}
