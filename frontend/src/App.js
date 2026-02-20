import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
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
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminCustomerOrdersPage from './pages/AdminCustomerOrdersPage';
import ShopPage from './pages/ShopPage';
import CartPage from './pages/CartPage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import CatalogPage from './pages/CatalogPage';
import CustomerCartPage from './pages/CustomerCartPage';
import CustomerCheckoutPage from './pages/CustomerCheckoutPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import CustomerAuthCallback from './components/CustomerAuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import WhatsAppButton from './components/WhatsAppButton';
import WelcomeScreen from './components/WelcomeScreen';

// Router component to handle auth callback detection
function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id (Google OAuth callback)
  // This check runs synchronously during render to prevent race conditions
  if (location.hash?.includes('session_id=') && location.pathname === '/auth/callback') {
    return <CustomerAuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/product/:productId" element={<ProductDetailPage />} />
      <Route path="/shop" element={<Navigate to="/products" replace />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/smart-homes" element={<SmartHomesPage />} />
      <Route path="/smart-commercial" element={<SmartCommercialPage />} />
      <Route path="/smart-hospitality" element={<SmartHospitalityPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      
      {/* Customer Routes */}
      <Route path="/customer/login" element={<CustomerLoginPage />} />
      <Route path="/auth/callback" element={<CustomerAuthCallback />} />
      <Route path="/catalog" element={<Navigate to="/products" replace />} />
      <Route path="/customer/cart" element={<CustomerCartPage />} />
      <Route path="/customer/checkout" element={<CustomerCheckoutPage />} />
      <Route path="/customer/orders" element={<CustomerOrdersPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<Navigate to="/admin/quotations" replace />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/contacts" element={<ProtectedRoute><AdminContactsPage /></ProtectedRoute>} />
      <Route path="/admin/quotations" element={<ProtectedRoute><AdminQuotationsPage /></ProtectedRoute>} />
      <Route path="/admin/quotations/new" element={<ProtectedRoute><AdminCreateQuotationPage /></ProtectedRoute>} />
      <Route path="/admin/quotations/edit/:id" element={<ProtectedRoute><AdminCreateQuotationPage /></ProtectedRoute>} />
      <Route path="/admin/invoices" element={<ProtectedRoute><AdminInvoicesPage /></ProtectedRoute>} />
      <Route path="/admin/invoices/new" element={<ProtectedRoute><AdminCreateInvoicePage /></ProtectedRoute>} />
      <Route path="/admin/invoices/edit/:id" element={<ProtectedRoute><AdminCreateInvoicePage /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute><AdminOrdersPage /></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomersPage /></ProtectedRoute>} />
      <Route path="/admin/customer-orders" element={<ProtectedRoute><AdminCustomerOrdersPage /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute><AdminProductsPage /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><AdminSettingsPage /></ProtectedRoute>} />
    </Routes>
  );
}

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
        <CustomerAuthProvider>
          <CartProvider>
            <AppRouter />
            <Toaster />
            <WhatsAppButton />
          </CartProvider>
        </CustomerAuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
