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
  '/admin': 'admin'
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
  'admin': '/admin'
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



  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openInquiry = (serviceName = 'Website Designing') => {
    setInquiryService(serviceName);
    setInquiryModal(true);
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
              </main>


      {/* Inquiry Modal */}
      {inquiryModal && (
        <InquiryModal defaultService={inquiryService} onClose={() => setInquiryModal(false)} showToast={showToast} />
      )}



      {/* Global Footer - Hidden on dedicated subdomains */}
      {!isSubdomain && (
        <Footer setCurrentView={setCurrentView} openInquiry={openInquiry} />
      )}
    </div>
  );
}
