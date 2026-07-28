import React from 'react';

export default function Footer({ setCurrentView, openInquiry }) {
  return (
    <footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '60px 48px 32px 48px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: '48px' }}>
        {/* Col 1 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '18px', color: '#0f172a', marginBottom: '16px' }}>
            <span style={{ fontSize: '22px' }}>🌱</span> Ruractive Technology
          </div>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
            Next-Generation Software, Agri-Tech Solutions & IT Services. Empowering businesses across India with software automation and digital growth.
          </p>
          <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none' }}>
            💬 Chat on WhatsApp
          </a>
        </div>

        {/* Col 2 */}
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '18px', color: '#0f172a' }}>Software Products</h4>
          <ul style={{ listStyle: 'none', fontSize: '14px', color: '#475569' }}>
            <li style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('sathi')}>🌾 SATHI Connector for Tally</li>
            <li style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('products')}>🥛 Dairy Management System</li>
            <li style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('products')}>🏬 Warehouse Management (WMS)</li>
            <li style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('downloads')}>📥 Software Download Center</li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '18px', color: '#0f172a' }}>Digital Services</h4>
          <ul style={{ listStyle: 'none', fontSize: '14px', color: '#475569' }}>
            <li style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('services')}>🌐 Website Designing</li>
            <li style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('services')}>💻 Custom Web Applications</li>
            <li style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('services')}>🛒 E-Commerce Solutions</li>
            <li style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('services')}>🚀 Digital Marketing & SEO</li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '18px', color: '#0f172a' }}>Legal & Company</h4>
          <ul style={{ listStyle: 'none', fontSize: '14px', color: '#475569' }}>
            <li style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('about')}>🏢 About Ruractive</li>
            <li style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('terms')}>📄 Terms & Conditions</li>
            <li style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('privacy')}>🔒 Privacy Policy</li>
            <li style={{ marginBottom: '10px', cursor: 'pointer' }} onClick={() => openInquiry('Contact Us')}>📞 Contact Support</li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
        &copy; 2026 Ruractive Technology. All Rights Reserved. Powered by SATHI & Ruractive Cloud Engine.
      </div>
    </footer>
  );
}
