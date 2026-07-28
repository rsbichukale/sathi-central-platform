import React from 'react';

export default function AboutView({ openInquiry }) {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>About Ruractive Technology</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '750px', margin: '0 auto' }}>
          Building digital infrastructure for agriculture, dairy societies, enterprise supply chains, and business growth across India.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '60px' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>🎯 Our Mission</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>
            To simplify complex business operations and government compliance through robust software automation, intuitive web applications, and dedicated customer support.
          </p>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>💡 Innovation & Trust</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>
            Trusted by over 500+ Agri-Dealers, Dairy Cooperatives, and Enterprises. We blend high-performance Node.js/React cloud software with offline-first desktop reliability.
          </p>
        </div>
      </div>

      {/* Contact Info Card */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>📞 Get in Touch with Ruractive Team</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
            Have questions about software licensing, custom web application development, or technical support? Our experts are ready to assist.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '24px', color: '#334155' }}>
            <div><strong>📱 Call Helpline:</strong> +91 98765 43210</div>
            <div><strong>💬 WhatsApp Support:</strong> +91 98765 43210</div>
            <div><strong>📧 Email:</strong> support@ruractive.com</div>
            <div><strong>🏢 Office:</strong> Ruractive Technology Tech Park, Maharashtra, India</div>
          </div>
          <button onClick={() => openInquiry('General Contact')} className="btn-primary">
            💬 Send Direct Message
          </button>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏢</div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Ruractive Corporate Support</h3>
          <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700, marginTop: '6px' }}>Monday - Saturday (9:00 AM - 7:00 PM IST)</div>
        </div>
      </div>
    </div>
  );
}
