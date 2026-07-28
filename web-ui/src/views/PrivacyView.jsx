import React from 'react';

export default function PrivacyView() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Last Updated: January 2026 | Ruractive Technology Data Protection Policy</p>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '14px', color: '#334155' }}>
        <section>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>1. Data Collection & Non-Disclosure</h3>
          <p><strong>Ruractive Technology</strong> respects your business confidentiality. Our software extracts only sales voucher records required for government compliance synchronization. We NEVER store, sell, or disclose your private Tally financial ledgers or accounting balances.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>2. Information Collected</h3>
          <p>We collect essential account details during registration (Firm Name, Contact Mobile, Email, Machine Request Code, and Bound Tally Serial Number) solely to issue and validate your software subscription.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>3. Payment Security</h3>
          <p>Online subscription payments are processed securely via <strong>Razorpay Payment Gateway</strong> using 256-bit SSL encryption. Ruractive Technology does not store credit/debit card numbers or UPI PINs on our servers.</p>
        </section>

        <section>
          <h3 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '8px' }}>4. Shared Master Registries</h3>
          <p>Farmer and Dealer registry records shared through our central platform are deduplicated and synchronized across authorized member branches strictly to maintain master data accuracy.</p>
        </section>
      </div>
    </div>
  );
}
