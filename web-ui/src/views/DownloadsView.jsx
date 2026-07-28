import React from 'react';

export default function DownloadsView({ showToast }) {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>Software Download Center</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '750px', margin: '0 auto' }}>
          Download official installation packages, setup guides, and system drivers for Ruractive Technology platforms.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
        {/* Item 1 */}
        <div className="glass-card">
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>💻</div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>SATHI Connector Desktop App</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
            Official Windows 10/11 Desktop Connector application with built-in Tally ERP 9 / Tally Prime automatic synchronization engine.
          </p>
          <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }}>Version 2.4.0 (Windows 64-bit) — 48 MB</div>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => showToast('Downloading SATHI Connector Installer (.exe)...', 'info')}>
            📥 Download Installer (.exe)
          </button>
        </div>

        {/* Item 2 */}
        <div className="glass-card">
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🥛</div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>Dairy Management Client</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
            Desktop collection software with USB Weighing Scale and Milk Analyzer hardware drivers.
          </p>
          <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '20px' }}>Version 1.8.2 (Windows 64-bit) — 34 MB</div>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => showToast('Downloading Dairy Client Installer...', 'info')}>
            📥 Download Dairy Client (.exe)
          </button>
        </div>

        {/* Item 3 */}
        <div className="glass-card">
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📖</div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>SATHI Installation & User Guide</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
            Step-by-step PDF manual explaining Request Code generation, Tally port configuration, and License Key activation.
          </p>
          <div style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: 700, marginBottom: '20px' }}>PDF Document — 4.2 MB</div>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => showToast('Downloading User Guide PDF...', 'info')}>
            📥 Download User Guide (.pdf)
          </button>
        </div>
      </div>

      {/* System Requirements */}
      <div className="glass-card" style={{ marginTop: '48px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>Minimum System Requirements</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
          <div><strong>Operating System:</strong> Windows 10, 11 (64-bit)</div>
          <div><strong>Tally Version:</strong> Tally ERP 9 Rel 6.0+ / Tally Prime 1.0+</div>
          <div><strong>RAM:</strong> 4 GB Minimum (8 GB Recommended)</div>
          <div><strong>Internet:</strong> Required for initial key activation (7-day offline access supported)</div>
        </div>
      </div>
    </div>
  );
}
