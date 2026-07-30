import React from 'react';

export default function Header({ currentView, setCurrentView, openInquiry }) {
  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '12px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
      gap: '16px'
    }}>
      {/* Brand Logo & Name */}
      <div 
        onClick={() => setCurrentView('home')} 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
      >
        <div style={{
          width: '38px', height: '38px',
          background: 'linear-gradient(135deg, #059669, #2563eb)',
          borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
          boxShadow: '0 4px 10px rgba(5, 150, 105, 0.25)', color: '#fff'
        }}>
          🌱
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', lineHeight: 1.1 }}>Ruractive</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.5px' }}>TECHNOLOGY</span>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '4px', 
        background: '#f8fafc', 
        padding: '4px', 
        borderRadius: '12px', 
        border: '1px solid #e2e8f0'
      }}>
        <button 
          onClick={() => setCurrentView('home')}
          style={{
            border: 'none',
            background: currentView === 'home' ? '#059669' : 'transparent',
            color: currentView === 'home' ? '#ffffff' : '#475569',
            padding: '7px 12px',
            fontSize: '13px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          Home
        </button>
        <button 
          onClick={() => setCurrentView('products')}
          style={{
            border: 'none',
            background: currentView === 'products' ? '#059669' : 'transparent',
            color: currentView === 'products' ? '#ffffff' : '#475569',
            padding: '7px 12px',
            fontSize: '13px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          Products
        </button>
        <button 
          onClick={() => setCurrentView('sathi')}
          style={{
            border: 'none',
            background: currentView === 'sathi' ? '#059669' : 'transparent',
            color: currentView === 'sathi' ? '#ffffff' : '#475569',
            padding: '7px 12px',
            fontSize: '13px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          🌾 SATHI Connector
        </button>
        <button 
          onClick={() => setCurrentView('services')}
          style={{
            border: 'none',
            background: currentView === 'services' ? '#059669' : 'transparent',
            color: currentView === 'services' ? '#ffffff' : '#475569',
            padding: '7px 12px',
            fontSize: '13px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          🚀 Digital Services
        </button>
        <button 
          onClick={() => setCurrentView('downloads')}
          style={{
            border: 'none',
            background: currentView === 'downloads' ? '#059669' : 'transparent',
            color: currentView === 'downloads' ? '#ffffff' : '#475569',
            padding: '7px 12px',
            fontSize: '13px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          📥 Downloads
        </button>
        <button 
          onClick={() => setCurrentView('about')}
          style={{
            border: 'none',
            background: currentView === 'about' ? '#059669' : 'transparent',
            color: currentView === 'about' ? '#ffffff' : '#475569',
            padding: '7px 12px',
            fontSize: '13px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          About Us
        </button>
        <button 
          onClick={() => setCurrentView('developers')}
          style={{
            border: 'none',
            background: currentView === 'developers' ? '#059669' : 'transparent',
            color: currentView === 'developers' ? '#ffffff' : '#475569',
            padding: '7px 12px',
            fontSize: '13px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          👨‍💻 API Docs
        </button>
      </nav>

      {/* Action Options */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
        <button 

          onClick={() => openInquiry('Custom IT Project / Inquiry')} 
          style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
            border: 'none',
            color: '#ffffff',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
            transition: 'all 0.15s ease'
          }}
        >
          💬 Get Free Quote
        </button>
      </div>
    </header>
  );
}
