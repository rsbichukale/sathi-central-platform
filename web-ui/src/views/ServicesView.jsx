import React from 'react';

export default function ServicesView({ openInquiry }) {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>Digital Services & Web Solutions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '750px', margin: '0 auto' }}>
          We design, develop, and market cutting-edge web applications and digital campaigns to scale your business online.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Service 1: Website Designing */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌐</div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>Website Designing & UI/UX</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
              Custom responsive websites designed for maximum conversions. Modern dark & light modes, fast loading speeds, mobile optimization, and Google Search index readiness.
            </p>
            <ul style={{ listStyle: 'none', marginBottom: '24px', fontSize: '14px', color: '#334155' }}>
              <li style={{ marginBottom: '8px' }}>✅ Responsive Mobile & Desktop Layouts</li>
              <li style={{ marginBottom: '8px' }}>✅ High Performance & 95+ PageSpeed</li>
              <li style={{ marginBottom: '8px' }}>✅ Integrated Contact & WhatsApp Buttons</li>
            </ul>
          </div>
          <button onClick={() => openInquiry('Website Designing')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Get Website Design Quote →
          </button>
        </div>

        {/* Service 2: Web Applications */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💻</div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>Custom Web Applications</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
              Tailor-made cloud software, client dashboards, SaaS applications, and internal enterprise tools built using Node.js, Express, React, and SQL databases.
            </p>
            <ul style={{ listStyle: 'none', marginBottom: '24px', fontSize: '14px', color: '#334155' }}>
              <li style={{ marginBottom: '8px' }}>✅ Custom SaaS & Admin Dashboards</li>
              <li style={{ marginBottom: '8px' }}>✅ Secure REST APIs & Authentication</li>
              <li style={{ marginBottom: '8px' }}>✅ Cloud Database Architecture</li>
            </ul>
          </div>
          <button onClick={() => openInquiry('Custom Web Application')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Get Custom Web App Quote →
          </button>
        </div>

        {/* Service 3: E-Commerce */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>E-Commerce Solutions</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
              Complete online shopping stores with product catalog, shopping cart, Razorpay payment gateway integration, order tracking, and invoice generation.
            </p>
            <ul style={{ listStyle: 'none', marginBottom: '24px', fontSize: '14px', color: '#334155' }}>
              <li style={{ marginBottom: '8px' }}>✅ Razorpay & UPI Payment Gateways</li>
              <li style={{ marginBottom: '8px' }}>✅ Product Inventory & Order Manager</li>
              <li style={{ marginBottom: '8px' }}>✅ Automated GST Bill Invoicing</li>
            </ul>
          </div>
          <button onClick={() => openInquiry('E-Commerce Solutions')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Get E-Commerce Store Quote →
          </button>
        </div>

        {/* Service 4: Digital Marketing */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>Digital Marketing & SEO</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
              Scale your business revenue with targeted digital marketing. Includes Google Search SEO ranking, Google My Business local optimization, and lead campaigns.
            </p>
            <ul style={{ listStyle: 'none', marginBottom: '24px', fontSize: '14px', color: '#334155' }}>
              <li style={{ marginBottom: '8px' }}>✅ Google Search Page #1 SEO Ranking</li>
              <li style={{ marginBottom: '8px' }}>✅ Google My Business Local Setup</li>
              <li style={{ marginBottom: '8px' }}>✅ High ROI Social Media Lead Campaigns</li>
            </ul>
          </div>
          <button onClick={() => openInquiry('Digital Marketing & SEO')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Get Marketing Package Quote →
          </button>
        </div>
      </div>
    </div>
  );
}
