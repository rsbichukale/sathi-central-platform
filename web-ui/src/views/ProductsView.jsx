import React from 'react';

export default function ProductsView({ setCurrentView, openInquiry }) {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '16px', color: '#0f172a' }}>Software Products & Industrial Platforms</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '750px', margin: '0 auto' }}>
          Engineered for reliability, compliance, and effortless daily operations. Explore our flagships below:
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* Product 1: SATHI Connector */}
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(5, 150, 105, 0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>Agri-Tech Compliance</div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '14px', color: '#0f172a' }}>🌾 SATHI Connector for Tally</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '20px', lineHeight: 1.6 }}>
              Direct bi-directional bridge between Tally ERP 9 / Tally Prime and Government SATHI Portal. Automatically filters seed items from sales vouchers and syncs Master Registries across all branch computers.
            </p>
            <ul style={{ listStyle: 'none', marginBottom: '24px' }}>
              <li style={{ fontSize: '14px', marginBottom: '8px' }}>✅ Real-Time Tally Sales Extraction</li>
              <li style={{ fontSize: '14px', marginBottom: '8px' }}>✅ Centralized Farmer & Dealer Registry Sync</li>
              <li style={{ fontSize: '14px', marginBottom: '8px' }}>✅ 7-Day Cryptographic Offline Fallback</li>
            </ul>
            <button onClick={() => setCurrentView('sathi')} className="btn-primary">
              View SATHI Pricing & Trial →
            </button>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌾</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>SATHI Connector v2.4</div>
            <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700, marginTop: '4px' }}>Ready for Tally Prime 4.0+</div>
          </div>
        </div>

        {/* Product 2: Dairy Management */}
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>Dairy Automation</div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '14px', color: '#0f172a' }}>🥛 Dairy Management System</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '20px', lineHeight: 1.6 }}>
              End-to-end milk collection and society billing solution. Connects with Electronic Weighing Scales, Milk Analyzers (FAT/CLR/SNF), and outputs automated farmer payment slips.
            </p>
            <ul style={{ listStyle: 'none', marginBottom: '24px' }}>
              <li style={{ fontSize: '14px', marginBottom: '8px' }}>✅ Auto Analyzer Hardware Interface</li>
              <li style={{ fontSize: '14px', marginBottom: '8px' }}>✅ Shift-wise Milk Collection & Rate Charts</li>
              <li style={{ fontSize: '14px', marginBottom: '8px' }}>✅ Farmer Passbook & Direct Bank Payouts</li>
            </ul>
            <button onClick={() => openInquiry('Dairy Management System')} className="btn-primary">
              Request Dairy Software Demo →
            </button>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🥛</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>DairySmart Suite</div>
            <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginTop: '4px' }}>BMC & Collection Center Ready</div>
          </div>
        </div>

        {/* Product 3: Warehouse WMS */}
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(217, 119, 6, 0.1)', color: 'var(--warning)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>Supply Chain & Logistics</div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '14px', color: '#0f172a' }}>🏬 Warehouse Management System (WMS)</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '20px', lineHeight: 1.6 }}>
              Comprehensive inventory tracking for warehouses, cold storages, and distribution centers. Features barcode scanning, rack location mapping, and batch expiry tracking.
            </p>
            <ul style={{ listStyle: 'none', marginBottom: '24px' }}>
              <li style={{ fontSize: '14px', marginBottom: '8px' }}>✅ Barcode / QR Code Inward & Outward</li>
              <li style={{ fontSize: '14px', marginBottom: '8px' }}>✅ Batch Expiry & Reorder Level Alerts</li>
              <li style={{ fontSize: '14px', marginBottom: '8px' }}>✅ Multi-Warehouse Bin Location Mapping</li>
            </ul>
            <button onClick={() => openInquiry('Warehouse Management (WMS)')} className="btn-primary">
              Request WMS Demo →
            </button>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏬</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Ruractive WMS Cloud</div>
            <div style={{ fontSize: '13px', color: 'var(--warning)', fontWeight: 700, marginTop: '4px' }}>Mobile Barcode Scanner Ready</div>
          </div>
        </div>
      </div>
    </div>
  );
}
