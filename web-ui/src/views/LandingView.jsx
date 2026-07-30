import React, { useState } from 'react';
import TallySimulator from '../components/TallySimulator';
import FaqSection from '../components/FaqSection';

export default function LandingView({ openInquiry }) {
  const [billingCycle, setBillingCycle] = useState('annual');

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '90px 24px 70px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.3)',
          color: 'var(--primary)', padding: '6px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: 700, marginBottom: '24px'
        }}>
          🚀 Ruractive Technology — SATHI Connector for Tally
        </div>

        <h1 style={{
          fontSize: '56px', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: '20px',
          color: '#0f172a'
        }}>
          Automate Tally Sales & SATHI Portal Synchronization
        </h1>

        <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '36px', maxWidth: '780px', margin: '0 auto 36px auto' }}>
          Bi-directional sync with Tally ERP 9 & Tally Prime. Automatically extract seed sales vouchers, filter non-seed inventory, and sync Farmer & Dealer Registries across all your branches.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={() => openInquiry('SATHI Connector - 3-Day Free Trial')} className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
            ⚡ Request 3-Day Free Trial
          </button>
          <a href="#pricing" className="btn-secondary" style={{ padding: '14px 32px', fontSize: '16px', textDecoration: 'none' }}>
            View Pricing Plans
          </a>
        </div>
      </section>

      {/* Interactive Simulator */}
      <TallySimulator />

      {/* Feature Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 90px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="glass-card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(5, 150, 105, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '24px', marginBottom: '20px', color: 'var(--primary)' }}>⚡</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>Real-Time Tally Sync</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Connects seamlessly to local Tally instances to pull sales vouchers, party details, and stock items in real time.</p>
        </div>

        <div className="glass-card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '24px', marginBottom: '20px', color: 'var(--accent)' }}>👨‍🌾</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>Shared Farmer Registry Hub</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Centralized farmer directory. Automatically uploads new local farmers and downloads shared updates across all your network branches.</p>
        </div>

        <div className="glass-card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(217, 119, 6, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '24px', marginBottom: '20px', color: 'var(--warning)' }}>🏪</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>Shared Dealer Registry Hub</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Centralized dealer master directory. Maintains unified firm details, GSTINs, and contact records across all computers.</p>
        </div>

        <div className="glass-card">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '24px', marginBottom: '20px', color: '#a855f7' }}>🔍</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>Automated Seed Item Filtering</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Smart database filter automatically isolates seed stock items and removes pesticides, fertilizers, and unrelated items.</p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ maxWidth: '1200px', margin: '0 auto 100px auto', padding: '0 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '12px', color: '#0f172a' }}>Simple, Transparent Subscription Pricing</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '32px' }}>Contact our team to get your PC machine activated instantly.</p>

        {/* Toggle */}
        <div style={{ display: 'inline-flex', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '30px', marginBottom: '48px' }}>
          <button 
            onClick={() => setBillingCycle('annual')} 
            style={{ border: 'none', background: billingCycle === 'annual' ? '#059669' : 'transparent', color: billingCycle === 'annual' ? '#fff' : '#475569', padding: '8px 20px', borderRadius: '20px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            Annual Billing (Save 20%)
          </button>
          <button 
            onClick={() => setBillingCycle('monthly')} 
            style={{ border: 'none', background: billingCycle === 'monthly' ? '#059669' : 'transparent', color: billingCycle === 'monthly' ? '#fff' : '#475569', padding: '8px 20px', borderRadius: '20px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            Monthly Billing
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', textAlign: 'left' }}>
          {/* Trial */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>3-Day Free Trial</h3>
              <div style={{ fontSize: '42px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>₹0</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>No credit card required</div>
              <ul style={{ listStyle: 'none', marginBottom: '32px' }}>
                <li style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '10px', color: '#334155' }}>✅ Full Tally Data Extraction</li>
                <li style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '10px', color: '#334155' }}>✅ 1 PC Machine Activation</li>
                <li style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '10px', color: '#334155' }}>✅ Complete Sales Wizards Access</li>
                <li style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '10px', color: '#334155' }}>✅ 72 Hours Unlimited Access</li>
              </ul>
            </div>
            <button onClick={() => openInquiry('SATHI Connector - Free Trial Request')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Request Free Trial
            </button>
          </div>

          {/* Pro */}
          <div className="glass-card" style={{ border: '2px solid var(--primary)', position: 'relative', boxShadow: '0 10px 30px rgba(5, 150, 105, 0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ position: 'absolute', top: '-14px', right: '28px', background: 'var(--primary)', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase' }}>Most Popular</div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>1-Year Annual Pro</h3>
              <div style={{ fontSize: '42px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{billingCycle === 'annual' ? '₹4,999' : '₹499'}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>{billingCycle === 'annual' ? 'Per year / 1 PC Activation' : 'Per month / 1 PC Activation'}</div>
              <ul style={{ listStyle: 'none', marginBottom: '32px' }}>
                <li style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '10px', color: '#334155' }}>✅ Unlimited Tally Sales Sync</li>
                <li style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '10px', color: '#334155' }}>✅ 1 PC Machine Binding</li>
                <li style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '10px', color: '#334155' }}>✅ Central Farmer & Dealer Registry Sync</li>
                <li style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '10px', color: '#334155' }}>✅ 1 Year Updates & Call Support</li>
                <li style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '10px', color: '#334155' }}>✅ Cryptographic 7-Day Offline Access</li>
              </ul>
            </div>
            <button onClick={() => openInquiry('SATHI Connector - Annual Pro Request')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Contact Sales for Pro Key
            </button>
          </div>

          {/* Enterprise */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>Enterprise Multi-PC</h3>
              <div style={{ fontSize: '42px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{billingCycle === 'annual' ? '₹12,999' : '₹1,299'}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Per year / Up to 3 PC Activations</div>
              <ul style={{ listStyle: 'none', marginBottom: '32px' }}>
                <li style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '10px', color: '#334155' }}>✅ Up to 3 PC Machine Activations</li>
                <li style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '10px', color: '#334155' }}>✅ Multi-Branch Central Registry Sync</li>
                <li style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '10px', color: '#334155' }}>✅ Dedicated Priority WhatsApp & Call Support</li>
                <li style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '10px', color: '#334155' }}>✅ Custom Tally Voucher Mapping</li>
              </ul>
            </div>
            <button onClick={() => openInquiry('SATHI Connector - Enterprise Plan')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Get Enterprise Quote
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordions & Trust Stats */}
      <FaqSection />
    </div>
  );
}
