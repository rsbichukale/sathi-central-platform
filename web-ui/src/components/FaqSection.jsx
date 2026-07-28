import React, { useState } from 'react';

const faqs = [
  {
    q: 'How does the 3-Day Free Trial work?',
    a: 'Simply click "Start 3-Day Free Trial", enter your Machine Request Code from your desktop PC, and receive an instant 12-character activation key. No credit card is required!'
  },
  {
    q: 'Is Ruractive SATHI Connector compatible with Tally ERP 9 and Tally Prime?',
    a: 'Yes! Ruractive SATHI Connector connects natively to all versions of Tally ERP 9 and Tally Prime running locally on your computer.'
  },
  {
    q: 'What happens if my internet connection goes offline?',
    a: 'Ruractive Connector includes an automatic 7-day cryptographic offline fallback. You can continue extracting sales vouchers and running wizards offline seamlessly.'
  },
  {
    q: 'How does Shared Farmer & Dealer Registry Sync work across multiple computers?',
    a: 'When you create or edit a farmer or dealer in the app, the central platform deduplicates and shares the updated records across all authorized machines in your firm.'
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section style={{ maxWidth: '900px', margin: '0 auto 100px auto', padding: '0 24px' }}>
      {/* Trust Banner */}
      <div className="glass-card" style={{ textAlignment: 'center', marginBottom: '60px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>Trusted by 500+ Agri-Dealers Across Maharashtra & India</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '650px', margin: '0 auto' }}>
          Over ₹10Cr+ in seed sales vouchers processed and synchronized with 100% government portal compliance.
        </p>
      </div>

      <h2 style={{ fontSize: '32px', fontWeight: 800, textAlign: 'center', marginBottom: '32px', color: '#0f172a' }}>Frequently Asked Questions</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {faqs.map((f, i) => (
          <div key={i}>
            <div className="accordion-header" onClick={() => toggle(i)}>
              <span>{f.q}</span>
              <span style={{ fontSize: '18px', color: 'var(--primary)' }}>{openIndex === i ? '−' : '+'}</span>
            </div>
            {openIndex === i && (
              <div className="accordion-body animate-fade-in">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
