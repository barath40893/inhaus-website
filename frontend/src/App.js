import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProductsPage from './pages/ProductsPage';
import SmartHomesPage from './pages/SmartHomesPage';
import SmartCommercialPage from './pages/SmartCommercialPage';
import SmartHospitalityPage from './pages/SmartHospitalityPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminContactsPage from './pages/AdminContactsPage';
import AdminQuotationsPage from './pages/AdminQuotationsPage';
import AdminCreateQuotationPage from './pages/AdminCreateQuotationPage';
import AdminInvoicesPage from './pages/AdminInvoicesPage';
import AdminCreateInvoicePage from './pages/AdminCreateInvoicePage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import { Toaster } from './components/ui/toaster';
import WhatsAppButton from './components/WhatsAppButton';
import WelcomeScreen from './components/WelcomeScreen';

function App() {
  const [showWelcome, setShowWelcome] = React.useState(true);
  const [isWelcomeComplete, setIsWelcomeComplete] = React.useState(false);

  React.useEffect(() => {
    // Check if welcome screen has been shown in this session
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setShowWelcome(false);
      setIsWelcomeComplete(true);
    }
  }, []);

  const handleWelcomeComplete = () => {
    sessionStorage.setItem('hasSeenWelcome', 'true');
    setIsWelcomeComplete(true);
  };

  return (
    <div className="App">
      {showWelcome && !isWelcomeComplete && (
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      )}
      <BrowserRouter>
        <CartProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/smart-homes" element={<SmartHomesPage />} />
            <Route path="/smart-commercial" element={<SmartCommercialPage />} />
            <Route path="/smart-hospitality" element={<SmartHospitalityPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/contacts" element={<AdminContactsPage />} />
          </Routes>
          <Toaster />
          <WhatsAppButton />
        </CartProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
