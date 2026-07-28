import React from 'react';

export default function TermsView() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>Terms & Conditions</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Last Updated: January 2026 | Ruractive Technology End User License Agreement (EULA)</p>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '14px', color: '#334155' }}>
        <section>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>1. Acceptance of Terms</h3>
          <p>By downloading, installing, purchasing, or using any software platform developed by <strong>Ruractive Technology</strong> (including SATHI Connector for Tally, Dairy Management System, WMS, or Custom Web Applications), you agree to be bound by these Terms and Conditions.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>2. Software Licensing & Machine Bindings</h3>
          <p>Each software activation key issued by Ruractive Technology is cryptographically bound to a single computer's Hardware Request Code. License sharing or copying across unauthorized hardware without explicit multi-PC entitlement is strictly prohibited.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>3. Free Trials & Subscriptions</h3>
          <p>3-Day Free Trials grant 72 hours of full software feature access. Annual Pro licenses are valid for 365 calendar days from the date of activation key entry. Subscriptions must be renewed prior to expiry to ensure continuous online portal synchronization.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>4. Offline Fallback & Data Ownership</h3>
          <p>Users maintain full ownership of their local Tally financial records and sales vouchers. Ruractive Technology software operates locally with an automatic 7-day cryptographic offline fallback token.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>5. Limitation of Liability</h3>
          <p>Ruractive Technology is not liable for indirect or consequential damages resulting from third-party government portal outages or user accounting misconfigurations.</p>
        </section>
      </div>
    </div>
  );
}
