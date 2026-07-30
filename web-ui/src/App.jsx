import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import InquiryModal from './components/InquiryModal';
import CompanyRegistrationModal from './components/CompanyRegistrationModal';

import HomeView from './views/HomeView';
import ProductsView from './views/ProductsView';
import ServicesView from './views/ServicesView';
import DownloadsView from './views/DownloadsView';
import TermsView from './views/TermsView';
import PrivacyView from './views/PrivacyView';
import AboutView from './views/AboutView';
import LandingView from './views/LandingView'; // SATHI Product Page
import AdminView from './views/AdminView';
import ApiDocsView from './views/ApiDocsView';

const pathToViewMap = {
  '/': 'home',
  '/products': 'products',
  '/sathi': 'sathi',
  '/services': 'services',
  '/downloads': 'downloads',
  '/terms': 'terms',
  '/privacy': 'privacy',
  '/about': 'about',
  '/about': 'about',
  '/admin': 'admin',
  '/developers': 'developers'
};

const viewToPathMap = {
  'home': '/',
  'products': '/products',
  'sathi': '/sathi',
  'services': '/services',
  'downloads': '/downloads',
  'terms': '/terms',
  'privacy': '/privacy',
  'about': '/about',
  'about': '/about',
  'admin': '/admin',
  'developers': '/developers'
};

export default function App() {
  const hostname = window.location.hostname.toLowerCase();
  const isAdminSubdomain = hostname.startsWith('admin.');
  const isSubdomain = isAdminSubdomain;

  const getViewFromLocation = () => {
    if (isAdminSubdomain) return 'admin';

    const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    return pathToViewMap[pathname] || 'home';
  };

  const [currentView, setCurrentViewState] = useState(getViewFromLocation);

  const setCurrentView = (view) => {
    if (isAdminSubdomain) { setCurrentViewState('admin'); return; }

    setCurrentViewState(view);
    const targetPath = viewToPathMap[view] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentViewState(getViewFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [toast, setToast] = useState(null);

  // Company Registration Modal State
  const [companyModal, setCompanyModal] = useState(false);

  // Inquiry Modal State
  const [inquiryModal, setInquiryModal] = useState(false);
  const [inquiryService, setInquiryService] = useState('Website Designing');

  // Razorpay Checkout Modal State
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('ANNUAL_PRO');
  const [planTitle, setPlanTitle] = useState('Purchase Annual Pro Key');
  const [firmName, setFirmName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [requestCode, setRequestCode] = useState('');
  const [activationKey, setActivationKey] = useState('');

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openInquiry = (serviceName = 'Website Designing') => {
    setInquiryService(serviceName);
    setInquiryModal(true);
  };

  const openCheckout = (plan, title) => {
    setSelectedPlan(plan);
    setPlanTitle(title);
    setActivationKey('');
    setCheckoutModal(true);
  };

  const loadRazorpayScript = () => {
    return new Promise(resolve => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckoutSubmit = async () => {
    if (!mobileNo.trim()) {
      showToast('Mobile Number is required.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/v1/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firmName, mobileNo, requestCode: requestCode.trim() || undefined, planType: selectedPlan })
      });
      const orderData = await res.json();

      if (!orderData.success) {
        showToast(orderData.error || 'Failed to initiate payment.', 'error');
        return;
      }

      if (orderData.isTrial) {
        const vRes = await fetch('/api/v1/payment/verify-signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planType: selectedPlan, mobileNo, requestCode, firmName })
        });
        const vData = await vRes.json();
        if (vData.success) {
          setActivationKey(vData.activationKey);
          showToast('Free Trial key activated!', 'success');
        }
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded && !window.Razorpay) {
        const vRes = await fetch('/api/v1/payment/verify-signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: 'pay_simulated_' + Math.random().toString(36).slice(2),
            planType: selectedPlan,
            mobileNo,
            requestCode,
            firmName
          })
        });
        const vData = await vRes.json();
        if (vData.success) {
          setActivationKey(vData.activationKey);
          showToast('🎉 Test Payment Verified! Key generated.', 'success');
        }
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Ruractive Technology',
        description: `SATHI Connector License (${selectedPlan})`,
        order_id: orderData.orderId,
        prefill: {
          contact: mobileNo,
          name: firmName || 'Agri Dealer'
        },
        theme: {
          color: '#059669'
        },
        handler: async function (response) {
          const vRes = await fetch('/api/v1/payment/verify-signature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType: selectedPlan,
              mobileNo,
              requestCode,
              firmName
            })
          });
          const vData = await vRes.json();
          if (vData.success) {
            setActivationKey(vData.activationKey);
            showToast('🎉 Payment Successful! Key generated.', 'success');
          } else {
            showToast('Payment verification failed.', 'error');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      showToast('Server connection error.', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          background: toast.type === 'error' ? '#dc2626' : toast.type === 'success' ? '#059669' : '#2563eb',
          color: '#fff', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '14px',
          boxShadow: '0 10px 20px rgba(15, 23, 42, 0.15)', animation: 'fadeIn 0.2s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      {/* Header Navigation - Hidden on dedicated subdomains */}
      {!isSubdomain && (
        <Header currentView={currentView} setCurrentView={setCurrentView} openInquiry={openInquiry} />
      )}

      {/* Multi-Page View Router */}
      <main style={{ flex: 1 }}>
        {currentView === 'home' && <HomeView setCurrentView={setCurrentView} openInquiry={openInquiry} />}
        {currentView === 'products' && <ProductsView setCurrentView={setCurrentView} openInquiry={openInquiry} />}
        {currentView === 'sathi' && <LandingView openInquiry={openInquiry} />}
        {currentView === 'services' && <ServicesView openInquiry={openInquiry} />}
        {currentView === 'downloads' && <DownloadsView showToast={showToast} />}
        {currentView === 'terms' && <TermsView />}
        {currentView === 'privacy' && <PrivacyView />}
        {currentView === 'about' && <AboutView openInquiry={openInquiry} />}
        {currentView === 'admin' && <AdminView showToast={showToast} />}
        {currentView === 'developers' && <ApiDocsView />}
      </main>


      {/* Inquiry Modal */}
      {inquiryModal && (
        <InquiryModal defaultService={inquiryService} onClose={() => setInquiryModal(false)} showToast={showToast} />
      )}

      {/* Razorpay Checkout Modal */}
      {checkoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '480px', maxWidth: '90%', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{planTitle}</h3>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '24px', cursor: 'pointer' }} onClick={() => setCheckoutModal(false)}>&times;</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Enter your firm details and Machine Request Code to generate your key via Razorpay.</p>

            <input type="text" className="modern-input" placeholder="Firm / Company Name" value={firmName} onChange={e => setFirmName(e.target.value)} style={{ marginBottom: '12px' }} />
            <input type="text" className="modern-input" placeholder="10-Digit Mobile Number" value={mobileNo} onChange={e => setMobileNo(e.target.value)} style={{ marginBottom: '12px' }} />
            <input type="text" className="modern-input" placeholder="Machine Request Code (optional — auto-generated)" value={requestCode} onChange={e => setRequestCode(e.target.value)} style={{ fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }} />

            {activationKey && (
              <div style={{ background: 'rgba(5, 150, 105, 0.1)', border: '1px solid var(--primary)', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>Your Activation Key</div>
                <div style={{ fontFamily: 'monospace', fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{activationKey}</div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Copy & paste this key into your Desktop App!</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setCheckoutModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCheckoutSubmit}>Pay with Razorpay 💳</button>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer - Hidden on dedicated subdomains */}
      {!isSubdomain && (
        <Footer setCurrentView={setCurrentView} openInquiry={openInquiry} />
      )}
    </div>
  );
}
