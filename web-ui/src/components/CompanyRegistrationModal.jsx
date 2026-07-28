import React, { useState } from 'react';

export default function CompanyRegistrationModal({ onClose, showToast }) {
  const [firmName, setFirmName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [tallySerial, setTallySerial] = useState('739201948');
  const [requestCode, setRequestCode] = useState('');
  const [planType, setPlanType] = useState('ANNUAL_PRO');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!firmName.trim() || !mobileNo.trim() || !requestCode.trim()) {
      showToast('Firm Name, Mobile Number, and PC Request Code are required.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/client/register-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firmName,
          ownerName,
          mobileNo,
          email,
          gstin,
          address,
          tallySerial,
          requestCode,
          planType
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        showToast('🎉 Company registered! Dual keys generated.', 'success');
      } else {
        showToast(data.error || 'Registration failed.', 'error');
      }
    } catch (e) {
      showToast('Server connection error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div className="glass-card animate-fade-in" style={{ width: '560px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>🏢 Company Software Registration & License Setup</h3>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '24px', cursor: 'pointer' }} onClick={onClose}>&times;</button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Fill out your firm & machine details to generate your Activation Key and User API Key.</p>

        {!result ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Firm / Company Name *</label>
                <input type="text" className="modern-input" placeholder="e.g. SIDDHANATH KRUSHI KENDRA" value={firmName} onChange={e => setFirmName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Proprietor / Owner Name</label>
                <input type="text" className="modern-input" placeholder="Owner Full Name" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Mobile Number *</label>
                <input type="text" className="modern-input" placeholder="10-Digit Mobile" value={mobileNo} onChange={e => setMobileNo(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Email Address</label>
                <input type="email" className="modern-input" placeholder="info@firm.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>GSTIN / Seed License No</label>
                <input type="text" className="modern-input" placeholder="27AAAAA0000A1Z5" value={gstin} onChange={e => setGstin(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Tally Serial Number</label>
                <input type="text" className="modern-input" placeholder="739201948" value={tallySerial} onChange={e => setTallySerial(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Business Address & District</label>
              <input type="text" className="modern-input" placeholder="Shop #12, Market Yard, Kolhapur, Maharashtra" value={address} onChange={e => setAddress(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>PC Hardware Request Code *</label>
                <input type="text" className="modern-input" placeholder="REQ-ED9B-E0E3-5882" value={requestCode} onChange={e => setRequestCode(e.target.value)} style={{ fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Subscription Plan</label>
                <select className="modern-input" value={planType} onChange={e => setPlanType(e.target.value)}>
                  <option value="ANNUAL_PRO">1-Year Annual Pro (₹4,999)</option>
                  <option value="ENTERPRISE">Enterprise Multi-PC (₹12,999)</option>
                  <option value="TRIAL">3-Day Free Trial (₹0)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Registering...' : 'Register Company & Issue Keys 🎉'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ background: '#f8fafc', border: '1px solid #059669', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 800, color: '#059669', marginBottom: '8px' }}>🎉 Company Registered & License Activated!</div>
              
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>1. SOFTWARE ACTIVATION KEY (For Desktop App):</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', marginTop: '4px' }}>
                  <code style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 800, color: '#059669' }}>{result.activationKey}</code>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => { navigator.clipboard.writeText(result.activationKey); showToast('Activation Key copied!', 'success'); }}>Copy</button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>2. USER API KEY (For Desktop-to-Server Sync):</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', marginTop: '4px' }}>
                  <code style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>{result.userApiKey}</code>
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => { navigator.clipboard.writeText(result.userApiKey); showToast('User API Key copied!', 'success'); }}>Copy</button>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button className="btn-primary" onClick={onClose}>Done & Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
