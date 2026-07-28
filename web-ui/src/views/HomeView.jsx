import React from 'react';

export default function HomeView({ setCurrentView, openInquiry }) {
  return (
    <div className="animate-fade-in">
      {/* Corporate Hero Section */}
      <section style={{ textAlign: 'center', padding: '100px 24px 80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.3)',
          color: 'var(--primary)', padding: '6px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: 700, marginBottom: '24px'
        }}>
          🚀 Next-Gen Software, Agri-Tech & IT Solutions
        </div>

        <h1 style={{
          fontSize: '56px', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: '20px',
          color: '#0f172a'
        }}>
          Empowering Enterprises & Agriculture with Modern Software
        </h1>

        <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '36px', maxWidth: '820px', margin: '0 auto 36px auto' }}>
          From Agri-Tech Tally automation and Dairy Management systems to enterprise Web Applications, E-Commerce, and Digital Marketing — Ruractive Technology delivers end-to-end digital excellence.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setCurrentView('sathi')} className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
            🌾 Explore SATHI Connector
          </button>
          <button onClick={() => setCurrentView('products')} className="btn-secondary" style={{ padding: '14px 32px', fontSize: '16px' }}>
            📦 View All Products
          </button>
        </div>
      </section>

      {/* Corporate Products & Services Showcase Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 100px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>Our Core Products & Digital Services</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Customized technology solutions tailored for business automation & revenue growth.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {/* Card 1: SATHI Connector */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>🌾</div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>SATHI Connector for Tally</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Bi-directional sync between Tally ERP 9 / Tally Prime and Government SATHI Portal. Automated seed item filtering and Master Registry sync.
              </p>
            </div>
            <button onClick={() => setCurrentView('sathi')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Explore SATHI Software →
            </button>
          </div>

          {/* Card 2: Dairy Management */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>🥛</div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>Dairy Management System</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Complete milk collection software with FAT/SNF testing, automatic farmer rate chart billing, BMC tracking, and SMS alerts.
              </p>
            </div>
            <button onClick={() => openInquiry('Dairy Management System')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Request Dairy Demo →
            </button>
          </div>

          {/* Card 3: Warehouse Management */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>🏬</div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>Warehouse Management (WMS)</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Barcode stock scanning, real-time inventory tracking, batch expiry management, and automated dispatch logistics.
              </p>
            </div>
            <button onClick={() => openInquiry('Warehouse Management (WMS)')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Request WMS Demo →
            </button>
          </div>

          {/* Card 4: Website Designing */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>🌐</div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>Website Designing & UI/UX</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Stunning, ultra-fast corporate websites, landing pages, and responsive UI/UX designs built to convert visitors into clients.
              </p>
            </div>
            <button onClick={() => setCurrentView('services')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              View Web Packages →
            </button>
          </div>

          {/* Card 5: Web Applications & SaaS */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>💻</div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>Custom Web Applications</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Scalable Node.js, React, and cloud-native web apps, custom admin dashboards, REST APIs, and database architecture.
              </p>
            </div>
            <button onClick={() => openInquiry('Custom Web Application')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Get Custom App Quote →
            </button>
          </div>

          {/* Card 6: Digital Marketing */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>🚀</div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>Digital Marketing & SEO</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Google Search SEO ranking, Google My Business optimization, social media marketing, and targeted lead generation campaigns.
              </p>
            </div>
            <button onClick={() => setCurrentView('services')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Explore Marketing →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
