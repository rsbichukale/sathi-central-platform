import React from 'react';

const SettingsPage = () => {
  return (
    <div className="glass-card fade-in" style={{ padding: '40px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>⚙️ System Configuration</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
        No global settings require configuration at this time.
        <br/><br/>
        (Email SMTP, RazorPay, and Subscription options have been removed per configuration).
      </p>
    </div>
  );
};

export default SettingsPage;
