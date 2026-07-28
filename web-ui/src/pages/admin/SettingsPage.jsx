import React, { useState, useEffect } from 'react';

const SettingsPage = ({ showToast }) => {
  const [settings, setSettings] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '',
    razorpay_key_id: '',
    razorpay_key_secret: '',
    plan_trial_days: '',
    plan_annual_price: '',
    plan_annual_days: '',
    plan_enterprise_price: '',
    plan_enterprise_days: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [activeTab, setActiveTab] = useState('smtp');

  useEffect(() => {
    fetchSettings();
  }, []);

  const getHeaders = () => {
    const token = sessionStorage.getItem('adminToken') || '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/settings', { headers: getHeaders() });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      } else {
        if (showToast) showToast(data.error || 'Failed to fetch settings', 'error');
      }
    } catch (err) {
      if (showToast) showToast('Failed to fetch settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast('Settings saved successfully!', 'success');
      } else {
        if (showToast) showToast(data.error || 'Failed to save settings', 'error');
      }
    } catch (err) {
      if (showToast) showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!testEmail) {
      if (showToast) showToast('Please enter a test email address.', 'error');
      return;
    }
    try {
      setTestingSmtp(true);
      
      // Save settings first
      await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ settings })
      });

      const res = await fetch('/api/v1/admin/settings/test-smtp', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ testEmail })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(data.message, 'success');
      } else {
        if (showToast) showToast(data.error || 'Test email failed.', 'error');
      }
    } catch (err) {
      if (showToast) showToast('Test email failed. Check console for details.', 'error');
    } finally {
      setTestingSmtp(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Settings...</div>;
  }

  return (
    <div className="glass-card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>⚙️ System Configuration</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '14px' }}>Manage global platform settings dynamically.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>
        {/* Sidebar Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('smtp')}
            style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'smtp' ? '#eff6ff' : 'transparent', color: activeTab === 'smtp' ? '#1d4ed8' : '#64748b', fontWeight: 700, cursor: 'pointer' }}
          >
            📧 Email (SMTP)
          </button>
          <button 
            onClick={() => setActiveTab('payment')}
            style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'payment' ? '#f3e8ff' : 'transparent', color: activeTab === 'payment' ? '#7e22ce' : '#64748b', fontWeight: 700, cursor: 'pointer' }}
          >
            💳 Razorpay
          </button>
          <button 
            onClick={() => setActiveTab('plans')}
            style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'plans' ? '#ecfdf5' : 'transparent', color: activeTab === 'plans' ? '#047857' : '#64748b', fontWeight: 700, cursor: 'pointer' }}
          >
            ✅ Subscriptions
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          {activeTab === 'smtp' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">SMTP Configuration</h2>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SMTP Host</label>
                  <input type="text" name="smtp_host" value={settings.smtp_host} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500" placeholder="smtp.gmail.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SMTP Port</label>
                  <input type="text" name="smtp_port" value={settings.smtp_port} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500" placeholder="465" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SMTP Username / Email</label>
                  <input type="text" name="smtp_user" value={settings.smtp_user} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SMTP Password / App Password</label>
                  <input type="password" name="smtp_pass" value={settings.smtp_pass} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sender Name & Email ('From')</label>
                  <input type="text" name="smtp_from" value={settings.smtp_from} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500" placeholder="SATHI Platform <noreply@yourdomain.com>" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Test Email Configuration</h3>
                <div className="flex space-x-3">
                  <input 
                    type="email" 
                    value={testEmail} 
                    onChange={e => setTestEmail(e.target.value)} 
                    placeholder="Enter email to receive test message" 
                    className="flex-1 border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500" 
                  />
                  <button 
                    onClick={handleTestSmtp} 
                    disabled={testingSmtp}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors"
                  >
                    {testingSmtp ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Razorpay Gateway</h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Razorpay Key ID</label>
                  <input type="text" name="razorpay_key_id" value={settings.razorpay_key_id} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500" placeholder="rzp_live_xxxx" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Razorpay Key Secret</label>
                  <input type="password" name="razorpay_key_secret" value={settings.razorpay_key_secret} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500" placeholder="Your secret key" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Subscription Plans & Pricing</h2>
              
              <div className="space-y-8">
                {/* Trial */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Trial Plan</h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (Days)</label>
                    <input type="number" name="plan_trial_days" value={settings.plan_trial_days} onChange={handleChange} className="w-1/3 border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                </div>

                {/* Annual Pro */}
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                  <h3 className="text-lg font-bold text-emerald-800 mb-4">Annual Pro Plan</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-emerald-700 mb-2">Price (in Paise - e.g. 499900 = ₹4999)</label>
                      <input type="number" name="plan_annual_price" value={settings.plan_annual_price} onChange={handleChange} className="w-full border-emerald-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-emerald-700 mb-2">Duration (Days)</label>
                      <input type="number" name="plan_annual_days" value={settings.plan_annual_days} onChange={handleChange} className="w-full border-emerald-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* Enterprise */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-800 mb-4">Enterprise Plan (Custom)</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">Price (in Paise)</label>
                      <input type="number" name="plan_enterprise_price" value={settings.plan_enterprise_price} onChange={handleChange} className="w-full border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 mb-2">Duration (Days)</label>
                      <input type="number" name="plan_enterprise_days" value={settings.plan_enterprise_days} onChange={handleChange} className="w-full border-blue-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
