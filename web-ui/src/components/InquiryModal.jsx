import React, { useState } from 'react';

export default function InquiryModal({ defaultService, onClose, showToast }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState(defaultService || 'Website Designing');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !mobile.trim()) {
      showToast('Name and Mobile number are required.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/inquiry/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, email, service, message })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        onClose();
      } else {
        showToast(data.error || 'Failed to submit inquiry.', 'error');
      }
    } catch (e) {
      showToast('Server connection error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div className="glass-card animate-fade-in" style={{ width: '480px', maxWidth: '90%', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>💬 Get Free Quote / Request Demo</h3>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '24px', cursor: 'pointer' }} onClick={onClose}>&times;</button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Fill out your requirements and Ruractive Technology experts will contact you within 2 hours.</p>

        <input type="text" className="modern-input" placeholder="Your Full Name *" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: '12px' }} />
        <input type="text" className="modern-input" placeholder="10-Digit Mobile Number *" value={mobile} onChange={e => setMobile(e.target.value)} style={{ marginBottom: '12px' }} />
        <input type="email" className="modern-input" placeholder="Email Address (Optional)" value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: '12px' }} />

        <select className="modern-input" value={service} onChange={e => setService(e.target.value)} style={{ marginBottom: '12px' }}>
          <option value="Website Designing">🌐 Website Designing</option>
          <option value="Custom Web Application">💻 Custom Web Application</option>
          <option value="E-Commerce Solutions">🛒 E-Commerce Solutions</option>
          <option value="Digital Marketing & SEO">🚀 Digital Marketing & SEO</option>
          <option value="Dairy Management System">🥛 Dairy Management System</option>
          <option value="Warehouse Management (WMS)">🏬 Warehouse Management (WMS)</option>
          <option value="SATHI Connector for Tally">🌾 SATHI Connector for Tally</option>
        </select>

        <textarea className="modern-input" placeholder="Briefly describe your requirements or project details..." value={message} onChange={e => setMessage(e.target.value)} style={{ height: '90px', marginBottom: '20px', resize: 'none' }} />

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Inquiry 🎉'}
          </button>
        </div>
      </div>
    </div>
  );
}
