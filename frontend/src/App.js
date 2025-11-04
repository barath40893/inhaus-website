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
import { Toaster } from './components/ui/toaster';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <div className="App">
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
          </Routes>
          <Toaster />
          <WhatsAppButton />
        </CartProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
